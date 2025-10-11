import { useState, useEffect, useMemo } from 'react'
import './styles.css'
import './tools.js'
import ToolContainer from './components/tools/ToolContainer'
import AdSpot from './components/AdSpot'
import RecentFiles from './components/RecentFiles'
import { pushRecent } from './utils/storage'
import ConsentBanner from './components/ConsentBanner'
import { getAdConsent } from './utils/consent'

function App() {
  const [tools, setTools] = useState([])
  const [activeTool, setActiveTool] = useState(null)
  const [query, setQuery] = useState('')
  const [adConsent, setAdConsent] = useState(() => getAdConsent())

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
  }, [])

  // First useEffect is enough for tool opening handler

  useEffect(() => {
    // Fetch tools when component mounts
    fetch('/tools.json')
      .then(res => res.json())
      .then(data => setTools(data))
      .catch(err => console.error('Error loading tools:', err))
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
          <header className="landing-header">
            <div className="landing-inner">
              <div className="landing-left">
                <div className="logo-dexpdf">
                  <svg width="92" height="36" viewBox="0 0 92 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="82" height="36" rx="4" fill="#CF2727" />
                    <text x="12" y="26" fill="white" fontFamily="Arial" fontSize="24" fontWeight="bold">DEX</text>
                  </svg>
                </div>
              </div>
              <div className="landing-right">
                <span className="hello">HELLO</span>
                <div className="logo-dexers">
                  <svg width="120" height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="22" fill="#111" fontFamily="Arial" fontSize="22" fontWeight="bold">DEXERS</text>
                  </svg>
                </div>
              </div>
            </div>
          </header>

          <main className="landing-main">
            <div className="landing-search">
              <input
                aria-label="Search tools"
                className="landing-search-input"
                placeholder="Search tools by name, description or tag..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setQuery('')
                }}
              />
              {query && (
                <button
                  className="landing-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
            <RecentFiles onOpen={(item) => {
              // dispatch same open-tool event
              window.dispatchEvent(new CustomEvent('open-tool', { detail: item.id }))
            }} />
            <ConsentBanner onChange={(v) => setAdConsent(v)} />
            {adConsent === true && (
              <AdSpot image="/assets/bippy.jpg" href="https://dexpdf.vercel.app" alt="Sponsor" />
            )}
            <div className="landing-grid-inner">
              {filtered.length === 0 ? (
                <div className="no-results">No tools match "{query}"</div>
              ) : (
                filtered.map((tool) => {
                  return (
                    <a
                      key={tool.id}
                      href={`/?tool=${tool.id}`}
                      className="landing-card-link"
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('Tool clicked:', tool.id)
                        window.dispatchEvent(new CustomEvent('open-tool', { detail: tool.id }))
                      }}
                    >
                      <div className="landing-card">
                        <h2 className="landing-card-title">{tool.name}</h2>
                        <p className="landing-card-desc">{tool.desc}</p>
                        <button className="landing-card-btn">Open</button>
                      </div>
                    </a>
                  )
                })
              )}
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export default App
