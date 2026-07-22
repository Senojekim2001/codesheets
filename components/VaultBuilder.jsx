import { useState } from 'react'

/**
 * VaultBuilder — Premium Obsidian vault generator component.
 * Loads ALL domain data, generates cross-linked vault, downloads as .zip.
 */
export default function VaultBuilder({ catalog }) {
  const [status, setStatus] = useState('idle')    // idle | loading | generating | done | error
  const [progress, setProgress] = useState('')
  const [error, setError] = useState(null)
  const [txId, setTxId] = useState(null)

  const totalEntries = catalog.reduce(
    (sum, d) => sum + d.sheets.reduce((s2, sh) => s2 + (sh.entryCount || 0), 0),
    0
  )

  const handleGenerate = async () => {
    if (status === 'loading' || status === 'generating') return
    setStatus('loading')
    setError(null)

    try {
      setProgress('Loading all domain data...')

      // Dynamic import the vault generator
      const { generatePremiumVault, loadAllDomainData } = await import('../lib/vault/vaultGenerator')
      const { downloadBlob } = await import('../lib/exporters/fileHelper')

      // Load all 11 domains
      setProgress('Loading 11 domains...')
      const allData = await loadAllDomainData(catalog)

      const loadedCount = Object.values(allData)
        .reduce((sum, d) => sum + d.sections.reduce((s, sec) => s + (sec.entries ? sec.entries.length : 0), 0), 0)

      setProgress(`Loaded ${loadedCount} entries. Generating vault...`)
      setStatus('generating')

      // Generate the vault
      const result = await generatePremiumVault(allData)

      setTxId(result.txId)
      setProgress(`Done! Vault is ${(result.blob.size / 1024 / 1024).toFixed(1)} MB`)
      setStatus('done')

      // Download
      downloadBlob(result.blob, `codesheets-vault-${result.txId.slice(0, 8)}.zip`)

      // Fire tracking ping to AWS (non-blocking)
      try {
        fetch(`https://api.codesheets.dev/vault/activate?txid=${result.txId}&action=download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.manifest),
        }).catch(() => {}) // silent fail — don't block user
      } catch (_) {}

    } catch (err) {
      console.error('Vault generation failed:', err)
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="vault-builder">
      <div className="vault-header">
        <h2 className="vault-title">CodeSheets Premium Vault</h2>
        <p className="vault-subtitle">Complete Obsidian Knowledge Base</p>
      </div>

      <div className="vault-features">
        <div className="vault-feature">
          <span className="vault-feature-icon">🧠</span>
          <div>
            <strong>{totalEntries}+ Entry Notes</strong>
            <p>Every cheat sheet entry as a linked Obsidian note with code, tips, and examples</p>
          </div>
        </div>
        <div className="vault-feature">
          <span className="vault-feature-icon">🔗</span>
          <div>
            <strong>Cross-Domain Links</strong>
            <p>See how filtering, sorting, async, and 30+ concepts work across Python, JS, SQL, Go, R, and more</p>
          </div>
        </div>
        <div className="vault-feature">
          <span className="vault-feature-icon">🗺️</span>
          <div>
            <strong>Maps of Content</strong>
            <p>Concept-based index notes that connect the same pattern across all languages</p>
          </div>
        </div>
        <div className="vault-feature">
          <span className="vault-feature-icon">📍</span>
          <div>
            <strong>Learning Paths</strong>
            <p>Guided beginner → advanced sequences for Python, JS, SQL, Go, TypeScript, and Stats</p>
          </div>
        </div>
        <div className="vault-feature">
          <span className="vault-feature-icon">🤖</span>
          <div>
            <strong>AI Prompt Templates</strong>
            <p>Ready-to-use prompts for ChatGPT/Claude to practice concepts and get code reviews</p>
          </div>
        </div>
        <div className="vault-feature">
          <span className="vault-feature-icon">📅</span>
          <div>
            <strong>Study System</strong>
            <p>Daily review templates, weekly check-ins, and spaced repetition tracking</p>
          </div>
        </div>
      </div>

      <div className="vault-domains">
        <h3>Included Domains</h3>
        <div className="vault-domain-grid">
          {catalog.map(d => (
            <span key={d.id} className="vault-domain-chip" style={{ borderColor: d.color }}>
              {d.icon} {d.label}
              <em>{d.sheets.reduce((s, sh) => s + (sh.entryCount || 0), 0)}</em>
            </span>
          ))}
        </div>
      </div>

      <div className="vault-cta">
        <button
          className={`vault-download-btn ${status}`}
          onClick={handleGenerate}
          disabled={status === 'loading' || status === 'generating'}
        >
          {status === 'idle' && '⬇ Generate & Download Vault'}
          {status === 'loading' && '⏳ Loading data...'}
          {status === 'generating' && '⚙️ Building vault...'}
          {status === 'done' && '✅ Download Complete!'}
          {status === 'error' && '❌ Try Again'}
        </button>
        {progress && <p className="vault-progress">{progress}</p>}
        {error && <p className="vault-error">{error}</p>}
        {txId && (
          <p className="vault-txid">
            Transaction ID: <code>{txId}</code>
          </p>
        )}
      </div>
    </div>
  )
}
