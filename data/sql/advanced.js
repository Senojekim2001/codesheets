export const meta = {
  "id": "sql-advanced",
  "label": "Advanced SQL",
  "icon": "🗄️",
  "description": "Advanced SQL: transactions, security, partitioning, recursive CTEs, full-text search, and data warehousing patterns."
}

export const sections = [

  // ── Section 1: Transactions & Isolation ─────────────────────────────────────────
  {
    id: "transactions-isolation",
    title: "Transactions & Isolation",
    entries: [
      {
        id: "transaction-basics",
        fn: "Transactions (BEGIN, COMMIT, ROLLBACK)",
        desc: "Group SQL statements into atomic units — all succeed or all fail, ensuring data consistency.",
        category: "Transactions",
        subtitle: "ACID properties, savepoints, error handling",
        signature: "BEGIN; ... COMMIT;  |  ROLLBACK TO savepoint;",
        descLong: "Transactions guarantee ACID properties: Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes). Use SAVEPOINT for partial rollbacks within a transaction. Always handle errors to avoid leaving transactions open.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Transactions (BEGIN, COMMIT, ROLLBACK) — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Basic transaction\nBEGIN;\n  UPDATE accounts SET balance = balance - 100 WHERE id = 1;\n  UPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Transactions (BEGIN, COMMIT, ROLLBACK) — common patterns you'll see in production.\n-- APPROACH  - Combine Transactions (BEGIN, COMMIT, ROLLBACK) with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- With error handling (PostgreSQL)\nBEGIN;\n  INSERT INTO orders (user_id, total) VALUES (1, 99.99);\n  INSERT INTO order_items (order_id, product_id, qty)\n    VALUES (currval('orders_id_seq'), 42, 2);\nCOMMIT;\n-- If any statement fails, the whole transaction is rolled back"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Transactions (BEGIN, COMMIT, ROLLBACK) — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Savepoints for partial rollback,BEGIN;,  INSERT INTO users (name) VALUES ('Alice');,  SAVEPOINT sp1;,  INSERT INTO users (name) VALUES ('Bob');,  -- Oops, undo Bob but keep Alice,  ROLLBACK TO sp1;,  INSERT INTO users (name) VALUES ('Charlie');,COMMIT;  -- Alice and Charlie are saved, Bob is not,\n\n-- Explicit rollback on error (application pattern),-- BEGIN;,-- try {,--   execute(\"UPDATE inventory SET qty = qty - 1 WHERE id = ?\", [itemId]);,--   execute(\"INSERT INTO sales (item_id, sold_at) VALUES (?, NOW())\", [itemId]);,--   execute(\"COMMIT\");,-- } catch (e) {,--   execute(\"ROLLBACK\");,--   throw e;,-- }"
                  }
        ],
        tips: [
                  "Always COMMIT or ROLLBACK — an open transaction holds locks and blocks other queries.",
                  "Use SAVEPOINT inside complex transactions to roll back partial work without aborting everything.",
                  "In application code, wrap transactions in try/catch and ROLLBACK on error.",
                  "Autocommit is usually ON by default — each statement is its own transaction unless you BEGIN explicitly."
        ],
        mistake: "Forgetting to COMMIT or ROLLBACK — the transaction stays open, holding locks and potentially blocking all other queries to the affected tables.",
        shorthand: {
          verbose: "BEGIN;\n  UPDATE accounts SET balance = balance - 100 WHERE id = 1;\n  UPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;\n-- If either UPDATE fails, both are rolled back",
          concise: "BEGIN;\n  ... statements ...\nCOMMIT; -- All-or-nothing atomicity",
        },
      },
      {
        id: "isolation-levels",
        fn: "Isolation Levels & Locking",
        desc: "Control how concurrent transactions see each other's changes — from dirty reads to serializable isolation.",
        category: "Transactions",
        subtitle: "READ COMMITTED, REPEATABLE READ, SERIALIZABLE",
        signature: "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;  |  SELECT ... FOR UPDATE;",
        descLong: "Isolation levels control visibility of uncommitted changes between concurrent transactions. READ UNCOMMITTED: sees dirty data. READ COMMITTED (default in PostgreSQL): sees only committed data. REPEATABLE READ: snapshot isolation. SERIALIZABLE: strongest, as if transactions ran sequentially. SELECT FOR UPDATE locks rows to prevent concurrent modifications.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Isolation Levels & Locking — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Set isolation level\nSET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\n  SELECT balance FROM accounts WHERE id = 1;\n  -- Other transactions can't change this row's visibility\n  UPDATE accounts SET balance = balance - 50 WHERE id = 1;\nCOMMIT;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Isolation Levels & Locking — common patterns you'll see in production.\n-- APPROACH  - Combine Isolation Levels & Locking with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Serializable — prevents phantom reads\nSET TRANSACTION ISOLATION LEVEL SERIALIZABLE;\nBEGIN;\n  SELECT COUNT(*) FROM bookings WHERE room_id = 1 AND date = '2024-03-15';\n  -- If count is 0, safe to insert\n  INSERT INTO bookings (room_id, date, user_id) VALUES (1, '2024-03-15', 42);\nCOMMIT;\n-- Serializable detects if another transaction inserted between SELECT and INSERT"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Isolation Levels & Locking — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- SELECT FOR UPDATE — row-level locking,BEGIN;,  SELECT * FROM inventory WHERE product_id = 1 FOR UPDATE;,  -- This row is now locked — other transactions wait,  UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 1;,COMMIT;,\n\n-- Skip locked rows (for job queues),SELECT * FROM jobs,  WHERE status = 'pending',  ORDER BY created_at,  LIMIT 1,  FOR UPDATE SKIP LOCKED;  -- skip rows locked by other workers,\n\n-- Advisory locks (application-level coordination),SELECT pg_advisory_lock(12345);  -- acquire lock,-- ... do work ...,SELECT pg_advisory_unlock(12345);  -- release lock"
                  }
        ],
        tips: [
                  "READ COMMITTED is the safest default — it prevents dirty reads without excessive locking.",
                  "SERIALIZABLE catches all anomalies but may abort transactions on conflict — your app must retry.",
                  "FOR UPDATE SKIP LOCKED is perfect for job queues — workers pick different pending jobs without blocking.",
                  "Advisory locks coordinate application-level resources (like \"only one cron job at a time\") without table locks."
        ],
        mistake: "Using SERIALIZABLE everywhere for \"safety\" — it causes transaction retries under load. Use READ COMMITTED and explicit locking (FOR UPDATE) where needed.",
        shorthand: {
          verbose: "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\n  SELECT balance FROM accounts WHERE id = 1;\n  UPDATE accounts SET balance = balance - 50 WHERE id = 1;\nCOMMIT;",
          concise: "SELECT * FROM inventory WHERE product_id = 1 FOR UPDATE;\nUPDATE inventory SET quantity = quantity - 1 WHERE product_id = 1;",
        },
      },
    ],
  },

  // ── Section 2: Views & Security ─────────────────────────────────────────
  {
    id: "views-security",
    title: "Views & Security",
    entries: [
      {
        id: "views-materialized",
        fn: "Views & Materialized Views",
        desc: "Virtual tables (views) for abstraction and materialized views for caching expensive query results.",
        category: "Schema",
        subtitle: "CREATE VIEW, CREATE MATERIALIZED VIEW, REFRESH",
        signature: "CREATE VIEW name AS SELECT ...;  |  CREATE MATERIALIZED VIEW name AS SELECT ...;",
        descLong: "Views are saved queries that act like virtual tables — they simplify complex joins, enforce security (expose only certain columns), and provide a stable API over evolving schemas. Materialized views store the result physically — fast reads but stale until refreshed. Use REFRESH MATERIALIZED VIEW CONCURRENTLY for zero-downtime refreshes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Views & Materialized Views — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Regular view — virtual table\nCREATE OR REPLACE VIEW active_users AS\n  SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count\n  FROM users u\n  LEFT JOIN orders o ON o.user_id = u.id\n  WHERE u.active = true\n  GROUP BY u.id, u.name, u.email;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Views & Materialized Views — common patterns you'll see in production.\n-- APPROACH  - Combine Views & Materialized Views with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Use like a table\nSELECT * FROM active_users WHERE order_count > 5;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Views & Materialized Views — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Updatable view (simple views can be updated),CREATE VIEW us_customers AS,  SELECT * FROM customers WHERE country = 'US',  WITH CHECK OPTION;  -- prevents inserting non-US customers through this view,,INSERT INTO us_customers (name, country) VALUES ('Alice', 'US');    -- OK,-- INSERT INTO us_customers (name, country) VALUES ('Bob', 'UK');   -- ERROR,\n\n-- Materialized view — cached results,CREATE MATERIALIZED VIEW monthly_revenue AS,  SELECT,    DATE_TRUNC('month', created_at) AS month,,    SUM(total) AS revenue,,    COUNT(*) AS order_count,  FROM orders,  GROUP BY DATE_TRUNC('month', created_at),  ORDER BY month;,\n\n-- Fast reads (no recomputation),SELECT * FROM monthly_revenue WHERE month >= '2024-01-01';,\n\n-- Refresh (full rebuild),REFRESH MATERIALIZED VIEW monthly_revenue;,\n\n-- Concurrent refresh (no lock, requires unique index),CREATE UNIQUE INDEX ON monthly_revenue (month);,REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue;"
                  }
        ],
        tips: [
                  "Views are zero-cost abstractions — the query optimizer inlines them like macros.",
                  "Materialized views trade freshness for speed — schedule REFRESH via cron for dashboards and reports.",
                  "CONCURRENTLY refresh requires a unique index but doesn't lock reads during refresh.",
                  "Use views to expose a stable API — you can change underlying tables without breaking consumers."
        ],
        mistake: "Querying a materialized view and expecting real-time data — it's a snapshot from the last REFRESH. For real-time needs, use a regular view or trigger-based refresh.",
        shorthand: {
          verbose: "CREATE VIEW active_users AS\n  SELECT u.id, u.name, COUNT(o.id) AS order_count\n  FROM users u\n  LEFT JOIN orders o ON o.user_id = u.id\n  WHERE u.active = true\n  GROUP BY u.id, u.name;",
          concise: "CREATE MATERIALIZED VIEW monthly_revenue AS\n  SELECT DATE_TRUNC('month', created_at) AS month, SUM(total) AS revenue\n  FROM orders GROUP BY DATE_TRUNC('month', created_at);\nREFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue;",
        },
      },
      {
        id: "roles-rls",
        fn: "Roles, Grants & Row-Level Security",
        desc: "Database access control — roles, permissions, and row-level security for multi-tenant applications.",
        category: "Security",
        subtitle: "CREATE ROLE, GRANT, REVOKE, RLS policies",
        signature: "GRANT SELECT ON table TO role;  |  CREATE POLICY name ON table FOR SELECT USING (condition);",
        descLong: "PostgreSQL roles manage authentication and authorization. GRANT/REVOKE control table-level permissions. Row-Level Security (RLS) adds row-level filtering — each user only sees their own data. RLS is essential for multi-tenant SaaS: one table, many tenants, automatic isolation. Enable with ALTER TABLE ... ENABLE ROW LEVEL SECURITY.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Roles, Grants & Row-Level Security — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Create roles\nCREATE ROLE app_readonly;\nCREATE ROLE app_readwrite;\nCREATE ROLE app_admin;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Roles, Grants & Row-Level Security — common patterns you'll see in production.\n-- APPROACH  - Combine Roles, Grants & Row-Level Security with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Grant permissions\nGRANT CONNECT ON DATABASE myapp TO app_readonly;\nGRANT USAGE ON SCHEMA public TO app_readonly;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;\n\nGRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_readwrite;\nGRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Roles, Grants & Row-Level Security — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Create user with role,CREATE USER analytics_user WITH PASSWORD 'secure_password';,GRANT app_readonly TO analytics_user;,\n\n-- Row-Level Security (multi-tenant),ALTER TABLE documents ENABLE ROW LEVEL SECURITY;,\n\n-- Policy: users only see their own documents,CREATE POLICY user_documents ON documents,  FOR ALL,  USING (user_id = current_setting('app.current_user_id')::int),  WITH CHECK (user_id = current_setting('app.current_user_id')::int);,\n\n-- Set the user context (in your application),SET app.current_user_id = '42';,SELECT * FROM documents;  -- only sees user 42's documents,\n\n-- Tenant isolation for SaaS,CREATE POLICY tenant_isolation ON orders,  FOR ALL,  USING (tenant_id = current_setting('app.tenant_id')::uuid);,\n\n-- Admin bypass,CREATE POLICY admin_all ON documents,  FOR ALL,  TO app_admin,  USING (true);  -- admins see everything"
                  }
        ],
        tips: [
                  "Use roles for groups of permissions, then assign roles to users — easier to manage than per-user grants.",
                  "RLS policies are enforced even for complex queries, joins, and subqueries — truly transparent security.",
                  "Set current_setting() in your connection middleware — every query automatically filters to the right tenant.",
                  "Table owners bypass RLS by default — use ALTER TABLE ... FORCE ROW LEVEL SECURITY to apply to owners too."
        ],
        mistake: "Implementing tenant isolation in application code instead of RLS — every query needs a WHERE tenant_id = ? clause, and one missed filter leaks data. RLS enforces it at the database level.",
        shorthand: {
          verbose: "CREATE ROLE app_readonly;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;\nCREATE USER analytics_user WITH PASSWORD 'pass';\nGRANT app_readonly TO analytics_user;",
          concise: "ALTER TABLE documents ENABLE ROW LEVEL SECURITY;\nCREATE POLICY user_docs ON documents FOR ALL\n  USING (user_id = current_setting('app.user_id')::int);",
        },
      },
    ],
  },

  // ── Section 3: Advanced Patterns ─────────────────────────────────────────
  {
    id: "advanced-patterns",
    title: "Advanced Patterns",
    entries: [
      {
        id: "recursive-cte",
        fn: "Recursive CTEs",
        desc: "Traverse hierarchical data — org charts, threaded comments, category trees, graph paths.",
        category: "Queries",
        subtitle: "WITH RECURSIVE for tree and graph traversal",
        signature: "WITH RECURSIVE cte AS (base UNION ALL recursive) SELECT * FROM cte;",
        descLong: "Recursive CTEs have two parts: a base case (the starting rows) and a recursive step (joins back to the CTE). The database iterates until no new rows are produced. Use for hierarchical data (org charts, category trees), graph traversal (shortest path), and generating series. Add a depth limit to prevent infinite loops in cyclic graphs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Recursive CTEs — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Org chart traversal\nWITH RECURSIVE org_tree AS (\n  -- Base case: top-level manager\n  SELECT id, name, manager_id, 1 AS depth, name::text AS path\n  FROM employees\n  WHERE manager_id IS NULL\n\n  UNION ALL"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Recursive CTEs — common patterns you'll see in production.\n-- APPROACH  - Combine Recursive CTEs with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Recursive step: find reports\n  SELECT e.id, e.name, e.manager_id, t.depth + 1,\n         t.path || ' > ' || e.name\n  FROM employees e\n  JOIN org_tree t ON e.manager_id = t.id\n  WHERE t.depth < 10  -- safety limit\n)\nSELECT * FROM org_tree ORDER BY path;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Recursive CTEs — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Threaded comments,WITH RECURSIVE comment_tree AS (,  SELECT id, parent_id, content, author, created_at,,         0 AS depth, ARRAY[id] AS path,  FROM comments,  WHERE parent_id IS NULL AND post_id = 1,,  UNION ALL,,  SELECT c.id, c.parent_id, c.content, c.author, c.created_at,,         ct.depth + 1, ct.path || c.id,  FROM comments c,  JOIN comment_tree ct ON c.parent_id = ct.id,),SELECT repeat('  ', depth) || author || ': ' || content AS threaded,FROM comment_tree,ORDER BY path;,\n\n-- Generate date series (no table needed),WITH RECURSIVE dates AS (,  SELECT DATE '2024-01-01' AS dt,  UNION ALL,  SELECT dt + INTERVAL '1 day' FROM dates WHERE dt < '2024-12-31',),SELECT dt, EXTRACT(DOW FROM dt) AS day_of_week FROM dates;"
                  }
        ],
        tips: [
                  "Always add a depth or iteration limit (WHERE depth < N) to prevent infinite loops in cyclic data.",
                  "Use ARRAY path columns to reconstruct the full hierarchy and detect cycles.",
                  "Recursive CTEs with UNION (not UNION ALL) automatically eliminate duplicates — useful for graph traversal.",
                  "PostgreSQL: generate_series() is simpler than recursive CTE for date/number ranges."
        ],
        mistake: "Running a recursive CTE on cyclic data without a depth limit — it loops forever until the query times out or crashes. Always add WHERE depth < N in the recursive step.",
        shorthand: {
          verbose: "WITH RECURSIVE org_tree AS (\n  SELECT id, name, manager_id, 1 AS depth FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, t.depth + 1\n  FROM employees e JOIN org_tree t ON e.manager_id = t.id WHERE t.depth < 10\n) SELECT * FROM org_tree;",
          concise: "WITH RECURSIVE dates AS (\n  SELECT '2024-01-01'::date AS dt UNION ALL\n  SELECT dt + INTERVAL '1 day' FROM dates WHERE dt < '2024-12-31'\n) SELECT * FROM dates;",
        },
      },
      {
        id: "partitioning",
        fn: "Table Partitioning",
        desc: "Split large tables into smaller physical partitions for faster queries and easier maintenance.",
        category: "Performance",
        subtitle: "RANGE, LIST, HASH partitioning, partition pruning",
        signature: "CREATE TABLE t (...) PARTITION BY RANGE (column);  |  CREATE TABLE t_2024 PARTITION OF t FOR VALUES FROM ... TO ...;",
        descLong: "Partitioning splits a table into smaller physical tables while presenting a single logical table. The query planner skips irrelevant partitions (partition pruning). RANGE partitioning: time-series data by date. LIST partitioning: by category or region. HASH partitioning: even distribution. Benefits: faster queries on partition key, parallel scans, easy data lifecycle (DROP old partition vs DELETE).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Table Partitioning — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Range partitioning (time-series)\nCREATE TABLE events (\n  id BIGSERIAL,\n  event_type TEXT NOT NULL,\n  payload JSONB,\n  created_at TIMESTAMPTZ NOT NULL\n) PARTITION BY RANGE (created_at);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Table Partitioning — common patterns you'll see in production.\n-- APPROACH  - Combine Table Partitioning with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Create monthly partitions\nCREATE TABLE events_2024_01 PARTITION OF events\n  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');\nCREATE TABLE events_2024_02 PARTITION OF events\n  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');\n-- ... more months"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Table Partitioning — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Default partition catches everything else,CREATE TABLE events_default PARTITION OF events DEFAULT;,\n\n-- Queries automatically use partition pruning,SELECT * FROM events WHERE created_at >= '2024-01-15' AND created_at < '2024-02-01';,-- Only scans events_2024_01, skips all others,\n\n-- List partitioning (by category),CREATE TABLE orders (,  id SERIAL,,  region TEXT,,  total DECIMAL,) PARTITION BY LIST (region);,,CREATE TABLE orders_us PARTITION OF orders FOR VALUES IN ('US', 'CA');,CREATE TABLE orders_eu PARTITION OF orders FOR VALUES IN ('DE', 'FR', 'UK');,CREATE TABLE orders_asia PARTITION OF orders FOR VALUES IN ('JP', 'KR', 'CN');,\n\n-- Detach old partitions (instant, no DELETE needed),ALTER TABLE events DETACH PARTITION events_2023_01;,DROP TABLE events_2023_01;  -- reclaim space immediately,\n\n-- Attach new partition,CREATE TABLE events_2025_01 (LIKE events INCLUDING ALL);,ALTER TABLE events ATTACH PARTITION events_2025_01,  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');"
                  }
        ],
        tips: [
                  "Partition pruning only works when the partition key is in the WHERE clause — always filter on it.",
                  "DETACH + DROP is instant data deletion — much faster than DELETE FROM for removing old data.",
                  "Create partitions ahead of time (via cron job) to avoid INSERT failures when a new month starts.",
                  "Indexes on partitioned tables are created per-partition — each partition gets its own index."
        ],
        mistake: "Partitioning small tables — partitioning adds overhead (planning, partition pruning). Only partition tables with millions+ rows where queries consistently filter on the partition key.",
        shorthand: {
          verbose: "CREATE TABLE events (id BIGSERIAL, created_at TIMESTAMPTZ) PARTITION BY RANGE (created_at);\nCREATE TABLE events_2024_01 PARTITION OF events FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');\n-- ... repeat for each month",
          concise: "CREATE TABLE events (...) PARTITION BY RANGE (created_at);\n-- Partition pruning: SELECT ... WHERE created_at >= '2024-01-15' only scans relevant partition",
        },
      },
      {
        id: "full-text-search",
        fn: "Full-Text Search",
        desc: "Built-in text search with ranking, stemming, and phrase matching — often replaces Elasticsearch for simpler needs.",
        category: "Search",
        subtitle: "tsvector, tsquery, GIN index, ts_rank",
        signature: "WHERE to_tsvector(text) @@ to_tsquery(query)  |  ts_rank(vector, query)",
        descLong: "PostgreSQL full-text search converts text to tsvector (normalized word tokens) and queries to tsquery (boolean word search). Supports stemming (running→run), ranking, phrase search, and language-specific dictionaries. GIN indexes make searches fast. For many applications, this eliminates the need for Elasticsearch or Algolia.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Full-Text Search — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Basic full-text search\nSELECT title, body\nFROM articles\nWHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('english', 'database & performance');"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Full-Text Search — common patterns you'll see in production.\n-- APPROACH  - Combine Full-Text Search with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Add a stored tsvector column + GIN index (fast search)\nALTER TABLE articles ADD COLUMN search_vector tsvector;\n\nUPDATE articles SET search_vector =\n  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||  -- title weighted higher\n  setweight(to_tsvector('english', coalesce(body, '')), 'B');\n\nCREATE INDEX idx_articles_search ON articles USING GIN (search_vector);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Full-Text Search — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Auto-update with trigger,CREATE FUNCTION update_search_vector() RETURNS trigger AS $$,BEGIN,  NEW.search_vector :=,    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||,    setweight(to_tsvector('english', coalesce(NEW.body, '')), 'B');,  RETURN NEW;,END;,$$ LANGUAGE plpgsql;,,CREATE TRIGGER articles_search_update,  BEFORE INSERT OR UPDATE ON articles,  FOR EACH ROW EXECUTE FUNCTION update_search_vector();,\n\n-- Search with ranking,SELECT title, ts_rank(search_vector, query) AS rank,FROM articles, to_tsquery('english', 'rust & web & framework') AS query,WHERE search_vector @@ query,ORDER BY rank DESC,LIMIT 20;,\n\n-- Phrase search,SELECT * FROM articles,WHERE search_vector @@ phraseto_tsquery('english', 'machine learning');,\n\n-- Highlight matching text,SELECT ts_headline('english', body, to_tsquery('database'), 'StartSel=<b>, StopSel=</b>'),FROM articles WHERE search_vector @@ to_tsquery('database');"
                  }
        ],
        tips: [
                  "Weight titles higher (A) than body (B) — setweight ensures title matches rank above body matches.",
                  "GIN index on tsvector column is essential — without it, every search scans the entire table.",
                  "Use plainto_tsquery for user input (handles spaces naturally) vs to_tsquery for boolean operators.",
                  "ts_headline generates search result snippets with highlighted matching terms."
        ],
        mistake: "Using LIKE '%search%' for text search — it can't use indexes (full table scan), doesn't stem words, and doesn't rank results. Full-text search is faster and smarter.",
        shorthand: {
          verbose: "SELECT title FROM articles\nWHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('english', 'database & performance');\n-- Full table scan, slow",
          concise: "ALTER TABLE articles ADD COLUMN search_vector tsvector;\nCREATE INDEX idx_articles_search ON articles USING GIN (search_vector);\nSELECT title FROM articles WHERE search_vector @@ to_tsquery('database & performance');",
        },
      },
      {
        id: "warehouse-patterns",
        fn: "ROLLUP, CUBE & GROUPING SETS",
        desc: "Generate subtotals and cross-tabulations in a single query — essential for reporting and data warehousing.",
        category: "Analytics",
        subtitle: "Multi-level aggregation for dashboards and reports",
        signature: "GROUP BY ROLLUP(a, b)  |  GROUP BY CUBE(a, b)  |  GROUP BY GROUPING SETS(...)",
        descLong: "ROLLUP generates hierarchical subtotals (region → country → total). CUBE generates all combinations of subtotals (cross-tabulation). GROUPING SETS let you specify exact combinations. These replace multiple UNION ALL queries for reporting. GROUPING() function distinguishes real NULLs from subtotal NULLs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ROLLUP, CUBE & GROUPING SETS — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- Sample data: sales by region, product, quarter\n-- ROLLUP — hierarchical subtotals\nSELECT\n  COALESCE(region, '** ALL REGIONS **') AS region,\n  COALESCE(product, '** ALL PRODUCTS **') AS product,\n  SUM(revenue) AS total_revenue,\n  COUNT(*) AS num_sales\nFROM sales\nGROUP BY ROLLUP(region, product)\nORDER BY region NULLS LAST, product NULLS LAST;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ROLLUP, CUBE & GROUPING SETS — common patterns you'll see in production.\n-- APPROACH  - Combine ROLLUP, CUBE & GROUPING SETS with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Result:\n-- East     | Widget A | 15000\n-- East     | Widget B | 12000\n-- East     | ** ALL **| 27000  ← subtotal for East\n-- West     | Widget A | 18000\n-- West     | Widget B |  9000\n-- West     | ** ALL **| 27000  ← subtotal for West\n-- ** ALL **| ** ALL **| 54000  ← grand total"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ROLLUP, CUBE & GROUPING SETS — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- CUBE — all combinations,SELECT region, product, SUM(revenue) AS revenue,FROM sales,GROUP BY CUBE(region, product);,-- Generates: (region, product), (region), (product), (),\n\n-- GROUPING SETS — explicit combinations,SELECT,  CASE WHEN GROUPING(region) = 1 THEN 'All' ELSE region END AS region,,  CASE WHEN GROUPING(quarter) = 1 THEN 'All' ELSE quarter END AS quarter,,  SUM(revenue) AS revenue,FROM sales,GROUP BY GROUPING SETS (,  (region, quarter),   -- detail,  (region),            -- subtotal by region,  (quarter),           -- subtotal by quarter,  ()                   -- grand total,);,\n\n-- Pivot table pattern,SELECT,  product,,  SUM(CASE WHEN quarter = 'Q1' THEN revenue END) AS q1,,  SUM(CASE WHEN quarter = 'Q2' THEN revenue END) AS q2,,  SUM(CASE WHEN quarter = 'Q3' THEN revenue END) AS q3,,  SUM(CASE WHEN quarter = 'Q4' THEN revenue END) AS q4,,  SUM(revenue) AS total,FROM sales,GROUP BY ROLLUP(product);"
                  }
        ],
        tips: [
                  "ROLLUP(a, b, c) generates: (a,b,c), (a,b), (a), () — hierarchical from left to right.",
                  "CUBE(a, b) generates all 2^n combinations: (a,b), (a), (b), () — more rows than ROLLUP.",
                  "GROUPING(column) returns 1 for subtotal rows — use to distinguish NULL values from subtotal aggregations.",
                  "These replace 4+ UNION ALL queries with a single, more efficient GROUP BY."
        ],
        mistake: "Using multiple UNION ALL queries to build subtotals manually — ROLLUP/CUBE do it in one pass, which is faster and easier to maintain.",
        shorthand: {
          verbose: "SELECT region, SUM(revenue) FROM sales GROUP BY region\nUNION ALL SELECT NULL, SUM(revenue) FROM sales;\n-- Multiple queries for subtotals",
          concise: "SELECT COALESCE(region, 'All') AS region, SUM(revenue)\nFROM sales GROUP BY ROLLUP(region);\n-- Single query with hierarchical subtotals",
        },
      },
      {
        id: "dynamic-sql",
        fn: "Dynamic SQL & Prepared Statements",
        desc: "Build and execute SQL strings at runtime — safely, with parameterized queries to prevent injection.",
        category: "Advanced",
        subtitle: "EXECUTE, PREPARE, parameterized queries, SQL injection prevention",
        signature: "EXECUTE format('SELECT * FROM %I WHERE id = $1', table_name) USING id;",
        descLong: "Dynamic SQL constructs queries at runtime — needed for variable table names, dynamic column lists, or search builders. ALWAYS use parameterized queries ($1, $2) for values and format('%I', name) for identifiers. Never concatenate user input into SQL strings. Prepared statements precompile the query plan for repeated execution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Dynamic SQL & Prepared Statements — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- PostgreSQL: Dynamic SQL in PL/pgSQL\nCREATE FUNCTION search_table(\n  table_name TEXT,\n  search_col TEXT,\n  search_val TEXT\n) RETURNS SETOF RECORD AS $$\nBEGIN\n  -- %I = identifier (quoted), $1 = parameter (safe)\n  RETURN QUERY EXECUTE format(\n    'SELECT * FROM %I WHERE %I ILIKE $1',\n    table_name, search_col\n  ) USING '%' || search_val || '%';\nEND;\n$$ LANGUAGE plpgsql;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Dynamic SQL & Prepared Statements — common patterns you'll see in production.\n-- APPROACH  - Combine Dynamic SQL & Prepared Statements with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Dynamic pivot\nCREATE FUNCTION dynamic_pivot(\n  source_table TEXT,\n  pivot_column TEXT,\n  value_column TEXT\n) RETURNS TEXT AS $$\nDECLARE\n  sql TEXT;\n  pivot_values TEXT;\nBEGIN\n  EXECUTE format(\n    'SELECT string_agg(DISTINCT format($$SUM(CASE WHEN %I = %%L THEN %I END) AS %%I$$, %I, %I), '', '')',\n    pivot_column, value_column, pivot_column, pivot_column\n  ) INTO pivot_values;\n\n  sql := format('SELECT * FROM crosstab(...) ...', pivot_values);\n  RETURN sql;\nEND;\n$$ LANGUAGE plpgsql;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Dynamic SQL & Prepared Statements — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Prepared statements (application level),-- Prepare once, execute many times,PREPARE user_lookup (int) AS,  SELECT * FROM users WHERE id = $1;,,EXECUTE user_lookup(42);,EXECUTE user_lookup(99);,,DEALLOCATE user_lookup;,\n\n-- Application code (Node.js with pg),-- SAFE: parameterized,-- const result = await pool.query(,--   'SELECT * FROM users WHERE email = $1 AND active = $2',,--   [email, true],-- );,--,-- UNSAFE: string concatenation (SQL INJECTION!),-- const result = await pool.query(,--   `SELECT * FROM users WHERE email = '${email}'`  // NEVER DO THIS,-- );"
                  }
        ],
        tips: [
                  "format('%I', name) safely quotes identifiers (table/column names) — prevents injection.",
                  "$1, $2 parameters are always safe for values — the database handles escaping.",
                  "Prepared statements save ~10-30% on repeated queries by caching the query plan.",
                  "Use EXECUTE ... USING for dynamic SQL with parameters — cleanest and safest approach."
        ],
        mistake: "Building SQL with string concatenation from user input — this is SQL injection, the #1 database vulnerability. ALWAYS use parameterized queries for values and format(%I) for identifiers.",
        shorthand: {
          verbose: "-- UNSAFE: SQL injection vulnerability!\n'SELECT * FROM users WHERE email = \\'\\' || email || '\\''\n-- Attacker supplies: \\'; DROP TABLE users; --",
          concise: "-- SAFE: parameterized query\nEXECUTE format('SELECT * FROM %I WHERE id = $1', table_name) USING id;\n-- %I quotes identifiers, $1 is always safe for values",
        },
      },
    ],
  },

  // ── Section 4: Database Design & Normalization ─────────────────────────────────────────
  {
    id: "database-design",
    title: "Database Design & Normalization",
    entries: [
      {
        id: "normalization",
        fn: "Normalization — 1NF, 2NF, 3NF, BCNF",
        desc: "Normalization eliminates data redundancy and insertion/update/delete anomalies by decomposing tables into progressively stricter normal forms.",
        category: "Design",
        subtitle: "normalization, 1NF, 2NF, 3NF, BCNF, functional dependency, anomaly, redundancy, normal form, decomposition",
        signature: "1NF: atomic values | 2NF: no partial dependency | 3NF: no transitive dependency | BCNF: every determinant is a candidate key",
        descLong: "Normalization is the process of organizing database tables to reduce redundancy and eliminate data anomalies. Normal forms: (1) 1NF — all columns contain atomic (indivisible) values; no repeating groups. (2) 2NF — 1NF + no partial dependencies (every non-key column depends on the ENTIRE primary key, relevant for composite keys). (3) 3NF — 2NF + no transitive dependencies (non-key columns don't depend on other non-key columns). (4) BCNF — 3NF + every determinant is a candidate key (stricter than 3NF). Anomalies prevented: Insertion (can't add data without related data), Update (must update multiple rows to change one fact), Deletion (deleting one fact may delete another). In practice, 3NF is the standard target — BCNF for edge cases. Denormalization (intentionally violating normal forms) is used for read-heavy workloads where joins are expensive.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Normalize an unnormalized sales table to 3NF\n-- APPROACH  - Identify violations at each normal form level\n-- STRENGTHS - Eliminates redundancy; prevents anomalies\n// WEAKNESSES- More tables = more joins; may hurt read performance\n\n-- Unnormalized table (violates 1NF, 2NF, 3NF):\n-- OrderID | CustomerName | CustomerCity | Product1 | Product2 | Product3 | Total\n-- 1       | Alice        | NYC          | Widget   | Gadget   | NULL     | $150\n-- 2       | Bob          | LA           | Widget   | NULL     | NULL     | $50\n\n-- 1NF: Make atomic values (remove repeating groups)\n-- OrderID | CustomerName | CustomerCity | Product  | Total\n-- 1       | Alice        | NYC          | Widget   | $150\n-- 1       | Alice        | NYC          | Gadget   | $150\n-- 2       | Bob          | LA           | Widget   | $50\n\n-- 2NF: Remove partial dependencies (Total depends on OrderID, not Product)\n-- Orders:    OrderID | CustomerName | CustomerCity | Total\n-- OrderItems: OrderID | Product\n\n-- 3NF: Remove transitive dependencies (CustomerCity depends on CustomerName, not OrderID)\n-- Orders:    OrderID | CustomerID | Total\n-- Customers: CustomerID | CustomerName | CustomerCity\n-- OrderItems: OrderID | Product",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Design a normalized e-commerce schema (3NF)\n-- APPROACH  - Separate entities: customers, products, orders, order_items\n-- STRENGTHS - No redundancy; consistent updates; flexible queries\n-- WEAKNESSES- More complex queries; joins needed for most reports\n\n-- Customers (3NF: no transitive dependencies)\nCREATE TABLE customers (\n    customer_id   SERIAL PRIMARY KEY,\n    email         VARCHAR(255) UNIQUE NOT NULL,\n    first_name    VARCHAR(100) NOT NULL,\n    last_name     VARCHAR(100) NOT NULL,\n    -- Address in separate table if multiple addresses needed (2NF/3NF)\n    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Products (3NF: category in separate table to avoid transitive dependency)\nCREATE TABLE categories (\n    category_id   SERIAL PRIMARY KEY,\n    name          VARCHAR(100) NOT NULL,\n    parent_id     INT REFERENCES categories(category_id)  -- hierarchy\n);\n\nCREATE TABLE products (\n    product_id    SERIAL PRIMARY KEY,\n    name          VARCHAR(200) NOT NULL,\n    category_id   INT REFERENCES categories(category_id),\n    price         DECIMAL(10,2) NOT NULL,\n    stock_qty     INT DEFAULT 0\n);\n\n-- Orders (3NF: customer reference, not embedded customer data)\nCREATE TABLE orders (\n    order_id      SERIAL PRIMARY KEY,\n    customer_id   INT REFERENCES customers(customer_id),\n    order_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    status        VARCHAR(20) DEFAULT 'pending'\n);\n\n-- Order Items (2NF: composite key, every column depends on full key)\nCREATE TABLE order_items (\n    order_id      INT REFERENCES orders(order_id),\n    product_id    INT REFERENCES products(product_id),\n    quantity      INT NOT NULL,\n    unit_price    DECIMAL(10,2) NOT NULL,  -- snapshot price at order time\n    PRIMARY KEY (order_id, product_id)\n);\n\n-- Key design decisions:\n-- 1. unit_price in order_items (not from products) — price changes don't affect past orders\n-- 2. category_id in products (not category name) — avoids transitive dependency\n-- 3. Composite PK in order_items — ensures (order_id, product_id) uniqueness",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Design a normalized schema with BCNF analysis and denormalization strategy\n-- APPROACH  - Full BCNF decomposition + selective denormalization for read-heavy paths\n-- STRENGTHS - Correct normalization; intentional denormalization for performance\n-- WEAKNESSES- BCNF may create more tables; denormalization adds complexity\n\n-- BCNF Analysis Example:\n-- Table: CourseSchedule\n-- Columns: (StudentID, CourseID, InstructorID, Room)\n-- Functional Dependencies:\n--   (StudentID, CourseID) → InstructorID, Room\n--   InstructorID → Room  (each instructor always teaches in same room)\n--   (StudentID, CourseID) is the candidate key\n--   InstructorID → Room means InstructorID is a determinant\n--   but InstructorID is NOT a candidate key → violates BCNF\n\n-- BCNF Decomposition:\nCREATE TABLE course_assignments (\n    student_id    INT,\n    course_id     INT,\n    instructor_id INT,\n    PRIMARY KEY (student_id, course_id)\n);\n\nCREATE TABLE instructor_rooms (\n    instructor_id INT PRIMARY KEY,\n    room          VARCHAR(50)\n);\n\n-- Denormalization: when to break normal forms intentionally\n-- Scenario: Dashboard shows order summary with customer name and city\n-- Normalized query (3 joins, may be slow on large datasets):\nSELECT o.order_id, c.first_name, c.last_name, c.city, o.total\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY o.order_id, c.first_name, c.last_name, c.city, o.total;\n\n-- Denormalized approach 1: Materialized view (pre-computed)\nCREATE MATERIALIZED VIEW order_summary AS\nSELECT o.order_id, c.first_name || ' ' || c.last_name AS customer_name,\n       c.city, o.total, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id;\n-- Refresh periodically: REFRESH MATERIALIZED VIEW order_summary;\n\n-- Denormalized approach 2: Add redundant columns (write-time cost)\nALTER TABLE orders ADD COLUMN customer_name VARCHAR(200);\nALTER TABLE orders ADD COLUMN customer_city VARCHAR(100);\n-- Update via trigger when customer changes:\nCREATE TRIGGER sync_customer_name\nAFTER UPDATE ON customers\nFOR EACH ROW BEGIN\n    UPDATE orders SET customer_name = NEW.first_name || ' ' || NEW.last_name\n    WHERE customer_id = NEW.customer_id;\nEND;\n\n-- Denormalization decision matrix:\n-- Read-heavy, write-light  → denormalize (add redundant columns)\n-- Write-heavy, read-light  → normalize (minimize update overhead)\n-- Mixed workload           → normalize + materialized views\n-- Reporting/OLAP           → star schema (intentionally denormalized)\n-- OLTP                     → 3NF (fully normalized)",
          },
        ],
        tips: [
          "3NF is the practical standard — BCNF for edge cases where a non-key column determines another non-key column.",
          "Snapshot prices in order_items — don't join to products for historical order prices, as product prices change over time.",
          "Denormalize intentionally, not accidentally — document why and maintain consistency with triggers or app logic.",
          "Use materialized views for denormalized read paths — they're easier to maintain than redundant columns.",
          "Star schema (OLAP) is intentionally denormalized — dimension tables have redundant data for fast aggregation.",
        ],
        mistake: "Normalizing for the sake of it without considering read patterns — over-normalization can make simple queries require 5+ joins. Consider the read-to-write ratio before deciding on normalization level.",
        shorthand: {
          verbose: "-- Normalization levels\n-- 1NF: atomic values (no repeating groups, no arrays in cells)\n-- 2NF: 1NF + no partial dependency (all cols depend on full composite key)\n-- 3NF: 2NF + no transitive dependency (non-key cols don't depend on other non-key cols)\n-- BCNF: 3NF + every determinant is a candidate key\n-- Denormalize: add redundant columns or use materialized views for read-heavy paths",
          concise: "-- Quick normalization\n-- 1NF: atomic | 2NF: no partial dep | 3NF: no transitive dep | BCNF: all determinants are keys",
        },
      },
      {
        id: "slowly-changing-dimensions",
        fn: "Slowly Changing Dimensions (SCD) — Type 1, 2, 3, 4, 6",
        desc: "SCD patterns track historical changes to dimension data in data warehouses — from simple overwrites (Type 1) to full history tracking (Type 2) and hybrid approaches.",
        category: "Data Warehousing",
        subtitle: "SCD, slowly changing dimension, Type 1, Type 2, Type 3, Type 4, Type 6, history tracking, data warehouse, effective date",
        signature: "Type 1: UPDATE | Type 2: INSERT new row + effective dates | Type 3: add prev_value column",
        descLong: "Slowly Changing Dimensions (SCD) are patterns for handling changes to dimension attributes in data warehouses. The six types: (1) Type 1 — Overwrite: replace old value with new; no history kept. Use for corrections or non-critical attributes. (2) Type 2 — Row versioning: insert new row with effective dates and current flag; full history preserved. Most common for data warehousing. (3) Type 3 — Add new column: keep old and new values in same row (previous_value, current_value). Limited to 2 versions. (4) Type 4 — Mini-dimension: move frequently-changing attributes to a separate dimension table. (5) Type 5 — Hybrid: Type 1 + mini-dimension. (6) Type 6 — Hybrid: Type 1 + 2 + 3 (overwrite current, keep history rows, add previous value column). Type 2 is the workhorse — it preserves full history with effective_start_date, effective_end_date, and is_current columns.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Track customer address changes with SCD Type 2\n-- APPROACH  - Add effective dates and current flag to dimension table\n-- STRENGTHS - Full history; point-in-time queries; industry standard\n-- WEAKNESSES- More rows; more complex queries; requires ETL logic\n\n-- SCD Type 2 table structure\nCREATE TABLE dim_customer (\n    customer_sk     SERIAL PRIMARY KEY,       -- surrogate key\n    customer_id     INT NOT NULL,              -- natural key (business key)\n    first_name      VARCHAR(100),\n    last_name       VARCHAR(100),\n    city            VARCHAR(100),\n    effective_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    effective_end   TIMESTAMP DEFAULT '9999-12-31',\n    is_current      BOOLEAN DEFAULT TRUE,\n    UNIQUE (customer_id, effective_start)\n);\n\n-- Initial load\nINSERT INTO dim_customer (customer_id, first_name, last_name, city)\nVALUES (1001, 'Alice', 'Smith', 'New York');\n\n-- Address change: expire old row, insert new row\nUPDATE dim_customer\nSET effective_end = CURRENT_TIMESTAMP, is_current = FALSE\nWHERE customer_id = 1001 AND is_current = TRUE;\n\nINSERT INTO dim_customer (customer_id, first_name, last_name, city)\nVALUES (1001, 'Alice', 'Smith', 'Boston');\n\n-- Query: current customer info\nSELECT * FROM dim_customer WHERE customer_id = 1001 AND is_current = TRUE;\n\n-- Query: customer info as of a specific date\nSELECT * FROM dim_customer\nWHERE customer_id = 1001\n  AND '2024-06-01' >= effective_start\n  AND '2024-06-01' < effective_end;",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Implement SCD Type 2 merge logic for batch updates\n// APPROACH  - Use MERGE/UPSERT to expire old rows and insert new versions\n-- STRENGTHS - Set-based; handles inserts + updates + no-changes\n-- WEAKNESSES- Complex MERGE syntax; must handle edge cases\n\n-- Source: stg_customer (staging table from ETL)\n-- Target: dim_customer (SCD Type 2)\n\n-- Step 1: Expire changed rows\nUPDATE dim_customer d\nSET effective_end = CURRENT_TIMESTAMP, is_current = FALSE\nFROM stg_customer s\nWHERE d.customer_id = s.customer_id\n  AND d.is_current = TRUE\n  AND (d.city <> s.city OR d.first_name <> s.first_name);\n\n-- Step 2: Insert new versions for changed rows\nINSERT INTO dim_customer (customer_id, first_name, last_name, city)\nSELECT s.customer_id, s.first_name, s.last_name, s.city\nFROM stg_customer s\nJOIN dim_customer d ON s.customer_id = d.customer_id\nWHERE d.is_current = FALSE\n  AND d.effective_end = CURRENT_TIMESTAMP  -- just expired\n  AND (d.city <> s.city OR d.first_name <> s.first_name);\n\n-- Step 3: Insert brand new customers (Type 1 for new records)\nINSERT INTO dim_customer (customer_id, first_name, last_name, city)\nSELECT s.customer_id, s.first_name, s.last_name, s.city\nFROM stg_customer s\nWHERE NOT EXISTS (\n    SELECT 1 FROM dim_customer d WHERE d.customer_id = s.customer_id\n);\n\n-- PostgreSQL alternative: single MERGE statement\n-- (PostgreSQL 15+)\nMERGE INTO dim_customer d\nUSING stg_customer s\nON d.customer_id = s.customer_id AND d.is_current = TRUE\nWHEN MATCHED AND (d.city <> s.city OR d.first_name <> s.first_name) THEN\n    UPDATE SET effective_end = CURRENT_TIMESTAMP, is_current = FALSE\nWHEN NOT MATCHED THEN\n    INSERT (customer_id, first_name, last_name, city)\n    VALUES (s.customer_id, s.first_name, s.last_name, s.city);",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a complete SCD framework with all types and point-in-time joins\n-- APPROACH  - SCD Type 2 dimensions + fact-to-dimension time-aware joins\n-- STRENGTHS - Full history; correct point-in-time analysis; production-grade\n-- WEAKNESSES- Complex; requires disciplined ETL; surrogate key management\n\n-- SCD Type 2 dimension with audit columns\nCREATE TABLE dim_customer (\n    customer_sk     BIGSERIAL PRIMARY KEY,\n    customer_id     INT NOT NULL,\n    first_name      VARCHAR(100),\n    last_name       VARCHAR(100),\n    city            VARCHAR(100),\n    segment         VARCHAR(50),\n    effective_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    effective_end   TIMESTAMP NOT NULL DEFAULT '9999-12-31 23:59:59',\n    is_current      BOOLEAN NOT NULL DEFAULT TRUE,\n    batch_id        INT NOT NULL,  -- ETL batch tracking\n    checksum        VARCHAR(64)    -- hash for change detection\n);\n\nCREATE INDEX idx_dim_customer_natural ON dim_customer(customer_id, is_current);\nCREATE INDEX idx_dim_customer_dates ON dim_customer(customer_id, effective_start, effective_end);\n\n-- Fact table with surrogate key reference (best practice)\nCREATE TABLE fact_sales (\n    sale_id         BIGSERIAL PRIMARY KEY,\n    customer_sk     BIGINT NOT NULL REFERENCES dim_customer(customer_sk),\n    product_sk      BIGINT NOT NULL REFERENCES dim_product(product_sk),\n    sale_date       TIMESTAMP NOT NULL,\n    amount          DECIMAL(12,2) NOT NULL\n);\n\n-- Point-in-time join: get customer's city AT TIME OF SALE\nSELECT\n    f.sale_id,\n    f.sale_date,\n    f.amount,\n    c.customer_id,\n    c.city AS city_at_sale_time,\n    c.segment AS segment_at_sale_time\nFROM fact_sales f\nJOIN dim_customer c ON f.customer_sk = c.customer_sk;\n-- Surrogate key join is correct — it points to the exact version at sale time\n\n-- If using natural keys (less ideal), need date-range join:\nSELECT f.sale_id, f.sale_date, f.amount, c.city\nFROM fact_sales f\nJOIN dim_customer c ON f.customer_id = c.customer_id\n    AND f.sale_date >= c.effective_start\n    AND f.sale_date < c.effective_end;\n\n-- SCD Type 3: keep previous value in same row\nCREATE TABLE dim_customer_type3 (\n    customer_id     INT PRIMARY KEY,\n    first_name      VARCHAR(100),\n    city_current    VARCHAR(100),\n    city_previous   VARCHAR(100),\n    city_changed_at TIMESTAMP\n);\n\n-- SCD Type 4: mini-dimension for frequently-changing attributes\nCREATE TABLE dim_customer (\n    customer_sk     BIGSERIAL PRIMARY KEY,\n    customer_id     INT NOT NULL,\n    first_name      VARCHAR(100),\n    last_name       VARCHAR(100)\n);\n\nCREATE TABLE dim_customer_demographics (\n    demo_sk         BIGSERIAL PRIMARY KEY,\n    segment         VARCHAR(50),\n    credit_score    INT,\n    income_band     VARCHAR(20)\n);\n\nCREATE TABLE bridge_customer_demo (\n    customer_sk     BIGINT REFERENCES dim_customer(customer_sk),\n    demo_sk         BIGINT REFERENCES dim_customer_demographics(demo_sk),\n    effective_start TIMESTAMP,\n    effective_end   TIMESTAMP,\n    PRIMARY KEY (customer_sk, demo_sk, effective_start)\n);\n\n-- Change detection using checksum (MD5 hash of tracked columns)\n-- In ETL: compute checksum and compare to detect changes\nSELECT s.customer_id, md5(\n    s.first_name || '|' || s.last_name || '|' || s.city\n) AS new_checksum\nFROM stg_customer s;\n-- Compare to dim_customer.checksum — if different, it's a change",
          },
        ],
        tips: [
          "Use surrogate keys (SK) for SCD Type 2 — the natural key repeats across versions, so PK must be a unique SK.",
          "Fact tables should reference surrogate keys, not natural keys — this ensures point-in-time correctness without date-range joins.",
          "Use a checksum (MD5/SHA of tracked columns) for efficient change detection — compare hashes instead of every column.",
          "effective_end = '9999-12-31' for current rows — this avoids NULL handling and simplifies date-range queries.",
          "Type 1 for corrections (typos), Type 2 for actual changes (address, segment), Type 4 for volatile attributes (credit score).",
        ],
        mistake: "Using natural keys in fact tables with SCD Type 2 dimensions — this requires expensive date-range joins. Use surrogate keys in fact tables for direct point-in-time joins.",
        shorthand: {
          verbose: "-- SCD Types\n-- Type 1: UPDATE (overwrite, no history)\n-- Type 2: INSERT new row + effective_start/end + is_current (full history)\n-- Type 3: ADD prev_value column (old + new in same row)\n-- Type 4: Mini-dimension (volatile attributes in separate table)\n-- Type 6: Type 1+2+3 hybrid\n-- SCD2 table: sk PK, natural_id, cols, effective_start, effective_end, is_current",
          concise: "-- Quick SCD2\n-- Table: sk PK, id, cols, eff_start, eff_end='9999-12-31', is_current=TRUE\n-- Change: expire old row, insert new row",
        },
      },
    ],
  },

  // ── Section 5: SQL Dialect Comparisons ─────────────────────────────────────────
  {
    id: "dialect-comparisons",
    title: "SQL Dialect Comparisons",
    entries: [
      {
        id: "dialect-cheatsheet",
        fn: "SQL Dialect Cheatsheet — PostgreSQL vs MySQL vs SQL Server vs Oracle vs BigQuery vs SQLite",
        desc: "Side-by-side comparison of common SQL operations across major database dialects — string functions, dates, pagination, UPSERT, and more.",
        category: "Reference",
        subtitle: "dialect, PostgreSQL, MySQL, SQL Server, Oracle, BigQuery, SQLite, comparison, portability, cross-database",
        signature: "PostgreSQL: LIMIT n OFFSET m | MySQL: LIMIT m, n | SQL Server: OFFSET m FETCH NEXT n | Oracle: FETCH NEXT n ROWS ONLY",
        descLong: "SQL dialects share the same standard (ANSI SQL) but diverge significantly in syntax for common operations. Key differences: (1) Pagination — LIMIT/OFFSET (PostgreSQL, MySQL, SQLite), OFFSET/FETCH (SQL Server, Oracle 12c), ROWNUM (Oracle pre-12c). (2) String concatenation — || (PostgreSQL, Oracle, SQLite), CONCAT() (MySQL, SQL Server), + (SQL Server). (3) Date functions — every dialect has different names and syntax. (4) UPSERT — ON CONFLICT (PostgreSQL, SQLite), ON DUPLICATE KEY UPDATE (MySQL), MERGE (SQL Server, Oracle). (5) Auto-increment — SERIAL (PostgreSQL), AUTO_INCREMENT (MySQL), IDENTITY (SQL Server, Oracle 12c), AUTOINCREMENT (SQLite). (6) Boolean type — TRUE/FALSE (PostgreSQL), 1/0 (MySQL, SQLite), no native boolean (Oracle, SQL Server pre-2019). This reference helps write portable SQL and migrate between databases.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Compare pagination syntax across dialects\n-- APPROACH  - Side-by-side syntax for LIMIT/OFFSET\n-- STRENGTHS - Quick reference; covers 6 major dialects\n-- WEAKNESSES- Doesn't cover all edge cases; syntax may vary by version\n\n-- PostgreSQL, MySQL, SQLite:\nSELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;\n\n-- SQL Server (2012+):\nSELECT * FROM users ORDER BY id OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;\n\n-- Oracle (12c+):\nSELECT * FROM users ORDER BY id OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;\n\n-- Oracle (pre-12c):\nSELECT * FROM (\n    SELECT u.*, ROWNUM rn FROM (\n        SELECT * FROM users ORDER BY id\n    ) u WHERE ROWNUM <= 30\n) WHERE rn > 20;\n\n-- BigQuery:\nSELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;\n\n-- String concatenation comparison:\n-- PostgreSQL / Oracle / SQLite:\nSELECT 'Hello' || ' ' || 'World';\n-- MySQL:\nSELECT CONCAT('Hello', ' ', 'World');\n-- SQL Server:\nSELECT 'Hello' + ' ' + 'World';\n-- All dialects (ANSI):\nSELECT CONCAT('Hello', ' ', 'World');",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Compare UPSERT/MERGE and auto-increment across dialects\n-- APPROACH  - Show equivalent INSERT...ON CONFLICT/MERGE for each database\n-- STRENGTHS - Covers the most common cross-database challenge\n-- WEAKNESSES- MERGE syntax varies significantly between dialects\n\n-- UPSERT (insert or update if exists):\n\n-- PostgreSQL:\nINSERT INTO users (id, email, name) VALUES (1, 'a@b.com', 'Alice')\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;\n\n-- MySQL:\nINSERT INTO users (id, email, name) VALUES (1, 'a@b.com', 'Alice')\nON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email);\n\n-- SQLite:\nINSERT INTO users (id, email, name) VALUES (1, 'a@b.com', 'Alice')\nON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email;\n\n-- SQL Server:\nMERGE users AS target\nUSING (VALUES (1, 'a@b.com', 'Alice')) AS source (id, email, name)\nON target.id = source.id\nWHEN MATCHED THEN UPDATE SET name = source.name, email = source.email\nWHEN NOT MATCHED THEN INSERT (id, email, name) VALUES (source.id, source.email, source.name);\n\n-- Oracle:\nMERGE INTO users target\nUSING (SELECT 1 AS id, 'a@b.com' AS email, 'Alice' AS name FROM DUAL) source\nON (target.id = source.id)\nWHEN MATCHED THEN UPDATE SET name = source.name, email = source.email\nWHEN NOT MATCHED THEN INSERT (id, email, name) VALUES (source.id, source.email, source.name);\n\n-- BigQuery:\nMERGE users AS target\nUSING (SELECT 1 AS id, 'a@b.com' AS email, 'Alice' AS name) AS source\nON target.id = source.id\nWHEN MATCHED THEN UPDATE SET name = source.name, email = source.email\nWHEN NOT MATCHED THEN INSERT (id, email, name) VALUES (source.id, source.email, source.name);\n\n-- Auto-increment comparison:\n-- PostgreSQL:   SERIAL / BIGSERIAL (or IDENTITY in PG10+)\n-- MySQL:        AUTO_INCREMENT\n-- SQL Server:   IDENTITY(1,1) / SEQUENCE\n-- Oracle:       SEQUENCE + trigger (or IDENTITY in 12c+)\n-- SQLite:       AUTOINCREMENT / INTEGER PRIMARY KEY\n-- BigQuery:     no auto-increment (use GENERATE_UUID())",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a cross-database compatibility layer with feature matrix\n-- APPROACH  - Map every common operation to its dialect-specific syntax\n-- STRENGTHS - Comprehensive; enables portable SQL; migration reference\n-- WEAKNESSES- Some features have no cross-database equivalent\n\n-- Date functions comparison:\n\n-- Current timestamp:\n-- PG:        CURRENT_TIMESTAMP / NOW()\n-- MySQL:     NOW() / CURRENT_TIMESTAMP\n-- SQL Server: GETDATE() / SYSDATETIME()\n-- Oracle:    SYSTIMESTAMP / CURRENT_TIMESTAMP\n-- SQLite:    datetime('now')\n-- BigQuery:  CURRENT_TIMESTAMP()\n\n-- Date add interval:\n-- PG:        CURRENT_DATE + INTERVAL '30 days'\n-- MySQL:     DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)\n-- SQL Server: DATEADD(day, 30, GETDATE())\n-- Oracle:    CURRENT_DATE + 30\n-- SQLite:    date('now', '+30 days')\n-- BigQuery:  DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)\n\n-- Date truncation:\n-- PG:        DATE_TRUNC('month', CURRENT_DATE)\n-- MySQL:     DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')\n-- SQL Server: DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)\n-- Oracle:    TRUNC(CURRENT_DATE, 'MM')\n-- BigQuery:  DATE_TRUNC(CURRENT_DATE(), MONTH)\n\n-- String functions:\n\n-- Substring:\n-- PG/MySQL/SQLite: SUBSTRING(str FROM 1 FOR 3) or SUBSTR(str, 1, 3)\n-- SQL Server:      SUBSTRING(str, 1, 3)\n-- Oracle:          SUBSTR(str, 1, 3)\n\n-- Regex match:\n-- PG:        str ~ 'pattern'  (case-sensitive: ~, case-insensitive: ~*)\n-- MySQL:     REGEXP_LIKE(str, 'pattern')\n-- SQL Server: str LIKE '%pattern%' (limited) or PATINDEX()\n-- Oracle:    REGEXP_LIKE(str, 'pattern')\n-- SQLite:    str REGEXP 'pattern' (requires extension)\n-- BigQuery:  REGEXP_CONTAINS(str, 'pattern')\n\n-- Boolean type:\n-- PG:        TRUE / FALSE (native boolean)\n-- MySQL:     1 / 0 (TINYINT(1))\n-- SQL Server: 1 / 0 (BIT) — no TRUE/FALSE keywords\n-- Oracle:    no boolean in SQL (use 1/0 or CHAR(1) 'Y'/'N')\n-- SQLite:    1 / 0 (INTEGER)\n-- BigQuery:  TRUE / FALSE\n\n-- NULL handling:\n-- All: IS NULL / IS NOT NULL\n-- PG/Oracle: NULLS FIRST / NULLS LAST in ORDER BY\n-- MySQL:     NULLs sort first in ASC, last in DESC (not configurable)\n-- SQL Server: NULLs sort first in ASC, last in DESC (not configurable)\n\n-- JSON:\n-- PG:        -> (JSON), ->> (text), #> (path), jsonb type\n-- MySQL:     -> (JSON), ->> (text), JSON_EXTRACT(), JSON_UNQUOTE()\n-- SQL Server: JSON_VALUE(), JSON_QUERY(), JSON_MODIFY()\n-- Oracle:    JSON_VALUE(), JSON_QUERY(), JSON_TABLE()\n-- SQLite:    json_extract(), json_array(), json_object()\n-- BigQuery:  JSON_EXTRACT(), JSON_QUERY(), TO_JSON_STRING()",
          },
        ],
        tips: [
          "ANSI SQL CONCAT() works in all major databases — use it instead of || or + for portability.",
          "PostgreSQL and SQLite share the most similar syntax — MySQL diverges on UPSERT and string functions.",
          "MERGE syntax is standardized but differs in USING clause — Oracle requires FROM DUAL, others don't.",
          "BigQuery uses Standard SQL by default (formerly Legacy SQL) — most PostgreSQL syntax works with minor changes.",
          "For cross-database apps, use an ORM or query builder that abstracts dialect differences.",
        ],
        mistake: "Assuming LIMIT works in SQL Server — it doesn't. SQL Server uses OFFSET...FETCH NEXT syntax (2012+). Using LIMIT in SQL Server will cause a syntax error.",
        shorthand: {
          verbose: "-- Dialect quick reference\n-- Pagination: PG/MySQL/SQLite: LIMIT n OFFSET m | SQL Server/Oracle: OFFSET m ROWS FETCH NEXT n ROWS ONLY\n-- UPSERT: PG/SQLite: ON CONFLICT DO UPDATE | MySQL: ON DUPLICATE KEY UPDATE | SQL Server/Oracle/BQ: MERGE\n-- Concat: PG/Oracle/SQLite: || | MySQL/SQL Server: CONCAT() | SQL Server: +\n-- Date add: PG: + INTERVAL | MySQL: DATE_ADD | SQL Server: DATEADD | Oracle: + n | SQLite: date('now','+n days')",
          concise: "-- Quick dialect map\n-- LIMIT: PG/MySQL/SQLite | OFFSET/FETCH: SQL Server/Oracle\n-- UPSERT: ON CONFLICT (PG/SQLite) | ON DUPLICATE KEY (MySQL) | MERGE (SQL Server/Oracle/BQ)",
        },
      },
    ],
  },

  // ── Section 6: SQL Injection & Security ─────────────────────────────────────────
  {
    id: "sql-injection-security",
    title: "SQL Injection & Security",
    entries: [
      {
        id: "sql-injection-prevention",
        fn: "SQL Injection Prevention — parameterized queries, ORM safety, defense in depth",
        desc: "SQL injection is the #1 database vulnerability — prevent it with parameterized queries, input validation, least-privilege accounts, and layered defenses.",
        category: "Security",
        subtitle: "SQL injection, parameterized query, prepared statement, ORM injection, least privilege, defense in depth, input validation, WAF",
        signature: "SAFE: cursor.execute('SELECT * FROM users WHERE id = %s', [user_id]) | UNSAFE: cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')",
        descLong: "SQL injection occurs when untrusted input is concatenated into SQL strings, allowing attackers to execute arbitrary SQL. Prevention layers: (1) Parameterized queries / prepared statements — the ONLY reliable defense for values. The database separates SQL code from data, making injection impossible. (2) Input validation — validate types, lengths, formats before querying. (3) Least-privilege accounts — application DB user should only have SELECT/INSERT/UPDATE on needed tables, never DROP/ALTER. (4) Stored procedures — encapsulate SQL, reduce attack surface. (5) ORM safety — ORMs parameterize by default, but raw query methods (e.g., sequelize.literal, Django raw) can reintroduce injection. (6) Web Application Firewall (WAF) — detect and block SQL injection patterns. (7) Escaping functions — pg.escape(), mysql_real_escape_string() — less reliable than parameterization, use only when parameterization is impossible. Attack types: classic (OR 1=1), UNION-based (extract data), blind (boolean/time-based), second-order (stored in DB, executed later).",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Understand SQL injection with a classic example\n-- APPROACH  - Show vulnerable vs safe code side by side\n-- STRENGTHS - Clear demonstration of the vulnerability and fix\n-- WEAKNESSES- Simplistic; real attacks are more sophisticated\n\n-- VULNERABLE (Python + psycopg2):\n-- user_input = \"1; DROP TABLE users; --\"\n-- cursor.execute(f\"SELECT * FROM users WHERE id = {user_input}\")\n-- Result: SELECT * FROM users WHERE id = 1; DROP TABLE users; --\n-- Table users is DROPPED!\n\n-- SAFE (parameterized query):\n-- user_input = \"1; DROP TABLE users; --\"\n-- cursor.execute(\"SELECT * FROM users WHERE id = %s\", (user_input,))\n-- Result: SELECT * FROM users WHERE id = '1; DROP TABLE users; --'\n-- Treated as a literal string — no injection possible\n\n-- VULNERABLE (Node.js):\n-- const email = req.body.email;  // \"admin' OR '1'='1\"\n-- pool.query(`SELECT * FROM users WHERE email = '${email}'`)\n-- Result: SELECT * FROM users WHERE email = 'admin' OR '1'='1'\n-- Returns ALL users!\n\n-- SAFE (Node.js with pg):\n-- const email = req.body.email;\n-- pool.query('SELECT * FROM users WHERE email = $1', [email])\n-- Result: SELECT * FROM users WHERE email = 'admin\\' OR \\'1\\'=\\'1'\n-- Returns only matching rows (likely none)",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Implement defense-in-depth with validation + parameterization + least privilege\n-- APPROACH  - Layer multiple defenses: validate input, parameterize, restrict DB user\n-- STRENGTHS - Multiple layers; one failure doesn't compromise security\n-- WEAKNESSES- More code; each layer adds complexity\n\n-- Layer 1: Input validation (application code, Python example)\n-- def get_user(user_id_str):\n--     # Validate: must be a positive integer\n--     try:\n--         user_id = int(user_id_str)\n--     except ValueError:\n--         raise ValueError('Invalid user ID')\n--     if user_id <= 0 or user_id > 1000000:\n--         raise ValueError('User ID out of range')\n\n-- Layer 2: Parameterized query\n--     cursor.execute(\n--         'SELECT id, email, name FROM users WHERE id = %s',\n--         (user_id,)\n--     )\n--     return cursor.fetchone()\n\n-- Layer 3: Least-privilege database user\n-- Application user should NOT own tables or have DDL privileges:\nCREATE ROLE app_readwrite;\nGRANT SELECT, INSERT, UPDATE ON users, orders TO app_readwrite;\nGRANT USAGE, SELECT ON SEQUENCE users_id_seq TO app_readwrite;\n-- Do NOT grant: DROP, ALTER, CREATE, TRUNCATE, GRANT\nREVOKE ALL ON SCHEMA public FROM PUBLIC;\nGRANT USAGE ON SCHEMA public TO app_readwrite;\n\n-- Layer 4: Stored procedure for sensitive operations\nCREATE FUNCTION transfer_funds(\n    p_from INT, p_to INT, p_amount DECIMAL(10,2)\n) RETURNS VOID AS $$\nBEGIN\n    -- Business logic inside the database\n    UPDATE accounts SET balance = balance - p_amount WHERE id = p_from;\n    UPDATE accounts SET balance = balance + p_amount WHERE id = p_to;\n    INSERT INTO audit_log (action, from_id, to_id, amount)\n    VALUES ('transfer', p_from, p_to, p_amount);\nEND;\n$$ LANGUAGE plpgsql;\n\nGRANT EXECUTE ON FUNCTION transfer_funds TO app_readwrite;\n-- Application calls: SELECT transfer_funds($1, $2, $3)\n-- Parameters are automatically safe in function calls",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a comprehensive SQL injection defense framework\n-- APPROACH  - ORM safety audit, second-order injection prevention, WAF rules\n-- STRENGTHS - Production-grade; covers advanced attack vectors\n-- WEAKNESSES- Complex; requires ongoing maintenance\n\n-- Second-order injection: data is stored safely but used unsafely later\n-- Step 1: User registers with name: \"admin'--\"\n-- INSERT INTO users (name) VALUES ($1)  -- stored safely as literal\n-- Step 2: Another query uses the stored name unsafely:\n-- VULNERABLE: cursor.execute(f\"SELECT * FROM logs WHERE user = '{row.name}'\")\n-- Result: SELECT * FROM logs WHERE user = 'admin'--'\n-- SAFE: cursor.execute(\"SELECT * FROM logs WHERE user = %s\", (row.name,))\n\n-- ORM safety audit — find raw query usage:\n-- Django:    .raw() or .extra() — DANGEROUS\n-- SQLAlchemy: text() without bindparams — DANGEROUS\n-- Sequelize:  sequelize.literal() or sequelize.query() with raw — DANGEROUS\n-- Prisma:    $queryRaw or $executeRaw with template literals — check for interpolation\n\n-- Django safe vs unsafe:\n-- UNSAFE: User.objects.raw(f\"SELECT * FROM users WHERE name = '{name}'\")\n-- SAFE:   User.objects.raw(\"SELECT * FROM users WHERE name = %s\", [name])\n-- SAFE:   User.objects.filter(name=name)  # ORM parameterizes automatically\n\n-- SQLAlchemy safe vs unsafe:\n-- UNSAFE: session.execute(text(f\"SELECT * FROM users WHERE name = '{name}'\"))\n-- SAFE:   session.execute(text(\"SELECT * FROM users WHERE name = :name\"), {\"name\": name})\n-- SAFE:   session.query(User).filter(User.name == name)  # ORM parameterizes\n\n-- Dynamic identifier safety (table/column names can't be parameterized):\n-- PostgreSQL: use format() with %I for identifiers\n-- SELECT format('SELECT * FROM %I WHERE id = $1', table_name)\n-- %I safely quotes identifiers: my_table → \"my_table\"\n-- Application-level whitelist:\n-- ALLOWED_TABLES = {'users', 'orders', 'products'}\n-- if table_name not in ALLOWED_TABLES:\n--     raise ValueError('Invalid table name')\n-- query = f'SELECT * FROM {table_name} WHERE id = $1'\n\n-- Connection-level security:\n-- 1. Use SSL/TLS for database connections\n-- conn = psycopg2.connect(host='db.example.com', sslmode='require')\n-- 2. Connection pooling with per-tenant credentials\n-- 3. Row-Level Security (RLS) for multi-tenant isolation\nALTER TABLE orders ENABLE ROW LEVEL SECURITY;\nCREATE POLICY tenant_isolation ON orders\n    USING (tenant_id = current_setting('app.tenant_id')::INT);\n-- SET app.tenant_id = 42;  -- set per request\n\n-- Audit logging for SQL security:\nCREATE TABLE sql_audit (\n    audit_id    BIGSERIAL PRIMARY KEY,\n    db_user     TEXT NOT NULL,\n    app_user    TEXT,\n    query_text  TEXT NOT NULL,\n    query_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    rows_affected INT,\n    client_addr INET\n);\n-- Log via pg_stat_statements or application-level middleware",
          },
        ],
        tips: [
          "Parameterized queries are the ONLY reliable defense — escaping functions can fail with edge cases.",
          "ORMs parameterize by default, but raw query methods (Django .raw(), SQLAlchemy text()) can reintroduce injection.",
          "Use least-privilege DB accounts — app user should never have DROP, ALTER, or GRANT privileges.",
          "Second-order injection: data stored safely via parameterization, but used unsafely in a later query — always parameterize, even for DB-stored values.",
          "Dynamic table/column names can't be parameterized — use a whitelist or PostgreSQL format('%I', name).",
        ],
        mistake: "Thinking ORMs are automatically safe — raw query methods like Django's .raw() or Sequelize's sequelize.literal() bypass parameterization. Always audit raw query usage in your codebase.",
        shorthand: {
          verbose: "-- SQL injection prevention\n-- SAFE: parameterized queries\n--   Python:  cursor.execute('SELECT * FROM t WHERE id = %s', (id,))\n--   Node.js: pool.query('SELECT * FROM t WHERE id = $1', [id])\n--   Java:    pstmt.setString(1, id)\n-- UNSAFE: string concatenation/f-strings\n--   cursor.execute(f'SELECT * FROM t WHERE id = {id}')  -- NEVER\n-- Defense layers: 1) parameterize 2) validate input 3) least privilege 4) stored procs 5) WAF\n-- Identifiers: use whitelist or PG format('%I', name)",
          concise: "-- Prevent SQL injection\n-- ALWAYS: parameterized queries (cursor.execute(sql, params))\n-- NEVER: f-strings or concatenation with user input\n-- ORM raw queries are dangerous — audit .raw(), text(), $queryRaw",
        },
      },
    ],
  },

  // ── Section 7: Migrations & Schema Management ─────────────────────────────────────────
  {
    id: "migrations-schema",
    title: "Migrations & Schema Management",
    entries: [
      {
        id: "database-migrations",
        fn: "Database Migrations — version-controlled schema evolution",
        desc: "Database migrations manage schema changes in version-controlled, reversible steps — ensuring consistent deployments across environments.",
        category: "DevOps",
        subtitle: "migration, schema evolution, version control, Alembic, Flyway, Liquibase, Knex, zero-downtime migration, rollback",
        signature: "migrate up: ALTER TABLE ... | migrate down: ALTER TABLE ... (reversible)",
        descLong: "Database migrations are versioned scripts that evolve a database schema over time. Key principles: (1) Forward-only or reversible — each migration has an 'up' (apply) and 'down' (revert) script. (2) Versioned and ordered — migrations run in sequence, tracked in a migrations table. (3) Atomic — each migration runs in a transaction (where supported). (4) Idempotent — safe to re-run. Tools: Alembic (Python/SQLAlchemy), Flyway (Java), Liquibase (Java), Knex.js (Node.js), Prisma Migrate (Node.js), Django migrations (Python), Rails migrations (Ruby). Best practices: (1) Never edit applied migrations — create a new one. (2) Test migrations on a copy of production data. (3) Use zero-downtime migrations for large tables (add column with default, backfill in batches, swap). (4) Separate schema migrations from data migrations. (5) Always have a rollback plan. Common pitfalls: adding NOT NULL columns without defaults (locks table), creating indexes without CONCURRENTLY (blocks writes), dropping columns still used by application.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Create a basic migration to add a column\n-- APPROACH  - Write up and down SQL scripts\n-- STRENGTHS - Simple; reversible; version-controlled\n-- WEAKNESSES- Not zero-downtime; locks table briefly\n\n-- Migration 001: Add email_verified column to users\n\n-- Up (apply):\nALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;\nUPDATE users SET email_verified = TRUE WHERE email IS NOT NULL;\n\n-- Down (revert):\nALTER TABLE users DROP COLUMN email_verified;\n\n-- Using Knex.js (Node.js):\n-- exports.up = function(knex) {\n--   return knex.schema.table('users', table => {\n--     table.boolean('email_verified').defaultTo(false);\n--   });\n-- };\n-- exports.down = function(knex) {\n--   return knex.schema.table('users', table => {\n--     table.dropColumn('email_verified');\n--   });\n-- };\n\n-- Using Alembic (Python/SQLAlchemy):\n-- def upgrade():\n--     op.add_column('users', sa.Column('email_verified', sa.Boolean(), default=False))\n-- def downgrade():\n--     op.drop_column('users', 'email_verified')",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Perform a zero-downtime migration on a large table\n-- APPROACH  - Multi-step migration: add nullable column, backfill in batches, set NOT NULL\n-- STRENGTHS - No downtime; no long locks; safe for production\n-- WEAKNESSES- Multiple migrations; takes longer to complete\n\n-- Scenario: Add NOT NULL 'status' column to 50M row orders table\n\n-- Migration 001: Add column as nullable (instant, no lock)\nALTER TABLE orders ADD COLUMN status VARCHAR(20);\n\n-- Migration 002: Backfill in batches (application or scheduled job)\n-- Run in batches of 10,000 to avoid long transactions\nDO $$\nDECLARE\n    batch_size INT := 10000;\n    max_id INT;\n    current_id INT := 0;\nBEGIN\n    SELECT MAX(id) INTO max_id FROM orders;\n    WHILE current_id < max_id LOOP\n        UPDATE orders\n        SET status = CASE\n            WHEN total > 1000 THEN 'high_value'\n            WHEN total > 100 THEN 'standard'\n            ELSE 'low_value'\n        END\n        WHERE id > current_id AND id <= current_id + batch_size\n          AND status IS NULL;\n        COMMIT;\n        current_id := current_id + batch_size;\n        PERFORM pg_sleep(0.1);  -- throttle to reduce load\n    END LOOP;\nEND $$;\n\n-- Migration 003: Set default and NOT NULL (fast after backfill)\nALTER TABLE orders ALTER COLUMN status SET DEFAULT 'standard';\nALTER TABLE orders ALTER COLUMN status SET NOT NULL;\n\n-- Migration 004: Add index concurrently (no write blocking)\nCREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);\n\n-- Rollback plan:\n-- Migration 004 down: DROP INDEX CONCURRENTLY idx_orders_status;\n-- Migration 003 down: ALTER TABLE orders ALTER COLUMN status DROP NOT NULL;\n-- Migration 002 down: (no-op, data already backfilled)\n-- Migration 001 down: ALTER TABLE orders DROP COLUMN status;",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a complete migration framework with CI/CD integration\n-- APPROACH  - Migration tooling, testing, deployment pipeline, rollback strategy\n-- STRENGTHS - Production-grade; automated; tested; reversible\n-- WEAKNESSES- Complex setup; requires CI/CD infrastructure\n\n-- Migration file naming convention:\n-- V001__create_users_table.sql       (Flyway style)\n-- 001_create_users_table.py          (Alembic style)\n-- 20240115_120000_add_status.py      (Django style, timestamp-based)\n\n-- Alembic migration with data migration + schema migration:\n-- File: alembic/versions/a1b2c3_split_name_column.py\n\n\"\"\"split name into first_name and last_name\n\nRevision ID: a1b2c3\nRevises: 9z8y7x\nCreate Date: 2024-01-15 12:00:00\n\"\"\"\nfrom alembic import op\nimport sqlalchemy as sa\n\ndef upgrade():\n    # Step 1: Add new columns (nullable, no lock)\n    op.add_column('users', sa.Column('first_name', sa.String(100)))\n    op.add_column('users', sa.Column('last_name', sa.String(100)))\n\n    # Step 2: Backfill data (split existing 'name' column)\n    op.execute(\"\"\"\n        UPDATE users SET\n            first_name = split_part(name, ' ', 1),\n            last_name = CASE\n                WHEN position(' ' in name) > 0\n                THEN substring(name from position(' ' in name) + 1)\n                ELSE ''\n            END\n    \"\"\")\n\n    # Step 3: Set NOT NULL (after all rows are populated)\n    op.alter_column('users', 'first_name', nullable=False)\n    op.alter_column('users', 'last_name', nullable=False)\n\n    # Step 4: Add indexes concurrently\n    op.execute('CREATE INDEX CONCURRENTLY idx_users_first_name ON users(first_name)')\n\n    # Step 5: Drop old column (after app is deployed and no longer uses it)\n    -- op.drop_column('users', 'name')  -- defer to next migration\n\ndef downgrade():\n    # Recreate name column\n    op.add_column('users', sa.Column('name', sa.String(200))\n    # Backfill: combine first and last\n    op.execute(\"UPDATE users SET name = first_name || ' ' || last_name\")\n    op.alter_column('users', 'name', nullable=False)\n    # Drop new columns\n    op.execute('DROP INDEX CONCURRENTLY IF EXISTS idx_users_first_name')\n    op.drop_column('users', 'first_name')\n    op.drop_column('users', 'last_name')\n\n-- CI/CD pipeline (GitHub Actions example):\n-- jobs:\n--   migrate:\n--     steps:\n--       - name: Run migrations on staging\n--         run: alembic upgrade head\n--         env:\n--           DATABASE_URL: ${{ secrets.STAGING_DB_URL }}\n--       - name: Run tests against migrated schema\n--         run: pytest tests/\n--       - name: Deploy to production\n--         if: github.ref == 'refs/heads/main'\n--         run: alembic upgrade head\n--         env:\n--           DATABASE_URL: ${{ secrets.PROD_DB_URL }}\n--       - name: Verify migration\n--         run: alembic current\n\n-- Migration safety checklist:\n-- 1. Test on copy of production data\n-- 2. Estimate migration time for large tables\n-- 3. Use CONCURRENTLY for indexes (PostgreSQL)\n-- 4. Batch large data updates\n-- 5. Have rollback plan tested\n-- 6. Deploy app code BEFORE dropping columns\n-- 7. Deploy app code AFTER adding columns\n-- 8. Never edit applied migrations\n-- 9. Monitor for lock contention during migration\n-- 10. Set lock_timeout for safety: SET lock_timeout = '5s';",
          },
        ],
        tips: [
          "Never edit an applied migration — create a new one to fix mistakes. This ensures all environments stay in sync.",
          "Use CREATE INDEX CONCURRENTLY in PostgreSQL — non-concurrent index creation blocks all writes.",
          "Deploy app code BEFORE dropping columns, and AFTER adding columns — avoid breaking the running application.",
          "Separate schema migrations (DDL) from data migrations (DML) — data migrations may need batch processing.",
          "Set lock_timeout before migrations: SET lock_timeout = '5s' — prevents a migration from hanging indefinitely.",
        ],
        mistake: "Adding a NOT NULL column without a default on a large table — this requires a full table rewrite and blocks all writes. Add as nullable first, backfill, then set NOT NULL in a separate migration.",
        shorthand: {
          verbose: "-- Migrations best practices\n-- 1. Versioned up/down scripts (Alembic, Flyway, Knex, Prisma)\n-- 2. Zero-downtime: add nullable → backfill in batches → set NOT NULL → add index CONCURRENTLY\n-- 3. Never edit applied migrations\n-- 4. Deploy app BEFORE dropping columns, AFTER adding columns\n-- 5. Test on prod copy; have rollback plan\n-- 6. SET lock_timeout = '5s' before migrations",
          concise: "-- Quick migrations\n-- Up: ALTER TABLE t ADD COLUMN c TYPE;\n-- Down: ALTER TABLE t DROP COLUMN c;\n-- Zero-downtime: nullable → backfill → NOT NULL → index CONCURRENTLY",
        },
      },
    ],
  },

  // ── Section 8: Bulk Operations & Performance ─────────────────────────────────────────
  {
    id: "bulk-operations",
    title: "Bulk Operations & Performance",
    entries: [
      {
        id: "bulk-insert-strategies",
        fn: "Bulk Insert Strategies — COPY, multi-row INSERT, batch loading",
        desc: "Bulk insert techniques for loading large datasets efficiently — COPY command, multi-row INSERT, UNNEST, and batch processing patterns.",
        category: "Performance",
        subtitle: "bulk insert, COPY, multi-row INSERT, UNNEST, batch loading, ETL, performance, throughput, WAL, UNLOGGED",
        signature: "PostgreSQL: COPY table FROM '/path/file.csv' CSV HEADER | INSERT INTO t VALUES (...), (...), (...)",
        descLong: "Bulk insert performance is critical for ETL, data loading, and migrations. Methods ranked by speed: (1) COPY (PostgreSQL) / BULK INSERT (SQL Server) / LOAD DATA INFILE (MySQL) — fastest, reads directly from file, bypasses query parsing. (2) Multi-row INSERT — INSERT INTO t VALUES (1,'a'), (2,'b'), (3,'c') — single statement for multiple rows, 10-100x faster than individual INSERTs. (3) UNNEST (PostgreSQL) — insert arrays of values via UNNEST(), useful for bulk upsert. (4) Batch INSERT in application — send N rows per INSERT statement in a loop. Optimization techniques: (a) Drop indexes before load, recreate after — indexes slow down inserts. (b) Use UNLOGGED tables (PostgreSQL) — skip WAL for temporary data. (c) Increase maintenance_work_mem for index rebuilds. (d) Disable foreign key checks during load (MySQL). (e) Use COPY with binary format for maximum speed. (f) Parallel COPY with multiple connections for very large files.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Compare single-row vs multi-row INSERT performance\n-- APPROACH  - Show syntax and explain performance difference\n-- STRENGTHS - Easy to understand; immediate speedup\n-- WEAKNESSES- Multi-row INSERT has query length limits\n\n-- Slow: individual INSERTs (1000 round trips)\nINSERT INTO products (name, price) VALUES ('Widget', 10.00);\nINSERT INTO products (name, price) VALUES ('Gadget', 25.00);\nINSERT INTO products (name, price) VALUES ('Doohickey', 5.00);\n-- ... 997 more INSERTs\n\n-- Fast: multi-row INSERT (1 round trip)\nINSERT INTO products (name, price) VALUES\n    ('Widget', 10.00),\n    ('Gadget', 25.00),\n    ('Doohickey', 5.00);\n-- ... can include thousands of rows in one statement\n\n-- Fastest: COPY from CSV file (PostgreSQL)\nCOPY products (name, price) FROM '/data/products.csv' CSV HEADER;\n-- CSV file:\n-- name,price\n-- Widget,10.00\n-- Gadget,25.00\n-- Doohickey,5.00\n\n-- MySQL equivalent:\nLOAD DATA INFILE '/data/products.csv'\nINTO TABLE products\nFIELDS TERMINATED BY ','\nLINES TERMINATED BY '\\n'\nIGNORE 1 ROWS;\n\n-- SQL Server equivalent:\nBULK INSERT products FROM 'C:\\data\\products.csv'\nWITH (FORMAT = 'CSV', FIRSTROW = 2);",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Optimize bulk load of 10M rows from CSV\n-- APPROACH  - Drop indexes, use COPY, recreate indexes, analyze\n-- STRENGTHS - 10-100x faster than row-by-row inserts\n-- WEAKNESSES- Table is unavailable during index rebuild\n\n-- Step 1: Drop indexes (optional but faster for large loads)\nDROP INDEX idx_products_category;\nDROP INDEX idx_products_name;\n\n-- Step 2: Use COPY with CSV\nCOPY products (name, price, category_id, stock_qty)\nFROM '/data/products_10m.csv'\nCSV HEADER;\n-- Time: ~30 seconds for 10M rows (vs ~30 minutes with INSERTs)\n\n-- Step 3: Recreate indexes (CONCURRENTLY for no-downtime)\nCREATE INDEX CONCURRENTLY idx_products_category ON products(category_id);\nCREATE INDEX CONCURRENTLY idx_products_name ON products(name);\n\n-- Step 4: Update statistics for query planner\nANALYZE products;\n\n-- Alternative: UNLOGGED table (skip WAL, 2x faster but no crash recovery)\nCREATE UNLOGGED TABLE temp_products (LIKE products);\nCOPY temp_products FROM '/data/products_10m.csv' CSV HEADER;\n-- Transfer to permanent table\nINSERT INTO products SELECT * FROM temp_products;\nDROP TABLE temp_products;\n\n-- Application-level batch insert (Python + psycopg2):\n-- from psycopg2.extras import execute_values\n-- rows = [('Widget', 10.00), ('Gadget', 25.00), ...]\n-- execute_values(cursor,\n--     'INSERT INTO products (name, price) VALUES %s',\n--     rows, page_size=1000)\n-- execute_values uses multi-row INSERT internally, 100x faster than executemany",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a parallel bulk loading pipeline for 1B+ rows\n-- APPROACH  - Split file, parallel COPY, partitioned target, progress tracking\n-- STRENGTHS - Scales to billions of rows; parallel; resumable\n-- WEAKNESSES- Complex; requires partitioning; monitoring needed\n\n-- Step 1: Partition the target table (PostgreSQL declarative partitioning)\nCREATE TABLE fact_events (\n    event_id    BIGSERIAL,\n    event_date  DATE NOT NULL,\n    event_type  VARCHAR(50),\n    user_id     BIGINT,\n    payload     JSONB\n) PARTITION BY RANGE (event_date);\n\n-- Create monthly partitions\nCREATE TABLE fact_events_2024_01 PARTITION OF fact_events\n    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');\nCREATE TABLE fact_events_2024_02 PARTITION OF fact_events\n    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');\n-- ... create all needed partitions\n\n-- Step 2: Split large CSV by date (shell)\n-- awk -F, 'NR>1 {print > \"events_\"substr($2,1,7)\".csv\"}' events_1b.csv\n-- This creates: events_2024-01.csv, events_2024-02.csv, etc.\n\n-- Step 3: Parallel COPY (one connection per partition)\n-- Run in parallel (background processes):\nCOPY fact_events_2024_01 FROM '/data/events_2024-01.csv' CSV HEADER;\nCOPY fact_events_2024_02 FROM '/data/events_2024-02.csv' CSV HEADER;\n-- Each COPY runs independently, utilizing multiple CPU cores\n\n-- Step 4: Create indexes per partition (parallel)\nCREATE INDEX idx_events_2024_01_type ON fact_events_2024_01(event_type);\nCREATE INDEX idx_events_2024_01_user ON fact_events_2024_01(user_id);\n\n-- Step 5: Progress tracking table\nCREATE TABLE load_progress (\n    partition_name  VARCHAR(100) PRIMARY KEY,\n    status          VARCHAR(20) DEFAULT 'pending',\n    rows_loaded     BIGINT,\n    started_at      TIMESTAMP,\n    completed_at    TIMESTAMP\n);\n\n-- Update progress after each COPY:\nINSERT INTO load_progress (partition_name, status, rows_loaded, completed_at)\nVALUES ('fact_events_2024_01', 'complete', 85000000, NOW())\nON CONFLICT (partition_name) DO UPDATE\nSET status = 'complete', rows_loaded = EXCLUDED.rows_loaded, completed_at = NOW();\n\n-- Step 6: Post-load optimization\n-- Set parallelism for ANALYZE\nSET max_parallel_maintenance_workers = 4;\nANALYZE fact_events;\n\n-- Step 7: Verify data integrity\nSELECT\n    'fact_events_2024_01' AS partition,\n    count(*) AS row_count,\n    min(event_date) AS min_date,\n    max(event_date) AS max_date,\n    count(DISTINCT event_type) AS unique_types\nFROM fact_events_2024_01\nUNION ALL\nSELECT 'fact_events_2024_02', count(*), min(event_date), max(event_date),\n    count(DISTINCT event_type)\nFROM fact_events_2024_02;\n\n-- Performance tuning for COPY:\n-- SET maintenance_work_mem = '2GB';     -- for index creation\n-- SET max_wal_size = '10GB';           -- reduce WAL checkpoints\n-- SET synchronous_commit = off;        -- faster commits (risk: lose last few on crash)\n-- SET wal_compression = on;            -- compress WAL\n-- COPY ... WITH (FORMAT csv, HEADER true, FREEZE true);  -- FREEZE prevents VACUUM later",
          },
        ],
        tips: [
          "COPY is 10-100x faster than INSERT for large datasets — always prefer COPY for file-based loading.",
          "Use execute_values (psycopg2) or batch INSERT in application code — 100x faster than individual INSERTs.",
          "Drop indexes before large loads, recreate after — indexes slow down inserts significantly.",
          "Use UNLOGGED tables for temporary/staging data — skips WAL, 2x faster, but no crash recovery.",
          "COPY with FREEZE option (PostgreSQL 12+) prevents the need for VACUUM after loading.",
        ],
        mistake: "Using individual INSERT statements in a loop for large data loads — this creates one transaction per row with network round-trip overhead. Use COPY or multi-row INSERT with batching.",
        shorthand: {
          verbose: "-- Bulk insert methods (fastest to slowest)\n-- 1. COPY: COPY t FROM 'file.csv' CSV HEADER (PostgreSQL)\n--    MySQL: LOAD DATA INFILE | SQL Server: BULK INSERT\n-- 2. Multi-row: INSERT INTO t VALUES (...), (...), (...)\n-- 3. execute_values (psycopg2): batch insert from Python\n-- Optimization: drop indexes → COPY → recreate indexes → ANALYZE\n-- UNLOGGED table: 2x faster, no crash recovery\n-- Parallel: split file → parallel COPY into partitions",
          concise: "-- Quick bulk load\n-- PG: COPY t FROM 'file.csv' CSV HEADER\n-- App: execute_values(cursor, 'INSERT INTO t VALUES %s', rows, page_size=1000)\n-- Optimize: drop indexes → load → recreate → ANALYZE",
        },
      },
    ],
  },

  // ── Section 9: Sharding & Horizontal Scaling ─────────────────────────────────────────
  {
    id: "sharding-scaling",
    title: "Sharding & Horizontal Scaling",
    entries: [
      {
        id: "database-sharding",
        fn: "Database Sharding — partition data across multiple servers",
        desc: "Sharding distributes data horizontally across multiple database instances to scale beyond single-server capacity for reads, writes, and storage.",
        category: "Architecture",
        subtitle: "sharding, horizontal scaling, partition key, hash sharding, range sharding, consistent hashing, cross-shard query, shard rebalancing",
        signature: "Shard key: user_id % N_shards → route to shard[N]",
        descLong: "Sharding splits a large database into smaller pieces (shards) across multiple servers. Key concepts: (1) Shard key — the column used to distribute rows (e.g., user_id, tenant_id, geographic region). (2) Sharding strategies: Hash (user_id % N → even distribution), Range (shard 1: IDs 1-1M, shard 2: 1M-2M — good for range queries), Geo (shard by region — data locality), Directory (lookup table maps keys to shards). (3) Cross-shard queries — queries spanning multiple shards are expensive; fan-out queries or scatter-gather. (4) Shard rebalancing — adding/removing shards requires data migration; consistent hashing minimizes movement. (5) Distributed transactions — ACID across shards is hard; use 2PC (two-phase commit) or Saga pattern. When to shard: single server can't handle write throughput, storage exceeds capacity, or geographic latency requires local data. Alternatives to try first: read replicas, vertical scaling, partitioning (single server), caching. Sharding is a last resort — it adds significant operational complexity.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Understand sharding with a simple hash-based example\n-- APPROACH  - Show how rows are distributed across 4 shards using modulo\n-- STRENGTHS - Even distribution; simple to understand\n-- WEAKNESSES- Adding shards requires rehashing all data\n\n-- 4 shards, shard key = user_id\n-- Shard 0: user_id % 4 = 0  (user_ids: 4, 8, 12, 16, ...)\n-- Shard 1: user_id % 4 = 1  (user_ids: 1, 5, 9, 13, ...)\n-- Shard 2: user_id % 4 = 2  (user_ids: 2, 6, 10, 14, ...)\n-- Shard 3: user_id % 4 = 3  (user_ids: 3, 7, 11, 15, ...)\n\n-- Application-level routing (Python pseudo-code):\n-- def get_shard(user_id):\n--     return user_id % 4\n-- \n-- def get_connection(user_id):\n--     shard = get_shard(user_id)\n--     return connections[shard]  # pool of 4 DB connections\n-- \n-- def get_user(user_id):\n--     conn = get_connection(user_id)\n--     return conn.execute('SELECT * FROM users WHERE id = %s', (user_id,))\n\n-- Each shard has identical schema:\nCREATE TABLE users (\n    user_id   BIGINT PRIMARY KEY,\n    email     VARCHAR(255) UNIQUE,\n    name      VARCHAR(100),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert routes to correct shard:\n-- INSERT INTO users (user_id, email, name) VALUES (5, 'a@b.com', 'Alice')\n-- → shard 1 (5 % 4 = 1)",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Implement range-based sharding with a directory service\n-- APPROACH  - Shard directory table maps ranges to shard connection strings\n-- STRENGTHS - Range queries efficient; shards can be added without rehashing\n-- WEAKNESSES- Hot spots if data is skewed; directory is a single point of failure\n\n-- Shard directory (metadata table on a dedicated config server)\nCREATE TABLE shard_directory (\n    shard_id      INT PRIMARY KEY,\n    min_id        BIGINT NOT NULL,\n    max_id        BIGINT NOT NULL,\n    connection    VARCHAR(200) NOT NULL,\n    is_active     BOOLEAN DEFAULT TRUE\n);\n\nINSERT INTO shard_directory VALUES\n    (0, 0,        999999,    'db-shard-0.internal:5432/mydb', TRUE),\n    (1, 1000000,  1999999,   'db-shard-1.internal:5432/mydb', TRUE),\n    (2, 2000000,  2999999,   'db-shard-2.internal:5432/mydb', TRUE),\n    (3, 3000000,  3999999,   'db-shard-3.internal:5432/mydb', TRUE);\n\n-- Application routing (Python pseudo-code):\n-- def get_shard_for_id(entity_id):\n--     row = config_db.execute(\n--         'SELECT connection FROM shard_directory WHERE min_id <= %s AND max_id >= %s',\n--         (entity_id, entity_id))\n--     return row['connection']\n\n-- Adding a new shard (no rehashing needed):\nINSERT INTO shard_directory VALUES\n    (4, 4000000, 4999999, 'db-shard-4.internal:5432/mydb', TRUE);\n\n-- Cross-shard query (scatter-gather):\n-- def get_all_orders_by_user(user_id):\n--     results = []\n--     for shard_conn in all_active_shards:\n--         rows = shard_conn.execute('SELECT * FROM orders WHERE user_id = %s', (user_id,))\n--         results.extend(rows)\n--     return sorted(results, key=lambda r: r['order_date'])",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a production sharding system with consistent hashing and rebalancing\n-- APPROACH  - Consistent hash ring, virtual nodes, automated rebalancing\n-- STRENGTHS - Minimal data movement on shard add/remove; even distribution\n-- WEAKNESSES- Complex; requires careful monitoring; cross-shard joins are hard\n\n-- Consistent hashing: place shards on a hash ring (0 to 2^32-1)\n-- Each shard gets multiple virtual nodes (VNodes) for even distribution\n-- Key lookup: hash(key) → find next shard clockwise on the ring\n\n-- Shard metadata with consistent hashing\nCREATE TABLE shard_ring (\n    vnode_hash    BIGINT PRIMARY KEY,\n    shard_id      INT NOT NULL,\n    connection    VARCHAR(200) NOT NULL,\n    is_active     BOOLEAN DEFAULT TRUE\n);\n\n-- Python implementation:\n-- import hashlib, bisect\n-- class ConsistentHashRing:\n--     def __init__(self, shards, vnodes=256):\n--         self.ring = {}\n--         for sid, conn in shards.items():\n--             for i in range(vnodes):\n--                 h = int(hashlib.md5(f'{sid}:{i}'.encode()).hexdigest(), 16)\n--                 self.ring[h] = sid\n--         self.sorted_hashes = sorted(self.ring.keys())\n--     def get_shard(self, key):\n--         h = int(hashlib.md5(str(key).encode()).hexdigest(), 16)\n--         idx = bisect.bisect_right(self.sorted_hashes, h)\n--         if idx == len(self.sorted_hashes): idx = 0\n--         return self.ring[self.sorted_hashes[idx]]\n--     def add_shard(self, sid, conn, vnodes=256):\n--         for i in range(vnodes):\n--             h = int(hashlib.md5(f'{sid}:{i}'.encode()).hexdigest(), 16)\n--             self.ring[h] = sid\n--         self.sorted_hashes = sorted(self.ring.keys())\n--         # Only keys that now map to new shard need migration\n\n-- Cross-shard aggregation (MapReduce pattern):\n-- from concurrent.futures import ThreadPoolExecutor\n-- def get_total_revenue():\n--     def query_shard(shard_conn):\n--         return shard_conn.execute('SELECT SUM(total) FROM orders')[0]['sum']\n--     with ThreadPoolExecutor(max_workers=4) as executor:\n--         results = list(executor.map(query_shard, all_shard_connections))\n--     return sum(results)\n\n-- Anti-patterns to avoid:\n-- 1. Don't shard by low-cardinality column (e.g., boolean) — uneven distribution\n-- 2. Don't shard by frequently-changing column — row migration between shards\n-- 3. Avoid cross-shard JOINs — denormalize or use application-level joins\n-- 4. Don't use auto-increment IDs as shard keys — sequential writes hit one shard\n-- 5. Don't forget shard failover — need replicas per shard",
          },
        ],
        tips: [
          "Try everything else before sharding: read replicas, caching, vertical scaling, partitioning. Sharding adds major operational complexity.",
          "Choose a shard key with high cardinality and even distribution — user_id or tenant_id are common choices.",
          "Avoid sharding by columns that change (e.g., email) — updating the shard key requires row migration.",
          "Cross-shard JOINs are expensive — denormalize or perform application-level joins instead.",
          "Use consistent hashing to minimize data movement when adding/removing shards — only affected keys migrate.",
        ],
        mistake: "Sharding by auto-increment ID — sequential writes all hit the latest shard, creating a hot spot. Use a hash of a high-cardinality column instead.",
        shorthand: {
          verbose: "-- Sharding strategies\n-- Hash: shard = user_id % N (even, but rehash on add/remove)\n-- Range: shard by ID ranges (good for range queries, hot spots)\n-- Geo: shard by region (data locality, compliance)\n-- Directory: lookup table maps keys to shards (flexible, SPOF)\n-- Consistent hashing: virtual nodes on hash ring (minimal migration)\n-- Cross-shard: scatter-gather (fan-out) or denormalize to avoid\n-- Try first: replicas, caching, partitioning, vertical scaling",
          concise: "-- Quick sharding\n-- Hash: id % N_shards → route to shard\n-- Key: high cardinality, even distribution, rarely changes\n-- Avoid: cross-shard JOINs, auto-increment shard keys",
        },
      },
    ],
  },

  // ── Section 10: CQRS & Event Sourcing ─────────────────────────────────────────
  {
    id: "cqrs-pattern",
    title: "CQRS & Event Sourcing",
    entries: [
      {
        id: "cqrs-event-sourcing",
        fn: "CQRS & Event Sourcing — separate read/write models, append-only event log",
        desc: "CQRS separates read and write operations into different models for independent scaling. Event sourcing stores state changes as an immutable event log.",
        category: "Architecture",
        subtitle: "CQRS, command query responsibility segregation, event sourcing, event store, projection, read model, write model, eventual consistency",
        signature: "Write: INSERT INTO events (type, payload) | Read: SELECT from read_model (projection of events)",
        descLong: "CQRS (Command Query Responsibility Segregation) splits operations: Commands (writes) go to a write model optimized for validation and business logic; Queries (reads) go to a read model optimized for query performance. Event Sourcing stores every state change as an immutable event in an append-only log. The current state is derived by replaying events. Key concepts: (1) Event store — append-only table/log of all events. (2) Aggregates — domain entities that validate commands and produce events. (3) Projections — build read models from events (materialized views, denormalized tables). (4) Eventual consistency — read models may lag behind writes. (5) Snapshots — periodic state snapshots to avoid replaying all events. Benefits: audit trail, time travel, decoupled read/write scaling, event replay for new projections. Drawbacks: complexity, eventual consistency, schema evolution for events, debugging difficulty. Use cases: financial systems, audit-heavy applications, systems with very different read vs write patterns.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Understand CQRS with separate read/write tables\n-- APPROACH  - Write to events table, project to a read-optimized table\n-- STRENGTHS - Audit trail; read model optimized for queries\n-- WEAKNESSES- Eventual consistency; more complexity\n\n-- Write model: append-only event log\nCREATE TABLE events (\n    event_id      BIGSERIAL PRIMARY KEY,\n    aggregate_id  UUID NOT NULL,\n    event_type    VARCHAR(50) NOT NULL,\n    payload       JSONB NOT NULL,\n    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Read model: current state projection\nCREATE TABLE user_summary (\n    user_id       UUID PRIMARY KEY,\n    email         VARCHAR(255),\n    name          VARCHAR(100),\n    order_count   INT DEFAULT 0,\n    total_spent   DECIMAL(12,2) DEFAULT 0,\n    last_order_at TIMESTAMP\n);\n\n-- Write: append event (command handler)\nINSERT INTO events (aggregate_id, event_type, payload)\nVALUES (\n    '550e8400-e29b-41d4-a716-446655440000',\n    'OrderPlaced',\n    '{\"user_id\": \"550e8400...\", \"order_id\": \"ord-123\", \"total\": 99.99}'\n);\n\n-- Projection: update read model from event\nINSERT INTO user_summary (user_id, order_count, total_spent, last_order_at)\nVALUES ('550e8400-e29b-41d4-a716-446655440000', 1, 99.99, NOW())\nON CONFLICT (user_id) DO UPDATE\nSET order_count = user_summary.order_count + 1,\n    total_spent = user_summary.total_spent + 99.99,\n    last_order_at = NOW();\n\n-- Read: query the read model (fast, denormalized)\nSELECT * FROM user_summary WHERE user_id = '550e8400...';",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Build a CQRS system with event sourcing for an order system\n-- APPROACH  - Event store + projection triggers + multiple read models\n-- STRENGTHS - Full audit trail; multiple read models from same events\n-- WEAKNESSES- Projection lag; debugging requires event replay\n\n-- Event store (write model)\nCREATE TABLE event_store (\n    event_id        BIGSERIAL PRIMARY KEY,\n    aggregate_id    UUID NOT NULL,\n    aggregate_type  VARCHAR(50) NOT NULL,\n    event_type      VARCHAR(50) NOT NULL,\n    payload         JSONB NOT NULL,\n    metadata        JSONB,\n    version         INT NOT NULL,\n    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    UNIQUE (aggregate_id, version)\n);\n\nCREATE INDEX idx_events_aggregate ON event_store(aggregate_id, version);\nCREATE INDEX idx_events_type ON event_store(event_type, created_at);\n\n-- Read model 1: order summary (for dashboards)\nCREATE TABLE read_order_summary (\n    order_id    UUID PRIMARY KEY,\n    user_id     UUID NOT NULL,\n    status      VARCHAR(20),\n    total       DECIMAL(12,2),\n    item_count  INT,\n    created_at  TIMESTAMP,\n    updated_at  TIMESTAMP\n);\n\n-- Read model 2: user activity (for user profile)\nCREATE TABLE read_user_activity (\n    user_id       UUID PRIMARY KEY,\n    total_orders  INT DEFAULT 0,\n    total_spent   DECIMAL(12,2) DEFAULT 0,\n    last_active   TIMESTAMP\n);\n\n-- Projection function: process events and update read models\nCREATE FUNCTION project_order_events() RETURNS VOID AS $$\nDECLARE ev RECORD;\nBEGIN\n    FOR ev IN SELECT * FROM event_store WHERE event_type LIKE 'Order%' ORDER BY event_id LOOP\n        IF ev.event_type = 'OrderCreated' THEN\n            INSERT INTO read_order_summary (order_id, user_id, status, total, item_count, created_at, updated_at)\n            VALUES (ev.aggregate_id, (ev.payload->>'user_id')::UUID, 'pending',\n                    (ev.payload->>'total')::DECIMAL(12,2),\n                    jsonb_array_length(ev.payload->'items'), ev.created_at, ev.created_at)\n            ON CONFLICT DO NOTHING;\n        ELSIF ev.event_type = 'OrderShipped' THEN\n            UPDATE read_order_summary SET status = 'shipped', updated_at = ev.created_at\n            WHERE order_id = ev.aggregate_id;\n        ELSIF ev.event_type = 'OrderDelivered' THEN\n            UPDATE read_order_summary SET status = 'delivered', updated_at = ev.created_at\n            WHERE order_id = ev.aggregate_id;\n        END IF;\n    END LOOP;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Rebuild read model from scratch (event replay):\nTRUNCATE read_order_summary;\nSELECT project_order_events();\n-- Replays ALL events to reconstruct current state — time travel capability",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build production CQRS with snapshots, sagas, and schema evolution\n-- APPROACH  - Snapshots for performance, saga for distributed transactions\n-- STRENGTHS - Scalable; auditable; temporal queries; schema evolution\n-- WEAKNESSES- Very complex; requires event versioning; eventual consistency\n\n-- Snapshot table (avoid replaying all events for large aggregates)\nCREATE TABLE aggregate_snapshots (\n    aggregate_id    UUID NOT NULL,\n    aggregate_type  VARCHAR(50) NOT NULL,\n    version         INT NOT NULL,\n    state           JSONB NOT NULL,\n    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    PRIMARY KEY (aggregate_id, version)\n);\n\n-- Rebuild aggregate from snapshot + subsequent events\nCREATE FUNCTION load_aggregate(p_id UUID) RETURNS JSONB AS $$\nDECLARE snap RECORD; ev RECORD; state JSONB; ver INT;\nBEGIN\n    SELECT * INTO snap FROM aggregate_snapshots WHERE aggregate_id = p_id ORDER BY version DESC LIMIT 1;\n    IF FOUND THEN state := snap.state; ver := snap.version;\n    ELSE state := '{}'::JSONB; ver := 0; END IF;\n    FOR ev IN SELECT * FROM event_store WHERE aggregate_id = p_id AND version > ver ORDER BY version ASC LOOP\n        state := state || ev.payload; ver := ev.version;\n    END LOOP;\n    -- Save snapshot every 100 events\n    IF ver - COALESCE(snap.version, 0) >= 100 THEN\n        INSERT INTO aggregate_snapshots (aggregate_id, aggregate_type, version, state)\n        VALUES (p_id, 'Order', ver, state) ON CONFLICT DO NOTHING;\n    END IF;\n    RETURN state;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Event schema evolution (versioned events)\nALTER TABLE event_store ADD COLUMN event_version INT NOT NULL DEFAULT 1;\n\n-- Upcaster: transform old event versions to new schema\nCREATE FUNCTION upcast_event(ev JSONB, from_v INT, to_v INT) RETURNS JSONB AS $$\nBEGIN\n    IF from_v = 1 AND to_v = 2 THEN\n        RETURN jsonb_set(ev, '{amount}', to_jsonb((ev->>'amount')::DECIMAL));\n    END IF;\n    RETURN ev;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Saga pattern for distributed transactions\nCREATE TABLE saga_instances (\n    saga_id     UUID PRIMARY KEY,\n    saga_type   VARCHAR(50) NOT NULL,\n    status      VARCHAR(20) DEFAULT 'running',\n    current_step INT DEFAULT 0,\n    payload     JSONB NOT NULL,\n    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE saga_steps (\n    saga_id     UUID REFERENCES saga_instances(saga_id),\n    step_num    INT NOT NULL,\n    step_name   VARCHAR(100) NOT NULL,\n    status      VARCHAR(20) DEFAULT 'pending',\n    compensation TEXT,\n    executed_at TIMESTAMP,\n    PRIMARY KEY (saga_id, step_num)\n);\n\n-- Saga: Order fulfillment (ReserveInventory → ChargePayment → Ship)\n-- If shipping fails: compensate in reverse: RefundPayment → ReleaseInventory\n\n-- Temporal query: state at a specific time\nCREATE FUNCTION get_state_at_time(p_id UUID, p_time TIMESTAMP) RETURNS JSONB AS $$\nDECLARE result JSONB := '{}'::JSONB; ev RECORD;\nBEGIN\n    FOR ev IN SELECT payload FROM event_store WHERE aggregate_id = p_id AND created_at <= p_time ORDER BY version ASC LOOP\n        result := result || ev.payload;\n    END LOOP;\n    RETURN result;\nEND;\n$$ LANGUAGE plpgsql;\n-- Usage: SELECT get_state_at_time('order-uuid', '2024-06-15 10:30:00');",
          },
        ],
        tips: [
          "CQRS is worth it when read and write patterns differ significantly — e.g., complex dashboards with simple writes.",
          "Event sourcing gives you a full audit trail for free — every state change is recorded.",
          "Use snapshots every N events to avoid replaying the entire event log for large aggregates.",
          "Event schema evolution is critical — use event_version column and upcasters to transform old events.",
          "Eventual consistency means read models may lag — inform users or use read-your-writes consistency for critical paths.",
        ],
        mistake: "Using CQRS for simple CRUD applications — the complexity of separate read/write models, projections, and event handling is not justified. CQRS shines for complex domains with different read/write patterns.",
        shorthand: {
          verbose: "-- CQRS + Event Sourcing\n-- Write: INSERT INTO event_store (aggregate_id, event_type, payload) VALUES (...)\n-- Project: trigger/function updates read model from events\n-- Read: SELECT * FROM read_model WHERE ... (denormalized, fast)\n-- Rebuild: TRUNCATE read_model; replay all events\n-- Snapshot: save aggregate state every N events to avoid full replay\n-- Saga: distributed transaction with compensating actions on failure\n-- Temporal: replay events up to a timestamp for point-in-time state",
          concise: "-- Quick CQRS\n-- Write: append event to event_store\n-- Read: query denormalized read_model (projection of events)\n-- Rebuild: replay events → reconstruct state",
        },
      },
    ],
  },

  // ── Section 11: Replication & High Availability ─────────────────────────────────────────
  {
    id: "replication-ha",
    title: "Replication & High Availability",
    entries: [
      {
        id: "database-replication",
        fn: "Database Replication — streaming, logical, and sync strategies",
        desc: "Replication copies data from a primary database to replicas for high availability, read scaling, and disaster recovery. Strategies include streaming, logical, and synchronous replication.",
        category: "Operations",
        subtitle: "replication, streaming replication, logical replication, synchronous, asynchronous, read replica, failover, high availability, WAL",
        signature: "Primary: INSERT → WAL → Replica applies WAL | Async: no wait | Sync: wait for replica ACK",
        descLong: "Database replication distributes data across multiple servers for availability, read scaling, and disaster recovery. Types: (1) Streaming (physical) replication — replicates WAL at the byte level; replica is an exact copy; fastest; PostgreSQL native. (2) Logical replication — replicates at the transaction level (INSERT/UPDATE/DELETE); can replicate selective tables; cross-version compatible; PostgreSQL 10+. (3) Synchronous replication — primary waits for replica confirmation before committing; zero data loss; higher latency. (4) Asynchronous replication — primary commits without waiting; minimal latency; potential data loss on failover. (5) Read replicas — serve read queries; application routes writes to primary, reads to replicas. (6) Failover — automatic (Patroni, repmgr) or manual promotion of replica to primary. Key metrics: RPO (Recovery Point Objective — how much data can be lost), RTO (Recovery Time Objective — how fast to recover).",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Set up basic streaming replication (PostgreSQL)\n-- APPROACH  - Configure primary for WAL shipping, replica for recovery\n-- STRENGTHS - Simple; native to PostgreSQL; exact copy\n-- WEAKNESSES- Replica is read-only; no selective replication\n\n-- On PRIMARY (postgresql.conf):\n-- wal_level = replica\n-- max_wal_senders = 3\n-- listen_addresses = '*'\n\n-- On PRIMARY (pg_hba.conf):\n-- host replication replicator 192.168.1.0/24 md5\n\n-- Create replication user:\nCREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'securepass';\n\n-- On REPLICA (initial base backup):\n-- pg_basebackup -h primary_host -U replicator -D /var/lib/postgresql/data -Fp -Xs -P\n\n-- On REPLICA (standby.signal):\n-- touch /var/lib/postgresql/data/standby.signal\n-- primary_conninfo = 'host=primary_host port=5432 user=replicator password=securepass'\n\n-- Verify replication on primary:\nSELECT application_name, client_addr, state, sync_state,\n       sent_lsn, write_lsn, replay_lsn\nFROM pg_stat_replication;\n\n-- Verify on replica:\nSELECT status, sender_host FROM pg_stat_wal_receiver;\n\n-- Read from replica (read-only):\n-- psql -h replica_host -c 'SELECT count(*) FROM users;'\n-- Writes fail: ERROR: cannot execute INSERT in a read-only transaction",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Configure read replicas with application-level read/write splitting\n-- APPROACH  - Primary for writes, replicas for reads; connection pooler routing\n-- STRENGTHS - Read scaling; write capacity preserved\n-- WEAKNESSES- Replication lag; eventual consistency for reads\n\n-- Synchronous replication (zero data loss, higher latency):\n-- On primary (postgresql.conf):\n-- synchronous_standby_names = 'FIRST 1 (replica1)'\n-- Commits wait for replica1 to acknowledge WAL receipt\n\n-- Application-level read/write splitting (Python pseudo-code):\n-- write_pool = psycopg2.pool.ThreadedConnectionPool(5, 20, host='db-primary.internal', ...)\n-- read_pool = psycopg2.pool.ThreadedConnectionPool(5, 20, host='db-replica-1.internal', ...)\n-- \n-- def execute_query(sql, params=None, read_only=False):\n--     pool = read_pool if read_only else write_pool\n--     conn = pool.getconn()\n--     try:\n--         cur = conn.cursor()\n--         cur.execute(sql, params)\n--         if read_only: return cur.fetchall()\n--         conn.commit()\n--         return cur.rowcount\n--     finally:\n--         pool.putconn(conn)\n-- \n-- def get_user(user_id):\n--     return execute_query('SELECT * FROM users WHERE id = %s', (user_id,), read_only=True)\n-- def create_user(email, name):\n--     return execute_query('INSERT INTO users (email, name) VALUES (%s, %s)', (email, name))\n\n-- Check replication lag on replica:\nSELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;\n\n-- Promote replica to primary (failover):\n-- pg_ctl promote -D /var/lib/postgresql/data\n-- Or: SELECT pg_promote();",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build multi-AZ HA cluster with automated failover and logical replication\n-- APPROACH  - Patroni for HA + logical replication for selective table sync\n-- STRENGTHS - Zero RPO; automated failover; selective replication; cross-version\n-- WEAKNESSES- Very complex; requires etcd; monitoring overhead\n\n-- Architecture:\n-- AZ-1: Primary + etcd + Patroni\n-- AZ-2: Sync Replica + etcd + Patroni (failover candidate)\n-- AZ-3: Async Replica + etcd + Patroni (read replica)\n-- Patroni manages: leader election, automatic failover, configuration\n-- etcd stores: cluster state, leader lock\n-- HAProxy routes: writes to leader, reads to replicas\n\n-- Patroni config (patroni.yml):\n-- scope: pg_cluster\n-- name: node1\n-- etcd: {hosts: etcd1:2379,etcd2:2379,etcd3:2379}\n-- postgresql:\n--   parameters:\n--     wal_level: replica\n--     synchronous_commit: on\n--     synchronous_standby_names: '*'\n\n-- Logical replication (selective, cross-version):\n-- On PUBLISHER (primary):\nCREATE PUBLICATION sales_pub FOR TABLE orders, order_items, customers\n    WHERE (created_at >= '2024-01-01');\n\n-- On SUBSCRIBER (replica or different cluster):\nCREATE SUBSCRIPTION sales_sub\n    CONNECTION 'host=primary.internal port=5432 dbname=mydb user=replicator'\n    PUBLICATION sales_pub\n    WITH (copy_data = true, create_slot = true, slot_name = 'sales_sub_slot');\n\n-- Logical replication advantages:\n-- 1. Selective tables (not entire database)\n-- 2. Cross-version (upgrade without downtime)\n-- 3. Row-level filtering (WHERE clause)\n-- 4. Bidirectional (multi-master with conflict resolution)\n\n-- Monitor replication:\nSELECT application_name, state, sync_state,\n       sent_lsn, replay_lsn,\n       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes\nFROM pg_stat_replication;\n\n-- Replication slots (prevent WAL removal before replica catches up)\nSELECT slot_name, slot_type, active, restart_lsn,\n       pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS retained_wal\nFROM pg_replication_slots;\n-- WARNING: inactive slots retain WAL indefinitely — monitor and drop unused\n\n-- Disaster recovery (cross-region async replication):\n-- Region 1: Primary + sync replica (RPO=0 within region)\n-- Region 2: Async replica (RPO=seconds, for DR)\n-- Failover: detect failure → promote sync replica → update DNS → old primary becomes replica",
          },
        ],
        tips: [
          "Synchronous replication = zero data loss (RPO=0) but higher latency. Asynchronous = lower latency but potential data loss.",
          "Monitor replication lag: pg_stat_replication on primary, pg_last_xact_replay_timestamp() on replica.",
          "Use replication slots to prevent WAL removal before replica catches up — but drop inactive slots to avoid WAL buildup.",
          "Logical replication enables selective table replication, cross-version upgrades, and row-level filtering.",
          "Patroni + etcd provides automated failover with leader election — eliminates manual promotion during outages.",
        ],
        mistake: "Using asynchronous replication for financial data and assuming zero data loss — async replication can lose committed transactions on primary failure. Use synchronous replication for RPO=0 requirements.",
        shorthand: {
          verbose: "-- Replication types\n-- Streaming (physical): WAL byte-level, exact copy, read-only replica\n-- Logical: transaction-level, selective tables, cross-version\n-- Sync: primary waits for replica ACK (RPO=0, higher latency)\n-- Async: no wait (lower latency, potential data loss)\n-- Setup: CREATE ROLE replicator WITH REPLICATION; pg_basebackup; standby.signal\n-- Failover: pg_promote() or Patroni automated\n-- Monitor: pg_stat_replication, pg_replication_slots\n-- Logical: CREATE PUBLICATION / CREATE SUBSCRIPTION",
          concise: "-- Quick replication\n-- Streaming: wal_level=replica, pg_basebackup, standby.signal\n-- Sync: synchronous_standby_names='FIRST 1 (replica1)'\n-- Logical: CREATE PUBLICATION pub FOR TABLE t; CREATE SUBSCRIPTION sub\n-- Monitor: pg_stat_replication (lag), pg_replication_slots (WAL retention)",
        },
      },
    ],
  },

  // ── Section 12: Connection Management & Pooling ─────────────────────────────────────────
  {
    id: "connection-pooling",
    title: "Connection Management & Pooling",
    entries: [
      {
        id: "connection-pooling",
        fn: "Connection Pooling — PgBouncer, pgcat, and application-level pools",
        desc: "Connection pooling reuses database connections to reduce overhead, handle connection storms, and scale to thousands of concurrent clients without exhausting database resources.",
        category: "Operations",
        subtitle: "connection pool, PgBouncer, pgcat, pool size, max_connections, session pooling, transaction pooling, statement pooling, connection storm",
        signature: "PgBouncer: [databases] db = host=localhost port=5432 | pool_mode = transaction",
        descLong: "Database connections are expensive — each requires a TCP socket, authentication, memory for backend process, and state. PostgreSQL defaults to max_connections=100, but each connection uses ~10MB of shared memory. Connection pooling solves this: (1) PgBouncer — lightweight connection pooler for PostgreSQL; modes: session (one client per server connection), transaction (connection returned after each transaction — most efficient), statement (returned after each statement — no multi-statement transactions). (2) pgcat — thread-based pooler with sharding support. (3) Application-level pools — HikariCP (Java), psycopg2.pool (Python), node-pg-pool (Node.js). Key concepts: pool_size (max server connections), reserve_size (overflow connections), server_idle_timeout (close idle connections), query_wait_timeout (max wait for connection). Best practices: pool_size = (core_count * 2) + effective_spindle_count (HikariCP formula); use transaction pooling for most apps; monitor for connection leaks; set statement_timeout and idle_in_transaction_session_timeout. Anti-patterns: opening a connection per request without pooling, holding connections during long idle periods, not closing connections on error.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Understand why connection pooling is needed\n-- APPROACH  - Show connection limits and overhead\n-- STRENGTHS - Clear motivation; easy to understand\n-- WEAKNESSES- Simplified; doesn't cover all pooling modes\n\n-- PostgreSQL connection overhead:\n-- Each connection = 1 backend process + ~10MB memory\n-- Default max_connections = 100\n-- 100 connections = ~1GB memory just for connections\n-- 1000 connections = ~10GB memory — may exhaust server\n\n-- Without pooling (1 connection per request):\n-- 1000 concurrent requests → 1000 connections → OOM or refused connections\n\n-- With pooling (PgBouncer, transaction mode):\n-- 1000 concurrent requests → 20 server connections → 20 backend processes\n-- PgBouncer multiplexes: clients share server connections per transaction\n\n-- PgBouncer config (pgbouncer.ini):\n-- [databases]\n-- mydb = host=127.0.0.1 port=5432 dbname=mydb\n-- \n-- [pgbouncer]\n-- listen_addr = 0.0.0.0\n-- listen_port = 6432\n-- auth_type = md5\n-- auth_file = /etc/pgbouncer/userlist.txt\n-- pool_mode = transaction\n-- max_client_conn = 1000\n-- default_pool_size = 20\n-- reserve_pool_size = 5\n-- server_idle_timeout = 300\n\n-- Application connects to PgBouncer (port 6432) instead of PostgreSQL (port 5432):\n-- psql -h localhost -p 6432 -U myuser mydb\n\n-- Check PgBouncer stats:\n-- SHOW pools;  -- active/cl_waiting/served client connections\n-- SHOW stats;  -- total xacts, queries, bytes in/out",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Configure application-level connection pooling (Python)\n-- APPROACH  - Use psycopg2.pool.ThreadedConnectionPool with proper sizing\n-- STRENGTHS - Application-level control; no external pooler needed\n-- WEAKNESSES- Less efficient than PgBouncer for high concurrency\n\n-- Python psycopg2 connection pool:\n-- from psycopg2 import pool\n-- \n-- # Pool sizing formula: (core_count * 2) + effective_spindle_count\n-- # For 4-core server with SSD: (4 * 2) + 1 = 9, round to 10\n-- db_pool = pool.ThreadedConnectionPool(\n--     minconn=5,      # minimum connections kept open\n--     maxconn=20,     # maximum connections in pool\n--     host='db.internal',\n--     port=5432,\n--     dbname='mydb',\n--     user='app_user',\n--     password='secret',\n--     connect_timeout=5,\n--     options='-c statement_timeout=30000 -c idle_in_transaction_session_timeout=60000'\n-- )\n-- \n-- def query(sql, params=None):\n--     conn = db_pool.getconn()\n--     try:\n--         cur = conn.cursor()\n--         cur.execute(sql, params)\n--         result = cur.fetchall()\n--         conn.commit()\n--         return result\n--     except Exception:\n--         conn.rollback()\n--         raise\n--     finally:\n--         db_pool.putconn(conn)  # ALWAYS return connection to pool\n-- \n-- # Critical: set timeouts to prevent connection leaks\n-- # statement_timeout=30000: kill queries > 30s\n-- # idle_in_transaction_session_timeout=60000: kill idle transactions > 60s\n\n-- Node.js with pg-pool:\n-- const { Pool } = require('pg');\n-- const pool = new Pool({\n--   host: 'db.internal',\n--   port: 5432,\n--   database: 'mydb',\n--   user: 'app_user',\n--   password: 'secret',\n--   max: 20,              // max connections\n--   idleTimeoutMillis: 30000,  // close idle connections after 30s\n--   connectionTimeoutMillis: 5000,  // wait 5s for connection\n--   statement_timeout: 30000,  // kill queries > 30s\n-- });\n-- \n-- async function query(sql, params) {\n--   const client = await pool.connect();\n--   try {\n--     const result = await client.query(sql, params);\n--     return result.rows;\n--   } finally {\n--     client.release();  // ALWAYS release\n--   }\n-- }\n\n-- Monitor connections on PostgreSQL:\nSELECT count(*) AS total_connections,\n       count(*) FILTER (WHERE state = 'active') AS active,\n       count(*) FILTER (WHERE state = 'idle') AS idle,\n       count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_txn\nFROM pg_stat_activity;\n\n-- Find long-running queries:\nSELECT pid, now() - query_start AS duration, query, state\nFROM pg_stat_activity\nWHERE state = 'active' AND now() - query_start > interval '30 seconds'\nORDER BY duration DESC;\n\n-- Kill stuck connections:\n-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < now() - interval '5 minutes';",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a production connection pooling architecture with PgBouncer + HA\n-- APPROACH  - PgBouncer per app instance + PgBouncer HA + connection monitoring\n-- STRENGTHS - Handles 10K+ concurrent clients; HA; monitored; auto-scaling\n-- WEAKNESSES- Complex setup; transaction mode limitations (no session state)\n\n-- Architecture:\n-- App instances (N) → PgBouncer (per instance or shared) → PostgreSQL primary + replicas\n-- \n-- Option A: PgBouncer sidecar (per app instance)\n--   Each app has its own PgBouncer, pool_size=10\n--   Total connections = N_instances * 10 = manageable\n-- \n-- Option B: Shared PgBouncer (2 instances for HA)\n--   All apps connect to PgBouncer VIP (HAProxy/keepalived)\n--   PgBouncer handles all pooling, pool_size=50\n--   Total connections = 50 (regardless of app instances)\n\n-- PgBouncer production config (pgbouncer.ini):\n-- [databases]\n-- mydb = host=pg-primary.internal port=5432 dbname=mydb\n-- mydb_ro = host=pg-replica.internal port=5432 dbname=mydb\n-- \n-- [pgbouncer]\n-- listen_addr = 0.0.0.0\n-- listen_port = 6432\n-- auth_type = scram-sha-256\n-- auth_file = /etc/pgbouncer/userlist.txt\n-- pool_mode = transaction\n-- max_client_conn = 5000\n-- default_pool_size = 25\n-- reserve_pool_size = 5\n-- reserve_pool_timeout = 3\n-- max_db_connections = 50\n-- server_idle_timeout = 300\n-- server_lifetime = 3600\n-- query_wait_timeout = 120\n-- client_idle_timeout = 0\n-- ignore_startup_parameters = extra_float_digits\n-- \n-- [users]\n-- app_user = pool_mode=transaction, max_user_connections=30\n\n-- Transaction mode limitations:\n-- 1. No session-level features: SET, LISTEN/NOTIFY, advisory locks, temp tables\n-- 2. No prepared statements at protocol level (use SQL-level PREPARE)\n-- 3. No SET search_path (use options=-c search_path=... in connection string)\n\n-- Workaround for session features:\n-- Use session mode for specific connections that need session state:\n-- [users]\n-- admin_user = pool_mode=session\n-- app_user = pool_mode=transaction\n\n-- Monitoring dashboard queries:\n-- PgBouncer admin (connect to pgbouncer admin database):\n-- psql -p 6432 -U pgbouncer pgbouncer\n-- SHOW POOLS;  -- database, user, cl_active, cl_waiting, sv_active, sv_idle\n-- SHOW STATS;  -- total_xact_count, total_query_count, total_received, total_sent\n-- SHOW MEM;    -- memory usage\n-- SHOW FDS;    -- file descriptors\n\n-- PostgreSQL connection monitoring:\nCREATE VIEW connection_stats AS\nSELECT\n    datname,\n    usename,\n    application_name,\n    state,\n    count(*) AS connection_count,\n    avg(now() - state_change) AS avg_duration_in_state\nFROM pg_stat_activity\nGROUP BY datname, usename, application_name, state\nORDER BY connection_count DESC;\n\n-- Alert: too many idle in transaction connections\nSELECT count(*) AS idle_in_txn,\n       count(*) FILTER (WHERE state_change < now() - interval '5 minutes') AS idle_over_5min\nFROM pg_stat_activity\nWHERE state = 'idle in transaction';\n-- If idle_over_5min > 10 → alert: application not closing transactions\n\n-- Connection leak detection:\n-- Tag connections with application_name for tracing:\n-- conn = psycopg2.connect(..., application_name=f'worker-{worker_id}-{request_id}')\n-- Then query pg_stat_activity to find leaked connections:\nSELECT application_name, count(*) FROM pg_stat_activity\nWHERE state = 'idle' AND application_name LIKE 'worker-%'\nGROUP BY application_name HAVING count(*) > 1;\n-- Multiple connections with same worker_id = connection leak",
          },
        ],
        tips: [
          "Pool size formula: (core_count * 2) + effective_spindle_count — more connections don't mean faster, they cause context switching overhead.",
          "Use PgBouncer transaction mode for most apps — connections are returned after each transaction, maximizing reuse.",
          "Always set statement_timeout and idle_in_transaction_session_timeout — prevent connection leaks from stuck queries.",
          "Transaction mode doesn't support session-level features (LISTEN/NOTIFY, advisory locks, temp tables) — use session mode for those.",
          "Tag connections with application_name for tracing — helps identify connection leaks in pg_stat_activity.",
        ],
        mistake: "Setting pool_size too high (e.g., 100 connections per app instance) — this causes context switching overhead and can exhaust PostgreSQL's max_connections. Use the formula: (cores * 2) + spindles.",
        shorthand: {
          verbose: "-- Connection pooling\n-- PgBouncer: transaction mode (most efficient), session mode (session features)\n-- Pool size: (cores * 2) + spindles (HikariCP formula)\n-- Timeouts: statement_timeout=30s, idle_in_transaction_session_timeout=60s\n-- App pools: psycopg2.pool (Python), pg.Pool (Node.js), HikariCP (Java)\n-- Monitor: pg_stat_activity (connections by state), SHOW POOLS (PgBouncer)\n-- Leak detection: tag with application_name, check for duplicates\n-- Transaction mode: no LISTEN/NOTIFY, advisory locks, temp tables, SET commands",
          concise: "-- Quick pooling\n-- PgBouncer: pool_mode=transaction, default_pool_size=20\n-- Pool size: (cores * 2) + 1\n-- Always: set statement_timeout, idle_in_transaction_session_timeout\n-- Monitor: pg_stat_activity, SHOW POOLS",
        },
      },
    ],
  },

  // ── Section 13: Performance Anti-Patterns ─────────────────────────────────────────
  {
    id: "performance-antipatterns",
    title: "Performance Anti-Patterns",
    entries: [
      {
        id: "query-antipatterns",
        fn: "Query Anti-Patterns — N+1, implicit casts, function on indexed column, SELECT *",
        desc: "Common SQL performance anti-patterns that cause slow queries, full table scans, and poor scalability — with detection and fixes.",
        category: "Performance",
        subtitle: "anti-pattern, N+1 queries, implicit cast, function on index, SELECT *, OR in WHERE, leading wildcard, correlated subquery, sargability",
        signature: "BAD: WHERE LOWER(email) = 'x' | GOOD: WHERE email = LOWER('x') | BAD: SELECT * | GOOD: SELECT id, name",
        descLong: "SQL performance anti-patterns are common mistakes that degrade query performance, often silently. Key anti-patterns: (1) N+1 queries — executing one query per row in a loop instead of a single JOIN; fix with JOIN or batch fetching. (2) Function on indexed column — WHERE LOWER(email) = 'x' prevents index usage; fix with expression index or rewrite. (3) SELECT * — fetches all columns including large TEXT/JSONB; fix by selecting only needed columns. (4) Leading wildcard — WHERE name LIKE '%john' can't use B-tree index; fix with trigram index (pg_trgm) or full-text search. (5) Implicit type casts — WHERE string_col = 123 causes cast on every row; fix by matching types. (6) OR in WHERE — can prevent index usage; fix with UNION ALL. (7) Correlated subqueries in SELECT — executes per row; fix with JOIN or LATERAL. (8) COUNT(*) for existence check — scans entire table; fix with EXISTS. (9) Offset pagination — OFFSET 1000000 scans 1M rows; fix with keyset pagination. (10) Not using EXPLAIN — guessing at performance instead of measuring.",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Identify and fix the most common anti-patterns\n-- APPROACH  - Show bad vs good query side by side\n-- STRENGTHS - Quick wins; easy to understand and apply\n-- WEAKNESSES- Only covers basic patterns\n\n-- 1. SELECT * anti-pattern\n-- BAD: fetches all columns (including large JSONB payloads)\nSELECT * FROM orders WHERE customer_id = 42;\n-- GOOD: only fetch needed columns (uses covering index)\nSELECT order_id, order_date, total FROM orders WHERE customer_id = 42;\n\n-- 2. Function on indexed column\n-- BAD: LOWER() prevents index usage → full table scan\nSELECT * FROM users WHERE LOWER(email) = 'alice@example.com';\n-- GOOD: apply function to the constant, not the column\nSELECT * FROM users WHERE email = LOWER('alice@example.com');\n-- Or create an expression index:\nCREATE INDEX idx_users_email_lower ON users(LOWER(email));\n\n-- 3. Leading wildcard LIKE\n-- BAD: '%john' can't use B-tree index\nSELECT * FROM customers WHERE name LIKE '%john%';\n-- GOOD: use trigram index (pg_trgm extension)\nCREATE EXTENSION IF NOT EXISTS pg_trgm;\nCREATE INDEX idx_customers_name_trgm ON customers USING gin(name gin_trgm_ops);\nSELECT * FROM customers WHERE name ILIKE '%john%';  -- now uses GIN index\n\n-- 4. COUNT(*) for existence check\n-- BAD: counts all matching rows\nSELECT COUNT(*) FROM orders WHERE customer_id = 42;\n-- GOOD: stops at first match\nSELECT EXISTS(SELECT 1 FROM orders WHERE customer_id = 42);\n\n-- 5. Implicit type cast\n-- BAD: string column compared to integer → cast on every row\nSELECT * FROM products WHERE product_code = 12345;\n-- GOOD: match types\nSELECT * FROM products WHERE product_code = '12345';",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Fix N+1 queries and OR-based filtering\n-- APPROACH  - Replace loops with JOINs; replace OR with UNION ALL\n-- STRENGTHS - Major performance improvement; common in ORM apps\n-- WEAKNESSES- Requires understanding of query plans\n\n-- N+1 query problem (ORM-generated):\n-- BAD: 1 query for users + N queries for orders (1 per user)\n-- users = SELECT * FROM users LIMIT 100;\n-- for user in users:\n--     orders = SELECT * FROM orders WHERE user_id = user.id;  -- 100 queries!\n-- Total: 101 queries\n\n-- GOOD: single JOIN query\nSELECT u.id, u.name, o.order_id, o.total\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.id <= 100;\n-- Total: 1 query\n\n-- Or batch fetch (if you need separate objects):\n-- SELECT * FROM orders WHERE user_id = ANY(ARRAY[1,2,3,...,100]);\n\n-- OR in WHERE clause (may prevent index usage):\n-- BAD: OR across different columns → optimizer may do full scan\nSELECT * FROM orders WHERE customer_id = 42 OR product_id = 100;\n-- GOOD: UNION ALL (each subquery can use its own index)\nSELECT * FROM orders WHERE customer_id = 42\nUNION ALL\nSELECT * FROM orders WHERE product_id = 100 AND customer_id <> 42;\n\n-- Correlated subquery in SELECT (executes per row):\n-- BAD: subquery runs for each order\nSELECT o.order_id,\n       (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count\nFROM orders o;\n-- GOOD: JOIN with aggregation (single pass)\nSELECT o.order_id, COALESCE(oi.item_count, 0) AS item_count\nFROM orders o\nLEFT JOIN (\n    SELECT order_id, COUNT(*) AS item_count\n    FROM order_items GROUP BY order_id\n) oi ON o.order_id = oi.order_id;\n\n-- Offset pagination (gets slower with deeper pages):\n-- BAD: OFFSET 100000 scans 100K rows just to skip them\nSELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 100000;\n-- GOOD: keyset pagination (seek method)\nSELECT * FROM orders\nWHERE created_at < '2024-06-15 10:30:00'\nORDER BY created_at DESC LIMIT 20;\n-- Next page: use last row's created_at as the cursor",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a query performance audit framework\n-- APPROACH  - Detect anti-patterns automatically using pg_stat_statements and query analysis\n-- STRENGTHS - Automated; comprehensive; production monitoring\n-- WEAKNESSES- Requires PostgreSQL extensions; ongoing maintenance\n\n-- Enable pg_stat_statements for query tracking\n-- In postgresql.conf:\n-- shared_preload_libraries = 'pg_stat_statements'\n-- pg_stat_statements.max = 10000\n-- pg_stat_statements.track = all\n\n-- Find slowest queries:\nSELECT queryid,\n       calls,\n       round(mean_exec_time::numeric, 2) AS avg_ms,\n       round(total_exec_time::numeric, 2) AS total_ms,\n       rows,\n       shared_blks_hit,\n       shared_blks_read,\n       round(100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0), 1) AS cache_hit_pct\nFROM pg_stat_statements\nWHERE query NOT LIKE '%pg_stat%'\nORDER BY total_exec_time DESC\nLIMIT 20;\n\n-- Identify queries with low cache hit ratio (need better indexing):\nSELECT queryid, calls, shared_blks_hit, shared_blks_read,\n       round(100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0), 1) AS hit_pct\nFROM pg_stat_statements\nWHERE shared_blks_read > 100\n  AND round(100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0), 1) < 90\nORDER BY shared_blks_read DESC;\n-- Low hit_pct = disk reads > cache → missing index or bad query\n\n-- Find unused indexes (candidates for removal):\nSELECT schemaname, relname, indexrelname,\n       idx_scan AS scans, idx_tup_read, idx_tup_fetch,\n       pg_size_pretty(pg_relation_size(indexrelid)) AS size\nFROM pg_stat_user_indexes\nWHERE idx_scan = 0\n  AND schemaname NOT IN ('pg_catalog', 'information_schema')\nORDER BY pg_relation_size(indexrelid) DESC;\n-- Drop unused indexes to speed up writes\n\n-- Find tables needing VACUUM (high dead tuples):\nSELECT relname, n_live_tup, n_dead_tup,\n       round(100.0 * n_dead_tup / NULLIF(n_live_tup, 0), 1) AS dead_pct,\n       last_autovacuum, last_autoanalyze\nFROM pg_stat_user_tables\nWHERE n_dead_tup > 1000\nORDER BY n_dead_tup DESC;\n-- High dead_pct → VACUUM needed (bloat)\n\n-- Detect sequential scans on large tables (missing indexes):\nSELECT relname, seq_scan, seq_tup_read,\n       idx_scan, n_live_tup,\n       pg_size_pretty(pg_relation_size(relid)) AS size\nFROM pg_stat_user_tables\nWHERE seq_scan > 10\n  AND n_live_tup > 100000\n  AND seq_tup_read > n_live_tup * seq_scan * 0.5\nORDER BY seq_tup_read DESC;\n-- Large tables with many seq scans → add indexes\n\n-- Query plan analysis function:\nCREATE FUNCTION analyze_query(p_sql TEXT) RETURNS TABLE(\n    plan_line TEXT, cost REAL, rows BIGINT, actual_time REAL, loops INT\n) AS $$\nBEGIN\n    -- Create temp table with EXPLAIN ANALYZE output\n    EXECUTE 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' || p_sql;\n    -- Parse and return key metrics\n    RETURN QUERY\n    SELECT plan->>'Plan' AS plan_line,\n           (plan->'Plan'->>'Total Cost')::REAL AS cost,\n           (plan->'Plan'->>'Actual Rows')::BIGINT AS rows,\n           (plan->'Plan'->>'Actual Total Time')::REAL AS actual_time,\n           (plan->'Plan'->>'Actual Loops')::INT AS loops\n    FROM (SELECT value::JSONB AS plan FROM json_array_elements(\n        (SELECT result FROM EXPLAIN (ANALYZE, FORMAT JSON) p_sql)\n    )) t;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Performance checklist:\n-- 1. EXPLAIN ANALYZE every slow query — don't guess\n-- 2. Look for Seq Scan on large tables → add index\n-- 3. Look for Sort nodes → add index for ORDER BY\n-- 4. Look for Hash Join with large hash → add index on join column\n-- 5. Check cache hit ratio > 95% (shared_buffers)\n-- 6. Check for nested loops with high row estimates → bad join strategy\n-- 7. Monitor pg_stat_statements for regression over time\n-- 8. Set enable_seqscan = off temporarily to see if index helps\n-- 9. Check for parallel queries (Gather node) — increase max_parallel_workers\n-- 10. VACUUM ANALYZE after large data changes",
          },
        ],
        tips: [
          "Always EXPLAIN ANALYZE slow queries — don't guess at performance. Look for Seq Scan on large tables.",
          "N+1 queries are the #1 ORM performance issue — use JOIN or batch fetching (WHERE id = ANY(array)).",
          "Functions on indexed columns prevent index usage — rewrite or create expression indexes.",
          "Keyset pagination (WHERE col < last_value) is O(1) vs OFFSET pagination which is O(n).",
          "Monitor pg_stat_statements for slow queries and low cache hit ratios — set up alerts.",
        ],
        mistake: "Adding indexes without checking EXPLAIN ANALYZE first — indexes help reads but slow writes. Always verify the index is actually used by the query plan after creation.",
        shorthand: {
          verbose: "-- Anti-patterns to avoid\n-- 1. N+1 queries → use JOIN or WHERE id = ANY(array)\n-- 2. Function on index col → WHERE LOWER(col)='x' → use expression index\n-- 3. SELECT * → select only needed columns\n-- 4. Leading wildcard → LIKE '%x%' → use pg_trgm GIN index\n-- 5. COUNT(*) for existence → use EXISTS\n-- 6. OR in WHERE → use UNION ALL\n-- 7. OFFSET pagination → use keyset (WHERE col < last_value)\n-- 8. Correlated subquery → use JOIN with aggregation\n-- Detect: pg_stat_statements (slow queries), pg_stat_user_indexes (unused), pg_stat_user_tables (seq scans)",
          concise: "-- Quick anti-patterns\n-- BAD: WHERE LOWER(col)='x' → GOOD: WHERE col=LOWER('x')\n-- BAD: SELECT * → GOOD: SELECT id, name\n-- BAD: OFFSET 100000 → GOOD: WHERE created_at < 'cursor'\n-- BAD: N+1 queries → GOOD: JOIN or ANY(array)",
        },
      },
    ],
  },

  // ── Section 14: SQL Testing & Data Quality ─────────────────────────────────────────
  {
    id: "sql-testing-quality",
    title: "SQL Testing & Data Quality",
    entries: [
      {
        id: "sql-testing",
        fn: "SQL Testing — unit tests, integration tests, and data quality checks",
        desc: "Test SQL queries and database schemas with unit tests, integration tests, data quality assertions, and CI/CD pipeline integration.",
        category: "Testing",
        subtitle: "SQL testing, unit test, integration test, data quality, assertion, test fixture, CI/CD, pgTAP, database testing, schema validation",
        signature: "SELECT test_eq('check user count', expected := 10, actual := (SELECT COUNT(*) FROM users))",
        descLong: "SQL testing ensures database queries, schemas, and data transformations are correct. Test levels: (1) Unit tests — test individual functions, stored procedures, and queries in isolation. (2) Integration tests — test multiple components together (schema + data + queries). (3) Data quality checks — assert data integrity (no nulls in required fields, referential integrity, value ranges). (4) Regression tests — ensure query results don't change after refactoring. Tools: pgTAP (PostgreSQL unit testing), DBT tests (data quality), pytest-postgresql (Python integration), schemathesis (schema validation). Best practices: (1) Test against a fresh database or transaction rollback. (2) Use fixtures (seed data) for consistent test conditions. (3) Test edge cases: empty tables, null values, large datasets. (4) Run tests in CI/CD before deployment. (5) Test migrations (up and down). Data quality dimensions: completeness (no missing data), uniqueness (no duplicates), validity (correct formats), consistency (cross-table rules), timeliness (data is current).",
        examples: [
          {
            tier: "intro",
            code: "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Write basic SQL assertions for data quality\n-- APPROACH  - Simple SELECT-based checks with expected vs actual\n-- STRENGTHS - No tools needed; easy to understand\n-- WEAKNESSES- Manual; no framework; no CI integration\n\n-- Check 1: No NULL emails in users table\nSELECT CASE WHEN COUNT(*) > 0\n       THEN 'FAIL: ' || COUNT(*) || ' users have NULL email'\n       ELSE 'PASS: All users have email' END\nFROM users WHERE email IS NULL;\n\n-- Check 2: All order totals are positive\nSELECT CASE WHEN COUNT(*) > 0\n       THEN 'FAIL: ' || COUNT(*) || ' orders have non-positive total'\n       ELSE 'PASS: All order totals are positive' END\nFROM orders WHERE total <= 0;\n\n-- Check 3: Referential integrity (no orphaned order_items)\nSELECT CASE WHEN COUNT(*) > 0\n       THEN 'FAIL: ' || COUNT(*) || ' orphaned order_items'\n       ELSE 'PASS: All order_items have valid orders' END\nFROM order_items oi\nLEFT JOIN orders o ON oi.order_id = o.order_id\nWHERE o.order_id IS NULL;\n\n-- Check 4: Uniqueness (no duplicate emails)\nSELECT CASE WHEN COUNT(*) > 0\n       THEN 'FAIL: ' || COUNT(*) || ' duplicate emails'\n       ELSE 'PASS: All emails are unique' END\nFROM (SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1) dups;\n\n-- Run all checks:\n-- psql -f quality_checks.sql | grep FAIL\n-- If any FAIL → alert or block deployment",
          },
          {
            tier: "junior",
            code: "-- === JUNIOR EXAMPLE ===\n-- TASK      - Use pgTAP for structured SQL unit testing\n-- APPROACH  - pgTAP framework with test functions and assertions\n-- STRENGTHS - Structured; CI-friendly; rich assertion library\n-- WEAKNESSES- Requires pgTAP extension; PostgreSQL only\n\n-- Install pgTAP:\n-- CREATE EXTENSION IF NOT EXISTS pgtap;\n\n-- Test file: test_user_functions.sql\nBEGIN;\nSELECT plan(5);  -- expect 5 tests\n\n-- Test 1: Table exists\nSELECT has_table('users', 'users table exists');\n\n-- Test 2: Column exists with correct type\nSELECT col_type_is('users', 'email', 'character varying(255)',\n                   'email column is varchar(255)');\n\n-- Test 3: Unique constraint exists\nSELECT col_is_unique('users', 'email', 'email is unique');\n\n-- Test 4: Function returns expected result\nINSERT INTO users (email, name) VALUES ('test@example.com', 'Test User');\nSELECT is(\n    (SELECT name FROM users WHERE email = 'test@example.com'),\n    'Test User',\n    'get_user_by_email returns correct name'\n);\n\n-- Test 5: Function handles missing user\nSELECT is(\n    (SELECT COUNT(*) FROM users WHERE email = 'nonexistent@example.com'),\n    0,\n    'nonexistent user returns 0 count'\n);\n\n-- Cleanup and finish\nDELETE FROM users WHERE email = 'test@example.com';\nSELECT finish();\nROLLBACK;  -- rollback all test data\n\n-- Run tests:\n-- psql -d testdb -f test_user_functions.sql\n-- Output:\n-- ok 1 - users table exists\n-- ok 2 - email column is varchar(255)\n-- ok 3 - email is unique\n-- ok 4 - get_user_by_email returns correct name\n-- ok 5 - nonexistent user returns 0 count\n-- 1..5\n-- Looks like you passed 5 of 5 tests.",
          },
          {
            tier: "senior",
            code: "-- === SENIOR EXAMPLE ===\n-- TASK      - Build a complete SQL testing framework with CI/CD integration\n-- APPROACH  - pgTAP + DBT tests + GitHub Actions pipeline\n-- STRENGTHS - Comprehensive; automated; catches regressions\n-- WEAKNESSES- Complex setup; requires multiple tools\n\n-- DBT data quality tests (schema.yml):\n-- models:\n--   users:\n--     columns:\n--       - name: email\n--         tests:\n--           - unique\n--           - not_null\n--       - name: user_id\n--         tests:\n--           - not_null\n--           - relationships:\n--               to: ref('orders')\n--               field: user_id\n--   orders:\n--     tests:\n--       - dbt_utils.expression_is_true:\n--           expression: \"total >= 0\"\n--       - dbt_utils.test_at_least_one:\n--           field: order_id\n\n-- Custom DBT test (tests/assert_order_total_matches_items.sql):\nSELECT\n    o.order_id,\n    o.total AS order_total,\n    SUM(oi.quantity * oi.unit_price) AS items_total,\n    o.total - SUM(oi.quantity * oi.unit_price) AS difference\nFROM orders o\nJOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY o.order_id, o.total\nHAVING ABS(o.total - SUM(oi.quantity * oi.unit_price)) > 0.01\n-- If any rows returned → test fails\n\n-- pgTAP stored procedure test:\nCREATE OR REPLACE FUNCTION test_transfer_funds() RETURNS VOID AS $$\nBEGIN\n    PERFORM plan(4);\n\n    -- Setup: create test accounts\n    INSERT INTO accounts (id, balance) VALUES (1001, 1000.00), (1002, 500.00);\n\n    -- Test: successful transfer\n    PERFORM transfer_funds(1001, 1002, 200.00);\n    PERFORM is(\n        (SELECT balance FROM accounts WHERE id = 1001),\n        800.00,\n        'sender balance decreased by 200'\n    );\n    PERFORM is(\n        (SELECT balance FROM accounts WHERE id = 1002),\n        700.00,\n        'receiver balance increased by 200'\n    );\n\n    -- Test: insufficient funds raises exception\n    PERFORM throws_ok(\n        'SELECT transfer_funds(1001, 1002, 10000.00)',\n        'insufficient_funds',\n        'transfer with insufficient funds raises error'\n    );\n\n    -- Test: negative amount raises exception\n    PERFORM throws_ok(\n        'SELECT transfer_funds(1001, 1002, -100.00)',\n        'invalid_amount',\n        'negative transfer amount raises error'\n    );\n\n    PERFORM finish();\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Run: SELECT test_transfer_funds();\n\n-- GitHub Actions CI pipeline:\n-- jobs:\n--   db-tests:\n--     services:\n--       postgres:\n--         image: postgres:16\n--         env:\n--           POSTGRES_PASSWORD: test\n--     steps:\n--       - uses: actions/checkout@v4\n--       - name: Install pgTAP\n--         run: psql -h localhost -U postgres -c 'CREATE EXTENSION pgtap;'\n--       - name: Run migrations\n--         run: psql -h localhost -U postgres -f migrations/*.sql\n--       - name: Run pgTAP tests\n--         run: pg_prove -h localhost -U postgres tests/*.sql\n--       - name: Run DBT tests\n--         run: dbt test --profiles-dir .dbt\n--       - name: Run data quality checks\n--         run: psql -h localhost -U postgres -f quality_checks.sql | grep -q FAIL && exit 1 || exit 0\n\n-- Data quality monitoring (scheduled job):\nCREATE TABLE data_quality_results (\n    check_name    VARCHAR(100) PRIMARY KEY,\n    status        VARCHAR(10),  -- pass, fail, warning\n    details       TEXT,\n    checked_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE FUNCTION run_quality_checks() RETURNS VOID AS $$\nBEGIN\n    -- Completeness: no null emails\n    INSERT INTO data_quality_results (check_name, status, details)\n    VALUES ('users_email_not_null',\n        CASE WHEN EXISTS(SELECT 1 FROM users WHERE email IS NULL) THEN 'fail' ELSE 'pass' END,\n        (SELECT COUNT(*) || ' users with null email' FROM users WHERE email IS NULL))\n    ON CONFLICT (check_name) DO UPDATE SET status = EXCLUDED.status, details = EXCLUDED.details, checked_at = NOW();\n\n    -- Uniqueness: no duplicate emails\n    INSERT INTO data_quality_results (check_name, status, details)\n    VALUES ('users_email_unique',\n        CASE WHEN EXISTS(SELECT 1 FROM users GROUP BY email HAVING COUNT(*) > 1) THEN 'fail' ELSE 'pass' END,\n        (SELECT COUNT(*) || ' duplicate emails' FROM (SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1) d))\n    ON CONFLICT (check_name) DO UPDATE SET status = EXCLUDED.status, details = EXCLUDED.details, checked_at = NOW();\n\n    -- Referential integrity\n    INSERT INTO data_quality_results (check_name, status, details)\n    VALUES ('orders_customer_fk',\n        CASE WHEN EXISTS(\n            SELECT 1 FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id\n            WHERE c.customer_id IS NULL)\n        THEN 'fail' ELSE 'pass' END,\n        (SELECT COUNT(*) || ' orphaned orders' FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id\n         WHERE c.customer_id IS NULL))\n    ON CONFLICT (check_name) DO UPDATE SET status = EXCLUDED.status, details = EXCLUDED.details, checked_at = NOW();\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Schedule: run daily via pg_cron or external scheduler\n-- SELECT cron.schedule('quality_checks', '0 6 * * *', 'SELECT run_quality_checks()');\n-- Alert on failures: SELECT * FROM data_quality_results WHERE status = 'fail';",
          },
        ],
        tips: [
          "Use transaction rollback for test isolation: BEGIN; run tests; ROLLBACK; — no cleanup needed.",
          "pgTAP provides rich assertions: is(), isnt(), has_table(), col_type_is(), throws_ok(), results_eq().",
          "DBT tests are SQL files that return rows on failure — simple but powerful for data quality.",
          "Test edge cases: empty tables, NULL values, duplicate keys, boundary values, large datasets.",
          "Run data quality checks on a schedule (pg_cron) and alert on failures — catch data issues early.",
        ],
        mistake: "Testing only the happy path — always test edge cases: NULL inputs, empty result sets, duplicate keys, constraint violations, and concurrent modifications.",
        shorthand: {
          verbose: "-- SQL testing\n-- pgTAP: SELECT plan(N); ... SELECT is(actual, expected, 'desc'); ... SELECT finish();\n-- DBT tests: schema.yml with unique, not_null, relationships, custom SQL tests\n-- Data quality: completeness (no nulls), uniqueness (no dups), validity (formats), consistency (FK), timeliness\n-- CI: pg_prove tests/*.sql | dbt test | quality_checks.sql\n-- Isolation: BEGIN; tests; ROLLBACK;\n-- Schedule: cron.schedule('quality', '0 6 * * *', 'SELECT run_quality_checks()')",
          concise: "-- Quick SQL testing\n-- pgTAP: SELECT is(actual, expected, 'test name')\n-- DBT: unique, not_null, relationships tests in schema.yml\n-- Isolation: BEGIN; ... ROLLBACK;\n-- CI: pg_prove tests/*.sql",
        },
      },
    ],
  },

]

export default { meta, sections }
