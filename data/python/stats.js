export const meta = {
  "id": "stats",
  "label": "Statistics",
  "icon": "📊",
  "description": "Descriptive statistics, distributions, hypothesis testing, regression with scipy, numpy, pandas, statsmodels."
}

export const sections = [

  // ── Section 1: Descriptive Statistics ─────────────────────────────────────────
  {
    id: "descriptive-stats-py",
    title: "Descriptive Statistics",
    entries: [
      {
        id: "descriptive-stats",
        fn: "mean, median, mode, variance, std",
        desc: "Calculate mean, median, mode, variance, and standard deviation.",
        category: "Central Tendency",
        subtitle: "Summarize data distribution with basic statistics",
        signature: "scipy.stats.describe(), np.mean(), np.median(), scipy.stats.mode()",
        descLong: "Compute fundamental summary statistics to understand data center and spread. scipy.stats.describe() provides all at once; individual functions offer flexibility.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of mean, median, mode, variance, std — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\ndata = np.array([2, 4, 4, 4, 5, 5, 7, 9, 10, 15])\nprint(f\"mean:   {np.mean(data):.2f}\")\nprint(f\"median: {np.median(data):.2f}\")\nprint(f\"std:    {np.std(data, ddof=1):.2f}\")    # ddof=1 -> sample std"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of mean, median, mode, variance, std — common patterns you'll see in production.\n# APPROACH  - Combine mean, median, mode, variance, std with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\ndata = np.array([2, 4, 4, 4, 5, 5, 7, 9, 10, 15])\nd = stats.describe(data)                          # nobs / minmax / mean / variance / skew / kurtosis\nprint(f\"n: {d.nobs}, range: {d.minmax}\")\nprint(f\"mean: {d.mean:.2f}  variance: {d.variance:.2f}  std: {d.variance**0.5:.2f}\")\nprint(f\"skewness: {d.skewness:.2f}  kurtosis: {d.kurtosis:.2f}\")\n# describe() doesn't give median or mode — fetch separately\nprint(f\"median: {np.median(data):.2f}\")\nprint(f\"mode:   {stats.mode(data, keepdims=False).mode}\")\n# Quick pandas alternative — wider summary\nimport pandas as pd\nprint(pd.Series(data).describe())                 # count, mean, std, min, 25/50/75%, max"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of mean, median, mode, variance, std — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nimport pandas as pd\nfrom scipy import stats\ndata = np.array([2, 4, 4, 4, 5, 5, 7, 9, 10, 15, 200])  # one outlier\n# 1) Robust center/spread — don't let one big value lie about the data\nmedian = np.median(data)\nmad    = stats.median_abs_deviation(data, scale=\"normal\")   # robust std analog\ntrimmed_mean = stats.trim_mean(data, 0.1)         # drop top/bottom 10%\nprint(f\"mean: {data.mean():.2f}   median: {median:.2f}\")\nprint(f\"std:  {data.std(ddof=1):.2f}   MAD:    {mad:.2f}\")\nprint(f\"trim_mean(10%): {trimmed_mean:.2f}\")\n# 2) Always inspect skew and kurtosis BEFORE picking a center\nskew, kurt = stats.skew(data), stats.kurtosis(data, fisher=True)   # excess kurtosis\nprint(f\"skew={skew:.2f}, excess_kurt={kurt:.2f}\")\n# |skew| > 1 -> highly skewed; report median, not mean.\n# excess_kurt > 3 -> heavy tails; std understates extreme risk.\n# 3) Group summaries on real data — describe() per group\ndf = pd.DataFrame({\"group\": list(\"AAABBBCCC\"),\n                   \"value\": [1, 2, 100, 4, 5, 6, 7, 8, 9]})\nprint(df.groupby(\"group\")[\"value\"].describe())\n# Decision rule:\n#   roughly symmetric, no outliers       -> mean + std\n#   skewed or heavy-tailed                -> median + MAD or IQR\n#   need both center AND robustness       -> trimmed mean (5-20% trim)\n#   reporting to a stakeholder            -> mean AND median; let the gap tell the story\n#   compare across scales                  -> coefficient of variation (std/mean)\n#\n# Anti-pattern: defaulting to ddof=0 on sample data\n#   np.std(data) divides by N. For sample-based inference you want the unbiased\n#   estimator (divide by N-1). Pass ddof=1 — or use pd.Series.std() (default ddof=1)."
                  }
        ],
        tips: [
                  "Use ddof=1 for sample std (Bessel correction), ddof=0 for population",
                  "scipy.stats.describe() is efficient for all descriptive stats at once",
                  "Keep raw statistics separate from interpretation — context matters"
        ],
        mistake: "Using ddof=0 (population) when computing sample statistics, underestimating variability.",
        shorthand: {
          verbose: "import numpy as np\nimport pandas as pd\nfrom scipy import stats\ndata = np.array([2, 4, 4, 4, 5, 5, 7, 9, 10, 15])",
          concise: "print(f'Range: {data.max() - data.min()}')",
        },
      },
      {
        id: "standard-deviation",
        fn: "std, var, sem, coefficient of variation",
        desc: "Compute standard deviation, variance, SEM, and coefficient of variation.",
        category: "Dispersion",
        subtitle: "Measure variability and uncertainty",
        signature: "np.std(), np.var(), scipy.stats.sem(), cv = std / mean",
        descLong: "Measure data spread around the center. Standard error of mean (SEM) quantifies uncertainty in sample mean. Coefficient of variation enables comparison across scales.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of std, var, sem, coefficient of variation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\ndata = np.array([10, 12, 11, 13, 12, 11, 10])\nprint(f\"variance: {np.var(data, ddof=1):.2f}\")    # ddof=1 = sample\nprint(f\"std dev:  {np.std(data, ddof=1):.2f}\")    # std is sqrt(var)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of std, var, sem, coefficient of variation — common patterns you'll see in production.\n# APPROACH  - Combine std, var, sem, coefficient of variation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nlow_scale  = np.array([10, 12, 11, 13, 12, 11, 10])\nhigh_scale = np.array([100, 120, 110, 130, 120, 110, 100])\n# std — spread of the DATA\n# SEM — spread of the SAMPLE MEAN. Always SEM = std / sqrt(n).\n# CV  — std normalized by mean; unitless, comparable across scales.\nfor label, x in [(\"low\", low_scale), (\"high\", high_scale)]:\n    std = np.std(x, ddof=1)\n    sem = stats.sem(x)\n    cv  = std / np.mean(x)\n    print(f\"{label:>4}: std={std:.2f}  SEM={sem:.3f}  CV={cv:.3f}\")\n# Notice: high-scale has 10x bigger std but the SAME CV — same *relative* variability."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of std, var, sem, coefficient of variation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\n# 1) Heavy-tailed data — std balloons; MAD stays stable\nnp.random.seed(0)\nheavy = np.concatenate([np.random.normal(0, 1, 100), np.array([50])])\nprint(f\"std:  {heavy.std(ddof=1):.2f}   MAD: {stats.median_abs_deviation(heavy, scale='normal'):.2f}\")\n# 2) Mixed populations — std describes a phantom average\nmixed = np.concatenate([np.random.normal(0, 1, 50), np.random.normal(10, 1, 50)])\n# A single std on this is meaningless; report grouped stats instead.\n# 3) SEM for confidence — DON'T use std on a \"mean ± X\" plot\nn  = len(heavy)\nci = stats.t.interval(0.95, df=n-1, loc=heavy.mean(), scale=stats.sem(heavy))\nprint(f\"95% CI for mean: {ci}\")                     # SEM-based, not std-based\n# 4) Robust spread metrics\nmad = stats.median_abs_deviation(heavy, scale=\"normal\")   # ~= std for normal data\niqr = np.subtract(*np.percentile(heavy, [75, 25]))\nprint(f\"MAD: {mad:.2f}   IQR: {iqr:.2f}\")\n# Decision rule:\n#   normal-ish, no outliers              -> std + SEM (for CIs)\n#   skewed or heavy-tailed                -> MAD or IQR; CIs via bootstrap\n#   compare variability across SCALES     -> coefficient of variation (std/mean)\n#   compare mean uncertainty               -> SEM, never std\n#   one-shot summary for a paper/report   -> report n, mean, sd, AND median, IQR\n#\n# Anti-pattern: error bars labeled \"std\" on a sample mean\n#   The reader infers the mean's uncertainty; you've shown them the data's\n#   spread. Use SEM (or a 95% CI) for mean uncertainty."
                  }
        ],
        tips: [
                  "CV > std for comparing variability across datasets with different scales/units",
                  "SEM decreases with larger sample size (sqrt(n) relationship)",
                  "Variance is std^2; use std for same units as original data"
        ],
        mistake: "Confusing std with SEM; SEM is std/sqrt(n), used for mean uncertainty.",
        shorthand: {
          verbose: "import numpy as np\nfrom scipy import stats\ndata1 = np.array([10, 12, 11, 13, 12, 11, 10])\ndata2 = np.array([100, 120, 110, 130, 120, 110, 100])",
          concise: "print(f'Coefficient of Variation (Data 2): {cv2:.4f}')",
        },
      },
      {
        id: "percentiles-iqr",
        fn: "np.percentile, IQR, boxplot",
        desc: "Calculate percentiles, IQR, and boxplot statistics.",
        category: "Distribution Position",
        subtitle: "Quartiles and percentile-based summaries",
        signature: "np.percentile(data, q), iqr = q75 - q25",
        descLong: "Partition data into equal-probability regions. IQR (Interquartile Range) captures central 50%; outliers identified as values beyond 1.5*IQR from quartiles.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.percentile, IQR, boxplot — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\ndata = np.array([2, 4, 4, 5, 5, 7, 8, 9, 10, 15, 20, 25, 30, 100])\nq1, q2, q3 = np.percentile(data, [25, 50, 75])    # one call returns all three\nprint(f\"Q1={q1}  median={q2}  Q3={q3}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.percentile, IQR, boxplot — common patterns you'll see in production.\n# APPROACH  - Combine np.percentile, IQR, boxplot with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nimport pandas as pd\ndata = np.array([2, 4, 4, 5, 5, 7, 8, 9, 10, 15, 20, 25, 30, 100])\nq1, q3 = np.percentile(data, [25, 75])\niqr = q3 - q1\nlower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr     # Tukey fences\nprint(f\"IQR={iqr}  fences=[{lower}, {upper}]\")\nprint(f\"outliers: {data[(data < lower) | (data > upper)]}\")\n# pandas .describe() bundles count + mean + std + 5-number summary\nprint(pd.Series(data).describe())"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.percentile, IQR, boxplot — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\ndata = np.array([2, 4, 4, 5, 5, 7, 8, 9, 10, 15, 20, 25, 30, 100])\n# 1) Interpolation method matters when n is small or values aren't unique\n# numpy >= 1.22: use the 'method' kw (replaces deprecated 'interpolation')\nfor m in (\"linear\", \"nearest\", \"lower\", \"higher\", \"midpoint\"):\n    print(f\"{m:>10}: Q3 = {np.percentile(data, 75, method=m)}\")\n#   linear  -> default; \"fractional\" position between values\n#   lower / higher -> always pick a real data point (good for billing thresholds)\n#   nearest -> rounded; deterministic for plotting\n# 2) Robust outlier rule: median + k * MAD (less sensitive to heavy tails than IQR)\ndef mad_outliers(x, k=3.0):\n    med = np.median(x)\n    mad = stats.median_abs_deviation(x, scale=\"normal\")\n    return x[np.abs(x - med) > k * mad]\nprint(\"MAD outliers:\", mad_outliers(data))\n# 3) Weighted percentiles — use np.quantile with weights via a sorted CDF trick\ndef weighted_quantile(values, weights, q):\n    order = np.argsort(values)\n    v, w  = values[order], weights[order]\n    cum   = np.cumsum(w) - 0.5 * w                  # midpoint weighting\n    cum  /= cum[-1]\n    return np.interp(q, cum, v)\nvalues  = np.array([10, 20, 30, 40, 50])\nweights = np.array([1, 1, 5, 1, 1])                 # 30 dominates\nprint(\"weighted median:\", weighted_quantile(values, weights, 0.5))\n# Decision rule:\n#   exploratory summary                -> np.percentile([25,50,75]) + Tukey fences\n#   billing / SLA threshold              -> method='lower' or 'higher' (no half-points)\n#   heavy-tailed / many outliers          -> MAD-based rule, not IQR\n#   weighted samples (frequency, exposure) -> custom weighted_quantile, not np.percentile\n#   need rolling percentiles               -> pandas .rolling().quantile()\n#\n# Anti-pattern: 1.5*IQR fences on small (n < 20) samples\n#   With few observations the fences are wide and miss real outliers, OR they\n#   flag everything if the data is bimodal. Use bootstrap CIs on the quartiles."
                  }
        ],
        tips: [
                  "IQR method: outliers are beyond Q1 - 1.5*IQR or Q3 + 1.5*IQR",
                  "Percentiles are more robust than mean/std for skewed distributions",
                  "pd.describe() includes min, 25%, 50%, 75%, max, mean, std automatically"
        ],
        mistake: "Using percentiles without context; always check full distribution visually too.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "correlation",
        fn: "pearsonr, spearmanr, kendalltau",
        desc: "Compute Pearson, Spearman, and Kendall correlations.",
        category: "Association",
        subtitle: "Measure linear and rank-based relationships",
        signature: "scipy.stats.pearsonr(x, y), spearmanr(x, y), kendalltau(x, y)",
        descLong: "Pearson measures linear association (-1 to 1). Spearman and Kendall use ranks, robust to outliers and nonlinearity. All return coefficient and p-value.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pearsonr, spearmanr, kendalltau — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nx = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])\ny = 2 * x + np.array([0.1, -0.2, 0.3, 0, 0.4, -0.1, 0.2, 0.5, -0.3, 0.1])\nr, p = stats.pearsonr(x, y)\nprint(f\"Pearson r = {r:.3f}, p = {p:.3g}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pearsonr, spearmanr, kendalltau — common patterns you'll see in production.\n# APPROACH  - Combine pearsonr, spearmanr, kendalltau with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nnp.random.seed(0)\nx = np.arange(1, 11)\ny = 2 * x + np.random.normal(0, 1, 10)\n# Make the last point a wild outlier\ny_out = y.copy(); y_out[-1] = 100\nprint(\"                  clean      with outlier\")\nfor name, fn in [(\"Pearson\",   stats.pearsonr),\n                 (\"Spearman\",  stats.spearmanr),\n                 (\"Kendall τ\", stats.kendalltau)]:\n    print(f\"{name:>10}:  {fn(x, y).statistic:+.3f}     {fn(x, y_out).statistic:+.3f}\")\n# Pearson collapses; Spearman/Kendall barely move because they only care about ranks.\n# That's the rule: rank-based correlations are robust to outliers and monotonic\n# but-not-linear relationships."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pearsonr, spearmanr, kendalltau — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\nnp.random.seed(0)\nx = np.arange(1, 51)\ny = 2 * x + np.random.normal(0, 4, 50)\n# 1) scipy returns a result object — use .confidence_interval() for Pearson r\nres = stats.pearsonr(x, y)\nprint(f\"Pearson r = {res.statistic:.3f}, 95% CI = {res.confidence_interval(0.95)}\")\nprint(f\"p-value (H0: r=0) = {res.pvalue:.3g}\")\n# 2) Bootstrap CI for any correlation — works for Spearman / Kendall too\ndef boot_ci(x, y, fn=lambda a, b: stats.spearmanr(a, b).statistic, n=2000, alpha=0.05):\n    rng = np.random.default_rng(0)\n    n_obs = len(x)\n    rs = np.empty(n)\n    for i in range(n):\n        idx = rng.integers(0, n_obs, n_obs)\n        rs[i] = fn(x[idx], y[idx])\n    return np.quantile(rs, [alpha / 2, 1 - alpha / 2])\nprint(\"Spearman 95% CI:\", boot_ci(x, y))\n# 3) Partial correlation — control for a confounder z\ndef partial_corr(x, y, z):\n    # residualize x and y against z, then plain Pearson on the residuals\n    rx = x - np.polyval(np.polyfit(z, x, 1), z)\n    ry = y - np.polyval(np.polyfit(z, y, 1), z)\n    return stats.pearsonr(rx, ry).statistic\n# Decision rule:\n#   linear, ratio/interval, normal-ish    -> Pearson\n#   monotonic but nonlinear, ordinal      -> Spearman\n#   small n, lots of ties, ordinal         -> Kendall τ (more conservative than Spearman)\n#   any outliers / heavy tails             -> Spearman or Kendall, never Pearson\n#   confounding suspected                  -> partial correlation, then re-test\n#   need uncertainty                        -> CI on r (built-in for Pearson, bootstrap otherwise)\n#\n# Anti-pattern: reporting r without a scatterplot\n#   Anscombe's quartet: four datasets, identical r, wildly different shapes (one\n#   linear, one curved, one with an outlier driving the whole thing). Always plot."
                  }
        ],
        tips: [
                  "Pearson assumes linearity; use Spearman/Kendall for monotonic relationships",
                  "Spearman/Kendall robust to outliers; preferred for non-normal data",
                  "p-value < 0.05 typically indicates significant correlation"
        ],
        mistake: "Using Pearson on monotonic but non-linear data; Spearman is more appropriate.",
        shorthand: {
          verbose: "import numpy as np\nfrom scipy import stats\nnp.random.seed(42)\nx = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])",
          concise: "print(f'Spearman r: {stats.spearmanr(x_clean, y_clean)[0]:.4f}')",
        },
      },
      {
        id: "covariance",
        fn: "np.cov, pandas .cov(), .corr()",
        desc: "Calculate covariance and correlation matrices.",
        category: "Multivariate",
        subtitle: "Joint variability across multiple variables",
        signature: "np.cov(X.T), df.cov(), df.corr()",
        descLong: "Covariance measures joint variability; correlation is normalized covariance (-1 to 1). Matrices reveal all pairwise relationships in dataset.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.cov, pandas .cov(), .corr() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport pandas as pd\ndf = pd.DataFrame({\n    \"age\":          [25, 30, 35, 40, 45, 50],\n    \"income\":       [40_000, 50_000, 60_000, 75_000, 85_000, 95_000],\n    \"hours_worked\": [35, 40, 45, 50, 45, 40],\n})\nprint(df.cov())                                  # covariance matrix\nprint(df.corr())                                 # correlation matrix (-1..1)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.cov, pandas .cov(), .corr() — common patterns you'll see in production.\n# APPROACH  - Combine np.cov, pandas .cov(), .corr() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nimport pandas as pd\ndf = pd.DataFrame({\n    \"age\":    [25, 30, 35, 40, 45, 50],\n    \"income\": [40_000, 50_000, 60_000, 75_000, 85_000, 95_000],\n    \"hours\":  [35, 40, 45, 50, 45, 40],\n})\n# 1) numpy: rows = variables, columns = observations. ALWAYS transpose a (n, k) frame.\ncov_np = np.cov(df.values.T)                     # shape (3, 3)\nprint(cov_np)\n# 2) pandas just does the right thing — and can switch correlation kind\nprint(df.corr(method=\"pearson\"))                 # default\nprint(df.corr(method=\"spearman\"))                # rank-based, robust to outliers\n# 3) Convert covariance -> correlation by hand\nstd = df.std(ddof=1).values\ncorr_from_cov = df.cov().values / np.outer(std, std)\nprint(np.allclose(corr_from_cov, df.corr().values))   # True"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.cov, pandas .cov(), .corr() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nimport pandas as pd\nfrom scipy import stats\nrng = np.random.default_rng(0)\nX = rng.normal(size=(200, 4))\nX[0, :] = 50                                          # one outlier row contaminates everything\n# 1) Robust covariance — empirical covariance is destroyed by one outlier\nfrom sklearn.covariance import MinCovDet\nrobust = MinCovDet(random_state=0).fit(X)\nprint(\"empirical det:\", np.linalg.det(np.cov(X.T)))\nprint(\"robust   det:\", np.linalg.det(robust.covariance_))\n# 2) Sample-too-small / collinear -> matrix is singular or near-singular.\n#    Shrinkage pulls cov toward a diagonal target, fixing conditioning.\nfrom sklearn.covariance import LedoitWolf\nshrunk = LedoitWolf().fit(X).covariance_\n# 3) Missing data — pairwise vs listwise has very different bias profiles\ndf = pd.DataFrame(X)\ndf.iloc[0, 0] = np.nan\nprint(df.cov())                                       # pandas: pairwise by default\nprint(df.dropna().cov())                              # listwise: drops rows with any NaN\n# 4) For correlations on ranks (robust + monotonic) use spearman or kendall\nprint(df.corr(method=\"spearman\").round(2))\n# Decision rule:\n#   exploratory data analysis             -> df.cov() / df.corr() and inspect\n#   features for ML / linear models        -> standardize first; cov of standardized = corr\n#   outliers suspected                      -> MinCovDet (robust) or Spearman corr\n#   high-dim, small n (cov is singular)     -> Ledoit-Wolf shrinkage\n#   portfolio / risk modeling                -> exponentially weighted cov, not equal-weight\n#   missing data                              -> understand pairwise (more bias) vs listwise (less data)\n#\n# Anti-pattern: feeding a non-PSD covariance matrix to a Gaussian / Mahalanobis\n#   Pairwise-deletion or correlation-from-pieces can produce a matrix that ISN'T\n#   positive semi-definite. Check eigenvalues; use shrinkage if they go negative."
                  }
        ],
        tips: [
                  "Use .T with np.cov() — rows must be variables, columns observations",
                  "Correlation standardizes covariance to [-1, 1] for easier interpretation",
                  "Covariance values depend on scale of variables; hard to interpret directly"
        ],
        mistake: "Forgetting .T in np.cov(X.T); without it, treats each column as variable.",
        shorthand: {
          verbose: "import numpy as np\nimport pandas as pd\ndata = {\n'age': [25, 30, 35, 40, 45, 50],",
          concise: "print(f'Correlation(age, income): {corr_manual:.4f}')",
        },
      },
    ],
  },

  // ── Section 2: Probability Distributions ─────────────────────────────────────────
  {
    id: "distributions-py",
    title: "Probability Distributions",
    entries: [
      {
        id: "normal-distribution",
        fn: "scipy.stats.norm",
        desc: "Work with normal distribution: pdf, cdf, ppf, rvs, fit.",
        category: "Distribution Functions",
        subtitle: "Gaussian bell curve operations",
        signature: "scipy.stats.norm.pdf(x, loc, scale), norm.cdf(), norm.ppf(), norm.rvs()",
        descLong: "Normal distribution is fundamental to statistics. pdf: probability density, cdf: cumulative probability, ppf: inverse cdf, rvs: random samples, fit: estimate parameters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of scipy.stats.norm — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nn = stats.norm(loc=0, scale=1)                   # standard normal\nprint(f\"pdf(0):    {n.pdf(0):.4f}\")              # density at the mean\nprint(f\"cdf(1.96): {n.cdf(1.96):.4f}\")           # P(X <= 1.96) ≈ 0.975\nprint(f\"ppf(.975): {n.ppf(0.975):.4f}\")          # inverse CDF = 1.96\nprint(f\"sample 5: {n.rvs(size=5).round(2)}\")     # five random draws"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of scipy.stats.norm — common patterns you'll see in production.\n# APPROACH  - Combine scipy.stats.norm with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\n# Two equivalent calling conventions\nn = stats.norm(loc=100, scale=15)                # frozen distribution\nprint(stats.norm.cdf(115, loc=100, scale=15))    # classmethod with params\nprint(n.cdf(115))                                # frozen call — cleaner\n# Probabilities over intervals\nprint(f\"P(X > 130):     {1 - n.cdf(130):.4f}\")\nprint(f\"P(85 < X < 115): {n.cdf(115) - n.cdf(85):.4f}\")\n# Quantiles for confidence-interval lookups\nprint(f\"68% interval: {n.interval(0.68)}\")        # mean ± 1 SD\nprint(f\"95% interval: {n.interval(0.95)}\")        # mean ± 1.96 SD\n# Fit normal parameters from data via MLE\ndata = np.array([99, 101, 105, 95, 110, 102, 98, 100, 104])\nmu_hat, sigma_hat = stats.norm.fit(data)         # MLE: divides by N, not N-1\nprint(f\"fitted mu={mu_hat:.2f}  sigma={sigma_hat:.2f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of scipy.stats.norm — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\nn = stats.norm(loc=0, scale=1)\n# 1) Tail probabilities: use sf (survival function = 1 - cdf), not 1 - cdf\n#    1 - cdf(8) underflows to 0 in float64; sf(8) returns the right value.\nprint(\"1 - cdf(8):\", 1 - n.cdf(8))               # 0.0  (lost precision)\nprint(\"sf(8):    \", n.sf(8))                     # 6.22e-16 (correct)\nprint(\"logsf(8): \", n.logsf(8))                  # -34.97 — useful for log-likelihoods\n# 2) ALWAYS check fit before trusting probabilities from a fitted model\ndata = np.concatenate([np.random.default_rng(0).normal(0, 1, 95),\n                       np.array([10, 11, -9, 8, -8])])    # 5% extreme tails\nmu, sigma = stats.norm.fit(data)\nks_stat, ks_p = stats.kstest(data, \"norm\", args=(mu, sigma))\nsw_stat, sw_p = stats.shapiro(data)\nprint(f\"KS p={ks_p:.3g}   Shapiro p={sw_p:.3g}\")\n# Both p-values small -> the fit is bad. Don't quote tail probabilities from it.\n# 3) Heavy tails? Use Student-t (one extra parameter, 'df') instead of normal.\ndf, loc, scale = stats.t.fit(data)\nprint(f\"t-fit: df={df:.1f}  loc={loc:.2f}  scale={scale:.2f}\")\n# Smaller df -> heavier tails. df > ~30 -> essentially normal.\n# Decision rule:\n#   roughly bell-shaped, light tails       -> norm\n#   bell-shaped but heavy tails / outliers  -> Student-t\n#   bounded outcomes (0 to 1, percent)       -> beta\n#   all-positive, skewed                      -> lognormal or gamma\n#   counts                                     -> poisson / negbin (NOT normal)\n#   tail probability < 1e-10                  -> sf / logsf, never 1 - cdf\n#\n# Anti-pattern: passing variance to scale=\n#   scale is the STANDARD DEVIATION, not the variance. norm(loc=0, scale=4) is\n#   a normal with std=4, not var=4. This is the most common scipy.stats bug."
                  }
        ],
        tips: [
                  "loc=mean, scale=std — don't confuse with variance",
                  "ppf() is inverse of cdf(); use for critical values in hypothesis testing",
                  "rvs(size=n) generates random samples; set random_state for reproducibility"
        ],
        mistake: "Passing variance instead of std to scale parameter.",
        shorthand: {
          verbose: "import numpy as np\nfrom scipy import stats\nimport matplotlib.pyplot as plt\nmu, sigma = 0, 1",
          concise: "print(f'P(1 < X < 2): {prob_1to2:.4f}')",
        },
      },
      {
        id: "probability-distributions",
        fn: "binomial, poisson, exponential, uniform",
        desc: "Work with common discrete and continuous distributions.",
        category: "Distribution Families",
        subtitle: "Binomial, Poisson, Exponential, Uniform",
        signature: "scipy.stats.binom(), poisson(), expon(), uniform()",
        descLong: "Common distributions for modeling different phenomena. Binomial for count successes, Poisson for rare events, Exponential for waiting times, Uniform for equal probability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of binomial, poisson, exponential, uniform — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom scipy import stats\n# Discrete -> .pmf (probability MASS)\nb = stats.binom(n=10, p=0.3)                     # 10 trials, 30% success rate\nprint(f\"P(K=3) = {b.pmf(3):.3f}\")                # exact count\nprint(f\"P(K<=3) = {b.cdf(3):.3f}\")               # cumulative\n# Continuous -> .pdf (probability DENSITY)\ne = stats.expon(scale=2)                          # mean = 2 (waiting time)\nprint(f\"f(1)   = {e.pdf(1):.3f}\")\nprint(f\"P(X<=1) = {e.cdf(1):.3f}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of binomial, poisson, exponential, uniform — common patterns you'll see in production.\n# APPROACH  - Combine binomial, poisson, exponential, uniform with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom scipy import stats\n# DISCRETE\nbinom    = stats.binom(n=10, p=0.3)              # K successes out of n\npoisson  = stats.poisson(mu=3)                   # mu = average rate\ngeom     = stats.geom(p=0.2)                     # # trials until first success\nnbinom   = stats.nbinom(n=5, p=0.5)              # # failures before 5 successes\n# CONTINUOUS\nexpon    = stats.expon(scale=2)                  # scale = 1/lambda (mean wait)\ngamma    = stats.gamma(a=2, scale=2)             # shape a, scale; sum of exponentials\nbeta     = stats.beta(a=2, b=5)                  # bounded on [0, 1]\nuniform  = stats.uniform(loc=0, scale=10)        # uniform on [loc, loc+scale]\n# Pattern is the same for all of them\nfor name, d in [(\"binom\", binom), (\"poisson\", poisson),\n                (\"expon\", expon), (\"beta\", beta)]:\n    if d.dist.name in (\"binom\", \"poisson\", \"geom\", \"nbinom\"):\n        evaluator = d.pmf\n    else:\n        evaluator = d.pdf\n    print(f\"{name:>8}: mean={d.mean():.2f}  var={d.var():.2f}  f(at typical)={evaluator(d.mean()):.3f}\")\n# scipy parameterization gotcha:\n# - expon takes scale = 1/lambda (NOT lambda)\n# - uniform takes (loc, scale) where range is [loc, loc + scale], NOT [low, high]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of binomial, poisson, exponential, uniform — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\n# 1) Always evaluate likelihoods in log-space — products of small numbers underflow\ndata = np.array([1.2, 0.8, 2.1, 0.5, 3.0])\nll_naive = np.prod(stats.expon(scale=1.5).pdf(data))      # works for n=5; explodes at n=1000\nll_safe  = stats.expon(scale=1.5).logpdf(data).sum()      # always stable\nprint(f\"naive: {ll_naive:.3e}   logpdf sum: {ll_safe:.3f}\")\n# 2) Method-of-moments quick fits (good initialization for MLE)\ndef fit_gamma_moments(x):\n    m, v = x.mean(), x.var(ddof=1)\n    a = m * m / v                                          # shape\n    scale = v / m                                          # scale\n    return a, scale\n# 3) Compound / mixture models — Poisson with overdispersion -> NegBinomial\ncounts = stats.nbinom.rvs(n=5, p=0.3, size=1000, random_state=0)\n# Poisson assumes mean == var; if var > mean, fit nbinom instead.\nprint(f\"mean={counts.mean():.2f}  var={counts.var():.2f}\")\n# Decision rule:\n#   N independent yes/no trials, fixed N             -> Binomial\n#   rare events in time/space, rate constant         -> Poisson\n#   counts BUT var > mean (overdispersed)             -> NegBinomial\n#   waiting time between Poisson events               -> Exponential\n#   sum of k independent exponentials                  -> Gamma (shape=k)\n#   rate / proportion bounded in [0,1]                 -> Beta\n#   product of many small effects                      -> Lognormal\n#   max of many samples                                  -> Gumbel / GEV\n#   anything fits a Bell                                 -> Normal LAST, after the others fail\n#\n# Anti-pattern: defaulting to normal because \"everything is normal eventually\"\n#   CLT applies to the SAMPLE MEAN, not the data. Income, file sizes, customer\n#   lifetimes are skewed populations forever. Normal-on-counts gives negative\n#   probabilities and broken CIs. Pick the family from the process, then verify."
                  }
        ],
        tips: [
                  "Use pmf() for discrete, pdf() for continuous distributions",
                  "Poisson is limit of Binomial as n→∞, p→0, np=λ",
                  "Exponential is memoryless — P(X > s+t | X > s) = P(X > t)"
        ],
        mistake: "Using pdf() instead of pmf() for discrete distributions (Binomial, Poisson).",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "confidence-intervals",
        fn: "scipy.stats.t.interval, bootstrap",
        desc: "Compute confidence intervals using t-distribution and bootstrap.",
        category: "Estimation",
        subtitle: "Estimate population parameters with uncertainty bounds",
        signature: "scipy.stats.t.interval(alpha, df, loc, scale), bootstrap resampling",
        descLong: "Confidence intervals estimate range containing true parameter with specified probability. t-distribution used for small samples; bootstrap provides non-parametric CI.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of scipy.stats.t.interval, bootstrap — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\ndata = np.array([22, 25, 23, 24, 26, 25, 24, 23, 25, 22])\nmean = data.mean()\nse   = stats.sem(data)\nci   = stats.t.interval(0.95, df=len(data) - 1, loc=mean, scale=se)\nprint(f\"mean = {mean:.2f}, 95% CI = ({ci[0]:.2f}, {ci[1]:.2f})\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of scipy.stats.t.interval, bootstrap — common patterns you'll see in production.\n# APPROACH  - Combine scipy.stats.t.interval, bootstrap with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\n# 1) t-distribution CI for the mean — assumes roughly normal data or n large\ndata = np.array([22, 25, 23, 24, 26, 25, 24, 23, 25, 22])\nci_t = stats.t.interval(0.95, df=len(data) - 1,\n                        loc=data.mean(), scale=stats.sem(data))\nprint(\"t   95% CI:\", ci_t)\n# 2) Bootstrap CI — non-parametric, works for any statistic\nres = stats.bootstrap((data,), np.mean,\n                      confidence_level=0.95,\n                      n_resamples=10_000,\n                      random_state=0)\nprint(\"boot 95% CI:\", res.confidence_interval)\n# 3) Proportion CI — DON'T use the normal approximation when p is near 0 or 1\n#    Wilson interval is the modern default.\nn_success, n_total = 12, 50\nci_wilson = stats.binomtest(k=n_success, n=n_total).proportion_ci(method=\"wilson\")\nprint(f\"prop  95% CI: ({ci_wilson.low:.3f}, {ci_wilson.high:.3f})\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of scipy.stats.t.interval, bootstrap — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(0)\n# 1) Bootstrap CI — three flavors: percentile, basic, BCa (bias-corrected & accelerated).\n#    BCa is the right default; it corrects for bias and skewness in the bootstrap dist.\ndata = rng.lognormal(0, 1, 30)                  # skewed: classic bootstrap test case\nfor method in (\"percentile\", \"basic\", \"BCa\"):\n    ci = stats.bootstrap((data,), np.median,\n                         confidence_level=0.95,\n                         method=method,\n                         n_resamples=10_000,\n                         random_state=0).confidence_interval\n    print(f\"{method:>10}: ({ci.low:.2f}, {ci.high:.2f})\")\n# 2) Bootstrap is INVALID for some statistics — extremes (max, min), heavy-tail\n#    parameters. Use parametric CIs or extreme-value theory there.\n# 3) Pivotal CI for the variance (chi-squared)\ndef variance_ci(data, alpha=0.05):\n    n  = len(data)\n    s2 = data.var(ddof=1)\n    lo = (n - 1) * s2 / stats.chi2.ppf(1 - alpha/2, df=n - 1)\n    hi = (n - 1) * s2 / stats.chi2.ppf(alpha/2,   df=n - 1)\n    return lo, hi\nprint(\"var 95% CI:\", variance_ci(data))\n# 4) Difference of means (Welch — unequal variances default; t-test's CI)\na, b = rng.normal(0, 1, 30), rng.normal(0.5, 1.5, 25)\nci = stats.ttest_ind(a, b, equal_var=False).confidence_interval(0.95)\nprint(f\"mean diff 95% CI: ({ci.low:.2f}, {ci.high:.2f})\")\n# Decision rule:\n#   mean of one sample, normal-ish      -> stats.t.interval\n#   any statistic, no parametric assumption -> stats.bootstrap, method='BCa'\n#   proportion / binary outcome           -> Wilson (binomtest.proportion_ci)\n#   variance / std                         -> chi-squared pivotal\n#   difference of means                    -> ttest_ind(...).confidence_interval()\n#   small n AND skewed                     -> bootstrap BCa, n_resamples >= 10_000\n#   extreme quantiles (95th, 99th)         -> EVT; bootstrap underestimates\n#\n# Anti-pattern: \"the 95% CI contains the true value 95% of the time\"\n#   Wrong interpretation — that's a Bayesian credible interval. The frequentist\n#   95% CI says: \"if we repeated sampling many times, 95% of intervals computed\n#   this way would contain the true value.\" For a single observed CI, it either\n#   does or doesn't."
                  }
        ],
        tips: [
                  "Use t-distribution for small samples (n < 30), z-distribution for large samples",
                  "Bootstrap works without assuming normality; flexible and robust",
                  "CI narrower with larger sample size; wider with higher confidence level"
        ],
        mistake: "Using z-scores instead of t-scores for small samples; t accounts for uncertainty in estimating std.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    result.append(x * 2)",
          concise: "result = [x * 2 for x in items]",
        },
      },
      {
        id: "central-limit-theorem",
        fn: "CLT simulation",
        desc: "Demonstrate Central Limit Theorem with simulation.",
        category: "Theory",
        subtitle: "Distribution of sample means approaches normal",
        signature: "Simulate repeated sampling; plot distribution of means",
        descLong: "CLT: regardless of population distribution, sample mean distribution approaches normal as n increases. Foundation of inference and hypothesis testing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of CLT simulation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(0)\npopulation = stats.expon.rvs(scale=2, size=10_000, random_state=rng)   # right-skewed\n# Take 1000 samples of size n=30 and average each one\nsample_means = np.array([\n    rng.choice(population, size=30).mean() for _ in range(1000)\n])\nprint(f\"population skew:    {stats.skew(population):+.2f}\")    # ~ +2 (very skewed)\nprint(f\"sample-means skew:  {stats.skew(sample_means):+.2f}\")  # ~ 0 (symmetric)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of CLT simulation — common patterns you'll see in production.\n# APPROACH  - Combine CLT simulation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(0)\npopulation = stats.expon.rvs(scale=2, size=100_000, random_state=rng)\npop_std = population.std()\nprint(f\"{'n':>5} | {'observed SE':>12} | {'sigma/sqrt(n)':>14} | {'skew':>6}\")\nfor n in (5, 10, 30, 100, 500):\n    means = np.array([rng.choice(population, size=n).mean() for _ in range(2000)])\n    print(f\"{n:>5} | {means.std():>12.3f} | {pop_std / np.sqrt(n):>14.3f} | \"\n          f\"{stats.skew(means):>+6.2f}\")\n# Two takeaways:\n#   - The observed SE matches sigma/sqrt(n) at every n.\n#   - Skew falls toward 0 as n grows — that's the CLT."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of CLT simulation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(0)\n# 1) Heavy tails (Cauchy / Pareto with small alpha) — CLT NEVER converges\n#    because the population variance is infinite.\ndef sample_means(pop_sampler, n, reps=2000):\n    return np.array([pop_sampler(n).mean() for _ in range(reps)])\ncauchy_means  = sample_means(lambda n: rng.standard_cauchy(n), n=1000)\nprint(f\"Cauchy n=1000 means: skew={stats.skew(cauchy_means):.2f} \"\n      f\"std={cauchy_means.std():.1f}\")    # std doesn't shrink with n!\n# 2) Strong serial correlation breaks CLT's independence assumption.\n#    Solution: thin the series, or use a CLT for dependent data.\n# 3) Bounded outcomes (proportions near 0 or 1) need n much larger than 30.\n#    Rule of thumb: n*p > 10 AND n*(1-p) > 10 before the normal approx is OK.\n# 4) Diagnostic: Shapiro-Wilk on the SAMPLE MEANS (not the data).\n#    If p < 0.05 here, your CLT-based CI / t-test is suspect.\nfast_clt   = sample_means(lambda n: rng.exponential(1, n), n=30)\nprint(\"Shapiro on means (exp, n=30):\", stats.shapiro(fast_clt).pvalue)  # ~ ok\n# Decision rule:\n#   light-tailed, independent, n >= 30   -> classical CLT; t-test / z-test work\n#   heavy-tailed (var infinite)            -> CLT fails; use medians + bootstrap\n#   bounded (proportions, rates)            -> need n*p, n*(1-p) >= 10\n#   strong autocorrelation (time series)    -> block bootstrap, NOT plain CLT\n#   tiny n (< 10) even on normal data       -> exact tests (permutation, Fisher)\n#\n# Anti-pattern: assuming \"n=30 is always enough\"\n#   The classic rule comes from Pearson-era pre-bootstrap days. With heavy tails\n#   or strong skew you may need n in the hundreds before the means look normal.\n#   Always check the means' distribution, not the data's."
                  }
        ],
        tips: [
                  "CLT applies regardless of population shape; sample means converge to normal",
                  "Larger sample size needed for non-normal populations to see effect",
                  "SEM = population_std / sqrt(n); justifies z-tests and CIs"
        ],
        mistake: "Confusing population normality requirement; CLT needs normal sample means, not population.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    result.append(x * 2)",
          concise: "result = [x * 2 for x in items]",
        },
      },
    ],
  },

  // ── Section 3: Hypothesis Testing ─────────────────────────────────────────
  {
    id: "hypothesis-testing-py",
    title: "Hypothesis Testing",
    entries: [
      {
        id: "t-test",
        fn: "ttest_1samp, ttest_ind, ttest_rel",
        desc: "One-sample, two-sample, and paired t-tests.",
        category: "Parametric Tests",
        subtitle: "Test if means differ significantly",
        signature: "scipy.stats.ttest_1samp(), ttest_ind(), ttest_rel()",
        descLong: "T-tests compare means. One-sample tests against constant; two-sample compares groups; paired tests related measurements. All return t-statistic and p-value.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ttest_1samp, ttest_ind, ttest_rel — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nsample = np.array([22, 25, 23, 24, 26, 25, 24, 23, 25, 22])\nresult = stats.ttest_1samp(sample, popmean=24)\nprint(f\"t = {result.statistic:.3f}, p = {result.pvalue:.3f}\")\nprint(\"reject H0 (mean = 24)?\" , result.pvalue < 0.05)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ttest_1samp, ttest_ind, ttest_rel — common patterns you'll see in production.\n# APPROACH  - Combine ttest_1samp, ttest_ind, ttest_rel with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\n# 1) One-sample: data vs a known/hypothesized value\nsample = np.array([22, 25, 23, 24, 26, 25, 24, 23, 25, 22])\nprint(stats.ttest_1samp(sample, popmean=24))\n# 2) Two independent groups — Welch's t-test (default for unequal variances)\na = np.array([20, 22, 25, 24, 23])\nb = np.array([28, 26, 29, 27, 30])\nres = stats.ttest_ind(a, b, equal_var=False)             # equal_var=False -> Welch\nprint(f\"two-sample: t={res.statistic:.3f}  p={res.pvalue:.4f}\")\nprint(f\"95% CI for mean diff: {res.confidence_interval(0.95)}\")\n# Quick check: were the variances close enough for Student's instead of Welch?\nprint(\"Levene p:\", stats.levene(a, b).pvalue)            # > 0.05 -> equal-var OK\n# 3) Paired (repeated measures: same subjects, two conditions)\nbefore = np.array([20, 22, 25, 24, 23])\nafter  = np.array([22, 25, 28, 26, 26])\nprint(stats.ttest_rel(before, after))                    # tests mean(after-before) = 0"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ttest_1samp, ttest_ind, ttest_rel — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\na = np.array([20, 22, 25, 24, 23, 21, 22, 24])\nb = np.array([28, 26, 29, 27, 30, 25, 28, 27])\n# 1) Effect size — p-value tells you SIGNIFICANCE; Cohen's d tells you SIZE\ndef cohens_d(x, y):\n    nx, ny = len(x), len(y)\n    sp = np.sqrt(((nx - 1)*x.var(ddof=1) + (ny - 1)*y.var(ddof=1)) / (nx + ny - 2))\n    return (x.mean() - y.mean()) / sp\nd = cohens_d(a, b)\nprint(f\"Cohen's d = {d:.2f}    (|d|: 0.2 small, 0.5 medium, 0.8 large)\")\n# 2) One-sided test — only when you have a directional hypothesis BEFORE seeing data\nres = stats.ttest_ind(a, b, equal_var=False, alternative=\"less\")    # H1: mean(a) < mean(b)\nprint(f\"one-sided p = {res.pvalue:.4f}\")\n# 3) Diagnostics — t-test assumes near-normality (mostly matters at small n)\nprint(\"Shapiro a:\", stats.shapiro(a).pvalue)\nprint(\"Shapiro b:\", stats.shapiro(b).pvalue)\n# 4) When normality fails AND n is small -> nonparametric / permutation\nprint(\"Mann-Whitney U:\", stats.mannwhitneyu(a, b).pvalue)\nperm = stats.permutation_test((a, b),\n                              statistic=lambda x, y: x.mean() - y.mean(),\n                              permutation_type=\"independent\",\n                              n_resamples=10_000, random_state=0)\nprint(f\"permutation p = {perm.pvalue:.4f}\")\n# Decision rule:\n#   one sample vs a number               -> ttest_1samp\n#   two independent groups, equal var     -> ttest_ind(equal_var=True)\n#   two independent groups (default)      -> ttest_ind(equal_var=False) — Welch\n#   paired / repeated measures             -> ttest_rel\n#   non-normal AND small n                  -> Mann-Whitney U or permutation_test\n#   non-normal AND paired                   -> Wilcoxon signed-rank\n#   directional hypothesis pre-registered   -> alternative=\"less\"/\"greater\"\n#\n# Anti-pattern: reporting only the p-value\n#   \"p < 0.05\" with n=100,000 routinely catches differences too small to matter.\n#   Always report effect size (Cohen's d for means) and a CI on the difference."
                  }
        ],
        tips: [
                  "Use ttest_ind with equal_var=False for Welch test (unequal variances)",
                  "Paired test uses differences; more powerful when data are correlated",
                  "p < 0.05: typically reject null hypothesis (difference is significant)"
        ],
        mistake: "Using independent t-test on paired data; paired test has more power.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "anova-test",
        fn: "scipy.stats.f_oneway",
        desc: "One-way ANOVA to test if multiple group means differ.",
        category: "Non-parametric Tests",
        subtitle: "Compare means across 3+ groups",
        signature: "scipy.stats.f_oneway(*groups)",
        descLong: "ANOVA tests if means differ across multiple groups. Returns F-statistic and p-value. Follow up with post-hoc tests if significant.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of scipy.stats.f_oneway — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\na = np.array([10, 12, 11, 13, 12, 11])\nb = np.array([15, 17, 16, 18, 17, 16])\nc = np.array([20, 22, 21, 23, 22, 21])\nf, p = stats.f_oneway(a, b, c)\nprint(f\"F = {f:.2f}, p = {p:.4g}\")\nprint(\"at least one group differs?\" , p < 0.05)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of scipy.stats.f_oneway — common patterns you'll see in production.\n# APPROACH  - Combine scipy.stats.f_oneway with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\na = np.array([10, 12, 11, 13, 12, 11])\nb = np.array([15, 17, 16, 18, 17, 16])\nc = np.array([20, 22, 21, 23, 22, 21])\n# 1) Omnibus F-test\nf_res = stats.f_oneway(a, b, c)\nprint(f\"F = {f_res.statistic:.2f}, p = {f_res.pvalue:.4g}\")\n# 2) Effect size (eta-squared = SS_between / SS_total)\nall_data   = np.concatenate([a, b, c])\ngrand_mean = all_data.mean()\nss_between = sum(len(g) * (g.mean() - grand_mean) ** 2 for g in (a, b, c))\nss_total   = ((all_data - grand_mean) ** 2).sum()\neta2       = ss_between / ss_total\nprint(f\"eta^2 = {eta2:.3f}    (0.01 small / 0.06 medium / 0.14 large)\")\n# 3) ANOVA only says \"something is different\" — Tukey HSD says WHICH pairs\nhsd = stats.tukey_hsd(a, b, c)            # scipy >= 1.8\nprint(hsd)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of scipy.stats.f_oneway — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nimport pandas as pd\nfrom scipy import stats\ngroups = [\n    np.array([10, 12, 11, 13, 12, 11]),\n    np.array([15, 17, 16, 18, 17, 16]),\n    np.array([20, 22, 21, 23, 22, 21]),\n]\n# 1) Check assumptions BEFORE picking the test\nprint(\"Levene equal-var p:\", stats.levene(*groups).pvalue)         # >0.05 -> equal var OK\nfor i, g in enumerate(groups):\n    print(f\"Shapiro group {i} p:\", stats.shapiro(g).pvalue)         # >0.05 -> normal OK\n# 2) Equal-variance OK + normal           -> classical f_oneway\n#    Unequal variance, normal-ish          -> Welch's ANOVA\n#    Non-normal at any group                -> Kruskal-Wallis\nimport pingouin as pg                                                # has Welch-ANOVA\nwelch = pg.welch_anova(dv=\"value\", between=\"group\",\n                       data=pd.DataFrame({\n                           \"value\": np.concatenate(groups),\n                           \"group\": np.repeat([\"A\", \"B\", \"C\"], [len(g) for g in groups])}))\nprint(welch)\nprint(\"Kruskal-Wallis p:\", stats.kruskal(*groups).pvalue)            # nonparametric\n# 3) Two-way ANOVA — when you have TWO factors (e.g. drug AND dose)\nimport statsmodels.formula.api as smf\ndf = pd.DataFrame({\n    \"y\": np.concatenate(groups),\n    \"drug\": np.repeat([\"X\", \"Y\", \"Z\"], 6),\n    \"dose\": np.tile([1, 2, 3], 6),\n})\nmodel = smf.ols(\"y ~ C(drug) + C(dose) + C(drug):C(dose)\", data=df).fit()\nprint(model.summary().tables[1])\n# Decision rule:\n#   3+ groups, normal, equal var          -> stats.f_oneway -> Tukey HSD\n#   3+ groups, normal, unequal var         -> Welch ANOVA -> Games-Howell post-hoc\n#   3+ groups, non-normal / ordinal        -> stats.kruskal -> Dunn's test\n#   2 factors / interaction                 -> two-way ANOVA via statsmodels\n#   repeated measures (same subjects)       -> repeated-measures ANOVA (pingouin.rm_anova)\n#\n# Anti-pattern: running pairwise t-tests and ignoring multiple comparisons\n#   3 groups -> 3 pairwise tests at alpha=0.05 -> family-wise error ~14%, not 5%.\n#   Either use ANOVA + Tukey, or apply Bonferroni / Holm to the t-tests."
                  }
        ],
        tips: [
                  "Assumes normality and equal variances; use Levene test to check variances",
                  "If p < 0.05, means differ; use Tukey or Bonferroni for pairwise comparisons",
                  "Eta-squared = SS_between / SS_total; measures effect size"
        ],
        mistake: "Running multiple t-tests instead of ANOVA; ANOVA controls Type I error rate.",
        shorthand: {
          verbose: "import numpy as np\nfrom scipy import stats\ngroup1 = np.array([10, 12, 11, 13, 12, 11])\ngroup2 = np.array([15, 17, 16, 18, 17, 16])",
          concise: "print(f'\\nManual F calculation: {f_manual:.4f}')",
        },
      },
      {
        id: "chi-squared",
        fn: "scipy.stats.chi2_contingency",
        desc: "Chi-squared test of independence for categorical data.",
        category: "Non-parametric Tests",
        subtitle: "Test association between categorical variables",
        signature: "scipy.stats.chi2_contingency(contingency_table)",
        descLong: "Tests if two categorical variables are independent. Operates on contingency table (crosstab). Returns chi-squared stat, p-value, dof, expected frequencies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of scipy.stats.chi2_contingency — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\ntable = np.array([[30, 50, 20],         # Product A\n                  [15, 40, 45]])        # Product B\nres = stats.chi2_contingency(table)\nprint(f\"chi^2 = {res.statistic:.2f}  p = {res.pvalue:.4g}  dof = {res.dof}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of scipy.stats.chi2_contingency — common patterns you'll see in production.\n# APPROACH  - Combine scipy.stats.chi2_contingency with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nimport pandas as pd\nfrom scipy import stats\n# Real-world: build a contingency table from raw rows\ndf = pd.DataFrame({\n    \"product\":      np.repeat(list(\"ABC\"), [80, 100, 100]),\n    \"satisfaction\": ([\"Yes\"]*60 + [\"No\"]*20) +     # Product A\n                    ([\"Yes\"]*55 + [\"No\"]*45) +     # Product B\n                    ([\"Yes\"]*55 + [\"No\"]*45),      # Product C\n})\ntable = pd.crosstab(df[\"product\"], df[\"satisfaction\"])\nprint(table)\nres = stats.chi2_contingency(table)\nprint(f\"chi^2 = {res.statistic:.2f}  p = {res.pvalue:.4g}  dof = {res.dof}\")\n# Assumption: all expected counts >= 5 (otherwise switch to Fishers exact)\nprint(\"min expected:\", res.expected_freq.min())\n# Effect size — Cramers V (chi^2 normalized to [0, 1])\nn       = table.values.sum()\nmin_dim = min(table.shape) - 1\ncramers_v = np.sqrt(res.statistic / (n * min_dim))\nprint(f\"Cramers V = {cramers_v:.3f}    (0.1 small / 0.3 medium / 0.5 large)\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of scipy.stats.chi2_contingency — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\n# 1) Sparse 2x2 -> Fishers exact (no asymptotic approximation)\ntable_2x2 = np.array([[8, 2],\n                      [1, 9]])\nodds, p = stats.fisher_exact(table_2x2, alternative=\"two-sided\")\nprint(f\"Fisher: odds_ratio={odds:.2f}, p={p:.4g}\")\n# 2) Larger sparse table -> G-test (likelihood-ratio chi^2)\ntable = np.array([[10, 0, 5], [2, 8, 3], [1, 1, 12]])\ng, gp, _, _ = stats.chi2_contingency(table, lambda_=\"log-likelihood\")\nprint(f\"G-test: G={g:.2f}, p={gp:.4g}\")\n# 3) Standardized residuals — which cells deviate from independence?\nres = stats.chi2_contingency(table)\nexp = res.expected_freq\nstd_res = (table - exp) / np.sqrt(exp)\nprint(\"std residuals:\\n\", std_res.round(2))\n# |residual| > 2 -> that cell drives the rejection.\n# 4) Goodness-of-fit (one categorical variable vs expected proportions)\nobserved = np.array([22, 19, 30, 29])\nexpected_n = np.array([0.25] * 4) * observed.sum()\nchi2, p = stats.chisquare(observed, f_exp=expected_n)\nprint(f\"GOF chi^2 = {chi2:.2f}, p = {p:.4g}\")\n# 5) Paired/dependent design (pre/post on SAME subjects) -> McNemars test\n#    chi-squared assumes independent rows; McNemar tests the off-diagonals.\nmcnemar = np.array([[40, 10],     # before yes / after yes, before yes / after no\n                    [25, 25]])\nfrom statsmodels.stats.contingency_tables import mcnemar as sm_mcnemar\nprint(\"McNemar p:\", sm_mcnemar(mcnemar, exact=False).pvalue)\n# Decision rule:\n#   2x2 with any expected count < 5      -> stats.fisher_exact\n#   r x c with sparse cells               -> G-test (lambda_=\"log-likelihood\")\n#   r x c, expected counts >= 5           -> stats.chi2_contingency\n#   one variable vs expected proportions  -> stats.chisquare (goodness of fit)\n#   want to know WHICH cell is unusual    -> standardized residuals; flag |z| > 2\n#   paired/repeated measurements           -> McNemar (or its k-variant: Cochran's Q)\n#   ordinal categories                      -> Cochran-Armitage trend test\n#\n# Anti-pattern: chi^2 on a 2x2 with one cell < 5\n#   The asymptotic distribution is wrong; p-values are unreliable. Switch to\n#   Fishers exact, which works for any cell counts."
                  }
        ],
        tips: [
                  "All expected frequencies must be >= 5; combine categories if violated",
                  "Cramér's V measures effect size; 0.1=small, 0.3=medium, 0.5=large",
                  "Tests independence, not causation; verify with domain knowledge"
        ],
        mistake: "Using on data with expected frequencies < 5; violates test assumptions.",
        shorthand: {
          verbose: "import numpy as np\nimport pandas as pd\nfrom scipy import stats\ndata = {",
          concise: "print(f'\\nEffect size (Cramér's V): {cramers_v:.4f}')",
        },
      },
      {
        id: "mann-whitney",
        fn: "scipy.stats.mannwhitneyu",
        desc: "Mann-Whitney U test for non-parametric comparison of two groups.",
        category: "Non-parametric Tests",
        subtitle: "Compare medians without normality assumption",
        signature: "scipy.stats.mannwhitneyu(group1, group2)",
        descLong: "Non-parametric alternative to t-test. Works with ranks instead of raw values. Robust to outliers and doesn't assume normality. Tests if distributions differ.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of scipy.stats.mannwhitneyu — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\na = np.array([10, 12, 11, 13, 12, 11, 10, 12])\nb = np.array([15, 17, 16, 18, 17, 16, 19])\nres = stats.mannwhitneyu(a, b, alternative=\"two-sided\")\nprint(f\"U = {res.statistic:.1f}, p = {res.pvalue:.4f}\")\nprint(f\"medians: a={np.median(a):.1f}  b={np.median(b):.1f}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of scipy.stats.mannwhitneyu — common patterns you'll see in production.\n# APPROACH  - Combine scipy.stats.mannwhitneyu with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\na = np.array([10, 12, 11, 13, 12, 11, 10, 12])\nb = np.array([15, 17, 16, 18, 17, 16, 100])              # one wild outlier\nprint(\"t-test  p =\", stats.ttest_ind(a, b, equal_var=False).pvalue)   # outlier sucks the mean\nprint(\"Mann-W  p =\", stats.mannwhitneyu(a, b).pvalue)                  # ranks ignore the magnitude\n# Rank-biserial correlation — Mann-Whitney's effect size\nu   = stats.mannwhitneyu(a, b).statistic\nn1, n2 = len(a), len(b)\nr_rb = 1 - (2 * u) / (n1 * n2)                           # range [-1, 1]\nprint(f\"rank-biserial r = {r_rb:+.3f}    (±0.1 small / 0.3 med / 0.5 large)\")\n# One-sided test — only with a directional hypothesis pre-registered\nprint(\"a > b? p =\", stats.mannwhitneyu(a, b, alternative=\"greater\").pvalue)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of scipy.stats.mannwhitneyu — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(0)\n# 1) Mann-Whitney is NOT exactly a \"median test\" — it tests stochastic dominance.\n#    \"Are values from A typically larger than values from B?\" Distributions of\n#    different shape can yield significant U even with the same median.\na = np.concatenate([rng.normal(0, 1, 50), [20, 21, 22]])    # heavy right tail\nb = rng.normal(0, 3, 50)                                     # wider, same median\nprint(\"medians equal-ish:\", np.median(a), np.median(b))\nprint(\"Mann-W p:\", stats.mannwhitneyu(a, b).pvalue)          # may still be significant\n# 2) Paired/dependent design -> Wilcoxon signed-rank\nbefore = np.array([22, 25, 28, 24, 26, 27])\nafter  = np.array([20, 23, 27, 22, 25, 26])\nprint(\"Wilcoxon signed-rank p:\", stats.wilcoxon(before, after).pvalue)\n# 3) 3+ unmatched groups -> Kruskal-Wallis (nonparametric ANOVA)\ng1 = rng.normal(0, 1, 20); g2 = rng.normal(0.5, 1, 20); g3 = rng.normal(1, 1, 20)\nprint(\"Kruskal-Wallis p:\", stats.kruskal(g1, g2, g3).pvalue)\n# 4) Permutation test — exact, no distributional assumption\nperm = stats.permutation_test((a, b),\n                              statistic=lambda x, y: np.median(x) - np.median(y),\n                              permutation_type=\"independent\",\n                              n_resamples=10_000, random_state=0)\nprint(f\"permutation p = {perm.pvalue:.4f}\")\n# Decision rule:\n#   2 unmatched groups, non-normal       -> Mann-Whitney U\n#   2 paired/repeated measurements       -> Wilcoxon signed-rank\n#   3+ unmatched groups, non-normal       -> Kruskal-Wallis -> Dunns post-hoc\n#   3+ paired (same subjects, k conditions) -> Friedman test\n#   small n with ties / want exact          -> permutation_test\n#   normal data, no outliers                 -> use the parametric test (t / ANOVA) for power\n#\n# Anti-pattern: choosing Mann-Whitney just to \"be safe\"\n#   On clean normal data the t-test is more powerful — you'll fail to detect\n#   real effects. Pick by the data's shape, not by anxiety about assumptions."
                  }
        ],
        tips: [
                  "Use when data non-normal, has outliers, or ordinal scale",
                  "Tests if distributions differ; more general than just comparing means",
                  "Less powerful than t-test on normal data, but safer with non-normal"
        ],
        mistake: "Using Mann-Whitney on normal data when t-test available; loses power.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "multiple-testing",
        fn: "statsmodels.stats.multitest.multipletests",
        desc: "Multiple testing correction (Bonferroni, Benjamini-Hochberg, etc.).",
        category: "Error Control",
        subtitle: "Control false positives with multiple comparisons",
        signature: "statsmodels.stats.multitest.multipletests(pvals, method)",
        descLong: "When running many tests, p-value threshold must be adjusted to control false positive rate. Bonferroni strict; Benjamini-Hochberg less conservative.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of statsmodels.stats.multitest.multipletests — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom statsmodels.stats.multitest import multipletests\np = np.array([0.001, 0.012, 0.04, 0.06, 0.20])\nreject, p_adj, _, _ = multipletests(p, alpha=0.05, method=\"bonferroni\")\nprint(\"reject:\", reject)        # bool array\nprint(\"adj p: \", p_adj.round(4))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of statsmodels.stats.multitest.multipletests — common patterns you'll see in production.\n# APPROACH  - Combine statsmodels.stats.multitest.multipletests with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nfrom statsmodels.stats.multitest import multipletests\n# Simulate 20 tests; first 5 have a real effect of 2 SDs\nrng = np.random.default_rng(0)\nA = rng.normal(0,    1, size=(20, 30))\nB = rng.normal(0,    1, size=(20, 30))\nB[:5] += 2.0                                   # 5 true positives\np = np.array([stats.ttest_ind(a, b, equal_var=False).pvalue\n              for a, b in zip(A, B)])\nprint(f\"raw p < 0.05: {(p < 0.05).sum()} (with no correction this overstates)\")\nfor method in (\"bonferroni\", \"holm\", \"fdr_bh\"):\n    reject, p_adj, _, _ = multipletests(p, alpha=0.05, method=method)\n    tp = reject[:5].sum()                       # caught true effects\n    fp = reject[5:].sum()                       # false alarms\n    print(f\"{method:>11}: TP={tp}/5  FP={fp}/15\")\n# Bonferroni: most conservative (lowest power, lowest FP).\n# Holm:       step-down; uniformly better than Bonferroni.\n# BH (FDR):   highest power; expected ~5% of \"discoveries\" are false."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of statsmodels.stats.multitest.multipletests — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom statsmodels.stats.multitest import multipletests\np_values = np.array([0.0001, 0.002, 0.01, 0.04, 0.04, 0.05, 0.10, 0.30])\n# 1) FWER methods control P(any false positive) — strict, fewer discoveries.\n#    holm is uniformly better than bonferroni; sidak is slightly tighter under independence.\nfor m in (\"bonferroni\", \"holm\", \"hommel\", \"sidak\"):\n    reject, p_adj, _, _ = multipletests(p_values, alpha=0.05, method=m)\n    print(f\"{m:>11}: rejects {reject.sum()}\")\n# 2) FDR methods control E(false / discoveries) — more power, occasional false positives expected.\n#    fdr_bh: assumes positive dependence (the safe default for genomic / NHST batteries)\n#    fdr_by: the conservative variant valid under arbitrary dependence\nfor m in (\"fdr_bh\", \"fdr_by\"):\n    reject, p_adj, _, _ = multipletests(p_values, alpha=0.05, method=m)\n    print(f\"{m:>11}: rejects {reject.sum()}\")\n# 3) When tests are highly correlated, Bonferroni is too conservative; permutation\n#    methods (e.g., Westfall-Young maxT) preserve the correlation structure and\n#    deliver much better power. statsmodels has multipletests but for correlated\n#    designs you typically run a permutation-based maxT yourself.\n# Decision rule:\n#   exploratory hypothesis generation       -> fdr_bh (FDR), q < 0.05 - 0.10\n#   confirmatory test, must avoid any FP    -> holm (FWER) — never bonferroni alone\n#   genomics / many correlated tests         -> fdr_by, OR permutation maxT\n#   pre-registered single primary test        -> NO correction; correct only the secondary tests\n#   garden of forking paths (decided after seeing data) -> the only fix is pre-registration\n#\n# Anti-pattern: running the full battery, then \"correcting only the significant ones\"\n#   That's not correction — that's selecting. Run the correction over EVERY p-value\n#   you computed, including the boring ones, or your alpha is meaningless."
                  }
        ],
        tips: [
                  "Bonferroni: use when controlling family-wise error rate; most conservative",
                  "Benjamini-Hochberg: use when controlling false discovery rate; more power",
                  "Always report number of tests conducted; supports reproducibility"
        ],
        mistake: "Running many tests without adjustment; leads to false positives.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },

  // ── Section 4: Regression & Modeling ─────────────────────────────────────────
  {
    id: "regression-stats-py",
    title: "Regression & Modeling",
    entries: [
      {
        id: "simple-linear-regression",
        fn: "scipy.stats.linregress",
        desc: "Simple linear regression with full statistical output.",
        category: "Linear Models",
        subtitle: "Fit line y = a + bx with p-values and CI",
        signature: "scipy.stats.linregress(x, y)",
        descLong: "Fits y = intercept + slope*x. Returns slope, intercept, r-value, p-value, std error. Fast and simple for 1 predictor with full inference.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of scipy.stats.linregress — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nx = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])\ny = np.array([2.1, 4.0, 6.2, 7.9, 10.0, 11.7, 13.9, 16.1, 17.8, 20.5])\nr = stats.linregress(x, y)\nprint(f\"slope={r.slope:.3f}  intercept={r.intercept:.3f}\")\nprint(f\"R^2={r.rvalue**2:.3f}  p={r.pvalue:.3g}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of scipy.stats.linregress — common patterns you'll see in production.\n# APPROACH  - Combine scipy.stats.linregress with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(0)\nx = np.linspace(0, 10, 30)\ny = 2.5 * x + rng.normal(0, 2, len(x))\nr = stats.linregress(x, y)\nprint(f\"slope={r.slope:.3f} (SE={r.stderr:.3f})  intercept={r.intercept:.3f}\")\nprint(f\"R^2={r.rvalue**2:.3f}  p={r.pvalue:.3g}\")\n# 95% CI for slope using the t-distribution\ndf = len(x) - 2\nt_crit = stats.t.ppf(0.975, df)\nprint(f\"slope 95% CI: ({r.slope - t_crit*r.stderr:.3f}, {r.slope + t_crit*r.stderr:.3f})\")\n# Residual sanity checks\ny_hat   = r.intercept + r.slope * x\nres     = y - y_hat\nprint(f\"residual mean: {res.mean():.3f} (should be ~0)\")\nprint(f\"Shapiro on residuals p: {stats.shapiro(res).pvalue:.3f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of scipy.stats.linregress — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nimport statsmodels.api as sm\nfrom scipy import stats\nrng = np.random.default_rng(0)\nx = np.linspace(0, 10, 50)\ny = 2.5 * x + rng.normal(0, 2, len(x))\ny[-1] = 50                                          # one influential outlier\n# 1) statsmodels gives a richer summary than scipy.linregress\nX     = sm.add_constant(x)\nmodel = sm.OLS(y, X).fit()\nprint(model.summary().tables[1])                    # coef table\n# 2) Diagnostics that catch most regression bugs\ninfl = model.get_influence()\nleverage = infl.hat_matrix_diag                     # > 2*p/n -> high leverage\ncooks_d  = infl.cooks_distance[0]                   # > 4/n -> influential point\nprint(f\"max leverage: {leverage.max():.3f}\")\nprint(f\"max Cook's D: {cooks_d.max():.3f}\")\n# Residual vs fitted homoscedasticity test (Breusch-Pagan)\nfrom statsmodels.stats.diagnostic import het_breuschpagan\nbp = het_breuschpagan(model.resid, X)\nprint(f\"Breusch-Pagan p: {bp[1]:.3f}    (small -> heteroscedastic)\")\n# 3) Robust regression — downweights outliers automatically\nrobust = sm.RLM(y, X, M=sm.robust.norms.HuberT()).fit()\nprint(f\"OLS    slope: {model.params[1]:.3f}\")\nprint(f\"Robust slope: {robust.params[1]:.3f}\")      # ~ true slope (2.5)\n# 4) Heteroscedasticity-consistent SEs (use when BP rejects)\nhc3_model = sm.OLS(y, X).fit(cov_type=\"HC3\")        # White / sandwich SEs\n# Decision rule:\n#   1 predictor, quick look                -> scipy.stats.linregress\n#   need full inference + diagnostics      -> statsmodels OLS\n#   outliers / heavy tails                  -> RLM (robust regression)\n#   heteroscedasticity (BP rejects)         -> OLS with cov_type=\"HC3\"\n#   correlated errors (time series)         -> GLS or Newey-West SEs\n#   nonlinear true relationship              -> add polynomial terms or use GAM\n#\n# Anti-pattern: reporting R^2 without checking residuals\n#   R^2 = 0.95 with a curved residual plot is hiding a model misspecification.\n#   ALWAYS plot residuals vs fitted; the plot tells you what R^2 cant."
                  }
        ],
        tips: [
                  "scipy.stats.linregress efficient for single predictor",
                  "R-squared measures goodness of fit; 0-1 scale",
                  "Check residual normality and homoscedasticity with plots"
        ],
        mistake: "Not checking assumptions (normality, homoscedasticity, independence).",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "multiple-regression",
        fn: "statsmodels.formula.api.ols",
        desc: "Multiple regression with formula interface and detailed summary.",
        category: "Linear Models",
        subtitle: "Fit y ~ x1 + x2 + ... with inference",
        signature: "statsmodels.formula.api.ols(\"y ~ x1 + x2\").fit()",
        descLong: "statsmodels provides R-like formula API. Returns comprehensive summary: coefficients, p-values, confidence intervals, model statistics (R², F-test, AIC).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of statsmodels.formula.api.ols — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport pandas as pd\nimport statsmodels.formula.api as smf\ndf = pd.DataFrame({\n    \"age\":        [25, 30, 35, 40, 45, 50, 55, 60],\n    \"experience\": [ 1,  3,  6,  9, 12, 18, 22, 28],\n    \"salary\":     [50, 60, 72, 85, 95, 115, 130, 150],\n})\nmodel = smf.ols(\"salary ~ age + experience\", data=df).fit()\nprint(model.summary().tables[1])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of statsmodels.formula.api.ols — common patterns you'll see in production.\n# APPROACH  - Combine statsmodels.formula.api.ols with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nimport pandas as pd\nimport statsmodels.formula.api as smf\nrng = np.random.default_rng(0)\nn = 200\ndf = pd.DataFrame({\n    \"age\":        rng.uniform(20, 60, n),\n    \"experience\": rng.uniform(0, 30, n),\n    \"dept\":       rng.choice([\"eng\", \"sales\", \"ops\"], n),\n})\ndf[\"salary\"] = (30 + 0.5*df[\"age\"] + 2.0*df[\"experience\"]\n                + (df[\"dept\"] == \"eng\") * 20.0\n                + rng.normal(0, 5, n))\n# 1) Categorical predictor — C() makes the dummy coding explicit\nm1 = smf.ols(\"salary ~ age + experience + C(dept)\", data=df).fit()\n# 2) Interaction — does the slope on experience differ across depts?\nm2 = smf.ols(\"salary ~ age + experience * C(dept)\", data=df).fit()\nprint(\"R^2:    \", m1.rsquared.round(3), \"vs\", m2.rsquared.round(3))\nprint(\"adjR^2: \", m1.rsquared_adj.round(3), \"vs\", m2.rsquared_adj.round(3))\nprint(\"AIC:    \", round(m1.aic, 1), \"vs\", round(m2.aic, 1))   # lower is better\n# 3) Predictions with CIs\nnew = pd.DataFrame({\"age\": [30, 40], \"experience\": [5, 15], \"dept\": [\"eng\", \"sales\"]})\npred = m2.get_prediction(new).summary_frame(alpha=0.05)\nprint(pred[[\"mean\", \"mean_ci_lower\", \"mean_ci_upper\"]])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of statsmodels.formula.api.ols — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nimport pandas as pd\nimport statsmodels.api as sm\nimport statsmodels.formula.api as smf\nfrom statsmodels.stats.outliers_influence import variance_inflation_factor\nrng = np.random.default_rng(0)\nn = 300\ndf = pd.DataFrame({\n    \"x1\": rng.normal(0, 1, n),\n    \"x2\": rng.normal(0, 1, n),\n})\ndf[\"x3\"] = df[\"x1\"] * 0.95 + rng.normal(0, 0.1, n)        # near-duplicate of x1\ndf[\"y\"]  = 2*df[\"x1\"] + 3*df[\"x2\"] + rng.normal(0, 1, n)\n# 1) Multicollinearity — VIF > 10 means the SE of that coef is hugely inflated\nX = sm.add_constant(df[[\"x1\", \"x2\", \"x3\"]])\nfor i, name in enumerate(X.columns):\n    print(f\"VIF[{name:>5}] = {variance_inflation_factor(X.values, i):.1f}\")\n# x1 and x3 will both have huge VIFs -> drop one or use ridge regression\n# 2) Robust covariance — heteroscedasticity-consistent (HC3) SEs\nmodel = smf.ols(\"y ~ x1 + x2\", data=df).fit(cov_type=\"HC3\")\nprint(model.summary().tables[1])\n# 3) Model selection by AIC — penalizes adding predictors\ndef aic_table(formulas, data):\n    rows = [(f, smf.ols(f, data=data).fit().aic) for f in formulas]\n    return pd.DataFrame(rows, columns=[\"formula\", \"AIC\"]).sort_values(\"AIC\")\nprint(aic_table([\n    \"y ~ x1\",\n    \"y ~ x1 + x2\",\n    \"y ~ x1 + x2 + x3\",\n    \"y ~ x1 * x2\",\n], df))\n# 4) Out-of-sample R^2 — the only number that matters for prediction claims\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LinearRegression\ncv = cross_val_score(LinearRegression(), df[[\"x1\",\"x2\"]], df[\"y\"], cv=5, scoring=\"r2\")\nprint(f\"CV R^2: mean={cv.mean():.3f}  std={cv.std():.3f}\")\n# Decision rule:\n#   inference focus (which coef matters)   -> statsmodels OLS, report CIs\n#   prediction focus                          -> sklearn + cross-val R^2 / MAE\n#   collinear predictors (VIF > 10)            -> drop one, OR Ridge / Lasso (sklearn)\n#   heteroscedasticity                          -> cov_type=\"HC3\" or \"HAC\" for time series\n#   nested model comparison                     -> ANOVA F-test (anova_lm) on the two fits\n#   non-nested model comparison                 -> AIC (or BIC if you prefer parsimony)\n#\n# Anti-pattern: comparing R^2 across models with different N\n#   Dropping rows for missing data shrinks N; R^2 is not comparable across\n#   different sample sizes. Filter the data ONCE, fit all candidates on the\n#   same sample, then compare."
                  }
        ],
        tips: [
                  "Use R-like formula syntax: \"y ~ x1 + x2\" or \"y ~ x1 + x2 + x1:x2\"",
                  "Adjusted R² penalizes additional predictors; use for model comparison",
                  "F-test overall model significance; t-tests individual coefficients"
        ],
        mistake: "Including correlated predictors (multicollinearity); check VIF.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "logistic-regression-stats",
        fn: "statsmodels.formula.api.logit",
        desc: "Logistic regression for binary classification with inference.",
        category: "Linear Models",
        subtitle: "Probabilistic binary outcome model",
        signature: "statsmodels.formula.api.logit(\"y ~ x1 + x2\").fit()",
        descLong: "Models P(y=1) using logistic function. Returns probabilities, coefficients as log-odds, odds ratios. Full inference: p-values, confidence intervals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of statsmodels.formula.api.logit — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport pandas as pd\nimport statsmodels.formula.api as smf\ndf = pd.DataFrame({\n    \"age\":       [25, 30, 35, 40, 45, 50, 55, 60, 65, 70],\n    \"purchased\": [0,  0,  0,  1,  0,  1,  1,  1,  1,  1],\n})\nmodel = smf.logit(\"purchased ~ age\", data=df).fit(disp=False)\nprint(model.summary().tables[1])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of statsmodels.formula.api.logit — common patterns you'll see in production.\n# APPROACH  - Combine statsmodels.formula.api.logit with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nimport pandas as pd\nimport statsmodels.formula.api as smf\nfrom scipy.special import expit\nrng = np.random.default_rng(0)\nn = 500\ndf = pd.DataFrame({\"age\":   rng.uniform(20, 70, n),\n                   \"score\": rng.uniform(0, 100, n)})\nprob = expit(-3 + 0.05*df[\"age\"] + 0.03*df[\"score\"])\ndf[\"purchased\"] = (rng.random(n) < prob).astype(int)\nmodel = smf.logit(\"purchased ~ age + score\", data=df).fit(disp=False)\nprint(model.summary().tables[1])\n# Odds ratio = exp(coef). \"A 1-unit increase in age multiplies the odds by...\"\nprint(\"odds ratios:\")\nprint(np.exp(model.params).round(3))\n# Predict probabilities for new rows\nnew = pd.DataFrame({\"age\": [30, 50, 65], \"score\": [40, 70, 90]})\nprobs = model.predict(new)\nprint(\"predicted P(purchase):\", probs.round(3).values)\n# Threshold to a class label — 0.5 is rarely optimal in production\nprint(\"predicted class:\", (probs > 0.5).astype(int).values)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of statsmodels.formula.api.logit — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nimport pandas as pd\nimport statsmodels.formula.api as smf\nfrom scipy.special import expit\nfrom sklearn.metrics import roc_auc_score, brier_score_loss\nfrom sklearn.calibration import calibration_curve\nrng = np.random.default_rng(0)\nn = 5000\ndf = pd.DataFrame({\n    \"x1\": rng.normal(0, 1, n),\n    \"x2\": rng.normal(0, 1, n),\n})\n# Severe imbalance — only ~5% positives\ndf[\"y\"] = (rng.random(n) < expit(-3 + 1.5*df[\"x1\"] + 0.5*df[\"x2\"])).astype(int)\nprint(\"base rate:\", df[\"y\"].mean().round(3))\n# 1) Logistic regression on imbalanced data still works for ESTIMATION (no class\n#    weighting needed for inference). It only matters for class predictions.\nmodel = smf.logit(\"y ~ x1 + x2\", data=df).fit(disp=False)\n# 2) AUC + Brier — never lean on accuracy when the base rate is far from 50%\np_hat = model.predict(df)\nprint(f\"AUC:   {roc_auc_score(df['y'], p_hat):.3f}\")\nprint(f\"Brier: {brier_score_loss(df['y'], p_hat):.3f}\")\n# 3) Calibration — are predicted 30% events actually happening 30% of the time?\nfp, mp = calibration_curve(df[\"y\"], p_hat, n_bins=10)\nprint(\"calibration (frac_pos vs mean_pred):\")\nfor f, m in zip(fp, mp):\n    print(f\"  {m:.2f} -> {f:.2f}\")\n# 4) Threshold by business cost, not 0.5\ndef best_threshold(y, p, fp_cost=1.0, fn_cost=5.0):\n    ts = np.linspace(0.01, 0.99, 99)\n    losses = [(t, (((p >= t) & (y == 0)).sum()) * fp_cost\n                 + (((p <  t) & (y == 1)).sum()) * fn_cost) for t in ts]\n    return min(losses, key=lambda x: x[1])\nprint(\"optimal threshold:\", best_threshold(df[\"y\"].values, p_hat.values))\n# 5) Quasi-separation diagnostic: huge coefs + huge SEs -> perfect predictor exists\n#    Fix: penalized logistic regression (sklearn LogisticRegression(penalty='l2'))\n#    or Firth's correction (statsmodels has it via 'penalty' in newer versions).\n# Decision rule:\n#   inference (which feature matters)         -> statsmodels logit, report CIs and ORs\n#   prediction (production scoring)             -> sklearn LogisticRegression with regularization\n#   class imbalance for INFERENCE                -> no weighting; check calibration\n#   class imbalance for CLASSIFICATION            -> tune threshold via business cost\n#   probabilities feed business decisions         -> calibrate with isotonic / Platt\n#   complete separation (huge coefs, infinite OR) -> regularize (L2) or Firth\n#\n# Anti-pattern: judging logistic regression by accuracy on imbalanced data\n#   95% accuracy with 5% base rate is reachable by predicting \"no\" for everyone.\n#   Use AUC or Brier; if you must report accuracy, also report base-rate baseline."
                  }
        ],
        tips: [
                  "Odds ratio > 1: higher x increases odds; < 1: decreases odds",
                  "Predicted values are probabilities [0, 1]; threshold at 0.5 for classification",
                  "Check goodness-of-fit with Hosmer-Lemeshow test"
        ],
        mistake: "Interpreting logistic coefficients as linear effects; use odds ratios.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "cross-validation",
        fn: "sklearn.model_selection.cross_val_score, StratifiedKFold",
        desc: "Cross-validation for robust model evaluation.",
        category: "Model Evaluation",
        subtitle: "Estimate generalization performance",
        signature: "cross_val_score(model, X, y, cv=5)",
        descLong: "Partition data into folds, fit/evaluate repeatedly. Provides multiple performance estimates and standard error. More robust than single train/test split.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sklearn.model_selection.cross_val_score, StratifiedKFold — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom sklearn.datasets import load_iris\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nX, y = load_iris(return_X_y=True)\nscores = cross_val_score(LogisticRegression(max_iter=200), X, y, cv=5)\nprint(f\"mean = {scores.mean():.3f}  std = {scores.std():.3f}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sklearn.model_selection.cross_val_score, StratifiedKFold — common patterns you'll see in production.\n# APPROACH  - Combine sklearn.model_selection.cross_val_score, StratifiedKFold with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom sklearn.datasets import load_iris\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_validate\nX, y = load_iris(return_X_y=True)\nclf = LogisticRegression(max_iter=200)\n# Stratified preserves the class ratio in every fold — mandatory for imbalanced data\nskf = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)\ncv = cross_validate(\n    clf, X, y, cv=skf,\n    scoring=[\"accuracy\", \"f1_macro\", \"roc_auc_ovr\"],\n    return_train_score=True,\n)\nfor k, v in cv.items():\n    if k.startswith(\"test_\"):\n        print(f\"{k:>20}: mean={v.mean():.3f}  std={v.std():.3f}\")\n# Train vs test gap reveals overfitting:\nprint(f\"train acc - test acc = {cv['train_accuracy'].mean() - cv['test_accuracy'].mean():.3f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sklearn.model_selection.cross_val_score, StratifiedKFold — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom sklearn.datasets import load_iris\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.model_selection import (\n    StratifiedKFold, GroupKFold, TimeSeriesSplit, GridSearchCV, cross_val_score,\n)\nX, y = load_iris(return_X_y=True)\n# 1) ALWAYS scale inside a Pipeline so each fold rescales independently.\n#    Fitting StandardScaler on all of X before CV leaks test stats into training.\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"clf\",   LogisticRegression(max_iter=500)),\n])\nscores = cross_val_score(pipe, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0))\nprint(f\"pipe CV: {scores.mean():.3f} ± {scores.std():.3f}\")\n# 2) Grouped data — multiple rows per patient/user/session\n#    Use GroupKFold so the same group never spans train AND test.\ngroups = np.repeat(np.arange(30), 5)              # imagined group IDs\ngkf    = GroupKFold(n_splits=5)\n# scores = cross_val_score(pipe, X, y, cv=gkf, groups=groups)\n# 3) Time series — never use random folds; the past must predict the future\ntscv = TimeSeriesSplit(n_splits=5)\n# for train_idx, test_idx in tscv.split(X): ...    # train < test in time\n# 4) Nested CV — the only honest way to report performance AFTER hyperparam search\ninner = StratifiedKFold(3, shuffle=True, random_state=0)\nouter = StratifiedKFold(5, shuffle=True, random_state=0)\ngs = GridSearchCV(pipe, {\"clf__C\": [0.1, 1.0, 10.0]}, cv=inner, scoring=\"accuracy\")\nnested = cross_val_score(gs, X, y, cv=outer)\nprint(f\"nested CV: {nested.mean():.3f} ± {nested.std():.3f}\")\n# Decision rule:\n#   classification, IID rows               -> StratifiedKFold (always shuffle, seed)\n#   regression, IID rows                    -> KFold(shuffle=True)\n#   multiple rows per subject/group         -> GroupKFold or LeaveOneGroupOut\n#   time series                              -> TimeSeriesSplit (no shuffle)\n#   tiny dataset (n < 100)                   -> RepeatedStratifiedKFold for stable estimate\n#   reporting performance after tuning        -> nested CV; otherwise youre lying about CV scores\n#\n# Anti-pattern: fitting scaler / imputer / encoder OUTSIDE the Pipeline before CV\n#   The fold's \"test\" data participated in fitting the preprocessor. CV scores\n#   come back optimistic; production performance disappoints. Always Pipeline."
                  }
        ],
        tips: [
                  "Use StratifiedKFold for classification to preserve class ratios",
                  "Larger k (e.g., 10) more reliable but slower; k=5 standard balance",
                  "Cross-validation gives better generalization estimate than single split"
        ],
        mistake: "Tuning hyperparameters before cross-validation; causes optimistic bias.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "bootstrap",
        fn: "numpy bootstrap resampling",
        desc: "Bootstrap resampling for inference without assumptions.",
        category: "Resampling",
        subtitle: "Sample with replacement for confidence intervals",
        signature: "np.random.choice(data, size=n, replace=True)",
        descLong: "Sample original data with replacement. Repeat many times, compute statistic each time. Distribution of bootstrap statistics approximates sampling distribution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of numpy bootstrap resampling — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\nrng  = np.random.default_rng(0)\ndata = np.array([2.3, 1.8, 2.1, 2.5, 1.9, 2.2, 2.0, 2.4])\nmeans = np.array([\n    rng.choice(data, size=len(data), replace=True).mean()    # MUST replace=True\n    for _ in range(10_000)\n])\nprint(f\"95% CI for mean: ({np.percentile(means, 2.5):.3f}, {np.percentile(means, 97.5):.3f})\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of numpy bootstrap resampling — common patterns you'll see in production.\n# APPROACH  - Combine numpy bootstrap resampling with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nfrom scipy import stats\nrng  = np.random.default_rng(0)\ndata = np.array([2.3, 1.8, 2.1, 2.5, 1.9, 2.2, 2.0, 2.4])\n# 1) Vectorized hand-rolled bootstrap — much faster than the loop above\nn, B = len(data), 10_000\nidx   = rng.integers(0, n, size=(B, n))\nmeans = data[idx].mean(axis=1)\nprint(f\"hand: 95% CI ({np.percentile(means, 2.5):.3f}, {np.percentile(means, 97.5):.3f})\")\n# 2) scipy.stats.bootstrap — does it for you, with multiple CI methods\nres = stats.bootstrap((data,), np.mean,\n                      confidence_level=0.95,\n                      n_resamples=10_000,\n                      method=\"BCa\",\n                      random_state=0)\nprint(f\"BCa: 95% CI {res.confidence_interval}\")\n# 3) Bootstrap works for ANY statistic — median, std, regression slope, ratio\ndef slope(x, y):\n    return np.polyfit(x, y, 1)[0]\nx = np.arange(20)\ny = 2 * x + rng.normal(0, 1, 20)\nres_slope = stats.bootstrap((x, y), slope, paired=True,\n                             confidence_level=0.95, n_resamples=5_000,\n                             random_state=0)\nprint(f\"slope 95% CI: {res_slope.confidence_interval}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of numpy bootstrap resampling — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(0)\n# 1) Three CI methods — pick BCa unless you have a reason not to\ndata = rng.lognormal(0, 1, 50)                    # skewed test case\nfor method in (\"percentile\", \"basic\", \"BCa\"):\n    ci = stats.bootstrap((data,), np.median,\n                         confidence_level=0.95, n_resamples=10_000,\n                         method=method, random_state=0).confidence_interval\n    print(f\"{method:>10}: ({ci.low:.3f}, {ci.high:.3f})\")\n# - percentile: simple but biased on skewed stats\n# - basic:      pivot — correct location but worse coverage\n# - BCa:        bias-corrected & accelerated; the right default for asymmetric stats\n# 2) Bootstrap is INVALID for: extremes (max, min), heavy-tail tail probabilities,\n#    statistics with infinite variance. Use EVT or parametric methods there.\n# 3) Time series / autocorrelated data — IID bootstrap underestimates SEs.\n#    Block bootstrap preserves serial structure.\ndef block_bootstrap_mean(x, block=10, B=2000, alpha=0.05, rng=rng):\n    n = len(x)\n    n_blocks = n // block\n    means = np.empty(B)\n    for i in range(B):\n        starts   = rng.integers(0, n - block + 1, size=n_blocks)\n        sample   = np.concatenate([x[s:s+block] for s in starts])\n        means[i] = sample.mean()\n    return np.quantile(means, [alpha/2, 1 - alpha/2])\nts = np.cumsum(rng.normal(0, 1, 200))             # autocorrelated series\nprint(\"block boot CI:\", block_bootstrap_mean(ts, block=20))\n# Decision rule:\n#   any IID statistic, want a CI            -> stats.bootstrap, method='BCa'\n#   tiny n with skew                         -> bootstrap is essential; n_resamples >= 10_000\n#   regression slope CI / model statistic   -> bootstrap rows (paired=True)\n#   time series                               -> block bootstrap, block ~ sqrt(n)\n#   stratified design                          -> resample WITHIN strata\n#   need a permutation test instead           -> stats.permutation_test (different goal)\n#\n# Anti-pattern: bootstrap on the maximum\n#   The bootstrap distribution of max(X) is biased — a resample can never exceed\n#   the original max. Use extreme-value theory (gumbel / GEV) for tail behavior."
                  }
        ],
        tips: [
                  "Replace=True essential for bootstrap; with replacement differs from original",
                  "Number of bootstrap samples 10000 typical; more for smoother estimates",
                  "Works for any statistic; very flexible, no distributional assumptions"
        ],
        mistake: "Sampling without replacement; violates bootstrap principle.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    result.append(x * 2)",
          concise: "result = [x * 2 for x in items]",
        },
      },
      {
        id: "effect-size",
        fn: "Cohen's d, eta-squared",
        desc: "Calculate effect sizes (Cohen's d, eta-squared, omega-squared).",
        category: "Effect Sizes",
        subtitle: "Practical significance vs. statistical significance",
        signature: "d = (m1 - m2) / pooled_std, eta² = ss_between / ss_total",
        descLong: "Effect sizes quantify magnitude of differences independent of sample size. Essential complement to p-values. Cohen's d for means, eta² for ANOVA.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Cohen's d, eta-squared — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport numpy as np\na = np.array([10, 12, 11, 13, 12, 11])\nb = np.array([15, 17, 16, 18, 17, 16])\nm1, m2 = a.mean(), b.mean()\ns1, s2 = a.std(ddof=1), b.std(ddof=1)\nn1, n2 = len(a), len(b)\nsp = np.sqrt(((n1-1)*s1**2 + (n2-1)*s2**2) / (n1 + n2 - 2))   # pooled sd\nd  = (m2 - m1) / sp\nprint(f\"Cohen's d = {d:.2f}    (0.2 small / 0.5 medium / 0.8 large)\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Cohen's d, eta-squared — common patterns you'll see in production.\n# APPROACH  - Combine Cohen's d, eta-squared with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\n# 1) Cohens d / Hedges g (correction for small n)\ndef cohens_d(x, y):\n    nx, ny = len(x), len(y)\n    sp = np.sqrt(((nx-1)*x.var(ddof=1) + (ny-1)*y.var(ddof=1)) / (nx + ny - 2))\n    return (x.mean() - y.mean()) / sp\ndef hedges_g(x, y):\n    d = cohens_d(x, y)\n    n = len(x) + len(y)\n    correction = 1 - 3 / (4*n - 9)               # Hedges' bias correction\n    return d * correction\na = np.array([10, 12, 11, 13, 12, 11])\nb = np.array([15, 17, 16, 18, 17, 16])\nprint(f\"d = {cohens_d(a, b):.2f}, g = {hedges_g(a, b):.2f}\")\n# 2) eta^2 — ANOVA effect size (variance explained by group)\ngroups = [a, b, np.array([20, 22, 21, 23, 22, 21])]\nall_x  = np.concatenate(groups)\ngm     = all_x.mean()\nss_between = sum(len(g) * (g.mean() - gm)**2 for g in groups)\nss_total   = ((all_x - gm)**2).sum()\nprint(f\"eta^2 = {ss_between/ss_total:.3f}    (0.01 small / 0.06 medium / 0.14 large)\")\n# 3) Correlation r is itself an effect size\nx = np.arange(20); y = 2*x + np.random.default_rng(0).normal(0, 1, 20)\nr = np.corrcoef(x, y)[0, 1]\nprint(f\"r = {r:+.3f}    r^2 = {r**2:.3f} (variance explained)\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Cohen's d, eta-squared — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(0)\n# 1) Bootstrap CI on Cohens d — the value people forget to attach\ndef cohens_d_arr(x, y):\n    nx, ny = len(x), len(y)\n    sp = np.sqrt(((nx-1)*x.var(ddof=1) + (ny-1)*y.var(ddof=1)) / (nx + ny - 2))\n    return (x.mean() - y.mean()) / sp\na = rng.normal(0, 1, 50); b = rng.normal(0.4, 1, 50)\nres = stats.bootstrap((a, b), cohens_d_arr,\n                      vectorized=False, paired=False,\n                      confidence_level=0.95, n_resamples=10_000,\n                      method=\"BCa\", random_state=0)\nprint(f\"d = {cohens_d_arr(a, b):.2f}, 95% CI = ({res.confidence_interval.low:.2f}, \"\n      f\"{res.confidence_interval.high:.2f})\")\n# 2) Omega^2 — less biased ANOVA effect size; unbiased even at small n\ndef omega_squared(*groups):\n    all_x   = np.concatenate(groups)\n    gm      = all_x.mean()\n    ss_b    = sum(len(g) * (g.mean() - gm)**2 for g in groups)\n    ss_w    = sum(((g - g.mean())**2).sum() for g in groups)\n    df_b    = len(groups) - 1\n    df_w    = len(all_x) - len(groups)\n    ms_w    = ss_w / df_w\n    ss_t    = ss_b + ss_w\n    return (ss_b - df_b * ms_w) / (ss_t + ms_w)\n# 3) Effect-size by design — pick the right metric\n#    Means difference        -> Cohens d / Hedges g\n#    ANOVA / 3+ groups        -> eta^2 (basic) or omega^2 (less biased)\n#    Correlation               -> r (or r^2 for variance explained)\n#    2x2 chi^2 / contingency  -> phi (= Cramers V for 2x2)\n#    r x c chi^2                -> Cramers V\n#    odds (logistic, 2x2)      -> odds ratio (with CI from sm logit)\n#    rank-based / Mann-Whitney -> rank-biserial r\n#\n# Decision rule:\n#   reporting any p-value            -> ALSO report effect size + 95% CI\n#   small n (n < 30 per group)       -> Hedges g, not Cohens d (less biased)\n#   ANOVA with unequal n               -> omega^2; eta^2 inflates with imbalance\n#   noisy / heavy-tailed                 -> rank-based effect sizes (rank-biserial)\n#\n# Anti-pattern: declaring an effect \"large\" via the d=0.8 threshold without context\n#   Cohens labels are field-relative. In medical trials d=0.2 can be lifesaving;\n#   in physics d=2 might be a noise-level discrepancy. Always interpret in domain."
                  }
        ],
        tips: [
                  "Always report effect sizes alongside p-values",
                  "Effect size interpretation context-dependent; consider domain importance",
                  "Eta² and omega² both used; omega² less biased with unequal group sizes"
        ],
        mistake: "Reporting only p-values without effect sizes; hides practical significance.",
        shorthand: {
          verbose: "import numpy as np\nfrom scipy import stats\ngroup1 = np.array([10, 12, 11, 13, 12, 11])\ngroup2 = np.array([15, 17, 16, 18, 17, 16])",
          concise: "print(f'  r-squared: {r_squared:.4f} (% variance explained)')",
        },
      },
      {
        id: "power-analysis",
        fn: "statsmodels.stats.power functions",
        desc: "Statistical power and sample size calculations.",
        category: "Study Design",
        subtitle: "Plan sample size to detect effects",
        signature: "statsmodels.stats.power.tt_solve_power(), tt_ind_solve_power()",
        descLong: "Power: probability of detecting true effect. Use to plan studies: given effect size and power, calculate required sample size.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of statsmodels.stats.power functions — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom statsmodels.stats.power import tt_ind_solve_power\n# Given d=0.5, alpha=0.05, what power do we have at n=30 per group?\npower = tt_ind_solve_power(effect_size=0.5, nobs1=30, alpha=0.05, ratio=1.0)\nprint(f\"power at n=30/group: {power:.2f}\")\n# What n do we need for 80% power at d=0.5?\nn = tt_ind_solve_power(effect_size=0.5, alpha=0.05, power=0.80, ratio=1.0)\nprint(f\"need n = {n:.0f} per group for 80% power\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of statsmodels.stats.power functions — common patterns you'll see in production.\n# APPROACH  - Combine statsmodels.stats.power functions with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom statsmodels.stats.power import (\n    tt_ind_solve_power, FTestAnovaPower,\n    NormalIndPower,                                # for proportions via normal approx\n)\n# 1) Two independent groups, t-test (effect = Cohens d)\nn_t = tt_ind_solve_power(effect_size=0.3, alpha=0.05, power=0.80, ratio=1.0)\nprint(f\"t-test  n/group for d=0.3, power=0.80: {n_t:.0f}\")\n# 2) One-way ANOVA (effect = Cohens f, k groups)\nanova = FTestAnovaPower()\nn_a = anova.solve_power(effect_size=0.25, k_groups=3, alpha=0.05, power=0.80)\nprint(f\"ANOVA   n/group for f=0.25, k=3, power=0.80: {n_a:.0f}\")\n# 3) Two-proportion test — convert to effect size 'h' first (Cohen's h)\nimport numpy as np\ndef h_from_props(p1, p2):\n    return 2 * np.arcsin(np.sqrt(p1)) - 2 * np.arcsin(np.sqrt(p2))\nh = h_from_props(0.10, 0.15)                     # 10% vs 15% conversion rate\nn_p = NormalIndPower().solve_power(effect_size=abs(h), alpha=0.05, power=0.80)\nprint(f\"prop    n/group for 10% vs 15%, power=0.80: {n_p:.0f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of statsmodels.stats.power functions — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nimport pandas as pd\nfrom scipy import stats\nfrom statsmodels.stats.power import tt_ind_solve_power\n# 1) Sensitivity curve — required n vs effect size, fixed alpha and power\nds = np.linspace(0.1, 1.0, 19)\nns = [tt_ind_solve_power(effect_size=d, alpha=0.05, power=0.80) for d in ds]\nprint(pd.DataFrame({\"d\": ds.round(2), \"n_per_group\": np.round(ns).astype(int)}).head())\n# 2) Minimum Detectable Effect (MDE) — given fixed n, what d can we detect with 80% power?\ndef mde(n, alpha=0.05, power=0.80):\n    return tt_ind_solve_power(effect_size=None, nobs1=n, alpha=alpha, power=power)\nprint(f\"MDE for n=50/group: d = {mde(50):.2f}\")\n# 3) Simulation-based power — when no closed form (e.g. nonparametric, mixed models)\ndef sim_power_rank(d, n, alpha=0.05, reps=2000, rng=np.random.default_rng(0)):\n    hits = 0\n    for _ in range(reps):\n        a = rng.normal(0, 1, n)\n        b = rng.normal(d, 1, n)\n        if stats.mannwhitneyu(a, b).pvalue < alpha:\n            hits += 1\n    return hits / reps\nprint(f\"Mann-Whitney power, d=0.5, n=30: {sim_power_rank(0.5, 30):.2f}\")\n# 4) The four-quadrant trade — fix THREE, solve for the FOURTH\n#    (effect, n, alpha, power). Pre-register which two you fix.\n# Decision rule:\n#   prospective study planning           -> solve for n given (effect, alpha, power)\n#   post-hoc on a small study             -> compute MDE; \"we could only detect d > X\"\n#   nonparametric or mixed-effects        -> simulation power, not closed-form formulas\n#   pilot study to estimate effect         -> use the LOWER bound of the d CI for planning\n#   multi-arm trial                         -> ANOVA power; then plan post-hoc Tukey power separately\n#\n# Anti-pattern: post-hoc \"observed power\" reported alongside p > 0.05\n#   Observed power is a deterministic function of the p-value — it adds no\n#   information (\"we didn't reject, so we had low power\" is a tautology). Report\n#   the MDE the study could have detected instead."
                  }
        ],
        tips: [
                  "Higher power (0.80+) preferred; trade-off with sample size and cost",
                  "Power depends on effect size, sample size, alpha, and alternative hypothesis",
                  "Small studies underpowered; may miss real effects (Type II error)"
        ],
        mistake: "Planning sample size without power analysis; risks underpowered studies.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "descriptive-stats-full",
        fn: "pandas.describe(), groupby stats",
        desc: "Comprehensive descriptive statistics with pandas groupby.",
        category: "Data Summaries",
        subtitle: "Full summary statistics by group",
        signature: "df.describe(), df.groupby().agg()",
        descLong: "pandas describe() provides count, mean, std, min, quartiles, max. groupby enables statistics by group. agg() applies multiple functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pandas.describe(), groupby stats — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport pandas as pd\ndf = pd.DataFrame({\n    \"group\":  list(\"AAABBBCCC\"),\n    \"age\":    [25, 30, 35, 28, 33, 40, 45, 50, 55],\n    \"income\": [40, 50, 55, 45, 60, 70, 80, 90, 100],\n})\nprint(df.describe())                                  # numeric columns only\nprint(df.groupby(\"group\")[[\"age\", \"income\"]].describe())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pandas.describe(), groupby stats — common patterns you'll see in production.\n# APPROACH  - Combine pandas.describe(), groupby stats with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport numpy as np\nimport pandas as pd\nrng = np.random.default_rng(0)\ndf = pd.DataFrame({\n    \"group\":  rng.choice(list(\"ABC\"), 200),\n    \"age\":    rng.normal(35, 10, 200),\n    \"income\": rng.normal(60_000, 15_000, 200),\n})\n# Named aggregations -> flat columns, easy to merge / plot afterwards\nsummary = df.groupby(\"group\", observed=True).agg(\n    n          =(\"age\",    \"size\"),\n    age_mean   =(\"age\",    \"mean\"),\n    age_std    =(\"age\",    \"std\"),\n    inc_median =(\"income\", \"median\"),\n    inc_iqr    =(\"income\", lambda s: s.quantile(0.75) - s.quantile(0.25)),\n)\nprint(summary)\n# Quantiles per group (long form)\nprint(df.groupby(\"group\", observed=True)\n        [[\"age\", \"income\"]]\n        .quantile([0.25, 0.5, 0.75])\n        .unstack(level=-1))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pandas.describe(), groupby stats — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport numpy as np\nimport pandas as pd\nfrom scipy import stats\nrng = np.random.default_rng(0)\ndf = pd.DataFrame({\n    \"group\":  rng.choice(list(\"ABC\"), 500),\n    \"age\":    rng.normal(35, 10, 500),\n    \"income\": rng.lognormal(11, 0.4, 500),                        # right-skewed\n})\ndf.loc[df.sample(50, random_state=0).index, \"income\"] = np.nan    # 10% missing\n# 1) Always count non-null vs total — describe() hides which columns have missing data\nprint(df.agg([\"count\", \"size\", lambda s: s.isna().sum()])\n        .rename(index={\"<lambda>\": \"n_missing\"}))\n# 2) Robust spread that survives outliers\ndef robust_summary(s):\n    s = s.dropna()\n    return pd.Series({\n        \"n\":      len(s),\n        \"median\": s.median(),\n        \"iqr\":    s.quantile(0.75) - s.quantile(0.25),\n        \"mad\":    stats.median_abs_deviation(s, scale=\"normal\"),\n    })\nprint(df.groupby(\"group\", observed=True)[\"income\"].apply(robust_summary).unstack())\n# 3) Leakage-safe rolling stats for time-series-style data — closed='left' or shift(1)\nts = df.assign(t=range(len(df))).sort_values(\"t\")\nts[\"income_rolling_mean_lag\"] = (ts[\"income\"]\n                                   .shift(1)                       # don't include current row\n                                   .rolling(20, min_periods=5)\n                                   .mean())\n# 4) Schema check before any analysis — catches dtype regressions cheaply\nexpected = {\"group\": \"object\", \"age\": \"float64\", \"income\": \"float64\"}\ngot      = {c: str(t) for c, t in df.dtypes.items()}\nassert got == expected, (got, expected)\n# Decision rule:\n#   quick EDA                              -> df.describe() + groupby().describe()\n#   structured report / dashboard           -> named aggregations into a flat frame\n#   skewed / heavy-tailed columns           -> median + IQR + MAD, not mean + std\n#   missing-data audit                       -> count vs size; never trust mean if count drops\n#   time-series-like rolling stats           -> shift(1) or closed='left' to prevent leakage\n#   categorical groupby                      -> observed=True (ignore unused categories)\n#\n# Anti-pattern: reporting df.mean() and df.std() on long-tailed financial data\n#   Means and SDs lie about typical values when the distribution is skewed.\n#   Report median + IQR (or MAD) for income, prices, sizes, latencies — anything\n#   that cant go negative and has a long tail."
                  }
        ],
        tips: [
                  "describe() includes count (non-null), so reveals missing values",
                  "groupby().agg() flexible; pass dict for group-specific aggregations",
                  "Use lambda functions for custom aggregations not in standard library"
        ],
        mistake: "Not checking data types before aggregation; cast properly first.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },
]

export default { meta, sections }
