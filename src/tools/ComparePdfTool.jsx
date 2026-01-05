'use client'
import React, { useState, useEffect, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { GitCompare, Eye, EyeOff, Layout, Layers, ArrowLeft, ArrowRight, X } from 'lucide-react' // Using standard icons if GitCompare not avail, but it should be.
import { configurePdfWorker } from '../utils/pdfWorker'

configurePdfWorker()

// Render Page Component
const PdfPageCanvas = ({ file, pageIndex, scale = 1.0, className }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const render = async () => {
            if (!file || !canvasRef.current) return
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
            if (pageIndex > pdf.numPages) return
            const page = await pdf.getPage(pageIndex)
            const viewport = page.getViewport({ scale })

            const canvas = canvasRef.current
            canvas.width = viewport.width
            canvas.height = viewport.height

            const ctx = canvas.getContext('2d')
            await page.render({ canvasContext: ctx, viewport }).promise
        }
        render()
    }, [file, pageIndex, scale])

    return <canvas ref={canvasRef} className={className} />
}

export default function ComparePdfTool() {
    const [fileA, setFileA] = useState(null)
    const [fileB, setFileB] = useState(null)
    const [viewMode, setViewMode] = useState('overlay') // 'side-by-side' | 'overlay'
    const [pageIndex, setPageIndex] = useState(1)
    const [numPages, setNumPages] = useState(0)
    const [opacity, setOpacity] = useState(0.5)

    useEffect(() => {
        // Determine common page count
        const checkPages = async () => {
            if (fileA) {
                const ab = await fileA.arrayBuffer()
                const pdf = await pdfjsLib.getDocument(ab).promise
                setNumPages(pdf.numPages)
            }
        }
        checkPages()
    }, [fileA])

    return (
        <ToolLayout title="Compare PDF" description="Visually compare two PDF documents to spot differences.">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Upload Section */}
                {(!fileA || !fileB) && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-center text-slate-700">Document A (Base)</h3>
                            {!fileA ? (
                                <FileDropZone onFiles={files => setFileA(files[0])} accept="application/pdf" className="h-48" />
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                    <span className="truncate flex-1 font-medium">{fileA.name}</span>
                                    <button onClick={() => setFileA(null)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-center text-slate-700">Document B (New)</h3>
                            {!fileB ? (
                                <FileDropZone onFiles={files => setFileB(files[0])} accept="application/pdf" className="h-48" />
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                    <span className="truncate flex-1 font-medium">{fileB.name}</span>
                                    <button onClick={() => setFileB(null)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Controls */}
                {fileA && fileB && (
                    <div className="sticky top-4 z-40 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('overlay')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'overlay' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Layers className="w-4 h-4" /> Overlay
                            </button>
                            <button
                                onClick={() => setViewMode('side-by-side')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'side-by-side' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Layout className="w-4 h-4" /> Side by Side
                            </button>
                        </div>

                        {viewMode === 'overlay' && (
                            <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl">
                                <span className="text-xs font-bold text-slate-500">Opacity</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={opacity}
                                    onChange={e => setOpacity(parseFloat(e.target.value))}
                                    className="w-32 accent-blue-600"
                                />
                                <span className="text-xs w-8">{Math.round(opacity * 100)}%</span>
                            </div>
                        )}

                        <div className="flex items-center gap-4 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                                disabled={pageIndex <= 1}
                                className="p-2 hover:bg-white rounded-lg disabled:opacity-50 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span className="font-mono text-sm font-bold w-20 text-center">
                                {pageIndex} / {numPages || '?'}
                            </span>
                            <button
                                onClick={() => setPageIndex(p => p + 1)} // Allow going beyond A's count? No, stick to safer bounds or allow check.
                                disabled={pageIndex >= numPages && numPages > 0}
                                className="p-2 hover:bg-white rounded-lg disabled:opacity-50 transition-all"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <button onClick={() => { setFileA(null); setFileB(null) }} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Viewer */}
                {fileA && fileB && (
                    <div className="bg-slate-200/50 rounded-3xl p-8 min-h-[600px] flex justify-center overflow-auto border border-dashed border-slate-300">
                        {viewMode === 'overlay' ? (
                            <div className="relative shadow-2xl bg-white">
                                {/* Base Layer */}
                                <PdfPageCanvas file={fileA} pageIndex={pageIndex} scale={1.2} className="block" />

                                {/* Overlay Layer - Difference Blend Mode for visual diff */}
                                <div
                                    className="absolute inset-0 pointer-events-none mix-blend-difference"
                                    style={{ opacity: opacity }} // Diff mode works best at 100% opacity usually, but standard overlay needs opacity. 
                                // Actually for diffing:
                                // Classic diff: exclude/difference blend mode.
                                // Let's rely on standard opacity overlay for general comparison, 
                                // OR add a toggle for 'Difference Mode'.
                                // For now, standard opacity is intuitive. Difference is "pro".
                                // Let's force mix-blend-difference only if opacity is specific? No.
                                // For a 'Compare' tool, 'difference' blend mode is the killer feature.
                                // Let's apply it if the user wants? Or just simple Overlay.
                                // Simple opacity is safer for "seeing both".
                                // Difference highlights changes.
                                // Let's do simple opacity by default.
                                >
                                    <PdfPageCanvas file={fileB} pageIndex={pageIndex} scale={1.2} className="" />
                                </div>

                                {/* Difference Toggle Hint */}
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">
                                    Tip: Use Overlay to see shifts
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-8 justify-center items-start">
                                <div className="flex flex-col gap-2">
                                    <span className="text-center text-sm font-bold text-slate-500">Document A</span>
                                    <div className="shadow-xl bg-white border-2 border-transparent">
                                        <PdfPageCanvas file={fileA} pageIndex={pageIndex} scale={1.0} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-center text-sm font-bold text-slate-500">Document B</span>
                                    <div className="shadow-xl bg-white border-2 border-blue-500">
                                        <PdfPageCanvas file={fileB} pageIndex={pageIndex} scale={1.0} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
