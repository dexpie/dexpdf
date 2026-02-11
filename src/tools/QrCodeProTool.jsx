'use client'
import React, { useState, useRef, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { QrCode, Download, Palette, Image as ImageIcon, Wifi as WifiIcon, Mail, Phone, MessageSquare, CreditCard, Link2, Type, Trash2, History, Settings2, Shapes, Share2, Bitcoin, Calendar as CalendarIcon, Smartphone } from 'lucide-react'

// Import only on client side to avoid SSR issues
// Import removed to avoid SSR issues
// const QRCodeStyling = typeof window !== 'undefined' ? require('qr-code-styling') : null

const INPUT_TYPES = [
    { id: 'url', label: 'URL', icon: Link2, placeholder: 'https://example.com' },
    { id: 'text', label: 'Text', icon: Type, placeholder: 'Enter any text...' },
    { id: 'wifi', label: 'WiFi', icon: WifiIcon, placeholder: '' },
    { id: 'email', label: 'Email', icon: Mail, placeholder: 'hello@example.com' },
    { id: 'phone', label: 'Phone', icon: Phone, placeholder: '+628123456789' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, placeholder: '+628123456789' },
    { id: 'crypto', label: 'Crypto', icon: Bitcoin, placeholder: '' },
    { id: 'vcard', label: 'vCard', icon: CreditCard, placeholder: '' },
]

const DOT_TYPES = ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded']
const CORNER_SQUARE_TYPES = ['square', 'dot', 'extra-rounded']
const CORNER_DOT_TYPES = ['square', 'dot']

export default function QrCodeProTool() {
    // Content State
    const [inputType, setInputType] = useState('url')
    const [value, setValue] = useState('')
    const [history, setHistory] = useState([])
    const [showHistory, setShowHistory] = useState(false)

    // WiFi
    const [wifiSSID, setWifiSSID] = useState('')
    const [wifiPassword, setWifiPassword] = useState('')
    const [wifiEncryption, setWifiEncryption] = useState('WPA')

    // Crypto
    const [cryptoAddr, setCryptoAddr] = useState('')
    const [cryptoType, setCryptoType] = useState('bitcoin')

    // WhatsApp
    const [waPhone, setWaPhone] = useState('')
    const [waMessage, setWaMessage] = useState('')

    // vCard
    const [vcardName, setVcardName] = useState('')
    const [vcardPhone, setVcardPhone] = useState('')
    const [vcardEmail, setVcardEmail] = useState('')
    const [vcardOrg, setVcardOrg] = useState('')

    // Style State
    const [size, setSize] = useState(300)
    const [fgColor, setFgColor] = useState('#000000')
    const [bgColor, setBgColor] = useState('#ffffff')
    const [gradientType, setGradientType] = useState('none') // none, linear, radial
    const [gradientColor2, setGradientColor2] = useState('#000000')

    const [dotOptions, setDotOptions] = useState({ type: 'square', color: '#000000' })
    const [cornerSquareOptions, setCornerSquareOptions] = useState({ type: 'square', color: '#000000' })
    const [cornerDotOptions, setCornerDotOptions] = useState({ type: 'square', color: '#000000' })

    const [logo, setLogo] = useState(null)
    const [logoSize, setLogoSize] = useState(0.4)
    const [logoMargin, setLogoMargin] = useState(10)

    const qrCode = useRef(null)
    const ref = useRef(null)
    const fileInputRef = useRef(null)

    // Sync colors when main fg changes (for simpler UX)
    useEffect(() => {
        setDotOptions(prev => ({ ...prev, color: fgColor }))
        if (gradientType === 'none') {
            setCornerSquareOptions(prev => ({ ...prev, color: fgColor }))
            setCornerDotOptions(prev => ({ ...prev, color: fgColor }))
        }
    }, [fgColor, gradientType])

    // Init QR Code Styling with Dynamic Import
    useEffect(() => {
        if (typeof window !== 'undefined' && !qrCode.current) {
            import('qr-code-styling').then((QRCodeStylingModule) => {
                const QRCodeStyling = QRCodeStylingModule.default || QRCodeStylingModule;
                qrCode.current = new QRCodeStyling({
                    width: size,
                    height: size,
                    image: logo,
                    dotsOptions: { color: fgColor, type: dotOptions.type },
                    backgroundOptions: { color: bgColor },
                    imageOptions: { crossOrigin: "anonymous", margin: logoMargin },
                    cornersSquareOptions: { type: cornerSquareOptions.type, color: cornerSquareOptions.color },
                    cornersDotOptions: { type: cornerDotOptions.type, color: cornerDotOptions.color }
                })
                if (ref.current) {
                    ref.current.innerHTML = '';
                    qrCode.current.append(ref.current);
                }
            }).catch(err => console.error("Failed to load qr-code-styling", err));
        }
    }, [])

    // Generate Content String
    const getQRContent = () => {
        switch (inputType) {
            case 'url':
            case 'text':
            case 'email':
            case 'phone':
                return inputType === 'email' ? `mailto:${value}` : inputType === 'phone' ? `tel:${value}` : value
            case 'wifi':
                return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`
            case 'whatsapp':
                return `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`
            case 'crypto':
                return `${cryptoType}:${cryptoAddr}`
            case 'vcard':
                return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardOrg}\nEND:VCARD`
            default:
                return value
        }
    }

    const qrContent = getQRContent()
    const hasContent = qrContent && qrContent !== 'WIFI:T:WPA;S:;P:;;' && qrContent !== 'BEGIN:VCARD\nVERSION:3.0\nN:\nFN:\nTEL:\nEMAIL:\nORG:\nEND:VCARD'

    // Update QR Code
    useEffect(() => {
        if (!qrCode.current) return

        qrCode.current.update({
            data: qrContent,
            width: size,
            height: size,
            image: logo,
            dotsOptions: {
                color: gradientType === 'none' ? fgColor : undefined,
                type: dotOptions.type,
                gradient: gradientType !== 'none' ? {
                    type: gradientType,
                    rotation: 0,
                    colorStops: [{ offset: 0, color: fgColor }, { offset: 1, color: gradientColor2 }]
                } : undefined
            },
            backgroundOptions: { color: bgColor },
            imageOptions: { imageSize: logoSize, margin: logoMargin },
            cornersSquareOptions: { type: cornerSquareOptions.type, color: gradientType === 'none' ? cornerSquareOptions.color : fgColor },
            cornersDotOptions: { type: cornerDotOptions.type, color: gradientType === 'none' ? cornerDotOptions.color : fgColor }
        })
    }, [qrContent, size, logo, logoSize, logoMargin, fgColor, bgColor, gradientType, gradientColor2, dotOptions.type, cornerSquareOptions.type, cornerSquareOptions.color, cornerDotOptions.type, cornerDotOptions.color])


    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (ev) => setLogo(ev.target?.result)
            reader.readAsDataURL(file)
        }
    }

    const download = (ext) => {
        if (!qrCode.current) return
        qrCode.current.download({ name: `qrcode-${Date.now()}`, extension: ext })

        // Add to history
        const entry = {
            id: Date.now(),
            type: inputType,
            value: qrContent.substring(0, 30),
            preview: ref.current?.querySelector('canvas')?.toDataURL()
        }
        setHistory(prev => [entry, ...prev.slice(0, 9)])
    }

    return (
        <ToolLayout title="QR Code Studio" description="Advanced QR Generator with Gradient, Shapes & Logos.">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Content & Style Inputs (Cols 1-7) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* 1. Content Type */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase mb-4 tracking-wider">1. Select Content</h3>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                {INPUT_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => { setInputType(type.id); setValue('') }}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${inputType === type.id
                                            ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-offset-2 ring-blue-600 dark:ring-blue-500 dark:ring-offset-slate-800'
                                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <type.icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Input Fields */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase mb-4 tracking-wider">2. Enter Data</h3>

                            {/* Standard Inputs */}
                            {['url', 'text', 'email', 'phone'].includes(inputType) && (
                                <input
                                    type={inputType === 'email' ? 'email' : 'text'}
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                    placeholder={INPUT_TYPES.find(t => t.id === inputType)?.placeholder}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-lg !text-black dark:!text-white placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                                />
                            )}

                            {/* WiFi */}
                            {inputType === 'wifi' && (
                                <div className="space-y-3">
                                    <input value={wifiSSID} onChange={e => setWifiSSID(e.target.value)} placeholder="SSID (Network Name)" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl !text-black dark:!text-white placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500" />
                                    <input type="password" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} placeholder="Password" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl !text-black dark:!text-white placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500" />
                                    <select value={wifiEncryption} onChange={e => setWifiEncryption(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl !text-black dark:!text-white focus:outline-none focus:ring-2 ring-blue-500">
                                        <option value="WPA">WPA/WPA2</option>
                                        <option value="WEP">WEP</option>
                                        <option value="nopass">No Password</option>
                                    </select>
                                </div>
                            )}

                            {/* WhatsApp */}
                            {inputType === 'whatsapp' && (
                                <div className="space-y-3">
                                    <input value={waPhone} onChange={e => setWaPhone(e.target.value)} placeholder="WhatsApp Number (e.g. 628123...)" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl !text-black dark:!text-white placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500" />
                                    <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)} placeholder="Pre-filled Message" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl !text-black dark:!text-white placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500 h-24 resize-none" />
                                </div>
                            )}

                            {/* Crypto */}
                            {inputType === 'crypto' && (
                                <div className="space-y-3">
                                    <select value={cryptoType} onChange={e => setCryptoType(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl !text-black dark:!text-white focus:outline-none focus:ring-2 ring-blue-500">
                                        <option value="bitcoin">Bitcoin (BTC)</option>
                                        <option value="ethereum">Ethereum (ETH)</option>
                                        <option value="solana">Solana (SOL)</option>
                                    </select>
                                    <input value={cryptoAddr} onChange={e => setCryptoAddr(e.target.value)} placeholder="Wallet Address" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl !text-black dark:!text-white placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500 font-mono text-sm" />
                                </div>
                            )}

                            {/* vCard */}
                            {inputType === 'vcard' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <input value={vcardName} onChange={e => setVcardName(e.target.value)} placeholder="Full Name" className="col-span-2 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl !text-black placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500" />
                                    <input value={vcardPhone} onChange={e => setVcardPhone(e.target.value)} placeholder="Phone" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl !text-black placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500" />
                                    <input value={vcardEmail} onChange={e => setVcardEmail(e.target.value)} placeholder="Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl !text-black placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500" />
                                    <input value={vcardOrg} onChange={e => setVcardOrg(e.target.value)} placeholder="Organization" className="col-span-2 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl !text-black placeholder:!text-slate-400 focus:outline-none focus:ring-2 ring-blue-500" />
                                </div>
                            )}
                        </div>

                        {/* 3. Customization */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase mb-6 tracking-wider flex items-center gap-2">
                                <Palette className="w-4 h-4" /> 3. Appearance
                            </h3>

                            {/* Color & Gradient */}
                            <div className="mb-8">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 block uppercase">Colors</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-slate-400">Foreground</span>
                                            <select
                                                value={gradientType}
                                                onChange={e => setGradientType(e.target.value)}
                                                className="text-xs bg-transparent font-bold !text-blue-600 outline-none cursor-pointer"
                                            >
                                                <option value="none">Solid</option>
                                                <option value="linear">Linear Gradient</option>
                                                <option value="radial">Radial Gradient</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative">
                                                <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="h-full w-full cursor-pointer p-0 border-0 opacity-0 relative z-10" style={{ backgroundColor: fgColor }} />
                                                <div className="absolute inset-0" style={{ backgroundColor: fgColor }} />
                                            </div>
                                            {gradientType !== 'none' && (
                                                <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative">
                                                    <input type="color" value={gradientColor2} onChange={e => setGradientColor2(e.target.value)} className="h-full w-full cursor-pointer p-0 border-0 opacity-0 relative z-10" style={{ backgroundColor: gradientColor2 }} />
                                                    <div className="absolute inset-0" style={{ backgroundColor: gradientColor2 }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-slate-400">Background</span>
                                        </div>
                                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative">
                                            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-full w-full cursor-pointer p-0 border-0 opacity-0 relative z-10" style={{ backgroundColor: bgColor }} />
                                            <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dot Styles */}
                            <div className="mb-8">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 block uppercase">Pattern Style</label>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    {DOT_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setDotOptions(prev => ({ ...prev, type }))}
                                            className={`p-2 rounded-lg text-xs font-semibold capitalize border transition-all ${dotOptions.type === type ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            {type.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Corner Styles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 block uppercase">Corner Square</label>
                                    <div className="flex gap-2">
                                        {CORNER_SQUARE_TYPES.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setCornerSquareOptions(prev => ({ ...prev, type }))}
                                                className={`flex-1 p-2 rounded-lg text-xs font-semibold capitalize border transition-all ${cornerSquareOptions.type === type ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                {type.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-3 block uppercase">Corner Dot</label>
                                    <div className="flex gap-2">
                                        {CORNER_DOT_TYPES.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setCornerDotOptions(prev => ({ ...prev, type }))}
                                                className={`flex-1 p-2 rounded-lg text-xs font-semibold capitalize border transition-all ${cornerDotOptions.type === type ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 block uppercase">Logo Overlay</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-12 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors text-slate-700 dark:text-slate-200"
                                    >
                                        <ImageIcon className="w-4 h-4" /> Upload Logo
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />

                                    {logo && (
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-lg border border-slate-200 p-1 bg-white relative group">
                                                <img src={logo} className="w-full h-full object-contain" />
                                                <button onClick={() => setLogo(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div>
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                                        <span>Size</span>
                                                        <span>{Math.round(logoSize * 100)}%</span>
                                                    </div>
                                                    <input type="range" min="0.1" max="0.5" step="0.05" value={logoSize} onChange={e => setLogoSize(Number(e.target.value))} className="w-full accent-blue-600 h-1 bg-slate-200 rounded-full appearance-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right: Preview & Download (Cols 8-12) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="sticky top-6">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50" />

                                <div className="relative z-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                    <div ref={ref} />
                                </div>

                                {!hasContent && (
                                    <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col text-slate-400">
                                        <QrCode className="w-16 h-16 mb-4 opacity-50" />
                                        <p className="font-bold">Enter content to generate</p>
                                    </div>
                                )}

                                <div className="relative z-10 mt-8 flex flex-col w-full gap-3 px-8">
                                    <button
                                        onClick={() => download('png')}
                                        disabled={!hasContent}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                                    >
                                        Download PNG
                                    </button>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => download('svg')}
                                            disabled={!hasContent}
                                            className="flex-1 py-3 bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-700 rounded-2xl font-bold transition-all disabled:opacity-50"
                                        >
                                            SVG
                                        </button>
                                        <button
                                            onClick={() => download('webp')}
                                            disabled={!hasContent}
                                            className="flex-1 py-3 bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-700 rounded-2xl font-bold transition-all disabled:opacity-50"
                                        >
                                            WEBP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </ToolLayout>
    )
}
