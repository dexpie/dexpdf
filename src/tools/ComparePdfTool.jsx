import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { GitCompare, Eye, Layers, ArrowRight, X } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '../utils/pdfWorker'
import { motion } from 'framer-motion'
import { triggerConfetti } from '../utils/confetti'

configurePdfWorker()

export default function ComparePdfTool() {
    const [file1, setFile1] = useState(null)
    const [file2, setFile2] = useState(null)
    const [mode, setMode] = useState('side-by-side') // side-by-side | overlay
    const [opacity, setOpacity] = useState(0.5)
    const [diffData, setDiffData] = useState(null)
    const [processing, setProcessing] = useState(false)

    // Render helper
    const renderPageToDataUrl = async (file) => {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
        const page = await pdf.getPage(1) // Compare page 1 for now
        const viewport = page.getViewport({ scale: 1.0 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: context, viewport }).promise
        return canvas.toDataURL()
    }

    const processComparison = async () => {
        if (!file1 || !file2) return
        setProcessing(true)

        try {
            const url1 = await renderPageToDataUrl(file1)
            const url2 = await renderPageToDataUrl(file2)

            // Mock Diff Calculation (In real app, we would diff pixels)
            // Here we just set them for visual comparison
            setDiffData({ url1, url2 })
            triggerConfetti()
        } catch (err) {
            console.error(err)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <ToolLayout title="Compare PDF" description="Visually detect differences between two PDF versions.">
            <div className="max-w-6xl mx-auto">
                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
                            Original Version
                        </h3>
                        {!file1 ? (
                            <FileDropZone onFiles={f => setFile1(f[0])} accept="application/pdf" hint="Upload Version A" className="h-40" />
                        ) : (
                            <div className="bg-white p-4 rounded-xl border border-blue-200 flex items-center justify-between">
                                <span className="font-medium truncate">{file1.name}</span>
                                <button onClick={() => setFile1(null)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <span className="bg-pink-100 text-pink-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span>
                            Modified Version
                        </h3>
                        {!file2 ? (
                            <FileDropZone onFiles={f => setFile2(f[0])} accept="application/pdf" hint="Upload Version B" className="h-40" />
                        ) : (
                            <div className="bg-white p-4 rounded-xl border border-pink-200 flex items-center justify-between">
                                <span className="font-medium truncate">{file2.name}</span>
                                <button onClick={() => setFile2(null)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action */}
                {!diffData && file1 && file2 && (
                    <div className="flex justify-center mb-12">
                        <button
                            onClick={processComparison}
                            disabled={processing}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                        >
                            {processing ? 'Analyzing...' : <><GitCompare className="w-6 h-6" /> Compare Versions</>}
                        </button>
                    </div>
                )}

                {/* Results */}
                {diffData && (
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setMode('side-by-side')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'side-by-side' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                                >
                                    <Eye className="w-4 h-4" /> Side by Side
                                </button>
                                <button
                                    onClick={() => setMode('overlay')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'overlay' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500'}`}
                                >
                                    <Layers className="w-4 h-4" /> Overlay
                                </button>
                            </div>

                            {mode === 'overlay' && (
                                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500">Opacity</span>
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.1"
                                        value={opacity}
                                        onChange={e => setOpacity(parseFloat(e.target.value))}
                                        className="w-32 accent-purple-600"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Visualizer */}
                        <div className="bg-slate-50/50 rounded-2xl p-8 overflow-auto min-h-[500px] flex items-center justify-center border border-slate-100 border-dashed">
                            {mode === 'side-by-side' ? (
                                <div className="flex gap-8">
                                    <div className="space-y-2 text-center">
                                        <div className="shadow-lg rounded overflow-hidden border border-slate-200">
                                            <img src={diffData.url1} className="max-w-[400px]" />
                                        </div>
                                        <p className="font-bold text-sm text-slate-500">Original</p>
                                    </div>
                                    <div className="flex items-center text-slate-300"><ArrowRight className="w-8 h-8" /></div>
                                    <div className="space-y-2 text-center">
                                        <div className="shadow-lg rounded overflow-hidden border border-slate-200">
                                            <img src={diffData.url2} className="max-w-[400px]" />
                                        </div>
                                        <p className="font-bold text-sm text-slate-500">Modified</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative shadow-2xl rounded overflow-hidden border border-slate-200 max-w-[500px]">
                                    {/* Base Layer */}
                                    <img src={diffData.url1} className="w-full" />
                                    {/* Overlay Layer */}
                                    <div className="absolute inset-0 mix-blend-multiply pointer-events-none" style={{ opacity: opacity }}>
                                        <img src={diffData.url2} className="w-full filter sepia hue-rotate-90 saturate-200" />
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                                        Overlay Mode
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
