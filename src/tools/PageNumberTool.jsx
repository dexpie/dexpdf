import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { FileDigit, Download, LayoutTemplate, ArrowRight } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { triggerConfetti } from '../utils/confetti'
import { getOutputFilename } from '../utils/fileHelpers'
import classNames from 'classnames'

export default function PageNumberTool() {
    const [file, setFile] = useState(null)
    const [position, setPosition] = useState('bottom-center') // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    const [startFrom, setStartFrom] = useState(1)
    const [format, setFormat] = useState('1') // 1, 1 of n, Page 1
    const [isProcessing, setIsProcessing] = useState(false)

    const processFile = async () => {
        if (!file) return
        setIsProcessing(true)
        try {
            const arrayBuffer = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)
            const pages = pdfDoc.getPages()
            const totalPages = pages.length
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

            pages.forEach((page, idx) => {
                const pageNum = startFrom + idx
                let text = ''

                if (format === '1') text = `${pageNum}`
                else if (format === '1 of n') text = `${pageNum} of ${totalPages}`
                else if (format === 'Page 1') text = `Page ${pageNum}`

                const textSize = 12
                const textWidth = font.widthOfTextAtSize(text, textSize)
                const { width, height } = page.getSize()

                const margin = 20
                let x = 0
                let y = 0

                // Calculate Position
                if (position.includes('left')) x = margin
                else if (position.includes('center')) x = (width - textWidth) / 2
                else if (position.includes('right')) x = width - textWidth - margin

                if (position.includes('top')) y = height - margin - textSize
                else if (position.includes('bottom')) y = margin

                page.drawText(text, {
                    x,
                    y,
                    size: textSize,
                    font: font,
                    color: rgb(0, 0, 0),
                })
            })

            const pdfBytes = await pdfDoc.save()
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(file.name, '_numbered')
            a.click()
            triggerConfetti()

        } catch (err) {
            console.error(err)
            alert('Failed to add page numbers')
        } finally {
            setIsProcessing(false)
        }
    }

    const positions = [
        { id: 'top-left', label: 'TL' },
        { id: 'top-center', label: 'TC' },
        { id: 'top-right', label: 'TR' },
        { id: 'bottom-left', label: 'BL' },
        { id: 'bottom-center', label: 'BC' },
        { id: 'bottom-right', label: 'BR' },
    ]

    return (
        <ToolLayout title="Page Numbers" description="Add pagination to your PDF files.">
            <div className="max-w-4xl mx-auto">
                {!file ? (
                    <FileDropZone onFiles={files => setFile(files[0])} accept="application/pdf" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Settings */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 space-y-6">
                            <div>
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <LayoutTemplate className="w-5 h-5 text-blue-500" /> Represents Page
                                </h3>
                                {/* Visual Position Selector */}
                                <div className="aspect-[3/4] bg-slate-100 rounded-xl border-2 border-slate-200 relative p-4 max-w-[200px] mx-auto">
                                    {positions.map(pos => (
                                        <button
                                            key={pos.id}
                                            onClick={() => setPosition(pos.id)}
                                            className={classNames(
                                                "absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2",
                                                position === pos.id
                                                    ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-lg z-10"
                                                    : "bg-white border-slate-300 text-slate-400 hover:border-blue-400"
                                            )}
                                            style={{
                                                top: pos.id.includes('top') ? '10px' : 'auto',
                                                bottom: pos.id.includes('bottom') ? '10px' : 'auto',
                                                left: pos.id.includes('left') ? '10px' : pos.id.includes('center') ? '50%' : 'auto',
                                                right: pos.id.includes('right') ? '10px' : 'auto',
                                                transform: pos.id.includes('center') ? 'translateX(-50%)' : 'none'
                                            }}
                                        >
                                            {pos.label}
                                        </button>
                                    ))}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                                        <FileDigit className="w-20 h-20" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Start From</label>
                                    <input
                                        type="number"
                                        value={startFrom}
                                        onChange={e => setStartFrom(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Style</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['1', '1 of n', 'Page 1'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setFormat(f)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium border ${format === f ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview & Action */}
                        <div className="flex flex-col justify-center space-y-6">
                            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{file.name}</h3>
                                <p className="text-slate-500">Ready to number pages</p>
                            </div>

                            <button
                                onClick={processFile}
                                disabled={isProcessing}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                {isProcessing ? 'Processing...' : <><Download className="w-5 h-5" /> Add Page Numbers</>}
                            </button>

                            <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 font-bold text-sm">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
