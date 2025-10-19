import React, { useState } from 'react'
import mammoth from 'mammoth'
import html2canvas from 'html2canvas'
// jsPDF will be dynamically imported during conversion to avoid bundling it in the main chunk

export default function WordToPdfTool() {
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [dropped, setDropped] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    async function loadFile(e) {
        const f = e.target.files[0]
        if (!f) return
        
        setErrorMsg('')
        setSuccessMsg('')
        
        if (!f.name.endsWith('.docx')) {
            setErrorMsg('Please select a .docx file.')
            return
        }
        
        if (f.size > 20 * 1024 * 1024) {
            setErrorMsg('File too large (max 20MB).')
            return
        }
        
        setFile(f)
        setSuccessMsg('Document loaded! Click "Convert to PDF" to proceed.')
    }

    function onDragEnter(e) { e.preventDefault(); setDragging(true) }
    function onDragOverZone(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }
    function onDragLeave(e) { e.preventDefault(); setDragging(false) }
    async function onDropZone(e) { e.preventDefault(); setDragging(false); const f = e.dataTransfer?.files?.[0]; if (f) { setFile(f); setDropped(true); setTimeout(() => setDropped(false), 1500) } }

    async function convert() {
        if (!file) {
            setErrorMsg('Please select a Word document first.')
            return
        }
        
        setErrorMsg('')
        setSuccessMsg('')
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
            const { jsPDF } = await import('jspdf')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = 210
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(file.name.replace(/\.docx$/i, '') + '.pdf')
            document.body.removeChild(wrapper)
            setSuccessMsg('Successfully converted Word document to PDF and downloaded!')
        } catch (err) {
            console.error(err)
            setErrorMsg('Conversion failed: ' + err.message)
        } finally {
            setBusy(false)
        }
    }
    
    function handleReset() {
        setFile(null)
        setErrorMsg('')
        setSuccessMsg('')
    }

    return (
        <div>
            <h2>Word (.docx) → PDF</h2>
            <p className="muted">Convert Microsoft Word documents to PDF format.</p>
            
            {errorMsg && (
                <div className="error-message" role="alert">
                    ⚠️ {errorMsg}
                </div>
            )}
            
            {successMsg && (
                <div className="success-message" role="status">
                    ✅ {successMsg}
                </div>
            )}
            
            <div className={`dropzone ${dragging ? 'dragover' : ''}`} onDragEnter={onDragEnter} onDragOver={onDragOverZone} onDragLeave={onDragLeave} onDrop={onDropZone}>
                <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={loadFile} disabled={busy} />
                <div className="muted">Select or drag & drop a .docx file (max 20MB).</div>
                {dropped && <div className="drop-overlay">✓ Uploaded</div>}
            </div>
            
            {file && (
                <div className="file-info">
                    <strong>📄 File:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
            )}

            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                <button className="btn-primary" onClick={convert} disabled={busy || !file}>
                    {busy ? '⏳ Converting...' : '📥 Convert to PDF'}
                </button>
                <button className="btn-ghost" style={{ color: '#dc2626' }} onClick={handleReset} disabled={busy}>
                    Reset
                </button>
            </div>
        </div>
    )
}
