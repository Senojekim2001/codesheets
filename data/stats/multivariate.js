export const meta = {
  "title": "Multivariate & Dimensionality Reduction",
  "domain": "stats",
  "sheet": "multivariate",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: Principal Component Analysis (PCA) ─────────────────────────────────────────
  {
    id: "multivariate-core",
    title: "Principal Component Analysis (PCA)",
    entries: [
      {
        id: "pca-basics",
        fn: "PCA Basics — Principal Components & Variance",
        desc: "Reduce dimensionality while retaining maximum variance via eigendecomposition.",
        category: "Dimensionality Reduction",
        subtitle: "Eigenvalues, eigenvectors, scree plot, explained variance, biplots",
        signature: "Z = XW  |  Var(PCᵢ) = λᵢ  |  Cumulative variance = Σλⱼ/Σλⱼ",
        descLong: "PCA finds orthogonal directions (principal components) that maximize variance in the data. Each component is a linear combination of original variables. Eigenvalues (λ) represent variance captured by each PC. Components are ordered by variance: PC₁ explains the most. Scree plots visualize the 'elbow' where additional components explain diminishing variance. PCA is unsupervised: it ignores class labels. Always standardize data first (unless all variables have the same units).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of PCA Basics — Principal Components & Variance — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n── PCA Workflow ──────────────────────────────────────────\n1. Standardize data (mean=0, SD=1)\n2. Compute covariance/correlation matrix Σ\n3. Eigendecomposition: Σ = W·Λ·Wᵀ\n   W = eigenvector matrix (loading vectors)\n   Λ = diagonal matrix of eigenvalues (variances)\n4. Sort by eigenvalue (largest first)\n5. Scree plot: plot eigenvalues to find 'elbow'\n6. Cumulative variance: decide how many PCs to keep\n7. Project data: Z = X·W_k"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of PCA Basics — Principal Components & Variance — common patterns you'll see in production.\n# APPROACH  - Combine PCA Basics — Principal Components & Variance with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n── Explained Variance ────────────────────────────────────\nλ₁ ≥ λ₂ ≥ ... ≥ λₚ  (eigenvalues in descending order)\nVariance explained by PCᵢ:\n  var_i = λᵢ / Σ(λⱼ)\nCumulative variance:\n  cum_var_k = Σᵢ₌₁ᵏ λᵢ / Σⱼ λⱼ\nRule of thumb: keep PCs until cumulative ≥ 80-90%"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of PCA Basics — Principal Components & Variance — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n── Example (3D → 2D) ──────────────────────────────────,Iris data: 150 samples, 4 features,Eigenvalues: [2.91, 0.92, 0.15, 0.02],,PC1 explains: 2.91/4.00 = 72.8%,PC2 explains: 0.92/4.00 = 23.0%,PC1+PC2:     95.8% ← keep both,,PC3 explains: 0.15/4.00 = 3.7%  ← minimal value,PC4 explains: 0.02/4.00 = 0.5%  ← negligible,\n── Scree Plot Interpretation ─────────────────────────────,             │,  Variance   │  •,  Explained  │   •,             │    •,             │     ░  ← elbow (diminishing returns),             │      ░░,             └───────────,                PC Number,\n── Biplot ────────────────────────────────────────────────,Scatter plot: observations as points (PC₁, PC₂),Arrows: loadings (correlation of original vars with PCs),Long arrow ← variable strongly contributes to that PC,Short arrow ← weak contribution,,Example: Iris,  PC1 high: petal length & width arrows long → size axis,  PC2 high: sepal width arrow long → shape axis"
                  }
        ],
        tips: [
                  "Always standardize before PCA if variables have different scales — unit differences dominate raw covariance.",
                  "Scree plot + parallel analysis together: compare to random data eigenvalues for robust component count.",
                  "Loadings (eigenvectors) are correlations between original variables and PCs — use them to interpret PCs.",
                  "PCA on correlation vs covariance matrix: use correlation when scales differ, covariance when same units."
        ],
        mistake: "Applying PCA to raw unstandardized data where one variable (e.g., weight in kg vs height in cm) dominates by scale alone. This has nothing to do with importance, only measurement units. Always standardize first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual eigendecomposition + interpretation\n// More explicit but longer",
          concise: "`sklearn.decomposition.PCA(n_components=k)` or R `prcomp()`",
        },
      },
      {
        id: "pca-sklearn",
        fn: "PCA with scikit-learn",
        desc: "Implement PCA for dimensionality reduction and visualization in Python.",
        category: "Dimensionality Reduction",
        subtitle: "fit_transform, explained_variance_ratio, components_, transform",
        signature: "pca = PCA(n_components=k).fit(X)  |  X_reduced = pca.fit_transform(X)  |  pca.explained_variance_ratio_",
        descLong: "scikit-learn's PCA class standardizes data, fits eigendecomposition, and provides convenient methods for transformation. fit() estimates components, fit_transform() returns projected data in one step. explained_variance_ratio_ shows the fraction of variance explained by each component. Use this for visualization (2D/3D projection), feature reduction before modeling, or noise filtering.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of PCA with scikit-learn — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── Load and standardize data ─────────────────────────\nX = np.array([[...], [...], ...])  # (n_samples, n_features)\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\n# ── Fit PCA ────────────────────────────────────────────\npca = PCA(n_components=2)  # reduce to 2D\npca.fit(X_scaled)\n# ── Examine results ────────────────────────────────────\nprint(f\"Explained variance: {pca.explained_variance_ratio_}\")\n# [0.728, 0.230]\nprint(f\"Cumulative: {np.cumsum(pca.explained_variance_ratio_)}\")\n# [0.728, 0.958]  ← 95.8% total"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of PCA with scikit-learn — common patterns you'll see in production.\n# APPROACH  - Combine PCA with scikit-learn with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nprint(f\"PC loadings shape: {pca.components_.shape}\")\n# (2, 4)  ← 2 PCs, 4 original features\n# ── Visualize components ───────────────────────────────\n# Show how original features contribute to each PC\nloadings = pca.components_.T\nfor i, feature in enumerate(['Feature 0', 'Feature 1', ...]):\n    plt.barh(feature, loadings[i, 0])  # PC1 loading\nplt.xlabel('PC1 loading')\nplt.show()\n# ── Transform data ─────────────────────────────────────\nX_reduced = pca.fit_transform(X_scaled)\n# Shape: (n_samples, 2)\n# Or transform new data\nX_new_reduced = pca.transform(X_new_scaled)\n# ── Scatterplot: 2D projection ────────────────────────\nplt.scatter(X_reduced[:, 0], X_reduced[:, 1], alpha=0.6)\nplt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%})')\nplt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%})')\nplt.show()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of PCA with scikit-learn — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Find optimal number of components ──────────────────\npca_full = PCA()\npca_full.fit(X_scaled)\ncum_var = np.cumsum(pca_full.explained_variance_ratio_)\nn_components_80 = np.argmax(cum_var >= 0.80) + 1\nn_components_90 = np.argmax(cum_var >= 0.90) + 1\nprint(f\"Components for 80% variance: {n_components_80}\")\nprint(f\"Components for 90% variance: {n_components_90}\")"
                  }
        ],
        tips: [
                  "Use `StandardScaler` before PCA — sklearn's PCA does NOT auto-standardize.",
                  "`PCA(n_components=None)` fits all components, then analyze `explained_variance_ratio_` to decide how many to keep.",
                  "For visualization, plot `pca.components_` (loadings) as arrows on the 2D PC scatter plot — the biplot.",
                  "`pca.transform()` projects new data without refitting — fit once on training, apply to test."
        ],
        mistake: "Fitting PCA on training data, then fitting a new PCA on test data. This means the two spaces are different. Always fit once, then transform both train and test with the same PCA object.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFull workflow with interpretation\n// More explicit but longer",
          concise: "`X_red = PCA(k).fit_transform(StandardScaler().fit_transform(X))`",
        },
      },
      {
        id: "factor-analysis",
        fn: "Factor Analysis — Latent Variable Models",
        desc: "Uncover latent factors underlying observed variables via factor analysis and rotation.",
        category: "Dimensionality Reduction",
        subtitle: "Loadings, communality, uniqueness, rotation (varimax, promax), factor scores",
        signature: "X = L·F + ε  |  communality = Σ(loadings²)  |  uniqueness = 1 - communality",
        descLong: "Factor Analysis (FA) models observed variables as linear combinations of latent factors plus unique error. Unlike PCA (which is descriptive), FA is a generative model: it estimates the underlying factor structure. Loadings show how strongly each variable relates to each factor. Communality (variance explained by factors) vs uniqueness (residual variance). Rotation (varimax → uncorrelated, promax → correlated) makes loadings sparse and interpretable. Use FA when you hypothesize latent constructs (intelligence, personality, job satisfaction).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Factor Analysis — Latent Variable Models — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.decomposition import FactorAnalysis\nimport numpy as np\n# ── Fit Factor Analysis ────────────────────────────────\nX = np.array([...])  # (n_samples, p_features)\nfa = FactorAnalysis(n_components=3, random_state=42)\nfa.fit(X)\n# ── Loadings: feature × factor matrix ──────────────────\nloadings = fa.components_.T\n# Shape: (p_features, n_factors)\n# Print loadings with labels\nfactors = [f'Factor {i}' for i in range(3)]\nfeatures = [f'Var {j}' for j in range(p)]\nimport pandas as pd\nloadings_df = pd.DataFrame(\n    loadings,\n    index=features,\n    columns=factors\n)\nprint(loadings_df.round(3))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Factor Analysis — Latent Variable Models — common patterns you'll see in production.\n# APPROACH  - Combine Factor Analysis — Latent Variable Models with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Communalities (variance explained per variable) ────\ncommunalities = (loadings ** 2).sum(axis=1)\n# High communality: well-explained by factors\n# Low communality: high unique/residual variance\nprint(\"Communalities:\")\nfor var, comm in zip(features, communalities):\n    print(f\"  {var}: {comm:.3f}\")\n# ── Factor scores (latent variable values) ────────────\nfactor_scores = fa.transform(X)\n# Shape: (n_samples, n_factors)\n# Use these for downstream analysis/clustering\n# ── Variance explained ────────────────────────────────\n# FA does NOT maximize variance (unlike PCA)\n# Instead minimizes residual variance\n# ── Rotation for interpretability ──────────────────────\n# sklearn FA does not have built-in rotation\n# Use factor-analyzer or GPFactor package:\n# from factor_analyzer.rotator import Rotator\n# rotator = Rotator(method='varimax')\n# loadings_rotated = rotator.fit_transform(loadings)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Factor Analysis — Latent Variable Models — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Scree plot (FA style) ─────────────────────────────\n# Plot log-likelihood by n_components\nn_comp_range = range(1, 8)\nlog_likes = []\nfor n_comp in n_comp_range:\n    fa_temp = FactorAnalysis(n_components=n_comp)\n    fa_temp.fit(X)\n    log_likes.append(fa_temp.score(X))\nimport matplotlib.pyplot as plt\nplt.plot(n_comp_range, log_likes, marker='o')\nplt.xlabel('Number of Factors')\nplt.ylabel('Log-Likelihood')\nplt.title('Scree Plot (FA)')\nplt.show()"
                  }
        ],
        tips: [
                  "Use FA when you hypothesize latent constructs (personality traits, intelligence); use PCA when you just want dimensionality reduction.",
                  "Varimax rotation → uncorrelated factors (easier interpretation, axes at right angles).",
                  "Promax rotation → allows factor correlation (more realistic if factors are truly related).",
                  "High communalities across variables suggest good factor model; low communalities indicate missing factors or bad model fit."
        ],
        mistake: "Using FA without rotation on uninterpretable factors, then giving up. After fitting, rotate the loadings (varimax is default). Unrotated FA maximizes variance on first factor; rotated FA balances it across factors for interpretability.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFull model fit + rotation + interpretation\n// More explicit but longer",
          concise: "`FactorAnalysis(n_components=k).fit(X)` or R `fa(cor(X), nfactors=k)`",
        },
      },
    ],
  },

  // ── Section 2: Clustering & Classification ─────────────────────────────────────────
  {
    id: "clustering-methods",
    title: "Clustering & Classification",
    entries: [
      {
        id: "cluster-kmeans",
        fn: "K-Means Clustering",
        desc: "Partition data into k clusters by minimizing within-cluster variance.",
        category: "Clustering",
        subtitle: "Elbow method, silhouette score, cluster centers, inertia, convergence",
        signature: "minimize Σ ||xᵢ - μₖ||²  |  silhouette = (b-a)/max(a,b)  |  elbow",
        descLong: "K-means partitions n observations into k clusters by iteratively assigning points to nearest centroid and updating centroids. Fast and scalable but requires specifying k in advance. Elbow method: plot inertia (within-cluster sum of squares) vs k, pick where curve elbows. Silhouette score measures how well points fit in their cluster (range -1 to 1, higher is better). Be aware: k-means assumes spherical clusters and is sensitive to initialization — use k-means++ (default in sklearn) or multiple runs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of K-Means Clustering — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── K-Means with fixed k ──────────────────────────────\nX = np.array([...])  # (n_samples, n_features)\nkmeans = KMeans(n_clusters=3, init='k-means++', random_state=42, n_init=10)\nlabels = kmeans.fit_predict(X)\n# labels: cluster assignment for each sample\n# ── Examine results ───────────────────────────────────\nprint(f\"Cluster centers:\n{kmeans.cluster_centers_}\")\nprint(f\"Inertia (within-cluster sum of squares): {kmeans.inertia_}\")\nprint(f\"Labels: {labels}\")\n# ── Elbow Method (find optimal k) ─────────────────────\ninertias = []\nsilhouette_scores = []\nk_range = range(2, 11)\nfor k in k_range:\n    km = KMeans(n_clusters=k, init='k-means++', random_state=42, n_init=10)\n    km.fit(X)\n    inertias.append(km.inertia_)\n    silhouette_scores.append(silhouette_score(X, km.labels_))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of K-Means Clustering — common patterns you'll see in production.\n# APPROACH  - Combine K-Means Clustering with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Plot elbow\nplt.figure(figsize=(12, 5))\nplt.subplot(1, 2, 1)\nplt.plot(k_range, inertias, marker='o')\nplt.xlabel('k (number of clusters)')\nplt.ylabel('Inertia')\nplt.title('Elbow Method')\nplt.grid()\n# Plot silhouette\nplt.subplot(1, 2, 2)\nplt.plot(k_range, silhouette_scores, marker='o')\nplt.xlabel('k (number of clusters)')\nplt.ylabel('Silhouette Score')\nplt.title('Silhouette Method')\nplt.grid()\nplt.show()\n# Optimal k: highest silhouette or elbow in inertia\noptimal_k = k_range[np.argmax(silhouette_scores)]\nprint(f\"Optimal k: {optimal_k}\")\n# ── Silhouette Score (how well cluster-separated?) ────\nsil_score = silhouette_score(X, labels)\n# Range: -1 (bad) to 1 (good)\n# Interpretation:\n#   > 0.5: strong structure\n#   0.3-0.5: reasonable\n#   < 0.3: weak or overlapping clusters"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of K-Means Clustering — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprint(f\"Silhouette score: {sil_score:.3f}\")\n# ── Predict on new data ─────────────────────────────\nX_new = np.array([...])\nnew_labels = kmeans.predict(X_new)\n# ── Issues & tips ──────────────────────────────────────\n# - Sensitive to initialization: use k-means++ (default)\n# - Assumes spherical clusters: fails on complex shapes\n# - Sensitive to outliers: preprocess or use robust scaling\n# - Run multiple times, keep best (by inertia)"
                  }
        ],
        tips: [
                  "Always standardize features before k-means — Euclidean distance is scale-sensitive.",
                  "Try multiple random initializations (n_init=10) and keep the best result.",
                  "Silhouette score: sample score is (b-a)/max(a,b) where a=distance to own cluster, b=distance to nearest other cluster.",
                  "Elbow method is often ambiguous — combine with silhouette score and domain knowledge."
        ],
        mistake: "Running k-means once with default initialization and accepting the result. k-means is random and can get stuck in local optima. Always run multiple times or use k-means++ initialization.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFull elbow analysis + silhouette validation\n// More explicit but longer",
          concise: "`KMeans(k, init='k-means++').fit_predict(X)` or R `kmeans(X, centers=k)`",
        },
      },
      {
        id: "cluster-hierarchical",
        fn: "Hierarchical Clustering — Dendrograms & Linkage",
        desc: "Build a hierarchy of clusters via agglomerative or divisive methods.",
        category: "Clustering",
        subtitle: "Dendrogram, linkage (single, complete, average, Ward), distance matrix, cut tree",
        signature: "dendogram(Z)  |  linkage(X, method='ward')  |  fcluster(Z, t)  |  cutree(hc, k)",
        descLong: "Hierarchical clustering produces a tree (dendrogram) showing nested clusters. Agglomerative (bottom-up) starts with individual points, merges nearest pairs, repeats. Linkage determines 'nearest': single (min distance), complete (max), average (mean), or Ward (minimize variance). Divisive (top-down) starts with all points, splits recursively. Dendrogram reveals cluster structure visually. Cut at different heights to get different k. Does not require specifying k in advance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Hierarchical Clustering — Dendrograms & Linkage — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom scipy.cluster.hierarchy import dendrogram, linkage, fcluster\nfrom scipy.spatial.distance import pdist, squareform\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── Hierarchical clustering ────────────────────────────\nX = np.array([...])  # (n_samples, n_features)\n# Compute linkage matrix\nZ = linkage(X, method='ward')\n# Z shape: (n_samples-1, 4)\n# Columns: cluster_i, cluster_j, distance, n_samples_in_cluster\n# ── Plot dendrogram ───────────────────────────────────\nplt.figure(figsize=(10, 5))\ndendrogram(Z)\nplt.xlabel('Sample Index')\nplt.ylabel('Distance')\nplt.title('Hierarchical Clustering Dendrogram')\nplt.axhline(y=10, color='r', linestyle='--')  # cut line\nplt.show()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Hierarchical Clustering — Dendrograms & Linkage — common patterns you'll see in production.\n# APPROACH  - Combine Hierarchical Clustering — Dendrograms & Linkage with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Cut dendrogram at height/distance ──────────────────\nmax_distance = 10\nlabels = fcluster(Z, max_distance, criterion='distance')\n# Each sample gets cluster label (1, 2, 3, ...)\n# Or specify number of clusters\nlabels = fcluster(Z, 3, criterion='maxclust')  # k=3\n# ── Linkage methods ────────────────────────────────────\nmethods = ['single', 'complete', 'average', 'ward']\n# single: minimum distance between any pair\n#   ← can create elongated chains\n# complete: maximum distance between any pair\n#   ← tends toward compact clusters\n# average: mean distance\n#   ← balance between single/complete\n# ward: minimize within-cluster variance (recommended)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Hierarchical Clustering — Dendrograms & Linkage — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfor method in methods:\n    Z_m = linkage(X, method=method)\n    print(f\"Method: {method}\")\n    # Compare dendrograms\n# ── Distance matrix ──────────────────────────────────\n# Precompute pairwise distances\ndistances = pdist(X, metric='euclidean')\nZ_custom = linkage(distances, method='complete')\n# ── Comparison with k-means ──────────────────────────\n# Hierarchical: no need to specify k upfront\n# K-means: faster, scalable to large data\n# Hierarchical: produces tree, interpretable hierarchy"
                  }
        ],
        tips: [
                  "Ward linkage is usually best — it minimizes variance, analogous to k-means.",
                  "Plot dendrograms with colored clusters — easier to identify natural breaks.",
                  "Single linkage can create 'chaining' (elongated clusters); use complete or average instead.",
                  "Distance matrix approach: use for non-standard distances (text, graphs, etc.) that pdist doesn't support."
        ],
        mistake: "Using single linkage and wondering why your dendrogram forms a long chain. Single linkage connects nearest neighbors only. Use complete or Ward linkage for tighter, more compact clusters.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFull dendrogram plotting + interpretation\n// More explicit but longer",
          concise: "`Z=linkage(X, 'ward'); labels=fcluster(Z, k, 'maxclust')` or R `hclust(dist(X))`",
        },
      },
      {
        id: "dbscan-clustering",
        fn: "DBSCAN — Density-Based Clustering",
        desc: "Find clusters of arbitrary shape via density connectivity.",
        category: "Clustering",
        subtitle: "eps, min_pts, core/border/noise points, density reachability",
        signature: "DBSCAN(eps=ε, min_samples=m)  |  Labels: 0,1,2... clusters, -1 noise",
        descLong: "DBSCAN (Density-Based Spatial Clustering of Applications with Noise) groups points that are densely packed, marks outliers as noise, and finds arbitrary cluster shapes. Two parameters: eps (radius neighborhood), min_samples (points needed in radius to be 'core'). Points are core if ≥ min_samples neighbors within eps, border if within eps of core point, noise if neither. Does not require specifying k. Finds outliers naturally (label = -1). Struggles with varying density clusters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of DBSCAN — Density-Based Clustering — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.cluster import DBSCAN\nfrom sklearn.neighbors import NearestNeighbors\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── Find optimal eps (k-distance graph) ───────────────\nX = np.array([...])\nk = 5  # min_samples - 1\nneighbors = NearestNeighbors(n_neighbors=k)\nneighbors_fit = neighbors.fit(X)\ndistances, indices = neighbors_fit.kneighbors(X)\n# Sort distances to k-th nearest neighbor\ndistances = np.sort(distances[:, k-1], axis=0)\nplt.figure(figsize=(10, 5))\nplt.plot(distances)\nplt.ylabel('k-distance')\nplt.xlabel('Data Points (sorted by distance)')\nplt.title('K-distance Graph (find elbow = optimal eps)')\nplt.grid()\nplt.show()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of DBSCAN — Density-Based Clustering — common patterns you'll see in production.\n# APPROACH  - Combine DBSCAN — Density-Based Clustering with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Elbow = good eps value\n# ── DBSCAN clustering ──────────────────────────────────\neps = 0.5  # from k-distance elbow\nmin_samples = 5\ndbscan = DBSCAN(eps=eps, min_samples=min_samples)\nlabels = dbscan.fit_predict(X)\n# ── Examine results ────────────────────────────────────\nn_clusters = len(set(labels)) - (1 if -1 in labels else 0)\nn_noise = list(labels).count(-1)\nprint(f\"Number of clusters: {n_clusters}\")\nprint(f\"Number of noise points: {n_noise}\")\nprint(f\"Silhouette score: {silhouette_score(X, labels)}\")\n# ── Visualize ──────────────────────────────────────────\nplt.scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis', s=50)\n# Points labeled -1 (noise) appear as different color\nplt.xlabel('Feature 1')\nplt.ylabel('Feature 2')\nplt.title(f'DBSCAN (eps={eps}, min_samples={min_samples})')\nplt.colorbar()\nplt.show()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of DBSCAN — Density-Based Clustering — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Advantages & Disadvantages ────────────────────────\n# + No need to specify k\n# + Finds arbitrary cluster shapes\n# + Identifies outliers naturally\n# - Sensitive to eps and min_samples\n# - Struggles with varying-density clusters\n# - Sensitive to scale (preprocess!)"
                  }
        ],
        tips: [
                  "Always scale/normalize features before DBSCAN — Euclidean distance is scale-sensitive.",
                  "K-distance graph: plot distances to k-th neighbor, look for elbow — that's your eps.",
                  "Use min_samples ≈ 2 × n_features (rule of thumb) or use MinPtsAuto.",
                  "DBSCAN works great for detecting outliers — any point with label -1 is potentially anomalous."
        ],
        mistake: "Applying DBSCAN to unscaled data where one feature (e.g., price in thousands vs quantity in units) dominates the distance metric. Always standardize or normalize first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nK-distance analysis + optimal parameter selection\n// More explicit but longer",
          concise: "`DBSCAN(eps=0.5, min_samples=5).fit_predict(X)` or R `dbscan::dbscan()`",
        },
      },
    ],
  },

  // ── Section 3: Linear & Nonlinear Classification ─────────────────────────────────────────
  {
    id: "classification-methods",
    title: "Linear & Nonlinear Classification",
    entries: [
      {
        id: "discriminant-analysis",
        fn: "LDA & QDA — Linear & Quadratic Discriminant Analysis",
        desc: "Classify via linear or quadratic decision boundaries assuming multivariate normal data.",
        category: "Classification",
        subtitle: "Posterior probability, decision boundary, LDA vs QDA, Fisher criterion, feature selection",
        signature: "P(G=k|X=x) ∝ P(X=x|G=k) · P(G=k)  |  LDA: shared Σ  |  QDA: group-specific Σ",
        descLong: "LDA finds the linear combination of features that best separates classes (Fisher discriminant function). Assumes each class follows multivariate normal distribution with equal covariance matrices. QDA relaxes this to class-specific covariances, giving quadratic boundaries. LDA is fast, interpretable, and performs well when assumptions hold. Both provide posterior probabilities and feature importances. Compared to logistic regression, LDA is more stable with small samples and imbalanced classes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of LDA & QDA — Linear & Quadratic Discriminant Analysis — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.discriminant_analysis import LinearDiscriminantAnalysis, QuadraticDiscriminantAnalysis\nfrom sklearn.model_selection import cross_val_score\nimport numpy as np\n# ── Linear Discriminant Analysis ──────────────────────\nX_train, y_train = ...\nX_test, y_test = ...\nlda = LinearDiscriminantAnalysis()\nlda.fit(X_train, y_train)\ny_pred = lda.predict(X_test)\ny_proba = lda.predict_proba(X_test)\n# y_proba: posterior P(G=k|X) for each class\n# ── LDA Results ────────────────────────────────────────\nprint(f\"Classes: {lda.classes_}\")\nprint(f\"Class priors: {lda.priors_}\")\nprint(f\"Means (centroids): {lda.means_}\")\nprint(f\"Covariance shape: {lda.covariance_.shape}\")\n# Discriminant functions (linear combination of features)\n# For 3 classes with 4 features: 3×4 matrix\nprint(f\"Coefficients shape: {lda.coef_.shape}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of LDA & QDA — Linear & Quadratic Discriminant Analysis — common patterns you'll see in production.\n# APPROACH  - Combine LDA & QDA — Linear & Quadratic Discriminant Analysis with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Feature importance in LDA ──────────────────────────\n# The coefficients themselves indicate importance\ncoefs = lda.coef_[0]  # first vs rest (binary) or any class\nfeature_importance = np.abs(coefs)\nfor feat, imp in zip(['x1', 'x2', 'x3', 'x4'], feature_importance):\n    print(f\"  {feat}: {imp:.3f}\")\n# ── Quadratic Discriminant Analysis ────────────────────\nqda = QuadraticDiscriminantAnalysis()\nqda.fit(X_train, y_train)\ny_pred_qda = qda.predict(X_test)\n# QDA per-class covariances\nprint(f\"Theta (per-class covariances): {qda.theta_}\")\n# ── Comparison: LDA vs QDA ─────────────────────────────\nlda_score = cross_val_score(lda, X_train, y_train, cv=5).mean()\nqda_score = cross_val_score(qda, X_train, y_train, cv=5).mean()\nprint(f\"LDA CV accuracy: {lda_score:.3f}\")\nprint(f\"QDA CV accuracy: {qda_score:.3f}\")\n# LDA: more stable with small samples, avoids overfitting\n# QDA: more flexible, needs more data per class"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of LDA & QDA — Linear & Quadratic Discriminant Analysis — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Plot decision boundary (2D visualization) ──────────\nfrom sklearn.datasets import make_classification\nimport matplotlib.pyplot as plt\n# Create 2D data\nX, y = make_classification(n_samples=300, n_features=2, n_informative=2,\n                           n_redundant=0, n_clusters_per_class=1, random_state=42)\nh = 0.02  # step size\nx_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1\ny_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1\nxx, yy = np.meshgrid(np.arange(x_min, x_max, h),\n                     np.arange(y_min, y_max, h))\nlda.fit(X, y)\nZ = lda.predict(np.c_[xx.ravel(), yy.ravel()])\nZ = Z.reshape(xx.shape)\nplt.contourf(xx, yy, Z, alpha=0.4)\nplt.scatter(X[:, 0], X[:, 1], c=y, cmap='viridis')\nplt.title('LDA Decision Boundary')\nplt.show()"
                  }
        ],
        tips: [
                  "Use LDA when classes are roughly balanced and sample size is moderate — it's stable and interpretable.",
                  "QDA needs more data (≈ p²/2 per class minimum) but gives more flexible boundaries.",
                  "Check assumptions: multivariate normality (QQ-plot) and homogeneity of covariance (Box's M test).",
                  "Scale features to the same range before LDA — means and covariance are scale-sensitive."
        ],
        mistake: "Using LDA when group covariances are very different. If covariance matrices differ substantially, QDA or logistic regression is more appropriate. Always visually inspect covariance structure first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nDetailed assumption checking + boundary visualization\n// More explicit but longer",
          concise: "`LinearDiscriminantAnalysis().fit(X, y)` or R `MASS::lda()`",
        },
      },
      {
        id: "canonical-correlation",
        fn: "Canonical Correlation Analysis (CCA)",
        desc: "Find maximally correlated linear combinations of two multivariate datasets.",
        category: "Multivariate Analysis",
        subtitle: "Canonical variates, canonical correlations, dimensionality reduction for pairs",
        signature: "Maximize Cor(U, V) where U = X·a, V = Y·b  |  CCA finds (a, b)",
        descLong: "CCA analyzes relationships between two sets of variables. It finds linear combinations (canonical variates) of each set that are maximally correlated. Unlike PCA (single view), CCA relates two views. Used in genomics (genetic markers vs traits), marketing (customer attributes vs purchase behavior), multi-view learning. Returns canonical correlations (how strong the relationships), loadings (which original variables matter), and scores (reduced-dim projections).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Canonical Correlation Analysis (CCA) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# CCA is not built-in to sklearn as of recent versions\n# Use statsmodels or a dedicated package\nfrom sklearn.cross_decomposition import CCA\nimport numpy as np\n# Two multivariate datasets\nX = np.array([...])  # (n_samples, p_features)\nY = np.array([...])  # (n_samples, q_features)\n# ── Fit CCA ────────────────────────────────────────────\ncca = CCA(n_components=2)  # find 2 canonical components\ncca.fit(X, Y)\n# ── Transform to canonical variates ────────────────────\nX_c, Y_c = cca.transform(X, Y)\n# X_c shape: (n_samples, 2)\n# Y_c shape: (n_samples, 2)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Canonical Correlation Analysis (CCA) — common patterns you'll see in production.\n# APPROACH  - Combine Canonical Correlation Analysis (CCA) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Canonical correlations ─────────────────────────────\n# Correlation between X_c[:, i] and Y_c[:, i]\nfor i in range(2):\n    corr = np.corrcoef(X_c[:, i], Y_c[:, i])[0, 1]\n    print(f\"Canonical correlation {i+1}: {corr:.3f}\")\n# ── Loadings: original var → canonical variate ────────\n# cca.x_weights_: shape (p, n_components)\n#   Tells which original X variables load on each canonical variate\n# cca.y_weights_: shape (q, n_components)\n#   Tells which original Y variables load on each canonical variate\nprint(f\"X loadings:\n{cca.x_weights_}\")\nprint(f\"Y loadings:\n{cca.y_weights_}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Canonical Correlation Analysis (CCA) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Interpretation ────────────────────────────────────\n# High loading: variable strongly contributes to canonical variate\n# First canonical variate: strongest association\n# Second canonical variate: next strongest (uncorrelated to first)\n# ── Application: multi-view learning ──────────────────\n# (X, Y) as two views of same objects\n# Learn joint representation via CCA\n# Use for clustering, classification, or imputation"
                  }
        ],
        tips: [
                  "CCA finds the 'directions' where two datasets are most aligned — useful for finding structure in multi-view data.",
                  "Loadings tell the story: which X variables predict Y and vice versa.",
                  "Only the first few canonical correlations are usually significant — scree plot helps choose n_components.",
                  "CCA requires standardization and is sensitive to outliers — preprocess carefully."
        ],
        mistake: "Using CCA on raw unstandardized variables where one set dominates by scale. Always standardize X and Y separately before fitting.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFull loadings interpretation + visualization\n// More explicit but longer",
          concise: "`CCA(n_components=k).fit(X, Y)` or R `cancor(X, Y)`",
        },
      },
    ],
  },

  // ── Section 4: Advanced Multivariate Methods ─────────────────────────────────────────
  {
    id: "advanced-methods",
    title: "Advanced Multivariate Methods",
    entries: [
      {
        id: "manova",
        fn: "MANOVA — Multivariate ANOVA",
        desc: "Test group differences across multiple dependent variables simultaneously.",
        category: "Hypothesis Testing",
        subtitle: "Wilks' Lambda, Pillai's trace, Hotelling-Lawley, Box's M test, follow-up tests",
        signature: "H₀: μ₁ = μ₂ = ... = μₖ  |  Λ = |W|/(|W|+|B|)  |  Λ → 0: strong separation",
        descLong: "MANOVA extends ANOVA to multiple dependent variables, accounting for correlations between them. Tests whether group centroids differ using Wilks' Lambda, Pillai's trace, Hotelling-Lawley, or Roy's largest root. Box's M tests homogeneity of covariance matrices. More powerful than separate ANOVAs when DVs are moderately correlated. Follow-up: discriminant analysis or univariate ANOVAs. Assumes multivariate normality and homogeneous covariances.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of MANOVA — Multivariate ANOVA — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# scipy/statsmodels do not have built-in MANOVA\n# Use pingouin or manual calculation\nimport numpy as np\nfrom scipy.stats import f\nimport pandas as pd\n# ── Manual MANOVA calculation ──────────────────────────\n# Groups: k groups, DVs: p dependent variables\n# Data: X (n × (p+1)) where last col is group\ngroups = [1, 1, 1, 2, 2, 2, 3, 3, 3]\nX = np.array([[...],\n              [...],  # p columns for DVs, 1 for group\n              [...]])\n# ── Compute SSCP matrices ──────────────────────────────\nn = X.shape[0]\nk = len(set(groups))  # number of groups\np = X.shape[1] - 1    # number of DVs\n# Grand mean\ngrand_mean = X[:, :p].mean(axis=0)\n# Total SSCP matrix T\nX_centered = X[:, :p] - grand_mean\nT = X_centered.T @ X_centered\n# Between-groups SSCP B\nB = np.zeros((p, p))\nfor g in set(groups):\n    mask = np.array(groups) == g\n    n_g = mask.sum()\n    group_mean = X[mask, :p].mean(axis=0)\n    diff = group_mean - grand_mean\n    B += n_g * np.outer(diff, diff)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of MANOVA — Multivariate ANOVA — common patterns you'll see in production.\n# APPROACH  - Combine MANOVA — Multivariate ANOVA with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Within-groups SSCP W\nW = T - B\n# ── Wilks' Lambda ──────────────────────────────────────\ndet_W = np.linalg.det(W)\ndet_T = np.linalg.det(T)\nlambda_wilks = det_W / det_T\nprint(f\"Wilks' Lambda: {lambda_wilks:.4f}\")\n# Near 0: strong separation\n# Near 1: no separation\n# ── Pillai's Trace ────────────────────────────────────\n# More robust to assumption violations\n# Eigenvalues of (B @ inv(T))\nB_T_inv = np.linalg.inv(T) @ B\neigenvalues = np.linalg.eigvals(B_T_inv)\npillai_trace = np.sum(eigenvalues / (1 + eigenvalues))\nprint(f\"Pillai's Trace: {pillai_trace:.4f}\")\n# ── Hotelling-Lawley Trace ────────────────────────────\nhotelling = np.sum(eigenvalues)\nprint(f\"Hotelling-Lawley Trace: {hotelling:.4f}\")\n# ── Box's M test (homogeneity of covariance) ───────────\n# H₀: covariance matrices are equal across groups\n# Reject → heterogeneous covariances (violates MANOVA assumption)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of MANOVA — Multivariate ANOVA — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Calculate per-group covariance\ncovs = []\nfor g in set(groups):\n    mask = np.array(groups) == g\n    cov_g = np.cov(X[mask, :p].T)\n    covs.append(cov_g)\n# Box's M statistic (approximate chi-square)\n# Implementation is complex; use pingouin.homogeneity_likelihood_ratio()\n# ── Follow-up: univariate ANOVAs ──────────────────────\nfrom scipy.stats import f_oneway\nfor col in range(p):\n    groups_list = [X[np.array(groups)==g, col] for g in set(groups)]\n    f_stat, p_val = f_oneway(*groups_list)\n    print(f\"DV {col}: F={f_stat:.2f}, p={p_val:.4f}\")"
                  }
        ],
        tips: [
                  "Pillai's trace is more robust to violations of assumptions (especially small/unequal samples) — prefer it over Wilks' Lambda.",
                  "Use MANOVA only if DVs are moderately correlated (r = 0.3-0.7); if uncorrelated, separate ANOVAs are fine.",
                  "Check Box's M: if significant, consider robust MANOVA or use Pillai's trace (less sensitive).",
                  "Always standardize DVs if they have different units/variances — MANOVA is scale-sensitive."
        ],
        mistake: "Running separate ANOVAs for each DV without MANOVA — this inflates family-wise Type I error and ignores DV correlations.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFull assumption checking + all test statistics\n// More explicit but longer",
          concise: "`manova(model) |> summary()` in R; statsmodels MANOVA class (if available)",
        },
      },
      {
        id: "structural-equation-modeling",
        fn: "Structural Equation Modeling (SEM) Basics",
        desc: "Test causal hypotheses via measurement + structural models and assess fit.",
        category: "Multivariate Analysis",
        subtitle: "Measurement model, structural model, path diagram, fit indices (CFI, RMSEA, SRMR)",
        signature: "Measurement: X = Λ·F + δ  |  Structural: η = B·η + Γ·ξ + ζ  |  Model fit: CFI, RMSEA, SRMR",
        descLong: "SEM combines factor analysis (measurement model: observed → latent) with path analysis (structural model: latent relationships). Path diagram visualizes hypotheses. Fit indices evaluate model-data agreement: CFI ≥ 0.95, RMSEA ≤ 0.06, SRMR ≤ 0.08. Modification indices suggest model improvements (but require theoretical justification). SEM tests indirect effects (mediation) and simultaneous relationships. Requires large samples: 10-20 observations per estimated parameter.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Structural Equation Modeling (SEM) Basics — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# Use lavaan package in R\n# Python alternatives: semopy, PyMC, or statsmodels (limited)\n# ── R/lavaan example ──────────────────────────────────\n# R code (pseudocode converted to Python-style)\n# Measurement model (CFA):\n# Latent factor F1 measured by x1, x2, x3\n# F1 =~ x1 + x2 + x3\n# Latent factor F2 measured by x4, x5, x6\n# F2 =~ x4 + x5 + x6\n# Structural model: F1 → F2 (F1 causes F2)\n# F2 ~ F1\n# Full model:\n# F1 =~ x1 + x2 + x3\n# F2 =~ x4 + x5 + x6\n# F2 ~ F1  # structural path"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Structural Equation Modeling (SEM) Basics — common patterns you'll see in production.\n# APPROACH  - Combine Structural Equation Modeling (SEM) Basics with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Fit model ──────────────────────────────────────────\n# fit <- cfa(model, data=df)\n# fit <- sem(model, data=df)  # includes structural paths\n# ── Examine results ────────────────────────────────────\n# summary(fit)  # parameter estimates, standard errors, p-values\n# Path coefficients show direct effects\n# Indirect effects = product of path coefficients\n# Total effect = direct + indirect\n# ── Fit indices ────────────────────────────────────────\n# Good fit thresholds:\n#   CFI (Comparative Fit Index) ≥ 0.95\n#   TLI (Tucker-Lewis Index) ≥ 0.95\n#   RMSEA (Root Mean Square Error Approx) ≤ 0.06\n#   SRMR (Std Root Mean Squared Residual) ≤ 0.08\n#   χ² p-value > 0.05 (but sensitive to sample size)\n# fitMeasures(fit)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Structural Equation Modeling (SEM) Basics — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Mediation analysis ────────────────────────────────\n# X → M → Y  (M is mediator)\n# Direct effect: X → Y\n# Indirect effect: X → M → Y (product of two paths)\n# Total effect = direct + indirect\n# Test indirect effect via bootstrapped CI\n# parameterEstimates(fit)\n# ── Modification indices ───────────────────────────────\n# modificationIndices(fit)\n# Suggests paths/covariances to add (with largest χ² drop)\n# WARNING: Data-driven modifications inflate Type I error\n# Only add if theoretically justified"
                  }
        ],
        tips: [
                  "Always draw the path diagram first — forces you to specify hypotheses explicitly.",
                  "Report multiple fit indices: CFI, RMSEA, SRMR — no single index is sufficient.",
                  "Use bootstrapped confidence intervals for indirect effects (mediation) — Sobel test assumes normality.",
                  "Sample size rule: 10-20 observations per estimated parameter (e.g., 200 observations for 15 parameters)."
        ],
        mistake: "Data-driven model modification (adding paths based on modification indices without theory). This capitalizes on chance and produces non-replicable models. Always have a priori hypotheses.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFull model specification + fit diagnostics + modification indices\n// More explicit but longer",
          concise: "`lavaan::sem(model_string, data=df)` in R; semopy or statsmodels in Python",
        },
      },
      {
        id: "confirmatory-factor",
        fn: "Confirmatory Factor Analysis (CFA)",
        desc: "Test hypothesized measurement structure and compute fit indices.",
        category: "Multivariate Analysis",
        subtitle: "Factor loadings, modification indices, fit measures, cross-loadings, convergent/discriminant validity",
        signature: "X = Λ·F + δ  |  CFI, RMSEA, SRMR  |  Modification indices",
        descLong: "CFA tests whether a pre-specified factor structure fits the data (unlike EFA which explores). Estimate factor loadings, error variances, and factor correlations. Test convergent validity (items load highly on intended factor) and discriminant validity (low cross-loadings). Fit indices assess model-data agreement. Modification indices suggest improvements. Essential for validating measurement scales before using them in downstream analyses.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Confirmatory Factor Analysis (CFA) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# Python: semopy package (limited CFA support)\n# R/lavaan: much more mature\n# ── CFA Model Specification (R/lavaan syntax) ────────\n# 3-factor CFA:\n#\n# # Factor 1: measured by x1, x2, x3\n# F1 =~ x1 + x2 + x3\n#\n# # Factor 2: measured by x4, x5, x6\n# F2 =~ x4 + x5 + x6\n#\n# # Factor 3: measured by x7, x8\n# F3 =~ x7 + x8\n#\n# # Allow factors to correlate\n# F1 ~~ F2\n# F1 ~~ F3\n# F2 ~~ F3\n# ── Fit model ──────────────────────────────────────────\n# fit <- cfa(model, data=df)\n# ── Summary and diagnostics ────────────────────────────\n# summary(fit, standardized=TRUE, fit.measures=TRUE)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Confirmatory Factor Analysis (CFA) — common patterns you'll see in production.\n# APPROACH  - Combine Confirmatory Factor Analysis (CFA) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Standardized loadings (pattern matrix)\n#   Values range -1 to 1\n#   Usually want λ > 0.7 (good) or ≥ 0.5 (acceptable)\n# Factor variances and correlations\n#   Should be interpretable and theory-aligned\n# ── Fit measures ───────────────────────────────────────\n# fitMeasures(fit)\n# CFI (Comparative Fit Index)\n#   0-1 scale, ≥ 0.95 is good\n#   Compares to null model (no structure)\n# RMSEA (Root Mean Square Error of Approximation)\n#   ≤ 0.06 is good, ≤ 0.08 is acceptable\n#   Penalizes model complexity\n# SRMR (Standardized Root Mean Squared Residual)\n#   ≤ 0.08 is good\n#   Based on residual correlations\n# ── Model modification ────────────────────────────────\n# modificationIndices(fit, sort. = TRUE)\n#\n# Largest MI values suggest paths to add\n# Focus on:\n#   Cross-loadings (item loads on wrong factor)\n#   Error covariances (measurement errors are correlated)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Confirmatory Factor Analysis (CFA) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Add judiciously and only with theoretical justification\n# ── Convergent and Discriminant Validity ────────────\n# Convergent: items load highly on intended factor\n#   λ > 0.5, ideally > 0.7\n#   AVE (Average Variance Extracted) > 0.5\n# Discriminant: factors are distinct\n#   Correlation < √AVE for each factor\n#   Factor correlation < 0.85 (rough threshold)\n# ── Compare nested models ──────────────────────────────\n# anova(fit1, fit2)  # likelihood ratio test\n#\n# Δχ² test: is simpler model significantly worse?\n# If p > 0.05, simpler model is adequate (parsimony)"
                  }
        ],
        tips: [
                  "Start with a simple theoretically-motivated model — don't let the data dictate structure.",
                  "Loadings should be ≥ 0.5 (acceptable) or ≥ 0.7 (good); low loadings suggest item doesn't measure construct.",
                  "Cross-loadings > 0.3 are problematic (item related to multiple factors) — investigate or remove.",
                  "Modification indices are suggestions — always ask if the addition makes theoretical sense."
        ],
        mistake: "Modifying the model based solely on modification indices. Each modification is a hypothesis test. Repeated modifications increase Type I error. Specify the model a priori based on theory.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSpecify model + fit + interpret loadings + modify if justified\n// More explicit but longer",
          concise: "`cfa(model_spec, data=df) |> summary()` in R",
        },
      },
      {
        id: "multidimensional-scaling",
        fn: "Multidimensional Scaling (MDS)",
        desc: "Visualize high-dimensional distances in low dimensions via dimensionality reduction.",
        category: "Visualization",
        subtitle: "Euclidean MDS, stress measure, distance matrices, ordination, dissimilarity",
        signature: "Minimize Σ(d_ij - ||x_i - x_j||)²  |  Stress = √Σ(residuals²) / Σ(d_ij²)  |  Scree plot",
        descLong: "MDS converts a distance (dissimilarity) matrix into coordinates in low-dimensional space. Classic MDS (metric) assumes Euclidean distances; non-metric MDS uses ranks only. Preserves pairwise distances as much as possible. Stress measure: low stress = good fit, high stress = poor fit. Often produces 2D maps interpretable like PCA but can start from ANY distance matrix (text, phylogenetic, perceptual). Widely used in psychology, ecology, linguistics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Multidimensional Scaling (MDS) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.manifold import MDS\nfrom scipy.spatial.distance import pdist, squareform\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── Metric MDS (Euclidean) ────────────────────────────\nX = np.array([...])  # (n_samples, n_features)\n# Compute pairwise distances\ndistances = pdist(X, metric='euclidean')\ndistance_matrix = squareform(distances)\n# Fit MDS\nmds = MDS(n_components=2, dissimilarity='precomputed', random_state=42)\ncoordinates = mds.fit_transform(distance_matrix)\n# ── Stress measure ────────────────────────────────────\nstress = mds.stress_\nprint(f\"Stress: {stress:.4f}\")\n# Interpretation:\n#   < 0.05:  excellent\n#   0.05-0.1: good\n#   0.1-0.15: fair\n#   0.15-0.2: poor\n#   > 0.2:  very poor\n# ── Plot MDS results ──────────────────────────────────\nplt.scatter(coordinates[:, 0], coordinates[:, 1], alpha=0.6, s=100)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Multidimensional Scaling (MDS) — common patterns you'll see in production.\n# APPROACH  - Combine Multidimensional Scaling (MDS) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Add labels (optional)\nfor i, label in enumerate(['A', 'B', 'C', ...]):\n    plt.annotate(label, (coordinates[i, 0], coordinates[i, 1]))\nplt.xlabel('Dimension 1')\nplt.ylabel('Dimension 2')\nplt.title(f'MDS (Stress = {stress:.4f})')\nplt.grid(True, alpha=0.3)\nplt.show()\n# ── Non-metric MDS (uses ranks only) ───────────────────\nfrom sklearn.manifold import MDS\nmds_nonmetric = MDS(n_components=2, dissimilarity='precomputed',\n                     metric=False, random_state=42)\ncoords_nm = mds_nonmetric.fit_transform(distance_matrix)\n# ── Scree plot: stress vs number of dimensions ───────\nstresses = []\ndims = range(1, 6)\nfor dim in dims:\n    mds_temp = MDS(n_components=dim, dissimilarity='precomputed', random_state=42)\n    mds_temp.fit(distance_matrix)\n    stresses.append(mds_temp.stress_)\nplt.plot(dims, stresses, marker='o')\nplt.xlabel('Dimension')\nplt.ylabel('Stress')\nplt.title('Scree Plot (MDS)')\nplt.grid(True, alpha=0.3)\nplt.show()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Multidimensional Scaling (MDS) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Compare to PCA ────────────────────────────────────\nfrom sklearn.decomposition import PCA\npca = PCA(n_components=2)\npca_coords = pca.fit_transform(X)\nplt.figure(figsize=(12, 5))\nplt.subplot(1, 2, 1)\nplt.scatter(coordinates[:, 0], coordinates[:, 1], alpha=0.6)\nplt.title('MDS')\nplt.subplot(1, 2, 2)\nplt.scatter(pca_coords[:, 0], pca_coords[:, 1], alpha=0.6)\nplt.title('PCA')\nplt.show()\n# MDS: preserves global distances\n# PCA: maximizes variance (different objective)"
                  }
        ],
        tips: [
                  "MDS works with ANY distance metric — use when you have unusual distances (text similarity, phylogenetic distance, perceptual dissimilarity).",
                  "Stress < 0.1 is generally acceptable; < 0.05 is good.",
                  "Non-metric MDS is more flexible (uses ranks only) but typically similar to metric MDS.",
                  "Compare MDS to PCA: PCA maximizes variance, MDS preserves global distances — they can differ substantially."
        ],
        mistake: "Using MDS with a distance matrix that violates metric properties (e.g., asymmetric). Standard MDS assumes symmetric Euclidean distances. For non-Euclidean data, use non-metric MDS.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCompute distances + fit + interpret stress + visualize\n// More explicit but longer",
          concise: "`MDS(n_components=2, dissimilarity='precomputed').fit_transform(D)` or R `cmdscale()`",
        },
      },
    ],
  },

  // ── Section 5: Advanced Dimensionality Reduction for Visualization ─────────────────────────────────────────
  {
    id: "advanced-visualization",
    title: "Advanced Dimensionality Reduction for Visualization",
    entries: [
      {
        id: "tsne-umap",
        fn: "t-SNE & UMAP — Nonlinear Dimensionality Reduction",
        desc: "Visualize high-dimensional data by preserving local structure in 2D/3D.",
        category: "Visualization",
        subtitle: "t-SNE, UMAP, perplexity, n_neighbors, local vs global structure",
        signature: "t-SNE: minimize KL divergence  |  UMAP: preserve local/global distances  |  Perplexity (5-50), n_neighbors (5-50)",
        descLong: "t-SNE (t-distributed Stochastic Neighbor Embedding) converts distances into probabilities, preserves local neighborhoods. Excellent for visualization but not for dimensionality reduction (distances change, nonlinear). UMAP (Uniform Manifold Approximation and Projection) preserves both local and global structure, scales better to large datasets. Both nonlinear, stochastic (results vary slightly), computationally expensive. Perplexity (t-SNE) and n_neighbors (UMAP) control neighborhood size — balance local detail vs global structure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of t-SNE & UMAP — Nonlinear Dimensionality Reduction — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.manifold import TSNE\nimport umap\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── t-SNE Visualization ────────────────────────────────\nX = np.array([...])  # (n_samples, n_features)\nlabels = np.array([...])  # class labels for coloring\n# Fit t-SNE\ntsne = TSNE(n_components=2, random_state=42, perplexity=30, n_iter=1000)\nX_tsne = tsne.fit_transform(X)\n# ── Plot t-SNE ────────────────────────────────────────\nplt.figure(figsize=(10, 8))\nscatter = plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=labels, cmap='viridis',\n                      alpha=0.6, s=50)\nplt.xlabel('t-SNE 1')\nplt.ylabel('t-SNE 2')\nplt.title('t-SNE Visualization')\nplt.colorbar(scatter)\nplt.show()\n# ── t-SNE Parameters ──────────────────────────────────\n# perplexity: 5-50 (balance local vs global)\n#   Low (5-10): emphasize local structure\n#   High (30-50): preserve global structure\n# n_iter: 1000+ (convergence, may need 5000 for large data)\n# random_state: for reproducibility"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of t-SNE & UMAP — Nonlinear Dimensionality Reduction — common patterns you'll see in production.\n# APPROACH  - Combine t-SNE & UMAP — Nonlinear Dimensionality Reduction with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── UMAP Visualization ────────────────────────────────\nreducer = umap.UMAP(n_components=2, random_state=42, n_neighbors=15, min_dist=0.1)\nX_umap = reducer.fit_transform(X)\nplt.figure(figsize=(10, 8))\nscatter = plt.scatter(X_umap[:, 0], X_umap[:, 1], c=labels, cmap='viridis',\n                      alpha=0.6, s=50)\nplt.xlabel('UMAP 1')\nplt.ylabel('UMAP 2')\nplt.title('UMAP Visualization')\nplt.colorbar(scatter)\nplt.show()\n# ── UMAP Parameters ────────────────────────────────────\n# n_neighbors: 5-50 (neighborhood size)\n#   Low: emphasize local structure\n#   High: preserve global structure\n# min_dist: 0.0-0.99 (allow overlapping points?)\n#   Low (0.0-0.1): tight clusters\n#   High (0.5-0.99): spread out\n# metric: distance metric ('euclidean', 'manhattan', 'cosine', etc.)\n# ── Comparison: t-SNE vs UMAP ─────────────────────────\n# t-SNE: local structure, slower, stochastic\n# UMAP: local + global, faster, more stable\n# Both: excellent for visualization, not for features"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of t-SNE & UMAP — Nonlinear Dimensionality Reduction — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── 3D visualization ───────────────────────────────────\nfrom mpl_toolkits.mplot3d import Axes3D\ntsne_3d = TSNE(n_components=3, random_state=42)\nX_tsne_3d = tsne_3d.fit_transform(X)\nfig = plt.figure()\nax = fig.add_subplot(111, projection='3d')\nscatter = ax.scatter(X_tsne_3d[:, 0], X_tsne_3d[:, 1], X_tsne_3d[:, 2],\n                     c=labels, cmap='viridis', s=50)\nplt.colorbar(scatter)\nplt.show()\n# ── Common mistakes & tips ────────────────────────────\n# DO NOT use for feature engineering (non-invertible)\n# DO use for exploratory visualization\n# Always set random_state for reproducibility\n# Run multiple times with different random states\n# If clusters look \"too perfect\", may be artifact of algorithm"
                  }
        ],
        tips: [
                  "t-SNE and UMAP are for VISUALIZATION only — use PCA, ICA, or UMAP on original scale for feature engineering.",
                  "Perplexity (t-SNE): rule of thumb is 5-50; use smaller values (5-15) for small datasets, larger (30-50) for large.",
                  "UMAP is faster and preserves more global structure than t-SNE — use UMAP for exploratory analysis.",
                  "Set random_state and run multiple times — results are stochastic and sensitive to random seed."
        ],
        mistake: "Using t-SNE/UMAP-reduced features for downstream modeling. The reduction is nonlinear and non-invertible — distances are destroyed. Use these only for visualization/exploration.",
        shorthand: {
          verbose: "// Manual / verbose approach\nParameter tuning + comparison + 3D exploration\n// More explicit but longer",
          concise: "`TSNE(n_components=2).fit_transform(X)` or `umap.UMAP().fit_transform(X)`",
        },
      },
      {
        id: "mixture-models",
        fn: "Gaussian Mixture Models (GMM) — Probabilistic Clustering",
        desc: "Soft clustering via mixture of Gaussian distributions with EM algorithm.",
        category: "Clustering",
        subtitle: "BIC model selection, mixture coefficients, covariance structures, soft vs hard clustering",
        signature: "p(x) = Σₖ πₖ·𝒩(x|μₖ,Σₖ)  |  BIC = -2ll + p·log(n)  |  EM algorithm",
        descLong: "GMM models data as a mixture of k Gaussian distributions. Unlike k-means (hard assignment), GMM provides soft probabilities (responsibility) for each point to each cluster. EM algorithm iteratively estimates parameters. BIC selects optimal number of components. Handles elliptical clusters, provides uncertainty. Covariance structure options: full (flexible), tied (same for all clusters), diag (conditional independence), spherical (same variance).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Gaussian Mixture Models (GMM) — Probabilistic Clustering — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom sklearn.mixture import GaussianMixture\nfrom sklearn.metrics import silhouette_score\nimport numpy as np\nimport matplotlib.pyplot as plt\n# ── Fit GMM with fixed k ────────────────────────────\nX = np.array([...])  # (n_samples, n_features)\ngmm = GaussianMixture(n_components=3, covariance_type='full', random_state=42)\ngmm.fit(X)\n# ── Examine results ────────────────────────────────────\nprint(f\"Converged: {gmm.converged_}\")\nprint(f\"Weights (π): {gmm.weights_}\")  # mixture coefficients\nprint(f\"Means (μ): {gmm.means_}\")\nprint(f\"Covariances (Σ): {gmm.covariances_}\")\n# ── Soft assignments (responsibilities) ───────────────\nresponsibilities = gmm.predict_proba(X)\n# Shape: (n_samples, n_components)\n# Each row sums to 1\n# High value = confident assignment to that cluster\n# Hard assignments\nlabels = gmm.predict(X)\n# ── Model selection via BIC ────────────────────────────\n# Find optimal number of components\nbic_scores = []\naic_scores = []\nk_range = range(1, 11)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Gaussian Mixture Models (GMM) — Probabilistic Clustering — common patterns you'll see in production.\n# APPROACH  - Combine Gaussian Mixture Models (GMM) — Probabilistic Clustering with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfor k in k_range:\n    gmm_temp = GaussianMixture(n_components=k, random_state=42)\n    gmm_temp.fit(X)\n    bic_scores.append(gmm_temp.bic(X))\n    aic_scores.append(gmm_temp.aic(X))\noptimal_k = k_range[np.argmin(bic_scores)]\nprint(f\"Optimal k (BIC): {optimal_k}\")\n# ── Plot BIC curve ────────────────────────────────────\nplt.figure(figsize=(10, 5))\nplt.subplot(1, 2, 1)\nplt.plot(k_range, bic_scores, marker='o')\nplt.xlabel('Number of components')\nplt.ylabel('BIC')\nplt.title('BIC Model Selection')\nplt.grid()\n# ── Covariance structures ──────────────────────────────\n# 'full': Σₖ (full covariance, most flexible)\n# 'tied': Σ (shared covariance, more parsimonious)\n# 'diag': diagonal (conditional independence assumption)\n# 'spherical': σ² (same variance in all directions)\ntypes = ['full', 'tied', 'diag', 'spherical']\nfor cov_type in types:\n    gmm_t = GaussianMixture(n_components=3, covariance_type=cov_type)\n    gmm_t.fit(X)\n    print(f\"{cov_type}: BIC={gmm_t.bic(X):.0f}\")\n# ── Compare GMM vs k-means ────────────────────────────\n# k-means: hard assignment, faster, non-probabilistic\n# GMM: soft assignment, probabilistic, handles ellipses"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Gaussian Mixture Models (GMM) — Probabilistic Clustering — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── 2D visualization ──────────────────────────────────\nif X.shape[1] == 2:\n    h = 0.02  # step size\n    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1\n    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1\n    xx, yy = np.meshgrid(np.arange(x_min, x_max, h),\n                         np.arange(y_min, y_max, h))\n    # Predict grid\n    Z = gmm.predict(np.c_[xx.ravel(), yy.ravel()])\n    Z = Z.reshape(xx.shape)\n    plt.subplot(1, 2, 2)\n    plt.contourf(xx, yy, Z, alpha=0.3)\n    plt.scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis', s=50)\n    plt.scatter(gmm.means_[:, 0], gmm.means_[:, 1],\n                c='red', marker='X', s=200, edgecolors='black', linewidth=2)\n    plt.xlabel('Feature 1')\n    plt.ylabel('Feature 2')\n    plt.title('GMM Clustering')\n    plt.show()\n# ── Log-likelihood ────────────────────────────────────\nll = gmm.score(X)  # log-likelihood per sample\nprint(f\"Average log-likelihood: {ll:.3f}\")\n# Higher is better (model explains data better)"
                  }
        ],
        tips: [
                  "BIC penalizes model complexity — it selects the simplest model that fits well.",
                  "Use responsibilities (soft assignments) for uncertainty quantification — GMM gives confidence scores.",
                  "Try covariance_type='tied' for efficiency and covariance_type='full' for flexibility.",
                  "GMM assumes multivariate normality — fails on non-Gaussian data (e.g., ring clusters)."
        ],
        mistake: "Using BIC to select k without visual inspection. A BIC curve can have multiple local minima. Always plot BIC curve and visualize clustering results.",
        shorthand: {
          verbose: "// Manual / verbose approach\nBIC model selection + covariance comparison + visualization\n// More explicit but longer",
          concise: "`GaussianMixture(n_components=k).fit(X)` or R `mclust::Mclust(X)`",
        },
      },
      {
        id: "correspondence-analysis",
        fn: "Correspondence Analysis (CA) — Categorical Data Visualization",
        desc: "Visualize associations between categorical variables via contingency table analysis.",
        category: "Visualization",
        subtitle: "Chi-square distance, biplot, inertia, row/column profiles",
        signature: "χ² distance  |  row/column masses  |  inertia = Σχ²/n  |  biplot",
        descLong: "CA analyzes contingency tables by computing row and column profiles (proportions). Maps categories as points in low-dimensional space preserving chi-square distances. Proximity in map ↔ similar patterns across categories. Biplot shows both row and column points. Inertia (total chi-square / sample size) measures strength of association. Particularly useful for exploring survey responses, word-document matrices, or any 2-way cross-tabulation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Correspondence Analysis (CA) — Categorical Data Visualization — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# Python: prince package or prince via statsmodels\nfrom prince import CA\nimport pandas as pd\nimport numpy as np\n# ── Create contingency table ──────────────────────────\n# Example: survey data with categories\ndata = pd.DataFrame({\n    'Education': ['HS', 'HS', 'College', 'College', 'HS', 'Grad', ...],\n    'Income': ['Low', 'Medium', 'Medium', 'High', 'Low', 'High', ...],\n})\n# ── Fit Correspondence Analysis ───────────────────────\nca = CA(n_components=2)\nca_result = ca.fit_transform(data)\n# Row scores (category positions)\nrow_coords = ca_result[0]\n# Column scores\ncol_coords = ca_result[1]\n# ── Visualize biplot ──────────────────────────────────\nimport matplotlib.pyplot as plt\nfig, ax = plt.subplots(figsize=(10, 8))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Correspondence Analysis (CA) — Categorical Data Visualization — common patterns you'll see in production.\n# APPROACH  - Combine Correspondence Analysis (CA) — Categorical Data Visualization with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Plot row points\nax.scatter(row_coords.iloc[:, 0], row_coords.iloc[:, 1],\n           c='blue', s=100, alpha=0.6, label='Education')\nfor idx in row_coords.index:\n    ax.annotate(idx, (row_coords.loc[idx, 0], row_coords.loc[idx, 1]))\n# Plot column points\nax.scatter(col_coords.iloc[:, 0], col_coords.iloc[:, 1],\n           c='red', s=100, alpha=0.6, label='Income')\nfor idx in col_coords.index:\n    ax.annotate(idx, (col_coords.loc[idx, 0], col_coords.loc[idx, 1]))\nax.axhline(y=0, c='k', linestyle='--', alpha=0.3)\nax.axvline(x=0, c='k', linestyle='--', alpha=0.3)\nax.set_xlabel(f'CA1 ({ca.eigenvalues_[0]:.1%} inertia)')\nax.set_ylabel(f'CA2 ({ca.eigenvalues_[1]:.1%} inertia)')\nax.set_title('Correspondence Analysis Biplot')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.show()\n# ── Interpretation ────────────────────────────────────\n# Distance in map ↔ degree of association\n# Points far apart = dissimilar patterns\n# Points close together = similar patterns"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Correspondence Analysis (CA) — Categorical Data Visualization — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Example: 'HS' education close to 'Low' income = association\n# ── Inertia (strength of association) ──────────────────\n# Total inertia = chi-square / n\n# Dimension 1 inertia = first eigenvalue\n# Dimension 2 inertia = second eigenvalue\ntotal_inertia = ca.inertia_\ndim1_pct = ca.eigenvalues_[0] / total_inertia\ndim2_pct = ca.eigenvalues_[1] / total_inertia\nprint(f\"Dimension 1: {dim1_pct:.1%}\")\nprint(f\"Dimension 2: {dim2_pct:.1%}\")\nprint(f\"Total: {dim1_pct + dim2_pct:.1%}\")\n# ── Contributions ────────────────────────────────────\n# Which row/column points drive each dimension?\n# High contribution → important for that dimension\n# prince provides: ca.column_contributions_, ca.row_contributions_"
                  }
        ],
        tips: [
                  "CA is ideal for survey data, word frequencies, and any contingency table analysis.",
                  "Biplot interpretation: proximity ↔ similar patterns; distance ↔ dissimilarity.",
                  "Check total inertia explained in first 2-3 dimensions — if low, may need more dimensions.",
                  "Compare to chi-square test: CA shows WHERE associations are; chi-square test IF associations exist."
        ],
        mistake: "Interpreting CA distances as Euclidean — they are chi-square distances, reflecting proportional associations. Small data tables can have misleading maps.",
        shorthand: {
          verbose: "// Manual / verbose approach\nBiplot interpretation + contributions + inertia breakdown\n// More explicit but longer",
          concise: "`CA(n_components=2).fit_transform(data)` or R `ca::ca(contingency_table)`",
        },
      },
    ],
  },
]

export default { meta, sections }
