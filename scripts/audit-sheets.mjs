import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, dirname } from 'path';

const dataDir = new URL('../data/', import.meta.url).pathname;

// Collect all .js files under data/ (excluding catalog.js, AUTHORING.md)
const files = [];
function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry.startsWith('.') || entry === 'catalog.js' || entry === 'AUTHORING.md') continue;
    if (statSync(full).isDirectory()) {
      collect(full);
    } else if (entry.endsWith('.js')) {
      files.push(full);
    }
  }
}
collect(dataDir);

const issues = [];
let totalEntries = 0;
let totalSections = 0;
let totalSheets = 0;

// Expected comment prefix per domain
const domainCommentStyle = {
  python: '#', r: '#', stats: '#',
  sql: '--', dax: '--', excel: "'",
  javascript: '//', typescript: '//', react: '//', nextjs: '//', nodejs: '//',
  go: '//', java: '//', cpp: '//', rust: '//', css: '/*',
};

for (const filePath of files) {
  const relPath = filePath.replace(dataDir, '');
  const domain = relPath.split('/')[0];
  const expectedPrefix = domainCommentStyle[domain] || '//';
  
  let mod;
  try {
    mod = await import('file://' + filePath);
  } catch (e) {
    issues.push({ file: relPath, severity: 'ERROR', category: 'import', msg: e.message });
    continue;
  }
  
  const data = mod.default || mod;
  const sections = data.sections || [];
  const meta = data.meta;
  totalSheets++;
  
  if (!meta || (!meta.title && !meta.label)) {
    issues.push({ file: relPath, severity: 'WARN', category: 'meta', msg: 'Missing meta.title/label' });
  }
  
  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx];
    totalSections++;
    
    if (!section.id) {
      issues.push({ file: relPath, severity: 'WARN', category: 'section', msg: `Section ${sIdx} missing id` });
    }
    if (!section.title) {
      issues.push({ file: relPath, severity: 'WARN', category: 'section', msg: `Section ${sIdx} missing title` });
    }
    
    const entries = section.entries || [];
    
    for (let eIdx = 0; eIdx < entries.length; eIdx++) {
      const entry = entries[eIdx];
      totalEntries++;
      const entryRef = `${relPath}:${section.id}:${entry.id || eIdx}`;
      
      // Check required fields
      if (!entry.id) {
        issues.push({ file: relPath, severity: 'ERROR', category: 'entry', msg: `Section "${section.id}" entry ${eIdx} missing id` });
      }
      if (!entry.fn) {
        issues.push({ file: relPath, severity: 'WARN', category: 'entry', msg: `${entryRef} missing fn` });
      }
      if (!entry.desc) {
        issues.push({ file: relPath, severity: 'WARN', category: 'entry', msg: `${entryRef} missing desc` });
      }
      
      // Check examples
      if (!entry.examples || !Array.isArray(entry.examples) || entry.examples.length < 3) {
        issues.push({ file: relPath, severity: 'ERROR', category: 'examples', msg: `${entryRef} has ${entry.examples?.length || 0} examples (need 3)` });
      } else {
        for (let xIdx = 0; xIdx < entry.examples.length; xIdx++) {
          const ex = entry.examples[xIdx];
          const exRef = `${entryRef}:ex${xIdx}`;
          
          if (!ex.tier) {
            issues.push({ file: relPath, severity: 'WARN', category: 'examples', msg: `${exRef} missing tier` });
          }
          if (!ex.code || ex.code.trim().length < 10) {
            issues.push({ file: relPath, severity: 'ERROR', category: 'examples', msg: `${exRef} empty or tiny code` });
            continue;
          }
          
          const code = ex.code;
          
          // Check banner presence
          const hasBanner = code.includes('TASK') && code.includes('APPROACH') && 
                            code.includes('STRENGTHS') && code.includes('WEAKNESSES');
          if (!hasBanner) {
            issues.push({ file: relPath, severity: 'WARN', category: 'banner', msg: `${exRef} missing full banner (TASK/APPROACH/STRENGTHS/WEAKNESSES)` });
          }
          
          // Check banner comment style matches domain
          if (hasBanner) {
            const firstLine = code.split('\n')[0];
            const actualMatch = firstLine.match(/^(#|\/\/|--|\/\*|')\s*===/);
            const actual = actualMatch ? actualMatch[1] : '?';
            // Excel is a mixed domain: ' for VBA, // for Power Query M / formulas
            const allowed = domain === 'excel' ? ["'", '//'] : [expectedPrefix];
            if (expectedPrefix !== '/*' && !allowed.includes(actual)) {
              issues.push({ file: relPath, severity: 'WARN', category: 'banner-style', 
                msg: `${exRef} banner uses "${actual}" but domain "${domain}" expects "${allowed.join(' or ')}"` });
            }
          }
          
          // Check for HTML entities that shouldn't be in raw code
          // (these indicate double-escaping or corruption)
          if (code.includes('&lt;span') || code.includes('&gt;span') || code.includes('class=&quot;')) {
            issues.push({ file: relPath, severity: 'ERROR', category: 'html-corruption', 
              msg: `${exRef} contains HTML entity in span/class — possible double-escaping` });
          }
          
          // Check for literal class="cm" or class="str" etc in code (highlighter leak)
          if (/\bclass="(cm|kw|str|num|fn)"/.test(code)) {
            issues.push({ file: relPath, severity: 'ERROR', category: 'highlight-leak', 
              msg: `${exRef} contains literal highlight span class in raw code` });
          }
          
          // Check for unescaped < or > that aren't part of HTML tags
          // (raw < or > in code should be fine since highlighter escapes them)
          
          // Check for empty lines at start/end of code
          if (code !== code.trim()) {
            issues.push({ file: relPath, severity: 'INFO', category: 'whitespace', 
              msg: `${exRef} has leading/trailing whitespace in code` });
          }
          
          // Check for very long lines (>200 chars) that might cause display issues
          const longLines = code.split('\n').filter(l => l.length > 200);
          if (longLines.length > 0) {
            issues.push({ file: relPath, severity: 'INFO', category: 'long-lines', 
              msg: `${exRef} has ${longLines.length} line(s) >200 chars` });
          }
          
          // Check for tab characters (inconsistent indentation)
          if (code.includes('\t')) {
            issues.push({ file: relPath, severity: 'INFO', category: 'tabs', 
              msg: `${exRef} contains tab characters` });
          }
          
          // Check for Windows line endings
          if (code.includes('\r')) {
            issues.push({ file: relPath, severity: 'WARN', category: 'line-endings', 
              msg: `${exRef} contains \\r (Windows line endings)` });
          }
          
          // Check for trailing whitespace on lines
          const trailingWs = code.split('\n').filter(l => l !== l.trimEnd() && l.trim().length > 0);
          if (trailingWs.length > 3) {
            issues.push({ file: relPath, severity: 'INFO', category: 'trailing-ws', 
              msg: `${exRef} has ${trailingWs.length} lines with trailing whitespace` });
          }
        }
      }
      
      // Check tips (should have >= 3)
      if (!entry.tips || !Array.isArray(entry.tips) || entry.tips.length < 3) {
        issues.push({ file: relPath, severity: 'WARN', category: 'tips', 
          msg: `${entryRef} has ${entry.tips?.length || 0} tips (need >=3)` });
      }
      
      // Check shorthand
      if (!entry.shorthand || !entry.shorthand.verbose || !entry.shorthand.concise) {
        issues.push({ file: relPath, severity: 'WARN', category: 'shorthand', 
          msg: `${entryRef} missing shorthand (verbose/concise)` });
      }
      
      // Check mistake
      if (!entry.mistake) {
        issues.push({ file: relPath, severity: 'INFO', category: 'mistake', 
          msg: `${entryRef} missing mistake field` });
      }
    }
  }
}

