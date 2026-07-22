export const meta = {
  "title": "Inference & Hypothesis Testing",
  "domain": "stats",
  "sheet": "inference",
  "icon": "📈"
}

export const sections = [

  // ── Section 1: Hypothesis Testing ─────────────────────────────────────────
  {
    id: "hypothesis-testing",
    title: "Hypothesis Testing",
    entries: [
      {
        id: "hypothesis-framework",
        fn: "Hypothesis Testing Framework",
        desc: "H₀ vs H₁, test statistics, p-values, and decision rules.",
        category: "Hypothesis Testing",
        subtitle: "The systematic logic of statistical decision-making",
        signature: "H₀: null  vs  H₁: alternative  |  Reject if p < α",
        descLong: "Hypothesis testing asks: is the observed data consistent with the null hypothesis? The p-value is the probability of observing results as extreme as observed, assuming H₀ is true. It is NOT the probability that H₀ is true. Rejecting H₀ when p<α means the result is statistically significant at level α.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Hypothesis Testing Framework — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Framework ─────────────────────────────────────────────\nStep 1: State hypotheses\n  H₀ (null): no effect, status quo   H₀: μ = 50\n  H₁ (alt):  the claim to test       H₁: μ ≠ 50  (two-sided)\nStep 2: Choose α (significance level) — typically 0.05\nStep 3: Compute test statistic\n  Z = (x̄ - μ₀) / (σ/√n)    or    t = (x̄ - μ₀) / (s/√n)\nStep 4: Compute p-value\n  Two-sided: p = 2 × P(Z > |z_obs|)\n  One-sided: p = P(Z > z_obs)  or  P(Z < z_obs)\nStep 5: Decision\n  p < α → Reject H₀ (statistically significant)\n  p ≥ α → Fail to reject H₀ (insufficient evidence)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Hypothesis Testing Framework — common patterns you'll see in production.\n# APPROACH  - Combine Hypothesis Testing Framework with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Type I and Type II Errors ─────────────────────────────\n               │  H₀ True       │  H₀ False       │\n  ─────────────┼────────────────┼─────────────────┤\n  Reject H₀   │ Type I Error   │ Correct! (Power)│\n               │ P = α          │ P = 1-β         │\n  ─────────────┼────────────────┼─────────────────┤\n  Fail to      │ Correct!       │ Type II Error   │\n  Reject H₀   │ P = 1-α        │ P = β           │\nα = significance level = false positive rate\nβ = false negative rate\nPower = 1-β = probability of detecting a real effect"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Hypothesis Testing Framework — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Critical values for common tests ─────────────────────,Two-sided α=0.05: |z| > 1.960  or  |t| > t.025(df),One-sided α=0.05: z > 1.645    or  t > t.05(df)"
                  }
        ],
        tips: [
                  "**p-value ≠ probability H₀ is true**. p = P(data | H₀) not P(H₀ | data). This is the most common statistical misinterpretation in science",
                  "Fail to reject ≠ accept H₀. Absence of evidence is not evidence of absence — you may just lack power",
                  "Always state α BEFORE seeing data — choosing α after to make results 'significant' is p-hacking",
                  "Effect size + p-value together tell the full story. A significant p with tiny effect size may be practically meaningless"
        ],
        mistake: "Interpreting p=0.06 as 'almost significant' or p=0.049 as 'clearly significant'. The threshold is arbitrary — p=0.051 and p=0.049 are essentially identical. Report effect sizes and CIs alongside p-values.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "t-tests",
        fn: "t-Tests: One-Sample, Two-Sample, Paired",
        desc: "Compare means when population variance is unknown.",
        category: "Hypothesis Testing",
        subtitle: "The most commonly used inferential test in statistics",
        signature: "t = (x̄ - μ₀)/(s/√n)  |  Welch: t = (x̄₁-x̄₂)/SE",
        descLong: "The t-test family tests mean differences when σ is unknown. One-sample tests a mean against a constant. Two-sample (independent) compares two group means. Paired test compares before/after or matched pairs by testing if the mean difference is zero.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of t-Tests: One-Sample, Two-Sample, Paired — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── One-Sample t-test ─────────────────────────────────────\nH₀: μ = μ₀    H₁: μ ≠ μ₀\nt = (x̄ - μ₀) / (s/√n)    df = n-1\nExample: Is machine filling 500ml? Sample: n=25, x̄=498.5, s=3.2\nt = (498.5 - 500) / (3.2/√25) = -1.5/0.64 = -2.344\ndf = 24,  t.025 = ±2.064\n|t| = 2.344 > 2.064 → Reject H₀\nConclusion: Machine is NOT filling to 500ml (p≈0.028)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of t-Tests: One-Sample, Two-Sample, Paired — common patterns you'll see in production.\n# APPROACH  - Combine t-Tests: One-Sample, Two-Sample, Paired with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Two-Sample t-test (Welch) ─────────────────────────────\nH₀: μ₁ = μ₂    H₁: μ₁ ≠ μ₂\nt = (x̄₁-x̄₂) / √(s₁²/n₁ + s₂²/n₂)\ndf = Welch-Satterthwaite (use software)\nExample: Drug vs. placebo\nDrug:    n₁=30, x̄₁=82, s₁=8\nPlacebo: n₂=30, x̄₂=75, s₂=10\nt = (82-75)/√(64/30 + 100/30) = 7/√5.467 = 2.994\ndf ≈ 56,  p ≈ 0.004  → Reject H₀"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of t-Tests: One-Sample, Two-Sample, Paired — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Paired t-test ────────────────────────────────────────,H₀: μ_d = 0  (mean difference = 0),d_i = x_i(after) - x_i(before),t = d̄ / (s_d/√n)    df = n-1,,Why paired? Controls for individual variation,Before: [72,68,80]  After: [75,70,84],Diff:   [ 3, 2, 4]   d̄=3, s_d=1, n=3,t = 3/(1/√3) = 5.196, df=2, p=0.035 → Significant,\n── Assumptions ──────────────────────────────────────────,• Random sample,• Data approximately normal (or n large by CLT),• For 2-sample: independence between groups"
                  }
        ],
        tips: [
                  "Use **Welch t-test** (unequal variances) by default — it's robust even when variances ARE equal",
                  "**Paired t-test** is more powerful than two-sample when you have natural pairs — always use it for before/after designs",
                  "Check assumptions with: histogram (normality), boxplot (outliers), Levene's test (equal variances)",
                  "Cohen's d = (x̄₁-x̄₂)/s_pooled is the standardized effect size — 0.2=small, 0.5=medium, 0.8=large"
        ],
        mistake: "Using a two-sample t-test on paired data. You lose all the within-subject information and lose statistical power. If observations are paired (same subject before/after), always use the paired t-test.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "chi-square-tests",
        fn: "Chi-Square Tests",
        desc: "Test independence between categorical variables and goodness of fit.",
        category: "Hypothesis Testing",
        subtitle: "Goodness-of-fit and test of independence for categorical data",
        signature: "χ² = Σ (O-E)²/E",
        descLong: "The chi-square goodness-of-fit test checks whether observed frequencies match expected. The chi-square test of independence checks whether two categorical variables are related in a contingency table. Both use χ² = Σ(O-E)²/E but with different degrees of freedom.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Chi-Square Tests — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Goodness-of-Fit ───────────────────────────────────────\nH₀: Observed distribution matches expected\nH₁: It does not\nFair die (n=120 rolls):\n     Expected: 20 each  Observed: 22,18,25,17,19,19\nχ² = (22-20)²/20 + (18-20)²/20 + (25-20)²/20\n   + (17-20)²/20 + (19-20)²/20 + (19-20)²/20\n   = 0.2+0.2+1.25+0.45+0.05+0.05 = 2.2\ndf = k-1 = 5,  χ².05(5) = 11.07\n2.2 < 11.07 → Fail to reject H₀  (die appears fair)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Chi-Square Tests — common patterns you'll see in production.\n# APPROACH  - Combine Chi-Square Tests with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Test of Independence ──────────────────────────────────\nContingency table: Preference vs. Gender\n             │ Product A │ Product B │ Total\n  ───────────┼───────────┼───────────┼──────\n  Male       │    50     │    30     │   80\n  Female     │    30     │    40     │   70\n  ───────────┼───────────┼───────────┼──────\n  Total      │    80     │    70     │  150\nExpected cell = (Row Total × Col Total) / Grand Total\nE(Male,A)   = 80×80/150 = 42.67\nE(Male,B)   = 80×70/150 = 37.33\nE(Female,A) = 70×80/150 = 37.33\nE(Female,B) = 70×70/150 = 32.67"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Chi-Square Tests — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nχ² = (50-42.67)²/42.67 + (30-37.33)²/37.33\n   + (30-37.33)²/37.33 + (40-32.67)²/32.67\n   = 1.26 + 1.44 + 1.44 + 1.65 = 5.79\ndf = (r-1)(c-1) = 1×1 = 1\nχ².05(1) = 3.841  →  5.79 > 3.841  →  Reject H₀\nConclusion: Gender and product preference ARE associated"
                  }
        ],
        tips: [
                  "Minimum expected frequency rule: **each cell should have E ≥ 5** — otherwise use Fisher's Exact Test",
                  "For 2×2 tables, Yates' continuity correction: χ² = Σ (|O-E|-0.5)²/E (controversial, often omitted)",
                  "Effect size for independence: Cramér's V = √(χ²/(n×min(r-1,c-1))) — ranges 0 to 1",
                  "McNemar's test is for paired categorical data (2×2 before/after) — different from chi-square"
        ],
        mistake: "Using chi-square when expected frequencies are below 5. The chi-square approximation breaks down. Collapse categories, collect more data, or use Fisher's Exact Test.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "multiple-testing",
        fn: "Multiple Testing & Corrections",
        desc: "Adjust for inflated false positives when running many tests.",
        category: "Hypothesis Testing",
        subtitle: "Bonferroni, FDR, and the multiple comparisons problem",
        signature: "Bonferroni: α* = α/m  |  FDR: p_(k) ≤ (k/m)×α",
        descLong: "When running m tests simultaneously, the probability of at least one false positive grows. With m=20 tests at α=0.05, you expect 1 false positive even with no real effects. Bonferroni correction divides α by m. Benjamini-Hochberg FDR correction is less conservative for exploratory analysis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Multiple Testing & Corrections — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Problem ───────────────────────────────────────────────\nFamily-wise error rate (FWER) without correction:\nP(≥1 false positive | m tests) = 1-(1-α)^m\nm=1:   1-(0.95)¹  = 5%\nm=10:  1-(0.95)¹⁰ = 40%\nm=20:  1-(0.95)²⁰ = 64%\nm=100: 1-(0.95)¹⁰⁰= 99.4%"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Multiple Testing & Corrections — common patterns you'll see in production.\n# APPROACH  - Combine Multiple Testing & Corrections with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Bonferroni correction ─────────────────────────────────\nα* = α/m\n20 comparisons, α=0.05:\nα* = 0.05/20 = 0.0025\nOnly declare significant if p < 0.0025\nPros: Simple, controls FWER\nCons: Very conservative, misses real effects (↑ Type II)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Multiple Testing & Corrections — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Benjamini-Hochberg FDR ────────────────────────────────,Controls False Discovery Rate: E[FP/(FP+TP)],Less conservative than Bonferroni,,Procedure:,1. Sort p-values: p_(1) ≤ p_(2) ≤ ... ≤ p_(m),2. Find largest k where p_(k) ≤ (k/m) × α,3. Reject all H₀ for p_(1) through p_(k),,Example: m=5 tests, α=0.05,  Sorted p: 0.001, 0.013, 0.041, 0.074, 0.210,  BH thresholds: 0.01, 0.02, 0.03, 0.04, 0.05,  k=3: p_(3)=0.041 ≤ (3/5)×0.05=0.030? No,  k=2: p_(2)=0.013 ≤ (2/5)×0.05=0.020? Yes,  → Reject first 2 hypotheses"
                  }
        ],
        tips: [
                  "Use **Bonferroni** when you need strong control of any false positive (confirmatory, clinical trials)",
                  "Use **BH-FDR** for exploratory research (genomics, A/B feature tests) — you tolerate some false positives to find more real effects",
                  "Holm-Bonferroni is uniformly more powerful than Bonferroni and still controls FWER — prefer it",
                  "Pre-specify your hypotheses and corrections BEFORE seeing data — post-hoc correction selection is p-hacking"
        ],
        mistake: "Running 20 comparisons, finding 2 with p<0.05, and reporting both as significant without correction. This is standard p-hacking. At α=0.05 with 20 tests you expect 1 false positive even under the null.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "one-way-anova",
        fn: "One-Way ANOVA",
        desc: "Test whether k group means are all equal.",
        category: "ANOVA",
        subtitle: "Extend the t-test to three or more groups simultaneously",
        signature: "F = MS_between/MS_within  |  H₀: μ₁=μ₂=...=μₖ",
        descLong: "ANOVA partitions total variability into between-group (explained by group membership) and within-group (random error) components. The F-statistic is their ratio. A significant F means at least one group differs — post-hoc tests (Tukey, Bonferroni) identify which pairs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of One-Way ANOVA — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Partitioning Variance ─────────────────────────────────\nSS_total   = SS_between + SS_within\nSS_between = Σ nⱼ(x̄ⱼ - x̄)²    (group means vs grand mean)\nSS_within  = ΣΣ(xᵢⱼ - x̄ⱼ)²   (observations vs group mean)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of One-Way ANOVA — common patterns you'll see in production.\n# APPROACH  - Combine One-Way ANOVA with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── ANOVA Table ───────────────────────────────────────────\nSource    │ SS         │ df    │ MS          │ F         │\n──────────┼────────────┼───────┼─────────────┼───────────┤\nBetween   │ SS_between │ k-1   │ SS_b/(k-1)  │ MS_b/MS_w │\nWithin    │ SS_within  │ N-k   │ SS_w/(N-k)  │           │\nTotal     │ SS_total   │ N-1   │             │           │"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of One-Way ANOVA — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Worked Example ───────────────────────────────────────,3 teaching methods, 5 students each. Scores:,Method A: [72,74,78,76,70]  x̄_A=74,Method B: [82,85,88,80,90]  x̄_B=85,Method C: [68,72,70,74,66]  x̄_C=70,Grand mean x̄ = (370+425+350)/15 = 76.33,,SS_between = 5×(74-76.33)² + 5×(85-76.33)² + 5×(70-76.33)²,           = 27.11 + 375.61 + 200.61 = 603.33,SS_within  = 32 + 62 + 34 = 128  (sum of squared deviations within each group),,MS_between = 603.33/2 = 301.67,MS_within  = 128/12   = 10.67,F = 301.67/10.67 = 28.28,F.05(2,12) = 3.89 → 28.28 >> 3.89 → Reject H₀,\n── Post-hoc Tests ───────────────────────────────────────,Tukey's HSD: controls FWER for all pairwise comparisons,Bonferroni: conservative but simple,Scheffé: most flexible (any contrast), most conservative"
                  }
        ],
        tips: [
                  "ANOVA F-test tells you THAT groups differ — post-hoc tests tell you WHICH pairs differ",
                  "ANOVA assumes: independence, normality within groups, homoscedasticity (Levene's test)",
                  "Welch's ANOVA (oneway.test in R) is robust when variances differ — use it by default",
                  "Effect size: η² = SS_between/SS_total (0.01=small, 0.06=medium, 0.14=large)"
        ],
        mistake: "Running multiple t-tests instead of ANOVA when comparing 3+ groups. Each t-test inflates α. 3 groups = 3 comparisons: FWER = 1-(0.95)³ = 14%. Use ANOVA + Tukey post-hoc.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "nonparametric",
        fn: "Non-Parametric Tests",
        desc: "Distribution-free alternatives when normality assumptions fail.",
        category: "Non-Parametric",
        subtitle: "Mann-Whitney, Wilcoxon, Kruskal-Wallis, Spearman",
        signature: "Mann-Whitney U  |  Kruskal-Wallis H  |  Spearman ρ",
        descLong: "Non-parametric tests make no assumptions about the population distribution. They use ranks instead of raw values — more robust to outliers and non-normal data. The cost is lower power than parametric tests when normality holds. Use when: data is ordinal, n is small, distribution is heavily skewed, or outliers are extreme.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Non-Parametric Tests — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── When to use non-parametric ───────────────────────────\n  Parametric        ←→  Non-Parametric equivalent\n  One-sample t      ←→  Wilcoxon signed-rank test\n  Two-sample t      ←→  Mann-Whitney U (Wilcoxon rank-sum)\n  Paired t-test     ←→  Wilcoxon signed-rank test\n  One-way ANOVA     ←→  Kruskal-Wallis test\n  Pearson r         ←→  Spearman ρ  (rank correlation)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Non-Parametric Tests — common patterns you'll see in production.\n# APPROACH  - Combine Non-Parametric Tests with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Mann-Whitney U ────────────────────────────────────────\nH₀: The two groups have the same distribution\n(more precisely: P(X₁>X₂) = 0.5)\nProcedure: combine, rank all observations, sum ranks per group\nGroup 1: [3, 5, 7]  Group 2: [4, 8, 9]\nCombined ranks: 3→1, 4→2, 5→3, 7→4, 8→5, 9→6\nRank sum 1: 1+3+4=8,  Rank sum 2: 2+5+6=13\nU₁ = R₁ - n₁(n₁+1)/2 = 8-6 = 2\nU₂ = n₁n₂ - U₁ = 9-2 = 7\nU = min(U₁,U₂) = 2   compare to table"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Non-Parametric Tests — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Kruskal-Wallis ────────────────────────────────────────,H₀: All k groups have same distribution,H = (12/N(N+1)) × Σ(Rⱼ²/nⱼ) - 3(N+1),Approximate chi-square with df=k-1 for large samples,\n── Spearman ρ ────────────────────────────────────────────,ρ = 1 - 6Σdᵢ²/(n(n²-1))  where dᵢ = rank difference,Ranges -1 to +1, same interpretation as Pearson r,Use for: ordinal data, non-linear monotone relationships"
                  }
        ],
        tips: [
                  "Non-parametric tests are about **6-15% less powerful** than parametric counterparts when normality holds — not a catastrophic loss",
                  "For n>30, CLT often makes t-tests robust even for non-normal data — non-parametric less critical",
                  "Mann-Whitney tests equality of distributions, NOT just means — important distinction",
                  "Always report effect size: rank-biserial correlation r = Z/√n for Mann-Whitney"
        ],
        mistake: "Assuming non-parametric tests are assumption-free. They still assume independent observations and, for Mann-Whitney, that the two distributions have the same shape (only location differs) to make mean comparisons.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },

  // ── Section 2: Applied Testing ─────────────────────────────────────────
  {
    id: "applied-testing",
    title: "Applied Testing",
    entries: [
      {
        id: "ab-test-design",
        fn: "A/B Test Design",
        desc: "Design online experiments to measure causal effects of changes.",
        category: "Experimental Design",
        subtitle: "Randomization, metrics, guardrails, and sample size planning",
        signature: "n = 2(z_α/2+z_β)²σ²/δ²  per variant",
        descLong: "A/B testing (randomized controlled experiment) is the gold standard for measuring causal effects in product and business decisions. Proper design requires: pre-specifying the primary metric, choosing α and β, computing required sample size, and running for the full planned duration before peeking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of A/B Test Design — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── A/B Test Setup ────────────────────────────────────────\nControl (A): existing version  n_A users\nTreatment (B): new version     n_B users\nRandom assignment → causal interpretation"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of A/B Test Design — common patterns you'll see in production.\n# APPROACH  - Combine A/B Test Design with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Sample Size Formula ───────────────────────────────────\nFor means (two-sided, equal groups):\nn_per_group = 2(z_α/2 + z_β)² × σ² / δ²\nFor proportions:\nn_per_group = (z_α/2 + z_β)² × (p_A(1-p_A)+p_B(1-p_B)) / δ²\nParameters:\n  α = 0.05 (Type I rate), z_α/2 = 1.96\n  β = 0.20 (Type II rate), z_β = 0.842  → Power = 80%\n  δ = minimum detectable effect (MDE)\n  σ² = estimated variance\nExample: Conversion rate test\n  Baseline p_A = 0.10,  MDE δ = 0.02 (detect 20% lift)\n  n = (1.96+0.842)² × (0.10×0.90+0.12×0.88) / 0.02²\n    = 7.85 × 0.196 / 0.0004 = 3846 per variant"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of A/B Test Design — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Key Design Principles ────────────────────────────────,┌──────────────────────────────────────────────────────┐,│ 1. Pre-register: fix metric, α, β before running    │,│ 2. Run full duration (don't stop early!)             │,│ 3. Randomize at user level, not session level        │,│ 4. Check randomization (SRM = sample ratio mismatch) │,│ 5. Define guardrail metrics (don't break other KPIs) │,│ 6. Account for network effects if users interact     │,└──────────────────────────────────────────────────────┘,\n── Novelty effect ───────────────────────────────────────,New features often get short-term bump from novelty,→ Run for at least 1-2 full business cycles,→ Analyze long-term vs short-term cohorts separately"
                  }
        ],
        tips: [
                  "**Never peek and stop early** — sequential testing inflates α. Use sequential testing frameworks (alpha spending, always-valid inference) if you need to peek",
                  "SRM (Sample Ratio Mismatch): if 50/50 split shows 53/47 in logs, the experiment is broken — check logging/assignment bugs before analyzing",
                  "Power analysis shows you need MORE data than you think — small effects need tens of thousands of observations",
                  "Segment results by user type, platform, and country — the overall result may hide critical heterogeneous effects"
        ],
        mistake: "Stopping an A/B test as soon as p<0.05 is reached ('peeking'). This dramatically inflates the Type I error rate. At 50 interim analyses, the effective α grows from 5% to ~30%. Commit to a sample size and don't stop early.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "power-sample-size",
        fn: "Statistical Power & Sample Size",
        desc: "Calculate required sample size and understand the power tradeoffs.",
        category: "Experimental Design",
        subtitle: "Power = P(detect true effect) = 1 - β",
        signature: "Power = 1-β  |  MDE = δ/σ (Cohen's d)  |  n ∝ 1/δ²",
        descLong: "Power is the probability of detecting a real effect when it exists. Power depends on: sample size (larger → more power), effect size (larger → more power), α (higher α → more power, at cost of more false positives), and variability (less σ → more power). Power analysis BEFORE the study prevents underpowered research.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Statistical Power & Sample Size — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Power determinants ────────────────────────────────────\n  Power ↑ as:  n ↑,  δ ↑,  α ↑,  σ ↓\n  Power ↓ as:  n ↓,  δ ↓,  α ↓,  σ ↑"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Statistical Power & Sample Size — common patterns you'll see in production.\n# APPROACH  - Combine Statistical Power & Sample Size with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Effect size conventions (Cohen, 1988) ────────────────\n       Cohen's d    Pearson r    η²        f (ANOVA)\nSmall   0.20         0.10       0.01       0.10\nMedium  0.50         0.30       0.06       0.25\nLarge   0.80         0.50       0.14       0.40"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Statistical Power & Sample Size — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Sample size vs. power tradeoff ──────────────────────,For two-sided t-test, α=0.05, d=0.5 (medium effect):,,  n per group │ Power,  ────────────┼───────,      20      │ 34%,      40      │ 52%,      65      │ 70%,     102      │ 80%  ← conventional minimum,     197      │ 90%,     393      │ 95%,\n── What sample size is 'enough'? ────────────────────────,Conventional: Power ≥ 80% (β=0.20),Stronger:     Power ≥ 90% for consequential decisions,Ruleof thumb: You need 4× the n to detect half the effect,  (because n ∝ 1/δ² → halving δ quadruples n),\n── Post-hoc power analysis (cautionary) ─────────────────,DO NOT compute power after observing your data using the,observed effect size — this is circular and uninformative.,Post-hoc power = f(p-value). Always pre-specify."
                  }
        ],
        tips: [
                  "Most psychology and social science studies are dramatically underpowered (Button et al. 2013 found median power of 8-31% in neuroscience)",
                  "Increasing α from 0.05 to 0.10 gains about 10% power at the cost of doubling false positive rate",
                  "Variance reduction techniques (stratification, covariates, CUPED) increase power without more subjects",
                  "CUPED (Controlled-experiment Using Pre-Experiment Data): use pre-experiment metric as covariate to reduce variance"
        ],
        mistake: "Running a study, getting p>0.05, then reporting 'no effect found.' Without adequate power, you cannot distinguish 'no effect' from 'we lacked power to detect the effect.' Always compute power BEFORE the study.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "z-test-proportion-tests",
        fn: "z-test / Proportion Tests",
        desc: "Test means when σ is known, and test proportions against a value or each other.",
        category: "Hypothesis Testing",
        subtitle: "One-proportion z-test, two-proportion z-test, one-sample z-test",
        signature: "z = (p̂-p₀)/√(p₀(1-p₀)/n)  |  z = (x̄-μ₀)/(σ/√n)",
        descLong: "The z-test for a mean requires known σ (rare in practice). More commonly, z-tests are used for large-sample proportions. The one-proportion z-test checks if a sample proportion differs from a target. The two-proportion z-test compares proportions from two independent groups — the foundation of A/B conversion rate tests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of z-test / Proportion Tests — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── One-sample z-test (σ known) ──────────────────────────\nH₀: μ = μ₀    z = (x̄ - μ₀) / (σ/√n)\nExample: Machine fills cans, σ=2g (known), n=100, x̄=500.4\nH₀: μ=500    H₁: μ≠500\nz = (500.4 - 500) / (2/√100) = 0.4/0.2 = 2.0\np = 2·P(Z>2) = 2·0.0228 = 0.046\nReject H₀ at α=0.05"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of z-test / Proportion Tests — common patterns you'll see in production.\n# APPROACH  - Combine z-test / Proportion Tests with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── One-proportion z-test ─────────────────────────────────\nH₀: p = p₀\nz = (p̂ - p₀) / √(p₀(1-p₀)/n)\nCondition: np₀ ≥ 10 AND n(1-p₀) ≥ 10\nExample: Claim 60% prefer product A. Survey: 55/100 prefer A.\nH₀: p=0.6    H₁: p≠0.6\np̂ = 0.55\nz = (0.55-0.60) / √(0.6·0.4/100) = -0.05/0.049 = -1.02\np = 2·P(Z<-1.02) = 0.308\nFail to reject H₀"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of z-test / Proportion Tests — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Two-proportion z-test ─────────────────────────────────,H₀: p₁ = p₂,,Pooled proportion: p̂ = (k₁+k₂)/(n₁+n₂),SE = √(p̂(1-p̂)(1/n₁ + 1/n₂)),z = (p̂₁ - p̂₂) / SE,,Example: A/B test,Control: 120/2000 convert  p̂₁=0.060,Treatment: 158/2000 convert p̂₂=0.079,p̂ = (120+158)/(2000+2000) = 0.0695,SE = √(0.0695·0.9305·(1/2000+1/2000)) = 0.00803,z = (0.079-0.060)/0.00803 = 2.37  → p=0.018,Reject H₀ → Significant uplift!"
                  }
        ],
        tips: [
                  "Use z-test for proportions when n is large (rule: np≥10 and n(1-p)≥10)",
                  "For very small proportions (p<0.05), use exact binomial test — normal approximation breaks down",
                  "Two-proportion test uses **pooled** p̂ under H₀ (they're equal) — different from CI calculation (separate p̂s)",
                  "Relative lift = (p̂₂-p̂₁)/p̂₁ — always report alongside absolute difference for context"
        ],
        mistake: "Using unpooled variance in the two-proportion z-test statistic. Under H₀: p₁=p₂, you should pool to get a single estimate p̂. Unpooled is correct for confidence intervals (not assuming equality).",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "effect-sizes",
        fn: "Effect Sizes",
        desc: "Quantify practical significance independent of sample size.",
        category: "Hypothesis Testing",
        subtitle: "Cohen's d, η², ω², r, Cramér's V, Odds Ratio",
        signature: "d = (μ₁-μ₂)/s_pooled  |  η² = SS_effect/SS_total  |  r = Z/√N",
        descLong: "P-values tell you whether an effect exists; effect sizes tell you how big it is. With large enough n, even a trivially small effect is statistically significant. Effect sizes are standardized (scale-free) measures of practical importance. Always report effect sizes alongside p-values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Effect Sizes — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Cohen's d (two means) ─────────────────────────────────\nd = (x̄₁ - x̄₂) / s_pooled\nwhere s_pooled = √[(s₁²(n₁-1) + s₂²(n₂-1)) / (n₁+n₂-2)]\nInterpretation:  d=0.2 (small), d=0.5 (medium), d=0.8 (large)\nExample: Drug (x̄=82, s=10) vs placebo (x̄=75, s=12), n=30 each\ns_pooled = √[(100·29 + 144·29)/58] = √122 = 11.05\nd = (82-75)/11.05 = 0.63  → medium-to-large effect"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Effect Sizes — common patterns you'll see in production.\n# APPROACH  - Combine Effect Sizes with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── η² and ω² (ANOVA) ────────────────────────────────────\nη² = SS_between / SS_total          (biased — overestimates)\nω² = (SS_between - (k-1)MS_within) / (SS_total + MS_within)\n                                     (unbiased — preferred)\nInterpretation: 0.01=small, 0.06=medium, 0.14=large"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Effect Sizes — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── r (correlation / non-parametric) ─────────────────────,Pearson r directly: 0.1=small, 0.3=medium, 0.5=large,,From Mann-Whitney / Wilcoxon:,  r = Z / √N    (Z = test statistic, N = total sample size),\n── Cramér's V (chi-square) ───────────────────────────────,V = √(χ² / (n · min(r-1, c-1))),,Interpretation depends on df:,  df=1: 0.10=small, 0.30=medium, 0.50=large,  df=2: 0.07=small, 0.21=medium, 0.35=large,\n── Odds Ratio (binary outcomes) ─────────────────────────,OR = (a/b) / (c/d) = ad/bc    from 2×2 table:,       Event  No Event,Exp      a       b,Control  c       d,,OR=1: no effect,OR>1: treatment increases odds of event,OR<1: treatment decreases odds,,95% CI for OR: exp(log(OR) ± 1.96·SE),where SE = √(1/a + 1/b + 1/c + 1/d)"
                  }
        ],
        tips: [
                  "**ω²** is preferable to η² — η² is positively biased (especially in small samples)",
                  "For repeated-measures designs, partial η² (effect / (effect + error)) is more appropriate than total η²",
                  "Absolute risk reduction (ARR) = p₁-p₂ and number needed to treat (NNT) = 1/ARR are often more interpretable than OR in clinical contexts",
                  "Effect size conventions (0.2/0.5/0.8) were meant as rough guides, not hard thresholds — context always matters"
        ],
        mistake: "Reporting a statistically significant result without effect size. With n=10,000, d=0.05 will be significant (p<0.05) but represents an utterly trivial difference. Always pair significance with magnitude.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "anova-extended",
        fn: "Two-Way ANOVA & ANCOVA",
        desc: "Test two factors and their interaction; control for continuous covariates.",
        category: "ANOVA",
        subtitle: "Main effects, interaction effects, and covariate adjustment",
        signature: "y ~ A + B + A:B  |  ANCOVA: y ~ treatment + covariate",
        descLong: "Two-way ANOVA tests two categorical factors simultaneously and their interaction. An interaction means the effect of factor A depends on the level of factor B — you can't interpret main effects in isolation when interaction is present. ANCOVA adds a continuous covariate to ANOVA — increases power by reducing error variance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Two-Way ANOVA & ANCOVA — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Two-Way ANOVA Table ───────────────────────────────────\nSource       │ SS        │ df          │ MS       │ F\n─────────────┼───────────┼─────────────┼──────────┼──────\nFactor A     │ SS_A      │ a-1         │ SS_A/(a-1)│ MS_A/MS_E\nFactor B     │ SS_B      │ b-1         │ SS_B/(b-1)│ MS_B/MS_E\nA×B interact │ SS_AB     │ (a-1)(b-1)  │ SS_AB/df │ MS_AB/MS_E\nError        │ SS_E      │ ab(n-1)     │ SS_E/df  │\nTotal        │ SS_T      │ abn-1       │          │"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Two-Way ANOVA & ANCOVA — common patterns you'll see in production.\n# APPROACH  - Combine Two-Way ANOVA & ANCOVA with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Interaction interpretation ───────────────────────────\nNo interaction:  effect of A is same at each level of B\n   Drug effect = +10 points for both young and old patients\nInteraction present: effect of A differs across B levels\n   Drug: young patients +15, old patients +2\n   → Cannot say 'Drug increases score by 10' (which group?)\n   → Must report results separately for each group"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Two-Way ANOVA & ANCOVA — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Interaction plot ──────────────────────────────────────,Parallel lines   = no interaction,Crossing lines   = interaction (disordinal — rank order changes),Converging lines = interaction (ordinal — same rank order),\n── ANCOVA ────────────────────────────────────────────────,Model: Yᵢⱼ = μ + αᵢ + β(xᵢⱼ - x̄) + εᵢⱼ,,Advantages:,• Removes variance associated with covariate → ↑ power,• Adjusts treatment means for unequal covariate distributions,• Reduces error SS → smaller MS_error → larger F,,Assumption: Homogeneity of regression slopes,(covariate effect is same across treatment groups),Test: include Treatment × Covariate interaction term,  If significant → ANCOVA assumption violated → use separate regressions,,R: aov(score ~ treatment + pretest, data=df),   → pretest is the covariate"
                  }
        ],
        tips: [
                  "**Always check the interaction term first** — if interaction is significant, main effects are not meaningfully interpretable in isolation",
                  "Interaction plots (lines per group) are essential for communicating whether an interaction is ordinal or disordinal",
                  "ANCOVA pre-test/post-test design: `aov(post ~ group + pre, data=df)` — the most powerful way to analyze before/after data with multiple groups",
                  "Type I vs Type III SS: for unbalanced designs use Type III (from `car::Anova(fit, type=3)`) — order of factors doesn't affect results"
        ],
        mistake: "Interpreting significant main effects when there's a significant interaction. If Drug × Age interaction is significant, 'Drug is effective' is too simple — it's effective for young but not old (or vice versa). Report conditional effects.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "fisher-exact-mcnemar",
        fn: "Fisher's Exact / McNemar / Cochran-Mantel-Haenszel",
        desc: "Tests for small samples, paired categorical data, and stratified tables.",
        category: "Categorical Tests",
        subtitle: "When chi-square assumptions fail or data is paired/stratified",
        signature: "Fisher: P = C(a+b,a)C(c+d,c)/C(n,a+c)  |  McNemar: χ²=(b-c)²/(b+c)",
        descLong: "Fisher's Exact Test gives the exact p-value for 2×2 tables when expected frequencies are too small for chi-square. McNemar's test analyzes paired binary data (before/after the same subjects). The Cochran-Mantel-Haenszel test controls for a third stratifying variable in a 2×2 table.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Fisher's Exact / McNemar / Cochran-Mantel-Haenszel — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Fisher's Exact Test ───────────────────────────────────\nUse when: any expected cell < 5\nObs table:          Expected:\n        Outcome+  Outcome-         Outcome+  Outcome-\nGroup A    3         17     20   A    6.4      13.6    20\nGroup B   11         9      20   B    7.6      12.4    20\n            14       26     40       14        26     40\nAll expected ≥ 5? No (3 < 5) → use Fisher's Exact\nP-value = sum of probs of tables as extreme or more extreme\n         as the observed, fixing marginals"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Fisher's Exact / McNemar / Cochran-Mantel-Haenszel — common patterns you'll see in production.\n# APPROACH  - Combine Fisher's Exact / McNemar / Cochran-Mantel-Haenszel with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── McNemar's Test (paired binary) ───────────────────────\nSame subjects measured twice (before/after, two raters)\n           After: +   After: -\nBefore: +    a          b\nBefore: -    c          d\nH₀: marginal proportions are equal (P(+) same before and after)\nMcNemar's χ² = (b-c)² / (b+c)    df=1\nOnly the discordant pairs (b,c) carry information!\nCells a and d are concordant — don't contribute to test.\nExample: drug effect on symptom\nBefore+/After-: b=20  (drug removed symptom)\nBefore-/After+: c= 5  (drug added symptom?!)\nχ² = (20-5)²/(20+5) = 225/25 = 9.0  → p=0.003"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Fisher's Exact / McNemar / Cochran-Mantel-Haenszel — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Cochran-Mantel-Haenszel (CMH) ────────────────────────,Controls for a stratifying variable (e.g., study site),H₀: conditional OR = 1 in each stratum,,Use when: same 2×2 table replicated across k strata,Example: Drug effect at 5 different hospitals — combine evidence,,CMH statistic ≈ χ²(1)  for testing conditional independence,Mantel-Haenszel OR: weighted average OR across strata"
                  }
        ],
        tips: [
                  "Fisher's test is always valid for 2×2 tables — chi-square is an approximation that works when n is large enough",
                  "McNemar: only discordant pairs (b,c) matter — sample size for power is effectively b+c, not n",
                  "CMH is the stratified analysis equivalent of logistic regression — controls for confounding by strata",
                  "Exact tests can be extended to larger tables via `exact2x2` or `fisher.test` with `simulate.p.value=TRUE`"
        ],
        mistake: "Applying chi-square to a before/after design with the same subjects. Those cells are correlated, not independent — use McNemar's test for paired binary data.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "post-hoc-multiple-comparisons",
        fn: "Post-Hoc Tests: Tukey, Bonferroni, Scheffe",
        desc: "Identify which group pairs differ after significant ANOVA.",
        category: "ANOVA",
        subtitle: "Pairwise comparisons controlling for Type I inflation",
        signature: "TukeyHSD(aov_fit)  |  pairwise.t.test(x, g, p.adjust)",
        descLong: "After ANOVA F-test, post-hoc tests identify which specific group pairs differ. Tukey HSD controls FWER for all pairwise comparisons. Bonferroni is conservative. Scheffe is the most flexible (any contrast).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Post-Hoc Tests: Tukey, Bonferroni, Scheffe — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Example: 3 groups, 5 observations each ─────────────\ndf <- data.frame(\n  score = c(72,74,78,76,70,  82,85,88,80,90,  68,72,70,74,66),\n  group = factor(rep(c('A','B','C'), each=5))\n)\nfit <- aov(score ~ group, data=df)\nsummary(fit)  # F=28.28, p<.001\n# ── Tukey HSD (all pairwise comparisons) ──────────────────\nTukeyHSD(fit)\n# diff        lwr        upr     p adj\n# B-A   11.00    4.05   17.95   0.003\n# C-A   -4.00  -10.95    2.95   0.370\n# C-B  -15.00  -21.95   -8.05   0.000"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Post-Hoc Tests: Tukey, Bonferroni, Scheffe — common patterns you'll see in production.\n# APPROACH  - Combine Post-Hoc Tests: Tukey, Bonferroni, Scheffe with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Plot confidence intervals:\nplot(TukeyHSD(fit))\n# ── Bonferroni correction ──────────────────────────────────\n# More conservative: α* = α/m\n# m = number of comparisons = C(3,2) = 3\npairwise.t.test(df$score, df$group,\n                p.adjust.method='bonferroni')\n# ── Scheffe test (flexible for any contrast) ──────────────\n# Can test: (A+B)/2 vs C, or A vs (B+C), etc.\n# Most conservative"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Post-Hoc Tests: Tukey, Bonferroni, Scheffe — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Dunnett's test (control group) ────────────────────────\n# Compare each treatment to a single control (e.g., placebo)\n# library(multcomp)\n# dunnett <- glht(fit, linfct=mcp(group='Dunnett'))\n# summary(dunnett)\n# ── Effect sizes for pairwise differences ──────────────────\n# Cohen's d between each pair:\nd_AB <- (82 - 74) / sqrt(((5-1)*10 + (5-1)*12) / (5+5-2))\n# d ≈ 0.63 (medium effect)"
                  }
        ],
        tips: [
                  "Tukey HSD is the standard for post-hoc after ANOVA",
                  "Always report effect sizes alongside p-values from post-hoc tests",
                  "Dunnett's test when comparing multiple treatments to a single control (more powerful)",
                  "Scheffe is most flexible but least powerful — use only when testing complex contrasts"
        ],
        mistake: "Running pairwise t-tests without correction. 3 groups = 3 comparisons; FWER = 1-(0.95)³ = 14%. Always apply Tukey, Bonferroni, or another correction.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "effect-size-interpretation",
        fn: "Effect Sizes & Practical Significance",
        desc: "Quantify practical importance independent of sample size.",
        category: "Hypothesis Testing",
        subtitle: "Cohen's d for means, η² for ANOVA, OR for binary outcomes",
        signature: "d = (μ₁-μ₂)/σ  |  0.2=small, 0.5=medium, 0.8=large",
        descLong: "P-values tell you whether an effect exists; effect sizes tell you how big. With large N, even tiny effects are statistically significant. Effect sizes are scale-free and interpretable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Effect Sizes & Practical Significance — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Cohen's d: standardized mean difference ────────────\n# Group A: mean=74, sd=3  Group B: mean=82, sd=4\nd <- (82 - 74) / sqrt((3^2 + 4^2) / 2)\n# d = 8/3.5 ≈ 2.3 (very large!)\n# Cohen's conventions:\n# d = 0.2: small\n# d = 0.5: medium\n# d = 0.8: large\n# 95% CI for d using non-central t:\n# library(compute.es)\n# mesad(t=2.5, n.1=20, n.2=20)\n# ── η² and ω² (ANOVA effect size) ──────────────────────────\n# ANOVA table:\n# Source    SS       df\n# Between   603.33   2     MS_b = 301.67\n# Within    128      12    MS_w = 10.67\n# Total     731.33   14\n# Eta-squared (biased, overestimates):\neta2 <- 603.33 / 731.33  # 0.825"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Effect Sizes & Practical Significance — common patterns you'll see in production.\n# APPROACH  - Combine Effect Sizes & Practical Significance with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Omega-squared (unbiased):\nomega2 <- (603.33 - 2*10.67) / (731.33 + 10.67)  # 0.758\n# Cohen's conventions:\n# 0.01 = small\n# 0.06 = medium\n# 0.14 = large\n# ── R² for regression ──────────────────────────────────────\n# R² = 0.30 → 30% of variance explained\n# Check adjusted R² to penalize overfitting\n# ── Odds Ratio (binary outcomes) ───────────────────────────\n#              Disease+  Disease-\n# Exposure+    80         70    150\n# Exposure-    20         130   150\n#              100        200   300\n# OR = (80×130) / (70×20) = 10400/1400 = 7.43\n# Exposure increases odds by factor of 7.43\n# 95% CI for OR:\n# CI = OR × exp(±1.96 × sqrt(1/80 + 1/70 + 1/20 + 1/130))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Effect Sizes & Practical Significance — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Interpretation:\n# OR = 1: no effect\n# OR = 2: doubles the odds\n# OR = 0.5: halves the odds\n# ── NNT: Number Needed to Treat ────────────────────────────\n# If treatment improves outcome from 10% → 15%\n# ARR = 0.15 - 0.10 = 0.05\n# NNT = 1 / 0.05 = 20\n# Treat 20 people to help 1\n# ── Correlation effect sizes (Pearson r) ──────────────────\n# r = 0.1: negligible\n# r = 0.3: small\n# r = 0.5: medium\n# r = 0.7: large\n# ── Reporting template ────────────────────────────────────\n# \"t(58) = 2.34, p = .023, d = 0.61\"\n# \"F(2,57) = 8.45, p < .001, η² = .23\"\n# \"χ²(1) = 4.22, p = .040, Cramér's V = .15\""
                  }
        ],
        tips: [
                  "Always report effect sizes with p-values — they tell complementary stories",
                  "Small p + small effect = not practically significant",
                  "Large p + medium effect = likely underpowered study",
                  "Effect size conventions are rough guides — 0.2/0.5/0.8 are starting points, not rules"
        ],
        mistake: "Reporting only p-values. A significant result with d=0.05 means the effect is trivial, just precisely estimated. Always include effect size.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },
]

export default { meta, sections }
