import React, { useState, useRef, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { Download, Type } from 'lucide-react'

export default function MemeGeneratorTool() {
    const [image, setImage] = useState(null)
    const [topText, setTopText] = useState('TOP TEXT')
    const [bottomText, setBottomText] = useState('BOTTOM TEXT')
    const canvasRef = useRef(null)

    const handleFile = (files) => {
        const img = new Image()
        img.src = URL.createObjectURL(files[0])
        img.onload = () => setImage(img)
    }

    useEffect(() => {
        if (!image || !canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        canvas.width = image.width
        canvas.height = image.height

        ctx.drawImage(image, 0, 0)

        ctx.font = `bold ${image.width / 10}px Impact`
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = image.width / 100
        ctx.textAlign = 'center'

        // Top
        ctx.textBaseline = 'top'
        ctx.strokeText(topText, image.width / 2, image.height * 0.05)
        ctx.fillText(topText, image.width / 2, image.height * 0.05)

        // Bottom
        ctx.textBaseline = 'bottom'
        ctx.strokeText(bottomText, image.width / 2, image.height * 0.95)
        ctx.fillText(bottomText, image.width / 2, image.height * 0.95)

    }, [image, topText, bottomText])

    return (
        <ToolLayout title="Meme Generator" description="Add classic top/bottom text to any image.">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

                <div className="flex-1 bg-slate-900/5 min-h-[400px] rounded-3xl flex items-center justify-center overflow-hidden border-2 border-dashed border-[rgba(243,239,228,0.16)]">
                    {!image ? (
                        <div className="p-8 w-full"><FileDropZone onFiles={handleFile} accept="image/*" hint="Upload meme template" /></div>
                    ) : (
                        <canvas ref={canvasRef} className="max-w-full max-h-[600px] shadow-xl" />
                    )}
                </div>

                {image && (
                    <div className="w-full md:w-80 bg-card p-6 rounded-3xl shadow-lg border border-border space-y-4 h-fit">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Top Text</label>
                            <input value={topText} onChange={e => setTopText(e.target.value.toUpperCase())} className="w-full p-3 bg-secondary font-bold border border-border rounded-xl" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Bottom Text</label>
                            <input value={bottomText} onChange={e => setBottomText(e.target.value.toUpperCase())} className="w-full p-3 bg-secondary font-bold border border-border rounded-xl" />
                        </div>

                        <button
                            onClick={() => {
                                const link = document.createElement('a')
                                link.download = 'meme.png'
                                link.href = canvasRef.current.toDataURL()
                                link.click()
                            }}
                            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg active:scale-95 transition-all flex justify-center gap-2"
                        >
                            <Download className="w-5 h-5" /> Download Meme
                        </button>
                        <button onClick={() => setImage(null)} className="w-full py-2 text-muted-foreground text-xs font-bold hover:text-red-500">Pick New Image</button>
                    </div>
                )}

            </div>
        </ToolLayout>
    )
}
