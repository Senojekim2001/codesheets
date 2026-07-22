export const meta = {
  "title": "data.table & Big Data",
  "domain": "r",
  "sheet": "datatable",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: data.table & Big Data ─────────────────────────────────────────
  {
    id: "r-datatable-all",
    title: "data.table & Big Data",
    entries: [
      {
        id: "datatable-basics",
        fn: "data.table Syntax & Basics",
        desc: "The fastest in-memory data manipulation in R — DT[i, j, by].",
        category: "data.table",
        subtitle: "Filter rows (i), compute columns (j), group by (by) in one expression",
        signature: "DT[i, j, by]  |  DT[col > 0, .(mean=mean(x)), by=group]",
        descLong: "data.table extends data.frame with a concise, extremely fast syntax. The three-part expression DT[i, j, by] means: filter rows with i, select/compute columns with j, grouped by by. Modifies by reference (no copies) — critical for large data. 10-100x faster than base R and significantly faster than dplyr for large datasets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Syntax & Basics — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\n# ── Create ─────────────────────────────────────────────\nDT <- data.table(\n  id     = 1:6,\n  dept   = c(\"IT\",\"HR\",\"IT\",\"Finance\",\"IT\",\"HR\"),\n  salary = c(85,62,92,78,71,68),\n  years  = c(5,3,8,6,2,4)\n)\n# Convert data.frame to data.table:\nsetDT(df)          # modifies in place (no copy)\nDT <- as.data.table(df)  # makes a copy\n# ── i: filter rows ─────────────────────────────────────\nDT[dept == \"IT\"]\nDT[salary > 75]\nDT[dept == \"IT\" & years > 3]\nDT[1:3]                     # first 3 rows\nDT[order(salary)]           # sort ascending\nDT[order(-salary)]          # sort descending"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Syntax & Basics — common patterns you'll see in production.\n# APPROACH  - Combine data.table Syntax & Basics with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── j: select / compute columns ────────────────────────\nDT[, salary]                # vector\nDT[, .(salary)]             # data.table (1 col)\nDT[, .(dept, salary)]       # select 2 cols\nDT[, .(mean_sal = mean(salary), n = .N)]  # compute\nDT[, sum(salary)]           # scalar\n# ── by: group operations ───────────────────────────────\nDT[, .(mean_sal = mean(salary), n = .N), by = dept]\nDT[, .(max_sal = max(salary)), by = .(dept, years > 4)]\n# Filter then group:\nDT[years > 2, .(avg = mean(salary)), by = dept]\n# ── Special symbols ────────────────────────────────────\n.N        # number of rows (in group)\n.SD       # Subset of Data (current group's data.table)\n.SDcols   # which columns .SD contains\n.I        # row indices\n.GRP      # group index"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Syntax & Basics — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Apply function to multiple columns:\nDT[, lapply(.SD, mean), by=dept, .SDcols=c(\"salary\",\"years\")]\n# ── Modify by reference (:= operator) ──────────────────\nDT[, bonus := salary * 0.1]          # add column\nDT[, c(\"bonus\",\"total\") := .(salary*0.1, salary*1.1)]  # multi\nDT[dept==\"IT\", level := \"Tech\"]      # conditional assign\nDT[, salary := NULL]                  # delete column"
                  }
        ],
        tips: [
                  "`:=` modifies **in place** — no copy, no reassignment needed. `DT[, x := 1]` changes DT directly",
                  "`.N` is rows in current group — `DT[, .N, by=dept]` is the fastest way to count by group",
                  "Use `setkey(DT, id)` for binary search joins — orders of magnitude faster than unkeyed joins on large tables",
                  "`fread()` is data.table's CSV reader — fastest in R, often 5-10x faster than `read_csv()`"
        ],
        mistake: "Assigning back after `:=`: `DT <- DT[, x := 1]`. The `:=` operator already modifies DT in place — the assignment is redundant and creates a confusing second reference. Just write `DT[, x := 1]`.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "datatable-joins-keys",
        fn: "data.table Joins, Keys & fread",
        desc: "Keyed joins, rolling joins, and fast file I/O with fread/fwrite.",
        category: "data.table",
        subtitle: "setkey(), merge(), X[Y], rolling joins, fread for large files",
        signature: "setkey(DT, id)  |  DT1[DT2]  |  fread('file.csv')",
        descLong: "data.table joins use keys for binary search — dramatically faster than hash joins for very large tables. Rolling joins find the nearest key match (last observation carried forward). fread is the fastest CSV reader in R, handling files with millions of rows in seconds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Joins, Keys & fread — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\n# ── Keys ───────────────────────────────────────────────\nsetkey(DT, id)          # set key column(s)\nkey(DT)                 # check current key\n# Fast lookup by key:\nDT[.(3)]                # row where id==3\nDT[.(c(1,3,5))]         # rows where id in (1,3,5)\n# ── Joins ──────────────────────────────────────────────\nemployees <- data.table(id=1:4, name=c(\"Alice\",\"Bob\",\"Carol\",\"Dave\"))\ndepts     <- data.table(id=c(1,2,3,5), dept=c(\"IT\",\"HR\",\"IT\",\"Finance\"))\nsetkey(employees, id)\nsetkey(depts, id)\n# Right join (X[Y] — keeps all Y rows):\ndepts[employees]                    # all employees\n# Inner join:\nmerge(employees, depts, by=\"id\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Joins, Keys & fread — common patterns you'll see in production.\n# APPROACH  - Combine data.table Joins, Keys & fread with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Left join:\nmerge(employees, depts, by=\"id\", all.x=TRUE)\n# Full join:\nmerge(employees, depts, by=\"id\", all=TRUE)\n# ── Rolling join ───────────────────────────────────────\n# Match each query date to the most recent price date\nprices <- data.table(\n  date  = as.Date(c(\"2024-01-01\",\"2024-01-05\",\"2024-01-10\")),\n  price = c(100, 105, 102)\n)\nqueries <- data.table(\n  date = as.Date(c(\"2024-01-03\",\"2024-01-07\",\"2024-01-12\"))\n)\nsetkey(prices, date)\nsetkey(queries, date)\nprices[queries, roll=TRUE]   # LOCF — last price on or before date\nprices[queries, roll=-Inf]   # next observation carried backward"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Joins, Keys & fread — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── fread / fwrite ─────────────────────────────────────\n# Fast read:\nDT <- fread(\"data/sales.csv\")                # auto-detects\nDT <- fread(\"data/sales.csv\",\n  select  = c(\"date\",\"amount\",\"region\"),     # columns\n  nrows   = 10000,                           # first 10k rows\n  na.strings = c(\"\",\"NA\",\"NULL\"),\n  colClasses = list(character=\"date\")        # override type\n)\n# Read compressed directly:\nDT <- fread(\"data/sales.csv.gz\")            # no decompress needed\n# Fast write:\nfwrite(DT, \"output/results.csv\")             # 3-5x faster than write.csv\nfwrite(DT, \"output/results.csv.gz\")          # auto-compress"
                  }
        ],
        tips: [
                  "Rolling joins are unique to data.table — essential for time series lookups (last known price, last known status)",
                  "`fread` handles 1M+ row CSV files in seconds — use it whenever file size > 100MB",
                  "Multiple keys: `setkey(DT, id, date)` — compound key for multi-column joins",
                  "`DT[, .SD, .SDcols=patterns('sal')]` selects columns matching a regex pattern — powerful for wide data"
        ],
        mistake: "Using `merge()` on unkeyed data.tables with millions of rows. Set keys first with `setkey()` — keyed joins use binary search (O(log n)) instead of hash join (O(n)) and are dramatically faster.",
        shorthand: {
          verbose: "SELECT a.id, a.name, b.value\nFROM table_a a\nINNER JOIN table_b b\n  ON a.id = b.a_id\nWHERE b.active = 1",
          concise: "SELECT a.id, a.name, b.value FROM table_a a JOIN table_b b ON a.id = b.a_id WHERE b.active = 1",
        },
      },
      {
        id: "r-arrow-duckdb",
        fn: "arrow & duckdb — Out-of-Memory Data",
        desc: "Query and process data larger than RAM using columnar formats and in-process SQL.",
        category: "R Big Data",
        subtitle: "arrow for Parquet/feather files, duckdb for SQL on large files",
        signature: "open_dataset('dir/')  |>  filter()  |>  collect()\ndbConnect(duckdb::duckdb())",
        descLong: "Arrow enables working with Parquet and feather files as lazy datasets — filter/aggregate without loading into memory. DuckDB is an embedded analytical database that can query CSV, Parquet, and R data frames directly with SQL. Both integrate with the dplyr API. Together they handle multi-GB data in R with no server required.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of arrow & duckdb — Out-of-Memory Data — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(arrow)\nlibrary(duckdb)\nlibrary(dplyr)\n# ══ arrow — Parquet files ══════════════════════════════\n# Write parquet (columnar, compressed, fast):\nwrite_parquet(mtcars, \"data/mtcars.parquet\")\nwrite_feather(mtcars, \"data/mtcars.feather\")  # uncompressed, fast read\n# Read back:\nread_parquet(\"data/mtcars.parquet\")\n# ── Dataset — lazy, partitioned ───────────────────────\n# Assume Parquet files partitioned by year:\n# data/year=2022/data.parquet\n# data/year=2023/data.parquet\n# data/year=2024/data.parquet\nds <- open_dataset(\"data/\", partitioning=\"year\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of arrow & duckdb — Out-of-Memory Data — common patterns you'll see in production.\n# APPROACH  - Combine arrow & duckdb — Out-of-Memory Data with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Build query (no data loaded yet):\nquery <- ds |>\n  filter(year == 2024, amount > 1000) |>\n  group_by(region) |>\n  summarise(total = sum(amount))\ncollect(query)   # NOW executes and pulls ~small result into R\n# Convert large dataset to smaller format:\nds |>\n  filter(dept == \"IT\") |>\n  write_parquet(\"data/it_only.parquet\")\n# ══ duckdb — in-process SQL ═══════════════════════════\ncon <- dbConnect(duckdb::duckdb())\n# Query a CSV directly (no import!):\ndbGetQuery(con, \"SELECT * FROM read_csv_auto('data.csv') LIMIT 5\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of arrow & duckdb — Out-of-Memory Data — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Query a Parquet file:\ndbGetQuery(con, \"SELECT region, SUM(amount) FROM 'data/*.parquet' GROUP BY 1\")\n# Register R data frame as a table:\nduckdb_register(con, \"sales\", sales_df)\ndbGetQuery(con, \"SELECT * FROM sales WHERE amount > 1000\")\n# dplyr interface:\ntbl(con, \"read_parquet('data.parquet')\") |>\n  filter(amount > 1000) |>\n  group_by(region) |>\n  summarise(total = sum(amount)) |>\n  collect()\ndbDisconnect(con, shutdown=TRUE)"
                  }
        ],
        tips: [
                  "Parquet is the best format for analytical data: columnar, compressed, 10-50x smaller than CSV, and fast for column-selective queries",
                  "DuckDB can query Parquet/CSV files **without importing** — `SELECT * FROM 'file.parquet'` just works",
                  "Arrow datasets are lazy — filter/aggregate pushes computation to the file level, only the result is returned to R",
                  "For partitioned data, filter on the partition column first — arrow skips entire files that don't match"
        ],
        mistake: "Using `read_csv()` or `read_parquet()` to load a 20GB file entirely into memory before filtering. Use `open_dataset()` + lazy `filter()` + `collect()` — only the filtered result enters R's memory.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "dt-syntax",
        fn: "data.table Syntax — DT[i, j, by]",
        desc: "Core data.table: filter rows (i), select/compute columns (j), group by (by) in one expression.",
        category: "data.table",
        subtitle: "DT[i, j, by] — filter, compute, group all at once",
        signature: "DT[i, j, by]  |  DT[salary > 75, .(mean_sal = mean(salary)), by=dept]",
        descLong: "The three-part DT[i, j, by] syntax is data.table's core. i filters rows, j selects/computes columns, by groups by one or more columns. All operations are extremely fast and modify by reference when using :=. The special symbols .N (row count), .SD (subset of data), .I (indices), and .GRP (group index) provide powerful group operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Syntax — DT[i, j, by] — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\n# ── i, j, by combined ──────────────────────────────────\nDT <- data.table(\n  id = 1:6,\n  dept = c('IT','HR','IT','Finance','IT','HR'),\n  salary = c(85, 62, 92, 78, 71, 68),\n  years = c(5, 3, 8, 6, 2, 4)\n)\n# i: filter rows where salary > 75\nDT[salary > 75]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Syntax — DT[i, j, by] — common patterns you'll see in production.\n# APPROACH  - Combine data.table Syntax — DT[i, j, by] with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# j: compute columns with .()\nDT[, .(mean_sal = mean(salary))]\n# by: group by department\nDT[, .(mean_sal = mean(salary), n = .N), by = dept]\n# All three: filter, compute, group\nDT[salary > 70, .(avg_salary = mean(salary), count = .N), by = dept]\n# ── Special symbols ────────────────────────────────\n.N    # number of rows in (sub)group\n.SD   # Subset of Data — all columns in current group\n.I    # row indices\n.GRP  # group index (1 for first group, etc.)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Syntax — DT[i, j, by] — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Count by department:\nDT[, .N, by = dept]\n# Get indices of rows with max salary per dept:\nDT[, .I[which.max(salary)], by = dept]"
                  }
        ],
        tips: [
                  "DT[i, j, by] reads like SQL SELECT ... FROM DT WHERE i GROUP BY by, j",
                  ".N is the fastest way to count — DT[, .N, by=dept] faster than dplyr::n()",
                  "Use .(col1, col2) notation to return multiple columns from j"
        ],
        mistake: "Nesting multiple square brackets instead of using one DT[i, j, by] call.",
        shorthand: {
          verbose: "// Manual / verbose approach\nresult <- DT[DT$salary > 75, ]\nresult <- result[, .(mean_sal = mean(result$salary)), by = result$dept]\n// More explicit but longer",
          concise: "DT[salary > 75, .(mean_sal = mean(salary)), by = dept]",
        },
      },
      {
        id: "dt-set-functions",
        fn: "data.table Set Functions — set(), setDT(), setnames()",
        desc: "Modify data.tables in place: set(), setDT(), setDF(), setnames(), setcolorder().",
        category: "data.table",
        subtitle: "set(), setDT(), setDF(), setnames(), setcolorder() — in-place modification",
        signature: "set(DT, i, j, value)  |  setDT(df)  |  setnames(DT, old, new)",
        descLong: "Set functions modify data.tables and data.frames in place without copies. set() is the lowest-level function for bulk updates. setDT() converts data.frame to data.table without copying. setnames() renames columns. setcolorder() reorders columns. These are essential for memory efficiency with large datasets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Set Functions — set(), setDT(), setnames() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\nDT <- data.table(\n  id = 1:4,\n  name = c('Alice', 'Bob', 'Carol', 'Dave'),\n  salary = c(85, 62, 92, 78)\n)\n# ── set(): low-level in-place update ────────────────────\n# Update specific cells\nset(DT, i = 2, j = 3, value = 65)  # row 2, col 3 (salary)\n# Update multiple cells\nset(DT, i = c(1, 3), j = 3, value = c(90, 95))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Set Functions — set(), setDT(), setnames() — common patterns you'll see in production.\n# APPROACH  - Combine data.table Set Functions — set(), setDT(), setnames() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── setDT(): convert data.frame to data.table in place ─\ndf <- data.frame(x = 1:3, y = c('a','b','c'))\nsetDT(df)       # df is now a data.table (no copy!)\nclass(df)       # \"data.table\" \"data.frame\"\n# ── setDF(): convert data.table back to data.frame ─────\nDF <- setDF(DT)  # returns regular data.frame (copy)\n# ── setnames(): rename columns in place ──────────────\nsetnames(DT, 'salary', 'pay')   # rename one column\nsetnames(DT, c('name', 'pay'), c('employee', 'compensation'))  # multiple\n# setnames by position:\nsetnames(DT, 3, 'annual_salary')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Set Functions — set(), setDT(), setnames() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── setcolorder(): reorder columns in place ──────────\nsetcolorder(DT, c('id', 'pay', 'name'))  # reorder\n# ── Chaining set functions ────────────────────────────\nsetnames(DT, 'name', 'employee')[\n  , setcolorder(.SD, c('id', 'employee', 'pay'))\n]"
                  }
        ],
        tips: [
                  "setDT(df) — if you have a data.frame, this is faster than as.data.table()",
                  "set() is fast for bulk updates without copying.",
                  "All set* functions modify by reference — no need to reassign."
        ],
        mistake: "Using <- after setnames: setnames(DT, ...) already modifies DT.",
        shorthand: {
          verbose: "// Manual / verbose approach\nsetnames(DT, old = 'salary', new = 'pay')\nsetcolorder(DT, neworder = c('id', 'pay', 'name'))\n// More explicit but longer",
          concise: "setnames(DT, 'salary', 'pay')[]\nsetcolorder(DT, c('id', 'pay', 'name'))",
        },
      },
      {
        id: "dt-keys",
        fn: "data.table Keys — setkey(), setkeyv(), Binary Search",
        desc: "Keys enable fast binary search joins and lookups: setkey(), setkeyv(), compound keys.",
        category: "data.table",
        subtitle: "setkey(), setkeyv(), key(), binary search joins, keyed lookups",
        signature: "setkey(DT, id)  |  DT[.(value)]  |  merge(DT1, DT2, by=\"id\")",
        descLong: "Setting a key on a data.table reorders it and enables O(log n) binary search. Lookups with DT[.(value)] are dramatically faster than unkeyed DT[id == value]. Keyed joins with merge() or X[Y] are orders of magnitude faster on large tables than unkeyed joins.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Keys — setkey(), setkeyv(), Binary Search — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\nemployees <- data.table(\n  id = 1:4,\n  name = c('Alice', 'Bob', 'Carol', 'Dave'),\n  salary = c(85, 62, 92, 78)\n)\ndepts <- data.table(\n  id = c(1, 2, 3, 5),\n  dept = c('IT', 'HR', 'IT', 'Finance')\n)\n# ── setkey(): set the key ───────────────────────────────\nsetkey(employees, id)\nsetkey(depts, id)\n# Check key:\nkey(employees)  # \"id\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Keys — setkey(), setkeyv(), Binary Search — common patterns you'll see in production.\n# APPROACH  - Combine data.table Keys — setkey(), setkeyv(), Binary Search with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Fast lookup with key ────────────────────────────────\nemployees[.(2)]       # row with id=2 (binary search)\nemployees[.(c(1,3))]  # rows with id in (1, 3)\n# ── setkeyv(): set key by variable name (programmatic) ──\nkeycol <- 'id'\nsetkeyv(employees, keycol)\n# ── Compound keys ────────────────────────────────────────\nsetkey(employees, id, name)\nemployees[.('Bob', 'Carol')]  # ERROR: need exact values\nemployees[.(1)]  # OK: matches first part of key\n# ── Keyed joins (much faster than unkeyed) ──────────────\n# Inner join (default)\nmerge(employees, depts, by = 'id')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Keys — setkey(), setkeyv(), Binary Search — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Left join\nmerge(employees, depts, by = 'id', all.x = TRUE)\n# Right join (with data.table syntax)\ndepts[employees]  # all employees\n# ── between(): range queries on keyed columns ───────────\nsetkey(employees, salary)\nemployees[between(salary, 70, 90)]  # optimized on key\n# ── Changing/dropping key ────────────────────────────────\nsetkey(employees, NULL)  # remove key"
                  }
        ],
        tips: [
                  "Keys must be set BEFORE repeated lookups to get binary search O(log n) performance.",
                  "Compound keys: setkey(DT, a, b) enables matching on (a, b) tuples.",
                  "Keyed joins with merge() are 10-100x faster than unkeyed on large tables."
        ],
        mistake: "Not setting keys before doing many lookups — each unkeyed lookup is O(n).",
        shorthand: {
          verbose: "// Manual / verbose approach\nemployees_keyed <- employees[order(id)]\nmerge(employees_keyed, depts, by = 'id')\n// More explicit but longer",
          concise: "setkey(employees, id)\nmerge(employees, depts, by = 'id')",
        },
      },
      {
        id: "dt-joins",
        fn: "data.table Joins — merge(), X[Y], on= argument",
        desc: "Join types: merge(), data.table join syntax, and on= for non-key joins.",
        category: "data.table",
        subtitle: "merge.data.table(), X[Y] syntax, on=, inner/left/right/full joins",
        signature: "merge(DT1, DT2)  |  DT1[DT2]  |  DT1[DT2, on=\"id\"]",
        descLong: "data.table joins are optimized for speed. merge() is the standard SQL-like function. X[Y] is the data.table-specific shorthand. on= allows joins without setting keys. Keyed joins use binary search; unkeyed use hash joins.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Joins — merge(), X[Y], on= argument — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\nemployees <- data.table(\n  emp_id = 1:4,\n  name = c('Alice', 'Bob', 'Carol', 'Dave'),\n  dept_id = c(1, 1, 2, 3)\n)\ndepts <- data.table(\n  dept_id = c(1, 2, 3, 4),\n  dept_name = c('IT', 'HR', 'Finance', 'Legal')\n)\n# ── merge: standard SQL-like syntax ──────────────────\n# Inner join (default)\nmerge(employees, depts, by = 'dept_id')\n# Left join (keep all rows from left table)\nmerge(employees, depts, by = 'dept_id', all.x = TRUE)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Joins — merge(), X[Y], on= argument — common patterns you'll see in production.\n# APPROACH  - Combine data.table Joins — merge(), X[Y], on= argument with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Right join\nmerge(employees, depts, by = 'dept_id', all.y = TRUE)\n# Full outer join\nmerge(employees, depts, by = 'dept_id', all = TRUE)\n# Join on different column names\nmerge(employees, depts, by.x = 'dept_id', by.y = 'dept_id')\n# ── X[Y] syntax: data.table shorthand ────────────────\nsetkey(depts, dept_id)\nemployees[depts]  # left join: employees + depts info\n# ── on= : join without setting keys ─────────────────\nemployees[depts, on = .(dept_id)]  # inner join\nemployees[depts, on = .(dept_id), all.x = TRUE]  # left join"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Joins — merge(), X[Y], on= argument — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Join on different column names:\nemployees[depts, on = c(dept_id = 'dept_id')]\n# ── Keyed vs unkeyed join performance ────────────────\n# Keyed: fast (binary search)\nsetkey(employees, dept_id)\nsetkey(depts, dept_id)\nmerge(employees, depts)  # O(n log m)\n# Unkeyed: slower (hash join)\nsetkey(employees, NULL)\nmerge(employees, depts, by = 'dept_id')  # O(n + m)"
                  }
        ],
        tips: [
                  "Keyed merges use binary search — set keys before large joins.",
                  "merge.data.table is optimized — use it instead of base::merge.",
                  "on= lets you join without modifying key — good for temporary joins."
        ],
        mistake: "Not keying large tables before join — unkeyed joins scan all rows.",
        shorthand: {
          verbose: "// Manual / verbose approach\nresult <- merge(employees, depts, by.x = 'dept_id', by.y = 'dept_id', all.x = TRUE)\n// More explicit but longer",
          concise: "employees[depts, on = .(dept_id), all.x = TRUE]",
        },
      },
      {
        id: "dt-rolling-join",
        fn: "data.table Rolling Joins — roll=TRUE, roll=Inf",
        desc: "Rolling joins: match each row to nearest/most recent key value in another table.",
        category: "data.table",
        subtitle: "roll=TRUE, roll=-Inf, rollends, time series alignment",
        signature: "X[Y, roll=TRUE]  |  X[Y, roll=Inf]  |  X[Y, roll=-Inf]",
        descLong: "Rolling joins match each row in Y to the nearest key value in X. roll=TRUE (LOCF) matches to the most recent value <= y. roll=-Inf (NOCB) matches to the next value >= y. Essential for time series lookups (price at date, status as of date).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Rolling Joins — roll=TRUE, roll=Inf — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\n# ── Time series example: match dates to prices ────────────\nprices <- data.table(\n  date = as.Date(c('2024-01-01', '2024-01-05', '2024-01-10', '2024-01-15')),\n  price = c(100, 105, 102, 108)\n)\nsetkey(prices, date)\n# Query dates (gaps in price table)\nqueries <- data.table(\n  date = as.Date(c('2024-01-03', '2024-01-07', '2024-01-12', '2024-01-20')),\n  symbol = c('AAPL', 'AAPL', 'AAPL', 'AAPL')\n)\nsetkey(queries, date)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Rolling Joins — roll=TRUE, roll=Inf — common patterns you'll see in production.\n# APPROACH  - Combine data.table Rolling Joins — roll=TRUE, roll=Inf with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── roll=TRUE: Last Observation Carried Forward (LOCF) ───\nprices[queries, roll=TRUE]\n#         date price symbol\n# 1: 2024-01-03   100   AAPL  (no price on this date, use 2024-01-01 price)\n# 2: 2024-01-07   105   AAPL  (use 2024-01-05 price)\n# 3: 2024-01-12   102   AAPL  (use 2024-01-10 price)\n# 4: 2024-01-20    NA   AAPL  (no price <= this date, NA)\n# ── roll=-Inf: Next Observation Carried Backward (NOCB) ──\nprices[queries, roll=-Inf]\n#         date price symbol\n# 1: 2024-01-03   105   AAPL  (next price is 2024-01-05)\n# 2: 2024-01-07   102   AAPL  (next price is 2024-01-10)\n# 3: 2024-01-12   108   AAPL  (next price is 2024-01-15)\n# 4: 2024-01-20    NA   AAPL  (no price >= this date, NA)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Rolling Joins — roll=TRUE, roll=Inf — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── roll=N: match within N units (days, etc.) ─────────────\nprices[queries, roll=3]  # LOCF within 3 days\n# 2024-01-03 matches 2024-01-01 (2 days apart) ✓\n# 2024-01-20 matches nothing (5 days from last price) NA\n# ── rollends=FALSE: don't roll at boundaries ──────────────\nprices[queries, roll=TRUE, rollends=FALSE]\n# First and last queries get NA"
                  }
        ],
        tips: [
                  "Rolling joins are unique to data.table — essential for time series data.",
                  "roll=TRUE is Last Observation Carried Forward — common in finance (use last known price).",
                  "roll=Inf matches any row; roll=0 exact match only."
        ],
        mistake: "Using regular joins for time series data instead of rolling joins.",
        shorthand: {
          verbose: "// Manual / verbose approach\nresult <- prices[order(date)]\nresult <- merge(result, queries, by = 'date', all.y = TRUE)\n// More explicit but longer",
          concise: "prices[queries, roll=TRUE]",
        },
      },
      {
        id: "dt-reference-semantics",
        fn: "data.table Reference Semantics — :=, .SD, .SDcols",
        desc: "Modify in place without copying: := assignment, .SD subsetting, .SDcols selection.",
        category: "data.table",
        subtitle: ":= operator, .SD, .SDcols — no copies, memory efficient",
        signature: "DT[, new_col := value]  |  DT[, .SD, .SDcols=cols]  |  DT[, (cols) := lapply(.SD, f)]",
        descLong: "The := operator modifies data.table in place — no copy, no reassignment. .SD (Subset of Data) represents the current group's columns. .SDcols selects which columns .SD includes. Together, these enable memory-efficient bulk operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Reference Semantics — :=, .SD, .SDcols — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\nDT <- data.table(\n  id = 1:5,\n  salary = c(80, 65, 90, 70, 85),\n  bonus = c(8, 7, 9, 7, 8.5),\n  years = c(5, 3, 8, 6, 2)\n)\n# ── := operator: add/modify columns in place ──────────────\nDT[, total := salary + bonus]  # add column\nDT[, salary := salary * 1.1]   # modify existing\n# Conditional update:\nDT[years > 4, bonus := bonus * 1.5]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Reference Semantics — :=, .SD, .SDcols — common patterns you'll see in production.\n# APPROACH  - Combine data.table Reference Semantics — :=, .SD, .SDcols with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Multiple updates at once:\nDT[, c('new1', 'new2') := .(salary * 0.1, salary * 1.1)]\n# ── Delete column with := NULL ───────────────────────────\nDT[, bonus := NULL]\n# ── .SD: access all columns in group ─────────────────────\n# Apply mean() to all numeric columns by group:\nDT[, lapply(.SD, mean), .SDcols = is.numeric]\n# Manually select columns:\nDT[, lapply(.SD, mean), .SDcols = c('salary', 'bonus')]\n# Apply function to each numeric column (preserves names):\nDT[, lapply(.SD, function(x) x / sum(x)), .SDcols = is.numeric]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Reference Semantics — :=, .SD, .SDcols — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── .SDcols with patterns() for regex selection ──────────\n# Select columns starting with 's':\nDT[, lapply(.SD, sum), .SDcols = patterns('^sal')]\n# Negate pattern (exclude):\nDT[, lapply(.SD, mean), .SDcols = patterns('^sal', invert = TRUE)]\n# ── Complex: update multiple columns with function ─────\nDT[, (names(.SD)) := lapply(.SD, function(x) x * 2),\n   .SDcols = c('salary', 'bonus')]"
                  }
        ],
        tips: [
                  ":= modifies DT in place — don't reassign: DT <- DT[, x := 1] is redundant.",
                  ".SDcols = is.numeric selects all numeric columns — powerful for large tables.",
                  "lapply + .SD is the idiom for bulk transformations — very fast."
        ],
        mistake: "Creating copies instead of using := — DT <- DT[, x := 1] wastes memory.",
        shorthand: {
          verbose: "// Manual / verbose approach\nDT$new_col <- DT$salary * 0.1\nDT$salary <- DT$salary * 1.1\n// More explicit but longer",
          concise: "DT[, c('new_col', 'salary') := .(salary * 0.1, salary * 1.1)]",
        },
      },
      {
        id: "dt-fread",
        fn: "data.table fread() — Fast CSV Reading",
        desc: "fread: fast CSV reader with auto-detect, column selection, compression support.",
        category: "data.table",
        subtitle: "fread(), auto-detect types, select, drop, colClasses, compressed files",
        signature: "fread(\"file.csv\")  |  fread(\"file.csv\", select=c(\"a\", \"b\"))  |  fread(\"file.gz\")",
        descLong: "fread is the fastest CSV reader in R — 5-10x faster than read.csv, 2-3x faster than read_csv. Auto-detects column types, handles compression natively, and allows selective column/row reading. Essential for large data files.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table fread() — Fast CSV Reading — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\n# ── Basic read ──────────────────────────────────────────\nDT <- fread(\"data/sales.csv\")\n# ── Auto-detect with column selection ───────────────────\n# Read only specific columns:\nDT <- fread(\"data/sales.csv\",\n  select = c(\"date\", \"amount\", \"region\"))\n# Read all except some:\nDT <- fread(\"data/sales.csv\",\n  drop = c(\"internal_id\", \"notes\"))\n# ── Type detection & override ───────────────────────────\n# Auto-detect types (default):\nDT <- fread(\"data/sales.csv\")  # types auto-guessed\n# Override specific columns:\nDT <- fread(\"data/sales.csv\",\n  colClasses = list(\n    character = c(\"region\", \"product\"),\n    integer = \"quantity\",\n    Date = \"date\"\n  ))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table fread() — Fast CSV Reading — common patterns you'll see in production.\n# APPROACH  - Combine data.table fread() — Fast CSV Reading with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Or by position:\nDT <- fread(\"data/sales.csv\",\n  colClasses = c(\"integer\", \"character\", \"numeric\"))\n# ── Read subset of rows ─────────────────────────────────\n# First 10,000 rows:\nDT <- fread(\"data/sales.csv\", nrows = 10000)\n# Skip rows (read starting from row 100):\nDT <- fread(\"data/sales.csv\", skip = 100)\n# ── Handle missing values ───────────────────────────────\nDT <- fread(\"data/sales.csv\",\n  na.strings = c(\"\", \"NA\", \"NULL\", \"N/A\"))\n# ── Compressed files (no decompression needed) ──────────\nDT <- fread(\"data/sales.csv.gz\")     # gzip\nDT <- fread(\"data/sales.csv.bz2\")    # bzip2\nDT <- fread(\"data/sales.csv.xz\")     # xz"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table fread() — Fast CSV Reading — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Skip lines at top (comments, metadata) ────────────\nDT <- fread(\"data/sales.csv\", skip = 3)\n# ── Performance: stringsAsFactors ────────────────────\n# Don't convert strings to factors (faster):\nDT <- fread(\"data/sales.csv\", stringsAsFactors = FALSE)"
                  }
        ],
        tips: [
                  "fread auto-detects column types on a sample — usually correct, but override if needed.",
                  "Compressed files (csv.gz, csv.bz2) are read directly — no manual decompression.",
                  "select= to read only needed columns — faster and more memory efficient.",
                  "fread is 5-10x faster than read.csv — always use fread for data.table."
        ],
        mistake: "Using read.csv() instead of fread() for large files.",
        shorthand: {
          verbose: "// Manual / verbose approach\ndf <- read.csv(\"file.csv\", stringsAsFactors=FALSE)\ndf <- df[, c(\"a\", \"b\", \"c\")]\n// More explicit but longer",
          concise: "DT <- fread(\"file.csv\", select = c(\"a\", \"b\", \"c\"))",
        },
      },
      {
        id: "dt-fwrite",
        fn: "data.table fwrite() — Fast CSV Writing",
        desc: "fwrite: fast CSV writer with compression, append mode, and optimized I/O.",
        category: "data.table",
        subtitle: "fwrite(), compression, append, scipen, row.names",
        signature: "fwrite(DT, \"output.csv\")  |  fwrite(DT, \"output.csv.gz\")  |  fwrite(DT, file, append=TRUE)",
        descLong: "fwrite is the fastest CSV writer in R — 3-5x faster than write.csv. Supports gzip/bzip2 compression natively. Can append to files. Essential for writing large datasets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table fwrite() — Fast CSV Writing — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\nDT <- data.table(\n  id = 1:5,\n  name = c('Alice', 'Bob', 'Carol', 'Dave', 'Eve'),\n  salary = c(85, 62, 92, 78, 88)\n)\n# ── Basic write ─────────────────────────────────────────\nfwrite(DT, \"output/results.csv\")\n# ── Compressed output (auto-detected by extension) ──────\nfwrite(DT, \"output/results.csv.gz\")    # gzip\nfwrite(DT, \"output/results.csv.bz2\")   # bzip2"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table fwrite() — Fast CSV Writing — common patterns you'll see in production.\n# APPROACH  - Combine data.table fwrite() — Fast CSV Writing with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Append mode (add to existing file) ───────────────────\n# Useful for incremental writes:\nfwrite(DT[1:2], \"output/log.csv\")\nfwrite(DT[3:5], \"output/log.csv\", append = TRUE)\n# ── Control decimal precision ───────────────────────────\nfwrite(DT, \"output/results.csv\", digits = 4)\n# ── Don't write row names ───────────────────────────────\nfwrite(DT, \"output/results.csv\")  # no row names by default"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table fwrite() — Fast CSV Writing — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Quote behavior ──────────────────────────────────────\n# Quote fields containing comma/newline/quote:\nfwrite(DT, \"output/results.csv\", quote = \"auto\")  # default\n# Never quote:\nfwrite(DT, \"output/results.csv\", quote = FALSE)"
                  }
        ],
        tips: [
                  "fwrite is 3-5x faster than write.csv — use for large tables.",
                  "Compression with fwrite(\"file.gz\") is transparent — no manual gzip needed.",
                  "append=TRUE is efficient for streaming/log writes."
        ],
        mistake: "Using write.csv for large files instead of fwrite.",
        shorthand: {
          verbose: "// Manual / verbose approach\nwrite.csv(DT, \"file.csv\", row.names = FALSE)\n// More explicit but longer",
          concise: "fwrite(DT, \"file.csv\")",
        },
      },
      {
        id: "dt-chaining",
        fn: "data.table Chaining — DT[...][...]  Operations",
        desc: "Chain multiple data.table operations without intermediate assignments.",
        category: "data.table",
        subtitle: "DT[...][...][...] — fluent chaining, pipe |>",
        signature: "DT[filter][, compute][, group]  |  DT |> .[filter] |> .[, compute]",
        descLong: "Chain multiple DT[i, j, by] calls without storing intermediates. Modern pipes with |> work well with data.table (using .[] syntax). Chaining is readable and memory efficient.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Chaining — DT[...][...]  Operations — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\nDT <- data.table(\n  id = 1:10,\n  dept = rep(c('IT', 'HR'), 5),\n  salary = c(80, 65, 90, 70, 85, 60, 88, 75, 92, 78),\n  years = c(5, 3, 8, 6, 2, 4, 7, 5, 9, 4)\n)\n# ── Chain with multiple brackets ────────────────────────\n# Filter → Group → Summarize\nDT[salary > 70][\n  , .(avg_sal = mean(salary), count = .N)\n][\n  , rank := rank(-avg_sal)\n]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Chaining — DT[...][...]  Operations — common patterns you'll see in production.\n# APPROACH  - Combine data.table Chaining — DT[...][...]  Operations with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Filter, compute, group chained ──────────────────────\nresult <- DT[\n  years > 3                         # i: filter\n][\n  , .(mean_sal = mean(salary),      # j: compute\n      n = .N),\n  by = dept                         # by: group\n][\n  order(-mean_sal)                  # i: order result\n]\n# ── Using pipe |> with .[] ─────────────────────────────\n# Modern R 4.1+ pipe syntax:\nresult <- DT |>\n  .[salary > 70] |>\n  .[, .(mean_sal = mean(salary)), by = dept] |>\n  .[order(-mean_sal)]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Chaining — DT[...][...]  Operations — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Complex chaining ────────────────────────────────────\nDT[\n  , bonus := salary * 0.1           # add bonus column\n][\n  dept == 'IT' & years > 4          # filter\n][\n  , .(\n    count = .N,\n    avg_salary = mean(salary),\n    avg_bonus = mean(bonus)\n  ),\n  by = dept\n]"
                  }
        ],
        tips: [
                  "Chaining with [] syntax eliminates intermediate variables — cleaner and faster.",
                  "Pipe |> with .[] is more readable for longer chains.",
                  "Each [] operation returns a data.table — continue chaining."
        ],
        mistake: "Creating intermediate variables for each step instead of chaining.",
        shorthand: {
          verbose: "r1 <- DT[salary > 75]\nr2 <- r1[, .(mean_sal = mean(salary)), by = dept]\nr3 <- r2[order(-mean_sal)]",
          concise: "DT[salary > 75][, .(mean_sal = mean(salary)), by = dept][order(-mean_sal)]",
        },
      },
      {
        id: "dt-reshape",
        fn: "data.table Reshape — melt() & dcast()",
        desc: "Reshape between long and wide formats: melt() long, dcast() wide.",
        category: "data.table",
        subtitle: "melt.data.table(), dcast.data.table(), pivot long/wide",
        signature: "melt(DT, id.vars, measure.vars)  |  dcast(DT, formula, fun.aggregate)",
        descLong: "melt converts wide to long (unpivot). dcast converts long to wide (pivot). Both are optimized for data.table speed. Essential for data cleaning and reshaping.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Reshape — melt() & dcast() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\n# ── Wide to long with melt() ───────────────────────────\nwide <- data.table(\n  id = 1:3,\n  name = c('Alice', 'Bob', 'Carol'),\n  Q1_revenue = c(100, 120, 90),\n  Q2_revenue = c(110, 130, 95),\n  Q1_cost = c(80, 100, 75),\n  Q2_cost = c(85, 105, 78)\n)\n# Melt to long format:\nlong <- melt(wide,\n  id.vars = c('id', 'name'),\n  measure.vars = c('Q1_revenue', 'Q2_revenue', 'Q1_cost', 'Q2_cost'),\n  variable.name = 'period_metric',\n  value.name = 'amount'\n)\n# Smarter melt with patterns:\nlong <- melt(wide,\n  id.vars = c('id', 'name'),\n  measure.vars = patterns('^Q[0-9]_'),\n  variable.name = 'metric',\n  value.name = 'value'\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Reshape — melt() & dcast() — common patterns you'll see in production.\n# APPROACH  - Combine data.table Reshape — melt() & dcast() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Long to wide with dcast() ───────────────────────────\nlong <- data.table(\n  id = c(1, 1, 2, 2),\n  name = c('Alice', 'Alice', 'Bob', 'Bob'),\n  metric = c('sales', 'cost', 'sales', 'cost'),\n  value = c(100, 80, 120, 100)\n)\n# Cast to wide:\nwide <- dcast(long,\n  id + name ~ metric,\n  value.var = 'value'\n)\n# ── Multiple values ────────────────────────────────────\nlong <- data.table(\n  id = c(1, 1, 2, 2),\n  month = c('Jan', 'Feb', 'Jan', 'Feb'),\n  revenue = c(100, 110, 120, 130),\n  cost = c(80, 85, 100, 105)\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Reshape — melt() & dcast() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nwide <- dcast(long,\n  id ~ month,\n  value.var = c('revenue', 'cost')\n)\n# ── Aggregate during reshape ────────────────────────────\nDT <- data.table(\n  dept = c('IT', 'IT', 'HR', 'HR'),\n  month = c('Jan', 'Feb', 'Jan', 'Feb'),\n  salary = c(80, 85, 60, 62)\n)\n# Aggregate (sum) by month:\ndcast(DT, dept ~ month, fun.aggregate = sum, value.var = 'salary')"
                  }
        ],
        tips: [
                  "melt() with patterns() for flexible column selection.",
                  "dcast() with fun.aggregate for pivot with aggregation.",
                  "Both melt/dcast are optimized for data.table — much faster than base R."
        ],
        mistake: "Using reshape() instead of melt/dcast — data.table versions are faster and cleaner.",
        shorthand: {
          verbose: "// Manual / verbose approach\ndf_long <- reshape(df_wide, direction = \"long\", varying = ...)\n// More explicit but longer",
          concise: "DT_long <- melt(DT_wide, id.vars = \"id\", measure.vars = patterns(\"^val\"))",
        },
      },
      {
        id: "dt-window-functions",
        fn: "data.table Window Functions — shift(), cumsum(), frank()",
        desc: "Window functions: shift(), cumsum(), rank functions, .N, .I for grouped operations.",
        category: "data.table",
        subtitle: "shift(), cumsum(), cumprod(), frank(), .N, .I — windowed computations",
        signature: "DT[, prev := shift(col)]  |  DT[, rank := frank(col, ties.method)]  |  DT[, cumsum := cumsum(val)]",
        descLong: "Window functions compute values across rows (lag/lead), ranks, cumulative sums, etc. Essential for time series and grouped analytics. shift() with type argument handles multiple lags/leads efficiently.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table Window Functions — shift(), cumsum(), frank() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\nDT <- data.table(\n  id = 1:6,\n  dept = c('IT', 'IT', 'HR', 'HR', 'Finance', 'Finance'),\n  date = as.Date(c('2024-01-01', '2024-01-02', '2024-01-01', '2024-01-02', '2024-01-01', '2024-01-02')),\n  revenue = c(100, 110, 80, 85, 120, 130)\n)\n# ── shift(): lag and lead ───────────────────────────────\nDT[, prev_revenue := shift(revenue)]      # lag by 1\nDT[, next_revenue := shift(revenue, -1)]  # lead by 1\nDT[, lag_2 := shift(revenue, 2)]          # lag by 2\n# ── cumsum(): cumulative sum ────────────────────────────\nDT[, cum_revenue := cumsum(revenue)]\n# ── Cumulative operations by group ──────────────────────\nDT[, cum_by_dept := cumsum(revenue), by = dept]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table Window Functions — shift(), cumsum(), frank() — common patterns you'll see in production.\n# APPROACH  - Combine data.table Window Functions — shift(), cumsum(), frank() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Rank functions: frank() ────────────────────────────\n# Rank revenue within department:\nDT[, rank := frank(-revenue), by = dept]  # -revenue for descending\n# Rank with ties handling:\nDT[, rank_ties := frank(revenue, ties.method = 'average')]\n# ── Percent rank ────────────────────────────────────────\nDT[, pct_rank := frank(revenue) / .N, by = dept]\n# ── Dense rank (no gaps) ────────────────────────────────\nDT[, dense_rank := frank(revenue, ties.method = 'dense')]\n# ── Row numbers within group ────────────────────────────\nDT[order(date), row_num := seq_len(.N), by = dept]\n# ── .N and .I for grouped operations ────────────────────\n# .N = row count in group\nDT[, dept_size := .N, by = dept]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table Window Functions — shift(), cumsum(), frank() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# .I = original row indices\nDT[, original_idx := .I]\n# Get max revenue row index per dept:\nDT[, max_idx := .I[which.max(revenue)], by = dept]\n# ── Percent of total ───────────────────────────────────\nDT[, pct_total := revenue / sum(revenue)]\n# ── lag/lead with type and fill ────────────────────────\nDT[order(date),\n  prev := shift(revenue, 1, fill = 0),\n  by = dept\n]"
                  }
        ],
        tips: [
                  "shift() is optimized for groups — much faster than lag() in dplyr.",
                  "frank() for ranking — returns numeric ranks suitable for further computation.",
                  ".N and .I are special symbols providing group metadata without extra computations.",
                  "cumsum(), cumprod(), cummin(), cummax() work within groups with by=."
        ],
        mistake: "Computing ranks or lag/lead manually with loops instead of using shift/frank.",
        shorthand: {
          verbose: "DT$prev <- NA\nfor (i in 2:nrow(DT)) {\n  DT$prev[i] <- DT$revenue[i-1]\n}",
          concise: "DT[, prev := shift(revenue)]",
        },
      },
      {
        id: "datatable-advanced",
        fn: "data.table: .SD, .SDcols, setkey, patterns",
        desc: "Advanced data.table operations for efficiency.",
        category: "data.table",
        subtitle: ".SD subset, .SDcols selection, key-based operations",
        signature: "DT[, lapply(.SD, FUN), .SDcols=patterns(...)]  |  setkey(DT, col)",
        descLong: "data.table's .SD (Subset of Data) and .SDcols allow efficient column subsetting. setkey() and keyed lookups are blazingly fast. patterns() selects columns by regex — great for wide data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of data.table: .SD, .SDcols, setkey, patterns — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(data.table)\n# ── .SD: Subset of Data ────────────────────────────────────\nDT <- data.table(\n  id=1:6, dept=c('IT','HR','IT','HR','IT','HR'),\n  salary=c(80,65,90,70,85,60),\n  bonus=c(8,7,9,7,8.5,6)\n)\n# Apply function to all numeric columns in each group:\nDT[, lapply(.SD, mean), by=dept, .SDcols=is.numeric]\n#    dept salary bonus\n# 1:   IT   85.0   8.5\n# 2:   HR   65.0   6.5\n# ── .SDcols: column selection patterns ──────────────────────\n# Select columns matching pattern:\nDT[, lapply(.SD, sum), .SDcols=patterns('^sa')]  # salary, salary\n#    salary\n# 1:    510\n# With grep pattern:\nDT[, lapply(.SD, sum), .SDcols=c('salary', 'bonus')]\n#    salary bonus\n# 1:    510    45.5\n# ── Applying different functions to different columns ──────\nDT[, c(lapply(.SD[, .(salary, bonus)], mean),\n        lapply(.SD[, .(id)], sum)), .SDcols=c('salary', 'bonus', 'id')]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of data.table: .SD, .SDcols, setkey, patterns — common patterns you'll see in production.\n# APPROACH  - Combine data.table: .SD, .SDcols, setkey, patterns with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Better: with .() notation\nDT[, .(\n  salary_mean = mean(salary),\n  bonus_mean = mean(bonus),\n  n = .N\n), by=dept]\n# ── setkey: fast lookups ───────────────────────────────────\nsetkey(DT, dept)\n# Now lookup is O(log n):\nDT['IT']       # all IT rows\nDT[.('IT')]    # same, explicit syntax\n# ── binary search by key ───────────────────────────────────\nsetkey(DT, dept, id)  # compound key\nDT[.('IT', 3)]        # dept='IT' AND id=3\nDT[.('HR'), on=c(dept='dept')]  # explicit column mapping\n# ── setindex: faster alternative to setkey ────────────────\nsetindex(DT, dept)  # doesn't reorder DT, just creates index\n# Lookup still works the same way, but DT stays in original order\n# ── between: range queries ────────────────────────────────\nDT[between(salary, 70, 85)]  # salary in [70, 85]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of data.table: .SD, .SDcols, setkey, patterns — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── shift: lead/lag ────────────────────────────────────────\nDT[order(id), prev_sal := shift(salary)]  # lag by 1\n#    prev_sal is NA for first row\nDT[, next_sal := shift(salary, -1)]  # lead by 1 (look ahead)\n# ── rolling joins (LOCF) ───────────────────────────────────\n# Match each row to the most recent previous key value\nprices <- data.table(\n  date = as.Date(c('2024-01-01','2024-01-05','2024-01-10')),\n  price = c(100, 105, 102)\n)\nsetkey(prices, date)\nqueries <- data.table(\n  date = as.Date(c('2024-01-03','2024-01-07'))\n)\nsetkey(queries, date)\n# Join: find price as of each query date\nprices[queries, roll=TRUE]  # Last Observation Carried Forward"
                  }
        ],
        tips: [
                  "setkey() for multiple lookups on the same column(s) — index is built once",
                  ".SD + lapply is powerful for applying functions to groups of columns",
                  "between() is optimized on keyed columns — vectorized range queries",
                  "roll=TRUE for time series lookups: match to most recent past value"
        ],
        mistake: "Not setting keys when doing repeated lookups on the same column. Each unkeyed lookup is O(n); keyed is O(log n).",
        shorthand: {
          verbose: "// Manual / verbose approach\nsetkey(dt, date)\nprices[queries, roll=TRUE]\n// More explicit but longer",
          concise: "prices[queries, on=.(date), roll=TRUE]",
        },
      },
    ],
  },
]

export default { meta, sections }
