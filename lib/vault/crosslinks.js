/**
 * crosslinks.js
 * Cross-domain concept mapping for the CodeSheets Obsidian vault.
 *
 * Two layers:
 *   1. Auto-detected links via keyword/concept matching
 *   2. Curated high-value "See Also" links between specific entries
 *
 * Used by the vault generator to inject wikilinks into entry notes.
 */

/* ── CURATED CROSS-REFERENCES ──────────────────────────────────
 * Format: { from: 'domain/entry-id', to: ['domain/entry-id', ...], note: 'why' }
 * These are the premium hand-picked connections.
 */
export const curatedLinks = [

  // ── Data Manipulation ──
  { concept: 'Filtering Data',
    entries: ['python/filter-lambda', 'python/df-filtering', 'sql/where-clause', 'sql/having', 'javascript/arr-filter', 'r/dplyr-filter-select-mutate', 'excel/if-function', 'go/slice-filtering'] },

  { concept: 'Sorting',
    entries: ['python/sorted-builtin', 'python/df-sort-values', 'sql/order-by', 'javascript/arr-sort', 'r/dplyr-arrange-slice-rename', 'excel/sort-function'] },

  { concept: 'Grouping & Aggregation',
    entries: ['python/df-groupby', 'sql/group-by', 'sql/advanced-agg', 'r/dplyr-group-summarise-count', 'javascript/arr-reduce', 'excel/sumifs', 'excel/countifs', 'python/descriptive-stats', 'r/descriptive-stats'] },

  { concept: 'Joining / Merging Data',
    entries: ['python/df-merge', 'sql/inner-join', 'sql/left-join', 'sql/cross-apply', 'r/dplyr-joins', 'excel/vlookup', 'excel/xlookup', 'excel/index-match'] },

  { concept: 'String Manipulation',
    entries: ['python/str-methods', 'sql/string-concat', 'sql/string-extract', 'sql/string-format', 'javascript/template-literals', 'r/stringr-functions', 'excel/text-functions', 'go/strings-package'] },

  { concept: 'Date & Time',
    entries: ['python/datetime-module', 'sql/date-extract', 'sql/date-arithmetic', 'sql/date-series', 'javascript/date-object', 'r/lubridate-functions', 'excel/date-functions'] },

  { concept: 'Map / Transform',
    entries: ['python/map-builtin', 'python/list-comprehension', 'javascript/arr-map', 'r/purrr-map-variants', 'go/slice-mapping'] },

  // ── Variables & Bindings ──
  { concept: 'Variable Declaration & Binding',
    entries: ['rust/let-binding', 'rust/let-mut', 'rust/shadowing', 'javascript/let-const', 'go/var-short-declare', 'java/var-keyword', 'cpp/auto-type-deduction', 'python/type-hints', 'typescript/basic-types'] },

  { concept: 'Immutability & Constants',
    entries: ['rust/let-binding', 'javascript/let-const', 'go/const-iota', 'java/final-keyword', 'cpp/const-constexpr', 'typescript/basic-types'] },

  // ── Control Flow & Patterns ──
  { concept: 'Error Handling',
    entries: ['python/try-except', 'javascript/try-catch', 'typescript/type-guards', 'go/error-handling', 'go/error-wrapping', 'go/custom-errors', 'sql/coalesce', 'nodejs/error-handling', 'java/try-catch-finally', 'java/custom-exceptions', 'cpp/try-catch', 'rust/result-type', 'rust/question-mark-operator'] },

  { concept: 'Async / Concurrency',
    entries: ['python/async-await', 'javascript/async-await', 'javascript/promise-all', 'nodejs/async-patterns', 'go/goroutine', 'go/channels', 'go/waitgroup', 'go/select-statement', 'java/completable-future', 'java/virtual-threads', 'cpp/std-thread', 'cpp/async-future', 'rust/async-fn', 'rust/thread-spawn'] },

  { concept: 'Iteration Patterns',
    entries: ['python/for-loop', 'python/enumerate', 'python/zip-builtin', 'javascript/for-of', 'r/purrr-reduce', 'go/range-loop', 'sql/recursive-cte', 'java/enhanced-for', 'java/stream-foreach', 'rust/iter-adaptors', 'cpp/range-for'] },

  { concept: 'Pattern Matching / Switch',
    entries: ['python/match-statement', 'javascript/switch-case', 'typescript/discriminated-unions', 'go/type-switch', 'sql/case-when', 'java/switch-expressions', 'java/pattern-matching-instanceof', 'rust/match-expressions', 'rust/if-let-while-let'] },

  // ── Functions & Modules ──
  { concept: 'Lambda / Anonymous Functions',
    entries: ['python/lambda', 'javascript/arrow-functions', 'go/anonymous-functions', 'r/anonymous-functions', 'java/lambda-expressions', 'cpp/lambda-basics', 'rust/closures'] },

  { concept: 'Closures',
    entries: ['python/closures', 'javascript/closures', 'go/closures', 'rust/closures', 'cpp/lambda-capture', 'java/lambda-expressions'] },

  { concept: 'Module Systems',
    entries: ['python/import-system', 'javascript/es-modules', 'nodejs/commonjs-modules', 'go/go-modules', 'typescript/module-system', 'java/packages', 'rust/modules', 'cpp/modules'] },

  // ── Data Structures ──
  { concept: 'Hash Maps / Dictionaries',
    entries: ['python/dict-builtin', 'javascript/obj-methods', 'javascript/map-set', 'go/map-type', 'r/named-lists', 'java/hashmap', 'cpp/map', 'cpp/unordered-map', 'rust/hashmap'] },

  { concept: 'Arrays / Lists / Slices',
    entries: ['python/list-methods', 'javascript/arr-basics', 'javascript/arr-destructuring', 'go/slices', 'r/vectors', 'typescript/array-types', 'java/arraylist', 'cpp/vector', 'rust/vec'] },

  { concept: 'Stacks & Queues',
    entries: ['python/stack-queue', 'javascript/arr-push-pop', 'go/slice-stack', 'java/stack-queue', 'cpp/deque', 'rust/vecdeque'] },

  // ── OOP & Types ──
  { concept: 'Classes / Structs',
    entries: ['python/class-basics', 'javascript/class-syntax', 'typescript/interfaces', 'go/struct-definition', 'go/methods', 'r/r6-classes', 'java/classes', 'java/records', 'cpp/constructors-destructors', 'rust/struct-definition'] },

  { concept: 'Interfaces & Protocols',
    entries: ['python/abstract-classes', 'typescript/interface-declaration', 'go/interface-definition', 'java/interface', 'java/abstract-classes', 'rust/trait-definition', 'cpp/virtual-functions'] },

  { concept: 'Type Systems',
    entries: ['typescript/basic-types', 'typescript/generics', 'typescript/type-narrowing', 'python/type-hints', 'go/type-assertions', 'java/generics', 'cpp/class-templates', 'rust/generic-functions', 'rust/trait-bounds'] },

  // ── Testing ──
  { concept: 'Unit Testing',
    entries: ['python/pytest-basics', 'python/pytest-fixtures', 'javascript/jest-basics', 'nodejs/testing-mocha', 'go/table-driven-tests', 'r/testthat'] },

  { concept: 'Mocking',
    entries: ['python/pytest-mocking', 'javascript/jest-mocking', 'nodejs/sinon-stubs', 'go/interface-mocking'] },

  // ── ML & Statistics ──
  { concept: 'Linear Regression',
    entries: ['python/linear-regression', 'python/ridge-regression', 'python/lasso-regression', 'python/simple-linear-regression', 'python/multiple-regression', 'r/lm-function', 'r/simple-linear-regression'] },

  { concept: 'Classification',
    entries: ['python/logistic-regression', 'python/random-forest-classifier', 'python/svm-classifier', 'python/logistic-regression-stats', 'r/glm-function'] },

  { concept: 'Model Evaluation',
    entries: ['python/accuracy-score', 'python/confusion-matrix', 'python/roc-auc', 'python/cross-val-score', 'python/confusion-matrix-metrics', 'python/cross-validation', 'r/cross-validation'] },

  { concept: 'Clustering',
    entries: ['python/kmeans', 'python/dbscan', 'python/pca', 'r/kmeans-hclust'] },

  { concept: 'Neural Networks',
    entries: ['python/nn-module', 'python/training-loop', 'python/cnn-architecture', 'python/transfer-learning'] },

  // ── Data Visualization ──
  { concept: 'Bar Charts',
    entries: ['python/plt-bar', 'python/sns-barplot', 'r/ggplot-geom-bar', 'excel/chart-types'] },

  { concept: 'Scatter Plots',
    entries: ['python/plt-scatter', 'python/sns-scatterplot', 'r/ggplot-geom-point', 'python/correlation', 'r/correlation'] },

  { concept: 'Histograms & Distributions',
    entries: ['python/plt-hist', 'python/sns-histplot', 'r/ggplot-geom-histogram', 'python/normal-distribution', 'r/probability-distributions'] },

  // ── Web & APIs ──
  { concept: 'HTTP Requests',
    entries: ['python/requests-library', 'javascript/fetch-api', 'nodejs/express-routing', 'go/http-client'] },

  { concept: 'REST API Design',
    entries: ['python/fastapi-routes', 'nodejs/express-middleware', 'nextjs/route-handlers', 'go/http-handler'] },

  { concept: 'Authentication',
    entries: ['nodejs/jwt-auth', 'nextjs/auth-patterns', 'nodejs/bcrypt-hashing'] },

  // ── React / Frontend ──
  { concept: 'Component State',
    entries: ['react/usestate', 'react/usereducer', 'react/context-api', 'react/zustand-jotai'] },

  { concept: 'Side Effects',
    entries: ['react/useeffect', 'react/usememo', 'react/usecallback', 'nextjs/server-components'] },

  { concept: 'Routing',
    entries: ['react/react-router', 'nextjs/app-router', 'nextjs/dynamic-routes', 'nextjs/middleware'] },

  // ── Database ──
  { concept: 'CRUD Operations',
    entries: ['sql/select-basics', 'sql/insert-into', 'sql/update-set', 'sql/delete-from', 'nodejs/prisma-orm', 'python/sqlalchemy'] },

  { concept: 'Indexes & Performance',
    entries: ['sql/create-index', 'sql/explain-analyze', 'sql/materialized-views', 'nodejs/query-optimization'] },

  { concept: 'Transactions',
    entries: ['sql/begin-commit', 'sql/savepoints', 'nodejs/database-transactions'] },
]

