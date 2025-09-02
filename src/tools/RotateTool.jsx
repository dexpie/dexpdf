import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'

export default function RotateTool(){
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)

  async function loadFile(e){
    const f = e.target.files[0]
    if(!f) return
    setFile(f)
    const bytes = await f.arrayBuffer()
    const pdf = await PDFDocument.load(bytes)
    setPages(new Array(pdf.getPageCount()).fill(false))
  }

  function toggle(i){ setPages(prev=> prev.map((v,idx)=> idx===i? !v:v)) }

  async function rotateAll(direction){
    if(!file) return
    setBusy(true)
    try{
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const out = await PDFDocument.create()
      const count = src.getPageCount()
      const pagesToCopy = [...Array(count).keys()]
      const copied = await out.copyPages(src, pagesToCopy)
      copied.forEach((p,idx)=>{
        const should = pages[idx]
        if(should){
          const deg = direction==='cw'? 90 : 270
          p.setRotation(deg)
        }
        out.addPage(p)
      })
      const outBytes = await out.save()
      const blob = new Blob([outBytes],{type:'application/pdf'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i,'') + '_rotated.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }catch(err){console.error(err); alert('Rotate failed: '+err.message)}
    finally{setBusy(false)}
  }

  return (
    <div>
      <h2>Rotate Pages</h2>
      <div className="dropzone">
        <input type="file" accept="application/pdf" onChange={loadFile} />
        <div className="muted">Load a PDF then select pages to rotate.</div>
      </div>

      {pages.length>0 && (
        <div style={{marginTop:12}}>
          <div className="muted">Click pages to toggle selection for rotation.</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8,marginTop:8}}>
            {pages.map((s,i)=>(
              <div key={i} className="file-item" onClick={()=>toggle(i)} style={{cursor:'pointer',background:s? '#eef2ff':''}}>
                Page {i+1}
              </div>
            ))}
          </div>
          <div style={{marginTop:12,display:'flex',gap:8}}>
            <button className="btn" onClick={()=>rotateAll('cw')} disabled={busy}>Rotate CW</button>
            <button className="btn" onClick={()=>rotateAll('ccw')} disabled={busy}>Rotate CCW</button>
          </div>
        </div>
      )}
    </div>
  )
}
