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
  const canvasRef = useRef(null)

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
        const viewport = page.getViewport({ scale: 2.0 })
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

  // 🔍 Advanced OCR with progress tracking
  const runOcrOnCanvas = async (canvas) => {
    setBusy(true)
    setProgress(0)
    setProgressText('Initializing OCR...')
    
    try {
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
        tessedit_pageseg_mode: autoRotate ? 1 : 3, // Auto page segmentation with OSD or without
      })

      setProgressText('Recognizing text...')
      const { data } = await worker.recognize(canvas)
      
      // Calculate average confidence
      const avgConfidence = data.confidence ? Math.round(data.confidence) : null
      setConfidence(avgConfidence)
      
      setText(data.text)
      setSuccessMsg(`✅ OCR completed! Confidence: ${avgConfidence}%`)
      setProgress(100)
      
      await worker.terminate()
    } catch (error) {
      setErrorMsg(`❌ OCR error: ${error.message}`)
      console.error(error)
    } finally {
      setBusy(false)
      setProgressText('')
    }
  }

  // 📦 Batch processing with enhanced OCR
  async function processBatchFile(file) {
    let canvas
    if (file.type === 'application/pdf') {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 2 })
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

    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker()
    await worker.loadLanguage(language)
    await worker.initialize(language)
    
    // Apply same settings
    const oem = ocrMode === 'fast' ? 0 : ocrMode === 'accurate' ? 1 : 2
    await worker.setParameters({
      tessedit_ocr_engine_mode: oem,
      tessedit_pageseg_mode: autoRotate ? 1 : 3,
    })
    
    const { data: { text } } = await worker.recognize(processedCanvas)
    await worker.terminate()

    // Return text as a blob
    return new Blob([text], { type: 'text/plain' })
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
    <div style={{ padding: 20 }}>
      <h2>🔍 Advanced OCR Tool</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
        Extract text from images and PDFs with multi-language support and advanced processing
      </p>

      {/* Mode Toggle */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setBatchMode(!batchMode)}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: batchMode ? 'var(--primary)' : 'transparent',
            color: batchMode ? '#fff' : 'var(--text)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          {batchMode ? '📦 Batch Mode Active' : '📄 Single Mode Active'}
        </button>
      </div>

      {batchMode ? (
        <div>
          {/* Batch Settings */}
          <div style={{ marginBottom: 20, padding: 15, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <h3>Batch OCR Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Language:</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} 
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--border)' }}>
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Quality Mode:</label>
                <select value={ocrMode} onChange={e => setOcrMode(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--border)' }}>
                  <option value="fast">⚡ Fast</option>
                  <option value="balanced">⚖️ Balanced</option>
                  <option value="accurate">🎯 Accurate</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={imageEnhancement} onChange={e => setImageEnhancement(e.target.checked)} />
                  <span>🎨 Image Enhancement</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} />
                  <span>🔄 Auto-Rotate</span>
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
          {/* Advanced Settings */}
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer'
              }}
            >
              {showAdvanced ? '▼ Hide Advanced Settings' : '▶ Show Advanced Settings'}
            </button>
          </div>

          {showAdvanced && (
            <div style={{ marginBottom: 20, padding: 20, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <h3 style={{ marginTop: 0 }}>⚙️ Advanced Settings</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                {/* Language Selection */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>🌍 Language:</label>
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', fontSize: 14 }}
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
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>🎯 Quality Mode:</label>
                  <select 
                    value={ocrMode} 
                    onChange={e => setOcrMode(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', fontSize: 14 }}
                  >
                    <option value="fast">⚡ Fast (Lower accuracy, faster speed)</option>
                    <option value="balanced">⚖️ Balanced (Good balance)</option>
                    <option value="accurate">🎯 Accurate (Best quality, slower)</option>
                  </select>
                </div>

                {/* Export Format */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>💾 Export Format:</label>
                  <select 
                    value={exportFormat} 
                    onChange={e => setExportFormat(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', fontSize: 14 }}
                  >
                    <option value="txt">📄 Plain Text (.txt)</option>
                    <option value="json">📋 JSON (.json)</option>
                    <option value="csv">📊 CSV (.csv)</option>
                  </select>
                </div>
              </div>

              {/* Enhancement Options */}
              <div style={{ marginTop: 20, display: 'flex', gap: 30 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={imageEnhancement} 
                    onChange={e => setImageEnhancement(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14 }}>🎨 Image Enhancement (contrast & grayscale)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={autoRotate} 
                    onChange={e => setAutoRotate(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14 }}>🔄 Auto-Rotate Detection</span>
                </label>
              </div>
            </div>
          )}

          {/* File Input */}
          <div style={{ marginBottom: 20 }}>
            <label 
              htmlFor="ocr-file-input"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              📁 Choose File
            </label>
            <input 
              id="ocr-file-input"
              type="file" 
              accept=".png,.jpg,.jpeg,.webp,.bmp,.tiff,application/pdf" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {file && (
              <span style={{ marginLeft: 15, color: 'var(--text-muted)' }}>
                Selected: {file.name}
              </span>
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
      `}</style>
    </div>
  )
}
