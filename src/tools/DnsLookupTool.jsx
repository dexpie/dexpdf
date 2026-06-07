import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Search, Globe, Server, Activity } from 'lucide-react'

// Record types
const TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'PTR']

export default function DnsLookupTool() {
    const [domain, setDomain] = useState('google.com')
    const [type, setType] = useState('A')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const lookup = async () => {
        if (!domain) return
        setLoading(true)
        setError(null)
        setResults(null)

        try {
            const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`)
            if (!res.ok) throw new Error('DNS Query Failed')
            const data = await res.json()
            setResults(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ToolLayout title="DNS Lookup" description="Query DNS records via Google DoH.">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Controls */}
                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-col md:flex-row gap-4">
                    <input
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        placeholder="example.com"
                        className="flex-1 p-3 bg-secondary border border-border rounded-xl font-bold"
                        onKeyDown={e => e.key === 'Enter' && lookup()}
                    />
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="p-3 bg-secondary border border-border rounded-xl font-bold w-32"
                    >
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button
                        onClick={lookup}
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Lookup
                    </button>
                </div>

                {/* Results */}
                {error && (
                    <div className="p-4 bg-red-100 text-red-600 rounded-xl font-bold flex items-center gap-2">
                        {error}
                    </div>
                )}

                {results && (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                                <div className="text-xs uppercase text-muted-foreground font-bold mb-1">Status</div>
                                <div className={`font-bold ${results.Status === 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {results.Status === 0 ? 'NOERROR' : `Error code ${results.Status}`}
                                </div>
                            </div>
                            <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                                <div className="text-xs uppercase text-muted-foreground font-bold mb-1">DoH Provider</div>
                                <div className="font-bold text-blue-500">Google Public DNS</div>
                            </div>
                        </div>

                        {results.Answer ? (
                            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
                                {results.Answer.map((rec, i) => (
                                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-muted-foreground font-bold">
                                                {TYPES[rec.type] || rec.type}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{rec.name}</div>
                                                <div className="text-xs text-muted-foreground">TTL: {rec.TTL}s</div>
                                            </div>
                                        </div>
                                        <div className="font-mono text-green-400 font-bold break-all">
                                            {rec.data}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-12 bg-secondary text-muted-foreground rounded-3xl font-bold">
                                No records found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
