import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import CryptoJS from 'crypto-js'
import { Lock, Copy, RefreshCw } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

export default function HashGeneratorTool() {
    const [input, setInput] = useState('')

    // We calculate hashes on the fly
    const md5 = CryptoJS.MD5(input).toString()
    const sha1 = CryptoJS.SHA1(input).toString()
    const sha256 = CryptoJS.SHA256(input).toString()
    const sha512 = CryptoJS.SHA512(input).toString()

    const copy = (txt) => {
        navigator.clipboard.writeText(txt)
        triggerConfetti()
    }

    return (
        <ToolLayout title="Hash Generator" description="Generate MD5, SHA-1, SHA-256 for text.">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Input */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                    <label className="text-sm font-bold text-slate-500 uppercase mb-2 block">Input Text</label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type something to hash..."
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg resize-none outline-none focus:ring-2 ring-blue-500"
                    />
                </div>

                {/* Hashes */}
                <div className="space-y-4">
                    <HashRow label="MD5" val={md5} copy={copy} color="blue" />
                    <HashRow label="SHA-1" val={sha1} copy={copy} color="purple" />
                    <HashRow label="SHA-256" val={sha256} copy={copy} color="green" />
                    <HashRow label="SHA-512" val={sha512} copy={copy} color="orange" />
                </div>
            </div>
        </ToolLayout>
    )
}

function HashRow({ label, val, copy, color }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
    }

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4 group hover:shadow-md transition-shadow">
            <div className={`w-24 py-2 rounded-lg text-center font-bold text-sm ${colors[color]}`}>
                {label}
            </div>
            <div className="flex-1 font-mono text-sm text-slate-600 break-all">
                {val}
            </div>
            <button onClick={() => copy(val)} className="p-2 text-slate-300 hover:text-blue-500">
                <Copy className="w-5 h-5" />
            </button>
        </div>
    )
}
