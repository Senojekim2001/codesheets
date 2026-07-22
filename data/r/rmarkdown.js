export const meta = {
  "id": "rmarkdown",
  "label": "R Markdown & Quarto",
  "icon": "📊",
  "description": "R Markdown and Quarto: reproducible reports, presentations, books, websites, and parameterized documents."
}

export const sections = [

  // ── Section 1: R Markdown Fundamentals ─────────────────────────────────────────
  {
    id: "rmd-fundamentals",
    title: "R Markdown Fundamentals",
    entries: [
      {
        id: "rmd-structure",
        fn: "Document Structure — YAML, Chunks & Inline Code",
        desc: "R Markdown anatomy: YAML front matter for metadata, code chunks for computation, inline code for dynamic text.",
        category: "R Markdown",
        subtitle: "YAML header, code chunks, knitr options, inline R",
        signature: "```{r chunk-name, echo=FALSE}  |  `r expr`  |  output: html_document",
        descLong: "R Markdown (.Rmd) weaves narrative text with executable R code. The YAML header controls output format (HTML, PDF, Word, slides). Code chunks run R (or Python, SQL, bash) and embed results. Chunk options control display: echo shows/hides code, eval runs/skips code, include shows/hides everything, fig.width/fig.height control plot sizes. Inline code with `r expr` embeds computed values in text. knitr processes chunks, pandoc converts to final format.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Document Structure — YAML, Chunks & Inline Code — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── .Rmd YAML header ───────────────────────────────\n# ---\n# title: \"Quarterly Report\"\n# author: \"Data Team\"\n# date: \"`r Sys.Date()`\"       (inline R)\n# output:\n#   html_document:\n#     toc: true\n#     toc_float: true\n#     theme: flatly\n#     code_folding: hide\n#     df_print: paged\n# params:\n#   quarter: \"Q4\"\n#   year: 2024\n# ---\n# ── Inline R — dynamic text in paragraphs ──────────\n# This report covers `r params$quarter` `r params$year`\n# We analyzed `r nrow(sales_data)` transactions.\n# ── Code chunk syntax ──────────────────────────────\n# Open chunk:  ```{r chunk-name, option=value}\n# Close chunk: ```\n# Chunks contain executable R code; output embeds in doc."
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Document Structure — YAML, Chunks & Inline Code — common patterns you'll see in production.\n# APPROACH  - Combine Document Structure — YAML, Chunks & Inline Code with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Setup chunk (runs first, hidden from output) ───\n# ```{r setup, include=FALSE}\nknitr::opts_chunk$set(\n  echo = FALSE,        # hide code by default\n  message = FALSE,     # hide messages\n  warning = FALSE,     # hide warnings\n  fig.width = 8,\n  fig.height = 5,\n  fig.retina = 2       # high-res plots\n)\nlibrary(tidyverse)\nlibrary(kableExtra)\n# ```\n# ── Plot chunk with caption ────────────────────────\n# ```{r revenue-plot, fig.cap=\"Monthly revenue trend\"}\nsales_data |>\n  group_by(month) |>\n  summarise(revenue = sum(amount)) |>\n  ggplot(aes(month, revenue)) +\n  geom_line(color = \"steelblue\", linewidth = 1.2) +\n  scale_y_continuous(labels = scales::dollar) +\n  theme_minimal()\n# ```"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Document Structure — YAML, Chunks & Inline Code — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Table chunk ────────────────────────────────────\n# ```{r summary-table}\nsummary_df |>\n  kable(format = \"html\", caption = \"Key Metrics\") |>\n  kable_styling(bootstrap_options = c(\"striped\", \"hover\"))\n# ```\n# ── Key Chunk Options ──────────────────────────────\n# Display:  echo=FALSE, include=FALSE, eval=FALSE, results=\"hide\"\n# Figures:  fig.width=8, fig.height=5, fig.cap=\"...\", fig.align=\"center\"\n# Caching:  cache=TRUE, dependson=\"other-chunk\"\n# Output:   out.width=\"80%\", fig.retina=2"
                  }
        ],
        tips: [
                  "Set global options in a setup chunk with knitr::opts_chunk$set() — avoids repeating options on every chunk.",
                  "code_folding: hide shows a toggle button — readers can reveal code if they want, but it is hidden by default.",
                  "cache = TRUE speeds up re-rendering — but set dependson to invalidate cache when upstream chunks change.",
                  "fig.retina = 2 produces high-DPI plots that look sharp on modern displays."
        ],
        mistake: "Not setting message = FALSE and warning = FALSE globally — library loading messages and deprecation warnings clutter the final document. Set them in the setup chunk.",
        shorthand: {
          verbose: "# Manual chunk option setting (verbose)\n```{r chunk1, echo=FALSE}\n# code\n```\n```{r chunk2, echo=FALSE}\n# repeat",
          concise: "# Setup chunk with global opts\n```{r setup, include=FALSE}\nknitr::opts_chunk$set(echo=FALSE, message=FALSE)\n```",
        },
      },
      {
        id: "rmd-outputs",
        fn: "Output Formats — HTML, PDF, Word, Slides & Books",
        desc: "Render to any format: interactive HTML, print-ready PDF, Word documents, reveal.js slides, and bookdown books.",
        category: "R Markdown",
        subtitle: "html_document, pdf_document, word_document, ioslides, bookdown",
        signature: "output: html_document  |  rmarkdown::render(\"report.Rmd\")  |  bookdown::gitbook",
        descLong: "R Markdown renders to 10+ formats from a single source. html_document is the most feature-rich (interactive tables, floating TOC, tabsets). pdf_document uses LaTeX (requires TinyTeX). word_document creates editable .docx. Slide formats include ioslides, reveal.js, and xaringan. bookdown creates multi-chapter books. flexdashboard creates dashboards. You can render programmatically with rmarkdown::render() and parameterize reports for batch generation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Output Formats — HTML, PDF, Word, Slides & Books — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Multiple output formats in YAML ─────────────────\n# ---\n# title: \"Analysis Report\"\n# output:\n#   html_document:\n#     toc: true\n#     toc_float: true\n#     theme: cosmo\n#     highlight: tango\n#   pdf_document:\n#     toc: true\n#     latex_engine: xelatex\n#   word_document:\n#     reference_docx: \"template.docx\"\n# ---\n# ── Tabsets (HTML only) ─────────────────────────────\n# ## Results {.tabset}\n# ### Plot\n# [r chunk] plot(cars)\n# ### Table\n# [r chunk] knitr::kable(head(cars))\n# ## {-}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Output Formats — HTML, PDF, Word, Slides & Books — common patterns you'll see in production.\n# APPROACH  - Combine Output Formats — HTML, PDF, Word, Slides & Books with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Parameterized reports (YAML params section) ─────\n# params:\n#   region: \"West\"\n#   start_date: \"2024-01-01\"\n# Access params in R:\ndata <- sales |> filter(region == params$region)\n# Render with parameters from R:\n# rmarkdown::render(\"report.Rmd\", params = list(region = \"East\"))\n# Batch render — one report per region\n# regions <- c(\"West\", \"East\", \"North\", \"South\")\n# for (r in regions) {\n#   rmarkdown::render(\"report.Rmd\",\n#     params = list(region = r),\n#     output_file = paste0(\"report_\", r, \".html\"))\n# }\n# ── flexdashboard (YAML) ──────────────────────────\n# output:\n#   flexdashboard::flex_dashboard:\n#     orientation: rows\n#     vertical_layout: fill"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Output Formats — HTML, PDF, Word, Slides & Books — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Layout with row headings:\n# ## Row 1 {data-height=300}\n# ### Revenue    — valueBox(total_revenue)\n# ### Orders     — valueBox(total_orders)\n# ## Row 2 {data-height=700}\n# ### Trend      — plotly::ggplotly(revenue_plot)\n# ── bookdown for multi-chapter documents ────────────\n# In _bookdown.yml:\n# book_filename: \"my-book\"\n# rmd_files: [\"index.Rmd\", \"01-intro.Rmd\", \"02-methods.Rmd\"]\n# output_dir: \"docs\""
                  }
        ],
        tips: [
                  "{.tabset} on a heading creates tabbed panels in HTML — great for showing multiple views without scrolling.",
                  "Parameterized reports + a for loop batch-generates reports per region/date/client — one template, N outputs.",
                  "TinyTeX (tinytex::install_tinytex()) is the easiest way to get PDF output — installs only what you need.",
                  "flexdashboard creates dashboards from R Markdown — no Shiny server needed for static dashboards."
        ],
        mistake: "Creating separate .Rmd files for each region/client report — use parameterized reports with rmarkdown::render(params = list(...)) to generate all variants from one template.",
        shorthand: {
          verbose: "# Separate files approach (verbose, hard to maintain)\n# report_west.Rmd, report_east.Rmd, report_north.Rmd\n# Same code in each, just change region",
          concise: "# One template with params\nrmarkdown::render(\"report.Rmd\",\n  params = list(region = \"West\"),\n  output_file = \"report_West.html\")",
        },
      },
    ],
  },

  // ── Section 2: Quarto ─────────────────────────────────────────
  {
    id: "quarto",
    title: "Quarto",
    entries: [
      {
        id: "quarto-basics",
        fn: "Quarto — Next-Generation R Markdown",
        desc: "Quarto is the successor to R Markdown — multi-language, better defaults, and native support for Python, Julia, Observable.",
        category: "Quarto",
        subtitle: "quarto render, .qmd, execute options, cross-references",
        signature: "quarto render doc.qmd  |  format: html  |  #| echo: false",
        descLong: "Quarto (.qmd) is the next-generation publishing system from Posit. It supports R, Python, Julia, and Observable JS natively. Key improvements over R Markdown: chunk options use #| comments (YAML-style), better cross-references, native citation support, built-in presentation and website tools, and works without R (Python users can use it standalone). Quarto uses the same Pandoc engine but with modern defaults and features.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Quarto — Next-Generation R Markdown — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Quarto YAML header ──────────────────────────────\n# ---\n# title: \"Quarto Report\"\n# author: \"Data Team\"\n# date: today\n# format:\n#   html:\n#     toc: true\n#     theme: cosmo\n#     code-fold: true\n#     code-tools: true\n#     self-contained: true\n#   pdf:\n#     documentclass: article\n#     geometry: margin=2.5cm\n# execute:\n#   echo: false\n#   warning: false\n# bibliography: references.bib\n# ---\n# ── Quarto chunk options use #| syntax ──────────────\n# [r chunk]\n#| label: fig-scatter\n#| fig-cap: \"Revenue vs. Orders\"\n#| fig-width: 8\n#| fig-height: 5"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Quarto — Next-Generation R Markdown — common patterns you'll see in production.\n# APPROACH  - Combine Quarto — Next-Generation R Markdown with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nlibrary(ggplot2)\nggplot(data, aes(orders, revenue)) +\n  geom_point(alpha = 0.6) +\n  geom_smooth(method = \"lm\") +\n  theme_minimal()\n# [end chunk]\n# ── Cross-references (auto-numbered, clickable) ─────\n# As shown in @fig-scatter, there is a positive correlation.\n# See @tbl-summary for details.\n# Figures: @fig-name (label must start with fig-)\n# Tables:  @tbl-name (label must start with tbl-)\n# Sections: @sec-analysis (heading needs {#sec-analysis})\n# Equations: @eq-model (equation needs {#eq-model})\n# ── Callout blocks ──────────────────────────────────\n# ::: {.callout-note}\n# This is a note — use for supplementary info.\n# :::\n#\n# ::: {.callout-warning}\n# This is a warning — use for important caveats.\n# :::\n#\n# ::: {.callout-tip}\n# ## Pro Tip\n# Use callouts to highlight key information.\n# :::"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Quarto — Next-Generation R Markdown — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Multi-language support ──────────────────────────\n# Quarto natively supports Python, Julia, Observable JS:\n# [python chunk]\n# import matplotlib.pyplot as plt\n# plt.plot(x, np.sin(x))\n# plt.show()\n# [end chunk]"
                  }
        ],
        tips: [
                  "#| chunk options are cleaner than chunk header options — they are valid YAML and get syntax highlighting.",
                  "Cross-references (@fig-name, @tbl-name) auto-number and link — no manual \"Figure 1\" numbering.",
                  "code-fold: true + code-tools: true gives readers a toggle to show/hide ALL code at once.",
                  "Quarto works with Python standalone — no R installation needed for Python-only projects."
        ],
        mistake: "Using R Markdown chunk syntax in Quarto — while it works, the Quarto-native #| syntax is preferred. It provides better editor support and is YAML-compatible.",
        shorthand: {
          verbose: "# R Markdown options (verbose)\n```{r chunk, echo=FALSE, fig.width=8}\n# code",
          concise: "# Quarto #| syntax (cleaner)\n```{r}\n#| echo: false\n#| fig-width: 8\n# code",
        },
      },
      {
        id: "rmd-yaml-options",
        fn: "R Markdown YAML Front Matter — Document Options",
        desc: "YAML frontmatter: output format, toc, theme, code_folding, params.",
        category: "R Markdown",
        subtitle: "output, toc, toc_float, theme, code_folding, params, css",
        signature: "output: html_document  |  toc: true  |  theme: flatly  |  code_folding: hide",
        descLong: "YAML frontmatter (between --- markers) controls document metadata and rendering options. output specifies format (HTML, PDF, Word). toc generates table of contents. theme sets styling. code_folding hides code by default. params enable parameterized reports.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of R Markdown YAML Front Matter — Document Options — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Complete YAML example ──────────────────────────────\n---\ntitle: \"Quarterly Sales Analysis\"\nauthor: \"Data Team\"\ndate: `r Sys.Date()`      # inline R for dynamic date\noutput:\n  html_document:\n    toc: true                  # table of contents\n    toc_float: true             # TOC sticks to side\n    toc_depth: 3                # heading depth in TOC\n    theme: flatly               # built-in theme\n    highlight: tango            # syntax highlighting\n    code_folding: hide          # hide code by default\n    code_download: true         # allow download of code\n    df_print: paged             # paginated data frames\n    css: custom.css             # custom CSS file\n  pdf_document:\n    toc: true\n    latex_engine: xelatex      # unicode support\n  word_document:\n    reference_docx: template.docx"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of R Markdown YAML Front Matter — Document Options — common patterns you'll see in production.\n# APPROACH  - Combine R Markdown YAML Front Matter — Document Options with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nparams:\n  quarter: \"Q4\"\n  year: 2024\n  region: \"All\"\n---\n# ── Accessing params in code ───────────────────────────\nThis report covers `r params$quarter` `r params$year` for `r params$region`.\n# ── Theme options ──────────────────────────────────────\n# Available themes: default, cerulean, journal, flatly,\n# darkly, readable, spacelab, united, cosmo, lumen, paper,\n# sandstone, simplex, yeti\n# ── Syntax highlight styles ────────────────────────────\n# default, tango, pygments, kate, monochrome, espresso,\n# zenburn, haddock, breezedark, textmate"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of R Markdown YAML Front Matter — Document Options — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── More output options ────────────────────────────────\n# self-contained: true         # embed all resources\n# includes:\n#   in_header: header.html     # custom HTML header\n#   before_body: before.html   # HTML before body\n#   after_body: after.html     # HTML after body"
                  }
        ],
        tips: [
                  "toc_float makes TOC sticky on the side — improves navigation for long documents.",
                  "code_folding: hide makes code hideable by readers — good for business reports.",
                  "params make reports parameterizable — one template, many outputs.",
                  "self-contained: true creates a single HTML file with all assets embedded — easier to share."
        ],
        mistake: "Hardcoding metadata instead of using YAML params — limits reusability.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Verbose YAML\n// More explicit but longer",
          concise: "# Concise version with defaults",
        },
      },
      {
        id: "rmd-params",
        fn: "Parameterized Reports — params in YAML & rmarkdown::render()",
        desc: "Params: define in YAML, access with params$x, render with rmarkdown::render(params=).",
        category: "R Markdown",
        subtitle: "params: in YAML, params$var in code, rmarkdown::render(params=list())",
        signature: "params:\n  region: \"West\"\nparams$region  |  rmarkdown::render(\"file.Rmd\", params=list(...))",
        descLong: "Parameterized reports accept inputs via YAML params section. Access with params$name in code. Render with rmarkdown::render(params=list(...)) to generate reports with different parameters. Essential for batch reporting (one report per client, region, etc.).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Parameterized Reports — params in YAML & rmarkdown::render() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── .Rmd YAML with params section ──────────────────────\n---\ntitle: \"Sales Report\"\noutput: html_document\nparams:\n  region: \"West\"\n  year: 2024\n  threshold: 1000\n---\n# Use params in text:\nSales Report for `r params$region` in `r params$year`.\n# ```{r}\n# Filter data based on params:\ndata <- sales |>\n  filter(\n    region == params$region,\n    year == params$year,\n    amount > params$threshold\n  )\n# ```"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Parameterized Reports — params in YAML & rmarkdown::render() — common patterns you'll see in production.\n# APPROACH  - Combine Parameterized Reports — params in YAML & rmarkdown::render() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Render with parameters from R ──────────────────────\nrmarkdown::render(\"sales_report.Rmd\",\n  params = list(\n    region = \"East\",\n    year = 2024,\n    threshold = 1500\n  ),\n  output_file = \"sales_report_East.html\"\n)\n# ── Batch render: generate one report per region ────────\nregions <- c(\"West\", \"East\", \"North\", \"South\")\nfor (r in regions) {\n  rmarkdown::render(\"sales_report.Rmd\",\n    params = list(region = r, year = 2024),\n    output_file = paste0(\"report_\", r, \".html\")\n  )\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Parameterized Reports — params in YAML & rmarkdown::render() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Default values in YAML ─────────────────────────────\n# Params can have defaults; override with rmarkdown::render()\nparams:\n  region:\n    label: \"Region\"\n    value: \"West\"\n    input: select\n    choices: [\"West\", \"East\", \"North\", \"South\"]"
                  }
        ],
        tips: [
                  "Batch generate reports with a for loop and rmarkdown::render(params=).",
                  "Default param values in YAML — override in code or via render() call.",
                  "Params enable one template, many outputs — maintainability and consistency."
        ],
        mistake: "Creating separate .Rmd files for each region instead of using params.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Separate files (fragile)\nreport_west.Rmd, report_east.Rmd, report_north.Rmd\n// More explicit but longer",
          concise: "# One template + params\nrmarkdown::render(\"report.Rmd\", params = list(region = \"West\"))",
        },
      },
      {
        id: "rmd-child-docs",
        fn: "Child Documents in R Markdown — Modular Reports",
        desc: "Child documents: include external .Rmd files with <<child=\"file.Rmd\">>.",
        category: "R Markdown",
        subtitle: "<<child=\"file.Rmd\">>, modular reports, reusable sections",
        signature: "```{r child=\"analysis.Rmd\"}```  |  <<child=\"plot.Rmd\">>",
        descLong: "Include external .Rmd files as child documents. Useful for breaking large reports into modular sections, reusing content across reports, or generating reports with shared components.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Child Documents in R Markdown — Modular Reports — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Parent document (main.Rmd) ────────────────────────\n---\ntitle: \"Complete Analysis\"\noutput: html_document\n---\n# Introduction\n```{r child=\"01-intro.Rmd\"}```\n# Data Preparation\n```{r child=\"02-data.Rmd\"}```\n# Analysis\n```{r child=\"03-analysis.Rmd\"}```"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Child Documents in R Markdown — Modular Reports — common patterns you'll see in production.\n# APPROACH  - Combine Child Documents in R Markdown — Modular Reports with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Conclusions\n```{r child=\"04-conclusions.Rmd\"}```\n# ── Child document (01-intro.Rmd) ──────────────────────\n# Child files don't need YAML frontmatter\n# This section introduces the analysis...\nKey metrics:\n```{r}\nsummary_stats <- mtcars |>\n  summarise(across(everything(), mean))\nprint(summary_stats)\n```"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Child Documents in R Markdown — Modular Reports — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Parameterized child documents ──────────────────────\n# Parent with params:\n# params:\n#   region: \"West\"\n# Child file uses params:\n# ```{r}\n# data <- data |> filter(region == params$region)\n# ```"
                  }
        ],
        tips: [
                  "Child documents don't need YAML frontmatter — just pure content.",
                  "Break long reports into chapters/sections — easier to manage.",
                  "Reuse child documents across multiple reports."
        ],
        mistake: "Duplicating analysis code across multiple report files instead of using child documents.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Large single file\n// More explicit but longer",
          concise: "# Parent + child structure",
        },
      },
      {
        id: "rmd-tables",
        fn: "Tables in R Markdown — kable, kableExtra, gt, DT",
        desc: "Table options: knitr::kable(), kableExtra, gt::gt(), DT::datatable().",
        category: "R Markdown",
        subtitle: "kable, kableExtra styling, gt tables, DT interactive tables",
        signature: "kable(df) |> kable_styling()  |  gt(df)  |  datatable(df)",
        descLong: "Multiple table libraries for R Markdown. kable is simple/fast. kableExtra adds styling. gt provides publication-quality tables. DT creates interactive, searchable HTML tables. Choose based on complexity and interactivity needs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Tables in R Markdown — kable, kableExtra, gt, DT — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── kable: simple, fast tables ────────────────────────\n```{r}\nknitr::kable(head(mtcars), caption = \"Motor Trends Data\")\n```\n# ── kableExtra: styling & layout ──────────────────────\n```{r}\nmtcars |>\n  head(10) |>\n  knitr::kable(format = \"html\") |>\n  kableExtra::kable_styling(\n    bootstrap_options = c(\"striped\", \"hover\", \"condensed\"),\n    full_width = FALSE\n  ) |>\n  kableExtra::row_spec(1, bold = TRUE, color = \"white\", background = \"#3366cc\")\n```\n# ── gt: publication-quality tables ────────────────────\n```{r}\nlibrary(gt)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Tables in R Markdown — kable, kableExtra, gt, DT — common patterns you'll see in production.\n# APPROACH  - Combine Tables in R Markdown — kable, kableExtra, gt, DT with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nmtcars |>\n  head(10) |>\n  gt() |>\n  tab_header(\n    title = \"Motor Trends Data\",\n    subtitle = \"First 10 vehicles\"\n  ) |>\n  cols_label(\n    mpg = \"MPG\",\n    cyl = \"Cylinders\",\n    hp = \"Horsepower\"\n  ) |>\n  fmt_number(columns = c(mpg, hp), decimals = 1)\n```\n# ── DT: interactive, searchable tables ─────────────────\n```{r}\nlibrary(DT)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Tables in R Markdown — kable, kableExtra, gt, DT — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ndatatable(mtcars,\n  options = list(\n    pageLength = 10,\n    autoWidth = TRUE,\n    search = TRUE         # enable search box\n  ),\n  filter = \"top\"          # column filter dropdowns\n)\n```"
                  }
        ],
        tips: [
                  "kable + kableExtra for styled static tables — good for PDF/Word.",
                  "gt for publication tables — full control over formatting.",
                  "DT for interactive exploration — search, sort, filter in HTML."
        ],
        mistake: "Using print() for data frame output instead of kable — bare output is hard to read.",
        shorthand: {
          verbose: "// Manual / verbose approach\nprint(df)  # plain output\n// More explicit but longer",
          concise: "kable(df)  # formatted table",
        },
      },
      {
        id: "rmd-interactive",
        fn: "Interactive Content in R Markdown — htmlwidgets, plotly, leaflet",
        desc: "Interactive plots/maps: plotly::ggplotly(), leaflet maps, reactable, Shiny.",
        category: "R Markdown",
        subtitle: "htmlwidgets, plotly, ggplotly, leaflet, reactable, shiny::{input,output}",
        signature: "plotly::ggplotly(plot)  |  leaflet()  |> addTiles()  |  reactable(df, searchable = TRUE)",
        descLong: "Embed interactive content in HTML R Markdown without a server. plotly for interactive plots. leaflet for maps. reactable for interactive tables. htmlwidgets provide the foundation. Full Shiny apps require a server.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Interactive Content in R Markdown — htmlwidgets, plotly, leaflet — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── plotly: interactive plots ──────────────────────────\n```{r}\nlibrary(ggplot2)\nlibrary(plotly)\np <- mtcars |>\n  ggplot(aes(wt, mpg, color = factor(cyl))) +\n  geom_point(size = 3) +\n  theme_minimal()\nggplotly(p)  # convert ggplot to interactive plot\n```\n# ── leaflet: interactive maps ──────────────────────────\n```{r}\nlibrary(leaflet)\nleaflet() |>\n  addTiles() |>  # OpenStreetMap basemap\n  addCircleMarkers(\n    lat = 45.5,\n    lng = -122.7,\n    popup = \"Portland, OR\",\n    radius = 10,\n    color = \"red\"\n  ) |>\n  setView(lat = 45.5, lng = -122.7, zoom = 10)\n```"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Interactive Content in R Markdown — htmlwidgets, plotly, leaflet — common patterns you'll see in production.\n# APPROACH  - Combine Interactive Content in R Markdown — htmlwidgets, plotly, leaflet with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── reactable: interactive data tables ─────────────────\n```{r}\nlibrary(reactable)\nreactable(mtcars,"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Interactive Content in R Markdown — htmlwidgets, plotly, leaflet — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nsearchable = TRUE,\n  filterable = TRUE,\n  sortable = TRUE,\n  striped = TRUE,\n  pagination = TRUE,\n  defaultPageSize = 10\n)\n```\n# ── Combining interactive elements ─────────────────────\n# Multiple plotly plots on same page:\n```{r}\np1 <- mtcars |> ggplot(aes(wt, mpg)) + geom_point()\np2 <- mtcars |> ggplot(aes(hp, mpg)) + geom_point()\nsubplot(ggplotly(p1), ggplotly(p2), nrows = 1)\n```"
                  }
        ],
        tips: [
                  "htmlwidgets (plotly, leaflet, reactable) work in HTML output without a server.",
                  "ggplotly() converts ggplot to interactive quickly — tooltip, zoom, pan.",
                  "For user interactions (buttons, sliders), use Shiny not htmlwidgets."
        ],
        mistake: "Using static plots when interactive would improve exploration.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Static plot\nggplot(data, aes(x, y)) + geom_point()\n// More explicit but longer",
          concise: "# Interactive plot\nggplot(data, aes(x, y)) + geom_point() |> ggplotly()",
        },
      },
      {
        id: "rmd-css-theme",
        fn: "Styling R Markdown — CSS, Themes, Custom Styles",
        desc: "Styling: theme, css, custom.scss, includes for header/footer.",
        category: "R Markdown",
        subtitle: "theme (bootswatch), css, includes (in_header, before_body)",
        signature: "theme: flatly  |  css: style.css  |  includes: in_header: header.html",
        descLong: "Control document appearance with themes, custom CSS, and HTML includes. Bootswatch themes for quick styling. Custom CSS for fine-grained control. HTML includes for headers/footers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Styling R Markdown — CSS, Themes, Custom Styles — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── YAML with theme and CSS ────────────────────────────\n---\ntitle: \"Styled Document\"\noutput:\n  html_document:\n    theme: flatly              # bootswatch theme\n    css: custom.css\n    includes:\n      in_header: header.html   # custom header HTML\n      before_body: before.html # HTML before content\n---\n# ── Custom CSS file (custom.css) ───────────────────────\n/* Custom styles for body */\nbody {\n  font-family: \"Segoe UI\", sans-serif;\n  line-height: 1.6;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Styling R Markdown — CSS, Themes, Custom Styles — common patterns you'll see in production.\n# APPROACH  - Combine Styling R Markdown — CSS, Themes, Custom Styles with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n/* Highlight code blocks */\n.hljs {\n  background: #f5f5f5;\n  border-radius: 4px;\n  padding: 10px;\n}\n/* Custom heading styles */\nh1 {\n  border-bottom: 3px solid #3366cc;\n  padding-bottom: 10px;\n}\n# ── Available bootswatch themes ────────────────────────\n# default, cerulean, cosmo, cyborg, darkly, flatly,\n# journal, litera, lumen, lux, materia, minty, morph,\n# neon, pulse, quartz, sandstone, simplex, sketchy,\n# slate, solar, spacelab, superhero, united, vapor,\n# yeti, zephir"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Styling R Markdown — CSS, Themes, Custom Styles — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── HTML includes (in_header) ──────────────────────────\n<!-- Font awesome for icons -->\n<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css\">\n<!-- Custom analytics -->\n<script>\n  // custom JS here\n</script>"
                  }
        ],
        tips: [
                  "Bootswatch themes quick and professional — no CSS writing needed.",
                  "Custom CSS for branding and fine-grained control.",
                  "HTML includes for analytics, fonts, and custom scripts."
        ],
        mistake: "Using inline style= attributes instead of CSS classes.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Bootswatch themes available, pick one\n// More explicit but longer",
          concise: "theme: flatly",
        },
      },
      {
        id: "quarto-advanced",
        fn: "Quarto Advanced — Callouts, Cross-Refs, Publish",
        desc: "Quarto features: callout-note/warning/tip, @fig/@tbl cross-refs, quarto publish.",
        category: "Quarto",
        subtitle: "callout blocks, cross-references (@fig-*, @tbl-*), quarto publish",
        signature: "::: {.callout-note}  |  As shown in @fig-scatter  |  quarto publish gh-pages",
        descLong: "Quarto adds modern features over R Markdown. Callout blocks for emphasis. Cross-references with auto-numbering. One-command publishing. Better defaults and multi-language support.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Quarto Advanced — Callouts, Cross-Refs, Publish — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Callout blocks (various types) ────────────────────\n::: {.callout-note}\n## Note\nThis is a note — use for supplementary information.\n:::\n::: {.callout-warning}\n## Warning\nThis is a warning — important caveats or gotchas.\n:::\n::: {.callout-tip}\n## Pro Tip\nThis is a tip — best practices or advanced usage.\n:::\n::: {.callout-important}\n## Important\nCritical information readers must know.\n:::"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Quarto Advanced — Callouts, Cross-Refs, Publish — common patterns you'll see in production.\n# APPROACH  - Combine Quarto Advanced — Callouts, Cross-Refs, Publish with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n::: {.callout-caution}\n## Caution\nUse sparingly — signals serious warnings.\n:::\n# ── Cross-references (auto-numbered) ───────────────────\n# Figure label must start with fig-\n```{r}\n#| label: fig-scatter\n#| fig-cap: \"Scatter plot of mpg vs weight\"\nplot(mtcars$wt, mtcars$mpg)\n```\nAs shown in @fig-scatter, there is a negative correlation.\n# Table label must start with tbl-\n```{r}\n#| label: tbl-summary\n#| tbl-cap: \"Summary statistics\"\nknitr::kable(head(mtcars))\n```"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Quarto Advanced — Callouts, Cross-Refs, Publish — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nSee @tbl-summary for details.\n# ── Heading with ID for cross-reference ───────────────\n## Methods {#sec-methods}\nThe methodology is described in @sec-methods.\n# ── Publish to GitHub Pages ────────────────────────────\n# quarto publish gh-pages\n# Automatically builds, commits to gh-pages branch, and deploys\n# ── Other publish targets ──────────────────────────────\n# quarto publish netlify\n# quarto publish quarto-pub\n# quarto publish connect"
                  }
        ],
        tips: [
                  "Cross-references auto-number — no manual \"Figure 1\" needed.",
                  "Callout blocks highlight key information — improves readability.",
                  "quarto publish gh-pages seamless deployment to GitHub Pages."
        ],
        mistake: "Manual numbering instead of using cross-references.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Manual: \"As shown in Figure 1...\"\n// More explicit but longer",
          concise: "# Quarto: As shown in @fig-name",
        },
      },
      {
        id: "bookdown-basics",
        fn: "bookdown — Multi-Chapter Books & Theses",
        desc: "bookdown: cross-chapter references, multi-format books, _bookdown.yml.",
        category: "R Markdown",
        subtitle: "bookdown::gitbook, _bookdown.yml, chapter references, appendices",
        signature: "bookdown::gitbook  |  rmd_files: [...]  |  output_dir: \"docs\"",
        descLong: "bookdown extends R Markdown for writing books. Cross-chapter references. Numbering across chapters. Multi-format output (HTML, PDF, ePub). Configure in _bookdown.yml.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of bookdown — Multi-Chapter Books & Theses — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── _bookdown.yml configuration ────────────────────────\nbook_filename: \"my-book\"\noutput_dir: \"docs\"\nrmd_files: [\n  \"index.Rmd\",\n  \"01-intro.Rmd\",\n  \"02-data.Rmd\",\n  \"03-analysis.Rmd\",\n  \"04-conclusions.Rmd\"\n]\nchapter_title_prefix: \"Chapter \"\ndelete_merged_file: true\n# ── index.Rmd (main book file with YAML) ──────────────\n---\ntitle: \"R for Data Science\"\nauthor: \"Your Name\"\ndate: `r Sys.Date()`\noutput:\n  bookdown::gitbook:\n    split_by: chapter\n  bookdown::pdf_book:\n    latex_engine: xelatex\n  bookdown::epub_book: default\n---"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of bookdown — Multi-Chapter Books & Theses — common patterns you'll see in production.\n# APPROACH  - Combine bookdown — Multi-Chapter Books & Theses with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Introduction {#intro}\nThis is Chapter 1. Cross-reference with \\@ref(intro).\n# ── Chapter files (01-intro.Rmd, etc.) ─────────────────\n# No YAML needed in child chapters\n# Use {#label} for cross-references:\n# Data {#data}\nWe clean data as described in Chapter \\@ref(intro).\n# ── Figures with captions for cross-reference ────────\n```{r, fig.cap = \"Plot description\"}\nplot(mtcars$wt, mtcars$mpg)\n```\nFigure \\@ref(fig:chunk-name) shows the relationship."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of bookdown — Multi-Chapter Books & Theses — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Appendices ────────────────────────────────────────\n# Add `{-}` to heading to make it not numbered:\n# Appendix {-}\n# More Details {-}\nbookdown::render_book(\"index.Rmd\", \"all\")  # render all formats"
                  }
        ],
        tips: [
                  "Cross-chapter references with \\@ref(label) — works across all chapters.",
                  "Split chapters for better navigation — gitbook format.",
                  "Single source, multiple outputs (HTML, PDF, ePub)."
        ],
        mistake: "Writing separate files without central _bookdown.yml.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Manual chapter management\n// More explicit but longer",
          concise: "# _bookdown.yml + bookdown::render_book()",
        },
      },
      {
        id: "flexdashboard",
        fn: "flexdashboard — Interactive Dashboards (No Shiny Server)",
        desc: "flexdashboard: R Markdown-based dashboards with layout, value boxes, plots.",
        category: "R Markdown",
        subtitle: "flexdashboard layout, {.sidebar}, {.value-box}, orientation, gauge()",
        signature: "output: flexdashboard::flex_dashboard  |  ## Row {data-height=300}  |  valueBox(value, icon=\"fa-heart\")",
        descLong: "flexdashboard turns R Markdown into interactive dashboards. Define layout with headings and row/column directives. No Shiny server needed. Great for operational dashboards, reports, and exploration tools.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of flexdashboard — Interactive Dashboards (No Shiny Server) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── flexdashboard YAML header ──────────────────────────\n---\ntitle: \"Sales Dashboard\"\noutput:\n  flexdashboard::flex_dashboard:\n    orientation: rows              # rows or columns\n    vertical_layout: fill          # fill or scroll\n    theme: bootstrap              # theme name\n    source_code: embed            # embed source code\n---\n# ── Layout with rows ───────────────────────────────────\n## Row {data-height=300}\n### Revenue\n```{r}\nvalueBox(value = 125000,\n         caption = \"Total Revenue\",\n         icon = \"fa-dollar\",\n         color = \"success\")\n```\n### Orders\n```{r}\nvalueBox(value = 540,\n         caption = \"Total Orders\",\n         icon = \"fa-shopping-cart\",\n         color = \"info\")\n```"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of flexdashboard — Interactive Dashboards (No Shiny Server) — common patterns you'll see in production.\n# APPROACH  - Combine flexdashboard — Interactive Dashboards (No Shiny Server) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n## Row {data-height=700}\n### Trend Chart\n```{r}\nplot(mtcars$wt, mtcars$mpg, main = \"MPG by Weight\")\n```\n### Distribution\n```{r}\nhist(mtcars$mpg, main = \"MPG Distribution\")\n```\n# ── Sidebar for controls (no Shiny) ────────────────────\n## {.sidebar}\nThis is sidebar content — explanations, instructions, etc.\n```{r}\n# Note: no reactive inputs, but you can show instructions\n# For interactive controls, use Shiny instead\n```\n# ── Storyboard mode (for presentations) ────────────────\noutput:\n  flexdashboard::flex_dashboard:\n    storyboard: true"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of flexdashboard — Interactive Dashboards (No Shiny Server) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n### Frame 1 {data-commentary-width=400}\n```{r}\nplot(mtcars$wt, mtcars$mpg)\n```\n> This is the narrative commentary on the right.\n### Frame 2\n```{r}\nhist(mtcars$mpg)\n```"
                  }
        ],
        tips: [
                  "valueBox() for KPI display — visual metrics.",
                  "No Shiny needed — pure R Markdown, static generation.",
                  "Storyboard mode for presentations — narrative + visuals side-by-side."
        ],
        mistake: "Building dashboards with Shiny when flexdashboard suffices.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Complex Shiny app for simple dashboard\n// More explicit but longer",
          concise: "# flexdashboard for static dashboards",
        },
      },
      {
        id: "quarto-projects",
        fn: "Quarto Projects — Websites, Books & Blogs",
        desc: "Build multi-page websites, documentation sites, blogs, and books with Quarto projects.",
        category: "Quarto",
        subtitle: "_quarto.yml, quarto publish, website, book projects",
        signature: "quarto create project website  |  quarto publish gh-pages  |  type: website",
        descLong: "Quarto projects organize multiple .qmd files into cohesive outputs. Website projects create documentation or personal sites with navigation, search, and theming. Book projects produce multi-chapter documents in HTML, PDF, and ePub simultaneously. Blog projects include listing pages and RSS feeds. Publish to GitHub Pages, Netlify, Quarto Pub, or Posit Connect with one command.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Quarto Projects — Websites, Books & Blogs — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── _quarto.yml for a website ────────────────────────\nproject:\n  type: website\nwebsite:\n  title: \"My Data Blog\"\n  navbar:\n    left:\n      - text: Home\n        href: index.qmd\n      - text: About\n        href: about.qmd\n      - text: Posts\n        href: posts/index.qmd\n    right:\n      - icon: github\n        href: https://github.com/user/repo\n  search: true\n  page-footer:\n    center: \"Built with Quarto\"\nformat:\n  html:\n    theme:\n      light: cosmo\n      dark: darkly\n    css: styles.css\n    toc: true"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Quarto Projects — Websites, Books & Blogs — common patterns you'll see in production.\n# APPROACH  - Combine Quarto Projects — Websites, Books & Blogs with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── _quarto.yml for a book ─────────────────────────\nproject:\n  type: book\nbook:\n  title: \"R for Data Science\"\n  author: \"Data Team\"\n  chapters:\n    - index.qmd\n    - intro.qmd\n    - data-viz.qmd\n    - modeling.qmd\n    - references.qmd\n  appendices:\n    - appendix-a.qmd\nformat:\n  html:\n    theme: cosmo\n  pdf:\n    documentclass: scrbook\n  epub:\n    cover-image: cover.png\n# ── Blog listing page (posts/index.qmd YAML) ────────\n# title: \"Blog Posts\"\n# listing:\n#   contents: posts\n#   sort: \"date desc\"\n#   type: default\n#   categories: true\n#   feed: true"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Quarto Projects — Websites, Books & Blogs — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Individual post YAML ─────────────────────────────\n# title: \"My Analysis\"\n# date: 2024-12-01\n# categories: [analysis, R]\n# image: thumbnail.png\n# ── Publish ─────────────────────────────────────────\n# quarto publish gh-pages        # GitHub Pages\n# quarto publish netlify          # Netlify\n# quarto publish quarto-pub       # Quarto Pub (free)\n# quarto publish connect          # Posit Connect"
                  }
        ],
        tips: [
                  "quarto publish gh-pages deploys to GitHub Pages with one command — it handles the gh-pages branch automatically.",
                  "type: website with search: true gives you full-text search across all pages — no external service needed.",
                  "Light/dark theme toggle is built in — just specify both themes in _quarto.yml.",
                  "Blog listing pages auto-generate from post front matter — categories, dates, and thumbnails come from YAML."
        ],
        mistake: "Building a personal site with a complex static site generator when Quarto does it natively — Quarto websites support blogs, search, dark mode, and R/Python code execution out of the box.",
        shorthand: {
          verbose: "# Manual website building (verbose, fragile)\n# Hand-code HTML, manage navigation, handle search\n# Write Jekyll, Hugo configs manually",
          concise: "# Quarto website\nquarto create project website\n# Automatic navbar, search, theming, blog support",
        },
      },
    ],
  },
]

export default { meta, sections }
