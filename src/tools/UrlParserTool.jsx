import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Link, Search, Globe, Folder, Database } from 'lucide-react'

export default function UrlParserTool() {
    const [url, setUrl] = useState('https://www.dexpdf.com/tools/search?q=pdf&sort=desc#top')
    const [parsed, setParsed] = useState(null)

    useEffect(() => {
        try {
            const u = new URL(url)
            const params = {}
            u.searchParams.forEach((val, key) => {
                params[key] = val
            })

            setParsed({
                protocol: u.protocol,
                hostname: u.hostname,
                port: u.port,
                pathname: u.pathname,
                hash: u.hash,
                params: params,
                origin: u.origin
            })
        } catch (e) {
            setParsed(null)
        }
    }, [url])

    return (
        <ToolLayout title="URL Parser" description="Break down URLs into protocol, host, path, and queries.">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Input */}
                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                    <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">Enter URL</label>
                    <input
                        type="text"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        className="w-full p-4 bg-secondary border border-border rounded-xl font-bold text-foreground outline-none focus:ring-2 ring-blue-500"
                        placeholder="https://example.com/path?query=123"
                    />
                </div>

                {parsed ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Components */}
                        <div className="bg-card p-6 rounded-3xl shadow-lg border border-border space-y-4">
                            <h3 className="font-bold text-xl text-foreground mb-4 border-b pb-2">Components</h3>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Globe className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Protocol</div>
                                    <div className="font-mono font-bold text-foreground">{parsed.protocol}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Database className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Host</div>
                                    <div className="font-mono font-bold text-foreground">{parsed.hostname} {parsed.port ? `:${parsed.port}` : ''}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Folder className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Path</div>
                                    <div className="font-mono font-bold text-foreground">{parsed.pathname}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Link className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Hash</div>
                                    <div className="font-mono font-bold text-foreground">{parsed.hash || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Query Params */}
                        <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                            <h3 className="font-bold text-xl text-foreground mb-4 border-b pb-2 flex items-center gap-2">
                                <Search className="w-5 h-5 text-muted-foreground" />
                                Query Parameters
                            </h3>
                            {Object.keys(parsed.params).length > 0 ? (
                                <div className="space-y-3">
                                    {Object.entries(parsed.params).map(([key, val]) => (
                                        <div key={key} className="flex justify-between items-center bg-secondary p-3 rounded-xl border border-border">
                                            <span className="font-bold text-slate-600">{key}</span>
                                            <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground text-center py-10 italic">No query parameters found.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-12 bg-red-50 text-red-400 rounded-3xl font-bold">
                        Invalid URL
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
