import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import EntryModal from './EntryModal'

export default function SheetGrid({ sections, domain, sheetId }) {
  const [modalIndex, setModalIndex] = useState(null)
  const [query, setQuery] = useState('')
  const [tocOpen, setTocOpen] = useState(false)
  const [collapsed, setCollapsed] = useState({})
  const [showTop, setShowTop] = useState(false)
  const [fullEntry, setFullEntry] = useState(null)
  const [entryLoading, setEntryLoading] = useState(false)
  const fullSheetRef = useRef(null)
  const searchRef = useRef(null)
  const tocRef = useRef(null)

  const lowerQuery = query.toLowerCase().trim()

  // Filter sections/entries by search query
  const filteredSections = useMemo(() => {
    if (!lowerQuery) return sections
    return sections
      .map(s => ({
        ...s,
        entries: s.entries.filter(e =>
          e.fn.toLowerCase().includes(lowerQuery) ||
          e.desc.toLowerCase().includes(lowerQuery) ||
          (e.category && e.category.toLowerCase().includes(lowerQuery))
        ),
      }))
      .filter(s => s.entries.length > 0)
  }, [sections, lowerQuery])

  // Flat list of all filtered entries for prev/next navigation
  const allEntries = useMemo(
    () => filteredSections.flatMap(s => s.entries),
    [filteredSections]
  )

  const totalEntries = useMemo(
    () => sections.reduce((sum, s) => sum + s.entries.length, 0),
    [sections]
  )

  const openEntry = useCallback(async (entry) => {
    const idx = allEntries.findIndex(e => e.id === entry.id)
    setModalIndex(idx)
    setFullEntry(null)
    setEntryLoading(true)

    try {
      // Fetch the full sheet JSON once and cache it
      if (!fullSheetRef.current) {
        const res = await fetch(`/data/${domain}/${sheetId}.json`)
        fullSheetRef.current = await res.json()
      }
      const sheet = fullSheetRef.current
      const found = (sheet.sections || []).flatMap(s => s.entries || []).find(e => e.id === entry.id)
      setFullEntry(found || entry)
    } catch (err) {
      console.error('Failed to fetch entry details:', err)
      setFullEntry(entry)
    } finally {
      setEntryLoading(false)
    }
  }, [allEntries, domain, sheetId])

  // Fetch full entry data when navigating between entries in the modal
  useEffect(() => {
    if (modalIndex === null) return
    const entry = allEntries[modalIndex]
    if (!entry) return

    setFullEntry(null)
    setEntryLoading(true)

    ;(async () => {
      try {
        if (!fullSheetRef.current) {
          const res = await fetch(`/data/${domain}/${sheetId}.json`)
          fullSheetRef.current = await res.json()
        }
        const sheet = fullSheetRef.current
        const found = (sheet.sections || []).flatMap(s => s.entries || []).find(e => e.id === entry.id)
        setFullEntry(found || entry)
      } catch (err) {
        console.error('Failed to fetch entry details:', err)
        setFullEntry(entry)
      } finally {
        setEntryLoading(false)
      }
    })()
  }, [modalIndex, allEntries, domain, sheetId])

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(`section-${sectionId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTocOpen(false)
    }
  }, [])

  const toggleSection = useCallback((sectionId) => {
    setCollapsed(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }, [])

  // Keyboard shortcut: "/" or Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handler = (e) => {
      if (modalIndex !== null) return
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setQuery('')
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modalIndex])

  // Close TOC on outside click
  useEffect(() => {
    if (!tocOpen) return
    const handler = (e) => {
      if (tocRef.current && !tocRef.current.contains(e.target)) {
        setTocOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tocOpen])

  // Show back-to-top after scrolling
  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      {/* Search + section jump bar */}
      <div className="sheet-toolbar">
        <div className="sheet-search">
          <span className="sheet-search-icon">⌕</span>
          <input
            ref={searchRef}
            type="text"
            className="sheet-search-input"
            placeholder={`Search ${totalEntries} entries…  ( / )`}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="sheet-search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>

        <div className="sheet-stats">
          {lowerQuery
            ? `${allEntries.length} of ${totalEntries} entries`
            : `${sections.length} sections · ${totalEntries} entries`}
        </div>

        {sections.length > 3 && (
          <div className="sheet-toc-wrap" ref={tocRef}>
            <button
              className={`sheet-toc-btn ${tocOpen ? 'active' : ''}`}
              onClick={() => setTocOpen(o => !o)}
            >
              ☰ Sections
            </button>
            {tocOpen && (
              <div className="sheet-toc-dropdown">
                {sections.map(s => (
                  <button
                    key={s.id}
                    className="sheet-toc-item"
                    onClick={() => scrollToSection(s.id)}
                  >
                    <span className="sheet-toc-title">{s.title}</span>
                    <span className="sheet-toc-count">{s.entries.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sheet-grid">
        {filteredSections.map(section => (
          <div key={section.id} className="section" id={`section-${section.id}`}>
            <div
              className="section-header"
              onClick={() => toggleSection(section.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggleSection(section.id)}
            >
              <span className="section-collapse-icon">{collapsed[section.id] ? '▸' : '▾'}</span>
              <span>{section.title}</span>
              <span className="section-count">{section.entries.length}</span>
            </div>
            {!collapsed[section.id] && (
              <div className="section-body">
                {section.entries.map(entry => (
                  <div
                    key={entry.id}
                    className="entry"
                    onClick={() => openEntry(entry)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && openEntry(entry)}
                  >
                    <span className="entry-fn">{entry.fn}</span>
                    <span className="entry-desc">{entry.desc}</span>
                    <span className="entry-expand">▸</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {lowerQuery && filteredSections.length === 0 && (
        <div className="sheet-no-results">
          No entries match &ldquo;<strong>{query}</strong>&rdquo;
        </div>
      )}

      {/* Back to top */}
      <button
        className={`back-to-top ${showTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>

      <EntryModal
        entry={fullEntry || allEntries[modalIndex]}
        entries={allEntries}
        index={modalIndex ?? 0}
        onClose={() => { setModalIndex(null); setFullEntry(null) }}
        onNav={setModalIndex}
        domain={domain}
        loading={entryLoading}
      />
    </>
  )
}
