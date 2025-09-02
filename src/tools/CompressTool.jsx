import React, { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import jsPDF from 'jspdf'

// set worker (best-effort like other tools)
try{
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}catch(e){console.warn('pdfjs worker not set',e)}

export default function CompressTool(){
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState(0)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dropped, setDropped] = useState(false)
  const [quality, setQuality] = useState(0.7) // jpeg quality when rasterizing
  const [scale, setScale] = useState(0.9) // render scale multiplier (1 = original)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [originalSize, setOriginalSize] = useState(null)
  const [estimateSize, setEstimateSize] = useState(null)
  const [estimating, setEstimating] = useState(false)
  const [progressText, setProgressText] = useState('')

  // refs for caching and cancelling
  const pdfDataRef = useRef(null)
  const pdfDocRef = useRef(null)
  const estimateReqRef = useRef(0)
  const debounceRef = useRef(null)

  async function onFile(e){
    const f = e.target.files?.[0]
    if(!f) return
    setFile(f)
    setOriginalSize(f.size)
    try{
  const data = await f.arrayBuffer()
  // cache arrayBuffer and pdf document for faster repeated estimates
  pdfDataRef.current = data
  const pdf = await pdfjsLib.getDocument({data}).promise
  pdfDocRef.current = pdf
  setPages(pdf.numPages)
      setEstimateSize(null)
      setProgressText('')
    }catch(err){console.error(err); alert('Unable to read PDF: '+(err.message||err))}
  }

  function onDragEnter(e){ e.preventDefault(); setDragging(true) }
  function onDragOverZone(e){ e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }
  function onDragLeave(e){ e.preventDefault(); setDragging(false) }
  async function onDropZone(e){ e.preventDefault(); setDragging(false); const f = e.dataTransfer?.files?.[0]; if(f) { setFile(f); setOriginalSize(f.size); const data = await f.arrayBuffer(); const pdf = await pdfjsLib.getDocument({data}).promise; setPages(pdf.numPages); setEstimateSize(null); setProgressText(''); setDropped(true); setTimeout(()=>setDropped(false),1500) } }


  function pxToMm(px){
    // assume 96 DPI for canvas pixels -> mm
    return px * 25.4 / 96
  }

  async function compressAndDownload({download=true, preview=false}={download:true, preview:false}){
    if(!file) return alert('Select a PDF to compress')
    if(pages > 80){
      const ok = confirm('This PDF has '+pages+' pages. Compressing will rasterize pages in the browser and may be slow or use lots of memory. Continue?')
      if(!ok) return
    }
  setBusy(true)
    setPreviewUrl(null)
    try{
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({data}).promise
      const num = pdf.numPages
      let doc = null
      for(let i=1;i<=num;i++){
        const page = await pdf.getPage(i)
        // render at user scale to control quality/size
        const viewport = page.getViewport({scale: scale})
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({canvasContext: ctx, viewport}).promise

        // convert to JPEG data URL using chosen quality
        const dataUrl = canvas.toDataURL('image/jpeg', Number(quality))

        // page size in mm
        const wmm = pxToMm(canvas.width)
        const hmm = pxToMm(canvas.height)

        if(i === 1){
          doc = new jsPDF({unit: 'mm', format: [wmm, hmm]})
          doc.addImage(dataUrl, 'JPEG', 0, 0, wmm, hmm)
        } else {
          doc.addPage([wmm, hmm])
          doc.addImage(dataUrl, 'JPEG', 0, 0, wmm, hmm)
        }

        // minor thrash: release canvas
        canvas.width = 0
        canvas.height = 0
      }

      if(!doc) throw new Error('Failed to create compressed PDF')

      if(preview){
        const uri = doc.output('datauristring')
        setPreviewUrl(uri)
      }

      if(download){
        doc.save(file.name.replace(/\.pdf$/i,'') + '_compressed.pdf')
      }
    }catch(err){console.error(err); alert('Compression failed: '+(err.message||err))}
    finally{setBusy(false)}
  }

  // Estimate compressed size by rasterizing first page and extrapolating
  async function estimateSample(){
    if(!file) return alert('Select a PDF first')
    setEstimating(true)
    setEstimateSize(null)
    setProgressText('Preparing...')
    try{
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({data}).promise
      const num = pdf.numPages
      setPages(num)
      setProgressText('Rendering sample page...')
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({scale: scale})
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({canvasContext: ctx, viewport}).promise

      const blob = await new Promise(res=> canvas.toBlob(res, 'image/jpeg', Number(quality)))
      const sampleSize = blob ? blob.size : 0
      // naive estimate: sampleSize * numPages (plus small pdf overhead)
      const overhead = 2000
      const est = Math.max(0, Math.round(sampleSize * num + overhead))
      setEstimateSize(est)
      setProgressText('Estimated using sample page at current settings')
      // cleanup
      canvas.width = 0; canvas.height = 0
    }catch(err){console.error(err); alert('Estimate failed: '+(err.message||err))}
    finally{setEstimating(false)}
  }

  // Render first page at specific settings and return estimated total size
  async function estimateForSettings(q, s){
  // try to reuse cached pdf/doc
  const data = pdfDataRef.current || await file.arrayBuffer()
  const pdf = pdfDocRef.current || await pdfjsLib.getDocument({data}).promise
  const num = pdf.numPages
  const page = await pdf.getPage(1)
    const viewport = page.getViewport({scale: s})
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    await page.render({canvasContext: ctx, viewport}).promise
    const blob = await new Promise(res=> canvas.toBlob(res, 'image/jpeg', Number(q)))
    const sampleSize = blob ? blob.size : 0
    const overhead = 2000
    canvas.width = 0; canvas.height = 0
    return Math.max(0, Math.round(sampleSize * num + overhead))
  }

  // Estimate a min/current/max range using representative settings
  async function estimateRange(){
    if(!file) return alert('Select a PDF first')
    setEstimating(true)
    setProgressText('Estimating range...')
    try{
  // reuse cached PDF when available
  const data = pdfDataRef.current || await file.arrayBuffer()
  const pdf = pdfDocRef.current || await pdfjsLib.getDocument({data}).promise
  pdfDataRef.current = data
  pdfDocRef.current = pdf
  const num = pdf.numPages
  setPages(num)

      // define representative extremes
      const minQ = 0.1, minS = 0.5
      const maxQ = 1.0, maxS = 1.0
      const curQ = Number(quality), curS = Number(scale)

      setProgressText('Rendering low-quality sample...')
  const currentReq = ++estimateReqRef.current
  const low = await estimateForSettings(minQ, minS)
  if(currentReq !== estimateReqRef.current) throw new Error('Cancelled')
      setProgressText('Rendering current settings sample...')
  const cur = await estimateForSettings(curQ, curS)
  if(currentReq !== estimateReqRef.current) throw new Error('Cancelled')
      setProgressText('Rendering high-quality sample...')
  const high = await estimateForSettings(maxQ, maxS)
  if(currentReq !== estimateReqRef.current) throw new Error('Cancelled')

      // store as object for UI
      setEstimateSize({low, cur, high})
      setProgressText('Range estimated using first-page extrapolation')
    }catch(err){console.error(err); alert('Range estimate failed: '+(err.message||err))}
    finally{setEstimating(false)}
  }

  // Live estimations: debounce when quality/scale or file changes
  useEffect(()=>{
    if(!file) return
    // clear pending debounce
    if(debounceRef.current) clearTimeout(debounceRef.current)
    // schedule estimate of current settings after short delay
    debounceRef.current = setTimeout(()=>{
      // increment request id to allow cancellation
      estimateReqRef.current++
      // perform lightweight sample estimate (current settings)
      (async ()=>{
        try{
          setEstimating(true)
          setProgressText('Estimating...')
          const cur = await estimateForSettings(Number(quality), Number(scale))
          // if cancelled, bail
          if(estimateReqRef.current === 0) return
          setEstimateSize({cur})
          setProgressText('Live estimate updated')
        }catch(err){if(err.message !== 'Cancelled') console.error(err)}
        finally{setEstimating(false)}
      })()
    }, 350)
    return ()=>{ if(debounceRef.current) clearTimeout(debounceRef.current) }
  }, [file, quality, scale])

  function formatBytes(n){
    if(n == null) return '-'
    if(n < 1024) return n + ' B'
    if(n < 1024*1024) return (n/1024).toFixed(1) + ' KB'
    return (n/(1024*1024)).toFixed(2) + ' MB'
  }

  return (
    <div>
      <h2>Compress PDF</h2>
      <div className={`dropzone ${dragging? 'dragover':''}`} onDragEnter={onDragEnter} onDragOver={onDragOverZone} onDragLeave={onDragLeave} onDrop={onDropZone}>
        <input type="file" accept="application/pdf" onChange={onFile} />
        <div className="muted">Rasterize pages at lower quality/scale to reduce file size (lossy).</div>
        {dropped && <div className="drop-overlay">✓ Uploaded</div>}
      </div>

      {file && (
        <div style={{marginTop:12}}>
          <div><strong>{file.name}</strong> — {pages} pages — original: {formatBytes(originalSize)}</div>
          {estimateSize && (
            <div style={{marginTop:8}}>
              {typeof estimateSize === 'number' && (
                <div>Estimated compressed size: <strong>{formatBytes(estimateSize)}</strong> ({originalSize? Math.round(100 - (estimateSize/originalSize)*100) : 0}% smaller)</div>
              )}
              {typeof estimateSize === 'object' && (
                <div>
                  {estimateSize.low && estimateSize.cur && estimateSize.high ? (
                    <>
                      <div>Estimated range:</div>
                      <div style={{display:'flex',gap:12,marginTop:6}}>
                        <div>Min: <strong>{formatBytes(estimateSize.low)}</strong> ({originalSize? Math.round(100 - (estimateSize.low/originalSize)*100) : 0}% smaller)</div>
                        <div>Current: <strong>{formatBytes(estimateSize.cur)}</strong> ({originalSize? Math.round(100 - (estimateSize.cur/originalSize)*100) : 0}% smaller)</div>
                        <div>Max: <strong>{formatBytes(estimateSize.high)}</strong> ({originalSize? Math.round(100 - (estimateSize.high/originalSize)*100) : 0}% smaller)</div>
                      </div>
                    </>
                  ) : (
                    // object with only cur (live estimate)
                    <div>Estimated compressed size (live): <strong>{formatBytes(estimateSize.cur)}</strong> {originalSize? `(${Math.round(100 - (estimateSize.cur/originalSize)*100)}% smaller)` : ''}</div>
                  )}
                </div>
              )}
            </div>
          )}
          {progressText && (
            <div style={{marginTop:8,color:'#6b7280'}}>{progressText}</div>
          )}
          <div style={{display:'flex',gap:12,alignItems:'center',marginTop:8}}>
            <label style={{display:'flex',gap:8,alignItems:'center'}}>
              JPEG Quality:
              <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e=>setQuality(Number(e.target.value))} />
              <div style={{width:44,textAlign:'right'}}>{Math.round(quality*100)}%</div>
            </label>
            <label style={{display:'flex',gap:8,alignItems:'center'}}>
              Render Scale:
              <select value={scale} onChange={e=>setScale(Number(e.target.value))}>
                <option value={1}>100%</option>
                <option value={0.9}>90%</option>
                <option value={0.8}>80%</option>
                <option value={0.7}>70%</option>
                <option value={0.6}>60%</option>
                <option value={0.5}>50%</option>
              </select>
            </label>
          </div>

          <div style={{marginTop:12,display:'flex',gap:8}}>
            <button className="btn-primary" onClick={()=>compressAndDownload({download:true, preview:false})} disabled={busy}>{busy? 'Compressing...':'Compress & Download'}</button>
            <button className="btn-outline" onClick={()=>compressAndDownload({download:false, preview:true})} disabled={busy}>{busy? 'Compressing...':'Preview'}</button>
            <button className="btn-ghost" onClick={estimateSample} disabled={estimating}>{estimating? 'Estimating...':'Estimate size'}</button>
            <button className="btn-ghost" onClick={estimateRange} disabled={estimating}>{estimating? 'Estimating...':'Estimate range (min/cur/max)'}</button>
          </div>

          {previewUrl && (
            <div style={{marginTop:12}}>
              <div className="muted">Preview (close tab/window to dismiss):</div>
              <iframe title="compress-preview" src={previewUrl} style={{width:'100%',height:400,border:'1px solid #ddd'}} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
