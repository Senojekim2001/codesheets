export const meta = {
  "title": "Middleware & Edge Runtime",
  "domain": "nextjs",
  "sheet": "middleware",
  "icon": "🔀"
}

export const sections = [

  // ── Section 1: Middleware & Edge Runtime ─────────────────────────────────────────
  {
    id: "middleware-edge",
    title: "Middleware & Edge Runtime",
    entries: [
      {
        id: "middleware-patterns",
        fn: "Middleware — Auth, Redirects, A/B Testing & Geolocation",
        desc: "Next.js middleware runs before every request: authentication guards, redirects, A/B test assignment, geolocation, and request rewriting.",
        category: "Middleware",
        subtitle: "middleware.ts, NextRequest, NextResponse, matcher, cookies, headers, geo",
        signature: "export function middleware(request: NextRequest): NextResponse  |  config.matcher",
        descLong: "Next.js middleware runs at the edge before the request reaches your pages or API routes. It can redirect, rewrite, set headers/cookies, and return responses. Common patterns: protect routes with auth checks, assign A/B test variants via cookies, redirect based on geolocation, add security headers, and rate limiting. Middleware runs in the Edge Runtime (V8 isolates) — lightweight, fast cold starts, but limited Node.js API access. Use the matcher config to limit which routes trigger middleware.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Middleware — Auth, Redirects, A/B Testing & Geolocation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts (project root)\nimport { NextRequest, NextResponse } from 'next/server';\nexport function middleware(request: NextRequest) {\n  const { pathname } = request.nextUrl;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Middleware — Auth, Redirects, A/B Testing & Geolocation — common patterns you'll see in production.\n// APPROACH  - Combine Middleware — Auth, Redirects, A/B Testing & Geolocation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst token = request.cookies.get('session-token')?.value;\n  const isProtected = pathname.startsWith('/dashboard') ||\n                      pathname.startsWith('/settings');\n  if (isProtected && !token) {\n    const loginUrl = new URL('/login', request.url);\n    loginUrl.searchParams.set('redirect', pathname);\n    return NextResponse.redirect(loginUrl);\n  }\n  if (pathname === '/pricing') {\n    const variant = request.cookies.get('pricing-variant')?.value;\n    if (!variant) {\n      const assigned = Math.random() < 0.5 ? 'control' : 'new-design';\n      const response = NextResponse.rewrite(\n        new URL(`/pricing/${assigned}`, request.url)\n      );\n      response.cookies.set('pricing-variant', assigned, {\n        maxAge: 60 * 60 * 24 * 30, // 30 days\n        httpOnly: true,\n      });\n      return response;\n    }\n    return NextResponse.rewrite(\n      new URL(`/pricing/${variant}`, request.url)\n    );\n  }\n  const country = request.geo?.country || 'US';\n  if (pathname === '/' && country === 'DE') {\n    return NextResponse.redirect(new URL('/de', request.url));\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Middleware — Auth, Redirects, A/B Testing & Geolocation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst response = NextResponse.next();\n  response.headers.set('X-Frame-Options', 'DENY');\n  response.headers.set('X-Content-Type-Options', 'nosniff');\n  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');\n  response.headers.set(\n    'Content-Security-Policy',\n    \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'\"\n  );\n  const ip = request.headers.get('x-forwarded-for') || 'unknown';\n  // In production, check against a rate limit store (Redis/KV)\n  return response;\n}\n// Only run middleware on specific routes\nexport const config = {\n  matcher: [\n    // Match all routes except static files and API health\n    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',\n  ],\n};"
                  }
        ],
        tips: [
                  "matcher config limits which routes trigger middleware — always exclude _next/static and images to avoid unnecessary execution.",
                  "NextResponse.rewrite() serves different content without changing the URL — perfect for A/B tests and feature flags.",
                  "Middleware runs on every matched request — keep it fast. Heavy logic should go in API routes or server components.",
                  "request.geo provides country, city, and region on Vercel — use it for localization without client-side geolocation APIs."
        ],
        mistake: "Doing database queries or heavy computation in middleware — middleware runs at the edge with limited APIs and should be fast. Use it for routing decisions only; defer data fetching to server components or API routes.",
        shorthand: {
          verbose: "export function middleware(request) {\n  // Check token, log, transform...\n  return NextResponse.next();\n}\nexport const config = { matcher: ['/api/*'] };",
          concise: "function middleware(req: NextRequest): NextResponse; redirect/rewrite for auth+AB tests; matcher to limit routes",
        },
      },
      {
        id: "middleware-matcher",
        fn: "Middleware Matcher Configuration",
        desc: "Configure which routes trigger middleware using matcher patterns, negative lookaheads, and conditional matching.",
        category: "Middleware",
        subtitle: "matcher config, path patterns, negative lookaheads, missing/has conditions",
        signature: "export const config = { matcher: [...] }",
        descLong: "The matcher config in middleware.ts controls which requests trigger your middleware function. Use glob patterns to include routes, negative lookaheads (?) to exclude routes, and the missing/has array to match requests with specific headers/cookies/query params. Exclude static files and internal Next.js routes to avoid unnecessary overhead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Middleware Matcher Configuration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nexport function middleware(request: NextRequest) {\n  // Middleware logic here\n  return NextResponse.next();\n}\nexport const config = {\n  matcher: ["
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Middleware Matcher Configuration — common patterns you'll see in production.\n// APPROACH  - Combine Middleware Matcher Configuration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Match all routes except _next/static and public files\n    '/((?!_next/static|_next/image|favicon.ico|public).*)',\n    // Match specific routes\n    '/dashboard/:path*',\n    '/api/:path*',\n    // Exclude file extensions\n    '/((?!.*\\.(?:css|js|jpg|jpeg|png|gif|svg|ico|webp|woff|woff2)).*)',\n    // Match everything except /health and /public\n    '/((?!health|public).*)',"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Middleware Matcher Configuration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n],\n};\n// Matcher can also use has/missing arrays\nexport const config = {\n  matcher: [\n    {\n      source: '/api/:path*',\n      has: [\n        { type: 'header', key: 'X-Admin-Token' },  // only if header exists\n      ],\n    },\n    {\n      source: '/public/:path*',\n      missing: [\n        { type: 'cookie', key: 'session' },  // only if no session cookie\n      ],\n    },\n    {\n      source: '/search',\n      has: [\n        { type: 'query', key: 'q' },  // only if 'q' query param exists\n      ],\n    },\n  ],\n};"
                  }
        ],
        tips: [
                  "Always exclude _next/static, _next/image, favicon.ico to avoid unnecessary middleware execution on static files.",
                  "Use negative lookaheads (?!) to exclude multiple patterns in one entry.",
                  "has/missing conditions allow matching on headers, cookies, or query parameters — useful for feature flags.",
                  "Test your matcher patterns — unintended routes can add latency and cost."
        ],
        mistake: "Using a matcher that includes all static files and images — middleware on static assets adds latency and unnecessary edge compute. Always exclude _next/*, favicon.ico, and known static paths.",
        shorthand: {
          verbose: "export const config = {\n  matcher: [\n    '/((?!_next/static|_next/image|favicon).*)',\n    '/api/:path*',\n  ],\n};",
          concise: "matcher: ['/((?!_next/static|public).*)', '/api/:path*']; use has/missing for conditional matching",
        },
      },
      {
        id: "middleware-geo",
        fn: "Geolocation in Middleware",
        desc: "Use request.geo to access geolocation data and redirect users based on country or region.",
        category: "Middleware",
        subtitle: "request.geo, country-based redirects, localization",
        signature: "const { country, city, region } = request.geo || {}",
        descLong: "The request.geo object (available on Vercel and some other platforms) provides the user's geolocation: country code, city, region, latitude, and longitude. Use it in middleware to redirect users to locale-specific pages, comply with regional regulations, or serve location-specific pricing. This is lightweight and doesn't require client-side APIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Geolocation in Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nexport function middleware(request: NextRequest) {\n  const { pathname } = request.nextUrl;\n  const { country, city, region } = request.geo || {};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Geolocation in Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Geolocation in Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nif (pathname === '/' && country === 'DE') {\n    // Redirect German users to German site\n    return NextResponse.redirect(new URL('/de', request.url));\n  }\n  if (pathname === '/' && country === 'FR') {\n    return NextResponse.redirect(new URL('/fr', request.url));\n  }\n  if (pathname === '/pricing') {\n    const response = NextResponse.rewrite(\n      new URL(`/pricing/${country || 'global'}`, request.url)\n    );\n    response.headers.set('X-Country', country || 'unknown');\n    return response;\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Geolocation in Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nif (['DE', 'FR', 'IT', 'ES', 'GB', 'SE'].includes(country || '')) {\n    const response = NextResponse.next();\n    response.headers.set('X-GDPR-Required', 'true');\n    return response;\n  }\n  const blockedCountries = ['KP']; // North Korea\n  if (blockedCountries.includes(country || '')) {\n    return NextResponse.json(\n      { error: 'Access denied from your region' },\n      { status: 403 }\n    );\n  }\n  return NextResponse.next();\n}\nexport const config = {\n  matcher: ['/', '/pricing', '/api/:path*'],\n};"
                  }
        ],
        tips: [
                  "request.geo only works on Vercel; on other platforms, it's undefined. Provide a fallback.",
                  "Country code is ISO 3166-1 alpha-2 (US, GB, DE, etc.). Store the value in a header or cookie for server components.",
                  "Geolocation is based on IP; VPNs and proxies may show incorrect locations.",
                  "Use geo-based redirects sparingly — users expect to control their language/region preference."
        ],
        mistake: "Assuming request.geo is always available — it's only available on platforms like Vercel. Always provide a fallback or check for undefined.",
        shorthand: {
          verbose: "const country = request.geo?.country;\nif (country === 'DE') {\n  return NextResponse.redirect(new URL('/de', request.url));\n}",
          concise: "const { country } = request.geo || {}; redirect based on country; set header for server components",
        },
      },
      {
        id: "middleware-auth-pattern",
        fn: "Authentication Middleware Pattern",
        desc: "JWT verification and protected routes — verify tokens in middleware, redirect unauthenticated users to login.",
        category: "Middleware",
        subtitle: "JWT verification, token validation, protected routes, login redirects",
        signature: "verifyToken(token) → claims | throw",
        descLong: "Authenticate users at the edge by verifying JWT tokens in middleware. Extract the token from cookies or headers, verify the signature and expiration, then check claims for roles/permissions. If invalid, redirect to login. This pattern protects routes before they hit the server and is fast at the edge.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Authentication Middleware Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nimport { jwtVerify } from 'jose';\nconst JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');\nasync function verifyAuth(token: string) {\n  try {\n    const verified = await jwtVerify(token, JWT_SECRET);\n    return verified.payload;\n  } catch {\n    return null;\n  }\n}\nexport async function middleware(request: NextRequest) {\n  const { pathname } = request.nextUrl;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Authentication Middleware Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Authentication Middleware Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst token =\n    request.cookies.get('auth-token')?.value ||\n    request.headers.get('Authorization')?.replace('Bearer ', '');\n  const publicRoutes = ['/', '/login', '/signup', '/api/auth'];\n  if (publicRoutes.some(route => pathname.startsWith(route))) {\n    return NextResponse.next();\n  }\n  if (!token) {\n    const loginUrl = new URL('/login', request.url);\n    loginUrl.searchParams.set('from', pathname);\n    return NextResponse.redirect(loginUrl);\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Authentication Middleware Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst claims = await verifyAuth(token);\n  if (!claims) {\n    // Token invalid or expired\n    const response = NextResponse.redirect(new URL('/login', request.url));\n    response.cookies.delete('auth-token');\n    return response;\n  }\n  if (pathname.startsWith('/admin') && claims.role !== 'admin') {\n    return NextResponse.redirect(new URL('/unauthorized', request.url));\n  }\n  const response = NextResponse.next();\n  response.headers.set('x-user-id', claims.sub as string);\n  response.headers.set('x-user-role', claims.role as string);\n  return response;\n}\nexport const config = {\n  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/protected/:path*'],\n};"
                  }
        ],
        tips: [
                  "Use jose or jsonwebtoken for JWT verification at the edge.",
                  "Always validate token expiration — don't just verify the signature.",
                  "Pass user claims to server via headers (x-user-id, x-user-role) for server components to use.",
                  "Store tokens in httpOnly cookies to prevent XSS theft."
        ],
        mistake: "Storing sensitive claims in a header that the client can read — headers are returned to the client. Pass claims via internal headers only, or store in the session.",
        shorthand: {
          verbose: "const token = request.cookies.get('auth-token')?.value;\nif (!token) {\n  return NextResponse.redirect(new URL('/login', request.url));\n}\n// verify token...",
          concise: "jwtVerify(token, secret); check claims.role for RBAC; pass user ID via x-user-id header",
        },
      },
      {
        id: "middleware-ab-testing",
        fn: "A/B Testing with Middleware",
        desc: "Stable user bucketing via cookies — assign A/B test variants in middleware and rewrite to variant pages.",
        category: "Middleware",
        subtitle: "A/B test assignment, stable bucketing, variant rewriting, cookie persistence",
        signature: "Math.random() < 0.5 ? \"a\" : \"b\"; NextResponse.rewrite()",
        descLong: "Implement A/B testing at the edge by assigning users to test variants based on cookies. Generate a random variant (control/treatment) on first visit, store it in a cookie, and rewrite to the variant page or API endpoint. The same user always gets the same variant. This pattern is fast, doesn't require database queries, and persists across sessions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of A/B Testing with Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nexport function middleware(request: NextRequest) {\n  const { pathname } = request.nextUrl;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of A/B Testing with Middleware — common patterns you'll see in production.\n// APPROACH  - Combine A/B Testing with Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nif (pathname === '/pricing') {\n    const variant = request.cookies.get('pricing-variant')?.value;\n    if (!variant) {\n      // First visit: assign variant\n      const assigned = Math.random() < 0.5 ? 'control' : 'treatment';\n      const response = NextResponse.rewrite(\n        new URL(`/pricing-${assigned}`, request.url)\n      );\n      // Set cookie for 30 days (stable bucketing)\n      response.cookies.set('pricing-variant', assigned, {\n        maxAge: 60 * 60 * 24 * 30,\n        httpOnly: true,\n        secure: true,\n        path: '/',\n      });\n      return response;\n    }\n    // Returning user: use stored variant\n    return NextResponse.rewrite(new URL(`/pricing-${variant}`, request.url));\n  }\n  if (pathname === '/') {\n    const heroVariant = request.cookies.get('hero-variant')?.value;\n    if (!heroVariant) {\n      const variants = ['classic', 'bold', 'minimal'];\n      const assigned = variants[Math.floor(Math.random() * variants.length)];\n      const response = NextResponse.next();\n      response.cookies.set('hero-variant', assigned, {\n        maxAge: 60 * 60 * 24 * 90, // 90 days\n      });\n      response.headers.set('x-hero-variant', assigned);\n      return response;\n    }\n    const response = NextResponse.next();\n    response.headers.set('x-hero-variant', heroVariant);\n    return response;\n  }\n  return NextResponse.next();\n}\nexport const config = {\n  matcher: ['/', '/pricing'],\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of A/B Testing with Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// app/page.tsx\nimport { headers } from 'next/headers';\nexport default function Home() {\n  const headersList = headers();\n  const heroVariant = headersList.get('x-hero-variant') || 'classic';\n  return (\n    <div>\n      {heroVariant === 'classic' && <ClassicHero />}\n      {heroVariant === 'bold' && <BoldHero />}\n      {heroVariant === 'minimal' && <MinimalHero />}\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Set httpOnly: true to prevent JavaScript from reading the variant (XSS protection).",
                  "Use a long maxAge (30+ days) so users don't switch variants mid-experiment.",
                  "Pass variant via header to server components — they can't read cookies.",
                  "Log variant in analytics to track which variant each user sees."
        ],
        mistake: "Using a random number generator on every request — use cookies for stable bucketing. Without a cookie, the same user sees different variants on each page load.",
        shorthand: {
          verbose: "const variant = Math.random() < 0.5 ? 'a' : 'b';\nresponse.cookies.set('variant', variant, { maxAge: 30 * 24 * 60 * 60 });\nreturn NextResponse.rewrite(new URL(`/page-${variant}`, request.url));",
          concise: "Math.random() for initial bucketing; store in httpOnly cookie; rewrite to /route-${variant}; set header for server",
        },
      },
      {
        id: "middleware-edge-runtime",
        fn: "Edge Runtime Constraints & APIs",
        desc: "Edge Runtime limitations — no Node.js APIs, available globals, waitUntil, and performance trade-offs.",
        category: "Runtime",
        subtitle: "V8 isolates, available APIs, waitUntil, performance, cold starts",
        signature: "export const runtime = \"edge\"; // or omit for Node",
        descLong: "Edge Runtime runs in V8 isolates at CDN locations (~50ms cold start). No Node.js APIs (fs, child_process, native modules). Available: fetch, crypto, TextEncoder, Streams, structuredClone, waitUntil(). Use edge for lightweight, latency-sensitive operations: auth checks, redirects, A/B tests, rate limiting. Use Node for database queries, heavy computation, file system access.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Edge Runtime Constraints & APIs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts or app/api/route.ts\nimport { NextRequest, NextResponse } from 'next/server';\nexport const runtime = 'edge'; // explicit opt-in for API routes\nexport async function GET(request: NextRequest) {"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Edge Runtime Constraints & APIs — common patterns you'll see in production.\n// APPROACH  - Combine Edge Runtime Constraints & APIs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst response = await fetch('https://api.example.com/data');\n  const data = await response.json();\n  const encoder = new TextEncoder();\n  const encoded = encoder.encode('hello');\n  const hash = await crypto.subtle.digest('SHA-256', encoded);\n  const cloned = structuredClone(data);\n  // import fs from 'fs'; // ❌ Error\n  // child_process.exec(); // ❌ Error"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Edge Runtime Constraints & APIs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Useful for analytics, cleanup, non-critical operations\n  await waitUntil(\n    fetch('/api/log', {\n      method: 'POST',\n      body: JSON.stringify({ event: 'api_call' }),\n    })\n  );\n  return NextResponse.json({ data });\n}\n// app/api/heavy/route.ts\nimport fs from 'fs';\nimport { prisma } from '@/db';\n// No explicit runtime export = Node.js runtime\nexport async function GET() {\n  const file = fs.readFileSync('./data.json', 'utf-8');\n  const users = await prisma.user.findMany();\n  return Response.json({ file, users });\n}\n// EDGE: lightweight, fast, global latency\n// - Auth checks\n// - Redirects\n// - A/B test assignment\n// - Simple transformations\n// - Rate limiting\n// NODE: full feature set, slower cold start\n// - Database queries\n// - File system access\n// - Complex computation\n// - Image processing\n// - Email sending"
                  }
        ],
        tips: [
                  "Edge cold starts ~50ms, Node ~250ms. Use edge for auth/redirects, Node for data operations.",
                  "Edge 1MB code size limit — tree-shake dependencies.",
                  "waitUntil() lets you log/cleanup asynchronously without blocking the response.",
                  "request.body can only be read once in edge — buffer before passing to functions."
        ],
        mistake: "Trying to use Node.js APIs (fs, Prisma, native modules) in edge middleware — they're not available. Move heavy logic to Node.js API routes.",
        shorthand: {
          verbose: "// Manual / verbose approach\nexport const runtime = 'edge';\n// Try to use fs, prisma, etc → FAILS\n// More explicit but longer",
          concise: "runtime='edge': fetch, crypto, no fs/modules; ~50ms cold start. runtime='nodejs': full Node.js, ~250ms cold start",
        },
      },
      {
        id: "middleware-rewrite",
        fn: "URL Rewrites in Middleware",
        desc: "Internal URL rewrites — NextResponse.rewrite() for feature flags, proxying, and transparent routing.",
        category: "Middleware",
        subtitle: "NextResponse.rewrite(), feature flags, proxying, path mapping",
        signature: "NextResponse.rewrite(new URL(path, request.url))",
        descLong: "Rewriting changes the server-side path without changing the browser URL. Perfect for feature flags (route to different implementations), proxying (serve /api/* from an external API), or transparent path mapping. Unlike redirects, rewrites are invisible to the user and don't trigger a new navigation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of URL Rewrites in Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nexport function middleware(request: NextRequest) {\n  const { pathname } = request.nextUrl;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of URL Rewrites in Middleware — common patterns you'll see in production.\n// APPROACH  - Combine URL Rewrites in Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst useNewCheckout = request.cookies.get('enable-new-checkout')?.value === 'true';\n  if (pathname === '/checkout') {\n    if (useNewCheckout) {\n      return NextResponse.rewrite(new URL('/checkout-v2', request.url));\n    }\n    return NextResponse.rewrite(new URL('/checkout-v1', request.url));\n  }\n  const variant = request.cookies.get('test-variant')?.value || 'control';\n  if (pathname === '/landing') {\n    return NextResponse.rewrite(\n      new URL(`/landing/${variant}`, request.url)\n    );\n  }\n  // Rewrite /api/* to external service\n  if (pathname.startsWith('/api/external/')) {\n    const externalPath = pathname.replace('/api/external', '');\n    return NextResponse.rewrite(\n      new URL(`${process.env.EXTERNAL_API_URL}${externalPath}`, request.url),\n      {\n        request: {\n          headers: new Headers(request.headers),\n        },\n      }\n    );\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of URL Rewrites in Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nif (pathname === '/old-page') {\n    return NextResponse.rewrite(new URL('/new-page', request.url));\n  }\n  const country = request.geo?.country || 'US';\n  if (pathname === '/' && country !== 'US') {\n    return NextResponse.rewrite(new URL(`/${country.toLowerCase()}`, request.url));\n  }\n  return NextResponse.next();\n}\nexport const config = {\n  matcher: ['/checkout', '/landing', '/api/external/:path*', '/old-page', '/'],\n};\n// pages/checkout-v2.tsx\nexport default function CheckoutV2() {\n  // window.location.pathname would show '/checkout', not '/checkout-v2'\n  return <div>New checkout experience</div>;\n}"
                  }
        ],
        tips: [
                  "Rewrites are invisible — the browser URL doesn't change. Perfect for A/B tests and feature flags.",
                  "Rewrite external APIs carefully — ensure headers (Auth, CORS) are handled correctly.",
                  "Unlike redirects, rewrites don't create a new HTTP request from the browser — faster, no double-request cost.",
                  "Combine with feature flags (cookies or env) to gradually roll out new implementations."
        ],
        mistake: "Using NextResponse.redirect() for internal path mapping — redirects cause a second request and change the URL. Use rewrite() to keep URLs clean.",
        shorthand: {
          verbose: "if (useNewFeature) {\n  return NextResponse.redirect(new URL('/new', request.url)); // user sees /new\n}",
          concise: "NextResponse.rewrite(new URL('/internal-path', request.url)); URL unchanged; for feature flags & A/B tests",
        },
      },
      {
        id: "middleware-response-headers",
        fn: "Setting Response Headers in Middleware",
        desc: "Add security headers, caching headers, and custom headers — CSP, HSTS, Cache-Control at the edge.",
        category: "Middleware",
        subtitle: "response.headers.set(), CSP, HSTS, caching, custom headers",
        signature: "response.headers.set(key, value)",
        descLong: "Middleware can set response headers that are sent to the client. Use this for security headers (CSP, HSTS, X-Frame-Options), caching directives (Cache-Control, ETag), and custom headers. Setting headers in middleware ensures they apply globally without editing next.config.js.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Setting Response Headers in Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nexport function middleware(request: NextRequest) {\n  const response = NextResponse.next();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Setting Response Headers in Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Setting Response Headers in Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nresponse.headers.set('X-Content-Type-Options', 'nosniff');\n  response.headers.set('X-Frame-Options', 'DENY');\n  response.headers.set('X-XSS-Protection', '1; mode=block');\n  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');\n  response.headers.set(\n    'Content-Security-Policy',\n    \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https:\"\n  );\n  response.headers.set(\n    'Strict-Transport-Security',\n    'max-age=31536000; includeSubDomains; preload'\n  );"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Setting Response Headers in Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nresponse.headers.set(\n    'Permissions-Policy',\n    'geolocation=(), microphone=(), camera=(), payment=()'\n  );\n  const { pathname } = request.nextUrl;\n  if (pathname.startsWith('/api/public/')) {\n    response.headers.set(\n      'Cache-Control',\n      'public, s-maxage=3600, stale-while-revalidate=86400'\n    );\n  }\n  if (pathname.startsWith('/api/private/')) {\n    response.headers.set(\n      'Cache-Control',\n      'private, max-age=300, must-revalidate'\n    );\n  }\n  response.headers.set('X-App-Version', '1.0.0');\n  response.headers.set('X-Request-Id', crypto.randomUUID());\n  response.headers.set('X-Powered-By', 'Next.js');\n  return response;\n}\nexport const config = {\n  matcher: ['/((?!_next/static|_next/image|favicon).*)', '/api/:path*'],\n};"
                  }
        ],
        tips: [
                  "CSP with unsafe-inline defeats XSS protection. Use nonces for inline scripts instead.",
                  "HSTS with preload makes your site harder to intercept — use it if you control all subdomains.",
                  "s-maxage (shared cache) is for CDN/proxy caches; max-age is for browser cache.",
                  "Set X-Request-Id to trace requests through logs and debugging."
        ],
        mistake: "Setting conflicting Cache-Control headers — middleware headers + next.config.js headers can conflict. Choose one place to set caching rules.",
        shorthand: {
          verbose: "response.headers.set('X-Frame-Options', 'DENY');\nresponse.headers.set('Content-Security-Policy', '...');\nresponse.headers.set('Strict-Transport-Security', '...');",
          concise: "response.headers.set(key, value); CSP, HSTS, X-Frame-Options, Cache-Control; s-maxage for CDN caching",
        },
      },
      {
        id: "middleware-rate-limit",
        fn: "Rate Limiting in Middleware",
        desc: "Rate limiting at the edge — sliding window, Upstash Redis, returning 429 status.",
        category: "Middleware",
        subtitle: "sliding window, token bucket, Upstash Redis, rate limit headers",
        signature: "rate limit check → 429 if exceeded",
        descLong: "Implement rate limiting in middleware to protect APIs from abuse. Use a sliding window algorithm (count requests in the last N seconds) or token bucket. For distributed systems, use Upstash Redis at the edge. Return HTTP 429 (Too Many Requests) with Retry-After header when limit is exceeded.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Rate Limiting in Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nimport { Redis } from '@upstash/redis';\nexport const runtime = 'edge';\nconst redis = new Redis({\n  url: process.env.UPSTASH_REDIS_REST_URL,\n  token: process.env.UPSTASH_REDIS_REST_TOKEN,\n});\nconst RATE_LIMIT = 60; // requests\nconst WINDOW_MS = 60 * 1000; // 1 minute\nasync function rateLimit(identifier: string) {\n  const key = `ratelimit:${identifier}`;\n  const current = await redis.incr(key);\n  if (current === 1) {\n    await redis.expire(key, Math.ceil(WINDOW_MS / 1000));\n  }\n  return current;\n}\nexport async function middleware(request: NextRequest) {\n  const { pathname } = request.nextUrl;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Rate Limiting in Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Rate Limiting in Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nif (pathname.startsWith('/api/')) {\n    // Identifier: IP + user ID (if authenticated)\n    const ip = request.ip || 'unknown';\n    const identifier = ip;\n    const count = await rateLimit(identifier);\n    if (count > RATE_LIMIT) {\n      return NextResponse.json(\n        { error: 'Too many requests. Please retry after a minute.' },\n        {\n          status: 429,\n          headers: {\n            'Retry-After': '60',\n            'X-RateLimit-Limit': String(RATE_LIMIT),\n            'X-RateLimit-Remaining': '0',\n            'X-RateLimit-Reset': String(Date.now() + WINDOW_MS),\n          },\n        }\n      );\n    }\n    // Request allowed — include rate limit info\n    const response = NextResponse.next();\n    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT));\n    response.headers.set('X-RateLimit-Remaining', String(RATE_LIMIT - count));\n    return response;\n  }\n  return NextResponse.next();\n}\nexport const config = {\n  matcher: ['/api/:path*'],\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Rate Limiting in Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst rateLimitMap = new Map<\n  string,\n  { count: number; resetTime: number }\n>();\nfunction simpleRateLimit(identifier: string): boolean {\n  const now = Date.now();\n  const window = 60_000; // 1 minute\n  const limit = 100;\n  const current = rateLimitMap.get(identifier);\n  if (current && now < current.resetTime) {\n    if (current.count >= limit) return false;\n    current.count++;\n  } else {\n    rateLimitMap.set(identifier, { count: 1, resetTime: now + window });\n  }\n  return true;\n}"
                  }
        ],
        tips: [
                  "Use Upstash Redis for distributed rate limiting across multiple edge locations.",
                  "Include X-RateLimit-* headers so clients know their remaining quota.",
                  "Rate limit by IP for public APIs, by user ID for authenticated APIs.",
                  "Use sliding window (increment count in Redis) rather than fixed windows for smoother rate limiting."
        ],
        mistake: "Using in-memory rate limiting in distributed systems — each edge location has its own Map. Use Upstash Redis for consistent limits.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst count = await redis.incr(`ratelimit:${ip}`);\nif (count > LIMIT) return 429;\n// More explicit but longer",
          concise: "Upstash Redis for distributed limit; increment key, expire after window; return 429 with Retry-After header",
        },
      },
      {
        id: "middleware-i18n",
        fn: "Internationalization Middleware",
        desc: "Locale detection and routing — Accept-Language header, cookies, and locale-specific content.",
        category: "Middleware",
        subtitle: "locale detection, Accept-Language, cookie preference, language routing",
        signature: "request.headers.get(\"Accept-Language\") || cookie",
        descLong: "Detect the user's preferred language from the Accept-Language header or a stored cookie. Route to locale-specific pages (e.g., /de for German, /fr for French). Store the user's preference in a cookie to persist across sessions. Support both explicit locale paths and content negotiation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Internationalization Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nconst SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es', 'it'];\nconst DEFAULT_LOCALE = 'en';\nfunction parseAcceptLanguage(header: string): string[] {\n  return header\n    .split(',')\n    .map(lang => lang.split(';')[0].trim().split('-')[0].toLowerCase())\n    .filter(lang => SUPPORTED_LOCALES.includes(lang));\n}\nexport function middleware(request: NextRequest) {\n  const { pathname } = request.nextUrl;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Internationalization Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Internationalization Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst localeMatch = pathname.match(/^\\/([a-z]{2})/);\n  if (localeMatch && SUPPORTED_LOCALES.includes(localeMatch[1])) {\n    return NextResponse.next();\n  }\n  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;\n  const acceptLanguage = request.headers.get('Accept-Language') || '';\n  const acceptedLocales = parseAcceptLanguage(acceptLanguage);\n  const preferredLocale = cookieLocale || acceptedLocales[0] || DEFAULT_LOCALE;\n  const url = new URL(`/${preferredLocale}${pathname}`, request.url);\n  const response = NextResponse.redirect(url);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Internationalization Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nif (!cookieLocale) {\n    response.cookies.set('NEXT_LOCALE', preferredLocale, {\n      maxAge: 60 * 60 * 24 * 365, // 1 year\n      path: '/',\n    });\n  }\n  return response;\n}\nexport const config = {\n  // Exclude static files and api\n  matcher: ['/((?!api|_next/static|_next/image|favicon).*)', '/'],\n};\n// app/[locale]/layout.tsx\nimport { notFound } from 'next/navigation';\nconst LOCALES = ['en', 'de', 'fr', 'es', 'it'];\nexport default function LocaleLayout({\n  children,\n  params,\n}: {\n  children: React.ReactNode;\n  params: { locale: string };\n}) {\n  if (!LOCALES.includes(params.locale)) {\n    notFound();\n  }\n  return (\n    <html lang={params.locale}>\n      <body>{children}</body>\n    </html>\n  );\n}\n// app/[locale]/page.tsx\nimport { getDictionary } from '@/lib/i18n';\nexport default async function Home({\n  params: { locale },\n}: {\n  params: { locale: string };\n}) {\n  const t = await getDictionary(locale);\n  return <h1>{t.home.title}</h1>;\n}"
                  }
        ],
        tips: [
                  "Store locale preference in a cookie so users don't get re-routed on every request.",
                  "Parse Accept-Language carefully — it includes quality values (e.g., en-US;q=0.9).",
                  "Consider adding a language selector UI so users can manually switch locales.",
                  "Use dynamic imports for translations: const t = await import(`@/locales/${locale}.json`)"
        ],
        mistake: "Redirecting on every request based on Accept-Language without checking cookies — causes infinite redirects or poor UX. Cache the preference in a cookie.",
        shorthand: {
          verbose: "const locale = request.headers.get('Accept-Language')?.split(',')[0];\nif (!pathname.startsWith(`/${locale}`)) {\n  return NextResponse.redirect(...);\n}",
          concise: "cookie or Accept-Language for locale; redirect to /${locale}/...; use [locale] dynamic routes",
        },
      },
      {
        id: "middleware-logging",
        fn: "Request Logging in Middleware",
        desc: "Structured logging and correlation IDs — track requests through the stack with context propagation.",
        category: "Middleware",
        subtitle: "structured logs, correlation IDs, context headers, request tracking",
        signature: "const requestId = crypto.randomUUID(); log({ requestId, ... })",
        descLong: "Add structured logging to middleware to track request paths, status codes, and latency. Generate a correlation ID for each request and pass it through headers so server components, API routes, and external services can reference the same request. Essential for debugging production issues.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Request Logging in Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { NextRequest, NextResponse } from 'next/server';\nexport function middleware(request: NextRequest) {\n  const startTime = Date.now();\n  const requestId = crypto.randomUUID();\n  const { pathname, search } = request.nextUrl;\n  const method = request.method;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Request Logging in Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Request Logging in Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst requestLog = {\n    timestamp: new Date().toISOString(),\n    requestId,\n    method,\n    pathname,\n    query: search,\n    ip: request.ip,\n    userAgent: request.headers.get('user-agent'),\n  };\n  console.log('[REQUEST]', JSON.stringify(requestLog));\n  let response = NextResponse.next();\n  response.headers.set('X-Request-Id', requestId);\n  response.headers.set('X-Request-Timestamp', String(startTime));\n  // so server components can access it\n  const requestHeaders = new Headers(request.headers);\n  requestHeaders.set('X-Request-Id', requestId);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Request Logging in Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst endTime = Date.now();\n  const duration = endTime - startTime;\n  const responseLog = {\n    timestamp: new Date().toISOString(),\n    requestId,\n    duration: `${duration}ms`,\n    status: response.status,\n    method,\n    pathname,\n  };\n  console.log('[RESPONSE]', JSON.stringify(responseLog));\n  if (duration > 1000) {\n    console.warn('[SLOW_REQUEST]', JSON.stringify({ requestId, duration }));\n  }\n  return response;\n}\nexport const config = {\n  matcher: ['/((?!_next/static|_next/image|favicon).*)', '/api/:path*'],\n};\n// app/page.tsx\nimport { headers } from 'next/headers';\nexport default function Home() {\n  const headersList = headers();\n  const requestId = headersList.get('X-Request-Id') || 'unknown';\n  console.log('[HOME_COMPONENT]', { requestId });\n  return <div>Home page (request: {requestId})</div>;\n}\n// app/api/data/route.ts\nexport async function GET(request: Request) {\n  const requestId = request.headers.get('X-Request-Id') || 'unknown';\n  console.log('[API_DATA]', { requestId, timestamp: new Date().toISOString() });\n  return Response.json({ data: [], requestId });\n}"
                  }
        ],
        tips: [
                  "Structured logging (JSON) makes it easier to search and aggregate logs in systems like DataDog, CloudWatch, Splunk.",
                  "Pass correlation ID via X-Request-Id header to all downstream services (databases, external APIs).",
                  "Log duration to identify slow requests — anything over 1s in middleware is usually a problem.",
                  "Use crypto.randomUUID() for strong correlation IDs instead of incrementing counters."
        ],
        mistake: "Logging without correlation IDs — when issues occur, you can't trace a single user request through all layers. Always generate and propagate a requestId.",
        shorthand: {
          verbose: "const id = crypto.randomUUID();\nconsole.log({ id, pathname, method });\nresponse.headers.set('X-Request-Id', id);",
          concise: "crypto.randomUUID() for requestId; log in middleware; set X-Request-Id header; propagate to server & API routes",
        },
      },
      {
        id: "isr-tracing",
        fn: "ISR, On-Demand Revalidation & OpenTelemetry",
        desc: "Incremental Static Regeneration patterns, on-demand revalidation via webhooks, and distributed tracing with OpenTelemetry.",
        category: "Advanced",
        subtitle: "revalidate, revalidatePath, revalidateTag, ISR, OpenTelemetry, edge vs Node runtime",
        signature: "revalidatePath(\"/blog\")  |  revalidateTag(\"posts\")  |  { next: { revalidate: 60 } }",
        descLong: "ISR regenerates static pages in the background after a configurable time. Time-based: set revalidate in fetch() or route segment config. On-demand: call revalidatePath() or revalidateTag() from API routes or Server Actions when content changes (CMS webhook, database update). Tag-based revalidation is more granular — tag fetches and invalidate by tag. Edge Runtime runs middleware and route handlers in V8 isolates (fast cold start, limited APIs). Node Runtime has full Node.js access. OpenTelemetry instruments Next.js for distributed tracing across services.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ISR, On-Demand Revalidation & OpenTelemetry — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/blog/[slug]/page.tsx\nexport const revalidate = 3600; // revalidate every hour\nasync function BlogPost({ params }: { params: { slug: string } }) {\n  const post = await fetch(\n    `https://cms.example.com/posts/${params.slug}`,\n    { next: { revalidate: 3600 } }  // or per-fetch\n  ).then(r => r.json());\n  return <article>{post.content}</article>;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ISR, On-Demand Revalidation & OpenTelemetry — common patterns you'll see in production.\n// APPROACH  - Combine ISR, On-Demand Revalidation & OpenTelemetry with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Tag your fetches\nasync function getPosts() {\n  return fetch('https://cms.example.com/posts', {\n    next: { tags: ['posts'] },        // tag this fetch\n  }).then(r => r.json());\n}\nasync function getPost(slug: string) {\n  return fetch(`https://cms.example.com/posts/${slug}`, {\n    next: { tags: ['posts', `post-${slug}`] },\n  }).then(r => r.json());\n}\n// app/api/revalidate/route.ts\nimport { revalidatePath, revalidateTag } from 'next/cache';\nexport async function POST(request: Request) {\n  const secret = request.headers.get('x-webhook-secret');\n  if (secret !== process.env.WEBHOOK_SECRET) {\n    return Response.json({ error: 'Unauthorized' }, { status: 401 });\n  }\n  const { type, slug } = await request.json();\n  if (type === 'post_updated') {\n    revalidateTag(`post-${slug}`);   // invalidate specific post\n    revalidateTag('posts');             // invalidate post list\n    revalidatePath('/blog');            // regenerate blog index\n  }\n  if (type === 'settings_changed') {\n    revalidatePath('/', 'layout');     // revalidate entire site\n  }\n  return Response.json({ revalidated: true });\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ISR, On-Demand Revalidation & OpenTelemetry — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Edge Runtime: fast cold start, limited APIs\n// app/api/fast/route.ts\nexport const runtime = 'edge';\nexport async function GET(request: Request) {\n  // No fs, no native modules, limited crypto\n  // Good for: simple transforms, auth checks, redirects\n  return Response.json({ timestamp: Date.now() });\n}\n// Node Runtime: full Node.js access (default)\n// app/api/heavy/route.ts\nexport const runtime = 'nodejs';\nexport async function GET() {\n  // Full access: fs, streams, native modules, ORM\n  const data = await prisma.user.findMany();\n  return Response.json(data);\n}\n// next.config.js\n// module.exports = {\n//   experimental: {\n//     instrumentationHook: true,\n//   },\n// };\n// instrumentation.ts\n// export async function register() {\n//   if (process.env.NEXT_RUNTIME === 'nodejs') {\n//     const { NodeSDK } = await import('@opentelemetry/sdk-node');\n//     const { OTLPTraceExporter } = await import(\n//       '@opentelemetry/exporter-trace-otlp-http'\n//     );\n//     const sdk = new NodeSDK({\n//       traceExporter: new OTLPTraceExporter({\n//         url: process.env.OTEL_ENDPOINT || 'http://localhost:4318/v1/traces',\n//       }),\n//       serviceName: 'my-nextjs-app',\n//     });\n//     sdk.start();\n//   }\n// }"
                  }
        ],
        tips: [
                  "revalidateTag() is more precise than revalidatePath() — tag individual fetches and invalidate only what changed.",
                  "On-demand revalidation via CMS webhooks gives you static performance with dynamic content — the best of both worlds.",
                  "Edge Runtime has ~0ms cold start but no Node.js APIs (no fs, no native modules). Use it for lightweight API routes only.",
                  "OpenTelemetry in Next.js traces across server components, API routes, and external services — essential for debugging production."
        ],
        mistake: "Setting revalidate: 0 thinking it means \"always fresh\" — revalidate: 0 opts out of caching entirely. Use revalidate: 1 for near-real-time with caching benefits, or on-demand revalidation for instant updates.",
        shorthand: {
          verbose: "// In page.tsx\nexport const revalidate = 3600;\nconst data = await fetch(url).then(r => r.json());",
          concise: "export const revalidate = 60; tag fetches with { next: { tags: ['posts'] } }; POST /api/revalidate with revalidateTag()",
        },
      },
    ],
  },
]

export default { meta, sections }
