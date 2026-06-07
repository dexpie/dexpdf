import React, { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { useTranslation } from 'react-i18next'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import FilenameInput from '../components/FilenameInput'
import { getDefaultFilename, getOutputFilename } from '../utils/fileHelpers'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import { motion } from 'framer-motion'
import { Unlock, Lock, File as FileIcon, Eye, EyeOff, ShieldCheck, AlertCircle, KeyRound, CheckCircle, FileOutput } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

/**
 * UnlockPdfTool - Remove password protection from PDF
 */
export default function UnlockPdfTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [isEncrypted, setIsEncrypted] = useState(true)
  const [thumbnail, setThumbnail] = useState(null)

  async function handleFiles(files) {
    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_unlocked'))
    setErrorMsg('')
    setSuccessMsg('')
    setPassword('')
    setIsEncrypted(true)

    // Generate thumbnail
    try {
      const data = await f.arrayBuffer()
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.4 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      setThumbnail(canvas.toDataURL('image/jpeg', 0.7))
    } catch (e) {
      console.warn('Could not generate thumbnail', e)
    }

    // Check if encrypted
    try {
      await PDFDocument.load(data)
      setErrorMsg('This PDF is not password protected.')
      setIsEncrypted(false)
    } catch (err) {
      setIsEncrypted(true)
      setErrorMsg('')
    }
  }

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  async function unlockPdf() {
    if (!file) {
      setErrorMsg('Please select a PDF file first.')
      return
    }
    if (!password) {
      setErrorMsg('Please enter the password.')
      return
    }

    setBusy(true)
    setErrorMsg('')
    setSuccessMsg('')
    setProgress(0)

    try {
      setProgress(20)
      const array = await file.arrayBuffer()

      setProgress(40)
      const pdfjs = await import('pdfjs-dist')
      const source = await pdfjs.getDocument({ data: array, password }).promise
      const pdf = await PDFDocument.create()

      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber++) {
        setProgress(30 + Math.round((pageNumber / source.numPages) * 55))
        const sourcePage = await source.getPage(pageNumber)
        const viewport = sourcePage.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const context = canvas.getContext('2d', { alpha: false })
        context.fillStyle = '#fff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        await sourcePage.render({ canvasContext: context, viewport }).promise
        const pngBytes = await fetch(canvas.toDataURL('image/png')).then(response => response.arrayBuffer())
        const image = await pdf.embedPng(pngBytes)
        const page = pdf.addPage([viewport.width, viewport.height])
        page.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height })
      }

      const outBytes = await pdf.save({ useObjectStreams: true })

      setProgress(95)
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)

      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, 'pdf')
      a.click()

      setDownloadUrl(url)
      setSuccessMsg('Unlocked flattened copy created successfully!')
      triggerConfetti()
    } catch (err) {
      console.error(err)
      if (err.message?.includes('password')) {
        setErrorMsg('Incorrect password. Please try again.')
      } else {
        setErrorMsg('Failed to unlock PDF: ' + err.message)
      }
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  const resetFile = () => {
    setFile(null)
    setThumbnail(null)
    setOutputFileName('')
    setPassword('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
    setIsEncrypted(true)
  }

  return (
    <ToolLayout
      title="Unlock PDF"
      description="Create an unprotected flattened copy using the correct open password"
    >
      <div className="max-w-2xl mx-auto">

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border flex items-center gap-2 mb-6 ${
              isEncrypted
                ? 'bg-destructive/10 text-destructive border-destructive/20'
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </motion.div>
        )}

        {/* Success State */}
        {successMsg && downloadUrl && (
          <ResultPage
            title="PDF Unlocked Successfully!"
            description="Your PDF is now without password protection."
            downloadUrl={downloadUrl}
            downloadFilename={getOutputFilename(outputFileName, 'pdf')}
            sourceFile={{
              name: file?.name || 'unlocked.pdf',
              size: file?.size || 0,
              type: 'application/pdf'
            }}
            toolId="unlock"
            onReset={resetFile}
          />
        )}

        {/* Upload Zone */}
        {!file && (
          <FileDropZone
            onFiles={handleFiles}
            accept="application/pdf"
            disabled={busy}
            hint="Upload password-protected PDF"
          />
        )}

        {/* Editor */}
        {file && !successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* File Info */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                {/* Thumbnail */}
                <div className="w-16 h-20 bg-secondary rounded-xl border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {thumbnail ? (
                    <img src={thumbnail} alt="PDF Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{file.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{formatBytes(file.size)}</span>
                  </div>
                </div>
                <button
                  onClick={resetFile}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors"
                >
                  Change
                </button>
              </div>

              {/* Progress Bar */}
              {busy && (
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Password Section */}
            {isEncrypted && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-2 text-foreground font-semibold mb-4">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <span>Enter Password</span>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && unlockPdf()}
                    placeholder="Enter the password to unlock"
                    className="w-full pl-4 pr-20 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Enter the current password to remove protection.
                </p>
              </div>
            )}

            {/* Not Encrypted Message */}
            {!isEncrypted && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      This PDF is not protected
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      No password is required to open this file.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Output Filename */}
            {isEncrypted && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <FilenameInput
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  disabled={busy}
                  placeholder="unlocked"
                  label="Output Filename"
                />
              </div>
            )}

            {/* Action Button */}
            {isEncrypted && (
              <button
                onClick={unlockPdf}
                disabled={busy || !password}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Unlocking... {progress}%
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" />
                    Create Unlocked Copy
                  </>
                )}
              </button>
            )}

            {/* Alternative Action if not encrypted */}
            {!isEncrypted && (
              <button
                onClick={resetFile}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <FileOutput className="w-5 h-5" />
                Process Another File
              </button>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}
