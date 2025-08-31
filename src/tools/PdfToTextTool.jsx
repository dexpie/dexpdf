import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) { }

export default function PdfToTextTool() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)

  async function loadFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
  }

  async function extract() {
    if (!file) return
    setBusy(true)
    try {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      let out = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const txtContent = await page.getTextContent()
        const strings = txtContent.items.map(it => it.str)
        out += `\n--- Page ${i} ---\n` + strings.join(' ') + '\n'
      }
      const blob = new Blob([out], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.name.replace(/\.pdf$/i, '')}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error(err); alert('Failed: ' + err.message) }
    finally { setBusy(false) }
  }

  return (
    <div>
      <h2>PDF → Text</h2>
      <div className="dropzone">
        <input type="file" accept="application/pdf" onChange={loadFile} />
        <div className="muted">Select a PDF to extract text (plain text).</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="btn" onClick={extract} disabled={busy || !file}>{busy ? 'Working...' : 'Extract Text'}</button>
      </div>
    </div>
  )
}
