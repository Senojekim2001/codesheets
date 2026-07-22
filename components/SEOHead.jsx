import Head from 'next/head'

export default function SEOHead({ title, description, canonical, domain }) {
  const fullTitle = title ? `${title} | CodeSheets` : 'CodeSheets — Interactive Cheat Sheets for Developers'
  const desc = description || 'Free interactive cheat sheets for Python, SQL, JavaScript, CSS, and more. Click any entry for deep dives, code examples, pro tips, and tutorial videos.'

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonical || 'https://codesheets.dev'} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical || 'https://codesheets.dev'} />
      <meta property="og:site_name" content="CodeSheets" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />

      {/* Structured data — breadcrumb */}
      {domain && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://codesheets.dev' },
                { '@type': 'ListItem', position: 2, name: title, item: canonical },
              ],
            }),
          }}
        />
      )}

      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/logo-32.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Head>
  )
}
