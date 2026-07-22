import Link from 'next/link'
import { useRouter } from 'next/router'
import { catalog } from '../data/catalog'

export default function NavBar() {
  const router = useRouter()
  const { domain } = router.query
  const activeDomain = typeof domain === 'string' ? domain : null

  return (
    <nav className="navbar" data-domain={activeDomain || undefined}>
      <Link href="/" className="nav-logo">
        <img src="/icons/logo.png" alt="CodeSheets" width={28} height={28} className="nav-logo-img" />
        <span className="nav-logo-text">
          Code<em>Sheets</em>
        </span>
      </Link>

      <div className="nav-items">
        {catalog.map(d => (
          <Link
            key={d.id}
            href={`/${d.id}/${d.sheets[0].id}`}
            className={`nav-domain ${activeDomain === d.id ? 'active' : ''}`}
          >
            <img
              src={`/icons/${d.id}.png`}
              alt={d.label}
              width={22}
              height={22}
              className="nav-domain-icon"
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline'; }}
            />
            <span className="nav-domain-emoji" style={{ display: 'none' }}>{d.icon}</span>
            <span>{d.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
