import React, { useState } from 'react'
import mammoth from 'mammoth'
import html2canvas from 'html2canvas'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
// jsPDF will be dynamically imported during conversion to avoid bundling it in the main chunk

export default function WordToPdfTool() {
    const [batchMode, setBatchMode] = useState(false)
    const [file, setFile] = useState(null)
    const [busy, setBusy] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [dropped, setDropped] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [outputFileName, setOutputFileName] = useState('')

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
        setOutputFileName(getDefaultFilename(f))
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
            pdf.save(getOutputFilename(outputFileName, file.name.replace(/\.docx$/i, '')))
            document.body.removeChild(wrapper)
            setSuccessMsg('Successfully converted Word document to PDF and downloaded!')
        } catch (err) {
            console.error(err)
            setErrorMsg('Conversion failed: ' + err.message)
        } finally {
            setBusy(false)
        }
    }

    async function processBatchFile(f, onProgress) {
        try {
            onProgress(10)
            const arrayBuffer = await f.arrayBuffer()
            onProgress(30)
            const result = await mammoth.convertToHtml({ arrayBuffer })
            const html = result.value
            onProgress(50)

            const wrapper = document.createElement('div')
            wrapper.innerHTML = html
            wrapper.style.padding = '20px'
            wrapper.style.position = 'absolute'
            wrapper.style.left = '-9999px'
            document.body.appendChild(wrapper)

            onProgress(60)
            const canvas = await html2canvas(wrapper, { scale: 2 })
            const imgData = canvas.toDataURL('image/png')

            onProgress(70)
            const { jsPDF } = await import('jspdf')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = 210
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

            onProgress(90)
            const blob = pdf.output('blob')
            document.body.removeChild(wrapper)
            onProgress(100)
            return blob
        } catch (err) {
            throw new Error(`Failed to convert Word to PDF: ${err.message || err}`)
        }
    }

    function handleReset() {
        setFile(null)
        setErrorMsg('')
        setSuccessMsg('')
        setBatchMode(false)
    }

    return (
        <div>
            <h2>Word (.docx) → PDF</h2>
            <p className="muted">Convert Microsoft Word documents to PDF format.</p>

            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
                <button
                    onClick={() => setBatchMode(false)}
                    disabled={busy}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !batchMode ? 'var(--primary)' : 'transparent',
                        color: !batchMode ? 'white' : 'var(--text)',
                        border: !batchMode ? 'none' : '1px solid var(--border)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: !batchMode ? 'bold' : 'normal'
                    }}
                >
                    📄 Single File
                </button>
                <button
                    onClick={() => setBatchMode(true)}
                    disabled={busy}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: batchMode ? 'var(--primary)' : 'transparent',
                        color: batchMode ? 'white' : 'var(--text)',
                        border: batchMode ? 'none' : '1px solid var(--border)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: batchMode ? 'bold' : 'normal'
                    }}
                >
                    📚 Batch Process
                </button>
            </div>

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

            {batchMode ? (
                <div>
                    <p style={{ marginBottom: 16, padding: 12, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 4 }}>
                        <strong>Batch Mode:</strong> Convert multiple Word (.docx) documents to PDF format simultaneously.
                    </p>

                    <UniversalBatchProcessor
                        processFile={processBatchFile}
                        outputFilenameSuffix=""
                        acceptedFileTypes=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        description="Convert multiple Word documents to PDF"
                        outputFileExtension=".pdf"
                    />
                </div>
            ) : (
                <div>
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

                    {file && (
                        <FilenameInput
                            value={outputFileName}
                            onChange={(e) => setOutputFileName(e.target.value)}
                            disabled={busy}
                            placeholder="output"
                        />
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
            )}
        </div>
    )
}
