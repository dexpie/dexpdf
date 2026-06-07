import React, { useState, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { Pipette, Copy, Image as ImageIcon } from 'lucide-react'

export default function ImageColorPickerTool() {
    const [image, setImage] = useState(null)
    const [color, setColor] = useState({ hex: '#ffffff', r: 255, g: 255, b: 255 })
    const canvasRef = useRef(null)

    const handleFile = (files) => {
        if (files[0]) {
            const url = URL.createObjectURL(files[0])
            setImage(url)
        }
    }

    const handleMouseMove = (e) => {
        if (!canvasRef.current || !image) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()
        const x = (e.clientX - rect.left) * (canvas.width / rect.width)
        const y = (e.clientY - rect.top) * (canvas.height / rect.height)

        const px = ctx.getImageData(x, y, 1, 1).data
        const hex = "#" + [px[0], px[1], px[2]].map(x => x.toString(16).padStart(2, '0')).join('')

        setColor({ hex, r: px[0], g: px[1], b: px[2] })
    }

    const handleImageLoad = (e) => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const img = e.target

        // Resize canvas to match image aspect ratio but fit container
        // Simple approach: draw image to canvas native size, scale via CSS
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
    }

    return (
        <ToolLayout title="Image Color Picker" description="Extract colors from any image.">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Image Area */}
                <div className="flex-1">
                    {!image ? (
                        <FileDropZone onFiles={handleFile} accept="image/*" hint="Upload image to pick colors" />
                    ) : (
                        <div className="bg-card p-4 rounded-3xl shadow-lg border border-border overflow-hidden relative group">
                            <canvas
                                ref={canvasRef}
                                className="w-full h-auto rounded-xl cursor-crosshair shadow-inner"
                                onMouseMove={handleMouseMove}
                            />
                            <img
                                src={image}
                                alt="Source"
                                onLoad={handleImageLoad}
                                className="hidden"
                            />

                            <button
                                onClick={() => setImage(null)}
                                className="absolute top-6 right-6 p-2 bg-card/90 backdrop-blur text-slate-600 rounded-full shadow-lg hover:text-red-500 transition-colors"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Color Display */}
                <div className="w-full md:w-80 flex flex-col gap-4">
                    <div
                        className="h-40 rounded-3xl shadow-xl border-4 border-white flex flex-col justify-center items-center text-white transition-colors"
                        style={{ backgroundColor: color.hex }}
                    >
                        <Pipette className="w-8 h-8 mb-2 drop-shadow-md" />
                        <div className="font-mono font-black text-2xl drop-shadow-md uppercase">{color.hex}</div>
                    </div>

                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-muted-foreground">HEX</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono bg-secondary px-2 py-1 rounded text-foreground uppercase">{color.hex}</span>
                                <button onClick={() => navigator.clipboard.writeText(color.hex)} className="text-blue-500"><Copy className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-muted-foreground">RGB</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono bg-secondary px-2 py-1 rounded text-foreground">{color.r}, {color.g}, {color.b}</span>
                                <button onClick={() => navigator.clipboard.writeText(`rgb(${color.r}, ${color.g}, ${color.b})`)} className="text-blue-500"><Copy className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-700 text-sm font-bold border border-blue-100 text-center">
                        Hover over the image to pick colors instantly.
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}
