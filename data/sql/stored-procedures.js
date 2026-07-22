export const meta = {
  "id": "stored-procedures",
  "label": "Stored Procedures & Triggers",
  "icon": "⚙️",
  "description": "SQL stored procedures, functions, triggers, cursors, error handling, and dynamic SQL."
}

export const sections = [

  // ── Section 1: Stored Procedures & Functions ─────────────────────────────────────────
  {
    id: "procedures",
    title: "Stored Procedures & Functions",
    entries: [
      {
        id: "procedures-basics",
        fn: "Stored Procedures — Reusable Server-Side Logic",
        desc: "Create stored procedures with parameters, control flow, error handling, and transaction management.",
        category: "Procedures",
        subtitle: "CREATE PROCEDURE, IN/OUT/INOUT, IF/ELSE, LOOP, RAISE, EXCEPTION",
        signature: "CREATE PROCEDURE name(IN p1 type, OUT p2 type)  |  CALL name()  |  EXCEPTION WHEN",
        descLong: "Stored procedures encapsulate SQL logic on the server, reducing network round-trips and enforcing business rules. Parameters can be IN (input), OUT (output), or INOUT (both). Control flow includes IF/ELSIF/ELSE, CASE, LOOP, WHILE, and FOR. Error handling uses BEGIN...EXCEPTION blocks (PostgreSQL) or TRY...CATCH (SQL Server). Procedures can manage transactions, call other procedures, and return result sets. Use them for: batch operations, data validation, ETL steps, and complex business logic that should run close to the data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Stored Procedures — Reusable Server-Side Logic — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── PostgreSQL stored procedure ──────────────────────\nCREATE OR REPLACE PROCEDURE transfer_funds(\n    IN sender_id INT,\n    IN receiver_id INT,\n    IN amount DECIMAL(10,2)\n)\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    sender_balance DECIMAL(10,2);\nBEGIN\n    -- Check sender balance\n    SELECT balance INTO sender_balance\n    FROM accounts WHERE id = sender_id FOR UPDATE;\n\n    IF sender_balance < amount THEN\n        RAISE EXCEPTION 'Insufficient funds: balance=%, amount=%',\n            sender_balance, amount;\n    END IF;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Stored Procedures — Reusable Server-Side Logic — common patterns you'll see in production.\n-- APPROACH  - Combine Stored Procedures — Reusable Server-Side Logic with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Transfer\n    UPDATE accounts SET balance = balance - amount WHERE id = sender_id;\n    UPDATE accounts SET balance = balance + amount WHERE id = receiver_id;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Stored Procedures — Reusable Server-Side Logic — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Log the transfer,    INSERT INTO transfers (sender_id, receiver_id, amount, created_at),    VALUES (sender_id, receiver_id, amount, NOW());,,    COMMIT;,END;,$$;,,CALL transfer_funds(1, 2, 500.00);,\n\n-- ── Function (returns a value) ──────────────────────,CREATE OR REPLACE FUNCTION get_customer_tier(customer_id INT),RETURNS TEXT,LANGUAGE plpgsql STABLE,AS $$,DECLARE,    total_spent DECIMAL;,BEGIN,    SELECT COALESCE(SUM(amount), 0) INTO total_spent,    FROM orders WHERE user_id = customer_id;,,    RETURN CASE,        WHEN total_spent >= 10000 THEN 'platinum',        WHEN total_spent >= 5000  THEN 'gold',        WHEN total_spent >= 1000  THEN 'silver',        ELSE 'bronze',    END;,END;,$$;,\n\n-- Use in queries like a built-in function,SELECT name, get_customer_tier(id) AS tier FROM customers;,\n\n-- ── Table-returning function ────────────────────────,CREATE OR REPLACE FUNCTION get_monthly_report(report_month DATE),RETURNS TABLE(region TEXT, revenue DECIMAL, orders BIGINT),LANGUAGE plpgsql STABLE,AS $$,BEGIN,    RETURN QUERY,    SELECT,        o.region,,        SUM(o.amount)::DECIMAL AS revenue,,        COUNT(*)::BIGINT AS orders,    FROM orders o,    WHERE DATE_TRUNC('month', o.order_date) = DATE_TRUNC('month', report_month),    GROUP BY o.region,    ORDER BY revenue DESC;,END;,$$;,,SELECT * FROM get_monthly_report('2024-06-01');"
                  }
        ],
        tips: [
                  "Use STABLE or IMMUTABLE on functions that do not modify data — the optimizer can cache results and improve query plans.",
                  "SELECT ... FOR UPDATE locks rows during a transaction — essential for procedures that read-then-write (like balance transfers).",
                  "RAISE EXCEPTION aborts the transaction in PostgreSQL — use RAISE NOTICE for warnings that do not abort.",
                  "Table-returning functions (RETURNS TABLE) can be used in FROM clauses like views but accept parameters."
        ],
        mistake: "Not using transactions in procedures that modify multiple tables — if the second UPDATE fails, the first is already committed. Wrap related modifications in explicit transactions or use procedures (which auto-commit in PostgreSQL).",
        shorthand: {
          verbose: "-- Multiple app round-trips\n-- 1. SELECT balance FROM accounts WHERE id = 1\n-- 2. IF balance >= amount: UPDATE accounts SET balance = ...\n-- 3. INSERT INTO transfers\n-- 4. UPDATE accounts SET balance = ...",
          concise: "CREATE PROCEDURE transfer_funds(IN sender INT, IN receiver INT, IN amount DECIMAL)\nLANGUAGE plpgsql AS $$\nBEGIN\n  UPDATE accounts SET balance = balance - amount WHERE id = sender;\n  UPDATE accounts SET balance = balance + amount WHERE id = receiver;\n  INSERT INTO transfers VALUES (sender, receiver, amount, NOW());\nEND;\n$$;\nCALL transfer_funds(1, 2, 500);",
        },
      },
      {
        id: "triggers",
        fn: "Triggers — Automatic Actions on Data Changes",
        desc: "Create triggers that fire on INSERT, UPDATE, DELETE: audit logs, data validation, computed columns, and cascading updates.",
        category: "Triggers",
        subtitle: "CREATE TRIGGER, BEFORE/AFTER, NEW/OLD, FOR EACH ROW, trigger functions",
        signature: "CREATE TRIGGER name BEFORE INSERT ON table FOR EACH ROW EXECUTE FUNCTION fn()",
        descLong: "Triggers automatically execute functions when data changes (INSERT, UPDATE, DELETE). BEFORE triggers can validate or modify data before it is written. AFTER triggers handle side effects (audit logs, notifications, cache updates). NEW holds the new row values (INSERT/UPDATE). OLD holds the old row values (UPDATE/DELETE). FOR EACH ROW fires per row; FOR EACH STATEMENT fires once per operation. Triggers enforce invariants that the application layer cannot bypass — any client connecting to the database gets the same rules.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Triggers — Automatic Actions on Data Changes — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Audit log trigger ────────────────────────────────\nCREATE TABLE audit_log (\n    id SERIAL PRIMARY KEY,\n    table_name TEXT NOT NULL,\n    operation TEXT NOT NULL,\n    old_data JSONB,\n    new_data JSONB,\n    changed_by TEXT DEFAULT current_user,\n    changed_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nCREATE OR REPLACE FUNCTION audit_trigger_fn()\nRETURNS TRIGGER\nLANGUAGE plpgsql AS $$\nBEGIN\n    IF TG_OP = 'DELETE' THEN\n        INSERT INTO audit_log (table_name, operation, old_data)\n        VALUES (TG_TABLE_NAME, 'DELETE', to_jsonb(OLD));\n        RETURN OLD;\n    ELSIF TG_OP = 'UPDATE' THEN\n        INSERT INTO audit_log (table_name, operation, old_data, new_data)\n        VALUES (TG_TABLE_NAME, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));\n        RETURN NEW;\n    ELSIF TG_OP = 'INSERT' THEN\n        INSERT INTO audit_log (table_name, operation, new_data)\n        VALUES (TG_TABLE_NAME, 'INSERT', to_jsonb(NEW));\n        RETURN NEW;\n    END IF;\nEND;\n$$;\n\nCREATE TRIGGER audit_customers\nAFTER INSERT OR UPDATE OR DELETE ON customers\nFOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Triggers — Automatic Actions on Data Changes — common patterns you'll see in production.\n-- APPROACH  - Combine Triggers — Automatic Actions on Data Changes with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Auto-update timestamps ──────────────────────────\nCREATE OR REPLACE FUNCTION update_modified_at()\nRETURNS TRIGGER\nLANGUAGE plpgsql AS $$\nBEGIN\n    NEW.updated_at = NOW();\n    RETURN NEW;\nEND;\n$$;\n\nCREATE TRIGGER set_updated_at\nBEFORE UPDATE ON orders\nFOR EACH ROW EXECUTE FUNCTION update_modified_at();"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Triggers — Automatic Actions on Data Changes — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Data validation trigger ─────────────────────────,CREATE OR REPLACE FUNCTION validate_order(),RETURNS TRIGGER,LANGUAGE plpgsql AS $$,BEGIN,    IF NEW.amount <= 0 THEN,        RAISE EXCEPTION 'Order amount must be positive, got %', NEW.amount;,    END IF;,    IF NEW.quantity > 1000 THEN,        RAISE EXCEPTION 'Order quantity exceeds maximum (1000)';,    END IF;,    -- Auto-compute total,    NEW.total = NEW.amount * NEW.quantity;,    RETURN NEW;,END;,$$;,,CREATE TRIGGER validate_order_trigger,BEFORE INSERT OR UPDATE ON orders,FOR EACH ROW EXECUTE FUNCTION validate_order();,\n\n-- ── Cascading update trigger ────────────────────────,CREATE OR REPLACE FUNCTION update_customer_stats(),RETURNS TRIGGER,LANGUAGE plpgsql AS $$,BEGIN,    UPDATE customers SET,        total_orders = (SELECT COUNT(*) FROM orders WHERE user_id = NEW.user_id),,        total_spent = (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = NEW.user_id),,        last_order_at = NOW(),    WHERE id = NEW.user_id;,    RETURN NEW;,END;,$$;,,CREATE TRIGGER refresh_customer_stats,AFTER INSERT ON orders,FOR EACH ROW EXECUTE FUNCTION update_customer_stats();"
                  }
        ],
        tips: [
                  "BEFORE triggers can modify NEW values — use them for auto-computing fields, sanitizing input, and validation.",
                  "AFTER triggers cannot modify the row but are ideal for side effects: audit logs, notifications, cache updates.",
                  "Use to_jsonb(OLD) and to_jsonb(NEW) for generic audit logs — works for any table without column-specific code.",
                  "TG_TABLE_NAME, TG_OP, and TG_WHEN are special trigger variables — use them for reusable trigger functions."
        ],
        mistake: "Putting heavy business logic in triggers — triggers are invisible to application developers and hard to debug. Use them for simple invariants (audit, timestamps, validation). Complex business logic belongs in stored procedures or application code.",
        shorthand: {
          verbose: "-- Application must remember to update timestamp:\n-- UPDATE orders SET updated_at = NOW() WHERE id = 1\n-- (Easy to forget!)",
          concise: "CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders\nFOR EACH ROW EXECUTE FUNCTION update_modified_at();\n-- Automatically sets updated_at = NOW() on every UPDATE",
        },
      },
      {
        id: "sql-debug-output",
        fn: "Debug Output — RAISE NOTICE, PRINT, SELECT",
        desc: "Emit messages and debug values from SQL scripts and stored procedures.",
        category: "SQL Dev Tools",
        subtitle: "RAISE NOTICE (PostgreSQL), PRINT (T-SQL), SELECT for output",
        signature: "RAISE NOTICE 'msg: %', val;  |  PRINT 'msg'  |  SELECT 'debug' AS label, val",
        descLong: "SQL lacks a print() function in the traditional sense — output depends on the dialect. PostgreSQL uses RAISE (NOTICE/WARNING/EXCEPTION) inside PL/pgSQL. T-SQL (SQL Server) uses PRINT. Standard SQL just uses SELECT, which returns a result set. All three are useful for debugging stored procedures and migrations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Debug Output — RAISE NOTICE, PRINT, SELECT — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── PostgreSQL: RAISE ─────────────────────────────────\n-- RAISE levels: DEBUG, LOG, INFO, NOTICE, WARNING, EXCEPTION\n-- NOTICE and above are shown to the client by default\n\nDO $$\nDECLARE\n  v_count INTEGER;\n  v_name  TEXT := 'Alice';\nBEGIN\n  SELECT COUNT(*) INTO v_count FROM users;\n\n  RAISE NOTICE 'Row count: %', v_count;\n  RAISE NOTICE 'Processing user: % at %', v_name, NOW();\n  RAISE WARNING 'Table is large: % rows', v_count;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Debug Output — RAISE NOTICE, PRINT, SELECT — common patterns you'll see in production.\n-- APPROACH  - Combine Debug Output — RAISE NOTICE, PRINT, SELECT with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- RAISE EXCEPTION stops execution (like a throw):\n  IF v_count = 0 THEN\n    RAISE EXCEPTION 'users table is empty — migration cannot proceed';\n  END IF;\n\n  RAISE NOTICE 'Done.';\nEND;\n$$;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Debug Output — RAISE NOTICE, PRINT, SELECT — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- RAISE with named parameters (PostgreSQL 14+):,RAISE NOTICE 'user=% role=%', v_name, v_role,  USING HINT = 'check the users table';,\n\n-- ── T-SQL (SQL Server): PRINT ──────────────────────────,DECLARE @count INT = (SELECT COUNT(*) FROM users);,PRINT 'Row count: ' + CAST(@count AS VARCHAR);,PRINT 'Running migration at: ' + CONVERT(VARCHAR, GETDATE(), 120);,\n\n-- RAISERROR for formatted output:,RAISERROR('Processing batch %d of %d', 0, 1, @batch, @total);,-- severity 0-10 = informational, 11+ = errors,\n\n-- ── Standard SQL: SELECT as output ────────────────────,-- Works in any dialect — handy for inspecting values mid-script,SELECT 'checkpoint' AS label, COUNT(*) AS row_count FROM users;,SELECT NOW() AS current_time, current_user AS running_as;,\n\n-- Debug a calculation inline:,SELECT,  order_id,,  unit_price * quantity                     AS line_total,,  unit_price * quantity * (1 - discount)   AS discounted_total,,  'debug'                                   AS _note,FROM order_items,WHERE order_id = 42;"
                  }
        ],
        tips: [
                  "In PostgreSQL, RAISE NOTICE is the go-to for procedure debugging — messages appear in psql and pg_admin output panes in real time.",
                  "RAISE EXCEPTION rolls back the current transaction — use it to abort a migration if a precondition fails.",
                  "In T-SQL, PRINT only flushes to the client at statement boundaries — inside a long loop it may buffer. Use RAISERROR(...) WITH NOWAIT to force immediate output.",
                  "SELECT debugging works in any SQL dialect and is safe in read-only connections — useful for inspecting computed values without side effects."
        ],
        mistake: "Using RAISE NOTICE inside a function that returns a result set — the NOTICE messages and the result set arrive at the client separately. In ORMs/drivers the notices are often silently swallowed; check your driver's notice handler (e.g. node-postgres: client.on('notice', fn)).",
        shorthand: {
          verbose: "// Manual / verbose approach\n-- Manual value inspection\nSELECT id, amount FROM orders WHERE id = 42;\n// More explicit but longer",
          concise: "-- Inline with label\nSELECT 42 AS order_id, amount, 'debug' AS _check FROM orders WHERE id = 42;",
        },
      },
      {
        id: "plpgsql-basics",
        fn: "PL/pgSQL Basics — Procedures & Functions",
        desc: "Create PL/pgSQL procedures and functions with DECLARE, control flow, and RETURN.",
        category: "PostgreSQL",
        subtitle: "CREATE OR REPLACE FUNCTION, $$, DECLARE, RETURN, LANGUAGE plpgsql",
        signature: "CREATE OR REPLACE FUNCTION name(param TYPE) RETURNS type LANGUAGE plpgsql AS $$ ... END; $$",
        descLong: "PL/pgSQL is PostgreSQL's procedural language for functions and stored procedures. Functions defined with CREATE OR REPLACE FUNCTION must declare parameters, return type, and use $$ delimiters. DECLARE block defines local variables. Control flow uses IF/ELSIF/ELSE, CASE, loops. RETURN or RETURN QUERY returns values. Functions can return scalars, tables, or sets. STABLE and IMMUTABLE hints help the optimizer.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of PL/pgSQL Basics — Procedures & Functions — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Simple function returning scalar ────────────────\nCREATE OR REPLACE FUNCTION get_user_age(user_id INT)\nRETURNS INT\nLANGUAGE plpgsql\nSTABLE\nAS $$\nDECLARE\n    birth_date DATE;\nBEGIN\n    SELECT date_of_birth INTO birth_date\n    FROM users WHERE id = user_id;\n\n    RETURN DATE_PART('year', AGE(birth_date))::INT;\nEND;\n$$;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of PL/pgSQL Basics — Procedures & Functions — common patterns you'll see in production.\n-- APPROACH  - Combine PL/pgSQL Basics — Procedures & Functions with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Use in queries\nSELECT id, name, get_user_age(id) AS age FROM users;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of PL/pgSQL Basics — Procedures & Functions — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Function with multiple parameters and variables ──,CREATE OR REPLACE FUNCTION calculate_discount(,    base_price DECIMAL,,    quantity INT,),RETURNS DECIMAL,LANGUAGE plpgsql,IMMUTABLE,AS $$,DECLARE,    discount_rate DECIMAL;,    final_price DECIMAL;,BEGIN,    discount_rate := CASE,        WHEN quantity >= 100 THEN 0.20,        WHEN quantity >= 50 THEN 0.15,        WHEN quantity >= 10 THEN 0.10,        ELSE 0.00,    END;,,    final_price := base_price * (1 - discount_rate);,    RETURN final_price;,END;,$$;,\n\n-- ── RETURNS TABLE (table-returning function) ────────,CREATE OR REPLACE FUNCTION get_user_orders(user_id INT),RETURNS TABLE(order_id BIGINT, amount DECIMAL, order_date DATE),LANGUAGE plpgsql,STABLE,AS $$,BEGIN,    RETURN QUERY,    SELECT o.id, o.amount, DATE(o.created_at),    FROM orders o,    WHERE o.user_id = get_user_orders.user_id,    ORDER BY o.created_at DESC;,END;,$$;,,SELECT * FROM get_user_orders(42);"
                  }
        ],
        tips: [
                  "Use $$....$$ delimiters instead of quotes — easier to embed SQL without escaping.",
                  "Mark functions as STABLE (no side effects, same output for same input) or IMMUTABLE (truly constant) — optimizer can cache results.",
                  "INTO clause in SELECT ... INTO var — captures a single value from a query.",
                  "DECLARE block at top; BEGIN/END wrap executable code; RETURN at end."
        ],
        mistake: "Not declaring variables before use — PL/pgSQL requires all variables in DECLARE block. Typos in variable names become NULL, not errors.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Simple function returning scalar ────────────────\nCREATE OR REPLACE FUNCTION get_user_age(user_id INT)\nRETURNS INT\nLANGUAGE plpgsql\nSTABLE\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM get_user_orders(42);",
        },
      },
      {
        id: "plpgsql-control-flow",
        fn: "PL/pgSQL Control Flow",
        desc: "Control flow in PL/pgSQL: IF/ELSIF/ELSE, CASE, LOOP, WHILE, FOR, EXIT WHEN.",
        category: "PostgreSQL",
        subtitle: "IF/ELSIF/ELSE, CASE, LOOP, WHILE, FOR, EXIT WHEN, conditionals, iteration",
        signature: "IF condition THEN ... ELSIF ... ELSE ... END IF;  |  LOOP ... EXIT WHEN; END LOOP;",
        descLong: "PL/pgSQL control structures mimic imperative programming. IF/ELSIF/ELSE test conditions. CASE matches values or conditions. LOOP, WHILE, and FOR enable iteration. EXIT or EXIT WHEN breaks out of loops. FOR loops can iterate over result sets or numeric ranges. These enable complex logic server-side.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of PL/pgSQL Control Flow — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── IF/ELSIF/ELSE ────────────────────────────────\nCREATE OR REPLACE FUNCTION grade_user(score INT)\nRETURNS TEXT\nLANGUAGE plpgsql IMMUTABLE\nAS $$\nBEGIN\n    IF score >= 90 THEN\n        RETURN 'A';\n    ELSIF score >= 80 THEN\n        RETURN 'B';\n    ELSIF score >= 70 THEN\n        RETURN 'C';\n    ELSE\n        RETURN 'F';\n    END IF;\nEND;\n$$;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of PL/pgSQL Control Flow — common patterns you'll see in production.\n-- APPROACH  - Combine PL/pgSQL Control Flow with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── CASE statement ─────────────────────────────────\nCREATE OR REPLACE FUNCTION get_priority(severity TEXT)\nRETURNS INT\nLANGUAGE plpgsql IMMUTABLE\nAS $$\nBEGIN\n    RETURN CASE severity\n        WHEN 'critical' THEN 1\n        WHEN 'high' THEN 2\n        WHEN 'medium' THEN 3\n        WHEN 'low' THEN 4\n        ELSE 5\n    END;\nEND;\n$$;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of PL/pgSQL Control Flow — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── WHILE loop ─────────────────────────────────────,CREATE OR REPLACE FUNCTION sum_until_large(num INT),RETURNS INT,LANGUAGE plpgsql IMMUTABLE,AS $$,DECLARE,    total INT := 0;,    i INT := 1;,BEGIN,    WHILE i <= num LOOP,        total := total + i;,        i := i + 1;,    END LOOP;,    RETURN total;,END;,$$;,\n\n-- ── FOR loop over numeric range ────────────────────,CREATE OR REPLACE FUNCTION batch_process_users(user_limit INT),RETURNS TABLE(user_id INT, processed_at TIMESTAMP),LANGUAGE plpgsql,AS $$,DECLARE,    processed INT := 0;,BEGIN,    FOR processed IN 1..user_limit LOOP,        RETURN QUERY,        SELECT id, NOW(),        FROM users,        LIMIT 1 OFFSET processed - 1;,    END LOOP;,END;,$$;,\n\n-- ── FOR loop over result set ────────────────────────,CREATE OR REPLACE FUNCTION process_orders(),RETURNS TABLE(order_id BIGINT, status TEXT),LANGUAGE plpgsql,AS $$,DECLARE,    order_rec RECORD;,BEGIN,    FOR order_rec IN (SELECT id, status FROM orders WHERE status = 'pending'),    LOOP,        -- Process each order,        UPDATE orders SET status = 'processing' WHERE id = order_rec.id;,        RETURN QUERY SELECT order_rec.id, 'processing'::TEXT;,    END LOOP;,END;,$$;,\n\n-- ── EXIT WHEN (break from loop) ────────────────────,CREATE OR REPLACE FUNCTION find_first_odd(numbers INT[]),RETURNS INT,LANGUAGE plpgsql IMMUTABLE,AS $$,DECLARE,    i INT := 1;,BEGIN,    LOOP,        IF i > ARRAY_LENGTH(numbers, 1) THEN,            RETURN NULL;,        END IF;,        IF numbers[i] % 2 = 1 THEN,            RETURN numbers[i];,        END IF;,        i := i + 1;,    END LOOP;,END;,$$;"
                  }
        ],
        tips: [
                  "IF/ELSIF chains are checked top-to-bottom — order conditions by probability (frequent cases first).",
                  "FOR loops over result sets use RECORD type — access columns as order_rec.column_name.",
                  "EXIT or EXIT WHEN breaks out of LOOP — use for early exit conditions.",
                  "Variable assignment uses := (not =) — := is PL/pgSQL assignment, = is SQL comparison."
        ],
        mistake: "Using = for assignment instead of := — SQL assigns, PL/pgSQL must use :=. This is a very common mistake.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── IF/ELSIF/ELSE ────────────────────────────────\nCREATE OR REPLACE FUNCTION grade_user(score INT)\nRETURNS TEXT\nLANGUAGE plpgsql IMMUTABLE\nAS $$\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n$$;",
        },
      },
      {
        id: "plpgsql-cursors",
        fn: "Cursors in PL/pgSQL",
        desc: "Declare and iterate cursors: OPEN, FETCH, CLOSE for row-by-row processing.",
        category: "PostgreSQL",
        subtitle: "DECLARE CURSOR FOR, OPEN, FETCH, CLOSE, cursor loops, scrollable cursors",
        signature: "DECLARE cur CURSOR FOR SELECT ...;  OPEN cur;  FETCH FROM cur INTO var;  CLOSE cur;",
        descLong: "Cursors allow row-by-row processing in PL/pgSQL. DECLARE CURSOR defines a cursor on a query. OPEN executes it, FETCH retrieves rows one at a time, CLOSE releases it. Useful for complex per-row logic, especially when later rows depend on earlier processing. Most loops can be rewritten as FOREACH over arrays (simpler), but cursors are necessary for database-driven iteration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Cursors in PL/pgSQL — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Simple cursor loop ─────────────────────────────\nCREATE OR REPLACE FUNCTION process_all_orders()\nRETURNS TABLE(order_id BIGINT, new_status TEXT)\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    order_cur CURSOR FOR SELECT id, amount FROM orders WHERE status = 'pending';\n    order_rec RECORD;\nBEGIN\n    OPEN order_cur;\n    LOOP\n        FETCH order_cur INTO order_rec;\n        EXIT WHEN NOT FOUND;  -- no more rows"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Cursors in PL/pgSQL — common patterns you'll see in production.\n-- APPROACH  - Combine Cursors in PL/pgSQL with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Process the order\n        UPDATE orders SET status = 'processing' WHERE id = order_rec.id;\n        RETURN QUERY SELECT order_rec.id, 'processing'::TEXT;\n    END LOOP;\n    CLOSE order_cur;\nEND;\n$$;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Cursors in PL/pgSQL — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Cursor with parameters ─────────────────────────,CREATE OR REPLACE FUNCTION get_orders_for_user(p_user_id INT),RETURNS TABLE(order_id BIGINT, total DECIMAL, created_at TIMESTAMP),LANGUAGE plpgsql STABLE,AS $$,DECLARE,    order_cur CURSOR(uid INT) FOR,        SELECT id, SUM(amount), created_at,        FROM orders,        WHERE user_id = uid,        GROUP BY id, created_at;,    order_rec RECORD;,BEGIN,    OPEN order_cur(p_user_id);,    LOOP,        FETCH order_cur INTO order_rec;,        EXIT WHEN NOT FOUND;,        RETURN QUERY SELECT order_rec.id, order_rec.sum, order_rec.created_at;,    END LOOP;,    CLOSE order_cur;,END;,$$;,\n\n-- ── Scrollable cursor (can move backward) ──────────,CREATE OR REPLACE FUNCTION get_middle_records(total_count INT),RETURNS TABLE(record_value TEXT),LANGUAGE plpgsql,AS $$,DECLARE,    cur CURSOR SCROLL FOR SELECT * FROM big_table;,    rec RECORD;,BEGIN,    OPEN cur;,    -- Move to middle of results,    MOVE FORWARD (total_count / 2) FROM cur;,    LOOP,        FETCH cur INTO rec;,        EXIT WHEN NOT FOUND;,        RETURN QUERY SELECT rec.value::TEXT;,    END LOOP;,    CLOSE cur;,END;,$$;"
                  }
        ],
        tips: [
                  "FETCH ... INTO var with EXIT WHEN NOT FOUND is the standard cursor loop pattern.",
                  "Cursors can have parameters (CURSOR(param TYPE) FOR ...) — pass values at OPEN time.",
                  "SCROLL allows MOVE FORWARD/BACKWARD — useful for dataset scanning, but slower than array iteration.",
                  "FOR ... IN SELECT ... is simpler than explicit DECLARE/OPEN/FETCH/CLOSE for most cases."
        ],
        mistake: "Forgetting CLOSE after cursor usage — unclosed cursors consume server resources. Always CLOSE in a finally-like block.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Simple cursor loop ─────────────────────────────\nCREATE OR REPLACE FUNCTION process_all_orders()\nRETURNS TABLE(order_id BIGINT, new_status TEXT)\nLANGUAGE plpgsql\nAS $$\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n$$;",
        },
      },
      {
        id: "plpgsql-exceptions",
        fn: "Exception Handling in PL/pgSQL",
        desc: "Catch and handle exceptions: BEGIN...EXCEPTION WHEN, RAISE, SQLSTATE.",
        category: "PostgreSQL",
        subtitle: "BEGIN/EXCEPTION, RAISE, SQLSTATE, error codes, graceful error handling, recovery",
        signature: "BEGIN ... EXCEPTION WHEN error_type THEN ... END;  |  RAISE EXCEPTION 'message' USING ERRCODE",
        descLong: "PL/pgSQL exceptions are caught with BEGIN...EXCEPTION blocks. WHEN clause matches error types (SQLSTATE codes, exception names like unique_violation). RAISE throws exceptions with optional ERRCODE, DETAIL, HINT. Handle exceptions to recover gracefully, log errors, or re-raise with additional context. Division by zero, foreign key violations, unique constraint violations all have standard SQLSTATE codes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Exception Handling in PL/pgSQL — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Basic exception handling ──────────────────────\nCREATE OR REPLACE FUNCTION transfer_safe(from_id INT, to_id INT, amount DECIMAL)\nRETURNS TEXT\nLANGUAGE plpgsql\nAS $$\nDECLARE\n    from_balance DECIMAL;\n    to_balance DECIMAL;\nBEGIN\n    SELECT balance INTO from_balance FROM accounts WHERE id = from_id;\n    IF from_balance IS NULL THEN\n        RAISE EXCEPTION 'Sender account % not found', from_id;\n    END IF;\n\n    IF from_balance < amount THEN\n        RAISE EXCEPTION 'Insufficient funds: balance=%, needed=%', from_balance, amount;\n    END IF;\n\n    UPDATE accounts SET balance = balance - amount WHERE id = from_id;\n    UPDATE accounts SET balance = balance + amount WHERE id = to_id;\n\n    RETURN 'Transfer successful';\n\nEXCEPTION\n    WHEN OTHERS THEN\n        ROLLBACK;\n        RAISE NOTICE 'Transfer failed: %', SQLERRM;\n        RETURN 'Transfer failed: ' || SQLERRM;\nEND;\n$$;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Exception Handling in PL/pgSQL — common patterns you'll see in production.\n-- APPROACH  - Combine Exception Handling in PL/pgSQL with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Catch specific error codes ──────────────────────\nCREATE OR REPLACE FUNCTION insert_unique_user(name TEXT, email TEXT)\nRETURNS TEXT\nLANGUAGE plpgsql\nAS $$\nBEGIN\n    INSERT INTO users (name, email) VALUES (name, email);\n    RETURN 'User created';\n\nEXCEPTION\n    WHEN unique_violation THEN\n        -- SQLSTATE 23505: unique constraint violation\n        RAISE NOTICE 'Email % already exists', email;\n        RETURN 'Email already registered';\n    WHEN foreign_key_violation THEN\n        -- SQLSTATE 23503: foreign key violation\n        RAISE NOTICE 'Invalid reference';\n        RETURN 'Invalid department';\n    WHEN OTHERS THEN\n        RAISE NOTICE 'Unexpected error: %', SQLERRM;\n        RETURN 'An error occurred';\nEND;\n$$;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Exception Handling in PL/pgSQL — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Re-raise with additional context ────────────────,CREATE OR REPLACE FUNCTION process_with_retry(),RETURNS TEXT,LANGUAGE plpgsql,AS $$,BEGIN,    PERFORM risky_operation();,    RETURN 'Success';,,EXCEPTION,    WHEN division_by_zero THEN,        RAISE EXCEPTION 'Invalid calculation: %', SQLERRM,        USING ERRCODE = '22012',,              DETAIL = 'Attempted to divide by zero',,              HINT = 'Check input values';,    WHEN OTHERS THEN,        -- Log and re-raise,        INSERT INTO error_log (error_code, error_message) VALUES (SQLSTATE, SQLERRM);,        RAISE;  -- re-raise the original exception,END;,$$;"
                  }
        ],
        tips: [
                  "WHEN OTHERS catches all exceptions — use specific WHEN clauses first, then OTHERS as fallback.",
                  "RAISE EXCEPTION stops execution and rolls back — RAISE NOTICE is non-fatal logging.",
                  "SQLSTATE is the 5-character error code (e.g., 23505 for unique_violation) — use exception names (unique_violation) which are more readable.",
                  "SQLERRM gives the error message text — use in error logging and user messages."
        ],
        mistake: "Catching all exceptions without logging — errors disappear silently. Log exceptions to an audit table before raising.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Basic exception handling ──────────────────────\nCREATE OR REPLACE FUNCTION transfer_safe(from_id INT, to_id INT, amount DECIMAL)\nRETURNS TEXT\nLANGUAGE plpgsql\nAS $$\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n$$;",
        },
      },
      {
        id: "plpgsql-triggers",
        fn: "Trigger Functions in PL/pgSQL",
        desc: "Create trigger functions that respond to INSERT, UPDATE, DELETE: TG_OP, NEW, OLD.",
        category: "PostgreSQL",
        subtitle: "TRIGGER, BEFORE/AFTER, NEW/OLD, FOR EACH ROW, TG_OP, TG_TABLE_NAME, prevent action",
        signature: "CREATE OR REPLACE FUNCTION fn() RETURNS TRIGGER ... TG_OP, NEW, OLD, RETURN NEW|OLD|NULL",
        descLong: "Trigger functions return TRIGGER and receive special variables: NEW (row being inserted/updated), OLD (row before update/delete), TG_OP ('INSERT', 'UPDATE', 'DELETE'), TG_TABLE_NAME. BEFORE triggers can modify NEW or prevent action (RETURN NULL). AFTER triggers cannot modify but can cascade changes. FOR EACH ROW fires per row; FOR EACH STATEMENT fires once.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Trigger Functions in PL/pgSQL — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── BEFORE trigger: validate and auto-populate ──────\nCREATE OR REPLACE FUNCTION validate_and_populate_order()\nRETURNS TRIGGER\nLANGUAGE plpgsql\nAS $$\nBEGIN\n    -- Validate amount\n    IF NEW.amount <= 0 THEN\n        RAISE EXCEPTION 'Order amount must be positive';\n    END IF;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Trigger Functions in PL/pgSQL — common patterns you'll see in production.\n-- APPROACH  - Combine Trigger Functions in PL/pgSQL with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Auto-populate total if not set\n    IF NEW.total IS NULL THEN\n        NEW.total := NEW.amount * NEW.quantity;\n    END IF;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Trigger Functions in PL/pgSQL — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Auto-set created_at if not provided,    IF NEW.created_at IS NULL THEN,        NEW.created_at := NOW();,    END IF;,,    RETURN NEW;  -- Allow the INSERT/UPDATE,END;,$$;,,CREATE TRIGGER before_order_insert,BEFORE INSERT ON orders,FOR EACH ROW,EXECUTE FUNCTION validate_and_populate_order();,\n\n-- ── AFTER trigger: cascading updates ────────────────,CREATE OR REPLACE FUNCTION update_customer_stats_after_order(),RETURNS TRIGGER,LANGUAGE plpgsql,AS $$,BEGIN,    UPDATE customers SET,        total_orders = (SELECT COUNT(*) FROM orders WHERE user_id = NEW.user_id),,        total_spent = (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE user_id = NEW.user_id),,        last_order_at = NOW(),    WHERE id = NEW.user_id;,,    RETURN NEW;  -- AFTER trigger return value is ignored, but required,END;,$$;,,CREATE TRIGGER after_order_insert,AFTER INSERT ON orders,FOR EACH ROW,EXECUTE FUNCTION update_customer_stats_after_order();,\n\n-- ── Trigger that prevents action (RETURN NULL) ──────,CREATE OR REPLACE FUNCTION prevent_delete_recent(),RETURNS TRIGGER,LANGUAGE plpgsql,AS $$,BEGIN,    IF OLD.created_at > NOW() - INTERVAL '7 days' THEN,        RAISE EXCEPTION 'Cannot delete orders from the last 7 days';,    END IF;,    RETURN OLD;  -- Allow the DELETE,END;,$$;,,CREATE TRIGGER no_delete_recent_orders,BEFORE DELETE ON orders,FOR EACH ROW,EXECUTE FUNCTION prevent_delete_recent();,\n\n-- ── Trigger detecting operation type ────────────────,CREATE OR REPLACE FUNCTION track_changes(),RETURNS TRIGGER,LANGUAGE plpgsql,AS $$,BEGIN,    IF TG_OP = 'INSERT' THEN,        INSERT INTO audit_log (table_name, operation, new_data),        VALUES (TG_TABLE_NAME, 'INSERT', to_jsonb(NEW));,        RETURN NEW;,    ELSIF TG_OP = 'UPDATE' THEN,        INSERT INTO audit_log (table_name, operation, old_data, new_data),        VALUES (TG_TABLE_NAME, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));,        RETURN NEW;,    ELSIF TG_OP = 'DELETE' THEN,        INSERT INTO audit_log (table_name, operation, old_data),        VALUES (TG_TABLE_NAME, 'DELETE', to_jsonb(OLD));,        RETURN OLD;,    END IF;,END;,$$;,,CREATE TRIGGER audit_all_changes,AFTER INSERT OR UPDATE OR DELETE ON orders,FOR EACH ROW,EXECUTE FUNCTION track_changes();"
                  }
        ],
        tips: [
                  "BEFORE triggers can modify NEW or prevent action (RETURN NULL) — use for validation and auto-population.",
                  "AFTER triggers cannot modify rows but can cascade updates — use for audit trails and computed columns.",
                  "TG_OP tells you which operation triggered the function — guard code paths with IF TG_OP = 'INSERT' THEN.",
                  "RETURN NEW for INSERT/UPDATE, RETURN OLD for DELETE, RETURN NULL to prevent action."
        ],
        mistake: "Modifying OLD in a trigger — OLD is read-only. Modify NEW in BEFORE triggers, not OLD.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── BEFORE trigger: validate and auto-populate ──────\nCREATE OR REPLACE FUNCTION validate_and_populate_order()\nRETURNS TRIGGER\nLANGUAGE plpgsql\nAS $$\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nEXECUTE FUNCTION track_changes();",
        },
      },
      {
        id: "plpgsql-dynamic-sql",
        fn: "Dynamic SQL in PL/pgSQL",
        desc: "Execute dynamic queries: EXECUTE format(...), parameterized queries, USING clause.",
        category: "PostgreSQL",
        subtitle: "EXECUTE, format(), USING, parameterized, dynamic table/column names, injection prevention",
        signature: "EXECUTE format('SELECT * FROM %I WHERE id = %L', table_name, id_val) USING id_val;",
        descLong: "Dynamic SQL allows building queries from variables. EXECUTE executes a string query. format() safely substitutes identifiers (%I for table/column names) and literals (%L for values). Always use format() to prevent SQL injection. USING clause passes parameters safely. Useful for generic functions, dynamic pivoting, and table management.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Dynamic SQL in PL/pgSQL — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Basic EXECUTE with format ──────────────────────\nCREATE OR REPLACE FUNCTION count_rows(table_name TEXT)\nRETURNS INT\nLANGUAGE plpgsql STABLE\nAS $$\nDECLARE\n    row_count INT;\nBEGIN\n    EXECUTE format('SELECT COUNT(*) FROM %I', table_name)\n    INTO row_count;\n    RETURN row_count;\nEND;\n$$;\n\nSELECT count_rows('users');\nSELECT count_rows('orders');"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Dynamic SQL in PL/pgSQL — common patterns you'll see in production.\n-- APPROACH  - Combine Dynamic SQL in PL/pgSQL with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Dynamic query with WHERE clause ────────────────\nCREATE OR REPLACE FUNCTION find_by_status(\n    table_name TEXT,\n    status_col TEXT,\n    status_val TEXT\n)\nRETURNS TABLE(id INT, found_data TEXT)\nLANGUAGE plpgsql STABLE\nAS $$\nBEGIN\n    RETURN QUERY\n    EXECUTE format('SELECT id, row_to_json(*)::TEXT FROM %I WHERE %I = %L',\n                   table_name, status_col, status_val);\nEND;\n$$;\n\nSELECT * FROM find_by_status('orders', 'status', 'pending');"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Dynamic SQL in PL/pgSQL — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── USING clause for safe parameterization ───────────,CREATE OR REPLACE FUNCTION get_value(,    table_name TEXT,,    col_name TEXT,,    search_value TEXT,),RETURNS TEXT,LANGUAGE plpgsql STABLE,AS $$,DECLARE,    result TEXT;,BEGIN,    EXECUTE format('SELECT %I FROM %I WHERE id = $1', col_name, table_name),    INTO result,    USING search_value;,    RETURN result;,END;,$$;,\n\n-- ── Dynamic column list ────────────────────────────,CREATE OR REPLACE FUNCTION select_columns(,    table_name TEXT,,    cols TEXT[],),RETURNS TABLE(result RECORD),LANGUAGE plpgsql STABLE,AS $$,DECLARE,    col_list TEXT;,BEGIN,    col_list := array_to_string(cols, ', ');,    RETURN QUERY,    EXECUTE format('SELECT %s FROM %I', col_list, table_name);,END;,$$;,\n\n-- ── Dynamic table creation ─────────────────────────,CREATE OR REPLACE FUNCTION create_log_table(table_name TEXT),RETURNS void,LANGUAGE plpgsql,AS $$,BEGIN,    EXECUTE format(,        'CREATE TABLE IF NOT EXISTS %I (,            id SERIAL PRIMARY KEY,,            event TEXT,,            created_at TIMESTAMP DEFAULT NOW(),        )',,        table_name,    );,END;,$$;,,SELECT create_log_table('app_events');"
                  }
        ],
        tips: [
                  "Always use format() with %I for identifiers (table/column names) and %L for literal values — prevents SQL injection.",
                  "USING clause in EXECUTE provides parameterization — $1, $2 in the query refer to USING values.",
                  "Dynamic queries cannot be pre-planned — they have overhead. Use only when necessary (generic functions, DDL).",
                  "Test format() output manually before EXECUTE — check it produces valid SQL."
        ],
        mistake: "String concatenation ('SELECT * FROM ' || table_name) instead of format() — opens SQL injection vulnerability.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Basic EXECUTE with format ──────────────────────\nCREATE OR REPLACE FUNCTION count_rows(table_name TEXT)\nRETURNS INT\nLANGUAGE plpgsql STABLE\nAS $$\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT create_log_table('app_events');",
        },
      },
      {
        id: "tsql-procedure",
        fn: "T-SQL Stored Procedures (SQL Server)",
        desc: "Create SQL Server procedures: @parameters, OUTPUT, control flow, transactions.",
        category: "SQL Server",
        subtitle: "CREATE PROCEDURE, @param, OUTPUT, EXEC, return value, variable declaration",
        signature: "CREATE PROCEDURE name @param TYPE [OUTPUT] AS BEGIN ... END;  EXEC name @param=value",
        descLong: "SQL Server T-SQL procedures use @ for variables. Parameters are @name TYPE, optionally OUTPUT for return. BEGIN...END wraps logic. DECLARE @var TYPE defines local variables. Procedures return an integer status code (0 = success, non-zero = error). Can modify data with INSERT/UPDATE/DELETE and return result sets with SELECT. Transactions are explicit with BEGIN TRANSACTION, COMMIT, ROLLBACK.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of T-SQL Stored Procedures (SQL Server) — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Basic procedure with parameters ───────────────\nCREATE PROCEDURE transfer_funds\n    @FromAccountId INT,\n    @ToAccountId INT,\n    @Amount DECIMAL\nAS\nBEGIN\n    BEGIN TRANSACTION;\n    BEGIN TRY\n        UPDATE Accounts\n        SET Balance = Balance - @Amount\n        WHERE AccountId = @FromAccountId;\n\n        UPDATE Accounts\n        SET Balance = Balance + @Amount\n        WHERE AccountId = @ToAccountId;\n\n        COMMIT TRANSACTION;\n        RETURN 0;  -- Success\n    END TRY\n    BEGIN CATCH\n        ROLLBACK TRANSACTION;\n        RETURN 1;  -- Failure\n    END CATCH\nEND;\n\nEXEC transfer_funds @FromAccountId=1, @ToAccountId=2, @Amount=500.00;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of T-SQL Stored Procedures (SQL Server) — common patterns you'll see in production.\n-- APPROACH  - Combine T-SQL Stored Procedures (SQL Server) with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Procedure with OUTPUT parameter ────────────────\nCREATE PROCEDURE get_customer_summary\n    @CustomerId INT,\n    @OrderCount INT OUTPUT,\n    @TotalSpent DECIMAL OUTPUT\nAS\nBEGIN\n    SELECT @OrderCount = COUNT(*), @TotalSpent = SUM(Amount)\n    FROM Orders\n    WHERE CustomerId = @CustomerId;\nEND;\n\nDECLARE @orders INT, @spent DECIMAL;\nEXEC get_customer_summary @CustomerId=5, @OrderCount=@orders OUTPUT, @TotalSpent=@spent OUTPUT;\nSELECT @orders AS OrderCount, @spent AS TotalSpent;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of T-SQL Stored Procedures (SQL Server) — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Procedure returning a result set ────────────────,CREATE PROCEDURE get_recent_orders,    @Days INT = 30,AS,BEGIN,    SELECT OrderId, CustomerId, Amount, OrderDate,    FROM Orders,    WHERE OrderDate >= DATEADD(DAY, -@Days, GETDATE()),    ORDER BY OrderDate DESC;,END;,,EXEC get_recent_orders;,EXEC get_recent_orders @Days = 60;,\n\n-- ── Procedure with control flow ────────────────────,CREATE PROCEDURE process_orders,    @Status VARCHAR(50) = 'pending',AS,BEGIN,    DECLARE @ProcessedCount INT = 0;,,    IF NOT EXISTS (SELECT 1 FROM Orders WHERE Status = @Status),    BEGIN,        PRINT 'No orders found with status: ' + @Status;,        RETURN;,    END,,    UPDATE Orders SET Status = 'processing' WHERE Status = @Status;,    SET @ProcessedCount = @@ROWCOUNT;,,    PRINT 'Processed ' + CAST(@ProcessedCount AS VARCHAR) + ' orders';,    RETURN 0;,END;"
                  }
        ],
        tips: [
                  "@@ variables are system variables (@@ROWCOUNT = rows affected by last statement).",
                  "RETURN returns an integer status code (0 = success) — not used to return data.",
                  "OUTPUT parameters are passed by reference — declare @var, pass @var OUTPUT to procedure.",
                  "Transactions are explicit with BEGIN TRANSACTION, COMMIT, ROLLBACK."
        ],
        mistake: "Returning data with RETURN @value — RETURN only returns integers. Use OUTPUT parameters or SELECT to return data.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Basic procedure with parameters ───────────────\nCREATE PROCEDURE transfer_funds\n    @FromAccountId INT,\n    @ToAccountId INT,\n    @Amount DECIMAL\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nEND;",
        },
      },
      {
        id: "tsql-try-catch",
        fn: "T-SQL TRY...CATCH Error Handling",
        desc: "Handle errors in SQL Server: TRY...CATCH, ERROR_MESSAGE(), RAISERROR, THROW.",
        category: "SQL Server",
        subtitle: "BEGIN TRY/CATCH, ERROR_MESSAGE, ERROR_NUMBER, RAISERROR, THROW, transaction rollback",
        signature: "BEGIN TRY ... END TRY BEGIN CATCH ... END CATCH;  RAISERROR(msg, severity, state)  THROW",
        descLong: "SQL Server uses TRY...CATCH for exception handling. In CATCH block, ERROR_NUMBER(), ERROR_MESSAGE(), ERROR_SEVERITY() provide details. RAISERROR raises an error with custom message and severity level. THROW re-throws the current exception. Transactions roll back automatically on error if not caught.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of T-SQL TRY...CATCH Error Handling — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Basic TRY...CATCH ────────────────────────────\nCREATE PROCEDURE safe_transfer\n    @FromId INT,\n    @ToId INT,\n    @Amount DECIMAL\nAS\nBEGIN\n    BEGIN TRY\n        BEGIN TRANSACTION;\n\n        UPDATE Accounts SET Balance = Balance - @Amount WHERE AccountId = @FromId;\n        UPDATE Accounts SET Balance = Balance + @Amount WHERE AccountId = @ToId;\n\n        COMMIT TRANSACTION;\n        RETURN 0;  -- Success\n    END TRY\n    BEGIN CATCH\n        ROLLBACK TRANSACTION;\n\n        DECLARE @ErrorMsg NVARCHAR(MAX) = ERROR_MESSAGE();\n        DECLARE @ErrorNum INT = ERROR_NUMBER();\n\n        RAISERROR('Transfer failed: %s', 16, 1, @ErrorMsg);\n        RETURN @ErrorNum;\n    END CATCH\nEND;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of T-SQL TRY...CATCH Error Handling — common patterns you'll see in production.\n-- APPROACH  - Combine T-SQL TRY...CATCH Error Handling with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Selective exception handling ───────────────────\nCREATE PROCEDURE insert_with_fallback\n    @Name NVARCHAR(100),\n    @Email NVARCHAR(100)\nAS\nBEGIN\n    BEGIN TRY\n        INSERT INTO Users (Name, Email) VALUES (@Name, @Email);\n    END TRY\n    BEGIN CATCH\n        IF ERROR_NUMBER() = 2627  -- Unique constraint violation\n        BEGIN\n            PRINT 'Email already exists: ' + @Email;\n            UPDATE Users SET Name = @Name WHERE Email = @Email;\n        END\n        ELSE\n        BEGIN\n            THROW;  -- Re-throw unexpected errors\n        END\n    END CATCH\nEND;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of T-SQL TRY...CATCH Error Handling — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Custom error with RAISERROR ────────────────────,CREATE PROCEDURE validate_order,    @OrderId INT,,    @Amount DECIMAL,AS,BEGIN,    BEGIN TRY,        IF @Amount <= 0,        BEGIN,            RAISERROR('Order amount must be positive', 16, 1);,        END,,        UPDATE Orders SET ProcessedFlag = 1 WHERE OrderId = @OrderId;,    END TRY,    BEGIN CATCH,        PRINT 'Error ' + CAST(ERROR_NUMBER() AS VARCHAR) + ': ' + ERROR_MESSAGE();,        THROW;  -- Re-throw to caller,    END CATCH,END;,\n\n-- ── Nested TRY...CATCH ────────────────────────────,CREATE PROCEDURE process_batch,AS,BEGIN,    DECLARE @BatchId INT = 1;,,    BEGIN TRY,        WHILE @BatchId <= 100,        BEGIN,            BEGIN TRY,                -- Process individual item,                EXEC process_order @BatchId;,                SET @BatchId = @BatchId + 1;,            END TRY,            BEGIN CATCH,                -- Log individual error, continue,                INSERT INTO ErrorLog (ItemId, ErrorMsg) VALUES (@BatchId, ERROR_MESSAGE());,                SET @BatchId = @BatchId + 1;,            END CATCH,        END,    END TRY,    BEGIN CATCH,        PRINT 'Batch failed completely: ' + ERROR_MESSAGE();,        THROW;,    END CATCH,END;"
                  }
        ],
        tips: [
                  "ERROR_NUMBER(), ERROR_MESSAGE(), ERROR_SEVERITY() provide exception details in CATCH block.",
                  "Severity 16+ causes RAISERROR to fail the batch; < 16 issues a warning.",
                  "THROW re-throws the current exception without changing it; RAISERROR generates a new one.",
                  "Transaction rollback is automatic on uncaught errors; catch explicitly to control rollback behavior."
        ],
        mistake: "Catching all exceptions and logging silently — the caller never knows an error occurred. THROW or RAISERROR to notify.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Basic TRY...CATCH ────────────────────────────\nCREATE PROCEDURE safe_transfer\n    @FromId INT,\n    @ToId INT,\n    @Amount DECIMAL\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nEND;",
        },
      },
      {
        id: "tsql-cursor",
        fn: "T-SQL Cursors (SQL Server)",
        desc: "Row-by-row iteration in T-SQL: DECLARE CURSOR, FETCH, WHILE @@FETCH_STATUS.",
        category: "SQL Server",
        subtitle: "DECLARE CURSOR FOR, OPEN, FETCH NEXT INTO, WHILE @@FETCH_STATUS, CLOSE, DEALLOCATE",
        signature: "DECLARE cur CURSOR FOR SELECT ...;  OPEN cur;  FETCH NEXT FROM cur INTO @var;  WHILE @@FETCH_STATUS = 0",
        descLong: "T-SQL cursors declare a cursor on a query, open it, then fetch rows one at a time. @@FETCH_STATUS = 0 means success, non-zero means no row or error. Most loops can be rewritten as set operations (INSERT/UPDATE with JOIN), which are faster. Cursors are a last resort for complex per-row logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of T-SQL Cursors (SQL Server) — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Standard cursor loop ──────────────────────────\nCREATE PROCEDURE process_all_orders\nAS\nBEGIN\n    DECLARE order_cursor CURSOR FOR\n    SELECT OrderId, Amount, CustomerId\n    FROM Orders\n    WHERE Status = 'pending';\n\n    DECLARE @OrderId INT, @Amount DECIMAL, @CustomerId INT;\n\n    OPEN order_cursor;\n\n    FETCH NEXT FROM order_cursor INTO @OrderId, @Amount, @CustomerId;\n\n    WHILE @@FETCH_STATUS = 0\n    BEGIN\n        -- Process each order\n        UPDATE Customers\n        SET TotalSpent = TotalSpent + @Amount\n        WHERE CustomerId = @CustomerId;\n\n        UPDATE Orders SET Status = 'processed' WHERE OrderId = @OrderId;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of T-SQL Cursors (SQL Server) — common patterns you'll see in production.\n-- APPROACH  - Combine T-SQL Cursors (SQL Server) with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Fetch next row\n        FETCH NEXT FROM order_cursor INTO @OrderId, @Amount, @CustomerId;\n    END\n\n    CLOSE order_cursor;\n    DEALLOCATE order_cursor;\nEND;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of T-SQL Cursors (SQL Server) — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Cursor with parameters ────────────────────────,CREATE PROCEDURE get_top_customers,    @MinSpent DECIMAL,AS,BEGIN,    DECLARE customer_cursor CURSOR FOR,    SELECT CustomerId, Name, TotalSpent,    FROM Customers,    WHERE TotalSpent >= @MinSpent,    ORDER BY TotalSpent DESC;,,    DECLARE @CustId INT, @CustName NVARCHAR(100), @Spent DECIMAL;,,    OPEN customer_cursor;,,    FETCH NEXT FROM customer_cursor INTO @CustId, @CustName, @Spent;,,    WHILE @@FETCH_STATUS = 0,    BEGIN,        PRINT @CustName + ' has spent $' + CAST(@Spent AS VARCHAR);,        FETCH NEXT FROM customer_cursor INTO @CustId, @CustName, @Spent;,    END,,    CLOSE customer_cursor;,    DEALLOCATE customer_cursor;,END;,\n\n-- ── Scrollable cursor (SCROLL option) ──────────────,CREATE PROCEDURE demonstrate_scrollable_cursor,AS,BEGIN,    DECLARE scroll_cursor CURSOR SCROLL FOR,    SELECT * FROM LargeTable;,,    OPEN scroll_cursor;,\n\n    -- Fetch first 10,    FETCH FIRST FROM scroll_cursor;,\n\n    -- Fetch relative,    FETCH RELATIVE 5 FROM scroll_cursor;,\n\n    -- Fetch absolute,    FETCH ABSOLUTE 100 FROM scroll_cursor;,\n\n    -- Fetch backward,    FETCH PRIOR FROM scroll_cursor;,,    CLOSE scroll_cursor;,    DEALLOCATE scroll_cursor;,END;"
                  }
        ],
        tips: [
                  "WHILE @@FETCH_STATUS = 0 is the standard loop — @@FETCH_STATUS != 0 means no more rows.",
                  "CLOSE frees cursor resources; DEALLOCATE removes it entirely — both are good practice.",
                  "Cursors are slow for large datasets — rewrite as set operations (INSERT/SELECT, UPDATE/JOIN) when possible.",
                  "SCROLL allows FETCH FIRST, FETCH PRIOR, FETCH ABSOLUTE — regular cursors only FETCH NEXT."
        ],
        mistake: "Leaving cursors open without CLOSE/DEALLOCATE — wastes server resources. Always clean up.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Standard cursor loop ──────────────────────────\nCREATE PROCEDURE process_all_orders\nAS\nBEGIN\n    DECLARE order_cursor CURSOR FOR\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nEND;",
        },
      },
      {
        id: "views-advanced",
        fn: "Views — Indexed, Updatable & Materialized",
        desc: "Create views: updatable views, WITH CHECK OPTION, indexed views, and materialized views.",
        category: "Views",
        subtitle: "CREATE VIEW, INSTEAD OF triggers, WITH CHECK OPTION, indexed views, materialized views, refresh",
        signature: "CREATE VIEW name AS SELECT ...;  CREATE MATERIALIZED VIEW name AS SELECT ...;  WITH CHECK OPTION",
        descLong: "Views are named queries that act like tables. Regular views are dynamic (query runs each time). Updatable views allow INSERT/UPDATE/DELETE if they meet conditions (single table, simple filter). WITH CHECK OPTION prevents updates that would violate the view's filter. SQL Server indexed views are materialized. PostgreSQL MATERIALIZED VIEWs store results, refreshed manually. INSTEAD OF triggers on views enable updates on otherwise non-updatable views.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Views — Indexed, Updatable & Materialized — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Simple read-only view ─────────────────────────\nCREATE VIEW active_customers AS\nSELECT id, name, email, created_at\nFROM customers\nWHERE status = 'active'\nORDER BY created_at DESC;\n\nSELECT * FROM active_customers;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Views — Indexed, Updatable & Materialized — common patterns you'll see in production.\n-- APPROACH  - Combine Views — Indexed, Updatable & Materialized with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Updatable view (single table, simple filter) ────\nCREATE VIEW recent_orders AS\nSELECT order_id, customer_id, amount, order_date, status\nFROM orders\nWHERE order_date >= CURRENT_DATE - INTERVAL '30 days';\n\nUPDATE recent_orders SET status = 'shipped' WHERE order_id = 5;\n-- ← Works: direct update to underlying table"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Views — Indexed, Updatable & Materialized — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── View WITH CHECK OPTION ────────────────────────,CREATE VIEW active_pending_orders AS,SELECT order_id, customer_id, amount, status,FROM orders,WHERE status = 'pending',WITH LOCAL CHECK OPTION;  -- LOCAL = this view's conditions only,\n\n-- Allowed:,UPDATE active_pending_orders SET amount = 100 WHERE order_id = 1;,\n\n-- Rejected (violates status = 'pending'):,UPDATE active_pending_orders SET status = 'shipped' WHERE order_id = 1;,\n\n-- ── INSTEAD OF trigger on view (custom logic) ──────,CREATE TRIGGER update_order_summary_view,INSTEAD OF UPDATE ON order_summary,FOR EACH ROW,BEGIN,    UPDATE orders SET status = NEW.status WHERE id = NEW.order_id;,    UPDATE customers SET tier = NEW.tier WHERE id = NEW.customer_id;,END;,\n\n-- ── Indexed view (SQL Server) ──────────────────────,CREATE VIEW indexed_sales_summary,WITH SCHEMABINDING,AS,SELECT,    DATE_TRUNC('month', order_date) AS month,,    region,,    COUNT_BIG(*) AS order_count,,    SUM(amount) AS total_revenue,FROM orders,WHERE order_date >= '2024-01-01',GROUP BY DATE_TRUNC('month', order_date), region;,\n\n-- Create unique clustered index on the view,CREATE UNIQUE CLUSTERED INDEX idx_sales_summary,ON indexed_sales_summary (month, region);,\n\n-- ── Materialized view (PostgreSQL) ────────────────,CREATE MATERIALIZED VIEW mv_customer_stats AS,SELECT,    u.id,,    u.name,,    COUNT(o.id) AS order_count,,    SUM(o.amount) AS total_spent,,    AVG(o.amount) AS avg_order,FROM users u,LEFT JOIN orders o ON o.user_id = u.id,GROUP BY u.id, u.name;,\n\n-- Refresh materialized view,REFRESH MATERIALIZED VIEW CONCURRENTLY mv_customer_stats;,,SELECT * FROM mv_customer_stats WHERE total_spent > 5000;"
                  }
        ],
        tips: [
                  "Regular views are dynamic — query runs each SELECT. No storage overhead but slower for complex queries.",
                  "Updatable views require: single source table, no aggregates, no DISTINCT. WITH CHECK OPTION enforces view's filter.",
                  "Indexed views (SQL Server) / Materialized views (PostgreSQL) pre-compute results — fast queries, slow refresh.",
                  "INSTEAD OF triggers enable updates on non-updatable views — split update logic across multiple tables."
        ],
        mistake: "Creating indexes on regular views — not supported. Only indexed views (SQL Server) or materialized views (PG) can be indexed.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── Simple read-only view ─────────────────────────\nCREATE VIEW active_customers AS\nSELECT id, name, email, created_at\nFROM customers\nWHERE status = 'active'\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM mv_customer_stats WHERE total_spent > 5000;",
        },
      },
      {
        id: "scalar-functions",
        fn: "Scalar User-Defined Functions",
        desc: "Create functions that return a single value: PostgreSQL RETURNS, SQL Server RETURNS scalar.",
        category: "Functions",
        subtitle: "CREATE FUNCTION RETURNS scalar, inline TVF, performance, SCHEMABINDING, caching hints",
        signature: "CREATE FUNCTION name(param TYPE) RETURNS type ... SELECT ...;  |  CREATE FUNCTION ... RETURNS INT AS BEGIN ... END",
        descLong: "Scalar functions return a single value per call. PostgreSQL uses LANGUAGE plpgsql or LANGUAGE sql. SQL Server defines return type with RETURNS. Mark functions IMMUTABLE/STABLE (PostgreSQL) or SCHEMABINDING (SQL Server) for optimization. Scalar functions in WHERE clauses can hurt performance — they execute per row. Inline table-valued functions (single SELECT) are better than multi-statement UDFs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Scalar User-Defined Functions — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── PostgreSQL scalar function ────────────────────\nCREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)\nRETURNS INT\nLANGUAGE sql\nIMMUTABLE\nAS $$\n    SELECT EXTRACT(YEAR FROM AGE(birth_date))::INT;\n$$;\n\nSELECT name, calculate_age(dob) AS age FROM users;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Scalar User-Defined Functions — common patterns you'll see in production.\n-- APPROACH  - Combine Scalar User-Defined Functions with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── PostgreSQL function with logic ────────────────\nCREATE OR REPLACE FUNCTION get_discount_rate(total_spent DECIMAL)\nRETURNS DECIMAL\nLANGUAGE plpgsql\nIMMUTABLE\nAS $$\nBEGIN\n    IF total_spent >= 10000 THEN RETURN 0.20;\n    ELSIF total_spent >= 5000 THEN RETURN 0.15;\n    ELSIF total_spent >= 1000 THEN RETURN 0.10;\n    ELSE RETURN 0.00;\n    END IF;\nEND;\n$$;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Scalar User-Defined Functions — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── SQL Server scalar function ────────────────────,CREATE FUNCTION dbo.get_customer_tier (@CustomerId INT),RETURNS VARCHAR(20),WITH SCHEMABINDING,AS,BEGIN,    DECLARE @TotalSpent DECIMAL;,,    SELECT @TotalSpent = SUM(Amount),    FROM dbo.Orders,    WHERE CustomerId = @CustomerId;,,    RETURN CASE,        WHEN @TotalSpent >= 10000 THEN 'platinum',        WHEN @TotalSpent >= 5000 THEN 'gold',        ELSE 'silver',    END;,END;,,SELECT dbo.get_customer_tier(5) AS tier;,\n\n-- ── Inline table-valued function (better performance) ──,CREATE FUNCTION get_user_orders (@UserId INT),RETURNS TABLE(order_id INT, amount DECIMAL, order_date DATE),AS,RETURN,(,    SELECT OrderId, Amount, CAST(OrderDate AS DATE),    FROM Orders,    WHERE CustomerId = @UserId,);,,SELECT * FROM get_user_orders(5);"
                  }
        ],
        tips: [
                  "Mark functions IMMUTABLE (never changes for same input) or STABLE (same output per call) — optimizer caches results.",
                  "Scalar functions in WHERE clauses execute per row — they cause performance problems. Rewrite as JOINs when possible.",
                  "SQL Server SCHEMABINDING prevents table changes that would break the function — good for optimization.",
                  "Inline table-valued functions (single SELECT) are faster than multi-statement TVFs — use when possible."
        ],
        mistake: "Using scalar functions in WHERE clauses on millions of rows — each row calls the function. Rewrite as JOIN to the function result.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── PostgreSQL scalar function ────────────────────\nCREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)\nRETURNS INT\nLANGUAGE sql\nIMMUTABLE\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM get_user_orders(5);",
        },
      },
      {
        id: "table-valued-functions",
        fn: "Table-Valued Functions",
        desc: "Functions returning tables: RETURNS TABLE, RETURN QUERY, multi-statement TVFs.",
        category: "Functions",
        subtitle: "RETURNS TABLE, RETURN QUERY, multi-statement TVF, inline TVF, result sets",
        signature: "CREATE FUNCTION name(...) RETURNS TABLE(col TYPE, ...) LANGUAGE plpgsql AS $$... RETURN QUERY SELECT...; $$",
        descLong: "Table-valued functions return result sets instead of scalars. PostgreSQL RETURNS TABLE(...) declares output columns, uses RETURN QUERY. Multi-statement TVFs are complex but powerful — compute intermediate results, apply complex logic. Inline TVFs (single SELECT) are faster. Use TVFs to encapsulate complex queries and enable reuse as if they were tables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Table-Valued Functions — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── PostgreSQL RETURNS TABLE ──────────────────────\nCREATE OR REPLACE FUNCTION get_customer_summary(customer_id INT)\nRETURNS TABLE(\n    order_id BIGINT,\n    order_amount DECIMAL,\n    product_count INT,\n    order_date DATE\n)\nLANGUAGE plpgsql STABLE\nAS $$\nBEGIN\n    RETURN QUERY\n    SELECT\n        o.id,\n        o.amount,\n        COUNT(oi.id)::INT AS prod_count,\n        DATE(o.created_at)\n    FROM orders o\n    LEFT JOIN order_items oi ON oi.order_id = o.id\n    WHERE o.user_id = customer_id\n    GROUP BY o.id\n    ORDER BY o.created_at DESC;\nEND;\n$$;\n\nSELECT * FROM get_customer_summary(5);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Table-Valued Functions — common patterns you'll see in production.\n-- APPROACH  - Combine Table-Valued Functions with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Multi-statement TVF (complex logic) ────────────\nCREATE OR REPLACE FUNCTION analyze_sales(start_date DATE, end_date DATE)\nRETURNS TABLE(\n    period DATE,\n    sales_count INT,\n    revenue DECIMAL,\n    avg_order DECIMAL,\n    trend TEXT\n)\nLANGUAGE plpgsql STABLE\nAS $$\nDECLARE\n    prev_revenue DECIMAL;\n    current_revenue DECIMAL;\nBEGIN\n    FOR period, sales_count, revenue IN\n        SELECT\n            DATE_TRUNC('month', o.created_at)::DATE,\n            COUNT(*),\n            SUM(o.amount)\n        FROM orders o\n        WHERE o.created_at >= start_date AND o.created_at < end_date\n        GROUP BY DATE_TRUNC('month', o.created_at)\n        ORDER BY DATE_TRUNC('month', o.created_at)\n    LOOP\n        current_revenue := revenue;\n        IF prev_revenue IS NULL THEN\n            trend := 'baseline';\n        ELSIF current_revenue > prev_revenue THEN\n            trend := 'growing';\n        ELSE\n            trend := 'declining';\n        END IF;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Table-Valued Functions — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- Calculate avg order,        avg_order := CASE WHEN sales_count > 0 THEN revenue / sales_count ELSE 0 END;,,        RETURN NEXT;  -- Emit current row,        prev_revenue := current_revenue;,    END LOOP;,END;,$$;,,SELECT * FROM analyze_sales('2024-01-01', '2024-12-31');,\n\n-- ── SQL Server inline TVF (single SELECT) ────────,CREATE FUNCTION dbo.get_orders_by_customer(@CustomerId INT),RETURNS TABLE,AS,RETURN (,    SELECT OrderId, Amount, OrderDate, Status,    FROM Orders,    WHERE CustomerId = @CustomerId,);,,SELECT * FROM dbo.get_orders_by_customer(5);"
                  }
        ],
        tips: [
                  "RETURNS TABLE defines output columns — simplifies result shape definition.",
                  "RETURN QUERY in a loop emits multiple rows from complex logic.",
                  "RETURN NEXT appends current row to result set — use in loops.",
                  "Inline TVFs (single SELECT) are more efficient than multi-statement TVFs — use when logic allows."
        ],
        mistake: "Using multi-statement TVFs for simple queries that could be inline — overly complex. Use RETURN QUERY SELECT when possible.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n-- ── PostgreSQL RETURNS TABLE ──────────────────────\nCREATE OR REPLACE FUNCTION get_customer_summary(customer_id INT)\nRETURNS TABLE(\n    order_id BIGINT,\n    order_amount DECIMAL,\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nSELECT * FROM dbo.get_orders_by_customer(5);",
        },
      },
    ],
  },
]

export default { meta, sections }
