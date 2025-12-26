import { useState, useEffect, useMemo, useRef } from 'react'
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './styles.css'
import './tools.js'
import ToolContainer from './components/tools/ToolContainer'
import AdSpot from './components/AdSpot'
import RecentFiles from './components/RecentFiles'
import ProgressBar from './components/ProgressBar'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import Features from './components/Features'
import FAQ from './components/FAQ'
import { pushRecent } from './utils/storage'
import ConsentBanner from './components/ConsentBanner'
import { getAdConsent } from './utils/consent'
import CommandPalette from './components/CommandPalette'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import SEOWrapper from './components/SEOWrapper'
import Analytics from './components/Analytics'

function ToolPage({ tools }) {
  const { toolId } = useParams()
  const navigate = useNavigate()
  const tool = tools.find(x => x.id === toolId)

  useEffect(() => {
    if (tool) {
      pushRecent({ id: tool.id, name: tool.name })
    }
  }, [tool])

  if (!tool && tools.length > 0) {
    useEffect(() => navigate('/', { replace: true }), [navigate])
    return null
  }

  if (!tool) return null

  return (
    <SEOWrapper title={tool.name} description={tool.desc}>
      <ToolContainer
        toolId={toolId}
        onClose={() => navigate('/')}
      />
    </SEOWrapper>
  )
}

function HomePage({ tools, query, setQuery, showHotkeyHint, searchRef, adConsent, setAdConsent }) {
  const { t } = useTranslation()

  // Define Groups
  const GROUPS = {
    'optimize': {
      title: t('category.optimize', 'Optimize PDF'),
      ids: ['merge', 'split', 'compress', 'organize', 'pdf-info']
    },
    'convert_to': {
      title: t('category.convert_to', 'Convert to PDF'),
      ids: ['imgs2pdf', 'word2pdf', 'ppt2pdf', 'csv2pdf']
    },
    'convert_from': {
      title: t('category.convert_from', 'Convert from PDF'),
      ids: ['pdf2imgs', 'pdf2word', 'pdf2ppt', 'pdf2text', 'extract-images']
    },
    'edit_security': {
      title: t('category.edit', 'Edit & Security'),
      ids: ['edit', 'signature', 'watermark', 'ocr', 'protect', 'unlock', 'annotate', 'pagenums']
    }
  }

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

  // Helper to get tools for a group
  const getGroupTools = (groupIds) => {
    return tools.filter(t => groupIds.includes(t.id))
  }

  return (
    <SEOWrapper title="Home" description={t('app.description')}>
      <header className="hero-header">
        <video className="hero-background-video" autoPlay loop muted playsInline>
          <source src="/assets/city-pop-gradient.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>

        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">{t('hero.title')}</h1>
            <p className="hero-subtitle">{t('hero.subtitle')}</p>

            <div className="hero-search">
              <div className="search-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  aria-label="Search PDF tools"
                  className="hero-search-input"
                  placeholder={t('hero.search_placeholder')}
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') setQuery('') }}
                />
                {query && (
                  <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
              {showHotkeyHint && <div className="hotkey-hint">{t('hero.hotkey_hint')}</div>}
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="tools-container">
          <div className="recent-section">
            <RecentFiles />
          </div>

          {adConsent === true && (
            <div className="ads-section">
              <div className="ads-label">{t('ads.sponsored')}</div>
              <AdSpot image="/assets/bippy.jpg" href="https://dexpdf.vercel.app" alt="Sponsor" />
            </div>
          )}

          <ConsentBanner onChange={(v) => setAdConsent(v)} />

          {/* If searching, show flat list. If not, show categories */}
          {query ? (
            <div className="search-results">
              <div className="tools-section-title">
                <h2>{t('search.results_title', { count: filtered.length })}</h2>
              </div>
              {filtered.length === 0 ? (
                <div className="no-results-card">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="30" stroke="#e5e7eb" strokeWidth="2" />
                    <path d="M32 20v16M32 44h.01" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <h3>{t('search.no_results_title')}</h3>
                  <p>{t('search.no_results_desc', { query })}</p>
                </div>
              ) : (
                <div className="tools-grid">
                  {filtered.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="categories-layout">
              {Object.entries(GROUPS).map(([key, group]) => {
                const groupTools = getGroupTools(group.ids)
                if (groupTools.length === 0) return null
                return (
                  <section key={key} className="category-section">
                    <h2 className="category-title">{group.title}</h2>
                    <div className="tools-grid">
                      {groupTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </div>

        <Features />
        <FAQ />
      </main>
    </SEOWrapper>
  )
}

// Reusable Tool Card Component
function ToolCard({ tool }) {
  const colorMap = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e',
    gray: '#6b7280', purple: '#8b5cf6', orange: '#f97316',
    pink: '#ec4899', teal: '#14b8a6', indigo: '#6366f1', yellow: '#eab308'
  }
  const bgColor = colorMap[tool.color] || colorMap.gray

  return (
    <Link to={`/${tool.id}`} className="tool-card group" style={{ '--tool-color': bgColor }}>
      <div className="tool-icon" style={{ background: bgColor }}>
        <svg className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 className="tool-name">{tool.name}</h3>
      <p className="tool-desc">{tool.desc}</p>
      <div className="tool-arrow">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
        </svg>
      </div>
    </Link>
  )
}

function App() {
  const [tools, setTools] = useState([])
  const [query, setQuery] = useState('')
  const [adConsent, setAdConsent] = useState(() => getAdConsent())
  const searchRef = useRef(null)
  const [showHotkeyHint, setShowHotkeyHint] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  useEffect(() => {
    fetch('/tools.json')
      .then(res => res.json())
      .then(data => setTools(data))
      .catch(err => console.error('Error loading tools:', err))
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === '/' && !(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA'))) {
        e.preventDefault()
        if (searchRef.current) searchRef.current.focus()
        setShowHotkeyHint(true)
        setTimeout(() => setShowHotkeyHint(false), 1200)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if (e.key === '?' && !(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA'))) {
        e.preventDefault()
        setShowKeyboardShortcuts(prev => !prev)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        const themeToggle = document.querySelector('.theme-toggle')
        if (themeToggle) themeToggle.click()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="app">
      <Analytics />
      <ProgressBar />
      <NavBar />

      <CommandPalette
        tools={tools}
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelect={() => setShowCommandPalette(false)}
      />

      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      <Routes>
        <Route path="/" element={
          <HomePage
            tools={tools}
            query={query}
            setQuery={setQuery}
            showHotkeyHint={showHotkeyHint}
            searchRef={searchRef}
            adConsent={adConsent}
            setAdConsent={setAdConsent}
          />
        } />
        <Route path="/:toolId" element={<ToolPage tools={tools} />} />
      </Routes>

      <Footer />
    </div>
  )
}

export default App
