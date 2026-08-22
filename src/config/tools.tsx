import {
  Zap, Layers, Scissors, Download, FileText, LayoutTemplate, FileOutput, PenTool, FileImage, Image, FileSignature, RefreshCcw, Unlock, Lock, Type, FileSpreadsheet, BrainCircuit, Wand2, ShieldAlert, Eraser, Camera, GitCompare, FileInput, ClipboardList, CheckCircle, FileCheck, Images, FolderOutput, AlignLeft, AlignCenter, AlignRight, FileType, Monitor, FileCode, BookOpen, FileText as FileTextIcon, Table, FileJson, FileCode2, Contrast, QrCode
} from 'lucide-react'

/**
 * Tool categories for filtering
 */
export const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'organize', label: 'Organize' },
  { id: 'convert', label: 'Convert' },
  { id: 'security', label: 'Security' },
  { id: 'create', label: 'Create' },
]

/**
 * All available PDF tools with metadata
 * Each tool has: id, category, title, description, icon, color, href
 */
export const TOOLS = [
  // ── Organize PDF ──
  { id: 'merge', category: 'organize', title: "Merge PDF", description: "Combine multiple PDFs into one.", icon: Layers, color: "text-red-500", iconBg: "bg-red-50", href: "/merge" },
  { id: 'split', category: 'organize', title: "Split PDF", description: "Separate pages or extract ranges.", icon: Scissors, color: "text-red-500", iconBg: "bg-red-50", href: "/split" },
  { id: 'compress', category: 'organize', title: "Compress PDF", description: "Raster-compress pages with adjustable quality.", icon: Download, color: "text-green-500", iconBg: "bg-green-50", href: "/compress" },
  { id: 'organize', category: 'organize', title: "Organize Pages", description: "Sort, add and delete pages.", icon: Layers, color: "text-red-500", iconBg: "bg-red-50", href: "/organize" },
  { id: 'edit', category: 'organize', title: "Edit PDF", description: "Add text, shapes, images.", icon: PenTool, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/edit" },
  { id: 'rotate', category: 'organize', title: "Rotate PDF", description: "Fix page orientation.", icon: RefreshCcw, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/rotate" },
  { id: 'crop-pdf', category: 'organize', title: "Crop PDF", description: "Trim margins and content area.", icon: Scissors, color: "text-orange-500", iconBg: "bg-orange-50", href: "/crop-pdf" },
  { id: 'pagenums', category: 'organize', title: "Page Numbers", description: "Add page numbers to PDF.", icon: Type, color: "text-red-500", iconBg: "bg-red-50", href: "/pagenums" },
  { id: 'watermark', category: 'organize', title: "Watermark", description: "Stamp text or image on PDF.", icon: FileImage, color: "text-red-500", iconBg: "bg-red-50", href: "/watermark" },
  { id: 'repair', category: 'organize', title: "Normalize PDF", description: "Rebuild readable PDF structure.", icon: Zap, color: "text-gray-500", iconBg: "bg-gray-50", href: "/repair" },
  { id: 'flatten', category: 'organize', title: "Flatten PDF", description: "Convert editable content to flat.", icon: Layers, color: "text-purple-500", iconBg: "bg-purple-50", href: "/flatten" },
  { id: 'redact', category: 'organize', title: "Redact PDF", description: "Blackout sensitive text.", icon: ShieldAlert, color: "text-red-500", iconBg: "bg-red-50", href: "/redact" },
  { id: 'compare-pdf', category: 'organize', title: "Visual PDF Compare", description: "Overlay or view matching pages side by side.", icon: GitCompare, color: "text-pink-500", iconBg: "bg-pink-50", href: "/compare-pdf" },
  { id: 'scrub', category: 'organize', title: "Scrub Metadata", description: "Clear standard PDF metadata fields.", icon: Eraser, color: "text-gray-500", iconBg: "bg-gray-50", href: "/scrub" },
  { id: 'form-filler', category: 'organize', title: "PDF Form Filler", description: "Fill out PDF forms easily.", icon: ClipboardList, color: "text-blue-500", iconBg: "bg-blue-50", href: "/form-filler" },
{ id: 'pdf-validator', category: 'organize', title: "Basic PDF Check", description: "Run structural checks and normalize readable PDFs.", icon: FileCheck, color: "text-green-500", iconBg: "bg-green-50", href: "/pdf-validator" },
{ id: 'batch-pdf', category: 'organize', title: "Batch PDF", description: "Compress, merge, convert multiple PDFs at once.", icon: FolderOutput, color: "text-cyan-500", iconBg: "bg-cyan-50", href: "/batch-pdf" },
{ id: 'pipeline', category: 'organize', title: "Batch Pipeline", description: "Compress, merge, and protect PDFs in one local run.", icon: Layers, color: "text-emerald-500", iconBg: "bg-emerald-50", href: "/pipeline" },
{ id: 'header-footer', category: 'organize', title: "Header & Footer", description: "Add header or footer to PDF pages.", icon: AlignCenter, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/header-footer" },
{ id: 'pdf-optimize', category: 'organize', title: "Optimize PDF Structure", description: "Rebuild object structure and optionally clear metadata.", icon: Zap, color: "text-orange-500", iconBg: "bg-orange-50", href: "/pdf-optimize" },

  // ── Convert ──
  { id: 'pdf2word', category: 'convert', title: "PDF to Word", description: "Convert PDF to editable DOCX.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/pdf2word" },
  { id: 'word2pdf', category: 'convert', title: "DOCX to PDF", description: "Render DOCX content into PDF pages.", icon: FileOutput, color: "text-blue-500", iconBg: "bg-blue-50", href: "/word2pdf" },
  { id: 'pdf2excel', category: 'convert', title: "PDF Table to CSV", description: "Heuristically extract aligned table text to CSV.", icon: FileSpreadsheet, color: "text-green-500", iconBg: "bg-green-50", href: "/pdf2excel" },
  { id: 'excel2pdf', category: 'convert', title: "XLSX to PDF", description: "Render the first XLSX worksheet to PDF.", icon: FileSpreadsheet, color: "text-green-500", iconBg: "bg-green-50", href: "/excel2pdf" },
  { id: 'pdf2ppt', category: 'convert', title: "PDF to PowerPoint", description: "Place each PDF page as a visual slide.", icon: LayoutTemplate, color: "text-orange-500", iconBg: "bg-orange-50", href: "/pdf2ppt" },
  { id: 'ppt2pdf', category: 'convert', title: "PPTX to PDF", description: "Convert full slides in the cloud or embedded media locally.", icon: LayoutTemplate, color: "text-orange-500", iconBg: "bg-orange-50", href: "/ppt2pdf" },
  { id: 'pdf2imgs', category: 'convert', title: "PDF to JPG", description: "Save pages as images.", icon: FileImage, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/pdf2imgs" },
{ id: 'pdf2png', category: 'convert', title: "PDF to PNG", description: "Convert PDF pages to PNG images.", icon: Image, color: "text-cyan-500", iconBg: "bg-cyan-50", href: "/pdf2png" },
{ id: 'pdf2webp', category: 'convert', title: "PDF to WebP", description: "Convert PDF to WebP images for web.", icon: Monitor, color: "text-emerald-500", iconBg: "bg-emerald-50", href: "/pdf2webp" },
  { id: 'imgs2pdf', category: 'convert', title: "JPG to PDF", description: "Convert images to PDF.", icon: Image, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/imgs2pdf" },
  { id: 'html2pdf', category: 'convert', title: "HTML to PDF", description: "Convert webpages to PDF.", icon: FileText, color: "text-gray-500", iconBg: "bg-gray-50", href: "/html2pdf" },
  { id: 'pdf2pdfa', category: 'convert', title: "Archival Metadata Prep", description: "Normalize metadata before formal PDF/A validation.", icon: FileText, color: "text-red-500", iconBg: "bg-red-50", href: "/pdf2pdfa" },
  { id: 'ocr', category: 'convert', title: "OCR (Scan Text)", description: "Extract text from scanned PDF.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/ocr" },
  { id: 'scan-pdf', category: 'convert', title: "Scan to PDF", description: "Camera photos to PDF.", icon: Camera, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/scan-pdf" },
  { id: 'pdf2text', category: 'convert', title: "PDF to Text", description: "Extract all text from PDF.", icon: FileText, color: "text-slate-500", iconBg: "bg-slate-50", href: "/pdf2text" },
{ id: 'extract-images', category: 'convert', title: "Extract Images", description: "Extract compatible embedded raster images.", icon: Images, color: "text-purple-500", iconBg: "bg-purple-50", href: "/extract-images" },
{ id: 'pdf2html', category: 'convert', title: "PDF to HTML", description: "Extract readable text into semantic HTML.", icon: FileCode, color: "text-orange-500", iconBg: "bg-orange-50", href: "/pdf2html" },
{ id: 'pdf2markdown', category: 'convert', title: "PDF to Markdown", description: "Convert PDF to Markdown format.", icon: FileTextIcon, color: "text-teal-500", iconBg: "bg-teal-50", href: "/pdf2markdown" },
{ id: 'pdf2epub', category: 'convert', title: "PDF to EPUB", description: "Convert PDF to EPUB e-book.", icon: BookOpen, color: "text-violet-500", iconBg: "bg-violet-50", href: "/pdf2epub" },
{ id: 'pdf2json', category: 'convert', title: "PDF to JSON", description: "Extract PDF data to JSON format.", icon: FileJson, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/pdf2json" },
{ id: 'pdf2csv', category: 'convert', title: "PDF to CSV", description: "Export positioned text items to CSV.", icon: Table, color: "text-green-500", iconBg: "bg-green-50", href: "/pdf2csv" },
{ id: 'pdf2rtf', category: 'convert', title: "PDF to RTF", description: "Convert PDF to Rich Text Format.", icon: FileCode2, color: "text-blue-500", iconBg: "bg-blue-50", href: "/pdf2rtf" },
{ id: 'pdf-grayscale', category: 'organize', title: "PDF Grayscale", description: "Convert PDF to black and white.", icon: Contrast, color: "text-gray-500", iconBg: "bg-gray-50", href: "/pdf-grayscale" },

  // ── Security ──
  { id: 'unlock', category: 'security', title: "Unlock PDF", description: "Remove password from PDF.", icon: Unlock, color: "text-slate-500", iconBg: "bg-slate-50", href: "/unlock" },
  { id: 'protect', category: 'security', title: "Protect PDF", description: "Encrypt with a password.", icon: Lock, color: "text-slate-500", iconBg: "bg-slate-50", href: "/protect" },
  { id: 'signature', category: 'security', title: "Sign PDF", description: "Add electronic signatures.", icon: FileSignature, color: "text-red-500", iconBg: "bg-red-50", href: "/signature" },

  // ── Create ──
  { id: 'invoice-generator', category: 'create', title: "Invoice Generator", description: "Create professional invoices.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/invoice-generator" },
  { id: 'resume-builder', category: 'create', title: "Resume Builder", description: "Build ATS-friendly resumes.", icon: LayoutTemplate, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/resume-builder" },
  { id: 'certificate-maker', category: 'create', title: "Certificate Maker", description: "Design awards & certificates.", icon: Wand2, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/certificate-maker" },
  { id: 'chat-pdf', category: 'create', title: "Chat with PDF", description: "Ask Gemini about text from the first fifteen pages.", icon: BrainCircuit, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/chat-pdf" },
  { id: 'summarize-pdf', category: 'create', title: "AI Summarizer", description: "Summarize text from the first ten pages.", icon: BrainCircuit, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/summarize-pdf" },
  { id: 'smart-organize', category: 'create', title: "Smart Organizer", description: "Suggest names and folders from first-page patterns.", icon: Wand2, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/smart-organize" },
  { id: 'translate-pdf', category: 'create', title: "Translate PDF Text", description: "Translate extracted text from the first five pages.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/translate-pdf" },
  { id: 'qr-code', category: 'create', title: "QR Code Studio", description: "Create custom QR codes with colors, shapes, and logos.", icon: QrCode, color: "text-emerald-500", iconBg: "bg-emerald-50", href: "/qr-code" },
  { id: 'qr-reader', category: 'create', title: "QR Code Reader", description: "Scan QR codes from camera or image files.", icon: QrCode, color: "text-green-500", iconBg: "bg-green-50", href: "/qr-reader" },
]
