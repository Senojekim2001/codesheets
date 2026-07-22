---
type: "file-index"
domain: "python"
file: "ml"
title: "Machine Learning"
tags:
  - "python"
  - "python/ml"
  - "index"
---

# Machine Learning

> 40 entries across 6 sections.

## Data Preprocessing · 8

- [[Sections/ml/preprocessing/train_test_split|train_test_split]] — Split data into train and test sets.
- [[Sections/ml/preprocessing/standard_scaler|StandardScaler]] — Standardize features to zero mean, unit variance.
- [[Sections/ml/preprocessing/minmax_scaler|MinMaxScaler]] — Scale features to a fixed range [0, 1].
- [[Sections/ml/preprocessing/label_encoder|LabelEncoder]] — Encode categorical labels as integers.
- [[Sections/ml/preprocessing/onehot_encoder|OneHotEncoder]] — Encode categorical features as binary vectors.
- [[Sections/ml/preprocessing/simple_imputer|SimpleImputer]] — Impute missing values with strategy.
- [[Sections/ml/preprocessing/column_transformer|ColumnTransformer]] — Apply different transformations to different columns.
- [[Sections/ml/preprocessing/pipeline|Pipeline]] — Chain preprocessing and model steps together.

## Classification Models · 6

- [[Sections/ml/classification/logistic_regression|LogisticRegression]] — Linear classification model for binary/multiclass.
- [[Sections/ml/classification/decision_tree_classifier|DecisionTreeClassifier]] — Tree-based classifier with interpretable splits.
- [[Sections/ml/classification/random_forest_classifier|RandomForestClassifier]] — Ensemble of decision trees with bagging.
- [[Sections/ml/classification/svm_classifier|SVC (Support Vector Classifier)]] — Support Vector Machine for classification.
- [[Sections/ml/classification/knn_classifier|KNeighborsClassifier]] — Lazy learner using k-nearest neighbors.
- [[Sections/ml/classification/gradient_boosting_classifier|GradientBoostingClassifier]] — Sequential boosting with gradient optimization.

## Regression Models · 7

- [[Sections/ml/regression/linear_regression|LinearRegression]] — Simple linear regression model.
- [[Sections/ml/regression/ridge_regression|Ridge]] — L2 regularized linear regression.
- [[Sections/ml/regression/lasso_regression|Lasso]] — L1 regularized linear regression.
- [[Sections/ml/regression/elasticnet_regression|ElasticNet]] — Combined L1 and L2 regularization.
- [[Sections/ml/regression/decision_tree_regressor|DecisionTreeRegressor]] — Tree-based regression model.
- [[Sections/ml/regression/random_forest_regressor|RandomForestRegressor]] — Ensemble of regression trees with bagging.
- [[Sections/ml/regression/svr_regressor|SVR (Support Vector Regressor)]] — Support Vector Regression for continuous targets.

## Model Evaluation · 8

- [[Sections/ml/evaluation/accuracy_score|accuracy_score]] — Fraction of correct predictions.
- [[Sections/ml/evaluation/precision_recall_f1|precision_score, recall_score, f1_score]] — Detailed classification metrics for class performance.
- [[Sections/ml/evaluation/confusion_matrix|confusion_matrix]] — Matrix of true positives, false positives, etc.
- [[Sections/ml/evaluation/classification_report|classification_report]] — Summary of precision, recall, F1 per class.
- [[Sections/ml/evaluation/cross_val_score|cross_val_score]] — Evaluate model with k-fold cross-validation.
- [[Sections/ml/evaluation/roc_auc_score|roc_auc_score, roc_curve]] — ROC AUC for binary classification performance.
- [[Sections/ml/evaluation/mean_squared_error|mean_squared_error]] — Average squared prediction error.
- [[Sections/ml/evaluation/r2_score|r2_score]] — Coefficient of determination (R²).

## Hyperparameter Tuning · 5

- [[Sections/ml/tuning/grid_search_cv|GridSearchCV]] — Exhaustive search over parameter grid.
- [[Sections/ml/tuning/randomized_search_cv|RandomizedSearchCV]] — Random sample of parameter space.
- [[Sections/ml/tuning/learning_curve|learning_curve]] — Plot training and validation scores vs dataset size.
- [[Sections/ml/tuning/validation_curve|validation_curve]] — Plot scores vs single hyperparameter.
- [[Sections/ml/tuning/feature_importances|feature_importances_]] — Importance of each feature for predictions.

## Clustering & Unsupervised Learning · 6

- [[Sections/ml/clustering/kmeans|KMeans]] — Partition data into k clusters via centroids.
- [[Sections/ml/clustering/dbscan|DBSCAN]] — Density-based clustering without specifying k.
- [[Sections/ml/clustering/pca|PCA (Principal Component Analysis)]] — Reduce dimensionality via linear transformation.
- [[Sections/ml/clustering/tsne|t-SNE (t-Distributed Stochastic Neighbor Embedding)]] — Non-linear dimensionality reduction for visualization.
- [[Sections/ml/clustering/silhouette_score|silhouette_score]] — Measure clustering quality via cohesion and separation.
- [[Sections/ml/clustering/agglomerative_clustering|AgglomerativeClustering]] — Hierarchical clustering by merging clusters.
