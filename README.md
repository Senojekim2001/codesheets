# CodeSheets

Interactive cheat sheets for developers. Built with Next.js, deployed to S3 + CloudFront.

## Stack

- **Next.js 14** (Pages Router, static export)
- **AWS S3 + CloudFront** (CDN, HTTPS)
- **Route 53** (DNS)

## Local Development

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup Instructions

1. **Clone or download the project**
   ```bash
   cd ~/Documents/projects/codesheets
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will install all required packages including Next.js, React, and other dependencies.

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

4. **Open in your browser**
   Navigate to `http://localhost:3000` to view the application

### Video Tutorial
For a step-by-step video guide on running Next.js projects locally, watch this tutorial:

[📺 How to Run a Next.js Project Locally](https://www.youtube.com/watch?v=3bhS-Hzw8OQ)

This video covers:
- Setting up Node.js and npm
- Installing project dependencies
- Starting the development server
- Common troubleshooting tips

### Development Workflow
- The development server hot-reloads automatically when you save changes
- Edit files in `pages/`, `components/`, or `data/` to see changes immediately
- Press `Ctrl+C` in the terminal to stop the server

### Troubleshooting
- If `npm install` fails, try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- If port 3000 is already in use, the server will automatically use the next available port (3001, 3002, etc.)
- Make sure you're in the project directory before running npm commands

## Adding a New Sheet

1. **Register it in the catalog:**
   ```js
   // data/catalog.js
   { id: 'pandas', label: 'Pandas', entryCount: 35 }
   ```

2. **Create the data file:**
   ```
   data/python/pandas.js
   ```
   Export `{ meta, sections }` — see `data/sql/core.js` as the reference.

3. **That's it.** Next.js picks it up automatically via `getStaticPaths`.

## Data File Structure

```js
export const sections = [
  {
    id: 'section-id',
    title: 'Section Title',
    entries: [
      {
        id: 'entry-id',
        fn: 'display_name()',      // shown in the grid
        desc: 'One-line summary.', // shown in the grid
        category: 'Category',      // shown in modal badge
        subtitle: 'Longer title',  // shown in modal subtitle
        signature: 'fn(arg) → type',
        descLong: 'Full description paragraph.',
        code: `-- multi-line\n-- code example`,
        tips: [
          'Tip one — use **bold** for emphasis',
          'Tip two',
        ],
        mistake: 'Common mistake description. Use `code` backticks.',
        ytId: 'YouTubeVideoID',
        ytTitle: 'Video Title',
      },
    ],
  },
]
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for the full AWS deployment guide.

```bash
npm run deploy    # build + sync to S3 + CloudFront invalidation
```

## Project Structure

```
codesheets/
├── pages/
│   ├── index.js              Home page
│   └── [domain]/[sheet].js   Sheet page (SSG)
├── components/
│   ├── NavBar.jsx
│   ├── SheetGrid.jsx
│   ├── EntryModal.jsx
│   └── SEOHead.jsx
├── data/
│   ├── catalog.js            All domains + sheets registry
│   ├── sql/core.js           SQL data
│   └── python/core.js        Python data (coming)
├── styles/globals.css
├── scripts/generate-sitemap.js
└── DEPLOY.md
```
