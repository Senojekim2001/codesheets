export const meta = {
  "title": "App Router & Routing",
  "domain": "nextjs",
  "sheet": "routing",
  "icon": "🗂️"
}

export const sections = [

  // ── Section 1: App Router & Routing ─────────────────────────────────────────
  {
    id: "app-router-routing",
    title: "App Router & Routing",
    entries: [
      {
        id: "app-router-files",
        fn: "App Router Files",
        desc: "Special filenames in the app/ directory define routes, layouts, loading states, and error boundaries.",
        category: "File Conventions",
        subtitle: "Reserved filenames and what they do",
        signature: "page.tsx  layout.tsx  loading.tsx  error.tsx  not-found.tsx",
        descLong: "Next.js App Router uses the filesystem for routing. Each folder under app/ becomes a URL segment. Special filenames define the behavior: page.tsx makes a route public, layout.tsx wraps children persistently, loading.tsx shows a Suspense fallback, error.tsx is a client-side error boundary, not-found.tsx handles 404s.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of App Router Files — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\napp/\n├── layout.tsx          ← root layout (wraps everything)\n├── page.tsx            ← renders at /\n├── loading.tsx         ← Suspense fallback for /\n├── error.tsx           ← error boundary for /"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of App Router Files — common patterns you'll see in production.\n// APPROACH  - Combine App Router Files with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n├── not-found.tsx       ← 404 for /\n├── about/\n│   └── page.tsx        ← renders at /about\n├── blog/\n│   ├── layout.tsx      ← layout for /blog/*"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of App Router Files — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n│   ├── page.tsx        ← renders at /blog\n│   └── [slug]/\n│       └── page.tsx    ← renders at /blog/any-slug\n└── (marketing)/        ← route group — doesn't add URL segment\n    ├── landing/\n    │   └── page.tsx    ← renders at /landing (not /marketing/landing)\n    └── layout.tsx      ← layout shared by group only"
                  }
        ],
        tips: [
                  "Route groups (parentheses) organize files without affecting URLs — great for shared layouts.",
                  "loading.tsx automatically wraps page.tsx in a Suspense boundary.",
                  "error.tsx must be a Client Component (\"use client\") — it uses error boundary lifecycle.",
                  "not-found.tsx is triggered by calling notFound() from next/navigation in server components."
        ],
        mistake: "Creating a folder without a page.tsx and expecting it to be accessible — only folders with page.tsx (or route.ts) are publicly addressable routes.",
        shorthand: {
          verbose: "// Pages Router (old way)\napp/pages/blog/[slug].tsx\n// Requires custom _app.tsx, _document.tsx\n\n// Folder structure only creates routes\napp/posts/page.tsx  →  /posts\napp/[id]/page.tsx   →  /[id]",
          concise: "// App Router (new way)\napp/posts/page.tsx → /posts\napp/[id]/page.tsx → /[id]",
        },
      },
      {
        id: "layout",
        fn: "layout.tsx",
        desc: "Wraps its segment's pages and all nested layouts. Persists across navigation — does not re-render.",
        category: "File Conventions",
        subtitle: "Persistent UI wrapper for a route segment",
        signature: "export default function Layout({ children }) { }",
        descLong: "Layouts wrap pages and nested layouts. The root layout must include <html> and <body> tags. Layouts persist — when navigating between pages under the same layout, the layout does not unmount and remount. Layouts can be async and fetch data directly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of layout.tsx — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/layout.tsx — root layout (required)\nimport type { Metadata } from 'next';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of layout.tsx — common patterns you'll see in production.\n// APPROACH  - Combine layout.tsx with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport const metadata: Metadata = {\n  title: { template: '%s | MySite', default: 'MySite' },\n  description: 'My awesome site',\n};\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html lang=\"en\">\n      <body>\n        <NavBar />\n        <main>{children}</main>\n        <Footer />\n      </body>\n    </html>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of layout.tsx — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// app/dashboard/layout.tsx — nested layout\nexport default async function DashboardLayout({ children }) {\n  const user = await getCurrentUser(); // async data fetch\n  return (\n    <div className=\"dashboard\">\n      <Sidebar user={user} />\n      <div className=\"content\">{children}</div>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Layouts are async by default — fetch data for the shell (nav user, permissions) directly.",
                  "Root layout must have <html> and <body> — no other file should include them.",
                  "Layouts don't re-render on navigation — great for persistent sidebar state.",
                  "Use template.tsx instead of layout.tsx when you DO want the shell to remount on navigation."
        ],
        mistake: "Trying to pass data from a layout to a page via props — layouts can't pass props to pages directly. Use Context, a shared data fetch, or a URL param instead.",
        shorthand: {
          verbose: "// Pages Router with _app.tsx wrapper\nexport function _app({ Component, pageProps }) {\n  return (\n    <Wrapper>\n      <Component {...pageProps} />\n    </Wrapper>\n  );\n}",
          concise: "// App Router — layout.tsx wraps all children automatically\nexport default function Layout({ children }) {\n  return <Wrapper>{children}</Wrapper>;\n}",
        },
      },
      {
        id: "dynamic-segments",
        fn: "Dynamic Segments [slug]",
        desc: "Folders wrapped in brackets create dynamic URL segments available as params in the page.",
        category: "Dynamic Routes",
        subtitle: "Variable URL segments",
        signature: "app/posts/[slug]/page.tsx  →  params.slug",
        descLong: "Square brackets in folder names create dynamic segments. The matched value is available via the params prop in page.tsx. Use [...slug] for catch-all routes and [[...slug]] for optional catch-all. Combine with generateStaticParams to pre-render at build time.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dynamic Segments [slug] — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/blog/[slug]/page.tsx\ninterface Props {\n  params: { slug: string }\n  searchParams: { [key: string]: string | string[] | undefined }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dynamic Segments [slug] — common patterns you'll see in production.\n// APPROACH  - Combine Dynamic Segments [slug] with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport default async function BlogPost({ params, searchParams }: Props) {\n  const post = await getPost(params.slug);\n  if (!post) notFound();\n  return <article>{post.content}</article>;\n}\n// Pre-render known slugs at build time\nexport async function generateStaticParams() {\n  const posts = await getAllPosts();\n  return posts.map(post => ({ slug: post.slug }));\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dynamic Segments [slug] — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Catch-all: app/docs/[...path]/page.tsx\n// Matches /docs/a, /docs/a/b, /docs/a/b/c\n// params.path = ['a', 'b', 'c']"
                  }
        ],
        tips: [
                  "generateStaticParams makes dynamic routes statically generated at build time (like SSG).",
                  "Call notFound() to render the nearest not-found.tsx when a slug doesn't match.",
                  "searchParams is an object of URL query params — ?page=2 → { page: \"2\" }.",
                  "Parallel routes (@slot) and intercepting routes ((.)) are advanced App Router features for modals."
        ],
        mistake: "Forgetting to call notFound() when the dynamic param doesn't match a resource — without it, the page renders undefined data instead of a proper 404.",
        shorthand: {
          verbose: "export async function getStaticProps({ params }) {\n  const post = await getPost(params.slug);\n  return { props: { post }, revalidate: 3600 };\n}\nexport async function getStaticPaths() {\n  const posts = await getAllPosts();\n  return { paths: posts.map(p => ({ params: { slug: p.slug } })), fallback: true };\n}",
          concise: "export async function generateStaticParams() {\n  return (await getAllPosts()).map(p => ({ slug: p.slug }));\n}\nconst post = await getPost(params.slug);",
        },
      },
      {
        id: "metadata-api",
        fn: "generateMetadata()",
        desc: "Export static metadata or a dynamic generateMetadata function to set <head> tags per route.",
        category: "Metadata",
        subtitle: "Per-route SEO and Open Graph tags",
        signature: "export const metadata  |  export async function generateMetadata({ params })",
        descLong: "The Metadata API replaces <Head> from the Pages Router. Static metadata uses a plain export. Dynamic metadata uses generateMetadata() which receives the same params as the page and can fetch data. Next.js merges metadata from nested layouts and pages.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of generateMetadata() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Static metadata — app/about/page.tsx\nexport const metadata = {\n  title: 'About Us',\n  description: 'Learn about our team',\n  openGraph: {\n    title: 'About Us',\n    images: ['/og/about.png'],\n  },\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of generateMetadata() — common patterns you'll see in production.\n// APPROACH  - Combine generateMetadata() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Dynamic metadata — app/blog/[slug]/page.tsx\nexport async function generateMetadata({ params }) {\n  const post = await getPost(params.slug);\n  return {\n    title: post.title,\n    description: post.excerpt,\n    openGraph: {\n      title: post.title,\n      images: [post.coverImage],\n    },\n  };\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of generateMetadata() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Root layout title template\nexport const metadata = {\n  title: { template: '%s | MySite', default: 'MySite' },\n};"
                  }
        ],
        tips: [
                  "Title templates in the root layout automatically prefix page titles — set once, apply everywhere.",
                  "generateMetadata runs on the server — you can safely fetch data for SEO.",
                  "Next.js deduplicates identical fetches between generateMetadata and the page component.",
                  "Use the robots and icons metadata fields to replace <link rel=\"icon\"> in your layout."
        ],
        mistake: "Using <head> tags directly in page.tsx instead of the Metadata API — the API is server-rendered and handles deduplication; manual <head> tags may conflict.",
        shorthand: {
          verbose: "// Pages Router with next/head\nimport Head from 'next/head';\nexport default function Page() {\n  return <>\n    <Head><title>Page Title</title></Head>\n    <article>...</article>\n  </>;\n}",
          concise: "// App Router — declarative export\nexport const metadata = { title: 'Page Title' };",
        },
      },
      {
        id: "usepathname-userouter",
        fn: "usePathname() / useRouter()",
        desc: "usePathname returns the current path. useRouter provides programmatic navigation in Client Components.",
        category: "Navigation Hooks",
        subtitle: "Client-side navigation and path reading",
        signature: "const path = usePathname()  |  const router = useRouter()",
        descLong: "usePathname is a Client Component hook that returns the current URL pathname — reactive to navigation. useRouter (from next/navigation, not next/router) provides push, replace, back, forward, and refresh for programmatic navigation. Both require \"use client\".",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of usePathname() / useRouter() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n'use client';\nimport { usePathname, useRouter, useSearchParams } from 'next/navigation';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of usePathname() / useRouter() — common patterns you'll see in production.\n// APPROACH  - Combine usePathname() / useRouter() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction NavLink({ href, children }) {\n  const pathname = usePathname();\n  const isActive = pathname === href || pathname.startsWith(href + '/');\n  return (\n    <a href={href} className={isActive ? 'active' : ''}>\n      {children}\n    </a>\n  );\n}\nfunction RedirectAfterLogin() {\n  const router = useRouter();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of usePathname() / useRouter() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nasync function handleLogin(credentials) {\n    await login(credentials);\n    router.push('/dashboard');        // navigate\n    // router.replace('/dashboard');  // replace history entry\n    // router.refresh();              // re-fetch server data\n  }\n}\n// Search params — must be in a Suspense boundary\nfunction SearchFilter() {\n  const searchParams = useSearchParams();\n  const q = searchParams.get('q') ?? '';\n  return <p>Searching for: {q}</p>;\n}"
                  }
        ],
        tips: [
                  "Use usePathname for active link detection — it's more reliable than parsing window.location.",
                  "router.refresh() re-runs server components without full navigation — great after mutations.",
                  "useSearchParams requires a Suspense boundary — wrap the component that uses it.",
                  "For server-side redirects, use redirect() from next/navigation, not useRouter."
        ],
        mistake: "Importing useRouter from \"next/router\" (Pages Router) instead of \"next/navigation\" (App Router) — they have different APIs and the wrong one will silently not work.",
        shorthand: {
          verbose: "import { useRouter } from 'next/router';  // Pages Router\nconst router = useRouter();\nconst path = router.pathname;  // complex object",
          concise: "import { usePathname, useRouter } from 'next/navigation';  // App Router\nconst path = usePathname();\nrouter.push('/dashboard');",
        },
      },
      {
        id: "link-prefetch",
        fn: "<Link> prefetch",
        desc: "Next.js <Link> automatically prefetches linked pages — control prefetch behavior with the prefetch prop.",
        category: "Navigation Hooks",
        subtitle: "Automatic page prefetching for fast navigation",
        signature: "<Link href=\"/page\" prefetch={false}>",
        descLong: "In production, Next.js automatically prefetches pages linked via <Link> when they enter the viewport. Static routes are fully prefetched; dynamic routes prefetch only the layout. Disable with prefetch={false} for sensitive pages or to reduce bandwidth on mobile.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of <Link> prefetch — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport Link from 'next/link';\nimport { useRouter } from 'next/navigation';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of <Link> prefetch — common patterns you'll see in production.\n// APPROACH  - Combine <Link> prefetch with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Automatic prefetch (default) — prefetches on viewport enter\n<Link href=\"/dashboard\">Dashboard</Link>\n// Disable prefetch — useful for auth pages, low-priority links\n<Link href=\"/admin\" prefetch={false}>Admin</Link>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of <Link> prefetch — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Programmatic prefetch — trigger on hover\nfunction NavItem({ href, children }) {\n  const router = useRouter();\n  return (\n    <a\n      href={href}\n      onMouseEnter={() => router.prefetch(href)}\n      onClick={(e) => { e.preventDefault(); router.push(href); }}\n    >\n      {children}\n    </a>\n  );\n}\n// Replace vs push\n<Link href=\"/settings\" replace>Settings</Link>  // no back button history"
                  }
        ],
        tips: [
                  "Prefetching is production-only — in development, no prefetching occurs.",
                  "prefetch={false} reduces bandwidth usage on mobile or for rarely-visited pages.",
                  "router.prefetch(href) triggers prefetch imperatively — useful on hover.",
                  "The scroll prop controls whether to scroll to top on navigation: <Link scroll={false}>."
        ],
        mistake: "Using <a href> instead of <Link href> — you lose client-side navigation, prefetching, and scroll restoration.",
        shorthand: {
          verbose: "// Manual prefetch with next/router\nconst router = useRouter();\n<a onMouseEnter={() => router.prefetch('/page')} href=\"/page\">Link</a>",
          concise: "// Automatic prefetch with <Link>\n<Link href=\"/page\" prefetch={true}>Link</Link>",
        },
      },
      {
        id: "loading-error-files",
        fn: "loading.tsx / error.tsx",
        desc: "loading.tsx wraps the page in Suspense. error.tsx is an error boundary — both are automatic.",
        category: "Special Files",
        subtitle: "Automatic Suspense and error boundary setup",
        signature: "// loading.tsx — auto Suspense fallback\n// error.tsx — auto error boundary (\"use client\")",
        descLong: "loading.tsx automatically wraps the page component in a React Suspense boundary, showing its content as a fallback while the page loads. error.tsx automatically wraps the segment in an error boundary — it must be a Client Component and receives the error and a reset function.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of loading.tsx / error.tsx — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/dashboard/loading.tsx — shown while page.tsx suspends\nexport default function DashboardLoading() {\n  return (\n    <div className=\"skeleton\">\n      <div className=\"skeleton-header\" />\n      <div className=\"skeleton-content\" />\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of loading.tsx / error.tsx — common patterns you'll see in production.\n// APPROACH  - Combine loading.tsx / error.tsx with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// app/dashboard/error.tsx — must be 'use client'\n'use client';\nexport default function DashboardError({\n  error,\n  reset,\n}: {\n  error: Error & { digest?: string };\n  reset: () => void;\n}) {"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of loading.tsx / error.tsx — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div>\n      <h2>Something went wrong</h2>\n      <p>{error.message}</p>\n      <button onClick={reset}>Try again</button>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "loading.tsx shows instantly on navigation — before any async data fetching starts.",
                  "error.tsx must be \"use client\" because it uses React error boundary lifecycle.",
                  "reset() re-renders the error boundary — useful for transient errors.",
                  "error.digest is a hash for server-side error lookup in logs — log it for debugging."
        ],
        mistake: "Manually wrapping pages in Suspense when loading.tsx does it automatically — and forgetting to wrap error boundaries when error.tsx handles it automatically.",
        shorthand: {
          verbose: "<Suspense fallback={<Loading />}>\n  <Page />\n</Suspense>\n<ErrorBoundary fallback={<Error />}>\n  <Page />\n</ErrorBoundary>",
          concise: "// loading.tsx + error.tsx wrap automatically\n// App Router handles Suspense + error boundaries",
        },
      },
      {
        id: "route-groups",
        fn: "Route Groups",
        desc: "Parentheses folder names organize routes without adding URL segments. Perfect for shared layouts.",
        category: "Special Files",
        subtitle: "Logical route organization without URLs",
        signature: "(groupName)/",
        descLong: "Route groups wrap folder names in parentheses — (auth), (marketing), (admin) — to organize files logically without affecting the URL structure. Each group can have its own layout.tsx that only applies to pages within that group. Multiple groups can share the same nested path structure without URL conflicts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Route Groups — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\napp/\n├── (auth)/                 ← route group — no URL segment\n│   ├── layout.tsx          ← layout only for auth pages\n│   ├── login/\n│   │   └── page.tsx        ← /login (not /auth/login)\n│   └── signup/\n│       └── page.tsx        ← /signup (not /auth/signup)\n├── (marketing)/            ← separate group\n│   ├── layout.tsx          ← different layout\n│   ├── page.tsx            ← / (home)\n│   └── about/\n│       └── page.tsx        ← /about\n└── dashboard/\n    ├── layout.tsx\n    └── page.tsx            ← /dashboard"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Route Groups — common patterns you'll see in production.\n// APPROACH  - Combine Route Groups with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Each group can have its own layout\n// (auth)/layout.tsx — only wraps login/signup"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Route Groups — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// (marketing)/layout.tsx — only wraps home/about"
                  }
        ],
        tips: [
                  "Route groups keep related files organized without URL impact.",
                  "Each group can have its own layout — great for different shells (auth vs public).",
                  "Multiple groups can coexist — each with independent layouts.",
                  "Use groups for: auth pages, marketing pages, admin sections, etc."
        ],
        mistake: "Adding unnecessary URL segments just to share a layout — route groups solve this cleanly without changing URLs.",
        shorthand: {
          verbose: "// Manual / verbose approach\napp/auth/layout.tsx  // adds /auth to URL\napp/auth/login/page.tsx  // creates /auth/login\n// More explicit but longer",
          concise: "app/(auth)/layout.tsx  // doesn't add to URL\napp/(auth)/login/page.tsx  // creates /login",
        },
      },
      {
        id: "parallel-routes",
        fn: "Parallel Routes",
        desc: "Multiple independent page regions rendered simultaneously using @slot convention. Each slot has independent navigation and state.",
        category: "Special Files",
        subtitle: "Multiple simultaneous page renders",
        signature: "@slotName/",
        descLong: "Parallel routes use @slotName convention to render multiple independent page regions in a single layout. Each slot can have its own page.tsx, loading.tsx, and error.tsx. Slots navigate independently — one slot's navigation doesn't affect others. Perfect for dashboards, sidebars, or modals that persist during navigation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Parallel Routes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\napp/\n└── dashboard/\n    ├── layout.tsx          ← receives { children, analytics, team }\n    ├── page.tsx            ← main content\n    ├── @analytics/         ← parallel slot\n    │   ├── page.tsx        ← analytics panel\n    │   ├── loading.tsx     ← independent loading state\n    │   └── default.tsx     ← fallback when no route matches\n    └── @team/              ← parallel slot\n        ├── page.tsx        ← team panel\n        ├── loading.tsx     ← independent loading state\n        └── default.tsx     ← fallback when no route matches"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Parallel Routes — common patterns you'll see in production.\n// APPROACH  - Combine Parallel Routes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// In dashboard/layout.tsx:\nexport default function DashboardLayout({\n  children,        // main page.tsx\n  analytics,       // @analytics/page.tsx\n  team,            // @team/page.tsx\n}) {\n  return ("
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Parallel Routes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<div className=\"dashboard\">\n      <main>{children}</main>\n      <aside className=\"analytics\">{analytics}</aside>\n      <aside className=\"team\">{team}</aside>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Each slot needs a default.tsx — it renders when no slot-specific route matches.",
                  "Slots navigate independently — sidebar slot change doesn't reset main content.",
                  "Each slot can have loading.tsx and error.tsx for independent state management.",
                  "Perfect for dashboards with multiple independent regions (charts, sidebar, details)."
        ],
        mistake: "Forgetting default.tsx in slots — without it, slots won't render when navigating away from their specific routes.",
        shorthand: {
          verbose: "// Multiple layouts, manually passed\nexport default function Layout() {\n  return <>\n    <Main />\n    <Sidebar />\n    <Analytics />\n  </>;\n}",
          concise: "// Parallel slots, auto-passed to layout\nexport default function Layout({ children, analytics, team }) {\n  return <>\n    <Main>{children}</Main>\n    <Aside>{analytics}{team}</Aside>\n  </>;\n}",
        },
      },
      {
        id: "template-file",
        fn: "template.tsx",
        desc: "Like layout.tsx but remounts on every navigation. Use for animations, state reset, or per-page setup.",
        category: "Special Files",
        subtitle: "Layout that remounts on each navigation",
        signature: "export default function Template({ children }) { }",
        descLong: "Templates are identical to layouts in structure but remount on every route change. Use them when you need per-page initialization, animations triggered on navigation, or resetting local state between pages. Unlike layouts, templates do not persist across navigation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of template.tsx — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/template.tsx — remounts on every navigation\n'use client';\nimport { useState, useEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of template.tsx — common patterns you'll see in production.\n// APPROACH  - Combine template.tsx with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport default function Template({ children }) {\n  const [mounted, setMounted] = useState(false);\n  useEffect(() => {\n    setMounted(true);\n    // Reset form state or trigger animation on mount\n    console.log('Page changed — animation triggered');\n  }, []);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of template.tsx — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div className=\"page-transition\">\n      <div className={mounted ? 'fade-in' : 'opacity-0'}>\n        {children}\n      </div>\n    </div>\n  );\n}\n// CSS animation\n// .fade-in { animation: fadeIn 0.3s ease-in; }"
                  }
        ],
        tips: [
                  "Templates remount on every route change — use for page-entry animations.",
                  "Each route segment can have its own template.tsx.",
                  "Templates wrap inside the layout, so layout persists but template remounts.",
                  "Useful for resetting form state or scroll position per-page."
        ],
        mistake: "Using template.tsx when layout.tsx would work — templates hurt performance if you want persistent state. Only use them when you specifically need remounting.",
        shorthand: {
          verbose: "// Layout persists, state stays\nconst [count, setCount] = useState(0);\n// count stays same after navigation",
          concise: "// Template remounts, state resets\n// Every route change triggers useEffect",
        },
      },
      {
        id: "intercepting-routes",
        fn: "Intercepting Routes",
        desc: "Intercept sibling routes to load modals or overlays without changing the URL or page history.",
        category: "Advanced Routing",
        subtitle: "Load content into modals by intercepting routes",
        signature: "(.)folder/  |  (..)folder/  |  (...)folder/",
        descLong: "Intercepting routes use the (.) convention to catch navigation to sibling or parent routes and render them as overlays (modals, drawers) instead of full pages. The route doesn't change; users can dismiss the modal and return to the previous page. Perfect for image galleries, auth flows, and dialogs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Intercepting Routes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\napp/\n├── photos/\n│   ├── layout.tsx\n│   ├── page.tsx            ← /photos (gallery)\n│   └── [id]/\n│       ├── page.tsx        ← /photos/[id] (detail page)\n│       └── (.)modal.tsx    ← intercepts navigation to /photos/[id]\n│\n// (.)modal.tsx — intercepted route shows as modal\n'use client';\nimport { useRouter } from 'next/navigation';\nimport Link from 'next/link';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Intercepting Routes — common patterns you'll see in production.\n// APPROACH  - Combine Intercepting Routes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport default function PhotoModal({ params }) {\n  const router = useRouter();\n  return (\n    <div className=\"modal-backdrop\" onClick={() => router.back()}>\n      <dialog className=\"modal\" open>\n        <img src={`/photos/${params.id}.jpg`} />\n        <button onClick={() => router.back()}>Close</button>\n      </dialog>\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Intercepting Routes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Intercepting levels\n// (.) = same segment level\n// (..) = one level up\n// (...) = two levels up"
                  }
        ],
        tips: [
                  "Intercepted routes only work for client-side navigation — direct URL visits show the full page.",
                  "Use default.tsx as a fallback when accessing the intercepted route directly.",
                  "Combine with parallel routes (@modal) for clean architecture.",
                  "Users can still reload the intercepted page URL and it shows as a full page."
        ],
        mistake: "Not providing a default.tsx fallback — when users visit /photos/123 directly, the page doesn't render because only the modal exists.",
        shorthand: {
          verbose: "// Pages Router or client routing\nif (router.pathname === '/photos/[id]') {\n  return <ModalWrapper><Photo /></ModalWrapper>;\n}",
          concise: "// App Router intercept — automatic with (.)/\napp/photos/(.)modal.tsx  // only on client nav\napp/photos/page.tsx  // fallback on direct URL",
        },
      },
      {
        id: "middleware-basics",
        fn: "middleware.ts (App Router)",
        desc: "Edge middleware runs before pages, route handlers, and static files — used for auth, redirects, and request modification.",
        category: "Advanced Routing",
        subtitle: "Request interception before reaching pages",
        signature: "export function middleware(request: NextRequest) { }",
        descLong: "middleware.ts at the project root executes at the edge on every request matching the config.matcher. It can read/set cookies, redirect users, modify headers, and run lightweight logic before the page or route handler. Does not have access to Node.js APIs or database connections.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of middleware.ts (App Router) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// middleware.ts (project root)\nimport { NextRequest, NextResponse } from 'next/server';\nimport { jwtVerify } from 'jose';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of middleware.ts (App Router) — common patterns you'll see in production.\n// APPROACH  - Combine middleware.ts (App Router) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst secret = new TextEncoder().encode(process.env.JWT_SECRET!);\nexport async function middleware(request: NextRequest) {\n  const pathname = request.nextUrl.pathname;\n  // Skip auth check for public routes\n  if (pathname.startsWith('/login') || pathname === '/') {\n    return NextResponse.next();\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of middleware.ts (App Router) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Verify JWT token\n  const token = request.cookies.get('token')?.value;\n  if (!token) {\n    return NextResponse.redirect(new URL('/login', request.url));\n  }\n  try {\n    await jwtVerify(token, secret);\n    return NextResponse.next();\n  } catch (error) {\n    // Token invalid — redirect to login\n    const response = NextResponse.redirect(new URL('/login', request.url));\n    response.cookies.delete('token');\n    return response;\n  }\n}\nexport const config = {\n  matcher: [\n    '/dashboard/:path*',\n    '/admin/:path*',\n    '/api/protected/:path*',\n  ],\n};"
                  }
        ],
        tips: [
                  "Middleware runs at the edge (Vercel Edge Network, not Node.js) — no database calls or heavy processing.",
                  "Use matcher to exclude static assets: /((?!_next/static|_next/image|favicon.ico).*)/",
                  "Read request.headers.get(\"authorization\") for API auth.",
                  "Set response headers: response.headers.set(\"X-Custom\", \"value\")."
        ],
        mistake: "Calling databases or external APIs in middleware — the Edge Runtime has limited capabilities. Use lightweight checks (JWT, flags) only.",
        shorthand: {
          verbose: "// Pages Router getServerSideProps\nexport async function getServerSideProps(ctx) {\n  if (!ctx.req.cookies.token) {\n    return { redirect: { destination: '/login' } };\n  }\n  return { props: {} };\n}",
          concise: "// App Router middleware.ts\nexport function middleware(request: NextRequest) {\n  if (!request.cookies.has('token')) {\n    return NextResponse.redirect(new URL('/login', request.url));\n  }\n}",
        },
      },
      {
        id: "rewrites-redirects",
        fn: "rewrites() / redirects() Config",
        desc: "next.config.js functions to rewrite/redirect requests. Rewrites hide the destination; redirects change the URL.",
        category: "Advanced Routing",
        subtitle: "Request routing without URL change",
        signature: "export default { async rewrites() { }, async redirects() { } }",
        descLong: "In next.config.js, rewrites() and redirects() provide route mapping at build time. Rewrites point one URL to another internally (masked from the user); redirects send the browser to a new URL. Both support regex patterns, query params, and path segments. Useful for masking API routes, supporting legacy URLs, and external integrations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of rewrites() / redirects() Config — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// next.config.js\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  async rewrites() {\n    return {\n      beforeFiles: [\n        // Rewrite /api/* to external API\n        {\n          source: '/api/:path*',\n          destination: 'https://api.external.com/:path*',\n        },\n        // Rewrite /docs to external docs\n        {\n          source: '/docs/:path*',\n          destination: '/static/docs/:path*',\n        },\n      ],\n    };\n  },"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of rewrites() / redirects() Config — common patterns you'll see in production.\n// APPROACH  - Combine rewrites() / redirects() Config with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nasync redirects() {\n    return [\n      // Redirect old blog URLs to new structure\n      {\n        source: '/blog/:slug',\n        destination: '/posts/:slug',\n        permanent: true,  // 308 permanent\n      },\n      // Redirect old domain to new domain\n      {\n        source: '/:path*',\n        has: [{ type: 'host', value: 'old-domain.com' }],\n        destination: 'https://new-domain.com/:path*',\n        permanent: true,\n      },\n    ];\n  },\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of rewrites() / redirects() Config — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport default nextConfig;"
                  }
        ],
        tips: [
                  "permanent: true returns 308/301; false returns 307/302 (affects caching and SEO).",
                  "Rewrites are invisible to the user — the URL stays the same.",
                  "Redirects change the URL in the browser — search engines follow permanent redirects.",
                  "beforeFiles rewrites run before checking the filesystem; afterFiles run after."
        ],
        mistake: "Using redirects when you mean rewrites — redirects change the visible URL and require a browser redirect. Use rewrites to mask internal routing.",
        shorthand: {
          verbose: "// next.config.js — old verbose way\nmodule.exports = {\n  redirects: async () => [{\n    source: '/blog/:slug',\n    destination: '/posts/:slug',\n    permanent: true,\n  }],\n};",
          concise: "// Modern — same API, concise pattern\nasync redirects() {\n  return [{ source: '/blog/:slug', destination: '/posts/:slug', permanent: true }];\n}",
        },
      },
      {
        id: "notfound-file",
        fn: "not-found.tsx",
        desc: "Custom 404 page per route segment. Call notFound() from a Server Component to trigger it.",
        category: "Special Files",
        subtitle: "Custom 404 page per segment",
        signature: "export default function NotFound() { }  |  import { notFound }",
        descLong: "not-found.tsx renders a custom 404 page for any route segment. Call notFound() from a Server Component (or page) to display it. Next.js automatically calls notFound() if a dynamic route slug doesn't match. Each segment can have its own not-found.tsx.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of not-found.tsx — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { notFound } from 'next/navigation';\nimport Link from 'next/link';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of not-found.tsx — common patterns you'll see in production.\n// APPROACH  - Combine not-found.tsx with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// app/not-found.tsx — root 404\nexport const metadata = {\n  title: 'Page Not Found',\n  description: '404 - The page you're looking for doesn't exist.',\n};\nexport default function NotFound() {\n  return (\n    <main className=\"not-found\">\n      <h1>404 — Page Not Found</h1>\n      <p>The page you're looking for doesn't exist.</p>\n      <Link href=\"/\">Back to Home</Link>\n    </main>\n  );\n}\n// app/blog/[slug]/page.tsx — call notFound()\nexport default async function BlogPost({ params }) {\n  const post = await getPost(params.slug);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of not-found.tsx — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nif (!post) {\n    notFound();  // renders nearest not-found.tsx\n  }\n  return <article>{post.content}</article>;\n}\n// app/blog/not-found.tsx — blog-specific 404\nexport default function BlogNotFound() {\n  return (\n    <div>\n      <h2>Blog Post Not Found</h2>\n      <p>This blog post doesn't exist or has been removed.</p>\n      <Link href=\"/blog\">Back to Blog</Link>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "notFound() triggers the nearest not-found.tsx in the parent hierarchy.",
                  "notFound() returns a NextResponse with status 404.",
                  "You can also set generateStaticParams to avoid 404s for pre-rendered routes.",
                  "Use not-found.tsx for graceful 404 pages; use error.tsx for unexpected errors."
        ],
        mistake: "Rendering an error message instead of calling notFound() — notFound() properly sets the HTTP status and renders the not-found boundary.",
        shorthand: {
          verbose: "// Render null or error manually\nconst post = await getPost(slug);\nif (!post) return <p>Not found</p>;  // Wrong — no 404 status",
          concise: "// Import notFound and call it\nimport { notFound } from 'next/navigation';\nif (!post) notFound();",
        },
      },
    ],
  },
]

export default { meta, sections }
