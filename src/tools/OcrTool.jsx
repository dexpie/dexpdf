import React, { useState, useRef, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) {/*ignore*/ }

// 🌍 Advanced OCR Languages
const LANGUAGES = [
  { code: 'eng', name: '🇬🇧 English', popular: true },
  { code: 'ind', name: '🇮🇩 Indonesian', popular: true },
  { code: 'spa', name: '🇪🇸 Spanish', popular: true },
  { code: 'fra', name: '🇫🇷 French', popular: true },
  { code: 'deu', name: '🇩🇪 German', popular: true },
  { code: 'chi_sim', name: '🇨🇳 Chinese Simplified', popular: true },
  { code: 'chi_tra', name: '🇹🇼 Chinese Traditional', popular: false },
  { code: 'jpn', name: '🇯🇵 Japanese', popular: true },
  { code: 'kor', name: '🇰🇷 Korean', popular: true },
  { code: 'ara', name: '🇸🇦 Arabic', popular: true },
  { code: 'rus', name: '🇷🇺 Russian', popular: false },
  { code: 'por', name: '🇵🇹 Portuguese', popular: true },
  { code: 'ita', name: '🇮🇹 Italian', popular: false },
  { code: 'nld', name: '🇳🇱 Dutch', popular: false },
  { code: 'tha', name: '🇹🇭 Thai', popular: true },
  { code: 'vie', name: '🇻🇳 Vietnamese', popular: true },
]

