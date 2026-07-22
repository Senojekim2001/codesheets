import typesData        from './types.js'
import interfacesData   from './interfaces.js'
import genericsData     from './generics.js'
import narrowingData    from './narrowing.js'
import advancedData     from './advanced.js'
import configData       from './config.js'
import patternsData     from './patterns.js'
import utilityTypesData from './utility-types.js'
import reactTypesData  from './react-types.js'
import declarationsData from './declarations.js'
import advPatternsData from './advanced-patterns.js'
import validationData  from './validation.js'

export const meta = {
  title: 'TypeScript — Complete Reference',
  domain: 'typescript',
  sheet: 'master',
  icon: '🔷',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(typesData,        'Types'),
  ...prefixSections(interfacesData,   'Interfaces'),
  ...prefixSections(genericsData,     'Generics'),
  ...prefixSections(narrowingData,    'Narrowing'),
  ...prefixSections(advancedData,     'Advanced'),
  ...prefixSections(configData,       'Config'),
  ...prefixSections(patternsData,     'Patterns'),
  ...prefixSections(utilityTypesData, 'Utility Types'),
  ...prefixSections(reactTypesData,   'React'),
  ...prefixSections(declarationsData, 'Declarations'),
  ...prefixSections(advPatternsData,  'AdvPatterns'),
  ...prefixSections(validationData,   'Validation'),
]

export default { meta, sections }
