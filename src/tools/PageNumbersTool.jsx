import React, { useState } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'

export default function PageNumbersTool() {
  const [file, setFile] = useState(null)
  const [position, setPosition] = useState('bottom-right')
  const [start, setStart] = useState(1)
  const [busy, setBusy] = useState(false)
  const [outputFileName, setOutputFileName] = useState('')
  const [batchMode, setBatchMode] = useState(false)

  async function onFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_pagenums'))
  }

  async function processBatchFile(file) {
    const array = await file.arrayBuffer()
    const pdf = await PDFDocument.load(array)
    const pages = pdf.getPages()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i]
      const { width, height } = p.getSize()
      const text = String(Number(start) + i)
      const size = 12
      let x = width - 40, y = 20
      if (position === 'bottom-left') x = 20
      if (position === 'top-right') y = height - 20
      if (position === 'top-left') { x = 20; y = height - 20 }
      p.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) })
    }
    const out = await pdf.save()
    return new Blob([out], { type: 'application/pdf' })
  }

  async function applyNumbers() {
    if (!file) return alert('Select a PDF')
    setBusy(true)
    try {
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)
      const pages = pdf.getPages()
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]
        const { width, height } = p.getSize()
        const text = String(Number(start) + i)
        const size = 12
        let x = width - 40, y = 20
        if (position === 'bottom-left') x = 20
        if (position === 'top-right') y = height - 20
        if (position === 'top-left') { x = 20; y = height - 20 }
        p.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) })
      }
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_pagenums')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error(err); alert('Failed: ' + err.message) }
    finally { setBusy(false) }
  }

  return (
    <div>
      <h2>Page Numbers</h2>
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setBatchMode(!batchMode)}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            background: batchMode ? '#3b82f6' : '#fff',
            color: batchMode ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          {batchMode ? 'Switch to Single Mode' : 'Switch to Batch Mode'}
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          accept="application/pdf"
          processFile={processBatchFile}
          outputNameSuffix="_pagenums"
          taskName={`Add page numbers (${position}, start: ${start})`}
        />
      ) : (
        <>
          <input type="file" accept="application/pdf" onChange={onFile} />
      <div style={{ marginTop: 8 }}>
        <label>Position</label>
        <select value={position} onChange={e => setPosition(e.target.value)}>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
        </select>
        <label style={{ marginLeft: 8 }}>Start</label>
        <input type="number" value={start} onChange={e => setStart(e.target.value)} style={{ width: 80, marginLeft: 6 }} />
      </div>
      {file && (
        <FilenameInput
          value={outputFileName}
          onChange={(e) => setOutputFileName(e.target.value)}
          disabled={busy}
          placeholder="output_pagenums"
        />
      )}
          <div style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={applyNumbers} disabled={busy}>{busy ? 'Working...' : 'Add Page Numbers'}</button>
          </div>
        </>
      )}
    </div>
  )
}
