export const meta = {
  "title": "ggplot2 — Visualization",
  "domain": "r",
  "sheet": "ggplot2",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: ggplot2 ─────────────────────────────────────────
  {
    id: "r-ggplot2-all",
    title: "ggplot2",
    entries: [
      {
        id: "ggplot2-basics",
        fn: "ggplot2 Grammar of Graphics",
        desc: "Build plots layer by layer using ggplot2's grammar.",
        category: "ggplot2",
        subtitle: "aes() maps variables to visual properties; geom_ draws them",
        signature: "ggplot(data, aes(x,y)) + geom_point() + theme_*()",
        descLong: "ggplot2 implements the Grammar of Graphics: data is mapped to aesthetics (position, color, shape, size) and rendered by geometric objects. Layers stack with +. Scales control axis/color mapping. Facets create small multiples. Themes control non-data appearance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ggplot2 Grammar of Graphics — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(ggplot2)\n# ── Basic scatter plot ─────────────────────────────────\nggplot(data=mtcars, aes(x=wt, y=mpg)) +\n  geom_point()\n# ── Scatter with color and size ────────────────────────\nggplot(mtcars, aes(x=wt, y=mpg,\n                    color=factor(cyl),\n                    size=hp)) +\n  geom_point(alpha=0.7) +\n  labs(title=\"MPG vs Weight\",\n       x=\"Weight (1000 lbs)\",\n       y=\"Miles per Gallon\",\n       color=\"Cylinders\",\n       size=\"Horsepower\") +\n  theme_minimal()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ggplot2 Grammar of Graphics — common patterns you'll see in production.\n# APPROACH  - Combine ggplot2 Grammar of Graphics with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Add regression line ────────────────────────────────\nggplot(mtcars, aes(x=wt, y=mpg)) +\n  geom_point() +\n  geom_smooth(method=\"lm\", se=TRUE, color=\"blue\") +\n  geom_smooth(method=\"loess\", se=FALSE, color=\"red\",\n              linetype=\"dashed\")\n# ── Layer structure ────────────────────────────────────\np <- ggplot(iris, aes(x=Sepal.Length, y=Sepal.Width,\n                       color=Species))\np + geom_point()               # scatter\np + geom_line()                # line (usually wrong for this)\np + geom_point() + geom_smooth(method=\"lm\")  # both"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ggplot2 Grammar of Graphics — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── aes() vs fixed aesthetics ─────────────────────────\n# aes() — MAPS a variable to aesthetic:\ngeom_point(aes(color=species))   # color varies by species\n# Fixed — sets a constant value:\ngeom_point(color=\"blue\")         # all points blue"
                  }
        ],
        tips: [
                  "Put aesthetics common to ALL layers in `ggplot()`. Put layer-specific aesthetics in the geom's `aes()`",
                  "`alpha` controls transparency (0=invisible, 1=opaque) — essential for overlapping points",
                  "`geom_smooth(method='lm')` shows the regression line with confidence interval — easy visual model check",
                  "Save plots with `ggsave('plot.png', width=8, height=6, dpi=300)` — always specify dpi for publications"
        ],
        mistake: "Putting a fixed aesthetic inside aes(): `aes(color='blue')` maps the string 'blue' as a variable — all points get one color but it's whatever ggplot2 picks for the value 'blue'. Put fixed aesthetics OUTSIDE aes().",
        shorthand: {
          verbose: "library(ggplot2)\np <- ggplot(df, aes(x=x, y=y))\np <- p + geom_point()\np <- p + geom_smooth(method='lm')\np <- p + theme_minimal()\nprint(p)",
          concise: "ggplot(df, aes(x, y)) + geom_point() + geom_smooth(method='lm') + theme_minimal()",
        },
      },
      {
        id: "ggplot2-geoms",
        fn: "Essential ggplot2 Geoms",
        desc: "Bar charts, histograms, boxplots, lines, and facets.",
        category: "ggplot2",
        subtitle: "The right geom for each data type and comparison",
        signature: "geom_bar() | geom_histogram() | geom_boxplot() | facet_wrap()",
        descLong: "Choose the geom based on what you're communicating: distributions (histogram, density, boxplot), comparisons (bar, violin), relationships (scatter, line), compositions (stacked bar). Facets (facet_wrap, facet_grid) create small multiples for comparing across a categorical variable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Essential ggplot2 Geoms — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(ggplot2)\n# ── Bar chart ──────────────────────────────────────────\n# geom_bar: count rows\nggplot(diamonds, aes(x=cut)) + geom_bar(fill=\"steelblue\")\n# geom_col: use pre-computed values\nggplot(summary_df, aes(x=dept, y=avg_salary)) +\n  geom_col(fill=\"steelblue\") +\n  coord_flip()  # horizontal bars\n# ── Histogram ──────────────────────────────────────────\nggplot(iris, aes(x=Sepal.Length)) +\n  geom_histogram(bins=20, fill=\"steelblue\", color=\"white\") +\n  geom_density(aes(y=after_stat(count)), color=\"red\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Essential ggplot2 Geoms — common patterns you'll see in production.\n# APPROACH  - Combine Essential ggplot2 Geoms with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Boxplot & Violin ───────────────────────────────────\nggplot(iris, aes(x=Species, y=Sepal.Length, fill=Species)) +\n  geom_violin(alpha=0.5) +\n  geom_boxplot(width=0.2, outlier.shape=NA) +\n  geom_jitter(width=0.1, alpha=0.3)  # show raw points too\n# ── Line plot (time series) ────────────────────────────\nggplot(economics, aes(x=date, y=unemploy)) +\n  geom_line(color=\"navy\") +\n  geom_area(alpha=0.2, fill=\"navy\")\n# ── Facets ─────────────────────────────────────────────\nggplot(iris, aes(x=Sepal.Length, y=Sepal.Width)) +\n  geom_point() +\n  facet_wrap(~Species)              # one panel per species"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Essential ggplot2 Geoms — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nggplot(mpg, aes(x=displ, y=hwy)) +\n  geom_point() +\n  facet_grid(cyl ~ drv)             # grid: rows=cyl, cols=drv\n# ── Themes ────────────────────────────────────────────\n+ theme_minimal()       # clean, white background\n+ theme_bw()            # black and white grid\n+ theme_classic()       # minimal axes, no grid\n+ theme_dark()          # dark background\n# Fine-tune:\n+ theme(axis.text.x = element_text(angle=45, hjust=1),\n        legend.position = \"bottom\")"
                  }
        ],
        tips: [
                  "**geom_bar vs geom_col**: geom_bar counts rows (stat='count'); geom_col uses pre-computed y values (stat='identity')",
                  "Combine `geom_violin + geom_boxplot + geom_jitter` — shows distribution shape, quartiles, AND raw data",
                  "`facet_wrap(~var, scales='free')` allows different axis ranges per panel — useful when variables have different scales",
                  "`coord_flip()` makes horizontal bar charts — easier to read when labels are long"
        ],
        mistake: "Using a bar chart for a continuous variable. Bar charts show counts of categories. For a continuous variable's distribution, use histogram (range groupings) or density plot.",
        shorthand: {
          verbose: "library(ggplot2)\np <- ggplot(df, aes(x=x, y=y))\np <- p + geom_point()\np <- p + geom_smooth(method='lm')\np <- p + theme_minimal()\nprint(p)",
          concise: "ggplot(df, aes(x, y)) + geom_point() + geom_smooth(method='lm') + theme_minimal()",
        },
      },
      {
        id: "ggplot2-scales-colors",
        fn: "Scales, Colors & Themes",
        desc: "Control axis scales, color palettes, and polish plot appearance.",
        category: "ggplot2",
        subtitle: "scale_*(), labs(), theme() — making publication-quality plots",
        signature: "scale_color_manual() | scale_x_log10() | labs() | theme()",
        descLong: "Scales control the mapping from data values to aesthetic values. scale_*_continuous controls number axes. scale_*_discrete controls categorical axes. scale_color_* and scale_fill_* control color palettes. The viridis and RColorBrewer palettes are colorblind-safe.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Scales, Colors & Themes — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(ggplot2)\nlibrary(scales)  # for label formatting helpers\n# ── Axis scales ────────────────────────────────────────\np + scale_x_continuous(\n  limits = c(0, 100),\n  breaks = seq(0, 100, by=20),\n  labels = label_comma()   # 1,000 format\n)\np + scale_y_log10(labels=label_dollar())  # log scale\np + scale_x_date(date_breaks=\"1 year\",\n                  date_labels=\"%Y\")  # date axis\n# ── Color scales ───────────────────────────────────────\n# Continuous (diverging):\np + scale_color_gradient2(low=\"blue\", mid=\"white\",\n                           high=\"red\", midpoint=0)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Scales, Colors & Themes — common patterns you'll see in production.\n# APPROACH  - Combine Scales, Colors & Themes with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Discrete — manual:\np + scale_color_manual(\n  values = c(\"IT\"=\"#4472C4\", \"HR\"=\"#ED7D31\",\n             \"Finance\"=\"#A9D18E\")\n)\n# Viridis (colorblind-safe, perceptually uniform):\np + scale_color_viridis_c()  # continuous\np + scale_color_viridis_d()  # discrete\n# RColorBrewer:\nlibrary(RColorBrewer)\np + scale_fill_brewer(palette=\"Set1\")   # qualitative\np + scale_fill_brewer(palette=\"Blues\")  # sequential\np + scale_fill_brewer(palette=\"RdBu\")   # diverging\n# ── Labels and annotations ─────────────────────────────\np + labs(\n  title    = \"Main Title\",\n  subtitle = \"Descriptive subtitle\",\n  caption  = \"Source: dataset name, 2024\",\n  x = \"X-axis label\",\n  y = \"Y-axis label\",\n  color = \"Legend Title\"\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Scales, Colors & Themes — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Add text labels:\np + geom_text(aes(label=name), vjust=-0.5, size=3)\np + geom_label(aes(label=value), fill=\"white\")\n# Annotate specific points:\np + annotate(\"text\", x=5, y=50,\n             label=\"Peak\", color=\"red\", size=5)"
                  }
        ],
        tips: [
                  "**viridis** is the best default: perceptually uniform, colorblind-safe, prints well in grayscale",
                  "`scales::label_comma()`, `label_dollar()`, `label_percent()` format axis tick labels cleanly",
                  "`theme_minimal() + theme(...)` is the most common pattern for publication-quality plots",
                  "Set a custom theme once: `theme_set(theme_minimal(base_size=12))` applies to all subsequent plots"
        ],
        mistake: "Using default red/green color scheme for group comparisons. About 8% of men are red-green colorblind. Always use colorblind-safe palettes: viridis, ColorBrewer, or okabe-ito.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-patchwork-extensions",
        fn: "patchwork / gganimate / ggplotly",
        desc: "Combine plots, animate them, and make them interactive.",
        category: "ggplot2 Advanced",
        subtitle: "patchwork for layout, gganimate for animation, plotly for interactivity",
        signature: "p1 + p2 | p1 / p2  |  transition_time()  |  ggplotly(p)",
        descLong: "patchwork composes multiple ggplot2 plots into a single figure using intuitive operators. gganimate adds animation to ggplot2 — transitions over time, states, or filters. ggplotly converts any ggplot2 to an interactive plotly figure with hover tooltips, zoom, and pan.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of patchwork / gganimate / ggplotly — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(patchwork)\nlibrary(gganimate)\nlibrary(plotly)\nlibrary(ggplot2)\n# ══ patchwork — combine plots ══════════════════════════\np1 <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color=Species)) +\n  geom_point() + theme_minimal() + labs(title=\"Scatter\")\np2 <- ggplot(iris, aes(Sepal.Length, fill=Species)) +\n  geom_histogram(bins=20) + theme_minimal() + labs(title=\"Hist\")\np3 <- ggplot(iris, aes(Species, Sepal.Length, fill=Species)) +\n  geom_violin() + theme_minimal()\np1 + p2           # side by side\np1 / p2           # stacked\n(p1 + p2) / p3    # 2 on top, 1 below\np1 | (p2 / p3)    # 1 left, 2 stacked right\n# Control layout:\np1 + p2 + p3 + plot_layout(ncol=2, widths=c(2,1))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of patchwork / gganimate / ggplotly — common patterns you'll see in production.\n# APPROACH  - Combine patchwork / gganimate / ggplotly with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Add title/annotation to whole figure:\n(p1 + p2) +\n  plot_annotation(\n    title = \"Iris Dataset Analysis\",\n    tag_levels = \"A\"   # adds A, B, C labels\n  )\n# ══ gganimate ═════════════════════════════════════════\np <- ggplot(gapminder::gapminder,\n            aes(gdpPercap, lifeExp, size=pop, color=continent)) +\n  geom_point(alpha=0.7) +\n  scale_x_log10() +\n  labs(title=\"Year: {frame_time}\") +  # {frame_time} auto-updates\n  transition_time(year) +              # animate over year\n  ease_aes(\"linear\")\nanimate(p, nframes=100, fps=10, width=700, height=500)\nanim_save(\"gapminder.gif\")             # save as GIF"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of patchwork / gganimate / ggplotly — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Other transitions:\ntransition_states(variable, transition_length=2, state_length=1)\ntransition_reveal(x_variable)          # reveal along x axis\nshadow_wake(wake_length=0.2)           # trailing ghost\n# ══ ggplotly — interactive ═════════════════════════════\np <- ggplot(mtcars, aes(wt, mpg, color=factor(cyl),\n                         text=rownames(mtcars))) +\n  geom_point(size=3) +\n  theme_minimal()\nggplotly(p, tooltip=c(\"text\",\"x\",\"y\"))  # hover shows name+coords\n# Full plotly for more control:\nplot_ly(mtcars, x=~wt, y=~mpg, color=~factor(cyl),\n        type=\"scatter\", mode=\"markers\")"
                  }
        ],
        tips: [
                  "patchwork is pipe-free: `+` places side-by-side, `/` stacks vertically, `|` is explicit side-by-side",
                  "`plot_layout(guides='collect')` in patchwork moves duplicate legends to a single shared legend",
                  "gganimate `{frame_time}` in title/subtitle updates with the current animated value — great for year/date animation",
                  "`ggplotly()` is the fastest path to interactivity — but complex themes may not translate perfectly"
        ],
        mistake: "Using `grid.arrange()` (gridExtra) for combining plots instead of patchwork. patchwork is simpler (`+` operator), handles alignment better, and integrates with ggplot2's theme system directly.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-ggplot2-custom",
        fn: "Custom ggplot2: themes, geoms & tidy evaluation",
        desc: "Build reusable themes, write functions that produce ggplots, and master tidy evaluation.",
        category: "ggplot2 Advanced",
        subtitle: "theme(), custom geoms, {{var}} tidy eval in ggplot functions",
        signature: "theme_custom <- theme_minimal() + theme(...)  |  aes({{var}})",
        descLong: "Custom themes enforce consistent visual identity across plots. Writing functions that generate ggplot2 plots requires tidy evaluation ({{}} / .data[[]]). Custom geom and stat extensions allow new layer types. These techniques are essential for building reusable reporting pipelines.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Custom ggplot2: themes, geoms & tidy evaluation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(ggplot2)\nlibrary(rlang)\n# ── Custom theme ──────────────────────────────────────\ntheme_codesheets <- function(base_size=12) {\n  theme_minimal(base_size=base_size) %+replace%\n  theme(\n    # Text\n    plot.title    = element_text(face=\"bold\", size=base_size+2),\n    plot.subtitle = element_text(color=\"grey40\"),\n    axis.title    = element_text(color=\"grey30\"),\n    # Grid\n    panel.grid.minor = element_blank(),\n    panel.grid.major = element_line(color=\"grey92\"),\n    # Background\n    plot.background  = element_rect(fill=\"white\", color=NA),\n    panel.background = element_rect(fill=\"white\", color=NA),\n    # Legend\n    legend.position  = \"bottom\",\n    legend.key       = element_blank()\n  )\n}\n# Apply globally:\ntheme_set(theme_codesheets())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Custom ggplot2: themes, geoms & tidy evaluation — common patterns you'll see in production.\n# APPROACH  - Combine Custom ggplot2: themes, geoms & tidy evaluation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Functions that return ggplots ──────────────────────\n# Problem: aes() uses non-standard evaluation — can't use variables directly\n# Wrong:\nmy_plot <- function(data, x_var, y_var) {\n  ggplot(data, aes(x_var, y_var)) + geom_point()  # x_var is a string, not a column!\n}\n# Correct with {{ }} (embrace, for column names):\nmy_plot <- function(data, x_var, y_var, color_var=NULL) {\n  ggplot(data, aes(x={{x_var}}, y={{y_var}},\n                   color={{color_var}})) +\n  geom_point() +\n  theme_codesheets()\n}\nmy_plot(iris, Sepal.Length, Sepal.Width, Species)\n# Correct with .data[[ ]] (for string column names):\nmy_plot2 <- function(data, x_name, y_name) {\n  ggplot(data, aes(x=.data[[x_name]], y=.data[[y_name]])) +\n  geom_point()\n}\nmy_plot2(iris, \"Sepal.Length\", \"Sepal.Width\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Custom ggplot2: themes, geoms & tidy evaluation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── annotation_custom + grobs ────────────────────────\n# Add logo/image to corner:\nlibrary(png)\nlogo <- readPNG(\"logo.png\")\nggplot(...) +\n  annotation_custom(\n    grid::rasterGrob(logo, interpolate=TRUE),\n    xmin=-Inf, xmax=Inf, ymin=-Inf, ymax=Inf\n  )\n# ── coord_* and scale tricks ──────────────────────────\n# Clip axis without losing data:\nscale_y_continuous(limits=c(0, 100), oob=scales::squish)\n# Log scale with nice labels:\nscale_x_log10(labels=scales::label_log())\n# Percent axis:\nscale_y_continuous(labels=scales::percent_format(accuracy=1))"
                  }
        ],
        tips: [
                  "`%+replace%` in custom themes completely replaces matching theme elements rather than merging — use it when inheriting from an existing theme",
                  "`{{ }}` (embrace) is for passing column names as unquoted symbols to ggplot functions; `.data[[var]]` is for string column names",
                  "`theme_set()` sets the default theme for all subsequent plots in the session — put it at the top of report scripts",
                  "`last_plot()` returns the last ggplot created — useful for iterating on plots in the console"
        ],
        mistake: "Writing `aes(x=x_var)` in a function where `x_var` is a function argument. ggplot2 looks for a column literally named `x_var`. Use `aes(x={{x_var}})` to inject the variable's value.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "ggplot2-facets-advanced",
        fn: "facet_wrap / facet_grid — Small Multiples",
        desc: "Create subplots split by categorical variables.",
        category: "ggplot2",
        subtitle: "facet_wrap for 1D faceting, facet_grid for 2D",
        signature: "facet_wrap(~var, scales=\"fixed\")  |  facet_grid(row_var ~ col_var)",
        descLong: "facet_wrap creates a ribbon of plots for one variable. facet_grid creates a matrix for two variables. scales=\"free\" lets each facet have its own axis — useful when variables have different ranges.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of facet_wrap / facet_grid — Small Multiples — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(ggplot2)\n# ── facet_wrap: ribbon of plots ────────────────────────────\nggplot(iris, aes(Sepal.Length, Sepal.Width)) +\n  geom_point() +\n  facet_wrap(~Species)\n# One row, 3 columns\nggplot(iris, aes(Sepal.Length, Sepal.Width)) +\n  geom_point() +\n  facet_wrap(~Species, nrow=3)  # 3 rows, 1 column\n# or ncol=2\n# ── facet_grid: matrix layout ──────────────────────────────\nggplot(diamonds, aes(carat, price)) +\n  geom_point(alpha=0.3) +\n  facet_grid(cut ~ color)\n# Rows = cut levels, Cols = color levels"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of facet_wrap / facet_grid — Small Multiples — common patterns you'll see in production.\n# APPROACH  - Combine facet_wrap / facet_grid — Small Multiples with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nggplot(diamonds, aes(carat, price)) +\n  geom_point(alpha=0.3) +\n  facet_grid(cut ~ .)   # rows only\n# or . ~ color for cols only\n# ── scales: free axes ──────────────────────────────────────\nggplot(iris, aes(Sepal.Length, Sepal.Width)) +\n  geom_point() +\n  facet_wrap(~Species, scales='free')\n# Each facet has its own x and y scales\nggplot(iris, aes(Sepal.Length, Sepal.Width)) +\n  geom_point() +\n  facet_wrap(~Species, scales='free_x')  # only x free\n# or scales='free_y'\n# ── Labeling facets ────────────────────────────────────────\nggplot(iris, aes(Sepal.Length, Sepal.Width)) +\n  geom_point() +\n  facet_wrap(~Species, labeller=label_both)\n# Shows 'Species: setosa' instead of just 'setosa'"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of facet_wrap / facet_grid — Small Multiples — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Custom labels:\nlabels <- c(\n  setosa = 'Setosa Iris',\n  versicolor = 'Versicolor Iris',\n  virginica = 'Virginica Iris'\n)\nggplot(iris, aes(Sepal.Length, Sepal.Width)) +\n  geom_point() +\n  facet_wrap(~Species, labeller=labeller(Species=labels))"
                  }
        ],
        tips: [
                  "facet_wrap for 1 variable, facet_grid for 2+ variables",
                  "scales=\"free\" is crucial when variables are on very different scales",
                  "nrow/ncol in facet_wrap to control layout",
                  "Use facet_grid(. ~ var) or facet_grid(var ~ .) to facet in one dimension only"
        ],
        mistake: "Using facet_grid with many unique values. facet_grid creates one panel per combination — with 50 x 50 = 2500 panels! Use facet_wrap for single variables with many levels.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "ggplot2-stat-summary",
        fn: "stat_summary / stat_smooth / stat_bin",
        desc: "Compute and display statistical transformations.",
        category: "ggplot2",
        subtitle: "Add summary statistics, smooths, and densities automatically",
        signature: "stat_summary(fun=mean, geom=\"point\")  |  stat_smooth(method=\"lm\")",
        descLong: "stats compute summaries and transformations. stat_summary aggregates (mean, CI, range). stat_smooth fits regression lines. stat_bin creates histograms. Most geoms have implicit stats (geom_point uses stat_identity), but you can override.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of stat_summary / stat_smooth / stat_bin — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(ggplot2)\n# ── stat_summary: aggregate + plot ────────────────────────\nggplot(mtcars, aes(factor(cyl), mpg)) +\n  stat_summary(fun=mean, geom='point', size=3, color='red') +\n  geom_jitter(width=0.2, alpha=0.3)\n# Points are group means; jitter shows raw data\n# Error bars (mean ± SD):\nggplot(mtcars, aes(factor(cyl), mpg)) +\n  stat_summary(fun.data=mean_sd, geom='errorbar', width=0.2)\n# Ribbon (95% CI):\nggplot(mtcars, aes(wt, mpg)) +\n  stat_summary(fun.data=mean_cl_boot, geom='ribbon',\n               aes(fill='95% CI'), alpha=0.2) +\n  stat_summary(fun=mean, geom='line', color='blue', size=1)\n# ── stat_smooth: fit trend line ────────────────────────────\nggplot(mtcars, aes(wt, mpg)) +\n  geom_point() +\n  stat_smooth(method='lm', se=TRUE)     # linear + 95% CI band\n# geom_smooth(...) is a shortcut"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of stat_summary / stat_smooth / stat_bin — common patterns you'll see in production.\n# APPROACH  - Combine stat_summary / stat_smooth / stat_bin with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nggplot(mtcars, aes(wt, mpg)) +\n  geom_point() +\n  stat_smooth(method='loess', span=0.5) # nonparametric smoothing\n# ── stat_bin / geom_histogram ────────────────────────────\n# Both do the same thing; stat_bin is explicit:\nggplot(mtcars, aes(mpg)) +\n  stat_bin(bins=20, geom='bar', fill='steelblue')\n# equivalent to geom_histogram(bins=20)\n# ── stat_count / geom_bar ──────────────────────────────────\n# These use stat_count by default:\nggplot(mtcars, aes(factor(cyl))) +\n  geom_bar(fill='steelblue')\n# Counts occurrences automatically\n# Explicit:\nggplot(mtcars, aes(factor(cyl))) +\n  stat_count(geom='bar', fill='steelblue')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of stat_summary / stat_smooth / stat_bin — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── stat_identity: don't transform ─────────────────────────\n# Use when data is already aggregated:\ndf_agg <- data.frame(\n  group = c('A', 'B', 'C'),\n  mean_val = c(10, 15, 12)\n)\nggplot(df_agg, aes(group, mean_val)) +\n  geom_col(stat='identity')  # or use stat_identity()"
                  }
        ],
        tips: [
                  "stat_summary() is for group-level summaries: means, CIs, ranges",
                  "geom_smooth() is shorthand for stat_smooth() with sensible defaults",
                  "Most geoms have implicit stats — stat_identity is most common",
                  "fun.data functions return y, ymin, ymax for error bars; fun returns scalar"
        ],
        mistake: "Using stat_summary on already-aggregated data. If your data is pre-computed means, use stat=\"identity\" in geom_point/geom_col, not stat_summary.",
        shorthand: {
          verbose: "SELECT category,\n       COUNT(*) AS count,\n       AVG(amount) AS average\nFROM sales\nGROUP BY category\nHAVING COUNT(*) > 5",
          concise: "SELECT category, COUNT(*), AVG(amount) FROM sales GROUP BY category HAVING COUNT(*) > 5",
        },
      },
      {
        id: "ggplot2-coords-transforms",
        fn: "coord_cartesian / coord_flip / coord_polar / scales",
        desc: "Change coordinate systems, limits, and transformations.",
        category: "ggplot2",
        subtitle: "Zoom without clipping, flip axes, use log scales",
        signature: "coord_cartesian(xlim, ylim)  |  scale_y_log10()  |  scale_x_sqrt()",
        descLong: "coord_cartesian zooms without clipping (points outside are removed from stat computation). Scales transform axes. coord_flip swaps x/y. coord_polar creates circular plots.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of coord_cartesian / coord_flip / coord_polar / scales — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(ggplot2)\n# ── coord_cartesian: zoom without clipping ────────────────\nggplot(mtcars, aes(wt, mpg)) +\n  geom_point() +\n  geom_smooth(method='lm') +\n  coord_cartesian(xlim=c(2, 4), ylim=c(15, 30))\n# Smooth is computed on FULL data, then zoomed\n# Different from scale_x_continuous(limits=...)\n# ── scale_*_log10: log transformation ──────────────────────\nggplot(diamonds, aes(carat, price)) +\n  geom_point(alpha=0.3) +\n  scale_x_log10() +\n  scale_y_log10()\n# Log scales on both axes\n# ── scale_*_sqrt: square root transformation ──────────────\nggplot(diamonds, aes(carat, price)) +\n  geom_point(alpha=0.3) +\n  scale_x_sqrt()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of coord_cartesian / coord_flip / coord_polar / scales — common patterns you'll see in production.\n# APPROACH  - Combine coord_cartesian / coord_flip / coord_polar / scales with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── scale_x_continuous with trans ─────────────────────────\nggplot(mtcars, aes(wt, mpg)) +\n  geom_point() +\n  scale_x_continuous(trans='log10', breaks=c(1,2,3,4,5))\n# ── scale_y_reverse: flip axis ────────────────────────────\nggplot(mtcars, aes(wt, mpg)) +\n  geom_point() +\n  scale_y_reverse()  # high values at bottom\n# ── coord_flip: horizontal bar charts ──────────────────────\nggplot(mtcars, aes(factor(cyl), mpg)) +\n  geom_boxplot() +\n  coord_flip()\n# Swaps x and y (labels now readable)\n# ── coord_fixed: aspect ratio ──────────────────────────────\nggplot(mtcars, aes(wt, mpg)) +\n  geom_point() +\n  coord_fixed(ratio=1)  # 1 unit x = 1 unit y visually"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of coord_cartesian / coord_flip / coord_polar / scales — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── coord_polar: circular plots ────────────────────────────\nggplot(mtcars, aes(factor(cyl), mpg)) +\n  geom_boxplot() +\n  coord_polar()\n# Creates a circular plot\n# Useful for pie-like charts (use theta='y'):\nggplot(iris, aes(x='', fill=Species)) +\n  geom_bar(width=1) +\n  coord_polar(theta='y')  # pie chart"
                  }
        ],
        tips: [
                  "coord_cartesian(xlim, ylim) zooms after statistics are computed",
                  "scale_*_continuous(limits) clips before statistics — different behavior",
                  "Use scale_y_log10() for exponential data; scale_x_sqrt() for variance stabilization",
                  "coord_flip() + theme(axis.text.x=element_text(angle=45)) for readable long labels"
        ],
        mistake: "Using scale_x_continuous(limits=...) to zoom, then getting wrong trend lines. Use coord_cartesian() instead — it computes stats on full data then zooms.",
        shorthand: {
          verbose: "ggplot(iris, aes(x=Sepal.Length, y=Sepal.Width)) +\n  geom_point() +\n  coord_cartesian(xlim=c(5, 7))",
          concise: "coord_cartesian(xlim=c(5, 7), ylim=c(2, 4))",
        },
      },
    ],
  },
]

export default { meta, sections }
