import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Globe, Smartphone, Cpu, Box } from 'lucide-react'
import { UAParser } from 'ua-parser-js'

export default function UserAgentParserTool() {
    const [ua, setUa] = useState('')
    const [result, setResult] = useState(null)

    useEffect(() => {
        setUa(navigator.userAgent)
    }, [])

    useEffect(() => {
        if (!ua) {
            setResult(null)
            return
        }
        const parser = new UAParser(ua)
        setResult(parser.getResult())
    }, [ua])

    return (
        <ToolLayout title="User Agent Parser" description="Identify browser, OS, and device details.">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                    <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">User Agent String</label>
                    <textarea
                        value={ua}
                        onChange={e => setUa(e.target.value)}
                        className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 ring-blue-500 font-mono text-sm h-24 resize-none text-foreground"
                        placeholder="Mozilla/5.0..."
                    />
                </div>

                {result && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="bg-card p-6 rounded-2xl shadow-md border-l-4 border-blue-500">
                            <div className="flex items-center gap-3 mb-4">
                                <Globe className="w-6 h-6 text-blue-500" />
                                <h3 className="font-bold text-lg text-foreground">Browser</h3>
                            </div>
                            <div className="space-y-2">
                                <InfoRow label="Name" value={result.browser.name} />
                                <InfoRow label="Version" value={result.browser.version} />
                                <InfoRow label="Engine" value={result.engine.name} />
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-2xl shadow-md border-l-4 border-purple-500">
                            <div className="flex items-center gap-3 mb-4">
                                <Box className="w-6 h-6 text-purple-500" />
                                <h3 className="font-bold text-lg text-foreground">Operating System</h3>
                            </div>
                            <div className="space-y-2">
                                <InfoRow label="Name" value={result.os.name} />
                                <InfoRow label="Version" value={result.os.version} />
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-2xl shadow-md border-l-4 border-green-500">
                            <div className="flex items-center gap-3 mb-4">
                                <Smartphone className="w-6 h-6 text-green-500" />
                                <h3 className="font-bold text-lg text-foreground">Device</h3>
                            </div>
                            <div className="space-y-2">
                                <InfoRow label="Type" value={result.device.type || 'Desktop'} />
                                <InfoRow label="Vendor" value={result.device.vendor} />
                                <InfoRow label="Model" value={result.device.model} />
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-2xl shadow-md border-l-4 border-orange-500">
                            <div className="flex items-center gap-3 mb-4">
                                <Cpu className="w-6 h-6 text-orange-500" />
                                <h3 className="font-bold text-lg text-foreground">CPU</h3>
                            </div>
                            <div className="space-y-2">
                                <InfoRow label="Architecture" value={result.cpu.architecture} />
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </ToolLayout>
    )
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between border-b border-border last:border-0 pb-1">
            <span className="text-sm text-muted-foreground font-bold">{label}</span>
            <span className="text-sm text-foreground font-semibold">{value || 'N/A'}</span>
        </div>
    )
}
