export const meta = {
  "title": "Configuration & Optimization",
  "domain": "nextjs",
  "sheet": "config",
  "icon": "⚙️"
}

export const sections = [

  // ── Section 1: next.config.js Configuration ─────────────────────────────────────────
  {
    id: "nextconfig-basics",
    title: "next.config.js Configuration",
    entries: [
      {
        id: "nextconfig-common",
        fn: "next.config.js Common Options",
        desc: "Configure Next.js behavior: basePath, assetPrefix, redirects, rewrites, headers.",
        category: "Configuration",
        subtitle: "Global Next.js settings",
        signature: "export default { ... }",
        descLong: "next.config.js is the central configuration file for Next.js. Set basePath for subdomain deployment, assetPrefix for CDN, output (standalone), images domains, redirects, rewrites, and headers. Changes require a rebuild.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of next.config.js Common Options — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// next.config.js\n// Note: Import Image from 'next/image' when using it in client code\nconst nextConfig = {\n  // Deploy on a subpath\n  basePath: '/app',  // All routes: /app/*"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of next.config.js Common Options — common patterns you'll see in production.\n// APPROACH  - Combine next.config.js Common Options with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// CDN prefix for assets\n  assetPrefix: process.env.NODE_ENV === 'production'\n    ? 'https://cdn.example.com'\n    : undefined,\n  // Output optimization\n  output: 'standalone',  // Minimal deployment size\n  // Image optimization\n  images: {\n    remotePatterns: [\n      { protocol: 'https', hostname: 'images.example.com' },\n      { protocol: 'https', hostname: '**.cloudinary.com' },\n    ],\n    unoptimized: false,  // Enable Image optimization\n    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],\n    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],\n  },\n  // Webpack config\n  webpack: (config, { isServer }) => {\n    if (!isServer) {\n      // Client-side only\n    }\n    return config;\n  },\n  // Redirects (build time)\n  async redirects() {\n    return [\n      {\n        source: '/old/:path*',\n        destination: '/new/:path*',\n        permanent: true,  // 308\n      },\n    ];\n  },"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of next.config.js Common Options — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Rewrites (internal routing, invisible)\n  async rewrites() {\n    return {\n      beforeFiles: [\n        { source: '/api/:path*', destination: 'https://api.example.com/:path*' },\n      ],\n    };\n  },\n  // Security headers\n  async headers() {\n    return [\n      {\n        source: '/:path*',\n        headers: [\n          { key: 'X-Content-Type-Options', value: 'nosniff' },\n        ],\n      },\n    ];\n  },\n  // Environment variables\n  env: {\n    STATIC_VAR: 'available everywhere',\n  },\n  // Experimental features\n  experimental: {\n    ppr: 'incremental',  // Partial prerendering\n    dynamicIO: true,     // Dynamic I/O\n  },\n};\nexport default nextConfig;"
                  }
        ],
        tips: [
                  "basePath must be set at build time — it's baked into all links.",
                  "assetPrefix only applies to static assets, not API routes.",
                  "output: \"standalone\" creates a single folder with all dependencies for deployment.",
                  "redirects() and rewrites() return promises — can fetch config from external APIs."
        ],
        mistake: "Setting basePath without updating all <Link> and <Image> components — basePath is automatically prepended.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "image-optimization",
        fn: "Image Optimization Config",
        desc: "Configure remotePatterns, sizes, formats, and caching for Image optimization.",
        category: "Optimization",
        subtitle: "Fine-tuning Next.js Image component",
        signature: "images: { remotePatterns: [...], deviceSizes: [...] }",
        descLong: "Image optimization config controls which remote domains are allowed, image sizes, formats (WebP, AVIF), and caching. remotePatterns allowlists domains for next/image. deviceSizes and imageSizes define the srcset breakpoints. Cache headers control browser caching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Image Optimization Config — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// next.config.js\nconst nextConfig = {\n  images: {\n    // Allow specific remote hosts (required for remote images)\n    remotePatterns: [\n      {\n        protocol: 'https',\n        hostname: 'images.example.com',\n        port: '443',\n        pathname: '/public/**',  // Optional path filter\n      },\n      {\n        protocol: 'https',\n        hostname: '*.cloudinary.com',\n      },\n      {\n        protocol: 'https',\n        hostname: 'cdn.example.com',\n        search: '?optimized=true',  // Query string filter\n      },\n    ],"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Image Optimization Config — common patterns you'll see in production.\n// APPROACH  - Combine Image Optimization Config with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Device breakpoints for srcset\n    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],\n    // Image sizes for <Image sizes=\"...\">\n    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],\n    // Supported formats in order of preference\n    formats: ['image/webp', 'image/avif'],\n    // Cache images for 1 year (long-lived)\n    minimumCacheTTL: 31536000,\n    // Disable optimization (not recommended)\n    unoptimized: false,"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Image Optimization Config — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Dangerously allow SVG (use with caution)\n    dangerouslyAllowSVG: true,\n    contentSecurityPolicy: \"default-src 'self'; script-src 'none'; sandbox;\",\n  },\n};\nexport default nextConfig;\n// Usage\nimport Image from 'next/image';\nexport function ProductImage() {\n  return (\n    <Image\n      src=\"https://images.example.com/product.jpg\"\n      alt=\"Product\"\n      width={800}\n      height={600}\n      sizes=\"(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px\"\n      priority  // Eager load for LCP\n    />\n  );\n}"
                  }
        ],
        tips: [
                  "remotePatterns is more flexible than the deprecated domains array — use patterns with wildcards.",
                  "deviceSizes: breakpoints for entire page width; imageSizes: breakpoints for image width.",
                  "formats: order matters — browsers load the first format they support.",
                  "priority attribute disables lazy loading for LCP images."
        ],
        mistake: "Using an unallowlisted remote domain — Image optimization only works with allowlisted domains for security.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "font-optimization",
        fn: "Font Optimization with next/font",
        desc: "Self-host Google Fonts or custom fonts. Zero layout shift and no external requests.",
        category: "Optimization",
        subtitle: "Fast, private font loading",
        signature: "import { Inter } from \"next/font/google\"",
        descLong: "next/font downloads and self-hosts fonts at build time. Eliminates external requests, prevents layout shift with font-display: swap, and creates CSS variables. Works with Google Fonts or local font files.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Font Optimization with next/font — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Inter, Roboto_Mono } from 'next/font/google';\nimport localFont from 'next/font/local';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Font Optimization with next/font — common patterns you'll see in production.\n// APPROACH  - Combine Font Optimization with next/font with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// app/layout.tsx\n// Google Font\nconst inter = Inter({\n  subsets: ['latin'],          // Only load Latin characters\n  display: 'swap',              // Fallback font visible immediately\n  variable: '--font-inter',     // CSS variable\n  preload: true,                // Preload font (default)\n  weight: ['400', '600', '700'], // Specific weights\n  style: ['normal', 'italic'],  // Specific styles\n});\nconst mono = Roboto_Mono({\n  subsets: ['latin'],\n  variable: '--font-mono',\n});\n// Local custom font\nconst myFont = localFont({\n  src: [\n    { path: './fonts/MyFont-Regular.woff2', weight: '400' },\n    { path: './fonts/MyFont-Bold.woff2', weight: '700' },\n  ],\n  variable: '--font-custom',\n  display: 'swap',\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Font Optimization with next/font — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport default function RootLayout({ children }) {\n  return (\n    <html\n      lang=\"en\"\n      className={`${inter.variable} ${mono.variable} ${myFont.variable}`}\n    >\n      <body className={inter.className}>\n        {children}\n      </body>\n    </html>\n  );\n}\n// Usage in CSS/Tailwind\n/* app/globals.css */\n.mono-text {\n  font-family: var(--font-mono);\n}\n.custom-heading {\n  font-family: var(--font-custom);\n  font-weight: 700;\n}\n// Tailwind config\n/** tailwind.config.ts */\nconst config = {\n  theme: {\n    fontFamily: {\n      sans: ['var(--font-inter)'],\n      mono: ['var(--font-mono)'],\n    },\n  },\n};"
                  }
        ],
        tips: [
                  "next/font fonts are included in the build — no external CDN requests.",
                  "Specify subsets to reduce font file size (e.g., Latin only).",
                  "Variable fonts (Inter) are smaller than multiple weight files.",
                  "display: swap shows fallback font immediately, then swaps when custom loads."
        ],
        mistake: "Linking Google Fonts via <link rel=\"stylesheet\"> — it blocks rendering. Use next/font instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },

  // ── Section 2: Build & Performance Optimization ─────────────────────────────────────────
  {
    id: "build-optimization",
    title: "Build & Performance Optimization",
    entries: [
      {
        id: "code-splitting-bundling",
        fn: "Code Splitting & Bundling",
        desc: "Next.js automatically splits code by route. Control with dynamic imports and chunking.",
        category: "Performance",
        subtitle: "Optimize bundle size per route",
        signature: "dynamic(() => import(...))  |  next/dynamic",
        descLong: "Next.js creates separate bundles per route. Server Components don't ship JavaScript. Dynamic imports load code only when needed. Each \"use client\" boundary creates a separate chunk. Minimize client-side imports to reduce bundle size.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Code Splitting & Bundling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport bundleAnalyzer from '@next/bundle-analyzer';\nconst withBundleAnalyzer = bundleAnalyzer({\n  enabled: process.env.ANALYZE === 'true',\n});\nconst nextConfig = {\n  // Automatic code splitting per route\n};\nexport default withBundleAnalyzer(nextConfig);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Code Splitting & Bundling — common patterns you'll see in production.\n// APPROACH  - Combine Code Splitting & Bundling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Users loading /dashboard only get dashboard JavaScript\n// Users loading /settings only get settings JavaScript\n// app/dashboard/page.tsx (Server Component)\n// → No JavaScript shipped for this page by default\n// app/dashboard/client-component.tsx\nimport dynamic from 'next/dynamic';\nimport { Suspense } from 'react';\n'use client';\n// Lazy load Chart component with loading state\nconst AdvancedChart = dynamic(\n  () => import('@/components/advanced-chart'),\n  {\n    loading: () => <p>Loading chart...</p>,\n    ssr: false,  // Disable SSR for this component\n  }\n);\nexport function DashboardInteractive() {\n  return (\n    <div>\n      <h1>Dashboard</h1>\n      <Suspense fallback={<p>Loading...</p>}>\n        <AdvancedChart />\n      </Suspense>\n    </div>\n  );\n}\nexport default function Dashboard() {\n  return <DashboardInteractive />;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Code Splitting & Bundling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport React from 'react';\nexport default function RootLayout({ children }) {\n  return (\n    <html>\n      <body>{children}</body>\n    </html>\n  );\n}\n// npm run build                    (regular build)\n// ANALYZE=true npm run build       (analyze bundle)\n// Opens .next/analyze/client.html and .next/analyze/server.html"
                  }
        ],
        tips: [
                  "Keep root layout imports minimal — they ship to all pages.",
                  "Use dynamic() to lazy-load heavy components.",
                  "Each \"use client\" component creates a separate chunk.",
                  "Minimize \"use client\" boundaries to reduce total bundle size."
        ],
        mistake: "Importing heavy libraries in the root layout — they ship to every page. Import only in pages/components that need them.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "bundle-analysis",
        fn: "Bundle Analysis & Optimization",
        desc: "Analyze bundle size with @next/bundle-analyzer. Identify and optimize large chunks.",
        category: "Performance",
        subtitle: "Measure and reduce bundle size",
        signature: "npm install --save-dev @next/bundle-analyzer",
        descLong: "Use @next/bundle-analyzer to visualize bundle size per route. Identify large dependencies, unused code, and optimization opportunities. Run analysis in production mode to see real bundle sizes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Bundle Analysis & Optimization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// npm install --save-dev @next/bundle-analyzer"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Bundle Analysis & Optimization — common patterns you'll see in production.\n// APPROACH  - Combine Bundle Analysis & Optimization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// next.config.js\nimport bundleAnalyzer from '@next/bundle-analyzer';\nconst withBundleAnalyzer = bundleAnalyzer({\n  enabled: process.env.ANALYZE === 'true',\n});\nconst nextConfig = {\n  // ... your config\n};\nexport default withBundleAnalyzer(nextConfig);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Bundle Analysis & Optimization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// package.json\n{\n  \"scripts\": {\n    \"analyze\": \"ANALYZE=true npm run build\"\n  }\n}\n// Run analysis\n// npm run analyze\n// Opens .next/analyze/client.html\n// Example output:\n// /dashboard: 245 KB\n//   - react-dom: 42 KB\n//   - chart-library: 89 KB (unused in this route!)\n//   - lodash: 15 KB\n// /admin: 156 KB\n//   - react-dom: 42 KB\n//   - admin-panel: 67 KB\n// Optimization strategies:\n// 1. Replace heavy libraries (date-fns instead of moment)\n// 2. Use dynamic imports for route-specific libraries\n// 3. Tree-shake unused code (ensure proper ES6 imports)\n// 4. Split code by route (keep root layout lean)\n// 5. Use lighter alternatives (preact, preact/compat)"
                  }
        ],
        tips: [
                  "Run analysis in production mode for real bundle sizes.",
                  "Look for duplicate chunks — may indicate missing dynamic imports.",
                  "Large JavaScript chunks indicate missing code splitting.",
                  "Heavy dependencies should be lazy-loaded with dynamic()."
        ],
        mistake: "Ignoring bundle size until it's too late — analyze regularly and optimize early.",
        shorthand: {
          verbose: "import Chart from 'chart-library';  // 89 KB in every route\nexport default function Dashboard() {\n  return <Chart />;\n}",
          concise: "const Chart = dynamic(() => import('chart-library'));\nexport default function Dashboard() {\n  return <Chart />;\n}  // Lazy-load heavy dependencies",
        },
      },
      {
        id: "turbopack-dev",
        fn: "Turbopack & Development Workflow",
        desc: "Next.js Turbopack for fast development builds — HMR, debugging, and dev server configuration.",
        category: "Tooling",
        subtitle: "next dev --turbo, fast refresh, debugging",
        signature: "next dev --turbo  |  next build  |  next start",
        descLong: "Turbopack is the Rust-based successor to Webpack in Next.js, offering significantly faster HMR and startup times. Fast Refresh preserves React state during edits. Configure debugging with Chrome DevTools or VS Code. Use next.config.js for webpack customization when Turbopack isn't sufficient.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Turbopack & Development Workflow — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n{\n  \"scripts\": {\n    \"dev\": \"next dev --turbo\",\n    \"build\": \"next build\",\n    \"start\": \"next start\",\n    \"lint\": \"next lint\",\n    \"type-check\": \"tsc --noEmit\"\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Turbopack & Development Workflow — common patterns you'll see in production.\n// APPROACH  - Combine Turbopack & Development Workflow with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n{\n  \"version\": \"0.2.0\",\n  \"configurations\": [\n    {\n      \"name\": \"Next.js: debug server\",\n      \"type\": \"node\",\n      \"request\": \"launch\",\n      \"runtimeExecutable\": \"${workspaceFolder}/node_modules/.bin/next\",\n      \"runtimeArgs\": [\"dev\"],\n      \"env\": { \"NODE_OPTIONS\": \"--inspect\" },\n      \"cwd\": \"${workspaceFolder}\"\n    },\n    {\n      \"name\": \"Next.js: debug client\",\n      \"type\": \"chrome\",\n      \"request\": \"launch\",\n      \"url\": \"http://localhost:3000\"\n    }\n  ]\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Turbopack & Development Workflow — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  webpack: (config, { isServer, dev }) => {\n    // Add custom alias\n    config.resolve.alias['@components'] = path.resolve('./src/components')\n    // SVG as React components\n    config.module.rules.push({\n      test: /\\.svg$/,\n      use: ['@svgr/webpack'],\n    })\n    if (!isServer) {\n      // Replace heavy package with lightweight alternative\n      config.resolve.alias['lodash'] = 'lodash-es'\n    }\n    return config\n  },\n  // Experimental features\n  experimental: {\n    typedRoutes: true,           // TypeScript for route links\n    serverComponentsExternalPackages: ['sharp'],\n  },\n}"
                  }
        ],
        tips: [
                  "next dev --turbo uses Turbopack for 10x faster HMR — default in Next.js 15+.",
                  "Fast Refresh preserves component state during edits — if it full-reloads, you have a syntax error.",
                  "experimental.typedRoutes generates TypeScript types for Link href — catches broken links at compile time.",
                  "Use NODE_OPTIONS=--inspect with Chrome DevTools for server-side debugging."
        ],
        mistake: "Customizing Webpack config without checking if Next.js already handles it — image optimization, CSS modules, and PostCSS are built-in. Only customize for truly unique needs.",
        shorthand: {
          verbose: "// Old dev workflow: Webpack-based, slow HMR\n// package.json\n{\n  \"scripts\": {\n    \"dev\": \"next dev\"  // Webpack — slower cold start & HMR\n  }\n}",
          concise: "// Turbopack: just add --turbo\n\"dev\": \"next dev --turbo\"  // 10x faster HMR, default in Next.js 15+",
        },
      },
      {
        id: "db-orm-patterns",
        fn: "Database & ORM Integration",
        desc: "Connect Next.js to databases with Prisma, Drizzle, or direct SQL — connection pooling and server-only patterns.",
        category: "Data",
        subtitle: "Prisma, Drizzle ORM, connection pooling, server-only DB access",
        signature: "import { db } from \"@/lib/db\"  |  prisma.$transaction()  |  drizzle()",
        descLong: "Next.js Server Components and Server Actions can access databases directly — no API layer needed. Use Prisma or Drizzle ORM for type-safe queries. Connection pooling is critical: serverless functions create new connections per invocation, so use PgBouncer, Prisma Accelerate, or Neon pooling. Mark database modules as server-only to prevent client imports.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Database & ORM Integration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { PrismaClient } from '@prisma/client'\nconst globalForPrisma = globalThis as unknown as { prisma: PrismaClient }\nexport const db = globalForPrisma.prisma || new PrismaClient({\n  log: process.env.NODE_ENV === 'development' ? ['query'] : [],\n})\nif (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Database & ORM Integration — common patterns you'll see in production.\n// APPROACH  - Combine Database & ORM Integration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// app/users/page.tsx\nimport { db } from '@/lib/db'\nimport 'server-only'  // prevents importing in client components\nexport default async function UsersPage() {\n  const users = await db.user.findMany({\n    select: { id: true, name: true, email: true },\n    orderBy: { createdAt: 'desc' },\n    take: 50,\n  })\n  return (\n    <ul>\n      {users.map(user => (\n        <li key={user.id}>{user.name} — {user.email}</li>\n      ))}\n    </ul>\n  )\n}\n'use server'\nimport { db } from '@/lib/db'\nimport { revalidatePath } from 'next/cache'\nexport async function transferFunds(fromId: string, toId: string, amount: number) {\n  await db.$transaction(async (tx) => {\n    const from = await tx.account.update({\n      where: { id: fromId },\n      data: { balance: { decrement: amount } },\n    })\n    if (from.balance < 0) throw new Error('Insufficient funds')\n    await tx.account.update({\n      where: { id: toId },\n      data: { balance: { increment: amount } },\n    })\n  })\n  revalidatePath('/accounts')\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Database & ORM Integration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// import { drizzle } from 'drizzle-orm/neon-http'\n// import { neon } from '@neondatabase/serverless'\n// const sql = neon(process.env.DATABASE_URL!)\n// export const db = drizzle(sql)"
                  }
        ],
        tips: [
                  "Use the Prisma singleton pattern to avoid creating multiple connections during hot reload in development.",
                  "import \"server-only\" at the top of DB modules — it errors if accidentally imported in a client component.",
                  "Use Prisma select to fetch only needed fields — reduces data transfer and improves performance.",
                  "For serverless: use connection pooling (PgBouncer, Neon, Prisma Accelerate) to avoid connection exhaustion."
        ],
        mistake: "Creating a new PrismaClient() in every Server Component render — in development with hot reload, this exhausts database connections. Use the global singleton pattern.",
        shorthand: {
          verbose: "// Junior: new client every render — exhausts connections\n// app/users/page.tsx\nimport { PrismaClient } from '@prisma/client'\n\nexport default async function Page() {\n  const prisma = new PrismaClient()  // new connection every render!\n  const users = await prisma.user.findMany()\n  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>\n}",
          concise: "// Senior: singleton in lib/db.ts, import everywhere\nimport { db } from '@/lib/db'\nconst users = await db.user.findMany({ select: { id: true, name: true } })",
        },
      },
      {
        id: "parallel-data-fetching",
        fn: "Parallel Data Fetching & Waterfall Prevention",
        desc: "Fetch multiple data sources simultaneously — avoid sequential request waterfalls in Server Components.",
        category: "Performance",
        subtitle: "Promise.all, parallel routes, preload pattern",
        signature: "Promise.all([fetchA(), fetchB()])  |  preload()  |  parallel routes",
        descLong: "Sequential data fetching in Server Components creates request waterfalls — each fetch waits for the previous one. Use Promise.all for parallel fetches within a component. Use the preload pattern to start fetches before the component renders. Parallel routes (@folder) render independently, each fetching their own data without blocking siblings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Parallel Data Fetching & Waterfall Prevention — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nexport default async function Dashboard() {\n  const user = await getUser()           // 200ms\n  const posts = await getPosts(user.id)  // 300ms  (waits for user!)\n  const stats = await getStats(user.id)  // 150ms  (waits for posts!)\n  // Total: ~650ms sequential\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Parallel Data Fetching & Waterfall Prevention — common patterns you'll see in production.\n// APPROACH  - Combine Parallel Data Fetching & Waterfall Prevention with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport default async function Dashboard() {\n  const user = await getUser()           // 200ms\n  // Fetch posts and stats in parallel\n  const [posts, stats] = await Promise.all([\n    getPosts(user.id),   // 300ms ─┐\n    getStats(user.id),   // 150ms ─┤ parallel\n  ])                     //        └─ Total: ~500ms\n}\n// lib/data.ts\nimport { cache } from 'react'\n// React cache deduplicates — safe to call multiple times\nexport const getUser = cache(async (id: string) => {\n  return db.user.findUnique({ where: { id } })\n})\n// Preload function — starts fetch before component renders\nexport const preloadUser = (id: string) => { void getUser(id) }\n// app/dashboard/layout.tsx\nimport { preloadUser } from '@/lib/data'\nexport default function Layout({ children, params }) {\n  preloadUser(params.id)  // start fetch immediately\n  return <>{children}</>\n}\n// app/dashboard/page.tsx — data is already loading!\nimport { getUser } from '@/lib/data'\nexport default async function Page({ params }) {\n  const user = await getUser(params.id)  // instant — already cached\n  return <div>{user.name}</div>\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Parallel Data Fetching & Waterfall Prevention — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// app/dashboard/@analytics/page.tsx\n// app/dashboard/@feed/page.tsx\n// app/dashboard/layout.tsx\nexport default function Layout({ analytics, feed }) {\n  return (\n    <div className=\"grid grid-cols-2\">\n      {analytics}  {/* loads independently */}\n      {feed}        {/* loads independently */}\n    </div>\n  )\n}"
                  }
        ],
        tips: [
                  "Use React.cache() to deduplicate fetches — safe to call getUser() in multiple components; only one request fires.",
                  "The preload pattern in layout.tsx starts data fetching before child components render — eliminates waterfalls.",
                  "Parallel routes (@folder) are the most powerful pattern — each slot loads independently with its own loading.tsx.",
                  "Use Promise.all only when fetches are independent — if B needs data from A, you must await A first."
        ],
        mistake: "Awaiting each fetch sequentially when they're independent — turns a 300ms parallel load into a 700ms waterfall. Always Promise.all independent fetches.",
        shorthand: {
          verbose: "// Junior: sequential awaits — each fetch blocks the next\nconst user  = await getUser(id)    // 200ms\nconst posts = await getPosts(id)   // 300ms — waits for user\nconst stats = await getStats(id)   // 150ms — waits for posts\n// Total: ~650ms",
          concise: "// Senior: parallel — all fire at once\nconst [posts, stats] = await Promise.all([getPosts(id), getStats(id)])\n// Total: ~300ms (longest fetch wins)",
        },
      },
    ],
  },
]

export default { meta, sections }
