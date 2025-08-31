import React, { useState } from 'react'
import mammoth from 'mammoth'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function WordToPdfTool() {
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)

    async function loadFile(e) {
        const f = e.target.files[0]
        if (!f) return
        setFile(f)
    }

    async function convert() {
        if (!file) return
        setBusy(true)
        try {
            const arrayBuffer = await file.arrayBuffer()
            const result = await mammoth.convertToHtml({ arrayBuffer })
            const html = result.value
            const wrapper = document.createElement('div')
            wrapper.innerHTML = html
            wrapper.style.padding = '20px'
            document.body.appendChild(wrapper)
            const canvas = await html2canvas(wrapper, { scale: 2 })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = 210
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(file.name.replace(/\.docx$/i, '') + '.pdf')
            document.body.removeChild(wrapper)
        } catch (err) { console.error(err); alert('Failed: ' + err.message) }
        finally { setBusy(false) }
    }

    return (
        <div>
            <h2>Word (.docx) → PDF</h2>
            <div className="dropzone">
                <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={loadFile} />
                <div className="muted">Select a .docx file to convert to PDF (simple formatting).</div>
            </div>
            <div style={{ marginTop: 12 }}>
                <button className="btn" onClick={convert} disabled={busy || !file}>{busy ? 'Working...' : 'Convert to PDF'}</button>
            </div>
        </div>
    )
}
