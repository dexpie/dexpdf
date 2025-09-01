import React from 'react'

export default function ToolCard({ title, desc, onOpen }){
  return (
    <div className="tool-card">
      <div className="tool-card-icon">📄</div>
      <div className="tool-card-body">
        <div className="tool-card-title">{title}</div>
        <div className="tool-card-desc">{desc}</div>
      </div>
      <div className="tool-card-actions">
        <button className="btn" onClick={onOpen}>Open</button>
      </div>
    </div>
  )
}
