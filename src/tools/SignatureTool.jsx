import React, { useRef, useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import SignatureCanvas from 'react-signature-canvas'
import { useTranslation } from 'react-i18next'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Upload, Download, Trash2, Move, X, Check, Save, Image, Type, Plus, PenLine, FileText, AlertCircle } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

/**
 * SignatureModal - Draw signature popup
 */
function SignatureModal({ onSave, onCancel, onClear }) {
  const sigRef = useRef()

  const save = () => {
    if (sigRef.current.isEmpty()) return
    onSave(sigRef.current.getTrimmedCanvas().toDataURL('image/png'))
  }

  const handleClear = () => {
    sigRef.current.clear()
    onClear?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-border"
      >
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" /> Draw Signature
          </h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-secondary/50">
          <div className="bg-background rounded-xl border-2 border-dashed border-border shadow-inner overflow-hidden">
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{ width: 500, height: 200, className: 'w-full h-48 cursor-crosshair' }}
              backgroundColor="transparent"
              penColor="#1e293b"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">Sign above using your mouse or touch</p>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2 bg-card">
          <button
            className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary font-medium text-sm transition-colors"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary font-medium text-sm transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
            onClick={save}
          >
            Add Signature
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * SavedSignatures - Component to show saved signatures
 */
function SavedSignatures({ signatures, onSelect, onDelete }) {
  if (signatures.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-foreground mb-2">Saved Signatures</p>
      <div className="flex flex-wrap gap-2">
        {signatures.map((sig, i) => (
          <div key={i} className="relative group">
            <img
              src={sig}
              alt={`Signature ${i + 1}`}
              className="w-24 h-12 object-contain border border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelect(sig)}
            />
            <button
              onClick={() => onDelete(i)}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Overlay - Draggable signature on PDF page
 */
function Overlay({ ov, onMouseDown, isSelected, onDelete, onResize }) {
  return (
    <div
      className={`absolute cursor-move group select-none ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}`}
      style={{ left: ov.x, top: ov.y, width: ov.w, height: ov.h }}
      onMouseDown={onMouseDown}
    >
      <img src={ov.dataUrl} className="w-full h-full object-contain pointer-events-none" alt="signature" />

      {/* Resize Handle */}
      <div
        className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 cursor-nwse-resize"
        onMouseDown={(e) => onResize(e, 'se')}
      />
      <div
        className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 cursor-nesw-resize"
        onMouseDown={(e) => onResize(e, 'sw')}
      />

      {/* Delete Button */}
      {isSelected && (
        <button
          onMouseDown={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute -top-3 -right-3 bg-destructive text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

/**
 * SignatureTool - Add signatures to PDF
 */
export default function SignatureTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [overlays, setOverlays] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [showDrawPad, setShowDrawPad] = useState(false)
  const [savedSignatures, setSavedSignatures] = useState([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')

  const dragRef = useRef(null)

  // Drag logic
  useEffect(() => {
    function onMove(e) {
      if (!dragRef.current) return
      const { type, idx, startX, startY, startW, startH } = dragRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      setOverlays(prev => {
        const copy = [...prev]
        if (!copy[idx]) return prev

        const item = { ...copy[idx] }
        if (type === 'move') {
          item.x = dragRef.current.startItemX + dx
          item.y = dragRef.current.startItemY + dy
        } else if (type === 'resize') {
          const newW = Math.max(30, startW + dx)
          const ratio = startW / startH
          item.w = newW
          item.h = newW / ratio
        }
        copy[idx] = item
        return copy
      })
    }

    function onUp() {
      dragRef.current = null
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  async function onFile(files) {
    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setFile(f)
    setBusy(true)
    setOutputFileName(getDefaultFilename(f, '_signed'))
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const array = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: array }).promise
      const pgs = []

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 50))
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.0 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        pgs.push({ canvas, width: viewport.width, height: viewport.height })
      }
      setPages(pgs)
      setProgress(100)
    } catch (e) {
      console.error(e)
      setErrorMsg('Failed to load PDF: ' + e.message)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  function onSigUpload(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => addSignatureToPage(r.result)
    r.readAsDataURL(f)
  }

  function addSignatureToPage(dataUrl) {
    const page = pages[currentPage]
    if (!page) return

    const newOverlay = {
      dataUrl,
      x: page.width / 2 - 75,
      y: page.height / 2 - 25,
      w: 150,
      h: 50,
      page: currentPage
    }

    setOverlays(prev => [...prev, newOverlay])
    setSelectedIdx(overlays.length)
  }

  function handleDrawSave(signatureDataUrl) {
    addSignatureToPage(signatureDataUrl)
    setSavedSignatures(prev => [...prev, signatureDataUrl])
    setShowDrawPad(false)
  }

  function handleDeleteSignature(idx) {
    setOverlays(prev => prev.filter((_, i) => i !== idx))
    setSelectedIdx(null)
  }

  function startDrag(e, idx, type) {
    e.stopPropagation()
    const item = overlays[idx]
    setSelectedIdx(idx)
    dragRef.current = {
      type,
      idx,
      startX: e.clientX,
      startY: e.clientY,
      startItemX: item.x,
      startItemY: item.y,
      startW: item.w,
      startH: item.h
    }
  }

  async function savePdf() {
    if (!file || overlays.length === 0) {
      setErrorMsg('Please add at least one signature.')
      return
    }

    setBusy(true)
    setErrorMsg('')
    setSuccessMsg('')
    setProgress(0)

    try {
      setProgress(10)
      const array = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(array)

      setProgress(30)
      const outPdf = await PDFDocument.create()
      const pageIndices = pages.map((_, i) => i)
      const copiedPages = await outPdf.copyPages(srcPdf, pageIndices)

      setProgress(50)
      copiedPages.forEach((p, i) => {
        outPdf.addPage(p)
      })

      // Embed signature images
      const signatureUrls = [...new Set(overlays.map(o => o.dataUrl))]
      const embeddedImages = {}

      for (const url of signatureUrls) {
        const response = await fetch(url)
        const blob = await response.blob()
        const bytes = await blob.arrayBuffer()
        const imgType = blob.type.includes('png') ? 'png' : 'jpg'

        if (imgType === 'png') {
          embeddedImages[url] = await outPdf.embedPng(bytes)
        } else {
          embeddedImages[url] = await outPdf.embedJpg(bytes)
        }
      }

      setProgress(70)

      // Add signatures to pages
      overlays.forEach(ov => {
        const page = outPdf.getPages()[ov.page]
        const img = embeddedImages[ov.dataUrl]

        page.drawImage(img, {
          x: ov.x,
          y: page.getHeight() - ov.y - ov.h,
          width: ov.w,
          height: ov.h
        })
      })

      setProgress(90)
      const outBytes = await outPdf.save()
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setDownloadUrl(url)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'pdf')
      a.click()

      setSuccessMsg('PDF signed successfully!')
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to save PDF: ' + err.message)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  const resetFile = () => {
    setFile(null)
    setPages([])
    setCurrentPage(0)
    setOverlays([])
    setSelectedIdx(null)
    setOutputFileName('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
  }

  const currentPageOverlays = overlays.filter(o => o.page === currentPage)
  const hasSignatures = overlays.length > 0

  return (
    <ToolLayout
      title="Sign PDF"
      description="Add your signature to PDF documents"
    >
      <div className="max-w-6xl mx-auto">

        {/* Signature Modal */}
        <AnimatePresence>
          {showDrawPad && (
            <SignatureModal
              onSave={handleDrawSave}
              onCancel={() => setShowDrawPad(false)}
            />
          )}
        </AnimatePresence>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-2 mb-6"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </motion.div>
        )}

        {/* Success State */}
        {successMsg && downloadUrl && (
          <ResultPage
            title="PDF Signed Successfully!"
            description="Your signed PDF is ready to download."
            downloadUrl={downloadUrl}
            downloadFilename={getOutputFilename(outputFileName, 'pdf')}
            sourceFile={{
              name: file?.name || 'signed.pdf',
              size: file?.size || 0,
              type: 'application/pdf'
            }}
            toolId="signature"
            onReset={resetFile}
          />
        )}

        {/* Upload Zone */}
        {!file && (
          <FileDropZone
            onFiles={onFile}
            accept="application/pdf"
            disabled={busy}
            hint="Upload PDF to sign"
          />
        )}

        {/* Editor */}
        {file && pages.length > 0 && !successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Progress Bar */}
            {busy && (
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="font-medium text-foreground">Add Signature:</span>
                <button
                  onClick={() => setShowDrawPad(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  Draw
                </button>
                <label className="px-4 py-2 bg-secondary text-foreground rounded-lg font-medium text-sm hover:bg-muted transition-colors cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Image
                  <input type="file" accept="image/*" onChange={onSigUpload} className="hidden" />
                </label>
              </div>

              {hasSignatures && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {overlays.length} signature{overlays.length > 1 ? 's' : ''} added
                  </span>
                  <button
                    onClick={() => { setOverlays([]); setSelectedIdx(null); }}
                    className="px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Saved Signatures */}
            <SavedSignatures
              signatures={savedSignatures}
              onSelect={addSignatureToPage}
              onDelete={(i) => setSavedSignatures(prev => prev.filter((_, idx) => idx !== i))}
            />

            {/* PDF Viewer with Signatures */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              {/* Page Navigation */}
              {pages.length > 1 && (
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1.5 text-sm font-medium bg-secondary rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {pages.length}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                    disabled={currentPage === pages.length - 1}
                    className="px-3 py-1.5 text-sm font-medium bg-secondary rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* PDF Page with Overlays */}
              <div className="relative overflow-auto flex justify-center p-4 bg-secondary/30 min-h-[400px]">
                <div className="relative bg-card shadow-lg" style={{ width: pages[currentPage]?.width, height: pages[currentPage]?.height, transform: 'scale(0.6)', transformOrigin: 'top center' }}>
                  {/* Rendered PDF Page */}
                  <canvas
                    ref={el => {
                      if (el && pages[currentPage]) {
                        const ctx = el.getContext('2d')
                        el.width = pages[currentPage].width
                        el.height = pages[currentPage].height
                        ctx.drawImage(pages[currentPage].canvas, 0, 0)
                      }
                    }}
                    className="absolute inset-0"
                  />

                  {/* Signature Overlays */}
                  {currentPageOverlays.map((ov, i) => {
                    const actualIdx = overlays.findIndex(o => o.page === currentPage && o === ov)
                    return (
                      <Overlay
                        key={actualIdx}
                        ov={ov}
                        isSelected={selectedIdx === actualIdx}
                        onMouseDown={(e) => startDrag(e, actualIdx, 'move')}
                        onDelete={() => handleDeleteSignature(actualIdx)}
                        onResize={(e, dir) => startDrag(e, actualIdx, 'resize')}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-card rounded-2xl border border-border shadow-lg p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilenameInput
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  disabled={busy}
                  placeholder="signed"
                  label="Output Filename"
                />

                <div className="flex items-end">
                  <button
                    onClick={resetFile}
                    disabled={busy}
                    className="w-full px-5 py-2.5 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl border border-border transition-colors disabled:opacity-50"
                  >
                    Choose Different File
                  </button>
                </div>
              </div>

              <button
                onClick={savePdf}
                disabled={busy || !hasSignatures}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving... {progress}%
                  </>
                ) : (
                  <>
                    <PenLine className="w-5 h-5" />
                    Save Signed PDF
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}
