export const meta = {
  "id": "indexing",
  "label": "Indexing & Performance",
  "icon": "⚡",
  "description": "SQL indexing strategies, query optimization, EXPLAIN plans, and performance tuning patterns."
}

export const sections = [

  // ── Section 1: Index Types & Strategies ─────────────────────────────────────────
  {
    id: "index-types",
    title: "Index Types & Strategies",
    entries: [
      {
        id: "index-fundamentals",
        fn: "B-Tree Indexes — When, Where & How",
        desc: "Create and use B-tree indexes effectively: single-column, composite, covering indexes, and index-only scans.",
        category: "Indexing",
        subtitle: "CREATE INDEX, composite index, covering index, partial index, index-only scan",
        signature: "CREATE INDEX idx ON table(col)  |  CREATE INDEX idx ON table(a, b) INCLUDE (c)",
        descLong: "B-tree indexes are the default and most versatile index type. They speed up equality (=), range (<, >, BETWEEN), sorting (ORDER BY), and grouping (GROUP BY). Composite indexes cover multiple columns — column order matters (leftmost prefix rule). Covering indexes include all columns needed by a query, enabling index-only scans (no table lookup). Partial indexes index only a subset of rows (WHERE clause), saving space. Over-indexing slows writes — every INSERT/UPDATE must update all indexes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of B-Tree Indexes — When, Where & How — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Single column index ──────────────────────────────\nCREATE INDEX idx_users_email ON users(email);\n-- Speeds up: WHERE email = '...'\n-- Speeds up: WHERE email LIKE 'alice%' (prefix only!)\n-- Does NOT help: WHERE email LIKE '%alice%'"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of B-Tree Indexes — When, Where & How — common patterns you'll see in production.\n-- APPROACH  - Combine B-Tree Indexes — When, Where & How with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Composite (multi-column) index ──────────────────\nCREATE INDEX idx_orders_user_date\n    ON orders(user_id, order_date DESC);\n-- Speeds up: WHERE user_id = 1\n-- Speeds up: WHERE user_id = 1 AND order_date > '2024-01-01'\n-- Speeds up: WHERE user_id = 1 ORDER BY order_date DESC\n-- Does NOT help: WHERE order_date > '2024-01-01' (without user_id)\n-- Rule: leftmost prefix — must include leading columns"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of B-Tree Indexes — When, Where & How — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Covering index (INCLUDE) — index-only scans ────,CREATE INDEX idx_orders_covering,    ON orders(user_id, order_date),    INCLUDE (amount, status);,-- Query reads entirely from index — no table lookup,-- SELECT amount, status FROM orders,-- WHERE user_id = 1 AND order_date > '2024-01-01',\n\n-- ── Partial index — index a subset of rows ──────────,CREATE INDEX idx_orders_active,    ON orders(user_id, created_at),    WHERE status = 'active';,-- Only indexes active orders — much smaller than full index,-- Speeds up: WHERE status = 'active' AND user_id = 1,,CREATE INDEX idx_users_unverified,    ON users(created_at),    WHERE verified = false;,-- Only indexes unverified users — great for cleanup queries,\n\n-- ── Unique index ────────────────────────────────────,CREATE UNIQUE INDEX idx_users_email_unique ON users(email);,-- Enforces uniqueness + speeds up lookups,\n\n-- ── Expression / functional index ───────────────────,CREATE INDEX idx_users_lower_email ON users(LOWER(email));,-- Speeds up: WHERE LOWER(email) = 'alice@example.com',,CREATE INDEX idx_orders_month ON orders(DATE_TRUNC('month', order_date));,-- Speeds up: WHERE DATE_TRUNC('month', order_date) = '2024-01-01',\n\n-- ── When NOT to index ───────────────────────────────,-- Small tables (< 1000 rows) — full scan is faster,-- Columns with low cardinality (boolean, status with 3 values),-- Tables with heavy INSERT/UPDATE — each index slows writes,-- Columns rarely used in WHERE, JOIN, or ORDER BY"
                  }
        ],
        tips: [
                  "Composite index column order matters — put equality columns first, then range columns. (user_id, date) not (date, user_id).",
                  "Partial indexes are powerful for hot paths — index only active/pending rows if 90% of queries filter on status.",
                  "INCLUDE columns in covering indexes avoid table lookups but are not searchable — put filter columns in the index, display columns in INCLUDE.",
                  "Expression indexes must match the query exactly — LOWER(email) index only helps WHERE LOWER(email) = ..., not WHERE email = ..."
        ],
        mistake: "Creating an index on (date, user_id) then querying WHERE user_id = 1 — the index cannot be used because user_id is not the leftmost column. Column order in composite indexes must match query patterns.",
        shorthand: {
          verbose: "CREATE INDEX idx_users_email ON users(email);\nCREATE INDEX idx_orders_user_date ON orders(user_id, order_date DESC);\nCREATE INDEX idx_orders_active ON orders(user_id, created_at) WHERE status = 'active';",
          concise: "CREATE INDEX idx_orders_covering ON orders(user_id, order_date) INCLUDE (amount, status);\n-- Index-only scan: no table lookup needed",
        },
      },
      {
        id: "specialized-indexes",
        fn: "GIN, GiST, Hash & Full-Text Indexes",
        desc: "Specialized index types: GIN for arrays/JSONB/full-text, GiST for geometry/ranges, Hash for equality-only lookups.",
        category: "Indexing",
        subtitle: "GIN, GiST, Hash, full-text search, JSONB indexing, trigram",
        signature: "CREATE INDEX idx ON table USING gin(col)  |  USING gist(col)  |  USING hash(col)",
        descLong: "Beyond B-tree, PostgreSQL offers specialized index types. GIN (Generalized Inverted Index) indexes composite values — arrays, JSONB, full-text search vectors, and trigrams. GiST (Generalized Search Tree) handles geometric data, ranges, and nearest-neighbor queries. Hash indexes are fastest for simple equality but support nothing else. Full-text search with tsvector + GIN enables Google-like text search without external tools.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of GIN, GiST, Hash & Full-Text Indexes — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── GIN index for JSONB ──────────────────────────────\nCREATE INDEX idx_products_data ON products USING gin(metadata);\n-- Speeds up: WHERE metadata @> '{\"color\": \"red\"}'\n-- Speeds up: WHERE metadata ? 'color'\n-- Speeds up: WHERE metadata->>'brand' = 'Nike' (with jsonb_path_ops)"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of GIN, GiST, Hash & Full-Text Indexes — common patterns you'll see in production.\n-- APPROACH  - Combine GIN, GiST, Hash & Full-Text Indexes with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- GIN with jsonb_path_ops — smaller, faster for containment\nCREATE INDEX idx_products_data_ops\n    ON products USING gin(metadata jsonb_path_ops);\n-- Only supports @> (containment), but faster and smaller"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of GIN, GiST, Hash & Full-Text Indexes — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── GIN index for arrays ────────────────────────────,CREATE INDEX idx_posts_tags ON posts USING gin(tags);,-- Speeds up: WHERE tags @> ARRAY['sql'],-- Speeds up: WHERE tags && ARRAY['sql', 'python'] (overlap),\n\n-- ── Full-text search ────────────────────────────────,-- Add a tsvector column,ALTER TABLE articles ADD COLUMN search_vector tsvector;,UPDATE articles SET search_vector =,    to_tsvector('english', title || ' ' || body);,,CREATE INDEX idx_articles_fts ON articles USING gin(search_vector);,\n\n-- Search query,SELECT title, ts_rank(search_vector, query) AS rank,FROM articles,,     to_tsquery('english', 'postgresql & performance') AS query,WHERE search_vector @@ query,ORDER BY rank DESC;,\n\n-- ── Trigram index (fuzzy / LIKE '%...%') ────────────,CREATE EXTENSION IF NOT EXISTS pg_trgm;,,CREATE INDEX idx_users_name_trgm,    ON users USING gin(name gin_trgm_ops);,-- Speeds up: WHERE name LIKE '%alice%'   (substring!),-- Speeds up: WHERE name % 'alce'         (fuzzy/typo tolerant),\n\n-- Similarity search,SELECT name, similarity(name, 'Jonh Smith') AS sim,FROM users,WHERE name % 'Jonh Smith',ORDER BY sim DESC;,\n\n-- ── GiST index for ranges & geometry ────────────────,CREATE INDEX idx_events_daterange,    ON events USING gist(date_range);,-- Speeds up: WHERE date_range @> '2024-06-15'::date,,CREATE INDEX idx_locations_point,    ON locations USING gist(coordinates);,-- Speeds up: ORDER BY coordinates <-> point(40.7, -74.0) LIMIT 10,-- (nearest neighbor search),\n\n-- ── Hash index (equality only, very fast) ───────────,CREATE INDEX idx_sessions_token ON sessions USING hash(token);,-- Speeds up: WHERE token = 'abc123',-- Does NOT help: range queries, sorting, LIKE"
                  }
        ],
        tips: [
                  "GIN with jsonb_path_ops is 2-3x smaller and faster than default GIN for JSONB — use it if you only need @> containment queries.",
                  "pg_trgm + GIN enables LIKE '%substring%' searches with index support — without it, these are always full table scans.",
                  "Full-text search with tsvector + GIN is built into PostgreSQL — you may not need Elasticsearch for basic text search.",
                  "Hash indexes are the fastest for exact equality lookups but support nothing else — B-tree is usually a better default."
        ],
        mistake: "Using B-tree indexes for JSONB containment queries (metadata @> ...) — B-tree cannot index JSONB structure. Use GIN indexes for JSONB, arrays, and full-text search.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCREATE INDEX idx_products_data ON products USING gin(metadata);\n-- Slow: WHERE metadata ->> 'color' = 'red' without index\n// More explicit but longer",
          concise: "CREATE INDEX idx_articles_fts ON articles USING gin(search_vector);\nSELECT * FROM articles WHERE search_vector @@ to_tsquery('sql');",
        },
      },
    ],
  },

  // ── Section 2: Query Optimization ─────────────────────────────────────────
  {
    id: "query-optimization",
    title: "Query Optimization",
    entries: [
      {
        id: "explain-plans",
        fn: "EXPLAIN ANALYZE — Reading Query Plans",
        desc: "Understand query execution plans: sequential vs index scans, join strategies, cost estimates, and identifying bottlenecks.",
        category: "Performance",
        subtitle: "EXPLAIN ANALYZE, Seq Scan, Index Scan, Hash Join, Sort, cost, rows",
        signature: "EXPLAIN ANALYZE SELECT ...  |  EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)",
        descLong: "EXPLAIN shows the query plan without executing. EXPLAIN ANALYZE executes the query and shows actual timings and row counts. Key things to look for: Seq Scan on large tables (needs index), large row estimates vs actuals (stale statistics), Sort operations (can often be replaced by index), Nested Loop on large tables (may need Hash Join). The cost numbers are arbitrary units — compare relative costs between plans, not absolute values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of EXPLAIN ANALYZE — Reading Query Plans — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Basic EXPLAIN ANALYZE ────────────────────────────\nEXPLAIN ANALYZE\nSELECT * FROM orders WHERE user_id = 42;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of EXPLAIN ANALYZE — Reading Query Plans — common patterns you'll see in production.\n-- APPROACH  - Combine EXPLAIN ANALYZE — Reading Query Plans with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Good output (uses index):\n-- Index Scan using idx_orders_user_id on orders\n--   Index Cond: (user_id = 42)\n--   Rows Removed by Filter: 0\n--   Actual time: 0.052..0.058 rows=15 loops=1\n-- Planning Time: 0.105 ms\n-- Execution Time: 0.082 ms"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of EXPLAIN ANALYZE — Reading Query Plans — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Bad output (full table scan):,-- Seq Scan on orders,--   Filter: (user_id = 42),--   Rows Removed by Filter: 999985,--   Actual time: 85.2..85.5 rows=15 loops=1,-- ← Scanned 1M rows to find 15!,\n\n-- ── EXPLAIN with BUFFERS (I/O detail) ──────────────,EXPLAIN (ANALYZE, BUFFERS),SELECT * FROM orders WHERE user_id = 42;,-- Buffers: shared hit=5      ← 5 pages from cache (fast),-- Buffers: shared read=200   ← 200 pages from disk (slow!),\n\n-- ── Common plan nodes to know ──────────────────────,-- Seq Scan         — full table scan (bad for large tables),-- Index Scan       — B-tree lookup + table fetch (good),-- Index Only Scan  — reads only from index (best),-- Bitmap Index Scan + Bitmap Heap Scan — multi-row index lookup,-- Nested Loop      — for each row in A, scan B (good for small A),-- Hash Join        — build hash table on B, probe with A (good for large),-- Merge Join       — merge two sorted inputs (good when both sorted),-- Sort             — explicit sort (check if index can avoid it),\n\n-- ── Identify slow parts ────────────────────────────,EXPLAIN ANALYZE,SELECT u.name, COUNT(o.id) AS order_count,FROM users u,JOIN orders o ON o.user_id = u.id,WHERE u.created_at > '2024-01-01',GROUP BY u.name,ORDER BY order_count DESC,LIMIT 10;,-- Look for:,-- 1. Nodes where \"actual time\" is high,-- 2. \"Rows Removed by Filter\" >> returned rows,-- 3. \"Actual rows\" >> \"Plan rows\" (bad statistics),-- 4. Sort nodes (can often be eliminated with index),\n\n-- ── Fix stale statistics ────────────────────────────,ANALYZE orders;  -- update stats for one table,ANALYZE;         -- update stats for entire database,\n\n-- ── Compare two approaches ──────────────────────────,-- Approach 1: subquery,EXPLAIN ANALYZE,SELECT * FROM orders WHERE user_id IN (,    SELECT id FROM users WHERE tier = 'premium',);,\n\n-- Approach 2: join,EXPLAIN ANALYZE,SELECT o.* FROM orders o,JOIN users u ON u.id = o.user_id,WHERE u.tier = 'premium';,-- Compare execution times to pick the faster approach"
                  }
        ],
        tips: [
                  "Always use EXPLAIN ANALYZE (not just EXPLAIN) — EXPLAIN shows estimates, ANALYZE shows actual timings and row counts.",
                  "\"Rows Removed by Filter\" being 100x the returned rows means the query scans too much data — needs a better index.",
                  "Run ANALYZE after loading data or major changes — stale statistics cause the planner to choose bad plans.",
                  "BUFFERS shows I/O: shared hit = cached (fast), shared read = disk (slow). High reads = data not in cache."
        ],
        mistake: "Optimizing queries without running EXPLAIN ANALYZE first — you are guessing. The database may be using a completely different plan than you expect. Always check the actual plan.",
        shorthand: {
          verbose: "EXPLAIN SELECT * FROM orders WHERE user_id = 42;\n-- Seq Scan on orders  ← Full table scan, slow!\n-- Filter: (user_id = 42) ← Should have index",
          concise: "EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;\n-- Index Scan using idx_orders_user_id ← Good, uses index\n-- Actual time: 0.052 ms ← Fast",
        },
      },
      {
        id: "optimization-patterns",
        fn: "Common Query Optimization Patterns",
        desc: "Practical optimization patterns: avoid N+1, use EXISTS over IN, batch operations, and pagination strategies.",
        category: "Performance",
        subtitle: "EXISTS vs IN, batch INSERT, keyset pagination, materialized views",
        signature: "EXISTS (SELECT 1 ...)  |  INSERT INTO ... VALUES (...), (...)  |  WHERE id > :last_id",
        descLong: "Common optimization patterns that apply across all SQL databases. EXISTS is often faster than IN for correlated subqueries. Batch INSERTs are 10-100x faster than individual ones. Keyset pagination (WHERE id > last_id) scales infinitely vs OFFSET which scans skipped rows. Materialized views pre-compute expensive aggregations. Proper JOIN order, avoiding SELECT *, and pushing filters down all contribute to fast queries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Common Query Optimization Patterns — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── EXISTS vs IN ─────────────────────────────────────\n-- Slow: IN with large subquery\nSELECT * FROM orders\nWHERE user_id IN (SELECT id FROM users WHERE tier = 'premium');\n-- Builds entire list of premium user IDs, then checks each order"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Common Query Optimization Patterns — common patterns you'll see in production.\n-- APPROACH  - Combine Common Query Optimization Patterns with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Fast: EXISTS (stops at first match)\nSELECT * FROM orders o\nWHERE EXISTS (\n    SELECT 1 FROM users u\n    WHERE u.id = o.user_id AND u.tier = 'premium'\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Common Query Optimization Patterns — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Avoid SELECT * ──────────────────────────────────,-- Slow: fetches all columns, can't use covering index,SELECT * FROM orders WHERE user_id = 42;,\n\n-- Fast: fetch only needed columns, can use index-only scan,SELECT order_id, amount, status,FROM orders WHERE user_id = 42;,\n\n-- ── Keyset pagination (vs OFFSET) ───────────────────,-- Slow: OFFSET scans and discards rows,SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 10000;,-- ← Must scan 10,020 rows to return 20!,\n\n-- Fast: keyset pagination — start after last seen ID,SELECT * FROM products,WHERE id > :last_seen_id  -- e.g., 10000,ORDER BY id,LIMIT 20;,-- ← Index seek directly to row 10001, read 20,\n\n-- For multi-column sort:,SELECT * FROM products,WHERE (created_at, id) > (:last_date, :last_id),ORDER BY created_at, id,LIMIT 20;,\n\n-- ── Batch INSERT ────────────────────────────────────,-- Slow: 1000 individual inserts,-- INSERT INTO logs (msg) VALUES ('a');,-- INSERT INTO logs (msg) VALUES ('b');,-- ... (1000 round trips),\n\n-- Fast: single multi-row insert,INSERT INTO logs (msg) VALUES,    ('a'), ('b'), ('c'), ('d'), ('e');,-- (1 round trip for all rows),\n\n-- ── Materialized view for expensive aggregations ────,CREATE MATERIALIZED VIEW monthly_stats AS,SELECT,    DATE_TRUNC('month', order_date) AS month,,    COUNT(*) AS orders,,    SUM(amount) AS revenue,,    AVG(amount) AS avg_order,,    COUNT(DISTINCT user_id) AS unique_customers,FROM orders,GROUP BY DATE_TRUNC('month', order_date);,\n\n-- Read from materialized view (instant),SELECT * FROM monthly_stats WHERE month >= '2024-01-01';,\n\n-- Refresh when underlying data changes,REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_stats;,\n\n-- ── Push filters into JOINs ────────────────────────,-- Slow: filter after join (joins all rows first),SELECT o.*, u.name,FROM orders o JOIN users u ON u.id = o.user_id,WHERE o.created_at > '2024-01-01' AND u.tier = 'premium';,\n\n-- Fast: filter before join with CTEs or subqueries,WITH recent_orders AS (,    SELECT * FROM orders WHERE created_at > '2024-01-01',),,premium_users AS (,    SELECT id, name FROM users WHERE tier = 'premium',),SELECT o.*, u.name,FROM recent_orders o,JOIN premium_users u ON u.id = o.user_id;,\n\n-- ── Use UNION ALL instead of UNION ──────────────────,-- UNION: sorts + deduplicates (expensive),-- UNION ALL: just concatenates (fast),SELECT name FROM customers,UNION ALL  -- use this unless you actually need dedup,SELECT name FROM prospects;"
                  }
        ],
        tips: [
                  "Keyset pagination is O(1) vs OFFSET which is O(n) — for paginating millions of rows, keyset is the only viable approach.",
                  "Materialized views pre-compute expensive aggregations — refresh them on a schedule or after ETL jobs.",
                  "EXISTS stops at the first match; IN evaluates the entire subquery — EXISTS is faster for large correlated checks.",
                  "UNION ALL is almost always what you want — UNION silently deduplicates which is expensive and usually unnecessary."
        ],
        mistake: "Using OFFSET for deep pagination (page 500 of results) — OFFSET 10000 LIMIT 20 must scan and discard 10,000 rows. Use keyset pagination (WHERE id > last_id) which seeks directly to the right position.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE tier = 'premium');\nINSERT INTO logs (msg) VALUES ('a'); INSERT INTO logs (msg) VALUES ('b'); -- 1000 individual queries\n// More explicit but longer",
          concise: "SELECT * FROM orders o WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.tier = 'premium');\nINSERT INTO logs (msg) VALUES ('a'), ('b'), ('c'), ('d'); -- Batch insert",
        },
      },
      {
        id: "index-types-advanced",
        fn: "Index Types — B-tree, Hash, GIN, GiST, BRIN",
        desc: "Comparison of index types: B-tree (default), Hash (equality), GIN (composite), GiST (geometry), BRIN (very large).",
        category: "Indexing",
        subtitle: "Index comparison, when to use each type, trade-offs, disk space, query speed",
        signature: "CREATE INDEX ... USING btree|hash|gin|gist|brin;",
        descLong: "Different index types optimize different access patterns. B-tree (default) handles equality, range, sorting. Hash is fastest for exact match but no range support. GIN (Generalized Inverted Index) is best for composite values: arrays, JSONB, full-text vectors. GiST (Generalized Search Tree) handles geometric data, ranges, nearest-neighbor. BRIN (Block Range Index) is tiny and very fast on sorted data. Choice depends on data type and query patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Index Types — B-tree, Hash, GIN, GiST, BRIN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── B-tree: default, most versatile ───────────────\nCREATE INDEX idx_users_email ON users(email);\n-- Supports: =, <>, <, >, <=, >=, BETWEEN, LIKE 'prefix%', ORDER BY, GROUP BY"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Index Types — B-tree, Hash, GIN, GiST, BRIN — common patterns you'll see in production.\n-- APPROACH  - Combine Index Types — B-tree, Hash, GIN, GiST, BRIN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Hash: exact match only, very fast ──────────────\nCREATE INDEX idx_sessions_token ON sessions USING hash(token);\n-- Only supports: = (WHERE token = '...')\n-- Faster than B-tree for simple equality, but no range support"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Index Types — B-tree, Hash, GIN, GiST, BRIN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── GIN: composite values (arrays, JSONB, FTS) ────,CREATE INDEX idx_products_tags ON products USING gin(tags);,-- tags is an array — speeds up: WHERE tags @> ARRAY['sql'],,CREATE INDEX idx_metadata ON products USING gin(metadata);,-- metadata is JSONB — speeds up: WHERE metadata @> '{\"color\": \"red\"}',,CREATE INDEX idx_articles_fts ON articles USING gin(search_vector);,-- search_vector is tsvector — speeds up full-text search,\n\n-- ── GiST: geometry, ranges, nearest-neighbor ──────,CREATE INDEX idx_locations ON addresses USING gist(coordinates);,-- coordinates is POINT — speeds up: ORDER BY coordinates <-> point(x,y) LIMIT 10,,CREATE INDEX idx_events ON events USING gist(date_range);,-- date_range is DATERANGE — speeds up: WHERE date_range @> '2024-03-15',\n\n-- ── BRIN: very large sorted tables ─────────────────,CREATE INDEX idx_logs_timestamp ON logs USING brin(created_at);,-- created_at is monotonically increasing — BRIN is 100x smaller than B-tree,-- Good for time-series or append-only tables with millions of rows,\n\n-- ── Clustered vs non-clustered (SQL Server) ────────,CREATE CLUSTERED INDEX idx_orders_primary ON orders(order_id);,-- Table is physically sorted by clustered index — only one per table,-- Fast range scans,,CREATE NONCLUSTERED INDEX idx_orders_customer ON orders(customer_id);,-- Index separate from table data — can have many per table"
                  }
        ],
        tips: [
                  "B-tree is the default and best for most cases — use for general indexing.",
                  "Hash index is the fastest for exact match (=) but offers nothing else — rarely used.",
                  "GIN is best for arrays/JSONB/full-text — not just slower than B-tree, it's a completely different structure.",
                  "BRIN is magical for large sorted tables — a 100GB time-series table indexed with 1MB BRIN vs 10GB B-tree.",
                  "SQL Server clustered indexes determine physical sort — choose carefully, typically on primary key."
        ],
        mistake: "Using B-tree indexes for JSONB queries (metadata @> ...) — wrong index type. Use GIN for composite values.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── B-tree: default, most versatile ───────────────\nCREATE INDEX idx_users_email ON users(email);\n-- Supports: =, <>, <, >, <=, >=, BETWEEN, LIKE 'prefix%', ORDER BY, GROUP BY\n-- ── Hash: exact match only, very fast ──────────────\nCREATE INDEX idx_sessions_token ON sessions USING hash(token);\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n-- Index separate from table data — can have many per table",
        },
      },
      {
        id: "covering-index",
        fn: "Covering Indexes — Index-Only Scans",
        desc: "Include non-search columns in indexes to enable index-only scans without table lookups.",
        category: "Indexing",
        subtitle: "INCLUDE columns, covering index, index-only scan, avoid heap fetch, total selectivity",
        signature: "CREATE INDEX idx ON table(search_cols) INCLUDE (display_cols);",
        descLong: "Indexes normally return row pointers; query must fetch the table for other columns. Covering indexes include columns not searched but needed by the query. The query reads entirely from the index (index-only scan) without touching the table. INCLUDE in PostgreSQL/SQL Server separates search columns (used for filtering/sorting) from included columns (just stored in index). Covering indexes are wider but faster for specific queries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Covering Indexes — Index-Only Scans — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Covering index with INCLUDE ───────────────────\nCREATE INDEX idx_orders_covering\n    ON orders(user_id, order_date)\n    INCLUDE (amount, status);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Covering Indexes — Index-Only Scans — common patterns you'll see in production.\n-- APPROACH  - Combine Covering Indexes — Index-Only Scans with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Query using all four columns, entirely from index (no table lookup):\nSELECT user_id, order_date, amount, status\nFROM orders\nWHERE user_id = 5 AND order_date > '2024-01-01';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Covering Indexes — Index-Only Scans — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Without INCLUDE (requires table fetch) ───────,CREATE INDEX idx_orders_simple ON orders(user_id, order_date);,,SELECT amount, status FROM orders  -- amount and status not in index,WHERE user_id = 5;,-- ← Must fetch table for amount/status (slower),\n\n-- ── Large covering index for report queries ──────,CREATE INDEX idx_sales_report,    ON orders(customer_id, DATE(order_date)),    INCLUDE (amount, product_count, status, region);,,SELECT customer_id, DATE(order_date), amount, product_count, status,FROM orders,WHERE customer_id IN (SELECT id FROM premium_customers),  AND DATE(order_date) >= '2024-01-01';,-- ← Entirely from index,\n\n-- ── Check if index is being used as covering ──────,EXPLAIN ANALYZE,SELECT user_id, order_date, amount, status,FROM orders,WHERE user_id = 5;,-- ← Look for \"Index Only Scan\" in plan, not \"Index Scan\""
                  }
        ],
        tips: [
                  "Put filter columns in the index (before INCLUDE), non-filter columns in INCLUDE.",
                  "Index-only scans avoid expensive table lookups — critical for high-frequency queries.",
                  "Covering indexes are wider and slower to update — only use for queries that genuinely need all columns.",
                  "EXPLAIN ANALYZE shows whether an index-only scan is used — look for \"Index Only Scan using idx_name\" vs \"Index Scan\"."
        ],
        mistake: "Including too many columns in INCLUDE — makes the index much larger and slower to maintain. Only include columns that queries actually need.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Covering index with INCLUDE ───────────────────\nCREATE INDEX idx_orders_covering\n    ON orders(user_id, order_date)\n    INCLUDE (amount, status);\n-- Query using all four columns, entirely from index (no table lookup):\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n-- ← Look for \"Index Only Scan\" in plan, not \"Index Scan\"",
        },
      },
      {
        id: "partial-index",
        fn: "Partial Indexes — Index a Subset",
        desc: "Index only rows matching a WHERE condition: active=true, status='pending'. Much smaller and faster.",
        category: "Indexing",
        subtitle: "WHERE condition in index, selective indexing, hot path optimization, reduce bloat",
        signature: "CREATE INDEX idx ON table(col) WHERE condition;",
        descLong: "Partial indexes index only rows where a WHERE condition is true. If 99% of queries filter on status='active' and 90% of rows are active, a partial index on (col) WHERE status='active' is smaller and faster. Rows not matching the condition are not indexed. Useful for \"soft delete\" (is_deleted=false), status filtering, and any column with skewed distribution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Partial Indexes — Index a Subset — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Partial index for active records only ─────────\nCREATE INDEX idx_users_active_email\n    ON users(email)\n    WHERE status = 'active';"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Partial Indexes — Index a Subset — common patterns you'll see in production.\n-- APPROACH  - Combine Partial Indexes — Index a Subset with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- This query uses the index (matches WHERE condition):\nSELECT * FROM users WHERE status = 'active' AND email = 'alice@example.com';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Partial Indexes — Index a Subset — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- This query cannot use the index (status != 'active'):,SELECT * FROM users WHERE status = 'inactive' AND email = 'bob@example.com';,\n\n-- ── Partial index for soft deletes ──────────────────,CREATE INDEX idx_orders_not_deleted,    ON orders(order_date, customer_id),    WHERE is_deleted = false;,,SELECT * FROM orders,WHERE is_deleted = false AND customer_id = 5,ORDER BY order_date DESC;,-- ← Uses the partial index (smaller, faster),\n\n-- ── Partial index for time-based filtering ────────,CREATE INDEX idx_sessions_active,    ON sessions(user_id),    WHERE expires_at > NOW();,\n\n-- Only index non-expired sessions,-- Automatically \"shrinks\" as sessions expire,\n\n-- ── Partial index for status-based routing ───────,CREATE INDEX idx_orders_pending_processing,    ON orders(order_date),    WHERE status IN ('pending', 'processing');,\n\n-- Index only orders that are being actively processed,-- Ignore completed/failed orders (don't fit hot path)"
                  }
        ],
        tips: [
                  "Partial indexes shine when a WHERE condition filters out 50%+ of rows.",
                  "For status columns with few distinct values, create partial indexes for the \"hot\" statuses.",
                  "Soft-delete pattern (is_deleted=false) is a perfect use case — index only live records.",
                  "EXPLAIN ANALYZE shows whether a partial index is considered — make sure query matches the WHERE condition."
        ],
        mistake: "Creating a partial index when most queries don't filter on the condition — the index won't be used. Verify query patterns first.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Partial index for active records only ─────────\nCREATE INDEX idx_users_active_email\n    ON users(email)\n    WHERE status = 'active';\n-- This query uses the index (matches WHERE condition):\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n-- Ignore completed/failed orders (don't fit hot path)",
        },
      },
      {
        id: "expression-index",
        fn: "Expression & Functional Indexes",
        desc: "Index on computed expressions: LOWER(email), DATE(timestamp), (data->'key').",
        category: "Indexing",
        subtitle: "Function-based indexes, computed columns, case-insensitive search, JSON extraction",
        signature: "CREATE INDEX idx ON table(LOWER(col))  |  CREATE INDEX idx ON table((data->>'key'));",
        descLong: "Expression indexes store the result of a function or expression. Create an index on LOWER(email) to speed up case-insensitive searches. Index JSON extraction (data->'key') to speed up nested lookups. Any deterministic expression can be indexed. The query must use the exact same expression to use the index.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Expression & Functional Indexes — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Case-insensitive email lookup ────────────────\nCREATE INDEX idx_users_email_lower ON users(LOWER(email));"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Expression & Functional Indexes — common patterns you'll see in production.\n-- APPROACH  - Combine Expression & Functional Indexes with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- This query uses the index:\nSELECT * FROM users WHERE LOWER(email) = 'alice@example.com';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Expression & Functional Indexes — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- This query does NOT use the index (no LOWER):,SELECT * FROM users WHERE email = 'ALICE@EXAMPLE.COM';,\n\n-- ── Date truncation index ─────────────────────────,CREATE INDEX idx_orders_month ON orders(DATE_TRUNC('month', order_date));,\n\n-- Query that uses the index:,SELECT * FROM orders,WHERE DATE_TRUNC('month', order_date) = '2024-03-01'::DATE;,\n\n-- ── JSON extraction index (PostgreSQL) ──────────────,CREATE INDEX idx_products_color,    ON products((metadata->>'color'));,,SELECT * FROM products,WHERE metadata->>'color' = 'red';,\n\n-- ── Expression with arithmetic ───────────────────,CREATE INDEX idx_orders_total_per_item,    ON orders((amount / NULLIF(quantity, 0)));,,SELECT * FROM orders,WHERE amount / NULLIF(quantity, 0) > 100;,\n\n-- ── Partial + expression (combined) ──────────────,CREATE INDEX idx_users_active_lower_email,    ON users(LOWER(email)),    WHERE status = 'active';"
                  }
        ],
        tips: [
                  "The query must use the exact same expression to use the index — LOWER(email) index only helps WHERE LOWER(email) = ..., not WHERE email LIKE ...",
                  "Expression indexes must be deterministic (same input = same output) — functions like NOW(), RANDOM() cannot be indexed.",
                  "Consider computed columns (SQL Server, PostgreSQL 12+) as an alternative — persisted, can be indexed normally.",
                  "Test with EXPLAIN ANALYZE to confirm the index is used."
        ],
        mistake: "Creating an index on LOWER(email) then querying without LOWER — the index is invisible. Always use the same expression in the query.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Case-insensitive email lookup ────────────────\nCREATE INDEX idx_users_email_lower ON users(LOWER(email));\n-- This query uses the index:\nSELECT * FROM users WHERE LOWER(email) = 'alice@example.com';\n-- This query does NOT use the index (no LOWER):\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n    WHERE status = 'active';",
        },
      },
      {
        id: "composite-index-order",
        fn: "Composite Index Column Order",
        desc: "Order matters: equality columns first, then range columns. Leading prefix rule.",
        category: "Indexing",
        subtitle: "Leftmost prefix rule, equality vs range, selectivity ordering, multicolumn indexing",
        signature: "CREATE INDEX idx ON table(equality_cols..., range_cols...);",
        descLong: "In a composite index (col1, col2, col3), the leftmost columns must be used for the index to be used at all (leftmost prefix rule). Put equality columns first (user_id=5), then range columns (order_date>2024-01-01). High-selectivity (many distinct values) columns first within each group. An index on (user_id, order_date, status) helps (user_id, order_date) and (user_id) but not (order_date) alone or (status) alone.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Composite Index Column Order — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Composite index: equality then range ──────────\nCREATE INDEX idx_orders_user_date\n    ON orders(user_id, order_date DESC);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Composite Index Column Order — common patterns you'll see in production.\n-- APPROACH  - Combine Composite Index Column Order with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Speeds up:\nSELECT * FROM orders WHERE user_id = 5;\nSELECT * FROM orders WHERE user_id = 5 AND order_date > '2024-01-01';\nSELECT * FROM orders WHERE user_id = 5 ORDER BY order_date DESC;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Composite Index Column Order — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Does NOT help (order_date first):,SELECT * FROM orders WHERE order_date > '2024-01-01';  -- can't use index,\n\n-- ── Wrong order: range then equality ───────────────,CREATE INDEX bad_idx ON orders(order_date, user_id);,\n\n-- Weak: must scan all order_date ranges,SELECT * FROM orders WHERE user_id = 5;,\n\n-- Better: equality first (previous index),SELECT * FROM orders WHERE user_id = 5 AND order_date > '2024-01-01';,\n\n-- ── Three-column index: priority order ──────────────,CREATE INDEX idx_orders_user_status_date,    ON orders(user_id, status, order_date DESC);,\n\n-- All of these use the index efficiently:,SELECT * FROM orders WHERE user_id = 5;,SELECT * FROM orders WHERE user_id = 5 AND status = 'pending';,SELECT * FROM orders WHERE user_id = 5 AND status = 'pending' AND order_date > '2024-01-01';,\n\n-- These do NOT use the full index:,SELECT * FROM orders WHERE status = 'pending';  -- skips user_id,SELECT * FROM orders WHERE order_date > '2024-01-01';  -- skips user_id and status,\n\n-- ── Selectivity matters within each group ──────────,CREATE INDEX idx_orders_selective,    ON orders(user_id, region, order_date);,\n\n-- user_id (1M values), region (5 values), order_date (10k dates),-- Better: put high-selectivity first: user_id, order_date, region,CREATE INDEX idx_orders_better,    ON orders(user_id, order_date, region);"
                  }
        ],
        tips: [
                  "Leftmost prefix rule: (user_id, order_date) index helps WHERE user_id=X but not WHERE order_date=Y.",
                  "Equality columns (=) before range columns (>, <, BETWEEN) — index scans efficiency improves dramatically.",
                  "High-selectivity columns (many distinct values) first within each category.",
                  "EXPLAIN ANALYZE shows which index parts are used as Index Cond vs Filter — Index Cond is efficient."
        ],
        mistake: "Creating (order_date, user_id) then querying WHERE user_id=5 — index is unusable. Column order must match query patterns.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Composite index: equality then range ──────────\nCREATE INDEX idx_orders_user_date\n    ON orders(user_id, order_date DESC);\n-- Speeds up:\nSELECT * FROM orders WHERE user_id = 5;\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n    ON orders(user_id, order_date, region);",
        },
      },
      {
        id: "index-bloat",
        fn: "Index Bloat — REINDEX, VACUUM, Monitoring",
        desc: "Identify and clean index bloat: VACUUM, REINDEX, pg_stat_user_indexes monitoring.",
        category: "Performance",
        subtitle: "Index bloat, dead tuples, VACUUM FULL, REINDEX, bloat percentage, size monitoring",
        signature: "VACUUM indexes;  REINDEX INDEX idx_name;  SELECT * FROM pg_stat_user_indexes;",
        descLong: "Index bloat happens when deleted rows leave gaps. PostgreSQL VACUUM marks pages as reusable but doesn't reclaim space. VACUUM FULL or REINDEX reclaims space. Monitor bloat with pg_stat_user_indexes: idx_blks_read, idx_blks_hit show cache efficiency. High blks_read relative to hits indicates bloat or small cache.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Index Bloat — REINDEX, VACUUM, Monitoring — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Monitor index bloat ────────────────────────────\nSELECT\n    schemaname,\n    tablename,\n    indexname,\n    idx_scan AS scans,\n    idx_tup_read AS tuples_read,\n    idx_tup_fetch AS tuples_fetched,\n    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size\nFROM pg_stat_user_indexes\nORDER BY idx_scan DESC;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Index Bloat — REINDEX, VACUUM, Monitoring — common patterns you'll see in production.\n-- APPROACH  - Combine Index Bloat — REINDEX, VACUUM, Monitoring with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Monitor index I/O (cache efficiency) ──────────\nSELECT\n    schemaname,\n    indexname,\n    idx_blks_read,  -- blocks read from disk\n    idx_blks_hit,   -- blocks from cache\n    ROUND(100.0 * idx_blks_hit / (idx_blks_hit + idx_blks_read), 2) AS cache_hit_ratio\nFROM pg_stat_user_indexes\nWHERE idx_blks_hit + idx_blks_read > 0\nORDER BY cache_hit_ratio;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Index Bloat — REINDEX, VACUUM, Monitoring — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Rebuild index (reclaim space) ───────────────────,REINDEX INDEX CONCURRENTLY idx_orders_user_id;,-- CONCURRENTLY doesn't lock table (slower but non-blocking),\n\n-- ── Rebuild all indexes on a table ────────────────,REINDEX TABLE CONCURRENTLY orders;,\n\n-- ── Vacuum to mark dead tuples reusable ──────────,VACUUM ANALYZE orders;  -- Also updates statistics,\n\n-- ── Check index size ─────────────────────────────,SELECT,    indexrelname,,    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,FROM pg_stat_user_indexes,WHERE schemaname = 'public',ORDER BY pg_relation_size(indexrelid) DESC;"
                  }
        ],
        tips: [
                  "VACUUM marks dead tuples as reusable but doesn't shrink index — VACUUM FULL or REINDEX reclaims space.",
                  "REINDEX CONCURRENTLY is safe for production — requires 2x temp disk space but doesn't lock the table.",
                  "Check idx_blks_read vs idx_blks_hit — high reads indicate bloat or insufficient cache.",
                  "Monitor with pg_stat_user_indexes regularly — bloat grows over time as deletes and updates accumulate."
        ],
        mistake: "Ignoring index bloat on high-churn tables — months of deletes/updates cause 2-3x size bloat. Set up REINDEX schedules.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Monitor index bloat ────────────────────────────\nSELECT\n    schemaname,\n    tablename,\n    indexname,\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nORDER BY pg_relation_size(indexrelid) DESC;",
        },
      },
      {
        id: "explain-analyze-advanced",
        fn: "EXPLAIN ANALYZE Deep Dive",
        desc: "Read EXPLAIN output deeply: Seq Scan vs Index, cost estimates, actual timings, buffer usage.",
        category: "Performance",
        subtitle: "EXPLAIN output reading, cost interpretation, seq scan detection, statistics freshness, plan nodes",
        signature: "EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON) SELECT ...;",
        descLong: "EXPLAIN ANALYZE executes the query and shows actual timings vs estimates. Seq Scan on large tables is red flag (missing index). Large \"Rows Removed by Filter\" suggests poor index selectivity. \"Actual rows\" >> \"Plan rows\" indicates stale statistics. FORMAT JSON gives machine-readable output. BUFFERS shows cache vs disk I/O.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of EXPLAIN ANALYZE Deep Dive — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Basic EXPLAIN ANALYZE ────────────────────────\nEXPLAIN ANALYZE\nSELECT * FROM orders WHERE user_id = 42 AND status = 'pending';"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of EXPLAIN ANALYZE Deep Dive — common patterns you'll see in production.\n-- APPROACH  - Combine EXPLAIN ANALYZE Deep Dive with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Output analysis:\n-- Seq Scan on orders           ← BAD: full table scan\n--   Filter: (user_id = 42)\n--   Rows Removed by Filter: 999985  ← Only 15 matched of 1M rows!\n--   Actual time: 450.2..450.5 rows=15\n-- Planning Time: 0.105 ms\n-- Execution Time: 450.250 ms       ← Very slow!"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of EXPLAIN ANALYZE Deep Dive — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── With BUFFERS: I/O analysis ────────────────────,EXPLAIN (ANALYZE, BUFFERS),SELECT * FROM orders WHERE user_id = 42;,\n\n-- Buffers: shared hit=15       ← All from cache (fast),-- Buffers: shared read=450     ← From disk (slow!),-- Buffers: shared written=200  ← Wrote pages back,\n\n-- ── Stale statistics: Plan rows >> Actual rows ──────,EXPLAIN ANALYZE,SELECT * FROM users WHERE status = 'inactive';,\n\n-- Plan rows=50000  (planner thinks 50k rows),-- Actual time=0.5 rows=5  (actually only 5 rows!),-- ← Statistics are STALE. Run ANALYZE.,\n\n-- ── With JSON output (machine-readable) ───────────,EXPLAIN (ANALYZE, FORMAT JSON),SELECT * FROM orders,WHERE user_id = 42 AND order_date > '2024-01-01';,\n\n-- ── Compare two approaches ────────────────────────,EXPLAIN ANALYZE,SELECT * FROM orders,WHERE user_id IN (SELECT id FROM users WHERE tier = 'premium');,\n\n-- vs.,,EXPLAIN ANALYZE,SELECT o.* FROM orders o,JOIN users u ON u.id = o.user_id,WHERE u.tier = 'premium';"
                  }
        ],
        tips: [
                  "Seq Scan on large tables (>1MB) is almost always a sign of missing or unused index.",
                  "\"Rows Removed by Filter\" >> returned rows means query scans way too much data — needs better index.",
                  "Stale statistics cause bad plans — run ANALYZE after major data changes.",
                  "BUFFERS: shared hit >> shared read indicates good cache utilization; all reads indicate slow query.",
                  "Use FORMAT JSON for programmatic analysis — easier to parse and compare."
        ],
        mistake: "Ignoring \"Rows Removed by Filter\" — if you're filtering out 999,985 of 1M rows, you need a better index.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Basic EXPLAIN ANALYZE ────────────────────────\nEXPLAIN ANALYZE\nSELECT * FROM orders WHERE user_id = 42 AND status = 'pending';\n-- Output analysis:\n-- Seq Scan on orders           ← BAD: full table scan\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nWHERE u.tier = 'premium';",
        },
      },
      {
        id: "query-hints",
        fn: "Query Hints & Optimizer Control",
        desc: "Override optimizer: PostgreSQL settings, SQL Server hints, NOLOCK, FORCESEEK.",
        category: "Performance",
        subtitle: "enable_seqscan, NOLOCK, FORCESEEK, query hints, optimizer directives, plan forcing",
        signature: "SET enable_seqscan = off;  SELECT ... (NOLOCK, FORCESEEK);  OPTION (RECOMPILE)",
        descLong: "When the optimizer makes poor decisions, use hints to override. PostgreSQL: SET enable_seqscan = off to force index use. SQL Server: (NOLOCK) for dirty reads, (FORCESEEK) to force index seek. Use hints sparingly — they make queries fragile. Better to fix statistics (ANALYZE) or indexes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Query Hints & Optimizer Control — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── PostgreSQL: disable sequential scans ──────────\nSET enable_seqscan = off;\nSELECT * FROM large_table WHERE col = value;\nSET enable_seqscan = on;  -- Re-enable"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Query Hints & Optimizer Control — common patterns you'll see in production.\n-- APPROACH  - Combine Query Hints & Optimizer Control with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── PostgreSQL: force join method ───────────────────\nSET enable_hashjoin = off;\nSET enable_mergejoin = off;\nSELECT o.*, u.name\nFROM orders o\nJOIN users u ON u.id = o.user_id\nWHERE o.amount > 100;\nRESET enable_hashjoin;\nRESET enable_mergejoin;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Query Hints & Optimizer Control — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── SQL Server: NOLOCK (dirty read, no locking) ────,SELECT * FROM orders (NOLOCK),WHERE user_id = 5;,-- ← Skips locks, faster but may see uncommitted data,\n\n-- ── SQL Server: FORCESEEK (force index seek) ──────,SELECT * FROM orders (FORCESEEK(idx_orders_user)),WHERE user_id = 5;,-- ← Must use specified index with seek (not scan),\n\n-- ── SQL Server: RECOMPILE (replan each time) ──────,EXEC sp_executesql,    N'SELECT * FROM orders WHERE user_id = @uid',,    N'@uid INT',,    @uid = 5,OPTION (RECOMPILE);,-- ← Good for parameter-sensitive queries,\n\n-- ── SQL Server: specific plan forcing ──────────,SELECT * FROM orders,WHERE status = 'pending',OPTION (,    FORCE ORDER,           -- force join order as written,    LOOP JOIN,             -- force nested loop join,    HASH AGGREGATE         -- force hash-based aggregation,);"
                  }
        ],
        tips: [
                  "Hints are a last resort — first fix statistics (ANALYZE), then indexes, then consider hints.",
                  "PostgreSQL hints are global session settings (enable_seqscan = off) — affect all subsequent queries.",
                  "SQL Server hints are per-query (NOLOCK, FORCESEEK) — more targeted.",
                  "NOLOCK skips locks but allows dirty reads (uncommitted data) — okay for reports, not transactional.",
                  "Hints are fragile — schema changes or data growth can make them ineffective."
        ],
        mistake: "Relying on NOLOCK for consistency — dirty reads can give inconsistent results. Use only for reports where stale data is acceptable.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── PostgreSQL: disable sequential scans ──────────\nSET enable_seqscan = off;\nSELECT * FROM large_table WHERE col = value;\nSET enable_seqscan = on;  -- Re-enable\n-- ── PostgreSQL: force join method ───────────────────\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n);",
        },
      },
      {
        id: "foreign-key-indexes",
        fn: "Foreign Key Indexes",
        desc: "Why FK columns should be indexed: JOIN performance, lock escalation prevention.",
        category: "Indexing",
        subtitle: "Foreign key index, ON DELETE CASCADE, lock escalation, reference integrity, cascade performance",
        signature: "CREATE INDEX idx ON child_table(parent_id);  -- Match FK",
        descLong: "Foreign key columns should be indexed for two reasons: (1) JOINs on the FK are faster, (2) Deletes on parent table scan parent for children (locks child table if no index). Index the FK column, not the primary key (already indexed). Makes ON DELETE CASCADE much faster.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Foreign Key Indexes — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Without FK index: parent delete locks table ────\nCREATE TABLE departments (\n    id INT PRIMARY KEY,\n    name TEXT\n);\n\nCREATE TABLE employees (\n    id INT PRIMARY KEY,\n    name TEXT,\n    dept_id INT REFERENCES departments(id) ON DELETE CASCADE\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Foreign Key Indexes — common patterns you'll see in production.\n-- APPROACH  - Combine Foreign Key Indexes with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Missing index on dept_id!\n-- DELETE FROM departments WHERE id = 5\n-- ← Scans entire employees table, locks it, cascades delete\n-- ← Other queries on employees are blocked!"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Foreign Key Indexes — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── With FK index: parent delete is fast ──────────,CREATE INDEX idx_employees_dept_id ON employees(dept_id);,\n\n-- Now DELETE is fast:,DELETE FROM departments WHERE id = 5;,-- ← Index seek to find dept_id=5 employees, delete them quickly,-- ← Lock time is minimal,\n\n-- ── Composite FK index ────────────────────────────,CREATE TABLE order_items (,    id INT PRIMARY KEY,,    order_id INT REFERENCES orders(id),,    product_id INT REFERENCES products(id),,    quantity INT,);,\n\n-- Index both FKs (or composite):,CREATE INDEX idx_order_items_order_product,    ON order_items(order_id, product_id);,\n\n-- Speeds up JOINs:,SELECT oi.*, p.name,FROM order_items oi,JOIN products p ON p.id = oi.product_id,WHERE oi.order_id = 42;"
                  }
        ],
        tips: [
                  "Always index FK columns — makes deletes fast and JOINs faster.",
                  "ON DELETE CASCADE without FK index blocks other queries during cascade delete.",
                  "FK columns are searched during parent deletes — index makes this seek, not scan.",
                  "Composite FK index (order_id, product_id) speeds up both individual and combined lookups."
        ],
        mistake: "Leaving FK columns unindexed, then wondering why DELETE on parent table hangs — locks the entire child table during cascade.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Without FK index: parent delete locks table ────\nCREATE TABLE departments (\n    id INT PRIMARY KEY,\n    name TEXT\n);\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nWHERE oi.order_id = 42;",
        },
      },
      {
        id: "full-text-index",
        fn: "Full-Text Search with tsvector & GIN",
        desc: "Index text for full-text search: tsvector, to_tsvector, tsquery, GIN index.",
        category: "Indexing",
        subtitle: "tsvector, to_tsquery, @@ operator, stemming, language config, GIN indexing",
        signature: "CREATE INDEX idx ON articles USING gin(search_vector);  WHERE search_vector @@ to_tsquery(...)",
        descLong: "PostgreSQL full-text search uses tsvector (indexed terms) and tsquery (search query). to_tsvector parses text into indexed tokens. to_tsquery builds search query (supports &, |, !, operators). @@ matches vector to query. Create a computed tsvector column, index it with GIN, and search with @@. Supports word stemming, multiple languages, phrase search.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Full-Text Search with tsvector & GIN — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Add tsvector column to articles ────────────────\nALTER TABLE articles ADD COLUMN search_vector tsvector;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Full-Text Search with tsvector & GIN — common patterns you'll see in production.\n-- APPROACH  - Combine Full-Text Search with tsvector & GIN with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Populate with English stemming\nUPDATE articles SET search_vector =\n    to_tsvector('english', title || ' ' || body);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Full-Text Search with tsvector & GIN — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Create GIN index ───────────────────────────────,CREATE INDEX idx_articles_fts ON articles USING gin(search_vector);,\n\n-- ── Simple full-text search ────────────────────────,SELECT title, ts_rank(search_vector, query) AS relevance,FROM articles,,     to_tsquery('english', 'postgresql & performance') AS query,WHERE search_vector @@ query,ORDER BY relevance DESC;,\n\n-- ── Search with OR (|) ────────────────────────────,SELECT title, ts_rank(search_vector, query) AS relevance,FROM articles,,     to_tsquery('english', 'sql | postgres | database') AS query,WHERE search_vector @@ query,ORDER BY relevance DESC;,\n\n-- ── Search with negation (!) ──────────────────────,SELECT title,FROM articles,,     to_tsquery('english', 'database & ! mongodb') AS query,WHERE search_vector @@ query;  -- database but NOT mongodb,\n\n-- ── Phrase search (adjacent words) ──────────────────,SELECT title,FROM articles,,     to_tsquery('english', ''full text' <-> 'search'') AS query,                                      -- <-> means adjacent,WHERE search_vector @@ query;,\n\n-- ── Trigger to auto-update search_vector ──────────,CREATE TRIGGER update_search_vector,BEFORE INSERT OR UPDATE ON articles,FOR EACH ROW EXECUTE FUNCTION,    (NEW.search_vector := to_tsvector('english', NEW.title || ' ' || NEW.body),,     NEW);"
                  }
        ],
        tips: [
                  "tsvector removes stop words (the, and, etc.) and stems words — \"running\", \"runs\", \"ran\" all become \"run\".",
                  "GIN indexes are best for full-text — B-tree cannot index tsvector.",
                  "ts_rank ranks results by relevance — weight titles more than body with setweight().",
                  "Multiple languages supported — specify in to_tsvector('english', text)."
        ],
        mistake: "Doing LIKE '%postgresql%' on millions of articles instead of tsvector+GIN — tsvector is 10x faster.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Add tsvector column to articles ────────────────\nALTER TABLE articles ADD COLUMN search_vector tsvector;\n-- Populate with English stemming\nUPDATE articles SET search_vector =\n    to_tsvector('english', title || ' ' || body);\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n     NEW);",
        },
      },
      {
        id: "stats-update",
        fn: "Statistics Updates — ANALYZE, pg_stats",
        desc: "Keep statistics fresh: ANALYZE, check pg_stats, auto-analyze, histogram bounds.",
        category: "Performance",
        subtitle: "ANALYZE, pg_stats, auto-analyze, histogram bounds, stale statistics detection",
        signature: "ANALYZE table_name;  SELECT * FROM pg_stats WHERE tablename = '...';",
        descLong: "PostgreSQL uses statistics (column distribution, distinctness, null count) to choose query plans. ANALYZE gathers these by sampling. Stale statistics cause bad plans. Auto-vacuum runs ANALYZE periodically. Check pg_stats for histogram bounds, null fraction, distinctness. Bad statistics cause seq scans instead of index scans.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Statistics Updates — ANALYZE, pg_stats — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Update statistics for entire database ─────────\nANALYZE;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Statistics Updates — ANALYZE, pg_stats — common patterns you'll see in production.\n-- APPROACH  - Combine Statistics Updates — ANALYZE, pg_stats with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Update for specific table ──────────────────────\nANALYZE orders;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Statistics Updates — ANALYZE, pg_stats — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Force full scan (more accurate, slower) ───────,ANALYZE orders (user_id, status);,\n\n-- ── View statistics ────────────────────────────────,SELECT,    schemaname,,    tablename,,    attname,,    null_frac,,    avg_width,,    n_distinct,,    correlation,FROM pg_stats,WHERE tablename = 'orders',ORDER BY attname;,\n\n-- ── Check histogram bounds ───────────────────────,SELECT,    attname,,    histogram_bounds,FROM pg_stats,WHERE tablename = 'orders' AND attname = 'user_id';,-- Shows the boundaries PostgreSQL uses to estimate row counts,\n\n-- ── Detect stale statistics ────────────────────────,SELECT,    schemaname,,    tablename,,    last_vacuum,,    last_autovacuum,,    last_analyze,,    last_autoanalyze,FROM pg_stat_user_tables,WHERE last_analyze < NOW() - INTERVAL '1 day',ORDER BY last_analyze;,\n\n-- ── Auto-vacuum / auto-analyze settings ────────────,SHOW autovacuum;  -- Should be on,SHOW autovacuum_analyze_scale_factor;  -- Default 0.1 (10% change),SHOW autovacuum_analyze_threshold;     -- Default 50 rows,\n\n-- ── Manually trigger auto-analyze ──────────────────,-- After major bulk insert/delete:,ANALYZE;,\n\n-- ── Check what caused planner confusion ────────────,EXPLAIN,SELECT * FROM orders WHERE status = 'inactive';,-- If plan shows Seq Scan when index exists,,-- ANALYZE and re-check."
                  }
        ],
        tips: [
                  "Run ANALYZE after bulk INSERT/DELETE/UPDATE — planner decisions depend on fresh statistics.",
                  "Auto-vacuum runs ANALYZE periodically — but may lag on high-traffic tables.",
                  "Check n_distinct (distinctness) and null_frac (NULL percentage) in pg_stats.",
                  "Large histogram_bounds gaps indicate even distribution; small gaps indicate clustering.",
                  "Stale statistics: Plan rows >> Actual rows = bad estimates. Run ANALYZE."
        ],
        mistake: "Ignoring statistics freshness on production tables — old stats cause full table scans instead of index seeks.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Update statistics for entire database ─────────\nANALYZE;\n-- ── Update for specific table ──────────────────────\nANALYZE orders;\n-- ── Force full scan (more accurate, slower) ───────\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n-- ANALYZE and re-check.",
        },
      },
    ],
  },
]

export default { meta, sections }
