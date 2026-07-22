export const meta = {
  "id": "r-tidytools",
  "label": "Tidyverse Tools",
  "icon": "📦",
  "description": "Advanced tidyverse tools: purrr functional programming, stringr text manipulation, lubridate dates, and forcats factors."
}

export const sections = [

  // ── Section 1: purrr — Functional Programming ─────────────────────────────────────────
  {
    id: "purrr",
    title: "purrr — Functional Programming",
    entries: [
      {
        id: "map-variants",
        fn: "map() Variants — Apply Functions Over Lists",
        desc: "Type-stable alternatives to lapply — map_chr, map_dbl, map_int, map_lgl return atomic vectors.",
        category: "purrr",
        subtitle: "map(), map_chr(), map_dbl(), map2(), pmap()",
        signature: "map(.x, .f, ...)  |  map_chr(.x, .f)  |  map2(.x, .y, .f)",
        descLong: "purrr::map() is a type-stable replacement for lapply(). map() always returns a list. map_chr(), map_dbl(), map_int(), map_lgl() return character, double, integer, or logical vectors — and error if the type is wrong. map2() iterates over two vectors in parallel. pmap() iterates over any number of vectors. Use ~ shorthand for anonymous functions: ~.x + 1.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of map() Variants — Apply Functions Over Lists — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(purrr)\n# Basic map — returns a list\nmap(1:5, \\(x) x^2)  # list(1, 4, 9, 16, 25)\n# Type-stable variants — return atomic vectors\nmap_dbl(1:5, \\(x) x^2)   # c(1, 4, 9, 16, 25)\nmap_chr(1:3, \\(x) paste(\"item\", x))  # c(\"item 1\", \"item 2\", \"item 3\")\nmap_lgl(1:5, \\(x) x > 3)  # c(FALSE, FALSE, FALSE, TRUE, TRUE)\n# Formula shorthand (~ is shorthand for anonymous function)\nmap_dbl(1:5, ~ .x^2)  # same as above\n# map over data frame columns\nmtcars |> map_dbl(mean)     # mean of each column\nmtcars |> map_chr(class)    # class of each column\n# Extract elements by name or position\npeople <- list(\n  list(name = \"Alice\", age = 30),\n  list(name = \"Bob\", age = 25),\n  list(name = \"Charlie\", age = 35)\n)\nmap_chr(people, \"name\")   # c(\"Alice\", \"Bob\", \"Charlie\")\nmap_dbl(people, \"age\")    # c(30, 25, 35)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of map() Variants — Apply Functions Over Lists — common patterns you'll see in production.\n# APPROACH  - Combine map() Variants — Apply Functions Over Lists with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# map2 — iterate over two vectors in parallel\nmap2_chr(c(\"Hello\", \"Hi\"), c(\"Alice\", \"Bob\"),\n         \\(greeting, name) paste(greeting, name))\n# c(\"Hello Alice\", \"Hi Bob\")\n# pmap — iterate over any number of arguments\nparams <- list(\n  n = c(10, 20, 30),\n  mean = c(0, 5, 10),\n  sd = c(1, 2, 3)\n)\npmap(params, rnorm)  # 3 vectors of random normals\n# walk — like map but for side effects (returns input invisibly)\nwalk(c(\"plot1.png\", \"plot2.png\"), \\(f) cat(\"Saving\", f, \"\\n\"))\n# imap — iterate with index\nimap_chr(c(\"a\", \"b\", \"c\"), \\(val, idx) paste(idx, val, sep = \": \"))\n# c(\"1: a\", \"2: b\", \"3: c\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of map() Variants — Apply Functions Over Lists — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Safely handle errors\nsafe_log <- safely(log)\nresults <- map(list(10, -1, \"a\", 100), safe_log)\nmap(results, \"result\")  # successes\nmap(results, \"error\")   # errors (NULL if none)\n# possibly — return default on error\nmap_dbl(list(10, \"a\", 100), possibly(log, NA_real_))\n# c(2.302585, NA, 4.605170)"
                  }
        ],
        tips: [
                  "Use map_dbl/chr/lgl instead of map + unlist — they're type-safe and fail loudly on wrong types.",
                  "safely() wraps a function to never error — returns list(result=, error=) instead.",
                  "possibly() is simpler than safely() when you just want a default value on error.",
                  "walk() is for side effects (printing, saving files) — it returns input invisibly for piping."
        ],
        mistake: "Using map() when you need an atomic vector, then calling unlist() — if one element has wrong type, unlist silently coerces. Use map_dbl/chr/lgl for type safety.",
        shorthand: {
          verbose: "# Base R approach (verbose, type-unsafe)\nresult <- lapply(1:5, function(x) x^2)\nresult <- unlist(result)  # coerces silently",
          concise: "# purrr type-stable (concise, safe)\nmap_dbl(1:5, ~.x^2)\n# Errors loudly if result isn't numeric",
        },
      },
      {
        id: "list-manipulation",
        fn: "List Manipulation — keep, discard, pluck, reduce",
        desc: "Filter, extract, and reduce lists — keep(), discard(), pluck(), reduce(), accumulate().",
        category: "purrr",
        subtitle: "keep, discard, pluck, reduce, accumulate, flatten",
        signature: "keep(.x, .p)  |  pluck(.x, ...)  |  reduce(.x, .f, .init)",
        descLong: "purrr provides powerful list manipulation: keep()/discard() filter elements by predicate. pluck() extracts deeply nested elements safely. reduce() folds a list to a single value (like Reduce()). accumulate() is like reduce but keeps intermediates. list_rbind()/list_cbind() combine lists of data frames. These replace complex lapply + do.call patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of List Manipulation — keep, discard, pluck, reduce — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(purrr)\n# keep — filter elements where predicate is TRUE\nkeep(1:10, \\(x) x %% 2 == 0)  # list(2, 4, 6, 8, 10)\n# discard — opposite of keep\ndiscard(list(\"a\", 1, \"b\", 2, \"c\"), is.character)  # list(1, 2)\n# Filter NULLs\ncompact(list(1, NULL, 3, NULL, 5))  # list(1, 3, 5)\n# pluck — safe deep extraction\nnested <- list(\n  users = list(\n    list(name = \"Alice\", scores = c(90, 85, 92)),\n    list(name = \"Bob\", scores = c(78, 82, 88))\n  )\n)\npluck(nested, \"users\", 1, \"name\")        # \"Alice\"\npluck(nested, \"users\", 2, \"scores\", 3)   # 88\npluck(nested, \"users\", 99, .default = NULL)  # NULL (safe)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of List Manipulation — keep, discard, pluck, reduce — common patterns you'll see in production.\n# APPROACH  - Combine List Manipulation — keep, discard, pluck, reduce with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# reduce — fold to single value\nreduce(1:5, `+`)           # 15 (1+2+3+4+5)\nreduce(1:5, `+`, .init = 100)  # 115\n# Merge multiple data frames\ndfs <- list(\n  tibble(id = 1:3, x = rnorm(3)),\n  tibble(id = 2:4, y = rnorm(3)),\n  tibble(id = 3:5, z = rnorm(3))\n)\nreduce(dfs, inner_join, by = \"id\")\n# accumulate — reduce with intermediates\naccumulate(1:5, `+`)  # c(1, 3, 6, 10, 15)\n# list_rbind — combine list of data frames\nresults <- map(1:3, \\(i) tibble(trial = i, value = rnorm(5)))\nlist_rbind(results)  # one data frame with 15 rows"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of List Manipulation — keep, discard, pluck, reduce — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# modify — selectively modify elements\nmodify_if(list(1, \"a\", 3, \"b\"), is.numeric, \\(x) x * 10)\n# list(10, \"a\", 30, \"b\")\n# every / some — check predicates\nevery(1:5, \\(x) x > 0)    # TRUE\nsome(c(-1, 0, 1), \\(x) x < 0)  # TRUE"
                  }
        ],
        tips: [
                  "compact() removes NULLs — essential when working with API responses that have optional fields.",
                  "pluck() with .default avoids errors on missing paths — much safer than nested [[ ]] access.",
                  "reduce() replaces do.call(rbind, list_of_dfs) — and generalizes to any binary function.",
                  "list_rbind() is the modern replacement for do.call(rbind, ...) — cleaner and more explicit."
        ],
        mistake: "Using [[ ]] chains for deeply nested extraction (x[[1]][[2]][[3]]) — it errors on NULL intermediates. pluck(x, 1, 2, 3, .default = NA) handles missing paths gracefully.",
        shorthand: {
          verbose: "# Manual nested extraction (verbose, brittle)\nif (!is.null(x[[1]])) {\n  if (!is.null(x[[1]][[2]])) {\n    result <- x[[1]][[2]][[3]]\n  }\n}",
          concise: "# pluck with .default (safe)\npluck(x, 1, 2, 3, .default = NA)",
        },
      },
    ],
  },

  // ── Section 2: stringr & lubridate ─────────────────────────────────────────
  {
    id: "stringr-lubridate",
    title: "stringr & lubridate",
    entries: [
      {
        id: "stringr-patterns",
        fn: "stringr — String Manipulation",
        desc: "Consistent string functions — detect, extract, replace, split, pad, and trim with regex or fixed patterns.",
        category: "stringr",
        subtitle: "str_detect, str_extract, str_replace, str_split",
        signature: "str_detect(string, pattern)  |  str_extract(string, pattern)",
        descLong: "stringr provides consistent string functions that all start with str_ and take string as the first argument (pipe-friendly). Patterns can be regex (default), fixed(), or coll() (locale-aware). str_detect() tests for matches, str_extract() pulls out matches, str_replace() substitutes, str_split() divides. str_glue() provides Python f-string style interpolation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of stringr — String Manipulation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(stringr)\nemails <- c(\"alice@gmail.com\", \"bob@work.org\", \"charlie@school.edu\")\n# Detect — does it match?\nstr_detect(emails, \"gmail\")        # c(TRUE, FALSE, FALSE)\nstr_detect(emails, \"\\\\.edu$\")      # c(FALSE, FALSE, TRUE)\n# Extract — pull out the match\nstr_extract(emails, \"^[^@]+\")      # c(\"alice\", \"bob\", \"charlie\")\nstr_extract(emails, \"\\\\w+$\")       # c(\"com\", \"org\", \"edu\")\n# Extract all matches\ntext <- \"Call 555-1234 or 555-5678\"\nstr_extract_all(text, \"\\\\d{3}-\\\\d{4}\")  # list(c(\"555-1234\", \"555-5678\"))\n# Replace\nstr_replace(emails, \"@.*\", \"@newdomain.com\")\nstr_replace_all(\"banana\", \"a\", \"o\")  # \"bonono\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of stringr — String Manipulation — common patterns you'll see in production.\n# APPROACH  - Combine stringr — String Manipulation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Split\nstr_split(\"a,b,c,d\", \",\")        # list(c(\"a\", \"b\", \"c\", \"d\"))\nstr_split_fixed(\"a-b-c\", \"-\", 2) # matrix: \"a\" \"b-c\"\n# Case manipulation\nstr_to_upper(\"hello\")   # \"HELLO\"\nstr_to_title(\"hello world\")  # \"Hello World\"\nstr_to_sentence(\"hELLO wORLD\")  # \"Hello world\"\n# Padding and trimming\nstr_pad(1:5, width = 3, pad = \"0\")  # c(\"001\", \"002\", ...)\nstr_trim(\"  hello  \")              # \"hello\"\nstr_squish(\"  too   many   spaces  \")  # \"too many spaces\"\n# String interpolation (glue)\nname <- \"Alice\"\nage <- 30\nstr_glue(\"{name} is {age} years old\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of stringr — String Manipulation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Combine strings\nstr_c(\"hello\", \"world\", sep = \" \")    # \"hello world\"\nstr_flatten(c(\"a\", \"b\", \"c\"), \", \")   # \"a, b, c\"\nstr_flatten_comma(c(\"a\", \"b\", \"c\"), last = \" and \")  # \"a, b, and c\"\n# Count matches\nstr_count(\"banana\", \"a\")  # 3\n# Useful in dplyr\nlibrary(dplyr)\ndf |>\n  filter(str_detect(email, \"@gmail\")) |>\n  mutate(domain = str_extract(email, \"@(.+)\", group = 1))"
                  }
        ],
        tips: [
                  "All str_ functions take string first — perfect for piping: x |> str_trim() |> str_to_lower().",
                  "Use fixed() for literal matching (no regex): str_detect(x, fixed(\"$\")) matches the dollar sign.",
                  "str_glue() is the tidyverse version of paste() with interpolation — cleaner for complex strings.",
                  "str_squish() normalizes whitespace — collapses internal runs to single spaces and trims ends."
        ],
        mistake: "Forgetting double backslashes in R regex: str_detect(x, \"\\d\") is wrong — R needs str_detect(x, \"\\\\d\") because the string literal consumes one level of escaping.",
        shorthand: {
          verbose: "# Base R string ops (verbose, fragile)\ngsub(\"[^0-9]\", \"\", x)\nsubstr(x, 1, 3)\nnchar(x)",
          concise: "# stringr functions (consistent, pipeable)\nstr_remove_all(x, \"[^0-9]\")\nstr_sub(x, 1, 3)\nstr_length(x)",
        },
      },
      {
        id: "lubridate-dates",
        fn: "lubridate — Date & Time Made Easy",
        desc: "Parse, extract, and manipulate dates/times — intuitive functions for the most common date operations.",
        category: "lubridate",
        subtitle: "ymd(), year(), floor_date(), interval, duration",
        signature: "ymd(\"2024-03-15\")  |  year(date)  |  date + days(30)",
        descLong: "lubridate makes date/time parsing and arithmetic intuitive. Parse with ymd(), mdy(), dmy() (order of year/month/day). Extract components with year(), month(), day(), hour(). Arithmetic with days(), weeks(), months(), years(). floor_date()/ceiling_date() round to period boundaries. Intervals measure exact elapsed time. Time zones with with_tz() and force_tz().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of lubridate — Date & Time Made Easy — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(lubridate)\n# Parse dates — function name = input order\nymd(\"2024-03-15\")          # 2024-03-15\nmdy(\"March 15, 2024\")     # 2024-03-15\ndmy(\"15/03/2024\")          # 2024-03-15\nymd_hms(\"2024-03-15 14:30:00\")  # with time\n# Extract components\nd <- ymd(\"2024-03-15\")\nyear(d)     # 2024\nmonth(d)    # 3\nmonth(d, label = TRUE)  # Mar\nday(d)      # 15\nwday(d, label = TRUE)   # Fri\nyday(d)     # 75 (day of year)\n# Date arithmetic\nd + days(30)        # 2024-04-14\nd + months(2)       # 2024-05-15\nd + years(1)        # 2025-03-15\nd - weeks(1)        # 2024-03-08"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of lubridate — Date & Time Made Easy — common patterns you'll see in production.\n# APPROACH  - Combine lubridate — Date & Time Made Easy with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Durations (exact seconds)\nddays(1)            # 86400s (~1 days)\ndhours(2.5)         # 9000s (~2.5 hours)\n# Periods (human calendar units)\nd + months(1)       # handles varying month lengths\n# Rounding\nfloor_date(d, \"month\")    # 2024-03-01\nceiling_date(d, \"month\")  # 2024-04-01\nfloor_date(d, \"week\")     # 2024-03-11 (Monday)\nround_date(d, \"quarter\")  # 2024-04-01\n# Intervals and differences\nstart <- ymd(\"2024-01-01\")\nend <- ymd(\"2024-12-31\")\ninterval(start, end)             # 2024-01-01 UTC--2024-12-31 UTC\ninterval(start, end) / months(1) # ~11.97 months\ndifftime(end, start, units = \"days\")  # 365"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of lubridate — Date & Time Made Easy — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Time zones\nnow(\"US/Pacific\")\nwith_tz(now(), \"Europe/London\")  # convert display\nforce_tz(now(), \"Asia/Tokyo\")    # force tz (same clock time)\n# In dplyr\nlibrary(dplyr)\ndf |>\n  mutate(\n    month = floor_date(date, \"month\"),\n    quarter = quarter(date, with_year = TRUE),\n    age_days = as.numeric(today() - date)\n  ) |>\n  group_by(month) |>\n  summarise(count = n())"
                  }
        ],
        tips: [
                  "ymd/mdy/dmy automatically detect separators — \"2024-03-15\", \"2024/03/15\", \"20240315\" all work.",
                  "floor_date(x, \"week\") rounds to Monday by default — use week_start = 7 for Sunday.",
                  "Use periods (months(), years()) for calendar arithmetic and durations (dmonths()) for exact time.",
                  "month(x, label = TRUE, abbr = FALSE) gives full month names — useful for plots and reports."
        ],
        mistake: "Using months(1) for exact 30-day calculations — months() adds one calendar month (28-31 days depending on the month). Use days(30) or ddays(30) for exact 30-day intervals.",
        shorthand: {
          verbose: "# Base R dates (verbose, error-prone)\nas.Date(\"2024-03-15\", format = \"%Y-%m-%d\")\nyear(as.POSIXct(date))\ndate + (30 * 24 * 60 * 60)  # crude 30 days",
          concise: "# lubridate (intuitive, powerful)\nymd(\"2024-03-15\")\nyear(date)\ndate + days(30)",
        },
      },
    ],
  },

  // ── Section 3: forcats & tidyr ─────────────────────────────────────────
  {
    id: "forcats-tidyr",
    title: "forcats & tidyr",
    entries: [
      {
        id: "forcats-factors",
        fn: "forcats — Factor Manipulation",
        desc: "Reorder, recode, and collapse factor levels — essential for controlling plot order and groupings.",
        category: "forcats",
        subtitle: "fct_reorder, fct_relevel, fct_collapse, fct_lump",
        signature: "fct_reorder(f, x, .fun = median)  |  fct_lump_n(f, n = 5)",
        descLong: "forcats provides tools for working with factors (categorical variables). fct_reorder() reorders levels by another variable (crucial for ggplot2). fct_relevel() manually repositions specific levels. fct_collapse() merges levels. fct_lump() combines rare levels into \"Other\". fct_recode() renames levels. All return factors, preserving the tidyverse workflow.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of forcats — Factor Manipulation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(forcats)\nlibrary(dplyr)\nlibrary(ggplot2)\n# Reorder by another variable (critical for plots)\ndf <- tibble(\n  category = factor(c(\"A\", \"B\", \"C\", \"D\", \"E\")),\n  value = c(30, 10, 50, 20, 40)\n)\n# Plot with bars ordered by value\ndf |>\n  mutate(category = fct_reorder(category, value)) |>\n  ggplot(aes(value, category)) + geom_col()\n# Manually reposition specific levels\nfct_relevel(f, \"Other\", after = Inf)      # \"Other\" last\nfct_relevel(f, \"Important\", after = 0)    # first\n# Collapse multiple levels into one\nsizes <- factor(c(\"XS\", \"S\", \"M\", \"L\", \"XL\", \"XXL\"))\nfct_collapse(sizes,\n  small  = c(\"XS\", \"S\"),\n  medium = \"M\",\n  large  = c(\"L\", \"XL\", \"XXL\")\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of forcats — Factor Manipulation — common patterns you'll see in production.\n# APPROACH  - Combine forcats — Factor Manipulation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Lump rare categories into \"Other\"\n# Keep top 5, rest become \"Other\"\nfct_lump_n(big_factor, n = 5)\n# Keep levels with >= 5% frequency\nfct_lump_prop(big_factor, prop = 0.05)\n# Keep minimum number of levels to represent 90% of data\nfct_lump_min(big_factor, min = 100)\n# Recode — rename levels\nfct_recode(f,\n  \"United States\" = \"US\",\n  \"United Kingdom\" = \"UK\",\n  \"Germany\" = \"DE\"\n)\n# Reverse level order\nfct_rev(f)\n# Drop unused levels\nfct_drop(f)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of forcats — Factor Manipulation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Count by factor level\nfct_count(f, sort = TRUE)\n# In a full pipeline\nsurvey |>\n  mutate(\n    education = fct_relevel(education, \"High School\", \"Bachelor\", \"Master\", \"PhD\"),\n    income_group = fct_lump_n(income_group, 5, other_level = \"Other\"),\n    region = fct_reorder(region, salary, .fun = median)\n  ) |>\n  ggplot(aes(salary, region, fill = education)) +\n  geom_boxplot()"
                  }
        ],
        tips: [
                  "fct_reorder() is the single most useful forcats function — it makes bar charts and box plots ordered by value.",
                  "fct_lump_n() with n=5-10 keeps plots readable by grouping rare categories into \"Other\".",
                  "fct_relevel(f, \"X\", after = Inf) moves \"X\" to the end — use after = 0 for the beginning.",
                  "fct_infreq() orders by frequency — perfect for bar charts showing most common categories first."
        ],
        mistake: "Manually setting levels with factor(x, levels = ...) for plot ordering — fct_reorder(category, value) does it automatically based on a summary statistic, and updates when data changes.",
        shorthand: {
          verbose: "# Manual level ordering (verbose, static)\nlevels <- names(sort(table(x)))\ncategory <- factor(category, levels = levels)",
          concise: "# forcats automatic ordering (dynamic)\nfct_reorder(category, value, .fun = median)",
        },
      },
      {
        id: "tidyr-reshape",
        fn: "tidyr — Pivoting & Reshaping",
        desc: "Reshape data between wide and long formats, handle nested data, and fill/complete missing values.",
        category: "tidyr",
        subtitle: "pivot_longer, pivot_wider, unnest, complete, fill",
        signature: "pivot_longer(cols, names_to, values_to)  |  pivot_wider(names_from, values_from)",
        descLong: "tidyr reshapes data: pivot_longer() gathers columns into rows (wide→long), pivot_wider() spreads rows into columns (long→wide). nest()/unnest() create and flatten list-columns. complete() adds missing combinations. fill() propagates values down/up. separate_wider_*() splits columns. These are essential for tidy data principles — one observation per row.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tidyr — Pivoting & Reshaping — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidyr)\nlibrary(dplyr)\n# ── Wide to Long (pivot_longer) ─────────────────────\nwide <- tibble(\n  student = c(\"Alice\", \"Bob\"),\n  math = c(90, 85),\n  english = c(88, 92),\n  science = c(95, 78)\n)\nlong <- wide |> pivot_longer(\n  cols = math:science,\n  names_to = \"subject\",\n  values_to = \"score\"\n)\n# student | subject | score\n# Alice   | math    | 90\n# Alice   | english | 88 ...\n# ── Long to Wide (pivot_wider) ──────────────────────\nwide_again <- long |> pivot_wider(\n  names_from = subject,\n  values_from = score\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tidyr — Pivoting & Reshaping — common patterns you'll see in production.\n# APPROACH  - Combine tidyr — Pivoting & Reshaping with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Advanced pivot: multiple value columns\npivot_wider(\n  names_from = year,\n  values_from = c(revenue, profit),\n  names_glue = \"{.value}_{year}\"\n)\n# ── Nest / Unnest ───────────────────────────────────\nnested <- mtcars |>\n  group_by(cyl) |>\n  nest()  # data column contains tibbles per group\n# Fit model per group\nmodels <- nested |>\n  mutate(\n    model = map(data, ~ lm(mpg ~ wt, data = .x)),\n    r_squared = map_dbl(model, ~ summary(.x)$r.squared)\n  )\nunnest(nested, data)  # flatten back\n# ── Complete — fill in missing combinations ─────────\nsales <- tibble(\n  product = c(\"A\", \"A\", \"B\"),\n  month = c(1, 3, 2),\n  revenue = c(100, 150, 200)\n)\ncomplete(sales, product, month = 1:3, fill = list(revenue = 0))\n# Adds missing product-month combinations with revenue = 0"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tidyr — Pivoting & Reshaping — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Fill — propagate values ─────────────────────────\ndf <- tibble(\n  group = c(\"A\", NA, NA, \"B\", NA),\n  value = 1:5\n)\nfill(df, group, .direction = \"down\")\n# group fills: A, A, A, B, B\n# ── Separate ────────────────────────────────────────\ndf <- tibble(name_age = c(\"Alice_30\", \"Bob_25\"))\nseparate_wider_delim(df, name_age, delim = \"_\",\n                     names = c(\"name\", \"age\"))"
                  }
        ],
        tips: [
                  "pivot_longer for analysis/plotting (tidy data), pivot_wider for presentation/reports.",
                  "names_glue in pivot_wider controls output column names — \"{.value}_{year}\" creates \"revenue_2024\".",
                  "complete() + fill() together handle time series gaps — add missing dates, then fill forward.",
                  "nest() + map() is the tidyverse pattern for group-wise modeling — cleaner than split() + lapply()."
        ],
        mistake: "Using spread/gather (deprecated) — pivot_wider/pivot_longer replaced them with clearer, more powerful syntax. The old functions are still in tidyr but no longer maintained.",
        shorthand: {
          verbose: "# Old deprecated approach\nspread(data, year, revenue)\ngather(data, year, revenue, -id)",
          concise: "# Modern tidyr approach\npivot_wider(data, names_from = year, values_from = revenue)\npivot_longer(data, -id, names_to = \"year\", values_to = \"revenue\")",
        },
      },
    ],
  },
]

export default { meta, sections }