/* ── INTRA-DOMAIN LINKS ──────────────────────────────────────
 * Hand-curated "deep dive" chains within each domain.
 * Format: { concept: 'label', entries: ['entry-id', ...] }
 * These create "In This Domain" wikilinks so users can walk
 * through related concepts without leaving a language.
 */
export const intraDomainLinks = {

  rust: [
    { concept: 'Variables & Mutability',
      entries: ['let-binding', 'let-mut', 'shadowing', 'type-inference', 'primitives'] },
    { concept: 'Ownership & Borrowing',
      entries: ['ownership-move', 'borrowing-immutable', 'borrowing-mutable', 'lifetimes-basic', 'slice-types', 'borrowing-rules'] },
    { concept: 'Error Handling',
      entries: ['result-type', 'option-type', 'question-mark-operator', 'unwrap-expect', 'unwrap-or-variants', 'custom-errors', 'error-conversion'] },
    { concept: 'Enums & Pattern Matching',
      entries: ['enum-definition', 'match-expression', 'match-patterns', 'if-let-while-let', 'option-type', 'result-type'] },
    { concept: 'Functions & Closures',
      entries: ['function-definition', 'closures', 'fn-traits', 'higher-order-functions'] },
    { concept: 'Traits & Generics',
      entries: ['trait-definition', 'derive-macros', 'display-debug', 'from-into-traits', 'generic-functions', 'trait-bounds', 'where-clause', 'associated-types', 'dyn-trait-vs-impl'] },
    { concept: 'Structs & Types',
      entries: ['struct-definition', 'impl-blocks', 'tuple-structs', 'newtype-pattern', 'builder-pattern', 'type-aliases', 'cow-type'] },
    { concept: 'Collections & Iterators',
      entries: ['vector-vec', 'hashmap', 'hashset', 'btreemap-vecdeque', 'iterator-adaptors', 'enumerate-zip-chain', 'custom-iterator'] },
    { concept: 'Strings',
      entries: ['string-vs-str', 'string-formatting', 'string-parsing', 'osstring-path'] },
    { concept: 'Concurrency',
      entries: ['thread-spawn', 'mpsc-channels', 'arc-mutex', 'rwlock', 'atomics', 'async-fn', 'await-expressions', 'tokio-runtime', 'select-macro'] },
    { concept: 'Unsafe & FFI',
      entries: ['unsafe-block', 'raw-pointers', 'ffi-basics'] },
  ],

  java: [
    { concept: 'Variables & Types',
      entries: ['var-keyword', 'primitives-vs-wrappers', 'string-immutability', 'final-keyword', 'enums'] },
    { concept: 'Control Flow',
      entries: ['if-statement', 'switch-statement', 'for-loop', 'while-loop', 'break-continue'] },
    { concept: 'Methods & Lambdas',
      entries: ['method-definition', 'method-overloading', 'varargs', 'lambda-expressions', 'method-references'] },
    { concept: 'OOP',
      entries: ['class-definition', 'inheritance', 'interfaces', 'abstract-classes', 'records'] },
    { concept: 'Collections',
      entries: ['arraylist', 'hashmap', 'hashset', 'linkedlist', 'treemap'] },
    { concept: 'Exception Handling',
      entries: ['try-catch', 'custom-exceptions', 'multi-catch', 'try-with-resources', 'optional'] },
    { concept: 'Stream Pipeline',
      entries: ['stream-of', 'collection-stream', 'filter', 'map', 'flatmap', 'sorted', 'distinct', 'reduce', 'collect', 'groupingby'] },
    { concept: 'Concurrency',
      entries: ['thread-class', 'runnable-interface', 'callable-future', 'executor-service', 'synchronized-keyword', 'atomic-variables', 'completablefuture-create', 'completablefuture-chain', 'virtual-threads-intro'] },
    { concept: 'Modern Java (17-21)',
      entries: ['records-intro', 'sealed-classes', 'pattern-matching-instanceof', 'switch-expressions', 'text-blocks', 'sequenced-collections'] },
  ],

  cpp: [
    { concept: 'Variables & Types',
      entries: ['auto-type-deduction', 'const-constexpr', 'structured-bindings', 'references', 'type-aliases'] },
    { concept: 'Control Flow',
      entries: ['if-else', 'switch-statement', 'range-for-loop', 'while-loop', 'break-continue'] },
    { concept: 'Functions',
      entries: ['function-basics', 'function-overloading', 'default-parameters', 'function-templates', 'lambda-expressions'] },
    { concept: 'Memory & Pointers',
      entries: ['raw-pointers', 'smart-pointers', 'rvalue-references', 'weak-ptr', 'move-constructors', 'perfect-forwarding', 'raii-pattern'] },
    { concept: 'Strings & I/O',
      entries: ['stdstring', 'stringview', 'cout-cin', 'file-io'] },
    { concept: 'Error Handling',
      entries: ['try-catch', 'stdoptional', 'stdexpected', 'noexcept'] },
    { concept: 'Containers',
      entries: ['vector', 'array', 'deque', 'map', 'unordered-map', 'set', 'unordered-set'] },
    { concept: 'Algorithms & Iterators',
      entries: ['sort-find', 'transform-accumulate', 'remove-erase', 'binary-search', 'iterators', 'stdranges'] },
    { concept: 'OOP',
      entries: ['constructors-destructors', 'virtual-functions', 'inheritance-types', 'multiple-inheritance', 'operator-overloading'] },
    { concept: 'Templates & Generics',
      entries: ['class-templates', 'template-specialization', 'variadic-templates', 'sfinae-concepts', 'concepts'] },
    { concept: 'Lambdas & Functional',
      entries: ['lambda-expressions', 'lambda-captures', 'stdfunction-bind', 'generic-lambdas'] },
    { concept: 'Concurrency',
      entries: ['threads-basic', 'mutex-locks', 'async-future', 'condition-variable'] },
    { concept: 'Design Patterns',
      entries: ['singleton-pattern', 'factory-pattern', 'observer-pattern', 'crtp-pattern'] },
  ],

  javascript: [
    { concept: 'Variables & Types',
      entries: ['let-const', 'typeof', 'type-coercion', 'nullish', 'optional-chaining', 'logical-assignment-ops'] },
    { concept: 'Functions',
      entries: ['arrow-functions', 'default-params', 'rest-params', 'closures', 'hoisting', 'this-keyword'] },
    { concept: 'Arrays',
      entries: ['array-literal', 'array-from', 'map', 'filter', 'reduce', 'find', 'some-every', 'flat-flatmap', 'tosorted', 'object-groupby'] },
    { concept: 'Objects & Prototypes',
      entries: ['object-literal', 'object-assign-spread', 'object-destructuring', 'class-syntax', 'prototype-chain', 'property-descriptors', 'structured-clone'] },
    { concept: 'Async',
      entries: ['promise-basics', 'promise-all', 'promise-allsettled', 'async-await-basics', 'async-error-handling', 'fetch-basics', 'abort-controller', 'event-loop'] },
    { concept: 'Iterators & Generators',
      entries: ['generator-yield', 'symbol', 'for-of', 'async-generators', 'for-await-of'] },
    { concept: 'DOM',
      entries: ['query-selector', 'addeventlistener', 'event-propagation', 'intersection-observer', 'mutation-observer', 'custom-events'] },
    { concept: 'ES6+ Collections',
      entries: ['map', 'set', 'weakmap', 'weakref', 'proxy-advanced'] },
    { concept: 'Patterns',
      entries: ['currying', 'memoization', 'compose-pipe', 'observer-pattern', 'module-pattern', 'strategy-pattern'] },
  ],

  go: [
    { concept: 'Variables & Types',
      entries: ['var-short-declare', 'basic-types', 'const-iota', 'blank-identifier', 'type-assertions', 'pointers-dereferencing', 'make-vs-new'] },
    { concept: 'Control Flow',
      entries: ['if-else', 'for-loop', 'switch', 'defer', 'range-gotchas'] },
    { concept: 'Functions',
      entries: ['functions-multi-return', 'init-functions'] },
    { concept: 'Structs & Interfaces',
      entries: ['struct-basics', 'struct-tags', 'methods', 'interface-implicit', 'embedding', 'constructor-new', 'functional-options'] },
    { concept: 'Slices & Maps',
      entries: ['slices', 'maps', 'range-gotchas'] },
    { concept: 'Error Handling',
      entries: ['error-interface', 'custom-errors', 'error-wrapping-best-practices', 'sentinel-errors-vs-typed', 'error-handling-patterns', 'panic-recover'] },
    { concept: 'Concurrency',
      entries: ['goroutines', 'channel-basics', 'select', 'mutex', 'sync-once', 'errgroup', 'worker-pool', 'context-cancel', 'sync-waitgroup'] },
    { concept: 'Testing',
      entries: ['go-testing', 'benchmarks', 'table-driven-advanced', 'fuzzing', 'golden-files', 'test-helpers-testify', 'httptest'] },
    { concept: 'Patterns',
      entries: ['builder-pattern', 'dependency-injection', 'middleware', 'interface-segregation', 'repository-pattern'] },
  ],

  python: [
    { concept: 'Core Functions & Types',
      entries: ['print', 'input', 'isinstance', 'type-hints', 'str-methods', 'f-strings', 'pathlib'] },
    { concept: 'Iteration & Comprehensions',
      entries: ['for-loop', 'list-comprehension', 'dict-comprehension', 'enumerate', 'zip-builtin', 'map-builtin', 'filter-lambda', 'generators'] },
    { concept: 'Functions & OOP',
      entries: ['def', 'lambda', 'decorators', 'closures', 'class-def', 'inheritance', 'property', 'dataclass', 'abc'] },
    { concept: 'Data Structures',
      entries: ['list-methods', 'dict-builtin', 'set-operations', 'stack', 'queue', 'heap', 'collections-module'] },
    { concept: 'Error Handling',
      entries: ['try-except', 'context-managers', 'custom-exceptions'] },
    { concept: 'Pandas Pipeline',
      entries: ['dataframe-constructor', 'read-csv', 'loc', 'iloc', 'df-filtering', 'df-sort-values', 'groupby', 'merge', 'pivot-table', 'apply-lambda', 'assign', 'rolling'] },
    { concept: 'NumPy Core',
      entries: ['np-array', 'np-zeros', 'array-slicing', 'boolean-masking', 'broadcasting', 'aggregations', 'np-linalg'] },
    { concept: 'ML Pipeline',
      entries: ['train-test-split', 'standard-scaler', 'logistic-regression', 'random-forest-classifier', 'accuracy-score', 'cross-val-score', 'grid-search-cv'] },
    { concept: 'Deep Learning',
      entries: ['tensor-creation', 'autograd-backward', 'nn-module', 'nn-linear', 'training-loop-pattern', 'dataloader', 'transfer-learning'] },
  ],

  typescript: [
    { concept: 'Types & Narrowing',
      entries: ['basic-types', 'readonly-arrays', 'typeof-narrowing', 'assertion-functions', 'custom-type-predicates'] },
    { concept: 'Interfaces & Aliases',
      entries: ['interface-basics', 'interface-extends', 'declaration-merging', 'type-alias', 'hybrid-types', 'index-signatures-deep'] },
    { concept: 'Generics',
      entries: ['generic-functions', 'generic-constraints-keyof', 'mapped-types-utility', 'conditional-types-distribution'] },
    { concept: 'Advanced Types',
      entries: ['mapped-types', 'deep-readonly-utility', 'utility-types-advanced', 'module-augmentation'] },
    { concept: 'Patterns',
      entries: ['builder-pattern-typed', 'factory-pattern', 'repository-pattern-typed', 'dependency-injection-typed', 'state-machine-typed'] },
  ],
}

