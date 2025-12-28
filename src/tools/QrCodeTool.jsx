import React, { useState, useRef } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { QrCode, Download, Link as LinkIcon, Wifi, Type } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { triggerConfetti } from '../utils/confetti'

export default function QrCodeTool() {
    const [text, setText] = useState('https://dexpdf.com')
    const [color, setColor] = useState('#000000')
    const [bg, setBg] = useState('#ffffff')
    const [size, setSize] = useState(256)
    const [type, setType] = useState('url') // url, text, wifi
    const canvasRef = useRef(null)

    // WiFi State
    const [ssid, setSsid] = useState('')
    const [password, setPassword] = useState('')
    const [encryption, setEncryption] = useState('WPA')

    const getValue = () => {
        if (type === 'wifi') {
            return `WIFI:T:${encryption};S:${ssid};P:${password};;`
        }
        return text
    }

    const download = () => {
        const canvas = document.getElementById('qr-canvas')
        if (canvas) {
            const url = canvas.toDataURL('image/png')
            const a = document.createElement('a')
            a.href = url
            a.download = `qrcode_${Date.now()}.png`
            a.click()
            triggerConfetti()
        }
    }

    return (
        <ToolLayout title="QR Generator" description="Create custom QR codes for links, text, and WiFi.">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Controls */}
                <div className="flex-1 bg-white p-6 rounded-3xl shadow-lg border border-slate-100 space-y-6">
                    {/* Type Selector */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                        {['url', 'text', 'wifi'].map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${type === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t === 'url' && <LinkIcon className="inline w-3 h-3 mb-0.5 mr-1" />}
                                {t === 'text' && <Type className="inline w-3 h-3 mb-0.5 mr-1" />}
                                {t === 'wifi' && <Wifi className="inline w-3 h-3 mb-0.5 mr-1" />}
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        {type === 'wifi' ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Network Name (SSID)"
                                    value={ssid}
                                    onChange={e => setSsid(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                                <input
                                    type="text"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                                <select
                                    value={encryption}
                                    onChange={e => setEncryption(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                >
                                    <option value="WPA">WPA/WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">No Password</option>
                                </select>
                            </>
                        ) : (
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder={type === 'url' ? "https://example.com" : "Enter your text here..."}
                                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                            />
                        )}
                    </div>

                    {/* Styling */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Foreground</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer" />
                                <span className="text-xs font-mono">{color}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Background</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer" />
                                <span className="text-xs font-mono">{bg}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 rounded-3xl p-8 shadow-2xl space-y-8">
                    <div className="bg-white p-4 rounded-xl">
                        <QRCodeCanvas
                            id="qr-canvas"
                            value={getValue()}
                            size={size}
                            fgColor={color}
                            bgColor={bg}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>

                    <button
                        onClick={download}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" /> Download PNG
                    </button>
                </div>
            </div>
        </ToolLayout>
    )
}
