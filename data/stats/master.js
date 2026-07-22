import coreData         from './core.js'
import inferenceData    from './inference.js'
import regressionData   from './regression.js'
import bayesianData     from './bayesian.js'
import experimentalData from './experimental.js'
import multivariateData from './multivariate.js'
import appliedData     from './applied.js'
import mlStatsData     from './ml-statistics.js'
import causalData      from './causal-inference.js'

export const meta = {
  id: 'master',
  label: 'Complete Reference',
  icon: '📈',
  description: 'All 9 Statistics sheets combined — probability, inference, regression, Bayesian, experimental, multivariate, applied, ML statistics, and causal inference.',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData,         'Core'),
  ...prefixSections(inferenceData,    'Inference'),
  ...prefixSections(regressionData,   'Regression'),
  ...prefixSections(bayesianData,     'Bayesian'),
  ...prefixSections(experimentalData, 'Experimental'),
  ...prefixSections(multivariateData, 'Multivariate'),
  ...prefixSections(appliedData,     'Applied'),
  ...prefixSections(mlStatsData,     'MLStats'),
  ...prefixSections(causalData,      'Causal'),
]

export default { meta, sections }
