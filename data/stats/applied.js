export const meta = {
  "id": "stats-applied",
  "label": "Applied Statistics",
  "icon": "📊",
  "description": "Practical applied statistics: missing data, resampling, survey methods, spatial stats, and reporting."
}

export const sections = [

  // ── Section 1: Missing Data & Imputation ─────────────────────────────────────────
  {
    id: "missing-data",
    title: "Missing Data & Imputation",
    entries: [
      {
        id: "missing-mechanisms",
        fn: "Missing Data Mechanisms (MCAR, MAR, MNAR)",
        desc: "Classify why data is missing — the mechanism determines which imputation or analysis method is valid.",
        category: "Missing Data",
        subtitle: "MCAR, MAR, MNAR patterns and diagnostics",
        signature: "MCAR: P(missing) independent of data  |  MAR: P(missing|observed)  |  MNAR: P(missing|unobserved)",
        descLong: "Missing Completely At Random (MCAR): missingness is unrelated to any variable — safe to use complete-case analysis. Missing At Random (MAR): missingness depends on observed variables — multiple imputation works. Missing Not At Random (MNAR): missingness depends on the missing value itself — requires modeling the missing mechanism. Little's MCAR test helps diagnose; but distinguishing MAR from MNAR requires domain knowledge.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Missing Data Mechanisms (MCAR, MAR, MNAR) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# Missing data patterns and diagnostics\nimport pandas as pd\nimport numpy as np\nfrom scipy import stats\n# Visualize missing patterns\nimport missingno as msno\nmsno.matrix(df)          # visual pattern\nmsno.heatmap(df)         # correlation of missingness\nmsno.dendrogram(df)      # clustering of missingness\n# Little's MCAR test (approximate)\n# If significant, data is NOT MCAR\nfrom sklearn.impute import SimpleImputer"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Missing Data Mechanisms (MCAR, MAR, MNAR) — common patterns you'll see in production.\n# APPROACH  - Combine Missing Data Mechanisms (MCAR, MAR, MNAR) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Check: is missingness in Y related to observed X?\nmissing_mask = df['income'].isna()\nt_stat, p_value = stats.ttest_ind(\n    df.loc[~missing_mask, 'age'],\n    df.loc[missing_mask, 'age']\n)\nprint(f\"Age differs by income-missingness: p={p_value:.4f}\")\n# If p < 0.05, missingness in income is related to age → likely MAR\n# Proportion of missing data\nmissing_pct = df.isnull().mean() * 100\nprint(missing_pct.sort_values(ascending=False))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Missing Data Mechanisms (MCAR, MAR, MNAR) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Example diagnosis:\n# MCAR: sensor randomly drops readings (no pattern)\n# MAR: wealthy people less likely to report income (predicted by education)\n# MNAR: depressed patients more likely to drop out (predicted by depression itself)"
                  }
        ],
        tips: [
                  "MCAR is testable (Little's test); distinguishing MAR from MNAR requires domain knowledge, not statistics alone.",
                  "If <5% of data is missing and MCAR, complete-case analysis (listwise deletion) is usually fine.",
                  "Visualize missing patterns first — msno.matrix() reveals if missingness clusters in certain rows/columns.",
                  "Document your missing data assumptions — reviewers will ask why you chose your imputation method."
        ],
        mistake: "Assuming data is MCAR without testing — if it's MAR or MNAR, complete-case analysis gives biased estimates. Always diagnose the mechanism before choosing a strategy.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "multiple-imputation",
        fn: "Multiple Imputation (MICE)",
        desc: "Fill missing values with plausible estimates — multiple times — then pool results to preserve uncertainty.",
        category: "Missing Data",
        subtitle: "MICE algorithm, pooling rules, diagnostic checks",
        signature: "mice(data, m=5)  |  pool(fit)  |  Rubin's rules",
        descLong: "Multiple Imputation by Chained Equations (MICE) creates m complete datasets, each with different plausible imputed values. Analyze each dataset separately, then pool results using Rubin's rules (which correctly inflate standard errors to reflect imputation uncertainty). MICE handles mixed variable types and preserves relationships between variables. Standard: m=5-20 imputations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Multiple Imputation (MICE) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# Python: multiple imputation with IterativeImputer\nimport pandas as pd\nimport numpy as np\nfrom sklearn.experimental import enable_iterative_imputer\nfrom sklearn.impute import IterativeImputer\n# MICE-style imputation\nimputer = IterativeImputer(\n    max_iter=10,\n    random_state=42,\n    sample_posterior=True  # for multiple imputations\n)\n# Create m=5 imputed datasets\nm = 5\nimputed_datasets = []\nfor i in range(m):\n    imp = IterativeImputer(max_iter=10, random_state=i, sample_posterior=True)\n    imputed = imp.fit_transform(df_numeric)\n    imputed_datasets.append(pd.DataFrame(imputed, columns=df_numeric.columns))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Multiple Imputation (MICE) — common patterns you'll see in production.\n# APPROACH  - Combine Multiple Imputation (MICE) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Analyze each and pool (Rubin's rules)\nfrom scipy import stats as st\ncoefficients = []\nvariances = []\nfor imp_df in imputed_datasets:\n    # Fit model on each imputed dataset\n    result = st.linregress(imp_df['x'], imp_df['y'])\n    coefficients.append(result.slope)\n    variances.append(result.stderr ** 2)\n# Rubin's pooling rules\nQ_bar = np.mean(coefficients)           # pooled estimate\nU_bar = np.mean(variances)              # within-imputation variance\nB = np.var(coefficients, ddof=1)        # between-imputation variance\nT = U_bar + (1 + 1/m) * B              # total variance\npooled_se = np.sqrt(T)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Multiple Imputation (MICE) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprint(f\"Pooled estimate: {Q_bar:.4f} ± {pooled_se:.4f}\")\n# R equivalent:\n# library(mice)\n# imp <- mice(data, m = 5, method = 'pmm')\n# fit <- with(imp, lm(y ~ x1 + x2))\n# pooled <- pool(fit)\n# summary(pooled)"
                  }
        ],
        tips: [
                  "m=5 imputations is usually sufficient; m=20-50 for higher missing rates (>30%).",
                  "MICE preserves relationships between variables — unlike single imputation which underestimates variance.",
                  "Always check convergence: plot imputed values across iterations to ensure they stabilize.",
                  "Use predictive mean matching (PMM) for continuous variables — it only imputes observed values, preserving distributions."
        ],
        mistake: "Using mean imputation (filling with column mean) — it shrinks variance, weakens correlations, and gives artificially narrow confidence intervals. Use MICE for valid inference.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },

  // ── Section 2: Resampling Methods ─────────────────────────────────────────
  {
    id: "resampling",
    title: "Resampling Methods",
    entries: [
      {
        id: "permutation-tests",
        fn: "Permutation Tests",
        desc: "Distribution-free hypothesis testing — shuffle labels to build the null distribution from the data itself.",
        category: "Resampling",
        subtitle: "Exact tests without distributional assumptions",
        signature: "Randomly shuffle group labels → compute test statistic → repeat → p-value = fraction ≥ observed",
        descLong: "Permutation tests compute the test statistic for every possible (or many random) relabeling of the data. The p-value is the fraction of permuted statistics as extreme as the observed one. No distributional assumptions needed — works for any test statistic (means, medians, correlations, custom metrics). Exact for small samples; Monte Carlo approximation for large.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Permutation Tests — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\n# Observed data\ngroup_a = np.array([23, 25, 28, 30, 35])\ngroup_b = np.array([18, 20, 22, 24, 27])\nobserved_diff = np.mean(group_a) - np.mean(group_b)  # 6.0\n# Permutation test\nn_permutations = 10000\ncombined = np.concatenate([group_a, group_b])\nn_a = len(group_a)\ncount_extreme = 0\nrng = np.random.default_rng(42)\nperm_diffs = np.empty(n_permutations)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Permutation Tests — common patterns you'll see in production.\n# APPROACH  - Combine Permutation Tests with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfor i in range(n_permutations):\n    shuffled = rng.permutation(combined)\n    perm_diff = np.mean(shuffled[:n_a]) - np.mean(shuffled[n_a:])\n    perm_diffs[i] = perm_diff\n# Two-sided p-value\np_value = np.mean(np.abs(perm_diffs) >= abs(observed_diff))\nprint(f\"Observed diff: {observed_diff:.2f}, p-value: {p_value:.4f}\")\n# Permutation test for correlation\nx = np.array([1, 2, 3, 4, 5, 6, 7, 8])\ny = np.array([2, 3, 5, 4, 7, 8, 6, 9])\nobserved_r = np.corrcoef(x, y)[0, 1]\nperm_rs = np.array([\n    np.corrcoef(x, rng.permutation(y))[0, 1]\n    for _ in range(10000)\n])\np_corr = np.mean(np.abs(perm_rs) >= abs(observed_r))\nprint(f\"Observed r: {observed_r:.3f}, p-value: {p_corr:.4f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Permutation Tests — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# scipy shortcut\nresult = stats.permutation_test(\n    (group_a, group_b),\n    lambda a, b, axis: np.mean(a, axis=axis) - np.mean(b, axis=axis),\n    n_resamples=9999\n)\nprint(f\"scipy p-value: {result.pvalue:.4f}\")"
                  }
        ],
        tips: [
                  "Permutation tests are exact for the observed data — no assumptions about population distributions.",
                  "Use 10,000+ permutations for stable p-values; for publication-quality: 100,000+.",
                  "Works with ANY test statistic — median difference, ratio, custom metric, not just means.",
                  "For small samples (n<20), permutation tests are often more powerful than parametric alternatives."
        ],
        mistake: "Using too few permutations (e.g., 100) — the p-value resolution is only 1/N_permutations. With 100 permutations, you can't distinguish p=0.01 from p=0.02.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "bootstrap-ci",
        fn: "Bootstrap Confidence Intervals",
        desc: "Estimate confidence intervals for any statistic by resampling with replacement — no formula needed.",
        category: "Resampling",
        subtitle: "Percentile, BCa, and bias-corrected bootstrap CIs",
        signature: "Resample with replacement → compute statistic → repeat → use percentiles for CI",
        descLong: "Bootstrap resamples the data with replacement to build an empirical sampling distribution of any statistic. Percentile CI: use 2.5th and 97.5th percentiles. BCa (Bias-Corrected and Accelerated): adjusts for bias and skewness — more accurate for small samples. Works for medians, ratios, regression coefficients, or any custom statistic without deriving a formula.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Bootstrap Confidence Intervals — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\ndata = np.array([12, 15, 14, 18, 22, 13, 16, 19, 21, 17])\nn = len(data)\nn_bootstrap = 10000\nrng = np.random.default_rng(42)\n# Bootstrap the median\nboot_medians = np.array([\n    np.median(rng.choice(data, size=n, replace=True))\n    for _ in range(n_bootstrap)\n])\n# Percentile CI\nci_lower = np.percentile(boot_medians, 2.5)\nci_upper = np.percentile(boot_medians, 97.5)\nprint(f\"Median: {np.median(data):.1f}, 95% CI: [{ci_lower:.1f}, {ci_upper:.1f}]\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Bootstrap Confidence Intervals — common patterns you'll see in production.\n# APPROACH  - Combine Bootstrap Confidence Intervals with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Bootstrap SE\nboot_se = np.std(boot_medians, ddof=1)\nprint(f\"Bootstrap SE: {boot_se:.3f}\")\n# scipy.stats.bootstrap (modern approach)\nresult = stats.bootstrap(\n    (data,),\n    np.median,\n    n_resamples=9999,\n    confidence_level=0.95,\n    method='BCa'   # bias-corrected and accelerated\n)\nprint(f\"BCa 95% CI: [{result.confidence_interval.low:.1f}, \"\n      f\"{result.confidence_interval.high:.1f}]\")\n# Bootstrap for difference in means\ngroup_a = np.array([23, 25, 28, 30, 35])\ngroup_b = np.array([18, 20, 22, 24, 27])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Bootstrap Confidence Intervals — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nboot_diffs = np.array([\n    np.mean(rng.choice(group_a, len(group_a), replace=True)) -\n    np.mean(rng.choice(group_b, len(group_b), replace=True))\n    for _ in range(10000)\n])\nci = np.percentile(boot_diffs, [2.5, 97.5])\nprint(f\"Diff in means 95% CI: [{ci[0]:.2f}, {ci[1]:.2f}]\")\n# If CI doesn't include 0 → significant difference"
                  }
        ],
        tips: [
                  "BCa method is preferred over percentile — it corrects for bias and skewness in the bootstrap distribution.",
                  "If the bootstrap CI doesn't include 0 (for a difference), it's equivalent to rejecting H₀ at that α.",
                  "Bootstrap works for ANY statistic (median, trimmed mean, ratio, R²) — no formula derivation needed.",
                  "Use n_bootstrap ≥ 10,000 for CIs; the cost is compute time, and it's cheap for most statistics."
        ],
        mistake: "Bootstrapping with too small a sample (n<10) — the bootstrap assumes the sample approximates the population. With very small n, the bootstrap distribution is unstable.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },

  // ── Section 3: Reporting & Best Practices ─────────────────────────────────────────
  {
    id: "reporting-practice",
    title: "Reporting & Best Practices",
    entries: [
      {
        id: "effect-size-reporting",
        fn: "Effect Size Reporting & Interpretation",
        desc: "Report practical significance, not just p-values — Cohen's d, r², odds ratios, and NNT.",
        category: "Reporting",
        subtitle: "Cohen's d, η², r², OR, NNT, benchmarks",
        signature: "d = (M₁ - M₂) / Sₚ  |  η² = SS_between / SS_total  |  NNT = 1 / ARR",
        descLong: "P-values tell you IF an effect exists; effect sizes tell you HOW BIG it is. Cohen's d: standardized mean difference (0.2=small, 0.5=medium, 0.8=large). η² (eta-squared): proportion of variance explained in ANOVA. Odds ratio: how much more likely an outcome is in one group. NNT (Number Needed to Treat): how many patients must be treated for one to benefit. Always report effect sizes with confidence intervals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Effect Size Reporting & Interpretation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\n# Cohen's d (independent samples)\ndef cohens_d(group1, group2):\n    n1, n2 = len(group1), len(group2)\n    var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)\n    pooled_std = np.sqrt(((n1-1)*var1 + (n2-1)*var2) / (n1+n2-2))\n    return (np.mean(group1) - np.mean(group2)) / pooled_std\ntreatment = np.array([85, 90, 78, 92, 88, 95, 82, 91])\ncontrol   = np.array([72, 80, 68, 75, 77, 82, 70, 74])\nd = cohens_d(treatment, control)\nprint(f\"Cohen's d = {d:.3f}\")  # e.g., 1.5 = very large effect\n# Interpretation:\n# |d| = 0.2: small    (barely noticeable)\n# |d| = 0.5: medium   (noticeable)\n# |d| = 0.8: large    (obvious)\n# |d| > 1.2: very large"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Effect Size Reporting & Interpretation — common patterns you'll see in production.\n# APPROACH  - Combine Effect Size Reporting & Interpretation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Eta-squared for ANOVA\nf_stat, p_val = stats.f_oneway(group_a, group_b, group_c)\n# η² = SS_between / SS_total\nk = 3  # number of groups\nN = len(group_a) + len(group_b) + len(group_c)\neta_sq = (f_stat * (k - 1)) / (f_stat * (k - 1) + (N - k))\nprint(f\"η² = {eta_sq:.3f}\")\n# 0.01 = small, 0.06 = medium, 0.14 = large\n# Odds ratio\n# Treatment: 30/100 success, Control: 15/100 success\na, b, c, d_ct = 30, 70, 15, 85\nodds_ratio = (a * d_ct) / (b * c)\nprint(f\"OR = {odds_ratio:.2f}\")  # > 1 means treatment is better\n# Number Needed to Treat (NNT)\nrisk_treatment = 30 / 100\nrisk_control = 15 / 100\nARR = risk_treatment - risk_control  # absolute risk reduction\nNNT = 1 / ARR\nprint(f\"NNT = {NNT:.1f}\")  # treat 6.7 patients for 1 extra success"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Effect Size Reporting & Interpretation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# APA-style reporting:\n# \"Treatment significantly improved scores (M=87.6, SD=5.8) compared to\n#  control (M=74.8, SD=4.9), t(14)=4.72, p<.001, d=1.50, 95% CI [0.82, 2.18].\""
                  }
        ],
        tips: [
                  "Always report effect sizes alongside p-values — a significant p with tiny effect size is practically meaningless.",
                  "Include 95% CI for effect sizes — \"d = 0.5, 95% CI [0.1, 0.9]\" is much more informative than d alone.",
                  "Use domain-appropriate effect sizes: Cohen's d for means, OR for binary outcomes, η² for ANOVA, r² for regression.",
                  "NNT is the most intuitive clinical effect size — \"treat 10 patients for 1 to benefit\" is immediately understandable."
        ],
        mistake: "Reporting only p < 0.05 without effect size — with large samples, trivially small effects become \"significant.\" A d = 0.05 with p = 0.01 means statistical significance but zero practical importance.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "multiple-comparison-fdr",
        fn: "Multiple Comparisons & False Discovery Rate",
        desc: "Control error rates when testing many hypotheses — Bonferroni, Holm, Benjamini-Hochberg FDR.",
        category: "Inference",
        subtitle: "Family-wise error rate vs FDR, p-value adjustment",
        signature: "α_adjusted = α / m (Bonferroni)  |  BH: order p-values, compare to (i/m)α",
        descLong: "Testing m hypotheses at α=0.05 each gives ~1-0.95^m chance of at least one false positive. Bonferroni: divide α by m (conservative, controls family-wise error rate). Holm: step-down procedure (less conservative, same FWER control). Benjamini-Hochberg (BH): controls False Discovery Rate (proportion of false positives among rejections) — more powerful for exploratory analysis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Multiple Comparisons & False Discovery Rate — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\nfrom statsmodels.stats.multitest import multipletests\n# Raw p-values from 10 tests\np_values = np.array([0.001, 0.008, 0.039, 0.041, 0.052,\n                       0.10, 0.15, 0.34, 0.56, 0.92])\n# Bonferroni correction (most conservative)\nreject_bonf, padj_bonf, _, _ = multipletests(p_values, alpha=0.05, method='bonferroni')\nprint(\"Bonferroni adjusted:\", padj_bonf.round(4))\nprint(\"Rejected:\", np.where(reject_bonf)[0])  # [0]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Multiple Comparisons & False Discovery Rate — common patterns you'll see in production.\n# APPROACH  - Combine Multiple Comparisons & False Discovery Rate with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Holm step-down (same FWER, more power)\nreject_holm, padj_holm, _, _ = multipletests(p_values, alpha=0.05, method='holm')\nprint(\"Holm adjusted:\", padj_holm.round(4))\nprint(\"Rejected:\", np.where(reject_holm)[0])  # [0, 1]\n# Benjamini-Hochberg FDR (most powerful)\nreject_bh, padj_bh, _, _ = multipletests(p_values, alpha=0.05, method='fdr_bh')\nprint(\"BH adjusted:\", padj_bh.round(4))\nprint(\"Rejected:\", np.where(reject_bh)[0])  # [0, 1, 2, 3]\n# When to use which:\n# Bonferroni: clinical trials (must avoid ANY false positive)\n# Holm:       clinical trials (slightly more powerful than Bonferroni)\n# BH (FDR):  genomics, A/B testing, exploratory analysis\n#             (okay if 5% of \"discoveries\" are false positives)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Multiple Comparisons & False Discovery Rate — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Visualization: compare methods\nfor name, rejected in [('Bonferroni', reject_bonf), ('Holm', reject_holm), ('BH FDR', reject_bh)]:\n    print(f\"{name}: {sum(rejected)} / {len(p_values)} rejected\")"
                  }
        ],
        tips: [
                  "Bonferroni is too conservative for >20 tests — Holm gives the same FWER guarantee with more power.",
                  "FDR (Benjamini-Hochberg) is standard in genomics and tech A/B testing — controls the proportion of false discoveries.",
                  "Pre-register your hypotheses — testing fewer hypotheses means less correction and more power.",
                  "If tests are correlated (e.g., related endpoints), Bonferroni is overly conservative — use simulation-based methods."
        ],
        mistake: "Running 20 A/B tests at α=0.05 without correction — you'd expect 1 false positive by chance alone. Apply FDR correction or pre-register a primary hypothesis.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "sample-size-planning",
        fn: "Sample Size & Power Planning",
        desc: "Calculate required sample sizes before data collection — ensures studies have adequate power to detect real effects.",
        category: "Design",
        subtitle: "Power analysis, minimum detectable effect, sensitivity analysis",
        signature: "n = (z_α + z_β)² × 2σ² / δ²  |  power = P(reject H₀ | H₁ true)",
        descLong: "Power is the probability of detecting a real effect (typically target 80%). Sample size depends on: desired power, significance level (α), expected effect size, and variability. Compute BEFORE collecting data — underpowered studies waste resources and miss real effects. For A/B tests: also consider minimum detectable effect (MDE) and baseline conversion rate.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Sample Size & Power Planning — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom statsmodels.stats.power import TTestIndPower, NormalIndPower\nfrom scipy import stats\nimport numpy as np\n# Two-sample t-test: how many per group?\nanalysis = TTestIndPower()\n# Expected medium effect (d=0.5), α=0.05, power=0.80\nn_per_group = analysis.solve_power(\n    effect_size=0.5,\n    alpha=0.05,\n    power=0.80,\n    alternative='two-sided'\n)\nprint(f\"Need {np.ceil(n_per_group):.0f} per group\")  # ~64"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Sample Size & Power Planning — common patterns you'll see in production.\n# APPROACH  - Combine Sample Size & Power Planning with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Power curve: visualize n vs power\nimport matplotlib.pyplot as plt\nns = range(10, 200)\npowers = [analysis.power(0.5, n, 0.05) for n in ns]\nplt.plot(ns, powers)\nplt.axhline(0.8, color='r', linestyle='--', label='80% power')\nplt.xlabel('Sample size per group')\nplt.ylabel('Power')\n# A/B test sample size (proportions)\n# Baseline conversion: 5%, MDE: 1 percentage point (5% → 6%)\nfrom statsmodels.stats.proportion import proportion_effectsize\nes = proportion_effectsize(0.05, 0.06)\nn_ab = NormalIndPower().solve_power(es, alpha=0.05, power=0.80)\nprint(f\"A/B test: {np.ceil(n_ab):.0f} per variant\")  # ~3,600+"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Sample Size & Power Planning — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Sensitivity analysis: what effect can we detect with n=100?\ndetectable_d = analysis.solve_power(\n    nobs1=100,\n    alpha=0.05,\n    power=0.80,\n    alternative='two-sided'\n)\nprint(f\"With n=100/group, can detect d ≥ {detectable_d:.3f}\")\n# Rule of thumb:\n# Small effect (d=0.2):  ~400 per group\n# Medium effect (d=0.5): ~64 per group\n# Large effect (d=0.8):  ~26 per group"
                  }
        ],
        tips: [
                  "Always run power analysis BEFORE collecting data — post-hoc power is meaningless and misleading.",
                  "If the required n is infeasible, consider: larger expected effect? One-sided test? Paired design?",
                  "For A/B tests, small MDE (e.g., 0.5% lift on 5% baseline) requires enormous samples — be realistic about detectable effects.",
                  "Sensitivity analysis (\"what can we detect with n=100?\") is useful when sample size is fixed."
        ],
        mistake: "Computing \"observed power\" after a non-significant result — it's a direct function of the p-value and adds no information. Plan power before the study, not after.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },
]

export default { meta, sections }
