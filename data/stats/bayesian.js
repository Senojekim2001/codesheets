export const meta = {
  "title": "Bayesian & Estimation",
  "domain": "stats",
  "sheet": "bayesian",
  "icon": "📈"
}

export const sections = [

  // ── Section 1: Estimation, Bayesian & Mixed Effects ─────────────────────────────────────────
  {
    id: "estimation-bayesian-mixed",
    title: "Estimation, Bayesian & Mixed Effects",
    entries: [
      {
        id: "mle",
        fn: "Maximum Likelihood Estimation (MLE)",
        desc: "Find the parameter values that make the observed data most probable.",
        category: "Estimation",
        subtitle: "Maximize L(θ|data) = Π f(xᵢ|θ) — or equivalently the log-likelihood",
        signature: "L(θ) = Πf(xᵢ|θ)  |  ℓ(θ) = Σlog f(xᵢ|θ)  |  dℓ/dθ = 0",
        descLong: "MLE finds the parameter θ that maximizes the probability of observing the data we actually observed. In practice, maximize the log-likelihood (sum not product — numerically stable). MLE estimators are consistent, asymptotically normal, and asymptotically efficient (achieve Cramér-Rao lower bound).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Maximum Likelihood Estimation (MLE) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Principle ────────────────────────────────────────────\nData: x₁, x₂, ..., xₙ  iid from f(x|θ)\nLikelihood:     L(θ) = Π f(xᵢ|θ)\nLog-likelihood: ℓ(θ) = Σ log f(xᵢ|θ)\nMLE: θ̂ = argmax ℓ(θ)  →  solve dℓ/dθ = 0"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Maximum Likelihood Estimation (MLE) — common patterns you'll see in production.\n# APPROACH  - Combine Maximum Likelihood Estimation (MLE) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Example 1: Normal mean (σ² known) ────────────────────\nf(x|μ) = (1/σ√2π) exp(-(x-μ)²/2σ²)\nℓ(μ)   = -n log(σ√2π) - Σ(xᵢ-μ)²/(2σ²)\ndℓ/dμ  = Σ(xᵢ-μ)/σ² = 0\n→ θ̂ = μ̂ = (1/n)Σxᵢ = x̄   ← sample mean is MLE!"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Maximum Likelihood Estimation (MLE) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Example 2: Binomial proportion ───────────────────────,k successes in n trials: L(p) = C(n,k) · pᵏ(1-p)^(n-k),ℓ(p) = k·log(p) + (n-k)·log(1-p)  + const,,dℓ/dp = k/p - (n-k)/(1-p) = 0,,→ p̂ = k/n   ← sample proportion is MLE!,\n── Example 3: Exponential rate ──────────────────────────,f(x|λ) = λe^(-λx),ℓ(λ)   = n·log(λ) - λ·Σxᵢ,,dℓ/dλ  = n/λ - Σxᵢ = 0,,→ λ̂ = n/Σxᵢ = 1/x̄   ← reciprocal of sample mean,\n── Properties of MLE ────────────────────────────────────,Consistency:    θ̂ → θ as n→∞,Asymptotic normality: √n(θ̂-θ) → N(0, 1/I(θ)),Invariance: if θ̂ is MLE of θ, then g(θ̂) is MLE of g(θ),Efficiency: achieves Cramér-Rao bound asymptotically,\n── Fisher Information ────────────────────────────────────,I(θ) = E[-(d²logf/dθ²)] = E[(d logf/dθ)²],Cramér-Rao: Var(θ̂) ≥ 1/(n·I(θ)) for any unbiased estimator"
                  }
        ],
        tips: [
                  "Always work with log-likelihood — products become sums, avoiding numerical underflow with many observations",
                  "MLE is **biased** for small samples in some cases (e.g., σ̂²_MLE = Σ(xᵢ-x̄)²/n, not /n-1). Use method of moments for unbiased estimates",
                  "When closed form doesn't exist, maximize numerically: `optim()` in R, `scipy.optimize` in Python",
                  "Profile likelihood: plot ℓ(θ) vs θ — the shape reveals uncertainty. Flat = poorly identified; sharp peak = well identified"
        ],
        mistake: "Maximizing the likelihood instead of log-likelihood numerically. Products of many probabilities underflow to 0 in floating-point arithmetic. Always use log-likelihood in computation.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "bootstrap",
        fn: "Bootstrap & Resampling",
        desc: "Estimate sampling distributions and confidence intervals without formulas.",
        category: "Estimation",
        subtitle: "Resample with replacement to approximate the sampling distribution of any statistic",
        signature: "θ̂* = stat(resample(data, n, replace=TRUE))  × B times",
        descLong: "The bootstrap approximates the sampling distribution of any statistic by resampling with replacement from the original data. It requires no distributional assumptions and works for complex statistics (medians, correlations, regression coefficients) where analytic formulas are unavailable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Bootstrap & Resampling — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Bootstrap Algorithm ───────────────────────────────────\n1. Compute observed statistic: θ̂ = stat(x₁,...,xₙ)\n2. For b = 1 to B (typically B = 1000-10000):\n   a. Draw bootstrap sample x*₁,...,x*ₙ\n      (sample n values WITH REPLACEMENT from original data)\n   b. Compute θ̂*ᵦ = stat(x*₁,...,x*ₙ)\n3. Use {θ̂*₁,...,θ̂*_B} as approximate sampling distribution"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Bootstrap & Resampling — common patterns you'll see in production.\n# APPROACH  - Combine Bootstrap & Resampling with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Bootstrap Standard Error ─────────────────────────────\nSE_boot = SD({θ̂*₁,...,θ̂*_B}) = √(Σ(θ̂*ᵦ - θ̄*)²/(B-1))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Bootstrap & Resampling — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Bootstrap Confidence Intervals ───────────────────────,,Method 1 — Percentile CI (simplest):,  [θ̂*(α/2), θ̂*(1-α/2)]  ← 2.5th and 97.5th percentiles,,Method 2 — Basic (reversed) CI:,  [2θ̂ - θ̂*(1-α/2), 2θ̂ - θ̂*(α/2)],,Method 3 — BCa (bias-corrected and accelerated — best):,  Adjusts for bias and skewness in bootstrap distribution,  Use for small samples and skewed statistics,\n── Example: CI for median ───────────────────────────────,Data: [14, 22, 35, 42, 18, 55, 28, 31],Observed median: 29.5,,Bootstrap samples (5 shown of 2000):,[22,14,42,31,55,22,35,28] → median 28,[55,42,18,31,35,22,42,22] → median 37,[35,14,14,31,18,22,55,42] → median 28,...,Boot medians: 25.0, 28.5, 31.0, ... (2000 values),95% percentile CI: [20.5, 42.0],\n── When to use bootstrap ────────────────────────────────,✓ Statistic has no closed-form SE (ratio, max, quantile),✓ Small samples where asymptotic theory is unreliable,✓ Complex statistics (regression + transformation),✗ Dependent data (time series needs block bootstrap),✗ Extrapolation beyond data range"
                  }
        ],
        tips: [
                  "B=1000 for quick SE estimates; B=10000 for stable CI endpoints — more is better but diminishing returns",
                  "BCa intervals are generally the most accurate bootstrap CI method — use them when available (`boot` package in R)",
                  "The bootstrap cannot invent information — it works by exploiting what's already in the data, not by creating new data",
                  "For time series, use **block bootstrap** — preserves temporal dependence structure"
        ],
        mistake: "Resampling without replacement — that's just another sample of the same data, not a bootstrap. The bootstrap MUST sample with replacement to simulate the variability of repeatedly drawing from the population.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "bayesian-inference",
        fn: "Bayesian Inference",
        desc: "Treat parameters as random variables — update priors with data to get posteriors.",
        category: "Bayesian",
        subtitle: "Prior × Likelihood ∝ Posterior | Credible intervals vs confidence intervals",
        signature: "p(θ|data) ∝ p(data|θ)·p(θ)  |  Posterior ∝ Likelihood × Prior",
        descLong: "Bayesian inference treats the parameter θ as a random variable with a prior distribution reflecting pre-data beliefs. The posterior p(θ|data) updates the prior using the likelihood. Credible intervals directly answer 'what range contains θ with 95% probability' — the natural interpretation people wrongly attach to frequentist CIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Bayesian Inference — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Framework ────────────────────────────────────────────\np(θ|data) = p(data|θ) · p(θ)\n             ───────────────────\n                  p(data)\nPosterior ∝ Likelihood × Prior\n(∝ means 'proportional to' — p(data) is a normalizing constant)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Bayesian Inference — common patterns you'll see in production.\n# APPROACH  - Combine Bayesian Inference with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Conjugate priors (posterior has same family as prior) ─\nLikelihood   Prior          Posterior\nBinomial     Beta(α,β)      Beta(α+k, β+n-k)\nPoisson      Gamma(α,β)     Gamma(α+Σxᵢ, β+n)\nNormal(σ²)   Normal(μ₀,τ²) Normal(weighted combo)\nNormal(μ)    InvGamma       InvGamma"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Bayesian Inference — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Beta-Binomial example ────────────────────────────────,Prior belief: conversion rate p ~ Beta(2, 8)  (expect ~20%),Prior mean = 2/(2+8) = 20%,,Observed data: 15 conversions in 100 visits,Likelihood: Binomial(100, p),,Posterior: Beta(2+15, 8+100-15) = Beta(17, 93),Posterior mean = 17/(17+93) = 15.5%  (pulled toward prior),,95% Credible Interval: [0.093, 0.231],→ P(p ∈ [0.093, 0.231] | data) = 95%,  ↑ This IS the interpretation people want!,\n── Frequentist vs Bayesian comparison ───────────────────,┌──────────────────┬──────────────────┬────────────────────┐,│                  │ Frequentist CI   │ Bayesian Credible  │,├──────────────────┼──────────────────┼────────────────────┤,│ θ is...          │ Fixed unknown    │ Random variable    │,│ Interpretation   │ Procedure-based  │ Direct probability │,│ Prior info       │ Ignored          │ Incorporated       │,│ Small samples    │ Relies on CLT    │ Prior stabilizes   │,│ Question answered│ 'Are data        │ 'What is θ given   │,│                  │  consistent?'    │  data?'            │,└──────────────────┴──────────────────┴────────────────────┘,\n── MCMC (brief) ─────────────────────────────────────────,For complex models without conjugate priors:,Markov Chain Monte Carlo samples from the posterior numerically.,R: Stan (via rstan/cmdstanr), JAGS (via rjags), brms,brms::brm(y ~ x, data=df, family=gaussian())"
                  }
        ],
        tips: [
                  "**Credible interval**: P(θ ∈ [a,b] | data) = 95% — the parameter IS in this range with 95% probability",
                  "**Confidence interval**: P(interval contains θ) = 95% over repeated experiments — θ is fixed, the interval is random",
                  "With lots of data, prior matters little — likelihood dominates. With sparse data, prior is crucial",
                  "Uninformative (flat) prior → posterior mode = MLE — Bayesian and frequentist agree with infinite data"
        ],
        mistake: "Using a flat/uninformative prior when you actually have prior knowledge. A flat prior is NOT neutral — it assigns equal probability to p=0.0001 and p=0.9999. If domain knowledge exists, encode it in the prior.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "mixed-effects",
        fn: "Mixed Effects Models",
        desc: "Handle grouped/hierarchical data with random effects for group-level variation.",
        category: "Advanced Regression",
        subtitle: "Fixed effects + random effects — accounts for repeated measures and clustering",
        signature: "y = Xβ + Zu + ε  |  u ~ N(0,G)  |  ε ~ N(0,R)",
        descLong: "Mixed effects (multilevel/hierarchical) models handle data where observations are not fully independent — students within schools, patients within hospitals, repeated measures on the same subject. Fixed effects describe population-level relationships. Random effects account for group-to-group variation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Mixed Effects Models — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── When to use mixed effects ─────────────────────────────\n• Repeated measures (same subject over time)\n• Hierarchical data (students within schools)\n• Longitudinal data (multiple obs per subject)\n• Crossed random effects (subjects × stimuli in experiments)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Mixed Effects Models — common patterns you'll see in production.\n# APPROACH  - Combine Mixed Effects Models with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Model structure ───────────────────────────────────────\nLevel 1 (within-group): Yᵢⱼ = β₀ⱼ + β₁ⱼXᵢⱼ + εᵢⱼ\nLevel 2 (between-group):\n  β₀ⱼ = γ₀₀ + u₀ⱼ    (random intercept)\n  β₁ⱼ = γ₁₀ + u₁ⱼ    (random slope, if included)\nCombined: Yᵢⱼ = γ₀₀ + γ₁₀Xᵢⱼ + u₀ⱼ + u₁ⱼXᵢⱼ + εᵢⱼ"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Mixed Effects Models — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Fixed vs Random effects ───────────────────────────────,Fixed effects: levels of interest themselves,  → Estimate a coefficient for each level,  → Use when: few levels, levels ARE the population,  → Example: treatment (Drug A, Drug B, Placebo),,Random effects: levels sampled from a larger population,  → Estimate variance of the random distribution,  → Use when: many levels, a random sample of possible levels,  → Example: 50 randomly selected hospitals from 500,\n── ICC (Intraclass Correlation Coefficient) ─────────────,ICC = σ²_between / (σ²_between + σ²_within),,ICC = 0: no clustering (OLS is fine),ICC = 1: all variation is between groups,ICC > 0.1: clustering is substantial → use mixed effects,\n── R syntax (lme4) ──────────────────────────────────────,library(lme4),,# Random intercept only:,lmer(score ~ time + treatment + (1|subject), data=df),,# Random intercept + slope:,lmer(score ~ time + (time|subject), data=df),,# Nested: students within schools:,lmer(score ~ ses + (1|school/student), data=df),,# Extract fixed effects:,fixef(fit),# Extract random effects:,ranef(fit)"
                  }
        ],
        tips: [
                  "**ICC > 0.1** strongly suggests you need mixed effects — ignoring clustering deflates standard errors (anti-conservative)",
                  "Random intercept: groups differ in baseline level. Random slope: groups differ in how strongly they respond to X",
                  "REML (default in lmer) is better for estimating variance components; ML is needed for comparing fixed-effects structures via LRT",
                  "`lmerTest::lmer()` adds p-values to lme4 output using Satterthwaite df approximation"
        ],
        mistake: "Running OLS on clustered data (patients within hospitals, students within classrooms). Standard errors are underestimated because within-cluster observations are correlated. Use mixed models or at minimum cluster-robust standard errors.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "clustering",
        fn: "Cluster Analysis: k-means & Hierarchical",
        desc: "Discover natural groupings in unlabeled data.",
        category: "Unsupervised",
        subtitle: "k-means partitioning and hierarchical agglomerative clustering",
        signature: "k-means: min Σ||xᵢ-μₖ||²  |  Hierarchical: linkage + dendrogram",
        descLong: "Clustering groups observations based on similarity without predefined labels. k-means partitions into k spherical clusters by minimizing within-cluster variance. Hierarchical clustering builds a tree of nested clusters using linkage rules — no need to specify k in advance. Both require a distance metric.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Cluster Analysis: k-means & Hierarchical — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── k-means Algorithm ─────────────────────────────────────\n1. Choose k (number of clusters)\n2. Randomly initialize k centroids\n3. Assign each point to nearest centroid\n4. Recompute centroids as cluster means\n5. Repeat 3-4 until assignments don't change\nObjective: minimize W(C) = Σₖ Σᵢ∈Cₖ ||xᵢ - μₖ||²\nRun multiple times (different random starts) → take best"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Cluster Analysis: k-means & Hierarchical — common patterns you'll see in production.\n# APPROACH  - Combine Cluster Analysis: k-means & Hierarchical with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Choosing k ───────────────────────────────────────────\nElbow method: plot W(C) vs k → pick 'elbow'\nSilhouette score: how similar each point is to its cluster\n  vs the nearest other cluster. Range [-1,1], higher=better\n  s(i) = (b(i)-a(i)) / max(a(i),b(i))\n  a(i) = mean dist to same cluster\n  b(i) = mean dist to nearest other cluster\nGap statistic: compare W(C) to expected under null"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Cluster Analysis: k-means & Hierarchical — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── k-means limitations ──────────────────────────────────,• Assumes spherical, equal-size clusters,• Sensitive to outliers and scale (always standardize!),• k must be specified,• Non-convex clusters → use DBSCAN or spectral clustering,\n── Hierarchical Clustering ──────────────────────────────,Bottom-up (agglomerative):,  Start: each point is its own cluster,  Merge: closest pair of clusters at each step,  Until: one cluster remains,,Linkage rules:,  Single: min distance between clusters (elongated clusters),  Complete: max distance (compact, equal-size clusters),  Average: mean distance (UPGMA — good default),  Ward: minimize within-cluster variance (most popular),,Dendrogram: tree of merges — cut at height h → k clusters,\n── Distance metrics ─────────────────────────────────────,Euclidean: √Σ(xᵢ-yᵢ)²    (standard, for continuous),Manhattan: Σ|xᵢ-yᵢ|      (robust to outliers),Cosine: 1-cos(x,y)        (for text/high-dimensional),Gower: handles mixed types (continuous+categorical)"
                  }
        ],
        tips: [
                  "**Always standardize** features before clustering — distance-based methods are dominated by high-variance features otherwise",
                  "Silhouette score > 0.5 suggests reasonable cluster structure; < 0.25 suggests weak or no real clusters",
                  "k-means is best for large datasets (O(n)); hierarchical preserves the full tree but is O(n²) or O(n³)",
                  "Validate clusters externally: do the clusters make domain sense? Are they stable across random seeds?"
        ],
        mistake: "Running k-means without standardizing and interpreting the results as meaningful. If salary (range: $0-$200k) and age (18-65) are both in the analysis, salary will dominate all cluster assignments. Standardize first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "bayesian-conjugate-priors",
        fn: "Conjugate Prior Pairs",
        desc: "Posterior has same family as prior — closed-form solutions.",
        category: "Bayesian",
        subtitle: "Beta-Binomial, Gamma-Poisson, Normal-Normal pairs",
        signature: "Posterior(θ) = Prior(θ) × Likelihood(θ|data)",
        descLong: "When prior and likelihood are conjugate, the posterior has a closed form (no MCMC needed). Beta-Binomial is standard for proportions. Gamma-Poisson for counts. Normal-Normal for continuous data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Conjugate Prior Pairs — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Beta-Binomial Example ──────────────────────────────\n# Prior belief: conversion rate p ~ Beta(2, 8)  [expect ~20%]\n# Prior mean = 2/(2+8) = 0.2\n# Data: 15 conversions in 100 visits\nk <- 15\nn <- 100\n# Posterior: Beta(2+15, 8+100-15) = Beta(17, 93)\nα_post <- 2 + k\nβ_post <- 8 + (n - k)\n# Posterior mean:\nmu_post <- α_post / (α_post + β_post)  # 0.155\n# Posterior 95% Credible Interval:\nlibrary(stats)\nqbeta(c(0.025, 0.975), α_post, β_post)  # [0.093, 0.231]\n# Interpretation: P(p ∈ [0.093, 0.231] | data) = 95%\n# ── Compare Bayesian to Frequentist ────────────────────────\n# Frequentist 95% CI: 0.15 ± 1.96*sqrt(0.15*0.85/100)\n#                   = [0.083, 0.217]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Conjugate Prior Pairs — common patterns you'll see in production.\n# APPROACH  - Combine Conjugate Prior Pairs with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Bayesian 95% Credible Interval: [0.093, 0.231]\n# Bayesian directly answers the question people ask!\n# ── Gamma-Poisson Example ──────────────────────────────────\n# Prior: count rate λ ~ Gamma(α=2, β=0.5)  [expect 4 counts]\n# Prior mean = α/β = 2/0.5 = 4\n# Data: 10 counts in 100 observations\nsum_y <- 10\nn_obs <- 100\n# Posterior: Gamma(2 + 10, 0.5 + 100) = Gamma(12, 100.5)\nα_post <- 2 + sum_y\nβ_post <- 0.5 + n_obs\n# Posterior mean:\nmu_post <- α_post / β_post  # 0.119 counts per observation\n# ── Normal-Normal Example (mean, known variance) ────────────\n# Prior: μ ~ N(μ₀=50, τ²=10²)  [weakly informative]\n# Likelihood: x₁,...,xₙ ~ N(μ, σ²=5²)\n# Data: n=25, x̄=52\nmu_0 <- 50\ntau2 <- 100   # prior variance\nsigma2 <- 25  # known likelihood variance\nn <- 25\nx_bar <- 52"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Conjugate Prior Pairs — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Posterior: N(μ_post, τ²_post)\ntau2_post <- 1 / (1/tau2 + n/sigma2)  # posterior variance\nmu_post <- tau2_post * (mu_0/tau2 + n*x_bar/sigma2)\n# Posterior mean:\nmu_post  # ≈ 51.8  (between prior 50 and data 52)\n# Posterior 95% Credible Interval:\nsd_post <- sqrt(tau2_post)\nmu_post + c(-1.96, 1.96) * sd_post\n# ── Hyperprior strategy (hierarchical) ──────────────────────\n# If you don't know the prior hyperparameters:\n# 1. Weakly informative prior (wide, centered at plausible values)\n# 2. Empirical Bayes (estimate hyperparameters from marginal likelihood)\n# 3. Fully Bayesian hierarchical model (put priors on hyperparameters)"
                  }
        ],
        tips: [
                  "Conjugate pairs lead to closed-form posteriors — no MCMC needed (fast!)",
                  "With lots of data, posterior increasingly dominated by likelihood (prior matters less)",
                  "Weakly informative priors are often better than \"flat\" priors",
                  "Credible intervals directly answer the question people ask — posterior probability"
        ],
        mistake: "Using improper (non-normalizing) priors carelessly. Check that prior integrates to 1.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "hierarchical-models",
        fn: "Hierarchical / Multilevel Models",
        desc: "Share information across groups via common hyperprior.",
        category: "Bayesian",
        subtitle: "Partial pooling between complete pooling and no pooling",
        signature: "yᵢⱼ ~ N(μⱼ, σ²)  |  μⱼ ~ N(μ, τ²)  |  hyperpriors on μ, τ",
        descLong: "Hierarchical models estimate group-level parameters (μⱼ for group j) that share a common distribution. This partial pooling borrows strength across groups — improves estimates for groups with few observations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Hierarchical / Multilevel Models — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Classic example: Schools data ──────────────────────\n# 8 schools, each estimates treatment effect\n# Some schools have very few observations (high uncertainty)\nschool_data <- data.frame(\n  school = 1:8,\n  effect = c(28, 8, -3, 7, -1, 1, 18, 12),\n  se = c(15, 10, 16, 11, 9, 11, 10, 18)\n)\n# ── No pooling (ignore other schools) ──────────────────────\n# Posterior for school j: just the point estimate ± SE\n# High uncertainty for schools with few observations\n# ── Complete pooling (all schools same) ────────────────────\n# μ = overall effect (ignore school differences)\n# Low uncertainty but biased if schools differ\n# ── Partial pooling (Bayesian hierarchical) ───────────────\n# yⱼ ~ N(μⱼ, σⱼ²)  [observed effect for school j]\n# μⱼ ~ N(μ, τ²)    [school effects ~ common distribution]\n# μ ~ N(0, ∞)      [hyperprior]\n# τ ~ Uniform(0, ∞) [hyperprior on between-group variance]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Hierarchical / Multilevel Models — common patterns you'll see in production.\n# APPROACH  - Combine Hierarchical / Multilevel Models with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Posterior estimate for school j:\n# E[μⱼ | data] = weighted average of:\n#   1) Observed effect yⱼ (weight ∝ 1/σⱼ²)\n#   2) Overall effect μ (weight ∝ 1/τ²)\n# Schools with small σⱼ → more weight to own data\n# Schools with large σⱼ → more weight to overall effect\n# ── Three-level hierarchy (e.g., students within classes within schools) ──\n# yᵢₖⱼ ~ N(θᵢₖⱼ, σ²)         [individual student]\n# θᵢₖⱼ ~ N(μₖⱼ, σ_student²)   [student → class effect]\n# μₖⱼ ~ N(μⱼ, σ_class²)       [class → school effect]\n# μⱼ ~ N(μ, σ_school²)        [school → overall effect]\n# ── Visualization: shrinkage ────────────────────────────────\n# Plot school effects with 95% CIs\n# Complete pooling: vertical line at overall mean\n# No pooling: each school at its observed effect\n# Partial pooling: between the two, pulled toward overall mean\n# Extreme schools pulled most toward mean (more shrinkage)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Hierarchical / Multilevel Models — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Software implementation ────────────────────────────────\n# library(brms)  # Bayesian regression models\n# library(rstan) # Stan (probabilistic programming)\n#\n# fit <- brm(effect | se(se) ~ 1 + (1|school),\n#            data=school_data,\n#            family='normal')\n# summary(fit)"
                  }
        ],
        tips: [
                  "Partial pooling: borrows strength from other groups while respecting group differences",
                  "Posterior estimates for small groups are shrunk toward overall mean — this is good!",
                  "ICC (intraclass correlation) = between-group variance / total variance",
                  "Hierarchical models beat complete/no-pooling especially when groups are small"
        ],
        mistake: "Ignoring hierarchical structure. Groups within groups require mixed/hierarchical models — otherwise SE is wrong.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "predictive-posterior-check",
        fn: "Posterior Predictive Checks",
        desc: "Simulate from posterior to verify model fit.",
        category: "Bayesian",
        subtitle: "yrep ~ p(y|θ_post) — posterior predictions should match observed",
        signature: "ppc_dens_overlay(y, yrep)\nppc_stat(y, yrep, stat = \"mean\")",
        descLong: "After fitting a Bayesian model, simulate data from the posterior. Compare simulated to observed — if very different, model is misspecified. This is more intuitive than checking residuals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Posterior Predictive Checks — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Posterior Predictive Check ────────────────────────\n# 1. Fit model (Bayesian) and get posterior draws for parameters\n# 2. For each draw θ(s): simulate y_rep(s) ~ p(y|θ(s))\n# 3. Plot: are observed y values consistent with y_rep?\n# Simple example: Normal model\ny <- c(2.3, 2.5, 2.8, 2.1, 2.4)  # observed data\n# Posterior (conjugate, closed-form):\nmu_post <- mean(y)  # 2.42\nsd_post <- sd(y) / sqrt(length(y))  # posterior SE\n# Posterior predictive distribution:\n# y_rep ~ t(df=n-1, loc=mu, scale=...)\n# Simulate 1000 y_rep:\nset.seed(1)\ny_rep <- replicate(1000, {\n  mu_sim <- rnorm(1, mu_post, sd_post)\n  rnorm(length(y), mu_sim, sd(y))\n})"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Posterior Predictive Checks — common patterns you'll see in production.\n# APPROACH  - Combine Posterior Predictive Checks with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Plot: histogram of y_rep vs observed y\nlibrary(bayesplot)\nppc_dens_overlay(y, y_rep)\n# Observed line should be in the midst of simulated lines\n# ── Posterior predictive p-value ────────────────────────────\n# Test statistic T(y):\nT_obs <- max(y)  # or min, or sd, or range\n# T from each posterior predictive sample:\nT_rep <- apply(y_rep, 2, max)\n# Proportion of times T(y_rep) exceeds T(y):\nppp <- mean(T_rep >= T_obs)\n# Should be near 0.5 for a well-fit model\n# ppp near 0 or 1 → model doesn't capture that feature"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Posterior Predictive Checks — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Various PPC plots ──────────────────────────────────────\n# library(bayesplot)\n# ppc_dens_overlay(y, y_rep)      # density\n# ppc_stat(y, y_rep, stat='mean') # mean\n# ppc_stat(y, y_rep, stat='sd')   # SD\n# ppc_hist(y, y_rep)              # histogram\n# ppc_scatter(y, colMeans(y_rep)) # mean of reps vs obs"
                  }
        ],
        tips: [
                  "PPC is intuitive: if posterior can't generate data like what you observed, model is wrong",
                  "PPP near 0.5 → model fit is good",
                  "PPP near 0 or 1 → model fails to capture something (e.g., skewness, outliers)",
                  "Combine multiple PPC plots to diagnose different aspects of misfit"
        ],
        mistake: "Ignoring posterior predictive checks. A model can have low AIC but generate unrealistic data.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },
]

export default { meta, sections }
