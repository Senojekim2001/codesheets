import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'data', 'dax', 'core.js');
const source = readFileSync(filePath, 'utf-8');

// Import the module to get structured data
const mod = await import('file://' + filePath);
const data = mod.default;
const sections = data.sections;

// Banner templates per tier
const tierLabels = {
  'intro': 'ENTRY-LEVEL EXAMPLE',
  'junior': 'JUNIOR EXAMPLE',
  'senior': 'SENIOR EXAMPLE',
};

// Generate shorthand for a DAX entry
function generateShorthand(entry) {
  const id = entry.id;
  const fn = entry.fn;
  const sig = entry.signature || '';
  
  // Build verbose (multi-line explicit version)
  const verboseLines = [];
  const conciseLines = [];
  
  // Entry-specific shorthands based on function
  const shorthands = {
    'calculate': {
      verbose: `// Verbose: multiple nested CALCULATE calls\nTotal Sales =\nCALCULATE(\n    CALCULATE(\n        SUM(Sales[Amount]),\n        Sales[Category] = "Electronics"\n    ),\n    YEAR(Sales[Date]) = 2024\n)`,
      concise: `// Concise: stack filters in one CALCULATE\nElectronics 2024 = CALCULATE(SUM(Sales[Amount]), Sales[Category]="Electronics", YEAR(Sales[Date])=2024)`,
    },
    'filter': {
      verbose: `// Verbose: FILTER with explicit table reference\nCALCULATE(\n    SUM(Sales[Amount]),\n    FILTER(Sales, Sales[Amount] > 1000)\n)`,
      concise: `// Concise: boolean filter shorthand\nCALCULATE(SUM(Sales[Amount]), Sales[Amount] > 1000)`,
    },
    'all': {
      verbose: `// Verbose: ALL on entire table\nCALCULATE(SUM(Sales[Amount]), ALL(Sales))`,
      concise: `// Concise: ALL on specific column for % of total\nDIVIDE(SUM(Sales[Amount]), CALCULATE(SUM(Sales[Amount]), ALL(Sales[Category])))`,
    },
    'related': {
      verbose: `// Verbose: lookup via RELATED in a calculated column\nSales[Category] = RELATED(Products[Category])`,
      concise: `// Concise: use RELATED in measure via CALCULATE\nCat Sales = CALCULATE(SUM(Sales[Amount]), Products[Category]="Electronics")`,
    },
    'if-switch': {
      verbose: `// Verbose: nested IF for multiple conditions\nStatus = IF(Sales[Amount]>1000,"High",IF(Sales[Amount]>500,"Med","Low"))`,
      concise: `// Concise: SWITCH for readability\nStatus = SWITCH(TRUE(), Sales[Amount]>1000,"High", Sales[Amount]>500,"Med", "Low")`,
    },
    'divide': {
      verbose: `// Verbose: IFERROR + DIVIDE guard\nPct = IFERROR(SUM(Sales[A])/SUM(Sales[B]), 0)`,
      concise: `// Concise: DIVIDE handles divide-by-zero\nPct = DIVIDE(SUM(Sales[A]), SUM(Sales[B]), 0)`,
    },
    'selectedvalue': {
      verbose: `// Verbose: HASONEVALUE + VALUES to get selected value\nSelYear = IF(HASONEVALUE(Calendar[Year]), VALUES(Calendar[Year]), "All")`,
      concise: `// Concise: SELECTEDVALUE does both\nSelYear = SELECTEDVALUE(Calendar[Year], "All")`,
    },
    'basic-agg': {
      verbose: `// Verbose: separate measures for each aggregation\nTotalQty = SUM(Sales[Qty])\nAvgPrice = AVERAGE(Sales[Price])\nMinDate = MIN(Sales[Date])`,
      concise: `// Concise: single measure with variable\nStats = VAR a=SUM(Sales[Qty]) RETURN a`,
    },
    'sumx': {
      verbose: `// Verbose: calculated column then SUM\nSales[LineTotal] = Sales[Qty] * Sales[Price]\nTotalRevenue = SUM(Sales[LineTotal])`,
      concise: `// Concise: SUMX in one measure\nTotalRevenue = SUMX(Sales, Sales[Qty] * Sales[Price])`,
    },
    'rankx': {
      verbose: `// Verbose: RANKX with ALL for global ranking\nRank = RANKX(ALL(Products), SUM(Sales[Amount]))`,
      concise: `// Concise: RANKX with ALLSELECTED for visual-scoped ranking\nRank = RANKX(ALLSELECTED(Products), [Total Sales])`,
    },
    'distinctcount': {
      verbose: `// Verbose: DISTINCT + COUNTROWS\nCustCount = COUNTROWS(DISTINCT(Sales[CustomerID]))`,
      concise: `// Concise: DISTINCTCOUNT\nCustCount = DISTINCTCOUNT(Sales[CustomerID])`,
    },
    'totalytd': {
      verbose: `// Verbose: manual YTD with FILTER and SAMEPERIODLASTYEAR\nYTD = CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Calendar), Calendar[Year]=MAX(Calendar[Year]) && Calendar[Date]<=MAX(Calendar[Date])))`,
      concise: `// Concise: TOTALYTD\nYTD = TOTALYTD(SUM(Sales[Amount]), Calendar[Date])`,
    },
    'sameperiodlastyear': {
      verbose: `// Verbose: DATEADD with -1 year\nPriorYear = CALCULATE(SUM(Sales[Amount]), DATEADD(Calendar[Date], -1, YEAR))`,
      concise: `// Concise: SAMEPERIODLASTYEAR\nPriorYear = CALCULATE(SUM(Sales[Amount]), SAMEPERIODLASTYEAR(Calendar[Date]))`,
    },
    'dateadd': {
      verbose: `// Verbose: CALCULATE with parallel period\nPriorMonth = CALCULATE(SUM(Sales[Amount]), PARALLELPERIOD(Calendar[Date], -1, MONTH))`,
      concise: `// Concise: DATEADD\nPriorMonth = CALCULATE(SUM(Sales[Amount]), DATEADD(Calendar[Date], -1, MONTH))`,
    },
    'var-return': {
      verbose: `// Verbose: repeat expression multiple times\nMargin = SUM(Sales[Amount]) - SUM(Sales[Cost])\nMarginPct = DIVIDE(SUM(Sales[Amount]) - SUM(Sales[Cost]), SUM(Sales[Amount]))`,
      concise: `// Concise: VAR to store and reuse\nMarginPct = VAR m=SUM(Sales[Amount])-SUM(Sales[Cost]) RETURN DIVIDE(m, SUM(Sales[Amount]))`,
    },
    'context-transition': {
      verbose: `// Verbose: calculated column with implicit context\nSales[ProductTotal] = CALCULATE(SUM(Sales[Amount]))`,
      concise: `// Concise: explicit context transition with CALCULATE in iterator\nProductTotal = SUMX(Products, CALCULATE(SUM(Sales[Amount])))`,
    },
    'percentage-of-total': {
      verbose: `// Verbose: separate numerator and denominator measures\nPct = DIVIDE(CALCULATE(SUM(Sales[Amount]), Products[Category]="A"), CALCULATE(SUM(Sales[Amount]), ALL(Products)))`,
      concise: `// Concise: ALLSELECTED for visual-level % of total\nPct = DIVIDE(SUM(Sales[Amount]), CALCULATE(SUM(Sales[Amount]), ALLSELECTED(Products)))`,
    },
    'running-total': {
      verbose: `// Verbose: FILTER with date comparison\nRunningTotal = CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Calendar), Calendar[Date] <= MAX(Calendar[Date])))`,
      concise: `// Concise: use DATESYTD or cumulative pattern\nRunningTotal = CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Sales), Sales[Date] <= MAX(Sales[Date])))`,
    },
    'left-right-mid': {
      verbose: `// Verbose: separate LEFT/RIGHT/MID calls\nPfx = LEFT(Product[Code], 4)\nSfx = RIGHT(Product[Code], 2)\nMid = MID(Product[Code], 5, 4)`,
      concise: `// Concise: PATHITEM with delimiter split\nPart = PATHITEM(SUBSTITUTE(Product[Code], "-", "|"), 2, 1)`,
    },
    'len-trim-case': {
      verbose: `// Verbose: separate functions for each operation\nClean = TRIM(UPPER(Product[Name]))\nLen = LEN(TRIM(Product[Name]))`,
      concise: `// Concise: chained in one expression\nClean = TRIM(UPPER(Product[Name]))`,
    },
    'concatenate': {
      verbose: `// Verbose: CONCATENATE function\nFullName = CONCATENATE(Customers[FirstName], CONCATENATE(" ", Customers[LastName]))`,
      concise: `// Concise: & operator\nFullName = Customers[FirstName] & " " & Customers[LastName]`,
    },
    'substitute-replace': {
      verbose: `// Verbose: REPLACE with position and length\nClean = REPLACE(Product[Code], 5, 1, "")`,
      concise: `// Concise: SUBSTITUTE by value\nClean = SUBSTITUTE(Product[Code], "-", "")`,
    },
    'search-find': {
      verbose: `// Verbose: SEARCH with error handling\nPos = IFERROR(SEARCH("-", Product[Code]), 0)`,
      concise: `// Concise: SEARCH with default\nPos = SEARCH("-", Product[Code], 1, 0)`,
    },
    'format': {
      verbose: `// Verbose: custom format string with FORMAT\nDisplay = FORMAT(SUM(Sales[Amount]), "$#,##0.00")`,
      concise: `// Concise: built-in format names\nDisplay = FORMAT(SUM(Sales[Amount]), "Currency")`,
    },
    'value-text-convert': {
      verbose: `// Verbose: VALUE with error handling\nNum = IFERROR(VALUE(Sales[TextAmt]), 0)`,
      concise: `// Concise: VALUE with implicit conversion\nNum = VALUE(Sales[TextAmt])`,
    },
    'date-parts': {
      verbose: `// Verbose: separate YEAR/MONTH/DAY\nYr = YEAR(Sales[Date])\nMo = MONTH(Sales[Date])\nDy = DAY(Sales[Date])`,
      concise: `// Concise: FORMAT for display\nYrMo = FORMAT(Sales[Date], "YYYY-MM")`,
    },
    'today-now-date': {
      verbose: `// Verbose: TODAY for date, NOW for datetime\nToday = TODAY()\nNow = NOW()`,
      concise: `// Concise: NOW for both (includes time)\nTimestamp = NOW()`,
    },
    'datediff': {
      verbose: `// Verbose: manual date math\nAge = INT((TODAY() - Customers[SignupDate]) / 365)`,
      concise: `// Concise: DATEDIFF\nAge = DATEDIFF(Customers[SignupDate], TODAY(), DAY)`,
    },
    'eomonth-calendar': {
      verbose: `// Verbose: DATE with YEAR/MONTH and day=0 trick\nEOM = DATE(YEAR(Sales[Date]), MONTH(Sales[Date]) + 1, 0)`,
      concise: `// Concise: EOMONTH\nEOM = EOMONTH(Sales[Date], 0)`,
    },
    'opening-closing-balance': {
      verbose: `// Verbose: CALCULATE with DATEADD for opening\nOpening = CALCULATE(SUM(Inventory[Qty]), DATEADD(Calendar[Date], -1, YEAR))`,
      concise: `// Concise: OPENINGBALANCEYEAR / CLOSINGBALANCEYEAR\nOpening = OPENINGBALANCEYEAR(SUM(Inventory[Qty]), Calendar[Date])`,
    },
    'summarize': {
      verbose: `// Verbose: SUMMARIZE with columns\nSummary = SUMMARIZE(Sales, Sales[Category], Sales[Year], "Total", SUM(Sales[Amount]))`,
      concise: `// Concise: ADDCOLUMNS + SUMMARIZECOLUMNS\nSummary = SUMMARIZECOLUMNS(Sales[Category], Sales[Year], "Total", SUM(Sales[Amount]))`,
    },
    'addcolumns-selectcolumns': {
      verbose: `// Verbose: ADDCOLUMNS with full expression\nResult = ADDCOLUMNS(VALUES(Products), "Revenue", CALCULATE(SUM(Sales[Amount])))`,
      concise: `// Concise: SELECTCOLUMNS for projection\nResult = SELECTCOLUMNS(Sales, "Cat", Sales[Category], "Amt", Sales[Amount])`,
    },
    'calculatetable': {
      verbose: `// Verbose: FILTER + CALCULATE pattern\nTable = FILTER(ALL(Sales), CALCULATE(SUM(Sales[Amount])) > 1000)`,
      concise: `// Concise: CALCULATETABLE\nTable = CALCULATETABLE(Sales, Sales[Amount] > 1000)`,
    },
    'topn': {
      verbose: `// Verbose: RANKX + FILTER for top N\nTop5 = FILTER(VALUES(Products), RANKX(ALL(Products), [Sales]) <= 5)`,
      concise: `// Concise: TOPN\nTop5 = TOPN(5, VALUES(Products), [Sales], DESC)`,
    },
    'union-intersect-except': {
      verbose: `// Verbose: separate table variables then combine\nVAR a=FILTER(Customers, Customers[Tier]="A")\nVAR b=FILTER(Customers, Customers[Tier]="B")\nRETURN UNION(a, b)`,
      concise: `// Concise: inline UNION\nCombined = UNION(FILTER(Customers, Customers[Tier]="A"), FILTER(Customers, Customers[Tier]="B"))`,
    },
    'isblank-iferror': {
      verbose: `// Verbose: IF(ISBLANK(...)) pattern\nResult = IF(ISBLANK(Sales[Discount]), 0, Sales[Discount])`,
      concise: `// Concise: COALESCE\nResult = COALESCE(Sales[Discount], 0)`,
    },
    'isfiltered-hasonefilter': {
      verbose: `// Verbose: HASONEFILTER + VALUES\nLabel = IF(HASONEFILTER(Calendar[Year]), VALUES(Calendar[Year]), "All Years")`,
      concise: `// Concise: SELECTEDVALUE\nLabel = SELECTEDVALUE(Calendar[Year], "All Years")`,
    },
    'round-math': {
      verbose: `// Verbose: ROUND with explicit digits\nRounded = ROUND(Sales[Amount], 2)`,
      concise: `// Concise: MROUND for multiples of 5\nRounded = MROUND(Sales[Amount], 5)`,
    },
    'median-percentile': {
      verbose: `// Verbose: PERCENTILE.INC with explicit k\nP90 = PERCENTILE.INC(Sales[Amount], 0.9)`,
      concise: `// Concise: PERCENTILEX.INC for measure context\nP90 = PERCENTILEX.INC(Sales, Sales[Amount], 0.9)`,
    },
    'removefilters-userelationship': {
      verbose: `// Verbose: ALL to remove filters then re-apply\nAllSales = CALCULATE(SUM(Sales[Amount]), ALL(Sales[Category]))`,
      concise: `// Concise: REMOVEFILTERS for clarity + USERELATIONSHIP for inactive\nOnlineSales = CALCULATE(SUM(Sales[Amount]), USERELATIONSHIP(Sales[OrderDate], Calendar[Date]))`,
    },
    'earlier': {
      verbose: `// Verbose: EARLIER for nested row context\nRank = COUNTROWS(FILTER(Products, Products[Price] > EARLIER(Products[Price])))`,
      concise: `// Concise: VAR replaces EARLIER\nRank = VAR cp=Products[Price] RETURN COUNTROWS(FILTER(Products, Products[Price] > cp))`,
    },
  };
  
  return shorthands[id] || {
    verbose: `// Verbose: explicit multi-step approach\n// (see examples above for full pattern)`,
    concise: `// Concise: idiomatic one-liner\n// (see examples above for compact form)`,
  };
}

