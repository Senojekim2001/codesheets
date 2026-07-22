export const meta = {
  "id": "ctes",
  "label": "CTEs & Recursive Queries",
  "icon": "🔄",
  "description": "Common Table Expressions, recursive CTEs, hierarchical queries, and advanced subquery patterns."
}

export const sections = [

  // ── Section 1: CTEs & Subquery Patterns ─────────────────────────────────────────
  {
    id: "cte-basics",
    title: "CTEs & Subquery Patterns",
    entries: [
      {
        id: "cte-fundamentals",
        fn: "WITH — Common Table Expressions",
        desc: "Named temporary result sets that make complex queries readable: chain CTEs, reference them multiple times, and replace nested subqueries.",
        category: "CTEs",
        subtitle: "WITH, multiple CTEs, materialized, inline views",
        signature: "WITH cte AS (SELECT ...) SELECT ... FROM cte  |  WITH a AS (...), b AS (...)",
        descLong: "CTEs (Common Table Expressions) are named temporary result sets defined with WITH. They make complex queries readable by breaking them into logical steps. Multiple CTEs can be chained — each can reference the ones before it. CTEs can be referenced multiple times in the main query (unlike subqueries which re-execute). Some databases materialize CTEs (compute once, reuse), others inline them. CTEs replace deeply nested subqueries with a top-down readable flow.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of WITH — Common Table Expressions — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Basic CTE ────────────────────────────────────────\nWITH active_users AS (\n    SELECT user_id, email, last_login\n    FROM users\n    WHERE last_login > CURRENT_DATE - INTERVAL '30 days'\n)\nSELECT\n    a.user_id,\n    a.email,\n    COUNT(o.id) AS recent_orders\nFROM active_users a\nLEFT JOIN orders o ON o.user_id = a.user_id\n    AND o.created_at > CURRENT_DATE - INTERVAL '30 days'\nGROUP BY a.user_id, a.email;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of WITH — Common Table Expressions — common patterns you'll see in production.\n-- APPROACH  - Combine WITH — Common Table Expressions with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Multiple chained CTEs ───────────────────────────\nWITH\nmonthly_revenue AS (\n    SELECT\n        DATE_TRUNC('month', order_date) AS month,\n        SUM(amount) AS revenue\n    FROM orders\n    WHERE order_date >= '2024-01-01'\n    GROUP BY DATE_TRUNC('month', order_date)\n),\nwith_growth AS (\n    SELECT\n        month,\n        revenue,\n        LAG(revenue) OVER (ORDER BY month) AS prev_revenue,\n        ROUND(\n            (revenue - LAG(revenue) OVER (ORDER BY month))\n            / NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100, 1\n        ) AS growth_pct\n    FROM monthly_revenue\n),\ncategorized AS (\n    SELECT\n        *,\n        CASE\n            WHEN growth_pct > 20 THEN 'high_growth'\n            WHEN growth_pct > 0 THEN 'growing'\n            WHEN growth_pct IS NULL THEN 'baseline'\n            ELSE 'declining'\n        END AS trend\n    FROM with_growth\n)\nSELECT * FROM categorized ORDER BY month;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of WITH — Common Table Expressions — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── CTE referenced multiple times ───────────────────,WITH user_stats AS (,    SELECT,        user_id,,        COUNT(*) AS order_count,,        SUM(amount) AS total_spent,    FROM orders,    GROUP BY user_id,),SELECT,    'above_average' AS segment,,    COUNT(*) AS users,,    AVG(total_spent) AS avg_spent,FROM user_stats,WHERE total_spent > (SELECT AVG(total_spent) FROM user_stats),UNION ALL,SELECT,    'below_average',,    COUNT(*),,    AVG(total_spent),FROM user_stats,WHERE total_spent <= (SELECT AVG(total_spent) FROM user_stats);,\n\n-- ── CTE for INSERT/UPDATE/DELETE (PostgreSQL) ───────,WITH inactive AS (,    SELECT user_id,    FROM users,    WHERE last_login < CURRENT_DATE - INTERVAL '1 year',),DELETE FROM user_sessions,WHERE user_id IN (SELECT user_id FROM inactive);"
                  }
        ],
        tips: [
                  "Chain CTEs like a data pipeline — each step builds on the previous, making complex logic readable top-to-bottom.",
                  "CTEs can be referenced multiple times in the main query — subqueries in FROM re-execute each time.",
                  "In PostgreSQL, CTEs with DML (INSERT/UPDATE/DELETE) can modify data — useful for cleanup operations.",
                  "Name CTEs descriptively (monthly_revenue, active_users) — they serve as documentation for the query logic."
        ],
        mistake: "Nesting subqueries 3-4 levels deep instead of using CTEs — deeply nested queries are unreadable and hard to debug. Each nesting level should become a named CTE.",
        shorthand: {
          verbose: "SELECT * FROM (\n  SELECT user_id, email FROM users WHERE last_login > CURRENT_DATE - INTERVAL '30 days'\n) AS active_users\nJOIN orders ON orders.user_id = active_users.user_id;",
          concise: "WITH active_users AS (\n  SELECT user_id, email FROM users WHERE last_login > CURRENT_DATE - INTERVAL '30 days'\n)\nSELECT * FROM active_users JOIN orders USING (user_id);",
        },
      },
      {
        id: "recursive-ctes",
        fn: "Recursive CTEs — Hierarchies, Trees & Series",
        desc: "Traverse org charts, category trees, and generate sequences with recursive WITH queries.",
        category: "Recursive",
        subtitle: "WITH RECURSIVE, hierarchy, tree traversal, generate series, graph paths",
        signature: "WITH RECURSIVE cte AS (base UNION ALL recursive) SELECT FROM cte",
        descLong: "Recursive CTEs have two parts: an anchor member (base case) and a recursive member that references the CTE itself. The anchor runs first, then the recursive member repeats until it returns no rows. Use cases: org chart traversal (employee → manager chain), category trees (parent → child), bill of materials, generating date/number series, and graph path finding. Add a depth counter to limit recursion and prevent infinite loops.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Recursive CTEs — Hierarchies, Trees & Series — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Org chart — employee hierarchy ───────────────────\nWITH RECURSIVE org_tree AS (\n    -- Anchor: start from CEO (no manager)\n    SELECT\n        employee_id,\n        name,\n        manager_id,\n        name AS path,\n        0 AS depth\n    FROM employees\n    WHERE manager_id IS NULL\n\n    UNION ALL"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Recursive CTEs — Hierarchies, Trees & Series — common patterns you'll see in production.\n-- APPROACH  - Combine Recursive CTEs — Hierarchies, Trees & Series with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Recursive: join children to their parents\n    SELECT\n        e.employee_id,\n        e.name,\n        e.manager_id,\n        t.path || ' > ' || e.name,\n        t.depth + 1\n    FROM employees e\n    INNER JOIN org_tree t ON e.manager_id = t.employee_id\n)\nSELECT depth, name, path\nFROM org_tree\nORDER BY path;\n-- 0 | CEO Alice     | CEO Alice\n-- 1 | VP Bob        | CEO Alice > VP Bob\n-- 2 | Manager Carol | CEO Alice > VP Bob > Manager Carol\n-- 3 | Dev Dave      | CEO Alice > VP Bob > Manager Carol > Dev Dave"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Recursive CTEs — Hierarchies, Trees & Series — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Category tree — all descendants ─────────────────,WITH RECURSIVE category_tree AS (,    SELECT id, name, parent_id, ARRAY[name] AS breadcrumb,    FROM categories,    WHERE parent_id IS NULL  -- root categories,,    UNION ALL,,    SELECT c.id, c.name, c.parent_id,,           ct.breadcrumb || c.name,    FROM categories c,    INNER JOIN category_tree ct ON c.parent_id = ct.id,),SELECT,    id,,    name,,    array_to_string(breadcrumb, ' > ') AS full_path,FROM category_tree,ORDER BY breadcrumb;,\n\n-- ── Generate a date series (no generate_series) ─────,WITH RECURSIVE dates AS (,    SELECT DATE '2024-01-01' AS dt,    UNION ALL,    SELECT dt + INTERVAL '1 day',    FROM dates,    WHERE dt < DATE '2024-12-31',),SELECT dt FROM dates;,\n\n-- ── Fill in missing dates with a series join ────────,WITH RECURSIVE date_range AS (,    SELECT MIN(order_date) AS dt FROM orders,    UNION ALL,    SELECT dt + INTERVAL '1 day' FROM date_range,    WHERE dt < (SELECT MAX(order_date) FROM orders),),SELECT,    d.dt AS date,,    COALESCE(SUM(o.amount), 0) AS daily_revenue,FROM date_range d,LEFT JOIN orders o ON DATE(o.order_date) = d.dt,GROUP BY d.dt,ORDER BY d.dt;,\n\n-- ── Limit recursion depth (safety) ──────────────────,WITH RECURSIVE tree AS (,    SELECT id, name, parent_id, 0 AS depth,    FROM nodes WHERE parent_id IS NULL,    UNION ALL,    SELECT n.id, n.name, n.parent_id, t.depth + 1,    FROM nodes n,    INNER JOIN tree t ON n.parent_id = t.id,    WHERE t.depth < 10  -- prevent infinite recursion,),SELECT * FROM tree;"
                  }
        ],
        tips: [
                  "Always add a depth counter and WHERE depth < N to prevent infinite recursion on circular data.",
                  "Build breadcrumb paths by concatenating names in the recursive step — array_to_string or || for display.",
                  "Recursive date/number series generation works on all databases — use it when generate_series() is unavailable.",
                  "UNION ALL (not UNION) in recursive CTEs — UNION removes duplicates which can prevent valid recursion."
        ],
        mistake: "No depth limit on recursive CTEs with potentially circular data — if an employee is their own manager (data bug), the query runs forever. Always add WHERE depth < max_depth.",
        shorthand: {
          verbose: "SELECT employee_id, name, manager_id, name AS path, 0 AS depth\nFROM employees WHERE manager_id IS NULL\nUNION ALL\nSELECT e.employee_id, e.name, e.manager_id, t.path || ' > ' || e.name, t.depth + 1\nFROM employees e JOIN org_tree t ON e.manager_id = t.employee_id\nWHERE t.depth < 10;",
          concise: "WITH RECURSIVE org_tree AS (\n  SELECT employee_id, name, manager_id, name AS path, 0 AS depth\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, e.name, e.manager_id, t.path || ' > ' || e.name, t.depth + 1\n  FROM employees e JOIN org_tree t ON e.manager_id = t.employee_id WHERE t.depth < 10\n) SELECT * FROM org_tree ORDER BY path;",
        },
      },
      {
        id: "recursive-cte-tree",
        fn: "Recursive CTEs for Tree Traversal",
        desc: "Use recursive CTEs to traverse hierarchical data: org charts, parent-child relationships, ancestors, and descendants.",
        category: "Recursive",
        subtitle: "Org charts, parent-child hierarchies, ancestors, family trees, path building",
        signature: "WITH RECURSIVE tree AS (anchor UNION ALL recursive_step)",
        descLong: "Tree traversal queries walk parent-child relationships in both directions. Top-down traversal starts from roots and finds all descendants. Bottom-up traversal starts from leaf and walks to root. Breadth-first uses depth counters, depth-first preserves path ordering. Use ARRAY accumulation to detect cycles (if NEW element already in array, skip). Path building via string concatenation or arrays shows the complete hierarchy.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Recursive CTEs for Tree Traversal — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Find all ancestors (bottom-up) ──────────────────\nWITH RECURSIVE ancestors AS (\n    SELECT id, name, parent_id, ARRAY[id] AS path, 0 AS depth\n    FROM categories\n    WHERE id = 5  -- Start from a leaf category\n\n    UNION ALL\n\n    SELECT c.id, c.name, c.parent_id,\n           a.path || c.id, a.depth + 1\n    FROM categories c\n    INNER JOIN ancestors a ON c.id = a.parent_id\n    WHERE a.depth < 50  -- safety limit\n)\nSELECT * FROM ancestors ORDER BY depth DESC;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Recursive CTEs for Tree Traversal — common patterns you'll see in production.\n-- APPROACH  - Combine Recursive CTEs for Tree Traversal with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Find all descendants (top-down) ──────────────────\nWITH RECURSIVE descendants AS (\n    SELECT id, name, parent_id, ARRAY[id] AS path, 0 AS depth\n    FROM categories\n    WHERE parent_id IS NULL  -- Start from roots\n\n    UNION ALL\n\n    SELECT c.id, c.name, c.parent_id,\n           d.path || c.id, d.depth + 1\n    FROM categories c\n    INNER JOIN descendants d ON c.parent_id = d.id\n    WHERE d.depth < 50  -- safety limit\n)\nSELECT id, name,\n       array_length(path, 1) - 1 AS depth,\n       array_to_string(path, ' > ') AS hierarchy\nFROM descendants\nORDER BY path;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Recursive CTEs for Tree Traversal — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Check for cycles using array accumulation ────────,WITH RECURSIVE tree_check AS (,    SELECT id, name, parent_id, ARRAY[id] AS visited_ids, 0 AS depth,    FROM nodes,    WHERE parent_id IS NULL,,    UNION ALL,,    SELECT n.id, n.name, n.parent_id,,           t.visited_ids || n.id,,           t.depth + 1,    FROM nodes n,    INNER JOIN tree_check t ON n.parent_id = t.id,    WHERE NOT n.id = ANY(t.visited_ids)  -- Cycle detection,      AND t.depth < 100,),SELECT * FROM tree_check;"
                  }
        ],
        tips: [
                  "Top-down traversal starts from NULL parents, bottom-up starts from a specific node and walks to the root.",
                  "Depth counter + safety check (WHERE depth < N) prevents infinite loops on data with cycles.",
                  "Array concatenation (ARRAY[id] || path) enables cycle detection — check NOT id = ANY(path) to stop circular traversal.",
                  "Path building with ARRAY (not string) is cleaner for ordering and display with array_to_string()."
        ],
        mistake: "No depth limit or cycle check on recursive queries with potentially circular data — infinite recursion can freeze the database.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Find all ancestors (bottom-up) ──────────────────\nWITH RECURSIVE ancestors AS (\n    SELECT id, name, parent_id, ARRAY[id] AS path, 0 AS depth\n    FROM categories\n    WHERE id = 5  -- Start from a leaf category\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM tree_check;",
        },
      },
      {
        id: "recursive-cte-numbers",
        fn: "Recursive CTEs for Number & Date Sequences",
        desc: "Generate number sequences, date ranges, and fill missing dates without generate_series().",
        category: "Recursive",
        subtitle: "Number generation, date ranges, fill missing data, sequence generation",
        signature: "WITH RECURSIVE nums AS (SELECT 1 AS n UNION ALL SELECT n+1 FROM nums WHERE n < 100)",
        descLong: "Recursive CTEs can generate sequences without a dedicated generate_series() function. Start with an anchor (1, 2024-01-01), increment in the recursive step, and use WHERE to stop. Useful for filling gaps in date data, generating report ranges, and creating test data. Date arithmetic (interval + date) works the same as numeric addition.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Recursive CTEs for Number & Date Sequences — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Generate numbers 1 to 100 ────────────────────────\nWITH RECURSIVE numbers AS (\n    SELECT 1 AS n\n    UNION ALL\n    SELECT n + 1 FROM numbers WHERE n < 100\n)\nSELECT * FROM numbers;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Recursive CTEs for Number & Date Sequences — common patterns you'll see in production.\n-- APPROACH  - Combine Recursive CTEs for Number & Date Sequences with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Generate date range (every day) ────────────────\nWITH RECURSIVE dates AS (\n    SELECT '2024-01-01'::DATE AS dt\n    UNION ALL\n    SELECT dt + INTERVAL '1 day'\n    FROM dates\n    WHERE dt < '2024-12-31'::DATE\n)\nSELECT * FROM dates ORDER BY dt;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Recursive CTEs for Number & Date Sequences — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Generate weekly dates ────────────────────────────,WITH RECURSIVE weeks AS (,    SELECT '2024-01-01'::DATE AS week_start,    UNION ALL,    SELECT week_start + INTERVAL '1 week',    FROM weeks,    WHERE week_start < '2024-12-31'::DATE,),SELECT week_start, week_start + INTERVAL '6 days' AS week_end,FROM weeks;,\n\n-- ── Generate hour-by-hour ────────────────────────────,WITH RECURSIVE hours AS (,    SELECT CAST('2024-01-01 00:00:00' AS TIMESTAMP) AS hr,    UNION ALL,    SELECT hr + INTERVAL '1 hour',    FROM hours,    WHERE hr < '2024-01-07 23:59:59'::TIMESTAMP,),SELECT * FROM hours;"
                  }
        ],
        tips: [
                  "Date sequences use INTERVAL + date arithmetic — DATE '2024-01-01' + INTERVAL '1 day' works on all databases.",
                  "For large ranges (years of daily data), the recursive CTE may be slow — consider a numbers/date dimension table instead.",
                  "CAST to explicit types (DATE, TIMESTAMP) ensures correct arithmetic — ambiguous types can cause unexpected behavior.",
                  "WHERE condition determines the stop point — ensure it will eventually be true to avoid infinite recursion."
        ],
        mistake: "Generating millions of rows with a recursive CTE (e.g., every second for a year) — recursive CTEs materialize each iteration, making this memory-intensive. Use a pre-built dimension table for large sequences.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Generate numbers 1 to 100 ────────────────────────\nWITH RECURSIVE numbers AS (\n    SELECT 1 AS n\n    UNION ALL\n    SELECT n + 1 FROM numbers WHERE n < 100\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM hours;",
        },
      },
      {
        id: "cte-vs-subquery",
        fn: "CTEs vs Subqueries vs Temporary Tables",
        desc: "Choose between CTEs, subqueries, and temp tables based on readability, materialization, and performance.",
        category: "CTEs",
        subtitle: "Readability, materialization, scope, performance trade-offs, caching",
        signature: "WITH cte AS (...) vs (SELECT ...) vs CREATE TEMP TABLE",
        descLong: "CTEs, subqueries, and temporary tables serve similar purposes but have different trade-offs. CTEs are most readable — top-down, reusable, and scoped to one query. Subqueries are inline, sometimes harder to read, but don't require a separate WITH clause. Temporary tables persist for a session and can be indexed. In PostgreSQL, CTEs are inlined by default (executed per reference), while temp tables are materialized. Use CTEs for readability, subqueries for one-off inline logic, temp tables for multi-step ETL or very expensive aggregations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CTEs vs Subqueries vs Temporary Tables — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── CTE approach (readable, inline by default) ───────\nWITH active_customers AS (\n    SELECT id, name FROM customers WHERE status = 'active'\n),\ncustomer_orders AS (\n    SELECT customer_id, COUNT(*) AS order_count, SUM(amount) AS total\n    FROM orders\n    WHERE customer_id IN (SELECT id FROM active_customers)\n    GROUP BY customer_id\n)\nSELECT a.name, co.order_count, co.total\nFROM active_customers a\nLEFT JOIN customer_orders co ON co.customer_id = a.id\nWHERE co.order_count > 10;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CTEs vs Subqueries vs Temporary Tables — common patterns you'll see in production.\n-- APPROACH  - Combine CTEs vs Subqueries vs Temporary Tables with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Subquery approach (inline, harder to read) ──────\nSELECT a.name, co.order_count, co.total\nFROM (SELECT id, name FROM customers WHERE status = 'active') a\nLEFT JOIN (\n    SELECT customer_id, COUNT(*) AS order_count, SUM(amount) AS total\n    FROM orders\n    WHERE customer_id IN (\n        SELECT id FROM customers WHERE status = 'active'\n    )\n    GROUP BY customer_id\n) co ON co.customer_id = a.id\nWHERE co.order_count > 10;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CTEs vs Subqueries vs Temporary Tables — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Temporary table approach (persists, can index) ───,CREATE TEMP TABLE temp_active_customers AS,SELECT id, name FROM customers WHERE status = 'active';,,CREATE TEMP TABLE temp_customer_orders AS,SELECT customer_id, COUNT(*) AS order_count, SUM(amount) AS total,FROM orders,WHERE customer_id IN (SELECT id FROM temp_active_customers),GROUP BY customer_id;,\n\n-- Can now index for reuse,CREATE INDEX idx_temp_customer_id ON temp_customer_orders(customer_id);,,SELECT a.name, co.order_count, co.total,FROM temp_active_customers a,LEFT JOIN temp_customer_orders co ON co.customer_id = a.id,WHERE co.order_count > 10;,\n\n-- ── Force CTE materialization (PostgreSQL) ──────────,WITH MATERIALIZED active_customers AS (,    SELECT id, name FROM customers WHERE status = 'active',),SELECT * FROM active_customers;"
                  }
        ],
        tips: [
                  "CTEs are best for readability — break complex queries into logical named steps.",
                  "Subqueries work when the logic is simple and inline — avoid deep nesting (3+ levels).",
                  "Temporary tables are best for ETL — persist across queries in a session and support indexes.",
                  "PostgreSQL inlines CTEs by default — use WITH ... AS MATERIALIZED to force computation once and reuse."
        ],
        mistake: "Using subqueries nested 4-5 levels deep instead of CTEs — impossible to understand and maintain. Convert to CTEs with descriptive names.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── CTE approach (readable, inline by default) ───────\nWITH active_customers AS (\n    SELECT id, name FROM customers WHERE status = 'active'\n),\ncustomer_orders AS (\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM active_customers;",
        },
      },
      {
        id: "cte-multiple",
        fn: "Multiple CTEs & Chaining",
        desc: "Chain multiple CTEs: each can reference previous ones, building a data pipeline step by step.",
        category: "CTEs",
        subtitle: "Multiple WITH clauses, chaining CTEs, dependency ordering, building blocks",
        signature: "WITH cte1 AS (...), cte2 AS (...), cte3 AS (... FROM cte1, cte2)",
        descLong: "Multiple CTEs form a data pipeline — each CTE can reference all previously defined CTEs. Order matters: define in bottom-up order (dependencies first). Later CTEs can combine and transform earlier ones. This structure makes complex queries readable: each step is a small, focused transformation. Name CTEs descriptively to document the pipeline.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Multiple CTEs & Chaining — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Multi-step pipeline ────────────────────────────\nWITH monthly_revenue AS (\n    SELECT\n        DATE_TRUNC('month', order_date) AS month,\n        SUM(amount) AS revenue,\n        COUNT(*) AS order_count\n    FROM orders\n    WHERE order_date >= '2024-01-01'\n    GROUP BY DATE_TRUNC('month', order_date)\n),\nwith_prior AS (\n    SELECT\n        month,\n        revenue,\n        LAG(revenue) OVER (ORDER BY month) AS prev_revenue,\n        order_count,\n        LAG(order_count) OVER (ORDER BY month) AS prev_orders\n    FROM monthly_revenue\n),\nwith_growth AS (\n    SELECT\n        *,\n        ROUND(((revenue - prev_revenue) / NULLIF(prev_revenue, 0) * 100)::NUMERIC, 2) AS revenue_growth_pct,\n        ROUND(((order_count - prev_orders) / NULLIF(prev_orders, 0) * 100)::NUMERIC, 2) AS order_growth_pct\n    FROM with_prior\n),\ncategorized AS (\n    SELECT\n        month,\n        revenue,\n        order_count,\n        revenue_growth_pct,\n        order_growth_pct,\n        CASE\n            WHEN revenue_growth_pct > 20 THEN 'high_growth'\n            WHEN revenue_growth_pct > 5 THEN 'moderate_growth'\n            WHEN revenue_growth_pct >= 0 THEN 'slight_growth'\n            ELSE 'declining'\n        END AS trend\n    FROM with_growth\n)\nSELECT * FROM categorized ORDER BY month;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Multiple CTEs & Chaining — common patterns you'll see in production.\n-- APPROACH  - Combine Multiple CTEs & Chaining with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── CTE referencing multiple prior CTEs ──────────────\nWITH customer_stats AS (\n    SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_spent\n    FROM orders\n    GROUP BY user_id\n),\npremium_customers AS (\n    SELECT user_id FROM customer_stats WHERE total_spent > 5000"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Multiple CTEs & Chaining — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n),\nloyal_customers AS (\n    SELECT user_id FROM customer_stats WHERE order_count > 50\n),\nvip_customers AS (\n    SELECT p.user_id FROM premium_customers p\n    INNER JOIN loyal_customers l ON l.user_id = p.user_id\n)\nSELECT * FROM vip_customers;"
                  }
        ],
        tips: [
                  "Build CTEs in logical dependency order — if B uses A, define A first.",
                  "Name CTEs by what they represent, not what they do — active_orders not filtered_orders.",
                  "Each CTE should represent a meaningful transformation step — use them as documentation.",
                  "A single final CTE can reference multiple earlier ones — combine, aggregate, or enrich data."
        ],
        mistake: "Defining too many CTEs without clear purpose — creates unnecessary indirection. Each CTE should represent a logical step in the pipeline.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Multi-step pipeline ────────────────────────────\nWITH monthly_revenue AS (\n    SELECT\n        DATE_TRUNC('month', order_date) AS month,\n        SUM(amount) AS revenue,\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM vip_customers;",
        },
      },
      {
        id: "cte-update-delete",
        fn: "CTEs in DML — INSERT, UPDATE, DELETE",
        desc: "Use CTEs with INSERT, UPDATE, DELETE, and RETURNING to modify data while referencing computed sets.",
        category: "CTEs",
        subtitle: "DML with CTEs, RETURNING clause, data modification, derived criteria",
        signature: "WITH cte AS (...) UPDATE table SET col = val WHERE id IN (SELECT ... FROM cte)  |  RETURNING",
        descLong: "CTEs aren't just for SELECT — PostgreSQL and SQL Server allow CTEs with INSERT, UPDATE, and DELETE. This is powerful for bulk operations based on computed criteria. The RETURNING clause returns the modified rows, enabling audit trails and verification. Use CTEs to define which rows to modify, then UPDATE/DELETE them in a single transaction.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of CTEs in DML — INSERT, UPDATE, DELETE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── CTE with UPDATE ────────────────────────────────\nWITH recent_inactive AS (\n    SELECT user_id\n    FROM users\n    WHERE last_login < CURRENT_DATE - INTERVAL '90 days'\n      AND status != 'inactive'\n)\nUPDATE users SET status = 'inactive'\nWHERE user_id IN (SELECT user_id FROM recent_inactive)\nRETURNING user_id, email, status;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of CTEs in DML — INSERT, UPDATE, DELETE — common patterns you'll see in production.\n-- APPROACH  - Combine CTEs in DML — INSERT, UPDATE, DELETE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── CTE with DELETE ─────────────────────────────────\nWITH old_sessions AS (\n    SELECT session_id\n    FROM sessions\n    WHERE created_at < CURRENT_DATE - INTERVAL '30 days'\n)\nDELETE FROM sessions\nWHERE session_id IN (SELECT session_id FROM old_sessions)\nRETURNING session_id, created_at;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of CTEs in DML — INSERT, UPDATE, DELETE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── INSERT with CTE (copy from source to dest) ──────,WITH new_products AS (,    SELECT product_id, name, price, category_id,    FROM source_products,    WHERE imported = false,),INSERT INTO products (product_id, name, price, category_id),SELECT * FROM new_products,RETURNING product_id, name, price;,\n\n-- ── Multi-step transformation with RETURNING ───────,WITH candidates AS (,    SELECT user_id, email, total_spent,    FROM users,    WHERE total_spent > 1000 AND last_login > CURRENT_DATE - INTERVAL '30 days',),,updated_users AS (,    UPDATE users SET tier = 'premium',    WHERE user_id IN (SELECT user_id FROM candidates),    RETURNING user_id, email, tier, updated_at,),SELECT * FROM updated_users;,\n\n-- ── Delete with audit log (before delete) ──────────,WITH deleted_records AS (,    DELETE FROM user_sessions,    WHERE user_id IN (,        SELECT user_id FROM users WHERE status = 'deleted',    ),    RETURNING user_id, session_id, created_at,),INSERT INTO audit_deleted_sessions (user_id, session_id, deleted_at),SELECT user_id, session_id, NOW() FROM deleted_records;"
                  }
        ],
        tips: [
                  "Use RETURNING to verify modifications — return the changed rows to confirm the operation affected the right data.",
                  "CTEs with DML are atomic — all-or-nothing within a transaction. If any modification fails, the whole transaction rolls back.",
                  "Combine INSERT INTO ... SELECT ... RETURNING for ETL operations — read from source, transform in CTE, insert, and verify.",
                  "DELETE with CTE enables audit trail — capture deleted rows with RETURNING, log them elsewhere."
        ],
        mistake: "Deleting rows without CTE/RETURNING, then trying to log what was deleted — once deleted, you can't retrieve the data. Capture with RETURNING before delete.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── CTE with UPDATE ────────────────────────────────\nWITH recent_inactive AS (\n    SELECT user_id\n    FROM users\n    WHERE last_login < CURRENT_DATE - INTERVAL '90 days'\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT user_id, session_id, NOW() FROM deleted_records;",
        },
      },
      {
        id: "cte-aggregation",
        fn: "Aggregation in CTEs — Multi-Step Rollup",
        desc: "Use CTEs to aggregate data in stages: detail → intermediate → final summary.",
        category: "CTEs",
        subtitle: "Hierarchical aggregation, multi-level rollup, progressive summarization, window functions",
        signature: "WITH detail AS (...), summary AS (SELECT ... FROM detail GROUP BY ...)",
        descLong: "Complex aggregations often require multiple levels: detail rows → intermediate subtotals → final summary. CTEs make this pattern clear. Each CTE aggregates the previous level, rolling data up. Combine with window functions (LAG, RANK) for running totals, rankings, and comparisons.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Aggregation in CTEs — Multi-Step Rollup — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Three-level aggregation: order detail → daily → monthly ──\nWITH order_detail AS (\n    SELECT order_id, user_id, product_id, amount, order_date\n    FROM orders\n    WHERE order_date >= '2024-01-01'\n),\ndaily_totals AS (\n    SELECT\n        DATE(order_date) AS order_day,\n        user_id,\n        COUNT(*) AS daily_orders,\n        SUM(amount) AS daily_revenue\n    FROM order_detail\n    GROUP BY DATE(order_date), user_id\n),\nmonthly_totals AS (\n    SELECT\n        DATE_TRUNC('month', order_day) AS month,\n        user_id,\n        SUM(daily_orders) AS monthly_orders,\n        SUM(daily_revenue) AS monthly_revenue\n    FROM daily_totals\n    GROUP BY DATE_TRUNC('month', order_day), user_id\n)\nSELECT * FROM monthly_totals ORDER BY month, user_id;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Aggregation in CTEs — Multi-Step Rollup — common patterns you'll see in production.\n-- APPROACH  - Combine Aggregation in CTEs — Multi-Step Rollup with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Customer tier aggregation with ranking ──────────\nWITH customer_spends AS (\n    SELECT user_id, SUM(amount) AS total_spent\n    FROM orders\n    GROUP BY user_id\n),\nwith_rank AS (\n    SELECT\n        user_id,\n        total_spent,\n        RANK() OVER (ORDER BY total_spent DESC) AS spend_rank,\n        PERCENT_RANK() OVER (ORDER BY total_spent DESC) AS percentile\n    FROM customer_spends\n),\ntiered AS (\n    SELECT\n        user_id,\n        total_spent,\n        spend_rank,\n        percentile,\n        CASE\n            WHEN percentile <= 0.05 THEN 'platinum'\n            WHEN percentile <= 0.20 THEN 'gold'\n            WHEN percentile <= 0.50 THEN 'silver'\n            ELSE 'bronze'\n        END AS tier\n    FROM with_rank\n)\nSELECT * FROM tiered ORDER BY spend_rank;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Aggregation in CTEs — Multi-Step Rollup — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Running totals and comparisons ───────────────────,WITH daily_sales AS (,    SELECT,        DATE(order_date) AS sale_date,,        SUM(amount) AS daily_revenue,,        COUNT(*) AS order_count,    FROM orders,    GROUP BY DATE(order_date),),,with_running_total AS (,    SELECT,        sale_date,,        daily_revenue,,        order_count,,        SUM(daily_revenue) OVER (ORDER BY sale_date) AS cumulative_revenue,,        LAG(daily_revenue) OVER (ORDER BY sale_date) AS prev_day_revenue,,        ROUND((daily_revenue - LAG(daily_revenue) OVER (ORDER BY sale_date)),              / NULLIF(LAG(daily_revenue) OVER (ORDER BY sale_date), 0) * 100, 2) AS day_over_day_pct,    FROM daily_sales,),SELECT * FROM with_running_total;"
                  }
        ],
        tips: [
                  "Structure aggregations as detail → intermediate → summary for clarity — each level is a single transformation.",
                  "Window functions (LAG, SUM OVER) work best in CTEs — compute rolling totals and rankings alongside aggregates.",
                  "Use PERCENT_RANK() for percentile-based segmentation (e.g., top 5% are platinum tier).",
                  "Each CTE should reduce rows or add summary columns — avoid CTEs that don't materially transform data."
        ],
        mistake: "Over-aggregating too early, losing detail needed for later analysis — aggregate gradually, keeping intermediate results available.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Three-level aggregation: order detail → daily → monthly ──\nWITH order_detail AS (\n    SELECT order_id, user_id, product_id, amount, order_date\n    FROM orders\n    WHERE order_date >= '2024-01-01'\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM with_running_total;",
        },
      },
      {
        id: "lateral-joins",
        fn: "LATERAL Joins — Correlated Subqueries as Tables",
        desc: "Use LATERAL (PostgreSQL) to apply row-by-row table functions, enabling per-row operations.",
        category: "Advanced",
        subtitle: "LATERAL, CROSS JOIN LATERAL, function per row, correlated subqueries, PL/pgsql results",
        signature: "FROM table1 t1 CROSS JOIN LATERAL (SELECT ... FROM table2 WHERE table2.id = t1.id) AS sub",
        descLong: "LATERAL allows a subquery or function call to reference columns from preceding tables in FROM. For each row in the outer table, execute the LATERAL subquery with that row's values. Similar to a SQL Server CROSS APPLY. Useful for: calling set-returning functions with per-row arguments, applying filters that depend on outer row values, and complex correlated operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LATERAL Joins — Correlated Subqueries as Tables — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Get top 3 orders per customer ────────────────────\nSELECT c.id, c.name, o.order_id, o.amount\nFROM customers c\nCROSS JOIN LATERAL (\n    SELECT order_id, amount, order_date\n    FROM orders\n    WHERE user_id = c.id\n    ORDER BY order_date DESC\n    LIMIT 3\n) o;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LATERAL Joins — Correlated Subqueries as Tables — common patterns you'll see in production.\n-- APPROACH  - Combine LATERAL Joins — Correlated Subqueries as Tables with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Call function with per-row argument ──────────────\nSELECT u.id, u.name, results.tier\nFROM users u\nCROSS JOIN LATERAL get_customer_tier(u.id) AS results(tier);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LATERAL Joins — Correlated Subqueries as Tables — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Generate rows per parent (unnest array) ─────────,SELECT c.id, c.name, tag,FROM categories c,CROSS JOIN LATERAL UNNEST(c.tags) AS tag;,\n\n-- ── Subquery with correlation to outer row ──────────,SELECT p.id, p.product_name,,       top_orders.order_id,,       top_orders.user_id,,       top_orders.amount,FROM products p,LEFT JOIN LATERAL (,    SELECT order_id, user_id, amount,    FROM orders o,    JOIN order_items oi ON oi.order_id = o.id,    WHERE oi.product_id = p.id,    ORDER BY o.order_date DESC,    LIMIT 5,) AS top_orders ON true;"
                  }
        ],
        tips: [
                  "LATERAL is PostgreSQL-specific — SQL Server uses CROSS APPLY / OUTER APPLY with similar syntax.",
                  "CROSS JOIN LATERAL returns only rows where the LATERAL subquery produces results — use LEFT JOIN LATERAL to include non-matching outer rows.",
                  "LATERAL enables function calls with dynamic arguments — call a stored function for each row with that row's values.",
                  "LIMIT in LATERAL is per outer row — useful for \"top N items per group\" patterns."
        ],
        mistake: "Attempting LATERAL on columns not yet selected — LATERAL can only reference tables in FROM clauses before it, not aliases from SELECT.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Get top 3 orders per customer ────────────────────\nSELECT c.id, c.name, o.order_id, o.amount\nFROM customers c\nCROSS JOIN LATERAL (\n    SELECT order_id, amount, order_date\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n) AS top_orders ON true;",
        },
      },
      {
        id: "cte-pagination",
        fn: "Pagination with CTEs & Row Numbering",
        desc: "Implement OFFSET/LIMIT and keyset pagination using ROW_NUMBER() CTEs.",
        category: "Advanced",
        subtitle: "ROW_NUMBER pagination, keyset pagination, cursor-like iteration, page boundaries",
        signature: "WITH numbered AS (SELECT *, ROW_NUMBER() OVER (...) AS rn FROM ...) SELECT ... WHERE rn BETWEEN x AND y",
        descLong: "Row numbering in a CTE enables page-based pagination without OFFSET. Assign ROW_NUMBER() grouped/ordered as needed, then SELECT rows within a range. This avoids scanning and discarding rows. Keyset pagination (WHERE id > last_id) is even faster for large datasets, but row numbering is simpler to understand and implement.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Pagination with CTEs & Row Numbering — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Pagination with ROW_NUMBER ────────────────────\nWITH numbered_products AS (\n    SELECT\n        id, name, price,\n        ROW_NUMBER() OVER (ORDER BY id) AS rn\n    FROM products\n)\nSELECT * FROM numbered_products\nWHERE rn BETWEEN 21 AND 40;  -- Page 2, 20 items per page"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Pagination with CTEs & Row Numbering — common patterns you'll see in production.\n-- APPROACH  - Combine Pagination with CTEs & Row Numbering with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Pagination within groups (e.g., top 5 per category) ──\nWITH ranked_by_category AS (\n    SELECT\n        id, name, price, category_id,\n        ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rn\n    FROM products\n)\nSELECT * FROM ranked_by_category WHERE rn <= 5;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Pagination with CTEs & Row Numbering — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Get page count for pagination UI ───────────────,WITH paged AS (,    SELECT,        id, name, price,,        ROW_NUMBER() OVER (ORDER BY id) AS rn,,        CEIL(COUNT(*) OVER () / 20.0) AS total_pages,    FROM products,),SELECT * FROM paged WHERE rn BETWEEN 21 AND 40;"
                  }
        ],
        tips: [
                  "ROW_NUMBER() OVER (ORDER BY col) assigns sequential numbers — use BETWEEN (page-1)*size+1 AND page*size for offset-based pagination.",
                  "PARTITION BY enables top-N-per-group — e.g., ROW_NUMBER() OVER (PARTITION BY category_id) for top 5 products per category.",
                  "Keyset pagination (WHERE id > last_id) is faster but more complex — row numbering is easier for traditional page-based UIs.",
                  "COUNT(*) OVER () gives total row count for pagination UI — use CEIL(count / page_size) to compute page count."
        ],
        mistake: "Using OFFSET/LIMIT directly on large tables — OFFSET scans and discards rows. Use ROW_NUMBER in a CTE or keyset pagination (WHERE id > last_id).",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Pagination with ROW_NUMBER ────────────────────\nWITH numbered_products AS (\n    SELECT\n        id, name, price,\n        ROW_NUMBER() OVER (ORDER BY id) AS rn\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM paged WHERE rn BETWEEN 21 AND 40;",
        },
      },
      {
        id: "cte-dedup",
        fn: "Deduplication with CTEs",
        desc: "Identify and remove duplicate rows using ROW_NUMBER() and window functions.",
        category: "Advanced",
        subtitle: "ROW_NUMBER, PARTITION BY, duplicate removal, keep first/last, delete duplicates",
        signature: "WITH ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY col ORDER BY ...) AS rn FROM ...) DELETE FROM ... WHERE id IN (SELECT id FROM ranked WHERE rn > 1)",
        descLong: "Duplicates happen in ETL. Use ROW_NUMBER() OVER (PARTITION BY duplicate_columns) to assign 1 to the first row, 2+ to duplicates. Then DELETE rows where rn > 1. Configurable ordering (by created_at DESC to keep newest, ASC for oldest) controls which duplicate is retained.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Deduplication with CTEs — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Find duplicate emails ──────────────────────────\nWITH ranked_users AS (\n    SELECT\n        id, email, created_at,\n        ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) AS rn\n    FROM users\n)\nSELECT * FROM ranked_users WHERE rn > 1\nORDER BY email, rn;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Deduplication with CTEs — common patterns you'll see in production.\n-- APPROACH  - Combine Deduplication with CTEs with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Delete duplicate emails, keeping first created ───\nWITH ranked_users AS (\n    SELECT\n        id, email, created_at,\n        ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) AS rn\n    FROM users\n)\nDELETE FROM users\nWHERE id IN (SELECT id FROM ranked_users WHERE rn > 1)\nRETURNING id, email;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Deduplication with CTEs — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Keep the most recent duplicate ──────────────────,WITH ranked_users AS (,    SELECT,        id, email, created_at, updated_at,,        ROW_NUMBER() OVER (PARTITION BY email ORDER BY updated_at DESC) AS rn,    FROM users,),DELETE FROM users,WHERE id IN (SELECT id FROM ranked_users WHERE rn > 1);,\n\n-- ── Dedup on multiple columns ───────────────────────,WITH ranked_orders AS (,    SELECT,        id, user_id, product_id, amount, order_date,,        ROW_NUMBER() OVER (,            PARTITION BY user_id, product_id, DATE(order_date),            ORDER BY created_at DESC,        ) AS rn,    FROM orders,),DELETE FROM orders,WHERE id IN (SELECT id FROM ranked_orders WHERE rn > 1);"
                  }
        ],
        tips: [
                  "PARTITION BY the columns that define uniqueness, ORDER BY to choose which duplicate to keep.",
                  "ORDER BY created_at ASC keeps the oldest, DESC keeps newest — define your retention rule clearly.",
                  "Test with SELECT before DELETE — verify the CTE identifies the right duplicates.",
                  "Use RETURNING to log deleted rows for audit purposes."
        ],
        mistake: "Deduplicating without a clear rule — which duplicate should remain? Document and test the retention policy first.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Find duplicate emails ──────────────────────────\nWITH ranked_users AS (\n    SELECT\n        id, email, created_at,\n        ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) AS rn\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nWHERE id IN (SELECT id FROM ranked_orders WHERE rn > 1);",
        },
      },
      {
        id: "cte-pivot",
        fn: "Pivot/Unpivot with CTEs",
        desc: "Pivot rows to columns (conditional aggregation) and unpivot columns to rows.",
        category: "Advanced",
        subtitle: "Conditional aggregation, CASE in aggregates, PIVOT syntax, UNPIVOT, crosstabs",
        signature: "SELECT category, SUM(CASE WHEN quarter = 1 THEN amount END) AS q1, ...",
        descLong: "Pivoting transforms rows into columns using conditional aggregation with CASE. Unpivoting transforms columns into rows (inverse operation). Both reshape data for reporting and comparison. PostgreSQL uses conditional CASE WHEN in aggregates; SQL Server has PIVOT syntax. CTEs prepare data before pivoting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Pivot/Unpivot with CTEs — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Pivot: quarters as columns (PostgreSQL conditional aggregation) ──\nWITH quarterly_revenue AS (\n    SELECT\n        DATE_PART('quarter', order_date)::INT AS quarter,\n        DATE_PART('year', order_date)::INT AS year,\n        region,\n        amount\n    FROM orders\n    WHERE order_date >= '2024-01-01'\n)\nSELECT\n    region,\n    SUM(CASE WHEN quarter = 1 THEN amount ELSE 0 END) AS q1,\n    SUM(CASE WHEN quarter = 2 THEN amount ELSE 0 END) AS q2,\n    SUM(CASE WHEN quarter = 3 THEN amount ELSE 0 END) AS q3,\n    SUM(CASE WHEN quarter = 4 THEN amount ELSE 0 END) AS q4,\n    SUM(amount) AS total\nFROM quarterly_revenue\nWHERE year = 2024\nGROUP BY region\nORDER BY region;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Pivot/Unpivot with CTEs — common patterns you'll see in production.\n-- APPROACH  - Combine Pivot/Unpivot with CTEs with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Pivot: product names as columns ────────────────\nWITH product_quantities AS (\n    SELECT\n        order_id,\n        product_name,\n        quantity\n    FROM orders o\n    JOIN order_items oi ON oi.order_id = o.id\n    JOIN products p ON p.id = oi.product_id\n)\nSELECT\n    order_id,\n    SUM(CASE WHEN product_name = 'Widget A' THEN quantity END) AS widget_a_qty,\n    SUM(CASE WHEN product_name = 'Widget B' THEN quantity END) AS widget_b_qty,\n    SUM(CASE WHEN product_name = 'Gadget C' THEN quantity END) AS gadget_c_qty\nFROM product_quantities\nGROUP BY order_id;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Pivot/Unpivot with CTEs — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Unpivot: columns to rows (PostgreSQL) ──────────,WITH quarterly_data AS (,    SELECT region, q1, q2, q3, q4 FROM quarterly_revenue_pivot,),SELECT region, quarter, revenue,FROM quarterly_data,CROSS JOIN LATERAL (,    VALUES ('Q1', q1), ('Q2', q2), ('Q3', q3), ('Q4', q4),) AS unpivoted(quarter, revenue),WHERE revenue IS NOT NULL;"
                  }
        ],
        tips: [
                  "Pivot with SUM(CASE WHEN condition THEN value END) — the CASE branch determines the column, aggregation determines the value.",
                  "Unpivoting with CROSS JOIN LATERAL VALUES is clean — converts multiple columns into key-value pairs.",
                  "Use FILTER (WHERE ...) shorthand in aggregates for readability: SUM(amount) FILTER (WHERE quarter = 1).",
                  "Pivot queries are wide (many columns) — confirm the set of pivot values is fixed or manageable."
        ],
        mistake: "Hardcoding CASE branches for all possible values without filtering — result has many empty columns. Filter or select only relevant values.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Pivot: quarters as columns (PostgreSQL conditional aggregation) ──\nWITH quarterly_revenue AS (\n    SELECT\n        DATE_PART('quarter', order_date)::INT AS quarter,\n        DATE_PART('year', order_date)::INT AS year,\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nWHERE revenue IS NOT NULL;",
        },
      },
      {
        id: "materialized-cte",
        fn: "Materialized CTEs (PostgreSQL)",
        desc: "Force CTE materialization with WITH ... AS MATERIALIZED for performance control.",
        category: "Performance",
        subtitle: "MATERIALIZED, INLINED, CTE materialization, optimization, computation control",
        signature: "WITH cte AS MATERIALIZED (SELECT ...) or WITH cte AS NOT MATERIALIZED (SELECT ...)",
        descLong: "By default, PostgreSQL inlines CTEs — evaluates them at the call site, potentially repeating computation. MATERIALIZED forces the CTE to compute once and reuse the result. Useful when a CTE is expensive and referenced multiple times, or when inlining causes poor query plans. NOT MATERIALIZED (default) can be explicit to prevent accidental forcing. This is PostgreSQL-specific; other databases have similar but differently-named features.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Materialized CTEs (PostgreSQL) — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── CTE referenced multiple times (may benefit from MATERIALIZED) ──\nWITH MATERIALIZED expensive_cte AS (\n    SELECT user_id, SUM(amount) AS total_spent\n    FROM orders\n    WHERE order_date >= '2024-01-01'\n    GROUP BY user_id\n)\nSELECT\n    'high_value' AS segment,\n    COUNT(*) AS users,\n    AVG(total_spent) AS avg_spent\nFROM expensive_cte\nWHERE total_spent > 5000\n\nUNION ALL\n\nSELECT\n    'medium_value',\n    COUNT(*),\n    AVG(total_spent)\nFROM expensive_cte\nWHERE total_spent BETWEEN 1000 AND 5000;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Materialized CTEs (PostgreSQL) — common patterns you'll see in production.\n-- APPROACH  - Combine Materialized CTEs (PostgreSQL) with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── NOT MATERIALIZED (default, inline at call site) ─\nWITH NOT MATERIALIZED simple_cte AS (\n    SELECT id, name FROM users WHERE status = 'active'\n)\nSELECT * FROM simple_cte\nWHERE created_at > '2024-01-01';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Materialized CTEs (PostgreSQL) — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Forcing materialization for query plan improvement ──,WITH MATERIALIZED monthly_summary AS (,    SELECT,        DATE_TRUNC('month', order_date) AS month,,        region,,        COUNT(*) AS order_count,,        SUM(amount) AS revenue,    FROM orders,    GROUP BY DATE_TRUNC('month', order_date), region,),SELECT m.month, m.region, m.revenue,,       LAG(m.revenue) OVER (PARTITION BY m.region ORDER BY m.month) AS prev_revenue,FROM monthly_summary m,WHERE m.month >= '2024-01-01';"
                  }
        ],
        tips: [
                  "Materialization trades memory for repeated execution time — only use MATERIALIZED when a CTE is expensive and reused.",
                  "Check EXPLAIN output to see if a CTE is inlined — Subplan name indicates materialization, no subplan means inlined.",
                  "CTEs with aggregation over large tables benefit from MATERIALIZED — avoids repeated GROUP BY execution.",
                  "NOT MATERIALIZED is the default — explicit use clarifies intent when optimizer might otherwise choose materialization."
        ],
        mistake: "Blindly using MATERIALIZED on all CTEs — inlining is usually faster for simple CTEs. Only materialize when expensive and reused.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── CTE referenced multiple times (may benefit from MATERIALIZED) ──\nWITH MATERIALIZED expensive_cte AS (\n    SELECT user_id, SUM(amount) AS total_spent\n    FROM orders\n    WHERE order_date >= '2024-01-01'\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nWHERE m.month >= '2024-01-01';",
        },
      },
    ],
  },
]

export default { meta, sections }
