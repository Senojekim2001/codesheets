import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ"; // 🔁 Replace with your video ID

const entries = [
  {
    id: "py-print",
    name: "print()",
    description: "Output to console.",
    timestamp: 0,
    duration: 42,
    code: [
      { code: 'print("Hello World")', comment: null },
      { code: "# Hello World", comment: null },
    ],
  },
  {
    id: "py-input",
    name: "input()",
    description: "Read user input as string.",
    timestamp: 42,
    duration: 38,
    code: [{ code: 'name = input("Name: ")', comment: null }],
  },
  {
    id: "py-len",
    name: "len()",
    description: "Return length of object.",
    timestamp: 80,
    duration: 35,
    code: [{ code: 'len(["a","b","c"]) # 3', comment: null }],
  },
  {
    id: "py-range",
    name: "range()",
    description: "Generate a sequence of numbers.",
    timestamp: 115,
    duration: 40,
    code: [
      { code: "range(5)   # 0,1,2,3,4", comment: null },
      { code: "range(2,8,2) # 2,4,6", comment: null },
    ],
  },
  {
    id: "py-enumerate",
    name: "enumerate()",
    description: "Add index to iterable.",
    timestamp: 155,
    duration: 45,
    code: [
      { code: "for i, v in enumerate(['a','b']):", comment: null },
      { code: "    print(i, v) # 0 a / 1 b", comment: null },
    ],
  },
  {
    id: "py-zip",
    name: "zip()",
    description: "Pair elements from iterables.",
    timestamp: 200,
    duration: 38,
    code: [
      { code: "zip([1,2], ['a','b'])", comment: null },
      { code: "# (1,'a'), (2,'b')", comment: null },
    ],
  },
  {
    id: "py-map-filter",
    name: "map() / filter()",
    description: "Transform and select from iterables.",
    timestamp: 238,
    duration: 50,
    code: [
      { code: "list(map(int, ['1','2'])) # [1,2]", comment: null },
      { code: "list(filter(lambda x: x>0, lst))", comment: null },
    ],
  },
  {
    id: "py-sorted",
    name: "sorted()",
    description: "Return new sorted list.",
    timestamp: 288,
    duration: 40,
    code: [
      { code: "sorted([3,1,2]) # [1,2,3]", comment: null },
      { code: "sorted(lst, key=len)", comment: null },
    ],
  },
  {
    id: "py-isinstance",
    name: "isinstance()",
    description: "Check type of object.",
    timestamp: 328,
    duration: 42,
    code: [
      { code: "isinstance(5, int)        # True", comment: null },
      { code: "isinstance(5, (int,float)) # True", comment: null },
    ],
  },
];

// ─── SYNTAX HIGHLIGHT ────────────────────────────────────────────────────────
function highlight(code) {
  // Order matters — most specific first
  return code
    .replace(/(#.*$)/gm, '<span class="c">$1</span>')
    .replace(/\b(for|in|lambda|if)\b/g, '<span class="kw">$1</span>')
    .replace(
      /\b(print|input|len|range|enumerate|zip|map|filter|sorted|isinstance|list|int|float)\b/g,
      '<span class="fn">$1</span>'
    )
    .replace(/"([^"]*)"/g, '<span class="str">"$1"</span>')
    .replace(/'([^']*)'/g, "<span class=\"str\">'$1'</span>")
    .replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
}

// ─── YOUTUBE HOOK ─────────────────────────────────────────────────────────────
function useYouTubePlayer(containerId) {
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function initPlayer() {
      playerRef.current = new window.YT.Player(containerId, {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          color: "white",
        },
        events: {
          onReady: () => setReady(true),
        },
      });
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [containerId]);

  const seekTo = useCallback(
    (seconds) => {
      if (ready && playerRef.current) {
        playerRef.current.seekTo(seconds, true);
        playerRef.current.playVideo();
      }
    },
    [ready]
  );

  const getCurrentTime = useCallback(() => {
    if (ready && playerRef.current) {
      return playerRef.current.getCurrentTime();
    }
    return 0;
  }, [ready]);

  return { seekTo, getCurrentTime, ready };
}

// ─── CODE BLOCK ──────────────────────────────────────────────────────────────
function CodeBlock({ lines }) {
  return (
    <div className="code-block">
      <div className="code-bar" />
      <pre>
        {lines.map((l, i) => (
          <div
            key={i}
            dangerouslySetInnerHTML={{ __html: highlight(l.code) }}
          />
        ))}
      </pre>
    </div>
  );
}

