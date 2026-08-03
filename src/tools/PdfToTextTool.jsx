import React, { useState, useRef, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FilenameInput from '../components/FilenameInput'
import { downloadBlob, getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { FileText, AlertCircle, CheckCircle, Settings, AlignLeft, Type } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

configurePdfWorker()

export default function PdfToTextTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('')
  const [progressText, setProgressText] = useState('')
  const [includePageHeaders, setIncludePageHeaders] = useState(true)
  const [extractMode, setExtractMode] = useState('text') // text or raw

  async function handleFileChange(files) {
    setErrorMsg('')
    setSuccessMsg('')
    const f = files[0]
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg(t('tools.pdfToText.errorPdf', 'Please select a PDF file.'))
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      setErrorMsg(t('tools.pdfToText.errorSize', 'File is too large (max 50MB).'))
      return
    }
    setFile(f)
    setOutputFileName(getDefaultFilename(f))
  }

  async function extract() {
    if (!file) {
      setErrorMsg(t('tools.pdfToText.errorNoFile', 'Please select a PDF file first.'))
      return
    }
    setErrorMsg('')
    setSuccessMsg('')
    setBusy(true)
    setProgressText(t('tools.pdfToText.reading', 'Reading PDF...'))

    try {
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      let out = ''
      const numPages = pdf.numPages

      const BATCH_SIZE = 10
      for (let start = 1; start <= numPages; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, numPages)
        const pagePromises = []
        for (let i = start; i <= end; i++) {
          pagePromises.push(
            pdf
              .getPage(i)
              .then(async (page) => {
                const txtContent = await page.getTextContent()
                const strings = txtContent.items.map((it) => it.str)
                return {
                  pageNum: i,
                  text: includePageHeaders
                    ? `\n--- Page ${i} ---\n` + strings.join(' ') + '\n'
                    : strings.join(' ') + '\n',
                }
              })
              .catch((e) => ({ pageNum: i, text: `\n--- Page ${i} (Error) ---\n` }))
          )
        }
        const pagesData = await Promise.all(pagePromises)
        pagesData.sort((a, b) => a.pageNum - b.pageNum)
        for (const { text } of pagesData) out += text
        setProgressText(
          t('tools.pdfToText.progress', 'Processing... {{percent}}%', {
            percent: Math.round((end / numPages) * 100),
          })
        )
      }

      const blob = new Blob([out], { type: 'text/plain' })
      downloadBlob(blob, getOutputFilename(
        outputFileName,
        file.name.replace(/\.pdf$/i, ''),
        '.txt'
      ))

      setSuccessMsg(t('tools.pdfToText.success', 'Success! Text extracted and downloaded.'))
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg(t('tools.pdfToText.error', 'Failed: {{message}}', { message: err.message || err }))
    } finally {
      setBusy(false)
      setProgressText('')
    }
  }

  // Batch processing
  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      onProgress(25)

      let out = ''
      const numPages = pdf.numPages
      const BATCH_SIZE = 10

      for (let start = 1; start <= numPages; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, numPages)
        const pagePromises = []
        for (let i = start; i <= end; i++) {
          pagePromises.push(
            pdf
              .getPage(i)
              .then(async (page) => {
                const txtContent = await page.getTextContent()
                const strings = txtContent.items.map((it) => it.str)
                return {
                  pageNum: i,
                  text: includePageHeaders
                    ? `\n--- Page ${i} ---\n` + strings.join(' ') + '\n'
                    : strings.join(' ') + '\n',
                }
              })
              .catch((e) => ({ pageNum: i, text: `\n--- Page ${i} (Error) ---\n` }))
          )
        }
        const pagesData = await Promise.all(pagePromises)
        pagesData.sort((a, b) => a.pageNum - b.pageNum)
        for (const { text } of pagesData) out += text
        onProgress(25 + (end / numPages) * 65)
      }

      onProgress(90)
      const blob = new Blob([out], { type: 'text/plain' })
      onProgress(100)
      return blob
    } catch (error) {
      console.error(`Error extracting text from ${file.name}:`, error)
      throw error
    }
  }

  return (
    <ToolLayout
      title={t('tools.pdfToText.title', 'PDF to Text')}
      description={t(
        'tools.pdfToText.description',
        'Extract plain text from PDF documents quickly and accurately'
      )}
    >
      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            !batchMode
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground dark:text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          onClick={() => setBatchMode(false)}
        >
          {t('tools.common.singleFile', '📄 Single File')}
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            batchMode
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground dark:text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          onClick={() => setBatchMode(true)}
        >
          {t('tools.common.batchConvert', '🔄 Batch Convert')}
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          toolName={t('tools.pdfToText.title', 'Extract Text')}
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".txt"
          maxFiles={100}
          customOptions={
            <div className="p-4 bg-secondary dark:bg-slate-800/50 rounded-xl border border-border dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-muted-foreground mb-3">
                <span className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-indigo-500" />
                  {t('tools.pdfToText.batchOptions', 'Extraction Options')}
                </span>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageHeaders}
                  onChange={(e) => setIncludePageHeaders(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600 dark:text-muted-foreground">
                  {t('tools.pdfToText.includeHeaders', 'Include page headers (--- Page X ---)')}
                </span>
              </label>
            </div>
          }
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-800/30 flex items-center gap-2 mb-6"
              >
                <AlertCircle className="w-5 h-5" /> {errorMsg}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl border border-green-100 dark:border-green-800/30 flex items-center gap-2 mb-6"
              >
                <CheckCircle className="w-5 h-5" /> {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Card */}
          <div className="bg-card dark:bg-slate-800 p-5 rounded-2xl border border-border dark:border-slate-700 shadow-sm max-w-2xl mx-auto w-full mb-6">
            <div className="flex items-center gap-2 mb-4 text-foreground dark:text-slate-200 font-semibold">
              <Settings className="w-5 h-5 text-indigo-500" />
              <span>{t('tools.common.settings', 'Extraction Settings')}</span>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageHeaders}
                  onChange={(e) => setIncludePageHeaders(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-medium text-foreground dark:text-muted-foreground">
                    {t('tools.pdfToText.includeHeaders', 'Include page headers')}
                  </span>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    {t('tools.pdfToText.headersDesc', 'Adds "--- Page X ---" markers between pages')}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {!file ? (
            <FileDropZone
              onFiles={handleFileChange}
              accept="application/pdf"
              disabled={busy}
              hint={t('tools.pdfToText.hint', 'Upload PDF to extract text')}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="bg-card dark:bg-slate-800 p-6 rounded-2xl border border-border dark:border-slate-700 shadow-sm flex flex-col items-center text-center gap-6">
                {/* Icon */}
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-2">
                  <Type className="w-10 h-10" />
                </div>

                {/* File Info */}
                <div>
                  <h3 className="font-bold text-xl text-foreground dark:text-slate-200 mb-2">
                    {file.name}
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">
                    {t('tools.pdfToText.readyToExtract', 'Ready to extract text')}
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-secondary dark:bg-slate-900/50 p-4 rounded-xl w-full max-w-md border border-border dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-indigo-500 mt-1" />
                    <div className="text-left">
                      <h4 className="font-semibold text-foreground dark:text-muted-foreground text-sm">
                        {t('tools.pdfToText.howItWorks', 'How it works')}
                      </h4>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                        {t(
                          'tools.pdfToText.description',
                          'Extracts readable text from the PDF. For scanned documents, use OCR Tool instead.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {progressText && (
                  <div className="w-full max-w-md text-center">
                    <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">{progressText}</span>
                    </div>
                  </div>
                )}

                {/* Filename Input */}
                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-slate-600 dark:text-muted-foreground mb-2 text-left">
                    {t('tools.common.outputFilename', 'Output Filename')}
                  </label>
                  <FilenameInput
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    placeholder="output"
                    disabled={busy}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full max-w-md">
                  <button
                    onClick={() => setFile(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-muted-foreground dark:text-muted-foreground hover:bg-secondary dark:hover:bg-slate-800 transition-colors"
                    disabled={busy}
                  >
                    {t('tools.common.cancel', 'Cancel')}
                  </button>
                  <ActionButtons
                    primaryText={
                      busy ? progressText || t('tools.common.processing', 'Processing...') : t('tools.pdfToText.extractText', 'Extract Text')
                    }
                    onPrimary={extract}
                    loading={busy}
                    className="flex-1"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
