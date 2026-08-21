import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Wifi, Signal, Globe, AlertTriangle } from 'lucide-react'

export default function NetworkInfoTool() {
    const [conn, setConn] = useState(null)

    useEffect(() => {
        const updateConn = () => {
            const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection
            if (c) {
                setConn({
                    effectiveType: c.effectiveType, // '4g', '3g', etc
                    downlink: c.downlink, // Mb/s
                    rtt: c.rtt, // ms
                    saveData: c.saveData, // boolean
                    type: c.type // 'wifi', 'cellular' (experimental, often undefined)
                })
            }
        }

        updateConn()
        const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection
        if (c) {
            c.addEventListener('change', updateConn)
            return () => c.removeEventListener('change', updateConn)
        }
    }, [])

    if (!conn) {
        return (
            <ToolLayout title="Network Info" description="View connection type and speed estimate.">
                <div className="max-w-2xl mx-auto p-8 bg-secondary text-muted-foreground rounded-3xl text-center border border-border">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Unavailable</h3>
                    <p>Network Information API is not supported by your browser.</p>
                </div>
            </ToolLayout>
        )
    }

    return (
        <ToolLayout title="Network Info" description="View connection type and speed estimate.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card p-8 rounded-[2rem] shadow-xl border border-border flex flex-col justify-center items-center">
                    <div className="mb-4 p-6 bg-primary/10 text-blue-600 rounded-full">
                        <Signal className="w-12 h-12" />
                    </div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">EFFECTIVE TYPE</div>
                    <div className="text-5xl font-black text-foreground uppercase">{conn.effectiveType}</div>
                </div>

                <div className="bg-card p-8 rounded-[2rem] shadow-xl border border-border flex flex-col justify-center items-center">
                    <div className="mb-4 p-6 bg-emerald-500/10 text-green-600 rounded-full">
                        <Wifi className="w-12 h-12" />
                    </div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">DOWNLINK</div>
                    <div className="text-5xl font-black text-foreground">{conn.downlink} <span className="text-xl text-muted-foreground">Mb/s</span></div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card p-6 rounded-2xl border border-border flex justify-between items-center shadow-sm">
                        <span className="font-bold text-muted-foreground">RTT (Latency)</span>
                        <span className="font-mono font-bold text-foreground text-xl">{conn.rtt} ms</span>
                    </div>
                    <div className="bg-card p-6 rounded-2xl border border-border flex justify-between items-center shadow-sm">
                        <span className="font-bold text-muted-foreground">Save Data Mode</span>
                        <span className={`font-bold px-3 py-1 rounded-lg ${conn.saveData ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                            {conn.saveData ? 'ON' : 'OFF'}
                        </span>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
