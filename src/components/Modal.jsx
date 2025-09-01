import React from 'react'

export default function Modal({ open, onClose, title, subtitle, children }){
  if(!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="subtitle">{subtitle}</div>}
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">
          {subtitle && (
            <div className="tool-help">
              <div style={{fontWeight:600}}>Quick help</div>
              <div className="muted" style={{marginTop:6}}>{subtitle}</div>
              <div className="muted" style={{marginTop:8,fontSize:12}}>
                Privacy: files are processed locally in your browser where possible. For large or high-fidelity conversions server-side processing may be required.
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
