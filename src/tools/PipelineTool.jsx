import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ResultPage from '../components/common/ResultPage'
import { ArrowDown, ArrowUp, FileText, Lock, Layers, Zap, X, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

configurePdfWorker()

function formatBytes(n) {
  if (!n) return '-'
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function PipelineTool() {
  const [files, setFiles] = useState([])
  const [quality, setQuality] = useState(0.7)
  const [mergeIntoOne, setMergeIntoOne] = useState(true)
  const [usePassword, setUsePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [outputFileName, setOutputFileName] = useState('pipeline-output')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [multipleDownloads, setMultipleDownloads] = useState([])
  const [originalSize, setOriginalSize] = useState(0)
  const [outputSize, setOutputSize] = useState(0)

  const addFiles = (incoming) => {
    const pdfs = incoming.filter(f => f.name.toLowerCase().endsWith('.pdf'))
    if (pdfs.length === 0) {
      setErrorMsg('Only PDF files are supported.')
      return
    }
    setErrorMsg('')
    setFiles(prev => [...prev, ...pdfs])
    if (!outputFileName) setOutputFileName(getDefaultFilename(pdfs[0], '_pipeline'))
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const moveFile = (index, direction) => {
    setFiles(prev => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return next
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function compressFileToDoc(file, onStageProgress) {
    const inputBytes = await file.arrayBuffer()
    const source = await pdfjsLib.getDocument({ data: inputBytes.slice(0) }).promise
    const doc = await PDFDocument.create()

    for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber++) {
      onStageProgress(pageNumber / source.numPages)
      const page = await source.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const context = canvas.getContext('2d', { alpha: false })
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: context, viewport }).promise
      const jpegBlob = await new Promise((resolve, reject) =>
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode page.')), 'image/jpeg', quality)
      )
      const image = await doc.embedJpg(await jpegBlob.arrayBuffer())
      const outputPage = doc.addPage([viewport.width, viewport.height])
      outputPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height })
      page.cleanup()
    }
    return doc
  }

  async function run() {
    if (files.length === 0) {
      setErrorMsg('Add at least one PDF file.')
      return
    }
    if (usePassword && password.length < 4) {
      setErrorMsg('Use a password of at least 4 characters.')
      return
    }
    if (usePassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setBusy(true)
    setErrorMsg('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setMultipleDownloads([])
    setOriginalSize(files.reduce((sum, f) => sum + f.size, 0))

    try {
      const compressedDocs = []
      for (let i = 0; i < files.length; i++) {
        setProgressText(`Compressing ${files[i].name} (${i + 1}/${files.length})...`)
        const doc = await compressFileToDoc(files[i], ratio => {
          setProgress(Math.round(((i + ratio) / files.length) * 70))
        })
        compressedDocs.push(doc)
      }

      let finalDoc
      let finalName

      if (mergeIntoOne || usePassword) {
        setProgressText('Merging documents...')
        setProgress(75)
        finalDoc = await PDFDocument.create()
        for (const doc of compressedDocs) {
          const copied = await finalDoc.copyPages(doc, doc.getPageIndices())
          copied.forEach(page => finalDoc.addPage(page))
        }
        finalName = getOutputFilename(outputFileName || 'pipeline-output', 'pdf')
      } else {
        setProgressText('Preparing downloads...')
        setProgress(85)
        const downloads = []
        for (const doc of compressedDocs) {
          const bytes = await doc.save({ useObjectStreams: true })
          const blob = new Blob([bytes], { type: 'application/pdf' })
          downloads.push({ url: URL.createObjectURL(blob), name: getOutputFilename(outputFileName || 'compressed', 'pdf') })
        }
        setOutputSize(downloads.reduce((sum, d, i) => sum + d.url.length * 0 + compressedDocs[i].pageCount * 0, 0))
        setProgress(100)
        setMultipleDownloads(downloads)
        triggerConfetti()
        setSuccessMsg(`Pipeline complete — ${downloads.length} file(s) ready.`)
        return
      }

      let outBytes = await finalDoc.save({ useObjectStreams: true })

      if (usePassword) {
        setProgressText('Encrypting with your password...')
        setProgress(88)
        const { PDFDocument: EncryptDoc } = await import('pdf-lib-plus-encrypt')
        const encrypted = await EncryptDoc.load(outBytes)
        await encrypted.encrypt({
          userPassword: password,
          ownerPassword: password + '_owner',
          permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false,
          },
        })
        outBytes = await encrypted.save()
      }

      setProgress(95)
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      setOutputSize(blob.size)
      setDownloadUrl(URL.createObjectURL(blob))
      setProgress(100)
      triggerConfetti()
      setSuccessMsg(usePassword ? 'Pipeline complete — merged and protected.' : 'Pipeline complete — merged into one PDF.')
    } catch (err) {
      console.error(err)
      setErrorMsg('Pipeline failed: ' + (err.message || err))
    } finally {
      setBusy(false)
      setProgressText('')
    }
  }

  return (
    <ToolLayout
      title="Batch Pipeline"
      description="Compress, merge, and protect multiple PDFs in one local run — no uploads, no servers."
    >
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" /> {errorMsg}
          </div>
        )}

        {successMsg && downloadUrl ? (
          <ResultPage
            title="Pipeline Complete!"
            description={successMsg}
            downloadUrl={downloadUrl}
            downloadFilename={getOutputFilename(outputFileName, 'pdf')}
            sourceFile={{ name: `${files.length} file(s)`, size: originalSize, type: 'application/pdf' }}
            toolId="pipeline"
            stats={[
              { label: 'Files', value: String(files.length) },
              { label: 'Original', value: formatBytes(originalSize) },
              { label: 'Result', value: formatBytes(outputSize), highlight: true },
            ]}
            onReset={() => {
              setFiles([])
              setPassword('')
              setConfirmPassword('')
              setUsePassword(false)
              setSuccessMsg('')
              setDownloadUrl(null)
              setOutputSize(0)
            }}
          />
        ) : successMsg && multipleDownloads.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-3 text-xl font-bold text-foreground">{successMsg}</h2>
            <div className="mt-6 flex flex-col items-center gap-3">
              {multipleDownloads.map(item => (
                <a key={item.name} href={item.url} download={item.name}
                  className="inline-flex min-h-11 w-full max-w-md items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90">
                  <FileText className="h-4 w-4" /> {item.name}
                </a>
              ))}
              <button onClick={() => { setFiles([]); setSuccessMsg(''); setMultipleDownloads([]) }}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                Run another pipeline
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <FileDropZone onFiles={addFiles} accept="application/pdf" multiple title="Drop your PDFs here" hint="Order matters when merging — you can reorder after adding." />

            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
                <p className="boundary-label mb-4">Queue ({files.length})</p>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                      <span className="font-mono text-xs font-bold text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{file.name}</span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">{formatBytes(file.size)}</span>
                      {!mergeIntoOne ? null : (
                        <span className="flex gap-1">
                          <button onClick={() => moveFile(index, -1)} disabled={busy || index === 0} aria-label="Move up"
                            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-30">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button onClick={() => moveFile(index, 1)} disabled={busy || index === files.length - 1} aria-label="Move down"
                            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-30">
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </span>
                      )}
                      <button onClick={() => removeFile(index)} disabled={busy} aria-label={`Remove ${file.name}`}
                        className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-30">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-5 border-t border-border pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <label htmlFor="pipe-quality" className="text-sm font-semibold text-foreground">Compression quality</label>
                    <span className="font-mono text-xs text-primary">{Math.round(quality * 100)}%</span>
                    <input id="pipe-quality" type="range" min="0.3" max="1" step="0.1" value={quality}
                      onChange={e => setQuality(parseFloat(e.target.value))} disabled={busy}
                      className="sr-only peer" />
                  </div>
                  <input type="range" min="0.3" max="1" step="0.1" value={quality}
                    onChange={e => setQuality(parseFloat(e.target.value))} disabled={busy}
                    aria-hidden="true"
                    className="-mt-3 w-full accent-[#35D68E]" />

                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={mergeIntoOne} onChange={e => setMergeIntoOne(e.target.checked)} disabled={busy}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-[#35D68E]" />
                    <span className="text-sm text-foreground"><Layers className="mr-1.5 inline h-4 w-4 text-primary" />Merge all files into one PDF</span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={usePassword} onChange={e => setUsePassword(e.target.checked)} disabled={busy}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-[#35D68E]" />
                    <span className="text-sm text-foreground"><Lock className="mr-1.5 inline h-4 w-4 text-primary" />Protect result with a password</span>
                  </label>

                  {usePassword && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                        autoComplete="new-password" disabled={busy}
                        className="rounded-md border border-[hsl(var(--hairline)/0.4)] bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring" />
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password"
                        autoComplete="new-password" disabled={busy}
                        className="rounded-md border border-[hsl(var(--hairline)/0.4)] bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring" />
                    </div>
                  )}

                  <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} placeholder="pipeline-output" label="Output filename" helperText="Applied to the merged file or as prefix per file" />
                </div>
              </motion.div>
            )}

            {busy && (
              <div className="glass rounded-xl p-5 text-center">
                <p className="text-sm font-semibold text-foreground">{progressText}</p>
                <div className="mx-auto mt-3 h-2 max-w-md overflow-hidden rounded-full bg-secondary">
                  <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 font-mono text-xs text-muted-foreground">{progress}%</p>
              </div>
            )}

            {files.length > 0 && !busy && !successMsg && (
              <button onClick={run}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90">
                <Zap className="h-4 w-4" />
                Run pipeline ({files.length} file{files.length > 1 ? 's' : ''}{mergeIntoOne ? ', merged' : ''}{usePassword ? ', protected' : ''})
              </button>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
