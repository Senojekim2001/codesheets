export const meta = {
  "title": "Advanced Patterns & Best Practices",
  "domain": "nextjs",
  "sheet": "patterns",
  "icon": "🎯"
}

export const sections = [

  // ── Section 1: Metadata, SEO & Social Sharing ─────────────────────────────────────────
  {
    id: "metadata-seo",
    title: "Metadata, SEO & Social Sharing",
    entries: [
      {
        id: "metadata-api-patterns",
        fn: "Metadata API Patterns",
        desc: "Static and dynamic metadata for SEO, Open Graph, and social sharing.",
        category: "Metadata",
        subtitle: "Per-route SEO and social cards",
        signature: "export const metadata  |  export async function generateMetadata()",
        descLong: "Use the Metadata API to declare static metadata or dynamically generate it based on params. Next.js merges metadata from nested layouts and pages. Static metadata is known at build time; dynamic metadata fetches data for the page.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Metadata API Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/layout.tsx — root metadata\nimport type { Metadata } from 'next';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Metadata API Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Metadata API Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport const metadata: Metadata = {\n  title: {\n    template: '%s | MySite',\n    default: 'MySite',\n  },\n  description: 'Learn amazing things',\n  icons: '/favicon.ico',\n  openGraph: {\n    type: 'website',\n    locale: 'en_US',\n  },\n  twitter: {\n    card: 'summary_large_image',\n    creator: '@mysite',\n  },\n};\nexport default function RootLayout({ children }) {\n  return <html><body>{children}</body></html>;\n}\n// app/blog/[slug]/page.tsx — dynamic metadata\nimport type { Metadata, ResolvingMetadata } from 'next';\ninterface Props {\n  params: { slug: string };\n}\nexport async function generateMetadata(\n  { params }: Props,\n  parent: ResolvingMetadata\n): Promise<Metadata> {\n  const post = await getPost(params.slug);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Metadata API Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nif (!post) {\n    return { title: 'Post Not Found' };\n  }\n  // Inherit parent metadata\n  const parentMetadata = await parent;\n  return {\n    title: post.title,\n    description: post.excerpt,\n    authors: [{ name: post.author.name }],\n    openGraph: {\n      title: post.title,\n      description: post.excerpt,\n      type: 'article',\n      publishedTime: post.publishedAt,\n      authors: [post.author.url],\n      images: [\n        {\n          url: post.coverImage,\n          width: 1200,\n          height: 630,\n          alt: post.title,\n        },\n      ],\n    },\n    twitter: {\n      card: 'summary_large_image',\n      title: post.title,\n      description: post.excerpt,\n      images: [post.coverImage],\n    },\n  };\n}\nexport default async function BlogPost({ params }: Props) {\n  const post = await getPost(params.slug);\n  return <article>{post.content}</article>;\n}"
                  }
        ],
        tips: [
                  "title.template applies to all child routes — set in root layout.",
                  "generateMetadata receives params and parent metadata.",
                  "Call notFound() in generateMetadata to return 404 metadata.",
                  "Deduplicate identical fetches between generateMetadata and the page."
        ],
        mistake: "Hardcoding Open Graph images instead of dynamically generating them — use og-image libraries.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "og-image-generation",
        fn: "Open Graph Image Generation",
        desc: "Dynamically generate social preview images with text overlays.",
        category: "SEO",
        subtitle: "Per-page social media cards",
        signature: "import { ImageResponse } from \"next/og\"",
        descLong: "Use next/og to dynamically generate Open Graph images on the fly. Create social preview images with text, images, and layouts. Serve them at /api/og routes, then reference them in metadata.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Open Graph Image Generation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/api/og/route.tsx\nimport { ImageResponse } from 'next/og';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Open Graph Image Generation — common patterns you'll see in production.\n// APPROACH  - Combine Open Graph Image Generation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport const runtime = 'edge';\nexport async function GET(request: Request) {\n  const { searchParams } = new URL(request.url);\n  const title = searchParams.get('title') || 'Default Title';\n  const author = searchParams.get('author') || 'Unknown';\n  return new ImageResponse(\n    (\n      <div\n        style={{\n          fontSize: 128,\n          background: 'linear-gradient(to right, #667eea 0%, #764ba2 100%)',\n          width: '100%',\n          height: '100%',\n          display: 'flex',\n          textAlign: 'center',\n          alignItems: 'center',\n          justifyContent: 'center',\n          color: 'white',\n          padding: '40px',\n          flexDirection: 'column',\n          gap: '40px',\n        }}\n      >\n        <div style={{ fontSize: '80px', fontWeight: 'bold' }}>\n          {title}\n        </div>\n        <div style={{ fontSize: '40px', opacity: 0.8 }}>\n          by {author}\n        </div>\n      </div>\n    ),\n    {\n      width: 1200,\n      height: 630,\n    }\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Open Graph Image Generation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Usage in metadata\n// app/blog/[slug]/page.tsx\nexport async function generateMetadata(\n  { params }: Props,\n  parent: ResolvingMetadata\n): Promise<Metadata> {\n  const post = await getPost(params.slug);\n  const ogUrl = new URL('/api/og', process.env.NEXT_PUBLIC_SITE_URL);\n  ogUrl.searchParams.set('title', post.title);\n  ogUrl.searchParams.set('author', post.author.name);\n  return {\n    openGraph: {\n      images: [\n        {\n          url: ogUrl.toString(),\n          width: 1200,\n          height: 630,\n        },\n      ],\n    },\n  };\n}"
                  }
        ],
        tips: [
                  "Use edge runtime for OG image generation — faster cold starts.",
                  "Cache OG images with appropriate headers.",
                  "Test OG images with Twitter Card validator and Facebook OG debugger.",
                  "Keep text and design simple for social platforms' preview sizes."
        ],
        mistake: "Using heavy libraries in OG routes — keep edge functions lightweight.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "sitemap-robots",
        fn: "Sitemap & Robots.txt",
        desc: "Generate sitemaps and robots.txt for SEO crawling and indexing.",
        category: "SEO",
        subtitle: "Help search engines discover your content",
        signature: "app/sitemap.ts  |  app/robots.ts",
        descLong: "Export a sitemap and robots.txt from app/ to help search engines crawl your site. Both support static exports or dynamic generation with generateStaticParams.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sitemap & Robots.txt — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// app/sitemap.ts — dynamic sitemap\nimport { MetadataRoute } from 'next';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sitemap & Robots.txt — common patterns you'll see in production.\n// APPROACH  - Combine Sitemap & Robots.txt with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport default async function sitemap(): Promise<MetadataRoute.Sitemap> {\n  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';\n  // Static routes\n  const staticRoutes: MetadataRoute.Sitemap = [\n    {\n      url: baseUrl,\n      lastModified: new Date(),\n      changeFrequency: 'weekly',\n      priority: 1,\n    },\n    {\n      url: `${baseUrl}/about`,\n      lastModified: new Date(),\n      changeFrequency: 'monthly',\n      priority: 0.8,\n    },\n  ];\n  // Dynamic routes\n  const posts = await getAllPosts();\n  const dynamicRoutes: MetadataRoute.Sitemap = posts.map(post => ({\n    url: `${baseUrl}/blog/${post.slug}`,\n    lastModified: post.updatedAt,\n    changeFrequency: 'weekly' as const,\n    priority: 0.7,\n  }));\n  return [...staticRoutes, ...dynamicRoutes];\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sitemap & Robots.txt — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// app/robots.ts\nimport { MetadataRoute } from 'next';\nexport default function robots(): MetadataRoute.Robots {\n  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';\n  return {\n    rules: [\n      {\n        userAgent: '*',\n        allow: '/',\n        disallow: ['/admin', '/api', '/private'],\n      },\n      {\n        userAgent: 'Googlebot',\n        allow: '/',\n        crawlDelay: 0,  // No delay for Google\n      },\n    ],\n    sitemap: `${baseUrl}/sitemap.xml`,\n  };\n}\n// app/sitemap.xml.ts — static sitemap\n// export const dynamic = 'force-static';\n// export const revalidate = 86400;  // Once per day\n// export default async function Sitemap(): Promise<MetadataRoute.Sitemap> { }"
                  }
        ],
        tips: [
                  "Sitemaps help search engines find all your pages.",
                  "Update lastModified when content changes.",
                  "Set priority (0-1) to hint which pages are most important.",
                  "Robots.txt tells crawlers which pages to index."
        ],
        mistake: "Creating a static sitemap when routes are dynamic — use generateStaticParams or make the sitemap dynamic.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },

  // ── Section 2: Internationalization (i18n) ─────────────────────────────────────────
  {
    id: "internationalization",
    title: "Internationalization (i18n)",
    entries: [
      {
        id: "i18n-routing",
        fn: "Internationalization Routing",
        desc: "Support multiple languages with URL prefixes: /en/*, /fr/*, etc.",
        category: "i18n",
        subtitle: "Multi-language routing structure",
        signature: "app/[lang]/page.tsx",
        descLong: "Next.js can handle i18n with [lang] dynamic segments. Create language-specific routes, fetch translations by locale, and set the html lang attribute. Middleware can detect browser language and redirect.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Internationalization Routing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Folder structure\n// app/[lang]/page.tsx         → /en, /fr\n// app/[lang]/about/page.tsx   → /en/about, /fr/about\n// app/[lang]/layout.tsx       → root layout with lang"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Internationalization Routing — common patterns you'll see in production.\n// APPROACH  - Combine Internationalization Routing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// lib/i18n.ts\nconst translations = {\n  en: {\n    title: 'Welcome',\n    description: 'Hello!',\n  },\n  fr: {\n    title: 'Bienvenue',\n    description: 'Bonjour!',\n  },\n};\nexport function getDictionary(locale: string) {\n  return translations[locale as keyof typeof translations] || translations.en;\n}\nexport const languages = Object.keys(translations);\n// app/[lang]/page.tsx\nimport { getDictionary } from '@/lib/i18n';\nexport async function generateStaticParams() {\n  const languages = ['en', 'fr', 'es'];\n  return languages.map(lang => ({ lang }));\n}\nexport const metadata = { title: 'Home' };\nexport default async function Home({ params }: { params: { lang: string } }) {\n  const dict = getDictionary(params.lang);\n  return (\n    <main>\n      <h1>{dict.title}</h1>\n      <p>{dict.description}</p>\n    </main>\n  );\n}\n// app/[lang]/layout.tsx\nimport { getDictionary, languages } from '@/lib/i18n';\nexport async function generateStaticParams() {\n  return languages.map(lang => ({ lang }));\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Internationalization Routing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport default async function Layout({\n  children,\n  params: { lang },\n}: {\n  children: React.ReactNode;\n  params: { lang: string };\n}) {\n  const dict = getDictionary(lang);\n  return (\n    <html lang={lang}>\n      <body>{children}</body>\n    </html>\n  );\n}\n// middleware.ts — detect language and redirect\nimport { NextRequest, NextResponse } from 'next/server';\nconst languages = ['en', 'fr', 'es'];\nexport function middleware(request: NextRequest) {\n  const pathname = request.nextUrl.pathname;\n  // Already has a language prefix\n  if (languages.some(lang => pathname.startsWith(`/${lang}`))) {\n    return NextResponse.next();\n  }\n  // Detect preferred language from headers\n  const lang = request.headers\n    .get('accept-language')\n    ?.split(',')[0]\n    .split('-')[0] || 'en';\n  return NextResponse.redirect(\n    new URL(`/${languages.includes(lang) ? lang : 'en'}${pathname}`, request.url)\n  );\n}\nexport const config = { matcher: ['/((?!_next).*)'] };"
                  }
        ],
        tips: [
                  "Use generateStaticParams to pre-render all language variants.",
                  "Set html lang attribute correctly for accessibility and SEO.",
                  "Middleware can detect and redirect based on Accept-Language header.",
                  "Consider using a library like next-intl for more complex i18n needs."
        ],
        mistake: "Not setting the html lang attribute — impacts accessibility and SEO.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },

  // ── Section 3: Advanced Techniques ─────────────────────────────────────────
  {
    id: "advanced-techniques",
    title: "Advanced Techniques",
    entries: [
      {
        id: "abort-controller-cancellation",
        fn: "Request Cancellation & AbortController",
        desc: "Cancel long-running requests when navigating away or on timeout.",
        category: "Performance",
        subtitle: "Clean up async operations",
        signature: "const controller = new AbortController()",
        descLong: "Use AbortController to cancel fetch requests when components unmount or users navigate. Prevents wasting network bandwidth and prevents memory leaks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Request Cancellation & AbortController — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Server Action with timeout\n'use server';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Request Cancellation & AbortController — common patterns you'll see in production.\n// APPROACH  - Combine Request Cancellation & AbortController with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport async function fetchDataWithTimeout(timeout = 5000) {\n  const controller = new AbortController();\n  const id = setTimeout(() => controller.abort(), timeout);\n  try {\n    const response = await fetch('https://slow-api.example.com/data', {\n      signal: controller.signal,\n    });\n    return await response.json();\n  } catch (error) {\n    if (error.name === 'AbortError') {\n      throw new Error('Request timed out');\n    }\n    throw error;\n  } finally {\n    clearTimeout(id);\n  }\n}\n// Client Component with cleanup\n'use client';\nimport { useEffect, useRef } from 'react';\nexport function DataFetcher() {\n  const controllerRef = useRef<AbortController | null>(null);\n  useEffect(() => {\n    controllerRef.current = new AbortController();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Request Cancellation & AbortController — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Fetch with cancellation\n    async function fetchData() {\n      try {\n        const response = await fetch('/api/data', {\n          signal: controllerRef.current!.signal,\n        });\n        // Handle response\n      } catch (error) {\n        if (error.name === 'AbortError') {\n          console.log('Fetch cancelled');\n        }\n      }\n    }\n    fetchData();\n    // Cancel on unmount\n    return () => controllerRef.current?.abort();\n  }, []);\n  return <div>Loading...</div>;\n}"
                  }
        ],
        tips: [
                  "AbortController cancels both fetch and streaming responses.",
                  "Use in cleanup functions to prevent updates after unmount.",
                  "Timeouts prevent indefinite waits on slow APIs.",
                  "Handle AbortError separately from other errors."
        ],
        mistake: "Not cancelling requests on unmount — can cause memory leaks and update-after-unmount warnings.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "progressive-enhancement",
        fn: "Progressive Enhancement",
        desc: "Build features that work without JavaScript. Forms submit, navigation happens server-side.",
        category: "Best Practices",
        subtitle: "JavaScript-optional functionality",
        signature: "<form action={serverAction}> works without JS",
        descLong: "Progressive enhancement means core features work without JavaScript — forms submit, navigation happens, dynamic content loads. JavaScript enhances the experience with loading states, optimistic updates, and animations. Server Actions and forms are naturally progressive.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Progressive Enhancement — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Progressive form — works with or without JS\n'use client';\nimport { createPost } from '@/app/actions';\nimport { useFormStatus } from 'react-dom';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Progressive Enhancement — common patterns you'll see in production.\n// APPROACH  - Combine Progressive Enhancement with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport function PostForm() {\n  const { pending } = useFormStatus();\n  return (\n    <form action={createPost}>\n      {/* Form works without JavaScript */}\n      <input\n        name=\"title\"\n        type=\"text\"\n        placeholder=\"Title\"\n        required\n        disabled={pending}\n      />\n      <textarea\n        name=\"content\"\n        placeholder=\"Content\"\n        required\n        disabled={pending}\n      />"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Progressive Enhancement — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n{/* Button works without JS, shows loading state with JS */}\n      <button type=\"submit\" disabled={pending}>\n        {pending ? 'Creating...' : 'Create Post'}\n      </button>\n    </form>\n  );\n}\n// Without JavaScript:\n// - User fills form, clicks Create\n// - Form submits via HTTP POST\n// - Server action runs\n// - Page redirects\n// - User sees new post\n// With JavaScript:\n// - Same flow, but faster\n// - No page reload\n// - Optimistic updates possible\n// - Loading state shown immediately"
                  }
        ],
        tips: [
                  "Use Server Actions with forms for natural progressive enhancement.",
                  "Test in DevTools with JavaScript disabled.",
                  "Progressive enhancement improves perceived performance.",
                  "Graceful degradation is better UX than broken without JS."
        ],
        mistake: "Relying on JavaScript for core functionality — assume JS will fail sometimes.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },
]

export default { meta, sections }
