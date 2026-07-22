import routingData   from './routing.js'
import dataData      from './data.js'
import apiData       from './api.js'
import renderingData from './rendering.js'
import authData      from './auth.js'
import configData    from './config.js'
import patternsData  from './patterns.js'
import deployData    from './deployment.js'
import middlewareData from './middleware.js'

export const meta = {
  title: 'Next.js — Complete Reference',
  domain: 'nextjs',
  sheet: 'master',
  icon: '▲',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(routingData,   'Routing'),
  ...prefixSections(dataData,      'Data'),
  ...prefixSections(apiData,       'API'),
  ...prefixSections(renderingData, 'Rendering'),
  ...prefixSections(authData,      'Auth'),
  ...prefixSections(configData,    'Config'),
  ...prefixSections(patternsData,  'Patterns'),
  ...prefixSections(deployData,    'Deploy'),
  ...prefixSections(middlewareData, 'Middleware'),
]

export default { meta, sections }
