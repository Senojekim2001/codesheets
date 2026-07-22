export const meta = {
  "id": "ml-statistics",
  "label": "ML Statistics & Evaluation",
  "icon": "🎯",
  "description": "A/B testing, model evaluation metrics, cross-validation, causal inference, and statistical methods for machine learning."
}

export const sections = [

  // ── Section 1: A/B Testing & Experimentation ─────────────────────────────────────────
  {
    id: "ab-testing",
    title: "A/B Testing & Experimentation",
    entries: [
      {
        id: "ab-test-design",
        fn: "A/B Test Design — Sample Size, Power & Duration",
        desc: "Design rigorous A/B tests: hypothesis formulation, sample size calculation, power analysis, and minimum detectable effect.",
        category: "Experimentation",
        subtitle: "sample size, power analysis, MDE, significance, duration, randomization",
        signature: "n = (Z_α + Z_β)² × 2σ² / δ²  |  power = P(reject H₀ | H₁ true)  |  MDE",
        descLong: "A/B testing compares two variants (control vs treatment) to determine if a change has a statistically significant effect. Key design parameters: (1) Minimum Detectable Effect (MDE) — the smallest improvement worth detecting. (2) Significance level (α, typically 0.05) — false positive rate. (3) Power (1-β, typically 0.80) — probability of detecting a real effect. (4) Sample size — determined by MDE, α, β, and baseline variance. Under-powered tests miss real effects; over-powered tests waste traffic. Always calculate sample size BEFORE running the test.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of A/B Test Design — Sample Size, Power & Duration — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\nfrom statsmodels.stats.power import NormalIndPower, TTestIndPower\nfrom statsmodels.stats.proportion import proportions_ztest\n# ── Sample size calculation (proportions) ────────────\ndef sample_size_proportions(\n    baseline_rate: float,     # e.g., 0.05 (5% conversion)\n    mde_relative: float,      # e.g., 0.10 (10% relative lift)\n    alpha: float = 0.05,\n    power: float = 0.80,\n) -> int:\n    \"\"\"Calculate required sample size per group.\"\"\"\n    p1 = baseline_rate\n    p2 = baseline_rate * (1 + mde_relative)\n    # Effect size (Cohen's h for proportions)\n    effect_size = 2 * np.arcsin(np.sqrt(p2)) - 2 * np.arcsin(np.sqrt(p1))\n    analysis = NormalIndPower()\n    n = analysis.solve_power(\n        effect_size=abs(effect_size),\n        alpha=alpha,\n        power=power,\n        alternative='two-sided',\n    )\n    return int(np.ceil(n))\nn_per_group = sample_size_proportions(\n    baseline_rate=0.05,   # 5% conversion rate\n    mde_relative=0.10,    # detect 10% relative improvement (5% → 5.5%)\n)\nprint(f\"Need {n_per_group:,} users per group\")  # ~29,069"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of A/B Test Design — Sample Size, Power & Duration — common patterns you'll see in production.\n# APPROACH  - Combine A/B Test Design — Sample Size, Power & Duration with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Sample size for continuous metrics ───────────────\ndef sample_size_continuous(\n    baseline_mean: float,\n    baseline_std: float,\n    mde_absolute: float,\n    alpha: float = 0.05,\n    power: float = 0.80,\n) -> int:\n    effect_size = mde_absolute / baseline_std  # Cohen's d\n    analysis = TTestIndPower()\n    n = analysis.solve_power(\n        effect_size=effect_size,\n        alpha=alpha,\n        power=power,\n        alternative='two-sided',\n    )\n    return int(np.ceil(n))\nn = sample_size_continuous(\n    baseline_mean=45.0,   # avg session duration (seconds)\n    baseline_std=20.0,\n    mde_absolute=3.0,     # detect 3-second improvement\n)\nprint(f\"Need {n:,} users per group\")  # ~698\n# ── Analyze A/B test results (proportions) ───────────\ncontrol_visitors, control_conversions = 15000, 750     # 5.0%\ntreatment_visitors, treatment_conversions = 15000, 825  # 5.5%"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of A/B Test Design — Sample Size, Power & Duration — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nz_stat, p_value = proportions_ztest(\n    count=[treatment_conversions, control_conversions],\n    nobs=[treatment_visitors, control_visitors],\n    alternative='two-sided',\n)\nprint(f\"Z-statistic: {z_stat:.3f}\")\nprint(f\"P-value: {p_value:.4f}\")\nprint(f\"Significant: {p_value < 0.05}\")\n# Confidence interval for the difference\np_c = control_conversions / control_visitors\np_t = treatment_conversions / treatment_visitors\ndiff = p_t - p_c\nse = np.sqrt(p_c*(1-p_c)/control_visitors + p_t*(1-p_t)/treatment_visitors)\nci_lower = diff - 1.96 * se\nci_upper = diff + 1.96 * se\nprint(f\"Lift: {diff/p_c*100:.1f}% [{ci_lower/p_c*100:.1f}%, {ci_upper/p_c*100:.1f}%]\")\n# ── Duration estimation ──────────────────────────────\ndaily_traffic = 10000  # visitors per day\ntraffic_allocation = 0.5  # 50% of traffic to experiment\ndays_needed = (2 * n_per_group) / (daily_traffic * traffic_allocation)\nprint(f\"Test duration: {int(np.ceil(days_needed))} days\")"
                  }
        ],
        tips: [
                  "Always calculate sample size BEFORE starting — running until you see significance (peeking) inflates false positives to 25%+.",
                  "Run tests for full weeks (7, 14, 21 days) to avoid day-of-week effects — never stop mid-week.",
                  "Use one-tailed tests only if you are 100% certain the effect cannot go the wrong direction — two-tailed is safer.",
                  "For low-traffic sites, consider sequential testing (SPRT) which can reach conclusions with 30-50% fewer samples."
        ],
        mistake: "Peeking at results daily and stopping when p < 0.05 — this is \"p-hacking\" and inflates your false positive rate from 5% to 25%+. Use sequential testing methods or pre-commit to a fixed sample size.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "bayesian-ab",
        fn: "Bayesian A/B Testing & Multi-Armed Bandits",
        desc: "Bayesian approach to experimentation: posterior distributions, probability of being best, and Thompson sampling bandits.",
        category: "Experimentation",
        subtitle: "Beta distribution, posterior, probability to be best, Thompson sampling, credible interval",
        signature: "P(B > A) = ∫P(θ_B > θ_A)  |  Beta(α + successes, β + failures)  |  Thompson sampling",
        descLong: "Bayesian A/B testing models conversion rates as probability distributions (Beta for proportions, Normal for continuous). As data arrives, the prior updates to a posterior. Instead of p-values, you get direct answers: \"probability that B is better than A\" and \"expected loss if we choose wrong.\" Multi-armed bandits (Thompson sampling, UCB) dynamically allocate more traffic to winning variants, reducing opportunity cost. Bayesian methods handle early stopping naturally and provide more intuitive business metrics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Bayesian A/B Testing & Multi-Armed Bandits — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\nimport matplotlib.pyplot as plt\n# ── Bayesian A/B test (Beta-Binomial) ────────────────\nclass BayesianABTest:\n    \"\"\"Bayesian A/B test for conversion rates.\"\"\"\n    def __init__(self, prior_alpha=1, prior_beta=1):\n        # Uniform prior: Beta(1,1)\n        # Weakly informative: Beta(2,20) for ~10% conversion\n        self.prior_a = prior_alpha\n        self.prior_b = prior_beta\n    def analyze(self, control_s, control_n, treat_s, treat_n, n_sim=100_000):\n        \"\"\"\n        control_s: control successes, control_n: control trials\n        treat_s: treatment successes, treat_n: treatment trials\n        \"\"\"\n        # Posterior distributions\n        control_post = stats.beta(\n            self.prior_a + control_s,\n            self.prior_b + control_n - control_s,\n        )\n        treat_post = stats.beta(\n            self.prior_a + treat_s,\n            self.prior_b + treat_n - treat_s,\n        )\n        # Monte Carlo: probability treatment > control\n        control_samples = control_post.rvs(n_sim)\n        treat_samples = treat_post.rvs(n_sim)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Bayesian A/B Testing & Multi-Armed Bandits — common patterns you'll see in production.\n# APPROACH  - Combine Bayesian A/B Testing & Multi-Armed Bandits with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nprob_treat_better = (treat_samples > control_samples).mean()\n        # Expected lift\n        lift_samples = (treat_samples - control_samples) / control_samples\n        # Expected loss (regret if we choose treatment but control is better)\n        loss_if_treat = np.maximum(control_samples - treat_samples, 0).mean()\n        loss_if_control = np.maximum(treat_samples - control_samples, 0).mean()\n        return {\n            \"prob_treat_better\": prob_treat_better,\n            \"expected_lift\": lift_samples.mean(),\n            \"lift_ci_95\": (np.percentile(lift_samples, 2.5),\n                          np.percentile(lift_samples, 97.5)),\n            \"expected_loss_treat\": loss_if_treat,\n            \"expected_loss_control\": loss_if_control,\n            \"control_rate\": control_post.mean(),\n            \"treat_rate\": treat_post.mean(),\n        }\ntest = BayesianABTest()\nresults = test.analyze(\n    control_s=750, control_n=15000,    # 5.0%\n    treat_s=825, treat_n=15000,         # 5.5%\n)\nprint(f\"P(Treatment > Control): {results['prob_treat_better']:.1%}\")\nprint(f\"Expected lift: {results['expected_lift']:.1%}\")\nprint(f\"95% CI: [{results['lift_ci_95'][0]:.1%}, {results['lift_ci_95'][1]:.1%}]\")\nprint(f\"Expected loss if wrong: {results['expected_loss_treat']:.4f}\")\n# Decision rule: ship if P(better) > 95% AND expected loss < 0.1%"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Bayesian A/B Testing & Multi-Armed Bandits — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Thompson Sampling (multi-armed bandit) ───────────\nclass ThompsonSampling:\n    \"\"\"Dynamically allocate traffic to best variant.\"\"\"\n    def __init__(self, n_variants: int):\n        self.successes = np.ones(n_variants)  # Beta(1,1) prior\n        self.failures = np.ones(n_variants)\n    def select_variant(self) -> int:\n        \"\"\"Sample from each posterior, pick highest.\"\"\"\n        samples = [\n            np.random.beta(self.successes[i], self.failures[i])\n            for i in range(len(self.successes))\n        ]\n        return int(np.argmax(samples))\n    def update(self, variant: int, reward: bool):\n        if reward:\n            self.successes[variant] += 1\n        else:\n            self.failures[variant] += 1\nbandit = ThompsonSampling(n_variants=3)\nfor _ in range(10000):\n    variant = bandit.select_variant()\n    # Simulate: variant 1 has 6% conversion, others 5%\n    true_rates = [0.05, 0.06, 0.05]\n    reward = np.random.random() < true_rates[variant]\n    bandit.update(variant, reward)\n# Bandit auto-converges: sends more traffic to best variant"
                  }
        ],
        tips: [
                  "\"P(B > A) = 92%\" is far more intuitive for stakeholders than \"p = 0.03\" — Bayesian results communicate directly.",
                  "Expected loss (regret) is the best decision metric: \"if we ship B and it is worse, we lose 0.02% conversion on average.\"",
                  "Thompson sampling explores less and exploits more over time — it naturally converges to the best variant.",
                  "Use a weakly informative prior Beta(2, 20) for ~10% conversion instead of uniform Beta(1,1) — it stabilizes early estimates."
        ],
        mistake: "Using Bayesian A/B testing but still peeking compulsively at day 1 — while Bayesian methods handle early stopping better, very early posteriors (< 100 samples) are dominated by the prior. Wait for at least a few hundred observations per variant.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },

  // ── Section 2: Model Evaluation & Metrics ─────────────────────────────────────────
  {
    id: "model-evaluation",
    title: "Model Evaluation & Metrics",
    entries: [
      {
        id: "classification-metrics",
        fn: "Classification Metrics — Precision, Recall, F1, AUC-ROC",
        desc: "Evaluate classifiers: confusion matrix, precision/recall tradeoff, F1 score, AUC-ROC, AUC-PR, and when to use which metric.",
        category: "Evaluation",
        subtitle: "precision, recall, F1, AUC-ROC, AUC-PR, confusion matrix, threshold tuning",
        signature: "precision = TP/(TP+FP)  |  recall = TP/(TP+FN)  |  F1 = 2×P×R/(P+R)  |  AUC-ROC",
        descLong: "Classification metrics measure different aspects of model performance. Accuracy is misleading for imbalanced classes. Precision (of predicted positives, how many are correct) matters when false positives are costly (spam filter). Recall (of actual positives, how many are found) matters when false negatives are costly (cancer detection). F1 balances both. AUC-ROC measures ranking quality across all thresholds. AUC-PR is better for imbalanced datasets. Choose the metric that aligns with the business cost of each error type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Classification Metrics — Precision, Recall, F1, AUC-ROC — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.metrics import (\n    confusion_matrix, classification_report,\n    precision_score, recall_score, f1_score,\n    roc_auc_score, average_precision_score,\n    roc_curve, precision_recall_curve,\n)\nimport numpy as np\ny_true = [0, 0, 1, 1, 0, 1, 0, 1, 1, 0]\ny_pred = [0, 1, 1, 1, 0, 0, 0, 1, 1, 0]\ny_prob = [0.1, 0.7, 0.8, 0.9, 0.2, 0.4, 0.3, 0.85, 0.95, 0.15]\n# ── Confusion matrix ─────────────────────────────────\ncm = confusion_matrix(y_true, y_pred)\n#              Predicted\n#              Neg  Pos\n# Actual Neg [ TN   FP ]   → [4, 1]\n# Actual Pos [ FN   TP ]   → [1, 4]\ntn, fp, fn, tp = cm.ravel()\nprint(f\"TP={tp}, FP={fp}, FN={fn}, TN={tn}\")\n# ── Core metrics ─────────────────────────────────────\nprecision = precision_score(y_true, y_pred)  # TP/(TP+FP) = 4/5 = 0.80\nrecall = recall_score(y_true, y_pred)        # TP/(TP+FN) = 4/5 = 0.80\nf1 = f1_score(y_true, y_pred)               # 2*P*R/(P+R) = 0.80"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Classification Metrics — Precision, Recall, F1, AUC-ROC — common patterns you'll see in production.\n# APPROACH  - Combine Classification Metrics — Precision, Recall, F1, AUC-ROC with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nprint(classification_report(y_true, y_pred))\n# Shows precision, recall, F1 for each class + macro/weighted avg\n# ── AUC-ROC (probability-based, threshold-independent) ─\nauc_roc = roc_auc_score(y_true, y_prob)\nprint(f\"AUC-ROC: {auc_roc:.3f}\")  # 0.92\n# ── AUC-PR (better for imbalanced data) ─────────────\nauc_pr = average_precision_score(y_true, y_prob)\nprint(f\"AUC-PR: {auc_pr:.3f}\")\n# ── Threshold tuning ─────────────────────────────────\n# Find optimal threshold for F1\nfrom sklearn.metrics import f1_score\nthresholds = np.arange(0.1, 0.9, 0.05)\nf1_scores = []\nfor t in thresholds:\n    y_pred_t = (np.array(y_prob) >= t).astype(int)\n    f1_scores.append(f1_score(y_true, y_pred_t))\nbest_threshold = thresholds[np.argmax(f1_scores)]\nprint(f\"Best threshold for F1: {best_threshold:.2f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Classification Metrics — Precision, Recall, F1, AUC-ROC — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── When to use which metric ─────────────────────────\n# ACCURACY:  balanced classes only (50/50 split)\n# PRECISION: false positives are expensive (spam → inbox)\n# RECALL:    false negatives are expensive (missed cancer)\n# F1:        balance precision/recall, imbalanced classes\n# AUC-ROC:   overall ranking quality, probability calibration\n# AUC-PR:    imbalanced data (1% positive), ranking positives\n# Log Loss:  when calibrated probabilities matter (betting, pricing)\n# ── Multi-class: macro vs weighted average ───────────\nfrom sklearn.metrics import f1_score\n# macro: unweighted mean (each class counts equally)\nf1_macro = f1_score(y_true, y_pred, average='macro')\n# weighted: weighted by class support (handles imbalance)\nf1_weighted = f1_score(y_true, y_pred, average='weighted')"
                  }
        ],
        tips: [
                  "For imbalanced data (1% positive), accuracy is useless (99% accuracy by predicting all negative). Use AUC-PR or F1.",
                  "AUC-ROC can be misleadingly high on imbalanced data — a random model on 1% positive data has AUC ~0.50 but 99% accuracy.",
                  "Tune the classification threshold based on business cost: if FN costs 10x FP, lower the threshold to catch more positives.",
                  "Log loss penalizes confident wrong predictions heavily — use it when you need well-calibrated probabilities."
        ],
        mistake: "Reporting only accuracy on imbalanced data — a fraud model with 0.1% fraud rate gets 99.9% accuracy by predicting \"no fraud\" for everything. Report precision, recall, F1, and AUC-PR for the minority class.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "cross-validation-deep",
        fn: "Cross-Validation — Variations & Best Practices",
        desc: "Master different CV strategies: LOOCV, stratified, time-series, GroupKFold, and nested CV for hyperparameter tuning.",
        category: "Validation",
        subtitle: "LOOCV, StratifiedKFold, TimeSeriesSplit, GroupKFold, nested CV, learning curves",
        signature: "cross_val_score(model, X, y, cv=5)  |  LeaveOneOut  |  GroupKFold",
        descLong: "Cross-validation estimates generalization error. K-fold: splits into k equal-sized folds, trains on k-1, evaluates on held-out. Stratified k-fold: preserves class proportions (essential for imbalanced data). LOOCV: k=n (computationally expensive, high variance). Time-series CV: respects temporal order (no future data leakage). GroupKFold: respects grouping (e.g., multiple images per patient). Nested CV: inner loop for hyperparameter tuning, outer loop for unbiased evaluation. Learning curves diagnose overfitting vs underfitting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Cross-Validation — Variations & Best Practices — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.model_selection import (\n    cross_val_score, StratifiedKFold, TimeSeriesSplit,\n    LeaveOneOut, GroupKFold, learning_curve, train_test_split,\n)\nfrom sklearn.ensemble import RandomForestClassifier\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── LOOCV (Leave-One-Out Cross-Validation) ────────────\n# k = n (each observation held out once)\n# Very computationally expensive but unbiased estimate\nloo = LeaveOneOut()\nscores_loo = cross_val_score(RandomForestClassifier(), X, y, cv=loo)\nprint(f\"LOOCV mean accuracy: {scores_loo.mean():.3f}\")\n# ── Stratified K-Fold (preserves class distribution) ──\n# Essential for imbalanced classes\nskf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\nscores_skf = cross_val_score(RandomForestClassifier(), X, y, cv=skf, scoring='f1')\nprint(f\"Stratified k-fold F1: {scores_skf.mean():.3f} ± {scores_skf.std():.3f}\")\n# ── Time Series Cross-Validation ──────────────────────\n# NEVER shuffle time series data!\ntscv = TimeSeriesSplit(n_splits=5)\nfor train_idx, test_idx in tscv.split(X):\n    print(f\"Train: {train_idx[0]}-{train_idx[-1]}, Test: {test_idx[0]}-{test_idx[-1]}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Cross-Validation — Variations & Best Practices — common patterns you'll see in production.\n# APPROACH  - Combine Cross-Validation — Variations & Best Practices with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nscores_ts = cross_val_score(RandomForestClassifier(), X, y, cv=tscv)\n# ── GroupKFold (respects group membership) ────────────\n# Example: multiple images per patient — can't mix in train/test\ngroups = [0, 0, 0, 1, 1, 1, 2, 2, 2, ...]  # patient IDs\ngkf = GroupKFold(n_splits=5)\nfor train_idx, test_idx in gkf.split(X, groups=groups):\n    print(f\"Train groups, Test groups: {set(groups[train_idx])}, {set(groups[test_idx])}\")\nscores_gkf = cross_val_score(RandomForestClassifier(), X, y, cv=gkf, groups=groups)\n# ── Nested Cross-Validation (for hyperparameter tuning) ─\nfrom sklearn.model_selection import GridSearchCV\n# Inner loop: tune hyperparameters\ninner_cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)\nparam_grid = {'n_estimators': [50, 100, 200], 'max_depth': [5, 10, None]}\ngrid = GridSearchCV(RandomForestClassifier(), param_grid, cv=inner_cv, scoring='f1')\n# Outer loop: unbiased performance estimate\nouter_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\nnested_scores = cross_val_score(grid, X, y, cv=outer_cv, scoring='f1')\nprint(f\"Nested CV F1: {nested_scores.mean():.3f} ± {nested_scores.std():.3f}\")\n# ── Learning Curves (diagnose overfitting) ────────────\ntrain_sizes, train_scores, val_scores = learning_curve(\n    RandomForestClassifier(), X, y,\n    train_sizes=np.linspace(0.1, 1.0, 10),\n    cv=StratifiedKFold(n_splits=5),\n    scoring='f1',\n    n_jobs=-1,\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Cross-Validation — Variations & Best Practices — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ntrain_mean = np.mean(train_scores, axis=1)\ntrain_std = np.std(train_scores, axis=1)\nval_mean = np.mean(val_scores, axis=1)\nval_std = np.std(val_scores, axis=1)\nplt.figure(figsize=(10, 6))\nplt.plot(train_sizes, train_mean, label='Train', linewidth=2)\nplt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.2)\nplt.plot(train_sizes, val_mean, label='Validation', linewidth=2)\nplt.fill_between(train_sizes, val_mean - val_std, val_mean + val_std, alpha=0.2)\nplt.xlabel('Training Set Size')\nplt.ylabel('F1 Score')\nplt.legend()\nplt.title('Learning Curve')\nplt.grid(True, alpha=0.3)\nplt.show()\n# Interpretation:\n# Overfitting: train >> validation, gap doesn't close\n# Underfitting: both low, small gap\n# Good fit: high scores, small gap"
                  }
        ],
        tips: [
                  "LOOCV: high variance, unbiased; use only for small datasets (n < 1000).",
                  "StratifiedKFold is essential for classification with imbalanced classes (never use regular KFold).",
                  "TimeSeriesSplit: always use for time series — shuffled CV gives over-optimistic results.",
                  "GroupKFold: essential when samples are not independent (e.g., images from same patient)."
        ],
        mistake: "Using random KFold on time series data or ignoring group structure — introduces data leakage (future information in training) or violation of independence assumption.",
        shorthand: {
          verbose: "// Manual / verbose approach\nLearning curve + all CV variants + assumption validation\n// More explicit but longer",
          concise: "cross_val_score(model, X, y, cv=appropriate_splitter)",
        },
      },
    ],
  },

  // ── Section 3: Advanced ML Statistics ─────────────────────────────────────────
  {
    id: "advanced-ml-stats",
    title: "Advanced ML Statistics",
    entries: [
      {
        id: "bias-variance-tradeoff",
        fn: "Bias-Variance Tradeoff — Decomposing Error",
        desc: "Understand how model complexity affects generalization via bias-variance decomposition.",
        category: "Theory",
        subtitle: "Expected loss decomposition, overfitting, underfitting, regularization, model complexity",
        signature: "E[(Y - Ŷ)²] = Bias² + Variance + Irreducible Error  |  Bias ↑, Variance ↓ as complexity ↑",
        descLong: "Bias-variance decomposition partitions expected prediction error into three components. Bias = systematic error (model too simple, can't fit data). Variance = sensitivity to training data (model too complex, overfits). Irreducible error = inherent noise. Simple models: high bias, low variance. Complex models: low bias, high variance. Optimal model balances both. Regularization reduces variance at cost of small bias increase. Learning curves visualize the tradeoff as training set size grows.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Bias-Variance Tradeoff — Decomposing Error — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.model_selection import cross_val_predict\nfrom sklearn.ensemble import RandomForestRegressor\nfrom sklearn.linear_model import Ridge\nfrom sklearn.preprocessing import PolynomialFeatures\n# ── Bias-Variance Decomposition (empirical) ────────────\n# Assume underlying true function is nonlinear\nnp.random.seed(42)\nn = 100\nX = np.random.uniform(0, 10, n).reshape(-1, 1)\ny_true_func = np.sin(X).ravel()\ny = y_true_func + np.random.normal(0, 0.3, n)\n# Fit models of increasing complexity\ncomplexities = [1, 3, 5, 10]  # polynomial degrees\nfig, axes = plt.subplots(2, 2, figsize=(12, 10))\naxes = axes.ravel()\nfor idx, degree in enumerate(complexities):\n    ax = axes[idx]\n    # Fit polynomial model\n    poly_features = PolynomialFeatures(degree)\n    X_poly = poly_features.fit_transform(X)\n    from sklearn.linear_model import LinearRegression\n    model = LinearRegression()\n    model.fit(X_poly, y)\n    # Predict on dense grid\n    X_grid = np.linspace(0, 10, 200).reshape(-1, 1)\n    X_grid_poly = poly_features.transform(X_grid)\n    y_pred_grid = model.predict(X_grid_poly)\n    y_true_grid = np.sin(X_grid).ravel()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Bias-Variance Tradeoff — Decomposing Error — common patterns you'll see in production.\n# APPROACH  - Combine Bias-Variance Tradeoff — Decomposing Error with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Compute bias and variance\n    y_pred = model.predict(X_poly)\n    bias_sq = np.mean((y_pred - y_true_func) ** 2)\n    variance = np.mean((y_pred - y.mean()) ** 2)\n    mse = np.mean((y - y_pred) ** 2)\n    ax.scatter(X, y, alpha=0.5, label='Noisy data')\n    ax.plot(X_grid, y_true_grid, 'g-', linewidth=2, label='True function')\n    ax.plot(X_grid, y_pred_grid, 'r-', linewidth=2, label='Fitted model')\n    ax.set_title(f'Degree {degree}:\\nMSE={mse:.3f}, Bias²={bias_sq:.3f}, Var={variance:.3f}')\n    ax.legend()\n    ax.set_ylim(-2, 2)\nplt.tight_layout()\nplt.show()\n# ── Learning curves show bias-variance tradeoff ────────\ntrain_sizes = np.linspace(10, 200, 20)\ntrain_scores = []\nval_scores = []\nfrom sklearn.model_selection import cross_val_score\nfor size in train_sizes:\n    X_train = X[:int(size)]\n    y_train = y[:int(size)]\n    model = RandomForestRegressor(n_estimators=10, max_depth=5)\n    train_score = model.fit(X_train, y_train).score(X_train, y_train)\n    train_scores.append(train_score)\n    # CV score\n    cv_score = cross_val_score(model, X_train, y_train, cv=5).mean()\n    val_scores.append(cv_score)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Bias-Variance Tradeoff — Decomposing Error — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nplt.figure(figsize=(10, 6))\nplt.plot(train_sizes, train_scores, label='Training Score', marker='o')\nplt.plot(train_sizes, val_scores, label='Validation Score', marker='o')\nplt.xlabel('Training Set Size')\nplt.ylabel('Score')\nplt.title('Bias-Variance Tradeoff: Learning Curve')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.show()\n# ── Regularization (reduce variance, increase bias slightly) ──\nalphas = [0.001, 0.01, 0.1, 1.0, 10.0]\nscores = []\nfor alpha in alphas:\n    model = Ridge(alpha=alpha)\n    score = cross_val_score(model, X_poly, y, cv=5).mean()\n    scores.append(score)\nplt.figure(figsize=(10, 6))\nplt.semilogx(alphas, scores, marker='o', linewidth=2)\nplt.xlabel('Regularization Strength (α)')\nplt.ylabel('Cross-Validation Score')\nplt.title('Regularization: Bias-Variance Tradeoff')\nplt.grid(True, alpha=0.3)\nplt.show()"
                  }
        ],
        tips: [
                  "Bias decreases as model complexity increases, variance increases — the tradeoff is fundamental.",
                  "Regularization (L1, L2) shifts the tradeoff curve: same complexity, but less variance.",
                  "Learning curves: if training and CV scores are far apart (gap >> variance), the model is overfitting.",
                  "Ensemble methods (bagging, boosting) reduce variance without increasing bias much."
        ],
        mistake: "Assuming \"lower training error = better model.\" High training accuracy with low validation accuracy indicates overfitting (high variance). Focus on generalization, not training fit.",
        shorthand: {
          verbose: "// Manual / verbose approach\nLearning curve + bias-variance decomposition + regularization path\n// More explicit but longer",
          concise: "Model complexity vs train/val score gap",
        },
      },
      {
        id: "regularization-stats",
        fn: "Ridge, Lasso & Elastic Net Regression",
        desc: "Add penalties to reduce overfitting via L1/L2 regularization.",
        category: "Regularization",
        subtitle: "Regularization paths, lambda selection, CV, cross-validation, coef shrinkage",
        signature: "Ridge: minimize ||Y - Xβ||² + λ||β||²₂  |  Lasso: + λ||β||₁  |  Elastic Net: mix",
        descLong: "Ridge (L2) adds penalty on squared coefficients, shrinking all toward zero but rarely zero exactly. Lasso (L1) adds penalty on absolute values, encouraging sparsity (sets some coefficients to exactly zero = feature selection). Elastic Net combines both. Regularization paths show how coefficients change as λ varies. CV selects optimal λ. λ=0: OLS (no regularization). λ → ∞: all coefs → 0. Ridge always computes a solution; Lasso may set many coefs to zero.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Ridge, Lasso & Elastic Net Regression — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.linear_model import Ridge, Lasso, ElasticNet\nfrom sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV\nfrom sklearn.preprocessing import StandardScaler\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── Prepare data ────────────────────────────────────────\nX = np.random.normal(0, 1, (200, 50))\ntrue_coef = np.zeros(50)\ntrue_coef[:5] = np.array([1, 2, -1, 0.5, -0.5])  # only 5 true coefs\ny = X @ true_coef + np.random.normal(0, 0.5, 200)\n# Standardize (critical for Ridge/Lasso)\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\n# ── Ridge Regression (L2 regularization) ───────────────\nalphas = np.logspace(-3, 3, 100)\nridge = Ridge(alpha=1.0)\nridge.fit(X_scaled, y)\nridge_coef = ridge.coef_\nprint(f\"Ridge: max |coef| = {np.max(np.abs(ridge_coef)):.3f}\")\nprint(f\"Ridge: min |coef| = {np.min(np.abs(ridge_coef)):.3f}\")\nprint(f\"Ridge: zero coefs: {np.sum(ridge_coef == 0)}\")  # none\n# ── Lasso Regression (L1 regularization) ──────────────\nlasso = Lasso(alpha=0.1)\nlasso.fit(X_scaled, y)\nlasso_coef = lasso.coef_\nprint(f\"Lasso: max |coef| = {np.max(np.abs(lasso_coef)):.3f}\")\nprint(f\"Lasso: min |coef| (nonzero) = {np.min(np.abs(lasso_coef[lasso_coef != 0])):.3f}\")\nprint(f\"Lasso: zero coefs: {np.sum(lasso_coef == 0)}\")  # many!"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Ridge, Lasso & Elastic Net Regression — common patterns you'll see in production.\n# APPROACH  - Combine Ridge, Lasso & Elastic Net Regression with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Regularization paths ──────────────────────────────\nfrom sklearn.linear_model import lasso_path, ridge_regression\ncoefs_lasso, alphas_lasso, _ = lasso_path(X_scaled, y, alphas=alphas)\ncoefs_ridge = []\nfor alpha in alphas:\n    coef = ridge_regression(X_scaled, y, alpha)[0]\n    coefs_ridge.append(coef)\ncoefs_ridge = np.array(coefs_ridge).T\n# Plot regularization paths\nfig, axes = plt.subplots(1, 2, figsize=(14, 6))\n# Lasso path\nfor i in range(min(5, coefs_lasso.shape[0])):  # plot first 5 coefs\n    axes[0].semilogx(alphas_lasso, coefs_lasso[i], label=f'Coef {i}')\naxes[0].set_xlabel('λ (regularization strength)')\naxes[0].set_ylabel('Coefficient')\naxes[0].set_title('Lasso Regularization Path')\naxes[0].grid(True, alpha=0.3)\naxes[0].legend()\n# Ridge path\nfor i in range(min(5, coefs_ridge.shape[0])):\n    axes[1].semilogx(alphas, coefs_ridge[i], label=f'Coef {i}')\naxes[1].set_xlabel('λ (regularization strength)')\naxes[1].set_ylabel('Coefficient')\naxes[1].set_title('Ridge Regularization Path')\naxes[1].grid(True, alpha=0.3)\naxes[1].legend()\nplt.tight_layout()\nplt.show()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Ridge, Lasso & Elastic Net Regression — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Cross-validation for lambda selection ──────────────\nridge_cv = RidgeCV(alphas=alphas, cv=5)\nridge_cv.fit(X_scaled, y)\nprint(f\"Optimal λ (Ridge): {ridge_cv.alpha_:.3f}\")\nlasso_cv = LassoCV(alphas=alphas, cv=5)\nlasso_cv.fit(X_scaled, y)\nprint(f\"Optimal λ (Lasso): {lasso_cv.alpha_:.3f}\")\nelastic_cv = ElasticNetCV(alphas=alphas, l1_ratio=0.5, cv=5)\nelastic_cv.fit(X_scaled, y)\nprint(f\"Optimal λ (Elastic Net, l1_ratio=0.5): {elastic_cv.alpha_:.3f}\")\n# ── Elastic Net (blend of Ridge and Lasso) ────────────\n# l1_ratio = 1: Lasso; l1_ratio = 0: Ridge\nfig, axes = plt.subplots(1, 3, figsize=(15, 5))\nfor idx, l1_ratio in enumerate([0.1, 0.5, 0.9]):\n    elastic_net = ElasticNetCV(alphas=alphas, l1_ratio=l1_ratio, cv=5)\n    elastic_net.fit(X_scaled, y)\n    coef = elastic_net.coef_\n    n_nonzero = np.sum(coef != 0)\n    axes[idx].bar(range(len(coef)), coef)\n    axes[idx].set_title(f'Elastic Net (l1_ratio={l1_ratio})\\nNon-zero: {n_nonzero}/50')\n    axes[idx].set_xlabel('Coefficient Index')\n    axes[idx].set_ylabel('Coefficient Value')\nplt.tight_layout()\nplt.show()"
                  }
        ],
        tips: [
                  "Always standardize X before Ridge/Lasso — coefficients are scale-sensitive.",
                  "Lasso: good for feature selection (sets coefs to 0); Ridge: good when all features matter.",
                  "Elastic Net: when you want Lasso's sparsity but with Ridge's stability.",
                  "λ selection via CV: plot CV error vs λ, pick λ where CV error is minimized."
        ],
        mistake: "Applying Lasso/Ridge to unscaled features — high-variance features dominate regularization.",
        shorthand: {
          verbose: "// Manual / verbose approach\nRegularization path analysis + CV lambda selection + cross-validation scores\n// More explicit but longer",
          concise: "RidgeCV(), LassoCV(), ElasticNetCV() or R glmnet package",
        },
      },
      {
        id: "feature-selection-stats",
        fn: "Feature Selection — Filter, Wrapper & Embedded Methods",
        desc: "Select relevant features: filter (chi-square, ANOVA), wrapper (RFE), embedded (LASSO).",
        category: "Preprocessing",
        subtitle: "Filter (univariate), wrapper (RFE), embedded (coef importance), feature importance",
        signature: "Filter: rank features independently  |  Wrapper: evaluate subsets  |  Embedded: learn while selecting",
        descLong: "Feature selection removes irrelevant/redundant features. Filter methods (chi-square, ANOVA F-statistic, mutual information) rank features by univariate association with outcome — fast but ignore feature interactions. Wrapper methods (RFE, forward/backward selection) evaluate feature subsets with a model — slower but account for interactions. Embedded methods (LASSO, tree feature importance) select during model training — balance speed and interaction awareness. Curse of dimensionality: too many features overfits, reduces interpretability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Feature Selection — Filter, Wrapper & Embedded Methods — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.feature_selection import (\n    SelectKBest, chi2, f_classif, mutual_info_classif,\n    RFE, SelectFromModel\n)\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.linear_model import LogisticRegression\nimport numpy as np\nimport pandas as pd\n# ── Prepare data ────────────────────────────────────────\nX = np.random.normal(0, 1, (200, 20))\ny = (X[:, 0] > 0) & (X[:, 1] > 0)  # only first 2 features matter\n# ── Filter Methods: Univariate Feature Selection ──────\n# 1. Chi-square (for non-negative features, classification)\n# selector = SelectKBest(chi2, k=5)\nX_nonneg = np.abs(X)  # chi2 requires non-negative\nX_kbest = SelectKBest(chi2, k=5).fit_transform(X_nonneg, y)\n# 2. ANOVA F-statistic (classification, continuous features)\nselector_anova = SelectKBest(f_classif, k=5)\nX_anova = selector_anova.fit_transform(X, y)\n# Get feature scores\nf_scores = selector_anova.scores_\np_values = selector_anova.pvalues_\nfeature_scores = pd.DataFrame({\n    'Feature': [f'X{i}' for i in range(X.shape[1])],\n    'F-Score': f_scores,\n    'p-value': p_values,\n}).sort_values('F-Score', ascending=False)\nprint(\"ANOVA F-scores (top features):\")\nprint(feature_scores.head(10))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Feature Selection — Filter, Wrapper & Embedded Methods — common patterns you'll see in production.\n# APPROACH  - Combine Feature Selection — Filter, Wrapper & Embedded Methods with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# 3. Mutual Information (nonlinear associations)\nselector_mi = SelectKBest(mutual_info_classif, k=5)\nmi_scores = selector_mi.fit(X, y).scores_\n# ── Wrapper Method: Recursive Feature Elimination (RFE) ─\nestimator = LogisticRegression(max_iter=1000, random_state=42)\nselector_rfe = RFE(estimator, n_features_to_select=5, step=1)\nselector_rfe.fit(X, y)\nselected_features_rfe = [f'X{i}' for i, selected in enumerate(selector_rfe.support_) if selected]\nprint(f\"RFE selected features: {selected_features_rfe}\")\nprint(f\"RFE ranking: {selector_rfe.ranking_}\")  # 1=selected, 2,3...=removed order\n# ── Embedded Method 1: LASSO Feature Selection ───────\nfrom sklearn.linear_model import LassoCV\nlasso = LassoCV(cv=5, random_state=42)\nlasso.fit(X, y)\nselected_features_lasso = [f'X{i}' for i, coef in enumerate(lasso.coef_) if coef != 0]\nprint(f\"LASSO selected features: {selected_features_lasso}\")\n# ── Embedded Method 2: Tree Feature Importance ───────\nrf = RandomForestClassifier(n_estimators=100, random_state=42)\nrf.fit(X, y)\nfeature_importances = pd.DataFrame({\n    'Feature': [f'X{i}' for i in range(X.shape[1])],\n    'Importance': rf.feature_importances_,\n}).sort_values('Importance', ascending=False)\nprint(\"Random Forest feature importances:\")\nprint(feature_importances.head(10))\n# ── SelectFromModel (threshold-based on importances) ──\nselector_model = SelectFromModel(rf, prefit=True, threshold='median')\nX_selected = selector_model.transform(X)\nselected_features = [f'X{i}' for i in np.where(selector_model.get_support())[0]]\nprint(f\"SelectFromModel selected features: {selected_features}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Feature Selection — Filter, Wrapper & Embedded Methods — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Comparison ────────────────────────────────────────\nimport matplotlib.pyplot as plt\nfig, axes = plt.subplots(2, 2, figsize=(12, 10))\n# ANOVA\naxes[0, 0].bar(range(len(f_scores)), f_scores)\naxes[0, 0].set_title('ANOVA F-scores (Filter)')\naxes[0, 0].set_ylabel('Score')\n# MI\naxes[0, 1].bar(range(len(mi_scores)), mi_scores)\naxes[0, 1].set_title('Mutual Information (Filter)')\naxes[0, 1].set_ylabel('Score')\n# RFE\naxes[1, 0].bar(range(len(selector_rfe.ranking_)), 10 - selector_rfe.ranking_)\naxes[1, 0].set_title('RFE Ranking (Wrapper)')\naxes[1, 0].set_ylabel('Elimination Order')\n# RF Importance\naxes[1, 1].bar(range(len(rf.feature_importances_)), rf.feature_importances_)\naxes[1, 1].set_title('Random Forest (Embedded)')\naxes[1, 1].set_ylabel('Importance')\nplt.tight_layout()\nplt.show()"
                  }
        ],
        tips: [
                  "Filter: fast (evaluate each feature once), but misses interactions between features.",
                  "Wrapper: slower (evaluates many subsets) but captures feature interactions.",
                  "Embedded: good balance — LASSO selects during training (accounts for interactions, computationally efficient).",
                  "Domain knowledge > statistical feature selection — understand why you're keeping each feature."
        ],
        mistake: "Feature selection on entire dataset then modeling — this introduces data leakage (selection is based on test data). Always select features on training data only.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFilter + wrapper + embedded comparison + cross-validation within selection\n// More explicit but longer",
          concise: "SelectKBest(), RFE(), SelectFromModel() in sklearn",
        },
      },
      {
        id: "ensemble-methods-stats",
        fn: "Ensemble Methods — Bagging, Boosting & Stacking",
        desc: "Reduce error via combining weak learners: bagging reduces variance, boosting reduces bias.",
        category: "Ensemble",
        subtitle: "Bagging, boosting (AdaBoost, Gradient Boosting), stacking, variance reduction",
        signature: "Ensemble ≈ E[F_avg] = mean prediction  |  Variance reduced if members uncorrelated",
        descLong: "Ensemble methods train multiple learners and aggregate predictions. Bagging (bootstrap aggregating) trains on random samples with replacement, reduces variance (each model sees different data). Boosting trains sequentially, each model focuses on previous errors (reduces bias, somewhat reduces variance). Stacking trains meta-learner on base learner predictions. Success depends on: (1) Base learners should be diverse (low correlation). (2) Base learners should be weak but better than random. Variance reduction ~ 1/√n if learners independent.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Ensemble Methods — Bagging, Boosting & Stacking — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.ensemble import (\n    BaggingClassifier, AdaBoostClassifier,\n    GradientBoostingClassifier, StackingClassifier\n)\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nimport numpy as np\n# ── Prepare data ────────────────────────────────────────\nX = np.random.normal(0, 1, (200, 10))\ny = (X[:, 0] > 0).astype(int)\n# ── Bagging (reduces variance) ────────────────────────\n# Train multiple models on bootstrap samples\nbagging = BaggingClassifier(\n    base_estimator=DecisionTreeClassifier(max_depth=3),\n    n_estimators=10,\n    bootstrap=True,  # sample with replacement\n    random_state=42,\n)\nbagging_score = cross_val_score(bagging, X, y, cv=5).mean()\nprint(f\"Bagging accuracy: {bagging_score:.3f}\")\n# ── Boosting: AdaBoost ───────────────────────────────\n# Sequentially weight incorrectly classified samples higher\nadaboost = AdaBoostClassifier(\n    base_estimator=DecisionTreeClassifier(max_depth=1),  # weak learner\n    n_estimators=10,\n    learning_rate=1.0,\n    algorithm='SAMME',  # multi-class variant\n    random_state=42,\n)\nadaboost_score = cross_val_score(adaboost, X, y, cv=5).mean()\nprint(f\"AdaBoost accuracy: {adaboost_score:.3f}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Ensemble Methods — Bagging, Boosting & Stacking — common patterns you'll see in production.\n# APPROACH  - Combine Ensemble Methods — Bagging, Boosting & Stacking with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Boosting: Gradient Boosting ──────────────────────\n# Fit residuals sequentially (reduce bias)\ngbm = GradientBoostingClassifier(\n    n_estimators=10,\n    learning_rate=0.1,\n    max_depth=3,\n    subsample=0.8,  # bagging component\n    random_state=42,\n)\ngbm_score = cross_val_score(gbm, X, y, cv=5).mean()\nprint(f\"Gradient Boosting accuracy: {gbm_score:.3f}\")\n# ── Stacking (meta-learner) ──────────────────────────\n# Train base learners, then meta-learner on predictions\nbase_learners = [\n    ('dt', DecisionTreeClassifier(max_depth=3, random_state=42)),\n    ('lr', LogisticRegression(random_state=42, max_iter=1000)),\n]\nmeta_learner = LogisticRegression(random_state=42, max_iter=1000)\nstacking = StackingClassifier(\n    estimators=base_learners,\n    final_estimator=meta_learner,\n    cv=5,  # cross-validated predictions for training\n)\nstacking_score = cross_val_score(stacking, X, y, cv=5).mean()\nprint(f\"Stacking accuracy: {stacking_score:.3f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Ensemble Methods — Bagging, Boosting & Stacking — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Variance reduction analysis ────────────────────────\n# Single model vs ensemble\nsingle_dt = DecisionTreeClassifier(max_depth=3, random_state=42)\nsingle_score = cross_val_score(single_dt, X, y, cv=5)\nensemble_bagging = BaggingClassifier(single_dt, n_estimators=10)\nensemble_score = cross_val_score(ensemble_bagging, X, y, cv=5)\nprint(f\"Single model: {single_score.mean():.3f} ± {single_score.std():.3f}\")\nprint(f\"Ensemble (bagging): {ensemble_score.mean():.3f} ± {ensemble_score.std():.3f}\")\n# Ensemble variance should be smaller\n# ── Feature importance (tree ensembles) ───────────────\ngbm.fit(X, y)\nimportances = gbm.feature_importances_\nimport matplotlib.pyplot as plt\nplt.barh(range(len(importances)), importances)\nplt.xlabel('Feature Importance')\nplt.ylabel('Feature')\nplt.title('Gradient Boosting Feature Importances')\nplt.show()"
                  }
        ],
        tips: [
                  "Bagging: good for high-variance models (decision trees); reduces variance without increasing bias much.",
                  "Boosting: good for high-bias models (weak learners); reduces bias, slightly increases variance.",
                  "Stacking: combine diverse models (tree + linear) via meta-learner; high computational cost.",
                  "Diversity is key: ensemble only reduces variance if base learners are uncorrelated."
        ],
        mistake: "Ensembling highly correlated models — if all base learners are similar, ensemble doesn't reduce variance.",
        shorthand: {
          verbose: "// Manual / verbose approach\nBase learner diversity analysis + variance reduction quantification\n// More explicit but longer",
          concise: "BaggingClassifier(), GradientBoostingClassifier(), StackingClassifier()",
        },
      },
      {
        id: "calibration-stats",
        fn: "Probability Calibration — Reliable Confidence Estimates",
        desc: "Ensure predicted probabilities match true frequencies via calibration.",
        category: "Evaluation",
        subtitle: "Calibration curves, Platt scaling, isotonic regression, reliability diagrams, Expected Calibration Error",
        signature: "Calibrated: P(Y=1|ŷ=p) = p  |  Platt: σ(a·score + b)  |  Isotonic: monotonic regression",
        descLong: "Many classifiers output well-ranked scores but poorly calibrated probabilities. Calibration = predicted probability matches observed frequency. Reliability diagram: bin predictions, plot predicted vs actual frequency (should be diagonal line). Platt scaling: logistic regression on scores. Isotonic regression: flexible monotonic fitting. Calibration matters for: decision-making (threshold selection), risk quantification, ensembles (probabilistic averaging). Modern ML models (neural nets, tree ensembles) often poorly calibrated — need post-hoc calibration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Probability Calibration — Reliable Confidence Estimates — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.calibration import calibration_curve, CalibratedClassifierCV\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── Prepare data ────────────────────────────────────────\nX = np.random.normal(0, 1, (1000, 10))\ny = (X[:, 0] + X[:, 1] > 0).astype(int)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)\n# ── Uncalibrated model ────────────────────────────────\nmodel_uncal = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel_uncal.fit(X_train, y_train)\ny_proba_uncal = model_uncal.predict_proba(X_test)[:, 1]\n# ── Calibrated model (Platt scaling) ──────────────────\nmodel_cal = CalibratedClassifierCV(\n    model_uncal,\n    method='sigmoid',  # Platt scaling\n    cv=5,\n)\nmodel_cal.fit(X_train, y_train)\ny_proba_cal = model_cal.predict_proba(X_test)[:, 1]\n# ── Calibration curve ─────────────────────────────────\n# Plot: predicted probability vs actual frequency\nprob_true_uncal, prob_pred_uncal = calibration_curve(\n    y_test, y_proba_uncal, n_bins=10, strategy='uniform'\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Probability Calibration — Reliable Confidence Estimates — common patterns you'll see in production.\n# APPROACH  - Combine Probability Calibration — Reliable Confidence Estimates with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nprob_true_cal, prob_pred_cal = calibration_curve(\n    y_test, y_proba_cal, n_bins=10, strategy='uniform'\n)\nplt.figure(figsize=(10, 8))\nplt.plot([0, 1], [0, 1], 'k--', label='Perfect calibration')\nplt.plot(prob_pred_uncal, prob_true_uncal, 's-', label='Uncalibrated RF')\nplt.plot(prob_pred_cal, prob_true_cal, 's-', label='Calibrated RF (Platt)')\nplt.xlabel('Mean Predicted Probability')\nplt.ylabel('Fraction of Positives')\nplt.title('Calibration Curve (Reliability Diagram)')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.show()\n# ── Expected Calibration Error (ECE) ──────────────────\ndef expected_calibration_error(y_true, y_proba, n_bins=10):\n    bin_edges = np.linspace(0, 1, n_bins + 1)\n    ece = 0\n    for i in range(n_bins):\n        mask = (y_proba >= bin_edges[i]) & (y_proba < bin_edges[i + 1])\n        if mask.sum() > 0:\n            acc = (y_true[mask] == (y_proba[mask] >= 0.5)).mean()\n            conf = y_proba[mask].mean()\n            ece += mask.sum() / len(y_true) * np.abs(acc - conf)\n    return ece\nece_uncal = expected_calibration_error(y_test, y_proba_uncal)\nece_cal = expected_calibration_error(y_test, y_proba_cal)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Probability Calibration — Reliable Confidence Estimates — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprint(f\"ECE (Uncalibrated): {ece_uncal:.3f}\")\nprint(f\"ECE (Calibrated): {ece_cal:.3f}\")\n# ── Isotonic regression (more flexible than Platt) ───\nmodel_isotonic = CalibratedClassifierCV(\n    model_uncal,\n    method='isotonic',  # monotonic regression\n    cv=5,\n)\nmodel_isotonic.fit(X_train, y_train)\ny_proba_isotonic = model_isotonic.predict_proba(X_test)[:, 1]\nprob_true_iso, prob_pred_iso = calibration_curve(y_test, y_proba_isotonic, n_bins=10)\nplt.figure(figsize=(10, 8))\nplt.plot([0, 1], [0, 1], 'k--', label='Perfect calibration')\nplt.plot(prob_pred_uncal, prob_true_uncal, 's-', label='Uncalibrated')\nplt.plot(prob_pred_cal, prob_true_cal, 's-', label='Platt scaling')\nplt.plot(prob_pred_iso, prob_true_iso, 's-', label='Isotonic regression')\nplt.xlabel('Mean Predicted Probability')\nplt.ylabel('Fraction of Positives')\nplt.title('Calibration Curve Comparison')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.show()"
                  }
        ],
        tips: [
                  "Calibration curves: if below diagonal, model overconfident (assigns high prob to negatives); above = underconfident.",
                  "Platt scaling: simple (logistic regression on scores), assumes sigmoid shape.",
                  "Isotonic regression: flexible, nonparametric, assumes monotonic relationship.",
                  "Always calibrate on separate hold-out set (not same set used for training calibration model)."
        ],
        mistake: "Not checking calibration. Well-ranked models (high AUC) can be poorly calibrated (bad probability estimates).",
        shorthand: {
          verbose: "// Manual / verbose approach\nCalibration curve + ECE + method comparison\n// More explicit but longer",
          concise: "calibration_curve(), CalibratedClassifierCV()",
        },
      },
      {
        id: "multiple-testing",
        fn: "Multiple Testing Correction — FWER vs FDR",
        desc: "Control error rates when performing multiple hypothesis tests.",
        category: "Hypothesis Testing",
        subtitle: "FWER, FDR, Bonferroni, Benjamini-Hochberg, p-value adjustment, rejection threshold",
        signature: "FWER = P(≥1 false positive)  |  FDR = E[#false pos / #rejections]  |  Bonferroni: α/m",
        descLong: "With m hypothesis tests, family-wise error rate (FWER) = probability of ≥1 false positive. Bonferroni: divide α by m (conservative, loses power). FDR = expected proportion of false discoveries among rejections (less conservative, controls error in expectation). Benjamini-Hochberg: sorts p-values, uses threshold iα/m. For m=1000, Bonferroni → α/1000 (very strict), BH control FDR at level α (more power). p.adjust() in R or statsmodels in Python automates this.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Multiple Testing Correction — FWER vs FDR — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\nimport pandas as pd\n# ── Simulate multiple testing scenario ────────────────\n# 1000 tests: 50 true effects (H1), 950 null (H0)\nnp.random.seed(42)\nm = 1000\nn_true_effects = 50\nn_nulls = m - n_true_effects\n# True effect distribution: mean shift\ntrue_effects = np.random.normal(loc=0.3, scale=0.2, size=n_true_effects)\nnull_effects = np.random.normal(loc=0.0, scale=0.2, size=n_nulls)\n# All effects\nall_effects = np.concatenate([true_effects, null_effects])\n# Generate p-values (one-sample t-tests, n=20 per group)\nn_samples = 20\np_values = []\nfor effect in all_effects:\n    # Data: effect + noise\n    data = effect + np.random.normal(0, 1, n_samples)\n    t_stat, p_val = stats.ttest_1samp(data, 0)\n    p_values.append(p_val)\np_values = np.array(p_values)\n# ── Unadjusted p-values (no correction) ──────────────\nalpha = 0.05\nrejections_unadjusted = np.sum(p_values < alpha)\nfalse_positives = np.sum(p_values[:n_nulls] < alpha)  # false positives among nulls\ntrue_positives = np.sum(p_values[n_nulls:] < alpha)   # true positives among effects\nprint(f\"Unadjusted (α={alpha}):\")\nprint(f\"  Rejections: {rejections_unadjusted} (expected ≈ {int(m*alpha)})\")\nprint(f\"  False positives: {false_positives}\")\nprint(f\"  True positives: {true_positives}\")\nprint(f\"  FWER: {min(1, false_positives)}\")  # 1 or more false positives?\n# ── Bonferroni correction ──────────────────────────────\nalpha_bonf = alpha / m\nrejections_bonf = np.sum(p_values < alpha_bonf)\nfalse_positives_bonf = np.sum(p_values[:n_nulls] < alpha_bonf)\ntrue_positives_bonf = np.sum(p_values[n_nulls:] < alpha_bonf)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Multiple Testing Correction — FWER vs FDR — common patterns you'll see in production.\n# APPROACH  - Combine Multiple Testing Correction — FWER vs FDR with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nprint(f\"Bonferroni (α={alpha_bonf:.6f}):\")\nprint(f\"  Rejections: {rejections_bonf}\")\nprint(f\"  False positives: {false_positives_bonf}\")\nprint(f\"  True positives: {true_positives_bonf}\")\nprint(f\"  FWER control: {false_positives_bonf == 0}\")\n# ── Benjamini-Hochberg (FDR control) ──────────────────\n# Sort p-values, find largest i such that p_(i) <= i·α/m\nsorted_idx = np.argsort(p_values)\nsorted_p = p_values[sorted_idx]\nthreshold_bh = None\nfor i in range(m - 1, -1, -1):\n    if sorted_p[i] <= (i + 1) * alpha / m:\n        threshold_bh = sorted_p[i]\n        break\nrejections_bh = np.sum(p_values <= threshold_bh) if threshold_bh is not None else 0\nfalse_positives_bh = np.sum(p_values[:n_nulls] <= threshold_bh) if threshold_bh else 0\ntrue_positives_bh = np.sum(p_values[n_nulls:] <= threshold_bh) if threshold_bh else 0\nfdr_bh = false_positives_bh / max(1, rejections_bh)\nprint(f\"Benjamini-Hochberg (FDR control at {alpha}):\")\nprint(f\"  Threshold: {threshold_bh:.6f}\")\nprint(f\"  Rejections: {rejections_bh}\")\nprint(f\"  False positives: {false_positives_bh}\")\nprint(f\"  True positives: {true_positives_bh}\")\nprint(f\"  Estimated FDR: {fdr_bh:.3f}\")\n# ── statsmodels p.adjust ──────────────────────────────\nfrom statsmodels.stats.multitest import multipletests\nmethods = ['bonferroni', 'holm', 'benjamini-hochberg', 'fdr_bh']\nresults = {}\nfor method in methods:\n    reject, p_corrected, _, _ = multipletests(p_values, alpha=alpha, method=method)\n    results[method] = {\n        'rejections': np.sum(reject),\n        'false_positives': np.sum(reject[:n_nulls]),\n        'true_positives': np.sum(reject[n_nulls:]),\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Multiple Testing Correction — FWER vs FDR — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nresults_df = pd.DataFrame(results).T\nprint(\"\\nComparison of multiple testing corrections:\")\nprint(results_df)\n# ── Visualization ──────────────────────────────────────\nimport matplotlib.pyplot as plt\nfig, axes = plt.subplots(1, 2, figsize=(14, 5))\n# Histogram of p-values\naxes[0].hist(p_values[:n_nulls], bins=50, alpha=0.5, label='Null (no effect)')\naxes[0].hist(p_values[n_nulls:], bins=50, alpha=0.5, label='True (effect)')\naxes[0].axvline(alpha, color='r', linestyle='--', label='α=0.05')\naxes[0].axvline(alpha/m, color='orange', linestyle='--', label=f'Bonferroni={alpha/m:.6f}')\naxes[0].set_xlabel('p-value')\naxes[0].set_ylabel('Count')\naxes[0].set_title('P-value Distribution')\naxes[0].legend()\n# Number of rejections vs method\nmethods_list = ['Unadjusted', 'Bonferroni', 'Holm', 'BH (FDR)']\nn_reject = [rejections_unadjusted, rejections_bonf,\n            results_df.loc['holm', 'rejections'],\n            results_df.loc['benjamini-hochberg', 'rejections']]\naxes[1].bar(methods_list, n_reject)\naxes[1].set_ylabel('Number of Rejections')\naxes[1].set_title(f'Rejections by Correction Method (α={alpha})')\naxes[1].grid(True, alpha=0.3, axis='y')\nplt.tight_layout()\nplt.show()"
                  }
        ],
        tips: [
                  "FWER (Bonferroni): stricter, better when few false positives tolerated (e.g., rare disease diagnosis).",
                  "FDR (Benjamini-Hochberg): less strict, better for exploratory analysis (e.g., gene discovery).",
                  "Holm's method: sequential Bonferroni, less conservative than Bonferroni, controls FWER.",
                  "Always report: unadjusted and adjusted p-values so reader can judge your choice."
        ],
        mistake: "Using Bonferroni for 1000 tests and finding nothing significant. With large m, Bonferroni becomes too strict. Use FDR/BH instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFWER vs FDR explanation + method comparison + visualization\n// More explicit but longer",
          concise: "multipletests() in statsmodels or p.adjust() in R",
        },
      },
      {
        id: "effect-size-stats",
        fn: "Effect Sizes — Practical Significance",
        desc: "Quantify effect magnitude independent of sample size.",
        category: "Hypothesis Testing",
        subtitle: "Cohen's d, Eta-squared, Odds Ratio, Number Needed to Treat, interpretation",
        signature: "d = (M1-M2)/SD  |  η² = SS_between/SS_total  |  OR = (a*d)/(b*c)  |  NNT = 1/|ARR|",
        descLong: "Effect sizes measure how large a difference is, independent of p-values. Small p-value ≠ large effect (with huge N, tiny effects become significant). Cohen's d (standardized mean diff): 0.2=small, 0.5=medium, 0.8=large. Eta-squared (proportion variance explained): 0.01=small, 0.06=medium, 0.14=large. Odds Ratio: binary outcomes. NNT: clinical relevance (treat how many to help one). Always report with confidence intervals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Effect Sizes — Practical Significance — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\nimport pandas as pd\n# ── Cohen's d (standardized mean difference) ────────\ndef cohens_d(group1, group2):\n    n1, n2 = len(group1), len(group2)\n    var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)\n    pooled_std = np.sqrt(((n1-1)*var1 + (n2-1)*var2) / (n1+n2-2))\n    return (np.mean(group1) - np.mean(group2)) / pooled_std\n# Example: treatment vs control\ncontrol = np.array([10, 12, 11, 9, 13, 10, 12, 11])\ntreatment = np.array([15, 16, 14, 17, 15, 16, 14, 15])\nd = cohens_d(treatment, control)\nprint(f\"Cohen's d: {d:.3f}\")\n# Interpretation: 0.2=small, 0.5=medium, 0.8=large\nif abs(d) < 0.2:\n    effect = \"negligible\"\nelif abs(d) < 0.5:\n    effect = \"small\"\nelif abs(d) < 0.8:\n    effect = \"medium\"\nelse:\n    effect = \"large\"\nprint(f\"Effect size: {effect}\")\n# ── Confidence interval for Cohen's d ───────────────\ndef d_ci(group1, group2, alpha=0.05):\n    n1, n2 = len(group1), len(group2)\n    d = cohens_d(group1, group2)\n    # Standard error\n    se = np.sqrt((n1 + n2) / (n1 * n2) + d**2 / (2 * (n1 + n2 - 2)))\n    z = stats.norm.ppf(1 - alpha/2)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Effect Sizes — Practical Significance — common patterns you'll see in production.\n# APPROACH  - Combine Effect Sizes — Practical Significance with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nreturn d - z*se, d + z*se\nci_low, ci_high = d_ci(treatment, control)\nprint(f\"95% CI: [{ci_low:.3f}, {ci_high:.3f}]\")\n# ── Hedges' g (corrected for small samples) ────────\ndef hedges_g(group1, group2):\n    d = cohens_d(group1, group2)\n    n = len(group1) + len(group2)\n    correction = 1 - (3 / (4 * (n - 2) - 1))\n    return d * correction\ng = hedges_g(treatment, control)\nprint(f\"Hedges' g: {g:.3f} (corrected for small n={len(treatment)+len(control)})\")\n# ── Eta-squared (proportion of variance explained) ──\ngroups_data = [control, treatment, np.array([8, 9, 10, 9, 11, 8, 10, 9])]\ngroup_labels = ['Control', 'Treatment', 'Control 2']\n# Flatten and create group labels\nall_data = np.concatenate(groups_data)\nall_labels = np.concatenate([\n    [label]*len(group) for label, group in zip(group_labels, groups_data)\n])\n# One-way ANOVA\nf_stat, p_val = stats.f_oneway(*groups_data)\n# Eta-squared\ngrand_mean = all_data.mean()\nss_between = sum(len(group)*(np.mean(group) - grand_mean)**2 for group in groups_data)\nss_total = sum((x - grand_mean)**2 for x in all_data)\neta_sq = ss_between / ss_total"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Effect Sizes — Practical Significance — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprint(f\"Eta-squared: {eta_sq:.3f}\")\n# 0.01=small, 0.06=medium, 0.14=large\n# ── Odds Ratio (binary outcomes) ───────────────────\n# Contingency table\na, b, c, d = 30, 70, 10, 90  # disease/no disease × exposed/not exposed\nor_val = (a * d) / (b * c)\nlog_or = np.log(or_val)\nse_log_or = np.sqrt(1/a + 1/b + 1/c + 1/d)\nci = np.exp([log_or - 1.96*se_log_or, log_or + 1.96*se_log_or])\nprint(f\"Odds Ratio: {or_val:.2f}, 95% CI: [{ci[0]:.2f}, {ci[1]:.2f}]\")\n# ── Number Needed to Treat (NNT) ───────────────────\nrisk_treatment = 30 / 100    # 30%\nrisk_control = 10 / 100      # 10%\nabsolute_risk_reduction = abs(risk_treatment - risk_control)\nnnt = 1 / absolute_risk_reduction\nprint(f\"Absolute Risk Reduction: {absolute_risk_reduction:.1%}\")\nprint(f\"NNT: {nnt:.1f} (treat {int(nnt)} people for 1 to benefit)\")\n# ── Proper reporting ───────────────────────────────────\nprint(\"\\n=== PROPER REPORTING ===\")\nprint(f\"Treatment improved outcomes (M={np.mean(treatment):.1f}, SD={np.std(treatment):.1f}) \"\n      f\"compared to control (M={np.mean(control):.1f}, SD={np.std(control):.1f}), \"\n      f\"t({len(treatment)+len(control)-2})={stats.ttest_ind(treatment, control)[0]:.2f}, \"\n      f\"p={stats.ttest_ind(treatment, control)[1]:.3f}, \"\n      f\"Cohen's d={d:.2f} [95% CI: {ci_low:.2f}, {ci_high:.2f}], a {effect} effect.\")"
                  }
        ],
        tips: [
                  "Always report effect sizes WITH confidence intervals — \"d = 0.5\" is incomplete; \"d = 0.5 [0.1, 0.9]\" tells the full story.",
                  "Effect sizes from confidence intervals: if CI includes 0 (or 1 for OR/NNT), effect may be negligible.",
                  "Interpret effect size in context: 0.2 is \"small\" statistically but may be \"large\" clinically depending on outcome.",
                  "Report alongside p-value: \"d=0.1, p<0.001\" shows large sample masked tiny effect."
        ],
        mistake: "Reporting only p-values without effect sizes. \"p<0.001\" with n=10,000 could mean d=0.05 (negligible).",
        shorthand: {
          verbose: "// Manual / verbose approach\nEffect size + CI + interpretation + comparison to benchmarks\n// More explicit but longer",
          concise: "effsize (R); scipy.stats tests + manual d/OR/NNT calculation",
        },
      },
      {
        id: "nonparametric-stats",
        fn: "Nonparametric Tests — When Normality Fails",
        desc: "Distribution-free tests for ordinal/skewed data: Mann-Whitney, Kruskal-Wallis, Wilcoxon.",
        category: "Hypothesis Testing",
        subtitle: "Mann-Whitney U, Kruskal-Wallis, Wilcoxon signed-rank, Spearman correlation, permutation tests",
        signature: "Mann-Whitney: compare 2 groups (replace t-test)  |  Kruskal-Wallis: 3+ groups  |  Spearman: ranks",
        descLong: "Nonparametric tests make no distribution assumptions — use when data is ordinal (Likert scales), heavily skewed, small samples, or outlier-prone. Mann-Whitney U: tests if two independent groups stochastically dominate each other (medians differ). Kruskal-Wallis: extends to 3+ groups. Wilcoxon signed-rank: paired data. Spearman rank correlation: monotonic relationships. Less powerful than parametric tests if assumptions hold, but more robust if they fail.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Nonparametric Tests — When Normality Fails — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom scipy import stats\nimport numpy as np\nimport pandas as pd\n# ── Mann-Whitney U Test (2 independent groups) ──────\n# Non-parametric alternative to independent t-test\ncontrol_scores = [72, 68, 85, 91, 60, 78, 55, 82]\ntreatment_scores = [88, 92, 79, 95, 84, 90, 87, 93]\nu_stat, p_value = stats.mannwhitneyu(\n    treatment_scores, control_scores,\n    alternative='two-sided',\n)\nprint(\"Mann-Whitney U Test:\")\nprint(f\"  U-statistic: {u_stat:.1f}\")\nprint(f\"  p-value: {p_value:.4f}\")\nprint(f\"  Interpretation: groups differ in rank distribution\" if p_value < 0.05 else \"No difference\")\n# ── Effect size for Mann-Whitney (rank biserial) ────\nn1, n2 = len(treatment_scores), len(control_scores)\nr = 1 - (2*u_stat) / (n1 * n2)  # rank biserial correlation\nprint(f\"  Effect size (r): {r:.3f}\")\n# ── Kruskal-Wallis Test (3+ independent groups) ─────\n# Non-parametric alternative to one-way ANOVA\ngroup_a = [4.2, 3.8, 5.1, 4.5, 3.9]\ngroup_b = [6.1, 5.8, 6.5, 5.9, 6.3]\ngroup_c = [3.5, 4.0, 3.2, 3.8, 4.1]\nh_stat, p_value = stats.kruskal(group_a, group_b, group_c)\nprint(\"\\nKruskal-Wallis Test:\")\nprint(f\"  H-statistic: {h_stat:.2f}\")\nprint(f\"  p-value: {p_value:.4f}\")\nprint(f\"  Interpretation: at least one group differs\" if p_value < 0.05 else \"No difference\")\n# ── Post-hoc: Dunn's test for pairwise comparisons ──\n# Requires scikit-posthocs\ntry:\n    import scikit_posthocs as sp\n    # Create data frame\n    data_all = pd.DataFrame({\n        'value': group_a + group_b + group_c,\n        'group': ['A']*5 + ['B']*5 + ['C']*5,\n    })\n    ph_test = sp.posthoc_dunn(data_all, val_col='value', group_col='group', p_adjust='bonferroni')\n    print(\"\\nDunn's post-hoc test (pairwise, Bonferroni-corrected):\")\n    print(ph_test)\nexcept ImportError:\n    print(\"scikit-posthocs not installed\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Nonparametric Tests — When Normality Fails — common patterns you'll see in production.\n# APPROACH  - Combine Nonparametric Tests — When Normality Fails with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Wilcoxon Signed-Rank Test (paired data) ───────\n# Non-parametric alternative to paired t-test\nbefore = [150, 142, 138, 155, 160, 145, 148, 152]\nafter =  [145, 138, 130, 148, 152, 140, 142, 146]\nw_stat, p_value = stats.wilcoxon(before, after, alternative='two-sided')\nprint(\"\\nWilcoxon Signed-Rank Test (paired):\")\nprint(f\"  W-statistic: {w_stat:.1f}\")\nprint(f\"  p-value: {p_value:.4f}\")\nprint(f\"  Interpretation: treatment changed values\" if p_value < 0.05 else \"No change\")\n# ── Spearman Rank Correlation ───────────────────────\n# Non-parametric alternative to Pearson correlation\nx = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\ny = [2, 4, 5, 8, 12, 20, 30, 35, 40, 50]  # non-linear but monotonic\nrho, p_value = stats.spearmanr(x, y)\nprint(\"\\nSpearman Rank Correlation:\")\nprint(f\"  Spearman ρ: {rho:.3f}\")\nprint(f\"  p-value: {p_value:.4f}\")\nprint(f\"  Interpretation: strong monotonic relationship\" if abs(rho) > 0.7 else \"Weak relationship\")\n# ── Permutation Test (most flexible) ───────────────\n# Can test ANY statistic distribution-free\ndef permutation_test(group1, group2, n_permutations=10000):\n    \"\"\"Test if means differ, using permutation test.\"\"\"\n    observed_diff = np.mean(group1) - np.mean(group2)\n    combined = np.concatenate([group1, group2])\n    n1 = len(group1)\n    count = 0\n    for _ in range(n_permutations):\n        np.random.shuffle(combined)\n        perm_diff = np.mean(combined[:n1]) - np.mean(combined[n1:])\n        if abs(perm_diff) >= abs(observed_diff):\n            count += 1"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Nonparametric Tests — When Normality Fails — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nreturn observed_diff, count / n_permutations\ndiff, p_perm = permutation_test(\n    np.array(treatment_scores),\n    np.array(control_scores),\n)\nprint(\"\\nPermutation Test:\")\nprint(f\"  Observed difference: {diff:.2f}\")\nprint(f\"  Permutation p-value: {p_perm:.4f}\")\n# ── Power: nonparametric vs parametric ────────────────\n# Nonparametric tests have less power (~95% of parametric) when assumptions hold\n# But MUCH more robust when assumptions violated\nprint(\"\\n=== Key Points ===\")\nprint(\"• Use nonparametric when: ordinal data, skewed, outliers, small n\")\nprint(\"• Power: ~95% of t-test if data is normal (slight loss)\")\nprint(\"• Power: MUCH better than t-test if data is non-normal\")"
                  }
        ],
        tips: [
                  "Mann-Whitney tests stochastic dominance (ranking), not just central tendency — can miss mean differences in symmetric shifts.",
                  "Kruskal-Wallis + Dunn's test is nonparametric ANOVA + post-hoc.",
                  "Spearman works for monotonic (not necessarily linear) relationships.",
                  "Permutation tests: use when no named test exists or you want distribution-free inference."
        ],
        mistake: "Using parametric tests (t-test, ANOVA) on ordinal data (Likert scales). These violate assumptions. Use nonparametric equivalents.",
        shorthand: {
          verbose: "// Manual / verbose approach\nAssumption checking + nonparametric alternative + effect size\n// More explicit but longer",
          concise: "scipy.stats.mannwhitneyu(), kruskal(), wilcoxon(), spearmanr()",
        },
      },
      {
        id: "cross-validation",
        fn: "Cross-Validation — Reliable Model Evaluation",
        desc: "K-fold, stratified, time series, and nested CV for unbiased performance estimation.",
        category: "Model Evaluation",
        subtitle: "K-Fold, StratifiedKFold, TimeSeriesSplit, nested CV, learning curves",
        signature: "cross_val_score(model, X, y, cv=5)  |  StratifiedKFold  |  TimeSeriesSplit",
        descLong: "Cross-validation splits data into k folds, training on k-1 and testing on 1, rotating through all folds. Stratified CV preserves class proportions. TimeSeriesSplit respects temporal ordering. Nested CV uses an outer loop for evaluation and inner loop for hyperparameter tuning — gives unbiased performance estimates. Learning curves diagnose bias vs variance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Cross-Validation — Reliable Model Evaluation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.model_selection import (\n    cross_val_score, StratifiedKFold, TimeSeriesSplit,\n    learning_curve, train_test_split,\n)\nfrom sklearn.ensemble import RandomForestClassifier\nimport numpy as np\n# ── Basic cross-validation ───────────────────────────\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)\nscores = cross_val_score(model, X, y, cv=5, scoring='f1')\nprint(f\"F1: {scores.mean():.3f} ± {scores.std():.3f}\")\n# F1: 0.847 ± 0.023\n# ── Stratified K-Fold (preserves class ratios) ──────\nskf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\nscores = cross_val_score(model, X, y, cv=skf, scoring='roc_auc')\n# ── Time Series Cross-Validation ─────────────────────\n# NEVER shuffle time series data!\ntscv = TimeSeriesSplit(n_splits=5)\nfor train_idx, test_idx in tscv.split(X):\n    print(f\"Train: {train_idx[0]}-{train_idx[-1]}, \"\n          f\"Test: {test_idx[0]}-{test_idx[-1]}\")\n# Train: 0-199,   Test: 200-299     (expanding window)\n# Train: 0-299,   Test: 300-399\n# Train: 0-399,   Test: 400-499\n# ..."
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Cross-Validation — Reliable Model Evaluation — common patterns you'll see in production.\n# APPROACH  - Combine Cross-Validation — Reliable Model Evaluation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nscores = cross_val_score(model, X, y, cv=tscv, scoring='neg_mean_squared_error')\n# ── Proper train/val/test split ──────────────────────\n# Step 1: Hold out final test set (NEVER touch until the end)\nX_temp, X_test, y_temp, y_test = train_test_split(\n    X, y, test_size=0.15, stratify=y, random_state=42\n)\n# Step 2: Cross-validate on remaining data for model selection\nscores = cross_val_score(model, X_temp, y_temp, cv=5, scoring='f1')\nprint(f\"CV F1: {scores.mean():.3f}\")\n# Step 3: Final evaluation on held-out test set (ONE TIME)\nmodel.fit(X_temp, y_temp)\nfrom sklearn.metrics import f1_score\ntest_f1 = f1_score(y_test, model.predict(X_test))\nprint(f\"Test F1: {test_f1:.3f}\")\n# ── Learning curves (diagnose over/underfitting) ────\ntrain_sizes, train_scores, val_scores = learning_curve(\n    model, X_temp, y_temp,\n    train_sizes=np.linspace(0.1, 1.0, 10),\n    cv=5,\n    scoring='f1',\n    n_jobs=-1,\n)\n# Overfitting: train_scores high, val_scores low (gap)\n# Underfitting: both scores low (no gap, but both bad)\n# Good fit: both high, small gap"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Cross-Validation — Reliable Model Evaluation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Nested cross-validation (unbiased model selection) ─\nfrom sklearn.model_selection import GridSearchCV\n# Inner loop: hyperparameter tuning\ninner_cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)\ngrid = GridSearchCV(\n    model,\n    param_grid={\"n_estimators\": [50, 100, 200], \"max_depth\": [5, 10, None]},\n    cv=inner_cv,\n    scoring='f1',\n)\n# Outer loop: unbiased performance estimate\nouter_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\nnested_scores = cross_val_score(grid, X, y, cv=outer_cv, scoring='f1')\nprint(f\"Nested CV F1: {nested_scores.mean():.3f} ± {nested_scores.std():.3f}\")"
                  }
        ],
        tips: [
                  "5-fold CV is the standard default. Use 10-fold for small datasets, 3-fold for very large datasets or expensive models.",
                  "ALWAYS use StratifiedKFold for classification — regular KFold can create folds with 0% of the minority class.",
                  "Time series data must use TimeSeriesSplit — shuffled k-fold leaks future information and gives over-optimistic results.",
                  "If CV score >> test score, you are overfitting to your validation strategy. Use nested CV for unbiased estimates."
        ],
        mistake: "Tuning hyperparameters on the test set — the test set must be touched only ONCE for final evaluation. Use cross-validation on the training set for hyperparameter tuning. If you tune on test, your reported metrics are over-optimistic.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },
]

export default { meta, sections }
