import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { FileText, X, ArrowUp, ArrowDown, File } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

export default function MergeTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('merged')

  async function handleFiles(newFiles) {
    setErrorMsg(''); setSuccessMsg('');
    const list = Array.from(newFiles)
    const loaded = []
    for (const f of list) {
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Semua file harus PDF.');
        continue;
      }
      if (f.size > 50 * 1024 * 1024) {
        setErrorMsg('Ukuran file terlalu besar (maks 50MB).');
        continue;
      }
      const thumb = await generatePdfThumbnail(f)
      loaded.push({ file: f, thumb })
    }
    setFiles(prev => prev.concat(loaded))
  }

  async function merge() {
    if (!files.length) return
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const merged = await PDFDocument.create()
      for (const entry of files) {
        const f = entry.file
        const bytes = await f.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const copied = await merged.copyPages(pdf, pdf.getPageIndices())
        copied.forEach(p => merged.addPage(p))
      }
      const out = await merged.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'merged')
      a.click()
      setDownloadUrl(url)
      // Auto download for convenience
      a.click()
      // URL.revokeObjectURL(url) // kept alive for ResultPage

      triggerConfetti();
      setSuccessMsg('PDF Merged'); // Just a flag to switch view
    } catch (err) {
      console.error(err)
      setErrorMsg('Gagal menggabungkan: ' + (err.message || err));
    } finally { setBusy(false) }
  }

  function remove(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  function moveUp(i) {
    setFiles(prev => {
      if (i <= 0) return prev
      const copy = prev.slice()
      const t = copy[i - 1]
      copy[i - 1] = copy[i]
      copy[i] = t
      return copy
    })
  }

  function moveDown(i) {
    setFiles(prev => {
      if (i >= prev.length - 1) return prev
      const copy = prev.slice()
      const t = copy[i + 1]
      copy[i + 1] = copy[i]
      copy[i] = t
      return copy
    })
  }

  async function generatePdfThumbnail(file) {
    try {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      return canvas.toDataURL('image/png')
    } catch (err) {
      return null
    }
  }

  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)
      const bytes = await file.arrayBuffer()
      onProgress(30)
      const pdf = await PDFDocument.load(bytes)
      onProgress(60)
      const optimized = await pdf.save()
      onProgress(90)
      const blob = new Blob([optimized], { type: 'application/pdf' })
      onProgress(100)
      return blob
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error)
      throw error
    }
  }

  return (
    <ToolLayout title="Merge PDF" description={t('tool.merge_desc', 'Combine multiple PDFs into one')}>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${!batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(false)}
        >
          Merge Multiple
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(true)}
        >
          Batch Optimize
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          toolName="Optimize PDFs"
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
              title={t('tool.merge_success', 'PDFs Merged Successfully!')}
              description={t('tool.merge_download_desc', 'Your merged PDF is ready. Download it below or continue with other tools.')}
              downloadUrl={downloadUrl}
              downloadFilename={getOutputFilename(outputFileName, 'merged')}
              sourceFile={{ name: `${files.length} files merged`, size: files.reduce((acc, f) => acc + f.size, 0), type: 'application/pdf' }}
              toolId="merge"
              onReset={() => {
                setFiles([]);
                setSuccessMsg('');
                setDownloadUrl(null);
              }}
            />
          ) : (
            <>
              <FileDropZone
                onFiles={handleFiles}
                accept="application/pdf"
                multiple
                disabled={busy}
                hint="Upload multiple PDFs to merge"
              />

              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
                >
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Selected Files ({files.length})
                  </h3>

                  <div className="space-y-3 mb-8">
                    <AnimatePresence>
                      {files.map((entry, i) => (
                        <motion.div
                          key={entry.file.name + i} // Better key if possible
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 transition-colors group"
                        >
                          <div className="w-12 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {entry.thumb ? (
                              <img src={entry.thumb} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <File className="w-6 h-6 text-slate-300" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-700 truncate">{entry.file.name}</div>
                            <div className="text-xs text-slate-400">{(entry.file.size / 1024).toFixed(1)} KB</div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => moveUp(i)}
                              disabled={i === 0}
                              className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveDown(i)}
                              disabled={i === files.length - 1}
                              className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => remove(i)}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-end gap-4">
                    <div className="w-full md:w-auto flex-1">
                      <label className="block text-sm font-medium text-slate-600 mb-2">Output Filename</label>
                      <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="merged" />
                    </div>
                    <div className="w-full md:w-auto">
                      <ActionButtons
                        primaryText={busy ? 'Merging...' : 'Merge PDF'}
                        onPrimary={merge}
                        onSecondary={() => setFiles([])}
                        secondaryText="Reset All"
                        loading={busy}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      )
      }
      {/* Feature Info */}
      <div className="grid md:grid-cols-3 gap-8 mt-16 px-4">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Easy Ordering</h3>
          <p className="text-sm text-slate-500">Drag and drop your files to arrange them in the exact order you want.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <File className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Batch Processing</h3>
          <p className="text-sm text-slate-500">Merge dozens of files at once. Our engine handles large batches effortlessly.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <ArrowDown className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">One-Click Download</h3>
          <p className="text-sm text-slate-500">Get your merged document instantly. No watermarks, no sign-up required.</p>
        </div>
      </div>
    </ToolLayout >
  )
}
