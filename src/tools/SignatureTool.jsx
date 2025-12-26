import React, { useRef, useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import SignatureCanvas from 'react-signature-canvas'
import { useTranslation } from 'react-i18next'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Upload, Download, Trash2, Move, X, Check, Save } from 'lucide-react'

configurePdfWorker()

// --- Signature Pad Modal ---
function SignatureModal({ onSave, onCancel }) {
  const sigRef = useRef()
  const { t } = useTranslation()

  const save = () => {
    if (sigRef.current.isEmpty()) return
    onSave(sigRef.current.getTrimmedCanvas().toDataURL('image/png'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-500" /> Draw Signature
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 bg-slate-50">
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 shadow-inner overflow-hidden">
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{ width: 500, height: 200, className: 'w-full h-48 cursor-crosshair' }}
              backgroundColor="transparent"
            />
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">Sign above using your mouse or touch</p>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-white">
          <button className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-medium text-sm" onClick={() => sigRef.current.clear()}>Clear</button>
          <button className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-medium text-sm" onClick={onCancel}>Cancel</button>
          <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform" onClick={save}>Add Signature</button>
        </div>
      </motion.div>
    </div>
  )
}

// --- Draggable Overlay ---
function Overlay({ ov, onMouseDown, isSelected, onDelete }) {
  return (
    <div
      className={`absolute cursor-move group select-none ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      style={{ left: ov.x, top: ov.y, width: ov.w, height: ov.h }}
      onMouseDown={onMouseDown}
    >
      <img src={ov.dataUrl} className="w-full h-full object-contain pointer-events-none" alt="sig" />

      {/* Handles (Visual only for now, simple resize via corner implemented in logic) */}
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 cursor-nwse-resize" />

      {/* Delete Button */}
      {isSelected && (
        <button
          onMouseDown={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

export default function SignatureTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([]) // { canvas, width, height }
  const [sigDataUrl, setSigDataUrl] = useState(null)
  const [overlays, setOverlays] = useState([]) // { page, x, y, w, h, dataUrl }
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [showDrawPad, setShowDrawPad] = useState(false)

  const [busy, setBusy] = useState(false)
  const [outputFileName, setOutputFileName] = useState('')
  const dragRef = useRef(null)

  // Drag Logic
  useEffect(() => {
    function onMove(e) {
      if (!dragRef.current) return
      const { type, idx, startX, startY, startW, startH, page } = dragRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      setOverlays(prev => {
        const copy = [...prev]
        if (!copy[idx]) return prev // Safety

        const item = { ...copy[idx] }
        if (type === 'move') {
          // Clamp to page bounds? For now allow loose
          item.x = startX + dx - copy[`_pageOffsetX${page}`] // We stored offset in ref or state? 
          // Re-calculate simplistic drag: we need original X/Y relative to page
          // Better: New X = StartItemX + dx
          item.x = dragRef.current.startItemX + dx
          item.y = dragRef.current.startItemY + dy
        } else if (type === 'resize') {
          // Corner resize
          const newW = Math.max(20, startW + dx)
          // Maintain aspect ratio?
          const ratio = startW / startH
          item.w = newW
          item.h = newW / ratio
        }
        copy[idx] = item
        return copy
      })
    }
    function onUp() { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  async function onFile(files) {
    const f = files[0]
    if (!f || !f.type.includes('pdf')) return
    setFile(f)
    setBusy(true)
    setOutputFileName(getDefaultFilename(f, '_signed'))

    try {
      const array = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: array }).promise
      const pgs = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.0 }) // Render at 1.0, display css width 100%
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        pgs.push({ canvas, width: viewport.width, height: viewport.height })
      }
      setPages(pgs)
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  function onSigUpload(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => setSigDataUrl(r.result)
    r.readAsDataURL(f)
  }

  function addOverlay(pageIndex) {
    if (!sigDataUrl) { setShowDrawPad(true); return; }
    const page = pages[pageIndex]
    const w = 150
    const h = 60 // Rough aspect ratio
    // Center
    const x = (page.width - w) / 2
    const y = (page.height - h) / 2

    const newIdx = overlays.length
    setOverlays(prev => [...prev, { page: pageIndex, x, y, w, h, dataUrl: sigDataUrl }])
    setSelectedIdx(newIdx)
  }

  function startDrag(e, idx, type = 'move') {
    e.stopPropagation()
    const ov = overlays[idx]
    setSelectedIdx(idx)
    dragRef.current = {
      type,
      idx,
      startX: e.clientX,
      startY: e.clientY,
      startItemX: ov.x,
      startItemY: ov.y,
      startW: ov.w,
      startH: ov.h,
      page: ov.page
    }
  }

  async function exportSigned() {
    if (!file) return
    setBusy(true)
    try {
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)

      // Cache embedded images to avoid re-embedding same signature multiple times
      const embedCache = {} // dataUrl -> embeddedImage

      for (const ov of overlays) {
        const page = pdf.getPages()[ov.page]
        const { width: pdfW, height: pdfH } = page.getSize()

        let embedded = embedCache[ov.dataUrl]
        if (!embedded) {
          const imgBytes = await (await fetch(ov.dataUrl)).arrayBuffer()
          const isPng = ov.dataUrl.startsWith('data:image/png')
          embedded = isPng ? await pdf.embedPng(imgBytes) : await pdf.embedJpg(imgBytes)
          embedCache[ov.dataUrl] = embedded
        }

        // Coordinates:
        // DOM: Top-Left (0,0) is top-left.
        // PDF: Bottom-Left (0,0) is bottom-left.

        // Scale factor if displayed canvas != pdf point size
        // We rendered canvas at viewport Scale 1.0 (72DPI usually)
        // PDF-Lib uses 72DPI points. So 1:1 usually works if we used standard viewport.
        // Let's assume 1:1 for simplicity since we used scale 1.0

        const x = ov.x
        // PDF Y = PageHeight - DOM Y - ImageHeight
        const y = pdfH - ov.y - ov.h

        page.drawImage(embedded, { x, y, width: ov.w, height: ov.h })
      }

      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_signed')
      a.click()
      URL.revokeObjectURL(url)
      triggerConfetti()
    } catch (e) {
      console.error(e)
      alert('Error: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout title="Sign PDF" description={t('signature.desc', 'Add digital signatures to your PDF documents')}>
      {showDrawPad && <SignatureModal onSave={(d) => { setSigDataUrl(d); setShowDrawPad(false) }} onCancel={() => setShowDrawPad(false)} />}

      {!file ? (
        <FileDropZone onFiles={onFile} accept="application/pdf" hint="Upload PDF to sign" />
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar Controls */}
          <div className="w-full lg:w-80 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-4">
            <h3 className="font-bold text-slate-800 mb-4">Signature Source</h3>

            {sigDataUrl ? (
              <div className="mb-6 group relative">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center h-24">
                  <img src={sigDataUrl} className="max-h-full max-w-full" alt="Current Signature" />
                </div>
                <button
                  onClick={() => setSigDataUrl(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setShowDrawPad(true)}
                  className="flex flex-col items-center justify-center gap-2 py-6 bg-blue-50 text-blue-600 rounded-xl border-2 border-transparent hover:border-blue-200 transition-all font-semibold"
                >
                  <PenTool className="w-6 h-6" /> Draw
                </button>
                <label className="flex flex-col items-center justify-center gap-2 py-6 bg-slate-50 text-slate-600 rounded-xl border-2 border-transparent hover:border-slate-200 transition-all font-semibold cursor-pointer">
                  <Upload className="w-6 h-6" /> Upload
                  <input type="file" accept="image/*" onChange={onSigUpload} className="hidden" />
                </label>
              </div>
            )}

            <div className="space-y-4">
              <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="signed" />
              <ActionButtons
                primaryText="Download PDF"
                onPrimary={exportSigned}
                loading={busy}
                disabled={overlays.length === 0}
                icon={Save}
              />
              <button onClick={() => setFile(null)} className="w-full py-2 text-slate-400 font-medium hover:text-slate-600">Cancel</button>
            </div>
          </div>

          {/* Document Preview */}
          <div className="flex-1 w-full bg-slate-100 rounded-2xl border border-slate-200 p-8 min-h-[600px] flex flex-col items-center gap-8">
            {pages.map((p, i) => (
              <div key={i} className="relative shadow-xl group">
                {/* Page Canvas */}
                <div ref={el => { if (el && !el.firstChild) el.appendChild(p.canvas) }} className="font-zero" />

                {/* Overlays */}
                {overlays.map((ov, idx) => {
                  if (ov.page !== i) return null
                  return (
                    <Overlay
                      key={idx}
                      ov={ov}
                      isSelected={selectedIdx === idx}
                      onMouseDown={(e) => startDrag(e, idx)}
                      onDelete={() => {
                        setOverlays(prev => prev.filter((_, ix) => ix !== idx))
                        setSelectedIdx(null)
                      }}
                    />
                  )
                })}

                {/* Add Button Overlay */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => addOverlay(i)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm transform hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <PenTool className="w-4 h-4" /> Sign Here
                  </button>
                </div>
                <div className="absolute -left-10 top-0 text-xs font-bold text-slate-400">Page {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
