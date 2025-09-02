import React from 'react'

// ToolCard: title, desc, onOpen, icon, micro (optional short helper text)
export default function ToolCard({ title, desc, onOpen, icon, micro }){
  return (
    <div className="tool-card">
      <div className="tool-card-icon">{icon || '📄'}</div>
      <div className="tool-card-body">
        <div className="tool-card-title">{title}</div>
        <div className="tool-card-desc">{desc}</div>
        {/* subtle microcopy below the main description; can be overridden per-tool via `micro` prop */}
        <div className="tool-card-micro">{micro || 'Runs locally in your browser · No uploads · Fast'}</div>
      </div>
      <div className="tool-card-actions">
        <button className="btn" onClick={onOpen}>Open</button>
      </div>
    </div>
  )
}
