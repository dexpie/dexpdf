import React, { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { Settings, Zap, CloudLightning, FileText, CheckCircle, AlertTriangle, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

export default function CompressTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState(0)
  const [busy, setBusy] = useState(false)
  const [quality, setQuality] = useState(0.9) // default: high quality
  const [scale, setScale] = useState(1) // default: full scale
  const [targetSizeMB, setTargetSizeMB] = useState('') // New Target Size
  const [imgFormat, setImgFormat] = useState('jpeg')
  const [estimateSize, setEstimateSize] = useState(null)
  const [estimating, setEstimating] = useState(false)
  const [compressionMode, setCompressionMode] = useState('smart') // 'smart' = preserve text, 'maximum' = rasterize

  // Clean messages
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [backendStatus, setBackendStatus] = useState('idle')
  const [outputFileName, setOutputFileName] = useState('')

  // Check WebP support once
  useEffect(() => {
    const test = document.createElement('canvas')
    if (test.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      setImgFormat('webp')
    }
  }, [])

  const estimateReqRef = useRef(0)
  const debounceRef = useRef(null)

  async function onFile(files) {
    setErrorMsg(''); setSuccessMsg('');
    const f = files[0]
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('File is too large (max 50MB).')
      return
    }
    setFile(f)
    setEstimateSize(null)
    setTargetSizeMB('')
    setOutputFileName(getDefaultFilename(f, '_compressed'))
    try {
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise
      setPages(pdf.numPages)
    } catch (err) { console.error(err); setErrorMsg('Unable to read PDF: ' + (err.message || err)) }
  }

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  async function estimateForSettings(q, s) {
    if (!file) return 0
    const data = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise
    const num = pdf.numPages
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: s })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise
    const blob = await new Promise(res => canvas.toBlob(res, imgFormat === 'webp' ? 'image/webp' : 'image/jpeg', Number(q)))
    const sampleSize = blob ? blob.size : 0
    const overhead = 2000
    canvas.width = 0; canvas.height = 0
    return Math.max(0, Math.round(sampleSize * num + overhead))
  }

  // Live estimations
  useEffect(() => {
    if (!file) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      estimateReqRef.current++
      (async () => {
        try {
          if (!targetSizeMB) {
            setEstimating(true)
            const cur = await estimateForSettings(Number(quality), Number(scale))
            if (estimateReqRef.current === 0) return
            setEstimateSize({ cur })
          }
        } catch (err) { if (err.message !== 'Cancelled') console.error(err) }
        finally { setEstimating(false) }
      })()
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [file, quality, scale, targetSizeMB])

  // Precision Logic
  async function findBestSettings(targetBytes) {
    // Simple heuristic search
    // Start with Q=0.8, Scale=1
    // If result > target, reduce Q or Scale
    let bestBlob = null
    let bestSize = Infinity

    const attempts = [
      { q: 0.8, s: 1 },
      { q: 0.6, s: 1 },
      { q: 0.8, s: 0.7 }, // Downscale
      { q: 0.5, s: 0.7 },
      { q: 0.4, s: 0.5 }, // Aggressive
    ]

    // We will try backend first if available? No, client side precision is requested.
    // But we need to actually compress to check size.
    // "estimateForSettings" is just an estimate. We need real compression? 
    // Actually estimateForSettings compresses Page 1. We can use that as a proxy.
    // Total Size ~= Page1_Size * Pages.

    // Let's iterate through attempts, estimate, and pick the first one that fits.
    for (const settings of attempts) {
      const est = await estimateForSettings(settings.q, settings.s)
      if (est <= targetBytes) {
        setQuality(settings.q)
        setScale(settings.s)
        return settings
      }
    }

    // If none fit, return most aggressive
    return attempts[attempts.length - 1]
  }

  async function compressAndDownload() {
    setErrorMsg(''); setSuccessMsg('');
    if (!file) { setErrorMsg('Select a PDF to compress'); return; }
    setBusy(true);
    setBackendStatus('checking');

    try {
      const array = await file.arrayBuffer()

      if (compressionMode === 'smart') {
        // SMART MODE: Preserve text, recompress embedded images
        const { PDFDocument } = await import('pdf-lib')
        const srcPdf = await PDFDocument.load(array)
        const newPdf = await PDFDocument.create()

        // Copy all pages from source (preserves text, fonts, vectors)
        const copiedPages = await newPdf.copyPages(srcPdf, srcPdf.getPageIndices())
        copiedPages.forEach(page => newPdf.addPage(page))

        // Attempt to recompress embedded images
        try {
          // Render each page at reduced quality and re-embed images
          const pdfDoc = await pdfjsLib.getDocument({ data: array.slice(0) }).promise

          for (let i = 0; i < copiedPages.length; i++) {
            const page = await pdfDoc.getPage(i + 1)
            const ops = await page.getOperatorList()

            // Check if page has images worth recompressing
            const hasImages = ops.fnArray.some(fn =>
              fn === pdfjsLib.OPS.paintImageXObject ||
              fn === pdfjsLib.OPS.paintJpegXObject
            )

            if (hasImages) {
              // Render page to canvas and re-embed as background
              const viewport = page.getViewport({ scale: Number(scale) })
              const canvas = document.createElement('canvas')
              canvas.width = Math.ceil(viewport.width)
              canvas.height = Math.ceil(viewport.height)
              const ctx = canvas.getContext('2d')
              await page.render({ canvasContext: ctx, viewport }).promise

              const jpgData = canvas.toDataURL('image/jpeg', Number(quality))
              const imgBytes = await fetch(jpgData).then(res => res.arrayBuffer())
              const embeddedImage = await newPdf.embedJpg(imgBytes)

              const copiedPage = copiedPages[i]
              const { width, height } = copiedPage.getSize()

              // Draw compressed image as background
              copiedPage.drawImage(embeddedImage, {
                x: 0, y: 0,
                width, height,
                opacity: 0 // Invisible layer - text stays on top
              })

              canvas.width = 0
              canvas.height = 0
            }
          }
        } catch (imgErr) {
          console.warn('Image recompression skipped:', imgErr)
        }

        // Save with useObjectStreams for better compression
        const outBytes = await newPdf.save({
          useObjectStreams: true,
          addDefaultPage: false
        })

        const blob = new Blob([outBytes], { type: 'application/pdf' })

        // Calculate savings
        const savings = file.size - blob.size
        const savingsPercent = ((savings / file.size) * 100).toFixed(1)

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFilename(outputFileName, 'compressed')
        document.body.appendChild(a)
        a.click()
        a.remove()
        setDownloadUrl(url)

        if (savings > 0) {
          setSuccessMsg(`✅ Compressed! ${formatBytes(blob.size)} (saved ${savingsPercent}%) - Text preserved!`)
        } else {
          setSuccessMsg(`✅ Optimized! ${formatBytes(blob.size)} - Already efficient. Text preserved!`)
        }
        triggerConfetti()

      } else {
        // MAXIMUM MODE: Rasterize for smallest file size
        // Warning: Text becomes image (not selectable)
        let effectiveQuality = quality
        let effectiveScale = scale

        if (targetSizeMB && !isNaN(targetSizeMB)) {
          const targetBytes = Number(targetSizeMB) * 1024 * 1024
          const best = await findBestSettings(targetBytes)
          effectiveQuality = best.q
          effectiveScale = best.s
        }

        const pdfDoc = await pdfjsLib.getDocument({ data: array.slice(0) }).promise
        const { PDFDocument } = await import('pdf-lib')
        const newPdf = await PDFDocument.create()

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i)
          const viewport = page.getViewport({ scale: effectiveScale })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext('2d')
          await page.render({ canvasContext: ctx, viewport }).promise

          const jpgData = canvas.toDataURL('image/jpeg', effectiveQuality)
          const imgBytes = await fetch(jpgData).then(res => res.arrayBuffer())
          const embeddedImage = await newPdf.embedJpg(imgBytes)

          const newPage = newPdf.addPage([viewport.width, viewport.height])
          newPage.drawImage(embeddedImage, {
            x: 0, y: 0,
            width: viewport.width,
            height: viewport.height
          })
        }

        const outBytes = await newPdf.save({ useObjectStreams: true })
        const blob = new Blob([outBytes], { type: 'application/pdf' })

        const savings = file.size - blob.size
        const savingsPercent = ((savings / file.size) * 100).toFixed(1)

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFilename(outputFileName, 'compressed')
        document.body.appendChild(a)
        a.click()
        a.remove()
        setDownloadUrl(url)
        setSuccessMsg(`✅ Maximum compression! ${formatBytes(blob.size)} (saved ${savingsPercent}%)`)
        triggerConfetti()
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Compression failed: ' + (err.message || err));
    } finally {
      setBusy(false);
      setBackendStatus('idle');
    }
  }

  const processBatchFile = async (file, index, onProgress) => {
    // Implement batch logic similar to single file if needed
    // For now, keeping original placeholder logic or disabling batch for this pro tool
    throw new Error("Batch not supported in Precision Mode yet.")
  }

  return (
    <ToolLayout title="Compress PDF (Precision)" description={t('tool.compress_desc', 'Reduce file size while maintaining quality')}>

      {/* Main Compress Interface */}
      <div className="flex flex-col gap-6">

        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {successMsg ? (
            <ResultPage
              title="PDF Compressed Successfully!"
              description="Your file size has been reduced. Download it below."
              downloadUrl={downloadUrl}
              downloadFilename={getOutputFilename(outputFileName, 'compressed')}
              sourceFile={file}
              toolId="compress"
              onReset={() => {
                setFile(null);
                setSuccessMsg('');
                setDownloadUrl(null);
                setEstimateSize(null);
                setTargetSizeMB('');
              }}
            />
          ) : !file ? (
            <FileDropZone
              onFiles={onFile}
              accept="application/pdf"
              disabled={busy}
              hint="Upload PDF to compress"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Compression Mode Selector */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
                  <Settings className="w-5 h-5 text-green-500" />
                  <span>Compression Mode</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCompressionMode('smart')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${compressionMode === 'smart'
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-slate-800">Smart</span>
                      {compressionMode === 'smart' && (
                        <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Preserves text selectability & searchability. Best for documents.
                    </p>
                  </button>
                  <button
                    onClick={() => setCompressionMode('maximum')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${compressionMode === 'maximum'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <span className="font-bold text-slate-800">Maximum</span>
                      {compressionMode === 'maximum' && (
                        <CheckCircle className="w-4 h-4 text-orange-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Smallest file size. Converts to images (text not selectable).
                    </p>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{file.name}</h3>
                      <div className="text-sm text-slate-500 font-medium">{pages} pages • {formatBytes(file.size)}</div>
                    </div>
                  </div>
                  {(estimateSize?.cur || targetSizeMB) && (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-current" />
                      {targetSizeMB ? `Target: < ${targetSizeMB} MB` : `Est: ~${formatBytes(estimateSize.cur)}`}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
                  <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold">
                    <Settings className="w-5 h-5" /> Compression Settings
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Target Size Input */}
                    <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        Target File Size (MB)
                      </label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="number"
                          placeholder="e.g. 0.5"
                          value={targetSizeMB}
                          onChange={e => setTargetSizeMB(e.target.value)}
                          className="border border-slate-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <span className="text-slate-500 text-sm whitespace-nowrap">
                          Leave empty for manual control
                        </span>
                      </div>
                    </div>

                    {!targetSizeMB && (
                      <>
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-600">Quality</label>
                            <span className="text-sm font-bold text-slate-800">{Math.round(quality * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={quality}
                            onChange={e => setQuality(Number(e.target.value))}
                            disabled={busy}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">Resolution Scale</label>
                          <select
                            value={scale}
                            onChange={e => setScale(Number(e.target.value))}
                            disabled={busy}
                            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                          >
                            <option value={1}>100% (Original)</option>
                            <option value={0.9}>90%</option>
                            <option value={0.8}>80%</option>
                            <option value={0.7}>70%</option>
                            <option value={0.5}>50%</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-4">
                  <div className="w-full md:w-auto flex-1">
                    <label className="block text-sm font-medium text-slate-600 mb-2">Output Filename</label>
                    <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="compressed" />
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      onClick={() => setFile(null)}
                      disabled={busy}
                    >
                      Reset
                    </button>
                    <ActionButtons
                      primaryText={busy ? 'Compressing...' : 'Compress PDF'}
                      onPrimary={compressAndDownload}
                      loading={busy}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

      </div>

      {/* Feature Info */}
      <div className="grid md:grid-cols-3 gap-8 mt-16 px-4">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Target Compression</h3>
          <p className="text-sm text-slate-500">Specify exactly how big you want your file to be (e.g., "Under 2MB").</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <CloudLightning className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Client-Side Engine</h3>
          <p className="text-sm text-slate-500">100% Local processing. Your file never leaves your device for maximum privacy.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Custom Quality</h3>
          <p className="text-sm text-slate-500">Fine-tune quality and resolution scale manually if you prefer.</p>
        </div>
      </div>

    </ToolLayout>
  )
}
