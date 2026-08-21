import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Key, ShieldCheck, Lock, AlertTriangle, CheckCircle } from 'lucide-react'

export default function JwtDebuggerTool() {
    const [token, setToken] = useState('')
    const [header, setHeader] = useState(null)
    const [payload, setPayload] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!token) {
            setHeader(null)
            setPayload(null)
            setError(null)
            return
        }

        try {
            const parts = token.split('.')
            if (parts.length !== 3) throw new Error('Invalid JWT format (must have 3 parts)')

            const decode = (str) => {
                try {
                    return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')))
                } catch (e) {
                    throw new Error('Failed to decode Base64')
                }
            }

            const h = decode(parts[0])
            const p = decode(parts[1])

            setHeader(h)
            setPayload(p)
            setError(null)
        } catch (e) {
            setError(e.message)
            setHeader(null)
            setPayload(null)
        }
    }, [token])

    return (
        <ToolLayout title="JWT Debugger" description="Decode and inspect JSON Web Tokens.">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Input */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                        <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">Encoded Token</label>
                        <textarea
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            className={`w-full h-64 bg-secondary border-2 rounded-xl p-4 font-mono text-sm resize-none outline-none focus:ring-2 ring-blue-500 break-all
                                ${error ? 'border-red-300 bg-destructive/10 text-red-800' : 'border-border text-foreground'}
                            `}
                        />
                        {error && (
                            <div className="mt-4 flex items-center gap-2 text-red-600 font-bold text-sm bg-red-100 p-3 rounded-xl border border-red-200">
                                <AlertTriangle className="w-4 h-4" /> {error}
                            </div>
                        )}
                        {!error && header && (
                            <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-sm bg-green-100 p-3 rounded-xl border border-green-200">
                                <CheckCircle className="w-4 h-4" /> Valid Format
                            </div>
                        )}
                    </div>
                </div>

                {/* Output */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Header */}
                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                        <h3 className="text-red-500 font-bold mb-4 uppercase text-xs tracking-wider">Header</h3>
                        <pre className="text-foreground font-mono text-sm overflow-auto max-h-40">
                            {header ? JSON.stringify(header, null, 2) : <span className="text-muted-foreground italic">Waiting for input...</span>}
                        </pre>
                    </div>

                    {/* Payload */}
                    <div className="bg-card p-6 rounded-3xl shadow-lg border border-border relative overflow-hidden flex-1">
                        <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                        <h3 className="text-purple-500 font-bold mb-4 uppercase text-xs tracking-wider">Payload</h3>
                        <pre className="text-foreground font-mono text-sm overflow-auto h-full">
                            {payload ? JSON.stringify(payload, null, 2) : <span className="text-muted-foreground italic">Waiting for input...</span>}
                        </pre>
                    </div>

                    {/* Signature (Visual Only) */}
                    <div className="bg-secondary p-4 rounded-2xl border border-border relative overflow-hidden opacity-75">
                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-400"></div>
                        <h3 className="text-blue-400 font-bold mb-1 uppercase text-xs tracking-wider">Signature</h3>
                        <div className="text-muted-foreground text-xs italic">Signature verification requires server-side secret.</div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
