export const meta = {
  "id": "postgres",
  "label": "PostgreSQL Advanced",
  "icon": "🐘",
  "description": "PostgreSQL-specific features: JSONB, transactions & isolation, EXPLAIN, partitioning, materialized views, and full-text search."
}

export const sections = [

  // ── Section 1: JSONB & Transactions ─────────────────────────────────────────
  {
    id: "jsonb-transactions",
    title: "JSONB & Transactions",
    entries: [
      {
        id: "jsonb",
        fn: "JSONB — Querying & Indexing JSON Documents",
        desc: "Store and query JSON in PostgreSQL: JSONB operators, path queries, indexing, and document-relational hybrid patterns.",
        category: "JSONB",
        subtitle: "->, ->>, @>, jsonb_path_query, GIN index, jsonb_agg, jsonb_set",
        signature: "col->>'key'  |  col @> '{\"k\":\"v\"}'  |  jsonb_path_query()  |  CREATE INDEX ... USING gin",
        descLong: "PostgreSQL JSONB stores JSON as decomposed binary — enabling indexing, containment queries, and path expressions. Use -> for JSON object access (returns JSON), ->> for text extraction. @> tests containment. GIN indexes make JSONB queries fast. jsonb_path_query uses SQL/JSON path language. JSONB bridges document and relational models: store flexible metadata alongside structured columns. Use JSONB for user preferences, API responses, audit data, and any schema that varies per row.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of JSONB — Querying & Indexing JSON Documents — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── JSONB column and basic queries ────────────────────\nCREATE TABLE products (\n    id SERIAL PRIMARY KEY,\n    name TEXT NOT NULL,\n    attrs JSONB NOT NULL DEFAULT '{}'\n);\n\nINSERT INTO products (name, attrs) VALUES\n('Laptop', '{\"brand\": \"Dell\", \"specs\": {\"ram\": 16, \"storage\": 512}, \"tags\": [\"work\", \"portable\"]}'),\n('Phone',  '{\"brand\": \"Apple\", \"specs\": {\"ram\": 8, \"storage\": 256}, \"tags\": [\"mobile\", \"5g\"]}');"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of JSONB — Querying & Indexing JSON Documents — common patterns you'll see in production.\n-- APPROACH  - Combine JSONB — Querying & Indexing JSON Documents with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Access operators\nSELECT name,\n    attrs->'brand' AS brand_json,           -- \"Dell\" (JSON)\n    attrs->>'brand' AS brand_text,          -- Dell (text)\n    attrs->'specs'->>'ram' AS ram,          -- 16 (text)\n    (attrs->'specs'->>'ram')::int AS ram_int -- 16 (integer)\nFROM products;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of JSONB — Querying & Indexing JSON Documents — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Containment (@>) — is the right side contained in the left?,SELECT * FROM products WHERE attrs @> '{\"brand\": \"Dell\"}';,SELECT * FROM products WHERE attrs->'tags' @> '\"portable\"';,\n\n-- Path queries (SQL/JSON standard),SELECT * FROM products,WHERE jsonb_path_exists(attrs, '$.specs ? (@.ram >= 16)');,\n\n-- ── JSONB modification ──────────────────────────────,-- Set a key,UPDATE products SET attrs = jsonb_set(attrs, '{specs,ram}', '32'),WHERE name = 'Laptop';,\n\n-- Add a key,UPDATE products SET attrs = attrs || '{\"color\": \"silver\"}',WHERE name = 'Laptop';,\n\n-- Remove a key,UPDATE products SET attrs = attrs - 'color';,UPDATE products SET attrs = attrs #- '{specs,storage}';,\n\n-- ── JSONB aggregation ───────────────────────────────,SELECT jsonb_agg(name) FROM products;             -- [\"Laptop\", \"Phone\"],SELECT jsonb_object_agg(name, attrs->>'brand')    -- {\"Laptop\":\"Dell\",\"Phone\":\"Apple\"},FROM products;,\n\n-- ── GIN index for fast JSONB queries ────────────────,CREATE INDEX idx_products_attrs ON products USING gin (attrs);,-- Supports: @>, ?, ?|, ?& operators,\n\n-- Index specific path (more targeted, smaller),CREATE INDEX idx_products_brand ON products USING btree ((attrs->>'brand'));"
                  }
        ],
        tips: [
                  "Use ->> (double arrow) to extract text for WHERE clauses and comparisons; -> (single arrow) returns JSON type.",
                  "GIN index on the whole JSONB column supports @> containment queries — the most common JSONB index pattern.",
                  "For frequently queried paths, add a btree index on (attrs->>'key') — faster than GIN for exact equality lookups.",
                  "JSONB stores data decomposed — it is slightly larger than JSON but supports indexing and is faster for queries."
        ],
        mistake: "Storing everything as JSONB instead of proper columns — JSONB is for flexible/variable data. Fixed fields (name, email, created_at) should be regular columns with proper types, constraints, and indexes.",
        shorthand: {
          verbose: "SELECT attrs->'brand' AS brand_json, attrs->>'brand' AS brand_text\nFROM products WHERE attrs->>'brand' = 'Dell';\n-- Slow: no index on extracted text",
          concise: "CREATE INDEX idx_products_attrs ON products USING gin(attrs);\nSELECT * FROM products WHERE attrs @> '{\"brand\": \"Dell\"}';",
        },
      },
      {
        id: "transactions-isolation",
        fn: "Transactions & Isolation Levels — ACID Guarantees",
        desc: "Manage concurrent access: isolation levels, MVCC, serializable transactions, advisory locks, and common anomalies.",
        category: "Transactions",
        subtitle: "BEGIN, COMMIT, ROLLBACK, READ COMMITTED, REPEATABLE READ, SERIALIZABLE, MVCC",
        signature: "BEGIN ISOLATION LEVEL SERIALIZABLE  |  SELECT ... FOR UPDATE  |  SAVEPOINT",
        descLong: "PostgreSQL uses MVCC (Multi-Version Concurrency Control) — readers never block writers and vice versa. Each transaction sees a snapshot of the database. Isolation levels control what anomalies are possible: READ COMMITTED (default, sees committed changes), REPEATABLE READ (snapshot isolation, no phantom reads), SERIALIZABLE (full isolation, detects all anomalies). SELECT FOR UPDATE locks rows for the transaction. Advisory locks provide application-level locking. Savepoints allow partial rollbacks within a transaction.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Transactions & Isolation Levels — ACID Guarantees — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Basic transaction ────────────────────────────────\nBEGIN;\n    UPDATE accounts SET balance = balance - 100 WHERE id = 1;\n    UPDATE accounts SET balance = balance + 100 WHERE id = 2;\n    INSERT INTO transfers (from_id, to_id, amount) VALUES (1, 2, 100);\nCOMMIT;\n-- If any statement fails, ROLLBACK undoes everything"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Transactions & Isolation Levels — ACID Guarantees — common patterns you'll see in production.\n-- APPROACH  - Combine Transactions & Isolation Levels — ACID Guarantees with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Isolation levels ────────────────────────────────\n-- READ COMMITTED (default) — each statement sees latest committed data\nBEGIN ISOLATION LEVEL READ COMMITTED;\n    SELECT balance FROM accounts WHERE id = 1;  -- sees 1000\n    -- Another tx commits: UPDATE balance = 900 WHERE id = 1\n    SELECT balance FROM accounts WHERE id = 1;  -- sees 900 (changed!)\nCOMMIT;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Transactions & Isolation Levels — ACID Guarantees — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- REPEATABLE READ — snapshot at transaction start,BEGIN ISOLATION LEVEL REPEATABLE READ;,    SELECT balance FROM accounts WHERE id = 1;  -- sees 1000,    -- Another tx commits: UPDATE balance = 900 WHERE id = 1,    SELECT balance FROM accounts WHERE id = 1;  -- still sees 1000 (snapshot!),COMMIT;,\n\n-- SERIALIZABLE — full isolation, detects all anomalies,BEGIN ISOLATION LEVEL SERIALIZABLE;,    SELECT SUM(balance) FROM accounts;,    UPDATE accounts SET balance = balance + 100 WHERE id = 1;,    -- If a concurrent serializable tx modifies accounts,,    -- one of them will get: ERROR: could not serialize access,COMMIT;,\n\n-- ── SELECT FOR UPDATE — row-level locking ───────────,BEGIN;,    -- Lock the row so no other tx can modify it,    SELECT * FROM accounts WHERE id = 1 FOR UPDATE;,    -- Now safe to read, compute, and update without races,    UPDATE accounts SET balance = balance - 100 WHERE id = 1;,COMMIT;,\n\n-- SKIP LOCKED — process queue without blocking,SELECT * FROM jobs WHERE status = 'pending',ORDER BY created_at,LIMIT 1,FOR UPDATE SKIP LOCKED;  -- skip rows locked by other workers,\n\n-- ── Savepoints — partial rollback ───────────────────,BEGIN;,    INSERT INTO orders (user_id, total) VALUES (1, 100);,    SAVEPOINT before_items;,    INSERT INTO order_items (order_id, product_id) VALUES (1, 999);,    -- Error! Product 999 doesn't exist,    ROLLBACK TO before_items;  -- undo only the item insert,    -- Order insert is still intact,    INSERT INTO order_items (order_id, product_id) VALUES (1, 1);,COMMIT;,\n\n-- ── Advisory locks (application-level) ──────────────,-- Prevent duplicate cron job execution,SELECT pg_try_advisory_lock(12345);  -- returns true if acquired,-- ... do exclusive work ...,SELECT pg_advisory_unlock(12345);"
                  }
        ],
        tips: [
                  "READ COMMITTED is the right default for most apps — SERIALIZABLE adds overhead and retry logic for rare anomalies.",
                  "SELECT FOR UPDATE SKIP LOCKED is the pattern for job queues — workers grab unlocked rows without blocking each other.",
                  "Serializable transactions may fail with serialization errors — your app must catch and retry these automatically.",
                  "Advisory locks (pg_try_advisory_lock) are perfect for preventing duplicate cron jobs or ensuring single-writer access."
        ],
        mistake: "Using SERIALIZABLE everywhere \"to be safe\" — it causes transactions to abort and retry when conflicts occur, adding complexity and latency. Use READ COMMITTED + SELECT FOR UPDATE for targeted row locking instead.",
        shorthand: {
          verbose: "BEGIN;\n  INSERT INTO orders (user_id, total) VALUES (1, 100);\n  INSERT INTO order_items (order_id, product_id) VALUES (1, 999);\nROLLBACK; -- All changes undone",
          concise: "SELECT * FROM jobs WHERE status = 'pending' LIMIT 1 FOR UPDATE SKIP LOCKED;\n-- Grab unlocked row for processing (job queue pattern)",
        },
      },
    ],
  },

  // ── Section 2: Advanced Features ─────────────────────────────────────────
  {
    id: "advanced-features",
    title: "Advanced Features",
    entries: [
      {
        id: "pg-jsonb",
        fn: "JSONB Advanced — Operators, Functions & Indexing",
        desc: "Master JSONB operators: ->, ->>, @>, ?, jsonb_build_object, and GIN indexes for fast queries.",
        category: "JSONB",
        subtitle: "->, ->>, @>, ?, ?|, ?&, jsonb_build_object, GIN index",
        signature: "col->'key' | col->>'key' | col @> '{...}' | CREATE INDEX USING gin",
        descLong: "JSONB supports rich querying: -> returns JSON type, ->> extracts text, @> tests containment, ? tests key existence, ?| tests any key in list, ?& tests all keys. jsonb_build_object() constructs JSONB from pairs. GIN indexes support @>, ?, ?|, ?& for fast lookups. Use ->> in indexes for BTtree exact matches. JSONB is PostgreSQL's best-in-class JSON support.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of JSONB Advanced — Operators, Functions & Indexing — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── JSONB operators ───────────────────────────────\nSELECT\n    col->'brand' AS brand_obj,           -- Returns JSON: \"Dell\"\n    col->>'brand' AS brand_text,          -- Returns TEXT: Dell\n    col->'specs'->>'ram' AS ram_text,   -- Chaining: 16\n    col ? 'color' AS has_color,           -- Does key exist?\n    col ?| array['color', 'size'] AS has_either,\n    col ?& array['color', 'size'] AS has_both\nFROM products;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of JSONB Advanced — Operators, Functions & Indexing — common patterns you'll see in production.\n-- APPROACH  - Combine JSONB Advanced — Operators, Functions & Indexing with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Containment queries (@>) ──────────────────────\nSELECT * FROM products WHERE attrs @> '{\"brand\": \"Dell\"}';\nSELECT * FROM products WHERE attrs @> '{\"specs\": {\"ram\": 16}}';"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of JSONB Advanced — Operators, Functions & Indexing — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Build JSONB from values ───────────────────────,INSERT INTO products (name, attrs) VALUES,('Laptop', jsonb_build_object(,    'brand', 'Dell',,    'specs', jsonb_build_object('ram', 16, 'storage', 512),,    'tags', jsonb_build_array('work', 'portable'),));,\n\n-- ── GIN index for @> operator ─────────────────────,CREATE INDEX idx_attrs_gin ON products USING gin(attrs);,\n\n-- ── BTtree index for exact match on extracted value ─,CREATE INDEX idx_brand_exact ON products USING btree((attrs->>'brand'));"
                  }
        ],
        tips: [
                  "GIN index on whole JSONB supports @>, ?, ?|, ?& — best for flexible queries.",
                  "BTtree index on extracted text (attrs->>'key') is faster for exact equality: WHERE attrs->>'brand' = 'Dell'.",
                  "@> is the most common JSONB operator — containment checks for flexible document matching.",
                  "jsonb_build_object() and jsonb_build_array() let you construct JSONB without string escaping."
        ],
        mistake: "Creating GIN indexes on extracted text when you need BTtree — use different index types for different query patterns.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSELECT col->>'key' FROM table WHERE col @> '{\"key\": \"value\"}';\nCREATE INDEX ON table USING gin(col);\n// More explicit but longer",
          concise: "col->'key', col->>'key', col @>, col ? 'key', ?|, ?&; GIN index for @>; BTtree for ->> exact",
        },
      },
      {
        id: "pg-arrays",
        fn: "PostgreSQL Arrays — ARRAY, ANY, ALL & Operators",
        desc: "Work with PostgreSQL arrays: construction, containment, aggregation, and array operators.",
        category: "Arrays",
        subtitle: "ARRAY[...], ANY(), ALL(), unnest(), @>, <@, &&",
        signature: "ARRAY[1,2,3] | col && ARRAY[...] | ANY(array) | unnest(array)",
        descLong: "PostgreSQL arrays are first-class types. ARRAY[...] constructor. Operators: @> contains, <@ is contained in, && overlap. ANY(array) for element checks in WHERE. unnest() explodes array into rows. Array aggregates: array_agg(col). Use arrays for tags, permissions, multi-values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of PostgreSQL Arrays — ARRAY, ANY, ALL & Operators — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Array construction and access ────────────────\nSELECT\n    ARRAY[1, 2, 3] AS nums,\n    ARRAY['a', 'b', 'c'] AS letters,\n    ARRAY[1, 2, 3][1] AS first_elem,\n    ARRAY[1, 2, 3][2:3] AS slice\nFROM (SELECT 1);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of PostgreSQL Arrays — ARRAY, ANY, ALL & Operators — common patterns you'll see in production.\n-- APPROACH  - Combine PostgreSQL Arrays — ARRAY, ANY, ALL & Operators with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Array containment operators ────────────────────\nSELECT * FROM users WHERE tags @> ARRAY['premium']; -- contains premium\nSELECT * FROM users WHERE ARRAY['admin'] <@ tags;   -- is_contained_in\nSELECT * FROM users WHERE tags && ARRAY['admin', 'moderator']; -- overlap"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of PostgreSQL Arrays — ARRAY, ANY, ALL & Operators — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── ANY() for array element matching ──────────────,SELECT * FROM orders,WHERE status = ANY(ARRAY['pending', 'processing']);,,SELECT * FROM products,WHERE id = ANY(ARRAY[1, 5, 10]);,\n\n-- ── unnest() — explode array into rows ────────────,SELECT DISTINCT tag FROM users, unnest(tags) AS tag;,\n\n-- ── array_agg() — aggregate to array ──────────────,SELECT user_id, array_agg(tag) AS all_tags,FROM user_tags,GROUP BY user_id;,,SELECT user_id, array_agg(DISTINCT tag ORDER BY tag) AS sorted_tags,FROM user_tags,GROUP BY user_id;"
                  }
        ],
        tips: [
                  "ARRAY[...] operator for construction, unnest() for decomposition.",
                  "@> is the most common: WHERE tags @> ARRAY['premium'] checks for value.",
                  "array_agg(DISTINCT col ORDER BY col) aggregates with deduplication and sorting.",
                  "Arrays work well for fixed-size lists of identifiers or tags; JSONB for flexible docs."
        ],
        mistake: "Using string arrays instead of proper types — ARRAY['1','2']::int[] is correct but avoid when possible.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSELECT * FROM users WHERE tags @> ARRAY['premium'];\nSELECT user_id, array_agg(tag) FROM user_tags GROUP BY user_id;\n// More explicit but longer",
          concise: "ARRAY[...]; @>, <@, &&; ANY(array); unnest(array); array_agg(col)",
        },
      },
      {
        id: "pg-full-text",
        fn: "Full-Text Search — tsvector, tsquery & Ranking",
        desc: "PostgreSQL built-in full-text search: text vectors, queries, ranking, and GIN indexes.",
        category: "Search",
        subtitle: "tsvector, tsquery, to_tsvector, plainto_tsquery, @@, ts_rank, GIN",
        signature: "to_tsvector('english', text) @@ plainto_tsquery('english', query)",
        descLong: "PostgreSQL tsvector stores text in searchable form (stemmed tokens with positions). tsquery is the search expression. @@ is the match operator. Supports stemming (automatic word normalization), phrase search, boolean operators (& | !). ts_rank() ranks results. GIN indexes make searches fast. Often sufficient to replace Elasticsearch.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Full-Text Search — tsvector, tsquery & Ranking — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Full-text search setup ────────────────────────\nALTER TABLE articles ADD COLUMN search_vector tsvector;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Full-Text Search — tsvector, tsquery & Ranking — common patterns you'll see in production.\n-- APPROACH  - Combine Full-Text Search — tsvector, tsquery & Ranking with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Populate with weighted fields ──────────────────\nUPDATE articles SET search_vector =\n    setweight(to_tsvector('english', title), 'A') ||\n    setweight(to_tsvector('english', body), 'B') ||\n    setweight(to_tsvector('english', tags::text), 'C');"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Full-Text Search — tsvector, tsquery & Ranking — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Create GIN index ──────────────────────────────,CREATE INDEX idx_articles_search ON articles USING gin(search_vector);,\n\n-- ── Simple search ──────────────────────────────────,SELECT title, ts_rank(search_vector, query) AS rank,FROM articles,,    to_tsquery('english', 'postgres | database') AS query,WHERE search_vector @@ query,ORDER BY rank DESC;,\n\n-- ── Phrase search ─────────────────────────────────,SELECT title,FROM articles,WHERE search_vector @@ phraseto_tsquery('english', 'query optimization'),ORDER BY ts_rank(search_vector, phraseto_tsquery('english', 'query optimization')) DESC;,\n\n-- ── Boolean search (AND, OR, NOT) ──────────────────,SELECT title,FROM articles,WHERE search_vector @@ to_tsquery('english', 'postgres & (performance | optimization) & !nosql');,\n\n-- ── Search with document sections ──────────────────,-- A = title, B = body, C = tags,SELECT title, ts_rank(search_vector, query) AS rank,FROM articles,,    to_tsquery('english', 'performance') AS query,WHERE search_vector @@ query,ORDER BY rank DESC;"
                  }
        ],
        tips: [
                  "to_tsvector() tokenizes and stems text. plainto_tsquery() is user-friendly (ignores special chars).",
                  "setweight() ranks matches: A (highest) for title, B for body, C for tags.",
                  "GIN index is required for performance on large tables.",
                  "Phrase search with phraseto_tsquery() finds exact sequences."
        ],
        mistake: "Not weighting fields — all matches are treated equally. Use setweight() to rank title matches higher than body.",
        shorthand: {
          verbose: "// Manual / verbose approach\nto_tsvector('english', text) @@ plainto_tsquery('english', query);\nts_rank(vector, query)\n// More explicit but longer",
          concise: "to_tsvector; to_tsquery/plainto_tsquery/phraseto_tsquery; @@ operator; setweight(vec, 'A'); GIN index; ts_rank()",
        },
      },
      {
        id: "pg-window",
        fn: "PostgreSQL Window Functions — FILTER, GROUPS",
        desc: "Advanced window function features: FILTER for conditional aggregation, GROUPS framing mode.",
        category: "Window",
        subtitle: "FILTER (WHERE ...), GROUPS BETWEEN, EXCLUDE CURRENT ROW",
        signature: "COUNT(*) FILTER (WHERE col > 0) OVER (...)  |  GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW",
        descLong: "PostgreSQL window functions support FILTER (WHERE ...) for conditional aggregation within windows. GROUPS mode groups rows by ORDER BY value and frames by peer groups. EXCLUDE CURRENT ROW removes the current row from frame. These advanced features enable sophisticated analytics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of PostgreSQL Window Functions — FILTER, GROUPS — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── FILTER for conditional window aggregates ────\nSELECT\n    order_date,\n    amount,\n    COUNT(*) OVER (ORDER BY order_date) AS total_orders,\n    COUNT(*) FILTER (WHERE amount > 100) OVER (ORDER BY order_date) AS large_orders,\n    SUM(amount) FILTER (WHERE amount > 100) OVER (ORDER BY order_date) AS large_order_sum\nFROM orders;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of PostgreSQL Window Functions — FILTER, GROUPS — common patterns you'll see in production.\n-- APPROACH  - Combine PostgreSQL Window Functions — FILTER, GROUPS with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── GROUPS framing mode ───────────────────────────\n-- GROUPS treats rows with same ORDER BY value as peers\nSELECT\n    score,\n    ROW_NUMBER() OVER (ORDER BY score) AS row_num,\n    COUNT(*) OVER (ORDER BY score GROUPS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS peer_count\nFROM exam_results;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of PostgreSQL Window Functions — FILTER, GROUPS — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── EXCLUDE options ───────────────────────────────,SELECT,    salary,,    AVG(salary) OVER (PARTITION BY dept ORDER BY salary,        ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING,        EXCLUDE CURRENT ROW) AS avg_neighbors,FROM employees;"
                  }
        ],
        tips: [
                  "FILTER (WHERE ...) applies condition before aggregation — essential for conditional metrics.",
                  "GROUPS mode groups by ORDER BY value — useful when multiple rows tie on sort key.",
                  "EXCLUDE CURRENT ROW / EXCLUDE TIES / EXCLUDE GROUP / EXCLUDE NONE for fine-grained control."
        ],
        mistake: "Not using FILTER — computing conditional aggregates requires subqueries. FILTER makes it simple and efficient.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSUM(amount) FILTER (WHERE amount > 100) OVER (...)\n// More explicit but longer",
          concise: "aggregate() FILTER (WHERE condition) OVER (...); GROUPS BETWEEN mode; EXCLUDE options",
        },
      },
      {
        id: "pg-partitioning",
        fn: "Table Partitioning — RANGE, LIST, HASH & Pruning",
        desc: "Scale large tables with partitioning: RANGE, LIST, HASH modes, partition pruning, and attach/detach.",
        category: "Partitioning",
        subtitle: "PARTITION BY RANGE/LIST/HASH, partition pruning, attach, detach",
        signature: "PARTITION BY RANGE (date_col)  |  FOR VALUES FROM ... TO ...  |  ATTACH PARTITION",
        descLong: "Partitioning splits large tables into physical pieces. RANGE partitions by date/number ranges. LIST partitions by categories. HASH distributes evenly. PostgreSQL auto-prunes irrelevant partitions during query planning (partition pruning). Supports attach/detach for maintenance. Essential for tables > 10GB with time-based or categorical access patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Table Partitioning — RANGE, LIST, HASH & Pruning — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── RANGE partitioning (by date) ─────────────────\nCREATE TABLE events (\n    id BIGSERIAL,\n    event_type TEXT,\n    payload JSONB,\n    created_at TIMESTAMPTZ\n) PARTITION BY RANGE (created_at);\n\nCREATE TABLE events_2024_01 PARTITION OF events\n    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');\nCREATE TABLE events_2024_02 PARTITION OF events\n    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Table Partitioning — RANGE, LIST, HASH & Pruning — common patterns you'll see in production.\n-- APPROACH  - Combine Table Partitioning — RANGE, LIST, HASH & Pruning with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Queries automatically prune irrelevant partitions\nEXPLAIN SELECT * FROM events WHERE created_at >= '2024-02-15';\n-- Only scans events_2024_02"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Table Partitioning — RANGE, LIST, HASH & Pruning — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── LIST partitioning (by category) ────────────────,CREATE TABLE orders (id SERIAL, region TEXT, amount DECIMAL),PARTITION BY LIST (region);,,CREATE TABLE orders_us PARTITION OF orders FOR VALUES IN ('US');,CREATE TABLE orders_eu PARTITION OF orders FOR VALUES IN ('EU', 'UK');,CREATE TABLE orders_apac PARTITION OF orders FOR VALUES IN ('JP', 'KR', 'AU');,\n\n-- ── HASH partitioning (even distribution) ─────────,CREATE TABLE logs (,    id BIGSERIAL,,    message TEXT,,    created_at TIMESTAMPTZ,) PARTITION BY HASH (id);,,CREATE TABLE logs_0 PARTITION OF logs FOR VALUES WITH (MODULUS 4, REMAINDER 0);,CREATE TABLE logs_1 PARTITION OF logs FOR VALUES WITH (MODULUS 4, REMAINDER 1);,\n\n-- ── Attach/detach for maintenance ──────────────────,-- Detach old partition before dropping,ALTER TABLE events DETACH PARTITION events_2023_12;,DROP TABLE events_2023_12;,\n\n-- Attach prepared data,ALTER TABLE events ATTACH PARTITION events_2024_03,    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');"
                  }
        ],
        tips: [
                  "Partition tables > 10GB with clear time/category boundaries — partition pruning significantly reduces I/O.",
                  "RANGE by date is the most common pattern for time-series data and logs.",
                  "Maintenance: create new partitions before needed, detach old ones for archival.",
                  "INDEX on partitions: indexes on parent auto-apply to children."
        ],
        mistake: "Partitioning small tables (< 1GB) — overhead exceeds benefits. Only partition when pruning saves significant I/O.",
        shorthand: {
          verbose: "// Manual / verbose approach\nPARTITION BY RANGE (date_col);\nCREATE TABLE child PARTITION OF parent FOR VALUES FROM ... TO ...;\n// More explicit but longer",
          concise: "PARTITION BY RANGE/LIST/HASH; FOR VALUES FROM/IN/WITH; ATTACH/DETACH; partition pruning in EXPLAIN",
        },
      },
      {
        id: "pg-inheritance",
        fn: "Table Inheritance — Parent/Child, ONLY, Polymorphic",
        desc: "PostgreSQL table inheritance: child tables inherit columns from parent, ONLY keyword, polymorphic queries.",
        category: "Schema",
        subtitle: "INHERITS, ONLY, parent-child table hierarchy",
        signature: "CREATE TABLE child (...) INHERITS (parent)  |  SELECT * FROM ONLY parent",
        descLong: "Table inheritance creates parent-child relationships. Child table inherits all columns from parent and can add more. Queries on parent include all children unless ONLY is specified. Use ONLY parent to query just the parent. Inheritance differs from partitioning: useful for shared structure but manual management.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Table Inheritance — Parent/Child, ONLY, Polymorphic — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Simple inheritance ────────────────────────────\nCREATE TABLE person (\n    id SERIAL PRIMARY KEY,\n    name TEXT,\n    birth_date DATE\n);\n\nCREATE TABLE employee (\n    id SERIAL PRIMARY KEY,\n    salary DECIMAL\n) INHERITS (person);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Table Inheritance — Parent/Child, ONLY, Polymorphic — common patterns you'll see in production.\n-- APPROACH  - Combine Table Inheritance — Parent/Child, ONLY, Polymorphic with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- employee has: id, name, birth_date, salary\n\nINSERT INTO employee (name, birth_date, salary) VALUES\n    ('Alice', '1990-01-15', 75000);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Table Inheritance — Parent/Child, ONLY, Polymorphic — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Query all people (includes employees) ─────────,SELECT * FROM person;  -- Returns both person and employee rows,\n\n-- ── Query only parent, exclude children ────────────,SELECT * FROM ONLY person;  -- Only person rows, not employees,\n\n-- ── Polymorphic query example ──────────────────────,CREATE TABLE contract_employee (salary DECIMAL) INHERITS (employee);,,INSERT INTO contract_employee (name, birth_date, salary) VALUES,    ('Bob', '1985-03-20', 95000);,,SELECT name, salary FROM employee;  -- All employees + contract_employees,SELECT name, salary FROM ONLY employee;  -- Only direct employees"
                  }
        ],
        tips: [
                  "INHERITS for shared structure, but use partitioning for scaling large tables.",
                  "ONLY keyword excludes children — important for maintenance queries.",
                  "Child tables have all parent columns plus their own."
        ],
        mistake: "Using INHERITS instead of proper partitioning for scaling — INHERITS is for schema sharing, not performance scaling.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCREATE TABLE child (...) INHERITS (parent);\n// More explicit but longer",
          concise: "INHERITS for schema sharing; SELECT ... FROM ONLY parent to exclude children",
        },
      },
      {
        id: "pg-materialized-views",
        fn: "Materialized Views — Cached Query Results",
        desc: "Store expensive query results: CREATE MATERIALIZED VIEW, REFRESH, CONCURRENTLY with indexes.",
        category: "Views",
        subtitle: "CREATE MATERIALIZED VIEW, REFRESH CONCURRENTLY, UNIQUE INDEX",
        signature: "CREATE MATERIALIZED VIEW ... AS SELECT ...  |  REFRESH MATERIALIZED VIEW CONCURRENTLY",
        descLong: "Materialized views store query results physically on disk. Unlike regular views (virtual), mat views are actual tables. Must refresh to update. REFRESH CONCURRENTLY requires a unique index and does not lock reads. Ideal for expensive aggregations, rollups, and precomputed reports.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Materialized Views — Cached Query Results — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Create materialized view ──────────────────────\nCREATE MATERIALIZED VIEW daily_revenue AS\nSELECT\n    DATE_TRUNC('day', created_at) AS day,\n    region,\n    COUNT(*) AS order_count,\n    SUM(amount) AS total_revenue,\n    AVG(amount) AS avg_order\nFROM orders\nWHERE created_at >= CURRENT_DATE - INTERVAL '90 days'\nGROUP BY 1, 2;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Materialized Views — Cached Query Results — common patterns you'll see in production.\n-- APPROACH  - Combine Materialized Views — Cached Query Results with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Add unique index for concurrent refresh ───────\nCREATE UNIQUE INDEX idx_daily_revenue ON daily_revenue (day, region);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Materialized Views — Cached Query Results — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Refresh (locks reads) ─────────────────────────,REFRESH MATERIALIZED VIEW daily_revenue;,\n\n-- ── Refresh without locking reads ──────────────────,REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;,\n\n-- ── Query materialized view ───────────────────────,SELECT * FROM daily_revenue,WHERE day >= CURRENT_DATE - INTERVAL '7 days',ORDER BY day DESC, total_revenue DESC;,\n\n-- ── Drop when no longer needed ─────────────────────,DROP MATERIALIZED VIEW daily_revenue;"
                  }
        ],
        tips: [
                  "Add unique index before using REFRESH CONCURRENTLY.",
                  "REFRESH CONCURRENTLY updates without locking reads — best for production dashboards.",
                  "Materialized views are actual tables: queries are fast, but results lag behind source data.",
                  "Schedule REFRESH with cron jobs or application logic."
        ],
        mistake: "Creating mat view without index — REFRESH blocks all reads. Always add unique index for CONCURRENTLY.",
        shorthand: {
          verbose: "CREATE MATERIALIZED VIEW name AS SELECT ...;\nCREATE UNIQUE INDEX idx ON name (...);\nREFRESH MATERIALIZED VIEW CONCURRENTLY name;",
          concise: "CREATE MATERIALIZED VIEW ... AS SELECT; CREATE UNIQUE INDEX; REFRESH CONCURRENTLY",
        },
      },
      {
        id: "pg-extensions",
        fn: "PostgreSQL Extensions — pgcrypto, uuid, pg_trgm, PostGIS, timescaledb",
        desc: "Key PostgreSQL extensions: cryptography, UUIDs, fuzzy matching, spatial data, and time-series.",
        category: "Extensions",
        subtitle: "pgcrypto, uuid-ossp, pg_trgm, PostGIS, timescaledb, CREATE EXTENSION",
        signature: "CREATE EXTENSION IF NOT EXISTS extension_name  |  gen_random_uuid()  |  similarity()",
        descLong: "PostgreSQL extensions add functionality. pgcrypto for encryption/hashing. uuid-ossp for UUID generation. pg_trgm for fuzzy/trigram search. PostGIS for geographic data. timescaledb for time-series optimization. Install with CREATE EXTENSION.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of PostgreSQL Extensions — pgcrypto, uuid, pg_trgm, PostGIS, timescaledb — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── pgcrypto: hashing and encryption ──────────────\nCREATE EXTENSION IF NOT EXISTS pgcrypto;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of PostgreSQL Extensions — pgcrypto, uuid, pg_trgm, PostGIS, timescaledb — common patterns you'll see in production.\n-- APPROACH  - Combine PostgreSQL Extensions — pgcrypto, uuid, pg_trgm, PostGIS, timescaledb with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Hash password\nUPDATE users SET password_hash = crypt(password, gen_salt('bf'))\nWHERE password IS NOT NULL;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of PostgreSQL Extensions — pgcrypto, uuid, pg_trgm, PostGIS, timescaledb — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Verify password,SELECT * FROM users,WHERE password_hash = crypt('mypassword', password_hash);,\n\n-- ── uuid-ossp: UUID generation ────────────────────,CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";,,INSERT INTO users (id, email) VALUES,    (uuid_generate_v4(), 'alice@example.com'),,    (uuid_generate_v4(), 'bob@example.com');,\n\n-- ── pg_trgm: fuzzy/trigram search ─────────────────,CREATE EXTENSION IF NOT EXISTS pg_trgm;,,SELECT * FROM products,WHERE name % 'lpatop'  -- typo-tolerant search,ORDER BY similarity(name, 'lpatop') DESC;,,CREATE INDEX idx_products_trgm ON products USING gist(name gist_trgm_ops);,\n\n-- ── PostGIS: geospatial queries ───────────────────,CREATE EXTENSION IF NOT EXISTS postgis;,,SELECT * FROM stores,WHERE ST_DWithin(location, ST_GeomFromText('POINT(-74.0 40.7)'), 1000),ORDER BY ST_Distance(location, ST_GeomFromText('POINT(-74.0 40.7)'));,\n\n-- ── timescaledb: time-series optimization ──────────,CREATE EXTENSION IF NOT EXISTS timescaledb;,,SELECT create_hypertable('metrics', 'time');"
                  }
        ],
        tips: [
                  "pgcrypto: use gen_random_uuid() instead of uuid-ossp — faster.",
                  "pg_trgm for typo-tolerant search and similarity matching.",
                  "PostGIS: essential for location-based services and mapping.",
                  "timescaledb: automatic compression and efficient storage for metrics."
        ],
        mistake: "Not using pgcrypto for passwords — storing plaintext passwords is a critical security flaw.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCREATE EXTENSION pgcrypto;\nUPDATE users SET hash = crypt(password, gen_salt('bf'));\n// More explicit but longer",
          concise: "CREATE EXTENSION ...; pgcrypto for crypt/gen_salt; uuid-ossp for UUIDs; pg_trgm for fuzzy search",
        },
      },
      {
        id: "pg-vacuum-maintenance",
        fn: "VACUUM & Maintenance — Bloat, autovacuum, Statistics",
        desc: "PostgreSQL maintenance: VACUUM ANALYZE, autovacuum tuning, bloat detection, and health monitoring.",
        category: "Maintenance",
        subtitle: "VACUUM, ANALYZE, autovacuum, pg_stat_user_tables, bloat",
        signature: "VACUUM ANALYZE table  |  autovacuum_vacuum_scale_factor  |  pg_stat_user_tables",
        descLong: "VACUUM removes dead tuples from disk (reclaims space, improves query speed). ANALYZE updates table statistics for query planner. autovacuum runs automatically. Monitor with pg_stat_user_tables for bloat and dead tuples. Tune autovacuum thresholds for heavy insert/delete workloads.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of VACUUM & Maintenance — Bloat, autovacuum, Statistics — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Manual VACUUM and ANALYZE ──────────────────\nVACUUM ANALYZE table_name;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of VACUUM & Maintenance — Bloat, autovacuum, Statistics — common patterns you'll see in production.\n-- APPROACH  - Combine VACUUM & Maintenance — Bloat, autovacuum, Statistics with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── VACUUM FULL (rewrites table, slow) ────────────\nVACUUM FULL table_name;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of VACUUM & Maintenance — Bloat, autovacuum, Statistics — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Check table bloat and dead tuples ──────────────,SELECT schemaname, tablename,,    n_live_tup, n_dead_tup,,    ROUND(100 * n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct,FROM pg_stat_user_tables,ORDER BY n_dead_tup DESC;,\n\n-- ── Autovacuum configuration (in postgresql.conf) ──,-- autovacuum = on  (default),-- autovacuum_naptime = 10s  (check every 10s),-- autovacuum_vacuum_scale_factor = 0.1  (10% of table),-- autovacuum_analyze_scale_factor = 0.05  (5% of table),-- autovacuum_vacuum_cost_delay = 2ms  (I/O throttle),\n\n-- ── Check when autovacuum last ran ────────────────,SELECT schemaname, tablename, last_vacuum, last_autovacuum, last_analyze,FROM pg_stat_user_tables,ORDER BY last_vacuum DESC;,\n\n-- ── Force analyze to update statistics ────────────,ANALYZE table_name;"
                  }
        ],
        tips: [
                  "VACUUM without FULL is fast and should run regularly (autovacuum).",
                  "VACUUM FULL rewrites the table — only for severely bloated tables.",
                  "Monitor dead tuple percentage in pg_stat_user_tables — high % means autovacuum needs tuning.",
                  "Tune autovacuum_vacuum_scale_factor and autovacuum_analyze_scale_factor for high-churn tables."
        ],
        mistake: "Running VACUUM FULL frequently — it locks the table and is very slow. Use regular VACUUM instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nVACUUM ANALYZE table_name;\nSELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables;\n// More explicit but longer",
          concise: "VACUUM ANALYZE; check pg_stat_user_tables for bloat; tune autovacuum_scale_factor",
        },
      },
      {
        id: "pg-copy",
        fn: "COPY Command — Bulk Inserts & Data Loading",
        desc: "Fast bulk inserts with COPY: FROM STDIN, \\copy, CSV/binary formats, and performance.",
        category: "Data Loading",
        subtitle: "COPY ... FROM STDIN, \\copy, CSV format, binary, DELIMITER",
        signature: "COPY table (cols) FROM STDIN  |  \\copy table FROM file.csv WITH (FORMAT csv)",
        descLong: "COPY is the fastest way to load data into PostgreSQL. FROM STDIN reads from application. \\copy (psql meta-command) reads from client machine. Supports CSV, text, and binary formats. Delimiter, quote character, null string configurable. 100x faster than INSERT for bulk loads.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of COPY Command — Bulk Inserts & Data Loading — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── COPY from STDIN (from application) ──────────\nCOPY products (id, name, price) FROM STDIN;\n1\tLaptop\t999.99\n2\tMouse\t29.99\n3\tKeyboard\t89.99\n\\."
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of COPY Command — Bulk Inserts & Data Loading — common patterns you'll see in production.\n-- APPROACH  - Combine COPY Command — Bulk Inserts & Data Loading with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── COPY from file (psql meta-command) ────────────\n\\copy products (id, name, price) FROM 'products.csv' WITH (FORMAT csv)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of COPY Command — Bulk Inserts & Data Loading — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── COPY with custom delimiter ────────────────────,\\copy products FROM 'products.tsv' WITH (FORMAT text, DELIMITER E'\\t'),\n\n-- ── COPY TO export data ───────────────────────────,\\copy (SELECT * FROM products WHERE price > 100) TO 'expensive.csv' WITH (FORMAT csv, HEADER),\n\n-- ── COPY with binary format (fastest) ──────────────,COPY large_table TO STDOUT WITH (FORMAT binary) | gzip > backup.bin.gz,\n\n-- ── Python example with COPY ──────────────────────,import psycopg2,import io,,conn = psycopg2.connect(\"dbname=mydb\"),cur = conn.cursor(),,data = io.StringIO(),for user in users:,    data.write(f\"{user['id']}\t{user['name']}\t{user['email']},\"),,data.seek(0),cur.copy_from(data, 'users', columns=['id', 'name', 'email']),conn.commit()"
                  }
        ],
        tips: [
                  "COPY is 100x+ faster than INSERT for bulk loads.",
                  "\\copy (psql) vs COPY: \\copy uses client file, COPY uses server file.",
                  "Binary format is fastest but only useful for server-to-server transfers.",
                  "CSV with HEADER for human-readable exports."
        ],
        mistake: "Using INSERT loops for bulk data — unbelievably slow. Always use COPY for bulk loads.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCOPY table (cols) FROM STDIN;\n\\copy table FROM file.csv WITH (FORMAT csv)\n// More explicit but longer",
          concise: "COPY FROM STDIN; \\copy FROM file; CSV, binary, custom DELIMITER; 100x faster than INSERT",
        },
      },
      {
        id: "pg-advisory-locks",
        fn: "Advisory Locks — Application-Level Locking",
        desc: "Distributed locking with advisory locks: preventing duplicate work, mutual exclusion, and session scoping.",
        category: "Concurrency",
        subtitle: "pg_try_advisory_lock, pg_advisory_xact_lock, pg_advisory_unlock",
        signature: "SELECT pg_try_advisory_lock(lock_id)  |  pg_advisory_xact_lock(lock_id)",
        descLong: "Advisory locks are application-controlled locks stored in PostgreSQL. pg_try_advisory_lock() returns immediately (true/false). pg_advisory_xact_lock() holds until transaction end. Perfect for preventing duplicate cron jobs, distributed mutex, and ensuring single-writer access across services.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Advisory Locks — Application-Level Locking — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Try-acquire lock for cron job ─────────────────\nBEGIN;\nSELECT pg_try_advisory_lock(12345) INTO lock_acquired;\n\nIF NOT lock_acquired THEN\n    ROLLBACK;\n    -- Another process has the lock, exit\nELSE\n    -- Safe to do exclusive work\n    UPDATE jobs SET status = 'running' WHERE id = 1;\n    -- ... long-running work ...\n    UPDATE jobs SET status = 'done' WHERE id = 1;\n    COMMIT;\nEND IF;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Advisory Locks — Application-Level Locking — common patterns you'll see in production.\n-- APPROACH  - Combine Advisory Locks — Application-Level Locking with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Advisory lock in application code ──────────────\n-- Python example:\nimport psycopg2\n\nlock_id = 99999\nconn = psycopg2.connect(\"dbname=mydb\")\ncur = conn.cursor()\n\ncur.execute(\"SELECT pg_try_advisory_lock(%s)\", (lock_id,))\nhas_lock = cur.fetchone()[0]\n\nif has_lock:\n    try:\n        # Safe to run exclusive work\n        process_orders()\n    finally:\n        cur.execute(\"SELECT pg_advisory_unlock(%s)\", (lock_id,))\nelse:\n    print(\"Another worker has the lock\")"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Advisory Locks — Application-Level Locking — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Transaction-scoped advisory lock ───────────────,BEGIN;,SELECT pg_advisory_xact_lock(lock_id);  -- Held until COMMIT,-- ... work ...,COMMIT;  -- Lock automatically released,\n\n-- ── List held advisory locks ──────────────────────,SELECT * FROM pg_locks WHERE locktype = 'advisory';"
                  }
        ],
        tips: [
                  "pg_try_advisory_lock() is non-blocking — returns false if locked.",
                  "pg_advisory_xact_lock() holds for the transaction — auto-releases on COMMIT/ROLLBACK.",
                  "Perfect for: preventing duplicate cron jobs, distributed task scheduling, mutual exclusion.",
                  "Use high lock IDs (> 1 billion) to avoid conflicts with internal PostgreSQL locks."
        ],
        mistake: "Relying on SELECT FOR UPDATE for cross-service locking — advisory locks are the right tool.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSELECT pg_try_advisory_lock(lock_id);\nSELECT pg_advisory_unlock(lock_id);\n// More explicit but longer",
          concise: "pg_try_advisory_lock(id); pg_advisory_xact_lock(id); pg_advisory_unlock(id); check pg_locks",
        },
      },
    ],
  },

  // ── Section 3: Query Optimization & Partitioning ─────────────────────────────────────────
  {
    id: "explain-partitioning",
    title: "Query Optimization & Partitioning",
    entries: [
      {
        id: "explain-analyze",
        fn: "EXPLAIN ANALYZE — Understanding Query Plans",
        desc: "Read and optimize query plans: sequential vs index scans, join algorithms, cost estimation, and common optimization patterns.",
        category: "Performance",
        subtitle: "EXPLAIN ANALYZE, Seq Scan, Index Scan, Hash Join, Sort, Buffers",
        signature: "EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT ...  |  actual time  |  rows  |  loops",
        descLong: "EXPLAIN shows the query plan PostgreSQL will use. EXPLAIN ANALYZE actually runs the query and shows real timings. Key metrics: actual time (ms), rows (actual vs estimated), loops (how many times a node executed). Scan types: Seq Scan (full table), Index Scan (uses index), Bitmap Index Scan (combines multiple indexes). Join types: Nested Loop (small + indexed), Hash Join (medium tables), Merge Join (pre-sorted). The planner chooses based on table statistics — run ANALYZE after bulk loads.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of EXPLAIN ANALYZE — Understanding Query Plans — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Basic EXPLAIN ANALYZE ────────────────────────────\nEXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\nSELECT u.name, COUNT(o.id) AS order_count\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE u.created_at > '2024-01-01'\nGROUP BY u.name\nORDER BY order_count DESC\nLIMIT 10;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of EXPLAIN ANALYZE — Understanding Query Plans — common patterns you'll see in production.\n-- APPROACH  - Combine EXPLAIN ANALYZE — Understanding Query Plans with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Example output:\n-- Limit (cost=1234..1235 rows=10) (actual time=45.2..45.3 rows=10 loops=1)\n--   -> Sort (cost=1234..1256 rows=500) (actual time=45.2..45.2 rows=10 loops=1)\n--     Sort Key: count(o.id) DESC\n--     Sort Method: top-N heapsort  Memory: 25kB\n--     -> HashAggregate (cost=1100..1200 rows=500) (actual time=44.0..44.5 rows=500 loops=1)\n--       -> Hash Join (cost=100..900 rows=5000) (actual time=5.0..38.0 rows=5000 loops=1)\n--         Hash Cond: (o.user_id = u.id)\n--         -> Seq Scan on orders o (cost=0..600 rows=50000) (actual time=0.01..20.0 rows=50000 loops=1)\n--         -> Hash (cost=80..80 rows=500) (actual time=2.0..2.0 rows=500 loops=1)\n--           -> Index Scan using idx_users_created on users u (actual time=0.05..1.5 rows=500 loops=1)\n--             Index Cond: (created_at > '2024-01-01')"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of EXPLAIN ANALYZE — Understanding Query Plans — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Reading the plan ────────────────────────────────,-- cost=startup..total    — estimated cost in arbitrary units,-- actual time=start..end — real milliseconds,-- rows=N                 — actual rows returned (compare to estimate!),-- Buffers: shared hit=X read=Y — cache hits vs disk reads,\n\n-- ── Huge row estimate mismatch = stale statistics ───,-- If estimated rows=100 but actual rows=50000:,ANALYZE users;  -- update table statistics,ANALYZE orders;,\n\n-- ── Common optimization patterns ────────────────────,-- 1. Missing index (Seq Scan on large table),CREATE INDEX idx_orders_user_id ON orders (user_id);,CREATE INDEX idx_users_created ON users (created_at);,\n\n-- 2. Covering index (Index Only Scan — no table lookup),CREATE INDEX idx_orders_covering ON orders (user_id) INCLUDE (amount, created_at);,\n\n-- 3. Partial index (index only matching rows),CREATE INDEX idx_active_users ON users (email) WHERE active = true;,\n\n-- 4. Composite index (multi-column),CREATE INDEX idx_orders_user_date ON orders (user_id, created_at DESC);,\n\n-- 5. Force index usage for testing (not for production),SET enable_seqscan = off;  -- temporary, resets on disconnect"
                  }
        ],
        tips: [
                  "Always use EXPLAIN ANALYZE (not just EXPLAIN) — estimated costs can be wildly wrong; actual timings show the real bottleneck.",
                  "Compare estimated rows vs actual rows — a 10x mismatch means stale statistics. Run ANALYZE on the table.",
                  "Seq Scan on a large table in a JOIN usually means a missing index — add an index on the join column.",
                  "BUFFERS shows cache hits vs disk reads — high read count means the working set exceeds shared_buffers."
        ],
        mistake: "Adding indexes without checking EXPLAIN first — random indexes waste disk and slow writes. Always verify the query plan to see what PostgreSQL actually needs, then add targeted indexes.",
        shorthand: {
          verbose: "EXPLAIN SELECT * FROM orders WHERE user_id = 42;\n-- Seq Scan on orders ← Full table scan, slow\n-- Filter: (user_id = 42)",
          concise: "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE user_id = 42;\n-- Index Scan using idx_orders_user ← Fast, actual time: 0.052 ms\n-- Buffers: shared hit=5 ← All from cache",
        },
      },
      {
        id: "partitioning-matviews",
        fn: "Partitioning, Materialized Views & Full-Text Search",
        desc: "Scale PostgreSQL: table partitioning for large tables, materialized views for cached queries, and built-in full-text search.",
        category: "Scaling",
        subtitle: "PARTITION BY RANGE, LIST, HASH, MATERIALIZED VIEW, tsvector, tsquery, GIN",
        signature: "PARTITION BY RANGE (date)  |  CREATE MATERIALIZED VIEW  |  to_tsvector()  |  @@",
        descLong: "Table partitioning splits large tables into smaller physical pieces by range (dates), list (categories), or hash (even distribution). PostgreSQL auto-routes queries to relevant partitions (partition pruning). Materialized views store query results physically and refresh on demand — ideal for expensive aggregations. Full-text search (tsvector/tsquery) provides built-in search with stemming, ranking, and phrase matching — often enough to avoid Elasticsearch.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Partitioning, Materialized Views & Full-Text Search — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Range partitioning (by date) ─────────────────────\nCREATE TABLE events (\n    id BIGSERIAL,\n    event_type TEXT NOT NULL,\n    payload JSONB,\n    created_at TIMESTAMPTZ NOT NULL\n) PARTITION BY RANGE (created_at);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Partitioning, Materialized Views & Full-Text Search — common patterns you'll see in production.\n-- APPROACH  - Combine Partitioning, Materialized Views & Full-Text Search with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Create partitions (one per month)\nCREATE TABLE events_2024_01 PARTITION OF events\n    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');\nCREATE TABLE events_2024_02 PARTITION OF events\n    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');\n-- ... automate with pg_partman extension"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Partitioning, Materialized Views & Full-Text Search — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Queries automatically prune irrelevant partitions:,SELECT * FROM events WHERE created_at >= '2024-02-15';,-- Only scans events_2024_02, skips January,\n\n-- ── List partitioning (by category) ─────────────────,CREATE TABLE orders (,    id SERIAL,,    region TEXT NOT NULL,,    amount DECIMAL,) PARTITION BY LIST (region);,,CREATE TABLE orders_us PARTITION OF orders FOR VALUES IN ('US');,CREATE TABLE orders_eu PARTITION OF orders FOR VALUES IN ('EU', 'UK');,CREATE TABLE orders_apac PARTITION OF orders FOR VALUES IN ('JP', 'KR', 'AU');,\n\n-- ── Materialized views ──────────────────────────────,CREATE MATERIALIZED VIEW daily_revenue AS,SELECT,    DATE_TRUNC('day', created_at) AS day,,    region,,    COUNT(*) AS order_count,,    SUM(amount) AS revenue,,    AVG(amount) AS avg_order,FROM orders,WHERE created_at >= CURRENT_DATE - INTERVAL '90 days',GROUP BY 1, 2;,\n\n-- Add index on materialized view,CREATE UNIQUE INDEX idx_daily_rev ON daily_revenue (day, region);,\n\n-- Refresh (blocking),REFRESH MATERIALIZED VIEW daily_revenue;,\n\n-- Refresh without locking reads (requires unique index),REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;,\n\n-- ── Full-text search ────────────────────────────────,ALTER TABLE articles ADD COLUMN search_vector tsvector;,,UPDATE articles SET search_vector =,    setweight(to_tsvector('english', title), 'A') ||,    setweight(to_tsvector('english', COALESCE(body, '')), 'B');,,CREATE INDEX idx_articles_search ON articles USING gin (search_vector);,\n\n-- Search with ranking,SELECT title,,    ts_rank(search_vector, query) AS rank,FROM articles,,    to_tsquery('english', 'postgres & (performance | optimization)') AS query,WHERE search_vector @@ query,ORDER BY rank DESC,LIMIT 20;,\n\n-- Phrase search,SELECT * FROM articles,WHERE search_vector @@ phraseto_tsquery('english', 'query optimization');"
                  }
        ],
        tips: [
                  "Partition tables that exceed 10-50GB or have clear time-based access patterns — partition pruning avoids scanning irrelevant data.",
                  "REFRESH MATERIALIZED VIEW CONCURRENTLY does not lock reads but requires a unique index — always add one.",
                  "PostgreSQL full-text search with tsvector + GIN index handles most search needs — only add Elasticsearch for faceted search or complex scoring.",
                  "setweight(A/B/C/D) lets you rank title matches higher than body matches — essential for relevant search results."
        ],
        mistake: "Partitioning small tables (< 1GB) — partitioning adds planning overhead. PostgreSQL scans small tables fast with regular indexes. Only partition when tables are large enough that partition pruning saves significant I/O.",
        shorthand: {
          verbose: "SELECT DATE_TRUNC('day', created_at) AS day, region, SUM(amount) AS revenue\nFROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'\nGROUP BY 1, 2;\n-- Expensive aggregation, runs every query",
          concise: "CREATE MATERIALIZED VIEW daily_revenue AS SELECT ... GROUP BY ...;\nCREATE UNIQUE INDEX idx_daily_rev ON daily_revenue (day, region);\nREFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;",
        },
      },
    ],
  },
]

export default { meta, sections }
