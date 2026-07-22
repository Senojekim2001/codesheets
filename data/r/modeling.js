export const meta = {
  "title": "Statistical Modeling in R",
  "domain": "r",
  "sheet": "modeling",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: Statistical Modeling in R ─────────────────────────────────────────
  {
    id: "r-modeling-all",
    title: "Statistical Modeling in R",
    entries: [
      {
        id: "r-t-tests-anova",
        fn: "t-tests, ANOVA & Chi-Square in R",
        desc: "Run the core hypothesis tests using base R functions.",
        category: "R Statistics",
        subtitle: "t.test(), aov(), chisq.test(), cor.test()",
        signature: "t.test(x, y, paired=FALSE)  |  aov(y~x, data=df)",
        descLong: "Base R provides comprehensive hypothesis testing. t.test() handles one-sample, two-sample, and paired tests. aov() runs ANOVA with TukeyHSD() for post-hoc tests. chisq.test() for categorical independence. cor.test() tests correlation significance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of t-tests, ANOVA & Chi-Square in R — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── t-tests ────────────────────────────────────────────\n# One-sample:\nt.test(x, mu=50)                   # H0: μ=50\nt.test(x, mu=50, alternative=\"greater\")  # one-sided\n# Two-sample (Welch by default, unequal variances):\nt.test(x, y)                       # two-sided\nt.test(score ~ group, data=df)     # formula interface\nt.test(x, y, var.equal=TRUE)       # Student's (equal var)\n# Paired:\nt.test(before, after, paired=TRUE)\n# Access results:\ntest <- t.test(x, mu=50)\ntest$statistic   # t value\ntest$p.value     # p-value\ntest$conf.int    # confidence interval"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of t-tests, ANOVA & Chi-Square in R — common patterns you'll see in production.\n# APPROACH  - Combine t-tests, ANOVA & Chi-Square in R with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── ANOVA ──────────────────────────────────────────────\nfit <- aov(score ~ method, data=df)\nsummary(fit)        # ANOVA table: F-stat, p-value\n# Post-hoc (Tukey's HSD):\nTukeyHSD(fit)\nplot(TukeyHSD(fit))  # CI plot of pairwise differences\n# Two-way ANOVA:\nfit2 <- aov(score ~ method + gender + method:gender,\n            data=df)\nsummary(fit2)\n# ── Chi-square ─────────────────────────────────────────\ntable(df$dept, df$seniority)       # contingency table\nchisq.test(table(df$dept, df$seniority))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of t-tests, ANOVA & Chi-Square in R — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Goodness of fit:\nobs <- c(25, 30, 45)\nexp_p <- c(1/3, 1/3, 1/3)  # expected proportions\nchisq.test(obs, p=exp_p)\n# ── Correlation test ───────────────────────────────────\ncor.test(x, y)                    # Pearson\ncor.test(x, y, method=\"spearman\") # Spearman\ncor.test(x, y, method=\"kendall\")  # Kendall\n# Correlation matrix:\ncor(df[, sapply(df, is.numeric)])  # numeric cols only"
                  }
        ],
        tips: [
                  "Welch's t-test (default `var.equal=FALSE`) is always safer — it's nearly identical to Student's when variances ARE equal",
                  "Formula interface `score ~ group` works across t.test, aov, lm, glm — learn it once, use everywhere",
                  "`broom::tidy(test)` converts any test output to a clean tibble — great for storing/combining results",
                  "For non-parametric: `wilcox.test()` for Mann-Whitney, `kruskal.test()` for Kruskal-Wallis"
        ],
        mistake: "Using `aov()` and not running post-hoc tests. A significant ANOVA F-test just says SOME groups differ. Always follow up with `TukeyHSD()` or another post-hoc test to identify WHICH pairs differ.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-regression",
        fn: "lm() & glm() — Regression in R",
        desc: "Fit linear and generalized linear models with diagnostics.",
        category: "R Statistics",
        subtitle: "lm for continuous outcomes, glm for binary/count outcomes",
        signature: "lm(y ~ x1+x2, data=df)  |  glm(y ~ x, family=binomial)",
        descLong: "lm() fits ordinary least squares regression. glm() extends this to generalized linear models for non-normal outcomes: logistic regression (binomial family), Poisson regression (poisson family). The formula interface is consistent. summary(), plot(), and broom::tidy() provide diagnostics and tidy output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of lm() & glm() — Regression in R — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Linear regression ──────────────────────────────────\nfit <- lm(mpg ~ wt + hp + cyl, data=mtcars)\nsummary(fit)    # coefficients, SE, t, p, R², F-stat\ncoef(fit)       # just coefficients\nconfint(fit)    # 95% CIs for coefficients\nresiduals(fit)  # residuals\nfitted(fit)     # fitted values ŷ\npredict(fit)    # same as fitted for training data\n# Predict new data:\nnew_data <- data.frame(wt=3.0, hp=150, cyl=6)\npredict(fit, newdata=new_data, interval=\"prediction\")\n#   fit      lwr      upr\n# 19.83   12.94   26.73\n# ── Formula interface ──────────────────────────────────\nlm(y ~ x)          # y = b0 + b1*x\nlm(y ~ x - 1)      # force through origin (no intercept)\nlm(y ~ x + z)      # multiple predictors\nlm(y ~ x * z)      # x + z + interaction x:z\nlm(y ~ x + I(x^2)) # polynomial (I() prevents formula interp)\nlm(y ~ log(x))     # log transform\nlm(y ~ . )         # all other columns as predictors\nlm(y ~ . - id)     # all except 'id'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of lm() & glm() — Regression in R — common patterns you'll see in production.\n# APPROACH  - Combine lm() & glm() — Regression in R with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Diagnostic plots ───────────────────────────────────\npar(mfrow=c(2,2))\nplot(fit)  # 4 diagnostic plots\n# 1: Residuals vs Fitted (check linearity, homoscedasticity)\n# 2: Normal Q-Q (check normality of residuals)\n# 3: Scale-Location (sqrt(|residuals|) vs fitted)\n# 4: Residuals vs Leverage (identify influential points)\n# ── Logistic regression ────────────────────────────────\nfit_logit <- glm(am ~ wt + hp, data=mtcars,\n                  family=binomial(link=\"logit\"))\nsummary(fit_logit)\n# Odds ratios:\nexp(coef(fit_logit))\nexp(confint(fit_logit))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of lm() & glm() — Regression in R — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Predictions:\npredict(fit_logit, type=\"response\")  # probabilities\n# ── Poisson regression (count outcomes) ────────────────\nfit_pois <- glm(count ~ x, family=poisson, data=df)"
                  }
        ],
        tips: [
                  "**Always** run `plot(fit)` (4 diagnostic plots) before trusting a regression — check for non-linearity, heteroscedasticity, and influential outliers",
                  "`summary(fit)` shows R-squared but **adjusted R²** is what you should compare across models",
                  "`broom::tidy(fit)` and `broom::glance(fit)` convert model output to clean tibbles — essential for comparing multiple models",
                  "Check for multicollinearity: `car::vif(fit)` — values >10 indicate problematic collinearity"
        ],
        mistake: "Interpreting logistic regression coefficients as probabilities. They are log-odds. Exponentiate for odds ratios: `exp(coef(fit))`. Or use `predict(fit, type='response')` for probabilities.",
        shorthand: {
          verbose: "fit <- lm(y ~ x, data=df)\ncoefs <- coef(fit)\npredictions <- predict(fit, newdata=df)\nr_squared <- summary(fit)$r.squared",
          concise: "fit <- lm(y ~ x, data=df); summary(fit)",
        },
      },
      {
        id: "r-ts-forecast",
        fn: "ts, xts, zoo & forecast package",
        desc: "Native time series objects and forecasting with auto.arima and prophet.",
        category: "R Time Series",
        subtitle: "ts() for regular series, xts for irregular, forecast for modeling",
        signature: "ts(data, start, frequency)  |  auto.arima()  |  forecast(fit, h=12)",
        descLong: "R has several time series object types: ts (base, regular intervals), zoo (irregular), xts (extensible, index-based). The forecast package provides auto.arima() for automatic ARIMA selection and a clean forecast() workflow. The prophet package handles business time series with holidays and trend changepoints.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ts, xts, zoo & forecast package — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(forecast)\nlibrary(xts)\nlibrary(zoo)\n# ── ts — regular time series ──────────────────────────\nx <- ts(c(112,118,132,129,121,135,148,148,136,119,104,118,\n          115,126,141,135,125,149,170,170,158,133,114,140),\n        start = c(2022, 1),   # start: year, period\n        frequency = 12)       # 12 = monthly\nplot(x)\ndecompose(x) |> plot()           # trend+seasonal+random\nstl(x, s.window=\"periodic\") |> plot()  # STL decomposition\n# ── auto.arima ────────────────────────────────────────\nfit <- auto.arima(x,\n  seasonal = TRUE,          # include seasonal terms\n  stepwise = FALSE,         # exhaustive search (slower, better)\n  approximation = FALSE\n)\nsummary(fit)\n# ARIMA(0,1,1)(0,1,1)[12] — seasonal ARIMA found automatically\n# Diagnose residuals:\ncheckresiduals(fit)  # plots ACF + Ljung-Box test"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ts, xts, zoo & forecast package — common patterns you'll see in production.\n# APPROACH  - Combine ts, xts, zoo & forecast package with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Forecast 24 periods ahead:\nfc <- forecast(fit, h=24)\nplot(fc)\nfc$mean          # point forecasts\nfc$lower         # lower CI bounds (80%, 95%)\nfc$upper         # upper CI bounds\nautoplot(fc) + theme_minimal()  # ggplot2 output\n# ── ETS (Exponential Smoothing) ───────────────────────\nfit_ets <- ets(x)    # auto-selects error/trend/seasonal type\nforecast(fit_ets, h=12) |> autoplot()\n# ── xts — irregular time series ───────────────────────\ndates <- as.Date(c(\"2024-01-15\",\"2024-01-22\",\"2024-02-03\"))\nprices <- xts(c(100, 105, 98), order.by=dates)\nindex(prices)         # dates\ncoredata(prices)      # values\nprices[\"2024-01\"]     # January subset\nprices[\"2024-01/2024-02\"]  # date range\n# Period aggregation:\napply.monthly(prices, mean)  # monthly means\napply.weekly(prices, sum)    # weekly sums"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ts, xts, zoo & forecast package — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── prophet (Facebook/Meta) ───────────────────────────\nlibrary(prophet)\n# prophet requires data frame with 'ds' (date) and 'y' (value):\ndf_prophet <- data.frame(\n  ds = seq.Date(as.Date(\"2022-01-01\"), by=\"month\", length.out=36),\n  y  = as.numeric(x)\n)\nm <- prophet(df_prophet,\n  yearly.seasonality = TRUE,\n  weekly.seasonality = FALSE,\n  changepoint.prior.scale = 0.05  # flexibility of trend\n)\nfuture <- make_future_dataframe(m, periods=12, freq=\"month\")\nforecast_df <- predict(m, future)\nplot(m, forecast_df)\nprophet_plot_components(m, forecast_df)  # trend + seasonality"
                  }
        ],
        tips: [
                  "`auto.arima(stepwise=FALSE, approximation=FALSE)` does exhaustive search — better model, but can be slow for long series",
                  "Always `checkresiduals(fit)` after fitting ARIMA — if Ljung-Box p<0.05, residuals still have autocorrelation → model inadequate",
                  "prophet excels at business time series with holidays, weekly patterns, and multiple seasonalities",
                  "`tsCV()` in forecast package does proper time series cross-validation — evaluates forecast accuracy across multiple origins"
        ],
        mistake: "Using regular k-fold CV on time series data. Future data leaks into training folds — always use time-series-aware CV where training always precedes test in time. Use `tsCV()` or rolling-origin CV.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-tidymodels",
        fn: "tidymodels Framework",
        desc: "Unified ML framework: recipes for preprocessing, parsnip for models, tune for hyperparameters.",
        category: "R Machine Learning",
        subtitle: "rsample + recipes + parsnip + tune + yardstick",
        signature: "recipe() |> step_*() |> workflow() |> tune_grid()",
        descLong: "tidymodels is the tidy universe for machine learning. rsample handles splitting and resampling. recipes defines preprocessing steps. parsnip provides a unified model interface across engines. tune searches hyperparameter grids. yardstick evaluates model performance. workflows bundle recipes and models.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tidymodels Framework — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidymodels)\nlibrary(ggplot2)\ndata(ames, package=\"modeldata\")\n# ── 1. Split data ─────────────────────────────────────\nset.seed(42)\nsplit  <- initial_split(ames, prop=0.8, strata=Sale_Price)\ntrain  <- training(split)\ntest   <- testing(split)\nfolds  <- vfold_cv(train, v=10, strata=Sale_Price)  # CV\n# ── 2. Recipe — preprocessing ─────────────────────────\nrec <- recipe(Sale_Price ~ ., data=train) |>\n  step_log(Sale_Price, base=10) |>           # log-transform target\n  step_impute_median(all_numeric_predictors()) |>  # impute NAs\n  step_novel(all_nominal_predictors()) |>     # handle new factor levels\n  step_dummy(all_nominal_predictors()) |>     # one-hot encode\n  step_zv(all_predictors()) |>               # remove zero-variance\n  step_normalize(all_numeric_predictors())    # standardize\n# ── 3. Model spec — parsnip ───────────────────────────\n# Linear regression:\nlm_spec <- linear_reg() |> set_engine(\"lm\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tidymodels Framework — common patterns you'll see in production.\n# APPROACH  - Combine tidymodels Framework with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Random forest with hyperparameter tuning:\nrf_spec <- rand_forest(\n    mtry  = tune(),     # tune this hyperparameter\n    trees = 500,\n    min_n = tune()\n  ) |>\n  set_engine(\"ranger\", importance=\"impurity\") |>\n  set_mode(\"regression\")\n# ── 4. Workflow ────────────────────────────────────────\nwf <- workflow() |>\n  add_recipe(rec) |>\n  add_model(rf_spec)\n# ── 5. Tune hyperparameters ───────────────────────────\ngrid <- grid_regular(\n  mtry(range=c(5,30)),\n  min_n(range=c(2,20)),\n  levels = 5\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tidymodels Framework — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ntuned <- tune_grid(\n  wf, resamples=folds, grid=grid,\n  metrics = metric_set(rmse, rsq, mae)\n)\nshow_best(tuned, metric=\"rmse\")\nbest_params <- select_best(tuned, metric=\"rmse\")\n# ── 6. Finalize and evaluate on test set ───────────────\nfinal_wf  <- finalize_workflow(wf, best_params)\nfinal_fit <- last_fit(final_wf, split)   # trains on full train, evals on test\ncollect_metrics(final_fit)  # final RMSE, R² on test set\ncollect_predictions(final_fit) |>\n  ggplot(aes(.pred, Sale_Price)) + geom_point(alpha=0.3) +\n  geom_abline(color=\"red\") + coord_obs_pred()"
                  }
        ],
        tips: [
                  "**`last_fit()`** trains on the full training set and evaluates on test — call this ONCE at the very end, never during tuning",
                  "Engine flexibility: `set_engine('glmnet')` for LASSO, `set_engine('xgboost')` for gradient boosting — same parsnip syntax",
                  "`step_corr(threshold=0.9)` removes highly correlated predictors; `step_pca()` for dimensionality reduction — all in the recipe",
                  "`autoplot(tuned)` plots tuning results automatically — great for seeing hyperparameter effects on performance"
        ],
        mistake: "Applying preprocessing (scaling, imputation) to the full dataset before splitting. This causes data leakage — test set statistics influence training. Always define preprocessing in a `recipe()` — it's fit on train data only.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-survival-pkg",
        fn: "survival package in R",
        desc: "Kaplan-Meier curves, log-rank tests, and Cox regression in R.",
        category: "R Survival",
        subtitle: "Surv(), survfit(), survdiff(), coxph() — the complete workflow",
        signature: "Surv(time, event) | survfit(Surv~group) | coxph(Surv~x)",
        descLong: "The survival package is the foundation of time-to-event analysis in R. Surv() creates a survival object encoding time and event status. survfit() computes Kaplan-Meier estimates. survdiff() performs the log-rank test. coxph() fits Cox proportional hazards regression.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of survival package in R — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(survival)\nlibrary(ggplot2)\n# ── Survival object ───────────────────────────────────\n# event: 1=event occurred, 0=censored\nsurv_obj <- Surv(time=lung$time, event=lung$status==2)\n# ── Kaplan-Meier ─────────────────────────────────────\nkm_fit <- survfit(Surv(time, status==2) ~ 1, data=lung)\nsummary(km_fit)       # survival table\nprint(km_fit)         # median survival time with 95% CI\nplot(km_fit,\n  xlab=\"Days\", ylab=\"Survival Probability\",\n  main=\"Kaplan-Meier Survival Curve\",\n  conf.int=TRUE)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of survival package in R — common patterns you'll see in production.\n# APPROACH  - Combine survival package in R with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# By group:\nkm_sex <- survfit(Surv(time, status==2) ~ sex, data=lung)\nplot(km_sex, col=c(\"blue\",\"red\"), lwd=2)\nlegend(\"topright\", c(\"Male\",\"Female\"), col=c(\"blue\",\"red\"), lwd=2)\n# ggplot2 via survminer:\nlibrary(survminer)\nggsurvplot(km_sex, data=lung,\n  pval=TRUE,           # add log-rank p-value\n  conf.int=TRUE,\n  risk.table=TRUE,     # number at risk table\n  palette=c(\"#2E9FDF\",\"#E7B800\"),\n  legend.labs=c(\"Male\",\"Female\"))\n# ── Log-rank test ─────────────────────────────────────\nsurvdiff(Surv(time, status==2) ~ sex, data=lung)\n# Chisq= 10.3  on 1 degrees of freedom, p= 0.001"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of survival package in R — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Cox proportional hazards ──────────────────────────\ncox_fit <- coxph(Surv(time, status==2) ~ age + sex + ph.ecog,\n                  data=lung)\nsummary(cox_fit)\n# Hazard ratios with 95% CI and p-values\n# Hazard ratio for sex:\nexp(coef(cox_fit)[\"sex\"])   # HR < 1 = female better survival\nexp(confint(cox_fit))[\"sex\",]  # 95% CI for HR\n# ── Check proportional hazards assumption ─────────────\ncox.zph(cox_fit)    # p < 0.05 = PH assumption violated\nplot(cox.zph(cox_fit))  # scaled Schoenfeld residuals over time"
                  }
        ],
        tips: [
                  "In the lung dataset, `status==2` means dead, `status==1` means censored — always verify event coding",
                  "`survminer::ggsurvplot()` produces publication-quality KM plots with risk tables — far better than base plot",
                  "The PH assumption check `cox.zph()` is essential — if violated, consider time-varying coefficients or stratification",
                  "Concordance index (C-statistic) from `summary(cox_fit)` measures discrimination — analogous to AUC for survival"
        ],
        mistake: "Forgetting that `survfit()` confidence intervals are on the log-log scale by default. For narrow CIs near 0 or 1, use `conf.type='plain'` or `'logit'` for better-behaved intervals near the boundaries.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-glm-logistic-poisson",
        fn: "glm: Logistic & Poisson Regression",
        desc: "Fit generalized linear models for non-normal outcomes.",
        category: "R Statistics",
        subtitle: "family=binomial for classification, family=poisson for counts",
        signature: "glm(y ~ x, family=binomial)  |  glm(count ~ x, family=poisson)",
        descLong: "glm() extends lm() to non-normal outcomes. family=binomial with link=\"logit\" for binary outcomes. family=poisson with link=\"log\" for counts. Each has its own diagnostics and interpretation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of glm: Logistic & Poisson Regression — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Logistic regression (binary outcome) ────────────────\ndata(titanic, package='titanic')\nfit_logit <- glm(Survived ~ Age + Sex + Class,\n                  data=titanic, family=binomial)\nsummary(fit_logit)\n# Predictions (probability):\npred_probs <- predict(fit_logit, type='response')  # 0-1\nhead(pred_probs)\n# Classification at threshold 0.5:\npred_class <- ifelse(pred_probs > 0.5, 1, 0)\n# Odds ratios:\nexp(coef(fit_logit))\nexp(confint(fit_logit))\n# ── Poisson regression (count outcomes) ─────────────────\ndata(insects, package='MASS')\nfit_pois <- glm(count ~ spray, family=poisson, data=insects)\nsummary(fit_pois)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of glm: Logistic & Poisson Regression — common patterns you'll see in production.\n# APPROACH  - Combine glm: Logistic & Poisson Regression with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Predictions (expected count):\npred_counts <- predict(fit_pois, type='response')\n# Incidence Rate Ratio (IRR = exp(coef)):\nexp(coef(fit_pois))\n# spray B vs A increases counts by factor of 0.58\n# ── Negative Binomial (overdispersed counts) ───────────────\n# Use MASS::glm.nb when variance >> mean\nlibrary(MASS)\nfit_nb <- glm.nb(count ~ spray, data=insects)\nsummary(fit_nb)\n# ── Diagnostics for GLM ────────────────────────────────────\nplot(fit_logit)  # similar to lm but for GLM\n# Residuals (several types):\nresiduals(fit_logit, type='response')    # actual - fitted\nresiduals(fit_logit, type='pearson')     # standardized\nresiduals(fit_logit, type='deviance')    # deviance residuals"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of glm: Logistic & Poisson Regression — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── AIC / BIC model comparison ────────────────────────────\nAIC(fit1, fit2, fit3)\nBIC(fit1, fit2, fit3)\n# Lower = better\n# ── Predictions with CI (logistic) ──────────────────────────\nnew_data <- data.frame(Age=30, Sex='male', Class='1st')\npred <- predict(fit_logit, newdata=new_data,\n                se.fit=TRUE, type='link')\n# Transform back to probability:\nplogis(pred$fit)     # inverse logit\nplogis(pred$fit + 1.96*pred$se.fit)  # upper CI"
                  }
        ],
        tips: [
                  "family=binomial uses logit link by default — other links available (probit, cloglog)",
                  "predict(..., type=\"response\") for predictions on probability scale (0-1)",
                  "predict(..., type=\"link\") for linear predictor scale",
                  "Check for overdispersion in Poisson: if residual deviance >> df, use family=quasipoisson or glm.nb()"
        ],
        mistake: "Interpreting logistic coefficients as probabilities. They are log-odds. Exponentiate for odds ratios: `exp(coef(fit))`.",
        shorthand: {
          verbose: "fit <- lm(y ~ x1 + x2, data=df)\ncoefs <- coef(fit)\nsummary_obj <- summary(fit)\nr2 <- summary_obj$r.squared",
          concise: "fit <- lm(y ~ x1 + x2, data=df); summary(fit)",
        },
      },
      {
        id: "r-mixed-effects-lme4",
        fn: "lme4: Linear Mixed Models",
        desc: "Handle grouped and nested data with random effects.",
        category: "R Statistics",
        subtitle: "lmer for continuous outcomes, glmer for binary/counts",
        signature: "lmer(y ~ x + (1|group))  |  glmer(y ~ x + (1|group), family=binomial)",
        descLong: "Mixed models account for grouping (students within schools, repeated measures on subjects). Random intercept (1|group) allows intercepts to vary by group. Random slope (slope|group) allows slopes to vary.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of lme4: Linear Mixed Models — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(lme4)\n# ── Random intercept only ──────────────────────────────────\n# Students nested within schools\ndata(Exam, package='mlmRev')  # example data\nfm1 <- lmer(math ~ 1 + iq + (1|school), data=Exam)\nsummary(fm1)\n# ── Random slope ───────────────────────────────────────────\nfm2 <- lmer(math ~ iq + (iq|school), data=Exam)\n# iq effect varies by school\n# ── Repeated measures (time within subject) ───────────────\ndata(sleepstudy, package='lme4')\nfm3 <- lmer(Reaction ~ Days + (1+Days|Subject),\n            data=sleepstudy)\nsummary(fm3)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of lme4: Linear Mixed Models — common patterns you'll see in production.\n# APPROACH  - Combine lme4: Linear Mixed Models with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Extract fixed effects (population-level) ──────────────\nfixef(fm3)\n# (Intercept)        Days\n#   251.41          10.47\n# ── Extract random effects (group-level deviations) ──────\nranef(fm3)\n# [[1]]\n# Subject\n#      1  10.197   2.815\n#      2 -40.398   5.833\n#      ...\n# ── Prediction ────────────────────────────────────────────\n# Predict for new data:\npredict(fm3, newdata=data.frame(Days=c(0,1,2), Subject=NA),\n        re.form=NA)  # Population average, no group effects"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of lme4: Linear Mixed Models — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── GLMM: logistic with mixed effects ──────────────────────\n# Binary outcome with random intercept:\nfm_glmm <- glmer(outcome ~ treatment + (1|site),\n                 family=binomial, data=df)\nsummary(fm_glmm)\n# ── Model comparison: ANOVA ────────────────────────────────\nfm_null <- lmer(math ~ 1 + (1|school), data=Exam)\nfm_full <- lmer(math ~ iq + (1|school), data=Exam)\nanova(fm_null, fm_full)  # LRT for nested models\n# ── ICC: Intraclass Correlation ────────────────────────────\n# library(performance)\n# icc(fm1)  # proportion of variance explained by groups"
                  }
        ],
        tips: [
                  "Always include random effects if data is grouped/nested — ignoring clustering inflates Type I",
                  "Start with (1|group), add (slope|group) only if justified by domain or LRT",
                  "REML (default) for variance estimation; ML for model comparison",
                  "Check normality and homogeneity of random effects with ranef(fit)"
        ],
        mistake: "Using OLS regression on clustered data. Within-cluster correlations inflate Type I error rates dramatically.",
        shorthand: {
          verbose: "fit <- lm(y ~ x1 + x2, data=df)\ncoefs <- coef(fit)\nsummary_obj <- summary(fit)\nr2 <- summary_obj$r.squared",
          concise: "fit <- lm(y ~ x1 + x2, data=df); summary(fit)",
        },
      },
      {
        id: "r-caret-tidymodels-comparison",
        fn: "caret vs tidymodels: model comparison",
        desc: "Compare two ML frameworks for preprocessing and tuning.",
        category: "R Machine Learning",
        subtitle: "caret is older; tidymodels is modern. Choose based on workflow",
        signature: "caret: train() | tidymodels: workflow() + tune_grid()",
        descLong: "Both provide training/validation/testing frameworks. caret is simpler for quick models. tidymodels is more modular (recipes, parsnip, tune) and better for complex pipelines. tidymodels is the modern recommendation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of caret vs tidymodels: model comparison — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── CARET (older, still widely used) ───────────────────\nlibrary(caret)\nlibrary(ggplot2)\nset.seed(42)\nsplits <- createDataPartition(mtcars$mpg, p=0.8, list=FALSE)\ntrain_df <- mtcars[splits, ]\ntest_df  <- mtcars[-splits, ]\n# Train with cross-validation:\nctrl <- trainControl(method='cv', number=5)\nfit_caret <- train(\n  mpg ~ wt + hp + cyl,\n  data=train_df,\n  method='lm',  # method specifies the algorithm\n  trControl=ctrl\n)\n# Predict:\npred_caret <- predict(fit_caret, newdata=test_df)\npostResample(pred_caret, test_df$mpg)  # RMSE, R², MAE\n# ── TIDYMODELS (modern, recommended) ──────────────────────\nlibrary(tidymodels)\nlibrary(ggplot2)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of caret vs tidymodels: model comparison — common patterns you'll see in production.\n# APPROACH  - Combine caret vs tidymodels: model comparison with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Split:\nset.seed(42)\nsplits <- initial_split(mtcars, prop=0.8)\ntrain_df <- training(splits)\ntest_df  <- testing(splits)\nfolds <- vfold_cv(train_df, v=5)\n# Recipe (preprocessing):\nrec <- recipe(mpg ~ wt + hp + cyl, data=train_df) %>%\n  step_scale(wt, hp) %>%\n  step_center(wt, hp)\n# Model spec:\nspec <- linear_reg() %>% set_engine('lm')\n# Workflow (recipe + model):\nwf <- workflow() %>%\n  add_recipe(rec) %>%\n  add_model(spec)\n# Fit and evaluate:\nfit_tm <- fit_resamples(wf, resamples=folds)\ncollect_metrics(fit_tm)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of caret vs tidymodels: model comparison — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Final fit on test set:\nfinal_fit <- last_fit(wf, splits)\ncollect_predictions(final_fit) %>%\n  ggplot(aes(.pred, mpg)) +\n  geom_point() +\n  coord_obs_pred()\n# ── Key differences ────────────────────────────────────────\n# caret:\n#   Pros: Simple, all-in-one\n#   Cons: Less modular, recipes clunky\n#\n# tidymodels:\n#   Pros: Modular, recipe language, modern\n#   Cons: More verbose, steeper learning curve"
                  }
        ],
        tips: [
                  "tidymodels is the modern R ML framework — use it for new projects",
                  "caret still works fine for quick models — huge user base",
                  "Both provide standardized interfaces across many algorithms",
                  "Always use proper validation (CV, test set) — avoid train/test leakage"
        ],
        mistake: "Tuning hyperparameters on the test set. Leads to optimistic performance estimates. Always use validation set or nested CV.",
        shorthand: {
          verbose: "library(caret)\nfit <- train(y ~ ., data=train_data,\n  method='rf',\n  trControl=trainControl(method='cv'))",
          concise: "train(y ~ ., data, method='rf', trControl=trainControl(method='cv'))",
        },
      },
    ],
  },
]

export default { meta, sections }
