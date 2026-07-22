export const meta = {
  "title": "Pandas",
  "domain": "python",
  "sheet": "pandas",
  "icon": "🐼"
}

export const sections = [

  // ── Section 1: Reading, Writing & Performance ─────────────────────────────────────────
  {
    id: "io",
    title: "Reading, Writing & Performance",
    entries: [
      {
        id: "dataframe-constructor",
        fn: "pd.DataFrame()",
        desc: "Create a DataFrame from a dict, list, ndarray, or another DataFrame.",
        category: "I/O",
        subtitle: "The primary data structure — create from dict, list, or ndarray",
        signature: "pd.DataFrame(data, index=None, columns=None, dtype=None)",
        descLong: "pd.DataFrame() is the constructor for pandas's primary 2D data structure. The most common input is a dict of lists (one key per column). Also accepts lists of dicts, 2D numpy arrays, and other DataFrames.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.DataFrame() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             column. Read .shape and .columns to confirm what came out.\n#             whole shape (3 rows, 3 cols) is visible inline.\n#             custom index) or any type/memory considerations.\n#\nimport pandas as pd\ndf = pd.DataFrame({\n    \"name\":  [\"Alice\", \"Bob\", \"Carol\"],\n    \"age\":   [30, 25, 35],\n    \"score\": [92.5, 88.0, 95.5],\n})\ndf.shape       # (3, 3)\ndf.columns     # Index(['name', 'age', 'score'], dtype='object')"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.DataFrame() — common patterns you'll see in production.\n# APPROACH  - Combine pd.DataFrame() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             list of dicts, numpy array, and a custom index. End by\n#             inspecting dtypes/index — the diagnostics that matter\n#             after every construction.\n#             habit of inspecting dtypes immediately after building.\n#             frames that's wasted memory (see senior tier).\n#\nimport pandas as pd\nimport numpy as np\n# 1. Dict of lists — the clearest form, one key per column\ndf = pd.DataFrame({\n    \"name\":  [\"Alice\", \"Bob\", \"Carol\"],\n    \"age\":   [30, 25, 35],\n    \"score\": [92.5, 88.0, 95.5],\n})\n# 2. List of dicts — natural when collecting records one at a time\ndf = pd.DataFrame([\n    {\"name\": \"Alice\", \"age\": 30},\n    {\"name\": \"Bob\",   \"age\": 25},\n])\n# 3. Numpy array + explicit columns — for numeric matrices\ndf = pd.DataFrame(np.random.randn(5, 3), columns=[\"A\", \"B\", \"C\"])\n# 4. Custom index — labels rows by something meaningful\ndf = pd.DataFrame({\"val\": [1, 2, 3]}, index=[\"a\", \"b\", \"c\"])\n# 5. Empty DataFrame with known structure — useful for accumulation\ndf = pd.DataFrame(columns=[\"name\", \"age\", \"score\"])\n# Always inspect after construction:\ndf.shape, df.dtypes, df.columns, df.index"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.DataFrame() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             use nullable extension dtypes (\"Int64\", \"string\") so\n#             missing values don't silently coerce to float, and prefer\n#             pd.from_records or pd.from_dict when the input shape is\n#             fixed and large.\n#             integer columns integer when nulls appear, and signals\n#             intent to readers; ready for memory-tight pipelines.\n#             capital I) still surprise readers used to numpy ints; some\n#             ecosystem libs don't yet round-trip them perfectly.\n#\nimport pandas as pd\n# Pin dtypes at construction — no inference cost, no NaN-coercion\ndf = pd.DataFrame(\n    {\n        \"id\":     [1, 2, 3, None],\n        \"amount\": [9.99, 4.50, None, 1.25],\n        \"city\":   [\"NYC\", \"LA\", \"NYC\", \"SF\"],\n    }\n).astype({\n    \"id\":     \"Int64\",       # nullable integer (capital I) — keeps None as <NA>\n    \"amount\": \"float32\",     # half the memory of float64\n    \"city\":   \"category\",    # dictionary-encoded for low-cardinality strings\n})\ndf.dtypes\n# id        Int64\n# amount    float32\n# city      category\ndf.memory_usage(deep=True)   # 'deep=True' counts string content, not pointers\n# When the input is a list of records, from_records skips the dict step:\nrecords = [(1, \"NYC\"), (2, \"LA\"), (3, \"SF\")]\ndf2 = pd.DataFrame.from_records(records, columns=[\"id\", \"city\"])\n# Anti-pattern to avoid:\n#   df = pd.DataFrame([[1,2,3],[4,5,6]])\n# columns become 0/1/2 — easy to confuse with row indices.\n# Decision rule:\n#   Wide table, fixed schema                  -> dict of lists or dict of arrays\n#   Streaming records (one at a time)         -> list of dicts, then DataFrame(...)\n#   Need typed integers with nulls            -> pin dtype=\"Int64\" (capital I, nullable)\n#   Low-cardinality string column              -> dtype=\"category\" (10-100x memory win)\n#   Tight memory                               -> from_records + .astype({...}) up front\n#   Coming from sklearn/numpy                  -> pd.DataFrame(arr, columns=[...])\n#   Need known-shape empty frame               -> pd.DataFrame(columns=[...], dtype=...)\n#\n# Anti-pattern: building a DataFrame by repeated df.append() / pd.concat() in a loop\n#   Each append re-allocates the whole frame -> O(n^2). For N rows of streaming\n#   data, accumulate in a list of dicts and call pd.DataFrame(records) ONCE at\n#   the end. The append() method itself was deprecated in pandas 2.0."
                  }
        ],
        tips: [
                  "Dict of lists is the clearest constructor — one key per column, all lists the same length",
                  "List of dicts is natural when you're collecting records one at a time",
                  "`pd.DataFrame(columns=[...])` creates an empty DataFrame with known structure — useful for accumulation",
                  "Always call `df.info()` immediately after construction to verify types and null counts"
        ],
        mistake: "Creating a DataFrame from a list of lists without specifying `columns=`. You get integer column names (0, 1, 2) which are easy to confuse with row indices.",
        shorthand: {
          verbose: "import pandas as pd\nimport numpy as np\ndf = pd.DataFrame({\n'name':   ['Alice', 'Bob', 'Carol'],",
          concise: "df.index        # Row index",
        },
      },
      {
        id: "series-constructor",
        fn: "pd.Series()",
        desc: "Create a one-dimensional labeled array.",
        category: "I/O",
        subtitle: "A single column — the building block of a DataFrame",
        signature: "pd.Series(data, index=None, name=None, dtype=None)",
        descLong: "pd.Series is a 1D labeled array. Every DataFrame column is a Series. Understanding Series operations is essential because most pandas methods return a Series. A Series has both values (numpy array) and an index.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.Series() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             index, no name, no special dtype.\n#             is \"values + index\" with nothing extra.\n#             behavior — those are what makes Series different from a list.\n#\nimport pandas as pd\ns = pd.Series([10, 20, 30, 40])\ns.values        # array([10, 20, 30, 40])\ns.index         # RangeIndex(start=0, stop=4, step=1)\ns.dtype         # int64"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.Series() — common patterns you'll see in production.\n# APPROACH  - Combine pd.Series() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             behaves inside a DataFrame, and the everyday properties\n#             you'll inspect (values, index, name, dtype).\n#             \"the column name when this Series is put in a DataFrame\".\n#             mismatched indexes silently produces NaN. Senior tier\n#             surfaces it.\n#\nimport pandas as pd\n# Construct\ns = pd.Series([10, 20, 30], index=[\"a\", \"b\", \"c\"])\ns = pd.Series({\"a\": 1, \"b\": 2, \"c\": 3})           # dict keys become index\ns = pd.Series(0, index=[\"a\", \"b\", \"c\"])           # scalar broadcast\ns = pd.Series([1, 2, 3], name=\"score\")            # name = future column name\n# Series come from DataFrames too\ndf = pd.DataFrame({\"age\": [30, 25], \"score\": [92, 88]})\ncol = df[\"age\"]                  # column -> Series\nrow = df.iloc[0]                 # row    -> Series\n# Properties worth knowing\ns.values, s.index, s.name, s.dtype, s.shape\n# Series <-> DataFrame\ns.to_frame()                                       # 1-col DataFrame\npd.DataFrame({\"a\": col, \"b\": col + 1})             # build a DF from Series"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.Series() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             nullable extension dtypes for missing-aware integers and\n#             strings, and prefer .to_numpy() over .values for clarity.\n#             ints integer when nulls appear; .to_numpy() is the\n#             pandas-recommended accessor.\n#             expects numpy ints; alignment behavior can't be turned off,\n#             so you have to plan around it (.reset_index, .reindex).\n#\nimport pandas as pd\n# 1. Index alignment — pandas matches by LABEL, not position\na = pd.Series([1, 2, 3], index=[\"x\", \"y\", \"z\"])\nb = pd.Series([10, 20, 30], index=[\"y\", \"z\", \"w\"])\na + b\n# w     NaN     <- present only in b\n# x     NaN     <- present only in a\n# y    12.0\n# z    23.0     <- aligned by label, not position\n# To add by position, drop or reset the index first:\n(a.reset_index(drop=True) + b.reset_index(drop=True))   # 11, 22, 33\n# 2. Nullable dtypes keep semantics intact in the presence of NaN\nids = pd.Series([1, 2, None, 4], dtype=\"Int64\")     # capital I = nullable int\nnames = pd.Series([\"a\", None, \"c\"], dtype=\"string\") # nullable string ext type\nids.isna()        # boolean Series\nids.sum()         # 7   — null skipped, no float coercion\n# 3. Prefer .to_numpy() over .values (pandas-recommended; supports nullable)\narr = ids.to_numpy(dtype=\"float64\", na_value=float(\"nan\"))\n# Decision rule:\n#   Numeric column from list                  -> pd.Series(values) (numpy default)\n#   Need null support on integers              -> pd.Series(..., dtype=\"Int64\")\n#   Strings with frequent missing               -> dtype=\"string\" (StringDtype, nullable)\n#   Boolean with NaN                            -> dtype=\"boolean\" (NOT bool — bool can't hold NA)\n#   Datetime column                             -> pd.to_datetime(values, utc=True)\n#   Index-aligned arithmetic with another Series -> set the same .index on both\n#   One-off scalar broadcast                     -> pd.Series(scalar, index=existing.index)\n#\n# Anti-pattern: pd.Series([1, 2, None]) and expecting integer dtype\n#   numpy int64 has no NaN; pandas silently upcasts to float64 — your \"ints\"\n#   become 1.0, 2.0, NaN. Use dtype=\"Int64\" (the nullable extension type) when\n#   you need integers that survive missing values."
                  }
        ],
        tips: [
                  "Every DataFrame column is a Series — all Series methods apply to df[\"col\"]",
                  "`s.values` returns the underlying numpy array — use for fast numeric operations",
                  "`s.to_frame()` converts back to a single-column DataFrame",
                  "A Series index aligns operations — `s1 + s2` aligns on index labels, not position"
        ],
        mistake: "Treating a Series like a list and ignoring the index. When two Series are added, pandas aligns by index label — not position. Mismatched indexes produce NaN.",
        shorthand: {
          verbose: "import pandas as pd\ns = pd.Series([10, 20, 30, 40])\ns = pd.Series([10, 20, 30], index=['a', 'b', 'c'])\ns = pd.Series({'a': 1, 'b': 2, 'c': 3})",
          concise: "pd.DataFrame({'a': s1, 'b': s2}) # combine two Series",
        },
      },
      {
        id: "read-csv",
        fn: "pd.read_csv()",
        desc: "Load a CSV file into a DataFrame.",
        category: "I/O",
        subtitle: "The workhorse loader — always specify dtype= and usecols=",
        signature: "pd.read_csv(path, dtype=None, usecols=[], parse_dates=[], nrows=None)",
        descLong: "read_csv() is the most-used pandas function. Always specify usecols= to avoid loading unneeded columns, dtype= to prevent silent type inference, and parse_dates= for datetime columns. For files larger than memory, use chunksize=.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.read_csv() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             else (header, separator, types).\n#             and notebook exploration.\n#             expect to be int may come back as object on one machine\n#             and int64 on another. No control over memory or columns.\n#\nimport pandas as pd\ndf = pd.read_csv(\"data.csv\")\ndf.head()\ndf.dtypes               # always inspect — see what pandas inferred"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.read_csv() — common patterns you'll see in production.\n# APPROACH  - Combine pd.read_csv() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             (don't trust inference), parse_dates, index_col, na_values.\n#             Round-trip with to_csv.\n#             ETL code; loading only what you need is the cheapest\n#             memory win.\n#             out-of-RAM files you need chunksize (senior tier) or\n#             switch to Parquet.\n#\nimport pandas as pd\ndf = pd.read_csv(\n    \"data.csv\",\n    usecols     = [\"id\", \"date\", \"amount\"],\n    dtype       = {\"id\": \"Int64\", \"amount\": \"float64\"},   # explicit\n    parse_dates = [\"date\"],\n    index_col   = \"id\",\n    na_values   = [\"\", \"NULL\", \"N/A\", \"-\"],\n    encoding    = \"utf-8\",\n)\n# Quick sanity check\ndf.dtypes              # confirm types match expectation\ndf.shape, df.isna().sum()\n# Round-trip\ndf.to_csv(\"out.csv\", index=False)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.read_csv() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             than RAM, aggregate inside the loop (don't accumulate\n#             chunks), pyarrow engine for speed, and the standing\n#             advice — switch to Parquet for any intermediate file.\n#             with engine=\"pyarrow\"; aggregation pattern scales to\n#             multi-GB CSVs without blowing the heap.\n#             iterations); pyarrow engine has slightly different\n#             error messages and edge cases vs the C engine; the real\n#             answer for big data is \"stop using CSV\".\n#\nimport pandas as pd\n# 1. Chunked aggregation — process and reduce per chunk\nrunning = []\nfor chunk in pd.read_csv(\n    \"huge.csv\",\n    chunksize   = 100_000,\n    usecols     = [\"region\", \"amount\"],\n    dtype       = {\"region\": \"category\", \"amount\": \"float32\"},\n    engine      = \"pyarrow\",        # 2-5x faster than the default C engine\n):\n    running.append(chunk.groupby(\"region\", observed=True)[\"amount\"].sum())\ntotals = pd.concat(running).groupby(level=0).sum()\n# 2. Sniff the schema with nrows= before committing to a full load\nsniff = pd.read_csv(\"huge.csv\", nrows=1000)\nsniff.dtypes              # decide dtype= overrides for the real load\n# 3. Wrong format for the job — switch to Parquet whenever possible\n# df.to_parquet(\"data.parquet\")     # write once\n# pd.read_parquet(\"data.parquet\", columns=[\"region\", \"amount\"])  # column-selective\n# Decision rule:\n#   < 100 MB, ad-hoc                           -> pd.read_csv(path) (defaults are fine)\n#   Big file, only need some columns           -> usecols=[...] (skips parsing other cols)\n#   Tight memory                                -> dtype={...} + chunksize=N\n#   Mixed/dirty data                            -> on_bad_lines='skip', engine='python'\n#   Speed > flexibility                         -> engine='pyarrow' (~3-10x faster on wide data)\n#   Need full datetime control                  -> parse_dates=[...] + date_format=...\n#   File too big for one machine                -> dask.read_csv or polars.read_csv_batched\n#   Need to preserve types exactly              -> use parquet, not CSV\n#\n# Anti-pattern: pd.read_csv(\"big.csv\") with default dtype inference on production data\n#   pandas walks the file once just to GUESS dtypes (every column starts as object,\n#   then narrows). Pin dtype={\"id\": \"int32\", \"city\": \"category\"} up front: skips\n#   the inference pass AND keeps memory predictable. Combine with usecols= so you\n#   don't pay for columns you'll drop anyway."
                  }
        ],
        tips: [
                  "Always `usecols=` on wide CSVs — loading 100 columns when you need 5 wastes memory",
                  "`parse_dates=[\"col\"]` parses a specific column; `parse_dates=True` only parses the index",
                  "`dtype={\"id\": \"Int64\"}` uses nullable integer — handles NaN without converting to float",
                  "Parquet is 10x faster to read than CSV — use it for all intermediate storage"
        ],
        mistake: "Not specifying `dtype=` on load. Pandas guesses types by scanning rows — it may read numeric IDs as int64 on your machine but object on another. Be explicit.",
        shorthand: {
          verbose: "import pandas as pd\ndf = pd.read_csv('data.csv')\n# then manually set types:\ndf['date'] = pd.to_datetime(df['date'])\ndf['amount'] = df['amount'].astype(float)\ndf = df.dropna(subset=['id'])",
          concise: "df = pd.read_csv('data.csv',\n    parse_dates=['date'],\n    dtype={'amount': float},\n    na_values=['N/A', ''],\n    index_col='id')",
        },
      },
      {
        id: "read-excel",
        fn: "pd.read_excel()",
        desc: "Load an Excel file into a DataFrame.",
        category: "I/O",
        subtitle: "Reads .xlsx and .xls — specify sheet_name= for multi-sheet files",
        signature: "pd.read_excel(path, sheet_name=0, dtype=None, usecols=None)",
        descLong: "read_excel() reads Excel files. sheet_name= can be a name, index, or None (returns all sheets as a dict). Requires openpyxl for .xlsx files. Use ExcelWriter to write multiple sheets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.read_excel() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             return is a normal DataFrame.\n#             default dtypes; no usecols / parse_dates filtering.\n#\nimport pandas as pd\ndf = pd.read_excel(\"data.xlsx\")            # implicitly sheet_name=0\ndf.head()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.read_excel() — common patterns you'll see in production.\n# APPROACH  - Combine pd.read_excel() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             types, and write multiple sheets via ExcelWriter. This is\n#             the call shape you want in repeatable scripts.\n#             output; explicit sheet_name prevents the \"wrong sheet\"\n#             bug when files grow.\n#             very large workbooks — that's the senior tier's concern.\n#\nimport pandas as pd\n# Read a specific sheet with type controls\ndf = pd.read_excel(\n    \"data.xlsx\",\n    sheet_name  = \"Sales\",\n    usecols     = [\"date\", \"amount\", \"region\"],\n    dtype       = {\"amount\": \"float64\"},\n    parse_dates = [\"date\"],\n    skiprows    = 1,\n)\n# Write back — multi-sheet via ExcelWriter\nwith pd.ExcelWriter(\"out.xlsx\") as w:\n    df.to_excel(w, sheet_name=\"Data\", index=False)\n    df.groupby(\"region\")[\"amount\"].sum().to_excel(w, sheet_name=\"Summary\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.read_excel() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             load all sheets in one round-trip when needed, and prefer\n#             a CSV/Parquet conversion step for very large workbooks\n#             since openpyxl is single-threaded and slow.\n#             when a vendor delivers a 50-sheet workbook; converting\n#             once to Parquet pays back on every subsequent read.\n#             consumers; sheet_name=None loads everything which can\n#             still OOM on huge workbooks — process per-sheet if so.\n#\nimport pandas as pd\n# 1. Discover sheet names first\nall_sheets = pd.read_excel(\"data.xlsx\", sheet_name=None)   # dict[name -> df]\nlist(all_sheets.keys())            # ['Sales', 'Summary', 'Costs', ...]\n# 2. Stack same-shape sheets into one frame for analysis\ncombined = pd.concat(\n    [df.assign(_sheet=name) for name, df in all_sheets.items()],\n    ignore_index=True,\n)\n# 3. Big workbooks: convert once, query many times\n# for name, df in all_sheets.items():\n#     df.to_parquet(f\"cache/{name}.parquet\")\n# 4. Streaming-style read for one giant sheet (openpyxl read_only mode)\n# import openpyxl\n# wb = openpyxl.load_workbook(\"huge.xlsx\", read_only=True, data_only=True)\n# rows = wb[\"Sales\"].iter_rows(values_only=True)   # iterator — bounded memory\n# Sanity rule: if the workbook is >100MB or appears in a daily pipeline,\n# convert it to Parquet (or CSV) once and read THAT going forward.\n# Decision rule:\n#   Single sheet, defaults                     -> pd.read_excel(path)\n#   Pick a specific sheet                       -> sheet_name=\"Q4\" (or index)\n#   ALL sheets at once                          -> sheet_name=None -> dict[name, DataFrame]\n#   Skip the title rows                         -> header=N or skiprows=N\n#   Performance matters / cross-platform        -> openpyxl explicit; calamine for >5x speed\n#   Output back to Excel                        -> df.to_excel(..., engine=\"openpyxl\")\n#   Multiple frames -> one workbook             -> pd.ExcelWriter(path) + multiple to_excel calls\n#   Truly large data                            -> stop using Excel; switch to parquet/csv\n#\n# Anti-pattern: read_excel for files > 50 MB or in a hot path\n#   openpyxl parses the entire XML zip into memory; expect 5-10x file size in\n#   RAM and seconds-per-file. For ETL, convert once to parquet then never touch\n#   the .xlsx again. If you must, try engine=\"calamine\" (Rust-fast)."
                  }
        ],
        tips: [
                  "`sheet_name=None` reads ALL sheets and returns a dict — useful for unknown sheet names",
                  "Install openpyxl: `pip install openpyxl` — required for .xlsx files",
                  "`pd.ExcelWriter` context manager writes multiple sheets to one file",
                  "For large Excel files, consider exporting to CSV first — read_csv is much faster"
        ],
        mistake: "Using `sheet_name=0` assuming it is the right sheet when the file has multiple sheets. Print `pd.read_excel(path, sheet_name=None).keys()` to see sheet names first.",
        shorthand: {
          verbose: "import pandas as pd\ndf = pd.read_excel('data.xlsx')\ndf = pd.read_excel('data.xlsx', sheet_name='Sales')\ndf = pd.read_excel('data.xlsx', sheet_name=0)      # first sheet",
          concise: "df2.to_excel(w, sheet_name='Summary', index=False)",
        },
      },
      {
        id: "read-sql",
        fn: "pd.read_sql()",
        desc: "Load a SQL query result into a DataFrame.",
        category: "I/O",
        subtitle: "Query any SQLAlchemy-supported database directly into pandas",
        signature: "pd.read_sql(query, con=engine, params=None)",
        descLong: "read_sql() executes a SQL query against a database connection and returns the result as a DataFrame. Use SQLAlchemy to create the engine. For writing back, use df.to_sql().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.read_sql() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             ideal for a notebook or one-off script.\n#             so a wide query loads everything into memory at once.\n#\nfrom sqlalchemy import create_engine\nimport pandas as pd\nengine = create_engine(\"sqlite:///local.db\")\ndf = pd.read_sql(\"SELECT id, name, amount FROM sales\", engine)\ndf.head()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.read_sql() — common patterns you'll see in production.\n# APPROACH  - Combine pd.read_sql() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             when you want a whole table, and to_sql for write-back\n#             with explicit if_exists semantics.\n#             the SQL-injection hole; if_exists makes write intent\n#             explicit (replace vs append).\n#             row-by-row INSERT — slow for big writes (senior tier).\n#\nfrom sqlalchemy import create_engine\nimport pandas as pd\nengine = create_engine(\"postgresql://user:pass@host/db\")\n# Parameterized — values bound by the driver, not interpolated\ndf = pd.read_sql(\n    \"SELECT * FROM sales WHERE year = :year AND region = :region\",\n    engine,\n    params={\"year\": 2024, \"region\": \"WEST\"},\n)\n# Whole-table read\ndf = pd.read_sql_table(\"sales\", engine)\n# Write — be explicit about replace vs append\ndf.to_sql(\"sales_snapshot\", engine, if_exists=\"replace\", index=False)\ndf.to_sql(\"sales_audit\",    engine, if_exists=\"append\",  index=False)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.read_sql() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             pandas' inference pass, server-side cursor for true\n#             streaming, fast bulk insert via method=\"multi\" /\n#             chunksize, and dispose() on shutdown.\n#             10-100x faster than row-by-row; transactional context\n#             keeps writes atomic across multiple to_sql calls.\n#             dialects (older MySQL, Oracle) don't accept the same\n#             insert hints; method=\"multi\" can hit max-packet limits\n#             on huge frames — tune chunksize.\n#\nfrom sqlalchemy import create_engine, text\nimport pandas as pd\nengine = create_engine(\"postgresql://user:pass@host/db\", future=True)\n# 1. Chunked, aggregating read — bounded memory\nrunning = []\nfor chunk in pd.read_sql(\n    text(\"SELECT region, amount FROM events WHERE year = :y\"),\n    engine,\n    params={\"y\": 2024},\n    chunksize=50_000,\n    dtype={\"amount\": \"float32\"},          # skip inference pass per chunk\n):\n    running.append(chunk.groupby(\"region\", observed=True)[\"amount\"].sum())\ntotals = pd.concat(running).groupby(level=0).sum()\n# 2. Bulk write with multi-row INSERT — much faster than default\ndf.to_sql(\n    \"events_rollup\", engine,\n    if_exists=\"append\", index=False,\n    method=\"multi\", chunksize=10_000,\n)\n# 3. Multi-statement atomicity\nwith engine.begin() as conn:\n    df.to_sql(\"staging\", conn, if_exists=\"replace\", index=False)\n    conn.execute(text(\"INSERT INTO final SELECT * FROM staging\"))\n# 4. Always release pooled connections at process exit\nengine.dispose()\n# Decision rule:\n#   Quick SELECT                                -> pd.read_sql(sql, conn)\n#   Whole table                                  -> pd.read_sql_table(name, engine)\n#   Big result set                                -> chunksize=10000 + concatenate (or stream)\n#   Pinned dtypes                                 -> dtype={...} on read or .astype after\n#   Parameterized query                           -> params={\"id\": 7} (NEVER f-string)\n#   Speed at scale                                -> connectorx (pip install) — 5-10x faster\n#   Want a DataFrame, want SQLAlchemy 2.0         -> session.execute(stmt) + .df() helpers\n#   Already have polars/duckdb in the stack      -> read directly there; faster + saner\n#\n# Anti-pattern: f-string SQL building -> pd.read_sql(f\"SELECT * FROM users WHERE id={uid}\", conn)\n#   Classic SQL injection. Use parameter substitution: pd.read_sql(\n#       \"SELECT * FROM users WHERE id = :uid\", conn, params={\"uid\": uid})\n#   The DBAPI handles quoting and types; you stay safe and your query plan is cacheable."
                  }
        ],
        tips: [
                  "Use parameterized queries (`:param`) — never f-string user input into SQL",
                  "`if_exists=\"replace\"` drops and recreates the table; `\"append\"` adds rows",
                  "`chunksize=` in both read and write — essential for large tables",
                  "Close the engine when done: `engine.dispose()`"
        ],
        mistake: "Using string formatting to inject values into SQL: `f\"WHERE year = {year}\"`. This is a SQL injection vulnerability. Use `params={\"year\": year}` instead.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "read-parquet",
        fn: "pd.read_parquet()",
        desc: "Read and write Parquet files — the best format for pandas data.",
        category: "I/O",
        subtitle: "Typed, compressed, column-selective — 10x faster than CSV",
        signature: "pd.read_parquet(path, columns=None, engine=\"pyarrow\")",
        descLong: "Parquet is a columnar binary format that preserves dtypes, compresses well, and supports column-selective reads. Reading only the columns you need from a large Parquet file is O(columns) not O(all_columns) — a massive win for wide datasets. Always use Parquet for intermediate storage between pipeline steps.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.read_parquet() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             it back. Dtypes survive without any extra ceremony.\n#             round-trip, no parse_dates needed, no na_values needed.\n#             predicate pushdown, partitioning) — those are the senior\n#             reasons to choose Parquet at all.\n#\nimport pandas as pd\ndf.to_parquet(\"data.parquet\")\ndf2 = pd.read_parquet(\"data.parquet\")\ndf2.dtypes        # identical to df.dtypes — types preserved"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.read_parquet() — common patterns you'll see in production.\n# APPROACH  - Combine pd.read_parquet() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             columns at read time (huge speedup), and read a directory\n#             of partitioned files as one frame.\n#             reason to use Parquet over CSV; compression choice is\n#             usually a one-liner with measurable size impact.\n#             which is the next-level optimization for huge files.\n#\nimport pandas as pd\n# Write — pick compression based on use case\ndf.to_parquet(\"data.parquet\")                                # snappy default\ndf.to_parquet(\"data_small.parquet\", compression=\"zstd\")      # best ratio\ndf.to_parquet(\"data_compat.parquet\", compression=\"gzip\")     # broadest support\n# Read only the columns you need — skips the rest at the file level\ndf = pd.read_parquet(\"data.parquet\", columns=[\"id\", \"date\", \"amount\"])\n# Partitioned datasets (directory of files written by Spark/Dask) read\n# as one logical DataFrame\ndf = pd.read_parquet(\"events/\")                              # all partitions\ndf = pd.read_parquet(\"events/\", columns=[\"region\", \"amount\"])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.read_parquet() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             partition pruning when writing, and a streaming read for\n#             frames that would still OOM all-at-once.\n#             filter — orders of magnitude less I/O on big datasets;\n#             partition_cols turns \"WHERE year=2024\" into \"open one\n#             folder\" without any DB; pyarrow's RecordBatchReader\n#             gives bounded-memory streaming.\n#             statistics actually discriminate (sorted/clustered data);\n#             over-partitioning produces too many small files and hurts\n#             read perf — pick partition columns with care.\n#\nimport pandas as pd\nimport pyarrow.parquet as pq\n# 1. Partitioned write — Hive-style folder layout\ndf.to_parquet(\n    \"events/\",\n    partition_cols=[\"year\", \"region\"],\n    compression=\"zstd\",\n    index=False,\n)\n# events/year=2024/region=WEST/<file>.parquet  (etc.)\n# 2. Row-level filter (predicate pushdown) — far less I/O than read-then-filter\ntable = pq.read_table(\n    \"events/\",\n    columns=[\"id\", \"amount\"],\n    filters=[(\"year\", \"=\", 2024), (\"region\", \"in\", [\"WEST\", \"EAST\"])],\n)\ndf = table.to_pandas()\n# 3. Streaming — bounded memory regardless of file size\npf = pq.ParquetFile(\"huge.parquet\")\nrunning = []\nfor batch in pf.iter_batches(batch_size=100_000, columns=[\"region\", \"amount\"]):\n    chunk = batch.to_pandas()\n    running.append(chunk.groupby(\"region\", observed=True)[\"amount\"].sum())\ntotals = pd.concat(running).groupby(level=0).sum()\n# Standing rule: CSV for human inspection / sharing,\n#                Parquet for any intermediate file in a pipeline.\n# Decision rule:\n#   Modern columnar store                       -> parquet over CSV every time\n#   Need only some columns                      -> columns=[...] (zero IO for the rest)\n#   Partitioned dataset                         -> pd.read_parquet(dir/, filters=[...])\n#   Speed-critical                               -> engine=\"pyarrow\" (default) over fastparquet\n#   Need to roundtrip categorical dtypes        -> parquet preserves them; CSV doesn't\n#   Cloud (S3 / GCS)                             -> pd.read_parquet(\"s3://...\") (uses fsspec)\n#   Cross-process pipeline                       -> parquet is the canonical handoff format\n#   Need row-by-row streaming                    -> use pyarrow.dataset directly, not pandas\n#\n# Anti-pattern: round-tripping data through CSV instead of parquet\n#   CSV strips dtypes, doesn't preserve nulls vs empty strings, can't store\n#   categoricals or datetimes natively. Every read pays the inference tax.\n#   Parquet is 5-20x smaller, 10-50x faster to read, and lossless on dtypes.\n#   Treat CSV as ingestion-only; parquet for everything internal."
                  }
        ],
        tips: [
                  "Install: `pip install pyarrow` — required for read/write parquet",
                  "`columns=[\"a\",\"b\"]` at read time only loads those columns — skips the rest entirely",
                  "Parquet preserves all pandas dtypes including category, datetime, and nullable int",
                  "Use Parquet for any intermediate file in a pipeline — never CSV between steps"
        ],
        mistake: "Using CSV for intermediate storage between pipeline steps. CSV loses dtypes (forces re-inference on every load), is uncompressed, and is 10x slower to read. Use to_parquet() / read_parquet() instead.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "dtype-opt",
        fn: "dtype optimization",
        desc: "Reduce DataFrame memory by downcasting numeric types and using category.",
        category: "Performance",
        subtitle: "Halve memory with float32, int32, and category dtypes",
        signature: "pd.to_numeric(s, downcast=\"integer\") | col.astype(\"category\")",
        descLong: "The biggest memory wins come from downcasting float64→float32, int64→int32, and converting low-cardinality string columns to category. A well-optimized DataFrame often uses 50-80% less memory than the default.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of dtype optimization — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             a smaller dtype, cast a low-cardinality string to category.\n#             Measure the before/after with memory_usage(deep=True).\n#             any helper functions; immediately visible savings.\n#             want a sweep (junior tier) and ideally pinned dtypes at\n#             load time (senior tier).\n#\nimport pandas as pd\nbefore = df.memory_usage(deep=True).sum() / 1e6\ndf[\"amount\"] = df[\"amount\"].astype(\"float32\")     # 64 -> 32 bits\ndf[\"city\"]   = df[\"city\"].astype(\"category\")      # dictionary encode\nafter = df.memory_usage(deep=True).sum() / 1e6\nprint(f\"{before:.1f}MB -> {after:.1f}MB\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of dtype optimization — common patterns you'll see in production.\n# APPROACH  - Combine dtype optimization with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             downcast=...) and convert low-cardinality object columns\n#             to category. Wrap in a helper so it's reusable.\n#             threshold (<50% unique) is a reasonable default for\n#             auto-categorizing strings.\n#             tables; categories created post-hoc cost a full pass.\n#             Better to pin dtypes at load time (senior tier).\n#\nimport pandas as pd\ndef reduce_memory(df: pd.DataFrame) -> pd.DataFrame:\n    for col in df.select_dtypes(\"float\").columns:\n        df[col] = pd.to_numeric(df[col], downcast=\"float\")\n    for col in df.select_dtypes(\"integer\").columns:\n        df[col] = pd.to_numeric(df[col], downcast=\"integer\")\n    for col in df.select_dtypes(\"object\").columns:\n        if df[col].nunique() / len(df) < 0.5:                # <50% unique\n            df[col] = df[col].astype(\"category\")\n    return df\nbefore = df.memory_usage(deep=True).sum() / 1e6\ndf = reduce_memory(df)\nafter  = df.memory_usage(deep=True).sum() / 1e6\nprint(f\"{before:.1f}MB -> {after:.1f}MB ({100*(1-after/before):.0f}% saved)\")\n# Per-column attribution:\ndf.memory_usage(deep=True).sort_values(ascending=False).head()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of dtype optimization — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             extension dtypes so missing values don't promote int -> float,\n#             and prefer pyarrow-backed strings for memory + speed.\n#             Python pass over the data; nullable dtypes preserve int\n#             semantics with NA; pyarrow strings can cut object-column\n#             memory by 5-10x and speed up groupby/joins.\n#             that expects numpy primitives; some libs (older sklearn,\n#             some plotting paths) don't yet round-trip them; pyarrow\n#             string requires pandas 2.0+.\n#\nimport pandas as pd\n# 1. Pin types at load time — fastest, no inference pass at all\ndf = pd.read_csv(\n    \"data.csv\",\n    dtype={\n        \"id\":     \"Int64\",            # nullable int  (capital I)\n        \"amount\": \"float32\",\n        \"city\":   \"category\",\n        \"name\":   \"string[pyarrow]\",  # arrow-backed string\n    },\n    parse_dates=[\"date\"],\n    engine=\"pyarrow\",                 # 2-5x faster CSV parser\n)\n# 2. Migrate an existing frame to arrow-backed strings (pandas >= 2.0)\ndf = df.convert_dtypes(dtype_backend=\"pyarrow\")\n# 3. Decide BEFORE casting — measurement-driven\nmem = df.memory_usage(deep=True).sort_values(ascending=False)\nmem.head(10)                           # the top offenders are the targets\n# Rule of thumb when picking dtypes:\n#   numeric dense, no NA      -> float32 / int32\n#   numeric with missing      -> Int64 / Float64 (nullable)\n#   strings, low cardinality  -> category\n#   strings, high cardinality -> string[pyarrow]\n# Decision rule:\n#   Object column, < ~50% unique values         -> .astype(\"category\") (often 10-100x smaller)\n#   Integer with no nulls, fits in 32 bits      -> downcast to \"int32\" or \"int16\"\n#   Float that doesn't need 15-digit precision  -> \"float32\"\n#   Integer with nulls                           -> \"Int64\" (nullable; preserves NaN)\n#   String columns                               -> \"string\" dtype (PyArrow-backed at scale)\n#   Booleans with missing                        -> \"boolean\" (NOT bool)\n#   Profiling memory before/after                -> df.memory_usage(deep=True).sum()\n#   Final-arrow-of-truth at scale                -> dtype_backend=\"pyarrow\" on read\n#\n# Anti-pattern: leaving everything as object dtype because \"it works\"\n#   Object columns store Python pointers — 50-100 bytes per row vs 1 byte for category.\n#   A 10M-row DataFrame can drop from 4 GB to 200 MB just by tagging low-cardinality\n#   strings as category. Always inspect df.dtypes after load and convert before\n#   the data fans out across joins/groupbys."
                  }
        ],
        tips: [
                  "Converting `object` columns to `\"category\"` saves the most memory for low-cardinality strings",
                  "`float32` halves storage vs `float64` with minimal precision loss for most data science tasks",
                  "Specifying `dtype=` at load time is faster than converting after — pandas skips the inference pass",
                  "`df.memory_usage(deep=True)` shows true memory including string storage"
        ],
        mistake: "Using `df.memory_usage()` without `deep=True` for string columns. Without it, object columns show only pointer size (~8 bytes per row), not actual string content size.",
        shorthand: {
          verbose: "df['amount'] = df['amount'].astype('float32')\ndf['city'] = df['city'].astype('category')\nbefore = df.memory_usage(deep=True).sum()",
          concise: "df = pd.read_csv('data.csv', dtype={\n    'amount': 'float32', 'city': 'category'\n})  # Set types at load time (faster)",
        },
      },
      {
        id: "pd-eval",
        fn: "pd.eval()",
        desc: "Evaluate multi-column arithmetic expressions faster than pandas.",
        category: "Performance",
        subtitle: "Avoids intermediate arrays for large DataFrames",
        signature: "df.eval(\"new = a * b + c * d\", inplace=True)",
        descLong: "pd.eval() compiles arithmetic string expressions and evaluates them without creating intermediate arrays. Faster than chained pandas operations on large DataFrames (>10k rows). Uses numexpr under the hood. Rule of thumb: only worth it when the frame is >=100k rows AND the expression chains 3+ operators — below that, the parsing overhead beats the savings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.eval() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             arithmetic, so the difference is visible.\n#             can write back via assignment.\n#             assignments, or the \"when does it actually help?\" rule.\n#\nimport pandas as pd\n# Standard pandas — allocates an intermediate array per operator\ndf[\"result\"] = df[\"a\"] * df[\"b\"] + df[\"c\"] * df[\"d\"]\n# Same calc with eval — no intermediates\ndf.eval(\"result = a * b + c * d\", inplace=True)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.eval() — common patterns you'll see in production.\n# APPROACH  - Combine pd.eval() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             multi-line assignments, and the no-inplace form that\n#             returns a Series.\n#             assignments keep related computations together cleanly.\n#             outweigh the savings — measure before reaching for it.\n#\nimport pandas as pd\n# Reference Python locals with @\nthreshold = 0.5\ndf.eval(\"flag = score > @threshold\", inplace=True)\n# Standalone expression — returns a Series instead of writing to df\nnorm = df.eval(\"(score - score.mean()) / score.std()\")\n# Multiple assignments in one call\ndf.eval(\"\"\"\n    tax   = salary * 0.3\n    net   = salary - tax\n    ratio = tax / net\n\"\"\", inplace=True)\n# Cross-DataFrame expressions go through pd.eval()\nresult = pd.eval(\"df1.a + df2.b\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.eval() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             use it on long arithmetic chains over large frames, and\n#             know its limits — no function calls, no fancy indexing,\n#             no ufuncs.\n#             avoiding intermediate allocations and using numexpr's\n#             multi-threaded backend; the multi-line form keeps the\n#             pipeline self-documenting.\n#             a single np.log() forces you back to vectorized pandas;\n#             debugging is harder because errors point at a string.\n#\nimport pandas as pd\nimport numpy as np\nimport time\nn = 5_000_000\ndf = pd.DataFrame({\n    \"a\": np.random.rand(n),\n    \"b\": np.random.rand(n),\n    \"c\": np.random.rand(n),\n    \"d\": np.random.rand(n),\n})\n# Measure — eval should win on long chains over large frames\nt0 = time.perf_counter()\ndf[\"r1\"] = df[\"a\"] * df[\"b\"] + df[\"c\"] * df[\"d\"] - df[\"a\"] / (df[\"b\"] + 1)\nprint(f\"pandas:  {time.perf_counter()-t0:.3f}s\")\nt0 = time.perf_counter()\ndf.eval(\"r2 = a * b + c * d - a / (b + 1)\", inplace=True)\nprint(f\"eval:    {time.perf_counter()-t0:.3f}s\")\n# Limit: eval cannot call functions — log(x) below would error.\n# Drop back to vectorized pandas/NumPy for those:\ndf[\"log_a\"] = np.log1p(df[\"a\"])\n# Decision rule:\n#   - frame >= 100k rows AND expression has >=3 operators -> try eval\n#   - need a function call (log, abs, where, ...) -> stay with pandas\n# Anti-pattern: reaching for pd.eval in Python loops\n#   pd.eval shines on a SINGLE large expression (numexpr can vectorize and\n#   parallelize). In a loop the per-call parsing/JIT cost dominates. Use a\n#   single eval string for compound numeric expressions; for everything else\n#   stick to plain pandas vectorized ops."
                  }
        ],
        tips: [
                  "Requires numexpr: `pip install numexpr` — pandas uses it automatically when available",
                  "Most useful for DataFrames >10k rows — below that, overhead outweighs the benefit",
                  "Supports `+`, `-`, `*`, `/`, `**`, `&`, `|`, `~`, `<`, `>`, `==`, `!=` — not function calls",
                  "Use `@var` to reference local Python variables inside the expression string"
        ],
        mistake: "Using pd.eval() for function calls like `np.log(a)`. eval() only supports arithmetic and comparison operators — not NumPy or pandas functions. Use vectorized operations for those.",
        shorthand: {
          verbose: "import pandas as pd\ndf['result'] = df['a'] * df['b'] + df['c'] * df['d']\ndf.eval('result = a * b + c * d', inplace=True)\ndf.eval('norm = (score - score.mean()) / score.std()', inplace=True)",
          concise: "pd.eval('df1.a + df2.b')  # cross-DataFrame expressions",
        },
      },
      {
        id: "chunked-processing",
        fn: "Chunked processing",
        desc: "Process files larger than RAM in chunks.",
        category: "I/O",
        subtitle: "chunksize= in read_csv/read_sql to avoid loading everything at once",
        signature: "for chunk in pd.read_csv(path, chunksize=100_000): ...",
        descLong: "For files or queries too large to fit in memory, chunksize= returns an iterator of DataFrames. Process and aggregate each chunk, then combine results. Parquet with column selection avoids this pattern entirely.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Chunked processing — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Iterate, do something per chunk.\n#             whole file at once.\n#             if you append every chunk to a list, you're back to\n#             loading everything. The pattern needs a per-chunk reduction.\n#\nimport pandas as pd\nfor chunk in pd.read_csv(\"huge.csv\", chunksize=100_000):\n    print(chunk.shape)        # process one chunk at a time\n    # ... do work, then drop the chunk before the next iteration"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Chunked processing — common patterns you'll see in production.\n# APPROACH  - Combine Chunked processing with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             append a tiny result -> concat + final aggregate at the\n#             end. Bounded memory, correct totals.\n#             only holds reductions, not raw chunks.\n#             Polars / DuckDB; pure-counting jobs are simpler with\n#             collections.Counter (also shown).\n#\nimport pandas as pd\nfrom collections import Counter\n# 1. Sum per region across a huge CSV\nresults = []\nfor chunk in pd.read_csv(\n    \"huge.csv\",\n    chunksize=100_000,\n    usecols=[\"region\", \"amount\"],\n    dtype={\"region\": \"category\", \"amount\": \"float32\"},\n):\n    agg = (chunk\n        .query(\"amount > 0\")\n        .groupby(\"region\", observed=True)[\"amount\"]\n        .sum())\n    results.append(agg)\ntotals = pd.concat(results).groupby(level=0).sum()\n# 2. Counting unique values — Counter is even simpler\ncounts = Counter()\nfor chunk in pd.read_csv(\"huge.csv\", chunksize=50_000, usecols=[\"city\"]):\n    counts.update(chunk[\"city\"].value_counts().to_dict())\n# 3. Same idea against a large SQL result\n# for chunk in pd.read_sql(\"SELECT * FROM events\", engine, chunksize=10_000):\n#     process(chunk)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Chunked processing — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             chunking for many problems; Dask / Polars / DuckDB scale\n#             out to many cores or machines without rewriting in\n#             pandas-flavoured chunked Python.\n#             projections; Dask parallelizes; Polars is faster\n#             single-machine; DuckDB lets you SQL over Parquet without\n#             loading anything.\n#             for a one-off script. Switch when chunk-and-aggregate is\n#             becoming the dominant shape of your code.\n#\nimport pandas as pd\n# 1. Skip chunking when columns= solves the problem\ndf = pd.read_parquet(\"events.parquet\", columns=[\"region\", \"amount\"])\ntotals = df.groupby(\"region\", observed=True)[\"amount\"].sum()\n# 2. Dask — same pandas API, but parallel and out-of-core\n# import dask.dataframe as dd\n# ddf = dd.read_csv(\"huge_*.csv\", dtype={\"amount\": \"float32\"})\n# totals = (ddf.query(\"amount > 0\")\n#              .groupby(\"region\")[\"amount\"].sum()\n#              .compute())                  # single trigger to materialize\n# 3. Polars — faster on a single machine, lazy by default\n# import polars as pl\n# (pl.scan_csv(\"huge.csv\")\n#    .filter(pl.col(\"amount\") > 0)\n#    .group_by(\"region\")\n#    .agg(pl.col(\"amount\").sum())\n#    .collect())\n# 4. DuckDB — SQL straight over Parquet, zero loading\n# import duckdb\n# duckdb.sql('''\n#   SELECT region, SUM(amount) AS total\n#   FROM 'events/*.parquet'\n#   WHERE amount > 0\n#   GROUP BY region\n# ''').df()\n# Anti-pattern: chunks = list(pd.read_csv(f, chunksize=n))\n# That materializes the entire file — defeats the purpose.\n# Decision rule:\n#   File fits in RAM with headroom              -> read once, process whole frame\n#   File is 1-10x your RAM                       -> chunksize= + accumulate stats\n#   File >> RAM                                  -> dask.dataframe or polars LazyFrame\n#   Need to write back chunked results          -> chunksize on read + append parquet partitions\n#   Per-chunk aggregation                        -> reduce in the loop, never materialize full df\n#   Need joins across chunks                     -> step up to duckdb (read_csv_auto) or polars\n#   Bottleneck is parsing                        -> engine=\"pyarrow\" first, chunked second\n#   File is JSON / nested                        -> pd.read_json(lines=True, chunksize=N)"
                  }
        ],
        tips: [
                  "Parquet with `columns=` avoids chunked reading for most large-file problems",
                  "The aggregation pattern: chunk → partial agg → concat → final agg",
                  "`chunksize=` returns a `TextFileReader` iterator — do not call `len()` on it",
                  "For truly large data, consider Dask, Polars, or DuckDB instead of chunked pandas"
        ],
        mistake: "Trying to collect all chunks into a list then concatenating. `chunks = list(pd.read_csv(f, chunksize=n))` loads the whole file — defeats the purpose. Aggregate each chunk before appending.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    result.append(x * 2)",
          concise: "result = [x * 2 for x in items]",
        },
      },
    ],
  },

  // ── Section 2: Inspecting Data ─────────────────────────────────────────
  {
    id: "inspection",
    title: "Inspecting Data",
    entries: [
      {
        id: "info",
        fn: ".info()",
        desc: "Print a concise summary of the DataFrame — types, nulls, memory.",
        category: "Inspection",
        subtitle: "The first thing to call on any new DataFrame",
        signature: "df.info(verbose=True, memory_usage=\"deep\")",
        descLong: "info() shows the index dtype, column dtypes, non-null counts, and memory usage in one call. It is the fastest way to spot wrong types, unexpected nulls, and memory problems before doing any analysis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .info() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             gets df.info() before anything else.\n#             you'll reach for next (shape, dtypes, select_dtypes).\n#\nimport pandas as pd\ndf.info()\n# RangeIndex: 10000 entries, 0 to 9999\n# Data columns (total 5 columns):\n#  #   Column   Non-Null Count  Dtype\n#  0   id       10000 non-null  int64\n#  1   date      9850 non-null  object   <- wrong type + 150 nulls\n#  2   amount   10000 non-null  float64"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .info() — common patterns you'll see in production.\n# APPROACH  - Combine .info() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             info, shape, dtypes, columns.tolist, select_dtypes by\n#             group. Treat info() as the hub, the rest as drill-downs.\n#             is the cleanest way to apply per-type transforms next.\n#             a wide string-heavy frame can be 10x what info() reports\n#             without deep=True (senior tier).\n#\nimport pandas as pd\ndf.info()                          # types + non-null counts + naive memory\ndf.shape                           # (rows, cols)\ndf.dtypes                          # column -> dtype\ndf.columns.tolist()                # names as plain list (handy for code)\ndf.select_dtypes(\"object\")         # likely strings (or mixed)\ndf.select_dtypes(\"number\")         # all numerics\ndf.select_dtypes(include=[\"category\", \"datetime\"])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .info() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             true cost, isna().sum() for per-column nulls, and the\n#             \"describe my types\" idiom that catches dtype regressions\n#             before they reach analysis.\n#             pointer count); per-column null counts are what you act\n#             on; type-pivoted summaries make schema review automatic.\n#             string); over-relying on info() output instead of\n#             writing real schema tests is still brittle.\n#\nimport pandas as pd\n# 1. True memory — deep=True walks string content\ndf.info(memory_usage=\"deep\")\nmem_mb = df.memory_usage(deep=True).sort_values(ascending=False) / 1e6\nmem_mb.head()                     # top offenders to target\n# 2. Per-column null audit\nnulls = df.isna().sum()\nnulls[nulls > 0].sort_values(ascending=False)\n# 3. Schema fingerprint — useful in CI / pipeline tests\nschema = (df.dtypes\n            .astype(str)\n            .reset_index()\n            .rename(columns={\"index\": \"column\", 0: \"dtype\"}))\n# assert schema.set_index(\"column\")[\"dtype\"].equals(expected_schema)\n# 4. Group columns by type for downstream pipelines\nnum  = df.select_dtypes(\"number\").columns\ncat  = df.select_dtypes([\"category\", \"object\"]).columns\ndate = df.select_dtypes(\"datetime\").columns\n# Standing rule: any time a frame enters a notebook from outside,\n# run df.info(memory_usage=\"deep\") + df.isna().sum() before anything else.\n# Decision rule:\n#   Quick null/dtype overview                   -> df.info()\n#   Memory usage with object content            -> df.info(memory_usage=\"deep\")\n#   Wide DataFrame (>100 cols)                  -> df.info(verbose=False) or df.dtypes.value_counts()\n#   Need only column dtypes                      -> df.dtypes (a Series)\n#   Need null counts numerically                  -> df.isna().sum()\n#   Programmatic schema inspection                -> df.columns + df.dtypes (skip info text)\n#   Across many DataFrames                        -> stash df.dtypes; diff between schemas\n#\n# Anti-pattern: relying on df.info() for memory budgeting without deep=True\n#   Default info() reports POINTER size (8 bytes) for object columns, hiding\n#   the actual string content. A 1 GB-RAM DataFrame can show as 80 MB in info().\n#   Always call df.info(memory_usage=\"deep\") or df.memory_usage(deep=True).sum()."
                  }
        ],
        tips: [
                  "`memory_usage=\"deep\"` shows true memory — can be 10x the naive estimate for string columns",
                  "A column showing `object` dtype when you expect `float64` means there are non-numeric values mixed in",
                  "Non-null count < total rows means nulls — follow up with `df.isna().sum()` for per-column counts",
                  "Call `df.info()` immediately after loading any new dataset — before any analysis"
        ],
        mistake: "Skipping `df.info()` and going straight to analysis. You will spend hours debugging a calculation only to find a column is dtype `object` instead of `float64`.",
        shorthand: {
          verbose: "import pandas as pd\ndf.info()\ndf.info(memory_usage='deep')   # true memory including strings\ndf.shape                       # (rows, cols)",
          concise: "df.select_dtypes('number')     # numeric columns",
        },
      },
      {
        id: "describe",
        fn: ".describe()",
        desc: "Compute summary statistics for numeric (and categorical) columns.",
        category: "Inspection",
        subtitle: "Count, mean, std, min, quartiles, max — at a glance",
        signature: "df.describe(percentiles=[.25,.5,.75], include=None)",
        descLong: "describe() computes descriptive statistics for all numeric columns by default. Use include=\"all\" for categoricals too. Custom percentiles reveal distribution tails and outliers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .describe() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             min/quartile/max table for every numeric column.\n#             between min and 25% (and 75% and max) is a free\n#             outlier hint.\n#             explicitly; categorical columns are silently skipped.\n#\nimport pandas as pd\ndf.describe()\n#         amount    score\n# count   1000.00  1000.00\n# mean      45.23    72.40\n# std       12.11    15.33\n# min        0.00    10.00\n# 25%       37.50    62.00\n# 50%       45.00    73.00\n# 75%       53.00    84.00\n# max      100.00   100.00"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .describe() — common patterns you'll see in production.\n# APPROACH  - Combine .describe() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             column, and add custom percentiles to surface tails.\n#             Pair with skew/kurtosis for a quick distribution sanity\n#             check.\n#             columns get top/freq stats; tail percentiles reveal the\n#             outliers default quartiles hide.\n#             story you need IQR rules / z-score thresholds (senior tier).\n#\nimport pandas as pd\ndf.describe()                                # numeric only\ndf.describe(include=\"all\")                   # numeric + categorical\ndf.describe(include=\"object\")                # string-only summary\n# Tail percentiles surface the outliers\ndf.describe(percentiles=[0.01, 0.05, 0.25, 0.75, 0.95, 0.99])\n# Single column drill-down\ndf[\"amount\"].describe()\ndf[\"amount\"].skew()                          # > 1 -> right-skewed\ndf[\"amount\"].kurtosis()                      # > 3 -> heavier tails than normal"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .describe() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             with the IQR rule, segment numeric distributions by a\n#             group column with groupby().describe(), and persist a\n#             baseline so future drift can be checked against it.\n#             outlier flags become column transforms, segmented stats\n#             reveal subgroup effects, baseline files anchor CI checks.\n#             real systems and need maintenance; over-segmenting\n#             (groupby on 5 columns) explodes the output.\n#\nimport pandas as pd\n# 1. IQR-based outlier flag — turn describe quartiles into a mask\ndef outlier_mask(s: pd.Series, k: float = 1.5) -> pd.Series:\n    q1, q3 = s.quantile(0.25), s.quantile(0.75)\n    iqr = q3 - q1\n    return (s < q1 - k * iqr) | (s > q3 + k * iqr)\ndf[\"amount_outlier\"] = outlier_mask(df[\"amount\"])\ndf[\"amount_outlier\"].sum()                   # how many\n# 2. Segmented summaries — describe per group\ndf.groupby(\"region\", observed=True)[[\"amount\", \"score\"]].describe()\n# 3. Persist a baseline for drift checks\nbaseline = df.describe(include=\"all\")\n# baseline.to_parquet(\"snapshots/2026-04.parquet\")\n# later: pd.testing.assert_frame_equal(baseline, current, atol=...)\n# 4. Quick visual gut-check — keep this in EDA notebooks\n# df[\"amount\"].hist(bins=50)\n# Decision rule:\n#   Default numeric summary                     -> df.describe()\n#   Include object/string columns               -> df.describe(include=\"all\")\n#   Only categoricals                            -> df.describe(include=\"category\")\n#   Custom percentiles                            -> percentiles=[.05, .5, .95]\n#   Robust to outliers                            -> use .quantile([.01, .99]) explicitly\n#   Time series (datetime)                        -> describe(datetime_is_numeric=True)\n#   Group-wise summary                            -> df.groupby(g).describe()\n#   Profile a whole dataset                       -> ydata-profiling / sweetviz, not describe\n#\n# Anti-pattern: trusting describe() output as a normality / quality check\n#   describe() reports mean and std even for skewed or bimodal data — meaningless\n#   for income, file sizes, latencies. Pair with .skew() / .kurt() and a histogram\n#   before drawing conclusions. For categorical data, describe() shows top/freq\n#   but hides distribution; use .value_counts(normalize=True)."
                  }
        ],
        tips: [
                  "Compare min/max to 25th/75th percentiles — large gaps indicate outliers",
                  "`include=\"all\"` shows top/freq for categoricals alongside numeric stats",
                  "A mean much larger than the median signals right-skewed data with outliers",
                  "Custom percentiles like `.01` and `.99` reveal extreme values hidden by default quartiles"
        ],
        mistake: "Trusting describe() without checking for outliers — a max of 999999 when everything else is below 100 will skew mean/std without being obvious at a glance.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\ndf.describe()\ndf.describe(include='all')\ndf.describe(include='object')   # string columns only",
          concise: "df['amount'].hist(bins=50)   # visual check",
        },
      },
      {
        id: "value-counts",
        fn: ".value_counts()",
        desc: "Count unique values in a Series, sorted by frequency.",
        category: "Inspection",
        subtitle: "Frequency table for categorical columns",
        signature: "df[\"col\"].value_counts(normalize=False, dropna=True)",
        descLong: "value_counts() returns a Series of value frequencies, sorted descending. normalize=True gives proportions. dropna=False includes NaN. Use it to understand cardinality and spot data quality issues.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .value_counts() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             descending. Run it on any categorical-looking column.\n#             both the distinct values and their counts in one go.\n#             have nulls); doesn't show proportions or two-variable\n#             relationships.\n#\nimport pandas as pd\ndf[\"city\"].value_counts()\n# New York    450\n# Chicago     280\n# Houston     150\n# Name: city, dtype: int64"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .value_counts() — common patterns you'll see in production.\n# APPROACH  - Combine .value_counts() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             dropna=False to surface nulls, head(N) for the top-N\n#             pattern, and pd.crosstab for two-variable frequencies.\n#             single most useful option people forget; crosstab is\n#             the natural step up to two variables.\n#             or grouped value_counts within categories — those are\n#             senior-tier needs.\n#\nimport pandas as pd\n# Counts and percentages\ndf[\"city\"].value_counts()\ndf[\"city\"].value_counts(normalize=True).mul(100).round(1)\n# Always surface nulls — easy to miss otherwise\ndf[\"city\"].value_counts(dropna=False)\n# Top-N pattern\ndf[\"city\"].value_counts().head(10)\n# Two variables — crosstab\npd.crosstab(df[\"city\"], df[\"status\"])\npd.crosstab(df[\"city\"], df[\"status\"], normalize=\"index\")    # row %\n# Cardinality sweep before any modeling\ndf.nunique()\n(df.nunique() / len(df) < 0.5).sum()        # category-dtype candidates"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .value_counts() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             value_counts inside groupby for nested distributions,\n#             and weighted counts via groupby.sum() for \"frequency\n#             weighted by amount\" questions.\n#             continuous data via cut/qcut; per-group distributions\n#             reveal segment-specific patterns; weighted counts are\n#             the right answer to \"what fraction of revenue / risk /\n#             impact each value represents\".\n#             surprises); groupby+value_counts() can be slow on huge\n#             frames — pre-aggregate when you can.\n#\nimport pandas as pd\n# 1. Binned counts of a numeric column\nbins = pd.cut(df[\"age\"], bins=[0, 18, 30, 50, 80])\nbins.value_counts().sort_index()\n# 2. Per-group distributions — value_counts inside groupby\ndf.groupby(\"region\", observed=True)[\"status\"].value_counts(normalize=True)\n# region   status\n# WEST     active     0.62\n#          churned    0.30\n#          pending    0.08\n# EAST     ...\n# 3. Weighted counts — \"by revenue\", not \"by row\"\nweighted = (df.groupby(\"city\", observed=True)[\"amount\"]\n              .sum()\n              .sort_values(ascending=False))\nweighted_pct = weighted / weighted.sum()\n# 4. Top-N + collapse the tail into \"Other\" — common for plotting\ntop = df[\"city\"].value_counts().nlargest(10).index\ndf[\"city_top\"] = df[\"city\"].where(df[\"city\"].isin(top), other=\"Other\")\n# Decision rule:\n#   Frequency table, descending                 -> s.value_counts()\n#   Proportions instead of counts                -> normalize=True\n#   Include NaN counts                            -> dropna=False\n#   Bucketed numeric column                       -> bins=N (auto pd.cut equivalent)\n#   Sort by index instead of count                -> .value_counts().sort_index()\n#   Top-N only                                    -> .value_counts().head(N)\n#   Multi-column combos                           -> df.value_counts([\"a\",\"b\"]) (pandas 1.1+)\n#   Group-aware                                   -> df.groupby(g)[col].value_counts()\n#\n# Anti-pattern: value_counts() with dropna default on data you suspect has NaNs\n#   value_counts(dropna=True) (the default) silently hides null rows — your \"100%\n#   coverage\" claim ignores them. Always check df[col].isna().sum() alongside\n#   value_counts, or pass dropna=False when reporting frequencies."
                  }
        ],
        tips: [
                  "`dropna=False` is important — easy to miss nulls in categorical columns otherwise",
                  "`normalize=True` then `.mul(100).round(1)` gives clean percentages",
                  "`df.nunique()` gives cardinality for all columns at once — use before deciding which to convert to `category`",
                  "Pair with `pd.crosstab(df.a, df.b)` for two-variable frequency tables"
        ],
        mistake: "Using `df[\"col\"].unique()` to count categories — that returns the values, not counts. Use `df[\"col\"].value_counts()` for counted frequencies.",
        shorthand: {
          verbose: "import pandas as pd\ndf['city'].value_counts()\ndf['city'].value_counts(normalize=True).mul(100).round(1)\ndf['city'].value_counts(dropna=False)",
          concise: "(df.nunique() / len(df) < 0.5).sum()  # columns good for 'category' dtype",
        },
      },
      {
        id: "head-tail",
        fn: ".head() / .tail()",
        desc: "Return the first or last N rows of a DataFrame.",
        category: "Inspection",
        subtitle: "Quick preview — default is 5 rows",
        signature: "df.head(n=5) | df.tail(n=5)",
        descLong: "head() and tail() return the first or last n rows. The default is 5. Essential for quickly previewing data after loading or transformation. Use in combination with .info() and .describe() for initial exploration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .head() / .tail() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Pass a number for a different count.\n#             after every read_csv.\n#             where data quality issues actually hide.\n#\nimport pandas as pd\ndf.head()              # first 5 rows\ndf.head(10)            # first 10\ndf.tail()              # last 5\ndf.tail(3)             # last 3"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .head() / .tail() — common patterns you'll see in production.\n# APPROACH  - Combine .head() / .tail() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             head -> info -> describe. Use tail(10) to catch trailing\n#             totals/metadata rows that sneak into CSV exports.\n#             is the quietly-saved-me-many-times move.\n#             sample() is better (covered in the next entry).\n#\nimport pandas as pd\ndf = pd.read_csv(\"data.csv\")\n# Standard post-load sequence\nprint(df.shape)        # how big is it?\ndf.head()              # what does it look like?\ndf.info()              # what are the types?\ndf.describe()          # what are the numeric stats?\n# Trailing-junk check — many CSV exports stick totals on the last rows\ndf.tail(10)\n# head/tail are sugar over iloc\ndf.head(5)             # same as df.iloc[:5]\ndf.tail(5)             # same as df.iloc[-5:]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .head() / .tail() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             explicit n=N defaults, and head/tail combined to bracket\n#             a sorted result. Treat head/tail as exploration only —\n#             never as a sampling strategy in real analysis.\n#             previews are a fast way to confirm a sort/aggregate did\n#             what you expected; \"no head() in production\" is a real\n#             code-review rule.\n#             notebook front-ends still truncate beyond a column count\n#             regardless. df.sample() is the right tool for QA.\n#\nimport pandas as pd\n# 1. Notebook display: show all columns of a wide frame for one cell\nwith pd.option_context(\n    \"display.max_columns\", None,\n    \"display.max_colwidth\", 60,\n    \"display.width\", 200,\n):\n    print(df.head())\n# 2. Bracket a sorted result — first AND last few are usually what you want\ntop_bottom = pd.concat([\n    df.sort_values(\"amount\", ascending=False).head(3),\n    df.sort_values(\"amount\", ascending=False).tail(3),\n])\n# 3. Anti-pattern in production:\n#    \"if df.head(1)['status'].item() == 'OK': ...\"\n#    A single-row check on UNSORTED data is order-dependent — fragile.\n#    Use boolean conditions across the whole frame instead.\n# 4. For data-quality spot-checks reach for sample(), not head()\ndf.sample(20, random_state=0)\n# Decision rule:\n#   Quick peek at the start                     -> df.head() (default 5)\n#   Peek at the end                              -> df.tail()\n#   Sampling instead of edges                    -> df.sample(n=10) (random middle rows)\n#   Need a quick row by id                        -> df.loc[id]; head/tail is positional\n#   Verify after sort                             -> df.sort_values(...).head(N)\n#   Inspecting a Series                           -> s.head() / s.tail()\n#   Slicing a chunk                               -> df.iloc[a:b] (more explicit than head)\n#   Wide DataFrame, want columns too              -> df.head().T to flip orientation\n#\n# Anti-pattern: using df.head() as a sanity check on UNSORTED time-series data\n#   The first 5 rows are file-order, not chronological order. Always sort\n#   (df.sort_values(\"ts\").head()) before drawing conclusions about \"the start\"\n#   of a series. Same for \"tail looks fine\" — you're checking insertion order,\n#   not what's actually most recent."
                  }
        ],
        tips: [
                  "Always `df.head()` immediately after loading — confirms the file parsed correctly",
                  "`df.tail(10)` catches trailing metadata rows that sometimes appear in CSV exports",
                  "`df.head(1)` is a clean way to see column names and sample values together",
                  "In Jupyter, `df` alone renders a nice table — but `df.head()` is more explicit about intent"
        ],
        mistake: "Using `print(df)` to inspect large DataFrames. It prints all rows and truncates in unreadable ways. Use `df.head()` for a clean preview.",
        shorthand: {
          verbose: "import pandas as pd\ndf.head()           # first 5 rows (default)\ndf.head(10)         # first 10 rows\ndf.head(1)          # just the first row",
          concise: "df.tail(5)          # same as df.iloc[-5:]",
        },
      },
      {
        id: "sample",
        fn: ".sample()",
        desc: "Return a random sample of rows or columns.",
        category: "Inspection",
        subtitle: "Random rows — better than head() for spotting data issues",
        signature: "df.sample(n=5, frac=None, random_state=None)",
        descLong: "sample() returns a random subset of rows. More useful than head() for spotting data quality issues — head() only shows the first rows which may be sorted or homogeneous. Use random_state= for reproducibility.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .sample() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             default for \"let me look at the data\".\n#             representative of the middle of the file too.\n#             than fraction makes pipelines awkward when data size\n#             changes.\n#\nimport pandas as pd\ndf.sample(5)                          # 5 random rows\ndf.sample(5, random_state=42)         # reproducible — pick a fixed seed"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .sample() — common patterns you'll see in production.\n# APPROACH  - Combine .sample() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             frac=1 to shuffle, axis=1 for random columns, weights=\n#             for non-uniform sampling, and the manual train/test split.\n#             stochastic loops, fractional sampling for fast iteration,\n#             weighted sampling for \"more amount = more likely\".\n#             stratify; for ML use sklearn.train_test_split with\n#             stratify= (mentioned in senior tier).\n#\nimport pandas as pd\ndf.sample(frac=0.1, random_state=42)              # 10% sample\ndf.sample(frac=1.0, random_state=42)              # shuffle all rows\ndf.sample(frac=1.0, random_state=42).reset_index(drop=True)\ndf.sample(3, axis=1)                              # 3 random columns\n# Weighted sampling — bias toward higher-amount rows\ndf.sample(100, weights=\"amount\", random_state=42)\n# Quick train/test split (no stratification)\ntrain = df.sample(frac=0.8, random_state=42)\ntest  = df.drop(train.index)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .sample() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             reproducible group-aware sampling so a customer's rows\n#             don't leak across train/test, and time-respecting\n#             splits where chronology matters more than randomness.\n#             splits prevent label leakage; chronological splits\n#             reflect how the model will be used in production.\n#             splits require a stable group_id; chronological splits\n#             give up the i.i.d. assumption (and that's the right call,\n#             but be deliberate about it).\n#\nimport pandas as pd\nfrom sklearn.model_selection import train_test_split, GroupShuffleSplit\n# 1. Stratified split — preserves class balance\ntrain, test = train_test_split(\n    df,\n    test_size=0.2,\n    random_state=42,\n    stratify=df[\"target\"],\n)\n# 2. Group-aware split — keep all rows for a customer on the same side\ngss = GroupShuffleSplit(test_size=0.2, n_splits=1, random_state=42)\ntrain_idx, test_idx = next(gss.split(df, groups=df[\"customer_id\"]))\ntrain = df.iloc[train_idx]\ntest  = df.iloc[test_idx]\n# 3. Time-respecting split — train on past, test on future\ndf = df.sort_values(\"date\")\ncutoff = df[\"date\"].quantile(0.8)\ntrain = df[df[\"date\"] <= cutoff]\ntest  = df[df[\"date\"] >  cutoff]\n# 4. Reproducibility checklist\n#    - random_state pinned at every level (sample, splitter, model)\n#    - sort first if order has meaning (datetime, group_id)\n#    - log the random seed and the data hash with the run\n# Decision rule:\n#   Reproducible random sample                  -> df.sample(n=N, random_state=42)\n#   Stratified by group                          -> df.groupby(g).sample(frac=0.1)\n#   Weighted sampling                             -> weights=col (heavier rows more likely)\n#   Without replacement (default)                 -> replace=False\n#   With replacement (bootstrap)                  -> replace=True, n=len(df)\n#   Random column subset                          -> df.sample(n=k, axis=1)\n#   Need a holdout                                -> sklearn.model_selection.train_test_split\n#   Massive data                                  -> SQL TABLESAMPLE or polars sample (faster)\n#\n# Anti-pattern: df.sample() without random_state in shareable analysis code\n#   The \"100 rows of weirdness\" you screenshot today is gone tomorrow. Always\n#   pass random_state=N (any int) so the sample is reproducible. Coworkers\n#   running the same notebook get the same rows; bug reports stay reproducible."
                  }
        ],
        tips: [
                  "`sample()` beats `head()` for data quality checks — shows a representative cross-section",
                  "`frac=1.0` shuffles the entire DataFrame — use before iterating in random order",
                  "Always set `random_state=` when sampling for reproducible splits",
                  "`df.sample(frac=0.01)` is a quick way to get a 1% subset for fast exploration of huge files"
        ],
        mistake: "Using `df.head()` as the only data quality check. The first rows are often the cleanest — use `df.sample(20)` to get a random cross-section that reveals messy middle rows.",
        shorthand: {
          verbose: "df.sample(5)                    # 5 random rows\ndf.sample(10, random_state=42)  # reproducible\ndf.sample(frac=0.1)             # 10% of rows\ndf.sample(frac=1.0)             # shuffle all rows",
          concise: "train, test = train_test_split(df, test_size=0.2, random_state=42)",
        },
      },
      {
        id: "nunique",
        fn: ".nunique()",
        desc: "Count the number of unique values per column.",
        category: "Inspection",
        subtitle: "Cardinality check — essential before type conversion",
        signature: "df.nunique() | df[\"col\"].nunique()",
        descLong: "nunique() counts distinct values per column. Essential before deciding which columns to convert to the category dtype (low cardinality = good candidate). Also useful for spotting ID columns (nunique == len(df)) and constant columns (nunique == 1).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .nunique() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             cardinalities you can scan top-down.\n#             out (count = N), constants jump out (count = 1).\n#             (uniqueness fraction); doesn't separate IDs from real\n#             high-cardinality columns.\n#\nimport pandas as pd\ndf.nunique()\n# name     1000      <- ID-shaped (every row unique)\n# city       47      <- good category candidate\n# status      3      <- definitely category"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .nunique() — common patterns you'll see in production.\n# APPROACH  - Combine .nunique() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             rows for category candidates, single-column drill-downs\n#             with unique() and value_counts(), and dropna=False to\n#             see whether NaN is silently inflating cardinality.\n#             columns to category-encode, which look like IDs, which\n#             look like constants.\n#             too (high-cardinality long strings as category cost MORE\n#             memory than object). Senior tier handles that.\n#\nimport pandas as pd\n# Cardinality ratio — lower is \"more category-shaped\"\nratio = df.nunique() / len(df)\nratio.sort_values()                     # smallest = best category candidates\n# Auto-pick category candidates with a 50% threshold\ncat_cols = ratio[ratio < 0.5].index\ndf[cat_cols] = df[cat_cols].astype(\"category\")\n# Single column drill-down\ndf[\"city\"].nunique()                    # integer count\ndf[\"city\"].unique()                     # the actual distinct values\ndf[\"city\"].value_counts(dropna=False)   # count per value, NaN included\n# Per-row uniqueness (rare but occasionally useful)\ndf.nunique(axis=1)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .nunique() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             category-encode columns where the average string is short\n#             enough that the dictionary saves more than it costs;\n#             flag IDs explicitly so they don't leak into models or\n#             aggregations; spot drift by tracking nunique over time.\n#             memory\" footgun; ID flagging documents intent for the\n#             next reader; cardinality drift is a great early signal\n#             of upstream schema changes.\n#             has changed the calculus (often beats category for\n#             high-cardinality strings now); drift checks add ops cost.\n#\nimport pandas as pd\n# 1. Category-vs-object decision based on memory, not just cardinality\ndef category_candidates(df: pd.DataFrame, ratio_max: float = 0.5,\n                        avg_len_min: float = 4.0) -> list[str]:\n    out = []\n    for c in df.select_dtypes(\"object\").columns:\n        if df[c].nunique() / len(df) > ratio_max:\n            continue\n        avg_len = df[c].dropna().astype(str).str.len().mean()\n        if avg_len >= avg_len_min:           # short strings rarely worth it\n            out.append(c)\n    return out\ncat_cols = category_candidates(df)\ndf[cat_cols] = df[cat_cols].astype(\"category\")\n# 2. Flag ID-shaped columns — exclude from features, joins-only\nids = df.nunique()[df.nunique() == len(df)].index.tolist()\nconstants = df.nunique()[df.nunique() == 1].index.tolist()       # drop these\n# 3. Cardinality drift detector — compare today's frame to a baseline\nbaseline = pd.read_parquet(\"schema/baseline_nunique.parquet\")[\"nunique\"]\ntoday    = df.nunique()\ndelta    = (today - baseline.reindex(today.index).fillna(0)) / baseline\nflagged  = delta[delta.abs() > 0.2]              # >20% drift -> investigate\n# Decision rule:\n#   Count distinct values in a column           -> s.nunique()\n#   Count distinct PER COLUMN                    -> df.nunique() (returns a Series)\n#   Include NaN as a value                        -> dropna=False\n#   Per-group distinct count                      -> df.groupby(g)[col].nunique()\n#   Need the actual distinct values               -> s.unique() (no count)\n#   Cardinality ratio                             -> s.nunique() / len(s) (1.0 = unique key)\n#   Very large data                               -> approximate via HyperLogLog (datasketch)\n#   Want unique combinations across columns       -> df[[a,b]].drop_duplicates().shape[0]\n#\n# Anti-pattern: len(set(s)) instead of s.nunique() on big Series\n#   Materializing a Python set forces every value through Python — orders of\n#   magnitude slower than nunique() (which uses pandas-native hashing) and\n#   doesn't honor dropna semantics. Always nunique() for cardinality counts."
                  }
        ],
        tips: [
                  "Columns where `nunique / len(df) < 0.5` are good `\"category\"` dtype candidates — saves memory",
                  "Columns where `nunique == len(df)` are probably IDs — flag them before aggregation",
                  "Columns where `nunique == 1` are constant — drop them before modeling",
                  "Combine with `value_counts()` to see both count AND distribution"
        ],
        mistake: "Converting all `object` columns to `\"category\"` without checking cardinality first. High-cardinality strings (names, emails, free text) as `category` actually use MORE memory than `object`.",
        shorthand: {
          verbose: "df.nunique()\ndf.nunique() / len(df)\ncat_cols = df.nunique()[df.nunique() / len(df) < 0.5].index\ndf[cat_cols] = df[cat_cols].astype('category')",
          concise: "df['city'].nunique(dropna=False)",
        },
      },
    ],
  },

  // ── Section 3: Selecting, Filtering & MultiIndex ─────────────────────────────────────────
  {
    id: "selection",
    title: "Selecting, Filtering & MultiIndex",
    entries: [
      {
        id: "loc",
        fn: ".loc[]",
        desc: "Select rows and columns by label.",
        category: "Selection",
        subtitle: "Label-based indexing — inclusive slices, boolean masks, setting values",
        signature: "df.loc[row_labels, col_labels]",
        descLong: "loc[] selects by label — index values for rows, column names for columns. Slices are inclusive on both ends. Accepts scalars, lists, slices, and boolean arrays. The correct way to set values conditionally.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .loc[] — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Show that loc takes [rows, cols] in one bracket pair.\n#             masks getting in the way.\n#             boolean masks, or conditional assignment — the things\n#             you'll do daily.\n#\nimport pandas as pd\ndf = pd.DataFrame({\"A\": [1, 2, 3], \"B\": [4, 5, 6]}, index=[\"x\", \"y\", \"z\"])\ndf.loc[\"x\"]            # whole row \"x\" as a Series\ndf.loc[\"x\", \"A\"]       # scalar — 1\ndf.loc[:, \"A\"]         # whole column A"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .loc[] — common patterns you'll see in production.\n# APPROACH  - Combine .loc[] with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             multi-col selection, boolean masks (with &/|/~), and\n#             conditional assignment via df.loc[mask, col] = value.\n#             warning and most chained-indexing bugs.\n#             scalar-fast access — those are the senior tier.\n#\nimport pandas as pd\ndf = pd.DataFrame({\"A\": [1, 2, 3], \"B\": [4, 5, 6]}, index=[\"x\", \"y\", \"z\"])\n# Slicing — INCLUSIVE on both ends with loc\ndf.loc[\"x\":\"y\", \"A\"]                  # rows \"x\" and \"y\", column A\n# Multi-row / multi-col\ndf.loc[[\"x\", \"z\"], [\"A\", \"B\"]]\n# Boolean masks — & | ~  (never Python and/or/not on Series)\ndf.loc[df[\"A\"] > 1]\ndf.loc[(df[\"A\"] > 1) & (df[\"B\"] < 6)]\ndf.loc[(df[\"A\"] == 1) | (df[\"A\"] == 3)]\ndf.loc[~(df[\"A\"] == 2)]\n# Conditional assignment — single call, no chained indexing\ndf.loc[df[\"A\"] > 2, \"B\"] = 0"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .loc[] — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             pd.IndexSlice for readable MultiIndex slicing, and the\n#             \"always use loc for write\" rule that avoids the\n#             SettingWithCopyWarning entirely.\n#             is the only sane way to slice MultiIndex without ugly\n#             slice() literals; the loc-only-for-writes rule eliminates\n#             a whole class of \"did this actually update the frame?\"\n#             bugs.\n#             IndexSlice is verbose for simple cases; loc-for-writes\n#             can still surprise when the underlying frame is itself a\n#             view (use .copy() at the boundary if in doubt).\n#\nimport pandas as pd\ndf = pd.DataFrame(\n    {\"A\": [1, 2, 3], \"B\": [4, 5, 6]},\n    index=[\"x\", \"y\", \"z\"],\n)\n# 1. .at — fast scalar access (read AND write)\ndf.at[\"x\", \"A\"]                      # read\ndf.at[\"x\", \"A\"] = 99                 # write — no copy ambiguity\n# 2. MultiIndex slicing with IndexSlice\nmi = df.set_index([\"A\", \"B\"], append=True)            # toy example\nidx = pd.IndexSlice\n# all outer labels, A in 1..2, all columns\n# mi.loc[idx[:, 1:2, :], :]\n# 3. Conditional update — always one loc call, never chained\nmask = (df[\"A\"] > 1) & (df[\"B\"] < 6)\ndf.loc[mask, [\"A\", \"B\"]] = [0, 0]\n# 4. Defend against view ambiguity at the boundary\ndef update_low_a(df: pd.DataFrame) -> pd.DataFrame:\n    df = df.copy()                   # explicit owned frame\n    df.loc[df[\"A\"] < 3, \"A\"] = 0\n    return df\n# Anti-patterns to avoid:\n#   df[\"A\"][df[\"A\"] > 1] = 0          # chained indexing — may write to a copy\n#   df.loc[df.A > 1].B = 0            # chained loc + attribute — same trap\n# Decision rule:\n#   Lookup by LABEL (any axis)                  -> df.loc[row_label, col_label]\n#   Boolean filter on rows                       -> df.loc[mask, cols]\n#   Set values on a subset                        -> df.loc[mask, col] = value (avoids SettingWithCopyWarning)\n#   Range of LABELS (inclusive both ends!)        -> df.loc[\"2024-01\":\"2024-03\"]\n#   Position-based lookup                         -> use .iloc, NOT .loc\n#   Multi-index slicing                           -> pd.IndexSlice or .loc[(a, b), :]\n#   Need to chain assignments                     -> use .loc once with 2D access, not df[col][mask] = ...\n#   Set with a callable (idiomatic chaining)     -> df.loc[lambda d: d.x > 0, \"y\"] = ...\n#\n# Anti-pattern: chained indexing for assignment -> df[mask][col] = value\n#   pandas can't tell whether df[mask] is a view or a copy; the assignment may\n#   silently fail (SettingWithCopyWarning). Always use the SINGLE 2D access\n#   pattern: df.loc[mask, col] = value. Same for df.loc[mask][col] = ... — it's\n#   still chained. The 2D indexer is the only safe form."
                  }
        ],
        tips: [
                  "`loc[]` slices are **inclusive** on both ends — `\"x\":\"z\"` includes `\"z\"`",
                  "Always use `df.loc[condition, \"col\"] = value` for conditional assignment — not chained indexing",
                  "`.at[\"row\", \"col\"]` is ~100x faster than `.loc` for a single scalar value",
                  "Use `&` `|` `~` for boolean masks — never Python `and` `or` `not` on Series",
                  "In functions that mutate, take an explicit `df = df.copy()` at the boundary — pandas 2.x copy-on-write is not yet the universal default and silent view writes still trip teams"
        ],
        mistake: "`df[\"col\"][condition] = value` (chained assignment) may silently modify a copy. Always use `df.loc[condition, \"col\"] = value`.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "iloc",
        fn: ".iloc[]",
        desc: "Select rows and columns by integer position.",
        category: "Selection",
        subtitle: "Position-based indexing — exclusive end, negative indexing",
        signature: "df.iloc[row_pos, col_pos]",
        descLong: "iloc[] selects by integer position (0-based). Slices are exclusive at the end — like Python ranges. Use iloc[] only when you explicitly need positional access, not when you want labels.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .iloc[] — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             label-based loc immediately visible.\n#             negative indexing, or the \"prefer loc in production\" rule.\n#\nimport pandas as pd\ndf.iloc[0]              # first row\ndf.iloc[-1]             # last row\ndf.iloc[0, 1]           # cell at row 0, col 1"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .iloc[] — common patterns you'll see in production.\n# APPROACH  - Combine .iloc[] with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             negative indices, list selection, every-Nth-row stride.\n#             Show that iloc[:5] == head(5) and iloc[-5:] == tail(5).\n#             feels different from loc; making it explicit prevents a\n#             whole class of off-by-one bugs.\n#             remove rows. Senior tier covers when to prefer loc and\n#             when iloc is actually the right call.\n#\nimport pandas as pd\ndf.iloc[[0, 2]]                # rows 0 and 2\ndf.iloc[0:2]                   # rows 0 and 1 — END IS EXCLUSIVE\ndf.iloc[:, 0]                  # all rows, column 0\ndf.iloc[1:3, 0:2]              # rows 1-2, cols 0-1\ndf.iloc[-3:-1]                 # third-to-last and second-to-last\ndf.iloc[:, -1]                 # last column\ndf.iloc[:5]                    # same as df.head(5)\ndf.iloc[-5:]                   # same as df.tail(5)\ndf.iloc[::2]                   # every other row (stride)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .iloc[] — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             genuinely positional ops (random sampling, every-Nth row,\n#             drop-the-last-N-rows), use .iat for scalar-fast access,\n#             reach back to loc for label-based work.\n#             .iat avoids the slow indexing path; loc-vs-iloc is one\n#             of the cleanest separations in pandas once internalized.\n#             filters rows; some teams ban iloc entirely outside of\n#             head/tail-style helpers. Pick a convention and stick to it.\n#\nimport pandas as pd\ndf = pd.DataFrame({\"A\": [1, 2, 3, 4, 5], \"B\": list(\"vwxyz\")})\n# 1. .iat — fast scalar access by integer position\ndf.iat[0, 1]                   # 'v'\ndf.iat[0, 1] = \"V\"             # write\n# 2. Genuinely positional patterns — iloc is the RIGHT tool here\nlast_n = df.iloc[-3:]                          # last 3 regardless of index\nevery_other = df.iloc[::2]                     # stride\nrandom_pos = df.iloc[df.sample(2).index]       # back to loc via labels\n# 3. Anti-pattern — iloc to identify business rows\n# Wrong: df.iloc[0]            -- \"the first row\" is a position, not a meaning\n# Right: df.loc[df[\"id\"] == \"first_business_id\"]\n#        or: df.sort_values(\"date\").iloc[0]   -- still positional, but only\n#                                                after an explicit sort\n# 4. The slice rule, side by side\n# loc  -> ENDPOINTS INCLUSIVE      df.loc[\"x\":\"z\"]   includes \"z\"\n# iloc -> END EXCLUSIVE            df.iloc[0:3]      stops at index 2\n# Decision rule:\n#   Lookup by INTEGER position                  -> df.iloc[i, j]\n#   Range of POSITIONS (exclusive end)           -> df.iloc[0:10, :]   (rows 0-9)\n#   Last row / column                             -> df.iloc[-1, :] / df.iloc[:, -1]\n#   Don't care about the index labels             -> .iloc is index-agnostic\n#   Random row sampling by position               -> df.iloc[np.random.choice(len(df), 100)]\n#   Need labels                                   -> use .loc, NOT .iloc\n#   Need to mix positions and labels              -> not supported; pick one (or chain reset_index())\n#   Common bug source                              -> after a sort/filter, integer positions move\n#\n# Anti-pattern: using iloc for \"the row I just appended\" without resetting index\n#   df.iloc[len(df)-1] only equals \"the last appended row\" if the index is\n#   contiguous 0..n-1. After filtering, sorting, or merging, that's not true.\n#   Either use .loc with an explicit label, or reset_index(drop=True) right\n#   before the iloc call to guarantee positional == numeric label."
                  }
        ],
        tips: [
                  "`iloc[]` end is **exclusive** — `iloc[0:2]` gives rows 0 and 1, not 2",
                  "Use `.iat[row, col]` for fast single-value access by position",
                  "Prefer `loc[]` in production code — positional access breaks when rows are added/removed",
                  "`df.iloc[:, :5]` selects the first 5 columns — useful when you do not know column names"
        ],
        mistake: "Mixing up loc and iloc slicing rules. `loc[\"a\":\"c\"]` includes \"c\"; `iloc[0:3]` excludes position 3. The slice end behavior is opposite.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "query",
        fn: ".query()",
        desc: "Filter rows with a readable SQL-like string expression.",
        category: "Selection",
        subtitle: "Cleaner alternative to boolean indexing for multiple conditions",
        signature: "df.query(\"col > value and col2 == @var\")",
        descLong: "query() filters rows using a string expression. Column names are referenced directly. Use @ to inject local Python variables. Often more readable than boolean indexing for 3+ conditions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .query() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             obvious how it maps to \"select rows where ...\".\n#             query() calls — those are the everyday patterns.\n#\nimport pandas as pd\ndf.query(\"age > 30\")\ndf.query(\"age > 30 and score >= 90\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .query() — common patterns you'll see in production.\n# APPROACH  - Combine .query() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             .str methods inline, @local for Python variables, and\n#             readable chains via repeated .query() calls.\n#             that read top-to-bottom; @-variables avoid string\n#             interpolation; method-style operators (.str, .between)\n#             keep the expression compact.\n#             dominates); column names with spaces need backtick\n#             quoting which surprises readers.\n#\nimport pandas as pd\n# 'in' / 'not in' / .between\ndf.query(\"city in ['NYC', 'LA', 'SF']\")\ndf.query(\"city not in ['Chicago']\")\ndf.query(\"score.between(80, 95)\")\n# Inject Python variables with @\nmin_age   = 25\nthreshold = df[\"score\"].median()\ndf.query(\"age >= @min_age and score > @threshold\")\n# Backtick-quote column names with spaces\ndf.query(\"`first name` == 'Alice'\")\n# Method-style chaining reads top-down\nresult = (df\n    .query(\"score >= 80\")\n    .query(\"dept != 'HR'\")\n    .sort_values(\"score\", ascending=False)\n    .head(10))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .query() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             engine=\"python\" when expressions need pandas methods that\n#             numexpr can't handle, and know when to drop back to\n#             boolean indexing for hot loops.\n#             f-string injection); the \"python\" engine unlocks\n#             .str/.dt accessors and arbitrary methods inside the\n#             string; explicit fallback to boolean indexing avoids\n#             the parse-overhead tax in tight loops.\n#             strings are not type-checked, so refactors silently\n#             break them; debugging errors points at the string, not\n#             at a line number.\n#\nimport pandas as pd\n# 1. Pass variables via @ — never f-string into query()\ndef filter_by(df: pd.DataFrame, min_age: int, cities: list[str]) -> pd.DataFrame:\n    return df.query(\"age >= @min_age and city in @cities\")\n# 2. Need .str / .dt methods? engine=\"python\"\ndf.query(\n    \"name.str.startswith('A') and date.dt.year == 2024\",\n    engine=\"python\",\n)\n# 3. Decision rule — when NOT to use query\n# Hot inner loop on a small frame:\nmask = (df[\"age\"] > 30) & (df[\"score\"] >= 90)\ndf[mask]                                # no parser overhead\n# 4. Compose query strings safely\nfilters = [\"score >= 80\", \"dept != 'HR'\", \"region in @regions\"]\nregions = [\"WEST\", \"EAST\"]\ndf.query(\" and \".join(filters))         # variables still resolved via @\n# Decision rule:\n#   Long boolean expression, readable form      -> df.query(\"a > 0 and b == 'x'\")\n#   Reference an outside variable                -> df.query(\"a > @threshold\")\n#   Performance with numexpr installed           -> query gets ~2-5x speed on large frames\n#   Column name has spaces / special chars        -> wrap the col name with backticks inside the query string\n#   Need to mix with method chains                -> .query() returns a frame, chains nicely\n#   Programmatic predicate building               -> use boolean-mask form, NOT query string\n#   Super complex expressions                     -> step out to .loc[mask] for clarity\n#   Want to log/inspect predicate                  -> assign to variable: q = \"a>0\"; df.query(q)\n#\n# Anti-pattern: building query strings by f-string concatenation with user input\n#   Same SQL-injection risk as raw SQL: df.query(f\"name == '{user}'\") on user\n#   = \"x' or 1==1\" gives you the full table. Use @-substitution instead:\n#   df.query(\"name == @user\"). The local-variable form is parsed safely."
                  }
        ],
        tips: [
                  "`query()` shines with 3+ conditions — saves deeply nested parentheses",
                  "Use `@var` to inject any Python object — lists, scalars, even other Series",
                  "Column names with spaces need backtick quoting inside query()",
                  "String methods work inline: `df.query(\"name.str.startswith('A')\")`"
        ],
        mistake: "`df[df.a > 1 and df.b < 5]` raises ValueError. Python `and` does not work on Series. Use `&` with parentheses, or switch to `.query(\"a > 1 and b < 5\")`.",
        shorthand: {
          verbose: "df.query(\"age > 30\")\ndf.query(\"age > 30 and score >= 90\")\ndf.query(\"city in ['NYC', 'LA', 'SF']\")\ndf.query(\"city not in ['Chicago']\")",
          concise: ")",
        },
      },
      {
        id: "isin",
        fn: ".isin()",
        desc: "Filter rows where a column value is in a list of allowed values.",
        category: "Selection",
        subtitle: "Membership filter — cleaner than chained == comparisons",
        signature: "df[df[\"col\"].isin([val1, val2, val3])]",
        descLong: ".isin() checks each element against a list, set, or Series of values and returns a boolean mask. Much cleaner than multiple `==` conditions chained with `|`. Also works with ~isin() for exclusion.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .isin() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Filter with the resulting boolean mask.\n#             \"city in cities\".\n#             cross-DataFrame membership checks.\n#\nimport pandas as pd\ncities = [\"NYC\", \"LA\", \"SF\"]\ndf[df[\"city\"].isin(cities)]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .isin() — common patterns you'll see in production.\n# APPROACH  - Combine .isin() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             for speed on big lists, cross-frame \"is this row's id in\n#             that frame's id column?\" filtering, and combining isin\n#             masks with & for compound conditions.\n#             how you express \"inner-join membership\" without a join.\n#             isin treats it as not-a-member) — that's senior-tier.\n#\nimport pandas as pd\ncities = [\"NYC\", \"LA\", \"SF\"]\ndf[df[\"city\"].isin(cities)]                      # include\ndf[~df[\"city\"].isin([\"Chicago\", \"Houston\"])]     # exclude\n# Set-typed lookup (O(1) per row vs O(N) for list)\nvalid = {\"A\", \"B\", \"C\"}\ndf[df[\"status\"].isin(valid)]\n# Membership against another DataFrame\ndf[df[\"id\"].isin(other_df[\"id\"])]\n# Combine isin masks with & / |\ndf[df[\"city\"].isin(cities) & df[\"status\"].isin([\"active\", \"pending\"])]\n# Flag column instead of filter\ndf[\"is_target_city\"] = df[\"city\"].isin(cities)\n# isin on the index\ndf[df.index.isin([1, 5, 10])]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .isin() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             as not-a-member), use Index.isin for huge label lookups\n#             (skips the to-array detour), and compare against\n#             merge/.query() — picking the right tool for each shape.\n#             fastest membership check on large key sets; knowing when\n#             merge beats isin saves performance on big joins.\n#             simple cases; very large value sets still cost O(N) to\n#             build the lookup; some edge cases (categoricals with\n#             missing categories) require .cat.add_categories first.\n#\nimport pandas as pd\nimport numpy as np\n# 1. NaN trap: NaN is never \"in\" anything — handle it explicitly\ndf[\"city_norm\"] = df[\"city\"].fillna(\"__MISSING__\")\nmask = df[\"city_norm\"].isin([\"NYC\", \"LA\", \"__MISSING__\"])\ndf[mask]                                  # NaN rows kept by intent\n# 2. Index.isin — best path for huge index lookups\nkeep_ids = pd.Index(other_df[\"id\"].unique())\ndf[df[\"id\"].isin(keep_ids)]               # uses hash table internally\n# 3. When isin is the wrong tool — large two-key join\n# Worse:\n#   df[df[\"id\"].isin(other[\"id\"]) & df[\"region\"].isin(other[\"region\"])]\n# Better — actual join with indicator=:\njoined = df.merge(other_df[[\"id\", \"region\"]],\n                  on=[\"id\", \"region\"],\n                  how=\"left\",\n                  indicator=True)\nmatched = joined[joined[\"_merge\"] == \"both\"].drop(columns=\"_merge\")\n# 4. Categorical edge case — value not in declared categories\n# df[\"status\"].isin([\"archived\"]) is False until \"archived\" is a category:\n# df[\"status\"] = df[\"status\"].cat.add_categories([\"archived\"])\n# Decision rule:\n#   Filter to a known set of values             -> df[df.col.isin([...])]\n#   Negate (NOT IN)                              -> df[~df.col.isin([...])]\n#   Set is large (10k+ values)                   -> still fine; isin uses a hash set\n#   Cross-column \"in\"                            -> df.isin({\"col1\": [...], \"col2\": [...]})\n#   Filter to another DataFrame's column         -> df[df.col.isin(other.col)]\n#   Need fuzzy match                              -> NOT isin; use .str.contains or regex\n#   Performance vs equality chain                  -> isin beats (col==a) | (col==b) | ...\n#   Need to keep order or counts                   -> isin returns a mask; pair with sort/groupby\n#\n# Anti-pattern: chaining many ORed equality checks instead of isin\n#   df[(df.col == \"a\") | (df.col == \"b\") | (df.col == \"c\") | ...] is O(N*K)\n#   in Python attribute access. df[df.col.isin([\"a\",\"b\",\"c\",...])] is O(N) with\n#   a hash-set lookup. The readability and speed both improve."
                  }
        ],
        tips: [
                  "`isin()` with a `set` is faster than with a `list` for large value collections — O(1) vs O(n) lookup",
                  "`~df[\"col\"].isin(vals)` is the clean exclusion pattern",
                  "`df[\"col\"].isin(other_df[\"col\"])` filters to rows that exist in another DataFrame",
                  "Combine with `.query()`: `df.query(\"city in @cities\")` — equivalent and often more readable"
        ],
        mistake: "Using `== None` or `== np.nan` inside isin. NaN is never equal to anything including itself. Use `df[\"col\"].isna()` separately to check for nulls.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "between",
        fn: ".between()",
        desc: "Filter rows where a column value falls within a range.",
        category: "Selection",
        subtitle: "Inclusive range check — cleaner than >= and <= combined",
        signature: "df[df[\"col\"].between(left, right, inclusive=\"both\")]",
        descLong: ".between() checks if values fall within [left, right] inclusive by default. Much cleaner than writing `(df[\"col\"] >= lo) & (df[\"col\"] <= hi)`. Works on numeric, datetime, and string columns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .between() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             chained comparisons.\n#             defaults to inclusive on both ends, matching most user\n#             expectations.\n#             explicit (the most common surprise) or show datetime\n#             ranges.\n#\nimport pandas as pd\ndf[df[\"age\"].between(18, 65)]            # 18 <= age <= 65 (inclusive)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .between() — common patterns you'll see in production.\n# APPROACH  - Combine .between() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             apply between to datetime columns, assign a boolean flag,\n#             combine with isin via &.\n#             argument is the single most useful option to know.\n#             order that affects datetime parsing) — senior tier.\n#\nimport pandas as pd\n# Inclusivity per end\ndf[df[\"score\"].between(80, 100, inclusive=\"both\")]      # [80, 100]\ndf[df[\"score\"].between(80, 100, inclusive=\"left\")]      # [80, 100)\ndf[df[\"score\"].between(80, 100, inclusive=\"right\")]     # (80, 100]\ndf[df[\"score\"].between(80, 100, inclusive=\"neither\")]   # (80, 100)\n# Datetime range — strings or Timestamps both work\ndf[df[\"date\"].between(\"2024-01-01\", \"2024-06-30\")]\n# Flag column\ndf[\"is_adult\"] = df[\"age\"].between(18, 65)\n# Combine with isin\ndf[df[\"age\"].between(25, 45) & df[\"city\"].isin([\"NYC\", \"LA\"])]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .between() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             aligned (datetime/Timestamp ambiguity bites otherwise),\n#             handle NaN explicitly (between on NaN returns False),\n#             and consider pd.cut when the same buckets are reused\n#             across the pipeline.\n#             did string compare\" failure mode; explicit NaN handling\n#             keeps row counts honest; pd.cut centralizes the bin\n#             definitions.\n#             timezone-aware datetime columns need both bounds to be\n#             tz-aware (or both naive); inclusive= can't differ per\n#             row, so dynamic bounds need a manual mask.\n#\nimport pandas as pd\n# 1. Align dtypes first — between on object-dtype \"dates\" silently\n#    falls back to lexicographic string comparison\ndf[\"date\"] = pd.to_datetime(df[\"date\"])\nmask = df[\"date\"].between(pd.Timestamp(\"2024-01-01\"),\n                          pd.Timestamp(\"2024-06-30\"))\ndf[mask]\n# 2. NaN handling — between(NaN) is False, so rows with null bounds\n#    drop out silently\nnan_mask = df[\"score\"].isna()\nin_range = df[\"score\"].between(80, 100)\nkeep = in_range | nan_mask                 # decide explicitly\n# 3. Reusable buckets via pd.cut — when the same edges power filters,\n#    aggregations, and plots\nedges  = [0, 18, 30, 50, 80]\nlabels = [\"minor\", \"young_adult\", \"adult\", \"senior\"]\ndf[\"age_band\"] = pd.cut(df[\"age\"], bins=edges, labels=labels, right=True)\ndf.groupby(\"age_band\", observed=True)[\"score\"].mean()\n# 4. Dynamic per-row bounds — between only takes scalars, so use & directly\ndf[(df[\"score\"] >= df[\"min_score\"]) & (df[\"score\"] <= df[\"max_score\"])]\n# Decision rule:\n#   Inclusive range                             -> s.between(lo, hi) (both ends)\n#   Half-open                                   -> s.between(lo, hi, inclusive=\"left\") (3.0+ form)\n#   Exclusive range                              -> s.between(lo, hi, inclusive=\"neither\")\n#   Datetime range                               -> works directly on datetime Series\n#   With NaN handling                             -> NaN is excluded automatically\n#   Negate                                       -> ~s.between(...)\n#   Need a multi-column range                     -> chain two between() with &\n#   Looking for \"outside\" range                   -> ~s.between() is clearer than (s<lo)|(s>hi)\n#\n# Anti-pattern: (s >= lo) & (s <= hi) when between() exists\n#   Functionally equivalent for closed ranges, but between() reads better and\n#   exposes the inclusive= parameter for half-open ranges (important for\n#   percentile cuts where the boundary semantic matters). Use between()."
                  }
        ],
        tips: [
                  "`between()` is inclusive on both ends by default — use `inclusive=` to control endpoints",
                  "Works on datetime columns — pass ISO strings or Timestamps directly",
                  "Cleaner than two separate comparison conditions chained with `&`",
                  "For `pd.cut()` binning based on the same ranges, the boundaries match when `right=True` (default)"
        ],
        mistake: "Forgetting that `between()` is inclusive by default. `df[\"score\"].between(0, 60)` includes both 0 and 60. Use `inclusive=\"neither\"` or `inclusive=\"left\"` if you need exclusive endpoints.",
        shorthand: {
          verbose: "import pandas as pd\ndf[df['age'].between(18, 65)]\ndf[df['score'].between(80, 100)]\ndf[df['score'].between(80, 100, inclusive='left')]   # [80, 100)",
          concise: "df[df['age'].between(25, 45) & df['city'].isin(['NYC', 'LA'])]",
        },
      },
      {
        id: "multiindex",
        fn: "MultiIndex",
        desc: "Hierarchical index with multiple levels of row or column labels.",
        category: "MultiIndex",
        subtitle: "Multi-level indexing for panel data, pivot results, and groupby output",
        signature: "df.set_index([\"col1\",\"col2\"]) | pd.MultiIndex.from_tuples()",
        descLong: "A MultiIndex allows multiple levels of labels on rows or columns. Created automatically by groupby + agg, pivot_table, and set_index with a list. Most useful for panel data (same entity measured over time) and hierarchical grouping.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of MultiIndex — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             list of column names. Look at it; reset back to flat.\n#             promoted to the index\"; the round-trip with reset_index\n#             takes the mystery out.\n#             tuple-key gotcha, or pd.IndexSlice — those are how you\n#             use a MultiIndex once you have one.\n#\nimport pandas as pd\n# Promote two columns into a hierarchical index\ndf = df.set_index([\"year\", \"month\"])\ndf.head()\ndf.index.names                    # ['year', 'month']\ndf.reset_index()                  # back to a flat frame"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of MultiIndex — common patterns you'll see in production.\n# APPROACH  - Combine MultiIndex with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             tuple keys, slice across levels with slice(None) and\n#             flatten MultiIndex columns produced by groupby/pivot.\n#             slice, flatten. Most pandas users will only need this\n#             tier 90% of the time.\n#             pd.IndexSlice — that's the senior tier.\n#\nimport pandas as pd\n# Build from tuples\nidx = pd.MultiIndex.from_tuples(\n    [(\"2024\", \"Jan\"), (\"2024\", \"Feb\"), (\"2025\", \"Jan\")],\n    names=[\"year\", \"month\"],\n)\n# Build the cartesian product of two label sets\nidx = pd.MultiIndex.from_product(\n    [[\"2023\", \"2024\"], [\"Q1\", \"Q2\", \"Q3\", \"Q4\"]],\n    names=[\"year\", \"quarter\"],\n)\n# Access — TUPLE keys for multi-level row, NOT comma-separated\ndf.loc[\"2024\"]                          # all rows where level 0 == \"2024\"\ndf.loc[(\"2024\", \"Jan\")]                 # specific (year, month)\ndf.loc[(\"2024\", \"Jan\"), \"sales\"]        # plus a column\n# Slice across levels with slice(None)\ndf.loc[\"2024\":\"2025\"]                   # range on first level\ndf.loc[(slice(None), \"Q1\"), :]          # all years, Q1 only\n# Flatten MultiIndex columns produced by groupby + agg or pivot_table\ndf.columns = [\"_\".join(map(str, c)) for c in df.columns]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of MultiIndex — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             section slicing, .xs() to drop a level cleanly, ensure\n#             the index is sorted (perf + correctness), and remember\n#             that groupby(as_index=False) often skips the MultiIndex\n#             entirely.\n#             one-liner for \"all rows at level=this label\"; sorted\n#             index makes range slices both fast and correctness-safe;\n#             as_index=False is the lightweight escape hatch.\n#             slicing; .xs(drop_level=False) is needed when you want\n#             to keep the level; very deep MultiIndex (3+ levels)\n#             becomes hard to read regardless.\n#\nimport pandas as pd\nidx = pd.IndexSlice\n# Sort the index — required for range slicing and ~10x faster lookups\ndf = df.sort_index()\n# 1. IndexSlice — readable replacement for slice(None) chains\ndf.loc[idx[\"2024\", \"Q1\":\"Q3\"], :]                 # year 2024, Q1..Q3\ndf.loc[idx[:, \"Q1\"], [\"sales\", \"units\"]]          # Q1 only, two columns\n# 2. Cross-section with .xs — drop a level on the way out\ndf.xs(\"Q1\", level=\"quarter\")                      # all years, Q1\ndf.xs(\"Q1\", level=\"quarter\", drop_level=False)    # keep the level\n# 3. Avoid MultiIndex entirely when you don't need it\nflat = df.reset_index()\nflat = (df.reset_index()\n          .groupby([\"year\", \"quarter\"], as_index=False)\n          .agg(sales=(\"sales\", \"sum\")))\n# 4. Anti-pattern — comma instead of tuple\n# Wrong:  df.loc[\"2024\", \"Jan\"]   <- interpreted as row=\"2024\", col=\"Jan\"\n# Right:  df.loc[(\"2024\", \"Jan\")]\n# (using IndexSlice avoids this trap entirely)\n# Decision rule:\n#   Time series + entity panel                  -> MultiIndex on (date, entity)\n#   Pivot result                                 -> usually returns MultiIndex columns\n#   Hierarchical groups (region/country/city)    -> MultiIndex captures hierarchy explicitly\n#   Slice all of one level                       -> df.loc[(\"US\", slice(None)), :]\n#   Slice on inner level                          -> use pd.IndexSlice: df.loc[idx[:, \"X\"], :]\n#   Want to flatten                              -> df.reset_index() or columns=df.columns.to_flat_index()\n#   Want to sort for fast slicing                 -> df.sort_index() (CRITICAL for perf)\n#   Multi-key joins                              -> set both sides' MultiIndex, then df.join\n#\n# Anti-pattern: slicing a MultiIndex without sorting it first\n#   Unsorted MultiIndex raises PerformanceWarning AND falls back to O(n) scans.\n#   Always df = df.sort_index() right after any operation that disturbs the\n#   index order (concat, append, certain merges). Check with df.index.is_monotonic_increasing."
                  }
        ],
        tips: [
                  "`df.loc[\"2024\"]` selects all rows where the first index level is \"2024\"",
                  "Flatten MultiIndex columns after aggregation: `df.columns = [\"_\".join(c) for c in df.columns]`",
                  "`pd.IndexSlice` makes complex MultiIndex slicing more readable: `idx = pd.IndexSlice; df.loc[idx[\"2024\", \"Q1\":\"Q3\"], :]`",
                  "Most MultiIndex confusion comes from groupby — use `as_index=False` to avoid it when you do not need it"
        ],
        mistake: "Trying to access a MultiIndex row with `df.loc[\"2024\", \"Jan\"]`. This is interpreted as row=\"2024\", col=\"Jan\". Use `df.loc[(\"2024\", \"Jan\")]` (tuple) for a MultiIndex row.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },

  // ── Section 4: Cleaning Data ─────────────────────────────────────────
  {
    id: "cleaning",
    title: "Cleaning Data",
    entries: [
      {
        id: "isna",
        fn: ".isna()",
        desc: "Detect missing values — returns a boolean DataFrame.",
        category: "Cleaning",
        subtitle: "Quantify nulls before deciding how to handle them",
        signature: "df.isna() | df.isna().sum() | df[df[\"col\"].isna()]",
        descLong: "isna() returns True for NaN/NaT/None values. Always quantify missing data before deciding how to handle it — blindly dropping rows with any NaN can silently destroy most of a dataset.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .isna() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             do on any new DataFrame.\n#             a one-liner.\n#             empty-string trap.\n#\nimport pandas as pd\ndf.isna().sum()\n# id        0\n# date    150\n# amount    0"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .isna() — common patterns you'll see in production.\n# APPROACH  - Combine .isna() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             level \"any null\" / \"all null\" masks, column selection\n#             by null presence, and notna for the inverse.\n#             dropna/fillna decision; the \"always count first\" habit\n#             prevents catastrophic data loss.\n#             differences in mixed-dtype frames — senior tier.\n#\nimport pandas as pd\ndf.isna().sum()                         # per column\ndf.isna().mean().mul(100).round(1)      # percentage per column\ndf.isna().sum().sum()                   # grand total\ndf[df[\"date\"].isna()]                   # rows where one col is null\ndf[df.isna().any(axis=1)]               # rows with ANY null\ndf[df.isna().all(axis=1)]               # rows that are all-null\ndf.loc[:, df.isna().any()]              # columns that have any null\ndf[df[\"date\"].notna()]                  # inverse mask\ndf[df.notna().all(axis=1)]              # rows with no nulls at all"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .isna() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             nulls (isna misses them), summarize per-column null\n#             rates with rolling baselines, and treat \"missingness\n#             pattern\" as a feature in itself.\n#             schema regressions; missingness-as-signal sometimes\n#             improves model performance.\n#             checks add ops surface; treating missingness as a\n#             feature can leak label-related signal if not careful.\n#\nimport pandas as pd\nimport numpy as np\n# 1. Catch the empty-string / whitespace null trap before isna()\ndf = df.replace(r\"^\\s*$\", pd.NA, regex=True)\n# 2. Comprehensive null report\nreport = pd.DataFrame({\n    \"null_count\": df.isna().sum(),\n    \"null_pct\":   df.isna().mean().mul(100).round(2),\n    \"dtype\":      df.dtypes.astype(str),\n}).sort_values(\"null_pct\", ascending=False)\n# 3. Drift check against a baseline (CI / pipeline test)\nbaseline = pd.read_parquet(\"schema/null_pct_baseline.parquet\")[\"null_pct\"]\ndelta    = (report[\"null_pct\"] - baseline.reindex(report.index).fillna(0))\nflagged  = delta[delta.abs() > 5.0]      # >5pp drift in null rate\n# 4. Missingness as signal — sometimes the FACT that a value is missing\n#    correlates with the target variable\ndf[\"had_email\"] = df[\"email\"].notna()    # candidate feature for ML\n# 5. NaN vs NaT vs None vs NA in mixed dtypes\n#    isna() handles all four uniformly — but downstream serialization\n#    (to_json, to_sql) may differ. Pin types BEFORE writing out.\n# Decision rule:\n#   Element-wise null check                     -> df.isna() (alias .isnull())\n#   Per-column null count                         -> df.isna().sum()\n#   Drop rows with any null                       -> df.dropna()\n#   Filter to rows WITH null in a column          -> df[df.col.isna()]\n#   Filter to non-null                            -> df[df.col.notna()]\n#   Coverage % per column                         -> 1 - df.isna().mean()\n#   Treat empty-string as null too                 -> .replace(\"\", np.nan).isna()\n#   Inf as null                                   -> df.replace([np.inf, -np.inf], np.nan).isna()\n#\n# Anti-pattern: comparing to NaN with == -> df[df.col == np.nan]\n#   NaN != NaN by IEEE rules, so the mask is all False. You silently get an\n#   empty DataFrame and \"no nulls\" — even when half the column is NaN. Always\n#   use .isna() / .notna(); never compare with == np.nan."
                  }
        ],
        tips: [
                  "Run `df.isna().sum()` before any `dropna()` — you may be about to drop most of your data",
                  "`df.isna().mean()` gives proportions — multiply by 100 for percentages",
                  "`df.notna()` is cleaner than `~df.isna()` for readability",
                  "Empty strings `\"\"` are NOT nulls — use `df.replace(r\"^\\s*$\", pd.NA, regex=True)` to convert them"
        ],
        mistake: "Assuming `df.isna()` catches empty strings. `\"\"` and `\"  \"` are valid strings, not NaN. Check with `(df == \"\").sum()` as well.",
        shorthand: {
          verbose: "from typing import Optional, Union, List, Dict, Callable, Tuple, Any\ndf.isna().sum()\ndf.isna().mean().mul(100).round(1)\ndf.isna().sum().sum()",
          concise: "df.notna().all(axis=1)         # rows with no nulls at all",
        },
      },
      {
        id: "duplicated",
        fn: ".duplicated() / .drop_duplicates()",
        desc: "Find and remove duplicate rows.",
        category: "Cleaning",
        subtitle: "Detect duplicates with .duplicated(), remove with .drop_duplicates()",
        signature: "df.duplicated(subset=None, keep=\"first\") | df.drop_duplicates()",
        descLong: "duplicated() returns a boolean Series — True for rows that are duplicates. drop_duplicates() removes them. Both support subset= to check only specific columns, and keep= to control which occurrence to retain.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .duplicated() / .drop_duplicates() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             (\"first occurrence kept\") is usually what you want for\n#             a quick clean.\n#             half my data?\" surprises.\n#             definition; subset= is what you actually need. Junior\n#             tier covers it.\n#\nimport pandas as pd\ndf.duplicated().sum()        # how many duplicate rows?\ndf = df.drop_duplicates()    # keep the first occurrence of each"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .duplicated() / .drop_duplicates() — common patterns you'll see in production.\n# APPROACH  - Combine .duplicated() / .drop_duplicates() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             keep= to control which occurrence wins, keep=False to\n#             surface ALL duplicate rows (including the first), and\n#             reset_index after dedupe to avoid gappy indices.\n#             business key, not by entire row; keep=False is the\n#             move when you need to investigate WHY there are dupes.\n#             whitespace / casing) — those need a normalize step\n#             before dedupe (senior tier).\n#\nimport pandas as pd\n# Count and inspect\ndf.duplicated().sum()\ndf.duplicated(subset=[\"id\"]).sum()             # by business key\ndf[df.duplicated(keep=False)].sort_values(\"id\")  # show ALL occurrences\n# Drop with explicit key + keep policy\ndf = df.drop_duplicates(subset=[\"email\"])             # one row per email\ndf = df.drop_duplicates(subset=[\"name\", \"date\"])      # composite key\n# After deduplication, reset the index — otherwise it has gaps\ndf = df.drop_duplicates(subset=[\"id\"]).reset_index(drop=True)\n# keep= options\n# 'first' (default)  - keep first occurrence\n# 'last'             - keep last occurrence\n# False              - drop ALL duplicates (including the first)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .duplicated() / .drop_duplicates() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             unicode), break ties on a sort column so \"keep latest\"\n#             is correct, and persist a duplicate-rate metric for\n#             ongoing data quality monitoring.\n#             then-drop_duplicates is the canonical \"keep most recent\"\n#             pattern; tracking duplicate rate over time surfaces\n#             upstream issues quickly.\n#             accents? lowercase emails? trim middle initials?);\n#             sort+dedupe only works when you have a usable tie-break\n#             column; metrics need a place to land (a database, a\n#             dashboard).\n#\nimport pandas as pd\n# 1. Normalize before dedupe — exact-match misses near-duplicates\ndef normalize_key(s: pd.Series) -> pd.Series:\n    return (s.astype(\"string\")\n             .str.strip()\n             .str.lower()\n             .str.normalize(\"NFKC\"))\ndf[\"email_key\"] = normalize_key(df[\"email\"])\ndf = df.drop_duplicates(subset=[\"email_key\"]).drop(columns=\"email_key\")\n# 2. Keep the LATEST per key — sort first, then drop_duplicates(keep=\"last\")\ndf = (df.sort_values(\"updated_at\")\n        .drop_duplicates(subset=[\"customer_id\"], keep=\"last\")\n        .reset_index(drop=True))\n# 3. For fuzzy / typo-level dedupe, exact match isn't enough — reach\n#    for the dedupe library, recordlinkage, or a simple Levenshtein pass.\n# 4. Track the duplicate rate over time — a sudden spike is the\n#    earliest signal of an upstream pipeline regression\ndef dup_rate(df: pd.DataFrame, subset: list[str]) -> float:\n    return df.duplicated(subset=subset).mean()\n# log_metric(\"dedupe.dup_rate\", dup_rate(df, [\"customer_id\", \"date\"]))\n# Decision rule:\n#   Boolean mask of dups                        -> df.duplicated()\n#   Keep first occurrence (default)              -> keep=\"first\"\n#   Keep last                                    -> keep=\"last\"\n#   Mark ALL dups (no \"kept\") flag                -> keep=False\n#   Dedupe the frame                             -> df.drop_duplicates()\n#   Subset of columns                             -> subset=[\"a\",\"b\"]\n#   Count of dups                                -> df.duplicated().sum()\n#   Need group sizes per duplicate                -> df.groupby(cols).size().loc[lambda s: s>1]\n#\n# Anti-pattern: drop_duplicates() without subset= when only some columns define identity\n#   \"Same user, same event, different timestamp\" should NOT be deduped if you\n#   intended uniqueness on (user_id, event). Always pass subset=[...] to spell\n#   out what defines a duplicate; otherwise you're at the mercy of every column."
                  }
        ],
        tips: [
                  "`df[df.duplicated(keep=False)]` shows ALL rows involved in duplicates — including the first occurrence",
                  "`subset=` is critical — often you want to dedupe on a key column, not all columns combined",
                  "Always `reset_index(drop=True)` after `drop_duplicates()` — the original index has gaps otherwise",
                  "For fuzzy/near-duplicate detection, look at the `dedupe` library"
        ],
        mistake: "`drop_duplicates()` without `subset=` requires ALL columns to match. A row with the same ID but different timestamp is NOT a duplicate. Always specify the key columns.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "dropna",
        fn: ".dropna()",
        desc: "Remove rows or columns containing missing values.",
        category: "Cleaning",
        subtitle: "Drop with subset=, how=, and thresh= for surgical removal",
        signature: "df.dropna(subset=[], how=\"any\", thresh=None)",
        descLong: "dropna() removes rows (or columns) with NaN. subset= limits to specific columns. thresh= keeps rows with at least N non-NaN values. Always check how many rows you lose before committing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .dropna() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             dropping before you drop it.\n#             usually the WRONG default for a real dataset.\n#\nimport pandas as pd\ndf.isna().any(axis=1).sum()        # how many rows have ANY null?\ndf = df.dropna()                   # remove them (reassign — returns a copy)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .dropna() — common patterns you'll see in production.\n# APPROACH  - Combine .dropna() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             specific columns, how=\"all\" to remove only fully-empty\n#             rows, thresh= to keep rows with at least N non-null\n#             values, axis=1 to drop COLUMNS instead.\n#             targeted, not blanket. Keeps your row count honest.\n#             scenario that bare dropna() causes; senior tier adds\n#             the safety check.\n#\nimport pandas as pd\n# Surgical drop — only on the columns that matter\ndf = df.dropna(subset=[\"id\", \"amount\"])      # require id AND amount\n# Drop only rows that are completely empty\ndf = df.dropna(how=\"all\")\n# Keep rows with enough complete data\ndf = df.dropna(thresh=4)                     # require >= 4 non-null values\n# Drop COLUMNS that are mostly null\ndf = df.dropna(axis=1, thresh=int(len(df) * 0.5))   # cols with >=50% non-null\n# Always reassign — dropna returns a new frame by default\ndf = df.dropna(subset=[\"id\"])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .dropna() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             before dropping, log the drop reason for audit, and\n#             prefer fillna over dropna whenever the row carries\n#             usable signal. Treat \"drop\" as an explicit decision,\n#             never a default.\n#             are auditable; \"fillna over dropna\" preserves sample\n#             size for ML.\n#             threshold is domain-specific (1% may be fine, 10% may\n#             not be); fillna can introduce bias of its own.\n#\nimport pandas as pd\nimport logging\nlog = logging.getLogger(__name__)\ndef safe_dropna(df: pd.DataFrame, subset: list[str],\n                max_loss_pct: float = 5.0) -> pd.DataFrame:\n    before = len(df)\n    out = df.dropna(subset=subset).reset_index(drop=True)\n    lost = (before - len(out)) / before * 100\n    if lost > max_loss_pct:\n        raise ValueError(\n            f\"dropna(subset={subset}) would drop {lost:.1f}% of rows \"\n            f\"(max {max_loss_pct}%); investigate upstream nulls first\"\n        )\n    log.info(\"dropna(subset=%s) removed %d rows (%.2f%%)\",\n             subset, before - len(out), lost)\n    return out\ndf = safe_dropna(df, subset=[\"id\", \"amount\"])\n# Anti-pattern in production:\n#   df = df.dropna()                # blanket drop — silently nukes data\n# Better:\n#   df = df.dropna(subset=key_cols) # explicit, auditable\n#   OR\n#   df = df.fillna({\"amount\": 0})   # if 0 is semantically valid\n# When dropna IS the right call:\n#   - id-shaped columns where missingness means \"row is invalid\"\n#   - small (<1%) tail of incomplete rows in a large frame\n# When it ISN'T:\n#   - majority of rows have at least one null somewhere -> use thresh=\n#     or fillna instead\n# Decision rule:\n#   Drop rows with ANY null                     -> df.dropna() (default how=\"any\")\n#   Drop rows where ALL are null                  -> how=\"all\"\n#   Drop based on specific columns                 -> subset=[\"col1\",\"col2\"]\n#   Threshold (need at least N non-null)           -> thresh=N\n#   Drop columns with too many nulls              -> axis=1 + thresh\n#   Filter without modifying                       -> df[df.col.notna()] (single col, faster)\n#   Imputation might be better                    -> .fillna or sklearn SimpleImputer\n#   Time series with gaps                          -> .ffill/.bfill or interpolation, not drop\n#\n# Anti-pattern: dropna() before joining when nulls are meaningful\n#   Throwing away rows because col_X is null can hide systematic missingness\n#   (sensor offline, opt-out users). dropna() is destructive — first chart the\n#   missingness pattern (df.isna().mean()) and decide if drop, fill, or flag\n#   (\"missing as a category\") is right."
                  }
        ],
        tips: [
                  "Always `df.isna().sum()` first — know what you are losing before you drop",
                  "`subset=[\"col\"]` only drops rows where that specific column is null — much more surgical than plain `dropna()`",
                  "`thresh=n` is useful when you want to keep rows with *mostly* complete data",
                  "`dropna()` returns a new DataFrame by default — always reassign the result"
        ],
        mistake: "Calling `df.dropna()` without subset= or thresh=. If any column has nulls, every row with that null is dropped — often 80%+ of your data.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "fillna",
        fn: ".fillna()",
        desc: "Fill missing values with a constant, statistic, or method.",
        category: "Cleaning",
        subtitle: "Replace NaN with a value, mean/median, or ffill/bfill",
        signature: "df.fillna(value) | df[\"col\"].fillna(df[\"col\"].mean())",
        descLong: "fillna() replaces NaN values. Use a scalar, a dict (per column), or a fill method. ffill() propagates the last valid value forward — essential in time series. bfill() propagates backward.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .fillna() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             in two lines.\n#             mean/sum/aggregations and biases models. Junior tier\n#             covers per-column fills.\n#\nimport pandas as pd\ndf = df.fillna(0)              # numeric default — usually wrong\ndf = df.fillna(\"Unknown\")      # string default — usually fine"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .fillna() — common patterns you'll see in production.\n# APPROACH  - Combine .fillna() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             frame), column-statistic imputation (median for skewed\n#             data), forward/backward fill for time series, and\n#             interpolate for numeric gaps.\n#             is the cleanest way to express \"different policy per\n#             column\" in one call.\n#             ML training (mean/median uses the WHOLE column,\n#             including test rows). Senior tier addresses that.\n#\nimport pandas as pd\n# Per-column fills — one call, explicit policy\ndf = df.fillna({\n    \"age\":   df[\"age\"].median(),\n    \"city\":  \"Unknown\",\n    \"score\": df[\"score\"].median(),\n})\n# Forward / backward fill — the time-series tools\ndf[\"price\"] = df[\"price\"].ffill()             # carry last known forward\ndf[\"price\"] = df[\"price\"].ffill().bfill()     # fill both directions\n# Linear / time-aware interpolation between known values\ndf[\"price\"] = df[\"price\"].interpolate(method=\"linear\")\ndf[\"price\"] = df[\"price\"].interpolate(method=\"time\")\n# Convert sentinel values to NaN before fillna\ndf = df.replace(-999, pd.NA)\ndf = df.replace(r\"^\\s*$\", pd.NA, regex=True)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .fillna() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             data only and apply to test (no leakage), use sklearn's\n#             SimpleImputer for pipeline integrity, and add a flag\n#             column so models can learn from \"was missing\".\n#             + ColumnTransformer is reproducible and serializable;\n#             missing-flag features sometimes outperform the imputed\n#             value itself.\n#             missing-flag pattern doubles the column count for the\n#             affected fields.\n#\nimport pandas as pd\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.compose import ColumnTransformer\n# 1. Add missing-flag features BEFORE imputing\nfor col in [\"age\", \"income\"]:\n    df[f\"{col}_was_missing\"] = df[col].isna().astype(\"int8\")\n# 2. Fit imputers on TRAIN only — never the full dataset\ntrain, test = ...  # split first\nnum_imputer = SimpleImputer(strategy=\"median\")\ncat_imputer = SimpleImputer(strategy=\"most_frequent\")\nct = ColumnTransformer([\n    (\"num\", num_imputer, [\"age\", \"income\"]),\n    (\"cat\", cat_imputer, [\"city\", \"status\"]),\n], remainder=\"passthrough\")\nct.fit(train)\ntrain_imp = ct.transform(train)\ntest_imp  = ct.transform(test)        # uses TRAIN's medians/modes\n# 3. Time-series fillna with explicit limit — never propagate\n#    beyond a horizon you trust\ndf[\"price\"] = df[\"price\"].ffill(limit=3)     # at most 3 forward steps\n# 4. Group-aware imputation — fill within a customer/product, not\n#    across the whole dataset\ndf[\"amount\"] = (df.groupby(\"customer_id\")[\"amount\"]\n                  .transform(lambda s: s.fillna(s.median())))\n# Anti-pattern in ML pipelines:\n#   df[\"age\"] = df[\"age\"].fillna(df[\"age\"].mean())   # leaks test values\n# Use SimpleImputer (above) so the statistic is fit on train only.\n# Decision rule:\n#   Constant fill                                -> df.fillna(0) / df.fillna(\"Unknown\")\n#   Per-column constants                          -> df.fillna({\"a\": 0, \"b\": \"?\"})\n#   Forward fill (LOCF)                           -> df.fillna(method=\"ffill\")\n#   Backward fill                                 -> .fillna(method=\"bfill\")\n#   Linear interpolation (numeric)                -> df.interpolate()\n#   Group-aware fill                              -> df.groupby(g).ffill()\n#   Median for skewed / mean for symmetric        -> domain choice; never blanket \"0\"\n#   ML pipeline                                   -> sklearn.impute.SimpleImputer (fit on train)\n#\n# Anti-pattern: fillna(0) on a column that should have stayed null\n#   Zero is a value, missing is the absence of one. Filling counts/IDs/log-values\n#   with 0 corrupts every downstream sum and average. Default to keeping nulls\n#   and only fill when the imputation rule is justified (constant for category,\n#   median for skewed numeric, ffill for time-series gaps)."
                  }
        ],
        tips: [
                  "`ffill()` is essential in time series — carries the last known value forward through gaps",
                  "`pd.NA` is the modern null for all dtypes; `np.nan` is float-only",
                  "Filling with the mean changes distributional properties — use median for skewed data",
                  "`df.replace(r\"^\\s*$\", pd.NA, regex=True)` catches empty-string nulls that `isna()` misses"
        ],
        mistake: "Filling numeric NaN with 0 by default. 0 is a valid data value — it changes mean, sum, and all aggregations. Fill with `mean()` or `median()` unless 0 is semantically correct.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "astype",
        fn: ".astype()",
        desc: "Convert a column to a different dtype.",
        category: "Cleaning",
        subtitle: "Explicit type conversion — raises on bad values",
        signature: "df[\"col\"].astype(dtype) | df.astype({\"col\": dtype})",
        descLong: "astype() converts a column to a specified dtype. It raises an error if any value cannot be converted. Use pd.to_numeric(errors=\"coerce\") or pd.to_datetime(errors=\"coerce\") for messy data that should produce NaN on failure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .astype() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             like the Python builtins (int, float, bool).\n#             the senior failure modes need to-numeric / nullable\n#             dtypes (junior tier).\n#\nimport pandas as pd\ndf[\"age\"]    = df[\"age\"].astype(int)\ndf[\"score\"]  = df[\"score\"].astype(float)\ndf[\"active\"] = df[\"active\"].astype(bool)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .astype() — common patterns you'll see in production.\n# APPROACH  - Combine .astype() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             columns at once, memory-efficient types (int32,\n#             float32, category), and the nullable Int64 for\n#             integer columns that contain NaN.\n#             integers integer in the presence of nulls — the single\n#             most common dtype trap solved.\n#             For messy data, pd.to_numeric(errors=\"coerce\") is the\n#             right tool — see the \"to-numeric\" entry.\n#\nimport pandas as pd\n# Multiple columns at once\ndf = df.astype({\n    \"age\":   \"int32\",\n    \"score\": \"float32\",\n    \"city\":  \"category\",\n})\n# Memory-efficient numeric types\ndf[\"count\"] = df[\"count\"].astype(\"int32\")        # vs int64\ndf[\"ratio\"] = df[\"ratio\"].astype(\"float32\")      # vs float64\n# Nullable integer — the fix for \"int column with NaN coerced to float\"\ndf[\"id\"] = df[\"id\"].astype(\"Int64\")              # capital I\n# Verify\ndf.dtypes\ndf.memory_usage(deep=True).sum() / 1e6           # MB"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .astype() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             possible, fall back to to_numeric / to_datetime with\n#             errors=\"coerce\" for messy data, and prefer the nullable\n#             extension dtypes (Int64, Float64, boolean, string) so\n#             missing values don't promote to the wrong base type.\n#             dtypes preserve semantics; convert_dtypes(dtype_backend=\n#             \"pyarrow\") is a one-liner upgrade for new pipelines.\n#             that expects numpy primitives; some libraries don't yet\n#             round-trip pyarrow-backed strings; old pickle files\n#             can't read new dtypes.\n#\nimport pandas as pd\n# 1. Pin at load time — fastest, no inference pass\ndf = pd.read_csv(\"data.csv\", dtype={\n    \"id\":     \"Int64\",\n    \"amount\": \"float32\",\n    \"city\":   \"category\",\n}, parse_dates=[\"date\"])\n# 2. Messy strings -> numeric: astype is the wrong tool\n# df[\"price\"].astype(float)               # ValueError on \"$12.50\"\ndf[\"price\"] = pd.to_numeric(df[\"price\"], errors=\"coerce\")  # bad -> NaN\n# 3. Whole-frame upgrade to nullable / pyarrow-backed dtypes (>= 2.0)\ndf = df.convert_dtypes(dtype_backend=\"pyarrow\")\n# 4. Audit the schema after every load — fail loudly on regressions\nexpected = pd.Series({\n    \"id\":      \"Int64\",\n    \"amount\":  \"float32\",\n    \"city\":    \"category\",\n    \"date\":    \"datetime64[ns]\",\n})\nactual = df.dtypes.astype(str)\nmismatch = expected[expected != actual.reindex(expected.index)]\nassert mismatch.empty, f\"dtype regression: {mismatch.to_dict()}\"\n# Decision rule:\n#   Reliable numeric conversion                 -> df[\"x\"].astype(\"int32\")\n#   Numeric with possible bad strings            -> pd.to_numeric(s, errors=\"coerce\")\n#   Datetime conversion                          -> pd.to_datetime(s, utc=True)\n#   String -> category                           -> .astype(\"category\") (memory win)\n#   Multiple columns at once                     -> df.astype({\"a\":\"int32\",\"b\":\"category\"})\n#   Nullable integer                             -> \"Int64\" (capital I)\n#   Coerce errors to NaN                         -> pd.to_numeric(..., errors=\"coerce\")\n#   Not sure if conversion fits                  -> errors=\"raise\" first, narrow dtypes after\n#\n# Anti-pattern: astype(\"int\") on a Series that has NaN\n#   numpy int can't hold NaN — pandas raises (or worse, silently casts via float).\n#   Either fillna first (with a sentinel like -1) or use the nullable \"Int64\"\n#   dtype that natively supports missing values."
                  }
        ],
        tips: [
                  "Converting string columns to `\"category\"` can reduce memory by **10x** for low-cardinality data",
                  "`\"Int64\"` (capital I, quoted string) is nullable integer — handles NaN without converting to float",
                  "`astype()` raises on bad values — use `pd.to_numeric(errors=\"coerce\")` for messy data",
                  "Multiple columns at once: `df.astype({\"a\": int, \"b\": float})` — one call, no loop"
        ],
        mistake: "`df[\"col\"].astype(int)` on a column containing NaN raises ValueError — NaN is a float. Fill NaN first, or use `astype(\"Int64\")` (capital I = nullable integer).",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "categorical",
        fn: "pd.Categorical",
        desc: "Fixed set of possible values with optional ordering.",
        category: "Cleaning",
        subtitle: "Memory-efficient strings with sortable order for low-cardinality columns",
        signature: "df[\"col\"].astype(\"category\") | pd.Categorical(values, categories, ordered)",
        descLong: "The category dtype stores a column as integer codes pointing to a lookup table of unique values. This can reduce memory by 10x for low-cardinality string columns. Ordered categoricals support comparison operators and correct sort order.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.Categorical — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             measure the memory before/after.\n#             much smaller memory footprint.\n#             categories accessors, or the observed= flag in\n#             groupby — those are the everyday extras.\n#\nimport pandas as pd\nbefore = df[\"city\"].memory_usage(deep=True)\ndf[\"city\"] = df[\"city\"].astype(\"category\")\nafter  = df[\"city\"].memory_usage(deep=True)\nprint(f\"{before/1024:.0f} KB -> {after/1024:.0f} KB\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.Categorical — common patterns you'll see in production.\n# APPROACH  - Combine pd.Categorical with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             cat.codes, ordered categoricals via CategoricalDtype,\n#             and observed=True in groupby (essential — otherwise\n#             empty categories produce empty groups).\n#             after creating it; ordered categoricals are how\n#             \"S/M/L/XL\" sorts correctly without bespoke code.\n#             high-cardinality strings makes things WORSE) or the\n#             arrow-string alternative — senior tier.\n#\nimport pandas as pd\nfrom pandas.api.types import CategoricalDtype\n# Basic conversion + introspection\ndf[\"status\"] = df[\"status\"].astype(\"category\")\ndf[\"status\"].cat.categories                   # the lookup table\ndf[\"status\"].cat.codes                        # integer encoding per row\n# Add or prune categories\ndf[\"status\"] = df[\"status\"].cat.add_categories([\"archived\"])\ndf[\"status\"] = df[\"status\"].cat.remove_unused_categories()\n# Ordered categorical — comparisons and sort use the declared order\nsize_type = CategoricalDtype(\n    categories=[\"S\", \"M\", \"L\", \"XL\"],\n    ordered=True,\n)\ndf[\"size\"] = df[\"size\"].astype(size_type)\ndf[df[\"size\"] >= \"L\"]                         # works because ordered\ndf.sort_values(\"size\")                        # sorts in category order\n# Always use observed=True in groupby with categoricals\ndf.groupby(\"status\", observed=True)[\"revenue\"].sum()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.Categorical — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             can use MORE memory as category. Compare against\n#             string[pyarrow]. Use a fixed CategoricalDtype across\n#             pipelines so concat/merge stay aligned.\n#             memory\" footgun; pyarrow strings often beat category\n#             above a few thousand uniques; pinned CategoricalDtype\n#             survives round-trips through parquet.\n#             length distribution); pyarrow string requires pandas\n#             >= 2.0; CategoricalDtype mismatches between two frames\n#             cause subtle merge bugs.\n#\nimport pandas as pd\nfrom pandas.api.types import CategoricalDtype\n# 1. Decide BEFORE casting — measurement-driven\ndef best_string_dtype(s: pd.Series) -> str:\n    n = len(s)\n    nunique = s.nunique(dropna=True)\n    avg_len = s.dropna().astype(str).str.len().mean() or 0\n    cat_bytes   = nunique * avg_len + 4 * n         # codes + categories\n    arrow_bytes = avg_len * n * 1.0                  # arrow string overhead\n    return \"category\" if cat_bytes < arrow_bytes else \"string[pyarrow]\"\n# 2. Pinned dtype across the pipeline — concat/merge stay correct\nSTATUS_DTYPE = CategoricalDtype(\n    categories=[\"active\", \"pending\", \"inactive\", \"archived\"],\n    ordered=False,\n)\ndf[\"status\"] = df[\"status\"].astype(STATUS_DTYPE)\ndf.to_parquet(\"snap.parquet\")\n# Loaded back with the same categories thanks to the pinned dtype.\n# 3. Concatenation gotcha — categories union or align by intent\na = pd.Series([\"x\"], dtype=CategoricalDtype([\"x\", \"y\"]))\nb = pd.Series([\"z\"], dtype=CategoricalDtype([\"x\", \"z\"]))\npd.concat([a, b])                     # dtype falls back to object!\n# Fix: union the categories first\npd.concat([a, b]).astype(\n    CategoricalDtype(sorted(set(a.cat.categories) | set(b.cat.categories)))\n)\n# 4. Always observed=True; default behavior creates empty groups\ndf.groupby(\"status\", observed=True)[\"revenue\"].agg([\"sum\", \"count\"])\n# Decision rule:\n#   Low-cardinality string (< 50% unique)       -> .astype(\"category\") (10-100x memory)\n#   Ordered category (Low < Med < High)          -> pd.Categorical(values, categories=..., ordered=True)\n#   Need to add new categories later             -> cat.add_categories([...])\n#   GroupBy on a categorical                     -> respects defined order in result\n#   Encoding for ML                              -> pd.get_dummies or sklearn OneHotEncoder\n#   Cross frames                                 -> reuse pd.api.types.CategoricalDtype object\n#   Save to disk                                 -> parquet preserves; csv loses\n#   Cardinality > ~10000                         -> category overhead may exceed gain; profile\n#\n# Anti-pattern: comparing a string-typed column to a categorical of the same values\n#   The comparison silently returns all False — pandas treats them as different\n#   dtypes. Either convert both sides to category (sharing CategoricalDtype) or\n#   coerce both to plain string. Don't mix."
                  }
        ],
        tips: [
                  "Convert when `nunique / len(df) < 0.5` — the category dtype saves the most memory then",
                  "Ordered categoricals give correct sort order for things like T-shirt sizes, severity levels",
                  "`observed=True` in `groupby()` skips empty categories — always use it with categoricals",
                  "`cat.codes` gives the integer encoding — useful for ML models that need numeric input"
        ],
        mistake: "Converting high-cardinality columns (emails, names, free text) to `\"category\"`. Each unique value still gets stored — memory may actually increase. Check cardinality first.",
        shorthand: {
          verbose: "import pandas as pd\nfrom pandas.api.types import CategoricalDtype\ndf['status'] = df['status'].astype('category')\ndf['city']   = df['city'].astype('category')",
          concise: "df.groupby('status', observed=True)['revenue'].sum()",
        },
      },
      {
        id: "to-numeric",
        fn: "pd.to_numeric()",
        desc: "Convert a Series to numeric, coercing bad values to NaN.",
        category: "Cleaning",
        subtitle: "Safe numeric conversion — errors=\"coerce\" turns failures into NaN",
        signature: "pd.to_numeric(series, errors=\"coerce\", downcast=None)",
        descLong: "pd.to_numeric() converts a Series to numeric dtype. errors=\"coerce\" turns any non-numeric value into NaN instead of raising — essential for messy real-world data. downcast= picks the smallest valid numeric type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.to_numeric() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             instead of crashing.\n#             flag eliminates the most common conversion crash.\n#             follow up with a \"what failed?\" check (junior tier).\n#\nimport pandas as pd\ndf[\"price\"] = pd.to_numeric(df[\"price\"], errors=\"coerce\")\n# \"$12.50\" -> NaN\n# \"12.50\"  -> 12.5\n# \"12\"     -> 12.0"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.to_numeric() — common patterns you'll see in production.\n# APPROACH  - Combine pd.to_numeric() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             for memory wins, and the post-coerce audit (\"which\n#             original values became NaN?\"). Apply across many\n#             columns when an entire frame is suspect.\n#             clean-up pipeline; the audit step is what separates\n#             a careful conversion from a destructive one.\n#             senior tier captures a \"raw vs cleaned\" diff for audit.\n#\nimport pandas as pd\n# errors= spectrum\ndf[\"price\"] = pd.to_numeric(df[\"price\"], errors=\"raise\")    # ValueError\ndf[\"price\"] = pd.to_numeric(df[\"price\"], errors=\"coerce\")   # NaN on fail\ndf[\"price\"] = pd.to_numeric(df[\"price\"], errors=\"ignore\")   # leaves str\n# downcast — pick the smallest valid numeric dtype\ndf[\"count\"] = pd.to_numeric(df[\"count\"], downcast=\"integer\")  # int8/16/32\ndf[\"ratio\"] = pd.to_numeric(df[\"ratio\"], downcast=\"float\")    # float32\n# Post-coerce audit — what original values became NaN?\nraw = df[\"price\"]   # before\ndf[\"price_clean\"] = pd.to_numeric(raw, errors=\"coerce\")\nfailed = df.loc[df[\"price_clean\"].isna() & raw.notna(), \"price\"]\nfailed.value_counts().head()\n# Apply across an entire frame\nnumeric_df = df.apply(pd.to_numeric, errors=\"coerce\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.to_numeric() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             garbage (currency symbols, thousand separators, percent\n#             signs) before to_numeric, persist a parse-failure audit\n#             alongside the cleaned column, and pick nullable Int64 /\n#             Float64 to keep semantics in the presence of NaN.\n#             column lets QA reproduce upstream mistakes; nullable\n#             dtypes prevent silent int->float coercion.\n#             separators, currency placement); audit columns double\n#             the column count for cleaned fields; nullable dtypes\n#             can break older downstream code.\n#\nimport pandas as pd\n# 1. Pre-clean common formatting before parsing\ndef to_money(s: pd.Series) -> pd.Series:\n    cleaned = (s.astype(\"string\")\n                 .str.replace(r\"[^\\d.\\-]\", \"\", regex=True)   # drop $ , %\n                 .str.strip())\n    return pd.to_numeric(cleaned, errors=\"coerce\")\ndf[\"price\"] = to_money(df[\"price\"])\n# 2. Audit column — keep the original alongside the cleaned value\ndf[\"price_raw\"]    = df[\"price_raw\"].astype(\"string\")\ndf[\"price\"]        = pd.to_numeric(df[\"price_raw\"], errors=\"coerce\")\ndf[\"price_failed\"] = df[\"price\"].isna() & df[\"price_raw\"].notna()\naudit = df.loc[df[\"price_failed\"], [\"price_raw\"]].value_counts()\n# audit.to_csv(\"audit/price_failures.csv\")\n# 3. Nullable Int64 — preserves \"is missing\" without int->float promotion\ndf[\"count\"] = pd.to_numeric(df[\"count_raw\"], errors=\"coerce\").astype(\"Int64\")\n# 4. Locale-aware parsing — explicit parser when comma is the decimal mark\ndef to_eu_decimal(s: pd.Series) -> pd.Series:\n    return pd.to_numeric(\n        s.astype(\"string\").str.replace(\".\", \"\", regex=False)   # thousands\n                          .str.replace(\",\", \".\", regex=False), # decimal\n        errors=\"coerce\",\n    )\n# Decision rule:\n#   Clean string-numeric column                 -> pd.to_numeric(s)\n#   Some values are dirt (\"N/A\", \"\")              -> errors=\"coerce\" -> NaN\n#   Need to keep bad rows visible                  -> errors=\"ignore\" (returns object on failure)\n#   Memory-tight                                  -> downcast=\"integer\" / \"float\" / \"unsigned\"\n#   Booleans coming as \"True\"/\"False\" strings     -> .map({\"True\":1,\"False\":0}) first\n#   Currency / locale strings (\"$1,234.56\")        -> .str.replace(...) before to_numeric\n#   Only some rows numeric                          -> coerce + later .dropna() / fillna\n#   Repeated calls in a loop                        -> vectorize once on the whole column\n#\n# Anti-pattern: pd.to_numeric(s) without errors= on dirty data\n#   Default errors=\"raise\" blows up on the first bad row, mid-pipeline. Either\n#   pre-clean the strings, or use errors=\"coerce\" to convert bad rows to NaN\n#   and report them downstream — visible bad data beats a silent crash."
                  }
        ],
        tips: [
                  "`errors=\"coerce\"` is the default choice for messy CSVs — bad values become NaN instead of crashing",
                  "After coercing, check what failed: rows where the new column is NaN but the original was not",
                  "`downcast=\"integer\"` saves significant memory on integer columns with small ranges",
                  "Use `pd.to_numeric` over `astype(float)` when data quality is unknown"
        ],
        mistake: "Using `astype(float)` on a column with string values like \"$12.50\". It raises ValueError. Use `pd.to_numeric(errors=\"coerce\")` and then clean the NaN values afterward.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "to-datetime",
        fn: "pd.to_datetime()",
        desc: "Parse a Series of strings or numbers into datetime64.",
        category: "Cleaning",
        subtitle: "Always convert date strings — then use .dt accessor for extraction",
        signature: "pd.to_datetime(series, format=\"%Y-%m-%d\", errors=\"coerce\")",
        descLong: "pd.to_datetime() converts strings, integers, or objects to datetime64. Always specify format= on large datasets — auto-detection is slow. Use errors=\"coerce\" to turn unparseable values to NaT. Once converted, the .dt accessor unlocks all datetime operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.to_datetime() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             for ISO-formatted strings.\n#             dtype; .dt accessor immediately becomes available.\n#             ambiguous formats like \"01/02/2024\" silently get the\n#             wrong interpretation. Junior tier pins the format.\n#\nimport pandas as pd\ndf[\"date\"] = pd.to_datetime(df[\"date\"])\ndf[\"date\"].dt.year                           # the .dt accessor unlocks"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.to_datetime() — common patterns you'll see in production.\n# APPROACH  - Combine pd.to_datetime() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             and unambiguity, errors=\"coerce\" for messy data, and\n#             unit= for Unix timestamps. Pull components with .dt.\n#             be 10-100x faster on large frames; unit= handles the\n#             \"I have epoch timestamps\" case explicitly.\n#             dayfirst issue between US and EU formats — senior tier.\n#\nimport pandas as pd\n# Pin format — much faster, no ambiguity\ndf[\"date\"] = pd.to_datetime(df[\"date\"], format=\"%Y-%m-%d\")\ndf[\"date\"] = pd.to_datetime(df[\"date\"], format=\"%d/%m/%Y\")\ndf[\"date\"] = pd.to_datetime(df[\"date\"], format=\"ISO8601\")    # 3.7+\n# Coerce bad values to NaT instead of crashing\ndf[\"date\"] = pd.to_datetime(df[\"date\"], errors=\"coerce\")\n# Unix timestamps\ndf[\"ts_sec\"] = pd.to_datetime(df[\"ts_sec\"], unit=\"s\")\ndf[\"ts_ms\"]  = pd.to_datetime(df[\"ts_ms\"],  unit=\"ms\")\n# Component extraction via .dt\ndf[\"date\"].dt.year\ndf[\"date\"].dt.month\ndf[\"date\"].dt.day_of_week                    # 0 = Monday\ndf[\"date\"].dt.day_name()                     # 'Monday', 'Tuesday'...\ndf[\"date\"].dt.quarter\n(pd.Timestamp.today() - df[\"date\"]).dt.days  # age in days"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.to_datetime() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             from the start, dayfirst when the source is European,\n#             post-parse audit of NaT counts, and the \"always set\n#             the index for resample/rolling\" rule.\n#             midnight; explicit dayfirst stops US/EU silent\n#             misparse; index-as-datetime unlocks resample/asfreq.\n#             arithmetic — pick one and stick with it; resample on\n#             non-monotonic indexes silently produces nonsense.\n#\nimport pandas as pd\n# 1. Timezone-aware parsing from the start\ndf[\"created_at\"] = pd.to_datetime(df[\"created_at\"], utc=True)         # to UTC\ndf[\"created_at_local\"] = (df[\"created_at\"]\n                            .dt.tz_convert(\"America/New_York\"))\n# 2. European format — dayfirst is unambiguous and explicit\ndf[\"due\"] = pd.to_datetime(df[\"due\"], dayfirst=True, errors=\"coerce\")\n# 3. Audit parse failures — known-good dates count\nnat_count = df[\"due\"].isna().sum()\nnat_pct   = nat_count / len(df) * 100\nassert nat_pct < 1.0, f\"{nat_pct:.1f}% of dates failed to parse\"\n# 4. Datetime index unlocks the time-series API\nts = (df.set_index(\"created_at\")\n        .sort_index())                           # MUST be sorted\nts[\"amount\"].resample(\"D\").sum()                 # daily totals\nts[\"amount\"].resample(\"M\").mean()                # monthly mean\nts[\"amount\"].rolling(\"7D\").mean()                # rolling 7-day window\n# 5. Anti-pattern in production:\n#    Storing dates as object/strings and comparing with > / <.\n#    Works accidentally for ISO format, breaks for everything else.\n# Decision rule:\n#   Mixed date strings                          -> pd.to_datetime(s)\n#   Known format (5-100x faster)                  -> format=\"%Y-%m-%d %H:%M:%S\"\n#   Errors as NaT                                  -> errors=\"coerce\"\n#   Always store UTC                                -> utc=True (then localize to display TZ)\n#   Excel serial dates                              -> pd.to_datetime(s, unit=\"D\", origin=\"1899-12-30\")\n#   Unix timestamps (seconds / ms)                  -> unit=\"s\" or unit=\"ms\"\n#   Mixed timezones                                  -> utc=True normalises; without, returns object\n#   Speed at scale                                   -> ISO 8601 + format=\"ISO8601\" (3.0+)\n#\n# Anti-pattern: parsing user-input dates without utc=True\n#   Mixed timezones in a single column become object dtype (not datetime64),\n#   and any operation that expects datetime64 (resample, .dt.year) silently\n#   fails or coerces. Always pd.to_datetime(s, utc=True) on heterogeneous\n#   sources; convert to a display TZ only at the presentation layer."
                  }
        ],
        tips: [
                  "Always specify `format=` on large datasets — auto-detection scans every value and is slow",
                  "`errors=\"coerce\"` converts unparseable values to `NaT` (Not a Time) instead of raising",
                  "After converting, use `df.set_index(\"date\").resample(\"M\").sum()` for time-based aggregation",
                  "Store and compare dates as datetime64 — string comparison is 100x slower and format-dependent"
        ],
        mistake: "Leaving date columns as `object` dtype and doing string comparisons like `df[\"date\"] > \"2024-01\"`. This works accidentally for ISO format but breaks for any other format.",
        shorthand: {
          verbose: "import pandas as pd\ndf['date'] = pd.to_datetime(df['date'])\ndf['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')\ndf['date'] = pd.to_datetime(df['date'], format='%d/%m/%Y')",
          concise: "(pd.Timestamp.today() - df['date']).dt.days  # age in days",
        },
      },
      {
        id: "str-accessor",
        fn: ".str accessor",
        desc: "Vectorized string operations on a Series.",
        category: "Cleaning",
        subtitle: "Apply string methods to every element without a loop",
        signature: "df[\"col\"].str.lower() | .str.contains() | .str.extract(r\"()\")",
        descLong: "The .str accessor applies string methods element-wise to a Series, returning NaN for null values instead of crashing. Far faster than apply(lambda x: fn(x)) for string operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .str accessor — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             with .str.contains. NaN-safe by default with na=False.\n#             muscle memory as any Python string method, but\n#             vectorized.\n#             real reasons to reach for .str — that's the junior tier.\n#\nimport pandas as pd\ns = df[\"name\"]\ns.str.lower()\ndf[df[\"email\"].str.contains(\"@example.com\", na=False)]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .str accessor — common patterns you'll see in production.\n# APPROACH  - Combine .str accessor with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             split-into-columns, regex extract, replace. The\n#             vectorized form replaces apply(lambda) for strings.\n#             a column into two, extract a regex group into a new\n#             column, normalize and filter.\n#             extractall pattern for multiple matches per row.\n#\nimport pandas as pd\ns = df[\"name\"]\n# Case & whitespace\ns.str.lower()\ns.str.title()\ns.str.strip()\ns.str.replace(r\"\\s+\", \" \", regex=True)               # normalize spaces\n# Predicates — always na=False to keep NaN out of masks\ndf[df[\"email\"].str.contains(\"@company\\.com\", na=False)]\ns.str.startswith(\"A\")\ns.str.endswith(\".com\")\ns.str.len()\n# Split into multiple columns at once\ndf[[\"first\", \"last\"]] = df[\"name\"].str.split(\" \", n=1, expand=True)\n# Regex extract — first capturing group\ndf[\"area_code\"] = df[\"phone\"].str.extract(r\"\\((\\d{3})\\)\")\n# Replace — literal vs regex\ndf[\"amount_str\"] = df[\"amount_str\"].str.replace(\"$\", \"\", regex=False)\ndf[\"text\"]       = df[\"text\"].str.replace(r\"[^\\w\\s]\", \"\", regex=True)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .str accessor — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             for big speedups, use str.extractall for multi-match,\n#             keep regex compiled and explicit, and reach for a real\n#             parser (urllib.parse, email.utils) instead of regex\n#             when the format is well-defined.\n#             extractall handles \"one row, many matches\" cleanly;\n#             stdlib parsers are far more correct than ad-hoc regex.\n#             round-trippable through every storage format yet;\n#             extractall returns a MultiIndex which surprises\n#             readers; stdlib parsers don't vectorize.\n#\nimport pandas as pd\n# 1. pyarrow-backed strings — much faster .str ops on big frames\ndf[\"text\"] = df[\"text\"].astype(\"string[pyarrow]\")\n# 2. Multiple matches per row -> extractall (returns MultiIndex)\nmatches = df[\"body\"].str.extractall(r\"#(\\w+)\")        # all hashtags\nhashtags_per_row = matches.groupby(level=0)[0].agg(list)\ndf[\"hashtags\"] = hashtags_per_row.reindex(df.index).fillna(\"\").apply(list)\n# 3. Compile regex you reuse — clearer and slightly faster\nimport re\nEMAIL_RE = re.compile(r\"^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$\")\ndf[\"email_valid\"] = df[\"email\"].fillna(\"\").map(lambda s: bool(EMAIL_RE.match(s)))\n# 4. Use a real parser when one exists — regex is rarely the right\n#    tool for emails, URLs, addresses, phone numbers\nfrom urllib.parse import urlparse\ndf[\"host\"] = df[\"url\"].fillna(\"\").map(lambda u: urlparse(u).netloc or pd.NA)\n# 5. Anti-pattern: df[\"col\"].apply(lambda x: x.lower())\n#    Use df[\"col\"].str.lower() — vectorized, NaN-safe, much faster.\n# Decision rule:\n#   Fixed-position substring                    -> s.str[0:3]\n#   Containment search                            -> s.str.contains(\"pattern\", regex=True/False)\n#   Replace                                       -> s.str.replace(\"a\",\"b\", regex=False)\n#   Split into multiple columns                   -> s.str.split(\",\", expand=True)\n#   Extract groups                                -> s.str.extract(r\"(w+)@(w+)\")\n#   Strip whitespace                              -> s.str.strip()\n#   Case operations                               -> .str.lower() / .upper() / .title()\n#   At scale -> faster                            -> dtype=\"string[pyarrow]\" + same .str API\n#\n# Anti-pattern: regex=True (default) when matching a literal that contains regex metacharacters\n#   s.str.contains(\"file.txt\") matches \"fileXtxt\" because . means \"any char\".\n#   Always pass regex=False for literal matches, or escape with re.escape().\n#   The same applies to .replace and .extract — choose regex semantics deliberately."
                  }
        ],
        tips: [
                  "Always `na=False` in `.str.contains()` — without it NaN rows raise or return NaN in the mask",
                  "`.str.extract()` returns the first capturing group; `.str.extractall()` returns all matches",
                  "`.str.split(expand=True)` returns a DataFrame directly — assign multiple columns at once",
                  "`.str` is always slower than a dedicated parser — use `pd.to_datetime()` not `.str` for dates"
        ],
        mistake: "`apply(lambda x: x.lower())` for string ops. `df[\"col\"].str.lower()` is vectorized, handles NaN, and is 5-10x faster.",
        shorthand: {
          verbose: "import pandas as pd\ndf = pd.DataFrame({\n'name': ['Alice Cooper', 'Bob Dylan', 'Charlie Brown', None],\n'email': ['alice@example.com', 'bob@test.org', 'charlie@demo.net', 'invalid'],",
          concise: "df[df['email'].str.contains('@company.com', na=False)]",
        },
      },
      {
        id: "dt-accessor",
        fn: ".dt accessor",
        desc: "Extract datetime components and perform datetime arithmetic.",
        category: "Cleaning",
        subtitle: "Year, month, day, weekday, quarter — from a datetime64 Series",
        signature: "df[\"col\"].dt.year | .dt.month | .dt.day_name() | .dt.total_seconds()",
        descLong: "The .dt accessor exposes datetime properties and methods on a Series with dtype datetime64. Always convert string dates with pd.to_datetime() first. Supports component extraction, arithmetic, floor/ceil, and resample-friendly operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .dt accessor — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             then extract components: year, month, day_of_week.\n#             is the dual of .str — same pattern, different domain.\n#             period conversion — those are the everyday extras.\n#\nimport pandas as pd\ndf[\"date\"] = pd.to_datetime(df[\"date\"])      # required first\ndf[\"date\"].dt.year\ndf[\"date\"].dt.month\ndf[\"date\"].dt.day_of_week                    # 0 = Monday"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .dt accessor — common patterns you'll see in production.\n# APPROACH  - Combine .dt accessor with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             arithmetic with Timedelta, filters by year/range,\n#             floor/ceil and Period conversion for grouping.\n#             \"age in days\", \"next 30 days\", \"filter to 2024\",\n#             and \"group by month period\".\n#             day arithmetic, or DST gotchas — senior tier.\n#\nimport pandas as pd\ndf[\"date\"] = pd.to_datetime(df[\"date\"])\n# Component extraction\ndf[\"year\"]      = df[\"date\"].dt.year\ndf[\"month\"]     = df[\"date\"].dt.month\ndf[\"weekday\"]   = df[\"date\"].dt.day_name()\ndf[\"quarter\"]   = df[\"date\"].dt.quarter\ndf[\"month_end\"] = df[\"date\"].dt.is_month_end\n# Arithmetic\ndf[\"age_days\"] = (pd.Timestamp.today() - df[\"date\"]).dt.days\ndf[\"end\"]      = df[\"start\"] + pd.Timedelta(days=30)\ndf[\"hours\"]    = (df[\"end\"] - df[\"start\"]).dt.total_seconds() / 3600\n# Filters\ndf[df[\"date\"].dt.year == 2024]\ndf[df[\"date\"].between(\"2024-01-01\", \"2024-06-30\")]\n# Floor / ceil / period\ndf[\"hour_floor\"] = df[\"date\"].dt.floor(\"h\")     # 09:34:51 -> 09:00:00\ndf[\"month_period\"] = df[\"date\"].dt.to_period(\"M\")    # 2024-01 (a Period, not a date)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .dt accessor — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             business-day offsets via DateOffset, DST-safe rounding,\n#             and the \"set the index, then resample/rolling\" idiom.\n#             midnight; DateOffset respects calendars (months and\n#             quarters aren't fixed-width); resample on a sorted\n#             DatetimeIndex unlocks the time-series API.\n#             DST transitions create ambiguous/non-existent times\n#             that need ambiguous=/nonexistent= flags; rolling on\n#             a non-monotonic index produces nonsense silently.\n#\nimport pandas as pd\n# 1. Timezone-aware end-to-end\ndf[\"created_at\"] = pd.to_datetime(df[\"created_at\"], utc=True)\ndf[\"created_at_ny\"] = df[\"created_at\"].dt.tz_convert(\"America/New_York\")\n# 2. Business-day arithmetic — calendar-aware\ndf[\"due_business\"] = df[\"start\"] + pd.tseries.offsets.BusinessDay(5)\ndf[\"due_month\"]    = df[\"start\"] + pd.DateOffset(months=1)   # respects month length\n# 3. DST-safe rounding — explicit ambiguous/nonexistent handling\nhourly = df[\"created_at_ny\"].dt.floor(\n    \"h\",\n    ambiguous=\"NaT\",         # ambiguous DST fall-back times -> NaT\n    nonexistent=\"shift_forward\",  # spring-forward gap -> next valid time\n)\n# 4. The time-series unlock — set index, then resample / rolling\nts = (df.set_index(\"created_at_ny\")\n        .sort_index())                       # MUST be sorted\nts[\"amount\"].resample(\"D\").sum()             # daily totals\nts[\"amount\"].rolling(\"7D\").mean()            # rolling 7-day window\nts[\"amount\"].asfreq(\"h\").ffill()             # snap to hourly grid\n# 5. Anti-pattern in production:\n#    df[\"date\"] = df[\"date\"].dt.tz_localize(\"US/Eastern\")\n#    after the column is already tz-aware -> raises. Use tz_convert,\n#    or strip tz first with .dt.tz_localize(None).\n# Decision rule:\n#   Year/month/day extraction                   -> s.dt.year / .month / .day\n#   Day-of-week                                  -> .dt.dayofweek (0=Mon) or .day_name()\n#   Hour/minute/second                            -> .dt.hour / .minute / .second\n#   Floor / ceil to bucket                        -> .dt.floor(\"h\") / .ceil(\"D\")\n#   Convert TZ                                   -> .dt.tz_convert(\"America/New_York\")\n#   Localize naive UTC                            -> .dt.tz_localize(\"UTC\")\n#   Timedelta math                                -> col_a - col_b returns Timedelta\n#   ISO calendar                                   -> .dt.isocalendar() returns (year, week, day)\n#\n# Anti-pattern: applying string methods to a datetime column\n#   s.str.startswith(\"2024\") fails because the dtype is datetime64, not string.\n#   Use .dt accessor instead: s.dt.year == 2024. If you genuinely need string\n#   formatting, do it via s.dt.strftime(\"%Y-%m\") then string ops on the result."
                  }
        ],
        tips: [
                  "`.dt.day_of_week` returns 0=Monday — use `.dt.day_name()` for readable labels",
                  "`pd.Timedelta` is a fixed duration; `pd.DateOffset` respects calendar (useful for months/quarters)",
                  "String comparison `df[\"date\"] >= \"2024-01-01\"` works once the column is datetime64",
                  "`resample()` requires the datetime column to be the index — `df.set_index(\"date\").resample(\"M\")`"
        ],
        mistake: "Doing date comparisons on an `object` column. It works for ISO format strings but is 100x slower and silently fails for any other format. Always convert with `pd.to_datetime()` first.",
        shorthand: {
          verbose: "import pandas as pd\ndf['date'] = pd.to_datetime(df['date'])\ndf['date'].dt.year\ndf['date'].dt.month",
          concise: "df['date'].dt.to_period('M') # 2024-01 period",
        },
      },
    ],
  },

  // ── Section 5: Transforming Data ─────────────────────────────────────────
  {
    id: "transform",
    title: "Transforming Data",
    entries: [
      {
        id: "sort-values",
        fn: ".sort_values()",
        desc: "Sort a DataFrame by one or more column values.",
        category: "Transform",
        subtitle: "Sort rows by column — ascending, descending, or multi-key",
        signature: "df.sort_values(\"col\", ascending=True, na_position=\"last\")",
        descLong: "sort_values() sorts rows by the values in one or more columns. Returns a new DataFrame — does not modify in place unless inplace=True. Multi-column sort uses a list of column names and a matching list of ascending flags.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .sort_values() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             reassign — sort_values returns a new frame.\n#             the \"use nlargest for top-N\" performance tip.\n#\nimport pandas as pd\ndf = df.sort_values(\"age\")                       # ascending\ndf = df.sort_values(\"age\", ascending=False)      # descending"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .sort_values() — common patterns you'll see in production.\n# APPROACH  - Combine .sort_values() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             ascending list, NaN positioning, and reset_index after\n#             sort to get a clean 0-based index. Note that\n#             \"top-N by column\" deserves nlargest, not sort + head.\n#             a primary and a secondary key, NaN handled deliberately,\n#             clean index for downstream code that uses .iloc.\n#             the \"stable sort matters when ties are common\" rule —\n#             senior tier.\n#\nimport pandas as pd\n# Multi-column with per-key direction\ndf = df.sort_values(\n    [\"dept\", \"salary\"],\n    ascending=[True, False],                     # dept ASC, salary DESC\n)\n# NaN positioning\ndf = df.sort_values(\"score\", na_position=\"first\")   # NaN at top\ndf = df.sort_values(\"score\", na_position=\"last\")    # default\n# Clean integer index after the sort\ndf = df.sort_values(\"age\").reset_index(drop=True)\n# For \"top N by column\", prefer nlargest over sort + head\ntop10 = df.nlargest(10, \"salary\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .sort_values() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             breaks ties predictably, key= for case-insensitive or\n#             custom-key sorting, and an \"is the index actually\n#             sorted?\" check before any range slicing or merge_asof.\n#             ranking code needs; key= avoids the \"lower() in a\n#             helper column\" pattern; verifying monotonicity catches\n#             a class of subtle correctness bugs early.\n#             the same as creating a transient column; stable sort\n#             is slightly slower than the default for huge frames;\n#             monotonic checks add a pass over the index.\n#\nimport pandas as pd\n# 1. Stable sort — equal keys keep their previous order\n#    Useful when \"primary key, then preserve insertion order\"\ndf = df.sort_values(\"dept\", kind=\"stable\")\n# 2. Custom comparison via key= — case-insensitive, locale-aware\ndf = df.sort_values(\"name\", key=lambda s: s.str.lower())\n# 3. Verify monotonicity before relying on it\ndf = df.sort_values(\"date\").reset_index(drop=True)\nassert df[\"date\"].is_monotonic_increasing, \"date column is not sorted\"\n# 4. Multi-stage: sort by group, rank within group, then re-sort\ndf[\"rank\"] = (df.groupby(\"dept\")[\"salary\"]\n                .rank(method=\"dense\", ascending=False))\ntop_per_dept = (df[df[\"rank\"] <= 3]\n                  .sort_values([\"dept\", \"rank\"])\n                  .reset_index(drop=True))\n# 5. Anti-pattern: sort_values then iterate by .iloc without\n#    reset_index — .iloc is positional but the original index now\n#    lives at arbitrary positions, leading to confusing bugs.\n# Decision rule:\n#   Single column ascending                     -> df.sort_values(\"x\")\n#   Single column descending                     -> ascending=False\n#   Multi-column with mixed direction             -> by=[\"a\",\"b\"], ascending=[True,False]\n#   Stable sort (ties preserve order)             -> kind=\"mergesort\" (stable)\n#   In-place                                      -> inplace=True (rare; chains break)\n#   Top N efficiently                              -> .nlargest(N, \"x\") (avoids full sort)\n#   Sort by index instead                         -> df.sort_index()\n#   Need a custom key function                     -> key=lambda s: s.str.lower()\n#\n# Anti-pattern: df.sort_values(...).iloc[0] when you want the min\n#   You just paid O(n log n) to take one row. df.loc[df.x.idxmin()] is O(n).\n#   Same for \"top 10\": prefer .nlargest(10, col) over sort+head — both are\n#   correct, but nlargest uses a heap (O(n log k) vs O(n log n)) and is faster\n#   for k << n."
                  }
        ],
        tips: [
                  "`sort_values()` returns a new DataFrame — the original is unchanged unless `inplace=True`",
                  "After sorting, call `reset_index(drop=True)` if you want a clean 0-based index",
                  "`df.nlargest(n, \"col\")` is faster than sort + head for getting the top N rows",
                  "Multiple column sort: `ascending=[True, False]` — list must match length of `by=` list"
        ],
        mistake: "Sorting and then iterating by integer position without resetting the index. After sorting, `df.iloc[0]` is still the row with the original index 0, not the smallest sorted value.",
        shorthand: {
          verbose: "import pandas as pd\ndf.sort_values('age')                        # ascending (default)\ndf.sort_values('age', ascending=False)       # descending\ndf.sort_values('name', key=str.lower)        # case-insensitive",
          concise: "df.sort_values('age', inplace=True)",
        },
      },
      {
        id: "sort-index",
        fn: ".sort_index()",
        desc: "Sort a DataFrame by its row or column index.",
        category: "Transform",
        subtitle: "Sort by index labels — essential after concat or groupby",
        signature: "df.sort_index(axis=0, ascending=True)",
        descLong: "sort_index() sorts by the row index (axis=0) or column index (axis=1). Commonly needed after pd.concat() which may produce an unsorted index, or after groupby operations that return groups in arbitrary order.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .sort_index() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             meaning (date, label) and the rows are out of order.\n#             string, or datetime.\n#             — junior tier surfaces when each is right.\n#\nimport pandas as pd\ndf = df.sort_index()                       # ascending by index\ndf = df.sort_index(ascending=False)        # descending"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .sort_index() — common patterns you'll see in production.\n# APPROACH  - Combine .sort_index() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             post-concat fix, MultiIndex level sort, and the\n#             monotonicity check that confirms whether range slicing\n#             is safe.\n#             tool: cleaning up after concat or set_index, ordering\n#             columns predictably, ensuring slice safety.\n#             angle or the binary-search performance benefit —\n#             senior tier.\n#\nimport pandas as pd\n# Alphabetical column order — useful for diff-friendly output\ndf = df.sort_index(axis=1)\n# After concat, indexes are interleaved — sort to restore order\ncombined = pd.concat([df1, df2]).sort_index()\n# After set_index — required for any range slicing\nts = df.set_index(\"date\").sort_index()\n# MultiIndex — sort by a specific level\nts.sort_index(level=\"year\")\nts.sort_index(level=[\"year\", \"month\"])\n# Verify before relying on order\nts.index.is_monotonic_increasing             # True/False"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .sort_index() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             DatetimeIndex makes .loc[range] use binary search\n#             (O(log n) instead of O(n)), and resample/asfreq\n#             require monotonic time. Combine with reindex when\n#             you need a regular grid.\n#             prevents the silent-wrong-output trap when resample\n#             is called on an unsorted index; reindex fills missing\n#             timestamps explicitly rather than guessing.\n#             at load time; reindex requires picking a freq that\n#             matches the data; mixed monotonic / non-monotonic\n#             segments can hide if you only check the head/tail.\n#\nimport pandas as pd\n# 1. Sort once at load time — every subsequent .loc range slice is fast\nts = (pd.read_parquet(\"events.parquet\")\n        .set_index(\"ts\")\n        .sort_index())                            # one-time O(n log n)\nts.loc[\"2024-03-01\":\"2024-03-08\"]                 # binary search now\n# 2. resample / rolling / asfreq REQUIRE a monotonic index\nassert ts.index.is_monotonic_increasing\nts[\"amount\"].resample(\"D\").sum()\n# 3. Fill in a regular grid — reindex against a generated date range\nfull_idx = pd.date_range(ts.index.min(), ts.index.max(), freq=\"h\")\nhourly = ts.reindex(full_idx)                     # NaN for missing hours\nhourly[\"amount\"] = hourly[\"amount\"].fillna(0)\n# 4. After concat, choose between sort_index and ignore_index based on\n#    whether the index has meaning\ncombined = pd.concat([a, b], ignore_index=True)   # discard old index\nordered  = pd.concat([a, b]).sort_index()         # keep + sort\n# 5. Anti-pattern: relying on insertion order without sort_index().\n#    pd.concat preserves each frame's index — the result is rarely\n#    monotonic, and downstream slice/resample silently misbehaves.\n# Decision rule:\n#   Sort by index (default)                     -> df.sort_index()\n#   Multi-index, sort by level                    -> level=0 / level=\"date\"\n#   Sort columns alphabetically                  -> axis=1\n#   Required before MultiIndex slicing            -> df.sort_index() unblocks slice perf\n#   Descending                                    -> ascending=False\n#   After concat                                   -> sort_index() to restore order\n#   Time-series resample/rolling                   -> requires monotonic index; sort first\n#   Want to sort by a value, not the index        -> use .sort_values, NOT .sort_index\n#\n# Anti-pattern: rolling/resample on a non-monotonic datetime index\n#   pandas raises or returns garbage when the index isn't monotonic_increasing.\n#   After any concat / append / merge that disturbs index order, sort_index()\n#   before time-aware operations. Check with df.index.is_monotonic_increasing."
                  }
        ],
        tips: [
                  "Always sort the index after `pd.concat()` — it preserves original indexes which may be out of order",
                  "`sort_index(axis=1)` alphabetically sorts column names — useful for consistent column ordering",
                  "A sorted index enables binary search for faster `.loc[]` lookups on large DataFrames",
                  "`reset_index(drop=True)` creates a clean 0-based integer index — use when the old index has no meaning"
        ],
        mistake: "Calling `sort_values(\"col\")` when you actually want `sort_index()`. After setting a date column as the index, use `sort_index()` — not `sort_values(\"date\")`.",
        shorthand: {
          verbose: "import pandas as pd\ndf.sort_index()                      # ascending (default)\ndf.sort_index(ascending=False)       # descending\ndf.sort_index(axis=1)",
          concise: "df.index.is_monotonic_decreasing",
        },
      },
      {
        id: "rename",
        fn: ".rename()",
        desc: "Rename columns or index labels.",
        category: "Transform",
        subtitle: "Rename specific columns with a dict — no need to reassign all columns",
        signature: "df.rename(columns={\"old\": \"new\"}) | df.rename(index={0: \"a\"})",
        descLong: "rename() renames specific columns or index labels using a mapping dict. Only the keys you specify are renamed — everything else stays the same. Also accepts a function to transform all names at once.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .rename() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             result.\n#             rename. Other columns are untouched.\n#             normalization — those are the everyday extras.\n#\nimport pandas as pd\ndf = df.rename(columns={\"old_name\": \"new_name\"})\ndf = df.rename(columns={\"emp_id\": \"employee_id\", \"dept\": \"department\"})"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .rename() — common patterns you'll see in production.\n# APPROACH  - Combine .rename() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             normalization, lambda for clean-all-columns, the index\n#             vs index-name distinction (rename_axis), and the\n#             \"post-aggregation cleanup\" idiom.\n#             for surgical changes, function for sweeping changes,\n#             and the cleanup pass after groupby/agg.\n#             (silent misalignment when column count changes) —\n#             senior tier highlights the safe alternative.\n#\nimport pandas as pd\n# Function-form — applies to ALL labels\ndf = df.rename(columns=str.lower)\ndf = df.rename(columns=lambda c: c.strip().replace(\" \", \"_\").lower())\n# Rename the AXIS (the label of the index itself, not values)\ndf.index.name = \"employee_id\"\ndf = df.rename_axis(\"employee_id\")\n# Rename specific row index labels\ndf = df.rename(index={0: \"first\", 1: \"second\"})\n# Post-aggregation: clean up the column you just produced\nsummary = df.groupby(\"dept\").agg(avg=(\"sal\", \"mean\"), n=(\"id\", \"count\"))\nsummary = summary.rename(columns={\"avg\": \"avg_salary\"})"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .rename() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             helper that's idempotent and safe to call after every\n#             load, errors=\"raise\" to catch typos in dict-form\n#             renames, and a contract test that fails the build if\n#             expected columns aren't present.\n#             sources; typo-protected renames catch drift early;\n#             contract tests turn schema surprises into actionable\n#             CI failures.\n#             ASCII fold) and may need tweaking per dataset;\n#             contract checks add a small ops cost and need\n#             maintenance as the schema evolves.\n#\nimport pandas as pd\nimport re\ndef normalize_columns(df: pd.DataFrame) -> pd.DataFrame:\n    \"\"\"Idempotent: snake_case, lowercase, ASCII-only column names.\"\"\"\n    def norm(c: str) -> str:\n        c = c.strip().lower()\n        c = re.sub(r\"[^a-z0-9]+\", \"_\", c)\n        return c.strip(\"_\")\n    return df.rename(columns=norm)\ndf = normalize_columns(df)\ndf = normalize_columns(df)        # safe to call again — same output\n# 1. Dict rename with errors=\"raise\" catches typos\ndf = df.rename(columns={\"emp_id\": \"employee_id\"}, errors=\"raise\")\n# Raises KeyError if \"emp_id\" doesn't exist — protects against silent drift\n# 2. Schema contract — fail loudly if expected columns are missing\nEXPECTED = {\"employee_id\", \"department\", \"salary\", \"hire_date\"}\nmissing = EXPECTED - set(df.columns)\nassert not missing, f\"missing required columns: {missing}\"\n# 3. Anti-pattern: bulk-replace via df.columns = [...]\n#    Wrong:\n#       df.columns = [\"a\", \"b\", \"c\", \"d\"]\n#    Silently misaligns if upstream adds/removes a column. Use\n#    rename(columns={...}) with explicit mapping instead.\n# Decision rule:\n#   Specific renames                            -> df.rename(columns={\"old\":\"new\"})\n#   Programmatic transform                       -> columns=str.lower (callable applies to all)\n#   Both axes                                    -> rename(index={...}, columns={...})\n#   Single-column setattr-style                   -> df.columns = [...] (whole list, in order)\n#   Pipeline-friendly                             -> rename returns a copy; chains nicely\n#   Lowercase / strip whitespace                   -> .rename(columns=lambda c: c.strip().lower())\n#   Reorder columns                                -> df[[\"a\",\"b\",\"c\"]] (NOT rename)\n#   Multi-index columns                            -> df.rename(columns=...) operates on level 0\n#\n# Anti-pattern: assigning df.columns = [...] when you only want to rename one column\n#   Easy to mis-count the list and silently shift labels (col 5 becomes col 4's data).\n#   Always df.rename(columns={\"a\":\"new_a\"}) for targeted renames; reserve\n#   df.columns = [...] for full-list reassignments where order is intentional."
                  }
        ],
        tips: [
                  "dict-based rename only touches the keys you specify — safest way to rename specific columns",
                  "`rename(columns=str.lower)` normalizes all column names in one call",
                  "`lambda c: c.strip().replace(\" \", \"_\").lower()` is a common clean-all-columns pattern",
                  "`df.columns = [...]` replaces ALL column names — requires knowing every column name in order"
        ],
        mistake: "Using `df.columns = new_names` when you only want to rename a few columns. If the column count or order ever changes, this silently assigns wrong names. Use `rename(columns={...})` for targeted renames.",
        shorthand: {
          verbose: "import pandas as pd\ndf.rename(columns={'old_name': 'new_name'})\ndf.rename(columns={\n'emp_id':   'employee_id',",
          concise: "result.rename(columns={'avg': 'avg_salary'})",
        },
      },
      {
        id: "drop",
        fn: ".drop()",
        desc: "Remove rows or columns by label.",
        category: "Transform",
        subtitle: "Drop columns with axis=1, rows with axis=0",
        signature: "df.drop(columns=[\"col1\",\"col2\"]) | df.drop(index=[0,1,2])",
        descLong: "drop() removes rows (axis=0) or columns (axis=1) by label. Using the columns= or index= keyword arguments is clearer than positional axis=. Returns a new DataFrame by default.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .drop() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Reassign the result.\n#             unmistakable; safer than the older axis= positional\n#             style.\n#             (which is usually a better fit), or errors=\"ignore\"\n#             for pipeline robustness.\n#\nimport pandas as pd\ndf = df.drop(columns=[\"col1\", \"col2\"])\ndf = df.drop(columns=\"single_col\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .drop() — common patterns you'll see in production.\n# APPROACH  - Combine .drop() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             boolean filtering for \"drop rows where condition\",\n#             use errors=\"ignore\" in pipelines so missing columns\n#             don't crash, and clean up duplicate columns by name.\n#             the \"filter, don't drop\" rule for conditional row\n#             removal makes pipelines more readable.\n#             alternatives — senior tier covers those plus a\n#             \"drop is not your tool\" decision rule.\n#\nimport pandas as pd\n# Drop columns / rows by label\ndf = df.drop(columns=[\"col1\", \"col2\"])\ndf = df.drop(index=[0, 1, 2])\ndf = df.drop(index=\"row_label\")\n# Conditional row removal: filter is usually cleaner than drop\ndf = df[df[\"score\"] >= 0]                     # better than .drop(... .index)\n# Pipeline-safe — don't crash if a column isn't there\ndf = df.drop(columns=[\"maybe_missing\"], errors=\"ignore\")\n# Drop duplicate columns by name (rare, but a real cleanup)\ndf = df.loc[:, ~df.columns.duplicated()]\n# Drop columns based on null content (delegate to dropna)\ndf = df.dropna(axis=1, how=\"all\")             # all-null columns"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .drop() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             when selecting by pattern, the .pop() trick when you\n#             need both the dropped column AND the residual frame,\n#             and use a \"keep list\" instead of a \"drop list\" for\n#             schema clarity.\n#             elegantly; pop() avoids a separate access; explicit\n#             keep-list documents the contract better than \"drop\n#             everything I don't want\".\n#             keep-lists need maintenance when the schema evolves;\n#             filter() is regex-based and doesn't support negation\n#             directly.\n#\nimport pandas as pd\n# 1. Drop a class of columns with a regex pattern\ndf = df.drop(columns=df.filter(regex=r\"^Unnamed\").columns)\ndf = df.drop(columns=df.filter(regex=r\"_temp$\").columns)\n# 2. .pop — extract a column AND drop it in one call\ny = df.pop(\"target\")              # df no longer has 'target'; y is the Series\n# 3. \"Keep list\" beats \"drop list\" for evolving schemas\nKEEP = [\"id\", \"name\", \"amount\", \"date\", \"region\"]\ndf = df[KEEP]                     # explicit, documents intent\n# 4. Drop is the wrong tool when:\n#    - filtering rows by condition  -> use boolean indexing\n#    - selecting columns by pattern -> use .filter()\n#    - removing nulls               -> use .dropna()\n#    - removing duplicates          -> use .drop_duplicates()\n# 5. Anti-pattern: in-place drop in pipelines\n#    Wrong:\n#       df.drop(columns=[\"x\"], inplace=True)   # breaks method chains\n#    Right:\n#       df = df.drop(columns=[\"x\"])\n# Decision rule:\n#   Drop a column                                -> df.drop(columns=[\"x\"])\n#   Drop multiple columns                         -> df.drop(columns=[\"x\",\"y\"])\n#   Drop rows by index label                      -> df.drop(index=[5, 7])\n#   Drop by boolean filter                         -> df[~mask] (idiomatic; not .drop)\n#   Drop NA rows                                   -> df.dropna() (specialised)\n#   Drop duplicates                                -> df.drop_duplicates()\n#   In a chain                                    -> .drop returns a copy by default\n#   Errors on missing label                       -> errors=\"ignore\" to tolerate\n#\n# Anti-pattern: df.drop(\"x\", axis=1) when columns= is clearer\n#   axis=1 / axis=0 is error-prone (which is which?). Use the explicit\n#   keyword form: df.drop(columns=...) or df.drop(index=...). Same behavior,\n#   self-documenting code."
                  }
        ],
        tips: [
                  "`drop(columns=[...])` is cleaner than `drop([...], axis=1)` — the intent is explicit",
                  "`errors=\"ignore\"` prevents errors when dropping a column that may not exist — useful in pipelines",
                  "Dropping rows by condition is usually cleaner as a filter: `df[df[\"col\"] >= 0]`",
                  "To drop unnamed index columns (Unnamed: 0 from CSV): `df.drop(columns=df.filter(regex=\"^Unnamed\").columns)`"
        ],
        mistake: "Using `del df[\"col\"]` to drop a column. It works but modifies the DataFrame in place and cannot be chained. Use `df.drop(columns=[\"col\"])` in pipelines.",
        shorthand: {
          verbose: "df.drop(columns=['col1', 'col2'])\ndf.drop(columns='single_col')\ndf.drop(index=[0, 1, 2])\ndf.drop(index='row_label')",
          concise: "df.dropna(axis=1, how='any')",
        },
      },
      {
        id: "reset-set-index",
        fn: ".reset_index() / .set_index()",
        desc: "Move columns to/from the DataFrame index.",
        category: "Transform",
        subtitle: "set_index() promotes a column to index, reset_index() demotes it back",
        signature: "df.set_index(\"col\") | df.reset_index(drop=False)",
        descLong: "set_index() moves a column into the index — enabling label-based lookup and resample. reset_index() moves the index back to a column (or drops it). Together they are the standard way to manage the index around operations that modify it.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .reset_index() / .set_index() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             round-trip makes the relationship between set_index\n#             and reset_index obvious.\n#             undo each other.\n#             groupby cleanup) — those are the everyday reasons.\n#\nimport pandas as pd\ndf_indexed = df.set_index(\"employee_id\")          # column -> index\ndf_again   = df_indexed.reset_index()             # index -> column"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .reset_index() / .set_index() — common patterns you'll see in production.\n# APPROACH  - Combine .reset_index() / .set_index() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             reset_index after concat or groupby, drop=True when\n#             the old index has no meaning, MultiIndex via list,\n#             and the rename-on-reset shortcut.\n#             real code: enable time-series ops, clean up after\n#             aggregations, restore a usable column structure.\n#             decision (groupby(as_index=False) often skips the\n#             whole dance) — senior tier covers it.\n#\nimport pandas as pd\n# set_index unlocks the time-series API\nts = df.set_index(\"date\").sort_index()\nts[\"sales\"].resample(\"ME\").sum()                  # monthly sum\n# After concat — usually want a fresh integer index\ncombined = pd.concat([df1, df2]).reset_index(drop=True)\n# After groupby — bring the group keys back as columns\nsummary = (df.groupby(\"dept\")[\"salary\"]\n             .mean()\n             .reset_index())                       # dept goes from index to col\n# MultiIndex via list of columns\ndf_mi = df.set_index([\"year\", \"month\"])\n# Rename the reset column in one call (>=1.5)\ndf.reset_index(names=[\"original_idx\"])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .reset_index() / .set_index() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             groupby(as_index=False) returns a flat frame; explicit\n#             set_index / reset_index belong only where the index\n#             has semantic meaning (time, primary key). Use\n#             verify_integrity= to catch duplicate keys at promote\n#             time.\n#             a class of \"missing column\" surprises;\n#             verify_integrity=True turns silent duplicate-key bugs\n#             into immediate errors; index discipline pays off in\n#             every downstream join and slice.\n#             (named_agg works fine, .agg(dict) sometimes drops\n#             keys); verify_integrity scans the full column —\n#             noticeable on huge frames.\n#\nimport pandas as pd\n# 1. Skip set_index/reset_index when groupby will do it for you\nflat = (df.groupby([\"dept\", \"level\"], as_index=False)\n          .agg(avg_salary=(\"salary\", \"mean\"),\n               n         =(\"id\",     \"count\")))\n# 2. Promoting a candidate key — fail loudly on duplicates\ndf_keyed = df.set_index(\"employee_id\", verify_integrity=True)\n# Raises ValueError if employee_id has duplicates -> early bug catch\n# 3. Index hygiene checklist before any merge_asof / range slice\nts = (df.set_index(\"event_ts\")\n        .sort_index())\nassert ts.index.is_monotonic_increasing\nassert ts.index.is_unique                          # if uniqueness matters\n# 4. Anti-pattern: chained reset/set without an \"operate\" step\n#    Wrong:\n#       df.set_index(\"x\").reset_index()            # no-op, just churn\n#    Right: keep the dance only around an op that needs it (resample,\n#    rolling, label-based slice, asof merge).\n# Decision rule:\n#   Promote a column to the index               -> df.set_index(\"col\")\n#   Demote the index back to a column            -> df.reset_index()\n#   Throw the index away                          -> df.reset_index(drop=True)\n#   Multi-column index                             -> set_index([\"a\",\"b\"])\n#   After filter/sort, want fresh 0..n-1         -> reset_index(drop=True)\n#   Time series                                    -> set_index(\"ts\") so resample/rolling work\n#   GroupBy result with multi-key                  -> .reset_index() to flatten\n#   Re-merge after groupby                         -> reset_index() before .merge\n#\n# Anti-pattern: forgetting drop=True on reset_index after a filter\n#   df[mask].reset_index() preserves the OLD index as a new column, polluting\n#   the schema. Use reset_index(drop=True) any time you don't actually need\n#   the old labels back."
                  }
        ],
        tips: [
                  "Always `reset_index(drop=True)` after `concat()` or `sort_values()` for a clean 0-based index",
                  "`set_index(\"date\")` is required before `resample()` — resample needs a DatetimeIndex",
                  "`reset_index()` after `groupby().agg()` brings the group keys back as regular columns",
                  "`drop=True` discards the current index; `drop=False` (default) moves it to a column"
        ],
        mistake: "Forgetting `reset_index()` after groupby. The result has the group column as the index — subsequent merges or column references fail silently because the column appears to not exist.",
        shorthand: {
          verbose: "import pandas as pd\ndf.set_index('employee_id')\ndf.set_index('date')                 # enables resample()\ndf.set_index(['year', 'month'])      # MultiIndex",
          concise: "df.reset_index(names=['old_index_name'])",
        },
      },
      {
        id: "nlargest-nsmallest",
        fn: ".nlargest() / .nsmallest()",
        desc: "Return the N rows with the largest or smallest values in a column.",
        category: "Transform",
        subtitle: "Faster than sort + head for getting the top or bottom N rows",
        signature: "df.nlargest(n, \"col\") | df.nsmallest(n, \"col\")",
        descLong: "nlargest() and nsmallest() return the top or bottom N rows by a column value. They use a heap internally — O(n log k) instead of O(n log n) for a full sort. Significantly faster than sort_values().head() when k is small relative to n.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .nlargest() / .nsmallest() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             like English.\n#             sort + head and clearer at the call site.\n#             per-group top-N — those are the everyday extensions.\n#\nimport pandas as pd\ndf.nlargest(10, \"salary\")              # top 10 highest\ndf.nsmallest(5,  \"score\")              # bottom 5 lowest"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .nlargest() / .nsmallest() — common patterns you'll see in production.\n# APPROACH  - Combine .nlargest() / .nsmallest() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             column tiebreakers, the Series form, and per-group\n#             top-N via groupby + apply.\n#             dept\", \"top 10 with bonus as tiebreaker\", \"first vs\n#             all ties\".\n#             frames; senior tier shows the rank-based alternative.\n#\nimport pandas as pd\n# Tiebreakers via list of columns\ndf.nlargest(10, [\"salary\", \"bonus\"])\n# Tie behavior — first/last/all\ndf.nlargest(5, \"score\", keep=\"first\")     # default\ndf.nlargest(5, \"score\", keep=\"last\")\ndf.nlargest(5, \"score\", keep=\"all\")       # may return > 5 rows on ties\n# Series form\ndf[\"salary\"].nlargest(5)\ndf[\"salary\"].nsmallest(3)\n# Per-group top-N\ntop3 = (df.groupby(\"dept\", group_keys=False)\n          .apply(lambda g: g.nlargest(3, \"salary\"))\n          .reset_index(drop=True))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .nlargest() / .nsmallest() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             group top-N (vectorized, no apply), pick rank methods\n#             intentionally (dense vs min vs first), and reach for\n#             nlargest only when N is small AND there's no group key.\n#             on big frames; explicit method= chooses the tie\n#             semantics; the decision rule (heap vs rank) makes the\n#             code review obvious.\n#             ranking ties differently from nlargest's keep= can\n#             surprise readers; on tiny groups the speedup over\n#             apply is negligible.\n#\nimport pandas as pd\n# 1. Per-group top-N without apply — vectorized via rank()\ndf[\"rank\"] = (df.groupby(\"dept\")[\"salary\"]\n                .rank(method=\"dense\", ascending=False))\ntop_per_dept = (df[df[\"rank\"] <= 3]\n                  .sort_values([\"dept\", \"rank\"])\n                  .reset_index(drop=True))\ndf = df.drop(columns=\"rank\")              # cleanup\n# 2. Rank methods — choose the tie semantics deliberately\n#    method=\"first\"   - ties get unique ranks by row order        (1,2,3,4)\n#    method=\"min\"     - ties share the lowest rank, gaps after    (1,1,3,4)\n#    method=\"dense\"   - ties share the rank, no gaps              (1,1,2,3)\n#    method=\"average\" - ties share the mean rank                  (1,1.5,2,3)\n# 3. Heap (nlargest) vs full sort — when each is the right call\n#    nlargest(N, col)            -> O(n log N) — best for small N, no groups\n#    sort_values(col).head(N)    -> O(n log n) — when you need full ordering\n#    rank() + filter + sort      -> best for per-group top-N at scale\n# 4. Anti-pattern: a Python loop per group. groupby(...)+apply or\n#    rank-based filtering is always faster and keeps the result\n#    pandas-native (no list-of-frames glue).\n# Decision rule:\n#   Top N by a column                           -> df.nlargest(N, \"score\")\n#   Bottom N                                     -> df.nsmallest(N, \"score\")\n#   Tie behaviour: keep all                       -> keep=\"all\"\n#   Tie behaviour: pick last                      -> keep=\"last\"\n#   Multi-key tiebreak                             -> df.nlargest(N, [\"score\",\"ts\"])\n#   Want sort + head equivalent                    -> nlargest is faster (O(n log k))\n#   Need full ranking                              -> .rank() then filter\n#   Group-wise top N                               -> df.groupby(g).apply(lambda x: x.nlargest(N, c))\n#\n# Anti-pattern: df.sort_values(col, ascending=False).head(N) for tiny N on huge data\n#   sort_values is O(n log n) over the WHOLE frame; nlargest(N, col) is O(n log N)\n#   via a heap. For N=10 on a 10M-row frame, that's a 6x speedup. Same correctness,\n#   better algorithm."
                  }
        ],
        tips: [
                  "`nlargest(n, col)` is significantly faster than `sort_values(col).head(n)` for large DataFrames",
                  "`keep=\"all\"` returns all tied rows — result may have more than n rows",
                  "Works on both DataFrame and Series — `df[\"col\"].nlargest(5)` returns a Series",
                  "For per-group top-N, use `groupby().apply(lambda g: g.nlargest(n, col))`"
        ],
        mistake: "Using `sort_values(\"col\", ascending=False).head(n)` when you just need the top N rows. Use `nlargest(n, \"col\")` — same result, much faster on large DataFrames.",
        shorthand: {
          verbose: "import pandas as pd\ndf.nlargest(10, 'salary')\ndf.nsmallest(5, 'score')\ndf.nlargest(10, ['salary', 'bonus'])",
          concise: "df.groupby('dept').apply(lambda g: g.nlargest(3, 'salary'))",
        },
      },
      {
        id: "explode",
        fn: ".explode()",
        desc: "Transform each element of a list-like cell into a row.",
        category: "Transform",
        subtitle: "Unnest list columns — one row per list element",
        signature: "df.explode(\"col\") | df.explode([\"col1\", \"col2\"])",
        descLong: "explode() unpacks list-like values in a column — each element becomes its own row, with all other column values duplicated. Essential for working with data where a cell contains a list (tags, categories, items). The inverse is groupby + agg with list.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .explode() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             a row; other columns are duplicated.\n#             demonstration; makes the duplicate-other-columns\n#             behavior visible.\n#             column explode, or the inverse round-trip.\n#\nimport pandas as pd\ndf = pd.DataFrame({\n    \"name\": [\"Alice\", \"Bob\"],\n    \"tags\": [[\"python\", \"pandas\"], [\"sql\", \"spark\", \"python\"]],\n})\ndf.explode(\"tags\")\n#     name     tags\n# 0  Alice   python\n# 0  Alice   pandas\n# 1    Bob      sql\n# 1    Bob    spark\n# 1    Bob   python"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .explode() — common patterns you'll see in production.\n# APPROACH  - Combine .explode() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             before exploding, reset the index after, do parallel\n#             explode of multiple list columns, and round-trip back\n#             to lists via groupby + agg(list).\n#             frequency, parallel feature columns, list <-> long\n#             round-trips for export.\n#             NaN row by default; sometimes you want it dropped) —\n#             senior tier covers it.\n#\nimport pandas as pd\n# Split-then-explode\ndf[\"tags\"] = df[\"tags_str\"].str.split(\",\")\ndf = df.explode(\"tags\").reset_index(drop=True)\n# Multi-column explode (lists must be same length per row)\ndf = df.explode([\"col_a\", \"col_b\"]).reset_index(drop=True)\n# Tag frequency\ndf.explode(\"tags\")[\"tags\"].value_counts()\n# Inverse round-trip — back to lists\ncollapsed = (df.explode(\"tags\")\n               .groupby(\"name\")[\"tags\"]\n               .agg(list)\n               .reset_index())"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .explode() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             explicitly (default behavior surprises people),\n#             trim whitespace after string-split, and consider\n#             pyarrow list dtypes for very large exploded frames.\n#             changes; whitespace trim removes the most common\n#             \"duplicate\" tag bug; arrow lists preserve schema for\n#             round-trip without flattening to object.\n#             ceremonial; arrow list dtype requires pandas >= 2.0\n#             and isn't supported by every downstream library.\n#\nimport pandas as pd\nimport numpy as np\n# 1. Default behavior — NaN becomes one NaN row, [] becomes one NaN row\ns = pd.Series([[\"a\", \"b\"], [], np.nan])\ns.explode()\n# 0      a\n# 0      b\n# 1    NaN     <- empty list -> NaN\n# 2    NaN     <- NaN as input -> NaN\n# Drop the placeholder rows when you want only real elements:\nout = s.explode().dropna()\n# 2. Whitespace robustness around string-splitting\ndf[\"tags\"] = (df[\"tags_str\"].fillna(\"\")\n                            .str.split(\",\"))\ndf = df.explode(\"tags\")\ndf[\"tags\"] = df[\"tags\"].str.strip()                # trim per-row\ndf = df[df[\"tags\"].ne(\"\")]                         # drop empty after trim\ndf = df.reset_index(drop=True)\n# 3. Validate parallel-explode invariants before calling\ndef safe_multi_explode(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:\n    lens = pd.concat([df[c].map(len) for c in cols], axis=1)\n    bad = (lens.nunique(axis=1) > 1)\n    if bad.any():\n        raise ValueError(f\"row-length mismatch on {cols}: {bad.sum()} rows\")\n    return df.explode(cols).reset_index(drop=True)\n# 4. Anti-pattern: explode on a string column\n#    df.explode(\"name\")          # explodes character-by-character\n#    str.split first.\n# Decision rule:\n#   Column of lists -> rows                     -> df.explode(\"col\")\n#   Empty-list rows                              -> result has a NaN row (good signal)\n#   Explode multiple columns at once             -> df.explode([\"a\",\"b\"]) (must be same lengths)\n#   Comma-separated string column                 -> .str.split(\",\") FIRST, then explode\n#   Need original index back                      -> reset_index() after explode\n#   Want flatter alternative                       -> json_normalize on dict-of-list payloads\n#   Counts of items                                -> .str.split().str.len() (no explode)\n#   Multi-level nesting                            -> explode then explode again\n#\n# Anti-pattern: looping with iterrows() to flatten lists into rows\n#   df.iterrows() is glacial. df.explode(\"items\") does the same expansion in\n#   one C-level call — orders of magnitude faster, and preserves the rest of\n#   the row's columns automatically."
                  }
        ],
        tips: [
                  "`explode()` preserves the original index — call `reset_index(drop=True)` after for a clean index",
                  "Split a string column before exploding: `df[\"col\"].str.split(\",\")` then `.explode(\"col\")`",
                  "The inverse of explode is `groupby().agg(list)` — round-trips back to list column",
                  "Multi-column explode requires both list columns to have the same length in each row"
        ],
        mistake: "Calling `explode()` on a string column. It explodes character-by-character. Split the string into a list first with `str.split()`, then explode the resulting list column.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "assign",
        fn: ".assign()",
        desc: "Add or replace columns inline, returning a new DataFrame.",
        category: "Transform",
        subtitle: "Add computed columns without intermediate variables",
        signature: "df.assign(new_col=lambda df: ..., col2=value)",
        descLong: "assign() adds or replaces columns and returns a new DataFrame — enabling method chaining. Lambdas receive the current DataFrame, including columns added earlier in the same assign() call.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .assign() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             returning a new DataFrame.\n#             no broken pipelines.\n#             unlocks \"use the current frame's columns\") or\n#             multi-column declarations.\n#\nimport pandas as pd\ndf = df.assign(source=\"imported\", version=2)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .assign() — common patterns you'll see in production.\n# APPROACH  - Combine .assign() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             assignments in one call, mixing constants and\n#             expressions, and using pd.cut inline for binning.\n#             call adds 3-5 columns, the lambda sees the LATEST\n#             frame state including columns added earlier in the\n#             same assign().\n#             keyword\" edge case or chain-friendly debugging via\n#             pipe(print) — senior tier covers those.\n#\nimport pandas as pd\ndf = (df\n    .assign(\n        full_name = lambda d: d[\"first\"] + \" \" + d[\"last\"],\n        salary_k  = lambda d: d[\"salary\"] / 1000,\n        is_senior = lambda d: d[\"years\"] >= 5,\n        grade     = lambda d: pd.cut(\n            d[\"score\"], bins=[0, 60, 70, 80, 90, 100],\n            labels=[\"F\", \"D\", \"C\", \"B\", \"A\"]),\n    )\n)\n# Earlier columns are visible to later lambdas in the SAME assign():\ndf = df.assign(\n    tax = lambda d: d[\"salary\"] * 0.3,\n    net = lambda d: d[\"salary\"] - d[\"tax\"],   # uses tax just defined\n)\n# Conditional flag with map (or np.where)\ndf = df.assign(\n    flag = lambda d: d[\"score\"].gt(90).map({True: \"A\", False: \"B\"}),\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .assign() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             single chain, use **kwargs unpacking for dynamic\n#             column names, sprinkle pipe(print) for debugging\n#             without breaking the chain, and prefer assign +\n#             query + pipe over imperative df[\"x\"] = ... mutation.\n#             dynamic column names handle \"feature engineering by\n#             config\"; chain-friendly debugging keeps the code\n#             linear under review.\n#             lambda silently produces NaN (use pipe with assert);\n#             dict-unpack assign() is 3.7+ only; very long chains\n#             become hard to diff in code review.\n#\nimport pandas as pd\n# 1. Dynamic columns via **kwargs unpacking\nnew_cols = {\n    f\"{c}_log\": (lambda c=c: lambda d: (d[c] + 1).pipe(\"np\".__import__().log))()\n    for c in [\"amount\", \"score\"]\n}\n# (Real code would just compute these inline — kwargs-unpacking shines for\n#  config-driven feature builds, e.g. {**dynamic_features})\n# 2. Chain-friendly debugging\ndef trace(df, label=\"\"):\n    print(f\"{label}: shape={df.shape}, na={df.isna().sum().sum()}\")\n    return df\nclean = (df\n    .pipe(trace, \"raw\")\n    .query(\"amount > 0\")\n    .assign(amount_log=lambda d: (d[\"amount\"] + 1).pipe(lambda s: s.transform(\"log\")))\n    .pipe(trace, \"after log\")\n    .assign(grade=lambda d: pd.cut(d[\"score\"], bins=[0,60,80,100], labels=list(\"FBA\")))\n    .pipe(trace, \"final\"))\n# 3. Decision rule — assign vs df[\"x\"] = ...\n#    Mutating with df[\"x\"] = ... is fine in scratch notebooks.\n#    In pipelines / functions / tests:\n#       - assign() returns a new frame -> safer with shared state\n#       - chain stays linear -> easier to review and refactor\n#       - copy semantics are explicit -> no SettingWithCopyWarning\n# 4. Anti-pattern: f-string named args (not allowed)\n#    df.assign(f\"{name}_log\" = ...)   # syntax error\n#    Use unpacking:\n#    df.assign(**{f\"{name}_log\": fn})\n# Decision rule:\n#   Add one or more derived columns             -> df.assign(x=df.a + df.b)\n#   Reference a freshly-assigned col              -> use a callable: assign(x=..., y=lambda d: d.x*2)\n#   Method chain (no intermediate var)            -> .pipe / .assign / .query keep one expression\n#   Conditional assignment                         -> assign(flag=lambda d: np.where(d.x>0,1,0))\n#   Replace existing column                        -> assign(x=...) (last-write wins)\n#   Side-effect-free pipeline                      -> assign returns a COPY; original unchanged\n#   Can't use **kwargs (Python keyword)            -> use a dict-unpack: assign(**{\"my col\": ...})\n#   In-place if perf demands it                    -> df[\"x\"] = ... (mutates)\n#\n# Anti-pattern: assign() for in-place mutation\n#   df.assign(x=...) returns a new frame and DROPS THE RESULT if you don't bind.\n#   \"df.assign(x=...)\" alone is a no-op: assignments must be either df = df.assign(...)\n#   or chained. For mutation pick df[\"x\"] = ... explicitly."
                  }
        ],
        tips: [
                  "assign() is the chain-friendly alternative to `df[\"col\"] = value` — returns a new DataFrame",
                  "Each lambda receives the DataFrame including columns added earlier in the same `.assign()` call",
                  "Wrap long chains in `( )` for clean multi-line formatting without backslashes",
                  "Use `df.copy()` if you need to mutate inside assign — assign itself does not mutate"
        ],
        mistake: "Assigning with `df[\"col\"] = value` inside a method chain — it breaks the chain and returns None. Use `.assign(col=value)` to stay chainable.",
        shorthand: {
          verbose: "import pandas as pd\ndf = (df\n.assign(\nfull_name = lambda d: d['first'] + ' ' + d['last'],",
          concise: "df.assign(flag=lambda d: d['score'].gt(90).map({True: 'A', False: 'B'}))",
        },
      },
      {
        id: "pipe",
        fn: ".pipe()",
        desc: "Pass the DataFrame into any function, enabling full method chaining.",
        category: "Transform",
        subtitle: "Wrap custom transformation functions into a chain",
        signature: "df.pipe(fn, *args, **kwargs)",
        descLong: "pipe() calls fn(df, *args, **kwargs) and returns the result. It lets you include any custom transformation function inside a method chain, keeping code linear and readable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .pipe() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             returns a new df. Same as fn(df), but chainable.\n#             zero magic.\n#             custom transforms in the pipeline — the next tier\n#             demonstrates that.\n#\nimport pandas as pd\ndef add_total(df):\n    return df.assign(total=df[\"a\"] + df[\"b\"])\nresult = df.pipe(add_total)\n# Equivalent: result = add_total(df)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .pipe() — common patterns you'll see in production.\n# APPROACH  - Combine .pipe() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             pandas methods (.query, .sort_values) with custom\n#             functions via pipe. Use pipe(log_shape) for inline\n#             debugging without breaking the chain.\n#             pipeline does; the inline log helper is the trick\n#             that keeps long chains debuggable.\n#             handle branching, conditional steps, or per-input\n#             debugging cleanly. Senior tier covers those.\n#\nimport pandas as pd\ndef add_features(df, threshold=50):\n    return df.assign(above=df[\"value\"] > threshold)\ndef normalize(df, col):\n    mn, mx = df[col].min(), df[col].max()\n    return df.assign(**{col: (df[col] - mn) / (mx - mn)})\ndef log_shape(df, label=\"\"):\n    print(f\"{label}: {df.shape}\")\n    return df\nresult = (df\n    .query(\"active == True\")\n    .pipe(log_shape, label=\"after filter\")\n    .pipe(add_features, threshold=100)\n    .pipe(normalize, col=\"score\")\n    .sort_values(\"score\", ascending=False))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .pipe() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             block for reusable transform functions, the\n#             (callable, kwarg_name) form when df should be passed\n#             in a non-first position, and the \"pure functions\n#             only\" rule that keeps pipelines testable.\n#             pipelines; the kwarg-name form lets you reuse\n#             external functions that don't take df first; pure\n#             functions are trivial to unit-test in isolation.\n#             inside pipe functions); forces every step to return\n#             a DataFrame; debugging deep chains still requires\n#             trace helpers (junior tier).\n#\nimport pandas as pd\n# 1. Pure transform functions — easy to unit-test\ndef winsorize(df: pd.DataFrame, col: str, p: float = 0.01) -> pd.DataFrame:\n    lo, hi = df[col].quantile([p, 1 - p])\n    return df.assign(**{col: df[col].clip(lo, hi)})\ndef join_lookup(df: pd.DataFrame, lookup: pd.DataFrame, on: str) -> pd.DataFrame:\n    return df.merge(lookup, on=on, how=\"left\")\n# 2. Compose into a single, linear pipeline\nresult = (df\n    .query(\"status == 'active'\")\n    .pipe(winsorize, col=\"amount\", p=0.005)\n    .pipe(join_lookup, lookup=customers, on=\"customer_id\")\n    .assign(amount_per_customer=lambda d: d[\"amount\"] / d[\"customer_size\"])\n    .sort_values(\"amount_per_customer\", ascending=False))\n# 3. (callable, kwarg_name) form — when df isn't the first arg\n#    e.g. some_fn(threshold, df) instead of some_fn(df, threshold)\n# result = df.pipe((some_fn, \"df\"), threshold=10)\n# 4. Anti-pattern: pipe a function that mutates input then returns it\n#    Wrong:\n#       def bad(df): df[\"x\"] = 1; return df          # mutates caller\n#    Right:\n#       def good(df): return df.assign(x=1)          # returns new frame\n# Decision rule:\n#   Apply a function in a chain                 -> df.pipe(my_fn, arg1, kwarg=...)\n#   Function expects the frame as 1st arg         -> .pipe(fn) directly\n#   Function expects df as a non-first arg         -> .pipe((fn, \"df_arg\"), other_args)\n#   Build complex pipelines without temp vars     -> pipe + assign + query + groupby\n#   Side-effect-free transformations               -> functional style fits .pipe\n#   Need to inspect mid-chain                     -> .pipe(lambda d: print(d.shape) or d) for debug\n#   Performance: just a wrapper                    -> no overhead vs direct call\n#   Heavy stats / sklearn                          -> wrap fn(df) with .pipe to keep chaining\n#\n# Anti-pattern: nested function calls instead of .pipe in long pipelines\n#   foo(bar(baz(df.query(...).assign(...)))) reads inside-out and is hard to\n#   debug. df.query(...).assign(...).pipe(baz).pipe(bar).pipe(foo) reads\n#   left-to-right and lets you comment-out a single .pipe to bisect."
                  }
        ],
        tips: [
                  "pipe() makes any function chain-compatible — the function just needs df as its first argument",
                  "Use `pipe(log_shape)` for inline debugging without breaking a chain",
                  "`df.copy()` inside pipe functions prevents mutating the input DataFrame",
                  "Combine with assign() for fully declarative, linear transformation pipelines"
        ],
        mistake: "Trying to use pipe() with a function that does not return a DataFrame. The result of pipe() is whatever your function returns — if it returns None, the chain ends.",
        shorthand: {
          verbose: "import pandas as pd\ndef add_features(df, threshold=50):\nreturn df.assign(above=df['value'] > threshold)\ndef normalize(df, col):",
          concise: "df2 = normalize(df2, col='score')",
        },
      },
      {
        id: "apply",
        fn: ".apply()",
        desc: "Apply a function row-wise (axis=1) or column-wise (axis=0).",
        category: "Transform",
        subtitle: "Last resort — use only when vectorized operations cannot work",
        signature: "df.apply(fn, axis=1) | Series.apply(fn)",
        descLong: "apply(axis=1) calls fn on each row as a Series — it is the slowest pandas operation. Use vectorized operations, np.where(), or np.select() first. apply() is only justified when logic genuinely requires multiple column values per row.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .apply() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             function. Useful for one-off transformations.\n#             this function on each element.\n#             ops, vectorized is 100-1000x faster. The next tier\n#             shows when to reach for apply vs alternatives.\n#\nimport pandas as pd\ndf[\"grade\"] = df[\"score\"].apply(lambda x: \"A\" if x >= 90 else \"B\")\n# Faster: df[\"grade\"] = np.where(df[\"score\"] >= 90, \"A\", \"B\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .apply() — common patterns you'll see in production.\n# APPROACH  - Combine .apply() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             first, then np.where / np.select for branching, and\n#             apply(axis=1) ONLY when the logic genuinely needs\n#             multiple columns per row. Column-wise apply\n#             (axis=0) is fine — it's the row-wise version that's\n#             slow.\n#             np.where and np.select as the right tools 90% of\n#             the time.\n#             slow apply, or how to verify a candidate\n#             vectorization gave the same result.\n#\nimport pandas as pd\nimport numpy as np\n# 1. Single condition -> np.where\ndf[\"grade\"] = np.where(df[\"score\"] >= 90, \"A\", \"B\")\n# 2. Multiple conditions -> np.select (orders of magnitude faster\n#    than apply with if/elif/else)\nconditions = [\n    (df[\"age\"] > 60) & (df[\"score\"] < 50),\n    df[\"score\"] < 70,\n]\nchoices = [\"high\", \"medium\"]\ndf[\"risk\"] = np.select(conditions, choices, default=\"low\")\n# 3. Column-wise apply (axis=0) is fine — it runs once per column\nranges = df.apply(lambda col: col.max() - col.min())\n# 4. Apply(axis=1) is justified ONLY when no vectorized form exists\n#    (e.g. logic that needs many columns AND can't be expressed as\n#    arithmetic / np.select)\ndef risk_score(row):\n    if row[\"age\"] > 60 and row[\"score\"] < 50:\n        return \"high\"\n    if row[\"score\"] < 70:\n        return \"medium\"\n    return \"low\"\n# df[\"risk\"] = df.apply(risk_score, axis=1)   # only if you must"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .apply() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             form first (and verify equivalence on a sample),\n#             cache or memoize anything inside the function, and\n#             reach for swifter / pandarallel / a Cython UDF only\n#             after measurement. apply(axis=1) is a code-review\n#             flag, not a habit.\n#             vectorized version actually doesn't exist;\n#             parallelization buys real speed when the function\n#             is genuinely expensive; cython/numba is the floor\n#             when nothing else works.\n#             numba requires numeric-only functions; some real\n#             problems (free-text classification, external API\n#             calls) genuinely don't vectorize and you'll live\n#             with apply.\n#\nimport pandas as pd\nimport numpy as np\n# 1. Always look for a vectorized equivalent — and verify\nslow = df.apply(lambda r: r[\"a\"] * r[\"b\"] + r[\"c\"], axis=1)\nfast = df[\"a\"] * df[\"b\"] + df[\"c\"]\nassert slow.equals(fast)            # confirm before deleting the apply\n# 2. Memoize expensive per-row work that has small input cardinality\nfrom functools import lru_cache\n@lru_cache(maxsize=None)\ndef expensive(key: str) -> int:\n    # imagine this hits a DB or runs a model\n    return len(key) * 7\ndf[\"x\"] = df[\"key\"].map(expensive)   # map > apply for Series; cached call\n# 3. Parallelize when the function is truly slow per-row\n# pip install swifter\n# import swifter\n# df[\"risk\"] = df.swifter.apply(risk_score, axis=1)\n# 4. Numeric-only hot loop -> numba\n# from numba import njit\n# @njit\n# def kernel(a, b, c): return a * b + c\n# df[\"x\"] = kernel(df[\"a\"].to_numpy(), df[\"b\"].to_numpy(), df[\"c\"].to_numpy())\n# Decision rule, in order:\n#   1. vectorized pandas/numpy expression\n#   2. np.where / np.select for branching\n#   3. .map(dict) or .map(fn) for element-wise on a Series\n#   4. groupby + transform/agg for per-group ops\n#   5. apply(axis=1)         <- only when none of the above work\n#   6. swifter / numba       <- only after measurement says it helps\n# Decision rule:\n#   Vectorized op exists                        -> use it; NEVER apply\n#   Row-wise function (rare)                     -> df.apply(fn, axis=1) (slow but flexible)\n#   Per-column reduction                          -> df.apply(fn, axis=0) (or just .agg)\n#   Per-element                                   -> .map (Series) or .applymap (DataFrame)\n#   Heavy custom logic                             -> consider .pipe + numpy / numba\n#   Need the row as a dict                         -> apply(fn, axis=1) gives a Series per row\n#   Group-wise                                    -> df.groupby(g).apply(fn) (still slow)\n#   Speed-critical                                -> drop down to numpy or use df[\"x\"].to_numpy()\n#\n# Anti-pattern: df.apply(lambda row: row.a + row.b, axis=1)\n#   row-wise apply is a Python for-loop in disguise — orders of magnitude\n#   slower than the vectorized df.a + df.b. Reach for apply ONLY when no\n#   vectorized op exists; verify by profiling, not by habit."
                  }
        ],
        tips: [
                  "`np.where(cond, true, false)` replaces most single-condition apply calls",
                  "`np.select(conditions, choices, default)` replaces multi-condition apply — 100x faster",
                  "`df.apply(fn, axis=0)` (column-wise) is fast; `df.apply(fn, axis=1)` (row-wise) is slow",
                  "For unavoidable row-wise apply: `swifter` or `pandarallel` parallelize it"
        ],
        mistake: "`df.apply(lambda row: row[\"a\"] + row[\"b\"], axis=1)` for numeric ops. `df[\"a\"] + df[\"b\"]` is vectorized and ~1000x faster.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "map",
        fn: ".map()",
        desc: "Map each element of a Series through a dict or function.",
        category: "Transform",
        subtitle: "Element-wise transformation or value substitution on a Series",
        signature: "Series.map(dict) | Series.map(fn)",
        descLong: "map() applies a dict or function to each element of a Series, returning a new Series. With a dict, values not in the dict become NaN. Use map() for value substitution and simple element-wise transformations on a single Series.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .map() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             becomes its mapped output; values not in the dict\n#             become NaN.\n#             pattern.\n#             surprise — junior tier addresses replace() for the\n#             \"keep unmatched\" case.\n#\nimport pandas as pd\ndf[\"status\"] = df[\"code\"].map({\"A\": \"Active\", \"I\": \"Inactive\"})\n# any code not in the dict is now NaN"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .map() — common patterns you'll see in production.\n# APPROACH  - Combine .map() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             map(fn) for simple element-wise, replace(dict) when\n#             unmatched values should stay unchanged, and\n#             vectorized numpy when the function is numeric.\n#             map vs replace vs vectorized for the three common\n#             shapes of element-wise work.\n#             handling, or the \"missing key in dict\" early-warning\n#             pattern — senior tier covers those.\n#\nimport pandas as pd\nimport numpy as np\n# Dict substitution — unmatched -> NaN\ndf[\"status\"] = df[\"code\"].map({\"A\": \"Active\", \"I\": \"Inactive\"})\n# Function — element-wise transformation\ndf[\"clean\"]     = df[\"name\"].map(str.strip)\n# Want to KEEP unmatched values? Use replace, not map\ndf[\"code_pretty\"] = df[\"code\"].replace({\"A\": \"Active\", \"I\": \"Inactive\"})\n# unrecognized codes pass through unchanged\n# For numeric functions, vectorized is much faster than map(fn)\ndf[\"log_price\"] = np.log(df[\"price\"])             # not df[\"price\"].map(np.log)\n# Quick rules of thumb\n# map(dict)   - encode/lookup; missing -> NaN\n# replace()   - substitute; missing -> unchanged\n# map(fn)     - element-wise transform; numeric? prefer vectorized\n# apply(axis=1) - DataFrame row logic only when nothing else fits"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .map() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (don't let them become silent NaN), use na_action=\n#             \"ignore\" when NaN should pass through unchanged,\n#             prefer Categorical.cat.rename_categories for true\n#             encoded columns, and reach for merge() when the\n#             \"lookup\" is really a join.\n#             rename_categories preserves the dtype; merge is the\n#             right tool when the lookup table is itself a frame.\n#             more code than map for trivial encodings;\n#             na_action=\"ignore\" is sometimes too lenient (you\n#             may want NaN to fail fast).\n#\nimport pandas as pd\n# 1. Surface unmapped keys instead of silently producing NaN\nmapping = {\"A\": \"Active\", \"I\": \"Inactive\"}\nunmapped = set(df[\"code\"].dropna().unique()) - set(mapping)\nif unmapped:\n    raise ValueError(f\"unmapped codes: {sorted(unmapped)}\")\ndf[\"status\"] = df[\"code\"].map(mapping)\n# 2. Pass NaN through unchanged when that's the intent\ndf[\"status_b\"] = df[\"code\"].map(mapping, na_action=\"ignore\")\n# 3. Categorical rename — when the column is a category\ndf[\"status_cat\"] = df[\"code\"].astype(\"category\")\ndf[\"status_cat\"] = df[\"status_cat\"].cat.rename_categories(mapping)\n# 4. Lookup table is a DataFrame -> use merge, not map\nlookups = pd.DataFrame({\n    \"code\":  [\"A\", \"I\"],\n    \"label\": [\"Active\", \"Inactive\"],\n    \"color\": [\"green\", \"red\"],\n})\ndf = df.merge(lookups, on=\"code\", how=\"left\")    # carries multi-column metadata\n# Decision rule, in order:\n#   single-column dict  -> map(dict)\n#   single-column dict, keep unmatched -> replace(dict)\n#   numeric function    -> vectorized np / pandas\n#   categorical rename  -> cat.rename_categories\n#   multi-column lookup -> merge\n# Decision rule:\n#   Replace values from a dict                  -> s.map({\"old\":\"new\", ...})\n#   Apply a Python fn elementwise                 -> s.map(lambda x: ...)\n#   Map from another Series                       -> s.map(lookup_series)\n#   NaN for missing keys (default)                 -> map() returns NaN for unmapped keys\n#   Keep unmapped values                           -> s.map(lookup).fillna(s)\n#   Vectorized: prefer .replace                    -> s.replace({\"old\":\"new\"}) handles partial mappings\n#   DataFrame elementwise                          -> df.applymap (deprecated -> df.map in 2.1+)\n#   Categorical                                    -> map preserves dtype if all keys covered\n#\n# Anti-pattern: s.map(dict) when the dict doesn't cover every value\n#   Unmapped values become NaN — easy to lose silently. Either provide a default\n#   (s.map(d).fillna(s)) or use s.replace(d) which preserves unmapped values.\n#   Pandas 3.0 may also let you pass na_action=\"ignore\" to keep originals."
                  }
        ],
        tips: [
                  "Dict mapping with `map()` sets unmatched values to NaN — use `replace()` to keep unmatched values",
                  "For numeric functions use vectorized operations directly: `np.log(df[\"col\"])` not `df[\"col\"].map(np.log)`",
                  "`map()` is element-wise on a single Series; `apply()` is more flexible but slower",
                  "Combine `map()` with a dict for readable category encoding"
        ],
        mistake: "Using `df[\"col\"].map({\"A\": 1})` expecting unmapped values to stay unchanged. They become NaN. Use `df[\"col\"].replace({\"A\": 1})` to preserve unmapped values.",
        shorthand: {
          verbose: "result = []\nfor x in numbers:\n    result.append(x * 2)",
          concise: "result = list(map(lambda x: x * 2, numbers))",
        },
      },
      {
        id: "groupby",
        fn: ".groupby()",
        desc: "Split a DataFrame into groups by one or more column values.",
        category: "Transform",
        subtitle: "Foundation for .agg(), .transform(), and .filter()",
        signature: "df.groupby(\"col\") | df.groupby([\"col1\",\"col2\"])",
        descLong: "groupby() splits a DataFrame into groups — it returns a GroupBy object. Chain with agg(), transform(), or filter() to compute summaries, add group stats back, or keep/drop entire groups.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .groupby() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             pick another, take the mean.\n#             category, summarize a numeric column.\n#             on real data (observed=, as_index=, sort=) — those\n#             are everyday performance levers.\n#\nimport pandas as pd\ndf.groupby(\"dept\")[\"salary\"].mean()\n# dept\n# Eng    92500\n# HR     62500"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .groupby() — common patterns you'll see in production.\n# APPROACH  - Combine .groupby() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             observed=True for categorical speed, as_index=False\n#             for flat output, .size()/.ngroups for sanity checks.\n#             Note that the GroupBy object itself is lazy.\n#             observed=True is the single most useful flag — without\n#             it, categorical groupby creates a row for every\n#             unused combination.\n#             decision tree, or the \"groupby + apply is the slow\n#             path\" rule — that's where the next two entries (and\n#             the senior tier here) live.\n#\nimport pandas as pd\n# Multi-column grouping\ndf.groupby([\"dept\", \"level\"])[\"salary\"].mean()\n# Categorical speedup — skip empty combinations\ndf.groupby(\"dept\", observed=True)[\"salary\"].mean()\n# Flat output — keep dept as a column instead of the index\ndf.groupby(\"dept\", as_index=False)[\"salary\"].mean()\n# Preserve insertion order (otherwise groups are alphabetical)\ndf.groupby(\"dept\", sort=False)[\"salary\"].mean()\n# Sanity checks\ndf.groupby(\"dept\").size()                # rows per group\ndf.groupby(\"dept\").ngroups               # number of distinct groups"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .groupby() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             vs filter vs apply on purpose; reach for groupby on\n#             a categorical (with observed=True) for big speedups;\n#             know the \"split, materialize, iterate\" anti-pattern\n#             that destroys performance.\n#             without an apply in sight; categorical+observed is\n#             how big-data groupby stays fast in pandas; the\n#             decision rule is the actual review checklist.\n#             huge frames; categorical alignment across files is\n#             its own problem (see the categorical entry); apply\n#             remains the right tool for genuinely irregular\n#             per-group logic — just rarely.\n#\nimport pandas as pd\n# 1. Pick the right verb on purpose\ng = df.groupby([\"region\", \"dept\"], observed=True)\n# agg       - one row per group, named columns\ng.agg(avg_salary=(\"salary\", \"mean\"), n=(\"id\", \"count\"))\n# transform - same shape as input, broadcast group stats back\ndf[\"dept_avg\"] = g[\"salary\"].transform(\"mean\")\n# filter    - keep or drop ENTIRE groups by predicate\nbig_groups = g.filter(lambda gr: len(gr) >= 50)\n# apply     - last resort, when no built-in shape fits\ntop_per_group = g.apply(\n    lambda gr: gr.nlargest(3, \"salary\"),\n    include_groups=False,\n).reset_index(drop=True)\n# 2. Categorical + observed=True for big speedups\ndf[\"region\"] = df[\"region\"].astype(\"category\")\ndf.groupby(\"region\", observed=True)[\"amount\"].sum()\n# observed=True is critical with categorical -> avoids one row per\n# unused category combination\n# 3. Anti-pattern: split, materialize, iterate\n# Wrong:\n#   for name, group in df.groupby(\"dept\"):\n#       results.append(group[\"salary\"].mean())\n# Right:\n#   df.groupby(\"dept\", observed=True)[\"salary\"].mean()\n# Iterating per-group in Python is ~100x slower than vectorized agg.\n# Decision rule:\n#   Aggregate per group                         -> df.groupby(g).agg({\"a\":\"mean\",\"b\":\"sum\"})\n#   Single-column reduction                       -> df.groupby(g)[\"x\"].sum()\n#   Add a column based on group                    -> df.groupby(g)[\"x\"].transform(\"mean\")\n#   Multi-key                                    -> groupby([\"a\",\"b\"])\n#   Don't mutate index                             -> as_index=False (keeps grouping cols as columns)\n#   Iteration                                    -> for k, sub in df.groupby(g): ... (slow; rare)\n#   Time-based bucket                             -> df.groupby(pd.Grouper(freq=\"D\"))\n#   Polars/duckdb at scale                         -> 5-50x faster on big data; same mental model\n#\n# Anti-pattern: looping over groups in Python with iterrows / for-each\n#   for k, sub in df.groupby(g): out.append(sub.x.mean()) — you've reinvented\n#   .agg(\"mean\") with 100x more Python overhead. Use df.groupby(g).x.mean()\n#   directly; iterate only when each group needs a custom non-vectorizable fn."
                  }
        ],
        tips: [
                  "`observed=True` skips empty category combinations — big speedup with categorical columns",
                  "`as_index=False` returns a flat DataFrame instead of a grouped index — cleaner for display",
                  "Never loop with `for name, group in df.groupby(...)` for aggregation — use `.agg()` instead",
                  "GroupBy is lazy — no work is done until you call `.agg()`, `.transform()`, etc."
        ],
        mistake: "Looping over `df.groupby(\"dept\")` to compute per-group statistics. Always use `.agg()` instead — it is vectorized and orders of magnitude faster.",
        shorthand: {
          verbose: "import pandas as pd\ng = df.groupby('dept')\ng['salary'].mean()           # mean salary per dept\ndf.groupby(['dept', 'level'])['salary'].mean()",
          concise: "df.groupby('dept').ngroups      # number of distinct groups",
        },
      },
      {
        id: "agg",
        fn: ".agg()",
        desc: "Compute one or more aggregate statistics per group.",
        category: "Transform",
        subtitle: "Named aggregations give clean column names in one call",
        signature: "df.groupby(\"col\").agg(name=(\"col\", \"func\"))",
        descLong: "agg() computes summary statistics for each group. Named aggregations (pandas 0.25+) give the output column its name in one step — no need to rename afterward. Pass a list for multiple stats per column.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .agg() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             single named aggregator on a numeric column.\n#             like a SQL SELECT AVG ... GROUP BY ...\n#             or the difference between agg(list) and named\n#             aggregations.\n#\nimport pandas as pd\ndf.groupby(\"dept\")[\"salary\"].mean()\ndf.groupby(\"dept\")[\"salary\"].sum()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .agg() — common patterns you'll see in production.\n# APPROACH  - Combine .agg() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             agg(name=(\"col\", \"func\")). Multiple stats per call,\n#             different stats per column, multi-key groupby with\n#             reset_index for flat output.\n#             pass — no rename step, no MultiIndex columns. This\n#             is the form to memorize.\n#             agg are slow), or the \"agg returns one row per\n#             group, transform keeps shape\" distinction — those\n#             come up in transform's own entry.\n#\nimport pandas as pd\n# Named aggregations — clean column names in ONE call\nsummary = df.groupby(\"dept\").agg(\n    avg_salary = (\"salary\", \"mean\"),\n    max_salary = (\"salary\", \"max\"),\n    headcount  = (\"salary\", \"count\"),\n    p90        = (\"salary\", lambda s: s.quantile(0.9)),\n)\n# Multi-key groupby + reset_index for a flat result\nflat = (df.groupby([\"dept\", \"level\"])\n          .agg(avg=(\"salary\", \"mean\"), n=(\"id\", \"count\"))\n          .reset_index())\n# Different stats from different columns\nmix = df.groupby(\"dept\").agg(\n    total_days = (\"days\", \"sum\"),\n    city_count = (\"city\", \"nunique\"),\n    last_seen  = (\"date\", \"max\"),\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .agg() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (\"mean\", \"sum\", \"nunique\") over lambdas (Cython vs\n#             Python loop), use weighted aggregations explicitly,\n#             and add observed=True + a non-default fill where\n#             empty groups would otherwise drop out.\n#             the difference is 10-100x on large frames; weighted\n#             stats are the right answer to \"average rating\n#             weighted by votes\" or \"weighted price\"; observed=True\n#             prevents categorical-product blowup.\n#             repetitive — wrap it in a helper; observed=True\n#             changes output shape vs older code that relied on\n#             the all-categories grid; lambdas are sometimes the\n#             only way for genuinely custom logic.\n#\nimport pandas as pd\nimport numpy as np\ng = df.groupby(\"dept\", observed=True)\n# 1. Built-in strings hit the C fast path — much faster than lambdas\nfast = g.agg(\n    n        = (\"id\",     \"count\"),\n    avg_sal  = (\"salary\", \"mean\"),\n    p50      = (\"salary\", \"median\"),\n    distinct = (\"city\",   \"nunique\"),\n)\n# 2. Weighted aggregation — express it as a closed form\ndef weighted_mean(values: pd.Series, weights: pd.Series) -> float:\n    return np.average(values, weights=weights)\nweighted = (df.groupby(\"product\", observed=True)\n              .apply(lambda gr: weighted_mean(gr[\"price\"], gr[\"units\"]),\n                     include_groups=False)\n              .rename(\"weighted_avg_price\"))\n# 3. Multiple stats with different column dtypes — keep types clean\nreport = g.agg(\n    revenue   = (\"amount\", \"sum\"),\n    avg_age   = (\"age\",    \"mean\"),\n    last_seen = (\"date\",   \"max\"),\n).convert_dtypes()                          # nullable types preserved\n# 4. Anti-pattern: dict-form agg with list values\n#    Old:    df.groupby(\"dept\").agg({\"salary\": [\"mean\", \"std\"]})\n#    Result: MultiIndex columns ('salary', 'mean') / ('salary', 'std')\n#    New:    df.groupby(\"dept\").agg(\n#                mean=(\"salary\", \"mean\"),\n#                std =(\"salary\", \"std\"),\n#            )                              # flat columns\n# Decision rule:\n#   Single function                              -> .agg(\"mean\") or .agg(np.mean)\n#   Multiple functions                            -> .agg([\"mean\",\"std\",\"count\"])\n#   Per-column functions                          -> .agg({\"a\":\"mean\",\"b\":\"sum\"})\n#   Custom output names                            -> .agg(out_a=(\"a\",\"mean\"), out_b=(\"b\",\"sum\"))\n#   User function                                  -> .agg(lambda x: x.iloc[-1] - x.iloc[0])\n#   Many funcs across many cols                    -> .agg([\"mean\",\"std\",\"min\",\"max\"])\n#   Need to build column names cleanly             -> named-aggregation form (out_x=(...))\n#   Want side-effects per group                    -> use .apply, NOT .agg\n#\n# Anti-pattern: .agg with a lambda when a built-in shorthand exists\n#   .agg(lambda x: x.mean()) — slow Python callable per group. Use the string\n#   shorthand .agg(\"mean\") which dispatches to the C path — orders of magnitude\n#   faster on millions of groups."
                  }
        ],
        tips: [
                  "Named aggregations `agg(name=(\"col\", \"func\"))` give clean column names — no renaming needed",
                  "Use `\"nunique\"` to count distinct values per group — great for cardinality analysis",
                  "Chain `.reset_index()` after agg to convert the group index back to columns",
                  "Custom lambda functions in agg are slower than built-in aggregators — use built-ins when possible"
        ],
        mistake: "Using `.agg({\"col\": [\"mean\", \"std\"]})` which creates MultiIndex column names. Use named aggregations instead — `agg(mean=(\"col\",\"mean\"), std=(\"col\",\"std\"))` for flat column names.",
        shorthand: {
          verbose: "import pandas as pd\ndf.groupby('dept')['salary'].mean()\ndf.groupby('dept')['salary'].agg(['mean', 'min', 'max', 'count'])\nsummary = df.groupby('dept').agg(",
          concise: ")",
        },
      },
      {
        id: "transform",
        fn: ".transform()",
        desc: "Apply a group function and return a Series aligned with the original index.",
        category: "Transform",
        subtitle: "Add group statistics back to every row — same shape as input",
        signature: "df.groupby(\"col\")[\"val\"].transform(\"mean\")",
        descLong: "transform() computes a per-group statistic but returns a Series with the same index as the original DataFrame — so you can add it back as a new column. Unlike agg(), it does not collapse rows.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .transform() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             return is the same shape as the original column.\n#             a group\" — every row now knows its dept's average.\n#             output shapes) or show the higher-value patterns\n#             (z-score, cumulative, normalize-by-total).\n#\nimport pandas as pd\ndf[\"dept_avg\"] = df.groupby(\"dept\")[\"salary\"].transform(\"mean\")\n# every row in the same dept gets the same dept_avg"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .transform() — common patterns you'll see in production.\n# APPROACH  - Combine .transform() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             z-score, cumulative sums, normalize-by-total. End\n#             with the agg-vs-transform shape comparison so the\n#             distinction sticks.\n#             feature engineering against a group-level baseline\n#             without a join.\n#             than lambda\" rule or the include_groups=False habit\n#             that's becoming the default — senior tier covers both.\n#\nimport pandas as pd\ng = df.groupby(\"dept\")[\"salary\"]\n# Percentile rank within group\ndf[\"rank\"]    = g.transform(\"rank\", pct=True)\n# Z-score within group (lambda — see senior tier for the fast form)\ndf[\"z\"]       = g.transform(lambda s: (s - s.mean()) / s.std())\n# Cumulative sum within group (sales by product over time)\ndf[\"cum_sales\"] = (df.sort_values([\"product\", \"date\"])\n                     .groupby(\"product\")[\"sales\"]\n                     .transform(\"cumsum\"))\n# Normalize by group total\ndf[\"pct_of_dept\"] = df[\"salary\"] / df.groupby(\"dept\")[\"salary\"].transform(\"sum\")\n# Shape contrast — agg collapses, transform broadcasts back\ndf.groupby(\"dept\")[\"salary\"].agg(\"mean\")        # one row per dept\ndf.groupby(\"dept\")[\"salary\"].transform(\"mean\")  # one row per ORIGINAL row"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .transform() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             10-100x speedup on large frames, use the GroupBy\n#             accessors (g.cumsum, g.rolling) directly when\n#             available, and treat group-relative features as\n#             pipeline-shaped (sort first, document the \"within\n#             group, ordered by time\" assumption).\n#             GroupBy accessors avoid lambda overhead entirely;\n#             explicit sort + transform makes time-aware features\n#             reproducible.\n#             (custom percentiles still need a lambda); transform\n#             with a lambda that returns a Series can be subtly\n#             slower than groupby + reindex; sort-then-transform\n#             has to be repeated whenever group ordering matters.\n#\nimport pandas as pd\n# 1. String aggregators >> lambda for built-ins\ndf[\"g_mean\"] = df.groupby(\"dept\")[\"salary\"].transform(\"mean\")     # fast\n# Lambda equivalent (slower):\ndf[\"g_mean_slow\"] = df.groupby(\"dept\")[\"salary\"].transform(lambda s: s.mean())\n# 2. Direct GroupBy accessors are the fast path for cumulative / rolling\ndf = df.sort_values([\"product\", \"date\"])\ng = df.groupby(\"product\")[\"sales\"]\ndf[\"cumsum\"]    = g.cumsum()\ndf[\"roll_7\"]    = g.rolling(7, min_periods=1).mean().reset_index(level=0, drop=True)\ndf[\"pct_chg\"]   = g.pct_change()\n# 3. Z-score within group — fast path uses two transforms\ngs = df.groupby(\"dept\")[\"salary\"]\ndf[\"z\"] = (df[\"salary\"] - gs.transform(\"mean\")) / gs.transform(\"std\")\n# 4. include_groups=False (pandas 2.2+) — modern groupby.apply default\ntop = (df.groupby(\"dept\")\n         .apply(lambda gr: gr.assign(rk=gr[\"salary\"].rank(ascending=False)),\n                include_groups=False))\n# Decision rule:\n#   Per-group statistic broadcast back to rows  -> df.groupby(g)[\"x\"].transform(\"mean\")\n#   Returns SAME shape as input                  -> agg returns N rows; transform returns len(df)\n#   Multiple transforms                          -> transform([\"mean\",\"std\"]) -> wide result\n#   Standardization within group                  -> transform(lambda x: (x - x.mean()) / x.std())\n#   Cumulative                                  -> .transform(\"cumsum\") (per-group cumsum)\n#   Filling NaN by group mean                    -> transform(\"mean\") then fillna\n#   Counts per group                             -> .transform(\"size\") or \"count\"\n#   Lag/lead per group                            -> groupby(g)[\"x\"].shift()\n#\n# Anti-pattern: groupby + apply when transform fits\n#   apply returns groups assembled however the function returns them — easy to\n#   end up with a MultiIndex you didn't want. transform always returns the\n#   same shape and index as the input — the right tool for \"broadcast group\n#   stat back to rows\" cases (z-scoring, group-mean fillna, % of group total)."
                  }
        ],
        tips: [
                  "transform() is the key pattern for adding group stats back to the original DataFrame",
                  "The result is always aligned with the original index — safe to assign directly as a column",
                  "Use transform for feature engineering in ML: group mean, rank, z-score, cumsum",
                  "If the lambda returns a scalar, transform broadcasts it to every row in the group"
        ],
        mistake: "Using `.agg()` when you need the result aligned with the original DataFrame. agg() collapses to one row per group. transform() keeps the original shape.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "merge",
        fn: "pd.merge()",
        desc: "Join two DataFrames on key columns — SQL-style.",
        category: "Transform",
        subtitle: "inner, left, right, outer — with validate= and indicator=",
        signature: "pd.merge(left, right, on=\"key\", how=\"inner\")",
        descLong: "merge() performs SQL-style joins. how= controls join type: inner, left, right, outer. validate= checks cardinality. indicator=True adds a column showing where each row came from.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.merge() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Reads like SQL: pick rows that match in both frames.\n#             default how=\"inner\" covers most starter joins.\n#             almost always want how=\"left\" + indicator=True so\n#             you can SEE what didn't match.\n#\nimport pandas as pd\njoined = pd.merge(emp, dept, on=\"dept_id\")    # inner join\njoined.shape                                  # may be smaller than emp!"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.merge() — common patterns you'll see in production.\n# APPROACH  - Combine pd.merge() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             different column names with left_on/right_on,\n#             multi-key joins, indicator=True for join debugging,\n#             validate= to assert cardinality, suffixes= for\n#             clashing column names.\n#             indicator=True is the single best debugging tool\n#             for \"why is my join short/wrong?\".\n#             zero-match killer), merge_asof for time-series, or\n#             the join-vs-merge index distinction — senior tier.\n#\nimport pandas as pd\n# Pick the join type explicitly\nleft_join = pd.merge(emp, dept, on=\"dept_id\", how=\"left\")     # all emps\nouter     = pd.merge(emp, dept, on=\"dept_id\", how=\"outer\")    # union of keys\n# Different column names per side\npd.merge(orders, customers, left_on=\"cust_id\", right_on=\"id\")\n# Composite keys\npd.merge(df1, df2, on=[\"year\", \"month\", \"product\"])\n# Debug a surprising row count with indicator=True\naudit = pd.merge(df1, df2, on=\"id\", how=\"outer\", indicator=True)\naudit[\"_merge\"].value_counts()\n# both          9800\n# left_only      150   <- in df1 but not df2\n# right_only      50\n# Assert expected cardinality — raises immediately on violation\npd.merge(emp, dept, on=\"dept_id\", validate=\"m:1\")             # many emp -> 1 dept\n# Clashing column names get suffixes\npd.merge(a, b, on=\"id\", suffixes=(\"_left\", \"_right\"))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.merge() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             indicator audit; check key dtypes before joining\n#             (different ints/strings silently produce zero matches);\n#             use merge_asof for time-series joins; consider\n#             df.merge(other.set_index(key), on=key) for repeated\n#             joins against the same lookup.\n#             of \"my totals are wrong after the join\" bugs into\n#             immediate exceptions; merge_asof is the right tool\n#             for \"join to the most recent prior event\"; pre-\n#             indexing speeds up repeated lookups.\n#             always valid); indicator audit costs an extra pass;\n#             merge_asof requires sorted keys on both sides;\n#             pre-indexing assumes the lookup is reused.\n#\nimport pandas as pd\n# 1. Pre-flight: same dtypes on both sides of the key\nassert orders[\"customer_id\"].dtype == customers[\"id\"].dtype, (\n    \"key dtype mismatch -> merge will produce 0 matches\"\n)\n# 2. Validate cardinality + audit unmatched rows\njoined = pd.merge(\n    orders, customers,\n    left_on=\"customer_id\", right_on=\"id\",\n    how=\"left\",\n    validate=\"m:1\",                     # many orders per customer\n    indicator=True,\n)\nunmatched = joined[joined[\"_merge\"] == \"left_only\"]\nassert len(unmatched) == 0, f\"{len(unmatched)} orders had no customer record\"\njoined = joined.drop(columns=\"_merge\")\n# 3. Time-series join — \"as of\" the most recent prior timestamp\nquotes = quotes.sort_values(\"ts\")\ntrades = trades.sort_values(\"ts\")\nmatched = pd.merge_asof(\n    trades, quotes,\n    on=\"ts\",\n    by=\"symbol\",                        # match within symbol\n    tolerance=pd.Timedelta(\"1s\"),       # only if quote is within 1s of trade\n    direction=\"backward\",               # most recent quote BEFORE trade\n)\n# 4. Repeated lookup — pre-index once\ncustomer_lookup = customers.set_index(\"id\")\nout = orders.join(customer_lookup, on=\"customer_id\", how=\"left\")    # uses index\n# Anti-pattern: f-string composition of merge keys\n#    pd.merge(df, other, on=f\"{prefix}_id\")    # silent typo risk\n# Right: validate= forces the schema contract to be explicit.\n# Decision rule:\n#   SQL JOIN equivalent                          -> df.merge(other, on=\"key\", how=\"left/inner/outer\")\n#   Different column names                        -> left_on=\"a\", right_on=\"b\"\n#   Index alignment                               -> df.join(other) (faster, no key arg)\n#   Validate cardinality                           -> validate=\"one_to_many\" / \"many_to_one\"\n#   Investigate join misses                        -> indicator=True (adds _merge column)\n#   Many-to-many warning                            -> validate=\"one_to_one\" raises if violated\n#   Time-aware near-match                           -> pd.merge_asof (rolling join)\n#   Big data                                        -> polars / duckdb beat pandas on joins"
                  }
        ],
        tips: [
                  "Always use `validate=` on important joins — catches unexpected duplicates that inflate row counts",
                  "`indicator=True` is the fastest way to debug why a join produces unexpected results",
                  "Check key dtypes before merging: `df1[\"id\"].dtype` must equal `df2[\"id\"].dtype`",
                  "`validate=\"1:1\"`, `\"1:m\"`, `\"m:1\"`, `\"m:m\"` — be explicit about expected cardinality"
        ],
        mistake: "Merging on columns with different dtypes (int vs string ID). Pandas silently produces 0 matching rows. Always verify `df1[\"key\"].dtype == df2[\"key\"].dtype` before merging.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "concat",
        fn: "pd.concat()",
        desc: "Stack DataFrames vertically or side-by-side.",
        category: "Transform",
        subtitle: "Vertical stack (UNION ALL) with axis=0, horizontal with axis=1",
        signature: "pd.concat([df1, df2], axis=0, ignore_index=True)",
        descLong: "concat() stacks DataFrames. axis=0 (default) stacks vertically — like SQL UNION ALL. axis=1 stacks side-by-side. ignore_index=True resets the index after stacking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.concat() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             ignore_index=True to get a clean integer index.\n#             concat, mismatched columns, or \"where did this row\n#             come from?\" tracking.\n#\nimport pandas as pd\ncombined = pd.concat([df1, df2], ignore_index=True)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.concat() — common patterns you'll see in production.\n# APPROACH  - Combine pd.concat() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             a glob, tracking source via keys=, horizontal concat\n#             on a shared index, and the join= flag for handling\n#             column mismatches.\n#             pipelines: read many files, stack, optionally tag\n#             which file each row came from.\n#             the dtype-promotion side effects of stacking — those\n#             are senior-tier.\n#\nimport pandas as pd\nimport glob\n# Stack many CSVs into one frame\ndfs = [pd.read_csv(f) for f in glob.glob(\"data/*.csv\")]\ncombined = pd.concat(dfs, ignore_index=True)\n# Track source via a hierarchical index, then drill in\nlabelled = pd.concat(dfs, keys=[\"jan\", \"feb\", \"mar\"])\nlabelled.loc[\"jan\"]                          # rows from first frame\n# Horizontal stack — both sides must share an index\nassert df1.index.equals(df2.index), \"indexes must match for axis=1\"\nwide = pd.concat([df1, df2], axis=1)\n# Mismatched columns: NaN-fill (default) vs keep-only-common\nunion = pd.concat([df1, df2], axis=0)                    # NaN-fill\ninner = pd.concat([df1, df2], axis=0, join=\"inner\")      # only shared cols"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.concat() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             column, harmonize dtypes BEFORE stacking (categorical\n#             union, nullable Int64 vs int64, datetime tz), and\n#             prefer pyarrow CSV reading when stacking dozens of\n#             files.\n#             back to object dtype after concat; explicit source\n#             tagging beats keys= for downstream filtering;\n#             pyarrow reads are 2-5x faster on big batches.\n#             has subtly different error messages; \"make all\n#             dtypes match\" is sometimes lossy (Int64 -> float).\n#\nimport pandas as pd\nfrom pandas.api.types import CategoricalDtype\n# 1. Tag source explicitly — better than keys= for downstream code\ndef tagged(path: str) -> pd.DataFrame:\n    return pd.read_csv(path).assign(_source=path)\ncombined = pd.concat(\n    [tagged(p) for p in sorted(glob.glob(\"data/*.csv\"))],\n    ignore_index=True,\n)\n# 2. Categorical alignment — concat falls back to object without this\nstatus_dtype = CategoricalDtype([\"active\", \"pending\", \"inactive\"])\ndf1[\"status\"] = df1[\"status\"].astype(status_dtype)\ndf2[\"status\"] = df2[\"status\"].astype(status_dtype)\ncombined = pd.concat([df1, df2], ignore_index=True)\ncombined[\"status\"].dtype                 # category — preserved\n# 3. Pre-flight: same dtypes for shared columns avoids object fallback\nshared = set(df1.columns) & set(df2.columns)\nmismatch = {c for c in shared if df1[c].dtype != df2[c].dtype}\nassert not mismatch, f\"dtype mismatch on {mismatch}\"\n# 4. Streaming concat for very many files — keep memory bounded\ndef aggregate_csvs(paths):\n    running = []\n    for p in paths:\n        chunk = pd.read_csv(p, engine=\"pyarrow\")\n        running.append(chunk.groupby(\"region\", observed=True)[\"amount\"].sum())\n    return pd.concat(running).groupby(level=0).sum()\n# Anti-pattern: pd.concat([df1, df2]) without ignore_index= when\n# stacking. Original indexes are preserved -> duplicate index labels\n# silently break downstream .loc / .reindex calls.\n# Decision rule:\n#   Stack rows (same columns)                   -> pd.concat([df1, df2], axis=0, ignore_index=True)\n#   Side-by-side columns                         -> pd.concat([df1, df2], axis=1)\n#   Inner-join on index/columns                   -> join=\"inner\" (drops misaligned)\n#   Track origin                                  -> keys=[\"a\",\"b\"] (creates outer MultiIndex)\n#   Performance with many small frames            -> collect ALL, then ONE concat — never in a loop\n#   Need to reset index                            -> ignore_index=True\n#   Append a single row                            -> pd.concat([df, pd.DataFrame([row])])\n#   Cross schema                                   -> concat with sort=False for consistent order"
                  }
        ],
        tips: [
                  "`ignore_index=True` resets the index — almost always what you want after vertical stacking",
                  "`keys=[\"a\",\"b\"]` adds a MultiIndex level showing which DataFrame each row came from",
                  "Vertical concat with different columns fills missing values with NaN — use `join=\"inner\"` to keep only common columns",
                  "`pd.concat([df] * 3)` repeats a DataFrame 3 times — useful for testing"
        ],
        mistake: "Using `pd.concat([df1, df2])` without `ignore_index=True` when stacking rows. The original indexes are preserved — you end up with duplicate index values which causes bugs in later operations.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "pivot-table",
        fn: ".pivot_table()",
        desc: "Reshape data from long to wide format with aggregation.",
        category: "Transform",
        subtitle: "Long → wide — like an Excel pivot table with aggfunc",
        signature: "df.pivot_table(values, index, columns, aggfunc=\"mean\")",
        descLong: "pivot_table() reshapes data from long to wide format. Rows become the index, unique values of a column become new column headers, and cells are aggregated. fill_value= replaces NaN in the result.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .pivot_table() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             two categorical axes. Reads exactly like an Excel\n#             pivot.\n#             observation) to wide cross-tab.\n#             aggregations, or the pivot vs pivot_table distinction.\n#\nimport pandas as pd\ndf.pivot_table(values=\"sales\", index=\"product\", columns=\"region\",\n               aggfunc=\"sum\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .pivot_table() — common patterns you'll see in production.\n# APPROACH  - Combine .pivot_table() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             cells, margins=True for grand totals, multiple\n#             aggfuncs at once, multiple value columns. Note the\n#             pivot vs pivot_table difference (duplicates).\n#             cross-tab with row/column totals, several stats in\n#             one call, and the \"use pivot_table by default\" rule.\n#             to flatten it for downstream code — senior tier.\n#\nimport pandas as pd\n# Standard cross-tab with totals and clean zeros\nsales_pivot = df.pivot_table(\n    values     = \"sales\",\n    index      = \"product\",\n    columns    = \"region\",\n    aggfunc    = \"sum\",\n    fill_value = 0,\n    margins    = True,\n)\n# Multiple stats in one call\nmulti = df.pivot_table(\n    values  = \"sales\",\n    index   = \"product\",\n    aggfunc = [\"sum\", \"mean\", \"count\"],\n)\n# Multiple value columns — independent pivots merged\nboth = df.pivot_table(\n    values  = [\"sales\", \"units\"],\n    index   = \"product\",\n    columns = \"region\",\n    aggfunc = \"sum\",\n)\n# pivot vs pivot_table:\n#   pivot()       - requires unique (index, columns) pairs; raises otherwise\n#   pivot_table() - aggregates duplicates with aggfunc=\ndf.pivot(index=\"date\", columns=\"product\", values=\"price\")    # only if unique"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .pivot_table() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             that multi-aggfunc/multi-values produce, set\n#             observed=True on categorical pivots, name aggregations\n#             with a function dict for self-documenting output, and\n#             use crosstab when you only want counts.\n#             plotting); observed=True prevents the all-categories\n#             grid blowup; pd.crosstab is the right tool for pure\n#             frequency tables.\n#             (joining the levels with \"_\" is conventional but\n#             not universal); observed=True changes the output\n#             shape vs older code that relied on every category\n#             showing up.\n#\nimport pandas as pd\n# 1. Flatten MultiIndex columns produced by multi-aggfunc\nmulti = df.pivot_table(\n    values  = \"sales\",\n    index   = \"product\",\n    columns = \"region\",\n    aggfunc = [\"sum\", \"mean\", \"count\"],\n).pipe(lambda p: p.set_axis(\n    [f\"{stat}_{region}\" for stat, region in p.columns], axis=1\n))\n# 2. observed=True with categorical index/columns\ndf[\"region\"] = df[\"region\"].astype(\"category\")\nclean = df.pivot_table(\n    values  = \"sales\",\n    index   = \"product\",\n    columns = \"region\",\n    aggfunc = \"sum\",\n    observed = True,                    # avoid empty all-categories grid\n    fill_value = 0,\n)\n# 3. Pure frequency cross-tab — pd.crosstab is the right hammer\nfreq = pd.crosstab(df[\"product\"], df[\"region\"], margins=True, normalize=\"index\")\n# 4. Decision rule:\n#    - one stat, one value column        -> pivot_table is fine\n#    - frequency / proportions only      -> pd.crosstab\n#    - already aggregated, just reshape  -> pivot()\n#    - need long->wide AND aggregation   -> pivot_table()\n#    - downstream code wants flat columns-> set_axis() to flatten\n# Decision rule:\n#   Group-aggregate to wide form                -> df.pivot_table(values, index, columns, aggfunc)\n#   Multiple aggregations                         -> aggfunc=[\"sum\",\"mean\"] (multi-col result)\n#   Multiple values columns                       -> values=[\"a\",\"b\"] (multi-col result)\n#   Fill missing combinations                     -> fill_value=0\n#   Want raw reshape (no agg)                      -> df.pivot (errors on duplicates)\n#   Add row/col totals                             -> margins=True, margins_name=\"Total\"\n#   Speed-sensitive                                -> groupby(...).agg(...).unstack() can be faster\n#   Need long form back                            -> .melt() inverses pivot\n#\n# Anti-pattern: pivot_table without specifying aggfunc when duplicates exist\n#   pandas defaults to mean, silently averaging values you might have wanted\n#   summed (or counted). Always pass aggfunc explicitly: aggfunc=\"sum\" / \"count\" /\n#   \"first\" — choose deliberately, document intent."
                  }
        ],
        tips: [
                  "`fill_value=0` fills NaN in the result — usually correct for sales/count pivots",
                  "`margins=True` adds \"All\" row and column totals",
                  "`pivot()` raises if duplicates exist; `pivot_table()` aggregates them — prefer pivot_table by default",
                  "The result has a MultiIndex for columns when multiple values or aggfuncs are used — call `.droplevel(0, axis=1)` to flatten",
                  "For pure frequency / proportion tables, reach for `pd.crosstab` — it is purpose-built and reads more clearly than pivot_table with `aggfunc=\"count\"`"
        ],
        mistake: "Using `df.pivot()` when there are duplicate (index, column) combinations. It raises ValueError. Use `df.pivot_table()` which handles duplicates by aggregating.",
        shorthand: {
          verbose: "import pandas as pd\ndf.pivot_table(\nvalues    = 'sales',\nindex     = 'product',",
          concise: "df.pivot(index='date', columns='product', values='price')",
        },
      },
      {
        id: "melt",
        fn: ".melt()",
        desc: "Reshape data from wide to long (tidy) format.",
        category: "Transform",
        subtitle: "Wide → long — the inverse of pivot_table",
        signature: "pd.melt(df, id_vars=[], value_vars=[], var_name=\"\", value_name=\"\")",
        descLong: "melt() converts wide-format data to long (tidy) format. id_vars= are the columns to keep fixed. value_vars= are the columns to unpivot. The result has one row per measurement. Most visualization libraries expect long format.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .melt() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             new variable / value columns, get a long-form frame.\n#             lines; the result is the format every plotting lib\n#             prefers.\n#             multiple value blocks, or wide_to_long for\n#             structured column names.\n#\nimport pandas as pd\nwide = pd.DataFrame({\n    \"name\": [\"Alice\", \"Bob\"],\n    \"q1\":   [100, 200],\n    \"q2\":   [150, 180],\n    \"q3\":   [120, 220],\n})\nlong = wide.melt(id_vars=[\"name\"], var_name=\"quarter\", value_name=\"sales\")\n#    name quarter  sales\n# 0 Alice      q1    100\n# 1   Bob      q1    200\n# 2 Alice      q2    150\n# 3   Bob      q2    180"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .melt() — common patterns you'll see in production.\n# APPROACH  - Combine .melt() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             when only some columns should unpivot, the round-\n#             trip via pivot_table to invert, and method-form vs\n#             function-form (both equivalent).\n#             prep for seaborn/plotly, normalize a wide schema,\n#             then pivot back if needed.\n#             names follow a pattern (e.g. \"q1_sales\", \"q2_sales\") —\n#             senior tier.\n#\nimport pandas as pd\n# Explicit value_vars — leave other columns alone\nlong = wide.melt(\n    id_vars    = [\"name\"],\n    value_vars = [\"q1\", \"q2\", \"q3\"],\n    var_name   = \"quarter\",\n    value_name = \"sales\",\n)\n# Round trip: long -> wide via pivot_table\nback = long.pivot_table(\n    values  = \"sales\",\n    index   = \"name\",\n    columns = \"quarter\",\n    aggfunc = \"sum\",\n)\n# Function form is equivalent\nlong2 = pd.melt(wide, id_vars=[\"name\"],\n                var_name=\"quarter\", value_name=\"sales\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .melt() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             follow a stub_pattern (e.g. \"sales_q1\", \"sales_q2\"),\n#             multi-block melt for paired columns (sales + units\n#             per quarter), and an explicit dtype check after\n#             melt to catch object-fallback.\n#             plain melt forces you to do manually; multi-block\n#             melt produces a clean long form with one row per\n#             observation; dtype check catches the silent\n#             promotion to object when value columns differ in\n#             type.\n#             that's easy to get wrong; multi-block melt requires\n#             two passes plus a join when the value columns have\n#             different units; melted frames are typically larger\n#             in memory than wide ones.\n#\nimport pandas as pd\n# 1. wide_to_long — column names follow a stub pattern\nwide = pd.DataFrame({\n    \"name\": [\"Alice\", \"Bob\"],\n    \"sales_q1\": [100, 200], \"sales_q2\": [150, 180],\n    \"units_q1\": [10,  20],  \"units_q2\": [15,  18],\n})\nlong = pd.wide_to_long(\n    wide,\n    stubnames=[\"sales\", \"units\"],     # one stub per measurement\n    i=\"name\",                          # row identifier(s)\n    j=\"quarter\",                       # name for the new \"varying\" axis\n    sep=\"_\",\n    suffix=r\"q\\d+\",\n).reset_index()\n# columns: name, quarter, sales, units\n# 2. Multi-block melt by hand — when the pattern is irregular\nsales_long = wide.melt(id_vars=[\"name\"], value_vars=[\"sales_q1\",\"sales_q2\"],\n                        var_name=\"quarter\", value_name=\"sales\")\nunits_long = wide.melt(id_vars=[\"name\"], value_vars=[\"units_q1\",\"units_q2\"],\n                        var_name=\"quarter\", value_name=\"units\")\nsales_long[\"quarter\"] = sales_long[\"quarter\"].str.replace(\"sales_\", \"\")\nunits_long[\"quarter\"] = units_long[\"quarter\"].str.replace(\"units_\", \"\")\ncombined = sales_long.merge(units_long, on=[\"name\", \"quarter\"])\n# 3. Dtype audit after melt — catches silent object fallback\nassert long[\"sales\"].dtype != object, \"value column promoted to object\"\n# Decision rule:\n#   single block of measurements                -> wide.melt(...)\n#   structured stubs (\"sales_q1\", \"sales_q2\")   -> pd.wide_to_long(...)\n#   multiple measurement blocks, irregular      -> melt each + merge\n# Anti-pattern: melt without id_vars / value_vars on wide tables\n#   Default melt() folds EVERY column into one — including row id columns you\n#   needed to keep. Always specify id_vars=[\"id\",\"date\"] (the keys to preserve)\n#   and value_vars=[the wide cols you're unpivoting] for a predictable long form."
                  }
        ],
        tips: [
                  "Most visualization libraries (seaborn, plotly) expect long format — `melt()` is the path to get there",
                  "If `value_vars=` is omitted, all columns not in `id_vars=` are melted",
                  "Use `df.melt()` as a method or `pd.melt(df)` as a function — both are equivalent",
                  "`pd.wide_to_long()` is a more powerful version for structured column name patterns"
        ],
        mistake: "Passing column names as `id_vars` that should be melted, or vice versa. `id_vars` are the fixed identifier columns that appear in every row; `value_vars` are the columns being unpivoted.",
        shorthand: {
          verbose: "import pandas as pd\nwide = pd.DataFrame({\n'name': ['Alice', 'Bob'],\n'q1':   [100, 200],",
          concise: "columns='quarter', aggfunc='sum')",
        },
      },
      {
        id: "df-stack",
        fn: ".stack()",
        desc: "Pivot innermost column level into row index.",
        category: "Transform",
        subtitle: "Columns → rows (stack) and rows → columns (unstack)",
        signature: "df.stack() | df.unstack(level=-1)",
        descLong: "stack() pivots the innermost column level into the row index, creating a longer DataFrame. unstack() does the inverse — moves a row index level into columns. Most useful when working with MultiIndex DataFrames.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .stack() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             MultiIndex Series. unstack does the reverse.\n#             do — they're the dual of each other.\n#             which) or show the level= argument that determines\n#             which axis level is moved.\n#\nimport pandas as pd\ndf = pd.DataFrame({\"q1\": [100, 200], \"q2\": [150, 180]},\n                  index=[\"Alice\", \"Bob\"])\nstacked = df.stack()\n# Alice  q1    100\n#        q2    150\n# Bob    q1    200\n#        q2    180\nback = stacked.unstack()                     # original DataFrame"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .stack() — common patterns you'll see in production.\n# APPROACH  - Combine .stack() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             with unstack to choose which axis goes wide; reset\n#             the resulting MultiIndex when you need plain columns;\n#             know the stack vs melt decision (column structure\n#             vs explicit value_vars).\n#             cleanup, MultiIndex manipulation, round-tripping a\n#             groupby result.\n#             default) or the dropna behavior — senior tier.\n#\nimport pandas as pd\n# Stack/unstack pair on a MultiIndex Series\narrays = [[\"bar\", \"bar\", \"baz\"], [\"one\", \"two\", \"one\"]]\ns = pd.Series([1, 2, 3], index=pd.MultiIndex.from_arrays(arrays))\ns.unstack()                                   # 2nd level -> columns\ns.unstack(level=0)                            # 1st level -> columns\n# Round trip after stacking\nstacked = df.stack()\nflat    = stacked.reset_index()\nflat.columns = [\"name\", \"quarter\", \"sales\"]   # name the new cols\n# stack vs melt\n#   stack() - operates on the column index structure (esp. MultiIndex)\n#   melt()  - explicit value_vars=, more readable for plain wide frames"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .stack() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             names are the variable, prefer stack/unstack when\n#             you're already working with a MultiIndex (post-\n#             groupby/pivot). Adopt future_stack=True to align\n#             with the new dropna semantics.\n#             is more diff-friendly than stack for simple wide\n#             frames; stack is the right tool for \"I just got a\n#             MultiIndex Series back from groupby and want a\n#             frame\".\n#             code may rely on the legacy NaN-dropping; readers\n#             unfamiliar with MultiIndex will struggle either way;\n#             the resulting MultiIndex may need explicit naming\n#             (rename_axis) before reset_index for clean columns.\n#\nimport pandas as pd\n# 1. Modern stack — preserve NaN explicitly\ndf.stack(future_stack=True)                   # don't silently drop NaN\n# 2. Post-groupby Series -> tidy frame via unstack + reset\ncounts = (df.groupby([\"region\", \"status\"], observed=True)\n            .size()\n            .unstack(fill_value=0))           # status -> columns\n# counts is now a frame; rows = region, columns = status\n# 3. From a MultiIndex frame back to long form\nmulti = df.groupby([\"region\", \"month\"], observed=True)[\"sales\"].agg([\"mean\", \"sum\"])\nlong = (multi.stack(future_stack=True)\n              .rename_axis([\"region\", \"month\", \"stat\"])\n              .reset_index(name=\"value\"))\n# Decision rule:\n#   wide frame, columns are the variable        -> melt(...)\n#   already have MultiIndex (post-groupby/pivot) -> stack/unstack\n#   need to keep NaN slots                       -> future_stack=True\n#   want flat columns at the end                 -> rename_axis() + reset_index()\n# Anti-pattern: stack/unstack churn instead of pivot/melt\n#   stack() and unstack() are matched-pair index<->columns reshapes; they're\n#   the right primitives, but pivot_table / melt are clearer when expressing\n#   \"wide to long\" (or back). Reach for stack/unstack only when the MultiIndex\n#   structure is the point; otherwise use the higher-level functions."
                  }
        ],
        tips: [
                  "For simple wide→long transforms, `melt()` is more readable than `stack()`",
                  "`stack()` creates a MultiIndex on the row — use `.reset_index()` to flatten it back to columns",
                  "`unstack(level=0)` pivots the outer index level; `unstack(level=-1)` pivots the inner",
                  "stack/unstack are most useful when working with MultiIndex DataFrames from pivot operations",
                  "On pandas 2.x, pass `future_stack=True` (or set `dropna=False`) to keep NaN slots — the default silently drops them"
        ],
        mistake: "Using stack() on a DataFrame with NaN values without `dropna=False`. By default, stack() drops rows where the stacked value is NaN.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "rolling",
        fn: ".rolling()",
        desc: "Compute statistics over a fixed-size sliding window.",
        category: "Transform",
        subtitle: "Moving average, rolling std, rolling max — for time series",
        signature: "df[\"col\"].rolling(window, min_periods=1).mean()",
        descLong: "rolling() computes statistics over a sliding window of fixed size. By default produces NaN for the first n-1 rows — use min_periods=1 to get values from the start. Always sort by date before applying.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .rolling() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             window. The first n-1 rows come back as NaN.\n#             is what makes rolling correct.\n#             or the group-aware variant that prevents leakage\n#             across products.\n#\nimport pandas as pd\ndf = df.sort_values(\"date\")\ndf[\"ma7\"] = df[\"sales\"].rolling(7).mean()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .rolling() — common patterns you'll see in production.\n# APPROACH  - Combine .rolling() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             the warm-up, center=True for symmetric windows,\n#             multiple aggregators (mean / std / sum / max), the\n#             ewm alternative for recency-weighting, and group-\n#             aware rolling via groupby + transform.\n#             smooth a series, compute volatility, weight recent\n#             observations, and respect group boundaries.\n#             of integer 7) which require a DatetimeIndex —\n#             senior tier.\n#\nimport pandas as pd\ndf = df.sort_values(\"date\")\n# Multiple stats over the same window\ndf[\"ma7\"]   = df[\"sales\"].rolling(7, min_periods=1).mean()\ndf[\"std7\"]  = df[\"sales\"].rolling(7, min_periods=1).std()\ndf[\"max7\"]  = df[\"sales\"].rolling(7, min_periods=1).max()\n# Centered window — uses past AND future, careful with leakage\ndf[\"ma7c\"]  = df[\"sales\"].rolling(7, center=True).mean()\n# Recency-weighted alternative — exponential moving average\ndf[\"ema7\"]  = df[\"sales\"].ewm(span=7).mean()\n# Group-aware: rolling within each product, not across boundaries\ndf[\"prod_ma7\"] = (df.groupby(\"product\")[\"sales\"]\n                    .transform(lambda s: s.rolling(7, min_periods=1).mean()))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .rolling() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             DatetimeIndex when timestamps are irregular, fast-\n#             path string aggregators (no lambda) inside groupby\n#             rolling, closed= for \"right edge open\" windows that\n#             prevent forward-looking leakage in features.\n#             window doesn't include rows from 30 days ago just\n#             because they happen to be the previous 7 entries);\n#             string aggregators hit the C path; closed=\"left\"\n#             excludes the current row — critical for ML features.\n#             which costs a one-time sort; closed= semantics are\n#             easy to misread; ewm has its own closed= conventions.\n#\nimport pandas as pd\n# 1. Time-aware rolling — handles irregular spacing correctly\nts = (df.set_index(\"date\")\n        .sort_index())\nts[\"ma_7d\"]    = ts[\"sales\"].rolling(\"7D\").mean()       # last 7 calendar days\nts[\"sum_30d\"]  = ts[\"sales\"].rolling(\"30D\").sum()\n# 2. Group-aware rolling on the FAST PATH (no lambda)\ndf = df.sort_values([\"product\", \"date\"])\ndf[\"roll_7\"] = (df.groupby(\"product\", observed=True)[\"sales\"]\n                  .rolling(7, min_periods=1)\n                  .mean()\n                  .reset_index(level=0, drop=True))\n# 3. Anti-leakage in ML features — exclude the current row\nts[\"lag_avg_7\"] = (ts[\"sales\"]\n                     .rolling(7, closed=\"left\")          # window ENDS BEFORE row\n                     .mean())                            # safe to use as a feature\n# 4. Custom aggregator (when no built-in fits) via raw=True for speed\nimport numpy as np\nts[\"range_7\"] = (ts[\"sales\"]\n                   .rolling(7)\n                   .apply(lambda a: a.max() - a.min(), raw=True))\n# Anti-pattern: rolling on unsorted data\n#   df[\"sales\"].rolling(7).mean()    # nonsense if df isn't sorted\n# Always sort first; assert ts.index.is_monotonic_increasing in pipelines.\n# Decision rule:\n#   Fixed-size window                            -> df.rolling(window=N).mean()\n#   Time-based window                             -> rolling(\"7D\") (needs DatetimeIndex)\n#   Expanding (cumulative)                         -> .expanding() (window grows)\n#   Per-group rolling                              -> df.groupby(g).rolling(N)\n#   Custom function                                -> .apply(fn, raw=True) (raw=True passes ndarray, faster)\n#   Min periods to bypass leading NaN              -> min_periods=1\n#   Centered window                                -> center=True (causes lookahead — be careful)\n#   Multi-column reduction                          -> .agg({\"a\":\"mean\",\"b\":\"sum\"}) on rolling"
                  }
        ],
        tips: [
                  "Always `sort_values(\"date\")` before rolling — unsorted data gives meaningless results",
                  "`min_periods=1` fills the warm-up period at the start instead of producing NaN",
                  "`ewm(span=n).mean()` gives more weight to recent observations — better than SMA for volatile series",
                  "Group-aware rolling via `groupby().transform(lambda x: x.rolling(n).mean())`"
        ],
        mistake: "Applying `.rolling()` before sorting by date. Rolling operates on physical row order — if rows are unsorted, the window contains the wrong observations.",
        shorthand: {
          verbose: "import pandas as pd\ndf = df.sort_values('date')\ndf['ma7']  = df['sales'].rolling(7).mean()\ndf['ma30'] = df['sales'].rolling(30).mean()",
          concise: "df['ema7'] = df['sales'].ewm(span=7).mean()",
        },
      },
      {
        id: "expanding",
        fn: ".expanding()",
        desc: "Compute statistics over all rows up to the current one.",
        category: "Transform",
        subtitle: "Cumulative stats — grows from the start of the Series",
        signature: "df[\"col\"].expanding(min_periods=1).mean()",
        descLong: "expanding() computes statistics using all data from the beginning up to and including the current row. The window size grows with each row. expanding().sum() is equivalent to .cumsum().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .expanding() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             rows from the start up to itself.\n#             expanding window grows with every row.\n#             that are usually faster, or group-aware expanding.\n#\nimport pandas as pd\ndf = df.sort_values(\"date\")\ndf[\"cum_sales\"] = df[\"sales\"].expanding().sum()           # running total"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .expanding() — common patterns you'll see in production.\n# APPROACH  - Combine .expanding() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             max / mean / std, min_periods to skip the warm-up,\n#             and the cumXxx shortcuts that are faster for\n#             specific stats.\n#             fast paths for the most common expanding stats;\n#             expanding() shines when you need MEAN/STD/custom.\n#             products would leak) or feature-leakage via the\n#             \"current row included\" default — senior tier.\n#\nimport pandas as pd\ndf = df.sort_values(\"date\")\n# Standard cumulative stats\ndf[\"cum_sum\"]   = df[\"sales\"].expanding(min_periods=1).sum()\ndf[\"cum_mean\"]  = df[\"sales\"].expanding(min_periods=1).mean()\ndf[\"cum_std\"]   = df[\"sales\"].expanding(min_periods=2).std()\ndf[\"cum_max\"]   = df[\"sales\"].expanding(min_periods=1).max()\n# Faster shortcuts for the simple ones\ndf[\"running_total\"] = df[\"sales\"].cumsum()\ndf[\"running_max\"]   = df[\"sales\"].cummax()\ndf[\"running_prod\"]  = df[\"sales\"].cumprod()\n# A useful diagnostic: today vs running average\ndf[\"vs_cum_avg\"]    = df[\"sales\"] - df[\"sales\"].expanding().mean()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .expanding() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             tracks its own cumulative state), closed=\"left\" or\n#             a manual shift to make ML features safe (no peeking\n#             at the current row), and a \"use cumXxx unless you\n#             need a non-builtin stat\" rule.\n#             per customer/product\"; closed=\"left\" is the only\n#             safe default for any ML feature derived from past\n#             observations; cum* hits the fast path.\n#             closed=\"left\" is supported on rolling but not on\n#             expanding — for expanding you have to shift(1)\n#             explicitly; mixing groupby with expanding can be\n#             slow on huge frames.\n#\nimport pandas as pd\n# 1. Group-aware running stats — never leak across product boundaries\ndf = df.sort_values([\"product\", \"date\"])\ndf[\"cum_sales\"] = df.groupby(\"product\", observed=True)[\"sales\"].cumsum()\ndf[\"cum_max\"]   = df.groupby(\"product\", observed=True)[\"sales\"].cummax()\n# 2. Group-aware EXPANDING (when you need mean/std and not just sum)\ndf[\"cum_mean\"] = (df.groupby(\"product\", observed=True)[\"sales\"]\n                    .transform(lambda s: s.expanding(min_periods=1).mean()))\n# 3. Anti-leakage for ML features — shift BEFORE the running stat\ndf = df.sort_values(\"date\")\ndf[\"lagged_cum_mean\"] = df[\"sales\"].shift(1).expanding().mean()\n# Now every row sees only rows that came strictly before it.\n# Decision rule:\n#   running sum/max/min/prod    -> cumsum / cummax / cummin / cumprod\n#   running mean/std/custom     -> expanding(min_periods=...).mean() etc\n#   per-group running stats     -> groupby(...).cumsum() / .transform(expanding)\n#   ML feature (no leakage)     -> shift(1) THEN expanding/cum\n#   fixed-width window          -> rolling(n) instead of expanding\n# Anti-pattern: using expanding() on a non-monotonic time index\n#   Expanding windows are inherently order-dependent — sort_index() FIRST so\n#   \"all data up to now\" actually means \"all data with timestamp <= now\".\n#   Same warning as rolling on time series."
                  }
        ],
        tips: [
                  "`cumsum()`, `cummax()`, `cummin()`, `cumprod()` are faster shortcuts for common expanding stats",
                  "Group-aware expanding via `df.groupby(\"g\")[\"v\"].transform(lambda x: x.expanding().mean())`",
                  "`expanding(min_periods=n)` waits until n observations before producing values",
                  "expanding().std() uses ddof=1 (sample std) by default — use ddof=0 for population std",
                  "For ML features, `shift(1)` BEFORE expanding/cum — otherwise the current row leaks into its own running stat"
        ],
        mistake: "Using `expanding()` when you want a fixed-size window. expanding() grows — its window includes everything from the start. Use `rolling(n)` for a fixed n-period window.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "shift",
        fn: ".shift()",
        desc: "Shift values forward or backward by N periods to create lag features.",
        category: "Transform",
        subtitle: "Create lag and lead features for time series and ML",
        signature: "df[\"col\"].shift(1) | .shift(-1) | .diff() | .pct_change()",
        descLong: "shift() moves values forward (positive n) or backward (negative n) by n positions, filling edges with NaN. Essential for creating lag features in time series models and for computing period-over-period changes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .shift() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             shift(1) gives \"yesterday's value\" for every row.\n#             two lines.\n#             companions), multi-lag generation, or the group-\n#             aware shift that prevents cross-boundary leakage.\n#\nimport pandas as pd\ndf = df.sort_values(\"date\")\ndf[\"lag1\"] = df[\"sales\"].shift(1)             # yesterday's sales"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .shift() — common patterns you'll see in production.\n# APPROACH  - Combine .shift() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             loop, period-over-period change with diff() and\n#             pct_change(), and the group-aware version that\n#             keeps lags inside each product/customer.\n#             daily; the group-aware groupby+shift is THE rule\n#             for multi-entity time-series data.\n#             DatetimeIndex (shift by \"1D\" instead of \"1 row\") —\n#             senior tier covers it.\n#\nimport pandas as pd\ndf = df.sort_values([\"product\", \"date\"])\n# Multiple lags at once — feature batch\nfor n in (1, 7, 14, 30):\n    df[f\"lag_{n}\"] = df.groupby(\"product\")[\"sales\"].shift(n)\n# Period-over-period change\ndf[\"daily_change\"] = df[\"sales\"].diff(1)\ndf[\"wow_change\"]   = df[\"sales\"].diff(7)\ndf[\"daily_growth\"] = df[\"sales\"].pct_change()\ndf[\"wow_growth\"]   = df[\"sales\"].pct_change(7)\n# Lead (future) — useful for labeling, dangerous as a feature\ndf[\"next\"] = df[\"sales\"].shift(-1)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .shift() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             on a DatetimeIndex (shift by \"1D\" instead of one\n#             row, so gaps don't fake an adjacent period), an\n#             explicit \"lead is leakage\" rule, and a fill_value=\n#             choice that documents the warm-up policy.\n#             timestamps; explicit fill_value gives a deliberate\n#             warm-up; \"no shift(-N) in features\" is the simplest\n#             rule for preventing label leakage.\n#             fill_value sometimes needs to be a sentinel\n#             rather than 0 (NaN is often correct); group-aware\n#             time-aware shift requires the index to align with\n#             the group sort.\n#\nimport pandas as pd\n# 1. Time-aware shift — correct under irregular spacing\nts = (df.set_index(\"date\").sort_index())\nts[\"lag_1d\"] = ts[\"sales\"].shift(freq=\"1D\")          # shift by 1 calendar day\nts[\"lag_7d\"] = ts[\"sales\"].shift(freq=\"7D\")\n# 2. Per-group lag features with explicit warm-up policy\ndef add_lags(df: pd.DataFrame, col: str, lags=(1, 7, 14, 30)) -> pd.DataFrame:\n    g = df.sort_values([\"product\", \"date\"]).groupby(\"product\", observed=True)\n    for n in lags:\n        df[f\"{col}_lag_{n}\"] = g[col].shift(n)        # NaN warm-up by default\n    return df\ndf = add_lags(df, \"sales\")\n# 3. Anti-leakage rules for ML features\n#    Use only PAST data (shift > 0) for features.\n#    shift(-1) is fine for LABELS (\"did sales go up tomorrow?\")\n#    NEVER as an X column.\n# 4. Fill-value choice — be deliberate\n#    NaN     - honest about missingness; tree models handle it\n#    0       - only if 0 is semantically valid\n#    sentinel (\"WARM_UP\")  - for category-shaped features\n# Anti-pattern: cross-group shift\n#   df[\"lag1\"] = df[\"sales\"].shift(1)\n#   when the data has multiple products -> lag1 of product B's first\n#   row is product A's last row. ALWAYS groupby-shift for multi-entity data.\n# Decision rule:\n#   Lag (look back N rows)                      -> s.shift(N) (positive lag)\n#   Lead (look forward)                           -> s.shift(-N)\n#   Per-group lag                                  -> df.groupby(g)[\"x\"].shift(1)\n#   Time-based shift                               -> .shift(freq=\"1D\") (needs DatetimeIndex)\n#   Difference between current and prior           -> s - s.shift(1)  (or s.diff())\n#   Percent change                                  -> s.pct_change() (= s/s.shift()-1)\n#   Filling the leading NaN                         -> .shift().fillna(0)\n#   Predicting next value                            -> .shift(-1) (target column)"
                  }
        ],
        tips: [
                  "`shift(1)` creates a lag — essential for preventing data leakage in time series ML models",
                  "Use `groupby().shift()` for group-aware lags — otherwise you lag across group boundaries",
                  "`pct_change()` is equivalent to `(shift(0) - shift(1)) / shift(1)` — computed efficiently",
                  "The first `n` rows after a `shift(n)` are NaN — handle them before feeding into a model"
        ],
        mistake: "Using `df[\"sales\"].shift(1)` without groupby when data has multiple products. This creates lags across product boundaries — the lag for the first row of product B is the last row of product A.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "cut",
        fn: "pd.cut()",
        desc: "Bin continuous data into fixed-width intervals.",
        category: "Transform",
        subtitle: "You define the bin edges — equal-width buckets",
        signature: "pd.cut(series, bins=[0,18,65,100], labels=[\"youth\",\"adult\",\"senior\"])",
        descLong: "pd.cut() bins values into intervals you define. The intervals are equal-width only if you pass an integer for bins — for custom boundaries, pass a list. Returns a Categorical Series.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.cut() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             labels. The result is a Categorical Series.\n#             18-35 is young adult, ...\".\n#             ordered categoricals, or auto-edge binning.\n#\nimport pandas as pd\ndf[\"age_group\"] = pd.cut(\n    df[\"age\"],\n    bins=[0, 18, 35, 60, 100],\n    labels=[\"youth\", \"young_adult\", \"adult\", \"senior\"],\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.cut() — common patterns you'll see in production.\n# APPROACH  - Combine pd.cut() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             choice, retbins to recover the actual edges, auto\n#             N equal-width bins, ordered categorical for\n#             comparison, observed=True in groupby.\n#             scales, age groups, deciding whether the upper\n#             edge is inclusive (test scores) or exclusive\n#             (numeric ranges).\n#             the production \"save the edges to apply to a new\n#             dataset\" pattern — senior tier.\n#\nimport pandas as pd\nfrom pandas.api.types import CategoricalDtype\n# Right-inclusive intervals (default): (a, b]\ndf[\"grade\"] = pd.cut(\n    df[\"score\"],\n    bins   = [0, 60, 70, 80, 90, 100],\n    labels = [\"F\", \"D\", \"C\", \"B\", \"A\"],\n    right  = True,                              # 90 -> B (not A)\n)\n# Auto N equal-width bins; retbins gives you the edges\ndf[\"bucket\"], edges = pd.cut(df[\"score\"], bins=5, retbins=True)\n# Ordered categorical -> comparison and sort order\norder = CategoricalDtype([\"F\", \"D\", \"C\", \"B\", \"A\"], ordered=True)\ndf[\"grade\"] = df[\"grade\"].astype(order)\ndf[df[\"grade\"] >= \"B\"]\n# Use the binned column in groupby\ndf.groupby(\"grade\", observed=True)[\"salary\"].mean()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.cut() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             training so the same bins can be applied to test /\n#             new data, choose right= deliberately based on the\n#             metric semantics (scores vs ranges), and pick\n#             cut vs qcut on purpose.\n#             prod data\" bug; explicit right= documents the\n#             boundary policy; the cut-vs-qcut decision rule\n#             stops the most common \"my buckets are nearly empty\"\n#             complaint.\n#             to the model); right=False feels backward in some\n#             domains (age \"under 18\" vs \"exactly 18\"); cut-vs-\n#             qcut is a real choice that depends on whether you\n#             care about width or about count.\n#\nimport pandas as pd\nimport json\n# 1. Fit edges on training data, persist, reuse at inference\nedges = [0, 60, 70, 80, 90, 100]\nlabels = [\"F\", \"D\", \"C\", \"B\", \"A\"]\nwith open(\"artifacts/grade_bins.json\", \"w\") as f:\n    json.dump({\"edges\": edges, \"labels\": labels}, f)\n# At inference time, load and apply the SAME bins\nspec = json.load(open(\"artifacts/grade_bins.json\"))\ndf[\"grade\"] = pd.cut(df[\"score\"], bins=spec[\"edges\"], labels=spec[\"labels\"])\n# 2. Endpoint policy — make right= a deliberate choice\n# Test scores: right=True -> 90 is a B (boundary belongs to lower bin)\ndf[\"grade\"] = pd.cut(df[\"score\"], bins=edges, labels=labels, right=True)\n# Numeric ranges where the upper edge means \"less than\": right=False\ndf[\"bucket\"] = pd.cut([0, 17, 18, 64, 65],\n                       bins=[0, 18, 65, 120],\n                       labels=[\"minor\", \"adult\", \"senior\"],\n                       right=False)              # 18 -> \"adult\", 65 -> \"senior\"\n# 3. Decision rule — cut vs qcut\n#    cut(bins=...)   - WIDTH is meaningful (age ranges, score grades)\n#    qcut(q=...)     - COUNT is meaningful (deciles, percentile scoring)\n#    Symptom of wrong choice: cut leaves bins nearly empty when\n#    distribution is skewed; qcut struggles when many values tie.\n# 4. Anti-pattern: redefine bins per dataset\n#    Means today's \"B\" student would be tomorrow's \"C\" if the score\n#    distribution shifts. Persist the edges with the model.\n# Decision rule:\n#   Bin numeric column into N equal-width bins  -> pd.cut(s, bins=N)\n#   Custom bin edges                              -> bins=[0, 18, 65, np.inf]\n#   Custom labels                                 -> labels=[\"minor\",\"adult\",\"senior\"]\n#   Right-open vs right-closed                     -> right=True (default; intervals like (a,b])\n#   Need EQUAL-COUNT bins (deciles)                -> pd.qcut, NOT cut\n#   Get just the bin edges                         -> retbins=True\n#   Treat as categorical                            -> result is Categorical (preserves order)\n#   Out-of-range values                              -> become NaN (use include_lowest if first edge matters)\n#\n# Anti-pattern: pd.cut without watching include_lowest on the boundary\n#   By default cut excludes the LOWER edge of the first bin: pd.cut([0,1,2], bins=[0,1,2])\n#   gives [NaN, (0,1], (1,2]]. Use include_lowest=True if 0 should fall in the\n#   first bin, or set the leftmost edge to -inf for safety."
                  }
        ],
        tips: [
                  "`right=True` (default) means intervals are `(left, right]` — a score of exactly 90 falls in the 80-90 bin",
                  "`retbins=True` returns the actual bin edges — useful when you let pandas choose them",
                  "Convert to ordered categorical for correct sorting and comparison operators",
                  "`observed=True` in `groupby()` skips empty bin combinations",
                  "Persist the bin edges alongside the model — redefining bins per dataset silently regrades the same observation across splits"
        ],
        mistake: "Using `pd.cut()` when you want equal population per bin. `pd.cut()` gives equal-width intervals — some bins may be nearly empty. Use `pd.qcut()` for equal-frequency bins.",
        shorthand: {
          verbose: "import pandas as pd\ndf['age_group'] = pd.cut(\ndf['age'],\nbins   = [0, 18, 35, 60, 100],",
          concise: "df.groupby('grade', observed=True)['salary'].mean()",
        },
      },
      {
        id: "qcut",
        fn: "pd.qcut()",
        desc: "Bin continuous data into equal-frequency quantile-based intervals.",
        category: "Transform",
        subtitle: "Each bin gets the same number of observations",
        signature: "pd.qcut(series, q=4, labels=[\"Q1\",\"Q2\",\"Q3\",\"Q4\"])",
        descLong: "pd.qcut() bins by quantile — each bin contains approximately the same number of observations. Use it for percentile-based grouping, decile scoring, and rankings. Unlike pd.cut(), the bin edges are determined by the data distribution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pd.qcut() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             gets the same number of observations.\n#             \"decile-rank\" tasks; one call.\n#             qcut decision rule.\n#\nimport pandas as pd\ndf[\"quartile\"] = pd.qcut(df[\"score\"], q=4, labels=[\"Q1\", \"Q2\", \"Q3\", \"Q4\"])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pd.qcut() — common patterns you'll see in production.\n# APPROACH  - Combine pd.qcut() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             intervals, duplicates=\"drop\" for tied values, and\n#             retbins to surface the actual quantile boundaries.\n#             is the fix for the most common qcut error (too many\n#             ties on a boundary).\n#             continuous percentile rank with no binning) or\n#             address the \"fit on train, apply to test\" production\n#             pattern — senior tier.\n#\nimport pandas as pd\n# Deciles\ndf[\"decile\"] = pd.qcut(df[\"score\"], q=10,\n                        labels=[f\"D{i}\" for i in range(1, 11)])\n# Raw percentile intervals (no labels) — useful for diagnostics\ndf[\"pct_bin\"] = pd.qcut(df[\"score\"], q=100)\n# Tied values land on a bin edge -> qcut can fail. duplicates=\"drop\"\n# silently merges adjacent edges to make it work.\ndf[\"q\"] = pd.qcut(df[\"score\"], q=4, duplicates=\"drop\")\n# Recover the actual quantile boundaries qcut chose\n_, edges = pd.qcut(df[\"score\"], q=4, retbins=True)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pd.qcut() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             apply to test (consistent buckets across data\n#             splits), prefer rank(pct=True) when you want a\n#             continuous percentile rather than discrete bins,\n#             and use the cut-vs-qcut rule deliberately.\n#             flows in; rank(pct=True) avoids tie-edge headaches\n#             entirely; the decision rule clarifies which tool\n#             belongs to each problem.\n#             edges (artifact infrastructure); rank() returns a\n#             continuous value, not a categorical bucket;\n#             duplicates=\"drop\" produces FEWER bins than asked\n#             for, which can surprise downstream code.\n#\nimport pandas as pd\nimport numpy as np\nimport json\n# 1. Fit qcut edges on TRAIN, apply to TEST with pd.cut\n_, train_edges = pd.qcut(train[\"score\"], q=10, retbins=True, duplicates=\"drop\")\nlabels = [f\"D{i}\" for i in range(1, len(train_edges))]\nwith open(\"artifacts/score_deciles.json\", \"w\") as f:\n    json.dump({\"edges\": train_edges.tolist(), \"labels\": labels}, f)\n# At inference / on test data — use cut() with the saved edges\nspec = json.load(open(\"artifacts/score_deciles.json\"))\ntest[\"decile\"] = pd.cut(test[\"score\"],\n                         bins=spec[\"edges\"],\n                         labels=spec[\"labels\"],\n                         include_lowest=True)\n# 2. Continuous percentile rank — sometimes better than discrete bins\ndf[\"pct_rank\"] = df[\"score\"].rank(pct=True)            # in [0, 1]\ndf[\"top_decile\"] = df[\"pct_rank\"] >= 0.9\n# 3. Ties and duplicates — pick the right strategy\n#    duplicates=\"raise\" - default; explodes on tie-heavy data\n#    duplicates=\"drop\"  - silently merges -> fewer than q bins\n#    Better: rank-then-bin\ndf[\"score_dense\"] = df[\"score\"].rank(method=\"first\")   # break ties by row order\ndf[\"q4\"] = pd.qcut(df[\"score_dense\"], q=4,\n                    labels=[\"Q1\", \"Q2\", \"Q3\", \"Q4\"])\n# Decision rule:\n#   need DISCRETE buckets, equal counts per bin    -> qcut(q=)\n#   need DISCRETE buckets, equal width per bin     -> cut(bins=)\n#   need CONTINUOUS percentile / rank score        -> rank(pct=True)\n#   need stable buckets across data splits         -> qcut on train,\n#                                                     persist edges,\n#                                                     cut on test\n# Anti-pattern: pd.qcut on a column with many ties at the boundary\n#   qcut tries to make equal-count bins, but ties cluster and can throw\n#   \"Bin edges must be unique\". Pass duplicates=\"drop\" to merge collapsed bins,\n#   or rank the data first (s.rank(method=\"first\")). Choose deliberately —\n#   \"drop\" silently reduces the number of returned categories."
                  }
        ],
        tips: [
                  "`pd.qcut()` is correct for percentile-based scoring — `pd.cut()` can leave bins nearly empty",
                  "`duplicates=\"drop\"` handles datasets where many values are identical (common in integer scores)",
                  "The bin labels do not indicate how many obs are in each bin — use `value_counts()` to check",
                  "For a running percentile rank without binning: `df[\"score\"].rank(pct=True)`",
                  "For stable buckets across train/test splits, qcut on train, persist the returned `retbins=` edges, then pd.cut on test — re-fitting per split silently re-grades observations"
        ],
        mistake: "Using `pd.qcut()` on a column with many duplicate values. If too many values fall on the same quantile boundary, qcut raises ValueError. Use `duplicates=\"drop\"` to handle this.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
    ],
  },
]

export default { meta, sections }
