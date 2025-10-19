import React from 'react'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--card)', padding: 18, marginTop: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', color: 'var(--muted)' }}>
        <small>© {new Date().getFullYear()} DEXPDF lightweight client-side PDF tools</small>
      </div>
    </footer>
  )
}
