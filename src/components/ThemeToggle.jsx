import React, { useEffect, useState } from 'react'

const THEME_KEY = 'dexpdf:theme'

export default function ThemeToggle({ className }) {
  const [theme, setTheme] = useState(() => {
    try {
      const v = localStorage.getItem(THEME_KEY)
      return v || 'light'
    } catch (e) {
      return 'light'
    }
  })

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme) } catch (e) { }
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  return (
    <button
      aria-label="Toggle theme"
      className={`theme-toggle ${className || ''}`}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent' }}
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
