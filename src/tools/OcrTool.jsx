import React, { useState, useRef, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { triggerConfetti } from '../utils/confetti'
import { downloadBlob } from '../utils/fileHelpers'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { Settings, Cloud, Laptop, Zap, CheckCircle, AlertTriangle, Languages, ChevronLeft, ChevronRight, Download, FileText, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

configurePdfWorker()

// 🌍 Advanced OCR Languages
const LANGUAGES = [
  { code: 'eng', name: '🇬🇧 English', popular: true },
  { code: 'ind', name: '🇮🇩 Indonesian', popular: true },
  { code: 'spa', name: '🇪🇸 Spanish', popular: true },
  { code: 'fra', name: '🇫🇷 French', popular: true },
  { code: 'deu', name: '🇩🇪 German', popular: true },
  { code: 'chi_sim', name: '🇨🇳 Chinese Simplified', popular: true },
  { code: 'jpn', name: '🇯🇵 Japanese', popular: true },
  { code: 'kor', name: '🇰🇷 Korean', popular: true },
  { code: 'ara', name: '🇸🇦 Arabic', popular: true },
  { code: 'por', name: '🇵🇹 Portuguese', popular: true },
  { code: 'rus', name: '🇷🇺 Russian', popular: false },
  { code: 'tha', name: '🇹🇭 Thai', popular: true },
  { code: 'vie', name: '🇻🇳 Vietnamese', popular: true },
]

export default function OcrTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [language, setLanguage] = useState('eng')
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [confidence, setConfidence] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [exportFormat, setExportFormat] = useState('txt')
  const [autoRotate, setAutoRotate] = useState(true)
  const [imageEnhancement, setImageEnhancement] = useState(true)
  const [ocrMode, setOcrMode] = useState('balanced') // fast, balanced, accurate
  const [selectedPage, setSelectedPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [ocrEngine, setOcrEngine] = useState('local') // local (private default), cloud (explicit opt-in)
  const ocrWorkerRef = useRef(null)
  const ocrWorkerKeyRef = useRef('')

  // Optional OCR.space processing through the server proxy.
  const runCloudOCR = async (imageDataUrl) => {
    const formData = new FormData()
    formData.append('base64Image', imageDataUrl)
    formData.append('language', language)
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', autoRotate ? 'true' : 'false')
    formData.append('scale', 'true')
    formData.append('OCREngine', ocrMode === 'accurate' ? '2' : '1')

    try {
      setProgressText('🌩️ Uploading image to OCR.space (cloud mode)...')
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      })

      const rawResponse = await response.text()
      let result = {}
      try {
        result = rawResponse ? JSON.parse(rawResponse) : {}
      } catch {
        result = { ErrorMessage: rawResponse }
      }

      const serviceMessage = Array.isArray(result.ErrorMessage)
        ? result.ErrorMessage.join(', ')
        : result.ErrorMessage || result.ErrorDetails
      if (!response.ok || result.IsErroredOnProcessing) {
        const error = new Error(serviceMessage || `Cloud OCR request failed (${response.status})`)
        error.status = response.status
        throw error
      }

      if (result.ParsedResults && result.ParsedResults[0]) {
        const parsedText = result.ParsedResults[0].ParsedText
        const confidence = result.ParsedResults[0].TextOverlay?.Lines?.length > 0
          ? Math.round(result.ParsedResults[0].TextOverlay.Lines.reduce((acc, line) =>
            acc + (line.Words?.reduce((sum, word) => sum + (word.WordText ? 90 : 0), 0) || 0), 0) /
            (result.ParsedResults[0].TextOverlay.Lines.length || 1))
          : null

        return { text: parsedText, confidence }
      } else {
        throw new Error(serviceMessage || 'Cloud OCR returned no recognized text.')
      }
    } catch (error) {
      console.warn('Cloud OCR failed, falling back to local OCR:', error)
      setProgressText('⚠️ Cloud OCR failed, using local OCR...')
      throw error
    }
  }

  const getLocalOcrWorker = async () => {
    const workerKey = `${language}:${ocrMode}:${autoRotate ? 'auto' : 'fixed'}`
    if (ocrWorkerRef.current && ocrWorkerKeyRef.current === workerKey) {
      return ocrWorkerRef.current
    }

    if (ocrWorkerRef.current) {
      await ocrWorkerRef.current.terminate()
      ocrWorkerRef.current = null
    }

    const { createWorker } = await import('tesseract.js')
    const oem = ocrMode === 'fast' ? 0 : ocrMode === 'accurate' ? 1 : 2
    const worker = await createWorker(language, oem, {
      logger: (message) => {
        if (message.status === 'recognizing text') {
          const percent = Math.floor(message.progress * 100)
          setProgress(percent)
          setProgressText(`Recognizing text... ${percent}%`)
        }
      }
    })
    await worker.setParameters({ tessedit_pageseg_mode: autoRotate ? 1 : 3 })
    ocrWorkerRef.current = worker
    ocrWorkerKeyRef.current = workerKey
    return worker
  }

  const recognizeLocally = async (canvas) => {
    const worker = await getLocalOcrWorker()
    const { data } = await worker.recognize(canvas)
    return { text: data.text, confidence: data.confidence == null ? null : Math.round(data.confidence) }
  }

  // Image preprocessing can improve OCR results on noisy scans.
  const preprocessCanvas = (canvas) => {
    if (!imageEnhancement || ocrMode === 'fast') return canvas
    const processedCanvas = document.createElement('canvas')
    processedCanvas.width = canvas.width
    processedCanvas.height = canvas.height
    const ctx = processedCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, 0)
    const width = canvas.width
    const height = canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Step 1: Sharpening Convolution Matrix (Enhances text edges significantly)
    const sharpenKernel = [
      0, -1,  0,
     -1,  5, -1,
      0, -1,  0
    ];
    
    const side = Math.round(Math.sqrt(sharpenKernel.length));
    const halfSide = Math.floor(side / 2);
    const src = new Uint8ClampedArray(data);
    const w = width;
    const h = height;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dstOff = (y * w + x) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;
            if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
              const srcOff = (scy * w + scx) * 4;
              const wt = sharpenKernel[cy * side + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
            }
          }
        }
        data[dstOff] = r;
        data[dstOff + 1] = g;
        data[dstOff + 2] = b;
      }
    }

    // Step 2: Grayscale & Aggressive Binarization (Otsu's method)
    const grayPixels = []
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      grayPixels.push(gray)
    }

    const histogram = new Array(256).fill(0)
    grayPixels.forEach(g => histogram[g]++)

    const total = grayPixels.length
    let sum = 0
    for (let i = 0; i < 256; i++) sum += i * histogram[i]

    let sumB = 0, wB = 0, wF = 0
    let maxVariance = 0, threshold = 128

    for (let t = 0; t < 256; t++) {
      wB += histogram[t]
      if (wB === 0) continue
      wF = total - wB
      if (wF === 0) break
      sumB += t * histogram[t]
      const mB = sumB / wB
      const mF = (sum - sumB) / wF
      const variance = wB * wF * (mB - mF) * (mB - mF)
      if (variance > maxVariance) {
        maxVariance = variance
        threshold = t
      }
    }

    // Step 3: Pure Black & White Contrast (Binarization)
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      // Any pixel darker than threshold becomes pure black, else pure white.
      // This eliminates 100% of background noise, giving Tesseract perfect letters.
      const isText = grayPixels[j] < (threshold + 15); // Slight bias to keep thin lines
      const color = isText ? 0 : 255;
      data[i] = data[i + 1] = data[i + 2] = color;
    }

    ctx.putImageData(imageData, 0, 0)
    return processedCanvas
  }

  // 📄 Load single image or PDF page
  const loadImageOrPdf = async (inputFile, pageNum = 1) => {
    const targetFile = inputFile || file
    if (!targetFile) return

    setErrorMsg(''); setSuccessMsg(''); setBusy(true)

    try {
      const isPdf = targetFile.type === 'application/pdf'
      let canvas
      let pdfDocument = null
      let imageUrl = null

      if (isPdf) {
        const arrayBuffer = await targetFile.arrayBuffer()
        pdfDocument = await pdfjsLib.getDocument(arrayBuffer).promise
        setTotalPages(pdfDocument.numPages)
        const page = await pdfDocument.getPage(pageNum)
        // Adaptive render scale: aim for ~2400px on the longest side (clamped 1.5x-3x)
        const baseViewport = page.getViewport({ scale: 1 })
        const longestSide = Math.max(baseViewport.width, baseViewport.height)
        const renderScale = Math.min(3, Math.max(1.5, 2400 / longestSide))
        const viewport = page.getViewport({ scale: renderScale })
        canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
      } else {
        setTotalPages(1)
        canvas = document.createElement('canvas')
        const img = new Image()
        await new Promise((resolve, reject) => {
          imageUrl = URL.createObjectURL(targetFile)
          img.onload = resolve; img.onerror = reject; img.src = imageUrl
        })
        
        // Auto-scale up small images to improve Tesseract read rate
        const scaleFactor = img.width < 1200 ? 2 : 1;
        canvas.width = img.width * scaleFactor; 
        canvas.height = img.height * scaleFactor;
        const ctx = canvas.getContext('2d')
        ctx.scale(scaleFactor, scaleFactor);
        ctx.drawImage(img, 0, 0)
      }

       const processedCanvas = preprocessCanvas(canvas)
       setPreviewUrl(processedCanvas.toDataURL())
       await runOcrOnCanvas(processedCanvas, canvas)
    } catch (error) {
      setErrorMsg(`❌ Error loading file: ${error.message}`)
      console.error(error)
    } finally {
      if (pdfDocument) await pdfDocument.destroy().catch(() => {})
      if (imageUrl) URL.revokeObjectURL(imageUrl)
      setBusy(false)
    }
  }

  // 🔍 Advanced OCR with progress tracking (Cloud + Local fallback)
  const runOcrOnCanvas = async (canvas, cloudCanvas = canvas) => {
    setBusy(true); setProgress(0); setProgressText('Initializing OCR...')
    try {
      let result = null
      if (ocrEngine === 'cloud') {
        const imageDataUrl = cloudCanvas.toDataURL('image/jpeg', 0.9)
        result = await runCloudOCR(imageDataUrl)
      }
      if (ocrEngine === 'local') {
        setProgressText('Using local OCR (Tesseract.js)...')
        setProgressText('Recognizing text...')
        result = await recognizeLocally(canvas)
      }

      if (result) {
        setConfidence(result.confidence)
        setText(result.text)
        setSuccessMsg(result.confidence == null ? 'OCR completed.' : `OCR completed. Confidence: ${result.confidence}%`)
        triggerConfetti()
        setProgress(100)
      } else { throw new Error('All OCR engines failed') }
    } catch (error) {
      setErrorMsg(`❌ OCR error: ${error.message}`)
      console.error(error)
    } finally { setBusy(false); setProgressText('') }
  }

  // 📦 Batch processing
  async function processBatchFile(file) {
    let canvas
    if (file.type === 'application/pdf') {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const page = await pdf.getPage(1)
      const baseViewport = page.getViewport({ scale: 1 })
      const longestSide = Math.max(baseViewport.width, baseViewport.height)
      const renderScale = Math.min(3, Math.max(1.5, 2400 / longestSide))
      const viewport = page.getViewport({ scale: renderScale })
      canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
    } else {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.src = url
      await new Promise(res => img.onload = res)
      
      const scaleFactor = img.width < 1200 ? 2 : 1;
      canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth * scaleFactor
      canvas.height = img.naturalHeight * scaleFactor
      const ctx = canvas.getContext('2d')
      ctx.scale(scaleFactor, scaleFactor);
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
    }
    const rawCanvas = canvas
    const processedCanvas = preprocessCanvas(canvas)
    let textResult = ''
    if (ocrEngine === 'cloud') {
      const imageDataUrl = rawCanvas.toDataURL('image/jpeg', 0.9)
      const result = await runCloudOCR(imageDataUrl)
      if (result && result.text) textResult = result.text
    }
    if (ocrEngine === 'local') {
      const result = await recognizeLocally(processedCanvas)
      textResult = result.text
    }
    if (!textResult) throw new Error('OCR did not return any text.')
    return new Blob([textResult], { type: 'text/plain' })
  }

  const exportText = () => {
    if (!text) return
    let blob
    let filename = `ocr_result.${exportFormat}`
    switch (exportFormat) {
      case 'json': blob = new Blob([JSON.stringify({ text, confidence, language, timestamp: new Date().toISOString() }, null, 2)], { type: 'application/json' }); break;
      case 'csv': const csv = `"Text","Confidence","Language"\n"${text.replace(/"/g, '""')}","${confidence}%","${language}"`; blob = new Blob([csv], { type: 'text/csv' }); break;
      default: blob = new Blob([text], { type: 'text/plain' });
    }
    downloadBlob(blob, filename)
  }

  const handleFileChange = (files) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    setText('')
    setConfidence(null)
    setPreviewUrl(null)
    loadImageOrPdf(f, selectedPage)
  }

  useEffect(() => () => {
    if (ocrWorkerRef.current) {
      ocrWorkerRef.current.terminate()
      ocrWorkerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (file && file.type === 'application/pdf' && selectedPage > 0) loadImageOrPdf(file, selectedPage)
  }, [selectedPage])

  return (
    <ToolLayout title="OCR Text Extraction" description={t('tool.ocr_desc', 'Extract text 100% privately on your device with Tesseract. Optional cloud mode sends images to OCR.space.')}>

      {/* Settings Panel */}
      <div className="bg-card p-5 rounded-2xl border border-border shadow-sm max-w-4xl mx-auto w-full mb-8">
        <div className="flex items-center gap-2 mb-4 text-foreground font-semibold">
          <Settings className="w-5 h-5 text-blue-500" />
          <span>Extraction Settings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
              <Languages className="w-4 h-4" /> Language
            </label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-2.5 rounded-xl border border-[rgba(243,239,228,0.16)] bg-secondary focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all outline-none">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>

          {/* Engine */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Processing Engine
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-xl">
              <button
                onClick={() => setOcrEngine('local')}
                className={`text-xs font-semibold py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${ocrEngine === 'local' ? 'bg-card text-green-600 shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
              >
                <Laptop className="w-3 h-3" /> Local (Private)
              </button>
              <button
                onClick={() => setOcrEngine('cloud')}
                className={`text-xs font-semibold py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${ocrEngine === 'cloud' ? 'bg-card text-blue-600 shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
              >
                <Cloud className="w-3 h-3" /> Cloud
              </button>
            </div>
            {ocrEngine === 'cloud' && (
              <p className="mt-2 text-[11px] leading-snug text-amber-600 bg-amber-500/10 border border-amber-200 rounded-lg px-2 py-1.5 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Cloud mode uploads page images to OCR.space. For confidential documents, use Local mode.
              </p>
            )}
            {ocrEngine === 'local' && (
              <p className="mt-2 text-[11px] leading-snug text-green-600 bg-emerald-500/10 border border-green-200 rounded-lg px-2 py-1.5 flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                100% private: processing runs entirely on your device.
              </p>
            )}
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Speed vs Accuracy
            </label>
            <select value={ocrMode} onChange={e => setOcrMode(e.target.value)} className="w-full p-2.5 rounded-xl border border-[rgba(243,239,228,0.16)] bg-secondary focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all outline-none">
              <option value="fast">⚡ Fast (Draft)</option>
              <option value="balanced">⚖️ Balanced</option>
              <option value="accurate">🎯 High Accuracy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main OCR Interface */}
      <div className="flex flex-col gap-6">
        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-destructive/10 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> {errorMsg}
            </motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-500/10 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {!file ? (
          <FileDropZone
            onFiles={handleFileChange}
            accept=".png,.jpg,.jpeg,.webp,.pdf"
            disabled={busy}
            hint="Upload image or PDF to extract text"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Progress Bar */}
            {busy && (
              <div className="bg-secondary p-6 rounded-2xl border border-border text-center animate-pulse">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground font-medium mb-1">{progressText}</p>
                <p className="text-sm text-muted-foreground font-mono">{progress}%</p>
                <div className="w-full bg-secondary h-1.5 rounded-full mt-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Left: Preview */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[500px]">
                <div className="p-3 border-b border-border bg-secondary flex justify-between items-center text-sm font-semibold text-foreground">
                  <span>Original View</span>
                  <div className="flex gap-2">
                    {file.type === 'application/pdf' && totalPages > 1 && (
                      <div className="flex items-center gap-1 bg-card rounded-lg border border-border px-1">
                        <button disabled={selectedPage <= 1} onClick={() => setSelectedPage(p => p - 1)} className="p-1 hover:bg-secondary rounded disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-xs px-2">{selectedPage}/{totalPages}</span>
                        <button disabled={selectedPage >= totalPages} onClick={() => setSelectedPage(p => p + 1)} className="p-1 hover:bg-secondary rounded disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-secondary flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-lg rounded" />
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center">
                      <FileText className="w-12 h-12 mb-2 opacity-20" />
                      <span>No preview available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Result */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[500px]">
                <div className="p-3 border-b border-border bg-secondary flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Extracted Text
                    {confidence && <span className={`text-[10px] px-2 py-0.5 rounded-full ${confidence > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{confidence}% Score</span>}
                  </span>
                  <div className="flex gap-2">
                    <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} className="text-xs p-1.5 rounded border border-[rgba(243,239,228,0.16)] bg-card">
                      <option value="txt">.txt</option>
                      <option value="json">.json</option>
                      <option value="csv">.csv</option>
                    </select>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm text-foreground bg-card"
                  placeholder="Text will appear here after processing..."
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-lg flex justify-between items-center max-w-4xl mx-auto w-full sticky bottom-4 z-10">
              <button onClick={() => setFile(null)} className="font-semibold text-muted-foreground hover:text-foreground transition-colors">Start Over</button>
              <ActionButtons
                primaryText="Download Result"
                onPrimary={exportText}
                loading={busy}
                disabled={!text}
                icon={Download}
              />
            </div>

          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}
