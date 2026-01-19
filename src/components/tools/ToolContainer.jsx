'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Utility for cleaner dynamic imports with loading state
const loadTool = (importFunc) => dynamic(importFunc, {
  loading: () => <div className="flex h-[400px] items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>,
  ssr: false
})

// Dynamic Imports Mapping
// Keys must match 'id' in src/config/tools.tsx
const TOOL_COMPONENTS = {
  // PDF
  'chat-pdf': loadTool(() => import('../../tools/ChatPdfTool')),
  'compare-pdf': loadTool(() => import('../../tools/ComparePdfTool')),
  'merge': loadTool(() => import('../../tools/MergeTool')),
  'split': loadTool(() => import('../../tools/SplitTool')),
  'compress': loadTool(() => import('../../tools/CompressTool')),
  'crop-pdf': loadTool(() => import('../../tools/CropPdfTool')),
  'pdf2word': loadTool(() => import('../../tools/PdfToWordTool')),
  'pdf2ppt': loadTool(() => import('../../tools/PdfToPptTool')),
  'pdf2excel': loadTool(() => import('../../tools/PdfToExcelTool')),
  'flatten': loadTool(() => import('../../tools/FlattenPdfTool')),
  'word2pdf': loadTool(() => import('../../tools/WordToPdfTool')),
  'ppt2pdf': loadTool(() => import('../../tools/PptToPdfTool')),
  'excel2pdf': loadTool(() => import('../../tools/ExcelToPdfTool')),
  'edit': loadTool(() => import('../../tools/EditPdfTool')),
  'pdf2imgs': loadTool(() => import('../../tools/PdfToImagesTool')),
  'imgs2pdf': loadTool(() => import('../../tools/ImagesToPdfTool')),
  'signature': loadTool(() => import('../../tools/SignatureTool')),
  'watermark': loadTool(() => import('../../tools/WatermarkTool')),
  'rotate': loadTool(() => import('../../tools/RotateTool')), // Was 'organize' in some places, tools.json has 'rotate' -> /organize. Config has 'rotate' -> /organize. File is RotateTool or OrganizePdfTool?
  // Let's check config: id 'rotate' -> /organize. id 'organize' -> /organize.
  // There are two IDs in tools.tsx pointing to same href? 
  // Line 37: id 'rotate'. Line 41: id 'organize'. 
  // I should support both if they are distinct tools or same. File list had 'OrganizePdfTool.jsx'. 'RotateTool.jsx' exists too?
  // File list: OrganizePdfTool (17776), RotateTool (12240).
  // I'll map 'rotate' to RotateTool, 'organize' to OrganizePdfTool.
  'organize': loadTool(() => import('../../tools/OrganizePdfTool')),

  'html2pdf': loadTool(() => import('../../tools/HtmlToPdfTool')),
  'unlock': loadTool(() => import('../../tools/UnlockPdfTool')),
  'protect': loadTool(() => import('../../tools/ProtectPdfTool')),
  'pdf2pdfa': loadTool(() => import('../../tools/PdfToPdfATool')),
  'scan-pdf': loadTool(() => import('../../tools/ScanTool')),
  'repair-pdf': loadTool(() => import('../../tools/RepairTool')),
  'pagenums': loadTool(() => import('../../tools/PageNumbersTool')),
  'ocr': loadTool(() => import('../../tools/OcrTool')),
  'summarize-pdf': loadTool(() => import('../../tools/SummarizePdfTool')),
  'smart-organize': loadTool(() => import('../../tools/SmartOrganizeTool')),
  'redact': loadTool(() => import('../../tools/RedactTool')),
  'scrub': loadTool(() => import('../../tools/ScrubTool')),
  'invoice-generator': loadTool(() => import('../../tools/InvoiceGeneratorTool')),
  'resume-builder': loadTool(() => import('../../tools/ResumeBuilderTool')),
  'certificate-maker': loadTool(() => import('../../tools/CertificateMakerTool')),
  'ranking-announcement': loadTool(() => import('../../tools/RankingAnnouncementTool')),

  // Image
  'image-resizer': loadTool(() => import('../../tools/ImageResizerTool')),
  'image-filter': loadTool(() => import('../../tools/ImageFilterTool')),
  'image-color-picker': loadTool(() => import('../../tools/ImageColorPickerTool')),
  'blindness-simulator': loadTool(() => import('../../tools/BlindnessSimulatorTool')),
  'qr-code': loadTool(() => import('../../tools/QrCodeProTool')), // The new standard

  // Text
  'lorem-ipsum': loadTool(() => import('../../tools/LoremIpsumGeneratorTool')), // Phase 46
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

  // Dev
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

  // Web
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

  // Math
  'calculator': loadTool(() => import('../../tools/CalculatorTool')),
  'unit-converter': loadTool(() => import('../../tools/UnitConverterTool')),
  'data-converter': loadTool(() => import('../../tools/DataConverterTool')),
  'excel-to-json': loadTool(() => import('../../tools/ExcelToJsonTool')),
  'base-converter': loadTool(() => import('../../tools/BaseConverterTool')),
  'number-generator': loadTool(() => import('../../tools/NumberGeneratorTool')),
  'statistics-tool': loadTool(() => import('../../tools/StatisticsTool')),
  'prime-factor': loadTool(() => import('../../tools/PrimeFactorTool')),

  // Finance
  'loan-calculator': loadTool(() => import('../../tools/LoanCalculatorTool')),
  'interest-calculator': loadTool(() => import('../../tools/InterestCalculatorTool')),
  'salary-calculator': loadTool(() => import('../../tools/SalaryCalculatorTool')),
  'discount-calculator': loadTool(() => import('../../tools/DiscountCalculatorTool')),

  // Time
  'date-diff': loadTool(() => import('../../tools/DateDiffTool')),
  'stopwatch': loadTool(() => import('../../tools/StopwatchTool')),
  'countdown-timer': loadTool(() => import('../../tools/CountdownTimerTool')),
  'world-clock': loadTool(() => import('../../tools/WorldClockTool')),
  'timezone-converter': loadTool(() => import('../../tools/TimezoneConverterTool')),
  'unix-timestamp': loadTool(() => import('../../tools/UnixTimestampTool')),
  'metronome': loadTool(() => import('../../tools/MetronomeTool')),

  // Fun
  'reaction-tester': loadTool(() => import('../../tools/ReactionTesterTool')),
  'typing-test': loadTool(() => import('../../tools/TypingSpeedTestTool')),
  'decision-maker': loadTool(() => import('../../tools/DecisionMakerTool')),
  'meme-generator': loadTool(() => import('../../tools/MemeGeneratorTool')),
  'color-contrast': loadTool(() => import('../../tools/ColorContrastTool')),
  'palette-generator': loadTool(() => import('../../tools/PaletteGeneratorTool')),
  'color-converter': loadTool(() => import('../../tools/ColorConverterTool')),
  'gradient-generator': loadTool(() => import('../../tools/GradientGeneratorTool')),
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