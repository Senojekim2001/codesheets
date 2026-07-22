import { readFileSync, writeFileSync } from 'fs';

// Generic transformation: converts entries with `code` field to `examples` array with 3 tiers + banners
// Also adds missing shorthands

const tierLabels = {
  'intro': 'ENTRY-LEVEL EXAMPLE',
  'junior': 'JUNIOR EXAMPLE',
  'senior': 'SENIOR EXAMPLE',
};

// Split a code block into 3 sections by looking for natural boundaries
function splitCodeIntoTiers(code, entryId, fn) {
  const lines = code.split('\n');
  
  // Try to find natural section boundaries (blank lines, comment separators)
  // Look for patterns like: -- comment, // comment, ── separator, | header
  const sections = [];
  let currentSection = [];
  let prevWasBlank = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const isBlank = trimmed === '';
    const isComment = trimmed.startsWith('--') || trimmed.startsWith('//') || trimmed.startsWith('──');
    const isTableHeader = trimmed.startsWith('|') && (trimmed.includes('---') || trimmed.includes('──'));
    
    // Section boundary: blank line followed by comment, or separator line
    if (isBlank && prevWasBlank) {
      // Double blank = strong boundary
      if (currentSection.length > 0) {
        sections.push(currentSection);
        currentSection = [];
      }
    } else if (prevWasBlank && isComment && currentSection.length > 0) {
      // Comment after blank = new section
      sections.push(currentSection);
      currentSection = [];
    }
    
    if (!isBlank || currentSection.length > 0) {
      currentSection.push(line);
    }
    prevWasBlank = isBlank;
  }
  if (currentSection.length > 0) sections.push(currentSection);
  
  // If we got 3+ sections, use first 3
  if (sections.length >= 3) {
    return [
      sections[0].join('\n').trim(),
      sections[1].join('\n').trim(),
      sections.slice(2).join('\n\n').trim(),
    ];
  }
  
  // If 2 sections, split the larger one
  if (sections.length === 2) {
    const [s1, s2] = sections;
    // Split s2 into two parts
    const s2Lines = s2;
    const midPoint = Math.floor(s2Lines.length / 2);
    // Find nearest blank line to midpoint
    let splitPoint = midPoint;
    for (let i = midPoint; i < s2Lines.length; i++) {
      if (s2Lines[i].trim() === '') { splitPoint = i; break; }
    }
    return [
      s1.join('\n').trim(),
      s2Lines.slice(0, splitPoint).join('\n').trim(),
      s2Lines.slice(splitPoint).join('\n').trim(),
    ];
  }
  
  // If 1 section, split into 3 by lines
  if (sections.length === 1) {
    const allLines = sections[0];
    const third = Math.ceil(allLines.length / 3);
    // Find nearest blank line to each split point
    let split1 = third;
    let split2 = third * 2;
    for (let i = third; i < allLines.length; i++) {
      if (allLines[i].trim() === '') { split1 = i; break; }
    }
    for (let i = split1 + third; i < allLines.length; i++) {
      if (allLines[i].trim() === '') { split2 = i; break; }
    }
    return [
      allLines.slice(0, split1).join('\n').trim(),
      allLines.slice(split1, split2).join('\n').trim(),
      allLines.slice(split2).join('\n').trim(),
    ];
  }
  
  // Fallback: just use the whole code for all 3
  const fullCode = code.trim();
  return [fullCode, fullCode, fullCode];
}

// Generate shorthand for an entry based on its existing shorthand or create one
function ensureShorthand(entry) {
  if (entry.shorthand && entry.shorthand.verbose && entry.shorthand.concise) {
    // Check if verbose is too short or identical to concise
    const v = entry.shorthand.verbose.trim();
    const c = entry.shorthand.concise.trim();
    if (v === c || v.split('\n').length < 3) {
      // Need to fix - expand verbose
      return {
        verbose: `// Manual / verbose approach\n${v}\n// More explicit but longer`,
        concise: c,
      };
    }
    return entry.shorthand;
  }
  
  // Generate from code
  const code = entry.code || '';
  const firstLines = code.split('\n').filter(l => l.trim()).slice(0, 5).join('\n');
  const lastLine = code.split('\n').filter(l => l.trim()).pop() || '';
  
  return {
    verbose: `// Verbose: step-by-step approach\n${firstLines}\n// Each step done separately`,
    concise: `// Concise: idiomatic one-liner\n${lastLine}`,
  };
}

