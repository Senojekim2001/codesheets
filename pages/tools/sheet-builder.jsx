import { useState, useCallback, useRef } from "react";

const EXAMPLE_JSON = {
  meta: {
    title: "CSS Flexbox",
    domain: "css",
    sheet: "flexbox",
    icon: "📦"
  },
  sections: [
    {
      id: "container",
      title: "Flex Container",
      entries: [
        {
          id: "display-flex",
          fn: "display: flex",
          desc: "Enable flexbox on a container.",
          category: "Container",
          subtitle: "Turn any element into a flex container",
          signature: "display: flex | inline-flex",
          descLong: "Setting display: flex on an element makes it a flex container. Its direct children become flex items. Use inline-flex to keep the container itself inline.",
          code: ".container {\n  display: flex;\n}\n\n/* Inline flex */\n.tag-list {\n  display: inline-flex;\n  gap: 8px;\n}",
          tips: [
            "Only **direct children** become flex items — grandchildren are unaffected",
            "Flexbox is one-dimensional — use CSS Grid for two-dimensional layouts",
            "Use `gap` instead of margins between flex children — cleaner and gap-aware",
            "Flex containers don't collapse margins unlike block elements"
          ],
          mistake: "Applying flex properties to the child instead of the container. Properties like justify-content and align-items go on the parent flex container, not the children.",
          ytId: "fYq5PXgSsbE",
          ytTitle: "Flexbox in 100 Seconds"
        },
        {
          id: "justify-content",
          fn: "justify-content",
          desc: "Align items along the main axis.",
          category: "Container",
          subtitle: "Distribute space along the main axis",
          signature: "justify-content: flex-start | center | flex-end | space-between | space-evenly",
          descLong: "justify-content controls spacing along the main axis. space-between puts space between items with none at edges; space-evenly distributes equal space everywhere including the edges.",
          code: "/* Center horizontally */\n.center { justify-content: center; }\n\n/* Space between items */\n.nav { justify-content: space-between; }",
          tips: [
            "`space-between` — no edge space; `space-evenly` — equal space including edges",
            "In a column container, justify-content controls **vertical** alignment",
            "`flex-start` is the default — items pack to the start of the main axis",
            "Combine with `align-items: center` to center both axes simultaneously"
          ],
          mistake: "Using justify-content to vertically center in a row container — that's align-items. justify-content always targets the main axis, which is horizontal in a row.",
          ytId: "fYq5PXgSsbE",
          ytTitle: "CSS justify-content"
        }
      ]
    }
  ]
};

/**
 * Domain / sheet reference for the field guide below.
 * Keep in sync with data/catalog.js.
 */
const DOMAIN_REFERENCE = [
  { domain: "python",  sheets: ["core", "pandas", "numpy", "matplotlib", "oop", "dsa", "apis"] },
  { domain: "sql",     sheets: ["core"] },
  { domain: "excel",   sheets: ["core"] },
  { domain: "stats",   sheets: ["core", "inference", "regression", "bayesian", "multivariate", "timeseries"] },
  { domain: "r",       sheets: ["core", "tidyverse", "ggplot2", "datatable", "modeling", "workflow"] },
  { domain: "js",      sheets: ["core", "async", "dom"] },
  { domain: "css",     sheets: ["core", "flexbox", "grid"] },
  { domain: "lss",     sheets: ["define", "measure", "analyze", "improve", "control"] },
  { domain: "math",    sheets: ["set-theory", "rel-algebra", "logic"] },
];

function renderInline(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function EntryCard({ entry, onClick }) {
  return (
    <div
      onClick={() => onClick(entry)}
      style={{
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: 6,
        padding: "12px 14px",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#f5c400";
        e.currentTarget.style.background = "#1e1e1e";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#2a2a2a";
        e.currentTarget.style.background = "#1a1a1a";
      }}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#f5c400", marginBottom: 4 }}>
        {entry.fn}
      </div>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.4 }}>{entry.desc}</div>
    </div>
  );
}

