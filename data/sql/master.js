import coreData from './core.js'
import advancedData       from './advanced.js'
import windowFuncsData    from './window-functions.js'
import ctesData           from './ctes.js'
import indexingData       from './indexing.js'
import storedProcsData   from './stored-procedures.js'
import postgresData      from './postgres.js'
import snowflakeData     from './snowflake.js'

export const meta = {
  id: 'master',
  label: 'Complete Reference',
  icon: '🗃️',
  description: 'All 8 SQL sheets combined — core SQL, advanced, window functions, CTEs, indexing, stored procedures, PostgreSQL advanced, and Snowflake.',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData, 'SQL'),
  ...prefixSections(advancedData,    'Advanced'),
  ...prefixSections(windowFuncsData, 'Window'),
  ...prefixSections(ctesData,        'CTEs'),
  ...prefixSections(indexingData,    'Indexing'),
  ...prefixSections(storedProcsData, 'Procs'),
  ...prefixSections(postgresData,    'Postgres'),
  ...prefixSections(snowflakeData,   'Snowflake'),
]

export default { meta, sections }
