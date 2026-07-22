/**
 * data/python/master.js
 * Python — Master combined sheet.
 * All 22 Python sheets merged into one unified reference.
 * Sections are prefixed with the originating sheet name for clarity.
 */

import coreData          from './core.js'
import pandasData        from './pandas.js'
import numpyData         from './numpy.js'
import matplotlibData    from './matplotlib.js'
import seabornData       from './seaborn.js'
import oopData           from './oop.js'
import dsaData           from './dsa.js'
import apisData          from './apis.js'
import testingData       from './testing.js'
import mlData            from './ml.js'
import statsData         from './stats.js'
import deeplearningData  from './deeplearning.js'
import advancedData      from './advanced.js'
import concurrencyData   from './concurrency.js'
import llmAiData         from './llm-ai.js'
import dataEngData       from './data-engineering.js'
import typingData        from './typing.js'
import packagingData     from './packaging.js'
import webData           from './web.js'
import regexData         from './regex.js'
import filesystemData    from './filesystem.js'
import cliData           from './cli.js'

export const meta = {
  title:  'Python — Complete Reference',
  domain: 'python',
  sheet:  'master',
  icon:   '🐍',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData,         'Core'),
  ...prefixSections(pandasData,       'Pandas'),
  ...prefixSections(numpyData,        'NumPy'),
  ...prefixSections(matplotlibData,   'Matplotlib'),
  ...prefixSections(seabornData,      'Seaborn'),
  ...prefixSections(oopData,          'OOP'),
  ...prefixSections(dsaData,          'DSA'),
  ...prefixSections(apisData,         'APIs'),
  ...prefixSections(testingData,      'Testing'),
  ...prefixSections(mlData,           'ML'),
  ...prefixSections(statsData,        'Stats'),
  ...prefixSections(deeplearningData, 'Deep Learning'),
  ...prefixSections(advancedData,      'Advanced'),
  ...prefixSections(concurrencyData,   'Concurrency'),
  ...prefixSections(llmAiData,          'LLM-AI'),
  ...prefixSections(dataEngData,        'DataEng'),
  ...prefixSections(typingData,          'Typing'),
  ...prefixSections(packagingData,       'Packaging'),
  ...prefixSections(webData,             'Web'),
  ...prefixSections(regexData,           'Regex'),
  ...prefixSections(filesystemData,      'Filesystem'),
  ...prefixSections(cliData,             'CLI'),
]

export default { meta, sections }
