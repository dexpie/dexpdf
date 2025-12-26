import React, { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import DraggableElement from './DraggableElement'

// Ensure worker is configured (can move to a shared init check)
// This might need to be consistent with OcrTool's config
try {
    // Use the specific version installed to match package.json
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
    }
} catch (e) { console.warn('Worker init warn', e) }

export default function EditorCanvas({
    file,
    pageIndex = 1,
    elements = [],
    onUpdateElement,
    onSelectElement,
    onDeleteElement,
    selectedElementId
}) {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const [viewport, setViewport] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    // Load and render PDF page
    useEffect(() => {
        if (!file) return
        let cancelled = false

        async function renderPage() {
            try {
                setLoading(true)
                setError(null)

                const arrayBuffer = await file.arrayBuffer()
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise

                if (cancelled) return

                // pdf.js pages are 1-indexed
                const page = await pdf.getPage(pageIndex)
                // Scale 1.5 for better visual quality on screen, or 1.0 for true size?
                // Let's use 1.0 logic first, but render high-res canvas.
                // PDF points are usually 72 DPI. Screens are higher.
                // We'll calculate a scale that fits the container (responsive) or just standard.
                // For simplicity: Render at scale 1.5, display at CSS width.
                const scale = 1.5
                const v = page.getViewport({ scale })
                setViewport(v)
                setDimensions({ width: v.width, height: v.height })

                const canvas = canvasRef.current
                if (!canvas) return

                canvas.width = v.width
                canvas.height = v.height

                const ctx = canvas.getContext('2d')
                await page.render({ canvasContext: ctx, viewport: v }).promise

            } catch (err) {
                console.error("Render error", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        renderPage()
        return () => { cancelled = true }
    }, [file, pageIndex])

    // Handle updates from Draggable
    const handleElementUpdate = (id, pos) => {
        onUpdateElement(id, { x: pos.x, y: pos.y })
    }

    // Handle Drop on Canvas (for adding new items at click position - optional future)
    const handleCanvasClick = (e) => {
        // Check if clicking on empty space to deselect
        if (e.target === canvasRef.current || e.target === containerRef.current) {
            onSelectElement(null)
        }
    }

    return (
        <div
            ref={containerRef}
            className="relative shadow-lg border border-gray-200 mx-auto bg-white overflow-hidden transition-all duration-300"
            style={{
                width: dimensions.width || '100%',
                height: dimensions.height || 400,
                maxWidth: '100%'
            }}
            onClick={handleCanvasClick}
        >
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <div className="text-sm font-medium text-slate-600">Rendering PDF...</div>
                    </div>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-50">
                    <div className="text-red-500 font-medium">Error: {error}</div>
                </div>
            )}

            {/* PDF Layer */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
            />

            {/* Interactive Layer */}
            {/* We map elements. x/y are in pixels relative to THIS container's dimensions at 1.5 scale */}
            {viewport && elements.map(el => (
                <DraggableElement
                    key={el.id}
                    element={el}
                    isSelected={el.id === selectedElementId}
                    onSelect={onSelectElement}
                    onUpdate={handleElementUpdate}
                    onDelete={onDeleteElement}
                // If we want scaling relative to current view vs rendered view, passing scale 1 is fine if x/y match dimensions
                />
            ))}
        </div>
    )
}
