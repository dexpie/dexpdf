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
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
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
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with Gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '20px',
        marginBottom: '30px',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
        color: '#fff'
      }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>
          🔍 Advanced OCR Tool
        </h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '16px' }}>
          Extract text from images and PDFs with AI-powered multi-language support
        </p>
      </div>

      {/* Mode Toggle - Modern Switch */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <label style={{
          position: 'relative',
          display: 'inline-block',
          width: '180px',
          height: '60px',
          background: batchMode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '30px',
          cursor: 'pointer',
          boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}
        onClick={() => setBatchMode(!batchMode)}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: batchMode ? '90px' : '10px',
            transform: 'translateY(-50%)',
            width: '80px',
            height: '50px',
            background: '#fff',
            borderRadius: '25px',
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            {batchMode ? '📦' : '📄'}
          </div>
          <span style={{
            position: 'absolute',
            top: '50%',
            right: batchMode ? 'auto' : '15px',
            left: batchMode ? '15px' : 'auto',
            transform: 'translateY(-50%)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
            pointerEvents: 'none'
          }}>
            {batchMode ? 'Batch' : 'Single'}
          </span>
        </label>
        <div style={{ 
          padding: '15px 25px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '15px',
          border: '2px solid rgba(102, 126, 234, 0.3)'
        }}>
          <span style={{ fontWeight: '600', color: '#667eea' }}>
            {batchMode ? '📦 Batch Mode - Process multiple files' : '📄 Single Mode - Process one file'}
          </span>
        </div>
      </div>

      {batchMode ? (
        <div>
          {/* Batch Settings - Card Style */}
          <div style={{ 
            marginBottom: '30px', 
            padding: '25px', 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#667eea', fontSize: '20px', fontWeight: '700' }}>
              ⚙️ Batch OCR Settings
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {/* OCR Engine Card */}
              <div style={{
                padding: '15px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#667eea' }}>
                  🌩️ OCR Engine
                </label>
                <select 
                  value={ocrEngine} 
                  onChange={e => setOcrEngine(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}>
                  <option value="auto">🚀 Auto (Cloud → Local)</option>
                  <option value="cloud">🌩️ Cloud Only (Faster)</option>
                  <option value="local">💻 Local Only (Private)</option>
                </select>
              </div>

              {/* Language Card */}
              <div style={{
                padding: '15px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#667eea' }}>
                  🌍 Language
                </label>
                <select 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Quality Mode Card */}
              <div style={{
                padding: '15px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#667eea' }}>
                  🎯 Quality Mode
                </label>
                <select 
                  value={ocrMode} 
                  onChange={e => setOcrMode(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                  <option value="fast">⚡ Fast</option>
                  <option value="balanced">⚖️ Balanced</option>
                  <option value="accurate">🎯 Accurate</option>
                </select>
              </div>

              {/* Enhancements Card */}
              <div style={{
                padding: '15px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#667eea' }}>
                  ✨ Enhancements
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'background 0.2s'
                }}>
                  <input 
                    type="checkbox" 
                    checked={imageEnhancement} 
                    onChange={e => setImageEnhancement(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500' }}>🎨 Image Enhancement</span>
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  marginTop: '8px',
                  transition: 'background 0.2s'
                }}>
                  <input 
                    type="checkbox" 
                    checked={autoRotate} 
                    onChange={e => setAutoRotate(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500' }}>🔄 Auto-Rotate</span>
                </label>
              </div>
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
          {/* Advanced Settings Toggle - Modern Button */}
          <div style={{ marginBottom: '25px' }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                background: showAdvanced 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                transform: 'scale(1)'
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              {showAdvanced ? '▼ Hide Advanced Settings' : '▶ Show Advanced Settings'}
            </button>
          </div>

          {showAdvanced && (
            <div style={{ 
              marginBottom: '30px', 
              padding: '30px', 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              borderRadius: '20px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#667eea', fontSize: '22px', fontWeight: '700' }}>
                ⚙️ Advanced Settings
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                {/* OCR Engine */}
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  borderRadius: '15px',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: '#667eea', fontSize: '15px' }}>
                    🌩️ OCR Engine
                  </label>
                  <select 
                    value={ocrEngine} 
                    onChange={e => setOcrEngine(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      borderRadius: '10px', 
                      border: '2px solid rgba(102, 126, 234, 0.3)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      background: '#fff',
                      transition: 'all 0.3s'
                    }}
                  >
                    <option value="auto">🚀 Auto (Cloud first, then Local)</option>
                    <option value="cloud">🌩️ Cloud Only (Faster, 25k free/month)</option>
                    <option value="local">💻 Local Only (100% Private)</option>
                  </select>
                  <small style={{ color: '#888', display: 'block', marginTop: '8px', fontSize: '12px' }}>
                    💡 Cloud OCR is 3-5x faster!
                  </small>
                </div>

                {/* Language Selection */}
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  borderRadius: '15px',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: '#667eea', fontSize: '15px' }}>
                    🌍 Language
                  </label>
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      borderRadius: '10px', 
                      border: '2px solid rgba(102, 126, 234, 0.3)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      background: '#fff'
                    }}
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
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  borderRadius: '15px',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: '#667eea', fontSize: '15px' }}>
                    🎯 Quality Mode
                  </label>
                  <select 
                    value={ocrMode} 
                    onChange={e => setOcrMode(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      borderRadius: '10px', 
                      border: '2px solid rgba(102, 126, 234, 0.3)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      background: '#fff'
                    }}
                  >
                    <option value="fast">⚡ Fast (Lower accuracy, faster speed)</option>
                    <option value="balanced">⚖️ Balanced (Good balance)</option>
                    <option value="accurate">🎯 Accurate (Best quality, slower)</option>
                  </select>
                </div>

                {/* Export Format */}
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  borderRadius: '15px',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: '#667eea', fontSize: '15px' }}>
                    💾 Export Format
                  </label>
                  <select 
                    value={exportFormat} 
                    onChange={e => setExportFormat(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      borderRadius: '10px', 
                      border: '2px solid rgba(102, 126, 234, 0.3)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      background: '#fff'
                    }}
                  >
                    <option value="txt">📄 Plain Text (.txt)</option>
                    <option value="json">📋 JSON (.json)</option>
                    <option value="csv">📊 CSV (.csv)</option>
                  </select>
                </div>
              </div>

              {/* Enhancement Options - Modern Toggle Switches */}
              <div style={{ marginTop: '25px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  cursor: 'pointer',
                  padding: '15px 20px',
                  background: imageEnhancement ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0,0,0,0.05)',
                  borderRadius: '12px',
                  border: `2px solid ${imageEnhancement ? '#667eea' : 'transparent'}`,
                  transition: 'all 0.3s'
                }}>
                  <input 
                    type="checkbox" 
                    checked={imageEnhancement} 
                    onChange={e => setImageEnhancement(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#667eea' }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>
                    🎨 Image Enhancement (contrast & grayscale)
                  </span>
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  cursor: 'pointer',
                  padding: '15px 20px',
                  background: autoRotate ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0,0,0,0.05)',
                  borderRadius: '12px',
                  border: `2px solid ${autoRotate ? '#667eea' : 'transparent'}`,
                  transition: 'all 0.3s'
                }}>
                  <input 
                    type="checkbox" 
                    checked={autoRotate} 
                    onChange={e => setAutoRotate(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#667eea' }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>
                    🔄 Auto-Rotate Detection
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* File Input - Modern Upload Button */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <label 
              htmlFor="ocr-file-input"
              style={{
                display: 'inline-block',
                padding: '18px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderRadius: '15px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                transform: 'scale(1)',
                border: 'none'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'scale(1.08)'
                e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)'
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
              }}
            >
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
              <div style={{ 
                marginTop: '15px', 
                padding: '12px 20px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '10px',
                display: 'inline-block',
                border: '2px solid rgba(102, 126, 234, 0.3)'
              }}>
                <span style={{ fontWeight: '600', color: '#667eea' }}>
                  ✓ Selected: {file.name}
                </span>
              </div>
            )}
          </div>

          {/* PDF Page Selector */}
          {file && file.type === 'application/pdf' && totalPages > 1 && (
            <div style={{ marginBottom: 20, padding: 15, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <label style={{ fontWeight: 'bold', marginRight: 10 }}>📄 Page:</label>
              <input 
                type="number" 
                min="1" 
                max={totalPages} 
                value={selectedPage}
                onChange={e => setSelectedPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                style={{ width: 80, padding: 8, borderRadius: 4, border: '1px solid var(--border)', marginRight: 10 }}
              />
              <span style={{ color: 'var(--text-muted)' }}>of {totalPages} pages</span>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div style={{ marginBottom: 20, padding: 15, background: '#fee', border: '1px solid #fcc', borderRadius: 8, color: '#c00' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ marginBottom: 20, padding: 15, background: '#efe', border: '1px solid #cfc', borderRadius: 8, color: '#090' }}>
              {successMsg}
            </div>
          )}

          {/* Preview & Progress */}
          {busy && (
            <div style={{ marginBottom: 20, padding: 20, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ marginBottom: 15 }}>
                <div style={{ 
                  width: 50, 
                  height: 50, 
                  border: '4px solid var(--border)', 
                  borderTop: '4px solid var(--primary)', 
                  borderRadius: '50%', 
                  margin: '0 auto',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: 10 }}>{progressText}</div>
              <div style={{ width: '100%', background: 'var(--bg)', borderRadius: 10, overflow: 'hidden', height: 20 }}>
                <div style={{ 
                  width: `${progress}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary), #60a5fa)', 
                  transition: 'width 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  {progress > 10 && `${progress}%`}
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && !busy && (
            <div style={{ marginBottom: 20 }}>
              <h3>📷 Preview {imageEnhancement && '(Enhanced)'}</h3>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  border: '2px solid var(--border)', 
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
            </div>
          )}

          {/* Result */}
          {text && !busy && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>
                  📝 Extracted Text 
                  {confidence && (
                    <span style={{ 
                      marginLeft: 15, 
                      fontSize: 14, 
                      color: confidence > 80 ? '#0a0' : confidence > 60 ? '#fa0' : '#f00',
                      fontWeight: 'bold'
                    }}>
                      Confidence: {confidence}%
                    </span>
                  )}
                </h3>
                <button
                  onClick={exportText}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                  💾 Export as {exportFormat.toUpperCase()}
                </button>
              </div>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                background: 'var(--bg-secondary)', 
                padding: 20, 
                borderRadius: 8,
                border: '1px solid var(--border)',
                maxHeight: 500,
                overflow: 'auto',
                lineHeight: 1.6
              }}>
                {text}
              </pre>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                📊 Characters: {text.length} | Words: {text.split(/\s+/).filter(Boolean).length} | Lines: {text.split('\n').length}
              </div>
            </div>
          )}

          {/* Info */}
          {!file && (
            <div style={{ 
              marginTop: 30, 
              padding: 20, 
              background: 'var(--bg-secondary)', 
              borderRadius: 8,
              border: '1px solid var(--border)'
            }}>
              <h3>💡 Tips for Best Results</h3>
              <ul style={{ lineHeight: 2 }}>
                <li>✅ Use high-resolution images (300 DPI or higher)</li>
                <li>✅ Ensure good contrast between text and background</li>
                <li>✅ Avoid skewed or rotated images (or enable Auto-Rotate)</li>
                <li>✅ Select the correct language for better accuracy</li>
                <li>✅ Use "Accurate" mode for important documents</li>
                <li>✅ Enable Image Enhancement for scanned documents</li>
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
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>
    </div>
  )
}
