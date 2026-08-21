import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Code, Copy } from 'lucide-react'

export default function HtmlEntityTool() {
    const [input, setInput] = useState('<div class="test">Hello & Welcome</div>')
    const [escaped, setEscaped] = useState('')
    const [unescaped, setUnescaped] = useState('')

    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const unescapeHtml = (safe) => {
        const doc = new DOMParser().parseFromString(safe, "text/html");
        return doc.documentElement.textContent;
    }

    const handleInput = (val) => {
        setInput(val)
        setEscaped(escapeHtml(val))
        setUnescaped(unescapedHtml(val)) // wait, unescapeHtml logic above relies on browser API which might be tricky if not careful, but DOMParser is fine.
    }

    // Fix unescape: DOMParser is good but let's use a simpler textarea hack for robustness or stick to replace if we want pure JS
    // Actually the DOMParser trick is standard.

    // Better Unescape
    const decodeHtml = (html) => {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    React.useEffect(() => {
        setEscaped(escapeHtml(input))
        setUnescaped(decodeHtml(input))
    }, [input])

    return (
        <ToolLayout title="HTML Entity Encoder" description="Escape/Unescape HTML characters.">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                    <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">Input String</label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="<Tag> & Characters..."
                        className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 font-mono text-sm h-32 resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-3xl shadow-md border border-border overflow-hidden flex flex-col">
                        <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
                            <span className="font-bold text-orange-600">Escaped (Safe)</span>
                            <button onClick={() => navigator.clipboard.writeText(escaped)} className="text-muted-foreground hover:text-muted-foreground">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            value={escaped}
                            readOnly
                            className="flex-1 p-4 resize-none outline-none font-mono text-sm text-foreground bg-card h-40"
                        />
                    </div>

                    <div className="bg-card rounded-3xl shadow-md border border-border overflow-hidden flex flex-col">
                        <div className="p-4 bg-primary/10 border-b border-blue-100 flex justify-between items-center">
                            <span className="font-bold text-blue-600">Unescaped (Raw)</span>
                            <button onClick={() => navigator.clipboard.writeText(unescaped)} className="text-muted-foreground hover:text-muted-foreground">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            value={unescaped}
                            readOnly
                            className="flex-1 p-4 resize-none outline-none font-mono text-sm text-foreground bg-card h-40"
                        />
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