function Modal({ entry, onClose }) {
  if (!entry) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#141414", border: "1px solid #2a2a2a", borderRadius: 10,
          width: "100%", maxWidth: 680, maxHeight: "85vh", overflowY: "auto",
          padding: 28,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <span style={{ background: "#222", color: "#888", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>
              {entry.category}
            </span>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f5c400", fontFamily: "'JetBrains Mono', monospace", marginTop: 8 }}>
              {entry.fn}
            </div>
            <div style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>{entry.subtitle}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 22, lineHeight: 1 }}
          >×</button>
        </div>

        <div style={{ background: "#0d0d0d", borderRadius: 6, padding: "8px 12px", marginBottom: 14 }}>
          <code style={{ color: "#00c8c8", fontSize: 12 }}>{entry.signature}</code>
        </div>

        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{entry.descLong}</p>

        {entry.code && (
          <pre style={{
            background: "#0d0d0d", border: "1px solid #222", borderRadius: 6,
            padding: 14, fontSize: 12, color: "#e8e8e8", overflowX: "auto",
            fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6, marginBottom: 16,
          }}>{entry.code}</pre>
        )}

        {entry.tips?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Pro Tips</div>
            {entry.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "#f5c400", flexShrink: 0, marginTop: 1 }}>→</span>
                <span style={{ color: "#bbb", fontSize: 13, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: renderInline(tip) }} />
              </div>
            ))}
          </div>
        )}

        {entry.mistake && (
          <div style={{ background: "#1a0f0f", border: "1px solid #3a1a1a", borderRadius: 6, padding: "10px 14px" }}>
            <span style={{ color: "#ff6b6b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Common Mistake · </span>
            <span style={{ color: "#cc8888", fontSize: 13 }}>{entry.mistake}</span>
          </div>
        )}

        {entry.ytId && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Video</div>
            <a href={`https://youtube.com/watch?v=${entry.ytId}`} target="_blank" rel="noopener noreferrer"
              style={{ color: "#f5c400", fontSize: 13, textDecoration: "none" }}>
              ▶ {entry.ytTitle}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function SheetPreview({ data }) {
  const [activeEntry, setActiveEntry] = useState(null);
  if (!data) return null;
  const { meta, sections } = data;
  return (
    <div style={{ fontFamily: "Barlow, sans-serif" }}>
      <div style={{ borderBottom: "1px solid #2a2a2a", paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "-0.3px" }}>
          {meta.icon} {meta.title}
        </div>
        <div style={{ color: "#555", fontSize: 12, marginTop: 4, fontFamily: "monospace" }}>
          {meta.domain}/{meta.sheet} · {sections.reduce((n, s) => n + s.entries.length, 0)} entries
        </div>
      </div>
      {sections.map(section => (
        <div key={section.id} style={{ marginBottom: 24 }}>
          <div style={{
            background: "#f5c400", color: "#0d0d0d", fontSize: 11, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.8px", padding: "4px 10px",
            display: "inline-block", borderRadius: 3, marginBottom: 10,
          }}>
            {section.title}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
            {section.entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} onClick={setActiveEntry} />
            ))}
          </div>
        </div>
      ))}
      <Modal entry={activeEntry} onClose={() => setActiveEntry(null)} />
    </div>
  );
}

function jsExport(data) {
  const { meta, sections } = data;
  const sectionStr = sections.map(s => {
    const entriesStr = s.entries.map(e => {
      const tips = e.tips?.length
        ? `tips: [${e.tips.map(t => `\n          '${t.replace(/'/g, "\\'")}'`).join(",")}],\n        `
        : "";
      const mistake = e.mistake ? `mistake: '${e.mistake.replace(/'/g, "\\'")}',\n        ` : "";
      const yt = e.ytId ? `ytId: '${e.ytId}', ytTitle: '${e.ytTitle}',\n        ` : "";
      return `      {
        id: '${e.id}', fn: '${e.fn}', desc: '${e.desc}',
        category: '${e.category}', subtitle: '${e.subtitle}',
        signature: '${e.signature.replace(/'/g, "\\'")}',
        descLong: '${e.descLong.replace(/'/g, "\\'")}',
        code: \`${e.code}\`,
        ${tips}${mistake}${yt}},`;
    }).join("\n");
    return `  {
    id: '${s.id}',
    title: '${s.title}',
    entries: [\n${entriesStr}\n    ],
  },`;
  }).join("\n");

  return `/**
 * data/${meta.domain}/${meta.sheet}.js
 * ${meta.title}
 */

export const meta = {
  title: '${meta.title}',
  domain: '${meta.domain}',
  sheet: '${meta.sheet}',
  icon: '${meta.icon}',
}

export const sections = [
${sectionStr}
]

export default { meta, sections }
`;
}

