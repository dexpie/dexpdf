import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { ShieldCheck, AlertTriangle } from 'lucide-react'


export default function IpAddressValidatorTool() {
    // Note: 'is-ip' is not in package.json, but user installed 'ip-regex'. 
    // Actually, let's just use regex for simplicity if 'is-ip' isn't available, or rely on internal check.
    // Wait, I installed 'ip-regex'. Let's use that.
    // Actually simple regex is fine for validation without external deps if needed, but let's try standard approach.

    // Simpler: use a regex directly.
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

    const [input, setInput] = useState('')
    const [status, setStatus] = useState(null) // 'ipv4' | 'ipv6' | 'invalid'

    React.useEffect(() => {
        if (!input) {
            setStatus(null)
            return
        }
        if (ipv4Regex.test(input)) setStatus('ipv4')
        else if (ipv6Regex.test(input)) setStatus('ipv6')
        else setStatus('invalid')
    }, [input])

    return (
        <ToolLayout title="IP Validator" description="Check if an IP address is valid IPv4 or IPv6.">
            <div className="max-w-2xl mx-auto space-y-8">

                <div className="bg-card p-8 rounded-3xl shadow-lg border border-border text-center">
                    <input
                        value={input} onChange={e => setInput(e.target.value)}
                        className="w-full text-center text-3xl font-mono font-bold p-4 bg-secondary rounded-2xl outline-none focus:ring-4 ring-blue-100 text-foreground placeholder:text-slate-200"
                        placeholder="192.168.1.1"
                    />
                </div>

                {status && (
                    <div className={`p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 transition-all ${status === 'invalid' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                        {status === 'invalid' ? <AlertTriangle className="w-16 h-16" /> : <ShieldCheck className="w-16 h-16" />}
                        <div className="text-3xl font-black uppercase tracking-wider">
                            {status === 'ipv4' && 'Valid IPv4 Address'}
                            {status === 'ipv6' && 'Valid IPv6 Address'}
                            {status === 'invalid' && 'Invalid IP Address'}
                        </div>
                    </div>
                )}

            </div>
        </ToolLayout>
    )
}
