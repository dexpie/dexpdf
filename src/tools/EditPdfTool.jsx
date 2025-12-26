import React, { useState } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import EditorCanvas from '../components/pdf-editor/EditorCanvas'
import { useTranslation } from 'react-i18next'
import { Type, Image as ImageIcon, MousePointer2, Save, X, Trash2, Check, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { configurePdfWorker } from '../utils/pdfWorker'

configurePdfWorker()

export default function EditPdfTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)

  // Editor State
  const [elements, setElements] = useState([]) // { id, type, x, y, content, ... }
  const [selectedId, setSelectedId] = useState(null)

  const [busy, setBusy] = useState(false)
  const [outputFileName, setOutputFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Current Page (MVP: Single page editing support first, usually page 1)
  const [pageIndex, setPageIndex] = useState(1)

  async function handleFileChange(files) {
    const f = files[0]
    if (!f) return
    setFile(f)
    setElements([])
    setOutputFileName(getDefaultFilename(f, '_edited'))
    setErrorMsg('')
    setSuccessMsg('')
  }

  // --- Element Management ---

  const addText = () => {
    const newEl = {
      id: uuidv4(),
      type: 'text',
      x: 50, // Default positions
      y: 50,
      content: 'Type here',
      fontSize: 24,
      color: '#000000'
    }
    setElements(prev => [...prev, newEl])
    setSelectedId(newEl.id)
  }

  const addImage = (e) => {
    const imgFile = e.target.files?.[0]
    if (!imgFile) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const newEl = {
        id: uuidv4(),
        type: 'image',
        x: 100,
        y: 100,
        content: loadEvent.target.result, // Data URL
        width: 150,
        file: imgFile // Keep original file for better embedding quality if needed
      }
      setElements(prev => [...prev, newEl])
      setSelectedId(newEl.id)
    }
    reader.readAsDataURL(imgFile)
  }

  const updateElement = (id, updates) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const deleteElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // --- Saving Logic ---

  async function applyEdits() {
    if (!file) return
    setBusy(true); setErrorMsg(''); setSuccessMsg('')

    try {
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)
      const pages = pdf.getPages()
      const font = await pdf.embedFont(StandardFonts.Helvetica)

      // We are editing valid 1-indexed pageIndex, so array index is pageIndex - 1
      const p = pages[pageIndex - 1]
      const { width, height } = p.getSize()

      // The Canvas renders at scale 1.5
      // Canvas Dimensions = width * 1.5, height * 1.5
      const scale = 1.5

      for (const el of elements) {
        // Coordinate Conversion
        // Canvas (Top-Left) -> PDF (Bottom-Left)
        // PDF_X = Canvas_X / Scale
        // PDF_Y = Height - (Canvas_Y / Scale) - ElementHeight (approx)

        // Note: react-draggable gives x/y of Top-Left corner of element relative to container.

        const pdfX = el.x / scale

        if (el.type === 'text') {
          // For text, PDF draws from bottom-left of text baseline usually.
          // Approximating Text positioning. 
          // height - (y / scale) - fontSize (roughly)
          const pdfY = height - (el.y / scale) - (el.fontSize || 24) + 6 // Adjust baseline offset

          p.drawText(el.content, {
            x: pdfX,
            y: pdfY,
            size: (el.fontSize || 24) / 1.3, // Heuristic correction
            font,
            color: rgb(0, 0, 0)
          })
        } else if (el.type === 'image') {
          const imgBuf = await fetch(el.content).then(res => res.arrayBuffer())
          const isPng = el.content.startsWith('data:image/png')
          const img = isPng ? await pdf.embedPng(imgBuf) : await pdf.embedJpg(imgBuf)

          const w = el.width / scale
          const h = (el.width / (img.width / img.height)) / scale // Maintain aspect ratio

          // PDF Y is bottom-up, needing to subtract height
          const pdfY = height - (el.y / scale) - h

          p.drawImage(img, {
            x: pdfX,
            y: pdfY,
            width: w,
            height: h
          })
        }
      }

      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_edited')
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg('Edits applied successfully!')
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to save PDF: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  const selectedEl = elements.find(el => el.id === selectedId)

  return (
    <ToolLayout title="Edit PDF" description={t('tool.edit_desc', 'Interact visually with your PDF: Add text, images, and shapes.')}>
      <div className="max-w-7xl mx-auto">
        {!file ? (
          <FileDropZone
            onFiles={handleFileChange}
            accept="application/pdf"
            disabled={busy}
            hint="Upload PDF to start visual editing"
          />
        ) : (
          <div className="flex flex-col gap-6">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xl sticky top-4 z-40 backdrop-blur-md bg-white/90">
              <div className="flex gap-2">
                <button
                  onClick={addText}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors"
                >
                  <Type size={18} />
                  <span>Add Text</span>
                </button>
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 transition-colors cursor-pointer">
                  <ImageIcon size={18} />
                  <span>Add Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={addImage} />
                </label>
              </div>

              <div className="flex items-center gap-4">
                {/* Properties Panel for Selected Item */}
                <AnimatePresence>
                  {selectedEl && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />

                      {selectedEl.type === 'text' && (
                        <>
                          <input
                            type="text"
                            value={selectedEl.content}
                            onChange={e => updateElement(selectedEl.id, { content: e.target.value })}
                            className="border-slate-200 border rounded-lg px-2 py-1 text-sm w-32 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={selectedEl.fontSize}
                              onChange={e => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                              className="border-slate-200 border rounded-lg px-2 py-1 text-sm w-16 text-center"
                              min={8} max={72}
                            />
                            <span className="text-xs text-slate-400 font-bold">PX</span>
                          </div>
                        </>
                      )}

                      {selectedEl.type === 'image' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">WIDTH</span>
                          <input
                            type="number"
                            value={selectedEl.width}
                            onChange={e => updateElement(selectedEl.id, { width: Number(e.target.value) })}
                            className="border-slate-200 border rounded-lg px-2 py-1 text-sm w-20 text-center"
                            min={20} max={1000}
                          />
                        </div>
                      )}

                      <button onClick={() => deleteElement(selectedEl.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 ml-auto">
                <button className="text-slate-400 hover:text-red-500 px-4 py-2 text-sm font-bold" onClick={() => setFile(null)}>Close</button>
                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                <div className="flex gap-2">
                  <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="edited" className="w-32" />
                  <button
                    onClick={applyEdits}
                    disabled={busy}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                  >
                    {busy ? 'Saving...' : <><Save className="w-4 h-4" /> Save PDF</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="relative bg-slate-100 rounded-3xl p-8 min-h-[800px] overflow-auto flex justify-center items-start border border-slate-200 shadow-inner">
              <EditorCanvas
                file={file}
                pageIndex={pageIndex}
                elements={elements}
                onUpdateElement={updateElement}
                onSelectElement={setSelectedId}
                onDeleteElement={deleteElement}
                selectedElementId={selectedId}
              />
            </div>

            {/* Messages */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50">
                  <X className="w-5 h-5" /> {errorMsg}
                </motion.div>
              )}
              {successMsg && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50">
                  <Check className="w-5 h-5" /> {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </div>
    </ToolLayout>
  )
}
