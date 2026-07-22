/**
 * promptTemplates.js
 * AI prompt templates per domain for the premium Obsidian vault.
 * Each template helps users leverage their reference knowledge with AI tools.
 */

export const promptTemplates = {

  // ── Universal Templates ──────────────────────────────────────────────
  universal: [
    {
      id: 'explain-concept',
      title: 'Explain Like I\'m 5',
      template: `Explain {{concept}} in simple terms with a real-world analogy.
Then show me the simplest possible code example.
Finally, explain when I'd use this in a real project.`,
    },
    {
      id: 'debug-helper',
      title: 'Debug My Code',
      template: `I'm getting an error with {{concept}}. Here's my code:

\`\`\`
{{paste your code here}}
\`\`\`

Error message: {{paste error}}

Please:
1. Explain what's causing this error
2. Show the corrected code
3. Explain why the fix works
4. Show me how to prevent this in the future`,
    },
    {
      id: 'compare-approaches',
      title: 'Compare Approaches',
      template: `Compare these approaches to {{concept}}:
- Approach A: {{approach1}}
- Approach B: {{approach2}}

For each, show:
1. Code example
2. Pros and cons
3. Performance considerations
4. When to use each one`,
    },
    {
      id: 'code-review',
      title: 'Code Review',
      template: `Review this code that uses {{concept}}:

\`\`\`
{{paste your code here}}
\`\`\`

Check for:
- Correctness and edge cases
- Performance issues
- Readability and naming
- Best practices
- Security concerns (if applicable)`,
    },
    {
      id: 'build-project',
      title: 'Build a Mini Project',
      template: `I want to practice {{concept}} by building a small project.
My skill level: {{beginner/intermediate/advanced}}

Please suggest a project that:
1. Takes 30-60 minutes
2. Uses {{concept}} as the core focus
3. Has clear milestones
4. Includes at least one "stretch goal"

Then walk me through step 1.`,
    },
  ],

  // ── Python-Specific ──────────────────────────────────────────────────
  python: [
    {
      id: 'pandas-pipeline',
      title: 'Build a Data Pipeline',
      template: `I have a CSV with these columns: {{list columns}}.
I need to:
1. {{describe transformation 1}}
2. {{describe transformation 2}}
3. {{describe final output}}

Write a clean Pandas pipeline using method chaining.
Include error handling for missing values.`,
    },
    {
      id: 'ml-model-selection',
      title: 'ML Model Selection Guide',
      template: `I have a {{classification/regression}} problem:
- Dataset size: {{number of rows}}
- Features: {{number and types}}
- Target: {{describe target variable}}
- Key requirement: {{accuracy/interpretability/speed}}

Recommend the best scikit-learn model and show the complete pipeline
from data loading through evaluation.`,
    },
    {
      id: 'pytorch-architecture',
      title: 'Design a Neural Network',
      template: `I need a neural network for {{task description}}.
Input shape: {{describe input}}
Output: {{describe expected output}}
Dataset size: {{approximate size}}

Design the architecture in PyTorch, including:
1. Layer choices with justification
2. Activation functions
3. Loss function
4. Training loop with validation
5. Suggestions for improving if it underfits/overfits`,
    },
    {
      id: 'statistical-test-python',
      title: 'Choose the Right Statistical Test',
      template: `I want to test: {{describe hypothesis}}.

My data:
- Sample size: {{n}}
- Groups: {{number of groups}}
- Data type: {{continuous/categorical/ordinal}}
- Distribution: {{normal/unknown/skewed}}

Show me in Python (scipy/statsmodels/pingouin):
1. Which test to use and why
2. Assumptions to check first
3. Complete runnable code with interpretation
4. Effect size calculation`,
    },
    {
      id: 'python-refactor',
      title: 'Refactor to Pythonic',
      template: `Refactor this code to be more Pythonic:

\`\`\`python
{{paste your code here}}
\`\`\`

Use:
- List/dict comprehensions where appropriate
- Context managers
- F-strings
- Type hints
- Proper exception handling
Explain each change.`,
    },
  ],

  // ── JavaScript/TypeScript ────────────────────────────────────────────
  javascript: [
    {
      id: 'async-pattern',
      title: 'Async Pattern Design',
      template: `I need to {{describe async task}}.
The data comes from: {{API/database/file}}
Error handling needs: {{retry/fallback/abort}}

Show me the implementation using:
1. async/await with proper error handling
2. Promise.all or Promise.allSettled if parallelizable
3. AbortController for cancellation (if applicable)`,
    },
    {
      id: 'react-component',
      title: 'Design a React Component',
      template: `I need a React component for {{describe UI element}}.

Requirements:
- Props: {{list expected props}}
- State: {{describe what state it manages}}
- Events: {{describe user interactions}}

Build it with:
1. TypeScript types for props
2. Proper hooks usage
3. Accessibility attributes
4. Loading/error states
5. A Storybook-ready example`,
    },
  ],

  // ── SQL ──────────────────────────────────────────────────────────────
  sql: [
    {
      id: 'query-optimizer',
      title: 'Optimize My Query',
      template: `This SQL query is slow:

\`\`\`sql
{{paste your query here}}
\`\`\`

Table sizes: {{approximate row counts}}
Current indexes: {{list known indexes}}

Please:
1. Identify performance bottlenecks
2. Rewrite with optimizations
3. Suggest indexes to create
4. Show the EXPLAIN plan I should look for`,
    },
    {
      id: 'schema-design',
      title: 'Design a Schema',
      template: `I need a database schema for {{describe application}}.

Entities: {{list main entities}}
Key relationships: {{describe how they relate}}
Query patterns: {{describe common queries}}

Design the schema with:
1. Tables with appropriate data types
2. Primary and foreign keys
3. Indexes for common queries
4. Normalization notes`,
    },
  ],

  // ── Go ───────────────────────────────────────────────────────────────
  go: [
    {
      id: 'concurrency-design',
      title: 'Design Concurrent Go',
      template: `I need to {{describe concurrent task}}.
Number of workers: {{number or "dynamic"}}
Data flow: {{describe input → processing → output}}

Design the solution using:
1. Goroutines and channels
2. sync.WaitGroup or errgroup
3. Proper context cancellation
4. Graceful shutdown
Show the complete working code.`,
    },
    {
      id: 'go-api',
      title: 'Build a Go API Endpoint',
      template: `I need an HTTP endpoint: {{METHOD}} {{/path}}
Request body: {{describe}}
Response: {{describe}}
Auth: {{none/JWT/API key}}

Build it with:
1. Handler function
2. Input validation
3. Error responses with proper status codes
4. Middleware (if auth needed)
5. Table-driven tests`,
    },
  ],

  // ── Excel ────────────────────────────────────────────────────────────
  excel: [
    {
      id: 'formula-builder',
      title: 'Build a Complex Formula',
      template: `I need an Excel formula that:
{{describe what it should calculate}}

My data layout:
- Column A: {{description}}
- Column B: {{description}}
- Column C: {{description}}

Show me:
1. The formula with explanation of each part
2. A simpler alternative using helper columns
3. Common errors to watch for
4. How to make it dynamic with tables`,
    },
  ],

  // ── Java ───────────────────────────────────────────────────────────
  java: [
    {
      id: 'java-stream-pipeline',
      title: 'Design a Stream Pipeline',
      template: `I have a List<{{type}}> and need to:
1. {{describe filter/transform step 1}}
2. {{describe filter/transform step 2}}
3. Collect into: {{List/Map/Set/single value}}

Write a clean Stream pipeline.
Show both the stream version and the traditional loop version.
Include error handling for null values.`,
    },
    {
      id: 'java-concurrency-pattern',
      title: 'Concurrent Java Pattern',
      template: `I need to {{describe concurrent task}}.
Number of tasks: {{count}}
Shared state: {{yes/no — describe if yes}}
Timeout needed: {{yes/no}}

Design with:
1. ExecutorService or virtual threads
2. CompletableFuture composition if applicable
3. Proper synchronization for shared state
4. Graceful shutdown and error handling`,
    },
  ],

  // ── C++ ────────────────────────────────────────────────────────────
  cpp: [
    {
      id: 'cpp-memory-design',
      title: 'Memory-Safe C++ Design',
      template: `I'm building a {{describe class/module}} that manages {{describe resource}}.

Requirements:
- Ownership: {{unique/shared/borrowed}}
- Lifetime: {{scope-bound/longer-lived/dynamic}}
- Thread safety: {{single-thread/multi-thread}}

Design with:
1. Appropriate smart pointer types
2. RAII for resource management
3. Rule of Five (if needed) or = delete/default
4. Move semantics for efficiency
Explain why each choice is correct.`,
    },
    {
      id: 'cpp-template-design',
      title: 'Design a C++ Template',
      template: `I need a generic {{class/function}} that works with {{describe types}}.

Constraints on T:
- Must support: {{list operations like comparison, hashing, printing}}
- Specializations needed: {{describe any special cases}}

Build with:
1. Template declaration with proper parameters
2. C++20 concepts (or SFINAE fallback)
3. Specialization for edge cases
4. Example usage with 2-3 concrete types`,
    },
  ],

  // ── Rust ───────────────────────────────────────────────────────────
  rust: [
    {
      id: 'rust-ownership-design',
      title: 'Design for Ownership',
      template: `I'm building a {{describe module}} where:
- Data: {{describe the data and who creates it}}
- Consumers: {{describe who reads/modifies it}}
- Lifetime: {{short-lived/long-lived/static}}

Help me design the ownership:
1. Which types should own vs borrow?
2. Where to use &, &mut, clone, Rc, Arc?
3. Lifetime annotations needed?
4. Show the struct definitions and key function signatures.
Explain the borrowing rules at each boundary.`,
    },
    {
      id: 'rust-error-strategy',
      title: 'Rust Error Handling Strategy',
      template: `My application has these error sources:
1. {{error source 1, e.g., file I/O}}
2. {{error source 2, e.g., network}}
3. {{error source 3, e.g., parsing}}

Design the error handling with:
1. Custom error enum with thiserror or manual impl
2. Conversion from standard errors (From trait)
3. Where to use Result<T, E> vs panic!
4. Example of propagation with ? operator
5. User-facing error messages`,
    },
  ],
}

/**
 * Get all templates for a domain, including universal ones.
 */
export function getTemplatesForDomain(domainId) {
  return [
    ...(promptTemplates.universal || []),
    ...(promptTemplates[domainId] || []),
  ]
}

/**
 * Render a prompt template to Obsidian markdown.
 */
export function templateToMarkdown(tpl, domainId) {
  return `---
type: prompt-template
domain: ${domainId}
id: ${tpl.id}
---

# ${tpl.title}

> Copy this prompt and fill in the \`{{placeholders}}\` with your specific details.

\`\`\`
${tpl.template}
\`\`\`

---
*Part of the CodeSheets Premium Vault — [[Prompt Templates Index]]*
`
}
