import React from 'react'

const colorClasses = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-600',
  gray: 'bg-gray-600',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  teal: 'bg-teal-500',
  indigo: 'bg-indigo-500',
  yellow: 'bg-yellow-500'
}

const ToolCard = ({ title, desc, onOpen, color = 'gray' }) => {
  const colorClass = colorClasses[color] || colorClasses.gray
  
  return (
    <article className="landing-card">
      <div className={`landing-card-icon ${colorClass}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <div className="landing-card-title">{title?.toUpperCase()}</div>
      <p className="landing-card-desc">{desc}</p>
      <button className="landing-card-btn" onClick={onOpen} aria-label={`Open ${title} tool`}>
        Use Tool
      </button>
    </article>
  )
}

export default ToolCard

