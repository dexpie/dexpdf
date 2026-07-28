'use client'

import React, { Component, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import { TOOLS } from '@/config/tools'
import { recordToolUse } from '@/utils/toolPreferences'

const ToolLoading = () => (
  <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm">
      <div className="h-44 animate-pulse bg-gradient-to-br from-blue-100 via-blue-50 to-card dark:from-blue-950/40 dark:via-card" />
      <div className="space-y-4 p-6 md:p-8">
        <div className="h-5 w-44 animate-pulse rounded-full bg-secondary" />
        <div className="h-28 animate-pulse rounded-2xl bg-secondary" />
        <div className="h-12 animate-pulse rounded-xl bg-blue-500/15" />
      </div>
    </div>
  </div>
)

const loadTool = importFunc => dynamic(importFunc, {
  loading: ToolLoading,
  ssr: false,
})

const TOOL_COMPONENTS = {
  'chat-pdf': loadTool(() => import('../../tools/ChatPdfTool')),
  'compare-pdf': loadTool(() => import('../../tools/ComparePdfTool')),
  merge: loadTool(() => import('../../tools/MergeTool')),
  split: loadTool(() => import('../../tools/SplitTool')),
  compress: loadTool(() => import('../../tools/CompressTool')),
  'crop-pdf': loadTool(() => import('../../tools/CropPdfTool')),
  pdf2word: loadTool(() => import('../../tools/PdfToWordTool')),
  pdf2ppt: loadTool(() => import('../../tools/PdfToPptTool')),
  pdf2excel: loadTool(() => import('../../tools/PdfToExcelTool')),
  flatten: loadTool(() => import('../../tools/FlattenPdfTool')),
  word2pdf: loadTool(() => import('../../tools/WordToPdfTool')),
  ppt2pdf: loadTool(() => import('../../tools/PptToPdfTool')),
  excel2pdf: loadTool(() => import('../../tools/ExcelToPdfTool')),
  edit: loadTool(() => import('../../tools/EditPdfTool')),
  pdf2imgs: loadTool(() => import('../../tools/PdfToImagesTool')),
  pdf2png: loadTool(() => import('../../tools/PdfToPngTool')),
  pdf2webp: loadTool(() => import('../../tools/PdfToWebPTool')),
  pdf2html: loadTool(() => import('../../tools/PdfToHtmlTool')),
  pdf2json: loadTool(() => import('../../tools/PdfDataExtractTool')),
  pdf2csv: loadTool(() => import('../../tools/PdfDataExtractTool')),
  pdf2rtf: loadTool(() => import('../../tools/PdfDataExtractTool')),
  pdf2markdown: loadTool(() => import('../../tools/PdfDataExtractTool')),
  pdf2epub: loadTool(() => import('../../tools/PdfDataExtractTool')),
  'pdf-grayscale': loadTool(() => import('../../tools/PdfDataExtractTool')),
  imgs2pdf: loadTool(() => import('../../tools/ImagesToPdfTool')),
  signature: loadTool(() => import('../../tools/SignatureTool')),
  watermark: loadTool(() => import('../../tools/WatermarkTool')),
  rotate: loadTool(() => import('../../tools/RotateTool')),
  organize: loadTool(() => import('../../tools/OrganizePdfTool')),
  html2pdf: loadTool(() => import('../../tools/HtmlToPdfTool')),
  unlock: loadTool(() => import('../../tools/UnlockPdfTool')),
  protect: loadTool(() => import('../../tools/ProtectPdfTool')),
  pdf2pdfa: loadTool(() => import('../../tools/PdfToPdfATool')),
  'scan-pdf': loadTool(() => import('../../tools/ScanTool')),
  repair: loadTool(() => import('../../tools/RepairTool')),
  'repair-pdf': loadTool(() => import('../../tools/RepairTool')),
  pagenums: loadTool(() => import('../../tools/PageNumbersTool')),
  ocr: loadTool(() => import('../../tools/OcrTool')),
  'summarize-pdf': loadTool(() => import('../../tools/SummarizePdfTool')),
  'smart-organize': loadTool(() => import('../../tools/SmartOrganizeTool')),
  redact: loadTool(() => import('../../tools/RedactTool')),
  scrub: loadTool(() => import('../../tools/ScrubTool')),
  'invoice-generator': loadTool(() => import('../../tools/InvoiceGeneratorTool')),
  'resume-builder': loadTool(() => import('../../tools/ResumeBuilderTool')),
  'certificate-maker': loadTool(() => import('../../tools/CertificateMakerTool')),
  pdf2text: loadTool(() => import('../../tools/PdfToTextTool')),
  'translate-pdf': loadTool(() => import('../../tools/TranslatePdfTool')),
  'extract-images': loadTool(() => import('../../tools/ExtractImagesTool')),
  'form-filler': loadTool(() => import('../../tools/FormFillerTool')),
  'pdf-validator': loadTool(() => import('../../tools/PdfValidatorTool')),
  'batch-pdf': loadTool(() => import('../../tools/BatchPdfTool')),
  'header-footer': loadTool(() => import('../../tools/HeaderFooterTool')),
  'pdf-optimize': loadTool(() => import('../../tools/PdfOptimizeTool')),
  'csv-to-pdf': loadTool(() => import('../../tools/CSVToPdfTool')),
  annotate: loadTool(() => import('../../tools/AnnotateTool')),
  'pdf-info': loadTool(() => import('../../tools/PDFInfoTool')),
  reorder: loadTool(() => import('../../tools/ReorderTool')),
  'quiz-generator': loadTool(() => import('../../tools/QuizGeneratorTool')),
  'qr-reader': loadTool(() => import('../../tools/QrReaderTool')),
  'image-resizer': loadTool(() => import('../../tools/ImageResizerTool')),
  'image-filter': loadTool(() => import('../../tools/ImageFilterTool')),
  'image-color-picker': loadTool(() => import('../../tools/ImageColorPickerTool')),
  'blindness-simulator': loadTool(() => import('../../tools/BlindnessSimulatorTool')),
  'qr-code': loadTool(() => import('../../tools/QrCodeProTool')),
  'lorem-ipsum': loadTool(() => import('../../tools/LoremIpsumGeneratorTool')),
  'markdown-preview': loadTool(() => import('../../tools/MarkdownPreviewTool')),
  'text-analyzer': loadTool(() => import('../../tools/TextAnalyzerTool')),
  'text-diff': loadTool(() => import('../../tools/TextDiffTool')),
  'regex-tester': loadTool(() => import('../../tools/RegexTesterTool')),
  'case-converter': loadTool(() => import('../../tools/CaseConverterTool')),
  'word-density': loadTool(() => import('../../tools/WordDensityTool')),
  'text-cleaner': loadTool(() => import('../../tools/TextCleanerTool')),
  'slug-generator': loadTool(() => import('../../tools/SlugGeneratorTool')),
  'string-obfuscator': loadTool(() => import('../../tools/StringObfuscatorTool')),
  'text-to-speech': loadTool(() => import('../../tools/TextToSpeechTool')),
  'password-generator': loadTool(() => import('../../tools/PasswordGeneratorTool')),
  'json-formatter': loadTool(() => import('../../tools/JsonFormatterTool')),
  'base64-tool': loadTool(() => import('../../tools/Base64Tool')),
  'hash-generator': loadTool(() => import('../../tools/HashGeneratorTool')),
  'token-generator': loadTool(() => import('../../tools/TokenGeneratorTool')),
  'uuid-generator': loadTool(() => import('../../tools/UuidGeneratorTool')),
  'jwt-debugger': loadTool(() => import('../../tools/JwtDebuggerTool')),
  'cron-parser': loadTool(() => import('../../tools/CronParserTool')),
  'sql-formatter': loadTool(() => import('../../tools/SqlFormatterTool')),
  'json-diff': loadTool(() => import('../../tools/JsonDiffTool')),
  'html-entity': loadTool(() => import('../../tools/HtmlEntityTool')),
  'xml-json': loadTool(() => import('../../tools/XmlJsonConverterTool')),
  'yaml-json': loadTool(() => import('../../tools/YamlJsonConverterTool')),
  'html-minifier': loadTool(() => import('../../tools/HtmlMinifierTool')),
  'css-minifier': loadTool(() => import('../../tools/CssMinifierTool')),
  'js-minifier': loadTool(() => import('../../tools/JsMinifierTool')),
  'keycode-info': loadTool(() => import('../../tools/KeycodeInfoTool')),
  'user-agent-parser': loadTool(() => import('../../tools/UserAgentParserTool')),
  'meta-tag-generator': loadTool(() => import('../../tools/MetaTagGeneratorTool')),
  'url-parser': loadTool(() => import('../../tools/UrlParserTool')),
  'url-encoder': loadTool(() => import('../../tools/UrlEncoderTool')),
  'subnet-calculator': loadTool(() => import('../../tools/SubnetCalculatorTool')),
  'ip-validator': loadTool(() => import('../../tools/IpAddressValidatorTool')),
  'dns-lookup': loadTool(() => import('../../tools/DnsLookupTool')),
  'latency-tester': loadTool(() => import('../../tools/LatencyTesterTool')),
  'device-info': loadTool(() => import('../../tools/DeviceInfoTool')),
  'network-info': loadTool(() => import('../../tools/NetworkInfoTool')),
  'battery-status': loadTool(() => import('../../tools/BatteryStatusTool')),
  calculator: loadTool(() => import('../../tools/CalculatorTool')),
  'unit-converter': loadTool(() => import('../../tools/UnitConverterTool')),
  'data-converter': loadTool(() => import('../../tools/DataConverterTool')),
  'excel-to-json': loadTool(() => import('../../tools/ExcelToJsonTool')),
  'base-converter': loadTool(() => import('../../tools/BaseConverterTool')),
  'number-generator': loadTool(() => import('../../tools/NumberGeneratorTool')),
  'statistics-tool': loadTool(() => import('../../tools/StatisticsTool')),
  'prime-factor': loadTool(() => import('../../tools/PrimeFactorTool')),
  'loan-calculator': loadTool(() => import('../../tools/LoanCalculatorTool')),
  'interest-calculator': loadTool(() => import('../../tools/InterestCalculatorTool')),
  'salary-calculator': loadTool(() => import('../../tools/SalaryCalculatorTool')),
  'discount-calculator': loadTool(() => import('../../tools/DiscountCalculatorTool')),
  'date-diff': loadTool(() => import('../../tools/DateDiffTool')),
  stopwatch: loadTool(() => import('../../tools/StopwatchTool')),
  'countdown-timer': loadTool(() => import('../../tools/CountdownTimerTool')),
  'world-clock': loadTool(() => import('../../tools/WorldClockTool')),
  'timezone-converter': loadTool(() => import('../../tools/TimezoneConverterTool')),
  'unix-timestamp': loadTool(() => import('../../tools/UnixTimestampTool')),
  metronome: loadTool(() => import('../../tools/MetronomeTool')),
  'reaction-tester': loadTool(() => import('../../tools/ReactionTesterTool')),
  'typing-test': loadTool(() => import('../../tools/TypingSpeedTestTool')),
  'decision-maker': loadTool(() => import('../../tools/DecisionMakerTool')),
  'meme-generator': loadTool(() => import('../../tools/MemeGeneratorTool')),
  'color-contrast': loadTool(() => import('../../tools/ColorContrastTool')),
  'palette-generator': loadTool(() => import('../../tools/PaletteGeneratorTool')),
  'color-converter': loadTool(() => import('../../tools/ColorConverterTool')),
  'gradient-generator': loadTool(() => import('../../tools/GradientGeneratorTool')),
}

class ToolRuntimeBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, resetKey: 0 }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(`Tool runtime error (${this.props.toolId})`, error, info)
  }

  componentDidUpdate(previousProps) {
    if (previousProps.toolId !== this.props.toolId && this.state.error) {
      this.setState({ error: null, resetKey: this.state.resetKey + 1 })
    }
  }

  retry = () => this.setState(state => ({ error: null, resetKey: state.resetKey + 1 }))

  render() {
    if (!this.state.error) return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>

    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12 text-center">
        <div className="w-full rounded-[1.75rem] border border-destructive/20 bg-card p-8 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-foreground">This tool hit an unexpected error</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Your original file was not changed. Retry the tool, or return to the library and choose another workflow.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={this.retry} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700">
              <RefreshCw className="h-4 w-4" /> Retry tool
            </button>
            <button onClick={this.props.onClose} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-bold text-foreground hover:border-primary/30">
              <ArrowLeft className="h-4 w-4" /> All tools
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default function ToolContainer({ toolId, onClose }) {
  const recordedToolId = useRef(null)

  useEffect(() => {
    if (recordedToolId.current !== toolId) {
      recordedToolId.current = toolId
      recordToolUse(toolId)
    }
  }, [toolId])

  const ToolComponent = TOOL_COMPONENTS[toolId]
  const tool = TOOLS.find(item => item.id === toolId)

  if (!ToolComponent) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12 text-center">
        <div className="w-full rounded-[1.75rem] border border-border bg-card p-8 shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-2xl font-black text-foreground">Tool unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{tool?.title || toolId} is not connected to a runnable component yet.</p>
          <button onClick={onClose} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Back to all tools</button>
        </div>
      </div>
    )
  }

  return (
    <ToolRuntimeBoundary toolId={toolId} onClose={onClose}>
      <div className="w-full animate-in fade-in duration-300">
        <ToolComponent toolId={toolId} />
      </div>
    </ToolRuntimeBoundary>
  )
}
