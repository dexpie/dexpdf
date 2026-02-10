import {
    Zap, Layers, Scissors, Download, FileText, LayoutTemplate, FileOutput, PenTool, FileImage, Image, FileSignature, RefreshCcw, Unlock, Lock, Type, FileSpreadsheet, BrainCircuit, Wand2, ShieldAlert, Eraser, Braces, Binary, Scale, QrCode, AlignLeft, Calculator, Timer, Palette, Paintbrush, ArrowLeftRight, Monitor, Link as LinkIcon, Fingerprint, Volume2, Keyboard, Activity, Battery, Signal, Hourglass, FileDiff, FileCode, BarChart2, Hash, Dices, Sigma, Divide, Terminal, Database, Link2, Code, Eye, Pipette, EyeOff, Shield, KeyRound, Globe, Tag, Network, ShieldCheck, TrendingUp, Sliders, Calendar, Play, DollarSign, Briefcase, TrendingDown, HelpCircle, User, Camera, GitCompare
} from 'lucide-react'

// Define categories
export const CATEGORIES = [
    { id: 'all', label: 'All Tools' },
    { id: 'pdf', label: 'Organize PDF' },
    { id: 'optimize', label: 'Optimize' },
    { id: 'convert', label: 'Convert PDF' },
    { id: 'security', label: 'Security' },
    { id: 'image', label: 'Image Tools' },
    { id: 'text', label: 'Text Tools' },
    { id: 'dev', label: 'Developer' },
    { id: 'web', label: 'Web Tools' },
    { id: 'finance', label: 'Finance' },
    { id: 'math', label: 'Math & Data' },
    { id: 'time', label: 'Date & Time' },
    { id: 'fun', label: 'Fun & Social' },
]

