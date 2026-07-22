export const meta = {
  "title": "Tidyverse",
  "domain": "r",
  "sheet": "tidyverse",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: Tidyverse ─────────────────────────────────────────
  {
    id: "r-tidyverse",
    title: "Tidyverse",
    entries: [
      {
        id: "dplyr-core-verbs",
        fn: "filter / select / mutate / arrange",
        desc: "The four core dplyr verbs for row, column, computed, and sorted operations.",
        category: "dplyr",
        subtitle: "The grammar of data manipulation",
        signature: "filter() | select() | mutate() | arrange() | %>% pipe",
        descLong: "dplyr provides a grammar of data manipulation. Five core verbs: filter (rows), select (columns), mutate (new columns), arrange (sort), summarise (aggregate). The pipe `%>%` (or native `|>`) chains operations. All verbs work with data frames and tibbles.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of filter / select / mutate / arrange — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(dplyr)\ndf <- tibble(\n  name   = c(\"Alice\",\"Bob\",\"Carol\",\"Dave\",\"Eve\"),\n  dept   = c(\"IT\",\"HR\",\"IT\",\"Finance\",\"IT\"),\n  salary = c(85000,62000,92000,78000,71000),\n  years  = c(5, 3, 8, 6, 2)\n)\n# ── filter — subset rows ────────────────────────────────\ndf %>% filter(dept == \"IT\")\ndf %>% filter(salary > 75000, dept != \"HR\")   # AND\ndf %>% filter(dept %in% c(\"IT\", \"Finance\"))   # IN\ndf %>% filter(between(salary, 70000, 90000))  # range"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of filter / select / mutate / arrange — common patterns you'll see in production.\n# APPROACH  - Combine filter / select / mutate / arrange with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── select — subset columns ────────────────────────────\ndf %>% select(name, salary)\ndf %>% select(-dept)            # drop dept\ndf %>% select(starts_with(\"s\")) # salary\ndf %>% select(where(is.numeric))# numeric cols only\ndf %>% select(name, everything()) # move name first\n# ── mutate — add/transform columns ─────────────────────\ndf %>% mutate(\n  bonus     = salary * 0.15,\n  total     = salary + bonus,\n  seniority = case_when(\n    years >= 7 ~ \"Senior\",\n    years >= 4 ~ \"Mid\",\n    TRUE       ~ \"Junior\"\n  )\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of filter / select / mutate / arrange — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── arrange — sort rows ─────────────────────────────────\ndf %>% arrange(salary)            # ascending\ndf %>% arrange(desc(salary))      # descending\ndf %>% arrange(dept, desc(salary)) # multi-key sort\n# ── slice — positional row selection ───────────────────\ndf %>% slice(1:3)         # first 3 rows\ndf %>% slice_max(salary, n=2)  # top 2 by salary\ndf %>% slice_min(years, n=1)   # least experienced"
                  }
        ],
        tips: [
                  "The **native pipe** `|>` (R 4.1+) works without loading magrittr — prefer it for new code",
                  "`case_when()` is the dplyr equivalent of nested ifelse — far more readable for 3+ conditions",
                  "`across()` applies a function to multiple columns: `mutate(across(where(is.numeric), scale))`",
                  "`.data[[var]]` or `{{var}}` allows programming with dplyr inside functions (tidy evaluation)"
        ],
        mistake: "Using `filter(df, ...)` instead of `df %>% filter(...)`. Both work, but chains become unreadable without the pipe. Embrace the pipe — it reads left-to-right like a sentence.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "dplyr-group-summarise",
        fn: "group_by / summarise / across",
        desc: "Split-apply-combine: aggregate data by groups.",
        category: "dplyr",
        subtitle: "Compute group statistics and apply functions to multiple columns",
        signature: "group_by(col) %>% summarise(stat=fn(col))",
        descLong: "group_by + summarise is R's split-apply-combine paradigm. Group the data, apply aggregation functions, combine results. n() counts rows. across() applies functions to multiple columns at once. Always ungroup() after when needed downstream.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of group_by / summarise / across — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(dplyr)\n# ── group_by + summarise ───────────────────────────────\ndf %>%\n  group_by(dept) %>%\n  summarise(\n    n          = n(),\n    mean_sal   = mean(salary),\n    median_sal = median(salary),\n    max_sal    = max(salary),\n    sd_sal     = sd(salary),\n    .groups    = \"drop\"   # ungroup after\n  )\n# dept    n  mean_sal  median_sal  max_sal  sd_sal\n# Finance 1  78000     78000       78000    NA\n# HR      1  62000     62000       62000    NA\n# IT      3  82667     85000       92000    10693"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of group_by / summarise / across — common patterns you'll see in production.\n# APPROACH  - Combine group_by / summarise / across with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Multiple grouping variables ─────────────────────────\ndf %>%\n  group_by(dept, seniority) %>%\n  summarise(avg_salary = mean(salary), n=n(),\n            .groups=\"drop\")\n# ── across — apply to multiple columns ─────────────────\ndf %>%\n  group_by(dept) %>%\n  summarise(across(c(salary, years), list(\n    mean = mean,\n    sd   = sd\n  )))\n# Creates: salary_mean, salary_sd, years_mean, years_sd\n# across with where (select by type):\ndf %>%\n  mutate(across(where(is.numeric), ~ round(.x, 2)))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of group_by / summarise / across — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── count / tally ─────────────────────────────────────\ndf %>% count(dept)             # n rows per dept\ndf %>% count(dept, sort=TRUE)  # sorted descending\ndf %>% add_count(dept)         # adds n column to each row\n# ── Window functions (within groups) ──────────────────\ndf %>%\n  group_by(dept) %>%\n  mutate(\n    rank_in_dept = rank(desc(salary)),\n    pct_of_dept  = salary / sum(salary),\n    running_avg  = cummean(salary)\n  )"
                  }
        ],
        tips: [
                  "`.groups='drop'` in summarise avoids the 'grouped output' message and ungroups automatically",
                  "`n()` counts rows in group; `n_distinct(col)` counts unique values",
                  "`~ .x` is a purrr-style lambda — `across(where(is.numeric), ~ .x * 2)` doubles all numeric cols",
                  "Use `add_count()` or `mutate(n=n())` to add group count to each row without collapsing"
        ],
        mistake: "Forgetting to ungroup() after grouped operations. Subsequent operations continue operating within groups, causing unexpected results. Use `.groups='drop'` in summarise or call `ungroup()` explicitly.",
        shorthand: {
          verbose: "groups <- split(df, df$group)\nresults <- data.frame()\nfor (g in groups) {\n  results <- rbind(results, data.frame(group=g$group[1], mean=mean(g$value)))\n}",
          concise: "results <- df |> group_by(group) |> summarise(mean = mean(value))",
        },
      },
      {
        id: "dplyr-joins",
        fn: "Joins in dplyr",
        desc: "Combine data frames by matching keys.",
        category: "dplyr",
        subtitle: "left_join, inner_join, full_join, anti_join",
        signature: "left_join(x, y, by='key')  |  anti_join(x, y, by='key')",
        descLong: "dplyr's join functions mirror SQL joins. left_join keeps all x rows. inner_join keeps only matched rows. full_join keeps all rows from both. anti_join finds rows in x with NO match in y — great for finding unmatched records. semi_join filters x to rows with a match in y.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Joins in dplyr — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(dplyr)\nemployees <- tibble(\n  id   = c(1,2,3,4),\n  name = c(\"Alice\",\"Bob\",\"Carol\",\"Dave\")\n)\ndepts <- tibble(\n  id   = c(1,2,3,5),     # 4=Dave not present, 5=extra\n  dept = c(\"IT\",\"HR\",\"IT\",\"Finance\")\n)\n# ── left_join — keep all from left ─────────────────────\nleft_join(employees, depts, by=\"id\")\n# id  name   dept\n# 1   Alice  IT\n# 2   Bob    HR\n# 3   Carol  IT\n# 4   Dave   NA   ← Dave has no dept match"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Joins in dplyr — common patterns you'll see in production.\n# APPROACH  - Combine Joins in dplyr with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── inner_join — only matched rows ─────────────────────\ninner_join(employees, depts, by=\"id\")\n# 3 rows (Dave dropped, id=5 dropped)\n# ── full_join — all rows from both ────────────────────\nfull_join(employees, depts, by=\"id\")\n# 5 rows (Dave with NA dept + id=5 with NA name)\n# ── anti_join — rows with NO match ─────────────────────\nanti_join(employees, depts, by=\"id\")\n# id=4 Dave  (no dept)\nanti_join(depts, employees, by=\"id\")\n# id=5 Finance  (no employee)\n# ── semi_join — filter to matched rows ─────────────────\nsemi_join(employees, depts, by=\"id\")\n# Only employees that HAVE a dept (no dept column added)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Joins in dplyr — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Joining on different key names ────────────────────\nleft_join(employees, depts, by=c(\"id\"=\"emp_id\"))\n# ── Multiple keys ─────────────────────────────────────\nleft_join(orders, prices,\n          by=c(\"product_id\", \"year\"))"
                  }
        ],
        tips: [
                  "**anti_join** is essential for data quality checks — find orphaned records, missing lookups",
                  "When key names differ: `by=c('local_name'='remote_name')`",
                  "Many-to-many joins create row explosion — check with `nrow()` before and after",
                  "Use `distinct()` on the lookup table before joining to avoid accidental row multiplication"
        ],
        mistake: "Joining without checking for duplicate keys first. If `depts` has two rows for id=1, a left_join will duplicate Alice — one row per matching dept. Always check: `depts %>% count(id) %>% filter(n>1)` before joining.",
        shorthand: {
          verbose: "SELECT a.id, a.name, b.value\nFROM table_a a\nINNER JOIN table_b b\n  ON a.id = b.a_id\nWHERE b.active = 1",
          concise: "SELECT a.id, a.name, b.value FROM table_a a JOIN table_b b ON a.id = b.a_id WHERE b.active = 1",
        },
      },
      {
        id: "tidyr-pivot",
        fn: "pivot_longer / pivot_wider",
        desc: "Reshape data between wide and long (tidy) formats.",
        category: "tidyr",
        subtitle: "Wide → Long for analysis; Long → Wide for display",
        signature: "pivot_longer(cols, names_to, values_to)\npivot_wider(names_from, values_from)",
        descLong: "Tidy data: each variable is a column, each observation is a row, each cell is one value. pivot_longer converts wide to tidy long format. pivot_wider converts long to wide format. This replaces the older gather/spread functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pivot_longer / pivot_wider — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidyr)\nlibrary(dplyr)\n# ── WIDE format (untidy) ───────────────────────────────\nwide <- tibble(\n  name = c(\"Alice\",\"Bob\",\"Carol\"),\n  Q1   = c(1200, 980, 1500),\n  Q2   = c(1450, 1100, 1600),\n  Q3   = c(1800, 1300, 1750)\n)\n# ── pivot_longer: wide → long ─────────────────────────\nlong <- wide %>%\n  pivot_longer(\n    cols      = c(Q1, Q2, Q3),  # or: starts_with(\"Q\")\n    names_to  = \"quarter\",\n    values_to = \"sales\"\n  )\n# name   quarter  sales\n# Alice  Q1       1200\n# Alice  Q2       1450\n# Alice  Q3       1800\n# Bob    Q1        980\n# ... (9 rows total)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pivot_longer / pivot_wider — common patterns you'll see in production.\n# APPROACH  - Combine pivot_longer / pivot_wider with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── pivot_wider: long → wide ────────────────────────────\nlong %>%\n  pivot_wider(\n    names_from  = quarter,\n    values_from = sales\n  )\n# Back to original wide format\n# ── Multiple value columns ─────────────────────────────\n# If there are sales AND units columns:\nlong2 %>%\n  pivot_wider(\n    names_from  = quarter,\n    values_from = c(sales, units)\n  )\n# Creates: sales_Q1, sales_Q2, units_Q1, units_Q2, ..."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pivot_longer / pivot_wider — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── separate / unite ───────────────────────────────────\ntibble(date_dept = c(\"2024-IT\",\"2024-HR\")) %>%\n  separate(date_dept, into=c(\"year\",\"dept\"), sep=\"-\")\ntibble(year=\"2024\", month=\"01\", day=\"15\") %>%\n  unite(\"date\", year, month, day, sep=\"-\")\n# \"2024-01-15\""
                  }
        ],
        tips: [
                  "**Long format** is required for ggplot2, dplyr group_by/summarise, and most statistical models",
                  "`cols` in pivot_longer accepts tidyselect helpers: `starts_with()`, `ends_with()`, `where(is.numeric)`",
                  "`names_pattern` argument in pivot_longer handles complex column names like 'sales_Q1_2024'",
                  "Use `values_fill=0` to replace NA with 0 when pivoting wider and some combinations don't exist"
        ],
        mistake: "Trying to plot multiple quarterly columns in ggplot2 from wide format. ggplot2 needs long format — one row per data point. Always pivot_longer before plotting repeated measurements.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "tidyr-missing",
        fn: "Handling Missing Data",
        desc: "Detect, remove, impute, and understand missing values.",
        category: "tidyr",
        subtitle: "NA patterns, complete cases, and imputation strategies",
        signature: "is.na()  |  na.omit()  |  replace_na()  |  fill()",
        descLong: "Missing data in R is represented as NA (Not Available). The type of missingness matters: MCAR (missing completely at random), MAR (missing at random — depends on observed data), MNAR (missing not at random — depends on the missing value itself). The mechanism determines valid imputation strategies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Handling Missing Data — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidyr)\nlibrary(dplyr)\ndf <- tibble(\n  id     = 1:6,\n  score  = c(88, NA, 72, NA, 91, 85),\n  group  = c(\"A\", \"A\", \"B\", NA, \"B\", \"A\")\n)\n# ── Detect missing ─────────────────────────────────────\nis.na(df$score)              # T/F vector\nsum(is.na(df$score))         # count: 2\ncolSums(is.na(df))           # NAs per column\nmean(is.na(df$score))        # proportion: 0.333\n# ── Complete cases ─────────────────────────────────────\nna.omit(df)                  # remove any row with NA\ndf[complete.cases(df), ]     # same\ndf %>% drop_na()             # tidyr equivalent\ndf %>% drop_na(score)        # only drop if score is NA"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Handling Missing Data — common patterns you'll see in production.\n# APPROACH  - Combine Handling Missing Data with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Replace / fill ─────────────────────────────────────\ndf %>% replace_na(list(score=0, group=\"Unknown\"))\n# Forward fill (carry last obs forward):\ndf %>% fill(score, .direction=\"down\")\n# 88, 88, 72, 72, 91, 85\n# Backward fill:\ndf %>% fill(group, .direction=\"up\")\n# ── Imputation strategies ─────────────────────────────\n# Mean imputation (simple, biases variance downward):\ndf %>% mutate(score = ifelse(is.na(score), mean(score, na.rm=TRUE), score))\n# Group mean imputation:\ndf %>%\n  group_by(group) %>%\n  mutate(score = ifelse(is.na(score),\n                        mean(score, na.rm=TRUE),\n                        score))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Handling Missing Data — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Multiple imputation: mice package\n# library(mice)\n# imputed <- mice(df, m=5, method='pmm')\n# complete(imputed, 1)  # use one imputed dataset"
                  }
        ],
        tips: [
                  "Always investigate WHY data is missing before deciding how to handle it — mechanism matters",
                  "**Mean imputation** is simple but wrong: it reduces variance and distorts relationships",
                  "`fill()` is perfect for time series with forward-carry values (last observation carried forward)",
                  "Multiple imputation (mice package) is the gold standard when data is MAR — generates multiple complete datasets"
        ],
        mistake: "Using na.omit() without understanding why values are missing. If missingness is related to the outcome (MNAR), complete-case analysis introduces bias. Investigate the missing data pattern first.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-stringr",
        fn: "stringr — String Manipulation",
        desc: "Consistent, readable string functions with str_* prefix.",
        category: "R Strings",
        subtitle: "Detect, extract, replace, split, and pad strings",
        signature: "str_detect() | str_extract() | str_replace() | str_c()",
        descLong: "The stringr package provides consistent string functions — all prefixed with str_, all taking the string as first argument (pipe-friendly). Uses ICU regular expressions. Replaces confusing base R functions (grep, gsub, substr) with readable alternatives.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of stringr — String Manipulation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(stringr)\nx <- c(\"Alice Smith\", \"Bob Jones\", \"Carol Williams\")\n# ── Detect / match ─────────────────────────────────────\nstr_detect(x, \"Alice\")      # TRUE FALSE FALSE\nstr_starts(x, \"B\")           # FALSE TRUE FALSE\nstr_ends(x, \"s\")             # TRUE TRUE FALSE\nsum(str_detect(x, \"l\"))      # 2  (count matches)\nx[str_detect(x, \"l\")]        # filter matching strings\n# ── Extract ────────────────────────────────────────────\nstr_extract(x, \"[A-Z][a-z]+\")   # first name\nstr_extract_all(x, \"[A-Z][a-z]+\") # list of all words\nstr_sub(x, 1, 5)                # first 5 chars\nstr_sub(x, -5, -1)              # last 5 chars"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of stringr — String Manipulation — common patterns you'll see in production.\n# APPROACH  - Combine stringr — String Manipulation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Replace ────────────────────────────────────────────\nstr_replace(x, \" \", \"_\")       # first space → underscore\nstr_replace_all(x, \" \", \"_\")   # all spaces → underscore\nstr_remove(x, \" Smith\")        # remove pattern\nstr_remove_all(x, \"[aeiou]\")    # remove all vowels\n# ── Split / combine ────────────────────────────────────\nstr_split(x, \" \")              # list of vectors\nstr_split_fixed(x, \" \", n=2)   # matrix, n parts\nstr_c(\"Mr.\", x, sep=\" \")       # concatenate\nstr_c(x, collapse=\", \")         # collapse vector\nglue::glue(\"Hello {name}!\")     # string interpolation"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of stringr — String Manipulation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Case / padding / trimming ──────────────────────────\nstr_to_upper(x)               # ALICE SMITH ...\nstr_to_lower(x)               # alice smith ...\nstr_to_title(x)               # Already Title Case\nstr_pad(\"42\", width=6, pad=\"0\")  # \"000042\"\nstr_trim(\" hello \")            # \"hello\"\nstr_squish(\"  too  many   spaces \") # \"too many spaces\"\nstr_length(x)                 # 11 9 14"
                  }
        ],
        tips: [
                  "All str_* functions follow tidy principles — string first, then pattern, vectorized by default",
                  "`str_detect()` + `filter()` is the R idiom for regex-filtering rows: `df %>% filter(str_detect(name, 'Smith'))`",
                  "Use `str_glue()` or `glue::glue()` for string interpolation — much cleaner than paste()",
                  "`str_extract()` returns NA for non-matches; `str_extract_all()` returns character(0) — handle with `lengths() > 0`"
        ],
        mistake: "Using base R `gsub()` and `grep()` instead of stringr. They work but have inconsistent argument order and return types. stringr is consistent, readable, and pipe-friendly.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-lubridate",
        fn: "lubridate — Date & Time",
        desc: "Parse, manipulate, and compute with dates and datetimes.",
        category: "R Dates",
        subtitle: "ymd(), duration, interval, floor_date — intuitive date arithmetic",
        signature: "ymd('2024-01-15')  |  today()  |  difftime()  |  floor_date()",
        descLong: "lubridate makes date-time parsing and arithmetic intuitive. Parser functions (ymd, mdy, dmy) automatically parse common formats. Period arithmetic adds calendar units. Duration arithmetic adds fixed seconds. Intervals span two time points.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of lubridate — Date & Time — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(lubridate)\n# ── Parsing dates ──────────────────────────────────────\nymd(\"2024-01-15\")         # 2024-01-15\nmdy(\"01/15/2024\")         # 2024-01-15\ndmy(\"15-Jan-2024\")         # 2024-01-15\nymd_hms(\"2024-01-15 09:30:00\")  # datetime\nas_date(\"2024-01-15\")     # from character\nas_datetime(1705312200)   # from Unix timestamp\n# ── Extract components ─────────────────────────────────\nd <- ymd(\"2024-07-04\")\nyear(d)    # 2024\nmonth(d)   # 7\nmonth(d, label=TRUE)  # Jul\nday(d)     # 4\nwday(d)    # 5  (1=Sunday)\nwday(d, label=TRUE)  # Thu\nweek(d)    # 27  (week of year)\nquarter(d) # 3"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of lubridate — Date & Time — common patterns you'll see in production.\n# APPROACH  - Combine lubridate — Date & Time with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Arithmetic ─────────────────────────────────────────\nd + days(30)           # 30 days later\nd + months(3)          # 3 months later (calendar months)\nd + years(1)           # exactly 1 year later\nd - weeks(2)           # 2 weeks earlier\ntoday() - ymd(\"1990-06-15\")  # difftime in days\ntime_length(today()-ymd(\"1990-06-15\"), \"years\")  # 33.x\n# ── Rounding ───────────────────────────────────────────\nfloor_date(d, \"month\")    # 2024-07-01\nceil_date(d, \"month\")     # 2024-08-01\nround_date(d, \"week\")     # nearest week\n# ── Sequences ──────────────────────────────────────────\nseq(ymd(\"2024-01-01\"), ymd(\"2024-12-31\"), by=\"month\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of lubridate — Date & Time — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Business days (with bizdays package) ───────────────\n# Or manually:\nbiz_days <- seq(ymd(\"2024-01-01\"), ymd(\"2024-03-31\"), by=\"day\")\nbiz_days <- biz_days[!wday(biz_days) %in% c(1,7)]  # no Sun/Sat"
                  }
        ],
        tips: [
                  "`months(1)` adds 1 calendar month (variable length); `dmonths(1)` adds exactly 30.44 days",
                  "`%within%` checks if a date falls in an interval: `d %within% interval(start, end)`",
                  "Always specify timezone for datetimes: `ymd_hms('2024-01-15 09:30:00', tz='America/New_York')`",
                  "`floor_date(d, 'month')` is the lubridate way to get first of the month — much cleaner than date arithmetic"
        ],
        mistake: "Adding `months(1)` and expecting fixed-length months. months(1) adds a calendar month: Jan 31 + months(1) = Feb 28 (not March 2). Use `dmonths(1)` for exactly 30.44 days if you need fixed duration.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-apply-purrr",
        fn: "apply family & purrr::map",
        desc: "Apply functions over vectors, lists, and data frames without explicit loops.",
        category: "R Functional",
        subtitle: "lapply, sapply, vapply, tapply — and the purrr alternatives",
        signature: "lapply(x, f)  |  map(x, f)  |  map_dbl(x, f)",
        descLong: "The apply family applies functions over data structures. lapply always returns a list. sapply simplifies the result. vapply is like sapply but with type checking — safer for production. The purrr package provides a more consistent and type-safe alternative with map, map_dbl, map_chr etc.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of apply family & purrr::map — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(purrr)\nlibrary(dplyr)\n# ── Base R apply family ───────────────────────────────\n# lapply: list → list\nlapply(1:5, function(x) x^2)\n# list(1, 4, 9, 16, 25)\n# sapply: list → vector (tries to simplify)\nsapply(1:5, function(x) x^2)\n# 1 4 9 16 25\n# vapply: type-safe sapply\nvapply(1:5, function(x) x^2, numeric(1))\n# numeric(1) declares expected output type per element\n# apply: matrix row/col operations\nm <- matrix(1:12, 3, 4)\napply(m, 1, sum)   # row sums: 22 26 30\napply(m, 2, mean)  # col means: 2 5 8 11"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of apply family & purrr::map — common patterns you'll see in production.\n# APPROACH  - Combine apply family & purrr::map with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# tapply: apply by group (like group_by + summarise)\ntapply(df$salary, df$dept, mean)\n# ── purrr::map family ─────────────────────────────────\n# Returns list:\nmap(1:5, ~.x^2)\n# Type-specific (safer):\nmap_dbl(1:5, ~.x^2)    # numeric vector\nmap_chr(1:5, ~paste0(\"item_\", .x))  # character vector\nmap_lgl(1:5, ~.x > 3)  # logical vector\nmap_df(list_of_dfs, ~.x)  # bind rows to data frame\n# Lambda syntax: ~ formula or \\(x) function (R 4.1+)\nmap_dbl(1:5, ~sqrt(.x))    # ~ shorthand\nmap_dbl(1:5, \\(x) sqrt(x)) # native lambda"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of apply family & purrr::map — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# map2: two inputs in parallel\nmap2_dbl(c(1,2,3), c(4,5,6), ~.x + .y)  # 5 7 9\n# pmap: multiple inputs\npmap_dbl(list(a=1:3, b=4:6, c=7:9),\n         function(a,b,c) a+b+c)  # 12 15 18\n# walk: for side effects (printing, saving), discards output\nwalk(plots, ~ggsave(..file, .x))"
                  }
        ],
        tips: [
                  "Prefer `map_dbl/chr/lgl` over `sapply` — they fail loudly if types don't match instead of silently returning wrong types",
                  "The `~` lambda in purrr: `.x` is first arg, `.y` is second arg, `..1`, `..2` for pmap",
                  "`map_df()` is like `do.call(rbind, lapply(...))` but cleaner — combines list of data frames by rows",
                  "`possibly()` and `safely()` wrap functions to handle errors gracefully: `map(urls, possibly(read_csv, NULL))`"
        ],
        mistake: "Using `sapply()` in production code. If the function returns different lengths for different inputs, sapply returns a list instead of a vector — silently. Use `vapply()` or `map_*()` for type-safe iteration.",
        shorthand: {
          verbose: "results <- list()\nfor (i in seq_along(data)) {\n  results[[i]] <- function(data[[i]])\n}\nresults <- unlist(results)",
          concise: "results <- lapply(data, function)",
        },
      },
      {
        id: "purrr-map-functions",
        fn: "purrr: map, map_dbl, map_df, map2, pmap",
        desc: "Consistent functional programming with type-specific variants.",
        category: "purrr",
        subtitle: "Type-safe iteration with map family",
        signature: "map(x, f)  |  map_dbl(x, f)  |  map_df(x, f)",
        descLong: "purrr provides a consistent functional programming interface. map() returns a list. map_dbl/chr/lgl/int return typed vectors. map_df binds results into a data frame. The ~ formula syntax creates inline lambdas. Always prefer purrr over sapply in new code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of purrr: map, map_dbl, map_df, map2, pmap — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(purrr)\n# ── map: always returns list ───────────────────────────────\nmap(1:5, ~.x^2)       # list(1, 4, 9, 16, 25)\nmap(c('a','b','c'), ~paste0(.x, '!'))\n# ── map_dbl: return numeric vector ────────────────────────\nmap_dbl(1:5, ~.x^2)   # c(1, 4, 9, 16, 25)\nmap_dbl(list(a=1:3, b=4:6), ~mean(.x))  # names preserved\n# ── map_chr: return character vector ──────────────────────\nmap_chr(1:3, ~paste0('item_', .x))  # 'item_1' 'item_2' 'item_3'\n# ── map_lgl: return logical vector ────────────────────────\nmap_lgl(1:5, ~.x > 3)   # FALSE FALSE FALSE TRUE TRUE\n# ── map_df: bind rows ───────────────────────────────────────\nmap_df(1:3, ~data.frame(x=.x, y=.x^2))\n#   x  y\n# 1 1  1\n# 2 2  4\n# 3 3  9"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of purrr: map, map_dbl, map_df, map2, pmap — common patterns you'll see in production.\n# APPROACH  - Combine purrr: map, map_dbl, map_df, map2, pmap with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Multiple inputs: map2 ──────────────────────────────────\nmap2_dbl(c(1,2,3), c(10,20,30), ~.x + .y)  # 11 22 33\nmap2_chr(c('a','b'), c('x','y'), ~paste0(.x, '-', .y))\n# ── Multiple inputs: pmap ──────────────────────────────────\npmap_dbl(list(x=1:3, y=4:6, z=7:9), ~.x + .y + .z)\n# Or with a data frame:\ndf <- data.frame(x=1:3, y=4:6, z=7:9)\npmap_dbl(df, ~.x + .y + .z)\n# ── Legacy syntax: function() instead of ~ ────────────────\nmap_dbl(1:5, function(x) x^2)  # same as ~.x^2\n# ── Nested map ────────────────────────────────────────────\n# Map over each element, then each sub-element\nnested <- list(a=list(1,2,3), b=list(4,5,6))\nmap(nested, ~map_dbl(.x, sqrt))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of purrr: map, map_dbl, map_df, map2, pmap — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Combining: map_if, map_at ──────────────────────────────\n# Apply function only to certain elements\nmap_if(1:5, ~.x%%2==0, ~.x*10)\n# [[1]] 1  [[2]] 20  [[3]] 3  [[4]] 40  [[5]] 5"
                  }
        ],
        tips: [
                  "map_dbl/chr/lgl fail if result doesn't match type — this is a feature (catch errors early)",
                  "Use map() when result type varies; map_* when all results are the same type",
                  "~ lambda syntax: .x = first arg, .y = second arg (in map2), ..1 ..2 in pmap",
                  "map_df() returns a data frame — great for collecting results from API calls or simulations"
        ],
        mistake: "Using sapply with purrr functions. Just use purrr — it's consistent and type-safe. sapply + purrr conflicts cause hidden bugs.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "purrr-reduce-accumulate",
        fn: "purrr: reduce, accumulate, walk, compose",
        desc: "Accumulate values, iterate for side effects, compose functions.",
        category: "purrr",
        subtitle: "reduce (fold), accumulate (running total), walk (side effects)",
        signature: "reduce(x, f)  |  accumulate(x, f)  |  walk(x, f)",
        descLong: "reduce() applies a binary function cumulatively across a vector. accumulate() returns intermediate values (running total). walk() runs a function for side effects and returns input invisibly. compose() chains functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of purrr: reduce, accumulate, walk, compose — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(purrr)\n# ── reduce: fold / foldl ──────────────────────────────────────\n# Cumulative binary function across a vector → single value\nreduce(1:4, ~.x + .y)              # 10 (sum all)\nreduce(1:4, ~.x * .y)              # 24 (product all)\nreduce(list(c(1,2), c(3,4)), ~c(.x, .y))  # concatenate all lists\n# ── accumulate: running totals ────────────────────────────────\n# Like reduce, but returns all intermediate values\naccumulate(1:5, ~.x + .y)          # 1 3 6 10 15\naccumulate(1:4, ~.x * .y)          # 1 2 6 24\naccumulate(letters[1:4], ~paste0(.x, .y))  # 'a' 'ab' 'abc' 'abcd'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of purrr: reduce, accumulate, walk, compose — common patterns you'll see in production.\n# APPROACH  - Combine purrr: reduce, accumulate, walk, compose with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── walk: side effects only ───────────────────────────────────\n# Run function for side effects, return input invisibly"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of purrr: reduce, accumulate, walk, compose — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nwalk(1:3, ~cat('Item:', .x, '\\\\n'))\nfiles %>% walk(~write.csv(.x, file=paste0('data_', .y, '.csv')))\n# ── compose: function chaining ────────────────────────────────\nf <- compose(sqrt, round, ~.x * 2)\nf(5)  # round(sqrt(5*2))"
                  }
        ],
        tips: [
                  "reduce is fast for combining data frames: reduce(list_of_dfs, ~merge(.x,.y,by=\"id\"))",
                  "accumulate gives you the intermediate values — reduce discards them",
                  "walk returns input invisibly — use it when you only care about side effects (printing, saving)",
                  "compose chains functions: compose(f, g, h) creates h(g(f(x)))"
        ],
        mistake: "Using reduce when you want the intermediate values. Use accumulate() instead.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "readr-parsing",
        fn: "readr: read_csv, read_delim, type specs",
        desc: "Fast CSV reading with explicit type specifications.",
        category: "readr",
        subtitle: "read_csv, read_tsv, read_delim with cols() specification",
        signature: "read_csv(file, col_types=cols(...))  |  cols(x=col_double(), y=col_date())",
        descLong: "readr is the tidyverse CSV reader. It's faster and has better defaults than base read.csv. Explicit col_types prevent parsing surprises. problems() shows parsing failures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of readr: read_csv, read_delim, type specs — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(readr)\n# ── Basic read ────────────────────────────────────────────\ndf <- read_csv('data.csv')\ndf <- read_tsv('data.tsv')\ndf <- read_delim('data.txt', delim='|')\n# ── Specify column types explicitly ────────────────────────\ndf <- read_csv('data.csv', col_types = cols(\n  id       = col_integer(),\n  name     = col_character(),\n  date     = col_date('%Y-%m-%d'),\n  amount   = col_double(),\n  flag     = col_logical()\n))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of readr: read_csv, read_delim, type specs — common patterns you'll see in production.\n# APPROACH  - Combine readr: read_csv, read_delim, type specs with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Partial specification (guess the rest) ─────────────────\ndf <- read_csv('data.csv', col_types = cols(\n  id = col_integer(),\n  date = col_date(),\n  .default = col_character()  # all others are character\n))\n# ── Check what readr inferred ──────────────────────────────\nproblems(df)  # parsing failures\n# If empty, no problems\n# ── Read subset of columns ────────────────────────────────\ndf <- read_csv('data.csv', col_select = c(name, date, amount))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of readr: read_csv, read_delim, type specs — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Skip rows / read N rows ────────────────────────────────\ndf <- read_csv('data.csv', skip=3, n_max=1000)\n# ── Handle NA values ───────────────────────────────────────\ndf <- read_csv('data.csv', na = c('', 'NA', 'N/A', '-'))\n# ── Different quote/escape ────────────────────────────────\ndf <- read_csv('data.csv', quote = \"'\", escape_double=TRUE)"
                  }
        ],
        tips: [
                  "Specify col_types explicitly — prevents guessing failures on new data",
                  "problems() shows parsing issues — check after each read",
                  "readr is 10× faster than read.csv for large files",
                  "Use col_select to read only the columns you need"
        ],
        mistake: "Not checking problems() after reading. Invalid dates/numbers are silently converted to NA. Always inspect the result.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "tibble-operations",
        fn: "tibble: as_tibble, rownames_to_column, deframe",
        desc: "Modern data frame operations: convert, manipulate row names.",
        category: "tibble",
        subtitle: "Create and manipulate tibbles with nicer defaults",
        signature: "as_tibble(df)  |  rownames_to_column()  |  column_to_rownames()",
        descLong: "Tibbles are modern data frames with better defaults (no auto-factoring, better printing). Convert traditional data frames with as_tibble(). Manage row names with rownames_to_column() and column_to_rownames().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tibble: as_tibble, rownames_to_column, deframe — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tibble)\n# ── Create tibbles ────────────────────────────────────────\ntb <- tibble(\n  x = 1:3,\n  y = c('a', 'b', 'c'),\n  z = x^2\n)\n# ── Convert data.frame to tibble ──────────────────────────\ndf_old <- data.frame(a=1:2, b=3:4)\ndf_tib <- as_tibble(df_old)\n# ── Working with row names ────────────────────────────────\n# Many base R functions return data with row names\n# Convert to column:\ndf_with_rownames <- data.frame(x=1:3, row.names=c('a','b','c'))\ndf_col <- rownames_to_column(df_with_rownames, var='name')"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tibble: as_tibble, rownames_to_column, deframe — common patterns you'll see in production.\n# APPROACH  - Combine tibble: as_tibble, rownames_to_column, deframe with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Convert back:\ndf_rownames <- column_to_rownames(df_col, var='name')\n# ── enframe / deframe ──────────────────────────────────────\n# Convert vector to data frame\nv <- c(alice=10, bob=20, carol=30)\nenframe(v, name='person', value='score')\n#   person score\n#   alice     10\n#   bob       20\n#   carol     30\n# Convert back to named vector:\ndeframe(df)  # if df has exactly 2 columns"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tibble: as_tibble, rownames_to_column, deframe — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── tribble: create by rows ────────────────────────────────\ntribble(\n  ~name,  ~age,\n  'Alice', 30,\n  'Bob',   25,\n  'Carol', 28\n)"
                  }
        ],
        tips: [
                  "tibbles print nicely and don't auto-convert strings to factors",
                  "rownames_to_column() converts rownames to a regular column — often needed before ggplot2",
                  "tribble() is great for small hand-entered data — reads more naturally by row",
                  "enframe() converts named vectors to tidy 2-column data frames"
        ],
        mistake: "Trying to subset a tibble with $ when the column name has spaces. Use [[\"col name\"]] instead.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "forcats-factor-levels",
        fn: "forcats: fct_reorder, fct_relevel, fct_lump",
        desc: "Manipulate factor levels easily for better plots and models.",
        category: "forcats",
        subtitle: "Reorder levels, combine rare categories, reverse order",
        signature: "fct_reorder(f, x)  |  fct_relevel(f, ...)  |  fct_lump(f, n)",
        descLong: "forcats provides functions to reorder, rename, collapse, and manage factor levels. Useful for plots (reorder bars by height) and models (specify reference levels).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of forcats: fct_reorder, fct_relevel, fct_lump — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(forcats)\nlibrary(dplyr)\nlibrary(ggplot2)\n# ── fct_reorder: sort by another variable ────────────────\n# Example: reorder bar chart by height\ndf <- tibble(\n  city = factor(c('NY', 'LA', 'Chicago')),\n  population = c(8.3, 3.9, 2.7)\n)\n# By default, alphabetical: Chicago, LA, NY\n# Reorder by population:\ndf %>%\n  mutate(city = fct_reorder(city, population)) %>%\n  ggplot(aes(city, population)) +\n  geom_col()\n# Now bars in order of population (descending)\n# ── fct_relevel: manually reorder ──────────────────────────\npriority <- c('High', 'Med', 'Low')\npriority_fct <- factor(priority, levels=c('High', 'Med', 'Low'))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of forcats: fct_reorder, fct_relevel, fct_lump — common patterns you'll see in production.\n# APPROACH  - Combine forcats: fct_reorder, fct_relevel, fct_lump with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Reorder:\nfct_relevel(priority_fct, 'Low', 'High', 'Med')  # Low first\n# ── fct_rev: reverse order ────────────────────────────────\nfct_rev(priority_fct)  # Low, Med, High\n# ── fct_infreq: sort by frequency ─────────────────────────\ndf <- tibble(color = factor(c('red','blue','red','red','green')))\ndf %>%\n  mutate(color = fct_infreq(color)) %>%\n  ggplot(aes(color)) +\n  geom_bar()\n# Bars in order of frequency\n# ── fct_lump: combine rare categories ──────────────────────\nproducts <- factor(c('Apple', 'Orange', 'Banana', 'Kiwi', 'Grape', 'Lemon'))\n# Keep top 3, lump rest as \"Other\":\nfct_lump(products, n=3)\n# Apple, Orange, Banana, Other, Other, Other"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of forcats: fct_reorder, fct_relevel, fct_lump — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# By proportion:\nfct_lump(products, prop=0.1)  # keep >10%, lump rest\n# ── fct_collapse: manually combine levels ──────────────────\ncountry <- factor(c('USA', 'Canada', 'Mexico', 'USA'))\nfct_collapse(country,\n  North_America = c('USA', 'Canada', 'Mexico'),\n  Other = 'Mexico'\n)\n# ── fct_recode: rename levels ──────────────────────────────\ngender <- factor(c('M', 'F', 'M', 'F'))\nfct_recode(gender,\n  Male = 'M',\n  Female = 'F'\n)"
                  }
        ],
        tips: [
                  "fct_reorder() is essential for ggplot2 bar charts — orders by y-variable automatically",
                  "fct_lump(n=k) keeps top k categories, lumps rest as \"Other\" — useful for clarity in plots/models",
                  "fct_infreq() sorts by frequency — nice for exploratory plotting",
                  "Use forcats instead of manual factor() calls — code is clearer"
        ],
        mistake: "Reordering factors after creating plots. Reorder before ggplot: `mutate(f = fct_reorder(...)) %>% ggplot()`",
        shorthand: {
          verbose: "// Manual / verbose approach\ngender <- factor(c('M', 'F', 'M', 'F'))\nfct_recode(gender, Male = 'M', Female = 'F')\n// More explicit but longer",
          concise: "fct_recode(gender, Male = 'M', Female = 'F')",
        },
      },
    ],
  },
]

export default { meta, sections }
