import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Lock, Unlock, RefreshCw, Copy } from 'lucide-react'

export default function StringObfuscatorTool() {
    const [input, setInput] = useState('Secret Message')
    const [output, setOutput] = useState('')
    const [mode, setMode] = useState('rot13')

    const rot13 = (str) => {
        return str.replace(/[a-zA-Z]/g, function (c) {
            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    }

    const process = () => {
        let res = ''
        if (mode === 'rot13') res = rot13(input)
        if (mode === 'base64') res = btoa(unescape(encodeURIComponent(input)))
        if (mode === 'reverse') res = input.split('').reverse().join('')
        if (mode === 'binary') res = input.split('').map(char => char.charCodeAt(0).toString(2)).join(' ')
        setOutput(res)
    }

    React.useEffect(() => {
        process()
    }, [input, mode])

    return (
        <ToolLayout title="String Obfuscator" description="Hide text with ROT13, Base64, and more.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col gap-4">
                    <textarea
                        value={input} onChange={e => setInput(e.target.value)}
                        className="flex-1 w-full p-4 bg-slate-50 rounded-xl outline-none font-mono text-sm resize-none h-48"
                        placeholder="Input..."
                    />
                    <div className="flex gap-2 flex-wrap">
                        {['rot13', 'base64', 'reverse', 'binary'].map(m => (
                            <button
                                key={m} onClick={() => setMode(m)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase ${mode === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col relative">
                    <label className="text-slate-500 text-xs font-bold uppercase mb-2">Obfuscated Output</label>
                    <div className="flex-1 font-mono text-green-400 break-all overflow-auto p-2">
                        {output}
                    </div>
                    <button
                        onClick={() => navigator.clipboard.writeText(output)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </ToolLayout>
    )
}
