import coreData from './core.js'
import containersData from './containers.js'
import modernData from './modern.js'
import oopData from './oop.js'
import utilitiesData from './utilities.js'
import algorithmsData from './algorithms.js'
import buildtoolsData from './buildtools.js'
import networkingData from './networking.js'
import templatesData  from './templates.js'
import memCrtnData    from './memory-coroutines.js'

export const meta = {
  id: 'master',
  label: 'Complete C++ Reference',
  icon: '⚙️',
  description: 'All 10 C++ sheets combined — core syntax, containers, modern features, OOP, utilities, algorithms, build tools, networking, templates, and memory/coroutines.',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData,       'Core'),
  ...prefixSections(containersData, 'Containers'),
  ...prefixSections(modernData,     'Modern'),
  ...prefixSections(oopData,        'OOP'),
  ...prefixSections(utilitiesData,  'Utilities'),
  ...prefixSections(algorithmsData, 'Algorithms'),
  ...prefixSections(buildtoolsData, 'Build'),
  ...prefixSections(networkingData, 'Network'),
  ...prefixSections(templatesData,  'Templates'),
  ...prefixSections(memCrtnData,    'Memory'),
]

export default { meta, sections }
