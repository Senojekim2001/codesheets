export const meta = {
  "title": "Regression & Modeling",
  "domain": "stats",
  "sheet": "regression",
  "icon": "📈"
}

export const sections = [

  // ── Section 1: Regression Analysis & Evaluation ─────────────────────────────────────────
  {
    id: "regression-all",
    title: "Regression Analysis & Evaluation",
    entries: [
      {
        id: "simple-regression",
        fn: "Simple Linear Regression",
        desc: "Model the linear relationship between one predictor and response.",
        category: "Regression",
        subtitle: "Fit ŷ = β₀ + β₁x by minimizing sum of squared residuals",
        signature: "ŷ = β₀ + β₁x  |  β₁ = r·(sy/sx)  |  R² = 1-SS_res/SS_tot",
        descLong: "Simple linear regression finds the line minimizing the sum of squared residuals (OLS). The slope β₁ is the expected change in y per unit change in x. R² is the proportion of variance in y explained by x. Inference requires checking assumptions: linearity, homoscedasticity, normality of residuals, independence.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Simple Linear Regression — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── OLS Formulas ──────────────────────────────────────────\nβ₁ = Σ(xᵢ-x̄)(yᵢ-ȳ) / Σ(xᵢ-x̄)²  = Cov(X,Y)/Var(X)\nβ₀ = ȳ - β₁x̄\nAlternatively:\nβ₁ = r × (sy/sx)   where r = Pearson correlation"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Simple Linear Regression — common patterns you'll see in production.\n# APPROACH  - Combine Simple Linear Regression with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Worked Example ───────────────────────────────────────\nStudy hours (x): [1, 2, 3, 4, 5]   x̄=3\nTest score  (y): [52,58,65,70,78]   ȳ=64.6\nΣ(xᵢ-x̄)(yᵢ-ȳ) = (-2×-12.6)+(-1×-6.6)+(0×0.4)+(1×5.4)+(2×13.4)\n               = 25.2+6.6+0+5.4+26.8 = 64\nΣ(xᵢ-x̄)²     = 4+1+0+1+4 = 10\nβ₁ = 64/10 = 6.4   (each extra hour → +6.4 points)\nβ₀ = 64.6 - 6.4×3 = 45.4\nModel: ŷ = 45.4 + 6.4x"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Simple Linear Regression — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── R² and Goodness of Fit ───────────────────────────────,SS_tot = Σ(yᵢ-ȳ)²   = total variance in y,SS_res = Σ(yᵢ-ŷᵢ)²  = unexplained variance,SS_reg = SS_tot - SS_res = explained variance,,R² = SS_reg/SS_tot = 1 - SS_res/SS_tot   ∈ [0,1],For simple regression: R² = r²,\n── Interpretation ───────────────────────────────────────,β₁ = 6.4: Each additional study hour associated with,          6.4 more points on average, holding all else equal,β₀ = 45.4: Predicted score for 0 study hours,R² = 0.986: 98.6% of score variance explained by hours"
                  }
        ],
        tips: [
                  "OLS gives the BLUE (Best Linear Unbiased Estimator) under Gauss-Markov assumptions",
                  "**Correlation ≠ causation** — regression shows association, not causal direction",
                  "Intercept interpretation is only meaningful if x=0 is in the data range (avoid extrapolation)",
                  "Standardize predictors (z-score) for interpretable comparison of coefficient magnitudes"
        ],
        mistake: "Interpreting R² as the percentage of outcomes 'explained by' x in a causal sense. R² measures predictive fit, not causal explanation. A spurious correlation can give R²=0.99.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "multiple-regression",
        fn: "Multiple Linear Regression",
        desc: "Model response with multiple predictors simultaneously.",
        category: "Regression",
        subtitle: "ŷ = β₀+β₁x₁+...+βₖxₖ — control for confounders",
        signature: "β = (XᵀX)⁻¹Xᵀy  |  Adj-R² = 1-(1-R²)·(n-1)/(n-k-1)",
        descLong: "Multiple regression extends simple regression to k predictors. Each βⱼ is the expected change in y per unit change in xⱼ holding all other predictors constant. Adjusted R² penalizes adding useless predictors. VIF detects multicollinearity. F-test checks if the model predicts better than the mean.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Multiple Linear Regression — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Model & Coefficients ──────────────────────────────────\nŷ = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ + ε\nMatrix form: β = (XᵀX)⁻¹Xᵀy"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Multiple Linear Regression — common patterns you'll see in production.\n# APPROACH  - Combine Multiple Linear Regression with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── ANOVA Table ───────────────────────────────────────────\nSource     │ SS       │ df    │ MS          │ F         │\n───────────┼──────────┼───────┼─────────────┼───────────┤\nRegression │ SS_reg   │ k     │ SS_reg/k    │ MS_reg/   │\n           │          │       │             │ MS_res    │\nResidual   │ SS_res   │ n-k-1 │ SS_res/(n-k-1)│         │\nTotal      │ SS_tot   │ n-1   │             │           │\nH₀: β₁=β₂=...=βₖ=0  (overall model F-test)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Multiple Linear Regression — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Model Diagnostics ─────────────────────────────────────,VIF (Variance Inflation Factor):,  VIF_j = 1/(1-R²_j)  where R²_j = R² from regressing xⱼ on other xs,  VIF < 5: acceptable,  VIF > 10: severe multicollinearity → problem,,Residual plots to check:,  1) Residuals vs Fitted  → linearity, homoscedasticity,  2) Normal Q-Q plot      → normality of residuals,  3) Scale-Location       → homoscedasticity,  4) Residuals vs Leverage→ influential points (Cook's D),\n── Adjusted R² ──────────────────────────────────────────,Adj-R² = 1 - (1-R²)×(n-1)/(n-k-1),,R² always increases with more predictors,Adj-R² penalizes useless predictors → better model selector,\n── Dummy variables ──────────────────────────────────────,Categorical x with c levels → c-1 dummy variables,  (the dropped level is the reference category),Interpretation: coefficient = difference from reference"
                  }
        ],
        tips: [
                  "Use **adjusted R²** or AIC/BIC for model comparison, never raw R²",
                  "**VIF > 10** signals multicollinearity — consider dropping one correlated predictor or use Ridge/LASSO",
                  "Cook's Distance > 4/n flags potentially influential observations — investigate, don't auto-remove",
                  "Interaction terms (x₁×x₂) allow the effect of one predictor to depend on another"
        ],
        mistake: "Adding more predictors to improve R². R² ALWAYS increases — even random noise improves it. Use adjusted R² or cross-validation. Adding irrelevant predictors increases variance of estimates without reducing bias.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "logistic-regression",
        fn: "Logistic Regression",
        desc: "Model binary outcomes — predict probabilities, not a continuous response.",
        category: "Regression",
        subtitle: "Log-odds model for classification with interpretable coefficients",
        signature: "log(p/1-p) = β₀+β₁x  |  p = 1/(1+e^(-Xβ))",
        descLong: "Logistic regression models the log-odds of a binary outcome as a linear function of predictors. Coefficients are log-odds ratios — exponentiate to get odds ratios. Output is a probability between 0 and 1. The decision boundary is where p=0.5.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Logistic Regression — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Model ─────────────────────────────────────────────────\nlog-odds = log(p/(1-p)) = β₀ + β₁x₁ + β₂x₂ + ...\np = 1 / (1 + e^(-(β₀+β₁x₁+...)))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Logistic Regression — common patterns you'll see in production.\n# APPROACH  - Combine Logistic Regression with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Coefficients & Interpretation ────────────────────────\neβⱼ = Odds Ratio (OR)\nOR > 1: xⱼ increases odds of success\nOR < 1: xⱼ decreases odds of success\nOR = 1: xⱼ has no effect\nExample: Credit default model\nlog(p/(1-p)) = -3.2 + 0.8×(income>50k) - 0.15×(credit_score/100)\nIncome coefficient: e^0.8 = 2.23\n→ High income doubles the odds of default?  Wait —\n→ Need to check sign/context — OR interpretation matters"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Logistic Regression — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Evaluation metrics ────────────────────────────────────,Confusion Matrix (threshold=0.5):,              │ Predicted 0  │ Predicted 1  │,  ────────────┼──────────────┼──────────────┤,  Actual 0    │    TN        │    FP        │,  Actual 1    │    FN        │    TP        │,,Accuracy   = (TP+TN)/(TP+TN+FP+FN),Precision  = TP/(TP+FP)    (of positives predicted, how many real?),Recall     = TP/(TP+FN)    (of all positives, how many found?),F1 score   = 2×Precision×Recall/(Precision+Recall),AUC-ROC    = area under the ROC curve (0.5=random, 1.0=perfect),,McFadden R² = 1 - (log-likelihood_model / log-likelihood_null)"
                  }
        ],
        tips: [
                  "Logistic regression doesn't assume normality of predictors — but does assume linearity of log-odds",
                  "For imbalanced classes (e.g., 95% negative), accuracy is misleading — use AUC, F1, or precision-recall",
                  "Threshold 0.5 is arbitrary — adjust based on the relative cost of FP vs FN",
                  "Multinomial logistic regression extends to 3+ unordered categories; ordinal logistic for ordered"
        ],
        mistake: "Using linear regression on a binary outcome (0/1). Predictions can go outside [0,1], and residuals are non-normal. Always use logistic regression for binary outcomes.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "regression-diagnostics",
        fn: "Regression Diagnostics",
        desc: "Identify violations of OLS assumptions: non-linearity, heteroscedasticity, influential points.",
        category: "Regression",
        subtitle: "Residual plots, Cook's D, leverage, VIF, Durbin-Watson",
        signature: "Cook's D > 4/n  |  VIF > 10  |  Breusch-Pagan for heteroscedasticity",
        descLong: "OLS regression assumptions: linearity, independence of errors, constant error variance (homoscedasticity), normality of errors, no multicollinearity. Violations bias estimates or inflate standard errors. Diagnostics detect these violations so you can fix them before trusting inference.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Regression Diagnostics — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── The 4 OLS diagnostic plots ────────────────────────────\nplot(lm_fit)   # in R, produces 4 plots:\n1. Residuals vs Fitted\n   ✓ Random scatter around y=0\n   ✗ Curve → non-linearity (add polynomial/transform)\n   ✗ Funnel shape → heteroscedasticity\n2. Normal Q-Q plot\n   ✓ Points on the diagonal line\n   ✗ S-curve → skewed residuals\n   ✗ Heavy tails → outliers / leptokurtic errors\n3. Scale-Location (√|residuals| vs fitted)\n   ✓ Flat smooth line (constant variance)\n   ✗ Increasing → heteroscedasticity\n4. Residuals vs Leverage\n   ✓ No points outside Cook's D contours\n   ✗ High leverage + high residual = influential point"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Regression Diagnostics — common patterns you'll see in production.\n# APPROACH  - Combine Regression Diagnostics with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Cook's Distance ──────────────────────────────────────\nMeasures how much fitted values change if obs i is removed\nDᵢ = (ŷ - ŷ₍₋ᵢ₎)ᵀ(ŷ - ŷ₍₋ᵢ₎) / (p·MSE)\nRule: Dᵢ > 4/n → potentially influential\n      Dᵢ > 1   → definitely investigate\nHigh leverage (hᵢᵢ): extreme x value\nHigh residual (studentized eᵢ): unusual y for its x\nInfluential: high leverage AND high residual"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Regression Diagnostics — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Multicollinearity (VIF) ───────────────────────────────,VIF_j = 1/(1 - R²_j)   R²_j = R² from xⱼ ~ other xs,,VIF=1: no collinearity,VIF=5: moderate concern,VIF>10: severe — inflates SE, unstable coefficients,,Fixes: drop one correlated predictor, PCA, Ridge regression,\n── Heteroscedasticity ───────────────────────────────────,Detect: Breusch-Pagan test, White test,Fix: weighted least squares (WLS), robust SEs (sandwich),,lm_robust(y~x, data=df, se_type=\"HC3\")  # R: estimatr pkg,\n── Autocorrelation of residuals ─────────────────────────,Durbin-Watson test: H₀: no autocorrelation,DW ≈ 2: no autocorrelation,DW < 1.5: positive autocorrelation (common in time series),Fix: add lagged terms, use time series models"
                  }
        ],
        tips: [
                  "Always check all 4 diagnostic plots before reporting regression results — they take 5 seconds and save enormous embarrassment",
                  "**Influential ≠ outlier**: an outlier has a large residual; an influential point changes the regression line substantially (needs high leverage too)",
                  "Heteroscedasticity doesn't bias coefficients — it inflates standard errors, making inference unreliable. Use robust SEs",
                  "Studentized residuals > ±3 are worth investigating as potential outliers"
        ],
        mistake: "Removing influential points without investigation. Cook's D flags points for examination, not automatic deletion. The point may reveal a data entry error OR genuine extreme observations that are the most scientifically interesting cases.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "regularization",
        fn: "Ridge / LASSO / Elastic Net",
        desc: "Penalized regression for high-dimensional data and multicollinearity.",
        category: "Regression",
        subtitle: "Shrink coefficients toward zero to reduce variance and enable variable selection",
        signature: "Ridge: min Σ(y-Xβ)²+λΣβⱼ²  |  LASSO: min Σ(y-Xβ)²+λΣ|βⱼ|",
        descLong: "When p is large relative to n, or predictors are correlated, OLS is unstable. Ridge regression adds an L2 penalty — shrinks all coefficients but keeps them nonzero. LASSO adds L1 penalty — sets some coefficients to exactly zero (variable selection). Elastic Net combines both.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Ridge / LASSO / Elastic Net — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Bias-Variance Tradeoff ────────────────────────────────\nOLS:  low bias, high variance (when p large or correlated X)\nRidge: more bias, less variance → lower MSE on new data\nLASSO: more bias, less variance + sparsity (feature selection)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Ridge / LASSO / Elastic Net — common patterns you'll see in production.\n# APPROACH  - Combine Ridge / LASSO / Elastic Net with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Ridge regression ──────────────────────────────────────\nMinimize: Σ(yᵢ-ŷᵢ)² + λ·Σβⱼ²\nβ̂_ridge = (XᵀX + λI)⁻¹Xᵀy\n• λ=0: OLS\n• λ→∞: all βⱼ→0\n• Never exactly 0 (groups correlated predictors together)\n• Best for: many small effects, multicollinearity"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Ridge / LASSO / Elastic Net — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── LASSO ─────────────────────────────────────────────────,Minimize: Σ(yᵢ-ŷᵢ)² + λ·Σ|βⱼ|,,• L1 penalty creates sparse solutions (exact zeros),• Can set some βⱼ = 0 → automatic variable selection,• Best for: sparse signal (few important predictors),• Problem: with correlated predictors, picks one arbitrarily,\n── Elastic Net ───────────────────────────────────────────,Minimize: Σ(yᵢ-ŷᵢ)² + λ[α·Σ|βⱼ| + (1-α)·Σβⱼ²],,α=1: LASSO    α=0: Ridge,Best of both: sparse like LASSO + groups correlated like Ridge,\n── Choosing λ via cross-validation ──────────────────────,┌───────────────────────────────────────────────────┐,│ 1. Split data into k folds (typically k=10)        │,│ 2. For each λ in grid:                             │,│    For each fold:                                  │,│      Train on other k-1 folds                      │,│      Predict held-out fold                         │,│    Average prediction error across k folds         │,│ 3. Choose λ with minimum CV error                  │,│    Or λ_1SE: largest λ within 1SE of minimum       │,└───────────────────────────────────────────────────┘,,R: glmnet::cv.glmnet(X, y, alpha=1)  # LASSO,   lambda_min = cv_fit$lambda.min,   lambda_1se = cv_fit$lambda.1se"
                  }
        ],
        tips: [
                  "**Always standardize predictors** before Ridge/LASSO — the penalty treats all coefficients equally so scale matters",
                  "λ_1se gives a sparser model than λ_min with similar performance — often preferred for interpretability",
                  "LASSO for variable selection, Ridge for prediction when all predictors are relevant, Elastic Net when you want both",
                  "Standardized coefficients from regularized models are comparable — useful for variable importance ranking"
        ],
        mistake: "Applying LASSO without standardizing predictors. A predictor measured in thousands will have a tiny coefficient — LASSO penalizes it less than it should. Standardize all predictors to zero mean, unit variance first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "cross-validation",
        fn: "Cross-Validation & Model Selection",
        desc: "Estimate true out-of-sample performance and select between competing models.",
        category: "Model Evaluation",
        subtitle: "k-fold CV, LOOCV, train/val/test split, AIC/BIC",
        signature: "CV error = (1/k)Σ MSE_fold  |  AIC = -2ℓ+2p  |  BIC = -2ℓ+p·log(n)",
        descLong: "In-sample R² always improves with more predictors — it's a terrible model selection criterion. Cross-validation estimates how the model performs on new data. AIC and BIC penalize complexity. Always report performance on a held-out test set never used in model development.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Cross-Validation & Model Selection — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── k-Fold Cross-Validation ───────────────────────────────\n┌─────────────────────────────────────────────────────┐\n│ Data: |──fold1──|──fold2──|──fold3──|──fold4──|──fold5─│\n│                                                     │\n│ Round 1: [TEST][train][train][train][train]          │\n│ Round 2: [train][TEST][train][train][train]          │\n│ Round 3: [train][train][TEST][train][train]          │\n│ ...                                                 │\n│ CV error = mean error across all TEST folds          │\n└─────────────────────────────────────────────────────┘\nk=10 is the standard\nk=n: LOOCV (computationally expensive, high variance)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Cross-Validation & Model Selection — common patterns you'll see in production.\n# APPROACH  - Combine Cross-Validation & Model Selection with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Three-way split ───────────────────────────────────────\nTrain (60%): fit models\nValidation (20%): tune hyperparameters, select model\nTest (20%): final unbiased performance estimate\n           ← TOUCH ONLY ONCE AT THE VERY END"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Cross-Validation & Model Selection — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── AIC and BIC ───────────────────────────────────────────,AIC = -2·ℓ(θ̂) + 2p,BIC = -2·ℓ(θ̂) + p·ln(n),,Lower AIC/BIC = better model (penalizes complexity),,BIC penalizes more severely for large n → sparser models,AIC: asymptotically optimal for prediction,BIC: consistent (selects true model if it's in the set),,AIC difference interpretation:,ΔAIC < 2: models essentially equivalent,ΔAIC 4-7: considerably less support for higher AIC model,ΔAIC > 10: essentially no support,\n── Metrics by task ───────────────────────────────────────,Regression:     RMSE, MAE, R²_adj,Classification: Accuracy, AUC-ROC, F1, Log-loss,Counts/rates:   Poisson deviance,Survival:       C-index (concordance),\n── Overfitting signs ─────────────────────────────────────,Train R²: 0.95   Test R²: 0.52  → Overfitting,Train R²: 0.72   Test R²: 0.68  → Good generalization"
                  }
        ],
        tips: [
                  "The test set is **sacred** — never use it for model selection or hyperparameter tuning or your estimate is optimistic",
                  "Stratified k-fold for classification: ensures each fold has the same class distribution as full dataset",
                  "AIC vs BIC: with large n, BIC picks simpler models. For prediction, AIC often wins; for model identification, BIC",
                  "Repeated k-fold (e.g., 5 repeats of 10-fold) gives more stable estimates of CV error"
        ],
        mistake: "Tuning hyperparameters on the test set. You've peeked at the answer — your performance estimate is now optimistic. Use a validation set or nested cross-validation for hyperparameter tuning.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "pca",
        fn: "PCA — Principal Component Analysis",
        desc: "Reduce dimensionality by finding orthogonal axes of maximum variance.",
        category: "Multivariate",
        subtitle: "Eigendecomposition of the covariance matrix — unsupervised dimension reduction",
        signature: "Σ = VΛVᵀ  |  PCᵢ = Vᵢᵀx  |  Prop. variance = λᵢ/Σλⱼ",
        descLong: "PCA finds a set of orthogonal directions (principal components) that capture maximum variance in the data. The first PC explains the most variance, the second is orthogonal to the first and explains the next most, etc. Used for dimensionality reduction, visualization, and removing multicollinearity before regression.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of PCA — Principal Component Analysis — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Algorithm ─────────────────────────────────────────────\n1. Center data: X̃ = X - μ  (and scale if variables differ in units)\n2. Compute covariance matrix: Σ = X̃ᵀX̃/(n-1)\n3. Eigendecompose: Σ = VΛVᵀ\n   V = matrix of eigenvectors (principal directions)\n   Λ = diagonal matrix of eigenvalues (variances explained)\n4. Project: Z = X̃V  (scores on PCs)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of PCA — Principal Component Analysis — common patterns you'll see in production.\n# APPROACH  - Combine PCA — Principal Component Analysis with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Scree plot ────────────────────────────────────────────\nEigenvalues: λ₁=4.2  λ₂=2.1  λ₃=0.8  λ₄=0.5  λ₅=0.4\nTotal = 8.0\nVariance explained:\n  PC1: 4.2/8.0 = 52.5%\n  PC2: 2.1/8.0 = 26.3%\n  PC3: 0.8/8.0 = 10.0%\n  Cumulative: 88.8% with first 3 PCs\n     5 │ ×\n     4 │\n     3 │\n     2 │    ×\n     1 │        ×──×──×   ← 'elbow' → keep PCs before bend\n       └─────────────────\n          1  2  3  4  5"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of PCA — Principal Component Analysis — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Loadings interpretation ──────────────────────────────,PC1 loadings: [0.6, 0.7, -0.1, 0.2]  (for 4 variables),→ PC1 is a weighted combination of all variables,→ High positive loading: variable moves WITH PC1,→ High negative loading: variable moves AGAINST PC1,→ Near-zero loading: variable barely contributes,\n── Biplot ────────────────────────────────────────────────,Plot PC1 vs PC2:,• Points (rows): observations in PC space,• Arrows (variables): loading vectors,• Long arrow: variable well-represented in this 2D view,• Arrow angle: correlation (same direction=correlated,,   opposite=anti-correlated, perpendicular=uncorrelated),\n── When to scale ─────────────────────────────────────────,Different units (height in cm, weight in kg) → always scale,Same units (gene expression) → scale optional,Use prcomp(X, scale=TRUE) in R"
                  }
        ],
        tips: [
                  "**Always standardize** (zero mean, unit variance) before PCA when variables are on different scales — otherwise the highest-variance variable dominates",
                  "Eigenvalue > 1 rule (Kaiser): keep PCs with eigenvalue > 1. Scree plot elbow is more visual",
                  "PCA is unsupervised — it ignores the outcome variable. PLS (Partial Least Squares) is supervised and often better for prediction",
                  "PCA components are orthogonal (uncorrelated) — using them as regression predictors eliminates multicollinearity"
        ],
        mistake: "Interpreting PCA components causally. 'PC1 represents health' is a post-hoc narrative — PCA finds mathematical directions of variance, not causal constructs. Loading names are human interpretations, not facts.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "roc-auc-precision-recall",
        fn: "ROC Curve / AUC / Precision-Recall",
        desc: "Evaluate classification models across all decision thresholds.",
        category: "Model Evaluation",
        subtitle: "TPR vs FPR tradeoff, AUC, F1 score, and when each matters",
        signature: "TPR = TP/(TP+FN)  |  FPR = FP/(FP+TN)  |  AUC = ∫ROC dt",
        descLong: "The ROC curve plots True Positive Rate vs False Positive Rate across all classification thresholds. AUC (area under the curve) summarizes overall discrimination ability — 0.5=random, 1.0=perfect. For imbalanced classes, the Precision-Recall curve is more informative.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ROC Curve / AUC / Precision-Recall — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── Confusion Matrix ─────────────────────────────────────\nAt threshold t:\n              Predicted +    Predicted -\n  Actual +    TP (hit)        FN (miss)\n  Actual -    FP (false alm)  TN (correct)\nSensitivity = TPR = Recall = TP/(TP+FN)\nSpecificity = TNR = TN/(TN+FP) = 1-FPR\nPrecision   = PPV = TP/(TP+FP)\nAccuracy    = (TP+TN)/N\nF1 score    = 2·Precision·Recall/(Precision+Recall)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ROC Curve / AUC / Precision-Recall — common patterns you'll see in production.\n# APPROACH  - Combine ROC Curve / AUC / Precision-Recall with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── ROC Curve ─────────────────────────────────────────────\nFor each threshold t from 1→0:\n  Compute FPR and TPR\n  Plot point (FPR, TPR)\n  TPR\n  1.0│             ╭──────── Perfect\n     │          ╭──╯\n     │       ╭──╯ ← Good model\n  0.5│   ╭───╯\n     │ ╭─╯  ← Random (AUC=0.5)\n  0.0└──────────────\n     0.0    0.5    1.0   FPR\nAUC = area under the ROC curve\nAUC = P(model ranks random positive > random negative)\n  0.5: random classifier\n  0.7: acceptable\n  0.8: excellent\n  0.9: outstanding\n  1.0: perfect (suspect overfit)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ROC Curve / AUC / Precision-Recall — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Precision-Recall Curve ───────────────────────────────,Plots Precision vs Recall across thresholds,,Use PR curve when:,• Classes are imbalanced (e.g., fraud: 0.1% positive),• You care more about positive class performance,,AUPRC > baseline (= prevalence): model better than chance,\n── Threshold selection ───────────────────────────────────,Optimal threshold depends on costs:,  Equal FP/FN cost: Youden's J = max(TPR + TNR - 1),  FN >> FP (e.g. cancer): maximize recall at target precision,  FP >> FN (e.g. spam): maximize precision at target recall,\n── Calibration ──────────────────────────────────────────,A model that predicts p=0.7 should be right 70% of the time,Calibration curve: predicted probability vs observed frequency,Platt scaling / isotonic regression: post-hoc calibration"
                  }
        ],
        tips: [
                  "AUC is threshold-independent — use it to compare models. Choose your threshold separately based on the deployment cost structure",
                  "**High AUC ≠ well-calibrated**: a model might rank correctly but predict p=0.9 when truth is 0.6",
                  "For fraud/rare disease detection: precision-recall is more informative than ROC when positives are <5% of data",
                  "Multi-class AUC: use one-vs-rest AUC averaged across classes (macro-averaged AUC)"
        ],
        mistake: "Optimizing threshold on the test set. The threshold should be chosen on the validation set based on business costs, not tuned to maximize test set metrics — that's data leakage.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "regularization-ridge-lasso",
        fn: "Ridge / LASSO / Elastic Net Regression",
        desc: "Penalized regression for high-dimensional data.",
        category: "Regression",
        subtitle: "Shrink coefficients to reduce variance and select features",
        signature: "Ridge: min Σ(residuals)² + λΣβ²  |  LASSO: + λΣ|β|",
        descLong: "When p is large or predictors are correlated, OLS is unstable. Ridge adds L2 penalty (shrinkage). LASSO adds L1 penalty (shrinkage + variable selection). Elastic Net combines both.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Ridge / LASSO / Elastic Net Regression — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Bias-Variance Tradeoff ────────────────────────────────\n# OLS:    low bias, high variance (overfit with p large)\n# Ridge:  some bias, lower variance (better generalization)\n# LASSO:  some bias, lower variance, feature selection\n# ── Ridge Regression ────────────────────────────────────────\n# Example: 100 observations, 1000 predictors\n# library(glmnet)\nlibrary(glmnet)\n# Simulate data:\nX <- matrix(rnorm(100*1000), 100, 1000)\ny <- X[,1] + 0.5*X[,2] + rnorm(100)  # true: only 2 features matter\n# Ridge regression (alpha=0):\nfit_ridge <- glmnet(X, y, alpha=0)\n# Different λ values (tuning parameter)\n# Cross-validation to select λ:\ncv_fit_ridge <- cv.glmnet(X, y, alpha=0)\nlambda_min <- cv_fit_ridge$lambda.min\nlambda_1se <- cv_fit_ridge$lambda.1se\n# lambda_1se: largest λ within 1 SE of minimum"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Ridge / LASSO / Elastic Net Regression — common patterns you'll see in production.\n# APPROACH  - Combine Ridge / LASSO / Elastic Net Regression with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Coefficients at λ_min:\ncoef(fit_ridge, s=lambda_min)\n# ── LASSO Regression ───────────────────────────────────────\n# alpha=1 for LASSO, alpha=0.5 for Elastic Net\nfit_lasso <- glmnet(X, y, alpha=1)\ncv_fit_lasso <- cv.glmnet(X, y, alpha=1)\ncoef(fit_lasso, s=cv_fit_lasso$lambda.1se)\n# Many coefficients are exactly 0 (feature selection!)\n# ── Elastic Net ────────────────────────────────────────────\nfit_enet <- glmnet(X, y, alpha=0.5)\n# Combines Ridge (group correlated features) + LASSO (sparsity)\n# ── Plot tuning curve ──────────────────────────────────────\nplot(cv_fit_lasso)\n# Shows CV error (red) vs λ\n# Vertical line at λ_min and λ_1se"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Ridge / LASSO / Elastic Net Regression — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Standardize predictors! ───────────────────────────────\n# IMPORTANT: glmnet standardizes automatically (with standardize=TRUE)\n# But manually standardizing makes interpretation clearer:\nX_scaled <- scale(X)\nfit_lasso <- glmnet(X_scaled, y, alpha=1, standardize=FALSE)\n# ── Interpretation of LASSO selected features ──────────────\n# LASSO typically selects a sparse set of important features\n# This is better interpretability than Ridge (all features non-zero)\n# ── Prediction ────────────────────────────────────────────\nnew_X <- matrix(rnorm(10*1000), 10, 1000)\npred_ridge <- predict(fit_ridge, s=lambda_1se, newx=new_X)\npred_lasso <- predict(fit_lasso, s=lambda_1se, newx=new_X)"
                  }
        ],
        tips: [
                  "Always standardize (scale) predictors before Ridge/LASSO — the penalty is scale-sensitive",
                  "Use λ_1se (largest λ within 1 SE) for simpler models with similar performance",
                  "LASSO for feature selection; Ridge when all predictors are relevant",
                  "Elastic Net when correlated predictors — better than pure LASSO"
        ],
        mistake: "Not standardizing before Ridge/LASSO. A predictor in thousands will have tiny coefficient, penalized less. Standardize to unit variance first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "model-diagnostics-residuals",
        fn: "Regression Diagnostics: Residuals & Influence",
        desc: "Check OLS assumptions and identify problematic observations.",
        category: "Regression",
        subtitle: "Normality, homoscedasticity, linearity, influential points",
        signature: "plot(fit)  |  Cook's D > 4/n  |  Studentized residuals > ±3",
        descLong: "OLS regression requires: linearity, independence, constant variance, normally distributed errors, no multicollinearity. Diagnostics plots reveal violations. Cook's distance identifies influential points.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Regression Diagnostics: Residuals & Influence — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Fit regression ────────────────────────────────────\nfit <- lm(mpg ~ wt + hp, data=mtcars)\n# ── The 4 automatic diagnostic plots ───────────────────────\npar(mfrow=c(2,2))\nplot(fit)\n# 1. Residuals vs Fitted: linearity & homoscedasticity\n# 2. Normal Q-Q: normality of residuals\n# 3. Scale-Location: homoscedasticity (another view)\n# 4. Residuals vs Leverage: influential points (Cook's D)\n# ── Extract residuals (different types) ───────────────────\nresiduals(fit)          # raw (y - ŷ)\nrstudent(fit)           # studentized (scaled by SE)\nrstandard(fit)          # standardized (sd=1)\n# Interpretation:\n# |rstudent| > 2 → possible outlier\n# |rstudent| > 3 → probable outlier\n# ── Cook's Distance: influence ─────────────────────────────\ncooksd <- cooks.distance(fit)\nthreshold <- 4/nrow(mtcars)\nplot(cooksd)\nabline(h=threshold, col='red')\n# Points > threshold are influential"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Regression Diagnostics: Residuals & Influence — common patterns you'll see in production.\n# APPROACH  - Combine Regression Diagnostics: Residuals & Influence with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ninfluential_obs <- names(cooksd[cooksd > threshold])\n# Should investigate but not automatically remove\n# ── Leverage: extreme x values ─────────────────────────────\n# Hat values (diagonal of hat matrix):\nhatvals <- hatvalues(fit)\nmean_hat <- mean(hatvals)  # 2p/n\n# High leverage: hatval > 2*mean_hat or > 3*mean_hat\n# ── Multicollinearity (VIF) ───────────────────────────────\nlibrary(car)\nvif(fit)\n# wt  hp\n# 1.6 1.8\n# VIF < 5: acceptable\n# VIF > 10: problematic\n# ── Test for heteroscedasticity ────────────────────────────\nlibrary(car)\nncvTest(fit)  # Breusch-Pagan test\n# p < 0.05 → heteroscedasticity present\n# Fix: use robust standard errors\nlibrary(lmtest)\ncoeftest(fit, vcov=vcovHC(fit))  # HC3 robust SEs"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Regression Diagnostics: Residuals & Influence — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Test for autocorrelation (time series) ────────────────\ndurbinWatsonTest(fit)\n# DW ≈ 2: no autocorrelation\n# DW < 2: positive autocorrelation\n# ── Normality tests ────────────────────────────────────────\nshapiro.test(residuals(fit))\n# p < 0.05 → residuals depart from normality\n# ── Summary of assumption checks ──────────────────────────\n# 1. Linearity:   plot 1 (Residuals vs Fitted)\n# 2. Normality:   plot 2 (Normal Q-Q) + Shapiro test\n# 3. Homoscedasticity: plot 3 (Scale-Location) + ncvTest\n# 4. Independence: Durbin-Watson (time series)\n# 5. Multicollinearity: VIF < 10\n# 6. Outliers/Influence: Cook's D, leverage, studentized residuals"
                  }
        ],
        tips: [
                  "Always run plot(fit) before trusting regression results — visual inspection catches many issues",
                  "Heteroscedasticity: use robust SEs (HC3) rather than transforming",
                  "Influential ≠ outlier: influential obs have both high residual AND high leverage",
                  "Studentized residuals > ±3 are worth investigating — may reveal data entry errors"
        ],
        mistake: "Removing influential points without justification. They may be the most scientifically interesting observations. Investigate first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "variable-selection-criteria",
        fn: "Model Selection: AIC, BIC, Cross-Validation",
        desc: "Choose between competing models fairly.",
        category: "Model Evaluation",
        subtitle: "AIC penalizes complexity; BIC more heavily; CV estimates out-of-sample error",
        signature: "AIC = -2ℓ + 2p  |  BIC = -2ℓ + p·ln(n)  |  CV error = mean(fold errors)",
        descLong: "In-sample R² always improves with more predictors — it's a terrible selection criterion. AIC and BIC penalize model complexity. Cross-validation estimates how the model performs on new data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Model Selection: AIC, BIC, Cross-Validation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Three competing models ────────────────────────────\nfit1 <- lm(mpg ~ wt, data=mtcars)\nfit2 <- lm(mpg ~ wt + hp, data=mtcars)\nfit3 <- lm(mpg ~ wt + hp + cyl, data=mtcars)\n# ── Compare R² (WRONG!) ────────────────────────────────────\n# fit1: R² = 0.753\n# fit2: R² = 0.827\n# fit3: R² = 0.841\n# Always increasing! R² is not a good criterion\n# ── Compare AIC (correct) ──────────────────────────────────\nAIC(fit1, fit2, fit3)\n#    df  AIC\n# fit1  3  156.0\n# fit2  4  141.0  ← best (lowest AIC)\n# fit3  5  142.5\n# ∆AIC = AIC - min(AIC)\n# ∆AIC < 2: models essentially equivalent\n# ∆AIC 4-7: considerably less support\n# ∆AIC > 10: essentially no support"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Model Selection: AIC, BIC, Cross-Validation — common patterns you'll see in production.\n# APPROACH  - Combine Model Selection: AIC, BIC, Cross-Validation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── AIC vs BIC ────────────────────────────────────────────\nBIC(fit1, fit2, fit3)\n#    df  BIC\n# fit1  3  160.0\n# fit2  4  147.5\n# fit3  5  152.0\n# BIC penalizes complexity more heavily than AIC\n# For large n: BIC selects sparser models (more conservative)\n# For prediction: AIC often better\n# For model identification: BIC often better\n# ── Cross-Validation ───────────────────────────────────────\nlibrary(caret)\n# 10-fold CV:\nctrl <- trainControl(method='cv', number=10)\nm1_cv <- train(mpg ~ wt, data=mtcars,\n               method='lm', trControl=ctrl)\nm2_cv <- train(mpg ~ wt + hp, data=mtcars,\n               method='lm', trControl=ctrl)\nm3_cv <- train(mpg ~ wt + hp + cyl, data=mtcars,\n               method='lm', trControl=ctrl)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Model Selection: AIC, BIC, Cross-Validation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Compare RMSE on hold-out folds:\nm1_cv$results$RMSE\nm2_cv$results$RMSE  # ← lowest?\nm3_cv$results$RMSE\n# ── Nested CV for hyperparameter tuning ────────────────────\n# Outer CV: estimate test performance\n# Inner CV: select hyperparameters\n# Prevents overly optimistic estimate\n# ── Practical workflow ────────────────────────────────────\n# 1. Fit several candidate models\n# 2. Compare via AIC/BIC or CV on validation set\n# 3. Select best model\n# 4. Evaluate on held-out test set (ONLY ONCE, at the end)"
                  }
        ],
        tips: [
                  "Adjusted R² = R² - (1-R²)·p/(n-p-1) penalizes complexity — better than raw R²",
                  "The test set is sacred — never use it for model selection, only for final evaluation",
                  "Stratified k-fold for classification: ensures each fold has same class distribution",
                  "Repeated k-fold (5-fold repeated 5 times) gives more stable CV estimates"
        ],
        mistake: "Tuning hyperparameters on the test set. You've peeked at the answer — your estimate is now optimistic. Use validation set or nested CV.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },
]

export default { meta, sections }
