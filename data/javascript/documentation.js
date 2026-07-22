export const meta = {
  "title": "Documentation",
  "domain": "javascript",
  "sheet": "documentation",
  "icon": "📖"
}

export const sections = [

  // ── Section 1: JSDoc — inline documentation, type annotations ─────────────────────────────────────────
  {
    id: "jsdoc",
    title: "JSDoc — inline documentation, type annotations",
    entries: [
      {
        id: "jsdoc-basics",
        fn: "JSDoc — annotate functions, types, modules",
        desc: "JSDoc is the standard inline documentation format for JavaScript. Provides type annotations, parameter descriptions, and IDE hover tooltips. Enables type-checking in TypeScript via // @ts-check.",
        category: "JSDoc",
        subtitle: "@param, @returns, @typedef, @callback, @template, @ts-check, @see, @example",
        signature: "/** @param {string} name - The user name */\nfunction greet(name) { ... }",
        descLong: "JSDoc comments start with /** and end with */. Key tags: @param (typed parameter), @returns (return type), @typedef (custom type), @callback (function type), @template (generics), @property (object property), @see (cross-reference), @example (code sample). Use // @ts-check at the top of a file to enable TypeScript type-checking on plain JS. IDEs (VS Code, WebStorm) parse JSDoc for hover tooltips, autocomplete, and inline type errors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Document a function with JSDoc for IDE tooltips.\n// APPROACH  - /** @param @returns */ above the function.\n// STRENGTHS - IDE hover tooltips; type info without TypeScript.\n// WEAKNESSES- Verbose; no compile-time enforcement without @ts-check.\n//\n/**\n * Greet a user by name.\n * @param {string} name - The user's name.\n * @param {Object} [options] - Greeting options.\n * @param {boolean} [options.formal=false] - Use formal greeting.\n * @returns {string} The greeting message.\n */\nfunction greet(name, options = {}) {\n  const { formal = false } = options;\n  return formal ? `Dear ${name}` : `Hi ${name}!`;\n}\n\n// IDE shows: greet(name: string, options?: { formal?: boolean }): string"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Define custom types, generics, callbacks, and enable\n//             type-checking with @ts-check.\n// APPROACH  - @typedef for reusable types; @template for generics;\n//             @callback for function signatures; // @ts-check for\n//             compile-time validation.\n// STRENGTHS - Full type system in plain JS; catches errors in CI.\n// WEAKNESSES- Complex types are verbose; no .d.ts generation without TypeDoc.\n//\n// @ts-check\n\n/** @typedef {{ id: number, name: string, email: string }} User */\n/** @typedef {{ status: 'active' | 'inactive', role: 'admin' | 'member' }} UserMeta */\n\n/**\n * @template T\n * @typedef {Object} Result\n * @property {boolean} ok\n * @property {T} [data]\n * @property {string} [error]\n */\n\n/**\n * @callback AsyncMapper\n * @param {User} user\n * @returns {Promise<User>}\n */\n\n/**\n * Fetch users and apply a mapper function.\n * @param {number} limit - Max users to fetch.\n * @param {AsyncMapper} mapper - Transform function.\n * @returns {Promise<Result<User[]>>}\n */\nasync function fetchUsers(limit, mapper) {\n  const users = await api.get('/users', { limit });\n  const mapped = await Promise.all(users.map(mapper));\n  return { ok: true, data: mapped };\n}\n\n/**\n * @see {fetchUsers}\n * @example\n * const result = await fetchUsers(10, async (u) => ({\n *   ...u, name: u.name.toUpperCase()\n * }));\n */\nfunction exampleUsage() {}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Full module documentation with @module, @fires, @listens,\n//             @deprecated, @internal, and JSDoc config for TypeDoc output.\n// APPROACH  - @module for namespace; @fires/@listens for events;\n//             @deprecated with migration guide; @internal for private API;\n//             jsdoc.json config for HTML output.\n// STRENGTHS - Generates full API reference; documents event flows;\n//             deprecation warnings in IDE.\n// WEAKNESSES- Requires discipline to keep comments in sync with code.\n//\n/**\n * @module UserService\n * @description Manages user lifecycle: creation, updates, deletion.\n */\n\n/**\n * User created event.\n * @event UserService#userCreated\n * @property {User} user - The created user.\n */\n\n/**\n * @typedef {Object} CreateUserInput\n * @property {string} name\n * @property {string} email\n * @property {string} [role='member']\n * @property {Object} [metadata]\n */\n\n/**\n * Create a new user.\n * @param {CreateUserInput} input - User creation data.\n * @returns {Promise<User>}\n * @fires UserService#userCreated\n * @throws {Error} When email is already registered.\n * @example\n * const user = await createUser({ name: 'Alice', email: 'alice@ex.com' });\n */\nasync function createUser(input) {\n  const existing = await db.users.findByEmail(input.email);\n  if (existing) throw new Error('Email already registered');\n  const user = await db.users.insert(input);\n  emitter.emit('userCreated', { user });\n  return user;\n}\n\n/**\n * Delete a user by ID.\n * @param {number} id - User ID.\n * @returns {Promise<void>}\n * @deprecated Since v2.0. Use {@link deleteUserSafe} instead.\n */\nasync function deleteUser(id) {\n  await db.users.delete(id);\n}\n\n/**\n * @internal\n * Not part of the public API. Used by the auth middleware.\n */\nfunction hashToken(token) {\n  return crypto.createHash('sha256').update(token).digest('hex');\n}\n\n// jsdoc.json — config for generating HTML docs\n// {\n//   \"source\": { \"include\": [\"src\"], \"includePattern\": \".+\\\\.js$\" },\n//   \"opts\": { \"destination\": \"./docs\", \"recurse\": true },\n//   \"plugins\": [\"plugins/markdown\"],\n//   \"templates\": { \"cleverLinks\": true, \"monospaceLinks\": true }\n// }\n// Run: npx jsdoc -c jsdoc.json"
                  }
        ],
        tips: [
                  "Add // @ts-check at the top of any JS file to get TypeScript type-checking for free.",
                  "Use @typedef for reusable types — reference them with {TypeName} in @param and @returns.",
                  "Use @deprecated to mark old APIs — IDEs show strikethrough and migration hints.",
                  "Use @example with code blocks — TypeDoc renders them as syntax-highlighted samples.",
                  "Keep JSDoc in sync with code — stale docs are worse than no docs."
        ],
        mistake: "Using single-line // comments instead of /** */ — IDEs only parse /** */ blocks for type info and hover tooltips. Regular comments are invisible to tooling.",
        shorthand: {
          verbose: "/**\n * Greet a user by name.\n * @param {string} name - The user's name\n * @returns {string} A greeting string\n */\nfunction greet(name) { return `Hi ${name}`; }",
          concise: "/** @param {string} n @returns {string} */ const g = n => `Hi ${n}`;",
        },
      },
    ],
  },

  // ── Section 2: TypeDoc — API reference generation ─────────────────────────────────────────
  {
    id: "typedoc",
    title: "TypeDoc — API reference generation",
    entries: [
      {
        id: "typedoc-basics",
        fn: "TypeDoc — generate HTML API docs from TypeScript/JSDoc",
        desc: "TypeDoc generates HTML API documentation from TypeScript source files and JSDoc comments. Supports modules, classes, interfaces, generics, and cross-references.",
        category: "API Docs",
        subtitle: "typedoc.json, entry points, theme, frontmatter, @link, @category, @group",
        signature: "npx typedoc src/index.ts --out docs --name \"My API\"",
        descLong: "TypeDoc parses TypeScript type information and JSDoc comments to produce a searchable HTML API reference. Key config: entryPoints (source files), out (output dir), theme (default or custom), readme (landing page), categorizeTypes (group by @category tags). Use {@link SymbolName} for cross-references. Use @category to group related members. TypeDoc supports frontmatter for SEO and custom themes via typedoc-theme packages.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Generate HTML API docs from a TypeScript project.\n// APPROACH  - Install typedoc; configure entry points; run CLI.\n// STRENGTHS - Full type info; searchable; cross-references.\n// WEAKNESSES- Slow on large projects; default theme is basic.\n//\n// Install:\n// npm i -D typedoc\n\n// typedoc.json\n{\n  \"entryPoints\": [\"src/index.ts\"],\n  \"out\": \"docs\",\n  \"name\": \"My API\",\n  \"includeVersion\": true,\n  \"excludePrivate\": true,\n  \"excludeInternal\": true\n}\n\n// package.json\n{\n  \"scripts\": {\n    \"docs\": \"typedoc\"\n  }\n}\n\n// Run: npm run docs\n// Output: docs/ directory with HTML API reference"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Organize docs with @category, @group, cross-references,\n//             and custom readme.\n// APPROACH  - @category on classes/functions; {@link} for cross-refs;\n//             readme option for landing page; categorizeTypes for grouping.\n// STRENGTHS - Organized, navigable API reference; cross-links between types.\n// WEAKNESSES- @category must be consistent across all members.\n//\n// src/index.ts\n/**\n * @category Core\n */\nexport class UserService {\n  /**\n   * @category Queries\n   * @returns {Promise<User[]>} All active users.\n   * @see {@link UserService.findById}\n   */\n  async findAll() { /* ... */ }\n\n  /**\n   * @category Queries\n   * @param {number} id - User ID.\n   * @returns {Promise<User | null>}\n   */\n  async findById(id) { /* ... */ }\n\n  /**\n   * @category Mutations\n   * @param {CreateUserInput} input\n   * @returns {Promise<User>}\n   */\n  async create(input) { /* ... */ }\n}\n\n/**\n * @category Utils\n */\nexport function formatDate(date, format) { /* ... */ }\n\n// typedoc.json\n{\n  \"entryPoints\": [\"src/index.ts\"],\n  \"out\": \"docs\",\n  \"name\": \"My API\",\n  \"readme\": \"./README.md\",\n  \"categorizeByGroup\": true,\n  \"categoryOrder\": [\"Core\", \"Queries\", \"Mutations\", \"Utils\", \"*\"],\n  \"navigation\": {\n    \"includeCategories\": true,\n    \"includeGroups\": true\n  },\n  \"searchInComments\": true\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Custom theme, frontmatter, Git revision links, monorepo\n//             with multiple entry points, and CI/CD doc deployment.\n// APPROACH  - custom theme via plugin; Git source links; multiple entry\n//             points for monorepo; GitHub Pages deployment in CI.\n// STRENGTHS - Professional docs with source links; monorepo support;\n//             auto-deploy on push.\n// WEAKNESSES- Custom themes require TypeDoc plugin development.\n//\n// typedoc.json (monorepo)\n{\n  \"entryPoints\": [\n    \"packages/core/src/index.ts\",\n    \"packages/auth/src/index.ts\",\n    \"packages/db/src/index.ts\"\n  ],\n  \"out\": \"docs\",\n  \"name\": \"Monorepo API\",\n  \"entryPointStrategy\": \"resolve\",\n  \"sort\": [\"source-order\"],\n  \"sourceLinkTemplate\": \"https://github.com/me/repo/blob/{gitRevision}/{path}#L{line}\",\n  \"gitRevision\": \"main\",\n  \"customCss\": \"./typedoc-custom.css\",\n  \"lightHighlightTheme\": \"github-light\",\n  \"darkHighlightTheme\": \"github-dark\",\n  \"textContent\": {\n    \"title\": \"Monorepo API Reference\"\n  }\n}\n\n// .github/workflows/docs.yml\n// name: Deploy Docs\n// on: { push: { branches: [main] } }\n// jobs:\n//   docs:\n//     runs-on: ubuntu-latest\n//     steps:\n//       - uses: actions/checkout@v4\n//       - uses: actions/setup-node@v4\n//         with: { node-version: 20 }\n//       - run: npm ci\n//       - run: npm run build  # build TS first\n//       - run: npx typedoc\n//       - uses: peaceiris/actions-gh-pages@v3\n//         with:\n//           github_token: ${{ secrets.GITHUB_TOKEN }}\n//           publish_dir: ./docs"
                  }
        ],
        tips: [
                  "Run TypeDoc after TypeScript build — it needs the compiled types for accurate docs.",
                  "Use @category to group members — much more navigable than a flat list.",
                  "Use {@link SymbolName} for cross-references — TypeDoc renders them as clickable links.",
                  "Set excludePrivate and excludeInternal — keeps the API reference focused on public surface.",
                  "Use sourceLinkTemplate to link docs to GitHub source — users can jump to the actual code."
        ],
        mistake: "Running TypeDoc on .js files without // @ts-check — TypeDoc relies on TypeScript type info. Without types, it generates incomplete docs with missing parameter and return types.",
        shorthand: {
          verbose: "// typedoc.json\n{ \"entryPoints\": [\"src/index.ts\"], \"out\": \"docs\", \"name\": \"API\", \"excludePrivate\": true }\n// npx typedoc",
          concise: "npx typedoc src/index.ts --out docs --name API",
        },
      },
    ],
  },

  // ── Section 3: Storybook — component-driven development ─────────────────────────────────────────
  {
    id: "storybook",
    title: "Storybook — component-driven development",
    entries: [
      {
        id: "storybook-basics",
        fn: "Storybook — isolate, develop, and test UI components",
        desc: "Storybook is a development environment for UI components. Write stories (component states) in isolation, visualize them in a browser, and test variations without running the full app.",
        category: "Component Docs",
        subtitle: "stories, CSF, args, play function, addons, controls, docs tab",
        signature: "export default { title: \"Button\", component: Button }; export const Primary = { args: { primary: true } }",
        descLong: "Storybook uses Component Story Format (CSF) — each story file exports a default meta object (title, component, args) and named story objects. Key features: Controls panel for interactive prop editing, Docs tab auto-generates documentation from stories and JSDoc, Play function for interaction testing, Addons for accessibility, viewport, and theming. Use Storybook for component-driven development, visual regression testing, and design system documentation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Write stories for a Button component.\n// APPROACH  - CSF format: default export meta, named exports per state.\n// STRENGTHS - Isolated component dev; interactive prop editing.\n// WEAKNESSES- Setup overhead; stories can drift from real usage.\n//\n// Button.stories.jsx\nimport Button from './Button';\n\nexport default {\n  title: 'Components/Button',\n  component: Button,\n  tags: ['autodocs'],\n  argTypes: {\n    variant: { control: 'select', options: ['primary', 'secondary', 'danger'] },\n    size: { control: 'select', options: ['sm', 'md', 'lg'] },\n    onClick: { action: 'clicked' },\n  },\n};\n\nexport const Primary = {\n  args: {\n    label: 'Click me',\n    variant: 'primary',\n    size: 'md',\n  },\n};\n\nexport const Secondary = {\n  args: {\n    label: 'Cancel',\n    variant: 'secondary',\n    size: 'md',\n  },\n};\n\nexport const Disabled = {\n  args: {\n    label: 'Loading...',\n    variant: 'primary',\n    disabled: true,\n  },\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Play function for interaction testing; args composition;\n//             custom decorators for providers; and story parameters.\n// APPROACH  - play() for click/input testing; spread args for variants;\n//             decorators for Theme/Router providers; parameters for\n//             viewport and backgrounds.\n// STRENGTHS - Automated interaction tests; realistic component context.\n// WEAKNESSES- Play functions require @storybook/test; decorators add complexity.\n//\nimport Button from './Button';\nimport { userEvent, within, expect } from '@storybook/test';\n\nexport default {\n  title: 'Components/Button',\n  component: Button,\n  tags: ['autodocs'],\n  decorators: [\n    (Story) => (\n      <ThemeProvider theme=\"light\">\n        <Story />\n      </ThemeProvider>\n    ),\n  ],\n  parameters: {\n    backgrounds: { default: 'light', values: [\n      { name: 'light', value: '#fff' },\n      { name: 'dark', value: '#1a1a1a' },\n    ]},\n    viewport: { viewports: {\n      mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },\n      tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },\n    }},\n  },\n};\n\n// Base args — spread into variants\nconst baseArgs = { size: 'md', onClick: () => {} };\n\nexport const Primary = {\n  args: { ...baseArgs, label: 'Submit', variant: 'primary' },\n};\n\nexport const PrimarySmall = {\n  args: { ...Primary.args, size: 'sm' },\n};\n\n// Play function — interaction test\nexport const ClickableButton = {\n  args: { ...baseArgs, label: 'Click me', variant: 'primary' },\n  play: async ({ canvasElement }) => {\n    const canvas = within(canvasElement);\n    const button = canvas.getByRole('button', { name: 'Click me' });\n    await userEvent.click(button);\n    await expect(button).toHaveAttribute('aria-pressed', 'true');\n  },\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Design system documentation, visual regression with Chromatic,\n//             accessibility testing, and CI integration.\n// APPROACH  - MDX docs for rich documentation; a11y addon for axe checks;\n//             Chromatic for visual regression; GitHub Actions for CI.\n// STRENGTHS - Professional design system docs; automated a11y and visual tests.\n// WEAKNESSES- Chromatic is a paid service; MDX has a learning curve.\n//\n// Button.stories.mdx\nimport { Meta, Story, Canvas, Controls, ArgsTable } from '@storybook/blocks';\nimport Button from './Button';\nimport * as ButtonStories from './Button.stories';\n\n<Meta title=\"Components/Button\" component={Button} />\n\n# Button\n\nA versatile button component with variants, sizes, and states.\n\n## Usage\n\n```jsx\n<Button variant=\"primary\" size=\"md\" onClick={handleClick}>\n  Click me\n</Button>\n```\n\n## Variants\n\n<Canvas>\n  <Story name=\"Primary\" args={{ label: 'Submit', variant: 'primary' }} />\n  <Story name=\"Secondary\" args={{ label: 'Cancel', variant: 'secondary' }} />\n  <Story name=\"Danger\" args={{ label: 'Delete', variant: 'danger' }} />\n</Canvas>\n\n<ArgsTable of={Button} />\n\n## Accessibility\n\nThe Button component is fully accessible:\n- Keyboard navigable (tab + enter/space)\n- ARIA attributes for disabled state\n- Minimum touch target 44x44px\n\n<Canvas>\n  <Story name=\"Keyboard Navigation\" args={{ label: 'Focus me' }}>\n    {(args) => <Button {...args} />}\n  </Story>\n</Canvas>\n\n// .storybook/main.js\nexport default {\n  stories: ['../src/**/*.stories.@(js|jsx|mdx)'],\n  addons: [\n    '@storybook/addon-essentials',\n    '@storybook/addon-a11y',\n    '@storybook/addon-interactions',\n  ],\n  features: { interactionsDebugger: true },\n  framework: { name: '@storybook/react-vite', options: {} },\n};\n\n// .github/workflows/storybook.yml\n// name: Storybook CI\n// on: [push, pull_request]\n// jobs:\n//   chromatic:\n//     runs-on: ubuntu-latest\n//     steps:\n//       - uses: actions/checkout@v4\n//         with: { fetch-depth: 0 }\n//       - run: npm ci\n//       - uses: chromaui/action@v1\n//         with:\n//           token: ${{ secrets.GITHUB_TOKEN }}\n//           projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}"
                  }
        ],
        tips: [
                  "Use tags: ['autodocs'] to auto-generate the Docs tab — no manual MDX needed for simple components.",
                  "Use argTypes with control: 'select' for enum props — enables interactive prop editing in the Controls panel.",
                  "Use decorators for context providers (Theme, Router, Store) — stories need the same context as the real app.",
                  "Run npx chromatic for visual regression — catches unintended UI changes in CI.",
                  "Use the a11y addon to catch accessibility issues — runs axe checks on every story automatically."
        ],
        mistake: "Writing stories that test implementation details instead of user-facing behavior — stories should document what users see and do, not internal component state.",
        shorthand: {
          verbose: "// Full Storybook story with autodocs and multiple variants\nexport default {\n  title: 'Button',\n  component: Button,\n  tags: ['autodocs'],\n};\nexport const Primary = { args: { label: 'Click', variant: 'primary' } };\nexport const Secondary = { args: { label: 'Cancel', variant: 'secondary' } };",
          concise: "export default { title: 'Btn', component: Btn }; export const P = { args: { label: 'Hi' } };",
        },
      },
    ],
  },

  // ── Section 4: Docusaurus — documentation websites ─────────────────────────────────────────
  {
    id: "docusaurus",
    title: "Docusaurus — documentation websites",
    entries: [
      {
        id: "docusaurus-basics",
        fn: "Docusaurus — build documentation sites with MDX",
        desc: "Docusaurus is a React-based documentation site generator. Write docs in MDX, version them, add blog posts, and deploy to any static host. Built by Meta, used by many open-source projects.",
        category: "Doc Sites",
        subtitle: "docs, blog, MDX, versioning, i18n, themes, plugins, presets",
        signature: "npx create-docusaurus@latest my-website classic",
        descLong: "Docusaurus generates a full documentation website from Markdown/MDX files. Key features: MDX (Markdown + JSX components), versioned docs (maintain docs for multiple versions), blog module, i18n (internationalization), search (Algolia or local), custom themes and plugins, and static export for any host. Use Docusaurus for project documentation, design systems, and developer portals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Create a Docusaurus site with docs and a landing page.\n// APPROACH  - npx create-docusaurus; write MDX in docs/; configure docusaurus.config.js.\n// STRENGTHS - Full-featured docs site in minutes; MDX for interactive content.\n// WEAKNESSES- Build time grows with content; React knowledge needed for custom components.\n//\n// Create:\n// npx create-docusaurus@latest my-site classic\n\n// docusaurus.config.js\nexport default {\n  title: 'My Project',\n  tagline: 'A great project',\n  url: 'https://my-project.com',\n  baseUrl: '/',\n  presets: [\n    [\n      'classic',\n      {\n        docs: { routeBasePath: '/docs', sidebarPath: './sidebars.js' },\n        blog: { showReadingTime: true },\n      },\n    ],\n  ],\n};\n\n// docs/intro.mdx\n# Introduction\n\nWelcome to **My Project**! This is a documentation site built with Docusaurus.\n\n## Getting Started\n\nInstall the package:\n\n```bash\nnpm install my-project\n```\n\nimport MyComponent from '@site/src/components/MyComponent';\n\n<MyComponent title=\"Interactive Demo\" />"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Versioned docs, custom sidebar, blog, and Algolia search.\n// APPROACH  - docusaurus docs:version; sidebars.js with categories;\n//             blog posts with frontmatter; Algolia plugin config.\n// STRENGTHS - Multi-version docs; organized sidebar; full-text search.\n// WEAKNESSES- Versioning creates copies of all docs — storage grows.\n//\n// sidebars.js\nexport default {\n  docs: [\n    {\n      label: 'Getting Started',\n      items: ['intro', 'installation', 'quick-start'],\n    },\n    {\n      label: 'Guides',\n      items: [\n        'guides/authentication',\n        'guides/database',\n        {\n          label: 'Advanced',\n          items: ['guides/advanced/caching', 'guides/advanced/scaling'],\n        },\n      ],\n    },\n    {\n      label: 'API Reference',\n      items: [\n        { type: 'autogenerated', dirName: 'api' },\n      ],\n    },\n  ],\n};\n\n// Create a version:\n// npx docusaurus docs:version 2.0\n\n// docusaurus.config.js (with Algolia search + versioning)\nexport default {\n  title: 'My Project',\n  presets: [[\n    'classic',\n    {\n      docs: {\n        sidebarPath: './sidebars.js',\n        versions: {\n          current: { label: 'v3.0 (next)', badge: { color: 'blue' } },\n          '2.0': { label: 'v2.0 (stable)', badge: { color: 'green' } },\n        },\n      },\n    },\n  ]],\n  themes: [\n    [\n      '@docusaurus/theme-search-algolia',\n      {\n        algolia: {\n          appId: 'YOUR_APP_ID',\n          apiKey: 'YOUR_API_KEY',\n          indexName: 'my-project',\n          contextualSearch: true,\n        },\n      },\n    ],\n  ],\n};\n\n// blog/2024-01-15-release.md\n---\nslug: release-2-0\ntitle: 'Release 2.0'\nauthors: [alice]\ntags: [release]\n---\n\nWe're excited to announce version 2.0!"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Custom MDX components, i18n, plugin development, and\n//             CI/CD deployment to GitHub Pages.\n// APPROACH  - MDX component provider for custom rendering; i18n config\n//             with locale directories; custom plugin for API extraction;\n//             GitHub Actions for auto-deploy.\n// STRENGTHS - Fully customizable; multi-language; extensible via plugins.\n// WEAKNESSES- i18n doubles content maintenance; custom plugins need Docusaurus internals.\n//\n// src/theme/MDXComponents.js — override default MDX rendering\nimport MDXComponents from '@theme-original/MDXComponents';\nimport ApiTable from '@site/src/components/ApiTable';\nimport CodeBlock from '@site/src/components/CodeBlock';\n\nexport default {\n  ...MDXComponents,\n  pre: CodeBlock,       // custom code block with copy button\n  ApiTable: ApiTable,   // custom component for API tables\n};\n\n// docusaurus.config.js (i18n + custom plugin)\nexport default {\n  i18n: {\n    defaultLocale: 'en',\n    locales: ['en', 'ja', 'es'],\n    localeConfigs: {\n      en: { label: 'English' },\n      ja: { label: '日本語' },\n      es: { label: 'Español' },\n    },\n  },\n  presets: [[\n    'classic',\n    {\n      docs: {\n        sidebarPath: './sidebars.js',\n        editUrl: 'https://github.com/me/repo/edit/main/docs/',\n        showLastUpdateTime: true,\n      },\n    },\n  ]],\n  plugins: [\n    // Custom plugin — extract API from TypeScript files\n    [\n      './plugins/api-extractor.js',\n      {\n        source: './src/api',\n        output: './docs/api',\n      },\n    ],\n  ],\n};\n\n// .github/workflows/deploy-docs.yml\n// name: Deploy Docs\n// on: { push: { branches: [main] } }\n// permissions: { contents: { write: true } }\n// jobs:\n//   deploy:\n//     runs-on: ubuntu-latest\n//     steps:\n//       - uses: actions/checkout@v4\n//       - uses: actions/setup-node@v4\n//         with: { node-version: 20 }\n//       - run: npm ci\n//       - run: npm run build\n//       - uses: peaceiris/actions-gh-pages@v3\n//         with:\n//           github_token: ${{ secrets.GITHUB_TOKEN }}\n//           publish_dir: ./build"
                  }
        ],
        tips: [
                  "Use MDX to embed React components in docs — great for interactive examples and live demos.",
                  "Use autogenerated sidebars with { type: 'autogenerated', dirName: 'api' } — auto-organizes by folder structure.",
                  "Set editUrl so users can suggest doc edits via GitHub PRs directly from the site.",
                  "Use docusaurus docs:version before a breaking change — preserves the old version's docs.",
                  "Enable showLastUpdateTime and showLastUpdateAuthor — builds trust by showing when docs were last updated."
        ],
        mistake: "Putting all docs in one folder without subdirectories — the sidebar becomes a flat list of hundreds of pages. Organize docs into subdirectories that match your sidebar categories.",
        shorthand: {
          verbose: "// docusaurus.config.js\nexport default { title: 'My Site', presets: [['classic', { docs: {} }]] };\n// docs/intro.mdx: # Welcome",
          concise: "npx create-docusaurus@latest my-site classic",
        },
      },
    ],
  },
]

export default { meta, sections }
