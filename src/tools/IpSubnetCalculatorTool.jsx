import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Network, Calculator, AlertCircle } from 'lucide-react'

export default function IpSubnetCalculatorTool() {
    const [ip, setIp] = useState('192.168.1.1')
    const [prefix, setPrefix] = useState(24)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        calculate()
    }, [ip, prefix])

    const calculate = () => {
        try {
            if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
                throw new Error('Invalid IP Address')
            }
            const ipParts = ip.split('.').map(Number)
            if (ipParts.some(p => p < 0 || p > 255)) throw new Error('Invalid octet (0-255)')

            const mask = -1 << (32 - prefix)
            const ipLong = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]

            const networkLong = (ipLong & mask) >>> 0
            const broadcastLong = (networkLong | (~mask & 0xFFFFFFFF)) >>> 0

            const firstIpLong = (networkLong + 1) >>> 0
            const lastIpLong = (broadcastLong - 1) >>> 0
            const hostCount = Math.max(0, lastIpLong - firstIpLong + 1)

            const longToIp = (long) => {
                return [
                    (long >>> 24) & 0xFF,
                    (long >>> 16) & 0xFF,
                    (long >>> 8) & 0xFF,
                    long & 0xFF
                ].join('.')
            }

            const formatMask = (p) => {
                const m = -1 << (32 - p)
                return longToIp(m >>> 0)
            }

            setResult({
                networkAddress: longToIp(networkLong),
                broadcastAddress: longToIp(broadcastLong),
                subnetMask: formatMask(prefix),
                firstHost: longToIp(firstIpLong),
                lastHost: longToIp(lastIpLong),
                hosts: hostCount.toLocaleString(),
                wildcardMask: longToIp((~mask & 0xFFFFFFFF) >>> 0)
            })
            setError(null)
        } catch (e) {
            setResult(null)
            setError(e.message)
        }
    }

    return (
        <ToolLayout title="IP Subnet Calculator" description="Calculate CIDR, network mask, and host ranges.">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Input */}
                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex-1 w-full">
                        <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">IP Address</label>
                        <input
                            value={ip}
                            onChange={e => setIp(e.target.value)}
                            className="w-full text-xl font-mono font-bold p-3 bg-secondary border border-border rounded-xl"
                            placeholder="192.168.1.1"
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">CIDR</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground font-bold">/</span>
                            <input
                                type="number" min="0" max="32"
                                value={prefix}
                                onChange={e => setPrefix(parseInt(e.target.value))}
                                className="w-full text-xl font-mono font-bold p-3 pl-6 bg-secondary border border-border rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-100 text-red-600 rounded-xl font-bold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                {result && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailCard label="Network Address" value={result.networkAddress} icon="blue" />
                        <DetailCard label="Broadcast Address" value={result.broadcastAddress} icon="orange" />
                        <DetailCard label="Subnet Mask" value={result.subnetMask} icon="purple" />
                        <DetailCard label="Wildcard Mask" value={result.wildcardMask} icon="slate" />
                        <DetailCard label="First Host" value={result.firstHost} icon="green" />
                        <DetailCard label="Last Host" value={result.lastHost} icon="green" />
                        <div className="md:col-span-2 bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
                            <span className="font-bold uppercase tracking-widest text-muted-foreground">Usable Hosts</span>
                            <span className="text-3xl font-mono font-bold text-green-400">{result.hosts}</span>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}

function DetailCard({ label, value, icon }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        orange: 'bg-orange-100 text-orange-600',
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        slate: 'bg-slate-100 text-slate-600',
    }

    return (
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-1">{label}</div>
            <div className="text-xl font-mono font-bold text-foreground">{value}</div>
        </div>
    )
}
