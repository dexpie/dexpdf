import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { KeyRound, RefreshCw, Copy, List } from 'lucide-react'

export default function TokenGeneratorTool() {
    const [count, setCount] = useState(1)
    const [type, setType] = useState('uuid') // uuid, hex, base64
    const [length, setLength] = useState(32) // for hex/base64
    const [tokens, setTokens] = useState([])

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const generateRandom = (len, chars) => {
        let result = '';
        const characters = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < len; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const generate = () => {
        const res = []
        for (let i = 0; i < count; i++) {
            if (type === 'uuid') res.push(generateUUID())
            if (type === 'hex') res.push(generateRandom(length, '0123456789abcdef'))
            if (type === 'base64') res.push(generateRandom(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'))
            if (type === 'numeric') res.push(generateRandom(length, '0123456789'))
        }
        setTokens(res)
    }

    return (
        <ToolLayout title="Token Generator" description="Create UUIDs, API Keys, and random tokens.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Controls */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col gap-6">
                    <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-purple-500" /> Settings
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Type</label>
                        <select
                            value={type} onChange={e => setType(e.target.value)}
                            className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none"
                        >
                            <option value="uuid">UUID v4</option>
                            <option value="hex">Hex (0-9, a-f)</option>
                            <option value="base64">Base64 (A-Z, 0-9, vs)</option>
                            <option value="numeric">Numeric (0-9)</option>
                        </select>
                    </div>

                    {type !== 'uuid' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Length</label>
                            <input
                                type="number" value={length} onChange={e => setLength(Number(e.target.value))}
                                className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Quantity</label>
                        <input
                            type="number" value={count} onChange={e => setCount(Number(e.target.value))} min="1" max="100"
                            className="w-full p-3 bg-slate-50 rounded-xl font-bold"
                        />
                    </div>

                    <button
                        onClick={generate}
                        className="mt-auto w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all flex justify-center items-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" /> Generate
                    </button>
                </div>

                {/* Output */}
                <div className="md:col-span-2 bg-slate-900 rounded-3xl shadow-xl flex flex-col overflow-hidden relative min-h-[400px]">
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                        <div className="text-slate-400 font-bold">Generated Tokens</div>
                        <button onClick={() => navigator.clipboard.writeText(tokens.join('\n'))} className="text-slate-400 hover:text-white">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                        {tokens.map((t, i) => (
                            <div key={i} className="mb-2 font-mono text-sm text-green-400 border-b border-slate-800 pb-2 last:border-0 break-all">
                                {t}
                            </div>
                        ))}
                        {tokens.length === 0 && (
                            <div className="text-slate-600 text-center mt-20 italic">Press generate to start</div>
                        )}
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}
