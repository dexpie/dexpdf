'use client'
import React from 'react'
import Link from 'next/link'

// Premium SVG Icons (Simulated with paths)
// iLovePDF style uses solid distinct colors per tool.
const ICONS = {
  merge: <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />,
  split: <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />,
  compress: <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />, // Placeholder compression
  default: <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
}

// iLovePDF Exact Brand Colors
const TOOL_COLORS = {
  merge: '#FD3E3E', // Red
  split: '#FD3E3E', // Red
  compress: '#1BCD77', // Green
  'pdf-to-word': '#3B82F6', // Blue
  'pdf-to-powerpoint': '#E64A19', // Orange
  'pdf-to-excel': '#20C373', // Green
  'word-to-pdf': '#3B82F6',
  'powerpoint-to-pdf': '#E64A19',
  'excel-to-pdf': '#20C373',
  edit: '#FFB300', // Yellow
  'pdf-to-jpg': '#FFB300',
  'jpg-to-pdf': '#FFB300',
  sign: '#E91E63', // Pink
  watermark: '#E91E63',
  protect: '#536D79', // Dark Gray
  unlock: '#536D79',
  organize: '#FD3E3E',
}

export default function ToolCard({ tool }) {
  // Map our tool IDs to iLovePDF style colors
  const getColor = (id) => {
    if (id.includes('word')) return TOOL_COLORS['pdf-to-word']
    if (id.includes('ppt')) return TOOL_COLORS['pdf-to-powerpoint']
    if (id.includes('excel') || id.includes('csv')) return TOOL_COLORS['pdf-to-excel']
    if (id.includes('pdf2imgs') || id.includes('imgs2pdf')) return TOOL_COLORS['pdf-to-jpg']
    if (id.includes('compress')) return TOOL_COLORS['compress']
    if (id.includes('protect') || id.includes('unlock')) return TOOL_COLORS['protect']
    if (id.includes('edit')) return TOOL_COLORS['edit']
    if (id.includes('signature')) return TOOL_COLORS['sign']
    return TOOL_COLORS.merge // Default Red
  }

  const bgColor = getColor(tool.id)

  return (
    <Link
      href={`/${tool.id}`}
      className="tool-card group"
      style={{ '--tool-color': bgColor, borderColor: 'transparent' }}
    >
      <div className="tool-icon-wrapper">
        {/* Simplified generic icon for now, usually would be specific SVG */}
        <div className="tool-icon" style={{ background: bgColor }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            {ICONS[tool.id] || ICONS.default}
          </svg>
        </div>
      </div>
      <h3 className="tool-name">{tool.name}</h3>
      <p className="tool-desc">{tool.desc}</p>

      {/* Decorative hover elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-current opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: bgColor }}></div>
    </Link>
  )
}
