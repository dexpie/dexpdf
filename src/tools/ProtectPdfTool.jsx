import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import FilenameInput from '../components/FilenameInput'
import { getDefaultFilename, getOutputFilename } from '../utils/fileHelpers'
import { configurePdfWorker } from '../utils/pdfWorker'
import { triggerConfetti } from '../utils/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, File as FileIcon, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle, XCircle, Info, Key, FileOutput, Copy, RefreshCw } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

configurePdfWorker()

/**
 * Calculate password strength
 */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: 'Enter password', color: 'bg-muted', width: '0%' }

  let score = 0

  // Length checks
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character type checks
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  // Common patterns (penalty)
  if (/^[a-z]+$/i.test(password)) score -= 1 // Only letters
  if (/^[0-9]+$/.test(password)) score -= 1 // Only numbers
  if (/(.)\1{2,}/.test(password)) score -= 1 // Repeated characters

  score = Math.max(0, Math.min(score, 7))

  const levels = [
    { score: 0, label: 'Too weak', color: 'bg-muted', width: '0%' },
    { score: 1, label: 'Weak', color: 'bg-red-500', width: '15%' },
    { score: 2, label: 'Weak', color: 'bg-red-500', width: '25%' },
    { score: 3, label: 'Fair', color: 'bg-orange-500', width: '40%' },
    { score: 4, label: 'Good', color: 'bg-yellow-500', width: '55%' },
    { score: 5, label: 'Strong', color: 'bg-green-500', width: '70%' },
    { score: 6, label: 'Very Strong', color: 'bg-green-600', width: '85%' },
    { score: 7, label: 'Excellent', color: 'bg-green-600', width: '100%' },
  ]

  return levels[score]
}

/**
 * ProtectPdfTool - Add password protection to PDF
 * Features: Password strength indicator, permissions control
 */
export default function ProtectPdfTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [thumbnail, setThumbnail] = useState(null)

  // Permission states
  const [allowPrint, setAllowPrint] = useState(true)
  const [allowCopy, setAllowCopy] = useState(false)
  const [allowEdit, setAllowEdit] = useState(false)

  // Password strength
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  async function handleFiles(files) {
    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_protected'))
    setErrorMsg('')
    setSuccessMsg('')
    setPassword('')
    setConfirmPassword('')

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
  }

  function formatBytes(n) {
    if (n == null) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / (1024 * 1024)).toFixed(2) + ' MB'
  }

  async function protectPdf() {
    if (!file) {
      setErrorMsg('Please select a PDF file first.')
      return
    }
    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setBusy(true)
    setErrorMsg('')
    setSuccessMsg('')
    setProgress(0)

    try {
      setProgress(20)
      const array = await file.arrayBuffer()
      const { PDFDocument } = await import('pdf-lib-plus-encrypt')
      const pdf = await PDFDocument.load(array)

      // Build permissions object
      const permissions = {
        printing: allowPrint ? 'highResolution' : 'lowResolution',
        modifying: allowEdit,
        copying: allowCopy,
        annotating: allowEdit,
        fillingForms: allowEdit,
        contentAccessibility: false,
        documentAssembly: false,
      }

      setProgress(80)
      await pdf.encrypt({
        userPassword: password,
        ownerPassword: generateOwnerPassword(),
        permissions,
      })

      setProgress(95)
      const outBytes = await pdf.save()
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setProgress(100)

      setDownloadUrl(url)
      setSuccessMsg('PDF protected successfully!')
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to protect PDF: ' + err.message)
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
    setConfirmPassword('')
    setSuccessMsg('')
    setDownloadUrl(null)
    setErrorMsg('')
  }

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let result = ''
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(result)
    setConfirmPassword(result)
  }

  const generateOwnerPassword = () => {
    const bytes = new Uint8Array(24)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('')
  }

  return (
    <ToolLayout
      title="Protect PDF"
      description="Add password protection to your PDF documents"
    >
      <div className="max-w-2xl mx-auto">

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-2 mb-6"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </motion.div>
        )}

        {/* Success State */}
        {successMsg && downloadUrl && (
          <ResultPage
            title="PDF Protected Successfully!"
            description="Your password-protected PDF is ready."
            downloadUrl={downloadUrl}
            downloadFilename={getOutputFilename(outputFileName, 'pdf')}
            sourceFile={{
              name: file?.name || 'protected.pdf',
              size: file?.size || 0,
              type: 'application/pdf'
            }}
            toolId="protect"
            onReset={resetFile}
          />
        )}

        {/* Upload Zone */}
        {!file && (
          <FileDropZone
            onFiles={handleFiles}
            accept="application/pdf"
            disabled={busy}
            hint="Upload PDF to protect with password"
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
                    <FileIcon className="w-6 h-6 text-muted-foreground" />
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
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 text-foreground font-semibold mb-4">
                <Key className="w-5 h-5 text-primary" />
                <span>Set Password</span>
              </div>

              {/* Password Input */}
              <div className="space-y-4 mb-4">
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-4 pr-20 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Password strength</span>
                        <span className={`font-medium ${
                          passwordStrength.score < 3 ? 'text-red-500' :
                          passwordStrength.score < 5 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${passwordStrength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: passwordStrength.width }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && password.length >= 4 && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                {/* Generate Random Password */}
                <button
                  onClick={generateRandomPassword}
                  className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate strong password
                </button>
              </div>
            </div>

            {/* Permissions Section */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 text-foreground font-semibold mb-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Permissions</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 cursor-pointer">
                  <span className="text-foreground">Allow printing</span>
                  <input
                    type="checkbox"
                    checked={allowPrint}
                    onChange={(e) => setAllowPrint(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 cursor-pointer">
                  <span className="text-foreground">Allow copying text</span>
                  <input
                    type="checkbox"
                    checked={allowCopy}
                    onChange={(e) => setAllowCopy(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 cursor-pointer">
                  <span className="text-foreground">Allow editing</span>
                  <input
                    type="checkbox"
                    checked={allowEdit}
                    onChange={(e) => setAllowEdit(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </label>
              </div>
            </div>

            {/* Output Filename */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <FilenameInput
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                disabled={busy}
                placeholder="protected"
                label="Output Filename"
              />
            </div>

            {/* Action Buttons */}
            <button
              onClick={protectPdf}
              disabled={busy || password.length < 4 || password !== confirmPassword}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Protecting... {progress}%
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Protect PDF
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}
