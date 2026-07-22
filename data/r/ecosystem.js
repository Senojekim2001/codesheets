export const meta = {
  "id": "ecosystem",
  "label": "R Ecosystem & Dev Tools",
  "icon": "🔧",
  "description": "R package development (devtools, roxygen2, testthat), web scraping (rvest, httr2), spatial data (sf), text mining, and DBI."
}

export const sections = [

  // ── Section 1: Package Development & Databases ─────────────────────────────────────────
  {
    id: "package-dev",
    title: "Package Development & Databases",
    entries: [
      {
        id: "devtools-package-dev",
        fn: "Package Development — devtools, usethis, roxygen2, testthat",
        desc: "Build, document, and test R packages using the devtools/usethis workflow.",
        category: "Dev Tools",
        subtitle: "devtools, usethis, roxygen2, testthat — the full package dev toolkit",
        signature: "usethis::create_package()  |  devtools::document()  |  devtools::check()",
        descLong: "R package development uses devtools for building/testing, usethis for scaffolding, roxygen2 for documentation, and testthat for unit tests. The core workflow: create_package() → use_r(\"functions\") → document() → test() → check(). usethis::use_github_actions() adds CI/CD. For database access from R, see the separate DBI/dbplyr entry.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Package Development — devtools, usethis, roxygen2, testthat — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Scaffold a new package ───────────────────────────\n# usethis::create_package(\"~/mypackage\")  # creates package skeleton\n# usethis::use_r(\"utils\")                 # create R/utils.R\n# usethis::use_test(\"utils\")              # create tests/testthat/test-utils.R\n# usethis::use_package(\"dplyr\")           # add Imports: dplyr to DESCRIPTION\n# usethis::use_pipe()                     # export %>% / |>\n# usethis::use_readme_rmd()               # create README.Rmd\n# usethis::use_github_actions()           # CI/CD: R CMD check on every push\n# usethis::use_mit_license()              # add LICENSE file\n# ── roxygen2 documentation ───────────────────────────\n#' Calculate Summary Statistics\n#'\n#' Compute mean, median, and standard deviation for a numeric vector,\n#' with optional trimming for outlier robustness.\n#'\n#' @param x A numeric vector.\n#' @param trim Fraction (0 to 0.5) of observations trimmed from each end.\n#' @param na.rm Logical; if TRUE, remove NA values before computation.\n#' @return A named list with mean, median, and sd.\n#' @export\n#' @examples\n#' calc_stats(c(1, 2, 3, 4, 100))\n#' calc_stats(c(1, 2, 3, 4, 100), trim = 0.1)\ncalc_stats <- function(x, trim = 0, na.rm = TRUE) {\n  list(\n    mean   = mean(x, trim = trim, na.rm = na.rm),\n    median = median(x, na.rm = na.rm),\n    sd     = sd(x, na.rm = na.rm)\n  )\n}\n# devtools::document()  # generates man/ docs from roxygen comments\n# devtools::check()     # full R CMD check (0 errors, 0 warnings for CRAN)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Package Development — devtools, usethis, roxygen2, testthat — common patterns you'll see in production.\n# APPROACH  - Combine Package Development — devtools, usethis, roxygen2, testthat with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── testthat unit tests ──────────────────────────────\n# tests/testthat/test-utils.R\nlibrary(testthat)\ntest_that(\"calc_stats returns correct values\", {\n  result <- calc_stats(1:10)\n  expect_equal(result$mean, 5.5)\n  expect_equal(result$median, 5.5)\n  expect_true(is.numeric(result$sd))\n})\ntest_that(\"calc_stats handles NA\", {\n  result <- calc_stats(c(1, 2, NA, 4))\n  expect_equal(result$mean, 7/3, tolerance = 1e-10)\n})\ntest_that(\"calc_stats errors on non-numeric\", {\n  expect_error(calc_stats(\"abc\"))\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Package Development — devtools, usethis, roxygen2, testthat — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# devtools::test()         # run all tests\n# devtools::test_active_file()  # run tests for current file\n# devtools::load_all()     # load package without installing (fast dev loop)"
                  }
        ],
        tips: [
                  "devtools::check() runs the full R CMD check — your package must pass with 0 errors, 0 warnings for CRAN submission.",
                  "devtools::load_all() (Ctrl/Cmd+Shift+L in RStudio) reloads your package in ~1 second — much faster than install.",
                  "usethis::use_github_actions() sets up CI that runs R CMD check on every push — essential for package quality.",
                  "Write documentation with @examples that actually run — CRAN checks run them, and they double as integration tests."
        ],
        mistake: "Writing @export on every function. Only export functions intended for users. Internal helpers should be documented with @noRd (no docs) or simply left unexported — accessible inside the package as pkg:::fn().",
        shorthand: {
          verbose: "# Manual package structure:\n# DESCRIPTION manually edited\n# man/*.Rd files written by hand\n# R CMD check run from terminal",
          concise: "# devtools workflow\nusethis::create_package(\"mypkg\")\nusethis::use_r(\"utils\"); usethis::use_test(\"utils\")\ndevtools::load_all(); devtools::document(); devtools::check()",
        },
      },
    ],
  },

  // ── Section 2: Web Scraping, Spatial & Text Mining ─────────────────────────────────────────
  {
    id: "scraping-spatial",
    title: "Web Scraping, Spatial & Text Mining",
    entries: [
      {
        id: "rlang-tidy-eval",
        fn: "rlang — Tidy Evaluation & Programming with dplyr",
        desc: "rlang tidy eval: {{}} embrace, !!, enquo(), sym() for metaprogramming dplyr.",
        category: "Ecosystem",
        subtitle: "{{}} embrace, !!, enquo(), sym(), unquote, programming with dplyr",
        signature: "function(var) { filter(df, {{var}} > 10) }  |  enquo(col)  |  !!sym(\"name\")",
        descLong: "rlang provides tidy evaluation (tidy eval) — quasiquotation for metaprogramming. {{ }} embraces a variable, !! unquotes, enquo() captures an expression. Essential for writing functions that use dplyr verbs. Enables \"non-standard evaluation\" (NSE) where column names are passed as bare symbols.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of rlang — Tidy Evaluation & Programming with dplyr — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(rlang)\nlibrary(dplyr)\n# ── {{ }} embrace operator ───────────────────────────────\n# Capture bare column name and use in dplyr:\nsummarize_by <- function(df, var) {\n  df |>\n    summarise(\n      mean = mean({{var}}, na.rm = TRUE),\n      sd = sd({{var}}, na.rm = TRUE),\n      n = n()\n    )\n}\nsummarize_by(mtcars, mpg)  # var = mpg (bare)\nsummarize_by(mtcars, hp)   # var = hp (bare)\n# ── enquo(): capture an expression ───────────────────────\n# More explicit than {{}} when needed:\nsummarize_by_explicit <- function(df, var) {\n  var <- enquo(var)  # capture the expression\n  df |>\n    summarise(\n      mean = mean(!!var, na.rm = TRUE),\n      sd = sd(!!var, na.rm = TRUE)\n    )\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of rlang — Tidy Evaluation & Programming with dplyr — common patterns you'll see in production.\n# APPROACH  - Combine rlang — Tidy Evaluation & Programming with dplyr with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── !! (unquote) ────────────────────────────────────────\n# Inject a captured expression:\nfilter_by <- function(df, col, value) {\n  col <- enquo(col)\n  df |> filter(!!col == value)\n}\nfilter_by(mtcars, cyl, 6)  # cyl == 6\n# ── sym(): convert string to symbol ──────────────────────\n# When column name is a string:\ncol_string <- \"mpg\"\nmtcars |> select(!!sym(col_string))\n# Programmatically select columns:\ncols <- c(\"mpg\", \"cyl\", \"hp\")\nmtcars |> select(!!!syms(cols))  # !!! splices a list\n# ── Multiple quoted arguments ────────────────────────────\ngrouped_summary <- function(df, grouping_var, summary_var) {\n  group_var <- enquo(grouping_var)\n  summ_var <- enquo(summary_var)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of rlang — Tidy Evaluation & Programming with dplyr — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ndf |>\n    group_by(!!group_var) |>\n    summarise(\n      mean_val = mean(!!summ_var, na.rm = TRUE),\n      .groups = \"drop\"\n    )\n}\ngrouped_summary(mtcars, cyl, mpg)"
                  }
        ],
        tips: [
                  "{{ }} is the simplest — use it when possible in function arguments.",
                  "enquo() for explicit capture when you need to manipulate the expression.",
                  "!!! (unquote-splice) injects a list of symbols — useful for dynamic column selection.",
                  "sym() and syms() convert strings to symbols — bridge between string-based and bare column names."
        ],
        mistake: "Trying to pass bare column names without {{ }} or enquo() — causes \"object not found\" errors.",
        shorthand: {
          verbose: "filter_by <- function(df, col, val) {\n  col_name <- as.character(substitute(col))\n  df[df[[col_name]] == val, ]\n}",
          concise: "filter_by <- function(df, col, val) {\n  col <- enquo(col)\n  df |> filter(!!col == val)\n}",
        },
      },
      {
        id: "purrr-advanced",
        fn: "purrr — Advanced Functional Programming",
        desc: "purrr advanced: map2(), pmap(), imap(), walk(), keep(), discard(), reduce().",
        category: "Ecosystem",
        subtitle: "map2, pmap, imap, walk, keep, discard, reduce, predicate functions",
        signature: "map2(x, y, f)  |  pmap(list(x, y, z), f)  |  keep(x, predicate)  |  reduce(x, f, init)",
        descLong: "purrr extends map() with multivariate operations (map2, pmap), filtering (keep, discard), and reductions. imap adds indices/names. walk applies for side effects. Essential for functional programming in R.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of purrr — Advanced Functional Programming — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(purrr)\n# ── map2(): apply function to two vectors ──────────────\n# Element-wise operation:\nmap2(c(1, 2, 3), c(10, 20, 30), (x, y) x + y)\n# [[1]] 11\n# [[2]] 22\n# [[3]] 33\n# Example: match each person with their salary\npeople <- c(\"Alice\", \"Bob\", \"Carol\")\nsalaries <- c(80, 65, 90)\nmap2_chr(people, salaries, (p, s) paste(p, \"$\", s))\n# ── pmap(): apply to many vectors/lists ─────────────────\nargs <- list(\n  x = c(1, 2),\n  y = c(10, 20),\n  z = c(100, 200)\n)\npmap_dbl(args, (x, y, z) x + y + z)  # 111, 222"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of purrr — Advanced Functional Programming — common patterns you'll see in production.\n# APPROACH  - Combine purrr — Advanced Functional Programming with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── imap(): map with indices/names ──────────────────────\nx <- c(a = 10, b = 20, c = 30)\nimap_chr(x, (val, name) paste(name, \"=\", val))\n# \"a = 10\" \"b = 20\" \"c = 30\"\n# ── keep() & discard(): filter by predicate ────────────\nnumbers <- c(1, 2, 3, 4, 5, 6)\nkeep(numbers, (x) x %% 2 == 0)    # even numbers: 2, 4, 6\ndiscard(numbers, (x) x %% 2 == 0) # odd numbers: 1, 3, 5\n# Use with lists:\nfruits <- list(name = \"apple\", color = \"red\", sweetness = 8)\nkeep(fruits, is.character)  # name, color\ndiscard(fruits, is.numeric) # name, color\n# ── walk(): apply for side effects (not return value) ───\n# Useful for: saving files, plotting, logging\nwalk(1:3, (x) cat(\"Processing\", x, \"\\n\"))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of purrr — Advanced Functional Programming — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── reduce(): fold/accumulate ───────────────────────────\n# Combine list elements with a function:\nlist(2, 3, 4) |> reduce((x, y) x * y)  # 2 * 3 * 4 = 24\n# Sum with initial value:\nreduce(c(1, 2, 3), (acc, x) acc + x, .init = 0)  # 6\n# ── accumulate(): like reduce but keeps intermediate steps\naccumulate(c(1, 2, 3, 4), (acc, x) acc + x, .init = 0)\n# 0, 1, 3, 6, 10 (cumulative sum)"
                  }
        ],
        tips: [
                  "map2/pmap for element-wise operations on multiple vectors.",
                  "keep/discard filter using predicates — cleaner than base R subsetting.",
                  "reduce for aggregations — powerful for combining list elements.",
                  "imap provides indices — useful for labeling results."
        ],
        mistake: "Using for loops instead of map/map2/pmap — purrr is more readable and vectorized.",
        shorthand: {
          verbose: "result <- list()\nfor (i in seq_along(x)) {\n  result[[i]] <- f(x[[i]], y[[i]])\n}",
          concise: "result <- map2(x, y, f)",
        },
      },
      {
        id: "glue-package",
        fn: "glue — String Interpolation & Formatting",
        desc: "glue: string interpolation with expressions, glue_data(), SQL building.",
        category: "Ecosystem",
        subtitle: "glue(), glue_data(), glue_collapse(), SQL templates",
        signature: "glue(\"x={x}, y={y}\")  |  glue_collapse(c(a,b,c), \", \")  |  glue_sql(\"SELECT * FROM {tbl}\")",
        descLong: "glue provides elegant string interpolation using {} expressions. Works with data frames (glue_data), collapses vectors, and builds SQL safely. Preferred over paste() and sprintf().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of glue — String Interpolation & Formatting — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(glue)\n# ── Basic glue ──────────────────────────────────────────\nname <- \"Alice\"\nage <- 30\nglue(\"Hello {name}, you are {age} years old\")\n# \"Hello Alice, you are 30 years old\"\n# ── Expressions in {} ────────────────────────────────────\nx <- 5\nglue(\"x doubled is {x * 2}\")\n# \"x doubled is 10\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of glue — String Interpolation & Formatting — common patterns you'll see in production.\n# APPROACH  - Combine glue — String Interpolation & Formatting with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── glue_data() with data frames ────────────────────────\ndf <- data.frame(name = c(\"Alice\", \"Bob\"), age = c(30, 25))\nglue_data(df, \"{name} is {age} years old\")\n# \"Alice is 30 years old\" \"Bob is 25 years old\"\n# ── glue_collapse(): join vector elements ──────────────\nitems <- c(\"apple\", \"banana\", \"cherry\")\nglue_collapse(items, sep = \", \", last = \" and \")\n# \"apple, banana and cherry\"\n# ── SQL building with glue_sql ──────────────────────────\nlibrary(DBI)\ntable_name <- \"users\"\nstatus <- \"active\"\nglue_sql(\"SELECT * FROM {table_name} WHERE status = {status}\")\n# SELECT * FROM users WHERE status = 'active'"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of glue — String Interpolation & Formatting — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Multi-line glue ────────────────────────────────────\ntemplate <- glue(\"\n  Name: {name}\n  Age: {age}\n  Location: Portland\n\")"
                  }
        ],
        tips: [
                  "glue uses {} for interpolation — cleaner than paste() or sprintf().",
                  "glue_sql() safely quotes values for SQL — prevents injection.",
                  "Backticks `col` in glue_sql escape identifier names."
        ],
        mistake: "Using paste() instead of glue — glue is more readable and handles expressions.",
        shorthand: {
          verbose: "// Manual / verbose approach\npaste(\"Hello\", name, \", you are\", age, \"years old\")\n// More explicit but longer",
          concise: "glue(\"Hello {name}, you are {age} years old\")",
        },
      },
      {
        id: "lubridate-deep",
        fn: "lubridate — Date/Time Manipulation in Depth",
        desc: "lubridate: parsing dates, intervals/durations/periods, arithmetic, %within%.",
        category: "Ecosystem",
        subtitle: "ymd_hms(), intervals, durations, periods, %within%, tz handling",
        signature: "ymd_hms(\"2024-01-01 14:30:00\")  |  start %within% interval(from, to)  |  d1 + ddays(5)",
        descLong: "lubridate simplifies date/time handling. Parsing functions (ymd, mdy, etc.) auto-detect formats. Intervals, durations, and periods model different time concepts. %within% checks membership in an interval. Essential for time series and reporting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of lubridate — Date/Time Manipulation in Depth — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(lubridate)\n# ── Parsing functions (flexible format detection) ──────\nymd(\"2024-01-15\")                    # \"2024-01-15\"\nmdy(\"01/15/2024\")                    # \"2024-01-15\"\ndmy(\"15-01-2024\")                    # \"2024-01-15\"\nymd_hms(\"2024-01-15 14:30:45\")       # \"2024-01-15 14:30:45 UTC\"\n# ── Extract components ──────────────────────────────────\nd <- ymd(\"2024-01-15\")\nyear(d)       # 2024\nmonth(d)      # 1\nday(d)        # 15\nwday(d)       # 2 (Tuesday)\nweek(d)       # 3\n# ── Arithmetic with durations/periods ───────────────────\nd <- ymd(\"2024-01-15\")\nd + ddays(5)     # add 5 days (duration, exact)\nd + days(5)      # add 5 days (period, calendar-aware)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of lubridate — Date/Time Manipulation in Depth — common patterns you'll see in production.\n# APPROACH  - Combine lubridate — Date/Time Manipulation in Depth with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nd + dweeks(2)    # add 2 weeks (duration)\nd + weeks(2)     # add 2 weeks (period)\nd - ddays(3)     # subtract 3 days\n# ── Differences between duration/period ─────────────────\n# Duration: exact, in seconds\nd1 <- ymd(\"2024-01-15\")\nd2 <- ymd(\"2024-02-15\")\nd2 - d1                  # Time difference of 31 days (exact)\n# Period: calendar-aware\nd1 %m+% months(1)       # add 1 calendar month\n# ── Intervals ──────────────────────────────────────────\nstart <- ymd(\"2024-01-01\")\nend <- ymd(\"2024-01-31\")\nmy_interval <- interval(start, end)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of lubridate — Date/Time Manipulation in Depth — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Check if date is within interval:\ntest_date <- ymd(\"2024-01-15\")\ntest_date %within% my_interval  # TRUE\n# ── Time zones ────────────────────────────────────────\nutc_time <- ymd_hms(\"2024-01-15 14:30:00\", tz = \"UTC\")\npacific_time <- with_tz(utc_time, \"America/Los_Angeles\")\n# ── Rounding dates ────────────────────────────────────\nd <- ymd_hms(\"2024-01-15 14:37:42\")\nfloor_date(d, \"hour\")      # 2024-01-15 14:00:00\nround_date(d, \"15 minutes\")  # 2024-01-15 14:37:30\nceiling_date(d, \"day\")     # 2024-01-16 00:00:00\n# ── Sequences of dates ────────────────────────────────\nseq(ymd(\"2024-01-01\"), ymd(\"2024-01-10\"), by = \"2 days\")"
                  }
        ],
        tips: [
                  "ymd(), mdy(), dmy() auto-detect format — no need to specify format string.",
                  "Durations (ddays, dweeks) are exact time. Periods (days, weeks) are calendar-aware.",
                  "%within% for interval membership — useful for filtering date ranges.",
                  "with_tz() and force_tz() for timezone conversion."
        ],
        mistake: "Using Sys.Date() + 5 (integer addition) instead of ddays(5) — lubridate operators are clearer.",
        shorthand: {
          verbose: "// Manual / verbose approach\nas.Date(\"2024-01-15\") + 5\n// More explicit but longer",
          concise: "ymd(\"2024-01-15\") + ddays(5)",
        },
      },
      {
        id: "forcats-package",
        fn: "forcats — Factor Manipulation",
        desc: "forcats: fct_reorder(), fct_lump(), fct_recode(), fct_rev() for factors.",
        category: "Ecosystem",
        subtitle: "fct_reorder, fct_lump, fct_recode, fct_rev, factor levels",
        signature: "fct_reorder(f, x, fun)  |  fct_lump(f, n=5)  |  fct_recode(f, new=\"old\")",
        descLong: "forcats simplifies factor manipulation. Reorder levels by another variable, lump rare categories, recode values, reverse order. Essential for categorical data visualization and analysis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of forcats — Factor Manipulation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(forcats)\nlibrary(ggplot2)\n# ── Create sample data with factors ──────────────────────\ndf <- data.frame(\n  city = factor(c(\"NYC\", \"LA\", \"Chicago\", \"NYC\", \"LA\", \"Boston\")),\n  population = c(8.3, 3.9, 2.7, 8.3, 3.9, 0.7),\n  growth = c(-0.1, 0.2, 0.3, -0.1, 0.2, -0.2)\n)\n# ── fct_reorder: reorder by another variable ────────────\n# Reorder cities by population (for visualization):\ndf$city_ordered <- fct_reorder(df$city, df$population)\nlevels(df$city_ordered)  # \"Boston\", \"Chicago\", \"LA\", \"NYC\"\n# Plot with ordered factors:\nggplot(df, aes(city_ordered, growth)) +\n  geom_col() +\n  coord_flip()  # now ordered by population"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of forcats — Factor Manipulation — common patterns you'll see in production.\n# APPROACH  - Combine forcats — Factor Manipulation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── fct_reorder with function ───────────────────────────\n# Reorder by median (if multiple values per level):\nfct_reorder(df$city, df$growth, .fun = median)\n# ── fct_lump: collapse small categories ────────────────\ncities <- factor(c(\"NYC\", \"LA\", \"Chicago\", \"Boston\", \"Denver\", \"Seattle\"))\n# Keep only 3 most frequent, rest → \"Other\":\nfct_lump(cities, n = 3)\n# \"NYC\"   \"LA\"    \"Chicago\"  \"Other\" \"Other\" \"Other\"\n# Lump by proportion:\nfct_lump(cities, prop = 0.2)  # keep categories with >20% frequency\n# ── fct_recode: rename factor levels ────────────────────\ncity_clean <- fct_recode(df$city,\n  \"New York\" = \"NYC\",\n  \"Los Angeles\" = \"LA\"\n)\nlevels(city_clean)  # \"Los Angeles\", \"New York\", ..."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of forcats — Factor Manipulation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── fct_rev: reverse factor order ───────────────────────\ndf$city_reversed <- fct_rev(df$city)\n# ── fct_relevel: manually set level order ──────────────\ndf$city_manual <- fct_relevel(df$city, \"NYC\", \"LA\", \"Chicago\")\n# ── fct_explicit_na: make NA a level ────────────────────\nx <- factor(c(\"a\", \"b\", NA, \"c\"))\nfct_explicit_na(x)  # NA becomes a factor level"
                  }
        ],
        tips: [
                  "fct_reorder for visualization — reorder bars/points by another variable.",
                  "fct_lump reduces dimension — collapse rare categories into \"Other\".",
                  "fct_recode for cleaning/recoding factor values."
        ],
        mistake: "Manual factor level manipulation with levels(x) <- ... instead of using forcats functions.",
        shorthand: {
          verbose: "// Manual / verbose approach\nx_reordered <- factor(x, levels = levels(x)[order(-table(x))])\n// More explicit but longer",
          concise: "fct_reorder(x, y)",
        },
      },
      {
        id: "janitor-package",
        fn: "janitor — Data Cleaning Utilities",
        desc: "janitor: clean_names(), tabyl(), adorn_*() for quick data exploration.",
        category: "Ecosystem",
        subtitle: "clean_names, tabyl, adorn_totals, adorn_pct_across, remove_constant",
        signature: "clean_names(df)  |  tabyl(df, col)  |  adorn_totals(tbl, \"row\")",
        descLong: "janitor provides data cleaning helpers. clean_names() standardizes column names. tabyl() creates frequency tables. adorn_*() functions add totals and percentages. Essential for exploratory data analysis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of janitor — Data Cleaning Utilities — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(janitor)\n# ── clean_names: standardize column names ───────────────\ndf <- data.frame(\n  `Column One` = 1:3,\n  `Column TWO!` = c(\"a\", \"b\", \"c\"),\n  `CamelCaseCol` = c(10, 20, 30)\n)\ndf_clean <- clean_names(df)\nnames(df_clean)\n# \"column_one\" \"column_two\" \"camel_case_col\"\n# ── tabyl: one-way and two-way frequency tables ────────\ndf <- data.frame(\n  product = c(\"A\", \"B\", \"A\", \"C\", \"B\", \"A\"),\n  region = c(\"East\", \"West\", \"East\", \"West\", \"East\", \"East\")\n)\n# One-way\ntabyl(df, product)\n#   product n percent\n# 1       A 3     0.5\n# 2       B 2     0.333\n# 3       C 1     0.167"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of janitor — Data Cleaning Utilities — common patterns you'll see in production.\n# APPROACH  - Combine janitor — Data Cleaning Utilities with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Two-way (crosstab)\ntabyl(df, product, region)\n#   product East West\n# 1       A    3    0\n# 2       B    1    1\n# 3       C    0    1\n# ── adorn_totals: add margins ───────────────────────────\ntabyl(df, product, region) |>\n  adorn_totals(\"row\") |>\n  adorn_totals(\"col\")\n# ── adorn_pct_across: percentages within row ───────────\ntabyl(df, product, region) |>\n  adorn_pct_across(denominator = \"row\")\n# 100% is computed within each row\n# ── adorn_ns: show N alongside pct ──────────────────────\ntabyl(df, product, region) |>\n  adorn_ns(\"rear\")  # (n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of janitor — Data Cleaning Utilities — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── remove_empty: drop empty rows/cols ──────────────────\ndf_sparse <- data.frame(\n  a = c(1, NA, NA),\n  b = c(NA, NA, NA),  # all empty\n  c = c(10, 20, 30)\n)\nremove_empty(df_sparse, which = c(\"rows\", \"cols\"))\n# removes column b, keeps a and c"
                  }
        ],
        tips: [
                  "clean_names() before analysis — standardizes naming inconsistencies.",
                  "tabyl() for quick EDA — much faster than table() or dplyr::count().",
                  "adorn_* functions pipe seamlessly — build tables exploratively."
        ],
        mistake: "Manual column name fixing instead of clean_names().",
        shorthand: {
          verbose: "// Manual / verbose approach\nnames(df) <- tolower(gsub(\" \", \"_\", names(df)))\n// More explicit but longer",
          concise: "clean_names(df)",
        },
      },
      {
        id: "dtplyr-arrow",
        fn: "dtplyr & Arrow — dplyr on Large Data",
        desc: "dtplyr: lazy data.table, arrow: Parquet/CSV via dplyr API.",
        category: "Ecosystem",
        subtitle: "lazy_dt, open_dataset, dplyr on data.table/arrow, collect",
        signature: "lazy_dt(DT) |> filter(...) |> collect()  |  open_dataset(\"dir/\") |> filter(...)",
        descLong: "dtplyr wraps data.table with dplyr syntax (lazy evaluation, translates to data.table). Arrow enables dplyr on Parquet/CSV files — query large data without loading into memory. Both use collect() to materialize results.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of dtplyr & Arrow — dplyr on Large Data — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(dtplyr)\nlibrary(dplyr)\nlibrary(arrow)\n# ── dtplyr: dplyr syntax on data.table ──────────────────\nDT <- data.table::data.table(\n  id = 1:5,\n  dept = c(\"IT\", \"HR\", \"IT\", \"Finance\", \"IT\"),\n  salary = c(85, 62, 92, 78, 88)\n)\n# Lazy evaluation (translates to data.table):\nresult <- lazy_dt(DT) |>\n  filter(salary > 70) |>\n  group_by(dept) |>\n  summarise(avg_sal = mean(salary), .groups = \"drop\") |>\n  arrange(desc(avg_sal)) |>\n  collect()  # execute and return data.table"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of dtplyr & Arrow — dplyr on Large Data — common patterns you'll see in production.\n# APPROACH  - Combine dtplyr & Arrow — dplyr on Large Data with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── show_query: see generated data.table code ───────────\nlazy_dt(DT) |>\n  filter(salary > 70) |>\n  show_query()\n# DT[salary > 70][, .(avg_sal = mean(salary)), by = dept]\n# ── arrow: open Parquet files lazily ────────────────────\n# Assume data/year=2022/*.parquet, data/year=2023/*.parquet\nds <- open_dataset(\"data/\", partitioning = \"year\")\n# Lazy query (no data loaded yet):\nresult <- ds |>\n  filter(year == 2023, amount > 1000) |>\n  group_by(region) |>\n  summarise(total = sum(amount)) |>\n  collect()  # NOW fetch and return tibble"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of dtplyr & Arrow — dplyr on Large Data — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Arrow with compute functions ────────────────────────\n# Use specialized arrow functions for performance:\nds |>\n  filter(amount > 100) |>\n  group_by(region) |>\n  summarise(\n    count = n(),\n    mean_amount = mean(amount),\n    max_amount = max(amount)\n  ) |>\n  collect()\n# ── Write Parquet files ─────────────────────────────────\narrow::write_parquet(df, \"output/data.parquet\")"
                  }
        ],
        tips: [
                  "dtplyr lets you use dplyr syntax on data.table — best of both worlds.",
                  "Arrow datasets are lazy — filters execute at the file level.",
                  "For >1GB CSV/Parquet, use arrow::open_dataset() instead of loading into memory."
        ],
        mistake: "Loading entire CSV into memory with read.csv() before filtering — use open_dataset() + lazy filter + collect().",
        shorthand: {
          verbose: "// Manual / verbose approach\nDT <- fread(\"large.csv\")\nresult <- DT[amount > 1000]\n// More explicit but longer",
          concise: "open_dataset(\"large.csv\") |> filter(amount > 1000) |> collect()",
        },
      },
      {
        id: "pins-package",
        fn: "pins — Publish & Share Data Objects",
        desc: "pins: save/load R objects, pin_write(), pin_read(), version control.",
        category: "Ecosystem",
        subtitle: "board_folder, board_url, pin_write, pin_read, versions",
        signature: "board <- board_folder(\"data\")  |  pin_write(board, df, \"mydata\")  |  pin_read(board, \"mydata\")",
        descLong: "pins stores and retrieves R objects from various backends (local folder, GitHub, RStudio Connect, Posit Cloud). Version control and metadata built-in. Useful for sharing datasets, caching expensive computations, and team collaboration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pins — Publish & Share Data Objects — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(pins)\n# ── Create local pin board ──────────────────────────────\nboard <- board_folder(\"data/pins\")\n# ── Write pin (save object) ─────────────────────────────\ndf <- data.frame(id = 1:3, value = c(10, 20, 30))\npin_write(board, df, \"my_dataset\",\n  type = \"csv\",\n  title = \"Sample Dataset\",\n  description = \"Example data\"\n)\n# ── Read pin ────────────────────────────────────────────\ndf_loaded <- pin_read(board, \"my_dataset\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pins — Publish & Share Data Objects — common patterns you'll see in production.\n# APPROACH  - Combine pins — Publish & Share Data Objects with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── List pins on board ──────────────────────────────────\npin_list(board)\n# ── Version control ─────────────────────────────────────\n# Each pin_write creates a version:\npin_write(board, df, \"my_dataset\")  # version 1\ndf$value <- df$value * 2\npin_write(board, df, \"my_dataset\")  # version 2\n# Read specific version:\npin_read(board, \"my_dataset\", version = \"20240101T120000Z\")\n# ── GitHub board (share via GitHub) ─────────────────────\ngithub_board <- board_url(\"https://github.com/user/repo/raw/main/pins\")\npin_read(github_board, \"dataset_name\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pins — Publish & Share Data Objects — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Cache expensive computations ────────────────────────\nexpensive_result <- function() {\n  # Check if cached\n  if (pin_exists(board, \"cache_key\")) {\n    return(pin_read(board, \"cache_key\"))\n  }\n  # Compute and save\n  result <- very_expensive_computation()\n  pin_write(board, result, \"cache_key\")\n  result\n}"
                  }
        ],
        tips: [
                  "pins enables sharing datasets across projects without copying files.",
                  "Version control built-in — retrieve old versions if needed.",
                  "GitHub board for public, shareable datasets."
        ],
        mistake: "Copying data files between projects instead of using pins.",
        shorthand: {
          verbose: "// Manual / verbose approach\ndf <- read.csv(\"../../shared_data/dataset.csv\")\n// More explicit but longer",
          concise: "board <- board_url(\"https://github.com/org/repo/raw/main/pins\")\ndf <- pin_read(board, \"dataset\")",
        },
      },
      {
        id: "httr2-package",
        fn: "httr2 — Modern HTTP Client for APIs",
        desc: "httr2: request(), req_perform(), OAuth, rate limiting, retry logic.",
        category: "Ecosystem",
        subtitle: "request, req_headers, req_auth, req_throttle, req_retry",
        signature: "request(url) |> req_headers(...) |> req_perform()  |> resp_body_json()",
        descLong: "httr2 is the modern HTTP client for R. Fluent API for building requests, built-in retry logic, rate limiting, OAuth authentication. Replaces httr with cleaner interface and automatic retries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of httr2 — Modern HTTP Client for APIs — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(httr2)\n# ── Basic request ───────────────────────────────────────\nreq <- request(\"https://api.github.com/users/hadley\")\nresp <- req_perform(req)\nresp_status(resp)     # 200\nresp_body_json(resp)  # Parse JSON\n# ── Headers & query parameters ──────────────────────────\nreq <- request(\"https://api.example.com/users\") |>\n  req_headers(\"Authorization\" = paste(\"Bearer\", Sys.getenv(\"API_TOKEN\"))) |>\n  req_url_query(\n    page = 1,\n    per_page = 50,\n    sort = \"updated\"\n  )\nresp <- req_perform(req)\n# ── Retry logic (automatic retries on failure) ─────────\nreq <- request(\"https://api.example.com/data\") |>\n  req_retry(\n    max_tries = 3,\n    is_transient = function(resp) resp_status(resp) >= 500\n  )"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of httr2 — Modern HTTP Client for APIs — common patterns you'll see in production.\n# APPROACH  - Combine httr2 — Modern HTTP Client for APIs with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Rate limiting ───────────────────────────────────────\n# Throttle: 30 requests per minute\nreq <- request(\"https://api.example.com\") |>\n  req_throttle(rate = 30 / 60)  # requests per second\n# ── OAuth authentication (GitHub example) ───────────────\nreq <- request(\"https://api.github.com/repos/tidyverse/ggplot2\") |>\n  req_auth_bearer_token(Sys.getenv(\"GITHUB_TOKEN\"))\nresp <- req_perform(req)\n# ── Pagination helper ───────────────────────────────────\n# Fetch multiple pages:\npages <- request(\"https://api.example.com/items\") |>\n  req_url_query(per_page = 100) |>\n  req_paginate(\n    by = \"pages\",\n    max_pages = Inf  # fetch all\n  ) |>\n  resp_body_json()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of httr2 — Modern HTTP Client for APIs — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Error handling ──────────────────────────────────────\nresp <- req_perform(req, error_call = caller_env())\n# Access response parts:\nresp_status(resp)       # 200\nresp_headers(resp)      # headers\nresp_body_string(resp)  # raw text\nresp_body_json(resp)    # parse JSON"
                  }
        ],
        tips: [
                  "req_retry automatic retry logic on network errors — essential for API reliability.",
                  "req_throttle respects API rate limits — prevents getting blocked.",
                  "Fluent API (|> chaining) makes requests readable."
        ],
        mistake: "Using httr (old) instead of httr2 — httr2 has cleaner API and auto-retries.",
        shorthand: {
          verbose: "library(httr)\nGET(\"https://api.github.com/users/hadley\",\n    add_headers(\"Authorization\" = paste(\"Bearer\", token)))",
          concise: "library(httr2)\nrequest(\"https://api.github.com/users/hadley\") |>\n  req_auth_bearer_token(token) |>\n  req_perform()",
        },
      },
      {
        id: "dbplyr-package",
        fn: "dbplyr — Translate dplyr to SQL",
        desc: "dbplyr: tbl(), dplyr verbs → SQL translation, show_query(), collect().",
        category: "Ecosystem",
        subtitle: "tbl(con, \"table\"), filter/select/summarise → SQL, show_query, collect",
        signature: "tbl(con, \"users\")  |>  filter(...) |> show_query()  |> collect()",
        descLong: "dbplyr translates dplyr code to SQL queries. Write R code, dbplyr generates SQL, database executes it. Use show_query() to see generated SQL. collect() pulls results into R. Lazy evaluation — only fetches what you select.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of dbplyr — Translate dplyr to SQL — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(dbplyr)\nlibrary(dplyr)\nlibrary(DBI)\n# ── Connect to database ─────────────────────────────────\ncon <- DBI::dbConnect(RSQLite::SQLite(), \"mydb.sqlite\")\n# ── Create lazy table reference (no data fetched yet) ───\nusers_tbl <- tbl(con, \"users\")\n# ── Build query with dplyr verbs ────────────────────────\nresult <- users_tbl |>\n  filter(active == TRUE, created_at > \"2024-01-01\") |>\n  group_by(region) |>\n  summarise(\n    n_users = n(),\n    avg_revenue = mean(revenue, na.rm = TRUE)\n  ) |>\n  arrange(desc(avg_revenue))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of dbplyr — Translate dplyr to SQL — common patterns you'll see in production.\n# APPROACH  - Combine dbplyr — Translate dplyr to SQL with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── show_query: see generated SQL ───────────────────────\nresult |> show_query()\n# SELECT region, COUNT(*) as n_users, AVG(revenue) as avg_revenue\n# FROM users\n# WHERE active = TRUE AND created_at > '2024-01-01'\n# GROUP BY region\n# ORDER BY avg_revenue DESC\n# ── collect: materialize results (fetches to R) ────────\nresult_df <- result |> collect()\n# ── SQL functions dbplyr understands ────────────────────\nusers_tbl |>\n  mutate(\n    year_created = year(created_at),\n    name_upper = toupper(name)\n  ) |>\n  show_query()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of dbplyr — Translate dplyr to SQL — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Window functions ────────────────────────────────────\nusers_tbl |>\n  mutate(rank = row_number(desc(revenue))) |>\n  filter(rank <= 10) |>\n  show_query()\n# ── Custom SQL if needed ────────────────────────────────\n# Fall back to raw SQL:\nDBI::dbGetQuery(con, \"SELECT custom SQL here\")"
                  }
        ],
        tips: [
                  "show_query() to understand what SQL is generated — debug translation issues.",
                  "Lazy evaluation — dplyr doesn't fetch until collect().",
                  "Filter before collect() — let database do the heavy lifting."
        ],
        mistake: "collect() too early in chain — fetches all data before filtering.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Write SQL manually\nresult <- DBI::dbGetQuery(con, \"SELECT region, COUNT(*), AVG(revenue) FROM users WHERE active = 1 GROUP BY region\")\n// More explicit but longer",
          concise: "# dplyr translated to SQL\nresult <- tbl(con, \"users\") |>\n  filter(active == TRUE) |>\n  group_by(region) |>\n  summarise(n = n(), avg_rev = mean(revenue)) |>\n  collect()",
        },
      },
      {
        id: "rvest-web-scraping",
        fn: "rvest — HTML Web Scraping",
        desc: "Parse and extract data from HTML pages using CSS selectors and XPath.",
        category: "Ecosystem",
        subtitle: "read_html, html_elements, html_text2, html_table, xml2",
        signature: "read_html(url) |> html_elements(\".class\") |> html_text2()",
        descLong: "rvest (built on xml2) scrapes static HTML pages: select elements with CSS selectors or XPath, extract text/attributes/tables. For multi-element scraping, pair with purrr::map_dfr to build tidy data frames. For JavaScript-rendered pages, use RSelenium or chromote instead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of rvest — HTML Web Scraping — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(rvest)\nlibrary(purrr)\nlibrary(tibble)\n# ── Basic scraping ────────────────────────────────────\npage <- read_html(\"https://quotes.toscrape.com\")\n# Single element\ntitle <- page |> html_element(\"h1\") |> html_text2()\n# Multiple elements into tidy data frame\nquotes <- page |>\n  html_elements(\".quote\") |>\n  map_dfr(function(q) {\n    tibble(\n      text   = html_element(q, \".text\")   |> html_text2(),\n      author = html_element(q, \".author\") |> html_text2(),\n      tags   = html_elements(q, \".tag\")   |> html_text2() |> list()\n    )\n  })"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of rvest — HTML Web Scraping — common patterns you'll see in production.\n# APPROACH  - Combine rvest — HTML Web Scraping with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Extract attributes ────────────────────────────────\nlinks <- page |>\n  html_elements(\"a\") |>\n  html_attr(\"href\")\nimages <- page |>\n  html_elements(\"img\") |>\n  html_attr(\"src\")\n# ── Extract tables ────────────────────────────────────\ntable_data <- read_html(\"https://example.com/table\") |>\n  html_element(\"table.data\") |>\n  html_table()\n# ── Pagination: scrape multiple pages ─────────────────\nbase_url <- \"https://quotes.toscrape.com/page/\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of rvest — HTML Web Scraping — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nall_quotes <- map_dfr(1:5, function(pg) {\n  Sys.sleep(0.5)  # be polite — rate limit requests\n  read_html(paste0(base_url, pg)) |>\n    html_elements(\".quote\") |>\n    map_dfr(~ tibble(\n      text   = html_element(.x, \".text\")   |> html_text2(),\n      author = html_element(.x, \".author\") |> html_text2()\n    ))\n})"
                  }
        ],
        tips: [
                  "Use html_element() (singular) for the first match; html_elements() (plural) for all matches.",
                  "html_text2() is preferred over html_text() — it converts <br> to newlines and trims whitespace correctly.",
                  "Add Sys.sleep() between page requests — aggressive scraping can get your IP blocked.",
                  "Check robots.txt first: read_html(\"https://example.com/robots.txt\") |> html_text2()"
        ],
        mistake: "Scraping without rate limiting or without checking robots.txt/terms of service. Always add delays (Sys.sleep or httr2::req_throttle) and identify your scraper with a custom User-Agent header.",
        shorthand: {
          verbose: "page <- readLines(\"https://example.com\")\nquotes <- gregexpr(\"<p class=\\\"quote\\\">([^<]+)</p>\", page)\nmatches <- regmatches(page, quotes)\n# Manual regex parsing — fragile and error-prone",
          concise: "read_html(url) |>\n  html_elements(\".quote\") |>\n  html_text2()",
        },
      },
      {
        id: "sf-spatial-data",
        fn: "sf — Spatial Data & Geometry",
        desc: "Read, transform, and visualize geospatial vector data using Simple Features.",
        category: "Ecosystem",
        subtitle: "st_read, st_transform, st_buffer, st_intersection, geom_sf",
        signature: "st_read(\"file.geojson\")  |  st_transform(crs=4326)  |  geom_sf(aes(fill=col))",
        descLong: "sf (Simple Features) is the standard R package for vector geospatial data — points, lines, polygons. It reads GeoJSON, shapefiles, PostGIS, and 20+ other formats. Geometries are stored as a special column in a regular data frame so all dplyr verbs work. Plot with ggplot2 using geom_sf().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sf — Spatial Data & Geometry — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(sf)\nlibrary(ggplot2)\nlibrary(dplyr)\n# ── Read geospatial data ──────────────────────────────\ncounties  <- st_read(\"counties.geojson\")         # GeoJSON\nstates    <- st_read(\"states.shp\")               # Shapefile\n# from PostGIS:\n# counties <- st_read(con, \"counties\")\n# Inspect CRS (coordinate reference system)\nst_crs(counties)              # current CRS\ncounties <- st_transform(counties, crs = 4326)   # WGS84\n# ── sf is a data frame — dplyr verbs work ─────────────\nbig_counties <- counties |>\n  filter(population > 1e6) |>\n  select(name, population, geometry)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sf — Spatial Data & Geometry — common patterns you'll see in production.\n# APPROACH  - Combine sf — Spatial Data & Geometry with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Spatial operations ────────────────────────────────\nbuffered  <- st_buffer(cities, dist = 5000)        # 5km buffer\nclipped   <- st_intersection(counties, buffered)   # spatial join\narea_m2   <- st_area(counties)                     # area in m²\ncentroid  <- st_centroid(counties)                 # centroid points\ndistance  <- st_distance(point_a, point_b)        # distance matrix\n# ── Map with ggplot2 ──────────────────────────────────\nggplot(counties) +\n  geom_sf(aes(fill = population), color = \"white\", linewidth = 0.2) +\n  scale_fill_viridis_c(\n    labels    = scales::comma,\n    trans     = \"log10\",\n    name      = \"Population\"\n  ) +\n  theme_minimal() +\n  labs(title = \"US Counties by Population\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sf — Spatial Data & Geometry — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Overlay points on polygon map\nggplot() +\n  geom_sf(data = counties, fill = \"grey90\") +\n  geom_sf(data = cities, aes(size = pop), color = \"steelblue\") +\n  theme_void()"
                  }
        ],
        tips: [
                  "sf data frames work with all dplyr verbs — filter(), mutate(), group_by() preserve the geometry column automatically.",
                  "Always check CRS with st_crs() before spatial operations — mismatched projections give silent wrong results.",
                  "st_area() returns units (m², km²) from the units package — use as.numeric() to strip units for plotting.",
                  "For raster data (satellite imagery, elevation), use the terra package instead of sf."
        ],
        mistake: "Performing spatial operations on data with mismatched CRS. st_intersection(a, b) where a is EPSG:4326 and b is EPSG:3857 will error or give wrong results — always st_transform() to a common CRS first.",
        shorthand: {
          verbose: "# Old sp package approach\nlibrary(sp)\nspdf <- readOGR(\"counties.shp\")\nspdf <- spTransform(spdf, CRS(\"+proj=longlat\"))",
          concise: "# sf approach\ncounties <- st_read(\"counties.shp\") |>\n  st_transform(crs = 4326)",
        },
      },
      {
        id: "tidytext-text-mining",
        fn: "tidytext — Text Mining & NLP",
        desc: "Tokenize, analyze sentiment, compute TF-IDF, and model topics with tidy text workflows.",
        category: "Ecosystem",
        subtitle: "unnest_tokens, get_sentiments, bind_tf_idf, LDA topic modeling",
        signature: "unnest_tokens(word, text)  |  bind_tf_idf(word, doc, n)  |  LDA(dtm, k=5)",
        descLong: "tidytext converts text into tidy one-token-per-row format, then all standard dplyr/ggplot2 verbs apply. Key workflows: word frequency, sentiment analysis (AFINN/Bing/NRC lexicons), TF-IDF for document importance, and LDA topic modeling. Works seamlessly with gutenbergr, janeaustenr, and custom text corpora.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tidytext — Text Mining & NLP — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidytext)\nlibrary(dplyr)\nlibrary(ggplot2)\n# books is a data frame with columns: book, text\n# (e.g., from janeaustenr::austen_books())\n# ── Tokenize: one word per row ────────────────────────\ntidy_books <- books |>\n  unnest_tokens(word, text) |>        # split text → words\n  anti_join(stop_words, by = \"word\")  # remove \"the\", \"a\", etc.\n# ── Word frequency ────────────────────────────────────\nword_freq <- tidy_books |>\n  count(book, word, sort = TRUE)\n# Plot top words per book\nword_freq |>\n  group_by(book) |>\n  slice_max(n, n = 15) |>\n  ggplot(aes(n, reorder_within(word, n, book), fill = book)) +\n  geom_col(show.legend = FALSE) +\n  scale_y_reordered() +\n  facet_wrap(~ book, scales = \"free_y\") +\n  labs(x = \"Count\", y = NULL)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tidytext — Text Mining & NLP — common patterns you'll see in production.\n# APPROACH  - Combine tidytext — Text Mining & NLP with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── TF-IDF — term importance per document ─────────────\ntf_idf <- tidy_books |>\n  count(book, word) |>\n  bind_tf_idf(word, book, n) |>   # adds tf, idf, tf_idf columns\n  arrange(desc(tf_idf))\n# ── Sentiment analysis ─────────────────────────────────\n# AFINN: numeric score -5 to +5\n# Bing: positive / negative\n# NRC: emotions (joy, fear, anger, ...)\nsentiment_arc <- tidy_books |>\n  inner_join(get_sentiments(\"bing\"), by = \"word\") |>\n  count(book, chapter = as.integer(chapter), sentiment) |>\n  pivot_wider(names_from = sentiment, values_from = n, values_fill = 0) |>\n  mutate(net_sentiment = positive - negative)\n# ── LDA Topic Modeling ────────────────────────────────\nlibrary(topicmodels)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tidytext — Text Mining & NLP — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Create document-term matrix\ndtm <- tidy_books |>\n  count(book, word) |>\n  cast_dtm(book, word, n)\n# Fit LDA model (k = number of topics)\nlda_model <- LDA(dtm, k = 5, control = list(seed = 42))\n# Extract topic-word probabilities\ntopics <- tidy(lda_model, matrix = \"beta\")  # beta = per-topic word prob"
                  }
        ],
        tips: [
                  "unnest_tokens() handles punctuation removal and lowercasing by default — no preprocessing needed.",
                  "Use token = \"ngrams\", n = 2 in unnest_tokens() to tokenize into bigrams instead of single words.",
                  "bind_tf_idf() identifies words distinctive to each document — better than raw frequency for comparison.",
                  "For larger corpora, text2vec or quanteda are faster alternatives to tidytext."
        ],
        mistake: "Not removing stop words before frequency analysis. \"the\", \"and\", \"a\" will dominate every word count. Always anti_join(stop_words) — or use a custom stop word list for domain-specific text.",
        shorthand: {
          verbose: "# Manual word splitting\nwords <- strsplit(paste(text, collapse=\" \"), \"\\\\s+\")[[1]]\nwords <- tolower(words)\nwords <- words[!words %in% c(\"the\",\"a\",\"an\",\"and\",\"or\")]\nword_table <- table(words)",
          concise: "unnest_tokens(word, text) |>\n  anti_join(stop_words) |>\n  count(word, sort = TRUE)",
        },
      },
    ],
  },
]

export default { meta, sections }
