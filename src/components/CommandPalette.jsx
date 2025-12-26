import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import './CommandPalette.css'

export default function CommandPalette({ tools, onSelect, onClose, isOpen }) {
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState(0)
    const inputRef = useRef(null)
    const listRef = useRef(null)
    const router = useRouter()

    // Filter tools based on query
    const filtered = tools.filter(t => {
        const q = query.toLowerCase().trim()
        if (!q) return true
        const inName = t.name?.toLowerCase().includes(q)
        const inDesc = t.desc?.toLowerCase().includes(q)
        const inTags = Array.isArray(t.tags) && t.tags.join(' ').toLowerCase().includes(q)
        return inName || inDesc || inTags
    })

    // Recent tools from localStorage
    const [recentTools, setRecentTools] = useState([])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = JSON.parse(localStorage.getItem('recent-tools') || '[]')
            setRecentTools(saved)
        }
    }, [isOpen]) // Refresh when opened

    const recentFiltered = tools.filter(t => recentTools.includes(t.id))

    const displayList = query.trim() ? filtered : [...recentFiltered, ...filtered]
    const uniqueList = Array.from(new Map(displayList.map(t => [t.id, t])).values()).slice(0, 8)

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
            setQuery('')
            setSelected(0)
        }
    }, [isOpen])

    useEffect(() => {
        setSelected(0)
    }, [query])

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelected(prev => Math.min(prev + 1, uniqueList.length - 1))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelected(prev => Math.max(prev - 1, 0))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (uniqueList[selected]) {
                    handleSelect(uniqueList[selected])
                }
            } else if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, selected, uniqueList])

    // Auto-scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedEl = listRef.current.children[selected]
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
        }
    }, [selected])

    const handleSelect = (tool) => {
        // Save to recent
        const recent = JSON.parse(localStorage.getItem('recent-tools') || '[]')
        const newRecent = [tool.id, ...recent.filter(id => id !== tool.id)].slice(0, 5)
        localStorage.setItem('recent-tools', JSON.stringify(newRecent))

        router.push(`/${tool.id}`)
        if (onSelect) onSelect(tool)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="command-palette-overlay" onClick={onClose}>
            <div className="command-palette" onClick={e => e.stopPropagation()}>
                <div className="command-palette-header">
                    <svg className="command-palette-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-palette-input"
                        placeholder="Search tools... (try 'merge', 'compress', 'split')"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <kbd className="command-palette-kbd">ESC</kbd>
                </div>

                <div className="command-palette-body" ref={listRef}>
                    {uniqueList.length === 0 ? (
                        <div className="command-palette-empty">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                                <path d="M24 14v12M24 32h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                            </svg>
                            <p>No tools found for "{query}"</p>
                            <p className="command-palette-hint">Try searching for merge, split, compress, or convert</p>
                        </div>
                    ) : (
                        <>
                            {!query.trim() && recentFiltered.length > 0 && (
                                <div className="command-palette-section">Recent</div>
                            )}
                            {uniqueList.map((tool, idx) => {
                                const isRecent = recentTools.includes(tool.id)
                                const colors = {
                                    merge: '#DC2626',
                                    split: '#2563EB',
                                    compress: '#059669',
                                    'pdf-to-word': '#7C3AED',
                                    'pdf-to-text': '#EA580C',
                                    'images-to-pdf': '#DB2777',
                                    watermark: '#0891B2',
                                    'extract-images': '#CA8A04',
                                    'ppt-to-pdf': '#DC2626',
                                    'pdf-info': '#4F46E5',
                                    reorder: '#16A34A'
                                }
                                const bgColor = colors[tool.id] || '#6B7280'

                                return (
                                    <div
                                        key={tool.id}
                                        className={`command-palette-item ${selected === idx ? 'selected' : ''}`}
                                        onClick={() => handleSelect(tool)}
                                        onMouseEnter={() => setSelected(idx)}
                                    >
                                        <div className="command-palette-item-icon" style={{ background: bgColor }}>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <rect x="5" y="3" width="10" height="14" rx="1" stroke="white" strokeWidth="1.5" />
                                                <path d="M7 7h6M7 10h6M7 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <div className="command-palette-item-content">
                                            <div className="command-palette-item-name">
                                                {tool.name}
                                                {isRecent && <span className="command-palette-badge">Recent</span>}
                                            </div>
                                            <div className="command-palette-item-desc">{tool.desc}</div>
                                        </div>
                                        {selected === idx && (
                                            <kbd className="command-palette-kbd-enter">↵</kbd>
                                        )}
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>

                <div className="command-palette-footer">
                    <div className="command-palette-shortcuts">
                        <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                        <span><kbd>↵</kbd> Select</span>
                        <span><kbd>ESC</kbd> Close</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
