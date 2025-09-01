import React, { useState, Suspense } from 'react'
import ToolCard from './components/ToolCard'
import Modal from './components/Modal'

const MergeTool = React.lazy(() => import('./tools/MergeTool'))
const SplitTool = React.lazy(() => import('./tools/SplitTool'))
const ImagesToPdfTool = React.lazy(() => import('./tools/ImagesToPdfTool'))
const PdfToImagesTool = React.lazy(() => import('./tools/PdfToImagesTool'))
const PdfToTextTool = React.lazy(() => import('./tools/PdfToTextTool'))
const PdfToWordTool = React.lazy(() => import('./tools/PdfToWordTool'))
const WatermarkTool = React.lazy(() => import('./tools/WatermarkTool'))
const PageNumbersTool = React.lazy(() => import('./tools/PageNumbersTool'))
const SignatureTool = React.lazy(() => import('./tools/SignatureTool'))
const EditPdfTool = React.lazy(() => import('./tools/EditPdfTool'))
const CompressTool = React.lazy(() => import('./tools/CompressTool'))

const tools = [
  { id: 'merge', name: 'Merge PDF', comp: MergeTool, desc: 'Combine multiple PDFs into one' },
  { id: 'split', name: 'Split PDF', comp: SplitTool, desc: 'Extract pages or split by ranges' },
  { id: 'imgs2pdf', name: 'Images → PDF', comp: ImagesToPdfTool, desc: 'Convert images to a single PDF' },
  { id: 'pdf2imgs', name: 'PDF → Images', comp: PdfToImagesTool, desc: 'Export PDF pages as images' },
  { id: 'pdf2text', name: 'PDF → Text', comp: PdfToTextTool, desc: 'Extract selectable text from PDF' },
  { id: 'pdf2word', name: 'PDF → Word', comp: PdfToWordTool, desc: 'Basic PDF to DOCX conversion' },
  { id: 'watermark', name: 'Watermark', comp: WatermarkTool, desc: 'Add text/image watermark' },
  { id: 'pagenums', name: 'Page Numbers', comp: PageNumbersTool, desc: 'Add page numbers' },
  { id: 'signature', name: 'Signature', comp: SignatureTool, desc: 'Sign PDF pages' },
  { id: 'edit', name: 'Edit PDF', comp: EditPdfTool, desc: 'Edit PDF content (basic)' },
  { id: 'compress', name: 'Compress', comp: CompressTool, desc: 'Reduce PDF file size' }
]

export default function App() {
  const [active, setActive] = useState(null)
  const [open, setOpen] = useState(false)

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

      <Modal open={open} onClose={closeTool} title={active?.name}>
        <Suspense fallback={<div style={{padding:20}}>Loading...</div>}>
          {active && <active.comp />}
        </Suspense>
      </Modal>
    </div>
  )
}
