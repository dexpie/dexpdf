import { useState } from 'react'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'

export default function ExtractImagesTool() {
  const [batchMode, setBatchMode] = useState(true) // Default to batch since it already handles multiple files
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('extracted-images')
  const errorRef = React.useRef(null);
  const successRef = React.useRef(null);
  React.useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
  React.useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

  const handleFiles = (e) => {
    setErrorMsg(''); setSuccessMsg('');
    setFiles(Array.from(e.target.files || []))
  }

  const extract = async () => {
    if (!files.length) { setErrorMsg('Please select a PDF file first.'); return; }
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      for (const f of files) {
        try {
          const arr = await f.arrayBuffer()
          const pdf = await PDFDocument.load(arr)
          // TODO: Extract images from PDF (pdf-lib limitation)
          const bytes = await pdf.save()
          zip.file(f.name.replace(/\.pdf$/i, '') + '-original.pdf', bytes)
        } catch (err) {
          setErrorMsg('Failed to extract images from ' + f.name)
          console.error('Error extracting images', err)
        }
      }
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'extracted-images', '.zip')
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setSuccessMsg('Success! ZIP file downloaded.');
    } catch (err) {
      setErrorMsg('Failed: ' + (err.message || err));
      console.error(err);
    } finally {
      setBusy(false)
    }
  }

  async function processBatchFile(f, onProgress) {
    try {
      onProgress(10)
      const pdfjsLib = await import('pdfjs-dist')
      // Set worker
      try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) { }

      onProgress(20)
      const arr = await f.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arr })
      const pdf = await loadingTask.promise

      onProgress(40)
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Extract images from each page
      // Extract images from each page concurrently in batches
      const BATCH_SIZE = 5;
      for (let start = 1; start <= pdf.numPages; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, pdf.numPages);
        const pagePromises = [];
        for (let pageNum = start; pageNum <= end; pageNum++) {
          pagePromises.push((async () => {
            const page = await pdf.getPage(pageNum)
            const ops = await page.getOperatorList()
            const extracted = [];
            let imgIndex = 0

            for (let i = 0; i < ops.fnArray.length; i++) {
              if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject || ops.fnArray[i] === pdfjsLib.OPS.paintJpegXObject) {
                try {
                  const imgName = ops.argsArray[i][0]
                  const img = page.objs.get(imgName)
                  if (img && img.data) {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    const imageData = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
                    ctx.putImageData(imageData, 0, 0)

                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
                    extracted.push({ name: `page${pageNum}_img${imgIndex}.png`, blob })
                    imgIndex++
                  }
                } catch (err) {
                  console.warn('Failed to extract image:', err)
                }
              }
            }
            return { pageNum, extracted };
          })());
        }
        
        const pagesData = await Promise.all(pagePromises);
        pagesData.sort((a, b) => a.pageNum - b.pageNum);
        for (const { extracted } of pagesData) {
          for (const item of extracted) {
            zip.file(item.name, item.blob);
          }
        }
        onProgress(40 + (end / pdf.numPages) * 50)
      }

      onProgress(90)
      // If no images found, create a note file
      if (Object.keys(zip.files).length === 0) {
        zip.file('no-images-found.txt', `No images were found in ${f.name}`)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      onProgress(100)
      return content
    } catch (err) {
      throw new Error(`Failed to extract images: ${err.message || err}`)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Extract Images</h2>
      <p>Upload PDFs and extract images.</p>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
        <button
          onClick={() => setBatchMode(false)}
          disabled={busy}
          style={{
            padding: '8px 16px',
            backgroundColor: !batchMode ? 'var(--primary)' : 'transparent',
            color: !batchMode ? 'white' : 'var(--text)',
            border: !batchMode ? 'none' : '1px solid var(--border)',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: !batchMode ? 'bold' : 'normal'
          }}
        >
          📄 Single File
        </button>
        <button
          onClick={() => setBatchMode(true)}
          disabled={busy}
          style={{
            padding: '8px 16px',
            backgroundColor: batchMode ? 'var(--primary)' : 'transparent',
            color: batchMode ? 'white' : 'var(--text)',
            border: batchMode ? 'none' : '1px solid var(--border)',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: batchMode ? 'bold' : 'normal'
          }}
        >
          📚 Batch Process
        </button>
      </div>

      {errorMsg && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
      )}
      {successMsg && (
        <div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
      )}

      {batchMode ? (
        <div>
          <p style={{ marginBottom: 16, padding: 12, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 4 }}>
            In batch mode, each PDF's extracted images will be saved as a separate ZIP file. Images are extracted from all pages.
          </p>
          <UniversalBatchProcessor
            processFile={processBatchFile}
            outputFilenameSuffix="_images"
            acceptedFileTypes="application/pdf"
            description="Extract images from multiple PDFs"
            outputFileExtension=".zip"
          />
        </div>
      ) : (
        <div>
          {busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Processing, please wait...</span></div>}
          <input type="file" accept="application/pdf" multiple onChange={handleFiles} disabled={busy} />
          <div className="file-list" style={{ margin: '16px 0' }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 8, marginBottom: 8, padding: 8, opacity: busy ? 0.7 : 1 }}>
                <div style={{ minWidth: 120, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{f.name}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{(f.size / 1024).toFixed(1)} KB</div>
                <button className="btn" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} disabled={busy}>Remove</button>
              </div>
            ))}
          </div>
          {files.length > 0 && (
            <FilenameInput
              value={outputFileName}
              onChange={(e) => setOutputFileName(e.target.value)}
              disabled={busy}
              placeholder="extracted-images"
            />
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={extract} disabled={busy || files.length === 0}>{busy ? 'Working...' : 'Extract & Download'}</button>
            <button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setFiles([]); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy || files.length === 0}>Reset</button>
          </div>
        </div>
      )}
    </div>
  )
}
