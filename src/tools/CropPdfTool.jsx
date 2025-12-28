import React, { useState, useRef, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { Crop, Save, RotateCcw, Image as ImageIcon } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '../utils/pdfWorker'
import { getOutputFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'

configurePdfWorker()

export default function CropPdfTool() {
    const [file, setFile] = useState(null)
    const [pageIndex, setPageIndex] = useState(1)
    const [numPages, setNumPages] = useState(0)
    const [scale, setScale] = useState(1)
    const [cropRect, setCropRect] = useState(null) // { x, y, width, height } in percentage (0-1)
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({ x: 0, y: 0 })

    const handleFileChange = async (files) => {
        const f = files[0]
        if (!f) return
        setFile(f)
        try {
            const ab = await f.arrayBuffer()
            const pdf = await pdfjsLib.getDocument(ab).promise
            setNumPages(pdf.numPages)
            setPageIndex(1)
        } catch (e) {
            console.error(e)
        }
    }

    // Render Page
    useEffect(() => {
        if (!file) return

        let cancelled = false
        const render = async () => {
            const ab = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument(ab).promise
            const page = await pdf.getPage(pageIndex)
            const viewport = page.getViewport({ scale: 1.5 })

            if (cancelled) return

            const canvas = canvasRef.current
            if (!canvas) return

            canvas.width = viewport.width
            canvas.height = viewport.height
            const ctx = canvas.getContext('2d')
            await page.render({ canvasContext: ctx, viewport }).promise

            // Reset crop rect to full page initially
            if (!cropRect) {
                setCropRect({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })
            }
        }
        render()
        return () => { cancelled = true }
    }, [file, pageIndex])

    // Simple Drag Logic for Crop Box
    // NOTE: For a real world app, use a robust library like 'react-rnd' or 'react-image-crop'.
    // Here we implement a basic centered resizable box or just a draggable box for MVP.
    // I will implement a simplifed "Click and Drag" to define new crop rect.

    const handleMouseDown = (e) => {
        if (!file) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        setStartPos({ x, y })
        setIsDragging(true)
        setCropRect({ x, y, width: 0, height: 0 })
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return
        const rect = containerRef.current.getBoundingClientRect()
        const currentX = (e.clientX - rect.left) / rect.width
        const currentY = (e.clientY - rect.top) / rect.height

        const width = currentX - startPos.x
        const height = currentY - startPos.y

        setCropRect({
            x: width > 0 ? startPos.x : currentX,
            y: height > 0 ? startPos.y : currentY,
            width: Math.abs(width),
            height: Math.abs(height)
        })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const applyCrop = async () => {
        if (!file || !cropRect) return

        try {
            const ab = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(ab)
            const pages = pdfDoc.getPages()
            const page = pages[pageIndex - 1]

            const { width, height } = page.getSize()

            // Calculate PDF coordinates
            // CropRect is 0-1 relative to view.
            // PDF: 0,0 is bottom-left? or top-left depending on usage. 
            // setCropBox uses PDF coords (bottom-left origin usually in pdf-lib?)

            // Actually pdf-lib setCropBox(x, y, width, height)

            const x = cropRect.x * width
            const y = (1 - (cropRect.y + cropRect.height)) * height // Invert Y
            const w = cropRect.width * width
            const h = cropRect.height * height

            page.setCropBox(x, y, w, h)
            page.setMediaBox(x, y, w, h)

            const pdfBytes = await pdfDoc.save()

            // Download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = getOutputFilename(file.name, '_cropped')
            a.click()
            triggerConfetti()

        } catch (e) {
            console.error(e)
            alert('Crop failed')
        }
    }

    return (
        <ToolLayout title="Crop PDF" description="Select an area to crop your PDF pages.">
            <div className="max-w-5xl mx-auto flex flex-col items-center">
                {!file ? (
                    <FileDropZone onFiles={handleFileChange} accept="application/pdf" />
                ) : (
                    <div className="w-full space-y-6">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4">
                                <h3 className="font-bold">{file.name}</h3>
                                <span className="text-sm bg-slate-100 px-2 py-1 rounded">Page {pageIndex} of {numPages}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setFile(null)} className="px-4 py-2 hover:bg-slate-100 rounded-lg font-bold text-slate-500">Cancel</button>
                                <button onClick={applyCrop} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800">
                                    <Crop className="w-4 h-4" /> Export Cropped PDF
                                </button>
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="flex justify-center bg-slate-100 p-8 rounded-3xl border-2 border-slate-300 border-dashed overflow-hidden select-none">
                            <div
                                className="relative shadow-2xl"
                                ref={containerRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <canvas ref={canvasRef} className="block max-w-full" style={{ maxHeight: '70vh' }} />

                                {/* Overlay & Crop Box */}
                                {cropRect && (
                                    <>
                                        {/* Darken surrounding */}
                                        <div className="absolute inset-0 bg-black/50 pointer-events-none">
                                            {/* Cutout (rendering logic tricky with simple divs, so we just show the box on top) */}
                                            {/* Actually, simple approach: just the box with border */}
                                        </div>

                                        <div
                                            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move"
                                            style={{
                                                left: `${cropRect.x * 100}%`,
                                                top: `${cropRect.y * 100}%`,
                                                width: `${cropRect.width * 100}%`,
                                                height: `${cropRect.height * 100}%`
                                            }}
                                        >
                                            {/* Corners */}
                                            <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-slate-800" />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-slate-800" />
                                            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-slate-800" />
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-slate-800" />

                                            {/* Grid Lines */}
                                            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                                            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                                            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                                            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                                        </div>
                                    </>
                                )}

                                <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
                                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md">
                                        Click and drag to select crop area
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
