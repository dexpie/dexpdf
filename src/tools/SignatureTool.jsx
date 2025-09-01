import React, { useRef, useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) {}

function Overlay({ ov, onDrag, onStartDrag, onStartResize }){
  // ov: { x,y,w,h, page }
  return (
    <div className="sig-overlay" style={{position:'absolute',left:ov.x,top:ov.y,width:ov.w,height:ov.h,cursor:'move',border:'2px dashed rgba(0,0,0,0.2)',boxSizing:'border-box'}} onMouseDown={onStartDrag}>
      <img src={ov.dataUrl} style={{width:'100%',height:'100%',objectFit:'contain',pointerEvents:'none'}} alt="sig" />
      <div className="sig-resize" onMouseDown={onStartResize} style={{position:'absolute',right:0,bottom:0,width:12,height:12,background:'#fff',border:'1px solid #bbb',cursor:'nwse-resize'}} />
    </div>
  )
}

export default function SignatureTool(){
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([]) // {canvas, width, height}
  const [sigDataUrl, setSigDataUrl] = useState(null)
  const [overlays, setOverlays] = useState([]) // {page, x,y,w,h,dataUrl}
  const [selected, setSelected] = useState(null)
  const undoRef = useRef([])
  const [busy, setBusy] = useState(false)
  const containerRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(()=>{
    function onMove(e){
      if(!dragRef.current) return
      const { type, idx, startX, startY, startW, startH, page } = dragRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      setOverlays(prev => {
        const copy = prev.slice()
        const item = { ...copy[idx] }
        if(type === 'move'){
          item.x = Math.max(0, startX + dx - copy[`_pageOffset${page}`])
          item.y = Math.max(0, startY + dy - copy[`_pageOffsetY${page}`])
        } else if(type === 'resize'){
          item.w = Math.max(10, startW + dx)
          item.h = Math.max(10, startH + dy)
        }
        copy[idx] = item
        return copy
      })
    }
    function onUp(){ dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return ()=>{ window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  async function onFile(e){ const f = e.target.files?.[0]; if(!f) return; setFile(f); await renderPdfPreview(f) }

  function onSigUpload(e){ const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload = ()=> setSigDataUrl(r.result); r.readAsDataURL(f) }

  async function renderPdfPreview(file){
    const array = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({data:array})
    const pdf = await loadingTask.promise
    const pgs = []
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      pgs.push({ canvas, width: canvas.width, height: canvas.height, viewportWidth: viewport.width, viewportHeight: viewport.height })
    }
    setPages(pgs)
    // attach small helper offsets for overlays calculation
    setOverlays([])
  }

  function startDrag(e, idx){
    e.preventDefault();
    const ov = overlays[idx]
    const page = ov.page
    // compute page offset relative to viewport
    const pageCanvas = pages[page].canvas
    const rect = pageCanvas.getBoundingClientRect()
    // store page offsets on overlays array for mapping
    setOverlays(prev=>{
      const copy = prev.slice()
      copy[`_pageOffset${page}`] = rect.left
      copy[`_pageOffsetY${page}`] = rect.top
      return copy
    })
  setSelected(idx)
  dragRef.current = { type: 'move', idx, startX: e.clientX, startY: e.clientY, page }
  }

  function startResize(e, idx){ e.preventDefault(); const ov = overlays[idx]; dragRef.current = { type:'resize', idx, startX: e.clientX, startY: e.clientY, startW: ov.w, startH: ov.h } }

  function addOverlayToPage(pageIndex){
    if(!sigDataUrl) return alert('Create or upload a signature first')
    const page = pages[pageIndex]
    if(!page) return
    const w = Math.min(200, page.width * 0.4)
    const h = Math.min(80, page.height * 0.15)
    const x = (page.width - w)/2
    const y = (page.height - h)/2
    setOverlays(prev => {
      const next = prev.concat({ page: pageIndex, x, y, w, h, dataUrl: sigDataUrl })
      undoRef.current.push(prev)
      return next
    })
  }

  function deleteSelected(){
    if(selected === null) return
    setOverlays(prev => {
      const next = prev.slice(); next.splice(selected,1); undoRef.current.push(prev); return next
    })
    setSelected(null)
  }

  function undo(){
    const last = undoRef.current.pop()
    if(last) setOverlays(last)
  }

  async function exportSigned(){
    if(!file) return alert('Select a PDF first')
    if(overlays.length===0) return alert('Place a signature before exporting')
    setBusy(true)
    try{
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)
      const imgBytes = await (await fetch(sigDataUrl)).arrayBuffer()
      const isJpeg = String(sigDataUrl).startsWith('data:image/jpeg') || String(sigDataUrl).startsWith('data:image/jpg')
      let embedded = null
      if(isJpeg){ try{ embedded = await pdf.embedJpg(imgBytes) }catch(e){ embedded = await pdf.embedPng(imgBytes) } }
      else { try{ embedded = await pdf.embedPng(imgBytes) }catch(e){ embedded = await pdf.embedJpg(imgBytes) } }

      // for each overlay, map canvas pixel coords -> PDF user space (points)
      for(const ov of overlays){
        const page = pdf.getPages()[ov.page]
        const { width: pdfW, height: pdfH } = page.getSize()
        const canvasInfo = pages[ov.page]
        const canvasW = canvasInfo.width
        const canvasH = canvasInfo.height
        const xRatio = pdfW / canvasW
        const yRatio = pdfH / canvasH
        const x = ov.x * xRatio
        // pdf-lib origin is bottom-left, while canvas is top-left
        const y = pdfH - (ov.y + ov.h) * yRatio
        const w = ov.w * xRatio
        const h = ov.h * yRatio
        page.drawImage(embedded, { x, y, width: w, height: h })
      }

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
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <label style={{display:'flex',flexDirection:'column',gap:6}}>
          Select PDF
          <input aria-label="Select PDF file" type="file" accept="application/pdf" onChange={onFile} />
        </label>

        <label style={{display:'flex',flexDirection:'column',gap:6}}>
          Upload signature image
          <input aria-label="Upload signature image" type="file" accept="image/*" onChange={onSigUpload} />
        </label>
      </div>

      <div style={{marginTop:12}}>
        <div className="muted">Render preview below, then click a page's "Add" to place signature, drag/resize overlay as needed.</div>
      </div>

      <div ref={containerRef} style={{marginTop:12,display:'flex',flexDirection:'column',gap:18}}>
        {pages.map((p,idx)=> (
          <div key={idx} style={{position:'relative',border:'1px solid #eee',display:'inline-block'}}>
            <div style={{position:'absolute',right:8,top:8,zIndex:10}}>
              <button className="btn-ghost" onClick={()=>addOverlayToPage(idx)}>Add</button>
            </div>
            <div style={{position:'relative'}}>
              <div style={{position:'relative'}}>
                {/* attach canvas */}
                <div style={{position:'relative'}}>
                  <div style={{width:p.width,height:p.height}}>
                    <div dangerouslySetInnerHTML={{__html: ''}} />
                    {/* place the canvas element into DOM */}
                    <div ref={el=>{ if(el && !el.firstChild) el.appendChild(p.canvas) }} />
                  </div>
                  {/* overlays for this page */}
                  {overlays.map((ov,i)=> ov.page===idx ? (
                    <Overlay key={i} ov={ov} onStartDrag={(e)=>startDrag(e,i)} onStartResize={(e)=>startResize(e,i)} />
                  ) : null)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:12,display:'flex',gap:8}}>
        <button className="btn-primary" onClick={exportSigned} disabled={busy || !file || overlays.length===0}>{busy? 'Working...':'Export Signed PDF'}</button>
        <button className="btn-ghost" onClick={deleteSelected} disabled={selected===null}>Delete</button>
        <button className="btn-ghost" onClick={undo} disabled={undoRef.current.length===0}>Undo</button>
      </div>
    </div>
  )
}
