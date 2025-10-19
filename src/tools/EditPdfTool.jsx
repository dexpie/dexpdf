import React, { useState } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'

export default function EditPdfTool() {
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('text') // text | image | shape
  const [text, setText] = useState('New text')
  const [busy, setBusy] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [batchMode, setBatchMode] = useState(false)

  async function onFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_edited'))
  }

  async function onImage(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
  }

  async function processBatchFile(file) {
    const array = await file.arrayBuffer()
    const pdf = await PDFDocument.load(array)
    const pages = pdf.getPages()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const p = pages[0]
    const { width, height } = p.getSize()
    if (mode === 'text') {
      p.drawText(text, { x: 40, y: height - 80, size: 14, font, color: rgb(0, 0, 0) })
    } else if (mode === 'image' && imageFile) {
      const imgBuf = await imageFile.arrayBuffer()
      const ext = (imageFile.type || '').toLowerCase()
      let img
      if (ext.includes('png')) img = await pdf.embedPng(imgBuf)
      else img = await pdf.embedJpg(imgBuf)
      p.drawImage(img, { x: 40, y: height - 200, width: 150, height: 120 })
    } else {
      // simple rectangle
      p.drawRectangle({ x: 40, y: height - 240, width: 200, height: 100, color: rgb(0.9, 0.9, 0.9) })
    }
    const out = await pdf.save()
    return new Blob([out], { type: 'application/pdf' })
  }

  async function applyEdits() {
    if (!file) return alert('Select a PDF')
    setBusy(true)
    try {
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)
      const pages = pdf.getPages()
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const p = pages[0]
      const { width, height } = p.getSize()
      if (mode === 'text') {
        p.drawText(text, { x: 40, y: height - 80, size: 14, font, color: rgb(0, 0, 0) })
      } else if (mode === 'image' && imageFile) {
        const imgBuf = await imageFile.arrayBuffer()
        const ext = (imageFile.type || '').toLowerCase()
        let img
        if (ext.includes('png')) img = await pdf.embedPng(imgBuf)
        else img = await pdf.embedJpg(imgBuf)
        p.drawImage(img, { x: 40, y: height - 200, width: 150, height: 120 })
      } else {
        // simple rectangle
        p.drawRectangle({ x: 40, y: height - 240, width: 200, height: 100, color: rgb(0.9, 0.9, 0.9) })
      }
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_edited')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error(err); alert('Failed: ' + err.message) }
    finally { setBusy(false) }
  }

  return (
    <div>
      <h2>Edit PDF</h2>
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

      <div style={{ marginTop: 8 }}>
        <label>Mode</label>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="text">Add Text</option>
          <option value="image">Add Image</option>
          <option value="shape">Add Shape</option>
        </select>
      </div>
      {mode === 'text' && (
        <div style={{ marginTop: 8 }}>
          <input value={text} onChange={e => setText(e.target.value)} style={{ width: '60%' }} />
        </div>
      )}
      {mode === 'image' && (
        <div style={{ marginTop: 8 }}>
          <input type="file" accept="image/*" onChange={onImage} />
        </div>
      )}

      {batchMode ? (
        <div style={{ marginTop: 16 }}>
          <UniversalBatchProcessor
            accept="application/pdf"
            processFile={processBatchFile}
            outputNameSuffix="_edited"
            taskName={`Edit PDF (${mode})`}
          />
        </div>
      ) : (
        <>
          <input type="file" accept="application/pdf" onChange={onFile} />
          {file && (
            <FilenameInput
              value={outputFileName}
              onChange={(e) => setOutputFileName(e.target.value)}
              disabled={busy}
              placeholder="output_edited"
            />
          )}
          <div style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={applyEdits} disabled={busy}>{busy ? 'Working...' : 'Apply Edits'}</button>
          </div>
        </>
      )}
    </div>
  )
}
