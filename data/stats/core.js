export const meta = {
  "title": "Descriptive & Probability",
  "domain": "stats",
  "sheet": "core",
  "icon": "📈"
}

export const sections = [

  // ── Section 1: Descriptive & Probability ─────────────────────────────────────────
  {
    id: "descriptive-probability",
    title: "Descriptive & Probability",
    entries: [
      {
        id: "central-tendency",
        fn: "Mean / Median / Mode",
        desc: "Measures of center: where the data tends to cluster.",
        category: "General",
        subtitle: "mean, median, mode, weighted mean, geometric mean, harmonic mean",
        signature: "μ = Σxᵢ/n  |  Median = middle value  |  Mode = most frequent",
        descLong: "The mean (arithmetic average) is sensitive to outliers. The median (50th percentile) is robust to outliers — preferred for skewed data. The mode is most useful for categorical data. For symmetric distributions all three coincide; divergence signals skew.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Mean / Median / Mode — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Mean ──────────────────────────────────────────────────\nData: [4, 7, 13, 2, 1, 9, 7, 3, 6, 8]\nμ = (4+7+13+2+1+9+7+3+6+8) / 10 = 60/10 = 6.0"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Mean / Median / Mode — common patterns you'll see in production.\n# APPROACH  - Combine Mean / Median / Mode with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Median ────────────────────────────────────────────────\nSorted: [1, 2, 3, 4, 6, 7, 7, 8, 9, 13]  n=10 (even)\nMedian = (6 + 7) / 2 = 6.5   ← avg of middle two\nWith outlier added [1,2,3,4,6,7,7,8,9,13,200]:  n=11 (odd)\nMedian = 7  (middle value — unchanged by 200)\nMean   = (60+200)/11 = 23.6  (destroyed by outlier)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Mean / Median / Mode — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Mode ──────────────────────────────────────────────────,Data: [4, 7, 13, 2, 1, 9, 7, 3, 6, 8],Mode = 7  (appears twice; all others once),,Bimodal: [1, 2, 2, 5, 8, 8, 9]  Modes = 2 and 8,\n── When to use which ────────────────────────────────────,┌──────────────────────┬──────────────────────────────┐,│ Situation            │ Best measure                 │,├──────────────────────┼──────────────────────────────┤,│ Symmetric, no outliers│ Mean (most efficient)       │,│ Skewed / outliers    │ Median                       │,│ Categorical data     │ Mode                         │,│ Income, house prices │ Median (always)              │,│ Reporting to public  │ Median (less misleading)     │,└──────────────────────┴──────────────────────────────┘"
                  }
        ],
        tips: [
                  "For right-skewed data (income, house prices): **Mean > Median > Mode** — politicians choose whichever tells the story they want",
                  "Trimmed mean: drop top and bottom k% before averaging — robust to outliers without ignoring them entirely",
                  "Weighted mean: `Σ(wᵢxᵢ) / Σwᵢ` — used in GPA, index funds, portfolio returns",
                  "Geometric mean: `(x₁·x₂·...·xₙ)^(1/n)` — correct for growth rates and ratios (e.g. CAGR)"
        ],
        mistake: "Reporting mean salary when the distribution is right-skewed. A company with 9 employees earning $50k and 1 CEO earning $950k has a mean of $140k — which describes no one's experience. Always report median for income/price data.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "spread",
        fn: "Variance / Std Dev / IQR / Range",
        desc: "Measures of spread: how dispersed the data is.",
        category: "General",
        subtitle: "variance, standard deviation, IQR, MAD, range, coefficient of variation",
        signature: "s² = Σ(xᵢ-x̄)²/(n-1)  |  s = √s²  |  IQR = Q3-Q1",
        descLong: "Variance measures average squared deviation from the mean. Standard deviation (its square root) is in the original units — interpretable. IQR (interquartile range) is robust to outliers. Range is simple but fragile. Always report spread alongside center.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Variance / Std Dev / IQR / Range — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Sample Variance & Std Dev ────────────────────────────\nData: [2, 4, 4, 4, 5, 5, 7, 9]   n=8,  x̄=5\nDeviations: [-3, -1, -1, -1, 0, 0, 2, 4]\nSquared:    [ 9,  1,  1,  1, 0, 0, 4, 16]\nSum:        32\nSample variance:    s² = 32/(8-1) = 4.57\nSample std dev:     s  = √4.57   = 2.14\nPopulation variance:σ² = 32/8    = 4.00  (divide by n)\nPopulation std dev: σ  = 2.00"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Variance / Std Dev / IQR / Range — common patterns you'll see in production.\n# APPROACH  - Combine Variance / Std Dev / IQR / Range with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Why n-1? (Bessel's correction) ──────────────────────\nDividing by (n-1) corrects for the fact that x̄ is\nestimated from the same sample — makes s² an unbiased\nestimator of σ². Use n-1 for samples, n for populations."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Variance / Std Dev / IQR / Range — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── IQR & Quartiles ──────────────────────────────────────,Sorted: [1, 2, 3, 4, 6, 7, 7, 8, 9, 13]  n=10,,Q1 (25th pct): 2.75  (median of lower half: [1,2,3,4]),Q3 (75th pct): 7.25  (median of upper half: [7,7,8,9]),IQR = Q3 - Q1 = 7.25 - 2.75 = 4.50,\n── Outlier rule (Tukey fences) ──────────────────────────,Lower fence: Q1 - 1.5×IQR = 2.75 - 6.75 = -4.0,Upper fence: Q3 + 1.5×IQR = 7.25 + 6.75 = 14.0,Outliers: any value < -4.0  or  > 14.0,→ No outliers in this dataset (13 < 14),\n── CV (Coefficient of Variation) ────────────────────────,CV = (s / x̄) × 100%  = (2.14/5) × 100% = 42.8%,Useful for comparing spread across different-scale datasets"
                  }
        ],
        tips: [
                  "Use **IQR** when data is skewed or has outliers — it's the spread of the middle 50%",
                  "**CV** enables apples-to-apples spread comparison: 10% CV on salary vs 10% CV on height means same relative variability",
                  "Std dev is in the **same units** as the data; variance is in squared units (harder to interpret)",
                  "Rule of thumb: for normal data, ~68% of values fall within 1σ, ~95% within 2σ, ~99.7% within 3σ"
        ],
        mistake: "Using range (max-min) as the sole spread measure. One extreme outlier destroys it. IQR or std dev tells a far more stable story.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "shape",
        fn: "Skewness / Kurtosis / Five-Number Summary",
        desc: "Shape statistics: symmetry, tail weight, and the boxplot summary.",
        category: "General",
        subtitle: "skewness, kurtosis, moments, distribution shape analysis",
        signature: "Skewness = E[(X-μ)³]/σ³  |  Kurtosis = E[(X-μ)⁴]/σ⁴",
        descLong: "Skewness measures asymmetry: positive = right tail longer, negative = left tail longer. Kurtosis measures tail heaviness (excess kurtosis relative to normal distribution). The five-number summary (min, Q1, median, Q3, max) is the basis for box plots.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Skewness / Kurtosis / Five-Number Summary — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Skewness ──────────────────────────────────────────────\n          Negative skew        Symmetric      Positive skew\n          (left-tailed)        (normal)       (right-tailed)\n    ████                         ██           ██\n  ██████                       ██████           ██████\n████████                     ██████████           ████████\nMean < Median < Mode   Mean=Med=Mode   Mode < Median < Mean\nRule of thumb:\n  |skewness| < 0.5  → approximately symmetric\n  0.5 – 1.0        → moderately skewed\n  > 1.0            → highly skewed"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Skewness / Kurtosis / Five-Number Summary — common patterns you'll see in production.\n# APPROACH  - Combine Skewness / Kurtosis / Five-Number Summary with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Kurtosis (excess, relative to normal=0) ──────────────\nMesokurtic  (excess ≈ 0): Normal distribution\nLeptokurtic (excess > 0): Heavy tails, sharp peak (t-dist)\nPlatykurtic (excess < 0): Light tails, flat peak (uniform)\nHigh kurtosis → more extreme outliers than expected from normal"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Skewness / Kurtosis / Five-Number Summary — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Five-Number Summary ───────────────────────────────────,Data: [3, 7, 8, 5, 12, 14, 21, 13, 18, 12],,┌─────────────────────────────────────────────┐,│  Min   Q1   Median   Q3    Max               │,│   3   7.25   12    14.75   21               │,└─────────────────────────────────────────────┘,,Box plot anatomy:,  ├───[  Q1 ════ Median ════ Q3  ]───┤,  ↑                                  ↑, whisker (min or 1.5×IQR)      whisker (max or 1.5×IQR),  ·  ← dots beyond whiskers = outliers"
                  }
        ],
        tips: [
                  "Pearson's second skewness coefficient (simple): `3(mean - median) / std dev` — quick approximation",
                  "Financial returns are typically **leptokurtic** (fat tails) — normal distribution underestimates extreme events",
                  "Jarque-Bera test combines skewness and kurtosis to formally test normality",
                  "Box plots are skewness-visible: median close to Q1 = right-skewed; close to Q3 = left-skewed"
        ],
        mistake: "Assuming skewness = 0 means normality. Zero skewness means symmetric but doesn't guarantee bell-shaped. A bimodal symmetric distribution has zero skewness but is clearly non-normal.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "probability-rules",
        fn: "Probability Rules & Axioms",
        desc: "Addition rule, multiplication rule, conditional probability.",
        category: "General",
        subtitle: "addition rule, multiplication rule, conditional probability, Bayes theorem",
        signature: "P(A∪B) = P(A)+P(B)-P(A∩B)  |  P(A|B) = P(A∩B)/P(B)",
        descLong: "Probability is a measure from 0 to 1 assigned to events. The three axioms (non-negativity, total probability = 1, additivity) generate all other rules. Conditional probability P(A|B) is the probability of A given B has occurred. Independence means knowing B tells you nothing about A.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Probability Rules & Axioms — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Basic Rules ───────────────────────────────────────────\nP(A) ∈ [0,1]           Non-negativity axiom\nP(Ω) = 1               Total probability = 1\nP(Aᶜ) = 1 - P(A)       Complement rule"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Probability Rules & Axioms — common patterns you'll see in production.\n# APPROACH  - Combine Probability Rules & Axioms with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Addition Rule ─────────────────────────────────────────\nGeneral:    P(A∪B) = P(A) + P(B) - P(A∩B)\nMutually    P(A∩B) = 0 → P(A∪B) = P(A) + P(B)\nexclusive:\nExample: Card from standard deck\nP(King)     = 4/52 = 0.0769\nP(Heart)    = 13/52 = 0.25\nP(King∩Heart)= 1/52 = 0.0192  (King of Hearts)\nP(King∪Heart)= 4/52 + 13/52 - 1/52 = 16/52 = 0.308"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Probability Rules & Axioms — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Multiplication Rule ──────────────────────────────────,General:     P(A∩B) = P(A|B) × P(B),Independent: P(A∩B) = P(A) × P(B),,Roll two dice: P(both 6) = 1/6 × 1/6 = 1/36 ≈ 0.028,\n── Conditional Probability ──────────────────────────────,P(A|B) = P(A∩B) / P(B),,Example:,P(Disease) = 0.01,P(+Test | Disease) = 0.95  (sensitivity),P(+Test | No Disease) = 0.05  (false positive rate),,P(+Test) = 0.95×0.01 + 0.05×0.99 = 0.059,P(Disease | +Test) = (0.95×0.01) / 0.059 = 0.161,→ Only 16% chance of disease even with a positive test!"
                  }
        ],
        tips: [
                  "Draw a **probability tree** or **Venn diagram** for conditional probability problems — visual structure prevents errors",
                  "Independence check: P(A∩B) = P(A)×P(B) — if this fails, they're dependent",
                  "Mutually exclusive ≠ independent. If A and B are mutually exclusive and both have P>0, they are dependent (P(A|B)=0 ≠ P(A))",
                  "Law of Total Probability: P(A) = Σ P(A|Bᵢ)P(Bᵢ) across a partition of Ω"
        ],
        mistake: "Confusing P(A|B) with P(B|A). The probability of disease given a positive test is NOT the same as the probability of a positive test given disease. This confusion (the prosecutor's fallacy) has put innocent people in prison.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "bayes",
        fn: "Bayes' Theorem",
        desc: "Update beliefs when new evidence arrives.",
        category: "General",
        subtitle: "Bayes theorem, prior, posterior, likelihood, evidence, Bayesian inference",
        signature: "P(H|E) = P(E|H)·P(H) / P(E)",
        descLong: "Bayes' theorem describes how to update prior belief P(H) when you observe evidence E, producing posterior belief P(H|E). The likelihood P(E|H) measures how probable the evidence is under the hypothesis. P(E) is the marginal probability of evidence — often computed via total probability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Bayes' Theorem — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Bayes' Theorem ────────────────────────────────────────\nP(H|E) = P(E|H) × P(H)\n         ───────────────\n              P(E)\nTerms:\n  P(H)    = Prior: belief before seeing evidence\n  P(E|H)  = Likelihood: probability of evidence if H is true\n  P(H|E)  = Posterior: updated belief after evidence\n  P(E)    = Marginal likelihood (normalizing constant)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Bayes' Theorem — common patterns you'll see in production.\n# APPROACH  - Combine Bayes' Theorem with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Classic medical test example ─────────────────────────\nDisease prevalence:     P(D)  = 0.001  (1 in 1000)\nTest sensitivity:  P(+|D)  = 0.99   (true positive rate)\nTest specificity:  P(-|¬D) = 0.99 → P(+|¬D) = 0.01\nP(+) = P(+|D)×P(D) + P(+|¬D)×P(¬D)\n     = 0.99×0.001 + 0.01×0.999\n     = 0.00099 + 0.00999 = 0.01098\nP(D|+) = (0.99 × 0.001) / 0.01098\n       = 0.00099 / 0.01098\n       = 0.0902 ≈ 9%\n→ 99% accurate test, but only 9% posterior probability!\n  Low prevalence dominates. This is why mass screening\n  for rare diseases generates many false positives."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Bayes' Theorem — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Iterative updating ───────────────────────────────────,Receive 3 positive tests sequentially:,Prior → Posterior₁ → Posterior₂ → Posterior₃,0.001 →    0.09    →    0.91    →    0.999"
                  }
        ],
        tips: [
                  "The **base rate** (prior) matters enormously. High sensitivity is useless if disease prevalence is tiny",
                  "Bayes is sequential: today's posterior becomes tomorrow's prior as evidence accumulates",
                  "Odds form is easier to compute: Posterior odds = Likelihood ratio × Prior odds",
                  "Likelihood Ratio (LR) = P(E|H)/P(E|¬H) — LR>1 supports H; LR<1 weakens H"
        ],
        mistake: "Ignoring the base rate (prior). Doctors, lawyers, and journalists routinely misinterpret test results because they fixate on sensitivity/specificity and forget prevalence. Always anchor to the prior.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "combinatorics",
        fn: "Counting: Permutations & Combinations",
        desc: "Count arrangements and selections for probability calculations.",
        category: "General",
        subtitle: "permutations, combinations, factorial, binomial coefficient, sampling",
        signature: "P(n,r) = n!/(n-r)!  |  C(n,r) = n!/[r!(n-r)!]",
        descLong: "Permutations count ordered arrangements (order matters). Combinations count unordered selections (order irrelevant). The binomial coefficient C(n,r) counts the number of ways to choose r items from n — appears throughout probability, statistics, and combinatorics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Counting: Permutations & Combinations — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Permutations (order matters) ─────────────────────────\nn!       = n × (n-1) × (n-2) × ... × 1\nP(n,r)   = n! / (n-r)!\nExample: How many ways to arrange 3 of 5 books?\nP(5,3) = 5! / (5-3)! = 120/2 = 60"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Counting: Permutations & Combinations — common patterns you'll see in production.\n# APPROACH  - Combine Counting: Permutations & Combinations with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Combinations (order doesn't matter) ─────────────────\nC(n,r) = (n  ) = ─────n!─────\n         ( r  )   r!(n-r)!\nExample: How many 5-card poker hands from 52 cards?\nC(52,5) = 52! / (5! × 47!) = 2,598,960\nP(royal flush) = 4 / 2,598,960 ≈ 0.000154%"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Counting: Permutations & Combinations — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Key identities ────────────────────────────────────────,C(n,0) = C(n,n) = 1,C(n,1) = n,C(n,r) = C(n, n-r)          (symmetry),C(n,r) + C(n,r+1) = C(n+1,r+1)  (Pascal's rule),\n── Multiplication principle ─────────────────────────────,If event A has m outcomes and event B has n outcomes,,then A then B has m×n outcomes.,,License plate: 3 letters × 3 digits,= 26³ × 10³ = 17,576,000 plates,\n── With/without replacement ─────────────────────────────,Draw 2 from {A,B,C}:,  With replacement:    9 ordered pairs  (3²),  Without replacement: 6 ordered pairs  (P(3,2)=6),  Without order:       3 pairs          (C(3,2)=3)"
                  }
        ],
        tips: [
                  "Memory trick: **P**ermutations = **P**ositions matter (lock combinations are actually permutations!)",
                  "C(n,2) = n(n-1)/2 = number of pairs — comes up constantly (handshakes, comparison problems)",
                  "Multinomial coefficient n!/(n₁!n₂!...nₖ!) extends C(n,r) to k groups",
                  "Birthday problem: P(≥2 same birthday in n people) = 1 - 365!/[(365-n)! × 365^n] ≈ 0.5 at n=23"
        ],
        mistake: "Using permutations when combinations are needed (or vice versa). Ask: does the ORDER matter? Choosing a committee of 3 from 10 people — order doesn't matter → use C(10,3). Awarding gold/silver/bronze → order matters → P(10,3).",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "expected-value-variance-rules",
        fn: "Expected Value & Variance Rules",
        desc: "Algebraic rules for computing E[X] and Var(X) of transformed variables.",
        category: "General",
        subtitle: "E[X], Var(X), linearity of expectation, variance properties",
        signature: "E[aX+b] = aE[X]+b  |  Var(aX+b) = a²Var(X)  |  Var(X+Y) = Var(X)+Var(Y)+2Cov(X,Y)",
        descLong: "Expected value is linear — the most powerful property in probability. Variance rules are nonlinear. Knowing these rules lets you compute the mean and variance of any transformed or combined random variable without simulating or integrating from scratch.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Expected Value & Variance Rules — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Discrete Expected Value ───────────────────────────────\nE[X] = Σ xᵢ · P(X=xᵢ)\nFair die: E[X] = 1(1/6)+2(1/6)+3(1/6)+4(1/6)+5(1/6)+6(1/6) = 3.5"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Expected Value & Variance Rules — common patterns you'll see in production.\n# APPROACH  - Combine Expected Value & Variance Rules with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Continuous Expected Value ─────────────────────────────\nE[X] = ∫ x · f(x) dx\nUniform(0,1): E[X] = ∫₀¹ x · 1 dx = 1/2"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Expected Value & Variance Rules — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Linearity of Expectation ──────────────────────────────,E[aX + b]     = a·E[X] + b,E[X + Y]      = E[X] + E[Y]     ← ALWAYS (even if dependent!),E[XY]         = E[X]·E[Y]       ← ONLY if X,Y independent,,Example: Roll 3 dice, find E[Sum],E[X₁+X₂+X₃] = E[X₁]+E[X₂]+E[X₃] = 3.5+3.5+3.5 = 10.5,(No need to enumerate 216 outcomes!),\n── Variance Rules ───────────────────────────────────────,Var(X)        = E[X²] - (E[X])²,Var(aX + b)   = a²·Var(X)          (b shifts, doesn't scale),Var(X + Y)    = Var(X) + Var(Y) + 2·Cov(X,Y),Var(X + Y)    = Var(X) + Var(Y)    ← ONLY if independent,Var(X - Y)    = Var(X) + Var(Y)    ← (note: + not -),,SD(aX + b)    = |a|·SD(X),\n── Covariance ────────────────────────────────────────────,Cov(X,Y) = E[(X-μₓ)(Y-μᵧ)] = E[XY] - E[X]E[Y],,Cov(X,X) = Var(X),Cov(aX, bY) = ab·Cov(X,Y),,Cor(X,Y) = Cov(X,Y) / (σₓ·σᵧ)    ← standardized covariance,\n── Portfolio variance example ───────────────────────────,2 assets: w₁=0.6, w₂=0.4, σ₁=0.2, σ₂=0.15, ρ=0.3,,Var(P) = w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂,       = 0.36(0.04) + 0.16(0.0225) + 2(0.6)(0.4)(0.3)(0.2)(0.15),       = 0.0144 + 0.0036 + 0.00432 = 0.02232,SD(P)  = √0.02232 = 14.94%"
                  }
        ],
        tips: [
                  "**E[X+Y] = E[X]+E[Y] always** — even when X and Y are dependent. This is the most-used property in all of probability",
                  "**Var(X+Y) requires independence** or you must add the covariance term — the most commonly forgotten rule",
                  "Var(X-Y) = Var(X)+Var(Y) when independent — NOT Var(X)-Var(Y). Variance is always non-negative",
                  "The portfolio variance formula is the cornerstone of Modern Portfolio Theory — diversification reduces variance when ρ<1"
        ],
        mistake: "Writing Var(X-Y) = Var(X)-Var(Y). Variance cannot be negative. The correct rule is Var(X-Y) = Var(X)+Var(Y) for independent X,Y — the minus sign on Y flips inside the square.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "joint-marginal-conditional",
        fn: "Joint, Marginal & Conditional Distributions",
        desc: "The multivariate probability framework: joint distributions and how to derive marginal and conditional distributions from them.",
        category: "General",
        subtitle: "joint distribution, marginal distribution, conditional distribution, independence",
        signature: "f(x,y) joint  |  fₓ(x) = ∫f(x,y)dy marginal  |  f(x|y) = f(x,y)/f(y)",
        descLong: "The joint distribution describes two or more random variables simultaneously. Marginalizing integrates out (or sums over) the variable you don't want. Conditioning fixes one variable to a specific value. Independence means the joint factors: f(x,y) = fₓ(x)·fᵧ(y).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Joint, Marginal & Conditional Distributions — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Discrete Joint Distribution ──────────────────────────\nX = die roll (1-3), Y = coin flip (0=T, 1=H)\n      X=1   X=2   X=3   P(Y)\n Y=0  1/6   1/6   1/6   1/2    ← marginal P(Y=0)\n Y=1  1/6   1/6   1/6   1/2    ← marginal P(Y=1)\nP(X)  1/3   1/3   1/3    1\n      ↑ marginal P(X)\nIndependence check: P(X=1,Y=0) = 1/6 = P(X=1)·P(Y=0) = 1/3·1/2 ✓"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Joint, Marginal & Conditional Distributions — common patterns you'll see in production.\n# APPROACH  - Combine Joint, Marginal & Conditional Distributions with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Marginal distribution ────────────────────────────────\nDiscrete: P(X=x) = Σᵧ P(X=x, Y=y)\nContinuous: fₓ(x) = ∫₋∞^∞ f(x,y) dy"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Joint, Marginal & Conditional Distributions — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Conditional distribution ─────────────────────────────,P(X=x | Y=y) = P(X=x, Y=y) / P(Y=y),,Continuous: f(x|y) = f(x,y) / fᵧ(y),\n── Covariance matrix ────────────────────────────────────,For vector X = [X₁, X₂, ..., Xₚ]:,,Σ = Cov(X) = E[(X-μ)(X-μ)ᵀ],,    [Var(X₁)    Cov(X₁,X₂)  Cov(X₁,X₃)],    [Cov(X₂,X₁)  Var(X₂)    Cov(X₂,X₃)],    [Cov(X₃,X₁)  Cov(X₃,X₂)  Var(X₃)  ],,Diagonal = variances,Off-diagonal = covariances,Symmetric: Cov(Xᵢ,Xⱼ) = Cov(Xⱼ,Xᵢ),Positive semi-definite: all eigenvalues ≥ 0,\n── Multivariate Normal ───────────────────────────────────,X ~ MVN(μ, Σ),f(x) = (2π)^(-p/2)|Σ|^(-1/2) exp(-½(x-μ)ᵀΣ⁻¹(x-μ)),,Marginals of MVN are Normal,Conditionals of MVN are Normal,Linear combinations of MVN are Normal"
                  }
        ],
        tips: [
                  "Marginalizing = summing/integrating over the variable you want to remove — 'averaging out' one dimension",
                  "If f(x,y) = g(x)·h(y) for some functions g,h then X and Y are independent (factorization criterion)",
                  "The covariance matrix Σ must be positive semi-definite — negative variances are impossible",
                  "Correlation matrix = D⁻¹ΣD⁻¹ where D = diag(σ₁,...,σₚ) — standardized covariance matrix"
        ],
        mistake: "Assuming uncorrelated implies independent. For jointly normal variables, zero correlation DOES imply independence. But for non-normal distributions, zero correlation is compatible with strong dependence.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "lln-mgf",
        fn: "Law of Large Numbers & MGF",
        desc: "LLN guarantees sample means converge; MGFs uniquely characterize distributions.",
        category: "General",
        subtitle: "law of large numbers, moment generating function, convergence",
        signature: "X̄ →ᵖ μ (WLLN)  |  M_X(t) = E[e^(tX)]",
        descLong: "The Law of Large Numbers says sample averages converge to the true mean. The Weak LLN (WLLN) gives convergence in probability; the Strong LLN gives almost-sure convergence. Moment Generating Functions (MGFs) uniquely characterize a distribution and provide a systematic way to compute all moments.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Law of Large Numbers & MGF — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Weak Law of Large Numbers ─────────────────────────────\nFor iid X₁,...,Xₙ with E[Xᵢ]=μ and Var(Xᵢ)=σ²<∞:\nX̄ₙ →ᵖ μ  (converges in probability)\nFormally: P(|X̄ₙ - μ| > ε) → 0 as n → ∞, for any ε>0\nProof via Chebyshev: P(|X̄-μ|>ε) ≤ Var(X̄)/ε² = σ²/(nε²) → 0"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Law of Large Numbers & MGF — common patterns you'll see in production.\n# APPROACH  - Combine Law of Large Numbers & MGF with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Strong Law ────────────────────────────────────────────\nP(X̄ₙ → μ) = 1  (almost sure convergence — stronger statement)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Law of Large Numbers & MGF — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Implications ─────────────────────────────────────────,• Frequency interpretation of probability (long-run),• Casino always wins in the long run,• Monte Carlo simulation converges,• Consistent estimators (sample mean → population mean),\n── Moment Generating Function ────────────────────────────,M_X(t) = E[e^(tX)] = Σ xᵢ e^(txᵢ) P(xᵢ)  or  ∫ e^(tx) f(x)dx,,Key property: M_X^(k)(0) = E[X^k]  (kth derivative at 0 = kth moment),,E[X]   = M'(0),E[X²]  = M''(0),Var(X) = M''(0) - [M'(0)]²,\n── Common MGFs ───────────────────────────────────────────,Bernoulli(p):   M(t) = 1-p + pe^t,Binomial(n,p):  M(t) = (1-p+pe^t)^n,Poisson(λ):     M(t) = exp(λ(e^t - 1)),Normal(μ,σ²):   M(t) = exp(μt + σ²t²/2),Exponential(λ): M(t) = λ/(λ-t)  for t<λ,\n── MGF uniqueness theorem ────────────────────────────────,If two distributions have the same MGF (wherever it exists),,they are the same distribution.,→ MGF of N(μ,σ²) is unique → proves CLT rigorously"
                  }
        ],
        tips: [
                  "LLN ≠ CLT: LLN says X̄ converges to μ (scalar); CLT describes the distribution of √n(X̄-μ) (shape)",
                  "The Gambler's Fallacy violates LLN: past outcomes don't 'correct' future ones. LLN requires n→∞, not compensation",
                  "MGFs don't always exist (e.g., Cauchy distribution has no MGF) — characteristic functions (using e^(itX)) always exist",
                  "Sum of independent variables: M_{X+Y}(t) = M_X(t)·M_Y(t) — makes summing distributions easy"
        ],
        mistake: "Confusing LLN with the Gambler's Fallacy. LLN says the average converges — it doesn't say early bad runs get 'corrected.' A coin that has shown 10 heads still has P(H)=0.5 on the next flip.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },

  // ── Section 2: Distributions & Sampling ─────────────────────────────────────────
  {
    id: "distributions-sampling",
    title: "Distributions & Sampling",
    entries: [
      {
        id: "normal-distribution",
        fn: "Normal Distribution",
        desc: "The bell curve — the central distribution of statistics.",
        category: "General",
        subtitle: "Gaussian distribution, z-score, standard normal, empirical rule",
        signature: "X ~ N(μ, σ²)  |  Z = (X-μ)/σ ~ N(0,1)",
        descLong: "The normal distribution is the most important in statistics. It's fully described by μ and σ. The standard normal Z ~ N(0,1) is the basis for z-scores and z-tables. The Central Limit Theorem guarantees that sample means approximate normality regardless of population distribution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Normal Distribution — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── PDF & Properties ──────────────────────────────────────\nf(x) = (1/σ√2π) × exp(-(x-μ)²/2σ²)\nMean = μ,  Median = μ,  Mode = μ   (all equal)\nVariance = σ²,   Skewness = 0,   Excess kurtosis = 0"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Normal Distribution — common patterns you'll see in production.\n# APPROACH  - Combine Normal Distribution with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Empirical Rule (68-95-99.7) ──────────────────────────\n┌────────────────────────────────────────────────────┐\n│                   Normal Curve                     │\n│                    ████                            │\n│                 ██████████                         │\n│               ██████████████                       │\n│   ├─────────────────────────────────────────┤      │\n│   μ-3σ  μ-2σ  μ-1σ   μ   μ+1σ  μ+2σ  μ+3σ      │\n│                                                    │\n│   ├──────── 68.27% ────────┤                       │\n│   ├────────────── 95.45% ──────────────┤           │\n│   ├──────────────────── 99.73% ─────────────────┤  │\n└────────────────────────────────────────────────────┘"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Normal Distribution — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Z-score ───────────────────────────────────────────────,Z = (X - μ) / σ,,Example: IQ scores ~ N(100, 15²),P(IQ > 130) = P(Z > (130-100)/15) = P(Z > 2.0) = 2.28%,P(85 < IQ < 115) = P(-1 < Z < 1) = 68.27%,\n── Key Z values ─────────────────────────────────────────,Z = ±1.645  → 90% of distribution (5% each tail),Z = ±1.960  → 95% of distribution (2.5% each tail),Z = ±2.576  → 99% of distribution (0.5% each tail),Z = ±3.291  → 99.9% of distribution"
                  }
        ],
        tips: [
                  "Z-score tells you how many standard deviations a value is from the mean — compare across different scales",
                  "**68-95-99.7 rule** is critical: memorize it. Most values in 2σ; almost all in 3σ",
                  "Normal distribution is symmetric → P(X > μ+k) = P(X < μ-k) always",
                  "Log-normal distribution: if ln(X) is normal, X is log-normal — common for stock prices, income"
        ],
        mistake: "Assuming all data is normally distributed. Before using z-scores or normal-based tests, check: Q-Q plot, Shapiro-Wilk test, or histogram. Many real-world distributions are skewed, heavy-tailed, or multimodal.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "binomial-distribution",
        fn: "Binomial Distribution",
        desc: "Count successes in n independent yes/no trials.",
        category: "General",
        subtitle: "Bernoulli trials, binomial PMF, cumulative binomial, normal approximation",
        signature: "X ~ Bin(n, p)  |  P(X=k) = C(n,k)·pᵏ·(1-p)^(n-k)",
        descLong: "The binomial distribution models the number of successes in n independent Bernoulli trials, each with success probability p. Mean = np, Variance = np(1-p). For large n, approximates Normal. For small p with large n, approximates Poisson(λ=np).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Binomial Distribution — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── PMF ───────────────────────────────────────────────────\nP(X=k) = C(n,k) × pᵏ × (1-p)^(n-k)\nMean:     E[X] = np\nVariance: Var(X) = np(1-p)\nStd Dev:  σ = √(np(1-p))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Binomial Distribution — common patterns you'll see in production.\n# APPROACH  - Combine Binomial Distribution with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Example: Quality Control ─────────────────────────────\nDefect rate p=0.05, sample n=20 units\nX = number of defects ~ Bin(20, 0.05)\nE[X] = 20 × 0.05 = 1  (expect 1 defect)\nVar(X) = 20 × 0.05 × 0.95 = 0.95\nP(X=0) = C(20,0) × 0.05⁰ × 0.95²⁰ = 0.358\nP(X=1) = C(20,1) × 0.05¹ × 0.95¹⁹ = 0.377\nP(X≤2) = P(0)+P(1)+P(2)           = 0.925\nP(X≥3) = 1 - P(X≤2)               = 0.075"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Binomial Distribution — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Approximations ───────────────────────────────────────,              Use Normal when: n large, p not near 0 or 1,Rule of thumb: np ≥ 5  AND  n(1-p) ≥ 5,  → X ≈ N(np, np(1-p)),  → Apply continuity correction: P(X≤k) ≈ P(Z≤(k+0.5-np)/σ),,              Use Poisson when: n large, p very small,  → λ = np,  → X ≈ Poisson(λ),\n── Negative Binomial (extension) ────────────────────────,P(need k trials to get r successes):,P(X=k) = C(k-1,r-1) × pʳ × (1-p)^(k-r)"
                  }
        ],
        tips: [
                  "Check assumptions: independent trials, constant p, fixed n, binary outcome — all must hold",
                  "Continuity correction for normal approximation: `P(X ≤ 5) ≈ P(Z ≤ 5.5)` — add 0.5 for ≤, subtract 0.5 for <",
                  "CDF for ≤ questions: compute cumulative sum P(X=0)+P(X=1)+...+P(X=k)",
                  "Binomial coefficient C(n,k) can overflow for large n — use logarithms: log P(X=k) = log C(n,k) + k log p + (n-k) log(1-p)"
        ],
        mistake: "Applying binomial when trials are NOT independent. Sampling without replacement → use Hypergeometric distribution. Binomial requires independence (or replacement).",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "poisson-distribution",
        fn: "Poisson Distribution",
        desc: "Count rare events in a fixed time/space interval.",
        category: "General",
        subtitle: "Poisson PMF, rate parameter, exponential waiting time, Poisson process",
        signature: "X ~ Poisson(λ)  |  P(X=k) = e^(-λ)·λᵏ/k!",
        descLong: "The Poisson distribution models the number of events in a fixed interval when events occur independently at constant rate λ. Mean = Variance = λ (unique property). Used for website hits, insurance claims, radioactive decay, customer arrivals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Poisson Distribution — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── PMF ───────────────────────────────────────────────────\nP(X=k) = e^(-λ) × λᵏ / k!\nMean = Variance = λ"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Poisson Distribution — common patterns you'll see in production.\n# APPROACH  - Combine Poisson Distribution with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Example: Call center ─────────────────────────────────\nAverage calls per hour: λ = 8\nX = calls in one hour ~ Poisson(8)\nP(X=5) = e^(-8) × 8⁵ / 5!\n       = 0.000335 × 32768 / 120\n       = 0.0916 (9.16%)\nP(X=0) = e^(-8) = 0.000335  (very quiet hour)\nP(X≥15) = 1 - P(X≤14) ≈ 0.031\nE[X] = 8 calls,  SD = √8 = 2.83"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Poisson Distribution — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Rate scaling ─────────────────────────────────────────,If λ is per hour, scale for different time windows:,  Per minute:   λ/60 = 0.133,  Per 30 min:   λ/2  = 4,  Per 2 hours:  2λ   = 16,\n── Poisson Process properties ───────────────────────────,• Events independent across non-overlapping intervals,• Rate λ is constant (stationary),• No two events simultaneous (ordinary),• Time between events ~ Exponential(λ),\n── Overdispersion check ─────────────────────────────────,Poisson requires Var = Mean,If Var >> Mean → Negative Binomial fits better,If Var << Mean → Zero-inflated model may be needed"
                  }
        ],
        tips: [
                  "Poisson is the limit of Binomial as n→∞ and p→0 with np=λ constant",
                  "Sum of independent Poisson variables: X~Pois(λ₁)+Y~Pois(λ₂) = Pois(λ₁+λ₂)",
                  "For λ>30, Normal approximation works well: N(λ, λ)",
                  "Variance = Mean is a diagnostic: if sample variance >> sample mean, data is overdispersed — Poisson is wrong model"
        ],
        mistake: "Ignoring overdispersion. Real count data (web traffic, claims) often has Variance >> Mean because of unobserved heterogeneity. Forcing Poisson on overdispersed data gives wrong standard errors. Use Negative Binomial.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "other-distributions",
        fn: "t / Chi-Square / F / Exponential / Uniform",
        desc: "Key distributions for inference, goodness-of-fit, and process modeling.",
        category: "General",
        subtitle: "geometric, negative binomial, hypergeometric, uniform, exponential, gamma",
        signature: "t(df) | χ²(df) | F(df₁,df₂) | Exp(λ) | U(a,b)",
        descLong: "The t-distribution is the basis for small-sample inference. Chi-squared for goodness-of-fit and variance tests. F for comparing variances and ANOVA. Exponential for time-to-event. Uniform for random number generation and no-prior-information assumptions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of t / Chi-Square / F / Exponential / Uniform — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Student's t-distribution ─────────────────────────────\nX ~ t(df)  where df = degrees of freedom\n• Symmetric, bell-shaped, heavier tails than normal\n• As df→∞, t→N(0,1)\n• Used when σ unknown and n small\nCritical values t(α/2, df):\n  df=5:   t.025 = 2.571\n  df=10:  t.025 = 2.228\n  df=30:  t.025 = 2.042\n  df=∞:   t.025 = 1.960 (= Z)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of t / Chi-Square / F / Exponential / Uniform — common patterns you'll see in production.\n# APPROACH  - Combine t / Chi-Square / F / Exponential / Uniform with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Chi-Square distribution ──────────────────────────────\nX ~ χ²(df)   where df = degrees of freedom\n• Non-negative, right-skewed (more symmetric as df grows)\n• Sum of df squared standard normals: Σ Zᵢ²\n• Mean = df,  Variance = 2·df\nUses: goodness-of-fit, independence tests, variance CIs"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of t / Chi-Square / F / Exponential / Uniform — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── F-distribution ───────────────────────────────────────,X ~ F(df₁, df₂),,• Ratio of two χ² / their dfs,• Always non-negative,,Uses: ANOVA F-test, comparing two variances,\n── Exponential distribution ─────────────────────────────,X ~ Exp(λ)   λ = rate parameter,,P(X>t) = e^(-λt)           (survival function),Mean = 1/λ,  Variance = 1/λ²,Memoryless: P(X>s+t|X>s) = P(X>t),,Example: λ=2 failures/hour → mean time to failure = 0.5 hr,\n── Uniform distribution ─────────────────────────────────,X ~ U(a,b),f(x) = 1/(b-a)  for a ≤ x ≤ b,Mean = (a+b)/2,  Variance = (b-a)²/12"
                  }
        ],
        tips: [
                  "t-distribution with >30 df is nearly identical to Normal — the distinction matters most for n<15",
                  "Chi-squared is always right-skewed for small df — don't expect it to look like a bell curve",
                  "The **memoryless property** of Exponential: a lightbulb that has lasted 1000 hours is no more likely to fail soon than a new one (if failures are Poisson)",
                  "F(1, df₂) = t²(df₂) — the F-test in simple regression is the square of the t-test"
        ],
        mistake: "Using z-tests when you should use t-tests. Use z only when σ is KNOWN (rare in practice). Whenever you estimate σ from data, use t. With large n it barely matters, but with small n it matters enormously.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "clt",
        fn: "Central Limit Theorem",
        desc: "Sample means approach normality regardless of population distribution.",
        category: "General",
        subtitle: "central limit theorem, sampling distribution, convergence in distribution",
        signature: "X̄ ~ N(μ, σ²/n)  as n→∞",
        descLong: "The Central Limit Theorem (CLT) states that the distribution of sample means X̄ approaches N(μ, σ²/n) as sample size n increases, regardless of the population's distribution shape. This is why normal-based inference works even when raw data is not normal.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Central Limit Theorem — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── CLT Statement ─────────────────────────────────────────\nIf X₁, X₂, ..., Xₙ are iid with mean μ and variance σ²,\nthen as n → ∞:\nX̄ = (X₁+X₂+...+Xₙ)/n  ~  N(μ, σ²/n)\nOr equivalently:   Z = (X̄ - μ) / (σ/√n)  ~  N(0,1)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Central Limit Theorem — common patterns you'll see in production.\n# APPROACH  - Combine Central Limit Theorem with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Standard Error ───────────────────────────────────────\nSE = σ/√n   (std dev of the sampling distribution of X̄)\nKey insight: SE shrinks with √n\n  n=100: SE = σ/10\n  n=400: SE = σ/20  (4× more data → 2× more precision)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Central Limit Theorem — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Practical example ────────────────────────────────────,Population: Exponential(λ=1), μ=1, σ²=1  (heavily skewed),,Sample n=5:   X̄ is still somewhat skewed,Sample n=30:  X̄ is approximately normal,Sample n=100: X̄ is very well approximated by N(1, 1/100),\n── Convergence rate ─────────────────────────────────────,Rule of thumb for n ≥ 30:,  • Works well for approximately symmetric populations,  • Skewed populations may need n ≥ 100-1000,  • Already-normal populations work for any n,\n── The two key consequences ─────────────────────────────,1) We can build confidence intervals using Z or t,   even when raw data isn't normal (large n),,2) Sample means are less variable than individual obs,   → averaging reduces noise by factor √n"
                  }
        ],
        tips: [
                  "CLT applies to the **mean** — not to individual observations. Raw data distributions don't change with sample size",
                  "The required n depends on how non-normal the population is — more skewed needs larger n",
                  "CLT breaks for infinite-variance distributions (Cauchy, Pareto with α<2)",
                  "The sum version: Sₙ = ΣXᵢ ~ N(nμ, nσ²) — both sum and mean converge to normal"
        ],
        mistake: "Applying CLT to conclude raw data is normal. CLT says the SAMPLING DISTRIBUTION of X̄ is approximately normal — not that individual observations are. Always check the raw data separately.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "confidence-intervals",
        fn: "Confidence Intervals",
        desc: "Interval estimates that capture the true parameter with stated frequency.",
        category: "General",
        subtitle: "CI for mean, CI for proportion, t-distribution, margin of error",
        signature: "CI: x̄ ± z*(σ/√n)  or  x̄ ± t*(s/√n)",
        descLong: "A 95% confidence interval means: if we repeat the sampling procedure many times, 95% of the resulting intervals will contain the true parameter. It does NOT mean there's a 95% chance the true parameter is in this specific interval — the true value is fixed, not random.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Confidence Intervals — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── CI for population mean (σ known) — use Z ────────────\nCI = x̄ ± z*(σ/√n)\nz* values: 90% → 1.645,  95% → 1.960,  99% → 2.576\nExample: n=64, x̄=50, σ=16, 95% CI\nSE = 16/√64 = 2.0\nCI = 50 ± 1.960 × 2.0 = (46.08, 53.92)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Confidence Intervals — common patterns you'll see in production.\n# APPROACH  - Combine Confidence Intervals with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── CI for population mean (σ unknown) — use t ──────────\nCI = x̄ ± t*(s/√n)   where df = n-1\nExample: n=16, x̄=50, s=16, 95% CI\nt*(15 df) = 2.131\nSE = 16/√16 = 4.0\nCI = 50 ± 2.131 × 4.0 = (41.48, 58.52)\n→ Wider than Z interval because of σ uncertainty"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Confidence Intervals — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── CI for proportion ────────────────────────────────────,CI = p̂ ± z* × √(p̂(1-p̂)/n),,Condition: np̂ ≥ 10  and  n(1-p̂) ≥ 10,,Example: n=400, 60 successes, p̂=0.15, 95% CI,SE = √(0.15×0.85/400) = 0.01786,CI = 0.15 ± 1.960 × 0.01786 = (0.115, 0.185),\n── CI for difference of two means ───────────────────────,CI = (x̄₁-x̄₂) ± t* × √(s₁²/n₁ + s₂²/n₂),,df = Welch-Satterthwaite approximation (complex formula),or use software"
                  }
        ],
        tips: [
                  "Wider CI = less information (small n) or higher confidence level — there's always a tradeoff",
                  "**Correct interpretation**: 'We are 95% confident the true mean lies in (46, 54)' — NOT '95% probability'",
                  "Margin of error = z* × SE — half the CI width",
                  "To halve margin of error: quadruple sample size (because SE ∝ 1/√n)"
        ],
        mistake: "Interpreting a CI as a probability statement about the parameter: 'There's a 95% chance μ is in this interval.' The true μ is fixed — it either IS or ISN'T in the interval. The probability refers to the PROCEDURE, not this specific interval.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "continuous-distributions",
        fn: "Beta / Gamma / Weibull / Log-Normal",
        desc: "Continuous distributions for proportions, waiting times, and skewed data.",
        category: "General",
        subtitle: "PDF, CDF, quantile function, continuous random variables",
        signature: "Beta(α,β) | Gamma(α,β) | Weibull(k,λ) | LogNormal(μ,σ²)",
        descLong: "The Beta distribution models probabilities and proportions (bounded [0,1]). The Gamma generalizes the Exponential to multiple events and includes chi-squared as a special case. Weibull models time-to-failure with non-constant hazard. Log-Normal models multiplicative processes — income, stock prices, concentrations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Beta / Gamma / Weibull / Log-Normal — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Beta Distribution ─────────────────────────────────────\nX ~ Beta(α, β)    support: (0,1)\nf(x) = x^(α-1)(1-x)^(β-1) / B(α,β)\nE[X] = α/(α+β)\nVar(X) = αβ / [(α+β)²(α+β+1)]\nShapes:  α=β=1 → Uniform(0,1)\n         α=β>1 → symmetric, unimodal, bell-like\n         α>β   → right-skewed (mode near 1)\n         α<1,β<1 → U-shaped (bimodal at 0 and 1)\nBayesian conjugate prior for Binomial likelihood\n→ Beta(α+k, β+n-k) after observing k successes in n trials"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Beta / Gamma / Weibull / Log-Normal — common patterns you'll see in production.\n# APPROACH  - Combine Beta / Gamma / Weibull / Log-Normal with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Gamma Distribution ───────────────────────────────────\nX ~ Gamma(α, β)   (shape α, rate β)\nE[X] = α/β,   Var(X) = α/β²\nSpecial cases:\n  Gamma(1, β)     = Exponential(β)\n  Gamma(k/2, 1/2) = Chi-squared(k)\n  Sum of α independent Exp(β) → Gamma(α, β)\nTime to αth event in Poisson process with rate β"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Beta / Gamma / Weibull / Log-Normal — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Weibull Distribution ─────────────────────────────────,X ~ Weibull(k, λ)   (shape k, scale λ),,S(t) = P(X>t) = exp(-(t/λ)^k)   survival function,h(t) = k/λ · (t/λ)^(k-1)         hazard function,,k < 1: decreasing hazard (infant mortality / burn-in),k = 1: constant hazard = Exponential(1/λ),k > 1: increasing hazard (wear-out / aging),\n── Log-Normal Distribution ──────────────────────────────,X ~ LogNormal(μ, σ²)  ↔  ln(X) ~ Normal(μ, σ²),,E[X]   = exp(μ + σ²/2),Median = exp(μ)              ← geometric mean,Var(X) = (e^σ² - 1)·e^(2μ+σ²),,When to use: prices, incomes, concentrations, lifetimes,Symptom: data is positive & right-skewed → try log transform"
                  }
        ],
        tips: [
                  "Beta(1,1) = Uniform(0,1) — all probabilities equally likely. Bayesian non-informative prior for a proportion",
                  "Weibull k>1 means the older something is, the more likely it is to fail — relevant for mechanical wear",
                  "If data is log-normal, apply log transform then use normal-based methods",
                  "Gamma(n/2, 1/2) = Chi-squared(n) — the chi-square distribution IS a Gamma with specific parameters"
        ],
        mistake: "Using an Exponential distribution when the hazard rate is not constant. Real-world failure/survival data almost always has non-constant hazard. Use Weibull (parametric) or Kaplan-Meier (non-parametric) instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "discrete-distributions-extended",
        fn: "Geometric / Negative Binomial / Hypergeometric",
        desc: "Discrete distributions for waiting times, overdispersed counts, and sampling without replacement.",
        category: "General",
        subtitle: "PMF, CDF, discrete random variables, expected value",
        signature: "Geom(p) | NegBin(r,p) | Hypergeom(N,K,n)",
        descLong: "The Geometric distribution models the number of trials until the first success. Negative Binomial models trials until r successes — or overdispersed count data. Hypergeometric models sampling without replacement from a finite population (unlike Binomial which assumes replacement or infinite population).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Geometric / Negative Binomial / Hypergeometric — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Geometric Distribution ───────────────────────────────\nX = trials until first success  X ~ Geom(p)\nP(X=k) = (1-p)^(k-1) · p      k = 1, 2, 3, ...\nE[X]   = 1/p\nVar(X) = (1-p)/p²\nMemoryless: P(X>m+n | X>m) = P(X>n)\nExample: p=0.1 (10% click rate)\nE[impressions until click] = 1/0.1 = 10\nP(click on 1st) = 0.1\nP(need >5)      = (0.9)⁴ = 0.656"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Geometric / Negative Binomial / Hypergeometric — common patterns you'll see in production.\n# APPROACH  - Combine Geometric / Negative Binomial / Hypergeometric with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Negative Binomial ────────────────────────────────────\nX = trials until rth success  X ~ NegBin(r, p)\nP(X=k) = C(k-1, r-1) · pʳ · (1-p)^(k-r)   k = r, r+1,...\nE[X]   = r/p\nVar(X) = r(1-p)/p²\nCount data version: Y = number of failures before rth success\nVar(Y) = r(1-p)/p²  — can be >> E[Y] (overdispersion!)\n→ NegBin is the standard model for overdispersed count data"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Geometric / Negative Binomial / Hypergeometric — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Hypergeometric Distribution ──────────────────────────,Population N, K successes, draw n without replacement,X = successes in draw  X ~ Hypergeom(N, K, n),,P(X=k) = C(K,k)·C(N-K, n-k) / C(N,n),E[X]   = n·K/N,Var(X) = n·(K/N)·(1-K/N)·(N-n)/(N-1),                              ↑,                  Finite population correction (FPC),                  → 0 as n/N → 0 (approaches Binomial),,Example: Lot of 50 items, 5 defective, inspect 10,P(X=1) = C(5,1)·C(45,9) / C(50,10),E[X] = 10·5/50 = 1 defective expected,,FPC: if sampling <5% of population, Binomial ≈ Hypergeometric"
                  }
        ],
        tips: [
                  "Geometric is Poisson's discrete-time cousin for waiting times — same memoryless property",
                  "Negative Binomial for count data: when `var >> mean` in your data, use NegBin instead of Poisson",
                  "Hypergeometric applies when sampling without replacement from a KNOWN finite population — quality control, card games, clinical trials with small N",
                  "As N→∞, Hypergeometric → Binomial (finite population correction → 1)"
        ],
        mistake: "Using Binomial for sampling without replacement from a small population. Drawing 10 cards from a 52-card deck changes the probabilities for each draw — that's Hypergeometric, not Binomial.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "correlation-covariance",
        fn: "Correlation / Covariance Matrix",
        desc: "Measure strength and direction of linear relationships.",
        category: "General",
        subtitle: "Pearson correlation, Spearman rank, covariance matrix, correlation matrix",
        signature: "r = Cov(X,Y)/(σₓ·σᵧ)  |  ρ (rank correlation)  |  Σ = Cov(X)",
        descLong: "Correlation (r) ranges from -1 to +1, measuring linear relationship. Covariance measures joint variation. The correlation matrix summarizes pairwise correlations. Partial correlation controls for confounders.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Correlation / Covariance Matrix — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Pearson correlation (parametric) ───────────────────\nx <- c(1, 2, 3, 4, 5)\ny <- c(2, 4, 5, 4, 6)\ncor(x, y)                    # Pearson r ≈ 0.91\ncor.test(x, y)               # p-value, CI\n# ── Spearman / Kendall (rank-based) ────────────────────────\ncor(x, y, method='spearman') # ρ (rho)\ncor(x, y, method='kendall')  # τ (tau)\n# These are robust to outliers and non-linearity\n# ── Correlation matrix ────────────────────────────────────\ndf <- data.frame(\n  height = c(170, 175, 180, 165, 178),\n  weight = c(70, 75, 85, 60, 82),\n  age    = c(25, 30, 35, 22, 28)\n)\ncor(df[, sapply(df, is.numeric)])\n#        height weight  age\n# height 1.000  0.950  0.912\n# weight 0.950  1.000  0.885\n# age    0.912  0.885  1.000"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Correlation / Covariance Matrix — common patterns you'll see in production.\n# APPROACH  - Combine Correlation / Covariance Matrix with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Covariance matrix ──────────────────────────────────────\ncov(df)\n# Diagonal = variances, off-diagonal = covariances\n# ── Convert covariance to correlation ─────────────────────\nS <- cov(df)\nD <- diag(sqrt(diag(S)))  # std dev diagonal matrix\nD_inv <- solve(D)\ncorr <- D_inv %*% S %*% D_inv  # standardize\n# Or use cov2cor():\ncov2cor(S)\n# ── Partial correlation: control for confounders ────────────\n# ppcor package: partial_cor(data, target, control_vars)\n# Or manually: residuals of x~z regressed on residuals of y~z\n# ── Confidence intervals for correlation ────────────────────\n# Fisher z-transformation:\nr <- 0.7\nn <- 50\nz <- 0.5 * log((1+r)/(1-r))\nse <- 1/sqrt(n-3)\nci_z <- z + c(-1.96, 1.96) * se\nci_r <- (exp(2*ci_z) - 1) / (exp(2*ci_z) + 1)\n# CI for r ≈ [0.52, 0.82]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Correlation / Covariance Matrix — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Correlation heatmap (visually) ────────────────────────\n# library(ggplot2)\n# library(reshape2)\n# melted <- melt(cor(df))\n# ggplot(melted, aes(Var1, Var2, fill=value)) +\n#   geom_tile() +\n#   scale_fill_gradient2(limits=c(-1, 1))\n# ── Testing independence (H0: r=0) ────────────────────────\n# cor.test() gives t-statistic and p-value\n# t = r√(n-2) / √(1-r²)\n# df = n-2"
                  }
        ],
        tips: [
                  "Spearman is robust to outliers and nonlinearity — use when Pearson suspects non-normal data",
                  "r close to 0 doesn't mean independent — could be nonlinear dependence",
                  "Always visualize with scatterplot before reporting correlation",
                  "Partial correlation: what remains after controlling for other variables"
        ],
        mistake: "Interpreting high correlation as causation. Correlation ≠ causation; may be confounding or reverse causality.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "quantiles-percentiles",
        fn: "Quantiles / Percentiles / Quartiles",
        desc: "Divide distribution into equal-sized groups.",
        category: "General",
        subtitle: "quartiles, percentiles, deciles, quantile function, box plot",
        signature: "Quantile(p) = value below which p fraction of data falls",
        descLong: "Quantiles divide ordered data. The p-th quantile is where p% of data falls below. Quartiles (0.25, 0.5, 0.75) divide into fourths. Deciles divide into tenths. Percentiles divide into hundredths.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Quantiles / Percentiles / Quartiles — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nx <- c(2, 4, 4, 5, 6, 7, 7, 8, 9, 13)\n# ── Built-in quantile ──────────────────────────────────────\nquantile(x)\n#   0%   25%   50%   75%   100%\n#   2     4.75   6.5   7.5   13\n# Specific quantiles:\nquantile(x, c(0.25, 0.5, 0.75))   # Q1, Q2 (median), Q3\nquantile(x, seq(0, 1, 0.1))       # deciles\n# ── Quartiles and IQR ──────────────────────────────────────\nQ1 <- quantile(x, 0.25)       # 4.75\nQ2 <- quantile(x, 0.50)       # 6.5 (median)\nQ3 <- quantile(x, 0.75)       # 7.5\nIQR_val <- Q3 - Q1             # 2.75\n# ── Outlier detection (Tukey fences) ───────────────────────\nlower_fence <- Q1 - 1.5 * IQR_val\nupper_fence <- Q3 + 1.5 * IQR_val\n# Outliers: values < lower_fence or > upper_fence"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Quantiles / Percentiles / Quartiles — common patterns you'll see in production.\n# APPROACH  - Combine Quantiles / Percentiles / Quartiles with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── ECDF: Empirical Cumulative Distribution ────────────────\n# F(x) = fraction of data ≤ x\nplot(ecdf(x))\n# Shows proportion of data ≤ each x value\n# Get ECDF value for specific point:\nFn <- ecdf(x)\nFn(5)   # 0.4  (40% of data ≤ 5)\n# ── Quantile-Quantile (Q-Q) plot: test normality ──────────\nqqnorm(x)\nqqline(x)\n# If points follow the line → approximately normal\n# ── Accessing percentiles programmatically ─────────────────\npercentile_90 <- quantile(x, 0.90)\npercentile_95 <- quantile(x, 0.95)\npercentile_99 <- quantile(x, 0.99)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Quantiles / Percentiles / Quartiles — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Probability a value is below a percentile:\npnorm(percentile_90, mean=mean(x), sd=sd(x))  # ~0.90 if normal\n# ── Type argument in quantile ──────────────────────────────\n# Different interpolation methods between order statistics\nquantile(x, 0.5, type=1)  # R default: inverted ECDF\nquantile(x, 0.5, type=7)  # R's default quantile()\n# All should give similar results for large n"
                  }
        ],
        tips: [
                  "Quartiles (Q1, Q2=median, Q3) are far more interpretable than mean/sd for skewed data",
                  "IQR is robust to outliers — use for outlier detection",
                  "Q-Q plot visually shows departure from normality",
                  "Percentiles are 0-100 scale; quantiles are 0-1 scale (sometimes used interchangeably)"
        ],
        mistake: "Using quantile() with different type arguments without knowing which one. Stick with type=7 (the default in R).",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "outlier-detection",
        fn: "Outlier Detection Methods",
        desc: "Identify anomalous observations.",
        category: "General",
        subtitle: "z-score method, IQR method, modified z-score, Tukey fences",
        signature: "Outlier if |z| > 3  or  x < Q1-1.5·IQR  or  x > Q3+1.5·IQR",
        descLong: "Outliers are extreme values that may indicate data entry errors, rare events, or important subgroups. IQR-based detection is robust. Z-scores work for normally distributed data. Mahalanobis distance handles multivariate data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Outlier Detection Methods — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── IQR method (Tukey fences) ──────────────────────────\nx <- c(1, 2, 3, 4, 5, 100)  # 100 is obvious outlier\nQ1 <- quantile(x, 0.25)\nQ3 <- quantile(x, 0.75)\nIQR_val <- Q3 - Q1\nlower <- Q1 - 1.5 * IQR_val\nupper <- Q3 + 1.5 * IQR_val\n# Outliers:\noutliers_iqr <- x < lower | x > upper\nx[outliers_iqr]  # 100\n# ── Z-score method ────────────────────────────────────────\nz_scores <- (x - mean(x)) / sd(x)\noutliers_z <- abs(z_scores) > 3\nx[outliers_z]  # points > 3σ from mean\n# ── Modified Z-score (robust) ──────────────────────────────\n# Uses median and MAD instead of mean/SD\nmed <- median(x)\nmad <- median(abs(x - med))\nmod_z <- 0.6745 * (x - med) / mad\noutliers_mod_z <- abs(mod_z) > 3.5\nx[outliers_mod_z]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Outlier Detection Methods — common patterns you'll see in production.\n# APPROACH  - Combine Outlier Detection Methods with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Mahalanobis distance (multivariate) ───────────────────\ndf <- data.frame(\n  x = c(1, 2, 3, 4, 5, 100),\n  y = c(1, 2, 3, 4, 5, 100)\n)\nmean_vec <- colMeans(df)\ncov_mat <- cov(df)\nD2 <- mahalanobis(df, center=mean_vec, cov=cov_mat)\n# Chi-square(p) distribution for thresholding\nthreshold <- qchisq(0.99, df=ncol(df))  # 99th percentile\noutliers_maha <- D2 > threshold\n# ── Isolation Forest (anomaly detection) ──────────────────\n# Splits recursively; outliers isolated quickly\n# library(isofor)  # or sklearn equivalent in Python\n# Not built-in to R\n# ── Visual inspection (simplest!) ──────────────────────────\nboxplot(x)   # boxplot flags outliers automatically\n# Points beyond whiskers are outliers"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Outlier Detection Methods — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Handling outliers ──────────────────────────────────────\n# Option 1: Remove (only if data entry error)\nx_clean <- x[!outliers_iqr]\n# Option 2: Winsorize (cap at percentiles)\nlower_perc <- quantile(x, 0.05)\nupper_perc <- quantile(x, 0.95)\nx_wins <- pmin(pmax(x, lower_perc), upper_perc)\n# Option 3: Transform (log, sqrt)\nx_log <- log(x + 1)\n# Option 4: Use robust methods (median, IQR)"
                  }
        ],
        tips: [
                  "IQR method is robust — doesn't assume normality",
                  "Z-score method assumes normal data — use sparingly on real-world data",
                  "Visualize outliers with boxplot() first — some may be legitimate extreme values",
                  "Winsorizing is often better than removal — preserves sample size"
        ],
        mistake: "Removing all outliers without investigation. An outlier may be the most interesting observation.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "data-transformations",
        fn: "Data Transformations: log, sqrt, Box-Cox",
        desc: "Stabilize variance and improve normality.",
        category: "General",
        subtitle: "log transform, square root, Box-Cox, standardization, normalization",
        signature: "log(x), sqrt(x), 1/x  |  Box-Cox: λ via maximum likelihood",
        descLong: "Skewed distributions often benefit from log or square-root transformation. Box-Cox finds the optimal power transformation via maximum likelihood. Transformed response makes linear regression more valid.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Data Transformations: log, sqrt, Box-Cox — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Log transformation (right-skewed data) ────────────────\n# Example: income is right-skewed\nincome <- c(50000, 60000, 75000, 100000, 200000, 500000)\nlog_income <- log(income)\n# Reduce skewness, stabilize variance\n# ── Square root (moderate right skew) ──────────────────────\n# Less aggressive than log\ncount_data <- c(1, 2, 4, 9, 16, 25)\nsqrt_count <- sqrt(count_data)\n# ── Reciprocal (1/x) (heavy right skew) ───────────────────\n# Most aggressive\nx <- c(0.5, 1, 2, 5, 10)\nrecip_x <- 1/x  # 2, 1, 0.5, 0.2, 0.1\n# ── Box-Cox transformation ────────────────────────────────\n# Finds optimal λ: Y^(λ) for λ ∈ (-2, 2)\nlibrary(MASS)\nx <- income  # must be positive\nbc <- boxcox(lm(x ~ 1))\n# Plot shows log-likelihood for each λ\nlambda_opt <- bc$x[which.max(bc$y)]\n# λ ≈ 0 → use log transform\n# λ ≈ 0.5 → use sqrt\n# λ ≈ 1 → no transform"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Data Transformations: log, sqrt, Box-Cox — common patterns you'll see in production.\n# APPROACH  - Combine Data Transformations: log, sqrt, Box-Cox with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Apply optimal transform:\nif (abs(lambda_opt) < 0.01) {\n  x_transformed <- log(x)\n} else {\n  x_transformed <- (x^lambda_opt - 1) / lambda_opt\n}\n# ── Yeo-Johnson (handles zeros/negatives) ────────────────\n# Box-Cox requires positive values\n# Yeo-Johnson handles any value\nlibrary(caret)\npp <- preProcess(data.frame(x=income), method='YeoJohnson')\nincome_transformed <- predict(pp, data.frame(x=income))\n# ── Check normality after transformation ──────────────────\npar(mfrow=c(1,3))\nhist(income)          # original (skewed)\nhist(log(income))     # log-transformed (better)\nqqnorm(log(income))   # Q-Q plot (better alignment)\nqqline(log(income))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Data Transformations: log, sqrt, Box-Cox — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Interpretation after transformation ───────────────────\n# β from lm(log(y) ~ x) means:\n#   1-unit increase in x → e^β increase in y (multiplicative)\nfit <- lm(log(income) ~ age)\ncoef(fit)['age']      # e.g., 0.05\n# → 1-year age increase → 5% increase in income (e^0.05 ≈ 1.05)"
                  }
        ],
        tips: [
                  "Log transform is most common for right-skewed data (income, prices, counts)",
                  "Box-Cox automatically finds optimal λ — use when you're unsure",
                  "Always back-transform predictions to original scale for interpretation",
                  "Log scale on axes is another option (doesn't change data) — use for visualization"
        ],
        mistake: "Fitting OLS regression to heavily skewed data. Residuals violate assumptions. Transform first: `lm(log(y) ~ x)` or `lm(sqrt(y) ~ x)`.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },
]

export default { meta, sections }
