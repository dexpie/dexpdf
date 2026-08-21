import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
// import PptxGenJS from 'pptxgenjs'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import { configurePdfWorker } from '../utils/pdfWorker'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { Presentation, FileText, MonitorPlay, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

configurePdfWorker()

export default function PdfToPptTool() {
  const { t } = useTranslation()
  const [batchMode, setBatchMode] = useState(false)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [outputFileName, setOutputFileName] = useState('')

  async function handleFileChange(files) {
    setErrorMsg(''); setSuccessMsg('');
    const f = files[0]
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setFile(f)
    setOutputFileName(getDefaultFilename(f, '', '.pptx'))
  }

  async function convert() {
    if (!file) { setErrorMsg('Please select a PDF file first.'); return; }
    setErrorMsg(''); setSuccessMsg('');
    setBusy(true)

    try {
      // Dynamic import
      const PptxGenJS = (await import('pptxgenjs')).default
      const pres = new PptxGenJS()
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const numPages = pdf.numPages

      const BATCH_SIZE = 3;
      for (let start = 1; start <= numPages; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, numPages);
        const pagePromises = [];
        for (let i = start; i <= end; i++) {
          pagePromises.push((async () => {
            const page = await pdf.getPage(i);
            const scale = 2.0;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            return { pageNum: i, imgData: canvas.toDataURL('image/jpeg', 0.8) };
          })());
        }
        const pagesData = await Promise.all(pagePromises);
        pagesData.sort((a, b) => a.pageNum - b.pageNum);
        for (const { imgData } of pagesData) {
          const slide = pres.addSlide();
          slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
        }
      }

      await pres.writeFile({ fileName: getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, ''), '.pptx') })

      setSuccessMsg('Success! PDF converted to PowerPoint.')
      triggerConfetti()
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed: ' + (err.message || err))
    } finally {
      setBusy(false)
    }
  }

  const processBatchFile = async (file, index, onProgress) => {
    try {
      onProgress(10)
      // Dynamic import
      const PptxGenJS = (await import('pptxgenjs')).default
      const pres = new PptxGenJS()
      const data = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      const numPages = pdf.numPages
      onProgress(20)

      const BATCH_SIZE = 3;
      for (let start = 1; start <= numPages; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, numPages);
        const pagePromises = [];
        for (let i = start; i <= end; i++) {
          pagePromises.push((async () => {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            return { pageNum: i, imgData: canvas.toDataURL('image/jpeg', 0.8) };
          })());
        }
        const pagesData = await Promise.all(pagePromises);
        pagesData.sort((a, b) => a.pageNum - b.pageNum);
        for (const { imgData } of pagesData) {
          const slide = pres.addSlide();
          slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
        }
        onProgress(20 + (end / numPages) * 60);
      }

      const blob = await pres.write({ outputType: 'blob' })
      onProgress(100)
      return blob
    } catch (error) {
      console.error(`Error converting ${file.name}:`, error)
      throw error
    }
  }

  return (
    <ToolLayout title="PDF to PowerPoint" description="Place each PDF page as a high-quality visual slide">

      {/* Mode Switcher */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${!batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-secondary text-muted-foreground hover:bg-secondary'}`}
          onClick={() => setBatchMode(false)}
        >
          📄 Single File
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-secondary text-muted-foreground hover:bg-secondary'}`}
          onClick={() => setBatchMode(true)}
        >
          🔄 Batch Convert
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          toolName="PDF to PPT"
          processFile={processBatchFile}
          acceptedTypes=".pdf"
          outputExtension=".pptx"
          maxFiles={50}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-destructive/10 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5" /> {errorMsg}
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-500/10 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2 mb-6">
                <CheckCircle className="w-5 h-5" /> {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {!file ? (
            <FileDropZone
              onFiles={handleFileChange}
              accept="application/pdf"
              disabled={busy}
              hint="Upload PDF to convert to PowerPoint"
            />
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center gap-6">

                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-2">
                  <Presentation className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="font-bold text-xl text-foreground mb-2">{file.name}</h3>
                  <p className="text-muted-foreground">Ready to convert to PowerPoint (.pptx)</p>
                </div>

                <div className="bg-secondary p-4 rounded-xl w-full max-w-md border border-border">
                  <div className="flex items-start gap-3">
                    <MonitorPlay className="w-5 h-5 text-blue-500 mt-1" />
                    <div className="text-left">
                      <h4 className="font-semibold text-foreground text-sm">Visual Preservation Mode</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pages will be converted to high-quality images on each slide to ensure 100% layout fidelity. Text will not be editable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-muted-foreground mb-2 text-left">Output Filename</label>
                  <FilenameInput
                    value={outputFileName}
                    onChange={e => setOutputFileName(e.target.value)}
                    placeholder="presentation"
                  />
                </div>

                <div className="flex gap-3 w-full max-w-md">
                  <button
                    onClick={() => setFile(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-muted-foreground hover:bg-secondary transition-colors"
                    disabled={busy}
                  >
                    Cancel
                  </button>
                  <ActionButtons
                    primaryText="Convert to PPT"
                    onPrimary={convert}
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
