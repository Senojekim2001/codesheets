import coreData          from './core.js'
import arraysData        from './arrays.js'
import objectsData       from './objects.js'
import es6Data           from './es6.js'
import asyncData         from './async.js'
import domData           from './dom.js'
import patternsData      from './patterns.js'
import advancedData      from './advanced.js'
import webApisData       from './web-apis.js'
import testingData       from './testing.js'
import regexData         from './regex.js'
import modulesData       from './modules.js'
import workersData       from './workers.js'
import dsaData           from './dsa.js'
import complexityData    from './complexity.js'
import memoryData        from './memory.js'
import debuggingData     from './debugging.js'
import oopData           from './oop.js'
import securityData      from './security.js'
import dataVizData       from './data-viz.js'
import webNetworkingData from './web-networking.js'
import documentationData from './documentation.js'
import mlData             from './ml.js'
import statsData          from './stats.js'
import deeplearningData   from './deeplearning.js'
import nlpClassicalData   from './nlp-classical.js'
import imageProcessingData from './image-processing.js'
import cvOpencvData       from './cv-opencv.js'
import geospatialData     from './geospatial.js'
import audioDspData       from './audio-dsp.js'
import web3BlockchainData from './web3-blockchain.js'
import gamedevData        from './gamedev.js'
import mqttIotData        from './mqtt-iot.js'

export const meta = {
  title:  'JavaScript — Complete Reference',
  domain: 'javascript',
  sheet:  'master',
  icon:   '🟨',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData,          'Core'),
  ...prefixSections(arraysData,        'Arrays'),
  ...prefixSections(objectsData,       'Objects'),
  ...prefixSections(es6Data,           'ES6+'),
  ...prefixSections(asyncData,         'Async'),
  ...prefixSections(domData,           'DOM'),
  ...prefixSections(patternsData,      'Patterns'),
  ...prefixSections(advancedData,      'Advanced'),
  ...prefixSections(webApisData,       'WebAPIs'),
  ...prefixSections(testingData,       'Testing'),
  ...prefixSections(regexData,         'Regex'),
  ...prefixSections(modulesData,       'Modules'),
  ...prefixSections(workersData,       'Workers'),
  ...prefixSections(dsaData,           'DSA'),
  ...prefixSections(complexityData,    'Complexity'),
  ...prefixSections(memoryData,        'Memory'),
  ...prefixSections(debuggingData,     'Debugging'),
  ...prefixSections(oopData,           'OOP'),
  ...prefixSections(securityData,      'Security'),
  ...prefixSections(dataVizData,       'DataViz'),
  ...prefixSections(webNetworkingData, 'WebNetworking'),
  ...prefixSections(documentationData,  'Docs'),
  ...prefixSections(mlData,             'ML'),
  ...prefixSections(statsData,          'Stats'),
  ...prefixSections(deeplearningData,   'DeepLearning'),
  ...prefixSections(nlpClassicalData,   'NLP'),
  ...prefixSections(imageProcessingData,'ImageProc'),
  ...prefixSections(cvOpencvData,       'CV'),
  ...prefixSections(geospatialData,     'Geospatial'),
  ...prefixSections(audioDspData,       'AudioDSP'),
  ...prefixSections(web3BlockchainData, 'Web3'),
  ...prefixSections(gamedevData,        'GameDev'),
  ...prefixSections(mqttIotData,        'MQTT-IoT'),
]

export default { meta, sections }
