import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import UAParser from 'ua-parser-js'
import { Monitor, Smartphone, Globe, Cpu, RefreshCw, Copy } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function UserAgentParserTool() {
    const [uaString, setUaString] = useState('')
    const [info, setInfo] = useState(null)

    useEffect(() => {
        // Default to current browser
        if (typeof window !== 'undefined') {
            const current = window.navigator.userAgent
            setUaString(current)
            parse(current)
        }
    }, [])

    const parse = (ua) => {
        const parser = new UAParser(ua)
        setInfo(parser.getResult())
    }

    const handleInputChange = (e) => {
        const val = e.target.value
        setUaString(val)
        parse(val)
    }

    const reset = () => {
        const current = window.navigator.userAgent
        setUaString(current)
        parse(current)
        triggerConfetti()
    }

    const copy = () => {
        navigator.clipboard.writeText(JSON.stringify(info, null, 2))
        alert('JSON copied!')
    }

    if (!info) return null

    return (
        <ToolLayout title="User Agent Parser" description="Analyze browser, engine, OS, and device info.">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
                {/* Input */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                    <label className="text-sm font-bold text-slate-500 uppercase mb-2 block">User Agent String</label>
                    <div className="flex gap-4">
                        <textarea
                            value={uaString}
                            onChange={handleInputChange}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm h-24 resize-none outline-none focus:ring-2 ring-blue-500"
                        />
                        <button onClick={reset} className="flex flex-col items-center justify-center gap-2 px-6 bg-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-200 hover:text-blue-600 transition-colors">
                            <RefreshCw className="w-6 h-6" />
                            <span className="text-xs">Analyz My Browser</span>
                        </button>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Browser */}
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4">
                            <Globe className="w-8 h-8" />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase mb-1">Browser</h3>
                        <div className="text-2xl font-bold text-slate-800">{info.browser.name || 'Unknown'}</div>
                        <div className="text-blue-500 font-bold">{info.browser.version || '-'}</div>
                    </div>

                    {/* OS */}
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center">
                        <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4">
                            <Monitor className="w-8 h-8" />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase mb-1">Operating System</h3>
                        <div className="text-2xl font-bold text-slate-800">{info.os.name || 'Unknown'}</div>
                        <div className="text-green-500 font-bold">{info.os.version || '-'}</div>
                    </div>

                    {/* Device */}
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center">
                        <div className="p-4 bg-purple-100 text-purple-600 rounded-full mb-4">
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase mb-1">Device</h3>
                        <div className="text-2xl font-bold text-slate-800">{info.device.vendor || 'PC / Mac'}</div>
                        <div className="text-purple-500 font-bold">{info.device.model || (info.os.name === 'Windows' ? 'Desktop' : 'Unknown')}</div>
                    </div>

                    {/* CPU/Engine */}
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center">
                        <div className="p-4 bg-orange-100 text-orange-600 rounded-full mb-4">
                            <Cpu className="w-8 h-8" />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase mb-1">Engine</h3>
                        <div className="text-2xl font-bold text-slate-800">{info.engine.name || 'Unknown'}</div>
                        <div className="text-orange-500 font-bold">{info.cpu.architecture || info.engine.version}</div>
                    </div>
                </div>

                {/* JSON View */}
                <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
                    <pre className="text-green-400 font-mono text-sm overflow-auto max-h-64">
                        {JSON.stringify(info, null, 2)}
                    </pre>
                    <button onClick={copy} className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                        <Copy className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </ToolLayout>
    )
}
