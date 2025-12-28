import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Network, Info } from 'lucide-react'
import { calculateSubnetMask, calculateCidr } from 'ip-subnet-calculator'

export default function SubnetCalculatorTool() {
    const [ip, setIp] = useState('192.168.1.1')
    const [cidr, setCidr] = useState(24)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const calc = () => {
        try {
            const res = calculateSubnetMask(ip, cidr)
            setResult(res)
            setError(null)
        } catch (e) {
            setError('Invalid IP address')
            setResult(null)
        }
    }

    React.useEffect(() => {
        calc()
    }, [ip, cidr])

    return (
        <ToolLayout title="Subnet Calculator" description="Calculate CIDR, subnet masks, and IP ranges.">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">IP Address</label>
                        <input
                            value={ip} onChange={e => setIp(e.target.value)}
                            className="w-full text-2xl font-mono font-bold p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-blue-500 text-slate-700"
                            placeholder="192.168.0.1"
                        />
                    </div>
                    <div className="w-full md:w-32 space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Mask (/{cidr})</label>
                        <input
                            type="number" min="0" max="32" value={cidr} onChange={e => setCidr(Number(e.target.value))}
                            className="w-full text-2xl font-mono font-bold p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-blue-500 text-slate-700 text-center"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-100 text-red-600 rounded-xl font-bold text-center">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResultCard label="Network Address" value={result.ipLowStr} />
                        <ResultCard label="Broadcast Address" value={result.ipHighStr} />
                        <ResultCard label="Subnet Mask" value={result.prefixMaskStr} />
                        <ResultCard label="Inverted Mask" value={result.invertedMaskStr} />
                        <ResultCard label="Total Hosts" value={result.ipHigh - result.ipLow + 1} />
                        <ResultCard label="Usable Hosts" value={Math.max(0, result.ipHigh - result.ipLow - 1)} />
                    </div>
                )}

            </div>
        </ToolLayout>
    )
}

function ResultCard({ label, value }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <span className="font-bold text-slate-500">{label}</span>
            <span className="font-mono font-bold text-lg text-blue-600">{value}</span>
        </div>
    )
}
