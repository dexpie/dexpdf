'use client'

import React, { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { PDFDocument } from 'pdf-lib'
import { AlertTriangle, Camera, Download, Images, RefreshCw, Trash2 } from 'lucide-react'
import ToolLayout from '../components/common/ToolLayout'
import { triggerConfetti } from '../utils/confetti'
import { getOutputFilename } from '../utils/fileHelpers'

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

export default function ScanTool() {
  const webcamRef = useRef(null)
  const fileInputRef = useRef(null)
  const [images, setImages] = useState([])
  const [isBusy, setIsBusy] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [error, setError] = useState('')

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setImages(current => [...current, imageSrc])
      setError('')
    } else {
      setError('The camera is not ready yet. Allow camera access or import photos instead.')
    }
  }, [])

  const importPhotos = async event => {
    try {
      const selected = Array.from(event.target.files || [])
      if (!selected.length) return
      const dataUrls = await Promise.all(selected.map(readImageFile))
      setImages(current => [...current, ...dataUrls])
      setError('')
    } catch (importError) {
      setError(importError.message || 'Could not import these photos.')
    } finally {
      event.target.value = ''
    }
  }

  const generatePdf = async () => {
    if (images.length === 0) return
    setIsBusy(true)
    setError('')
    try {
      const pdfDoc = await PDFDocument.create()
      for (const imageDataUrl of images) {
        const image = imageDataUrl.startsWith('data:image/png')
          ? await pdfDoc.embedPng(imageDataUrl)
          : await pdfDoc.embedJpg(imageDataUrl)
        const page = pdfDoc.addPage([595, 842])
        const { width, height } = image.scale(1)
        const scale = Math.min(555 / width, 802 / height)
        const displayWidth = width * scale
        const displayHeight = height * scale
        page.drawImage(image, {
          x: (595 - displayWidth) / 2,
          y: (842 - displayHeight) / 2,
          width: displayWidth,
          height: displayHeight,
        })
      }

      const blob = new Blob([await pdfDoc.save()], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = getOutputFilename(null, 'scanned-document', '.pdf')
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      triggerConfetti()
    } catch (generationError) {
      console.error(generationError)
      setError(generationError.message || 'Failed to generate the scanned PDF.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <ToolLayout title="Scan to PDF" description="Capture pages with your camera or import photos, then combine them into one PDF.">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
          <div className="relative flex aspect-[3/4] items-center justify-center md:aspect-video">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.92}
              videoConstraints={{ width: 1920, height: 1080, facingMode }}
              onUserMedia={() => setError('')}
              onUserMediaError={() => setError('Camera access failed. Check browser permission or import photos instead.')}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-5">
              <button type="button" onClick={() => setFacingMode(mode => mode === 'user' ? 'environment' : 'user')} className="rounded-full bg-black/55 p-3 text-white backdrop-blur hover:bg-black/70" aria-label="Switch camera"><RefreshCw className="h-5 w-5" /></button>
              <button type="button" onClick={capture} className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-xl transition active:scale-95" aria-label="Capture page"><span className="h-12 w-12 rounded-full bg-blue-600" /></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full bg-black/55 p-3 text-white backdrop-blur hover:bg-black/70" aria-label="Import photos"><Images className="h-5 w-5" /></button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" multiple onChange={importPhotos} className="hidden" />
            </div>
          </div>
        </div>

        <aside className="flex min-h-[28rem] flex-col rounded-3xl border border-border bg-background p-4">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-black text-foreground">Pages ({images.length})</h2>{images.length > 0 && <button onClick={() => setImages([])} className="text-xs font-bold text-destructive">Clear all</button>}</div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {images.length === 0 ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground"><Camera className="mb-3 h-8 w-8 opacity-50" />Capture a page or import photos.</div>
            ) : images.map((image, index) => (
              <div key={`${image.slice(0, 32)}-${index}`} className="group relative overflow-hidden rounded-xl border border-border bg-card">
                <img src={image} alt={`Scanned page ${index + 1}`} className="h-36 w-full object-cover" />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white">Page {index + 1}</span>
                <button onClick={() => setImages(current => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-2 rounded-lg bg-destructive p-2 text-white opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Remove page ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>

          {error && <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs leading-5 text-destructive"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</div>}
          <button onClick={generatePdf} disabled={images.length === 0 || isBusy} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isBusy ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}{isBusy ? 'Building PDF...' : 'Download PDF'}
          </button>
        </aside>
      </div>
    </ToolLayout>
  )
}
