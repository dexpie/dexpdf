import React from 'react'

export default function Stats() {
  const stats = [
    process.env.NEXT_PUBLIC_FILES_PROCESSED && { value: process.env.NEXT_PUBLIC_FILES_PROCESSED, label: 'Files Processed' },
    process.env.NEXT_PUBLIC_ACTIVE_USERS && { value: process.env.NEXT_PUBLIC_ACTIVE_USERS, label: 'Active Users' },
    { value: '50+', label: 'Tools available' },
    { value: '50 MB', label: 'Max file size' },
  ].filter(Boolean)

  return (
    <section className="stats-section">
      <div className="stats-container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        {stats.length === 2 && <p className="mt-3 text-center text-xs text-muted-foreground">Usage figures are provided by configured analytics.</p>}
      </div>
    </section>
  )
}
