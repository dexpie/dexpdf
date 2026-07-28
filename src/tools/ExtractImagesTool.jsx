'use client'

import React, { useState } from 'react'
import { saveAs } from 'file-saver'
import { AlertTriangle, CheckCircle2, FileImage, Files, Images, RefreshCw, X } from 'lucide-react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import FilenameInput from '../components/FilenameInput'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import { getDefaultFilename, getOutputFilename } from '../utils/fileHelpers'

configurePdfWorker()

function resolvePdfObject(store, name) {
  return new Promise((resolve, reject) => {
    let settled = false
    const finish = value => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true
        reject(new Error(`Timed out while reading embedded image ${name}.`))
      }
    }, 5000)

    try {
      const immediate = store.get(name, value => {
        window.clearTimeout(timer)
        finish(value)
      })
      if (immediate) {
        window.clearTimeout(timer)
        finish(immediate)
      }
    } catch (error) {
      window.clearTimeout(timer)
      reject(error)
    }
  })
}

function imageToPngBlob(image) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')

    const isImageBitmap = typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap
    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement
    const isHtmlImage = typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement

    if (image.bitmap || isImageBitmap || isCanvas || isHtmlImage) {
      context.drawImage(image.bitmap || image, 0, 0, canvas.width, canvas.height)
    } else if (image.data) {
      const pixels = image.data
      const pixelCount = image.width * image.height
      const rgba = new Uint8ClampedArray(pixelCount * 4)

      if (pixels.length === pixelCount * 4) {
        rgba.set(pixels)
      } else if (pixels.length === pixelCount * 3) {
        for (let source = 0, target = 0; source < pixels.length; source += 3, target += 4) {
          rgba[target] = pixels[source]
          rgba[target + 1] = pixels[source + 1]
          rgba[target + 2] = pixels[source + 2]
          rgba[target + 3] = 255
        }
      } else if (pixels.length === pixelCount) {
        for (let source = 0, target = 0; source < pixels.length; source += 1, target += 4) {
          rgba[target] = pixels[source]
          rgba[target + 1] = pixels[source]
          rgba[target + 2] = pixels[source]
          rgba[target + 3] = 255
        }
      } else {
        reject(new Error('Unsupported embedded image pixel format.'))
        return
      }
      context.putImageData(new ImageData(rgba, image.width, image.height), 0, 0)
    } else {
      reject(new Error('Embedded image data is unavailable.'))
      return
    }

    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode an extracted image.')), 'image/png')
  })
}

async function extractImagesFromPdf(file, onProgress = () => {}) {
  const pdfjs = await import('pdfjs-dist')
  const JSZip = (await import('jszip')).default
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const zip = new JSZip()
  let extractedCount = 0

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const operators = await page.getOperatorList()

    for (let index = 0; index < operators.fnArray.length; index++) {
      const operation = operators.fnArray[index]
      let image = null
      if (operation === pdfjs.OPS.paintInlineImageXObject) {
        image = operators.argsArray[index][0]
      } else if (operation === pdfjs.OPS.paintImageXObject || operation === pdfjs.OPS.paintJpegXObject) {
        image = await resolvePdfObject(page.objs, operators.argsArray[index][0]).catch(() => null)
      }

      if (!image?.width || !image?.height) continue
      try {
        const blob = await imageToPngBlob(image)
        extractedCount += 1
        zip.file(`page-${String(pageNumber).padStart(3, '0')}/image-${String(extractedCount).padStart(3, '0')}.png`, blob)
      } catch (error) {
        console.warn('Skipped unsupported embedded image', error)
      }
    }
    onProgress(Math.round((pageNumber / pdf.numPages) * 90))
    page.cleanup()
  }

  await pdf.destroy()
  if (extractedCount === 0) throw new Error('No compatible embedded raster images were found. Scanned pages may need PDF to JPG instead.')
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  onProgress(100)
  return { blob, extractedCount }
}

export default function ExtractImagesTool() {
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [outputFileName, setOutputFileName] = useState('')

  const chooseFile = files => {
    const nextFile = files[0] || null
    setFile(nextFile)
    setOutputFileName(nextFile ? `${getDefaultFilename(nextFile)}-images` : '')
    setError('')
    setSuccess('')
  }

  const extract = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const result = await extractImagesFromPdf(file)
      saveAs(result.blob, getOutputFilename(outputFileName, `${getDefaultFilename(file)}-images`, '.zip'))
      setSuccess(`${result.extractedCount} compatible image${result.extractedCount === 1 ? '' : 's'} extracted into a ZIP file.`)
    } catch (extractionError) {
      console.error(extractionError)
      setError(extractionError.message || 'Could not extract images from this PDF.')
    } finally {
      setBusy(false)
    }
  }

  const processBatchFile = async (batchFile, index, onProgress) => {
    const result = await extractImagesFromPdf(batchFile, onProgress)
    return result.blob
  }

  return (
    <ToolLayout
      title="Extract Images"
      description="Extract compatible embedded raster images from PDF objects into organized PNG files."
      steps={[{ num: '1', label: 'Choose PDF' }, { num: '2', label: 'Inspect objects' }, { num: '3', label: 'Download ZIP' }]}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="grid grid-cols-2 rounded-2xl border border-border bg-secondary p-1.5">
          <button onClick={() => setBatchMode(false)} className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${!batchMode ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Single PDF</button>
          <button onClick={() => setBatchMode(true)} className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${batchMode ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Batch PDFs</button>
        </div>

        <div className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
          <Images className="mt-0.5 h-5 w-5 shrink-0" />
          <p>This extracts image objects, not a screenshot of every page. For scanned or flattened pages, use <strong>PDF to JPG</strong> instead.</p>
        </div>

        {batchMode ? (
          <UniversalBatchProcessor toolName="Extract Images" processFile={processBatchFile} acceptedTypes="application/pdf" outputExtension=".zip" />
        ) : (
          <div className="space-y-5">
            {!file ? (
              <FileDropZone onFiles={chooseFile} accept="application/pdf" hint="Select one PDF with embedded images" maxSizeMB={100} />
            ) : (
              <div className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600"><FileImage className="h-6 w-6" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate font-black text-foreground">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                  <button onClick={() => chooseFile([])} disabled={busy} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-5"><FilenameInput value={outputFileName} onChange={event => setOutputFileName(event.target.value)} disabled={busy} placeholder="extracted-images" /></div>
              </div>
            )}

            {error && <div role="alert" className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}
            {success && <div role="status" className="flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5 shrink-0" />{success}</div>}

            {file && (
              <button onClick={extract} disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Files className="h-5 w-5" />}
                {busy ? 'Inspecting PDF objects...' : 'Extract images to ZIP'}
              </button>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
