import coreData      from './core.js'
import tidyverseData from './tidyverse.js'
import ggplot2Data   from './ggplot2.js'
import datatableData from './datatable.js'
import modelingData  from './modeling.js'
import statsData     from './stats.js'
import workflowData  from './workflow.js'
import mlData        from './ml.js'
import ecosystemData from './ecosystem.js'
import tidytoolsData from './tidytools.js'
import shinyData     from './shiny.js'
import rmarkdownData from './rmarkdown.js'

export const meta = {
  id: 'master',
  label: 'Complete Reference',
  icon: '📊',
  description: 'All 12 R sheets combined — core, tidyverse, ggplot2, data.table, modeling, statistics, workflow, machine learning, ecosystem, tidy tools, Shiny, and R Markdown/Quarto.',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData,      'Core'),
  ...prefixSections(tidyverseData, 'Tidyverse'),
  ...prefixSections(ggplot2Data,   'ggplot2'),
  ...prefixSections(datatableData, 'data.table'),
  ...prefixSections(modelingData,  'Modeling'),
  ...prefixSections(statsData,     'Stats'),
  ...prefixSections(workflowData,  'Workflow'),
  ...prefixSections(mlData,        'ML'),
  ...prefixSections(ecosystemData, 'Ecosystem'),
  ...prefixSections(tidytoolsData, 'TidyTools'),
  ...prefixSections(shinyData,     'Shiny'),
  ...prefixSections(rmarkdownData, 'RMarkdown'),
]

export default { meta, sections }
