export const meta = {
  "id": "causal-inference",
  "label": "Causal Inference & Advanced Methods",
  "icon": "🔬",
  "description": "Causal inference (DAGs, propensity scores, DiD, IV), non-parametric tests, effect sizes, simulation, and survey methods."
}

export const sections = [

  // ── Section 1: Causal Inference Methods ─────────────────────────────────────────
  {
    id: "causal-methods",
    title: "Causal Inference Methods",
    entries: [
      {
        id: "causal-dag-psm",
        fn: "DAGs, Propensity Scores & Matching",
        desc: "Identify causal effects from observational data: DAGs for confounders, propensity score matching, inverse probability weighting, and covariate balance.",
        category: "Causal",
        subtitle: "DAG, confounders, propensity score, PSM, IPW, ATE, ATT, covariate balance",
        signature: "ATE = E[Y(1)] - E[Y(0)]  |  PS = P(T=1|X)  |  IPW: w = 1/PS  |  matching",
        descLong: "Causal inference estimates what would happen under different treatments using observational data. Directed Acyclic Graphs (DAGs) encode causal assumptions and identify confounders to control for. Propensity Score Matching (PSM) pairs treated and control units with similar probability of treatment. Inverse Probability Weighting (IPW) reweights the sample to create a pseudo-population where treatment is independent of confounders. The Average Treatment Effect (ATE) estimates the effect on the full population; ATT estimates it for the treated subgroup. Always check covariate balance after matching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of DAGs, Propensity Scores & Matching — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nimport pandas as pd\nfrom sklearn.linear_model import LogisticRegression\nfrom scipy import stats\n# ── Propensity Score Estimation ──────────────────────\n# Estimate P(treatment=1 | covariates)\nX = df[[\"age\", \"income\", \"education\", \"prior_usage\"]]\ntreatment = df[\"received_training\"]\nps_model = LogisticRegression(max_iter=1000)\nps_model.fit(X, treatment)\ndf[\"propensity_score\"] = ps_model.predict_proba(X)[:, 1]\n# ── Propensity Score Matching (PSM) ──────────────────\nfrom sklearn.neighbors import NearestNeighbors\ntreated = df[df[\"received_training\"] == 1]\ncontrol = df[df[\"received_training\"] == 0]\nnn = NearestNeighbors(n_neighbors=1, metric=\"euclidean\")\nnn.fit(control[[\"propensity_score\"]])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of DAGs, Propensity Scores & Matching — common patterns you'll see in production.\n# APPROACH  - Combine DAGs, Propensity Scores & Matching with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ndistances, indices = nn.kneighbors(treated[[\"propensity_score\"]])\nmatched_control = control.iloc[indices.flatten()]\n# ATT (Average Treatment Effect on the Treated)\natt = treated[\"outcome\"].mean() - matched_control[\"outcome\"].mean()\nprint(f\"ATT: {att:.3f}\")\n# ── Covariate Balance Check (critical!) ──────────────\ndef standardized_mean_diff(treated, control, col):\n    \"\"\"SMD < 0.1 indicates good balance.\"\"\"\n    d = treated[col].mean() - control[col].mean()\n    s = np.sqrt((treated[col].var() + control[col].var()) / 2)\n    return d / s if s > 0 else 0\nfor col in [\"age\", \"income\", \"education\"]:\n    before = standardized_mean_diff(\n        df[df.received_training==1], df[df.received_training==0], col)\n    after = standardized_mean_diff(treated, matched_control, col)\n    print(f\"{col}: SMD before={before:.3f}, after={after:.3f}\")\n# ── Inverse Probability Weighting (IPW) ──────────────\nps = df[\"propensity_score\"]\nt = df[\"received_training\"]\ny = df[\"outcome\"]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of DAGs, Propensity Scores & Matching — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# IPW weights\nweights = t / ps + (1 - t) / (1 - ps)\n# Weighted ATE\nate_ipw = (\n    np.average(y[t == 1], weights=weights[t == 1]) -\n    np.average(y[t == 0], weights=weights[t == 0])\n)\nprint(f\"ATE (IPW): {ate_ipw:.3f}\")\n# Trim extreme weights (stabilization)\nweights_trimmed = np.clip(weights, np.percentile(weights, 1),\n                          np.percentile(weights, 99))"
                  }
        ],
        tips: [
                  "Always draw a DAG first — it forces you to state causal assumptions explicitly and identifies which variables to condition on.",
                  "Check covariate balance after matching: SMD < 0.1 for all covariates is the standard threshold for adequate balance.",
                  "IPW is more flexible than matching (uses all data, no discards) but sensitive to extreme propensity scores — always trim weights.",
                  "Propensity scores control for observed confounders only — unobserved confounders require instrumental variables or natural experiments."
        ],
        mistake: "Running a regression with \"all available controls\" instead of using a DAG to identify the right adjustment set — controlling for a collider or mediator biases the estimate. Let the DAG tell you what to include.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "difference-in-differences",
        fn: "Difference-in-Differences (DiD) — Policy Evaluation",
        desc: "Estimate causal effects by comparing pre-post changes between treated and control groups.",
        category: "Causal",
        subtitle: "DiD estimator, parallel trends assumption, event study, dynamic effects",
        signature: "DiD = (Y_treat_post - Y_treat_pre) - (Y_ctrl_post - Y_ctrl_pre)  |  parallel trends",
        descLong: "DiD compares how treated and control groups change over time. Assumes parallel trends: treated and control would have followed same trajectory absent treatment. The DiD estimate removes pre-existing differences and time-common shocks. Event study plots verify parallel trends visually (pre-treatment coefficients should be ~0). Dynamic DiD allows effects to vary over time. More credible than simple before-after comparisons because it controls for time-invariant differences.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Difference-in-Differences (DiD) — Policy Evaluation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport pandas as pd\nimport numpy as np\nimport statsmodels.formula.api as smf\n# ── Difference-in-Differences ──────────────────────────\n# Policy: minimum wage increase in state A (2020), state B is control\n# Method 1: Simple DiD calculation\ndata = pd.DataFrame({\n    'state': ['A', 'A', 'B', 'B'],\n    'period': ['pre', 'post', 'pre', 'post'],\n    'employment': [100, 98, 105, 107],  # aggregated\n})\npre_treat = data[(data.state=='A') & (data.period=='pre')]['employment'].values[0]\npost_treat = data[(data.state=='A') & (data.period=='post')]['employment'].values[0]\npre_ctrl = data[(data.state=='B') & (data.period=='pre')]['employment'].values[0]\npost_ctrl = data[(data.state=='B') & (data.period=='post')]['employment'].values[0]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Difference-in-Differences (DiD) — Policy Evaluation — common patterns you'll see in production.\n# APPROACH  - Combine Difference-in-Differences (DiD) — Policy Evaluation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ndid = (post_treat - pre_treat) - (post_ctrl - pre_ctrl)\nprint(f\"DiD estimate: {did:.2f}\")\n# Method 2: Regression DiD (with SEs)\ndf = pd.DataFrame({\n    'year': [2019, 2020, 2019, 2020],\n    'state': [1, 1, 0, 0],\n    'employment': [100, 98, 105, 107],\n})\ndf['post'] = (df['year'] >= 2020).astype(int)\ndf['treated'] = df['state'].astype(int)\nmodel = smf.ols('employment ~ treated * post', data=df).fit(cov_type='HC1')\nprint(model.summary())\n# Coefficient on treated:post is DiD estimate"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Difference-in-Differences (DiD) — Policy Evaluation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Event study (verify parallel trends) ──────────────\n# Create leads and lags relative to treatment\ndf['year_relative'] = df['year'] - 2020\nevent_formula = '''employment ~ C(year_relative, Treatment(reference_category=-1)) * treated'''\nevent_model = smf.ols(event_formula, data=df).fit(cov_type='HC1')\n# Pre-treatment coefficients should be ~0 (parallel trends)"
                  }
        ],
        tips: [
                  "Event study plots are the gold standard for checking parallel trends — pre-treatment effects should be ~0.",
                  "DiD works best with moderate sample sizes; with very large N, small spurious differences become \"significant\".",
                  "Parallel trends is not testable (it's about the counterfactual) — use event study as visual check.",
                  "Staggered adoption: some units treated at different times — use Callaway-Sant'Anna or de Chaisemartin-D'Haultfoeuille methods."
        ],
        mistake: "Using DiD when treated and control groups have diverging pre-trends. If pre-treatment slopes differ, parallel trends assumption likely fails. Always plot event study coefficients.",
        shorthand: {
          verbose: "// Manual / verbose approach\nEvent study + assumption checks\n// More explicit but longer",
          concise: "ols(Y ~ treated*post) or did package",
        },
      },
      {
        id: "regression-discontinuity",
        fn: "Regression Discontinuity Design (RDD)",
        desc: "Exploit cutoff rules to estimate local causal effects near the threshold.",
        category: "Causal",
        subtitle: "Sharp vs fuzzy RDD, bandwidth selection, McCrary test, local polynomial regression",
        signature: "lim_{x→c⁺} E[Y|X=x] - lim_{x→c⁻} E[Y|X=x]  |  Running variable cutoff",
        descLong: "RDD estimates causal effects using a threshold rule: treatment assigned deterministically (sharp) or probabilistically (fuzzy) based on a running variable. Exploits the assumption that variation near the cutoff is as-if random. Only identifies Local Average Treatment Effect (LATE) at the cutoff — may not generalize. McCrary test checks for manipulation of the running variable. Bandwidth selection critical: too narrow = noisy, too wide = biased. Nonparametric local polynomial regression is standard.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Regression Discontinuity Design (RDD) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\nfrom scipy import stats\n# ── Sharp RDD: treatment = 1 if test_score >= 80 ──────\ndf = pd.DataFrame({\n    'test_score': np.random.uniform(70, 90, 1000),\n    'college_gpa': np.random.normal(3.0, 0.5, 1000),\n})\ncutoff = 80\ndf['above'] = (df['test_score'] >= cutoff).astype(int)\n# Sharp RDD: deterministic treatment\n# Method 1: Simple regression near cutoff\nbandwidth = 5\ndf_window = df[(df['test_score'] >= cutoff - bandwidth) &\n               (df['test_score'] <= cutoff + bandwidth)]\n# Center running variable at cutoff\ndf_window['centered'] = df_window['test_score'] - cutoff\n# Local linear regression\nfrom scipy import stats\nX = df_window[['above', 'centered']].values\ny = df_window['college_gpa'].values\nmodel = np.polyfit(X[:, 1], y, 2)  # quadratic\n# Or use statsmodels for proper inference\nimport statsmodels.formula.api as smf\nrdd_model = smf.ols('college_gpa ~ above * centered', data=df_window).fit(cov_type='HC1')\nprint(rdd_model.summary())\n# Coefficient on 'above' is LATE at cutoff"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Regression Discontinuity Design (RDD) — common patterns you'll see in production.\n# APPROACH  - Combine Regression Discontinuity Design (RDD) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── McCrary test (manipulation of running variable) ────\n# H₀: density is continuous at cutoff (no manipulation)\n# Reject → evidence of manipulation\n# Histogram density test at cutoff\nhist_below = df[df['test_score'] < cutoff]['test_score'].value_counts().sort_index()\nhist_above = df[df['test_score'] >= cutoff]['test_score'].value_counts().sort_index()\n# Density at cutoff\nbelow_cutoff_density = len(df[df['test_score'].between(cutoff-1, cutoff)])\nabove_cutoff_density = len(df[df['test_score'].between(cutoff, cutoff+1)])\nprint(f\"Density discontinuity: below={below_cutoff_density}, above={above_cutoff_density}\")\n# ── Fuzzy RDD (probabilistic treatment) ───────────────\n# Treatment probability increases at cutoff but not = 1\n# Example: scholarship lottery with bonus points for test_score >= 80\ndf['treatment_prob'] = 1 / (1 + np.exp(-(df['test_score'] - cutoff) / 2))  # logistic\ndf['treated'] = (np.random.random(len(df)) < df['treatment_prob']).astype(int)\n# Fuzzy RDD via IV (2SLS)\n# Instrument: above_cutoff\n# First stage: predict treatment from cutoff indicator\nfrom linearmodels.iv import IV2SLS\n# Centered running variable\ndf['centered'] = df['test_score'] - cutoff\nfuzzy_model = IV2SLS.from_formula(\n    'college_gpa ~ centered + [treated ~ above]',\n    data=df\n).fit()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Regression Discontinuity Design (RDD) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Bandwidth selection ────────────────────────────────\n# Too small: high variance\n# Too large: bias at boundary\n# Typical: ±10% of range or data-driven (IK bandwidth)\n# ── Visualization ──────────────────────────────────────\nfig, ax = plt.subplots(1, 1, figsize=(10, 6))\n# Below cutoff\nbelow = df[df['test_score'] < cutoff]\nax.scatter(below['test_score'], below['college_gpa'], alpha=0.3, label='Below cutoff')\n# Above cutoff\nabove = df[df['test_score'] >= cutoff]\nax.scatter(above['test_score'], above['college_gpa'], alpha=0.3, label='Above cutoff')\nax.axvline(x=cutoff, color='r', linestyle='--', label='Cutoff')\nax.set_xlabel('Test Score (Running Variable)')\nax.set_ylabel('College GPA (Outcome)')\nax.set_title('Sharp RDD')\nax.legend()\nplt.show()"
                  }
        ],
        tips: [
                  "RDD gives very credible causal estimates but only at the cutoff — generalizability is limited.",
                  "Always check for manipulation of the running variable via McCrary test or density plot.",
                  "Use local linear regression with robust SEs — avoids edge effects of global polynomial.",
                  "Bandwidth = critical tuning parameter: report sensitivity to different bandwidths."
        ],
        mistake: "Assuming RDD estimates generalize far from the cutoff. RDD identifies LATE only at the threshold. Units far away may respond differently to treatment.",
        shorthand: {
          verbose: "// Manual / verbose approach\nMcCrary test + local polynomial + bandwidth robustness checks\n// More explicit but longer",
          concise: "rddensity and rdd packages (R); statsmodels (Python)",
        },
      },
      {
        id: "synthetic-control",
        fn: "Synthetic Control Method",
        desc: "Construct a weighted blend of control units to match treated unit pre-treatment.",
        category: "Causal",
        subtitle: "Donor pool, pre-treatment fit, placebo tests, weights, treatment trajectory",
        signature: "SC = Σ wⱼ Xⱼ  where Σ wⱼ=1, wⱼ≥0  |  minimize ||X_treated - SC||",
        descLong: "Synthetic Control selects a weighted combination of untreated units (donor pool) that closely matches the treated unit's pre-treatment characteristics. Exploits specific case studies (one or few treated units) common in policy evaluation. Pre-treatment fit critical: if weights assign high variance to pre-trends, estimates are unreliable. Placebo tests: apply method to pre-treatment periods (should show no effect) or to control units (should show no effect). High-dimensional pre-treatment data can be aggregated via PCA.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Synthetic Control Method — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\n# ── Synthetic Control Example ──────────────────────────\n# California tobacco control program (1989)\n# Data: pre-treatment years (1970-1988), post-treatment (1989-2000)\nyears = np.arange(1970, 2001)\npre_years = years[years < 1989]\npost_years = years[years >= 1989]\n# Treated unit: California\ncalifornia = np.array([140, 145, 140, 148, 150, 155, 160, 158, 155, 165,\n                       170, 172, 168, 170, 175, 177, 180, 178, 175, 180,\n                       125, 120, 118, 115, 110, 105, 100, 98, 95, 92, 90])\n# Control units (other states)\ncontrols = pd.DataFrame({\n    'year': years,\n    'Texas': np.random.normal(150, 10, len(years)),\n    'Florida': np.random.normal(160, 10, len(years)),\n    'Illinois': np.random.normal(145, 10, len(years)),\n    'Ohio': np.random.normal(155, 10, len(years)),\n})\n# ── Fit synthetic control ──────────────────────────────\n# Minimize pre-treatment MSE to find optimal weights\nfrom scipy.optimize import minimize"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Synthetic Control Method — common patterns you'll see in production.\n# APPROACH  - Combine Synthetic Control Method with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ndef mse_pre(weights):\n    synthetic = (controls[['Texas', 'Florida', 'Illinois', 'Ohio']].values * weights).sum(axis=1)\n    pre_treated = california[years < 1989]\n    pre_synthetic = synthetic[years < 1989]\n    return np.mean((pre_treated - pre_synthetic) ** 2)\n# Constraints: weights sum to 1, all non-negative\nconstraints = {'type': 'eq', 'fun': lambda w: np.sum(w) - 1}\nbounds = [(0, 1) for _ in range(4)]\ninitial_weights = np.array([0.25, 0.25, 0.25, 0.25])\nresult = minimize(mse_pre, initial_weights, method='SLSQP',\n                 bounds=bounds, constraints=constraints)\nweights = result.x\nprint(f\"Optimal weights: Texas={weights[0]:.2f}, Florida={weights[1]:.2f}, \"\n      f\"Illinois={weights[2]:.2f}, Ohio={weights[3]:.2f}\")\n# ── Construct synthetic control ────────────────────────\nsynthetic_control = (controls[['Texas', 'Florida', 'Illinois', 'Ohio']].values * weights).sum(axis=1)\n# ── Compute treatment effect ──────────────────────────\ntreatment_effect = california - synthetic_control\n# ── Plot results ──────────────────────────────────────\nplt.figure(figsize=(12, 6))\n# Pre-treatment period (should match closely)\nplt.plot(pre_years, california[years < 1989], 'b-', linewidth=2, label='California')\nplt.plot(pre_years, synthetic_control[years < 1989], 'r--', linewidth=2, label='Synthetic Control')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Synthetic Control Method — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Post-treatment period\nplt.plot(post_years, california[years >= 1989], 'b-', linewidth=2)\nplt.plot(post_years, synthetic_control[years >= 1989], 'r--', linewidth=2)\nplt.axvline(x=1989, color='k', linestyle=':', alpha=0.5)\nplt.xlabel('Year')\nplt.ylabel('Outcome')\nplt.legend()\nplt.title('Synthetic Control Method')\nplt.show()\n# ── Placebo test: apply method to pre-treatment period ─\n# Split pre-treatment into fake pre/post\nfake_treatment_year = 1980\npre_pre = years[years < fake_treatment_year]\npre_post = years[(years >= fake_treatment_year) & (years < 1989)]\n# Fit synthetic control using pre_pre period\n# Should show no effect in pre_post period\n# ── Visual inspection ──────────────────────────────────\n# Pre-treatment fit: are California and SC matched closely?\n# Post-treatment divergence: is gap due to treatment?\n# Placebo test: does \"fake\" treatment show similar gap?"
                  }
        ],
        tips: [
                  "Synthetic Control works best with one or few treated units — use when you have a compelling case study.",
                  "Pre-treatment fit is CRITICAL: if SC doesn't match pre-treatment well, post-treatment effects are unreliable.",
                  "Run placebo tests: apply to pre-treatment periods or to control units — effects should be near zero.",
                  "Sensitivity: report weights and pre-fit RMSE; experiment with different donor pools."
        ],
        mistake: "Using Synthetic Control when pre-treatment fit is poor. If the SC weights produce MSE > 10% of treated unit variance pre-treatment, the method fails.",
        shorthand: {
          verbose: "// Manual / verbose approach\nDonor pool selection + pre-fit validation + placebo tests\n// More explicit but longer",
          concise: "Synth package (R); python implementation via optimization",
        },
      },
      {
        id: "mediation-analysis",
        fn: "Mediation Analysis — Direct, Indirect & Total Effects",
        desc: "Decompose causal effects into direct (X→Y) and indirect (X→M→Y) pathways.",
        category: "Causal",
        subtitle: "Direct effect, indirect effect, mediation, bootstrapped confidence intervals, proportion mediated",
        signature: "Total Effect = Direct + Indirect  |  Indirect = a·b  |  CI via bootstrap",
        descLong: "Mediation analysis examines whether an effect of X on Y operates through a mediator M. Direct effect: X→Y (holding M constant). Indirect effect: X→M→Y (the mediation pathway). Total effect = direct + indirect. Baron & Kenny method is outdated (assumes normality); modern approach: bootstrap confidence intervals. Crucial assumption: no unmeasured confounding of M→Y relationship.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Mediation Analysis — Direct, Indirect & Total Effects — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nimport pandas as pd\nfrom scipy import stats\n# ── Mediation Analysis (X → M → Y) ──────────────────\n# Example: Does motivation (M) mediate the effect of\n#          training (X) on performance (Y)?\nX = np.random.normal(100, 15, 200)  # training (IV)\nM = 0.5 * X + np.random.normal(0, 10, 200)  # motivation (mediator)\nY = 0.3 * X + 0.4 * M + np.random.normal(0, 15, 200)  # performance (DV)\ndata = pd.DataFrame({'X': X, 'M': M, 'Y': Y})\n# ── Method 1: Baron & Kenny (outdated) ──────────────\nimport statsmodels.formula.api as smf\n# Total effect (c path)\nmodel_total = smf.ols('Y ~ X', data=data).fit()\nc_total = model_total.params['X']\nse_total = model_total.bse['X']\nprint(f\"Total effect (c): {c_total:.3f} ± {se_total:.3f}\")\n# Effect of X on M (a path)\nmodel_a = smf.ols('M ~ X', data=data).fit()\na_coeff = model_a.params['X']\nse_a = model_a.bse['X']\nprint(f\"a path (X→M): {a_coeff:.3f} ± {se_a:.3f}\")\n# Effect of M on Y, controlling for X (b path)\nmodel_b = smf.ols('Y ~ X + M', data=data).fit()\nb_coeff = model_b.params['M']\nc_direct = model_b.params['X']\nse_b = model_b.bse['M']\nprint(f\"b path (M→Y): {b_coeff:.3f} ± {se_b:.3f}\")\nprint(f\"Direct effect (c'): {c_direct:.3f}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Mediation Analysis — Direct, Indirect & Total Effects — common patterns you'll see in production.\n# APPROACH  - Combine Mediation Analysis — Direct, Indirect & Total Effects with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Indirect effect (product: a·b)\nindirect = a_coeff * b_coeff\nprint(f\"Indirect effect (a·b): {indirect:.3f}\")\n# ── Method 2: Bootstrapped confidence intervals (modern) ─\nfrom scipy.stats import bootstrap\ndef indirect_effect(X, M, Y):\n    \"\"\"Compute indirect effect for a sample.\"\"\"\n    # Fit a path\n    model_a = smf.ols('M ~ X',\n                      data=pd.DataFrame({'X': X, 'M': M})).fit()\n    a = model_a.params[1]\n    # Fit b path\n    model_b = smf.ols('Y ~ X + M',\n                      data=pd.DataFrame({'X': X, 'M': M, 'Y': Y})).fit()\n    b = model_b.params[2]\n    return a * b\n# Resample data with replacement\nn_bootstrap = 5000\nindirect_samples = []\nfor _ in range(n_bootstrap):\n    idx = np.random.choice(len(data), len(data), replace=True)\n    X_boot = data['X'].iloc[idx].values\n    M_boot = data['M'].iloc[idx].values\n    Y_boot = data['Y'].iloc[idx].values\n    indirect_samples.append(indirect_effect(X_boot, M_boot, Y_boot))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Mediation Analysis — Direct, Indirect & Total Effects — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nindirect_samples = np.array(indirect_samples)\nci_lower = np.percentile(indirect_samples, 2.5)\nci_upper = np.percentile(indirect_samples, 97.5)\nprint(f\"Indirect effect (95% CI): [{ci_lower:.3f}, {ci_upper:.3f}]\")\nprint(f\"p-value: {(indirect_samples < 0).mean()}\")  # is 0 in CI?\n# ── Proportion mediated ────────────────────────────────\npm = indirect / c_total  # indirect / total\nprint(f\"Proportion mediated: {pm:.1%}\")\n# ── Assumptions ────────────────────────────────────────\n# 1. No confounding of X→Y relationship (design)\n# 2. No confounding of X→M relationship (design)\n# 3. No confounding of M→Y relationship (CRITICAL; hard to test)\n# 4. No X→Y→M reverse causality (theory)"
                  }
        ],
        tips: [
                  "Use BOOTSTRAPPED confidence intervals for indirect effects, not Sobel test (which assumes normality).",
                  "Check for confounding of the M→Y relationship — sensitivity analysis is essential (e.g., sensemakr package).",
                  "Mediation requires the mediator to be on the causal pathway — correlational data often misleads.",
                  "Test for moderated mediation: does the indirect effect differ across groups? (modmedanalysis package in R)."
        ],
        mistake: "Using Sobel test or standard errors for indirect effects. Indirect effects are products of coefficients and are typically non-normal. Always bootstrap.",
        shorthand: {
          verbose: "// Manual / verbose approach\nAssumption checking + sensitivity analysis + moderated mediation\n// More explicit but longer",
          concise: "mediation (R) or manual bootstrap approach",
        },
      },
      {
        id: "sensitivity-analysis",
        fn: "Sensitivity Analysis — Robustness to Unmeasured Confounding",
        desc: "Quantify how much hidden confounding would overturn causal conclusions.",
        category: "Causal",
        subtitle: "E-values, Rosenbaum bounds, sensitivity parameters, hidden bias",
        signature: "E-value = RR + √(RR(RR-1))  |  Rosenbaum bounds  |  Γ (odds ratio increase for hidden confounder)",
        descLong: "Observational studies are vulnerable to unmeasured confounding. Sensitivity analysis answers: \"How large would hidden confounding need to be to change our conclusion?\" E-values: the minimum association (RR or OR) a confounder must have with treatment and outcome to explain away the observed effect. Rosenbaum bounds: test how likely randomization hypothesis is under hidden bias. Modern approach: sensemakr package (R) visualizes sensitivity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Sensitivity Analysis — Robustness to Unmeasured Confounding — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# sensemakr approach (R and Python now available)\n# Shows how much unmeasured confounding would be needed\nimport numpy as np\nimport pandas as pd\n# Example: Treatment effect = 0.5 (large effect)\n# What if there's a hidden confounder?\ntreatment_effect = 0.5\nse_effect = 0.1\nlower_ci = treatment_effect - 1.96 * se_effect\nupper_ci = treatment_effect + 1.96 * se_effect\nprint(f\"Estimated effect: {treatment_effect:.3f}\")\nprint(f\"95% CI: [{lower_ci:.3f}, {upper_ci:.3f}]\")\n# ── E-value calculation ────────────────────────────────\n# RR = relative risk (or OR for odds ratio)\n# E-value = RR + sqrt(RR(RR-1))\nfrom scipy.stats import norm\n# Convert effect estimate to relative risk\n# (if log(RR) is the coefficient)\nlog_rr = treatment_effect\nrr = np.exp(log_rr)\ndef e_value(rr):\n    if rr >= 1:\n        return rr + np.sqrt(rr * (rr - 1))\n    else:\n        return 1/rr + np.sqrt((1/rr) * ((1/rr) - 1))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Sensitivity Analysis — Robustness to Unmeasured Confounding — common patterns you'll see in production.\n# APPROACH  - Combine Sensitivity Analysis — Robustness to Unmeasured Confounding with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ne_val = e_value(rr)\nprint(f\"E-value: {e_val:.2f}\")\nprint(f\"A confounder would need to increase odds of \"\n      f\"treatment by {e_val:.2f}x AND odds of outcome by {e_val:.2f}x \"\n      f\"to explain away the effect.\")\n# ── Lower bound (CI) ───────────────────────────────────\n# If CI includes 1 (RR=1), then effect is not \"robust\"\nlower_rr = np.exp(lower_ci)\nupper_rr = np.exp(upper_ci)\ne_val_lower = e_value(lower_rr) if lower_rr < 1 else e_value(upper_rr)\nprint(f\"E-value for lower CI bound: {e_val_lower:.2f}\")\n# ── Rosenbaum bounds (binary treatment) ──────────────\n# H₀: treatment assignment is randomized\n# Given observational data, how likely is this?\n# Γ (gamma) = odds ratio for hidden bias\n# Example: 20 treated, 20 control; 15 treated have outcome\n# Mantel-Haenszel test under hidden bias Γ\n# For each value of Γ, compute bounds on p-value\n# If p-value always < 0.05 for Γ = 1.5, effect is robust\n# ── Sensitivity parameter visualization ────────────────\n# Plot: effect size vs sensitivity parameter Γ"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Sensitivity Analysis — Robustness to Unmeasured Confounding — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ngammas = np.linspace(1, 3, 50)\neffects = []\nfor gamma in gammas:\n    # As gamma increases (more hidden bias), effect shrinks\n    adjusted_effect = treatment_effect / gamma\n    effects.append(adjusted_effect)\nimport matplotlib.pyplot as plt\nplt.figure(figsize=(10, 6))\nplt.plot(gammas, effects, linewidth=2, label='Adjusted Effect')\nplt.axhline(y=0, color='r', linestyle='--', label='No Effect')\nplt.xlabel('Hidden Bias (Γ)')\nplt.ylabel('Adjusted Treatment Effect')\nplt.title('Sensitivity Analysis')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.show()\nprint(f\"Effect becomes zero at Γ ≈ {treatment_effect:.1f}\")\nprint(f\"If hidden confounder increases odds ratio by {treatment_effect:.1f}x, \"\n      f\"observed effect disappears.\")"
                  }
        ],
        tips: [
                  "E-value: interpret as \"how extreme must a confounder be to explain the effect?\" High E-value = robust effect.",
                  "E-value = 1: effect is fragile (any small confounding overturns it).",
                  "E-value = 3: confounder must triple odds of both treatment and outcome — credible benchmark for \"very large\" confounding.",
                  "Always report E-values alongside main estimates."
        ],
        mistake: "Concluding an effect is robust because p < 0.05, without checking sensitivity to unmeasured confounding. Many observational effects disappear under modest sensitivity analyses.",
        shorthand: {
          verbose: "// Manual / verbose approach\nE-value calculation + sensitivity plot + threshold interpretation\n// More explicit but longer",
          concise: "sensemakr package (R); python implementation exists",
        },
      },
      {
        id: "dag-intro",
        fn: "Directed Acyclic Graphs (DAGs) — Visualizing Causal Structure",
        desc: "Encode causal assumptions and identify confounders/colliders/mediators.",
        category: "Causal",
        subtitle: "Backdoor criterion, frontdoor criterion, adjustment sets, collider bias, confounding paths",
        signature: "Backdoor path: X ← U → Y  |  Frontdoor: X → M → Y",
        descLong: "DAGs visually represent causal assumptions. Nodes = variables, directed edges = causal effects. Identify confounders (point to both X and Y), colliders (both point to it), and mediators (X → M → Y). Backdoor criterion: a set of variables blocks all non-causal paths (confounding). Adjustment: control for variables that satisfy backdoor criterion — NO MORE, NO LESS. Collider bias: conditioning on a collider creates spurious association among its parents. Frontdoor criterion: when backdoor criterion fails.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Directed Acyclic Graphs (DAGs) — Visualizing Causal Structure — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# Use dagitty for DAG specification\n# ── Specify a DAG (ASCII) ──────────────────────────────\n# X = treatment, Y = outcome, U = unmeasured confounder\n# M = mediator, C = measured confounder\ndag_str = '''\ndag {\nX [pos=\"0,1\"]\nY [pos=\"1,1\"]\nM [pos=\"0.5,0.5\"]\nU [pos=\"0.5,2\"]\nC [pos=\"-0.5,1\"]\nX -> Y\nX -> M\nM -> Y\nU -> X\nU -> Y\nC -> X\nC -> Y\n}\n'''\n# In R, use dagitty package\n# dag <- dagitty('dag { U -> {X Y} X -> Y C -> {X Y} X -> M -> Y }')"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Directed Acyclic Graphs (DAGs) — Visualizing Causal Structure — common patterns you'll see in production.\n# APPROACH  - Combine Directed Acyclic Graphs (DAGs) — Visualizing Causal Structure with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Identify adjustment set (for X → Y effect) ────────\n# Which variables must we control for (and only those)?\n# dagitty::adjustmentSets(dag, exposure='X', outcome='Y')\n# Returns all valid adjustment sets per backdoor criterion\n# For this DAG:\n#   Valid sets: {C}, {U} (but U is unmeasured!), {C, U}\n#   So we adjust for {C}\n# Adjusting for M would be wrong (blocks frontdoor path)\n# ── Causal paths vs confounding paths ──────────────────\n# X → Y: direct causal path (want this)\n# X ← C → Y: confounding path (block with adjustment)\n# X → M → Y: mediation path (want this if total effect)\n# ── Collider bias example ──────────────────────────────\n# A = attractiveness, T = talent, M = movie role (hired if A+T high)\n# If you condition on M (being hired):\n#   - Creates spurious negative correlation between A and T\n#   - Among hired actors, unattractive ones must be more talented\n#   - This is not real, just selection effect"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Directed Acyclic Graphs (DAGs) — Visualizing Causal Structure — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# DAG:\n# A -> M <- T  (M is a collider)\n#\n# If we DON'T condition on M: A and T independent (as designed)\n# If we DO condition on M: A and T become negatively correlated (bias)\n# ── Backdoor criterion (check with dagitty) ───────────\n# A set S satisfies backdoor criterion if:\n# 1. No variable in S is a descendant of X\n# 2. S blocks all paths from X to Y that end in an arrow into X\n# Apply: control for S to identify causal effect of X on Y\n# ── Frontdoor criterion (when backdoor fails) ────────\n# If unmeasured confounder U blocks backdoor,\n# but X → M → Y path is unconfounded, use frontdoor\n# Requires:\n# 1. M mediates all X → Y effects\n# 2. No confounding of X → M\n# 3. No confounding of M → Y (via back-door)\n# Estimation: indirect effects are identifiable even if X ← U → Y"
                  }
        ],
        tips: [
                  "Always draw a DAG first — forces explicit statement of causal assumptions.",
                  "Backdoor criterion: identify and block all non-causal paths; frontdoor: when backdoor fails.",
                  "Collider bias: never condition on a collider unless you have a good reason.",
                  "Use dagitty.net for interactive DAG visualization and checking"
        ],
        mistake: "Using \"all available controls\" instead of identifying the right adjustment set with a DAG. Controlling for a collider or mediator biases estimates.",
        shorthand: {
          verbose: "// Manual / verbose approach\nDAG specification + backdoor/frontdoor criterion + adjustment set identification\n// More explicit but longer",
          concise: "dagitty package (R); pyDAG (Python)",
        },
      },
      {
        id: "doubly-robust",
        fn: "Doubly Robust Estimation (AIPW)",
        desc: "Combine outcome model and propensity model for robust causal inference.",
        category: "Causal",
        subtitle: "AIPW, doubly robust, efficiency, outcome regression, inverse probability weighting",
        signature: "DR = outcome model + IPW correction  |  Robust to misspecification of either model",
        descLong: "Doubly Robust (DR) / Augmented IPW (AIPW) combines outcome regression and inverse probability weighting. If outcome model is correct, converges to truth. If propensity model is correct, also converges to truth. Only ONE needs to be correct — hence \"doubly robust.\" Augmentation term (outcome residuals) adds efficiency. More stable than IPW alone (avoids extreme weights) and more flexible than outcome regression (avoids model misspecification). Modern standard for observational causal inference.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Doubly Robust Estimation (AIPW) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nimport pandas as pd\nfrom sklearn.linear_model import LogisticRegression, LinearRegression\n# ── Doubly Robust Estimation (AIPW) ────────────────────\n# T = treatment, X = covariates, Y = outcome\n# Generate synthetic data\nn = 1000\nX = np.random.normal(0, 1, (n, 3))\nT = (np.random.random(n) < 0.5).astype(int)\nY = X[:, 0] + 2 * T + np.random.normal(0, 1, n)\n# ── Step 1: Fit propensity score model (PS) ───────────\nps_model = LogisticRegression()\nps_model.fit(X, T)\nps = ps_model.predict_proba(X)[:, 1]  # P(T=1 | X)\n# IPW weights\nweights = T / ps + (1 - T) / (1 - ps)\n# ── Step 2: Fit outcome model (under treatment T=1) ───\noutcome_model_1 = LinearRegression()\ntreated = T == 1\noutcome_model_1.fit(X[treated], Y[treated])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Doubly Robust Estimation (AIPW) — common patterns you'll see in production.\n# APPROACH  - Combine Doubly Robust Estimation (AIPW) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Fit outcome model (under treatment T=0)\noutcome_model_0 = LinearRegression()\ncontrol = T == 0\noutcome_model_0.fit(X[control], Y[control])\n# Predict counterfactual outcomes\nY_hat_1 = outcome_model_1.predict(X)  # Y if T=1\nY_hat_0 = outcome_model_0.predict(X)  # Y if T=0\n# ── Step 3: Doubly Robust ATE ──────────────────────────\n# AIPW = E[outcome_residual × T/PS] - E[outcome_residual × (1-T)/(1-PS)]\n#      + E[Y_hat_1] - E[Y_hat_0]\n# Outcome residuals\nresidual_1 = Y - Y_hat_1\nresidual_0 = Y - Y_hat_0\n# IPW correction (outcome residuals)\nipw_term_1 = np.mean((T / ps) * residual_1)\nipw_term_0 = np.mean(((1 - T) / (1 - ps)) * residual_0)\n# Outcome regression term\nor_term_1 = np.mean(Y_hat_1)\nor_term_0 = np.mean(Y_hat_0)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Doubly Robust Estimation (AIPW) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Doubly Robust ATE\ndr_ate = (or_term_1 + ipw_term_1) - (or_term_0 + ipw_term_0)\nprint(f\"DR ATE: {dr_ate:.3f}\")\n# ── Comparison to IPW alone ────────────────────────────\n# IPW (prone to extreme weights)\nipw_ate = np.mean((T * Y / ps) - ((1 - T) * Y / (1 - ps)))\nprint(f\"IPW ATE: {ipw_ate:.3f}\")\n# ── Comparison to outcome regression alone ────────────\n# Assumes outcome model is correct\nor_ate = or_term_1 - or_term_0\nprint(f\"OR ATE: {or_ate:.3f}\")\n# ── Visualization: robustness ──────────────────────────\n# True ATE is 2 (causal effect of T)\nprint(f\"True ATE: 2.0\")\n# DR is close to truth even if outcome model misspecified\n# (because IPW term corrects)"
                  }
        ],
        tips: [
                  "DR is more stable than IPW (avoids extreme weights) and more robust than OR (only one model needs to be right).",
                  "Trim extreme weights before applying DR — clip to (0.01, 0.99) range.",
                  "Use flexible outcome models (e.g., random forest) with DR — if both PS and outcome correct, efficiency is high.",
                  "DoubleML package in Python provides robust DR inference with cross-fitting."
        ],
        mistake: "Using simple IPW with extreme weights (PS close to 0 or 1) without augmentation. Augmentation via outcome models (DR) stabilizes variance.",
        shorthand: {
          verbose: "// Manual / verbose approach\nPS fitting + outcome models + AIPW combination + efficiency gains\n// More explicit but longer",
          concise: "DoubleML (Python) or causalml (Python); tmle or drtmle (R)",
        },
      },
      {
        id: "staggered-did",
        fn: "Staggered Difference-in-Differences",
        desc: "Estimate heterogeneous treatment effects when adoption timing varies.",
        category: "Causal",
        subtitle: "Callaway-Sant'Anna, treatment staggering, dynamic effects, TFE estimator",
        signature: "ATT(g,t) = E[Yit | Gᵢ=g] - E[Y(0)it | Gᵢ=g]  where g=adoption cohort, t=time",
        descLong: "Staggered DiD handles policies adopted at different times across units. Standard DiD assumes all treated units adopt simultaneously, leading to bias if effects are heterogeneous. Callaway-Sant'Anna (CS) framework: compare cohorts that adopt at time g to never-treated units. Allows effects to vary by adoption cohort and time since adoption. Detects dynamic effects (how effects evolve post-adoption). Modern approach via FixedEffects or `did` R package with specialized estimators.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Staggered Difference-in-Differences — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport pandas as pd\nimport numpy as np\n# ── Staggered DiD Data Structure ───────────────────────\n# Units (states) adopt policy at different times\n# Example: minimum wage increases (2015, 2017, 2018, never)\n# Data: unit, year, outcome\ndata = pd.DataFrame({\n    'unit': [1, 1, 1, 1, 1,  2, 2, 2, 2, 2, ...],\n    'year': [2014, 2015, 2016, 2017, 2018] * 3,\n    'adoption_year': [2015, 2015, 2015, 2015, 2015,  # cohort 2015\n                      2017, 2017, 2017, 2017, 2017,  # cohort 2017\n                      9999, 9999, 9999, 9999, 9999], # never-treated\n    'employment': [...],\n})\n# Create treatment indicator\ndata['treated'] = (data['year'] >= data['adoption_year']).astype(int)\n# ── Traditional DiD (biased if heterogeneous effects) ──\nimport statsmodels.formula.api as smf"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Staggered Difference-in-Differences — common patterns you'll see in production.\n# APPROACH  - Combine Staggered Difference-in-Differences with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ntrad_model = smf.ols('employment ~ treated + C(unit) + C(year)', data=data).fit(cov_type='HC1')\nprint(f\"Traditional DiD: {trad_model.params['treated[T.1]']:.3f}\")  # may be biased!\n# ── Callaway-Sant'Anna approach (R/did package) ────────\n# use did::att_gt() to estimate ATT by group and time\n# ── Dynamic effects (event study): ────────────────────\n# Lags and leads relative to adoption\ndata['years_since_adoption'] = data['year'] - data['adoption_year']\ndata['years_since_adoption'] = data['years_since_adoption'].clip(-2, 3)\n# Create dummy for each lag/lead\nfor lag in range(-2, 4):\n    data[f'lag_{lag}'] = (data['years_since_adoption'] == lag).astype(int)\n# Event study formula\nevent_formula = 'employment ~ ' + ' + '.join([f'lag_{lag}' for lag in range(-2, 4)]) + ' + C(unit) + C(year)'\nevent_model = smf.ols(event_formula, data=data).fit(cov_type='HC1')\nprint(event_model.summary())"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Staggered Difference-in-Differences — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Coefficients on lag_-2, lag_-1 should be ~0 (parallel trends)\n# Coefficients on lag_0, lag_1, lag_2, lag_3 show dynamic effects\n# ── Visualization: dynamic effects ────────────────────\nimport matplotlib.pyplot as plt\nlags = list(range(-2, 4))\ncoefs = [event_model.params[f'lag_{lag}'] if f'lag_{lag}' in event_model.params else 0\n         for lag in lags]\nplt.figure(figsize=(10, 6))\nplt.plot(lags, coefs, marker='o', linewidth=2)\nplt.axhline(y=0, color='r', linestyle='--', alpha=0.5)\nplt.axvline(x=-0.5, color='g', linestyle=':', alpha=0.5, label='Policy adoption')\nplt.xlabel('Years since adoption')\nplt.ylabel('Effect on employment')\nplt.title('Dynamic Effects (Staggered DiD)')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.show()"
                  }
        ],
        tips: [
                  "Standard DiD is biased under heterogeneous treatment effects — always check with Callaway-Sant'Anna or similar methods.",
                  "Plot event study carefully: pre-treatment (lag < 0) coefficients should be ~0; post-treatment show dynamic effects.",
                  "Compare cohorts to later-treated units (not just never-treated) for robustness.",
                  "`did` package in R automates: `att_gt()` for group-time ATT, `aggte()` for aggregated estimates."
        ],
        mistake: "Using simple two-way FE regression for staggered adoption without checking for treatment effect heterogeneity. This can give biased estimates when early vs. late adopters have different effects.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCohort-specific effects + dynamic event study + sensitivity checks\n// More explicit but longer",
          concise: "did::att_gt() (R); staggered or did package (Python)",
        },
      },
      {
        id: "power-analysis",
        fn: "Power Analysis for Causal Studies",
        desc: "Calculate sample size and power for causal inference studies.",
        category: "Study Design",
        subtitle: "MDE, sample size, power, effect heterogeneity, clustered assignments",
        signature: "n = (Z_α + Z_β)² × 2σ² / MDE²  |  power = P(reject H₀ | effect exists)",
        descLong: "Power analysis for observational/quasi-experimental studies is more complex than RCTs. Must account for: (1) effect heterogeneity (effects vary across units), (2) overlap in propensity scores (can lose units), (3) clustering/matching (reduces effective sample size). MDE (Minimum Detectable Effect) = smallest effect you want to detect. Power = probability of detecting MDE if true. For IV studies, power depends on first-stage F-statistic (instrument strength). For DiD, depends on parallel trends assumption (can't be tested, must assume).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Power Analysis for Causal Studies — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\nimport pandas as pd\n# ── Sample Size for Observational Study (with propensity scores) ──\n# Parameters\nbaseline_effect = 0.0\nmde = 0.2  # minimum detectable effect (Cohen's d)\nalpha = 0.05\npower = 0.80\noverlap_loss = 0.15  # lose ~15% of data to poor overlap\n# Standard formula (for RCT)\nz_alpha = stats.norm.ppf(1 - alpha / 2)\nz_beta = stats.norm.ppf(power)\nn_rct = (z_alpha + z_beta) ** 2 * 2 / (mde ** 2)\n# Account for overlap loss in observational study\nn_obs = n_rct / (1 - overlap_loss)\nprint(f\"RCT sample size: {int(n_rct)}\")\nprint(f\"Observational study (accounting for overlap loss): {int(n_obs)}\")\n# ── Power Analysis for Instrumental Variables (IV) ──\n# Power depends on first-stage F-statistic\n# Weak instrument: low power even with large N\ndef iv_power(f_stat, effect_size, alpha=0.05):\n    \"\"\"Approximate power for 2SLS with one instrument.\"\"\"\n    # Rule of thumb: F > 10 is strong\n    # F < 5: weak, power is low"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Power Analysis for Causal Studies — common patterns you'll see in production.\n# APPROACH  - Combine Power Analysis for Causal Studies with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Approximate power loss due to weak instrument\n    power_loss = 1 / (1 + (10 / f_stat) ** 2)  # heuristic\n    # Standard power calculation\n    z_alpha = stats.norm.ppf(1 - alpha / 2)\n    z_beta = stats.norm.ppf(0.80)  # 80% power\n    n = (z_alpha + z_beta) ** 2 * 2 / (effect_size ** 2)\n    # Apply loss for weak instrument\n    n_adjusted = n / power_loss\n    return n_adjusted\nn_iv_strong = iv_power(f_stat=15, effect_size=0.2)\nn_iv_weak = iv_power(f_stat=5, effect_size=0.2)\nprint(f\"IV with strong instrument (F=15): n={int(n_iv_strong)}\")\nprint(f\"IV with weak instrument (F=5): n={int(n_iv_weak)}\")\n# ── Power for DiD (parallel trends, heterogeneous effects) ──\n# If treatment effects are heterogeneous (vary by unit),\n# effective sample size is reduced\n# Variance under homogeneous effect:\nvar_homogeneous = 1.0\n# Variance under heterogeneous effect:\n# Var(ATE) = Var(treatment effect across units)\nvar_heterogeneous = 1.5  # example: 50% more variance\npower_reduction = var_homogeneous / var_heterogeneous\nn_did = n_rct / power_reduction"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Power Analysis for Causal Studies — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprint(f\"DiD with heterogeneous effects: n={int(n_did)}\")\n# ── Sample size for matching studies ───────────────────\n# After matching, effective sample size shrinks\nmatching_ratio = 1.5  # 1:1.5 (1 treated per 1.5 control)\nn_after_matching = n_rct / (2 * matching_ratio / (matching_ratio + 1))\nprint(f\"After matching {matching_ratio}:1: n={int(n_after_matching)}\")\n# ── Sensitivity power analysis ────────────────────────\n# How does power change with different MDE values?\nmdes = np.linspace(0.1, 0.5, 20)\nsample_sizes = []\nfor mde in mdes:\n    z_alpha = stats.norm.ppf(1 - alpha / 2)\n    z_beta = stats.norm.ppf(power)\n    n = (z_alpha + z_beta) ** 2 * 2 / (mde ** 2)\n    sample_sizes.append(int(n))\nimport matplotlib.pyplot as plt\nplt.figure(figsize=(10, 6))\nplt.plot(mdes, sample_sizes, linewidth=2)\nplt.xlabel('Minimum Detectable Effect (Cohen's d)')\nplt.ylabel('Required Sample Size (per group)')\nplt.title('Power Analysis: Sample Size vs. MDE')\nplt.grid(True, alpha=0.3)\nplt.show()"
                  }
        ],
        tips: [
                  "Account for overlap loss (units with extreme propensity scores): RCT sample size × 1.15 to 1.20.",
                  "For IV studies: check first-stage F-statistic. F > 10 is strong; F < 5 means low power.",
                  "For DiD: if treatment effects are heterogeneous, effective power is lower. Design must still be large.",
                  "Pre-register sample size calculations — p-hacking with observational studies is rampant."
        ],
        mistake: "Assuming observational study sample sizes are the same as RCT. Overlap loss, weak instruments, and heterogeneous effects all inflate required sample size.",
        shorthand: {
          verbose: "// Manual / verbose approach\nHeterogeneity adjustment + overlap analysis + sensitivity plots\n// More explicit but longer",
          concise: "pwr package (R); statsmodels.stats.power (Python)",
        },
      },
    ],
  },

  // ── Section 2: DiD, RDD & Instrumental Variables ─────────────────────────────────────────
  {
    id: "did-rdd-iv",
    title: "DiD, RDD & Instrumental Variables",
    entries: [
      {
        id: "did-rdd-iv-methods",
        fn: "DiD, RDD & IV — Core Causal Methods",
        desc: "Difference-in-differences, regression discontinuity, and instrumental variables for causal inference.",
        category: "Causal Methods",
        subtitle: "DiD, event study, RDD, instrumental variables, 2SLS",
        signature: "smf.ols(\"y ~ treated * post\")  |  IV2SLS.from_formula()  |  RDD bandwidth selection",
        descLong: "Three core quasi-experimental methods: DiD compares treated vs control before/after treatment (requires parallel trends). RDD exploits sharp cutoffs in treatment assignment. IV uses instruments correlated with treatment but not outcome to estimate causal effects via 2SLS.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of DiD, RDD & IV — Core Causal Methods — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nimport pandas as pd\nimport statsmodels.formula.api as smf\n# ── Difference-in-Differences (DiD) ─────────────────\n# Policy: minimum wage increase in state A (2020), state B is control\n# Method 1: Simple DiD\npre_treat = df[(df.state==\"A\") & (df.year < 2020)][\"employment\"].mean()\npost_treat = df[(df.state==\"A\") & (df.year >= 2020)][\"employment\"].mean()\npre_ctrl = df[(df.state==\"B\") & (df.year < 2020)][\"employment\"].mean()\npost_ctrl = df[(df.state==\"B\") & (df.year >= 2020)][\"employment\"].mean()\ndid_estimate = (post_treat - pre_treat) - (post_ctrl - pre_ctrl)\nprint(f\"DiD estimate: {did_estimate:.3f}\")\n# Method 2: Regression DiD (with controls and SEs)\ndf[\"post\"] = (df[\"year\"] >= 2020).astype(int)\ndf[\"treated\"] = (df[\"state\"] == \"A\").astype(int)\nmodel = smf.ols(\n    \"employment ~ treated * post + population + industry_mix\",\n    data=df,\n).fit(cov_type=\"HC1\")  # robust standard errors\nprint(model.summary())\n# Coefficient on treated:post is the DiD estimate"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of DiD, RDD & IV — Core Causal Methods — common patterns you'll see in production.\n# APPROACH  - Combine DiD, RDD & IV — Core Causal Methods with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Parallel trends test (critical assumption) ───────\n# Pre-treatment trends should be parallel\npre_data = df[df.year < 2020]\ntrend_model = smf.ols(\n    \"employment ~ year * treated\",\n    data=pre_data,\n).fit()\n# Coefficient on year:treated should be ~0 and insignificant\n# ── Event study (visual parallel trends check) ───────\n# Create year dummies interacted with treatment\nfor yr in df.year.unique():\n    df[f\"yr_{yr}\"] = ((df.year == yr) & (df.treated == 1)).astype(int)\n# Omit one pre-treatment year as reference\nevent_formula = \"employment ~ \" + \" + \".join(\n    [f\"yr_{yr}\" for yr in sorted(df.year.unique()) if yr != 2019]\n) + \" + C(year) + C(state)\"\nevent_model = smf.ols(event_formula, data=df).fit(cov_type=\"HC1\")\n# Plot coefficients: pre-treatment should be ~0 (parallel trends)\n# ── Regression Discontinuity (RDD) ──────────────────\n# Treatment: scholarship if test_score >= 80\ncutoff = 80\nbandwidth = 5  # analyze scores in [75, 85]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of DiD, RDD & IV — Core Causal Methods — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nrdd_data = df[df.test_score.between(cutoff - bandwidth, cutoff + bandwidth)]\nrdd_data[\"above\"] = (rdd_data.test_score >= cutoff).astype(int)\nrdd_data[\"centered\"] = rdd_data.test_score - cutoff\nrdd_model = smf.ols(\n    \"college_gpa ~ above * centered\",\n    data=rdd_data,\n).fit(cov_type=\"HC1\")\n# Coefficient on \"above\" is the RDD estimate (LATE at cutoff)\n# ── Instrumental Variables (2SLS) ────────────────────\nfrom linearmodels.iv import IV2SLS\n# Instrument: distance_to_college (affects education, not earnings directly)\niv_model = IV2SLS.from_formula(\n    \"earnings ~ 1 + experience + [education ~ distance_to_college]\",\n    data=df,\n).fit()\nprint(iv_model.summary)\n# First stage F-statistic > 10 indicates strong instrument"
                  }
        ],
        tips: [
                  "DiD requires parallel trends: treated and control groups must have been trending similarly pre-treatment. Always test and plot this.",
                  "Event study plots are the gold standard for checking parallel trends — pre-treatment coefficients should be near zero.",
                  "RDD gives very credible local estimates but only at the cutoff — results may not generalize to units far from the threshold.",
                  "Instrumental variables must satisfy: (1) relevance (correlated with treatment), (2) exclusion (affects outcome only through treatment). First-stage F > 10."
        ],
        mistake: "Using DiD when treated and control groups have diverging pre-trends — the parallel trends assumption is not testable (it is about the counterfactual) but diverging pre-trends strongly suggest it fails. Use event study plots to check.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },

  // ── Section 3: Non-Parametric Tests & Effect Sizes ─────────────────────────────────────────
  {
    id: "nonparametric-effects",
    title: "Non-Parametric Tests & Effect Sizes",
    entries: [
      {
        id: "nonparametric-tests",
        fn: "Non-Parametric Tests — When Normality Fails",
        desc: "Distribution-free tests: Mann-Whitney U, Kruskal-Wallis, Wilcoxon signed-rank, permutation tests, and when to use them.",
        category: "Non-Parametric",
        subtitle: "Mann-Whitney, Kruskal-Wallis, Wilcoxon, Spearman, permutation test",
        signature: "mannwhitneyu(x, y)  |  kruskal(g1, g2, g3)  |  wilcoxon(before, after)  |  spearmanr(x, y)",
        descLong: "Non-parametric tests make no assumptions about data distribution — use them when data is ordinal, heavily skewed, has outliers, or sample size is small (n < 30). Mann-Whitney U compares two independent groups (replaces t-test). Kruskal-Wallis compares 3+ groups (replaces one-way ANOVA). Wilcoxon signed-rank compares paired/repeated measures. Spearman rank correlation handles non-linear monotonic relationships. Permutation tests are the most flexible: they shuffle labels and compute any test statistic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Non-Parametric Tests — When Normality Fails — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom scipy import stats\nimport numpy as np\n# ── Mann-Whitney U (2 independent groups) ────────────\n# Non-parametric alternative to independent t-test\ncontrol_scores = [72, 68, 85, 91, 60, 78, 55, 82]\ntreatment_scores = [88, 92, 79, 95, 84, 90, 87, 93]\nstat, p_value = stats.mannwhitneyu(\n    treatment_scores, control_scores,\n    alternative='two-sided',\n)\nprint(f\"Mann-Whitney U={stat:.1f}, p={p_value:.4f}\")\n# ── Kruskal-Wallis (3+ independent groups) ───────────\n# Non-parametric alternative to one-way ANOVA\ngroup_a = [4.2, 3.8, 5.1, 4.5, 3.9]\ngroup_b = [6.1, 5.8, 6.5, 5.9, 6.3]\ngroup_c = [3.5, 4.0, 3.2, 3.8, 4.1]\nstat, p_value = stats.kruskal(group_a, group_b, group_c)\nprint(f\"Kruskal-Wallis H={stat:.2f}, p={p_value:.4f}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Non-Parametric Tests — When Normality Fails — common patterns you'll see in production.\n# APPROACH  - Combine Non-Parametric Tests — When Normality Fails with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Post-hoc: Dunn's test for pairwise comparisons\n# pip install scikit-posthocs\n# import scikit_posthocs as sp\n# sp.posthoc_dunn([group_a, group_b, group_c], p_adjust='bonferroni')\n# ── Wilcoxon Signed-Rank (paired/repeated measures) ──\n# Non-parametric alternative to paired t-test\nbefore = [150, 142, 138, 155, 160, 145, 148, 152]\nafter =  [145, 138, 130, 148, 152, 140, 142, 146]\nstat, p_value = stats.wilcoxon(before, after, alternative='two-sided')\nprint(f\"Wilcoxon W={stat:.1f}, p={p_value:.4f}\")\n# ── Spearman Rank Correlation ────────────────────────\n# Non-parametric alternative to Pearson correlation\nrho, p_value = stats.spearmanr(\n    [1, 2, 3, 4, 5, 6],\n    [2, 4, 5, 8, 12, 20],  # monotonic but non-linear\n)\nprint(f\"Spearman rho={rho:.3f}, p={p_value:.4f}\")\n# ── Permutation Test (most flexible) ────────────────\ndef permutation_test(group1, group2, n_permutations=10000):\n    \"\"\"Test any statistic distribution-free.\"\"\"\n    observed_diff = np.mean(group1) - np.mean(group2)\n    combined = np.concatenate([group1, group2])\n    n1 = len(group1)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Non-Parametric Tests — When Normality Fails — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ncount = 0\n    for _ in range(n_permutations):\n        np.random.shuffle(combined)\n        perm_diff = np.mean(combined[:n1]) - np.mean(combined[n1:])\n        if abs(perm_diff) >= abs(observed_diff):\n            count += 1\n    return observed_diff, count / n_permutations\ndiff, p_value = permutation_test(\n    np.array(treatment_scores),\n    np.array(control_scores),\n)\nprint(f\"Observed diff={diff:.2f}, permutation p={p_value:.4f}\")"
                  }
        ],
        tips: [
                  "Use Mann-Whitney when data is ordinal (Likert scales), skewed, or has outliers — it compares medians/ranks, not means.",
                  "Kruskal-Wallis is the non-parametric ANOVA — follow up with Dunn's test (Bonferroni-corrected) for pairwise group comparisons.",
                  "Permutation tests work for ANY test statistic — use them when no named test exists for your metric.",
                  "Non-parametric tests have less statistical power than parametric equivalents — use parametric tests when their assumptions are met."
        ],
        mistake: "Using Mann-Whitney or Kruskal-Wallis and reporting \"no difference in distributions\" when p > 0.05 — these tests compare stochastic dominance, not just central tendency. A non-significant result doesn't mean distributions are equal.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
      {
        id: "effect-sizes",
        fn: "Effect Sizes — Cohen's d, Eta-Squared & Reporting",
        desc: "Quantify effect magnitude: Cohen's d, Hedges' g, eta-squared, odds ratios, and proper reporting with confidence intervals.",
        category: "Effect Size",
        subtitle: "Cohen's d, Hedges' g, eta-squared, partial eta-squared, odds ratio, NNT",
        signature: "d = (M1-M2)/SD_pooled  |  eta² = SS_between/SS_total  |  OR = (a*d)/(b*c)",
        descLong: "Effect sizes quantify how large an effect is, independent of sample size (unlike p-values). Cohen's d measures standardized mean differences (0.2=small, 0.5=medium, 0.8=large). Hedges' g corrects for small sample bias. Eta-squared (η²) measures variance explained in ANOVA. Partial eta-squared controls for other factors. Odds ratios quantify association in binary outcomes. Number Needed to Treat (NNT) is the most intuitive clinical metric. Always report effect sizes WITH confidence intervals — a point estimate without uncertainty is incomplete.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Effect Sizes — Cohen's d, Eta-Squared & Reporting — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport numpy as np\nfrom scipy import stats\n# ── Cohen's d (standardized mean difference) ────────\ndef cohens_d(group1, group2):\n    n1, n2 = len(group1), len(group2)\n    var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)\n    pooled_std = np.sqrt(((n1-1)*var1 + (n2-1)*var2) / (n1+n2-2))\n    return (np.mean(group1) - np.mean(group2)) / pooled_std\nd = cohens_d(treatment_scores, control_scores)\nprint(f\"Cohen's d = {d:.3f}\")\n# Interpretation: 0.2=small, 0.5=medium, 0.8=large\n# ── Hedges' g (bias-corrected for small samples) ────\ndef hedges_g(group1, group2):\n    d = cohens_d(group1, group2)\n    n = len(group1) + len(group2)\n    correction = 1 - (3 / (4 * (n - 2) - 1))  # J correction factor\n    return d * correction\ng = hedges_g(treatment_scores, control_scores)\nprint(f\"Hedges' g = {g:.3f}\")\n# ── Confidence interval for Cohen's d ────────────────\ndef d_confidence_interval(d, n1, n2, alpha=0.05):\n    se = np.sqrt((n1+n2)/(n1*n2) + d**2/(2*(n1+n2)))\n    z = stats.norm.ppf(1 - alpha/2)\n    return d - z*se, d + z*se"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Effect Sizes — Cohen's d, Eta-Squared & Reporting — common patterns you'll see in production.\n# APPROACH  - Combine Effect Sizes — Cohen's d, Eta-Squared & Reporting with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nci_low, ci_high = d_confidence_interval(d, 8, 8)\nprint(f\"95% CI: [{ci_low:.3f}, {ci_high:.3f}]\")\n# ── Eta-squared (ANOVA effect size) ─────────────────\n# How much variance does the factor explain?\nf_stat, p_val = stats.f_oneway(group_a, group_b, group_c)\nk = 3  # number of groups\nn_total = len(group_a) + len(group_b) + len(group_c)\ndf_between = k - 1\ndf_within = n_total - k\neta_squared = (f_stat * df_between) / (f_stat * df_between + df_within)\nprint(f\"Eta-squared = {eta_squared:.3f}\")\n# Interpretation: 0.01=small, 0.06=medium, 0.14=large\n# Partial eta-squared (for factorial ANOVA)\n# partial_eta_sq = SS_effect / (SS_effect + SS_error)\n# ── Odds Ratio (binary outcomes) ─────────────────────\n#                Disease  No Disease\n# Exposed:        a=30     b=70       = 100\n# Not exposed:    c=10     d=90       = 100\na, b, c, d_val = 30, 70, 10, 90"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Effect Sizes — Cohen's d, Eta-Squared & Reporting — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nodds_ratio = (a * d_val) / (b * c)\nlog_or = np.log(odds_ratio)\nse_log_or = np.sqrt(1/a + 1/b + 1/c + 1/d_val)\nci = np.exp([log_or - 1.96*se_log_or, log_or + 1.96*se_log_or])\nprint(f\"OR = {odds_ratio:.2f}, 95% CI: [{ci[0]:.2f}, {ci[1]:.2f}]\")\n# ── Number Needed to Treat (NNT) ────────────────────\nrisk_treatment = 30 / 100   # 30%\nrisk_control = 10 / 100     # 10%\narr = risk_treatment - risk_control  # absolute risk reduction\nnnt = 1 / abs(arr)\nprint(f\"NNT = {nnt:.1f}\")  # treat 5 people for 1 to benefit\n# ── Proper reporting format ──────────────────────────\n# \"Treatment improved scores (M=89.8, SD=4.9) compared to\n#  control (M=73.9, SD=12.3), t(14)=3.68, p=.002,\n#  Cohen's d=1.84 [95% CI: 0.67, 2.97], a large effect.\""
                  }
        ],
        tips: [
                  "Always report effect sizes alongside p-values — p-values tell you IF an effect exists, effect sizes tell you HOW BIG it is.",
                  "Use Hedges' g instead of Cohen's d for small samples (n < 20 per group) — it corrects for upward bias.",
                  "A \"statistically significant\" result with d=0.1 is trivially small; a \"non-significant\" result with d=0.8 may be clinically important.",
                  "Report effect sizes with confidence intervals: \"d = 0.75 [0.31, 1.19]\" gives the full picture."
        ],
        mistake: "Reporting only p-values without effect sizes — \"p < 0.001\" with n=10,000 could be a trivially small effect (d=0.05). With enough data, any tiny difference becomes \"significant.\" Effect sizes are essential context.",
        shorthand: {
          verbose: "// Manual / verbose approach\nManual step-by-step calculation\n// More explicit but longer",
          concise: "Direct library function call",
        },
      },
    ],
  },
]

export default { meta, sections }