export const TOOLS = [
    // PDF Tools - Organization (Red)
    { id: 'merge', category: 'pdf', title: "Merge PDF", description: "Combine multiple PDFs into one unified document.", icon: Layers, color: "text-red-500", iconBg: "bg-red-50", href: "/merge" },
    { id: 'split', category: 'pdf', title: "Split PDF", description: "Separate pages or extract ranges from your PDF.", icon: Scissors, color: "text-red-500", iconBg: "bg-red-50", href: "/split" },
    { id: 'organize', category: 'pdf', title: "Organize PDF", description: "Sort, add and delete PDF pages.", icon: Layers, color: "text-red-500", iconBg: "bg-red-50", href: "/organize" },
    { id: 'scan-pdf', category: 'pdf', title: "Scan to PDF", description: "Turn camera photos into PDF.", icon: Camera, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/scan-pdf" },
    { id: 'crop-pdf', category: 'pdf', title: "Crop PDF", description: "Trim margins and select content area.", icon: Scissors, color: "text-orange-500", iconBg: "bg-orange-50", href: "/crop-pdf" },
    { id: 'pagenums', category: 'pdf', title: "Page Numbers", description: "Add page numbers to your PDF document.", icon: Type, color: "text-red-500", iconBg: "bg-red-50", href: "/pagenums" },
    { id: 'watermark', category: 'pdf', title: "Watermark", description: "Stamp an image or text over your PDF files.", icon: FileImage, color: "text-red-500", iconBg: "bg-red-50", href: "/watermark" },
    { id: 'rotate', category: 'pdf', title: "Rotate PDF", description: "Rotate your PDF pages to the correct orientation.", icon: RefreshCcw, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/organize" },
    { id: 'repair', category: 'pdf', title: "Repair PDF", description: "Repair damaged or corrupted PDF files.", icon: Zap, color: "text-gray-500", iconBg: "bg-gray-50", href: "/repair" },
    { id: 'chat-pdf', category: 'pdf', title: "Chat with PDF", description: "Use AI to analyze and chat with your documents.", icon: Zap, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/chat-pdf" },
    { id: 'compare-pdf', category: 'pdf', title: "Compare PDF", description: "Visually diff two PDF versions.", icon: GitCompare, color: "text-pink-500", iconBg: "bg-pink-50", href: "/compare-pdf" },
    { id: 'redact', category: 'pdf', title: "Redact PDF", description: "Permanently blackout & remove sensitive text.", icon: ShieldAlert, color: "text-red-500", iconBg: "bg-red-50", href: "/redact" },
    { id: 'edit', category: 'pdf', title: "Edit PDF", description: "Add text, shapes, images and comments to PDF.", icon: PenTool, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/edit" },

    // Optimization (Green)
    { id: 'compress', category: 'optimize', title: "Compress PDF", description: "Reduce file size while maintaining visual quality.", icon: Download, color: "text-green-500", iconBg: "bg-green-50", href: "/compress" },
    { id: 'flatten', category: 'optimize', title: "Flatten PDF", description: "Convert editable content to images.", icon: Layers, color: "text-purple-500", iconBg: "bg-purple-50", href: "/flatten" },
    { id: 'smart-organize', category: 'optimize', title: "Smart Organizer", description: "AI Auto-Rename & Sort (Invoices, Contracts).", icon: Wand2, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/smart-organize" },
    { id: 'summarize-pdf', category: 'optimize', title: "AI Summarizer", description: "Extract key insights & summaries instantly.", icon: BrainCircuit, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/summarize-pdf" },
    { id: 'scrub', category: 'optimize', title: "Scrub Metadata", description: "Clean hidden data for privacy.", icon: Eraser, color: "text-gray-500", iconBg: "bg-gray-50", href: "/scrub" },

    // Conversion (Blue)
    { id: 'pdf2word', category: 'convert', title: "PDF to Word", description: "Convert PDF documents to editable Word files.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/pdf2word" },
    { id: 'pdf2ppt', category: 'convert', title: "PDF to PowerPoint", description: "Convert PDFs to editable PowerPoint slides.", icon: LayoutTemplate, color: "text-orange-500", iconBg: "bg-orange-50", href: "/pdf2ppt" },
    { id: 'pdf2excel', category: 'convert', title: "PDF to Excel", description: "Convert PDF data to Excel spreadsheets.", icon: FileText, color: "text-green-500", iconBg: "bg-green-50", href: "/pdf2excel" },
    { id: 'word2pdf', category: 'convert', title: "Word to PDF", description: "Convert DOC and DOCX files to PDF.", icon: FileOutput, color: "text-blue-500", iconBg: "bg-blue-50", href: "/word2pdf" },
    { id: 'ppt2pdf', category: 'convert', title: "PowerPoint to PDF", description: "Convert PPT and PPTX slideshows to PDF.", icon: LayoutTemplate, color: "text-orange-500", iconBg: "bg-orange-50", href: "/ppt2pdf" },
    { id: 'excel2pdf', category: 'convert', title: "Excel to PDF", description: "Convert Excel spreadsheets to PDF documents.", icon: FileText, color: "text-green-500", iconBg: "bg-green-50", href: "/excel2pdf" },
    { id: 'pdf2imgs', category: 'convert', title: "PDF to JPG", description: "Extract images or save each page as JPG.", icon: FileImage, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/pdf2imgs" },
    { id: 'imgs2pdf', category: 'convert', title: "JPG to PDF", description: "Convert JPG, PNG, BMP images to PDF.", icon: Image, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/imgs2pdf" },
    { id: 'html2pdf', category: 'convert', title: "HTML to PDF", description: "Convert webpages to PDF documents.", icon: FileText, color: "text-gray-500", iconBg: "bg-gray-50", href: "/html2pdf" },
    { id: 'pdf2pdfa', category: 'convert', title: "PDF to PDF/A", description: "Convert PDF documents to PDF/A for archiving.", icon: FileText, color: "text-red-500", iconBg: "bg-red-50", href: "/pdf2pdfa" },
    { id: 'ocr', category: 'convert', title: "Scan to PDF", description: "Capture documents from scanner or mobile.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/ocr" },

    // Security (Gray)
    { id: 'unlock', category: 'security', title: "Unlock PDF", description: "Remove password styling from PDF files.", icon: Unlock, color: "text-slate-500", iconBg: "bg-slate-50", href: "/unlock" },
    { id: 'protect', category: 'security', title: "Protect PDF", description: "Encrypt your PDF with a secure password.", icon: Lock, color: "text-slate-500", iconBg: "bg-slate-50", href: "/protect" },
    { id: 'signature', category: 'security', title: "Sign PDF", description: "Sign yourself or request electronic signatures.", icon: FileSignature, color: "text-red-500", iconBg: "bg-red-50", href: "/signature" },

    // Document Generation
    { id: 'invoice-generator', category: 'pdf', title: "Invoice Generator", description: "Create professional invoices instantly.", icon: FileText, color: "text-blue-500", iconBg: "bg-blue-50", href: "/invoice-generator" },
    { id: 'resume-builder', category: 'pdf', title: "Resume Builder", description: "Build ATS-friendly resumes.", icon: LayoutTemplate, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/resume-builder" },
    { id: 'certificate-maker', category: 'pdf', title: "Certificate Maker", description: "Design awards & certificates.", icon: Wand2, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/certificate-maker" },


    // Text Tools
    { id: 'lorem-ipsum', category: 'text', title: "Lorem Ipsum", description: "Dummy text.", icon: AlignLeft, color: "text-gray-500", iconBg: "bg-gray-50", href: "/lorem-ipsum" },
    { id: 'markdown-preview', category: 'text', title: "Markdown Editor", description: "Live Markdown preview.", icon: FileText, color: "text-slate-700", iconBg: "bg-slate-100", href: "/markdown-preview" },
    { id: 'text-analyzer', category: 'text', title: "Text Analyzer", description: "Word count & density.", icon: Type, color: "text-blue-600", iconBg: "bg-blue-50", href: "/text-analyzer" },
    { id: 'text-diff', category: 'text', title: "Text Diff", description: "Compare text changes.", icon: FileDiff, color: "text-indigo-600", iconBg: "bg-indigo-50", href: "/text-diff" },
    { id: 'regex-tester', category: 'text', title: "Regex Tester", description: "Debug patterns.", icon: FileCode, color: "text-blue-600", iconBg: "bg-blue-50", href: "/regex-tester" },
    { id: 'case-converter', category: 'text', title: "Case Converter", description: "Camel, snake, kebab.", icon: Type, color: "text-orange-500", iconBg: "bg-orange-50", href: "/case-converter" },
    { id: 'word-density', category: 'text', title: "Word Density", description: "Analyze keywords.", icon: BarChart2, color: "text-green-600", iconBg: "bg-green-50", href: "/word-density" },
    { id: 'text-cleaner', category: 'text', title: "Text Cleaner", description: "Dedup, sort, trim.", icon: Scissors, color: "text-slate-600", iconBg: "bg-slate-50", href: "/text-cleaner" },
    { id: 'slug-generator', category: 'text', title: "Slug Generator", description: "URL friendly.", icon: Link2, color: "text-blue-600", iconBg: "bg-blue-50", href: "/slug-generator" },
    { id: 'string-obfuscator', category: 'text', title: "String Obfuscator", description: "ROT13, Base64.", icon: Lock, color: "text-indigo-600", iconBg: "bg-indigo-50", href: "/string-obfuscator" },
    { id: 'text-to-speech', category: 'text', title: "Text to Speech", description: "Browser text synthesis.", icon: Volume2, color: "text-pink-600", iconBg: "bg-pink-50", href: "/text-to-speech" },

    // Developer Tools
    { id: 'password-generator', category: 'dev', title: "Password Gen", description: "Create strong passwords.", icon: KeyRound, color: "text-green-500", iconBg: "bg-green-50", href: "/password-generator" },
    { id: 'json-formatter', category: 'dev', title: "JSON Formatter", description: "Validate and beautify JSON.", icon: Braces, color: "text-orange-500", iconBg: "bg-orange-50", href: "/json-formatter" },
    { id: 'base64-tool', category: 'dev', title: "Base64 Tool", description: "Encode/Decode Base64.", icon: Binary, color: "text-purple-500", iconBg: "bg-purple-50", href: "/base64-tool" },
    { id: 'hash-generator', category: 'dev', title: "Hash Generator", description: "MD5, SHA1/256.", icon: Fingerprint, color: "text-slate-600", iconBg: "bg-slate-100", href: "/hash-generator" },
    { id: 'token-generator', category: 'dev', title: "Token Generator", description: "UUID, Keys.", icon: KeyRound, color: "text-purple-600", iconBg: "bg-purple-50", href: "/token-generator" },
    { id: 'uuid-generator', category: 'dev', title: "UUID Bulk Gen", description: "Bulk V4 UUIDs.", icon: Fingerprint, color: "text-violet-500", iconBg: "bg-violet-50", href: "/uuid-generator" },
    { id: 'jwt-debugger', category: 'dev', title: "JWT Debugger", description: "Decode tokens.", icon: ShieldCheck, color: "text-pink-500", iconBg: "bg-pink-50", href: "/jwt-debugger" },
    { id: 'cron-parser', category: 'dev', title: "Cron Parser", description: "Explain cron schedules.", icon: Activity, color: "text-green-500", iconBg: "bg-green-50", href: "/cron-parser" },
    { id: 'sql-formatter', category: 'dev', title: "SQL Formatter", description: "Prettify queries.", icon: Terminal, color: "text-blue-600", iconBg: "bg-blue-50", href: "/sql-formatter" },
    { id: 'json-diff', category: 'dev', title: "JSON Diff", description: "Compare objects.", icon: Database, color: "text-green-600", iconBg: "bg-green-50", href: "/json-diff" },
    { id: 'html-entity', category: 'dev', title: "HTML Entity", description: "Escape chars.", icon: Code, color: "text-red-500", iconBg: "bg-red-50", href: "/html-entity" },
    { id: 'xml-json', category: 'dev', title: "XML to JSON", description: "Convert formats.", icon: FileCode, color: "text-blue-600", iconBg: "bg-blue-50", href: "/xml-json" },
    { id: 'yaml-json', category: 'dev', title: "YAML to JSON", description: "Convert formats.", icon: FileText, color: "text-orange-600", iconBg: "bg-orange-50", href: "/yaml-json" },
    { id: 'html-minifier', category: 'dev', title: "HTML Minify", description: "Compress HTML.", icon: FileCode, color: "text-orange-600", iconBg: "bg-orange-50", href: "/html-minifier" },
    { id: 'css-minifier', category: 'dev', title: "CSS Minify", description: "Compress CSS.", icon: FileCode, color: "text-blue-600", iconBg: "bg-blue-50", href: "/css-minifier" },
    { id: 'js-minifier', category: 'dev', title: "JS Minify", description: "Compress JavaScript.", icon: FileCode, color: "text-yellow-500", iconBg: "bg-yellow-50", href: "/js-minifier" },
    { id: 'keycode-info', category: 'dev', title: "Keycode Info", description: "View keyboard events.", icon: Keyboard, color: "text-slate-700", iconBg: "bg-slate-100", href: "/keycode-info" },

    // Web & Network
    { id: 'user-agent-parser', category: 'web', title: "UA Parser", description: "Browser/OS Info.", icon: Globe, color: "text-indigo-600", iconBg: "bg-indigo-50", href: "/user-agent-parser" },
    { id: 'meta-tag-generator', category: 'web', title: "Meta Tags", description: "SEO Generator.", icon: Tag, color: "text-pink-600", iconBg: "bg-pink-50", href: "/meta-tag-generator" },
    { id: 'url-parser', category: 'web', title: "URL Parser", description: "Explode URL components.", icon: LinkIcon, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/url-parser" },
    { id: 'url-encoder', category: 'web', title: "URL Encoder", description: "Encode/Decode.", icon: Link2, color: "text-orange-500", iconBg: "bg-orange-50", href: "/url-encoder" },
    { id: 'subnet-calculator', category: 'web', title: "Subnet Calc", description: "CIDR/IP Range.", icon: Network, color: "text-cyan-600", iconBg: "bg-cyan-50", href: "/subnet-calculator" },
    { id: 'ip-validator', category: 'web', title: "IP Validator", description: "Check IPv4/v6.", icon: ShieldCheck, color: "text-green-600", iconBg: "bg-green-50", href: "/ip-validator" },
    { id: 'dns-lookup', category: 'web', title: "DNS Lookup", description: "DoH Record query.", icon: Globe, color: "text-cyan-500", iconBg: "bg-cyan-50", href: "/dns-lookup" },
    { id: 'latency-tester', category: 'web', title: "Latency Test", description: "Check server ping.", icon: Activity, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/latency-tester" },
    { id: 'device-info', category: 'web', title: "Device Info", description: "Screen & Hardware specs.", icon: Monitor, color: "text-slate-700", iconBg: "bg-slate-100", href: "/device-info" },
    { id: 'network-info', category: 'web', title: "Network Info", description: "Connection speed & type.", icon: Signal, color: "text-blue-600", iconBg: "bg-blue-50", href: "/network-info" },
    { id: 'battery-status', category: 'web', title: "Battery Status", description: "Power level.", icon: Battery, color: "text-green-600", iconBg: "bg-green-50", href: "/battery-status" },

    // Math & Data
    { id: 'calculator', category: 'math', title: "Scientific Calc", description: "Advanced math functions.", icon: Calculator, color: "text-indigo-600", iconBg: "bg-indigo-50", href: "/calculator" },
    { id: 'unit-converter', category: 'math', title: "Unit Converter", description: "Convert common units.", icon: Scale, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/unit-converter" },
    { id: 'data-converter', category: 'math', title: "CSV <-> JSON", description: "Convert data formats.", icon: ArrowLeftRight, color: "text-orange-500", iconBg: "bg-orange-50", href: "/data-converter" },
    { id: 'excel-to-json', category: 'math', title: "Excel to JSON", description: "Extract XLSX data.", icon: FileSpreadsheet, color: "text-green-600", iconBg: "bg-green-50", href: "/excel-to-json" },
    { id: 'base-converter', category: 'math', title: "Base Converter", description: "Hex, Bin, Dec.", icon: Hash, color: "text-purple-600", iconBg: "bg-purple-50", href: "/base-converter" },
    { id: 'number-generator', category: 'math', title: "Num Generator", description: "Random sequences.", icon: Dices, color: "text-pink-500", iconBg: "bg-pink-50", href: "/number-generator" },
    { id: 'statistics-tool', category: 'math', title: "Statistics", description: "Mean, Median, StdDev.", icon: Sigma, color: "text-blue-600", iconBg: "bg-blue-50", href: "/statistics-tool" },
    { id: 'prime-factor', category: 'math', title: "Prime Factor", description: "Find factors.", icon: Divide, color: "text-indigo-600", iconBg: "bg-indigo-50", href: "/prime-factor" },

    // Finance Tools
    { id: 'loan-calculator', category: 'finance', title: "Loan Calc", description: "Mortgage/Auto.", icon: DollarSign, color: "text-blue-600", iconBg: "bg-blue-50", href: "/loan-calculator" },
    { id: 'interest-calculator', category: 'finance', title: "Interest Calc", description: "Compound growth.", icon: TrendingUp, color: "text-green-600", iconBg: "bg-green-50", href: "/interest-calculator" },
    { id: 'salary-calculator', category: 'finance', title: "Salary Calc", description: "Income conv.", icon: Briefcase, color: "text-slate-600", iconBg: "bg-slate-50", href: "/salary-calculator" },
    { id: 'discount-calculator', category: 'finance', title: "Discount Calc", description: "Sale price.", icon: Tag, color: "text-orange-600", iconBg: "bg-orange-50", href: "/discount-calculator" },

    // Date & Time
    { id: 'date-diff', category: 'time', title: "Date Diff", description: "Calc duration.", icon: Calendar, color: "text-orange-600", iconBg: "bg-orange-50", href: "/date-diff" },
    { id: 'stopwatch', category: 'time', title: "Stopwatch", description: "Timer with laps.", icon: Timer, color: "text-red-500", iconBg: "bg-red-50", href: "/stopwatch" },
    { id: 'countdown-timer', category: 'time', title: "Countdown", description: "Focus alarm.", icon: Play, color: "text-cyan-600", iconBg: "bg-cyan-50", href: "/countdown-timer" },
    { id: 'world-clock', category: 'time', title: "World Clock", description: "Multi-city display.", icon: Globe, color: "text-indigo-500", iconBg: "bg-indigo-50", href: "/world-clock" },
    { id: 'timezone-converter', category: 'time', title: "Timezone", description: "Meeting planner.", icon: Activity, color: "text-violet-500", iconBg: "bg-violet-50", href: "/timezone-converter" },
    { id: 'unix-timestamp', category: 'time', title: "Unix Time", description: "Epoch converter.", icon: Hourglass, color: "text-slate-600", iconBg: "bg-slate-100", href: "/unix-timestamp" },
    { id: 'metronome', category: 'time', title: "Metronome", description: "BPM beat generator.", icon: Activity, color: "text-red-500", iconBg: "bg-red-50", href: "/metronome" },

    // Fun & Misc
    { id: 'reaction-tester', category: 'fun', title: "Reflex Test", description: "Test your speed.", icon: Zap, color: "text-red-500", iconBg: "bg-red-50", href: "/reaction-tester" },
    { id: 'typing-test', category: 'fun', title: "Typing Test", description: "Check WPM.", icon: Keyboard, color: "text-purple-600", iconBg: "bg-purple-50", href: "/typing-test" },
    { id: 'decision-maker', category: 'fun', title: "Decision Maker", description: "Coin/Wheel.", icon: HelpCircle, color: "text-indigo-600", iconBg: "bg-indigo-50", href: "/decision-maker" },
    { id: 'meme-generator', category: 'fun', title: "Meme Generator", description: "Create memes.", icon: Type, color: "text-pink-600", iconBg: "bg-pink-50", href: "/meme-generator" },
    { id: 'color-contrast', category: 'fun', title: "Contrast Checker", description: "WCAG Accessibility.", icon: Eye, color: "text-slate-600", iconBg: "bg-slate-100", href: "/color-contrast" },
    { id: 'palette-generator', category: 'fun', title: "Palette Gen", description: "Harmonic colors.", icon: Palette, color: "text-pink-600", iconBg: "bg-pink-50", href: "/palette-generator" },
    { id: 'color-converter', category: 'fun', title: "Color Picker", description: "HEX, RGB, HSL, CMYK.", icon: Palette, color: "text-pink-500", iconBg: "bg-pink-50", href: "/color-converter" },
    { id: 'gradient-generator', category: 'fun', title: "Gradient Maker", description: "Visual CSS gradients.", icon: Paintbrush, color: "text-purple-500", iconBg: "bg-purple-50", href: "/gradient-generator" },
]
