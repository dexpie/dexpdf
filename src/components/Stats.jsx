import React from 'react'

// Stats component inspired by Vercel and Linear
export default function Stats() {
  const stats = [
    { value: '1M+', label: 'Files Processed' },
    { value: '50K+', label: 'Active Users' },
    { value: '20+', label: 'PDF Tools' },
    { value: '99.9%', label: 'Uptime' },
  ]

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
      </div>
    </section>
  )
}
