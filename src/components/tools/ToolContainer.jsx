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
  'summarize-pdf': loadTool(() => import('../../tools/SummarizePdfTool')),
  'translate-pdf': loadTool(() => import('../../tools/TranslatePdfTool')),
  'quiz-generator': loadTool(() => import('../../tools/QuizGeneratorTool')),
  'compare-pdf': loadTool(() => import('../../tools/ComparePdfTool')),
  'scan-pdf': loadTool(() => import('../../tools/ScanTool')),
  'crop-pdf': loadTool(() => import('../../tools/CropPdfTool')),
  'repair-pdf': loadTool(() => import('../../tools/RepairTool')),
  'page-number': loadTool(() => import('../../tools/PageNumberTool')),
  'image-resizer': loadTool(() => import('../../tools/ImageResizerTool')),
  'password-generator': loadTool(() => import('../../tools/PasswordGeneratorTool')),
  'json-formatter': loadTool(() => import('../../tools/JsonFormatterTool')),
  'base64-tool': loadTool(() => import('../../tools/Base64Tool')),
  'unit-converter': loadTool(() => import('../../tools/UnitConverterTool')),
  'qr-code': loadTool(() => import('../../tools/QrCodeTool')),
  'lorem-ipsum': loadTool(() => import('../../tools/LoremIpsumTool')),
  'markdown-preview': loadTool(() => import('../../tools/MarkdownPreviewTool')),
  'text-analyzer': loadTool(() => import('../../tools/TextAnalyzerTool')),
  'calculator': loadTool(() => import('../../tools/CalculatorTool')),
  'stopwatch-tool': loadTool(() => import('../../tools/StopwatchTool')),
  'color-converter': loadTool(() => import('../../tools/ColorConverterTool')),
  'gradient-generator': loadTool(() => import('../../tools/GradientGeneratorTool')),
  'data-converter': loadTool(() => import('../../tools/DataConverterTool')),
  'excel-to-json': loadTool(() => import('../../tools/ExcelToJsonTool')),
  'user-agent-parser': loadTool(() => import('../../tools/UserAgentParserTool')),
  'url-parser': loadTool(() => import('../../tools/UrlParserTool')),
  'hash-generator': loadTool(() => import('../../tools/HashGeneratorTool')),
  'text-to-speech': loadTool(() => import('../../tools/TextToSpeechTool')),
  'keycode-info': loadTool(() => import('../../tools/KeycodeInfoTool')),
  'metronome': loadTool(() => import('../../tools/MetronomeTool')),
  'uuid-generator': loadTool(() => import('../../tools/UuidGeneratorTool')),
  'jwt-debugger': loadTool(() => import('../../tools/JwtDebuggerTool')),
  'cron-parser': loadTool(() => import('../../tools/CronParserTool')),
  'subnet-calculator': loadTool(() => import('../../tools/IpSubnetCalculatorTool')),
  'dns-lookup': loadTool(() => import('../../tools/DnsLookupTool')),
  'latency-tester': loadTool(() => import('../../tools/LatencyTesterTool')),
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