import Link from 'next/link'
import SEOHead from '../components/SEOHead'
import { catalog } from '../data/catalog'

export default function Home() {
  return (
    <>
      <SEOHead
        title={null}
        description="Free interactive cheat sheets for Python, SQL, JavaScript, CSS, Lean Six Sigma, Statistics and more. Click any entry for deep dives, code examples, pro tips, and tutorial videos."
        canonical="https://codesheets.dev"
      />

      <main className="home">
        <div className="home-hero">
          <h1 className="home-wordmark">Code<em>Sheets</em></h1>
          <p className="home-tagline">// interactive reference · click any entry for a deep dive</p>
        </div>

        <div className="home-domains">
          {catalog.map(domain => (
            <Link
              key={domain.id}
              href={`/${domain.id}/${domain.sheets[0].id}`}
              className="home-domain-card"
              style={{ '--card-accent': domain.color }}
            >
              <img
                src={`/icons/${domain.id}.png`}
                alt={domain.label}
                width={36}
                height={36}
                className="home-domain-icon"
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline'; }}
              />
              <span className="home-domain-icon-fallback" style={{ display: 'none', fontSize: 24 }}>{domain.icon}</span>
              <span
                className="home-domain-name"
                style={{ color: domain.color }}
              >
                {domain.label}
              </span>
              <span className="home-domain-count">
                {domain.sheets.length} sheet{domain.sheets.length !== 1 ? 's' : ''}
                {' · '}
                {domain.sheets.reduce((sum, s) => sum + (s.entryCount || 0), 0)} entries
              </span>
            </Link>
          ))}
        </div>

        <div className="home-vault-cta">
          <Link href="/vault" className="home-vault-link">
            <span className="home-vault-badge">NEW</span>
            <strong>Premium Obsidian Vault</strong>
            <span>1,100+ cross-linked notes · learning paths · AI prompts · study system</span>
          </Link>
        </div>
      </main>
    </>
  )
}
