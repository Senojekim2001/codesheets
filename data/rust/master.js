import coreData        from './core.js'
import typesData       from './types.js'
import collectionsData from './collections.js'
import asyncData       from './async.js'
import ecosystemData   from './ecosystem.js'
import webData         from './web.js'
import macrosData      from './macros.js'
import testWasmData    from './testing-wasm.js'

export const meta = {
  id: 'master',
  label: 'Complete Reference',
  icon: '🦀',
  description: 'All 8 Rust sheets combined — core syntax & ownership, types & traits, collections & iterators, async & concurrency, ecosystem & tooling, web, macros/unsafe/FFI, and testing/WASM.',
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
  ...prefixSections(typesData,       'Types'),
  ...prefixSections(collectionsData, 'Collections'),
  ...prefixSections(asyncData,       'Async'),
  ...prefixSections(ecosystemData,   'Ecosystem'),
  ...prefixSections(webData,         'Web'),
  ...prefixSections(macrosData,      'Macros'),
  ...prefixSections(testWasmData,    'TestWASM'),
]

export default { meta, sections }
