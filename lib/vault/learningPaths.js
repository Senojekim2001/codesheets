/**
 * learningPaths.js
 * Guided learning sequences for each domain.
 * Each path is a series of entry references in recommended order.
 */

export const learningPaths = {

  python: [
    {
      id: 'python-fundamentals',
      title: 'Python Fundamentals',
      level: 'beginner',
      description: 'Core Python from zero to confident. Variables, control flow, functions, data types, then standard library essentials.',
      steps: [
        { entry: 'python/variables-assignment', note: 'Start here — how Python stores values' },
        { entry: 'python/print-builtin', note: 'Output and debugging basics' },
        { entry: 'python/type-builtin', note: 'Understanding Python types' },
        { entry: 'python/if-elif-else', note: 'Branching logic' },
        { entry: 'python/for-loop', note: 'Iteration fundamentals' },
        { entry: 'python/list-methods', note: 'The most-used data structure' },
        { entry: 'python/dict-builtin', note: 'Key-value storage' },
        { entry: 'python/def-functions', note: 'Writing reusable code' },
        { entry: 'python/lambda', note: 'Anonymous functions' },
        { entry: 'python/list-comprehension', note: 'Pythonic transformations' },
        { entry: 'python/str-methods', note: 'String manipulation' },
        { entry: 'python/file-io', note: 'Reading and writing files' },
      ]
    },
    {
      id: 'python-data-science',
      title: 'Data Science Pipeline',
      level: 'intermediate',
      description: 'From raw data to insights. Pandas, NumPy, visualization, then machine learning.',
      steps: [
        { entry: 'python/df-read-csv', note: 'Loading data into Pandas' },
        { entry: 'python/df-info-describe', note: 'First look at your data' },
        { entry: 'python/df-filtering', note: 'Selecting the rows you need' },
        { entry: 'python/df-groupby', note: 'Aggregation and summaries' },
        { entry: 'python/df-merge', note: 'Combining datasets' },
        { entry: 'python/np-array-creation', note: 'NumPy foundations' },
        { entry: 'python/np-vectorized-ops', note: 'Fast math without loops' },
        { entry: 'python/plt-subplots', note: 'Creating figures' },
        { entry: 'python/sns-histplot', note: 'Distribution visualization' },
        { entry: 'python/sns-scatterplot', note: 'Relationship visualization' },
        { entry: 'python/train-test-split', note: 'Preparing data for ML' },
        { entry: 'python/standard-scaler', note: 'Feature scaling' },
        { entry: 'python/random-forest-classifier', note: 'Your first ML model' },
        { entry: 'python/cross-val-score', note: 'Evaluating properly' },
      ]
    },
    {
      id: 'python-ml-mastery',
      title: 'Machine Learning Mastery',
      level: 'advanced',
      description: 'Deep dive into scikit-learn and PyTorch. Model selection, tuning, deep learning.',
      steps: [
        { entry: 'python/sklearn-pipeline', note: 'Production ML pipelines' },
        { entry: 'python/column-transformer', note: 'Mixed feature preprocessing' },
        { entry: 'python/grid-search-cv', note: 'Systematic hyperparameter tuning' },
        { entry: 'python/classification-report', note: 'Beyond accuracy' },
        { entry: 'python/roc-auc', note: 'Model comparison metric' },
        { entry: 'python/feature-importances', note: 'Understanding your model' },
        { entry: 'python/pca', note: 'Dimensionality reduction' },
        { entry: 'python/torch-tensor', note: 'PyTorch foundation' },
        { entry: 'python/nn-module', note: 'Building neural networks' },
        { entry: 'python/training-loop', note: 'The training pattern' },
        { entry: 'python/cnn-architecture', note: 'Vision models' },
        { entry: 'python/transfer-learning', note: 'Standing on shoulders' },
      ]
    },
  ],

  javascript: [
    {
      id: 'js-fundamentals',
      title: 'JavaScript Fundamentals',
      level: 'beginner',
      description: 'Core JavaScript from variables through async. Everything you need before frameworks.',
      steps: [
        { entry: 'javascript/let-const', note: 'Variable declarations' },
        { entry: 'javascript/arrow-functions', note: 'Modern function syntax' },
        { entry: 'javascript/template-literals', note: 'String interpolation' },
        { entry: 'javascript/destructuring', note: 'Unpacking values' },
        { entry: 'javascript/spread-rest', note: 'Spread and rest operators' },
        { entry: 'javascript/arr-map', note: 'Transforming arrays' },
        { entry: 'javascript/arr-filter', note: 'Filtering arrays' },
        { entry: 'javascript/arr-reduce', note: 'Reducing to a value' },
        { entry: 'javascript/promises', note: 'Async foundations' },
        { entry: 'javascript/async-await', note: 'Modern async syntax' },
        { entry: 'javascript/es-modules', note: 'Import/export' },
      ]
    },
    {
      id: 'js-fullstack',
      title: 'Full-Stack JavaScript',
      level: 'intermediate',
      description: 'From React components through Next.js to Node.js APIs.',
      steps: [
        { entry: 'react/usestate', note: 'Component state' },
        { entry: 'react/useeffect', note: 'Side effects' },
        { entry: 'react/component-composition', note: 'Building UIs' },
        { entry: 'react/react-router', note: 'Client routing' },
        { entry: 'nextjs/app-router', note: 'File-based routing' },
        { entry: 'nextjs/server-components', note: 'Server vs client' },
        { entry: 'nextjs/route-handlers', note: 'API endpoints' },
        { entry: 'nodejs/express-routing', note: 'Express basics' },
        { entry: 'nodejs/middleware-pattern', note: 'Request pipeline' },
        { entry: 'nodejs/prisma-orm', note: 'Database access' },
        { entry: 'nodejs/jwt-auth', note: 'Authentication' },
      ]
    },
  ],

  sql: [
    {
      id: 'sql-fundamentals',
      title: 'SQL from Zero to Proficient',
      level: 'beginner',
      description: 'Queries, filtering, joins, aggregation, then window functions and CTEs.',
      steps: [
        { entry: 'sql/select-basics', note: 'Your first query' },
        { entry: 'sql/where-clause', note: 'Filtering rows' },
        { entry: 'sql/order-by', note: 'Sorting results' },
        { entry: 'sql/group-by', note: 'Aggregation' },
        { entry: 'sql/having', note: 'Filtering groups' },
        { entry: 'sql/inner-join', note: 'Combining tables' },
        { entry: 'sql/left-join', note: 'Keeping all rows' },
        { entry: 'sql/subquery-basics', note: 'Queries inside queries' },
        { entry: 'sql/common-table-expression', note: 'CTEs for readability' },
        { entry: 'sql/row-number', note: 'Window functions intro' },
        { entry: 'sql/rank-dense-rank', note: 'Ranking patterns' },
        { entry: 'sql/lag-lead', note: 'Comparing adjacent rows' },
      ]
    },
  ],

  go: [
    {
      id: 'go-fundamentals',
      title: 'Go from Zero to Production',
      level: 'beginner',
      description: 'Variables, functions, structs, interfaces, error handling, then goroutines.',
      steps: [
        { entry: 'go/variables', note: 'Declaration and short syntax' },
        { entry: 'go/functions', note: 'Multiple returns' },
        { entry: 'go/slices', note: 'Dynamic arrays' },
        { entry: 'go/map-type', note: 'Hash maps' },
        { entry: 'go/struct-definition', note: 'Custom types' },
        { entry: 'go/methods', note: 'Receiver functions' },
        { entry: 'go/interface-definition', note: 'Implicit interfaces' },
        { entry: 'go/error-handling', note: 'The Go way' },
        { entry: 'go/goroutine', note: 'Lightweight concurrency' },
        { entry: 'go/channels', note: 'Communication between goroutines' },
        { entry: 'go/select-statement', note: 'Multiplexing channels' },
        { entry: 'go/table-driven-tests', note: 'Testing idioms' },
      ]
    },
  ],

  typescript: [
    {
      id: 'ts-fundamentals',
      title: 'TypeScript Type System',
      level: 'beginner',
      description: 'From basic annotations through generics to advanced mapped types.',
      steps: [
        { entry: 'typescript/basic-types', note: 'Primitives and annotations' },
        { entry: 'typescript/interface-declaration', note: 'Object shapes' },
        { entry: 'typescript/type-aliases', note: 'Custom types' },
        { entry: 'typescript/union-types', note: 'Multiple possibilities' },
        { entry: 'typescript/type-narrowing', note: 'Refining types' },
        { entry: 'typescript/generic-functions', note: 'Parameterized types' },
        { entry: 'typescript/generic-constraints', note: 'Bounded generics' },
        { entry: 'typescript/mapped-types', note: 'Type transformations' },
        { entry: 'typescript/conditional-types', note: 'Type-level logic' },
        { entry: 'typescript/utility-partial', note: 'Built-in helpers' },
      ]
    },
  ],

  stats: [
    {
      id: 'stats-python',
      title: 'Statistics in Python',
      level: 'beginner',
      description: 'Descriptive stats, distributions, hypothesis testing, and regression — all in runnable Python.',
      steps: [
        { entry: 'python/descriptive-stats', note: 'Mean, median, mode, spread' },
        { entry: 'python/normal-distribution', note: 'The bell curve with scipy' },
        { entry: 'python/probability-distributions', note: 'Common distributions' },
        { entry: 'python/confidence-intervals', note: 'Estimation ranges' },
        { entry: 'python/hypothesis-testing', note: 'Making decisions from data' },
        { entry: 'python/t-test', note: 'Comparing means' },
        { entry: 'python/correlation', note: 'Measuring relationships' },
        { entry: 'python/simple-linear-regression', note: 'Predicting outcomes' },
        { entry: 'python/multiple-regression', note: 'Multi-variable models' },
        { entry: 'python/cross-validation', note: 'Model validation' },
      ]
    },
    {
      id: 'stats-r',
      title: 'Statistics in R',
      level: 'beginner',
      description: 'Descriptive stats, distributions, hypothesis testing, and regression in idiomatic R.',
      steps: [
        { entry: 'r/descriptive-stats', note: 'summary(), mean, sd' },
        { entry: 'r/probability-distributions', note: 'dnorm, pnorm, qnorm, rnorm' },
        { entry: 'r/hypothesis-testing', note: 't.test, chisq.test, wilcox.test' },
        { entry: 'r/correlation', note: 'cor(), cor.test()' },
        { entry: 'r/simple-linear-regression', note: 'lm() basics' },
        { entry: 'r/lm-function', note: 'Full linear model workflow' },
        { entry: 'r/glm-function', note: 'Logistic and Poisson regression' },
        { entry: 'r/cross-validation', note: 'caret and rsample' },
      ]
    },
  ],

  react: [
    {
      id: 'react-fundamentals',
      title: 'React from Zero to Confident',
      level: 'beginner',
      description: 'Components, hooks, state, effects, routing, and patterns.',
      steps: [
        { entry: 'react/jsx-basics', note: 'JSX syntax and expressions' },
        { entry: 'react/component-props', note: 'Passing data down' },
        { entry: 'react/usestate', note: 'Managing component state' },
        { entry: 'react/useeffect', note: 'Side effects and lifecycle' },
        { entry: 'react/event-handling', note: 'Responding to user actions' },
        { entry: 'react/conditional-rendering', note: 'Showing/hiding UI' },
        { entry: 'react/list-rendering', note: 'Rendering arrays' },
        { entry: 'react/component-composition', note: 'Building UIs from pieces' },
        { entry: 'react/useref', note: 'DOM access and persistence' },
        { entry: 'react/react-router', note: 'Client-side navigation' },
      ]
    },
  ],

  nextjs: [
    {
      id: 'nextjs-fullstack',
      title: 'Next.js Full-Stack App',
      level: 'intermediate',
      description: 'App Router, server components, data fetching, route handlers, and deployment.',
      steps: [
        { entry: 'nextjs/app-router', note: 'File-based routing system' },
        { entry: 'nextjs/server-components', note: 'Server vs client components' },
        { entry: 'nextjs/dynamic-routes', note: 'Parameterized pages' },
        { entry: 'nextjs/loading-ui', note: 'Streaming and suspense' },
        { entry: 'nextjs/server-actions', note: 'Mutating data from forms' },
        { entry: 'nextjs/route-handlers', note: 'Building API endpoints' },
        { entry: 'nextjs/middleware', note: 'Request interception' },
        { entry: 'nextjs/auth-patterns', note: 'Authentication strategies' },
        { entry: 'nextjs/metadata-api', note: 'SEO and social sharing' },
      ]
    },
  ],

  nodejs: [
    {
      id: 'nodejs-backend',
      title: 'Node.js Backend Development',
      level: 'intermediate',
      description: 'Core modules, Express APIs, async patterns, databases, and testing.',
      steps: [
        { entry: 'nodejs/fs-module', note: 'File system operations' },
        { entry: 'nodejs/path-module', note: 'Cross-platform paths' },
        { entry: 'nodejs/express-routing', note: 'HTTP routing basics' },
        { entry: 'nodejs/middleware-pattern', note: 'Request pipeline' },
        { entry: 'nodejs/error-handling', note: 'Express error middleware' },
        { entry: 'nodejs/async-patterns', note: 'Promises and async/await' },
        { entry: 'nodejs/streams-readable', note: 'Streaming data' },
        { entry: 'nodejs/prisma-orm', note: 'Database access' },
        { entry: 'nodejs/jwt-auth', note: 'Token authentication' },
        { entry: 'nodejs/testing-mocha', note: 'Writing tests' },
      ]
    },
  ],

  r: [
    {
      id: 'r-data-analysis',
      title: 'R for Data Analysis',
      level: 'beginner',
      description: 'Tidyverse workflow from data import to visualization and modeling.',
      steps: [
        { entry: 'r/vector-types', note: 'R data types' },
        { entry: 'r/data-frame-basics', note: 'Tabular data' },
        { entry: 'r/pipe-operator', note: 'The %>% workflow' },
        { entry: 'r/dplyr-filter-select-mutate', note: 'Core data verbs' },
        { entry: 'r/dplyr-group-summarise-count', note: 'Aggregation' },
        { entry: 'r/dplyr-joins', note: 'Combining data' },
        { entry: 'r/tidyr-pivot', note: 'Reshaping data' },
        { entry: 'r/ggplot-geom-point', note: 'Scatter plots' },
        { entry: 'r/ggplot-geom-bar', note: 'Bar charts' },
        { entry: 'r/lm-function', note: 'Linear regression' },
      ]
    },
  ],

  excel: [
    {
      id: 'excel-power-user',
      title: 'Excel Power User',
      level: 'beginner',
      description: 'From basic formulas through lookups, pivot tables, and data analysis.',
      steps: [
        { entry: 'excel/sum-average', note: 'Basic aggregation' },
        { entry: 'excel/if-function', note: 'Conditional logic' },
        { entry: 'excel/countifs', note: 'Conditional counting' },
        { entry: 'excel/sumifs', note: 'Conditional summing' },
        { entry: 'excel/vlookup', note: 'Classic lookup' },
        { entry: 'excel/xlookup', note: 'Modern lookup' },
        { entry: 'excel/index-match', note: 'Flexible lookup' },
        { entry: 'excel/text-functions', note: 'String manipulation' },
        { entry: 'excel/date-functions', note: 'Date calculations' },
        { entry: 'excel/pivot-tables', note: 'Interactive analysis' },
      ]
    },
  ],

  java: [
    {
      id: 'java-fundamentals',
      title: 'Java from Zero to Production',
      level: 'beginner',
      description: 'Core Java: types, control flow, OOP, collections, and exception handling.',
      steps: [
        { entry: 'java/variables-types', note: 'Primitives and declarations' },
        { entry: 'java/operators', note: 'Arithmetic, logical, bitwise' },
        { entry: 'java/if-else-switch', note: 'Branching logic' },
        { entry: 'java/for-while-loops', note: 'Iteration fundamentals' },
        { entry: 'java/methods', note: 'Defining reusable code' },
        { entry: 'java/classes', note: 'OOP building blocks' },
        { entry: 'java/constructors', note: 'Object initialization' },
        { entry: 'java/inheritance', note: 'Extending classes' },
        { entry: 'java/interfaces', note: 'Contracts and abstraction' },
        { entry: 'java/arraylist', note: 'Dynamic arrays' },
        { entry: 'java/hashmap', note: 'Key-value storage' },
        { entry: 'java/try-catch-finally', note: 'Exception handling basics' },
        { entry: 'java/custom-exceptions', note: 'Domain-specific errors' },
      ]
    },
    {
      id: 'java-streams-functional',
      title: 'Java Streams & Functional Style',
      level: 'intermediate',
      description: 'Lambda expressions, Stream API, collectors, and functional patterns.',
      steps: [
        { entry: 'java/lambda-expressions', note: 'Anonymous functions' },
        { entry: 'java/functional-interfaces', note: 'Predicate, Function, Consumer' },
        { entry: 'java/method-references', note: 'Shorthand lambdas' },
        { entry: 'java/stream-creation', note: 'Building streams' },
        { entry: 'java/stream-filter', note: 'Filtering elements' },
        { entry: 'java/stream-map', note: 'Transforming elements' },
        { entry: 'java/stream-flatmap', note: 'Flattening nested data' },
        { entry: 'java/stream-reduce', note: 'Accumulating values' },
        { entry: 'java/collectors-tolist', note: 'Collecting results' },
        { entry: 'java/collectors-groupingby', note: 'Grouping and partitioning' },
        { entry: 'java/optional', note: 'Null-safe containers' },
      ]
    },
    {
      id: 'java-concurrency',
      title: 'Java Concurrency & Modern Features',
      level: 'advanced',
      description: 'Threads, executors, CompletableFuture, virtual threads, and Java 17-21 features.',
      steps: [
        { entry: 'java/thread-basics', note: 'Creating threads' },
        { entry: 'java/runnable-callable', note: 'Task abstractions' },
        { entry: 'java/executor-service', note: 'Thread pool management' },
        { entry: 'java/synchronized-locks', note: 'Shared state safety' },
        { entry: 'java/completable-future', note: 'Async composition' },
        { entry: 'java/virtual-threads', note: 'Lightweight concurrency (Java 21)' },
        { entry: 'java/records', note: 'Immutable data carriers' },
        { entry: 'java/sealed-classes', note: 'Restricted hierarchies' },
        { entry: 'java/switch-expressions', note: 'Pattern-based branching' },
        { entry: 'java/pattern-matching-instanceof', note: 'Type-safe casting' },
        { entry: 'java/text-blocks', note: 'Multi-line strings' },
      ]
    },
  ],

  cpp: [
    {
      id: 'cpp-fundamentals',
      title: 'Modern C++ Fundamentals',
      level: 'beginner',
      description: 'Variables, control flow, functions, pointers, references, and the STL.',
      steps: [
        { entry: 'cpp/variables-types', note: 'Type system and declarations' },
        { entry: 'cpp/auto-keyword', note: 'Type deduction' },
        { entry: 'cpp/if-else-switch', note: 'Control flow' },
        { entry: 'cpp/range-for', note: 'Modern iteration' },
        { entry: 'cpp/functions-overloading', note: 'Function basics' },
        { entry: 'cpp/references', note: 'Aliases and pass-by-reference' },
        { entry: 'cpp/pointers', note: 'Memory addresses' },
        { entry: 'cpp/smart-pointers', note: 'RAII memory management' },
        { entry: 'cpp/vector', note: 'Dynamic arrays' },
        { entry: 'cpp/map', note: 'Sorted key-value store' },
        { entry: 'cpp/unordered-map', note: 'Hash map' },
        { entry: 'cpp/string-type', note: 'std::string operations' },
        { entry: 'cpp/try-catch', note: 'Exception handling' },
      ]
    },
    {
      id: 'cpp-oop-templates',
      title: 'C++ OOP & Templates',
      level: 'intermediate',
      description: 'Classes, inheritance, polymorphism, templates, and design patterns.',
      steps: [
        { entry: 'cpp/constructors-destructors', note: 'Object lifecycle' },
        { entry: 'cpp/rule-of-five', note: 'Special member functions' },
        { entry: 'cpp/inheritance-basics', note: 'Class hierarchies' },
        { entry: 'cpp/virtual-functions', note: 'Runtime polymorphism' },
        { entry: 'cpp/abstract-classes', note: 'Interfaces in C++' },
        { entry: 'cpp/operator-overloading', note: 'Custom operators' },
        { entry: 'cpp/function-templates', note: 'Generic functions' },
        { entry: 'cpp/class-templates', note: 'Generic classes' },
        { entry: 'cpp/lambda-basics', note: 'Anonymous functions' },
        { entry: 'cpp/lambda-capture', note: 'Capturing variables' },
        { entry: 'cpp/move-semantics', note: 'Efficient transfers' },
        { entry: 'cpp/rvalue-references', note: 'Move and forward' },
      ]
    },
    {
      id: 'cpp-modern-concurrency',
      title: 'Modern C++ & Concurrency',
      level: 'advanced',
      description: 'C++20/23 features, threads, async, and advanced STL patterns.',
      steps: [
        { entry: 'cpp/std-thread', note: 'Thread creation' },
        { entry: 'cpp/mutex-lock-guard', note: 'Synchronization' },
        { entry: 'cpp/async-future', note: 'Async task execution' },
        { entry: 'cpp/condition-variable', note: 'Thread signaling' },
        { entry: 'cpp/concepts', note: 'Constrained generics (C++20)' },
        { entry: 'cpp/ranges', note: 'Range-based algorithms (C++20)' },
        { entry: 'cpp/structured-bindings', note: 'Destructuring' },
        { entry: 'cpp/std-optional', note: 'Nullable values' },
        { entry: 'cpp/std-variant', note: 'Type-safe unions' },
        { entry: 'cpp/coroutines', note: 'Cooperative multitasking (C++20)' },
      ]
    },
  ],

  rust: [
    {
      id: 'rust-fundamentals',
      title: 'Rust Ownership & Safety',
      level: 'beginner',
      description: 'Variables, ownership, borrowing, structs, enums, pattern matching, and error handling.',
      steps: [
        { entry: 'rust/variables-mutability', note: 'Let bindings and mut' },
        { entry: 'rust/scalar-types', note: 'Integers, floats, booleans, chars' },
        { entry: 'rust/ownership-basics', note: 'The ownership model' },
        { entry: 'rust/borrowing-references', note: 'Shared and mutable borrows' },
        { entry: 'rust/slice-type', note: 'Borrowed views of data' },
        { entry: 'rust/if-else', note: 'Control flow' },
        { entry: 'rust/loop-while-for', note: 'Iteration' },
        { entry: 'rust/functions', note: 'Parameters and return types' },
        { entry: 'rust/struct-definition', note: 'Custom data types' },
        { entry: 'rust/enum-definition', note: 'Tagged unions' },
        { entry: 'rust/match-expressions', note: 'Pattern matching' },
        { entry: 'rust/result-type', note: 'Recoverable errors' },
        { entry: 'rust/question-mark-operator', note: 'Error propagation' },
      ]
    },
    {
      id: 'rust-traits-generics',
      title: 'Rust Traits & Generics',
      level: 'intermediate',
      description: 'Traits, generics, lifetimes, collections, and iterator patterns.',
      steps: [
        { entry: 'rust/trait-definition', note: 'Shared behavior' },
        { entry: 'rust/trait-implementations', note: 'Implementing traits' },
        { entry: 'rust/derive-macros', note: 'Auto-derived traits' },
        { entry: 'rust/generic-functions', note: 'Parameterized types' },
        { entry: 'rust/trait-bounds', note: 'Constraining generics' },
        { entry: 'rust/lifetime-annotations', note: 'Borrow validity' },
        { entry: 'rust/vec', note: 'Dynamic arrays' },
        { entry: 'rust/hashmap', note: 'Key-value storage' },
        { entry: 'rust/iter-adaptors', note: 'map, filter, fold' },
        { entry: 'rust/closures', note: 'Anonymous functions' },
        { entry: 'rust/string-vs-str', note: 'Owned vs borrowed strings' },
      ]
    },
    {
      id: 'rust-async-advanced',
      title: 'Async Rust & Concurrency',
      level: 'advanced',
      description: 'Threads, channels, shared state, async/await, and unsafe.',
      steps: [
        { entry: 'rust/thread-spawn', note: 'OS threads' },
        { entry: 'rust/message-passing', note: 'Channel communication' },
        { entry: 'rust/arc-mutex', note: 'Shared state concurrency' },
        { entry: 'rust/async-fn', note: 'Async function syntax' },
        { entry: 'rust/tokio-runtime', note: 'Async runtime' },
        { entry: 'rust/tokio-spawn', note: 'Spawning async tasks' },
        { entry: 'rust/select-macro', note: 'Racing futures' },
        { entry: 'rust/pin-unpin', note: 'Self-referential futures' },
        { entry: 'rust/unsafe-basics', note: 'When safe Rust isn\'t enough' },
        { entry: 'rust/ffi-basics', note: 'Calling C from Rust' },
      ]
    },
  ],
}
