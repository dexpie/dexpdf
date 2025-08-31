import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'

export default function SplitTool(){
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [rotations, setRotations] = useState([])
  const [busy, setBusy] = useState(false)

  async function loadFile(e){
    const f = e.target.files[0]
    if(!f) return
    setFile(f)
    const bytes = await f.arrayBuffer()
    const pdf = await PDFDocument.load(bytes)
  setPages(new Array(pdf.getPageCount()).fill(false))
  setRotations(new Array(pdf.getPageCount()).fill(0))
  }

  function toggle(i){
    setPages(prev => prev.map((v,idx)=> idx===i ? !v : v))
  }

  function rotate(i){
    setRotations(prev => prev.map((r,idx)=> idx===i ? (r+90)%360 : r))
  }

  async function exportSelected(){
    if(!file) return
    setBusy(true)
    try{
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const indices = pages.flatMap((v,i)=> v? [i]: [])
      if(indices.length===0){ alert('Pick pages to export'); return }
      const out = await PDFDocument.create()
      const copied = await out.copyPages(src, indices)
      copied.forEach((p,idx)=>{
        out.addPage(p)
        const originalIndex = indices[idx]
        const deg = rotations[originalIndex] || 0
        if(deg){
          // pdf-lib expects radians rotation object, use setRotation from degrees
          p.setRotation(deg)
        }
      })
      const outBytes = await out.save()
      const blob = new Blob([outBytes],{type:'application/pdf'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'extracted.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }catch(err){console.error(err); alert('Failed: '+err.message)}
    finally{setBusy(false)}
  }

  return (
    <div>
      <h2>Split / Extract Pages</h2>
      <div className="dropzone">
        <input type="file" accept="application/pdf" onChange={loadFile} />
        <div className="muted">Load a PDF then select pages to export.</div>
      </div>
      <div style={{marginTop:12}}>
        {pages.length>0 && (
          <div>
            <div className="muted">Click pages to toggle selection. Use rotate to change orientation.</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8,marginTop:8}}>
              {pages.map((s,i)=>(
                <div key={i} className="file-item" style={{cursor:'pointer',background:s? '#eef2ff':''}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%'}}>
                    <div onClick={()=>toggle(i)} style={{flex:1}}>Page {i+1} {rotations[i]? `• ${rotations[i]}°`:''}</div>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn" onClick={()=>rotate(i)}>Rotate</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12}}>
              <button className="btn" onClick={exportSelected} disabled={busy}>{busy? 'Working...' : 'Export Selected'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
