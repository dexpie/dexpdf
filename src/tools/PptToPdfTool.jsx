'use client'

import React, { useState } from 'react'
import JSZip from 'jszip'
import { AlertTriangle, CheckCircle2, FileImage, Files, RefreshCw, X } from 'lucide-react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import FilenameInput from '../components/FilenameInput'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import CloudConversionOption from '../components/common/CloudConversionOption'
import { convertWithCloud } from '../utils/cloudConversion'
import { downloadBlob, getDefaultFilename, getOutputFilename } from '../utils/fileHelpers'

const naturalSort = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
const supportedImagePattern = /\.(png|jpe?g|webp|gif|bmp)$/i

async function blobToCanvasData(blob) {
  const url = URL.createObjectURL(blob)
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('An embedded image could not be decoded.'))
      element.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth || image.width
    canvas.height = image.naturalHeight || image.height
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0)
    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width: canvas.width,
      height: canvas.height,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function convertPptxMediaToPdf(file, onProgress = () => {}) {
  onProgress(8)
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const mediaPaths = Object.keys(zip.files)
    .filter(path => path.startsWith('ppt/media/') && supportedImagePattern.test(path))
    .sort(naturalSort.compare)

  if (mediaPaths.length === 0) {
    throw new Error('No compatible embedded images were found in this PPTX file.')
  }

  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true })
  const pageWidth = document.internal.pageSize.getWidth()
  const pageHeight = document.internal.pageSize.getHeight()

  for (let index = 0; index < mediaPaths.length; index++) {
    const media = zip.file(mediaPaths[index])
    if (!media) continue
    const image = await blobToCanvasData(await media.async('blob'))
    if (index > 0) document.addPage('a4', 'landscape')

    const scale = Math.min(pageWidth / image.width, pageHeight / image.height)
    const width = image.width * scale
    const height = image.height * scale
    document.addImage(image.dataUrl, 'JPEG', (pageWidth - width) / 2, (pageHeight - height) / 2, width, height, undefined, 'FAST')
    onProgress(15 + Math.round(((index + 1) / mediaPaths.length) * 80))
  }

  onProgress(100)
  return { blob: document.output('blob'), imageCount: mediaPaths.length }
}

export default function PptToPdfTool() {
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [outputFileName, setOutputFileName] = useState('')
  const [conversionMode, setConversionMode] = useState('local')

  const chooseFile = files => {
    const nextFile = files[0] || null
    setFile(nextFile)
    setOutputFileName(nextFile ? `${getDefaultFilename(nextFile)}-media` : '')
    setError('')
    setSuccess('')
  }

  const convert = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    setSuccess('')

    if (conversionMode === 'cloud') {
      try {
        const blob = await convertWithCloud(file, { sourceFormat: 'pptx', targetFormat: 'pdf' })
        downloadBlob(blob, getOutputFilename(outputFileName, `${getDefaultFilename(file)}-slides`))
        setSuccess('PPTX converted with high-fidelity cloud slide rendering.')
      } catch (conversionError) {
        console.error(conversionError)
        setError(conversionError.status === 401
          ? 'Cloud conversion is not configured. Add a valid CONVERT_API_SECRET, then try again or switch to Local.'
          : 'Cloud conversion failed: ' + (conversionError.message || conversionError))
      } finally {
        setBusy(false)
      }
      return
    }

    try {
      const result = await convertPptxMediaToPdf(file)
      downloadBlob(result.blob, getOutputFilename(outputFileName, `${getDefaultFilename(file)}-media`))
      setSuccess(`${result.imageCount} embedded image${result.imageCount === 1 ? '' : 's'} placed into a PDF.`)
    } catch (conversionError) {
      console.error(conversionError)
      setError(conversionError.message || 'Could not process this PPTX file.')
    } finally {
      setBusy(false)
    }
  }

  const processBatchFile = async (batchFile, index, onProgress) => {
    const result = await convertPptxMediaToPdf(batchFile, onProgress)
    return result.blob
  }

  return (
    <ToolLayout
      title="PPTX to PDF"
      description="Convert PowerPoint slides with cloud layout fidelity, or use the private local media fallback in your browser."
      steps={[{ num: '1', label: 'Choose PPTX' }, { num: '2', label: 'Convert slides' }, { num: '3', label: 'Download PDF' }]}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="grid grid-cols-2 rounded-2xl border border-border bg-secondary p-1.5">
          <button onClick={() => setBatchMode(false)} className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${!batchMode ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Single file</button>
          <button onClick={() => setBatchMode(true)} className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${batchMode ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Batch files</button>
        </div>

        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-500/10 p-4 text-sm leading-6 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p><strong>Accuracy note:</strong> this tool exports embedded media in package order. Text boxes, charts, animations, and full slide layouts require a native PowerPoint renderer.</p>
        </div>

        {batchMode ? (
          <UniversalBatchProcessor
            toolName="PPTX to PDF"
            processFile={processBatchFile}
            acceptedTypes=".pptx"
            outputExtension=".pdf"
          />
        ) : (
          <div className="space-y-5">
            <CloudConversionOption value={conversionMode} onChange={setConversionMode} disabled={busy} />

            {!file ? (
              <FileDropZone onFiles={chooseFile} accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" hint="PPTX files up to 100MB" maxSizeMB={100} />
            ) : (
              <div className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600"><FileImage className="h-6 w-6" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate font-black text-foreground">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                  <button onClick={() => chooseFile([])} disabled={busy} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-5"><FilenameInput value={outputFileName} onChange={event => setOutputFileName(event.target.value)} disabled={busy} placeholder="presentation-media" /></div>
              </div>
            )}

            {error && <div role="alert" className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}
            {success && <div role="status" className="flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5 shrink-0" />{success}</div>}

            {file && (
              <button onClick={convert} disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Files className="h-5 w-5" />}
                {busy ? (conversionMode === 'cloud' ? 'Converting slides...' : 'Extracting media...') : (conversionMode === 'cloud' ? 'Convert full slides to PDF' : 'Create PDF from embedded images')}
              </button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
