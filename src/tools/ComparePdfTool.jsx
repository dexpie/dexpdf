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
        const checkPages = async () => {
            if (fileA && fileB) {
                const [pdfA, pdfB] = await Promise.all([
                    fileA.arrayBuffer().then(data => pdfjsLib.getDocument(data).promise),
                    fileB.arrayBuffer().then(data => pdfjsLib.getDocument(data).promise)
                ])
                setNumPages(Math.min(pdfA.numPages, pdfB.numPages))
                setPageIndex(current => Math.min(current, Math.min(pdfA.numPages, pdfB.numPages)))
            } else {
                setNumPages(0)
                setPageIndex(1)
            }
        }
        checkPages()
    }, [fileA, fileB])

    return (
        <ToolLayout title="Visual PDF Compare" description="Overlay or view matching pages side by side.">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Upload Section */}
                {(!fileA || !fileB) && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-center text-foreground">Document A (Base)</h3>
                            {!fileA ? (
                                <FileDropZone onFiles={files => setFileA(files[0])} accept="application/pdf" className="h-48" />
                            ) : (
                                <div className="bg-secondary p-4 rounded-xl border border-border flex justify-between items-center">
                                    <span className="truncate flex-1 font-medium">{fileA.name}</span>
                                    <button onClick={() => setFileA(null)} className="text-red-500 p-2 hover:bg-destructive/10 rounded-lg"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-center text-foreground">Document B (New)</h3>
                            {!fileB ? (
                                <FileDropZone onFiles={files => setFileB(files[0])} accept="application/pdf" className="h-48" />
                            ) : (
                                <div className="bg-secondary p-4 rounded-xl border border-border flex justify-between items-center">
                                    <span className="truncate flex-1 font-medium">{fileB.name}</span>
                                    <button onClick={() => setFileB(null)} className="text-red-500 p-2 hover:bg-destructive/10 rounded-lg"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Controls */}
                {fileA && fileB && (
                    <div className="sticky top-4 z-40 bg-card p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-border flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 bg-secondary p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('overlay')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'overlay' ? 'bg-card shadow-sm text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Layers className="w-4 h-4" /> Overlay
                            </button>
                            <button
                                onClick={() => setViewMode('side-by-side')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'side-by-side' ? 'bg-card shadow-sm text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Layout className="w-4 h-4" /> Side by Side
                            </button>
                        </div>

                        {viewMode === 'overlay' && (
                            <div className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-xl">
                                <span className="text-xs font-bold text-muted-foreground">Opacity</span>
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

                        <div className="flex items-center gap-4 bg-secondary p-1 rounded-xl">
                            <button
                                onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                                disabled={pageIndex <= 1}
                                className="p-2 hover:bg-card rounded-lg disabled:opacity-50 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span className="font-mono text-sm font-bold w-20 text-center">
                                {pageIndex} / {numPages || '?'}
                            </span>
                            <button
                                onClick={() => setPageIndex(p => p + 1)} // Allow going beyond A's count? No, stick to safer bounds or allow check.
                                disabled={pageIndex >= numPages && numPages > 0}
                                className="p-2 hover:bg-card rounded-lg disabled:opacity-50 transition-all"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <button onClick={() => { setFileA(null); setFileB(null) }} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Viewer */}
                {fileA && fileB && (
                    <div className="bg-secondary/50 rounded-3xl p-8 min-h-[600px] flex justify-center overflow-auto border border-dashed border-[rgba(243,239,228,0.16)]">
                        {viewMode === 'overlay' ? (
                            <div className="relative shadow-2xl bg-card">
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
                                    <span className="text-center text-sm font-bold text-muted-foreground">Document A</span>
                                    <div className="shadow-xl bg-card border-2 border-transparent">
                                        <PdfPageCanvas file={fileA} pageIndex={pageIndex} scale={1.0} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-center text-sm font-bold text-muted-foreground">Document B</span>
                                    <div className="shadow-xl bg-card border-2 border-blue-500">
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
