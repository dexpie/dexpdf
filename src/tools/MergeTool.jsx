import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'

export default function MergeTool(){
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)

  async function handleFiles(e){
    const list = Array.from(e.target.files)
    setFiles(prev => prev.concat(list))
  }

  async function merge(){
    if(!files.length) return
    setBusy(true)
    try{
      const merged = await PDFDocument.create()
      for(const f of files){
        const bytes = await f.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const copied = await merged.copyPages(pdf, pdf.getPageIndices())
        copied.forEach(p => merged.addPage(p))
      }
      const out = await merged.save()
      const blob = new Blob([out],{type:'application/pdf'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'merged.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }catch(err){
      console.error(err)
      alert('Failed to merge: '+(err.message||err))
    }finally{setBusy(false)}
  }

  function remove(i){
    setFiles(prev => prev.filter((_,idx)=>idx!==i))
  }

  return (
    <div>
      <h2>Merge PDF</h2>
      <div className="dropzone">
        <input type="file" accept="application/pdf" multiple onChange={handleFiles} />
        <div className="muted">Select multiple PDF files. They will be merged in the selected order.</div>
      </div>
      <div className="file-list">
        {files.map((f,i)=> (
          <div className="file-item" key={i}>
            <div>{f.name}</div>
            <div>
              <button className="btn" onClick={()=>remove(i)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:12}}>
        <button className="btn" onClick={merge} disabled={busy || files.length===0}>{busy? 'Working...' : 'Merge & Download'}</button>
      </div>
    </div>
  )
}
