export const meta = {
  "title": "Deployment & Production",
  "domain": "nextjs",
  "sheet": "deployment",
  "icon": "▲"
}

export const sections = [

  // ── Section 1: Deployment & Hosting ─────────────────────────────────────────
  {
    id: "deployment-hosting",
    title: "Deployment & Hosting",
    entries: [
      {
        id: "vercel-deployment",
        fn: "Vercel Deployment & Configuration",
        desc: "Deploy to Vercel with zero config — automatic preview deployments, edge functions, and environment management.",
        category: "Deployment",
        subtitle: "vercel.json, preview branches, environment variables",
        signature: "vercel deploy  |  vercel.json  |  vercel env pull",
        descLong: "Vercel is the creators' platform for Next.js with first-class support. Push to Git for automatic deployments. Every PR gets a preview URL. Edge Functions run middleware globally. Environment variables are managed per-environment (Production, Preview, Development). vercel.json configures headers, redirects, rewrites, and function regions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vercel Deployment & Configuration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n{\n  \"framework\": \"nextjs\",\n  \"regions\": [\"iad1\", \"sfo1\"],\n  \"headers\": [\n    {\n      \"source\": \"/api/(.*)\",\n      \"headers\": [\n        { \"key\": \"Cache-Control\", \"value\": \"s-maxage=60, stale-while-revalidate=600\" }\n      ]\n    }\n  ],\n  \"redirects\": [\n    { \"source\": \"/old-page\", \"destination\": \"/new-page\", \"permanent\": true }\n  ],\n  \"crons\": [\n    { \"path\": \"/api/cron/cleanup\", \"schedule\": \"0 0 * * *\" }\n  ]\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vercel Deployment & Configuration — common patterns you'll see in production.\n// APPROACH  - Combine Vercel Deployment & Configuration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// vercel env add DATABASE_URL production\n// vercel env pull .env.local"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vercel Deployment & Configuration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  // Output standalone for Docker/self-hosting\n  output: 'standalone',\n  // Image optimization domains\n  images: {\n    remotePatterns: [\n      { protocol: 'https', hostname: '**.amazonaws.com' },\n      { protocol: 'https', hostname: 'images.unsplash.com' },\n    ],\n  },\n  // Security headers\n  async headers() {\n    return [{\n      source: '/:path*',\n      headers: [\n        { key: 'X-Frame-Options', value: 'DENY' },\n        { key: 'X-Content-Type-Options', value: 'nosniff' },\n        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },\n        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },\n      ],\n    }]\n  },\n}\nmodule.exports = nextConfig"
                  }
        ],
        tips: [
                  "Every Git push creates an automatic deployment — PR branches get unique preview URLs for testing.",
                  "Use Vercel Edge Config for feature flags and A/B testing with sub-millisecond reads at the edge.",
                  "vercel env pull syncs production env vars to .env.local — never hardcode secrets.",
                  "Set regions in vercel.json to deploy functions close to your database for lower latency."
        ],
        mistake: "Committing .env.local to Git — it contains secrets. Use Vercel Dashboard or CLI to manage environment variables, and add .env.local to .gitignore.",
        shorthand: {
          verbose: "// Manual env setup\nconst db = process.env.DATABASE_URL;\nconst apiKey = process.env.API_KEY;\n// Check if they exist... ugh",
          concise: "vercel deploy from Git; vercel env add KEY val; vercel env pull to sync to .env.local",
        },
      },
      {
        id: "docker-self-host",
        fn: "Docker & Self-Hosting",
        desc: "Deploy Next.js with Docker using standalone output — production-ready container with minimal image size.",
        category: "Deployment",
        subtitle: "output: standalone, multi-stage Docker build, reverse proxy",
        signature: "output: \"standalone\"  |  docker build -t myapp .",
        descLong: "Next.js standalone output copies only the files needed to run in production — no node_modules bloat. Multi-stage Docker builds create minimal images (~100MB vs ~1GB). Use a reverse proxy (Nginx, Caddy, Traefik) for TLS, load balancing, and static assets. Set HOSTNAME=0.0.0.0 for container networking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Docker & Self-Hosting — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# ── Dockerfile (multi-stage build) ────────────────────\nFROM node:20-alpine AS base"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Docker & Self-Hosting — common patterns you'll see in production.\n// APPROACH  - Combine Docker & Self-Hosting with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n# Install dependencies\nFROM base AS deps\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci --only=production\n# Build the application\nFROM base AS builder\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nENV NEXT_TELEMETRY_DISABLED=1\nRUN npm run build\n# Production image — minimal\nFROM base AS runner\nWORKDIR /app\nENV NODE_ENV=production\nENV NEXT_TELEMETRY_DISABLED=1\nENV HOSTNAME=0.0.0.0\nENV PORT=3000\nRUN addgroup --system --gid 1001 nodejs\nRUN adduser --system --uid 1001 nextjs"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Docker & Self-Hosting — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n# Copy only what's needed (standalone output)\nCOPY --from=builder /app/public ./public\nCOPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./\nCOPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static\nUSER nextjs\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]\n# ── docker-compose.yml ───────────────────────────────\n# version: '3.8'\n# services:\n#   web:\n#     build: .\n#     ports:\n#       - \"3000:3000\"\n#     environment:\n#       - DATABASE_URL=postgresql://user:pass@db:5432/myapp\n#     depends_on:\n#       - db\n#   db:\n#     image: postgres:16-alpine\n#     volumes:\n#       - pgdata:/var/lib/postgresql/data\n# volumes:\n#   pgdata:"
                  }
        ],
        tips: [
                  "output: \"standalone\" in next.config.js is required — it creates a self-contained server.js with all dependencies.",
                  "Multi-stage builds keep the final image small: deps → build → run (only copies built artifacts).",
                  "Set HOSTNAME=0.0.0.0 in the container — Next.js defaults to localhost which isn't reachable from outside.",
                  "Use health checks: /api/health endpoint that returns 200 for load balancer probes."
        ],
        mistake: "Copying the entire node_modules into the production image — standalone mode includes only the needed dependencies. The final image should be ~100-150MB, not ~1GB.",
        shorthand: {
          verbose: "COPY . .\nRUN npm install --production\n# Result: ~1GB image with all deps",
          concise: "output: \"standalone\" in next.config.js; multi-stage: only copy .next/standalone + .next/static",
        },
      },
      {
        id: "edge-runtime",
        fn: "Edge Runtime & Middleware Patterns",
        desc: "Run code at the edge (CDN locations) for ultra-low latency — middleware, edge API routes, and geo-routing.",
        category: "Runtime",
        subtitle: "export const runtime = \"edge\"  |  geo-routing, A/B testing",
        signature: "export const runtime = \"edge\";  |  NextRequest.geo  |  NextRequest.ip",
        descLong: "Edge Runtime runs JavaScript at CDN locations worldwide (~50ms cold start vs ~250ms for Node.js). Use for middleware (auth checks, redirects, A/B testing), lightweight API routes, and geo-based personalization. Limitations: no Node.js APIs (fs, child_process), no native modules, 1MB code size limit. Choose edge for latency-sensitive, lightweight operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Edge Runtime & Middleware Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/api/geo/route.ts\nimport { NextRequest, NextResponse } from 'next/server'\nexport const runtime = 'edge'\nexport async function GET(request: NextRequest) {\n  const { geo, ip } = request\n  const country = geo?.country || 'unknown'\n  const city = geo?.city || 'unknown'\n  return NextResponse.json({\n    ip,\n    country,\n    city,\n    region: geo?.region,\n    latitude: geo?.latitude,\n    longitude: geo?.longitude,\n  })\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Edge Runtime & Middleware Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Edge Runtime & Middleware Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server'\nexport function middleware(request: NextRequest) {\n  // A/B test: 50/50 split\n  const bucket = request.cookies.get('ab-bucket')?.value\n    || (Math.random() < 0.5 ? 'a' : 'b')\n  const response = NextResponse.next()\n  if (!request.cookies.has('ab-bucket')) {\n    response.cookies.set('ab-bucket', bucket, {\n      maxAge: 60 * 60 * 24 * 30, // 30 days\n    })\n  }\n  // Rewrite to variant page\n  if (request.nextUrl.pathname === '/pricing') {\n    return NextResponse.rewrite(\n      new URL(`/pricing/${bucket}`, request.url)\n    )\n  }\n  return response\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Edge Runtime & Middleware Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Simple token bucket at the edge\nconst rateLimit = new Map<string, { count: number; resetTime: number }>()\nexport function middleware(request: NextRequest) {\n  if (request.nextUrl.pathname.startsWith('/api/')) {\n    const ip = request.ip ?? '127.0.0.1'\n    const now = Date.now()\n    const window = 60_000 // 1 minute\n    const limit = 60      // requests per window\n    const current = rateLimit.get(ip)\n    if (current && now < current.resetTime) {\n      if (current.count >= limit) {\n        return NextResponse.json(\n          { error: 'Rate limit exceeded' },\n          { status: 429, headers: { 'Retry-After': '60' } }\n        )\n      }\n      current.count++\n    } else {\n      rateLimit.set(ip, { count: 1, resetTime: now + window })\n    }\n  }\n  return NextResponse.next()\n}\nexport const config = {\n  matcher: ['/api/:path*', '/pricing'],\n}"
                  }
        ],
        tips: [
                  "Edge Runtime has ~50ms cold starts vs ~250ms for Node.js — ideal for auth checks and redirects.",
                  "Use request.geo for country-based routing (pricing pages, language selection, compliance).",
                  "Middleware runs on EVERY matched request — keep it fast. No database queries or heavy computation.",
                  "Edge limitations: no fs, no native modules, no eval() — it's a stripped-down V8 environment."
        ],
        mistake: "Putting database queries in edge middleware — Edge Runtime can't use most database drivers. Use edge for routing/auth decisions, then let the server component handle data fetching.",
        shorthand: {
          verbose: "export function middleware(req) {\n  const user = await db.user.findUnique(...); // fails!\n  return NextResponse.next();\n}",
          concise: "export const runtime = 'edge'; check request.geo + cookies; rewrite for A/B tests; no DB in edge",
        },
      },
    ],
  },

  // ── Section 2: Testing & Monitoring ─────────────────────────────────────────
  {
    id: "testing-monitoring",
    title: "Testing & Monitoring",
    entries: [
      {
        id: "testing-nextjs",
        fn: "Testing Next.js Applications",
        desc: "Test server components, client components, API routes, and server actions with Vitest and Testing Library.",
        category: "Testing",
        subtitle: "Vitest + React Testing Library + Playwright for E2E",
        signature: "vitest  |  render(<Component />)  |  playwright test",
        descLong: "Next.js testing uses three layers: unit tests (Vitest for utilities and hooks), component tests (React Testing Library for UI), and E2E tests (Playwright or Cypress). Server Components need special handling — test their output, not their rendering. Server Actions can be tested by importing and calling them directly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Testing Next.js Applications — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { defineConfig } from 'vitest/config'\nimport react from '@vitejs/plugin-react'\nimport { resolve } from 'path'\nexport default defineConfig({\n  plugins: [react()],\n  test: {\n    environment: 'jsdom',\n    setupFiles: ['./tests/setup.ts'],\n    globals: true,\n  },\n  resolve: {\n    alias: { '@': resolve(__dirname, './src') },\n  },\n})"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Testing Next.js Applications — common patterns you'll see in production.\n// APPROACH  - Combine Testing Next.js Applications with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// tests/components/SearchBar.test.tsx\nimport { render, screen, fireEvent } from '@testing-library/react'\nimport { SearchBar } from '@/components/SearchBar'\ndescribe('SearchBar', () => {\n  it('calls onSearch when form is submitted', async () => {\n    const onSearch = vi.fn()\n    render(<SearchBar onSearch={onSearch} />)\n    const input = screen.getByRole('textbox')\n    fireEvent.change(input, { target: { value: 'test query' } })\n    fireEvent.submit(screen.getByRole('form'))\n    expect(onSearch).toHaveBeenCalledWith('test query')\n  })\n  it('shows loading state', () => {\n    render(<SearchBar loading />)\n    expect(screen.getByText('Searching...')).toBeInTheDocument()\n  })\n})\n// tests/api/users.test.ts\nimport { GET, POST } from '@/app/api/users/route'\nimport { NextRequest } from 'next/server'\ndescribe('/api/users', () => {\n  it('returns users list', async () => {\n    const req = new NextRequest('http://localhost/api/users')\n    const res = await GET(req)\n    const data = await res.json()\n    expect(res.status).toBe(200)\n    expect(data.users).toBeInstanceOf(Array)\n  })\n  it('creates a user', async () => {\n    const req = new NextRequest('http://localhost/api/users', {\n      method: 'POST',\n      body: JSON.stringify({ name: 'Alice', email: 'alice@test.com' }),\n    })\n    const res = await POST(req)\n    expect(res.status).toBe(201)\n  })\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Testing Next.js Applications — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// e2e/navigation.spec.ts\n// import { test, expect } from '@playwright/test'\n// test('navigation flow', async ({ page }) => {\n//   await page.goto('/')\n//   await expect(page.getByRole('heading')).toContainText('Welcome')\n//   await page.click('text=Get Started')\n//   await expect(page).toHaveURL('/dashboard')\n// })"
                  }
        ],
        tips: [
                  "Test Server Components by testing their data fetching and output separately — they don't render in jsdom.",
                  "Mock next/navigation (useRouter, usePathname) in component tests with vi.mock().",
                  "API route tests: import the handler function directly and pass NextRequest — no need to start a server.",
                  "Use Playwright for critical user flows (auth, checkout) — it tests the full stack including SSR."
        ],
        mistake: "Trying to render Server Components with React Testing Library — they run on the server, not in the browser. Test their output (returned JSX) or use E2E tests instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst c = render(<ServerComponent />); // error!\n// Can't test Server Components in jsdom\n// More explicit but longer",
          concise: "Vitest + React Testing Library for client/utils; import GET/POST directly from API routes; Playwright for E2E",
        },
      },
      {
        id: "performance-monitoring",
        fn: "Performance & Core Web Vitals",
        desc: "Monitor and optimize Core Web Vitals (LCP, FID, CLS) — Next.js built-in reporting and optimization strategies.",
        category: "Performance",
        subtitle: "Web Vitals, next/dynamic, lazy loading, caching headers",
        signature: "useReportWebVitals()  |  next/dynamic  |  Cache-Control headers",
        descLong: "Next.js has built-in Web Vitals reporting via useReportWebVitals(). Key metrics: LCP (Largest Contentful Paint — loading), FID/INP (First Input Delay / Interaction to Next Paint — interactivity), CLS (Cumulative Layout Shift — visual stability). Optimize with dynamic imports, image optimization, font preloading, and smart caching headers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Performance & Core Web Vitals — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/layout.tsx\nimport { WebVitals } from './web-vitals'\nexport default function RootLayout({ children }) {\n  return (\n    <html>\n      <body>\n        <WebVitals />\n        {children}\n      </body>\n    </html>\n  )\n}\n// app/web-vitals.tsx\n'use client'\nimport { useReportWebVitals } from 'next/web-vitals'\nexport function WebVitals() {\n  useReportWebVitals((metric) => {\n    // Send to analytics\n    console.log(metric.name, metric.value)\n    // { name: 'LCP', value: 1234, rating: 'good' }\n    // Send to your analytics endpoint\n    fetch('/api/vitals', {\n      method: 'POST',\n      body: JSON.stringify(metric),\n    })\n  })\n  return null\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Performance & Core Web Vitals — common patterns you'll see in production.\n// APPROACH  - Combine Performance & Core Web Vitals with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nimport dynamic from 'next/dynamic'\n// Load heavy component only when needed\nconst Chart = dynamic(() => import('@/components/Chart'), {\n  loading: () => <div>Loading chart...</div>,\n  ssr: false,  // client-only (e.g., uses window/document)\n})\nexport async function GET() {\n  const data = await fetchExpensiveData()\n  return Response.json(data, {\n    headers: {\n      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',\n    },\n  })\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Performance & Core Web Vitals — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport Image from 'next/image'\n// Prioritize above-the-fold images\n<Image src=\"/hero.jpg\" width={1200} height={600} priority />\n// Lazy load below-the-fold images (default behavior)\n<Image src=\"/gallery.jpg\" width={400} height={300} />\nimport { Inter } from 'next/font/google'\nconst inter = Inter({ subsets: ['latin'], display: 'swap' })"
                  }
        ],
        tips: [
                  "Use priority on above-the-fold images and hero banners — preloads them for better LCP.",
                  "dynamic(() => import(...), { ssr: false }) for client-only libraries (charts, maps, rich editors).",
                  "s-maxage in Cache-Control caches at the CDN level; stale-while-revalidate serves stale while refreshing.",
                  "next/font eliminates font layout shift (CLS) by preloading and self-hosting fonts."
        ],
        mistake: "Loading heavy client libraries (chart.js, mapbox) in a Server Component — they fail on the server. Use next/dynamic with ssr: false to load them only in the browser.",
        shorthand: {
          verbose: "// In Server Component\nimport Chart from 'chart.js'; // fails on server\nexport default function Page() {\n  return <Chart data={...} />;\n}",
          concise: "dynamic(() => import('@/components/Chart'), { ssr: false, loading: () => <div>Loading...</div> })",
        },
      },
      {
        id: "vercel-edge-config",
        fn: "Vercel Edge Config — Fast Global KV Store",
        desc: "Feature flags and configuration at the edge — sub-millisecond reads, global propagation.",
        category: "Deployment",
        subtitle: "Edge Config, feature flags, dynamic configuration",
        signature: "const config = await getEdgeConfig(); config.get(\"flag\")",
        descLong: "Vercel Edge Config provides a global key-value store accessible from middleware and edge functions with sub-millisecond latency. Perfect for feature flags, A/B test configuration, rate limit settings, and dynamic config that changes without redeploy. Updates propagate globally in seconds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vercel Edge Config — Fast Global KV Store — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// 1. Create in Vercel Dashboard\n// 2. Set environment variable EDGE_CONFIG=<url>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vercel Edge Config — Fast Global KV Store — common patterns you'll see in production.\n// APPROACH  - Combine Vercel Edge Config — Fast Global KV Store with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nimport { getEdgeConfig } from '@vercel/edge-config';\nexport async function middleware(request: NextRequest) {\n  const edgeConfig = await getEdgeConfig();\n  const { pathname } = request.nextUrl;\n  const newCheckoutEnabled = await edgeConfig.get('new-checkout-enabled');\n  if (pathname === '/checkout' && newCheckoutEnabled) {\n    return NextResponse.rewrite(new URL('/checkout-v2', request.url));\n  }\n  const maintenanceMode = await edgeConfig.get('maintenance-mode');\n  if (maintenanceMode) {\n    return NextResponse.rewrite(new URL('/maintenance', request.url));\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vercel Edge Config — Fast Global KV Store — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst rateLimit = await edgeConfig.get('api-rate-limit');\n  if (pathname.startsWith('/api/') && rateLimit) {\n    // Apply rate limiting with config value\n  }\n  return NextResponse.next();\n}\n// app/api/feature-check/route.ts\nimport { getEdgeConfig } from '@vercel/edge-config';\nexport const runtime = 'edge';\nexport async function GET() {\n  const edgeConfig = await getEdgeConfig();\n  const features = {\n    newCheckout: await edgeConfig.get('new-checkout-enabled'),\n    betaUI: await edgeConfig.get('beta-ui-enabled'),\n    discountCode: await edgeConfig.get('active-discount'),\n  };\n  return Response.json(features);\n}\n// app/page.tsx\nimport { getEdgeConfig } from '@vercel/edge-config';\nexport default async function Home() {\n  const edgeConfig = await getEdgeConfig();\n  const newFeatureEnabled = await edgeConfig.get('new-feature');\n  return (\n    <div>\n      {newFeatureEnabled && <NewFeatureComponent />}\n      {!newFeatureEnabled && <LegacyComponent />}\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Edge Config reads in <1ms at the edge — ideal for feature flags that need to change without redeploy.",
                  "Updates to Edge Config are cached briefly — expect 5-10 second propagation globally.",
                  "Use for A/B test bucketing, maintenance mode, dynamic pricing, and kill switches.",
                  "Cheaper than database queries for simple KV data."
        ],
        mistake: "Using Edge Config for frequently-changing data (stock prices, real-time counts) — it's cached and has latency. Use a real-time database instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst config = await getEdgeConfig();\nconst value = await config.get('key');\n// More explicit but longer",
          concise: "getEdgeConfig() in middleware/edge routes; <1ms reads; updates propagate in ~5-10 seconds",
        },
      },
      {
        id: "vercel-kv-blob",
        fn: "Vercel KV (Redis) & Blob Storage",
        desc: "Vercel KV for caching and rate limiting, Blob for file storage — simple API, global access.",
        category: "Deployment",
        subtitle: "@vercel/kv Redis, @vercel/blob file storage, edge-compatible",
        signature: "kv.set(key, value)  |  blob.upload()",
        descLong: "Vercel KV is a Redis-compatible store for caching, rate limiting, sessions, and real-time data. Vercel Blob handles file uploads and storage (images, PDFs, etc). Both are edge-compatible and provide simple APIs without managing databases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vercel KV (Redis) & Blob Storage — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nimport { kv } from '@vercel/kv';\nexport const runtime = 'edge';\nexport async function middleware(request: NextRequest) {\n  const ip = request.ip || 'unknown';\n  const key = `ratelimit:${ip}`;\n  const count = await kv.incr(key);\n  // Expire after 1 minute\n  if (count === 1) {\n    await kv.expire(key, 60);\n  }\n  if (count > 100) {\n    return NextResponse.json(\n      { error: 'Rate limit exceeded' },\n      { status: 429, headers: { 'Retry-After': '60' } }\n    );\n  }\n  return NextResponse.next();\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vercel KV (Redis) & Blob Storage — common patterns you'll see in production.\n// APPROACH  - Combine Vercel KV (Redis) & Blob Storage with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// app/api/auth/route.ts\nimport { kv } from '@vercel/kv';\nexport async function POST(request: Request) {\n  const { email, password } = await request.json();\n  // Verify credentials...\n  const sessionId = crypto.randomUUID();\n  const sessionData = {\n    userId: '123',\n    email,\n    issuedAt: Date.now(),\n  };\n  // Store session for 7 days\n  await kv.setex(\n    `session:${sessionId}`,\n    60 * 60 * 24 * 7,\n    JSON.stringify(sessionData)\n  );\n  return Response.json({ sessionId });\n}\n// app/api/upload/route.ts\nimport { put } from '@vercel/blob';\nexport async function POST(request: Request) {\n  const formData = await request.formData();\n  const file = formData.get('file') as File;\n  const blob = await put(file.name, file, {\n    access: 'public',\n    addRandomSuffix: true,\n  });\n  return Response.json({ url: blob.url });\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vercel KV (Redis) & Blob Storage — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport { put } from '@vercel/blob';\nimport { download } from '@vercel/blob';\nexport async function downloadPrivateFile(pathname: string) {\n  const blob = await download(pathname);\n  return blob;\n}\n// Create signed URL\nimport { BlobAccessError } from '@vercel/blob';\nconst signedUrl = await blob.downloadUrl(); // Requires blob with token\nimport Image from 'next/image';\nexport function UserAvatar({ blobUrl }: { blobUrl: string }) {\n  return <Image src={blobUrl} alt=\"avatar\" width={100} height={100} />;\n}"
                  }
        ],
        tips: [
                  "Vercel KV is Redis-compatible — familiar commands (set, incr, expire) reduce learning curve.",
                  "Use Blob for user-generated content, images, and PDFs — Vercel handles CDN and optimization.",
                  "KV is great for caching, rate limiting, and temporary data; use a database for persistent user data.",
                  "Both KV and Blob are edge-compatible (runtime: \"edge\") for low latency."
        ],
        mistake: "Using KV for primary database — it's a cache. Use it for sessions, rate limits, and real-time data; use Postgres/MongoDB for permanent storage.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst count = await kv.incr(`ratelimit:${ip}`);\nawait kv.expire(`ratelimit:${ip}`, 60);\n// More explicit but longer",
          concise: "kv.set/get/incr/expire for caching; blob.put/download for file storage; both edge-compatible",
        },
      },
      {
        id: "docker-nextjs",
        fn: "Docker for Next.js",
        desc: "Containerize Next.js with standalone output and multi-stage builds — production-ready images.",
        category: "Deployment",
        subtitle: "standalone output, multi-stage Docker build, image optimization",
        signature: "output: \"standalone\" in next.config.js; Dockerfile with multi-stage build",
        descLong: "Next.js standalone output creates a minimal, self-contained server.js. Multi-stage Docker builds result in ~100MB production images (vs ~1GB with all node_modules). Set HOSTNAME=0.0.0.0 for container networking. This pattern works with any container orchestration (Docker, Kubernetes, ECS).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Docker for Next.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  output: 'standalone',\n};\nmodule.exports = nextConfig;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Docker for Next.js — common patterns you'll see in production.\n// APPROACH  - Combine Docker for Next.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nFROM node:20-alpine AS base\n# ── Stage 1: Install dependencies ──────────────────\nFROM base AS deps\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci --only=production\n# ── Stage 2: Build application ─────────────────────\nFROM base AS builder\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nENV NEXT_TELEMETRY_DISABLED=1\nRUN npm run build\n# ── Stage 3: Production image (minimal) ─────────────\nFROM base AS runner\nWORKDIR /app\nENV NODE_ENV=production\nENV NEXT_TELEMETRY_DISABLED=1\n# Create app user (non-root for security)\nRUN addgroup --system --gid 1001 nodejs\nRUN adduser --system --uid 1001 nextjs\n# Copy only production files from builder\nCOPY --from=builder /app/public ./public\nCOPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./\nCOPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static\nUSER nextjs\nEXPOSE 3000\nENV HOSTNAME=0.0.0.0\nENV PORT=3000\nCMD [\"node\", \"server.js\"]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Docker for Next.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n# ── docker-compose.yml ─────────────────────────────\nversion: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - '3000:3000'\n    environment:\n      - DATABASE_URL=postgresql://user:pass@postgres:5432/nextjs\n      - NODE_ENV=production\n    depends_on:\n      - postgres\n    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:3000/api/health\"]\n      interval: 10s\n      timeout: 5s\n      retries: 3\n  postgres:\n    image: postgres:16-alpine\n    environment:\n      - POSTGRES_USER=user\n      - POSTGRES_PASSWORD=pass\n      - POSTGRES_DB=nextjs\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\nvolumes:\n  postgres_data:\n# ── Build and run locally ──────────────────────────\n# docker build -t nextjs-app .\n# docker run -p 3000:3000 -e DATABASE_URL=postgresql://... nextjs-app\n# ── Build and push to registry ─────────────────────\n# docker build -t myregistry/nextjs-app:latest .\n# docker push myregistry/nextjs-app:latest"
                  }
        ],
        tips: [
                  "Multi-stage build separates build environment from runtime — keeps final image small.",
                  "COPY --from=builder /app/.next/standalone ./ — only copy built app, not node_modules.",
                  "HOSTNAME=0.0.0.0 is required for the container to accept external connections.",
                  "Health check endpoint (/api/health) helps orchestrators monitor the container."
        ],
        mistake: "Copying entire .next folder instead of .next/standalone — results in 10x larger image.",
        shorthand: {
          verbose: "COPY . .\nRUN npm install\n# Result: 1GB+ image",
          concise: "output: 'standalone'; copy only .next/standalone + public + static; HOSTNAME=0.0.0.0; ~100MB final image",
        },
      },
      {
        id: "self-hosted-nextjs",
        fn: "Self-Hosted Next.js Deployment",
        desc: "Run Next.js on your own servers — Node.js, PM2, Nginx reverse proxy.",
        category: "Deployment",
        subtitle: "Node.js server, PM2 process manager, Nginx reverse proxy, SSL/TLS",
        signature: "npm run build && npm start  |  pm2 start server.js",
        descLong: "Deploy Next.js on your own infrastructure (AWS EC2, DigitalOcean, VPS). Build production bundle (output: standalone), use PM2 to manage the process, and Nginx as a reverse proxy for TLS, caching, and static file serving.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Self-Hosted Next.js Deployment — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  output: 'standalone',\n};\nmodule.exports = nextConfig;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Self-Hosted Next.js Deployment — common patterns you'll see in production.\n// APPROACH  - Combine Self-Hosted Next.js Deployment with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// npm run build\n// npm start  # Starts server.js listening on port 3000\nmodule.exports = {\n  apps: [\n    {\n      name: 'nextjs-app',\n      script: 'npm',\n      args: 'start',\n      cwd: '/var/www/nextjs-app',\n      instances: 'max',\n      exec_mode: 'cluster',\n      env: {\n        NODE_ENV: 'production',\n        PORT: 3000,\n      },\n      error_file: '/var/log/nextjs-app/error.log',\n      out_file: '/var/log/nextjs-app/out.log',\n      log_file: '/var/log/nextjs-app/combined.log',\n      time: true,\n    },\n  ],\n};\n// npm install pm2 -g\n// pm2 start ecosystem.config.js\n// pm2 save\n// pm2 startup (generates init script)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Self-Hosted Next.js Deployment — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n# /etc/nginx/sites-available/nextjs-app\nupstream nextjs_app {\n  server localhost:3000;\n}\nserver {\n  listen 80;\n  server_name example.com www.example.com;\n  # Redirect HTTP to HTTPS\n  return 301 https://$server_name$request_uri;\n}\nserver {\n  listen 443 ssl http2;\n  server_name example.com www.example.com;\n  # SSL certificates (Let's Encrypt)\n  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;\n  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;\n  # Security headers\n  add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;\n  add_header X-Frame-Options \"DENY\" always;\n  add_header X-Content-Type-Options \"nosniff\" always;\n  # Caching for static assets\n  location /_next/static/ {\n    expires 365d;\n    add_header Cache-Control \"public, immutable\";\n  }\n  location /public/ {\n    expires 30d;\n    add_header Cache-Control \"public\";\n  }\n  # Proxy to Next.js\n  location / {\n    proxy_pass http://nextjs_app;\n    proxy_http_version 1.1;\n    proxy_set_header Upgrade $http_upgrade;\n    proxy_set_header Connection 'upgrade';\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n    proxy_set_header X-Forwarded-Proto $scheme;\n    proxy_cache_bypass $http_upgrade;\n  }\n}\n# ── Enable site & test Nginx ───────────────────────\n# ln -s /etc/nginx/sites-available/nextjs-app /etc/nginx/sites-enabled/\n# nginx -t\n# systemctl restart nginx\n#!/bin/bash\nset -e\ncd /var/www/nextjs-app\n# Pull latest code\ngit pull origin main\n# Install/update dependencies\nnpm ci\n# Build\nnpm run build\n# Restart PM2\npm2 restart nextjs-app\n# Health check\nsleep 2\ncurl -f http://localhost:3000/ || (pm2 logs nextjs-app && exit 1)\necho \"Deployment successful\""
                  }
        ],
        tips: [
                  "Use PM2 with cluster mode (instances: \"max\") to utilize all CPU cores.",
                  "Nginx as reverse proxy: handles SSL, caches static assets, and balances load.",
                  "Set up Let's Encrypt with certbot for free SSL certificates.",
                  "Monitor with PM2 Plus or separate tools (Prometheus, DataDog) for production."
        ],
        mistake: "Running Next.js directly without a reverse proxy — no TLS, no static caching, no load balancing. Always use Nginx or similar.",
        shorthand: {
          verbose: "// Manual / verbose approach\nnpm run build && npm start  # Direct approach\n# No SSL, no static caching\n// More explicit but longer",
          concise: "output: 'standalone'; PM2 cluster mode; Nginx reverse proxy with SSL & caching",
        },
      },
      {
        id: "nextjs-env",
        fn: "Environment Variables in Next.js",
        desc: "Build-time vs runtime env vars — NEXT_PUBLIC_ prefix, .env files, variable substitution.",
        category: "Configuration",
        subtitle: ".env.local, NEXT_PUBLIC_, runtime variables, build configuration",
        signature: "process.env.VAR (server)  |  process.env.NEXT_PUBLIC_VAR (client)",
        descLong: "Environment variables without NEXT_PUBLIC_ are build-time only, embedded during build, available only on server. NEXT_PUBLIC_ vars are embedded in the client bundle. For runtime server-side configuration, use Docker env vars or read from a config file.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Environment Variables in Next.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# Server-side only (not exposed to client)\nDATABASE_URL=postgresql://localhost:5432/db\nSTRIPE_SECRET_KEY=sk_live_...\nJWT_SECRET=my-secret-key\n# Public: embedded in client bundle\nNEXT_PUBLIC_API_URL=https://api.example.com\nNEXT_PUBLIC_APP_NAME=MyApp\nNEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_..."
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Environment Variables in Next.js — common patterns you'll see in production.\n// APPROACH  - Combine Environment Variables in Next.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  env: {\n    // Available to server and client\n    CUSTOM_VAR: process.env.CUSTOM_VAR,\n  },\n};\nmodule.exports = nextConfig;\n// app/page.tsx\nexport default function Home() {\n  // Only works on server during build\n  const dbUrl = process.env.DATABASE_URL; // available\n  const apiKey = process.env.STRIPE_SECRET_KEY; // available\n  return <div>Database URL: {dbUrl}</div>; // ⚠️ Embedded at build time!\n}\n'use client';\nexport function ApiClient() {\n  // These work\n  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // ✓ available\n  const appName = process.env.NEXT_PUBLIC_APP_NAME; // ✓ available\n  // These DON'T work in client\n  const dbUrl = process.env.DATABASE_URL; // ✗ undefined\n  const secret = process.env.STRIPE_SECRET_KEY; // ✗ undefined\n  return <div>App: {appName}</div>;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Environment Variables in Next.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// When deploying to production, env vars come from:\n// 1. Docker -e flag: docker run -e DATABASE_URL=... nextjs-app\n// 2. .env in container: copied via Dockerfile\n// 3. Environment variables in orchestrator (Kubernetes, ECS)\n// To use runtime vars in server components:\n// app/api/config/route.ts\nexport async function GET() {\n  return Response.json({\n    // These are evaluated at request time (runtime)\n    dbUrl: process.env.DATABASE_URL,\n    apiKey: process.env.STRIPE_SECRET_KEY,\n  });\n}\nimport { z } from 'zod';\nconst envSchema = z.object({\n  DATABASE_URL: z.string().url(),\n  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),\n  JWT_SECRET: z.string().min(32),\n  NEXT_PUBLIC_API_URL: z.string().url(),\n});\nexport const env = envSchema.parse(process.env);\n// Usage:\nimport { env } from '@/lib/env';\nexport default async function Dashboard() {\n  // TypeScript knows these are safe\n  const db = await connectDB(env.DATABASE_URL);\n  return <div>Connected to {env.DATABASE_URL}</div>;\n}"
                  }
        ],
        tips: [
                  "NEXT_PUBLIC_ vars are embedded at build time — they can't change without rebuilding.",
                  "For runtime config, use API routes or fetch config at startup.",
                  "Never embed secrets (API keys, database URLs) in client-side code.",
                  "Use Zod or similar to validate env vars on startup."
        ],
        mistake: "Using process.env.DATABASE_URL in a Client Component — it's undefined. Only NEXT_PUBLIC_ vars are available.",
        shorthand: {
          verbose: "// Manual / verbose approach\nprocess.env.DATABASE_URL // Server-only, build-time\nprocess.env.NEXT_PUBLIC_API_URL // Client + Server, embedded\n// More explicit but longer",
          concise: "NEXT_PUBLIC_: public, embedded at build; no prefix: server-side, build-time; use API routes for runtime config",
        },
      },
      {
        id: "nextjs-headers-cache",
        fn: "Headers & Caching in next.config.js",
        desc: "Configure response headers and Cache-Control — security headers, CDN caching, browser caching.",
        category: "Configuration",
        subtitle: "headers(), Cache-Control, CDN caching, browser caching",
        signature: "async headers() { return [{ source, headers }] }",
        descLong: "Use next.config.js headers() to set response headers globally. Configure Cache-Control for different content types: static assets (long-lived), API routes (short or no-cache), dynamic pages (stale-while-revalidate). Headers apply at build time.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Headers & Caching in next.config.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  async headers() {\n    return ["
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Headers & Caching in next.config.js — common patterns you'll see in production.\n// APPROACH  - Combine Headers & Caching in next.config.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n{\n        source: '/:path*',\n        headers: [\n          {\n            key: 'X-Content-Type-Options',\n            value: 'nosniff',\n          },\n          {\n            key: 'X-Frame-Options',\n            value: 'DENY',\n          },\n          {\n            key: 'X-XSS-Protection',\n            value: '1; mode=block',\n          },\n          {\n            key: 'Referrer-Policy',\n            value: 'strict-origin-when-cross-origin',\n          },\n          {\n            key: 'Permissions-Policy',\n            value: 'geolocation=(), microphone=(), camera=()',\n          },\n        ],\n      },\n      {\n        source: '/(.+)\\\\.(?:jpg|jpeg|gif|png|webp|svg|woff|woff2|ttf|eot)$',\n        headers: [\n          {\n            key: 'Cache-Control',\n            value: 'public, max-age=31536000, immutable',\n          },\n        ],\n      },\n      {\n        source: '/_next/static/:path*',\n        headers: [\n          {\n            key: 'Cache-Control',\n            value: 'public, max-age=31536000, immutable',\n          },\n        ],\n      },\n      {\n        source: '/api/:path*',\n        headers: [\n          {\n            key: 'Cache-Control',\n            value: 's-maxage=60, stale-while-revalidate=300',\n          },\n        ],\n      },"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Headers & Caching in next.config.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n{\n        source: '/blog/:slug',\n        headers: [\n          {\n            key: 'Cache-Control',\n            value: 's-maxage=3600, stale-while-revalidate=86400',\n          },\n        ],\n      },\n      {\n        source: '/admin/:path*',\n        headers: [\n          {\n            key: 'Cache-Control',\n            value: 'private, no-cache, no-store, must-revalidate',\n          },\n        ],\n      },\n      {\n        source: '/:path*',\n        headers: [\n          {\n            key: 'Strict-Transport-Security',\n            value: 'max-age=31536000; includeSubDomains; preload',\n          },\n        ],\n      },\n    ];\n  },\n};\nmodule.exports = nextConfig;\n// public: shareable between browsers and CDN\n// private: only browser cache, not CDN\n// max-age: browser cache lifetime (seconds)\n// s-maxage: CDN cache lifetime (seconds)\n// stale-while-revalidate: serve stale while refreshing in background\n// immutable: never changes, safe to cache indefinitely\n// no-cache: must revalidate before using\n// no-store: don't cache at all\n// must-revalidate: strict revalidation\n// Examples:\n// Static assets: \"public, max-age=31536000, immutable\"\n// API: \"s-maxage=60, stale-while-revalidate=600\"\n// Dynamic: \"s-maxage=3600, stale-while-revalidate=86400\"\n// Private: \"private, max-age=300, must-revalidate\""
                  }
        ],
        tips: [
                  "s-maxage controls CDN caching; max-age controls browser caching.",
                  "stale-while-revalidate: serve cached content while fetching fresh content in background.",
                  "immutable: only for content with content-hash in filename (Next.js handles this).",
                  "Test headers with curl -I or browser DevTools."
        ],
        mistake: "No Cache-Control headers — everything is cached with default browser behavior. Set explicit caching for performance.",
        shorthand: {
          verbose: "{\n  source: '/api/:path*',\n  headers: [{ key: 'Cache-Control', value: 's-maxage=60' }]\n}",
          concise: "headers() in next.config.js; max-age for browser; s-maxage for CDN; immutable for assets",
        },
      },
      {
        id: "nextjs-redirects-rewrites",
        fn: "Redirects & Rewrites in next.config.js",
        desc: "redirects() and rewrites() for URL mapping — permanent/temporary redirects, path rewrites, conditional matching.",
        category: "Configuration",
        subtitle: "redirects(), rewrites(), permanent flag, has/missing conditions",
        signature: "async redirects() { return [{ source, destination, permanent }] }",
        descLong: "Use redirects() for HTTP 301/302 redirects and rewrites() for internal path mapping. Redirects change the browser URL; rewrites are invisible. Both support conditional matching (has/missing) based on headers, cookies, or query params.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Redirects & Rewrites in next.config.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  async redirects() {\n    return ["
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Redirects & Rewrites in next.config.js — common patterns you'll see in production.\n// APPROACH  - Combine Redirects & Rewrites in next.config.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n{\n        source: '/old-page',\n        destination: '/new-page',\n        permanent: true, // HTTP 301\n      },\n      {\n        source: '/promo/:slug',\n        destination: '/deals/:slug',\n        permanent: false, // HTTP 302\n      },\n      {\n        source: '/docs/:slug',\n        destination: '/help/:slug?ref=docs',\n        permanent: true,\n      },\n      {\n        source: '/admin',\n        destination: '/admin/dashboard',\n        permanent: false,\n        has: [\n          { type: 'header', key: 'x-role', value: 'admin' },\n        ],\n      },\n      // Usually handled by reverse proxy or CDN\n      {\n        source: '/api/v1/:path*',\n        destination: '/api/v2/:path*',\n        permanent: true,\n      },\n    ];\n  },\n  async rewrites() {\n    return ["
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Redirects & Rewrites in next.config.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n{\n        source: '/checkout',\n        destination: '/checkout-v2',\n      },\n      {\n        source: '/external/:path*',\n        destination: 'https://api.external.com/:path*',\n      },\n      {\n        source: '/dashboard',\n        destination: '/dashboard-new',\n        has: [\n          { type: 'header', key: 'x-beta-user', value: 'true' },\n        ],\n      },\n      {\n        source: '/old/:path*',\n        destination: '/new/:path*',\n        missing: [\n          { type: 'header', key: 'x-skip-redirect' },\n        ],\n      },\n      {\n        source: '/api/data',\n        destination: '/api/data-v2',\n        has: [\n          { type: 'query', key: 'version', value: '2' },\n        ],\n      },\n    ];\n  },\n};\nmodule.exports = nextConfig;\n// REDIRECTS:\n// - HTTP 301/302 status codes\n// - Browser URL changes (visible to user)\n// - New request from browser\n// - Use for moving pages or old URLs\n// REWRITES:\n// - No status code, URL doesn't change\n// - Invisible to user\n// - Server-side mapping\n// - Use for API proxying, feature flags, A/B tests"
                  }
        ],
        tips: [
                  "permanent: true = HTTP 301 (cached by browsers), permanent: false = HTTP 302 (not cached).",
                  "Use rewrites for feature flags and A/B tests — URLs stay clean.",
                  "Use redirects for old URLs that are gone for good.",
                  "Both support has/missing for conditional matching."
        ],
        mistake: "Using redirects for everything — if you want to hide internal path changes, use rewrites instead.",
        shorthand: {
          verbose: "{\n  source: '/old',\n  destination: '/new',\n  permanent: true // HTTP 301\n}",
          concise: "redirects(): HTTP 301/302, visible; rewrites(): internal mapping, invisible; both support has/missing conditions",
        },
      },
      {
        id: "nextjs-bundle-analysis",
        fn: "Bundle Analysis & Code Splitting",
        desc: "Analyze and optimize bundle size — tree-shaking, dynamic imports, analyzing with @next/bundle-analyzer.",
        category: "Performance",
        subtitle: "@next/bundle-analyzer, dynamic imports, tree-shaking, code splitting",
        signature: "dynamic(() => import(...))  |  ANALYZE=true npm run build",
        descLong: "Monitor bundle size to catch bloat early. Use @next/bundle-analyzer to visualize what's in your bundle. Tree-shaking removes unused code. Dynamic imports (next/dynamic) split code into separate chunks. Lazy-load heavy libraries (charts, editors) only when needed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Bundle Analysis & Code Splitting — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// npm install --save-dev @next/bundle-analyzer"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Bundle Analysis & Code Splitting — common patterns you'll see in production.\n// APPROACH  - Combine Bundle Analysis & Code Splitting with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst withBundleAnalyzer = require('@next/bundle-analyzer')({\n  enabled: process.env.ANALYZE === 'true',\n});\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  // Optimize unused dependencies\n  webpack: (config, { isServer }) => {\n    return config;\n  },\n};\nmodule.exports = withBundleAnalyzer(nextConfig);\n// ANALYZE=true npm run build\n// Opens browser with interactive bundle visualization\nimport dynamic from 'next/dynamic';\n// Load Chart component only when rendered\nconst Chart = dynamic(() => import('@/components/Chart'), {\n  loading: () => <div>Loading chart...</div>,\n  ssr: false, // Client-only library\n});\n// Load Modal lazily on click\nconst AdvancedSettings = dynamic(() => import('@/components/AdvancedSettings'), {\n  loading: () => <p>Loading...</p>,\n});\nexport default function Dashboard() {\n  const [showChart, setShowChart] = useState(false);\n  return (\n    <div>\n      <button onClick={() => setShowChart(true)}>Show Chart</button>\n      {showChart && <Chart />}\n      <AdvancedSettings />\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Bundle Analysis & Code Splitting — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// ❌ Import entire library\nimport _ from 'lodash';\nconst result = _.uniq(array);\n// ✓ Import specific function (tree-shake unused code)\nimport { uniq } from 'lodash-es';\nconst result = uniq(array);\n// ✓ Even better: use small alternatives\nimport uniq from 'lodash.uniq';\nconst result = uniq(array);\n// pages/api/analyze-page.ts\nimport { readFile } from 'fs/promises';\nimport { resolve } from 'path';\nexport async function GET(request: Request) {\n  const nextDataPath = resolve(process.cwd(), '.next', 'static', 'chunks');\n  // Analyze chunk sizes...\n  return Response.json({\n    totalSize: '250KB',\n    chunks: [\n      { name: 'main.js', size: '120KB' },\n      { name: 'chart.js', size: '85KB' },\n    ],\n  });\n}\n// scripts/check-bundle-size.js\nconst MAX_BUNDLE_SIZE = 500_000; // 500KB\nconst stats = require('./.next/stats.json');\nconst totalSize = Object.values(stats.pages).reduce((sum, page) => sum + page.size, 0);\nif (totalSize > MAX_BUNDLE_SIZE) {\n  console.error(`Bundle too large: ${totalSize} > ${MAX_BUNDLE_SIZE}`);\n  process.exit(1);\n}"
                  }
        ],
        tips: [
                  "Use @next/bundle-analyzer to find which dependencies are bloating your bundle.",
                  "dynamic() with ssr: false for client-only libraries (React Query, charts, maps).",
                  "Prefer ESM packages (lodash-es, date-fns) over CommonJS for better tree-shaking.",
                  "Set bundle size budget in CI/CD to prevent regressions."
        ],
        mistake: "Not code-splitting heavy libraries — loading entire chart.js library on every page increases bundle by 80KB+.",
        shorthand: {
          verbose: "import Chart from 'chart.js';\nexport default function Page() {\n  return <Chart data={...} />; // Always loaded\n}",
          concise: "dynamic(() => import('chart'), { ssr: false }); lazy-load on demand; tree-shake with import-specific functions",
        },
      },
      {
        id: "optimistic-ui",
        fn: "Optimistic UI & useOptimistic",
        desc: "Update the UI immediately before the server responds — feels instant even with slow networks.",
        category: "Patterns",
        subtitle: "useOptimistic hook, server action integration, rollback",
        signature: "useOptimistic(state, updateFn)  |  startTransition(() => action())",
        descLong: "Optimistic updates show the expected result immediately while the server action processes in the background. React 19's useOptimistic hook manages the optimistic state. If the action fails, the state automatically rolls back. Combined with useTransition for pending states, this creates a snappy, app-like experience.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Optimistic UI & useOptimistic — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n'use client'\nimport { useOptimistic, useTransition } from 'react'\nimport { addTodo, deleteTodo } from './actions'\ntype Todo = { id: string; text: string; pending?: boolean }\nexport function TodoList({ todos }: { todos: Todo[] }) {\n  const [isPending, startTransition] = useTransition()\n  const [optimisticTodos, addOptimistic] = useOptimistic(\n    todos,\n    (state: Todo[], action: { type: 'add' | 'delete'; todo: Todo }) => {\n      switch (action.type) {\n        case 'add':\n          return [...state, { ...action.todo, pending: true }]\n        case 'delete':\n          return state.filter(t => t.id !== action.todo.id)\n      }\n    }\n  )\n  async function handleAdd(formData: FormData) {\n    const text = formData.get('text') as string\n    const tempTodo = { id: crypto.randomUUID(), text }\n    // Optimistic: show immediately\n    addOptimistic({ type: 'add', todo: tempTodo })\n    // Server: persist in background\n    startTransition(async () => {\n      await addTodo(text)\n    })\n  }\n  async function handleDelete(todo: Todo) {\n    addOptimistic({ type: 'delete', todo })\n    startTransition(async () => {\n      await deleteTodo(todo.id)\n    })\n  }\n  return (\n    <>\n      <form action={handleAdd}>\n        <input name=\"text\" required />\n        <button type=\"submit\">Add</button>\n      </form>\n      <ul>\n        {optimisticTodos.map(todo => (\n          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>\n            {todo.text}\n            <button onClick={() => handleDelete(todo)}>×</button>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Optimistic UI & useOptimistic — common patterns you'll see in production.\n// APPROACH  - Combine Optimistic UI & useOptimistic with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n'use server'\nimport { revalidatePath } from 'next/cache'\nexport async function addTodo(text: string) {\n  await db.todo.create({ data: { text } })\n  revalidatePath('/todos')"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Optimistic UI & useOptimistic — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n}\nexport async function deleteTodo(id: string) {\n  await db.todo.delete({ where: { id } })\n  revalidatePath('/todos')\n}"
                  }
        ],
        tips: [
                  "useOptimistic automatically reverts if the server action throws — no manual rollback needed.",
                  "Style optimistic items differently (opacity, spinner) so users know it's pending.",
                  "revalidatePath() in the server action refreshes the page data after the mutation succeeds.",
                  "Combine useOptimistic + useTransition for both optimistic UI and a loading/pending indicator."
        ],
        mistake: "Calling revalidatePath() in the client component — it's a server-only function. Call it inside the server action, which runs on the server.",
        shorthand: {
          verbose: "// Waits for full response\nconst result = await addTodo(text);\n// Then update state manually",
          concise: "useOptimistic(state, updateFn) shows immediately; startTransition(() => action()); revalidatePath inside 'use server' function",
        },
      },
    ],
  },
]

export default { meta, sections }
