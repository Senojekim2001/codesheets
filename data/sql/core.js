export const meta = {
  "title": "SQL Complete Reference",
  "domain": "sql",
  "sheet": "core",
  "icon": "🗄️"
}

export const sections = [

  // ── Section 1: Queries & Filtering ─────────────────────────────────────────
  {
    id: "queries-filtering",
    title: "Queries & Filtering",
    entries: [
      {
        id: "select",
        fn: "SELECT",
        desc: "Retrieve columns from a table.",
        category: "Core",
        subtitle: "Retrieve columns from a table",
        signature: "SELECT col1, col2 FROM table;",
        descLong: "SELECT is the foundation of every SQL query. It specifies which columns to return. Column aliases, computed columns, and DISTINCT all live here.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SELECT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Specific columns\nSELECT first_name, last_name, salary\nFROM employees;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SELECT — common patterns you'll see in production.\n-- APPROACH  - Combine SELECT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- With alias\nSELECT first_name AS name,\n       salary * 12 AS annual_salary\nFROM employees;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SELECT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Distinct values only,SELECT DISTINCT department FROM employees;,\n\n-- Computed column,SELECT name, price * quantity AS total_value,FROM order_items;"
                  }
        ],
        tips: [
                  "**Always** name columns explicitly in production — SELECT * breaks when schema changes",
                  "Use aliases (AS) to make output readable and name computed columns",
                  "SELECT DISTINCT has a performance cost — it sorts the full result set",
                  "Column aliases in SELECT cannot be used in WHERE (processed before SELECT)"
        ],
        mistake: "Using SELECT * in production. When columns are added/reordered, SELECT * silently changes your result set.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "where",
        fn: "WHERE",
        desc: "Filter rows by condition.",
        category: "Core",
        subtitle: "Filter rows based on a condition",
        signature: "SELECT ... FROM table WHERE condition;",
        descLong: "WHERE filters which rows are returned before SELECT is applied. NULL comparisons require IS NULL / IS NOT NULL — = NULL always returns false.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of WHERE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSELECT * FROM employees\nWHERE department = 'Engineering';"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of WHERE — common patterns you'll see in production.\n-- APPROACH  - Combine WHERE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Range\nSELECT * FROM products\nWHERE price BETWEEN 10 AND 50;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of WHERE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- List membership,SELECT * FROM employees,WHERE department IN ('Sales', 'Marketing');,\n\n-- NULL check,SELECT * FROM employees,WHERE manager_id IS NULL;"
                  }
        ],
        tips: [
                  "NULL = NULL is always false — use IS NULL / IS NOT NULL",
                  "BETWEEN is inclusive on both ends",
                  "AND has higher precedence than OR — use parentheses to be explicit",
                  "Sargable predicates (WHERE indexed_col = val) use indexes; WHERE YEAR(date) = 2024 does not"
        ],
        mistake: "WHERE col = NULL never matches anything. Use WHERE col IS NULL instead.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "order-by",
        fn: "ORDER BY",
        desc: "Sort result set by column(s).",
        category: "Core",
        subtitle: "Sort results by one or more columns",
        signature: "SELECT ... ORDER BY col [ASC|DESC];",
        descLong: "ORDER BY sorts the final result set. Default is ASC. Multiple columns act as tiebreakers. NULLs sort first in PostgreSQL, last in MySQL.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ORDER BY — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Descending\nSELECT * FROM employees ORDER BY salary DESC;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ORDER BY — common patterns you'll see in production.\n-- APPROACH  - Combine ORDER BY with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Multiple columns\nSELECT name, department, salary\nFROM employees\nORDER BY salary DESC, name ASC;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ORDER BY — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- By alias,SELECT name, salary * 12 AS annual,FROM employees ORDER BY annual DESC;,\n\n-- NULLs last (PostgreSQL),SELECT * FROM tasks ORDER BY due_date ASC NULLS LAST;"
                  }
        ],
        tips: [
                  "ORDER BY is the ONLY guarantee of result order — never assume rows come back in insert order",
                  "ORDER BY column position (ORDER BY 2) is fragile — breaks if SELECT columns change",
                  "NULLS FIRST / NULLS LAST controls null placement (PostgreSQL, Oracle)"
        ],
        mistake: "Assuming rows return in a predictable order without ORDER BY. SQL tables have no inherent order.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "limit",
        fn: "LIMIT / OFFSET",
        desc: "Restrict rows returned; paginate results.",
        category: "Core",
        subtitle: "Restrict number of rows; skip rows for pagination",
        signature: "SELECT ... LIMIT n OFFSET m;",
        descLong: "LIMIT restricts how many rows are returned. OFFSET skips the first n rows. Always pair with ORDER BY or results are arbitrary.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LIMIT / OFFSET — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- First 10 rows\nSELECT * FROM products ORDER BY created_at DESC LIMIT 10;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LIMIT / OFFSET — common patterns you'll see in production.\n-- APPROACH  - Combine LIMIT / OFFSET with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Offset pagination: page 3, 10 per page\nSELECT id, name, price FROM products\nORDER BY id LIMIT 10 OFFSET 20;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LIMIT / OFFSET — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Keyset pagination (faster at scale, fetch next 10 after cursor 42),SELECT id, name, price FROM products,WHERE id > 42,ORDER BY id LIMIT 10;,\n\n-- SQL Server syntax,SELECT * FROM products ORDER BY id,OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;"
                  }
        ],
        tips: [
                  "Always pair LIMIT with ORDER BY — without it results are arbitrary",
                  "OFFSET pagination degrades at large offsets — consider keyset pagination for scale",
                  "Keyset pagination: WHERE id > last_id is more efficient than OFFSET at 100K+ rows"
        ],
        mistake: "Using LIMIT without ORDER BY. The \"first\" rows without an order clause are arbitrary.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "like",
        fn: "LIKE / ILIKE",
        desc: "Match string patterns with wildcards.",
        category: "Core",
        subtitle: "Pattern matching on string columns",
        signature: "col LIKE 'pattern'  -- % = any chars, _ = one char",
        descLong: "LIKE matches using % (any chars) and _ (one char). ILIKE is case-insensitive (PostgreSQL). Leading wildcards prevent index use.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LIKE / ILIKE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Starts with (CAN use index)\nSELECT * FROM products WHERE sku LIKE 'PROD-%';"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LIKE / ILIKE — common patterns you'll see in production.\n-- APPROACH  - Combine LIKE / ILIKE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Ends with (full scan — leading %)\nSELECT * FROM users WHERE email LIKE '%@gmail.com';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LIKE / ILIKE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Single-character wildcard,SELECT * FROM logs,WHERE error_code LIKE 'E4__';  -- E400, E401, E499 etc.,\n\n-- Case-insensitive (PostgreSQL ILIKE),SELECT * FROM users WHERE name ILIKE 'john%';,\n\n-- Portable case-insensitive,SELECT * FROM users,WHERE LOWER(name) LIKE LOWER('John%');,\n\n-- Escape literal % or _ in data,SELECT * FROM discounts,WHERE code LIKE '20\\%%' ESCAPE '\\\\';  -- matches \"20%OFF\""
                  }
        ],
        tips: [
                  "'%text%' forces a full table scan — use full-text search for content searching",
                  "'text%' CAN use an index — only leading % kills it",
                  "ILIKE is PostgreSQL-only — use LOWER(col) LIKE LOWER(pattern) for portability"
        ],
        mistake: "LIKE '%value%' on large unindexed tables forces a full table scan.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "case-when",
        fn: "CASE WHEN",
        desc: "Inline conditional logic in a query.",
        category: "Core",
        subtitle: "Conditional if/else logic inside SQL",
        signature: "CASE WHEN cond THEN val ... ELSE val END",
        descLong: "CASE WHEN provides if/else logic inside SQL. Use in SELECT for derived columns, ORDER BY for custom sort, or inside aggregates for pivoting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CASE WHEN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSELECT name, salary,\n  CASE\n    WHEN salary >= 150000 THEN 'Senior'\n    WHEN salary >= 80000  THEN 'Mid'\n    ELSE 'Junior'\n  END AS level\nFROM employees;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CASE WHEN — common patterns you'll see in production.\n-- APPROACH  - Combine CASE WHEN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Conditional aggregation (pivot)\nSELECT department,"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CASE WHEN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nCOUNT(CASE WHEN gender='F' THEN 1 END) AS female,\n  COUNT(CASE WHEN gender='M' THEN 1 END) AS male\nFROM employees GROUP BY department;"
                  }
        ],
        tips: [
                  "CASE without ELSE returns NULL for unmatched rows — add ELSE defensively",
                  "Conditional aggregation with CASE inside COUNT/SUM is a powerful pivot pattern",
                  "CASE is evaluated top-to-bottom — put most specific conditions first"
        ],
        mistake: "Forgetting ELSE in CASE — unmatched rows return NULL, silently corrupting aggregations.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "count",
        fn: "COUNT()",
        desc: "Count rows or non-null values.",
        category: "Aggregates",
        subtitle: "Count rows or non-null values",
        signature: "COUNT(*) | COUNT(col) | COUNT(DISTINCT col)",
        descLong: "COUNT(*) counts all rows. COUNT(col) counts non-NULL values only. COUNT(DISTINCT col) counts unique non-NULL values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of COUNT() — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Total rows\nSELECT COUNT(*) AS total_employees FROM employees;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of COUNT() — common patterns you'll see in production.\n-- APPROACH  - Combine COUNT() with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Non-null values only\nSELECT COUNT(manager_id) AS employees_with_manager FROM employees;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of COUNT() — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Conditional count: active users only,SELECT COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_count,FROM employees;,\n\n-- Count distinct,SELECT COUNT(DISTINCT department) AS num_departments,FROM employees;,\n\n-- COUNT with FILTER (PostgreSQL 9.4+),SELECT,  COUNT(*) AS total,,  COUNT(*) FILTER (WHERE status = 'active') AS active,,  COUNT(*) FILTER (WHERE salary > 80000) AS high_earners,FROM employees;"
                  }
        ],
        tips: [
                  "COUNT(*) is usually faster than COUNT(col)",
                  "COUNT(col) silently ignores NULLs",
                  "COUNT(DISTINCT col) is expensive on large tables",
                  "FILTER clause is cleaner than CASE for conditional counting (PostgreSQL, SQL Server)"
        ],
        mistake: "Using COUNT(col) when you mean COUNT(*). If the column has NULLs, COUNT(col) will be less than the actual row count.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "sum-avg",
        fn: "SUM() / AVG()",
        desc: "Total and average numeric values.",
        category: "Aggregates",
        subtitle: "Total and average of numeric columns",
        signature: "SUM(col)  |  AVG(col)",
        descLong: "SUM totals non-NULL values. AVG computes the mean. Both ignore NULLs — use COALESCE(col, 0) if NULLs should count as zero.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SUM() / AVG() — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Basic totals\nSELECT SUM(amount) AS total_revenue FROM orders;\nSELECT department, AVG(salary) AS avg_salary\nFROM employees GROUP BY department;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SUM() / AVG() — common patterns you'll see in production.\n-- APPROACH  - Combine SUM() / AVG() with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Weighted average: average rating weighted by review count\nSELECT SUM(rating * review_count) / SUM(review_count) AS weighted_avg_rating\nFROM product_ratings;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SUM() / AVG() — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Running total: cumulative revenue by date,SELECT order_date,,  SUM(amount) AS daily_revenue,,  SUM(SUM(amount)) OVER (ORDER BY order_date) AS cumulative,FROM orders GROUP BY order_date;,\n\n-- Conditional sum with NULLs,SELECT,  SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) AS completed_revenue,,  SUM(COALESCE(bonus, 0)) AS total_bonus,FROM orders, employees;"
                  }
        ],
        tips: [
                  "Both ignore NULLs — use COALESCE(col, 0) if NULLs should be zero",
                  "Weighted average: SUM(value * weight) / SUM(weight) for realistic data",
                  "Window functions like SUM() OVER enable running totals and cumulative calculations"
        ],
        mistake: "Expecting AVG to include NULL rows. AVG = SUM / COUNT — both exclude NULLs.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "group-by",
        fn: "GROUP BY",
        desc: "Group rows and apply aggregate functions.",
        category: "Aggregates",
        subtitle: "Collapse rows into groups; aggregate each",
        signature: "SELECT col, AGG(col) FROM t GROUP BY col;",
        descLong: "GROUP BY collapses rows sharing the same value(s) into a single output row. Every non-aggregate SELECT column must appear in GROUP BY.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of GROUP BY — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSELECT department, COUNT(*) AS headcount\nFROM employees GROUP BY department;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of GROUP BY — common patterns you'll see in production.\n-- APPROACH  - Combine GROUP BY with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Multiple grouping columns\nSELECT department, job_title, AVG(salary)\nFROM employees GROUP BY department, job_title;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of GROUP BY — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Group by expression,SELECT DATE(created_at) AS day, COUNT(*) AS signups,FROM users GROUP BY DATE(created_at) ORDER BY day;,\n\n-- With HAVING,SELECT department, COUNT(*) AS headcount,FROM employees GROUP BY department HAVING COUNT(*) > 10;"
                  }
        ],
        tips: [
                  "Every non-aggregate SELECT column must be in GROUP BY",
                  "HAVING filters groups; WHERE filters rows BEFORE grouping",
                  "NULL values all group together in GROUP BY"
        ],
        mistake: "WHERE COUNT(*) > 5 — you cannot filter on aggregates in WHERE. Use HAVING.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "having",
        fn: "HAVING",
        desc: "Filter groups after GROUP BY.",
        category: "Aggregates",
        subtitle: "Filter groups — like WHERE but for aggregates",
        signature: "GROUP BY col HAVING aggregate_condition;",
        descLong: "HAVING filters GROUP BY results after aggregation. WHERE cannot reference aggregates because it runs before grouping.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of HAVING — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Basic: filter groups by count\nSELECT department, COUNT(*) AS headcount\nFROM employees GROUP BY department HAVING COUNT(*) > 10;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of HAVING — common patterns you'll see in production.\n-- APPROACH  - Combine HAVING with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- WHERE + HAVING together (efficient: filter rows, then groups)\nSELECT department, COUNT(*) AS active_count, AVG(salary) AS avg_sal\nFROM employees\nWHERE status = 'active'        -- row filter (before grouping)\nGROUP BY department\nHAVING COUNT(*) >= 5           -- group filter (after grouping)\n  AND AVG(salary) > 75000;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of HAVING — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Real case: products with high average rating,SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS review_count,FROM reviews,GROUP BY product_id,HAVING AVG(rating) >= 4.5 AND COUNT(*) >= 20,ORDER BY avg_rating DESC;"
                  }
        ],
        tips: [
                  "WHERE = before grouping; HAVING = after grouping",
                  "Put non-aggregate conditions in WHERE — it is more efficient",
                  "You can use both WHERE and HAVING in the same query",
                  "HAVING with multiple aggregate conditions filters effectively"
        ],
        mistake: "Using HAVING for non-aggregate conditions. Push those to WHERE to reduce the data GROUP BY processes.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
    ],
  },

  // ── Section 2: Joins & Subqueries ─────────────────────────────────────────
  {
    id: "joins-subqueries",
    title: "Joins & Subqueries",
    entries: [
      {
        id: "inner-join",
        fn: "INNER JOIN",
        desc: "Rows matching in both tables only.",
        category: "Joins",
        subtitle: "Return only rows that match in both tables",
        signature: "SELECT ... FROM a INNER JOIN b ON a.id = b.a_id",
        descLong: "INNER JOIN returns only rows where the join condition is met in both tables. Non-matching rows are excluded. It is the default JOIN.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of INNER JOIN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSELECT e.name, d.name AS department\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.id;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of INNER JOIN — common patterns you'll see in production.\n-- APPROACH  - Combine INNER JOIN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Three-table join\nSELECT o.id, c.name, p.name AS product\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON oi.product_id = p.id;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of INNER JOIN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Self join,SELECT e.name AS employee, m.name AS manager,FROM employees e,JOIN employees m ON e.manager_id = m.id;"
                  }
        ],
        tips: [
                  "INNER JOIN and JOIN are identical — INNER is just explicit",
                  "Rows with NULL in the join column are always excluded",
                  "If your result is missing rows, consider LEFT JOIN"
        ],
        mistake: "Expecting NULL-keyed rows to appear. Rows where the join column is NULL are always excluded from INNER JOIN.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "left-join",
        fn: "LEFT JOIN",
        desc: "All left rows; matched right rows or NULL.",
        category: "Joins",
        subtitle: "All rows from left table; NULL if no match",
        signature: "SELECT ... FROM a LEFT JOIN b ON a.id = b.a_id",
        descLong: "LEFT JOIN returns all rows from the left table. Unmatched right-side columns are NULL. Use it for optional relationships and finding missing data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LEFT JOIN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- All employees, dept if assigned (NULL if not)\nSELECT e.name, d.name AS department\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.id;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LEFT JOIN — common patterns you'll see in production.\n-- APPROACH  - Combine LEFT JOIN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Anti-join: employees with NO department\nSELECT e.name FROM employees e\nLEFT JOIN departments d ON e.department_id = d.id\nWHERE d.id IS NULL;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LEFT JOIN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 0-order customers,SELECT c.name, COUNT(o.id) AS order_count,FROM customers c,LEFT JOIN orders o ON o.customer_id = c.id,GROUP BY c.id, c.name;"
                  }
        ],
        tips: [
                  "LEFT JOIN is your default when the relationship is optional",
                  "WHERE right_table.col IS NULL after LEFT JOIN = rows in A but not B",
                  "COUNT(o.id) returns 0 for non-matching rows; COUNT(*) would return 1"
        ],
        mistake: "Putting a WHERE condition on a right-side column after LEFT JOIN converts it to an INNER JOIN. Put the condition in the ON clause instead.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "full-outer",
        fn: "FULL OUTER JOIN",
        desc: "All rows from both tables; NULLs where unmatched.",
        category: "Joins",
        subtitle: "All rows from both tables",
        signature: "SELECT ... FROM a FULL OUTER JOIN b ON a.id = b.a_id",
        descLong: "FULL OUTER JOIN returns all rows from both tables. Unmatched left-side columns are NULL, and unmatched right-side columns are NULL. MySQL does not support it natively.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of FULL OUTER JOIN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Basic: all employees and departments\nSELECT e.id, e.name, d.id, d.name AS department\nFROM employees e\nFULL OUTER JOIN departments d ON e.department_id = d.id;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of FULL OUTER JOIN — common patterns you'll see in production.\n-- APPROACH  - Combine FULL OUTER JOIN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Data reconciliation: find missing mappings\nSELECT\n  COALESCE(e.id, d.id) AS id,\n  e.name AS employee_name, d.name AS dept_name,\n  CASE WHEN e.id IS NULL THEN 'Orphan department'\n       WHEN d.id IS NULL THEN 'Unassigned employee'\n       ELSE 'Matched'\n  END AS status\nFROM employees e\nFULL OUTER JOIN departments d ON e.department_id = d.id\nWHERE e.id IS NULL OR d.id IS NULL;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of FULL OUTER JOIN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- MySQL workaround using UNION ALL,SELECT e.id, e.name, d.name FROM employees e,LEFT JOIN departments d ON e.department_id = d.id,UNION ALL,SELECT NULL, NULL, d.name FROM departments d,WHERE NOT EXISTS (SELECT 1 FROM employees WHERE department_id = d.id);"
                  }
        ],
        tips: [
                  "MySQL does NOT support FULL OUTER JOIN — use LEFT JOIN UNION ALL pattern",
                  "Great for data reconciliation: finding rows in A not B, B not A, and mismatches",
                  "Use COALESCE and CASE to track which table the row came from"
        ],
        mistake: "Expecting FULL OUTER JOIN to work in MySQL — it does not. Use the LEFT UNION ALL RIGHT pattern.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "cross-join",
        fn: "CROSS JOIN",
        desc: "Every combination of rows from both tables.",
        category: "Joins",
        subtitle: "Cartesian product of two tables",
        signature: "SELECT ... FROM a CROSS JOIN b",
        descLong: "CROSS JOIN produces every possible row combination. If A has 10 rows and B has 5, the result has 50 rows. Intentional when you need all combinations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CROSS JOIN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- All size × color combinations (inventory matrix)\nSELECT s.size, c.color, COALESCE(i.stock, 0) AS in_stock\nFROM sizes s\nCROSS JOIN colors c\nLEFT JOIN inventory i ON i.size = s.size AND i.color = c.color;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CROSS JOIN — common patterns you'll see in production.\n-- APPROACH  - Combine CROSS JOIN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Date × product matrix: check gaps\nSELECT d.order_date, p.product_id,\n  COALESCE(SUM(o.quantity), 0) AS sold\nFROM (SELECT DISTINCT order_date FROM orders) d\nCROSS JOIN products p\nLEFT JOIN orders o ON DATE(o.created_at) = d.order_date\n  AND o.product_id = p.id\nGROUP BY d.order_date, p.product_id\nHAVING SUM(o.quantity) IS NULL;  -- find zero-sales gaps"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CROSS JOIN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Implicit cross join (old syntax — avoid),SELECT * FROM employees a, departments b;  -- WRONG"
                  }
        ],
        tips: [
                  "Result size = rows(A) × rows(B) — can explode quickly",
                  "CROSS JOIN is useful for date/product matrices and finding gaps",
                  "Accidentally getting one from a missing ON clause is a common bug"
        ],
        mistake: "Writing FROM table_a, table_b without a WHERE clause. This returns millions of rows on any meaningful tables.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "subquery",
        fn: "Subquery",
        desc: "Nested SELECT inside another query.",
        category: "Subqueries",
        subtitle: "A query nested inside another query",
        signature: "SELECT ... WHERE col = (SELECT ...)",
        descLong: "Subqueries nest SELECT inside another. Scalar subqueries return one value. Correlated subqueries reference the outer query and run once per row.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Subquery — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Above average salary\nSELECT name, salary FROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Subquery — common patterns you'll see in production.\n-- APPROACH  - Combine Subquery with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- IN with subquery\nSELECT * FROM orders\nWHERE customer_id IN (\n  SELECT id FROM customers WHERE country = 'US'\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Subquery — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- EXISTS (faster for large sets),SELECT * FROM customers c,WHERE EXISTS (,  SELECT 1 FROM orders o WHERE o.customer_id = c.id,);"
                  }
        ],
        tips: [
                  "Scalar subqueries must return exactly one row and one column",
                  "EXISTS is often faster than IN — short-circuits on first match",
                  "Correlated subqueries run N times (once per outer row) — replace with JOIN when possible"
        ],
        mistake: "Correlated subqueries in SELECT on large tables — each outer row triggers a separate inner query.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "cte",
        fn: "WITH (CTE)",
        desc: "Named temporary result set for cleaner queries.",
        category: "Subqueries",
        subtitle: "Common Table Expression — reusable named query",
        signature: "WITH name AS (SELECT ...) SELECT ... FROM name;",
        descLong: "CTEs define named temporary result sets referenced in the main query. They replace deeply nested subqueries with readable named parts. Recursive CTEs traverse hierarchies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of WITH (CTE) — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nWITH dept_stats AS (\n  SELECT department, AVG(salary) AS avg_sal\n  FROM employees GROUP BY department\n)\nSELECT * FROM dept_stats WHERE avg_sal > 80000;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of WITH (CTE) — common patterns you'll see in production.\n-- APPROACH  - Combine WITH (CTE) with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Recursive CTE: org chart\nWITH RECURSIVE org AS (\n  SELECT id, name, manager_id, 1 AS level\n  FROM employees WHERE manager_id IS NULL"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of WITH (CTE) — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nUNION ALL\n  SELECT e.id, e.name, e.manager_id, o.level + 1\n  FROM employees e JOIN org o ON e.manager_id = o.id\n)\nSELECT * FROM org ORDER BY level;"
                  }
        ],
        tips: [
                  "Multiple CTEs are comma-separated after the WITH keyword",
                  "Recursive CTEs need a UNION ALL anchor + recursive part — add a depth limit",
                  "MySQL added CTE support in 8.0"
        ],
        mistake: "Infinite recursion in recursive CTEs. Always include a termination condition.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "union",
        fn: "UNION / UNION ALL",
        desc: "Stack results from multiple SELECTs vertically.",
        category: "Subqueries",
        subtitle: "Combine result sets from multiple SELECTs",
        signature: "SELECT ... UNION [ALL] SELECT ...;",
        descLong: "UNION deduplicates rows (expensive sort). UNION ALL keeps all rows including duplicates (faster). Both require matching column count and compatible types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of UNION / UNION ALL — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Deduplicate\nSELECT name, email FROM customers\nUNION\nSELECT name, email FROM prospects;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of UNION / UNION ALL — common patterns you'll see in production.\n-- APPROACH  - Combine UNION / UNION ALL with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Keep all rows — faster\nSELECT product_id FROM orders_2023\nUNION ALL\nSELECT product_id FROM orders_2024;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of UNION / UNION ALL — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Set difference (PostgreSQL/SQL Server),SELECT id FROM table_a,EXCEPT,SELECT id FROM table_b;"
                  }
        ],
        tips: [
                  "UNION ALL is almost always what you want — faster and explicit about keeping duplicates",
                  "Column names come from the first SELECT",
                  "ORDER BY in a UNION applies to the final combined result"
        ],
        mistake: "Using UNION instead of UNION ALL when duplicates are acceptable. UNION sorts the entire result to deduplicate — UNION ALL is much faster.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "exists",
        fn: "EXISTS / NOT EXISTS",
        desc: "Correlated subquery that filters rows based on existence of related data.",
        category: "Joins & Subqueries",
        subtitle: "Check for existence of related rows without returning them",
        signature: "SELECT * FROM table1 WHERE EXISTS (SELECT 1 FROM table2 WHERE condition)",
        descLong: "EXISTS is a correlated subquery filter that returns true if the subquery returns any rows. Unlike IN, EXISTS uses correlation efficiently and stops after finding the first match. NOT EXISTS finds rows with no related records (anti-join). Preferred over IN for large datasets and when testing mere existence rather than membership.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of EXISTS / NOT EXISTS — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 1. Find employees with at least one active project assignment\nSELECT DISTINCT e.employee_id, e.first_name, e.last_name\nFROM employees e\nWHERE EXISTS (\n  SELECT 1\n  FROM project_assignments pa\n  WHERE pa.employee_id = e.employee_id\n    AND pa.status = 'active'\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of EXISTS / NOT EXISTS — common patterns you'll see in production.\n-- APPROACH  - Combine EXISTS / NOT EXISTS with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- 2. Find employees with NO orders (anti-join pattern)\nSELECT e.employee_id, e.first_name, e.department_id\nFROM employees e\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM orders o\n  WHERE o.employee_id = e.employee_id\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of EXISTS / NOT EXISTS — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 3. Find customers who made purchases in both Q1 and Q4,SELECT DISTINCT c.customer_id, c.company_name,FROM customers c,WHERE EXISTS (,  SELECT 1,  FROM orders o1,  WHERE o1.customer_id = c.customer_id,    AND EXTRACT(QUARTER FROM o1.order_date) = 1,),AND EXISTS (,  SELECT 1,  FROM orders o2,  WHERE o2.customer_id = c.customer_id,    AND EXTRACT(QUARTER FROM o2.order_date) = 4,);,\n\n-- 4. Performance comparison: EXISTS vs IN (EXISTS typically faster),-- EXISTS version - stops after finding first match,SELECT employee_id, first_name,FROM employees e,WHERE EXISTS (,  SELECT 1,  FROM project_assignments,  WHERE employee_id = e.employee_id,    LIMIT 1,);,\n\n-- IN version - collects all values before comparing,SELECT DISTINCT employee_id, first_name,FROM employees,WHERE employee_id IN (,  SELECT DISTINCT employee_id,  FROM project_assignments,);"
                  }
        ],
        tips: [
                  "EXISTS stops after finding the first matching row — use it for existence checks rather than IN for large datasets",
                  "NOT EXISTS is the correct way to find rows with no related records (anti-join); avoid LEFT JOIN / IS NULL when you need to check multiple conditions",
                  "EXISTS uses correlation (subquery references outer query) — ensure the correlation condition is correct or you'll get unexpected results",
                  "SELECT 1 in EXISTS subquery is optimized equally to SELECT *; use 1 for clarity and performance"
        ],
        mistake: "Using IN with a large subquery result set — IN collects all values before comparing, while EXISTS stops at first match. For anti-joins, using LEFT JOIN with IS NULL instead of NOT EXISTS can miss rows when the join key is NULL.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "recursive-cte",
        fn: "WITH RECURSIVE",
        desc: "Recursive Common Table Expression for traversing hierarchies and graphs.",
        category: "Joins & Subqueries",
        subtitle: "Navigate tree structures and generate sequences with recursive queries",
        signature: "WITH RECURSIVE cte AS (BASE CASE UNION ALL RECURSIVE CASE) SELECT FROM cte",
        descLong: "Recursive CTEs solve graph/tree traversal problems without procedural code. They work in two parts: anchor (base case) returns initial rows, recursive part references the CTE to fetch next level. Essential for org charts, bills of materials, file hierarchies, and finding all descendants/ancestors. Prevents infinite loops with termination conditions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of WITH RECURSIVE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 1. Employee org chart: find all reports under a manager\nWITH RECURSIVE org_hierarchy AS (\n  -- Anchor: start with a specific manager\n  SELECT employee_id, first_name, manager_id, 1 as level\n  FROM employees\n  WHERE employee_id = 101\n\n  UNION ALL"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of WITH RECURSIVE — common patterns you'll see in production.\n-- APPROACH  - Combine WITH RECURSIVE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Recursive: find all direct and indirect reports\n  SELECT e.employee_id, e.first_name, e.manager_id, oh.level + 1\n  FROM employees e\n  INNER JOIN org_hierarchy oh ON e.manager_id = oh.employee_id\n  WHERE oh.level < 10  -- prevent infinite loops\n)\nSELECT employee_id, first_name, manager_id, level\nFROM org_hierarchy\nORDER BY level, first_name;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of WITH RECURSIVE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 2. Bill of Materials: find all components and sub-components,WITH RECURSIVE bom AS (,  -- Start with finished products,  SELECT product_id, component_id, quantity, 1 as depth,  FROM product_components,  WHERE product_id = 'BIKE-500',,  UNION ALL,\n\n  -- Recurse through component hierarchy,  SELECT bom.product_id, pc.component_id, bom.quantity * pc.quantity, bom.depth + 1,  FROM bom,  INNER JOIN product_components pc ON bom.component_id = pc.product_id,  WHERE bom.depth < 5,),SELECT DISTINCT component_id, SUM(quantity) as total_needed,FROM bom,GROUP BY component_id,ORDER BY component_id;,\n\n-- 3. Generate a sequence of dates for reporting,WITH RECURSIVE date_series AS (,  SELECT DATE('2026-01-01') as report_date,,  UNION ALL,,  SELECT DATE(report_date + INTERVAL '1 day'),  FROM date_series,  WHERE report_date < DATE('2026-01-31'),),SELECT report_date,FROM date_series;,\n\n-- 4. Find all categories and sub-categories,WITH RECURSIVE category_tree AS (,  -- Leaf categories (anchor),  SELECT category_id, category_name, parent_category_id, 0 as depth,  FROM product_categories,  WHERE parent_category_id IS NULL,,  UNION ALL,\n\n  -- Nested categories (recursive),  SELECT pc.category_id, pc.category_name, pc.parent_category_id, ct.depth + 1,  FROM product_categories pc,  INNER JOIN category_tree ct ON pc.parent_category_id = ct.category_id,),SELECT REPEAT('  ', depth) || category_name as hierarchy, category_id,FROM category_tree,ORDER BY category_id;"
                  }
        ],
        tips: [
                  "Always include a termination condition (LIMIT, depth counter, or visited set) — infinite recursion causes errors or runaway queries",
                  "Anchor clause (first SELECT) determines starting rows; ensure it filters correctly or you'll traverse from multiple roots",
                  "Use UNION ALL (not UNION) in recursion — UNION deduplicates which breaks hierarchical ordering and adds unnecessary overhead",
                  "Reference the CTE by name in the recursive part; join it to base tables with appropriate ON conditions"
        ],
        mistake: "Omitting a termination condition like depth < 10 or recursion level limit — the recursive part references the CTE indefinitely, causing infinite loops or extremely long queries. Also forgetting to join the recursive SELECT back to the CTE (only joining to base tables).",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "self-join",
        fn: "Self Join",
        desc: "Join a table to itself to compare rows or access related records in same table.",
        category: "Joins & Subqueries",
        subtitle: "Find relationships within the same table: manager-employee, duplicates, comparisons",
        signature: "SELECT * FROM table t1 JOIN table t2 ON t1.column = t2.other_column",
        descLong: "Self-joins compare rows within the same table using table aliases. Common uses: hierarchies (employee-manager), finding duplicates, comparing sequential rows, or chaining related records. Essential when foreign keys reference the same table. Always use distinct aliases (t1, t2) to avoid ambiguity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Self Join — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 1. Employee-manager lookup: show each employee with their manager's name\nSELECT\n  e.employee_id,\n  e.first_name || ' ' || e.last_name as employee_name,\n  m.employee_id as manager_id,\n  m.first_name || ' ' || m.last_name as manager_name\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.employee_id\nWHERE e.manager_id IS NOT NULL\nORDER BY e.employee_id;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Self Join — common patterns you'll see in production.\n-- APPROACH  - Combine Self Join with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- 2. Find potential duplicate customers (same name, different IDs)\nSELECT\n  c1.customer_id as customer_1,\n  c2.customer_id as customer_2,\n  c1.company_name,\n  c1.email,\n  c2.email\nFROM customers c1\nINNER JOIN customers c2 ON LOWER(c1.company_name) = LOWER(c2.company_name)\n  AND c1.customer_id < c2.customer_id  -- avoid duplicate pairs\nWHERE c1.customer_id != c2.customer_id\nORDER BY c1.company_name;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Self Join — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 3. Find employees in same department with similar salary (within 10%),SELECT,  e1.employee_id,,  e1.first_name,,  e1.department_id,,  e1.salary as emp1_salary,,  e2.employee_id as peer_id,,  e2.first_name as peer_name,,  e2.salary as peer_salary,,  ROUND(((e2.salary - e1.salary) / e1.salary * 100), 2) as salary_diff_pct,FROM employees e1,INNER JOIN employees e2 ON e1.department_id = e2.department_id,  AND e1.employee_id < e2.employee_id,WHERE ABS(e2.salary - e1.salary) / e1.salary <= 0.10,ORDER BY e1.department_id, e1.employee_id;,\n\n-- 4. Find orders placed by same customer on consecutive days,SELECT,  o1.order_id as order_1,,  o1.order_date,,  o1.total_amount,,  o2.order_id as order_2,,  o2.order_date,,  o2.total_amount,,  (o2.order_date - o1.order_date) as days_apart,FROM orders o1,INNER JOIN orders o2 ON o1.customer_id = o2.customer_id,  AND o2.order_date = o1.order_date + INTERVAL '1 day',ORDER BY o1.customer_id, o1.order_date;"
                  }
        ],
        tips: [
                  "Use table aliases (t1, t2) consistently to avoid column ambiguity — always qualify column names when joining a table to itself",
                  "Use < or != in the join condition to prevent duplicate pairs or self-matches (each row compared to itself should usually be excluded)",
                  "LEFT JOIN finds hierarchies with missing parents (unmatched manager_id); INNER JOIN excludes rows without matches",
                  "Self-joins can be expensive on large tables — consider indexes on the join keys and filter early with WHERE clauses"
        ],
        mistake: "Forgetting to use distinct aliases or failing to qualify column names — this creates ambiguity errors. Not including a comparison (e1.id < e2.id) when finding pairs, which produces duplicate rows. Joining on ambiguous conditions without fully specifying which columns match.",
        shorthand: {
          verbose: "SELECT e1.id, e2.id, e1.name, e2.name\nFROM employees e1\nINNER JOIN employees e2 ON e1.manager_id = e2.id",
          concise: "SELECT e1.id, e2.id FROM employees e1 INNER JOIN employees e2 ON e1.manager_id = e2.id",
        },
      },
    ],
  },

  // ── Section 3: Window Functions ─────────────────────────────────────────
  {
    id: "window",
    title: "Window Functions",
    entries: [
      {
        id: "over",
        fn: "OVER()",
        desc: "Core window clause — defines partition, order, frame.",
        category: "Window",
        subtitle: "Defines the window — what rows the function sees",
        signature: "fn() OVER (PARTITION BY col ORDER BY col ROWS/RANGE frame)",
        descLong: "OVER() turns an aggregate or ranking function into a window function. Unlike GROUP BY, window functions do not collapse rows — every input row produces an output row.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of OVER() — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- GROUP BY collapses rows\nSELECT department, AVG(salary) FROM employees GROUP BY department;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of OVER() — common patterns you'll see in production.\n-- APPROACH  - Combine OVER() with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Window function preserves rows\nSELECT name, department,\n       AVG(salary) OVER (PARTITION BY department) AS dept_avg\nFROM employees;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of OVER() — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Full anatomy,SELECT name, salary,,  SUM(salary) OVER (,    PARTITION BY department,    ORDER BY hire_date,    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW,  ) AS running_payroll,FROM employees;"
                  }
        ],
        tips: [
                  "Window functions never reduce row count — superpower vs GROUP BY",
                  "PARTITION BY is optional — omitting it means the whole result set is one window",
                  "Window functions are evaluated AFTER WHERE, GROUP BY, and HAVING",
                  "You can use multiple different OVER() clauses in the same SELECT"
        ],
        mistake: "Using a window function in WHERE — window functions cannot be in WHERE. Wrap in a CTE first.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "row-number",
        fn: "ROW_NUMBER()",
        desc: "Unique sequential integer per row in partition.",
        category: "Window",
        subtitle: "Unique sequential integer — no ties",
        signature: "ROW_NUMBER() OVER (PARTITION BY col ORDER BY col)",
        descLong: "ROW_NUMBER() assigns a unique integer to each row within its partition, starting at 1. Ties get different arbitrary numbers. Most common use: deduplication and top-N per group.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ROW_NUMBER() — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Top earner per department\nWITH ranked AS (\n  SELECT name, department, salary,\n    ROW_NUMBER() OVER (\n      PARTITION BY department ORDER BY salary DESC\n    ) AS rn\n  FROM employees\n)\nSELECT * FROM ranked WHERE rn = 1;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ROW_NUMBER() — common patterns you'll see in production.\n-- APPROACH  - Combine ROW_NUMBER() with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Deduplicate: keep latest per user\nWITH deduped AS (\n  SELECT *, ROW_NUMBER() OVER ("
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ROW_NUMBER() — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nPARTITION BY user_id ORDER BY created_at DESC\n  ) AS rn FROM events\n)\nSELECT * FROM deduped WHERE rn = 1;"
                  }
        ],
        tips: [
                  "ROW_NUMBER() always produces unique numbers — no ties, ever",
                  "Wrap in a CTE then filter WHERE rn = 1 (cannot filter window functions directly in WHERE)",
                  "Use ROW_NUMBER for deduplication; use RANK for finding all tied winners"
        ],
        mistake: "Filtering WHERE ROW_NUMBER() OVER (...) = 1 directly. Window functions cannot be in WHERE — wrap in a CTE first.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "rank",
        fn: "RANK() / DENSE_RANK()",
        desc: "Rank with or without gaps after ties.",
        category: "Window",
        subtitle: "RANK skips ranks (1,2,2,4) — DENSE_RANK does not (1,2,2,3)",
        signature: "RANK() OVER (PARTITION BY col ORDER BY col)",
        descLong: "RANK() gives tied rows the same rank then skips the next rank. DENSE_RANK() gives the same rank to ties but the next rank is consecutive. ROW_NUMBER() always gives unique values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of RANK() / DENSE_RANK() — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSELECT name, salary,\n  ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn,    -- 1,2,3,4\n  RANK()       OVER (ORDER BY salary DESC) AS rnk,   -- 1,2,2,4\n  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense  -- 1,2,2,3\nFROM employees;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of RANK() / DENSE_RANK() — common patterns you'll see in production.\n-- APPROACH  - Combine RANK() / DENSE_RANK() with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- All tied top performers\nWITH ranked AS (\n  SELECT *, RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of RANK() / DENSE_RANK() — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nFROM employees\n)\nSELECT * FROM ranked WHERE rnk = 1;"
                  }
        ],
        tips: [
                  "RANK: 1,2,2,4 — DENSE_RANK: 1,2,2,3 — ROW_NUMBER: 1,2,3,4",
                  "Use RANK WHERE rnk = 1 to include ALL tied top performers",
                  "Use DENSE_RANK for user-facing leaderboards (no confusing gaps)"
        ],
        mistake: "Using ROW_NUMBER() when you want all tied winners. ROW_NUMBER() arbitrarily picks one from a tie group.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "lag-lead",
        fn: "LAG() / LEAD()",
        desc: "Access values from previous or following rows.",
        category: "Window",
        subtitle: "Look backwards or forwards in the partition",
        signature: "LAG(col, offset, default) OVER (PARTITION BY ... ORDER BY ...)",
        descLong: "LAG() returns a value from N rows before the current row. LEAD() returns a value from N rows after. Essential for period-over-period comparisons.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LAG() / LEAD() — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Month-over-month change\nSELECT month, revenue,\n  LAG(revenue) OVER (ORDER BY month) AS prev_month,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly_revenue;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LAG() / LEAD() — common patterns you'll see in production.\n-- APPROACH  - Combine LAG() / LEAD() with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Days until next order\nSELECT customer_id, order_date,\n  LEAD(order_date) OVER (\n    PARTITION BY customer_id ORDER BY order_date\n  ) AS next_order\nFROM orders;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LAG() / LEAD() — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Default to avoid NULL on first row,SELECT date, price,,  LAG(price, 1, price) OVER (ORDER BY date) AS prev_price,FROM stock_prices;"
                  }
        ],
        tips: [
                  "LAG(col) defaults to offset 1",
                  "Third argument is the default when there is no previous/next row",
                  "LEAD returns NULL for the last row of each partition — handle it"
        ],
        mistake: "Forgetting the default — LAG() returns NULL for the first row. Arithmetic with NULL = NULL. Use LAG(col, 1, 0).",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "running-total",
        fn: "Running Total",
        desc: "Cumulative SUM across ordered rows.",
        category: "Window",
        subtitle: "Cumulative SUM that grows as rows are processed",
        signature: "SUM(col) OVER (ORDER BY col ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
        descLong: "A running total adds each row to all previous rows for a cumulative sum. PARTITION BY resets per group.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Running Total — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Simple running total\nSELECT sale_date, amount,\n  SUM(amount) OVER (ORDER BY sale_date) AS running_total\nFROM sales;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Running Total — common patterns you'll see in production.\n-- APPROACH  - Combine Running Total with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Per product (resets each product)\nSELECT product_id, sale_date, amount,\n  SUM(amount) OVER (\n    PARTITION BY product_id\n    ORDER BY sale_date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS product_running_total\nFROM sales;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Running Total — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- As % of grand total,SELECT sale_date, amount,,  ROUND(SUM(amount) OVER (ORDER BY sale_date) * 100.0,    / SUM(amount) OVER (), 1) AS cumulative_pct,FROM sales;"
                  }
        ],
        tips: [
                  "Specify ROWS BETWEEN explicitly to avoid tie surprises",
                  "SUM(col) OVER () (no ORDER BY) gives the grand total for all rows",
                  "Use ROWS not RANGE for running totals"
        ],
        mistake: "Using RANGE instead of ROWS. RANGE includes all rows with the same ORDER BY value, giving the full day sum instead of row-by-row cumulative.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "moving-avg",
        fn: "Moving Average",
        desc: "Average over a sliding N-row window.",
        category: "Window",
        subtitle: "Smooth time-series data with a sliding window",
        signature: "AVG(col) OVER (ORDER BY col ROWS BETWEEN N PRECEDING AND CURRENT ROW)",
        descLong: "A moving average smooths out short-term fluctuations by averaging over a sliding window of N rows. Commonly used in financial analysis and demand forecasting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Moving Average — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 7-day moving average\nSELECT sale_date, daily_revenue,\n  ROUND(AVG(daily_revenue) OVER (\n    ORDER BY sale_date\n    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n  ), 2) AS ma_7day\nFROM daily_revenue;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Moving Average — common patterns you'll see in production.\n-- APPROACH  - Combine Moving Average with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Multiple windows in one query\nSELECT sale_date, revenue,"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Moving Average — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nAVG(revenue) OVER (ORDER BY sale_date ROWS BETWEEN 6  PRECEDING AND CURRENT ROW) AS ma_7,\n  AVG(revenue) OVER (ORDER BY sale_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS ma_30\nFROM daily_revenue;"
                  }
        ],
        tips: [
                  "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW = 7-row window (6 before + current)",
                  "Early rows have fewer than N prior rows — the window shrinks at the start",
                  "PARTITION BY resets the window per group"
        ],
        mistake: "Assuming the first N-1 rows have a full window. They do not — a 7-day MA for day 3 only averages 3 days.",
        shorthand: {
          verbose: "SELECT sale_date, revenue,\n  AVG(revenue) OVER (ORDER BY sale_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7\nFROM daily_revenue",
          concise: "AVG(revenue) OVER (ORDER BY sale_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7",
        },
      },
    ],
  },

  // ── Section 4: Data Modification & Types ─────────────────────────────────────────
  {
    id: "dml-types",
    title: "Data Modification & Types",
    entries: [
      {
        id: "insert",
        fn: "INSERT",
        desc: "Add new rows to a table.",
        category: "DML",
        subtitle: "Add one or more rows",
        signature: "INSERT INTO table (cols) VALUES (vals);",
        descLong: "INSERT adds new rows. Always specify column names. Multi-row inserts are much faster than individual statements in a loop.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of INSERT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Single row with explicit columns\nINSERT INTO employees (first_name, last_name, salary)\nVALUES ('Alice', 'Smith', 95000)\nRETURNING id, first_name, salary;  -- returns generated id"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of INSERT — common patterns you'll see in production.\n-- APPROACH  - Combine INSERT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Multiple rows (much faster than loop)\nINSERT INTO products (name, price) VALUES\n  ('Widget A', 9.99),\n  ('Widget B', 14.99),\n  ('Widget C', 19.99)\nRETURNING id, name;  -- see what was inserted"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of INSERT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Insert from query (archive old orders),INSERT INTO archive_orders (user_id, total, created_at),SELECT user_id, total, created_at FROM orders,WHERE created_at < '2023-01-01';,\n\n-- Upsert: insert or update on conflict (PostgreSQL),INSERT INTO settings (user_id, theme) VALUES (1, 'dark'),ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme;"
                  }
        ],
        tips: [
                  "Always specify column names — positional inserts break on schema changes",
                  "Multi-row INSERT is much faster than individual statements in a loop",
                  "RETURNING gives you back generated IDs and inserted data",
                  "ON CONFLICT (PostgreSQL) / ON DUPLICATE KEY (MySQL) handle upserts"
        ],
        mistake: "INSERT INTO table VALUES (...) without column names. Columns added or reordered later will silently receive wrong data.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "update",
        fn: "UPDATE",
        desc: "Modify existing rows in a table.",
        category: "DML",
        subtitle: "Modify existing rows",
        signature: "UPDATE table SET col = val WHERE condition;",
        descLong: "UPDATE modifies existing rows. Without WHERE, every row is updated. Always test your WHERE clause with a SELECT first.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of UPDATE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Simple update\nUPDATE employees SET salary = 105000 WHERE id = 42;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of UPDATE — common patterns you'll see in production.\n-- APPROACH  - Combine UPDATE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Multiple columns with conditions\nUPDATE employees\nSET salary = salary * 1.1, last_review = CURRENT_DATE\nWHERE department = 'Engineering' AND performance_rating = 'excellent';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of UPDATE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- UPDATE from another table (UPDATE...FROM/JOIN),UPDATE orders o,SET status = 'completed', updated_at = NOW(),FROM shipments s,WHERE o.id = s.order_id AND s.delivery_date <= CURRENT_DATE;,\n\n-- Safe pattern: verify rows first,SELECT COUNT(*) FROM employees,WHERE department = 'Engineering' AND performance_rating = 'excellent';,-- Then UPDATE with same WHERE clause"
                  }
        ],
        tips: [
                  "**Always** include WHERE unless you intentionally want all rows updated",
                  "UPDATE FROM joins allow updating based on other tables",
                  "Run SELECT with the same WHERE first to verify scope",
                  "Wrap in a transaction so you can ROLLBACK if needed"
        ],
        mistake: "UPDATE employees SET salary = 0; — no WHERE clause updates every single row.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "delete",
        fn: "DELETE",
        desc: "Remove rows from a table.",
        category: "DML",
        subtitle: "Remove matching rows",
        signature: "DELETE FROM table WHERE condition;",
        descLong: "DELETE removes rows matching the WHERE clause. Without WHERE, all rows are deleted. TRUNCATE is faster for clearing all rows. Soft deletes are safer in production.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DELETE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Simple delete\nDELETE FROM employees WHERE id = 42;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DELETE — common patterns you'll see in production.\n-- APPROACH  - Combine DELETE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Delete with subquery\nDELETE FROM sessions\nWHERE user_id IN (SELECT id FROM users WHERE banned = true);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DELETE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Cascade delete (foreign key with ON DELETE CASCADE),-- Deleting a user also removes their orders,DELETE FROM users WHERE id = 42;  -- triggers cascade,\n\n-- Fast full clear (no transaction possible),TRUNCATE TABLE temp_data;,\n\n-- Safe soft delete pattern (production best practice),UPDATE users SET deleted_at = NOW(), updated_at = NOW(),WHERE id = 42 AND deleted_at IS NULL;"
                  }
        ],
        tips: [
                  "Always SELECT with the same WHERE before running DELETE",
                  "ON DELETE CASCADE in foreign keys auto-deletes child rows — watch for surprises",
                  "Wrap in a transaction: BEGIN; DELETE ...; verify; COMMIT; or ROLLBACK;",
                  "Soft deletes (UPDATE with timestamp) are safer — easier to recover, supports audits"
        ],
        mistake: "DELETE FROM table without a WHERE clause. Unlike TRUNCATE it is logged row-by-row — slow AND destructive.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "null",
        fn: "NULL / IS NULL",
        desc: "Test for and handle missing values.",
        category: "NULL",
        subtitle: "Handle missing or unknown values",
        signature: "col IS NULL  |  col IS NOT NULL",
        descLong: "NULL is not zero, not empty string, not false. Any comparison using = or != returns NULL (not true/false). Always use IS NULL / IS NOT NULL.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of NULL / IS NULL — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSELECT * FROM employees WHERE manager_id IS NULL;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of NULL / IS NULL — common patterns you'll see in production.\n-- APPROACH  - Combine NULL / IS NULL with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Comparisons return NULL, not true/false\nSELECT NULL = NULL;   -- NULL (not TRUE)\nSELECT NULL != NULL;  -- NULL (not TRUE)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of NULL / IS NULL — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- COALESCE: first non-NULL value,SELECT COALESCE(bonus, 0) AS bonus FROM employees;,SELECT COALESCE(mobile, phone, email) AS contact FROM users;,\n\n-- NULLIF: return NULL when two values are equal,SELECT NULLIF(score, 0) AS score FROM results;,-- avoids division-by-zero: val / NULLIF(divisor, 0)"
                  }
        ],
        tips: [
                  "NULL is not equal to anything — not even itself",
                  "COALESCE(a, b, c) returns the first non-NULL value",
                  "NULLIF(a, b) returns NULL when a = b — useful to avoid division by zero",
                  "In aggregates, NULLs are ignored"
        ],
        mistake: "WHERE col = NULL never matches anything. NULL represents unknown — use WHERE col IS NULL.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "cast",
        fn: "CAST / CONVERT",
        desc: "Convert values between data types.",
        category: "Types",
        subtitle: "Convert a value from one type to another",
        signature: "CAST(value AS type)  |  value::type (PostgreSQL)",
        descLong: "CAST converts a value to a specified type. PostgreSQL supports :: shorthand. Needed when comparing columns of different types or doing arithmetic on strings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CAST / CONVERT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- String to number\nSELECT CAST('42' AS INTEGER) AS num;\nSELECT '42'::INTEGER;  -- PostgreSQL shorthand"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CAST / CONVERT — common patterns you'll see in production.\n-- APPROACH  - Combine CAST / CONVERT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Fix integer division: 7/2 = 3.5 not 3\nSELECT CAST(7 AS DECIMAL) / 2;  -- 3.50\nSELECT 7.0 / 2;                 -- cleaner"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CAST / CONVERT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- String to date,SELECT CAST('2024-03-15' AS DATE);,SELECT '2024-03-15'::DATE;  -- PostgreSQL,\n\n-- JSON casting: parse string as JSON object,SELECT CAST('{\"status\": \"active\"}' AS JSON) -> 'status';,SELECT (metadata::jsonb -> 'user_id')::TEXT;,\n\n-- Date formatting,SELECT TO_CHAR(NOW(), 'YYYY-MM-DD');  -- PostgreSQL,SELECT DATE_FORMAT(NOW(), '%Y-%m-%d');  -- MySQL"
                  }
        ],
        tips: [
                  "Integer division truncates: 7/2 = 3. Use 7.0/2 or CAST to DECIMAL for float result",
                  "PostgreSQL :: is clean shorthand; supports JSON/JSONB casting for semi-structured data",
                  "Implicit casting can cause index misses and slow queries — be explicit"
        ],
        mistake: "SELECT 1/2 returns 0 in SQL, not 0.5. Use CAST(1 AS DECIMAL)/2 or 1.0/2.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "coalesce",
        fn: "COALESCE",
        desc: "Return first non-NULL value from list.",
        category: "NULL",
        subtitle: "Provide fallback values for NULLs",
        signature: "COALESCE(val1, val2, ..., fallback)",
        descLong: "COALESCE returns the first non-NULL value from its arguments. Standard SQL way to provide defaults. If all arguments are NULL, returns NULL.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of COALESCE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Default when NULL\nSELECT name, COALESCE(bonus, 0) AS bonus FROM employees;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of COALESCE — common patterns you'll see in production.\n-- APPROACH  - Combine COALESCE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Fallback chain\nSELECT COALESCE(mobile, home_phone, work_phone, 'No phone')\n  AS best_contact\nFROM contacts;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of COALESCE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Protect arithmetic from NULL propagation,SELECT salary + COALESCE(bonus, 0) AS total_comp,FROM employees;,\n\n-- Control NULL sort order,SELECT * FROM tasks,ORDER BY COALESCE(due_date, '9999-12-31');"
                  }
        ],
        tips: [
                  "COALESCE is standard SQL — prefer it over IFNULL (MySQL-only) or NVL (Oracle-only)",
                  "NULL + anything = NULL — use COALESCE to protect arithmetic",
                  "COALESCE short-circuits — stops evaluating once it finds a non-NULL"
        ],
        mistake: "salary + bonus returning NULL when bonus is NULL. NULL propagates through arithmetic. Use salary + COALESCE(bonus, 0).",
        shorthand: {
          verbose: "// Manual / verbose approach\nSELECT id, name, salary + COALESCE(bonus, 0) AS total_comp\nFROM employees\n// More explicit but longer",
          concise: "SELECT salary + COALESCE(bonus, 0) AS total_comp FROM employees",
        },
      },
    ],
  },

  // ── Section 5: Performance & Schema ─────────────────────────────────────────
  {
    id: "perf-schema",
    title: "Performance & Schema",
    entries: [
      {
        id: "create-index",
        fn: "CREATE INDEX",
        desc: "Speed up queries with a lookup structure.",
        category: "Indexes",
        subtitle: "Create an index to speed up query lookups",
        signature: "CREATE INDEX idx_name ON table (col);",
        descLong: "An index allows the database to find rows without scanning the entire table. Indexes speed reads but slow writes and use storage.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CREATE INDEX — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nCREATE INDEX idx_employees_email ON employees (email);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CREATE INDEX — common patterns you'll see in production.\n-- APPROACH  - Combine CREATE INDEX with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Unique index\nCREATE UNIQUE INDEX idx_users_email ON users (email);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CREATE INDEX — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Composite (column order matters!),CREATE INDEX idx_orders_customer_date,ON orders (customer_id, created_at);,-- Efficient: WHERE customer_id = 1,-- Efficient: WHERE customer_id = 1 AND created_at > '2024-01-01',-- NOT efficient: WHERE created_at > '2024-01-01' alone,\n\n-- Partial index (PostgreSQL),CREATE INDEX idx_active_users ON users (email),WHERE status = 'active';"
                  }
        ],
        tips: [
                  "Index columns used in WHERE, JOIN ON, and ORDER BY",
                  "Composite index: most selective column first, range columns last",
                  "Indexes slow INSERT/UPDATE/DELETE — do not over-index write-heavy tables"
        ],
        mistake: "Creating an index on a low-cardinality column like boolean or a status with 3 values. The optimizer often ignores it.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "explain",
        fn: "EXPLAIN / ANALYZE",
        desc: "Inspect the query execution plan.",
        category: "Indexes",
        subtitle: "Show how the optimizer plans to execute a query",
        signature: "EXPLAIN SELECT ...;  |  EXPLAIN ANALYZE SELECT ...;",
        descLong: "EXPLAIN shows the execution plan without running the query. EXPLAIN ANALYZE runs it and shows real timings. Look for full table scans on large tables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of EXPLAIN / ANALYZE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Basic plan (does NOT execute the query)\nEXPLAIN SELECT * FROM orders WHERE customer_id = 42;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of EXPLAIN / ANALYZE — common patterns you'll see in production.\n-- APPROACH  - Combine EXPLAIN / ANALYZE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- PostgreSQL: real timings + row counts\nEXPLAIN ANALYZE\nSELECT o.id, o.total, c.name\nFROM   orders o\nJOIN   customers c ON c.id = o.customer_id\nWHERE  o.created_at >= '2024-01-01'\nORDER  BY o.total DESC\nLIMIT  100;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of EXPLAIN / ANALYZE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- With buffer / I/O statistics,EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT),SELECT * FROM orders WHERE customer_id = 42;,\n\n-- Plan keywords to know:,-- Seq Scan        → full table scan (slow on large tables),-- Index Scan      → reading index + heap (good),-- Index Only Scan → covering index, no heap (best),-- Bitmap Scan     → multiple index ranges merged,-- Nested Loop     → row-by-row join (small tables),-- Hash Join       → build hash table (medium tables),-- Merge Join      → sorted merge (large sorted sets)"
                  }
        ],
        tips: [
                  "Look for 'Seq Scan' on large tables — usually a missing index",
                  "EXPLAIN ANALYZE executes the query — do not use on slow destructive queries in production",
                  "Compare estimated rows vs actual rows — large discrepancies mean stale statistics (run ANALYZE)",
                  "Use EXPLAIN (BUFFERS, ANALYZE) in PostgreSQL to see cache hit rates and I/O costs"
        ],
        mistake: "Running EXPLAIN ANALYZE on a slow DELETE or UPDATE in production. It executes the query — your data changes.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "sargable",
        fn: "Sargable Queries",
        desc: "Predicates that can use indexes efficiently.",
        category: "Indexes",
        subtitle: "Write index-friendly WHERE predicates",
        signature: "WHERE indexed_col = val  ← sargable",
        descLong: "A sargable predicate can use an index. Wrapping an indexed column in a function makes it non-sargable — the index is bypassed and a full scan occurs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Sargable Queries — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- NOT sargable (function on indexed column)\nWHERE YEAR(created_at) = 2024\nWHERE LOWER(email) = 'alice@example.com'\nWHERE salary + bonus > 100000"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Sargable Queries — common patterns you'll see in production.\n-- APPROACH  - Combine Sargable Queries with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Sargable equivalents\nWHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'\nWHERE email = 'alice@example.com'  -- use case-insensitive collation\nWHERE salary > 100000 - bonus      -- move math to right side"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Sargable Queries — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Functional index (PostgreSQL),CREATE INDEX idx_lower_email ON users (LOWER(email));,WHERE LOWER(email) = 'alice@example.com'; -- now uses index!"
                  }
        ],
        tips: [
                  "Never apply a function to an indexed column in WHERE",
                  "LIKE 'text%' is sargable; LIKE '%text' is not",
                  "Use expression indexes to make function predicates sargable"
        ],
        mistake: "WHERE YEAR(created_at) = 2024 forces a full table scan. Use WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "begin",
        fn: "BEGIN / COMMIT / ROLLBACK",
        desc: "Atomic units of work — all or nothing.",
        category: "Transactions",
        subtitle: "Group statements into an atomic unit",
        signature: "BEGIN; ... COMMIT;  |  ROLLBACK;",
        descLong: "A transaction groups multiple statements so they succeed or fail together. COMMIT makes changes permanent. ROLLBACK undoes everything since BEGIN.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of BEGIN / COMMIT / ROLLBACK — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nBEGIN;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;  -- makes both changes permanent"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of BEGIN / COMMIT / ROLLBACK — common patterns you'll see in production.\n-- APPROACH  - Combine BEGIN / COMMIT / ROLLBACK with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- If something goes wrong\nROLLBACK;  -- undoes both"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of BEGIN / COMMIT / ROLLBACK — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Savepoints,BEGIN;,INSERT INTO orders (customer_id, total) VALUES (1, 100);,SAVEPOINT order_created;,INSERT INTO order_items (order_id, product_id) VALUES (1, 999);,ROLLBACK TO SAVEPOINT order_created; -- undo item, keep order,INSERT INTO order_items (order_id, product_id) VALUES (1, 5);,COMMIT;"
                  }
        ],
        tips: [
                  "Use transactions whenever multiple statements must succeed or fail together",
                  "SAVEPOINT allows partial rollback within a transaction",
                  "Keep transactions short — they hold locks while open"
        ],
        mistake: "Running multiple related statements without a transaction. A crash between statements leaves partial data.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "acid",
        fn: "ACID Properties",
        desc: "Guarantees for reliable transaction processing.",
        category: "Transactions",
        subtitle: "Atomicity, Consistency, Isolation, Durability",
        signature: "The four properties of reliable transactions",
        descLong: "ACID guarantees transactions are processed reliably. Atomicity: all or nothing. Consistency: valid state to valid state. Isolation: concurrent transactions do not interfere. Durability: committed data survives crashes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ACID Properties — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Isolation level demo: transfer money between accounts\nBEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;\nSELECT balance FROM accounts WHERE id = 1;\n-- Tx2 may have changed balance between SELECT and UPDATE\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nCOMMIT;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ACID Properties — common patterns you'll see in production.\n-- APPROACH  - Combine ACID Properties with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Repeatable read: prevents non-repeatable reads\nBEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nSELECT COUNT(*) FROM orders;  -- locked\n-- Phantom reads still possible: new rows inserted by Tx2\nSELECT COUNT(*) FROM orders;\nCOMMIT;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ACID Properties — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Check current level,SHOW transaction_isolation;       -- PostgreSQL,SELECT @@transaction_isolation;   -- MySQL"
                  }
        ],
        tips: [
                  "READ COMMITTED is the right default for most workloads (good balance)",
                  "REPEATABLE READ prevents non-repeatable reads but allows phantom reads",
                  "Higher isolation = fewer anomalies but more lock contention and slower commits",
                  "SERIALIZABLE kills concurrency at scale — rarely needed"
        ],
        mistake: "Choosing SERIALIZABLE by default. It serializes all transactions and kills concurrency at scale.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "locks",
        fn: "Locks & Deadlocks",
        desc: "Row locking, deadlock prevention and detection.",
        category: "Transactions",
        subtitle: "Control concurrent access with locks",
        signature: "SELECT ... FOR UPDATE  — acquire a row lock",
        descLong: "Locks prevent concurrent transactions from corrupting each other. SELECT FOR UPDATE locks rows you intend to modify. Deadlocks occur when two transactions each hold a lock the other needs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Locks & Deadlocks — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Lock rows for safe update (read-modify-write)\nBEGIN;\nSELECT * FROM accounts WHERE id = 1 FOR UPDATE;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nCOMMIT;  -- releases lock"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Locks & Deadlocks — common patterns you'll see in production.\n-- APPROACH  - Combine Locks & Deadlocks with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Skip locked rows (excellent for job queues)\nSELECT * FROM jobs WHERE status = 'pending'\nLIMIT 1 FOR UPDATE SKIP LOCKED;  -- grab next available, don't wait"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Locks & Deadlocks — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Prevent deadlocks: lock in consistent order (by ID),SELECT * FROM accounts,WHERE id IN (1, 2) ORDER BY id FOR UPDATE;,\n\n-- Advisory locks: application-level locks,SELECT pg_advisory_lock(user_id);  -- PostgreSQL,DO SOMETHING;,SELECT pg_advisory_unlock(user_id);"
                  }
        ],
        tips: [
                  "FOR UPDATE locks rows until the transaction ends — keep transactions short",
                  "SKIP LOCKED is excellent for worker queues — each worker grabs a different row",
                  "To prevent deadlocks: always acquire locks in the same consistent order by ID",
                  "Advisory locks give app-level control; NOWAIT raises error instead of waiting"
        ],
        mistake: "Holding a transaction open while waiting for user input or an external API call. This keeps locks held for seconds/minutes, blocking all writers on those rows.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "create-table",
        fn: "CREATE TABLE",
        desc: "Define table structure with types and constraints.",
        category: "Schema",
        subtitle: "Define a table with columns, types, and constraints",
        signature: "CREATE TABLE name (col type constraints, ...);",
        descLong: "CREATE TABLE defines a table's structure. Choosing the right types and constraints at design time saves enormous pain later.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CREATE TABLE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nCREATE TABLE users (\n  id           BIGSERIAL    PRIMARY KEY,\n  email        VARCHAR(255) NOT NULL UNIQUE,\n  username     VARCHAR(50)  NOT NULL,\n  age          SMALLINT     CHECK (age >= 13),\n  status       VARCHAR(20)  NOT NULL DEFAULT 'active',\n  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),\n  deleted_at   TIMESTAMPTZ  -- nullable = soft delete support\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CREATE TABLE — common patterns you'll see in production.\n-- APPROACH  - Combine CREATE TABLE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nCREATE TABLE orders (\n  id       BIGSERIAL     PRIMARY KEY,"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CREATE TABLE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nuser_id  BIGINT        NOT NULL REFERENCES users(id),\n  total    NUMERIC(10,2) NOT NULL CHECK (total >= 0),\n  status   VARCHAR(20)   NOT NULL DEFAULT 'pending'\n);"
                  }
        ],
        tips: [
                  "Use BIGINT/BIGSERIAL for PKs — INT overflows at 2 billion rows",
                  "NUMERIC(10,2) for money — never FLOAT",
                  "Add NOT NULL to all columns unless NULL has a specific meaning",
                  "Foreign keys enforce referential integrity at the DB level"
        ],
        mistake: "Using FLOAT or DOUBLE for monetary amounts. Floating point cannot represent 0.10 exactly — use NUMERIC/DECIMAL.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "alter-table",
        fn: "ALTER TABLE",
        desc: "Modify an existing table structure.",
        category: "Schema",
        subtitle: "Add, drop, or modify columns and constraints",
        signature: "ALTER TABLE name ADD/DROP/MODIFY COLUMN ...;",
        descLong: "ALTER TABLE modifies an existing table. Some operations are instant; others lock the table and can take hours on large tables. Always test on staging first.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ALTER TABLE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Add column: metadata-only (instant, no table lock)\nALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ALTER TABLE — common patterns you'll see in production.\n-- APPROACH  - Combine ALTER TABLE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Safe default on populated table: fast in PG 11+\nALTER TABLE users ADD COLUMN loyalty_points INT NOT NULL DEFAULT 0;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ALTER TABLE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Drop column (rewrites table — expensive),ALTER TABLE users DROP COLUMN legacy_field;,\n\n-- Rename column (metadata-only, instant),ALTER TABLE users RENAME COLUMN username TO display_name;,\n\n-- Add foreign key constraint (validates data, may lock),ALTER TABLE orders,ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);,\n\n-- Online DDL: non-blocking in some DBs,ALTER TABLE products,ADD INDEX idx_sku (sku),,ALGORITHM=INPLACE, LOCK=NONE;  -- MySQL 5.7+"
                  }
        ],
        tips: [
                  "PostgreSQL 11+: ADD COLUMN with DEFAULT is instant (metadata-only)",
                  "Changing a column type or adding NOT NULL can rewrite table — expensive on 1GB+",
                  "Use pt-online-schema-change or gh-ost for zero-downtime on production data",
                  "MySQL 5.7+ ALGORITHM=INPLACE LOCK=NONE allows online DDL"
        ],
        mistake: "ALTER TABLE ADD COLUMN NOT NULL without a DEFAULT on a large populated table. It must verify/update every existing row, locking the table for potentially hours.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "views",
        fn: "Views",
        desc: "Named saved queries — virtual tables.",
        category: "Schema",
        subtitle: "Store a query as a reusable virtual table",
        signature: "CREATE VIEW name AS SELECT ...;",
        descLong: "A view is a saved SELECT query that behaves like a virtual table. It simplifies complex queries, centralizes business logic, and controls data access. Regular views do not store data; materialized views do.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Views — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Regular view: runs every time it's queried\nCREATE VIEW active_employees AS\nSELECT id, name, department, salary\nFROM employees WHERE status = 'active';\n\nSELECT * FROM active_employees WHERE department = 'Engineering';"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Views — common patterns you'll see in production.\n-- APPROACH  - Combine Views with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Updatable view: can INSERT/UPDATE/DELETE through the view\nCREATE VIEW user_profiles AS\nSELECT id, name, email, created_at\nFROM users WHERE deleted_at IS NULL;\n\nUPDATE user_profiles SET name = 'Bob' WHERE id = 1;  -- updates users"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Views — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Materialized view: stores result, needs refresh,CREATE MATERIALIZED VIEW monthly_revenue AS,SELECT DATE_TRUNC('month', order_date) AS month, SUM(total) AS revenue,FROM orders GROUP BY 1;,,REFRESH MATERIALIZED VIEW monthly_revenue;"
                  }
        ],
        tips: [
                  "Regular views are free — just saved queries, no storage cost",
                  "Updatable views allow DML through the view — simplifies data access",
                  "Materialized views store data; refresh manually or schedule with cron",
                  "Great for row/column security — grant SELECT on the view, not the base table"
        ],
        mistake: "Expecting a regular view to return data faster than the base query. A view reruns its query every time — use a materialized view for performance.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "exec-order",
        fn: "Execution Order",
        desc: "How SQL clauses are actually evaluated.",
        category: "Schema",
        subtitle: "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT",
        signature: "FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT",
        descLong: "SQL clauses are evaluated in a specific order different from the order you write them. This explains why you cannot use a SELECT alias in WHERE, or aggregates in WHERE.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Execution Order — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Written order:\nSELECT department, COUNT(*) AS headcount\nFROM employees\nWHERE status = 'active'\nGROUP BY department\nHAVING COUNT(*) > 5\nORDER BY headcount DESC\nLIMIT 10;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Execution Order — common patterns you'll see in production.\n-- APPROACH  - Combine Execution Order with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Execution order:\n-- 1. FROM employees\n-- 2. WHERE status='active'     (before grouping)\n-- 3. GROUP BY department\n-- 4. HAVING COUNT(*) > 5       (after grouping)\n-- 5. SELECT department, COUNT(*)\n-- 6. ORDER BY headcount DESC   (can use aliases)\n-- 7. LIMIT 10"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Execution Order — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- WHY aliases fail in WHERE:,SELECT salary * 12 AS annual FROM employees,WHERE annual > 100000;  -- ERROR: annual not defined yet"
                  }
        ],
        tips: [
                  "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT",
                  "WHERE runs before SELECT — aliases do not exist yet in WHERE",
                  "HAVING runs after GROUP BY — can reference aggregates",
                  "ORDER BY runs after SELECT — CAN reference SELECT aliases"
        ],
        mistake: "Using a SELECT alias in WHERE. WHERE runs before SELECT — the alias does not exist yet. Repeat the expression or use a CTE.",
        shorthand: {
          verbose: "SELECT name, salary * 12 AS annual\nFROM employees\nWHERE salary > 5000\nORDER BY annual DESC",
          concise: "SELECT name, salary * 12 AS annual FROM employees WHERE salary > 5000 ORDER BY annual DESC",
        },
      },
    ],
  },

  // ── Section 6: String Functions ─────────────────────────────────────────
  {
    id: "string-functions",
    title: "String Functions",
    entries: [
      {
        id: "concat",
        fn: "CONCAT / ||",
        desc: "Combine multiple strings into one.",
        category: "Strings",
        subtitle: "String concatenation",
        signature: "CONCAT(str1, str2, ...)  |  str1 || str2",
        descLong: "CONCAT joins strings together. The || operator is standard SQL but not supported in MySQL (which uses CONCAT). CONCAT_WS joins with a separator. NULL handling differs: || with NULL returns NULL in standard SQL; CONCAT ignores NULLs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CONCAT / || — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Basic concatenation\nSELECT CONCAT(first_name, ' ', last_name) AS full_name\nFROM employees;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CONCAT / || — common patterns you'll see in production.\n-- APPROACH  - Combine CONCAT / || with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- With separator (CONCAT_WS = concat with separator)\nSELECT CONCAT_WS(', ', city, state, country) AS location\nFROM addresses;\n-- 'New York, NY, US' — skips NULLs automatically"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CONCAT / || — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Standard SQL operator (PostgreSQL, SQLite),SELECT first_name || ' ' || last_name AS full_name,FROM employees;,\n\n-- Build formatted output,SELECT CONCAT(,  'Order #', LPAD(id::TEXT, 6, '0'),,  ' — $', TO_CHAR(total, 'FM999,999.00'),,  ' (', status, ')',) AS order_summary,FROM orders;"
                  }
        ],
        tips: [
                  "CONCAT_WS skips NULLs — || does not (NULL || anything = NULL)",
                  "MySQL uses CONCAT(); PostgreSQL/SQLite use || operator",
                  "LPAD/RPAD pad strings to a fixed width — great for formatted IDs",
                  "Always handle NULLs: CONCAT(COALESCE(first, ''), ' ', COALESCE(last, ''))"
        ],
        mistake: "Using || with nullable columns without COALESCE — one NULL makes the entire result NULL.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "substring",
        fn: "SUBSTRING / LEFT / RIGHT",
        desc: "Extract a portion of a string by position or length.",
        category: "Strings",
        subtitle: "Extract substrings",
        signature: "SUBSTRING(str FROM start FOR length)  |  LEFT(str, n)  |  RIGHT(str, n)",
        descLong: "SUBSTRING extracts characters starting at a position for a given length. Positions are 1-based (not 0). LEFT and RIGHT extract from the start or end. SPLIT_PART splits on a delimiter and returns the Nth part.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SUBSTRING / LEFT / RIGHT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Extract area code from phone\nSELECT SUBSTRING(phone FROM 1 FOR 3) AS area_code\nFROM contacts;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SUBSTRING / LEFT / RIGHT — common patterns you'll see in production.\n-- APPROACH  - Combine SUBSTRING / LEFT / RIGHT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- MySQL syntax (positional)\nSELECT SUBSTRING(phone, 1, 3) AS area_code FROM contacts;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SUBSTRING / LEFT / RIGHT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- First/last N characters,SELECT LEFT(sku, 4) AS category_prefix FROM products;,SELECT RIGHT(ssn, 4) AS last_four FROM employees;,\n\n-- Split on delimiter (PostgreSQL),SELECT SPLIT_PART(email, '@', 2) AS domain FROM users;,-- 'alice@gmail.com' → 'gmail.com',\n\n-- MySQL equivalent,SELECT SUBSTRING_INDEX(email, '@', -1) AS domain FROM users;,\n\n-- Extract file extension,SELECT SPLIT_PART(filename, '.', -1) AS ext FROM uploads;"
                  }
        ],
        tips: [
                  "SQL strings are 1-indexed — SUBSTRING(str, 1, 3) gets the first 3 chars",
                  "SPLIT_PART is PostgreSQL; MySQL uses SUBSTRING_INDEX",
                  "LEFT and RIGHT are simpler than SUBSTRING for start/end extraction",
                  "Combine with LENGTH for dynamic slicing: SUBSTRING(str, LENGTH(str) - 3)"
        ],
        mistake: "Using 0-based indexing — SUBSTRING(str, 0, 3) does not behave like most programming languages. SQL is 1-based.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "trim-replace",
        fn: "TRIM / REPLACE / TRANSLATE",
        desc: "Clean and transform string content.",
        category: "Strings",
        subtitle: "Whitespace removal and character replacement",
        signature: "TRIM(str)  |  REPLACE(str, old, new)  |  REGEXP_REPLACE(str, pattern, replacement)",
        descLong: "TRIM removes leading/trailing whitespace (or specified characters). REPLACE swaps all occurrences of a substring. REGEXP_REPLACE uses regex for pattern-based replacement. Essential for data cleaning.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of TRIM / REPLACE / TRANSLATE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Remove whitespace\nSELECT TRIM(name) FROM users;              -- both sides\nSELECT LTRIM(name), RTRIM(name) FROM users; -- one side"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of TRIM / REPLACE / TRANSLATE — common patterns you'll see in production.\n-- APPROACH  - Combine TRIM / REPLACE / TRANSLATE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Remove specific characters\nSELECT TRIM(BOTH '/' FROM '/api/users/')    -- 'api/users'"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of TRIM / REPLACE / TRANSLATE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Replace substrings,SELECT REPLACE(phone, '-', '') AS digits_only,FROM contacts;,-- '555-123-4567' → '5551234567',\n\n-- Regex replace (PostgreSQL),SELECT REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS digits,FROM contacts;,\n\n-- Data cleaning pipeline,SELECT,  TRIM(UPPER(REPLACE(email, ' ', ''))) AS clean_email,,  REGEXP_REPLACE(name, '\\s+', ' ', 'g') AS clean_name,FROM raw_imports;"
                  }
        ],
        tips: [
                  "TRIM(BOTH char FROM str) removes specific characters, not just spaces",
                  "REPLACE is case-sensitive — use LOWER first for case-insensitive replacement",
                  "REGEXP_REPLACE with 'g' flag replaces all occurrences (PostgreSQL)",
                  "Chain string functions for data cleaning pipelines: TRIM → LOWER → REPLACE"
        ],
        mistake: "Assuming TRIM removes all internal whitespace — it only removes leading/trailing. Use REGEXP_REPLACE for internal spaces.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "upper-lower-length",
        fn: "UPPER / LOWER / LENGTH",
        desc: "Case conversion and string measurement.",
        category: "Strings",
        subtitle: "Case transform and length",
        signature: "UPPER(str)  |  LOWER(str)  |  LENGTH(str)  |  CHAR_LENGTH(str)",
        descLong: "UPPER/LOWER convert case for display or comparison. LENGTH returns the number of characters (CHAR_LENGTH in some DBs). OCTET_LENGTH returns bytes — matters for multi-byte encodings like UTF-8.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of UPPER / LOWER / LENGTH — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Case-insensitive search (portable)\nSELECT * FROM users\nWHERE LOWER(email) = LOWER('Alice@Example.COM');"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of UPPER / LOWER / LENGTH — common patterns you'll see in production.\n-- APPROACH  - Combine UPPER / LOWER / LENGTH with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Better: use ILIKE (PostgreSQL) or CI collation\nSELECT * FROM users WHERE email ILIKE 'alice@example.com';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of UPPER / LOWER / LENGTH — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Format display names,SELECT,  UPPER(LEFT(first_name, 1)) || LOWER(SUBSTRING(first_name FROM 2)),  AS proper_name,FROM users;,\n\n-- Validate field lengths,SELECT email, LENGTH(email) AS len,FROM users WHERE LENGTH(email) > 254;,\n\n-- Find overlong fields before migration,SELECT column_name, MAX(LENGTH(column_value)) AS max_len,FROM audit_data GROUP BY column_name;"
                  }
        ],
        tips: [
                  "LOWER(col) = LOWER(val) is portable case-insensitive search",
                  "LENGTH counts characters; OCTET_LENGTH counts bytes (matters for UTF-8)",
                  "Case-insensitive collation on the column is faster than LOWER() in WHERE",
                  "INITCAP(str) capitalizes first letter of each word (PostgreSQL)"
        ],
        mistake: "Using LOWER(indexed_col) in WHERE — this is not sargable and forces a full scan. Create a functional index: CREATE INDEX idx ON t(LOWER(col)).",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "regexp",
        fn: "REGEXP / Pattern Matching",
        desc: "Match and extract using regular expressions.",
        category: "Strings",
        subtitle: "Regex-based pattern matching",
        signature: "col ~ pattern (PG)  |  col REGEXP pattern (MySQL)  |  REGEXP_MATCHES()",
        descLong: "Regular expressions offer powerful pattern matching beyond LIKE. PostgreSQL uses ~ (case-sensitive) and ~* (case-insensitive). MySQL uses REGEXP/RLIKE. REGEXP_MATCHES extracts captures. Always benchmark — regex is expensive on large tables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of REGEXP / Pattern Matching — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- PostgreSQL regex match\nSELECT * FROM users WHERE email ~ '^[a-z]+@gmail\\.com$';"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of REGEXP / Pattern Matching — common patterns you'll see in production.\n-- APPROACH  - Combine REGEXP / Pattern Matching with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Case-insensitive\nSELECT * FROM users WHERE name ~* '^(john|jane)';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of REGEXP / Pattern Matching — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- MySQL REGEXP,SELECT * FROM users WHERE email REGEXP '^[a-z]+@gmail\\.com$';,\n\n-- Extract matches (PostgreSQL),SELECT,  (REGEXP_MATCHES(url, '://([^/]+)'))[1] AS domain,FROM access_logs;,\n\n-- Validate format,SELECT email,,  CASE WHEN email ~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',    THEN 'valid' ELSE 'invalid',  END AS status,FROM users;,\n\n-- Replace with regex,SELECT REGEXP_REPLACE(phone, '(\\d{3})(\\d{3})(\\d{4})', '(\\1) \\2-\\3'),FROM contacts;"
                  }
        ],
        tips: [
                  "PostgreSQL: ~ for case-sensitive, ~* for case-insensitive regex",
                  "MySQL: REGEXP is case-insensitive by default",
                  "Regex on large tables without indexes is very slow — filter first with LIKE, then regex",
                  "REGEXP_MATCHES returns arrays — use [1] to get the first capture group"
        ],
        mistake: "Using regex for simple prefix/suffix matching — LIKE 'prefix%' is orders of magnitude faster and can use indexes.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "string-agg",
        fn: "STRING_AGG / GROUP_CONCAT",
        desc: "Concatenate values from multiple rows into a single string.",
        category: "Strings",
        subtitle: "Aggregate strings across rows",
        signature: "STRING_AGG(col, separator)  |  GROUP_CONCAT(col SEPARATOR ',')",
        descLong: "STRING_AGG (PostgreSQL, SQL Server) and GROUP_CONCAT (MySQL) combine values from multiple rows into a delimited string. Essential for denormalized reports and building comma-separated lists.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of STRING_AGG / GROUP_CONCAT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- PostgreSQL: comma-separated list of skills per employee\nSELECT e.name,\n  STRING_AGG(s.skill_name, ', ' ORDER BY s.skill_name) AS skills\nFROM employees e\nJOIN employee_skills s ON s.employee_id = e.id\nGROUP BY e.name;\n-- 'Alice' → 'Go, Python, SQL'"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of STRING_AGG / GROUP_CONCAT — common patterns you'll see in production.\n-- APPROACH  - Combine STRING_AGG / GROUP_CONCAT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- MySQL equivalent\nSELECT e.name,\n  GROUP_CONCAT(s.skill_name ORDER BY s.skill_name SEPARATOR ', ') AS skills\nFROM employees e\nJOIN employee_skills s ON s.employee_id = e.id\nGROUP BY e.name;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of STRING_AGG / GROUP_CONCAT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- With DISTINCT to remove duplicates,SELECT department,,  STRING_AGG(DISTINCT job_title, ', ') AS titles,FROM employees GROUP BY department;,\n\n-- Build JSON-like output,SELECT customer_id,,  STRING_AGG('\"' || product_name || '\"', ', ') AS products,FROM orders GROUP BY customer_id;"
                  }
        ],
        tips: [
                  "STRING_AGG is PostgreSQL/SQL Server; GROUP_CONCAT is MySQL",
                  "Use ORDER BY inside the aggregate to control result order",
                  "Add DISTINCT to remove duplicate values before concatenation",
                  "Watch for NULL values — they are silently skipped in aggregation"
        ],
        mistake: "Expecting a stable order without ORDER BY — STRING_AGG without ORDER BY returns values in an arbitrary order that may change between runs.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSELECT department, STRING_AGG(name, ', ')\nFROM employees GROUP BY department\n// More explicit but longer",
          concise: "STRING_AGG(name, ',') AS names",
        },
      },
    ],
  },

  // ── Section 7: Date & Time Functions ─────────────────────────────────────────
  {
    id: "date-functions",
    title: "Date & Time Functions",
    entries: [
      {
        id: "now-current",
        fn: "NOW() / CURRENT_TIMESTAMP",
        desc: "Get the current date and time.",
        category: "Date/Time",
        subtitle: "Current timestamp",
        signature: "NOW()  |  CURRENT_TIMESTAMP  |  CURRENT_DATE  |  CURRENT_TIME",
        descLong: "NOW() returns the current transaction timestamp. CURRENT_TIMESTAMP is the SQL standard equivalent. Within a single transaction, NOW() returns the same value — use clock_timestamp() (PostgreSQL) for wall-clock time that advances during the transaction.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of NOW() / CURRENT_TIMESTAMP — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Current timestamp\nSELECT NOW();                    -- 2024-03-15 14:30:45.123456-05\nSELECT CURRENT_TIMESTAMP;        -- standard SQL equivalent\nSELECT CURRENT_DATE;              -- 2024-03-15 (date only)\nSELECT CURRENT_TIME;              -- 14:30:45 (time only)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of NOW() / CURRENT_TIMESTAMP — common patterns you'll see in production.\n-- APPROACH  - Combine NOW() / CURRENT_TIMESTAMP with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- In INSERT/UPDATE (common pattern)\nINSERT INTO audit_log (action, created_at)\nVALUES ('user_login', NOW());\n\nUPDATE users SET last_login = NOW() WHERE id = 42;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of NOW() / CURRENT_TIMESTAMP — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Default column value,CREATE TABLE events (,  id SERIAL PRIMARY KEY,,  name TEXT NOT NULL,,  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),,  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),);,\n\n-- PostgreSQL: wall-clock time (changes during transaction),SELECT clock_timestamp(); -- advances within a transaction"
                  }
        ],
        tips: [
                  "NOW() returns the same value for the entire transaction — consistent for multi-statement operations",
                  "CURRENT_DATE is SQL standard; CURDATE() is MySQL-only",
                  "Use TIMESTAMPTZ (with timezone) not TIMESTAMP to avoid timezone bugs",
                  "clock_timestamp() returns actual wall time — useful for timing within transactions"
        ],
        mistake: "Using TIMESTAMP instead of TIMESTAMPTZ — TIMESTAMP stores no timezone info, so the same timestamp means different moments depending on the server timezone.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "date-trunc",
        fn: "DATE_TRUNC / DATE_FORMAT",
        desc: "Truncate a timestamp to a specific precision (year, month, day, hour).",
        category: "Date/Time",
        subtitle: "Truncate timestamps for grouping",
        signature: "DATE_TRUNC('month', timestamp)  |  DATE_FORMAT(ts, '%Y-%m')",
        descLong: "DATE_TRUNC (PostgreSQL) truncates to the start of the specified unit. DATE_FORMAT (MySQL) formats as a string. Both are essential for time-series grouping — \"daily signups\", \"monthly revenue\", etc.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DATE_TRUNC / DATE_FORMAT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- PostgreSQL: truncate to month start\nSELECT DATE_TRUNC('month', created_at) AS month,\n  COUNT(*) AS signups\nFROM users\nGROUP BY DATE_TRUNC('month', created_at)\nORDER BY month;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DATE_TRUNC / DATE_FORMAT — common patterns you'll see in production.\n-- APPROACH  - Combine DATE_TRUNC / DATE_FORMAT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- MySQL: format to year-month string\nSELECT DATE_FORMAT(created_at, '%Y-%m') AS month,\n  COUNT(*) AS signups\nFROM users\nGROUP BY DATE_FORMAT(created_at, '%Y-%m')\nORDER BY month;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DATE_TRUNC / DATE_FORMAT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Truncate precision options,SELECT,  DATE_TRUNC('year', ts)    AS year_start,   -- 2024-01-01,  DATE_TRUNC('quarter', ts) AS quarter_start, -- 2024-04-01,  DATE_TRUNC('month', ts)   AS month_start,  -- 2024-06-01,  DATE_TRUNC('week', ts)    AS week_start,   -- 2024-06-10 (Monday),  DATE_TRUNC('day', ts)     AS day_start,    -- 2024-06-15,  DATE_TRUNC('hour', ts)    AS hour_start    -- 2024-06-15 14:00:00,FROM (SELECT '2024-06-15 14:30:45'::TIMESTAMPTZ AS ts) t;"
                  }
        ],
        tips: [
                  "DATE_TRUNC is PostgreSQL; MySQL uses DATE_FORMAT for grouping",
                  "DATE_TRUNC('week') starts on Monday by default in PostgreSQL",
                  "Always GROUP BY the same expression used in SELECT — no aliases in GROUP BY",
                  "For daily grouping: DATE_TRUNC('day', ts) or DATE(ts)"
        ],
        mistake: "Grouping by a formatted date string in MySQL but ordering by the timestamp — results may not sort correctly. GROUP BY and ORDER BY the same expression.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "date-arithmetic",
        fn: "DATE_ADD / INTERVAL",
        desc: "Add or subtract time from dates.",
        category: "Date/Time",
        subtitle: "Date arithmetic with intervals",
        signature: "ts + INTERVAL '7 days'  |  DATE_ADD(ts, INTERVAL 7 DAY)",
        descLong: "INTERVAL represents a duration. PostgreSQL uses + operator with INTERVAL. MySQL uses DATE_ADD/DATE_SUB functions. Intervals can be years, months, days, hours, minutes, or seconds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DATE_ADD / INTERVAL — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- PostgreSQL: add/subtract intervals\nSELECT NOW() + INTERVAL '7 days' AS next_week;\nSELECT NOW() - INTERVAL '30 days' AS last_month;\nSELECT NOW() + INTERVAL '2 hours 30 minutes';"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DATE_ADD / INTERVAL — common patterns you'll see in production.\n-- APPROACH  - Combine DATE_ADD / INTERVAL with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- MySQL: DATE_ADD / DATE_SUB\nSELECT DATE_ADD(NOW(), INTERVAL 7 DAY) AS next_week;\nSELECT DATE_SUB(NOW(), INTERVAL 1 MONTH) AS last_month;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DATE_ADD / INTERVAL — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Real use: find records from last 24 hours,SELECT * FROM events,WHERE created_at >= NOW() - INTERVAL '24 hours';,\n\n-- Subscription expiration check,SELECT user_id, plan_name,,  subscription_end,,  subscription_end - NOW() AS time_remaining,,  CASE WHEN subscription_end < NOW() THEN 'expired',       WHEN subscription_end < NOW() + INTERVAL '7 days' THEN 'expiring_soon',       ELSE 'active',  END AS status,FROM subscriptions;"
                  }
        ],
        tips: [
                  "PostgreSQL: use + INTERVAL 'N unit'; MySQL: use DATE_ADD()",
                  "INTERVAL supports compound durations: '2 years 3 months 15 days'",
                  "For recurring events: generate dates with generate_series + interval",
                  "Always compare timestamps with >= and < (not BETWEEN) to avoid off-by-one"
        ],
        mistake: "Adding months naively — adding 1 month to Jan 31 gives Feb 28/29, not Mar 3. The database handles month-end correctly but the result may surprise you.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "extract",
        fn: "EXTRACT / DATEPART",
        desc: "Get a specific component (year, month, day, hour) from a timestamp.",
        category: "Date/Time",
        subtitle: "Extract date/time components",
        signature: "EXTRACT(YEAR FROM ts)  |  DATEPART(year, ts)",
        descLong: "EXTRACT pulls individual fields from a date/timestamp. Standard SQL uses EXTRACT; SQL Server uses DATEPART. Common extractions: year, month, day, hour, minute, dow (day of week), epoch (Unix timestamp).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of EXTRACT / DATEPART — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Standard SQL (PostgreSQL, MySQL 8+)\nSELECT\n  EXTRACT(YEAR FROM created_at) AS yr,\n  EXTRACT(MONTH FROM created_at) AS mo,\n  EXTRACT(DAY FROM created_at) AS dy,\n  EXTRACT(HOUR FROM created_at) AS hr,\n  EXTRACT(DOW FROM created_at) AS day_of_week  -- 0=Sun, 6=Sat\nFROM events;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of EXTRACT / DATEPART — common patterns you'll see in production.\n-- APPROACH  - Combine EXTRACT / DATEPART with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Weekday-only filter (Mon-Fri)\nSELECT * FROM orders\nWHERE EXTRACT(DOW FROM order_date) BETWEEN 1 AND 5;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of EXTRACT / DATEPART — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Convert to Unix timestamp,SELECT EXTRACT(EPOCH FROM NOW())::BIGINT AS unix_ts;,\n\n-- Group by day of week (busiest days),SELECT,  TO_CHAR(created_at, 'Day') AS weekday,,  EXTRACT(DOW FROM created_at) AS dow,,  COUNT(*) AS orders,FROM orders,GROUP BY 1, 2 ORDER BY 2;,\n\n-- Age calculation,SELECT name,,  EXTRACT(YEAR FROM AGE(birth_date)) AS age,FROM users;"
                  }
        ],
        tips: [
                  "EXTRACT(DOW) returns 0-6 in PostgreSQL (Sunday=0); MySQL DAYOFWEEK returns 1-7 (Sunday=1)",
                  "EXTRACT(EPOCH FROM interval) converts intervals to seconds",
                  "TO_CHAR(ts, 'Day') gives the day name; EXTRACT gives the number",
                  "EXTRACT from INTERVAL works too: EXTRACT(HOURS FROM '3:30'::INTERVAL) = 3"
        ],
        mistake: "WHERE EXTRACT(YEAR FROM ts) = 2024 is NOT sargable — it scans every row. Use WHERE ts >= '2024-01-01' AND ts < '2025-01-01' instead.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "date-diff",
        fn: "AGE / DATEDIFF",
        desc: "Calculate the difference between two dates.",
        category: "Date/Time",
        subtitle: "Time elapsed between dates",
        signature: "AGE(ts1, ts2)  |  DATEDIFF(unit, start, end)  |  ts1 - ts2",
        descLong: "PostgreSQL uses AGE() for human-readable intervals and direct subtraction for days. MySQL uses DATEDIFF for day counts and TIMESTAMPDIFF for other units. SQL Server uses DATEDIFF with a unit parameter.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of AGE / DATEDIFF — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- PostgreSQL: human-readable age\nSELECT AGE(NOW(), hire_date) AS tenure FROM employees;\n-- '3 years 2 mons 15 days'"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of AGE / DATEDIFF — common patterns you'll see in production.\n-- APPROACH  - Combine AGE / DATEDIFF with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- PostgreSQL: days between dates\nSELECT order_date, ship_date,\n  ship_date - order_date AS days_to_ship\nFROM orders;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of AGE / DATEDIFF — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- PostgreSQL: extract specific unit from interval,SELECT name,,  EXTRACT(YEAR FROM AGE(birth_date)) AS age_years,FROM users;,\n\n-- MySQL: DATEDIFF (days only),SELECT DATEDIFF(ship_date, order_date) AS days_to_ship,FROM orders;,\n\n-- MySQL: TIMESTAMPDIFF (any unit),SELECT TIMESTAMPDIFF(MONTH, hire_date, NOW()) AS months_employed,FROM employees;,\n\n-- Real use: customer retention cohort,SELECT,  DATE_TRUNC('month', first_order) AS cohort,,  DATE_TRUNC('month', order_date) AS activity_month,,  COUNT(DISTINCT customer_id) AS active_customers,FROM orders,GROUP BY 1, 2 ORDER BY 1, 2;"
                  }
        ],
        tips: [
                  "PostgreSQL: direct subtraction (date1 - date2) returns an integer (days) for DATE type",
                  "AGE() returns a human-readable INTERVAL — extract specific units with EXTRACT",
                  "MySQL DATEDIFF returns days only — use TIMESTAMPDIFF for months, years, hours",
                  "For business days: exclude weekends with EXTRACT(DOW) filtering"
        ],
        mistake: "Using DATEDIFF for precise time differences — it counts calendar boundaries, not elapsed time. DATEDIFF(day, '2024-01-01 23:59', '2024-01-02 00:01') = 1 day, but only 2 minutes elapsed.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "generate-series",
        fn: "GENERATE_SERIES",
        desc: "Create a sequence of dates, numbers, or timestamps — the foundation for gap analysis.",
        category: "Date/Time",
        subtitle: "Generate rows from a sequence",
        signature: "GENERATE_SERIES(start, stop, step)",
        descLong: "GENERATE_SERIES creates a set of rows from start to stop with a given step. Invaluable for creating calendar tables, filling date gaps in time-series data, and generating test data. PostgreSQL-native; MySQL uses recursive CTEs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of GENERATE_SERIES — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Generate a date range (calendar table)\nSELECT d::DATE AS date\nFROM GENERATE_SERIES(\n  '2024-01-01'::DATE,\n  '2024-12-31'::DATE,\n  '1 day'::INTERVAL\n) AS d;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of GENERATE_SERIES — common patterns you'll see in production.\n-- APPROACH  - Combine GENERATE_SERIES with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Fill gaps in daily revenue (LEFT JOIN to calendar)\nSELECT cal.date, COALESCE(SUM(o.amount), 0) AS revenue\nFROM GENERATE_SERIES(\n  '2024-01-01'::DATE, '2024-01-31'::DATE, '1 day'\n) AS cal(date)\nLEFT JOIN orders o ON DATE(o.created_at) = cal.date\nGROUP BY cal.date ORDER BY cal.date;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of GENERATE_SERIES — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Number sequence,SELECT * FROM GENERATE_SERIES(1, 100) AS n;,\n\n-- MySQL equivalent: recursive CTE,WITH RECURSIVE dates AS (,  SELECT '2024-01-01'::DATE AS d,  UNION ALL,  SELECT d + INTERVAL '1 day' FROM dates WHERE d < '2024-12-31',),SELECT d FROM dates;"
                  }
        ],
        tips: [
                  "GENERATE_SERIES + LEFT JOIN is the pattern for finding missing dates in time-series",
                  "Step can be any interval: '1 hour', '15 minutes', '1 week'",
                  "MySQL lacks GENERATE_SERIES — use a recursive CTE or a numbers table",
                  "Use for test data generation: GENERATE_SERIES(1, 1000000) creates 1M rows instantly"
        ],
        mistake: "Reporting revenue as $0 for missing dates when the date simply had no orders. Without GENERATE_SERIES + LEFT JOIN, those dates are invisible in the result set.",
        shorthand: {
          verbose: "SELECT d FROM GENERATE_SERIES(\n  '2024-01-01'::DATE,\n  '2024-12-31'::DATE,\n  '1 day')",
          concise: "SELECT d FROM GENERATE_SERIES('2024-01-01'::DATE, '2024-12-31'::DATE, '1 day')",
        },
      },
    ],
  },

  // ── Section 8: JSON Operations ─────────────────────────────────────────
  {
    id: "json-ops",
    title: "JSON Operations",
    entries: [
      {
        id: "json-access",
        fn: "JSON Access (-> / ->>)",
        desc: "Extract values from JSON columns using path operators.",
        category: "JSON",
        subtitle: "Navigate JSON with path operators",
        signature: "col -> 'key'  (JSON)  |  col ->> 'key'  (text)  |  col -> 0  (array index)",
        descLong: "-> returns a JSON value (object/array). ->> returns the value as text. Chain operators to navigate nested structures. PostgreSQL uses -> and ->>; MySQL uses JSON_EXTRACT and ->>. JSONB is the preferred type in PostgreSQL (binary, indexable).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of JSON Access (-> / ->>) — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- PostgreSQL: extract from JSONB column\nSELECT\n  metadata ->> 'name' AS name,           -- text value\n  metadata -> 'address' ->> 'city' AS city, -- nested access\n  (metadata -> 'tags' -> 0) AS first_tag   -- array index\nFROM users;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of JSON Access (-> / ->>) — common patterns you'll see in production.\n-- APPROACH  - Combine JSON Access (-> / ->>) with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- MySQL: JSON_EXTRACT\nSELECT\n  JSON_EXTRACT(metadata, '$.name') AS name,\n  JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.address.city')) AS city\nFROM users;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of JSON Access (-> / ->>) — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- MySQL shorthand (5.7+),SELECT metadata ->> '$.name' AS name FROM users;,\n\n-- Filter on JSON values,SELECT * FROM products,WHERE metadata ->> 'category' = 'electronics',  AND (metadata -> 'specs' ->> 'weight_kg')::NUMERIC < 2.0;,\n\n-- Index JSON paths for performance (PostgreSQL),CREATE INDEX idx_category ON products ((metadata ->> 'category'));,CREATE INDEX idx_gin ON products USING GIN (metadata);"
                  }
        ],
        tips: [
                  "-> returns JSON type; ->> returns TEXT — use ->> for comparisons and display",
                  "Cast ->> results: (col ->> 'price')::NUMERIC for math operations",
                  "GIN index on JSONB enables @> (contains) operator for fast lookups",
                  "PostgreSQL: use JSONB not JSON — JSONB is binary, indexable, and deduplicates keys"
        ],
        mistake: "Comparing JSON values without ->> — col -> 'key' = 'value' compares JSON types, not strings. Use col ->> 'key' = 'value' for text comparison.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "json-build",
        fn: "JSON_BUILD_OBJECT / JSON_AGG",
        desc: "Construct JSON objects and arrays from SQL query results.",
        category: "JSON",
        subtitle: "Build JSON from rows and columns",
        signature: "JSON_BUILD_OBJECT('key', val, ...)  |  JSON_AGG(expression)",
        descLong: "JSON_BUILD_OBJECT creates a JSON object from key-value pairs. JSON_AGG aggregates rows into a JSON array. JSONB_AGG is the binary variant. These functions let you return complex nested JSON directly from SQL — no application-layer assembly needed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of JSON_BUILD_OBJECT / JSON_AGG — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Build JSON object from columns\nSELECT JSON_BUILD_OBJECT(\n  'id', u.id,\n  'name', u.name,\n  'email', u.email,\n  'created', u.created_at\n) AS user_json\nFROM users u WHERE u.id = 1;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of JSON_BUILD_OBJECT / JSON_AGG — common patterns you'll see in production.\n-- APPROACH  - Combine JSON_BUILD_OBJECT / JSON_AGG with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Aggregate rows into JSON array\nSELECT JSON_AGG(\n  JSON_BUILD_OBJECT('id', id, 'name', name)\n) AS all_users\nFROM users WHERE status = 'active';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of JSON_BUILD_OBJECT / JSON_AGG — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Nested: users with their orders as JSON array,SELECT u.id, u.name,,  COALESCE(,    JSON_AGG(,      JSON_BUILD_OBJECT('order_id', o.id, 'total', o.total),    ) FILTER (WHERE o.id IS NOT NULL),,    '[]'::JSON,  ) AS orders,FROM users u,LEFT JOIN orders o ON o.user_id = u.id,GROUP BY u.id, u.name;,\n\n-- MySQL: JSON_OBJECT and JSON_ARRAYAGG,SELECT JSON_OBJECT('id', id, 'name', name) AS user_json,FROM users;"
                  }
        ],
        tips: [
                  "JSON_AGG + GROUP BY builds nested arrays — replace N+1 queries",
                  "FILTER (WHERE ...) prevents null entries when using LEFT JOIN with JSON_AGG",
                  "COALESCE(JSON_AGG(...), '[]') returns empty array instead of NULL for no matches",
                  "PostgreSQL: ROW_TO_JSON(row) converts an entire row to JSON"
        ],
        mistake: "JSON_AGG with LEFT JOIN includes NULL entries — use FILTER (WHERE col IS NOT NULL) or COALESCE to get clean arrays.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "jsonb-contains",
        fn: "JSONB Contains (@>)",
        desc: "Check if a JSONB value contains another — powerful for filtering and indexing.",
        category: "JSON",
        subtitle: "Containment queries on JSONB",
        signature: "col @> '{\"key\": \"value\"}'  |  col ? 'key'  |  col ?| ARRAY['a','b']",
        descLong: "JSONB containment operators allow efficient querying of JSON data. @> checks if left contains right. ? checks if a key exists. ?| checks if any of the keys exist. ?& checks if all keys exist. All operators can use GIN indexes for fast lookups.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of JSONB Contains (@>) — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Contains: find users with specific metadata\nSELECT * FROM users\nWHERE metadata @> '{\"role\": \"admin\", \"verified\": true}';"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of JSONB Contains (@>) — common patterns you'll see in production.\n-- APPROACH  - Combine JSONB Contains (@>) with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Key existence\nSELECT * FROM products WHERE specs ? 'bluetooth';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of JSONB Contains (@>) — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Any of these keys exist,SELECT * FROM products WHERE specs ?| ARRAY['bluetooth', 'wifi', 'nfc'];,\n\n-- All of these keys exist,SELECT * FROM products WHERE specs ?& ARRAY['cpu', 'ram', 'storage'];,\n\n-- Combine with text extraction,SELECT name, specs ->> 'cpu' AS cpu,FROM products,WHERE specs @> '{\"brand\": \"Apple\"}',  AND (specs ->> 'ram_gb')::INT >= 16;,\n\n-- GIN index makes @> and ? operators fast,CREATE INDEX idx_specs ON products USING GIN (specs);"
                  }
        ],
        tips: [
                  "@> is GIN-indexable — far faster than ->> comparisons on large tables",
                  "? checks for key existence without caring about the value",
                  "Cast ->> to NUMERIC/INT for range queries on JSON values",
                  "JSONB_EACH and JSONB_ARRAY_ELEMENTS expand JSON for row-level processing"
        ],
        mistake: "Using ->> comparisons without an index when @> with a GIN index would be much faster — @> '{\"status\": \"active\"}' uses the GIN index.",
        shorthand: {
          verbose: "SELECT name, specs ->> 'cpu' AS cpu\nFROM products\nWHERE specs @> '{\"brand\": \"Apple\"}'",
          concise: "specs @> '{\"brand\": \"Apple\"}'",
        },
      },
    ],
  },

  // ── Section 9: Advanced Aggregates & Patterns ─────────────────────────────────────────
  {
    id: "advanced-aggregates",
    title: "Advanced Aggregates & Patterns",
    entries: [
      {
        id: "min-max",
        fn: "MIN() / MAX()",
        desc: "Find the smallest or largest value in a column.",
        category: "Aggregates",
        subtitle: "Extreme values in a group",
        signature: "MIN(col)  |  MAX(col)",
        descLong: "MIN/MAX work on any comparable type: numbers, strings, dates. They ignore NULLs. Combined with GROUP BY, they find extremes per group. On indexed columns, MIN/MAX can be resolved from the index without scanning.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of MIN() / MAX() — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Basic: salary range\nSELECT\n  MIN(salary) AS lowest,\n  MAX(salary) AS highest,\n  MAX(salary) - MIN(salary) AS salary_range\nFROM employees;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of MIN() / MAX() — common patterns you'll see in production.\n-- APPROACH  - Combine MIN() / MAX() with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Per group: newest and oldest order per customer\nSELECT customer_id,\n  MIN(order_date) AS first_order,\n  MAX(order_date) AS last_order,\n  MAX(order_date) - MIN(order_date) AS customer_lifetime\nFROM orders GROUP BY customer_id;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of MIN() / MAX() — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- With dates: latest login per user,SELECT user_id, MAX(login_at) AS last_seen,FROM sessions GROUP BY user_id;,\n\n-- MIN/MAX on strings (alphabetical),SELECT MIN(name) AS first_alpha, MAX(name) AS last_alpha,FROM employees;,\n\n-- Conditional MIN/MAX,SELECT department,,  MAX(salary) FILTER (WHERE gender = 'F') AS top_female_salary,,  MAX(salary) FILTER (WHERE gender = 'M') AS top_male_salary,FROM employees GROUP BY department;"
                  }
        ],
        tips: [
                  "MIN/MAX on an indexed column is resolved instantly (index scan, not table scan)",
                  "Both ignore NULLs — use COALESCE if NULLs should be treated as a specific value",
                  "FILTER clause (PostgreSQL) enables conditional MIN/MAX in one pass",
                  "For the row with the MAX/MIN value, use ROW_NUMBER or DISTINCT ON"
        ],
        mistake: "Selecting non-aggregated columns alongside MIN/MAX without GROUP BY — the other columns come from an arbitrary row, NOT the row with the min/max value.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "array-agg",
        fn: "ARRAY_AGG",
        desc: "Collect values from multiple rows into an array.",
        category: "Aggregates",
        subtitle: "Aggregate rows into arrays",
        signature: "ARRAY_AGG(col ORDER BY col)  →  ARRAY[val1, val2, ...]",
        descLong: "ARRAY_AGG (PostgreSQL) collects values into a native array. Supports ORDER BY and DISTINCT within the aggregate. Useful for building denormalized results, passing to array-accepting functions, and avoiding N+1 queries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ARRAY_AGG — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Collect tags per product\nSELECT p.name,\n  ARRAY_AGG(DISTINCT t.tag ORDER BY t.tag) AS tags\nFROM products p\nJOIN product_tags t ON t.product_id = p.id\nGROUP BY p.name;\n-- 'Laptop' → {bluetooth, portable, usb-c}"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ARRAY_AGG — common patterns you'll see in production.\n-- APPROACH  - Combine ARRAY_AGG with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Use with ANY for IN-like queries on arrays\nSELECT * FROM products\nWHERE 'bluetooth' = ANY(\n  SELECT UNNEST(ARRAY_AGG(tag)) FROM product_tags WHERE product_id = products.id\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ARRAY_AGG — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Aggregate into arrays then use array functions,SELECT department,,  ARRAY_AGG(salary ORDER BY salary DESC) AS salaries,,  ARRAY_LENGTH(ARRAY_AGG(salary), 1) AS count,FROM employees GROUP BY department;,\n\n-- Combine with UNNEST to expand arrays back to rows,SELECT id, UNNEST(tags) AS tag FROM products;"
                  }
        ],
        tips: [
                  "ARRAY_AGG + UNNEST is the PostgreSQL idiom for array-based operations",
                  "ORDER BY inside ARRAY_AGG controls the array element order",
                  "DISTINCT removes duplicates before aggregation",
                  "MySQL lacks ARRAY_AGG — use JSON_ARRAYAGG instead"
        ],
        mistake: "Forgetting that ARRAY_AGG includes NULLs — unlike COUNT/SUM/AVG, it does not skip them. Use ARRAY_AGG(col) FILTER (WHERE col IS NOT NULL).",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "grouping-sets",
        fn: "GROUPING SETS / ROLLUP / CUBE",
        desc: "Multiple levels of aggregation in a single query.",
        category: "Aggregates",
        subtitle: "Multi-level summaries in one pass",
        signature: "GROUP BY ROLLUP(a, b)  |  GROUP BY CUBE(a, b)  |  GROUP BY GROUPING SETS((a), (b), ())",
        descLong: "GROUPING SETS produce multiple levels of aggregation in one query. ROLLUP creates subtotals and a grand total. CUBE creates all possible grouping combinations. These replace multiple UNION ALL queries for dashboard-style reports.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of GROUPING SETS / ROLLUP / CUBE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ROLLUP: subtotals + grand total\nSELECT\n  COALESCE(region, 'ALL REGIONS') AS region,\n  COALESCE(department, 'ALL DEPTS') AS department,\n  SUM(salary) AS total_salary,\n  COUNT(*) AS headcount\nFROM employees\nGROUP BY ROLLUP(region, department)\nORDER BY region NULLS LAST, department NULLS LAST;\n-- Output:\n-- East | Engineering | 500000 | 5\n-- East | Sales       | 300000 | 4\n-- East | ALL DEPTS   | 800000 | 9   ← subtotal\n-- West | ...\n-- ALL REGIONS | ALL DEPTS | 2000000 | 25  ← grand total"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of GROUPING SETS / ROLLUP / CUBE — common patterns you'll see in production.\n-- APPROACH  - Combine GROUPING SETS / ROLLUP / CUBE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- CUBE: all combinations\nGROUP BY CUBE(region, department)\n-- Adds: ALL REGIONS | Engineering, ALL REGIONS | Sales, etc."
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of GROUPING SETS / ROLLUP / CUBE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- GROUPING SETS: explicit control,GROUP BY GROUPING SETS (,  (region, department),  -- detail,  (region),              -- region subtotal,  ()                     -- grand total,),\n\n-- Identify summary rows,SELECT,  CASE WHEN GROUPING(department) = 1 THEN 'Subtotal' ELSE department END,,  SUM(salary),FROM employees GROUP BY ROLLUP(department);"
                  }
        ],
        tips: [
                  "ROLLUP(a, b) = GROUPING SETS((a,b), (a), ()) — hierarchical subtotals",
                  "CUBE(a, b) = GROUPING SETS((a,b), (a), (b), ()) — all combinations",
                  "GROUPING(col) returns 1 for summary rows — use to label subtotals",
                  "Replaces multiple UNION ALL queries — much more efficient for dashboard reports"
        ],
        mistake: "Not using COALESCE or GROUPING() to label summary rows — they show NULL for the rolled-up column, which looks like missing data.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "lateral-join",
        fn: "LATERAL JOIN",
        desc: "A subquery that can reference columns from preceding tables — like a for-each loop in SQL.",
        category: "Advanced",
        subtitle: "Correlated subquery as a join",
        signature: "FROM table1 t1, LATERAL (SELECT ... WHERE ... = t1.col) sub",
        descLong: "LATERAL allows a subquery in FROM to reference columns from preceding tables. Think of it as \"for each row in the left table, run this subquery\". Replaces correlated subqueries with better performance and readability. SQL Server calls this CROSS APPLY / OUTER APPLY.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LATERAL JOIN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Top 3 orders per customer (classic LATERAL pattern)\nSELECT c.name, top_orders.*\nFROM customers c,\nLATERAL (\n  SELECT o.id, o.total, o.order_date\n  FROM orders o\n  WHERE o.customer_id = c.id\n  ORDER BY o.total DESC\n  LIMIT 3\n) AS top_orders;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LATERAL JOIN — common patterns you'll see in production.\n-- APPROACH  - Combine LATERAL JOIN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- SQL Server equivalent: CROSS APPLY\nSELECT c.name, top_orders.*\nFROM customers c\nCROSS APPLY (\n  SELECT TOP 3 o.id, o.total\n  FROM orders o WHERE o.customer_id = c.id\n  ORDER BY o.total DESC\n) AS top_orders;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LATERAL JOIN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Expand JSON arrays into rows,SELECT u.name, tag.value AS tag,FROM users u,,LATERAL JSONB_ARRAY_ELEMENTS_TEXT(u.metadata -> 'tags') AS tag(value);,\n\n-- OUTER APPLY: keep rows with no matches (like LEFT JOIN),SELECT c.name, latest.*,FROM customers c,LEFT JOIN LATERAL (,  SELECT * FROM orders WHERE customer_id = c.id,  ORDER BY order_date DESC LIMIT 1,) AS latest ON true;"
                  }
        ],
        tips: [
                  "LATERAL = \"for each row, run this subquery\" — more readable than correlated subqueries",
                  "Use LEFT JOIN LATERAL ... ON true for optional matches (like LEFT JOIN behavior)",
                  "SQL Server: CROSS APPLY = LATERAL; OUTER APPLY = LEFT JOIN LATERAL",
                  "LATERAL + LIMIT is the efficient pattern for \"top-N per group\""
        ],
        mistake: "Using a correlated subquery in SELECT when LATERAL would be clearer and allow multiple columns to be returned.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "merge-upsert",
        fn: "MERGE / ON CONFLICT",
        desc: "Insert a row or update it if it already exists — atomic upsert.",
        category: "Advanced",
        subtitle: "Atomic insert-or-update",
        signature: "INSERT ... ON CONFLICT DO UPDATE  |  MERGE INTO ... WHEN MATCHED/NOT MATCHED",
        descLong: "Upsert combines INSERT and UPDATE into one atomic operation. PostgreSQL uses INSERT ... ON CONFLICT. MySQL uses INSERT ... ON DUPLICATE KEY UPDATE. SQL Server and standard SQL use MERGE. Essential for idempotent data loading and syncing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of MERGE / ON CONFLICT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- PostgreSQL: ON CONFLICT (most common)\nINSERT INTO user_settings (user_id, theme, notifications)\nVALUES (42, 'dark', true)\nON CONFLICT (user_id)\nDO UPDATE SET\n  theme = EXCLUDED.theme,\n  notifications = EXCLUDED.notifications,\n  updated_at = NOW();"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of MERGE / ON CONFLICT — common patterns you'll see in production.\n-- APPROACH  - Combine MERGE / ON CONFLICT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- MySQL: ON DUPLICATE KEY UPDATE\nINSERT INTO user_settings (user_id, theme)\nVALUES (42, 'dark')\nON DUPLICATE KEY UPDATE theme = VALUES(theme);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of MERGE / ON CONFLICT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- SQL Standard MERGE (SQL Server, Oracle, PostgreSQL 15+),MERGE INTO inventory AS target,USING staging_data AS source,ON target.sku = source.sku,WHEN MATCHED THEN,  UPDATE SET quantity = source.quantity, updated_at = NOW(),WHEN NOT MATCHED THEN,  INSERT (sku, name, quantity),  VALUES (source.sku, source.name, source.quantity);,\n\n-- Bulk upsert from staging table (PostgreSQL),INSERT INTO products (sku, name, price),SELECT sku, name, price FROM staging_products,ON CONFLICT (sku),DO UPDATE SET,  price = EXCLUDED.price,,  name = EXCLUDED.name;"
                  }
        ],
        tips: [
                  "EXCLUDED refers to the row that was proposed for insertion (PostgreSQL)",
                  "ON CONFLICT requires a unique constraint or unique index on the conflict columns",
                  "MERGE can handle INSERT, UPDATE, and DELETE in one statement",
                  "Bulk upsert from a staging table is the pattern for ETL data loads"
        ],
        mistake: "Not specifying the conflict target — ON CONFLICT without (column) or ON CONSTRAINT name will error. You must tell PostgreSQL which unique constraint to check.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "distinct-on",
        fn: "DISTINCT ON / FIRST_VALUE",
        desc: "Select the first row per group — deduplication without subqueries.",
        category: "Advanced",
        subtitle: "First row per group (PostgreSQL)",
        signature: "SELECT DISTINCT ON (col) ... ORDER BY col, sort_col",
        descLong: "DISTINCT ON (PostgreSQL-only) returns the first row for each distinct value of the specified columns. The ORDER BY determines which row is \"first\". More efficient than ROW_NUMBER() for simple cases. FIRST_VALUE is the window function equivalent for other databases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DISTINCT ON / FIRST_VALUE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- PostgreSQL DISTINCT ON: latest order per customer\nSELECT DISTINCT ON (customer_id)\n  customer_id, id AS order_id, total, order_date\nFROM orders\nORDER BY customer_id, order_date DESC;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DISTINCT ON / FIRST_VALUE — common patterns you'll see in production.\n-- APPROACH  - Combine DISTINCT ON / FIRST_VALUE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Equivalent using ROW_NUMBER (portable across DBs)\nWITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY customer_id ORDER BY order_date DESC\n  ) AS rn\n  FROM orders\n)\nSELECT * FROM ranked WHERE rn = 1;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DISTINCT ON / FIRST_VALUE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- FIRST_VALUE window function,SELECT DISTINCT customer_id,,  FIRST_VALUE(order_date) OVER (,    PARTITION BY customer_id ORDER BY order_date DESC,  ) AS latest_order_date,FROM orders;,\n\n-- Deduplicate imported data: keep first occurrence,SELECT DISTINCT ON (email) *,FROM raw_imports,ORDER BY email, imported_at ASC;"
                  }
        ],
        tips: [
                  "DISTINCT ON is PostgreSQL-only but extremely concise for \"first row per group\"",
                  "ORDER BY must start with the DISTINCT ON columns",
                  "ROW_NUMBER + CTE is the portable alternative for other databases",
                  "FIRST_VALUE/LAST_VALUE are window function alternatives"
        ],
        mistake: "Using DISTINCT ON without ORDER BY that starts with the DISTINCT ON columns — the \"first\" row per group becomes arbitrary.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
    ],
  },

  // ── Section 10: Constraints & Keys ─────────────────────────────────────────
  {
    id: "constraints-keys",
    title: "Constraints & Keys",
    entries: [
      {
        id: "primary-key",
        fn: "PRIMARY KEY",
        desc: "Uniquely identifies each row in a table; enforces uniqueness and non-null.",
        category: "Constraints & Keys",
        subtitle: "Define single-column or composite unique identifiers",
        signature: "PRIMARY KEY (column) or PRIMARY KEY (col1, col2)",
        descLong: "A PRIMARY KEY constraint uniquely identifies each row and prevents duplicates. Enforces non-null and unique automatically. Single-column keys use SERIAL or IDENTITY for auto-increment. Composite keys use multiple columns together. Every table should have a primary key. Databases create an index automatically, improving query performance on lookups.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of PRIMARY KEY — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 1. Single-column primary key with auto-increment (PostgreSQL)\nCREATE TABLE employees (\n  employee_id SERIAL PRIMARY KEY,\n  first_name VARCHAR(100) NOT NULL,\n  last_name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE,\n  hire_date DATE NOT NULL\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of PRIMARY KEY — common patterns you'll see in production.\n-- APPROACH  - Combine PRIMARY KEY with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- 2. Single-column primary key with IDENTITY (SQL Server / PostgreSQL 10+)\nCREATE TABLE products (\n  product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  product_name VARCHAR(255) NOT NULL,\n  category_id INT NOT NULL,\n  price DECIMAL(10, 2)\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of PRIMARY KEY — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 3. Composite primary key (multiple columns together identify a row),CREATE TABLE order_items (,  order_id INT NOT NULL,,  product_id INT NOT NULL,,  quantity INT NOT NULL,,  unit_price DECIMAL(10, 2),,  PRIMARY KEY (order_id, product_id),);,\n\n-- 4. Table-level constraint syntax (alternative notation),CREATE TABLE departments (,  department_id INT NOT NULL,,  department_name VARCHAR(100) NOT NULL,,  manager_id INT,,  budget DECIMAL(12, 2),,  CONSTRAINT pk_departments PRIMARY KEY (department_id),);,\n\n-- 5. Inserting into table with auto-increment,INSERT INTO employees (first_name, last_name, email, hire_date),VALUES ('John', 'Doe', 'john.doe@company.com', '2026-01-15');,-- employee_id is generated automatically,\n\n-- 6. Composite key query pattern,SELECT * FROM order_items,WHERE order_id = 1001 AND product_id = 5;"
                  }
        ],
        tips: [
                  "Use SERIAL (PostgreSQL) or IDENTITY (SQL Server) for auto-incrementing single-column keys — simplifies insert operations",
                  "Composite keys work best with natural relationships (order_id + line_number) or when surrogate keys aren't practical",
                  "Primary key automatically creates an index — no need to add a separate index on the primary key column(s)",
                  "Name constraints explicitly (e.g., CONSTRAINT pk_tablename) for clarity in error messages and schema documentation"
        ],
        mistake: "Allowing NULL in a primary key (not enforced by some databases during creation, but violates relational rules). Using non-stable values as primary key (phone numbers, email addresses change). Creating a primary key on a column that might need updates later — primary keys should be immutable or rarely change.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "foreign-key",
        fn: "FOREIGN KEY / REFERENCES",
        desc: "Enforces referential integrity by ensuring values reference valid rows in another table.",
        category: "Constraints & Keys",
        subtitle: "Link tables and maintain data consistency with referenced keys",
        signature: "FOREIGN KEY (column) REFERENCES parent_table(column)",
        descLong: "A FOREIGN KEY constraint ensures that values in one table match values in another table's primary key. Maintains referential integrity — prevents orphaned records. Can reference single or composite keys. Improves query planning and prevents invalid data. Cascading rules (CASCADE, SET NULL, RESTRICT) control what happens to child rows when parent rows are deleted or updated.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of FOREIGN KEY / REFERENCES — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 1. Basic single-column foreign key\nCREATE TABLE employees (\n  employee_id SERIAL PRIMARY KEY,\n  first_name VARCHAR(100) NOT NULL,\n  department_id INT NOT NULL,\n  manager_id INT,\n  FOREIGN KEY (department_id) REFERENCES departments(department_id)\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of FOREIGN KEY / REFERENCES — common patterns you'll see in production.\n-- APPROACH  - Combine FOREIGN KEY / REFERENCES with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- 2. Self-referencing foreign key (employee has a manager)\nALTER TABLE employees\nADD CONSTRAINT fk_manager\nFOREIGN KEY (manager_id) REFERENCES employees(employee_id);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of FOREIGN KEY / REFERENCES — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 3. Composite foreign key (order_items references orders),CREATE TABLE orders (,  order_id INT PRIMARY KEY,,  customer_id INT NOT NULL,,  order_date DATE,);,,CREATE TABLE order_items (,  order_id INT NOT NULL,,  product_id INT NOT NULL,,  quantity INT NOT NULL,,  PRIMARY KEY (order_id, product_id),,  FOREIGN KEY (order_id) REFERENCES orders(order_id),);,\n\n-- 4. Foreign key with referential action rules,CREATE TABLE customer_accounts (,  account_id SERIAL PRIMARY KEY,,  customer_id INT NOT NULL,,  account_type VARCHAR(50),,  created_date DATE,,  FOREIGN KEY (customer_id),    REFERENCES customers(customer_id),    ON DELETE CASCADE,    ON UPDATE RESTRICT,);,\n\n-- 5. Multiple foreign keys in one table,CREATE TABLE order_fulfillment (,  fulfillment_id SERIAL PRIMARY KEY,,  order_id INT NOT NULL,,  warehouse_id INT NOT NULL,,  shipped_date DATE,,  FOREIGN KEY (order_id) REFERENCES orders(order_id),,  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),);,\n\n-- 6. Named foreign key constraint for clarity,CREATE TABLE invoices (,  invoice_id SERIAL PRIMARY KEY,,  order_id INT NOT NULL,,  invoice_date DATE NOT NULL,,  CONSTRAINT fk_invoices_orders,    FOREIGN KEY (order_id) REFERENCES orders(order_id),);"
                  }
        ],
        tips: [
                  "Foreign key column must reference a PRIMARY KEY or UNIQUE constraint in the parent table — mismatched data types cause constraint violations",
                  "ON DELETE CASCADE automatically removes child rows when parent is deleted; ON DELETE SET NULL marks them as NULL (safer for audit trails)",
                  "ON UPDATE RESTRICT prevents changes to primary key values that have child references — ensures data consistency but may block legitimate updates",
                  "Create indexes on foreign key columns for better join performance — most databases don't auto-index child-side references"
        ],
        mistake: "Deleting parent rows without handling orphaned child records (ON DELETE RESTRICT prevents this). Mismatched data types between foreign key and primary key. Creating circular foreign keys (A references B, B references A) without careful design. Forgetting to create the parent table and primary key before adding the foreign key constraint.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "unique",
        fn: "UNIQUE Constraint",
        desc: "Prevents duplicate values in one or more columns while allowing NULL.",
        category: "Constraints & Keys",
        subtitle: "Enforce uniqueness for emails, usernames, codes, and other identifiers",
        signature: "UNIQUE (column) or UNIQUE (col1, col2)",
        descLong: "UNIQUE constraints prevent duplicate values but allow multiple NULLs (standard SQL behavior: NULLs are not equal to each other). Useful for emails, usernames, product codes. Unlike PRIMARY KEY, UNIQUE allows nulls and doesn't enforce non-null. Can be single or multi-column. Automatically creates an index for performance. Partial unique indexes (PostgreSQL) exclude rows matching a condition.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of UNIQUE Constraint — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 1. Single-column unique constraint\nCREATE TABLE users (\n  user_id SERIAL PRIMARY KEY,\n  username VARCHAR(50) UNIQUE NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  created_date DATE\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of UNIQUE Constraint — common patterns you'll see in production.\n-- APPROACH  - Combine UNIQUE Constraint with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- 2. Multi-column unique constraint (composite uniqueness)\nCREATE TABLE user_accounts (\n  account_id SERIAL PRIMARY KEY,\n  user_id INT NOT NULL,\n  provider VARCHAR(50) NOT NULL,  -- 'google', 'github', 'facebook'\n  provider_id VARCHAR(255) NOT NULL,\n  created_date DATE,\n  UNIQUE (user_id, provider),  -- one account per provider per user\n  FOREIGN KEY (user_id) REFERENCES users(user_id)\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of UNIQUE Constraint — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 3. Named unique constraint for better error messages,CREATE TABLE product_skus (,  product_id INT PRIMARY KEY,,  sku VARCHAR(50) NOT NULL,,  manufacturer_code VARCHAR(50),,  CONSTRAINT uk_sku UNIQUE (sku),,  CONSTRAINT uk_mfg_code UNIQUE (manufacturer_code),,  FOREIGN KEY (product_id) REFERENCES products(product_id),);,\n\n-- 4. Partial unique index (PostgreSQL) - exclude inactive records,CREATE TABLE employee_ssn (,  employee_id INT PRIMARY KEY,,  ssn VARCHAR(11),,  is_active BOOLEAN DEFAULT true,,  UNIQUE (ssn) WHERE is_active = true  -- only enforce uniqueness for active employees,);,\n\n-- 5. Unique constraint with nullable column (allows multiple NULLs),CREATE TABLE contracts (,  contract_id SERIAL PRIMARY KEY,,  customer_id INT NOT NULL,,  contract_number VARCHAR(50),,  end_date DATE,,  -- Multiple contracts can have NULL end_date, but non-NULL values must be unique,  UNIQUE (contract_number),,  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),);,\n\n-- 6. Table-level unique constraint definition,CREATE TABLE project_codes (,  project_id INT PRIMARY KEY,,  department_id INT NOT NULL,,  code VARCHAR(20) NOT NULL,,  year INT NOT NULL,,  CONSTRAINT uk_dept_code_year UNIQUE (department_id, code, year),,  FOREIGN KEY (department_id) REFERENCES departments(department_id),);"
                  }
        ],
        tips: [
                  "UNIQUE allows multiple NULLs (per SQL standard) — if you need exactly one NULL, use CHECK constraint: (col IS NOT NULL OR ...) or application logic",
                  "Unique constraint automatically creates an index for query optimization — checking uniqueness during insert/update is fast",
                  "Composite unique constraints are stronger than individual UNIQUE constraints — (email, deleted_date) together can be unique while email appears twice if deleted_date differs",
                  "Partial indexes (PostgreSQL WHERE clause) reduce index size and allow logical duplicates (e.g., inactive records) while enforcing uniqueness for active ones"
        ],
        mistake: "Expecting UNIQUE to enforce non-null; use NOT NULL with UNIQUE to prevent nulls. Using UNIQUE on columns that legitimately have duplicates in inactive/archived records — partial indexes are better. Not realizing composite UNIQUE means the combination is unique, not each column individually.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "check",
        fn: "CHECK Constraint",
        desc: "Validates data values against a condition on insert or update.",
        category: "Constraints & Keys",
        subtitle: "Enforce business rules: ranges, patterns, enums, and custom logic",
        signature: "CHECK (condition) or CONSTRAINT name CHECK (condition)",
        descLong: "CHECK constraints validate values during insert/update using boolean expressions. Enforce ranges (salary > 0), patterns (email format), enum-like restrictions, and multi-column rules. Runs before insert/update completes, preventing invalid data at the database level. Cannot call functions in most databases (PostgreSQL allows them). Clearer and safer than application-level validation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CHECK Constraint — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 1. Range check (numeric constraints)\nCREATE TABLE employees (\n  employee_id SERIAL PRIMARY KEY,\n  first_name VARCHAR(100) NOT NULL,\n  last_name VARCHAR(100) NOT NULL,\n  salary DECIMAL(10, 2),\n  age INT,\n  CHECK (salary >= 0),\n  CHECK (age BETWEEN 18 AND 75)\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CHECK Constraint — common patterns you'll see in production.\n-- APPROACH  - Combine CHECK Constraint with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- 2. Enum-like check (restrict to specific values)\nCREATE TABLE orders (\n  order_id SERIAL PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_status VARCHAR(20) DEFAULT 'pending',\n  priority VARCHAR(10),\n  CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),\n  CHECK (priority IN ('low', 'medium', 'high', 'urgent')),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CHECK Constraint — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 3. Multi-column check (values relative to each other),CREATE TABLE project_timeline (,  project_id SERIAL PRIMARY KEY,,  project_name VARCHAR(255) NOT NULL,,  start_date DATE NOT NULL,,  end_date DATE NOT NULL,,  budget DECIMAL(12, 2),,  CHECK (end_date > start_date),,  CHECK (budget > 0),);,\n\n-- 4. Pattern check with LIKE or regex (PostgreSQL),CREATE TABLE products (,  product_id SERIAL PRIMARY KEY,,  product_name VARCHAR(255) NOT NULL,,  product_code VARCHAR(20) NOT NULL,,  price DECIMAL(10, 2),,  -- Product code must match pattern: 3 letters + 4 digits,  CHECK (product_code ~ '^[A-Z]{3}[0-9]{4}),,  CHECK (price > 0),);,\n\n-- 5. Named check constraints for clear error messages,CREATE TABLE inventory (,  inventory_id SERIAL PRIMARY KEY,,  product_id INT NOT NULL,,  warehouse_id INT NOT NULL,,  quantity_on_hand INT DEFAULT 0,,  quantity_reserved INT DEFAULT 0,,  CONSTRAINT ck_qty_positive CHECK (quantity_on_hand >= 0),,  CONSTRAINT ck_reserved_less_than_hand CHECK (quantity_reserved <= quantity_on_hand),,  FOREIGN KEY (product_id) REFERENCES products(product_id),,  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),);,\n\n-- 6. Conditional logic check (PostgreSQL CASE or simple OR/AND),CREATE TABLE shifts (,  shift_id SERIAL PRIMARY KEY,,  employee_id INT NOT NULL,,  shift_date DATE NOT NULL,,  shift_type VARCHAR(20),,  start_time TIME,,  end_time TIME,,  CHECK (shift_type IN ('morning', 'afternoon', 'night')),,  -- If shift_type is 'night', end_time must be after start_time,  CHECK (end_time > start_time),,  FOREIGN KEY (employee_id) REFERENCES employees(employee_id),);"
                  }
        ],
        tips: [
                  "Keep CHECK conditions simple — complex logic belongs in application code or triggers. Overly complex checks slow down every insert/update",
                  "Use IS NOT NULL inside CHECK to enforce non-null on specific conditions: CHECK (status IS NOT NULL OR deleted_at IS NOT NULL)",
                  "Name constraints explicitly (CONSTRAINT ck_name CHECK) — database will include the constraint name in error messages, aiding debugging",
                  "Multi-column checks verify relationships between columns (end_date > start_date); single-column checks are less powerful but simpler"
        ],
        mistake: "Using CHECK constraints for complex business logic (e.g., \"discount cannot exceed 30% of product cost\") — CHECK can't reliably reference other tables or functions. Trying to call non-deterministic functions like NOW() inside CHECK — use DEFAULT or triggers instead. Forgetting that CHECK conditions can be NULL-permissive: CHECK (price > 0) allows NULL to pass (NULL > 0 is unknown, treated as pass).",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "not-null-default",
        fn: "NOT NULL / DEFAULT",
        desc: "Require values to be present and set default values for inserts.",
        category: "Constraints & Keys",
        subtitle: "Enforce mandatory fields and simplify data entry with defaults",
        signature: "column_name type NOT NULL DEFAULT value",
        descLong: "NOT NULL forces a value on every row; prevents NULL. DEFAULT provides a fallback value if not specified in INSERT. DEFAULT can be static values, expressions (NOW(), CURRENT_DATE), functions, or GENERATED columns. NOT NULL + DEFAULT together prevent missing data. Improves data quality and simplifies application code by reducing null-checking logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of NOT NULL / DEFAULT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 1. Basic NOT NULL constraint\nCREATE TABLE customers (\n  customer_id SERIAL PRIMARY KEY,\n  company_name VARCHAR(255) NOT NULL,\n  email VARCHAR(255) NOT NULL,\n  phone VARCHAR(20),  -- optional\n  created_date DATE NOT NULL,\n  is_active BOOLEAN NOT NULL DEFAULT true\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of NOT NULL / DEFAULT — common patterns you'll see in production.\n-- APPROACH  - Combine NOT NULL / DEFAULT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- 2. DEFAULT with static values\nCREATE TABLE orders (\n  order_id SERIAL PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_date DATE NOT NULL DEFAULT CURRENT_DATE,\n  order_status VARCHAR(20) DEFAULT 'pending',\n  priority INT DEFAULT 1,\n  notes TEXT,\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of NOT NULL / DEFAULT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 3. DEFAULT with functions (PostgreSQL/SQL Server),CREATE TABLE audit_log (,  log_id SERIAL PRIMARY KEY,,  table_name VARCHAR(100) NOT NULL,,  operation VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE,  changed_by VARCHAR(100) NOT NULL DEFAULT CURRENT_USER,,  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),,  old_values JSONB,,  new_values JSONB NOT NULL,);,\n\n-- 4. GENERATED ALWAYS AS (computed column),CREATE TABLE order_totals (,  order_id INT PRIMARY KEY,,  subtotal DECIMAL(10, 2) NOT NULL,,  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,,  -- total is calculated, never manually entered,  total DECIMAL(10, 2) GENERATED ALWAYS AS (subtotal + tax_amount) STORED,,  FOREIGN KEY (order_id) REFERENCES orders(order_id),);,\n\n-- 5. DEFAULT with expressions and multiple columns,CREATE TABLE employees (,  employee_id SERIAL PRIMARY KEY,,  first_name VARCHAR(100) NOT NULL,,  last_name VARCHAR(100) NOT NULL,,  email VARCHAR(255) NOT NULL,,  department_id INT NOT NULL,,  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,,  salary DECIMAL(10, 2) NOT NULL,,  bonus_eligible BOOLEAN DEFAULT true,,  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,,  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,,  FOREIGN KEY (department_id) REFERENCES departments(department_id),);,\n\n-- 6. DEFAULT with sequence (alternative to SERIAL),CREATE TABLE invoices (,  invoice_id INT PRIMARY KEY DEFAULT nextval('invoice_seq'),,  invoice_number VARCHAR(50) NOT NULL,,  customer_id INT NOT NULL,,  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,,  due_date DATE DEFAULT CURRENT_DATE + INTERVAL '30 days',,  amount DECIMAL(12, 2) NOT NULL,,  paid BOOLEAN DEFAULT false,,  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),);"
                  }
        ],
        tips: [
                  "Use DEFAULT CURRENT_DATE / CURRENT_TIMESTAMP for audit timestamps — cheaper and more reliable than application code",
                  "NOT NULL + DEFAULT together provide safety: if caller forgets a value, DEFAULT fills it; NULL is impossible. Use for frequently-accessed columns",
                  "GENERATED ALWAYS AS computed columns store derived values (total = subtotal + tax) — saves query complexity and ensures consistency",
                  "DEFAULT false is safer than DEFAULT true for boolean flags (opt-in vs. opt-out) — reduces accidental permission grants"
        ],
        mistake: "Assuming DEFAULT works without NOT NULL — DEFAULT only applies if column is omitted; explicit NULL in INSERT overrides it. Using NOW() for data values (created date) instead of CURRENT_DATE — timestamp precision can cause comparison issues. Forgetting to update triggers when adding DEFAULT values — old application code may still pass NULL explicitly.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "on-delete",
        fn: "ON DELETE CASCADE / SET NULL",
        desc: "Define referential actions when parent row is deleted or updated.",
        category: "Constraints & Keys",
        subtitle: "Automatically handle child rows: delete them, null them, or prevent deletion",
        signature: "FOREIGN KEY (...) REFERENCES parent(...) ON DELETE CASCADE",
        descLong: "Referential actions control what happens to child rows when the parent is modified. CASCADE deletes child rows automatically (dangerous for sensitive data). SET NULL marks children as orphaned (requires nullable FK column). SET DEFAULT sets a fallback value. RESTRICT (default) prevents parent deletion if children exist. PROTECT silently fails. Choose based on business logic: orders are RESTRICT (never delete orders), attachment files are CASCADE (delete files when parent deletes).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ON DELETE CASCADE / SET NULL — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- 1. ON DELETE CASCADE - delete child rows when parent deletes\nCREATE TABLE project_categories (\n  category_id SERIAL PRIMARY KEY,\n  category_name VARCHAR(100) NOT NULL\n);\n\nCREATE TABLE projects (\n  project_id SERIAL PRIMARY KEY,\n  category_id INT NOT NULL,\n  project_name VARCHAR(255) NOT NULL,\n  FOREIGN KEY (category_id)\n    REFERENCES project_categories(category_id)\n    ON DELETE CASCADE  -- when category is deleted, projects are too\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ON DELETE CASCADE / SET NULL — common patterns you'll see in production.\n-- APPROACH  - Combine ON DELETE CASCADE / SET NULL with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- 2. ON DELETE SET NULL - orphan child rows when parent deletes\nCREATE TABLE employees (\n  employee_id SERIAL PRIMARY KEY,\n  first_name VARCHAR(100) NOT NULL,\n  department_id INT,  -- nullable\n  FOREIGN KEY (department_id)\n    REFERENCES departments(department_id)\n    ON DELETE SET NULL  -- when dept deletes, employees become unassigned\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ON DELETE CASCADE / SET NULL — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- 3. ON DELETE RESTRICT (default) - prevent parent deletion,CREATE TABLE orders (,  order_id SERIAL PRIMARY KEY,,  customer_id INT NOT NULL,,  order_date DATE,,  FOREIGN KEY (customer_id),    REFERENCES customers(customer_id),    ON DELETE RESTRICT  -- cannot delete customer with active orders,);,\n\n-- 4. ON DELETE SET DEFAULT - restore to default value,CREATE TABLE inventory (,  inventory_id SERIAL PRIMARY KEY,,  product_id INT,,  warehouse_id INT NOT NULL DEFAULT 1,  -- default warehouse,  quantity INT,,  FOREIGN KEY (warehouse_id),    REFERENCES warehouses(warehouse_id),    ON DELETE SET DEFAULT  -- when warehouse closes, move to default,);,\n\n-- 5. Combined ON DELETE and ON UPDATE actions,CREATE TABLE user_sessions (,  session_id SERIAL PRIMARY KEY,,  user_id INT NOT NULL,,  token VARCHAR(255) UNIQUE NOT NULL,,  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,,  expires_at TIMESTAMP,,  FOREIGN KEY (user_id),    REFERENCES users(user_id),    ON DELETE CASCADE      -- clear sessions when user is deleted,    ON UPDATE CASCADE      -- if user_id changes, update sessions too,);,\n\n-- 6. Multiple referential actions on different foreign keys,CREATE TABLE order_shipments (,  shipment_id SERIAL PRIMARY KEY,,  order_id INT NOT NULL,,  carrier_id INT,,  tracking_number VARCHAR(100),,  shipped_date DATE,,  FOREIGN KEY (order_id),    REFERENCES orders(order_id),    ON DELETE RESTRICT,  -- never delete order with shipments,  FOREIGN KEY (carrier_id),    REFERENCES carriers(carrier_id),    ON DELETE SET NULL   -- carrier can be removed, mark shipment orphaned,);"
                  }
        ],
        tips: [
                  "CASCADE is dangerous for sensitive data (financial records, audit logs) — delete only when child is truly disposable (temporary files, cache)",
                  "SET NULL requires nullable FK column and NULL-permissive business logic — children become orphaned and hard to track",
                  "RESTRICT (default) is safest for transactional integrity — forces explicit handling of dependencies before deletion",
                  "ON UPDATE CASCADE propagates primary key changes to all children — only use if PKs are mutable (unusual; most PKs should be immutable)"
        ],
        mistake: "Using CASCADE on critical data (orders, invoices, audit logs) — one delete can silently remove months of business history. Forgetting ON DELETE RESTRICT causes silent data loss when a manager deletes a customer without realizing orders exist. Not matching ON DELETE actions across related tables — customer deletion might cascade to orders but SET NULL on shipments, creating inconsistency.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
    ],
  },

  // ── Section 11: Set Operations & Advanced Queries ─────────────────────────────────────────
  {
    id: "set-ops-advanced",
    title: "Set Operations & Advanced Queries",
    entries: [
      {
        id: "intersect-except",
        fn: "INTERSECT / EXCEPT",
        desc: "Find common rows or eliminate rows between two queries.",
        category: "Set Operations",
        subtitle: "Set difference and intersection operators for query result combination",
        signature: "SELECT col FROM table1 INTERSECT SELECT col FROM table2; SELECT col FROM table1 EXCEPT SELECT col FROM table2;",
        descLong: "INTERSECT returns only rows that appear in both result sets, useful for finding shared entities. EXCEPT (or MINUS) removes rows from the first set that exist in the second set. Both operators eliminate duplicates by default; use ALL for duplicates. Critical for anti-patterns, compliance checks, and data reconciliation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of INTERSECT / EXCEPT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Find customers who placed orders in both 2024 and 2025\nSELECT DISTINCT customer_id\nFROM orders\nWHERE YEAR(order_date) = 2024\n\nINTERSECT\n\nSELECT DISTINCT customer_id\nFROM orders\nWHERE YEAR(order_date) = 2025;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of INTERSECT / EXCEPT — common patterns you'll see in production.\n-- APPROACH  - Combine INTERSECT / EXCEPT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Find employees who are NOT managers\nSELECT employee_id, name\nFROM employees\n\nEXCEPT\n\nSELECT DISTINCT manager_id\nFROM employees\nWHERE manager_id IS NOT NULL;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of INTERSECT / EXCEPT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- EXCEPT ALL preserves duplicates (duplicate IDs in first set),SELECT order_id FROM orders WHERE status = 'pending',EXCEPT ALL,SELECT order_id FROM orders WHERE status = 'processing';"
                  }
        ],
        tips: [
                  "INTERSECT/EXCEPT require columns in matching count and compatible types across both queries",
                  "Use EXCEPT ALL to preserve duplicates when checking for quantity differences between datasets",
                  "Performance: both operators may require full scans; consider JOIN alternatives for large tables",
                  "INTERSECT is an anti-join alternative; test with COUNT() to verify expected result cardinality"
        ],
        mistake: "Assuming INTERSECT and EXCEPT preserve column aliases or order from the first SELECT—they may not; explicitly select the columns you need with consistent names.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "pivot",
        fn: "Pivot / CROSSTAB",
        desc: "Reshape rows into columns to summarize data by category.",
        category: "Set Operations",
        subtitle: "Transform row-based data into columnar format for cross-tabulation reports",
        signature: "SELECT * FROM table PIVOT (aggregate_fn(col) FOR pivot_col IN (values)); -- Oracle/TSQL syntax",
        descLong: "Pivoting reshapes query results so that row values become column headers. Enables side-by-side comparison of categories. Most databases use conditional aggregation (CASE WHEN) rather than native PIVOT syntax. PostgreSQL offers crosstab() for advanced pivoting. Essential for financial reports, dashboards, and comparative analysis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Pivot / CROSSTAB — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Standard CASE-based pivot: sales by product category and quarter\nSELECT\n  product_id,\n  product_name,\n  SUM(CASE WHEN QUARTER(order_date) = 1 THEN amount ELSE 0 END) AS q1_sales,\n  SUM(CASE WHEN QUARTER(order_date) = 2 THEN amount ELSE 0 END) AS q2_sales,\n  SUM(CASE WHEN QUARTER(order_date) = 3 THEN amount ELSE 0 END) AS q3_sales,\n  SUM(CASE WHEN QUARTER(order_date) = 4 THEN amount ELSE 0 END) AS q4_sales,\n  SUM(amount) AS total_sales\nFROM orders\nJOIN products ON orders.product_id = products.id\nWHERE YEAR(order_date) = 2025\nGROUP BY product_id, product_name\nORDER BY total_sales DESC;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Pivot / CROSSTAB — common patterns you'll see in production.\n-- APPROACH  - Combine Pivot / CROSSTAB with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- PostgreSQL crosstab() for dynamic pivoting\nSELECT * FROM crosstab(\n  'SELECT department, job_title, COUNT(*)\n   FROM employees\n   GROUP BY department, job_title\n   ORDER BY 1, 2',\n  'SELECT DISTINCT job_title FROM employees ORDER BY 1'\n) AS ct(department TEXT, engineer INT, manager INT, analyst INT);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Pivot / CROSSTAB — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Count pivot: employee headcount by department and employment status,SELECT,  department,,  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,,  SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) AS on_leave_count,,  SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive_count,,  COUNT(*) AS total_employees,FROM employees,GROUP BY department;"
                  }
        ],
        tips: [
                  "CASE-based pivots are more portable across databases than native PIVOT syntax",
                  "Use COALESCE to replace NULLs in pivot results with 0 or meaningful defaults",
                  "For many categories, consider limiting to top N values or dynamic column generation in application code",
                  "PostgreSQL crosstab() requires a sorted source query; specify exact column order and types"
        ],
        mistake: "Forgetting to include the original row grouping column in CASE pivots, causing incorrect aggregations across rows you meant to keep separate.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "nullif-greatest-least",
        fn: "NULLIF / GREATEST / LEAST",
        desc: "Conditional value functions for avoiding errors and clamping ranges.",
        category: "Set Operations",
        subtitle: "Handle NULL results, find maximum/minimum, and prevent division by zero",
        signature: "NULLIF(expr1, expr2), GREATEST(expr1, expr2, ...), LEAST(expr1, expr2, ...)",
        descLong: "NULLIF returns NULL if two expressions are equal, preventing division by zero errors and masking sentinel values. GREATEST/LEAST select max/min across multiple values. These functions are essential for financial calculations, data validation, and clamping values to ranges. Prevent runtime errors and enable conditional logic without complex CASE statements.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of NULLIF / GREATEST / LEAST — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- NULLIF for safe division: prevent division by zero in margin calculations\nSELECT\n  order_id,\n  revenue,\n  cost,\n  CASE\n    WHEN cost = 0 THEN NULL\n    ELSE ROUND(100.0 * (revenue - cost) / NULLIF(cost, 0), 2)\n  END AS margin_percent,\n  ROUND(revenue / NULLIF(cost, 0), 2) AS revenue_to_cost_ratio\nFROM orders\nWHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of NULLIF / GREATEST / LEAST — common patterns you'll see in production.\n-- APPROACH  - Combine NULLIF / GREATEST / LEAST with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- GREATEST/LEAST for clamping and multi-column max/min\nSELECT\n  product_id,\n  name,\n  base_price,\n  discount_price,\n  competitor_price,\n  GREATEST(base_price * 0.8, discount_price) AS minimum_allowed_price,\n  LEAST(base_price, competitor_price, MAX(base_price)) AS best_market_price,\n  CASE\n    WHEN competitor_price < GREATEST(base_price * 0.8, discount_price)\n    THEN 'Price competitively'\n    ELSE 'Hold current price'\n  END AS action\nFROM products;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of NULLIF / GREATEST / LEAST — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Practical example: clamp customer credit limit between min/max,SELECT,  customer_id,,  name,,  requested_limit,,  GREATEST(1000, LEAST(requested_limit, 50000)) AS approved_credit_limit,,  CASE,    WHEN requested_limit < 1000 THEN 'Below minimum',    WHEN requested_limit > 50000 THEN 'Capped at maximum',    ELSE 'Approved as requested',  END AS approval_note,FROM customers,WHERE status = 'active';"
                  }
        ],
        tips: [
                  "Always use NULLIF to prevent division by zero; wrapping both sides is redundant, only wrap the divisor",
                  "GREATEST/LEAST compare values row-by-row; for aggregate max/min, use MAX()/MIN() functions instead",
                  "NULLIF works with any data type; use it to replace empty strings or default values with NULL for proper handling",
                  "Combine GREATEST/LEAST with CASE for readable range validation and business rule enforcement"
        ],
        mistake: "Using NULLIF unnecessarily on both dividend and divisor, or confusing GREATEST/LEAST (row-level) with MAX/MIN (aggregate-level) functions.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "any-all",
        fn: "ANY / ALL",
        desc: "Compare a value against multiple values in a subquery result.",
        category: "Set Operations",
        subtitle: "Existential and universal quantifiers for flexible subquery comparisons",
        signature: "expr op ANY (subquery), expr op ALL (subquery) where op is =, <>, <, >, <=, >=",
        descLong: "ANY returns true if the comparison is true for any row in the subquery; ALL returns true only if comparison is true for all rows. Enable flexible filtering without IN/EXISTS and support complex comparisons like \"salary greater than all department managers\". More readable than self-joins for set comparisons.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ANY / ALL — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ANY: Find products priced higher than any competitor offering\nSELECT\n  p.product_id,\n  p.name,\n  p.price,\n  COUNT(DISTINCT c.competitor_id) AS beating_competitors\nFROM products p\nLEFT JOIN competitor_prices c ON p.product_id = c.product_id\nWHERE p.price > ANY (\n  SELECT price FROM competitor_prices\n  WHERE competitor_prices.product_id = p.product_id\n)\nGROUP BY p.product_id, p.name, p.price;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ANY / ALL — common patterns you'll see in production.\n-- APPROACH  - Combine ANY / ALL with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ALL: Find employees earning more than all team members in their department\nSELECT\n  e1.employee_id,\n  e1.name,\n  e1.department,\n  e1.salary\nFROM employees e1\nWHERE e1.salary > ALL (\n  SELECT e2.salary\n  FROM employees e2\n  WHERE e2.department = e1.department\n  AND e2.employee_id != e1.employee_id\n  AND e2.salary IS NOT NULL\n)\nORDER BY e1.department, e1.salary DESC;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ANY / ALL — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ANY vs IN equivalence: Find orders from customers in high-revenue regions,SELECT order_id, customer_id, amount,FROM orders,WHERE customer_id = ANY (,  SELECT customer_id,  FROM customers,  WHERE region_id IN (SELECT region_id FROM regions WHERE revenue > 1000000),);,\n\n-- Combining operators: Identify anomalies (price not between any standard and premium tier),SELECT,  product_id,,  current_price,,  'Price anomaly' AS alert,FROM products,WHERE current_price != ALL (,  SELECT price FROM price_tiers,  WHERE tier IN ('standard', 'premium'),);"
                  }
        ],
        tips: [
                  "ANY with = is equivalent to IN; use IN for readability unless the subquery changes per row",
                  "ALL with < or <= requires NULL handling—if ANY value is NULL, ALL returns UNKNOWN (NULL result)",
                  "Performance consideration: ANY/ALL subqueries may execute per outer row; test plans and compare with JOINs",
                  "Use != ALL to exclude multiple values (safer than NOT IN when NULLs are possible)"
        ],
        mistake: "Forgetting that = ALL requires exact match with every row (rare condition), when you likely meant = ANY; also confusing ALL with aggregate ALL keyword in COUNT(ALL col).",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "temp-tables",
        fn: "Temporary Tables",
        desc: "Create session-scoped scratch space for intermediate results.",
        category: "Set Operations",
        subtitle: "Manage intermediate data with CREATE TEMP TABLE or Common Table Expressions (CTE)",
        signature: "CREATE TEMP TABLE temp_name (col1 type, col2 type); CREATE TEMPORARY TABLE ... AS SELECT ...;",
        descLong: "Temporary tables persist only for the current session, providing scratchpad storage for multi-step queries. Useful for complex ETL, staged data transformations, and breaking queries into logical steps. Trade-off: CTEs (WITH clauses) are inline and cleaner for single queries; temp tables suit multi-query workflows or when you need indexes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Temporary Tables — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Create and populate a temporary table for revenue reconciliation\nCREATE TEMP TABLE revenue_staging AS\nSELECT\n  order_id,\n  customer_id,\n  SUM(quantity * unit_price) AS order_total,\n  COUNT(DISTINCT line_item_id) AS item_count,\n  MAX(order_date) AS latest_item_date\nFROM order_lines\nWHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)\nGROUP BY order_id, customer_id;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Temporary Tables — common patterns you'll see in production.\n-- APPROACH  - Combine Temporary Tables with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Add an index on temp table for faster joins\nCREATE INDEX idx_temp_customer ON revenue_staging(customer_id);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Temporary Tables — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Use temp table in subsequent queries,SELECT,  cs.customer_id,,  c.name,,  COUNT(DISTINCT cs.order_id) AS order_count,,  SUM(cs.order_total) AS customer_revenue,,  AVG(cs.order_total) AS avg_order_value,FROM revenue_staging cs,JOIN customers c ON cs.customer_id = c.customer_id,GROUP BY cs.customer_id, c.name,HAVING customer_revenue > 10000;,\n\n-- Comparison: CTE vs Temp Table for single multi-step query,-- CTE approach (cleaner for one-time use):,WITH active_orders AS (,  SELECT order_id, customer_id, amount,  FROM orders,  WHERE status = 'completed',  AND order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY),),,customer_summary AS (,  SELECT,    customer_id,,    COUNT(*) AS orders_30day,,    SUM(amount) AS revenue_30day,  FROM active_orders,  GROUP BY customer_id,),SELECT cs.customer_id, c.name, cs.orders_30day, cs.revenue_30day,FROM customer_summary cs,JOIN customers c ON cs.customer_id = c.customer_id,WHERE cs.revenue_30day > 5000;"
                  }
        ],
        tips: [
                  "Use CREATE TEMP TABLE when building intermediate results used by multiple queries; use CTE for single query linearity",
                  "Temp tables are isolated per session; changes do not affect other users or concurrent queries",
                  "Create indexes on temp tables if they are joined repeatedly—overhead is minimal for small datasets",
                  "Some databases auto-drop temp tables; explicitly DROP TEMP TABLE to reclaim resources if needed"
        ],
        mistake: "Assuming temp tables persist across sessions, or creating them without truncating when reusing in loops—always DROP and recreate or TRUNCATE before fresh ETL cycles.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "info-schema",
        fn: "INFORMATION_SCHEMA",
        desc: "Query database metadata to inspect tables, columns, and constraints.",
        category: "Set Operations",
        subtitle: "Introspect database structure without querying application data",
        signature: "SELECT * FROM INFORMATION_SCHEMA.TABLES; SELECT * FROM INFORMATION_SCHEMA.COLUMNS;",
        descLong: "INFORMATION_SCHEMA is a standardized system catalog containing metadata about tables, columns, constraints, and indexes. Essential for data governance, schema validation, dynamic SQL generation, and audit trails. Safer and more portable than database-specific catalog tables (e.g., mysql.information_schema vs. pg_catalog).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of INFORMATION_SCHEMA — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- List all tables in current database with record counts\nSELECT\n  t.TABLE_SCHEMA,\n  t.TABLE_NAME,\n  t.TABLE_TYPE,\n  t.CREATE_TIME,\n  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES\n   WHERE TABLE_SCHEMA = t.TABLE_SCHEMA) AS tables_in_schema\nFROM INFORMATION_SCHEMA.TABLES t\nWHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')\nORDER BY t.TABLE_SCHEMA, t.TABLE_NAME;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of INFORMATION_SCHEMA — common patterns you'll see in production.\n-- APPROACH  - Combine INFORMATION_SCHEMA with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Find all columns with 'date' in name and identify nullable date columns\nSELECT\n  TABLE_SCHEMA,\n  TABLE_NAME,\n  COLUMN_NAME,\n  COLUMN_TYPE,\n  IS_NULLABLE,\n  COLUMN_DEFAULT,\n  EXTRA\nFROM INFORMATION_SCHEMA.COLUMNS\nWHERE COLUMN_NAME LIKE '%date%'\n  AND TABLE_SCHEMA NOT IN ('information_schema', 'mysql')\n  AND DATA_TYPE IN ('DATE', 'DATETIME', 'TIMESTAMP')\nORDER BY TABLE_SCHEMA, TABLE_NAME;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of INFORMATION_SCHEMA — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Check if table exists before attempting operations (dynamic DDL),SELECT COUNT(*) AS table_exists,FROM INFORMATION_SCHEMA.TABLES,WHERE TABLE_SCHEMA = DATABASE(),  AND TABLE_NAME = 'orders';,\n\n-- Audit: find all columns marked UNIQUE and identify foreign keys,SELECT,  tc.TABLE_NAME,,  kcu.COLUMN_NAME,,  tc.CONSTRAINT_TYPE,,  kcu.REFERENCED_TABLE_NAME,,  kcu.REFERENCED_COLUMN_NAME,FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc,JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu,  ON tc.TABLE_NAME = kcu.TABLE_NAME,  AND tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME,WHERE tc.TABLE_SCHEMA = DATABASE(),  AND tc.CONSTRAINT_TYPE IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE'),ORDER BY tc.TABLE_NAME, tc.CONSTRAINT_TYPE;"
                  }
        ],
        tips: [
                  "Use INFORMATION_SCHEMA in WHERE clauses to filter out system schemas (information_schema, mysql, pg_catalog)",
                  "For schema change detection, query INFORMATION_SCHEMA periodically and compare snapshots for compliance audits",
                  "Combine INFORMATION_SCHEMA queries with application logic to auto-generate SQL, validate inputs, or manage migrations",
                  "Different databases have slightly different INFORMATION_SCHEMA structure; test portability for multi-DB applications"
        ],
        mistake: "Querying INFORMATION_SCHEMA without filtering system schemas, resulting in noisy results; also assuming exact column names match across versions—use aliases and test.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
    ],
  },

  // ── Section 12: Math & Numeric Functions ─────────────────────────────────────────
  {
    id: "math-numeric",
    title: "Math & Numeric Functions",
    entries: [
      {
        id: "round-ceil-floor",
        fn: "ROUND / CEIL / FLOOR",
        desc: "Numeric rounding and boundary functions for precision control.",
        category: "Math & Numeric",
        subtitle: "Control decimal places and round to integer or nearest value",
        signature: "ROUND(number, decimals), CEIL(number), FLOOR(number), TRUNC(number, decimals)",
        descLong: "ROUND adjusts decimals with banker's rounding (round half to even). CEIL rounds up, FLOOR rounds down to nearest integer. TRUNC truncates without rounding. Critical for financial reporting, billing accuracy, and data bucketing. Choose based on business rules: CEIL for customer-friendly pricing, FLOOR for conservative estimates.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ROUND / CEIL / FLOOR — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Financial: Round amounts to 2 decimals, floor for cost estimates\nSELECT\n  invoice_id,\n  gross_amount,\n  ROUND(gross_amount, 2) AS rounded_amount,\n  FLOOR(gross_amount) AS floor_amount,\n  CEIL(gross_amount * 1.1) AS amount_with_tax_ceiling,\n  ROUND(gross_amount * tax_rate, 2) AS tax_charged,\n  TRUNC(gross_amount / 3, 2) AS installment_amount\nFROM invoices\nWHERE invoice_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)\nORDER BY invoice_id;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ROUND / CEIL / FLOOR — common patterns you'll see in production.\n-- APPROACH  - Combine ROUND / CEIL / FLOOR with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Bucketing data by floor: group revenue into tiers\nSELECT\n  FLOOR(daily_revenue / 1000) * 1000 AS revenue_bucket,\n  CONCAT(', FORMAT(FLOOR(daily_revenue / 1000) * 1000, 0), ' - ,\n         FORMAT(FLOOR(daily_revenue / 1000) * 1000 + 999, 0)) AS bucket_range,\n  COUNT(*) AS day_count,\n  SUM(daily_revenue) AS total_revenue,\n  AVG(daily_revenue) AS avg_revenue\nFROM daily_metrics\nWHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)\nGROUP BY FLOOR(daily_revenue / 1000)\nORDER BY revenue_bucket DESC;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ROUND / CEIL / FLOOR — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Rounding for reporting precision: metrics aggregation,SELECT,  metric_date,,  product_category,,  ROUND(SUM(revenue), 2) AS total_revenue,,  ROUND(AVG(units_sold), 0) AS avg_units_sold,,  ROUND(STDDEV_POP(price), 4) AS price_stddev,,  CEIL(MAX(inventory_count)) AS max_inventory_ceiling,,  TRUNC(MIN(order_value), 2) AS min_order_trunc,FROM metrics,WHERE metric_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND CURDATE(),GROUP BY metric_date, product_category,HAVING total_revenue > 5000;"
                  }
        ],
        tips: [
                  "Use ROUND for display and financial calculations; banker's rounding (round half to even) is default in most databases",
                  "CEIL for \"round up\" billing scenarios ensures customer-friendly ceilings; FLOOR for conservative cost projections",
                  "TRUNC is faster than ROUND when truncation is acceptable and avoids rounding bias",
                  "Combine FLOOR with bucketing to create range groupings for histogram-like aggregations"
        ],
        mistake: "Assuming ROUND always rounds 0.5 up—SQL uses banker's rounding (round to nearest even), which may round 2.5 down to 2. Use CEIL if you need upward bias.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "abs-mod-power",
        fn: "ABS / MOD / POWER / SQRT",
        desc: "Arithmetic functions for distances, alternating logic, and exponential math.",
        category: "Math & Numeric",
        subtitle: "Calculate absolute values, remainders, powers, and square roots",
        signature: "ABS(number), MOD(dividend, divisor), POWER(base, exponent), SQRT(number)",
        descLong: "ABS returns magnitude regardless of sign, useful for distance calculations and variance analysis. MOD returns remainder after division, enabling alternating row patterns and cyclic logic. POWER and SQRT support exponential functions and geometric calculations. Essential for data science metrics, compound interest, and algorithmic queries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ABS / MOD / POWER / SQRT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ABS for distance calculations: find products with price deviation from average\nSELECT\n  p.product_id,\n  p.name,\n  p.price,\n  ROUND(AVG(p.price) OVER (PARTITION BY p.category), 2) AS category_avg_price,\n  ROUND(ABS(p.price - AVG(p.price) OVER (PARTITION BY p.category)), 2) AS price_deviation,\n  CASE\n    WHEN ABS(p.price - AVG(p.price) OVER (PARTITION BY p.category)) > 100 THEN 'High deviation'\n    ELSE 'Normal'\n  END AS price_status\nFROM products p\nWHERE ABS(p.price - AVG(p.price) OVER (PARTITION BY p.category)) > 50;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ABS / MOD / POWER / SQRT — common patterns you'll see in production.\n-- APPROACH  - Combine ABS / MOD / POWER / SQRT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- MOD for alternating rows: flag every Nth order for audit\nSELECT\n  order_id,\n  customer_id,\n  order_date,\n  amount,\n  MOD(order_id, 10) AS mod_10,\n  CASE\n    WHEN MOD(order_id, 10) = 0 THEN 'Sample for audit (10% random)'\n    ELSE 'Not sampled'\n  END AS audit_flag,\n  ROW_NUMBER() OVER (ORDER BY order_id) AS row_num,\n  MOD(ROW_NUMBER() OVER (ORDER BY order_id), 3) AS round_robin_group\nFROM orders\nWHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)\nLIMIT 100;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ABS / MOD / POWER / SQRT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- POWER for compound interest: project investment growth,SELECT,  investment_id,,  principal_amount,,  annual_rate,,  years,,  ROUND(principal_amount * POWER(1 + annual_rate / 100, years), 2) AS future_value,,  ROUND(principal_amount * POWER(1 + annual_rate / 100, years) - principal_amount, 2) AS interest_earned,,  ROUND((POWER(1 + annual_rate / 100, years) - 1) * 100, 2) AS total_growth_percent,FROM investments,WHERE status = 'active';,\n\n-- SQRT for geometric metrics: calculate Euclidean distance,SELECT,  point1_id,,  point2_id,,  x1, y1, x2, y2,,  ROUND(SQRT(POWER(x2 - x1, 2) + POWER(y2 - y1, 2)), 4) AS euclidean_distance,,  ROUND(ABS(x2 - x1) + ABS(y2 - y1), 4) AS manhattan_distance,FROM spatial_points,WHERE SQRT(POWER(x2 - x1, 2) + POWER(y2 - y1, 2)) < 50;"
                  }
        ],
        tips: [
                  "Use ABS in WHERE clauses to find outliers by comparing to average (deviation from mean)",
                  "MOD with ROW_NUMBER() creates round-robin row distribution for load balancing or stratified sampling",
                  "POWER(1 + rate, years) models exponential growth; nesting with ROUND prevents precision loss",
                  "SQRT is computationally expensive; consider pre-calculating distances or using spatial indexes for large datasets"
        ],
        mistake: "Forgetting ABS when checking for variance, leading to both positive and negative deviations from mean being treated oppositely; also using MOD on negative numbers expecting C-style behavior (behavior varies by database).",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "random-sample",
        fn: "RANDOM / TABLESAMPLE",
        desc: "Select random rows for sampling without loading entire dataset.",
        category: "Math & Numeric",
        subtitle: "Generate random values and perform efficient random sampling",
        signature: "ORDER BY RANDOM(), ORDER BY RAND(), TABLESAMPLE BERNOULLI (percent), SEED(value)",
        descLong: "RANDOM() generates random floats for ordering; TABLESAMPLE uses block-level sampling for efficiency on huge tables. Reproducible seeds enable repeatable samples for testing. Critical for A/B testing, quality audits, and approximate query analysis without full table scans.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of RANDOM / TABLESAMPLE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Simple random sampling: select 10 random customers for survey\nSELECT\n  customer_id,\n  name,\n  email,\n  lifetime_value,\n  RAND() AS random_sort\nFROM customers\nWHERE status = 'active'\nORDER BY RAND()\nLIMIT 10;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of RANDOM / TABLESAMPLE — common patterns you'll see in production.\n-- APPROACH  - Combine RANDOM / TABLESAMPLE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Reproducible random sampling with SEED (same sample every run)\n-- Some databases: SET SESSION SEED = 12345;\nSELECT\n  customer_id,\n  name,\n  account_age_days,\n  ROUND(RAND(12345) * 100, 2) AS random_score\nFROM customers\nWHERE RAND(12345) < 0.05  -- approximately 5% sample\nORDER BY random_score\nLIMIT 100;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of RANDOM / TABLESAMPLE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- TABLESAMPLE for efficient large-table sampling (PostgreSQL, TSQL),SELECT,  order_id,,  customer_id,,  order_date,,  amount,FROM orders,TABLESAMPLE BERNOULLI (1)  -- 1% block-level sample,WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR),LIMIT 1000;,\n\n-- Stratified sampling: random sample within each category (equal per group),SELECT,  product_id,,  product_category,,  name,,  price,,  ROW_NUMBER() OVER (PARTITION BY product_category ORDER BY RAND()) AS rn,FROM products,WHERE price > 0,HAVING rn <= 5  -- 5 random products per category,ORDER BY product_category, rn;"
                  }
        ],
        tips: [
                  "ORDER BY RAND() is simpler but scans full table; use TABLESAMPLE BERNOULLI for massive tables requiring speed over randomness quality",
                  "Set a SEED for reproducible results; essential for auditing, testing, and comparing baseline performance before/after changes",
                  "Stratified sampling (random per group) prevents category skew; use ROW_NUMBER() and PARTITION BY for balanced representation",
                  "LIMIT without ORDER BY is faster than ORDER BY RANDOM() LIMIT for fixed-size samples; use appropriate method for your use case"
        ],
        mistake: "Assuming ORDER BY RANDOM() LIMIT is efficient on billion-row tables (it sorts the entire table); also forgetting to set SEED when reproducibility is required for auditing.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "percentile",
        fn: "PERCENTILE_CONT / PERCENTILE_DISC",
        desc: "Calculate statistical percentiles and quantiles for distribution analysis.",
        category: "Math & Numeric",
        subtitle: "Find median, quartiles, and performance thresholds using window functions",
        signature: "PERCENTILE_CONT(value) WITHIN GROUP (ORDER BY col), PERCENTILE_DISC(value) WITHIN GROUP (ORDER BY col)",
        descLong: "PERCENTILE_CONT interpolates between values for continuous distributions (smooth median). PERCENTILE_DISC returns actual data values (discrete). Essential for SLA monitoring (P95 latency), salary analysis (quartiles), and performance profiling. Some databases use APPROX_PERCENTILE for streaming approximations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of PERCENTILE_CONT / PERCENTILE_DISC — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Find latency percentiles for SLA monitoring: P50, P95, P99\nSELECT\n  endpoint,\n  COUNT(*) AS request_count,\n  MIN(response_time_ms) AS min_latency,\n  PERCENTILE_DISC(0.50) WITHIN GROUP (ORDER BY response_time_ms) AS p50_latency,\n  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) AS p95_latency,\n  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) AS p99_latency,\n  MAX(response_time_ms) AS max_latency\nFROM api_metrics\nWHERE metric_date = CURDATE()\nGROUP BY endpoint\nORDER BY p95_latency DESC;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of PERCENTILE_CONT / PERCENTILE_DISC — common patterns you'll see in production.\n-- APPROACH  - Combine PERCENTILE_CONT / PERCENTILE_DISC with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Quartile analysis: salary distribution by department\nSELECT\n  department,\n  COUNT(*) AS employee_count,\n  PERCENTILE_DISC(0.25) WITHIN GROUP (ORDER BY salary) AS q1_salary,\n  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY salary) AS median_salary,\n  PERCENTILE_DISC(0.75) WITHIN GROUP (ORDER BY salary) AS q3_salary,\n  PERCENTILE_DISC(0.90) WITHIN GROUP (ORDER BY salary) AS p90_salary,\n  MAX(salary) - MIN(salary) AS salary_range,\n  ROUND(STDDEV_POP(salary), 2) AS salary_stddev\nFROM employees\nWHERE status = 'active'\nGROUP BY department\nORDER BY median_salary DESC;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of PERCENTILE_CONT / PERCENTILE_DISC — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Product performance: identify slow-movers (low sales percentile) and bestsellers,SELECT,  product_id,,  name,,  category,,  units_sold,,  PERCENTILE_RANK() OVER (PARTITION BY category ORDER BY units_sold) * 100 AS sales_percentile_rank,,  CASE,    WHEN PERCENTILE_RANK() OVER (PARTITION BY category ORDER BY units_sold) < 0.25 THEN 'Bottom quartile - consider discontinuation',    WHEN PERCENTILE_RANK() OVER (PARTITION BY category ORDER BY units_sold) > 0.75 THEN 'Top quartile - bestseller',    ELSE 'Mid-range',  END AS performance_tier,FROM products,WHERE last_12month_units > 0,ORDER BY category, sales_percentile_rank DESC;"
                  }
        ],
        tips: [
                  "Use PERCENTILE_CONT for continuous metrics (latency, revenue); PERCENTILE_DISC for actual data values (discrete IDs, salary points)",
                  "PERCENTILE_RANK() and PERCENT_RANK() are window versions; aggregate PERCENTILE functions require GROUP BY",
                  "P95/P99 latencies reveal tail-end performance issues better than averages; monitor for SLA compliance",
                  "Combine with STDDEV_POP to detect outliers: values > P95 are often anomalies worth investigating"
        ],
        mistake: "Confusing PERCENTILE_CONT (interpolated) with PERCENTILE_DISC (actual values)—use DISC when you need valid data points, CONT for smooth thresholds like latency targets.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
    ],
  },

  // ── Section 13: Stored Programs & Triggers ─────────────────────────────────────────
  {
    id: "stored-programs",
    title: "Stored Programs & Triggers",
    entries: [
      {
        id: "create-function",
        fn: "CREATE FUNCTION",
        desc: "Reusable SQL/PL logic executed on the server.",
        category: "Stored Programs",
        subtitle: "Define functions that return scalars, tables, or computed values with optimization markers",
        signature: "CREATE FUNCTION name(params) RETURNS type AS $ ... $ LANGUAGE plpgsql;",
        descLong: "Functions let you encapsulate business logic, reduce network round-trips, and reuse logic across queries. Use IMMUTABLE for pure functions (same input = same output), STABLE for functions reading tables without modification, VOLATILE for unpredictable results. The database can optimize queries using functions marked IMMUTABLE or STABLE.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CREATE FUNCTION — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Scalar function: calculate employee bonus based on salary\nCREATE FUNCTION calc_annual_bonus(salary DECIMAL, years_employed INT)\nRETURNS DECIMAL AS $$\nBEGIN\n  RETURN salary * 0.10 * LEAST(years_employed, 5) / 5;\nEND;\n$$ LANGUAGE plpgsql IMMUTABLE;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CREATE FUNCTION — common patterns you'll see in production.\n-- APPROACH  - Combine CREATE FUNCTION with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Use in queries\nSELECT employee_id, name, salary, calc_annual_bonus(salary, years_employed) AS bonus\nFROM employees\nWHERE salary > 50000;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CREATE FUNCTION — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Table-returning function: get employee with their top 3 orders,CREATE FUNCTION get_top_customer_orders(emp_id INT),RETURNS TABLE(order_id INT, amount DECIMAL, order_date DATE) AS $$,BEGIN,  RETURN QUERY,  SELECT o.id, o.total_amount, o.created_at,  FROM orders o,  WHERE o.customer_id = emp_id,  ORDER BY o.total_amount DESC,  LIMIT 3;,END;,$$ LANGUAGE plpgsql STABLE;,\n\n-- Invoke table-returning function,SELECT * FROM get_top_customer_orders(42);,\n\n-- Functions with DEFAULT and variadic patterns,CREATE FUNCTION format_currency(amount DECIMAL, currency TEXT DEFAULT 'USD'),RETURNS TEXT AS $$,BEGIN,  RETURN currency || ' ' || TO_CHAR(amount, '999,999.99');,END;,$$ LANGUAGE plpgsql IMMUTABLE;,,SELECT format_currency(1250.50), format_currency(1250.50, 'EUR');"
                  }
        ],
        tips: [
                  "Mark functions IMMUTABLE when they always return same output for same input—enables query optimization and function pushdown",
                  "Use STABLE for functions that read tables but don't modify them (like lookups)—still allows some optimization",
                  "VOLATILE is default for functions that call non-deterministic SQL like NEXTVAL() or have side effects—safest but slowest",
                  "Table-returning functions reduce multiple round-trips by fetching related data in one call from application code"
        ],
        mistake: "Forgetting to specify volatility markers (defaulting to VOLATILE) prevents query optimization; also, forgetting $ quoting can break code with special characters.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "stored-procedure",
        fn: "CREATE PROCEDURE",
        desc: "Server-side logic for transactions and multi-step operations.",
        category: "Stored Programs",
        subtitle: "Execute transaction control (COMMIT/ROLLBACK) inside server-side procedures",
        signature: "CREATE PROCEDURE name(params) AS $ ... $ LANGUAGE plpgsql;",
        descLong: "Procedures are invoked with CALL, don't return query results (though they can return OUT parameters), and can contain COMMIT and ROLLBACK. Use procedures for workflows spanning multiple steps or when you need explicit transaction control. Functions cannot contain COMMIT, making procedures essential for transaction boundaries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CREATE PROCEDURE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Procedure: process monthly payroll with transaction control\nCREATE PROCEDURE process_payroll(pay_period_id INT)\nAS $$\nDECLARE\n  v_total_paid DECIMAL := 0;\n  v_count INT;\nBEGIN\n  -- Validate period exists\n  IF NOT EXISTS(SELECT 1 FROM pay_periods WHERE id = pay_period_id)\n  THEN RAISE EXCEPTION 'Invalid pay period';\n  END IF;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CREATE PROCEDURE — common patterns you'll see in production.\n-- APPROACH  - Combine CREATE PROCEDURE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Insert payroll records (calculated from base + bonuses)\n  INSERT INTO payroll_runs (employee_id, amount, period_id, created_at)\n  SELECT e.id, e.salary + calc_annual_bonus(e.salary, EXTRACT(YEAR FROM AGE(NOW(), e.hire_date))::INT),\n         pay_period_id, NOW()\n  FROM employees e\n  WHERE e.status = 'ACTIVE';\n\n  GET DIAGNOSTICS v_count = ROW_COUNT;\n  v_total_paid := (SELECT SUM(amount) FROM payroll_runs WHERE period_id = pay_period_id);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CREATE PROCEDURE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Log the operation,  INSERT INTO audit_log (action, affected_rows, amount_total, created_at),  VALUES ('PAYROLL_PROCESSED', v_count, v_total_paid, NOW());,\n\n  -- Commit after all validations pass,  COMMIT;,,  RAISE NOTICE 'Processed % employees, total: %', v_count, v_total_paid;,EXCEPTION WHEN OTHERS THEN,  ROLLBACK;,  RAISE EXCEPTION 'Payroll failed: %', SQLERRM;,END;,$$ LANGUAGE plpgsql;,\n\n-- Call the procedure from application,CALL process_payroll(201);,\n\n-- Procedure with OUT parameters (return values to caller),CREATE PROCEDURE get_sales_summary(,  p_year INT,,  OUT total_revenue DECIMAL,,  OUT total_orders INT,,  OUT avg_order_value DECIMAL,) AS $$,BEGIN,  SELECT COALESCE(SUM(total_amount), 0), COUNT(*), COALESCE(AVG(total_amount), 0),  INTO total_revenue, total_orders, avg_order_value,  FROM orders,  WHERE EXTRACT(YEAR FROM created_at) = p_year;,END;,$$ LANGUAGE plpgsql;,,CALL get_sales_summary(2025, total_revenue, total_orders, avg_order_value);"
                  }
        ],
        tips: [
                  "Use procedures when you need explicit COMMIT/ROLLBACK control—functions cannot contain transaction control statements",
                  "OUT parameters let procedures return multiple values to callers without using RETURN QUERY (which is function-only)",
                  "Always wrap multi-step operations in exception handlers with ROLLBACK to prevent partial updates on error",
                  "Test procedures thoroughly; they run server-side with full permissions, so bugs affect production data directly"
        ],
        mistake: "Using procedures when simple functions would work—procedures are slower for simple calculations; also, forgetting exception handling with ROLLBACK leaves the database in corrupt states on errors.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "triggers",
        fn: "CREATE TRIGGER",
        desc: "Automatically execute logic on INSERT, UPDATE, or DELETE events.",
        category: "Stored Programs",
        subtitle: "Run trigger functions BEFORE or AFTER data changes for validation and auditing",
        signature: "CREATE TRIGGER name BEFORE|AFTER INSERT|UPDATE|DELETE ON table FOR EACH ROW EXECUTE FUNCTION fn();",
        descLong: "Triggers fire automatically when data changes, enforcing business rules and maintaining audit trails. BEFORE triggers modify or reject changes; AFTER triggers log changes. Use them for data validation, cascading updates, audit logging, and preventing invalid states. Triggers add overhead, so use conservatively.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CREATE TRIGGER — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- BEFORE INSERT trigger: validate salary range and auto-set hire_date\nCREATE FUNCTION validate_employee_before_insert() RETURNS TRIGGER AS $$\nBEGIN\n  -- Validate salary is within range\n  IF NEW.salary < 30000 OR NEW.salary > 500000 THEN\n    RAISE EXCEPTION 'Salary % out of valid range [30k-500k]', NEW.salary;\n  END IF;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CREATE TRIGGER — common patterns you'll see in production.\n-- APPROACH  - Combine CREATE TRIGGER with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Auto-set hire_date if not provided\n  IF NEW.hire_date IS NULL THEN\n    NEW.hire_date := CURRENT_DATE;\n  END IF;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CREATE TRIGGER — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Set created_at timestamp,  NEW.created_at := NOW();,,  RETURN NEW;,END;,$$ LANGUAGE plpgsql;,,CREATE TRIGGER trg_validate_employee_insert,BEFORE INSERT ON employees,FOR EACH ROW,EXECUTE FUNCTION validate_employee_before_insert();,\n\n-- AFTER INSERT trigger: log employee creation to audit table,CREATE FUNCTION audit_employee_changes() RETURNS TRIGGER AS $$,BEGIN,  IF TG_OP = 'INSERT' THEN,    INSERT INTO audit_log (table_name, record_id, action, details, created_at),    VALUES ('employees', NEW.id, 'INSERT', 'New employee: ' || NEW.name, NOW());,,  ELSIF TG_OP = 'UPDATE' THEN,    INSERT INTO audit_log (table_name, record_id, action, details, created_at),    VALUES ('employees', NEW.id, 'UPDATE',,            'Salary ' || OLD.salary || ' -> ' || NEW.salary, NOW());,,  ELSIF TG_OP = 'DELETE' THEN,    INSERT INTO audit_log (table_name, record_id, action, details, created_at),    VALUES ('employees', OLD.id, 'DELETE', 'Deleted: ' || OLD.name, NOW());,  END IF;,,  RETURN NEW;,END;,$$ LANGUAGE plpgsql;,,CREATE TRIGGER trg_audit_employee_changes,AFTER INSERT OR UPDATE OR DELETE ON employees,FOR EACH ROW,EXECUTE FUNCTION audit_employee_changes();,\n\n-- AFTER UPDATE trigger: cascade product_id changes to related orders,CREATE FUNCTION cascade_product_updates() RETURNS TRIGGER AS $$,BEGIN,  IF OLD.id != NEW.id THEN,    UPDATE order_items,    SET product_id = NEW.id,    WHERE product_id = OLD.id;,  END IF;,  RETURN NEW;,END;,$$ LANGUAGE plpgsql;,,CREATE TRIGGER trg_cascade_product_changes,AFTER UPDATE OF id ON products,FOR EACH ROW,EXECUTE FUNCTION cascade_product_updates();"
                  }
        ],
        tips: [
                  "Use BEFORE triggers for validation and field transformations (enforce rules before data touches disk)",
                  "Use AFTER triggers for audit logging and cascading effects (run after data is committed, no risk of losing your changes)",
                  "Check TG_OP (INSERT, UPDATE, DELETE) to handle different operations in one trigger function—saves code duplication",
                  "Triggers fire silently; monitor audit tables and error logs to catch unexpected trigger behavior"
        ],
        mistake: "Creating triggers that call expensive functions (like full table scans) on every row change—triggers fire for each row, multiplying overhead; also, BEFORE triggers that don't RETURN NEW silently fail inserts.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "cursors",
        fn: "DECLARE CURSOR",
        desc: "Row-by-row iteration through result sets.",
        category: "Stored Programs",
        subtitle: "Fetch and process rows one at a time; usually better replaced by set-based operations",
        signature: "DECLARE cursor_name CURSOR FOR query; FETCH ... FROM cursor_name;",
        descLong: "Cursors let you iterate through rows individually, useful for complex row-by-row processing where set-based SQL won't work. However, cursors are slow—iterate over 1M rows and you'll suffer. Before using cursors, ask: can I solve this with a JOIN or window function? Most real-world cursor code should use set-based operations instead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DECLARE CURSOR — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Cursor: calculate custom commission per employee based on historical performance\nCREATE PROCEDURE calculate_performance_commissions() AS $$\nDECLARE\n  v_employee_id INT;\n  v_total_orders INT;\n  v_commission DECIMAL;\n  v_cursor CURSOR FOR\n    SELECT DISTINCT e.id, COUNT(o.id) as order_count\n    FROM employees e\n    LEFT JOIN orders o ON e.id = o.sales_rep_id\n    GROUP BY e.id;\nBEGIN\n  OPEN v_cursor;\n\n  LOOP\n    FETCH v_cursor INTO v_employee_id, v_total_orders;\n    EXIT WHEN NOT FOUND;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DECLARE CURSOR — common patterns you'll see in production.\n-- APPROACH  - Combine DECLARE CURSOR with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Commission logic: more orders = higher rate\n    v_commission := CASE\n      WHEN v_total_orders >= 100 THEN 5000\n      WHEN v_total_orders >= 50 THEN 3000\n      WHEN v_total_orders >= 20 THEN 1500\n      ELSE 500\n    END;\n\n    INSERT INTO commissions (employee_id, amount, calculated_at)\n    VALUES (v_employee_id, v_commission, NOW());\n  END LOOP;\n\n  CLOSE v_cursor;\n  COMMIT;\nEND;\n$$ LANGUAGE plpgsql;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DECLARE CURSOR — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Better approach: use window functions (set-based, much faster),INSERT INTO commissions (employee_id, amount, calculated_at),SELECT,  e.id,,  CASE,    WHEN order_count >= 100 THEN 5000,    WHEN order_count >= 50 THEN 3000,    WHEN order_count >= 20 THEN 1500,    ELSE 500,  END as commission,,  NOW(),FROM (,  SELECT e.id, COUNT(o.id) as order_count,  FROM employees e,  LEFT JOIN orders o ON e.id = o.sales_rep_id,  GROUP BY e.id,) sub;,\n\n-- Cursor with parameterized query: adjust salary for dept,CREATE PROCEDURE adjust_dept_salaries(p_department TEXT, p_percent DECIMAL) AS $$,DECLARE,  v_emp_id INT;,  v_old_salary DECIMAL;,  v_new_salary DECIMAL;,  v_cursor CURSOR FOR,    SELECT id, salary,    FROM employees,    WHERE department = p_department;,BEGIN,  OPEN v_cursor;,,  LOOP,    FETCH v_cursor INTO v_emp_id, v_old_salary;,    EXIT WHEN NOT FOUND;,,    v_new_salary := v_old_salary * (1 + p_percent / 100);,    UPDATE employees SET salary = v_new_salary WHERE id = v_emp_id;,,    INSERT INTO audit_log (action, details, created_at),    VALUES ('SALARY_ADJUST', 'Emp ' || v_emp_id || ': ' || v_old_salary || ' -> ' || v_new_salary, NOW());,  END LOOP;,,  CLOSE v_cursor;,  COMMIT;,END;,$$ LANGUAGE plpgsql;"
                  }
        ],
        tips: [
                  "Cursors are a last resort—try window functions, CTEs, and JOINs first; they're faster and more elegant",
                  "Use cursors only for truly complex row-by-row logic that can't be expressed in SQL (e.g., calling external APIs per row)",
                  "Always CLOSE cursors to free memory; use explicit OPEN/FETCH/CLOSE rather than implicit loops in most cases",
                  "If processing 100k+ rows, cursors will timeout; redesign using bulk inserts/updates with set-based operations"
        ],
        mistake: "Using cursors for operations that should be set-based (like batch updates or aggregations)—cursors process one row at a time, killing performance on large datasets. Also, forgetting to CLOSE cursors leaks resources.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
    ],
  },

  // ── Section 14: Admin & Maintenance ─────────────────────────────────────────
  {
    id: "admin-maintenance",
    title: "Admin & Maintenance",
    entries: [
      {
        id: "grant-revoke",
        fn: "GRANT / REVOKE",
        desc: "Manage user permissions at table, schema, and database levels.",
        category: "Admin & Maintenance",
        subtitle: "Create roles, grant SELECT/INSERT/UPDATE/DELETE, set role hierarchies and defaults",
        signature: "GRANT privileges ON [object] TO role; REVOKE privileges ON [object] FROM role;",
        descLong: "Use GRANT to give roles permissions and REVOKE to remove them. Roles can be users or groups; nesting roles creates hierarchies. Default permissions are restrictive (principle of least privilege), so explicitly grant what users need. Schema and table-level grants let you protect sensitive data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of GRANT / REVOKE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Create roles for different teams\nCREATE ROLE analyst_team;\nCREATE ROLE finance_users;\nCREATE ROLE sales_readonly;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of GRANT / REVOKE — common patterns you'll see in production.\n-- APPROACH  - Combine GRANT / REVOKE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Grant SELECT to read-only role on non-sensitive tables\nGRANT SELECT ON products, orders, order_items TO sales_readonly;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of GRANT / REVOKE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Finance can see all except employee salaries,GRANT SELECT ON products, orders, order_items, customers TO finance_users;,GRANT SELECT (id, name, department, hire_date) ON employees TO finance_users;,\n\n-- Analysts get full access,GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO analyst_team;,\n\n-- Grant on schemas (affects future tables too),GRANT USAGE ON SCHEMA public TO sales_readonly;,GRANT CREATE ON SCHEMA public TO analyst_team;,\n\n-- Grant sequence permissions for NEXTVAL(),GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO finance_users;,\n\n-- Create user and assign to role,CREATE USER john_smith WITH PASSWORD 'secure_password_here';,GRANT sales_readonly TO john_smith;,\n\n-- Role hierarchy: senior analysts inherit analyst permissions,CREATE ROLE senior_analyst;,GRANT analyst_team TO senior_analyst;,\n\n-- Grant DEFAULT role so user doesn't need SET ROLE,ALTER USER john_smith SET ROLE sales_readonly;,\n\n-- Revoke permissions,REVOKE INSERT, UPDATE, DELETE ON orders FROM sales_readonly;,REVOKE ALL ON employees FROM finance_users;,\n\n-- Column-level grant: only specific columns,GRANT SELECT (id, total_amount, created_at) ON orders TO sales_readonly;,\n\n-- Set statement-level permissions,GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO analyst_team;"
                  }
        ],
        tips: [
                  "Use role hierarchies (GRANT role TO role) to manage permissions at scale—assign users to one role, role inherits from others",
                  "Set DEFAULT ROLE on users so they don't need SET ROLE every session—cleaner setup for applications",
                  "Grant on schemas (GRANT USAGE ON SCHEMA) to control what tables users can even see in schema browsing",
                  "Column-level grants hide sensitive fields (salary, ssn) from roles that don't need them—powerful for compliance"
        ],
        mistake: "Granting PUBLIC permissions or using superuser accounts for applications—exposed credentials then compromise entire database. Also, forgetting to REVOKE old permissions when roles change, leaving stale access.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "data-types",
        fn: "SQL Data Types",
        desc: "Choose appropriate column types for storage, performance, and constraints.",
        category: "Admin & Maintenance",
        subtitle: "Understand INTEGER, VARCHAR, NUMERIC, BOOLEAN, TIMESTAMP, UUID, SERIAL tradeoffs",
        signature: "CREATE TABLE name (col type constraints);",
        descLong: "The right data type prevents bugs, saves space, enables indexing, and ensures constraints. BIGINT for large IDs, DECIMAL/NUMERIC for money (never FLOAT), VARCHAR for bounded text, UUID for distributed primary keys, TIMESTAMPTZ for timezone-aware timestamps. Poor choices lead to overflow errors, rounding bugs, and index failures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of SQL Data Types — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Bad: using wrong types (common mistakes)\nCREATE TABLE orders_bad (\n  order_id SERIAL,  -- Can overflow after 2.1B records\n  customer_email VARCHAR(50),  -- Too small, will truncate\n  price FLOAT,  -- Rounding errors with money\n  created_at TIMESTAMP,  -- No timezone, confusing in global systems\n  is_shipped CHAR(1)  -- Using char instead of boolean\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of SQL Data Types — common patterns you'll see in production.\n-- APPROACH  - Combine SQL Data Types with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Good: using appropriate types\nCREATE TABLE orders (\n  order_id BIGSERIAL PRIMARY KEY,  -- BIGINT auto-increment, 9.2 quintillion capacity\n  customer_id BIGINT NOT NULL REFERENCES customers(id),\n  customer_email VARCHAR(255),  -- Email max 254 chars + buffer\n  product_id UUID NOT NULL,  -- Distributed systems need UUID for unique IDs\n  quantity INT NOT NULL CHECK (quantity > 0),  -- Integer for whole items\n  price NUMERIC(12, 2) NOT NULL,  -- Always NUMERIC/DECIMAL for money (12 digits, 2 decimals = $999,999,999.99)\n  discount NUMERIC(5, 4) CHECK (discount BETWEEN 0 AND 1),  -- Percentage as decimal\n  total_amount NUMERIC(13, 2) GENERATED ALWAYS AS (quantity * price - (quantity * price * discount)) STORED,\n  is_shipped BOOLEAN DEFAULT FALSE,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- TZ-aware for multi-region\n  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,\n  notes TEXT  -- Unbounded text for variable-length content\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of SQL Data Types — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Other common types explained,CREATE TABLE products (,  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- UUID: good for distributed systems,  name VARCHAR(255) NOT NULL,  -- VARCHAR: limited, indexed,  description TEXT,  -- TEXT: unlimited, not typically indexed,  sku CHAR(10) NOT NULL,  -- CHAR: fixed width, good for codes,  quantity_available INT NOT NULL DEFAULT 0,  -- INT: whole numbers only,  reorder_threshold SMALLINT DEFAULT 50,  -- SMALLINT: save space if 0-32k range,  weight_kg NUMERIC(8, 3),  -- NUMERIC: precise decimals,  is_active BOOLEAN DEFAULT TRUE,  -- BOOLEAN: TRUE/FALSE only,  last_restock TIMESTAMPTZ,,  discontinued_at TIMESTAMP  -- TIMESTAMP without TZ: events that don't vary by location,);,\n\n-- Arrays for storing related scalars (use sparingly; normalize when possible),CREATE TABLE employee_skills (,  employee_id BIGINT NOT NULL REFERENCES employees(id),,  skill_tags TEXT[] NOT NULL  -- Array of skills: {'SQL', 'Python', 'AWS'},);,\n\n-- Interval type for durations,CREATE TABLE projects (,  id BIGSERIAL PRIMARY KEY,,  name VARCHAR(255),,  estimated_duration INTERVAL,  -- e.g., '3 days 4 hours',  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,);,\n\n-- GENERATED ALWAYS AS IDENTITY (modern alternative to SERIAL),CREATE TABLE audit_log (,  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,,  table_name VARCHAR(100),,  record_id BIGINT,,  action VARCHAR(20),,  old_values JSONB,  -- JSON for semi-structured data,  new_values JSONB,,  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,);"
                  }
        ],
        tips: [
                  "Use NUMERIC/DECIMAL (not FLOAT) for money—FLOAT has rounding errors; NUMERIC(12, 2) stores exact cents",
                  "Use BIGINT/BIGSERIAL for IDs in active systems—SERIAL maxes out at 2.1B, which modern apps hit quickly",
                  "Use TIMESTAMPTZ (timezone-aware) for global systems—TIMESTAMP without TZ causes bugs when servers are in different zones",
                  "Use VARCHAR(n) for bounded data (email, phone, postal codes), TEXT for unbounded (descriptions, notes)—saves space and catches truncation early"
        ],
        mistake: "Using FLOAT for money (causes rounding bugs), CHAR for variable-length data (wastes space and requires trimming), TIMESTAMP without TZ (confusion in multi-region), or SERIAL for auto-increment IDs in large systems (overflows after 2B records).",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "drop-truncate",
        fn: "DROP TABLE / TRUNCATE",
        desc: "Permanently remove tables or rapidly clear data.",
        category: "Admin & Maintenance",
        subtitle: "DROP destroys schema and data; TRUNCATE clears data, resets sequences, keeps structure",
        signature: "DROP TABLE [IF EXISTS] table; TRUNCATE table [CASCADE|RESTRICT] [RESTART IDENTITY];",
        descLong: "DROP removes the entire table definition (structure + data), slower but necessary for cleanup. TRUNCATE empties data, resets sequences, and is much faster (no row-by-row deletion, no transaction log overhead). Use TRUNCATE for clearing test data; use DROP for removing tables you no longer need. CASCADE deletes dependent foreign keys.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of DROP TABLE / TRUNCATE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- TRUNCATE: fast clearing, preserves structure, resets sequences\nTRUNCATE TABLE orders RESTART IDENTITY;  -- Clears all rows, resets auto-increment to 1"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of DROP TABLE / TRUNCATE — common patterns you'll see in production.\n-- APPROACH  - Combine DROP TABLE / TRUNCATE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- TRUNCATE multiple tables with foreign key constraints\nTRUNCATE TABLE order_items, orders, customers CASCADE;  -- CASCADE drops dependents too"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of DROP TABLE / TRUNCATE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- DROP: remove table entirely (structure + data + indexes),DROP TABLE IF EXISTS legacy_audit_logs;  -- IF EXISTS prevents error if table doesn't exist,\n\n-- DROP with CASCADE: removes table and all dependent objects,DROP TABLE employees CASCADE;  -- Also drops foreign key references from orders.sales_rep_id,\n\n-- DROP without CASCADE: fails if other tables reference this one,DROP TABLE employees RESTRICT;  -- Error: \"orders\" references \"employees\",\n\n-- Truncate with cascade (clear related tables in dependency order),TRUNCATE TABLE orders CASCADE;  -- Also truncates order_items that reference orders,TRUNCATE TABLE order_items RESTART IDENTITY;  -- Reset auto-increment after clearing,\n\n-- Careful: TRUNCATE doesn't fire DELETE triggers (unlike DELETE), but BEFORE/AFTER TRUNCATE triggers do fire,CREATE TABLE order_deletion_log (,  cleared_at TIMESTAMPTZ,,  table_name TEXT,,  row_count INT,);,,CREATE FUNCTION log_truncate() RETURNS TRIGGER AS $$,BEGIN,  INSERT INTO order_deletion_log (cleared_at, table_name, row_count),  VALUES (NOW(), TG_TABLE_NAME, (SELECT COUNT(*) FROM orders));,  RETURN NULL;,END;,$$ LANGUAGE plpgsql;,,CREATE TRIGGER trg_log_order_truncate,BEFORE TRUNCATE ON orders,FOR EACH STATEMENT,EXECUTE FUNCTION log_truncate();,\n\n-- TRUNCATE vs DELETE: performance difference,-- DELETE (row-by-row, slower, logs each delete, fires row-level triggers),DELETE FROM orders WHERE created_at < '2020-01-01';,\n\n-- TRUNCATE (entire table, instant, no row triggers, resets sequences),TRUNCATE TABLE orders RESTART IDENTITY;  -- Much faster for clearing entire tables,\n\n-- DROP with column/type cleanup (dangerous, be careful),DROP TABLE IF EXISTS old_product_history CASCADE;,DROP TYPE IF EXISTS old_enum_type CASCADE;"
                  }
        ],
        tips: [
                  "Use TRUNCATE for clearing test data or dev databases—instant and resets sequences without transaction overhead",
                  "Use DROP IF EXISTS in migration scripts—safe to re-run without checking table existence first",
                  "Remember TRUNCATE skips DELETE triggers but fires TRUNCATE triggers—different behavior from DELETE",
                  "Use CASCADE carefully in production—it deletes dependent tables and constraints; test in dev first"
        ],
        mistake: "Using DROP without IF EXISTS, which crashes scripts if the table already exists; also, forgetting RESTART IDENTITY after TRUNCATE leaves sequences high, so next insert might use gap IDs.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "sequences",
        fn: "CREATE SEQUENCE",
        desc: "Generate auto-incrementing counters for primary keys.",
        category: "Admin & Maintenance",
        subtitle: "Use CREATE SEQUENCE for manual control; SERIAL/IDENTITY for simpler auto-increment setup",
        signature: "CREATE SEQUENCE name START WITH start INCREMENT BY step; NEXTVAL('name'); CURRVAL('name');",
        descLong: "Sequences generate unique integers, driving auto-increment columns. SERIAL/GENERATED ALWAYS AS IDENTITY are shortcuts that create sequences implicitly. Manual sequences give control over starting value, increment step, and cycle behavior. Sequences guarantee uniqueness and gap-free numbering (within a transaction).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CREATE SEQUENCE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- SERIAL: shorthand that creates sequence automatically\nCREATE TABLE employees (\n  id SERIAL PRIMARY KEY,  -- Implicitly creates sequence employees_id_seq\n  name VARCHAR(255)\n);\n\nINSERT INTO employees (name) VALUES ('Alice');  -- id auto-set to 1\nINSERT INTO employees (name) VALUES ('Bob');    -- id auto-set to 2"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CREATE SEQUENCE — common patterns you'll see in production.\n-- APPROACH  - Combine CREATE SEQUENCE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Manual sequence: explicit control\nCREATE SEQUENCE invoice_numbers\n  START WITH 1000\n  INCREMENT BY 1\n  MINVALUE 1000\n  MAXVALUE 999999\n  CYCLE;  -- Wrap around when maxvalue hit\n\nCREATE TABLE invoices (\n  invoice_number INT PRIMARY KEY DEFAULT NEXTVAL('invoice_numbers'),\n  customer_id BIGINT NOT NULL,\n  amount NUMERIC(12, 2),\n  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP\n);\n\nINSERT INTO invoices (customer_id, amount) VALUES (42, 500.00);  -- invoice_number = 1000\nINSERT INTO invoices (customer_id, amount) VALUES (43, 750.00);  -- invoice_number = 1001"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CREATE SEQUENCE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- GENERATED ALWAYS AS IDENTITY (modern PostgreSQL 10+, preferred over SERIAL),CREATE TABLE orders (,  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,  -- Can't override,  customer_id BIGINT NOT NULL,,  total_amount NUMERIC(12, 2),,  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,);,,INSERT INTO orders (customer_id, total_amount) VALUES (1, 1250.50);  -- id auto-set,\n\n-- GENERATED BY DEFAULT allows explicit override (for bulk imports),CREATE TABLE products (,  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,,  name VARCHAR(255),,  sku VARCHAR(20),);,,INSERT INTO products (name, sku) VALUES ('Widget', 'SKU-001');  -- Auto ID,INSERT INTO products (id, name, sku) VALUES (999, 'Special Product', 'SPECIAL');  -- Explicit ID,\n\n-- Get current/next value from sequence,SELECT CURRVAL('invoice_numbers');  -- Last value allocated in this session,SELECT NEXTVAL('invoice_numbers');  -- 1002: advance and return next value,\n\n-- Change sequence (reset after data corruption or to fix gap),ALTER SEQUENCE invoice_numbers RESTART WITH 2000;,\n\n-- Sequence starting from max(id) for existing data,SELECT SETVAL('employees_id_seq', (SELECT MAX(id) FROM employees) + 1);,\n\n-- Sequences work across sessions (transaction-safe),-- Two concurrent INSERT statements won't get duplicate IDs,-- Session A: NEXTVAL() -> 100,-- Session B: NEXTVAL() -> 101  (never 100, guaranteed unique)"
                  }
        ],
        tips: [
                  "Use GENERATED ALWAYS AS IDENTITY over SERIAL in modern PostgreSQL—cleaner syntax, harder to accidentally override",
                  "Use GENERATED BY DEFAULT AS IDENTITY if you need to override IDs during bulk imports or merges",
                  "Set START WITH and INCREMENT BY explicitly for sequences used in real-world numbering (invoices, purchase orders)",
                  "After DELETE/TRUNCATE, use SETVAL() to reset sequence to MAX(id)+1—prevents reusing old IDs"
        ],
        mistake: "Assuming NEXTVAL() returns the same value in a transaction (it doesn't—it advances each call); also, using SERIAL in production with high-volume insertions risks running out of IDs (2.1B limit) without BIGSERIAL.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "materialized-views",
        fn: "Materialized Views",
        desc: "Cache expensive query results as a physical table for fast reads.",
        category: "Admin & Maintenance",
        subtitle: "CREATE MATERIALIZED VIEW to store computed results; REFRESH to update cache",
        signature: "CREATE MATERIALIZED VIEW name AS query; REFRESH MATERIALIZED VIEW [CONCURRENTLY] name;",
        descLong: "Regular views are virtual (query runs every access). Materialized views execute once and store results as a table, then refresh on demand. Use for expensive aggregations, slow JOINs, or dashboards hit thousands of times/sec. Tradeoff: faster reads, stale data until refresh, extra storage.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Materialized Views — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Materialized view: pre-aggregate sales by region (expensive calculation)\nCREATE MATERIALIZED VIEW mv_sales_by_region AS\nSELECT\n  r.region_name,\n  c.country,\n  COUNT(o.id) as total_orders,\n  SUM(o.total_amount) as revenue,\n  AVG(o.total_amount) as avg_order_value,\n  MIN(o.created_at) as first_order,\n  MAX(o.created_at) as last_order\nFROM regions r\nLEFT JOIN countries c ON r.id = c.region_id\nLEFT JOIN customers cust ON c.id = cust.country_id\nLEFT JOIN orders o ON cust.id = o.customer_id\nGROUP BY r.region_name, c.country\nORDER BY revenue DESC;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Materialized Views — common patterns you'll see in production.\n-- APPROACH  - Combine Materialized Views with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Create index on materialized view for fast lookups\nCREATE UNIQUE INDEX idx_mv_sales_region_country ON mv_sales_by_region (region_name, country);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Materialized Views — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Query the materialized view (instant response, no aggregation needed),SELECT * FROM mv_sales_by_region WHERE region_name = 'EMEA' ORDER BY revenue DESC;,\n\n-- Refresh entire view (locks view during refresh, blocks reads),REFRESH MATERIALIZED VIEW mv_sales_by_region;,\n\n-- CONCURRENT refresh: rebuild in background, allows reads during refresh,-- Requires UNIQUE index on the view first,REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_by_region;,\n\n-- Materialized view for dashboard: top 10 products by sales,CREATE MATERIALIZED VIEW mv_top_products_dashboard AS,SELECT,  p.id,,  p.name,,  p.category,,  COUNT(DISTINCT o.id) as times_ordered,,  SUM(oi.quantity) as total_qty_sold,,  SUM(oi.quantity * oi.price) as total_revenue,,  AVG(oi.price) as avg_sale_price,,  MAX(o.created_at) as last_sold,FROM products p,LEFT JOIN order_items oi ON p.id = oi.product_id,LEFT JOIN orders o ON oi.order_id = o.id,GROUP BY p.id, p.name, p.category,ORDER BY total_revenue DESC,LIMIT 10;,\n\n-- Schedule refresh via cron job or trigger,-- (Manual example: refresh every hour via application scheduler),REFRESH MATERIALIZED VIEW mv_top_products_dashboard;,\n\n-- Materialized view for audit: summary of changes per day,CREATE MATERIALIZED VIEW mv_audit_daily_summary AS,SELECT,  DATE(created_at) as change_date,,  table_name,,  action,,  COUNT(*) as change_count,,  STRING_AGG(DISTINCT record_id::TEXT, ',') as affected_ids,FROM audit_log,WHERE created_at > NOW() - INTERVAL '90 days',GROUP BY DATE(created_at), table_name, action;,\n\n-- Drop materialized view (similar to DROP TABLE),DROP MATERIALIZED VIEW mv_sales_by_region CASCADE;"
                  }
        ],
        tips: [
                  "Use materialized views for expensive aggregations queried frequently (dashboards, reports)—much faster than re-running aggregation",
                  "Create UNIQUE indexes on materialized views to enable CONCURRENT REFRESH (allows reads during refresh)",
                  "Schedule REFRESH via cron jobs or application logic—materialized views don't auto-update; they're stale by definition",
                  "Monitor disk usage; materialized views duplicate data from source tables—good tradeoff only when reads vastly outnumber writes"
        ],
        mistake: "Using materialized views for frequently changing data without a refresh schedule—queries return stale results; also, forgetting indexes makes queries slow on large cached result sets.",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
      {
        id: "vacuum-analyze",
        fn: "VACUUM / ANALYZE",
        desc: "Reclaim space and update table statistics for query optimization.",
        category: "Admin & Maintenance",
        subtitle: "VACUUM removes dead rows, ANALYZE updates planner statistics; autovacuum usually handles both",
        signature: "VACUUM [FULL|ANALYZE] table; ANALYZE table;",
        descLong: "UPDATE/DELETE leave dead rows that waste space (bloat). VACUUM reclaims space; VACUUM FULL rewrites entire table but locks it. ANALYZE samples rows and updates statistics the planner uses to pick good query plans. Autovacuum runs periodically, but manual vacuum helps after bulk operations. Monitor vacuum stats with pg_stat_user_tables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of VACUUM / ANALYZE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- VACUUM: reclaim space from dead rows (UPDATE/DELETE)\n-- Runs while table is accessible (read/write allowed)\nVACUUM employees;  -- Basic vacuum, incremental reclaim"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of VACUUM / ANALYZE — common patterns you'll see in production.\n-- APPROACH  - Combine VACUUM / ANALYZE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- VACUUM ANALYZE: reclaim space + update statistics in one pass\nVACUUM ANALYZE employees;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of VACUUM / ANALYZE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- VACUUM FULL: rewrite entire table, more aggressive, LOCKS table,-- Use rarely, typically maintenance windows only,VACUUM FULL employees;  -- Removes all bloat, reclaims space to OS,\n\n-- ANALYZE alone: update statistics without reclaiming space,-- Useful after bulk INSERT/UPDATE when planner stats are stale,INSERT INTO orders (customer_id, total_amount, created_at),SELECT customer_id, RANDOM() * 1000, NOW() FROM customers;,,ANALYZE orders;  -- Update stats after bulk insert,\n\n-- Manual vacuum on specific columns (partial stats),ANALYZE employees (salary, department);,\n\n-- Check table bloat and dead rows,SELECT,  schemaname,,  tablename,,  round(100 * (HEAP_BLKS_READ - HEAP_BLKS_HIT) / HEAP_BLKS_READ::numeric, 2) AS hit_ratio,,  n_dead_tup,,  n_live_tup,FROM pg_stat_user_tables,WHERE n_dead_tup > 1000  -- Tables with significant bloat,ORDER BY n_dead_tup DESC;,\n\n-- View last vacuum info,SELECT,  schemaname,,  tablename,,  last_vacuum,,  last_autovacuum,,  n_dead_tup,,  n_tup_upd + n_tup_del AS modifying_operations,FROM pg_stat_user_tables,WHERE last_vacuum IS NOT NULL OR last_autovacuum IS NOT NULL,ORDER BY last_autovacuum DESC;,\n\n-- Adjust autovacuum settings for table (more aggressive on high-churn tables),ALTER TABLE orders SET (,  autovacuum_vacuum_scale_factor = 0.05,  -- Vacuum at 5% modifications (default 10%),  autovacuum_analyze_scale_factor = 0.02,  -- Analyze at 2% modifications (default 5%),  autovacuum_vacuum_cost_delay = 10  -- Vacuum slower to reduce I/O impact,);,\n\n-- Vacuum entire schema,VACUUM (ANALYZE, VERBOSE) SCHEMA public;,\n\n-- Monitor vacuum progress (PostgreSQL 9.6+),-- Track long-running VACUUM operations,SELECT,  pid,,  usename,,  datname,,  phase,,  heap_blks_scanned,,  heap_blks_vacuumed,FROM pg_stat_progress_vacuum;,\n\n-- Aggressive autovacuum for test tables (clear frequently-updated data),ALTER TABLE test_audit_log SET (autovacuum_vacuum_scale_factor = 0.01);,\n\n-- Disable autovacuum for temporary table (recreated regularly anyway),ALTER TABLE temp_staging SET (autovacuum_enabled = FALSE);"
                  }
        ],
        tips: [
                  "Run VACUUM ANALYZE after bulk INSERT/UPDATE/DELETE to reclaim space and update statistics—ensures good query plans going forward",
                  "Let autovacuum handle routine maintenance; only manual VACUUM after huge bulk operations or in maintenance windows",
                  "Use VACUUM FULL sparingly (locks table for rewrite); schedule in off-hours or on replicas, never on primary during business hours",
                  "Monitor n_dead_tup in pg_stat_user_tables; if exceeding millions, increase autovacuum frequency or run manual VACUUM"
        ],
        mistake: "Running VACUUM FULL on large tables in production (blocks all reads/writes for hours); also, ignoring autovacuum and letting tables bloat unchecked (wastes space, slows queries due to stale statistics).",
        shorthand: {
          verbose: "SELECT col1, col2, col3\nFROM table1\nWHERE condition = TRUE\nORDER BY col1",
          concise: "SELECT col1, col2, col3 FROM table1 WHERE condition = TRUE ORDER BY col1",
        },
      },
    ],
  },
]

export default { meta, sections }
