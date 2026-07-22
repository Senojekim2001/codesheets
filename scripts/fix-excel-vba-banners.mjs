import { readFileSync, writeFileSync } from 'fs';

// Excel VBA sections should use ' comments; Power Query / formula sections use //
const vbaSectionIds = new Set([
  'vba-macros', 'vba-database', 'vba-fundamentals-core',
  'vba-workbook-errors', 'vba-advanced-automation',
]);

for (const file of [
  'data/excel/core.js', 'data/excel/advanced.js', 'data/excel/master.js',
  'data/excel/powerquery.js', 'data/excel/vba.js', 'data/excel/shortcuts.js',
]) {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  // Track current section by scanning for `id: "..."` at section level.
  // Section objects are at 2-space indent, their id at 4-space indent.
  let currentSection = null;
  let currentEntry = null;
  let fixCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect section id lines (4-space indented, directly inside sections array)
    const secMatch = line.match(/^    id: "([^"]+)",$/);
    if (secMatch) {
      currentSection = secMatch[1];
      currentEntry = null;
      continue;
    }
    
    // Detect entry id lines (8-space indented, inside entries array)
    const entryMatch = line.match(/^        id: "([^"]+)",$/);
    if (entryMatch) {
      currentEntry = entryMatch[1];
      continue;
    }
    
    const inVbaSection = currentSection && vbaSectionIds.has(currentSection);
    const inVbaEntry = currentEntry && currentEntry.startsWith('vba-');
    const isVba = inVbaSection || inVbaEntry;
    // Target prefix: ' for VBA, // for everything else in Excel
    const target = isVba ? "'" : '//';
    
    // Fix banner comment prefixes: convert // and -- to the correct prefix
    let fixed = line;
    for (const wrong of ['//', '--']) {
      if (wrong === target) continue;
      fixed = fixed
        .replaceAll(`${wrong} === `, `${target} === `)
        .replaceAll(`${wrong} TASK `, `${target} TASK `)
        .replaceAll(`${wrong} APPROACH `, `${target} APPROACH `)
        .replaceAll(`${wrong} STRENGTHS `, `${target} STRENGTHS `)
        .replaceAll(`${wrong} WEAKNESSES`, `${target} WEAKNESSES`);
    }
    if (fixed !== line) {
      lines[i] = fixed;
      fixCount++;
    }
  }
  
  writeFileSync(file, lines.join('\n'));
  console.log(`${file}: ${fixCount} lines fixed`);
}