/* ── AUTO-DETECTION KEYWORDS ──────────────────────────────────
 * Maps concept keywords to tags. When an entry's fn, desc, or category
 * contains these keywords, it gets tagged for auto-linking.
 */
export const conceptKeywords = {
  'filtering':    ['filter', 'where', 'subset', 'query', 'select rows'],
  'sorting':      ['sort', 'order', 'arrange', 'rank'],
  'grouping':     ['group', 'aggregate', 'summarize', 'reduce', 'fold'],
  'joining':      ['join', 'merge', 'combine', 'lookup', 'vlookup', 'xlookup'],
  'mapping':      ['map', 'transform', 'apply', 'comprehension', 'for each'],
  'async':        ['async', 'await', 'promise', 'concurrent', 'goroutine', 'channel', 'future'],
  'error':        ['error', 'exception', 'try', 'catch', 'handle', 'panic', 'recover'],
  'testing':      ['test', 'assert', 'expect', 'mock', 'fixture', 'spec'],
  'types':        ['type', 'interface', 'generic', 'struct', 'class', 'schema'],
  'iteration':    ['loop', 'iterate', 'for', 'while', 'range', 'each', 'walk'],
  'string':       ['string', 'text', 'regex', 'pattern', 'format', 'parse'],
  'date':         ['date', 'time', 'datetime', 'timestamp', 'interval', 'duration'],
  'visualization':['plot', 'chart', 'graph', 'histogram', 'scatter', 'bar', 'line', 'heatmap'],
  'ml':           ['model', 'train', 'predict', 'classifier', 'regression', 'neural', 'network'],
  'http':         ['http', 'request', 'response', 'api', 'endpoint', 'route', 'fetch', 'rest'],
  'state':        ['state', 'store', 'context', 'reducer', 'hook'],
  'auth':         ['auth', 'login', 'token', 'jwt', 'session', 'password', 'bcrypt'],
}

