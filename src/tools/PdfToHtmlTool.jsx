import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { FileCode, Download, FileText, AlertTriangle } from 'lucide-react'
import { saveAs } from 'file-saver'

/**
 * PdfToHtmlTool - Convert PDF to HTML
 */
export default function PdfToHtmlTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [outputFormat, setOutputFormat] = useState('html')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [previewText, setPreviewText] = useState('')

  async function handleFileChange(files) {
    setErrorMsg('')
    setSuccessMsg('')
    setPreviewText('')

    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setFile(f)
  }

  async function convertPdf() {
    if (!file) return

    setBusy(true)
    setProgress(0)
    setErrorMsg('')

    try {
      const data = await file.arrayBuffer()
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data }).promise
      const numPages = pdf.numPages

      let fullText = ''
      let htmlContent = ''

      if (outputFormat === 'html') {
        htmlContent = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>Converted from PDF</title>\n<style>\nbody { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }\n.page { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; }\n</style>\n</head>\n<body>\n'
      }

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')

        fullText += pageText + '\n\n'

        if (outputFormat === 'html') {
          const escapedText = pageText.replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char])
          htmlContent += `<section class="page">\n<h2>Page ${i}</h2>\n<p>${escapedText}</p>\n</section>\n`
        }

        setProgress(Math.round((i / numPages) * 80))
      }

      setProgress(90)

      if (outputFormat === 'html') {
        htmlContent += '</body>\n</html>'
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
        saveAs(blob, file.name.replace('.pdf', '.html'))
      } else {
        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' })
        saveAs(blob, file.name.replace('.pdf', '.txt'))
      }

      setPreviewText(fullText.substring(0, 500) + '...')
      setSuccessMsg('Converted successfully!')
      setProgress(100)

    } catch (e) {
      console.error('Error converting:', e)
      setErrorMsg('Error converting PDF. Please try again.')
    }

    setBusy(false)
  }

  function handleReset() {
    setFile(null)
    setPreviewText('')
    setErrorMsg('')
    setSuccessMsg('')
  }

  const formats = [
    { id: 'html', label: 'HTML', icon: FileCode },
    { id: 'text', label: 'Plain Text', icon: FileText },
  ]

  return (
    <ToolLayout title="PDF to HTML" description="Export readable PDF text into a simple semantic HTML document">
      <div className="max-w-4xl mx-auto">
        {!file && (
          <FileDropZone
            accept=".pdf"
            onChange={handleFileChange}
            icon={<FileCode className="w-12 h-12 text-primary" />}
            title="Upload PDF"
            subtitle="Convert PDF to HTML, Markdown, or EPUB"
          />
        )}

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">{file.name}</h3>
              <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-foreground">
                Remove
              </button>
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-3 block">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                {formats.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setOutputFormat(fmt.id)}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 text-sm font-medium transition-all ${
                      outputFormat === fmt.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-muted'
                    }`}
                  >
                    <fmt.icon className="w-5 h-5" />
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {previewText && (
              <div className="mb-4 p-4 bg-secondary rounded-lg max-h-48 overflow-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{previewText}</p>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 bg-destructive/10 dark:bg-red-950/30 border border-red-200 rounded-lg flex items-center gap-2 text-red-600"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action */}
            <button
              onClick={convertPdf}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Converting... {progress}%
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Convert to {formats.find(f => f.id === outputFormat)?.label}
                </>
              )}
            </button>

            {busy && (
              <div className="mt-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}
