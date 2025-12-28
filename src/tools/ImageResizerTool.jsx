import React, { useState, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { Image as ImageIcon, Download, Maximize, Lock, Unlock } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function ImageResizerTool() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [aspectRatio, setAspectRatio] = useState(1)
    const [lockAspect, setLockAspect] = useState(true)
    const [quality, setQuality] = useState(0.9)
    const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 })

    const handleFile = (files) => {
        const f = files[0]
        if (!f) return
        setFile(f)
        const url = URL.createObjectURL(f)
        setPreview(url)

        const img = new Image()
        img.onload = () => {
            setWidth(img.width)
            setHeight(img.height)
            setOriginalSize({ w: img.width, h: img.height })
            setAspectRatio(img.width / img.height)
        }
        img.src = url
    }

    const handleWidthChange = (val) => {
        if (!val) { setWidth(''); return }
        const w = parseInt(val)
        setWidth(w)
        if (lockAspect) setHeight(Math.round(w / aspectRatio))
    }

    const handleHeightChange = (val) => {
        if (!val) { setHeight(''); return }
        const h = parseInt(val)
        setHeight(h)
        if (lockAspect) setWidth(Math.round(h * aspectRatio))
    }

    const processImage = () => {
        if (!file || !width || !height) return

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.onload = () => {
            // Better resizing quality
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `resized_${width}x${height}_${file.name}`
                a.click()
                triggerConfetti()
            }, file.type, quality)
        }
        img.src = preview
    }

    return (
        <ToolLayout title="Image Resizer" description="Resize images to exact dimensions.">
            <div className="max-w-4xl mx-auto">
                {!file ? (
                    <FileDropZone onFiles={handleFile} accept="image/*" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-100 p-4 rounded-3xl flex items-center justify-center border border-slate-200">
                            <img src={preview} className="max-w-full max-h-[400px] object-contain shadow-lg rounded-lg" />
                        </div>

                        <div className="space-y-6 bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg">Dimensions</h3>
                                <button
                                    onClick={() => setLockAspect(!lockAspect)}
                                    className={`p-2 rounded-lg ${lockAspect ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
                                >
                                    {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Width (px)</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={e => handleWidthChange(e.target.value)}
                                        className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Height (px)</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={e => handleHeightChange(e.target.value)}
                                        className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                                    />
                                </div>
                            </div>

                            {originalSize.w > 0 && (
                                <p className="text-xs text-slate-400 text-center">
                                    Original: {originalSize.w} x {originalSize.h}
                                </p>
                            )}

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                                    <span>Quality</span>
                                    <span>{Math.round(quality * 100)}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.1" max="1" step="0.1"
                                    value={quality}
                                    onChange={e => setQuality(parseFloat(e.target.value))}
                                    className="w-full mt-2 accent-blue-600"
                                />
                            </div>

                            <button
                                onClick={processImage}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" /> Download Resized
                            </button>

                            <button onClick={() => setFile(null)} className="w-full py-2 text-slate-400 hover:text-red-500 text-sm font-bold">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
