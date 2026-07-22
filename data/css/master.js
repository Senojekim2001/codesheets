import coreData     from './core.js'
import advancedData from './advanced.js'
import patternsData   from './patterns.js'
import animationsData    from './animations.js'
import responsiveData    from './responsive.js'
import preprocessorsData from './preprocessors.js'
import functionsData     from './functions.js'

export const meta = {
  id: 'master',
  label: 'Complete Reference',
  icon: '🎨',
  description: 'All 7 CSS sheets combined — core layout, advanced techniques, component patterns, animations, responsive design, Tailwind/tokens, and modern CSS functions.',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData,     'CSS'),
  ...prefixSections(advancedData, 'Advanced'),
  ...prefixSections(patternsData,   'Patterns'),
  ...prefixSections(animationsData,    'Animations'),
  ...prefixSections(responsiveData,    'Responsive'),
  ...prefixSections(preprocessorsData, 'Tailwind'),
  ...prefixSections(functionsData,     'Functions'),
]

export default { meta, sections }
