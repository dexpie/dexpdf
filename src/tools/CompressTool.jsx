import React, { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { Settings, Zap, CloudLightning, FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

export default function CompressTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState(0)
  const [busy, setBusy] = useState(false)
  const [quality, setQuality] = useState(0.9) // default: high quality
  const [scale, setScale] = useState(1) // default: full scale
  const [imgFormat, setImgFormat] = useState('jpeg')
  const [estimateSize, setEstimateSize] = useState(null)
  const [estimating, setEstimating] = useState(false)

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
      setErrorMsg('File harus PDF.')
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar (maks 50MB).')
      return
    }
    setFile(f)
    setEstimateSize(null)
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
          setEstimating(true)
          const cur = await estimateForSettings(Number(quality), Number(scale))
          if (estimateReqRef.current === 0) return
          setEstimateSize({ cur })
        } catch (err) { if (err.message !== 'Cancelled') console.error(err) }
        finally { setEstimating(false) }
      })()
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [file, quality, scale])

  async function compressAndDownload() {
    setErrorMsg(''); setSuccessMsg('');
    if (!file) { setErrorMsg('Select a PDF to compress'); return; }
    setBusy(true);
    setBackendStatus('checking');
    try {
      try {
        await fetch('https://dexpdfbackend-production.up.railway.app/', { method: 'GET' });
        setBackendStatus('online');
      } catch {
        setBackendStatus('sleeping');
      }
      const formData = new FormData();
      formData.append('pdf', file);
      const response = await fetch('https://dexpdfbackend-production.up.railway.app/compress', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Compression failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getOutputFilename(outputFileName, 'compressed');
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDownloadUrl(url);
      // window.URL.revokeObjectURL(url);
      setSuccessMsg('Berhasil! File terdownload.');
      triggerConfetti();
    } catch (err) {
      console.error(err);
      setErrorMsg('Compression failed: ' + (err.message || err));
    } finally {
      setBusy(false);
      setBackendStatus('idle');
    }
  }

  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)
      const formData = new FormData()
      formData.append('pdf', file)
      onProgress(30)
      const response = await fetch('https://dexpdfbackend-production.up.railway.app/compress', {
        method: 'POST',
        body: formData,
      })
      onProgress(70)
      if (!response.ok) throw new Error(`Compression failed: ${response.statusText}`)
      const blob = await response.blob()
      onProgress(100)
      return blob
    } catch (error) {
      console.error(`Error compressing file ${file.name}:`, error)
      throw error
    }
  }

  return (
    <ToolLayout title="Compress PDF" description={t('tool.compress_desc', 'Reduce file size while maintaining quality')}>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${!batchMode ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(false)}
        >
          Single File
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${batchMode ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(true)}
        >
          Batch Mode
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          toolName="Compress PDF"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".pdf"
          maxFiles={100}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> {errorMsg}
              </motion.div>
            )}

            {backendStatus === 'sleeping' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-orange-50 text-orange-600 p-4 rounded-xl border border-orange-100 flex items-center gap-2">
                <CloudLightning className="w-5 h-5 animate-pulse" /> Waking up the cloud server... please wait a moment.
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
                setPreviewUrl(null);
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
                  {estimateSize?.cur && (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-current" />
                      Est: ~{formatBytes(estimateSize.cur)} ({Math.round(100 - (estimateSize.cur / file.size) * 100)}% ↓)
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
                  <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold">
                    <Settings className="w-5 h-5" /> Compression Settings
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      primaryText={busy ? (backendStatus === 'sleeping' ? 'Waking Server...' : 'Compressing...') : 'Compress PDF'}
                      onPrimary={compressAndDownload}
                      loading={busy}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
      {/* Feature Info */}
      <div className="grid md:grid-cols-3 gap-8 mt-16 px-4">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Custom Quality</h3>
          <p className="text-sm text-slate-500">Fine-tune your compression ratio. Balance perfect quality with smallest file size.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Fast Processing</h3>
          <p className="text-sm text-slate-500">Our advanced algorithms compress files in seconds, right in your browser.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Secure & Private</h3>
          <p className="text-sm text-slate-500">Files are processed locally*. We never store or read your private documents.</p>
        </div>
      </div>
    </ToolLayout>
  )
}
