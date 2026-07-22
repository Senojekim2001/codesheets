export const meta = {
  "title": "Authentication & Security",
  "domain": "nextjs",
  "sheet": "auth",
  "icon": "🔐"
}

export const sections = [

  // ── Section 1: Authentication Strategies ─────────────────────────────────────────
  {
    id: "auth-strategies",
    title: "Authentication Strategies",
    entries: [
      {
        id: "nextauth-setup",
        fn: "NextAuth.js v5 Setup",
        desc: "Configure NextAuth.js with providers (Google, GitHub, credentials), session storage, and callbacks.",
        category: "Authentication",
        subtitle: "Complete authentication solution",
        signature: "auth.ts + route.ts + middleware.ts",
        descLong: "NextAuth.js v5 provides OAuth, credential, and passwordless authentication. Configure providers (Google, GitHub, email), storage (database sessions or JWT), and callbacks. Works seamlessly with Next.js App Router middleware for protected routes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of NextAuth.js v5 Setup — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// auth.ts\nimport NextAuth from 'next-auth';\nimport GitHub from 'next-auth/providers/github';\nimport Credentials from 'next-auth/providers/credentials';\nimport { PrismaAdapter } from '@auth/prisma-adapter';\nimport { db } from './db';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of NextAuth.js v5 Setup — common patterns you'll see in production.\n// APPROACH  - Combine NextAuth.js v5 Setup with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport const { handlers, auth, signIn, signOut } = NextAuth({\n  adapter: PrismaAdapter(db),\n  providers: [\n    GitHub({\n      clientId: process.env.GITHUB_ID,\n      clientSecret: process.env.GITHUB_SECRET,\n    }),\n    Credentials({\n      credentials: {\n        email: { label: 'Email', type: 'email' },\n        password: { label: 'Password', type: 'password' },\n      },\n      async authorize(credentials) {\n        const user = await db.user.findUnique({\n          where: { email: credentials.email as string },\n        });\n        if (!user) return null;\n        const isValid = await verify(credentials.password as string, user.password);\n        return isValid ? user : null;\n      },\n    }),\n  ],\n  pages: {\n    signIn: '/login',\n    error: '/auth/error',\n  },\n  callbacks: {\n    authorized: async ({ auth }) => !!auth,  // Run in middleware\n    jwt: async ({ token, user }) => {\n      if (user) {\n        token.role = user.role;\n      }\n      return token;\n    },\n    session: async ({ session, token }) => {\n      session.user.role = token.role;\n      return session;\n    },\n  },\n  session: {\n    strategy: 'database',  // or 'jwt'\n  },\n});\n// app/api/auth/[...nextauth]/route.ts\nimport { handlers } from '@/auth';\nexport const { GET, POST } = handlers;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of NextAuth.js v5 Setup — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// middleware.ts\nimport { auth } from '@/auth';\nexport default auth((req) => {\n  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {\n    const newUrl = new URL('/login', req.nextUrl.origin);\n    return Response.redirect(newUrl);\n  }\n});\nexport const config = {\n  matcher: ['/dashboard/:path*', '/admin/:path*'],\n};"
                  }
        ],
        tips: [
                  "Use PrismaAdapter for database sessions or JWT strategy for stateless auth.",
                  "GitHub/Google providers don't require passwords; Credentials does.",
                  "Callbacks let you control token claims, session data, and authorization.",
                  "authorized callback runs in middleware — use for protecting routes."
        ],
        mistake: "Storing secrets in .env without NEXTAUTH_SECRET — NextAuth requires a secret for JWT signing.",
        shorthand: {
          verbose: "// Manual auth setup\nexport async function getServerSideProps(ctx) {\n  const token = ctx.req.cookies.authToken;\n  if (!token) return { redirect: { destination: '/login' } };\n  return { props: { auth: true } };\n}",
          concise: "export const { handlers, auth, signIn, signOut } = NextAuth({\n  providers: [GitHub()],\n  adapter: PrismaAdapter(db),\n  callbacks: { authorized: ({ auth }) => !!auth },\n})",
        },
      },
      {
        id: "protected-routes-middleware",
        fn: "Protected Routes with Middleware",
        desc: "Use middleware to check auth status before serving pages. Redirect unauthenticated users to login.",
        category: "Authorization",
        subtitle: "Edge-level authentication checks",
        signature: "export default auth((req) => { ... })",
        descLong: "NextAuth.js middleware runs at the edge before pages load. Check req.auth to see if the user is authenticated. Redirect unauthenticated users to the login page. You can also check roles, permissions, or custom claims in the token.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Protected Routes with Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { auth } from '@/auth';\nimport { NextRequest, NextResponse } from 'next/server';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Protected Routes with Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Protected Routes with Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// middleware.ts\nexport default auth(async (req: NextRequest) => {\n  const pathname = req.nextUrl.pathname;\n  const isAuth = !!req.auth;\n  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');\n  // Redirect authenticated users away from auth pages\n  if (isAuth && isAuthPage) {\n    return NextResponse.redirect(new URL('/dashboard', req.url));\n  }\n  // Redirect unauthenticated users to login for protected routes\n  if (!isAuth && !isAuthPage && pathname.startsWith('/dashboard')) {\n    return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url));\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Protected Routes with Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Admin routes require role\n  if (pathname.startsWith('/admin') && req.auth?.user?.role !== 'admin') {\n    return NextResponse.redirect(new URL('/unauthorized', req.url));\n  }\n  // Allow the request\n  return NextResponse.next();\n});\nexport const config = {\n  matcher: [\n    '/dashboard/:path*',\n    '/admin/:path*',\n    '/login',\n    '/signup',\n  ],\n};"
                  }
        ],
        tips: [
                  "req.auth contains the user session if authenticated.",
                  "req.auth.user has email, name, image, and custom fields from callbacks.",
                  "Middleware runs at the edge — fast redirects without hitting the server.",
                  "Combine role checks (req.auth.user.role) for granular authorization."
        ],
        mistake: "Only protecting pages with Server Components instead of middleware — users still navigate there before redirect. Use middleware for edge-level protection.",
        shorthand: {
          verbose: "// Page-level protection\nexport default function Protected() {\n  const session = useSession();\n  if (!session) return <Redirect />;  // Late redirect\n}",
          concise: "// Middleware-level protection (immediate)\nexport default auth(req => {\n  if (!req.auth && req.nextUrl.pathname === '/dashboard') {\n    return NextResponse.redirect('/login');\n  }\n})",
        },
      },
      {
        id: "session-access",
        fn: "Accessing Session in Components",
        desc: "Use useSession() hook in Client Components or getSession() in Server Components.",
        category: "Authorization",
        subtitle: "Reading auth state in components",
        signature: "useSession()  |  getSession()",
        descLong: "Client Components use the useSession() hook to read the session reactively. Server Components use getSession() or the auth() function. Always check if the session exists before using it. Session data includes the user object and any custom fields from callbacks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Accessing Session in Components — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { auth } from '@/auth';\nimport { redirect } from 'next/navigation';\nimport { useSession } from 'next-auth/react';\nimport { signOut } from '@/auth';\nimport { SessionProvider } from 'next-auth/react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Accessing Session in Components — common patterns you'll see in production.\n// APPROACH  - Combine Accessing Session in Components with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// app/dashboard/page.tsx — Server Component\nexport default async function Dashboard() {\n  const session = await auth();\n  if (!session?.user) {\n    redirect('/login');\n  }\n  return (\n    <div>\n      <h1>Welcome, {session.user.name}</h1>\n      <p>Email: {session.user.email}</p>\n      <p>Role: {session.user.role}</p>\n    </div>\n  );\n}\n// app/components/user-menu.tsx — Client Component\n'use client';\nexport function UserMenu() {\n  const { data: session, status } = useSession();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Accessing Session in Components — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nif (status === 'loading') return <p>Loading...</p>;\n  if (!session) return <a href=\"/login\">Sign In</a>;\n  return (\n    <div className=\"user-menu\">\n      <img src={session.user.image} alt=\"\" />\n      <p>{session.user.name}</p>\n      <form action={async () => { await signOut(); }}>\n        <button type=\"submit\">Sign Out</button>\n      </form>\n    </div>\n  );\n}\n// Wrap Client Components in SessionProvider\n// app/layout.tsx\nexport default function RootLayout({ children }) {\n  return (\n    <html>\n      <body>\n        <SessionProvider>\n          {children}\n        </SessionProvider>\n      </body>\n    </html>\n  );\n}"
                  }
        ],
        tips: [
                  "Wrap the app in SessionProvider in the root layout for useSession() to work.",
                  "useSession() is reactive — component re-renders when session changes.",
                  "getSession() in Server Components is simple but doesn't work in nested layouts.",
                  "Use auth() function in Server Components for the most reliable session access."
        ],
        mistake: "Using useSession() in Server Components — it's a hook and requires \"use client\". Use auth() or getSession() instead.",
        shorthand: {
          verbose: "// Manual session check\nexport default async function Page() {\n  const token = cookies().get('auth');\n  if (!token) throw new Error('Not auth');\n}",
          concise: "// NextAuth session check\nexport default async function Page() {\n  const session = await auth();\n  if (!session) redirect('/login');\n}",
        },
      },
    ],
  },

  // ── Section 2: Security & Best Practices ─────────────────────────────────────────
  {
    id: "security-patterns",
    title: "Security & Best Practices",
    entries: [
      {
        id: "csrf-protection",
        fn: "CSRF Protection",
        desc: "Next.js and NextAuth.js automatically handle CSRF tokens. Ensure forms use Server Actions.",
        category: "Security",
        subtitle: "Cross-Site Request Forgery prevention",
        signature: "<form action={serverAction}> (automatic)",
        descLong: "Server Actions and forms automatically include CSRF tokens. Mutations via forms or Server Actions are protected by default. External API calls must manually include tokens if needed. Never disable CSRF protection unless you have a very specific reason.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSRF Protection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// PROTECTED: Form with Server Action (automatic CSRF)\n'use client';\nimport { createPost } from '@/app/actions';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSRF Protection — common patterns you'll see in production.\n// APPROACH  - Combine CSRF Protection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport function CreatePostForm() {\n  return (\n    <form action={createPost}>\n      <input name=\"title\" required />\n      <input name=\"content\" required />\n      <button type=\"submit\">Create</button>\n    </form>\n  );\n}\n// PROTECTED: Server Action (receives CSRF token automatically)\n'use server';\nexport async function createPost(formData: FormData) {\n  const title = formData.get('title');\n  const content = formData.get('content');\n  await db.post.create({ data: { title, content } });\n  revalidatePath('/posts');\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSRF Protection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// UNPROTECTED: Raw fetch (must handle CSRF manually)\n// In a real app, avoid this — use forms/Server Actions instead\nasync function fetchAPI() {\n  const response = await fetch('/api/posts', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ title: 'Test' }),\n    // Browser automatically includes cookies; CSRF token not needed\n    // for same-origin requests with proper SameSite cookie settings\n  });\n}"
                  }
        ],
        tips: [
                  "Server Actions are CSRF-protected automatically.",
                  "HTML forms via action={serverAction} are protected.",
                  "For API routes, rely on SameSite=Strict cookies.",
                  "Double-submit cookie pattern is built into Next.js forms."
        ],
        mistake: "Using fetch for mutations without forms — use Server Actions or forms with CSRF protection instead.",
        shorthand: {
          verbose: "// Manual CSRF token in form\n<form onSubmit={async (e) => {\n  const token = getCsrfToken();\n  await fetch('/api/post', {\n    body: new FormData(e.target),\n    headers: { 'X-CSRF-Token': token },\n  });\n}}>",
          concise: "// Automatic CSRF via Server Action\n<form action={createPost}>\n  {/* CSRF protected automatically */}\n</form>",
        },
      },
      {
        id: "secure-headers",
        fn: "Security Headers",
        desc: "Set security headers (CSP, X-Frame-Options, etc.) via next.config.js or middleware.",
        category: "Security",
        subtitle: "Protect against common web vulnerabilities",
        signature: "next.config.js headers()  |  middleware headers",
        descLong: "Security headers prevent common attacks like XSS, clickjacking, and MIME sniffing. Set them globally in next.config.js headers() or per-route in middleware. Essential headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Security Headers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { headers } from 'next/headers';\nimport { NextRequest, NextResponse } from 'next/server';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Security Headers — common patterns you'll see in production.\n// APPROACH  - Combine Security Headers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// next.config.js\nconst nextConfig = {\n  async headers() {\n    return [\n      {\n        source: '/(.*)',\n        headers: [\n          {\n            key: 'X-Content-Type-Options',\n            value: 'nosniff',  // Prevent MIME sniffing\n          },\n          {\n            key: 'X-Frame-Options',\n            value: 'DENY',  // No iframe embedding\n          },\n          {\n            key: 'X-XSS-Protection',\n            value: '1; mode=block',  // XSS filter\n          },\n          {\n            key: 'Referrer-Policy',\n            value: 'strict-origin-when-cross-origin',\n          },\n          {\n            key: 'Permissions-Policy',\n            value: 'geolocation=(), microphone=(), camera=()',\n          },\n          {\n            key: 'Content-Security-Policy',\n            value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://; font-src 'self';`,\n          },\n          {\n            key: 'Strict-Transport-Security',\n            value: 'max-age=31536000; includeSubDomains',\n          },\n        ],\n      },\n    ];\n  },\n};\nexport default nextConfig;\n// Or in middleware.ts\nexport function middleware(request: NextRequest) {\n  const response = NextResponse.next();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Security Headers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Security headers\n  response.headers.set('X-Content-Type-Options', 'nosniff');\n  response.headers.set('X-Frame-Options', 'DENY');\n  response.headers.set('X-XSS-Protection', '1; mode=block');\n  return response;\n}"
                  }
        ],
        tips: [
                  "Content-Security-Policy is the most important — prevents XSS attacks.",
                  "X-Frame-Options: DENY prevents clickjacking.",
                  "Strict-Transport-Security forces HTTPS for all future visits.",
                  "Test headers with securityheaders.com or similar tool."
        ],
        mistake: "Using unsafe-inline in CSP script-src — it defeats most XSS protection. Use nonces or hashes instead.",
        shorthand: {
          verbose: "// Manually set each header\nexport async function middleware(req) {\n  const res = NextResponse.next();\n  res.headers.set('X-Frame-Options', 'DENY');\n  res.headers.set('X-XSS-Protection', '1');\n  return res;\n}",
          concise: "// next.config.js headers()\nasync headers() {\n  return [{\n    source: '/(.*)',\n    headers: [\n      { key: 'X-Frame-Options', value: 'DENY' },\n      { key: 'X-XSS-Protection', value: '1; mode=block' },\n    ],\n  }];\n}",
        },
      },
      {
        id: "environment-secrets",
        fn: "Securing Secrets & Env Vars",
        desc: "Never expose secrets. Use NEXT_PUBLIC_ only for safe public data. Server-side vars stay on server.",
        category: "Security",
        subtitle: "Protecting sensitive configuration",
        signature: "process.env.SECRET_KEY  (server only)",
        descLong: "Environment variables without NEXT_PUBLIC_ are only available on the server — perfect for API keys, database URLs, secrets. NEXT_PUBLIC_ variables are embedded in the client bundle and visible to anyone. Use server-side env for authentication tokens, database credentials, and APIs requiring auth.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Securing Secrets & Env Vars — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// .env.local\nDATABASE_URL=postgresql://user:password@localhost:5432/db\nAPI_SECRET=super-secret-key-never-expose\nJWT_SECRET=jwt-signing-key\nSTRIPE_API_KEY=sk_live_..."
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Securing Secrets & Env Vars — common patterns you'll see in production.\n// APPROACH  - Combine Securing Secrets & Env Vars with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nNEXT_PUBLIC_API_URL=https://api.example.com\nNEXT_PUBLIC_APP_NAME=MyApp\n// lib/env.ts — Validate at startup\nimport { z } from 'zod';\nconst envSchema = z.object({\n  DATABASE_URL: z.string().url(),\n  API_SECRET: z.string().min(32),\n  JWT_SECRET: z.string().min(32),\n  STRIPE_API_KEY: z.string().startsWith('sk_'),\n  NEXT_PUBLIC_API_URL: z.string().url(),\n  NEXT_PUBLIC_APP_NAME: z.string(),\n});\nexport const env = envSchema.parse(process.env);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Securing Secrets & Env Vars — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Server Component — access secrets safely\nimport { env } from '@/lib/env';\nexport default async function Dashboard() {\n  // DATABASE_URL is safe here — only runs on server\n  const user = await db.query(env.DATABASE_URL);\n  return <div>{user.name}</div>;\n}\n// Client Component — only NEXT_PUBLIC_ vars\n'use client';\nexport function ApiClient() {\n  // This is safe — NEXT_PUBLIC_API_URL is meant to be public\n  const apiUrl = process.env.NEXT_PUBLIC_API_URL;\n  return <button onClick={() => fetch(apiUrl)}>Fetch</button>;\n}"
                  }
        ],
        tips: [
                  "NEXT_PUBLIC_ values are embedded at build time — use for app config, not secrets.",
                  "Server Component private vars stay on the server — safe for database credentials.",
                  "Use a schema validator (Zod, Joi) to catch missing env vars at startup.",
                  "Rotate secrets regularly and never commit .env files to git."
        ],
        mistake: "Prefixing API keys with NEXT_PUBLIC_ — they become visible in the client bundle and browser dev tools.",
        shorthand: {
          verbose: "// Insecure — secret in client\nconst API_KEY = process.env.STRIPE_KEY;  // embedded in JS\n<button onClick={() => fetch('/api', { headers: { 'Auth': API_KEY } })}>",
          concise: "// Secure — secret on server only\n// Server Component uses env directly\nconst stripe = Stripe(process.env.STRIPE_SECRET);\n\n// Client Component uses public env\nconst publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;",
        },
      },
    ],
  },

  // ── Section 3: Auth Libraries & Solutions ─────────────────────────────────────────
  {
    id: "auth-libraries",
    title: "Auth Libraries & Solutions",
    entries: [
      {
        id: "nextauth-v5",
        fn: "Auth.js v5 (NextAuth v5)",
        desc: "Modern NextAuth.js with auth() in Server Components, signIn(), signOut(), and session management.",
        category: "Authentication",
        subtitle: "Auth.js v5, auth() function, providers, callbacks",
        signature: "const session = await auth()  |  signIn(provider)  |  signOut()",
        descLong: "Auth.js v5 is the latest version of NextAuth.js. Use auth() function in Server Components to get the session, signIn() in Client Components or Server Actions to log in, and signOut() to log out. Supports OAuth (Google, GitHub), Credentials, Magic Links, and custom providers. Works with database sessions or JWT. Simpler API compared to v4.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Auth.js v5 (NextAuth v5) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// auth.ts (configuration)\nimport NextAuth from 'next-auth';\nimport GitHub from 'next-auth/providers/github';\nimport Google from 'next-auth/providers/google';\nimport Credentials from 'next-auth/providers/credentials';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Auth.js v5 (NextAuth v5) — common patterns you'll see in production.\n// APPROACH  - Combine Auth.js v5 (NextAuth v5) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport const { handlers, auth, signIn, signOut } = NextAuth({\n  providers: [\n    GitHub({\n      clientId: process.env.GITHUB_ID,\n      clientSecret: process.env.GITHUB_SECRET,\n    }),\n    Google({\n      clientId: process.env.GOOGLE_ID,\n      clientSecret: process.env.GOOGLE_SECRET,\n    }),\n    Credentials({\n      async authorize(credentials) {\n        const user = await findUserByEmail(credentials.email);\n        if (!user) return null;\n        const valid = await verify(credentials.password, user.password);\n        return valid ? user : null;\n      },\n    }),\n  ],\n  session: { strategy: 'database' },\n  callbacks: {\n    authorized: async ({ auth }) => !!auth,\n  },\n  pages: { signIn: '/login' },\n});\n// app/api/auth/[...nextauth]/route.ts\nimport { handlers } from '@/auth';\nexport const { GET, POST } = handlers;\n// app/page.tsx — Server Component\nimport { auth } from '@/auth';\nexport default async function Home() {\n  const session = await auth();\n  return (\n    <div>\n      {session ? (\n        <p>Welcome, {session.user?.name}</p>\n      ) : (\n        <p>Not logged in</p>\n      )}\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Auth.js v5 (NextAuth v5) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// app/components/sign-in.tsx — Client Component\n'use client';\nimport { signIn } from '@/auth';\nexport function SignInButton() {\n  return (\n    <button onClick={() => signIn('github')}>\n      Sign in with GitHub\n    </button>\n  );\n}\n// app/components/sign-out.tsx — Client Component\n'use client';\nimport { signOut } from '@/auth';\nexport function SignOutButton() {\n  return (\n    <button onClick={() => signOut()}>\n      Sign out\n    </button>\n  );\n}"
                  }
        ],
        tips: [
                  "auth() in Server Components, signIn()/signOut() in Client Components or Server Actions.",
                  "Use database strategy for user sessions stored in the database (more secure).",
                  "Combine with middleware for route protection (check req.auth).",
                  "Callbacks (jwt, session, authorized) let you customize claims and session data."
        ],
        mistake: "Using auth() in a Client Component — it's only for Server Components. Use useSession() hook in Client Components instead (needs SessionProvider).",
        shorthand: {
          verbose: "const session = await auth();\nif (!session) redirect('/login');\nreturn <div>{session.user.name}</div>;",
          concise: "auth() in Server Components; signIn(provider) in Client Components; SessionProvider for useSession()",
        },
      },
      {
        id: "nextauth-callbacks",
        fn: "Auth.js Callbacks — JWT, Session, SignIn, Authorized",
        desc: "Customize authentication with callbacks — add claims to JWT, modify session data, run authorization checks.",
        category: "Authentication",
        subtitle: "jwt callback, session callback, signIn callback, authorized callback",
        signature: "callbacks: { jwt, session, signIn, authorized }",
        descLong: "NextAuth.js callbacks intercept the authentication flow. Use jwt() to add custom claims to the token, session() to include custom fields in the session object, signIn() to allow/deny specific users, and authorized() to run auth checks in middleware. This is where you add roles, permissions, and custom user data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Auth.js Callbacks — JWT, Session, SignIn, Authorized — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// auth.ts\nimport NextAuth from 'next-auth';\nimport GitHub from 'next-auth/providers/github';\nimport { PrismaAdapter } from '@auth/prisma-adapter';\nimport { db } from '@/db';\nexport const { handlers, auth, signIn, signOut } = NextAuth({\n  adapter: PrismaAdapter(db),\n  providers: [GitHub()],\n  callbacks: {"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Auth.js Callbacks — JWT, Session, SignIn, Authorized — common patterns you'll see in production.\n// APPROACH  - Combine Auth.js Callbacks — JWT, Session, SignIn, Authorized with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Called every time a JWT is created or updated\n    jwt: async ({ token, user, account }) => {\n      if (user) {\n        // First login: add custom claims\n        token.id = user.id;\n        token.role = user.role || 'user';\n        token.emailVerified = user.emailVerified;\n      }\n      // Refresh role on every token refresh\n      if (account) {\n        const dbUser = await db.user.findUnique({\n          where: { id: user?.id },\n        });\n        token.role = dbUser?.role || 'user';\n      }\n      return token;\n    },\n    // Called when the session is accessed (getSession, useSession, auth())\n    session: async ({ session, token }) => {\n      if (session.user) {\n        session.user.id = token.id as string;\n        session.user.role = token.role as string;\n      }\n      return session;\n    },\n    // Called when user attempts to sign in\n    // Return false to deny sign-in\n    signIn: async ({ user, account, profile }) => {\n      // Only allow certain emails\n      if (!user.email?.endsWith('@company.com')) {\n        return false; // Deny non-company emails\n      }\n      // Check if user is active\n      const dbUser = await db.user.findUnique({\n        where: { email: user.email },\n      });\n      if (dbUser?.disabled) {\n        return false; // User account disabled\n      }\n      return true; // Allow sign-in\n    },"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Auth.js Callbacks — JWT, Session, SignIn, Authorized — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Runs in middleware; allow/deny request based on auth status\n    authorized: async ({ auth, request }) => {\n      const { pathname } = request.nextUrl;\n      // Allow public routes\n      if (pathname === '/login' || pathname === '/signup') {\n        return true;\n      }\n      // Require auth for protected routes\n      if (pathname.startsWith('/dashboard')) {\n        return !!auth; // true if authenticated\n      }\n      // Admin routes require admin role\n      if (pathname.startsWith('/admin')) {\n        return auth?.user?.role === 'admin';\n      }\n      return true; // Allow by default\n    },\n  },\n});\n// app/admin/page.tsx\nimport { auth } from '@/auth';\nimport { redirect } from 'next/navigation';\nexport default async function AdminPage() {\n  const session = await auth();\n  if (session?.user?.role !== 'admin') {\n    redirect('/unauthorized');\n  }\n  return <div>Admin dashboard</div>;\n}\n// app/components/role-badge.tsx\n'use client';\nimport { useSession } from 'next-auth/react';\nexport function RoleBadge() {\n  const { data: session } = useSession();\n  return <span>{session?.user?.role || 'user'}</span>;\n}"
                  }
        ],
        tips: [
                  "jwt() is called on every login and refresh — keep it fast, don't query DB every time.",
                  "session() is called on every auth check — add only necessary data to avoid large session objects.",
                  "signIn() can deny specific users (deactivated accounts, non-company emails).",
                  "authorized() runs in middleware at the edge — perfect for route protection."
        ],
        mistake: "Doing database queries in jwt() callback on every token refresh — it's called frequently. Cache or defer expensive queries to the session() callback.",
        shorthand: {
          verbose: "jwt: async ({ token, user }) => {\n  if (user) token.role = user.role;\n  return token;\n},\nsession: async ({ session, token }) => {\n  session.user.role = token.role;\n  return session;\n}",
          concise: "jwt: add claims to token; session: add claims to session; signIn: allow/deny users; authorized: middleware checks",
        },
      },
      {
        id: "nextauth-adapters",
        fn: "Auth.js Database Adapters",
        desc: "Database adapters — Prisma adapter, Drizzle adapter, custom adapter interface.",
        category: "Authentication",
        subtitle: "database adapters, Prisma, Drizzle, custom adapters",
        signature: "PrismaAdapter(prisma)  |  DrizzleAdapter(db)",
        descLong: "Adapters connect Auth.js to your database for storing sessions, accounts, and users. Built-in adapters for Prisma and Drizzle simplify setup. Adapters handle session storage, account linking (OAuth), and user creation. Write a custom adapter to use any database (MongoDB, Firebase, custom ORM).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Auth.js Database Adapters — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// auth.ts\nimport NextAuth from 'next-auth';\nimport GitHub from 'next-auth/providers/github';\nimport { PrismaAdapter } from '@auth/prisma-adapter';\nimport { db } from '@/db';\nexport const { handlers, auth } = NextAuth({\n  adapter: PrismaAdapter(db),\n  providers: [GitHub()],\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Auth.js Database Adapters — common patterns you'll see in production.\n// APPROACH  - Combine Auth.js Database Adapters with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nimport NextAuth from 'next-auth';\nimport GitHub from 'next-auth/providers/github';\nimport { DrizzleAdapter } from '@auth/drizzle-adapter';\nimport { db } from '@/db';\nexport const { handlers, auth } = NextAuth({\n  adapter: DrizzleAdapter(db),\n  providers: [GitHub()],\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Auth.js Database Adapters — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport { MongoClient } from 'mongodb';\nconst client = new MongoClient(process.env.MONGODB_URI);\nconst db = client.db('auth');\nexport const customAdapter = {\n  async createUser(user) {\n    const result = await db.collection('users').insertOne({\n      ...user,\n      createdAt: new Date(),\n    });\n    return { ...user, id: result.insertedId.toString() };\n  },\n  async getUser(id) {\n    return db.collection('users').findOne({ _id: new ObjectId(id) });\n  },\n  async getUserByEmail(email) {\n    return db.collection('users').findOne({ email });\n  },\n  async updateUser(user) {\n    const { id, ...data } = user;\n    await db.collection('users').updateOne(\n      { _id: new ObjectId(id) },\n      { $set: data }\n    );\n    return user;\n  },\n  async deleteUser(userId) {\n    await db.collection('users').deleteOne({ _id: new ObjectId(userId) });\n  },\n  async linkAccount(account) {\n    await db.collection('accounts').insertOne(account);\n  },\n  async unlinkAccount(provider, providerAccountId) {\n    await db.collection('accounts').deleteOne({\n      provider,\n      providerAccountId,\n    });\n  },\n  async createSession(session) {\n    const result = await db.collection('sessions').insertOne({\n      ...session,\n      createdAt: new Date(),\n    });\n    return session;\n  },\n  async getSessionAndUser(sessionToken) {\n    const session = await db.collection('sessions').findOne({ sessionToken });\n    if (!session) return null;\n    const user = await db.collection('users').findOne({\n      _id: new ObjectId(session.userId),\n    });\n    return { session, user };\n  },\n  async updateSession(session) {\n    await db.collection('sessions').updateOne(\n      { sessionToken: session.sessionToken },\n      { $set: session }\n    );\n    return session;\n  },\n  async deleteSession(sessionToken) {\n    await db.collection('sessions').deleteOne({ sessionToken });\n  },\n};\nexport const { handlers, auth } = NextAuth({\n  adapter: customAdapter,\n  providers: [GitHub()],\n});"
                  }
        ],
        tips: [
                  "Prisma and Drizzle adapters are officially maintained and handle schema automatically.",
                  "Custom adapters require implementing all methods (createUser, getSession, etc.).",
                  "Adapters store sessions in the database (strategy: \"database\") for long-term persistence.",
                  "Use adapters for OAuth account linking and multi-provider support."
        ],
        mistake: "Not setting up the adapter — sessions won't be persisted. OAuth logins will fail. Always configure an adapter with database strategy.",
        shorthand: {
          verbose: "import { PrismaAdapter } from '@auth/prisma-adapter';\nexport const { handlers, auth } = NextAuth({\n  adapter: PrismaAdapter(db),\n})",
          concise: "PrismaAdapter(db) or DrizzleAdapter(db) for built-in support; custom adapter for other databases",
        },
      },
      {
        id: "nextauth-credentials",
        fn: "Credentials Provider — Password Auth",
        desc: "Custom authorize() function for email/password authentication — hashing, validation, security.",
        category: "Authentication",
        subtitle: "Credentials provider, password hashing, authorization logic",
        signature: "Credentials({ async authorize(credentials) { ... } })",
        descLong: "The Credentials provider lets you handle custom authentication (email/password, OTP, etc.). Implement authorize() to verify credentials against your database. Always hash passwords (bcrypt, argon2) — never store plaintext. Return the user object on success or null on failure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Credentials Provider — Password Auth — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// auth.ts\nimport NextAuth from 'next-auth';\nimport Credentials from 'next-auth/providers/credentials';\nimport bcrypt from 'bcrypt';\nimport { db } from '@/db';\nexport const { handlers, auth, signIn, signOut } = NextAuth({\n  providers: [\n    Credentials({\n      name: 'Email & Password',\n      credentials: {\n        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },\n        password: { label: 'Password', type: 'password' },\n      },\n      async authorize(credentials) {"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Credentials Provider — Password Auth — common patterns you'll see in production.\n// APPROACH  - Combine Credentials Provider — Password Auth with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nif (!credentials?.email || !credentials?.password) {\n          return null;\n        }\n        const user = await db.user.findUnique({\n          where: { email: credentials.email as string },\n        });\n        if (!user) {\n          // User not found — don't reveal this!\n          return null;\n        }\n        const isPasswordValid = await bcrypt.compare(\n          credentials.password as string,\n          user.passwordHash\n        );\n        if (!isPasswordValid) {\n          // Password wrong — don't reveal this!\n          return null;\n        }\n        if (user.disabled) {\n          return null;\n        }\n        return {\n          id: user.id,\n          email: user.email,\n          name: user.name,\n          role: user.role,\n        };\n      },\n    }),\n  ],\n  pages: {\n    signIn: '/login',\n    error: '/login?error=CredentialsSignin',\n  },\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Credentials Provider — Password Auth — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// app/login/page.tsx\n'use client';\nimport { signIn } from '@/auth';\nimport { useRouter } from 'next/navigation';\nexport function LoginForm() {\n  const router = useRouter();\n  async function handleSubmit(formData: FormData) {\n    const email = formData.get('email') as string;\n    const password = formData.get('password') as string;\n    const result = await signIn('credentials', {\n      email,\n      password,\n      redirect: false,\n    });\n    if (result?.ok) {\n      router.push('/dashboard');\n    } else {\n      // Show error\n      console.error('Sign in failed:', result?.error);\n    }\n  }\n  return (\n    <form action={handleSubmit}>\n      <input name=\"email\" type=\"email\" required />\n      <input name=\"password\" type=\"password\" required />\n      <button type=\"submit\">Sign In</button>\n    </form>\n  );\n}\n// app/api/register/route.ts\nimport bcrypt from 'bcrypt';\nexport async function POST(request: Request) {\n  const { email, password } = await request.json();\n  if (password.length < 8) {\n    return Response.json(\n      { error: 'Password must be at least 8 characters' },\n      { status: 400 }\n    );\n  }\n  const passwordHash = await bcrypt.hash(password, 12);\n  const user = await db.user.create({\n    data: { email, passwordHash },\n  });\n  return Response.json({ success: true, userId: user.id });\n}"
                  }
        ],
        tips: [
                  "Always hash passwords with bcrypt or argon2 — never store plaintext.",
                  "Don't reveal whether a user exists — return null for both \"user not found\" and \"wrong password\".",
                  "Enforce strong password requirements (8+ chars, complexity).",
                  "Consider implementing rate limiting to prevent brute-force attacks."
        ],
        mistake: "Storing plaintext passwords or using weak hashing (MD5, SHA1) — use bcrypt (12+ rounds) or argon2.",
        shorthand: {
          verbose: "const user = await db.user.findUnique({ where: { email } });\nconst isValid = await bcrypt.compare(password, user.passwordHash);\nreturn isValid ? user : null;",
          concise: "Credentials provider with authorize(); bcrypt.hash() on signup; bcrypt.compare() on login",
        },
      },
      {
        id: "clerk-basics",
        fn: "Clerk Authentication",
        desc: "Clerk for authentication — ClerkProvider, useUser(), currentUser() in Server Components, middleware protection.",
        category: "Authentication",
        subtitle: "Clerk, ClerkProvider, useUser hook, currentUser, Clerk middleware",
        signature: "<ClerkProvider>  |  useUser()  |  currentUser()",
        descLong: "Clerk is a modern authentication platform with pre-built UI components and SDKs. Wrap your app in ClerkProvider, use useUser() hook in Client Components to read user data, and currentUser() in Server Components. Clerk middleware protects routes. It handles sign-up, sign-in, multi-factor authentication, and social login out of the box.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Clerk Authentication — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { ClerkProvider } from '@clerk/nextjs';\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode;\n}) {\n  return (\n    <ClerkProvider>\n      <html>\n        <body>{children}</body>\n      </html>\n    </ClerkProvider>\n  );\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Clerk Authentication — common patterns you'll see in production.\n// APPROACH  - Combine Clerk Authentication with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n'use client';\nimport { useUser, useSignOut } from '@clerk/nextjs';\nexport function UserProfile() {\n  const { user, isLoaded } = useUser();\n  if (!isLoaded) return <p>Loading...</p>;\n  if (!user) return <p>Not signed in</p>;\n  return (\n    <div>\n      <p>Welcome, {user.firstName} {user.lastName}</p>\n      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>\n      <img src={user.imageUrl} alt=\"\" />\n      <SignOutButton />\n    </div>\n  );\n}\nfunction SignOutButton() {\n  const { signOut } = useSignOut();\n  return (\n    <button onClick={() => signOut({ redirectUrl: '/' })}>\n      Sign out\n    </button>\n  );\n}\nimport { currentUser } from '@clerk/nextjs/server';\nexport default async function Dashboard() {\n  const user = await currentUser();\n  if (!user) {\n    return <p>Please sign in</p>;\n  }\n  return (\n    <div>\n      <h1>Dashboard for {user.firstName}</h1>\n      <p>User ID: {user.id}</p>\n    </div>\n  );\n}\n// middleware.ts\nimport { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';\nconst isProtectedRoute = createRouteMatcher([\n  '/dashboard(.*)',\n  '/admin(.*)',\n]);\nexport default clerkMiddleware((auth, request) => {\n  if (isProtectedRoute(request)) {\n    auth().protect();\n  }\n});\nexport const config = {\n  matcher: ['/((?!_next|.*\\\\..*).*)'],\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Clerk Authentication — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// app/sign-in/[[...sign-in]]/page.tsx\nimport { SignIn } from '@clerk/nextjs';\nexport default function SignInPage() {\n  return <SignIn />;\n}\n// Store custom data on the user object\nexport async function addUserMetadata(userId: string, metadata: any) {\n  // In Clerk dashboard or via API\n  return metadata;\n}"
                  }
        ],
        tips: [
                  "ClerkProvider wraps your entire app — must be in the root layout.",
                  "useUser() is reactive in Client Components — re-renders when user data changes.",
                  "currentUser() in Server Components is non-reactive but doesn't require SessionProvider.",
                  "Clerk handles all UI (sign-up, sign-in, profile, MFA) — no custom forms needed."
        ],
        mistake: "Using useUser() in a Server Component — it's a hook. Use currentUser() in Server Components instead.",
        shorthand: {
          verbose: "'use client';\nimport { useUser } from '@clerk/nextjs';\nconst { user } = useUser();",
          concise: "ClerkProvider in layout; useUser() in Client Components; currentUser() in Server Components; clerkMiddleware for route protection",
        },
      },
      {
        id: "lucia-auth",
        fn: "Lucia Auth — Lightweight Sessions",
        desc: "Lucia for session management — auth object, lucia.createSession(), cookie handling.",
        category: "Authentication",
        subtitle: "Lucia, sessions, auth object, cookie management",
        signature: "const session = await lucia.createSession(userId, {})",
        descLong: "Lucia is a lightweight auth library focused on session management. Create sessions with lucia.createSession(), verify session tokens from cookies, and invalidate sessions. Works with any database and OAuth provider. Minimal and flexible compared to full auth frameworks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Lucia Auth — Lightweight Sessions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// lib/auth.ts\nimport { Lucia, TimeSpan } from 'lucia';\nimport { PrismaAdapter } from '@lucia-auth/adapter-prisma';\nimport { db } from '@/db';\nconst adapter = new PrismaAdapter(db.session, db.user);\nexport const lucia = new Lucia(adapter, {\n  sessionExpiresIn: new TimeSpan(30, 'd'), // 30 days\n  attributesToExclude: ['passwordHash'],\n  getSessionAttributes: (attributes) => {\n    return {\n      userId: attributes.userId,\n    };\n  },\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Lucia Auth — Lightweight Sessions — common patterns you'll see in production.\n// APPROACH  - Combine Lucia Auth — Lightweight Sessions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndeclare module 'lucia' {\n  interface Register {\n    Lucia: typeof lucia;\n    DatabaseUserAttributes: {\n      email: string;\n      name: string;\n    };\n    DatabaseSessionAttributes: {\n      userId: string;\n    };\n  }\n}\n// app/api/signup/route.ts\nimport { lucia } from '@/lib/auth';\nimport { hash } from '@node-rs/argon2';\nimport { db } from '@/db';\nexport async function POST(request: Request) {\n  const { email, password } = await request.json();\n  const passwordHash = await hash(password);\n  const user = await db.user.create({\n    data: { email, passwordHash },\n  });\n  const session = await lucia.createSession(user.id, {});\n  const sessionCookie = lucia.createSessionCookie(session.id);\n  return Response.json(\n    { success: true },\n    {\n      headers: {\n        'Set-Cookie': sessionCookie.serialize(),\n      },\n    }\n  );\n}\n// app/api/login/route.ts\nimport { lucia } from '@/lib/auth';\nimport { verify } from '@node-rs/argon2';\nimport { db } from '@/db';\nexport async function POST(request: Request) {\n  const { email, password } = await request.json();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Lucia Auth — Lightweight Sessions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst user = await db.user.findUnique({ where: { email } });\n  if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 });\n  const isValid = await verify(user.passwordHash, password);\n  if (!isValid) return Response.json({ error: 'Invalid credentials' }, { status: 401 });\n  const session = await lucia.createSession(user.id, {});\n  const sessionCookie = lucia.createSessionCookie(session.id);\n  return Response.json(\n    { success: true },\n    {\n      headers: {\n        'Set-Cookie': sessionCookie.serialize(),\n      },\n    }\n  );\n}\n// app/page.tsx\nimport { lucia } from '@/lib/auth';\nimport { cookies } from 'next/headers';\nexport default async function Home() {\n  const cookieStore = cookies();\n  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value;\n  let session = null;\n  if (sessionId) {\n    session = await lucia.validateSession(sessionId);\n  }\n  return (\n    <div>\n      {session?.user ? (\n        <p>Welcome, {session.user.email}</p>\n      ) : (\n        <p>Not signed in</p>\n      )}\n    </div>\n  );\n}\n// app/api/logout/route.ts\nimport { lucia } from '@/lib/auth';\nimport { cookies } from 'next/headers';\nexport async function POST(request: Request) {\n  const cookieStore = cookies();\n  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value;\n  if (sessionId) {\n    await lucia.invalidateSession(sessionId);\n  }\n  const sessionCookie = lucia.createBlankSessionCookie();\n  return Response.json(\n    { success: true },\n    {\n      headers: {\n        'Set-Cookie': sessionCookie.serialize(),\n      },\n    }\n  );\n}"
                  }
        ],
        tips: [
                  "Lucia handles only session management — you implement authentication logic.",
                  "Use argon2 or bcrypt for password hashing, not SHA256.",
                  "Session cookies are httpOnly by default — can't be accessed from JavaScript.",
                  "Validate sessions on every server request — use validateSession()."
        ],
        mistake: "Storing passwords without hashing — always use argon2 or bcrypt, never plaintext.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst session = await lucia.createSession(userId, {});\nconst sessionCookie = lucia.createSessionCookie(session.id);\n// More explicit but longer",
          concise: "lucia.createSession(userId); lucia.validateSession(sessionId); lucia.invalidateSession() on logout",
        },
      },
      {
        id: "better-auth",
        fn: "Better Auth — Modern Auth Framework",
        desc: "Better Auth basics — auth.api, useSession hook, providers, plugins.",
        category: "Authentication",
        subtitle: "Better Auth, auth.api, useSession, OAuth providers",
        signature: "const { auth } = betterAuth({...})  |  useSession()",
        descLong: "Better Auth is a modern auth library with OAuth, credentials, and multi-session support. Initialize with betterAuth(), expose via auth.api, and use useSession() in Client Components. Supports plugins for custom functionality (email verification, 2FA, etc).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Better Auth — Modern Auth Framework — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// lib/auth.ts\nimport { betterAuth } from 'better-auth';\nimport { prismaAdapter } from 'better-auth/adapters/prisma';\nimport { db } from '@/db';\nexport const auth = betterAuth({\n  database: prismaAdapter(db),\n  emailAndPassword: {\n    enabled: true,\n    requireEmailVerification: false,\n  },\n  oauth: {\n    providers: [\n      {\n        id: 'github',\n        name: 'GitHub',\n        clientId: process.env.GITHUB_ID || '',\n        clientSecret: process.env.GITHUB_SECRET || '',\n      },\n      {\n        id: 'google',\n        name: 'Google',\n        clientId: process.env.GOOGLE_ID || '',\n        clientSecret: process.env.GOOGLE_SECRET || '',\n      },\n    ],\n  },\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Better Auth — Modern Auth Framework — common patterns you'll see in production.\n// APPROACH  - Combine Better Auth — Modern Auth Framework with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// app/api/auth/[[...auth]]/route.ts\nimport { auth } from '@/lib/auth';\nexport const { GET, POST } = auth.toNextJsHandler();\n'use client';\nimport { useSession } from 'better-auth/react';\nexport function UserCard() {\n  const { data: session, isPending } = useSession();\n  if (isPending) return <p>Loading...</p>;\n  if (!session) return <p>Not logged in</p>;\n  return (\n    <div>\n      <p>User: {session.user.name}</p>\n      <p>Email: {session.user.email}</p>\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Better Auth — Modern Auth Framework — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n'use client';\nimport { authClient } from '@/lib/auth-client';\nexport function SignInButton() {\n  return (\n    <button\n      onClick={() =>\n        authClient.signIn.social({\n          provider: 'github',\n          callbackURL: '/dashboard',\n        })\n      }\n    >\n      Sign in with GitHub\n    </button>\n  );\n}\n'use client';\nimport { authClient } from '@/lib/auth-client';\nexport function EmailSignIn() {\n  async function handleSignIn(formData: FormData) {\n    await authClient.signIn.email({\n      email: formData.get('email') as string,\n      password: formData.get('password') as string,\n    });\n  }\n  return (\n    <form action={handleSignIn}>\n      <input name=\"email\" type=\"email\" />\n      <input name=\"password\" type=\"password\" />\n      <button type=\"submit\">Sign In</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Better Auth combines OAuth + credentials in one API.",
                  "useSession() in Client Components provides reactive user state.",
                  "Plugins enable email verification, 2FA, session management.",
                  "Works with any database adapter (Prisma, Drizzle, etc)."
        ],
        mistake: "Mixing auth frameworks — stick with one (NextAuth, Lucia, Better Auth, Clerk) to avoid conflicts.",
        shorthand: {
          verbose: "const { auth } = betterAuth({\n  database: prismaAdapter(db),\n  oauth: { providers: [...] },\n});",
          concise: "betterAuth({ database, oauth, emailAndPassword }); auth.toNextJsHandler() in API route; useSession() in Client",
        },
      },
      {
        id: "auth-middleware",
        fn: "Protecting Routes with Middleware",
        desc: "Middleware-based auth — auth() wrapper, role-based access, protecting API routes.",
        category: "Authorization",
        subtitle: "middleware auth checks, RBAC, route protection patterns",
        signature: "export default auth((req) => { ... })",
        descLong: "Use middleware to protect routes at the edge before hitting the server. Check req.auth for the session, verify roles/permissions, and redirect unauthorized users. This pattern is fast, prevents unauthorized requests from reaching your server, and works with any auth framework.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Protecting Routes with Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts\nimport { auth } from '@/auth';\nimport { NextRequest, NextResponse } from 'next/server';\nexport default auth((req: NextRequest & { auth: any }) => {\n  const { pathname } = req.nextUrl;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Protecting Routes with Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Protecting Routes with Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst publicRoutes = ['/login', '/signup', '/api/public'];\n  if (publicRoutes.some(route => pathname.startsWith(route))) {\n    return NextResponse.next();\n  }\n  if (!req.auth) {\n    return NextResponse.redirect(new URL('/login', req.url));\n  }\n  if (pathname.startsWith('/admin')) {\n    if (req.auth.user.role !== 'admin') {\n      return NextResponse.redirect(new URL('/unauthorized', req.url));\n    }\n  }\n  if (pathname.startsWith('/moderator')) {\n    const allowedRoles = ['admin', 'moderator'];\n    if (!allowedRoles.includes(req.auth.user.role)) {\n      return NextResponse.redirect(new URL('/unauthorized', req.url));\n    }\n  }\n  return NextResponse.next();\n});\nexport const config = {\n  matcher: [\n    '/dashboard/:path*',\n    '/admin/:path*',\n    '/moderator/:path*',\n    '/api/protected/:path*',\n  ],\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Protecting Routes with Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// app/api/protected/data/route.ts\nimport { auth } from '@/auth';\nexport async function GET(request: Request) {\n  const session = await auth();\n  if (!session?.user) {\n    return Response.json({ error: 'Unauthorized' }, { status: 401 });\n  }\n  // Optionally check role\n  if (session.user.role !== 'admin') {\n    return Response.json({ error: 'Forbidden' }, { status: 403 });\n  }\n  return Response.json({ data: 'sensitive data' });\n}\n// lib/protected-route.ts\nimport { auth } from '@/auth';\nimport { redirect } from 'next/navigation';\nexport async function requireAuth() {\n  const session = await auth();\n  if (!session?.user) {\n    redirect('/login');\n  }\n  return session;\n}\nexport async function requireRole(role: string) {\n  const session = await requireAuth();\n  if (session.user.role !== role) {\n    redirect('/unauthorized');\n  }\n  return session;\n}\n// Usage in Server Component:\n// import { requireRole } from '@/lib/protected-route';\n// export default async function AdminPage() {\n//   await requireRole('admin');\n//   return <div>Admin content</div>;\n// }"
                  }
        ],
        tips: [
                  "Middleware is fast at the edge — check auth before the request hits your server.",
                  "Combine middleware (edge check) + Server Component (data access) for defense in depth.",
                  "Pass user context to server components via headers (X-User-Id) if needed.",
                  "Test protected routes thoroughly — unprotected routes are a security liability."
        ],
        mistake: "Only protecting Server Components without middleware — users still navigate to protected pages before the redirect. Use middleware for immediate protection.",
        shorthand: {
          verbose: "export default async function ProtectedPage() {\n  const session = await auth();\n  if (!session) redirect('/login');  // late redirect\n  return <div>...</div>;\n}",
          concise: "Protect in middleware for immediate redirects; use auth() in Server Components for data access",
        },
      },
      {
        id: "magic-link",
        fn: "Magic Link & Email OTP Authentication",
        desc: "Passwordless auth via magic links — sendVerificationRequest, email integration with Resend/Nodemailer.",
        category: "Authentication",
        subtitle: "magic links, email OTP, token generation, email sending",
        signature: "sendVerificationRequest({ email, url, token })",
        descLong: "Magic links let users sign in via email without passwords. Generate a secure token, send it in an email link, and verify the token on callback. Use Resend (simple API), Nodemailer (SMTP), or any email service. This pattern is user-friendly and reduces password complexity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Magic Link & Email OTP Authentication — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// auth.ts\nimport NextAuth from 'next-auth';\nimport Email from 'next-auth/providers/email';\nimport { PrismaAdapter } from '@auth/prisma-adapter';\nimport { db } from '@/db';\nimport { sendVerificationEmail } from '@/lib/email';\nexport const { handlers, auth } = NextAuth({\n  adapter: PrismaAdapter(db),\n  providers: [\n    Email({\n      server: process.env.EMAIL_SERVER_URL,\n      from: 'noreply@example.com',\n      async sendVerificationRequest({ identifier, url, provider, theme }) {\n        await sendVerificationEmail(identifier, url);\n      },\n    }),\n  ],\n  pages: {\n    signIn: '/login',\n    verifyRequest: '/login?step=verify',\n  },\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Magic Link & Email OTP Authentication — common patterns you'll see in production.\n// APPROACH  - Combine Magic Link & Email OTP Authentication with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// lib/email.ts\nimport { Resend } from 'resend';\nconst resend = new Resend(process.env.RESEND_API_KEY);\nexport async function sendVerificationEmail(email: string, url: string) {\n  const verifyUrl = `${process.env.NEXTAUTH_URL}${url}`;\n  await resend.emails.send({\n    from: 'auth@example.com',\n    to: email,\n    subject: 'Your login link',\n    html: `\n      <p>Click the link below to sign in:</p>\n      <a href=\"${verifyUrl}\" style=\"padding: 10px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px;\">\n        Sign in to your account\n      </a>\n      <p>This link expires in 24 hours.</p>\n    `,\n  });\n}\nimport nodemailer from 'nodemailer';\nconst transporter = nodemailer.createTransport({\n  host: process.env.SMTP_HOST,\n  port: process.env.SMTP_PORT,\n  secure: true,\n  auth: {\n    user: process.env.SMTP_USER,\n    pass: process.env.SMTP_PASS,\n  },\n});\nexport async function sendVerificationEmailSMTP(email: string, url: string) {\n  await transporter.sendMail({\n    from: 'auth@example.com',\n    to: email,\n    subject: 'Your login link',\n    html: `\n      <p>Click here to sign in:</p>\n      <a href=\"${url}\">Sign in</a>\n    `,\n  });\n}\n// app/login/page.tsx\n'use client';\nimport { signIn } from 'next-auth/react';\nexport function MagicLinkForm() {\n  async function handleSubmit(formData: FormData) {\n    const email = formData.get('email') as string;\n    await signIn('email', {\n      email,\n      redirect: false,\n      callbackUrl: '/dashboard',\n    });\n  }\n  return (\n    <form action={handleSubmit}>\n      <input\n        name=\"email\"\n        type=\"email\"\n        placeholder=\"your@email.com\"\n        required\n      />\n      <button type=\"submit\">Send Magic Link</button>\n    </form>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Magic Link & Email OTP Authentication — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// lib/otp.ts\nimport crypto from 'crypto';\nimport { sendVerificationEmail } from './email';\nconst otpStore = new Map<string, { code: string; expiresAt: number }>();\nexport async function generateAndSendOTP(email: string) {\n  const code = Math.floor(100000 + Math.random() * 900000).toString();\n  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes\n  otpStore.set(email, { code, expiresAt });\n  await sendVerificationEmail(\n    email,\n    `Your verification code is: ${code}`\n  );\n}\nexport function verifyOTP(email: string, code: string): boolean {\n  const stored = otpStore.get(email);\n  if (!stored) return false;\n  if (stored.expiresAt < Date.now()) {\n    otpStore.delete(email);\n    return false;\n  }\n  const isValid = stored.code === code;\n  if (isValid) {\n    otpStore.delete(email);\n  }\n  return isValid;\n}"
                  }
        ],
        tips: [
                  "Magic links are more secure than passwords but require email access (risk if email is compromised).",
                  "Set token expiration to 24-48 hours to prevent old links from being abused.",
                  "Include the callback URL in the email link so users return to the right page after verification.",
                  "Resend is the easiest solution for transactional email; use Nodemailer for SMTP control."
        ],
        mistake: "Not setting token expiration — tokens could be used indefinitely. Always set expiry times (24 hours for magic links).",
        shorthand: {
          verbose: "const token = crypto.randomBytes(32).toString('hex');\nconst expiresAt = Date.now() + 24 * 60 * 60 * 1000;\nawait sendEmail(email, `Click: ${url}?token=${token}`);",
          concise: "Email provider with sendVerificationRequest(); Resend for simple API; Nodemailer for SMTP; expire tokens after 24h",
        },
      },
    ],
  },
]

export default { meta, sections }
