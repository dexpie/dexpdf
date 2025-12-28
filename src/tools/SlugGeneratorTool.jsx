import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Link2, Copy, ArrowRight } from 'lucide-react'
import slugify from 'slugify'

export default function SlugGeneratorTool() {
    const [input, setInput] = useState('Hello World! This is a test string 123.')
    const [slug, setSlug] = useState('')

    React.useEffect(() => {
        setSlug(slugify(input, { lower: true, strict: true }))
    }, [input])

    return (
        <ToolLayout title="Slug Generator" description="Convert text into SEO-friendly URL slugs.">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-white p-6 rounded-3xl shadow text-center">
                    <input
                        value={input} onChange={e => setInput(e.target.value)}
                        className="w-full text-center text-3xl font-bold text-slate-800 outline-none placeholder:text-slate-200"
                        placeholder="Enter text..."
                    />
                </div>

                <div className="flex justify-center">
                    <ArrowRight className="w-8 h-8 text-slate-300 animate-bounce" />
                </div>

                <div className="bg-blue-600 p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4">
                    <div className="font-mono text-2xl text-white font-bold break-all text-center">
                        {slug}
                    </div>
                    <button
                        onClick={() => navigator.clipboard.writeText(slug)}
                        className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold text-sm transition-colors flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" /> Copy Slug
                    </button>
                </div>

            </div>
        </ToolLayout>
    )
}
