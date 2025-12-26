import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { configurePdfWorker } from '../utils/pdfWorker'
import { motion, AnimatePresence } from 'framer-motion'
import { FileImage, Settings, Check, Download, RefreshCcw } from 'lucide-react'

configurePdfWorker()

export default function PdfToImagesTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(0.92)
  const [outputFileName, setOutputFileName] = useState('')

  async function handleFiles(files) {
    const f = files[0]
    if (!f) return
    setFile(f)
    setOutputFileName(getDefaultFilename(f))
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)

    try {
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      setPages(new Array(pdf.numPages).fill(false)) // Default all unselected
      setSuccessMsg(`Loaded ${pdf.numPages} pages. Select pages to export.`)
    } catch (err) {
      console.error(err)
      setErrorMsg(t('common.error_load', 'Failed to load PDF'))
      setFile(null)
    } finally {
      setBusy(false)
    }
  }

  function toggle(i) {
    setPages(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  function toggleAll() {
    const allSelected = pages.every(p => p)
    setPages(new Array(pages.length).fill(!allSelected))
  }

  async function renderAndDownload() {
    if (!file) return

    const indices = pages.flatMap((v, i) => v ? [i + 1] : [])
    if (indices.length === 0) {
      setErrorMsg('Please select at least one page to export.')
      return
    }

    setBusy(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const toZip = []

      for (const pnum of indices) {
        const page = await pdf.getPage(pnum)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise

        const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg'
        const blob = await new Promise(res =>
          format === 'png' ? canvas.toBlob(res, 'image/png') : canvas.toBlob(res, mimeType, quality)
        )
        toZip.push({ pnum, blob })
      }

      const ext = format === 'png' ? '.png' : format === 'webp' ? '.webp' : '.jpg'

      if (indices.length === 1) {
        const b = toZip[0].blob
        const url = URL.createObjectURL(b)
        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + `_page_${toZip[0].pnum}`, ext)
        a.click()
        URL.revokeObjectURL(url)
        setSuccessMsg(`Exported 1 page as ${format.toUpperCase()}!`)
      } else {
        const zip = new JSZip()
        for (const item of toZip) {
          const arr = await item.blob.arrayBuffer()
          zip.file(`${file.name.replace(/\.pdf$/i, '')}_page_${item.pnum}${ext}`, arr)
        }
        const content = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(content)
        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_pages', '.zip')
        a.click()
        URL.revokeObjectURL(url)
        setSuccessMsg(`Exported ${indices.length} pages as ZIP!`)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Export failed: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  // Same batch logic as before, just wrapped
  const processBatchFile = async (f, onProgress) => {
    try {
      onProgress(10)
      const data = await f.arrayBuffer()
      onProgress(20)
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const numPages = pdf.numPages
      const zip = new JSZip()
      const ext = format === 'png' ? '.png' : format === 'webp' ? '.webp' : '.jpg'

      for (let pnum = 1; pnum <= numPages; pnum++) {
        const page = await pdf.getPage(pnum)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg'
        const blob = await new Promise(res =>
          format === 'png' ? canvas.toBlob(res, 'image/png') : canvas.toBlob(res, mimeType, quality)
        )
        zip.file(`page_${pnum}${ext}`, await blob.arrayBuffer())
        onProgress(30 + (pnum / numPages) * 60)
      }
      onProgress(90)
      return await zip.generateAsync({ type: 'blob' })
    } catch (err) { throw new Error(err.message) }
  }

  return (
    <ToolLayout title="PDF to Images" description={t('tool.pdf2imgs_desc', 'Convert PDF pages to high-quality images')}>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${!batchMode ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(false)}
        >
          Single File
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${batchMode ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(true)}
        >
          Batch Mode
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center">
            ✅ {successMsg}
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
            <Settings className="w-5 h-5 text-orange-500" />
            <span>Output Settings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none">
                <option value="png">PNG (Best Quality)</option>
                <option value="jpeg">JPEG (Smaller Size)</option>
                <option value="webp">WEBP (Modern)</option>
              </select>
            </div>
            {format !== 'png' && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Quality: {Math.round(quality * 100)}%</label>
                <input type="range" min="0.5" max="1" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-orange-500" />
              </div>
            )}
          </div>
        </div>

        {batchMode ? (
          <UniversalBatchProcessor
            toolName="PDF to Images"
            processFile={processBatchFile}
            outputExtension=".zip"
            acceptedTypes=".pdf"
          />
        ) : (
          <div>
            {!file ? (
              <FileDropZone onFiles={handleFiles} accept="application/pdf" hint="Upload PDF to convert" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                      <FileImage className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800">{file.name}</h3>
                  </div>
                  <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 font-medium text-sm">Change File</button>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-slate-600">Select pages to export</span>
                    <button onClick={toggleAll} className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1">
                      <RefreshCcw className="w-3 h-3" /> Toggle All
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[400px] overflow-y-auto p-2">
                    {pages.map((s, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggle(i)}
                        className={`aspect-[3/4] flex items-center justify-center rounded-lg border-2 transition-all font-medium text-sm relative ${s ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300'}`}
                      >
                        {i + 1}
                        {s && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col gap-4 max-w-2xl mx-auto w-full sticky bottom-4 z-10">
                  <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="images_extracted" />
                  <ActionButtons
                    primaryText={`Export as ${format.toUpperCase()}`}
                    onPrimary={renderAndDownload}
                    loading={busy}
                    disabled={pages.filter(p => p).length === 0}
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
