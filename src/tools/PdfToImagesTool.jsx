import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

// Ensure worker is set from pdfjs-dist
try{
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}catch(e){console.warn('pdfjs worker not set',e)}

export default function PdfToImagesTool(){
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)

  async function loadFile(e){
    const f = e.target.files[0]
    if(!f) return
    setFile(f)
    const data = await f.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({data}).promise
    setPages(new Array(pdf.numPages).fill(false))
  }

  function toggle(i){ setPages(prev=> prev.map((v,idx)=> idx===i? !v:v)) }

  async function renderAndDownload(){
    if(!file) return
    setBusy(true)
    try{
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({data}).promise
      const indices = pages.flatMap((v,i)=> v? [i+1]: [])
      if(indices.length===0){ alert('Select pages to export'); setBusy(false); return }
      const toZip = []
      for(const pnum of indices){
        const page = await pdf.getPage(pnum)
        const viewport = page.getViewport({scale:2})
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({canvasContext:ctx, viewport}).promise
        const blob = await new Promise(res=>canvas.toBlob(res,'image/png'))
        toZip.push({pnum, blob})
      }

      if(indices.length===1){
        // single file: download directly
        const b = toZip[0].blob
        const url = URL.createObjectURL(b)
        const a = document.createElement('a')
        a.href = url
        a.download = `${file.name.replace(/\.pdf$/i,'')}_page_${toZip[0].pnum}.png`
        a.click()
        URL.revokeObjectURL(url)
      }else{
        // multiple: create zip
        const zip = new JSZip()
        for(const item of toZip){
          const arr = await item.blob.arrayBuffer()
          zip.file(`${file.name.replace(/\.pdf$/i,'')}_page_${item.pnum}.png`, arr)
        }
        const content = await zip.generateAsync({type:'blob'})
        const url = URL.createObjectURL(content)
        const a = document.createElement('a')
        a.href = url
        a.download = `${file.name.replace(/\.pdf$/i,'')}_pages.zip`
        a.click()
        URL.revokeObjectURL(url)
      }
    }catch(err){console.error(err); alert('Failed: '+err.message)}
    finally{setBusy(false)}
  }

  return (
    <div>
      <h2>PDF → Images</h2>
      <div className="dropzone">
        <input type="file" accept="application/pdf" onChange={loadFile} />
        <div className="muted">Select a PDF, then choose pages to export as PNG.</div>
      </div>
      {pages.length>0 && (
        <div style={{marginTop:12}}>
          <div className="muted">Click pages to select</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))',gap:8,marginTop:8}}>
            {pages.map((s,i)=>(
              <div key={i} className="file-item" onClick={()=>toggle(i)} style={{cursor:'pointer',background:s? '#eef2ff':''}}>
                Page {i+1}
              </div>
            ))}
          </div>
          <div style={{marginTop:12}}>
            <button className="btn" onClick={renderAndDownload} disabled={busy}>{busy? 'Rendering...':'Export Selected as PNG'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
