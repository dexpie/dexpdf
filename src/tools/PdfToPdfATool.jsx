'use client'

import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import { AlertTriangle, Archive, CheckCircle2, FileCheck2, RefreshCw, ShieldCheck, X } from 'lucide-react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import FilenameInput from '../components/FilenameInput'
import { getDefaultFilename, getOutputFilename } from '../utils/fileHelpers'

export default function PdfToPdfATool() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [outputFileName, setOutputFileName] = useState('')
  const [metadata, setMetadata] = useState({ title: '', author: '', subject: '' })

  const chooseFile = files => {
    const nextFile = files[0] || null
    setFile(nextFile)
    setOutputFileName(nextFile ? `${getDefaultFilename(nextFile)}-archival-prep` : '')
    setMetadata({ title: nextFile ? getDefaultFilename(nextFile) : '', author: '', subject: '' })
    setError('')
    setSuccess('')
  }

  const prepareFile = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const document = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false })
      const now = new Date()
      document.setTitle(metadata.title.trim() || getDefaultFilename(file))
      if (metadata.author.trim()) document.setAuthor(metadata.author.trim())
      if (metadata.subject.trim()) document.setSubject(metadata.subject.trim())
      document.setCreator('DexPDF')
      document.setProducer('DexPDF local archival preparation')
      document.setModificationDate(now)

      const output = await document.save({ useObjectStreams: true, addDefaultPage: false })
      saveAs(new Blob([output], { type: 'application/pdf' }), getOutputFilename(outputFileName, `${getDefaultFilename(file)}-archival-prep`))
      setSuccess('Metadata normalized and PDF structure rebuilt. Formal PDF/A validation is still required.')
    } catch (preparationError) {
      console.error(preparationError)
      setError(preparationError.message || 'Could not prepare this PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout
      title="Archival Metadata Prep"
      description="Normalize common metadata and rebuild a readable PDF before formal PDF/A conversion or validation."
      steps={[{ num: '1', label: 'Choose PDF' }, { num: '2', label: 'Set metadata' }, { num: '3', label: 'Validate later' }]}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex gap-3 rounded-2xl border border-blue-200 bg-primary/10 p-4 text-sm leading-6 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p><strong>Honest scope:</strong> browser-side metadata changes cannot guarantee PDF/A conformance. Fonts, color profiles, transparency, and XMP still need a certified converter and validator.</p>
        </div>

        {!file ? (
          <FileDropZone onFiles={chooseFile} accept="application/pdf" hint="Your PDF stays in this browser" maxSizeMB={100} />
        ) : (
          <div className="space-y-5 rounded-2xl border border-border bg-background p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600"><Archive className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1"><p className="truncate font-black text-foreground">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
              <button onClick={() => chooseFile([])} disabled={busy} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Document title</span><input value={metadata.title} onChange={event => setMetadata(current => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" /></label>
              <label className="space-y-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Author</span><input value={metadata.author} onChange={event => setMetadata(current => ({ ...current, author: event.target.value }))} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" placeholder="Optional" /></label>
              <label className="space-y-2 md:col-span-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Subject</span><input value={metadata.subject} onChange={event => setMetadata(current => ({ ...current, subject: event.target.value }))} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" placeholder="Optional archival description" /></label>
            </div>

            <FilenameInput value={outputFileName} onChange={event => setOutputFileName(event.target.value)} disabled={busy} placeholder="archival-prep" />

            <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
              {[['Metadata', 'Normalized info fields'], ['Structure', 'Re-serialized PDF objects'], ['Compliance', 'External validation needed']].map(([label, detail]) => (
                <div key={label}><p className="text-xs font-black text-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>
              ))}
            </div>

            {error && <div role="alert" className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}
            {success && <div role="status" className="flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5 shrink-0" />{success}</div>}

            <button onClick={prepareFile} disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? <RefreshCw className="h-5 w-5 animate-spin" /> : <FileCheck2 className="h-5 w-5" />}
              {busy ? 'Preparing file...' : 'Prepare archival metadata'}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
