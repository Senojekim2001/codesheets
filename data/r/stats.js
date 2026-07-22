export const meta = {
  "title": "Statistics & Probability in R",
  "domain": "r",
  "sheet": "stats",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: Descriptive Statistics ─────────────────────────────────────────
  {
    id: "descriptive-stats-r",
    title: "Descriptive Statistics",
    entries: [
      {
        id: "descriptive-stats",
        fn: "Descriptive Statistics: summary() & basic measures",
        desc: "Compute mean, median, standard deviation, quartiles, and ranges.",
        category: "R Statistics",
        subtitle: "summary(), mean(), median(), sd(), var(), IQR(), quantile()",
        signature: "mean(x)  |  median(x)  |  sd(x)  |  quantile(x, probs)",
        descLong: "Descriptive statistics summarize data in one number. mean() is the average. median() is the middle value (robust to outliers). sd() and var() measure spread. IQR() is the interquartile range. quantile() returns percentiles. Always visualize with a histogram or boxplot.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Descriptive Statistics: summary() & basic measures — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data ────────────────────────────────────────\nset.seed(42)\nscores <- c(72, 85, 91, 78, 95, 82, 88, 76, 93, 89,\n            81, 87, 79, 94, 86, 83, 90, 77, 92, 84)\n# ── Descriptive statistics ──────────────────────────\nsummary(scores)\n# Min. 1st Qu.  Median    Mean 3rd Qu.    Max.\n# 72.0   78.5   85.5    85.5   90.0   95.0\n# Individual measures:\nmean(scores)         # 85.5\nmedian(scores)       # 85.5\nsd(scores)          # 6.87  (standard deviation)\nvar(scores)         # 47.21 (variance = sd^2)\n# ── Range and IQR ──────────────────────────────────\nrange(scores)       # 72 95\nmax(scores) - min(scores)  # 23 (range)\nIQR(scores)         # 11.5 (25th to 75th percentile)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Descriptive Statistics: summary() & basic measures — common patterns you'll see in production.\n# APPROACH  - Combine Descriptive Statistics: summary() & basic measures with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Quantiles ──────────────────────────────────────\nquantile(scores)    # min, Q1, median, Q3, max\nquantile(scores, probs=c(0.1, 0.25, 0.5, 0.75, 0.9))\n# 10%  25%  50%  75%  90%\n# 75.4 78.5 85.5 90.0 92.4\n# ── Visualization ──────────────────────────────────\nhist(scores, breaks=10, col='skyblue',\n     main='Distribution of Scores',\n     xlab='Score', ylab='Frequency')\nboxplot(scores, main='Boxplot of Scores',\n        ylab='Score')\n# ── Grouped descriptive stats ──────────────────────\ngroup <- rep(c('Control', 'Treatment'), each=10)\ndf <- data.frame(score=scores, group=group)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Descriptive Statistics: summary() & basic measures — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# By-group means:\ntapply(df$score, df$group, mean)\n# Control Treatment\n#    84.2     86.8\n# By-group summary stats:\ntapply(df$score, df$group, sd)"
                  }
        ],
        tips: [
                  "Use sd() and var() for sample data. Divide by (n-1) automatically (Bessel correction)",
                  "median() is more robust than mean() when outliers are present",
                  "IQR() is resistant to outliers — used in boxplot whisker calculations",
                  "Always check for missing values: summary() shows NA count; use na.rm=TRUE in functions"
        ],
        mistake: "Using sample statistics (sd, var) as population parameters. If you have a sample, use sd() which divides by n-1. Population functions divide by n only.",
        shorthand: {
          verbose: "SELECT category,\n       COUNT(*) AS count,\n       AVG(amount) AS average\nFROM sales\nGROUP BY category\nHAVING COUNT(*) > 5",
          concise: "SELECT category, COUNT(*), AVG(amount) FROM sales GROUP BY category HAVING COUNT(*) > 5",
        },
      },
      {
        id: "standard-deviation",
        fn: "Variation: sd(), var(), mad(), coefficient of variation",
        desc: "Measure spread and variability in data.",
        category: "R Statistics",
        subtitle: "sd(), var(), mad(), and CV (coefficient of variation)",
        signature: "sd(x)  |  var(x)  |  mad(x)  |  CV = sd(x)/mean(x)",
        descLong: "Standard deviation (sd) is the square root of variance. MAD (median absolute deviation) is robust to outliers. Coefficient of variation (CV = sd/mean) scales sd by the mean — useful for comparing spread across different scales.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Variation: sd(), var(), mad(), coefficient of variation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data with outlier ──────────────────────────\nset.seed(42)\nnormal_data <- c(100, 102, 98, 101, 99, 103, 97, 102, 100, 98)\noutlier_data <- c(100, 102, 98, 101, 99, 103, 97, 102, 100, 500)\n# ── Standard deviation and variance ────────────────\nsd(normal_data)     # 1.94\nvar(normal_data)    # 3.78 (= sd^2)\nsd(outlier_data)    # 154.0  (inflated by outlier!)\nvar(outlier_data)   # 23716\n# ── MAD: robust measure ────────────────────────────\nmad(normal_data)    # 1.48  (median absolute deviation)\nmad(outlier_data)   # 1.48  (unaffected by outlier)\n# MAD is computed as:\n# 1. Find median\n# 2. Compute absolute deviations from median\n# 3. Find median of those deviations\n# 4. Multiply by 1.4826 (constant for normality)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Variation: sd(), var(), mad(), coefficient of variation — common patterns you'll see in production.\n# APPROACH  - Combine Variation: sd(), var(), mad(), coefficient of variation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Coefficient of Variation (CV) ──────────────────\n# Standardizes sd by mean — for comparing variability\n# across datasets with different scales\ngroup1 <- c(100, 102, 98, 101, 99)  # mean ~100\ngroup2 <- c(1000, 1020, 980, 1010, 990)  # mean ~1000\nsd(group1) / mean(group1)   # 0.0194 (1.94%)\nsd(group2) / mean(group2)   # 0.0194 (1.94%)\n# Same relative variability despite different absolute sd\n# ── Computing CV function ──────────────────────────\ncv <- function(x) sd(x) / mean(x, na.rm=TRUE)\ncv(group1)          # 0.0194\ncv(group2)          # 0.0194"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Variation: sd(), var(), mad(), coefficient of variation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Visualizing variability ────────────────────────\npar(mfrow=c(1, 2))\nhist(normal_data, breaks=5, main='Normal Data',\n     xlim=c(0, 550), ylim=c(0, 5), col='lightblue')\ntext(250, 4, paste('sd =', round(sd(normal_data), 2)))\nhist(outlier_data, breaks=5, main='With Outlier',\n     xlim=c(0, 550), ylim=c(0, 5), col='salmon')\ntext(250, 4, paste('sd =', round(sd(outlier_data), 2)))"
                  }
        ],
        tips: [
                  "CV is unitless — compare variability across different measurement scales",
                  "MAD is ~1.48 * sample sd for normally distributed data",
                  "Use mad() instead of sd() when dealing with skewed data or outliers",
                  "Always plot your data before choosing sd vs mad"
        ],
        mistake: "Reporting sd when data has outliers — it inflates artificially. Use mad() or report both sd and mad, or remove/investigate outliers first.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "correlation",
        fn: "Correlation: Pearson, Spearman, Kendall with tests",
        desc: "Measure linear and rank associations between variables.",
        category: "R Statistics",
        subtitle: "cor(), cor.test() — Pearson/Spearman/Kendall with p-values",
        signature: "cor(x, y)  |  cor.test(x, y, method=\"pearson\")",
        descLong: "cor() computes correlation coefficient. Pearson (linear), Spearman (rank, nonparametric), Kendall (rank, robust). cor.test() returns correlation, confidence interval, and p-value for testing H0: ρ=0.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Correlation: Pearson, Spearman, Kendall with tests — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data ────────────────────────────────────────\nset.seed(42)\nheight <- c(170, 172, 168, 175, 180, 165, 178, 172, 176, 169)\nweight <- c(72, 78, 65, 85, 92, 60, 88, 75, 90, 68)\ndf <- data.frame(height, weight)\n# ── Pearson correlation (linear relationship) ─────\ncor(df$height, df$weight)  # 0.947\ncor(df)                    # correlation matrix\n# ── Pearson correlation test ───────────────────────\ntest_pearson <- cor.test(df$height, df$weight,\n                         method=\"pearson\")\ntest_pearson\n# Pearson's product-moment correlation\n# t = 8.46, df = 8, p-value = 3.3e-05\n# cor = 0.947, 95% CI: 0.826 to 0.985\n# Extract components:\ntest_pearson$estimate     # 0.947 (correlation)\ntest_pearson$p.value      # 3.3e-05\ntest_pearson$conf.int     # 0.826 0.985"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Correlation: Pearson, Spearman, Kendall with tests — common patterns you'll see in production.\n# APPROACH  - Combine Correlation: Pearson, Spearman, Kendall with tests with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Spearman correlation (rank-based, robust) ──────\n# Use when: nonlinear, ordinal data, or outliers\ntest_spearman <- cor.test(df$height, df$weight,\n                          method=\"spearman\")\ntest_spearman\n# rho = 0.939, p-value = 5.3e-05\ncor(df, method=\"spearman\")  # rank correlation matrix\n# ── Kendall correlation (very robust) ───────────────\ntest_kendall <- cor.test(df$height, df$weight,\n                         method=\"kendall\")\ntest_kendall\n# tau = 0.822, p-value = 3.8e-05\n# ── Correlation matrix with all variables ─────────\nX <- data.frame(\n  height = c(170, 172, 168, 175, 180, 165, 178, 172, 176, 169),\n  weight = c(72, 78, 65, 85, 92, 60, 88, 75, 90, 68),\n  age    = c(25, 28, 22, 30, 35, 20, 32, 26, 29, 23)\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Correlation: Pearson, Spearman, Kendall with tests — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ncor(X)         # Pearson correlations\ncor(X, method=\"spearman\")  # Spearman\n# ── Visualizing correlation ────────────────────────\nplot(df$height, df$weight,\n     main='Height vs Weight',\n     xlab='Height (cm)', ylab='Weight (kg)',\n     pch=16, col='darkblue')\n# Add trend line:\nabline(lm(weight ~ height, data=df), col='red', lwd=2)\n# Add correlation to plot:\nr_val <- cor(df$height, df$weight)\ntext(167, 90, paste0('r = ', round(r_val, 3)),\n     cex=1.2, col='red')"
                  }
        ],
        tips: [
                  "Pearson assumes linearity — check scatterplot first",
                  "Spearman is better for nonlinear or ordinal data",
                  "Correlation ≠ causation — always remember confounding variables",
                  "p-value tests H0: ρ=0, not strength of association"
        ],
        mistake: "Interpreting a high correlation as proof of causation. Correlation only measures association. There may be confounding variables, reverse causation, or both driven by a third variable.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "probability-distributions",
        fn: "Probability Distributions: Normal, Binomial, Poisson",
        desc: "Work with probability distributions: dnorm/pnorm/qnorm/rnorm, dbinom, dpois.",
        category: "R Statistics",
        subtitle: "dnorm/pnorm/qnorm/rnorm, dbinom(), dpois() — density, CDF, quantile, samples",
        signature: "dnorm(x, mean, sd)  |  pnorm(q)  |  qnorm(p)  |  rnorm(n)",
        descLong: "R provides four functions for each distribution: d (density), p (cumulative), q (quantile), r (random samples). Normal distribution is N(μ,σ²). Binomial B(n,p) for n trials. Poisson for rare events.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Probability Distributions: Normal, Binomial, Poisson — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Normal distribution N(μ=100, σ=15) ─────────────\n# dnorm: probability density function\nx <- seq(70, 130, length=100)\ndensity <- dnorm(x, mean=100, sd=15)\nplot(x, density, type='l', main='Normal Distribution',\n     xlab='Value', ylab='Density', lwd=2)\nabline(v=100, col='red', lty=2)  # mean\n# ── pnorm: cumulative probability P(X ≤ x) ────────\npnorm(100, mean=100, sd=15)      # 0.5 (median)\npnorm(115, mean=100, sd=15)      # 0.818 (P(X ≤ 115))\npnorm(85, mean=100, sd=15)       # 0.182 (P(X ≤ 85))\n# One-sided probabilities:\n1 - pnorm(120, mean=100, sd=15)  # 0.0918 (P(X > 120))\n# ── qnorm: quantile function (inverse of pnorm) ──\nqnorm(0.5, mean=100, sd=15)      # 100 (median)\nqnorm(0.975, mean=100, sd=15)    # 129.4 (95th percentile)\nqnorm(0.025, mean=100, sd=15)    # 70.6 (2.5th percentile)\n# 95% CI: [qnorm(0.025), qnorm(0.975)]:\nc(qnorm(0.025, 100, 15), qnorm(0.975, 100, 15))\n# 70.6 129.4\n# ── rnorm: generate random samples ──────────────────\nsamples <- rnorm(1000, mean=100, sd=15)\nhist(samples, breaks=30, prob=TRUE, col='skyblue',\n     main='1000 Samples from N(100, 15²)',\n     xlab='Value', ylab='Density')"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Probability Distributions: Normal, Binomial, Poisson — common patterns you'll see in production.\n# APPROACH  - Combine Probability Distributions: Normal, Binomial, Poisson with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Overlay theoretical density:\nlines(x, density, col='red', lwd=2)\n# ── Binomial distribution B(n, p) ──────────────────\n# n=10 trials, p=0.5 success probability\n# Probability of exactly 7 successes:\ndbinom(7, size=10, prob=0.5)     # 0.1172\n# Cumulative: P(X ≤ 5):\npbinom(5, size=10, prob=0.5)     # 0.623\n# 95th percentile (how many successes?):\nqbinom(0.95, size=10, prob=0.5)  # 8\n# Generate 100 random binomial outcomes:\nbinom_samples <- rbinom(100, size=10, prob=0.5)\ntable(binom_samples)  # distribution of successes\n# ── Poisson distribution Pois(λ) ───────────────────\n# λ=3 rare events per unit time\n# P(X = 2 events):\ndpois(2, lambda=3)      # 0.224\n# P(X ≤ 2 events):\nppois(2, lambda=3)      # 0.423\n# Quantile (how many events for 90% prob?):\nqpois(0.9, lambda=3)    # 6"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Probability Distributions: Normal, Binomial, Poisson — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Generate 500 Poisson samples:\npois_samples <- rpois(500, lambda=3)\nmean(pois_samples)      # ~3 (should equal λ)\n# ── Plotting multiple distributions ────────────────\npar(mfrow=c(2,2))\n# Binomial:\nx <- 0:10\nplot(x, dbinom(x, 10, 0.5), type='h', lwd=2,\n     main='Binomial(n=10, p=0.5)', ylab='P(X=x)')\n# Poisson:\nx <- 0:10\nplot(x, dpois(x, lambda=3), type='h', lwd=2,\n     main='Poisson(λ=3)', ylab='P(X=x)')\n# Normal:\nx <- seq(-4, 4, 0.1)\nplot(x, dnorm(x), type='l', lwd=2,\n     main='Normal(0, 1)', ylab='Density')\n# Exponential:\nx <- seq(0, 5, 0.1)\nplot(x, dexp(x, rate=1), type='l', lwd=2,\n     main='Exponential(rate=1)', ylab='Density')"
                  }
        ],
        tips: [
                  "d*() functions are densities/probabilities, not usually needed in practice",
                  "p*() (CDF) is used for p-values and confidence intervals",
                  "q*() (quantile) inverts p*() — use for critical values and CI bounds",
                  "r*() generates random samples — use for simulation and permutation tests"
        ],
        mistake: "Using dnorm(x) for the probability P(X=x). dnorm gives density (height of curve). For P(X ≤ x), use pnorm. For discrete distributions like binomial, dbinom(x) is the probability.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
    ],
  },

  // ── Section 2: Hypothesis Testing ─────────────────────────────────────────
  {
    id: "hypothesis-testing-r",
    title: "Hypothesis Testing",
    entries: [
      {
        id: "t-test",
        fn: "t-test: One-sample, Two-sample, Paired",
        desc: "Test means using the t distribution.",
        category: "R Statistics",
        subtitle: "t.test() — one-sample, two-sample (Welch/Student), paired with CI",
        signature: "t.test(x, mu=0)  |  t.test(x, y)  |  t.test(x, y, paired=TRUE)",
        descLong: "One-sample t-test: H0: μ = μ₀. Two-sample: H0: μ₁ = μ₂ (Welch by default, unequal variances). Paired: H0: μ_diff = 0. Returns t-statistic, p-value, and 95% confidence interval.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of t-test: One-sample, Two-sample, Paired — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── One-sample t-test ──────────────────────────────────\n# H0: μ = 100\n# HA: μ ≠ 100\nset.seed(42)\nsample <- c(98, 102, 101, 99, 103, 97, 100, 104, 98, 102)\nt.test(sample, mu=100)\n# t = 0.471, df = 9, p-value = 0.648\n# 95% CI: 98.98 to 102.02\n# One-sided test: H0: μ ≥ 100 (test if < 100):\nt.test(sample, mu=100, alternative=\"less\")\n# One-sided test: H0: μ ≤ 100 (test if > 100):\nt.test(sample, mu=100, alternative=\"greater\")\n# ── Two-sample t-test (Welch by default) ─────────\ncontrol  <- c(95, 98, 100, 97, 99, 96, 101, 98, 99, 97)\ntreatment <- c(105, 108, 110, 107, 112, 106, 111, 109, 113, 108)\nt.test(control, treatment)\n# t = -8.19, df = 18, p-value = 2.3e-07\n# 95% CI: -11.2 to -6.8\n# (treatment is significantly higher)\n# Extract components:\ntest <- t.test(control, treatment)\ntest$statistic        # t value\ntest$p.value          # p-value\ntest$conf.int         # confidence interval\ntest$estimate         # group means"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of t-test: One-sample, Two-sample, Paired — common patterns you'll see in production.\n# APPROACH  - Combine t-test: One-sample, Two-sample, Paired with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Student's t-test (assume equal variance) ──────\nt.test(control, treatment, var.equal=TRUE)\n# (Welch is safer, preferred by default)\n# ── Formula interface ────────────────────────────────\ndf <- data.frame(\n  value = c(control, treatment),\n  group = rep(c('Control', 'Treatment'), each=10)\n)\nt.test(value ~ group, data=df)  # two-sample\n# ── Paired t-test ──────────────────────────────────\nbefore <- c(110, 115, 108, 120, 112, 118, 105, 125, 110, 115)\nafter  <- c(105, 110, 103, 115, 107, 113, 100, 120, 105, 110)\nt.test(before, after, paired=TRUE)\n# t = 2.88, df = 9, p-value = 0.0176\n# 95% CI: 1.1 to 8.9 (mean difference)\n# ── Assumptions check ──────────────────────────────\n# Normality (on differences for paired):\ndifferences <- before - after\nshapiro.test(differences)\n# If p > 0.05, normality assumption reasonable"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of t-test: One-sample, Two-sample, Paired — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Equal variances (for unpaired, Student's only):\nvar.test(control, treatment)\n# If p < 0.05, variances unequal (use Welch)\n# ── Compute effect size (Cohen's d) ───────────────\n# d = (mean1 - mean2) / pooled_sd\nm1 <- mean(control)\nm2 <- mean(treatment)\ns1 <- sd(control)\ns2 <- sd(treatment)\nn1 <- length(control)\nn2 <- length(treatment)\npooled_sd <- sqrt(((n1-1)*s1^2 + (n2-1)*s2^2) / (n1 + n2 - 2))\ncohens_d <- (m2 - m1) / pooled_sd  # 2.55 (large effect)\n# ── Power calculation (retrospective) ──────────────\n# library(pwr)\n# pwr.t.test(n=10, d=cohens_d, sig.level=0.05, type=\"two.sample\")"
                  }
        ],
        tips: [
                  "Welch's t-test (default, var.equal=FALSE) is safer — handles unequal variances",
                  "For normality check with small n: use shapiro.test()",
                  "Extract p-value with test$p.value; CI with test$conf.int",
                  "Always report effect size (Cohen's d) along with p-value"
        ],
        mistake: "Using Student's t-test without checking equal variance assumption. Use Welch (default) or var.test() first. Welch is nearly identical when variances ARE equal, but much safer.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "wilcox-test",
        fn: "Wilcoxon Test: Mann-Whitney & Signed-Rank",
        desc: "Nonparametric alternative to t-tests.",
        category: "R Statistics",
        subtitle: "wilcox.test() — Mann-Whitney U and Wilcoxon signed-rank",
        signature: "wilcox.test(x, y)  |  wilcox.test(x, y, paired=TRUE)",
        descLong: "Wilcoxon test is nonparametric (no normality assumption). Mann-Whitney U: unpaired two-sample. Signed-rank: paired samples. Uses ranks instead of means. More robust to outliers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Wilcoxon Test: Mann-Whitney & Signed-Rank — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data ────────────────────────────────────────\nset.seed(42)\ncontrol <- c(95, 98, 100, 97, 99, 96, 101, 98, 99, 97, 150)  # has outlier\ntreatment <- c(105, 108, 110, 107, 112, 106, 111, 109, 113, 108, 110)\n# ── Visualize ──────────────────────────────────────\nboxplot(list(control=control, treatment=treatment),\n        main='Data with Outlier in Control',\n        ylab='Value')\n# ── Mann-Whitney U test (unpaired) ──────────────────\n# H0: distributions are identical (including location)\nwilcox.test(control, treatment)\n# W = 35, p-value = 0.0324\n# Two-sided (default: alternative=\"two.sided\"):\nwilcox.test(control, treatment, alternative=\"two.sided\")\n# One-sided:\nwilcox.test(control, treatment, alternative=\"greater\")\n# Extract components:\ntest_mw <- wilcox.test(control, treatment)\ntest_mw$statistic      # U statistic (W)\ntest_mw$p.value        # p-value"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Wilcoxon Test: Mann-Whitney & Signed-Rank — common patterns you'll see in production.\n# APPROACH  - Combine Wilcoxon Test: Mann-Whitney & Signed-Rank with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Formula interface ──────────────────────────────\ndf <- data.frame(\n  value = c(control, treatment),\n  group = rep(c('Control', 'Treatment'), c(11, 11))\n)\nwilcox.test(value ~ group, data=df)\n# ── Wilcoxon signed-rank test (paired) ──────────────\nbefore <- c(110, 115, 108, 120, 112, 118, 105, 125, 110, 115)\nafter  <- c(105, 110, 103, 115, 107, 113, 100, 120, 105, 110)\n# H0: median difference = 0\nwilcox.test(before, after, paired=TRUE)\n# V = 54, p-value = 0.0195\n# ── Compare t-test vs Wilcoxon (with outlier) ─────\n# Remove outlier:\ncontrol_clean <- control[-11]\n# t-test (affected by outlier):\nt.test(control, treatment)       # p = 2.3e-07 (very sig)\n# t-test (without outlier):\nt.test(control_clean, treatment) # p = 2.3e-07"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Wilcoxon Test: Mann-Whitney & Signed-Rank — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Wilcoxon (robust to outlier):\nwilcox.test(control, treatment)  # p = 0.0324\nwilcox.test(control_clean, treatment)  # p = 0.0026\n# ── Effect size for Wilcoxon ──────────────────────\n# Rank-biserial correlation r_rb = 1 - 2U / (n1*n2)\nU <- wilcox.test(control, treatment)$statistic\nn1 <- length(control)\nn2 <- length(treatment)\nr_rb <- 1 - (2 * U) / (n1 * n2)\n# r_rb ≈ -0.36 (medium effect)\n# ── Visualization of ranks ──────────────────────────\nall_data <- c(control, treatment)\nranks <- rank(all_data)\ncontrol_ranks <- ranks[1:length(control)]\ntreatment_ranks <- ranks[(length(control)+1):(length(control)+length(treatment))]\nmean(control_ranks)      # 9.64\nmean(treatment_ranks)    # 12.36\n# Wilcoxon statistic is sum of treatment ranks:\nsum(treatment_ranks)     # 135 (compared to expected ~126)"
                  }
        ],
        tips: [
                  "Use Wilcoxon when data is nonnormal or has outliers",
                  "Wilcoxon tests location (median) based on ranks, not means",
                  "For paired data: signed-rank; for unpaired: Mann-Whitney (same function)",
                  "Less powerful than t-test if normality holds, but robust to violations"
        ],
        mistake: "Using Wilcoxon and t-test interchangeably. If data is normal, t-test is more powerful. Use Wilcoxon if nonnormal, small samples, or outliers present.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "anova-r",
        fn: "ANOVA: One-way, Two-way, and Post-hoc Tests",
        desc: "Test equality of means across multiple groups.",
        category: "R Statistics",
        subtitle: "aov(), summary.aov(), TukeyHSD() post-hoc comparisons",
        signature: "aov(y ~ factor(group))  |  TukeyHSD(fit)  |  lm(y ~ group)",
        descLong: "ANOVA tests H0: all group means are equal. aov() fits model. summary() prints ANOVA table (F-statistic, p-value). TukeyHSD performs pairwise comparisons with multiple testing correction.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ANOVA: One-way, Two-way, and Post-hoc Tests — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── One-way ANOVA ──────────────────────────────────────\nset.seed(42)\ndf <- data.frame(\n  score = c(85, 88, 86, 87, 84, 89, 87, 88, 86, 85,\n            92, 95, 91, 94, 90, 93, 92, 94, 91, 92,\n            78, 81, 79, 80, 77, 82, 80, 81, 79, 78),\n  method = rep(c('Method_A', 'Method_B', 'Method_C'), each=10)\n)\n# ── Fit ANOVA ───────────────────────────────────────\nfit <- aov(score ~ method, data=df)\nsummary(fit)\n#             Df  Sum Sq Mean Sq F value Pr(>F)\n# method      2  358.13 179.07  39.26   6.5e-09 ***\n# Residuals  27  123.20   4.56\n# F = 39.26, p < 0.001: means significantly differ\n# ── Extract components ──────────────────────────────\nfit$coefficients       # reference-level parametrization\nfit$residuals          # residuals\nfitted(fit)            # fitted values\n# ── Group means and confidence intervals ─────────\ntapply(df$score, df$method, mean)\n# Method_A Method_B Method_C\n#     86.7     92.4     79.7"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ANOVA: One-way, Two-way, and Post-hoc Tests — common patterns you'll see in production.\n# APPROACH  - Combine ANOVA: One-way, Two-way, and Post-hoc Tests with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ntapply(df$score, df$method, sd)\ntapply(df$score, df$method, length)\n# ── Post-hoc test: Tukey's HSD ──────────────────────\ntukey_result <- TukeyHSD(fit)\ntukey_result\n# Method_B-Method_A  5.7  ***  (significantly different)\n# Method_C-Method_A -7.0  ***\n# Method_C-Method_B -12.7 ***\n# Visualize pairwise CIs:\nplot(tukey_result, las=1)\n# Extract p-values:\ntukey_result$method[, 'p adj']\n# ── Two-way ANOVA ──────────────────────────────────\ndf2 <- data.frame(\n  score = rnorm(60, mean=85, sd=5),\n  method = rep(c('A', 'B', 'C'), 20),\n  gender = rep(c('M', 'F'), 30)\n)\n# Main effects:\nfit2 <- aov(score ~ method + gender, data=df2)\nsummary(fit2)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ANOVA: One-way, Two-way, and Post-hoc Tests — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# With interaction:\nfit2_int <- aov(score ~ method * gender, data=df2)\nsummary(fit2_int)\n# ── Check ANOVA assumptions ────────────────────────\n# 1. Normality of residuals:\nshapiro.test(residuals(fit))\n# 2. Homogeneity of variance (Levene's test):\n# library(car)\n# leveneTest(score ~ method, data=df)\n# 3. Visualization:\npar(mfrow=c(2,2))\nplot(fit)  # diagnostics\n# ── Kruskal-Wallis (nonparametric ANOVA) ─────────\n# Use if assumptions violated:\nkruskal.test(score ~ method, data=df)\n# H = 39.26, p < 0.001"
                  }
        ],
        tips: [
                  "Always follow significant ANOVA with post-hoc tests (TukeyHSD) to find which pairs differ",
                  "Two-way ANOVA: main effects test method and gender separately; interaction tests if effect depends on both",
                  "Check homogeneity with leveneTest(); use Kruskal-Wallis if violated",
                  "Adjusted p-values from TukeyHSD correct for multiple comparisons automatically"
        ],
        mistake: "Significant ANOVA without post-hoc tests. An F-test just says SOME groups differ. You MUST follow up with TukeyHSD or Dunnett to identify WHICH pairs differ significantly.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "chi-squared-r",
        fn: "Chi-Squared Test: Goodness of Fit & Independence",
        desc: "Test categorical associations and fit to theoretical distributions.",
        category: "R Statistics",
        subtitle: "chisq.test() — observed vs expected frequencies",
        signature: "chisq.test(x, y)  |  chisq.test(observed, p=expected_props)",
        descLong: "Chi-squared test compares observed vs expected frequencies. For independence: tests association between two categorical variables. For goodness of fit: tests if data matches a theoretical distribution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Chi-Squared Test: Goodness of Fit & Independence — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Contingency table test (independence) ───────────\nset.seed(42)\ndf <- data.frame(\n  dept = rep(c('Sales', 'IT', 'HR'), c(20, 15, 25)),\n  satisfaction = c(\n    rep(c('High', 'Low'), c(12, 8)),\n    rep(c('High', 'Low'), c(10, 5)),\n    rep(c('High', 'Low'), c(12, 13))\n  )\n)\n# Create contingency table:\ntbl <- table(df$dept, df$satisfaction)\ntbl\n#       High  Low\n# Sales  12    8\n# IT     10    5\n# HR     12   13\n# Run chi-squared test:\n# H0: dept and satisfaction are independent\ntest <- chisq.test(tbl)\ntest\n# X-squared = 1.54, df = 2, p-value = 0.463\n# (no evidence of association)\n# Extract components:\ntest$statistic         # χ² value\ntest$p.value           # p-value\ntest$observed          # observed frequencies\ntest$expected          # expected under independence\ntest$residuals         # standardized residuals"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Chi-Squared Test: Goodness of Fit & Independence — common patterns you'll see in production.\n# APPROACH  - Combine Chi-Squared Test: Goodness of Fit & Independence with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Check expected frequencies ──────────────────────\n# Chi-squared requires expected freq ≥ 5\n# If violated, use fisher.test() or combine categories\ntest$expected\n# ── Standardized residuals ──────────────────────────\n# Large values (|z| > 2) indicate deviation from independence\ntest$residuals\n# Positive: more common than expected under H0\n# Negative: less common than expected\n# ── Visualization ──────────────────────────────────\nmosaicplot(tbl, main='Satisfaction by Department',\n           xlab='Department', ylab='Satisfaction')\n# ── Goodness of fit test ────────────────────────────\n# H0: data follows expected proportions\n# Suppose we expect 1:2:3 ratio among categories:\nobserved <- c(25, 45, 30)  # sample counts\nexpected_props <- c(1/6, 2/6, 3/6)  # theoretical proportions\ntest_gof <- chisq.test(observed, p=expected_props)\ntest_gof\n# X-squared = 5.0, df = 2, p-value = 0.082\n# Slight deviation from expected 1:2:3 ratio\n# ── Distribution fitting example ────────────────────\n# Test if counts follow Poisson(λ=3):\ncounts <- c(25, 30, 22, 18, 5)  # obs: 0,1,2,3,4+ events\nn <- sum(counts)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Chi-Squared Test: Goodness of Fit & Independence — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Expected Poisson probabilities:\nlambda <- mean(rep(0:4, counts))  # estimate λ\nexpected <- c(\n  dpois(0, lambda),\n  dpois(1, lambda),\n  dpois(2, lambda),\n  dpois(3, lambda),\n  1 - ppois(3, lambda)  # 4+ events\n) * n\ntest_poisson <- chisq.test(counts, p=expected/n)\ntest_poisson\n# ── Two-way chi-squared (stratified) ─────────────\n# Test association while controlling for a third variable\n# Requires more complex approach (Mantel-Haenszel test)\n# library(mantelhaen.test) for stratified analysis"
                  }
        ],
        tips: [
                  "All expected frequencies should be ≥ 5; use fisher.test() if violated",
                  "Chi-squared tests independence, not causation",
                  "Standardized residuals > |2| indicate cells driving significance",
                  "For 2×2 tables: fisher.test() is exact, more powerful if n < 20"
        ],
        mistake: "Running chi-squared with expected frequencies < 5 in cells. This violates the test assumption. Combine categories, collect more data, or use fisher.test().",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "confidence-intervals",
        fn: "Confidence Intervals: t-based and Bootstrap",
        desc: "Construct confidence intervals for means and regression coefficients.",
        category: "R Statistics",
        subtitle: "confint(), bootstrap CI with boot package",
        signature: "confint(fit)  |  boot(data, statistic, R=1000)",
        descLong: "Confidence intervals estimate parameters with uncertainty. t.test()$conf.int for means. confint() for model coefficients. Bootstrap CI for any statistic without distribution assumptions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Confidence Intervals: t-based and Bootstrap — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Confidence interval for a mean ─────────────────\nset.seed(42)\ndata <- c(85, 88, 86, 87, 84, 89, 87, 88, 86, 85,\n          92, 95, 91, 94, 90, 93, 92, 94, 91, 92)\n# Using t.test:\ntest <- t.test(data)\ntest$conf.int\n# [1] 88.23 91.77  (95% CI for mean)\n# Manual calculation:\nn <- length(data)\nm <- mean(data)\nse <- sd(data) / sqrt(n)\nt_crit <- qt(0.975, df=n-1)  # two-sided 95%\nci_lower <- m - t_crit * se\nci_upper <- m + t_crit * se\nc(ci_lower, ci_upper)  # 88.23 91.77\n# ── Confidence interval for difference of means ──\ncontrol  <- c(95, 98, 100, 97, 99, 96, 101, 98, 99, 97)\ntreatment <- c(105, 108, 110, 107, 112, 106, 111, 109, 113, 108)\ntest_diff <- t.test(control, treatment)\ntest_diff$conf.int\n# [1] -11.2 -6.8  (95% CI, treatment is 6.8-11.2 higher)\n# ── Confidence interval for regression coefficient ──\ndf <- data.frame(\n  x = 1:20,\n  y = 2 + 3*1:20 + rnorm(20, sd=5)\n)\nfit <- lm(y ~ x, data=df)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Confidence Intervals: t-based and Bootstrap — common patterns you'll see in production.\n# APPROACH  - Combine Confidence Intervals: t-based and Bootstrap with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nconfint(fit, level=0.95)\n#             2.5 %  97.5 %\n# (Intercept)  0.42   4.58\n# x            2.72   3.48\n# Extract just slope CI:\nconfint(fit, \"x\")\n# ── Bootstrap confidence intervals ──────────────────\nlibrary(boot)\n# Bootstrap CI for the mean:\nboot_mean <- function(data, indices) {\n  mean(data[indices])\n}\nboot_result <- boot(data, boot_mean, R=5000)\n# 95% CI from percentile method:\nquantile(boot_result$t, c(0.025, 0.975))\n# 2.5%    97.5%\n# 87.85   91.55\n# ── Bootstrap CI for median ────────────────────────\nboot_median <- function(data, indices) {\n  median(data[indices])\n}\nboot_med <- boot(data, boot_median, R=5000)\nquantile(boot_med$t, c(0.025, 0.975))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Confidence Intervals: t-based and Bootstrap — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Bootstrap CI for correlation ────────────────────\nx <- c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)\ny <- 2 + 1.5*x + rnorm(10, sd=2)\ndata_xy <- cbind(x, y)\nboot_cor <- function(data, indices) {\n  cor(data[indices, 1], data[indices, 2])\n}\nboot_cor_result <- boot(data_xy, boot_cor, R=5000)\nquantile(boot_cor_result$t, c(0.025, 0.975))\n# e.g., 0.75 to 0.98\n# Visualize bootstrap distribution:\nhist(boot_cor_result$t, breaks=50, col='skyblue',\n     main='Bootstrap Distribution of Correlation',\n     xlab='Correlation')\nabline(v=quantile(boot_cor_result$t, c(0.025, 0.975)),\n       col='red', lwd=2)\n# ── BCa bootstrap CI (bias-corrected, accelerated) ──\nboot.ci(boot_result, type=\"bca\")\n# Accounts for bias and skewness in bootstrap distribution"
                  }
        ],
        tips: [
                  "Bootstrap needs R ≥ 1000 replicates; R=5000 is standard",
                  "Bootstrap is model-free — works for any statistic (quantiles, medians, correlations)",
                  "percentile method is simple; BCa is more accurate for skewed distributions",
                  "Always visualize bootstrap distribution for sanity check"
        ],
        mistake: "Assuming bootstrap CIs have the same interpretation as parametric CIs. They do, but bootstrap doesn't assume normality — it's empirical and resampling-based.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "multiple-testing-r",
        fn: "Multiple Testing Correction: p.adjust()",
        desc: "Control false discovery rate across multiple tests.",
        category: "R Statistics",
        subtitle: "p.adjust() — Bonferroni, BH/FDR, Holm, Benjamini-Hochberg",
        signature: "p.adjust(p, method=\"BH\")  |  p.adjust(p, method=\"bonferroni\")",
        descLong: "Multiple testing inflates Type I error. Bonferroni: strict, conservative. BH/FDR: controls false discovery rate, less conservative. Always adjust p-values when running many tests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Multiple Testing Correction: p.adjust() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Multiple hypothesis tests ──────────────────────────\nset.seed(42)\nn_tests <- 20\ntrue_effects <- c(rep(TRUE, 5), rep(FALSE, 15))  # 5 real, 15 null\n# Simulate p-values:\np_values <- numeric(n_tests)\nfor (i in 1:n_tests) {\n  if (true_effects[i]) {\n    p_values[i] <- runif(1, 0.001, 0.05)  # true effects: small p\n  } else {\n    p_values[i] <- runif(1, 0.05, 1.0)    # null: larger p\n  }\n}\n# ── Unadjusted p-values ────────────────────────────\nsum(p_values < 0.05)           # 7 significant (should be 5)\nsum(p_values < 0.05 & true_effects)  # 5 true positives\nsum(p_values < 0.05 & !true_effects) # 2 false positives!\n# ── Bonferroni correction ──────────────────────────\n# Divide α by number of tests: α_adj = 0.05 / 20 = 0.0025\np_adj_bonf <- p.adjust(p_values, method=\"bonferroni\")\nsum(p_adj_bonf < 0.05)         # 4 significant\nsum(p_adj_bonf < 0.05 & true_effects)  # 4 true positives\nsum(p_adj_bonf < 0.05 & !true_effects) # 0 false positives\n# ── Holm method (less conservative) ─────────────────\np_adj_holm <- p.adjust(p_values, method=\"holm\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Multiple Testing Correction: p.adjust() — common patterns you'll see in production.\n# APPROACH  - Combine Multiple Testing Correction: p.adjust() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nsum(p_adj_holm < 0.05)         # 5 significant\nsum(p_adj_holm < 0.05 & true_effects)  # 5 true positives\nsum(p_adj_holm < 0.05 & !true_effects) # 0 false positives\n# ── Benjamini-Hochberg (BH) / FDR ──────────────────\n# Controls expected proportion of false positives\n# Less stringent: allows more discoveries\np_adj_bh <- p.adjust(p_values, method=\"BH\")\nsum(p_adj_bh < 0.05)           # 6 significant\nsum(p_adj_bh < 0.05 & true_effects)  # 5 true positives\nsum(p_adj_bh < 0.05 & !true_effects) # 1 false positive\n# ── Summary table ──────────────────────────────────\nresults <- data.frame(\n  test_id = 1:n_tests,\n  p_value = round(p_values, 4),\n  p_bonf = round(p_adj_bonf, 4),\n  p_holm = round(p_adj_holm, 4),\n  p_bh = round(p_adj_bh, 4),\n  true_effect = true_effects\n)\nhead(results, 10)\n# ── Visualization: p-value distribution ─────────────\npar(mfrow=c(2,2))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Multiple Testing Correction: p.adjust() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nhist(p_values, breaks=20, col='lightblue',\n     main='Raw p-values', xlab='p-value')\nabline(v=0.05, col='red', lwd=2)\nplot(p_values, p_adj_bonf, main='Bonferroni',\n     xlab='Raw p', ylab='Adjusted p', pch=16)\nabline(h=0.05, col='red', lwd=1)\nabline(v=0.05, col='red', lwd=1)\nplot(p_values, p_adj_holm, main='Holm',\n     xlab='Raw p', ylab='Adjusted p', pch=16)\nabline(h=0.05, col='red', lwd=1)\nabline(v=0.05, col='red', lwd=1)\nplot(p_values, p_adj_bh, main='BH/FDR',\n     xlab='Raw p', ylab='Adjusted p', pch=16)\nabline(h=0.05, col='red', lwd=1)\nabline(v=0.05, col='red', lwd=1)\n# ── Choose method ──────────────────────────────────\n# Bonferroni: ultra-conservative, use if false positives costly\n# Holm: better than Bonferroni, similar family-wise error control\n# BH/FDR: standard in modern research, allows ~5% false discoveries"
                  }
        ],
        tips: [
                  "Always adjust p-values when conducting multiple tests",
                  "BH/FDR is the modern default — controls false discovery rate at α",
                  "Bonferroni too conservative for large test sets (n > 50)",
                  "p.adjust(p, method=\"BH\") is the most common approach"
        ],
        mistake: "Running multiple tests without adjustment. If you run 20 tests at α=0.05, you expect 1 false positive by chance alone. Always use p.adjust().",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
    ],
  },

  // ── Section 3: Regression & Modeling ─────────────────────────────────────────
  {
    id: "regression-stats-r",
    title: "Regression & Modeling",
    entries: [
      {
        id: "simple-linear-regression",
        fn: "Simple Linear Regression: lm()",
        desc: "Fit y = β₀ + β₁x with diagnostics and predictions.",
        category: "R Statistics",
        subtitle: "lm(), summary(), confint(), predict(), plot()",
        signature: "lm(y ~ x, data=df)  |  predict(fit, newdata=df)",
        descLong: "lm() fits ordinary least squares. Returns coefficients, standard errors, t-stats, p-values, R², and F-statistic. plot() produces 4 diagnostic plots. confint() gives coefficient confidence intervals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Simple Linear Regression: lm() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data ────────────────────────────────────────\nset.seed(42)\ndf <- data.frame(\n  hours_studied = c(2, 3, 4, 5, 6, 7, 8, 9, 10, 11,\n                    3, 5, 6, 8, 9, 10, 7, 8, 4, 5),\n  exam_score = c(52, 64, 71, 79, 88, 92, 95, 98, 101, 103,\n                 66, 82, 85, 95, 98, 102, 89, 96, 72, 80) + rnorm(20, sd=2)\n)\n# ── Fit simple linear regression ────────────────────\nfit <- lm(exam_score ~ hours_studied, data=df)\n# ── Summary output ──────────────────────────────────\nsummary(fit)\n# Coefficients:\n#                Estimate Std. Error t value Pr(>|t|)\n# (Intercept)     45.3      5.2      8.74   2.1e-08 ***\n# hours_studied    5.2      0.7      7.43   9.3e-07 ***\n# R-squared:  0.745\n# ── Extract components ──────────────────────────────\ncoef(fit)               # [1] 45.3 5.2\ncoef(fit)['hours_studied']  # 5.2\nsummary(fit)$r.squared  # 0.745\nsummary(fit)$adj.r.squared  # 0.735\n# ── Confidence intervals for coefficients ─────────\nconfint(fit, level=0.95)\n#             2.5 %  97.5 %\n# (Intercept) 34.6   56.0\n# hours_studied 3.7  6.7\n# ── Fitted values and residuals ────────────────────\nfitted(fit)        # ŷ for each observation\nresiduals(fit)     # actual - predicted"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Simple Linear Regression: lm() — common patterns you'll see in production.\n# APPROACH  - Combine Simple Linear Regression: lm() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Make predictions on new data ────────────────────\nnew_data <- data.frame(hours_studied = c(6.5, 7.5, 8.5))\n# Point predictions:\npredict(fit, newdata=new_data)\n# 89.1 95.3 101.5\n# Prediction interval (future obs):\npredict(fit, newdata=new_data, interval=\"prediction\", level=0.95)\n#     fit  lwr   upr\n# 1  89.1 79.2  99.0\n# 2  95.3 85.4 105.2\n# 3 101.5 91.6 111.4\n# Confidence interval (mean prediction):\npredict(fit, newdata=new_data, interval=\"confidence\", level=0.95)\n#     fit  lwr   upr\n# 1  89.1 85.3  92.9\n# 2  95.3 92.1  98.5\n# 3 101.5 98.5 104.5\n# ── Diagnostic plots ────────────────────────────────\npar(mfrow=c(2,2))\nplot(fit)\n# Plot 1: Residuals vs Fitted (check linearity, homoscedasticity)\n# Plot 2: Normal Q-Q (check normality of residuals)\n# Plot 3: Scale-Location (sqrt(|resid|) vs fitted)\n# Plot 4: Residuals vs Leverage (identify influential points)\n# ── Check assumptions ──────────────────────────────\n# Normality of residuals:\nshapiro.test(residuals(fit))  # p > 0.05 is good"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Simple Linear Regression: lm() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Homogeneity of variance (Breusch-Pagan):\n# library(lmtest)\n# bptest(fit)  # p > 0.05 means homoscedastic\n# ── Scatterplot with regression line ────────────────\nplot(df$hours_studied, df$exam_score,\n     main='Exam Score vs Hours Studied',\n     xlab='Hours Studied', ylab='Exam Score',\n     pch=16, col='darkblue')\nabline(fit, col='red', lwd=2)\n# Add confidence band:\nnew_x <- seq(min(df$hours_studied), max(df$hours_studied), length=100)\npred_band <- predict(fit, newdata=data.frame(hours_studied=new_x),\n                     interval=\"confidence\")\nlines(new_x, pred_band[,2], col='red', lty=2)\nlines(new_x, pred_band[,3], col='red', lty=2)\n# ── Check for influential outliers ──────────────────\ncooks_d <- cooks.distance(fit)\nplot(cooks_d, main=\"Cook's Distance\",\n     ylab=\"Cook's Distance\", pch=16)\nabline(h=4/nrow(df), col='red', lty=2)\n# Points above red line may be influential\ninfluential <- which(cooks_d > 4/nrow(df))\nif (length(influential) > 0) {\n  df[influential, ]  # examine these rows\n}"
                  }
        ],
        tips: [
                  "Always run plot(fit) — the 4 diagnostic plots reveal model violations",
                  "prediction interval is wider than confidence interval (accounts for prediction uncertainty)",
                  "R² should increase with more predictors, but use adjusted R² or AIC to compare models",
                  "Check for influential points with cooks.distance() — remove or investigate"
        ],
        mistake: "Not checking diagnostic plots. Residuals should be normally distributed and have constant variance. Non-linear patterns indicate the model is misspecified.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "multiple-regression-r",
        fn: "Multiple Regression: lm() with Multiple Predictors",
        desc: "Fit model with multiple independent variables.",
        category: "R Statistics",
        subtitle: "lm(y ~ x1 + x2 + x3), AIC, step(), car::vif()",
        signature: "lm(y ~ x1 + x2 + x3)  |  step(fit, direction=\"both\")  |  car::vif(fit)",
        descLong: "Multiple regression: y ~ x1 + x2 + ... . Coefficients are partial effects (holding other variables constant). AIC/BIC for model comparison. step() for automatic model selection. VIF checks multicollinearity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Multiple Regression: lm() with Multiple Predictors — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data ────────────────────────────────────────\nset.seed(42)\nn <- 100\ndf <- data.frame(\n  salary = rnorm(n, 50000, 10000),\n  experience = rnorm(n, 8, 3),\n  education = rnorm(n, 14, 2),\n  performance_rating = rnorm(n, 3.5, 0.5)\n)\n# Simulate positive relationships:\ndf$salary <- 30000 + 2000*df$experience + 1500*df$education +\n             3000*df$performance_rating + rnorm(n, sd=5000)\n# ── Fit multiple regression ─────────────────────────\nfit <- lm(salary ~ experience + education + performance_rating,\n          data=df)\nsummary(fit)\n# Coefficients:\n#                   Estimate Std. Error t value Pr(>|t|)\n# (Intercept)       29887    5200     5.75   3.2e-08 ***\n# experience         1998     150    13.32   < 2e-16 ***\n# education         1502      320     4.69   7.8e-06 ***\n# performance_rating 2991     800     3.74   0.0003 ***\n#\n# R-squared:  0.968,  F-statistic: 985\n# ── Check multicollinearity ────────────────────────\nlibrary(car)\nvif(fit)  # Variance Inflation Factor\n# experience  education performance_rating\n#        1.2        1.3              1.1\n# All < 5, no serious multicollinearity"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Multiple Regression: lm() with Multiple Predictors — common patterns you'll see in production.\n# APPROACH  - Combine Multiple Regression: lm() with Multiple Predictors with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Correlation matrix ──────────────────────────────\ncor(df)\n# If predictors highly correlated (r > 0.8), multicollinearity\n# ── Model comparison with AIC/BIC ──────────────────\nfit1 <- lm(salary ~ experience, data=df)\nfit2 <- lm(salary ~ experience + education, data=df)\nfit3 <- lm(salary ~ experience + education + performance_rating, data=df)\nAIC(fit1, fit2, fit3)\n#     df      AIC\n# fit1  3  1492.5\n# fit2  4  1456.2\n# fit3  5  1389.1\n# Lower AIC is better; fit3 best\n# ── Automatic model selection (step) ────────────────\n# Forward selection:\nfit_null <- lm(salary ~ 1, data=df)\nstep(fit_null, scope=~experience + education + performance_rating,\n     direction=\"forward\")\n# Backward elimination:\nstep(fit3, direction=\"backward\")\n# Both directions:\nstep(fit3, direction=\"both\")\n# ── Predictions on new data ────────────────────────\nnew_data <- data.frame(\n  experience = c(5, 10, 15),\n  education = c(12, 14, 16),\n  performance_rating = c(3.0, 3.5, 4.0)\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Multiple Regression: lm() with Multiple Predictors — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\npredict(fit, newdata=new_data, interval=\"prediction\")\n#       fit   lwr    upr\n# 1  45021 34890  55152\n# 2  56788 46657  66919\n# 3  68555 58424  78686\n# ── Interaction terms ──────────────────────────────\nfit_int <- lm(salary ~ experience * education + performance_rating,\n              data=df)\n# Tests if effect of experience depends on education\n# ── Polynomial terms ───────────────────────────────\nfit_poly <- lm(salary ~ experience + I(experience^2) + education,\n               data=df)\n# I() prevents ^ from being interpreted as formula operator\n# ── Standardized coefficients ──────────────────────\n# Rescale to mean=0, sd=1 for comparison\ndf_scaled <- scale(df)\nfit_scaled <- lm(salary ~ experience + education + performance_rating,\n                 data=data.frame(df_scaled))\ncoef(fit_scaled)\n# Larger absolute value = stronger effect"
                  }
        ],
        tips: [
                  "VIF > 10 indicates serious multicollinearity; > 5 warrants investigation",
                  "step() does automated selection but can miss important predictors — use domain knowledge",
                  "Interaction (x1 * x2) includes x1, x2, and x1:x2; use it if theory suggests dependence",
                  "Standardized coefficients allow comparison of effect sizes across variables"
        ],
        mistake: "Adding correlated predictors without checking VIF. Multicollinearity inflates standard errors, making coefficients unreliable. Always compute vif() and investigate high values.",
        shorthand: {
          verbose: "fit <- lm(y ~ x1 + x2, data=df)\ncoefs <- coef(fit)\nsummary_obj <- summary(fit)\nr2 <- summary_obj$r.squared",
          concise: "fit <- lm(y ~ x1 + x2, data=df); summary(fit)",
        },
      },
      {
        id: "logistic-regression-r",
        fn: "Logistic Regression: glm(family=binomial)",
        desc: "Model binary outcomes with logistic regression.",
        category: "R Statistics",
        subtitle: "glm(y ~ x, family=binomial), odds ratios, ROC curves",
        signature: "glm(y ~ x, family=binomial)  |  predict(fit, type=\"response\")",
        descLong: "Logistic regression models P(Y=1|X). Coefficients are log-odds. exp(coef) gives odds ratios. predict(..., type=\"response\") gives probabilities 0-1. ROC curve assesses discrimination.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Logistic Regression: glm(family=binomial) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data ────────────────────────────────────────\nset.seed(42)\nn <- 200\ndf <- data.frame(\n  age = rnorm(n, 40, 15),\n  cholesterol = rnorm(n, 200, 50),\n  heart_disease = rbinom(n, 1, 0.3)\n)\n# Make relationship: older, higher cholesterol → higher risk\ndf$heart_disease <- ifelse(\n  df$age > 50 & df$cholesterol > 200, 1, df$heart_disease\n)\n# ── Fit logistic regression ────────────────────────\nfit_log <- glm(heart_disease ~ age + cholesterol,\n               family=binomial(link=\"logit\"), data=df)\nsummary(fit_log)\n# Coefficients:\n#              Estimate Std. Error z value Pr(>|z|)\n# (Intercept)  -8.52    1.20     -7.10   1.3e-12 ***\n# age           0.065   0.012     5.42   5.8e-08 ***\n# cholesterol   0.018   0.005     3.60   0.0003 ***\n# ── Predictions (probability) ──────────────────────\npred_probs <- predict(fit_log, type=\"response\")\nhead(pred_probs, 10)\n# Range: 0.05 to 0.89 (estimated probabilities)\n# Predictions for new data:\nnew_data <- data.frame(age = c(30, 50, 70),\n                       cholesterol = c(150, 200, 250))\npredict(fit_log, newdata=new_data, type=\"response\")\n# 0.12, 0.45, 0.88"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Logistic Regression: glm(family=binomial) — common patterns you'll see in production.\n# APPROACH  - Combine Logistic Regression: glm(family=binomial) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Convert to class predictions (threshold 0.5) ──\npred_class <- ifelse(pred_probs > 0.5, 1, 0)\n# ── Odds ratios ────────────────────────────────────\n# exp(coef): multiplicative increase in odds per unit increase\nexp(coef(fit_log))\n# (Intercept)           age   cholesterol\n# 0.0002 (intercept)   1.067      1.018\n# Interpretation:\n# - 1 year older: odds increase by 6.7%\n# - 10 mg/dL higher chol: odds increase by 18%\n# 95% CI for odds ratios:\nexp(confint(fit_log))\n#            2.5 %  97.5 %\n# (Intercept)  0.0  0.0001\n# age          1.04  1.09\n# cholesterol  1.01  1.03\n# ── Model evaluation: AIC / BIC ────────────────────\nAIC(fit_log)\nBIC(fit_log)\n# Compare to simpler model:\nfit_simple <- glm(heart_disease ~ age, family=binomial, data=df)\nAIC(fit_simple, fit_log)  # lower is better\n# ── ROC Curve and AUC ────────────────────────────────\nlibrary(pROC)  # or compute manually\n# Compute ROC:\nroc_obj <- roc(df$heart_disease, pred_probs)\nauc(roc_obj)  # Area Under Curve ≈ 0.82"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Logistic Regression: glm(family=binomial) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Plot ROC:\nplot(roc_obj, main=\"ROC Curve\",\n     xlab=\"1 - Specificity\", ylab=\"Sensitivity\")\n# Diagonal line (AUC=0.5) = random classifier\n# Higher curve = better discrimination\n# ── Confusion matrix ────────────────────────────────\npred_binary <- ifelse(pred_probs > 0.5, 1, 0)\ntable(actual=df$heart_disease, predicted=pred_binary)\n#       predicted\n# actual  0   1\n#      0 120  20\n#      1  32  28\n# Sensitivity = TP / (TP + FN) = 28 / (32 + 28) = 0.467\n# Specificity = TN / (TN + FP) = 120 / (120 + 20) = 0.857\n# ── Optimal threshold (maximize Youden's J) ────────\ncoords(roc_obj, \"best\")  # find threshold with max J\n# threshold=0.51, sensitivity=0.54, specificity=0.85\n# ── Visualization: predicted vs actual ─────────────\nplot(df$age, pred_probs, col=df$heart_disease+1,\n     pch=16, main=\"Predicted Probability by Age\",\n     xlab=\"Age\", ylab=\"P(Heart Disease)\")\nlegend(\"topleft\", c(\"No Disease\", \"Disease\"),\n       col=c(1, 2), pch=16)"
                  }
        ],
        tips: [
                  "Logistic coefficients are log-odds; exponentiate for interpretability",
                  "predict(..., type=\"response\") for probabilities; type=\"link\" for log-odds",
                  "Choose threshold based on cost-benefit: lower threshold = higher sensitivity, lower specificity",
                  "ROC curve and AUC assess discrimination independent of threshold"
        ],
        mistake: "Interpreting logistic coefficients as probabilities. They are log-odds. Exponentiate to get odds ratios. For probabilities, use predict(..., type=\"response\").",
        shorthand: {
          verbose: "fit <- lm(y ~ x1 + x2, data=df)\ncoefs <- coef(fit)\nsummary_obj <- summary(fit)\nr2 <- summary_obj$r.squared",
          concise: "fit <- lm(y ~ x1 + x2, data=df); summary(fit)",
        },
      },
      {
        id: "cross-validation-r",
        fn: "Cross-Validation: k-fold and LOOCV",
        desc: "Assess model performance with proper train/test splits.",
        category: "R Statistics",
        subtitle: "caret::train() with cv, tidymodels::fit_resamples(), manual k-fold",
        signature: "caret::train(y ~ ., method=\"lm\", trControl=trainControl(method=\"cv\"))",
        descLong: "k-fold CV splits data k ways, trains on k-1 folds, tests on 1. LOOCV leaves one out. Bootstrap resampling. Provides honest estimate of future performance without test set inflation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Cross-Validation: k-fold and LOOCV — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data ────────────────────────────────────────\nset.seed(42)\nn <- 100\ndf <- data.frame(\n  x1 = rnorm(n),\n  x2 = rnorm(n),\n  x3 = rnorm(n),\n  y = rnorm(n)  # y = noise, no true signal\n)\ndf$y <- 2*df$x1 - 1.5*df$x2 + 0.5*df$x3 + rnorm(n, sd=1)\n# ── Manual 5-fold cross-validation ──────────────────\nk <- 5\nfolds <- cut(seq(1, n), breaks=k, labels=FALSE)\nset.seed(42)\nfolds <- sample(folds)\nrmse_cv <- numeric(k)\nfor (i in 1:k) {\n  test_idx <- which(folds == i)\n  train_idx <- which(folds != i)\n  fit <- lm(y ~ x1 + x2 + x3, data=df[train_idx, ])\n  pred <- predict(fit, newdata=df[test_idx, ])\n  rmse_cv[i] <- sqrt(mean((df$y[test_idx] - pred)^2))\n}\nmean(rmse_cv)    # Average RMSE across folds\nsd(rmse_cv)      # Variability\n# ── Using caret package (easier) ────────────────────\nlibrary(caret)\n# Define CV: 5-fold\nctrl <- trainControl(method=\"cv\", number=5,\n                     savePredictions=\"final\")\nfit_cv <- train(y ~ x1 + x2 + x3,\n                data=df,\n                method=\"lm\",\n                trControl=ctrl)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Cross-Validation: k-fold and LOOCV — common patterns you'll see in production.\n# APPROACH  - Combine Cross-Validation: k-fold and LOOCV with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Results:\nfit_cv$results\n# RMSE       Rsquared       MAE\n# 1.05       0.73         0.82\n# ── LOOCV (Leave-One-Out CV) ──────────────────────\n# Expensive for large n, but gives variance estimate\nctrl_loocv <- trainControl(method=\"LOOCV\")\nfit_loocv <- train(y ~ x1 + x2 + x3,\n                   data=df,\n                   method=\"lm\",\n                   trControl=ctrl_loocv)\nfit_loocv$results  # single row result\n# ── Bootstrap resampling ───────────────────────────\nctrl_boot <- trainControl(method=\"boot\", number=100)\nfit_boot <- train(y ~ x1 + x2 + x3,\n                  data=df,\n                  method=\"lm\",\n                  trControl=ctrl_boot)\nfit_boot$results  # average across 100 bootstrap samples\n# ── Extract predictions from CV ────────────────────\ncv_preds <- fit_cv$pred\nhead(cv_preds)\n# rowIndex: which fold each observation was in\n# pred: prediction from model fit without that observation\n# obs: actual value\n# Compute R² from CV predictions:\n1 - sum((cv_preds$obs - cv_preds$pred)^2) / sum((cv_preds$obs - mean(cv_preds$obs))^2)\n# ── Plot CV results ────────────────────────────────\nplot(cv_preds$obs, cv_preds$pred,\n     main=\"5-Fold CV: Predicted vs Actual\",\n     xlab=\"Actual\", ylab=\"Predicted\", pch=16)\nabline(0, 1, col=\"red\", lwd=2)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Cross-Validation: k-fold and LOOCV — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Compare models with nested CV ──────────────────\n# Tuning hyperparameters: use inner CV\n# Evaluating final model: use outer CV\n# (prevents overfitting to validation set)\n# Inner CV for tuning:\ninner_ctrl <- trainControl(method=\"cv\", number=5)\n# Outer CV for evaluation:\nouter_ctrl <- trainControl(method=\"cv\", number=10)\n# For each outer fold:\nouter_results <- numeric(10)\nfor (i in 1:10) {\n  # Split outer fold\n  test_idx <- which(outer_ctrl$indexOut[[i]])\n  train_idx <- setdiff(1:n, test_idx)\n  # Tune on train set:\n  fit_tuned <- train(y ~ x1 + x2 + x3,\n                     data=df[train_idx, ],\n                     method=\"lm\",\n                     trControl=inner_ctrl)\n  # Evaluate on test set:\n  pred <- predict(fit_tuned, newdata=df[test_idx, ])\n  outer_results[i] <- sqrt(mean((df$y[test_idx] - pred)^2))\n}\nmean(outer_results)  # Honest estimate of test RMSE"
                  }
        ],
        tips: [
                  "Never use test set during tuning — use CV instead",
                  "Nested CV (inner for tuning, outer for evaluation) prevents overfitting to validation set",
                  "k=5 or k=10 is typical; LOOCV is exact but computationally expensive",
                  "Bootstrap resampling works well for small samples"
        ],
        mistake: "Tuning hyperparameters on the test set. This inflates performance estimates. Always use CV on training data only. Evaluate final model on held-out test set once.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "bootstrap-r",
        fn: "Bootstrap: Resampling for Confidence Intervals",
        desc: "Use bootstrap to estimate confidence intervals for any statistic.",
        category: "R Statistics",
        subtitle: "boot::boot() for resampling, percentile and BCa methods",
        signature: "boot(data, statistic, R=1000)  |  boot.ci(boot_result)",
        descLong: "Bootstrap resamples with replacement from data R times. For each resample, computes statistic. Result: empirical distribution of statistic, confidence intervals, no distribution assumptions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Bootstrap: Resampling for Confidence Intervals — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data ────────────────────────────────────────\nset.seed(42)\ndata <- c(85, 88, 86, 87, 84, 89, 87, 88, 86, 85,\n          92, 95, 91, 94, 90, 93, 92, 94, 91, 92)\n# ── Bootstrap for the mean ──────────────────────────\nlibrary(boot)\nboot_mean <- function(data, indices) {\n  mean(data[indices])\n}\nboot_result <- boot(data, boot_mean, R=5000)\n# Results:\nprint(boot_result)\n# Bootstrap Statistics:\n#   original      bias   std. error\n# t1*    89.75 -0.0235      0.637\n# 95% CI (percentile method):\nquantile(boot_result$t, c(0.025, 0.975))\n# 2.5%    97.5%\n# 88.53   91.10\n# ── boot.ci: multiple CI methods ────────────────────\nboot_ci <- boot.ci(boot_result, type=c(\"perc\", \"bca\"))\n# Percentile:\nboot_ci$percent\n# 2.5%    97.5%\n# 88.50   91.15\n# BCa (bias-corrected, accelerated):\nboot_ci$bca\n# 2.5%    97.5%\n# 88.45   91.25"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Bootstrap: Resampling for Confidence Intervals — common patterns you'll see in production.\n# APPROACH  - Combine Bootstrap: Resampling for Confidence Intervals with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Bootstrap for the median (robust) ──────────────\nboot_median <- function(data, indices) {\n  median(data[indices])\n}\nboot_med <- boot(data, boot_median, R=5000)\nboot.ci(boot_med, type=\"bca\")\n# ── Bootstrap for correlation ──────────────────────\nx <- 1:20 + rnorm(20, sd=2)\ny <- 2 + 1.5*x + rnorm(20, sd=5)\ndata_xy <- cbind(x, y)\nboot_cor <- function(data, indices) {\n  cor(data[indices, 1], data[indices, 2])\n}\nboot_cor_result <- boot(data_xy, boot_cor, R=5000)\nboot.ci(boot_cor_result, type=\"bca\")\n# ── Bootstrap for regression coefficient ────────────\nboot_slope <- function(data, indices) {\n  fit <- lm(y ~ x, data=data.frame(data[indices, ]))\n  coef(fit)[2]\n}\nboot_slope_result <- boot(data_xy, boot_slope, R=5000)\nboot.ci(boot_slope_result, type=\"bca\")\n# ── Visualizing bootstrap distribution ──────────────\npar(mfrow=c(2,2))\nhist(boot_result$t, breaks=50, col='skyblue',\n     main='Bootstrap Distribution of Mean',\n     xlab='Mean')\nabline(v=quantile(boot_result$t, c(0.025, 0.975)),\n       col='red', lwd=2)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Bootstrap: Resampling for Confidence Intervals — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nhist(boot_med$t, breaks=50, col='lightgreen',\n     main='Bootstrap Distribution of Median',\n     xlab='Median')\nhist(boot_cor_result$t, breaks=50, col='salmon',\n     main='Bootstrap Distribution of Correlation',\n     xlab='Correlation')\nhist(boot_slope_result$t, breaks=50, col='gold',\n     main='Bootstrap Distribution of Slope',\n     xlab='Slope')\n# ── Adjusted bootstrap confidence interval (BCa) ─────\n# BCa accounts for:\n# 1. Bias: if bootstrap mean ≠ sample statistic\n# 2. Acceleration: skewness of bootstrap distribution\n# Why BCa > percentile:\n# - Percentile assumes symmetric bootstrap distribution\n# - BCa adjusts for skewness, more accurate boundaries\n# For skewed statistics (correlation, ratio), BCa better\n# For symmetric statistics (mean), percentile ≈ BCa\n# ── Check bootstrap variability ────────────────────\n# Standard error of bootstrap:\nsd(boot_result$t)  # ~0.637\n# From parametric (t-test):\nt_se <- sd(data) / sqrt(length(data))  # ~0.609\n# Similar, but bootstrap doesn't assume normality"
                  }
        ],
        tips: [
                  "Bootstrap needs R ≥ 1000, typically R=5000 for CI",
                  "BCa is more accurate than percentile for skewed distributions",
                  "Bootstrap is model-free — works for medians, quantiles, correlations, any statistic",
                  "Always visualize bootstrap distribution for sanity checks"
        ],
        mistake: "Using percentile method for highly skewed statistics. Use BCa instead, which corrects for bias and skewness.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "effect-size-r",
        fn: "Effect Size: Cohen's d, Eta-Squared, Cramér's V",
        desc: "Quantify magnitude of effects beyond p-values.",
        category: "R Statistics",
        subtitle: "effsize::cohen.d(), lsr::etaSquared(), rcompanion::cramerV()",
        signature: "cohen.d(x, y)  |  etaSquared(fit)  |  cramerV(table)",
        descLong: "p-values tell if effect exists; effect size tells magnitude. Cohen's d for means (d=0.2 small, 0.5 medium, 0.8 large). Eta² for ANOVA (proportion variance). Cramér's V for categorical (0-1 scale).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Effect Size: Cohen's d, Eta-Squared, Cramér's V — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Cohen's d (difference between means) ───────────────\nlibrary(effsize)\ncontrol  <- c(95, 98, 100, 97, 99, 96, 101, 98, 99, 97)\ntreatment <- c(105, 108, 110, 107, 112, 106, 111, 109, 113, 108)\n# Compute Cohen's d:\nd <- cohen.d(treatment, control)\nd\n# Cohen's d = 2.35\n# Interpretation:\n# d = 0.2: small\n# d = 0.5: medium\n# d = 0.8: large\n# d = 2.35: very large (treatment >> control)\n# Manual calculation (pooled sd):\nm1 <- mean(control)\nm2 <- mean(treatment)\ns1 <- sd(control)\ns2 <- sd(treatment)\nn1 <- length(control)\nn2 <- length(treatment)\nsp <- sqrt(((n1-1)*s1^2 + (n2-1)*s2^2) / (n1 + n2 - 2))\ncohens_d_manual <- (m2 - m1) / sp  # 2.35\n# ── Eta-squared (proportion of variance explained) ──\nlibrary(lsr)\ndf <- data.frame(\n  score = c(85, 88, 86, 87, 84, 89, 87, 88, 86, 85,\n            92, 95, 91, 94, 90, 93, 92, 94, 91, 92,\n            78, 81, 79, 80, 77, 82, 80, 81, 79, 78),\n  method = rep(c('Method_A', 'Method_B', 'Method_C'), each=10)\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Effect Size: Cohen's d, Eta-Squared, Cramér's V — common patterns you'll see in production.\n# APPROACH  - Combine Effect Size: Cohen's d, Eta-Squared, Cramér's V with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfit <- aov(score ~ method, data=df)\neta2 <- etaSquared(fit)\neta2\n#          eta.sq eta.sq.part\n# method 0.66     0.66\n# η² = 0.66: 66% of variance explained by method\n# Interpretation:\n# η² = 0.01: small\n# η² = 0.06: medium\n# η² = 0.14: large\n# ── Partial eta-squared ────────────────────────────\n# Used when multiple factors (controls for others)\n# η²_partial = SS_effect / (SS_effect + SS_residual)\n# ── Cramér's V (association for 2D tables) ────────\nlibrary(rcompanion)\ntbl <- table(\n  c('Yes', 'Yes', 'No', 'Yes', 'No', 'Yes', 'No', 'Yes',\n    'No', 'Yes', 'Yes', 'No', 'Yes', 'No', 'Yes'),\n  c('A', 'A', 'A', 'B', 'B', 'B', 'B', 'C',\n    'C', 'C', 'C', 'D', 'D', 'D', 'D')\n)\nv <- cramerV(tbl)\nv  # 0.52\n# Interpretation (2×2 table):\n# V = 0.1: small\n# V = 0.3: medium\n# V = 0.5: large"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Effect Size: Cohen's d, Eta-Squared, Cramér's V — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Summary table: effect sizes ────────────────────\neffects_table <- data.frame(\n  Effect = c(\"Cohen's d (means)\", \"Eta² (ANOVA)\", \"Cramér's V (cat)\"),\n  Small = c(0.2, 0.01, 0.1),\n  Medium = c(0.5, 0.06, 0.3),\n  Large = c(0.8, 0.14, 0.5)\n)\nprint(effects_table)\n# ── Always report effect size with p-value ──────────\n# p-value: is there an effect?\n# Effect size: how big is it?\n# Example:\n# \"t-test showed treatment improved scores (d=1.2, p=0.001)\"\n# vs\n# \"t-test showed treatment effect (p=0.001)\" [without d]\n# The first is much more informative!\n# ── Power calculation based on effect size ──────────\nlibrary(pwr)\n# Compute power for d=0.5, α=0.05, n=64:\npwr.t.test(n=64, d=0.5, sig.level=0.05)\n# power = 0.95\n# Compute sample size for d=0.5, power=0.8:\npwr.t.test(d=0.5, sig.level=0.05, power=0.8)\n# n = 64.1 (need 64 per group)"
                  }
        ],
        tips: [
                  "Always report effect size alongside p-value — effect size is scale-independent",
                  "Cohen's d, η², Cramér's V all have standardized interpretation guidelines",
                  "Effect size is crucial for power analysis and sample size planning",
                  "Large effect: small n sufficient; small effect: large n needed for power"
        ],
        mistake: "Reporting p-value without effect size. p < 0.05 just says effect exists. Effect size tells you if it's meaningful. A tiny effect can have p < 0.05 with large n.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "power-analysis-r",
        fn: "Power Analysis: pwr package",
        desc: "Plan sample sizes and evaluate statistical power.",
        category: "R Statistics",
        subtitle: "pwr::pwr.t.test(), pwr.anova.test(), pwr.chisq.test()",
        signature: "pwr.t.test(n=NULL, d, sig.level=0.05, power=0.8)",
        descLong: "Power = P(reject H0 | H1 true). pwr package computes: given 3 of 4 (n, d, α, power), solve for the 4th. Typical: power=0.8, α=0.05. Always plan study with power analysis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Power Analysis: pwr package — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── One-sample t-test power ────────────────────────────\nlibrary(pwr)\n# Compute n for Cohen's d=0.5, power=0.8, α=0.05:\nresult <- pwr.t.test(d=0.5, sig.level=0.05, power=0.8,\n                     type=\"one.sample\")\nresult\n# n = 33.36 (need 34 per group)\n# Compute power for n=25, d=0.5:\npwr.t.test(n=25, d=0.5, sig.level=0.05, type=\"one.sample\")\n# power = 0.74\n# Compute detectable d for n=40, power=0.8:\npwr.t.test(n=40, sig.level=0.05, power=0.8,\n           type=\"one.sample\")\n# d = 0.463\n# ── Two-sample t-test (unpaired) ───────────────────\n# Equal sample sizes per group:\npwr.t.test(d=0.5, sig.level=0.05, power=0.8,\n           type=\"two.sample\")\n# n = 63.76 (need 64 per group, 128 total)\n# Unequal sample sizes:\npwr.t.test(n1=50, n2=100, d=0.5, sig.level=0.05,\n           type=\"two.sample\")\n# power = 0.845\n# ── Paired t-test ──────────────────────────────────\npwr.t.test(d=0.5, sig.level=0.05, power=0.8,\n           type=\"paired\")\n# n = 33.36 (paired usually needs fewer subjects)\n# ── ANOVA (k groups) ────────────────────────────────\n# f = effect size for ANOVA (related to η²)\n# f = sqrt(η² / (1 - η²))\n# f = 0.1 (small), 0.25 (medium), 0.4 (large)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Power Analysis: pwr package — common patterns you'll see in production.\n# APPROACH  - Combine Power Analysis: pwr package with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\npwr.anova.test(k=3, f=0.25, sig.level=0.05, power=0.8)\n# n = 51.98 (need 52 per group, 156 total)\n# Compute power for 3 groups, n=40, f=0.25:\npwr.anova.test(k=3, n=40, f=0.25, sig.level=0.05)\n# power = 0.76\n# ── Chi-squared test ────────────────────────────────\n# w = effect size (like Cramér's V)\n# w = 0.1 (small), 0.3 (medium), 0.5 (large)\npwr.chisq.test(w=0.3, df=2, sig.level=0.05, power=0.8)\n# N = 88.46 (need 88-89 total observations)\n# ── Correlation test ───────────────────────────────\npwr.r.test(r=0.3, sig.level=0.05, power=0.8)\n# n = 84.65 (need 85 subjects)\n# ── Graphical power analysis ────────────────────────\n# Plot power across range of sample sizes:\nn_seq <- seq(10, 200, by=10)\npower_seq <- numeric(length(n_seq))\nfor (i in seq_along(n_seq)) {\n  power_seq[i] <- pwr.t.test(n=n_seq[i], d=0.5, sig.level=0.05,\n                             type=\"two.sample\")$power\n}\nplot(n_seq, power_seq, type='l', lwd=2,\n     main='Power vs Sample Size (d=0.5, two-sample)',\n     xlab='Sample Size per Group', ylab='Power')\nabline(h=0.8, col='red', lty=2)\nabline(v=64, col='blue', lty=2)\ngrid()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Power Analysis: pwr package — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Power vs effect size ───────────────────────────\nd_seq <- seq(0.2, 1.5, by=0.1)\npower_by_d <- numeric(length(d_seq))\nfor (i in seq_along(d_seq)) {\n  power_by_d[i] <- pwr.t.test(n=50, d=d_seq[i], sig.level=0.05,\n                              type=\"two.sample\")$power\n}\nplot(d_seq, power_by_d, type='l', lwd=2,\n     main='Power vs Effect Size (n=50, two-sample)',\n     xlab=\"Cohen's d\", ylab='Power')\nabline(h=0.8, col='red', lty=2)\ngrid()\n# ── Summary: sample size planning ──────────────────\n# 1. Specify effect size (d=0.5 if unsure, from prior research)\n# 2. Choose α=0.05, power=0.8 (standard)\n# 3. Use pwr.t.test() to compute n\n# 4. Collect data with adequate n\n# 5. Report effect size in results\nplanning_summary <- data.frame(\n  comparison = c(\"One-sample\", \"Two-sample\", \"Paired\", \"ANOVA (3 groups)\"),\n  effect_size = c(\"d=0.5\", \"d=0.5\", \"d=0.5\", \"f=0.25\"),\n  power_0_8 = c(34, 64, 34, 52)\n)\nprint(planning_summary)"
                  }
        ],
        tips: [
                  "Always plan sample size BEFORE collecting data",
                  "d=0.5 is \"medium\" effect — use if no prior research",
                  "Power=0.8 means 80% chance of detecting true effect",
                  "Two-sample needs more subjects than paired (fewer per-subject variation)"
        ],
        mistake: "Running study without power analysis. Small sample, small power = easy to miss true effects. Always compute required n up front.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "bayesian-r",
        fn: "Bayesian Linear Model: rstanarm",
        desc: "Fit Bayesian regression with prior specification.",
        category: "R Statistics",
        subtitle: "stan_glm(), posterior samples, credible intervals",
        signature: "stan_glm(y ~ x, family=gaussian, data=df, prior=...)",
        descLong: "Bayesian regression: posterior ∝ likelihood × prior. rstanarm provides easy interface. Returns posterior samples (not point estimates). Credible intervals from quantiles of posterior. Prior encodes prior belief.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Bayesian Linear Model: rstanarm — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Sample data ────────────────────────────────────────\nset.seed(42)\nn <- 50\ndf <- data.frame(\n  x = rnorm(n, 5, 2),\n  y = rnorm(n)\n)\ndf$y <- 2 + 0.5*df$x + rnorm(n, sd=1)\n# ── Frequentist comparison ──────────────────────────\nfit_freq <- lm(y ~ x, data=df)\nsummary(fit_freq)\n# Coefficients: (Intercept) 1.85, x: 0.47, R²: 0.32\n# ── Bayesian linear model (rstanarm) ────────────────\nlibrary(rstanarm)\n# Default: weakly informative priors\nfit_bayes <- stan_glm(y ~ x, family=gaussian,\n                      data=df,\n                      chains=2,  # MCMC chains\n                      iter=2000, # iterations per chain\n                      cores=2)   # parallel chains\n# Posterior summary:\nprint(fit_bayes)\n# Median posterior estimates similar to frequentist\n# With credible intervals from posterior samples\n# ── Custom priors ──────────────────────────────────\n# prior_intercept: distribution for intercept\n# prior: distribution for slopes\nfit_bayes_custom <- stan_glm(\n  y ~ x,\n  family=gaussian,\n  data=df,\n  prior=normal(location=0.5, scale=1),  # slope: centered at 0.5\n  prior_intercept=normal(location=2, scale=2),\n  chains=2, iter=2000, cores=2\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Bayesian Linear Model: rstanarm — common patterns you'll see in production.\n# APPROACH  - Combine Bayesian Linear Model: rstanarm with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Extract posterior samples ──────────────────────\nposterior_samples <- as.matrix(fit_bayes)\nhead(posterior_samples)\n#   (Intercept)      x        sigma\n# 1      1.723  0.476      1.087\n# 2      1.901  0.458      1.015\n# ... (2000 samples per chain)\n# ── Credible intervals from posterior ──────────────\n# 95% credible interval:\nquantile(posterior_samples[, 'x'], c(0.025, 0.975))\n# 2.5%    97.5%\n# 0.210   0.752\n# ── Posterior mean and sd ──────────────────────────\ncolMeans(posterior_samples)  # posterior means\napply(posterior_samples, 2, sd)  # posterior sds\n# ── Visualize posterior ────────────────────────────\npar(mfrow=c(1, 2))\n# Trace plots (MCMC diagnostics):\nplot(fit_bayes, plotfun=\"trace\", ask=FALSE)\n# Posterior distribution:\nhist(posterior_samples[, 'x'], breaks=50, col='skyblue',\n     main='Posterior Distribution of Slope',\n     xlab='Coefficient Value')\nabline(v=quantile(posterior_samples[, 'x'], c(0.025, 0.975)),\n       col='red', lwd=2)\n# ── Posterior predictive distribution ──────────────\n# Predict for new x value:\nnew_data <- data.frame(x=5)\npred_dist <- posterior_predict(fit_bayes, newdata=new_data)\n# 4000 posterior samples for prediction"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Bayesian Linear Model: rstanarm — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Posterior predictive CI:\nquantile(pred_dist, c(0.025, 0.975))\n# 2.5%    97.5%\n# 1.45    5.82\n# Compare: confidence interval (frequentist)\n# vs credible interval (Bayesian) vs predictive dist\n# ── Posterior predictive check ──────────────────────\n# Do posterior samples match observed data distribution?\npp_check(fit_bayes, nreps=100)\n# Overlay observed y distribution with draws from posterior\n# ── Extract posterior draws (tidybayes) ────────────\nlibrary(tidybayes)\nfit_bayes %>%\n  spread_draws(x, sigma) %>%\n  head(10)\n# Easy format for plotting and summarizing\n# ── Bayesian vs Frequentist comparison ─────────────\ncomparison <- data.frame(\n  Parameter = c(\"Intercept\", \"Slope\"),\n  Freq_Estimate = coef(fit_freq),\n  Bayes_Posterior_Mean = colMeans(posterior_samples)[1:2],\n  Freq_95CI_Lower = confint(fit_freq)[, 1],\n  Freq_95CI_Upper = confint(fit_freq)[, 2],\n  Bayes_95CI_Lower = quantile(posterior_samples[, '(Intercept)'], 0.025),\n  Bayes_95CI_Upper = quantile(posterior_samples[, '(Intercept)'], 0.975)\n)\nprint(comparison)"
                  }
        ],
        tips: [
                  "Weakly informative priors usually recommended — enough info for stability, not strong bias",
                  "Posterior samples allow any computation (functions of parameters, predictions)",
                  "Credible intervals have intuitive interpretation: \"95% probability parameter in interval\"",
                  "Bayesian naturally handles uncertainty propagation to predictions"
        ],
        mistake: "Confusing Bayesian credible interval with frequentist confidence interval. CI: long-run proportion; Credible interval: posterior probability given observed data.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
    ],
  },
]

export default { meta, sections }