/**
 * Given an entry, return matching concept tags based on keyword scanning.
 */
export function autoDetectConcepts(entry) {
  const searchText = [entry.fn, entry.desc, entry.category, entry.subtitle]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const matched = []
  for (const [concept, keywords] of Object.entries(conceptKeywords)) {
    if (keywords.some(kw => searchText.includes(kw))) {
      matched.push(concept)
    }
  }
  return matched
}

/**
 * Given an entry id (e.g. 'python/df-merge'), find all curated cross-links.
 * Returns array of { concept, entries } where entries excludes the source.
 */
export function getCuratedLinks(entryPath) {
  const results = []
  for (const link of curatedLinks) {
    if (link.entries.includes(entryPath)) {
      results.push({
        concept: link.concept,
        entries: link.entries.filter(e => e !== entryPath),
      })
    }
  }
  return results
}

/**
 * Given domain + entry id (e.g. 'rust', 'let-mut'), find intra-domain deep-dive chains.
 * Returns array of { concept, entries } where entries are sibling entry-ids
 * within the same domain (excluding the source entry).
 */
export function getIntraDomainLinks(domainId, entryId) {
  const domainChains = intraDomainLinks[domainId]
  if (!domainChains) return []

  const results = []
  for (const chain of domainChains) {
    if (chain.entries.includes(entryId)) {
      results.push({
        concept: chain.concept,
        entries: chain.entries.filter(e => e !== entryId),
      })
    }
  }
  return results
}
