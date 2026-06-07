import React, { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { FormInput, Save, CheckCircle, AlertTriangle, FileText, Type, CheckSquare } from 'lucide-react'
import ResultPage from '../components/common/ResultPage'

/**
 * FormFillerTool - Fill PDF forms easily
 * Detects form fields and allows user to fill them
 */
export default function FormFillerTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [formFields, setFormFields] = useState({})
  const [fieldValues, setFieldValues] = useState({})
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [pdfDoc, setPdfDoc] = useState(null)

  async function handleFileChange(files) {
    setErrorMsg('')
    setSuccessMsg('')
    setDownloadUrl(null)

    const f = files[0]
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      return
    }

    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_filled'))
    setFieldValues({})

    try {
      const arrayBuffer = await f.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setPdfDoc(pdfDoc)

      // Get form fields
      const form = pdfDoc.getForm()
      const fields = form.getFields()

      const fieldInfo = {}
      fields.forEach(field => {
        const name = field.getName()
        const type = field.constructor.name
        let value = ''

        try {
          if (type === 'PDFTextField') {
            value = field.getText() || ''
          } else if (type === 'PDFCheckBox') {
            value = field.isChecked()
          } else if (type === 'PDFDropdown') {
            value = field.getSelected() || ''
          } else if (type === 'PDFOptionList') {
            value = field.getSelected() || ''
          } else if (type === 'PDFRadioGroup') {
            value = field.getSelected() || ''
          }
        } catch (e) {
          console.warn('Could not get field value:', name)
        }

        fieldInfo[name] = {
          type,
          value: value,
          required: false,
          options: typeof field.getOptions === 'function' ? field.getOptions() : []
        }
      })

      setFormFields(fieldInfo)
      setFieldValues(
        Object.keys(fieldInfo).reduce((acc, key) => {
          acc[key] = fieldInfo[key].value
          return acc
        }, {})
      )

      // Get page count and thumbnail
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      setPageCount(pdf.numPages)

      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.4 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      setThumbnail(canvas.toDataURL('image/jpeg', 0.7))

    } catch (e) {
      console.error('Error loading PDF:', e)
      setErrorMsg('Could not load PDF. Make sure it\'s a valid PDF file.')
    }
  }

  function handleFieldChange(fieldName, value) {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  async function handleProcess() {
    if (!pdfDoc) return

    setBusy(true)
    setProgress(0)
    setErrorMsg('')

    try {
      const form = pdfDoc.getForm()
      setProgress(20)

      // Fill each field
      Object.keys(fieldValues).forEach(fieldName => {
        try {
          const field = form.getField(fieldName)
          const value = fieldValues[fieldName]
          const type = field.constructor.name

          if (type === 'PDFTextField') {
            field.setText(String(value))
          } else if (type === 'PDFCheckBox') {
            if (value) {
              field.check()
            } else {
              field.uncheck()
            }
          } else if (type === 'PDFDropdown' || type === 'PDFOptionList' || type === 'PDFRadioGroup') {
            field.select(String(value))
          }
        } catch (e) {
          console.warn('Could not set field:', fieldName)
        }
      })

      setProgress(60)

      const modifiedPdfBytes = await pdfDoc.save()
      setProgress(80)

      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)

      setProgress(100)
      setSuccessMsg('PDF form filled successfully!')
      triggerConfetti()

    } catch (e) {
      console.error('Error filling form:', e)
      setErrorMsg('Error filling form. Please try again.')
    }

    setBusy(false)
  }

  function handleReset() {
    setFile(null)
    setFormFields({})
    setFieldValues({})
    setDownloadUrl(null)
    setErrorMsg('')
    setSuccessMsg('')
    setThumbnail(null)
    setPageCount(0)
    setPdfDoc(null)
  }

  if (downloadUrl) {
    return (
      <ResultPage
        title="PDF Form Filled!"
        message={successMsg}
        downloadUrl={downloadUrl}
        outputFilename={outputFileName}
        onReset={handleReset}
        thumbnail={thumbnail}
      />
    )
  }

  return (
    <ToolLayout title="PDF Form Filler" description="Fill out PDF forms easily">
      <div className="max-w-4xl mx-auto">
        {/* File Upload */}
        {!file && (
          <FileDropZone
            accept=".pdf"
            onChange={handleFileChange}
            icon={<FormInput className="w-12 h-12 text-primary" />}
            title="Upload PDF Form"
            subtitle="Select a PDF file with fillable form fields"
          />
        )}

        {/* Form Fields Editor */}
        {file && Object.keys(formFields).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Form Fields</h3>
                <p className="text-sm text-muted-foreground">{Object.keys(formFields).length} fields detected</p>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Remove file
              </button>
            </div>

            {/* Thumbnail */}
            {thumbnail && (
              <div className="mb-6 flex justify-center">
                <img src={thumbnail} alt="PDF Preview" className="max-h-40 rounded-lg border border-border" />
              </div>
            )}

            {/* Fields */}
            <div className="space-y-4 max-h-96 overflow-y-auto mb-6 pr-2">
              {Object.entries(formFields).map(([fieldName, fieldInfo]) => (
                <div key={fieldName} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    {fieldInfo.type === 'PDFCheckBox' ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Type className="w-4 h-4" />
                    )}
                    {fieldName}
                  </label>

                  {fieldInfo.type === 'PDFTextField' && (
                    <input
                      type="text"
                      value={fieldValues[fieldName] || ''}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter value..."
                    />
                  )}

                  {fieldInfo.type === 'PDFCheckBox' && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fieldValues[fieldName] || false}
                        onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                      />
                      <span className="text-sm text-muted-foreground">Checked</span>
                    </label>
                  )}

                  {['PDFDropdown', 'PDFOptionList', 'PDFRadioGroup'].includes(fieldInfo.type) && (
                    <select
                      value={fieldValues[fieldName] || ''}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select...</option>
                      {fieldInfo.options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleProcess}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Fill & Download
                  </>
                )}
              </button>
            </div>

            {/* Progress */}
            {busy && (
              <div className="mt-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1 text-center">{progress}%</p>
              </div>
            )}
          </motion.div>
        )}

        {/* No Fields Found */}
        {file && Object.keys(formFields).length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-8 text-center"
          >
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Form Fields Found</h3>
            <p className="text-muted-foreground mb-6">
              This PDF doesn't contain any fillable form fields, or the form is already filled.
            </p>
            <button
              onClick={handleReset}
              className="text-primary hover:underline"
            >
              Try another file
            </button>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}
