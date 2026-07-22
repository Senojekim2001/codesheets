import async from './data/nodejs/async.js';
import core from './data/nodejs/core.js';
import http from './data/nodejs/http.js';
import streams from './data/nodejs/streams.js';
import tooling from './data/nodejs/tooling.js';
import concurrency from './data/go/concurrency.js';
import gocore from './data/go/core.js';
import errors from './data/go/errors.js';
import stdlib from './data/go/stdlib.js';
import structs from './data/go/structs.js';

const files = [
  { name: 'async.js', data: async, expectedSections: 1, expectedEntries: 6 },
  { name: 'core.js', data: core, expectedSections: 1, expectedEntries: 7 },
  { name: 'http.js', data: http, expectedSections: 1, expectedEntries: 7 },
  { name: 'streams.js', data: streams, expectedSections: 1, expectedEntries: 7 },
  { name: 'tooling.js', data: tooling, expectedSections: 1, expectedEntries: 8 },
  { name: 'go/concurrency.js', data: concurrency, expectedSections: 1, expectedEntries: 8 },
  { name: 'go/core.js', data: gocore, expectedSections: 1, expectedEntries: 10 },
  { name: 'go/errors.js', data: errors, expectedSections: 1, expectedEntries: 5 },
  { name: 'go/stdlib.js', data: stdlib, expectedSections: 1, expectedEntries: 10 },
  { name: 'go/structs.js', data: structs, expectedSections: 1, expectedEntries: 8 },
];

console.log('Consolidation Verification:\n');
let allPassed = true;

for (const file of files) {
  const actualSections = file.data.sections.length;
  const actualEntries = file.data.sections[0]?.entries.length || 0;
  const sectionsOK = actualSections === file.expectedSections;
  const entriesOK = actualEntries === file.expectedEntries;
  
  if (sectionsOK && entriesOK) {
    console.log(`✓ ${file.name}: ${actualSections} section, ${actualEntries} entries`);
  } else {
    console.log(`✗ ${file.name}: Expected ${file.expectedSections} section(s) and ${file.expectedEntries} entries`);
    console.log(`  Got ${actualSections} section(s) and ${actualEntries} entries`);
    allPassed = false;
  }
}

console.log('\n' + (allPassed ? '✓ All files verified!' : '✗ Some files have issues'));
process.exit(allPassed ? 0 : 1);