// ─── ENTRY ROW ───────────────────────────────────────────────────────────────
function EntryRow({ entry, isActive, isPlaying, onClick, entryRef }) {
  return (
    <div
      ref={entryRef}
      className={`entry-row ${isActive ? "active" : ""} ${isPlaying ? "playing" : ""}`}
      onClick={() => onClick(entry)}
    >
      <div className="entry-header">
        <div className="entry-left">
          <span className="fn-name">{entry.name}</span>
          <span className="fn-desc">{entry.description}</span>
        </div>
        <button className={`play-btn ${isPlaying ? "is-playing" : ""}`}>
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="2" width="3.5" height="10" rx="1" />
              <rect x="8.5" y="2" width="3.5" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 2l9 5-9 5V2z" />
            </svg>
          )}
        </button>
      </div>
      {isActive && (
        <div className="entry-code">
          <CodeBlock lines={entry.code} />
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function VideoProgress({ entries, currentTime, onSeek }) {
  const total = entries[entries.length - 1].timestamp + entries[entries.length - 1].duration;

  return (
    <div className="chapter-progress">
      {entries.map((entry, i) => {
        const start = entry.timestamp / total;
        const width = entry.duration / total;
        const isActive = currentTime >= entry.timestamp &&
          currentTime < entry.timestamp + entry.duration;
        const isDone = currentTime >= entry.timestamp + entry.duration;

        return (
          <div
            key={entry.id}
            className={`chapter-segment ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            style={{ left: `${start * 100}%`, width: `${width * 100}%` }}
            onClick={() => onSeek(entry.timestamp)}
            title={entry.name}
          />
        );
      })}
      <div
        className="progress-cursor"
        style={{ left: `${(currentTime / total) * 100}%` }}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CheatSheet() {
  const [activeId, setActiveId] = useState(entries[0].id);
  const [playingId, setPlayingId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const { seekTo, getCurrentTime, ready } = useYouTubePlayer("yt-player");
  const entryRefs = useRef({});
  const tickRef = useRef(null);

  // Poll current time to sync highlight
  useEffect(() => {
    if (!ready) return;
    tickRef.current = setInterval(() => {
      const t = getCurrentTime();
      setCurrentTime(t);
      const playing = entries.find(
        (e) => t >= e.timestamp && t < e.timestamp + e.duration
      );
      if (playing) {
        setPlayingId(playing.id);
        setActiveId(playing.id);
      }
    }, 500);
    return () => clearInterval(tickRef.current);
  }, [ready, getCurrentTime]);

  const handleEntryClick = useCallback(
    (entry) => {
      setActiveId(entry.id);
      seekTo(entry.timestamp);
    },
    [seekTo]
  );

  const handleWatchFull = useCallback(() => {
    seekTo(0);
    setActiveId(entries[0].id);
  }, [seekTo]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0f1117;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          height: 100vh;
          overflow: hidden;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr 420px;
          height: 100vh;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          overflow-y: auto;
          border-right: 1px solid #1e2535;
          scrollbar-width: thin;
          scrollbar-color: #2a3450 transparent;
        }
        .left-panel::-webkit-scrollbar { width: 4px; }
        .left-panel::-webkit-scrollbar-track { background: transparent; }
        .left-panel::-webkit-scrollbar-thumb { background: #2a3450; border-radius: 2px; }

        .section-header {
          background: #f5c518;
          padding: 14px 24px;
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .section-title {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.12em;
          color: #0f1117;
          text-transform: uppercase;
        }
        .watch-full-btn {
          background: #0f1117;
          color: #f5c518;
          border: none;
          padding: 6px 14px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.15s;
        }
        .watch-full-btn:hover { opacity: 0.8; }
        .watch-full-btn svg { flex-shrink: 0; }

        /* ── ENTRY ROWS ── */
        .entry-row {
          border-bottom: 1px solid #1a2035;
          cursor: pointer;
          transition: background 0.12s;
          position: relative;
        }
        .entry-row:hover { background: #141929; }
        .entry-row.active { background: #141929; }
        .entry-row.playing::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #f5c518;
          border-radius: 0 2px 2px 0;
        }

        .entry-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          gap: 16px;
        }
        .entry-left {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .fn-name {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          font-size: 15px;
          color: #4dd9c0;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .fn-desc {
          font-size: 14px;
          color: #8892a4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .play-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid #2a3450;
          background: transparent;
          color: #4a5568;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .entry-row:hover .play-btn {
          border-color: #4dd9c0;
          color: #4dd9c0;
          background: rgba(77,217,192,0.08);
        }
        .play-btn.is-playing {
          border-color: #f5c518;
          color: #f5c518;
          background: rgba(245,197,24,0.1);
        }

        /* ── CODE BLOCK ── */
        .entry-code {
          padding: 0 24px 16px;
          animation: slideDown 0.18s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .code-block {
          display: flex;
          gap: 0;
          border-radius: 6px;
          overflow: hidden;
          background: #0a0d14;
          border: 1px solid #1e2535;
        }
        .code-bar {
          width: 3px;
          background: #4dd9c0;
          flex-shrink: 0;
        }
        pre {
          padding: 12px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.7;
          overflow-x: auto;
          flex: 1;
        }
        .fn  { color: #4dd9c0; }
        .kw  { color: #c792ea; }
        .str { color: #f5c518; }
        .num { color: #f78c6c; }
        .c   { color: #546e7a; font-style: italic; }

        /* ── RIGHT PANEL ── */
        .right-panel {
          display: flex;
          flex-direction: column;
          background: #0a0d14;
          overflow: hidden;
        }

        .video-header {
          padding: 16px 20px 12px;
          border-bottom: 1px solid #1e2535;
          flex-shrink: 0;
        }
        .video-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: #4a5568;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .video-current-name {
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
          font-family: 'JetBrains Mono', monospace;
          color: #4dd9c0;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          flex-shrink: 0;
          background: #000;
        }
        .video-wrapper iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .video-not-ready {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #4a5568;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        /* ── CHAPTER PROGRESS ── */
        .chapter-area {
          padding: 16px 20px;
          flex-shrink: 0;
          border-bottom: 1px solid #1e2535;
        }
        .chapter-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: #4a5568;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .chapter-progress {
          position: relative;
          height: 6px;
          background: #1a2035;
          border-radius: 3px;
          overflow: visible;
          cursor: pointer;
        }
        .chapter-segment {
          position: absolute;
          height: 100%;
          background: #1e2a42;
          border-right: 1px solid #0a0d14;
          transition: background 0.2s;
          cursor: pointer;
        }
        .chapter-segment:hover { background: #2a3a55; }
        .chapter-segment.done { background: #2a4a3a; }
        .chapter-segment.active { background: #f5c518; }
        .progress-cursor {
          position: absolute;
          top: -3px;
          width: 2px;
          height: 12px;
          background: #fff;
          border-radius: 1px;
          transform: translateX(-50%);
          pointer-events: none;
          box-shadow: 0 0 6px rgba(255,255,255,0.4);
        }

        /* ── CHAPTER LIST ── */
        .chapter-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
          scrollbar-width: thin;
          scrollbar-color: #2a3450 transparent;
        }
        .chapter-list::-webkit-scrollbar { width: 4px; }
        .chapter-list::-webkit-scrollbar-thumb { background: #2a3450; border-radius: 2px; }

        .chapter-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          cursor: pointer;
          transition: background 0.12s;
          border-radius: 0;
        }
        .chapter-item:hover { background: #141929; }
        .chapter-item.active { background: #141929; }
        .chapter-item.playing .chapter-dot { background: #f5c518; box-shadow: 0 0 8px rgba(245,197,24,0.4); }
        .chapter-item.active .chapter-name { color: #e2e8f0; }

        .chapter-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2a3450;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .chapter-item:hover .chapter-dot { background: #4dd9c0; }

        .chapter-ts {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #4a5568;
          flex-shrink: 0;
          width: 36px;
        }
        .chapter-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #6b7a99;
          flex: 1;
        }
        .chapter-item.playing .chapter-name { color: #f5c518; }
      `}</style>

      <div className="layout">
        {/* ── LEFT: CHEAT SHEET ── */}
        <div className="left-panel">
          <div className="section-header">
            <span className="section-title">Core Syntax &amp; Built-ins</span>
            <button className="watch-full-btn" onClick={handleWatchFull}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M2 1.5l6 3.5-6 3.5V1.5z" />
              </svg>
              Watch Full Video
            </button>
          </div>

          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              isActive={activeId === entry.id}
              isPlaying={playingId === entry.id}
              onClick={handleEntryClick}
              entryRef={(el) => (entryRefs.current[entry.id] = el)}
            />
          ))}
        </div>

        {/* ── RIGHT: VIDEO PANEL ── */}
        <div className="right-panel">
          <div className="video-header">
            <div className="video-label">Now Playing</div>
            <div className="video-current-name">
              {(playingId || activeId)
                ? entries.find((e) => e.id === (playingId || activeId))?.name
                : "Select a topic"}
            </div>
          </div>

          <div className="video-wrapper">
            <div id="yt-player" />
            {!ready && (
              <div className="video-not-ready">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="#2a3450" strokeWidth="2" />
                  <path d="M13 11l9 5-9 5V11z" fill="#2a3450" />
                </svg>
                Loading player...
              </div>
            )}
          </div>

          <div className="chapter-area">
            <div className="chapter-label">Chapters</div>
            <VideoProgress
              entries={entries}
              currentTime={currentTime}
              onSeek={seekTo}
            />
          </div>

          <div className="chapter-list">
            {entries.map((entry) => {
              const mins = Math.floor(entry.timestamp / 60);
              const secs = String(entry.timestamp % 60).padStart(2, "0");
              return (
                <div
                  key={entry.id}
                  className={`chapter-item ${activeId === entry.id ? "active" : ""} ${playingId === entry.id ? "playing" : ""}`}
                  onClick={() => handleEntryClick(entry)}
                >
                  <div className="chapter-dot" />
                  <span className="chapter-ts">{mins}:{secs}</span>
                  <span className="chapter-name">{entry.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
