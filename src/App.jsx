import React, { useState } from 'react'
import MergeTool from './tools/MergeTool'
import SplitTool from './tools/SplitTool'
import ImagesToPdfTool from './tools/ImagesToPdfTool'
import PdfToImagesTool from './tools/PdfToImagesTool'
import PdfToTextTool from './tools/PdfToTextTool'
import PdfToWordTool from './tools/PdfToWordTool'
import WatermarkTool from './tools/WatermarkTool'
import PageNumbersTool from './tools/PageNumbersTool'
import SignatureTool from './tools/SignatureTool'
import EditPdfTool from './tools/EditPdfTool'
import CompressTool from './tools/CompressTool'

const tools = [
  { id: 'merge', name: 'Merge PDF', comp: <MergeTool /> },
  { id: 'split', name: 'Split PDF', comp: <SplitTool /> },
  { id: 'imgs2pdf', name: 'Images → PDF', comp: <ImagesToPdfTool /> },
  { id: 'pdf2imgs', name: 'PDF → Images', comp: <PdfToImagesTool /> },
  { id: 'pdf2text', name: 'PDF → Text', comp: <PdfToTextTool /> },
  { id: 'pdf2word', name: 'PDF → Word', comp: <PdfToWordTool /> },
  { id: 'watermark', name: 'Watermark', comp: <WatermarkTool /> },
  { id: 'pagenums', name: 'Page Numbers', comp: <PageNumbersTool /> },
  { id: 'signature', name: 'Signature', comp: <SignatureTool /> },
  { id: 'edit', name: 'Edit PDF', comp: <EditPdfTool /> },
  { id: 'compress', name: 'Compress', comp: <CompressTool /> }
]

export default function App() {
  const [active, setActive] = useState('merge')

  return (
    <div className="app">
      <header className="header">
        <div className="brand">dexpdf</div>

        <div className="nav-wrapper">
          <nav className="nav nav-desktop">
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

          <div className="nav-mobile">
            <select value={active} onChange={e => setActive(e.target.value)}>
              {tools.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
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
