'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const TOOL_METADATA = {
  '/': { title: 'DexPDF - Free Online PDF Tools', desc: 'Merge, split, compress, convert, rotate, unlock and watermark PDFs online for free.' },
  '/merge': { title: 'Merge PDF - Combine PDF Files Online', desc: 'Combine multiple PDFs into one unified document. Free, fast, and secure.' },
  '/split': { title: 'Split PDF - Extract Pages Online', desc: 'Separate pages or extract ranges from your PDF files instantly.' },
  '/compress': { title: 'Compress PDF - Reduce File Size', desc: 'Reduce PDF file size while maintaining the best visual quality.' },
  '/pdf2word': { title: 'PDF to Word - Convert PDF to DOCX', desc: 'Convert PDF documents to editable Word files with high accuracy.' },
  '/pdf2ppt': { title: 'PDF to PowerPoint - Convert to PPTX', desc: 'Turn your PDF presentations into editable PowerPoint slides.' },
  '/pdf2excel': { title: 'PDF to Excel - Convert to XLS', desc: 'Extract data from PDF tables to Excel spreadsheets easily.' },
  '/edit': { title: 'Edit PDF - Free PDF Editor', desc: 'Add text, shapes, images and annotations to your PDF pages.' },
  '/signature': { title: 'Sign PDF - eSignature Tool', desc: 'Sign documents yourself or request electronic signatures from others.' },
  '/protect': { title: 'Protect PDF - Encrypt with Password', desc: 'Secure your PDF files with military-grade encryption.' },
  '/unlock': { title: 'Unlock PDF - Remove Password', desc: 'Remove password security from PDF files instantly.' },
  '/repair': { title: 'Repair PDF - Recover Corrupted Files', desc: 'Fix damaged PDF files and recover data from corrupted documents.' },
  '/ocr': { title: 'OCR PDF - Recognize Text', desc: 'Convert scanned PDFs and images into searchable, editable text.' },
  '/pdf2pdfa': { title: 'PDF to PDF/A - Archive Converter', desc: 'Convert PDFs to PDF/A format for long-term archiving and compliance.' },
}

export default function SEOWrapper() {
  const pathname = usePathname()
  const { i18n } = useTranslation()

  useEffect(() => {
    const meta = TOOL_METADATA[pathname] || {
      title: 'DexPDF - All-in-One PDF Tool',
      desc: 'The best free online PDF tools for everyone.'
    }

    document.title = meta.title

    // Update meta description if it exists
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = meta.desc

  }, [pathname, i18n.language])

  return null // Logic only, no UI
}
