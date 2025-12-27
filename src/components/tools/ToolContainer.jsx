'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Utility for cleaner dynamic imports with loading state
const loadTool = (importFunc) => dynamic(importFunc, {
  loading: () => <div className="flex h-[400px] items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>,
  ssr: false
})

// Dynamic Imports to isolate dependencies and specific tool errors
const TOOL_COMPONENTS = {
  'pdf2text': loadTool(() => import('../../tools/PdfToTextTool')),
  'pdf2word': loadTool(() => import('../../tools/PdfToWordTool')),
  'merge': loadTool(() => import('../../tools/MergeTool')),
  'split': loadTool(() => import('../../tools/SplitTool')),
  'imgs2pdf': loadTool(() => import('../../tools/ImagesToPdfTool')),
  'pdf2imgs': loadTool(() => import('../../tools/PdfToImagesTool')),
  'annotate': loadTool(() => import('../../tools/AnnotateTool')),
  'compress': loadTool(() => import('../../tools/CompressTool')),
  'csv2pdf': loadTool(() => import('../../tools/CSVToPdfTool')),
  'edit': loadTool(() => import('../../tools/EditPdfTool')),
  'ocr': loadTool(() => import('../../tools/OcrTool')),
  'pagenums': loadTool(() => import('../../tools/PageNumbersTool')),
  'pdf2ppt': loadTool(() => import('../../tools/PdfToPptTool')),
  'pdf2excel': loadTool(() => import('../../tools/PdfToExcelTool')),
  'flatten': loadTool(() => import('../../tools/FlattenPdfTool')),
  'ppt2pdf': loadTool(() => import('../../tools/PptToPdfTool')),
  'signature': loadTool(() => import('../../tools/SignatureTool')),
  'watermark': loadTool(() => import('../../tools/WatermarkTool')),
  'pdf-info': loadTool(() => import('../../tools/PDFInfoTool')),
  'extract-images': loadTool(() => import('../../tools/ExtractImagesTool')),
  'word2pdf': loadTool(() => import('../../tools/WordToPdfTool')),
  'organize': loadTool(() => import('../../tools/OrganizePdfTool')),
  'protect': loadTool(() => import('../../tools/ProtectPdfTool')),
  'unlock': loadTool(() => import('../../tools/UnlockPdfTool')),
  'repair': loadTool(() => import('../../tools/RepairTool')),
  'pdf2pdfa': loadTool(() => import('../../tools/PdfToPdfATool')),
  'chat-pdf': loadTool(() => import('../../tools/ChatPdfTool')),
  'smart-organize': loadTool(() => import('../../tools/SmartOrganizeTool')),
  'redact': loadTool(() => import('../../tools/RedactTool')),
  'scrub': loadTool(() => import('../../tools/ScrubTool')),
  'excel2pdf': loadTool(() => import('../../tools/ExcelToPdfTool')),
  'html2pdf': loadTool(() => import('../../tools/HtmlToPdfTool')),
  'invoice-generator': loadTool(() => import('../../tools/InvoiceGeneratorTool')),
  'resume-builder': loadTool(() => import('../../tools/ResumeBuilderTool')),
  'certificate-maker': loadTool(() => import('../../tools/CertificateMakerTool')),
  // 'ai-summary': loadTool(() => import('../../tools/SummarizeTool')), // Phase 8b
}

export default function ToolContainer({ toolId, onClose }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get the component for current tool
  const ToolComponent = TOOL_COMPONENTS[toolId]

  if (!ToolComponent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tool Not Found</h1>
        <p className="text-gray-600">The requested tool "{toolId}" does not exist or is currently unavailable.</p>
        <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">Go Home</button>
      </div>
    )
  }

  return (
    <div className={`tool-container-wrapper w-full max-w-6xl mx-auto px-4 py-8 ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <ToolComponent />
    </div>
  )
}