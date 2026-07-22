export const meta = {
  "id": "data",
  "label": "Database & Data Patterns",
  "icon": "🗄️",
  "description": "Go database patterns: database/sql, sqlx, GORM, migrations, connection pooling, and data pipeline patterns."
}

export const sections = [

  // ── Section 1: Database Access Patterns ─────────────────────────────────────────
  {
    id: "database-patterns",
    title: "Database Access Patterns",
    entries: [
      {
        id: "sqlx-database",
        fn: "sqlx & database/sql — Type-Safe Database Access",
        desc: "Query databases in Go: database/sql fundamentals, sqlx extensions, prepared statements, transactions, and connection pooling.",
        category: "Database",
        subtitle: "database/sql, sqlx, QueryRow, Select, NamedExec, transactions, pool",
        signature: "sqlx.Connect()  |  db.Select(&dest, query)  |  db.NamedExec()  |  db.Beginx()",
        descLong: "Go database access starts with database/sql (stdlib) and is enhanced by sqlx (struct scanning, named parameters). database/sql provides connection pooling, prepared statements, and transactions out of the box. sqlx adds Get/Select (scan into structs), NamedExec (named :params), and In() for WHERE IN clauses. Always use parameterized queries ($1, ?) to prevent SQL injection. Set connection pool limits (MaxOpenConns, MaxIdleConns) for production. Use context.Context for timeouts and cancellation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sqlx & database/sql — Type-Safe Database Access — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"context\"\n    \"fmt\"\n    \"time\"\n\n    \"github.com/jmoiron/sqlx\"\n    _ \"github.com/lib/pq\" // PostgreSQL driver\n)\n\ntype User struct {\n    ID        int       `db:\"id\"`\n    Name      string    `db:\"name\"`\n    Email     string    `db:\"email\"`\n    CreatedAt time.Time `db:\"created_at\"`\n}\n\nfunc main() {\n    // ── Connect with connection pool settings ────────\n    db, err := sqlx.Connect(\"postgres\",\n        \"host=localhost dbname=myapp sslmode=disable\")\n    if err != nil {\n        panic(err)\n    }\n    defer db.Close()\n\n    db.SetMaxOpenConns(25)              // max concurrent connections\n    db.SetMaxIdleConns(5)               // keep 5 idle connections\n    db.SetConnMaxLifetime(5 * time.Minute) // recycle connections\n\n    ctx := context.Background()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sqlx & database/sql — Type-Safe Database Access — common patterns you'll see in production.\n// APPROACH  - Combine sqlx & database/sql — Type-Safe Database Access with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Query single row → struct ────────────────────\n    var user User\n    err = db.GetContext(ctx, &user,\n        \"SELECT * FROM users WHERE id = $1\", 42)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sqlx & database/sql — Type-Safe Database Access — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Query multiple rows → slice ──────────────────,    var users []User,    err = db.SelectContext(ctx, &users,,        \"SELECT * FROM users WHERE created_at > $1 ORDER BY name\",,        time.Now().AddDate(0, -1, 0)),\n\n    // ── Named parameters ─────────────────────────────,    _, err = db.NamedExecContext(ctx,,        `INSERT INTO users (name, email, created_at),         VALUES (:name, :email, :created_at)`,,        User{Name: \"Alice\", Email: \"alice@test.com\", CreatedAt: time.Now()}),\n\n    // ── WHERE IN clause ──────────────────────────────,    ids := []int{1, 2, 3, 4, 5},    query, args, _ := sqlx.In(,        \"SELECT * FROM users WHERE id IN (?)\", ids),    query = db.Rebind(query) // convert ? to $1, $2, ...,    db.SelectContext(ctx, &users, query, args...),\n\n    // ── Transactions ─────────────────────────────────,    tx, err := db.BeginTxx(ctx, nil),    if err != nil {,        panic(err),    },    defer tx.Rollback() // rollback if not committed,,    _, err = tx.ExecContext(ctx,,        \"UPDATE accounts SET balance = balance - $1 WHERE id = $2\",,        100.00, 1),    if err != nil {,        return // deferred Rollback runs,    },,    _, err = tx.ExecContext(ctx,,        \"UPDATE accounts SET balance = balance + $1 WHERE id = $2\",,        100.00, 2),    if err != nil {,        return,    },,    err = tx.Commit(),\n\n    // ── Context with timeout ─────────────────────────,    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second),    defer cancel(),    err = db.GetContext(ctx, &user, \"SELECT * FROM users WHERE id = $1\", 1),    // Automatically cancelled if query takes > 3 seconds,}"
                  }
        ],
        tips: [
                  "Always use *Context variants (GetContext, SelectContext) with timeouts — queries without context can hang forever.",
                  "SetMaxOpenConns(25) prevents overwhelming the database — default is unlimited which can exhaust DB connections.",
                  "sqlx.In() handles WHERE IN clauses safely with parameter binding — never string-concatenate IDs into queries.",
                  "defer tx.Rollback() is safe even if tx.Commit() succeeds — Rollback on a committed transaction is a no-op."
        ],
        mistake: "String concatenating user input into SQL queries: fmt.Sprintf(\"WHERE name = '%s'\", name) — this is SQL injection. Always use parameterized queries ($1, ?) and let the driver handle escaping.",
        shorthand: {
          verbose: "// SQL Injection!\nquery := fmt.Sprintf(\"SELECT * FROM users WHERE name = '%s'\", name)\ndb.Query(query)",
          concise: "db.GetContext(ctx, &dest, \"WHERE id = $1\", id); db.Select(...); db.NamedExec(...); sqlx.In() for WHERE IN",
        },
      },
      {
        id: "gorm-orm",
        fn: "GORM — Go ORM for Rapid Development",
        desc: "Use GORM for Active Record-style database access: auto-migration, associations, scopes, hooks, and query building.",
        category: "ORM",
        subtitle: "gorm.Model, AutoMigrate, Create, Find, Preload, Scopes, hooks",
        signature: "db.Create(&user)  |  db.Where().Find(&users)  |  db.Preload(\"Orders\").Find()",
        descLong: "GORM is Go's most popular ORM, providing Active Record-style database access. It auto-migrates schemas from struct definitions, handles associations (HasMany, BelongsTo, ManyToMany), and provides a chainable query builder. Scopes encapsulate reusable query conditions. Hooks (BeforeCreate, AfterUpdate) run logic on lifecycle events. GORM works with PostgreSQL, MySQL, SQLite, and SQL Server. Use it for CRUD-heavy applications; use sqlx for complex queries and performance-critical paths.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of GORM — Go ORM for Rapid Development — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"time\"\n    \"gorm.io/gorm\"\n    \"gorm.io/driver/postgres\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of GORM — Go ORM for Rapid Development — common patterns you'll see in production.\n// APPROACH  - Combine GORM — Go ORM for Rapid Development with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Models ──────────────────────────────────────────\ntype User struct {\n    gorm.Model                  // ID, CreatedAt, UpdatedAt, DeletedAt\n    Name     string             `gorm:\"not null;size:100\"`\n    Email    string             `gorm:\"uniqueIndex;not null\"`\n    Age      int\n    Orders   []Order            // HasMany\n    Profile  Profile            // HasOne\n}\n\ntype Order struct {\n    gorm.Model\n    UserID    uint\n    Amount    float64           `gorm:\"not null\"`\n    Status    string            `gorm:\"default:'pending'\"`\n    Items     []OrderItem       // HasMany\n}\n\ntype OrderItem struct {\n    gorm.Model\n    OrderID   uint\n    ProductID uint\n    Quantity  int\n    Price     float64\n}\n\nfunc main() {\n    dsn := \"host=localhost dbname=myapp sslmode=disable\"\n    db, _ := gorm.Open(postgres.Open(dsn), &gorm.Config{})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of GORM — Go ORM for Rapid Development — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Auto-migrate (create/update tables),    db.AutoMigrate(&User{}, &Order{}, &OrderItem{}),\n\n    // ── Create ───────────────────────────────────────,    user := User{Name: \"Alice\", Email: \"alice@test.com\", Age: 30},    db.Create(&user) // user.ID is set after insert,\n\n    // ── Read ─────────────────────────────────────────,    var u User,    db.First(&u, 1)                          // by primary key,    db.Where(\"email = ?\", \"alice@test.com\").First(&u),,    var users []User,    db.Where(\"age > ?\", 25).,        Order(\"name ASC\").,        Limit(10).,        Find(&users),\n\n    // ── Eager loading (N+1 prevention) ───────────────,    var usersWithOrders []User,    db.Preload(\"Orders\").,        Preload(\"Orders.Items\").,        Where(\"age > ?\", 18).,        Find(&usersWithOrders),\n\n    // ── Update ───────────────────────────────────────,    db.Model(&user).Updates(User{Name: \"Bob\", Age: 31}),    db.Model(&User{}).Where(\"age < ?\", 18).Update(\"status\", \"minor\"),\n\n    // ── Delete (soft delete with gorm.Model) ─────────,    db.Delete(&user)       // sets DeletedAt, doesn't remove row,    db.Unscoped().Delete(&user) // hard delete,\n\n    // ── Scopes (reusable query conditions) ───────────,    func Active(db *gorm.DB) *gorm.DB {,        return db.Where(\"status = ?\", \"active\"),    },    func RecentOrders(db *gorm.DB) *gorm.DB {,        return db.Where(\"created_at > ?\", time.Now().AddDate(0, -1, 0)),    },,    db.Scopes(Active, RecentOrders).Find(&orders),\n\n    // ── Raw SQL when needed ──────────────────────────,    var result []struct {,        Region  string,        Revenue float64,    },    db.Raw(`,        SELECT region, SUM(amount) as revenue,        FROM orders GROUP BY region,        HAVING SUM(amount) > ?,    `, 1000).Scan(&result),}"
                  }
        ],
        tips: [
                  "Use Preload() to avoid N+1 queries — db.Preload(\"Orders\").Find(&users) loads all orders in 2 queries, not N+1.",
                  "Scopes encapsulate reusable WHERE conditions — compose them: db.Scopes(Active, Premium).Find(&users).",
                  "gorm.Model includes soft delete (DeletedAt) — all queries automatically exclude deleted records.",
                  "Use Raw() for complex analytics queries — GORM's query builder is not designed for window functions or CTEs."
        ],
        mistake: "Using GORM for all queries including complex analytics — GORM excels at CRUD but generates suboptimal SQL for complex joins, aggregations, and window functions. Use Raw() or sqlx for performance-critical complex queries.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// GORM generates suboptimal SQL\ndb.Where(...).Where(...).Joins(...).Group(...).Find(&result)\n// More explicit but longer",
          concise: "GORM for CRUD; Preload() for associations; Scopes for reusable filters; db.Raw() or sqlx for complex analytics/CTEs",
        },
      },
      {
        id: "encoding-json",
        fn: "encoding/json — JSON Marshal & Unmarshal",
        desc: "JSON serialization: json.Marshal, json.Unmarshal, struct tags, and streaming with json.Decoder.",
        category: "Encoding",
        subtitle: "json.Marshal, json.Unmarshal, struct tags, json.Decoder, json.Encoder",
        signature: "json.Marshal(v)  |  json.Unmarshal(data, &v)  |  json.NewDecoder(r).Decode(&v)",
        descLong: "Go's encoding/json package handles JSON serialization. json.Marshal converts Go values to JSON bytes. json.Unmarshal does the reverse. Struct tags control field mapping: json:\"name\" renames, json:\"name,omitempty\" omits zero values, json:\"-\" hides fields. For streaming or large payloads, use json.Decoder (streaming from reader) and json.Encoder (streaming to writer). For production APIs, consider sonic or jsoniter for higher performance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of encoding/json — JSON Marshal & Unmarshal — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"encoding/json\"\n    \"fmt\"\n    \"io\"\n    \"log\"\n    \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of encoding/json — JSON Marshal & Unmarshal — common patterns you'll see in production.\n// APPROACH  - Combine encoding/json — JSON Marshal & Unmarshal with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Struct tags control JSON output\ntype User struct {\n    ID        int       `json:\"id\"`\n    Name      string    `json:\"name\"`\n    Email     string    `json:\"email,omitempty\"`  // omit if empty\n    Password  string    `json:\"-\"`                // never include\n    CreatedAt time.Time `json:\"created_at\"`\n    Active    bool      `json:\"active\"`\n}\n\nfunc main() {\n    // ── Marshal: Go → JSON ──────────────────────────\n    user := User{\n        ID: 1, Name: \"Alice\", Email: \"alice@example.com\",\n        Password: \"secret\", CreatedAt: time.Now(), Active: true,\n    }\n\n    data, err := json.Marshal(user)\n    if err != nil {\n        log.Fatal(err)\n    }\n    fmt.Println(string(data))\n    // {\"id\":1,\"name\":\"Alice\",\"email\":\"alice@example.com\",\"created_at\":\"2025-03-23T...\",\"active\":true}\n    // Note: Password is omitted (json:\"-\"), email included because non-empty"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of encoding/json — JSON Marshal & Unmarshal — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── MarshalIndent: Pretty-printed JSON ───────────,    pretty, _ := json.MarshalIndent(user, \"\", \"  \"),    fmt.Println(string(pretty)),\n\n    // ── Unmarshal: JSON → Go ────────────────────────,    jsonData := []byte(`{\"id\":2,\"name\":\"Bob\",\"email\":\"bob@example.com\"}`),    var u User,    err = json.Unmarshal(jsonData, &u),    if err != nil {,        log.Fatal(err),    },    fmt.Printf(\"%+v,\", u),\n\n    // ── Decoder: Streaming from reader (preferred for requests) ─,    // Example: reading from http.Request body,    // r := /* http.Request */,    // dec := json.NewDecoder(r.Body),    // var users []User,    // err := dec.Decode(&users),\n\n    // ── Encoder: Streaming to writer ─────────────────,    // Example: writing to http.ResponseWriter,    // enc := json.NewEncoder(w),    // enc.SetEscapeHTML(false)  // optional: don't escape <, >, &,    // err := enc.Encode(users),\n\n    // ── Number: Preserve numeric precision ───────────,    var data1 = []byte(`{\"amount\": 123.456}`),    var raw map[string]json.Number,    json.Unmarshal(data1, &raw),    fmt.Println(raw[\"amount\"]) // preserves precision,\n\n    // ── RawMessage: Defer parsing ────────────────────,    type Event struct {,        Type    string          `json:\"type\"`,        Payload json.RawMessage `json:\"payload\"`  // unparsed JSON,    },    eventData := []byte(`{\"type\":\"user.created\",\"payload\":{\"id\":1,\"name\":\"Alice\"}}`),    var evt Event,    json.Unmarshal(eventData, &evt),    fmt.Println(string(evt.Payload)) // raw JSON string,}"
                  }
        ],
        tips: [
                  "Use json:\"field,omitempty\" to exclude zero values from output — cleaner JSON for optional fields.",
                  "json.Decoder for streaming is more memory-efficient than json.Unmarshal for large payloads or request bodies.",
                  "json.RawMessage lets you defer parsing — useful for event payloads or polymorphic JSON.",
                  "json.Number preserves numeric precision — use for financial data where float64 loses precision."
        ],
        mistake: "Unmarshaling into untyped map[string]interface{} for all JSON — use typed structs for clarity and performance. Only use maps when the schema is truly unknown.",
        shorthand: {
          verbose: "data, _ := json.Marshal(user)\nvar u User\njson.Unmarshal(data, &u)",
          concise: "json.Marshal()/Unmarshal() for simple conversion; json.Decoder/Encoder for streaming; struct tags: \"field,omitempty\", json:\"-\"",
        },
      },
      {
        id: "encoding-xml-csv",
        fn: "encoding/xml & encoding/csv — XML and CSV I/O",
        desc: "Parse and generate XML and CSV files: xml.Unmarshal, csv.Reader, csv.Writer.",
        category: "Encoding",
        subtitle: "xml.Unmarshal, xml.Marshal, csv.Reader, csv.Writer, struct tags",
        signature: "xml.Unmarshal(data, &v)  |  csv.NewReader(r).Read()  |  csv.NewWriter(w).Write([]string{})",
        descLong: "encoding/xml handles XML with struct tags (xml:\"tag\" or xml:\"tag,attr\" for attributes). xml.Unmarshal parses XML into structs. encoding/csv provides csv.Reader (streaming read) and csv.Writer (streaming write). CSV is line-oriented; read until io.EOF. Both packages work well with files and HTTP bodies. For complex XML, consider using iterative parsing (xml.Decoder) for large documents.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of encoding/xml & encoding/csv — XML and CSV I/O — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"encoding/csv\"\n    \"encoding/xml\"\n    \"fmt\"\n    \"log\"\n    \"os\"\n    \"strings\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of encoding/xml & encoding/csv — XML and CSV I/O — common patterns you'll see in production.\n// APPROACH  - Combine encoding/xml & encoding/csv — XML and CSV I/O with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── XML structs with tags ───────────────────────────\ntype Book struct {\n    XMLName xml.Name `xml:\"book\"`\n    Title   string   `xml:\"title\"`\n    Author  string   `xml:\"author\"`\n    Year    int      `xml:\"year\"`\n    Pages   int      `xml:\"pages,attr\"`  // attribute, not element\n}\n\ntype Library struct {\n    XMLName xml.Name `xml:\"library\"`\n    Books   []Book   `xml:\"book\"`\n    Name    string   `xml:\"name,attr\"`\n}\n\nfunc main() {\n    // ── Unmarshal XML ──────────────────────────────\n    xmlData := []byte(`<?xml version=\"1.0\"?>\n<library name=\"Public\">\n    <book pages=\"350\">\n        <title>The Go Programming Language</title>\n        <author>Donovan &amp; Kernighan</author>\n        <year>2015</year>\n    </book>\n    <book pages=\"400\">\n        <title>Go in Action</title>\n        <author>Kennedy, Wood &amp; Jansen</author>\n        <year>2015</year>\n    </book>\n</library>`)\n\n    var lib Library\n    err := xml.Unmarshal(xmlData, &lib)\n    if err != nil {\n        log.Fatal(err)\n    }\n    fmt.Printf(\"%+v\n\", lib)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of encoding/xml & encoding/csv — XML and CSV I/O — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Marshal XML ─────────────────────────────────,    newLib := Library{,        Name: \"MyLib\",,        Books: []Book{,            {Title: \"Book1\", Author: \"Author1\", Year: 2020, Pages: 300},,        },,    },    xmlOut, _ := xml.MarshalIndent(newLib, \"\", \"  \"),    fmt.Println(string(xmlOut)),\n\n    // ── Read CSV ────────────────────────────────────,    csvData := `name,age,city,Alice,30,New York,Bob,25,Los Angeles,Charlie,35,Chicago`,,    reader := csv.NewReader(strings.NewReader(csvData)),    for {,        record, err := reader.Read(),        if err != nil {,            break,        },        fmt.Printf(\"Name: %s, Age: %s, City: %s,\",,            record[0], record[1], record[2]),    },\n\n    // ── Write CSV ───────────────────────────────────,    file, _ := os.Create(\"output.csv\"),    defer file.Close(),,    writer := csv.NewWriter(file),    defer writer.Flush(),,    writer.Write([]string{\"name\", \"age\", \"city\"}),    writer.Write([]string{\"Alice\", \"30\", \"New York\"}),    writer.Write([]string{\"Bob\", \"25\", \"Los Angeles\"}),    writer.Write([]string{\"Charlie\", \"35\", \"Chicago\"}),\n\n    // ── Read CSV into structs ───────────────────────,    type Person struct {,        Name string,        Age  int,        City string,    },    // Manually map CSV rows to structs,    // (use encoding/csv to read, manually unmarshal to struct),}"
                  }
        ],
        tips: [
                  "XML struct tags: xml:\"name\" for elements, xml:\"name,attr\" for attributes, xml:\"-\" to skip.",
                  "csv.Reader.Read() returns io.EOF when done — loop until error, not nil record.",
                  "csv.Writer.Flush() after writing to ensure all data is written — easy to forget!",
                  "For large XML files, use xml.Decoder for streaming instead of Unmarshal (which loads everything into memory)."
        ],
        mistake: "Forgetting csv.Writer.Flush() — data stays buffered and never reaches the file.",
        shorthand: {
          verbose: "data, _ := xml.MarshalIndent(v, \"\", \"  \")\nvar v T\nxml.Unmarshal(data, &v)",
          concise: "xml.Unmarshal()/Marshal() for XML; csv.Reader for iteration; csv.Writer with Flush(); struct tags: xml:\"field,attr\"",
        },
      },
      {
        id: "database-sql",
        fn: "database/sql — Standard Library Database Access",
        desc: "Core SQL package: sql.Open, QueryContext, ExecContext, Scan, and connection pooling.",
        category: "Database",
        subtitle: "sql.Open, sql.DB, Rows.Scan, connection pool, Query vs Exec",
        signature: "sql.Open(driver, dsn)  |  db.QueryContext(ctx, sql)  |  db.ExecContext(ctx, sql)  |  rows.Scan(&v)",
        descLong: "database/sql is Go's standard SQL library. It abstracts database drivers (postgres, mysql, sqlite, etc.). Always use *Context variants for timeouts and cancellation. QueryContext returns *sql.Rows (for multiple rows); QueryRowContext returns *sql.Row (single row). Scan unpacks a row into variables. Use parameterized queries ($1, ?) to prevent SQL injection. Connection pooling is automatic; configure with MaxOpenConns and MaxIdleConns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of database/sql — Standard Library Database Access — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"context\"\n    \"database/sql\"\n    \"fmt\"\n    \"log\"\n    \"time\"\n\n    _ \"github.com/lib/pq\"\n)\n\nfunc main() {\n    // ── Open database connection ────────────────────\n    db, err := sql.Open(\"postgres\",\n        \"host=localhost dbname=myapp user=postgres sslmode=disable\")\n    if err != nil {\n        log.Fatal(err)\n    }\n    defer db.Close()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of database/sql — Standard Library Database Access — common patterns you'll see in production.\n// APPROACH  - Combine database/sql — Standard Library Database Access with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Configure connection pool ───────────────────\n    db.SetMaxOpenConns(25)\n    db.SetMaxIdleConns(5)\n    db.SetConnMaxLifetime(5 * time.Minute)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of database/sql — Standard Library Database Access — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Query multiple rows ────────────────────────,    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second),    defer cancel(),,    rows, err := db.QueryContext(ctx,,        \"SELECT id, name, email FROM users WHERE age > $1\",,        18),    if err != nil {,        log.Fatal(err),    },    defer rows.Close(),,    var users []struct {,        ID    int,        Name  string,        Email string,    },,    for rows.Next() {,        var id int,        var name, email string,        err := rows.Scan(&id, &name, &email),        if err != nil {,            log.Fatal(err),        },        users = append(users, struct {,            ID    int,            Name  string,            Email string,        }{id, name, email}),    },    if err = rows.Err(); err != nil {,        log.Fatal(err),    },\n\n    // ── Query single row ───────────────────────────,    var name string,    err = db.QueryRowContext(ctx,,        \"SELECT name FROM users WHERE id = $1\", 1).Scan(&name),    if err == sql.ErrNoRows {,        log.Println(\"No user found\"),    } else if err != nil {,        log.Fatal(err),    },\n\n    // ── Execute (INSERT, UPDATE, DELETE) ────────────,    result, err := db.ExecContext(ctx,,        \"INSERT INTO users (name, email, age) VALUES ($1, $2, $3)\",,        \"Alice\", \"alice@example.com\", 30),    if err != nil {,        log.Fatal(err),    },,    id, _ := result.LastInsertId(),    rowsAffected, _ := result.RowsAffected(),    fmt.Printf(\"Inserted ID: %d, Rows affected: %d,\", id, rowsAffected),\n\n    // ── Prepared statements (for repeated queries) ──,    stmt, err := db.PrepareContext(ctx, \"SELECT * FROM users WHERE id = $1\"),    if err != nil {,        log.Fatal(err),    },    defer stmt.Close(),,    for i := 1; i <= 5; i++ {,        var id int,        var name string,        err := stmt.QueryRowContext(ctx, i).Scan(&id, &name),        if err == nil {,            fmt.Printf(\"ID: %d, Name: %s,\", id, name),        },    },\n\n    // ── Transactions ────────────────────────────────,    tx, err := db.BeginTx(ctx, nil),    if err != nil {,        log.Fatal(err),    },,    _, err = tx.ExecContext(ctx,,        \"UPDATE accounts SET balance = balance - $1 WHERE id = $2\",,        100, 1),    if err != nil {,        tx.Rollback(),        log.Fatal(err),    },,    _, err = tx.ExecContext(ctx,,        \"UPDATE accounts SET balance = balance + $1 WHERE id = $2\",,        100, 2),    if err != nil {,        tx.Rollback(),        log.Fatal(err),    },,    err = tx.Commit(),    if err != nil {,        log.Fatal(err),    },}"
                  }
        ],
        tips: [
                  "Always use *Context variants — ensures queries respect timeouts and can be cancelled.",
                  "rows.Close() is critical — rows hold database connection resources.",
                  "Prepared statements are useful for repeated queries with different parameters.",
                  "QueryRowContext returns *sql.Row (single), QueryContext returns *sql.Rows (multiple).",
                  "Check rows.Err() after loop — catches errors in Row iteration."
        ],
        mistake: "Using db.Query() without context or defer rows.Close() — leaks database connections.",
        shorthand: {
          verbose: "rows, _ := db.Query(\"SELECT * FROM users\")\nfor rows.Next() {\n    rows.Scan(&id, &name)\n}",
          concise: "db.QueryContext(ctx, sql); defer rows.Close(); rows.Next(); rows.Scan(&vars); rows.Err()",
        },
      },
      {
        id: "sqlx-basics",
        fn: "sqlx — Enhanced SQL Queries & Struct Scanning",
        desc: "sqlx library extends database/sql: StructScan, NamedExec, Select for simpler code.",
        category: "Database",
        subtitle: "sqlx.DB, Select, Get, NamedExec, StructScan, In()",
        signature: "db.Select(&dest, query)  |  db.Get(&single, query)  |  db.NamedExec(query, args)",
        descLong: "sqlx wraps database/sql to add convenience methods. Select scans multiple rows into a slice of structs. Get scans a single row. NamedExec uses named parameters (:name) instead of $1, $2. StructScan maps database columns to struct fields via tags or column names. All methods have *Context variants for timeouts. Reduces boilerplate compared to raw database/sql.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sqlx — Enhanced SQL Queries & Struct Scanning — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"context\"\n    \"fmt\"\n    \"log\"\n    \"time\"\n\n    \"github.com/jmoiron/sqlx\"\n    _ \"github.com/lib/pq\"\n)\n\ntype User struct {\n    ID        int       `db:\"id\"`\n    Name      string    `db:\"name\"`\n    Email     string    `db:\"email\"`\n    CreatedAt time.Time `db:\"created_at\"`\n}\n\nfunc main() {\n    db, _ := sqlx.Connect(\"postgres\",\n        \"host=localhost dbname=myapp sslmode=disable\")\n    defer db.Close()\n\n    ctx := context.Background()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sqlx — Enhanced SQL Queries & Struct Scanning — common patterns you'll see in production.\n// APPROACH  - Combine sqlx — Enhanced SQL Queries & Struct Scanning with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Select: scan multiple rows into slice ───────\n    var users []User\n    err := db.SelectContext(ctx, &users,\n        \"SELECT id, name, email, created_at FROM users WHERE age > $1\",\n        18)\n    if err != nil {\n        log.Fatal(err)\n    }\n    fmt.Printf(\"%+v\n\", users)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sqlx — Enhanced SQL Queries & Struct Scanning — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Get: scan single row into struct ────────────,    var user User,    err = db.GetContext(ctx, &user,,        \"SELECT id, name, email, created_at FROM users WHERE id = $1\", 1),    if err != nil {,        log.Fatal(err),    },    fmt.Printf(\"%+v,\", user),\n\n    // ── NamedExec: named parameters ─────────────────,    result, err := db.NamedExecContext(ctx,,        `INSERT INTO users (name, email, created_at),         VALUES (:name, :email, :created_at)`,,        User{,            Name:      \"Alice\",,            Email:     \"alice@example.com\",,            CreatedAt: time.Now(),,        }),    if err != nil {,        log.Fatal(err),    },    fmt.Printf(\"Rows affected: %v,\", result.RowsAffected()),\n\n    // ── In(): safe WHERE IN with parameter binding ──,    ids := []int{1, 2, 3, 4, 5},    query, args, _ := sqlx.In(,        \"SELECT id, name, email, created_at FROM users WHERE id IN (?)\",,        ids),    query = db.Rebind(query),    err = db.SelectContext(ctx, &users, query, args...),    if err != nil {,        log.Fatal(err),    },\n\n    // ── Query with In() and additional conditions ────,    query2, args2, _ := sqlx.In(,        `SELECT id, name, email, created_at FROM users,         WHERE id IN (?) AND age > ?`,,        ids, 20),    query2 = db.Rebind(query2),    err = db.SelectContext(ctx, &users, query2, append(args2, 20)...),\n\n    // ── Queryx: iterate with rows ───────────────────,    rows, _ := db.QueryxContext(ctx,,        \"SELECT id, name, email, created_at FROM users\"),    defer rows.Close(),,    for rows.Next() {,        var u User,        rows.StructScan(&u),        fmt.Printf(\"%+v,\", u),    },}"
                  }
        ],
        tips: [
                  "Select & Get map columns to struct fields by tag — use `db:\"column_name\"` to align.",
                  "NamedExec with :name parameters is more readable than $1, $2 positional args.",
                  "sqlx.In() + db.Rebind() safely handles WHERE IN clauses.",
                  "All methods have *Context variants — use them for timeouts."
        ],
        mistake: "Not using struct tags or using wrong tag names — Select/Get won't map columns correctly.",
        shorthand: {
          verbose: "var users []User\ndb.QueryContext(ctx, sql)\nfor rows.Next() {\n    rows.Scan(&id, &name, &email)\n}",
          concise: "db.Select(&users, sql); db.Get(&user, sql); db.NamedExec(sql, structArg); sqlx.In() for WHERE IN",
        },
      },
      {
        id: "redis-go",
        fn: "redis/go-redis — Redis Client",
        desc: "go-redis client: connect, get/set, hash operations, pipeline, pub/sub.",
        category: "Cache",
        subtitle: "redis.NewClient, Set, Get, HSet, HGet, Pipeline, Subscribe",
        signature: "client.Set(ctx, key, val, ttl)  |  client.Get(ctx, key)  |  client.HSet(ctx, key, field, val)",
        descLong: "go-redis is the standard Redis client for Go. Create client with NewClient, configure with Options (Addr, Password, DB). String operations: Set (with TTL), Get, Incr, Append. Hash operations: HSet, HGet, HGetAll, HDel. List operations: Push, Pop, Range. Set operations: Add, Remove, Members. Pipeline batches commands. Subscribe for pub/sub. All operations are context-aware for timeouts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of redis/go-redis — Redis Client — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"context\"\n    \"fmt\"\n    \"log\"\n    \"time\"\n\n    \"github.com/redis/go-redis/v9\"\n)\n\nfunc main() {\n    // ── Connect to Redis ────────────────────────────\n    client := redis.NewClient(&redis.Options{\n        Addr:     \"localhost:6379\",\n        Password: \"\", // no password\n        DB:       0,\n    })\n    defer client.Close()\n\n    ctx := context.Background()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of redis/go-redis — Redis Client — common patterns you'll see in production.\n// APPROACH  - Combine redis/go-redis — Redis Client with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Ping ────────────────────────────────────────\n    pong, err := client.Ping(ctx).Result()\n    if err != nil {\n        log.Fatal(err)\n    }\n    fmt.Println(pong) // \"PONG\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of redis/go-redis — Redis Client — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── String operations ───────────────────────────,    err = client.Set(ctx, \"user:1:name\", \"Alice\", 24*time.Hour).Err(),    if err != nil {,        log.Fatal(err),    },,    val, err := client.Get(ctx, \"user:1:name\").Result(),    if err == redis.Nil {,        fmt.Println(\"key does not exist\"),    } else if err != nil {,        log.Fatal(err),    } else {,        fmt.Println(\"user:1:name:\", val) // \"Alice\",    },\n\n    // ── Increment ───────────────────────────────────,    client.Set(ctx, \"counter\", \"0\", 0),    client.Incr(ctx, \"counter\"),    client.Incr(ctx, \"counter\"),    val, _ = client.Get(ctx, \"counter\").Result(),    fmt.Println(\"counter:\", val) // \"2\",\n\n    // ── Hash operations ────────────────────────────,    client.HSet(ctx, \"user:1\", \"name\", \"Alice\", \"email\", \"alice@example.com\", \"age\", 30),\n\n    // HGet single field,    name, _ := client.HGet(ctx, \"user:1\", \"name\").Result(),    fmt.Println(\"name:\", name) // \"Alice\",\n\n    // HGetAll,    user, _ := client.HGetAll(ctx, \"user:1\").Result(),    fmt.Println(\"user:\", user) // map[age:30 email:alice@example.com name:Alice],\n\n    // HDel,    client.HDel(ctx, \"user:1\", \"age\"),\n\n    // ── List operations (Queue) ─────────────────────,    client.RPush(ctx, \"queue\", \"task1\", \"task2\", \"task3\"),,    task, _ := client.LPop(ctx, \"queue\").Result(),    fmt.Println(\"task:\", task) // \"task1\",,    tasks, _ := client.LRange(ctx, \"queue\", 0, -1).Result(),    fmt.Println(\"remaining:\", tasks) // [task2 task3],\n\n    // ── Set operations ──────────────────────────────,    client.SAdd(ctx, \"tags\", \"go\", \"python\", \"rust\", \"go\") // \"go\" counted once,    members, _ := client.SMembers(ctx, \"tags\").Result(),    fmt.Println(\"tags:\", members) // [go python rust] (unordered),,    isMember, _ := client.SIsMember(ctx, \"tags\", \"go\").Result(),    fmt.Println(\"has go:\", isMember) // true,\n\n    // ── Pipeline (batch commands) ───────────────────,    pipe := client.Pipeline(),    pipe.Set(ctx, \"key1\", \"val1\", 0),    pipe.Set(ctx, \"key2\", \"val2\", 0),    pipe.Get(ctx, \"key1\"),    pipe.Incr(ctx, \"counter\"),,    results, _ := pipe.Exec(ctx),    for _, result := range results {,        fmt.Printf(\"Result: %v,\", result),    },\n\n    // ── Pub/Sub ─────────────────────────────────────,    sub := client.Subscribe(ctx, \"events\"),    defer sub.Close(),,    ch := sub.Channel(),    go func() {,        for msg := range ch {,            fmt.Printf(\"Received: %s,\", msg.Payload),        },    }(),\n\n    // Publish from another context,    client.Publish(ctx, \"events\", \"hello\"),    time.Sleep(100 * time.Millisecond),}"
                  }
        ],
        tips: [
                  "All operations are context-aware — use WithTimeout for deadlines.",
                  "redis.Nil indicates key not found — check with == redis.Nil, not error comparison.",
                  "Pipeline batches commands — more efficient than individual calls.",
                  "Hashes are perfect for objects — easier than JSON strings for partial updates.",
                  "Use TTL/expiry to avoid stale cache — Set(ctx, key, val, 24*time.Hour)."
        ],
        mistake: "Checking \"key does not exist\" with err != nil — should check err == redis.Nil.",
        shorthand: {
          verbose: "client.Set(ctx, \"key\", \"val\", 0)\nval, err := client.Get(ctx, \"key\").Result()\nif err != nil && err != redis.Nil { log.Fatal(err) }",
          concise: "Set(ctx, key, val, ttl); Get(ctx, key); HSet/HGet for hashes; Pipeline for batch; Subscribe for pub/sub",
        },
      },
      {
        id: "mongo-go",
        fn: "MongoDB Go Driver — Document Database",
        desc: "MongoDB driver: connect, insert/find, BSON, aggregation pipeline.",
        category: "NoSQL",
        subtitle: "mongo.Connect, InsertOne, FindOne, UpdateOne, BSON, Aggregation",
        signature: "client.Database(name).Collection(name)  |  col.InsertOne(ctx, doc)  |  col.FindOne(ctx, filter)",
        descLong: "Official MongoDB driver for Go. Connect with mongo.Connect(). Get database/collection with Client.Database().Collection(). BSON is MongoDB's binary format; use bson.M (map) for dynamic or structs with bson tags. InsertOne/InsertMany for writes. FindOne returns one document; Find returns *mongo.Cursor (iterate). UpdateOne/ReplaceOne for updates. DeleteOne/DeleteMany for removal. Aggregation pipeline for complex queries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of MongoDB Go Driver — Document Database — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"context\"\n    \"fmt\"\n    \"log\"\n    \"time\"\n\n    \"go.mongodb.org/mongo-driver/bson\"\n    \"go.mongodb.org/mongo-driver/bson/primitive\"\n    \"go.mongodb.org/mongo-driver/mongo\"\n    \"go.mongodb.org/mongo-driver/mongo/options\"\n)\n\ntype User struct {\n    ID    primitive.ObjectID `bson:\"_id,omitempty\"`\n    Name  string             `bson:\"name\"`\n    Email string             `bson:\"email\"`\n    Age   int                `bson:\"age\"`\n}\n\nfunc main() {\n    // ── Connect ─────────────────────────────────────\n    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)\n    defer cancel()\n\n    client, err := mongo.Connect(ctx, options.Client().ApplyURI(\"mongodb://localhost:27017\"))\n    if err != nil {\n        log.Fatal(err)\n    }\n    defer client.Disconnect(ctx)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of MongoDB Go Driver — Document Database — common patterns you'll see in production.\n// APPROACH  - Combine MongoDB Go Driver — Document Database with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Get database and collection\n    db := client.Database(\"myapp\")\n    usersCol := db.Collection(\"users\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of MongoDB Go Driver — Document Database — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Insert ──────────────────────────────────────,    user := User{Name: \"Alice\", Email: \"alice@example.com\", Age: 30},    result, err := usersCol.InsertOne(ctx, user),    if err != nil {,        log.Fatal(err),    },    fmt.Printf(\"Inserted ID: %v,\", result.InsertedID),\n\n    // ── Find one ────────────────────────────────────,    var found User,    err = usersCol.FindOne(ctx, bson.M{\"email\": \"alice@example.com\"}).Decode(&found),    if err == mongo.ErrNoDocuments {,        fmt.Println(\"Not found\"),    } else if err != nil {,        log.Fatal(err),    } else {,        fmt.Printf(\"Found: %+v,\", found),    },\n\n    // ── Find many (with cursor) ─────────────────────,    filter := bson.M{\"age\": bson.M{\"$gt\": 25}} // age > 25,    cursor, err := usersCol.Find(ctx, filter),    if err != nil {,        log.Fatal(err),    },    defer cursor.Close(ctx),,    var users []User,    if err = cursor.All(ctx, &users); err != nil {,        log.Fatal(err),    },    for _, u := range users {,        fmt.Printf(\"%+v,\", u),    },\n\n    // Or iterate manually,    for cursor.Next(ctx) {,        var u User,        cursor.Decode(&u),        fmt.Printf(\"%+v,\", u),    },\n\n    // ── Update ──────────────────────────────────────,    result2, err := usersCol.UpdateOne(ctx,,        bson.M{\"email\": \"alice@example.com\"},,        bson.M{\"$set\": bson.M{\"age\": 31}}),    if err != nil {,        log.Fatal(err),    },    fmt.Printf(\"Modified: %d,\", result2.ModifiedCount),\n\n    // ── Delete ──────────────────────────────────────,    result3, err := usersCol.DeleteOne(ctx, bson.M{\"email\": \"alice@example.com\"}),    if err != nil {,        log.Fatal(err),    },    fmt.Printf(\"Deleted: %d,\", result3.DeletedCount),\n\n    // ── Aggregation pipeline ───────────────────────,    pipeline := mongo.Pipeline{,        bson.RA{\"\\$match\", bson.M{\"age\": bson.M{\"$gt\": 25}}},,        bson.RA{\"\\$group\", bson.M{,            \"_id\":   nil,,            \"count\": bson.M{\"$sum\": 1},,            \"avgAge\": bson.M{\"$avg\": \"$age\"},,        }},,    },,    cursor, _ = usersCol.Aggregate(ctx, pipeline),    var results []bson.M,    cursor.All(ctx, &results),    fmt.Printf(\"Aggregation: %v,\", results),}"
                  }
        ],
        tips: [
                  "Use bson.M{} for dynamic queries, struct with bson tags for typed documents.",
                  "FindOne returns error if not found (mongo.ErrNoDocuments) — check explicitly.",
                  "Always defer cursor.Close(ctx) after Find() to release resources.",
                  "Use bson.M{\"\\$gt\": 25} for comparison operators ($gt, $lt, $in, etc).",
                  "Aggregation pipeline is powerful for analytics — \\$match, \\$group, \\$sort, \\$limit."
        ],
        mistake: "Not checking for mongo.ErrNoDocuments in FindOne — results in confusing errors.",
        shorthand: {
          verbose: "result, _ := col.InsertOne(ctx, doc)\nvar found User\ncol.FindOne(ctx, filter).Decode(&found)",
          concise: "InsertOne(ctx, doc); FindOne(ctx, filter).Decode(); Find() for cursor iteration; UpdateOne/DeleteOne; Aggregate() for pipeline",
        },
      },
      {
        id: "pgx-postgres",
        fn: "pgx — PostgreSQL Driver",
        desc: "pgx driver: high-performance PostgreSQL, pgxpool, batch queries.",
        category: "Database",
        subtitle: "pgx.Connect, pgxpool, Scan, Query, Batch, PreparedStatement",
        signature: "pgx.Connect(ctx, dsn)  |  conn.Query(ctx, sql)  |  pool.Query(ctx, sql)",
        descLong: "pgx is a performant PostgreSQL driver. pgx.Connect for single connections; pgxpool.New for connection pool. Supports prepared statements, LISTEN/NOTIFY, COPY, and batch operations. Query/QueryRow for reads; Exec for writes. Rows are lazy; use .Scan() to read values. pgx is faster than database/sql + pq for PostgreSQL-specific features.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of pgx — PostgreSQL Driver — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"context\"\n    \"fmt\"\n    \"log\"\n\n    \"github.com/jackc/pgx/v5\"\n    \"github.com/jackc/pgx/v5/pgxpool\"\n)\n\nfunc main() {\n    // ── Connect (single connection) ──────────────────\n    ctx := context.Background()\n    conn, err := pgx.Connect(ctx, \"postgres://user:password@localhost/myapp\")\n    if err != nil {\n        log.Fatal(err)\n    }\n    defer conn.Close(ctx)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of pgx — PostgreSQL Driver — common patterns you'll see in production.\n// APPROACH  - Combine pgx — PostgreSQL Driver with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Query single row ────────────────────────────\n    var name string\n    var age int\n    err = conn.QueryRow(ctx,\n        \"SELECT name, age FROM users WHERE id = $1\", 1).Scan(&name, &age)\n    if err != nil {\n        log.Fatal(err)\n    }\n    fmt.Printf(\"Name: %s, Age: %d\n\", name, age)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of pgx — PostgreSQL Driver — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Query multiple rows ────────────────────────,    rows, _ := conn.Query(ctx, \"SELECT name, age FROM users WHERE age > $1\", 25),    for rows.Next() {,        var name string,        var age int,        rows.Scan(&name, &age),        fmt.Printf(\"Name: %s, Age: %d,\", name, age),    },    rows.Close(),\n\n    // ── Execute (INSERT, UPDATE) ────────────────────,    result, _ := conn.Exec(ctx,,        \"INSERT INTO users (name, age) VALUES ($1, $2)\", \"Bob\", 28),    fmt.Printf(\"Rows affected: %d,\", result.RowsAffected()),\n\n    // ── Connection pool ─────────────────────────────,    config, _ := pgxpool.ParseConfig(\"postgres://user:password@localhost/myapp\"),    config.MaxConns = 25,    config.MinConns = 5,,    pool, _ := pgxpool.NewWithConfig(ctx, config),    defer pool.Close(),\n\n    // Pool returns *pgx.Conn from the pool,    err = pool.QueryRow(ctx, \"SELECT 1\").Scan(&name),\n\n    // ── Batch operations ────────────────────────────,    batch := &pgx.Batch{},    batch.Queue(\"SELECT name FROM users WHERE id = $1\", 1),    batch.Queue(\"SELECT COUNT(*) FROM users\"),    batch.Queue(\"INSERT INTO logs (msg) VALUES ($1)\", \"test\"),,    results := pool.SendBatch(ctx, batch),    defer results.Close(),\n\n    // Read results in order,    rows1, _ := results.Query(),    for rows1.Next() {,        rows1.Scan(&name),    },    rows1.Close(),,    var count int,    results.QueryRow().Scan(&count),\n\n    // ── Prepared statement ──────────────────────────,    stmt, _ := pool.Prepare(ctx, \"getuser\", \"SELECT name, age FROM users WHERE id = $1\"),,    var u struct {,        Name string,        Age  int,    },    pool.QueryRow(ctx, \"getuser\", 1).Scan(&u.Name, &u.Age),    defer pool.Deallocate(ctx, \"getuser\"),}"
                  }
        ],
        tips: [
                  "pgxpool.New is preferred for applications — automatic connection pooling.",
                  "pgx is PostgreSQL-specific — faster than database/sql for PG features.",
                  "Batch queries reduce round-trips to the database.",
                  "QueryRow for single row, Query for multiple rows.",
                  "Always close Rows/Batch/Pool to avoid connection leaks."
        ],
        mistake: "Not closing rows or batch results — leaks connections from the pool.",
        shorthand: {
          verbose: "conn.QueryRow(ctx, sql, args).Scan(&vars)\nrows, _ := conn.Query(ctx, sql)\nfor rows.Next() { rows.Scan(...) }",
          concise: "pgx.Connect() or pgxpool.New(); QueryRow/Query/Exec; Batch for multiple queries; Prepare for repeated queries",
        },
      },
      {
        id: "sqlc-basics",
        fn: "sqlc — Type-Safe SQL Code Generation",
        desc: "sqlc generates type-safe Go code from SQL queries — no ORM, pure SQL with Go types.",
        category: "Database",
        subtitle: "sqlc.yaml, sqlc generate, query annotations, generated code",
        signature: "sqlc.yaml config  |  -- name: GetUser (query annotations)  |  sqlc generate",
        descLong: "sqlc parses SQL files and generates type-safe Go functions. Write SQL queries with annotations (-- name: QueryName), and sqlc generates Go function signatures and result types. No runtime reflection or code generation magic — just pure SQL with generated type-safe wrappers. Requires sqlc.yaml config pointing to database and SQL directory. Supports PostgreSQL, MySQL, SQLite.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sqlc — Type-Safe SQL Code Generation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n-- File: queries/users.sql\n-- sqlc config and queries example"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sqlc — Type-Safe SQL Code Generation — common patterns you'll see in production.\n// APPROACH  - Combine sqlc — Type-Safe SQL Code Generation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n-- name: GetUser :one\nSELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sqlc — Type-Safe SQL Code Generation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n-- name: ListUsers :many,SELECT id, name, email, created_at FROM users WHERE age > $1 ORDER BY name;,\n\n-- name: CreateUser :one,INSERT INTO users (name, email, age, created_at),VALUES ($1, $2, $3, $4),RETURNING id, name, email, created_at;,\n\n-- name: UpdateUserEmail :exec,UPDATE users SET email = $1 WHERE id = $2;,\n\n-- name: DeleteUser :exec,DELETE FROM users WHERE id = $1;,,# sqlc.yaml configuration,version: \"2\",project:,  id: \"myapp\",sql:,  - engine: \"postgresql\",    queries: \"./queries/\",    schema: \"./schema/\",    gen:,      go:,        package: \"db\",        out: \"./db\",,# Run: sqlc generate,,# Generated Go code example (in db/users.sql.go):,package db,,type GetUserRow struct {,    ID        int32,    Name      string,    Email     string,    CreatedAt time.Time,},,func (q *Queries) GetUser(ctx context.Context, id int32) (*GetUserRow, error) {,    row := q.db.QueryRowContext(ctx,,        \"SELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1\",,        id,,    ),    var i GetUserRow,    err := row.Scan(&i.ID, &i.Name, &i.Email, &i.CreatedAt),    return &i, err,},,func (q *Queries) ListUsers(ctx context.Context, age int32) ([]ListUsersRow, error) {,    rows, err := q.db.QueryContext(ctx,,        \"SELECT id, name, email, created_at FROM users WHERE age > $1 ORDER BY name\",,        age,,    ),    if err != nil {,        return nil, err,    },    defer rows.Close(),    var items []ListUsersRow,    for rows.Next() {,        var i ListUsersRow,        if err := rows.Scan(&i.ID, &i.Name, &i.Email, &i.CreatedAt); err != nil {,            return nil, err,        },        items = append(items, i),    },    if err := rows.Err(); err != nil {,        return nil, err,    },    return items, nil,},\n\n// Usage in Go code:,func main() {,    db, _ := sql.Open(\"postgres\", \"...\"),    queries := db.New(db)  // Wrap DB with generated Queries,,    ctx := context.Background(),\n\n    // Type-safe call with proper argument types,    user, err := queries.GetUser(ctx, 1),    if err != nil {,        log.Fatal(err),    },    fmt.Printf(\"%+v,\", user),\n\n    // List with type-safe arg,    users, _ := queries.ListUsers(ctx, 25),    for _, u := range users {,        fmt.Printf(\"%+v,\", u),    },\n\n    // Create with full type safety,    newUser, _ := queries.CreateUser(ctx, db.CreateUserParams{,        Name:      \"Alice\",,        Email:     \"alice@example.com\",,        Age:       30,,        CreatedAt: time.Now(),,    }),    fmt.Printf(\"%+v,\", newUser),}"
                  }
        ],
        tips: [
                  "sqlc generates code at build time — runs sqlc generate before go build.",
                  "No runtime reflection — generated code is pure, type-safe Go.",
                  "Use -- name: QueryName :one/:many/:exec to annotate queries.",
                  ":one returns single result, :many returns slice, :exec returns RowsAffected.",
                  "Requires schema.sql to exist — sqlc reads database schema to validate queries."
        ],
        mistake: "Forgetting to run sqlc generate after changing SQL queries — code goes out of sync with queries.",
        shorthand: {
          verbose: "// Manual / verbose approach\ndb.QueryContext(ctx, sql, args)\nrows.Scan(&v1, &v2, &v3)\n// More explicit but longer",
          concise: "sqlc.yaml config; -- name: Query :one/:many/:exec annotations; sqlc generate; type-safe function calls",
        },
      },
      {
        id: "migrate-go",
        fn: "golang-migrate/migrate — Database Migrations",
        desc: "Database migrations: up/down versions, embedded SQL files, version tracking.",
        category: "Database",
        subtitle: "migrate.New, Up, Down, embedded migrations, version control",
        signature: "migrate.New(sourceURL, databaseURL)  |  m.Up()  |  m.Down()",
        descLong: "golang-migrate manages database schema versions. Create up.sql and down.sql files (e.g., 001_create_users.up.sql). Run migrations with m.Up() to apply all pending, m.Down() to revert. Embed migrations with embed.FS for single-binary deployments. Tracks applied versions in database. Supports PostgreSQL, MySQL, SQLite, and others.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of golang-migrate/migrate — Database Migrations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"embed\"\n    \"fmt\"\n    \"log\"\n\n    \"github.com/golang-migrate/migrate/v4\"\n    _ \"github.com/golang-migrate/migrate/v4/database/postgres\"\n    \"github.com/golang-migrate/migrate/v4/source/iofs\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of golang-migrate/migrate — Database Migrations — common patterns you'll see in production.\n// APPROACH  - Combine golang-migrate/migrate — Database Migrations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n//go:embed migrations\nvar migrationFS embed.FS\n\nfunc main() {\n    // ── Load embedded migrations ────────────────────\n    source, err := iofs.New(migrationFS, \"migrations\")\n    if err != nil {\n        log.Fatal(err)\n    }\n\n    m, err := migrate.NewWithSourceInstance(\"iofs\", source,\n        \"postgres://user:password@localhost/myapp\")\n    if err != nil {\n        log.Fatal(err)\n    }\n    defer m.Close()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of golang-migrate/migrate — Database Migrations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Check current version ───────────────────────,    version, dirty, err := m.Version(),    if err != nil {,        log.Println(\"No migrations applied yet\"),    } else {,        fmt.Printf(\"Current version: %d, Dirty: %v,\", version, dirty),    },\n\n    // ── Run all pending migrations ──────────────────,    if err := m.Up(); err != nil && err != migrate.ErrNoChange {,        log.Fatal(err),    },    fmt.Println(\"Migrations applied\"),\n\n    // ── Or migrate to specific version ──────────────,    // m.Migrate(5),\n\n    // ── Rollback one step ───────────────────────────,    // m.Steps(-1),\n\n    // ── Force version (for fixing corrupted state) ──,    // m.Force(3),},,/* Migration file structure:,migrations/,  001_create_users.up.sql,  001_create_users.down.sql,  002_add_email_index.up.sql,  002_add_email_index.down.sql,,001_create_users.up.sql:,  CREATE TABLE users (,    id SERIAL PRIMARY KEY,,    name VARCHAR(100) NOT NULL,,    email VARCHAR(100) NOT NULL UNIQUE,,    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  );,,001_create_users.down.sql:,  DROP TABLE IF EXISTS users;,,002_add_email_index.up.sql:,  CREATE INDEX idx_email ON users(email);,,002_add_email_index.down.sql:,  DROP INDEX IF EXISTS idx_email;,*/"
                  }
        ],
        tips: [
                  "Version number format: 001, 002, 003 (zero-padded).",
                  "Use embed.FS to embed migrations in the binary — no separate SQL files at runtime.",
                  "Always write both .up.sql and .down.sql for reversibility.",
                  "migrations should be idempotent — M.Up() on applied migrations is a no-op.",
                  "Track migrations in version control — part of code history."
        ],
        mistake: "Writing non-idempotent migrations (CREATE TABLE without IF NOT EXISTS) — causes errors on re-run.",
        shorthand: {
          verbose: "m, _ := migrate.New(source, db)\nm.Up()\nm.Down()",
          concise: "migrate.New(sourceURL, dbURL); m.Up()/Down()/Steps(); embed.FS for embedded migrations; up/down SQL files",
        },
      },
      {
        id: "cache-patterns",
        fn: "In-Memory Caching — Patterns & Libraries",
        desc: "Caching strategies: sync.Map, ristretto, TTL cache, cache-aside pattern.",
        category: "Cache",
        subtitle: "sync.Map, ristretto, TTL, cache-aside, write-through, cache invalidation",
        signature: "sync.Map{}.Store/Load()  |  ristretto.NewCache()  |  time.AfterFunc for TTL",
        descLong: "In-memory caching speeds up hot paths. sync.Map is lock-free for concurrent reads. ristretto (BigCache alternative) has configurable eviction policies (LRU, LFU). Implement TTL with expiration times. Cache-aside: load data on miss, populate cache, return. Write-through: update cache and backend together. Write-behind: async backend writes. Always handle cache invalidation carefully.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of In-Memory Caching — Patterns & Libraries — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"fmt\"\n    \"sync\"\n    \"time\"\n\n    \"github.com/karlseguin/ccache/v2\"\n    \"github.com/dgraph-io/ristretto\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of In-Memory Caching — Patterns & Libraries — common patterns you'll see in production.\n// APPROACH  - Combine In-Memory Caching — Patterns & Libraries with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simple TTL cache with map ───────────────────────\ntype TTLCache struct {\n    mu    sync.RWMutex\n    items map[string]cacheItem\n}\n\ntype cacheItem struct {\n    value      interface{}\n    expiresAt  time.Time\n}\n\nfunc (c *TTLCache) Set(key string, value interface{}, ttl time.Duration) {\n    c.mu.Lock()\n    defer c.mu.Unlock()\n\n    c.items[key] = cacheItem{\n        value:     value,\n        expiresAt: time.Now().Add(ttl),\n    }\n}\n\nfunc (c *TTLCache) Get(key string) (interface{}, bool) {\n    c.mu.RLock()\n    defer c.mu.RUnlock()\n\n    item, exists := c.items[key]\n    if !exists || time.Now().After(item.expiresAt) {\n        return nil, false\n    }\n    return item.value, true\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of In-Memory Caching — Patterns & Libraries — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── sync.Map (lock-free for reads) ──────────────────,func exampleSyncMap() {,    var cache sync.Map,\n\n    // Store,    cache.Store(\"key1\", \"value1\"),\n\n    // Load,    val, ok := cache.Load(\"key1\"),    if ok {,        fmt.Println(val),    },\n\n    // Delete,    cache.Delete(\"key1\"),\n\n    // Range (iterate),    cache.Range(func(key, value interface{}) bool {,        fmt.Printf(\"Key: %v, Value: %v,\", key, value),        return true // continue iteration,    }),},\n\n// ── ristretto (LRU cache with high performance) ─────,func exampleRistretto() {,    cache, _ := ristretto.NewCache(&ristretto.Config{,        NumCounters: 1e7,     // expected num of items,        MaxCost:     1 << 30, // 1GB max cost,        BufferItems: 64,,    }),    defer cache.Close(),\n\n    // Set (with cost weight),    cache.Set(\"key1\", \"value1\", 1) // cost=1,\n\n    // Get,    val, found := cache.Get(\"key1\"),    if found {,        fmt.Println(val),    },\n\n    // Del,    cache.Del(\"key1\"),},\n\n// ── ccache (TTL cache) ──────────────────────────────,func exampleCCache() {,    cache := ccache.New(ccache.Configure().MaxSize(1000)),    defer cache.Close(),\n\n    // Set with TTL,    cache.Set(\"user:1\", \"Alice\", 24*time.Hour),\n\n    // Get,    item := cache.Get(\"user:1\"),    if item != nil {,        fmt.Println(item.Value()),    },},\n\n// ── Cache-aside pattern ─────────────────────────────,type UserRepo struct {,    cache sync.Map // could use ristretto,    db    interface{},},,func (r *UserRepo) GetUser(id string) (string, error) {,    // Check cache first,    if cached, ok := r.cache.Load(id); ok {,        return cached.(string), nil,    },\n\n    // Cache miss: fetch from DB,    user := r.fetchFromDB(id),\n\n    // Populate cache,    r.cache.Store(id, user),,    return user, nil,},,func (r *UserRepo) fetchFromDB(id string) string {,    return \"User \" + id,},\n\n// ── Write-through pattern (update cache and DB) ──────,func (r *UserRepo) UpdateUser(id string, name string) error {,    // Update database first,    err := r.updateDB(id, name),    if err != nil {,        return err,    },\n\n    // Update cache,    r.cache.Store(id, name),,    return nil,},,func (r *UserRepo) updateDB(id string, name string) error {,    // DB update logic,    return nil,},\n\n// ── Invalidation (remove stale cache) ───────────────,func (r *UserRepo) InvalidateUser(id string) {,    r.cache.Delete(id),},\n\n// ── TTL with background cleanup ─────────────────────,func (c *TTLCache) CleanupExpired() {,    ticker := time.NewTicker(5 * time.Minute),    defer ticker.Stop(),,    for range ticker.C {,        c.mu.Lock(),        now := time.Now(),        for key, item := range c.items {,            if now.After(item.expiresAt) {,                delete(c.items, key),            },        },        c.mu.Unlock(),    },},,func main() {,    exampleSyncMap(),    exampleRistretto(),    exampleCCache(),}"
                  }
        ],
        tips: [
                  "sync.Map is lock-free for reads — good for read-heavy workloads.",
                  "ristretto is configurable — tune NumCounters and MaxCost for memory budget.",
                  "Always set TTL to avoid stale data — use ccache for automatic expiration.",
                  "Cache-aside is safer than write-through — DB always source of truth.",
                  "Invalidate cache on writes — delete old entries to avoid stale data."
        ],
        mistake: "Forgetting to invalidate cache after updates — serves stale data to clients.",
        shorthand: {
          verbose: "if val, ok := cache.Load(key); ok {\n    return val\n}\nval := fetchFromDB(key)\ncache.Store(key, val)",
          concise: "sync.Map for lock-free reads; ristretto for LRU; ccache for TTL; cache-aside pattern; invalidate on write",
        },
      },
    ],
  },
]

export default { meta, sections }