// Transform examples: add banners
function transformExamples(entry) {
  if (!entry.examples) return entry;
  
  return entry.examples.map(ex => {
    const tierLabel = tierLabels[ex.tier] || 'EXAMPLE';
    const existingCode = ex.code;
    
    // Extract GOAL and WHY from existing comments
    const goalMatch = existingCode.match(/\/\/ GOAL:\s*(.+)/);
    const whyMatch = existingCode.match(/\/\/ WHY:\s*(.+)/);
    const noteMatch = existingCode.match(/\/\/ NOTE:\s*(.+)/);
    
    const task = goalMatch ? goalMatch[1].trim() : `Understand ${entry.fn}`;
    const approach = whyMatch ? whyMatch[1].trim() : `Use ${entry.fn} as shown`;
    
    // Remove existing GOAL/WHY/NOTE comments from code
    let cleanCode = existingCode
      .replace(/\/\/ GOAL:.*\n/g, '')
      .replace(/\/\/ WHY:.*\n/g, '')
      .replace(/\/\/ NOTE:.*\n/g, '')
      .replace(/^\n+/, '');
    
    // Build strengths/weaknesses based on tier
    let strengths, weaknesses;
    if (ex.tier === 'intro') {
      strengths = `Simple, readable; introduces the core concept of ${entry.fn}.`;
      weaknesses = `Not production-ready; no error handling or edge cases.`;
    } else if (ex.tier === 'junior') {
      strengths = `Practical patterns; covers common real-world scenarios.`;
      weaknesses = `May need performance tuning on large datasets.`;
    } else {
      strengths = `Production-grade; handles edge cases, performance, and advanced patterns.`;
      weaknesses = `Complex; requires deep DAX knowledge to maintain.`;
    }
    
    // Build banner
    const banner = `// === ${tierLabel} ===
// TASK      - ${task}
// APPROACH  - ${approach}
// STRENGTHS - ${strengths}
// WEAKNESSES- ${weaknesses}`;
    
    return {
      tier: ex.tier,
      code: banner + '\n' + cleanCode,
    };
  });
}

