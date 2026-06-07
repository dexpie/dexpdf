import React, { useState } from 'react'
import { saveAs } from 'file-saver'
import { AlertTriangle, BookOpen, CheckCircle, Contrast, Download, FileCode2, FileJson, FileText, Table } from 'lucide-react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { configurePdfWorker } from '../utils/pdfWorker'

configurePdfWorker()

const CONFIG = {
  pdf2json: { title: 'PDF to JSON', description: 'Export page text and positioned text items to structured JSON.', icon: FileJson, ext: 'json' },
  pdf2csv: { title: 'PDF to CSV', description: 'Export each positioned text item as a CSV row.', icon: Table, ext: 'csv' },
  pdf2rtf: { title: 'PDF to RTF', description: 'Export readable PDF text to a Rich Text Format document.', icon: FileCode2, ext: 'rtf' },
  pdf2markdown: { title: 'PDF to Markdown', description: 'Export readable PDF text with page headings.', icon: FileText, ext: 'md' },
  pdf2epub: { title: 'PDF to EPUB', description: 'Create a reflowable EPUB from readable PDF text.', icon: BookOpen, ext: 'epub' },
  'pdf-grayscale': { title: 'PDF Grayscale', description: 'Render every page in grayscale and create a new PDF.', icon: Contrast, ext: 'pdf' },
}

const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`
const escapeXml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])
const baseName = name => name.replace(/\.pdf$/i, '')

async function readPages(pdf) {
  const pages = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const items = content.items.map(item => ({
      text: item.str,
      x: Math.round(item.transform?.[4] || 0),
      y: Math.round(item.transform?.[5] || 0),
      width: Math.round(item.width || 0),
      height: Math.round(item.height || 0),
    })).filter(item => item.text.trim())
    pages.push({ page: pageNumber, text: items.map(item => item.text).join(' '), items })
  }
  return pages
}

async function createEpub(file, pages) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  const id = `dexpdf-${Date.now()}`
  const title = baseName(file.name)

  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  zip.file('META-INF/container.xml', `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`)

  const manifest = []
  const spine = []
  pages.forEach(page => {
    const fileName = `page-${page.page}.xhtml`
    manifest.push(`<item id="page${page.page}" href="${fileName}" media-type="application/xhtml+xml"/>`)
    spine.push(`<itemref idref="page${page.page}"/>`)
    zip.file(`OEBPS/${fileName}`, `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(title)} - Page ${page.page}</title></head><body><h1>Page ${page.page}</h1><p>${escapeXml(page.text)}</p></body></html>`)
  })

  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">${id}</dc:identifier><dc:title>${escapeXml(title)}</dc:title><dc:language>en</dc:language></metadata><manifest>${manifest.join('')}</manifest><spine>${spine.join('')}</spine></package>`)
  return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' })
}

async function createGrayscalePdf(pdf) {
  const { PDFDocument } = await import('pdf-lib')
  const output = await PDFDocument.create()

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const context = canvas.getContext('2d', { willReadFrequently: true })
    await page.render({ canvasContext: context, viewport }).promise

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    for (let index = 0; index < imageData.data.length; index += 4) {
      const gray = Math.round(imageData.data[index] * 0.299 + imageData.data[index + 1] * 0.587 + imageData.data[index + 2] * 0.114)
      imageData.data[index] = gray
      imageData.data[index + 1] = gray
      imageData.data[index + 2] = gray
    }
    context.putImageData(imageData, 0, 0)

    const pngBytes = await fetch(canvas.toDataURL('image/png')).then(response => response.arrayBuffer())
    const embedded = await output.embedPng(pngBytes)
    const outputPage = output.addPage([viewport.width, viewport.height])
    outputPage.drawImage(embedded, { x: 0, y: 0, width: viewport.width, height: viewport.height })
  }

  return new Blob([await output.save({ useObjectStreams: true })], { type: 'application/pdf' })
}

export default function PdfDataExtractTool({ toolId = 'pdf2json' }) {
  const config = CONFIG[toolId] || CONFIG.pdf2json
  const Icon = config.icon
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState('')

  const handleFiles = files => {
    setFile(files[0] || null)
    setError('')
    setSuccess('')
    setPreview('')
  }

  const processPdf = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    setSuccess('')

    try {
      const pdfjs = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
      let blob
      let output = ''

      if (toolId === 'pdf-grayscale') {
        blob = await createGrayscalePdf(pdf)
      } else {
        const pages = await readPages(pdf)
        if (toolId === 'pdf2json') {
          output = JSON.stringify({ filename: file.name, pageCount: pdf.numPages, pages }, null, 2)
          blob = new Blob([output], { type: 'application/json' })
        } else if (toolId === 'pdf2csv') {
          output = ['page,item,text,x,y,width,height', ...pages.flatMap(page => page.items.map((item, index) => [page.page, index + 1, escapeCsv(item.text), item.x, item.y, item.width, item.height].join(',')))].join('\n')
          blob = new Blob([output], { type: 'text/csv;charset=utf-8' })
        } else if (toolId === 'pdf2rtf') {
          const text = pages.map(page => `Page ${page.page}\\par ${page.text.replace(/[\\{}]/g, '\\$&')}\\par\\par`).join('')
          output = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\f0\\fs22 ${text}}`
          blob = new Blob([output], { type: 'application/rtf' })
        } else if (toolId === 'pdf2markdown') {
          output = pages.map(page => `## Page ${page.page}\n\n${page.text}`).join('\n\n')
          blob = new Blob([output], { type: 'text/markdown;charset=utf-8' })
        } else if (toolId === 'pdf2epub') {
          blob = await createEpub(file, pages)
        }
      }

      if (!blob) throw new Error('No output was generated.')
      saveAs(blob, `${baseName(file.name)}.${config.ext}`)
      setPreview(output.slice(0, 800))
      setSuccess(`${config.title} completed successfully.`)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not process this PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolLayout title={config.title} description={config.description}>
      <div className="mx-auto max-w-3xl space-y-5">
        {!file && <FileDropZone onFiles={handleFiles} accept="application/pdf" hint="Select one readable PDF file" />}
        {file && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0"><p className="truncate font-semibold text-foreground">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
              </div>
              <button onClick={() => handleFiles([])} className="text-sm font-medium text-muted-foreground hover:text-foreground">Remove</button>
            </div>
            {preview && <pre className="mb-4 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-secondary p-4 text-xs text-muted-foreground">{preview}</pre>}
            {error && <div className="mb-4 flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}
            {success && <div className="mb-4 flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600"><CheckCircle className="h-5 w-5 shrink-0" />{success}</div>}
            <button onClick={processPdf} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50">
              {busy ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />Processing...</> : <><Download className="h-5 w-5" />Create {config.ext.toUpperCase()}</>}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
