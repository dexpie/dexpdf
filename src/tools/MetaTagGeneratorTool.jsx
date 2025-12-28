import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Tag, Code, Copy } from 'lucide-react'

export default function MetaTagGeneratorTool() {
    const [data, setData] = useState({
        title: 'DexPDF - Ultimate Tools',
        description: 'Free online PDF tools and utilities for developers.',
        keywords: 'pdf, tools, online, free, developer',
        author: 'DexPIE',
        robots: 'index, follow',
        themeColor: '#4f46e5'
    })

    const generateCode = () => {
        return `<!-- Standard SEO -->
<title>${data.title}</title>
<meta name="description" content="${data.description}">
<meta name="keywords" content="${data.keywords}">
<meta name="author" content="${data.author}">
<meta name="robots" content="${data.robots}">
<meta name="theme-color" content="${data.themeColor}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:title" content="${data.title}">
<meta property="og:description" content="${data.description}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="${data.title}">
<meta property="twitter:description" content="${data.description}">`
    }

    return (
        <ToolLayout title="Meta Tag Generator" description="Create SEO-friendly meta tags for your website.">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Form */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 space-y-4">
                    <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-purple-500" /> Website Details
                    </h3>

                    <Input label="Site Title" value={data.title} onChange={v => setData({ ...data, title: v })} />
                    <Input label="Description" value={data.description} onChange={v => setData({ ...data, description: v })} textarea />
                    <Input label="Keywords (comma separated)" value={data.keywords} onChange={v => setData({ ...data, keywords: v })} />
                    <Input label="Author" value={data.author} onChange={v => setData({ ...data, author: v })} />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Robots</label>
                            <select
                                value={data.robots}
                                onChange={e => setData({ ...data, robots: e.target.value })}
                                className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none"
                            >
                                <option value="index, follow">Index, Follow</option>
                                <option value="noindex, follow">No Index, Follow</option>
                                <option value="index, nofollow">Index, No Follow</option>
                                <option value="noindex, nofollow">No Index, No Follow</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Theme Color</label>
                            <div className="flex gap-2">
                                <input type="color" value={data.themeColor} onChange={e => setData({ ...data, themeColor: e.target.value })} className="h-10 w-10 rounded shadow cursor-pointer" />
                                <input type="text" value={data.themeColor} onChange={e => setData({ ...data, themeColor: e.target.value })} className="flex-1 bg-slate-50 rounded-xl px-2 text-sm font-bold" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Output */}
                <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[500px]">
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                        <div className="text-slate-400 font-bold flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="ml-2 text-xs uppercase tracking-wider">Output HTML</span>
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(generateCode())} className="text-slate-400 hover:text-white flex items-center gap-2">
                            <span className="text-xs font-bold">COPY</span> <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 p-6 overflow-auto">
                        <pre className="text-blue-300 font-mono text-sm whitespace-pre-wrap">
                            {generateCode()}
                        </pre>
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}

function Input({ label, value, onChange, textarea }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{label}</label>
            {textarea ? (
                <textarea
                    value={value} onChange={e => onChange(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 ring-purple-500 font-bold text-slate-700 text-sm h-24 resize-none"
                />
            ) : (
                <input
                    value={value} onChange={e => onChange(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 ring-purple-500 font-bold text-slate-700 text-sm"
                />
            )}
        </div>
    )
}
