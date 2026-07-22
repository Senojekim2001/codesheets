import { useEffect, useCallback } from 'react'

// Classify a comment line by its tag prefix and return the right span
function tagComment(raw) {
  if (/\/\/\s*GOAL:|#\s*GOAL:|--\s*GOAL:/.test(raw))  return `<span class="cm cm-goal">${raw}</span>`
  if (/\/\/\s*WHY:|#\s*WHY:|--\s*WHY:/.test(raw))     return `<span class="cm cm-why">${raw}</span>`
  if (/\/\/\s*NOTE:|#\s*NOTE:|--\s*NOTE:/.test(raw))   return `<span class="cm cm-note">${raw}</span>`
  if (/\/\/\s*→|#\s*→|--\s*→/.test(raw))              return `<span class="cm cm-out">${raw}</span>`
  return `<span class="cm">${raw}</span>`
}

function highlight(code, domain) {
  if (!code) return ''
  // Escape HTML
  let h = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // SQL keywords
  const sqlKws = ['SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','FULL','INNER','OUTER',
    'CROSS','NATURAL','USING','ON','AS','AND','OR','NOT','IN','EXISTS','BETWEEN','LIKE',
    'IS','NULL','DISTINCT','ORDER','BY','GROUP','HAVING','LIMIT','OFFSET','UNION','ALL',
    'INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER','DROP',
    'INDEX','UNIQUE','VIEW','MATERIALIZED','WITH','CASE','WHEN','THEN','ELSE','END',
    'OVER','PARTITION','ROWS','RANGE','PRECEDING','FOLLOWING','CURRENT','ROW','RECURSIVE',
    'EXPLAIN','ANALYZE','BEGIN','COMMIT','ROLLBACK','SAVEPOINT','TRANSACTION','ISOLATION',
    'LEVEL','TRUNCATE','COALESCE','NULLIF','CAST','CONVERT','REFERENCES','PRIMARY','KEY',
    'FOREIGN','DEFAULT','CHECK','BIGSERIAL','BIGINT','VARCHAR','NUMERIC','TIMESTAMPTZ',
    'INTERVAL','REFRESH','CONSTRAINT','FOR','SKIP','LOCKED','NOWAIT','SHOW']

  // Python keywords
  const pyKws = ['def','class','return','import','from','as','if','elif','else','for',
    'while','in','not','and','or','try','except','finally','raise','with','lambda',
    'pass','break','continue','True','False','None','yield','async','await','is']

  // JS / generic keywords
  const jsKws = ['const','let','var','function','return','import','export','default','from',
    'if','else','for','while','do','in','of','new','this','class','extends','super',
    'try','catch','finally','throw','async','await','typeof','instanceof','true','false',
    'null','undefined','void','delete','switch','case','break','continue','yield','static']

  const keywords = domain === 'python' ? pyKws : domain === 'sql' ? sqlKws : jsKws

  // Extract comments into placeholders FIRST so keyword/string/number
  // highlighting doesn't corrupt the HTML span tags we inject for comments
  const commentPlaceholders = []
  const stashComment = (raw) => {
    const idx = commentPlaceholders.length
    commentPlaceholders.push(tagComment(raw))
    return `\x00C${idx}\x00`
  }

  if (domain === 'python') {
    h = h.replace(/(#[^\n]*)/g, (_, m) => stashComment(m))
  } else if (domain === 'sql' || domain === 'dax') {
    h = h.replace(/(--[^\n]*)/g, (_, m) => stashComment(m))
  } else if (domain === 'excel') {
    // Excel is mixed: Power Query M / formulas use //, VBA uses '
    // (' is already escaped to &#039; — match at line start only, so
    // apostrophes inside strings aren't misread as comments)
    h = h.replace(/(\/\/[^\n]*)/g, (_, m) => stashComment(m))
    h = h.replace(/^([ \t]*&#039;[^\n]*)/gm, (_, m) => stashComment(m))
  } else {
    // JS, TS, React, Node, Go, Rust, Java, C++ etc. — use //
    h = h.replace(/(\/\/[^\n]*)/g, (_, m) => stashComment(m))
  }

  // Strings — stash into placeholders so keyword highlighting doesn't corrupt span tags
  // Match same-type quotes only: &quot;...&quot; or &#039;...&#039;
  const stringPlaceholders = []
  const stashString = (m) => {
    const idx = stringPlaceholders.length
    stringPlaceholders.push(`<span class="str">${m}</span>`)
    return `\x00S${idx}\x00`
  }
  h = h.replace(/(&quot;[^]*?&quot;)/g, (_, m) => stashString(m))
  h = h.replace(/(&#039;[^]*?&#039;)/g, (_, m) => stashString(m))

  // Keywords — single combined pass; sequential per-keyword replacement would
  // let later keywords (e.g. 'class') match inside already-inserted span tags
  h = h.replace(new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'), '<span class="kw">$1</span>')

  // Numbers
  h = h.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>')

  // Function calls
  h = h.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*(?=\()/g, '<span class="fn">$1</span>')

  // Restore strings from placeholders
  h = h.replace(/\x00S(\d+)\x00/g, (_, i) => stringPlaceholders[+i])

  // Restore comments from placeholders (last step)
  h = h.replace(/\x00C(\d+)\x00/g, (_, i) => commentPlaceholders[+i])

  return h
}

function buildPlaceholder(ytId, ytTitle) {
  return `
    <div class="yt-placeholder" onclick="
      this.parentElement.innerHTML = '<iframe src=\\'https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1\\' allow=\\'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture\\' allowfullscreen></iframe>'
    ">
      <div class="yt-play">▶</div>
      <p><strong>${ytTitle || 'Tutorial Video'}</strong><br>Click to load</p>
    </div>
  `
}

export default function EntryModal({ entry, entries, index, onClose, onNav, domain }) {
  const isOpen = !!entry

  const handleNav = useCallback((dir) => {
    const next = index + dir
    if (next >= 0 && next < entries.length) onNav(next)
  }, [index, entries, onNav])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNav(1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handleNav(-1)
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleNav, onClose])

  if (!entry) return null

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal" data-domain={domain}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div className="modal-title">{entry.fn}</div>
              {entry.category && <div className="modal-cat">{entry.category}</div>}
            </div>
            {entry.subtitle && <div className="modal-sub">{entry.subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose} title="Close (Esc)">✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {entry.descLong && (
            <p className="modal-desc">{entry.descLong}</p>
          )}

          {entry.signature && (
            <div>
              <div className="modal-label">Syntax</div>
              <pre className="modal-sig">{entry.signature}</pre>
            </div>
          )}

          {/* ── Tiered examples (new format) ── */}
          {entry.examples?.length > 0 ? (
            <div>
              <div className="modal-label">Examples</div>
              <div className="examples-stack">
                {entry.examples.map((ex, i) => (
                  <div key={i} className={`example-block example-block--${ex.tier}`}>
                    <div className="example-tier-badge">{ex.tier}</div>
                    <pre
                      className="modal-code example-code"
                      dangerouslySetInnerHTML={{ __html: highlight(ex.code, domain) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : entry.code && (
            /* ── Legacy single code block (fallback) ── */
            <div className="modal-cols">
              <div>
                <div className="modal-label">Examples</div>
                <pre
                  className="modal-code"
                  dangerouslySetInnerHTML={{ __html: highlight(entry.code, domain) }}
                />
              </div>
              {entry.tips?.length > 0 && (
                <div>
                  <div className="modal-label">Pro Tips</div>
                  <ul className="modal-tips">
                    {entry.tips.map((tip, i) => (
                      <li key={i} dangerouslySetInnerHTML={{
                        __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tips — shown below examples in new format */}
          {entry.examples?.length > 0 && entry.tips?.length > 0 && (
            <div>
              <div className="modal-label">Pro Tips</div>
              <ul className="modal-tips">
                {entry.tips.map((tip, i) => (
                  <li key={i} dangerouslySetInnerHTML={{
                    __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                ))}
              </ul>
            </div>
          )}

          {/* Shorthand — legacy only, skip when examples present */}
          {!entry.examples && entry.shorthand && (
            <div className="modal-shorthand">
              <div className="modal-label">⚡ Shorthand</div>
              <div className="shorthand-subtitle">readable &amp; idiomatic — not just shorter</div>
              <div className="shorthand-cols">
                <div className="shorthand-block">
                  <div className="shorthand-lbl">Junior</div>
                  <pre
                    className="modal-code shorthand-code"
                    dangerouslySetInnerHTML={{ __html: highlight(entry.shorthand.verbose, domain) }}
                  />
                </div>
                <div className="shorthand-arrow">→</div>
                <div className="shorthand-block">
                  <div className="shorthand-lbl shorthand-lbl--concise">Senior</div>
                  <pre
                    className="modal-code shorthand-code shorthand-code--concise"
                    dangerouslySetInnerHTML={{ __html: highlight(entry.shorthand.concise, domain) }}
                  />
                </div>
              </div>
            </div>
          )}

          {entry.mistake && (
            <div className="modal-mistake">
              <div className="modal-mistake-lbl">⚠ Common Mistake</div>
              <p dangerouslySetInnerHTML={{
                __html: entry.mistake.replace(/`([^`]+)`/g, '<code>$1</code>')
              }} />
            </div>
          )}

          {entry.ytId && (
            <div className="modal-vid">
              <div className="modal-vid-hdr">
                <span className="yt-badge">▶ YouTube</span>
                <span className="yt-title">{entry.ytTitle || 'Tutorial Video'}</span>
              </div>
              <div
                className="yt-wrap"
                dangerouslySetInnerHTML={{ __html: buildPlaceholder(entry.ytId, entry.ytTitle) }}
              />
              <div className="yt-note">Click thumbnail to load · Requires internet · Plays inline</div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="modal-nav">
          <button
            className="modal-nav-btn"
            onClick={() => handleNav(-1)}
            disabled={index <= 0}
          >← Prev</button>
          <span className="modal-nav-ctr">{index + 1} / {entries.length}</span>
          <button
            className="modal-nav-btn"
            onClick={() => handleNav(1)}
            disabled={index >= entries.length - 1}
          >Next →</button>
        </div>
      </div>
    </div>
  )
}
