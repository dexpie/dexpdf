import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Activity, Signal, Globe } from 'lucide-react'

const TARGETS = [
    { name: 'Google (US)', url: 'https://www.google.com' },
    { name: 'Cloudflare (Global)', url: 'https://www.cloudflare.com' },
    { name: 'Amazon (US)', url: 'https://www.amazon.com' },
    { name: 'Baidu (CN)', url: 'https://www.baidu.com' },
    { name: 'BBC (UK)', url: 'https://www.bbc.co.uk' },
]

export default function LatencyTesterTool() {
    const [results, setResults] = useState({})
    const [testing, setTesting] = useState(false)

    const runTest = async () => {
        setTesting(true)
        setResults({})

        for (const target of TARGETS) {
            setResults(prev => ({ ...prev, [target.name]: 'Running...' }))

            const start = performance.now()
            try {
                // We use no-cors to allow fetching opaque resources just for timing
                await fetch(target.url, { mode: 'no-cors', cache: 'no-store' })
                const end = performance.now()
                const latency = Math.round(end - start)
                setResults(prev => ({ ...prev, [target.name]: latency }))
            } catch (e) {
                setResults(prev => ({ ...prev, [target.name]: 'Error' }))
            }
        }
        setTesting(false)
    }

    return (
        <ToolLayout title="Latency Tester" description="Measure HTTP latency to global servers.">
            <div className="max-w-2xl mx-auto flex flex-col gap-8">
                <button
                    onClick={runTest}
                    disabled={testing}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2"
                >
                    <Activity className={`w-6 h-6 ${testing ? 'animate-spin' : ''}`} />
                    {testing ? 'Testing...' : 'Start Latency Test'}
                </button>

                <div className="grid gap-4">
                    {TARGETS.map(target => (
                        <div key={target.name} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-700">{target.name}</span>
                            </div>

                            <div className="font-mono font-bold">
                                {results[target.name] === undefined ? (
                                    <span className="text-slate-300">-</span>
                                ) : results[target.name] === 'Running...' ? (
                                    <span className="text-blue-500 animate-pulse">Pinging...</span>
                                ) : results[target.name] === 'Error' ? (
                                    <span className="text-red-500">Failed</span>
                                ) : (
                                    <span className={`
                                        ${results[target.name] < 100 ? 'text-green-500' : ''}
                                        ${results[target.name] >= 100 && results[target.name] < 300 ? 'text-orange-500' : ''}
                                        ${results[target.name] >= 300 ? 'text-red-500' : ''}
                                    `}>
                                        {results[target.name]}ms
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center text-xs text-slate-400 max-w-sm mx-auto">
                    * Measures Time-To-First-Byte (TTFB) + Transfer for opaque responses. accuracy depends on network conditions.
                </div>
            </div>
        </ToolLayout>
    )
}