// Transform all entries
let output = `export const meta = ${JSON.stringify(data.meta, null, 2)}

export const sections = [
`;

sections.forEach((section, sIdx) => {
  output += `\n  // ── Section ${sIdx + 1}: ${section.title} ─────────────────────────────────────────\n`;
  output += `  {\n`;
  output += `    id: ${JSON.stringify(section.id)},\n`;
  output += `    title: ${JSON.stringify(section.title)},\n`;
  output += `    entries: [\n`;
  
  section.entries.forEach((entry, eIdx) => {
    const transformedExamples = transformExamples(entry);
    const shorthand = generateShorthand(entry);
    
    output += `      {\n`;
    output += `        id: ${JSON.stringify(entry.id)},\n`;
    output += `        fn: ${JSON.stringify(entry.fn)},\n`;
    output += `        desc: ${JSON.stringify(entry.desc)},\n`;
    output += `        category: ${JSON.stringify(entry.category)},\n`;
    output += `        subtitle: ${JSON.stringify(entry.subtitle)},\n`;
    output += `        signature: ${JSON.stringify(entry.signature)},\n`;
    output += `        descLong: ${JSON.stringify(entry.descLong)},\n`;
    output += `        examples: ${JSON.stringify(transformedExamples, null, 10).replace(/^/gm, '        ').trim()},\n`;
    output += `        tips: ${JSON.stringify(entry.tips, null, 10).replace(/^/gm, '        ').trim()},\n`;
    output += `        mistake: ${JSON.stringify(entry.mistake)},\n`;
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
console.log('DAX core.js transformed successfully');
console.log('Entries: ' + sections.flatMap(s => s.entries).length);
