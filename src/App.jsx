import React, { useState } from 'react'
import MergeTool from './tools/MergeTool'
import SplitTool from './tools/SplitTool'
import ImagesToPdfTool from './tools/ImagesToPdfTool'
import PdfToImagesTool from './tools/PdfToImagesTool'

const tools = [
  { id: 'merge', name: 'Merge PDF', comp: <MergeTool /> },
  { id: 'split', name: 'Split PDF', comp: <SplitTool /> },
  { id: 'imgs2pdf', name: 'Images → PDF', comp: <ImagesToPdfTool /> },
  { id: 'pdf2imgs', name: 'PDF → Images', comp: <PdfToImagesTool /> }
]

export default function App() {
  const [active, setActive] = useState('merge')

  return (
    <div className="app">
      <header className="header">
        <div className="brand">dexpdf</div>
        <nav className="nav">
          {tools.map(t => (
            <button
              key={t.id}
              className={t.id === active ? 'active' : ''}
              onClick={() => setActive(t.id)}
            >
              {t.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        <section className="tool">
          {tools.find(t => t.id === active)?.comp}
        </section>
        <aside className="sidebar">
          <h3>Tips</h3>
          <ul>
            <li>Drop or select multiple files to start.</li>
            <li>Watch progress and download when ready.</li>
          </ul>
        </aside>
      </main>

      <footer className="footer">dexpdf — small local PDF toolkit • deploy-ready for Vercel</footer>
    </div>
  )
}
