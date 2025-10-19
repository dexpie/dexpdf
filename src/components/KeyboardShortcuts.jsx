import { useState, useEffect } from 'react'
import './KeyboardShortcuts.css'

export default function KeyboardShortcuts({ isOpen, onClose }) {
  const [platform, setPlatform] = useState('mac')

  useEffect(() => {
    // Detect platform
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    setPlatform(isMac ? 'mac' : 'windows')
  }, [])

  const modifier = platform === 'mac' ? '⌘' : 'Ctrl'

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { key: '/', description: 'Focus search', icon: '🔍' },
        { key: `${modifier} + K`, description: 'Open command palette', icon: '⚡' },
        { key: '?', description: 'Show keyboard shortcuts', icon: '⌨️' },
        { key: 'Esc', description: 'Close tool or dialog', icon: '✕' },
      ]
    },
    {
      category: 'File Operations',
      items: [
        { key: `${modifier} + O`, description: 'Open file', icon: '📂' },
        { key: `${modifier} + S`, description: 'Download result', icon: '💾' },
        { key: `${modifier} + Z`, description: 'Undo (coming soon)', icon: '↶', disabled: true },
        { key: `${modifier} + Y`, description: 'Redo (coming soon)', icon: '↷', disabled: true },
      ]
    },
    {
      category: 'Tools',
      items: [
        { key: 'M', description: 'Merge PDFs', icon: '🔗' },
        { key: 'S', description: 'Split PDF', icon: '✂️' },
        { key: 'C', description: 'Compress PDF', icon: '🗜️' },
        { key: 'W', description: 'Add Watermark', icon: '🏷️' },
      ]
    },
    {
      category: 'View',
      items: [
        { key: `${modifier} + D`, description: 'Toggle dark mode', icon: '🌙' },
        { key: `${modifier} + +`, description: 'Zoom in (coming soon)', icon: '🔍', disabled: true },
        { key: `${modifier} + -`, description: 'Zoom out (coming soon)', icon: '🔍', disabled: true },
      ]
    }
  ]

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-panel" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <div>
            <h2 className="shortcuts-title">⌨️ Keyboard Shortcuts</h2>
            <p className="shortcuts-subtitle">Boost your productivity with these shortcuts</p>
          </div>
          <button className="shortcuts-close" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="shortcuts-body">
          {shortcuts.map((section, idx) => (
            <div key={idx} className="shortcuts-section">
              <h3 className="shortcuts-section-title">{section.category}</h3>
              <div className="shortcuts-list">
                {section.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className={`shortcuts-item ${item.disabled ? 'disabled' : ''}`}
                  >
                    <div className="shortcuts-item-left">
                      <span className="shortcuts-icon">{item.icon}</span>
                      <span className="shortcuts-description">{item.description}</span>
                      {item.disabled && (
                        <span className="shortcuts-badge">Soon</span>
                      )}
                    </div>
                    <kbd className="shortcuts-kbd">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <div className="shortcuts-tip">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Press <kbd>?</kbd> anytime to toggle this panel</span>
          </div>
          <div className="shortcuts-platform">
            Platform: {platform === 'mac' ? 'macOS' : 'Windows'}
          </div>
        </div>
      </div>
    </div>
  )
}
