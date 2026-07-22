export const meta = {
  "title": "Experimental Design & ML Metrics",
  "domain": "stats",
  "sheets": [
    "experimental",
    "ml-evaluation"
  ]
}

export const sections = [

  // ── Section 1: Experimental Design ─────────────────────────────────────────
  {
    id: "experimental-design",
    title: "Experimental Design",
    entries: [
      {
        id: "experimental-design-principles",
        fn: "Experimental Design: Randomization & Blocking",
        desc: "Principles of causal inference through randomized experiments.",
        category: "Experimental Design",
        subtitle: "Randomization removes confounding; blocking reduces error variance",
        signature: "Randomization → removes bias  |  Blocking → reduces variance",
        descLong: "The gold standard for causal inference is randomized controlled experiment. Randomization ensures treatment is independent of confounders. Blocking stratifies on known confounders to reduce error variance. Factorial designs test multiple factors simultaneously.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Experimental Design: Randomization & Blocking — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Completely Randomized Design ───────────────────────\nN subjects randomly assigned to k treatments\nSimple but high error if subjects heterogeneous\nExample: n=60 subjects → 20 per treatment\nRandom assignment ensures treatment independent of subject characteristics"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Experimental Design: Randomization & Blocking — common patterns you'll see in production.\n# APPROACH  - Combine Experimental Design: Randomization & Blocking with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Randomized Block Design ────────────────────────────\nProblem: subjects vary by a known factor (age, gender, location)\nSolution: Block (stratify) on that factor, then randomize within blocks\nExample: 3 age groups (Young, Middle, Old)\n  Young:   10 subjects → randomize 5 to A, 5 to B\n  Middle:  20 subjects → randomize 10 to A, 10 to B\n  Old:     30 subjects → randomize 15 to A, 15 to B\nBenefit: age variation doesn't confound treatment effect\nError variance reduced → more power to detect effects"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Experimental Design: Randomization & Blocking — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Latin Square (2 blocking factors) ──────────────────,Example: 4 subjects × 4 time periods, 4 treatments,Each treatment appears exactly once per subject & time,,         Time 1  Time 2  Time 3  Time 4,Subject 1:  A      B      C      D,Subject 2:  B      C      D      A,Subject 3:  C      D      A      B,Subject 4:  D      A      B      C,,Controls for both subject and time effects,\n── Factorial Design (multiple factors) ────────────────,Simultaneously test effects of 2+ factors,Example: 2×2 factorial (Drug A yes/no × Sleep yes/no),,        Sleep-  Sleep+,Drug-    group1  group2,Drug+    group3  group4,,Main effects: Drug effect (collapsing Sleep),             Sleep effect (collapsing Drug),Interaction: Does Drug effect depend on Sleep?,,More efficient than separate 1-factor experiments,\n── Matched Pairs (before-after) ────────────────────,Same subject measures before & after treatment,Or pairs of similar subjects: 1 treatment, 1 control,,Power advantage: eliminates between-subject variance,\n── Sample size for power ──────────────────────────────,n = 2(z_α/2 + z_β)² × σ² / δ²,,α = 0.05: z_α/2 = 1.96,β = 0.20 (80% power): z_β = 0.842,δ = minimum detectable effect (effect size),σ² = population variance (estimate from pilot),,Example: t-test, 80% power, α=0.05, d=0.5 (medium),  n = 2(1.96 + 0.842)² / 0.5² ≈ 64 per group"
                  }
        ],
        tips: [
                  "Randomization is the gold standard — removes unmeasured confounders",
                  "Blocking on known confounders reduces error variance → increases power",
                  "Factorial designs are efficient — test multiple hypotheses simultaneously",
                  "Pre-specify sample size before running experiment — avoid p-hacking"
        ],
        mistake: "Blocking after randomization. Blocks must be determined BEFORE random assignment, otherwise not truly randomized.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "anova-factorial-designs",
        fn: "Factorial ANOVA: Main Effects & Interactions",
        desc: "Test multiple factors and their interactions simultaneously.",
        category: "ANOVA",
        subtitle: "Two-way, three-way ANOVA; interpret interaction effects",
        signature: "ŷ = μ + αᵢ + βⱼ + (αβ)ᵢⱼ + ε  |  F = MS_effect / MS_error",
        descLong: "Factorial ANOVA extends one-way ANOVA to multiple factors. Partitions variance into main effects (each factor) and interactions (factor combinations). An interaction means one factor's effect depends on another factor's level.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Factorial ANOVA: Main Effects & Interactions — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Two-way ANOVA ──────────────────────────────────────\nData: crop yield by fertilizer type (A,B,C) and watering (low, high)\n            Low Water   High Water\nFert A:    [8, 9, 7]   [15, 16, 14]\nFert B:    [10, 11, 9] [18, 19, 17]\nFert C:    [6, 7, 5]   [12, 11, 13]\nANOVA table:\nSource        SS    df   MS      F      p\nFertilizer   140    2    70     35.0   <.001\nWater        336    1   336    168.0   <.001\nFert×Water    8     2     4      2.0    0.15\nError        24     12    2\nTotal        508    17\nMain effect of Fertilizer: B > A > C (averaged across water)\nMain effect of Water: High > Low (averaged across fertilizer)\nInteraction: Not significant (effect of Fert same at both water levels)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Factorial ANOVA: Main Effects & Interactions — common patterns you'll see in production.\n# APPROACH  - Combine Factorial ANOVA: Main Effects & Interactions with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Ordinal vs Disordinal interaction ────────────────\nOrdinal:\n        B > A        at both levels (lines parallel or non-crossing)\n        Rank order preserved\nDisordinal:\n        B > A at low, but A > B at high (lines crossing)\n        Rank order reverses\nWith disordinal interaction: cannot say \"B is better\" without specifying condition"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Factorial ANOVA: Main Effects & Interactions — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Effect size for two-way ────────────────────────────,η² = SS_effect / SS_total,ω² = (SS_effect - df×MS_error) / (SS_total + MS_error),,Conventions: 0.01=small, 0.06=medium, 0.14=large,\n── Post-hoc tests (by factor level) ────────────────,If significant interaction: compare treatments within each level of blocking factor,TukeyHSD separately for Low Water and High Water groups"
                  }
        ],
        tips: [
                  "Visualize interaction: plot lines per factor level — parallel=no interaction, crossing=interaction",
                  "When interaction is significant, main effects are not interpretable in isolation",
                  "Type III SS for unbalanced designs (default in modern software)",
                  "Effect sizes: always report alongside p-values"
        ],
        mistake: "Interpreting main effects when interaction is significant. \"Fertilizer B is best\" is wrong if its advantage depends on water level.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "sample-size-power-analysis",
        fn: "Power Analysis: Detect Real Effects",
        desc: "Ensure adequate sample size before running experiment.",
        category: "Experimental Design",
        subtitle: "Power = P(reject H0 | H1 true) = 1-β",
        signature: "Power ↑ as: n↑, effect size↑, α↑, σ↓",
        descLong: "Statistical power is the probability of detecting a real effect. Low power studies waste resources. Conventional minimum is 80% (β=0.20). Power depends on sample size, effect size, α level, and variance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Power Analysis: Detect Real Effects — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Power formula (t-test, two-sided) ───────────────────\nn = 2(z_α/2 + z_β)² × σ² / δ²\nExample: compare two treatments\n  α = 0.05 → z_α/2 = 1.96\n  β = 0.20 → z_β = 0.842  (80% power)\n  δ = 5 (minimum detectable difference)\n  σ = 10 (estimated SD from pilot)\nn = 2(1.96 + 0.842)² × 100 / 25\n  = 2 × 7.85 × 4 = 63 per group"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Power Analysis: Detect Real Effects — common patterns you'll see in production.\n# APPROACH  - Combine Power Analysis: Detect Real Effects with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Sample size scales with effect size ──────────────\nSmaller δ → larger n\nδ halved → n quadrupled (since 1/δ²)\nMust detect 10-point difference: n=63\nMust detect 5-point difference: n=252"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Power Analysis: Detect Real Effects — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Power calculation for ANOVA (k groups) ────────────,library(pwr),pwr.anova.test(k=3, f=0.25, sig.level=0.05, power=0.8),# k=3 groups, medium effect f=0.25, 80% power,# Result: n=45 per group,\n── Reporting power ────────────────────────────────────,\"Our sample (n=50) provides 80% power to detect effect size d=0.6,at α=.05 (two-tailed)\",\n── Underpowered studies ───────────────────────────────,Most psychology/social science studies have power < 50%!,Button et al. (2013): median power in neuroscience = 21%,,Consequences:,- Reported effects are larger than true (winner's curse),- Inconsistent replication,- Wasted resources,\n── Post-hoc power analysis (NOT RECOMMENDED) ─────────,Some compute power after seeing p-value,  If p < 0.05, \"We had power > X\",  If p > 0.05, \"We were underpowered\",,This is circular! Post-hoc power = f(p-value) and uninformative,Always pre-specify power before the study"
                  }
        ],
        tips: [
                  "Start with pilot data to estimate variance (σ) for power calculation",
                  "Effect sizes from prior literature — but they're often inflated (publication bias)",
                  "Increasing α from 0.05 to 0.10 gains ~10% power but doubles false positives",
                  "Reduce variance with better measurement → higher power without more subjects"
        ],
        mistake: "Computing post-hoc power after seeing p-value. This is uninformative. Always pre-specify power.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },

  // ── Section 2: ML & Classification Metrics ─────────────────────────────────────────
  {
    id: "ml-evaluation-metrics",
    title: "ML & Classification Metrics",
    entries: [
      {
        id: "confusion-matrix-metrics",
        fn: "Confusion Matrix: Precision, Recall, F1",
        desc: "Evaluate binary classification models.",
        category: "Classification",
        subtitle: "TP, FP, TN, FN → accuracy, precision, recall, F1",
        signature: "Precision=TP/(TP+FP)  |  Recall=TP/(TP+FN)  |  F1=2PR/(P+R)",
        descLong: "Binary classification produces four outcomes: TP (correct positive), FP (false alarm), TN (correct negative), FN (miss). Precision answers \"of positive predictions, how many correct?\" Recall answers \"of actual positives, how many found?\"",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Confusion Matrix: Precision, Recall, F1 — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Confusion Matrix Example ───────────────────────────\nPredicting disease (positive) vs health (negative)\n              Predicted+  Predicted-\nActual+          80           20        (TP=80, FN=20)\nActual-          10           90        (FP=10, TN=90)\nTotal           90           110       n=200"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Confusion Matrix: Precision, Recall, F1 — common patterns you'll see in production.\n# APPROACH  - Combine Confusion Matrix: Precision, Recall, F1 with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Key metrics ────────────────────────────────────────\nSensitivity (Recall, TPR) = TP/(TP+FN) = 80/100 = 0.80\n  \"Of all actual cases, 80% found\"\nSpecificity (TNR) = TN/(TN+FP) = 90/100 = 0.90\n  \"Of all actual negatives, 90% correctly identified\"\nPrecision (PPV) = TP/(TP+FP) = 80/90 = 0.89\n  \"Of positive predictions, 89% correct\"\nNegative Predictive Value = TN/(TN+FN) = 90/110 = 0.82\n  \"Of negative predictions, 82% correct\"\nAccuracy = (TP+TN)/n = 170/200 = 0.85\n  \"Overall correctness\" — misleading for imbalanced classes!\nF1 = 2×(Precision×Recall)/(Precision+Recall)\n   = 2×(0.89×0.80)/(0.89+0.80) = 0.84\n   \"Harmonic mean of precision & recall\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Confusion Matrix: Precision, Recall, F1 — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── When each metric matters ───────────────────────────,Precision: spam detection (false positives annoying),Recall: disease screening (false negatives dangerous),Balanced: when costs equal, use F1,\n── Imbalanced classes (e.g., fraud 0.5% of transactions) ──,Accuracy = 99.5% but useless (just predict all negative!),Precision & Recall: more informative,AUC-ROC / Precision-Recall AUC: better metrics,\n── Threshold selection ────────────────────────────────,At threshold=0.5 (classify as + if p>0.5):,  High recall but low precision (many false positives),,Adjust threshold based on costs:,  High FN cost (disease screening): lower threshold → ↑recall,  High FP cost (spam): raise threshold → ↑precision"
                  }
        ],
        tips: [
                  "Accuracy is misleading for imbalanced classes — always report Precision & Recall",
                  "F1 balances precision-recall when you don't know the cost ratio",
                  "AUC-ROC is threshold-independent — use to compare models",
                  "Precision-Recall is more informative than ROC for imbalanced data"
        ],
        mistake: "Using accuracy as the sole metric for imbalanced classification. A 99%-accuracy \"model\" that always predicts majority class is useless.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "roc-auc-metrics",
        fn: "ROC Curve & AUC",
        desc: "Evaluate discrimination ability across all thresholds.",
        category: "Classification",
        subtitle: "TPR vs FPR curve; AUC = probability a random positive ranks above random negative",
        signature: "AUC = ∫ROC dFPR  |  0.5=random, 1.0=perfect",
        descLong: "The ROC curve plots True Positive Rate (sensitivity) vs False Positive Rate (1-specificity) at each classification threshold. AUC (area under curve) summarizes discrimination ability: 0.5=random guessing, 1.0=perfect classification.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ROC Curve & AUC — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── ROC Curve Construction ────────────────────────────\nFor each threshold t from 1→0:\n  Classify as positive if predicted prob > t\n  Compute TPR = TP/(TP+FN)\n  Compute FPR = FP/(FP+TN)\n  Plot point (FPR, TPR)\nResult: curve from (0,0) to (1,1)\n     TPR\n     1.0├         ╭──────  Perfect\n        │      ╭──╯\n        │   ╭──╯  ← Good model (AUC≈0.8)\n     0.5├───╯\n        │ ╱  ← Random (AUC≈0.5)\n      0.0└────────────\n        0.0    0.5    1.0  FPR"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ROC Curve & AUC — common patterns you'll see in production.\n# APPROACH  - Combine ROC Curve & AUC with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── AUC interpretation ────────────────────────────────\nAUC = P(Model scores random + higher than random -)\n    = area under ROC curve\nAUC = 0.5: random classifier (no discrimination)\nAUC = 0.7: acceptable\nAUC = 0.8: excellent\nAUC = 0.9: outstanding\nAUC = 1.0: perfect (suspect overfit!)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ROC Curve & AUC — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── AUC vs accuracy ───────────────────────────────────,AUC ≥ 0.8 but Accuracy = 0.50?,  Possible if heavily imbalanced and threshold misaligned,  AUC is more robust,,High AUC but low Accuracy?,  Just adjust threshold,\n── Partial AUC (specific FPR range) ────────────────,Sometimes only care about FPR < 0.1 (few false alarms),Partial AUC: integrate ROC only from FPR=0 to FPR=0.1,\n── Multi-class AUC ────────────────────────────────,One-vs-rest AUC: compute ROC for each class vs rest,Macro-averaged AUC: mean of class AUCs,Weighted AUC: weight by class prevalence"
                  }
        ],
        tips: [
                  "AUC is threshold-independent → use to compare models",
                  "Choose threshold AFTER selecting model, based on deployment costs",
                  "For imbalanced data: Precision-Recall AUC > ROC AUC",
                  "High AUC but poor calibration: model ranks well but probabilities are wrong"
        ],
        mistake: "Optimizing threshold on the test set. Threshold choice should be on validation set based on business costs, not test performance.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "cross-validation-strategies",
        fn: "Cross-Validation: Estimate True Performance",
        desc: "Estimate out-of-sample error without a separate test set.",
        category: "Model Evaluation",
        subtitle: "k-fold, stratified, time series CV; proper train/val/test split",
        signature: "CV error = (1/k) Σ Error_fold",
        descLong: "Cross-validation estimates true generalization error. k-fold repeatedly splits data into training and validation folds. Stratified CV preserves class distribution. Time-series CV respects temporal order.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Cross-Validation: Estimate True Performance — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── 5-fold Cross-Validation ────────────────────────────\nData: |  Fold1  |  Fold2  |  Fold3  |  Fold4  |  Fold5  |\nRound 1: [TEST] [train] [train] [train] [train]\nRound 2: [train][TEST] [train] [train] [train]\n...\nRound 5: [train] [train] [train] [train][TEST]\nCompute error on each TEST fold, average them"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Cross-Validation: Estimate True Performance — common patterns you'll see in production.\n# APPROACH  - Combine Cross-Validation: Estimate True Performance with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Stratified CV (for classification) ──────────────\nEnsure each fold has same class distribution as full data\nExample: 10% positive, 90% negative\n  Each fold: ≈10% positive, ≈90% negative\n  Prevents imbalanced folds (especially with small data)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Cross-Validation: Estimate True Performance — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Time Series CV (respect temporal order) ───────────,Do NOT use random k-fold (future leakage!),,Proper time series CV:,  Round 1: train[1-100], test[101-110],  Round 2: train[1-110], test[111-120],  Round 3: train[1-120], test[121-130],  ...,,Training always precedes test in time,\n── Train / Validation / Test split ────────────────,60% train: fit models,20% validation: tune hyperparameters, select model,20% test: final unbiased performance (touch only once!),,NEVER:,  - Use test set during hyperparameter tuning,  - Report performance on data used for model selection,  - Peek at test set structure before final eval,\n── CV vs train/val/test ───────────────────────────,CV: good when data is limited (no separate test set),Train/val/test: when n is large,,Ideally: use both,  1. CV on train set for hyperparameter tuning,  2. Test set for final evaluation (never tuned on it)"
                  }
        ],
        tips: [
                  "k=5 or 10 is standard; k=n (LOOCV) has high variance",
                  "Stratified CV is essential for imbalanced classification",
                  "The test set is sacred — never use for model selection",
                  "Report both CV error (training) and test error (true generalization)"
        ],
        mistake: "Tuning hyperparameters on the test set. You've leaked information — test error is now optimistically biased.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },
]

export default { meta, sections }
