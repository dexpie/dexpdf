import React, { useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
// import heavy libs only when needed

export default function PptToPdfTool(){
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)

  function loadFile(e){
    const f = e.target.files[0]
    if(!f) return
    setFile(f)
  }

  async function convert(){
    if(!file) return
    setBusy(true)
    try{
      // Simple strategy: unzip pptx, look for slides media or slide images.
      const data = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(data)
      // Try to find slides as images in ppt/media
      const mediaFiles = Object.keys(zip.files).filter(k => k.startsWith('ppt/media/'))
      const images = []
      for(const m of mediaFiles){
        const content = await zip.file(m).async('blob')
        images.push(content)
      }

      if(images.length===0){
        alert('No embedded slide images found in PPTX. This tool only supports PPTX files that contain slide images.');
        setBusy(false); return
      }

      // Build a PDF from images using html2canvas + jsPDF could be heavy; use simple image blobs to jsPDF if available
      // We'll create a zip of images as fallback if jsPDF isn't desired
      // Here: create single PDF via html <img> render + jsPDF if present
      if(images.length>0){
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF({ unit:'px', format:'a4' })
        for(let i=0;i<images.length;i++){
          const blob = images[i]
          const imgUrl = URL.createObjectURL(blob)
          const img = await new Promise(res=>{ const im=new Image(); im.onload=()=>res(im); im.src=imgUrl })
          const w = doc.internal.pageSize.getWidth()
          const h = doc.internal.pageSize.getHeight()
          doc.addImage(img, 'PNG', 0, 0, w, h)
          if(i<images.length-1) doc.addPage()
          URL.revokeObjectURL(imgUrl)
        }
        doc.save(file.name.replace(/\.pptx$/i,'') + '.pdf')
      }else{
        // fallback: return zip of images
        const out = new JSZip()
        for(let i=0;i<images.length;i++){
          const buf = await images[i].arrayBuffer()
          out.file(`slide_${i+1}.png`, buf)
        }
        const blob = await out.generateAsync({type:'blob'})
        saveAs(blob, file.name.replace(/\.pptx$/i,'') + '_slides.zip')
      }

    }catch(err){console.error(err); alert('Conversion failed: '+err.message)}
    finally{setBusy(false)}
  }

  return (
    <div>
      <h2>PPTX → PDF</h2>
      <div className="dropzone">
        <input type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={loadFile} />
        <div className="muted">Select a PPTX. If the file contains embedded slide images, they'll be converted to PDF pages; otherwise you'll get a ZIP of extracted images.</div>
      </div>
      <div style={{marginTop:12}}>
        <button className="btn" onClick={convert} disabled={!file || busy}>{busy? 'Converting...':'Convert to PDF'}</button>
      </div>
    </div>
  )
}
