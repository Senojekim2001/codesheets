export const meta = {
  "title": "Route Handlers & Actions",
  "domain": "nextjs",
  "sheet": "api",
  "icon": "🔌"
}

export const sections = [

  // ── Section 1: Route Handlers & Actions ─────────────────────────────────────────
  {
    id: "route-actions",
    title: "Route Handlers & Actions",
    entries: [
      {
        id: "route-handler-basics",
        fn: "Route Handlers",
        desc: "Create API endpoints with app/api/**/route.ts. Export named functions for each HTTP method.",
        category: "Route Handlers",
        subtitle: "API endpoints in the App Router",
        signature: "export async function GET(request: NextRequest) { }",
        descLong: "Route Handlers replace the pages/api directory. Create a route.ts in any app/ folder to make it an API endpoint. Export named async functions for HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS. The route.ts and page.tsx cannot coexist in the same folder.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Route Handlers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/api/users/route.ts\nimport { NextRequest, NextResponse } from 'next/server';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Route Handlers — common patterns you'll see in production.\n// APPROACH  - Combine Route Handlers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport async function GET(request: NextRequest) {\n  const { searchParams } = new URL(request.url);\n  const page = Number(searchParams.get('page') ?? 1);\n  const users = await db.user.findMany({ skip: (page - 1) * 10, take: 10 });\n  return NextResponse.json(users);\n}\nexport async function POST(request: NextRequest) {\n  const body = await request.json();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Route Handlers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Validate\n  if (!body.email) {\n    return NextResponse.json({ error: 'Email required' }, { status: 400 });\n  }\n  const user = await db.user.create({ data: body });\n  return NextResponse.json(user, { status: 201 });\n}"
                  }
        ],
        tips: [
                  "Route Handlers can coexist with pages in app/ — but not in the same folder as page.tsx.",
                  "Use NextRequest for typed access to headers, cookies, and URL params.",
                  "By default, GET Route Handlers are cached — use { cache: \"no-store\" } in internal fetches or export dynamic = \"force-dynamic\" to opt out.",
                  "For form-based mutations, Server Actions are often cleaner than Route Handlers."
        ],
        mistake: "Putting route.ts in the same folder as page.tsx — they conflict. Move the API route to a dedicated folder like app/api/users/route.ts.",
        shorthand: {
          verbose: "// Pages Router with api/ directory\npages/api/users.js\nexport default function handler(req, res) {\n  if (req.method === 'GET') { res.json([]) }\n}",
          concise: "// App Router with route.ts\napp/api/users/route.ts\nexport async function GET(req) { return NextResponse.json([]) }",
        },
      },
      {
        id: "dynamic-route-handler",
        fn: "Dynamic Route Handlers",
        desc: "Route Handlers with dynamic segments receive params as a second argument.",
        category: "Route Handlers",
        subtitle: "Path parameters in API routes",
        signature: "export async function GET(req, { params }: { params: { id: string } })",
        descLong: "Dynamic segments work the same as page routes — use brackets in folder names. The matched segment values are passed as the second argument's params object.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dynamic Route Handlers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/api/users/[id]/route.ts\nimport { NextRequest, NextResponse } from 'next/server';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dynamic Route Handlers — common patterns you'll see in production.\n// APPROACH  - Combine Dynamic Route Handlers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport async function GET(\n  request: NextRequest,\n  { params }: { params: { id: string } }\n) {\n  try {\n    const user = await db.user.findUnique({ where: { id: params.id } });\n    if (!user) {\n      return NextResponse.json({ error: 'User not found' }, { status: 404 });\n    }\n    return NextResponse.json(user);\n  } catch (error) {\n    return NextResponse.json({ error: 'Server error' }, { status: 500 });\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dynamic Route Handlers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport async function DELETE(\n  request: NextRequest,\n  { params }: { params: { id: string } }\n) {\n  try {\n    const user = await db.user.findUnique({ where: { id: params.id } });\n    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });\n    await db.user.delete({ where: { id: params.id } });\n    return NextResponse.json({ success: true });\n  } catch (error) {\n    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });\n  }\n}"
                  }
        ],
        tips: [
                  "Return new NextResponse(null, { status: 204 }) for no-body responses like DELETE.",
                  "Set CORS headers by returning them in the Response: NextResponse.json(data, { headers: { \"Access-Control-Allow-Origin\": \"*\" } }).",
                  "Handle OPTIONS for CORS preflight by exporting an OPTIONS function.",
                  "Read request headers with request.headers.get(\"Authorization\")."
        ],
        mistake: "Returning a plain object instead of NextResponse.json() — Route Handlers must return a Response object. Returning a plain object causes a runtime error.",
        shorthand: {
          verbose: "app/api/users/[id]/route.ts\nconst handler = (req, res) => {\n  if (req.query.id) res.json({ id: req.query.id })\n}",
          concise: "app/api/users/[id]/route.ts\nexport async function GET(req, { params }) {\n  return NextResponse.json({ id: params.id });\n}",
        },
      },
      {
        id: "server-actions",
        fn: "Server Actions",
        desc: "Async server-side functions called directly from client components or forms — no manual API route needed.",
        category: "Server Actions",
        subtitle: "Server-side mutations without API routes",
        signature: "\"use server\"  async function action(formData) { /* DB mutations */ }",
        descLong: "Server Actions are async functions marked with \"use server\". They can be placed inline in Server Components or in a separate file. They run on the server when called — no API route, no fetch required. Works with HTML forms, event handlers, and startTransition. Returns data or throws errors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Server Actions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/actions.ts\n'use server';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Server Actions — common patterns you'll see in production.\n// APPROACH  - Combine Server Actions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nimport { revalidatePath, revalidateTag } from 'next/cache';\nimport { redirect } from 'next/navigation';\nexport async function createPost(formData: FormData) {\n  const title = formData.get('title') as string;\n  if (!title) throw new Error('Title is required');\n  const post = await db.post.create({ data: { title } });\n  revalidatePath('/posts');\n  redirect(`/posts/${post.id}`);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Server Actions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport async function deletePost(id: string) {\n  await db.post.delete({ where: { id } });\n  revalidateTag('posts');\n}\n// Client Component\n'use client';\nimport { deletePost } from './actions';\nfunction PostCard({ post }) {\n  return (\n    <form action={deletePost.bind(null, post.id)}>\n      <button type=\"submit\">Delete</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Use revalidatePath() or revalidateTag() after mutations to update cached data.",
                  "Call redirect() at the end of successful actions to navigate the user.",
                  "Use .bind(null, id) to pre-bind arguments to Server Actions in forms.",
                  "Server Actions work progressively — form submission works even without JavaScript."
        ],
        mistake: "Calling revalidatePath() before the mutation completes — await the database operation first, then revalidate.",
        shorthand: {
          verbose: "<form onSubmit={async (e) => {\n  e.preventDefault();\n  const data = new FormData(e.target);\n  const res = await fetch('/api/posts', { method: 'POST', body: data });\n}}>",
          concise: "<form action={createPost}>\n  {/* No fetch, no preventDefault, works without JS */}\n</form>\n\n'use server';\nexport async function createPost(formData) { ... }",
        },
      },
      {
        id: "middleware",
        fn: "middleware.ts",
        desc: "Runs on every matched request before it reaches the page or route handler. Used for auth, redirects, and headers.",
        category: "Middleware",
        subtitle: "Request interception at the edge",
        signature: "export function middleware(request: NextRequest) { return NextResponse... }",
        descLong: "middleware.ts at the project root runs at the edge before every matched request. Use the config.matcher to limit which routes trigger it. Common uses: auth checks, redirects, A/B testing, locale detection, and setting response headers. Middleware runs before cached content is served.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of middleware.ts — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts (project root)\nimport { NextRequest, NextResponse } from 'next/server';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of middleware.ts — common patterns you'll see in production.\n// APPROACH  - Combine middleware.ts with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst protectedRoutes = ['/dashboard', '/settings', '/admin'];\nexport function middleware(request: NextRequest) {\n  const token = request.cookies.get('auth-token')?.value;\n  const pathname = request.nextUrl.pathname;\n  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));\n  if (isProtected && !token) {\n    const loginUrl = new URL('/login', request.url);\n    loginUrl.searchParams.set('from', pathname);\n    return NextResponse.redirect(loginUrl);\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of middleware.ts — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst response = NextResponse.next();\n  response.headers.set('X-Frame-Options', 'DENY');\n  response.headers.set('X-Content-Type-Options', 'nosniff');\n  return response;\n}\nexport const config = {\n  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],\n};"
                  }
        ],
        tips: [
                  "Use the matcher config to avoid running middleware on static assets (_next/static, images).",
                  "Middleware runs at the edge — no Node.js APIs. Use lightweight JWT verification, not DB calls.",
                  "NextResponse.next() continues to the page; NextResponse.redirect() sends the user elsewhere.",
                  "Read and set cookies with request.cookies.get() and response.cookies.set()."
        ],
        mistake: "Making database calls in middleware — it runs at the edge (V8 runtime, no Node.js). Use lightweight token validation only; fetch user data in the page/layout.",
        shorthand: {
          verbose: "// Pages Router — getServerSideProps auth check\nexport async function getServerSideProps(ctx) {\n  const token = ctx.req.cookies.token;\n  if (!token) return { redirect: { destination: '/login' } };\n}",
          concise: "// App Router — middleware.ts edge check\nexport function middleware(request) {\n  if (!request.cookies.has('token')) {\n    return NextResponse.redirect(new URL('/login', request.url));\n  }\n}",
        },
      },
      {
        id: "cookies-headers-api",
        fn: "cookies() / headers()",
        desc: "Read cookies and headers from Server Components, Server Actions, and Route Handlers.",
        category: "Cookies & Headers",
        subtitle: "Server-side request data access",
        signature: "import { cookies, headers } from \"next/headers\"",
        descLong: "cookies() and headers() from next/headers provide access to request cookies and headers in Server Components, Server Actions, and Route Handlers. cookies() also allows setting and deleting cookies inside Server Actions and Route Handlers. These are async in Next.js 15.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of cookies() / headers() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { cookies, headers } from 'next/headers';\nimport { redirect } from 'next/navigation';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of cookies() / headers() — common patterns you'll see in production.\n// APPROACH  - Combine cookies() / headers() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Server Component — read auth cookie\nexport default async function Dashboard() {\n  const cookieStore = await cookies();\n  const token = cookieStore.get('auth-token')?.value;\n  if (!token) {\n    redirect('/login');\n  }\n  try {\n    const user = await verifyToken(token);\n    return <div>Welcome, {user.name}</div>;\n  } catch (error) {\n    redirect('/login');\n  }\n}\n// Server Action — set cookie after login\n'use server';\nexport async function loginAction(formData: FormData) {\n  const email = formData.get('email') as string;\n  const password = formData.get('password') as string;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of cookies() / headers() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst user = await authenticate(email, password);\n  const cookieStore = await cookies();\n  cookieStore.set('auth-token', user.token, {\n    httpOnly: true,\n    secure: process.env.NODE_ENV === 'production',\n    sameSite: 'lax',\n    maxAge: 60 * 60 * 24 * 7,\n  });\n  redirect('/dashboard');\n}"
                  }
        ],
        tips: [
                  "cookies() and headers() are async in Next.js 15 — always await them.",
                  "Cookies set in Server Actions are available immediately in the next render.",
                  "httpOnly: true prevents JavaScript access to the cookie — essential for auth tokens.",
                  "Use next/headers in Server Components and Actions; use NextRequest in Route Handlers."
        ],
        mistake: "Setting cookies in a Server Component — cookies() is read-only in Server Components. Use Server Actions or Route Handlers to write cookies.",
        shorthand: {
          verbose: "// Pages Router — getServerSideProps\nexport async function getServerSideProps({ req }) {\n  const token = req.cookies.token;\n}",
          concise: "// App Router — Server Component\nconst cookieStore = await cookies();\nconst token = cookieStore.get('auth-token')?.value;",
        },
      },
      {
        id: "action-validation",
        fn: "Server Action Validation",
        desc: "Validate Server Action input with Zod — return typed errors the client can display.",
        category: "Server Action Patterns",
        subtitle: "Type-safe input validation in actions",
        signature: "const result = schema.safeParse(data)  →  return { errors }",
        descLong: "Server Actions receive raw FormData or arbitrary input — always validate with a schema before using. Zod's safeParse returns a typed result object without throwing. Return validation errors as a plain object so the Client Component can display them field-by-field.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Server Action Validation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n'use server';\nimport { z } from 'zod';\nimport { revalidatePath } from 'next/cache';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Server Action Validation — common patterns you'll see in production.\n// APPROACH  - Combine Server Action Validation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst createPostSchema = z.object({\n  title: z.string().min(1, 'Title required').max(100),\n  content: z.string().min(10, 'Content too short'),\n  published: z.coerce.boolean(),\n});\nexport async function createPost(prevState, formData) {\n  const raw = {\n    title:     formData.get('title'),\n    content:   formData.get('content'),\n    published: formData.get('published'),\n  };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Server Action Validation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst result = createPostSchema.safeParse(raw);\n  if (!result.success) {\n    return {\n      errors: result.error.flatten().fieldErrors,\n      values: raw,  // preserve form values\n    };\n  }\n  await db.post.create({ data: result.data });\n  revalidatePath('/posts');\n  redirect('/posts');\n}"
                  }
        ],
        tips: [
                  "z.coerce.boolean() converts \"on\"/\"off\" checkbox FormData values to booleans.",
                  "Return prevValues alongside errors so the form can re-populate filled fields.",
                  "Use useActionState (React 19) to wire the action to a form and display errors.",
                  "Consider server-side authorization in the action before any database writes."
        ],
        mistake: "Trusting FormData values without validation — users can send any data via direct API calls. Always validate and sanitize on the server, regardless of client-side validation.",
        shorthand: {
          verbose: "export async function action(formData) {\n  const title = formData.get('title');\n  // Trust input — WRONG\n  await db.post.create({ data: { title } });\n}",
          concise: "const schema = z.object({ title: z.string().min(1) });\nexport async function action(formData) {\n  const result = schema.safeParse({ title: formData.get('title') });\n  if (!result.success) return { errors: result.error.flatten().fieldErrors };\n  await db.post.create({ data: result.data });\n}",
        },
      },
      {
        id: "nextrequest-nextresponse",
        fn: "NextRequest / NextResponse",
        desc: "Extended request/response objects in Route Handlers and middleware with typed access to headers, cookies, and body.",
        category: "Route Handlers",
        subtitle: "Typed request/response handling",
        signature: "NextRequest  |  NextResponse.json(data, options)",
        descLong: "NextRequest and NextResponse extend the native Web Request/Response APIs with Next.js-specific features. NextRequest provides typed access to headers, cookies, URL params, and body. NextResponse allows setting status, headers, cookies, and body. Both work in Route Handlers, middleware, and edge functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of NextRequest / NextResponse — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/api/users/route.ts\nimport { NextRequest, NextResponse } from 'next/server';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of NextRequest / NextResponse — common patterns you'll see in production.\n// APPROACH  - Combine NextRequest / NextResponse with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport async function POST(request: NextRequest) {\n  // Parse request body\n  const body = await request.json();\n  // Read headers\n  const contentType = request.headers.get('content-type');\n  const auth = request.headers.get('authorization');\n  // Read cookies\n  const sessionCookie = request.cookies.get('session')?.value;\n  // Read URL params\n  const { searchParams } = new URL(request.url);\n  const page = searchParams.get('page') ?? '1';\n  // Return JSON response\n  return NextResponse.json(\n    { data: 'success', page },\n    { status: 201, headers: { 'X-Custom': 'value' } }\n  );\n}\nexport async function DELETE(request: NextRequest) {\n  // No-content response\n  return new NextResponse(null, { status: 204 });\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of NextRequest / NextResponse — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// In middleware — read cookies, set response headers\nimport { NextResponse } from 'next/server';\nexport function middleware(request: NextRequest) {\n  const response = NextResponse.next();\n  // Set response header\n  response.headers.set('X-Request-Path', request.nextUrl.pathname);\n  // Modify or set cookies on response\n  response.cookies.set('custom-cookie', 'value', {\n    httpOnly: true,\n    secure: true,\n  });\n  return response;\n}"
                  }
        ],
        tips: [
                  "Use request.json() for JSON bodies; request.text() for text; request.formData() for forms.",
                  "NextResponse.json() is the preferred way to return JSON from Route Handlers.",
                  "Request/response headers and cookies are case-insensitive in .get() calls.",
                  "Use NextResponse.next() in middleware to continue; NextResponse.redirect() to redirect."
        ],
        mistake: "Returning plain objects from Route Handlers instead of NextResponse.json() — Route Handlers must return Response objects.",
        shorthand: {
          verbose: "export default function handler(req, res) {\n  res.setHeader('Content-Type', 'application/json');\n  res.status(200).json({ data: 'value' });\n}",
          concise: "export async function GET(request: NextRequest) {\n  return NextResponse.json({ data: 'value' });\n}",
        },
      },
      {
        id: "route-handler-caching",
        fn: "Route Handler Caching & Invalidation",
        desc: "GET Route Handlers are cached by default. Control caching and revalidation like pages.",
        category: "Route Handlers",
        subtitle: "Cache control for API routes",
        signature: "export const dynamic = \"force-dynamic\"  |  next: { revalidate: 60 }",
        descLong: "By default, GET Route Handlers are cached (similar to SSG). POST, PUT, DELETE are not cached. Use export const dynamic = \"force-dynamic\" to disable caching, or dynamic = \"force-static\" to opt in. Revalidate time-based with next.revalidate or on-demand with revalidatePath/revalidateTag. Data mutations should use POST/PUT/DELETE with Server Actions as an alternative.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Route Handler Caching & Invalidation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/api/posts/route.ts — GET cached by default\nexport const dynamic = 'force-dynamic';  // Opt out of caching"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Route Handler Caching & Invalidation — common patterns you'll see in production.\n// APPROACH  - Combine Route Handler Caching & Invalidation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport async function GET(request: NextRequest) {\n  // This runs on every request (no caching)\n  const posts = await db.post.findMany();\n  return NextResponse.json(posts);\n}\n// ISR — revalidate every 60 seconds\nexport async function GET(request: NextRequest) {\n  const posts = await db.post.findMany({\n    select: { id: true, title: true, published: true },\n  });\n  return NextResponse.json(posts, {\n    headers: {\n      'Cache-Control': 'public, max-age=60, s-maxage=60',\n    },\n  });\n}\n// app/api/posts/[id]/route.ts — dynamic route with tag-based revalidation\nimport { revalidateTag } from 'next/cache';\nexport async function PUT(\n  request: NextRequest,\n  { params }: { params: { id: string } }\n) {\n  const body = await request.json();\n  await db.post.update({\n    where: { id: params.id },\n    data: body,\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Route Handler Caching & Invalidation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Revalidate on demand\n  revalidateTag('posts');\n  revalidateTag(`post-${params.id}`);\n  return NextResponse.json({ success: true });\n}\nexport async function GET(\n  request: NextRequest,\n  { params }: { params: { id: string } }\n) {\n  const post = await db.post.findUnique({\n    where: { id: params.id },\n  });\n  if (!post) {\n    return NextResponse.json({ error: 'Not found' }, { status: 404 });\n  }\n  // Tag for revalidation\n  return NextResponse.json(post, {\n    headers: { 'Cache-Control': 'public, max-age=3600' },\n  });\n}"
                  }
        ],
        tips: [
                  "export const dynamic = \"force-dynamic\" disables caching for GET requests.",
                  "POST, PUT, PATCH, DELETE are never cached — they assume mutations.",
                  "Set Cache-Control headers for HTTP-level caching (CDN, browser).",
                  "Use revalidateTag/revalidatePath for Next.js-level revalidation."
        ],
        mistake: "Assuming POST Route Handlers are cached and forgetting to revalidate — POST/PUT are not cached by default, but you should still revalidate downstream pages.",
        shorthand: {
          verbose: "// No cache control — GET cached indefinitely\nexport const handler = async (req, res) => {\n  const data = await db.posts.find();\n  res.json(data);\n}",
          concise: "// Explicit dynamic behavior\nexport const dynamic = 'force-dynamic';  // always fresh\nexport async function GET() {\n  return NextResponse.json(await db.posts.find());\n}",
        },
      },
      {
        id: "form-submission-server-action",
        fn: "Server Actions with Forms",
        desc: "Bind Server Actions to <form action={...}> for progressive enhancement and no-JS fallback.",
        category: "Server Actions",
        subtitle: "Form submission without JavaScript",
        signature: "<form action={serverAction}> with Server Action",
        descLong: "Server Actions work with HTML <form> elements via the action prop. Forms submit without JavaScript (progressive enhancement). The browser redirects on success. Great for mutations: creating, updating, deleting. Combine with useActionState (React 19) for client-side loading and error states.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Server Actions with Forms — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/actions.ts\n'use server';\nimport { revalidatePath } from 'next/cache';\nimport { redirect } from 'next/navigation';\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Server Actions with Forms — common patterns you'll see in production.\n// APPROACH  - Combine Server Actions with Forms with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst postSchema = z.object({\n  title: z.string().min(1, 'Title required'),\n  content: z.string().min(10, 'Content too short'),\n});\nexport async function createPost(formData: FormData) {\n  const raw = {\n    title: formData.get('title'),\n    content: formData.get('content'),\n  };\n  const result = postSchema.safeParse(raw);\n  if (!result.success) {\n    return { errors: result.error.flatten().fieldErrors };\n  }\n  const post = await db.post.create({ data: result.data });\n  revalidatePath('/posts');\n  redirect(`/posts/${post.id}`);\n}\n// app/components/post-form.tsx — Client Component\n'use client';\nimport { createPost } from '@/app/actions';\nimport { useActionState } from 'react';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Server Actions with Forms — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport function PostForm() {\n  const [state, formAction, isPending] = useActionState(createPost, {\n    errors: {},\n  });\n  return (\n    <form action={formAction}>\n      <input\n        name=\"title\"\n        placeholder=\"Title\"\n        required\n        aria-invalid={!!state.errors.title}\n      />\n      {state.errors.title && (\n        <span>{state.errors.title}</span>\n      )}\n      <textarea\n        name=\"content\"\n        placeholder=\"Content\"\n        required\n        aria-invalid={!!state.errors.content}\n      />\n      {state.errors.content && (\n        <span>{state.errors.content}</span>\n      )}\n      <button type=\"submit\" disabled={isPending}>\n        {isPending ? 'Creating...' : 'Create'}\n      </button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Server Actions work without JavaScript — forms submit directly to the server.",
                  "useActionState provides isLoading and error handling for the action.",
                  "Return validation errors as an object; Server Action errors throw and show error boundary.",
                  "Use redirect() at the end to navigate after successful mutations."
        ],
        mistake: "Submitting forms with fetch and forgetting to revalidate — use Server Actions with revalidatePath() for integrated cache invalidation.",
        shorthand: {
          verbose: "<form onSubmit={async (e) => {\n  e.preventDefault();\n  const res = await fetch('/api/post', {\n    method: 'POST',\n    body: new FormData(e.target),\n  });\n  await revalidateUser();  // manual\n}}>",
          concise: "<form action={createPost}>\n  {/* automatic revalidation, works without JS */}\n</form>\n\n'use server';\nexport async function createPost(formData) {\n  await db.post.create({ ... });\n  revalidatePath('/posts');  // automatic\n}",
        },
      },
      {
        id: "action-error-handling",
        fn: "Server Action Error Handling",
        desc: "Throw errors in Server Actions to trigger error.tsx; return objects for validation errors.",
        category: "Server Actions",
        subtitle: "Error vs validation error patterns",
        signature: "throw new Error()  vs  return { errors: {...} }",
        descLong: "Server Actions have two error patterns. Throw an error to trigger the nearest error.tsx boundary — use for unexpected failures. Return an object with validation errors for form display — use for expected user input failures. The client receives the result object on validation errors, or the error boundary catches thrown errors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Server Action Error Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/actions.ts\n'use server';\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Server Action Error Handling — common patterns you'll see in production.\n// APPROACH  - Combine Server Action Error Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst schema = z.object({\n  email: z.string().email('Invalid email'),\n  password: z.string().min(8, 'Password too short'),\n});\nexport async function signup(formData: FormData) {\n  // Validation — return errors for client to display\n  const raw = {\n    email: formData.get('email'),\n    password: formData.get('password'),\n  };\n  const result = schema.safeParse(raw);\n  if (!result.success) {\n    return {\n      errors: result.error.flatten().fieldErrors,\n    };\n  }\n  // Server error — throw to trigger error.tsx\n  try {\n    const user = await db.user.create({ data: result.data });\n  } catch (error) {\n    if (error.code === 'P2002') {\n      // Prisma unique constraint — validation\n      return { errors: { email: ['Email already exists'] } };\n    }\n    // Unexpected error — throw\n    throw new Error('Failed to create account. Please try again.');\n  }\n  redirect('/dashboard');\n}\n// Client Component\n'use client';\nimport { signup } from './actions';\nimport { useActionState } from 'react';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Server Action Error Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport function SignupForm() {\n  const [state, formAction, isPending] = useActionState(signup, {\n    errors: {},\n  });\n  return (\n    <form action={formAction}>\n      <input name=\"email\" type=\"email\" required />\n      {state.errors?.email && <p>{state.errors.email[0]}</p>}\n      <input name=\"password\" type=\"password\" required />\n      {state.errors?.password && <p>{state.errors.password[0]}</p>}\n      <button disabled={isPending}>Sign Up</button>\n    </form>\n  );\n}\n// app/error.tsx — catches thrown errors\n'use client';\nexport default function Error({ error, reset }) {\n  return (\n    <div>\n      <h2>Something went wrong</h2>\n      <p>{error.message}</p>\n      <button onClick={reset}>Try again</button>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Return objects for validation errors — they're expected and handled by the form.",
                  "Throw errors for unexpected failures — they trigger the error boundary.",
                  "Database constraint violations (unique email) should return validation errors.",
                  "Use error.tsx for rendering thrown errors; useActionState for form state."
        ],
        mistake: "Throwing validation errors instead of returning them — the client can't display field-level validation errors from thrown exceptions.",
        shorthand: {
          verbose: "export async function signup(formData) {\n  const email = formData.get('email');\n  if (!validateEmail(email)) throw new Error('Invalid email');\n  // Error boundary catches — no field-level display\n}",
          concise: "export async function signup(formData) {\n  const result = schema.safeParse(formData);\n  if (!result.success) return { errors: result.error.flatten().fieldErrors };\n  // Form displays field errors\n}",
        },
      },
      {
        id: "cors-api-routes",
        fn: "CORS in Route Handlers",
        desc: "Handle CORS by returning headers in responses. Export OPTIONS for preflight.",
        category: "Route Handlers",
        subtitle: "Cross-origin request handling",
        signature: "response.headers.set(\"Access-Control-Allow-Origin\", \"*\")",
        descLong: "Browsers enforce CORS for cross-origin requests. In Route Handlers, set CORS headers on responses. Export an OPTIONS function for preflight requests. By default, same-origin requests work; cross-origin requests are blocked unless the response includes CORS headers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CORS in Route Handlers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/api/data/route.ts\nimport { NextRequest, NextResponse } from 'next/server';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CORS in Route Handlers — common patterns you'll see in production.\n// APPROACH  - Combine CORS in Route Handlers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport async function GET(request: NextRequest) {\n  const data = { message: 'Hello' };\n  return NextResponse.json(data, {\n    headers: {\n      'Access-Control-Allow-Origin': '*',\n      'Access-Control-Allow-Methods': 'GET, POST',\n      'Access-Control-Allow-Headers': 'Content-Type, Authorization',\n    },\n  });\n}\nexport async function POST(request: NextRequest) {\n  const body = await request.json();\n  return NextResponse.json({ received: body }, {\n    headers: {\n      'Access-Control-Allow-Origin': '*',\n    },\n  });\n}\n// Handle preflight requests\nexport async function OPTIONS(request: NextRequest) {\n  return new NextResponse(null, {\n    status: 200,\n    headers: {\n      'Access-Control-Allow-Origin': '*',\n      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',\n      'Access-Control-Allow-Headers': 'Content-Type, Authorization',\n      'Access-Control-Max-Age': '86400',\n    },\n  });\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CORS in Route Handlers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Specific origin allowlist\nconst allowedOrigins = ['https://example.com', 'https://app.example.com'];\nfunction getCORSHeaders(origin: string) {\n  if (allowedOrigins.includes(origin)) {\n    return {\n      'Access-Control-Allow-Origin': origin,\n      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',\n      'Access-Control-Allow-Headers': 'Content-Type, Authorization',\n      'Access-Control-Allow-Credentials': 'true',\n    };\n  }\n  return {};\n}\nexport async function GET(request: NextRequest) {\n  const origin = request.headers.get('origin') || '';\n  const data = { message: 'Data' };\n  return NextResponse.json(data, {\n    headers: getCORSHeaders(origin),\n  });\n}"
                  }
        ],
        tips: [
                  "Access-Control-Allow-Origin: \"*\" allows any origin but disables credentials (cookies, auth headers).",
                  "Use an allowlist for production APIs — check request.headers.get(\"origin\").",
                  "Access-Control-Allow-Credentials: true requires specific origins (not \"*\").",
                  "OPTIONS is for preflight — browsers send it before actual requests with custom headers."
        ],
        mistake: "Setting Access-Control-Allow-Credentials: true with Access-Control-Allow-Origin: \"*\" — the browser will reject it. Use a specific origin instead.",
        shorthand: {
          verbose: "// No CORS headers — request blocked\nexport default function handler(req, res) {\n  res.json({ data: 'value' });\n}",
          concise: "export async function GET(request: NextRequest) {\n  return NextResponse.json({ data: 'value' }, {\n    headers: { 'Access-Control-Allow-Origin': '*' },\n  });\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
