# CodeSheets — Local Development Setup Guide

This guide walks you through setting up and running the CodeSheets project on your local machine.

---

## Prerequisites

- **Node.js** (v18 or later recommended) — [Download here](https://nodejs.org/)
- **npm** (comes bundled with Node.js)
- **Git** (optional, for version control) — [Download here](https://git-scm.com/)

To verify you have Node.js and npm installed, run:

```bash
node -v
npm -v
```

---

## Project Overview

| Detail | Value |
|---|---|
| **Framework** | Next.js 14.1.0 |
| **Frontend** | React 18 |
| **Output Mode** | Static HTML export (configured for S3/CloudFront deployment) |
| **Dev Server** | `http://localhost:3000` |

---

## Quick Start

### Option 1: Use the start script (macOS)

```bash
# Make the script executable (first time only)
chmod +x start.sh

# Run it
./start.sh
```

This will install dependencies if needed, start the dev server, and open `http://localhost:3000` in your browser automatically.

### Option 2: Manual setup

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server (hot-reloading) |
| `npm run build` | Build the project for production (static export to `./out`) |
| `npm run start` | Serve the production build locally |

---

## Troubleshooting

### Port 3000 is already in use

Kill the existing process and restart:

```bash
lsof -ti:3000 | xargs kill
npm run dev
```

### node_modules issues

Delete and reinstall:

```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Static export note

This project is configured with `output: 'export'` in `next.config.js`, which means it generates static HTML. Some Next.js features like API routes and server-side rendering are not available in this mode. The dev server (`npm run dev`) still works normally for local development.

---

## Helpful YouTube Videos

These cover setting up and running Next.js projects locally:

- **[How to Run a Next.js Project](https://www.youtube.com/watch?v=8iDI0eEydxw)** — Quick walkthrough of cloning and running an existing Next.js project locally.
- **[How to Install and Setup Next.js 15 Project | Beginner Guide](https://www.youtube.com/watch?v=ZninJNuCRVw)** — Covers Node.js installation, project setup, and running the dev server step by step.
- **[Run Next.js Production Build Locally](https://www.youtube.com/watch?v=gOKPgSR5EUs)** — Shows how to build and serve a production version locally for testing.
- **[NextJS 15 Full Course 2025](https://www.youtube.com/watch?v=6jQdZcYY8OY)** — Comprehensive 1.5-hour overview if you want deeper understanding of the framework.

---

## Project Structure

```
codesheets/
├── pages/          # Next.js page routes
├── components/     # Reusable React components
├── data/           # Cheat sheet content (JSON)
├── lib/            # Utility functions
├── styles/         # CSS stylesheets
├── public/         # Static assets
├── scripts/        # Build scripts (sitemap generation)
├── next.config.js  # Next.js configuration
├── package.json    # Dependencies and scripts
└── start.sh        # macOS quick-start launcher
```
