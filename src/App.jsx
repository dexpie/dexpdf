import React, { useState, Suspense, useEffect } from 'react'
import ToolCard from './components/ToolCard'
import Modal from './components/Modal'

const MergeTool = React.lazy(() => import('./tools/MergeTool'))
const SplitTool = React.lazy(() => import('./tools/SplitTool'))
const ImagesToPdfTool = React.lazy(() => import('./tools/ImagesToPdfTool'))
const PdfToImagesTool = React.lazy(() => import('./tools/PdfToImagesTool'))
const PdfToTextTool = React.lazy(() => import('./tools/PdfToTextTool'))
const PdfToWordTool = React.lazy(() => import('./tools/PdfToWordTool'))
const PdfToPptTool = React.lazy(() => import('./tools/PdfToPptTool'))
const PptToPdfTool = React.lazy(() => import('./tools/PptToPdfTool'))
const RotateTool = React.lazy(() => import('./tools/RotateTool'))
const WatermarkTool = React.lazy(() => import('./tools/WatermarkTool'))
const ReorderTool = React.lazy(() => import('./tools/ReorderTool'))
const AnnotateTool = React.lazy(() => import('./tools/AnnotateTool'))
const OcrTool = React.lazy(() => import('./tools/OcrTool'))
const PageNumbersTool = React.lazy(() => import('./tools/PageNumbersTool'))
const SignatureTool = React.lazy(() => import('./tools/SignatureTool'))
const EditPdfTool = React.lazy(() => import('./tools/EditPdfTool'))
const CompressTool = React.lazy(() => import('./tools/CompressTool'))

const tools = [
  { id: 'merge', name: 'Merge PDF', icon: '🔗', comp: MergeTool, desc: 'Combine multiple PDFs into one' },
  { id: 'split', name: 'Split PDF', icon: '✂️', comp: SplitTool, desc: 'Extract pages or split by ranges' },
  { id: 'imgs2pdf', name: 'Images → PDF', icon: '🖼️', comp: ImagesToPdfTool, desc: 'Convert images to a single PDF' },
  { id: 'pdf2imgs', name: 'PDF → Images', icon: '🖼️', comp: PdfToImagesTool, desc: 'Export PDF pages as images' },
  { id: 'pdf2text', name: 'PDF → Text', icon: '📝', comp: PdfToTextTool, desc: 'Extract selectable text from PDF' },
  { id: 'pdf2word', name: 'PDF → Word', icon: '📄', comp: PdfToWordTool, desc: 'Basic PDF to DOCX conversion' },
  { id: 'pdf2ppt', name: 'PDF → PPTX', icon: '📤', comp: PdfToPptTool, desc: 'Export each PDF page as a PPTX slide' },
  { id: 'ppt2pdf', name: 'PPTX → PDF', icon: '📥', comp: PptToPdfTool, desc: 'Convert PPTX slides (images) to PDF' },
  { id: 'rotate', name: 'Rotate Pages', icon: '🔄', comp: RotateTool, desc: 'Rotate selected pages clockwise or counterclockwise' },
  { id: 'reorder', name: 'Reorder Pages', icon: '🔀', comp: ReorderTool, desc: 'Drag to reorder PDF pages and export' },
  { id: 'annotate', name: 'Annotate PDF', icon: '🖊️', comp: AnnotateTool, desc: 'Add drawings, highlights, and sticky notes' },
  { id: 'ocr', name: 'OCR (Image→Text)', icon: '🔎', comp: OcrTool, desc: 'Extract text from images or scanned PDFs (Tesseract.js)' },
  { id: 'watermark', name: 'Watermark', icon: '💧', comp: WatermarkTool, desc: 'Add text/image watermark' },
  { id: 'pagenums', name: 'Page Numbers', icon: '🔢', comp: PageNumbersTool, desc: 'Add page numbers' },
  { id: 'signature', name: 'Signature', icon: '✒️', comp: SignatureTool, desc: 'Sign PDF pages' },
  { id: 'edit', name: 'Edit PDF', icon: '🛠️', comp: EditPdfTool, desc: 'Edit PDF content (basic)' },
  { id: 'compress', name: 'Compress', icon: '🗜️', comp: CompressTool, desc: 'Reduce PDF file size' }
]

export default function App() {
  const [active, setActive] = useState(null)
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      if (typeof window === 'undefined') return 'light'
      const stored = localStorage.getItem('theme')
      if (stored) return stored
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch (e) { return 'light' }
  })

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.setItem('theme', theme)
    } catch (e) { /* ignore */ }
  }, [theme])

  function toggleTheme(){ setTheme(t => t === 'dark' ? 'light' : 'dark') }

  function openTool(id){
    const t = tools.find(x => x.id === id)
    if(!t) return
    setActive(t)
    setOpen(true)
  }

  function closeTool(){ setOpen(false); setActive(null) }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">dexpdf</div>
        <div className="nav">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">{theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-dropzone">
          <div className="hero-title">Drop PDF files here or click to select</div>
          <div className="hero-sub">Merge, split, convert and more — all locally in your browser</div>
        </div>
      </section>

      <section className="tool-grid">
        {tools.map(t => (
          <ToolCard key={t.id} title={t.name} desc={t.desc} onOpen={() => openTool(t.id)} />
        ))}
      </section>

      <footer className="footer">dexpdf — small local PDF toolkit</footer>

  <Modal open={open} onClose={closeTool} title={active?.name} subtitle={active?.desc}>
        <Suspense fallback={<div style={{padding:20}}>Loading...</div>}>
          {active && <active.comp />}
        </Suspense>
      </Modal>
    </div>
  )
}
