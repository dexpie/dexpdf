import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { Document, Packer, Paragraph, TextRun } from 'docx'

try { pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` } catch (e) { }

export default function PdfToWordTool() {
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [dropped, setDropped] = useState(false)

    async function loadFile(e) {
        const f = e.target.files[0]
        if (!f) return
        setFile(f)
    }

    function onDragEnter(e) { e.preventDefault(); setDragging(true) }
    function onDragOverZone(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }
    function onDragLeave(e) { e.preventDefault(); setDragging(false) }
    async function onDropZone(e) { e.preventDefault(); setDragging(false); const f = e.dataTransfer?.files?.[0]; if (f) { setFile(f); setDropped(true); setTimeout(() => setDropped(false), 1500) } }

    async function convert() {
        if (!file) return
        setBusy(true)
        try {
            const data = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data }).promise
            const paragraphs = []
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const txtContent = await page.getTextContent()
                const strings = txtContent.items.map(it => it.str)
                paragraphs.push(new Paragraph(strings.join(' ')))
            }

            const doc = new Document({ sections: [{ children: paragraphs }] })
            const blob = await Packer.toBlob(doc)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${file.name.replace(/\.pdf$/i, '')}.docx`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) { console.error(err); alert('Failed: ' + err.message) }
        finally { setBusy(false) }
    }

    return (
        <div>
            <h2>PDF → Word (.docx)</h2>
            <div className={`dropzone ${dragging ? 'dragover' : ''}`} onDragEnter={onDragEnter} onDragOver={onDragOverZone} onDragLeave={onDragLeave} onDrop={onDropZone}>
                <input type="file" accept="application/pdf" onChange={loadFile} />
                <div className="muted">Select a PDF to convert to a simple .docx (text-only).</div>
                {dropped && <div className="drop-overlay">✓ Uploaded</div>}
            </div>
            <div style={{ marginTop: 12 }}>
                <button className="btn-primary" onClick={convert} disabled={busy || !file}>{busy ? 'Working...' : 'Convert to DOCX'}</button>
            </div>
        </div>
    )
}
