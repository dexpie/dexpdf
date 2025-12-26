import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { Scissors, RefreshCcw, Check, Square, X, RotateCw, File } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultPage from '../components/common/ResultPage'

export default function SplitTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [rotations, setRotations] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [rangeInput, setRangeInput] = useState('')

  async function handleFileChange(files) {
    setErrorMsg(''); setSuccessMsg('');
    const f = files[0]
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('File harus PDF.')
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar (maks 50MB).')
      return
    }
    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_extracted'))
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const count = pdf.getPageCount()
      setPages(new Array(count).fill(false))
      setRotations(new Array(count).fill(0))
    } catch (err) {
      console.error(err)
      setErrorMsg('Gagal memuat PDF.')
    }
  }

  function toggle(i) {
    setPages(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  function rotate(i) {
    setRotations(prev => prev.map((r, idx) => idx === i ? (r + 90) % 360 : r))
  }

  function handleRangeSelect() {
    if (!rangeInput) return
    const newPages = new Array(pages.length).fill(false)
    const parts = rangeInput.split(',')

    parts.forEach(part => {
      const p = part.trim()
      if (p.includes('-')) {
        const [start, end] = p.split('-').map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i > 0 && i <= pages.length) newPages[i - 1] = true
          }
        }
      } else {
        const num = Number(p)
        if (!isNaN(num) && num > 0 && num <= pages.length) {
          newPages[num - 1] = true
        }
      }
    })
    setPages(newPages)
  }

  const selectAll = () => setPages(new Array(pages.length).fill(true))
  const deselectAll = () => setPages(new Array(pages.length).fill(false))
  const invertSelection = () => setPages(prev => prev.map(p => !p))

  async function exportSelected() {
    if (!file) return
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const bytes = await file.arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const indices = pages.flatMap((v, i) => v ? [i] : [])
      if (indices.length === 0) { setErrorMsg('Pilih halaman yang ingin diekspor.'); setBusy(false); return }
      const out = await PDFDocument.create()
      const copied = await out.copyPages(src, indices)
      copied.forEach((p, idx) => {
        out.addPage(p)
        const originalIndex = indices[idx]
        const deg = rotations[originalIndex] || 0
        if (deg) {
          p.setRotation(deg)
        }
      })
      const outBytes = await out.save()
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'extracted')
      a.click()
      setDownloadUrl(url)
      // URL.revokeObjectURL(url) 
      setSuccessMsg('Pages Extracted');
      triggerConfetti();
    } catch (err) { console.error(err); setErrorMsg('Gagal: ' + (err.message || err)); }
    finally { setBusy(false) }
  }

  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      onProgress(30)
      const newPdf = await PDFDocument.create()
      const [firstPage] = await newPdf.copyPages(pdf, [0])
      newPdf.addPage(firstPage)
      onProgress(70)
      const pdfBytes = await newPdf.save()
      onProgress(90)
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      onProgress(100)
      return blob
    } catch (error) {
      console.error(`Error splitting ${file.name}:`, error)
      throw error
    }
  }

  return (
    <ToolLayout title="Split PDF" description={t('tool.split_desc', 'Extract pages from your PDF documents')}>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${!batchMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(false)}
        >
          Single PDF
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${batchMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(true)}
        >
          Batch Split
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          toolName="Split PDFs"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".pdf"
          maxFiles={100}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg ? (
            <ResultPage
              title="Pages Extracted Successfully!"
              description="Your separated pages are ready to download."
              downloadUrl={downloadUrl}
              downloadFilename={getOutputFilename(outputFileName, 'extracted')}
              sourceFile={file}
              toolId="split"
              onReset={() => {
                setFile(null);
                setPages([]);
                setRotations([]);
                setOutputFileName('');
                setSuccessMsg('');
                setDownloadUrl(null);
              }}
            />
          ) : null}

          {!successMsg && !file ? (
            <FileDropZone
              onFiles={handleFileChange}
              accept="application/pdf"
              disabled={busy}
              hint="Upload PDF to extract pages"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              {/* File Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                    <File className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{file.name}</h3>
                    <div className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {pages.length} Pages</div>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPages([]); setRotations([]); setOutputFileName(''); }} className="text-red-500 hover:text-red-700 font-medium text-sm">
                  Change File
                </button>
              </div>

              {/* Selection Controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-sm font-semibold text-slate-700">Range:</span>
                  <input
                    type="text"
                    placeholder="e.g. 1-5, 8, 11-13"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full md:w-48 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                  <button onClick={handleRangeSelect} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-900">Apply</button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={selectAll} className="text-xs font-medium px-3 py-1.5 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-700">All</button>
                  <button onClick={deselectAll} className="text-xs font-medium px-3 py-1.5 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-700">None</button>
                  <button onClick={invertSelection} className="text-xs font-medium px-3 py-1.5 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-700">Invert</button>
                </div>
              </div>

              {/* Pages Grid */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {pages.map((selected, i) => (
                    <motion.div
                      key={i}
                      layout
                      onClick={() => !busy && toggle(i)}
                      className={`aspect-[3/4] relative cursor-pointer rounded-xl border-2 transition-all group overflow-hidden ${selected ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-slate-200 bg-white hover:border-red-300'}`}
                    >
                      <div className="absolute top-2 left-2 z-10">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${selected ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                        <div
                          className="w-full h-full bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-slate-300"
                          style={{ transform: `rotate(${rotations[i]}deg)`, transition: 'transform 0.3s' }}
                        >
                          <span className="text-xs font-bold">P {i + 1}</span>
                        </div>
                      </div>

                      <button
                        className="absolute bottom-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors z-20 opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); rotate(i); }}
                        title="Rotate Page"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col gap-4 max-w-2xl mx-auto w-full sticky bottom-4 z-10">
                <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="extracted_pages" />
                <ActionButtons
                  primaryText={`Export ${pages.filter(Boolean).length} Selected Pages`}
                  onPrimary={exportSelected}
                  loading={busy}
                  disabled={!pages.some(Boolean)}
                />
              </div>
            </motion.div>
          )}
        </div>
      )}
      {/* Feature Info */}
      <div className="grid md:grid-cols-3 gap-8 mt-16 px-4">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
            <Scissors className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Precise Control</h3>
          <p className="text-sm text-slate-500">Select individual pages or define ranges (e.g. 1-5, 10). You are in control.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <RefreshCcw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Visual Orientation</h3>
          <p className="text-sm text-slate-500">Rotate pages before extracting them to ensure your new document is perfect.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <File className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Instant Preview</h3>
          <p className="text-sm text-slate-500">See thumbnails of every page. Never split the wrong content again.</p>
        </div>
      </div>
    </ToolLayout>
  )
}