// Summary
console.log('=== CHEAT SHEET AUDIT ===');
console.log(`Sheets: ${totalSheets}, Sections: ${totalSections}, Entries: ${totalEntries}`);
console.log(`Total issues: ${issues.length}`);
console.log('');

// Group by severity
const severityOrder = ['ERROR', 'WARN', 'INFO'];
const categoryCounts = {};
const severityCounts = {};

for (const issue of issues) {
  severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
  const key = `${issue.severity}/${issue.category}`;
  categoryCounts[key] = (categoryCounts[key] || 0) + 1;
}

console.log('--- By Severity ---');
for (const sev of severityOrder) {
  if (severityCounts[sev]) {
    console.log(`  ${sev}: ${severityCounts[sev]}`);
  }
}

console.log('\n--- By Category ---');
const sortedCats = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
for (const [cat, count] of sortedCats) {
  console.log(`  ${cat}: ${count}`);
}

// Print ERROR issues first, then WARN, then INFO (sampled)
for (const sev of severityOrder) {
  const sevIssues = issues.filter(i => i.severity === sev);
  if (sevIssues.length === 0) continue;
  console.log(`\n=== ${sev} Issues (${sevIssues.length}) ===`);
  
  // For INFO, just show counts per file
  if (sev === 'INFO') {
    const byFile = {};
    for (const i of sevIssues) {
      byFile[i.file] = byFile[i.file] || [];
      byFile[i.file].push(i.category);
    }
    for (const [file, cats] of Object.entries(byFile).sort().slice(0, 30)) {
      const catSummary = {};
      cats.forEach(c => catSummary[c] = (catSummary[c] || 0) + 1);
      console.log(`  ${file}: ${Object.entries(catSummary).map(([k,v]) => `${v}x ${k}`).join(', ')}`);
    }
    if (Object.keys(byFile).length > 30) {
      console.log(`  ... and ${Object.keys(byFile).length - 30} more files`);
    }
    continue;
  }
  
  // For ERROR and WARN, show all (up to 100)
  for (const issue of sevIssues.slice(0, 100)) {
    console.log(`  [${issue.category}] ${issue.file}: ${issue.msg}`);
  }
  if (sevIssues.length > 100) {
    console.log(`  ... and ${sevIssues.length - 100} more`);
  }
}
