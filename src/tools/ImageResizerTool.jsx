import React, { useState, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { ArrowRight, Download, Image as ImageIcon } from 'lucide-react'

export default function ImageResizerTool() {
    const [image, setImage] = useState(null)
    const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 })
    const [targetSize, setTargetSize] = useState({ w: 0, h: 0 })
    const [keepRatio, setKeepRatio] = useState(true)
    const canvasRef = useRef(null)

    const handleFile = (files) => {
        if (!files[0]) return
        const img = new Image()
        img.src = URL.createObjectURL(files[0])
        img.onload = () => {
            setOriginalSize({ w: img.width, h: img.height })
            setTargetSize({ w: img.width, h: img.height })
            setImage(img)
        }
    }

    const handleResize = (dim, val) => {
        const newSize = { ...targetSize, [dim]: val }
        if (keepRatio && originalSize.w > 0) {
            const ratio = originalSize.w / originalSize.h
            if (dim === 'w') newSize.h = Math.round(val / ratio)
            if (dim === 'h') newSize.w = Math.round(val * ratio)
        }
        setTargetSize(newSize)
    }

    const download = () => {
        if (!image || !canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        canvasRef.current.width = targetSize.w
        canvasRef.current.height = targetSize.h
        ctx.drawImage(image, 0, 0, targetSize.w, targetSize.h)
        const url = canvasRef.current.toDataURL('image/png')

        const link = document.createElement('a')
        link.download = `resized-${targetSize.w}x${targetSize.h}.png`
        link.href = url
        link.click()
    }

    return (
        <ToolLayout title="Image Resizer" description="Resize images quickly without uploading to server.">
            <div className="max-w-4xl mx-auto space-y-8">

                {!image ? (
                    <FileDropZone onFiles={handleFile} accept="image/*" hint="Upload image to resize" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-card p-6 rounded-3xl shadow flex flex-col items-center">
                            <h3 className="font-bold text-muted-foreground mb-4">Preview</h3>
                            <img src={image.src} className="max-w-full max-h-64 object-contain rounded" alt="Original" />
                            <p className="mt-2 text-xs text-muted-foreground font-bold">{originalSize.w} x {originalSize.h}</p>
                            <button onClick={() => setImage(null)} className="mt-4 text-red-500 text-sm font-bold hover:underline">Remove</button>
                        </div>

                        <div className="bg-card p-6 rounded-3xl shadow space-y-6">
                            <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-500" /> Resize Options
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Width</label>
                                    <input
                                        type="number" value={targetSize.w} onChange={e => handleResize('w', Number(e.target.value))}
                                        className="w-full p-3 bg-secondary rounded-xl font-bold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Height</label>
                                    <input
                                        type="number" value={targetSize.h} onChange={e => handleResize('h', Number(e.target.value))}
                                        className="w-full p-3 bg-secondary rounded-xl font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox" checked={keepRatio} onChange={e => setKeepRatio(e.target.checked)}
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label className="text-sm font-bold text-slate-600">Maintain Aspect Ratio</label>
                            </div>

                            <button
                                onClick={download}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-2"
                            >
                                <Download className="w-5 h-5" /> Download Resized
                            </button>
                        </div>
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

            </div>
        </ToolLayout>
    )
}
