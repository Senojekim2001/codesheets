import coreData     from './core.js'
import httpData     from './http.js'
import streamsData  from './streams.js'
import asyncData    from './async.js'
import toolingData  from './tooling.js'
import databaseData from './database.js'
import securityData from './security.js'
import testingData  from './testing.js'
import advancedData    from './advanced.js'
import deploymentData  from './deployment.js'
import aiMlData        from './ai-ml.js'
import cliEsmData      from './cli-esm.js'
import cachingData     from './caching.js'
import observabilityData from './observability.js'
import containerizationData from './containerization.js'
import messagingQueuesData from './messaging-queues.js'
import dataAppsData    from './data-apps.js'
import dataEngineeringData from './data-engineering.js'

export const meta = {
  title: 'Node.js — Complete Reference',
  domain: 'nodejs',
  sheet: 'master',
  icon: '🟢',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData,     'Core'),
  ...prefixSections(httpData,     'HTTP'),
  ...prefixSections(streamsData,  'Streams'),
  ...prefixSections(asyncData,    'Async'),
  ...prefixSections(toolingData,  'Tooling'),
  ...prefixSections(databaseData, 'Database'),
  ...prefixSections(securityData, 'Security'),
  ...prefixSections(testingData,  'Testing'),
  ...prefixSections(advancedData,    'Advanced'),
  ...prefixSections(deploymentData,  'Deployment'),
  ...prefixSections(aiMlData,        'AI-ML'),
  ...prefixSections(cliEsmData,      'CLI-ESM'),
  ...prefixSections(cachingData,     'Caching'),
  ...prefixSections(observabilityData, 'Observability'),
  ...prefixSections(containerizationData, 'Containerization'),
  ...prefixSections(messagingQueuesData, 'Messaging'),
  ...prefixSections(dataAppsData,    'DataApps'),
  ...prefixSections(dataEngineeringData, 'DataEngineering'),
]

export default { meta, sections }
