export const meta = {
  "title": "Rendering & Performance",
  "domain": "nextjs",
  "sheet": "rendering",
  "icon": "⚡"
}

export const sections = [

  // ── Section 1: Server & Client Components ─────────────────────────────────────────
  {
    id: "rsc-fundamentals",
    title: "Server & Client Components",
    entries: [
      {
        id: "rsc-benefits",
        fn: "React Server Components (RSC)",
        desc: "Server Components render on the server and don't ship JavaScript. Access databases and secrets directly.",
        category: "Server Components",
        subtitle: "Zero-JS components with direct DB access",
        signature: "default export from app/ = Server Component",
        descLong: "React Server Components (RSC) run entirely on the server and send only HTML to the browser. They reduce JavaScript bundle size, hide API keys, and simplify data fetching. Server Components can be async and fetch data directly. The tradeoff: no hooks, no event listeners, no browser APIs. Most components should be Server Components.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of React Server Components (RSC) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// lib/data.ts\nexport async function getPostData(slug: string) {\n  // Direct database access — not exposed to client\n  const post = await db.post.findUnique({\n    where: { slug },\n    include: { author: true, comments: true },\n  });\n  return post;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of React Server Components (RSC) — common patterns you'll see in production.\n// APPROACH  - Combine React Server Components (RSC) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// app/blog/[slug]/page.tsx — Server Component\nimport { getPostData } from '@/lib/data';\nexport default async function BlogPost({ params }) {\n  // No \"use client\" — this is a Server Component by default\n  const post = await getPostData(params.slug);\n  return (\n    <article className=\"post\">\n      <h1>{post.title}</h1>\n      <p>By {post.author.name}</p>\n      <div>{post.content}</div>\n      {/* Server Component as a child */}\n      <CommentSection postId={post.id} />\n      {/* Client Component as a child */}\n      <CommentForm postId={post.id} />\n    </article>\n  );\n}\n// app/blog/comment-section.tsx — Server Component (child)\nasync function CommentSection({ postId }) {\n  const comments = await db.comment.findMany({ where: { postId } });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of React Server Components (RSC) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <section>\n      <h2>Comments ({comments.length})</h2>\n      {comments.map(comment => (\n        <Comment key={comment.id} comment={comment} />\n      ))}\n    </section>\n  );\n}\n// app/blog/comment-form.tsx — Client Component\n'use client';\nimport { useFormStatus } from 'react-dom';\nfunction CommentForm({ postId }) {\n  const { pending } = useFormStatus();\n  async function handleSubmit(formData: FormData) {\n    // Client-side validation\n    const text = formData.get('text')?.toString();\n    if (!text) return;\n    // Call Server Action\n    await submitComment(postId, text);\n  }\n  return (\n    <form action={handleSubmit}>\n      <textarea name=\"text\" placeholder=\"Add a comment\" required />\n      <button disabled={pending}>\n        {pending ? 'Posting...' : 'Post Comment'}\n      </button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "By default, components in app/ are Server Components — no \"use client\" needed.",
                  "Server Components are async by default — use await at the top level.",
                  "Import a Server Component into a Client Component and it becomes a Client Component.",
                  "Push \"use client\" as deep as possible to maximize Server Components."
        ],
        mistake: "Adding \"use client\" to root layout or all components — you lose Server Component benefits (no JS shipped, direct DB). Only use it where needed.",
        shorthand: {
          verbose: "export default function BlogPost() {\n  const [post, setPost] = useState(null);\n  useEffect(() => {\n    fetch('/api/post').then(r => r.json()).then(setPost);\n  }, []);\n  return <article>{post?.content}</article>;\n}",
          concise: "export default async function BlogPost({ params }) {\n  const post = await getPost(params.slug);\n  return <article>{post.content}</article>;\n}",
        },
      },
      {
        id: "client-component-boundaries",
        fn: "Client Component Boundaries",
        desc: "\"use client\" marks a boundary — all imports become client code. Place boundaries strategically.",
        category: "Server & Client",
        subtitle: "Smart component splitting for bundle size",
        signature: "\"use client\"  at the top of file",
        descLong: "When you add \"use client\" to a component, that file and all its imports become part of the client bundle. Placing boundaries strategically minimizes client-side code. Keep heavy data-fetching components as Server Components and only wrap interactive leaf components with \"use client\".",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Client Component Boundaries — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/dashboard/layout.tsx — Server Component (parent)\nimport { getUser, getStats } from '@/lib/data';\nimport { DashboardShell } from './shell';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Client Component Boundaries — common patterns you'll see in production.\n// APPROACH  - Combine Client Component Boundaries with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport default async function DashboardLayout({ children }) {\n  const user = await getUser();  // Server-side only\n  const stats = await getStats(); // Server-side only\n  // DashboardShell is \"use client\" but receives server data as props\n  return (\n    <DashboardShell user={user} stats={stats}>\n      {children}\n    </DashboardShell>\n  );\n}\n// app/dashboard/shell.tsx — Client Component (interactive)\n'use client';\nimport { useState } from 'react';\nimport { usePathname } from 'next/navigation';\nexport function DashboardShell({ user, stats, children }) {\n  const [sidebarOpen, setSidebarOpen] = useState(true);\n  const pathname = usePathname();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Client Component Boundaries — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div className=\"dashboard\">\n      <Sidebar\n        open={sidebarOpen}\n        onToggle={() => setSidebarOpen(!sidebarOpen)}\n        user={user}\n      />\n      <main>{children}</main>\n    </div>\n  );\n}\n// GOOD PATTERN:\n// Parent (Server) → fetches data, passes to child\n// Child (Client) → uses hooks, interactivity\n// Result: minimal client JS, data stays on server\n// BAD PATTERN:\n// \"use client\" at the top level\n// → entire page becomes client code\n// → no direct database access\n// → larger bundle"
                  }
        ],
        tips: [
                  "Pass server data as props from Server → Client components.",
                  "Keep data fetching in Server Components; pass results as props.",
                  "Use the \"use client\" boundary only where hooks/interactivity are needed.",
                  "Each \"use client\" boundary creates a separate client chunk."
        ],
        mistake: "Adding \"use client\" to a parent just to use hooks in one child — wrap only the interactive child instead.",
        shorthand: {
          verbose: "'use client';\nexport default function Layout({ children }) {\n  const user = await getUser();  // ERROR — no await in Client\n  return <>{user?.name}{children}</>;\n}",
          concise: "// Server Component — fetch data\nexport default async function Layout({ children }) {\n  const user = await getUser();\n  return <Shell user={user}>{children}</Shell>;\n}\n\n'use client';  // Only Client Component\nfunction Shell({ user, children }) { ... }",
        },
      },
    ],
  },

  // ── Section 2: Streaming & Suspense ─────────────────────────────────────────
  {
    id: "streaming-performance",
    title: "Streaming & Suspense",
    entries: [
      {
        id: "streaming-html",
        fn: "HTML Streaming",
        desc: "Next.js streams HTML chunks as they render. The page shell renders first, slow components stream later.",
        category: "Streaming",
        subtitle: "Progressive page delivery",
        signature: "<Suspense fallback={...}>",
        descLong: "Next.js App Router streams HTML by default. The server starts sending the page shell immediately while slow async components render. Suspense boundaries mark sections that can stream independently. Users see content progressively instead of waiting for the entire page.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HTML Streaming — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/dashboard/page.tsx\nimport { Suspense } from 'react';\nimport { DashboardSkeleton, ChartSkeleton } from './skeletons';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HTML Streaming — common patterns you'll see in production.\n// APPROACH  - Combine HTML Streaming with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Fast components render immediately\nfunction Header() {\n  return <h1>Dashboard</h1>;\n}\nfunction Sidebar() {\n  return <nav>Navigation</nav>;\n}\n// Slow components wrap in Suspense\nasync function Analytics() {\n  const data = await getAnalyticsData(); // 2-3 seconds\n  return <Chart data={data} />;\n}\nasync function UserMetrics() {\n  const metrics = await getUserMetrics(); // 1-2 seconds\n  return <MetricsGrid metrics={metrics} />;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HTML Streaming — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport default function Dashboard() {\n  return (\n    <div className=\"dashboard\">\n      {/* Renders immediately */}\n      <Header />\n      <div className=\"content-wrapper\">\n        <Sidebar />\n        {/* Shows skeleton while loading */}\n        <Suspense fallback={<ChartSkeleton />}>\n          <Analytics />\n        </Suspense>\n        {/* Independent — doesn't wait for Analytics */}\n        <Suspense fallback={<div>Loading metrics...</div>}>\n          <UserMetrics />\n        </Suspense>\n      </div>\n    </div>\n  );\n}\n// Timeline:\n// T=0ms: Header + Sidebar HTML sent\n// T=100ms: ChartSkeleton + MetricsLoading placeholders streamed\n// T=1200ms: UserMetrics component streams in\n// T=2800ms: Analytics component streams in\n// User sees content progressively, not waiting for everything"
                  }
        ],
        tips: [
                  "Each Suspense boundary streams independently — one slow component doesn't block others.",
                  "loading.tsx is Suspense for the entire page — use inline Suspense for granular control.",
                  "Skeleton components should match the visual layout of the real content.",
                  "Keep the shell (header, nav) outside Suspense so it renders immediately."
        ],
        mistake: "Putting all data fetching in one place and wrapping the entire page in one Suspense — co-locate fetches with components and nest boundaries.",
        shorthand: {
          verbose: "// Wait for everything\nconst a = await slowFetch1();\nconst b = await slowFetch2();\nconst c = await slowFetch3();\nreturn <A /><B /><C />;  // All wait",
          concise: "// Stream independently\n<Suspense><Slow1 /></Suspense>\n<Suspense><Slow2 /></Suspense>\n<Suspense><Slow3 /></Suspense>  // Each streams as ready",
        },
      },
      {
        id: "suspense-patterns",
        fn: "Suspense Patterns & Best Practices",
        desc: "Nest Suspense boundaries for progressive loading. One boundary per async component group.",
        category: "Streaming",
        subtitle: "Granular Suspense boundaries",
        signature: "<Suspense fallback={<Skeleton />}>",
        descLong: "Suspense works best with nested, granular boundaries. One boundary per logical component group prevents one slow fetch from blocking the entire page. Combine with parallel data fetching (Promise.all) to maximize concurrency within a Suspense boundary.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Suspense Patterns & Best Practices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// GOOD: Granular boundaries\nexport default function Dashboard() {\n  return (\n    <div>\n      <Header />  {/* instant */}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Suspense Patterns & Best Practices — common patterns you'll see in production.\n// APPROACH  - Combine Suspense Patterns & Best Practices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n<Suspense fallback={<ChartLoading />}>\n        <RevenueChart />  {/* loads independently */}\n      </Suspense>\n      <Suspense fallback={<TableLoading />}>\n        <RecentOrders />  {/* loads independently */}\n      </Suspense>\n      <Suspense fallback={<ListLoading />}>\n        <TodoList />  {/* loads independently */}\n      </Suspense>\n    </div>\n  );\n}\n// BETTER: Nested boundaries\nexport default function Dashboard() {\n  return (\n    <div>\n      <Header />\n      <Suspense fallback={<DashboardSkeleton />}>\n        <MainContent />\n      </Suspense>\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Suspense Patterns & Best Practices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// app/dashboard/main-content.tsx — nested boundaries\nasync function MainContent() {\n  return (\n    <div className=\"grid\">\n      <Suspense fallback={<ChartSkeleton />}>\n        <RevenueChart />\n      </Suspense>\n      <Suspense fallback={<TableSkeleton />}>\n        <RecentOrders />\n      </Suspense>\n    </div>\n  );\n}\n// BEST: Parallel data fetching within boundaries\nasync function RevenueChart() {\n  const [revenue, forecast] = await Promise.all([\n    getRevenue(),      // don't await individually\n    getForecast(),     // parallel = faster\n  ]);\n  return <Chart revenue={revenue} forecast={forecast} />;\n}"
                  }
        ],
        tips: [
                  "Promise.all() for independent fetches within the same component.",
                  "One Suspense boundary per async component group.",
                  "Nested boundaries prevent top-level slow fetches from blocking the entire page.",
                  "loading.tsx is convenient for simple cases; inline Suspense is more flexible."
        ],
        mistake: "Sequential awaits in one component inside a Suspense boundary — use Promise.all() for independent data fetches.",
        shorthand: {
          verbose: "async function Chart() {\n  const revenue = await getRevenue();  // 1s\n  const forecast = await getForecast();  // 1s\n  return <></>;  // 2s total\n}",
          concise: "async function Chart() {\n  const [revenue, forecast] = await Promise.all([\n    getRevenue(), getForecast()\n  ]);  // 1s total (parallel)",
        },
      },
    ],
  },

  // ── Section 3: Advanced Rendering Techniques ─────────────────────────────────────────
  {
    id: "advanced-rendering",
    title: "Advanced Rendering Techniques",
    entries: [
      {
        id: "partial-prerendering",
        fn: "Partial Prerendering (PPR)",
        desc: "Prerender the static shell at build time; stream dynamic content on demand. Fast TTFB, fresh data.",
        category: "Performance",
        subtitle: "Hybrid static + dynamic rendering",
        signature: "export const experimental_ppr = true",
        descLong: "Partial Prerendering (PPR) combines static prerendering with dynamic streaming. The static shell prerendered at build time renders immediately with a fast TTFB. Dynamic Suspense boundaries stream their content on each request. Gives the speed of SSG with the freshness of SSR.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Partial Prerendering (PPR) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// next.config.js\nconst nextConfig = {\n  experimental: {\n    ppr: 'incremental',  // Enable PPR\n  },\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Partial Prerendering (PPR) — common patterns you'll see in production.\n// APPROACH  - Combine Partial Prerendering (PPR) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport default nextConfig;\n// app/blog/[slug]/page.tsx\nexport const experimental_ppr = true;  // Enable PPR for this page\nasync function BlogPost({ params }) {\n  // This part is prerendered at build time (no await here at top level)\n  return (\n    <article>\n      <h1>Blog Post</h1>\n      {/* Streamed on each request */}\n      <Suspense fallback={<ContentSkeleton />}>\n        <BlogContent slug={params.slug} />\n      </Suspense>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Partial Prerendering (PPR) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n{/* Independently streamed */}\n      <Suspense fallback={<CommentSkeleton />}>\n        <Comments slug={params.slug} />\n      </Suspense>\n    </article>\n  );\n}\n// app/blog/blog-content.tsx\nasync function BlogContent({ slug }) {\n  const post = await db.post.findUnique({ where: { slug } });\n  return <div>{post.content}</div>;\n}\n// Timeline with PPR:\n// Build time: Static shell generated (h1, structure)\n// Request time:\n//   T=0ms: Static shell sent (instant TTFB)\n//   T=0ms: BlogContent starts fetching\n//   T=0ms: Comments starts fetching (parallel)\n//   T=200ms: Content streams in\n//   T=300ms: Comments stream in"
                  }
        ],
        tips: [
                  "PPR gives the TTFB of SSG with the freshness of SSR.",
                  "Prerendered parts don't depend on params — only layout and static structure.",
                  "Dynamic parts wrap in Suspense — they fetch on each request.",
                  "Experimental in Next.js 15 — use with caution in production."
        ],
        mistake: "Trying to render dynamic content outside Suspense in PPR pages — dynamic content must be in Suspense boundaries.",
        shorthand: {
          verbose: "// Full dynamic (SSR) — always fresh but slower TTFB\nconst post = await getPost(slug);\nreturn <article>{post}</article>;",
          concise: "// PPR — fast TTFB + fresh content\nexport const experimental_ppr = true;\n<h1>Post</h1>  {/* prerendered */}\n<Suspense><Content slug={slug} /></Suspense>  {/* fresh*/}",
        },
      },
      {
        id: "dynamic-rendering",
        fn: "Dynamic vs Static Rendering",
        desc: "Dynamic rendering (SSR) on every request vs Static rendering (SSG) at build time.",
        category: "Rendering Modes",
        subtitle: "Understanding rendering strategies",
        signature: "export const dynamic = \"force-dynamic\"  |  \"force-static\"  |  \"auto\"",
        descLong: "By default, Next.js uses dynamic rendering (renders on each request) if there are async operations or dynamic functions. Use export const dynamic = \"force-static\" to force static rendering. dynamic = \"force-dynamic\" always renders on request. Auto (default) detects usage automatically.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dynamic vs Static Rendering — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/page.tsx — Dynamic (SSR) by default\nexport default async function Home() {\n  const data = await fetch('/api/dynamic-data');  // Makes it dynamic\n  return <div>{data}</div>;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dynamic vs Static Rendering — common patterns you'll see in production.\n// APPROACH  - Combine Dynamic vs Static Rendering with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Force static — will build fail if used with dynamic functions\nexport const dynamic = 'force-static';\nexport default function StaticPage() {\n  // No dynamic functions allowed\n  return <div>Static content only</div>;\n}\n// Force dynamic — always re-render\nexport const dynamic = 'force-dynamic';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dynamic vs Static Rendering — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport default async function LiveData() {\n  const data = await fetch('/api/live', { cache: 'no-store' });\n  return <div>{data.timestamp}</div>;  // Always fresh\n}\n// With ISR — static with periodic revalidation\nexport const revalidate = 60;  // Revalidate every 60 seconds\nexport default async function BlogList() {\n  const posts = await fetch('/api/posts', {\n    next: { revalidate: 60 },\n  });\n  return <PostList posts={posts} />;\n}"
                  }
        ],
        tips: [
                  "dynamic = \"auto\" is the default — Next.js chooses based on usage.",
                  "Use force-static for truly static content.",
                  "Use force-dynamic for real-time data (live charts, prices).",
                  "Combine with revalidate for hybrid static + on-demand rendering."
        ],
        mistake: "Using force-static with dynamic functions — Next.js will error. Use auto/force-dynamic instead.",
        shorthand: {
          verbose: "// SSG — build time, never updates\nexport async function generateStaticParams() { ... }\nexport default function Page() { return <Static />; }",
          concise: "// SSR — on each request, always fresh\nexport const dynamic = 'force-dynamic';\nexport default async function Page() {\n  const data = await fetch(url, { cache: 'no-store' });\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
