import coreData        from './core.js'
import structsData     from './structs.js'
import concurrencyData from './concurrency.js'
import errorsData      from './errors.js'
import stdlibData      from './stdlib.js'
import modulesData     from './modules.js'
import patternsData    from './patterns.js'
import testingData     from './testing.js'
import advancedData    from './advanced.js'
import webData         from './web.js'
import dataData        from './data.js'
import cliObsData      from './cli-observability.js'

export const meta = {
  id: 'master',
  label: 'Complete Reference',
  icon: '🐹',
  description: 'All 12 Go sheets combined — core syntax, structs, concurrency, error handling, standard library, modules, patterns, testing, advanced, web, database, and CLI/observability.',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData,        'Core'),
  ...prefixSections(structsData,     'Structs'),
  ...prefixSections(concurrencyData, 'Concurrency'),
  ...prefixSections(errorsData,      'Errors'),
  ...prefixSections(stdlibData,      'Stdlib'),
  ...prefixSections(modulesData,     'Modules'),
  ...prefixSections(patternsData,    'Patterns'),
  ...prefixSections(testingData,     'Testing'),
  ...prefixSections(advancedData,    'Advanced'),
  ...prefixSections(webData,         'Web'),
  ...prefixSections(dataData,        'Data'),
  ...prefixSections(cliObsData,      'CLI-Obs'),
]

export default { meta, sections }
