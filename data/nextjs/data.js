export const meta = {
  "title": "Data Fetching & Caching",
  "domain": "nextjs",
  "sheet": "data",
  "icon": "🗄️"
}

export const sections = [

  // ── Section 1: Data Fetching & Caching ─────────────────────────────────────────
  {
    id: "data-fetching-caching",
    title: "Data Fetching & Caching",
    entries: [
      {
        id: "server-component-fetch",
        fn: "Server Component Data Fetching",
        desc: "Fetch data directly in async Server Components — no useEffect, no API round-trip from the client.",
        category: "Server Components",
        subtitle: "Fetch data where it's rendered — on the server",
        signature: "export default async function Page() { const data = await fetch(...) }",
        descLong: "Next.js Server Components are async by default. You can await data fetches directly at the top level — no useState, no useEffect, no loading states needed. Data never crosses the network to the client; only the rendered HTML does. Parallel fetches with Promise.all() maximize performance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Server Component Data Fetching — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/dashboard/page.tsx — Server Component (default)\nexport default async function Dashboard() {\n  // Parallel fetches — run simultaneously\n  const [user, posts, stats] = await Promise.all([\n    getUser(),\n    getPosts(),\n    getStats(),\n  ]);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Server Component Data Fetching — common patterns you'll see in production.\n// APPROACH  - Combine Server Component Data Fetching with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nreturn (\n    <main>\n      <h1>Welcome, {user.name}</h1>\n      <StatsGrid stats={stats} />\n      <PostList posts={posts} />\n    </main>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Server Component Data Fetching — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Nested — each component fetches its own data\nasync function UserAvatar({ userId }: { userId: string }) {\n  const user = await getUser(userId); // deduped by React cache\n  return <img src={user.avatar} alt={user.name} />;\n}"
                  }
        ],
        tips: [
                  "Server Components can be async — await fetches directly at the top level.",
                  "Co-locate data fetching with the component that needs it — no prop drilling for server data.",
                  "Next.js deduplicates identical fetch() calls within the same request automatically.",
                  "Use Promise.all() for independent fetches to avoid waterfall latency."
        ],
        mistake: "Using useEffect to fetch data in a Server Component — Server Components don't support hooks. Use await at the top level instead.",
        shorthand: {
          verbose: "export default function Page() {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch('/api/data').then(r => r.json()).then(setData);\n  }, []);\n  return <div>{data?.name}</div>;\n}",
          concise: "export default async function Page() {\n  const data = await fetch('/api/data').then(r => r.json());\n  return <div>{data.name}</div>;\n}",
        },
      },
      {
        id: "fetch-cache",
        fn: "fetch() Caching",
        desc: "Next.js extends native fetch with caching options: force-cache, no-store, and revalidate.",
        category: "Fetch Caching",
        subtitle: "Control per-request caching behavior",
        signature: "fetch(url, { cache: \"force-cache\" | \"no-store\", next: { revalidate: seconds } })",
        descLong: "Next.js augments the native fetch API with caching. force-cache (default in older versions) caches indefinitely. no-store always fetches fresh. next.revalidate sets a time-based revalidation window (ISR). In Next.js 15, the default changed to no-store — opt in to caching explicitly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of fetch() Caching — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Static — cache forever (SSG-like)\nconst data = await fetch('/api/config', {\n  cache: 'force-cache',\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of fetch() Caching — common patterns you'll see in production.\n// APPROACH  - Combine fetch() Caching with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Dynamic — never cache (SSR-like)\nconst data = await fetch('/api/live-prices', {\n  cache: 'no-store',\n});\n// ISR — revalidate every 60 seconds\nconst posts = await fetch('/api/posts', {\n  next: { revalidate: 60 },\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of fetch() Caching — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Tag-based revalidation\nconst post = await fetch(`/api/posts/${id}`, {\n  next: { tags: [`post-${id}`] },\n});\n// Trigger revalidation from a Server Action\nimport { revalidateTag } from 'next/cache';\nrevalidateTag(`post-${id}`); // on demand"
                  }
        ],
        tips: [
                  "Next.js 15 defaults to no-store — explicitly set cache: \"force-cache\" when you want caching.",
                  "next.tags enables on-demand revalidation — perfect for CMS webhooks.",
                  "revalidateTag and revalidatePath can be called from Server Actions or Route Handlers.",
                  "Third-party libraries (ORM, SDK) don't use fetch — wrap their calls with React's cache() function."
        ],
        mistake: "Assuming fetch is cached by default in Next.js 15 — the default changed to no-store. Explicitly opt in to caching for static or ISR behavior.",
        shorthand: {
          verbose: "// No cache control — fetch every time\nconst data = await fetch('/api/data');\n// Or revalidate is vague\nconst data = await fetch('/api/data', { cache: undefined });",
          concise: "// Explicit caching\nfetch(url, { cache: 'force-cache' })  // static\nfetch(url, { cache: 'no-store' })  // always fresh\nfetch(url, { next: { revalidate: 60 } })  // ISR",
        },
      },
      {
        id: "react-cache",
        fn: "cache()",
        desc: "Wraps a function to deduplicate calls with the same arguments within a single React render tree.",
        category: "Fetch Caching",
        subtitle: "Deduplicate server-side data fetching",
        signature: "import { cache } from \"react\"  →  const getUser = cache(async (id) => ...)",
        descLong: "React's cache() function memoizes the wrapped function per request. Multiple components calling getUser(123) in the same render will share one database query. Resets per request — no stale data across requests. Next.js automatically deduplicates fetch() calls; use cache() for non-fetch data sources like database calls.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of cache() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// lib/data.ts\nimport { cache } from 'react';\nimport { db } from './db';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of cache() — common patterns you'll see in production.\n// APPROACH  - Combine cache() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Deduplicated across all components in the same request\nexport const getUser = cache(async (id: string) => {\n  return db.user.findUnique({ where: { id } });\n});\nexport const getPost = cache(async (slug: string) => {\n  return db.post.findUnique({ where: { slug } });\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of cache() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Layout fetches user\nasync function DashboardLayout({ children }) {\n  const user = await getUser(userId);   // DB hit\n  return <Sidebar user={user}>{children}</Sidebar>;\n}\n// Page also fetches same user — DEDUPED, no extra DB hit\nasync function DashboardPage() {\n  const user = await getUser(userId);   // returns cached result\n  return <ProfileCard user={user} />;\n}"
                  }
        ],
        tips: [
                  "cache() is the non-fetch equivalent of Next.js fetch deduplication.",
                  "Wrap your data access layer functions (db queries) with cache() at the source.",
                  "cache() resets between requests — it's per-render-tree, not a persistent cache.",
                  "Combine cache() with next/cache revalidation to persist data between requests."
        ],
        mistake: "Using a module-level variable to cache across requests — it persists between requests and leaks data between users. React's cache() is request-scoped.",
        shorthand: {
          verbose: "let cachedUser = null;  // WRONG — persists across requests\nfunction getUser(id) {\n  if (cachedUser?.id === id) return cachedUser;\n  cachedUser = db.user.findUnique(id);\n  return cachedUser;\n}",
          concise: "import { cache } from 'react';\nexport const getUser = cache(async (id) => {\n  return db.user.findUnique({ where: { id } });\n});",
        },
      },
      {
        id: "use-client",
        fn: "\"use client\" / \"use server\"",
        desc: "\"use client\" opts a component into the client bundle. \"use server\" marks Server Actions.",
        category: "Rendering Strategies",
        subtitle: "Boundary directives for client/server",
        signature: "\"use client\"  (top of file)  |  \"use server\"  (top of file or function)",
        descLong: "By default, all components in app/ are Server Components. \"use client\" at the top of a file marks it (and its imports) as a Client Component — it ships to the browser and can use hooks and browser APIs. \"use server\" in an async function creates a Server Action — a server-side RPC callable from the client.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of \"use client\" / \"use server\" — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/components/counter.tsx — Client Component\n'use client';\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of \"use client\" / \"use server\" — common patterns you'll see in production.\n// APPROACH  - Combine \"use client\" / \"use server\" with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>Increment</button>\n    </div>\n  );\n}\n// app/actions.ts — Server Actions\n'use server';\nimport { revalidatePath } from 'next/cache';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of \"use client\" / \"use server\" — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport async function createPost(formData: FormData) {\n  const title = formData.get('title') as string;\n  if (!title) throw new Error('Title required');\n  await db.post.create({ data: { title } });\n  revalidatePath('/posts');\n}\n// app/components/post-form.tsx — Client Component using action\n'use client';\nimport { createPost } from '@/app/actions';\nexport function PostForm() {\n  return (\n    <form action={createPost}>\n      <input name=\"title\" placeholder=\"Title\" required />\n      <button type=\"submit\">Create</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "\"use client\" marks a boundary — all components imported by a Client Component are also client.",
                  "Push \"use client\" as deep as possible — keep data-heavy ancestors as Server Components.",
                  "Server Actions can be in a separate actions.ts file with \"use server\" at the top.",
                  "Server Actions can be called from both <form action={...}> and onClick handlers."
        ],
        mistake: "Adding \"use client\" to every component by default — you lose Server Component benefits (no JS shipped, direct DB access). Only add it when you need hooks or browser APIs.",
        shorthand: {
          verbose: "// Pages Router with getServerSideProps\nexport async function getServerSideProps() {\n  const data = await db.query();\n  return { props: { data } };\n}\nexport default function Page({ data }) {\n  const [count, setCount] = useState(0);\n  return <div>{data}</div>;\n}",
          concise: "// App Router — Server Component by default\nexport default async function Page() {\n  const data = await db.query();\n  return <ClientCounter data={data} />;\n}\n\n'use client';  // Only Client Component\nfunction ClientCounter({ data }) {\n  const [count, setCount] = useState(0);\n  return <div>{data}</div>;\n}",
        },
      },
      {
        id: "next-image",
        fn: "next/image",
        desc: "Automatic image optimization — WebP/AVIF conversion, lazy loading, responsive sizes, and CLS prevention.",
        category: "Image, Font & Script Optimization",
        subtitle: "Optimized images with zero configuration",
        signature: "import Image from \"next/image\"",
        descLong: "The Next.js Image component automatically converts images to WebP/AVIF, generates responsive srcsets, lazy loads offscreen images, and reserves layout space to prevent Cumulative Layout Shift. Requires width and height (or fill) for sizing. Remote images need domain allowlisting in next.config.js.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of next/image — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport Image from 'next/image';\nimport profilePic from './avatar.png';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of next/image — common patterns you'll see in production.\n// APPROACH  - Combine next/image with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport function ProfileCard({ user }) {\n  return (\n    <div className=\"profile\">\n      {/* Local image — width/height inferred */}\n      <Image\n        src={profilePic}\n        alt={user.name}\n        className=\"avatar\"\n      />\n      {/* Remote image — explicit size */}\n      {user.coverImage && (\n        <Image\n          src={user.coverImage}\n          alt=\"Cover\"\n          width={800}\n          height={400}\n          priority\n          sizes=\"(max-width: 768px) 100vw, 800px\"\n        />\n      )}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of next/image — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<h2>{user.name}</h2>\n      <p>{user.bio}</p>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Add priority to your LCP (Largest Contentful Paint) image — it disables lazy loading for that image.",
                  "sizes prop tells the browser which image to download at which viewport width.",
                  "fill mode requires the parent to have position: relative and a defined height.",
                  "Use placeholder=\"blur\" with blurDataURL for a blur-up loading effect."
        ],
        mistake: "Using <img> instead of <Image> for large images — you miss automatic WebP conversion, lazy loading, and CLS prevention.",
        shorthand: {
          verbose: "// Manual / verbose approach\n<img src=\"/image.jpg\" width=\"800\" height=\"600\" />\n{/* No optimization, no lazy loading, layout shift risk */}\n// More explicit but longer",
          concise: "import Image from 'next/image';\n<Image src={imageFile} alt=\"...\" />\n{/* Auto WebP, lazy load, zero CLS */}",
        },
      },
      {
        id: "next-font",
        fn: "next/font",
        desc: "Self-host Google Fonts and local fonts with automatic CSS variables and zero layout shift.",
        category: "Image, Font & Script Optimization",
        subtitle: "Zero-CLS font loading with self-hosting",
        signature: "import { Inter } from \"next/font/google\"",
        descLong: "next/font downloads and self-hosts Google Fonts at build time — no runtime requests to Google, no privacy concerns. Fonts are automatically optimized and served via Next.js. CSS variables make fonts available globally. Font files are included in the build output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of next/font — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/layout.tsx\nimport { Inter, Roboto_Mono } from 'next/font/google';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of next/font — common patterns you'll see in production.\n// APPROACH  - Combine next/font with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst inter = Inter({\n  subsets: ['latin'],\n  display: 'swap',\n  variable: '--font-inter',   // CSS variable\n});\nconst mono = Roboto_Mono({\n  subsets: ['latin'],\n  variable: '--font-mono',\n});\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\" className={`${inter.variable} ${mono.variable}`}>\n      <body className={inter.className}>\n        {children}\n      </body>\n    </html>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of next/font — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Local font\nimport localFont from 'next/font/local';\nconst myFont = localFont({ src: './MyFont.woff2' });\n// CSS usage\n// font-family: var(--font-inter);"
                  }
        ],
        tips: [
                  "variable option creates a CSS custom property — use it to apply fonts via Tailwind or CSS.",
                  "display: \"swap\" shows a fallback font until the custom font loads.",
                  "Subsetting (subsets: [\"latin\"]) reduces font file size significantly.",
                  "next/font eliminates the Google Fonts render-blocking script tag."
        ],
        mistake: "Using <link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/...\"> in the layout — it blocks rendering and sends requests to Google. Use next/font instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n<link href=\"https://fonts.googleapis.com/css2?family=Inter\" rel=\"stylesheet\" />\n{/* Render-blocking request to Google, privacy leak */}\n// More explicit but longer",
          concise: "import { Inter } from 'next/font/google';\nconst inter = Inter({ subsets: ['latin'] });\n{/* Self-hosted, no requests, zero CLS */}",
        },
      },
      {
        id: "env-variables",
        fn: "Environment Variables",
        desc: "Next.js loads .env files automatically. Prefix with NEXT_PUBLIC_ to expose variables to the browser.",
        category: "Environment & Config",
        subtitle: "Server vs client environment variables",
        signature: "process.env.SECRET_KEY  |  process.env.NEXT_PUBLIC_API_URL",
        descLong: "Next.js automatically loads .env.local, .env.development, and .env.production. Variables are available in server code via process.env. Prefix with NEXT_PUBLIC_ to embed the value in the client bundle — these values are public and visible in source maps. Never expose secrets with NEXT_PUBLIC_.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Environment Variables — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// lib/env.ts — Type-safe env validation\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Environment Variables — common patterns you'll see in production.\n// APPROACH  - Combine Environment Variables with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst envSchema = z.object({\n  DATABASE_URL: z.string().url(),\n  JWT_SECRET: z.string().min(1),\n  NEXT_PUBLIC_API_URL: z.string().url(),\n  NEXT_PUBLIC_APP_NAME: z.string().default('MyApp'),\n});\nexport const env = envSchema.parse(process.env);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Environment Variables — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Server Component — read database URL securely\nasync function Dashboard() {\n  const users = await fetch(env.DATABASE_URL);\n  return <div>Users loaded</div>;\n}\n// Client Component — only NEXT_PUBLIC_ vars\n'use client';\nexport function ApiClient() {\n  const apiUrl = env.NEXT_PUBLIC_API_URL; // 'https://api.example.com'\n  return <button onClick={() => fetch(apiUrl)}>Fetch Data</button>;\n}"
                  }
        ],
        tips: [
                  "Use t3-env or @next/env for type-safe environment variable validation at startup.",
                  "NEXT_PUBLIC_ values are baked into the client bundle at build time — they cannot change per request.",
                  "process.env.NODE_ENV is automatically set to \"development\", \"production\", or \"test\".",
                  "Runtime environment variables (server-side only) can use the Next.js runtime config pattern."
        ],
        mistake: "Putting secrets in NEXT_PUBLIC_ variables — they're embedded in the client JavaScript bundle and visible to anyone. Only public config (API URLs, analytics keys) should use NEXT_PUBLIC_.",
        shorthand: {
          verbose: "// Unvalidated — can throw at runtime\nconst apiUrl = process.env.NEXT_PUBLIC_API_URL;\nconst secret = process.env.DATABASE_PASSWORD;",
          concise: "// Validated at build time\nconst env = envSchema.parse(process.env);\nconst apiUrl = env.NEXT_PUBLIC_API_URL;",
        },
      },
      {
        id: "streaming-suspense",
        fn: "Streaming with Suspense",
        desc: "Stream HTML from the server progressively — the shell renders first, deferred content arrives as it resolves.",
        category: "Environment & Config",
        subtitle: "Progressive HTML streaming from server",
        signature: "<Suspense fallback={<Skeleton />}><AsyncComponent /></Suspense>",
        descLong: "Next.js App Router streams HTML by default. Wrapping a slow async component in Suspense lets the page shell render immediately, then streams the component's content as a chunk when the data is ready. This enables fast Time to First Byte (TTFB) even for data-heavy pages.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Streaming with Suspense — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/dashboard/page.tsx\nimport { Suspense } from 'react';\nimport { ChartSkeleton, InvoiceSkeleton } from './skeletons';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Streaming with Suspense — common patterns you'll see in production.\n// APPROACH  - Combine Streaming with Suspense with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nasync function RevenueChart() {\n  const revenue = await getRevenue(); // slow DB query\n  if (!revenue) return <p>No data available</p>;\n  return <Chart data={revenue} />;\n}\nasync function LatestInvoices() {\n  const invoices = await getInvoices({ limit: 10 });\n  return <InvoiceList invoices={invoices} />;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Streaming with Suspense — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport default function Dashboard() {\n  return (\n    <main className=\"dashboard\">\n      <h1>Dashboard</h1>\n      <div className=\"grid\">\n        <Suspense fallback={<ChartSkeleton />}>\n          <RevenueChart />\n        </Suspense>\n        <Suspense fallback={<InvoiceSkeleton />}>\n          <LatestInvoices />\n        </Suspense>\n      </div>\n    </main>\n  );\n}"
                  }
        ],
        tips: [
                  "Each Suspense boundary streams independently — slow components don't block fast ones.",
                  "Use skeleton components as fallbacks for smooth perceived performance.",
                  "loading.tsx creates one Suspense boundary for the whole page — use inline Suspense for granularity.",
                  "Parallel data fetching (Promise.all) within a component avoids waterfall fetching."
        ],
        mistake: "Putting all data fetching in one async component and wrapping the whole page in Suspense — co-locate each fetch with the component that needs it, then nest Suspense boundaries.",
        shorthand: {
          verbose: "export default function Page() {\n  return <Suspense fallback={<Skeleton />}>\n    <Slow1 /><Slow2 /><Slow3 />\n  </Suspense>;\n}  // All three block each other",
          concise: "export default function Page() {\n  return <>\n    <Suspense fallback={<S1 />}><Slow1 /></Suspense>\n    <Suspense fallback={<S2 />}><Slow2 /></Suspense>\n    <Suspense fallback={<S3 />}><Slow3 /></Suspense>\n  </>;\n}  // Each streams independently",
        },
      },
      {
        id: "server-vs-client-components",
        fn: "Server vs Client Components",
        desc: "Server Components render on the server (no JS shipped, direct DB access). Client Components ship JS and use hooks.",
        category: "Rendering Strategies",
        subtitle: "Choosing between server and client rendering",
        signature: "default = Server  |  \"use client\" = Client",
        descLong: "By default, all components in app/ are Server Components. They run on the server, have no bundle size, and can access databases, APIs, and secrets directly. Client Components (\"use client\") ship JavaScript to the browser and can use React hooks, event listeners, and browser APIs. Push \"use client\" as deep as possible in the component tree to maximize Server Components.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Server vs Client Components — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// lib/db.ts — database module, only usable in Server Components\nimport { db } from './prisma';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Server vs Client Components — common patterns you'll see in production.\n// APPROACH  - Combine Server vs Client Components with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport async function getUser(id: string) {\n  return db.user.findUnique({ where: { id } });\n}\n// app/dashboard/page.tsx — Server Component (default)\n// No \"use client\" → runs on the server\nimport { getUser } from '@/lib/db';\nexport default async function Dashboard({ params }) {\n  // Database access — only works in Server Components\n  const user = await getUser(params.userId);\n  const posts = await db.post.findMany({ where: { authorId: params.userId } });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Server vs Client Components — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div>\n      <h1>Welcome, {user.name}</h1>\n      <PostList posts={posts} />  {/* Safe to pass data */}\n      <InteractiveCounter />        {/* Client Component */}\n    </div>\n  );\n}\n// app/dashboard/counter.tsx — Client Component\n'use client';\nimport { useState } from 'react';\nexport function InteractiveCounter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>+</button>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Server Components have zero bundle impact — no JavaScript shipped to the browser.",
                  "Importing a Server Component into a Client Component makes it a Client Component.",
                  "Pass data as props from Server → Client, not vice versa.",
                  "Use \"use client\" only when you need hooks, event handlers, or browser APIs."
        ],
        mistake: "Adding \"use client\" to every component — you lose Server Component benefits (smaller JS bundle, direct DB access). Only use it when necessary.",
        shorthand: {
          verbose: "'use client';\nasync function Page() {\n  const user = await db.user.findUnique();  // ERROR in client\n  return <div>{user.name}</div>;\n}",
          concise: "// Server Component (default) — no \"use client\"\nasync function Page() {\n  const user = await db.user.findUnique();  // ✓ safe\n  return <Sidebar user={user} />;\n}\n\n'use client';  // Only when needed\nfunction Sidebar({ user }) {\n  const [open, setOpen] = useState(false);  // ✓ hooks work",
        },
      },
      {
        id: "generatestaticparams",
        fn: "generateStaticParams()",
        desc: "Pre-generate pages at build time for dynamic routes. Makes [slug] routes static and cacheable.",
        category: "Static Generation",
        subtitle: "Build-time page generation for dynamic routes",
        signature: "export async function generateStaticParams() { return [{ slug: \"...\" }] }",
        descLong: "generateStaticParams runs at build time and returns an array of possible param combinations. Next.js pre-renders a page for each combination, making them static and cacheable. If a request comes for a slug not in the array, fallback behavior applies (ISR, on-demand, 404). Essential for SEO-critical pages.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of generateStaticParams() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/blog/[slug]/page.tsx\nexport async function generateStaticParams() {\n  const posts = await getAllPosts();\n  return posts.map(post => ({\n    slug: post.slug,\n  }));\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of generateStaticParams() — common patterns you'll see in production.\n// APPROACH  - Combine generateStaticParams() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport const dynamicParams = true;  // or false for strict\nexport default async function BlogPost({ params }) {\n  const post = await getPost(params.slug);\n  if (!post) notFound();\n  return <article>{post.content}</article>;\n}\n// Multiple dynamic segments\n// app/[category]/[slug]/page.tsx\nexport async function generateStaticParams() {\n  const categories = await getCategories();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of generateStaticParams() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst params: { category: string; slug: string }[] = [];\n  for (const cat of categories) {\n    const posts = await getPosts(cat.id);\n    for (const post of posts) {\n      params.push({\n        category: cat.slug,\n        slug: post.slug,\n      });\n    }\n  }\n  return params;\n}"
                  }
        ],
        tips: [
                  "dynamicParams = true: slugs not in generateStaticParams fallback to ISR.",
                  "dynamicParams = false: unknown slugs return 404 immediately.",
                  "Use generateStaticParams only for params that exist at build time.",
                  "Combine with ISR (next: { revalidate: 3600 }) for hybrid static + on-demand."
        ],
        mistake: "Calling generateStaticParams without a fallback — all dynamic routes must either be pre-rendered or have a clear fallback (404, ISR).",
        shorthand: {
          verbose: "// Fetch params at build time but no prerender\nconst posts = await getPosts();\n// Unused — just fetching, not rendering",
          concise: "export async function generateStaticParams() {\n  const posts = await getPosts();\n  return posts.map(p => ({ slug: p.slug }));\n}  // Pages pre-rendered at build",
        },
      },
      {
        id: "isr-incremental-static",
        fn: "ISR (Incremental Static Regeneration)",
        desc: "Revalidate cached pages at fixed intervals. Static performance with fresh content — no rebuild required.",
        category: "Static Generation",
        subtitle: "Time-based page revalidation",
        signature: "next: { revalidate: 60 }  or  revalidatePath()  or  revalidateTag()",
        descLong: "ISR revalidates a static page at a specified interval (e.g., every 60 seconds). The first request after the interval expires triggers a revalidation in the background; the old cached page is shown to users until revalidation completes. Combines static performance with fresh content. Works with fetch() and generateStaticParams.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ISR (Incremental Static Regeneration) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/blog/[slug]/page.tsx — ISR every 60 seconds\nexport async function generateStaticParams() {\n  const posts = await getAllPosts();\n  return posts.map(p => ({ slug: p.slug }));\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ISR (Incremental Static Regeneration) — common patterns you'll see in production.\n// APPROACH  - Combine ISR (Incremental Static Regeneration) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport default async function BlogPost({ params }) {\n  const post = await getPost(params.slug, {\n    next: { revalidate: 60 },  // Revalidate every 60s\n  });\n  if (!post) notFound();\n  return <article>{post.content}</article>;\n}\n// app/actions.ts — On-demand revalidation\n'use server';\nimport { revalidatePath, revalidateTag } from 'next/cache';\nexport async function publishPost(id: string) {\n  await db.post.update({ where: { id }, data: { published: true } });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ISR (Incremental Static Regeneration) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Revalidate immediately\n  revalidatePath('/blog');\n  revalidatePath('/blog/[slug]', 'page');\n  // Or with tags\n  revalidateTag('posts');\n  revalidateTag(`post-${id}`);\n}\n// Fetch with tags for revalidateTag()\nconst post = await fetch(`/api/posts/${id}`, {\n  next: { tags: [`post-${id}`, 'posts'] },\n});"
                  }
        ],
        tips: [
                  "ISR pages are cached statically but revalidated on an interval.",
                  "revalidatePath(\"/blog\") revalidates all pages matching that pattern.",
                  "revalidateTag(\"posts\") revalidates all fetches tagged with \"posts\".",
                  "On-demand revalidation is instant; time-based ISR waits for the interval."
        ],
        mistake: "Using only time-based ISR without tags — users don't see updates until the interval expires. Use revalidateTag() after mutations for instant updates.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Cache forever — manual rebuild needed\nconst data = await fetch('/api/posts', { cache: 'force-cache' });\n// More explicit but longer",
          concise: "// Revalidate every 60s — automatic refresh\nfetch(url, { next: { revalidate: 60 } })\n\n// Or on-demand\nrevalidateTag('posts');  // instant update",
        },
      },
      {
        id: "revalidatepath-tag",
        fn: "revalidatePath() / revalidateTag()",
        desc: "Invalidate cached pages on demand without rebuilding. Called from Server Actions or Route Handlers.",
        category: "Cache Revalidation",
        subtitle: "On-demand cache invalidation",
        signature: "revalidatePath(\"/blog\")  |  revalidateTag(\"posts\")",
        descLong: "revalidatePath() invalidates pages matching a URL pattern. revalidateTag() invalidates all fetch() calls tagged with a specific tag. Both must be called from Server Actions or Route Handlers (not in Server Components). They trigger immediate revalidation without waiting for the next ISR interval.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of revalidatePath() / revalidateTag() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/actions.ts\n'use server';\nimport { revalidatePath, revalidateTag } from 'next/cache';\nimport { redirect } from 'next/navigation';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of revalidatePath() / revalidateTag() — common patterns you'll see in production.\n// APPROACH  - Combine revalidatePath() / revalidateTag() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Revalidate by path\nexport async function updateBio(userId: string, bio: string) {\n  await db.user.update({\n    where: { id: userId },\n    data: { bio },\n  });\n  revalidatePath('/dashboard');        // All /dashboard/* pages\n  revalidatePath(`/users/${userId}`); // Specific /users/[id] page\n  revalidatePath('/', 'layout');       // Root layout only\n}\n// Revalidate by tag\nexport async function createPost(title: string, content: string) {\n  const post = await db.post.create({\n    data: { title, content },\n  });\n  // Invalidate all fetches tagged with 'posts'\n  revalidateTag('posts');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of revalidatePath() / revalidateTag() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nredirect(`/blog/${post.slug}`);\n}\n// In a Route Handler\nexport async function POST(request: NextRequest) {\n  const body = await request.json();\n  await db.post.create({ data: body });\n  revalidatePath('/posts');\n  return NextResponse.json({ success: true });\n}"
                  }
        ],
        tips: [
                  "revalidatePath() patterns: \"/blog\" (exact), \"/blog/*\" (nested), \"/\" (root).",
                  "Type arg: \"page\" (only page.tsx), \"layout\" (only layout.tsx), or undefined (both).",
                  "Tagging is more flexible than path-based revalidation for complex structures.",
                  "Always revalidate after mutations to ensure users see fresh data."
        ],
        mistake: "Forgetting to revalidate after mutations — cached data becomes stale. Every Server Action that modifies data should call revalidatePath() or revalidateTag().",
        shorthand: {
          verbose: "export async function updatePost(id, data) {\n  await db.post.update({ where: { id }, data });\n  // Cache stays stale — users see old data\n}",
          concise: "export async function updatePost(id, data) {\n  await db.post.update({ where: { id }, data });\n  revalidateTag('posts');  // Instant cache clear\n}",
        },
      },
      {
        id: "suspense-streaming",
        fn: "Suspense Boundaries for Streaming",
        desc: "Wrap slow async components in Suspense to stream parts of the page independently.",
        category: "Performance",
        subtitle: "Progressive HTML delivery with fallbacks",
        signature: "<Suspense fallback={<Skeleton />}><AsyncComp /></Suspense>",
        descLong: "Next.js streams HTML by default. Suspense boundaries allow slow async components to render independently — the shell renders immediately, and slow components stream as their data resolves. Each Suspense boundary has its own fallback. Perfect for dashboards with mixed fast/slow data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Suspense Boundaries for Streaming — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/dashboard/page.tsx\nimport { Suspense } from 'react';\nimport { ChartSkeleton, TableSkeleton } from './skeletons';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Suspense Boundaries for Streaming — common patterns you'll see in production.\n// APPROACH  - Combine Suspense Boundaries for Streaming with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// These components await data\nasync function RevenueChart() {\n  const data = await queryDatabase('SELECT * FROM revenue'); // slow\n  return <LineChart data={data} />;\n}\nasync function RecentOrders() {\n  const orders = await queryDatabase('SELECT * FROM orders'); // slower\n  return <Table data={orders} />;\n}\n// Fast component — no await\nfunction Header() {\n  return <h1>Dashboard</h1>;\n}\nexport default function Dashboard() {\n  return (\n    <div>\n      <Header />  {/* renders immediately */}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Suspense Boundaries for Streaming — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n{/* Suspense boundary 1 */}\n      <Suspense fallback={<ChartSkeleton />}>\n        <RevenueChart />\n      </Suspense>\n      {/* Suspense boundary 2 — independent */}\n      <Suspense fallback={<TableSkeleton />}>\n        <RecentOrders />\n      </Suspense>\n    </div>\n  );\n}\n// loading.tsx creates one boundary for the whole page\n// Use inline Suspense for granular control over which sections load independently"
                  }
        ],
        tips: [
                  "Each Suspense boundary streams independently — a slow component doesn't block fast ones.",
                  "loading.tsx is equivalent to wrapping the entire page in Suspense.",
                  "Skeleton components should match the visual height/width of the real content.",
                  "Use granular Suspense boundaries for better perceived performance."
        ],
        mistake: "Wrapping everything in one Suspense boundary — the entire page waits for the slowest component. Use nested boundaries for independent streaming.",
        shorthand: {
          verbose: "// Everything waits for slowest\nconst user = await slowDb1();\nconst posts = await slowDb2();\nconst stats = await slowDb3();\nreturn <>{user}{posts}{stats}</>;",
          concise: "// Each streams independently\n<Suspense fallback={<S1 />}><User /></Suspense>\n<Suspense fallback={<S2 />}><Posts /></Suspense>\n<Suspense fallback={<S3 />}><Stats /></Suspense>",
        },
      },
    ],
  },
]

export default { meta, sections }