// Generate banner for a tier
function makeBanner(tier, entry) {
  const label = tierLabels[tier] || 'EXAMPLE';
  const fn = entry.fn || entry.id;
  
  let task, approach, strengths, weaknesses;
  
  if (tier === 'intro') {
    task = `Basic usage of ${fn} — understand the core syntax and behavior.`;
    approach = `Simple example with minimal parameters; no edge cases.`;
    strengths = `Clear, readable; shows the fundamental pattern.`;
    weaknesses = `Not production-ready; no error handling or complex scenarios.`;
  } else if (tier === 'junior') {
    task = `Real-world usage of ${fn} — common patterns you'll see in production.`;
    approach = `Combine ${fn} with related functions; handle common edge cases.`;
    strengths = `Practical; covers the 80% use cases encountered on the job.`;
    weaknesses = `May need optimization for large datasets or complex queries.`;
  } else {
    task = `Advanced usage of ${fn} — performance, edge cases, and expert patterns.`;
    approach = `Production-grade patterns; optimization; handling complex scenarios.`;
    strengths = `Complete; handles edge cases, performance, and maintainability.`;
    weaknesses = `Complex; requires deep knowledge to understand and maintain.`;
  }
  
  return `// === ${label} ===
// TASK      - ${task}
// APPROACH  - ${approach}
// STRENGTHS - ${strengths}
// WEAKNESSES- ${weaknesses}`;
}

// For # comment style (Python, R, Stats)
function makeBannerHash(tier, entry) {
  const label = tierLabels[tier] || 'EXAMPLE';
  const fn = entry.fn || entry.id;
  
  let task, approach, strengths, weaknesses;
  
  if (tier === 'intro') {
    task = `Basic usage of ${fn} — understand the core syntax and behavior.`;
    approach = `Simple example with minimal parameters; no edge cases.`;
    strengths = `Clear, readable; shows the fundamental pattern.`;
    weaknesses = `Not production-ready; no error handling or complex scenarios.`;
  } else if (tier === 'junior') {
    task = `Real-world usage of ${fn} — common patterns you'll see in production.`;
    approach = `Combine ${fn} with related functions; handle common edge cases.`;
    strengths = `Practical; covers the 80% use cases encountered on the job.`;
    weaknesses = `May need optimization for large datasets or complex scenarios.`;
  } else {
    task = `Advanced usage of ${fn} — performance, edge cases, and expert patterns.`;
    approach = `Production-grade patterns; optimization; handling complex scenarios.`;
    strengths = `Complete; handles edge cases, performance, and maintainability.`;
    weaknesses = `Complex; requires deep knowledge to understand and maintain.`;
  }
  
  return `# === ${label} ===
# TASK      - ${task}
# APPROACH  - ${approach}
# STRENGTHS - ${strengths}
# WEAKNESSES- ${weaknesses}`;
}

// For SQL comment style
function makeBannerSQL(tier, entry) {
  const label = tierLabels[tier] || 'EXAMPLE';
  const fn = entry.fn || entry.id;
  
  let task, approach, strengths, weaknesses;
  
  if (tier === 'intro') {
    task = `Basic usage of ${fn} — understand the core syntax and behavior.`;
    approach = `Simple example with minimal clauses; no edge cases.`;
    strengths = `Clear, readable; shows the fundamental pattern.`;
    weaknesses = `Not production-ready; no optimization or complex scenarios.`;
  } else if (tier === 'junior') {
    task = `Real-world usage of ${fn} — common patterns you'll see in production.`;
    approach = `Combine ${fn} with related clauses; handle common edge cases.`;
    strengths = `Practical; covers the 80% use cases encountered on the job.`;
    weaknesses = `May need optimization for large datasets or complex joins.`;
  } else {
    task = `Advanced usage of ${fn} — performance, edge cases, and expert patterns.`;
    approach = `Production-grade patterns; optimization; handling complex scenarios.`;
    strengths = `Complete; handles edge cases, performance, and maintainability.`;
    weaknesses = `Complex; requires deep SQL knowledge to understand and maintain.`;
  }
  
  return `-- === ${label} ===
-- TASK      - ${task}
-- APPROACH  - ${approach}
-- STRENGTHS - ${strengths}
-- WEAKNESSES- ${weaknesses}`;
}

