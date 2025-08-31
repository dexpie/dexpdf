import React, { useState } from 'react'
import MergeTool from './tools/MergeTool'
import SplitTool from './tools/SplitTool'
import ImagesToPdfTool from './tools/ImagesToPdfTool'
import PdfToImagesTool from './tools/PdfToImagesTool'
import PdfToTextTool from './tools/PdfToTextTool'
import PdfToWordTool from './tools/PdfToWordTool'
import WordToPdfTool from './tools/WordToPdfTool'
import WatermarkTool from './tools/WatermarkTool'
import PageNumbersTool from './tools/PageNumbersTool'
import EditPdfTool from './tools/EditPdfTool'

const tools = [
  { id: 'merge', name: 'Merge PDF', comp: <MergeTool /> },
  { id: 'split', name: 'Split PDF', comp: <SplitTool /> },
  { id: 'imgs2pdf', name: 'Images → PDF', comp: <ImagesToPdfTool /> },
  { id: 'pdf2imgs', name: 'PDF → Images', comp: <PdfToImagesTool /> },
  { id: 'pdf2txt', name: 'PDF → Text', comp: <PdfToTextTool /> }
  , { id: 'pdf2word', name: 'PDF → Word', comp: <PdfToWordTool /> }
  , { id: 'word2pdf', name: 'Word → PDF', comp: <WordToPdfTool /> }
  , { id: 'watermark', name: 'Watermark', comp: <WatermarkTool /> }
  , { id: 'pagenums', name: 'Page Numbers', comp: <PageNumbersTool /> }
  , { id: 'editpdf', name: 'Edit PDF', comp: <EditPdfTool /> }
]

export default function App() {
  const [active, setActive] = useState('home')
  const [navOpen, setNavOpen] = useState(false) // mobile hamburger
  const [navExpanded, setNavExpanded] = useState(false) // maximize toggle

  const descriptions = {
    merge: 'Combine PDFs in the order you want with the easiest PDF merger available.',
    split: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    imgs2pdf: 'Convert images (JPG, PNG) into a single PDF file.',
    pdf2imgs: 'Export each PDF page as an image (JPG/PNG).',
    pdf2txt: 'Extract all text from a PDF into a .txt file.',
    pdf2word: 'Convert PDF to editable Word (DOCX) format (text-only client-side).',
    word2pdf: 'Convert DOCX documents into PDF files.',
    watermark: 'Stamp text or image over your PDF pages with transparency.',
    pagenums: 'Insert page numbers across pages with position and start options.',
    editpdf: 'Add text, images, or shapes onto PDF pages.'
  }

  return (
    <div className="app">
      <header className="header">
        <div style={{display:'flex',flexDirection:'column',width:'100%'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div className="brand">dexpdf</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button className={active === 'home' ? 'active' : ''} onClick={() => { setActive('home'); setNavOpen(false)}}>All Tools</button>
              <div className="nav-actions">
                <button title="Toggle nav" className="btn hamburger" onClick={()=>setNavOpen(v=>!v)}>☰</button>
                <button title="Expand" className="btn" onClick={()=>setNavExpanded(v=>!v)}>{navExpanded ? '▢' : '⛶'}</button>
              </div>
            </div>
          </div>
          <nav className={`nav-row nav-row--secondary ${navOpen? 'open':''}`} style={{marginTop:10}}>
            {tools.map(t => (
              <button
                key={t.id}
                className={t.id === active ? 'active' : ''}
                onClick={() => { setActive(t.id); setNavOpen(false) }}
              >
                {t.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        <section className="tool">
          {active === 'home' ? (
            <div>
              <h2>All PDF Tools</h2>
              <div className={`tools-grid ${navExpanded? 'expanded':''}`}>
                {tools.map(t => (
                  <div key={t.id} className="tool-card" onClick={() => setActive(t.id)} style={{cursor:'pointer'}}>
                    {t.id === 'editpdf' && <div className="badge">New</div>}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div className="icon-wrap" style={{background: t.id === 'merge' ? '#fef3c7' : t.id === 'split' ? '#eef2ff' : '#f3f4f6'}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#cbd5e1" strokeWidth="1.5"/></svg>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div className="title">{t.name}</div>
                      </div>
                    </div>
                    <div className="desc">{descriptions[t.id] || ''}</div>
                    <div className="card-preview">
                      <div style={{fontSize:13,color:'var(--muted)'}}>Quick actions</div>
                      <div style={{display:'flex',gap:8,marginTop:8}}>
                        <button className="open-btn" onClick={(e)=>{e.stopPropagation(); setActive(t.id)}}>Open</button>
                        <button className="open-btn" onClick={(e)=>{e.stopPropagation(); alert('Coming soon')}}>Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            tools.find(t => t.id === active)?.comp
          )}
        </section>
        <aside className="sidebar">
          <h3>Tips</h3>
          <ul>
            <li>Drop or select multiple files to start.</li>
            <li>Watch progress and download when ready.</li>
          </ul>
        </aside>
      </main>

      <footer className="footer">dexpdf -dexpie </footer>
    </div>
  )
}