const TABS = ["editor", "preview", "export"];

export default function SheetBuilder() {
  const [tab, setTab] = useState("editor");
  const [jsonText, setJsonText] = useState(JSON.stringify(EXAMPLE_JSON, null, 2));
  const [parsed, setParsed] = useState(EXAMPLE_JSON);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef();

  const handleJsonChange = useCallback((val) => {
    setJsonText(val);
    try {
      const obj = JSON.parse(val);
      if (!obj.meta || !obj.sections) throw new Error("Missing 'meta' or 'sections' fields");
      setParsed(obj);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, []);

  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = parsed ? `${parsed.meta.domain}-${parsed.meta.sheet}.json` : "sheet.json";
    a.click();
  };

  const handleDownloadJs = () => {
    if (!parsed) return;
    const js = jsExport(parsed);
    const blob = new Blob([js], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${parsed.meta.sheet}.js`;
    a.click();
  };

  const jsOutput = parsed ? jsExport(parsed) : "";
  const entryCount = parsed ? parsed.sections.reduce((n, s) => n + s.entries.length, 0) : 0;

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d0d", color: "#e8e8e8",
      fontFamily: "'Barlow', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e1e1e", padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#f5c400" }}>Code</span>Sheets
          </div>
          <div style={{ width: 1, height: 20, background: "#2a2a2a" }} />
          <div style={{ fontSize: 13, color: "#666" }}>Sheet Builder</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleDownloadJson}
            style={{
              background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaa",
              padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontSize: 12,
            }}
          >
            ↓ JSON
          </button>
          <button
            onClick={handleDownloadJs}
            disabled={!!error || !parsed}
            style={{
              background: error ? "#1a1a1a" : "#f5c400", border: "none",
              color: error ? "#555" : "#0d0d0d",
              padding: "6px 14px", borderRadius: 5, cursor: error ? "not-allowed" : "pointer",
              fontSize: 12, fontWeight: 700,
            }}
          >
            ↓ .js File
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        background: error ? "#1a0808" : "#0d1a0d",
        borderBottom: `1px solid ${error ? "#3a1010" : "#0d2a0d"}`,
        padding: "6px 24px", fontSize: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ color: error ? "#ff6b6b" : "#4ade80" }}>
          {error ? `⚠ ${error}` : `✓ Valid JSON · ${parsed?.sections?.length ?? 0} sections · ${entryCount} entries`}
        </span>
        {parsed && !error && (
          <span style={{ color: "#555", fontFamily: "monospace" }}>
            {parsed.meta.domain}/{parsed.meta.sheet}.js
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1e1e1e", padding: "0 24px", display: "flex", gap: 0 }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none", border: "none",
              borderBottom: tab === t ? "2px solid #f5c400" : "2px solid transparent",
              color: tab === t ? "#f5c400" : "#555",
              padding: "10px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {t === "editor" ? "📝 Editor" : t === "preview" ? "👁 Preview" : "📤 Export (.js)"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

        {/* EDITOR TAB */}
        {tab === "editor" && (
          <div>
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "#555", fontSize: 13 }}>
                Paste or edit your sheet JSON. Click any entry in Preview to test the modal.
              </div>
              <button
                onClick={() => handleJsonChange(JSON.stringify(EXAMPLE_JSON, null, 2))}
                style={{ background: "none", border: "1px solid #2a2a2a", color: "#666", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
              >
                Load example
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={jsonText}
              onChange={e => handleJsonChange(e.target.value)}
              spellCheck={false}
              style={{
                width: "100%", minHeight: 560, background: "#111", border: "1px solid #2a2a2a",
                borderRadius: 8, color: "#e8e8e8", fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
                fontSize: 12, lineHeight: 1.6, padding: 16, resize: "vertical",
                outline: "none", boxSizing: "border-box",
                borderColor: error ? "#5a2020" : "#2a2a2a",
              }}
            />

            {/* Schema reference */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                Field Reference
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                {[
                  ["meta.title", "string", "Display title shown at top of sheet"],
                  ["meta.domain", "string", "Domain id — see domain map below"],
                  ["meta.sheet", "string", "Sheet id — see domain map below"],
                  ["meta.icon", "string", "Emoji shown next to title"],
                  ["sections[].id", "string", "Unique kebab-case slug for this section"],
                  ["sections[].title", "string", "Section header label"],
                  ["entry.id", "string", "Unique kebab-case slug for this entry"],
                  ["entry.fn", "string", "Function/keyword name shown in grid card"],
                  ["entry.desc", "string", "One-liner shown in grid card"],
                  ["entry.category", "string", "Badge label shown in modal"],
                  ["entry.subtitle", "string", "Subtitle line shown in modal header"],
                  ["entry.signature", "string", "Syntax/signature line in monospace"],
                  ["entry.descLong", "string", "Full description paragraph in modal"],
                  ["entry.code", "string", "Multi-line code block (use ── for section headers)"],
                  ["entry.tips", "string[]", "4 pro tips — **bold** and `code` markdown supported"],
                  ["entry.mistake", "string", "Common mistake callout (1 paragraph)"],
                  ["entry.ytId", "string?", "YouTube video ID only — not the full URL"],
                  ["entry.ytTitle", "string?", "YouTube video display title"],
                ].map(([field, type, desc]) => (
                  <div key={field} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <code style={{ color: "#00c8c8", fontSize: 11 }}>{field}</code>
                      <span style={{ color: "#555", fontSize: 10 }}>{type}</span>
                    </div>
                    <div style={{ color: "#666", fontSize: 11 }}>{desc}</div>
                  </div>
                ))}
              </div>

              {/* Domain map */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                  Domain → Sheet Map
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 8 }}>
                  {DOMAIN_REFERENCE.map(({ domain, sheets }) => (
                    <div key={domain} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 6, padding: "8px 12px" }}>
                      <code style={{ color: "#f5c400", fontSize: 12 }}>{domain}</code>
                      <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {sheets.map(s => (
                          <span key={s} style={{ background: "#1a1a1a", color: "#00c8c8", fontSize: 10, padding: "2px 6px", borderRadius: 3, fontFamily: "monospace" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW TAB */}
        {tab === "preview" && (
          <div>
            {error ? (
              <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <div style={{ color: "#ff6b6b" }}>Fix JSON errors before previewing</div>
                <div style={{ color: "#555", fontSize: 12, marginTop: 8 }}>{error}</div>
              </div>
            ) : (
              <SheetPreview data={parsed} />
            )}
          </div>
        )}

        {/* EXPORT TAB */}
        {tab === "export" && (
          <div>
            {error ? (
              <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <div style={{ color: "#ff6b6b" }}>Fix JSON errors to generate export</div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ color: "#555", fontSize: 13 }}>
                    Drop this file into <code style={{ color: "#00c8c8" }}>data/{parsed?.meta?.domain}/{parsed?.meta?.sheet}.js</code> — the router picks it up automatically.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleCopy(jsOutput)}
                      style={{
                        background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaa",
                        padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontSize: 12,
                      }}
                    >
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownloadJs}
                      style={{
                        background: "#f5c400", border: "none", color: "#0d0d0d",
                        padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 700,
                      }}
                    >
                      ↓ Download .js
                    </button>
                  </div>
                </div>
                <pre style={{
                  background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 8,
                  padding: 18, fontSize: 11.5, color: "#b8d0b8",
                  fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6,
                  overflowX: "auto", maxHeight: 600, overflowY: "auto",
                }}>
                  {jsOutput}
                </pre>

                <div style={{ marginTop: 20, background: "#0d1a1a", border: "1px solid #0d2a2a", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#00c8c8", marginBottom: 10 }}>Next steps</div>
                  {[
                    `Save the .js file to  data/${parsed?.meta?.domain}/${parsed?.meta?.sheet}.js`,
                    `In data/catalog.js, find the '${parsed?.meta?.domain}' domain and set entryCount: ${entryCount} on the '${parsed?.meta?.sheet}' sheet`,
                    `If '${parsed?.meta?.domain}' is a new domain, add it to catalog.js and add its accent colors to styles/globals.css under [data-domain="${parsed?.meta?.domain}"]`,
                    `Run npm run dev — codesheets.dev/${parsed?.meta?.domain}/${parsed?.meta?.sheet} is live automatically`,
                    "Run npm run build && npm run deploy to push to production",
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                      <span style={{ color: "#f5c400", fontWeight: 700, fontSize: 12, minWidth: 16 }}>{i + 1}.</span>
                      <span style={{ color: "#7aaaa0", fontSize: 12 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Barlow+Condensed:wght@700;800&family=Barlow:wght@400;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    </div>
  );
}
