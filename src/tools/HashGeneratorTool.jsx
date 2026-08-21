import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Shield, Fingerprint, Copy, RefreshCw } from 'lucide-react'
import CryptoJS from 'crypto-js'

export default function HashGeneratorTool() {
    const [input, setInput] = useState('')
    const [hashes, setHashes] = useState({ md5: '', sha1: '', sha256: '', sha512: '' })

    const generate = (val) => {
        setInput(val)
        if (!val) {
            setHashes({ md5: '', sha1: '', sha256: '', sha512: '' })
            return
        }
        setHashes({
            md5: CryptoJS.MD5(val).toString(),
            sha1: CryptoJS.SHA1(val).toString(),
            sha256: CryptoJS.SHA256(val).toString(),
            sha512: CryptoJS.SHA512(val).toString()
        })
    }

    return (
        <ToolLayout title="Hash Generator" description="Generate MD5, SHA1, SHA256 hashes instantly.">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                    <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">Value to Hash</label>
                    <textarea
                        value={input}
                        onChange={e => generate(e.target.value)}
                        placeholder="Type something..."
                        className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 ring-blue-500 font-mono text-sm h-24 resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <HashRow label="MD5" value={hashes.md5} color="blue" />
                    <HashRow label="SHA-1" value={hashes.sha1} color="green" />
                    <HashRow label="SHA-256" value={hashes.sha256} color="purple" />
                    <HashRow label="SHA-512" value={hashes.sha512} color="red" />
                </div>

            </div>
        </ToolLayout>
    )
}

function HashRow({ label, value, color }) {
    return (
        <div className={`bg-card rounded-2xl shadow-sm border border-border flex flex-col md:flex-row items-center overflow-hidden`}>
            <div className={`w-full md:w-32 p-4 bg-${color}-50 text-${color}-600 font-bold border-b md:border-b-0 md:border-r border-${color}-100 flex justify-between md:justify-center items-center`}>
                {label}
                <Fingerprint className="w-4 h-4 md:hidden" />
            </div>
            <div className="flex-1 p-4 font-mono text-xs break-all text-muted-foreground w-full text-center md:text-left">
                {value || <span className="text-muted-foreground italic">Waiting...</span>}
            </div>
            <button
                onClick={() => navigator.clipboard.writeText(value)}
                disabled={!value}
                className="w-full md:w-auto p-4 text-muted-foreground hover:text-muted-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
            >
                <Copy className="w-5 h-5 mx-auto" />
            </button>
        </div>
    )
}
