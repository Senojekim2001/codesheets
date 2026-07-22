export const meta = {
  "title": "Seaborn",
  "domain": "python",
  "sheet": "seaborn",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: Distribution Plots ─────────────────────────────────────────
  {
    id: "distributions",
    title: "Distribution Plots",
    entries: [
      {
        id: "histplot",
        fn: "sns.histplot()",
        desc: "Plot the distribution of one or two variables as a histogram.",
        category: "Distribution",
        subtitle: "Modern histogram — replaces the deprecated sns.distplot()",
        signature: "sns.histplot(data, x=\"col\", hue=\"group\", kde=True, stat=\"count\")",
        descLong: "histplot() is the modern seaborn histogram (replaces the removed distplot). kde=True overlays a kernel density estimate. stat= controls the y-axis: \"count\", \"frequency\", \"density\", or \"percent\". hue= splits by a categorical variable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.histplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             density on the histogram. Pass data + x.\n#             line gets you a publication-ready histogram.\n#             or 2D heatmaps.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.histplot(data=df, x=\"total_bill\", kde=True)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.histplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.histplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             grouping, multiple= for layering policy,\n#             stat=\"density\" for fair cross-group\n#             comparison, bins= for resolution control.\n#             scaling is the single most useful flag for\n#             \"groups have different N\".\n#             — senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Group by sex; density-normalized so different N is fair\nsns.histplot(data=df, x=\"total_bill\", hue=\"sex\",\n              stat=\"density\", common_norm=False,\n              bins=20, kde=True, multiple=\"layer\")\n# Bin policy options:\n# multiple=\"layer\"  -> overlapping (use alpha)\n# multiple=\"dodge\"  -> side-by-side bars\n# multiple=\"stack\"  -> stacked\n# multiple=\"fill\"   -> proportions (per bin)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.histplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             Diaconis) for skewed data, common_norm=False\n#             to compare shapes across groups, 2D histplot\n#             for joint distributions, log_scale on heavy\n#             tails.\n#             outliers); 2D histplot reveals joint structure\n#             scatter hides; log_scale handles long tails\n#             without manual transforms.\n#             2D histplot needs enough data to fill bins;\n#             log_scale only handles positive values.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"tips\")\nfig, axes = plt.subplots(1, 3, figsize=(15, 4),\n                          layout=\"constrained\")\n# 1. Robust bin width on skewed data\nsns.histplot(data=df, x=\"total_bill\", bins=\"fd\",\n              ax=axes[0])\naxes[0].set_title(\"bins='fd' (robust)\")\n# 2. Group shapes — common_norm=False\nsns.histplot(data=df, x=\"total_bill\", hue=\"sex\",\n              stat=\"density\", common_norm=False,\n              kde=True, ax=axes[1])\naxes[1].set_title(\"density, separate norms\")\n# 3. 2D joint distribution\nsns.histplot(data=df, x=\"total_bill\", y=\"tip\",\n              bins=20, cmap=\"viridis\", cbar=True,\n              ax=axes[2])\naxes[2].set_title(\"2D histogram\")\n# Decision rule:\n#   single var, normal-ish        -> bins=auto\n#   single var, skewed/outliers   -> bins=\"fd\"\n#   compare groups (different N)  -> stat=\"density\", common_norm=False\n#   joint shape of two vars       -> 2D histplot or hexbin\n#   long-tailed positive data     -> log_scale=True\n#   reach for distplot            -> NEVER (removed in 0.14)\n#\n# Anti-pattern: comparing histograms of groups with very different sample sizes using default counts.\n#   Default stat=\"count\" makes the larger group look taller everywhere even when shapes\n#   are identical. Always set stat=\"density\" with common_norm=False so each group integrates\n#   to 1 independently — then bar heights reflect shape, not N."
                  }
        ],
        tips: [
                  "`kde=True` is the easiest way to add a smooth density curve on top of a histogram",
                  "`stat=\"density\"` normalizes to a probability density — makes groups with different n comparable",
                  "`multiple=\"fill\"` shows proportions within each bin — best for comparing across groups",
                  "`bins=\"auto\"` or `bins=\"fd\"` (Freedman-Diaconis) often gives better bin widths than a fixed number"
        ],
        mistake: "Using the deprecated `sns.distplot()`. It was deprecated in seaborn 0.11 and removed in 0.14. Use `sns.histplot(kde=True)` for the equivalent result.",
        shorthand: {
          verbose: "import seaborn as sns\nimport matplotlib.pyplot as plt\ndata = sns.load_dataset('tips')\nsns.histplot(data=data, x='total_bill', kde=True)",
          concise: "plt.ylabel('Cumulative Proportion')",
        },
      },
      {
        id: "kdeplot",
        fn: "sns.kdeplot()",
        desc: "Plot a smooth kernel density estimate of a distribution.",
        category: "Distribution",
        subtitle: "Smooth continuous density — 1D or 2D",
        signature: "sns.kdeplot(data, x=\"col\", hue=\"group\", fill=True)",
        descLong: "kdeplot() fits and plots a kernel density estimate — a smooth continuous version of a histogram. bw_adjust= controls smoothness. For 2D distributions, pass both x= and y= to get a contour plot.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.kdeplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             filled area under the curve.\n#             without bin-edge artifacts.\n#             control.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.kdeplot(data=df, x=\"total_bill\", fill=True)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.kdeplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.kdeplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             common_norm=False, 2D contour KDE, and\n#             overlay on a scatter plot.\n#             common joint-distribution diagnostic.\n#             multimodal data — senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Multiple distributions, separately normalized\nsns.kdeplot(data=df, x=\"total_bill\", hue=\"sex\",\n             fill=True, common_norm=False, alpha=0.4)\n# 2D KDE — contours of joint density\nsns.kdeplot(data=df, x=\"total_bill\", y=\"tip\",\n             fill=True, cmap=\"viridis\")\n# Overlay on scatter for raw + smooth\nax = sns.scatterplot(data=df, x=\"total_bill\", y=\"tip\",\n                      alpha=0.4)\nsns.kdeplot(data=df, x=\"total_bill\", y=\"tip\",\n             color=\"red\", levels=5, ax=ax)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.kdeplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (default oversmooths multimodal data); use\n#             cut=0 to clip the density at the data range\n#             (no impossible-value extrapolation); pair\n#             with rugplot for transparency.\n#             the \"negative bill\" extrapolation that\n#             confuses readers; rug overlay shows the actual\n#             data so KDE smoothness is honest.\n#             the curve at min/max which can hide tail\n#             behavior; rugplot adds visual clutter on big\n#             datasets.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"tips\")\nfig, axes = plt.subplots(1, 2, figsize=(12, 4),\n                          layout=\"constrained\")\n# 1. Bandwidth tuning — see substructure\nsns.kdeplot(data=df, x=\"total_bill\",\n             bw_adjust=0.5, fill=True, ax=axes[0])\naxes[0].set_title(\"bw_adjust=0.5 (rougher)\")\n# 2. cut=0 + rugplot — honest visual\nsns.kdeplot(data=df, x=\"total_bill\",\n             cut=0, fill=True, ax=axes[1])\nsns.rugplot(data=df, x=\"total_bill\",\n             height=0.05, alpha=0.4, ax=axes[1])\naxes[1].set_title(\"cut=0 + rug\")\n# Decision rule:\n#   smoothing dominates             -> bw_adjust < 1\n#   default looks fine              -> bw_adjust = 1\n#   honest tail behavior matters    -> cut=0 + rugplot\n#   compare groups (different N)    -> hue=, common_norm=False\n#   bounded data (>=0, percent)     -> cut=0 (don't extend past data)\n#   2D joint density                -> kdeplot(x=, y=) with fill=True\n#\n# Anti-pattern: trusting a default-bandwidth KDE on a multimodal distribution.\n#   The default bandwidth heuristic over-smooths and silently merges peaks. Always sweep\n#   bw_adjust over {0.5, 1.0, 1.5} and overlay a rugplot or histplot — if peaks appear/\n#   vanish across bandwidths, the KDE alone is lying. Reach for histplot to confirm."
                  }
        ],
        tips: [
                  "`bw_adjust=` is a multiplier on the automatic bandwidth — <1 rougher, >1 smoother",
                  "`fill=True` with `alpha=0.3` makes overlapping groups visible",
                  "2D kdeplot with `fill=True` and a sequential colormap shows density as color intensity",
                  "Pair with `sns.rugplot()` to show individual data points below the curve"
        ],
        mistake: "Using default bandwidth on a multimodal distribution — it may be over-smoothed and hide the multiple peaks. Use `bw_adjust=0.5` to reveal substructure.",
        shorthand: {
          verbose: "import seaborn as sns\nimport matplotlib.pyplot as plt\ndata = sns.load_dataset('tips')\nsns.kdeplot(data=data, x='total_bill', fill=True)",
          concise: "sns.kdeplot(data=data, x='total_bill', y='tip', color='red', levels=5)",
        },
      },
      {
        id: "ecdfplot",
        fn: "sns.ecdfplot()",
        desc: "Plot the empirical cumulative distribution function.",
        category: "Distribution",
        subtitle: "Shows what fraction of data is below each value — no binning needed",
        signature: "sns.ecdfplot(data, x=\"col\", hue=\"group\", stat=\"proportion\")",
        descLong: "ecdfplot() plots the empirical CDF — for each value x, it shows the proportion of observations less than or equal to x. Unlike histplot or kdeplot, the ECDF requires no binning or bandwidth choice. Excellent for comparing distributions across groups.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.ecdfplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             observations are <=x. No bins, no bandwidth.\n#             complementary form.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.ecdfplot(data=df, x=\"total_bill\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.ecdfplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.ecdfplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             comparison, complementary=True for survival\n#             curves, stat= options for percent vs count,\n#             rug overlay for the raw data.\n#             distributions visually — where curves cross,\n#             quantiles are equal.\n#             distance — senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Compare groups\nax = sns.ecdfplot(data=df, x=\"total_bill\", hue=\"sex\")\n# Add rug for raw points\nsns.rugplot(data=df, x=\"total_bill\", hue=\"sex\",\n             ax=ax, height=0.05, alpha=0.4)\n# Survival curve: P(X > x)\nsns.ecdfplot(data=df, x=\"total_bill\",\n              complementary=True)\n# Stat options\nsns.ecdfplot(data=df, x=\"total_bill\", stat=\"percent\")  # 0..100"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.ecdfplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             off the curve (median = horizontal line at\n#             0.5 intersects x at p50); compare two\n#             distributions with a vertical max-gap line\n#             (Kolmogorov-Smirnov visualization); use\n#             complementary=True for time-to-event /\n#             survival data.\n#             distributions\" matters; KS-style max-gap is\n#             the visual echo of the test statistic;\n#             survival curves are how reliability/churn\n#             analyses are read.\n#             non-statistician audiences; KS visualization\n#             requires marking the max-gap manually.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nimport numpy as np\ndf = sns.load_dataset(\"tips\")\nfig, ax = plt.subplots(figsize=(8, 5))\nsns.ecdfplot(data=df, x=\"total_bill\", hue=\"sex\", ax=ax)\n# Mark the median (y=0.5)\nax.axhline(0.5, color=\"gray\", linestyle=\"--\", linewidth=0.7)\n# Annotate where each group's median falls on x\nfor sex, grp in df.groupby(\"sex\"):\n    p50 = grp[\"total_bill\"].median()\n    ax.axvline(p50, color=\"gray\", linestyle=\":\",\n                linewidth=0.7, alpha=0.5)\n    ax.text(p50, 0.02, f\"p50 {sex}={p50:.0f}\",\n             rotation=90, va=\"bottom\", ha=\"right\",\n             fontsize=8)\n# Decision rule:\n#   compare distributions visually   -> ecdfplot (preferred over KDE)\n#   probability of exceedance        -> complementary=True\n#   read a specific quantile         -> intersect ECDF with horizontal line\n#   no parameter choices needed      -> ecdfplot (no bins, no bandwidth)\n#   audience unfamiliar with CDFs    -> histplot(stat=\"density\") instead\n#   time-to-event / churn / survival -> ecdfplot(complementary=True)\n#\n# Anti-pattern: comparing two histograms with different N when the real question is \"are these\n# distributions different?\".\n#   Histogram bar heights conflate sample size with density and binning amplifies noise. ECDFs\n#   need no bins, scale identically across N, and let you read quantiles directly off the y axis.\n#   Default to ecdfplot(hue=...) for distribution comparisons; reach for histplot only when the\n#   audience needs the familiar bar shape."
                  }
        ],
        tips: [
                  "ECDF requires no binning or smoothing — every point is exact, not estimated",
                  "Where ECDFs cross, the distributions have the same proportion below that value",
                  "`complementary=True` shows the survival function: P(X > x) — useful for time-to-event",
                  "Two ECDFs that are far apart indicate very different distributions"
        ],
        mistake: "Using histplot to compare two distributions when the sample sizes are different. histplot counts are hard to compare across groups of different size. Use ecdfplot or histplot with stat=\"density\" instead.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.ecdfplot(data=df, x='total_bill')",
          concise: "ax=ax, height=0.05, alpha=0.4)",
        },
      },
      {
        id: "rugplot",
        fn: "sns.rugplot()",
        desc: "Show individual data points as ticks along an axis.",
        category: "Distribution",
        subtitle: "Marginal rug — pair with kdeplot or ecdfplot for full picture",
        signature: "sns.rugplot(data, x=\"col\", hue=\"group\", height=0.05)",
        descLong: "rugplot() draws a small tick mark on the axis for each data point. On its own it gives a quick sense of density. Most useful as a marginal overlay on kdeplot, ecdfplot, or scatterplot to show the raw data distribution alongside a smooth summary.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.rugplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Most useful as an OVERLAY.\n#             actually are\".\n#             value) or 2D rugs.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.rugplot(data=df, x=\"total_bill\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.rugplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.rugplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             KDE or ECDF. Add 2D ticks via x= and y=.\n#             rugplot) — smooth shape with honest data.\n#             — senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Overlay on KDE — the canonical use\nax = sns.kdeplot(data=df, x=\"total_bill\", hue=\"sex\",\n                  fill=True, alpha=0.3)\nsns.rugplot(data=df, x=\"total_bill\", hue=\"sex\",\n             ax=ax, height=0.05, alpha=0.5)\n# 2D rug — ticks on both axes\nsns.rugplot(data=df, x=\"total_bill\", y=\"tip\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.rugplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             scatter via JointGrid, hide rug entirely\n#             when N > a few hundred (the rug becomes a\n#             solid line and adds nothing).\n#             marginals; the \"skip rugplot at scale\" rule\n#             saves charts from becoming illegible.\n#             figure); height tuning is finicky for\n#             dense data.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Marginal rug on scatter via JointGrid\ng = sns.JointGrid(data=df, x=\"total_bill\", y=\"tip\", height=6)\ng.plot_joint(sns.scatterplot, alpha=0.5)\ng.plot_marginals(sns.rugplot, height=1)\n# Skip rug when n > ~500 — every value becomes a tick\n# and the rug becomes a solid bar with no information.\n# Use kdeplot + low-alpha scatter instead.\n# Decision rule:\n#   small N, want raw data + smooth      -> kdeplot + rugplot\n#   any N, marginals on a scatter        -> JointGrid + rugplot\n#   N >> 500                             -> skip rugplot, use scatter alpha\n#   2D marginals on JointGrid            -> g.plot_marginals(sns.rugplot)\n#   primary chart, no overlay            -> use stripplot or histplot instead\n#   want exact tick at each value        -> rugplot with height=0.05\n#\n# Anti-pattern: using rugplot as the standalone visualization.\n#   Rugplot only encodes location, not density — adjacent ticks visually merge and you lose all\n#   sense of shape. It is an OVERLAY on kdeplot/ecdfplot/scatterplot. If you need a primary\n#   \"show me the points\" chart, reach for stripplot (categorical) or histplot (continuous)."
                  }
        ],
        tips: [
                  "Rugplot is almost always used as an overlay — pair it with kdeplot or ecdfplot",
                  "`height=0.05` keeps the ticks small and unobtrusive — the default is often too tall",
                  "Pass `ax=` to draw on the same axes as an existing plot",
                  "For 2D marginal distributions, use JointGrid with `plot_marginals(sns.rugplot)`"
        ],
        mistake: "Using rugplot alone as the primary visualization. It only shows data locations without quantifying density. Pair it with kdeplot or ecdfplot for a complete picture.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.rugplot(data=df, x='total_bill')",
          concise: "g.plot_marginals(sns.rugplot, height=1)",
        },
      },
      {
        id: "displot",
        fn: "sns.displot()",
        desc: "Figure-level distribution plot with built-in faceting.",
        category: "Distribution",
        subtitle: "Figure-level wrapper for histplot/kdeplot/ecdfplot with col= and row=",
        signature: "sns.displot(data, x=\"col\", col=\"group\", kind=\"hist\")",
        descLong: "displot() is the figure-level distribution function. It wraps histplot, kdeplot, and ecdfplot and adds faceting via col= and row=. Returns a FacetGrid — not an Axes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.displot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             kdeplot/ecdfplot with built-in faceting.\n#             across categories.\n#             figure-level vs axes-level distinction.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.displot(data=df, x=\"total_bill\", kde=True)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.displot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.displot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             plot type; col=/row= facet; hue= overlays\n#             groups within each panel; height/aspect\n#             control panel size. Returns a FacetGrid\n#             (not an Axes).\n#             \"compare distributions across categories\".\n#             ax= argument) or set_titles formatting —\n#             senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Faceted histograms, hue inside each panel\ng = sns.displot(\n    data=df, x=\"total_bill\",\n    col=\"time\", hue=\"sex\",\n    kind=\"hist\", kde=True,\n    height=4, aspect=0.9,\n)\n# Same data, kde panels\nsns.displot(data=df, x=\"total_bill\", col=\"sex\",\n             kind=\"kde\", fill=True)\n# ECDF panels with column wrap\nsns.displot(data=df, x=\"total_bill\", col=\"day\",\n             col_wrap=2, kind=\"ecdf\", height=4)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.displot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             its figure; you cannot pass ax=. Customize\n#             via the returned FacetGrid (g.set_titles,\n#             g.figure, g.axes). Use axes-level histplot/\n#             kdeplot when integrating into existing\n#             subplots.\n#             distinction; FacetGrid customization is\n#             needed for any publication-quality output.\n#             cliff; you can't smoothly mix them.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Figure-level — returns FacetGrid; no ax= argument\ng = sns.displot(data=df, x=\"total_bill\",\n                 col=\"day\", col_wrap=2, hue=\"sex\",\n                 kind=\"hist\", kde=True,\n                 height=3.5, aspect=1.0)\n# Customize via the FacetGrid\ng.set_axis_labels(\"Total Bill ($)\", \"Count\")\ng.set_titles(col_template=\"{col_name}\")\ng.figure.suptitle(\"Bill distribution by day\", y=1.02)\ng.add_legend()\n# g.figure.savefig(\"bills.png\", dpi=200, bbox_inches=\"tight\")\n# Decision rule:\n#   single panel into existing axes  -> sns.histplot(ax=ax)\n#   small multiples / faceted        -> sns.displot\n#   need both raw data + facets      -> displot + FacetGrid customization\n#   kind=hist|kde|ecdf switch        -> stay in displot\n#   custom plt.subplots layout       -> axes-level histplot/kdeplot per cell\n#   want overall suptitle            -> g.figure.suptitle(..., y=1.02)\n#\n# Anti-pattern: passing ax= to displot to embed it in a plt.subplots() grid.\n#   displot is figure-level — it OWNS its figure and ax= raises a TypeError. Either switch\n#   to sns.histplot(ax=ax) for one panel inside a custom grid, or commit fully to displot\n#   and customize via the returned FacetGrid (g.set_titles, g.figure, g.axes.flat)."
                  }
        ],
        tips: [
                  "`kind=\"hist\"` (default), `\"kde\"`, or `\"ecdf\"` — switch the plot type while keeping faceting",
                  "`height=` and `aspect=` control the size of each facet panel",
                  "Returns a `FacetGrid` — use `g.figure` to access the underlying matplotlib Figure",
                  "`col_wrap=3` wraps columns into a grid when you have many facets"
        ],
        mistake: "Trying to pass `ax=` to `sns.displot()`. It is a figure-level function that manages its own Figure. Use `sns.histplot()` or `sns.kdeplot()` when you need to specify an existing Axes.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.displot(data=df, x='total_bill')",
          concise: "g.add_legend()",
        },
      },
    ],
  },

  // ── Section 2: Categorical Plots ─────────────────────────────────────────
  {
    id: "categorical",
    title: "Categorical Plots",
    entries: [
      {
        id: "boxplot",
        fn: "sns.boxplot()",
        desc: "Show the distribution of a variable across categories using box-and-whisker.",
        category: "Categorical",
        subtitle: "Median, quartiles, and outliers at a glance",
        signature: "sns.boxplot(data, x=\"group\", y=\"value\", hue=\"subgroup\")",
        descLong: "boxplot() shows the median, IQR, and outliers. The box spans Q1-Q3, the line is the median, whiskers extend to 1.5×IQR, and points beyond are outliers. Use hue= to split by a second variable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.boxplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             IQR box, whiskers to 1.5xIQR, outliers as\n#             dots.\n#             across categories\" chart.\n#             overlay.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.boxplot(data=df, x=\"day\", y=\"total_bill\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.boxplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.boxplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             variable comparison, explicit order= (avoids\n#             alphabetical surprises), strip/swarm overlay\n#             for small N.\n#             Sun, Thu\" alphabetical mess; overlay shows\n#             individual points so the box isn't lying.\n#             \"use violin instead for multimodal\" rule —\n#             senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Two-variable comparison + explicit order\nsns.boxplot(data=df, x=\"day\", y=\"total_bill\",\n             hue=\"sex\",\n             order=[\"Thur\", \"Fri\", \"Sat\", \"Sun\"])\n# Box + raw points overlay (small N visible)\nax = sns.boxplot(data=df, x=\"day\", y=\"total_bill\",\n                  fill=False, fliersize=0)\nsns.stripplot(data=df, x=\"day\", y=\"total_bill\",\n               ax=ax, size=3, alpha=0.4)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.boxplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             \"is the median different?\" CI; switch to\n#             violin/swarm when distributions are\n#             multimodal or N is small; sort categories by\n#             a meaningful order (median, sample size).\n#             the right plot per shape (boxplot for\n#             quartiles only; violin for shape; swarm for\n#             every point) prevents misleading charts.\n#             ordering by median changes between datasets.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"tips\")\n# 1. Sort categories by median (most-to-least)\norder = df.groupby(\"day\")[\"total_bill\"].median().sort_values(\n    ascending=False).index\nfig, ax = plt.subplots(figsize=(8, 5))\nsns.boxplot(data=df, x=\"day\", y=\"total_bill\",\n             order=order, notch=True,             # CI notch on median\n             showmeans=True,                       # mean as triangle\n             meanprops={\"marker\": \"^\",\n                         \"markerfacecolor\": \"white\",\n                         \"markeredgecolor\": \"black\"},\n             ax=ax)\n# Decision rule:\n#   compare medians/IQR across categories       -> boxplot\n#   shape matters (multimodal, skew)            -> violinplot\n#   N small enough to show every point          -> stripplot or swarmplot\n#   want CI on the median visible               -> notch=True (boxplot)\n#   long tails / many outliers (large N)        -> boxenplot (letter-value)\n#   alphabetical category order leaks in        -> set order= explicitly\n#\n# Anti-pattern: boxplot on a multimodal distribution.\n#   The five-number summary collapses two peaks into a single IQR — the chart looks unimodal\n#   and hides the structure that matters. If a kdeplot or histogram of one group shows >1 peak,\n#   switch to violinplot (or violin+stripplot overlay). Boxplot only honestly represents\n#   roughly-unimodal data."
                  }
        ],
        tips: [
                  "Set `fill=False, fliersize=0` in boxplot then overlay `sns.stripplot()` to show raw data",
                  "`order=` controls category order — always set explicitly to avoid alphabetical surprises",
                  "Whiskers extend to 1.5×IQR by default — points beyond are plotted as outliers",
                  "For many groups, try `orient=\"h\"` for horizontal boxes with room for long labels"
        ],
        mistake: "Using boxplot alone for small datasets where all the data points matter. Overlay `sns.stripplot()` so individual observations are visible.",
        shorthand: {
          verbose: "import seaborn as sns\nimport matplotlib.pyplot as plt\ndata = sns.load_dataset('tips')\nsns.boxplot(data=data, x='day', y='total_bill')",
          concise: "sns.boxplot(data=data, x='day', y='total_bill', hue='time')",
        },
      },
      {
        id: "violinplot",
        fn: "sns.violinplot()",
        desc: "Show full distribution shape using a mirrored KDE.",
        category: "Categorical",
        subtitle: "Better than boxplot when n is large or distribution is multimodal",
        signature: "sns.violinplot(data, x=\"group\", y=\"value\", inner=\"quartile\")",
        descLong: "violinplot() shows the full distribution shape as a mirrored KDE, not just quartiles. More informative than a boxplot when the distribution is multimodal or when sample size is large enough to estimate density reliably.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.violinplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             distribution shape, not just quartiles.\n#             density_norm.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.violinplot(data=df, x=\"day\", y=\"total_bill\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.violinplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.violinplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             what's drawn inside (quartile / box / stick),\n#             split=True puts hue groups on the same\n#             violin (efficient comparison), density_norm\n#             controls how widths compare across groups.\n#             space; density_norm=\"count\" makes group N\n#             differences visible.\n#             overlay — senior.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# inner=quartile draws the three quartile lines inside\nsns.violinplot(data=df, x=\"day\", y=\"total_bill\",\n                inner=\"quartile\")\n# Split violins — two hue groups share each violin\nsns.violinplot(data=df, x=\"day\", y=\"total_bill\",\n                hue=\"sex\", split=True, inner=\"quartile\")\n# density_norm — compare absolute widths\nsns.violinplot(data=df, x=\"day\", y=\"total_bill\",\n                density_norm=\"count\")     # width reflects N"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.violinplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             substructure, inner=None + stripplot overlay\n#             for the \"shape + raw\" combo, and the rule\n#             that small N (<30 per group) should NOT use\n#             violin (KDE is unreliable).\n#             violin is suggestive\" from \"I can see the\n#             two peaks\"; the inner=None overlay is the\n#             cleanest possible joint summary.\n#             strip combo can look busy on dense data.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"tips\")\nfig, ax = plt.subplots(figsize=(10, 5))\n# Shape + raw points overlay\nsns.violinplot(data=df, x=\"day\", y=\"total_bill\",\n                inner=None, fill=True, alpha=0.4,\n                bw_adjust=0.7,                         # rougher to see substructure\n                ax=ax)\nsns.stripplot(data=df, x=\"day\", y=\"total_bill\",\n               ax=ax, color=\"black\", size=2, alpha=0.5)\n# Decision rule:\n#   N >= 30 per group, want shape        -> violinplot\n#   N < 30 per group                     -> swarm/strip + boxplot\n#   compare two distributions per cat    -> violinplot(hue=, split=True)\n#   compact summary, no shape needed     -> boxplot\n#   need raw points overlaid             -> inner=None + stripplot/swarmplot\n#   group sizes vary, show with width    -> density_norm=\"count\"\n#\n# Anti-pattern: drawing a violinplot when each group has fewer than ~20 points.\n#   The KDE underneath is fitted from too few samples; the resulting smooth shape is mostly\n#   bandwidth artifact and misleads viewers into seeing modes that aren't there. For small N\n#   per group, prefer stripplot/swarmplot (every dot visible) optionally overlaid on a\n#   thin boxplot — the data speaks for itself without inventing a density."
                  }
        ],
        tips: [
                  "Violin plots reveal multimodal distributions that boxplots hide — prefer them when n > 30",
                  "`split=True` with `hue=` draws both groups on the same violin — saves space for side-by-side comparison",
                  "`inner=None` then overlay `sns.stripplot()` shows the raw data on top of the density",
                  "`bw_adjust=0.5` reveals substructure; `bw_adjust=2.0` smooths over noise"
        ],
        mistake: "Using violin plots with small samples (n < 20). The KDE is unreliable — use a swarmplot or stripplot that shows the actual data points instead.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.violinplot(data=df, x='day', y='total_bill')",
          concise: "ax=ax, color='black', size=2, alpha=0.5)",
        },
      },
      {
        id: "stripplot",
        fn: "sns.stripplot()",
        desc: "Plot all individual data points along a categorical axis.",
        category: "Categorical",
        subtitle: "Show every observation — best for small or medium datasets",
        signature: "sns.stripplot(data, x=\"group\", y=\"value\", jitter=True)",
        descLong: "stripplot() plots every data point along a categorical axis with jitter to reduce overlap. It is most useful for small datasets where you want to show all the raw data. Combine with boxplot or violinplot for large datasets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.stripplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             the categorical axis to reduce overlap.\n#             scaling for large N.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.stripplot(data=df, x=\"day\", y=\"total_bill\",\n               jitter=True, alpha=0.6)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.stripplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.stripplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             hue= (separate side-by-side groups), small\n#             size + low alpha for medium N, and the\n#             canonical box+strip overlay.\n#             summary + raw data.\n#             warnings — senior.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"tips\")\n# Group split with dodge\nsns.stripplot(data=df, x=\"day\", y=\"total_bill\",\n               hue=\"sex\", dodge=True, alpha=0.6)\n# Box + strip — quartiles plus raw points\nfig, ax = plt.subplots()\nsns.boxplot(data=df, x=\"day\", y=\"total_bill\",\n             fill=False, fliersize=0, ax=ax)\nsns.stripplot(data=df, x=\"day\", y=\"total_bill\",\n               ax=ax, color=\"steelblue\",\n               size=3, alpha=0.4)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.stripplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             hundred), reduce size and alpha or switch\n#             to violin/box; choose strip over swarm\n#             when N is large (swarm doesn't scale); use\n#             native_scale=True to plot strips at numeric\n#             x positions (mixed numeric+categorical).\n#             \"blob\" strip plots; native_scale unlocks\n#             the rare numeric-x case.\n#             native_scale changes axis behavior in ways\n#             that surprise readers.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Scale-conscious styling for medium N\nsns.stripplot(data=df, x=\"day\", y=\"total_bill\",\n               hue=\"sex\", dodge=True,\n               size=2, alpha=0.3,                    # turn down for density\n               jitter=0.25)                           # narrower jitter band\n# Numeric x via native_scale — strip-on-numeric-axis\n# sns.stripplot(data=df_with_int_x, x=\"month\", y=\"value\",\n#                native_scale=True)\n# Decision rule:\n#   N <= 30 per group        -> swarmplot (no overlap)\n#   30 < N <= 500            -> stripplot with size=3, alpha=0.6\n#   500 < N <= 5000          -> stripplot with size=2, alpha=0.3\n#   N > 5000                 -> switch to violin/box; strip becomes a blob\n#   numeric-x mixed with cat -> native_scale=True\n#   overlay on box/violin    -> fill=False box + stripplot color=\"black\"\n#\n# Anti-pattern: leaving size= and alpha= at their defaults on medium-to-large N.\n#   Default size=5 with full opacity becomes a solid colored bar at a few hundred points and\n#   you lose all density information. The fix is a coordinated turn-down: size=2-3 with\n#   alpha=0.3-0.5 and a narrower jitter=0.25. If even that still looks like a bar, you have\n#   crossed into violin/box territory."
                  }
        ],
        tips: [
                  "Combine stripplot with boxplot: set `fill=False, fliersize=0` in boxplot then overlay strips",
                  "`dodge=True` with `hue=` separates the two groups — prevents all points sitting on top of each other",
                  "For more than ~200 points, use `swarmplot` (non-overlapping) or reduce `size=` and `alpha=`",
                  "`sns.swarmplot()` is the non-overlapping alternative — cleaner but computationally slower for large n"
        ],
        mistake: "Using stripplot with large datasets (n > 500) and getting a solid color block. Reduce `size=1`, increase `alpha=0.2`, or switch to a violin/box plot.",
        shorthand: {
          verbose: "        import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.ecdfplot(data=df, x='total_bill')\nsns.ecdfplot(data=df, x='total_bill', hue='sex')",
          concise: "    ax=ax, height=0.05, alpha=0.4)",
        },
      },
      {
        id: "swarmplot",
        fn: "sns.swarmplot()",
        desc: "Plot all data points without overlap — non-overlapping jitter.",
        category: "Categorical",
        subtitle: "Cleaner than stripplot for small-to-medium datasets",
        signature: "sns.swarmplot(data, x=\"group\", y=\"value\", hue=\"subgroup\")",
        descLong: "swarmplot() is like stripplot() but uses a beeswarm algorithm to position points so they do not overlap. The result is a categorical scatter where every point is visible. Slower than stripplot and does not scale to large n — use for n < 500.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.swarmplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             visible, none overlap.\n#             doesn't warn about scale.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.swarmplot(data=df, x=\"day\", y=\"total_bill\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.swarmplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.swarmplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             hue, overlay on boxplot, the small size +\n#             alpha tuning that keeps swarms readable.\n#             \"summary + every point\" combo for N < ~200.\n#             switch to strip) — senior tier.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"tips\")\n# Group split via dodge\nsns.swarmplot(data=df, x=\"day\", y=\"total_bill\",\n               hue=\"sex\", dodge=True, size=3)\n# Box + swarm overlay\nfig, ax = plt.subplots()\nsns.boxplot(data=df, x=\"day\", y=\"total_bill\",\n             fill=False, fliersize=0, ax=ax)\nsns.swarmplot(data=df, x=\"day\", y=\"total_bill\",\n               color=\"steelblue\", size=3,\n               alpha=0.7, ax=ax)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.swarmplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             slows dramatically and warns when N per\n#             group > ~500. The beeswarm algorithm is\n#             O(n^2) per category. Switch to stripplot\n#             with low alpha for large N.\n#             \"why is my notebook hung?\" moment; explicit\n#             switch criteria makes the code review\n#             obvious.\n#             switching loses some readability.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Safe at this size (< 200 per group)\nsns.swarmplot(data=df, x=\"day\", y=\"total_bill\",\n               size=3)\n# Decision rule:\n#   N <= 100 per group              -> swarmplot (cleanest)\n#   100 < N <= 500 per group        -> swarmplot with smaller size=\n#   N > 500 per group               -> stripplot(size=2, alpha=0.3)\n#   N > 5000 per group              -> violinplot or boxplot only\n#   want raw + summary together     -> box (fill=False) + swarmplot overlay\n#   two hue groups side-by-side     -> dodge=True\n#\n# Anti-pattern: swarmplot on a 10k-row DataFrame and ignoring the placement warning.\n#   The beeswarm algorithm is O(n^2) per category; on large N seaborn emits \"X% of the\n#   points cannot be placed\" and silently drops them. The chart is now both slow AND a lie\n#   about your data. Switch to stripplot(size=2, alpha=0.3) above ~500 per group, or\n#   summarize with violin/box above ~5000."
                  }
        ],
        tips: [
                  "swarmplot is best for n < 500 — above that it becomes slow and crowded",
                  "Overlay on boxplot: `fill=False, fliersize=0` in boxplot, then swarmplot on the same ax",
                  "`dodge=True` with hue separates the two groups side by side",
                  "For larger datasets, use stripplot with `size=2, alpha=0.3` instead"
        ],
        mistake: "Using swarmplot on datasets with more than 500-1000 points. The beeswarm algorithm becomes very slow and the plot becomes unreadable. Use stripplot for large n.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.swarmplot(data=df, x='day', y='total_bill')",
          concise: "size=2, alpha=0.3, jitter=True)",
        },
      },
      {
        id: "barplot",
        fn: "sns.barplot()",
        desc: "Show the mean of a variable per category with a 95% confidence interval.",
        category: "Categorical",
        subtitle: "Shows mean + CI — NOT raw counts or totals",
        signature: "sns.barplot(data, x=\"group\", y=\"value\", estimator=\"mean\")",
        descLong: "barplot() shows the mean (or another estimator) with a 95% confidence interval. It does NOT show raw counts — use countplot() for counts or aggregate your data first for totals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.barplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             totals — the MEAN with a 95% CI band by\n#             default.\n#             call.\n#             order= which are the everyday options.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.barplot(data=df, x=\"day\", y=\"total_bill\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.barplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.barplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             group split, explicit order=, errorbar=\n#             choice (CI vs SD vs SE), estimator= for\n#             median or custom aggregator.\n#             errorbar= prevents the \"what does this band\n#             represent?\" confusion.\n#             not the right tool\" rule for raw counts —\n#             senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Mean by day with split, CI band default\nsns.barplot(data=df, x=\"day\", y=\"tip\",\n             hue=\"sex\",\n             order=[\"Thur\", \"Fri\", \"Sat\", \"Sun\"])\n# Median is more robust to outliers\nsns.barplot(data=df, x=\"day\", y=\"total_bill\",\n             estimator=\"median\",\n             errorbar=(\"ci\", 95))\n# Standard deviation band (variability, not mean uncertainty)\nsns.barplot(data=df, x=\"day\", y=\"total_bill\",\n             errorbar=\"sd\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.barplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             error bar represents (95% CI is NOT the same\n#             as +/- SD); add bar_label for value\n#             annotation; pick countplot for raw counts,\n#             ax.bar for pre-aggregated totals.\n#             charts; the decision tree (barplot/countplot/\n#             ax.bar) clarifies the most-confused trio.\n#             distinction between barplot/countplot/ax.bar\n#             takes practice.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"tips\")\nfig, ax = plt.subplots(figsize=(8, 5))\nsns.barplot(data=df, x=\"day\", y=\"tip\",\n             order=[\"Thur\", \"Fri\", \"Sat\", \"Sun\"],\n             estimator=\"mean\",\n             errorbar=(\"ci\", 95),\n             ax=ax)\n# Always annotate what the bar represents\nax.set_ylabel(\"Mean tip ($) - error bars: 95% CI\")\n# Value labels on each bar\nfor c in ax.containers:\n    ax.bar_label(c, fmt=\"%.2f\", padding=3)\n# Decision rule:\n#   mean / median per category, with CI    -> sns.barplot\n#   raw count of rows per category         -> sns.countplot\n#   pre-aggregated totals (already summed) -> ax.bar (matplotlib)\n#   outliers skew the mean                 -> estimator=\"median\"\n#   show variability not uncertainty       -> errorbar=\"sd\"\n#   suppress error bars entirely           -> errorbar=None\n#\n# Anti-pattern: passing already-aggregated totals to sns.barplot expecting it to \"just plot\".\n#   barplot will recompute the mean of your single-row-per-category column — for one row\n#   that's the value itself, but the CI bar collapses to 0 and the chart implies \"no\n#   uncertainty\" when really there's no replication. For pre-summed data use ax.bar()\n#   directly; reach for barplot only when seaborn should do the aggregation."
                  }
        ],
        tips: [
                  "`sns.barplot()` shows the **mean** — not totals or counts. Use `sns.countplot()` for counts",
                  "`errorbar=\"sd\"` shows ±1 std dev — shows variability, not uncertainty in the mean",
                  "Always set `order=` explicitly — alphabetical ordering is rarely what you want",
                  "`estimator=\"median\"` is more robust to outliers than the default mean"
        ],
        mistake: "Expecting barplot to show totals or counts. It shows the **mean** with a confidence interval. For counts: `sns.countplot()`. For pre-aggregated data: use `ax.bar()` directly.",
        shorthand: {
          verbose: "import seaborn as sns\nimport matplotlib.pyplot as plt\ndata = sns.load_dataset('tips')\nsns.barplot(data=data, x='day', y='tip', hue='sex')",
          concise: "sns.barplot(data=data, x='day', y='tip', order=['Thur', 'Fri', 'Sat', 'Sun'])",
        },
      },
      {
        id: "countplot",
        fn: "sns.countplot()",
        desc: "Show the count of observations in each categorical bin.",
        category: "Categorical",
        subtitle: "Bar chart of raw counts — no y variable needed",
        signature: "sns.countplot(data, x=\"col\", hue=\"group\", order=[])",
        descLong: "countplot() counts the occurrences of each category and displays them as bars. Unlike barplot() it does not need a y variable — it counts the rows. The most common plot for showing category frequency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.countplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             category. No y variable.\n#             the horizontal form.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.countplot(data=df, x=\"day\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.countplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.countplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             frequency, hue= split, horizontal for long\n#             labels, bar_label for annotations.\n#             readable count plots; bar_label removes the\n#             need to manually annotate.\n#             or the \"long-tail\" categorical fix —\n#             senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Sort by frequency, most common first\norder = df[\"day\"].value_counts().index\nax = sns.countplot(data=df, x=\"day\", order=order)\n# Auto value labels\nfor c in ax.containers:\n    ax.bar_label(c)\n# Horizontal — better for long labels\nsns.countplot(data=df, y=\"day\", order=order)\n# Group split via hue\nsns.countplot(data=df, x=\"day\", hue=\"sex\", order=order)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.countplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             tail into \"Other\"; show proportions instead\n#             of raw counts when groups have very\n#             different sizes; reach for value_counts()\n#             + ax.bar when you want full control.\n#             proportion-mode bars are the right choice\n#             for \"what fraction of orders is X?\"\n#             aren't built into countplot — use a small\n#             precompute step.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"tips\")\n# 1. Collapse the long tail into \"Other\"\ntop_n = 5\ncounts = df[\"day\"].value_counts()\ntop    = counts.nlargest(top_n).index\nview = df.assign(day_top=df[\"day\"].where(df[\"day\"].isin(top), \"Other\"))\nsns.countplot(data=view, x=\"day_top\",\n               order=list(top) + [\"Other\"])\n# 2. Proportions per group (precompute, then ax.bar)\nfig, ax = plt.subplots()\nprop = (df.groupby(\"day\")[\"sex\"]\n          .value_counts(normalize=True)\n          .unstack(fill_value=0))\nprop.plot(kind=\"bar\", stacked=True, ax=ax)\nax.set_ylabel(\"Proportion\")\n# Decision rule:\n#   raw category counts             -> countplot\n#   counts split by another cat     -> countplot(hue=)\n#   normalized proportions per cat  -> precompute + ax.bar\n#   long-tail categorical           -> collapse to \"Other\" first\n#   long category names             -> y= instead of x= (horizontal)\n#   want sorted-by-frequency        -> order=df[col].value_counts().index\n#\n# Anti-pattern: leaving order at default (alphabetical / first-seen) on countplot.\n#   Seaborn sorts categories alphabetically, which buries the dominant class and forces\n#   the eye to scan back and forth. ALWAYS pass order=df[col].value_counts().index for\n#   most-to-least, or your domain's canonical ordering. Same fix applies to barplot,\n#   boxplot, and violinplot — explicit order= is the rule."
                  }
        ],
        tips: [
                  "`order=df[\"col\"].value_counts().index` sorts bars from most to least frequent",
                  "`ax.bar_label(container)` adds count labels on top of bars — one line of code",
                  "Use `y=` instead of `x=` for horizontal bars — gives room for long category names",
                  "countplot is essentially `barplot` with `estimator=len` — it counts, not aggregates"
        ],
        mistake: "Using barplot() when you just want counts. barplot() shows the mean of a numeric column with CI bands. countplot() shows raw row counts — no y variable needed.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.countplot(data=df, x='day')",
          concise: "order=order)",
        },
      },
      {
        id: "pointplot",
        fn: "sns.pointplot()",
        desc: "Show mean and CI per category as connected points.",
        category: "Categorical",
        subtitle: "Like barplot but with dots and lines — great for showing trends",
        signature: "sns.pointplot(data, x=\"group\", y=\"value\", hue=\"subgroup\")",
        descLong: "pointplot() shows the mean per category as a point with a CI bar, connecting points with a line. Most useful when the x-axis has a natural order (time, dose level, ordinal category) and you want to see the trend across categories.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.pointplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             connected by a line.\n#             (time, dose, ordinal levels).\n#             tool for nominal categories\" rule.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.pointplot(data=df, x=\"day\", y=\"total_bill\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.pointplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.pointplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             multiple lines, dodge=True to separate\n#             overlapping groups, estimator/errorbar for\n#             aggregator choice, linestyle=\"none\" for the\n#             dot-plot variant.\n#             top\" problem; linestyle=\"none\" creates a\n#             Cleveland dot plot.\n#             — senior tier covers when pointplot is the\n#             wrong tool.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Multiple lines via hue\nsns.pointplot(data=df, x=\"day\", y=\"total_bill\",\n               hue=\"sex\", dodge=True,\n               order=[\"Thur\", \"Fri\", \"Sat\", \"Sun\"])\n# Median + SD instead of mean + CI\nsns.pointplot(data=df, x=\"day\", y=\"total_bill\",\n               estimator=\"median\", errorbar=\"sd\")\n# Dot-plot variant — no connecting line\nsns.pointplot(data=df, x=\"day\", y=\"total_bill\",\n               linestyle=\"none\", capsize=0.1)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.pointplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             ordinal meaning (the connecting line\n#             implies progression). For nominal\n#             categories use barplot/boxplot. For\n#             genuinely numeric x with summary lines,\n#             switch to lineplot which is designed for it.\n#             common pointplot misuse; lineplot is the\n#             better tool when x is numeric.\n#             sometimes a judgment call; pointplot has\n#             a small API niche.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Right tool: x is ordinal (time of day suggests progression)\nsns.pointplot(data=df, x=\"time\", y=\"total_bill\",\n               order=[\"Lunch\", \"Dinner\"])\n# Wrong tool: nominal categories\n# sns.pointplot(data=df, x=\"day\", y=\"total_bill\")\n#   The line \"Thur -> Fri -> Sat -> Sun\" implies a trend\n#   but day-of-week is not really ordered for tips.\n# Right alternative:\n# sns.barplot(data=df, x=\"day\", y=\"total_bill\")\n# Decision rule:\n#   x is ordinal/temporal              -> pointplot\n#   x is nominal categorical           -> barplot or boxplot\n#   x is numeric (continuous)          -> lineplot\n#   x is grouped time series           -> lineplot(hue=)\n#   want Cleveland dot plot            -> pointplot(linestyle=\"none\")\n#   overlapping groups                 -> dodge=True\n#\n# Anti-pattern: pointplot with a connecting line between unordered nominal categories\n# (city names, product SKUs, treatment groups).\n#   The line implies a trend \"City A -> City B -> City C\" that has no meaning — readers\n#   anchor on the slope and infer ordering that doesn't exist. For nominal x reach for\n#   barplot or boxplot. Reserve pointplot for x with genuine ordinal/temporal structure\n#   (dose level, year, time-of-day)."
                  }
        ],
        tips: [
                  "pointplot is ideal when x has a natural ordering — the connecting line implies progression",
                  "Use `dodge=True` with hue so overlapping groups do not sit on top of each other",
                  "`linestyle=\"none\"` shows just points with CI bars — a Cleveland dot plot style",
                  "For unordered categories, barplot or boxplot communicates better than a connecting line"
        ],
        mistake: "Using pointplot for unordered categories like city names. The connecting line implies a trend between adjacent categories — use barplot or boxplot for nominal categories.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.pointplot(data=df, x='day', y='total_bill')",
          concise: "col='time', dodge=True)",
        },
      },
    ],
  },

  // ── Section 3: Relational & Regression Plots ─────────────────────────────────────────
  {
    id: "relational",
    title: "Relational & Regression Plots",
    entries: [
      {
        id: "scatterplot",
        fn: "sns.scatterplot()",
        desc: "Plot the relationship between two continuous variables.",
        category: "Relational",
        subtitle: "Encode up to 5 dimensions via x, y, hue, size, and style",
        signature: "sns.scatterplot(data, x=\"x\", y=\"y\", hue=\"group\", size=\"n\")",
        descLong: "scatterplot() plots individual data points and can encode additional dimensions through hue (color), size, and style (marker shape). Adds automatic legend and palette management.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.scatterplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             the legend, colors, and palette.\n#             is in a DataFrame.\n#             encoding (hue/size/style) which is seaborn\n#             scatter's main value.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"penguins\").dropna()\nsns.scatterplot(data=df, x=\"bill_length_mm\", y=\"bill_depth_mm\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.scatterplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.scatterplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             5 dimensions with x, y, hue, style, size.\n#             alpha for overlap. legend outside the axes.\n#             scatter genuinely better than matplotlib's.\n#             alternatives — senior.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"penguins\").dropna()\n# Three dimensions encoded in one scatter\nsns.scatterplot(\n    data=df,\n    x=\"bill_length_mm\", y=\"bill_depth_mm\",\n    hue=\"species\",\n    style=\"sex\",\n    size=\"body_mass_g\",\n    sizes=(30, 200),\n    alpha=0.7,\n)\n# Move legend outside the axes\nplt.legend(loc=\"upper left\", bbox_to_anchor=(1.02, 1.0))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.scatterplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             scatterplot only with low alpha (or switch\n#             to histplot 2D / hexbin); cap hue at ~6\n#             values; for many categories use facets via\n#             sns.relplot(col=).\n#             unreadable scatters; facets via relplot\n#             scale to many groups.\n#             choosing 6 colors well requires a thought\n#             about the palette.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\ndf = sns.load_dataset(\"penguins\").dropna()\n# Right pattern at scale: facet, don't over-color\ng = sns.relplot(data=df,\n                 x=\"bill_length_mm\", y=\"bill_depth_mm\",\n                 col=\"species\", hue=\"sex\",\n                 height=4, aspect=0.9)\ng.set_titles(\"{col_name}\")\n# Decision rule:\n#   N <= 1k, 2-6 groups    -> scatterplot(hue=, alpha=0.6)\n#   N > 5k                 -> histplot(2D) or hexbin\n#   many categories        -> relplot(col=...) facets\n#   need a regression line -> regplot or lmplot\n#   3+ encodings needed    -> hue= + size= + style=\n#   color-blind audience   -> palette=\"colorblind\"\n#\n# Anti-pattern: encoding 8+ categories via hue on a single scatter.\n#   Beyond ~6 colors the legend becomes a key the reader has to memorize and adjacent points\n#   from different groups are visually indistinguishable. The fixes, in order: drop to <=6\n#   categories with \"Other\" lumping, split via style= for a second dim, or facet with\n#   relplot(col=..., col_wrap=N) — small multiples scale where one packed scatter doesn't."
                  }
        ],
        tips: [
                  "Use `hue`, `size`, AND `style` to show three categorical variables on one scatter plot",
                  "`alpha=0.5-0.7` is essential for overlapping points — reveals density",
                  "Legend position: `plt.legend(loc=\"upper left\", bbox_to_anchor=(1, 1))` to move outside",
                  "For very large datasets, use `rasterized=True` to render the points as a bitmap — smaller file size"
        ],
        mistake: "Using too many hue categories in a scatter plot. More than ~6 colors become hard to distinguish. Use `style=` for a second variable, or facet with `sns.relplot(col=)`.",
        shorthand: {
          verbose: "import seaborn as sns\nimport matplotlib.pyplot as plt\ndata = sns.load_dataset('penguins').dropna()\nsns.scatterplot(data=data, x='bill_length_mm', y='bill_depth_mm')",
          concise: "col='species', hue='sex')",
        },
      },
      {
        id: "lineplot",
        fn: "sns.lineplot()",
        desc: "Plot a relationship between two variables as a line with confidence band.",
        category: "Relational",
        subtitle: "Aggregates multiple y values per x — shows mean + CI band",
        signature: "sns.lineplot(data, x=\"x\", y=\"y\", hue=\"group\", errorbar=\"ci\")",
        descLong: "lineplot() automatically aggregates multiple y values at each x and draws the mean with a 95% CI band. Use errorbar=None to disable the band. Use units= to draw one line per subject without aggregation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.lineplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             auto-aggregates duplicate x values into\n#             mean + 95% CI band.\n#             \"raw lines per subject\" or errorbar=None.\n#\nimport seaborn as sns\nfmri = sns.load_dataset(\"fmri\")\nsns.lineplot(data=fmri, x=\"timepoint\", y=\"signal\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.lineplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.lineplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             for grouping, errorbar choices (CI, SD,\n#             None), units= for per-subject lines, and\n#             markers for sparse time series.\n#             repeated-measures analysis use daily.\n#             surprise — senior.\n#\nimport seaborn as sns\nfmri = sns.load_dataset(\"fmri\")\n# Group + style\nsns.lineplot(data=fmri, x=\"timepoint\", y=\"signal\",\n              hue=\"region\", style=\"event\")\n# Error band variants\nsns.lineplot(data=fmri, x=\"timepoint\", y=\"signal\",\n              errorbar=\"sd\")               # std dev band\nsns.lineplot(data=fmri, x=\"timepoint\", y=\"signal\",\n              errorbar=None)               # mean only\n# One line per subject — no aggregation\nsns.lineplot(data=fmri, x=\"timepoint\", y=\"signal\",\n              units=\"subject\", estimator=None,\n              alpha=0.3, color=\"steelblue\")\n# Markers at each x\nsns.lineplot(data=fmri, x=\"timepoint\", y=\"signal\",\n              hue=\"region\", markers=True, dashes=False)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.lineplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             AGGREGATES duplicate x values into mean+CI;\n#             that's surprising for \"I just want to\n#             connect the dots\" use cases. Use\n#             estimator=None or a sorted DataFrame to\n#             control behavior. Pre-aggregate when CI\n#             intervals matter and N is small.\n#             the most common lineplot surprise; pre-\n#             aggregating gives you control over the CI\n#             method.\n#             aggregating loses the per-row visual.\n#\nimport seaborn as sns\nfmri = sns.load_dataset(\"fmri\")\n# 1. Auto-aggregate (default): mean + 95% bootstrap CI\nsns.lineplot(data=fmri, x=\"timepoint\", y=\"signal\",\n              hue=\"region\", errorbar=(\"ci\", 95),\n              n_boot=1000, seed=42)        # reproducible bootstrap\n# 2. \"Just connect the dots\" — no aggregation\ndf_sorted = fmri.sort_values(\"timepoint\")\nsns.lineplot(data=df_sorted.head(50),       # one row per x\n              x=\"timepoint\", y=\"signal\",\n              estimator=None)               # no aggregation\n# 3. Pre-aggregate for explicit CI math\nagg = (fmri.groupby([\"region\", \"timepoint\"])[\"signal\"]\n            .agg([\"mean\", \"std\", \"count\"])\n            .reset_index())\nagg[\"se\"] = agg[\"std\"] / agg[\"count\"].pow(0.5)\n# Now plot agg directly with custom error band (matplotlib)\n# Decision rule:\n#   long-form data, want mean + CI band   -> lineplot (default)\n#   want raw connecting line, no CI       -> estimator=None + sorted data\n#   per-subject lines without aggregation -> units= + estimator=None\n#   show std-dev band, not bootstrap CI   -> errorbar=\"sd\"\n#   suppress band on dense data           -> errorbar=None\n#   color-only group encoding             -> hue= with dashes=False\n#\n# Anti-pattern: passing wide-form / unsorted data to lineplot and expecting \"connect the dots\".\n#   Seaborn aggregates duplicate x values into mean+95% CI by default — the chart you get is\n#   NOT a connection of your raw rows. Either sort_values(x) and set estimator=None for a true\n#   polyline, or accept the aggregation and check errorbar= matches the band you intend.\n#   If you truly want one line per subject, units=\"subject_id\" + estimator=None."
                  }
        ],
        tips: [
                  "`errorbar=None` turns off aggregation display — just the mean line",
                  "`estimator=None` with `units=` draws one line per unit — no aggregation at all",
                  "`dashes=False` uses color only to distinguish groups (not dashes) — cleaner for colorful plots",
                  "`markers=True` adds a marker at each x position — useful for sparse time series"
        ],
        mistake: "Expecting `lineplot()` to just connect dots in order. It aggregates multiple y values per x by default. Use `estimator=None` and sort your data first to get a simple connecting line.",
        shorthand: {
          verbose: "import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nfmri = sns.load_dataset('fmri')",
          concise: "hue='region', markers=True, dashes=False)",
        },
      },
      {
        id: "relplot",
        fn: "sns.relplot()",
        desc: "Figure-level relational plot with faceting.",
        category: "Relational",
        subtitle: "Figure-level wrapper for scatterplot and lineplot with col= and row=",
        signature: "sns.relplot(data, x=\"x\", y=\"y\", col=\"group\", kind=\"scatter\")",
        descLong: "relplot() is the figure-level version of scatterplot and lineplot. It adds faceting via col= and row=. Returns a FacetGrid.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.relplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             col= or row= to facet across a categorical.\n#             FacetGrid customization.\n#\nimport seaborn as sns\nfmri = sns.load_dataset(\"fmri\")\ng = sns.relplot(data=fmri, x=\"timepoint\", y=\"signal\",\n                 col=\"region\", kind=\"line\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.relplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.relplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             switches scatter/line, col=+row= facet\n#             across two dims, hue= overlays groups\n#             within a panel. Customize via the returned\n#             FacetGrid.\n#             a grid of similar charts.\n#             tradeoffs — senior.\n#\nimport seaborn as sns\nfmri = sns.load_dataset(\"fmri\")\n# Faceted line plot\ng = sns.relplot(data=fmri, x=\"timepoint\", y=\"signal\",\n                 col=\"region\", hue=\"event\",\n                 kind=\"line\",\n                 height=4, aspect=0.9)\ng.set_axis_labels(\"Time\", \"Signal\")\ng.set_titles(\"Region: {col_name}\")\ng.figure.suptitle(\"FMRI Signal by Region\", y=1.02)\ng.add_legend(title=\"Event\")\n# Row + col faceting (full grid)\nsns.relplot(data=fmri, x=\"timepoint\", y=\"signal\",\n             col=\"region\", row=\"event\",\n             kind=\"line\", height=3)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.relplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             OWN their figures (no ax= argument); use\n#             col_wrap to keep row count manageable;\n#             g.refline() / g.map_dataframe() for shared\n#             reference lines and per-panel overlays.\n#             refline/map_dataframe scale facet\n#             customization without a Python loop.\n#             trying to combine into matplotlib\n#             subplots; map_dataframe takes effort to\n#             learn.\n#\nimport seaborn as sns\nfmri = sns.load_dataset(\"fmri\")\ng = sns.relplot(\n    data=fmri, x=\"timepoint\", y=\"signal\",\n    col=\"region\", col_wrap=2,             # wrap many facets\n    hue=\"event\",\n    kind=\"line\",\n    errorbar=(\"ci\", 95),\n    height=3.5, aspect=1.0,\n)\n# Reference line on every facet\ng.refline(y=0, color=\"black\", linestyle=\":\", linewidth=0.8)\n# Decision rule:\n#   single panel into existing axes       -> sns.scatterplot/lineplot(ax=)\n#   small multiples / faceted view        -> sns.relplot\n#   many facets, one categorical          -> col_wrap=N\n#   facet across two dims                 -> col= AND row=\n#   shared reference line per facet       -> g.refline(y=...)\n#   per-panel custom annotation           -> g.map_dataframe(callable)\n#\n# Anti-pattern: trying to embed a relplot grid inside a custom plt.subplots() layout.\n#   relplot is figure-level — it OWNS its figure and ax= raises a TypeError. If you need\n#   the small-multiples grid, commit to relplot and customize via the FacetGrid (g.set_titles,\n#   g.refline, g.figure.suptitle). If you need a tight matplotlib subplot layout, use the\n#   axes-level scatterplot/lineplot with ax= per cell instead."
                  }
        ],
        tips: [
                  "`col_wrap=3` wraps facets into a grid when you have many groups",
                  "FacetGrid customization: `g.set_axis_labels()`, `g.set_titles()`, `g.figure.suptitle()`",
                  "`height=` sets panel height in inches; `aspect=` sets width/height ratio",
                  "Use `relplot` when you want small multiples; use `scatterplot`/`lineplot` for single panels"
        ],
        mistake: "Passing `ax=` to `sns.relplot()`. It is a figure-level function that creates its own Figure. Use `sns.scatterplot()` or `sns.lineplot()` with `ax=` for subplot layouts.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\nfmri = sns.load_dataset('fmri')\ng = sns.relplot(",
          concise: ")",
        },
      },
      {
        id: "catplot",
        fn: "sns.catplot()",
        desc: "Figure-level categorical plot with faceting.",
        category: "Categorical",
        subtitle: "Figure-level wrapper for all categorical plots with col= and row=",
        signature: "sns.catplot(data, x=\"g\", y=\"v\", col=\"facet\", kind=\"box\")",
        descLong: "catplot() is the figure-level version of all categorical axes-level plots. kind= selects the plot type: strip, swarm, box, violin, boxen, bar, count, or point. Adds col= and row= faceting. Returns a FacetGrid.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.catplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             plots. kind= selects the type, col=/row= add\n#             faceting.\n#             with built-in faceting.\n#             customization.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.catplot(data=df, x=\"day\", y=\"total_bill\",\n             col=\"time\", kind=\"box\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.catplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.catplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             the plot type (box/violin/swarm/bar/...);\n#             col= and row= facet across categories;\n#             hue= overlays a third variable per panel.\n#             across facets\" pattern; kind= is the\n#             one-line switch between box/violin/etc.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# kind= selects the underlying plot\ng = sns.catplot(\n    data=df, x=\"day\", y=\"total_bill\",\n    col=\"time\", hue=\"sex\",\n    kind=\"box\",                  # box|violin|strip|swarm|boxen|bar|count|point\n    height=5, aspect=0.8,\n)\n# Available kinds\n# strip / swarm  - raw points\n# box / boxen / violin - distribution summaries\n# bar / count / point - aggregate summaries\n# Two-dimension faceting\nsns.catplot(data=df, x=\"day\", y=\"total_bill\",\n             col=\"time\", row=\"sex\",\n             kind=\"violin\", height=3)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.catplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             directly to the underlying plot's tradeoffs\n#             (boxplot for quartiles, violin for shape,\n#             swarm/strip for raw points). col_wrap= and\n#             sharex/sharey for many facets. Pre-sort\n#             categories with order=.\n#             tools you already know; sharey=False is\n#             essential when facets have very different\n#             scales.\n#             over (no ax=); too many kinds to remember\n#             without a quick-reference.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\ng = sns.catplot(\n    data=df, x=\"day\", y=\"total_bill\",\n    col=\"time\", col_wrap=2,\n    kind=\"violin\",\n    inner=\"quartile\",\n    order=[\"Thur\", \"Fri\", \"Sat\", \"Sun\"],\n    sharey=False,                 # each facet has its own y range\n    height=4, aspect=1.0,\n)\n# Decision rule:\n#   median + IQR per category       -> kind=\"box\"\n#   distribution shape              -> kind=\"violin\"\n#   small N, every point            -> kind=\"swarm\" or \"strip\"\n#   mean + CI per category          -> kind=\"bar\"\n#   raw counts                      -> kind=\"count\"\n#   ordinal x with trend            -> kind=\"point\"\n#   panels span very different y    -> sharey=False\n#   single panel inside subplots    -> use axes-level (boxplot, etc.)\n#\n# Anti-pattern: catplot inside plt.subplots() expecting it to land in one cell.\n#   catplot is figure-level — it builds its own Figure and silently produces a SECOND figure\n#   while leaving your subplots cell empty. The fix: pick the matching axes-level function\n#   (boxplot, violinplot, stripplot, ...) with ax=axes[i,j] when integrating into a custom\n#   layout. Reach for catplot only when you want the small-multiples grid it builds."
                  }
        ],
        tips: [
                  "catplot is the go-to for faceted categorical plots — replaces building subplots manually",
                  "`kind=\"boxen\"` (letter-value plot) is a better boxplot for large datasets — shows more quantiles",
                  "Returns a FacetGrid — customize with `g.set_axis_labels()`, `g.set_titles()`, `g.figure.suptitle()`",
                  "`col_wrap=2` wraps columns into a grid — useful when you have many facets"
        ],
        mistake: "Passing ax= to catplot. It is a figure-level function that creates its own Figure. Use the axes-level equivalent (boxplot, violinplot, etc.) when you need to place a plot in an existing Axes.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\ng = sns.catplot(",
          concise: "g.figure.suptitle('Bills by Day and Time', y=1.02)",
        },
      },
      {
        id: "regplot",
        fn: "sns.regplot()",
        desc: "Scatter plot with a fitted regression line and confidence band.",
        category: "Regression",
        subtitle: "Axes-level regression visualization with optional polynomial or lowess fit",
        signature: "sns.regplot(data, x=\"x\", y=\"y\", order=1, logistic=False)",
        descLong: "regplot() draws a scatter plot and fits a regression line with a 95% CI band. order= for polynomial regression, logistic=True for logistic regression (binary y), lowess=True for non-parametric smoothing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.regplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             band in one call.\n#             relationship?\" diagnostic.\n#             lowess for non-linear fits.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.regplot(data=df, x=\"total_bill\", y=\"tip\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.regplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.regplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             polynomials, logistic= for binary y,\n#             lowess= for non-parametric smoothing,\n#             scatter_kws/line_kws to style the parts.\n#             needs; logistic regplot is the cleanest\n#             visualization of binary outcomes.\n#             \"use lmplot for facets\" rule — senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Linear with style controls\nsns.regplot(data=df, x=\"total_bill\", y=\"tip\",\n             scatter_kws={\"alpha\": 0.4, \"s\": 20},\n             line_kws={\"color\": \"red\", \"linewidth\": 2})\n# Polynomial fit\nsns.regplot(data=df, x=\"total_bill\", y=\"tip\", order=2)\n# Logistic regression (binary y, with jitter for visibility)\ndf[\"big_tip\"] = (df[\"tip\"] / df[\"total_bill\"] > 0.2).astype(int)\nsns.regplot(data=df, x=\"total_bill\", y=\"big_tip\",\n             logistic=True, y_jitter=0.03)\n# Non-parametric LOWESS smoother\nsns.regplot(data=df, x=\"total_bill\", y=\"tip\",\n             lowess=True, line_kws={\"color\": \"red\"})"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.regplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             residuals (residplot) before trusting a\n#             linear fit; ci=None at large N (band gets\n#             unreadably narrow); pair with statsmodels\n#             when you need actual coefficients.\n#             diagnostic; statsmodels gives the numeric\n#             story regplot suggests.\n#             you need statsmodels.OLS for that;\n#             residual checks add a second chart.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nimport statsmodels.formula.api as smf\ndf = sns.load_dataset(\"tips\")\n# Visual diagnostic side-by-side\nfig, axes = plt.subplots(1, 2, figsize=(12, 4),\n                          layout=\"constrained\")\nsns.regplot(data=df, x=\"total_bill\", y=\"tip\",\n             ax=axes[0])\nsns.residplot(data=df, x=\"total_bill\", y=\"tip\",\n                lowess=True,\n                line_kws={\"color\": \"red\"},\n                ax=axes[1])\naxes[1].axhline(0, color=\"black\", linewidth=0.5)\n# Numeric backing — coefficients, p-values, R^2\nfit = smf.ols(\"tip ~ total_bill\", data=df).fit()\nprint(fit.summary())\n# Decision rule:\n#   single panel, linear               -> regplot (default)\n#   curved relationship                -> regplot(order=2) OR lowess=True\n#   binary y                           -> regplot(logistic=True)\n#   need facets per group              -> lmplot\n#   need actual coefficients/p-values  -> statsmodels.OLS\n#   too many points, narrow band       -> ci=None\n#   style scatter and line separately  -> scatter_kws=, line_kws=\n#\n# Anti-pattern: trusting the regplot line+CI band without ever looking at residuals.\n#   regplot fits a model and draws a line — it cannot tell you if the linear assumption\n#   is correct. Curved residuals mean the line is the wrong shape; fan-shaped residuals\n#   mean heteroscedasticity invalidates the CI. ALWAYS pair regplot with residplot(lowess=True);\n#   if the residual lowess line is not flat at zero, switch to order=2 / lowess=True / log(y)."
                  }
        ],
        tips: [
                  "`ci=None` disables the confidence band — useful when n is large and the band is very narrow",
                  "`lowess=True` reveals non-linear relationships without assuming a functional form",
                  "`order=2` fits a quadratic — check if the curve is meaningfully better before using it",
                  "Use `sns.lmplot()` (figure-level) for the same plot with `col=` and `row=` faceting"
        ],
        mistake: "Interpreting the CI band as a prediction interval. It is the **confidence interval for the regression line** — uncertainty in the mean, not the range for individual observations.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.regplot(data=df, x='total_bill', y='tip',",
          concise: "scatter=False)",
        },
      },
      {
        id: "lmplot",
        fn: "sns.lmplot()",
        desc: "Figure-level regression plot with faceting and grouping.",
        category: "Relational",
        subtitle: "Figure-level regplot — adds col=, row=, and hue= grouping",
        signature: "sns.lmplot(data, x=\"x\", y=\"y\", hue=\"group\", col=\"facet\")",
        descLong: "lmplot() is the figure-level version of regplot. It adds hue= grouping (separate regression lines per group) and col=/row= faceting. Returns a FacetGrid.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.lmplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             separate fitted line per group.\n#             grouped regression.\n#             scatter=False for line-only comparison.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.lmplot(data=df, x=\"total_bill\", y=\"tip\", hue=\"sex\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.lmplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.lmplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             grouped lines, col=/row= for faceting,\n#             scatter=False for line-only group\n#             comparison, order= for polynomial fits.\n#             slopes?\" visualization.\n#             distinction or robust regression — senior.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Grouped lines + faceted\ng = sns.lmplot(data=df, x=\"total_bill\", y=\"tip\",\n                col=\"time\", hue=\"sex\",\n                height=5, aspect=0.9)\ng.set_axis_labels(\"Total Bill ($)\", \"Tip ($)\")\n# Slope comparison without scatter clutter\nsns.lmplot(data=df, x=\"total_bill\", y=\"tip\",\n            hue=\"sex\", scatter=False)\n# Polynomial fit per group\nsns.lmplot(data=df, x=\"total_bill\", y=\"tip\",\n            hue=\"sex\", order=2)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.lmplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             figure (no ax=); use robust=True to\n#             down-weight outliers, ci=None at large N,\n#             and pair with statsmodels when you need\n#             interaction coefficients (group * x).\n#             that ordinary regression bends to;\n#             statsmodels gives the actual interaction\n#             test that lmplot suggests visually.\n#             uncertainty info; statsmodels is a\n#             separate dep.\n#\nimport seaborn as sns\nimport statsmodels.formula.api as smf\ndf = sns.load_dataset(\"tips\")\n# Robust regression — resistant to outliers\ng = sns.lmplot(data=df, x=\"total_bill\", y=\"tip\",\n                hue=\"sex\",\n                robust=True,                  # iteratively reweighted\n                ci=None,                       # cleaner with many points\n                height=5, aspect=1.0)\n# Numeric: do slopes actually differ across groups?\nfit = smf.ols(\"tip ~ total_bill * sex\", data=df).fit()\nprint(fit.params)                              # interaction coefficient\n# Decision rule:\n#   single panel, line + scatter        -> regplot\n#   grouped lines, no facets            -> lmplot(hue=)\n#   facets across categories            -> lmplot(col=, hue=)\n#   outlier-heavy data                  -> lmplot(robust=True)\n#   need to TEST slope differences      -> statsmodels with interaction term\n#   compare slopes only, no points      -> lmplot(scatter=False)\n#   curved within group                 -> lmplot(order=2)\n#\n# Anti-pattern: showing four lmplot panels with visibly different slopes and concluding\n# \"groups have different slopes\" without a statistical test.\n#   The CI bands often overlap once you actually look at the numbers — the visual is\n#   suggestive, not conclusive. The right pipeline is: lmplot for the picture, then\n#   smf.ols(\"y ~ x * group\", data=df) and inspect the interaction coefficient + p-value.\n#   robust=True helps if outliers are bending the OLS slope."
                  }
        ],
        tips: [
                  "`hue=` draws a separate regression line per group — the most common use case for lmplot",
                  "`scatter=False` shows only the regression lines — cleaner for comparing slopes across groups",
                  "Customize using `g.set_axis_labels()`, `g.set_titles()`, `g.figure.suptitle()`",
                  "For a single panel without faceting, `sns.regplot()` (axes-level) is simpler"
        ],
        mistake: "Using lmplot inside `plt.subplots()`. lmplot creates its own Figure — it cannot be placed in an existing Axes. Use `sns.regplot()` for subplot layouts.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nsns.lmplot(data=df, x='total_bill', y='tip',",
          concise: "order=2)",
        },
      },
      {
        id: "residplot",
        fn: "sns.residplot()",
        desc: "Plot residuals of a linear regression to check model fit.",
        category: "Regression",
        subtitle: "Diagnose non-linearity — residuals should scatter randomly around 0",
        signature: "sns.residplot(data, x=\"x\", y=\"y\", lowess=True)",
        descLong: "residplot() plots the residuals (actual - predicted) against the predictor variable. Residuals that scatter randomly around y=0 indicate a good linear fit. Curved patterns indicate non-linearity — the linear model is misspecified.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.residplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             predictor. Expect random scatter around 0.\n#             diagnostic.\n#             interpretation rules.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.residplot(data=df, x=\"total_bill\", y=\"tip\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.residplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.residplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             smoother to reveal systematic patterns,\n#             reference line at y=0, interpretation\n#             rules for the four canonical patterns.\n#             into a binary visual answer.\n#             checks (Q-Q plots) or heteroscedasticity\n#             — senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nax = sns.residplot(data=df, x=\"total_bill\", y=\"tip\",\n                    lowess=True,\n                    line_kws={\"color\": \"red\", \"linewidth\": 2})\nax.axhline(0, color=\"black\", linewidth=0.5)\n# Pattern interpretation:\n# - flat horizontal scatter -> linear model is fine\n# - U-shape / curve          -> non-linear; try polynomial or log(x)\n# - fan shape (widening)     -> heteroscedasticity; try log(y)\n# - outliers far from 0      -> influential observations"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.residplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             of four standard regression diagnostics.\n#             Combine with histplot/Q-Q for normality,\n#             scale-location for heteroscedasticity, and\n#             leverage for influential points. Use\n#             statsmodels' built-in plot suite when\n#             possible.\n#             industry-standard regression check;\n#             statsmodels.graphics gives all four with\n#             one import.\n#             teams stop at residplot — fine for\n#             exploration, not for publication.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nimport statsmodels.api as sm\nimport statsmodels.formula.api as smf\ndf = sns.load_dataset(\"tips\")\nfit = smf.ols(\"tip ~ total_bill\", data=df).fit()\ndf[\"resid\"] = fit.resid\nfig, axes = plt.subplots(2, 2, figsize=(11, 8),\n                          layout=\"constrained\")\n# 1. Residuals vs fitted\nsns.residplot(data=df, x=\"total_bill\", y=\"tip\",\n                lowess=True, ax=axes[0, 0],\n                line_kws={\"color\": \"red\"})\naxes[0, 0].axhline(0, color=\"black\", linewidth=0.5)\naxes[0, 0].set_title(\"Residuals vs predictor\")\n# 2. Histogram of residuals\nsns.histplot(df[\"resid\"], kde=True, ax=axes[0, 1])\naxes[0, 1].set_title(\"Residual distribution\")\n# 3. Q-Q plot (normality)\nsm.qqplot(fit.resid, line=\"45\", ax=axes[1, 0])\naxes[1, 0].set_title(\"Q-Q plot\")\n# 4. Scale-location for heteroscedasticity\nsns.scatterplot(x=fit.fittedvalues,\n                 y=(fit.resid.abs()) ** 0.5,\n                 ax=axes[1, 1])\naxes[1, 1].set_title(\"Scale-location\")\n# Decision rule:\n#   quick \"is linear OK?\" check          -> sns.residplot(lowess=True)\n#   curved lowess line                   -> add polynomial term or log(x)\n#   fan-shaped residuals                 -> log(y) or weighted regression\n#   normality check on residuals         -> histplot(kde=True) + sm.qqplot\n#   full diagnostic suite                -> statsmodels.graphics.regressionplots\n#   non-parametric alt to residuals      -> regplot(lowess=True) overlay\n#\n# Anti-pattern: skipping residplot after sns.regplot and reporting an R^2 from a clearly\n# misspecified linear fit.\n#   regplot will happily fit a line through quadratic data; the R^2 looks decent but\n#   residuals show the curve. Without residplot you'll publish \"y is linearly related to x\"\n#   when the true model is order=2 or log(x). The residual lowess line should be flat at\n#   y=0 with constant spread — anything else means \"the model is wrong, transform something\"."
                  }
        ],
        tips: [
                  "`lowess=True` adds a smoother — the red line reveals systematic patterns in the residuals",
                  "A straight horizontal lowess line through 0 confirms the linear assumption is valid",
                  "Fan-shaped residuals (increasing spread with x) suggest `log(y)` transformation",
                  "Pair residplot with histplot of residuals to check the normality assumption"
        ],
        mistake: "Not checking residuals after fitting a linear model. A curved residual pattern means the linear model is wrong — the relationship requires a transformation or polynomial term.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
    ],
  },

  // ── Section 4: Matrix & Pairwise Plots ─────────────────────────────────────────
  {
    id: "matrix",
    title: "Matrix & Pairwise Plots",
    entries: [
      {
        id: "heatmap",
        fn: "sns.heatmap()",
        desc: "Visualize a 2D matrix with color encoding.",
        category: "Matrix",
        subtitle: "Correlation matrices, confusion matrices, pivot tables",
        signature: "sns.heatmap(data, annot=True, fmt=\".2f\", cmap=\"RdBu_r\", center=0)",
        descLong: "heatmap() encodes matrix values as colors. For correlation matrices, always use a diverging colormap centered at 0. annot=True displays values in cells. Mask the upper triangle to avoid duplicating correlations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.heatmap() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             confusion) as a colored grid with annot=\n#             values inside cells.\n#             imshow + ax.text loop.\n#             masking, or fmt= choice for ints vs floats.\n#\nimport seaborn as sns\nsns.heatmap(df.corr(), annot=True, fmt=\".2f\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.heatmap() — common patterns you'll see in production.\n# APPROACH  - Combine sns.heatmap() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             colormap centered at 0 for correlations,\n#             vmin/vmax for fair scales, square=True for\n#             cells, mask= upper triangle to drop\n#             redundancy.\n#             combo is the canonical correlation heatmap.\n#             matrices — senior tier covers them.\n#\nimport numpy as np, seaborn as sns\ncorr = df.select_dtypes(\"number\").corr()\nmask = np.triu(np.ones_like(corr, dtype=bool))    # upper triangle\nsns.heatmap(\n    corr, mask=mask,\n    annot=True, fmt=\".2f\",\n    cmap=\"RdBu_r\", center=0, vmin=-1, vmax=1,\n    square=True, linewidths=0.5,\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.heatmap() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             matrix kind (correlation/confusion/pivot),\n#             use cbar_kws to shrink the colorbar in\n#             multi-panel figures, and reach for\n#             ax.set_xticklabels(rotation=45, ha=\"right\")\n#             when labels are long.\n#             eliminates the most common heatmap\n#             misuse; rotation handling fixes label\n#             collision.\n#             confusion matrices (use a sequential\n#             colormap there).\n#\nimport numpy as np, seaborn as sns, matplotlib.pyplot as plt\n# Confusion matrix — sequential cmap, integer fmt\nfig, ax = plt.subplots(figsize=(6, 5))\nsns.heatmap(cm, annot=True, fmt=\"d\", cmap=\"Blues\",\n             xticklabels=labels, yticklabels=labels, ax=ax)\nax.set_xlabel(\"Predicted\"); ax.set_ylabel(\"Actual\")\nplt.setp(ax.get_xticklabels(), rotation=45, ha=\"right\")\n# Pivot table — sequential or diverging by data sign\npivot = df.pivot_table(\"sales\", index=\"product\", columns=\"region\")\nsns.heatmap(pivot, annot=True, fmt=\".0f\", cmap=\"YlOrRd\")\n# Decision rule:\n#   correlation [-1, 1]         -> RdBu_r diverging, center=0,  fmt=\".2f\"\n#   confusion matrix            -> Blues sequential,            fmt=\"d\"\n#   pivot table, signed         -> RdBu_r diverging, center=0\n#   pivot table, unsigned       -> viridis / YlOrRd sequential, fmt=\".0f\"\n#   correlation matrix          -> mask=upper triangle + square=True\n#   want clustered reordering   -> sns.clustermap (not heatmap)\n#   long category labels        -> rotate xticklabels 45 + ha=\"right\"\n#\n# Anti-pattern: using a sequential colormap (Blues, viridis) on a correlation matrix.\n#   Correlation ranges from -1 to +1 — a sequential cmap maps 0 (no relationship) to a\n#   nondescript mid-color and -0.8 reads as a small value next to +0.8. The fix is always\n#   diverging (RdBu_r / coolwarm) with center=0, vmin=-1, vmax=1. Same trap on any signed\n#   pivot table; only unsigned magnitudes get sequential."
                  }
        ],
        tips: [
                  "Always use a **diverging** colormap (`RdBu_r`, `coolwarm`) with `center=0` for correlation matrices",
                  "`mask=np.triu(np.ones_like(corr, dtype=bool))` hides the upper triangle — avoids duplicate information",
                  "`fmt=\"d\"` for integer annotations (confusion matrices); `fmt=\".2f\"` for floats",
                  "`square=True` makes cells square — cleaner for correlation matrices"
        ],
        mistake: "Using a sequential colormap (Blues, Greens) for a correlation matrix. Correlation ranges from -1 to +1 — use a diverging colormap so positive and negative values read clearly.",
        shorthand: {
          verbose: "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nimport numpy as np",
          concise: "sns.heatmap(pivot, annot=True, fmt='.0f', cmap='YlOrRd')",
        },
      },
      {
        id: "pairplot",
        fn: "sns.pairplot()",
        desc: "Plot all pairwise relationships in a dataset.",
        category: "Matrix",
        subtitle: "Scatter matrix — diagonal shows each variable's distribution",
        signature: "sns.pairplot(data, hue=\"group\", diag_kind=\"kde\")",
        descLong: "pairplot() creates a grid of scatter plots for all pairs of numeric variables, with distribution plots on the diagonal. Use hue= to color by a categorical variable. Slow on large datasets — sample first.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.pairplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             scatterplots plus marginal histograms on\n#             the diagonal.\n#             my dataset\" diagnostic.\n#             the diagonal.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"iris\")\nsns.pairplot(df, hue=\"species\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.pairplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.pairplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             group-color, vars= to limit columns,\n#             diag_kind=\"kde\" for cleaner marginals,\n#             plot_kws/diag_kws to style sub-plots.\n#             EDA — color-by-class, focused subset.\n#             grids — senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"iris\")\nsns.pairplot(\n    df,\n    vars=[\"sepal_length\", \"petal_length\", \"petal_width\"],\n    hue=\"species\",\n    diag_kind=\"kde\",\n    plot_kws={\"alpha\": 0.5, \"s\": 30},\n    diag_kws={\"fill\": True},\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.pairplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             on big DataFrames (pairplot is N x M\n#             scatters), cap variables to the most\n#             important 4-6, switch to PairGrid when\n#             you need different plots in upper/lower\n#             triangles.\n#             moment; PairGrid is the right tool for\n#             \"scatter above, KDE below\" presentations.\n#             PairGrid takes more setup than pairplot.\n#\nimport seaborn as sns\ndf = big_df.sample(2000, random_state=42)        # SAMPLE FIRST\ng = sns.PairGrid(df,\n                  vars=[\"x1\", \"x2\", \"x3\", \"x4\"],\n                  hue=\"class\",\n                  diag_sharey=False)\ng.map_upper(sns.scatterplot, alpha=0.5, s=20)\ng.map_lower(sns.kdeplot, fill=True, alpha=0.3)\ng.map_diag(sns.histplot, kde=True)\ng.add_legend()\n# Decision rule:\n#   N <= 1k, want everything            -> sns.pairplot\n#   N <= 1k, asymmetric upper/lower     -> sns.PairGrid\n#   N > 5k                              -> SAMPLE then pairplot or PairGrid\n#   > 6 numeric columns                 -> vars= to limit; full grid is unreadable\n#   color by class                      -> hue= with diag_kind=\"kde\"\n#   need stats annotated per cell       -> PairGrid + custom callable\n#\n# Anti-pattern: calling pairplot on a 50k-row, 30-column DataFrame and walking away.\n#   You'll get an N x M scatter grid that hangs Jupyter, then renders cells too small to\n#   read. Always: (1) SAMPLE first via df.sample(2000, random_state=42); (2) use vars=\n#   to cap at 4-6 of the most relevant columns; (3) reach for PairGrid + map_lower(kdeplot)\n#   when scatter overplotting eats the signal."
                  }
        ],
        tips: [
                  "`pairplot()` is slow on large DataFrames — sample first: `df.sample(500)` before passing in",
                  "Use `vars=` to limit to the most important columns — avoids an unwieldy grid",
                  "`sns.PairGrid()` gives full control over what appears in the upper, lower, and diagonal cells",
                  "The diagonal shows each variable's marginal distribution — `diag_kind=\"kde\"` is often cleaner than \"hist\""
        ],
        mistake: "Running pairplot on a DataFrame with 20+ columns. The resulting grid is unreadably small. Limit to 4-6 key variables with `vars=`.",
        shorthand: {
          verbose: "import numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('iris')",
          concise: "g.add_legend()",
        },
      },
      {
        id: "jointplot",
        fn: "sns.jointplot()",
        desc: "Bivariate plot with marginal distributions on each axis.",
        category: "Matrix",
        subtitle: "Scatter + marginals — shows joint and individual distributions together",
        signature: "sns.jointplot(data, x=\"x\", y=\"y\", kind=\"scatter\")",
        descLong: "jointplot() combines a central bivariate plot (scatter, hex, kde, etc.) with marginal univariate plots on each axis. The marginals show the distribution of each variable individually. Returns a JointGrid object.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.jointplot() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             histograms on each axis. One call, full\n#             distribution overview.\n#             group plotting.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\nsns.jointplot(data=df, x=\"total_bill\", y=\"tip\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.jointplot() — common patterns you'll see in production.\n# APPROACH  - Combine sns.jointplot() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             default), kde for smooth, hex for big\n#             data, reg for trend, resid for residuals.\n#             actually need.\n#             has no hue=) — senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\n# Different kinds for different stories\nsns.jointplot(data=df, x=\"total_bill\", y=\"tip\", kind=\"kde\", fill=True)\nsns.jointplot(data=df, x=\"total_bill\", y=\"tip\", kind=\"hex\", gridsize=20)\nsns.jointplot(data=df, x=\"total_bill\", y=\"tip\", kind=\"reg\")\n# kind= options: \"scatter\" | \"kde\" | \"hist\" | \"hex\" | \"reg\" | \"resid\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.jointplot() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             support hue=. For per-group color, build\n#             a JointGrid and plot per group manually.\n#             Access sub-axes (ax_joint, ax_marg_x,\n#             ax_marg_y) for full customization.\n#             multi-group joint visualization seaborn's\n#             higher-level helpers can't.\n#             argument; sub-axes manipulation requires\n#             reading seaborn's internal layout.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\ng = sns.JointGrid(data=df, x=\"total_bill\", y=\"tip\", height=6)\nfor sex, group in df.groupby(\"sex\"):\n    sns.scatterplot(data=group, x=\"total_bill\", y=\"tip\",\n                     ax=g.ax_joint, label=sex, alpha=0.6)\n    sns.kdeplot(data=group, x=\"total_bill\",\n                 ax=g.ax_marg_x, fill=True, alpha=0.3)\n    sns.kdeplot(data=group, y=\"tip\",\n                 ax=g.ax_marg_y, fill=True, alpha=0.3)\ng.ax_joint.legend()\n# Decision rule:\n#   simple bivariate + marginals       -> sns.jointplot\n#   per-group color (multiple hues)    -> sns.JointGrid + per-group loop\n#   marginals only on a scatter        -> JointGrid + plot_marginals(rugplot)\n#   large N with overplotting          -> kind=\"hex\" or kind=\"hist\"\n#   trend line + marginals             -> kind=\"reg\"\n#   smooth bivariate density           -> kind=\"kde\", fill=True\n#\n# Anti-pattern: passing hue= to jointplot expecting per-group color.\n#   jointplot does NOT support hue= and silently ignores it (older versions raised; newer\n#   versions warn). The escape hatch is sns.JointGrid + a per-group loop calling\n#   sns.scatterplot(ax=g.ax_joint) and sns.kdeplot(ax=g.ax_marg_x / ax_marg_y) explicitly.\n#   Reach for sns.displot or sns.relplot if you need a grid of grouped joint plots."
                  }
        ],
        tips: [
                  "`kind=\"kde\"` gives a clean continuous view of the joint distribution",
                  "`kind=\"hex\"` handles overlapping points better than scatter for large datasets",
                  "For per-group coloring, use JointGrid directly — jointplot does not support hue=",
                  "Access sub-axes: `g.ax_joint`, `g.ax_marg_x`, `g.ax_marg_y`"
        ],
        mistake: "Expecting jointplot to support hue=. It does not. For grouped joint plots, use sns.JointGrid() and call plot_joint() and plot_marginals() manually per group.",
        shorthand: {
          verbose: "import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')",
          concise: "g.add_legend()",
        },
      },
      {
        id: "pairgrid",
        fn: "sns.PairGrid()",
        desc: "Custom grid of pairwise plots with full control over each cell.",
        category: "Matrix",
        subtitle: "map_upper(), map_lower(), map_diag() for asymmetric grids",
        signature: "g = sns.PairGrid(df); g.map_upper(fn); g.map_lower(fn); g.map_diag(fn)",
        descLong: "PairGrid gives full control over what plot function appears in each section of the pair grid. map_upper() controls the upper triangle, map_lower() the lower, map_diag() the diagonal.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.PairGrid() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             populates every cell with the same fn.\n#             pairplot when you want full control.\n#             which is the whole reason to use PairGrid.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"iris\")\ng = sns.PairGrid(df)\ng.map(sns.scatterplot)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.PairGrid() — common patterns you'll see in production.\n# APPROACH  - Combine sns.PairGrid() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             plots in upper / lower / diag, x_vars/\n#             y_vars for non-square grids.\n#             reason to use PairGrid over pairplot.\n#             per-cell annotation — senior.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"iris\")\n# Asymmetric grid: scatter above, KDE below, hist diag\ng = sns.PairGrid(df, hue=\"species\", diag_sharey=False)\ng.map_upper(sns.scatterplot, alpha=0.5)\ng.map_lower(sns.kdeplot, fill=True, alpha=0.3)\ng.map_diag(sns.histplot, kde=True)\ng.add_legend()\n# Non-square grid — different x and y variables\ng2 = sns.PairGrid(df,\n                   x_vars=[\"sepal_length\", \"petal_length\"],\n                   y_vars=[\"sepal_width\",  \"petal_width\"])\ng2.map(sns.scatterplot)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.PairGrid() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             receive (x, y, **kwargs) so you can\n#             annotate each cell with stats (correlation,\n#             slope, group mean); pair with map_offdiag\n#             for \"all off-diagonal\" patterns.\n#             is the cleanest way to embed statistics\n#             into pair grids.\n#             only used pairplot; matplotlib annotation\n#             positioning takes practice.\n#\nimport numpy as np, matplotlib.pyplot as plt, seaborn as sns\ndf = sns.load_dataset(\"iris\")\ndef corr_label(x, y, **kw):\n    r = np.corrcoef(x, y)[0, 1]\n    ax = plt.gca()\n    ax.annotate(f\"r={r:.2f}\", xy=(0.05, 0.92),\n                 xycoords=ax.transAxes, fontsize=9)\ng = sns.PairGrid(df, hue=\"species\", diag_sharey=False)\ng.map_upper(sns.scatterplot, alpha=0.5)\ng.map_upper(corr_label)                 # annotate corr in each upper cell\ng.map_lower(sns.kdeplot, fill=True, alpha=0.3)\ng.map_diag(sns.histplot, kde=True)\ng.add_legend()\n# Decision rule:\n#   one plot type, square grid          -> sns.pairplot\n#   asymmetric upper/lower              -> sns.PairGrid\n#   need stats annotations per cell     -> PairGrid + custom callable\n#   different x and y variables         -> PairGrid(x_vars=, y_vars=)\n#   apply same fn off-diagonal          -> g.map_offdiag()\n#   share diagonal scale across rows    -> diag_sharey=True (default off)\n#\n# Anti-pattern: fighting pairplot's symmetric API to get scatter above and KDE below.\n#   pairplot only accepts one plot kind across the whole grid — there is no\n#   \"different upper/lower\" knob. People hack it with vars= twice or two pairplots.\n#   The right tool is sns.PairGrid: g.map_upper(scatterplot), g.map_lower(kdeplot),\n#   g.map_diag(histplot) — a few extra lines but the grid does what you actually want."
                  }
        ],
        tips: [
                  "PairGrid is the right choice when you want scatter above the diagonal and KDE below",
                  "`map_offdiag()` applies a function to all off-diagonal cells (upper + lower)",
                  "`x_vars` and `y_vars` allow non-square grids — useful for comparing two sets of variables",
                  "Individual cell functions receive `x`, `y`, and optional `hue` arrays as arguments"
        ],
        mistake: "Using `pairplot()` when you need different upper/lower triangles. `pairplot()` only supports one plot type per region. Use `PairGrid()` for asymmetric grids.",
        shorthand: {
          verbose: "import numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('iris')",
          concise: "g.map_diag(sns.kdeplot, fill=True)",
        },
      },
      {
        id: "clustermap",
        fn: "sns.clustermap()",
        desc: "Hierarchically clustered heatmap with dendrograms.",
        category: "Matrix",
        subtitle: "Reorders rows and columns to group similar items together",
        signature: "sns.clustermap(data, z_score=0, method=\"ward\", cmap=\"RdBu_r\")",
        descLong: "clustermap() combines a heatmap with hierarchical clustering. Rows and columns are reordered so similar items are adjacent. Dendrograms on the sides show the clustering hierarchy.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.clustermap() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             rows AND columns. Reorders so similar\n#             items sit adjacent.\n#             heatmap with sorted rows hides.\n#             scales or method= for linkage choice.\n#\nimport seaborn as sns\nsns.clustermap(df.corr(), cmap=\"RdBu_r\", center=0)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.clustermap() — common patterns you'll see in production.\n# APPROACH  - Combine sns.clustermap() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             to standardize rows or columns, method=\n#             \"ward\" for compact clusters, col_cluster=\n#             False to keep one axis fixed.\n#             without it, one big-magnitude row dominates\n#             the clustering.\n#             customization — senior tier.\n#\nimport seaborn as sns\n# Correlation matrix (already in [-1, 1])\nsns.clustermap(df.corr(),\n                method=\"ward\",\n                metric=\"euclidean\",\n                cmap=\"RdBu_r\", center=0,\n                annot=True, fmt=\".1f\",\n                figsize=(10, 10))\n# Feature matrix — standardize rows first\nsns.clustermap(data_matrix,\n                z_score=0,                # 0=rows, 1=cols\n                cmap=\"viridis\",\n                figsize=(12, 8))\n# Cluster rows only (keep column order)\nsns.clustermap(data, col_cluster=False)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.clustermap() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             annotations encode external metadata\n#             (treatment group, batch); choose method=\n#             (\"ward\" for compact, \"average\" for\n#             elongated, \"complete\" for chaining-\n#             resistant); always standardize before\n#             clustering on raw features.\n#             my labels?\" visually answerable; the\n#             linkage choice rule prevents the most\n#             common clustering misuse.\n#             pass without manual concat; linkage\n#             choice is data-dependent (no universal\n#             best).\n#\nimport seaborn as sns\nimport pandas as pd\n# Annotation: color rows by class\nrow_colors = pd.Series(labels, index=data.index).map(\n    {\"A\": \"red\", \"B\": \"blue\", \"C\": \"green\"})\ng = sns.clustermap(\n    data,\n    z_score=0,                                # standardize per row\n    method=\"ward\",\n    cmap=\"viridis\",\n    row_colors=row_colors,                    # external annotation\n    col_cluster=True,\n    figsize=(12, 10),\n    cbar_pos=(0.02, 0.85, 0.03, 0.1),\n)\n# Access cluster results\n# g.dendrogram_row.linkage  -> the row linkage matrix\n# Decision rule:\n#   already in [-1, 1] (correlation)         -> z_score=None, RdBu_r, center=0\n#   raw features, varying scale              -> z_score=0 (per row)\n#   compare to known labels                  -> row_colors=\n#   want clusters but keep an axis ordered   -> col_cluster=False\n#   compact clusters                         -> method=\"ward\"\n#   elongated / curved clusters              -> method=\"average\"\n#   correlated features                      -> metric=\"correlation\"\n#\n# Anti-pattern: clustermap on a raw feature matrix without standardization.\n#   If one column is \"income in dollars\" (1e5 scale) and another is \"satisfaction 1-5\",\n#   the distance metric is dominated by the high-magnitude column and clusters reflect\n#   that single feature. ALWAYS pass z_score=0 (standardize per row) or standard_scale=1\n#   (rescale per column) when feature scales differ. For correlation matrices already in\n#   [-1, 1], skip standardization (z_score=None) and use diverging cmap."
                  }
        ],
        tips: [
                  "`z_score=0` standardizes rows before clustering — removes magnitude differences between features",
                  "`method=\"ward\"` minimizes within-cluster variance — generally produces the most compact clusters",
                  "`col_cluster=False` keeps the column order fixed while only clustering rows",
                  "`row_colors=` adds a color bar on the side for external annotations (e.g., treatment group)"
        ],
        mistake: "Passing a raw data matrix with columns of very different scales to clustermap without `z_score=0`. One high-magnitude column dominates the clustering. Always standardize features first.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "facetgrid",
        fn: "sns.FacetGrid()",
        desc: "Create a custom grid of plots using any matplotlib or seaborn function.",
        category: "Matrix",
        subtitle: "Low-level faceting — map_dataframe() for full flexibility",
        signature: "g = sns.FacetGrid(df, col=\"group\"); g.map_dataframe(fn, x=\"col\")",
        descLong: "FacetGrid creates a grid of subplots based on one or more categorical variables. map_dataframe() passes each subset of data to the plotting function. More flexible than displot/catplot/relplot when those do not support your plot type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.FacetGrid() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             manually, then map a plot function\n#             across it.\n#             catplot when those don't support your\n#             plot type.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\ng = sns.FacetGrid(df, col=\"time\", row=\"sex\")\ng.map_dataframe(sns.histplot, x=\"total_bill\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.FacetGrid() — common patterns you'll see in production.\n# APPROACH  - Combine sns.FacetGrid() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             for many panels, margin_titles for\n#             cleaner labels, map_dataframe (passes a\n#             DataFrame; required for seaborn fns) vs\n#             map (passes raw arrays; for matplotlib).\n#             single most-confused FacetGrid issue.\n#             customization — senior tier.\n#\nimport seaborn as sns\ndf = sns.load_dataset(\"tips\")\ng = sns.FacetGrid(df, col=\"time\", row=\"sex\",\n                   height=4, aspect=1.2,\n                   margin_titles=True)\ng.map_dataframe(sns.histplot, x=\"total_bill\", kde=True)\ng.set_axis_labels(\"Total Bill ($)\", \"Count\")\ng.set_titles(col_template=\"{col_name}\", row_template=\"{row_name}\")\ng.add_legend()\n# col_wrap when one categorical has many values\ng2 = sns.FacetGrid(df, col=\"day\", col_wrap=2, height=4)\ng2.map_dataframe(sns.scatterplot, x=\"total_bill\", y=\"tip\",\n                  alpha=0.5)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.FacetGrid() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             reference lines, custom callables that\n#             receive (x, **kwargs) for per-panel\n#             annotations, axes.flat for matplotlib-\n#             level customization, sharey=False when\n#             panels span different scales.\n#             on every panel\" tool; callables unlock\n#             per-panel stats annotations.\n#             sharey=False loses the \"compare panels\n#             at a glance\" benefit.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nimport numpy as np\ndf = sns.load_dataset(\"tips\")\ng = sns.FacetGrid(df, col=\"day\", col_wrap=2,\n                   height=4, sharey=False)\ng.map_dataframe(sns.scatterplot, x=\"total_bill\", y=\"tip\", alpha=0.5)\n# Shared reference line on every panel\ng.refline(y=df[\"tip\"].mean(), color=\"black\", linestyle=\":\")\n# Per-panel annotation via custom callable\ndef annotate_n(data, **kw):\n    ax = plt.gca()\n    ax.text(0.05, 0.95, f\"n={len(data)}\",\n             transform=ax.transAxes, va=\"top\", fontsize=9)\ng.map_dataframe(annotate_n)\n# Decision rule:\n#   built-in seaborn fn (hist/box/scatter)    -> sns.displot/relplot/catplot\n#   custom callable or seaborn fn not covered -> sns.FacetGrid + map_dataframe\n#   matplotlib raw fn (plt.scatter)           -> g.map (passes arrays)\n#   need shared reference lines               -> g.refline()\n#   panels span very different y              -> sharey=False\n#   long row labels                           -> margin_titles=True\n#\n# Anti-pattern: g.map(sns.histplot, \"total_bill\") instead of g.map_dataframe(sns.histplot, x=\"total_bill\").\n#   g.map passes columns as positional 1-D arrays — modern seaborn functions expect data=\n#   plus x=/y= keyword args and silently misread or raise. The rule: use g.map_dataframe()\n#   for any seaborn function (it gets the full DataFrame subset), and reserve g.map() for\n#   raw matplotlib callables like plt.scatter."
                  }
        ],
        tips: [
                  "`map_dataframe()` receives the data subset as a DataFrame — supports all seaborn functions",
                  "`margin_titles=True` puts row titles in the margin instead of above each cell — cleaner layout",
                  "`col_wrap=3` wraps columns into a grid when you have many groups",
                  "`g.axes.flat` lets you iterate over all axes to add custom annotations"
        ],
        mistake: "Using `g.map(sns.histplot, x=\"col\")` instead of `g.map_dataframe(sns.histplot, x=\"col\")`. `map()` passes x as a 1D array; `map_dataframe()` passes the full DataFrame subset — required for seaborn functions that need `data=`.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\ng = sns.FacetGrid(df, col='time', row='sex',",
          concise: "g.axes.flat           # iterate over all axes",
        },
      },
    ],
  },

  // ── Section 5: Setup, Customization & Output ─────────────────────────────────────────
  {
    id: "setup-customization",
    title: "Setup, Customization & Output",
    entries: [
      {
        id: "labels-axes",
        fn: "Axes-level labels",
        desc: "Set title, axis labels, ticks, limits, and legend on an axes-level plot.",
        category: "Customization",
        subtitle: "Axes-level functions return an Axes — use ax.set() for everything",
        signature: "ax.set(title=, xlabel=, ylabel=, xlim=, ylim=)",
        descLong: "Axes-level seaborn functions (histplot, boxplot, scatterplot, etc.) return a Matplotlib Axes object. Use standard ax.set() to set multiple properties at once, ax.tick_params() for tick control, and ax.legend() for legend placement.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Axes-level labels — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             pass it as ax= and then customize with\n#             ax.set() / ax.legend().\n#             nothing seaborn-specific to learn.\n#             tick rotation.\n#\nimport matplotlib.pyplot as plt, seaborn as sns\nfig, ax = plt.subplots()\nsns.boxplot(data=df, x=\"day\", y=\"total_bill\", ax=ax)\nax.set_title(\"Bills by Day\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Axes-level labels — common patterns you'll see in production.\n# APPROACH  - Combine Axes-level labels with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             ax.set() bulk form, tick rotation,\n#             legend placement, grid styling, reference\n#             lines.\n#             tick_params(rotation=45) is the standard\n#             fix for label collision.\n#             scoping — separate entries.\n#\nimport matplotlib.pyplot as plt, seaborn as sns\nfig, ax = plt.subplots(figsize=(10, 6))\nsns.boxplot(data=df, x=\"day\", y=\"total_bill\", hue=\"sex\", ax=ax)\nax.set(\n    title=\"Restaurant Bills by Day and Sex\",\n    xlabel=\"Day\", ylabel=\"Total Bill ($)\",\n    ylim=(0, 60),\n)\nax.tick_params(axis=\"x\", rotation=45, labelsize=10)\nax.legend(title=\"Sex\", loc=\"upper left\", framealpha=0.8)\nax.grid(True, axis=\"y\", linestyle=\"--\", alpha=0.5)\nax.axhline(y=0, color=\"black\", linewidth=0.5, linestyle=\"--\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Axes-level labels — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             plot FIRST, then set labels — some\n#             seaborn functions reset axis properties\n#             on call. Use rc_context for scoped\n#             styling. Override seaborn defaults for\n#             publication.\n#             silent customization losses; rc_context\n#             prevents global state bleed.\n#             learn; some seaborn functions still\n#             override settings inside their body.\n#\nimport matplotlib.pyplot as plt, seaborn as sns\nwith plt.rc_context({\n    \"axes.spines.top\":   False,\n    \"axes.spines.right\": False,\n    \"axes.titlesize\":   13,\n    \"axes.titleweight\": \"bold\",\n    \"axes.labelsize\":   11,\n}):\n    fig, ax = plt.subplots(figsize=(10, 6),\n                            layout=\"constrained\")\n    # PLOT FIRST\n    sns.boxplot(data=df, x=\"day\", y=\"total_bill\",\n                 hue=\"sex\", ax=ax)\n    # THEN CUSTOMIZE\n    ax.set(title=\"Restaurant Bills\",\n            xlabel=\"Day\", ylabel=\"Total Bill ($)\",\n            ylim=(0, 60))\n    ax.legend(title=\"Sex\", loc=\"upper left\", frameon=False)\n# Decision rule:\n#   set 3+ axis properties at once     -> ax.set(title=, xlabel=, ylabel=, xlim=, ylim=)\n#   rotate / resize tick labels        -> ax.tick_params(axis=\"x\", rotation=45)\n#   move legend off the axes           -> ax.legend(bbox_to_anchor=(1.02, 1), loc=\"upper left\")\n#   remove the legend entirely         -> ax.get_legend().remove()\n#   per-figure scoped style override   -> with plt.rc_context({...}):\n#   axes-level seaborn fn returns Axes -> use ax methods (NOT g.* methods)\n#\n# Anti-pattern: setting axis labels BEFORE the seaborn plot call.\n#   Some seaborn functions reset xlabel/ylabel internally — anything you set first gets\n#   silently overwritten when the plot draws. The rule is plot first, customize second:\n#   sns.boxplot(...ax=ax) first, then ax.set(xlabel=..., ylabel=...). Same trap with\n#   ax.set_xticks() before a categorical seaborn call that re-numbers the axis."
                  }
        ],
        tips: [
                  "`ax.set(title=, xlabel=, ylabel=, xlim=, ylim=)` sets everything in one call — use it",
                  "`ax.tick_params(axis=\"x\", rotation=45)` fixes overlapping x-axis labels",
                  "`ax.get_legend().remove()` cleanly removes the legend when hue is shown elsewhere",
                  "`ax.spines[\"top\"].set_visible(False)` removes individual spines — or use `sns.despine()`"
        ],
        mistake: "Setting labels before plotting. Always set labels AFTER calling the seaborn function — the plot call can reset axis properties.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\nfig, ax = plt.subplots(figsize=(10, 6))\nsns.boxplot(data=df, x='day', y='total_bill', hue='sex', ax=ax)",
          concise: "ax.axhline(y=0, color='black', linewidth=0.5, linestyle='--')",
        },
      },
      {
        id: "labels-figure",
        fn: "Figure-level labels",
        desc: "Set titles, axis labels, and legends on figure-level FacetGrid plots.",
        category: "Customization",
        subtitle: "Figure-level functions return a FacetGrid — use g.set_axis_labels() not ax.set()",
        signature: "g.set_axis_labels() | g.set_titles() | g.figure.suptitle()",
        descLong: "Figure-level seaborn functions (displot, catplot, relplot, lmplot) return a FacetGrid — not an Axes. Use FacetGrid methods for customization. plt.title() and ax.set() target a single Axes and will not work correctly on a FacetGrid.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Figure-level labels — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             FacetGrid. Use g methods, not ax.set().\n#             pattern.\n#             or per-panel access.\n#\nimport seaborn as sns\ng = sns.catplot(data=df, x=\"day\", y=\"total_bill\",\n                 col=\"time\", kind=\"box\")\ng.set_axis_labels(\"Day\", \"Total Bill ($)\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Figure-level labels — common patterns you'll see in production.\n# APPROACH  - Combine Figure-level labels with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             titles via set_titles, overall suptitle,\n#             g.set() to apply to all panels, axes.flat\n#             for per-panel customization.\n#             like in real reports; suptitle y=1.02 is\n#             the magic number.\n#             constrained_layout or savefig — senior.\n#\nimport seaborn as sns\ng = sns.catplot(data=df, x=\"day\", y=\"total_bill\",\n                 col=\"time\", kind=\"box\", height=5)\ng.set_axis_labels(\"Day of Week\", \"Total Bill ($)\")\ng.set_titles(col_template=\"{col_name}\")\ng.figure.suptitle(\"Bills by Day\", y=1.02, fontsize=14)\ng.set(ylim=(0, 60))\ng.add_legend(title=\"Sex\")\n# Tick rotation on every panel\nfor ax in g.axes.flat:\n    ax.tick_params(axis=\"x\", rotation=45)\n# Customize a single panel\ng.axes[0, 0].set_title(\"Custom for panel 0\")\ng.tight_layout()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Figure-level labels — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             on a figure-level plot (targets only the\n#             last axes); use g.figure.suptitle for an\n#             overall title; save via g.savefig() not\n#             plt.savefig() to capture the whole figure.\n#             customization bug; g.savefig() always\n#             saves the right figure.\n#             \"current figure\" — use g.figure for\n#             explicit access.\n#\nimport seaborn as sns\ng = sns.catplot(data=df, x=\"day\", y=\"total_bill\",\n                 col=\"time\", row=\"sex\",\n                 kind=\"box\", height=4,\n                 margin_titles=True)\n# Multi-element layout — all via g\ng.set_axis_labels(\"Day\", \"Total Bill ($)\")\ng.set_titles(col_template=\"{col_name}\",\n              row_template=\"{row_name}\")\ng.figure.suptitle(\"Bills by Day, Time, Sex\", y=1.02)\ng.set(ylim=(0, 60))\n# Save deterministically — use g.savefig\ng.savefig(\"bills_facets.png\", dpi=200, bbox_inches=\"tight\")\n# Decision rule:\n#   axes-level (boxplot, scatterplot)    -> ax.set(), ax.legend(), fig.savefig\n#   figure-level (catplot, displot)      -> g.set_*, g.figure.suptitle, g.savefig\n#   set y limits on every panel          -> g.set(ylim=(0, 60))\n#   per-panel customization              -> for ax in g.axes.flat: ...\n#   panel templates                      -> g.set_titles(col_template=\"{col_name}\")\n#   suptitle pushed above panels         -> g.figure.suptitle(..., y=1.02)\n#\n# Anti-pattern: plt.title(\"Bills by Day\") after a sns.catplot call.\n#   plt.title targets the \"current axes\" — on a FacetGrid that's the LAST drawn panel\n#   only, so your title lands above one cell instead of the whole figure. The fix:\n#   g.figure.suptitle(...). Same trap with plt.savefig (saves only the last figure if\n#   another figure was created since); use g.savefig() to save the FacetGrid you built."
                  }
        ],
        tips: [
                  "`g.figure.suptitle(\"Title\", y=1.02)` — `y=1.02` pushes it above the panel titles",
                  "`for ax in g.axes.flat:` iterates over all panel axes for individual customization",
                  "`g.set()` passes kwargs to `ax.set()` on every panel simultaneously",
                  "`g.tight_layout()` is the FacetGrid equivalent of `plt.tight_layout()`"
        ],
        mistake: "Using `plt.title()` on a figure-level plot. It targets only the last active Axes, not the whole FacetGrid. Use `g.figure.suptitle()` for an overall title.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "savefig-seaborn",
        fn: "plt.savefig()",
        desc: "Save a seaborn figure to a file.",
        category: "Customization",
        subtitle: "Always bbox_inches=\"tight\" — prevents clipped labels",
        signature: "plt.savefig(\"file.png\", dpi=150, bbox_inches=\"tight\")",
        descLong: "Save plots with plt.savefig() for axes-level plots, or g.savefig() for FacetGrid. bbox_inches=\"tight\" is critical — without it, axis labels are often clipped. Call plt.close() after saving in loops.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of plt.savefig() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             (FacetGrid): g.savefig. Always\n#             bbox_inches=\"tight\".\n#             plt.close in loops.\n#\nimport seaborn as sns\ng = sns.displot(data=df, x=\"total_bill\")\ng.savefig(\"plot.png\", dpi=150, bbox_inches=\"tight\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of plt.savefig() — common patterns you'll see in production.\n# APPROACH  - Combine plt.savefig() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             choice (PNG/PDF/SVG), DPI tiers, the\n#             plt.close in loops rule.\n#             plt.close prevents memory leaks.\n#             savefig.dpi rcparam — senior.\n#\nimport matplotlib.pyplot as plt, seaborn as sns\n# Axes-level\nfig, ax = plt.subplots()\nsns.histplot(data=df, x=\"total_bill\", ax=ax)\nfig.savefig(\"hist.png\", dpi=150, bbox_inches=\"tight\")\nplt.close(fig)\n# Figure-level (FacetGrid)\ng = sns.displot(data=df, x=\"total_bill\", col=\"sex\")\ng.savefig(\"displot.pdf\", bbox_inches=\"tight\")           # vector\nplt.close(g.figure)\n# Loop — close after every save\nfor name, group in df.groupby(\"category\"):\n    fig, ax = plt.subplots()\n    sns.histplot(data=group, x=\"total_bill\", ax=ax)\n    fig.savefig(f\"{name}.png\", dpi=150, bbox_inches=\"tight\")\n    plt.close(fig)                                       # free memory"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of plt.savefig() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             from save DPI (notebook readable, export\n#             crisp); embed fonts in PDFs (truetype 42)\n#             for cross-machine reproducibility; pin\n#             facecolor to \"white\" in case rcParams\n#             defaulted to transparent.\n#             single most useful \"publication-quality\"\n#             rule; truetype embedding fixes\n#             portability.\n#             setting savefig.dpi globally affects\n#             everything downstream — use rc_context.\n#\nimport matplotlib.pyplot as plt, seaborn as sns\nwith plt.rc_context({\n    \"savefig.dpi\":      300,\n    \"savefig.format\":   \"png\",\n    \"pdf.fonttype\":     42,\n    \"ps.fonttype\":      42,\n    \"savefig.facecolor\": \"white\",\n}):\n    g = sns.displot(data=df, x=\"total_bill\", col=\"sex\")\n    g.savefig(\"displot.png\", bbox_inches=\"tight\",\n               pad_inches=0.1)\n# Decision rule:\n#   web / presentation                  -> dpi=150 PNG\n#   publication / journal               -> dpi=300 PNG OR vector PDF\n#   editable in design tool             -> SVG\n#   in a long loop                      -> ALWAYS plt.close(fig)\n#   FacetGrid (figure-level)            -> g.savefig(...) NOT plt.savefig\n#   embed fonts for portability         -> rcParams pdf.fonttype=42\n#\n# Anti-pattern: fig.savefig(\"plot.png\") with no bbox_inches and no plt.close.\n#   Without bbox_inches=\"tight\", long axis/title labels get clipped at the figure edge\n#   and you only see it after opening the file. Without plt.close(fig) in a loop,\n#   matplotlib keeps every Figure in memory and Jupyter eventually OOMs around 50-100\n#   plots. Always: fig.savefig(\"p.png\", dpi=150, bbox_inches=\"tight\"); plt.close(fig)."
                  }
        ],
        tips: [
                  "`bbox_inches=\"tight\"` prevents axis labels being cut off — always include it",
                  "Use `dpi=150` for presentations and web; `dpi=300` for print/publication",
                  "PDF and SVG are vector formats — scalable to any size without pixelation",
                  "`plt.close()` after saving in loops is critical — otherwise figures accumulate in memory"
        ],
        mistake: "Saving before calling `tight_layout()` or without `bbox_inches=\"tight\"`. Axis labels get cut off at the figure edge. The fix: `fig.savefig(\"f.png\", bbox_inches=\"tight\")`.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\nfig, ax = plt.subplots()\nsns.histplot(data=df, x='total_bill', ax=ax)",
          concise: "plt.savefig('plot.png', dpi=300, bbox_inches='tight')",
        },
      },
      {
        id: "despine",
        fn: "sns.despine()",
        desc: "Remove chart borders (spines) for a cleaner publication-ready look.",
        category: "Customization",
        subtitle: "Remove top and right borders by default — instant polish",
        signature: "sns.despine() | sns.despine(left=True, bottom=False)",
        descLong: "despine() removes axes borders (spines). By default it removes the top and right spines — the two that add clutter without conveying information. Removing all four spines creates a minimal floating plot.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.despine() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Instant cleanup.\n#             spine removal.\n#\nimport seaborn as sns\nsns.boxplot(data=df, x=\"day\", y=\"total_bill\")\nsns.despine()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.despine() — common patterns you'll see in production.\n# APPROACH  - Combine sns.despine() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             four for floating plots, offset for a\n#             small gap, ax= for targeted, FacetGrid's\n#             own g.despine() method.\n#             the canonical clean-publication look.\n#             removal (more permanent) — senior tier.\n#\nimport seaborn as sns\nsns.set_style(\"ticks\")            # ticks + despine = publication\nsns.histplot(data=df, x=\"total_bill\")\nsns.despine(offset=10)            # small gap between plot and spines\n# Selective\nsns.despine(left=True)            # remove left, keep bottom\n# In a FacetGrid — use g.despine\ng = sns.catplot(data=df, x=\"day\", y=\"total_bill\", kind=\"box\")\ng.despine(left=True)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.despine() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             via rcParams for a permanent house style;\n#             offset + trim cleans the leftover spine\n#             segments at axis limits; pair with\n#             set_style(\"ticks\") for ticks-only outside\n#             the plot.\n#             across every figure; trim removes the\n#             remaining spine segments past the data\n#             range.\n#             notebook unless wrapped in rc_context.\n#\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nwith plt.rc_context({\n    \"axes.spines.top\":   False,\n    \"axes.spines.right\": False,\n}):\n    sns.set_style(\"ticks\")\n    sns.histplot(data=df, x=\"total_bill\", kde=True)\n    sns.despine(offset=10, trim=True)        # trim cuts past data range\n# Decision rule:\n#   one-off plot                  -> sns.despine() at the end\n#   notebook house style          -> set_style(\"ticks\") + rcParams in rc_context\n#   minimal floating chart        -> despine(left=True, bottom=True)\n#   FacetGrid                     -> g.despine(...)\n#   gap between spines and data   -> despine(offset=10)\n#   trim spine to data range      -> despine(trim=True)\n#\n# Anti-pattern: calling sns.despine() BEFORE the seaborn plot.\n#   despine acts on the current Axes — if you call it before drawing, it operates on\n#   nothing (or the previous figure's axes) and your plot keeps all four spines. The\n#   correct order is: plot first, despine() last. On a FacetGrid use g.despine() instead\n#   of sns.despine() — the global call only touches one panel."
                  }
        ],
        tips: [
                  "Pair `sns.set_style(\"ticks\")` with `sns.despine()` for the cleanest publication-style plots",
                  "`offset=10` adds a small gap between the remaining spines and the plot area — subtle polish",
                  "FacetGrid has its own `g.despine()` method — use it instead of calling `sns.despine()` after",
                  "Removing the left spine hides the y-axis line — useful for dot plots and lollipop charts"
        ],
        mistake: "Not calling `sns.despine()` and wondering why your seaborn plots look heavier than example plots. It is a single-line call that instantly improves the aesthetics.",
        shorthand: {
          verbose: "import matplotlib.pyplot as plt\nimport seaborn as sns\ndf = sns.load_dataset('tips')\nfig, ax = plt.subplots()",
          concise: "sns.set_style('ticks')  # ticks style + despine() = clean publication style",
        },
      },
      {
        id: "set-theme",
        fn: "sns.set_theme()",
        desc: "Configure the global seaborn style, palette, and font scale.",
        category: "Setup",
        subtitle: "Call once at the top of your script or notebook",
        signature: "sns.set_theme(style=\"darkgrid\", palette=\"deep\", font_scale=1.2)",
        descLong: "set_theme() applies a visual style globally to all subsequent plots. Call it once at the top of your script. style= controls grid and background; palette= controls default colors; font_scale= scales all text simultaneously.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.set_theme() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             configures style + palette + font scale\n#             for all subsequent plots.\n#             house style.\n#             axes_style for scoped overrides.\n#\nimport seaborn as sns\nsns.set_theme(style=\"whitegrid\", palette=\"colorblind\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.set_theme() — common patterns you'll see in production.\n# APPROACH  - Combine sns.set_theme() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             family, palette choice, font_scale for\n#             slides, context for paper / notebook /\n#             talk / poster size scaling.\n#             ~95% of seaborn's appearance.\n#             axes_style) overrides — senior.\n#\nimport seaborn as sns\nsns.set_theme(\n    style=\"whitegrid\",         # darkgrid | whitegrid | dark | white | ticks\n    palette=\"colorblind\",      # accessible default\n    font_scale=1.2,            # scales ALL text uniformly\n    context=\"notebook\",        # paper | notebook | talk | poster\n    rc={\"figure.figsize\": (10, 6)},\n)\n# Reset to matplotlib defaults\n# sns.reset_defaults()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.set_theme() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             with axes_style / plotting_context as\n#             context managers (no global state bleed);\n#             pin a project-wide theme in a setup\n#             module; set context=\"talk\" for slides\n#             temporarily without breaking notebooks.\n#             the theme in cell 3 and now everything\n#             looks different\" surprise; per-project\n#             setup module keeps house style versioned.\n#             learn; nesting context managers requires\n#             discipline.\n#\nimport seaborn as sns\n# 1. Scoped style — applies to one block only\nwith sns.axes_style(\"white\"):\n    sns.lineplot(data=df, x=\"x\", y=\"y\")\n# 2. Scoped context — bigger fonts for one slide\nwith sns.plotting_context(\"talk\"):\n    sns.boxplot(data=df, x=\"day\", y=\"total_bill\")\n# 3. Project-wide setup — put in a setup module\ndef setup_plot_style():\n    sns.set_theme(\n        style=\"ticks\", palette=\"colorblind\",\n        font_scale=1.0, context=\"notebook\",\n        rc={\n            \"figure.dpi\": 120,\n            \"savefig.dpi\": 300,\n            \"savefig.facecolor\": \"white\",\n            \"axes.spines.top\": False,\n            \"axes.spines.right\": False,\n        },\n    )\n# Decision rule:\n#   one notebook-wide style        -> sns.set_theme(...) at top\n#   scoped style for a block       -> with sns.axes_style(...)\n#   bigger fonts for slides        -> with sns.plotting_context(\"talk\")\n#   project house style            -> setup function imported everywhere\n#   undo all overrides             -> sns.reset_defaults()\n#   per-figure rcParams override   -> with plt.rc_context({...}):\n#\n# Anti-pattern: calling sns.set_theme() inside helper functions or in the middle of a notebook.\n#   set_theme mutates global matplotlib state — every plot AFTER the call inherits it,\n#   including plots in unrelated downstream cells. The two safe patterns are: (1) call\n#   set_theme exactly once at the top of the notebook / setup module; (2) for transient\n#   styling use a \"with sns.axes_style(...)\" or \"with plt.rc_context({...})\" block so\n#   changes don't leak."
                  }
        ],
        tips: [
                  "`style=\"whitegrid\"` is cleanest for publications; `\"darkgrid\"` is good for exploratory work",
                  "`palette=\"colorblind\"` is safe for all forms of color vision deficiency — use it by default",
                  "`font_scale=1.5` in `set_theme()` scales all text — useful for slides/presentations",
                  "`sns.axes_style()` as a context manager applies a style temporarily to one block"
        ],
        mistake: "Setting palette inside every plot call instead of once with `set_theme()`. Set the theme once globally; override per-plot only when a specific plot needs a different look.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "color-palette",
        fn: "sns.color_palette()",
        desc: "Access and create color palettes for categorical, sequential, and diverging data.",
        category: "Customization",
        subtitle: "Choose the right palette type — qualitative, sequential, or diverging",
        signature: "sns.color_palette(\"deep\") | sns.color_palette(\"Blues\") | sns.diverging_palette()",
        descLong: "Color palettes in seaborn fall into three types: qualitative (for categorical data — distinct colors), sequential (for ordered data — light to dark), and diverging (for data centered at zero — two hues going out from a midpoint). Choosing the wrong type is one of the most common visualization mistakes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sns.color_palette() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             palette= to a plot.\n#             plot.\n#             sequential / diverging — choosing the\n#             wrong type misleads viewers.\n#\nimport seaborn as sns\nsns.boxplot(data=df, x=\"day\", y=\"tip\", palette=\"colorblind\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sns.color_palette() — common patterns you'll see in production.\n# APPROACH  - Combine sns.color_palette() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             for categories, sequential for ordered\n#             magnitude, diverging for ± data.\n#             Pick by data type, not by aesthetics.\n#             plots; \"colorblind\" as the default\n#             qualitative is the responsible choice.\n#             colormap conversion — senior.\n#\nimport seaborn as sns\n# Qualitative — distinct colors per category\nsns.boxplot(data=df, x=\"day\", y=\"tip\", palette=\"colorblind\")\n# Sequential — ordered magnitude (heatmaps of unsigned data)\nsns.heatmap(pivot, cmap=\"viridis\")\n# Diverging — signed data, centered at zero\nsns.heatmap(corr, cmap=\"RdBu_r\", center=0, vmin=-1, vmax=1)\n# Preview a palette in Jupyter (renders swatches)\nsns.color_palette(\"deep\")\nsns.color_palette(\"colorblind\")\nsns.color_palette(\"RdBu\", as_cmap=True)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sns.color_palette() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             \"viridis\" / \"magma\" everywhere\n#             accessibility matters; build branded\n#             palettes from a hex list and register\n#             via set_palette; NEVER rainbow / jet.\n#             eliminates a class of plots that 8% of\n#             readers can't decode; brand palettes\n#             work without losing perceptual order.\n#             greyscale and on actual color-blind\n#             simulators.\n#\nimport seaborn as sns\nimport matplotlib.colors as mcolors\n# 1. Custom branded palette\nbrand = [\"#E74C3C\", \"#3498DB\", \"#2ECC71\", \"#F1C40F\"]\nsns.set_palette(brand)\n# 2. Custom diverging colormap (continuous)\nmy_cmap = sns.diverging_palette(220, 20, as_cmap=True)\n# sns.heatmap(corr, cmap=my_cmap, center=0)\n# 3. Custom sequential — bake it from two colors\nmy_seq = mcolors.LinearSegmentedColormap.from_list(\n    \"brand_seq\", [\"#FFFFFF\", \"#1F4068\"])\n# Decision rule:\n#   categorical (cities, classes)        -> qualitative (\"colorblind\", \"deep\")\n#   ordered numeric, unsigned            -> sequential (\"viridis\", \"rocket\")\n#   signed data, centered at 0           -> diverging (\"RdBu\", \"coolwarm\")\n#   small N (<=4) categories             -> custom hex list set via set_palette\n#   color-blind audience                 -> \"colorblind\" (always safe)\n#   continuous colormap for heatmap      -> color_palette(..., as_cmap=True)\n#   NEVER                                -> jet, rainbow, hsv (perceptually misleading)\n#\n# Anti-pattern: using a qualitative palette (\"deep\", \"Set1\", \"tab10\") for a heatmap or\n# any ordered/magnitude data.\n#   Qualitative palettes have no perceptual order — adjacent values get unrelated colors\n#   and the reader cannot tell \"is this bigger or smaller?\" from the chart. Always match\n#   palette family to data: sequential (viridis) for unsigned magnitude, diverging (RdBu)\n#   for signed data centered at 0, qualitative (colorblind) only for categories."
                  }
        ],
        tips: [
                  "Use \"colorblind\" for any plot that may be seen by color-blind viewers — 8% of men are affected",
                  "Sequential palettes for heatmaps of single-polarity data; diverging for data centered at zero",
                  "Never use a rainbow (jet) palette — it introduces false perceptual boundaries in the data",
                  "`sns.color_palette()` in Jupyter renders a color swatch — useful for choosing before plotting"
        ],
        mistake: "Using a qualitative palette (deep, Set1) for a heatmap. Qualitative palettes have no inherent order — sequential (Blues, viridis) or diverging (RdBu) palettes communicate magnitude correctly.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "fig-vs-axes",
        fn: "Figure-level vs axes-level",
        desc: "Understand the two-tier seaborn API before choosing a function.",
        category: "Setup",
        subtitle: "Figure-level functions return FacetGrid; axes-level return Axes",
        signature: "displot/relplot/catplot → FacetGrid | histplot/scatterplot/boxplot → Axes",
        descLong: "Seaborn has two API tiers. Figure-level functions (displot, relplot, catplot, lmplot) create their own Figure and support faceting via col= and row=. Axes-level functions (histplot, scatterplot, boxplot, etc.) draw on an existing Axes — use these inside plt.subplots() layouts. Passing ax= to a figure-level function raises an error.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Figure-level vs axes-level — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             scatterplot) take ax= and draw into an\n#             existing Axes. Figure-level fns\n#             (displot, relplot, catplot) make their\n#             own Figure.\n#             distinction in two examples.\n#             convention or which to pick when.\n#\nimport matplotlib.pyplot as plt, seaborn as sns\n# Axes-level\nfig, ax = plt.subplots()\nsns.histplot(data=df, x=\"total_bill\", ax=ax)\n# Figure-level\ng = sns.displot(data=df, x=\"total_bill\", col=\"sex\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Figure-level vs axes-level — common patterns you'll see in production.\n# APPROACH  - Combine Figure-level vs axes-level with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             facets, axes-level for subplots. Each\n#             figure-level fn wraps several axes-level\n#             counterparts via kind=.\n#             axes-level fn each figure-level call\n#             actually invokes.\n#             of passing ax= to figure-level — senior.\n#\nimport matplotlib.pyplot as plt, seaborn as sns\n# Axes-level for subplot layouts\nfig, axes = plt.subplots(1, 2, figsize=(12, 5))\nsns.histplot(data=df, x=\"total_bill\", ax=axes[0])\nsns.boxplot(data=df, x=\"day\", y=\"total_bill\", ax=axes[1])\n# Figure-level for faceting\ng = sns.displot(data=df, x=\"total_bill\", col=\"sex\")\ng.set_axis_labels(\"Total Bill ($)\", \"Count\")\ng.figure.suptitle(\"Bill by Sex\", y=1.02)\n# Wrapping table:\n#   sns.displot(kind=\"hist\") -> sns.histplot\n#   sns.displot(kind=\"kde\")  -> sns.kdeplot\n#   sns.relplot(kind=\"scatter\") -> sns.scatterplot\n#   sns.relplot(kind=\"line\")    -> sns.lineplot\n#   sns.catplot(kind=\"box\")     -> sns.boxplot\n#   sns.lmplot                  -> sns.regplot"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Figure-level vs axes-level — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             figure-level fn is a TypeError. Save via\n#             g.savefig (figure-level) or fig.savefig\n#             (axes-level). g.figure exposes the\n#             underlying Figure for matplotlib-level\n#             customization.\n#             eliminates the most common figure-level\n#             trap; g.figure access unlocks every\n#             matplotlib customization.\n#             axes-level\" decision sometimes requires\n#             both (e.g. faceted plots with a\n#             customized matplotlib subplot layout).\n#\nimport matplotlib.pyplot as plt, seaborn as sns\n# Decision rule:\n#   custom subplot layout                       -> axes-level + plt.subplots()\n#   small multiples / faceting (col=, row=)     -> figure-level\n#   one panel only                               -> axes-level + plt.subplots()\n# WRONG — figure-level rejects ax=\n# fig, ax = plt.subplots()\n# sns.displot(data=df, x=\"x\", ax=ax)            # TypeError\n# Right ways:\nfig, ax = plt.subplots()                          # axes-level for one panel\nsns.histplot(data=df, x=\"total_bill\", ax=ax)\nfig.savefig(\"p.png\", bbox_inches=\"tight\")\ng = sns.displot(data=df, x=\"total_bill\", col=\"sex\") # figure-level for facets\ng.figure.suptitle(\"...\")                           # access underlying Figure\ng.savefig(\"g.png\", bbox_inches=\"tight\")            # NOT plt.savefig\n# Naming heuristic: figure-level functions END in \"plot\" with a one-letter\n# prefix that maps to a category — disPLOT, relPLOT, catPLOT, lmPLOT.\n# Decision rule:\n#   one panel into custom subplots layout  -> axes-level + ax= argument\n#   small multiples (col=, row=)           -> figure-level (FacetGrid)\n#   need to combine with matplotlib code   -> axes-level\n#   want g.refline / g.set_titles APIs     -> figure-level\n#   save the whole faceted figure          -> g.savefig (NOT plt.savefig)\n#   set overall title                      -> g.figure.suptitle(..., y=1.02)\n#\n# Anti-pattern: trying to place sns.displot/relplot/catplot inside plt.subplots(1, 2) cells.\n#   Figure-level functions OWN their figure — passing ax= raises TypeError, and even if\n#   you skip ax= the call creates a SECOND, separate figure and your subplots cell stays\n#   empty. The fix is to pick the matching axes-level function (histplot, scatterplot,\n#   lineplot, boxplot, ...) with ax=axes[i, j], or commit fully to the figure-level\n#   FacetGrid and customize via g.* methods."
                  }
        ],
        tips: [
                  "Figure-level functions support `col=` and `row=` for faceting; axes-level do not",
                  "Axes-level functions return an `Axes` object; figure-level return a `FacetGrid`",
                  "To customize a figure-level plot, use `g.set_axis_labels()`, `g.set_titles()`, `g.figure.suptitle()`",
                  "For subplot layouts, always use axes-level functions with `plt.subplots()`"
        ],
        mistake: "Passing `ax=` to a figure-level function like `sns.displot(ax=ax)`. Figure-level functions manage their own Figure — they do not accept an `ax=` argument.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
    ],
  },
]

export default { meta, sections }
