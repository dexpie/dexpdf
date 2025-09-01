import React, { useRef, useState, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

try{ pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` }catch(e){/*ignore*/}

export default function AnnotateTool(){
  const [file,setFile] = useState(null)
  const [pageImg,setPageImg] = useState(null)
  const canvasRef = useRef()
  const [drawing, setDrawing] = useState(false)

  async function loadFile(e){
    const f = e.target.files[0]; if(!f) return
    setFile(f)
    const data = await f.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({data}).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({scale:1.5})
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    await page.render({canvasContext:ctx, viewport}).promise
    setPageImg(canvas.toDataURL('image/png'))
  }

  useEffect(()=>{
    const c = canvasRef.current; if(!c || !pageImg) return
    const ctx = c.getContext('2d')
    const img = new Image(); img.onload = ()=>{ c.width = img.width; c.height=img.height; ctx.drawImage(img,0,0) }; img.src = pageImg
  },[pageImg])

  function start(e){ setDrawing(true); draw(e) }
  function stop(){ setDrawing(false); }
  function draw(e){ if(!drawing) return; const c=canvasRef.current; const rect=c.getBoundingClientRect(); const x=e.clientX-rect.left; const y=e.clientY-rect.top; const ctx=c.getContext('2d'); ctx.fillStyle='rgba(255,0,0,0.6)'; ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fill() }

  async function exportAnnotated(){
    if(!file || !canvasRef.current) return
    const blob = await new Promise(res=>canvasRef.current.toBlob(res,'image/png'))
    // embed single-page annotated image into PDF
    const pdfDoc = await PDFDocument.create()
    const imgBytes = await blob.arrayBuffer()
    const img = await pdfDoc.embedPng(imgBytes)
    const page = pdfDoc.addPage([img.width, img.height])
    page.drawImage(img, { x:0, y:0, width: img.width, height: img.height })
    const outBytes = await pdfDoc.save()
    const outBlob = new Blob([outBytes],{type:'application/pdf'})
    const url = URL.createObjectURL(outBlob); const a=document.createElement('a'); a.href=url; a.download = file.name.replace(/\.pdf$/i,'') + '_annotated.pdf'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2>Annotate PDF (single-page preview)</h2>
      <div className="dropzone">
        <input type="file" accept="application/pdf" onChange={loadFile} />
        <div className="muted">Load a PDF (first page shown). Draw on canvas to annotate.</div>
      </div>
      {pageImg && (
        <div style={{marginTop:12}}>
          <div style={{border:'1px solid #eee'}}>
            <canvas ref={canvasRef} onMouseDown={start} onMouseUp={stop} onMouseMove={draw} style={{display:'block',width:'100%'}} />
          </div>
          <div style={{marginTop:8}}>
            <button className="btn" onClick={exportAnnotated}>Export Annotated PDF</button>
          </div>
        </div>
      )}
    </div>
  )
}
