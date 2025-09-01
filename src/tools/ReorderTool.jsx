import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

try{ pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` }catch(e){/*ignore*/}

function move(arr, from, to){ const a = arr.slice(); const v = a.splice(from,1)[0]; a.splice(to,0,v); return a }

export default function ReorderTool(){
  const [file,setFile] = useState(null)
  const [pages,setPages] = useState([]) // {thumb, index}
  const [busy,setBusy] = useState(false)

  async function loadFile(e){
    const f = e.target.files[0]; if(!f) return
    setFile(f); setPages([])
    const data = await f.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({data}).promise
    const out = []
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({scale:1})
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({canvasContext:ctx, viewport}).promise
      out.push({thumb: canvas.toDataURL('image/png'), idx: i-1})
    }
    setPages(out)
  }

  function onDragStart(e, idx){ e.dataTransfer.setData('text/plain', idx) }
  function onDrop(e, idx){ e.preventDefault(); const from = parseInt(e.dataTransfer.getData('text/plain'),10); setPages(p=> move(p,from,idx)) }

  async function exportPdf(){
    if(!file) return
    setBusy(true)
    try{
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const out = await PDFDocument.create()
      const order = pages.map(p => p.idx)
      const copied = await out.copyPages(src, order)
      copied.forEach(p=> out.addPage(p))
      const outBytes = await out.save()
      const blob = new Blob([outBytes],{type:'application/pdf'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href=url; a.download = file.name.replace(/\.pdf$/i,'') + '_reordered.pdf'; a.click(); URL.revokeObjectURL(url)
    }catch(err){console.error(err); alert('Export failed: '+err.message)}
    finally{setBusy(false)}
  }

  return (
    <div>
      <h2>Reorder Pages</h2>
      <div className="dropzone">
        <input type="file" accept="application/pdf" onChange={loadFile} />
        <div className="muted">Drag thumbnails to reorder pages, then export.</div>
      </div>
      {pages.length>0 && (
        <div style={{marginTop:12}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))',gap:8}}>
            {pages.map((p,i)=> (
              <div key={i} className="file-item" draggable onDragStart={(e)=>onDragStart(e,i)} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>onDrop(e,i)} style={{textAlign:'center'}}>
                <img src={p.thumb} style={{width:'100%',height:100,objectFit:'cover'}} alt={`page-${i+1}`} />
                <div style={{fontSize:12,marginTop:6}}>Pos {i+1}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:12}}>
            <button className="btn" onClick={exportPdf} disabled={busy}>{busy? 'Exporting...':'Export Reordered PDF'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
