import coreData        from './core.js'
import streamsData     from './streams.js'
import concurrencyData from './concurrency.js'
import modernData      from './modern.js'
import ioData          from './io.js'
import springData      from './spring.js'
import collectionsData from './collections.js'
import testingData     from './testing.js'
import buildtoolsData  from './buildtools.js'
import reactiveJvmData from './reactive-jvm.js'

export const meta = {
  id: 'master',
  label: 'Complete Reference',
  icon: '☕',
  description: 'All 10 Java sheets combined — core syntax & OOP, streams, concurrency, modern Java, IO, Spring Boot, collections, testing, build tools, and reactive/JVM.',
}

function prefixSections(sheetData, prefix) {
  return sheetData.sections.map(section => ({
    ...section,
    id:    `${prefix}-${section.id}`,
    title: `${prefix} — ${section.title}`,
  }))
}

export const sections = [
  ...prefixSections(coreData,        'Core'),
  ...prefixSections(streamsData,     'Streams'),
  ...prefixSections(concurrencyData, 'Concurrency'),
  ...prefixSections(modernData,      'Modern'),
  ...prefixSections(ioData,           'IO'),
  ...prefixSections(springData,       'Spring'),
  ...prefixSections(collectionsData,  'Collections'),
  ...prefixSections(testingData,      'Testing'),
  ...prefixSections(buildtoolsData,   'Build'),
  ...prefixSections(reactiveJvmData,  'Reactive'),
]

export default { meta, sections }
