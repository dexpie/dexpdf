import React, { useRef, useState, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Pen, Eraser, Download, Trash2, Undo, Save, AlertCircle, CheckCircle } from 'lucide-react'

// Ensure worker
try {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
  }
} catch (e) { }

export default function AnnotateTool() {
  const [file, setFile] = useState(null)
  const [pageImg, setPageImg] = useState(null)
  const canvasRef = useRef()
  const [drawing, setDrawing] = useState(false)

  // Tools
  const [tool, setTool] = useState('pen') // pen, eraser
  const [color, setColor] = useState('#ef4444') // red default
  const [brushSize, setBrushSize] = useState(4)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [outputFileName, setOutputFileName] = useState('')
  const lastPos = useRef(null)

  async function loadFile(files) {
    const f = files[0]
    if (!f) return

    setErrorMsg('')
    setSuccessMsg('')

    if (!f.type.includes('pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    try {
      setBusy(true)
      setFile(f)
      setOutputFileName(getDefaultFilename(f, '_annotated'))
      const data = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const page = await pdf.getPage(1) // MVP: Page 1 only

      const scale = 1.5
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise

      setPageImg(canvas.toDataURL('image/png'))
      setSuccessMsg('PDF loaded! You can now annotate.')
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to load PDF: ' + err.message)
      setFile(null)
      setPageImg(null)
    } finally {
      setBusy(false)
    }
  }

  // Init canvas when image loads
  useEffect(() => {
    const c = canvasRef.current; if (!c || !pageImg) return
    const ctx = c.getContext('2d')
    const img = new Image();
    img.onload = () => {
      c.width = img.width;
      c.height = img.height;
      ctx.drawImage(img, 0, 0)

      // Settings defaults
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    };
    img.src = pageImg
  }, [pageImg])

  function start(e) {
    setDrawing(true);
    const { x, y } = getPos(e)
    lastPos.current = { x, y }
    draw(e)
  }

  function stop() {
    setDrawing(false);
    lastPos.current = null
  }

  function getPos(e) {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    // Scale coordinates in case canvas is displayed smaller than actual resolution
    const scaleX = c.width / rect.width
    const scaleY = c.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  function draw(e) {
    if (!drawing) return;

    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e)

    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
    } else {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);

    ctx.lineWidth = brushSize;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 3; // Eraser bigger
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }

    ctx.stroke();
    lastPos.current = { x, y }
  }

  function clearCanvas() {
    if (!canvasRef.current || !pageImg) return
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = pageImg
    setSuccessMsg('Canvas cleared!')
  }

  async function exportAnnotated() {
    if (!file || !canvasRef.current) return
    setErrorMsg('')
    setBusy(true)

    try {
      const blob = await new Promise(res => canvasRef.current.toBlob(res, 'image/png'))
      const pdfDoc = await PDFDocument.create()
      const imgBytes = await blob.arrayBuffer()
      const img = await pdfDoc.embedPng(imgBytes)

      // Create page matching image dimensions
      const page = pdfDoc.addPage([img.width, img.height])
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })

      const outBytes = await pdfDoc.save()
      const outBlob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(outBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_annotated')
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg('Annotated PDF exported successfully!')
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg('Export failed: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout title="Annotate PDF" description="Draw annotations, highlights, and notes on your PDF">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5" /> {errorMsg}
            </motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5" /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {!file ? (
          <FileDropZone
            onFiles={loadFile}
            accept="application/pdf"
            disabled={busy}
            hint="Upload PDF to start drawing"
          />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Toolbar */}
            <div className="sticky top-4 z-50 bg-white p-3 rounded-2xl border border-slate-200 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 border-r border-slate-100 pr-4">
                <button
                  onClick={() => setTool('pen')}
                  className={`p-2 rounded-xl transition-all ${tool === 'pen' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <Pen className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`p-2 rounded-xl transition-all ${tool === 'eraser' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <Eraser className="w-5 h-5" />
                </button>
              </div>

              {tool === 'pen' && (
                <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
                  <div className="flex gap-1">
                    {['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b'].map(c => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'border-slate-400 scale-125' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="h-6 w-[1px] bg-slate-200"></div>
                  <input
                    type="range" min="1" max="20"
                    value={brushSize}
                    onChange={e => setBrushSize(Number(e.target.value))}
                    className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button onClick={clearCanvas} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-xs font-bold transition-colors">Clear All</button>
                <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
                <button
                  onClick={exportAnnotated}
                  disabled={busy}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  {busy ? 'Saving...' : <><Save className="w-4 h-4" /> Save PDF</>}
                </button>
              </div>
            </div>

            {/* Canvas Wrapper */}
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-8 flex justify-center overflow-auto min-h-[600px]">
              {pageImg ? (
                <div className="shadow-2xl bg-white border border-slate-200">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={start}
                    onMouseUp={stop}
                    onMouseMove={draw}
                    className="cursor-crosshair touch-none"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center text-slate-400 gap-2">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                  Rendering...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
