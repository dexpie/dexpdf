import React, { useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'

export default function SignatureTool(){
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [sigDataUrl, setSigDataUrl] = useState(null)
  const [placed, setPlaced] = useState([]) // {page, x, y, w, h, rotation}
  const canvasRef = useRef(null)
  const drawRef = useRef(false)

  function onFile(e){ const f = e.target.files?.[0]; if(!f) return; setFile(f) }

  function onSigUpload(e){ const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload = ()=> setSigDataUrl(r.result); r.readAsDataURL(f) }

  // simple signature draw
  function startDraw(e){ drawRef.current = true; const c = canvasRef.current; const ctx = c.getContext('2d'); const rect = c.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY) }
  function draw(e){ if(!drawRef.current) return; const c = canvasRef.current; const ctx = c.getContext('2d'); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#111'; ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke() }
  function endDraw(){ drawRef.current = false }
  function clearCanvas(){ const c = canvasRef.current; const ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); setSigDataUrl(null) }
  function saveCanvasAsDataUrl(){ const c = canvasRef.current; const url = c.toDataURL('image/png'); setSigDataUrl(url) }

  async function placeAndExport(){
    if(!file) return alert('Select a PDF first')
    if(!sigDataUrl) return alert('Create or upload a signature')
    setBusy(true)
    try{
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)
      const pages = pdf.getPages()
      // embed signature image (support PNG and JPEG)
      const imgBytes = await (await fetch(sigDataUrl)).arrayBuffer()
      const isJpeg = String(sigDataUrl).startsWith('data:image/jpeg') || String(sigDataUrl).startsWith('data:image/jpg')
      let img = null
      if(isJpeg){
        try{ img = await pdf.embedJpg(imgBytes) }catch(e){ img = await pdf.embedPng(imgBytes) }
      } else {
        try{ img = await pdf.embedPng(imgBytes) }catch(e){ img = await pdf.embedJpg(imgBytes) }
      }
      // place on first page centered for now
      const p = pages[0]
      const { width, height } = p.getSize()
      const iw = img.width * 0.5
      const ih = img.height * 0.5
      p.drawImage(img, { x: width - iw - 40, y: 40, width: iw, height: ih })
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i,'') + '_signed.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }catch(err){ console.error(err); alert('Failed: '+(err.message||err)) }
    finally{ setBusy(false) }
  }

  return (
    <div>
      <h2>Signature</h2>
      <div>
        <label style={{display:'flex',flexDirection:'column',gap:6}}>
          Select PDF
          <input aria-label="Select PDF file" type="file" accept="application/pdf" onChange={onFile} />
        </label>
      </div>
      <div style={{marginTop:12}}>
        <div className="muted">Draw signature (or upload PNG)</div>
  <canvas aria-label="Signature drawing canvas" role="img" ref={canvasRef} width={500} height={120} style={{border:'1px solid #ddd',display:'block'}} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} />
        <div style={{marginTop:8,display:'flex',gap:8}}>
          <button className="btn-ghost" onClick={clearCanvas}>Clear</button>
          <button className="btn-outline" aria-label="Use drawing as signature" onClick={saveCanvasAsDataUrl}>Use Drawing</button>
          <label className="btn-ghost" style={{display:'inline-flex',alignItems:'center',gap:8}}>Upload <input aria-label="Upload signature image" type="file" accept="image/*" onChange={onSigUpload} style={{display:'none'}} /></label>
        </div>
      </div>
      <div style={{marginTop:12}}>
        <button className="btn-primary" onClick={placeAndExport} disabled={busy || !file || !sigDataUrl}>{busy? 'Working...':'Place & Export Signed PDF'}</button>
      </div>
    </div>
  )
}
