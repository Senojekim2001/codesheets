export const meta = {
  "id": "ml",
  "label": "Machine Learning in R",
  "icon": "🤖",
  "description": "R machine learning: tidymodels, caret, xgboost, model evaluation, tuning, feature engineering, and MLOps."
}

export const sections = [

  // ── Section 1: tidymodels Framework ─────────────────────────────────────────
  {
    id: "tidymodels",
    title: "tidymodels Framework",
    entries: [
      {
        id: "tidymodels-workflow",
        fn: "tidymodels — Recipes, Models & Workflows",
        desc: "Build ML pipelines with tidymodels: recipes for preprocessing, parsnip for modeling, workflows for composition, and tune for hyperparameter optimization.",
        category: "tidymodels",
        subtitle: "recipe, parsnip, workflow, tune_grid, rsample, yardstick",
        signature: "recipe() |> step_*()  |  set_engine()  |  workflow() |> fit()  |  tune_grid()",
        descLong: "tidymodels is the modern R ML framework (successor to caret). recipe() defines preprocessing steps (normalization, encoding, imputation). parsnip provides a unified model interface (set_engine for different backends). workflow() combines recipe + model into a single pipeline. rsample handles cross-validation splits. tune_grid() searches hyperparameters. yardstick computes metrics. The framework follows tidy principles: pipe-friendly, consistent API, and works with tibbles.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tidymodels — Recipes, Models & Workflows — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidymodels)\nlibrary(xgboost)\n# ── Data split ───────────────────────────────────────\nset.seed(42)\ndata_split <- initial_split(customer_data, prop = 0.8, strata = churn)\ntrain_data <- training(data_split)\ntest_data  <- testing(data_split)\n# ── Recipe (preprocessing pipeline) ─────────────────\nchurn_recipe <- recipe(churn ~ ., data = train_data) |>\n  step_impute_median(all_numeric_predictors()) |>\n  step_impute_mode(all_nominal_predictors()) |>\n  step_normalize(all_numeric_predictors()) |>\n  step_dummy(all_nominal_predictors(), one_hot = TRUE) |>\n  step_zv(all_predictors()) |>             # remove zero-variance\n  step_corr(all_numeric_predictors(), threshold = 0.9)  # remove correlated\n# ── Model specification ──────────────────────────────\nxgb_spec <- boost_tree(\n  trees = tune(),           # hyperparameter to tune\n  tree_depth = tune(),\n  learn_rate = tune(),\n  min_n = tune(),\n) |>\n  set_engine(\"xgboost\") |>\n  set_mode(\"classification\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tidymodels — Recipes, Models & Workflows — common patterns you'll see in production.\n# APPROACH  - Combine tidymodels — Recipes, Models & Workflows with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Workflow (recipe + model) ────────────────────────\nxgb_workflow <- workflow() |>\n  add_recipe(churn_recipe) |>\n  add_model(xgb_spec)\n# ── Cross-validation folds ───────────────────────────\ncv_folds <- vfold_cv(train_data, v = 5, strata = churn)\n# ── Hyperparameter tuning ────────────────────────────\nxgb_grid <- grid_latin_hypercube(\n  trees(range = c(100, 1000)),\n  tree_depth(range = c(3, 10)),\n  learn_rate(range = c(-3, -1)),   # log10 scale\n  min_n(range = c(5, 30)),\n  size = 30                        # 30 random combinations\n)\nxgb_tuned <- tune_grid(\n  xgb_workflow,\n  resamples = cv_folds,\n  grid = xgb_grid,\n  metrics = metric_set(roc_auc, f_meas, accuracy),\n  control = control_grid(save_pred = TRUE)\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tidymodels — Recipes, Models & Workflows — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Best hyperparameters ─────────────────────────────\nshow_best(xgb_tuned, metric = \"roc_auc\", n = 5)\nbest_params <- select_best(xgb_tuned, metric = \"roc_auc\")\n# ── Finalize and evaluate ────────────────────────────\nfinal_workflow <- xgb_workflow |> finalize_workflow(best_params)\nfinal_fit <- last_fit(final_workflow, data_split)\n# Test set metrics\ncollect_metrics(final_fit)\n# roc_auc: 0.891, accuracy: 0.832\n# Confusion matrix\nfinal_fit |>\n  collect_predictions() |>\n  conf_mat(truth = churn, estimate = .pred_class) |>\n  autoplot(type = \"heatmap\")\n# Variable importance\nfinal_fit |>\n  extract_fit_parsnip() |>\n  vip::vip(num_features = 15)"
                  }
        ],
        tips: [
                  "Always strata= on the outcome variable for splits and CV — ensures class proportions are preserved in each fold.",
                  "grid_latin_hypercube() explores the hyperparameter space more efficiently than regular grid search.",
                  "step_zv() and step_corr() should be included in almost every recipe — they remove uninformative and redundant features.",
                  "last_fit() trains on the entire training set and evaluates on test — use it only once for final reporting."
        ],
        mistake: "Preprocessing outside the recipe (e.g., normalizing the full dataset before splitting) — this causes data leakage. All preprocessing must be inside recipe() so it is fit only on training data and applied to test.",
        shorthand: {
          verbose: "# Manual train/test split (verbose)\nset.seed(42)\nidx <- sample(1:nrow(data), size = 0.8 * nrow(data))\ntrain <- data[idx, ]\ntest <- data[-idx, ]\n# Manual scaling, encoding, etc. per fold",
          concise: "# tidymodels approach\ndata_split <- initial_split(data, prop = 0.8)\nrecipe(y ~ .) |>\n  step_normalize(all_numeric()) |>\n  step_dummy(all_nominal()) |>\n  workflow() |>\n  fit(training(data_split))",
        },
      },
      {
        id: "model-comparison",
        fn: "Model Comparison & Evaluation in R",
        desc: "Compare multiple models: workflowsets, resampling comparison, ROC curves, calibration, and statistical significance tests.",
        category: "Evaluation",
        subtitle: "workflow_set, workflowsets, roc_curve, conf_mat, calibration, comparison",
        signature: "workflow_set() |> workflow_map()  |  autoplot()  |  roc_curve()  |  conf_mat()",
        descLong: "tidymodels workflow_set() compares multiple model types on the same resamples. workflow_map() runs all models through cross-validation. autoplot() and rank_results() visualize performance. yardstick provides comprehensive metrics: roc_curve, pr_curve, conf_mat, lift_curve, gain_curve. Calibration plots check if predicted probabilities match actual frequencies. Statistical comparison of resampled metrics helps determine if differences are significant or just noise.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Model Comparison & Evaluation in R — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidymodels)\n# ── Define multiple model specs ──────────────────────\nlr_spec <- logistic_reg(penalty = tune(), mixture = 1) |>\n  set_engine(\"glmnet\")\nrf_spec <- rand_forest(mtry = tune(), trees = 500, min_n = tune()) |>\n  set_engine(\"ranger\") |>\n  set_mode(\"classification\")\nxgb_spec <- boost_tree(trees = tune(), learn_rate = tune()) |>\n  set_engine(\"xgboost\") |>\n  set_mode(\"classification\")\nsvm_spec <- svm_rbf(cost = tune(), rbf_sigma = tune()) |>\n  set_engine(\"kernlab\") |>\n  set_mode(\"classification\")\n# ── Compare with workflow_set ────────────────────────\nmodel_set <- workflow_set(\n  preproc = list(base = churn_recipe),\n  models = list(\n    logistic = lr_spec,\n    random_forest = rf_spec,\n    xgboost = xgb_spec,\n    svm = svm_spec\n  )\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Model Comparison & Evaluation in R — common patterns you'll see in production.\n# APPROACH  - Combine Model Comparison & Evaluation in R with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Tune all models on same CV folds\nresults <- model_set |>\n  workflow_map(\n    resamples = cv_folds,\n    grid = 20,\n    metrics = metric_set(roc_auc, f_meas),\n    verbose = TRUE\n  )\n# ── Rank and visualize ──────────────────────────────\nrank_results(results, rank_metric = \"roc_auc\")\nautoplot(results, metric = \"roc_auc\")\n# ── ROC curves for best model ────────────────────────\nfinal_preds <- final_fit |> collect_predictions()\nfinal_preds |>\n  roc_curve(truth = churn, .pred_Yes) |>\n  autoplot()\n# ── Precision-Recall curve ───────────────────────────\nfinal_preds |>\n  pr_curve(truth = churn, .pred_Yes) |>\n  autoplot()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Model Comparison & Evaluation in R — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Lift and gain curves ─────────────────────────────\nfinal_preds |>\n  lift_curve(truth = churn, .pred_Yes) |>\n  autoplot()\n# ── Feature importance comparison ────────────────────\nlibrary(vip)\nfinal_fit |>\n  extract_fit_parsnip() |>\n  vi() |>\n  slice_max(Importance, n = 20) |>\n  ggplot(aes(x = Importance, y = reorder(Variable, Importance))) +\n  geom_col(fill = \"#2563eb\") +\n  labs(title = \"Top 20 Features\", y = NULL)"
                  }
        ],
        tips: [
                  "workflow_set() + workflow_map() compares models on identical CV folds — the only fair way to compare models.",
                  "Always check calibration: a model predicting 80% should be correct ~80% of the time. Poorly calibrated models mislead.",
                  "Lift curves show how much better your model is than random — useful for communicating value to business stakeholders.",
                  "rank_results() ranks models by any metric — use it to shortlist 2-3 models for detailed investigation."
        ],
        mistake: "Comparing models trained on different data splits — even small split differences cause noise. Use workflow_set() on the same resamples for a fair, apples-to-apples comparison.",
        shorthand: {
          verbose: "# Manual model comparison (verbose, error-prone)\nrf_fit <- fit(rf_spec, y ~ ., train)\nlr_fit <- fit(lr_spec, y ~ ., train)\nrf_preds <- predict(rf_fit, test)\nlr_preds <- predict(lr_fit, test)\n# Different CV folds for each, unfair comparison",
          concise: "# tidymodels comparison on same folds\nworkflow_set(preproc = list(recipe),\n  models = list(rf = rf_spec, lr = lr_spec)) |>\n  workflow_map(resamples = cv_folds)",
        },
      },
      {
        id: "tidymodels-recipe",
        fn: "tidymodels Recipes — Feature Engineering Pipeline",
        desc: "Preprocessing recipes: normalization, encoding, imputation, and feature selection.",
        category: "tidymodels",
        subtitle: "recipe(), step_normalize(), step_dummy(), step_impute_*(), prep(), bake()",
        signature: "recipe(y ~ .) |> step_normalize() |> step_dummy() |> prep() |> bake()",
        descLong: "Recipes define preprocessing pipelines that fit on training data and apply to new data. Each step_*() adds a transformation: normalization (center/scale), encoding (dummy variables, one-hot), imputation (median, mode), feature selection. Recipes prevent data leakage by fitting separately on training data. prep() fits the recipe, bake() applies it.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tidymodels Recipes — Feature Engineering Pipeline — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidymodels)\n# ── Create recipe ───────────────────────────────────────\nrecipe <- recipe(price ~ ., data = housing_train) |>\n  step_rm(id)                                        # remove non-predictive \\\n  step_impute_median(all_numeric_predictors())      # fill NA with median\\\n  step_impute_mode(all_nominal_predictors())        # fill NA with mode\\\n  step_normalize(all_numeric_predictors())          # center and scale\\\n  step_dummy(all_nominal_predictors(), one_hot=TRUE)  # categorical to binary\\\n  step_zv(all_predictors())                         # remove zero-variance\\\n  step_corr(all_numeric_predictors(), threshold=0.9)  # remove correlated features\n# ── Prep (fit on training data) ─────────────────────\nrecipe_prep <- prep(recipe, training = housing_train)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tidymodels Recipes — Feature Engineering Pipeline — common patterns you'll see in production.\n# APPROACH  - Combine tidymodels Recipes — Feature Engineering Pipeline with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Bake (apply to test data) ───────────────────────\ntest_processed <- bake(recipe_prep, housing_test)\ntrain_processed <- juice(recipe_prep)  # shortcut: bake(recipe_prep, housing_train)\n# ── Common steps ────────────────────────────────────\n# step_center()   — subtract mean\n# step_scale()    — divide by sd\n# step_normalize() — center AND scale\n# step_log()      — log transformation\n# step_poly()     — polynomial features\n# step_interact() — interaction terms\n# step_pca()      — principal component analysis\n# step_filter()   — remove rows\n# step_shuffle()  — randomize order\n# step_rename()   — rename columns\n# step_select()   — keep specific columns"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tidymodels Recipes — Feature Engineering Pipeline — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Selectors (which columns to apply step to) ──────\nall_predictors()               # all except outcome\nall_numeric_predictors()       # numeric X only\nall_nominal_predictors()       # categorical X only\nall_outcomes()                 # outcome variable(s)\nhas_type(\"numeric\")            # by type\nmatches(\"pattern\")             # by regex\nstarts_with(\"prefix_\")         # by name pattern"
                  }
        ],
        tips: [
                  "Always include step_zv() and step_corr() — removes uninformative and redundant features",
                  "Fit recipe with prep(recipe, training = data) — ensures no data leakage from test set",
                  "Use selectors (all_numeric_predictors()) instead of hardcoding columns — more robust to data changes",
                  "step_dummy() with one_hot=TRUE creates all levels, better for tree models than default behavior"
        ],
        mistake: "Preprocessing before splitting (normalize full dataset first). This causes data leakage: test set statistics influenced training. Always: split → recipe on training → apply to test.",
        shorthand: {
          verbose: "# Manual preprocessing (error-prone)\ndf_scaled <- scale(df[, nums])\ndf_encoded <- model.matrix(~., df[, cats])\n# But: unfitted on training, doesn't fit recipe in workflow",
          concise: "# Recipe in workflow (correct)\nrecipe(y ~ .) |> step_normalize() |> step_dummy()",
        },
      },
      {
        id: "tidymodels-workflow",
        fn: "tidymodels Workflows — Combine Recipe + Model",
        desc: "Bundle recipe and model into a single pipline for reproducible fitting.",
        category: "tidymodels",
        subtitle: "workflow(), add_recipe(), add_model(), fit(), predict()",
        signature: "workflow() |> add_recipe() |> add_model() |> fit()",
        descLong: "Workflows combine a recipe and model spec into a single object that can be fit and predicted. This ensures recipe is applied consistently — both during fitting and prediction. Workflows are essential for cross-validation and hyperparameter tuning: you tune the workflow, not separate recipe and model.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tidymodels Workflows — Combine Recipe + Model — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidymodels)\n# ── Create model spec ───────────────────────────────────\nmodel_spec <- linear_reg() |>\n  set_engine(\"lm\")\n# ── Create recipe ───────────────────────────────────────\npreproc_recipe <- recipe(price ~ ., data = train_data) |>\n  step_normalize(all_numeric_predictors()) |>\n  step_dummy(all_nominal_predictors())\n# ── Combine into workflow ───────────────────────────────\nwf <- workflow() |>\n  add_recipe(preproc_recipe) |>\n  add_model(model_spec)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tidymodels Workflows — Combine Recipe + Model — common patterns you'll see in production.\n# APPROACH  - Combine tidymodels Workflows — Combine Recipe + Model with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Fit workflow on training data ───────────────────────\nfit_wf <- fit(wf, data = train_data)\n# ── Predict on new data ─────────────────────────────────\npredictions <- predict(fit_wf, test_data)\n# ── Extract model object if needed ──────────────────────\nfitted_model <- extract_fit_parsnip(fit_wf)\nsummary(fitted_model)\n# ── Use in cross-validation ────────────────────────────\ncv_folds <- vfold_cv(train_data, v = 5)\ncv_results <- fit_resamples(wf, cv_folds)\ncollect_metrics(cv_results)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tidymodels Workflows — Combine Recipe + Model — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Workflow with formulas (no recipe needed) ──────────\nsimple_wf <- workflow() |>\n  add_formula(price ~ .) |>    # simpler, no preprocessing\n  add_model(model_spec)"
                  }
        ],
        tips: [
                  "Workflows ensure recipe fitted only on training data — prevents data leakage",
                  "fit(workflow, data) automatically preps recipe and fits model — one call, clean",
                  "Use workflows in cross-validation/tuning — tidymodels handles recipe correctly",
                  "extract_fit_parsnip() gets the underlying model object for detailed inspection"
        ],
        mistake: "Preprocessing data manually, then fitting model outside workflow. Recipe isn't tracked, applying inconsistently. Always: recipe → workflow → fit().",
        shorthand: {
          verbose: "# Manual (inconsistent)\nrecipe <- recipe(y ~ .)\nrecipe_fit <- prep(recipe, train)\ntrain_p <- bake(recipe_fit, train)\ntest_p <- bake(recipe_fit, test)\nmodel_fit <- lm(y ~ ., train_p)\npreds <- predict(model_fit, test_p)",
          concise: "# Workflow (clean)\nworkflow() |>\n  add_recipe(recipe(y ~ .)) |>\n  add_model(linear_reg()) |>\n  fit(train) |>\n  predict(test)",
        },
      },
      {
        id: "tidymodels-resampling",
        fn: "tidymodels Resampling — Cross-Validation & Bootstraps",
        desc: "Create and evaluate models on resamples: vfold_cv, bootstraps, fit_resamples.",
        category: "tidymodels",
        subtitle: "vfold_cv(), bootstraps(), fit_resamples(), collect_metrics()",
        signature: "vfold_cv(data, v=5)  |  bootstraps(data)  |  fit_resamples(wf, resamples)",
        descLong: "Resampling strategies evaluate model stability across different data splits. vfold_cv() creates v-fold cross-validation (default v=5). bootstraps() creates bootstrap samples with replacement. fit_resamples() fits model on each resample fold, collecting metrics for each. Essential for reliable performance estimates.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tidymodels Resampling — Cross-Validation & Bootstraps — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidymodels)\n# ── v-fold cross-validation ─────────────────────────────\ncv_folds <- vfold_cv(data, v = 5)  # 5-fold (default)\ncv_folds <- vfold_cv(data, v = 10)  # 10-fold\ncv_folds <- vfold_cv(data, v = nrow(data))  # LOO (leave-one-out)\n# Stratified on outcome (keeps class proportions):\ncv_folds <- vfold_cv(data, v = 5, strata = outcome_col)\n# ── Bootstrap resampling ────────────────────────────────\nboots <- bootstraps(data, times = 100)  # 100 bootstrap samples\n# Each sample: draw n observations with replacement\n# ── Fit model on all resamples ──────────────────────────\nresults <- fit_resamples(\n  workflow,\n  resamples = cv_folds,\n  metrics = metric_set(rmse, rsq, mae),\n  control = control_resamples(save_pred = TRUE)\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tidymodels Resampling — Cross-Validation & Bootstraps — common patterns you'll see in production.\n# APPROACH  - Combine tidymodels Resampling — Cross-Validation & Bootstraps with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Collect metrics across folds ────────────────────────\nmetrics <- collect_metrics(results)\n# Returns: tibble with mean and std for each metric\n# ── Access fold-level predictions ───────────────────────\nfold_preds <- collect_predictions(results)\n# Predictions for each fold's holdout set\n# ── Custom resampling ───────────────────────────────────\n# Time series split (rolling window):\nrolling_splits <- rolling_origin(\n  data, initial = 100, assess = 20, skip = 10\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tidymodels Resampling — Cross-Validation & Bootstraps — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Group-based split (keep groups together):\ngroup_cv <- group_vfold_cv(data, group = group_col, v = 5)\n# Nested CV (for hyperparameter tuning):\nouter_cv <- vfold_cv(data, v = 5)\ninner_cv <- vfold_cv(data, v = 5)"
                  }
        ],
        tips: [
                  "Always use strata= on classification outcome — ensures class proportions preserved in each fold",
                  "v=5 is standard for CV, v=10 for small datasets (n<100), v=n for tiny datasets",
                  "bootstraps() for parameter uncertainty estimation, vfold_cv() for unbiased model evaluation",
                  "save_pred=TRUE to collect predictions per fold — useful for calibration, ensemble averaging"
        ],
        mistake: "Using stratified CV on regression tasks. strata= is for classification only — use on continuous outcome causes error.",
        shorthand: {
          verbose: "# Manual CV (error-prone)\nfor (i in 1:5) {\n  train_idx <- (1:nrow(df)) %% 5 != i\n  test_idx <- !train_idx\n  fit_model(df[train_idx, ], df[test_idx, ])\n}",
          concise: "# tidymodels (clean)\nvfold_cv(df, v=5) |>\n  fit_resamples(workflow) |>\n  collect_metrics()",
        },
      },
      {
        id: "tidymodels-tune",
        fn: "tidymodels Tuning — Hyperparameter Optimization",
        desc: "Search hyperparameter space: tune(), grid_regular(), tune_grid(), select_best().",
        category: "tidymodels",
        subtitle: "tune(), grid_regular(), tune_grid(), show_best(), select_best()",
        signature: "tune()  |  grid_latin_hypercube()  |  tune_grid(wf, resamples, grid)",
        descLong: "Hyperparameter tuning finds optimal model configuration using cross-validation. Replace fixed hyperparameters with tune(). Define grid with grid_regular() (regular grid), grid_latin_hypercube() (space-filling), or grid_max_entropy() (balanced). tune_grid() evaluates all grid combinations, select_best() picks the winner.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tidymodels Tuning — Hyperparameter Optimization — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(tidymodels)\n# ── Define hyperparameters to tune ──────────────────────\nmodel_spec <- boost_tree(\n  trees = tune(),           # number of trees\n  tree_depth = tune(),      # max depth\n  learn_rate = tune(),      # shrinkage\n  min_n = tune()            # min samples per node\n) |>\n  set_engine(\"xgboost\") |>\n  set_mode(\"classification\")\n# ── Create search grid ──────────────────────────────────\n# Regular grid (Cartesian product):\ngrid <- grid_regular(\n  trees(range = c(100, 1000)),\n  tree_depth(range = c(2, 10)),\n  learn_rate(range = c(-3, -0.5)),  # log scale\n  min_n(range = c(2, 20)),\n  levels = 5  # 5 values per parameter\n)  # Total: 5^4 = 625 combinations"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tidymodels Tuning — Hyperparameter Optimization — common patterns you'll see in production.\n# APPROACH  - Combine tidymodels Tuning — Hyperparameter Optimization with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Latin hypercube (space-filling, more efficient):\ngrid <- grid_latin_hypercube(\n  trees(range = c(100, 1000)),\n  tree_depth(range = c(2, 10)),\n  learn_rate(range = c(-3, -0.5)),\n  min_n(range = c(2, 20)),\n  size = 50  # 50 random combinations\n)\n# ── Tune hyperparameters ───────────────────────────────\nresults <- tune_grid(\n  workflow,\n  resamples = cv_folds,\n  grid = grid,\n  metrics = metric_set(roc_auc, f_meas),\n  control = control_grid(save_pred = TRUE)\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tidymodels Tuning — Hyperparameter Optimization — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Examine results ────────────────────────────────────\nshow_best(results, metric = \"roc_auc\", n = 5)\n# ── Select best hyperparameters ────────────────────────\nbest_params <- select_best(results, metric = \"roc_auc\")\n# ── Finalize workflow ──────────────────────────────────\nfinal_wf <- finalize_workflow(workflow, best_params)\nfinal_fit <- last_fit(final_wf, split = data_split)\ncollect_metrics(final_fit)  # test set performance"
                  }
        ],
        tips: [
                  "grid_latin_hypercube() is more efficient than grid_regular() — explores space better with fewer combinations",
                  "Always use cross-validation in tune_grid() — grid search on just train/test set overfits to test",
                  "show_best() shows top models, select_best() picks the winner — examine top few before finalizing",
                  "last_fit() trains on full training set, evaluates on test — use only once for final reporting"
        ],
        mistake: "Tuning on full dataset or train/test split instead of CV folds. Grid search will overfit to test set. Always use CV in tune_grid().",
        shorthand: {
          verbose: "# Manual grid search (tedious)\nfor (trees in c(100, 500, 1000)) {\n  for (depth in c(2, 5, 10)) {\n    fit <- fit_model(data, trees, depth)\n    metrics <- eval_model(fit, cv_folds)\n    save_results(metrics)\n  }\n}",
          concise: "# tidymodels tuning\ntune_grid(wf,\n  resamples = cv_folds,\n  grid = grid_latin_hypercube(trees(), tree_depth(), ...)\n) |> select_best()",
        },
      },
      {
        id: "xgboost-r",
        fn: "XGBoost in R — Gradient Boosting with xgboost Package",
        desc: "Train XGBoost models directly: xgboost(), xgb.DMatrix, xgb.cv, xgb.importance.",
        category: "ML Models",
        subtitle: "xgboost(), xgb.DMatrix, xgb.cv(), xgb.importance(), cross-validation",
        signature: "xgboost(data, label, nrounds=100)  |  xgb.cv()  |  xgb.importance()",
        descLong: "The xgboost package provides direct access to gradient boosting (faster than parsnip wrapper). xgb.DMatrix is the data format (matrix + labels). xgboost() trains, xgb.cv() does cross-validation. xgb.importance() ranks features. Use parsnip wrapper (via tidymodels) for tidy workflows, use xgboost() package for speed and low-level control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of XGBoost in R — Gradient Boosting with xgboost Package — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(xgboost)\nlibrary(data.table)\n# ── Prepare data ───────────────────────────────────────\nX_train <- data.matrix(training_data[, -\"target\"])\ny_train <- training_data$target\nX_test <- data.matrix(test_data[, -\"target\"])\ny_test <- test_data$target\n# Create xgb.DMatrix (specialized format)\ndtrain <- xgb.DMatrix(X_train, label = y_train)\ndtest <- xgb.DMatrix(X_test, label = y_test)\n# ── Set parameters ─────────────────────────────────────\nparams <- list(\n  booster = \"gbtree\",\n  objective = \"binary:logistic\",  # classification\n  max_depth = 6,\n  eta = 0.1,           # learning rate\n  min_child_weight = 1,\n  subsample = 0.8,     # row sampling\n  colsample_bytree = 0.8  # column sampling\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of XGBoost in R — Gradient Boosting with xgboost Package — common patterns you'll see in production.\n# APPROACH  - Combine XGBoost in R — Gradient Boosting with xgboost Package with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Cross-validation ────────────────────────────────────\nxgb_cv <- xgb.cv(\n  params = params,\n  data = dtrain,\n  nrounds = 100,\n  nfold = 5,\n  metrics = \"error\",\n  early_stopping_rounds = 10,\n  verbose = FALSE\n)\n# Find optimal rounds (stops when no improvement)\nbest_round <- xgb_cv$best_iteration\n# ── Train final model ───────────────────────────────────\nmodel <- xgboost(\n  params = params,\n  data = dtrain,\n  nrounds = best_round,\n  watchlist = list(test = dtest),\n  verbose = FALSE\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of XGBoost in R — Gradient Boosting with xgboost Package — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Predictions ────────────────────────────────────────\npred_probs <- predict(model, dtest)\npred_class <- ifelse(pred_probs > 0.5, 1, 0)\n# ── Feature importance ─────────────────────────────────\nimportance <- xgb.importance(\n  feature_names = colnames(X_train),\n  model = model\n)\nxgb.plot.importance(importance[1:10])  # top 10\n# ── Save/load model ────────────────────────────────────\nxgb.save(model, \"model.xgb\")\nmodel <- xgb.load(\"model.xgb\")"
                  }
        ],
        tips: [
                  "xgb.DMatrix is faster than raw data — use it for large datasets",
                  "early_stopping_rounds = 10 stops training if no improvement in 10 rounds — prevents overfitting",
                  "Try objective=\"reg:squarederror\" for regression, \"binary:logistic\" for classification",
                  "Feature importance via xgb.importance() and xgb.plot.importance()"
        ],
        mistake: "Not using early stopping. XGBoost can overfit — set early_stopping_rounds to stop when validation metric plateaus.",
        shorthand: {
          verbose: "# Verbose: manual param tuning\nfor (depth in c(3, 6, 9)) {\n  for (eta in c(0.01, 0.1, 0.3)) {\n    params <- list(max_depth=depth, eta=eta, ...)\n    fit <- xgboost(params, data, nrounds=100)\n  }\n}",
          concise: "# Quick: xgb with defaults\nxgboost(xgb.DMatrix(X, label=y), nrounds=100,\n  early_stopping_rounds=10)",
        },
      },
      {
        id: "random-forest-r",
        fn: "Random Forest in R — ranger & randomForest Packages",
        desc: "Train random forests: ranger() (fast), randomForest() (classic), variable importance.",
        category: "ML Models",
        subtitle: "ranger::ranger(), randomForest(), variable importance, OOB error",
        signature: "ranger(y ~ ., data)  |  randomForest(y ~ ., data)  |  importance()",
        descLong: "Random forests are fast ensemble models great for mixed data types. ranger() is modern and fast (C++ backend). randomForest() is classic R implementation. Both handle categorical variables natively (no encoding needed). Out-of-bag (OOB) error provides free validation. Variable importance measures feature contribution to predictions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Random Forest in R — ranger & randomForest Packages — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(ranger)\nlibrary(randomForest)\n# ── Train with ranger (faster) ──────────────────────────\nmodel_ranger <- ranger(\n  y ~ .,\n  data = training_data,\n  num.trees = 500,        # number of trees\n  mtry = sqrt(ncol(X)),   # features per split\n  min.node.size = 5,\n  importance = \"impurity\",  # permutation or impurity\n  classification = TRUE,\n  num.threads = 4          # parallel\n)\n# ── Predictions ────────────────────────────────────────\npreds <- predict(model_ranger, test_data)\npred_class <- preds$predictions\n# ── Variable importance ────────────────────────────────\nimportance_vals <- model_ranger$variable.importance\nplot(importance_vals)  # or use vip package"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Random Forest in R — ranger & randomForest Packages — common patterns you'll see in production.\n# APPROACH  - Combine Random Forest in R — ranger & randomForest Packages with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── OOB error (out-of-bag, free validation) ───────────\nmodel_ranger$prediction.error  # OOB classification error\n# ── With randomForest (classic, works well for small data) ──\nmodel_rf <- randomForest(\n  y ~ .,\n  data = training_data,\n  ntree = 500,\n  mtry = sqrt(ncol(X)),\n  importance = TRUE,\n  do.trace = FALSE\n)\n# ── Predictions ────────────────────────────────────────\npreds <- predict(model_rf, test_data, type = \"class\")\npred_probs <- predict(model_rf, test_data, type = \"prob\")\n# ── Variable importance ────────────────────────────────\nimportance(model_rf)       # importance scores\nvarImpPlot(model_rf)       # plot top features"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Random Forest in R — ranger & randomForest Packages — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Tune hyperparameters with tidymodels ──────────────\nlibrary(tidymodels)\nrf_spec <- rand_forest(\n  mtry = tune(),\n  trees = tune(),\n  min_n = tune()\n) |>\n  set_engine(\"ranger\", importance=\"permutation\") |>\n  set_mode(\"classification\")\nwf <- workflow() |> add_model(rf_spec) |> add_recipe(recipe)\nresults <- tune_grid(wf, cv_folds, grid=grid_regular(mtry(), trees(), min_n()))\nbest <- select_best(results)"
                  }
        ],
        tips: [
                  "ranger is faster than randomForest — prefer ranger for large datasets",
                  "mtry = sqrt(num_features) for classification, = num_features/3 for regression (defaults)",
                  "Use OOB error for free cross-validation validation — no need for separate test set",
                  "Variable importance: \"impurity\" (faster) vs \"permutation\" (more reliable)"
        ],
        mistake: "Not tuning mtry and min.node.size. Default ranger settings often suboptimal. Use tidymodels tuning to find best values.",
        shorthand: {
          verbose: "# Manual with all options\nranger(y ~ ., training, num.trees=500, mtry=10,\n  min.node.size=5, importance=\"permutation\")",
          concise: "# Quick default\nranger(y ~ ., training)  # works well for most data",
        },
      },
      {
        id: "caret-basics",
        fn: "caret Package — train(), trainControl(), Cross-Validation",
        desc: "Classic ML package: train() for model fitting, trainControl() for resampling, method selection.",
        category: "ML Models",
        subtitle: "train(), trainControl(), method selection, cross-validation, feature selection",
        signature: "train(y ~ ., data, method=\"rf\", trControl=trainControl())  |  findCorrelation()",
        descLong: "caret (Classification And REgression Training) unifies interface for 200+ models. train() fits with automatic cross-validation and tuning. trainControl() specifies resampling strategy. Useful for quick prototyping, though tidymodels is more modern and flexible.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of caret Package — train(), trainControl(), Cross-Validation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(caret)\nlibrary(dplyr)\n# ── Set up cross-validation ────────────────────────────\nctrl <- trainControl(\n  method = \"cv\",           # cross-validation\n  number = 5,              # 5-fold\n  classProbs = TRUE,       # get probabilities\n  summaryFunction = twoClassSummary,  # for ROC\n  savePredictions = TRUE   # save predictions\n)\n# ── Train model with automatic tuning ──────────────────\nmodel_rf <- train(\n  y ~ .,\n  data = training_data,\n  method = \"rf\",           # random forest\n  trControl = ctrl,\n  tuneLength = 5,          # tune 5 values of mtry\n  metric = \"ROC\"           # optimize for ROC\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of caret Package — train(), trainControl(), Cross-Validation — common patterns you'll see in production.\n# APPROACH  - Combine caret Package — train(), trainControl(), Cross-Validation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nprint(model_rf)            # shows CV results\n# ── Predictions ────────────────────────────────────────\npred_class <- predict(model_rf, test_data)\npred_probs <- predict(model_rf, test_data, type=\"prob\")\n# ── Compare multiple models ───────────────────────────\nmodel_list <- list(\n  rf = train(y ~ ., training, method=\"rf\", trControl=ctrl),\n  glm = train(y ~ ., training, method=\"glm\", trControl=ctrl),\n  svm = train(y ~ ., training, method=\"svmRadial\", trControl=ctrl)\n)\nresamples_obj <- resamples(model_list)\nsummary(resamples_obj)\nggplot(resamples_obj)  # visualize model comparison"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of caret Package — train(), trainControl(), Cross-Validation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Feature selection (variance filter) ─────────────────\nnzv <- nearZeroVar(training_data)  # find near-zero variance\ntraining_filtered <- training_data[, -nzv]\n# Correlation-based feature selection:\nhigh_corr <- findCorrelation(cor(training_data[, nums]), cutoff=0.9)\ntraining_filtered <- training_data[, -high_corr]"
                  }
        ],
        tips: [
                  "trainControl(method=\"cv\", number=5) is standard 5-fold CV",
                  "tuneLength=5 automatically finds 5 tuning values — easier than specifying grid",
                  "resamples() + ggplot() compares multiple models fairly on same folds",
                  "nearZeroVar() and findCorrelation() quick feature filtering (but prefer recipe steps)"
        ],
        mistake: "Using train() without trainControl() — default method might not be what you want. Always specify trainControl explicitly.",
        shorthand: {
          verbose: "# Long form\ntrainControl(method=\"cv\", number=5)\ntrain(y ~ ., data, method=\"rf\", tuneLength=5, trControl=ctrl)",
          concise: "# Quick (works, but less control)\ntrain(y ~ ., data, method=\"rf\")",
        },
      },
      {
        id: "mlr3-basics",
        fn: "mlr3 Framework — Task, Learner, Resampling & Benchmarking",
        desc: "Modern ML framework: Task (data), Learner (model), Resampling, benchmark() for comparison.",
        category: "ML Models",
        subtitle: "mlr3: Task, Learner, Resampling, benchmark(), tuning with AutoTuner",
        signature: "TaskClassif$new()  |  lrn()  |  rsmp()  |  benchmark()",
        descLong: "mlr3 is a modern, extensible ML framework. Task wraps data (TaskClassif/TaskRegr). Learner wraps models (lrn()). Resampling defines CV (rsmp()). benchmark() compares learners on same tasks/resamples. More verbose than tidymodels but very flexible for complex workflows.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of mlr3 Framework — Task, Learner, Resampling & Benchmarking — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(mlr3)\nlibrary(mlr3learners)\n# ── Create classification task ──────────────────────────\ntask <- TaskClassif$new(\n  id = \"churn\",\n  backend = churn_data,\n  target = \"churn\"\n)\ntask$nrow; task$ncol  # dimensions\n# ── Create learners ────────────────────────────────────\nlrn_rf <- lrn(\"classif.ranger\", num.trees=100)\nlrn_glm <- lrn(\"classif.log_reg\")\nlrn_xgb <- lrn(\"classif.xgboost\", nrounds=100)\n# ── Create resampling strategy ──────────────────────────\nresampling <- rsmp(\"cv\", folds=5)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of mlr3 Framework — Task, Learner, Resampling & Benchmarking — common patterns you'll see in production.\n# APPROACH  - Combine mlr3 Framework — Task, Learner, Resampling & Benchmarking with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Train and evaluate single learner ──────────────────\nrr <- resample(task, lrn_rf, resampling)\nrr$score(msr(\"classif.auc\"))  # AUC per fold\n# ── Benchmark: compare multiple learners ──────────────\nbenchmark_design <- benchmark_grid(\n  tasks = task,\n  learners = list(lrn_rf, lrn_glm, lrn_xgb),\n  resamplings = resampling\n)\nbmr <- benchmark(benchmark_design)\nbmr$aggregate(msrs(c(\"classif.auc\", \"classif.acc\")))\n# ── Hyperparameter tuning with mlr3tuning ─────────────\nlibrary(mlr3tuning)\nlibrary(paradox)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of mlr3 Framework — Task, Learner, Resampling & Benchmarking — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlrn_tuned <- AutoTuner$new(\n  learner = lrn(\"classif.ranger\"),\n  resampling = rsmp(\"cv\", folds=3),\n  measure = msr(\"classif.auc\"),\n  search_space = ParamSet$new(list(\n    ParamInt$new(\"mtry\", lower=1, upper=10),\n    ParamInt$new(\"num.trees\", lower=50, upper=500)\n  )),\n  terminator = trm(\"evals\", n_evals=20),\n  tuner = tnr(\"grid_search\", resolution=5)\n)\nrr_tuned <- resample(task, lrn_tuned, resampling)"
                  }
        ],
        tips: [
                  "lrn(\"classif.ranger\") syntax — check mlr3learners for available models",
                  "benchmark() on same task + resampling = fair model comparison",
                  "AutoTuner + rsmp creates nested resampling — outer for eval, inner for tuning",
                  "mlr3 more verbose than tidymodels but better for complex pipelines"
        ],
        mistake: "Using different resampling for each learner in benchmark(). Benchmark requires same splits for fair comparison. Use benchmark_grid().",
        shorthand: {
          verbose: "# Explicit learner list\nlearners <- list(\n  lrn(\"classif.ranger\"),\n  lrn(\"classif.log_reg\"),\n  lrn(\"classif.svm\")\n)",
          concise: "# Direct benchmark\nbenchmark(benchmark_grid(task, learners, resampling))",
        },
      },
      {
        id: "torch-r",
        fn: "torch for R — Deep Learning with PyTorch Backend",
        desc: "Train neural networks: tensors, autograd, nn_linear(), custom training loops.",
        category: "Deep Learning",
        subtitle: "torch package, tensor operations, nn_module(), training loops, GPU support",
        signature: "torch_tensor()  |  nn_linear()  |  optim_adam()  |  nnf_*() loss functions",
        descLong: "torch is R interface to PyTorch. Work with tensors (multidimensional arrays), define models with nn_module(), and write custom training loops. torch::optim_adam() for optimization. Use CUDA for GPU acceleration. More flexibility than keras/tensorflow, but more verbose.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of torch for R — Deep Learning with PyTorch Backend — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(torch)\n# ── Create tensors ─────────────────────────────────────\nx_train <- torch_tensor(X_train, dtype=torch_float())\ny_train <- torch_tensor(y_train, dtype=torch_long())\n# Basic tensor operations:\ntorch_abs(x)         # element-wise\ntorch_sum(x)         # aggregate\ntorch_mm(x, y)       # matrix multiply\n# ── Define neural network model ────────────────────────\nmodel <- nn_module(\n  initialize = function(input_size, hidden_size, output_size) {\n    self$layer1 <- nn_linear(input_size, hidden_size)\n    self$relu <- nn_relu()\n    self$layer2 <- nn_linear(hidden_size, output_size)\n  },\n  forward = function(x) {\n    x |>\n      self$layer1() |>\n      self$relu() |>\n      self$layer2()\n  }\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of torch for R — Deep Learning with PyTorch Backend — common patterns you'll see in production.\n# APPROACH  - Combine torch for R — Deep Learning with PyTorch Backend with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nnet <- model(input_size=20, hidden_size=64, output_size=10)\n# ── Define loss and optimizer ──────────────────────────\nloss_fn <- nn_cross_entropy_loss()\noptim <- optim_adam(net$parameters, lr=0.001)\n# ── Training loop ──────────────────────────────────────\nepochs <- 100\nfor (epoch in 1:epochs) {\n  # Forward pass\n  logits <- net(x_train)\n  loss <- loss_fn(logits, y_train)\n  # Backward pass\n  optim$zero_grad()\n  loss$backward()\n  optim$step()\n  if (epoch %% 10 == 0) {\n    cat(\"Epoch\", epoch, \"Loss:\", loss$item(), \"\\\\n\")\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of torch for R — Deep Learning with PyTorch Backend — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Predictions ────────────────────────────────────────\nnet$eval()  # evaluation mode (disables dropout)\nlogits <- net(torch_tensor(X_test, dtype=torch_float()))\npreds <- torch_argmax(logits, dim=2)$to(device=\"cpu\")$numpy()\n# ── GPU support (if CUDA available) ────────────────────\nif (cuda_is_available()) {\n  net <- net$to(device=\"cuda\")\n  x_train <- x_train$to(device=\"cuda\")\n}"
                  }
        ],
        tips: [
                  "torch is lower-level than keras — more control but more code",
                  "Use GPU if available (cuda_is_available()) — huge speedup for deep models",
                  "net$eval() before predictions — disables dropout, enables batch norm evaluation mode",
                  "autograd (automatic differentiation) handles gradients — just call loss$backward()"
        ],
        mistake: "Forgetting net$eval() before predictions. Training mode (default) has dropout/batch norm randomness. Always net$eval() for inference.",
        shorthand: {
          verbose: "# Full training loop\nfor (epoch in 1:100) {\n  logits <- net(x_train)\n  loss <- loss_fn(logits, y_train)\n  optim$zero_grad()\n  loss$backward()\n  optim$step()\n}",
          concise: "# Model + loss + optimizer + backward loop\nmodel <- nn_linear(input, output)\nloss <- loss$backward(); optim$step()",
        },
      },
      {
        id: "interpretability-r",
        fn: "Model Interpretability — DALEX, iml, vip, SHAP Values",
        desc: "Explain predictions: feature importance (vip), SHAP values, permutation importance, DALEX.",
        category: "ML Explainability",
        subtitle: "DALEX, iml, vip::vip(), SHAP values, partial dependence, ALE plots",
        signature: "vip::vip(model)  |  DALEX::explain()  |  explain_prediction()  |  shap values",
        descLong: "Interpretability explains what a model learned. Variable importance (vip) ranks features. Partial dependence plots show input-output relationships. SHAP values break down predictions per feature. DALEX provides unified interface for model explanation. Essential for trust, debugging, and meeting regulations (GDPR, Fair Lending).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Model Interpretability — DALEX, iml, vip, SHAP Values — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(vip)\nlibrary(DALEX)\nlibrary(shapviz)\n# ── Variable importance with vip ───────────────────────\nlibrary(vip)\nvip_importance <- vi(model, method=\"permutation\", target=y_test)\nplot(vip_importance)  # bar plot of top features\n# Different importance types:\nvi(model, method=\"permutation\")   # change in prediction error\nvi(model, method=\"shap\")           # SHAP-based importance\nvi(model, method=\"pdp\")            # partial dependence\n# ── DALEX explainer object ─────────────────────────────\nexplainer <- explain(\n  model = model,\n  data = X_test,\n  y = y_test,\n  label = \"random forest\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Model Interpretability — DALEX, iml, vip, SHAP Values — common patterns you'll see in production.\n# APPROACH  - Combine Model Interpretability — DALEX, iml, vip, SHAP Values with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Explain single prediction:\nexplanation <- explain_prediction(\n  explainer = explainer,\n  new_observation = X_test[1, ]\n)\n# ── Partial dependence plots (PDP) ──────────────────────\npd_plot <- model_profile(\n  explainer,\n  variables = c(\"age\", \"income\"),\n  type = \"partial\"\n)\nplot(pd_plot)\n# ── SHAP values (SHapley Additive exPlanations) ──────\nlibrary(shapviz)\nshap <- explain(model, X=X_test, exact=TRUE)\nsv <- shapviz(shap, X=X_test)\nsh_dependence(sv, v=\"age\")              # dependence plot\nsh_importance(sv)                       # importance by SHAP\nsh_waterfall(sv, row_id=1)              # prediction breakdown\nsh_force(sv, row_id=1)                  # force plot"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Model Interpretability — DALEX, iml, vip, SHAP Values — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Accumulated Local Effects (ALE) ────────────────────\nale_plot <- model_profile(\n  explainer,\n  variables = \"age\",\n  type = \"accumulated\"\n)\nplot(ale_plot)\n# ── Counterfactual explanations ────────────────────────\nlibrary(counterfactuals)\ncf <- explain_counterfactual(\n  explainer = explainer,\n  new_observation = X_test[1, ],\n  total_loss = 0.1\n)\n# Shows: what would change to flip prediction?"
                  }
        ],
        tips: [
                  "vip + SHAP complementary: vip shows global importance, SHAP shows per-sample contribution",
                  "SHAP values expensive for large data — consider sampling or model-specific approximations",
                  "PDP good for continuous features, ALE avoids extrapolation issues of PDP",
                  "DALEX unified interface works with any model — lm, rf, xgboost, neural nets, ..."
        ],
        mistake: "Using only global feature importance without examining individual predictions. Model might be unfair (good average, bad on subgroups). Always inspect individual predictions with SHAP.",
        shorthand: {
          verbose: "# Manual importance extraction\nimp <- importance(model)\nplot(sort(imp, decreasing=TRUE)[1:10])",
          concise: "# Quick importance\nvip::vip(model)\nDALEX::explain(model, X_test, y_test) |> vip()",
        },
      },
    ],
  },
]

export default { meta, sections }
