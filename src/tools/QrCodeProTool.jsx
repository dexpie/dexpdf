'use client'
import React, { useState, useRef, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { QrCode, Download, Palette, Image, Wifi, Mail, Phone, MessageSquare, CreditCard, Link2, Type, Trash2, History, Settings2 } from 'lucide-react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

const INPUT_TYPES = [
    { id: 'url', label: 'URL', icon: Link2, placeholder: 'https://example.com' },
    { id: 'text', label: 'Text', icon: Type, placeholder: 'Enter any text...' },
    { id: 'wifi', label: 'WiFi', icon: Wifi, placeholder: '' },
    { id: 'email', label: 'Email', icon: Mail, placeholder: 'hello@example.com' },
    { id: 'phone', label: 'Phone', icon: Phone, placeholder: '+628123456789' },
    { id: 'sms', label: 'SMS', icon: MessageSquare, placeholder: '+628123456789' },
    { id: 'vcard', label: 'vCard', icon: CreditCard, placeholder: '' },
]

const ERROR_LEVELS = ['L', 'M', 'Q', 'H']
const PRESETS = [
    { name: 'Classic', fg: '#000000', bg: '#FFFFFF' },
    { name: 'Ocean', fg: '#0077B6', bg: '#CAF0F8' },
    { name: 'Forest', fg: '#2D6A4F', bg: '#D8F3DC' },
    { name: 'Sunset', fg: '#E63946', bg: '#FFF1E6' },
    { name: 'Purple', fg: '#7B2CBF', bg: '#F3E8FF' },
    { name: 'Dark Mode', fg: '#FFFFFF', bg: '#1E1E1E' },
]

export default function QrCodeProTool() {
    const [inputType, setInputType] = useState('url')
    const [value, setValue] = useState('')
    const [size, setSize] = useState(256)
    const [fgColor, setFgColor] = useState('#000000')
    const [bgColor, setBgColor] = useState('#FFFFFF')
    const [errorLevel, setErrorLevel] = useState('M')
    const [logo, setLogo] = useState(null)
    const [logoSize, setLogoSize] = useState(50)
    const [history, setHistory] = useState([])
    const [showHistory, setShowHistory] = useState(false)

    // WiFi specific
    const [wifiSSID, setWifiSSID] = useState('')
    const [wifiPassword, setWifiPassword] = useState('')
    const [wifiEncryption, setWifiEncryption] = useState('WPA')

    // vCard specific
    const [vcardName, setVcardName] = useState('')
    const [vcardPhone, setVcardPhone] = useState('')
    const [vcardEmail, setVcardEmail] = useState('')
    const [vcardOrg, setVcardOrg] = useState('')

    // SMS specific
    const [smsMessage, setSmsMessage] = useState('')

    const canvasRef = useRef(null)
    const fileInputRef = useRef(null)

    // Generate QR value based on input type
    const getQRValue = () => {
        switch (inputType) {
            case 'url':
            case 'text':
                return value
            case 'wifi':
                return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`
            case 'email':
                return `mailto:${value}`
            case 'phone':
                return `tel:${value}`
            case 'sms':
                return `sms:${value}${smsMessage ? `?body=${encodeURIComponent(smsMessage)}` : ''}`
            case 'vcard':
                return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardOrg}\nEND:VCARD`
            default:
                return value
        }
    }

    const qrValue = getQRValue()
    const hasValue = qrValue.length > 0 && qrValue !== 'WIFI:T:WPA;S:;P:;;' && qrValue !== 'BEGIN:VCARD\nVERSION:3.0\nN:\nFN:\nTEL:\nEMAIL:\nORG:\nEND:VCARD'

    // Handle logo upload
    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (ev) => setLogo(ev.target?.result)
            reader.readAsDataURL(file)
        }
    }

    // Download PNG
    const downloadPNG = () => {
        const canvas = document.querySelector('#qr-canvas canvas')
        if (!canvas) return

        const link = document.createElement('a')
        link.download = `qrcode-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

        // Add to history
        addToHistory()
    }

    // Download SVG
    const downloadSVG = () => {
        const svg = document.querySelector('#qr-svg svg')
        if (!svg) return

        const serializer = new XMLSerializer()
        const svgString = serializer.serializeToString(svg)
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const link = document.createElement('a')
        link.download = `qrcode-${Date.now()}.svg`
        link.href = URL.createObjectURL(blob)
        link.click()

        addToHistory()
    }

    // Add to history
    const addToHistory = () => {
        const entry = {
            id: Date.now(),
            type: inputType,
            value: qrValue.substring(0, 50),
            fgColor,
            bgColor,
            timestamp: new Date().toLocaleString()
        }
        setHistory(prev => [entry, ...prev.slice(0, 9)])
    }

    // Apply preset
    const applyPreset = (preset) => {
        setFgColor(preset.fg)
        setBgColor(preset.bg)
    }

    return (
        <ToolLayout title="QR Code Generator Pro" description="Create stunning QR codes with full customization.">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Controls */}
                    <div className="space-y-6">

                        {/* Input Type Selector */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Content Type</h3>
                            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                {INPUT_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => { setInputType(type.id); setValue('') }}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${inputType === type.id
                                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        <type.icon className="w-5 h-5" />
                                        <span className="text-xs font-bold">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Input Fields */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Content</h3>

                            {['url', 'text', 'email', 'phone'].includes(inputType) && (
                                <input
                                    type={inputType === 'email' ? 'email' : inputType === 'phone' ? 'tel' : 'text'}
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                    placeholder={INPUT_TYPES.find(t => t.id === inputType)?.placeholder}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 ring-blue-500"
                                />
                            )}

                            {inputType === 'sms' && (
                                <div className="space-y-3">
                                    <input
                                        type="tel"
                                        value={value}
                                        onChange={e => setValue(e.target.value)}
                                        placeholder="Phone number"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ring-blue-500"
                                    />
                                    <textarea
                                        value={smsMessage}
                                        onChange={e => setSmsMessage(e.target.value)}
                                        placeholder="Message (optional)"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ring-blue-500 h-24 resize-none"
                                    />
                                </div>
                            )}

                            {inputType === 'wifi' && (
                                <div className="space-y-3">
                                    <input
                                        value={wifiSSID}
                                        onChange={e => setWifiSSID(e.target.value)}
                                        placeholder="Network Name (SSID)"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ring-blue-500"
                                    />
                                    <input
                                        type="password"
                                        value={wifiPassword}
                                        onChange={e => setWifiPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ring-blue-500"
                                    />
                                    <select
                                        value={wifiEncryption}
                                        onChange={e => setWifiEncryption(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ring-blue-500"
                                    >
                                        <option value="WPA">WPA/WPA2</option>
                                        <option value="WEP">WEP</option>
                                        <option value="nopass">No Password</option>
                                    </select>
                                </div>
                            )}

                            {inputType === 'vcard' && (
                                <div className="space-y-3">
                                    <input value={vcardName} onChange={e => setVcardName(e.target.value)} placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ring-blue-500" />
                                    <input value={vcardPhone} onChange={e => setVcardPhone(e.target.value)} placeholder="Phone" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ring-blue-500" />
                                    <input value={vcardEmail} onChange={e => setVcardEmail(e.target.value)} placeholder="Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ring-blue-500" />
                                    <input value={vcardOrg} onChange={e => setVcardOrg(e.target.value)} placeholder="Organization" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ring-blue-500" />
                                </div>
                            )}
                        </div>

                        {/* Customization */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Customize
                            </h3>

                            {/* Color Presets */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {PRESETS.map(preset => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyPreset(preset)}
                                        className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all hover:scale-105"
                                        style={{ backgroundColor: preset.bg, color: preset.fg, borderColor: preset.fg }}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">Foreground</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                                        <input type="text" value={fgColor} onChange={e => setFgColor(e.target.value)} className="flex-1 p-2 bg-slate-50 rounded-lg text-sm font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">Background</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                                        <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 p-2 bg-slate-50 rounded-lg text-sm font-mono" />
                                    </div>
                                </div>
                            </div>

                            {/* Size & Error Correction */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">Size: {size}px</label>
                                    <input type="range" min="128" max="512" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full accent-blue-600" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">Error Correction</label>
                                    <div className="flex gap-1">
                                        {ERROR_LEVELS.map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => setErrorLevel(lvl)}
                                                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${errorLevel === lvl ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-2">Center Logo</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <Image className="w-4 h-4" /> Upload Logo
                                    </button>
                                    {logo && (
                                        <>
                                            <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover border" />
                                            <button onClick={() => setLogo(null)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <input type="range" min="30" max="80" value={logoSize} onChange={e => setLogoSize(Number(e.target.value))} className="w-24 accent-blue-600" title={`Logo size: ${logoSize}px`} />
                                        </>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview & Download */}
                    <div className="space-y-6">

                        {/* QR Preview */}
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-6">Preview</h3>

                            {hasValue ? (
                                <div className="relative p-4 rounded-2xl" style={{ backgroundColor: bgColor }}>
                                    {/* Hidden canvas for PNG download */}
                                    <div id="qr-canvas" className="hidden">
                                        <QRCodeCanvas
                                            value={qrValue}
                                            size={size}
                                            fgColor={fgColor}
                                            bgColor={bgColor}
                                            level={errorLevel}
                                            imageSettings={logo ? { src: logo, height: logoSize, width: logoSize, excavate: true } : undefined}
                                        />
                                    </div>

                                    {/* Visible SVG for display */}
                                    <div id="qr-svg">
                                        <QRCodeSVG
                                            value={qrValue}
                                            size={size}
                                            fgColor={fgColor}
                                            bgColor={bgColor}
                                            level={errorLevel}
                                            imageSettings={logo ? { src: logo, height: logoSize, width: logoSize, excavate: true } : undefined}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-64 h-64 bg-slate-100 rounded-2xl flex items-center justify-center">
                                    <div className="text-center text-slate-400">
                                        <QrCode className="w-16 h-16 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-medium">Enter content to generate QR</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Download Buttons */}
                        {hasValue && (
                            <div className="flex gap-4">
                                <button
                                    onClick={downloadPNG}
                                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <Download className="w-5 h-5" /> Download PNG
                                </button>
                                <button
                                    onClick={downloadSVG}
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <Download className="w-5 h-5" /> Download SVG
                                </button>
                            </div>
                        )}

                        {/* History */}
                        {history.length > 0 && (
                            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="w-full flex items-center justify-between text-sm font-bold text-slate-500 uppercase"
                                >
                                    <span className="flex items-center gap-2"><History className="w-4 h-4" /> Recent ({history.length})</span>
                                    <span>{showHistory ? '▲' : '▼'}</span>
                                </button>

                                {showHistory && (
                                    <div className="mt-4 space-y-2">
                                        {history.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm">
                                                <div className="w-6 h-6 rounded" style={{ backgroundColor: item.fgColor }} />
                                                <div className="flex-1 truncate font-mono text-slate-600">{item.value}...</div>
                                                <span className="text-xs text-slate-400">{item.type.toUpperCase()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
