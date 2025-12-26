import React, { useState, useRef, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCw, RotateCcw, RefreshCw, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react'

export default function RotateTool() {
  const [batchMode, setBatchMode] = useState(false)
  const [batchRotation, setBatchRotation] = useState(90) // 90, 180, 270
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('')

  const errorRef = useRef(null)
  const successRef = useRef(null)

  useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus() }, [errorMsg])
  useEffect(() => { if (successMsg && successRef.current) successRef.current.focus() }, [successMsg])

  async function loadFile(files) {
    const f = files[0]
    if (!f) return

    setErrorMsg('')
    setSuccessMsg('')

    if (!f.type.includes('pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('File too large (max 50MB).')
      return
    }

    try {
      setFile(f)
      setOutputFileName(getDefaultFilename(f, '_rotated'))
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      setPages(new Array(pdf.getPageCount()).fill(false))
      setSuccessMsg(`Loaded ${pdf.getPageCount()} pages successfully!`)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF: ' + err.message)
      setFile(null)
      setPages([])
    }
  }

  function toggle(i) { setPages(prev => prev.map((v, idx) => idx === i ? !v : v)) }
  function selectAll() { setPages(prev => prev.map(() => true)) }
  function deselectAll() { setPages(prev => prev.map(() => false)) }

  async function rotateAll(direction) {
    if (!file) return

    const selectedCount = pages.filter(p => p).length
    if (selectedCount === 0) {
      setErrorMsg('Please select at least one page to rotate.')
      return
    }

    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)

    try {
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const out = await PDFDocument.create()
      const count = src.getPageCount()
      const pagesToCopy = [...Array(count).keys()]
      const copied = await out.copyPages(src, pagesToCopy)

      copied.forEach((p, idx) => {
        const should = pages[idx]
        if (should) {
          const deg = direction === 'cw' ? 90 : 270
          p.setRotation(deg)
        }
        out.addPage(p)
      })

      const outBytes = await out.save()
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_rotated')
      a.click()
      URL.revokeObjectURL(url)

      setSuccessMsg(`Successfully rotated ${selectedCount} page(s) and downloaded!`)
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg('Rotation failed: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  function handleReset() {
    setFile(null)
    setPages([])
    setOutputFileName('')
    setErrorMsg('')
    setSuccessMsg('')
  }

  // Batch processing
  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      onProgress(30)
      const pageCount = pdf.getPageCount()
      for (let i = 0; i < pageCount; i++) {
        const page = pdf.getPage(i)
        page.setRotation({ angle: batchRotation })
        onProgress(30 + (i / pageCount) * 50)
      }
      onProgress(80)
      const pdfBytes = await pdf.save()
      onProgress(95)
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      onProgress(100)
      return blob
    } catch (error) {
      console.error(`Error rotating ${file.name}:`, error)
      throw error
    }
  }

  return (
    <ToolLayout title="Rotate PDF" description="Select specific pages to rotate or rotate all pages at once">

      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${!batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(false)}
        >
          📄 Single PDF
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(true)}
        >
          🔄 Batch Rotate
        </button>
      </div>

      {/* Batch Mode */}
      {batchMode && (
        <UniversalBatchProcessor
          toolName="Rotate PDFs"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".pdf"
          maxFiles={100}
          customOptions={
            <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200">
              <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <RotateCw className="w-4 h-4" /> Rotation Angle
              </div>
              <div className="flex gap-2">
                {[90, 180, 270].map(deg => (
                  <button
                    key={deg}
                    onClick={() => setBatchRotation(deg)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${batchRotation === deg ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">All pages in all PDFs will be rotated by this angle.</p>
            </div>
          }
        />
      )}

      {/* Single File Mode */}
      {!batchMode && (
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5" /> {errorMsg}
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2 mb-6">
                <CheckCircle className="w-5 h-5" /> {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {!file ? (
            <FileDropZone
              onFiles={loadFile}
              accept="application/pdf"
              hint="Upload PDF to rotate pages"
              disabled={busy}
            />
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700">{file.name}</h3>
                    <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • {pages.length} Pages</div>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-700">Select Pages to Rotate</h4>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs font-medium text-blue-600 hover:underline">Select All</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={deselectAll} className="text-xs font-medium text-slate-500 hover:text-slate-700">None</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[400px] overflow-y-auto p-2">
                  {pages.map((selected, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggle(i)}
                      className={`relative aspect-[3/4] rounded-lg border-2 flex items-center justify-center flex-col transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}
                    >
                      <span className={`text-lg font-bold ${selected ? 'text-blue-600' : 'text-slate-300'}`}>{i + 1}</span>
                      {selected && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-end sticky bottom-6 z-10">
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Output Filename</label>
                  <FilenameInput
                    value={outputFileName}
                    onChange={e => setOutputFileName(e.target.value)}
                    placeholder="rotated"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <ActionButtons
                    primaryText="CW (90°)"
                    onPrimary={() => rotateAll('cw')}
                    loading={busy}
                    disabled={pages.filter(p => p).length === 0}
                    icon={RotateCw}
                  />
                  <ActionButtons
                    primaryText="CCW (90°)"
                    onPrimary={() => rotateAll('ccw')}
                    loading={busy}
                    disabled={pages.filter(p => p).length === 0}
                    icon={RotateCcw}
                    secondary
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
