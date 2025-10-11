import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

function parseCSV(fileOrText) {
  return new Promise((resolve, reject) => {
    if (typeof fileOrText === 'string') {
      const res = Papa.parse(fileOrText.trim(), { header: false })
      resolve(res.data)
    } else {
      Papa.parse(fileOrText, {
        complete: (res) => resolve(res.data),
        error: (err) => reject(err),
      })
    }
  })
}

export default function CSVToPdfTool() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const previewRef = useRef(null)

  async function handleFile(e) {
    setError(null)
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const data = await parseCSV(f)
      setRows(data)
    } catch (err) {
      setError('Failed to parse CSV')
    }
  }

  async function handlePasteText() {
    try {
      const text = await navigator.clipboard.readText()
      const data = await parseCSV(text)
      setRows(data)
    } catch (err) {
      setError('Failed to parse pasted CSV')
    }
  }

  async function exportPdf() {
    if (!previewRef.current) return
    const node = previewRef.current
    const canvas = await html2canvas(node, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'pt', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('table.pdf')
  }

  return (
    <div className="tool-csv2pdf">
      <div className="tool-controls">
        <label className="btn">
          Upload CSV
          <input type="file" accept=".csv,text/csv" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        <button className="btn" onClick={handlePasteText}>Paste CSV from clipboard</button>
        <button className="btn" onClick={() => { setRows([]); setError(null) }}>Clear</button>
        <button className="btn primary" onClick={exportPdf} disabled={!rows || rows.length === 0}>Export to PDF</button>
      </div>

      {error && <div className="tool-error">{error}</div>}

      <div className="csv-preview" ref={previewRef}>
        <table>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