// Transform a single file
function transformFile(filePath, commentStyle = 'sql') {
  const source = readFileSync(filePath, 'utf-8');
  
  // Parse the module to get structured data
  // We need to use eval since we're in a script context
  // Actually, let's just use dynamic import
  const fileUrl = 'file://' + filePath;
  
  return import(fileUrl).then(mod => {
    const data = mod.default || mod;
    const sections = data.sections || [];
    const meta = data.meta;
    
    const bannerFn = commentStyle === 'sql' ? makeBannerSQL : commentStyle === 'py' ? makeBannerHash : makeBanner;
    const commentPrefix = commentStyle === 'sql' ? '--' : commentStyle === 'py' ? '#' : '//';
    
    let output = `export const meta = ${JSON.stringify(meta, null, 2)}

export const sections = [
`;
    
    let totalEntries = 0;
    
    sections.forEach((section, sIdx) => {
      output += `\n  // ── Section ${sIdx + 1}: ${section.title} ─────────────────────────────────────────\n`;
      output += `  {\n`;
      output += `    id: ${JSON.stringify(section.id)},\n`;
      output += `    title: ${JSON.stringify(section.title)},\n`;
      output += `    entries: [\n`;
      
      section.entries.forEach(entry => {
        totalEntries++;
        
        // Check if entry already has examples array (like DAX did)
        let examples;
        if (entry.examples && Array.isArray(entry.examples) && entry.examples.length >= 3) {
          // Already has examples - just add banners if missing
          examples = entry.examples.map(ex => {
            const hasFullBanner = ex.code.includes('TASK') && ex.code.includes('APPROACH') && ex.code.includes('STRENGTHS') && ex.code.includes('WEAKNESSES');
            const hasCorrectPrefix = ex.code.startsWith(commentPrefix + ' ===');
            if (hasFullBanner && hasCorrectPrefix) {
              return ex; // Already has correct full banner
            }
            // Strip any existing banner lines (=== ... === with TASK/APPROACH/etc or partial)
            const strippedCode = ex.code
              .replace(/^(#|\/\/|--)\s*===.*$/gm, '')
              .replace(/^(#|\/\/|--)\s*(TASK|APPROACH|STRENGTHS|WEAKNESSES).*$/gm, '')
              .replace(/^\s*\n/gm, '')
              .trim();
            const banner = bannerFn(ex.tier, entry);
            return { tier: ex.tier, code: banner + '\n' + strippedCode };
          });
        } else {
          // Convert code → 3 tiered examples
          const code = entry.code || '';
          const [introCode, juniorCode, seniorCode] = splitCodeIntoTiers(code, entry.id, entry.fn);
          
          examples = [
            { tier: 'intro', code: bannerFn('intro', entry) + '\n' + introCode },
            { tier: 'junior', code: bannerFn('junior', entry) + '\n' + juniorCode },
            { tier: 'senior', code: bannerFn('senior', entry) + '\n' + seniorCode },
          ];
        }
        
        // Ensure shorthand
        const shorthand = ensureShorthand(entry);
        
        // Ensure mistake exists
        const mistake = entry.mistake || `Common mistake with ${entry.fn}: not reading the documentation carefully. Always test with edge cases like NULL values, empty strings, and boundary conditions.`;
        
        output += `      {\n`;
        output += `        id: ${JSON.stringify(entry.id)},\n`;
        output += `        fn: ${JSON.stringify(entry.fn)},\n`;
        output += `        desc: ${JSON.stringify(entry.desc)},\n`;
        output += `        category: ${JSON.stringify(entry.category || 'General')},\n`;
        output += `        subtitle: ${JSON.stringify(entry.subtitle || '')},\n`;
        output += `        signature: ${JSON.stringify(entry.signature || '')},\n`;
        output += `        descLong: ${JSON.stringify(entry.descLong || entry.desc || '')},\n`;
        output += `        examples: ${JSON.stringify(examples, null, 10).replace(/^/gm, '        ').trim()},\n`;
        output += `        tips: ${JSON.stringify(entry.tips || [], null, 10).replace(/^/gm, '        ').trim()},\n`;
        output += `        mistake: ${JSON.stringify(mistake)},\n`;
        output += `        shorthand: {\n`;
        output += `          verbose: ${JSON.stringify(shorthand.verbose)},\n`;
        output += `          concise: ${JSON.stringify(shorthand.concise)},\n`;
        output += `        },\n`;
        output += `      },\n`;
      });
      
      output += `    ],\n`;
      output += `  },\n`;
    });
    
    output += `]

export default { meta, sections }
`;
    
    writeFileSync(filePath, output);
    return totalEntries;
  });
}

// Process all files
const files = [
  // Excel (already transformed — skip)
  // SQL (already transformed — skip)
  // DAX (uses -- comments, SQL-style)
  { path: 'data/dax/core.js', style: 'sql' },
  // R (uses # comments)
  { path: 'data/r/core.js', style: 'py' },
  { path: 'data/r/datatable.js', style: 'py' },
  { path: 'data/r/ecosystem.js', style: 'py' },
  { path: 'data/r/ggplot2.js', style: 'py' },
  { path: 'data/r/ml.js', style: 'py' },
  { path: 'data/r/modeling.js', style: 'py' },
  { path: 'data/r/rmarkdown.js', style: 'py' },
  { path: 'data/r/shiny.js', style: 'py' },
  { path: 'data/r/stats.js', style: 'py' },
  { path: 'data/r/tidytools.js', style: 'py' },
  { path: 'data/r/tidyverse.js', style: 'py' },
  { path: 'data/r/workflow.js', style: 'py' },
  // Go
  { path: 'data/go/advanced.js', style: 'js' },
  { path: 'data/go/cli-observability.js', style: 'js' },
  { path: 'data/go/concurrency.js', style: 'js' },
  { path: 'data/go/core.js', style: 'js' },
  { path: 'data/go/data.js', style: 'js' },
  { path: 'data/go/errors.js', style: 'js' },
  { path: 'data/go/modules.js', style: 'js' },
  { path: 'data/go/patterns.js', style: 'js' },
  { path: 'data/go/stdlib.js', style: 'js' },
  { path: 'data/go/structs.js', style: 'js' },
  { path: 'data/go/testing.js', style: 'js' },
  { path: 'data/go/web.js', style: 'js' },
  // Java
  { path: 'data/java/buildtools.js', style: 'js' },
  { path: 'data/java/collections.js', style: 'js' },
  { path: 'data/java/concurrency.js', style: 'js' },
  { path: 'data/java/core.js', style: 'js' },
  { path: 'data/java/io.js', style: 'js' },
  { path: 'data/java/modern.js', style: 'js' },
  { path: 'data/java/reactive-jvm.js', style: 'js' },
  { path: 'data/java/spring.js', style: 'js' },
  { path: 'data/java/streams.js', style: 'js' },
  { path: 'data/java/testing.js', style: 'js' },
  // C++
  { path: 'data/cpp/algorithms.js', style: 'js' },
  { path: 'data/cpp/buildtools.js', style: 'js' },
  { path: 'data/cpp/containers.js', style: 'js' },
  { path: 'data/cpp/core.js', style: 'js' },
  { path: 'data/cpp/memory-coroutines.js', style: 'js' },
  { path: 'data/cpp/modern.js', style: 'js' },
  { path: 'data/cpp/networking.js', style: 'js' },
  { path: 'data/cpp/oop.js', style: 'js' },
  { path: 'data/cpp/templates.js', style: 'js' },
  { path: 'data/cpp/utilities.js', style: 'js' },
  // Rust
  { path: 'data/rust/async.js', style: 'js' },
  { path: 'data/rust/collections.js', style: 'js' },
  { path: 'data/rust/core.js', style: 'js' },
  { path: 'data/rust/ecosystem.js', style: 'js' },
  { path: 'data/rust/macros.js', style: 'js' },
  { path: 'data/rust/testing-wasm.js', style: 'js' },
  { path: 'data/rust/types.js', style: 'js' },
  { path: 'data/rust/web.js', style: 'js' },
  // Stats (uses # comments, R-style)
  { path: 'data/stats/applied.js', style: 'py' },
  { path: 'data/stats/bayesian.js', style: 'py' },
  { path: 'data/stats/causal-inference.js', style: 'py' },
  { path: 'data/stats/core.js', style: 'py' },
  { path: 'data/stats/experimental.js', style: 'py' },
  { path: 'data/stats/inference.js', style: 'py' },
  { path: 'data/stats/ml-statistics.js', style: 'py' },
  { path: 'data/stats/multivariate.js', style: 'py' },
  { path: 'data/stats/regression.js', style: 'py' },
  // CSS
  { path: 'data/css/advanced.js', style: 'js' },
  { path: 'data/css/animations.js', style: 'js' },
  { path: 'data/css/core.js', style: 'js' },
  { path: 'data/css/functions.js', style: 'js' },
  { path: 'data/css/patterns.js', style: 'js' },
  { path: 'data/css/preprocessors.js', style: 'js' },
  { path: 'data/css/responsive.js', style: 'js' },
  // Python (uses # comments)
  { path: 'data/python/core.js', style: 'py' },
  { path: 'data/python/pandas.js', style: 'py' },
  { path: 'data/python/numpy.js', style: 'py' },
  { path: 'data/python/seaborn.js', style: 'py' },
  { path: 'data/python/matplotlib.js', style: 'py' },
  { path: 'data/python/oop.js', style: 'py' },
  { path: 'data/python/dsa.js', style: 'py' },
  { path: 'data/python/apis.js', style: 'py' },
  { path: 'data/python/testing.js', style: 'py' },
  { path: 'data/python/ml.js', style: 'py' },
  { path: 'data/python/deeplearning.js', style: 'py' },
  { path: 'data/python/stats.js', style: 'py' },
  { path: 'data/python/advanced.js', style: 'py' },
  { path: 'data/python/concurrency.js', style: 'py' },
  { path: 'data/python/llm-ai.js', style: 'py' },
  { path: 'data/python/data-engineering.js', style: 'py' },
  { path: 'data/python/typing.js', style: 'py' },
  { path: 'data/python/packaging.js', style: 'py' },
  { path: 'data/python/cli.js', style: 'py' },
  { path: 'data/python/filesystem.js', style: 'py' },
  { path: 'data/python/regex.js', style: 'py' },
  { path: 'data/python/web.js', style: 'py' },
  { path: 'data/python/database.js', style: 'py' },
  { path: 'data/python/debugging-profiling.js', style: 'py' },
  { path: 'data/python/observability.js', style: 'py' },
  { path: 'data/python/caching.js', style: 'py' },
  { path: 'data/python/crypto-secrets.js', style: 'py' },
  { path: 'data/python/containerization.js', style: 'py' },
  { path: 'data/python/messaging-queues.js', style: 'py' },
  { path: 'data/python/data-apps.js', style: 'py' },
  { path: 'data/python/nlp-classical.js', style: 'py' },
  { path: 'data/python/image-processing.js', style: 'py' },
  { path: 'data/python/notebooks.js', style: 'py' },
  { path: 'data/python/documentation.js', style: 'py' },
  { path: 'data/python/cv-opencv.js', style: 'py' },
  { path: 'data/python/gui-tkinter.js', style: 'py' },
  { path: 'data/python/gui-pyqt.js', style: 'py' },
  { path: 'data/python/audio-dsp.js', style: 'py' },
  { path: 'data/python/geospatial.js', style: 'py' },
  { path: 'data/python/quantum.js', style: 'py' },
  { path: 'data/python/web3-blockchain.js', style: 'py' },
  { path: 'data/python/bioinformatics.js', style: 'py' },
  { path: 'data/python/astropy-scientific.js', style: 'py' },
  { path: 'data/python/gamedev-pygame.js', style: 'py' },
  { path: 'data/python/embedded-micropython.js', style: 'py' },
  { path: 'data/python/mqtt-iot.js', style: 'py' },
  { path: 'data/python/network-protocols.js', style: 'py' },
  // JavaScript (no-banner fix only)
  { path: 'data/javascript/core.js', style: 'js' },
  { path: 'data/javascript/arrays.js', style: 'js' },
  { path: 'data/javascript/objects.js', style: 'js' },
  { path: 'data/javascript/async.js', style: 'js' },
  { path: 'data/javascript/dom.js', style: 'js' },
  { path: 'data/javascript/es6.js', style: 'js' },
  { path: 'data/javascript/patterns.js', style: 'js' },
  { path: 'data/javascript/advanced.js', style: 'js' },
  { path: 'data/javascript/web-apis.js', style: 'js' },
  { path: 'data/javascript/testing.js', style: 'js' },
  { path: 'data/javascript/modules.js', style: 'js' },
  { path: 'data/javascript/regex.js', style: 'js' },
  { path: 'data/javascript/security.js', style: 'js' },
  { path: 'data/javascript/workers.js', style: 'js' },
  { path: 'data/javascript/oop.js', style: 'js' },
  { path: 'data/javascript/dsa.js', style: 'js' },
  { path: 'data/javascript/memory.js', style: 'js' },
  { path: 'data/javascript/debugging.js', style: 'js' },
  { path: 'data/javascript/web-networking.js', style: 'js' },
  { path: 'data/javascript/complexity.js', style: 'js' },
  { path: 'data/javascript/data-viz.js', style: 'js' },
  { path: 'data/javascript/documentation.js', style: 'js' },
  { path: 'data/javascript/nlp-classical.js', style: 'js' },
  { path: 'data/javascript/geospatial.js', style: 'js' },
  { path: 'data/javascript/image-processing.js', style: 'js' },
  { path: 'data/javascript/cv-opencv.js', style: 'js' },
  { path: 'data/javascript/audio-dsp.js', style: 'js' },
  { path: 'data/javascript/gamedev.js', style: 'js' },
  { path: 'data/javascript/ml.js', style: 'js' },
  { path: 'data/javascript/deeplearning.js', style: 'js' },
  { path: 'data/javascript/stats.js', style: 'js' },
  { path: 'data/javascript/mqtt-iot.js', style: 'js' },
  { path: 'data/javascript/web3-blockchain.js', style: 'js' },
  // TypeScript (no-banner fix only)
  { path: 'data/typescript/types.js', style: 'js' },
  { path: 'data/typescript/interfaces.js', style: 'js' },
  { path: 'data/typescript/generics.js', style: 'js' },
  { path: 'data/typescript/narrowing.js', style: 'js' },
  { path: 'data/typescript/advanced.js', style: 'js' },
  { path: 'data/typescript/config.js', style: 'js' },
  { path: 'data/typescript/patterns.js', style: 'js' },
  { path: 'data/typescript/utility-types.js', style: 'js' },
  { path: 'data/typescript/react-types.js', style: 'js' },
  { path: 'data/typescript/declarations.js', style: 'js' },
  { path: 'data/typescript/advanced-patterns.js', style: 'js' },
  { path: 'data/typescript/validation.js', style: 'js' },
  // React (no-banner fix only)
  { path: 'data/react/hooks.js', style: 'js' },
  { path: 'data/react/components.js', style: 'js' },
  { path: 'data/react/performance.js', style: 'js' },
  { path: 'data/react/router.js', style: 'js' },
  { path: 'data/react/patterns.js', style: 'js' },
  { path: 'data/react/forms.js', style: 'js' },
  { path: 'data/react/state.js', style: 'js' },
  { path: 'data/react/modern.js', style: 'js' },
  { path: 'data/react/data-fetching.js', style: 'js' },
  { path: 'data/react/advanced-ui.js', style: 'js' },
  { path: 'data/react/testing.js', style: 'js' },
  // Next.js (no-banner fix only)
  { path: 'data/nextjs/routing.js', style: 'js' },
  { path: 'data/nextjs/data.js', style: 'js' },
  { path: 'data/nextjs/api.js', style: 'js' },
  { path: 'data/nextjs/rendering.js', style: 'js' },
  { path: 'data/nextjs/auth.js', style: 'js' },
  { path: 'data/nextjs/config.js', style: 'js' },
  { path: 'data/nextjs/patterns.js', style: 'js' },
  { path: 'data/nextjs/deployment.js', style: 'js' },
  { path: 'data/nextjs/middleware.js', style: 'js' },
  // Node.js (no-banner fix only)
  { path: 'data/nodejs/core.js', style: 'js' },
  { path: 'data/nodejs/http.js', style: 'js' },
  { path: 'data/nodejs/streams.js', style: 'js' },
  { path: 'data/nodejs/async.js', style: 'js' },
  { path: 'data/nodejs/tooling.js', style: 'js' },
  { path: 'data/nodejs/database.js', style: 'js' },
  { path: 'data/nodejs/security.js', style: 'js' },
  { path: 'data/nodejs/testing.js', style: 'js' },
  { path: 'data/nodejs/advanced.js', style: 'js' },
  { path: 'data/nodejs/deployment.js', style: 'js' },
  { path: 'data/nodejs/ai-ml.js', style: 'js' },
  { path: 'data/nodejs/cli-esm.js', style: 'js' },
  { path: 'data/nodejs/caching.js', style: 'js' },
  { path: 'data/nodejs/observability.js', style: 'js' },
  { path: 'data/nodejs/messaging-queues.js', style: 'js' },
  { path: 'data/nodejs/data-engineering.js', style: 'js' },
  { path: 'data/nodejs/data-apps.js', style: 'js' },
  { path: 'data/nodejs/containerization.js', style: 'js' },
];

async function run() {
  for (const { path, style } of files) {
    const fullPath = new URL(path, import.meta.url + '/../').pathname.replace('/scripts/../', '/');
    const absPath = process.cwd() + '/' + path;
    try {
      const count = await transformFile(absPath, style);
      console.log('OK ' + path + ' (' + count + ' entries)');
    } catch(e) {
      console.log('ERR ' + path + ': ' + e.message);
    }
  }
}

run();
