import {
    Zap, Layers, Scissors, Download, FileText, LayoutTemplate, FileOutput, PenTool, FileImage, Image, FileSignature, RefreshCcw, Unlock, Lock, Type, FileSpreadsheet, BrainCircuit, Wand2, ShieldAlert, Eraser, Camera, GitCompare
} from 'lucide-react'

// Simplified categories — focused on PDF
export const CATEGORIES = [
    { id: 'all', label: 'All Tools' },
    { id: 'organize', label: 'Organize' },
    { id: 'convert', label: 'Convert' },
    { id: 'security', label: 'Security' },
    { id: 'create', label: 'Create' },
]

export const TOOLS = [
    // ── Organize PDF ──
    { id: 'merge', category: 'organize', title: "Merge PDF", description: "Combine multiple PDFs into one.", icon: Layers, color: "text-red-500", iconBg: "bg-red-50", href: "/merge" },
    { id: 'split', category: 'organize', title: "Split PDF", description: "Separate pages or extract ranges.", icon: Scissors, color: "text-red-500", iconBg: "bg-red-50", href: "/split" },
    { id: 'compress', category: 'organize', title: "Compress PDF", description: "Reduce file size, keep quality.", icon: Download, color: "text-green-500", iconBg: "bg-green-50", href: "/compress" },
    { id: 'organize', category: 'organize', title: "Organize Pages", description: "Sort, add and delete pages.", icon: Layers, color: "text-red-500", iconBg: "bg-red-50", href: "/organize" },
    { id: 'edit', category: 'organize', title: "Edit PDF", description: "Add text, shapes, images.", icon: PenTool, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/edit" },
    { id: 'rotate', category: 'organize', title: "Rotate PDF", description: "Fix page orientation.", icon: RefreshCcw, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/organize" },
    { id: 'crop-pdf', category: 'organize', title: "Crop PDF", description: "Trim margins and content area.", icon: Scissors, color: "text-orange-500", iconBg: "bg-orange-50", href: "/crop-pdf" },
    { id: 'pagenums', category: 'organize', title: "Page Numbers", description: "Add page numbers to PDF.", icon: Type, color: "text-red-500", iconBg: "bg-red-50", href: "/pagenums" },
    { id: 'watermark', category: 'organize', title: "Watermark", description: "Stamp text or image on PDF.", icon: FileImage, color: "text-red-500", iconBg: "bg-red-50", href: "/watermark" },
    { id: 'repair', category: 'organize', title: "Repair PDF", description: "Fix damaged PDF files.", icon: Zap, color: "text-gray-500", iconBg: "bg-gray-50", href: "/repair" },
    { id: 'flatten', category: 'organize', title: "Flatten PDF", description: "Convert editable content to flat.", icon: Layers, color: "text-purple-500", iconBg: "bg-purple-50", href: "/flatten" },
    { id: 'redact', category: 'organize', title: "Redact PDF", description: "Blackout sensitive text.", icon: ShieldAlert, color: "text-red-500", iconBg: "bg-red-50", href: "/redact" },
    { id: 'compare-pdf', category: 'organize', title: "Compare PDF", description: "Diff two PDF versions.", icon: GitCompare, color: "text-pink-500", iconBg: "bg-pink-50", href: "/compare-pdf" },
    { id: 'scrub', category: 'organize', title: "Scrub Metadata", description: "Clean hidden data for privacy.", icon: Eraser, color: "text-gray-500", iconBg: "bg-gray-50", href: "/scrub" },

    // ── Convert ──
    { id: 'pdf2word', category: 'convert', title: "PDF to Word", description: "Convert PDF to editable DOCX.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/pdf2word" },
    { id: 'word2pdf', category: 'convert', title: "Word to PDF", description: "Convert DOC/DOCX to PDF.", icon: FileOutput, color: "text-blue-500", iconBg: "bg-blue-50", href: "/word2pdf" },
    { id: 'pdf2excel', category: 'convert', title: "PDF to Excel", description: "Extract tables to spreadsheets.", icon: FileSpreadsheet, color: "text-green-500", iconBg: "bg-green-50", href: "/pdf2excel" },
    { id: 'excel2pdf', category: 'convert', title: "Excel to PDF", description: "Convert spreadsheets to PDF.", icon: FileSpreadsheet, color: "text-green-500", iconBg: "bg-green-50", href: "/excel2pdf" },
    { id: 'pdf2ppt', category: 'convert', title: "PDF to PowerPoint", description: "Convert to editable slides.", icon: LayoutTemplate, color: "text-orange-500", iconBg: "bg-orange-50", href: "/pdf2ppt" },
    { id: 'ppt2pdf', category: 'convert', title: "PowerPoint to PDF", description: "Convert PPT/PPTX to PDF.", icon: LayoutTemplate, color: "text-orange-500", iconBg: "bg-orange-50", href: "/ppt2pdf" },
    { id: 'pdf2imgs', category: 'convert', title: "PDF to JPG", description: "Save pages as images.", icon: FileImage, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/pdf2imgs" },
    { id: 'imgs2pdf', category: 'convert', title: "JPG to PDF", description: "Convert images to PDF.", icon: Image, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/imgs2pdf" },
    { id: 'html2pdf', category: 'convert', title: "HTML to PDF", description: "Convert webpages to PDF.", icon: FileText, color: "text-gray-500", iconBg: "bg-gray-50", href: "/html2pdf" },
    { id: 'pdf2pdfa', category: 'convert', title: "PDF to PDF/A", description: "Archival-standard PDF.", icon: FileText, color: "text-red-500", iconBg: "bg-red-50", href: "/pdf2pdfa" },
    { id: 'ocr', category: 'convert', title: "OCR (Scan Text)", description: "Extract text from scanned PDF.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/ocr" },
    { id: 'scan-pdf', category: 'convert', title: "Scan to PDF", description: "Camera photos to PDF.", icon: Camera, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/scan-pdf" },
    { id: 'pdf2text', category: 'convert', title: "PDF to Text", description: "Extract all text from PDF.", icon: FileText, color: "text-slate-500", iconBg: "bg-slate-50", href: "/pdf2text" },

    // ── Security ──
    { id: 'unlock', category: 'security', title: "Unlock PDF", description: "Remove password from PDF.", icon: Unlock, color: "text-slate-500", iconBg: "bg-slate-50", href: "/unlock" },
    { id: 'protect', category: 'security', title: "Protect PDF", description: "Encrypt with a password.", icon: Lock, color: "text-slate-500", iconBg: "bg-slate-50", href: "/protect" },
    { id: 'signature', category: 'security', title: "Sign PDF", description: "Add electronic signatures.", icon: FileSignature, color: "text-red-500", iconBg: "bg-red-50", href: "/signature" },

    // ── Create ──
    { id: 'invoice-generator', category: 'create', title: "Invoice Generator", description: "Create professional invoices.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/invoice-generator" },
    { id: 'resume-builder', category: 'create', title: "Resume Builder", description: "Build ATS-friendly resumes.", icon: LayoutTemplate, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/resume-builder" },
    { id: 'certificate-maker', category: 'create', title: "Certificate Maker", description: "Design awards & certificates.", icon: Wand2, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/certificate-maker" },
    { id: 'chat-pdf', category: 'create', title: "Chat with PDF", description: "AI analyze your documents.", icon: BrainCircuit, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/chat-pdf" },
    { id: 'summarize-pdf', category: 'create', title: "AI Summarizer", description: "Extract key insights instantly.", icon: BrainCircuit, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/summarize-pdf" },
    { id: 'smart-organize', category: 'create', title: "Smart Organizer", description: "AI auto-rename & sort files.", icon: Wand2, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/smart-organize" },
    { id: 'translate-pdf', category: 'create', title: "Translate PDF", description: "Translate PDF to any language.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/translate-pdf" },
]
