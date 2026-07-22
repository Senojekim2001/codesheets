export const meta = {
  "title": "Workflow & Production",
  "domain": "r",
  "sheet": "workflow",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: Workflow & Production ─────────────────────────────────────────
  {
    id: "r-workflow-all",
    title: "Workflow & Production",
    entries: [
      {
        id: "r-import-export",
        fn: "Data Import & Export",
        desc: "Read and write CSV, Excel, JSON, databases, and APIs in R.",
        category: "R IO",
        subtitle: "readr, readxl, DBI, jsonlite — getting data in and out",
        signature: "read_csv() | read_excel() | dbGetQuery() | fromJSON()",
        descLong: "readr provides fast, type-safe CSV reading with clean defaults. readxl reads Excel files without Java. DBI + dbplyr connects to SQL databases. jsonlite parses JSON. Always use readr over base read.csv for better defaults and performance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Data Import & Export — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(readr)\nlibrary(readxl)\nlibrary(DBI)\nlibrary(jsonlite)\n# ── CSV (readr — preferred) ────────────────────────────\ndf <- read_csv(\"data/sales.csv\")    # auto-detects types\n# With explicit types:\ndf <- read_csv(\"data/sales.csv\",\n  col_types = cols(\n    date       = col_date(\"%Y-%m-%d\"),\n    amount     = col_double(),\n    category   = col_factor()\n  )\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Data Import & Export — common patterns you'll see in production.\n# APPROACH  - Combine Data Import & Export with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Skip rows, select columns:\ndf <- read_csv(\"data.csv\", skip=2,\n               col_select=c(name, amount, date))\n# ── Excel ──────────────────────────────────────────────\ndf <- read_excel(\"data/report.xlsx\")\ndf <- read_excel(\"data/report.xlsx\",\n  sheet = \"Sales\",\n  range = \"A1:E100\",\n  na = c(\"\", \"NA\", \"N/A\")\n)\nexcel_sheets(\"data/report.xlsx\")  # list sheet names\n# ── Write out ──────────────────────────────────────────\nwrite_csv(df, \"output/results.csv\")\nwrite_csv(df, \"output/results.csv.gz\")  # auto-compress!"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Data Import & Export — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Excel output:\nlibrary(writexl)\nwrite_xlsx(list(Sheet1=df1, Sheet2=df2), \"output.xlsx\")\n# ── SQL databases ──────────────────────────────────────\ncon <- dbConnect(RSQLite::SQLite(), \"database.db\")\ndf <- dbGetQuery(con, \"SELECT * FROM sales WHERE amount>100\")\ndbWriteTable(con, \"results\", df, overwrite=TRUE)\ndbDisconnect(con)\n# ── JSON ───────────────────────────────────────────────\njson_data <- fromJSON(\"https://api.example.com/data\")\ndf <- as.data.frame(json_data$results)\ntoJSON(df, pretty=TRUE)          # R → JSON string"
                  }
        ],
        tips: [
                  "`read_csv()` (readr) is 10x faster than `read.csv()` (base R) and doesn't convert strings to factors",
                  "`problems(df)` after read_csv shows any parsing failures — always check on first import",
                  "Use `here::here('data', 'file.csv')` instead of `setwd()` — works across machines and R projects",
                  "For very large files: `data.table::fread()` is the fastest CSV reader in R"
        ],
        mistake: "Using `read.csv()` (base R) instead of `readr::read_csv()`. Base R converts strings to factors (pre-R4.0), uses slower parsing, and has worse error messages. Always use readr.",
        shorthand: {
          verbose: "library(readr)\ndf <- read.csv(\"data.csv\")\nprocessed <- df |> filter(col > 0) |> select(id, value)\nwrite.csv(processed, \"output.csv\")",
          concise: "processed <- read_csv(\"data.csv\") |> filter(col > 0) |> select(id, value)\nwrite_csv(processed, \"output.csv\")",
        },
      },
      {
        id: "r-rmarkdown",
        fn: "R Markdown — Reproducible Reports",
        desc: "Create reproducible reports mixing R code, output, and narrative in one document.",
        category: "R Workflow",
        subtitle: "Weave code and text into HTML, PDF, Word, or slides with knitr",
        signature: "```{r chunk-name, echo=TRUE, fig.height=4}```",
        descLong: "R Markdown and Quarto (its multilingual successor) enable reproducible research by combining code, output, and narrative in one document. Output formats: HTML, PDF, Word, slides, dashboards. Code chunks control what appears in output. Parameterized reports generate customized versions from one template.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of R Markdown — Reproducible Reports — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n---\ntitle: \"Sales Analysis Report\"\nauthor: \"Data Team\"\ndate: \"`r Sys.Date()`\"\noutput:\n  html_document:\n    toc: true\n    toc_float: true\n    theme: flatly\n  pdf_document: default\nparams:\n  region: \"East\"\n  year: 2024\n---\n## Overview\nThis report covers the **`r params$region`** region.\n```{r setup, include=FALSE}\n# setup chunk: run but don't show\nknitr::opts_chunk$set(\n  echo    = TRUE,    # show code\n  warning = FALSE,   # hide warnings\n  message = FALSE,   # hide messages\n  fig.width  = 8,\n  fig.height = 5\n)\nlibrary(dplyr); library(ggplot2)\n```"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of R Markdown — Reproducible Reports — common patterns you'll see in production.\n# APPROACH  - Combine R Markdown — Reproducible Reports with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n```{r load-data}\ndf <- read_csv(\"sales.csv\") |>\n  filter(region == params$region, year == params$year)\nnrow(df)\n```"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of R Markdown — Reproducible Reports — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n```{r summary-table, results='asis'}\ndf |>\n  group_by(dept) |>\n  summarise(total=sum(sales)) |>\n  knitr::kable(caption=\"Sales by Department\")\n```\n```{r plot, fig.cap=\"Monthly trend\", fig.height=4}\nggplot(df, aes(month, sales)) + geom_line() + theme_minimal()\n```\n# ── Key chunk options ──────────────────────────────────\n# echo=FALSE     hide code, show output\n# eval=FALSE     show code, don't run\n# include=FALSE  run code, hide everything\n# results='hide' run code, hide text output\n# cache=TRUE     cache slow chunks\n# fig.height/width  control figure size"
                  }
        ],
        tips: [
                  "Set global options in the `setup` chunk with `knitr::opts_chunk$set()` — avoids repeating options",
                  "`params:` in YAML enables **parameterized reports**: `rmarkdown::render('report.Rmd', params=list(region='West'))`",
                  "Quarto (`.qmd`) is the modern replacement — same syntax, works with Python/Julia too, better IDE support",
                  "`knitr::kable()` + `kableExtra` for publication-quality tables; `gt` package for highly formatted tables"
        ],
        mistake: "Not setting `cache=TRUE` on slow chunks. Every time you render, all code re-runs. Cache expensive computations (model fitting, data loading) — but clear cache when underlying data changes.",
        shorthand: {
          verbose: "---\ntitle: \"Report\"\noutput: html_document\n---\n\n```{r setup, include=FALSE}\nknitr::opts_chunk$set(echo=TRUE)\n```\n\n```{r analysis}\ndata <- read_csv(\"data.csv\")\nmean(data$value)\n```",
          concise: "# R Markdown: YAML + ```{r}` code blocks + inline `r code`",
        },
      },
      {
        id: "r-package-management",
        fn: "Package Management — CRAN, Bioconductor, GitHub",
        desc: "Install, update, and load R packages from CRAN, Bioconductor, and GitHub.",
        category: "R Workflow",
        subtitle: "install.packages, remotes, pak, BiocManager — sourcing packages",
        signature: "install.packages('pkg')  |  remotes::install_github('user/repo')  |  pak::pkg_install()",
        descLong: "R packages come from CRAN (18,000+ packages), Bioconductor (genomics), and GitHub (dev versions). The modern pak package is faster than install.packages and handles conflicts better. Use library() to load; require() for conditional loading in scripts. Namespace conflicts are resolved with conflicted::conflict_prefer().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Package Management — CRAN, Bioconductor, GitHub — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── CRAN packages ──────────────────────────────────────\ninstall.packages(\"dplyr\")                          # single\ninstall.packages(c(\"dplyr\", \"ggplot2\", \"tidyr\"))   # multiple\ninstall.packages(\"dplyr\", dependencies = TRUE)     # with suggests\nlibrary(dplyr)         # load (error if missing)\nrequire(dplyr)         # load (returns FALSE if missing — use in scripts)\n# Manage installed packages\ninstalled.packages()[, c(\"Package\", \"Version\")]  # list installed\nupdate.packages(ask = FALSE)                      # update all\nremove.packages(\"pkg\")                            # uninstall\n# ── pak — faster, modern package installer ─────────────\n# install.packages(\"pak\")\npak::pkg_install(\"dplyr\")                 # from CRAN\npak::pkg_install(\"tidyverse/dplyr\")      # from GitHub\npak::pkg_install(c(\"dplyr\", \"ggplot2\"))  # multiple — parallel\npak::pkg_status(\"dplyr\")                 # check what's installed"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Package Management — CRAN, Bioconductor, GitHub — common patterns you'll see in production.\n# APPROACH  - Combine Package Management — CRAN, Bioconductor, GitHub with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── GitHub / development versions ──────────────────────\n# install.packages(\"remotes\")\nremotes::install_github(\"tidyverse/ggplot2\")        # main branch\nremotes::install_github(\"tidyverse/ggplot2@v3.5.0\") # specific tag\nremotes::install_github(\"user/repo\", ref = \"dev\")   # specific branch"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Package Management — CRAN, Bioconductor, GitHub — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Bioconductor (genomics/bioinformatics) ─────────────\n# install.packages(\"BiocManager\")\nBiocManager::install(\"DESeq2\")\nBiocManager::install(c(\"limma\", \"edgeR\", \"Biostrings\"))\nBiocManager::valid()   # check all Bioc packages are compatible\n# ── Resolve namespace conflicts ────────────────────────\n# install.packages(\"conflicted\")\nlibrary(conflicted)\nconflict_prefer(\"filter\", \"dplyr\")   # use dplyr::filter, not stats::filter\nconflict_prefer(\"lag\",    \"dplyr\")   # use dplyr::lag, not stats::lag"
                  }
        ],
        tips: [
                  "pak is 3-5x faster than install.packages — it installs in parallel and caches downloads. Worth switching to.",
                  "Always use library() not require() at the top of scripts — require() silently returns FALSE instead of erroring.",
                  "`conflicted` package turns all namespace conflicts into errors — forces you to be explicit. Use in all projects.",
                  "`.libPaths()` shows where R looks for packages; useful when troubleshooting installation issues."
        ],
        mistake: "Using library(pkg) inside a function body. This loads the package every time the function is called. Either load at the top of the script, or use pkg::fn() notation for one-off calls inside functions.",
        shorthand: {
          verbose: "install.packages(\"dplyr\")\nlibrary(dplyr)\n# Check for namespace conflicts manually:\n# Warning: 'filter' is masked from 'package:stats'",
          concise: "pak::pkg_install(c(\"dplyr\",\"ggplot2\"))  # parallel, fast\nconflict_prefer(\"filter\", \"dplyr\")       # explicit conflict resolution",
        },
      },
      {
        id: "r-profiling-benchmarking",
        fn: "Profiling & Benchmarking",
        desc: "Find bottlenecks and measure code speed with profvis and bench.",
        category: "R Performance",
        subtitle: "profvis for flame graphs, bench::mark() for micro-benchmarks",
        signature: "profvis({code})  |  bench::mark(expr1, expr2)",
        descLong: "Optimization without measurement is guesswork. profvis creates an interactive flame graph showing where time is spent. bench::mark() runs expressions repeatedly and reports precise timing with memory allocation. The first rule of optimization: profile before optimizing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Profiling & Benchmarking — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(profvis)\nlibrary(bench)\n# ── profvis — find bottlenecks ────────────────────────\nprofvis({\n  n <- 1e6\n  x <- rnorm(n)\n  y <- numeric(n)\n  for (i in seq_along(x)) {  # slow!\n    y[i] <- x[i]^2 + sqrt(abs(x[i]))\n  }\n  mean(y)\n})\n# Opens interactive HTML flamegraph\n# Wide bars = time spent there\n# Click to drill down\n# ── bench::mark — micro-benchmarks ────────────────────\n# Compare approaches:\nx <- 1:1e6\nresults <- bench::mark(\n  loop      = { y <- numeric(length(x)); for(i in seq_along(x)) y[i] <- x[i]^2; y },\n  vectorized = x^2,\n  check = TRUE   # verify all produce same result\n)\nprint(results)\n# # A tibble: 2 × 13\n# expression    min  median `itr/sec`  mem_alloc\n# loop        250ms   260ms      3.8     7.63MB\n# vectorized  3.27ms  3.3ms    299.     3.81MB"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Profiling & Benchmarking — common patterns you'll see in production.\n# APPROACH  - Combine Profiling & Benchmarking with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Common vectorization patterns ────────────────────\n# Instead of loop:\ny <- numeric(n)\nfor (i in 1:n) y[i] <- x[i] * 2   # slow: 100ms\n# Vectorized:\ny <- x * 2                           # fast: 1ms\n# Instead of growing vector:\nresult <- c()\nfor (val in x) result <- c(result, val^2)  # O(n²)!\n# Pre-allocate:\nresult <- numeric(length(x))\nfor (i in seq_along(x)) result[i] <- x[i]^2  # O(n)\n# Even better:\nresult <- x^2                        # fully vectorized"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Profiling & Benchmarking — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Memory-efficient patterns ─────────────────────────\nobject.size(big_df)          # size in bytes\npryr::object_size(big_df)    # more accurate (shared mem)\nlobstr::obj_size(big_df)     # best (from lobstr package)\ngc()                         # force garbage collection\nrm(list=ls())                # remove all objects"
                  }
        ],
        tips: [
                  "Profile BEFORE optimizing — the bottleneck is almost never where you think it is",
                  "Vectorization is usually the biggest win in R — replacing a loop with a vectorized operation can give 10-100x speedup",
                  "Pre-allocate vectors: `vector('numeric', n)` not `c()` in a loop — growing vectors are O(n²)",
                  "`Rprof()` + `summaryRprof()` is the base R profiler — works everywhere, no packages needed"
        ],
        mistake: "Growing a results vector in a loop with `result <- c(result, new_value)`. Each iteration copies the entire vector — O(n²) total work. Pre-allocate with `result <- vector('list', n)` or use `lapply()`.",
        shorthand: {
          verbose: "library(profvis)\nprofvis({ slow_function(data) })\n\nlibrary(bench)\nbench::mark(expr1, expr2)",
          concise: "profvis({code}); bench::mark(expr1, expr2)",
        },
      },
      {
        id: "r-parallel",
        fn: "Parallel Processing: parallel, future, furrr",
        desc: "Use multiple CPU cores to speed up embarrassingly parallel tasks.",
        category: "R Parallel",
        subtitle: "mclapply, future_map, foreach — split work across cores",
        signature: "future::plan(multisession)  |  furrr::future_map(x, f)",
        descLong: "R is single-threaded by default. For embarrassingly parallel tasks (same operation on independent chunks), parallelism gives near-linear speedup with core count. The future/furrr ecosystem is the modern approach — write regular purrr code, change the plan() to parallelize.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Parallel Processing: parallel, future, furrr — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Detect cores ──────────────────────────────────────\nparallel::detectCores()       # total logical cores\nparallel::detectCores() - 1  # leave 1 for OS (good practice)\n# ══ parallel package (base) ═══════════════════════════\nlibrary(parallel)\n# mclapply — Unix/Mac (fork-based, very fast)\nresults <- mclapply(1:100, function(i) {\n  slow_computation(i)\n}, mc.cores = parallel::detectCores() - 1)\n# parLapply — Windows-compatible (PSOCK cluster)\ncl <- makeCluster(4)\nclusterExport(cl, c(\"my_data\", \"helper_fn\"))  # export objects\nresults <- parLapply(cl, 1:100, function(i) {\n  slow_computation(i)\n})\nstopCluster(cl)   # always clean up!"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Parallel Processing: parallel, future, furrr — common patterns you'll see in production.\n# APPROACH  - Combine Parallel Processing: parallel, future, furrr with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ══ future + furrr (modern, recommended) ══════════════\nlibrary(future)\nlibrary(furrr)\nlibrary(purrr)\n# Choose execution plan:\nplan(sequential)       # single-threaded (default)\nplan(multisession, workers=4)  # multiple R sessions\nplan(multicore, workers=4)     # fork (Mac/Linux only)\nplan(cluster, workers=cl)      # existing cluster\n# Write exactly like purrr — just swap map_ for future_map_:\nresults <- future_map(1:100, slow_computation)\nresults <- future_map_dbl(1:100, slow_computation)\nresults <- future_map_dfr(datasets, fit_model)\n# Progress bar:\nresults <- future_map(\n  1:100, slow_computation,\n  .progress = TRUE\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Parallel Processing: parallel, future, furrr — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Reset to sequential:\nplan(sequential)\n# ══ foreach + doParallel ════════════════════════════════\nlibrary(foreach)\nlibrary(doParallel)\nregisterDoParallel(cores=4)\nresults <- foreach(i=1:100, .combine=rbind) %dopar% {\n  slow_computation(i)\n}\nstopImplicitCluster()"
                  }
        ],
        tips: [
                  "**furrr** is the easiest path to parallelism — just `plan(multisession)` then use `future_map()` instead of `map()`",
                  "Export needed objects explicitly in PSOCK clusters: `clusterExport(cl, varlist)` — they don't inherit the global environment",
                  "Parallel is only worth it when task time >> overhead — for <1s tasks, overhead dominates",
                  "Always `stopCluster(cl)` or `plan(sequential)` when done — leaked workers consume memory and CPU"
        ],
        mistake: "Using `mclapply()` on Windows. Fork-based parallelism doesn't work on Windows — use `parLapply()` or `future_map()` with `plan(multisession)` which works cross-platform.",
        shorthand: {
          verbose: "library(parallel)\ncl <- makeCluster(4)\nresults <- parLapply(cl, data, function)\nstopCluster(cl)",
          concise: "plan(multisession); future_map(data, function)",
        },
      },
      {
        id: "r-rcpp",
        fn: "Rcpp — C++ from R",
        desc: "Write C++ functions callable from R for maximum performance.",
        category: "R Performance",
        subtitle: "When vectorization isn't enough — compile C++ directly in R",
        signature: "cppFunction('...')  |  sourceCpp('file.cpp')",
        descLong: "Rcpp makes it easy to write C++ functions and call them from R. Use when: an algorithm fundamentally requires loops that can't be vectorized, you need exact floating-point control, or you're hitting R's speed ceiling. The Rcpp Sugar syntax makes C++ look almost like R.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Rcpp — C++ from R — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(Rcpp)\n# ── Quick inline C++ function ─────────────────────────\ncppFunction('\ndouble meanC(NumericVector x) {\n  int n = x.size();\n  double total = 0;\n  for (int i = 0; i < n; i++) {\n    total += x[i];\n  }\n  return total / n;\n}')\nmeanC(c(1.0, 2.0, 3.0, 4.0))  # 2.5 — callable like R fn\n# ── sourceCpp — from a .cpp file ──────────────────────\n# File: fast_cumsum.cpp\n# #include <Rcpp.h>\n# using namespace Rcpp;\n#\n# // [[Rcpp::export]]\n# NumericVector fast_cumsum(NumericVector x) {\n#   int n = x.size();\n#   NumericVector out(n);\n#   out[0] = x[0];\n#   for (int i = 1; i < n; i++) {\n#     out[i] = out[i-1] + x[i];\n#   }\n#   return out;\n# }"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Rcpp — C++ from R — common patterns you'll see in production.\n# APPROACH  - Combine Rcpp — C++ from R with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nsourceCpp(\"fast_cumsum.cpp\")\nfast_cumsum(1:5)   # 1 3 6 10 15"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Rcpp — C++ from R — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Rcpp Sugar — R-like C++ ───────────────────────────\n# In C++ with Rcpp:\n# NumericVector x — like R numeric vector\n# sum(x), mean(x), max(x) — R-like functions work!\n# x[x > 0]  — logical subsetting works!\n# ── Common Rcpp types ─────────────────────────────────\n# NumericVector, IntegerVector, CharacterVector, LogicalVector\n# NumericMatrix, DataFrame, List\n# double, int, bool, std::string (scalars)\n# ── When NOT to use Rcpp ──────────────────────────────\n# If a vectorized R solution exists → use R\n# If data.table already solves it → use data.table\n# Rcpp adds compilation overhead and C++ debugging complexity\n# Reserve for: true algorithmic bottlenecks, recursive algorithms"
                  }
        ],
        tips: [
                  "Start with `cppFunction()` for quick experiments — no file management needed",
                  "Rcpp Sugar lets you use R-like syntax in C++ (`sum()`, `mean()`, logical indexing) — drastically reduces code",
                  "Benchmark before and after: `bench::mark(r_version(), cpp_version())` — confirm the speedup justifies complexity",
                  "The `// [[Rcpp::export]]` comment above a C++ function is what makes it visible to R"
        ],
        mistake: "Rewriting an already-vectorized R function in Rcpp hoping for speedup. `x^2 + sqrt(x)` in R is already calling optimized C code — Rcpp won't be faster. Rcpp helps when you NEED a loop that can't be vectorized.",
        shorthand: {
          verbose: "cppFunction('\ndouble fastFunc(NumericVector x) {\n  double sum = 0;\n  for (int i = 0; i < x.size(); i++) sum += x[i];\n  return sum;\n}')",
          concise: "cppFunction('type func(...) { C++ code }'); func(data)",
        },
      },
      {
        id: "r-httr2-apis",
        fn: "httr2 — HTTP & REST APIs",
        desc: "Make HTTP requests to REST APIs from R.",
        category: "R Web",
        subtitle: "GET, POST, authentication, pagination, and response parsing",
        signature: "request(url) |> req_headers() |> req_perform() |> resp_body_json()",
        descLong: "httr2 is the modern R HTTP client (successor to httr). It uses a pipe-based request builder: construct a request object, add headers/body/auth, perform it, parse the response. Handles authentication, rate limiting, retries, and pagination.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of httr2 — HTTP & REST APIs — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(httr2)\nlibrary(jsonlite)\n# ── Basic GET request ─────────────────────────────────\nresp <- request(\"https://api.github.com/users/hadley\") |>\n  req_headers(Accept = \"application/vnd.github.v3+json\") |>\n  req_perform()\nresp_status(resp)         # 200\nresp_content_type(resp)   # \"application/json\"\ndata <- resp_body_json(resp)\ndata$public_repos          # number of public repos\n# ── POST with JSON body ───────────────────────────────\nresp <- request(\"https://api.example.com/data\") |>\n  req_method(\"POST\") |>\n  req_headers(\n    \"Authorization\" = paste(\"Bearer\", Sys.getenv(\"API_KEY\")),\n    \"Content-Type\"  = \"application/json\"\n  ) |>\n  req_body_json(list(\n    query = \"SELECT * FROM sales\",\n    limit = 100\n  )) |>\n  req_perform()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of httr2 — HTTP & REST APIs — common patterns you'll see in production.\n# APPROACH  - Combine httr2 — HTTP & REST APIs with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Authentication ─────────────────────────────────────\n# Bearer token:\nreq_headers(\"Authorization\" = paste(\"Bearer\", token))\n# Basic auth:\nreq_auth_basic(username, password)\n# OAuth2:\nreq_oauth_client_credentials(client)\n# ── Error handling ────────────────────────────────────\nresp <- request(url) |>\n  req_error(is_error = \\(resp) FALSE) |>  # don't throw on 4xx/5xx\n  req_perform()\nif (resp_status(resp) != 200) {\n  stop(\"API error: \", resp_status(resp))\n}\n# ── Retry and rate limiting ───────────────────────────\nrequest(url) |>\n  req_retry(max_tries = 3, backoff = ~2) |>  # retry up to 3×\n  req_throttle(rate = 60/60) |>              # 60 req/minute\n  req_perform()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of httr2 — HTTP & REST APIs — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Pagination ────────────────────────────────────────\nresps <- request(\"https://api.example.com/items\") |>\n  req_url_query(per_page=100) |>\n  req_perform_iterative(\n    next_req = iterate_with_link_url(\"next\"),  # follow Link header\n    max_reqs = 10\n  )\nall_data <- resps |> resps_data(\\(r) resp_body_json(r)$items)"
                  }
        ],
        tips: [
                  "Store API keys in `.Renviron` (never hardcode): `usethis::edit_r_environ()` then `Sys.getenv('API_KEY')`",
                  "`req_dry_run()` prints the full request without sending it — invaluable for debugging auth headers",
                  "httr2's `req_perform_iterative()` handles pagination cleanly — no manual while loop",
                  "`resp_body_string()`, `resp_body_raw()`, `resp_body_json()`, `resp_body_xml()` — pick based on content type"
        ],
        mistake: "Hardcoding API keys in scripts. Anyone with the script has your key. Store in `.Renviron` with `API_KEY=xyz123` and read with `Sys.getenv('API_KEY')`.",
        shorthand: {
          verbose: "library(httr2)\nresp <- request(\"https://api.example.com\") |>\n  req_headers(Authorization = paste(\"Bearer\", token)) |>\n  req_perform()\ndata <- resp_body_json(resp)",
          concise: "resp <- request(url) |> req_headers(...) |> req_perform()",
        },
      },
      {
        id: "r-dbplyr",
        fn: "DBI + dbplyr — Databases",
        desc: "Query databases with SQL or dplyr syntax — results pulled into R only when needed.",
        category: "R Database",
        subtitle: "Lazy evaluation: build queries in dplyr, translate to SQL, collect results",
        signature: "tbl(con, 'table') |> filter() |> collect()",
        descLong: "DBI provides a unified database interface. dbplyr translates dplyr code to SQL — you write dplyr, the database executes SQL. Results aren't pulled into R until you call collect(). This enables working with tables larger than memory — the database does the heavy lifting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of DBI + dbplyr — Databases — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(DBI)\nlibrary(dbplyr)\nlibrary(dplyr)\n# ── Connect ────────────────────────────────────────────\n# SQLite:\ncon <- dbConnect(RSQLite::SQLite(), \"database.db\")\n# PostgreSQL:\ncon <- dbConnect(RPostgres::Postgres(),\n  host     = Sys.getenv(\"DB_HOST\"),\n  dbname   = \"analytics\",\n  user     = Sys.getenv(\"DB_USER\"),\n  password = Sys.getenv(\"DB_PASS\")\n)\n# ── Raw SQL ────────────────────────────────────────────\ndbListTables(con)                        # list all tables\ndbGetQuery(con, \"SELECT * FROM sales LIMIT 5\")\ndbExecute(con, \"CREATE INDEX idx ON sales(date)\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of DBI + dbplyr — Databases — common patterns you'll see in production.\n# APPROACH  - Combine DBI + dbplyr — Databases with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── dbplyr lazy tables ─────────────────────────────────\nsales_tbl <- tbl(con, \"sales\")   # just a reference, no data pulled\n# Build a query — stays in database:\nquery <- sales_tbl |>\n  filter(year == 2024) |>\n  group_by(region) |>\n  summarise(total = sum(amount), n = n())\n# See the SQL that will be run:\nshow_query(query)\n# <SQL>\n# SELECT region, SUM(amount) AS total, COUNT(*) AS n\n# FROM sales\n# WHERE year = 2024\n# GROUP BY region\n# Pull results into R:\nresult <- query |> collect()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of DBI + dbplyr — Databases — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Write data ────────────────────────────────────────\ndbWriteTable(con, \"results\", df, overwrite=TRUE)\ndbAppendTable(con, \"results\", new_rows)  # append\n# ── Transactions ─────────────────────────────────────\ndbWithTransaction(con, {\n  dbExecute(con, \"UPDATE accounts SET balance = balance - 100 WHERE id = 1\")\n  dbExecute(con, \"UPDATE accounts SET balance = balance + 100 WHERE id = 2\")\n  # Both succeed or both roll back\n})\n# ── Always disconnect ─────────────────────────────────\ndbDisconnect(con)"
                  }
        ],
        tips: [
                  "**Lazy evaluation**: dbplyr builds SQL but doesn't run it until `collect()` — build your full query before collecting",
                  "`show_query()` is essential for understanding what SQL is being generated and debugging wrong results",
                  "Use `in_schema('schema', 'table')` for database schemas: `tbl(con, in_schema('dbo', 'sales'))`",
                  "`copy_to(con, df, 'temp_table', temporary=TRUE)` uploads a local data frame as a temp table for joining with DB tables"
        ],
        mistake: "Calling `collect()` too early — before filtering and aggregating. This pulls the entire table into R then does the work in R. Keep operations lazy (in the database) until you have a small result set, then collect.",
        shorthand: {
          verbose: "library(DBI)\ncon <- dbConnect(RSQLite::SQLite(), \"db.db\")\nresults <- dbGetQuery(con, \"SELECT * FROM table\")\ndbDisconnect(con)",
          concise: "tbl(con, \"table\") |> filter(col > 0) |> collect()",
        },
      },
      {
        id: "r-shiny-basics",
        fn: "Shiny Basics",
        desc: "Build interactive web apps from R with reactive programming.",
        category: "R Shiny",
        subtitle: "ui + server + reactive() — the three-part Shiny model",
        signature: "ui <- fluidPage(...)  |  server <- function(input,output,session){}",
        descLong: "Shiny turns R code into interactive web applications without HTML/CSS/JS. The UI defines layout and inputs. The server contains reactive logic — outputs automatically recalculate when inputs change. Reactivity is the core concept: `reactive()` caches computed values, `observe()` runs side effects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Shiny Basics — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\nlibrary(ggplot2)\nlibrary(dplyr)\n# ── UI ────────────────────────────────────────────────\nui <- fluidPage(\n  titlePanel(\"Sales Dashboard\"),\n  sidebarLayout(\n    sidebarPanel(\n      selectInput(\"dept\", \"Department:\",\n                  choices = c(\"All\", \"IT\", \"HR\", \"Finance\"),\n                  selected = \"All\"),\n      sliderInput(\"min_salary\", \"Minimum Salary:\",\n                  min=0, max=200000, value=50000, step=10000,\n                  pre=\"$\"),\n      dateRangeInput(\"dates\", \"Date Range:\",\n                     start=\"2024-01-01\", end=\"2024-12-31\"),\n      actionButton(\"refresh\", \"Refresh\", class=\"btn-primary\")\n    ),"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Shiny Basics — common patterns you'll see in production.\n# APPROACH  - Combine Shiny Basics with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nmainPanel(\n      tabsetPanel(\n        tabPanel(\"Plot\",  plotOutput(\"salary_plot\")),\n        tabPanel(\"Table\", DT::dataTableOutput(\"data_table\")),\n        tabPanel(\"Summary\", verbatimTextOutput(\"summary\"))\n      )\n    )\n  )\n)\n# ── Server ────────────────────────────────────────────\nserver <- function(input, output, session) {\n  # reactive() — cached computation, reruns when inputs change:\n  filtered_data <- reactive({\n    df <- employees\n    if (input$dept != \"All\") df <- df |> filter(dept == input$dept)\n    df |> filter(salary >= input$min_salary)\n  })\n  # render* — produce output:\n  output$salary_plot <- renderPlot({\n    ggplot(filtered_data(), aes(dept, salary, fill=dept)) +\n      geom_boxplot() + theme_minimal() +\n      labs(title=paste(\"Filtered:\", nrow(filtered_data()), \"employees\"))\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Shiny Basics — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\noutput$data_table <- DT::renderDataTable({\n    filtered_data()\n  })\n  output$summary <- renderPrint({\n    summary(filtered_data()$salary)\n  })\n  # observe() — side effects (no return value):\n  observe({\n    req(input$refresh)  # only run if button clicked\n    showNotification(\"Data refreshed!\", type=\"message\")\n  })\n}\n# ── Run ───────────────────────────────────────────────\nshinyApp(ui=ui, server=server)"
                  }
        ],
        tips: [
                  "`reactive()` caches its result — only recomputes when its inputs change. Multiple outputs can use the same reactive without recomputing",
                  "`req()` silently stops execution if its argument is NULL/empty — prevents errors before user makes a selection",
                  "`isolate()` reads a reactive value WITHOUT creating a reactive dependency — useful for reading input inside `observe()` without triggering re-execution",
                  "Deploy to shinyapps.io: `rsconnect::deployApp()` — free tier available"
        ],
        mistake: "Putting expensive computation directly in `renderPlot()` instead of a `reactive()`. If the same data is used by three outputs, the computation runs three times. Wrap it in `reactive()` and call `filtered_data()` in each render function.",
        shorthand: {
          verbose: "ui <- fluidPage(\n  selectInput(\"var\", \"Choose:\", choices),\n  plotOutput(\"plot\")\n)\nserver <- function(input, output) {\n  output$plot <- renderPlot(ggplot(...))\n}\nshinyApp(ui, server)",
          concise: "reactive({code})  # auto-updates when inputs change",
        },
      },
      {
        id: "rproject-structure",
        fn: "R Project Structure",
        desc: "Organize R projects with usethis, here, and RStudio projects.",
        category: "R Workflow",
        subtitle: "usethis::create_project(), here::here(), directory layout, .Rproj files",
        signature: "usethis::create_project()  |  here::here()  |  dir structure",
        descLong: "R projects provide isolated working environments with consistent file paths across machines. usethis::create_project() creates a new project with .Rproj file and renv setup. The here package constructs paths relative to project root. Proper structure (data-raw/, R/, analysis/, outputs/) keeps code organized and reproducible.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of R Project Structure — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(usethis)\nlibrary(here)\n# ── Create new project ──────────────────────────────────\nusethis::create_project(\"~/projects/sales-analysis\")\n# Creates: .Rproj, .Rbuildignore, .gitignore, renv/, etc.\n# ── Working with here() ─────────────────────────────────\nhere()                              # project root\nhere(\"data\", \"raw\", \"sales.csv\")   # /path/to/project/data/raw/sales.csv\nread_csv(here(\"data\", \"sales.csv\")) # works on any machine"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of R Project Structure — common patterns you'll see in production.\n# APPROACH  - Combine R Project Structure with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# .here file (created automatically) signals project root\n# ── Recommended structure ───────────────────────────────\n# project/\n#  ├── project.Rproj           ← Open this to activate project\n#  ├── README.md\n#  ├── renv.lock               ← Package versions\n#  ├── .here                   ← Marker file (auto-created)\n#  ├── data/\n#  │    ├── raw/               ← Original, never modify"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of R Project Structure — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#  │    └── processed/         ← Cleaned/transformed\n#  ├── R/\n#  │    ├── utils.R            ← Reusable functions\n#  │    └── analysis.R         ← Analysis code\n#  ├── analysis/\n#  │    └── 01-exploratory.Rmd ← Notebooks\n#  └── outputs/\n#       ├── figures/\n#       └── tables/"
                  }
        ],
        tips: [
                  "Use RStudio Projects (.Rproj) — they set working directory and enable here() automatically",
                  "Never use setwd() — it breaks reproducibility. Always use here()",
                  "Place raw data in data/raw/ and never modify it — all processing goes in scripts",
                  "Name analysis scripts with numbers: 01-, 02- makes execution order clear"
        ],
        mistake: "Using setwd('/Users/alice/projects/data') in a script. Path doesn't exist on other machines. Use here('data', 'file.csv') — works everywhere.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(usethis)\nlibrary(here)\n# ── Create new project ──────────────────────────────────\nusethis::create_project(\"~/projects/sales-analysis\")\n# Creates: .Rproj, .Rbuildignore, .gitignore, renv/, etc.\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n#       └── tables/",
        },
      },
      {
        id: "here-package",
        fn: "here Package — Project-Relative Paths",
        desc: "Construct file paths relative to project root for reproducibility.",
        category: "R Workflow",
        subtitle: "here() for portable paths, .here marker file",
        signature: "here('folder', 'file.csv')  |  here() for root",
        descLong: "The here package solves the setwd() problem. It finds the project root by looking for .Rproj, .git, or .here file, then builds paths relative to that root. Works on Windows/Mac/Linux without modification. Essential for reproducible research.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of here Package — Project-Relative Paths — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(here)\n# ── Find project root ───────────────────────────────────\nhere()  # /Users/alice/projects/my-analysis\n# ── Build paths ────────────────────────────────────────\nhere(\"data\", \"raw\", \"sales.csv\")\n# /Users/alice/projects/my-analysis/data/raw/sales.csv"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of here Package — Project-Relative Paths — common patterns you'll see in production.\n# APPROACH  - Combine here Package — Project-Relative Paths with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Use with readr ────────────────────────────────────\ndf <- read_csv(here(\"data\", \"raw\", \"sales.csv\"))\nprocessed <- df |> filter(amount > 0)\nwrite_csv(processed, here(\"data\", \"processed\", \"clean_sales.csv\"))\n# ── Create .here file explicitly ──────────────────────\n# Usually created by usethis::create_project()\n# Or manually:\nhere::set_here()  # creates .here in current directory"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of here Package — Project-Relative Paths — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Check what here finds ──────────────────────────────\nhere::dr_here()  # prints debug info about root detection"
                  }
        ],
        tips: [
                  "here() automatically finds project root — use it everywhere instead of setwd()",
                  "Combine with renv for complete reproducibility — locked package versions + portable paths",
                  "here() understands .Rproj, .git, .here, and DESCRIPTION files — add .here if none exist",
                  "Always use / in paths, never \\\\ — here() handles platform differences"
        ],
        mistake: "Mixing setwd() and here(). Pick one: if you use here(), never call setwd(). If you use setwd(), relative paths break on other machines.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(here)\n# ── Find project root ───────────────────────────────────\nhere()  # /Users/alice/projects/my-analysis\n# ── Build paths ────────────────────────────────────────\nhere(\"data\", \"raw\", \"sales.csv\")\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nhere::dr_here()  # prints debug info about root detection",
        },
      },
      {
        id: "renv-basics",
        fn: "renv — Reproducible Package Environments",
        desc: "Lock package versions to ensure reproducibility across machines.",
        category: "R Workflow",
        subtitle: "renv::init(), renv::snapshot(), renv::restore(), renv.lock",
        signature: "renv::init()  |  renv::snapshot()  |  renv::restore()",
        descLong: "renv creates per-project package libraries with locked versions (like Python's virtualenv). renv::init() initializes a project. renv::snapshot() records current package versions to renv.lock. renv::restore() installs exact versions from renv.lock. Commit renv.lock to version control but not the library folder.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of renv — Reproducible Package Environments — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(renv)\n# ── Initialize renv in project ──────────────────────────\nrenv::init()\n# Creates: renv.lock, renv/ folder, .Rprofile\n# Automatically discovers dependencies in project\n# ── Check status ────────────────────────────────────────\nrenv::status()  # shows differences from renv.lock\n# ── Save current environment ────────────────────────────\nrenv::snapshot()  # updates renv.lock with current versions\n# Include when: adding packages, updating, before committing\n# ── Restore from lock file (on new machine) ────────────\nrenv::restore()  # installs exact versions from renv.lock"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of renv — Reproducible Package Environments — common patterns you'll see in production.\n# APPROACH  - Combine renv — Reproducible Package Environments with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── View renv.lock content ─────────────────────────────\n# renv.lock is JSON:\n# {\n#   \"R\": { \"Version\": \"4.3.0\" },\n#   \"Repositories\": [...],\n#   \"Packages\": {\n#     \"ggplot2\": { \"Package\": \"ggplot2\", \"Version\": \"3.4.2\", \"Source\": \"Repository\" },\n#     \"dplyr\": { \"Package\": \"dplyr\", \"Version\": \"1.1.2\", \"Source\": \"Repository\" }\n#   }\n# }\n# ── Common workflows ────────────────────────────────────\n# Add new package:\ninstall.packages(\"tidymodels\")\nrenv::snapshot()  # record version"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of renv — Reproducible Package Environments — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Update all packages:\nrenv::update()\nrenv::snapshot()  # record new versions\n# Use specific package version:\nrenv::install(\"ggplot2@3.3.6\")  # pin to version 3.3.6\nrenv::snapshot()\n# ── Clean up ────────────────────────────────────────────\nrenv::clean()  # remove unused packages from library"
                  }
        ],
        tips: [
                  "Always renv::snapshot() after changing packages — commit renv.lock but not renv/library/",
                  "renv.lock is human-readable JSON — you can manually pin versions if needed",
                  "Use renv::activate() in .Rprofile to auto-activate for that project",
                  "renv::purge() deletes package cache — useful to free disk space (safe to run anytime)"
        ],
        mistake: "Sharing renv/library/ folder across machines. Library contains compiled binaries specific to OS/R version. Share renv.lock, not the library.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(renv)\n# ── Initialize renv in project ──────────────────────────\nrenv::init()\n# Creates: renv.lock, renv/ folder, .Rprofile\n# Automatically discovers dependencies in project\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nrenv::clean()  # remove unused packages from library",
        },
      },
      {
        id: "targets-basics",
        fn: "targets — Pipeline & Dependency Management",
        desc: "Build reproducible data pipelines with automatic dependency tracking.",
        category: "R Workflow",
        subtitle: "tar_target(), _targets.R, tar_make(), dynamic branching",
        signature: "tar_target(name, expr)  |  tar_make()  |  tar_visnetwork()",
        descLong: "targets is a pipeline tool for R that builds reproducible workflows with automatic caching. Define targets (computation steps) in _targets.R. tar_make() runs the pipeline, caching results. If upstream targets change, only downstream targets re-run. Dynamic branching maps computations across data subsets. Excellent for analyses with multiple models or data sources.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of targets — Pipeline & Dependency Management — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(targets)\nlibrary(dplyr)\nlibrary(ggplot2)\n# ── _targets.R (pipeline definition) ────────────────────\n# tar_target(name, command)\n# tar_target(name, command, pattern = map(var))  for branching\nlist(\n  # Load data\n  tar_target(\n    raw_data,\n    read_csv(here(\"data\", \"raw\", \"sales.csv\"))\n  ),\n  # Clean data\n  tar_target(\n    clean_data,\n    raw_data |>\n      filter(amount > 0, !is.na(date)) |>\n      mutate(date = as.Date(date))\n  ),"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of targets — Pipeline & Dependency Management — common patterns you'll see in production.\n# APPROACH  - Combine targets — Pipeline & Dependency Management with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Split by department (dynamic branching)\n  tar_target(\n    dept_data,\n    clean_data |> filter(department == dept),\n    pattern = cross(dept = unique(clean_data$department))\n  ),\n  # Fit model per department\n  tar_target(\n    dept_model,\n    lm(amount ~ date, data = dept_data),\n    pattern = map(dept_data)\n  ),\n  # Generate plot\n  tar_target(\n    summary_plot,\n    ggplot(clean_data, aes(date, amount, color=department)) +\n      geom_point() + geom_smooth() + theme_minimal()\n  ),"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of targets — Pipeline & Dependency Management — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Final report\n  tar_render(\n    report,\n    here(\"analysis\", \"report.Rmd\")\n  )\n)\n# ── In console ──────────────────────────────────────────\ntar_make()          # run pipeline\ntar_visnetwork()    # visualize dependency graph\ntar_load(clean_data)  # load result into R\ntar_read(clean_data)  # read without loading\ntar_cache_size()    # size of cached results"
                  }
        ],
        tips: [
                  "targets only re-runs affected targets — if you change 02-clean.R, only clean & downstream targets re-run",
                  "Use tar_visnetwork() to understand your pipeline — helps catch missing dependencies",
                  "tar_target() + tar_render() integrates Rmd reports — re-knits only if inputs change",
                  "Pattern = cross() for all combinations, pattern = map() for parallel iteration"
        ],
        mistake: "Hardcoding file paths instead of using tar_target(). If file location changes, pipeline breaks. Always make data loading a target.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(targets)\nlibrary(dplyr)\nlibrary(ggplot2)\n# ── _targets.R (pipeline definition) ────────────────────\n# tar_target(name, command)\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\ntar_cache_size()    # size of cached results",
        },
      },
      {
        id: "git-r",
        fn: "Git with R — Repositories, .gitignore, usethis",
        desc: "Initialize Git repos, configure .gitignore, and manage credentials.",
        category: "R Workflow",
        subtitle: "usethis::use_git(), .gitignore for R, credential helpers",
        signature: "usethis::use_git()  |  usethis::use_github()  |  gitcreds::gitcreds_set()",
        descLong: "usethis provides helpers for Git/GitHub integration. use_git() initializes a repo. use_github() creates/links GitHub repo. Proper .gitignore excludes R build artifacts, credentials, and large files. Store API keys in .Renviron, never commit them. gitcreds manages GitHub PAT (personal access token).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Git with R — Repositories, .gitignore, usethis — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(usethis)\nlibrary(gitcreds)\n# ── Initialize Git repo ─────────────────────────────────\nusethis::use_git()\n# Creates .git/, .gitignore, commits initial files\n# ── Create GitHub repo and link ─────────────────────────\nusethis::use_github(\n  organization = NULL,  # NULL for personal repo\n  private = FALSE,\n  protocol = \"https\"    # or \"ssh\"\n)\n# ── Configure R .gitignore ────────────────────────────\n# usethis::use_git() creates R-specific .gitignore with:\n# .Rproj.user/       ← RStudio project settings\n# .Rhistory          ← R command history\n# .RData              ← R session data\n# .Ruserdata          ← RStudio user settings\n# *.Rproj             ← if not tracking project file"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Git with R — Repositories, .gitignore, usethis — common patterns you'll see in production.\n# APPROACH  - Combine Git with R — Repositories, .gitignore, usethis with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Add to .gitignore manually:\n# .env                ← environment variables\n# renv/library/       ← per-machine package library\n# data/raw/           ← if file is large\n# outputs/*.csv       ← if generated files are large\n# ── Store API credentials securely ──────────────────────\n# In .Renviron (never committed):\n# API_KEY=xyz123\n# DB_PASSWORD=secret\nusethis::edit_r_environ()  # open .Renviron for editing\n# Access in code:\napi_key <- Sys.getenv(\"API_KEY\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Git with R — Repositories, .gitignore, usethis — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Set GitHub credentials ──────────────────────────────\ngitcreds::gitcreds_set()  # interactive, stores PAT securely\n# Check connection:\ngitcreds::gitcreds_get()   # view stored token (masked)\n# ── usethis helpers for GitHub ─────────────────────────\nusethis::use_github_links()     # add GitHub links to DESCRIPTION\nusethis::use_github_action()    # set up CI/CD workflows"
                  }
        ],
        tips: [
                  "Always use usethis::use_git() instead of git init manually — it creates proper .gitignore for R",
                  "Store secrets in .Renviron or .Rprofile (local, never commit) — read with Sys.getenv()",
                  "Use HTTPS + gitcreds for easier credential management than SSH keys",
                  "Commit renv.lock but NOT renv/library/ — library is platform-specific"
        ],
        mistake: "Committing API keys or passwords in code. Use .Renviron: GITHUB_PAT=token, accessed with Sys.getenv('GITHUB_PAT').",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(usethis)\nlibrary(gitcreds)\n# ── Initialize Git repo ─────────────────────────────────\nusethis::use_git()\n# Creates .git/, .gitignore, commits initial files\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nusethis::use_github_action()    # set up CI/CD workflows",
        },
      },
      {
        id: "project-organization",
        fn: "Project Organization — Code Structure & Scripts",
        desc: "Organize analysis projects with scripts, functions, and clear workflows.",
        category: "R Workflow",
        subtitle: "Scripts vs functions, data-raw/, R/, analysis/, outputs/",
        signature: "source('R/utils.R')  |  structured directories",
        descLong: "Separate reusable functions from analysis scripts. Functions live in R/ and are sourced/packaged. Scripts live in analysis/ and are numbered by execution order. Raw data in data/raw/ (immutable), processed in data/processed/. Outputs (figures, tables) in outputs/. This structure scales from notebooks to pipelines.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Project Organization — Code Structure & Scripts — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── File structure ─────────────────────────────────────\n# project/\n#  ├── R/                      ← reusable functions\n#  │    ├── utils.R            ← general utilities\n#  │    ├── data_prep.R        ← data cleaning functions\n#  │    └── plotting.R         ← custom plot functions\n#  ├── data/\n#  │    ├── raw/               ← original, read-only\n#  │    └── processed/         ← cleaned by scripts\n#  ├── analysis/               ← numbered analysis scripts\n#  │    ├── 01-load.R\n#  │    ├── 02-explore.R\n#  │    ├── 03-models.R\n#  │    └── 04-report.Rmd\n#  └── outputs/\n#       ├── figures/\n#       ├── tables/\n#       └── summaries/\n# ── Example: reusable functions in R/plotting.R ────────\n# R/plotting.R:\ntheme_custom <- function() {\n  theme_minimal() +\n    theme(text = element_text(family = \"sans\"),\n          plot.title = element_text(face = \"bold\"))\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Project Organization — Code Structure & Scripts — common patterns you'll see in production.\n# APPROACH  - Combine Project Organization — Code Structure & Scripts with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nplot_timeseries <- function(data, x, y) {\n  ggplot(data, aes({{x}}, {{y}})) +\n    geom_line() + geom_point() + theme_custom()\n}\n# ── Use in analysis script ──────────────────────────────\n# analysis/03-plot.R:\nlibrary(dplyr)\nlibrary(ggplot2)\nsource(here(\"R\", \"plotting.R\"))  # load functions\ndf <- read_csv(here(\"data\", \"processed\", \"clean.csv\"))\nplot_timeseries(df, date, amount) +\n  labs(title = \"Monthly Sales\")\nggsave(here(\"outputs\", \"figures\", \"sales_trend.png\"))\n# ── Documentation: functions vs scripts ────────────────\n# Functions (R/):\n#   - Document with #' comments (roxygen2)\n#   - Add examples\n#   - Test with testthat"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Project Organization — Code Structure & Scripts — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Scripts (analysis/):\n#   - Comment heavily on intent, not mechanics\n#   - Use section markers: # ── Step name\n#   - Load data at top, save outputs at bottom"
                  }
        ],
        tips: [
                  "Number analysis scripts (01-, 02-) — makes execution order obvious",
                  "Put functions in R/ and source them — don't copy-paste code across scripts",
                  "Never modify raw data — all cleaning happens in scripts and is reproducible",
                  "Use relative paths with here() everywhere — scripts work on any machine"
        ],
        mistake: "Mixing functions and analysis in a single script. Functions should live in R/, be tested, and be documented. Analysis scripts should be clean and focused.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n# ── File structure ─────────────────────────────────────\n# project/\n#  ├── R/                      ← reusable functions\n#  │    ├── utils.R            ← general utilities\n#  │    ├── data_prep.R        ← data cleaning functions\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n#   - Load data at top, save outputs at bottom",
        },
      },
      {
        id: "r-packages-structure",
        fn: "R Package Structure — DESCRIPTION, NAMESPACE, devtools",
        desc: "Create and manage R packages with standard structure.",
        category: "R Workflow",
        subtitle: "DESCRIPTION, NAMESPACE, R/, man/, devtools workflow",
        signature: "devtools::create()  |  devtools::load_all()  |  devtools::document()",
        descLong: "R packages follow a standard structure: DESCRIPTION (metadata), NAMESPACE (exported functions), R/ (code), man/ (documentation), tests/ (unit tests). devtools provides helpers for development: load_all() reloads code, document() generates help, check() validates the package, install() installs it. Use usethis helpers to scaffold package components.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of R Package Structure — DESCRIPTION, NAMESPACE, devtools — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(devtools)\nlibrary(usethis)\n# ── Create new package ──────────────────────────────────\ndevtools::create(\"~/R/mypackage\")\n# Creates: DESCRIPTION, NAMESPACE, R/, man/, tests/\n# ── DESCRIPTION file ───────────────────────────────────\n# Package: mypackage\n# Title: What the Package Does\n# Version: 0.0.0.9000\n# Authors@R: person(\"Your\", \"Name\", email=\"you@example.com\", role = c(\"aut\", \"cre\"))\n# Description: Longer description...\n# License: MIT + file LICENSE\n# Imports:  ← required packages\n#   dplyr (>= 1.0.0),\n#   ggplot2\n# Suggests:  ← optional (for testing, examples)\n#   testthat\n# Encoding: UTF-8\n# Roxygen: list(markdown = TRUE)\n# ── Develop workflow ────────────────────────────────────\nload_all()           # reload all code (Ctrl+Shift+L)\ndocument()          # generate man pages from #' comments\ntest()              # run all tests\ncheck()             # full package validation\ninstall()           # install locally"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of R Package Structure — DESCRIPTION, NAMESPACE, devtools — common patterns you'll see in production.\n# APPROACH  - Combine R Package Structure — DESCRIPTION, NAMESPACE, devtools with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Create function with roxygen2 doc ──────────────────\nusethis::use_r(\"my_function\")  # creates R/my_function.R\n# In R/my_function.R:\n#' My Function Title\n#'\n#' @description\n#' Longer description of what the function does.\n#'\n#' @param x A numeric vector\n#' @param na.rm If TRUE, remove NA values\n#'\n#' @return A numeric value\n#'\n#' @examples\n#' my_function(c(1, 2, 3))\n#'\n#' @export\nmy_function <- function(x, na.rm = FALSE) {\n  sum(x, na.rm = na.rm) / length(x)\n}\n# Then:\ndocument()  # generates man/my_function.Rd"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of R Package Structure — DESCRIPTION, NAMESPACE, devtools — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Add tests ───────────────────────────────────────────\nusethis::use_test(\"my_function\")\n# Creates tests/testthat/test_my_function.R\n# In test file:\nlibrary(testthat)\ntest_that(\"my_function sums correctly\", {\n  expect_equal(my_function(c(1, 2, 3)), 2)\n  expect_equal(my_function(c(NA, 1, 2), na.rm=TRUE), 1.5)\n})\n# Run tests:\ntest()  # runs all tests\n# ── Add dependencies ────────────────────────────────────\nusethis::use_package(\"dplyr\")      # add to Imports\nusethis::use_package(\"ggplot2\", type = \"Suggests\")  # optional"
                  }
        ],
        tips: [
                  "devtools::load_all() in development reloads code without reinstalling — much faster than install()",
                  "Use roxygen2 comments (#') for documentation — document() generates .Rd files automatically",
                  "Run check() frequently during development — it catches many issues early",
                  "Put dependencies in DESCRIPTION — usethis::use_package() manages this"
        ],
        mistake: "Manually editing NAMESPACE — let roxygen2 handle it. Add #' @export to functions that should be public.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(devtools)\nlibrary(usethis)\n# ── Create new package ──────────────────────────────────\ndevtools::create(\"~/R/mypackage\")\n# Creates: DESCRIPTION, NAMESPACE, R/, man/, tests/\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nusethis::use_package(\"ggplot2\", type = \"Suggests\")  # optional",
        },
      },
      {
        id: "devtools-workflow",
        fn: "devtools Workflow — Development, Testing & Validation",
        desc: "Efficient development cycle with load_all, document, test, and check.",
        category: "R Workflow",
        subtitle: "load_all(), document(), test(), check(), install()",
        signature: "load_all()  |  document()  |  test()  |  check()  |  install()",
        descLong: "devtools streamlines package development. load_all() reloads code (like re-sourcing), document() generates help from roxygen comments, test() runs unit tests, check() validates the entire package, install() installs locally. Keyboard shortcuts (Ctrl+Shift+L, D, T, E) make iteration fast.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of devtools Workflow — Development, Testing & Validation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(devtools)\n# ── Keyboard shortcuts in RStudio ──────────────────────\n# Ctrl+Shift+L  ← load_all()\n# Ctrl+Shift+D  ← document()\n# Ctrl+Shift+T  ← test()\n# Ctrl+Shift+E  ← check()\n# Ctrl+Shift+B  ← build()\n# ── 1. Write/modify function ──────────────────────────\n# Edit R/my_func.R with #' roxygen comments\n# ── 2. Reload code ────────────────────────────────────\nload_all()  # Ctrl+Shift+L  in RStudio\n# Reloads R/, data/, src/ without reinstalling\n# Ensures latest code is in memory\n# ── 3. Test interactively ─────────────────────────────\nmy_func(test_data)  # works immediately after load_all()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of devtools Workflow — Development, Testing & Validation — common patterns you'll see in production.\n# APPROACH  - Combine devtools Workflow — Development, Testing & Validation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── 4. Update roxygen docs ────────────────────────────\ndocument()  # Ctrl+Shift+D\n# Generates man/my_func.Rd, updates NAMESPACE\n# Now ?my_func shows your documentation\n# ── 5. Run unit tests ──────────────────────────────────\ntest()  # Ctrl+Shift+T  in RStudio\n# Runs all tests/testthat/test_*.R\n# Shows pass/fail for each test\n# ── 6. Full validation ────────────────────────────────\ncheck()  # Ctrl+Shift+E  in RStudio\n# Validates: structure, documentation, examples, tests\n# Reports errors, warnings, notes\n# Should have 0 errors before release\n# ── 7. Install to library ────────────────────────────\ninstall()  # installs to personal library\n# Now library(mypackage) works\n# Or: devtools::install_dev() for dev version"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of devtools Workflow — Development, Testing & Validation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Tips for fast iteration ────────────────────────────\n# - Make small changes, use load_all() frequently\n# - Write tests as you code, not after\n# - Use test() to verify each function\n# - check() only before commits/PRs\n# ── Building & releasing ──────────────────────────────\nbuild()                    # creates .tar.gz source\nbuild(binary = TRUE)       # creates platform binary\nrelease()                  # submits to CRAN (interactive)"
                  }
        ],
        tips: [
                  "load_all() is your friend — use it constantly during development. Ctrl+Shift+L in RStudio",
                  "Write tests first, code second — test() gives immediate feedback on your changes",
                  "document() before check() — roxygen comments must be up-to-date before validation",
                  "check() with 0 errors/warnings/notes before pushing to GitHub or CRAN"
        ],
        mistake: "Using source('R/function.R') in development instead of load_all(). source() doesn't handle dependencies or namespace correctly. Always use load_all().",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(devtools)\n# ── Keyboard shortcuts in RStudio ──────────────────────\n# Ctrl+Shift+L  ← load_all()\n# Ctrl+Shift+D  ← document()\n# Ctrl+Shift+T  ← test()\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nrelease()                  # submits to CRAN (interactive)",
        },
      },
      {
        id: "usethis-helpers",
        fn: "usethis Helpers — Scaffolding & Configuration",
        desc: "Quick setup for package components with usethis functions.",
        category: "R Workflow",
        subtitle: "use_r(), use_test(), use_data(), use_readme_rmd(), use_github_action()",
        signature: "use_r('function')  |  use_test('function')  |  use_data(obj)",
        descLong: "usethis provides scaffolding helpers that create boilerplate files and add dependencies. use_r() creates a new function file with roxygen skeleton. use_test() creates a test file. use_data() adds package data. use_readme_rmd() creates README. use_github_action() sets up CI/CD. These save time and ensure consistent structure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of usethis Helpers — Scaffolding & Configuration — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(usethis)\n# ── Create function file ────────────────────────────────\nuse_r(\"my_function\")\n# Creates R/my_function.R with roxygen skeleton\n# ── Create corresponding test file ──────────────────────\nuse_test(\"my_function\")\n# Creates tests/testthat/test_my_function.R\n# ── Add package to dependencies ─────────────────────────\nuse_package(\"dplyr\")              # add to Imports\nuse_package(\"testthat\", type=\"Suggests\")  # optional\n# ── Create package data ─────────────────────────────────\nmy_data <- data.frame(id=1:10, value=rnorm(10))\nuse_data(my_data)  # saves to data/my_data.rda\n# Now users can: data(my_data) or my_data in examples"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of usethis Helpers — Scaffolding & Configuration — common patterns you'll see in production.\n# APPROACH  - Combine usethis Helpers — Scaffolding & Configuration with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Create README ───────────────────────────────────────\nuse_readme_rmd()\n# Creates README.Rmd with standard sections\n# Edit and run: rmarkdown::render('README.Rmd')\n# ── Set up Git/GitHub ───────────────────────────────────\nuse_git()                  # initialize git repo\nuse_github()               # create GitHub repo\n# ── Set up CI/CD ────────────────────────────────────────\nuse_github_action_check_standard()  # run R CMD check\nuse_github_action_pr_commands()     # enable PR comments\n# ── License ─────────────────────────────────────────────\nuse_mit_license()          # add MIT license\nuse_gpl_license()          # add GPL license"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of usethis Helpers — Scaffolding & Configuration — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── News/Changelog ─────────────────────────────────────\nuse_news_md()              # creates NEWS.md\n# ── Ignore files ───────────────────────────────────────\nuse_build_ignore(\"notes/\")  # add to .Rbuildignore\nusethis::edit_git_ignore()   # manually edit .gitignore"
                  }
        ],
        tips: [
                  "use_r() + use_test() together creates paired files — keep test next to function",
                  "use_package() maintains DESCRIPTION — never edit it manually",
                  "use_github_action*() sets up continuous integration — catches issues before merge",
                  "use_readme_rmd() creates a template — edit with actual examples and badges"
        ],
        mistake: "Creating R/function.R without creating tests/testthat/test_function.R. Pair them from the start with use_test().",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(usethis)\n# ── Create function file ────────────────────────────────\nuse_r(\"my_function\")\n# Creates R/my_function.R with roxygen skeleton\n# ── Create corresponding test file ──────────────────────\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\nusethis::edit_git_ignore()   # manually edit .gitignore",
        },
      },
      {
        id: "reprex-debugging",
        fn: "reprex — Reproducible Examples for Debugging",
        desc: "Create minimal reproducible examples for debugging and getting help.",
        category: "R Workflow",
        subtitle: "reprex::reprex(), minimal reproducible example, debugging code",
        signature: "reprex::reprex()  |  reprex(venue='slack')  |  minimal reproducible example",
        descLong: "reprex() turns code in your clipboard into a minimal reproducible example with output. Paste code, run reprex(), get formatted output with results. Venues: R (default), GitHub, Stack Overflow, Slack. Essential for debugging — forces you to isolate the problem and makes it easy to share.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of reprex — Reproducible Examples for Debugging — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(reprex)\n# ── Copy code to clipboard, then: ──────────────────────\nreprex()\n# Runs code, captures output, formats nicely\n# Copies result to clipboard\n# Paste in GitHub issue, Stack Overflow, Slack\n# ── Example: debugging a data manipulation error ──────\n# Paste this in clipboard:\ndf <- data.frame(x=1:3, y=c(NA, 5, 6))\ndf |> filter(y > 0)  # should get 2 rows, but got 0?\n# Run reprex():\nreprex()\n# Output:\n# df <- data.frame(x=1:3, y=c(NA, 5, 6))\n# df |> filter(y > 0)  # should get 2 rows, but got 0?\n# #> # A tibble: 2 × 2\n# #>       x     y\n# #>   <int> <dbl>\n# #> 1     2     5\n# #> 2     3     6"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of reprex — Reproducible Examples for Debugging — common patterns you'll see in production.\n# APPROACH  - Combine reprex — Reproducible Examples for Debugging with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Different venues ────────────────────────────────────\nreprex(venue=\"gh\")       # GitHub-formatted (markdown)\nreprex(venue=\"slack\")    # Slack-formatted (code block)\nreprex(venue=\"so\")       # Stack Overflow\nreprex(venue=\"r\")        # Plain R (default)\n# ── Minimal reproducible example checklist ────────────\n# 1. Load necessary packages at top\n# 2. Use small, simple data (not your 1M row dataset)\n# 3. Show only the code that reproduces the problem\n# 4. Don't include unrelated code\n# 5. Include output (reprex does this)\n# 6. Explain what you expected vs what happened\n# ── Good reprex example ─────────────────────────────────\n# library(dplyr)\n# df <- tibble(id = 1:3, val = c(1, NA, 3))\n# result <- df |> group_by(id) |> summarise(m = mean(val))\n# result  # all NAs — why?\n# # Expected: row 1 gets 1.0, row 3 gets 3.0\n# # Got: all NA"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of reprex — Reproducible Examples for Debugging — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Bad reprex example ──────────────────────────────────\n# (no packages loaded)\n# (uses huge dataset: my_data_1000000.csv)\n# (includes unrelated code about graphics)\n# (no expected vs actual comparison)"
                  }
        ],
        tips: [
                  "reprex forces you to isolate the problem — often you'll find the bug while creating it",
                  "Use small datasets (1-10 rows) — still demonstrates the issue, easier to read",
                  "Always include packages in reprex — shows what's needed to run it",
                  "Paste reprex output directly in GitHub issues/SO — no manual formatting needed"
        ],
        mistake: "Posting \"my code doesn't work\" without a reprex. No one can debug without seeing the exact error and data. Always use reprex().",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(reprex)\n# ── Copy code to clipboard, then: ──────────────────────\nreprex()\n# Runs code, captures output, formats nicely\n# Copies result to clipboard\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n# (no expected vs actual comparison)",
        },
      },
      {
        id: "profiling-r",
        fn: "Profiling R Code — profvis, system.time, bench",
        desc: "Measure performance with profvis flame graphs and bench micro-benchmarks.",
        category: "R Performance",
        subtitle: "profvis::profvis(), bench::mark(), system.time(), bottleneck detection",
        signature: "profvis({code})  |  bench::mark(expr1, expr2)  |  system.time({})",
        descLong: "profvis creates interactive flame graphs showing where time is spent. bench::mark() runs expressions repeatedly and reports timing with memory. system.time() is quick measurement. Never optimize without profiling — the bottleneck is rarely where you think.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Profiling R Code — profvis, system.time, bench — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(profvis)\nlibrary(bench)\n# ── profvis: interactive flame graph ────────────────────\nprofvis({\n  x <- rnorm(1e6)\n  y <- cumsum(x)      # Compute cumulative sum\n  hist(y, breaks=100)\n})\n# Opens interactive HTML graph\n# Hover over bars to see function names\n# Click to zoom\n# Wide bars = time spent there\n# ── Identify slow function ──────────────────────────────\nprofvis({\n  df <- read.csv(\"huge_file.csv\")   # might be slow\n  df_clean <- df[df$value > 0, ]     # filter slow?\n  summary(df_clean)\n})\n# Flame graph shows which takes longest"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Profiling R Code — profvis, system.time, bench — common patterns you'll see in production.\n# APPROACH  - Combine Profiling R Code — profvis, system.time, bench with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── bench::mark: micro-benchmarks ──────────────────────\nx <- 1:1e6\nresults <- bench::mark(\n  vectorized = x * 2,\n  loop = { y <- numeric(length(x)); for(i in 1:length(x)) y[i] <- x[i]*2; y },\n  relative = TRUE,  # report relative to fastest\n  iterations = 10   # run each 10 times\n)\nprint(results)\n# expression      min median `itr/sec` mem_alloc `gc/sec` relative\n# vectorized  1.35ms 1.43ms    655.   3.81MB     65.5     1\n# loop       195ms    196ms      5.1 7.63MB      1.01   139\n# ── system.time: quick measurement ─────────────────────\nsystem.time({\n  x <- rnorm(1e7)\n  y <- sum(x^2)\n})\n# user  system elapsed\n# 0.045  0.001   0.046"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Profiling R Code — profvis, system.time, bench — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Common profiling workflow ──────────────────────────\n# 1. Profile: identify bottleneck\nprofvis({ slow_function() })\n# 2. Benchmark: measure current speed\nbench::mark(slow_function(), times=5)\n# 3. Optimize: vectorize, cache, parallelize\n# 4. Verify: re-benchmark to confirm improvement"
                  }
        ],
        tips: [
                  "Profile BEFORE optimizing — the slowest part is rarely what you think",
                  "Vectorization usually wins — replace loops with vectorized ops (10-100x faster)",
                  "Pre-allocate vectors — vector(\"numeric\", n) not c() in loop",
                  "system.time() for quick checks, profvis for detailed analysis, bench for micro-optimization"
        ],
        mistake: "Guessing where the bottleneck is. A 20-line function with a hidden loop might be slow. Profile first, optimize second.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(profvis)\nlibrary(bench)\n# ── profvis: interactive flame graph ────────────────────\nprofvis({\n  x <- rnorm(1e6)\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n# 4. Verify: re-benchmark to confirm improvement",
        },
      },
      {
        id: "logging-r",
        fn: "Logging in R — logger, log4r, structured logging",
        desc: "Add structured logging to track code execution and debug issues.",
        category: "R Development",
        subtitle: "logger package, log levels (DEBUG, INFO, WARN, ERROR), logging to file",
        signature: "log_info('message')  |  log_warn()  |  log_error()  |  log_threshold()",
        descLong: "Logging tracks what code is doing at runtime. logger package provides simple log_*() functions. Log levels: DEBUG (detailed), INFO (normal), WARN (caution), ERROR (problem). Logs can go to console, file, or both. Essential for debugging production apps where you can't interactive debug.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Logging in R — logger, log4r, structured logging — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(logger)\n# ── Basic logging ───────────────────────────────────────\nlog_info(\"Starting analysis\")\nlog_debug(\"Loading data from {path}\")  # glue-style interpolation\nlog_warn(\"Missing values detected: {n_missing}\")\nlog_error(\"Failed to connect to database\")\n# ── Output to console ──────────────────────────────────\nlog_threshold(DEBUG)  # show all messages\nlog_threshold(INFO)   # hide DEBUG\nlog_threshold(WARN)   # show only WARN, ERROR\n# ── Logging to file ────────────────────────────────────\nlog_appender(\n  appender_tee(file = here(\"logs\", \"analysis.log\"))\n)\n# Now logs go to console AND file"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Logging in R — logger, log4r, structured logging — common patterns you'll see in production.\n# APPROACH  - Combine Logging in R — logger, log4r, structured logging with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Layout customization ───────────────────────────────\nlog_layout(layout_json())\n# Outputs: {\"level\":\"INFO\",\"timestamp\":\"...\",\"message\":\"...\"}\n# Better for parsing logs programmatically\n# ── Use in functions ───────────────────────────────────\nfit_model <- function(data, model_type) {\n  log_info(\"Starting model fit with type: {model_type}\")\n  tryCatch({\n    fit <- lm(y ~ x, data = data)\n    log_info(\"Model fit successful, R² = {round(summary(fit)$r.squared, 3)}\")\n    fit\n  }, error = function(e) {\n    log_error(\"Model fit failed: {e$message}\")\n    NULL\n  })\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Logging in R — logger, log4r, structured logging — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Log conditionally ───────────────────────────────────\nif (log_level() <= DEBUG) {\n  # Only run expensive debugging code if DEBUG enabled\n  log_debug(\"Data shape: {nrow(df)} × {ncol(df)}\")\n}\n# ── Structured logging (for parsing) ────────────────────\nlog_appender(appender_json(file = \"logs.json\"))\nlog_info(\"User action\", user_id=42, action=\"login\", duration_ms=150)\n# JSON: {\"level\":\"INFO\",\"timestamp\":\"...\",\"message\":\"...\",\"user_id\":42,...}"
                  }
        ],
        tips: [
                  "log_info() for important milestones, log_debug() for detailed traces",
                  "Use glue-style interpolation: log_info(\"Value is {x}\") not paste()",
                  "Set log_threshold(WARN) in production to reduce noise from DEBUG/INFO",
                  "Append to file with appender_tee() — keeps console AND saves history"
        ],
        mistake: "Using print() for debugging. Logs are better: they have timestamps, levels, and can be redirected to files without changing code.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(logger)\n# ── Basic logging ───────────────────────────────────────\nlog_info(\"Starting analysis\")\nlog_debug(\"Loading data from {path}\")  # glue-style interpolation\nlog_warn(\"Missing values detected: {n_missing}\")\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n# JSON: {\"level\":\"INFO\",\"timestamp\":\"...\",\"message\":\"...\",\"user_id\":42,...}",
        },
      },
      {
        id: "config-r",
        fn: "Configuration Management — config Package & Secrets",
        desc: "Manage environment-specific configs (dev, prod) and secure secrets.",
        category: "R Development",
        subtitle: "config package, .Renviron, YAML configurations, environment variables",
        signature: "config::get('db_host')  |  Sys.getenv('API_KEY')  |  config.yml",
        descLong: "The config package manages environment-specific settings (dev/staging/prod). config.yml defines defaults and environment overrides. Secrets (API keys, passwords) go in .Renviron and are accessed with Sys.getenv(). Never commit secrets — .Renviron is .gitignored.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Configuration Management — config Package & Secrets — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(config)\n# ── config.yml structure ───────────────────────────────\n# default:\n#   db_host: \"localhost\"\n#   db_name: \"dev_db\"\n#   api_timeout: 30\n#   log_level: \"DEBUG\"\n# \n# production:\n#   db_host: \"prod-db.example.com\"\n#   db_name: \"prod_db\"\n#   api_timeout: 60\n#   log_level: \"ERROR\"\n# \n# staging:\n#   db_host: \"staging-db.example.com\"\n#   db_name: \"staging_db\"\n#   api_timeout: 45\n#   log_level: \"WARN\"\n# ── Read configuration ──────────────────────────────────\nconfig <- config::get(file = \"config.yml\")\n# Returns: list(db_host=\"localhost\", db_name=\"dev_db\", ...)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Configuration Management — config Package & Secrets — common patterns you'll see in production.\n# APPROACH  - Combine Configuration Management — config Package & Secrets with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ndb_host <- config::get(\"db_host\")\ndb_name <- config::get(\"db_name\")\n# ── Environment-specific config ────────────────────────\nenv <- Sys.getenv(\"R_CONFIG_ACTIVE\", \"default\")\nconfig <- config::get(file = \"config.yml\", config = env)\n# If R_CONFIG_ACTIVE=production, loads production section\n# ── Secrets in .Renviron ────────────────────────────────\n# .Renviron file (never committed):\n# API_KEY=xyz123abc\n# DB_PASSWORD=secret123\n# SLACK_WEBHOOK=https://hooks.slack.com/...\n# In code:\napi_key <- Sys.getenv(\"API_KEY\")\ndb_password <- Sys.getenv(\"DB_PASSWORD\")\n# ── Edit .Renviron ────────────────────────────────────\nusethis::edit_r_environ()  # opens .Renviron for editing\n# Add: API_KEY=your_key_here\n# Save, restart R"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Configuration Management — config Package & Secrets — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Combine config + secrets ───────────────────────────\nconfig <- config::get(file = \"config.yml\")\ndb_host <- config$db_host\ndb_password <- Sys.getenv(\"DB_PASSWORD\")  # from .Renviron\ncon <- DBI::dbConnect(\n  RPostgres::Postgres(),\n  host = db_host,\n  password = db_password\n)\n# ── Default values ─────────────────────────────────────\napi_key <- Sys.getenv(\"API_KEY\", unset=\"\")\nif (api_key == \"\") {\n  stop(\"API_KEY not found in .Renviron\")\n}"
                  }
        ],
        tips: [
                  "Use config.yml for app settings, .Renviron for secrets — different audience (code vs environment)",
                  "Never commit .Renviron or secrets in config.yml — add to .gitignore",
                  "Use Sys.getenv('VAR', unset='default') with default values to prevent crashes",
                  "In Docker/cloud: set environment variables in deployment config, not in files"
        ],
        mistake: "Hardcoding API_KEY=\"xyz123\" in code. Use .Renviron: API_KEY=xyz123, then Sys.getenv('API_KEY').",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\nlibrary(config)\n# ── config.yml structure ───────────────────────────────\n# default:\n#   db_host: \"localhost\"\n#   db_name: \"dev_db\"\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "quarto-basics",
        fn: "Quarto Basics — Dynamic Documents & Reports",
        desc: "Create reproducible reports with Quarto (.qmd files) mixing code and text.",
        category: "R Workflow",
        subtitle: ".qmd files, YAML frontmatter, code chunks, quarto render, parameters",
        signature: "---\ntitle: Report\n---\n\n```{r}\ncode\n```",
        descLong: "Quarto is R Markdown's successor — modern, multilingual (R/Python/Julia), better syntax. .qmd files combine YAML frontmatter (metadata), markdown text, and code chunks. quarto render outputs HTML/PDF/Word/slides. Parameters enable report customization. Faster rendering and cleaner defaults than R Markdown.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Quarto Basics — Dynamic Documents & Reports — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n---\ntitle: \"Sales Analysis Report\"\nauthor: \"Analytics Team\"\ndate: today\nformat:\n  html:\n    toc: true\n    code-fold: true\n    theme: flatly\nparams:\n  region: \"East\"\n  year: 2024\n---\n## Overview\nThis report analyzes sales in the **`r params$region`** region for `r params$year`.\n```{r}\n#| label: setup\n#| include: false\nlibrary(dplyr)\nlibrary(ggplot2)\n# Suppress messages\nknitr::opts_chunk$set(\n  echo = FALSE,       # hide code\n  warning = FALSE,\n  message = FALSE\n)\n```"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Quarto Basics — Dynamic Documents & Reports — common patterns you'll see in production.\n# APPROACH  - Combine Quarto Basics — Dynamic Documents & Reports with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n```{r}\n#| label: load-data\ndf <- read_csv(\"sales.csv\") |>\n  filter(region == params$region, year == params$year)\n```\n```{r}\n#| label: summary-table\n#| results: asis\ndf |>\n  group_by(dept) |>\n  summarise(Total = sum(sales), Count = n()) |>\n  knitr::kable(caption = \"Sales by Department\")\n```\n```{r}\n#| label: plot\n#| fig-cap: \"Monthly sales trend\"\n#| fig-height: 4\nggplot(df, aes(month, sales, color=dept)) +\n  geom_line() + geom_point() + theme_minimal()\n```\n## Key Insights"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Quarto Basics — Dynamic Documents & Reports — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n- Total sales: $`r format(sum(df$sales), big.mark=\",\")`\n- Average monthly: $`r format(mean(df$sales), big.mark=\",\")`\n# ── Render from R ──────────────────────────────────────\nquarto::quarto_render(\n  input = \"report.qmd\",\n  execute_params = list(region=\"West\", year=2025)\n)\n# Creates: report.html\n# ── Chunk options (YAML format) ────────────────────────\n# #| echo: false       — hide code\n# #| include: false    — run code, hide everything\n# #| eval: false       — show code, don't run\n# #| warning: false    — suppress warnings\n# #| fig-width: 8      — figure width\n# #| fig-height: 5     — figure height\n# #| fig-cap: \"Title\"  — figure caption"
                  }
        ],
        tips: [
                  "Use `today` in YAML for dynamic date — updates on each render",
                  "params: in YAML enables customization — quarto_render(..., execute_params=list(...))",
                  "Code folding (code-fold: true) hides code by default, users can expand",
                  "Use inline R with `` `r code` `` to insert values directly in text"
        ],
        mistake: "Mixing R Markdown (.Rmd) and Quarto (.qmd) syntax. Quarto uses YAML for chunk options (---), not inline ### . Use .qmd with modern syntax.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n---\ntitle: \"Sales Analysis Report\"\nauthor: \"Analytics Team\"\ndate: today\nformat:\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n# #| fig-cap: \"Title\"  — figure caption",
        },
      },
    ],
  },
]

export default { meta, sections }