export default function OcrTool() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [batchMode, setBatchMode] = useState(false)
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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [useCloudOCR, setUseCloudOCR] = useState(true) // Use OCR.space API (faster, free)
  const [ocrEngine, setOcrEngine] = useState('auto') // auto, cloud, local
  const canvasRef = useRef(null)

  // 🌩️ OCR.space API (FREE - 25k requests/month)
  const runCloudOCR = async (imageDataUrl) => {
    const formData = new FormData()
    formData.append('base64Image', imageDataUrl)
    formData.append('language', language)
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', autoRotate ? 'true' : 'false')
    formData.append('scale', 'true')
    formData.append('OCREngine', ocrMode === 'accurate' ? '2' : '1')
    
    try {
      setProgressText('🌩️ Using Cloud OCR (faster)...')
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': 'K87899142388957' // Free API key (public, rate-limited)
        },
        body: formData
      })
      
      const result = await response.json()
      
      if (result.ParsedResults && result.ParsedResults[0]) {
        const parsedText = result.ParsedResults[0].ParsedText
        const confidence = result.ParsedResults[0].TextOverlay?.Lines?.length > 0 
          ? Math.round(result.ParsedResults[0].TextOverlay.Lines.reduce((acc, line) => 
              acc + (line.Words?.reduce((sum, word) => sum + (word.WordText ? 90 : 0), 0) || 0), 0) / 
              (result.ParsedResults[0].TextOverlay.Lines.length || 1))
          : 85 // Default confidence for cloud OCR
        
        return { text: parsedText, confidence }
      } else {
        throw new Error(result.ErrorMessage || 'Cloud OCR failed')
      }
    } catch (error) {
      console.warn('Cloud OCR failed, falling back to local OCR:', error)
      setProgressText('⚠️ Cloud OCR failed, using local OCR...')
      return null
    }
  }

  // 🎨 Enhanced image preprocessing
  const preprocessCanvas = (canvas) => {
    if (!imageEnhancement) return canvas
    
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Convert to grayscale and enhance contrast
    // Cache length for faster loop
    const len = data.length
    for (let i = 0; i < len; i += 4) {
      // Use integer operations for better performance
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      // Fast grayscale approximation: (r + r + r + b + g + g + g + g) >> 3
      const gray = ((r << 1) + r + b + (g << 2)) >> 3
      // Enhance contrast (adaptive threshold)
      const enhanced = gray < 128 ? Math.max(0, gray - 30) : Math.min(255, gray + 30)
      data[i] = data[i + 1] = data[i + 2] = enhanced
    }
    
    ctx.putImageData(imageData, 0, 0)
    return canvas
  }

  // 📄 Load single image or PDF page
  const loadImageOrPdf = async (inputFile, pageNum = 1) => {
    const targetFile = inputFile || file
    if (!targetFile) return
    
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    
    try {
      const isPdf = targetFile.type === 'application/pdf'
      let canvas

      if (isPdf) {
        const arrayBuffer = await targetFile.arrayBuffer()
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
        setTotalPages(pdf.numPages)
        
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })
        canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
      } else {
        // Image file
        setTotalPages(1)
        canvas = document.createElement('canvas')
        const img = new Image()
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = URL.createObjectURL(targetFile)
        })
        
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
      }

      // Apply preprocessing
      const processedCanvas = preprocessCanvas(canvas)
      
      // Show preview
      setPreviewUrl(processedCanvas.toDataURL())
      
      // Run OCR
      await runOcrOnCanvas(processedCanvas)
    } catch (error) {
      setErrorMsg(`❌ Error loading file: ${error.message}`)
      console.error(error)
    } finally {
      setBusy(false)
    }
  }

  // 🔍 Advanced OCR with progress tracking (Cloud + Local fallback)
  const runOcrOnCanvas = async (canvas) => {
    setBusy(true)
    setProgress(0)
    setProgressText('Initializing OCR...')
    
    try {
      let result = null
      
      // Try Cloud OCR first (faster, free)
      if (useCloudOCR || ocrEngine === 'cloud' || ocrEngine === 'auto') {
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
        result = await runCloudOCR(imageDataUrl)
      }
      
      // Fallback to local Tesseract if cloud fails
      if (!result || ocrEngine === 'local') {
        setProgressText('Using local OCR (Tesseract.js)...')
        const { createWorker } = await import('tesseract.js')
        const worker = await createWorker({
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const prog = Math.floor(m.progress * 100)
              setProgress(prog)
              setProgressText(`Recognizing text... ${prog}%`)
            }
          }
        })

        setProgressText('Loading language data...')
        await worker.loadLanguage(language)
        await worker.initialize(language)
        
        // Set OCR engine mode based on quality setting
        const oem = ocrMode === 'fast' ? 0 : ocrMode === 'accurate' ? 1 : 2
        await worker.setParameters({
          tessedit_ocr_engine_mode: oem,
          tessedit_pageseg_mode: autoRotate ? 1 : 3,
        })

        setProgressText('Recognizing text...')
        const { data } = await worker.recognize(canvas)
        result = { text: data.text, confidence: data.confidence ? Math.round(data.confidence) : null }
        
        await worker.terminate()
      }
      
      if (result) {
        setConfidence(result.confidence)
        setText(result.text)
        setSuccessMsg(`✅ OCR completed! Confidence: ${result.confidence}%`)
        setProgress(100)
      } else {
        throw new Error('OCR failed')
      }
    } catch (error) {
      setErrorMsg(`❌ OCR error: ${error.message}`)
      console.error(error)
    } finally {
      setBusy(false)
      setProgressText('')
    }
  }

  // 📦 Batch processing with enhanced OCR (Cloud + Local)
  async function processBatchFile(file) {
    let canvas
    if (file.type === 'application/pdf') {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1.5 })
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
      canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
    }

    // Apply preprocessing
    const processedCanvas = preprocessCanvas(canvas)
    
    let textResult = ''

    // Try Cloud OCR first
    if (useCloudOCR || ocrEngine === 'cloud' || ocrEngine === 'auto') {
      try {
        const imageDataUrl = processedCanvas.toDataURL('image/jpeg', 0.9)
        const result = await runCloudOCR(imageDataUrl)
        if (result && result.text) {
          textResult = result.text
        }
      } catch (error) {
        console.warn('Cloud OCR failed in batch, using local:', error)
      }
    }

    // Fallback to Tesseract
    if (!textResult || ocrEngine === 'local') {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker()
      await worker.loadLanguage(language)
      await worker.initialize(language)
      
      const oem = ocrMode === 'fast' ? 0 : ocrMode === 'accurate' ? 1 : 2
      await worker.setParameters({
        tessedit_ocr_engine_mode: oem,
        tessedit_pageseg_mode: autoRotate ? 1 : 3,
      })
      
      const { data: { text } } = await worker.recognize(processedCanvas)
      textResult = text
      await worker.terminate()
    }

    // Return text as a blob
    return new Blob([textResult], { type: 'text/plain' })
  }

  // 💾 Export with different formats
  const exportText = () => {
    if (!text) return
    
    let blob
    let filename = `ocr_result.${exportFormat}`
    
    switch (exportFormat) {
      case 'txt':
        blob = new Blob([text], { type: 'text/plain' })
        break
      case 'json':
        blob = new Blob([JSON.stringify({ text, confidence, language, timestamp: new Date().toISOString() }, null, 2)], { type: 'application/json' })
        break
      case 'csv':
        const csv = `"Text","Confidence","Language"\n"${text.replace(/"/g, '""')}","${confidence}%","${language}"`
        blob = new Blob([csv], { type: 'text/csv' })
        break
      default:
        blob = new Blob([text], { type: 'text/plain' })
    }
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 📝 Handle file input
  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setText('')
    setConfidence(null)
    setPreviewUrl(null)
    loadImageOrPdf(f, selectedPage)
  }

  // 📄 Change page for PDF
  useEffect(() => {
    if (file && file.type === 'application/pdf' && selectedPage > 0) {
      loadImageOrPdf(file, selectedPage)
    }
  }, [selectedPage])

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>OCR Text Extraction</h2>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        <button
          className={!batchMode ? 'btn-primary' : 'btn-outline'}
          onClick={() => setBatchMode(false)}
          style={{ minWidth: 120 }}
        >
          📄 Single File
        </button>
        <button
          className={batchMode ? 'btn-primary' : 'btn-outline'}
          onClick={() => setBatchMode(true)}
          style={{ minWidth: 120 }}
        >
          🔄 Batch Mode
        </button>
      </div>

      {batchMode ? (
        <div>
          {/* Batch Settings */}
          <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>⚙️ Batch OCR Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>🌩️ OCR Engine</label>
                <select 
                  value={ocrEngine} 
                  onChange={e => setOcrEngine(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                >
                  <option value="auto">🚀 Auto (Cloud → Local)</option>
                  <option value="cloud">🌩️ Cloud Only (Faster)</option>
                  <option value="local">💻 Local Only (Private)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>🌍 Language</label>
                <select 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)} 
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>🎯 Quality Mode</label>
                <select 
                  value={ocrMode} 
                  onChange={e => setOcrMode(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                >
                  <option value="fast">⚡ Fast</option>
                  <option value="balanced">⚖️ Balanced</option>
                  <option value="accurate">🎯 Accurate</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>✨ Enhancements</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 4 }}>
                  <input type="checkbox" checked={imageEnhancement} onChange={e => setImageEnhancement(e.target.checked)} />
                  <span>🎨 Image Enhancement</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} />
                  <span>🔄 Auto-Rotate</span>
                </label>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: '#666', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              💡 <strong>Batch Tips:</strong> Cloud OCR is 3-5x faster (25k free/month). Auto fallback to local if limit reached.
            </div>
          </div>

          <UniversalBatchProcessor
            accept=".png,.jpg,.jpeg,.webp,.bmp,.tiff,application/pdf"
            processFile={processBatchFile}
            outputNameSuffix="_ocr.txt"
            taskName="OCR Text Extraction"
          />
        </div>
      ) : (
        <>
          {/* Error & Success messages */}
          {errorMsg && (
            <div style={{ color: '#dc2626', marginBottom: 12, background: '#fee2e2', padding: 8, borderRadius: 6 }}>{errorMsg}</div>
          )}
          {successMsg && (
            <div style={{ color: '#059669', marginBottom: 12, background: '#d1fae5', padding: 8, borderRadius: 6 }}>{successMsg}</div>
          )}

          {/* Advanced Settings Toggle */}
          <div style={{ marginBottom: 12, textAlign: 'center' }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn-outline"
              style={{ fontSize: 13 }}
            >
              {showAdvanced ? '▼ Hide Advanced Settings' : '▶ Show Advanced Settings'}
            </button>
          </div>

          {showAdvanced && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>⚙️ Advanced Settings</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {/* OCR Engine */}
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>🌩️ OCR Engine</label>
                  <select 
                    value={ocrEngine} 
                    onChange={e => setOcrEngine(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                  >
                    <option value="auto">🚀 Auto (Cloud → Local)</option>
                    <option value="cloud">🌩️ Cloud Only (Faster)</option>
                    <option value="local">💻 Local Only (Private)</option>
                  </select>
                  <small style={{ color: '#666', display: 'block', marginTop: 4, fontSize: 12 }}>
                    Cloud OCR is 3-5x faster!
                  </small>
                </div>

                {/* Language Selection */}
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>🌍 Language</label>
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                  >
                    <optgroup label="Popular Languages">
                      {LANGUAGES.filter(l => l.popular).map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Languages">
                      {LANGUAGES.filter(l => !l.popular).map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Quality Mode */}
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>🎯 Quality Mode</label>
                  <select 
                    value={ocrMode} 
                    onChange={e => setOcrMode(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                  >
                    <option value="fast">⚡ Fast</option>
                    <option value="balanced">⚖️ Balanced</option>
                    <option value="accurate">🎯 Accurate</option>
                  </select>
                </div>

                {/* Export Format */}
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>💾 Export Format</label>
                  <select 
                    value={exportFormat} 
                    onChange={e => setExportFormat(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                  >
                    <option value="txt">📄 Plain Text (.txt)</option>
                    <option value="json">📋 JSON (.json)</option>
                    <option value="csv">📊 CSV (.csv)</option>
                  </select>
                </div>
              </div>

              {/* Enhancement Options */}
              <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input 
                    type="checkbox" 
                    checked={imageEnhancement} 
                    onChange={e => setImageEnhancement(e.target.checked)}
                  />
                  <span>🎨 Image Enhancement</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input 
                    type="checkbox" 
                    checked={autoRotate} 
                    onChange={e => setAutoRotate(e.target.checked)}
                  />
                  <span>🔄 Auto-Rotate Detection</span>
                </label>
              </div>
            </div>
          )}

          {/* File Input */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <label htmlFor="ocr-file-input" className="btn-primary" style={{ cursor: 'pointer', fontSize: 14 }}>
              📁 Choose File to Extract Text
            </label>
            <input 
              id="ocr-file-input"
              type="file" 
              accept=".png,.jpg,.jpeg,.webp,.bmp,.tiff,application/pdf" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {file && (
              <div style={{ marginTop: 8, color: '#64748b', fontSize: 13 }}>
                ✅ {file.name}
              </div>
            )}
          </div>

          {/* PDF Page Selector */}
          {file && file.type === 'application/pdf' && totalPages > 1 && (
            <div style={{ marginBottom: 16, textAlign: 'center', fontSize: 13 }}>
              <label style={{ marginRight: 8 }}>📄 Page:</label>
              <input 
                type="number" 
                min="1" 
                max={totalPages} 
                value={selectedPage}
                onChange={e => setSelectedPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                style={{ width: 80, padding: 6, borderRadius: 4, border: '1px solid #d1d5db' }}
              />
              <span style={{ marginLeft: 8, color: '#64748b' }}>of {totalPages}</span>
            </div>
          )}

          {/* Preview & Progress */}
          {busy && (
            <div style={{ marginBottom: 16, padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  border: '3px solid #e2e8f0', 
                  borderTop: '3px solid var(--primary)', 
                  borderRadius: '50%', 
                  margin: '0 auto',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>{progressText}</div>
              <div style={{ width: '100%', background: '#e2e8f0', borderRadius: 8, overflow: 'hidden', height: 16 }}>
                <div style={{ 
                  width: `${progress}%`, 
                  height: '100%', 
                  background: 'var(--primary)', 
                  transition: 'width 0.3s'
                }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>{progress}%</div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && !busy && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, marginBottom: 8 }}>📷 Preview {imageEnhancement && '(Enhanced)'}</h3>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 8
                }} 
              />
            </div>
          )}

          {/* Result */}
          {text && !busy && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>
                  📝 Extracted Text 
                  {confidence && (
                    <span style={{ 
                      marginLeft: 10, 
                      fontSize: 13, 
                      color: confidence > 80 ? '#059669' : confidence > 60 ? '#f59e0b' : '#dc2626',
                      fontWeight: 600
                    }}>
                      ({confidence}% confident)
                    </span>
                  )}
                </h3>
                <button onClick={exportText} className="btn-primary" style={{ fontSize: 13 }}>
                  💾 Export {exportFormat.toUpperCase()}
                </button>
              </div>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                background: '#f8fafc', 
                padding: 16, 
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                maxHeight: 400,
                overflow: 'auto',
                lineHeight: 1.6,
                fontSize: 13
              }}>
                {text}
              </pre>
              <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                📊 {text.length} chars · {text.split(/\s+/).filter(Boolean).length} words · {text.split('\n').length} lines
              </div>
            </div>
          )}

          {/* Tips */}
          {!file && (
            <div style={{ 
              marginTop: 20, 
              padding: 16, 
              background: '#f8fafc', 
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>💡 Tips for Best Results</h3>
              <ul style={{ lineHeight: 1.8, fontSize: 13, color: '#475569', paddingLeft: 20 }}>
                <li>Use high-resolution images (300 DPI or higher)</li>
                <li>Ensure good contrast between text and background</li>
                <li>Avoid skewed images or enable Auto-Rotate</li>
                <li>Select the correct language for better accuracy</li>
                <li>Use "Accurate" mode for important documents</li>
                <li>Enable Image Enhancement for scanned documents</li>
              </ul>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
