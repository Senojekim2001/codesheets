export const meta = {
  "id": "ml",
  "label": "Machine Learning",
  "icon": "🤖",
  "description": "scikit-learn ML pipeline — preprocessing, models, evaluation, tuning."
}

export const sections = [

  // ── Section 1: Data Preprocessing ─────────────────────────────────────────
  {
    id: "preprocessing",
    title: "Data Preprocessing",
    entries: [
      {
        id: "train_test_split",
        fn: "train_test_split",
        desc: "Split data into train and test sets.",
        category: "Data Splitting",
        subtitle: "Essential train/test partitioning",
        signature: "train_test_split(X, y, test_size=0.2, random_state=42)",
        descLong: "Divides dataset into training and testing subsets to evaluate model performance on unseen data, preventing overfitting assessment.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of train_test_split — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             reproducibility.\n#             reproducibility as the default habit.\n#             splits, or time-aware splits.\n#\nfrom sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of train_test_split — common patterns you'll see in production.\n# APPROACH  - Combine train_test_split with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             imbalanced classification, multiple-array\n#             support, train/val/test three-way split via\n#             two calls.\n#             prevents a class disappearing from the test\n#             set on small/imbalanced data.\n#             chronological splits — senior tier.\n#\nfrom sklearn.model_selection import train_test_split\n# Stratify on y to preserve class balance\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y)\n# Three-way split: 60/20/20 via two calls\nX_temp, X_test, y_temp, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y)\nX_train, X_val, y_train, y_val = train_test_split(\n    X_temp, y_temp, test_size=0.25, random_state=42, stratify=y_temp)\n# 0.25 of 80% = 20% of total -> 60/20/20"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of train_test_split — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             GroupShuffleSplit (no leakage when one\n#             entity has multiple rows); time-aware via\n#             chronological cut, never random; stratify\n#             for imbalanced ML, group for repeated-\n#             measures, time for forecasts.\n#             cause of \"great validation, terrible\n#             production\" is using random splits on\n#             grouped or time-series data.\n#             time splits give up the i.i.d. assumption\n#             (and that's correct, but be deliberate).\n#\nimport pandas as pd\nfrom sklearn.model_selection import (\n    train_test_split, GroupShuffleSplit, TimeSeriesSplit)\n# 1. Group-aware — keep all rows for a customer on the same side\ngss = GroupShuffleSplit(test_size=0.2, n_splits=1, random_state=42)\ntrain_idx, test_idx = next(gss.split(X, y, groups=df[\"customer_id\"]))\nX_train, X_test = X[train_idx], X[test_idx]\n# 2. Time-aware — train on past, test on future\ndf = df.sort_values(\"date\")\ncutoff = df[\"date\"].quantile(0.8)\ntrain = df[df[\"date\"] <= cutoff]\ntest  = df[df[\"date\"]  > cutoff]\n# 3. Cross-validation for time series\ntscv = TimeSeriesSplit(n_splits=5)\nfor fold, (tr_idx, va_idx) in enumerate(tscv.split(X)):\n    X_tr, X_va = X[tr_idx], X[va_idx]   # validation always after train\n# Decision rule:\n#   i.i.d. classification              -> train_test_split(stratify=y)\n#   one entity has many rows           -> GroupShuffleSplit\n#   time series / forecasting          -> chronological cut OR TimeSeriesSplit\n#   never                              -> random split on time-series data\n#\n# Anti-pattern: random-splitting time-series or grouped data\n#   People reach for train_test_split by reflex, then are baffled when\n#   \"97% accuracy\" collapses in production. Random splits leak the future\n#   into training (time series) or leak per-user behavior across the\n#   train/test boundary (grouped data). Use TimeSeriesSplit / GroupKFold."
                  }
        ],
        tips: [
                  "Use test_size=0.2 for typical 80/20 split",
                  "Always set random_state for reproducible splits",
                  "For imbalanced data, use stratify=y to preserve class distribution",
                  "When one entity (user/session) has many rows, use `GroupShuffleSplit` so the same group cannot appear in both train and test",
                  "Time-series data should be cut chronologically (or use `TimeSeriesSplit`) — random splits leak the future"
        ],
        mistake: "Forgetting to set random_state, causing non-reproducible results across runs.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "standard_scaler",
        fn: "StandardScaler",
        desc: "Standardize features to zero mean, unit variance.",
        category: "Feature Scaling",
        subtitle: "Normalization via z-score",
        signature: "StandardScaler().fit(X_train).transform(X_train)",
        descLong: "Rescales features to have mean 0 and standard deviation 1, essential for distance-based algorithms like KNN and SVM.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of StandardScaler — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             train std. fit ONCE on train, transform\n#             train and test separately.\n#             leakage rule.\n#             integration into a Pipeline.\n#\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nscaler.fit(X_train)                       # fit ONLY on train\nX_train_s = scaler.transform(X_train)\nX_test_s  = scaler.transform(X_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of StandardScaler — common patterns you'll see in production.\n# APPROACH  - Combine StandardScaler with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             on train, transform on test (one-line each),\n#             integrate into a Pipeline so leakage can't\n#             happen.\n#             important habit — it makes the scaler\n#             refit per CV fold automatically.\n#             heavy data or with_mean=False for sparse —\n#             senior tier.\n#\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n# Standalone — be careful never to fit on the full dataset\nscaler = StandardScaler()\nX_train_s = scaler.fit_transform(X_train)\nX_test_s  = scaler.transform(X_test)\n# Pipeline — leakage-proof; refits per CV fold\npipe = Pipeline([\n    (\"scaler\", StandardScaler()),\n    (\"model\",  LogisticRegression()),\n])\npipe.fit(X_train, y_train)\npipe.score(X_test, y_test)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of StandardScaler — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             for the data — StandardScaler for normal-\n#             ish features, RobustScaler when outliers\n#             dominate, MaxAbsScaler for sparse/sign-\n#             preserving, MinMaxScaler when the model\n#             needs bounded inputs (some neural nets).\n#             outlier-driven failures; pipeline + CV\n#             keeps the no-leakage rule enforced.\n#             (sometimes you WANT them); MaxAbsScaler\n#             only suits non-negative or sparse data.\n#\nimport numpy as np\nfrom sklearn.preprocessing import (\n    StandardScaler, RobustScaler, MaxAbsScaler, MinMaxScaler)\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\n# 1. Picking the scaler per data shape\n# Normal-ish numeric features         -> StandardScaler (z-score)\n# Outliers dominate                   -> RobustScaler (uses median/IQR)\n# Sparse / non-negative                -> MaxAbsScaler (preserves sparsity)\n# Bounded inputs needed (some NNs)    -> MinMaxScaler\n# 2. Pipeline + CV — refits scaler per fold (no leakage)\npipe = Pipeline([\n    (\"scaler\", RobustScaler()),                # outlier-resistant\n    (\"clf\",    LogisticRegression(max_iter=1000)),\n])\nscores = cross_val_score(pipe, X, y, cv=5, scoring=\"accuracy\")\nprint(f\"{scores.mean():.3f} +/- {scores.std():.3f}\")\n# 3. Anti-pattern — the most common bug\n# scaler = StandardScaler()\n# X_scaled = scaler.fit_transform(X)            # fit on FULL data\n# X_train, X_test = train_test_split(X_scaled)  # leakage from test stats\n# Right: always fit on train (or use a Pipeline).\n#\n# Decision rule:\n#   normal-ish numeric features        -> StandardScaler\n#   heavy outliers / non-Gaussian      -> RobustScaler (median + IQR)\n#   sparse matrices (TF-IDF, one-hot)  -> MaxAbsScaler (preserves sparsity)\n#   bounded inputs needed (some NNs)   -> MinMaxScaler([0,1])\n#   tree-based models (RF, XGBoost)    -> skip scaling entirely; not needed\n#   inside CV / grid search            -> always wrap in Pipeline\n#\n# Anti-pattern: fit_transform on the full X before splitting\n#   Calling scaler.fit_transform(X) before train_test_split leaks test-set\n#   means/stds into the model — validation scores look great, production\n#   regresses. The fix is non-negotiable: fit on X_train only, transform\n#   X_test, or put the scaler in a Pipeline so CV refits per fold."
                  }
        ],
        tips: [
                  "Always fit scaler on training data only, then transform test data",
                  "Use fit_transform() on train, transform() on test separately",
                  "Essential for algorithms with distance metrics (KNN, SVM, KMeans)"
        ],
        mistake: "Fitting the scaler on the entire dataset before splitting, causing data leakage.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "minmax_scaler",
        fn: "MinMaxScaler",
        desc: "Scale features to a fixed range [0, 1].",
        category: "Feature Scaling",
        subtitle: "Bounds scaling to [0, 1]",
        signature: "MinMaxScaler(feature_range=(0, 1)).fit_transform(X)",
        descLong: "Rescales features to a fixed interval, commonly [0, 1], preserving the shape of the original distribution and outlier presence.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of MinMaxScaler — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             becomes 0, max becomes 1.\n#             squashes everything else.\n#\nfrom sklearn.preprocessing import MinMaxScaler\nscaler = MinMaxScaler()\nX_train_s = scaler.fit_transform(X_train)\nX_test_s  = scaler.transform(X_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of MinMaxScaler — common patterns you'll see in production.\n# APPROACH  - Combine MinMaxScaler with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             = (0, 1) default, ( -1, 1) for some\n#             models, integrate into a Pipeline.\n#             is the standard leakage-proof pattern.\n#             \"test data outside train range\" gotcha\n#             — senior tier.\n#\nfrom sklearn.preprocessing import MinMaxScaler\nfrom sklearn.pipeline import Pipeline\n# Common ranges\nMinMaxScaler(feature_range=(0, 1))         # default — for many neural nets\nMinMaxScaler(feature_range=(-1, 1))        # tanh-friendly\n# Pipeline integration\npipe = Pipeline([\n    (\"scaler\", MinMaxScaler()),\n    (\"model\",  some_estimator),\n])\npipe.fit(X_train, y_train)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of MinMaxScaler — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             scaling (one extreme value crushes the\n#             rest); test data outside the train range\n#             produces values outside [0, 1] (allow it\n#             with clip=False, the default, OR force\n#             with clip=True in newer sklearn).\n#             usable on real data; clip=True caps\n#             out-of-range test values.\n#             choice; clip=True hides distribution shift.\n#\nimport numpy as np\nfrom sklearn.preprocessing import MinMaxScaler\n# 1. Clip outliers BEFORE scaling\nlo, hi = np.percentile(X_train, [1, 99], axis=0)\nX_train_clip = np.clip(X_train, lo, hi)\nX_test_clip  = np.clip(X_test,  lo, hi)         # use TRAIN bounds\nscaler = MinMaxScaler()\nX_train_s = scaler.fit_transform(X_train_clip)\nX_test_s  = scaler.transform(X_test_clip)\n# 2. Force test data into [0, 1] (sklearn 1.2+)\nscaler = MinMaxScaler(clip=True)\nX_train_s = scaler.fit_transform(X_train)\nX_test_s  = scaler.transform(X_test)            # capped at train range\n# Decision rule:\n#   normal-ish features                    -> StandardScaler\n#   outliers dominate                      -> RobustScaler\n#   bounded input required, no outliers    -> MinMaxScaler\n#   bounded input required, with outliers  -> clip then MinMax, OR clip=True\n#   sparse / sign-preserving               -> MaxAbsScaler\n#\n# Anti-pattern: scaling a column where one outlier dominates the range\n#   With one row at 10^6 and the rest under 100, MinMax squeezes 99% of\n#   data into [0, 0.0001] — the model effectively sees a constant feature.\n#   The fix is to clip percentiles (1/99) on TRAIN, then scale; or switch\n#   to RobustScaler. Never compute clip bounds from the full X (leakage)."
                  }
        ],
        tips: [
                  "Use MinMaxScaler when features need bounded ranges (e.g., neural networks)",
                  "Sensitive to outliers; consider clipping extreme values first",
                  "Preserves the original distribution shape better than StandardScaler",
                  "When outliers dominate the column, switch to `RobustScaler` (median / IQR); for sparse / sign-preserving data use `MaxAbsScaler`"
        ],
        mistake: "Using MinMaxScaler on data with extreme outliers without handling them first.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "label_encoder",
        fn: "LabelEncoder",
        desc: "Encode categorical labels as integers.",
        category: "Encoding",
        subtitle: "Convert labels 0, 1, 2...",
        signature: "LabelEncoder().fit(y).transform(y)",
        descLong: "Transforms categorical target variables into numeric labels (0, 1, 2...), useful for classification algorithms that require numeric inputs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of LabelEncoder — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             (alphabetical by default). For TARGETS\n#             only — never features.\n#             \"for features, use OneHotEncoder/\n#             OrdinalEncoder\" rule.\n#\nfrom sklearn.preprocessing import LabelEncoder\nle = LabelEncoder()\ny_train_enc = le.fit_transform(y_train)\ny_test_enc  = le.transform(y_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of LabelEncoder — common patterns you'll see in production.\n# APPROACH  - Combine LabelEncoder with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             classes_ attribute tells you the int->label\n#             mapping; inverse_transform converts model\n#             predictions back to original labels.\n#             readable output; classes_ documents the\n#             encoding.\n#             the \"use OneHotEncoder for features\" rule\n#             — senior.\n#\nfrom sklearn.preprocessing import LabelEncoder\nle = LabelEncoder()\ny_train_enc = le.fit_transform(y_train)\n# Mapping: int -> string label\nle.classes_                              # array(['bird', 'cat', 'dog'])\n# Convert predictions back to strings\ny_pred_int  = clf.predict(X_test)\ny_pred_str  = le.inverse_transform(y_pred_int)\n# Apply same encoding to test labels (must use TRANSFORM not fit_transform)\ny_test_enc = le.transform(y_test)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of LabelEncoder — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             TARGETS only; for features use\n#             OneHotEncoder (nominal) or OrdinalEncoder\n#             (ordinal). Handle unseen test labels\n#             explicitly (LabelEncoder errors; the\n#             feature encoders accept handle_unknown).\n#             single most important rule; explicit\n#             handle_unknown prevents the production\n#             \"ValueError: y contains previously unseen\n#             labels\" failure.\n#             high-cardinality features; OrdinalEncoder\n#             imposes an order even on nominal data.\n#\nimport numpy as np\nfrom sklearn.preprocessing import (\n    LabelEncoder, OneHotEncoder, OrdinalEncoder)\n# 1. TARGET — LabelEncoder is fine\ny_le = LabelEncoder().fit_transform(y_train)\n# 2. FEATURES — never LabelEncoder. Pick by semantics:\n#    Nominal (no order): OneHotEncoder\nohe = OneHotEncoder(handle_unknown=\"ignore\",      # silently zero unseen\n                     sparse_output=False)\nX_cat_enc = ohe.fit_transform(X_train_cat)\n#    Ordinal (has order): OrdinalEncoder\noe = OrdinalEncoder(\n    categories=[[\"S\", \"M\", \"L\", \"XL\"]],            # explicit order\n    handle_unknown=\"use_encoded_value\",\n    unknown_value=-1,\n)\nX_size_enc = oe.fit_transform(X_train_size)\n# 3. Anti-pattern: LabelEncoder on features\n#    LabelEncoder().fit_transform(X[:, 0])\n#    -> imposes alphabetical order; tree models then split\n#       at meaningless thresholds. Use OrdinalEncoder\n#       (with explicit categories=) or OneHotEncoder.\n#\n# Decision rule:\n#   classification target (y)             -> LabelEncoder\n#   nominal feature, low cardinality      -> OneHotEncoder(handle_unknown=\"ignore\")\n#   ordinal feature with known order      -> OrdinalEncoder(categories=[...])\n#   high-cardinality nominal (1000+)      -> TargetEncoder / hashing / embeddings\n#   unseen labels possible at predict     -> handle_unknown=\"ignore\" or \"use_encoded_value\"\n#   tree-based model + nominal            -> OrdinalEncoder is OK (trees handle splits)\n#\n# Anti-pattern: using LabelEncoder on input features\n#   LabelEncoder is documented as target-only and has no handle_unknown\n#   argument. Applied to a feature column it imposes alphabetical order\n#   and crashes at predict time on any unseen value. Use OneHotEncoder\n#   (nominal) or OrdinalEncoder with explicit categories= (ordinal)."
                  }
        ],
        tips: [
                  "Fit only on training labels, transform train and test separately",
                  "Use inverse_transform() to convert predictions back to original labels",
                  "For ordinal relationships, consider OrdinalEncoder instead"
        ],
        mistake: "Using LabelEncoder on multiple features; use OneHotEncoder or ColumnTransformer instead.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "onehot_encoder",
        fn: "OneHotEncoder",
        desc: "Encode categorical features as binary vectors.",
        category: "Preprocessing",
        subtitle: "Multi-class binary encoding",
        signature: "OneHotEncoder(sparse_output=False).fit_transform(X)",
        descLong: "Converts categorical features into one-hot encoded binary vectors, creating binary columns for each category level to represent nominal features.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of OneHotEncoder — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             output=False returns a dense array.\n#             linear models / SVMs / neural nets.\n#             categories or drop= for collinearity.\n#\nfrom sklearn.preprocessing import OneHotEncoder\nohe = OneHotEncoder(sparse_output=False)\nX_cat_enc = ohe.fit_transform(X_train_cat)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of OneHotEncoder — common patterns you'll see in production.\n# APPROACH  - Combine OneHotEncoder with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             \"ignore\" for unseen test categories,\n#             get_feature_names_out for column tracking,\n#             drop=\"first\" or \"if_binary\" for linear\n#             models that don't tolerate collinearity.\n#             prevent inference-time errors.\n#             alternatives or ColumnTransformer\n#             integration — senior.\n#\nfrom sklearn.preprocessing import OneHotEncoder\n# Production-friendly defaults\nohe = OneHotEncoder(\n    sparse_output=False,\n    handle_unknown=\"ignore\",         # unseen -> all-zero row (no error)\n    drop=\"if_binary\",                # collapse 2-level cats into 1 col\n)\nX_cat_enc = ohe.fit_transform(X_train_cat)\nohe.get_feature_names_out()          # ['city_NYC', 'city_LA', 'sex_M']\n# Inference — same encoder, transform only\nX_test_enc = ohe.transform(X_test_cat)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of OneHotEncoder — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             through ColumnTransformer alongside numeric\n#             scaling; for very high cardinality (>~50\n#             unique), switch to TargetEncoder or hashing\n#             — OHE explodes the column count.\n#             way to apply OHE to a subset of columns;\n#             explicit cardinality decision rule prevents\n#             the \"10000-column OHE\" failure.\n#             TargetEncoder leaks target info if not\n#             cross-validated (use within a Pipeline).\n#\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\nnum_cols = [\"age\", \"income\"]\ncat_cols = [\"city\", \"sex\"]\npre = ColumnTransformer([\n    (\"num\", StandardScaler(),                           num_cols),\n    (\"cat\", OneHotEncoder(handle_unknown=\"ignore\"),     cat_cols),\n])\npipe = Pipeline([\n    (\"pre\", pre),\n    (\"clf\", LogisticRegression(max_iter=1000)),\n])\npipe.fit(X_train, y_train)\n# High-cardinality alternative\n# from sklearn.preprocessing import TargetEncoder       # sklearn 1.3+\n# ColumnTransformer([(\"cat\", TargetEncoder(), cat_cols)])\n# Decision rule:\n#   <= 50 unique categories      -> OneHotEncoder\n#   ordinal categories           -> OrdinalEncoder\n#   > 50 unique, low signal      -> drop or hash\n#   > 50 unique, high signal     -> TargetEncoder (CV-safe)\n#\n# Anti-pattern: pd.get_dummies on train and test separately\n#   Calling pd.get_dummies(X_train) and pd.get_dummies(X_test) yields\n#   different column sets when test has missing categories — silent\n#   shape mismatches at inference. Use OneHotEncoder (fit on train,\n#   transform on test) so the column set is fixed and unseen categories\n#   are handled by handle_unknown=\"ignore\"."
                  }
        ],
        tips: [
                  "Set sparse_output=False for dense arrays, True for sparse matrices (memory-efficient)",
                  "Use get_feature_names_out() to track feature names after encoding",
                  "Automatically handles unseen categories with handle_unknown parameter",
                  "Above ~50 unique categories with real signal, OneHot blows up dimensionality — switch to `TargetEncoder` (CV-safe) or hash; drop the column if signal is low"
        ],
        mistake: "Using OneHotEncoder on ordinal features where order matters; use OrdinalEncoder instead.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "simple_imputer",
        fn: "SimpleImputer",
        desc: "Impute missing values with strategy.",
        category: "Missing Values",
        subtitle: "Fill NaN with mean, median, mode",
        signature: "SimpleImputer(strategy='mean').fit_transform(X)",
        descLong: "Handles missing values by replacing them with mean, median, most frequent value, or constant, enabling models to accept incomplete datasets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of SimpleImputer — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             train ONLY.\n#             gaps with the average\".\n#             biases models trained on the result.\n#\nfrom sklearn.impute import SimpleImputer\nimp = SimpleImputer(strategy=\"mean\")\nX_train_imp = imp.fit_transform(X_train)\nX_test_imp  = imp.transform(X_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of SimpleImputer — common patterns you'll see in production.\n# APPROACH  - Combine SimpleImputer with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             skewed numeric, most_frequent for\n#             categorical, constant for sentinel values,\n#             missing-flag features as a separate column.\n#             missing-flags often add predictive signal\n#             beyond the imputed value itself.\n#             or Pipeline integration — senior tier.\n#\nfrom sklearn.impute import SimpleImputer\n# Pick strategy by data type and skewness\nimp_num = SimpleImputer(strategy=\"median\")           # skewed numeric\nimp_cat = SimpleImputer(strategy=\"most_frequent\")    # categorical\nimp_const = SimpleImputer(strategy=\"constant\",\n                            fill_value=\"MISSING\")     # sentinel\n# Track WHERE imputation happened — useful as ML features\nimp = SimpleImputer(strategy=\"median\", add_indicator=True)\nX_train_imp = imp.fit_transform(X_train)\n# Original cols + binary indicator cols for \"was missing\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of SimpleImputer — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             through ColumnTransformer; KNNImputer for\n#             non-MCAR (missing-not-at-random) data;\n#             IterativeImputer when missingness has\n#             feature-feature dependencies; ALWAYS\n#             inside a Pipeline so train statistics\n#             never leak into test.\n#             different strategies per column type;\n#             KNNImputer/IterativeImputer respect\n#             feature correlations.\n#             IterativeImputer is iterative and stochastic\n#             (set random_state); both are sensitive to\n#             hyperparameters.\n#\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.impute import (\n    SimpleImputer, KNNImputer, IterativeImputer)\nfrom sklearn.experimental import enable_iterative_imputer  # noqa\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\nnum_cols = [\"age\", \"income\"]\ncat_cols = [\"city\"]\npre = ColumnTransformer([\n    (\"num\", Pipeline([\n        (\"imp\",   SimpleImputer(strategy=\"median\",\n                                  add_indicator=True)),\n        (\"scale\", StandardScaler()),\n    ]), num_cols),\n    (\"cat\", Pipeline([\n        (\"imp\", SimpleImputer(strategy=\"most_frequent\")),\n        (\"ohe\", OneHotEncoder(handle_unknown=\"ignore\")),\n    ]), cat_cols),\n])\n# When mean/median isn't enough — KNN respects feature similarity\n# pre = ColumnTransformer([(\"num\", KNNImputer(n_neighbors=5), num_cols)])\n# Decision rule:\n#   small N, simple                 -> SimpleImputer(median/mode)\n#   skewed numeric                  -> SimpleImputer(strategy=\"median\")\n#   categorical                     -> SimpleImputer(strategy=\"most_frequent\")\n#   feature correlations matter     -> KNNImputer(n_neighbors=5)\n#   complex MAR patterns            -> IterativeImputer\n#   want \"was missing\" as a feature -> add_indicator=True\n#\n# Anti-pattern: imputing the whole DataFrame before train_test_split\n#   df.fillna(df.mean()) computes the mean over the test rows too — the\n#   classic silent leak. Same for SimpleImputer().fit_transform(X) before\n#   splitting. Always fit on train only (or wrap inside a Pipeline so CV\n#   refits per fold). Also: never use mean on skewed data — use median."
                  }
        ],
        tips: [
                  "Use strategy=\"mean\" for numeric, \"median\" for robust handling, \"most_frequent\" for categorical",
                  "Fit on training data only, transform train and test separately",
                  "Consider using KNNImputer or IterativeImputer for sophisticated imputation",
                  "Pass `add_indicator=True` when \"was this value missing?\" itself carries signal — the imputer adds boolean columns alongside the filled values"
        ],
        mistake: "Imputing before splitting data, causing information leakage from test set.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "column_transformer",
        fn: "ColumnTransformer",
        desc: "Apply different transformations to different columns.",
        category: "Feature Engineering",
        subtitle: "Selective column preprocessing",
        signature: "ColumnTransformer(transformers=[('numeric', scaler, num_cols), ('categorical', encoder, cat_cols)])",
        descLong: "Applies different preprocessing pipelines to different column subsets, enabling simultaneous scaling of numeric and encoding of categorical features.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ColumnTransformer — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             column subsets in one call.\n#             encode categoricals\" without two passes.\n#             selectors, or Pipeline integration.\n#\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nct = ColumnTransformer([\n    (\"num\", StandardScaler(),  [\"age\", \"income\"]),\n    (\"cat\", OneHotEncoder(),   [\"city\"]),\n])\nX_train_t = ct.fit_transform(X_train)\nX_test_t  = ct.transform(X_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ColumnTransformer — common patterns you'll see in production.\n# APPROACH  - Combine ColumnTransformer with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             control unlisted columns, column selectors\n#             via make_column_selector, integrate into\n#             a Pipeline with a model.\n#             cleanest \"all numerics\" / \"all\n#             categoricals\" pattern; remainder= avoids\n#             surprise drops.\n#             for downstream column tracking — senior.\n#\nfrom sklearn.compose import (\n    ColumnTransformer, make_column_selector as selector)\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n# Auto-select by dtype\nct = ColumnTransformer([\n    (\"num\", StandardScaler(),                       selector(dtype_include=\"number\")),\n    (\"cat\", OneHotEncoder(handle_unknown=\"ignore\"), selector(dtype_include=\"object\")),\n], remainder=\"drop\")                                    # explicit drop policy\n# Full pipeline\npipe = Pipeline([\n    (\"pre\", ct),\n    (\"clf\", LogisticRegression(max_iter=1000)),\n])\npipe.fit(X_train, y_train)\npipe.score(X_test, y_test)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ColumnTransformer — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             nested Pipeline (impute -> encode), use\n#             remainder=\"passthrough\" for engineered\n#             features that should bypass preprocessing,\n#             call get_feature_names_out for downstream\n#             interpretability (SHAP, feature importance).\n#             + encoding cleanly per column type;\n#             passthrough preserves features that are\n#             already model-ready; named output columns\n#             unlock interpretability tooling.\n#             get_feature_names_out only works when every\n#             estimator implements it.\n#\nfrom sklearn.compose import (\n    ColumnTransformer, make_column_selector as selector)\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.impute import SimpleImputer\nnum_pipe = Pipeline([\n    (\"imp\",   SimpleImputer(strategy=\"median\",\n                              add_indicator=True)),\n    (\"scale\", StandardScaler()),\n])\ncat_pipe = Pipeline([\n    (\"imp\", SimpleImputer(strategy=\"most_frequent\")),\n    (\"ohe\", OneHotEncoder(handle_unknown=\"ignore\")),\n])\nct = ColumnTransformer([\n    (\"num\", num_pipe, selector(dtype_include=\"number\")),\n    (\"cat\", cat_pipe, selector(dtype_include=\"object\")),\n], remainder=\"passthrough\",                       # keep engineered features\n   verbose_feature_names_out=False)               # cleaner output names\nct.fit(X_train)\nfeature_names = ct.get_feature_names_out()        # for SHAP / importance plots\n# Decision rule:\n#   mixed numeric + categorical            -> ColumnTransformer\n#   per-type pipeline (impute then encode) -> nest Pipeline inside CT\n#   want columns by dtype, not by name     -> make_column_selector\n#   keep some columns untouched            -> remainder=\"passthrough\"\n#   drop everything not listed             -> remainder=\"drop\" (default)\n#   need readable feature names            -> verbose_feature_names_out=False\n#   different transforms within one type   -> multiple tuples to same dtype\n#\n# Anti-pattern: applying transforms in two passes outside ColumnTransformer\n#   Manually scaling X[num_cols] and one-hot encoding X[cat_cols] then\n#   concatenating works once but breaks under cross-validation (each fold\n#   needs to refit) and at inference (column order drift). Always wrap\n#   per-column logic in ColumnTransformer inside a Pipeline."
                  }
        ],
        tips: [
                  "Specify column indices or names to apply transformations selectively",
                  "Use remainder=\"drop\" to discard unused columns",
                  "Combine with Pipeline for end-to-end preprocessing and modeling"
        ],
        mistake: "Not specifying remainder parameter, causing errors with uncovered columns.",
        shorthand: {
          verbose: "from sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nimport numpy as np\nX = np.array([",
          concise: "print(X_transformed)",
        },
      },
      {
        id: "pipeline",
        fn: "Pipeline",
        desc: "Chain preprocessing and model steps together.",
        category: "Workflow",
        subtitle: "Automate train/test workflow",
        signature: "Pipeline(steps=[('scaler', StandardScaler()), ('model', LogisticRegression())])",
        descLong: "Combines multiple preprocessing and modeling steps into a single object, automatically fitting transformers and then the model, preventing data leakage.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Pipeline — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             treat it as one estimator.\n#             only on train each time pipe.fit() runs.\n#             named_steps access.\n#\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\npipe = Pipeline([\n    (\"scaler\", StandardScaler()),\n    (\"clf\",    LogisticRegression()),\n])\npipe.fit(X_train, y_train)\npipe.score(X_test, y_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Pipeline — common patterns you'll see in production.\n# APPROACH  - Combine Pipeline with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             score with a Pipeline (refits per fold —\n#             leakage-proof CV), named_steps for inner\n#             access, GridSearchCV with step__param\n#             notation.\n#             step__param syntax tunes preprocessing\n#             hyperparameters alongside the model.\n#             FunctionTransformer for custom steps —\n#             senior tier.\n#\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score, GridSearchCV\npipe = Pipeline([\n    (\"scaler\", StandardScaler()),\n    (\"clf\",    LogisticRegression(max_iter=1000)),\n])\n# CV — scaler refits per fold (no leakage)\nscores = cross_val_score(pipe, X, y, cv=5)\nprint(f\"{scores.mean():.3f} +/- {scores.std():.3f}\")\n# Hyperparameter search across BOTH preprocessing and model\ngrid = GridSearchCV(pipe, param_grid={\n    \"scaler__with_mean\": [True, False],\n    \"clf__C\":             [0.1, 1.0, 10.0],\n}, cv=5)\ngrid.fit(X_train, y_train)\nprint(grid.best_params_)\n# Inner access\npipe.named_steps[\"clf\"].coef_"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Pipeline — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             auto-naming, FunctionTransformer for custom\n#             feature engineering inside the Pipeline,\n#             persist with joblib for deterministic\n#             serving, validate set_output to switch\n#             between numpy and pandas.\n#             FunctionTransformer keeps custom logic\n#             leakage-proof inside the Pipeline; pandas\n#             output preserves feature names through\n#             interpretability tools.\n#             — version-pin in production; custom\n#             FunctionTransformer must be importable\n#             at load time.\n#\nimport joblib\nimport numpy as np\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler, FunctionTransformer\nfrom sklearn.linear_model import LogisticRegression\ndef add_log_features(X):\n    return np.hstack([X, np.log1p(np.abs(X))])\n# make_pipeline auto-names steps from class\npipe = make_pipeline(\n    FunctionTransformer(add_log_features, validate=True),\n    StandardScaler(),\n    LogisticRegression(max_iter=1000),\n)\npipe.set_output(transform=\"pandas\")              # preserve column names\npipe.fit(X_train, y_train)\n# Persist for serving\njoblib.dump(pipe, \"model.joblib\")\nloaded = joblib.load(\"model.joblib\")\nloaded.predict(X_new)                             # full pipeline applies\n# Production checklist\n#   - all preprocessing INSIDE the Pipeline (no leakage)\n#   - random_state pinned on every random component\n#   - sklearn version pinned in requirements.txt\n#   - joblib artifact tested by loading & predicting on a held-out row\n#\n# Decision rule:\n#   any preprocessing + model            -> Pipeline (always)\n#   per-column preprocessing             -> ColumnTransformer inside Pipeline\n#   custom feature engineering           -> FunctionTransformer step\n#   want auto-named steps                -> make_pipeline\n#   need to grid-search over a step      -> Pipeline + named steps__param\n#   serialize for serving                -> joblib.dump(pipe, ...)\n#   need pandas DataFrames at each step  -> pipe.set_output(transform=\"pandas\")\n#\n# Anti-pattern: doing preprocessing outside the Pipeline, then CV-ing the model\n#   X_scaled = scaler.fit_transform(X); cross_val_score(model, X_scaled, y)\n#   leaks every fold's validation stats into the scaler. The CV score\n#   is optimistically biased. Move the scaler into the Pipeline so\n#   cross_val_score refits it per fold automatically."
                  }
        ],
        tips: [
                  "Pipeline automatically applies fit_transform to transformers and fit to the final estimator",
                  "Use named_steps to access individual steps: pipeline.named_steps['scaler']",
                  "Prevents accidental data leakage by fitting transformers only on training data"
        ],
        mistake: "Fitting preprocessing separately before the pipeline, causing inconsistent transformations.",
        shorthand: {
          verbose: "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split",
          concise: "print(f'Predictions: {y_pred}')",
        },
      },
    ],
  },

  // ── Section 2: Classification Models ─────────────────────────────────────────
  {
    id: "classification",
    title: "Classification Models",
    entries: [
      {
        id: "logistic_regression",
        fn: "LogisticRegression",
        desc: "Linear classification model for binary/multiclass.",
        category: "Linear Models",
        subtitle: "Probabilistic binary classifier",
        signature: "LogisticRegression(max_iter=1000, random_state=42)",
        descLong: "Linear classifier using logistic function to model probability of class membership, suitable for binary and multiclass classification with interpretable coefficients.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of LogisticRegression — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             avoid convergence warnings.\n#             like every other sklearn estimator.\n#             regularization, or scaling requirement.\n#\nfrom sklearn.linear_model import LogisticRegression\nclf = LogisticRegression(max_iter=1000, random_state=42)\nclf.fit(X_train, y_train)\nclf.score(X_test, y_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of LogisticRegression — common patterns you'll see in production.\n# APPROACH  - Combine LogisticRegression with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             FIRST (LR is sensitive), regularization\n#             via C= (smaller C = more reg), predict_proba\n#             for confidence scores, class_weight=\n#             \"balanced\" for imbalanced data.\n#             class_weight=\"balanced\" is the single most\n#             useful imbalance tool.\n#             or multi_class options — senior tier.\n#\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.metrics import classification_report\npipe = Pipeline([\n    (\"scale\", StandardScaler()),                # LR is scale-sensitive\n    (\"clf\",   LogisticRegression(\n        C=1.0,                                   # smaller -> more regularization\n        max_iter=1000,\n        class_weight=\"balanced\",                 # weight inversely by frequency\n        random_state=42,\n    )),\n])\npipe.fit(X_train, y_train)\n# Predicted probabilities for thresholding / ranking\nproba = pipe.predict_proba(X_test)[:, 1]\nprint(classification_report(y_test, pipe.predict(X_test)))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of LogisticRegression — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             coefficients (feature selection),\n#             \"elasticnet\" for both, calibrate\n#             probabilities for downstream thresholding,\n#             use class_weight or sample_weight for\n#             imbalance.\n#             calibration is essential when probability\n#             values feed into business decisions.\n#             elasticnet adds a second hyperparameter\n#             (l1_ratio); calibration adds compute and\n#             requires a held-out set.\n#\nimport numpy as np\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.calibration import CalibratedClassifierCV\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n# Sparse coefficients via L1 (feature selection inside the model)\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"clf\",   LogisticRegression(\n        penalty=\"l1\", solver=\"liblinear\",        # L1 needs liblinear or saga\n        C=0.5, max_iter=2000,\n        random_state=42,\n    )),\n])\npipe.fit(X_train, y_train)\n# Selected feature mask\nnonzero = pipe.named_steps[\"clf\"].coef_.ravel() != 0\nprint(f\"selected {nonzero.sum()} of {len(nonzero)} features\")\n# Calibration — when probabilities matter (thresholds, expected value)\ncal = CalibratedClassifierCV(pipe, method=\"isotonic\", cv=5)\ncal.fit(X_train, y_train)\nproba = cal.predict_proba(X_test)[:, 1]\n# Now proba is well-calibrated for setting business thresholds.\n# Decision rule:\n#   tabular baseline                  -> LogisticRegression(L2)\n#   want feature selection inline     -> penalty=\"l1\"\n#   probabilities feed into decisions -> CalibratedClassifierCV\n#   imbalanced classes                -> class_weight=\"balanced\"\n#   high-dim text / sparse            -> solver=\"saga\" + penalty=\"l1\"\n#   multi-class                       -> default OvR (or multi_class=\"multinomial\")\n#\n# Anti-pattern: trusting raw predict_proba as a calibrated probability\n#   LogisticRegression's outputs only look calibrated; with regularization\n#   or class_weight=\"balanced\" they are NOT, and thresholding on 0.5 quietly\n#   underperforms. If probabilities drive decisions (pricing, alerting),\n#   wrap in CalibratedClassifierCV and pick the threshold via PR curve."
                  }
        ],
        tips: [
                  "Use C parameter to control regularization strength (lower C = more regularization)",
                  "Access class probabilities with predict_proba() for confidence scores",
                  "Interpretable coefficients show feature importance direction",
                  "For imbalanced classes set `class_weight=\"balanced\"`; if downstream code consumes the probabilities, wrap in `CalibratedClassifierCV` so they reflect real frequencies"
        ],
        mistake: "Not scaling features before LogisticRegression, affecting convergence and coefficient magnitudes.",
        shorthand: {
          verbose: "from sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import accuracy_score, classification_report\nimport numpy as np",
          concise: "print(f'Intercept: {model.intercept_}')",
        },
      },
      {
        id: "decision_tree_classifier",
        fn: "DecisionTreeClassifier",
        desc: "Tree-based classifier with interpretable splits.",
        category: "Tree Models",
        subtitle: "Hierarchical decision rules",
        signature: "DecisionTreeClassifier(max_depth=5, random_state=42)",
        descLong: "Creates decision trees through recursive partitioning based on feature thresholds, providing interpretable models with feature importance without scaling requirements.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of DecisionTreeClassifier — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             needed.\n#             visualization.\n#\nfrom sklearn.tree import DecisionTreeClassifier\nclf = DecisionTreeClassifier(max_depth=3, random_state=42)\nclf.fit(X_train, y_train)\nclf.score(X_test, y_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of DecisionTreeClassifier — common patterns you'll see in production.\n# APPROACH  - Combine DecisionTreeClassifier with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             min_samples_split + min_samples_leaf to\n#             curb overfitting; feature_importances_\n#             for variable ranking; class_weight for\n#             imbalance.\n#             way to tame a tree; importances give you\n#             a feature story for free.\n#             RandomForest / GradientBoosting at scale —\n#             senior tier.\n#\nfrom sklearn.tree import DecisionTreeClassifier, plot_tree\nimport matplotlib.pyplot as plt\nclf = DecisionTreeClassifier(\n    max_depth=5,\n    min_samples_split=20,\n    min_samples_leaf=10,\n    class_weight=\"balanced\",\n    random_state=42,\n)\nclf.fit(X_train, y_train)\n# Feature importances — Gini-based\nimp = sorted(zip(feature_names, clf.feature_importances_),\n              key=lambda x: -x[1])\n# Visualize\nplot_tree(clf, feature_names=feature_names, filled=True,\n           rounded=True, fontsize=8)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of DecisionTreeClassifier — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             the right answer — use it for explanation\n#             only, then ensemble for prediction. Cost-\n#             complexity pruning (ccp_alpha) gives a\n#             principled tree-size tradeoff. Always\n#             cross-validate depth.\n#             arbitrary max_depth tuning; the \"tree for\n#             explanation, ensemble for prediction\" rule\n#             clarifies when each tool is right.\n#             accuracy is almost always beaten by a\n#             RandomForest or GradientBoosting on real\n#             data.\n#\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.model_selection import GridSearchCV\n# Tune complexity via cost-complexity pruning\ngrid = GridSearchCV(\n    DecisionTreeClassifier(random_state=42),\n    param_grid={\n        \"ccp_alpha\":         [0.0, 0.001, 0.005, 0.01],\n        \"max_depth\":         [None, 4, 8, 12],\n        \"min_samples_leaf\":  [1, 5, 20],\n    },\n    cv=5, scoring=\"accuracy\",\n)\ngrid.fit(X_train, y_train)\nbest = grid.best_estimator_\n# Decision rule:\n#   need an interpretable model         -> DecisionTreeClassifier (small)\n#   need accuracy on tabular data       -> RandomForest / GradientBoosting\n#   need both                           -> shallow tree for explanation,\n#                                          ensemble for production scoring\n#   class imbalance                     -> class_weight=\"balanced\"\n#   feature interactions matter          -> max_depth >= 5 (let it find them)\n#\n# Anti-pattern: leaving max_depth=None on a single tree\n#   The default grows until every leaf is pure — train accuracy 100%,\n#   test accuracy mediocre, model unusable. Always constrain depth\n#   (max_depth, min_samples_leaf, or ccp_alpha). If you want max accuracy\n#   without the fiddling, switch to RandomForest or GradientBoosting."
                  }
        ],
        tips: [
                  "Limit max_depth to prevent overfitting; start with 3-5",
                  "Use min_samples_split to require minimum samples for splits",
                  "No scaling required; handles categorical features well"
        ],
        mistake: "Using deep trees without constraints, causing overfitting on training data.",
        shorthand: {
          verbose: "from sklearn.tree import DecisionTreeClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import accuracy_score\nimport numpy as np",
          concise: "print(f'Tree depth: {model.get_depth()}')",
        },
      },
      {
        id: "random_forest_classifier",
        fn: "RandomForestClassifier",
        desc: "Ensemble of decision trees with bagging.",
        category: "Ensemble Models",
        subtitle: "Robust ensemble of trees",
        signature: "RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)",
        descLong: "Combines multiple decision trees with bootstrap sampling and feature randomness, reducing overfitting and providing robust predictions with feature importance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of RandomForestClassifier — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             No scaling needed.\n#             tabular data. Hard to misuse.\n#             permutation importance.\n#\nfrom sklearn.ensemble import RandomForestClassifier\nclf = RandomForestClassifier(n_estimators=100, random_state=42)\nclf.fit(X_train, y_train)\nclf.score(X_test, y_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of RandomForestClassifier — common patterns you'll see in production.\n# APPROACH  - Combine RandomForestClassifier with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             all cores, max_features=\"sqrt\" (default for\n#             classification), oob_score=True for free\n#             validation, class_weight= for imbalance.\n#             oob_score gives validation accuracy\n#             without a held-out set.\n#             (more honest than gini importance) —\n#             senior tier.\n#\nfrom sklearn.ensemble import RandomForestClassifier\nclf = RandomForestClassifier(\n    n_estimators=300,\n    max_depth=None,                          # full depth, regularize via leaves\n    min_samples_leaf=5,\n    max_features=\"sqrt\",                     # default for classification\n    class_weight=\"balanced\",\n    n_jobs=-1,                                # parallelize across cores\n    oob_score=True,                           # built-in validation\n    random_state=42,\n)\nclf.fit(X_train, y_train)\nprint(f\"OOB score: {clf.oob_score_:.3f}\")\nprint(f\"Test:      {clf.score(X_test, y_test):.3f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of RandomForestClassifier — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             importance over feature_importances_\n#             (less biased toward high-cardinality\n#             features); for tabular accuracy benchmarks\n#             a tuned RF is hard to beat without a\n#             gradient-boosted model (XGBoost / LightGBM\n#             / GradientBoosting).\n#             explicit comparison to GBM clarifies when\n#             RF is the right tool vs the strongest\n#             tabular default.\n#             models (refits per feature); GBMs win on\n#             accuracy but cost more tuning time.\n#\nimport numpy as np\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.inspection import permutation_importance\nclf = RandomForestClassifier(\n    n_estimators=500, min_samples_leaf=5,\n    n_jobs=-1, random_state=42,\n).fit(X_train, y_train)\n# Permutation importance — refits NOT required\nresult = permutation_importance(\n    clf, X_test, y_test,\n    n_repeats=10, n_jobs=-1, random_state=42,\n)\norder = np.argsort(result.importances_mean)[::-1]\nfor i in order[:10]:\n    print(f\"{feature_names[i]:20s} {result.importances_mean[i]:.4f}\")\n# Decision rule:\n#   strong tabular default               -> RandomForest\n#   need top accuracy on tabular         -> XGBoost / LightGBM / sklearn HGB\n#   need calibrated probabilities        -> CalibratedClassifierCV(rf, cv=5)\n#   tiny dataset                         -> LogisticRegression baseline first\n#   honest feature importance            -> permutation_importance on test\n#   class imbalance                      -> class_weight=\"balanced_subsample\"\n#\n# Anti-pattern: trusting clf.feature_importances_ on correlated features\n#   The default impurity-based importance is biased toward high-cardinality\n#   features and splits the credit among correlated ones, hiding the true\n#   signal. Use permutation_importance on a held-out set, or SHAP. Also\n#   never compute importance on training data — it overstates real impact."
                  }
        ],
        tips: [
                  "Start with n_estimators=100; more trees = better generalization (diminishing returns)",
                  "Feature importances help identify most predictive variables",
                  "Set n_jobs=-1 to parallelize tree training across all cores"
        ],
        mistake: "Using too few estimators (n_estimators=10) for stable predictions.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "svm_classifier",
        fn: "SVC (Support Vector Classifier)",
        desc: "Support Vector Machine for classification.",
        category: "Kernel Methods",
        subtitle: "Margin-based classifier",
        signature: "SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42)",
        descLong: "Finds maximum-margin hyperplane separating classes using kernel methods, effective for high-dimensional data and complex non-linear boundaries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of SVC (Support Vector Classifier) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             default RBF kernel.\n#             probability=True.\n#\nfrom sklearn.svm import SVC\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nclf = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"svm\",   SVC(kernel=\"rbf\", random_state=42)),\n])\nclf.fit(X_train, y_train)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of SVC (Support Vector Classifier) — common patterns you'll see in production.\n# APPROACH  - Combine SVC (Support Vector Classifier) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             margin slack (lower = wider margin, more\n#             reg), gamma controls RBF width, kernel=\n#             choice, probability=True for predict_proba.\n#             that drives most SVM behavior;\n#             probability=True unlocks scoring use cases.\n#             the LinearSVC / SGDClassifier alternatives\n#             — senior.\n#\nfrom sklearn.svm import SVC\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nclf = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"svm\",   SVC(\n        kernel=\"rbf\",\n        C=1.0,                                  # lower = wider margin\n        gamma=\"scale\",                          # default; or float\n        class_weight=\"balanced\",\n        probability=True,                       # enable predict_proba (slower)\n        random_state=42,\n    )),\n])\nclf.fit(X_train, y_train)\nproba = clf.predict_proba(X_test)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of SVC (Support Vector Classifier) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             N > ~10k switch to LinearSVC (linear only)\n#             or SGDClassifier (loss=\"hinge\"). Tune C\n#             and gamma via GridSearchCV with a Pipeline\n#             so scaling refits per fold.\n#             a notebook-killing 30-minute fit; LinearSVC\n#             handles linear cases at any scale;\n#             SGDClassifier scales to millions of rows.\n#             CalibratedClassifierCV); SGDClassifier\n#             needs many epochs and careful learning-\n#             rate tuning.\n#\nfrom sklearn.svm import SVC, LinearSVC\nfrom sklearn.linear_model import SGDClassifier\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import GridSearchCV\n# Tune C, gamma in CV — Pipeline keeps scaling leakage-proof\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"svm\",   SVC(kernel=\"rbf\", random_state=42)),\n])\ngrid = GridSearchCV(pipe, param_grid={\n    \"svm__C\":     [0.1, 1.0, 10.0],\n    \"svm__gamma\": [\"scale\", 0.01, 0.1, 1.0],\n}, cv=5, n_jobs=-1)\ngrid.fit(X_train, y_train)\n# Decision rule by sample size N:\n#   N <= 10k, non-linear     -> SVC(kernel=\"rbf\")\n#   N <= 50k, linear OK       -> LinearSVC\n#   N >> 50k                   -> SGDClassifier(loss=\"hinge\")\n#   need predict_proba         -> SVC(probability=True) OR\n#                                  CalibratedClassifierCV(LinearSVC())\n#\n# Decision rule:\n#   N < 10k, non-linear boundary       -> SVC(kernel=\"rbf\")\n#   N < 10k, mostly linear, fast       -> SVC(kernel=\"linear\") or LinearSVC\n#   N > 50k                            -> LinearSVC or SGDClassifier(hinge)\n#   need probability outputs           -> SVC(probability=True) or calibrate\n#   imbalanced classes                 -> class_weight=\"balanced\"\n#   features at very different scales  -> always StandardScaler in Pipeline\n#   tabular tabular benchmark           -> try RF/GBM first, SVM rarely wins\n#\n# Anti-pattern: SVC on a 100k-row dataset without checking complexity\n#   SVC training is O(n^2) to O(n^3); a routine \"let me try SVM\" turns\n#   into a frozen notebook on big data. Either subsample to <=10k rows,\n#   switch to LinearSVC / SGDClassifier(loss=\"hinge\"), or use a kernel\n#   approximation (Nystroem) before a linear classifier."
                  }
        ],
        tips: [
                  "Always scale features before SVM; use StandardScaler or MinMaxScaler",
                  "Tune C parameter: higher C = stricter margins, lower = more tolerance",
                  "Use kernel='rbf' for non-linear problems, kernel='linear' for linear separability"
        ],
        mistake: "Not scaling features, leading to slow training and poor performance.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "knn_classifier",
        fn: "KNeighborsClassifier",
        desc: "Lazy learner using k-nearest neighbors.",
        category: "Instance-based",
        subtitle: "Distance-based voting",
        signature: "KNeighborsClassifier(n_neighbors=5)",
        descLong: "Classifies samples by majority vote of k nearest neighbors in feature space, non-parametric and suitable for non-linear decision boundaries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of KNeighborsClassifier — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             k=5 by default. Scale FIRST.\n#\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nclf = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"knn\",   KNeighborsClassifier(n_neighbors=5)),\n])\nclf.fit(X_train, y_train)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of KNeighborsClassifier — common patterns you'll see in production.\n# APPROACH  - Combine KNeighborsClassifier with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             weights=\"distance\" (closer neighbors\n#             vote more), n_jobs= for parallel\n#             prediction.\n#             KNN tuning surface; n_jobs is a free\n#             speedup at predict time.\n#             dimensionality or memory cost — senior.\n#\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import GridSearchCV\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"knn\",   KNeighborsClassifier(n_jobs=-1)),\n])\ngrid = GridSearchCV(pipe, param_grid={\n    \"knn__n_neighbors\": [3, 5, 10, 25],\n    \"knn__weights\":     [\"uniform\", \"distance\"],\n}, cv=5)\ngrid.fit(X_train, y_train)\nprint(grid.best_params_)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of KNeighborsClassifier — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             training set (memory cost), suffers in\n#             high dimensions, and predict() is O(N) per\n#             query without an index. For >100k rows or\n#             >50 features, switch to a real classifier\n#             (RF / GBM) or use approximate nearest\n#             neighbors (faiss, annoy).\n#             \"why is my notebook slow\" surprises; ANN\n#             libraries scale to millions when you must\n#             stick with KNN semantics.\n#             exact; switching to RF/GBM loses the\n#             interpretable \"k closest neighbors\" story.\n#\nfrom sklearn.neighbors import KNeighborsClassifier\n# 1. Built-in tree indexes — used automatically when N is large\nclf = KNeighborsClassifier(\n    n_neighbors=5,\n    algorithm=\"auto\",                    # auto picks ball_tree / kd_tree\n    leaf_size=30,                         # tune for very large N\n    n_jobs=-1,\n)\n# 2. Curse of dimensionality — KNN degrades fast above ~30 features\n#    Reduce dims first (PCA, UMAP) or use a different model.\n# from sklearn.decomposition import PCA\n# Pipeline([(\"scale\", StandardScaler()), (\"pca\", PCA(n_components=20)), (\"knn\", clf)])\n# Decision rule:\n#   N small (< 10k), few dims (< 30)   -> KNN with full search\n#   N large but few dims               -> KNN with kd_tree / ball_tree\n#   N large AND many dims              -> RandomForest or GBM\n#   need exact KNN at huge scale       -> faiss / annoy (approximate NN)\n#   want neighbor-weighted votes       -> weights=\"distance\"\n#   small k -> overfit, large k -> bias-> tune via CV in 3..30\n#\n# Anti-pattern: KNN on raw, unscaled features\n#   KNN is pure distance — a feature with values in 0..10000 will dominate\n#   one in 0..1 and the model effectively ignores everything else.\n#   Always StandardScaler (or MinMaxScaler) inside a Pipeline. Same goes\n#   for one-hot columns: distance on them is binary and noisy; consider\n#   OrdinalEncoder + scaling, or skip KNN for high-cardinality categoricals."
                  }
        ],
        tips: [
                  "Choose n_neighbors via cross-validation; typical range 3-10",
                  "Scale features because KNN is distance-based",
                  "Use weights=\"distance\" to weight neighbors by inverse distance",
                  "Set `algorithm=\"kd_tree\"` or `\"ball_tree\"` for large N with few dimensions; high-dim KNN degrades to brute-force — switch to a tree ensemble or FAISS/annoy instead"
        ],
        mistake: "Using k=1 or k too large without validation; both extremes harm generalization.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "gradient_boosting_classifier",
        fn: "GradientBoostingClassifier",
        desc: "Sequential boosting with gradient optimization.",
        category: "Boosting Models",
        subtitle: "Iterative error correction",
        signature: "GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)",
        descLong: "Iteratively builds trees to correct prediction errors using gradient descent, achieving high accuracy by combining weak learners into a strong ensemble.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of GradientBoostingClassifier — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             previous one's errors. Default 100 trees.\n#             out-of-the-box.\n#             tuning or HistGradientBoosting.\n#\nfrom sklearn.ensemble import GradientBoostingClassifier\nclf = GradientBoostingClassifier(random_state=42)\nclf.fit(X_train, y_train)\nclf.score(X_test, y_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of GradientBoostingClassifier — common patterns you'll see in production.\n# APPROACH  - Combine GradientBoostingClassifier with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             (smaller = more trees but better\n#             generalization), max_depth (3-5 typical),\n#             subsample (<1 for stochastic GBM),\n#             validation_fraction + n_iter_no_change for\n#             early stopping.\n#             saves training time; subsample is a free\n#             regularizer.\n#             (much faster) or XGBoost / LightGBM —\n#             senior tier.\n#\nfrom sklearn.ensemble import GradientBoostingClassifier\nclf = GradientBoostingClassifier(\n    n_estimators=500,                        # plenty of trees with early stop\n    learning_rate=0.05,                      # smaller = better generalization\n    max_depth=3,                              # shallow trees, like XGBoost\n    subsample=0.8,                            # stochastic\n    validation_fraction=0.1,\n    n_iter_no_change=10,                      # early stop\n    random_state=42,\n)\nclf.fit(X_train, y_train)\nprint(f\"trees actually used: {clf.n_estimators_}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of GradientBoostingClassifier — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             HistGradientBoostingClassifier over\n#             GradientBoostingClassifier (10-100x\n#             faster, native missing-value support);\n#             reach for XGBoost / LightGBM when squeezing\n#             the last percent of accuracy or scaling\n#             beyond sklearn's reach.\n#             XGBoost/LightGBM step gets the strongest\n#             tabular results documented on benchmarks.\n#             surface; XGBoost/LightGBM add a\n#             dependency and a learning curve.\n#\nfrom sklearn.ensemble import HistGradientBoostingClassifier\n# Modern fast default — handles missing values natively\nclf = HistGradientBoostingClassifier(\n    max_iter=500,\n    learning_rate=0.05,\n    max_depth=None,                           # let max_leaf_nodes regularize\n    max_leaf_nodes=31,                         # LightGBM-like default\n    min_samples_leaf=20,\n    early_stopping=True,\n    validation_fraction=0.1,\n    random_state=42,\n)\nclf.fit(X_train, y_train)\n# When sklearn isn't enough:\n#   import xgboost as xgb\n#   xgb.XGBClassifier(tree_method=\"hist\", n_estimators=1000, learning_rate=0.05)\n#   import lightgbm as lgb\n#   lgb.LGBMClassifier(n_estimators=1000, learning_rate=0.05)\n# Decision rule (tabular accuracy, in order):\n#   1. HistGradientBoostingClassifier  (sklearn, fast)\n#   2. LightGBM                         (faster on big data)\n#   3. XGBoost                          (battle-tested, similar accuracy)\n#   4. RandomForest                     (no tuning, decent baseline)\n#\n# Decision rule:\n#   any tabular accuracy benchmark      -> gradient boosting first\n#   sklearn-only stack, large N         -> HistGradientBoostingClassifier\n#   need top accuracy / GPU             -> LightGBM or XGBoost\n#   tons of categorical columns         -> LightGBM (categorical_feature) or CatBoost\n#   missing values in features          -> HistGBM (native NaN support)\n#   limited tuning time, want OK        -> RandomForest baseline\n#   probabilities feed business rules   -> calibrate (CalibratedClassifierCV)\n#\n# Anti-pattern: stacking GBM on top of one-hot encoded high-cardinality categoricals\n#   GBMs split greedily; OHE explodes the feature count and dilutes the\n#   signal across many almost-empty columns, hurting both accuracy and\n#   speed. Use OrdinalEncoder (trees handle it fine), TargetEncoder, or\n#   LightGBM's native categorical_feature= argument instead."
                  }
        ],
        tips: [
                  "learning_rate (shrinkage) 0.01-0.1 prevents overfitting; lower = slower but better",
                  "Monitor validation scores to detect early stopping opportunity",
                  "Subsample parameter helps prevent overfitting by using random subsets"
        ],
        mistake: "Using high learning_rate without sufficient validation, causing unstable training.",
        shorthand: {
          verbose: "from sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import accuracy_score, classification_report\nimport numpy as np",
          concise: "print(classification_report(y_test, y_pred))",
        },
      },
    ],
  },

  // ── Section 3: Regression Models ─────────────────────────────────────────
  {
    id: "regression",
    title: "Regression Models",
    entries: [
      {
        id: "linear_regression",
        fn: "LinearRegression",
        desc: "Simple linear regression model.",
        category: "Linear Models",
        subtitle: "Least squares fitting",
        signature: "LinearRegression().fit(X_train, y_train)",
        descLong: "Fits a linear relationship between features and target by minimizing sum of squared residuals, providing interpretable coefficients and baseline comparisons.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of LinearRegression — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             interpretation.\n#\nfrom sklearn.linear_model import LinearRegression\nreg = LinearRegression()\nreg.fit(X_train, y_train)\nreg.score(X_test, y_test)              # R^2"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of LinearRegression — common patterns you'll see in production.\n# APPROACH  - Combine LinearRegression with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             RMSE, MAE; interpret coefficients;\n#             check residuals; cross-validation.\n#             is the standard regression diagnostic.\n#             Lasso), heteroscedasticity, or robust\n#             alternatives — senior tier.\n#\nimport numpy as np\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score\nfrom sklearn.model_selection import cross_val_score\nreg = LinearRegression().fit(X_train, y_train)\ny_pred = reg.predict(X_test)\nmse  = mean_squared_error(y_test, y_pred)\nrmse = mse ** 0.5\nmae  = mean_absolute_error(y_test, y_pred)\nr2   = r2_score(y_test, y_pred)\n# Coefficient interpretation: change in y per unit change in x_i\nfor name, c in zip(feature_names, reg.coef_):\n    print(f\"{name:20s} {c:+.3f}\")\n# Cross-validated R^2\ncv = cross_val_score(reg, X, y, cv=5, scoring=\"r2\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of LinearRegression — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             features (matters for regularization,\n#             optional otherwise), check residuals for\n#             heteroscedasticity, use HuberRegressor for\n#             outlier-heavy data, statsmodels for full\n#             inference (p-values, CIs).\n#             diagnostic; HuberRegressor is the easiest\n#             outlier defense; statsmodels gives the\n#             stats sklearn omits.\n#             tunes one extra parameter (epsilon).\n#\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.linear_model import LinearRegression, HuberRegressor\nimport statsmodels.api as sm\n# 1. Residual diagnostic\nreg = LinearRegression().fit(X_train, y_train)\nresid = y_train - reg.predict(X_train)\nplt.scatter(reg.predict(X_train), resid, alpha=0.4)\nplt.axhline(0, color=\"black\", linewidth=0.5)\n# Look for: random scatter (good), curved pattern (non-linear),\n# fan shape (heteroscedasticity).\n# 2. Robust regression — outlier-resistant\nrobust = HuberRegressor(epsilon=1.35).fit(X_train, y_train)\n# 3. statsmodels for inference (p-values, CIs)\nX_const = sm.add_constant(X_train)\nols = sm.OLS(y_train, X_const).fit()\nprint(ols.summary())          # coef, std err, t, p-value, [95% CI]\n# Decision rule:\n#   linear baseline                   -> LinearRegression\n#   multicollinearity                 -> Ridge\n#   feature selection inline          -> Lasso\n#   outliers in y                     -> HuberRegressor / RANSAC\n#   need p-values / CIs               -> statsmodels.OLS\n#   non-linear pattern in residuals   -> add polynomial / move to GBM\n#   wildly different feature scales   -> scale features before regularizing\n#\n# Anti-pattern: reading coefficient magnitudes as \"feature importance\"\n#   On unscaled features the coefficient size reflects unit choice, not\n#   importance — kilometers vs millimeters flips ranking. Always scale\n#   first if you plan to compare coefficients, or use partial dependence\n#   / permutation importance. Also: R^2 on training data hides overfit."
                  }
        ],
        tips: [
                  "Interpret coefficients as change in y per unit change in each feature",
                  "Check for multicollinearity among features using correlation matrix",
                  "Use for baseline comparisons; more complex models should exceed this performance"
        ],
        mistake: "Not checking linear assumptions; LinearRegression requires approximately linear relationship.",
        shorthand: {
          verbose: "from sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error, r2_score\nimport numpy as np",
          concise: "print(f'Intercept: {model.intercept_:.3f}')",
        },
      },
      {
        id: "ridge_regression",
        fn: "Ridge",
        desc: "L2 regularized linear regression.",
        category: "Linear Models",
        subtitle: "Regularized with L2 penalty",
        signature: "Ridge(alpha=1.0, random_state=42)",
        descLong: "Adds L2 penalty to coefficients reducing their magnitude, mitigating multicollinearity effects and preventing overfitting with shrinkage regularization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Ridge — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             alpha controls strength.\n#             multicollinearity; the safe regularized\n#             baseline.\n#             via RidgeCV.\n#\nfrom sklearn.linear_model import Ridge\nreg = Ridge(alpha=1.0)\nreg.fit(X_train, y_train)\nreg.score(X_test, y_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Ridge — common patterns you'll see in production.\n# APPROACH  - Combine Ridge with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             (penalty is scale-sensitive), tune alpha\n#             with RidgeCV (built-in cross-validation),\n#             interpret shrunk coefficients.\n#             GridSearchCV for alpha tuning; scaling +\n#             Ridge is the standard linear-regression\n#             upgrade.\n#             feature selection — separate entries.\n#\nfrom sklearn.linear_model import RidgeCV\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n# Pipeline + RidgeCV — alpha tuned automatically\nimport numpy as np\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"ridge\", RidgeCV(\n        alphas=np.logspace(-3, 3, 13),       # 0.001 to 1000\n        cv=5,\n    )),\n])\npipe.fit(X_train, y_train)\nprint(f\"alpha: {pipe.named_steps['ridge'].alpha_}\")\nprint(f\"R^2:   {pipe.score(X_test, y_test):.3f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Ridge — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             non-linear data via KernelRidge, polynomial\n#             features for interaction terms, prefer\n#             Ridge over plain LinearRegression as the\n#             default — it never hurts and often helps.\n#             without the SVR cost; polynomial Ridge is\n#             the cleanest way to get interaction terms\n#             with regularization.\n#             polynomial features explode column count.\n#\nfrom sklearn.linear_model import Ridge, RidgeCV\nfrom sklearn.kernel_ridge import KernelRidge\nfrom sklearn.preprocessing import StandardScaler, PolynomialFeatures\nfrom sklearn.pipeline import Pipeline\nimport numpy as np\n# 1. Polynomial Ridge — captures non-linear / interaction terms\npoly_pipe = Pipeline([\n    (\"poly\",  PolynomialFeatures(degree=2, interaction_only=False)),\n    (\"scale\", StandardScaler()),\n    (\"ridge\", RidgeCV(alphas=np.logspace(-2, 4, 13), cv=5)),\n])\n# 2. KernelRidge — non-linear, no manual feature engineering\nkr = KernelRidge(alpha=1.0, kernel=\"rbf\", gamma=0.1)\n# Default rule:\n#   \"should I use LinearRegression or Ridge?\"\n#     -> Ridge with small alpha. It's strictly better when in doubt.\n#\n#   need feature selection                   -> Lasso\n#   non-linear via polynomial features        -> Ridge + PolynomialFeatures\n#   non-linear via kernels                    -> KernelRidge\n#   need both reg AND selection               -> ElasticNet\n#\n# Decision rule:\n#   default linear regressor          -> Ridge (alpha tuned by RidgeCV)\n#   need feature selection             -> Lasso\n#   correlated features + selection    -> ElasticNet\n#   non-linear via polynomial          -> PolynomialFeatures + Ridge\n#   non-linear, small N                -> KernelRidge(kernel=\"rbf\")\n#   noisy data, many features          -> raise alpha (more shrinkage)\n#   alpha grid                         -> RidgeCV(alphas=np.logspace(-2,4,13))\n#\n# Anti-pattern: tuning alpha by hand on the test set\n#   Sweeping alpha and picking the value that gives best test R^2 is just\n#   manual data leakage; the held-out score is now optimistically biased.\n#   Use RidgeCV (built-in efficient leave-one-out path) or a Pipeline +\n#   GridSearchCV. Also: never run Ridge on unscaled features — large-scale\n#   columns absorb most of the penalty and the regularization is uneven."
                  }
        ],
        tips: [
                  "Higher alpha increases regularization strength; tune via cross-validation",
                  "All coefficients are shrunk proportionally; none forced to zero",
                  "Better than LinearRegression when multicollinearity is present"
        ],
        mistake: "Not scaling features before Ridge; affects regularization penalty magnitude.",
        shorthand: {
          verbose: "from sklearn.linear_model import Ridge\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error, r2_score\nimport numpy as np",
          concise: "print(f'Sum of squared coefficients: {(model.coef_**2).sum():.3f}')",
        },
      },
      {
        id: "lasso_regression",
        fn: "Lasso",
        desc: "L1 regularized linear regression.",
        category: "Linear Models",
        subtitle: "Regularized with L1 penalty",
        signature: "Lasso(alpha=0.1, random_state=42)",
        descLong: "Adds L1 penalty to coefficients, performing automatic feature selection by forcing some coefficients to exactly zero.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Lasso — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Forces some coefficients to exactly 0\n#             (feature selection).\n#             model.\n#\nfrom sklearn.linear_model import Lasso\nreg = Lasso(alpha=0.1)\nreg.fit(X_train, y_train)\nprint((reg.coef_ != 0).sum(), \"features selected\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Lasso — common patterns you'll see in production.\n# APPROACH  - Combine Lasso with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             use LassoCV to pick alpha, examine which\n#             features were zeroed out as the\n#             interpretable feature-selection story.\n#             the \"which features survived?\" output is\n#             the main reason to use Lasso.\n#             features or post-Lasso refit — senior tier.\n#\nimport numpy as np\nfrom sklearn.linear_model import LassoCV\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"lasso\", LassoCV(\n        alphas=np.logspace(-4, 1, 50),\n        cv=5,\n        random_state=42,\n        max_iter=10_000,\n    )),\n])\npipe.fit(X_train, y_train)\nlasso = pipe.named_steps[\"lasso\"]\nprint(f\"alpha:  {lasso.alpha_:.5f}\")\nselected = [name for name, c in zip(feature_names, lasso.coef_) if c != 0]\nprint(f\"selected ({len(selected)}): {selected}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Lasso — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             correlated, Lasso arbitrarily picks one\n#             and zeros the rest — switch to ElasticNet\n#             for stable selection. Optionally refit\n#             OLS on the selected features (\"relaxed\n#             Lasso\") for unbiased coefficients.\n#             correlated groups; relaxed Lasso fixes\n#             the shrinkage bias on selected features.\n#             refit-on-selected is slightly more code\n#             than a single estimator.\n#\nimport numpy as np\nfrom sklearn.linear_model import LassoCV, ElasticNetCV, LinearRegression\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n# 1. ElasticNet for stable selection under correlation\nen = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"en\", ElasticNetCV(\n        l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 0.99, 1.0],\n        alphas=np.logspace(-4, 1, 30),\n        cv=5, random_state=42, max_iter=10_000,\n    )),\n])\nen.fit(X_train, y_train)\n# 2. Relaxed Lasso — refit OLS on the selected features\nlasso = LassoCV(cv=5, random_state=42, max_iter=10_000).fit(X_train, y_train)\nmask = lasso.coef_ != 0\nrelaxed = LinearRegression().fit(X_train[:, mask], y_train)\n# Decision rule:\n#   feature selection inline                        -> Lasso\n#   features correlated, want stable selection      -> ElasticNet\n#   need unbiased coefficients on selected features -> relaxed Lasso\n#   no selection needed, just shrinkage             -> Ridge\n#   tune alpha via CV                               -> LassoCV / ElasticNetCV\n#   slow convergence                                -> raise max_iter to 10000+\n#\n# Anti-pattern: treating Lasso's nonzero coefficients as a stable feature ranking\n#   With correlated predictors Lasso picks one almost at random and zeros\n#   the rest; rerunning on a resample gives a different \"selected set\".\n#   Use ElasticNet (or stability selection) when you need a reliable\n#   feature list, and never compare coefficient magnitudes on unscaled X."
                  }
        ],
        tips: [
                  "Lasso performs feature selection; some coefficients become exactly zero",
                  "Higher alpha increases sparsity; tune via cross-validation",
                  "Use for interpretability; identifies most important features automatically"
        ],
        mistake: "Using Lasso without scaling; affects which features are penalized.",
        shorthand: {
          verbose: "from sklearn.linear_model import Lasso\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error, r2_score\nimport numpy as np",
          concise: "print(f'Non-zero coefficients: {np.sum(model.coef_ != 0)}')",
        },
      },
      {
        id: "elasticnet_regression",
        fn: "ElasticNet",
        desc: "Combined L1 and L2 regularization.",
        category: "Linear Models",
        subtitle: "Hybrid L1/L2 penalty",
        signature: "ElasticNet(alpha=0.1, l1_ratio=0.5, random_state=42)",
        descLong: "Combines Ridge (L2) and Lasso (L1) penalties, providing both feature selection and coefficient shrinkage for balanced regularization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ElasticNet — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             controls the mix (0=Ridge, 1=Lasso).\n#             stability from L2.\n#\nfrom sklearn.linear_model import ElasticNet\nreg = ElasticNet(alpha=0.1, l1_ratio=0.5)\nreg.fit(X_train, y_train)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ElasticNet — common patterns you'll see in production.\n# APPROACH  - Combine ElasticNet with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             first, ElasticNetCV tunes both alpha and\n#             l1_ratio simultaneously, max_iter cranked\n#             up for convergence on stiff problems.\n#             tuning the two hyperparameters together;\n#             the model handles correlated features\n#             far more gracefully than Lasso alone.\n#             chosen l1_ratio — senior tier.\n#\nimport numpy as np\nfrom sklearn.linear_model import ElasticNetCV\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"en\", ElasticNetCV(\n        l1_ratio=[0.1, 0.5, 0.7, 0.9, 0.99, 1.0],\n        alphas=np.logspace(-4, 1, 30),\n        cv=5, random_state=42, max_iter=10_000,\n    )),\n])\npipe.fit(X_train, y_train)\nen = pipe.named_steps[\"en\"]\nprint(f\"alpha={en.alpha_:.5f} l1_ratio={en.l1_ratio_}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ElasticNet — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             diagnostic — values near 1 mean Lasso\n#             behavior was preferred (clear feature\n#             selection), values near 0 mean Ridge\n#             behavior (correlated features). Use the\n#             chosen l1_ratio to inform whether to\n#             simplify the model.\n#             needs; pairs naturally with the\n#             Ridge/Lasso decision rule.\n#             iteration; for extreme p, switch to SGD\n#             or feature-pre-selection first.\n#\nimport numpy as np\nfrom sklearn.linear_model import ElasticNetCV\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"en\", ElasticNetCV(\n        l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 0.99, 1.0],\n        alphas=np.logspace(-5, 2, 50),\n        cv=5, random_state=42, max_iter=20_000,\n        n_jobs=-1,\n    )),\n])\npipe.fit(X_train, y_train)\nen = pipe.named_steps[\"en\"]\n# Diagnostic interpretation\nif en.l1_ratio_ >= 0.95:\n    print(\"Lasso-like solution -> consider switching to LassoCV for clarity\")\nelif en.l1_ratio_ <= 0.2:\n    print(\"Ridge-like solution -> consider switching to RidgeCV for speed\")\nelse:\n    print(\"True mix -> ElasticNet is the right choice\")\n# Decision rule:\n#   uncertain about correlation        -> ElasticNet (then check l1_ratio)\n#   l1_ratio chooses ~1 in CV          -> LassoCV\n#   l1_ratio chooses ~0 in CV          -> RidgeCV\n#   selected mix sits 0.3..0.7         -> ElasticNet IS the right tool\n#   need feature selection + stability -> ElasticNet over Lasso\n#   want one CV-tuned model in 2 lines -> ElasticNetCV\n#\n# Anti-pattern: tuning only alpha and leaving l1_ratio at the default 0.5\n#   ElasticNet has TWO knobs; locking l1_ratio at 0.5 forfeits its main\n#   advantage. Pass a list of ratios (e.g. [.1, .5, .7, .9, .95, .99, 1])\n#   to ElasticNetCV. Also: too small a max_iter silently converges to a\n#   worse solution — bump max_iter to 10,000+ when warnings appear."
                  }
        ],
        tips: [
                  "l1_ratio=0 becomes Ridge, l1_ratio=1 becomes Lasso; 0.5 balances both",
                  "Better than Lasso when many correlated features exist",
                  "Tune both alpha and l1_ratio via cross-validation"
        ],
        mistake: "Not tuning l1_ratio; default 0.5 may not be optimal for your data.",
        shorthand: {
          verbose: "from sklearn.linear_model import ElasticNet\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error, r2_score\nimport numpy as np",
          concise: "print(f'Non-zero coefficients: {np.sum(model.coef_ != 0)}')",
        },
      },
      {
        id: "decision_tree_regressor",
        fn: "DecisionTreeRegressor",
        desc: "Tree-based regression model.",
        category: "Tree Models",
        subtitle: "Hierarchical regression rules",
        signature: "DecisionTreeRegressor(max_depth=5, random_state=42)",
        descLong: "Recursively partitions feature space to minimize mean squared error, providing non-linear relationships without feature scaling requirements.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of DecisionTreeRegressor — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             minimize MSE. No scaling needed.\n#             — a step function, not a curve.\n#\nfrom sklearn.tree import DecisionTreeRegressor\nreg = DecisionTreeRegressor(max_depth=3, random_state=42)\nreg.fit(X_train, y_train)\nreg.score(X_test, y_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of DecisionTreeRegressor — common patterns you'll see in production.\n# APPROACH  - Combine DecisionTreeRegressor with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             max_depth + min_samples_leaf to curb\n#             overfitting; criterion=\"absolute_error\"\n#             for outlier-robust splits.\n#             classifier; absolute_error is the easy\n#             outlier defense.\n#             relationships, RandomForest / GBM are\n#             better — senior tier.\n#\nfrom sklearn.tree import DecisionTreeRegressor\nreg = DecisionTreeRegressor(\n    max_depth=8,\n    min_samples_leaf=10,\n    criterion=\"absolute_error\",            # robust to outliers in y\n    random_state=42,\n)\nreg.fit(X_train, y_train)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of DecisionTreeRegressor — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             is rarely the best predictor — it produces\n#             step-function predictions. Use it for\n#             explanation only, then ensemble for\n#             prediction. Cost-complexity pruning\n#             (ccp_alpha) for principled size control.\n#             prediction\" rule is the same in regression\n#             as classification.\n#             genuinely useful in some domains (e.g.,\n#             monotonic step responses) — don't ensemble\n#             reflexively.\n#\nfrom sklearn.tree import DecisionTreeRegressor\nfrom sklearn.model_selection import GridSearchCV\ngrid = GridSearchCV(\n    DecisionTreeRegressor(random_state=42),\n    param_grid={\n        \"ccp_alpha\":         [0.0, 0.001, 0.01],\n        \"max_depth\":         [None, 6, 12],\n        \"min_samples_leaf\":  [1, 5, 20],\n    },\n    cv=5, scoring=\"neg_mean_squared_error\",\n)\ngrid.fit(X_train, y_train)\n# Decision rule (regression):\n#   single, interpretable predictor    -> small DecisionTreeRegressor\n#   smooth predictions on tabular       -> RandomForest / HistGBM\n#   genuinely step-function targets     -> single tree may be RIGHT\n#\n# Decision rule:\n#   need an interpretable model         -> DecisionTreeRegressor (max_depth<=5)\n#   need accurate, smooth predictions   -> RandomForestRegressor or HistGBM\n#   step-function ground truth          -> single tree is the right shape\n#   monotonic constraint                -> HistGBM(monotonic_cst=...)\n#   regularize complexity               -> ccp_alpha tuned in CV\n#   predicting beyond train range       -> linear model, NOT trees (extrapolate)\n#\n# Anti-pattern: using a single deep tree for production scoring\n#   max_depth=None overfits, MSE on test stays high, and predictions are\n#   piecewise-constant (no smoothing). The fix is almost always an\n#   ensemble: RandomForestRegressor or HistGradientBoostingRegressor;\n#   keep the single tree only as an interpretable explanation surface."
                  }
        ],
        tips: [
                  "Limit max_depth to prevent overfitting; typical range 3-5",
                  "Use min_samples_leaf to ensure minimum samples per leaf node",
                  "No scaling required; handles non-linear relationships naturally"
        ],
        mistake: "Using unlimited depth without validation; leads to overfitting.",
        shorthand: {
          verbose: "from sklearn.tree import DecisionTreeRegressor\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error, r2_score\nimport numpy as np",
          concise: "print(f'Feature importances: {model.feature_importances_}')",
        },
      },
      {
        id: "random_forest_regressor",
        fn: "RandomForestRegressor",
        desc: "Ensemble of regression trees with bagging.",
        category: "Ensemble Models",
        subtitle: "Robust tree ensemble",
        signature: "RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)",
        descLong: "Combines multiple decision trees with bootstrap sampling, reducing variance and overfitting while maintaining interpretability through feature importance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of RandomForestRegressor — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             permutation importance.\n#\nfrom sklearn.ensemble import RandomForestRegressor\nreg = RandomForestRegressor(n_estimators=100, random_state=42)\nreg.fit(X_train, y_train)\nreg.score(X_test, y_test)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of RandomForestRegressor — common patterns you'll see in production.\n# APPROACH  - Combine RandomForestRegressor with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             min_samples_leaf for regularization,\n#             oob_score=True, max_features=\"sqrt\"\n#             (default is 1.0 for regression — change it).\n#             biggest gain over RF defaults for\n#             regression.\n#             forests or HistGBM — senior tier.\n#\nfrom sklearn.ensemble import RandomForestRegressor\nreg = RandomForestRegressor(\n    n_estimators=300,\n    max_features=\"sqrt\",                     # default 1.0 for regr — switch\n    min_samples_leaf=5,\n    n_jobs=-1,\n    oob_score=True,\n    random_state=42,\n)\nreg.fit(X_train, y_train)\nprint(f\"OOB R^2: {reg.oob_score_:.3f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of RandomForestRegressor — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             usually wins on accuracy; keep RF when\n#             you need quantile predictions\n#             (RandomForestQuantileRegressor) or stable\n#             feature importances.\n#             empirically-supported claim in tabular ML;\n#             the quantile variant gives prediction\n#             intervals.\n#             RF is in scikit-learn-quantile-forest, not\n#             core sklearn.\n#\nfrom sklearn.ensemble import (\n    RandomForestRegressor, HistGradientBoostingRegressor)\n# Strongest sklearn tabular regressor\nhgb = HistGradientBoostingRegressor(\n    max_iter=500,\n    learning_rate=0.05,\n    max_leaf_nodes=31,\n    min_samples_leaf=20,\n    early_stopping=True,\n    random_state=42,\n).fit(X_train, y_train)\n# Keep RF when prediction intervals matter\n# from sklearn_quantile import RandomForestQuantileRegressor\n# qrf = RandomForestQuantileRegressor(q=[0.05, 0.5, 0.95], n_estimators=300)\n# qrf.fit(X_train, y_train)\n# preds = qrf.predict(X_test)            # shape (n, 3)\n# Decision rule (tabular regression, in order):\n#   1. HistGradientBoostingRegressor    (sklearn, fast, strong)\n#   2. LightGBM / XGBoost                (slightly better, more tuning)\n#   3. RandomForestRegressor              (no tuning, decent baseline)\n#   4. quantile RF                        (when uncertainty matters)\n#\n# Decision rule:\n#   any tabular regression baseline      -> RandomForestRegressor (n_estimators=300)\n#   need top accuracy                    -> HistGBM, LightGBM, or XGBoost\n#   need prediction intervals            -> quantile_forest / NGBoost\n#   memory-tight                         -> HistGBM (binned histograms)\n#   honest feature impact                -> permutation_importance on test\n#   target with long tail / outliers     -> log-transform y first, or HuberLoss\n#   small N (< 1k)                       -> Ridge / SVR may beat trees\n#\n# Anti-pattern: extrapolating outside the training range with RF\n#   Trees split on training quantiles — predictions on x values larger\n#   than any training row are clamped at the largest leaf mean. The\n#   model \"flatlines\" on extrapolation. If extrapolation matters, choose\n#   a linear model or add a linear residual on top of the forest."
                  }
        ],
        tips: [
                  "Increase n_estimators for better generalization; diminishing returns after 100",
                  "Feature importances show which variables drive predictions",
                  "Set n_jobs=-1 for parallel training on multi-core systems"
        ],
        mistake: "Using too few trees (n_estimators=10) for unstable predictions.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "svr_regressor",
        fn: "SVR (Support Vector Regressor)",
        desc: "Support Vector Regression for continuous targets.",
        category: "Kernel Methods",
        subtitle: "Margin-based regression",
        signature: "SVR(kernel='rbf', C=1.0, gamma='scale')",
        descLong: "Uses support vector machines for regression with kernel methods, effective for non-linear relationships with epsilon-tube loss function.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of SVR (Support Vector Regressor) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             feature engineering.\n#             best practices.\n#\nfrom sklearn.svm import SVR\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nreg = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"svr\",   SVR(kernel=\"rbf\")),\n])\nreg.fit(X_train, y_train)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of SVR (Support Vector Regressor) — common patterns you'll see in production.\n# APPROACH  - Combine SVR (Support Vector Regressor) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             (RBF width), epsilon (insensitive tube\n#             width). For regression, scale BOTH X and y\n#             (use TransformedTargetRegressor).\n#             TransformedTargetRegressor handles it\n#             cleanly.\n#\nimport numpy as np\nfrom sklearn.svm import SVR\nfrom sklearn.compose import TransformedTargetRegressor\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n# Scale both X and y; target scaling matters for SVR\nreg = TransformedTargetRegressor(\n    regressor=Pipeline([\n        (\"scale\", StandardScaler()),\n        (\"svr\",   SVR(kernel=\"rbf\", C=1.0,\n                       gamma=\"scale\", epsilon=0.1)),\n    ]),\n    transformer=StandardScaler(),\n)\nreg.fit(X_train, y_train)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of SVR (Support Vector Regressor) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             for N > ~10k switch to LinearSVR (linear\n#             only) or KernelRidge (closed-form). Tune\n#             C/gamma/epsilon in CV with the full\n#             pipeline so scaling refits per fold.\n#             fit\" notebook surprise; LinearSVR /\n#             KernelRidge are the standard escape\n#             hatches.\n#             non-linear small data; LinearSVR loses\n#             non-linear capacity.\n#\nimport numpy as np\nfrom sklearn.svm import SVR, LinearSVR\nfrom sklearn.kernel_ridge import KernelRidge\nfrom sklearn.compose import TransformedTargetRegressor\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import GridSearchCV\nbase = TransformedTargetRegressor(\n    regressor=Pipeline([\n        (\"scale\", StandardScaler()),\n        (\"svr\",   SVR(kernel=\"rbf\")),\n    ]),\n    transformer=StandardScaler(),\n)\ngrid = GridSearchCV(base, param_grid={\n    \"regressor__svr__C\":       [0.1, 1.0, 10.0],\n    \"regressor__svr__gamma\":   [\"scale\", 0.01, 0.1, 1.0],\n    \"regressor__svr__epsilon\": [0.01, 0.1, 0.5],\n}, cv=5, n_jobs=-1)\ngrid.fit(X_train, y_train)\n# Decision rule (regression by N):\n#   N <= 10k, non-linear        -> SVR(rbf)\n#   N <= 50k, linear OK          -> LinearSVR\n#   small N, closed-form fast    -> KernelRidge\n#   N >> 50k                      -> HistGradientBoostingRegressor\n#\n# Decision rule:\n#   N < 10k, non-linear, smooth target  -> SVR(kernel=\"rbf\")\n#   linear regression at any scale      -> LinearSVR or Ridge\n#   N < 1k, want closed-form non-linear -> KernelRidge\n#   N > 50k                             -> tree ensemble (HistGBM)\n#   y has long tail / outliers          -> wrap in TransformedTargetRegressor(log)\n#   scale of features differs           -> StandardScaler IN the Pipeline\n#   tune three knobs (C, gamma, eps)    -> GridSearchCV with Pipeline\n#\n# Anti-pattern: skipping y-scaling on heavy-tailed targets\n#   SVR depends on the absolute scale of y (epsilon-insensitive tube),\n#   so a target ranging 0..1e6 makes default epsilon meaningless and\n#   most points sit inside the tube — the model under-fits. Wrap in\n#   TransformedTargetRegressor(transformer=StandardScaler()) or log(1+y)."
                  }
        ],
        tips: [
                  "Always scale features before SVR; StandardScaler is essential",
                  "Tune C parameter: higher C fits training data more closely",
                  "Epsilon controls tube width around decision function"
        ],
        mistake: "Not scaling features, causing poor convergence and weak predictions.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
    ],
  },

  // ── Section 4: Model Evaluation ─────────────────────────────────────────
  {
    id: "evaluation",
    title: "Model Evaluation",
    entries: [
      {
        id: "accuracy_score",
        fn: "accuracy_score",
        desc: "Fraction of correct predictions.",
        category: "Classification Metrics",
        subtitle: "Overall correctness",
        signature: "accuracy_score(y_true, y_pred)",
        descLong: "Computes the proportion of correct predictions out of total samples, simple and intuitive but misleading for imbalanced datasets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of accuracy_score — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom sklearn.metrics import accuracy_score\naccuracy_score(y_true, y_pred)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of accuracy_score — common patterns you'll see in production.\n# APPROACH  - Combine accuracy_score with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             always compare to a baseline (majority\n#             class predictor); accuracy alone misleads\n#             at >70% imbalance.\n#             \"95% accuracy on a 95% majority class\".\n#             balanced_accuracy_score — senior.\n#\nfrom sklearn.metrics import accuracy_score\nimport numpy as np\n# Same as model.score for classifiers\nacc = clf.score(X_test, y_test)\nacc = accuracy_score(y_test, clf.predict(X_test))\n# Baseline — majority-class predictor\nmaj = np.bincount(y_train).argmax()\nbaseline = (y_test == maj).mean()\nprint(f\"acc {acc:.3f}  vs baseline {baseline:.3f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of accuracy_score — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             metric for imbalanced data. Reach for\n#             balanced_accuracy_score, F1, or\n#             roc_auc_score by default. accuracy is\n#             only honest when classes are roughly\n#             balanced.\n#             recall — handles imbalance correctly;\n#             explicit metric choice forces honest\n#             reporting.\n#             scale differences between classes —\n#             always pair with classification_report.\n#\nfrom sklearn.metrics import (\n    accuracy_score, balanced_accuracy_score, f1_score)\n# accuracy on a 95/5 imbalanced dataset\nacc      = accuracy_score(y_test, y_pred)            # ~0.95 trivially\nbal_acc  = balanced_accuracy_score(y_test, y_pred)   # honest\nf1       = f1_score(y_test, y_pred,\n                     average=\"macro\")                  # multiclass-friendly\n# Decision rule:\n#   classes ~equal frequency         -> accuracy_score (clf.score is fine)\n#   imbalanced classes               -> balanced_accuracy_score, F1, or AUC\n#   you care about a specific class  -> precision/recall/F1 with pos_label=\n#   ranking quality matters          -> roc_auc_score on predict_proba\n#   multilabel target                -> hamming_loss / subset accuracy\n#   need a per-class breakdown       -> classification_report\n#\n# Anti-pattern: reporting accuracy on a 99/1 fraud / churn dataset\n#   \"97% accurate\" sounds great until you notice always-predict-majority\n#   gives 99%. The model may be useless. On imbalance, default to\n#   balanced_accuracy or F1 (or AUC for ranking), and ALWAYS compare to\n#   a DummyClassifier(strategy=\"most_frequent\") baseline before celebrating."
                  }
        ],
        tips: [
                  "Use accuracy only on balanced datasets; misleading on imbalanced data",
                  "Combine with precision, recall, or F1-score for comprehensive evaluation",
                  "Baseline: compare to random classifier or majority class predictor"
        ],
        mistake: "Using accuracy as sole metric on imbalanced dataset; precision/recall more informative.",
        shorthand: {
          verbose: "from sklearn.metrics import accuracy_score\nimport numpy as np\ny_true = np.array([0, 1, 1, 0, 1, 0, 1, 1])\ny_pred = np.array([0, 1, 1, 0, 0, 0, 1, 0])",
          concise: "print(f'Model accuracy: {model_accuracy:.3f}')",
        },
      },
      {
        id: "precision_recall_f1",
        fn: "precision_score, recall_score, f1_score",
        desc: "Detailed classification metrics for class performance.",
        category: "Classification Metrics",
        subtitle: "Precision, recall, F1-score",
        signature: "precision_score(y_true, y_pred), recall_score(y_true, y_pred), f1_score(y_true, y_pred)",
        descLong: "Precision = TP/(TP+FP) — of the items we predicted positive, how many really were. Recall = TP/(TP+FN) — of the actual positives, how many did we catch. F1 is their harmonic mean. Essential for imbalanced and cost-sensitive problems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of precision_score, recall_score, f1_score — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             (TP+FN); F1 = harmonic mean.\n#             trio.\n#             multiclass.\n#\nfrom sklearn.metrics import precision_score, recall_score, f1_score\nprecision_score(y_true, y_pred)\nrecall_score(y_true, y_pred)\nf1_score(y_true, y_pred)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of precision_score, recall_score, f1_score — common patterns you'll see in production.\n# APPROACH  - Combine precision_score, recall_score, f1_score with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             multiclass (macro=unweighted, weighted=\n#             by support, micro=global), pos_label= to\n#             pick the positive class explicitly.\n#             argument; the macro-vs-weighted choice\n#             tells you whether you care about all\n#             classes equally or about overall volume.\n#             — senior.\n#\nfrom sklearn.metrics import f1_score, classification_report\n# Multiclass — pick average=\nf1_score(y_true, y_pred, average=\"macro\")        # all classes equally\nf1_score(y_true, y_pred, average=\"weighted\")     # by support\nf1_score(y_true, y_pred, average=\"micro\")        # = global accuracy\n# Per-class scores (no aggregation)\nf1_score(y_true, y_pred, average=None)           # array, one per class\n# Prefer classification_report for the full picture\nprint(classification_report(y_true, y_pred))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of precision_score, recall_score, f1_score — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             which to optimize. Maximizing F1 is fine\n#             when FP and FN cost roughly the same.\n#             Otherwise pick a threshold to optimize\n#             precision-at-recall or recall-at-\n#             precision; use precision_recall_curve to\n#             find it.\n#             the right answer when the default\n#             threshold (0.5) doesn't match the\n#             business objective.\n#             (LinearSVC) don't have it without\n#             calibration.\n#\nimport numpy as np\nfrom sklearn.metrics import precision_recall_curve, f1_score\nproba = clf.predict_proba(X_test)[:, 1]\nprec, rec, thr = precision_recall_curve(y_test, proba)\n# Optimize F1 across thresholds\nf1 = 2 * prec * rec / (prec + rec + 1e-12)\nbest = np.argmax(f1)\nbest_thr = thr[best] if best < len(thr) else 0.5\nprint(f\"best F1 {f1[best]:.3f} at threshold {best_thr:.3f}\")\n# Operating point: \"minimum precision 0.9, maximize recall\"\nok = prec >= 0.9\nbest_at_min_prec = np.argmax(rec[ok])\n# Decision rule:\n#   FP and FN cost equal              -> max F1\n#   FP costly (spam, fraud alerts)    -> set high precision threshold\n#   FN costly (cancer screening)      -> set high recall threshold\n#   ranking, not classification       -> roc_auc_score / average_precision\n#   multiclass with class imbalance   -> f1_score(average=\"macro\") or \"weighted\"\n#   multilabel target                 -> f1_score(average=\"samples\")\n#\n# Anti-pattern: tuning the decision threshold on the test set\n#   Sweeping thresholds and picking the one that maximizes F1 against\n#   y_test leaks test info into the model. Choose the threshold on a\n#   held-out validation fold (or via cross_val_predict + PR curve), then\n#   freeze it before computing the final F1 on test."
                  }
        ],
        tips: [
                  "Precision: \"of positive predictions, how many correct?\" (TP / (TP + FP))",
                  "Recall: \"of actual positives, how many found?\" (TP / (TP + FN))",
                  "F1-score: harmonic mean balancing precision and recall"
        ],
        mistake: "Optimizing only precision or only recall; F1-score or Precision-Recall curve better.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "confusion_matrix",
        fn: "confusion_matrix",
        desc: "Matrix of true positives, false positives, etc.",
        category: "Classification Metrics",
        subtitle: "TP, TN, FP, FN breakdown",
        signature: "confusion_matrix(y_true, y_pred)",
        descLong: "Tabulates true positives, true negatives, false positives, and false negatives, enabling detailed analysis of misclassification patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of confusion_matrix — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             of true vs predicted labels. Rows =\n#             actual, columns = predicted.\n#             just the score.\n#             visualization.\n#\nfrom sklearn.metrics import confusion_matrix\nconfusion_matrix(y_true, y_pred)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of confusion_matrix — common patterns you'll see in production.\n# APPROACH  - Combine confusion_matrix with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             for per-class recall, normalize=\"pred\"\n#             for per-class precision, ConfusionMatrix\n#             Display.from_estimator for one-line plot.\n#             flag; from_estimator skips the manual\n#             predict step.\n#             cost-sensitive analysis — senior.\n#\nimport matplotlib.pyplot as plt\nfrom sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay\n# Normalized — per-class recall (rows sum to 1)\nconfusion_matrix(y_true, y_pred, normalize=\"true\")\n# One-line plot\nConfusionMatrixDisplay.from_estimator(\n    clf, X_test, y_test, normalize=\"true\",\n    cmap=\"Blues\", values_format=\".2f\")\nplt.show()\n# Binary metrics derived from CM\ncm = confusion_matrix(y_true, y_pred)\ntn, fp, fn, tp = cm.ravel()\nspecificity = tn / (tn + fp)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of confusion_matrix — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             specify labels= explicitly to control\n#             order, normalize=\"true\" for per-class\n#             recall (most useful default), and pair\n#             with classification_report so people see\n#             both per-class metrics AND per-class\n#             error patterns.\n#             surprises; the matrix + report combo is\n#             the standard \"what's the model failing\n#             at\" diagnostic.\n#             (true/pred/all); if classes are\n#             imbalanced AND labels=None, sklearn\n#             auto-orders alphabetically, which is\n#             rarely what you want.\n#\nfrom sklearn.metrics import (\n    confusion_matrix, ConfusionMatrixDisplay,\n    classification_report)\nimport matplotlib.pyplot as plt\nCLASSES = [\"benign\", \"malignant\"]                    # explicit order\n# Normalized confusion matrix — per-class recall\ncm = confusion_matrix(y_true, y_pred,\n                       labels=CLASSES, normalize=\"true\")\nfig, ax = plt.subplots(figsize=(5, 5))\nConfusionMatrixDisplay(cm, display_labels=CLASSES).plot(\n    cmap=\"Blues\", values_format=\".2f\", ax=ax)\n# Pair with full per-class metrics\nprint(classification_report(y_true, y_pred, target_names=CLASSES))\n# Decision rule:\n#   exact counts                       -> normalize=None\n#   per-class recall                   -> normalize=\"true\"\n#   per-class precision                -> normalize=\"pred\"\n#   visual diagnostic                  -> ConfusionMatrixDisplay\n#   imbalanced classes                 -> ALWAYS normalize=\"true\"\n#   want pos_label first               -> labels=[positive, negative] explicitly\n#\n# Anti-pattern: reading raw counts on imbalanced classes\n#   With 990 negatives and 10 positives, 990 in the (neg, neg) cell looks\n#   \"great\" while 7 false negatives are hidden — yet recall is only 30%.\n#   Always plot with normalize=\"true\" or pair with classification_report.\n#   Also: passing labels= in inconsistent order between train and report\n#   silently swaps which class is \"positive\" — pin labels= explicitly."
                  }
        ],
        tips: [
                  "Visualize with ConfusionMatrixDisplay for better understanding",
                  "Analyze which classes are confused with each other",
                  "Calculate custom metrics from TP, TN, FP, FN components"
        ],
        mistake: "Not examining confusion matrix; may miss systematic misclassification patterns.",
        shorthand: {
          verbose: "from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay\nimport numpy as np\nimport matplotlib.pyplot as plt\ny_true = np.array([0, 1, 1, 0, 1, 0, 1, 1, 0, 0])",
          concise: "print(f'Sensitivity (Recall): {sensitivity:.3f}')",
        },
      },
      {
        id: "classification_report",
        fn: "classification_report",
        desc: "Summary of precision, recall, F1 per class.",
        category: "Classification Metrics",
        subtitle: "Per-class metrics summary",
        signature: "classification_report(y_true, y_pred)",
        descLong: "Provides precision, recall, F1-score, and support for each class, ideal for multiclass problems and comprehensive model evaluation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of classification_report — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             one printed table.\n#             classification model evaluation.\n#             target_names.\n#\nfrom sklearn.metrics import classification_report\nprint(classification_report(y_true, y_pred))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of classification_report — common patterns you'll see in production.\n# APPROACH  - Combine classification_report with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             for readable labels, output_dict=True\n#             for programmatic access, digits= for\n#             precision tuning.\n#             metrics into a tracking system.\n#             \"macro vs weighted\" diagnostic — senior.\n#\nfrom sklearn.metrics import classification_report\n# Readable labels\nprint(classification_report(\n    y_true, y_pred,\n    target_names=[\"benign\", \"malignant\"],\n    digits=3,\n))\n# As a dict — extract specific values\nreport = classification_report(y_true, y_pred, output_dict=True)\nreport[\"malignant\"][\"f1-score\"]\nreport[\"weighted avg\"][\"f1-score\"]\nreport[\"macro avg\"][\"f1-score\"]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of classification_report — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             tells you class-balance story; large gap\n#             == one class dominates the weighted\n#             metrics. Set zero_division=0 to avoid\n#             warnings when a class has no predictions.\n#             imbalance check; zero_division silences\n#             the noisy warning while keeping output\n#             honest.\n#             classes — pair with confusion_matrix\n#             to see which classes are zero.\n#\nfrom sklearn.metrics import classification_report\nreport = classification_report(\n    y_true, y_pred,\n    target_names=class_names,\n    digits=3,\n    output_dict=True,\n    zero_division=0,                     # silence \"no positive predictions\" noise\n)\nmacro    = report[\"macro avg\"][\"f1-score\"]\nweighted = report[\"weighted avg\"][\"f1-score\"]\ngap = weighted - macro\nif gap > 0.10:\n    print(\"WARNING: weighted >> macro — minority classes are weak\")\nelif gap < -0.10:\n    print(\"WARNING: macro >> weighted — majority class is weak\")\n# Log the per-class metrics for monitoring\n# log_metrics({f\"f1_{cls}\": report[cls][\"f1-score\"] for cls in class_names})\n# Decision rule:\n#   per-class precision/recall/F1   -> classification_report (always start here)\n#   programmatic access             -> output_dict=True\n#   readable per-class names        -> target_names=class_names\n#   imbalance check                 -> compare macro avg vs weighted avg\n#   class with no predictions       -> zero_division=0 (suppress warning)\n#   minority class is the goal      -> read its specific row, not the average\n#   confusion source explanation    -> pair with confusion_matrix\n#\n# Anti-pattern: using only the \"weighted avg\" line on imbalanced data\n#   The weighted average is dominated by the majority class — it can be\n#   high while the minority class has F1 ~ 0. Always read the per-class\n#   rows AND macro avg; a large weighted-vs-macro gap is the canonical\n#   \"your model only learned the majority class\" signal."
                  }
        ],
        tips: [
                  "Support shows number of samples for each class",
                  "Weighted average accounts for class imbalance",
                  "Use output_dict=True for programmatic access to metrics"
        ],
        mistake: "Not using target_names; output harder to interpret.",
        shorthand: {
          verbose: "from sklearn.metrics import classification_report\nimport numpy as np\ny_true = np.array([0, 1, 2, 0, 1, 2, 0, 1, 2, 0])\ny_pred = np.array([0, 1, 1, 0, 2, 2, 0, 1, 2, 0])",
          concise: "print(f'Weighted average F1: {report_dict[\"weighted avg\"][\"f1-score\"]:.3f}')",
        },
      },
      {
        id: "cross_val_score",
        fn: "cross_val_score",
        desc: "Evaluate model with k-fold cross-validation.",
        category: "Model Validation",
        subtitle: "k-fold CV scoring",
        signature: "cross_val_score(model, X, y, cv=5, scoring='accuracy')",
        descLong: "Performs k-fold cross-validation to estimate model generalization performance, reducing variance of single train-test split evaluation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of cross_val_score — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             gives mean + variance.\n#             scoring choice, or Pipeline integration.\n#\nfrom sklearn.model_selection import cross_val_score\nscores = cross_val_score(model, X, y, cv=5)\nprint(f\"{scores.mean():.3f} +/- {scores.std():.3f}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of cross_val_score — common patterns you'll see in production.\n# APPROACH  - Combine cross_val_score with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             scoring=, stratified KFold for\n#             classification, n_jobs= for parallel,\n#             cross_validate for multiple metrics at\n#             once.\n#             cleaner alternative when you want\n#             multiple scores at once.\n#\nfrom sklearn.model_selection import (\n    cross_val_score, cross_validate, StratifiedKFold)\n# Stratified for classification (preserves class balance per fold)\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\nscores = cross_val_score(model, X, y, cv=cv,\n                          scoring=\"f1_weighted\",\n                          n_jobs=-1)\n# Multiple metrics in one pass\nresults = cross_validate(model, X, y, cv=cv,\n                          scoring=[\"accuracy\", \"f1_weighted\", \"roc_auc\"],\n                          n_jobs=-1, return_train_score=True)\nprint(results[\"test_f1_weighted\"].mean())"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of cross_val_score — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             matches your data shape (Stratified for\n#             i.i.d. classification, GroupKFold when\n#             entities have multiple rows,\n#             TimeSeriesSplit for forecasts). Always\n#             use a Pipeline so preprocessing refits\n#             per fold.\n#             #1 cause of \"great CV, terrible\n#             production\" — leaky CV; Pipeline\n#             integration keeps preprocessing honest.\n#             early; GroupKFold requires a stable\n#             group_id; n_jobs=-1 doesn't help if the\n#             estimator already parallelizes.\n#\nfrom sklearn.model_selection import (\n    cross_val_score,\n    StratifiedKFold, GroupKFold, TimeSeriesSplit)\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"clf\",   model),\n])\n# Pick the splitter for your data\ncv_iid    = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\ncv_group  = GroupKFold(n_splits=5)                    # need groups=\ncv_time   = TimeSeriesSplit(n_splits=5)               # always train < test in time\nscores = cross_val_score(pipe, X, y, cv=cv_group,\n                          groups=df[\"customer_id\"],\n                          scoring=\"roc_auc\", n_jobs=-1)\n# Decision rule:\n#   i.i.d. classification          -> StratifiedKFold\n#   one entity has many rows       -> GroupKFold (no leakage)\n#   classification + groups        -> StratifiedGroupKFold\n#   time series / forecasting      -> TimeSeriesSplit\n#   regression, i.i.d.             -> KFold (or just cv=5)\n#   tiny dataset (N < 100)         -> LeaveOneOut or KFold(n_splits=10)\n#   never                          -> KFold on time-series data\n#\n# Anti-pattern: cross-validating a model AFTER preprocessing X\n#   X_scaled = scaler.fit_transform(X); cross_val_score(model, X_scaled, y)\n#   leaks each fold's validation distribution into the scaler. The\n#   reported score is biased high. Always pass a Pipeline that contains\n#   the scaler so each fold refits preprocessing on its own train slice."
                  }
        ],
        tips: [
                  "cv=5 is standard; use cv=10 for smaller datasets",
                  "stratifiedKFold maintains class balance in each fold",
                  "Try multiple scoring metrics: accuracy, f1, roc_auc, precision, recall",
                  "When the same entity appears in many rows, use `GroupKFold` (or `StratifiedGroupKFold`) so a fold cannot leak the same user into both sides",
                  "For time-series, hand `TimeSeriesSplit` to `cv=` — KFold on temporal data leaks the future and gives optimistic scores"
        ],
        mistake: "Using single train-test split instead of cross-validation for variance estimation.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "roc_auc_score",
        fn: "roc_auc_score, roc_curve",
        desc: "ROC AUC for binary classification performance.",
        category: "Classification Metrics",
        subtitle: "Area under ROC curve",
        signature: "roc_auc_score(y_true, y_score), roc_curve(y_true, y_score)",
        descLong: "Measures classification performance across all thresholds via ROC curve (true positive vs false positive rates), robust to class imbalance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of roc_auc_score, roc_curve — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             roc_auc_score. AUC = 0.5 random, 1.0\n#             perfect.\n#             imbalance.\n#             threshold-tuning.\n#\nfrom sklearn.metrics import roc_auc_score\nproba = clf.predict_proba(X_test)[:, 1]\nroc_auc_score(y_test, proba)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of roc_auc_score, roc_curve — common patterns you'll see in production.\n# APPROACH  - Combine roc_auc_score, roc_curve with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             pick a threshold that maximizes Youden's\n#             J statistic (TPR - FPR) for balanced\n#             cost; multi_class= for multiclass AUC.\n#             curve is the right answer when 0.5 isn't\n#             optimal.\n#             tradeoff for highly imbalanced data —\n#             senior tier.\n#\nimport numpy as np\nfrom sklearn.metrics import roc_auc_score, roc_curve\nproba = clf.predict_proba(X_test)[:, 1]\n# Curve + Youden's J optimal threshold\nfpr, tpr, thr = roc_curve(y_test, proba)\nj = tpr - fpr\nbest_thr = thr[np.argmax(j)]\nprint(f\"AUC: {roc_auc_score(y_test, proba):.3f}, \"\n       f\"best threshold: {best_thr:.3f}\")\n# Multiclass — one-vs-rest by default\nproba_mc = clf.predict_proba(X_test)\nroc_auc_score(y_test, proba_mc, multi_class=\"ovr\",\n              average=\"macro\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of roc_auc_score, roc_curve — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             on heavily imbalanced data (it counts a\n#             large baseline of true negatives that\n#             aren't interesting). Use Precision-\n#             Recall AUC (average_precision_score)\n#             instead. Calibrate probabilities before\n#             setting thresholds.\n#             positive class is rare (fraud, ad\n#             clicks); calibration ensures the chosen\n#             threshold actually corresponds to the\n#             intended FP rate in production.\n#             baseline of 0.5); calibration adds\n#             compute and a held-out set requirement.\n#\nfrom sklearn.metrics import (\n    roc_auc_score, average_precision_score)\nfrom sklearn.calibration import CalibratedClassifierCV\n# Imbalanced data — PR-AUC is more honest\nap = average_precision_score(y_test, proba)         # Precision-Recall AUC\n# Calibration before threshold tuning\ncal = CalibratedClassifierCV(clf, method=\"isotonic\", cv=5)\ncal.fit(X_train, y_train)\nproba_cal = cal.predict_proba(X_test)[:, 1]\n# Now proba_cal corresponds to true probabilities\n# Decision rule:\n#   balanced classes, ranking quality      -> roc_auc_score\n#   highly imbalanced (rare positives)     -> average_precision_score\n#   threshold matters in production        -> calibrate first\n#   multiclass                             -> roc_auc_score(multi_class=\"ovr\")\n#   need a single number for tuning        -> AUC works fine as scoring=\n#   compare across imbalance ratios        -> PR-AUC, NOT ROC-AUC\n#\n# Anti-pattern: feeding clf.predict() to roc_auc_score\n#   Hard 0/1 labels collapse the curve to two points and the AUC degenerates\n#   to (TPR + (1-FPR)) / 2. roc_auc_score expects scores or probabilities:\n#   pass clf.predict_proba(X)[:, 1] (binary) or decision_function(X). For\n#   models without predict_proba (LinearSVC), wrap in CalibratedClassifierCV."
                  }
        ],
        tips: [
                  "ROC AUC of 0.5 = random, 1.0 = perfect classification",
                  "Robust to class imbalance unlike accuracy",
                  "Use predict_proba() output as y_score, not hard predictions",
                  "On highly imbalanced problems (rare positives), ROC AUC stays optimistic — switch to `average_precision_score` (PR-AUC) for a stricter signal"
        ],
        mistake: "Using hard predictions instead of probabilities for roc_auc_score.",
        shorthand: {
          verbose: "from sklearn.metrics import roc_auc_score, roc_curve\nimport numpy as np\ny_true = np.array([0, 1, 1, 0, 1, 0, 1, 1, 0, 0])\ny_scores = np.array([0.1, 0.8, 0.9, 0.2, 0.7, 0.3, 0.85, 0.75, 0.15, 0.25])",
          concise: "print(f'\\nOptimal threshold: {optimal_threshold:.3f}')",
        },
      },
      {
        id: "mean_squared_error",
        fn: "mean_squared_error",
        desc: "Average squared prediction error.",
        category: "Regression Metrics",
        subtitle: "MSE and RMSE",
        signature: "mean_squared_error(y_true, y_pred, squared=False)",
        descLong: "Calculates average of squared differences between predictions and actuals, penalizing large errors; RMSE when squared=False.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of mean_squared_error — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             of MSE, in original units. MAE: mean\n#             absolute error.\n#\nimport numpy as np\nfrom sklearn.metrics import (\n    mean_squared_error, mean_absolute_error)\nmse  = mean_squared_error(y_true, y_pred)\nrmse = np.sqrt(mse)                                  # root_mean_squared_error in 1.4+\nmae  = mean_absolute_error(y_true, y_pred)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of mean_squared_error — common patterns you'll see in production.\n# APPROACH  - Combine mean_squared_error with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             large errors more (squared); MAE is\n#             outlier-robust. RMSE is the most\n#             interpretable for stakeholders (same\n#             units as y).\n#             the \"we optimized RMSE but care about\n#             MAE\" mismatch.\n#             (MAPE) or quantile loss — senior.\n#\nimport numpy as np\nfrom sklearn.metrics import (\n    mean_squared_error, mean_absolute_error,\n    root_mean_squared_error)        # sklearn >= 1.4\n# Standard regression metric panel\nmse  = mean_squared_error(y_test, y_pred)\nrmse = root_mean_squared_error(y_test, y_pred)        # or np.sqrt(mse)\nmae  = mean_absolute_error(y_test, y_pred)\nprint(f\"RMSE {rmse:.3f}  MAE {mae:.3f}  MSE {mse:.3f}\")\n# Decision rule:\n#   want stakeholders to read it    -> RMSE (same units as y)\n#   outlier-robust                   -> MAE\n#   penalize large errors most        -> MSE\n#   optimization target                -> MSE / RMSE (smooth, differentiable)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of mean_squared_error — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             aware (MAPE for relative error), domain\n#             metrics (mean_pinball_loss for quantile\n#             regression), residual analysis to spot\n#             heteroscedasticity / bias. Always\n#             compare to a baseline (mean predictor).\n#             error matters more than absolute (sales\n#             forecasting); pinball loss is the\n#             metric for quantile predictions; the\n#             baseline-compare habit catches \"model\n#             is worse than predicting the mean\".\n#             pinball loss requires multiple\n#             quantiles; baselines are dataset-\n#             specific.\n#\nimport numpy as np\nfrom sklearn.metrics import (\n    mean_squared_error, mean_absolute_error,\n    mean_absolute_percentage_error, mean_pinball_loss)\n# Relative error (sales / financial forecasting)\nmape = mean_absolute_percentage_error(y_test, y_pred)\n# Quantile-regression score\npinball_50 = mean_pinball_loss(y_test, y_pred_q50, alpha=0.5)\npinball_90 = mean_pinball_loss(y_test, y_pred_q90, alpha=0.9)\n# Baseline — predict the mean\nbaseline_pred = np.full_like(y_test, y_train.mean())\nbaseline_rmse = np.sqrt(mean_squared_error(y_test, baseline_pred))\nprint(f\"model RMSE {np.sqrt(mean_squared_error(y_test, y_pred)):.2f}\")\nprint(f\"baseline    {baseline_rmse:.2f}\")\n# Decision rule:\n#   absolute error in y units       -> RMSE / MAE\n#   relative / percentage error     -> MAPE (avoid near y=0)\n#   quantile predictions            -> mean_pinball_loss(alpha=q)\n#   stakeholder reporting           -> RMSE + a baseline comparison\n#   outliers shouldn't dominate     -> MAE (or HuberLoss training)\n#   you want to penalize big misses -> MSE / RMSE (squared loss)\n#   compare across target scales    -> MAPE or normalized RMSE\n#\n# Anti-pattern: comparing RMSE values on differently-scaled targets\n#   \"Model A's RMSE is 50, model B's is 0.5 — A is worse\" is wrong if A\n#   predicts revenue ($) and B predicts log-revenue. RMSE is in target\n#   units; always compare to the target's std or use R^2 / NRMSE for\n#   cross-target comparison. Also: compare to a mean-predictor baseline\n#   before declaring a model \"good\"."
                  }
        ],
        tips: [
                  "MSE penalizes large errors more; RMSE in original units",
                  "MAE more interpretable; less sensitive to outliers",
                  "Lower is better; compare to baseline (e.g., mean of y_true)"
        ],
        mistake: "Using MSE alone; combine with MAE or RMSE for better understanding.",
        shorthand: {
          verbose: "from sklearn.metrics import mean_squared_error, mean_absolute_error\nimport numpy as np\ny_true = np.array([3.0, -0.5, 2.0, 7.0])\ny_pred = np.array([2.5, 0.0, 2.0, 8.0])",
          concise: "print(f'\\nManual MSE: {manual_mse:.3f}')",
        },
      },
      {
        id: "r2_score",
        fn: "r2_score",
        desc: "Coefficient of determination (R²).",
        category: "Classification Metrics",
        subtitle: "Variance explained",
        signature: "r2_score(y_true, y_pred)",
        descLong: "Measures proportion of variance explained by model (0-1); 1.0 is perfect, 0.0 means no better than mean baseline, negative means worse.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of r2_score — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             negative = worse than predicting mean.\n#             model explain?\" metric.\n#             comparable across datasets.\n#\nfrom sklearn.metrics import r2_score\nr2_score(y_true, y_pred)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of r2_score — common patterns you'll see in production.\n# APPROACH  - Combine r2_score with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             returns R^2 for regressors; compare to\n#             baseline (mean predictor); explicit\n#             multi-output via multioutput=\n#             \"raw_values\".\n#             code uses; multi-output is the right\n#             tool for vector-valued y.\n#             \"R^2 across datasets\" warning — senior.\n#\nfrom sklearn.metrics import r2_score\n# Same as the regressor's score method\nreg.score(X_test, y_test)\nr2_score(y_test, reg.predict(X_test))\n# Multi-output\nr2_score(Y_test, Y_pred, multioutput=\"raw_values\")    # per-target\nr2_score(Y_test, Y_pred, multioutput=\"uniform_average\")\nr2_score(Y_test, Y_pred,\n          multioutput=\"variance_weighted\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of r2_score — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             R^2 across datasets (the variance\n#             baseline differs); use adjusted R^2\n#             when comparing models with different\n#             feature counts; on time series, R^2 can\n#             be artificially high if the target has\n#             a strong trend.\n#             \"model A on dataset 1 has R^2=0.9, model\n#             B on dataset 2 has R^2=0.8, A is\n#             better\" fallacy; adjusted R^2 penalizes\n#             extra features fairly.\n#             — compute manually; trend dominance on\n#             time series is sometimes desired.\n#\nimport numpy as np\nfrom sklearn.metrics import r2_score\nr2 = r2_score(y_test, y_pred)\nn  = len(y_test)\np  = X_test.shape[1]\nadj_r2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)\nprint(f\"R^2 {r2:.3f}  adjusted {adj_r2:.3f}\")\n# Time-series caveat: detrend before computing R^2 if\n# the target has a strong trend\ny_trend = np.polyval(np.polyfit(t, y_test, 1), t)\nr2_residual = r2_score(y_test - y_trend, y_pred - y_trend)\n# Decision rule:\n#   single dataset, regression baseline     -> r2_score (or .score())\n#   compare models with different #features -> adjusted R^2\n#   compare across datasets                 -> use RMSE / MAE instead\n#   time-series with strong trend           -> detrend or quote residual R^2\n#   negative R^2                            -> model is worse than the mean\n#   need a single intuitive number          -> R^2 still works as a summary\n#\n# Anti-pattern: trusting training R^2 as a quality signal\n#   Training R^2 only goes UP as you add features (even noise ones); it\n#   doesn't measure generalization. Always report cross-validated R^2 on\n#   held-out folds. Also: never compare R^2 across datasets — variance\n#   in y differs, so the baseline differs; use RMSE/MAE for that compare."
                  }
        ],
        tips: [
                  "R² = 1 perfect, 0 no improvement over mean baseline, <0 worse than mean",
                  "Not scale-invariant; difficult to compare across datasets",
                  "Adjusted R² penalizes additional features for multivariate comparison"
        ],
        mistake: "Comparing R² scores across different datasets; use adjusted R² or RMSE instead.",
        shorthand: {
          verbose: "from sklearn.metrics import r2_score\nimport numpy as np\ny_true = np.array([3.0, -0.5, 2.0, 7.0, 4.5])\ny_pred = np.array([2.5, 0.0, 2.0, 8.0, 4.0])",
          concise: "print(f'\\nBaseline (mean) R²: {baseline_r2:.3f}')",
        },
      },
    ],
  },

  // ── Section 5: Hyperparameter Tuning ─────────────────────────────────────────
  {
    id: "tuning",
    title: "Hyperparameter Tuning",
    entries: [
      {
        id: "grid_search_cv",
        fn: "GridSearchCV",
        desc: "Exhaustive search over parameter grid.",
        category: "Hyperparameter Search",
        subtitle: "Brute-force grid search",
        signature: "GridSearchCV(estimator, param_grid, cv=5, scoring='accuracy')",
        descLong: "Tests all combinations of hyperparameters in a specified grid with cross-validation, identifying the best parameters but computationally expensive.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of GridSearchCV — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             explores every combination, picks the\n#             best by mean CV score.\n#             pattern.\n#             or n_jobs.\n#\nfrom sklearn.model_selection import GridSearchCV\ngrid = GridSearchCV(model, param_grid={\"max_depth\": [3, 5, 10]},\n                     cv=5)\ngrid.fit(X_train, y_train)\ngrid.best_params_, grid.best_score_"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of GridSearchCV — common patterns you'll see in production.\n# APPROACH  - Combine GridSearchCV with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             across a full Pipeline using \"step__param\"\n#             notation, n_jobs=-1 for parallel,\n#             refit=True (default) gives you the best\n#             model fit on full training data.\n#             the leakage-proof tuning pattern.\n#             for big spaces — senior tier.\n#\nfrom sklearn.model_selection import GridSearchCV\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"clf\",   LogisticRegression(max_iter=1000)),\n])\ngrid = GridSearchCV(\n    pipe,\n    param_grid={\n        \"scale__with_mean\": [True, False],\n        \"clf__C\":            [0.01, 0.1, 1.0, 10.0],\n        \"clf__penalty\":      [\"l1\", \"l2\"],\n    },\n    cv=5, scoring=\"f1_weighted\",\n    n_jobs=-1,                              # parallel\n)\ngrid.fit(X_train, y_train)\nprint(grid.best_params_)\nbest_model = grid.best_estimator_           # refit on full train"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of GridSearchCV — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             GridSearch is fine for <100 combos;\n#             switch to RandomizedSearchCV or\n#             HalvingGridSearchCV when the space is\n#             large. Use cv=Stratified/Group/Time as\n#             appropriate. cv_results_ as a DataFrame\n#             gives you the full search history.\n#             GridSearch for large spaces;\n#             cv_results_ DataFrame is the right tool\n#             for \"why did the search choose this?\"\n#             the experimental import; cv choice\n#             depends on data shape (i.i.d. vs\n#             grouped vs time series).\n#\nimport pandas as pd\nfrom sklearn.experimental import enable_halving_search_cv  # noqa\nfrom sklearn.model_selection import HalvingGridSearchCV\nfrom sklearn.model_selection import StratifiedKFold\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\n# Halving — much faster for big grids\nsearch = HalvingGridSearchCV(\n    pipe,\n    param_grid={\n        \"clf__C\":            [0.01, 0.1, 1.0, 10.0, 100.0],\n        \"clf__penalty\":      [\"l1\", \"l2\"],\n        \"scale__with_mean\":  [True, False],\n    },\n    cv=cv, scoring=\"f1_weighted\", n_jobs=-1,\n    factor=3,                                # eliminate 2/3 of candidates per round\n    random_state=42,\n)\nsearch.fit(X_train, y_train)\n# Inspect the search history\nresults = pd.DataFrame(search.cv_results_)\nresults.sort_values(\"mean_test_score\", ascending=False).head(5)\n# Decision rule (search size by combos):\n#   <= 50 combos                -> GridSearchCV\n#   50 .. 1000 combos            -> HalvingGridSearchCV (factor=3)\n#   1000+, distributions of params -> RandomizedSearchCV (n_iter=)\n#\n# Decision rule:\n#   <= 50 combos, exhaustive needed   -> GridSearchCV\n#   50..1000 combos                   -> HalvingGridSearchCV(factor=3)\n#   continuous / huge space           -> RandomizedSearchCV(n_iter=50)\n#   sample-efficient, costly fits     -> Optuna / scikit-optimize (Bayesian)\n#   data has groups                   -> cv=GroupKFold(...) + groups=\n#   forecasting / time series         -> cv=TimeSeriesSplit\n#   need both train and val scores    -> return_train_score=True\n#\n# Anti-pattern: tuning a model that includes preprocessing fitted outside CV\n#   GridSearchCV refits whatever you pass to it per fold, so a scaler\n#   sitting OUTSIDE leaks the validation distribution into the training\n#   features. Always pass a Pipeline. Also: tuning on all of X then\n#   evaluating on the same X gives a pointlessly inflated score — keep\n#   a held-out test set the search never touches."
                  }
        ],
        tips: [
                  "Use n_jobs=-1 for parallel computation on all cores",
                  "Start with coarse grid, refine around best values",
                  "Set cv=10 for smaller datasets, cv=5 for larger"
        ],
        mistake: "Searching too broad parameter space; narrows to reasonable ranges first.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "randomized_search_cv",
        fn: "RandomizedSearchCV",
        desc: "Random sample of parameter space.",
        category: "Hyperparameter Search",
        subtitle: "Random parameter sampling",
        signature: "RandomizedSearchCV(estimator, param_distributions, n_iter=10, cv=5)",
        descLong: "Randomly samples hyperparameters from distributions, more efficient than GridSearchCV for large parameter spaces.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of RandomizedSearchCV — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             distributions instead of trying all.\n#             search spaces.\n#             distributions or n_iter sizing.\n#\nfrom sklearn.model_selection import RandomizedSearchCV\nsearch = RandomizedSearchCV(model, param_distributions=params,\n                             n_iter=20, cv=5, random_state=42)\nsearch.fit(X_train, y_train)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of RandomizedSearchCV — common patterns you'll see in production.\n# APPROACH  - Combine RandomizedSearchCV with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             loguniform, randint) for continuous and\n#             discrete parameters; n_iter typically\n#             20-50 for good coverage.\n#             for hyperparameters that span orders of\n#             magnitude (C, learning_rate, alpha).\n#             — senior tier.\n#\nfrom sklearn.model_selection import RandomizedSearchCV\nfrom scipy.stats import randint, uniform, loguniform\nparam_dist = {\n    \"n_estimators\":      randint(50, 500),\n    \"max_depth\":         [3, 5, 10, None],\n    \"min_samples_split\": randint(2, 20),\n    \"max_features\":      [\"sqrt\", \"log2\"],\n}\n# For C, learning_rate, alpha — log scale\n# \"C\": loguniform(1e-3, 1e3)\nsearch = RandomizedSearchCV(\n    estimator, param_dist,\n    n_iter=30,                              # 30 random combos\n    cv=5, scoring=\"f1_weighted\",\n    n_jobs=-1, random_state=42,\n)\nsearch.fit(X_train, y_train)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of RandomizedSearchCV — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             is the default for >100 combos;\n#             HalvingRandomSearchCV is faster still\n#             for huge spaces; for serious tuning use\n#             Optuna / Hyperopt for Bayesian-guided\n#             search that beats random.\n#             Random and Grid; Optuna is the\n#             industry-standard for >$100k of compute.\n#             (sometimes wrongly); Optuna is a\n#             dependency.\n#\nfrom sklearn.experimental import enable_halving_search_cv  # noqa\nfrom sklearn.model_selection import HalvingRandomSearchCV\nfrom scipy.stats import loguniform, randint\nsearch = HalvingRandomSearchCV(\n    estimator,\n    param_distributions={\n        \"C\":            loguniform(1e-3, 1e3),\n        \"max_depth\":    randint(3, 20),\n        \"n_estimators\": randint(100, 1000),\n    },\n    n_candidates=\"exhaust\",                 # use all of the budget\n    factor=3,\n    cv=5, scoring=\"f1_weighted\",\n    random_state=42, n_jobs=-1,\n)\nsearch.fit(X_train, y_train)\n# When sklearn isn't enough — Bayesian search\n# import optuna\n# def objective(trial):\n#     params = {\"C\": trial.suggest_loguniform(\"C\", 1e-3, 1e3),\n#                \"max_depth\": trial.suggest_int(\"max_depth\", 3, 20)}\n#     return cross_val_score(model.set_params(**params), X, y, cv=5).mean()\n# study = optuna.create_study(direction=\"maximize\")\n# study.optimize(objective, n_trials=100)\n# Decision rule (n_combinations of the search space):\n#   <= 50              -> GridSearchCV\n#   50 .. 1000          -> RandomizedSearchCV (n_iter=20-50)\n#   > 1000              -> HalvingRandomSearchCV\n#   serious budget      -> Optuna (Bayesian / TPE)\n#\n# Decision rule:\n#   small grid (< 50)                -> GridSearchCV (exhaustive)\n#   medium grid (50..1000)           -> RandomizedSearchCV(n_iter=50)\n#   continuous params, large space   -> RandomizedSearchCV with scipy.stats\n#   huge space, fixed compute budget -> HalvingRandomSearchCV\n#   compute is expensive             -> Optuna / Hyperopt (Bayesian)\n#   want to tune learning rate (LR)  -> loguniform, NOT linear uniform\n#   integer hyperparameters          -> scipy.stats.randint\n#\n# Anti-pattern: using RandomizedSearchCV with default uniform on log-scale params\n#   For C, gamma, learning_rate, alpha: a uniform(1e-3, 1e3) wastes 99%\n#   of trials in the >1.0 region. Use scipy.stats.loguniform(1e-3, 1e3)\n#   so each decade gets equal sampling. Also: leaving n_iter=10 (default)\n#   on a 5-dim space rarely covers it — bump n_iter to 50-200 trials."
                  }
        ],
        tips: [
                  "More efficient than GridSearchCV for large spaces",
                  "Use scipy.stats distributions (randint, uniform, expon) for parameter ranges",
                  "Set n_iter based on computational budget"
        ],
        mistake: "Using only 5-10 iterations; typically need 20-50 for good coverage.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "learning_curve",
        fn: "learning_curve",
        desc: "Plot training and validation scores vs dataset size.",
        category: "Diagnostic Curves",
        subtitle: "Training size impact",
        signature: "learning_curve(estimator, X, y, cv=5, train_sizes=np.linspace(0.1, 1.0, 10))",
        descLong: "Analyzes model performance as training set size increases, diagnosing bias (underfitting) vs variance (overfitting) problems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of learning_curve — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             dataset sizes. Diagnoses bias vs\n#             variance.\n#             diagnostic.\n#\nfrom sklearn.model_selection import learning_curve\nimport numpy as np\ntrain_sizes, train_scores, val_scores = learning_curve(\n    model, X, y, cv=5,\n    train_sizes=np.linspace(0.1, 1.0, 10))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of learning_curve — common patterns you'll see in production.\n# APPROACH  - Combine learning_curve with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             across folds, plot train + val with\n#             shaded std band, interpret the gap.\n#             whole reason to plot the curve.\n#             diagnosis fires — senior tier.\n#\nimport numpy as np, matplotlib.pyplot as plt\nfrom sklearn.model_selection import learning_curve\nts, train_s, val_s = learning_curve(\n    model, X, y,\n    train_sizes=np.linspace(0.1, 1.0, 10),\n    cv=5, n_jobs=-1, random_state=42,\n)\ntrain_m, train_sd = train_s.mean(1), train_s.std(1)\nval_m,   val_sd   = val_s.mean(1),   val_s.std(1)\nplt.plot(ts, train_m, label=\"train\")\nplt.fill_between(ts, train_m - train_sd, train_m + train_sd, alpha=0.2)\nplt.plot(ts, val_m, label=\"val\")\nplt.fill_between(ts, val_m - val_sd, val_m + val_sd, alpha=0.2)\nplt.xlabel(\"Training size\"); plt.ylabel(\"Score\"); plt.legend()\n# Interpretation:\n#   large gap, train high             -> overfitting (variance)\n#   both low, gap small                -> underfitting (bias)\n#   curves still rising at full data    -> more data would help"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of learning_curve — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             to a different fix. Overfitting -> add\n#             regularization or simplify model.\n#             Underfitting -> increase model capacity\n#             or feature richness. Curves still rising\n#             -> collect more data. Plateau low ->\n#             feature engineering needed.\n#             prevents the \"I'll just try a different\n#             model\" wandering.\n#             fixes apply.\n#\nimport numpy as np, matplotlib.pyplot as plt\nfrom sklearn.model_selection import learning_curve\n# Use a Pipeline so preprocessing fits per fold\nts, train_s, val_s = learning_curve(\n    pipe, X, y, cv=5,\n    train_sizes=np.linspace(0.1, 1.0, 10),\n    n_jobs=-1, random_state=42,\n)\ntrain_m, val_m = train_s.mean(1), val_s.mean(1)\ngap = train_m - val_m\n# Diagnose\nfinal_gap = gap[-1]\nfinal_val = val_m[-1]\nslope_at_end = (val_m[-1] - val_m[-3]) / (ts[-1] - ts[-3])\nif final_gap > 0.10 and train_m[-1] > 0.85:\n    print(\"OVERFITTING -> add regularization, more data, or simpler model\")\nelif final_val < 0.60 and final_gap < 0.05:\n    print(\"UNDERFITTING -> increase model capacity or features\")\nelif slope_at_end > 0.005:\n    print(\"STILL LEARNING -> collect more data\")\nelse:\n    print(\"PLATEAUED -> feature engineering / different algorithm\")\n# Decision rule:\n#   train high, val low, big gap        -> overfitting (regularize / shrink)\n#   both low, small gap                  -> underfitting (more capacity)\n#   val curve still rising at full N     -> collect more data\n#   both flat, gap tiny                  -> feature eng. or new algorithm\n#   curves noisy across folds            -> raise n_splits or shuffle=True\n#   long fits, want a fast read          -> use fewer train_sizes (5)\n#   compare two models                   -> overlay both learning curves\n#\n# Anti-pattern: drawing a learning curve with the model fit OUTSIDE a Pipeline\n#   If preprocessing happens before learning_curve, every train_sizes\n#   slice gets the SAME (whole-data) preprocessing — train scores are\n#   inflated and the diagnosis is wrong. Pass a Pipeline so each slice\n#   refits its own scaler/encoder. Also: using shuffle=False on grouped\n#   data hides leakage that the production model will hit."
                  }
        ],
        tips: [
                  "Large gap between train and val = overfitting; use regularization",
                  "Low training score = underfitting; increase model complexity",
                  "Converging curves suggest sufficient data"
        ],
        mistake: "Not plotting curves; hard to diagnose bias-variance tradeoff visually.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "validation_curve",
        fn: "validation_curve",
        desc: "Plot scores vs single hyperparameter.",
        category: "Hyperparameter Search",
        subtitle: "Hyperparameter impact",
        signature: "validation_curve(estimator, X, y, param_name, param_range, cv=5)",
        descLong: "Shows how train and validation scores change with one hyperparameter, identifying optimal value and overfitting region.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of validation_curve — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             train + val scores. Find the sweet spot.\n#             function of complexity.\n#             plotting.\n#\nfrom sklearn.model_selection import validation_curve\nimport numpy as np\ntrain_s, val_s = validation_curve(\n    model, X, y, param_name=\"max_depth\",\n    param_range=np.arange(1, 15), cv=5)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of validation_curve — common patterns you'll see in production.\n# APPROACH  - Combine validation_curve with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             range that spans \"too simple\" to \"too\n#             complex\"; plot train + val; pick the val\n#             peak.\n#             \"what should this hyperparameter be?\"\n#             answer.\n#             searching multiple params at once —\n#             senior.\n#\nimport numpy as np, matplotlib.pyplot as plt\nfrom sklearn.model_selection import validation_curve\ndepths = np.arange(1, 16)\ntrain_s, val_s = validation_curve(\n    model, X, y,\n    param_name=\"max_depth\", param_range=depths,\n    cv=5, n_jobs=-1,\n)\ntrain_m, val_m = train_s.mean(1), val_s.mean(1)\nplt.plot(depths, train_m, label=\"train\")\nplt.plot(depths, val_m, label=\"val\")\nplt.xlabel(\"max_depth\"); plt.ylabel(\"score\"); plt.legend()\nbest = depths[np.argmax(val_m)]\nprint(f\"Optimal max_depth: {best}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of validation_curve — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             with a Pipeline (so preprocessing fits\n#             per fold), use \"step__param\" notation\n#             for parameter names, prefer log-spaced\n#             ranges for hyperparameters that span\n#             magnitudes (C, alpha, learning_rate).\n#             leakage-free; log-spaced ranges expose\n#             the typical U-shaped train/val gap.\n#             interactions — for that, GridSearch with\n#             cv_results_ visualization wins.\n#\nimport numpy as np\nfrom sklearn.model_selection import validation_curve\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"clf\",   LogisticRegression(max_iter=1000)),\n])\n# Log-spaced range for C\nC_range = np.logspace(-3, 3, 13)\ntrain_s, val_s = validation_curve(\n    pipe, X, y,\n    param_name=\"clf__C\",                    # step__param notation\n    param_range=C_range,\n    cv=5, scoring=\"f1_weighted\", n_jobs=-1,\n)\nbest_C = C_range[np.argmax(val_s.mean(1))]\n# Decision rule:\n#   one parameter to tune, want to SEE the curve   -> validation_curve\n#   multiple parameters, just want best combo      -> GridSearchCV\n#   parameter spans orders of magnitude            -> np.logspace range\n#   parameter is integer count                     -> np.arange / list\n#   parameter is regularization strength           -> np.logspace(-3, 3, 13)\n#   need both train and val side-by-side           -> validation_curve does this\n#   parameter inside Pipeline                      -> use \"step__param\" name\n#\n# Anti-pattern: picking the parameter value that maximizes the TRAIN curve\n#   It looks tempting because the train score keeps rising, but that's\n#   the overfit direction. Always pick the value at the validation peak\n#   (or a slightly more regularized one if the peak is a plateau). Also:\n#   linear-spaced range on log-scale params (C, alpha) misses the action."
                  }
        ],
        tips: [
                  "Inspect where gap widens (increasing overfitting)",
                  "Look for \"sweet spot\" where validation score peaks",
                  "Repeat for each hyperparameter to find interactions"
        ],
        mistake: "Tuning only from final validation score; visualize full curve for insights.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "feature_importances",
        fn: "feature_importances_",
        desc: "Importance of each feature for predictions.",
        category: "Feature Analysis",
        subtitle: "Feature relevance ranking",
        signature: "model.feature_importances_ (for tree-based models)",
        descLong: "Ranks features by their contribution to model predictions, useful for feature selection and understanding model behavior.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of feature_importances_ — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             feature_importances_ — sums to 1.0,\n#             higher = more important.\n#             features; permutation importance is\n#             more honest.\n#\nimport numpy as np\nimp = model.feature_importances_\norder = np.argsort(imp)[::-1]\nfor i in order:\n    print(f\"{feature_names[i]:20s} {imp[i]:.3f}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of feature_importances_ — common patterns you'll see in production.\n# APPROACH  - Combine feature_importances_ with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             the top-K, drop low-importance features\n#             via SelectFromModel. Compare model-\n#             based importance to permutation\n#             importance.\n#             (reshuffles each feature, measures\n#             score drop) — less biased than the\n#             tree's MDI.\n#             prediction explanations — senior.\n#\nimport numpy as np, matplotlib.pyplot as plt\nfrom sklearn.feature_selection import SelectFromModel\nfrom sklearn.inspection import permutation_importance\n# Tree's built-in (Gini-based)\nimp = model.feature_importances_\norder = np.argsort(imp)[::-1]\n# More honest — permutation importance\nresult = permutation_importance(\n    model, X_test, y_test,\n    n_repeats=10, n_jobs=-1, random_state=42,\n)\nperm_imp = result.importances_mean\n# Drop low-importance features\nsel = SelectFromModel(model, threshold=\"median\")\nX_train_sel = sel.fit_transform(X_train, y_train)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of feature_importances_ — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             importance is biased toward\n#             high-cardinality features. Reach for\n#             permutation_importance for honesty, and\n#             SHAP for per-prediction explanations.\n#             For linear models, coef_ * std(feature)\n#             is the right magnitude comparison.\n#             interpretability; the per-feature-type\n#             rule (tree -> permutation, linear ->\n#             scaled coef) prevents the most common\n#             misuse.\n#             large data; permutation importance\n#             requires a held-out set.\n#\nimport numpy as np\nfrom sklearn.inspection import permutation_importance\n# 1. Tree models — permutation > MDI for honesty\nresult = permutation_importance(\n    model, X_test, y_test,\n    n_repeats=20, n_jobs=-1, random_state=42,\n)\norder = result.importances_mean.argsort()[::-1]\nfor i in order[:10]:\n    print(f\"{feature_names[i]:20s} \"\n           f\"{result.importances_mean[i]:+.4f} \"\n           f\"+/- {result.importances_std[i]:.4f}\")\n# 2. Linear models — magnitude depends on feature scale\n# coefs = model.coef_.ravel()\n# stds  = X_train.std(axis=0)\n# scaled_importance = np.abs(coefs * stds)\n# 3. SHAP — per-prediction explanations\n# import shap\n# explainer = shap.TreeExplainer(model)\n# shap_values = explainer.shap_values(X_test)\n# shap.summary_plot(shap_values, X_test, feature_names=feature_names)\n# Decision rule:\n#   tree-based, global ranking          -> permutation_importance (NOT MDI)\n#   linear, global ranking              -> abs(coef) * std(feature)\n#   per-prediction explanation          -> SHAP\n#   feature SELECTION inside Pipeline   -> SelectFromModel\n#   correlated features in the table    -> permutation w/ correlation grouping\n#   regression vs classification        -> permutation works for both\n#   small dataset, fast read            -> default feature_importances_ is OK\n#\n# Anti-pattern: ranking features by clf.feature_importances_ on training data\n#   The default MDI metric is biased toward high-cardinality / high-variance\n#   features even when they're random noise; computed on training data, it\n#   also overstates impact. Use permutation_importance on a held-out test\n#   set, group correlated features before interpreting, and don't drop\n#   features based on a single run — bootstrap or k-fold the ranking."
                  }
        ],
        tips: [
                  "Use for feature selection; drop low-importance features",
                  "Feature importances sum to 1.0",
                  "Different models compute importance differently (MDI, permutation, SHAP)",
                  "For tree models, prefer `permutation_importance` over the built-in MDI `feature_importances_` — MDI inflates the score of high-cardinality features",
                  "For per-prediction explanations reach for SHAP; for selection inside a Pipeline use `SelectFromModel`"
        ],
        mistake: "Dropping features based on single model; use multiple methods for validation.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },

  // ── Section 6: Clustering & Unsupervised Learning ─────────────────────────────────────────
  {
    id: "clustering",
    title: "Clustering & Unsupervised Learning",
    entries: [
      {
        id: "kmeans",
        fn: "KMeans",
        desc: "Partition data into k clusters via centroids.",
        category: "Clustering",
        subtitle: "Centroid-based clustering",
        signature: "KMeans(n_clusters=3, n_init=10, random_state=42)",
        descLong: "Assigns samples to k clusters by minimizing within-cluster variance, requiring pre-specified number of clusters via Lloyd's algorithm.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of KMeans — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             get labels.\n#             handle non-spherical clusters.\n#\nfrom sklearn.cluster import KMeans\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nclu = Pipeline([\n    (\"scale\",  StandardScaler()),\n    (\"kmeans\", KMeans(n_clusters=3, n_init=10, random_state=42)),\n])\nlabels = clu.fit_predict(X)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of KMeans — common patterns you'll see in production.\n# APPROACH  - Combine KMeans with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             elbow (inertia) or silhouette, n_init=\n#             \"auto\" or 10 to avoid bad seeds, predict\n#             on new data via the fit Pipeline.\n#             standard \"pick k\" workflow.\n#             similar size — fails on irregular shapes.\n#             Senior tier covers alternatives.\n#\nimport numpy as np\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n# Elbow method — plot inertia vs k\ninertias, sils = [], []\nfor k in range(2, 10):\n    p = Pipeline([(\"scale\", StandardScaler()),\n                   (\"km\", KMeans(n_clusters=k, n_init=10,\n                                  random_state=42))])\n    p.fit(X)\n    inertias.append(p.named_steps[\"km\"].inertia_)\n    sils.append(silhouette_score(p.named_steps[\"scale\"].transform(X),\n                                   p.named_steps[\"km\"].labels_))\nbest_k = np.arange(2, 10)[np.argmax(sils)]\nprint(f\"best k by silhouette: {best_k}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of KMeans — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             huge N (much faster, similar quality);\n#             KMeans++ initialization is the default\n#             and usually right; for non-spherical\n#             clusters, switch to GaussianMixture or\n#             DBSCAN. Always scale first.\n#             \"KMeans gave nonsense clusters\" on\n#             elongated or density-varying data;\n#             MiniBatchKMeans scales to millions.\n#             accurate than full KMeans; GMM has its\n#             own assumptions (Gaussian components).\n#\nfrom sklearn.cluster import KMeans, MiniBatchKMeans\nfrom sklearn.mixture import GaussianMixture\n# Big data — MiniBatchKMeans\nclu = MiniBatchKMeans(\n    n_clusters=8, batch_size=1024, n_init=\"auto\",\n    max_iter=100, random_state=42,\n).fit(X_scaled)\n# Non-spherical / unequal-size clusters -> GMM\ngmm = GaussianMixture(n_components=8, covariance_type=\"full\",\n                       random_state=42).fit(X_scaled)\nlabels = gmm.predict(X_scaled)\nproba = gmm.predict_proba(X_scaled)             # soft assignments\n# Decision rule:\n#   spherical clusters, similar sizes       -> KMeans\n#   N > 1M                                  -> MiniBatchKMeans\n#   non-spherical / overlapping clusters    -> GaussianMixture\n#   irregular shapes / noise / unknown k    -> DBSCAN\n#   hierarchical structure                  -> AgglomerativeClustering\n#   need soft / probabilistic membership    -> GaussianMixture\n#   want stable cluster ids                 -> n_init=20, fix random_state\n#\n# Anti-pattern: running KMeans on raw features and trusting the labels\n#   KMeans uses Euclidean distance, so an unscaled column with values in\n#   thousands dominates and effectively defines the clusters. Always\n#   StandardScaler first. Also: picking k from the elbow alone is brittle\n#   — pair with silhouette_score across k values and inspect cluster\n#   sizes (a 95/2/2/1% split usually means k is wrong, not the data)."
                  }
        ],
        tips: [
                  "Always scale features before KMeans",
                  "Use elbow method to find optimal k (plot inertia vs k)",
                  "Initialize with n_init=10 to avoid poor local optima",
                  "For N > ~1M switch to `MiniBatchKMeans`; for non-spherical / overlapping clusters use `GaussianMixture`; for noise-tolerant arbitrary shapes use `DBSCAN`"
        ],
        mistake: "Not scaling features; leads to distance dominance by high-variance features.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "dbscan",
        fn: "DBSCAN",
        desc: "Density-based clustering without specifying k.",
        category: "Clustering",
        subtitle: "Density-based partitioning",
        signature: "DBSCAN(eps=0.3, min_samples=5)",
        descLong: "Groups nearby samples and marks outliers as noise based on density, naturally finding arbitrary cluster shapes without pre-specifying count.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of DBSCAN — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             eps distance (need at least min_samples\n#             neighbors). Outliers get label -1.\n#             to specify k.\n#             interpretation of label -1.\n#\nfrom sklearn.cluster import DBSCAN\nlabels = DBSCAN(eps=0.5, min_samples=5).fit_predict(X_scaled)\n# label -1 = noise / outlier"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of DBSCAN — common patterns you'll see in production.\n# APPROACH  - Combine DBSCAN with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             first, pick eps via the k-distance\n#             graph (the \"knee\" of sorted k-NN\n#             distances), report cluster count and\n#             noise rate.\n#             way to choose eps.\n#             to varying density) — senior tier.\n#\nimport numpy as np\nfrom sklearn.cluster import DBSCAN\nfrom sklearn.neighbors import NearestNeighbors\n# Pick eps — k-distance graph\nk = 5\nnn = NearestNeighbors(n_neighbors=k).fit(X_scaled)\ndists, _ = nn.kneighbors(X_scaled)\nsorted_kth = np.sort(dists[:, -1])\n# Plot sorted_kth — the \"knee\" is the right eps\n# eps = ~ knee value\nclu = DBSCAN(eps=0.5, min_samples=k).fit(X_scaled)\nlabels = clu.labels_\nn_clusters = (labels != -1).any() and (set(labels) - {-1})\nn_noise    = (labels == -1).sum()\nprint(f\"clusters: {len(n_clusters)},  noise points: {n_noise}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of DBSCAN — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handles varying density (DBSCAN's main\n#             weakness); for huge N use ball_tree\n#             algorithm; the noise rate is a useful\n#             quality signal — too high means eps too\n#             small.\n#             _size and handles density variations;\n#             noise-rate diagnostics catch bad eps\n#             choices.\n#             only helps when dimensions stay\n#             reasonable (<20).\n#\nfrom sklearn.cluster import DBSCAN\nclu = DBSCAN(\n    eps=0.5, min_samples=10,\n    algorithm=\"ball_tree\",                  # faster on big N, low dims\n    n_jobs=-1,\n).fit(X_scaled)\nlabels = clu.labels_\nnoise_rate = (labels == -1).mean()\nif noise_rate > 0.5:\n    print(\"WARNING: >50% noise — eps too small, density too uneven\")\n# When DBSCAN's fixed eps fails — HDBSCAN\n# pip install hdbscan\n# import hdbscan\n# clu = hdbscan.HDBSCAN(min_cluster_size=10).fit(X_scaled)\n# labels = clu.labels_\n# Decision rule:\n#   spherical-ish clusters, known k        -> KMeans\n#   irregular shapes, single density       -> DBSCAN\n#   irregular shapes, varying density      -> HDBSCAN\n#   small N, want hierarchy                -> AgglomerativeClustering\n#   high-dim data (> 30 features)          -> reduce dims first (PCA/UMAP)\n#   very large N                           -> HDBSCAN with approx algorithms\n#   need eps with no domain prior          -> k-distance plot, look for elbow\n#\n# Anti-pattern: copy-pasting eps=0.5 from a tutorial\n#   eps depends on the scale and distance distribution of YOUR features.\n#   Without scaling, 0.5 is meaningless; with scaling it may still be wrong.\n#   Use a k-distance plot (sorted distance to k-th nearest neighbor) and\n#   pick eps at the elbow. If noise rate exceeds 50%, eps is too small."
                  }
        ],
        tips: [
                  "eps controls neighborhood distance; use k-distance graph to select",
                  "min_samples defines minimum neighbors to form core sample",
                  "No need to pre-specify number of clusters"
        ],
        mistake: "Not tuning eps and min_samples; uses heuristics or domain knowledge.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "pca",
        fn: "PCA (Principal Component Analysis)",
        desc: "Reduce dimensionality via linear transformation.",
        category: "Dimensionality Reduction",
        subtitle: "Linear variance maximization",
        signature: "PCA(n_components=2).fit_transform(X)",
        descLong: "Transforms data to orthogonal principal components maximizing variance, enabling visualization and noise reduction while preserving information.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of PCA (Principal Component Analysis) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             components capturing maximum variance.\n#             Scale first.\n#             auto component count, or Pipeline\n#             integration.\n#\nfrom sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\nX_scaled = StandardScaler().fit_transform(X)\nX_pca = PCA(n_components=2).fit_transform(X_scaled)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of PCA (Principal Component Analysis) — common patterns you'll see in production.\n# APPROACH  - Combine PCA (Principal Component Analysis) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             n_components by variance threshold\n#             (e.g. 0.95), inspect explained_variance_\n#             ratio_ to decide, integrate into a\n#             Pipeline.\n#             form — pick \"enough components for 95%\n#             variance\" automatically.\n#             or interpretability via loadings —\n#             senior tier.\n#\nimport numpy as np\nfrom sklearn.decomposition import PCA\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n# 95% variance retention\npipe = Pipeline([\n    (\"scale\", StandardScaler()),\n    (\"pca\",   PCA(n_components=0.95, random_state=42)),\n])\nX_pca = pipe.fit_transform(X)\npca = pipe.named_steps[\"pca\"]\nprint(f\"components used: {pca.n_components_}\")\nprint(f\"variance explained: {pca.explained_variance_ratio_.cumsum()}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of PCA (Principal Component Analysis) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             scale_ gives interpretable loadings;\n#             whiten=True for downstream models that\n#             want decorrelated, unit-variance inputs;\n#             KernelPCA for non-linear projection;\n#             IncrementalPCA / TruncatedSVD when data\n#             doesn't fit in memory.\n#             PC1 mean?\"; KernelPCA handles non-linear\n#             manifolds; IncrementalPCA scales\n#             to streaming data.\n#             is O(n^2) memory; TruncatedSVD doesn't\n#             center the data (right for sparse\n#             inputs).\n#\nimport numpy as np\nfrom sklearn.decomposition import (\n    PCA, KernelPCA, IncrementalPCA, TruncatedSVD)\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler().fit(X)\nX_scaled = scaler.transform(X)\npca = PCA(n_components=10, random_state=42).fit(X_scaled)\n# Loadings — interpret each PC as a weighted feature combo\nloadings = pca.components_                          # (n_components, n_features)\ntop_for_pc1 = np.argsort(np.abs(loadings[0]))[::-1][:5]\nprint(\"PC1 driven by:\", [feature_names[i] for i in top_for_pc1])\n# When sklearn's PCA is the wrong tool:\n# KernelPCA(kernel=\"rbf\", n_components=2)        # non-linear\n# IncrementalPCA(n_components=10, batch_size=200) # streaming\n# TruncatedSVD(n_components=100)                  # sparse / TF-IDF\n# Decision rule:\n#   linear, dense, fits in memory    -> PCA\n#   non-linear manifold              -> KernelPCA\n#   doesn't fit in memory            -> IncrementalPCA\n#   sparse matrix (TF-IDF)           -> TruncatedSVD\n#   visualization only (2D/3D)       -> t-SNE / UMAP\n#   need a downstream model input    -> PCA(whiten=True) inside Pipeline\n#   choose components by variance    -> n_components=0.95 (keep 95%)\n#\n# Anti-pattern: running PCA on unscaled features\n#   PCA finds directions of maximum variance — without scaling, a\n#   column with huge units (e.g., income in dollars) becomes PC1 and\n#   the rest is irrelevant. Always StandardScaler first, except when\n#   features share a scale (pixel intensities). Also: PCA before\n#   train_test_split leaks test info — fit PCA inside a Pipeline."
                  }
        ],
        tips: [
                  "Always scale features before PCA",
                  "Use n_components=0.95 to retain 95% of variance",
                  "Interpret PCs via loadings to understand feature contributions",
                  "Use `IncrementalPCA` when the matrix does not fit in memory; for sparse TF-IDF inputs reach for `TruncatedSVD` (PCA densifies and blows up RAM)"
        ],
        mistake: "Not scaling features; variance dominated by high-scale variables.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "tsne",
        fn: "t-SNE (t-Distributed Stochastic Neighbor Embedding)",
        desc: "Non-linear dimensionality reduction for visualization.",
        category: "Clustering",
        subtitle: "Non-linear neighborhood preservation",
        signature: "TSNE(n_components=2, perplexity=30, max_iter=1000)  # n_iter renamed to max_iter in sklearn 1.5",
        descLong: "Projects high-dimensional data to 2D/3D preserving local neighbor relationships, excellent for visualization but not suitable for downstream models.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of t-SNE (t-Distributed Stochastic Neighbor Embedding) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             visualization only. perplexity ~ \"size\n#             of local neighborhood\".\n#             can't.\n#             output as features for downstream\n#             models.\n#\nfrom sklearn.manifold import TSNE\nX_2d = TSNE(n_components=2, random_state=42).fit_transform(X)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of t-SNE (t-Distributed Stochastic Neighbor Embedding) — common patterns you'll see in production.\n# APPROACH  - Combine t-SNE (t-Distributed Stochastic Neighbor Embedding) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             perplexity (5-50), reduce to 50D with\n#             PCA first if N or D is large (faster\n#             and cleaner), color the projection by\n#             a known label.\n#             standard high-D visualization recipe;\n#             coloring by class is what makes the\n#             projection interpretable.\n#             than t-SNE for downstream use) —\n#             senior tier.\n#\nimport numpy as np\nfrom sklearn.manifold import TSNE\nfrom sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\nX_scaled = StandardScaler().fit_transform(X)\n# Reduce to 50D first if D > 50 — faster, cleaner\nX_pca = PCA(n_components=min(50, X_scaled.shape[1]),\n             random_state=42).fit_transform(X_scaled)\nX_2d = TSNE(\n    n_components=2,\n    perplexity=30,                          # 5-50; smaller = local detail\n    learning_rate=\"auto\",\n    init=\"pca\",                              # better than random init\n    random_state=42,\n).fit_transform(X_pca)\n# import seaborn as sns\n# sns.scatterplot(x=X_2d[:, 0], y=X_2d[:, 1], hue=labels)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of t-SNE (t-Distributed Stochastic Neighbor Embedding) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             EDA only. UMAP is faster, more stable,\n#             and produces better-shaped projections\n#             — and unlike t-SNE, UMAP can be used\n#             for downstream tasks (preserves more\n#             global structure).\n#             default for visualization and embedding;\n#             explicit \"t-SNE for viz only\" rule\n#             prevents downstream-task misuse.\n#             methods are stochastic — multiple runs\n#             give different layouts.\n#\nfrom sklearn.manifold import TSNE\n# t-SNE is fine for one-off EDA\nX_tsne = TSNE(n_components=2, perplexity=30,\n               init=\"pca\", random_state=42).fit_transform(X_pca)\n# UMAP — better default for visualization AND embeddings\n# pip install umap-learn\n# import umap\n# reducer = umap.UMAP(\n#     n_components=2,\n#     n_neighbors=15,                       # local vs global tradeoff\n#     min_dist=0.1,                          # how tight clusters are\n#     random_state=42,\n# )\n# X_umap = reducer.fit_transform(X_pca)\n# # UMAP output IS safe to use as features (unlike t-SNE)\n# Decision rule:\n#   high-D visualization, one-off     -> t-SNE (init=\"pca\", perplexity tuned)\n#   high-D viz + downstream features  -> UMAP\n#   linear, interpretable             -> PCA\n#   need to embed NEW data later      -> UMAP (transform), NOT t-SNE\n#   small dataset (< 1k)              -> low perplexity (5-15)\n#   large dataset (> 50k)             -> reduce with PCA to 50 first, then UMAP\n#   never                             -> t-SNE output as model features\n#\n# Anti-pattern: feeding t-SNE coordinates into a downstream classifier\n#   t-SNE distances are non-metric and not preserved across runs — the\n#   same point can land in different clusters with a new random_state.\n#   Use UMAP if you need a stable, low-dim feature representation, or\n#   keep t-SNE strictly as a visual EDA tool. Also: skipping PCA pre-\n#   reduction on >50 features makes t-SNE crawl AND degrades layout."
                  }
        ],
        tips: [
                  "Use for visualization only; not for downstream ML tasks",
                  "Tune perplexity (typically 5-50) based on dataset size",
                  "Set n_iter >= 1000 for convergence",
                  "If you need a low-D embedding that doubles as model features, use UMAP — its output is reusable, t-SNE distances are visualization-only"
        ],
        mistake: "Using t-SNE output as features for models; use PCA or other transformations instead.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "silhouette_score",
        fn: "silhouette_score",
        desc: "Measure clustering quality via cohesion and separation.",
        category: "Clustering Evaluation",
        subtitle: "Silhouette coefficient",
        signature: "silhouette_score(X, labels)",
        descLong: "Calculates average silhouette coefficient measuring cluster cohesion (similarity within cluster) and separation (dissimilarity with other clusters).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of silhouette_score — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             are tight and well separated. Pass the\n#             same X you clustered.\n#             good?\" metric.\n#             per-sample diagnosis.\n#\nfrom sklearn.metrics import silhouette_score\nsilhouette_score(X_scaled, labels)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of silhouette_score — common patterns you'll see in production.\n# APPROACH  - Combine silhouette_score with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             k, pick the highest silhouette, use\n#             silhouette_samples to find which points\n#             are poorly clustered.\n#             \"pick k for KMeans\" tool; per-sample\n#             scores expose individual misclusters.\n#             clusters — DBSCAN clusters can score\n#             low even when clearly correct. Senior\n#             tier covers alternatives.\n#\nimport numpy as np\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score, silhouette_samples\nscores = []\nfor k in range(2, 10):\n    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X_scaled)\n    scores.append(silhouette_score(X_scaled, km.labels_))\nbest_k = np.arange(2, 10)[np.argmax(scores)]\nprint(f\"best k by silhouette: {best_k}, score {max(scores):.3f}\")\n# Per-sample — find badly-clustered points\nkm = KMeans(n_clusters=best_k, n_init=10, random_state=42).fit(X_scaled)\nper_sample = silhouette_samples(X_scaled, km.labels_)\nbad = per_sample < 0\nprint(f\"{bad.sum()} points with negative silhouette\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of silhouette_score — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             silhouette with Davies-Bouldin (lower\n#             better) and Calinski-Harabasz (higher\n#             better) — three indices catch what one\n#             misses. For density-based clustering\n#             (DBSCAN/HDBSCAN), use noise rate +\n#             cluster stability instead.\n#             \"validate clustering\" panel; explicit\n#             rules for density-based methods\n#             prevent misapplied silhouette.\n#             knowledge / labeled validation > metric\n#             scores when available.\n#\nimport numpy as np\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import (\n    silhouette_score, davies_bouldin_score,\n    calinski_harabasz_score)\nresults = []\nfor k in range(2, 10):\n    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X_scaled)\n    results.append({\n        \"k\":        k,\n        \"silhouette\":  silhouette_score(X_scaled, km.labels_),\n        \"db\":          davies_bouldin_score(X_scaled, km.labels_),       # lower better\n        \"ch\":          calinski_harabasz_score(X_scaled, km.labels_),    # higher better\n    })\n# Compare across all three\nbest_by_sil = max(results, key=lambda r: r[\"silhouette\"])\nbest_by_db  = min(results, key=lambda r: r[\"db\"])\nbest_by_ch  = max(results, key=lambda r: r[\"ch\"])\n# Decision rule:\n#   convex clusters (KMeans / GMM)        -> silhouette + DB + CH\n#   density-based (DBSCAN / HDBSCAN)      -> noise rate + cluster persistence\n#   labeled validation set available      -> homogeneity / completeness / V-measure\n#   no validation possible                -> domain knowledge / visual inspection\n#   want per-sample score                 -> silhouette_samples (find bad rows)\n#   compare two clusterings, same data    -> Adjusted Rand Index (ARI)\n#   high-D data, slow on big N            -> sample 1-5k rows for the score\n#\n# Anti-pattern: applying silhouette_score to DBSCAN output including noise (-1)\n#   silhouette treats noise label -1 as a regular cluster, which is\n#   meaningless and tanks the score. Filter to mask = labels != -1\n#   first, or use density-aware metrics (noise rate, HDBSCAN stability).\n#   Also: silhouette tends to favor low k — pair with the elbow plot\n#   so you don't accidentally collapse everything into 2 clusters."
                  }
        ],
        tips: [
                  "Range [-1, 1]; higher is better; >0.5 generally good",
                  "Use to find optimal cluster count for KMeans",
                  "silhouette_samples() shows per-sample scores for inspection"
        ],
        mistake: "Relying only on silhouette score; combine with domain knowledge.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "agglomerative_clustering",
        fn: "AgglomerativeClustering",
        desc: "Hierarchical clustering by merging clusters.",
        category: "Clustering",
        subtitle: "Hierarchical agglomerative",
        signature: "AgglomerativeClustering(n_clusters=3, linkage='ward')",
        descLong: "Builds hierarchical cluster tree by iteratively merging closest samples/clusters, producing dendrogram without pre-specifying cluster count.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of AgglomerativeClustering — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             own cluster, then merge closest pairs\n#             until k clusters remain.\n#             showing relationships, not just a flat\n#             partition.\n#\nfrom sklearn.cluster import AgglomerativeClustering\nlabels = AgglomerativeClustering(n_clusters=3, linkage=\"ward\")\\\n    .fit_predict(X_scaled)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of AgglomerativeClustering — common patterns you'll see in production.\n# APPROACH  - Combine AgglomerativeClustering with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             cluster shape (ward=compact,\n#             complete=conservative, average=\n#             balanced, single=elongated). Use scipy\n#             dendrogram to visualize the merge\n#             history.\n#             important AgglomerativeClustering\n#             decision.\n#             (dynamic k via cut height) or scale\n#             concerns — senior.\n#\nimport matplotlib.pyplot as plt\nfrom scipy.cluster.hierarchy import dendrogram, linkage\nfrom sklearn.cluster import AgglomerativeClustering\n# Cluster\nagg = AgglomerativeClustering(n_clusters=3, linkage=\"ward\")\nlabels = agg.fit_predict(X_scaled)\n# Visualize the merge tree\nZ = linkage(X_scaled, method=\"ward\")\ndendrogram(Z, truncate_mode=\"lastp\", p=20)\nplt.xlabel(\"sample\"); plt.ylabel(\"distance\")\n# Linkage choices\n# ward     - minimizes within-cluster variance (compact, KMeans-like)\n# complete - max distance (chaining-resistant, conservative)\n# average  - mean distance (balanced)\n# single   - min distance (elongated chains; \"friend of friend\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of AgglomerativeClustering — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             distance_threshold instead of n_clusters\n#             when you don't know k (the dendrogram\n#             cut height becomes the decision); for\n#             N > ~10k use BIRCH or MiniBatchKMeans\n#             (Agglomerative is O(n^2) memory);\n#             always scale first.\n#             k; BIRCH scales hierarchical-style\n#             clustering to big data.\n#             scale (always standardize); BIRCH has\n#             its own threshold parameter to tune.\n#\nfrom sklearn.cluster import AgglomerativeClustering, Birch\n# Pick k from a height threshold instead of fixing k\nagg = AgglomerativeClustering(\n    n_clusters=None,\n    distance_threshold=2.5,                  # cut at this distance\n    linkage=\"ward\",\n)\nagg.fit(X_scaled)\nprint(f\"clusters found: {agg.n_clusters_}\")\n# At scale — BIRCH is hierarchical-style but O(n)\nbrc = Birch(n_clusters=None, threshold=0.5).fit(X_scaled)\n# Decision rule:\n#   small N, want hierarchy             -> AgglomerativeClustering\n#   small N, k unknown                  -> AgglomerativeClustering(distance_threshold=)\n#   large N (>10k)                      -> BIRCH or MiniBatchKMeans\n#   compact convex clusters             -> linkage=\"ward\" (Euclidean only)\n#   chain-shaped / connected components -> linkage=\"single\"\n#   conservative tight clusters         -> linkage=\"complete\"\n#   need a dendrogram to inspect cuts   -> scipy.cluster.hierarchy + linkage()\n#\n# Anti-pattern: running AgglomerativeClustering on 100k rows in a notebook\n#   The classic O(n^2) memory and time blow up — the kernel dies or\n#   freezes for an hour. For N > ~10k use BIRCH (linear in N) or\n#   sub-sample to fit, then assign new points by nearest centroid.\n#   Also: linkage=\"ward\" requires Euclidean distance; pairing it with\n#   metric=\"cosine\" silently raises an error or gives nonsense."
                  }
        ],
        tips: [
                  "linkage=\"ward\" minimizes variance (similar to KMeans)",
                  "linkage=\"complete\" uses maximum distance (conservative)",
                  "linkage=\"average\" uses mean distance (balanced)"
        ],
        mistake: "Not tuning linkage type; impacts cluster shapes and results.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },
]

export default { meta, sections }
