export const meta = {
  "id": "shiny",
  "label": "Shiny Web Apps",
  "icon": "📊",
  "description": "R Shiny: reactive web applications, UI components, server logic, layouts, and deployment."
}

export const sections = [

  // ── Section 1: Shiny Fundamentals ─────────────────────────────────────────
  {
    id: "shiny-core",
    title: "Shiny Fundamentals",
    entries: [
      {
        id: "shiny-structure",
        fn: "App Structure — UI, Server & Reactivity",
        desc: "The anatomy of a Shiny app — ui defines layout, server defines logic, reactivity connects them.",
        category: "Shiny",
        subtitle: "fluidPage, renderPlot, reactive, observe, shinyApp",
        signature: "shinyApp(ui, server)  |  output$plot <- renderPlot({})  |  reactive({})",
        descLong: "A Shiny app has two parts: ui (what the user sees) and server (what happens behind the scenes). The ui builds HTML with R functions — inputs (sliderInput, selectInput) and outputs (plotOutput, tableOutput). The server function connects inputs to outputs through reactive expressions. Reactivity is automatic — when an input changes, all dependent outputs update. reactive() creates cached computed values. observeEvent() triggers side effects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of App Structure — UI, Server & Reactivity — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\n# ── Minimal Shiny app ──────────────────────────────\nui <- fluidPage(\n  titlePanel(\"My Dashboard\"),\n  sidebarLayout(\n    sidebarPanel(\n      sliderInput(\"n\", \"Sample size:\", min = 10, max = 1000, value = 100),\n      selectInput(\"dist\", \"Distribution:\",\n                  choices = c(\"Normal\" = \"norm\", \"Uniform\" = \"unif\",\n                              \"Exponential\" = \"exp\")),\n      actionButton(\"resample\", \"Resample\", icon = icon(\"refresh\"))\n    ),\n    mainPanel(\n      plotOutput(\"histogram\"),\n      verbatimTextOutput(\"summary\"),\n      tableOutput(\"stats_table\")\n    )\n  )\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of App Structure — UI, Server & Reactivity — common patterns you'll see in production.\n# APPROACH  - Combine App Structure — UI, Server & Reactivity with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nserver <- function(input, output, session) {\n  # reactive() — cached computed value, updates when inputs change\n  data <- reactive({\n    input$resample   # re-run when button clicked\n    n <- input$n\n    switch(input$dist,\n           norm = rnorm(n),\n           unif = runif(n),\n           exp  = rexp(n))\n  })\n  # renderPlot — reactive output\n  output$histogram <- renderPlot({\n    hist(data(), breaks = 30, col = \"steelblue\", border = \"white\",\n         main = paste(\"Distribution:\", input$dist))\n  })\n  # renderPrint — text output\n  output$summary <- renderPrint({\n    summary(data())\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of App Structure — UI, Server & Reactivity — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# renderTable — table output\n  output$stats_table <- renderTable({\n    d <- data()\n    data.frame(\n      Stat = c(\"Mean\", \"SD\", \"Min\", \"Max\"),\n      Value = c(mean(d), sd(d), min(d), max(d))\n    )\n  })\n  # observeEvent — side effects (notifications, file writes)\n  observeEvent(input$resample, {\n    showNotification(\"Resampled!\", type = \"message\", duration = 2)\n  })\n}\nshinyApp(ui, server)"
                  }
        ],
        tips: [
                  "reactive() caches its value — it only re-computes when a dependency changes, not on every access.",
                  "Use observeEvent() for side effects (notifications, file writes) — never put side effects in reactive().",
                  "input$x is reactive — accessing it inside render*/reactive/observe creates an automatic dependency.",
                  "actionButton creates an event counter — use it with observeEvent() or as a dependency in reactive()."
        ],
        mistake: "Putting data loading inside renderPlot() directly — it re-loads data every time the plot re-renders. Extract data loading into a reactive() expression so it is cached and shared across outputs.",
        shorthand: {
          verbose: "# Complex nested UI (verbose)\nfluidPage(fluidRow(\n  column(3, fluidRow(\n    fluidRow(sliderInput(...)),\n    fluidRow(selectInput(...)))),\n  column(9, fluidRow(\n    plotOutput(...), tableOutput(...)))))",
          concise: "# sidebarLayout (built-in structure)\nfluidPage(\n  sidebarLayout(\n    sidebarPanel(...),\n    mainPanel(...)\n  )\n)",
        },
      },
      {
        id: "shiny-reactivity",
        fn: "Reactivity Patterns — reactiveVal, eventReactive, isolate",
        desc: "Advanced reactive patterns: mutable state with reactiveVal, conditional execution, debouncing, and isolation.",
        category: "Shiny",
        subtitle: "reactiveVal, reactiveValues, eventReactive, isolate, debounce",
        signature: "reactiveVal(0)  |  eventReactive(input$go, {})  |  isolate(input$x)",
        descLong: "Beyond basic reactive(), Shiny offers fine-grained reactivity control. reactiveVal() creates a single mutable reactive value. reactiveValues() creates a list of them. eventReactive() only updates when a specific event fires (not when any dependency changes). isolate() reads a reactive value WITHOUT creating a dependency. debounce()/throttle() prevent rapid-fire updates from text inputs or sliders.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Reactivity Patterns — reactiveVal, eventReactive, isolate — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nserver <- function(input, output, session) {\n  # ── reactiveVal — single mutable value ────────────\n  counter <- reactiveVal(0)\n  observeEvent(input$increment, {\n    counter(counter() + 1)  # read with (), set with (value)\n  })\n  output$count <- renderText({\n    paste(\"Count:\", counter())\n  })\n  # ── reactiveValues — mutable named list ───────────\n  state <- reactiveValues(\n    data = NULL,\n    filtered = NULL,\n    selected_row = NULL\n  )\n  observeEvent(input$load, {\n    state$data <- read.csv(input$file$datapath)\n    state$filtered <- state$data  # initialize\n  })"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Reactivity Patterns — reactiveVal, eventReactive, isolate — common patterns you'll see in production.\n# APPROACH  - Combine Reactivity Patterns — reactiveVal, eventReactive, isolate with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nobserveEvent(input$filter_col, {\n    req(state$data)  # don't run if data is NULL\n    state$filtered <- state$data[state$data[[input$filter_col]] > input$threshold, ]\n  })\n  # ── eventReactive — update ONLY on event ──────────\n  # Does NOT update when input$query changes — only on button click\n  search_results <- eventReactive(input$search_btn, {\n    api_search(input$query)  # expensive operation\n  })\n  output$results <- renderTable({\n    search_results()\n  })\n  # ── isolate — read without dependency ─────────────\n  observeEvent(input$save, {\n    # Read input$filename without re-running when filename changes\n    fname <- isolate(input$filename)\n    write.csv(state$data, fname)\n    showNotification(paste(\"Saved to\", fname))\n  })\n  # ── req() — stop if value is NULL/FALSE/empty ────\n  output$plot <- renderPlot({\n    req(input$file)        # don't render until file uploaded\n    req(nrow(state$data) > 0)  # don't render with empty data\n    plot(state$data)\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Reactivity Patterns — reactiveVal, eventReactive, isolate — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── debounce — wait for user to stop typing ──────\n  search_term <- reactive({ input$search }) |> debounce(500)\n  output$live_search <- renderTable({\n    req(nchar(search_term()) > 2)\n    filter_data(state$data, search_term())\n  })\n  # ── validate — show friendly error messages ──────\n  output$filtered_plot <- renderPlot({\n    validate(\n      need(input$file, \"Please upload a CSV file\"),\n      need(nrow(state$filtered) > 0, \"No data matches your filter\")\n    )\n    plot(state$filtered)\n  })\n}"
                  }
        ],
        tips: [
                  "req() is essential — it silently stops execution when a value is NULL, preventing errors during initialization.",
                  "eventReactive() is for expensive operations — it only runs when the event fires, not when any input changes.",
                  "isolate() lets you read reactive values without creating dependencies — use for \"current value at time of event\".",
                  "debounce(500) waits 500ms after the last change before updating — prevents API spam from text inputs."
        ],
        mistake: "Using reactive() when you need eventReactive() — reactive() updates when ANY dependency changes. If you have a search box and a button, reactive() fires on every keystroke. eventReactive(input$btn, {}) only fires on button click.",
        shorthand: {
          verbose: "# Verbose mutable state (manual updates)\nstate <- list(count = 0)\nobserveEvent(input$btn, {\n  state$count <- state$count + 1\n  output$text <- renderText(state$count)\n})",
          concise: "# reactiveVal + isolate\ncounter <- reactiveVal(0)\nobserveEvent(input$btn, {\n  counter(counter() + 1)\n})",
        },
      },
      {
        id: "shiny-ui-components",
        fn: "UI Components — Layouts, Tabs, Modals & Dynamic UI",
        desc: "Build complex UIs with tabsets, navbars, cards, conditional panels, modals, and dynamic UI generation.",
        category: "Shiny",
        subtitle: "navbarPage, tabsetPanel, conditionalPanel, showModal, renderUI",
        signature: "navbarPage(\"App\", tabPanel(...))  |  showModal(modalDialog(...))  |  uiOutput(\"dynamic\")",
        descLong: "Shiny UI goes beyond basic sidebarLayout. navbarPage creates multi-page apps with tabs. tabsetPanel groups content within a page. conditionalPanel shows/hides UI based on input values. showModal/removeModal creates popup dialogs. renderUI/uiOutput generates UI dynamically from the server. bslib provides modern Bootstrap 5 themes and components. Use modules to organize complex UIs into reusable pieces.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of UI Components — Layouts, Tabs, Modals & Dynamic UI — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\nlibrary(bslib)\n# ── Modern themed app with bslib ────────────────────\nui <- page_navbar(\n  title = \"Analytics Dashboard\",\n  theme = bs_theme(\n    version = 5,\n    bootswatch = \"flatly\",\n    primary = \"#3b82f6\"\n  ),\n  # Tab 1: Data Explorer\n  nav_panel(\"Data\",\n    layout_sidebar(\n      sidebar = sidebar(\n        fileInput(\"file\", \"Upload CSV\", accept = \".csv\"),\n        conditionalPanel(\n          condition = \"output.file_loaded\",\n          selectInput(\"x_var\", \"X Variable:\", choices = NULL),\n          selectInput(\"y_var\", \"Y Variable:\", choices = NULL),\n          actionButton(\"plot_btn\", \"Generate Plot\", class = \"btn-primary\")\n        )\n      ),\n      card(\n        card_header(\"Scatter Plot\"),\n        plotOutput(\"scatter\", height = \"400px\")\n      ),\n      card(\n        card_header(\"Data Preview\"),\n        tableOutput(\"preview\")\n      )\n    )\n  ),"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of UI Components — Layouts, Tabs, Modals & Dynamic UI — common patterns you'll see in production.\n# APPROACH  - Combine UI Components — Layouts, Tabs, Modals & Dynamic UI with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Tab 2: Analysis\n  nav_panel(\"Analysis\",\n    layout_columns(\n      col_widths = c(4, 8),\n      card(\n        card_header(\"Settings\"),\n        numericInput(\"confidence\", \"Confidence Level:\", 0.95, 0.5, 0.99, 0.01),\n        checkboxGroupInput(\"tests\", \"Run Tests:\",\n          choices = c(\"t-test\", \"ANOVA\", \"Chi-squared\", \"Correlation\"))\n      ),\n      card(\n        card_header(\"Results\"),\n        verbatimTextOutput(\"test_results\")\n      )\n    )\n  ),\n  # Tab 3: About\n  nav_panel(\"About\",\n    card(markdown(\"## About\\nBuilt with Shiny and bslib.\"))\n  )\n)\nserver <- function(input, output, session) {\n  # Signal to conditionalPanel that file is loaded\n  output$file_loaded <- reactive({ !is.null(input$file) })\n  outputOptions(output, \"file_loaded\", suspendWhenHidden = FALSE)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of UI Components — Layouts, Tabs, Modals & Dynamic UI — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Dynamic dropdowns based on uploaded data\n  observeEvent(input$file, {\n    df <- read.csv(input$file$datapath)\n    nums <- names(df)[sapply(df, is.numeric)]\n    updateSelectInput(session, \"x_var\", choices = nums)\n    updateSelectInput(session, \"y_var\", choices = nums, selected = nums[2])\n  })\n  # Modal dialog\n  observeEvent(input$plot_btn, {\n    showModal(modalDialog(\n      title = \"Generating...\",\n      \"Please wait while the plot renders.\",\n      footer = NULL, easyClose = TRUE\n    ))\n    Sys.sleep(0.5)  # simulate work\n    removeModal()\n  })\n}\nshinyApp(ui, server)"
                  }
        ],
        tips: [
                  "bslib provides modern Bootstrap 5 components — card(), layout_sidebar(), page_navbar() look professional out of the box.",
                  "conditionalPanel runs JavaScript conditions — use output.x to check server-side reactive values.",
                  "updateSelectInput() dynamically updates choices from the server — essential for data-dependent dropdowns.",
                  "layout_columns(col_widths = c(4, 8)) creates responsive column layouts — widths are Bootstrap 12-grid fractions."
        ],
        mistake: "Rebuilding the entire UI with renderUI when only a dropdown needs updating — use updateSelectInput/updateSliderInput to modify existing widgets. renderUI is expensive and causes UI flicker.",
        shorthand: {
          verbose: "# Rebuild entire UI (verbose, flickers)\noutput$ui <- renderUI({\n  selectInput(\"col\", \"Column:\",\n    choices = names(reactive_df()))\n})",
          concise: "# Update existing widget (smooth)\nobserveEvent(input$file, {\n  updateSelectInput(session, \"col\",\n    choices = names(loaded_df()))\n})",
        },
      },
      {
        id: "shiny-deploy",
        fn: "Shiny Deployment — shinyapps.io, Shiny Server & Docker",
        desc: "Deploy Shiny apps to production — shinyapps.io for hosted, Shiny Server for self-hosted, Docker for containers.",
        category: "Deployment",
        subtitle: "rsconnect::deployApp, shiny-server.conf, golem, rhino",
        signature: "rsconnect::deployApp()  |  shiny-server.conf  |  golem::run_app()",
        descLong: "Shiny apps can be deployed to shinyapps.io (hosted, easiest), Posit Connect (enterprise), self-hosted Shiny Server, or Docker containers. Use rsconnect package for one-click deploy to shinyapps.io. For production apps, golem or rhino frameworks add structure: R package format, dependency management, testing, CI/CD. Docker with rocker images ensures reproducibility. Always use renv for dependency lockfiles.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Shiny Deployment — shinyapps.io, Shiny Server & Docker — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Deploy to shinyapps.io ──────────────────────────\n# install.packages(\"rsconnect\")\nlibrary(rsconnect)\n# One-time setup\nrsconnect::setAccountInfo(\n  name   = \"your-account\",\n  token  = \"YOUR_TOKEN\",\n  secret = \"YOUR_SECRET\"\n)\n# Deploy\nrsconnect::deployApp(\n  appDir = \".\",\n  appName = \"my-dashboard\",\n  account = \"your-account\"\n)\n# ── Project structure (golem framework) ─────────────\n# myapp/\n# ├── DESCRIPTION          # R package metadata\n# ├── NAMESPACE\n# ├── R/\n# │   ├── app_server.R     # server logic\n# │   ├── app_ui.R         # ui definition\n# │   ├── mod_data.R       # data module\n# │   ├── mod_plot.R       # plot module\n# │   └── run_app.R        # entry point\n# ├── inst/\n# │   └── app/www/         # static files (CSS, JS, images)\n# ├── tests/\n# │   └── testthat/\n# ├── renv.lock            # dependency lockfile\n# └── Dockerfile"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Shiny Deployment — shinyapps.io, Shiny Server & Docker — common patterns you'll see in production.\n# APPROACH  - Combine Shiny Deployment — shinyapps.io, Shiny Server & Docker with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── renv for reproducible dependencies ──────────────\n# renv::init()      # initialize\n# renv::snapshot()  # save current library\n# renv::restore()   # install from lockfile\n# ── Dockerfile for Shiny ────────────────────────────\n# FROM rocker/shiny-verse:4.3"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Shiny Deployment — shinyapps.io, Shiny Server & Docker — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# RUN install2.r --error golem shiny bslib dplyr ggplot2\n# COPY . /srv/shiny-server/myapp\n# EXPOSE 3838\n# CMD [\"R\", \"-e\", \"shiny::runApp('/srv/shiny-server/myapp', port=3838, host='0.0.0.0')\"]\n# ── Performance tips for production ─────────────────\n# Cache expensive computations\ndata_cache <- bindCache(\n  renderPlot({ plot(filtered_data()) }),\n  input$x_var, input$y_var, input$filter\n)\n# Use ExtendedTask for long operations (Shiny 1.8+)\n# Doesn't block other users while running\ntask <- ExtendedTask$new(function(params) {\n  promises::future_promise({\n    expensive_computation(params)\n  })\n})"
                  }
        ],
        tips: [
                  "rsconnect::deployApp() is the fastest path to production — one command deploys to shinyapps.io.",
                  "Always use renv for dependency management — renv.lock ensures the same package versions in production.",
                  "golem structures your app as an R package — enables testing, documentation, and clean organization.",
                  "bindCache() caches expensive renders across sessions — critical for multi-user apps."
        ],
        mistake: "Not using renv in production — without a lockfile, package updates can break your deployed app. renv::snapshot() records exact versions; renv::restore() reproduces them.",
        shorthand: {
          verbose: "# Manual deployment (verbose)\n# Zip app folder\n# Upload manually via web UI\n# No dependency tracking\n# Different versions in prod vs local",
          concise: "# One-command deploy + renv\nrenv::snapshot()\nrsconnect::deployApp()\n# Locks versions, reproducible, automated",
        },
      },
      {
        id: "shiny-modules",
        fn: "Shiny Modules — Reusable UI & Server Components",
        desc: "Create reusable Shiny components with modules: NS(), moduleServer(), namespacing.",
        category: "Shiny Advanced",
        subtitle: "NS(), moduleServer(), namespacing, module communication, composition",
        signature: "NS(\"module_id\")  |  moduleServer(\"id\", function(input, output, session) {})  |  module_ui()",
        descLong: "Modules break large Shiny apps into reusable, testable pieces. Each module has its own UI and server logic with namespaced inputs/outputs (no conflicts). NS(\"id\") creates namespaced input IDs. moduleServer(\"id\", function(...){}) defines server logic. Essential for complex apps with repeated components (data upload, plots, tables).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Shiny Modules — Reusable UI & Server Components — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\n# ── Module UI function ─────────────────────────────────\ndata_upload_ui <- function(id) {\n  ns <- NS(id)  # Create namespace\n  tagList(\n    fileInput(ns(\"file\"), \"Upload CSV\"),\n    selectInput(ns(\"sep\"), \"Separator:\", c(\",\", \";\", \"\\\\t\")),\n    actionButton(ns(\"load\"), \"Load Data\")\n  )\n}\n# ── Module server function ──────────────────────────────\ndata_upload_server <- function(id) {\n  moduleServer(id, function(input, output, session) {\n    # Reactive: holds uploaded data\n    data <- reactiveVal(NULL)\n    observeEvent(input$load, {\n      req(input$file)\n      df <- read.csv(input$file$datapath, sep = input$sep)\n      data(df)\n    })\n    # Return reactive data to parent\n    return(data)\n  })\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Shiny Modules — Reusable UI & Server Components — common patterns you'll see in production.\n# APPROACH  - Combine Shiny Modules — Reusable UI & Server Components with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Plot module ─────────────────────────────────────────\nplot_ui <- function(id) {\n  ns <- NS(id)\n  tagList(\n    selectInput(ns(\"x\"), \"X Variable\", choices = NULL),\n    selectInput(ns(\"y\"), \"Y Variable\", choices = NULL),\n    plotOutput(ns(\"plot\"))\n  )\n}\nplot_server <- function(id, data) {\n  moduleServer(id, function(input, output, session) {\n    # Update dropdowns when data changes\n    observeEvent(data(), {\n      choices <- names(data())\n      updateSelectInput(session, \"x\", choices = choices)\n      updateSelectInput(session, \"y\", choices = choices, selected = choices[2])\n    })\n    # Render plot\n    output$plot <- renderPlot({\n      req(data(), input$x, input$y)\n      ggplot(data(), aes(.data[[input$x]], .data[[input$y]])) +\n        geom_point() + theme_minimal()\n    })\n  })\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Shiny Modules — Reusable UI & Server Components — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Use modules in main app ────────────────────────────\nui <- fluidPage(\n  titlePanel(\"Data Explorer with Modules\"),\n  sidebarLayout(\n    sidebarPanel(data_upload_ui(\"data_upload\")),\n    mainPanel(plot_ui(\"scatter_plot\"))\n  )\n)\nserver <- function(input, output, session) {\n  # Call module servers and get returned reactives\n  data <- data_upload_server(\"data_upload\")\n  plot_server(\"scatter_plot\", data)\n}\nshinyApp(ui, server)"
                  }
        ],
        tips: [
                  "NS(\"id\") creates namespace — prevents input ID collisions in complex apps",
                  "moduleServer() returns values to parent — use reactiveVal() + return for communication",
                  "Modules are composable — use modules within modules for deeply nested structures",
                  "Test modules independently with shiny::testServer() — easier testing than full app"
        ],
        mistake: "Hardcoding input IDs instead of using NS(). App breaks when reusing module. Always: NS(id) in UI, moduleServer(id) in server.",
        shorthand: {
          verbose: "# Without modules (brittle)\nui <- fluidPage(\n  fileInput(\"file1\", \"Upload\"),\n  fileInput(\"file2\", \"Upload 2\"),  # can't reuse component\n  plotOutput(\"plot1\"),\n  plotOutput(\"plot2\")\n)",
          concise: "# With modules (composable)\nui <- fluidPage(\n  upload_ui(\"upload1\"),\n  upload_ui(\"upload2\"),\n  plot_ui(\"plot1\"),\n  plot_ui(\"plot2\")\n)",
        },
      },
      {
        id: "shiny-reactive-patterns",
        fn: "Shiny Reactive Patterns — reactive(), eventReactive(), observe(), observeEvent()",
        desc: "Choose right reactive pattern: caching with reactive(), events with eventReactive(), side effects with observe().",
        category: "Shiny Advanced",
        subtitle: "reactive() vs eventReactive(), observe() vs observeEvent(), execution timing",
        signature: "reactive({})  |  eventReactive(input$btn, {})  |  observe({})  |  observeEvent(input$event, {})",
        descLong: "Reactivity in Shiny can be confusing. reactive() caches computed values (runs when dependencies change). eventReactive() waits for specific event. observe() runs side effects (no return). observeEvent() runs side effects on specific event. Understanding these prevents wasted computation and unexpected behavior.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Shiny Reactive Patterns — reactive(), eventReactive(), observe(), observeEvent() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nserver <- function(input, output, session) {\n  # ── reactive() — cached value, updates on dependency change ─\n  # Use when: same computation used by multiple outputs\n  expensive_result <- reactive({\n    # Runs when input$x or input$y changes\n    Sys.sleep(2)  # slow computation\n    input$x + input$y\n  })\n  # Multiple outputs can call it without recomputing:\n  output$result1 <- renderText(expensive_result())\n  output$result2 <- renderText(expensive_result())  # uses cache!\n  # ── eventReactive() — wait for event, then compute ─────────\n  # Use when: computation is expensive, want control over when it runs\n  # Unlike reactive(), only runs when event fires\n  search_results <- eventReactive(input$search_btn, {\n    # Runs ONLY when search_btn clicked, not on every keystroke\n    api_search(input$query)  # expensive API call\n  })\n  output$results <- renderTable(search_results())\n  # ── observe() — side effects, no return value ────────────────\n  # Use when: need to do something (write file, update DB) when reactive changes\n  observe({\n    # Runs every time any dependency changes\n    log_activity(\"User changed\", input$filter)\n  })"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Shiny Reactive Patterns — reactive(), eventReactive(), observe(), observeEvent() — common patterns you'll see in production.\n# APPROACH  - Combine Shiny Reactive Patterns — reactive(), eventReactive(), observe(), observeEvent() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── observeEvent() — side effects on specific event ────────\n  # Use when: need to do something on specific action\n  observeEvent(input$save_btn, {\n    # Runs ONLY when save_btn clicked\n    write_to_database(filtered_data())\n    showNotification(\"Saved!\", type=\"message\")\n  })\n  # ── Combining patterns ──────────────────────────────────────\n  # Complex workflow: filter data, search API, save results\n  # 1. reactive: filter data\n  filtered_data <- reactive({\n    req(input$file)  # stop if file not loaded\n    read.csv(input$file$datapath) |>\n      filter(category == input$category)\n  })\n  # 2. eventReactive: expensive API call on button\n  api_results <- eventReactive(input$analyze_btn, {\n    req(filtered_data())\n    expensive_api(filtered_data())\n  })\n  # 3. observe: log every reactive change (low cost)\n  observe({\n    log(nrow(filtered_data()), \" rows after filter\")\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Shiny Reactive Patterns — reactive(), eventReactive(), observe(), observeEvent() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# 4. observeEvent: save on button click\n  observeEvent(input$export_btn, {\n    write.csv(api_results(), \"results.csv\")\n  })\n  # ── debounce: reduce event frequency ───────────────────────\n  search_term <- reactive(input$search) |> debounce(500)\n  output$live_results <- renderTable({\n    req(nchar(search_term()) > 2)\n    search_database(search_term())\n  })  # only re-runs 500ms after user stops typing\n}"
                  }
        ],
        tips: [
                  "reactive() for computed values (caching), eventReactive() for expensive operations on events",
                  "observe() for side effects (logging, file writes), observeEvent() for event-triggered side effects",
                  "debounce() + throttle() reduce event frequency — prevent API spam from text input",
                  "req(value) stops execution if value is NULL/FALSE/empty — prevents errors"
        ],
        mistake: "Using reactive() when you need eventReactive(). reactive() runs on every dependency change. If you have text input + button, reactive() fires per keystroke. Use eventReactive(input$btn) to fire only on click.",
        shorthand: {
          verbose: "# Verbose (recomputes every keystroke)\nreactive({\n  expensive_api(input$search)  # runs constantly!\n})",
          concise: "# Efficient (runs only on button click)\neventReactive(input$search_btn, {\n  expensive_api(input$search)\n})",
        },
      },
      {
        id: "shiny-render-functions",
        fn: "Shiny Render Functions — renderPlot, renderTable, renderUI, renderPrint",
        desc: "Output render functions: renderPlot(), renderTable(), renderUI(), renderPrint(), renderText().",
        category: "Shiny Core",
        subtitle: "renderPlot, renderTable, renderUI, renderPrint, renderDataTable, renderText",
        signature: "renderPlot({})  |  renderTable({})  |  renderUI({})  |  renderPrint({})",
        descLong: "Each output type needs corresponding render function. renderPlot() for ggplot/base plots, renderTable() for data frames, renderUI() for dynamic HTML, renderPrint() for text output (like str(), summary()). Match with Output*() UI function: plotOutput with renderPlot, tableOutput with renderTable, etc.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Shiny Render Functions — renderPlot, renderTable, renderUI, renderPrint — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\nlibrary(ggplot2)\nui <- fluidPage(\n  titlePanel(\"Render Functions Demo\"),\n  sidebarPanel(\n    sliderInput(\"n\", \"N:\", 10, 1000, 100),\n    selectInput(\"dist\", \"Distribution:\",\n               c(\"Normal\"=\"norm\", \"Uniform\"=\"unif\", \"Exponential\"=\"exp\"))\n  ),\n  mainPanel(\n    plotOutput(\"plot\"),\n    tableOutput(\"summary_table\"),\n    verbatimTextOutput(\"text_output\"),\n    uiOutput(\"dynamic_ui\")\n  )\n)\nserver <- function(input, output, session) {\n  # ── renderPlot: ggplot or base plot ─────────────────────\n  output$plot <- renderPlot({\n    data <- data.frame(\n      x = switch(input$dist,\n                 norm = rnorm(input$n),\n                 unif = runif(input$n),\n                 exp = rexp(input$n))\n    )\n    ggplot(data, aes(x)) +\n      geom_histogram(bins=30, fill=\"steelblue\") +\n      theme_minimal() +\n      labs(title = paste(\"Distribution:\", input$dist))\n  })"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Shiny Render Functions — renderPlot, renderTable, renderUI, renderPrint — common patterns you'll see in production.\n# APPROACH  - Combine Shiny Render Functions — renderPlot, renderTable, renderUI, renderPrint with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── renderTable: data frame → HTML table ────────────────\n  output$summary_table <- renderTable({\n    data <- switch(input$dist,\n                   norm = rnorm(input$n),\n                   unif = runif(input$n),\n                   exp = rexp(input$n))\n    data.frame(\n      Statistic = c(\"Mean\", \"SD\", \"Min\", \"Max\"),\n      Value = c(mean(data), sd(data), min(data), max(data))\n    )\n  }, digits=3)  # round to 3 decimals\n  # ── renderPrint: summary(), str(), print() → <pre> ──────\n  output$text_output <- renderPrint({\n    data <- switch(input$dist,\n                   norm = rnorm(input$n),\n                   unif = runif(input$n),\n                   exp = rexp(input$n))\n    summary(data)\n  })\n  # ── renderUI: dynamic HTML content ──────────────────────\n  output$dynamic_ui <- renderUI({\n    # Build UI based on reactive values\n    tagList(\n      h3(paste(\"You selected:\", input$dist)),\n      p(\"Summary statistics:\"),\n      img(src=\"data.png\", width=\"200px\"),  # static image\n      if (input$n > 500) {\n        p(\"Large dataset - computation may be slow\")\n      }\n    )\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Shiny Render Functions — renderPlot, renderTable, renderUI, renderPrint — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── renderText: simple text output ──────────────────────\n  output$text_output <- renderText({\n    paste(\"Distribution:\", input$dist, \"\\nSample size:\", input$n)\n  })\n  # ── Special: renderDataTable with DT ───────────────────\n  # Note: requires DT package\n  output$dt_table <- DT::renderDataTable({\n    data.frame(x = 1:input$n, y = rnorm(input$n))\n  })\n}\nshinyApp(ui, server)"
                  }
        ],
        tips: [
                  "renderPlot() works with ggplot2 or base R plots — auto-detects",
                  "renderTable() for simple tables, DT::renderDataTable() for interactive tables with sorting/filtering",
                  "renderUI() powerful for dynamic UI — but recalculates full HTML on each change (use updateInput* when possible)",
                  "renderPrint() uses <pre>, preserving whitespace — good for summary(), str(), print()"
        ],
        mistake: "Using renderUI() to update a single input — creates UI flicker and recalculates everything. Use updateSelectInput(), updateSliderInput(), etc. instead.",
        shorthand: {
          verbose: "# Rebuilds entire UI (flickers)\noutput$ui <- renderUI({\n  selectInput(\"col\", \"Select:\",\n    choices = names(reactive_df()))\n})",
          concise: "# Updates widget (smooth)\nobserveEvent(input$file, {\n  updateSelectInput(session, \"col\",\n    choices = names(loaded_df()))\n})",
        },
      },
      {
        id: "shiny-validation",
        fn: "Shiny Validation & Error Handling — validate(), need(), shinyFeedback",
        desc: "Show helpful error messages: validate(), need(), conditionalPanel, shinyFeedback.",
        category: "Shiny UX",
        subtitle: "validate(), need(), req(), shinyFeedback, error messages",
        signature: "validate(need(...), need(...))  |  req(value)  |  use_shiny_feedback()",
        descLong: "Validation shows users friendly error messages instead of red crash screens. validate() + need() combination: needs() checks condition, shows message if false. req() silently stops if NULL/FALSE. shinyFeedback highlights problematic inputs in red. Better UX = happier users.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Shiny Validation & Error Handling — validate(), need(), shinyFeedback — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\nlibrary(shinyFeedback)\nui <- fluidPage(\n  useShinyFeedback(),  # enable feedback features\n  titlePanel(\"Validation Demo\"),\n  sidebarPanel(\n    fileInput(\"file\", \"Upload CSV\"),\n    numericInput(\"threshold\", \"Threshold:\", 0.5, 0, 1, 0.1),\n    textInput(\"email\", \"Email:\")\n  ),\n  mainPanel(\n    plotOutput(\"plot\")\n  )\n)\nserver <- function(input, output, session) {\n  # ── Load data with error handling ───────────────────────\n  data <- reactive({\n    req(input$file)  # stop if file not selected\n    tryCatch(\n      read.csv(input$file$datapath),\n      error = function(e) {\n        showNotification(\n          paste(\"Error reading file:\", e$message),\n          type = \"error\",\n          duration = 5\n        )\n        NULL\n      }\n    )\n  })"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Shiny Validation & Error Handling — validate(), need(), shinyFeedback — common patterns you'll see in production.\n# APPROACH  - Combine Shiny Validation & Error Handling — validate(), need(), shinyFeedback with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Validate: show friendly error messages ──────────────\n  output$plot <- renderPlot({\n    validate(\n      need(input$file, \"Please upload a CSV file\"),\n      need(nrow(data()) > 0, \"File is empty\"),\n      need(nrow(data()) > input$threshold * 100,\n           paste(\"Not enough rows. Need at least\",\n                 input$threshold * 100))\n    )\n    plot(data())\n  })\n  # ── Real-time validation with shinyFeedback ────────────\n  observeEvent(input$email, {\n    if (input$email == \"\") {\n      hideFeedback(\"email\")\n    } else if (!grepl(\"@\", input$email)) {\n      showFeedback(\n        inputId = \"email\",\n        color = \"danger\",\n        text = \"Invalid email address\"\n      )\n    } else {\n      showFeedback(\n        inputId = \"email\",\n        color = \"success\",\n        text = \"Valid!\"\n      )\n    }\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Shiny Validation & Error Handling — validate(), need(), shinyFeedback — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Conditional UI based on validation ──────────────────\n  output$file_status <- reactive({\n    if (is.null(input$file)) {\n      \"<span style='color: red;'>❌ No file</span>\"\n    } else if (is.null(data())) {\n      \"<span style='color: red;'>❌ Error reading</span>\"\n    } else {\n      \"<span style='color: green;'>✓ Loaded\", nrow(data()),\n      \"rows</span>\"\n    }\n  })\n}\nshinyApp(ui, server)"
                  }
        ],
        tips: [
                  "validate() + need() shows user-friendly messages instead of red error boxes",
                  "req() silently stops if value is NULL/FALSE — use when errors would be annoying",
                  "shinyFeedback colors inputs red (error) or green (success) — visual feedback",
                  "observeEvent() for real-time validation — validate user input as they type"
        ],
        mistake: "Letting R errors bubble up to user (red screen). Always wrap in tryCatch() or validate(). Give friendly message, not technical error.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Bad: technical error\noutput$plot <- renderPlot(plot(data()))\n// More explicit but longer",
          concise: "# Good: friendly message\noutput$plot <- renderPlot({\n  validate(need(data(), \"Upload file first\"))\n  plot(data())\n})",
        },
      },
      {
        id: "shiny-file-upload",
        fn: "Shiny File Operations — fileInput(), downloadButton(), downloadHandler()",
        desc: "Handle file uploads and downloads: fileInput(), downloadButton(), downloadHandler().",
        category: "Shiny I/O",
        subtitle: "fileInput(), downloadButton(), downloadHandler(), file management",
        signature: "fileInput(\"file\", \"Upload\")  |  downloadHandler(filename, content)",
        descLong: "fileInput() lets users upload files. downloadButton() + downloadHandler() lets them download results. Handle file paths carefully: uploaded files are in temporary directory. Always validate file type and size. downloadHandler defines filename and content (function or string).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Shiny File Operations — fileInput(), downloadButton(), downloadHandler() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\nui <- fluidPage(\n  titlePanel(\"File Upload/Download\"),\n  sidebarPanel(\n    # ── File upload ─────────────────────────────────────────\n    fileInput(\n      \"upload\",\n      \"Choose CSV file\",\n      accept = c(\"text/csv\", \".csv\"),\n      multiple = FALSE\n    ),\n    # ── File size limit ────────────────────────────────────\n    # Add to shinyApp() call: options(shiny.maxRequestSize=50*1024^2)  # 50MB\n    # ── Download button ────────────────────────────────────\n    downloadButton(\"download_results\", \"Download Results\"),\n    downloadButton(\"download_plot\", \"Download Plot (PNG)\")\n  ),\n  mainPanel(\n    tableOutput(\"preview\"),\n    plotOutput(\"summary_plot\")\n  )\n)\nserver <- function(input, output, session) {\n  # ── Read uploaded file ──────────────────────────────────\n  data <- reactive({\n    req(input$upload)  # stop if file not selected\n    # Validate file size\n    if (input$upload$size > 50*1024^2) {  # 50MB limit\n      showNotification(\"File too large (max 50MB)\", type=\"error\")\n      return(NULL)\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Shiny File Operations — fileInput(), downloadButton(), downloadHandler() — common patterns you'll see in production.\n# APPROACH  - Combine Shiny File Operations — fileInput(), downloadButton(), downloadHandler() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Validate file type\n    if (!endsWith(input$upload$name, \".csv\")) {\n      showNotification(\"Please upload a .csv file\", type=\"error\")\n      return(NULL)\n    }\n    # Read file\n    tryCatch(\n      read.csv(input$upload$datapath),\n      error = function(e) {\n        showNotification(paste(\"Error:\", e$message), type=\"error\")\n        NULL\n      }\n    )\n  })\n  # ── Show preview ────────────────────────────────────────\n  output$preview <- renderTable({\n    head(data(), 10)\n  })\n  # ── Download results (CSV) ──────────────────────────────\n  output$download_results <- downloadHandler(\n    filename = function() {\n      # Filename can be dynamic\n      paste0(\"results_\", Sys.Date(), \".csv\")\n    },\n    content = function(file) {\n      # Function called when user clicks download\n      # 'file' is temporary path where to write\n      # Do processing, write to 'file'\n      results <- data() |>\n        filter(value > 0) |>\n        mutate(processed = TRUE)\n      write.csv(results, file, row.names=FALSE)\n    }\n  )"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Shiny File Operations — fileInput(), downloadButton(), downloadHandler() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Download plot (PNG) ─────────────────────────────────\n  output$download_plot <- downloadHandler(\n    filename = \"plot.png\",\n    content = function(file) {\n      png(file, width=800, height=600)\n      plot(data()$value)\n      dev.off()\n    }\n  )\n  # ── Alternative: download PDF ───────────────────────────\n  output$download_pdf <- downloadHandler(\n    filename = \"report.pdf\",\n    content = function(file) {\n      # Use rmarkdown::render or similar\n      pdf(file)\n      # ... plot commands\n      dev.off()\n    }\n  )\n}\nshinyApp(ui, server,\n         # Set maximum file size globally\n         options = list(shiny.maxRequestSize=50*1024^2))\""
                  }
        ],
        tips: [
                  "Use accept= in fileInput() to restrict file types shown to user — improves UX",
                  "Always validate file size and type — malicious users might upload anything",
                  "downloadHandler content is a function — gets called when user clicks button",
                  "Filename can be dynamic: paste0(\"results_\", Sys.Date(), \".csv\") — user sees current date"
        ],
        mistake: "Forgetting shiny.maxRequestSize option. Default is 5MB. If user uploads 10MB file, they get confusing 'request failed' error. Set option based on your need.",
        shorthand: {
          verbose: "# Full validation\nreq(input$file)\nif (input$file$size > limit) showNotification(...)\nif (!endsWith(input$file$name, \".csv\")) showNotification(...)\ndf <- read.csv(input$file$datapath)",
          concise: "# Quick (less safe)\ndf <- read.csv(input$upload$datapath)",
        },
      },
      {
        id: "shiny-datatables",
        fn: "Shiny DataTables — DT::datatable(), renderDT(), Interactive Tables",
        desc: "Interactive tables with sorting, filtering, pagination: DT::datatable(), DT::renderDT().",
        category: "Shiny UI",
        subtitle: "DT::datatable(), DT::renderDT(), selection, editing, server-side processing",
        signature: "DT::datatable(data)  |  DT::renderDT({datatable()})  |  DT::dataTableOutput()",
        descLong: "DT package wraps DataTables.js for interactive HTML tables. Features: sorting, filtering, pagination, row selection, cell editing (experimental). renderDT() integrates with Shiny reactivity. Server-side processing for large datasets (1M+ rows) — don't load all into browser.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Shiny DataTables — DT::datatable(), renderDT(), Interactive Tables — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\nlibrary(DT)\nui <- fluidPage(\n  titlePanel(\"Interactive DataTable\"),\n  fluidRow(\n    column(3, sliderInput(\"rows\", \"Show rows:\", 10, 100, 50)),\n    column(9, DT::dataTableOutput(\"table\"))\n  )\n)\nserver <- function(input, output, session) {\n  # ── Basic datatable ─────────────────────────────────────\n  output$table <- DT::renderDT({\n    DT::datatable(\n      head(iris, input$rows),\n      options = list(\n        pageLength = 10,         # rows per page\n        dom = \"lfrtip\",          # show length, filter, table, info, pagination\n        buttons = c(\"copy\", \"csv\", \"excel\"),  # export buttons\n        columnDefs = list(\n          list(className = \"dt-center\", targets = 0:1)\n        )\n      ),\n      extensions = \"Buttons\",\n      rownames = FALSE\n    )\n  })"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Shiny DataTables — DT::datatable(), renderDT(), Interactive Tables — common patterns you'll see in production.\n# APPROACH  - Combine Shiny DataTables — DT::datatable(), renderDT(), Interactive Tables with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── With row selection ──────────────────────────────────\n  output$table_select <- DT::renderDT({\n    DT::datatable(\n      iris,\n      selection = \"single\",  # or \"multiple\"\n      options = list(pageLength = 20)\n    )\n  })\n  # ── React to selection ──────────────────────────────────\n  observeEvent(input$table_select_rows_selected, {\n    selected_row <- input$table_select_rows_selected\n    if (length(selected_row) > 0) {\n      selected_data <- iris[selected_row, ]\n      showNotification(\n        paste(\"Selected:\", selected_data$Species),\n        type = \"message\"\n      )\n    }\n  })\n  # ── Server-side processing (for large data) ─────────────\n  # Data stays on server, only filtered/sorted rows sent to browser\n  output$large_table <- DT::renderDT(\n    {DT::datatable(\n      iris,  # usually: very_large_dataset\n      options = list(\n        serverSide = TRUE,  # enable server-side processing\n        processing = TRUE,  # show \"processing\" message\n        pageLength = 50\n      )\n    )},\n    server = TRUE  # important: set this to TRUE\n  )"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Shiny DataTables — DT::datatable(), renderDT(), Interactive Tables — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Edit cells (experimental) ───────────────────────────\n  output$editable_table <- DT::renderDT({\n    DT::datatable(\n      iris,\n      editable = list(target = \"all\", disable = list(columns = c(0)))  # col 0 read-only\n    )\n  })\n  # ── Capture edits ───────────────────────────────────────\n  proxy <- dataTableProxy('editable_table')\n  observeEvent(input$editable_table_cell_edit, {\n    info <- input$editable_table_cell_edit\n    i <- info$row\n    j <- info$col + 1  # js uses 0-indexing\n    v <- info$value\n    # Update data (usually write to DB)\n  })\n}\nshinyApp(ui, server)"
                  }
        ],
        tips: [
                  "dom=\"lfrtip\" shows all controls: length, filter, table, info, pagination. Use \"ti\" to hide filter.",
                  "selection=\"multiple\" + input$table_rows_selected captures selected rows",
                  "Server-side processing essential for >10k rows — browser can't handle all at once",
                  "extensions = \"Buttons\" + buttons = c(\"csv\", \"excel\") lets users export"
        ],
        mistake: "Loading entire dataset (1M rows) into datatable(). Browser chokes. Use serverSide=TRUE for large data.",
        shorthand: {
          verbose: "# Full options\nDT::datatable(df,\n  options = list(pageLength=20, dom=\"lfrtip\", ...),\n  extensions = \"Buttons\",\n  selection = \"multiple\")",
          concise: "# Quick default\nDT::datatable(df)",
        },
      },
      {
        id: "shiny-leaflet",
        fn: "Shiny & Leaflet Maps — leafletOutput(), renderLeaflet(), leafletProxy()",
        desc: "Embed interactive maps: leaflet integration, marker clusters, basemap options.",
        category: "Shiny Visualization",
        subtitle: "leafletOutput(), renderLeaflet(), leafletProxy(), markers, popups",
        signature: "leafletOutput()  |  renderLeaflet()  |  leafletProxy()  |  addMarkers()",
        descLong: "leaflet package provides interactive maps in Shiny. renderLeaflet() builds map, leafletProxy() updates it (faster than rebuilding). Use for location data, interactive exploration. Supports markers, circles, polygons, heatmaps, clustering.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Shiny & Leaflet Maps — leafletOutput(), renderLeaflet(), leafletProxy() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\nlibrary(leaflet)\nui <- fluidPage(\n  titlePanel(\"Leaflet Map in Shiny\"),\n  sidebarPanel(\n    sliderInput(\"zoom\", \"Zoom:\", 2, 18, 4),\n    selectInput(\"basemap\", \"Basemap:\",\n               c(\"OpenStreetMap\", \"CartoDB\", \"Esri.WorldImagery\"))\n  ),\n  mainPanel(\n    leafletOutput(\"map\", height=\"600px\")\n  )\n)\nserver <- function(input, output, session) {\n  # ── Initial map ─────────────────────────────────────────\n  output$map <- renderLeaflet({\n    leaflet() |>\n      addTiles() |>                        # default OpenStreetMap\n      setView(lng=-74.0, lat=40.7, zoom=13)  # NYC\n  })\n  # ── Proxy: update map without rebuilding ────────────────\n  # Much faster than full re-render\n  observeEvent(input$zoom, {\n    leafletProxy(\"map\") |>\n      setView(lng=-74.0, lat=40.7, zoom=input$zoom)\n  })"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Shiny & Leaflet Maps — leafletOutput(), renderLeaflet(), leafletProxy() — common patterns you'll see in production.\n# APPROACH  - Combine Shiny & Leaflet Maps — leafletOutput(), renderLeaflet(), leafletProxy() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Change basemap ─────────────────────────────────────\n  observeEvent(input$basemap, {\n    leafletProxy(\"map\") |>\n      clearTiles() |>\n      addProviderTiles(input$basemap)\n  })\n  # ── Add markers with popup ──────────────────────────────\n  locations <- data.frame(\n    name = c(\"Times Square\", \"Central Park\", \"Empire State\"),\n    lat = c(40.758, 40.785, 40.748),\n    lon = c(-73.986, -73.968, -73.986)\n  )\n  leafletProxy(\"map\") |>\n    addMarkers(\n      data = locations,\n      popup = ~name,\n      label = ~name\n    )\n  # ── Clustered markers ───────────────────────────────────\n  leafletProxy(\"map\") |>\n    addMarkers(\n      data = locations,\n      clusterOptions = markerClusterOptions()\n    )\n  # ── Circles (e.g., earthquake magnitude) ────────────────\n  earthquakes <- data.frame(\n    lat = c(40.75, 40.80, 40.70),\n    lon = c(-73.98, -73.95, -74.00),\n    magnitude = c(5, 6, 4)\n  )"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Shiny & Leaflet Maps — leafletOutput(), renderLeaflet(), leafletProxy() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nleafletProxy(\"map\") |>\n    addCircles(\n      data = earthquakes,\n      radius = ~magnitude * 1000,\n      color = ~ifelse(magnitude > 5, \"red\", \"orange\"),\n      popup = ~magnitude\n    )\n  # ── Interactive: click map to add markers ───────────────\n  observeEvent(input$map_click, {\n    click <- input$map_click\n    leafletProxy(\"map\") |>\n      addMarkers(\n        lng = click$lng,\n        lat = click$lat,\n        popup = paste(\"Clicked:\", round(click$lng, 3), round(click$lat, 3))\n      )\n  })\n}\nshinyApp(ui, server)"
                  }
        ],
        tips: [
                  "leafletProxy() for updates is much faster than rebuilding map — use it always",
                  "markerClusterOptions() groups markers at small zoom, expands when zoomed",
                  "addProviderTiles() for different maps: CartoDB, Esri, Stamen, etc.",
                  "input$map_click, input$map_bounds — detect user interaction"
        ],
        mistake: "Rebuilding entire map on every update. Use leafletProxy() to modify existing map — no flicker, fast.",
        shorthand: {
          verbose: "# Rebuild (slow)\noutput$map <- renderLeaflet({\n  if (input$zoom_changed) {\n    leaflet() |> ... setView(zoom=input$zoom)\n  }\n})",
          concise: "# Update with proxy (fast)\nobserveEvent(input$zoom, {\n  leafletProxy(\"map\") |> setView(zoom=input$zoom)\n})",
        },
      },
      {
        id: "shinyjs-basics",
        fn: "shinyjs — Control HTML & JavaScript from R",
        desc: "Manipulate page with R: hide(), show(), toggle(), disable(), addClass(), runjs().",
        category: "Shiny Advanced",
        subtitle: "hide(), show(), toggle(), disable(), addClass(), removeClass(), runjs()",
        signature: "useShinyjs()  |  hide(\"id\")  |  show(\"id\")  |  toggleClass(\"id\", \"class\")",
        descLong: "shinyjs makes it easy to manipulate HTML/CSS/JS from R. hide()/show() toggle visibility, disable()/enable() toggle inputs, addClass()/removeClass() manage CSS, runjs() runs arbitrary JavaScript. Great for dynamic UI without writing JS.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of shinyjs — Control HTML & JavaScript from R — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\nlibrary(shinyjs)\nui <- fluidPage(\n  useShinyjs(),  # Initialize shinyjs\n  titlePanel(\"shinyjs Demo\"),\n  sidebarPanel(\n    checkboxInput(\"show_options\", \"Show advanced options\", FALSE),\n    actionButton(\"toggle_plot\", \"Toggle plot visibility\"),\n    actionButton(\"disable_input\", \"Disable name input\"),\n    textInput(\"name\", \"Your name\"),\n    selectInput(\"color\", \"Color:\", c(\"Red\", \"Blue\", \"Green\"))\n  ),\n  mainPanel(\n    h3(id=\"title\", \"Hello World\"),\n    div(id=\"options\", style=\"display:none;\",  # hidden initially\n      numericInput(\"param1\", \"Parameter 1:\", 0),\n      numericInput(\"param2\", \"Parameter 2:\", 0)\n    ),\n    plotOutput(id=\"plot\")\n  )\n)\nserver <- function(input, output, session) {\n  # ── Show/hide based on checkbox ─────────────────────────\n  observeEvent(input$show_options, {\n    if (input$show_options) {\n      show(\"options\")          # show div\n    } else {\n      hide(\"options\")          # hide div\n    }\n  })"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of shinyjs — Control HTML & JavaScript from R — common patterns you'll see in production.\n# APPROACH  - Combine shinyjs — Control HTML & JavaScript from R with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Toggle visibility ───────────────────────────────────\n  observeEvent(input$toggle_plot, {\n    toggle(\"plot\")             # show if hidden, hide if shown\n  })\n  # ── Disable input ───────────────────────────────────────\n  observeEvent(input$disable_input, {\n    toggle(\"name\", anim=TRUE)  # toggle with animation\n    disable(\"name\")            # disable form input\n  })\n  # ── Add/remove CSS classes ──────────────────────────────\n  observeEvent(input$color, {\n    removeClass(\"title\", \"red blue green\")  # remove all\n    addClass(\"title\", tolower(input$color)) # add selected\n    # Now add CSS:\n    # .red { color: red; }\n    # .blue { color: blue; }\n    # .green { color: green; }\n  })\n  # ── Run arbitrary JavaScript ───────────────────────────\n  observeEvent(input$name, {\n    if (nchar(input$name) > 0) {\n      runjs(\"console.log('User typed: ' + $('#name').val());\")\n    }\n  })\n  # ── Update element content ──────────────────────────────\n  output$status <- renderText({\n    runjs(\"$('#title').text('Hello ' + $('#name').val())\")  # update title\n    paste(\"Name:\", input$name)\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of shinyjs — Control HTML & JavaScript from R — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── shinyjs helper functions ────────────────────────────\n  # hide(id)           — visibility: hidden\n  # show(id)           — visibility: visible\n  # toggle(id)         — toggle visibility\n  # disable(id)        — disable input/button\n  # enable(id)         — enable input/button\n  # addClass(id, class) — add CSS class\n  # removeClass(id, class) — remove CSS class\n  # toggleClass(id, class) — toggle class\n  # html(id, content)  — set HTML content\n  # text(id, content)  — set text content\n  # runjs(code)        — execute JavaScript string\n}\nshinyApp(ui, server)"
                  }
        ],
        tips: [
                  "hide()/show() with anim=TRUE for smooth animation",
                  "disable() on button/input prevents user interaction",
                  "runjs() for custom JS — sometimes needed for complex interactions",
                  "addClass()/removeClass() for styling — avoid runjs when shinyjs function exists"
        ],
        mistake: "Using runjs() for simple show/hide. Just use show()/hide() — cleaner and no JS needed.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Verbose: use runjs\nrunjs(\"$('#id').hide(); $('#id2').show();\")\n// More explicit but longer",
          concise: "# Concise: use shinyjs functions\nhide(\"id\"); show(\"id2\")",
        },
      },
      {
        id: "bslib-theming",
        fn: "bslib Theming — Modern Bootstrap 5 Shiny UI",
        desc: "Modern Shiny theme with bslib: bs_theme(), page_fluid(), card(), custom colors.",
        category: "Shiny UI",
        subtitle: "bs_theme(), page_navbar(), layout_sidebar(), card(), Bootstrap 5",
        signature: "bs_theme()  |  page_fluid()  |  card()  |  layout_sidebar()  |  page_navbar()",
        descLong: "bslib provides modern Bootstrap 5 components for Shiny. bs_theme() customizes colors/fonts. page_* functions (page_fluid, page_navbar) replace fluidPage. card() creates modern containers. layout_sidebar() organizes sidebar + main. Far more polished look than base Shiny with minimal effort.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of bslib Theming — Modern Bootstrap 5 Shiny UI — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(shiny)\nlibrary(bslib)\nui <- page_navbar(\n  title = \"Modern Shiny App\",\n  theme = bs_theme(\n    version = 5,              # Bootstrap 5\n    bootswatch = \"flatly\",    # preset theme (flatly, darkly, superhero, etc.)\n    primary = \"#3b82f6\",      # customize colors\n    secondary = \"#6b7280\",\n    success = \"#10b981\",\n    danger = \"#ef4444\"\n  ),\n  # ── Tab 1: Data Explorer ───────────────────────────────\n  nav_panel(\n    \"Data\",\n    layout_sidebar(\n      sidebar = sidebar(\n        fileInput(\"file\", \"Upload CSV\"),\n        conditionalPanel(\n          condition = \"output.file_loaded\",\n          selectInput(\"x_col\", \"X Variable\", choices = NULL),\n          selectInput(\"y_col\", \"Y Variable\", choices = NULL),\n          sliderInput(\"alpha\", \"Point Size:\", 0.1, 2, 1, 0.1)\n        )\n      ),\n      card(\n        card_header(\"Scatter Plot\"),\n        plotOutput(\"scatter\", height=\"400px\")\n      ),\n      card(\n        card_header(\"Data Summary\"),\n        verbatimTextOutput(\"summary\")\n      )\n    )\n  ),"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of bslib Theming — Modern Bootstrap 5 Shiny UI — common patterns you'll see in production.\n# APPROACH  - Combine bslib Theming — Modern Bootstrap 5 Shiny UI with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Tab 2: Analysis ────────────────────────────────────\n  nav_panel(\n    \"Analysis\",\n    layout_columns(\n      col_widths = c(3, 9),\n      card(\n        card_header(\"Settings\"),\n        numericInput(\"conf\", \"Confidence:\", 0.95, 0.5, 0.99, 0.01),\n        checkboxGroupInput(\"tests\", \"Tests:\",\n          c(\"t-test\", \"ANOVA\", \"Correlation\"))\n      ),\n      card(\n        card_header(\"Results\"),\n        verbatimTextOutput(\"results\")\n      )\n    )\n  ),\n  # ── Tab 3: About ──────────────────────────────────────\n  nav_panel(\n    \"About\",\n    card(\n      card_header(\"Information\"),\n      markdown(\"\n## About This App\\n\nBuilt with **Shiny** and **bslib**.\\n\n- Modern Bootstrap 5 design\\n- Responsive layout\\n- Easy theming\n      \")\n    )\n  )\n)\nserver <- function(input, output, session) {\n  # ── Load data ───────────────────────────────────────────\n  data <- reactive({\n    req(input$file)\n    read.csv(input$file$datapath)\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of bslib Theming — Modern Bootstrap 5 Shiny UI — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Signal file loaded ──────────────────────────────────\n  output$file_loaded <- reactive(!is.null(input$file))\n  outputOptions(output, \"file_loaded\", suspendWhenHidden=FALSE)\n  # ── Update dropdowns ────────────────────────────────────\n  observeEvent(data(), {\n    cols <- names(data())\n    updateSelectInput(session, \"x_col\", choices=cols)\n    updateSelectInput(session, \"y_col\", choices=cols, selected=cols[2])\n  })\n  # ── Plot ────────────────────────────────────────────────\n  output$scatter <- renderPlot({\n    req(data(), input$x_col, input$y_col)\n    plot(data()[[input$x_col]], data()[[input$y_col]],\n         main=\"Scatter Plot\", xlab=input$x_col, ylab=input$y_col,\n         cex=input$alpha)\n  })\n  output$summary <- renderPrint(summary(data()))\n}\nshinyApp(ui, server)"
                  }
        ],
        tips: [
                  "bootswatch themes: flatly, darkly, superhero, vapor, simplex (15+ options)",
                  "page_navbar() for multi-page apps, page_fluid() for single page",
                  "layout_sidebar() + sidebar() replaces sidebarLayout — cleaner code",
                  "card() with card_header() for modern containers — looks professional"
        ],
        mistake: "Using old fluidPage() + sidebarLayout() with bslib theme. Mix page_* + card() for consistency.",
        shorthand: {
          verbose: "# Old style (basic)\nfluidPage(\n  sidebarLayout(\n    sidebarPanel(...),\n    mainPanel(...)\n  )\n)",
          concise: "# New bslib style (modern)\npage_fluid(\n  theme = bs_theme(),\n  layout_sidebar(\n    sidebar = sidebar(...),\n    card(...)\n  )\n)",
        },
      },
    ],
  },
]

export default { meta, sections }
