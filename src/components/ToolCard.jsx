import React from 'react'

const ToolCard = ({ title, desc, onOpen }) => {
  return (
    <article className="landing-card">
      <div className="landing-card-title">{title?.toUpperCase()}</div>
      <p className="landing-card-desc">{desc}</p>
      <button className="landing-card-btn" onClick={onOpen} aria-label={`Open ${title} tool`}>
        Use Tool
      </button>
    </article>
  )
}

export default ToolCard
