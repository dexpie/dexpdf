import React, { useState } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Hash, Layout, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, CheckCircle, AlertTriangle } from 'lucide-react'

export default function PageNumbersTool() {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [position, setPosition] = useState('bottom-right')
  const [start, setStart] = useState(1)
  const [busy, setBusy] = useState(false)
  const [outputFileName, setOutputFileName] = useState('')
  const [batchMode, setBatchMode] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function onFile(files) {
    const f = files[0]
    if (!f) return
    setFile(f)
    setOutputFileName(getDefaultFilename(f, '_pagenums'))
    setErrorMsg('')
    setSuccessMsg('')
  }

  async function processBatchFile(file) {
    const array = await file.arrayBuffer()
    const pdf = await PDFDocument.load(array)
    const pages = pdf.getPages()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i]
      const { width, height } = p.getSize()
      const text = String(Number(start) + i)
      const size = 12
      let x = width - 40, y = 20
      if (position === 'bottom-left') x = 40
      if (position === 'top-right') y = height - 20
      if (position === 'top-left') { x = 40; y = height - 20 }
      p.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) })
    }
    const out = await pdf.save()
    return new Blob([out], { type: 'application/pdf' })
  }

  async function applyNumbers() {
    if (!file) { setErrorMsg('Select a PDF'); return }
    setBusy(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const array = await file.arrayBuffer()
      const pdf = await PDFDocument.load(array)
      const pages = pdf.getPages()
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]
        const { width, height } = p.getSize()
        const text = String(Number(start) + i)
        const size = 12
        let x = width - 40, y = 20
        if (position === 'bottom-left') x = 40
        if (position === 'top-right') y = height - 20
        if (position === 'top-left') { x = 40; y = height - 20 }
        p.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) })
      }
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getOutputFilename(outputFileName, file.name.replace(/\.pdf$/i, '') + '_pagenums')
      a.click()
      URL.revokeObjectURL(url)
      setSuccessMsg('Successfully added page numbers!')
      triggerConfetti()
    } catch (err) { console.error(err); setErrorMsg('Failed: ' + err.message) }
    finally { setBusy(false) }
  }

  // Visual Position Selector Component
  const PositionSelector = () => (
    <div className="grid grid-cols-2 gap-4 w-full max-w-[200px] mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200 aspect-[3/4] relative">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-slate-200"></div>
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-slate-200"></div>

      {[
        { id: 'top-left', icon: ArrowUpLeft },
        { id: 'top-right', icon: ArrowUpRight },
        { id: 'bottom-left', icon: ArrowDownLeft },
        { id: 'bottom-right', icon: ArrowDownRight }
      ].map(pos => (
        <button
          key={pos.id}
          onClick={() => setPosition(pos.id)}
          className={`w-full h-full rounded-lg flex items-center justify-center transition-all ${position === pos.id ? 'bg-blue-500 text-white shadow-md scale-110 z-10' : 'bg-white text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm'}`}
        >
          <pos.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  )

  return (
    <ToolLayout title="Page Numbers" description={t('tool.pagenumbers_desc', 'Add page numbers to your PDF documents with custom positioning')}>

      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${!batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(false)}
        >
          📄 Single Single
        </button>
        <button
          className={`px-6 py-2 rounded-full font-medium transition-all ${batchMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          onClick={() => setBatchMode(true)}
        >
          📚 Batch Process
        </button>
      </div>

      {batchMode ? (
        <UniversalBatchProcessor
          accept="application/pdf"
          processFile={processBatchFile}
          outputNameSuffix="_pagenums"
          taskName={`Add page numbers (${position}, start: ${start})`}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5" /> {errorMsg}
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2 mb-6">
                <CheckCircle className="w-5 h-5" /> {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {!file ? (
            <FileDropZone
              onFiles={onFile}
              accept="application/pdf"
              disabled={busy}
              hint="Upload PDF to add page numbers"
            />
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Layout className="w-5 h-5 text-blue-500" /> Position</h3>
                <PositionSelector />
                <p className="text-center text-sm text-slate-500 mt-4 font-medium capitalize">{position.replace('-', ' ')}</p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Hash className="w-5 h-5 text-blue-500" /> Configuration</h3>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Number</label>
                    <input
                      type="number"
                      value={start}
                      onChange={e => setStart(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Output Filename</label>
                    <FilenameInput
                      value={outputFileName}
                      onChange={(e) => setOutputFileName(e.target.value)}
                      disabled={busy}
                      placeholder="output_pagenums"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors" onClick={() => setFile(null)}>Cancel</button>
                    <ActionButtons
                      primaryText="Add Numbers"
                      onPrimary={applyNumbers}
                      loading={busy}
                    />
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
