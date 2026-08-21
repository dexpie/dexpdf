import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { Sliders, Download, Copy } from 'lucide-react'

export default function ImageFilterTool() {
    const [image, setImage] = useState(null)
    const [filters, setFilters] = useState({
        blur: 0,
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        hueRotate: 0,
        invert: 0,
        opacity: 100,
        saturate: 100,
        sepia: 0
    })

    const filterString = `blur(${filters.blur}px) brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) hue-rotate(${filters.hueRotate}deg) invert(${filters.invert}%) opacity(${filters.opacity}%) saturate(${filters.saturate}%) sepia(${filters.sepia}%)`

    const reset = () => {
        setFilters({
            blur: 0, brightness: 100, contrast: 100, grayscale: 0,
            hueRotate: 0, invert: 0, opacity: 100, saturate: 100, sepia: 0
        })
    }

    return (
        <ToolLayout title="CSS Filters" description="Apply CSS filters to images and generate code.">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

                <div className="flex-1 space-y-4">
                    {!image ? (
                        <FileDropZone onFiles={files => setImage(URL.createObjectURL(files[0]))} accept="image/*" hint="Upload to experiment" />
                    ) : (
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700 group">
                            <img
                                src={image}
                                className="max-w-full mx-auto"
                                style={{ filter: filterString }}
                                alt="Preview"
                            />
                            <button onClick={() => setImage(null)} className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-red-500">×</button>
                        </div>
                    )}

                    <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between">
                        <code className="text-green-400 text-xs font-mono break-all mr-4">{`filter: ${filterString};`}</code>
                        <button onClick={() => navigator.clipboard.writeText(`filter: ${filterString};`)} className="text-muted-foreground hover:text-white"><Copy className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="w-full lg:w-80 bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-col gap-4 h-fit">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2"><Sliders className="w-4 h-4 text-purple-500" /> Adjustments</h3>
                        <button onClick={reset} className="text-xs font-bold text-red-500 hover:underline">Reset</button>
                    </div>

                    <FilterSlider label="Blur (px)" value={filters.blur} max={20} onChange={v => setFilters({ ...filters, blur: v })} />
                    <FilterSlider label="Brightness (%)" value={filters.brightness} max={200} onChange={v => setFilters({ ...filters, brightness: v })} />
                    <FilterSlider label="Contrast (%)" value={filters.contrast} max={200} onChange={v => setFilters({ ...filters, contrast: v })} />
                    <FilterSlider label="Grayscale (%)" value={filters.grayscale} max={100} onChange={v => setFilters({ ...filters, grayscale: v })} />
                    <FilterSlider label="Hue Rotate (deg)" value={filters.hueRotate} max={360} onChange={v => setFilters({ ...filters, hueRotate: v })} />
                    <FilterSlider label="Invert (%)" value={filters.invert} max={100} onChange={v => setFilters({ ...filters, invert: v })} />
                    <FilterSlider label="Opacity (%)" value={filters.opacity} max={100} onChange={v => setFilters({ ...filters, opacity: v })} />
                    <FilterSlider label="Saturate (%)" value={filters.saturate} max={200} onChange={v => setFilters({ ...filters, saturate: v })} />
                    <FilterSlider label="Sepia (%)" value={filters.sepia} max={100} onChange={v => setFilters({ ...filters, sepia: v })} />
                </div>

            </div>
        </ToolLayout>
    )
}

function FilterSlider({ label, value, min = 0, max, onChange }) {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                <span>{label}</span>
                <span>{value}</span>
            </div>
            <input
                type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
        </div>
    )
}
