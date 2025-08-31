import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

try{ pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` }catch(e){}

export default function MergeTool(){
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)

  async function handleFiles(e){
    const list = Array.from(e.target.files)
    const loaded = []
    for(const f of list){
      const thumb = await generatePdfThumbnail(f)
      loaded.push({file: f, thumb})
    }
    setFiles(prev => prev.concat(loaded))
  }

  async function merge(){
    if(!files.length) return
    setBusy(true)
    try{
      const merged = await PDFDocument.create()
      for(const entry of files){
        const f = entry.file
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

  function moveUp(i){
    setFiles(prev => {
      if(i<=0) return prev
      const copy = prev.slice()
      const t = copy[i-1]
      copy[i-1] = copy[i]
      copy[i] = t
      return copy
    })
  }

  function moveDown(i){
    setFiles(prev => {
      if(i>=prev.length-1) return prev
      const copy = prev.slice()
      const t = copy[i+1]
      copy[i+1] = copy[i]
      copy[i] = t
      return copy
    })
  }

  // drag-n-drop handlers
  function onDragStart(e, idx){
    e.dataTransfer.setData('text/plain', String(idx))
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  function onDrop(e, idx){
    e.preventDefault()
    const from = Number(e.dataTransfer.getData('text/plain'))
    if(Number.isNaN(from)) return
    setFiles(prev => {
      const copy = prev.slice()
      const [item] = copy.splice(from,1)
      copy.splice(idx,0,item)
      return copy
    })
  }

  async function generatePdfThumbnail(file){
    try{
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({data}).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({scale:1.5})
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({canvasContext:ctx, viewport}).promise
      return canvas.toDataURL('image/png')
    }catch(err){
      return null
    }
  }

  return (
    <div>
      <h2>Merge PDF</h2>
      <div className="dropzone">
        <input type="file" accept="application/pdf" multiple onChange={handleFiles} />
        <div className="muted">Select multiple PDF files. They will be merged in the selected order.</div>
      </div>
      <div className="file-list">
        {files.map((entry,i)=> (
          <div className="file-item" key={i} draggable onDragStart={(e)=>onDragStart(e,i)} onDragOver={onDragOver} onDrop={(e)=>onDrop(e,i)}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:56,height:40,flex:'none',background:'#f4f6fb',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {entry.thumb ? <img src={entry.thumb} style={{maxWidth:'100%',maxHeight:'100%'}} alt="thumb"/> : <div className="muted">PDF</div>}
              </div>
              <div style={{minWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{entry.file.name}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn" onClick={()=>moveUp(i)} disabled={i===0}>↑</button>
              <button className="btn" onClick={()=>moveDown(i)} disabled={i===files.length-1}>↓</button>
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
