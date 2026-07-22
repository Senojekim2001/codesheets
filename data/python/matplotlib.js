export const meta = {
  "title": "Matplotlib",
  "domain": "python",
  "sheet": "matplotlib",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: Chart Types ─────────────────────────────────────────
  {
    id: "chart-types",
    title: "Chart Types",
    entries: [
      {
        id: "line",
        fn: "ax.plot()",
        desc: "Line and scatter plots.",
        category: "Charts",
        subtitle: "Connect data points with lines",
        signature: "ax.plot(x, y, fmt, **kwargs)",
        descLong: "plot() creates line charts by default. The format string controls line style, marker, and color in shorthand. Use keyword arguments for fine-grained control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.plot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             figure/axes pattern that scales to any layout.\n#\nimport numpy as np\nimport matplotlib.pyplot as plt\nx = np.linspace(0, 10, 100)\nfig, ax = plt.subplots()\nax.plot(x, np.sin(x))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.plot() — common patterns you'll see in production.\n# APPROACH  - Combine ax.plot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             readability, multiple lines with label= and a\n#             legend, axis titles, grid, tight_layout.\n#             like; this is the call shape you write daily.\n#             chained subplots — senior tier.\n#\nimport numpy as np\nimport matplotlib.pyplot as plt\nmonths   = np.arange(1, 13)\nq1_sales = np.array([120, 135, 148, 155, 168, 175, 182, 190, 198, 205, 215, 230])\nq2_sales = q1_sales + 15\nfig, ax = plt.subplots(figsize=(10, 6))\nax.plot(months, q1_sales, label=\"Q1 Sales\", linewidth=2)\nax.plot(months, q2_sales, label=\"Q2 Sales\", linewidth=2, linestyle=\"--\")\nax.set_xlabel(\"Month\")\nax.set_ylabel(\"Sales ($1000s)\")\nax.set_title(\"Sales Trend\")\nax.legend()\nax.grid(True, alpha=0.3)\nplt.tight_layout()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.plot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             always (never plt.* on shared figures), explicit\n#             style-cycle handling for multi-line series, log\n#             scales when range spans orders of magnitude, and\n#             tight_layout vs constrained_layout.\n#             without state surprises; constrained_layout\n#             handles label collisions automatically;\n#             explicit log scales document data properties.\n#             tight_layout; plt.style.use() applies globally\n#             — wrap in a context manager for one-off figures.\n#\nimport numpy as np\nimport matplotlib.pyplot as plt\nx = np.linspace(1, 1000, 1000)\n# 1. Use a style scope locally, not globally\nwith plt.style.context(\"seaborn-v0_8-whitegrid\"):\n    fig, ax = plt.subplots(figsize=(10, 6),\n                            layout=\"constrained\")     # auto-handles labels\n    for label, fn in [(\"linear\", lambda x: x),\n                       (\"sqrt\",   np.sqrt),\n                       (\"log\",    np.log)]:\n        ax.plot(x, fn(x), label=label, linewidth=2)\n    ax.set_yscale(\"log\")                              # range spans orders of magnitude\n    ax.set_xlabel(\"x\")\n    ax.set_ylabel(\"f(x)  (log scale)\")\n    ax.legend(frameon=False)\n# 2. Anti-pattern: mixing plt.* with the OO API across subplots\n# plt.title(\"X\") is global — it sets title on the CURRENT axes only.\n# Right: ax.set_title(\"X\")\n# 3. Save deterministically\n# fig.savefig(\"out.png\", dpi=150, bbox_inches=\"tight\")\n#\n# Decision rule:\n#   single line, quick check                  -> ax.plot(x, y) + plt.subplots()\n#   2-5 series, same scale                    -> multiple ax.plot calls + ax.legend()\n#   data spans orders of magnitude            -> ax.set_yscale(\"log\")\n#   irregular x or many series                -> ax.plot with explicit color cycle\n#   layered with bands / fills                -> ax.plot + ax.fill_between for CI\n#   datetime x-axis                           -> ax.plot(dates, y) + ConciseDateFormatter\n#   need >1 different y-scale                 -> two subplots sharex=True (NOT twinx)\n#   one-off style change                      -> with plt.style.context(...) wrapper\n#\n# Anti-pattern: mixing plt.* state-machine calls with the OO API on multi-axes figures.\n#   Code like fig, ax = plt.subplots(); ax.plot(...); plt.title(\"X\") sets the title on\n#   whatever axes was created LAST, not on ax. The fix is total commitment to the OO API:\n#   ax.set_title, ax.set_xlabel, fig.savefig — never plt.title / plt.xlabel / plt.savefig."
                  }
        ],
        tips: [
                  "Format string order: color + marker + linestyle → \"r^--\" (red triangle dashed)",
                  "label= + ax.legend() adds a legend — always label lines for multi-line charts",
                  "alpha=0.7 is useful for overlapping data",
                  "For pure scatter: ax.scatter() has better control over individual point properties"
        ],
        mistake: "Forgetting ax.legend() after setting label= on plot calls. Labels are invisible without calling ax.legend().",
        shorthand: {
          verbose: "import numpy as np\nimport matplotlib.pyplot as plt\nmonths = np.arange(1, 13)\nq1_sales = np.array([120, 135, 148, 155, 168, 175, 182, 190, 198, 205, 215, 230])",
          concise: "plt.tight_layout()",
        },
      },
      {
        id: "bar",
        fn: "ax.bar()",
        desc: "Vertical bar chart for categorical comparisons.",
        category: "Charts",
        subtitle: "Compare categorical values — grouped and stacked variants",
        signature: "ax.bar(x, height, width=0.8, color=, label=)",
        descLong: "ax.bar() creates vertical bars. Use grouped bars by positioning with x offsets. Use bottom= for stacked bars. ax.bar_label() (matplotlib 3.4+) auto-labels bars.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.bar() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             value labeling.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.bar([\"A\", \"B\", \"C\", \"D\"], [23, 45, 12, 67])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.bar() — common patterns you'll see in production.\n# APPROACH  - Combine ax.bar() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             x-offset, stacked bars via bottom=, and\n#             ax.bar_label for auto value annotation.\n#             reports use; bar_label replaces tedious\n#             ax.text loops.\n#             improves readability) or color-by-value\n#             encoding — senior tier.\n#\nimport numpy as np\nimport matplotlib.pyplot as plt\ncategories = [\"A\", \"B\", \"C\", \"D\"]\nv23 = [23, 45, 12, 67]\nv24 = [30, 40, 20, 60]\nfig, ax = plt.subplots()\n# Grouped bars\nx = np.arange(len(categories))\nwidth = 0.35\nax.bar(x - width/2, v23, width, label=\"2023\")\nax.bar(x + width/2, v24, width, label=\"2024\")\nax.set_xticks(x); ax.set_xticklabels(categories)\nax.legend()\n# Stacked bars (separate figure)\nfig2, ax2 = plt.subplots()\nb1 = ax2.bar(categories, [10, 20, 5,  30], label=\"Q1\")\nb2 = ax2.bar(categories, [13, 25, 7,  37],\n              bottom=[10, 20, 5, 30], label=\"Q2\")\nax2.bar_label(b1, padding=2)\nax2.bar_label(b2, padding=2)\nax2.legend()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.bar() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             color-encode by sign or threshold, auto-label\n#             with thousand separators, and switch to barh\n#             when category names are long. Use ax.bar_label\n#             with fmt= for currency/percent.\n#             by-threshold communicates intent (red bars =\n#             below target); fmt= keeps labels publication-\n#             ready.\n#             changes the natural order (sometimes that\n#             order matters); bar_label fmt= is a string,\n#             easy to mistype.\n#\nimport matplotlib.pyplot as plt\ncategories = [\"Widgets\", \"Gadgets\", \"Doohickeys\", \"Gizmos\"]\nsales      = [12000, 45000, 8000, 67000]\n# Sort descending for ranking\norder = sorted(range(len(sales)), key=lambda i: -sales[i])\ncats_s = [categories[i] for i in order]\nvals_s = [sales[i]      for i in order]\n# Color by threshold\nthreshold = 30000\ncolors = [\"#2ca02c\" if v >= threshold else \"#d62728\" for v in vals_s]\nfig, ax = plt.subplots(figsize=(8, 5), layout=\"constrained\")\nbars = ax.bar(cats_s, vals_s, color=colors, edgecolor=\"white\")\nax.bar_label(bars, fmt=\"${:,.0f}\", padding=3)         # currency labels\nax.axhline(threshold, color=\"black\", linestyle=\"--\",\n            linewidth=0.8, label=f\"target ${threshold:,}\")\nax.set_ylabel(\"Revenue (USD)\")\nax.set_title(\"Product Sales (sorted)\")\nax.legend()\n# When category names are long -> switch to barh, NOT a tilt\n# fig, ax = plt.subplots()\n# ax.barh(cats_s[::-1], vals_s[::-1])\n#\n# Decision rule:\n#   <8 short categories, ranking matters       -> ax.bar (sorted desc)\n#   long category names                        -> ax.barh (NOT bar with rotation)\n#   2 series side-by-side                      -> grouped bars via x +/- width/2\n#   parts-of-a-whole over time                 -> stacked bars with bottom=\n#   show value on each bar                     -> ax.bar_label(bars, fmt=\"...\")\n#   show uncertainty                           -> ax.bar(..., yerr=std)\n#   >15 categories                             -> ax.barh (vertical scrolling fits)\n#   continuous x (numeric bins)                -> ax.hist, NOT ax.bar\n#\n# Anti-pattern: rotating x-tick labels 45-90 degrees instead of switching to barh.\n#   When labels overlap on a vertical bar chart, the instinct is tick_params(rotation=45).\n#   Rotated text is harder to read AND eats vertical space. The right fix is ax.barh —\n#   labels become horizontal and there's no width budget to fight over."
                  }
        ],
        tips: [
                  "ax.bar_label(container) auto-labels every bar — much cleaner than manual ax.text() loops",
                  "Rotate labels when they overlap: `ax.tick_params(axis=\"x\", rotation=45)`",
                  "For stacked bars, pass the cumulative sum as `bottom=` for each subsequent series",
                  "Use string x values directly — matplotlib handles the tick positioning automatically"
        ],
        mistake: "Using ax.bar() for long category names that overlap. Switch to ax.barh() for horizontal bars — labels are far more readable.",
        shorthand: {
          verbose: "import numpy as np\nimport matplotlib.pyplot as plt\ncategories = [\"A\", \"B\", \"C\", \"D\"]\nvalues    = [23, 45, 12, 67]",
          concise: "ax.text(i, v + 0.5, str(v), ha=\"center\", fontsize=9)",
        },
      },
      {
        id: "barh",
        fn: "ax.barh()",
        desc: "Horizontal bar chart — best for long category names.",
        category: "Charts",
        subtitle: "Same as ax.bar() but rotated — use when labels are long",
        signature: "ax.barh(y, width, height=0.8, color=, label=)",
        descLong: "ax.barh() is the horizontal equivalent of ax.bar(). It is the better choice when category names are long, when ranking items, or when you have many categories. The x-axis becomes the value axis and y-axis becomes the category axis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.barh() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             the y-axis, values on the x-axis.\n#             or numerous.\n#             color encoding.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.barh([\"Very Long Name A\", \"Long Name B\", \"C\", \"D\"], [23, 45, 12, 67])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.barh() — common patterns you'll see in production.\n# APPROACH  - Combine ax.barh() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             ranking, color-encode by threshold, label the\n#             bars with bar_label.\n#             label each, color the outliers.\n#             ordering) or grouped horizontal bars — senior.\n#\nimport matplotlib.pyplot as plt\ncategories = [\"Widgets\", \"Gadgets\", \"Doohickeys\", \"Gizmos\"]\nvalues     = [23, 45, 12, 67]\n# Sort ascending so largest is at the top after invert\norder = sorted(range(len(values)), key=lambda i: values[i])\ncats  = [categories[i] for i in order]\nvals  = [values[i]     for i in order]\ncolors = [\"#d62728\" if v > 40 else \"#1f77b4\" for v in vals]\nfig, ax = plt.subplots()\nbars = ax.barh(cats, vals, color=colors)\nax.bar_label(bars, padding=3, fmt=\"%.0f\")\nax.set_xlabel(\"Value\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.barh() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             down reading), use figsize taller for many\n#             rows, group with offsets when comparing two\n#             time periods, and pick barh whenever names\n#             would otherwise overlap or rotate.\n#             readers scan; tall figsize prevents label\n#             collisions; grouped horizontal bars are the\n#             clearest \"year over year by long category\"\n#             chart.\n#             time readers; very tall figures don't fit\n#             slide layouts.\n#\nimport numpy as np\nimport matplotlib.pyplot as plt\ncategories = [\"Very Long Item \" + c for c in \"ABCDEFGHIJ\"]\nv23 = np.random.randint(10, 100, len(categories))\nv24 = v23 + np.random.randint(-10, 30, len(categories))\n# Sort by 2024 desc\norder = np.argsort(v24)[::-1]\ncats  = np.array(categories)[order]\nv23s, v24s = v23[order], v24[order]\nfig, ax = plt.subplots(figsize=(8, max(4, 0.4 * len(cats))),\n                        layout=\"constrained\")\ny = np.arange(len(cats))\nheight = 0.4\nax.barh(y - height/2, v23s, height, label=\"2023\")\nax.barh(y + height/2, v24s, height, label=\"2024\")\nax.set_yticks(y); ax.set_yticklabels(cats)\nax.invert_yaxis()                                      # largest at TOP\nax.set_xlabel(\"Value\")\nax.legend()\n#\n# Decision rule:\n#   ranking with long names                    -> ax.barh + sort + invert_yaxis\n#   short names, <=6 cats                      -> ax.bar (vertical reads faster)\n#   compare two periods per category           -> grouped barh with y +/- height/2\n#   highlight a winner / target                -> color-encode + axvline threshold\n#   show value at end of bar                   -> ax.bar_label(bars, padding=3)\n#   N rows uncertain                           -> figsize=(8, max(4, 0.4 * N))\n#   negative + positive values                 -> barh with axvline(x=0) baseline\n#\n# Anti-pattern: forgetting ax.invert_yaxis() on a sorted ranking. Without inversion,\n#   the largest bar is at the BOTTOM (matplotlib's default y origin). Western readers\n#   scan top-to-bottom, so they read the smallest first. Always pair sort + invert_yaxis\n#   for ranking charts; otherwise pick ax.bar instead."
                  }
        ],
        tips: [
                  "Sort categories by value before plotting — creates a natural ranking that is easier to read",
                  "ax.bar_label() works the same as with ax.bar() — labels appear at the end of each bar",
                  "Invert the y-axis so the highest value appears at the top: `ax.invert_yaxis()`",
                  "For many categories (10+), increase figure height: `fig, ax = plt.subplots(figsize=(8, 12))`"
        ],
        mistake: "Plotting unsorted horizontal bars when ranking is the point. Always sort by value — unsorted rankings make comparisons much harder to read.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "hist",
        fn: "ax.hist()",
        desc: "Distribution histograms.",
        category: "Charts",
        subtitle: "Visualize the distribution of a dataset",
        signature: "ax.hist(data, bins=10, **kwargs)",
        descLong: "hist() plots the frequency distribution of data. bins controls the number of bars. Use density=True for probability density. Multiple histograms can be overlaid with alpha for transparency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.hist() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             distribution shape immediately.\n#             diagnostic.\n#             histograms, or bin-edge control.\n#\nimport numpy as np, matplotlib.pyplot as plt\ndata = np.random.randn(1000)\nfig, ax = plt.subplots()\nax.hist(data, bins=30, edgecolor=\"white\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.hist() — common patterns you'll see in production.\n# APPROACH  - Combine ax.hist() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             for probability mass, overlapping histograms\n#             with alpha for group comparison, custom bin\n#             edges, cumulative form.\n#             alpha + label + legend = clean two-group\n#             comparison.\n#             (Sturges, Freedman-Diaconis) or KDE overlay —\n#             senior tier.\n#\nimport numpy as np, matplotlib.pyplot as plt\na = np.random.randn(1000)\nb = np.random.randn(1000) * 1.5 + 1\nfig, ax = plt.subplots()\nax.hist(a, bins=30, density=True, alpha=0.6, label=\"A\")\nax.hist(b, bins=30, density=True, alpha=0.6, label=\"B\")\nax.legend()\nax.set_xlabel(\"value\"); ax.set_ylabel(\"density\")\n# Custom bin edges\n# ax.hist(a, bins=np.linspace(-4, 4, 30))\n# Cumulative form\n# ax.hist(a, bins=50, cumulative=True, density=True)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.hist() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (\"auto\" / \"fd\" / \"sturges\"), overlay a KDE for\n#             smooth distribution shape, share x-limits\n#             across subplots for fair comparison, and\n#             switch to violin/box for compact multi-group\n#             distributions.\n#             overlay makes shape obvious; shared x-limits\n#             prevent visual misreads.\n#             violin plots are denser to read; \"auto\" can\n#             pick too few bins on heavily skewed data.\n#\nimport numpy as np, matplotlib.pyplot as plt\nfrom scipy.stats import gaussian_kde\na = np.random.randn(1000)\nb = np.random.randn(1000) * 1.5 + 1\nfig, axes = plt.subplots(1, 2, figsize=(10, 4),\n                         sharex=True, sharey=True,\n                         layout=\"constrained\")\nfor ax, data, name in zip(axes, [a, b], [\"A\", \"B\"]):\n    ax.hist(data, bins=\"auto\", density=True, alpha=0.6,\n             edgecolor=\"white\", label=f\"{name} hist\")\n    xs = np.linspace(data.min(), data.max(), 200)\n    ax.plot(xs, gaussian_kde(data)(xs), linewidth=2,\n             label=f\"{name} KDE\")\n    ax.legend(); ax.set_title(name)\n# Decision rule:\n#   single distribution shape           -> hist (bins=\"auto\")\n#   compare 2 groups                    -> overlapping hist + KDE\n#   compare many groups                 -> violinplot or boxplot\n#   long-tailed / log-scale data        -> set xscale=\"log\" or log-bin\n#   want probability density            -> density=True (NOT raw counts)\n#   need 2-D distribution               -> hist2d or hexbin\n#   distribution + summary in one       -> seaborn histplot/displot\n#\n# Anti-pattern: comparing two histograms drawn at different bin counts or ranges.\n#   Calling ax.hist(a, bins=20) then ax.hist(b, bins=50) makes the bars different widths,\n#   so apparent \"tallness\" reflects bin width as much as data. Always pin shared bin edges\n#   (bins=np.linspace(lo, hi, k)) when comparing groups, and density=True if sample sizes\n#   differ."
                  }
        ],
        tips: [
                  "bins=\"auto\" lets matplotlib choose — often a good starting point",
                  "alpha=0.6 on overlapping histograms makes both visible",
                  "density=True gives probability density (area sums to 1), not raw counts",
                  "For comparing distributions, consider violin plots or KDE plots (seaborn)"
        ],
        mistake: "Using too few or too many bins. Too few: hides the shape. Too many: looks noisy. Start with bins=30 and adjust visually.",
        shorthand: {
          verbose: "import numpy as np\nimport matplotlib.pyplot as plt\ndata = np.random.randn(1000)\nax.hist(data, bins=30, color=\"steelblue\", edgecolor=\"white\")",
          concise: "counts, edges, patches = ax.hist(data, bins=20)",
        },
      },
      {
        id: "scatter",
        fn: "ax.scatter()",
        desc: "Scatter plots with size and color encoding.",
        category: "Charts",
        subtitle: "Plot points with optional size and color dimensions",
        signature: "ax.scatter(x, y, s=size, c=color, **kwargs)",
        descLong: "scatter() plots individual data points and lets you encode two additional dimensions through size (s=) and color (c=). A colorbar adds a legend for the color dimension.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.scatter() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             in two lines.\n#             encoding, or a regression line overlay.\n#\nimport numpy as np, matplotlib.pyplot as plt\nx = np.random.randn(50); y = x * 2 + np.random.randn(50)\nfig, ax = plt.subplots()\nax.scatter(x, y)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.scatter() — common patterns you'll see in production.\n# APPROACH  - Combine ax.scatter() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             overlap, c=array for color encoding, s=array\n#             for size encoding, regression overlay via\n#             np.polyfit.\n#             alpha is the single most-needed argument.\n#             or density) or perceptually-uniform colormaps\n#             — senior tier.\n#\nimport numpy as np, matplotlib.pyplot as plt\nx = np.random.randn(200) * 2 + 5\ny = x * 50 + np.random.randn(200) * 20 + 200\nfig, ax = plt.subplots(figsize=(8, 5))\nax.scatter(x, y, s=80, alpha=0.5, edgecolors=\"black\")\n# Regression line\nz = np.polyfit(x, y, 1)\nax.plot(np.sort(x), np.poly1d(z)(np.sort(x)),\n         \"r--\", linewidth=2, label=\"trend\")\nax.set_xlabel(\"Feature\"); ax.set_ylabel(\"Price\"); ax.legend()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.scatter() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (>10k), overlap kills readability — switch to\n#             hexbin, hist2d, or set very low alpha. Use a\n#             perceptually-uniform colormap for color\n#             encoding (viridis/plasma, never jet/rainbow).\n#             perceptually-uniform colormaps don't mislead\n#             viewers about magnitude; explicit decision\n#             rule prevents the \"1M-point unreadable\n#             scatter\" failure mode.\n#             the historical default so people still\n#             instinctively use it.\n#\nimport numpy as np, matplotlib.pyplot as plt\n# Big data — scatter fails, hexbin succeeds\nn = 100_000\nx = np.random.randn(n); y = np.random.randn(n) + 0.5 * x\nfig, axes = plt.subplots(1, 2, figsize=(12, 5),\n                          layout=\"constrained\")\n# Scatter at low alpha just to see the cloud shape\naxes[0].scatter(x, y, s=2, alpha=0.05)\naxes[0].set_title(\"scatter (alpha=0.05)\")\n# Hexbin — reveals density\nhb = axes[1].hexbin(x, y, gridsize=40, cmap=\"viridis\")\nfig.colorbar(hb, ax=axes[1], label=\"count\")\naxes[1].set_title(\"hexbin\")\n# Decision rule:\n#   N <= 1k                              -> scatter (full markers)\n#   1k < N <= 10k                        -> scatter with alpha=0.2-0.5\n#   N > 10k                              -> hexbin / hist2d / 2D KDE\n#   color-encode continuous variable     -> c=array, cmap=\"viridis\" + colorbar\n#   color-encode categorical             -> loop groups + label= per scatter\n#   3rd dim via marker size              -> s=array (clip extreme values first)\n#   need regression overlay              -> seaborn regplot or np.polyfit\n#\n# Anti-pattern: using c=\"red\" (single color) when the user likely meant cmap encoding.\n#   The c= argument is overloaded — c=\"red\" sets every point red, but c=values + cmap=\n#   maps to a colorbar. People copy \"c=red\" then later try c=df[\"score\"] expecting a\n#   gradient and get a confusing error or solid color. Use color=\"red\" for solid; reserve\n#   c= for numeric arrays driving a colormap."
                  }
        ],
        tips: [
                  "alpha=0.5-0.7 is essential for overlapping points — reveals density",
                  "c= accepts a numeric array for color mapping; cmap= sets the colormap",
                  "s= accepts a scalar (same size all) or array (individual sizes)",
                  "viridis, plasma, magma are perceptually uniform colormaps — prefer them over rainbow/jet"
        ],
        mistake: "Using rainbow/jet colormap. It is not perceptually uniform and misleads viewers about data magnitude. Use viridis, plasma, or cividis instead.",
        shorthand: {
          verbose: "import numpy as np\nimport matplotlib.pyplot as plt\nnp.random.seed(42)\nfeatures = np.random.randn(30) * 2 + 5  # 0-10 scale",
          concise: "plt.tight_layout()",
        },
      },
      {
        id: "imshow",
        fn: "ax.imshow()",
        desc: "Display a 2D array as a color image or heatmap.",
        category: "Charts",
        subtitle: "Matrices, images, confusion matrices — raw array heatmap",
        signature: "ax.imshow(data, cmap=\"viridis\", vmin=, vmax=, aspect=\"auto\")",
        descLong: "ax.imshow() renders a 2D numpy array as a color image. Use it for raw array heatmaps, confusion matrices, and displaying image files. For annotated heatmaps from DataFrames, sns.heatmap() is easier — imshow() gives lower-level control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.imshow() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             comparable scales), divergent colormaps, or\n#             annotation.\n#\nimport numpy as np, matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nim = ax.imshow(np.random.randn(10, 10), cmap=\"viridis\")\nfig.colorbar(im, ax=ax)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.imshow() — common patterns you'll see in production.\n# APPROACH  - Combine ax.imshow() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             comparable scales, divergent colormap centered\n#             at zero, confusion-matrix annotations, hide\n#             axes for image files.\n#             by-side comparison; the annotated confusion-\n#             matrix pattern is one of imshow's most common\n#             real uses.\n#             stretched), origin= (\"upper\" vs \"lower\"), or\n#             when sns.heatmap is the better choice — senior.\n#\nimport numpy as np, matplotlib.pyplot as plt\n# Symmetric data with divergent colormap\ndata = np.random.randn(8, 8)\nfig, ax = plt.subplots()\nim = ax.imshow(data, cmap=\"RdBu_r\", vmin=-3, vmax=3)\nfig.colorbar(im, ax=ax, label=\"value\")\n# Annotated confusion matrix\ncm = np.array([[50, 5], [3, 42]])\nfig2, ax2 = plt.subplots()\nax2.imshow(cm, cmap=\"Blues\")\nfor i in range(cm.shape[0]):\n    for j in range(cm.shape[1]):\n        ax2.text(j, i, str(cm[i, j]),\n                  ha=\"center\", va=\"center\", fontsize=14)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.imshow() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             family (sequential/divergent/cyclic), control\n#             aspect= and interpolation= deliberately, set\n#             extent= for real-world coordinates instead of\n#             pixel indices, and reach for sns.heatmap when\n#             you have row/column labels.\n#             misreading; extent= maps pixels to true axes\n#             coordinates; sns.heatmap is dramatically less\n#             code for labeled DataFrames.\n#             to read correctly; interpolation=\"nearest\" is\n#             usually right but the default is \"antialiased\"\n#             on newer matplotlib.\n#\nimport numpy as np, matplotlib.pyplot as plt\ndata = np.random.randn(64, 64) * 2\n# 1. Divergent for signed data, sequential for unsigned\nfig, ax = plt.subplots(layout=\"constrained\")\nlimit = max(abs(data.min()), abs(data.max()))\nim = ax.imshow(data,\n                cmap=\"RdBu_r\",\n                vmin=-limit, vmax=limit,                  # symmetric -> 0 = white\n                interpolation=\"nearest\",                  # crisp pixels\n                extent=[-3, 3, -3, 3],                    # real coords, not pixels\n                origin=\"lower\")                           # math convention\nfig.colorbar(im, ax=ax, label=\"z\")\n# 2. For labeled heatmaps, sns.heatmap is far less code\n# import seaborn as sns\n# sns.heatmap(df, annot=True, fmt=\".2f\", cmap=\"coolwarm\")\n# Decision rule:\n#   sequential, all positive       -> \"viridis\", \"plasma\", \"magma\"\n#   divergent, signed (+/-)        -> \"RdBu_r\", \"coolwarm\", \"seismic\"\n#   cyclic (angle, phase)          -> \"twilight\", \"hsv\"\n#   labeled rows/cols (DataFrame)  -> sns.heatmap (annot=True, fmt=...)\n#   real-world coordinates         -> imshow(extent=[x0, x1, y0, y1])\n#   image data (RGB)               -> imshow(arr, origin=\"upper\") + ax.axis(\"off\")\n#   confusion matrix               -> imshow + text loop OR sklearn ConfusionMatrixDisplay\n#   NEVER                          -> \"jet\", \"rainbow\" (perceptually misleading)\n#\n# Anti-pattern: leaving aspect=\"equal\" (the default) on a non-image array, producing\n#   a tall sliver or wide stripe when rows != cols. For arbitrary 2D arrays that are\n#   NOT images, pass aspect=\"auto\" so the heatmap fills the axes. Reserve aspect=\"equal\"\n#   for actual images and confusion matrices where square cells matter."
                  }
        ],
        tips: [
                  "Use cmap=\"RdBu_r\" with vmin=-v, vmax=v for diverging data centered at zero",
                  "ax.axis(\"off\") removes ticks and labels — standard for displaying images",
                  "For DataFrame heatmaps with annotations, sns.heatmap() is easier than imshow()",
                  "origin=\"upper\" (default) puts row 0 at top; origin=\"lower\" puts it at bottom"
        ],
        mistake: "Using imshow() on a float array without setting vmin/vmax. The colormap auto-scales — two plots of the same variable at different ranges will show different colors, making comparison misleading.",
        shorthand: {
          verbose: "import numpy as np\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\ndata = np.random.randn(10, 10)",
          concise: "ax.set_yticklabels(row_labels)",
        },
      },
      {
        id: "twinx",
        fn: "ax.twinx()",
        desc: "Create a second y-axis sharing the same x-axis.",
        category: "Charts",
        subtitle: "Plot two variables with different scales on the same chart",
        signature: "ax2 = ax.twinx() | ax2 = ax.twiny()",
        descLong: "ax.twinx() creates a new Axes that shares the x-axis but has an independent y-axis on the right side. Use it when two variables have very different scales but a meaningful relationship on the same x (e.g. temperature and rainfall over time).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.twinx() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             differently-scaled series on the same chart.\n#             critical readability move) or combining\n#             legends.\n#\nimport matplotlib.pyplot as plt\nfig, ax1 = plt.subplots()\nax1.plot(range(12), [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30])\nax2 = ax1.twinx()\nax2.plot(range(12), [.15, .18, .12, .20, .22, .25, .28, .24, .21, .26, .30, .32])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.twinx() — common patterns you'll see in production.\n# APPROACH  - Combine ax.twinx() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             axis label and tick to match its line, build a\n#             combined legend across both axes.\n#             twin-axis plots interpretable; the combined-\n#             legend trick is the classic gotcha.\n#             tool (often: prefer two subplots) — senior.\n#\nimport matplotlib.pyplot as plt\nx = range(12)\nrevenue = [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30]\nmargin  = [.15, .18, .12, .20, .22, .25, .28, .24, .21, .26, .30, .32]\nfig, ax1 = plt.subplots(figsize=(10, 5))\nc1, c2 = \"steelblue\", \"coral\"\nax1.plot(x, revenue, color=c1, linewidth=2, label=\"Revenue\")\nax1.set_ylabel(\"Revenue ($M)\", color=c1)\nax1.tick_params(axis=\"y\", labelcolor=c1)\nax2 = ax1.twinx()\nax2.plot(x, margin, color=c2, linewidth=2, linestyle=\"--\", label=\"Margin\")\nax2.set_ylabel(\"Margin (%)\", color=c2)\nax2.tick_params(axis=\"y\", labelcolor=c2)\n# Combined legend across BOTH axes\nh1, l1 = ax1.get_legend_handles_labels()\nh2, l2 = ax2.get_legend_handles_labels()\nax1.legend(h1 + h2, l1 + l2, loc=\"upper left\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.twinx() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             implicit visual claim is \"these two scales\n#             move together\" — which is misleading when\n#             they don't. Prefer two subplots stacked\n#             vertically with a shared x-axis. Use twin\n#             axes only when the two series share a true\n#             relationship the reader needs to see overlaid.\n#             trap; sharex= keeps the time axis aligned;\n#             explicit decision rule prevents twin-axis\n#             overuse.\n#             audiences expect twin axes for \"dollars and\n#             percentages on the same x\" out of habit.\n#\nimport matplotlib.pyplot as plt\nx = range(12)\nrevenue = [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30]\nmargin  = [.15, .18, .12, .20, .22, .25, .28, .24, .21, .26, .30, .32]\n# Better default: two stacked subplots, shared x\nfig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6),\n                                sharex=True,\n                                layout=\"constrained\")\nax1.plot(x, revenue, linewidth=2, color=\"steelblue\")\nax1.set_ylabel(\"Revenue ($M)\")\nax2.plot(x, margin, linewidth=2, color=\"coral\", linestyle=\"--\")\nax2.set_ylabel(\"Margin (%)\")\nax2.set_xlabel(\"Month\")\n# Decision rule:\n#   readers must visually overlay two series  -> twin axes (color-coded)\n#   no real overlay benefit                    -> two subplots, sharex=True\n#   THREE+ series at different scales          -> three subplots, NEVER triple-axis\n#   secondary axis is a unit conversion (C/F)  -> ax.secondary_yaxis(functions=...)\n#   shared y, two x axes (top date + bottom)   -> ax.twiny()\n#   only need different SCALE not different y  -> ax.set_yscale(\"log\")\n#\n# Anti-pattern: drawing a single combined legend by calling ax1.legend() then\n#   ax2.legend() — you get TWO overlapping legend boxes. The fix is to gather\n#   handles+labels from both axes and pass them to one legend call:\n#   h1, l1 = ax1.get_legend_handles_labels(); h2, l2 = ax2.get_legend_handles_labels();\n#   ax1.legend(h1+h2, l1+l2). Equally common: forgetting to color-code the y-tick labels\n#   so readers can't tell which line maps to which scale."
                  }
        ],
        tips: [
                  "Color-code each axis and its labels to match the corresponding line — critical for readability",
                  "For a combined legend, collect handles from both axes: `ax1.get_legend_handles_labels()` + `ax2.get_legend_handles_labels()`",
                  "`ax.twiny()` shares the y-axis and creates a second x-axis on top — less common",
                  "Use sparingly — twin axes can confuse readers. Consider two separate subplots for complex data"
        ],
        mistake: "Forgetting to color-code the y-axis labels to match the lines. With two y-axes, readers cannot tell which scale belongs to which line without color coding.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nfig, ax1 = plt.subplots(figsize=(10, 5))\nx = range(12)\nrevenue = [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30]",
          concise: "plt.show()",
        },
      },
      {
        id: "fill-between",
        fn: "ax.fill_between()",
        desc: "Fill the area between two curves or a curve and a baseline.",
        category: "Charts",
        subtitle: "Confidence intervals, uncertainty bands, area charts",
        signature: "ax.fill_between(x, y1, y2=0, alpha=0.3)",
        descLong: "fill_between() fills the region between two lines (or between a line and a constant baseline). Most commonly used for confidence intervals, uncertainty bands around time series, and area charts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.fill_between() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             x. Use alpha to keep the lines visible.\n#             three lines.\n#             fill above/below threshold.\n#\nimport numpy as np, matplotlib.pyplot as plt\nx = np.linspace(0, 10, 100); y = np.sin(x)\nfig, ax = plt.subplots()\nax.plot(x, y)\nax.fill_between(x, y - 0.3, y + 0.3, alpha=0.3)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.fill_between() — common patterns you'll see in production.\n# APPROACH  - Combine ax.fill_between() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             band, area chart (fill to zero), conditional\n#             fill via where=.\n#             uncertainty bands, area-under-curve, above/\n#             below-threshold highlighting.\n#             crossings or stacked area charts — senior.\n#\nimport numpy as np, matplotlib.pyplot as plt\nx = np.linspace(0, 10, 100); y = np.sin(x)\nfig, axes = plt.subplots(1, 3, figsize=(14, 4))\n# Confidence band\naxes[0].plot(x, y); axes[0].fill_between(x, y - 0.3, y + 0.3, alpha=0.3)\n# Area chart — fill to zero\naxes[1].fill_between(x, y, alpha=0.4); axes[1].plot(x, y)\n# Conditional above/below threshold\naxes[2].plot(x, y, \"k\", linewidth=1)\naxes[2].fill_between(x, y, 0, where=(y >= 0), alpha=0.4, color=\"green\")\naxes[2].fill_between(x, y, 0, where=(y <  0), alpha=0.4, color=\"red\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.fill_between() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             clean threshold crossings, stacked area via\n#             cumulative sums, asymmetric confidence intervals\n#             with different upper/lower deltas, and pick\n#             stackplot for proper stacked areas.\n#             crossings; cumulative-sum stacking is the\n#             clean idiom for area charts; asymmetric CIs\n#             reflect real model output.\n#             arrays; stackplot has its own quirks (label\n#             ordering); asymmetric bands need the array form\n#             of upper/lower (broadcasting can surprise).\n#\nimport numpy as np, matplotlib.pyplot as plt\n# 1. Clean threshold crossings with interpolate=True\nx = np.linspace(0, 10, 50); y = np.sin(x)\nfig, ax = plt.subplots()\nax.plot(x, y, \"k\", linewidth=1)\nax.fill_between(x, y, 0,\n                 where=(y >= 0), interpolate=True,\n                 alpha=0.4, color=\"green\")\nax.fill_between(x, y, 0,\n                 where=(y <  0), interpolate=True,\n                 alpha=0.4, color=\"red\")\n# 2. Stacked areas — use stackplot, not multiple fill_between\nyears = np.arange(2018, 2024)\na = np.array([1, 2, 3, 4, 5, 6])\nb = np.array([2, 2, 3, 5, 6, 7])\nc = np.array([1, 1, 2, 2, 3, 4])\nfig2, ax2 = plt.subplots()\nax2.stackplot(years, a, b, c, labels=[\"A\", \"B\", \"C\"], alpha=0.8)\nax2.legend(loc=\"upper left\")\n# 3. Asymmetric CI — pass arrays for upper and lower\nci_lower = y - np.array([0.1, 0.2, 0.3] * (len(x)//3 + 1))[:len(x)]\nci_upper = y + np.array([0.4, 0.3, 0.2] * (len(x)//3 + 1))[:len(x)]\nfig3, ax3 = plt.subplots()\nax3.plot(x, y); ax3.fill_between(x, ci_lower, ci_upper, alpha=0.3)\n#\n# Decision rule:\n#   line + uncertainty band                    -> ax.plot + ax.fill_between(lo, hi)\n#   area chart (single series to zero)         -> ax.fill_between(x, y, 0, alpha=0.4)\n#   stacked areas (parts of a whole)           -> ax.stackplot, NOT chained fill_between\n#   shade above/below a threshold              -> fill_between(..., where=mask, interpolate=True)\n#   asymmetric errors per point                -> pass ci_lower/ci_upper arrays\n#   horizontal band (y range)                  -> ax.axhspan\n#   vertical band (x range / time period)      -> ax.axvspan\n#\n# Anti-pattern: forgetting interpolate=True with where=. When fill_between is masked by\n#   a boolean (e.g. where=(y >= 0)), the fill ends at sample points, not at the actual\n#   zero crossings — leaving visible \"stairsteps\" exactly where the curve crosses. Setting\n#   interpolate=True linearly interpolates between samples to find the true crossing and\n#   produces a clean shaded region."
                  }
        ],
        tips: [
                  "`alpha=0.2-0.4` keeps the fill from obscuring the data underneath",
                  "`where=` accepts a boolean array — enables conditional filling above/below a threshold",
                  "`interpolate=True` ensures the fill transitions correctly at crossing points",
                  "For a stacked area chart, pass cumulative sums as the y1/y2 values"
        ],
        mistake: "Using `fill_between()` without `alpha<1`. A solid fill at full opacity hides the data lines underneath. Always use `alpha=0.2-0.4` for overlay fills.",
        shorthand: {
          verbose: "import numpy as np\nimport matplotlib.pyplot as plt\nx = np.linspace(0, 10, 100)\ny = np.sin(x)",
          concise: "plt.tight_layout()",
        },
      },
      {
        id: "errorbar",
        fn: "ax.errorbar()",
        desc: "Plot data points with error bars showing uncertainty.",
        category: "Charts",
        subtitle: "Show mean ± std, CI, or measurement uncertainty",
        signature: "ax.errorbar(x, y, yerr=std, fmt=\"o\", capsize=5)",
        descLong: "errorbar() plots data points with vertical and/or horizontal error bars. yerr= and xerr= accept a scalar (symmetric), a 2-row array (asymmetric), or a column of values. Commonly used for scientific data, survey results, and model performance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.errorbar() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             the bars (standard scientific style).\n#             and y errors, or the line-with-band\n#             alternative.\n#\nimport matplotlib.pyplot as plt\nx, y, yerr = [1, 2, 3, 4, 5], [2.1, 3.5, 2.8, 4.2, 3.9], [0.3, 0.4, 0.2, 0.5, 0.3]\nfig, ax = plt.subplots()\nax.errorbar(x, y, yerr=yerr, fmt=\"o\", capsize=5)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.errorbar() — common patterns you'll see in production.\n# APPROACH  - Combine ax.errorbar() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             via 2-row array, both x and y errors, line +\n#             markers + band, and color/cap controls.\n#             asymmetric format is the most-asked errorbar\n#             question.\n#             alternative for dense errorbars (cleaner for\n#             time series) or aggregating before plotting —\n#             senior tier.\n#\nimport matplotlib.pyplot as plt\nx = [1, 2, 3, 4, 5]\ny = [2.1, 3.5, 2.8, 4.2, 3.9]\nyerr = [0.3, 0.4, 0.2, 0.5, 0.3]\nfig, axes = plt.subplots(1, 2, figsize=(10, 4))\n# Symmetric, with cap and color controls\naxes[0].errorbar(x, y, yerr=yerr,\n                  fmt=\"o\", capsize=5, capthick=1.5,\n                  color=\"steelblue\", ecolor=\"gray\",\n                  elinewidth=1, markersize=6)\n# Asymmetric — pass [[lower], [upper]]\nyerr_asym = [[0.1, 0.2, 0.1, 0.3, 0.2],\n             [0.4, 0.5, 0.3, 0.6, 0.4]]\naxes[1].errorbar(x, y, yerr=yerr_asym, xerr=0.1,\n                  fmt=\"-o\", capsize=4)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.errorbar() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             prefer line + fill_between (cleaner); for\n#             discrete points use errorbar with capsize. Be\n#             explicit about what the bars represent (std,\n#             SEM, 95% CI) — it changes the interpretation.\n#             of points where errorbar collapses into noise;\n#             explicit labeling forces honest plotting.\n#             feel; some audiences expect capped bars\n#             regardless.\n#\nimport numpy as np, matplotlib.pyplot as plt\nt = np.linspace(0, 10, 200)\nmean = np.sin(t)\nsem  = 0.1 + 0.05 * np.abs(np.cos(t))            # standard error of mean\nfig, axes = plt.subplots(1, 2, figsize=(12, 4),\n                          layout=\"constrained\")\n# Many points — errorbar gets noisy\naxes[0].errorbar(t, mean, yerr=sem, fmt=\"o\", capsize=2,\n                  markersize=2, alpha=0.5)\naxes[0].set_title(\"errorbar (200 points)\")\n# Cleaner: line + fill_between band\naxes[1].plot(t, mean, linewidth=2)\naxes[1].fill_between(t, mean - 1.96 * sem, mean + 1.96 * sem,\n                      alpha=0.3, label=\"95% CI\")\naxes[1].legend()\naxes[1].set_title(\"line + fill_between (95% CI)\")\n# Decision rule:\n#   discrete data points (~<30)        -> errorbar with capsize=3-5\n#   dense series (>50)                 -> line + fill_between (95% CI band)\n#   bar chart with uncertainty         -> ax.bar(..., yerr=...) + capsize\n#   asymmetric errors                  -> yerr=[[lower], [upper]] (2 rows)\n#   both x and y uncertainty           -> errorbar(..., xerr=, yerr=)\n#   horizontal layout (group means)    -> errorbar(yerr=...) on barh, or sns.pointplot\n#   showing distribution, not summary  -> boxplot or violinplot, NOT errorbar\n#\n# Anti-pattern: plotting yerr=df[\"std\"] without saying what the bars mean. A reader\n#   can't tell std (sample variability) from SEM (precision of the mean) from a 95% CI\n#   (inferential range) — they're often 4x apart. Always label: \"error bars: 1 SD\",\n#   \"error bars: 95% CI\". For dense time series, also pick line + fill_between rather\n#   than 200 caps that collapse into noise."
                  }
        ],
        tips: [
                  "`fmt=\"o\"` for points only, `fmt=\"-o\"` for line + points, `fmt=\"none\"` for error bars only",
                  "`capsize=5` adds horizontal caps to the error bars — standard in scientific plots",
                  "For asymmetric errors, pass a 2D array: `yerr=[[lower_errs], [upper_errs]]`",
                  "`ecolor=` sets error bar color independently from the marker/line color"
        ],
        mistake: "Passing `yerr=std_column` from a DataFrame without converting to a numpy array. Pandas Series sometimes cause unexpected shapes. Use `yerr=df[\"std\"].values`.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nx     = [1, 2, 3, 4, 5]\ny     = [2.1, 3.5, 2.8, 4.2, 3.9]\nyerr  = [0.3, 0.4, 0.2, 0.5, 0.3]",
          concise: ")",
        },
      },
      {
        id: "axhline",
        fn: "ax.axhline()",
        desc: "Draw a horizontal reference line spanning the full axes width.",
        category: "Charts",
        subtitle: "Baselines, thresholds, mean lines",
        signature: "ax.axhline(y=0, color=, linestyle=, linewidth=)",
        descLong: "axhline() draws a horizontal line at a given y value. Unlike a manually plotted line, it always spans the full width regardless of data or zoom. axhspan() shades a horizontal band between two y values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.axhline() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             full axes width regardless of zoom.\n#             which doesn't auto-extend.\n#             label= for legend integration.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([1, 2, 3], [10, 50, 30])\nax.axhline(y=0, color=\"black\", linewidth=0.8)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.axhline() — common patterns you'll see in production.\n# APPROACH  - Combine ax.axhline() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             threshold lines with labels, mean lines from\n#             data, axhspan for shaded target ranges.\n#             baselines, targets, and acceptable ranges.\n#             lines) or zorder for layering — senior tier.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y)\nax.axhline(y=0, color=\"black\", linewidth=0.8)         # baseline\nax.axhline(y=100, color=\"red\", linestyle=\"--\",\n            label=\"target\")                            # threshold\nax.axhline(y=y.mean(), color=\"gray\", linestyle=\":\",\n            label=\"mean\")\nax.axhspan(ymin=80, ymax=100, alpha=0.15,\n            color=\"green\", label=\"target range\")\nax.legend()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.axhline() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             reference lines don't obscure or get obscured\n#             by data; use xmin/xmax (axes-fraction) for\n#             partial-width lines; combine axhspan with\n#             label= for legend integration.\n#             hiding behind the data\" surprise; partial-\n#             width lines mark a specific x-range without\n#             plotting two segments.\n#             coordinates — easy to mistake; zorder layering\n#             is invisible until something looks wrong.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y, linewidth=2, zorder=2)\n# Reference line BEHIND data\nax.axhline(y=0, color=\"black\", linewidth=0.8, zorder=1)\n# Highlight a horizontal band, label-aware\nax.axhspan(ymin=80, ymax=100, alpha=0.15,\n            color=\"green\", zorder=0, label=\"target\")\n# Partial-width line — xmin/xmax in AXES FRACTION (0..1)\nax.axhline(y=50, xmin=0.2, xmax=0.8,\n            color=\"red\", linestyle=\":\")               # spans middle 60% only\nax.legend()\n#\n# Decision rule:\n#   y=0 baseline                          -> ax.axhline(y=0, color=\"black\", lw=0.8)\n#   threshold / target line               -> ax.axhline(y=target, ls=\"--\", label=\"target\")\n#   acceptable range / band               -> ax.axhspan(ymin, ymax, alpha=0.15)\n#   mean of plotted data                  -> ax.axhline(y=df[\"col\"].mean())\n#   line over a specific x-range only     -> ax.axhline(y=v, xmin=0.2, xmax=0.8) (axes frac)\n#   reference line behind data            -> ax.axhline(..., zorder=0)\n#   on a log y-scale                      -> still works; y is in DATA units\n#\n# Anti-pattern: using ax.plot([xmin, xmax], [y, y]) for a \"horizontal line\". When the\n#   x-axis limits change (zoom, new data, autoscale), the segment doesn't extend — you\n#   get a stub. ax.axhline always spans the full axes width and survives autoscale. Same\n#   trap with xmin/xmax: those are AXES FRACTION (0..1), not data coords — easy to confuse."
                  }
        ],
        tips: [
                  "axhline(y=df[\"col\"].mean()) adds a mean line without needing x coordinates",
                  "axhspan(ymin, ymax, alpha=0.1) shades a horizontal band for target ranges",
                  "The line auto-extends when the axis is zoomed — unlike ax.plot([x0,x1],[y,y])",
                  "Use zorder= to control whether the line appears above or below chart elements"
        ],
        mistake: "Using ax.plot([x_min, x_max], [y, y]) for a reference line. It does not extend when axis limits change. Use ax.axhline(y=val) which always spans full width.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y)\nax.axhline(y=0, color='black', linewidth=0.8)",
          concise: "plt.tight_layout()",
        },
      },
      {
        id: "axvline",
        fn: "ax.axvline()",
        desc: "Draw a vertical reference line spanning the full axes height.",
        category: "Charts",
        subtitle: "Event markers, cutoffs, period boundaries",
        signature: "ax.axvline(x=0, color=, linestyle=, linewidth=)",
        descLong: "axvline() draws a vertical line at a given x value spanning the full height of the axes. axvspan() shades a vertical band between two x values — useful for highlighting time periods.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.axvline() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             full height of the axes.\n#             series\".\n#             multi-event loops.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y)\nax.axvline(x=5, color=\"red\", linestyle=\"--\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.axvline() — common patterns you'll see in production.\n# APPROACH  - Combine ax.axvline() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             on a datetime axis, axvspan for highlighted\n#             periods (COVID, recessions), and multi-event\n#             loops.\n#             annotate events on a time series.\n#             (combining axvline with ax.text) — senior.\n#\nimport pandas as pd, matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(dates, values)\nax.axvline(x=pd.Timestamp(\"2020-03-01\"),\n            color=\"red\", linestyle=\"--\", linewidth=1.5,\n            label=\"policy change\")\nax.axvspan(xmin=pd.Timestamp(\"2020-01-01\"),\n            xmax=pd.Timestamp(\"2021-01-01\"),\n            alpha=0.15, color=\"orange\",\n            label=\"COVID period\")\nfor ev in [pd.Timestamp(\"2019-01-01\"), pd.Timestamp(\"2021-06-01\")]:\n    ax.axvline(x=ev, color=\"gray\", linestyle=\":\", alpha=0.7)\nax.legend()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.axvline() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             with ax.text at the top of the axes for\n#             readable labels; pull events from a DataFrame\n#             so the chart stays in sync with the data;\n#             use ymin/ymax (axes-fraction) for partial-\n#             height lines.\n#             a legend with many event lines; data-driven\n#             event lists keep the chart deterministic.\n#             rotate or stagger; ymin/ymax use AXES FRACTION\n#             (0..1), not data coords.\n#\nimport pandas as pd, matplotlib.pyplot as plt\nevents = pd.DataFrame({\n    \"date\":  pd.to_datetime([\"2019-01\", \"2020-03\", \"2021-06\"]),\n    \"label\": [\"product launch\", \"policy change\", \"v2 release\"],\n    \"color\": [\"gray\", \"red\", \"blue\"],\n})\nfig, ax = plt.subplots(figsize=(10, 4), layout=\"constrained\")\nax.plot(dates, values)\nfor _, ev in events.iterrows():\n    ax.axvline(x=ev.date, color=ev.color, linestyle=\"--\",\n                linewidth=1, alpha=0.7)\n    # Label at top of axes (y in axes-fraction)\n    ax.text(ev.date, 0.98, ev.label, transform=ax.get_xaxis_transform(),\n             rotation=90, va=\"top\", ha=\"right\",\n             fontsize=8, color=ev.color)\n# Partial-height vertical line — ymin/ymax in AXES FRACTION\n# ax.axvline(x=event_x, ymin=0.0, ymax=0.3)\n#\n# Decision rule:\n#   single event marker                   -> ax.axvline(x=date, color=, ls=\"--\")\n#   highlighted period (recession, COVID) -> ax.axvspan(xmin, xmax, alpha=0.15)\n#   many events (> 3)                     -> loop + axvline + ax.text labels\n#   datetime axis                         -> pass pd.Timestamp / datetime objects\n#   short marker, not full height         -> ax.axvline(..., ymin=0, ymax=0.3) (axes frac)\n#   labels: tag the line directly         -> ax.text with transform=ax.get_xaxis_transform()\n#   per-event color                       -> drive from a DataFrame (date, label, color)\n#\n# Anti-pattern: passing an integer to axvline on a datetime x-axis. Matplotlib will\n#   silently interpret 5 as 1970-01-06 (5 days from epoch), placing the line off-screen\n#   or in the wrong year. Always match the data's units: pd.Timestamp(\"2020-03-01\") for\n#   datetime, plain numbers for numeric axes. Same trap with axvspan(xmin, xmax)."
                  }
        ],
        tips: [
                  "axvspan(xmin, xmax, alpha=0.1) shades a time period — standard for recession/event highlighting",
                  "For datetime x-axis, pass pd.Timestamp or ISO string to x=",
                  "Use label= on reference lines and include in ax.legend() for an annotated chart",
                  "zorder=0 puts the line behind data; zorder=3 puts it in front"
        ],
        mistake: "Forgetting that axvspan uses the same x-axis units as the data. If your x-axis is datetime, pass datetime values — not integers.",
        shorthand: {
          verbose: "import pandas as pd\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(dates, values)",
          concise: "plt.tight_layout()",
        },
      },
    ],
  },

  // ── Section 2: Figures & Layouts ─────────────────────────────────────────
  {
    id: "figures-layouts",
    title: "Figures & Layouts",
    entries: [
      {
        id: "gridspec",
        fn: "GridSpec",
        desc: "Create subplots with variable sizes and spans.",
        category: "Layouts",
        subtitle: "Spans rows/columns for dashboard-style figures",
        signature: "gs = GridSpec(nrows, ncols) | ax = fig.add_subplot(gs[0, :])",
        descLong: "GridSpec creates a grid layout where individual subplots can span multiple rows or columns. More flexible than plt.subplots() for dashboard-style figures. subplot_mosaic() is a simpler string-based alternative (matplotlib 3.3+).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of GridSpec — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Index with [row, col] slices.\n#             tuning.\n#\nimport matplotlib.pyplot as plt\nfig = plt.figure(figsize=(10, 6))\ngs = fig.add_gridspec(2, 2)\nfig.add_subplot(gs[0, :])         # span full top row\nfig.add_subplot(gs[1, 0])\nfig.add_subplot(gs[1, 1])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of GridSpec — common patterns you'll see in production.\n# APPROACH  - Combine GridSpec with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             cells. Tune hspace/wspace for spacing.\n#             several smaller ones\" dashboard.\n#             when to switch to subplot_mosaic — senior.\n#\nimport matplotlib.pyplot as plt, numpy as np\nfig = plt.figure(figsize=(12, 8))\ngs = fig.add_gridspec(2, 3, hspace=0.4, wspace=0.3)\nax_top = fig.add_subplot(gs[0, :])\nax_bl  = fig.add_subplot(gs[1, 0])\nax_bm  = fig.add_subplot(gs[1, 1])\nax_br  = fig.add_subplot(gs[1, 2])\nax_top.plot(np.random.randn(100).cumsum())\nax_top.set_title(\"Full width\")\nax_bl.hist(np.random.randn(200), bins=20)\nax_bm.scatter(np.random.rand(50), np.random.rand(50))\nax_br.bar([1, 2, 3], [3, 1, 4])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of GridSpec — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             readability, use width_ratios/height_ratios\n#             when panels need different sizes, and reach\n#             for layout=\"constrained\" instead of manual\n#             hspace/wspace tuning.\n#             far easier to maintain; constrained_layout\n#             handles spacing automatically.\n#             is slightly slower to render than tight_layout.\n#\nimport matplotlib.pyplot as plt, numpy as np\n# Same layout via subplot_mosaic — much more readable\nfig, axd = plt.subplot_mosaic(\n    \"\"\"\n    AAA\n    BCD\n    \"\"\",\n    figsize=(12, 8),\n    height_ratios=[2, 1],\n    layout=\"constrained\",\n)\naxd[\"A\"].plot(np.random.randn(100).cumsum())\naxd[\"B\"].hist(np.random.randn(200), bins=20)\naxd[\"C\"].scatter(np.random.rand(50), np.random.rand(50))\naxd[\"D\"].bar([1, 2, 3], [3, 1, 4])\n# When to pick which:\n#   simple uniform grid           -> plt.subplots(rows, cols)\n#   asymmetric, one panel spans   -> subplot_mosaic (preferred)\n#   complex with size ratios      -> GridSpec (fine-grained)\n#\n# Decision rule:\n#   uniform NxM grid, equal sizes        -> plt.subplots(nrows, ncols)\n#   one panel spans rows or cols         -> subplot_mosaic (named, preferred)\n#   need precise width/height ratios     -> GridSpec(width_ratios=, height_ratios=)\n#   nested grids (grid inside a panel)   -> gs.subgridspec(...)\n#   pixel-perfect dashboards             -> GridSpec + manual layout=\"constrained\"\n#   need shared axes across spans        -> GridSpec + sharex=, or per_subplot_kw\n#   one-off \"big chart + sparklines\"     -> subplot_mosaic with height_ratios\n#\n# Anti-pattern: hand-tuning hspace/wspace until it \"looks right\". GridSpec spacing is\n#   sensitive to figsize, dpi, and label length — what looks good in your notebook\n#   clips on a slide. Use layout=\"constrained\" (or constrained_layout=True) on the\n#   Figure and let matplotlib compute spacing from real label sizes. Reach for hspace\n#   only when constrained layout still doesn't fit."
                  }
        ],
        tips: [
                  "`gs[0, :]` spans the full first row; `gs[:, 0]` spans the full first column",
                  "`subplot_mosaic()` with ASCII art layout is cleaner for most dashboard designs",
                  "`hspace` and `wspace` in GridSpec control vertical and horizontal spacing between plots",
                  "Use `fig.add_subplot(gs[row_slice, col_slice])` for spanning — standard slice syntax works"
        ],
        mistake: "Using `plt.subplots(2, 3)` when you need one plot to span multiple cells. Switch to `GridSpec` or `subplot_mosaic()` when any panel needs to span rows or columns.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport matplotlib.gridspec as gridspec\nimport numpy as np\nfig = plt.figure(figsize=(12, 8))",
          concise: "plt.show()",
        },
      },
      {
        id: "subplot-mosaic",
        fn: "plt.subplot_mosaic()",
        desc: "Create complex asymmetric subplot layouts with readable ASCII art.",
        category: "Basics",
        subtitle: "Named panels in a string — far cleaner than GridSpec",
        signature: "fig, axes = plt.subplot_mosaic(\"AB\nCC\")",
        descLong: "plt.subplot_mosaic() (matplotlib 3.3+) creates complex layouts using an ASCII art string. Repeated letters span multiple cells. Returns a dict of named Axes — much more readable than GridSpec index arithmetic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of plt.subplot_mosaic() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             panel; repeat to span; \".\" for empty.\n#             arithmetic.\n#\nimport matplotlib.pyplot as plt\nfig, axd = plt.subplot_mosaic(\"AB\\nCC\", figsize=(8, 6))\naxd[\"A\"].plot([1, 2, 3], [1, 4, 9])\naxd[\"B\"].bar([\"x\", \"y\"], [3, 5])\naxd[\"C\"].hist([1, 1, 2, 3, 3, 3])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of plt.subplot_mosaic() — common patterns you'll see in production.\n# APPROACH  - Combine plt.subplot_mosaic() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             via multi-line strings, height/width ratios,\n#             empty cells with \".\", named axes access.\n#             named axes are self-documenting in real code.\n#             or shared axes — senior tier.\n#\nimport matplotlib.pyplot as plt\nfig, axd = plt.subplot_mosaic(\n    \"\"\"\n    AAB\n    CDB\n    \"\"\",\n    figsize=(12, 7),\n    height_ratios=[2, 1],\n    width_ratios=[1, 1, 2],\n)\naxd[\"A\"].plot(x, y, label=\"series A\")\naxd[\"B\"].scatter(x2, y2)\naxd[\"C\"].bar(cats, vals)\naxd[\"D\"].hist(data)\n# Empty cells use \".\"\nfig2, axd2 = plt.subplot_mosaic(\n    \"\"\"\n    A.\n    BC\n    \"\"\",\n    figsize=(8, 6),\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of plt.subplot_mosaic() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             configure individual panels (shared axes,\n#             projections), iterate axes by name in a\n#             config-driven loop, and combine with\n#             constrained_layout for hands-off spacing.\n#             code; config-driven loops keep dashboards\n#             maintainable; constrained_layout removes the\n#             manual hspace/wspace fiddling.\n#             named-axes loops require disciplined keys.\n#\nimport matplotlib.pyplot as plt\n# Per-panel kwargs — set up shared x or projection cleanly\nfig, axd = plt.subplot_mosaic(\n    \"\"\"\n    AB\n    CB\n    \"\"\",\n    figsize=(10, 6),\n    layout=\"constrained\",\n    per_subplot_kw={\n        \"B\": {\"projection\": \"polar\"},        # B is polar\n    },\n)\n# Config-driven population\nplots = {\n    \"A\": (\"plot\",    [x, y]),\n    \"B\": (\"plot\",    [theta, r]),\n    \"C\": (\"scatter\", [x, y]),\n}\nfor name, (kind, args) in plots.items():\n    getattr(axd[name], kind)(*args)\n    axd[name].set_title(name)\n# Decision rule:\n#   simple uniform grid              -> plt.subplots(rows, cols)\n#   asymmetric, named panels         -> subplot_mosaic (preferred default)\n#   need pixel-perfect placement     -> GridSpec(width_ratios=, height_ratios=)\n#   one panel needs polar/3d         -> per_subplot_kw={\"P\": {\"projection\": \"polar\"}}\n#   shared x or y axes               -> sharex=True/sharey=True keywords\n#   want empty cells in layout       -> \".\" in the mosaic string\n#   per-panel size control           -> width_ratios=, height_ratios=\n#\n# Anti-pattern: indexing the mosaic axes by position (axd[0], axd[1, 0]) like a NumPy\n#   grid. subplot_mosaic returns a dict keyed by your panel letters — axd[\"A\"], axd[\"B\"].\n#   Treating it like an array silently raises KeyError or returns the wrong panel after\n#   a layout edit. The named-axes pattern is the entire point: rename a panel and your\n#   code still tracks it."
                  }
        ],
        tips: [
                  "Axes are a dict: axes[\"A\"], axes[\"B\"] — not axes[0,0]. Named access is self-documenting",
                  "Repeated letters create spanning panels: \"AA\nBC\" makes A span both columns of row 1",
                  "\".\" in the layout string leaves an empty cell — useful for unequal numbers of panels",
                  "height_ratios= and width_ratios= control relative panel sizes"
        ],
        mistake: "Still using plt.subplot(2,2,1) for asymmetric layouts. You have to track index arithmetic manually. Use subplot_mosaic() for any non-uniform grid.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nfig, axes = plt.subplot_mosaic(\n\"AB\nCC\",\nfigsize=(10, 8),",
          concise: "plt.tight_layout()",
        },
      },
      {
        id: "anatomy",
        fn: "Figure & Axes",
        desc: "Create figures and subplots — the two-level structure.",
        category: "Basics",
        subtitle: "Figure contains Axes; Axes contains the plot",
        signature: "fig, ax = plt.subplots(nrows, ncols)",
        descLong: "Matplotlib has two layers: Figure (the whole canvas) and Axes (individual plot area). Always use the object-oriented interface (fig, ax = plt.subplots()) rather than plt.plot() for anything beyond a quick test — it gives explicit control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Figure & Axes — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             plt.subplots() — never plt.plot in real code.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([1, 2, 3], [4, 5, 6])\nax.set_title(\"My Plot\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Figure & Axes — common patterns you'll see in production.\n# APPROACH  - Combine Figure & Axes with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             contains Axes (plot). subplots(rows, cols)\n#             returns a Figure plus an array of Axes.\n#             contrast with the plt.* \"current axes\" model.\n#             — senior tier.\n#\nimport matplotlib.pyplot as plt, numpy as np\n# Single\nfig, ax = plt.subplots(figsize=(8, 5))\nax.plot([1, 2, 3], [4, 5, 6])\nax.set_xlabel(\"x\"); ax.set_ylabel(\"y\"); ax.set_title(\"OO API\")\n# Grid — axes is a 2D array\nfig, axes = plt.subplots(2, 3, figsize=(12, 6))\naxes[0, 0].plot(x, y)\naxes[1, 2].scatter(x, y)\n# Quick interactive style — only for exploration\nplt.plot([1, 2, 3], [4, 5, 6])\nplt.title(\"quick\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Figure & Axes — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             plt.* state machine breaks when subplots,\n#             callbacks, or asynchronous code touch the\n#             \"current figure\" — every issue you'll Google\n#             traces back to this. Use layout=\"constrained\"\n#             over tight_layout for new code.\n#             multi-figure code; constrained_layout handles\n#             label collisions automatically.\n#             import bad habits; constrained_layout adds\n#             slight render time.\n#\nimport matplotlib.pyplot as plt, numpy as np\n# 1. The shape every production matplotlib function takes\ndef make_plot(data: np.ndarray, ax: plt.Axes | None = None) -> plt.Axes:\n    \"\"\"Plot into the given axes; create if not provided.\"\"\"\n    if ax is None:\n        _, ax = plt.subplots()\n    ax.plot(data)\n    return ax\n# 2. Compose into a multi-panel figure cleanly\nfig, axes = plt.subplots(2, 2, figsize=(10, 8),\n                          layout=\"constrained\")\nmake_plot(np.random.randn(100), ax=axes[0, 0])\nmake_plot(np.random.randn(100), ax=axes[0, 1])\n# ...\n# 3. Anti-patterns to avoid\n#    plt.plot(...)       # implicit current-axes; surprises in subplots\n#    plt.title(\"X\")      # sets title on whichever axes was created LAST\n#    plt.gca()           # \"get current axes\" — reaching for hidden state\n#\n# Decision rule:\n#   any production code                      -> OO API: fig, ax = plt.subplots()\n#   one-off REPL exploration                 -> plt.plot(...) is fine\n#   a function that draws into ANY axes      -> def f(..., ax=None): if ax is None: ...\n#   multi-figure script                      -> fig.savefig per fig + plt.close(fig)\n#   subplots                                 -> fig, axes = plt.subplots(r, c)\n#   need to mutate after creation            -> hold onto fig and ax variables\n#   asymmetric layout                        -> plt.subplot_mosaic\n#\n# Anti-pattern: using plt.title / plt.xlabel / plt.savefig in a function that creates\n#   subplots. The plt.* state machine targets the most-recently-created axes, so\n#   plt.title(\"A\") after fig, axes = plt.subplots(1,2) sets the title on axes[1] (or\n#   nothing predictable). Always call methods on the explicit ax/fig objects you got\n#   back from plt.subplots — never reach for plt.gca() / plt.gcf() in production code."
                  }
        ],
        tips: [
                  "Always use fig, ax = plt.subplots() — the OOP interface avoids subtle state bugs",
                  "figsize=(width, height) in inches — (10, 6) is a good default",
                  "bbox_inches=\"tight\" prevents labels from being clipped in saved files",
                  "Use plt.show() in scripts; in Jupyter, figures display inline automatically"
        ],
        mistake: "Mixing the functional (plt.plot) and OOP (ax.plot) interfaces in the same figure. Pick one style and stick with it — mixing causes confusing bugs.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport numpy as np\nfig, ax = plt.subplots()\nax.plot([1, 2, 3], [4, 5, 6])",
          concise: "fig.savefig(\"plot.svg\")           # vector format",
        },
      },
      {
        id: "subplots",
        fn: "plt.subplots()",
        desc: "Create a Figure and one or more Axes in a grid layout.",
        category: "Basics",
        subtitle: "The standard entry point — always use instead of plt.figure()",
        signature: "fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(8,6))",
        descLong: "plt.subplots() is the standard way to create matplotlib figures. It returns a Figure and one or more Axes objects. figsize= controls the size in inches. The axes array is 1D for a single row/column and 2D for a grid.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of plt.subplots() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             a single plot.\n#             axes.flat iteration.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots(figsize=(10, 6))\nax.plot([1, 2, 3], [4, 5, 6])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of plt.subplots() — common patterns you'll see in production.\n# APPROACH  - Combine plt.subplots() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             2x2 grid, sharex/sharey, axes.flat iteration\n#             over a DataFrame's columns.\n#             notebooks every day.\n#             dpi= for hi-DPI screens — senior tier.\n#\nimport matplotlib.pyplot as plt\n# 1 row, 3 cols\nfig, axes = plt.subplots(1, 3, figsize=(15, 4))\naxes[0].plot(x, y1); axes[1].bar(cats, vals); axes[2].scatter(x, y2)\n# 2x2 grid — axes is 2D\nfig, axes = plt.subplots(2, 2, figsize=(12, 8))\naxes[0, 0].plot(x, y); axes[1, 1].scatter(x, y)\n# Shared x-axis between stacked time series\nfig, (ax1, ax2) = plt.subplots(2, 1, sharex=True, figsize=(10, 6))\n# Iterate flat — clean per-column histograms\nfig, axes = plt.subplots(2, 3, figsize=(15, 8))\nfor ax, col in zip(axes.flat, df.columns[:6]):\n    ax.hist(df[col], bins=20)\n    ax.set_title(col)\nplt.tight_layout()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of plt.subplots() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             plt.tight_layout (handles label collisions\n#             during render, not after); subplot_kw= for\n#             per-axes options like polar projection;\n#             gridspec_kw for ratios; squeeze=False for\n#             always-2D axes arrays even with 1xN.\n#             clipped\" issues; squeeze=False keeps code\n#             generic across grid sizes.\n#             rcParams interact unexpectedly (savefig may\n#             override layout).\n#\nimport matplotlib.pyplot as plt\n# Always-2D axes via squeeze=False — generic looping\nfig, axes = plt.subplots(2, 3, figsize=(15, 8),\n                          layout=\"constrained\",\n                          squeeze=False)\nfor ax in axes.flat:\n    ax.set_xlim(0, 10)\n# Per-axes options via subplot_kw\nfig, axes = plt.subplots(1, 2, figsize=(12, 5),\n                          subplot_kw={\"projection\": \"polar\"})\n# Size ratios via gridspec_kw\nfig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6),\n                                 gridspec_kw={\"height_ratios\": [3, 1]})\n#\n# Decision rule:\n#   single chart                       -> fig, ax = plt.subplots(figsize=(...))\n#   uniform NxM grid                   -> fig, axes = plt.subplots(N, M)\n#   one panel spans rows/cols          -> plt.subplot_mosaic, NOT subplots\n#   stacked time series                -> plt.subplots(N, 1, sharex=True)\n#   loop over DataFrame columns        -> plt.subplots(...) + axes.flat zip\n#   need consistent 2D access          -> plt.subplots(..., squeeze=False)\n#   uneven panel sizes                 -> gridspec_kw={\"height_ratios\": [...]}\n#   polar / 3D projection              -> subplot_kw={\"projection\": \"polar\"}\n#\n# Anti-pattern: forgetting that axes is 1D for plt.subplots(1, N) but 2D for\n#   plt.subplots(M, N) with M>1 — code written for axes[0, 0] crashes when N or M\n#   becomes 1. Either standardize on squeeze=False (always 2D), or use axes.flat\n#   to iterate without caring about shape. Also: calling plt.tight_layout() AFTER\n#   plt.show() — show() flushes the figure first, so the layout fix is a no-op."
                  }
        ],
        tips: [
                  "`axes.flat` iterates over all axes in a grid regardless of shape — cleaner than nested loops",
                  "`sharex=True` / `sharey=True` links axis limits across subplots — great for comparisons",
                  "Always call `plt.tight_layout()` before `plt.show()` — prevents label overlap",
                  "`plt.subplots_adjust(hspace=0.4)` gives fine control over spacing between subplots"
        ],
        mistake: "Using `plt.figure()` + `fig.add_subplot()` manually. `plt.subplots()` is cleaner and handles the grid for you — use it for all new code.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport numpy as np\nfig, ax = plt.subplots()\nfig, ax = plt.subplots(figsize=(10, 6))",
          concise: "plt.show()",
        },
      },
      {
        id: "figsize",
        fn: "Figure size and DPI",
        desc: "Control the physical size and resolution of a matplotlib figure.",
        category: "Basics",
        subtitle: "figsize in inches, dpi for resolution — set at creation time",
        signature: "plt.subplots(figsize=(width, height)) | fig.set_size_inches(w, h)",
        descLong: "figsize= sets the figure size in inches. dpi= (dots per inch) controls resolution — default is 100. For screen display 100 dpi is fine; for print/publication use 300. The pixel size is figsize × dpi.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Figure size and DPI — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             creation.\n#             yields pixels.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots(figsize=(10, 6))    # 10x6 inches"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Figure size and DPI — common patterns you'll see in production.\n# APPROACH  - Combine Figure size and DPI with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             presentation vs print. pixel = figsize x dpi.\n#             rules.\n#             override patterns — senior tier.\n#\nimport matplotlib.pyplot as plt\n# Common sizes\nplt.subplots(figsize=(8, 6))     # default, general\nplt.subplots(figsize=(10, 6))    # presentations\nplt.subplots(figsize=(12, 4))    # time series / wide data\nplt.subplots(figsize=(6, 6))     # square (scatter, corr matrix)\n# DPI tiers\nplt.subplots(figsize=(8, 6), dpi=100)   # screen\nplt.subplots(figsize=(8, 6), dpi=150)   # slides / Jupyter\nplt.subplots(figsize=(8, 6), dpi=300)   # print\n# Pixel = figsize x dpi\n# (8, 6) at dpi=300 -> 2400 x 1800 px\n# Change after creation\nfig, ax = plt.subplots()\nfig.set_size_inches(12, 8); fig.set_dpi(200)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Figure size and DPI — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             DPI from save DPI, scope rcParams via\n#             plt.rc_context to avoid global state, and\n#             pick figsize for the medium (16:9 for slides,\n#             4:3 for handouts).\n#             separate save dpi keeps notebooks readable\n#             but exports crisp; sizing for medium prevents\n#             scaling issues.\n#             more thing to learn; matching dpi between\n#             notebook and slide deck takes one or two\n#             tries.\n#\nimport matplotlib.pyplot as plt\n# 1. Local rcParams override — no global side effects\nwith plt.rc_context({\"figure.figsize\": (12, 7),\n                      \"figure.dpi\": 120,\n                      \"savefig.dpi\": 300}):\n    fig, ax = plt.subplots()\n    ax.plot(x, y)\n    fig.savefig(\"out.png\", bbox_inches=\"tight\")     # 300 dpi save\n# 2. Aspect-ratio targets\n#    Slides (16:9)        -> figsize=(12, 6.75)\n#    Letter handout (4:3) -> figsize=(8, 6)\n#    Square correlation   -> figsize=(6, 6)\n#    Time series strip    -> figsize=(14, 3.5)\n# 3. Many-row barh — height should scale with N\nn_categories = 25\nfig, ax = plt.subplots(figsize=(8, max(4, n_categories * 0.3)))\n# Anti-pattern: setting rcParams globally in a notebook\n#   plt.rcParams[\"figure.figsize\"] = (12, 7)        # leaks to next cells\n# Use rc_context for one-off changes.\n#\n# Decision rule:\n#   default general chart                -> figsize=(8, 6) (4:3)\n#   slide / 16:9 display                 -> figsize=(12, 6.75)\n#   square (correlation, scatter)        -> figsize=(6, 6)\n#   wide time series strip               -> figsize=(14, 3.5)\n#   N-row barh / dotplot                 -> figsize=(8, max(4, 0.3 * N))\n#   notebook screen display              -> dpi=100-120\n#   slide / Jupyter Retina               -> dpi=150\n#   print / journal                      -> dpi=300, save in PDF or PNG"
                  }
        ],
        tips: [
                  "Pixel size = figsize × dpi: `(10, 6)` at `dpi=150` gives a 1500×900 pixel figure",
                  "For Jupyter notebooks, `%matplotlib inline` uses the default dpi — set `plt.rcParams[\"figure.dpi\"] = 120` for larger inline figures",
                  "For presentations: `figsize=(12, 7)` matches 16:9 aspect ratio",
                  "For bar charts with many categories, increase height: `figsize=(8, max(4, n_categories * 0.3))`"
        ],
        mistake: "Trying to change figure size after plotting with `plt.rcParams[\"figure.figsize\"]`. This only affects future figures. Pass `figsize=` to `plt.subplots()` at creation time.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nfig, ax = plt.subplots(figsize=(10, 6))    # 10×6 inches\nfig, ax = plt.subplots(figsize=(6, 6))     # square\nfig, ax = plt.subplots(figsize=(16, 4))    # wide/short",
          concise: "plt.rcParams['figure.dpi'] = 150",
        },
      },
    ],
  },

  // ── Section 3: Styling & Customization ─────────────────────────────────────────
  {
    id: "styling",
    title: "Styling & Customization",
    entries: [
      {
        id: "labels",
        fn: "Labels & titles",
        desc: "Set titles, axis labels, tick marks, limits, and grids.",
        category: "Styling",
        subtitle: "The essential labeling calls every plot needs",
        signature: "ax.set_title() | ax.set_xlabel() | ax.annotate()",
        descLong: "Well-labelled plots communicate clearly. Use set_title(), set_xlabel(), set_ylabel() for basic labels. annotate() adds arrows and text pointing to specific data points.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Labels & titles — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             label, y label.\n#             tick customization.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y)\nax.set_title(\"Sales by Quarter\")\nax.set_xlabel(\"Quarter\")\nax.set_ylabel(\"Revenue ($K)\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Labels & titles — common patterns you'll see in production.\n# APPROACH  - Combine Labels & titles with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             combine multiple labels, custom xticks for\n#             categorical axes, rotated labels, grid styling,\n#             axis limits.\n#             ax.set() is the cleanest single-call form.\n#             theming — senior tier.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y)\n# Combined labels (cleaner than three separate set_* calls)\nax.set(title=\"Sales by Quarter\",\n        xlabel=\"Quarter\",\n        ylabel=\"Revenue ($K)\",\n        xlim=(0, 10),\n        ylim=(0, 100))\n# Categorical ticks\nax.set_xticks([1, 2, 3, 4])\nax.set_xticklabels([\"Q1\", \"Q2\", \"Q3\", \"Q4\"])\nax.tick_params(axis=\"x\", rotation=45, labelsize=10)\n# Grid — only horizontal (cleaner for bar charts)\nax.grid(True, axis=\"y\", linestyle=\"--\", alpha=0.5)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Labels & titles — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             rcParams in a context manager, remove top/\n#             right spines for a cleaner publication look,\n#             use ax.set_xlabel(..., loc=\"left\") to align\n#             labels with the start of the data area.\n#             spine removal is the single biggest readability\n#             win for publication-style charts.\n#             reach for axhline(y=0) to compensate; rcParams\n#             keys are a sprawl, easy to misspell.\n#\nimport matplotlib.pyplot as plt\nwith plt.rc_context({\n    \"axes.spines.top\":   False,\n    \"axes.spines.right\": False,\n    \"axes.titlesize\":   14,\n    \"axes.titleweight\": \"bold\",\n    \"axes.labelsize\":   11,\n    \"xtick.labelsize\":  10,\n    \"ytick.labelsize\":  10,\n    \"axes.grid\":        True,\n    \"grid.alpha\":       0.3,\n    \"grid.linestyle\":   \"--\",\n}):\n    fig, ax = plt.subplots(figsize=(10, 6), layout=\"constrained\")\n    ax.plot(x, y, linewidth=2)\n    ax.set(title=\"Sales by Quarter (FY2024)\",\n            xlabel=\"Quarter\",\n            ylabel=\"Revenue ($K)\")\n    # Title aligned with data area, not figure\n    ax.set_title(\"Sales by Quarter\", loc=\"left\", pad=10)\n#\n# Decision rule:\n#   single chart, three labels         -> ax.set_title / set_xlabel / set_ylabel\n#   set many labels at once            -> ax.set(title=, xlabel=, ylabel=, xlim=)\n#   common publication look            -> remove top/right spines + grid alpha=0.3\n#   align title to data start          -> ax.set_title(..., loc=\"left\")\n#   needs space below title            -> ax.set_title(..., pad=10)\n#   global font/spines override        -> with plt.rc_context({...}):\n#   axis-only grid (bar charts)        -> ax.grid(True, axis=\"y\", ls=\"--\", alpha=0.5)\n#   suptitle across subplots           -> fig.suptitle, NOT ax.set_title\n#\n# Anti-pattern: calling ax.set_xticklabels([...]) WITHOUT first calling ax.set_xticks([...]).\n#   The labels are written at whatever default tick positions matplotlib chose — often the\n#   wrong cells or shifted off-by-one. Recent matplotlib raises a UserWarning here. Always\n#   pair them: ax.set_xticks([1, 2, 3]); ax.set_xticklabels([\"A\", \"B\", \"C\"]). For\n#   categorical bar charts, prefer passing string x values directly to ax.bar."
                  }
        ],
        tips: [
                  "pad= in set_title() adds space between title and axes",
                  "ax.set(title=\"...\", xlabel=\"...\", ylabel=\"...\") sets multiple labels at once",
                  "tight_layout() or constrained_layout=True prevents label clipping",
                  "ax.spines[\"top\"].set_visible(False) removes chart borders for cleaner look"
        ],
        mistake: "Saving a figure before calling tight_layout() — axis labels often get cut off. Always call fig.tight_layout() or use plt.subplots(layout=\"constrained\").",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nax.set_title(\"Sales by Quarter\", fontsize=16, fontweight=\"bold\", pad=15)\nax.set_xlabel(\"Quarter\", fontsize=12)\nax.set_ylabel(\"Revenue ($K)\", fontsize=12)",
          concise: "ax.axvline(x=0, color=\"black\", linewidth=0.5)",
        },
      },
      {
        id: "annotate",
        fn: "ax.annotate()",
        desc: "Add text with an optional arrow pointing to a data point.",
        category: "Styling",
        subtitle: "Call out key features — arrow from label to data coordinate",
        signature: "ax.annotate(text, xy=(x,y), xytext=(xt,yt), arrowprops={})",
        descLong: "ax.annotate() draws text with an optional arrow. xy is the point being annotated; xytext is where the text appears. Use transform=ax.transAxes for position relative to the axes (0-1 range) so the annotation stays fixed regardless of data range.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.annotate() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             xy = the point; xytext = where the text sits.\n#             text) or curved arrows.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y)\nax.annotate(\"Peak\", xy=(peak_x, peak_y),\n             xytext=(peak_x + 1, peak_y + 5),\n             arrowprops=dict(arrowstyle=\"->\"))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.annotate() — common patterns you'll see in production.\n# APPROACH  - Combine ax.annotate() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             via connectionstyle, axes-fraction text via\n#             transform=ax.transAxes (stays put when axes\n#             zoom), and bbox-styled labels.\n#             stats boxes; curved arrows avoid overlap.\n#             library) or annotation-arrow styles — senior.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y)\n# Curved arrow\nax.annotate(\"Minimum\",\n            xy=(min_x, min_y),\n            xytext=(min_x - 2, min_y + 10),\n            arrowprops=dict(arrowstyle=\"->\",\n                              connectionstyle=\"arc3,rad=0.3\",\n                              color=\"red\"))\n# Stats box pinned in axes fraction (0..1)\nax.text(0.05, 0.95, \"n = 150\",\n         transform=ax.transAxes, va=\"top\",\n         bbox=dict(boxstyle=\"round\", facecolor=\"white\", alpha=0.8))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.annotate() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             3-5 points by hand (use adjustText for many);\n#             attach metadata directly to the data point;\n#             use figure-fraction transforms for figure-wide\n#             labels (e.g. attribution at bottom).\n#             fraction transforms keep elements in fixed\n#             positions across all subplots.\n#             fraction means thinking about figure space\n#             rather than data space.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots(figsize=(10, 6), layout=\"constrained\")\nax.plot(x, y)\n# Limit to 3-5 hand-placed annotations\nhot_points = [(t, v) for t, v in zip(x, y) if v > threshold][:3]\nfor t, v in hot_points:\n    ax.annotate(f\"{v:,.0f}\",\n                xy=(t, v),\n                xytext=(0, 8), textcoords=\"offset points\",\n                ha=\"center\", fontsize=9)\n# Figure-fraction text — survives subplot changes\nfig.text(0.99, 0.01, \"Source: company internal\",\n          ha=\"right\", va=\"bottom\", fontsize=8, color=\"gray\")\n# For dense labeling, reach for adjustText\n# from adjustText import adjust_text\n# texts = [ax.text(t, v, f\"{v}\") for t, v in zip(x, y)]\n# adjust_text(texts, ax=ax)\n#\n# Decision rule:\n#   call out 1-3 specific points        -> ax.annotate(text, xy=, xytext=, arrowprops=)\n#   small offset label, no arrow        -> annotate(..., textcoords=\"offset points\")\n#   stats box (\"n=150\") in corner       -> ax.text(..., transform=ax.transAxes)\n#   figure-wide note/source             -> fig.text(0.99, 0.01, \"Source: ...\")\n#   curved arrow to avoid clutter       -> arrowprops with connectionstyle=\"arc3,rad=0.3\"\n#   labeled background bbox             -> bbox=dict(boxstyle=\"round\", facecolor=\"white\")\n#   many overlapping labels (>5)        -> from adjustText import adjust_text\n#   axes-fraction position              -> transform=ax.transAxes (0..1, not data coords)\n#\n# Anti-pattern: looping over every data point with ax.annotate to label them all.\n#   The labels stack on top of each other and the chart becomes a black blob. Limit\n#   manual annotation to 3-5 hot points (peaks, anomalies, outliers). For dense labeling\n#   reach for the adjustText library, or switch to a hover-tooltip backend (mpld3,\n#   plotly) where labels are interactive."
                  }
        ],
        tips: [
                  "transform=ax.transAxes positions text 0-1 relative to axes — stays fixed when axis limits change",
                  "connectionstyle=\"arc3,rad=0.3\" creates a curved arrow — avoids overlap with other elements",
                  "arrowstyle=\"->\" is standard; \"fancy\" is filled triangle; \"simple\" is plain line",
                  "bbox=dict(boxstyle=\"round\", facecolor=\"white\") adds a background box behind the text"
        ],
        mistake: "Annotating many points in a loop and getting overlapping labels. Only annotate 3-5 key points, or use the adjustText library for automatic positioning.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y)\nax.annotate(",
          concise: ")",
        },
      },
      {
        id: "legend",
        fn: "ax.legend()",
        desc: "Add a legend identifying each plotted element.",
        category: "Styling",
        subtitle: "Automatic from labels, or explicit with handles and labels",
        signature: "ax.legend(loc=\"best\", title=\"\", framealpha=0.8)",
        descLong: "legend() creates a legend from the label= arguments passed to each plot call. loc= controls placement. For full control over which elements appear, pass handles and labels explicitly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ax.legend() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Without labels the legend is empty.\n#             explicit handles.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y1, label=\"Train\")\nax.plot(x, y2, label=\"Val\")\nax.legend()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ax.legend() — common patterns you'll see in production.\n# APPROACH  - Combine ax.legend() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             ncols for compact wide legends, framealpha for\n#             transparency, bbox_to_anchor for outside-the-\n#             axes placement.\n#             real charts need.\n#             legends from twin axes — senior.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y1, label=\"Train\")\nax.plot(x, y2, label=\"Val\")\n# Auto-placement (loc=\"best\"); explicit places also work\nax.legend(loc=\"best\")\n# Multi-column compact legend, with title\nax.legend(title=\"Model\", ncols=2, fontsize=9, framealpha=0.85)\n# Outside the axes — combine with constrained_layout to avoid clipping\nax.legend(loc=\"upper left\", bbox_to_anchor=(1.02, 1.0),\n           borderaxespad=0)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ax.legend() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             when matplotlib's auto-detection fails (custom\n#             markers, fill_between bands, scatter\n#             collections); combine handles from twin axes;\n#             reach for proxy artists for legend-only items.\n#             fill_between band or a non-plotted reference;\n#             twin-axis handle merging is the standard pain\n#             point fixed properly.\n#             handle assembly is verbose for many series.\n#\nimport matplotlib.pyplot as plt\nfrom matplotlib.lines import Line2D\nfrom matplotlib.patches import Patch\nfig, ax = plt.subplots()\nax.plot(x, mean, color=\"C0\")\nax.fill_between(x, lower, upper, alpha=0.3, color=\"C0\")\n# Explicit handles — line + band proxy\nhandles = [\n    Line2D([0], [0], color=\"C0\", label=\"forecast\"),\n    Patch(facecolor=\"C0\", alpha=0.3, label=\"95% CI\"),\n]\nax.legend(handles=handles)\n# Twin-axis combined legend\nfig2, ax1 = plt.subplots()\nax2 = ax1.twinx()\nl1 = ax1.plot(x, y1, label=\"Revenue\")\nl2 = ax2.plot(x, y2, label=\"Margin\", linestyle=\"--\")\nax1.legend(l1 + l2, [h.get_label() for h in l1 + l2],\n            loc=\"upper left\")\n#\n# Decision rule:\n#   simple multi-line/bar chart        -> label= on each call + ax.legend()\n#   legend covers data                 -> ax.legend(loc=\"best\") (auto-scan)\n#   tight axes, no room inside         -> bbox_to_anchor=(1.02, 1) + constrained_layout\n#   long legend, save vertical room    -> ax.legend(ncols=2, fontsize=9)\n#   fill_between or proxy artist       -> handles=[Line2D(...), Patch(...)]\n#   twin-axis combined legend          -> gather get_legend_handles_labels from both\n#   one shared legend across subplots  -> fig.legend(handles=[...], loc=\"lower center\")\n#   suppress duplicates                -> dict.fromkeys on handle labels\n#\n# Anti-pattern: calling ax.legend() with no label= on any plot call. The call returns\n#   silently (and with a UserWarning) — you get a tiny empty box or nothing. Always\n#   pass label=\"...\" on each plot/bar/scatter call BEFORE calling ax.legend(). Same\n#   trap with two ax.legend() calls in the same axes — only the second one survives\n#   (the first is replaced); use a single legend with combined handles instead."
                  }
        ],
        tips: [
                  "`loc=\"best\"` avoids most overlap — let matplotlib find the best position",
                  "`bbox_to_anchor=(1.01, 1)` places the legend just outside the right edge — prevents overlap with data",
                  "`ncols=2` splits a long legend into two columns — keeps it compact",
                  "Always set `label=` on each plot call — it is cheaper than manually building handles later"
        ],
        mistake: "Calling `ax.legend()` without any `label=` arguments in the plot calls. The legend appears but is empty. Add `label=\"name\"` to each `ax.plot()`, `ax.bar()`, etc.",
        shorthand: {
          verbose: "        import matplotlib.pyplot as plt\nfig, ax1 = plt.subplots(figsize=(10, 5))\nx = range(12)\nrevenue = [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30]\nmargin  = [0.15, 0.18, 0.12, 0.20, 0.22, 0.25, 0.28, 0.24, 0.21, 0.26, 0.30, 0.32]",
          concise: "plt.show()",
        },
      },
      {
        id: "tick-formatting",
        fn: "Tick formatting",
        desc: "Control tick positions, labels, rotation, and number formatting.",
        category: "Styling",
        subtitle: "Custom ticks, rotated labels, date formatting, log scale",
        signature: "ax.set_xticks([]) | ax.xaxis.set_major_formatter() | ax.set_xscale(\"log\")",
        descLong: "Matplotlib tick control covers positions (set_xticks), labels (set_xticklabels), rotation (tick_params), number formatting (FuncFormatter), and date formatting (DateFormatter). Log scales are applied with set_xscale/set_yscale.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Tick formatting — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Rotate labels to prevent overlap.\n#             date axis.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([1, 2, 3, 4], [10, 20, 15, 30])\nax.set_xticks([1, 2, 3, 4])\nax.set_xticklabels([\"Q1\", \"Q2\", \"Q3\", \"Q4\"])\nax.tick_params(axis=\"x\", rotation=45)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Tick formatting — common patterns you'll see in production.\n# APPROACH  - Combine Tick formatting with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             ($1,000, 12.3%), log scale, date formatters\n#             with locators.\n#             percentages, log axes, date ticks.\n#             auto-rotation — senior tier.\n#\nimport matplotlib.pyplot as plt\nimport matplotlib.ticker as mtick\nfrom matplotlib.dates import DateFormatter, MonthLocator\nfig, axes = plt.subplots(2, 2, figsize=(12, 8))\n# Currency formatter\naxes[0, 0].plot(x, y)\naxes[0, 0].yaxis.set_major_formatter(\n    mtick.FuncFormatter(lambda v, _: f\"${v:,.0f}\"))\n# Percent formatter\naxes[0, 1].plot(x, ratios)\naxes[0, 1].yaxis.set_major_formatter(\n    mtick.PercentFormatter(xmax=1, decimals=0))\n# Log scale — when data spans orders of magnitude\naxes[1, 0].plot([1, 10, 100, 1000], [1, 2, 3, 4])\naxes[1, 0].set_xscale(\"log\")\n# Date formatting on time-series x-axis\naxes[1, 1].plot(dates, values)\naxes[1, 1].xaxis.set_major_formatter(DateFormatter(\"%b %Y\"))\naxes[1, 1].xaxis.set_major_locator(MonthLocator(interval=3))\nplt.setp(axes[1, 1].get_xticklabels(), rotation=30, ha=\"right\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Tick formatting — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             AutoDateLocator for sensible defaults across\n#             zoom levels, EngFormatter for engineering\n#             notation (k/M/G), and ConciseDateFormatter\n#             that avoids redundant year/month repetition.\n#             notation reads cleanly for big numbers;\n#             ConciseDateFormatter is the modern best-default\n#             for time series.\n#             surprising on short ranges; EngFormatter rounds\n#             to fixed precision (override with places=).\n#\nimport matplotlib.pyplot as plt\nimport matplotlib.ticker as mtick\nfrom matplotlib.dates import AutoDateLocator, ConciseDateFormatter\nfig, ax = plt.subplots()\n# 1. Engineering notation (k, M, G) — much cleaner than $1,234,567\nax.yaxis.set_major_formatter(mtick.EngFormatter(unit=\"$\"))\n# 2. Auto date locator + concise formatter (modern default)\nloc = AutoDateLocator()\nax.xaxis.set_major_locator(loc)\nax.xaxis.set_major_formatter(ConciseDateFormatter(loc))\n# ConciseDateFormatter avoids \"2024 Jan, 2024 Feb, 2024 Mar...\" repetition\n# 3. Custom formatter callable\ndef thousands(v, _):\n    if abs(v) >= 1e6: return f\"{v/1e6:.1f}M\"\n    if abs(v) >= 1e3: return f\"{v/1e3:.0f}K\"\n    return f\"{v:.0f}\"\nax.yaxis.set_major_formatter(mtick.FuncFormatter(thousands))\n# 4. Pick a formatter by data type.\n#\n# Decision rule:\n#   currency / percent              -> FuncFormatter or PercentFormatter\n#   big numbers (M, B)              -> EngFormatter or custom callable\n#   time series (any range)         -> AutoDateLocator + ConciseDateFormatter\n#   log span                        -> ax.set_xscale(\"log\") then default ticks\n#   categorical x                   -> set_xticks + set_xticklabels (paired)\n#   too many ticks                  -> ax.locator_params(nbins=N) or MaxNLocator\n#   rotate without overlap          -> tick_params(rotation=30) + ha=\"right\"\n#   minor ticks for fine grid       -> ax.minorticks_on() + ax.grid(which=\"minor\")\n#\n# Anti-pattern: setting ax.set_xticklabels([\"A\", \"B\", \"C\"]) without calling\n#   ax.set_xticks([0, 1, 2]) first. The labels attach to whatever default ticks\n#   matplotlib chose during autoscaling, so labels can shift, repeat, or fall off\n#   the axis (and recent versions raise a UserWarning). Always pair them, or use a\n#   FixedLocator + FixedFormatter, or pass string x values directly to ax.bar/plot\n#   so matplotlib handles the categorical mapping."
                  }
        ],
        tips: [
                  "`plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha=\"right\")` rotates labels cleanly",
                  "`ticker.FuncFormatter(lambda x, p: f\"${x:,.0f}\")` is the most flexible number formatter",
                  "`ax.set_xscale(\"log\")` applies log scale — use when data spans multiple orders of magnitude",
                  "`DateFormatter(\"%b %Y\")` formats datetime ticks as \"Jan 2024\" — pair with `MonthLocator`"
        ],
        mistake: "Setting `ax.set_xticklabels([...])` without first calling `ax.set_xticks([...])`. Without matching tick positions, the labels are assigned to default tick positions which may not be what you want.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "colormaps",
        fn: "Colormaps",
        desc: "Apply color gradients to encode a third numeric dimension.",
        category: "Styling",
        subtitle: "Perceptually uniform: viridis, plasma, cividis — avoid jet/rainbow",
        signature: "ax.scatter(x, y, c=values, cmap=\"viridis\") | plt.cm.get_cmap()",
        descLong: "Colormaps map numeric values to colors. Perceptually uniform colormaps (viridis, plasma, magma, cividis) are readable for colorblind users and convert correctly to greyscale. Diverging colormaps (RdBu, coolwarm) are best for data centered at zero.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Colormaps — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             array, cmap= a colormap name.\n#             default that works for everyone (including\n#             colorblind viewers).\n#             qualitative — junior.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nsc = ax.scatter(x, y, c=values, cmap=\"viridis\")\nfig.colorbar(sc, ax=ax)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Colormaps — common patterns you'll see in production.\n# APPROACH  - Combine Colormaps with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             sequential (viridis) for unsigned, diverging\n#             (RdBu_r) for ± centered at zero, qualitative\n#             (tab10) for discrete categories.\n#             misuse; vmin/vmax centering on diverging\n#             colormaps makes \"0 = white\" honest.\n#             colorblind-safe rules — senior tier.\n#\nimport matplotlib.pyplot as plt\nfig, axes = plt.subplots(1, 3, figsize=(15, 4))\n# Sequential — unsigned continuous data\nsc = axes[0].scatter(x, y, c=values, cmap=\"viridis\")\nplt.colorbar(sc, ax=axes[0], label=\"value\")\naxes[0].set_title(\"viridis (sequential)\")\n# Diverging — signed data, centered at zero\nlimit = max(abs(diff.min()), abs(diff.max()))\nsc2 = axes[1].scatter(x, y, c=diff,\n                       cmap=\"RdBu_r\", vmin=-limit, vmax=limit)\nplt.colorbar(sc2, ax=axes[1], label=\"diff\")\naxes[1].set_title(\"RdBu_r (diverging)\")\n# Qualitative — discrete categories\ncmap = plt.colormaps[\"tab10\"].resampled(5)\nfor i, cat in enumerate([\"A\", \"B\", \"C\", \"D\", \"E\"]):\n    axes[2].scatter(xs[i], ys[i], color=cmap(i), label=cat)\naxes[2].legend()\naxes[2].set_title(\"tab10 (qualitative)\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Colormaps — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             uniform AND colorblind-safe (viridis, cividis,\n#             plasma); use Normalize/LogNorm/TwoSlopeNorm for\n#             non-linear data; build a custom colormap when\n#             stakeholders demand brand colors.\n#             data correctly without contorting the colormap;\n#             custom cmaps allow brand-aligned charts that\n#             still print in greyscale.\n#             with mismatched bounds can mislead; custom\n#             colormaps need testing in greyscale.\n#\nimport matplotlib.pyplot as plt\nimport matplotlib.colors as mcolors\nimport numpy as np\n# 1. Log-scale color encoding for skewed data\nfig, ax = plt.subplots()\nsc = ax.scatter(x, y, c=values,\n                 norm=mcolors.LogNorm(vmin=1, vmax=values.max()),\n                 cmap=\"viridis\")\nfig.colorbar(sc, ax=ax)\n# 2. Asymmetric diverging — TwoSlopeNorm anchors zero\nfig2, ax2 = plt.subplots()\nsc2 = ax2.scatter(x, y, c=signed,\n                   norm=mcolors.TwoSlopeNorm(vmin=signed.min(),\n                                               vcenter=0,\n                                               vmax=signed.max()),\n                   cmap=\"RdBu_r\")\n# 3. Custom brand colormap (test in greyscale!)\nbrand = mcolors.LinearSegmentedColormap.from_list(\n    \"brand\", [\"#ffffff\", \"#5a9bd4\", \"#1f4068\"])\n# Standing rules:\n#   - viridis / plasma / magma / cividis: safe perceptual sequential defaults\n#   - RdBu_r / coolwarm: signed/diverging — always centered with vmin=-vmax or TwoSlopeNorm\n#   - tab10 / tab20 / Set2: discrete categorical\n#   - NEVER use: jet / rainbow / hsv (not perceptually uniform)\n#\n# Decision rule:\n#   sequential, all positive            -> \"viridis\", \"plasma\", \"magma\", \"cividis\"\n#   diverging, signed (+/-)             -> \"RdBu_r\" or \"coolwarm\" with vmin=-vmax\n#   skewed positive data                -> norm=LogNorm(vmin=, vmax=)\n#   asymmetric divergent (e.g. -1..5)   -> norm=TwoSlopeNorm(vcenter=0)\n#   discrete categories                 -> \"tab10\" / \"Set2\" / BoundaryNorm\n#   cyclic (angles, phase)              -> \"twilight\", \"hsv\"\n#   colorblind-safe priority            -> cividis (safest), viridis (very safe)\n#   brand colors                        -> LinearSegmentedColormap.from_list\n#\n# Anti-pattern: using \"jet\" or \"rainbow\" because they're \"colorful\". They are NOT\n#   perceptually uniform — yellow stripes look like local maxima, and the brightness\n#   curve dips and peaks across the range, fabricating features that aren't in the data.\n#   Worse: they fail in greyscale and for colorblind viewers. Default to viridis; reach\n#   for jet only when matching legacy publications, never for new analysis."
                  }
        ],
        tips: [
                  "Use `viridis` as your default sequential colormap — perceptually uniform and colorblind-safe",
                  "Add `_r` suffix to reverse any colormap: `\"viridis_r\"`, `\"RdBu_r\"`",
                  "Set `vmin` and `vmax` on diverging maps to center at zero: `vmin=-max_abs, vmax=max_abs`",
                  "`plt.cm.get_cmap(\"tab10\", n)` creates a discrete colormap with exactly n colors"
        ],
        mistake: "Using the `jet` or `rainbow` colormap. They are not perceptually uniform — small value differences in the middle look larger than large differences at the edges. Use `viridis` instead.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "colorbar",
        fn: "fig.colorbar()",
        desc: "Add a color scale legend to a plot using a colormap.",
        category: "Styling",
        subtitle: "Required when color encodes a continuous variable",
        signature: "plt.colorbar(mappable, ax=ax, label=\"\", orientation=\"vertical\")",
        descLong: "A colorbar explains what the colors in a plot mean. Required whenever you use a colormap to encode a continuous variable — scatter with c=, imshow, contour, pcolormesh. Always label it with what the colors represent.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of fig.colorbar() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             imshow, pass it to fig.colorbar with ax=.\n#             data.\n#             discrete colorbars.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nsc = ax.scatter(x, y, c=values, cmap=\"viridis\")\nfig.colorbar(sc, ax=ax)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of fig.colorbar() — common patterns you'll see in production.\n# APPROACH  - Combine fig.colorbar() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             with what the colors mean; orientation and\n#             shrink for layout control; explicit ax= when\n#             multiple subplots exist.\n#             non-negotiable for honest charts.\n#             or shared colorbars across subplots — senior.\n#\nimport matplotlib.pyplot as plt\nfig, axes = plt.subplots(1, 2, figsize=(12, 5))\nsc = axes[0].scatter(x, y, c=temperature, cmap=\"plasma\")\ncbar = fig.colorbar(sc, ax=axes[0])\ncbar.set_label(\"Temperature (°C)\")\nim = axes[1].imshow(corr, cmap=\"RdBu_r\", vmin=-1, vmax=1)\ncbar2 = fig.colorbar(im, ax=axes[1])\ncbar2.set_label(\"Correlation\")\n# Layout knobs\nfig.colorbar(sc, ax=axes[0],\n              orientation=\"horizontal\",\n              shrink=0.8, pad=0.04,\n              label=\"Value\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of fig.colorbar() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             colorbars via BoundaryNorm + tick centering;\n#             one shared colorbar across many subplots; pin\n#             extend= when data may exceed vmin/vmax.\n#             classification/categorical scatter; one shared\n#             bar saves space and makes panels comparable;\n#             extend= flags out-of-range values honestly.\n#             on bin midpoints); shared colorbars require\n#             passing the whole axes list to ax=.\n#\nimport matplotlib.pyplot as plt\nimport matplotlib.colors as mcolors\nimport numpy as np\n# 1. One colorbar shared across many subplots\nfig, axes = plt.subplots(2, 2, figsize=(10, 8),\n                          layout=\"constrained\")\ndata = [np.random.randn(8, 8) for _ in range(4)]\nlimit = max(np.abs(d).max() for d in data)\nims = [ax.imshow(d, cmap=\"RdBu_r\", vmin=-limit, vmax=limit)\n       for ax, d in zip(axes.flat, data)]\nfig.colorbar(ims[0], ax=axes, label=\"value\", shrink=0.8)\n# 2. Discrete colorbar with centered ticks\nfig2, ax = plt.subplots()\ncmap = plt.colormaps[\"tab10\"].resampled(5)\nnorm = mcolors.BoundaryNorm(boundaries=np.arange(6) - 0.5, ncolors=5)\nsc = ax.scatter(x, y, c=labels, cmap=cmap, norm=norm)\ncbar = fig2.colorbar(sc, ax=ax, ticks=range(5))\ncbar.ax.set_yticklabels([\"A\", \"B\", \"C\", \"D\", \"E\"])\ncbar.set_label(\"Category\")\n# 3. extend= flags out-of-range data\nfig3, ax3 = plt.subplots()\nsc3 = ax3.scatter(x, y, c=values, cmap=\"viridis\", vmin=0, vmax=100)\nfig3.colorbar(sc3, ax=ax3, extend=\"both\",          # arrows on either end\n               label=\"score (0-100)\")\n#\n# Decision rule:\n#   single mappable, single ax          -> fig.colorbar(mappable, ax=ax)\n#   shared bar across grid              -> fig.colorbar(im, ax=axes, shrink=0.8)\n#   horizontal bar at bottom            -> orientation=\"horizontal\", shrink=0.8\n#   discrete categorical                -> BoundaryNorm + ticks=range(n) + set_yticklabels\n#   data may exceed vmin/vmax           -> extend=\"both\" (or \"min\"/\"max\") for arrows\n#   thin bar next to tall axes          -> shrink=0.8, pad=0.04\n#   external axes (precise placement)   -> cax=fig.add_axes([l, b, w, h])\n#   need percent / currency labels      -> cbar.ax.yaxis.set_major_formatter(...)\n#\n# Anti-pattern: omitting cbar.set_label(\"...\") so readers see a colored strip with\n#   numbers but no clue what the colors mean. A colorbar without a label is dishonest —\n#   you've removed the encoding key. Equally common: calling plt.colorbar() without\n#   ax= in a multi-subplot figure, which attaches the bar to the most recently active\n#   axes (often the wrong one) and can resize that subplot."
                  }
        ],
        tips: [
                  "Always label the colorbar — `cbar.set_label(\"what this represents\")` is non-optional",
                  "`shrink=0.8` on a tall figure keeps the colorbar height proportional to the axes",
                  "`vmin` and `vmax` on the plot call and the colorbar stay in sync automatically",
                  "For diverging colormaps, set `vmin=-abs_max, vmax=abs_max` to center at zero"
        ],
        mistake: "Calling `plt.colorbar()` without the `ax=` argument in a multi-subplot figure. It attaches to the current active axes which may not be the one you want.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nfig, axes = plt.subplots(1, 2, figsize=(12, 5))\nsc = axes[0].scatter(x, y, c=temperature, cmap='plasma',\ns=50, alpha=0.7)",
          concise: "plt.colorbar(sm, ax=ax, label='Category')",
        },
      },
      {
        id: "savefig",
        fn: "plt.savefig()",
        desc: "Save a figure to a file.",
        category: "Styling",
        subtitle: "Always bbox_inches=\"tight\" — prevents clipped labels",
        signature: "plt.savefig(\"file.png\", dpi=150, bbox_inches=\"tight\")",
        descLong: "savefig() writes the figure to disk. bbox_inches=\"tight\" is critical — without it, axis labels and titles are often cut off at the figure boundary. Call before plt.show() or plt.close().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of plt.savefig() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             labels aren't clipped. Save BEFORE plt.show().\n#             complaint.\n#             raster.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y); ax.set_title(\"My plot\")\nfig.savefig(\"plot.png\", dpi=150, bbox_inches=\"tight\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of plt.savefig() — common patterns you'll see in production.\n# APPROACH  - Combine plt.savefig() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             vector formats (PDF/SVG) for publication,\n#             transparent background, the \"save in a loop\"\n#             gotcha (always plt.close).\n#             plt.close in loops is THE memory leak fix.\n#             notebook-vs-savefig DPI mismatches — senior.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot(x, y); ax.set_title(\"My plot\")\n# Raster — pixel-based\nfig.savefig(\"plot.png\", dpi=150, bbox_inches=\"tight\")     # web / slide\nfig.savefig(\"plot_print.png\", dpi=300, bbox_inches=\"tight\")  # print\n# Vector — scalable, publication\nfig.savefig(\"plot.pdf\", bbox_inches=\"tight\")\nfig.savefig(\"plot.svg\", bbox_inches=\"tight\")\n# Transparent background (blends into any slide)\nfig.savefig(\"plot.png\", transparent=True, bbox_inches=\"tight\")\n# In a loop — close after saving or memory leaks\nfor name, group in df.groupby(\"category\"):\n    fig, ax = plt.subplots()\n    ax.hist(group[\"value\"])\n    fig.savefig(f\"{name}.png\", dpi=150, bbox_inches=\"tight\")\n    plt.close(fig)                                         # free memory"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of plt.savefig() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             from save DPI; pad_inches for explicit margin\n#             control; fig.savefig over plt.savefig in\n#             scripts; deterministic font embedding for\n#             reproducible PDFs.\n#             readable but exports crisp; explicit pad_inches\n#             beats bbox_inches=tight when the layout must\n#             be exact; font embedding makes PDFs portable.\n#             requires knowing your printer/slide dims.\n#\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots(figsize=(10, 6))\nax.plot(x, y); ax.set_title(\"My plot\")\n# 1. Save at higher DPI than display, with explicit margins\nfig.savefig(\n    \"plot.png\",\n    dpi=300,                    # save crisp\n    bbox_inches=\"tight\",\n    pad_inches=0.1,             # explicit small margin\n    facecolor=\"white\",          # in case rcParams set it transparent\n)\n# 2. PDF with embedded fonts (deterministic across machines)\nplt.rcParams[\"pdf.fonttype\"] = 42      # TrueType, NOT Type 3\nplt.rcParams[\"ps.fonttype\"]  = 42\nfig.savefig(\"plot.pdf\", bbox_inches=\"tight\")\n# 3. In production scripts ALWAYS use fig.savefig (not plt.*)\ndef export_panel(fig, name: str, *, dpi: int = 300) -> None:\n    fig.savefig(f\"out/{name}.png\", dpi=dpi, bbox_inches=\"tight\")\n    fig.savefig(f\"out/{name}.pdf\", bbox_inches=\"tight\")\n    plt.close(fig)              # free even after success\n# Anti-pattern: plt.show() before plt.savefig()\n#   plt.show() clears the figure on some backends -> save is BLANK\n# Right: save first, show last.\n#\n# Decision rule:\n#   web / blog / Slack screenshot    -> PNG, dpi=150, bbox_inches=\"tight\"\n#   slide deck                       -> PNG, dpi=200 or PDF (vector)\n#   print / journal                  -> PDF or SVG, bbox_inches=\"tight\", fonttype=42\n#   need transparent background      -> savefig(..., transparent=True)\n#   batch export in a loop           -> fig.savefig(...) + plt.close(fig)\n#   exact margin control             -> bbox_inches=\"tight\" + pad_inches=0.1\n#   reproducible PDF text            -> rcParams[\"pdf.fonttype\"] = 42 (TrueType)\n#   greyscale-safe                   -> use viridis / cividis + check the print proof"
                  }
        ],
        tips: [
                  "`bbox_inches=\"tight\"` is almost always needed — prevents axis labels being cut off",
                  "`plt.close(fig)` after saving in a loop is critical — unclosed figures accumulate in memory",
                  "PDF and SVG are vector formats — they scale to any size without pixelation",
                  "`dpi=150` for web/presentations; `dpi=300` for print/journals"
        ],
        mistake: "Calling `plt.show()` before `plt.savefig()`. After `show()`, the figure is cleared and `savefig()` saves a blank figure. Always save before showing.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    result.append(x * 2)",
          concise: "result = [x * 2 for x in items]",
        },
      },
      {
        id: "styles",
        fn: "Styles & Themes",
        desc: "Apply pre-built styles and colormaps.",
        category: "Styling",
        subtitle: "Change the visual theme of all plots",
        signature: "plt.style.use(\"style_name\")",
        descLong: "Matplotlib comes with built-in styles that transform the default appearance. Apply a style once at the start of your script to affect all subsequent plots.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Styles & Themes — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             notebook. All subsequent plots use it.\n#             (scoped) or rcParams overrides.\n#\nimport matplotlib.pyplot as plt\nplt.style.use(\"seaborn-v0_8-whitegrid\")\nfig, ax = plt.subplots()\nax.plot(x, y)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Styles & Themes — common patterns you'll see in production.\n# APPROACH  - Combine Styles & Themes with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             styles, apply one globally, scope a different\n#             style with plt.style.context, override\n#             specific rcParams.\n#             pick a base, tweak a few rcParams.\n#             figure rc_context — senior tier.\n#\nimport matplotlib.pyplot as plt\n# See what's available\nprint(plt.style.available)\n# Pick a base style globally\nplt.style.use(\"ggplot\")                # R-like\n# plt.style.use(\"dark_background\")    # dark theme\n# plt.style.use(\"bmh\")                 # Bayesian-methods style\n# Scope a one-off different style\nwith plt.style.context(\"dark_background\"):\n    fig, ax = plt.subplots()\n    ax.plot(x, y)\n# Tweak specific defaults\nplt.rcParams.update({\n    \"figure.figsize\":   (10, 6),\n    \"font.size\":        12,\n    \"axes.spines.top\":   False,\n    \"axes.spines.right\": False,\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Styles & Themes — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             file in your repo; use plt.rc_context for\n#             per-figure overrides (no global mutation);\n#             separate \"house style\" (for everyone) from\n#             \"this chart\" tweaks (one figure).\n#             and applied identically across machines;\n#             rc_context avoids bleeding state between cells.\n#             ownership; rc_context is verbose for a single\n#             tweak.\n#\nimport matplotlib.pyplot as plt\n# 1. Custom .mplstyle file in your repo\n# my_house.mplstyle:\n#   axes.spines.top:    False\n#   axes.spines.right:  False\n#   axes.titlesize:     14\n#   axes.titleweight:   bold\n#   font.family:        serif\nplt.style.use(\"./my_house.mplstyle\")\n# 2. Per-figure overrides — no global side effects\nwith plt.rc_context({\"axes.grid\": True, \"grid.alpha\": 0.3}):\n    fig, ax = plt.subplots()\n    ax.plot(x, y)\n# 3. Combine: base style + scoped tweaks\nwith plt.style.context([\"./my_house.mplstyle\",\n                         {\"figure.figsize\": (12, 7)}]):\n    fig, ax = plt.subplots()\n    ax.plot(x, y)\n    fig.savefig(\"plot.png\", dpi=300, bbox_inches=\"tight\")\n# Anti-pattern: plt.style.use() inside a function\n#   def make_plot(...): plt.style.use(\"dark_background\")\n#   This MUTATES global state for every subsequent caller.\n# Right: use plt.style.context(...) (with-statement) instead.\n#\n# Decision rule:\n#   project-wide house style          -> plt.style.use(\"./my_house.mplstyle\")\n#   one notebook session              -> plt.style.use(\"seaborn-v0_8-whitegrid\")\n#   single chart different style      -> with plt.style.context(\"dark_background\"):\n#   tweak a few rcParams              -> with plt.rc_context({\"axes.grid\": True}):\n#   stack base + overrides            -> plt.style.context([base, {overrides}])\n#   publication-ready clean look      -> remove top/right spines + grid alpha=0.3\n#   dark theme for slides             -> plt.style.use(\"dark_background\")\n#   ggplot-like colors                -> plt.style.use(\"ggplot\")"
                  }
        ],
        tips: [
                  "Set plt.rcParams at the top of your notebook/script for consistent styling",
                  "\"seaborn-v0_8-whitegrid\" is a clean, publication-ready style",
                  "For publication: remove top and right spines with rcParams or ax.spines",
                  "Seaborn sets a nice default style on import: import seaborn as sns"
        ],
        mistake: "Calling plt.style.use() inside a function — it changes global state permanently. Call it once at the top of the script or use plt.style.context() for scoped changes.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nplt.style.use(\"seaborn-v0_8-whitegrid\")\nfig, ax = plt.subplots()",
          concise: "plt.rcParams.update({\"figure.figsize\": (10, 6)})",
        },
      },
    ],
  },
]

export default { meta, sections }
