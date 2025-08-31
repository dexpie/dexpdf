import React, { useState } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'

export default function WatermarkTool(){
  const [file, setFile] = useState(null)
  const [text, setText] = useState('Sample Watermark')
  const [opacity, setOpacity] = useState(0.2)
  const [busy, setBusy] = useState(false)

  async function onFile(e){
    const f = e.target.files?.[0]
    if(!f) return
    setFile(f)
  }

  async function applyWatermark(){
    if(!file) return alert('Select a PDF')
    setBusy(true)
    try{
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)
      const pages = pdf.getPages()
      for(const p of pages){
        const { width, height } = p.getSize()
        p.drawText(text, {
          x: width/2 - 150,
          y: height/2,
          size: 48,
          color: rgb(0.5,0.5,0.5),
          rotate: undefined,
          opacity: Number(opacity)
        })
      }
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'watermarked.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }catch(err){console.error(err); alert('Failed: '+err.message)}
    finally{setBusy(false)}
  }

  return (
    <div>
      <h2>Watermark PDF</h2>
      <input type="file" accept="application/pdf" onChange={onFile} />
      <div style={{marginTop:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} style={{width:'60%'}} />
        <label style={{marginLeft:8}}>Opacity</label>
        <input type="number" value={opacity} min={0} max={1} step={0.05} onChange={e=>setOpacity(e.target.value)} style={{width:80,marginLeft:8}} />
      </div>
      <div style={{marginTop:12}}>
        <button className="btn" onClick={applyWatermark} disabled={busy}>{busy? 'Working...' : 'Apply Watermark'}</button>
      </div>
    </div>
  )
}
