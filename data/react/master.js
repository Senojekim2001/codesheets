import hooksData       from './hooks.js'
import componentsData  from './components.js'
import performanceData from './performance.js'
import routerData      from './router.js'
import patternsData    from './patterns.js'
import formsData       from './forms.js'
import stateData       from './state.js'
import testingData     from './testing.js'
import modernData      from './modern.js'
import dataFetchData   from './data-fetching.js'
import advancedUiData  from './advanced-ui.js'

export const meta = {
  title: 'React — Complete Reference',
  domain: 'react',
  sheet: 'master',
  icon: '⚛️',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(hooksData,       'Hooks'),
  ...prefixSections(componentsData,  'Components'),
  ...prefixSections(performanceData, 'Performance'),
  ...prefixSections(routerData,      'Router'),
  ...prefixSections(patternsData,    'Patterns'),
  ...prefixSections(formsData,       'Forms'),
  ...prefixSections(stateData,       'State'),
  ...prefixSections(testingData,     'Testing'),
  ...prefixSections(modernData,      'Modern'),
  ...prefixSections(dataFetchData,   'DataFetch'),
  ...prefixSections(advancedUiData,  'AdvUI'),
]

export default { meta, sections }
