import { useState, useEffect, useMemo, useRef } from 'react'
import './styles.css'
import './tools.js'
import ToolContainer from './components/tools/ToolContainer'
import AdSpot from './components/AdSpot'
import RecentFiles from './components/RecentFiles'
import ProgressBar from './components/ProgressBar'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'
import Features from './components/Features'
import FAQ from './components/FAQ'
import { pushRecent } from './utils/storage'
import ConsentBanner from './components/ConsentBanner'
import { getAdConsent } from './utils/consent'
import CommandPalette from './components/CommandPalette'
import KeyboardShortcuts from './components/KeyboardShortcuts'

function App() {
  const [tools, setTools] = useState([])
  const [activeTool, setActiveTool] = useState(null)
  const [query, setQuery] = useState('')
  const [adConsent, setAdConsent] = useState(() => getAdConsent())
  const searchRef = useRef(null)
  const [showHotkeyHint, setShowHotkeyHint] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  // Handle tool opening
  useEffect(() => {
    const handleToolOpen = (e) => {
      setActiveTool(e.detail)
      // Save to recent list (try to find tool metadata)
      try {
        const id = e.detail
        const t = tools.find(x => x.id === id) || { id }
        pushRecent({ id: t.id, name: t.name })
      } catch (err) {
        // ignore
      }
    }
    window.addEventListener('open-tool', handleToolOpen)
    return () => window.removeEventListener('open-tool', handleToolOpen)
  }, [tools])

  // First useEffect is enough for tool opening handler

  useEffect(() => {
    // Fetch tools when component mounts
    fetch('/tools.json')
      .then(res => res.json())
      .then(data => setTools(data))
      .catch(err => console.error('Error loading tools:', err))
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      // '/' - Focus search (when not in input)
      if (e.key === '/' && !(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA'))) {
        e.preventDefault()
        if (searchRef.current) searchRef.current.focus()
        setShowHotkeyHint(true)
        setTimeout(() => setShowHotkeyHint(false), 1200)
      }

      // Cmd+K / Ctrl+K - Open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }

      // '?' - Show Keyboard Shortcuts
      if (e.key === '?' && !(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA'))) {
        e.preventDefault()
        setShowKeyboardShortcuts(prev => !prev)
      }

      // Cmd+D / Ctrl+D - Toggle dark mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        const themeToggle = document.querySelector('.theme-toggle')
        if (themeToggle) themeToggle.click()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tools
    return tools.filter(t => {
      const inName = t.name && t.name.toLowerCase().includes(q)
      const inDesc = t.desc && t.desc.toLowerCase().includes(q)
      const inTags = Array.isArray(t.tags) && t.tags.join(' ').toLowerCase().includes(q)
      return inName || inDesc || inTags
    })
  }, [tools, query])

  return (
    <div className="app">
      <ProgressBar />
      <NavBar />

      {/* Command Palette */}
      <CommandPalette
        tools={tools}
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelect={(toolId) => {
          setShowCommandPalette(false)
          window.dispatchEvent(new CustomEvent('open-tool', { detail: toolId }))
        }}
      />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {activeTool ? (
        <ToolContainer
          toolId={activeTool}
          onClose={() => {
            setActiveTool(null)
            window.history.pushState({}, '', '/')
          }}
        />
      ) : (
        <>
          {/* Hero Header */}
          <header className="hero-header">
            {/* Background Video */}
            <video
              className="hero-background-video"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/assets/city-pop-gradient.mp4" type="video/mp4" />
            </video>

            <div className="hero-container">
              <div className="hero-nav">
                <div className="hero-logo">
                  <svg width="140" height="48" viewBox="0 0 140 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="36" fill="white" fontFamily="system-ui,-apple-system,sans-serif" fontSize="32" fontWeight="bold">DexPDF</text>
                  </svg>
                </div>
                <div className="hero-actions">
                  <ThemeToggle />
                  <a href="https://github.com/dexpie/dexpdf" target="_blank" rel="noopener noreferrer" className="hero-link">GitHub</a>
                </div>
              </div>

              <div className="hero-content">
                <h1 className="hero-title">Complete PDF Toolkit for Modern Productivity</h1>
                <p className="hero-subtitle">DexPDF brings powerful PDF tools directly to your browser. Fast, secure, and completely free merge, split, compress, convert, and edit PDFs without uploading files to any server. Privacy-first processing.</p>

                <div className="hero-search">
                  <div className="search-wrapper">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      aria-label="Search PDF tools"
                      className="hero-search-input"
                      placeholder="Search PDF tools..."
                      ref={searchRef}
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Escape') setQuery('')
                      }}
                    />
                    {query && (
                      <button
                        className="search-clear"
                        onClick={() => setQuery('')}
                        aria-label="Clear search"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {showHotkeyHint && (
                    <div className="hotkey-hint">Press / to search</div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="main-content">
            <div className="tools-container">
              {/* Recent Files Section */}
              <div className="recent-section">
                <RecentFiles onOpen={(item) => {
                  window.dispatchEvent(new CustomEvent('open-tool', { detail: item.id }))
                }} />
              </div>

              {/* Ads Section */}
              {adConsent === true && (
                <div className="ads-section">
                  <div className="ads-label">Sponsored</div>
                  <AdSpot image="/assets/bippy.jpg" href="https://dexpdf.vercel.app" alt="Sponsor" />
                </div>
              )}

              <ConsentBanner onChange={(v) => setAdConsent(v)} />

              {query && filtered.length > 0 && (
                <div className="tools-section-title">
                  <h2>Search Results ({filtered.length})</h2>
                </div>
              )}

              <div className="tools-grid">
                {filtered.length === 0 ? (
                  <div className="no-results-card">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="30" stroke="#e5e7eb" strokeWidth="2" />
                      <path d="M32 20v16M32 44h.01" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <h3>No tools found</h3>
                    <p>No tools match "{query}". Try a different search term.</p>
                  </div>
                ) : (
                  filtered.map((tool) => {
                    // Color mapping based on tool.color from tools.json
                    const colorMap = {
                      red: '#DC2626',
                      blue: '#2563EB',
                      green: '#16A34A',
                      gray: '#6B7280',
                      purple: '#7C3AED',
                      orange: '#EA580C',
                      pink: '#DB2777',
                      teal: '#0891B2',
                      indigo: '#4F46E5',
                      yellow: '#CA8A04'
                    }
                    const bgColor = colorMap[tool.color] || colorMap.gray

                    return (
                      <a
                        key={tool.id}
                        href={`/?tool=${tool.id}`}
                        className="tool-card"
                        style={{ '--tool-color': bgColor }}
                        onClick={(e) => {
                          e.preventDefault()
                          window.dispatchEvent(new CustomEvent('open-tool', { detail: tool.id }))
                        }}
                      >
                        <div className="tool-icon" style={{ background: bgColor }}>
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="8" y="4" width="16" height="24" rx="2" stroke="white" strokeWidth="2" />
                            <path d="M12 12h8M12 16h8M12 20h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3 className="tool-name">{tool.name}</h3>
                        <p className="tool-desc">{tool.desc}</p>
                      </a>
                    )
                  })
                )}
              </div>
            </div>

            {/* Features Section */}
            <Features />

            {/* FAQ Section */}
            <FAQ />
          </main>
        </>
      )}
      <Footer />
    </div>
  )
}

export default App
