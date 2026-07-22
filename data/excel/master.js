import coreData from './core.js'
import advancedData   from './advanced.js'
import powerqueryData from './powerquery.js'
import vbaData        from './vba.js'
import shortcutsData  from './shortcuts.js'

export const meta = {
  id: 'master',
  label: 'Complete Reference',
  icon: '📗',
  description: 'All 5 Excel sheets combined — core formulas, advanced features, Power Query/pivot tables, VBA/tables/what-if, and keyboard shortcuts.',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData, 'Excel'),
  ...prefixSections(advancedData,   'Advanced'),
  ...prefixSections(powerqueryData, 'PowerQuery'),
  ...prefixSections(vbaData,        'VBA'),
  ...prefixSections(shortcutsData,  'Shortcuts'),
]

export default { meta, sections }
