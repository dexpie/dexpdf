import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Monitor, Cpu, Smartphone, Layers, Maximize } from 'lucide-react'

export default function DeviceInfoTool() {
    const [info, setInfo] = useState(null)

    useEffect(() => {
        const getInfo = () => {
            setInfo({
                screen: {
                    width: window.screen.width,
                    height: window.screen.height,
                    availWidth: window.screen.availWidth,
                    availHeight: window.screen.availHeight,
                    colorDepth: window.screen.colorDepth,
                    pixelDepth: window.screen.pixelDepth,
                    orientation: window.screen.orientation ? window.screen.orientation.type : 'N/A'
                },
                window: {
                    innerWidth: window.innerWidth,
                    innerHeight: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio
                },
                hardware: {
                    concurrency: navigator.hardwareConcurrency || 'N/A',
                    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'N/A',
                    touchPoints: navigator.maxTouchPoints || 0,
                    platform: navigator.platform,
                    language: navigator.language
                }
            })
        }

        getInfo()
        window.addEventListener('resize', getInfo)
        return () => window.removeEventListener('resize', getInfo)
    }, [])

    if (!info) return null

    return (
        <ToolLayout title="Device Information" description="Detailed specs about your screen and hardware.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Screen Info */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Screen Display</h3>
                    </div>
                    <div className="space-y-4">
                        <InfoRow label="Resolution" value={`${info.screen.width} x ${info.screen.height}`} />
                        <InfoRow label="Available Space" value={`${info.screen.availWidth} x ${info.screen.availHeight}`} />
                        <InfoRow label="Color Depth" value={`${info.screen.colorDepth}-bit`} />
                        <InfoRow label="Pixel Ratio" value={`${info.window.devicePixelRatio}x`} />
                        <InfoRow label="Orientation" value={info.screen.orientation} />
                    </div>
                </div>

                {/* Window Info */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Maximize className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Viewport / Window</h3>
                    </div>
                    <div className="space-y-4">
                        <InfoRow label="Inner Width" value={`${info.window.innerWidth}px`} />
                        <InfoRow label="Inner Height" value={`${info.window.innerHeight}px`} />
                        <div className="p-4 bg-slate-50 rounded-xl mt-4 text-center">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Current Size</div>
                            <div className="text-2xl font-black text-slate-700">
                                {info.window.innerWidth} <span className="text-slate-400">x</span> {info.window.innerHeight}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hardware Info */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Hardware & System</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">CPU Cores</div>
                            <div className="text-3xl font-black text-slate-800">{info.hardware.concurrency}</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">RAM (Approx)</div>
                            <div className="text-3xl font-black text-slate-800">{info.hardware.memory}</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Touch Points</div>
                            <div className="text-3xl font-black text-slate-800">{info.hardware.touchPoints}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <InfoRow label="Platform" value={info.hardware.platform} />
                        <InfoRow label="Language" value={info.hardware.language} />
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-slate-500 font-medium text-sm">{label}</span>
            <span className="font-bold text-slate-800 text-right">{value}</span>
        </div>
    )
}
