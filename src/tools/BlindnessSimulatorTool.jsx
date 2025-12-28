import React, { useState, useRef, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { Eye, EyeOff } from 'lucide-react'

// Color matrix for blindness types
const FILTERS = {
    normal: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    protanopia: [0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0],
    deuteranopia: [0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0],
    tritanopia: [0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0],
    achromatopsia: [0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0]
}

export default function BlindnessSimulatorTool() {
    const [image, setImage] = useState(null)
    const [type, setType] = useState('normal')

    // Since we need to apply filters, doing it via SVG filter is most performant and easiest
    return (
        <ToolLayout title="Blindness Simulator" description="See the world through colorblind eyes.">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">

                {/* Toolbar */}
                <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 flex flex-wrap justify-center gap-2">
                    {Object.keys(FILTERS).map(k => (
                        <button
                            key={k}
                            onClick={() => setType(k)}
                            className={`px-4 py-2 rounded-xl font-bold capitalize transition-all ${type === k ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {k}
                        </button>
                    ))}
                </div>

                {/* SVG Filter Definition */}
                <svg className="w-0 h-0 absolute">
                    <defs>
                        <filter id="colorblind-filter">
                            <feColorMatrix type="matrix" values={FILTERS[type].join(' ')} />
                        </filter>
                    </defs>
                </svg>

                {/* Viewport */}
                <div className="flex-1 bg-slate-900/5 rounded-3xl min-h-[500px] flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative">
                    {!image ? (
                        <div className="w-full h-full p-8">
                            <FileDropZone onFiles={files => setImage(URL.createObjectURL(files[0]))} accept="image/*" hint="Upload design to test" />
                        </div>
                    ) : (
                        <div className={`relative transition-all duration-500`}>
                            <img
                                src={image}
                                alt="Simulation"
                                style={{ filter: `url(#colorblind-filter)` }}
                                className="max-w-full max-h-[70vh] rounded-xl shadow-2xl"
                            />
                            <button
                                onClick={() => setImage(null)}
                                className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full text-slate-600 hover:text-red-500 shadow-lg"
                            >
                                <EyeOff className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-center text-slate-400 text-sm">
                    {type === 'normal' ? 'Standard Vision' :
                        type === 'protanopia' ? 'Red-Blindness (Protanopia)' :
                            type === 'deuteranopia' ? 'Green-Blindness (Deuteranopia)' :
                                type === 'tritanopia' ? 'Blue-Blindness (Tritanopia)' : 'Monochromacy (Achromatopsia)'}
                </div>

            </div>
        </ToolLayout>
    )
}
