import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { FileText, Eye, Code, Download, Copy } from 'lucide-react'
import { triggerConfetti } from '../utils/confetti'

const SAMPLE_MD = `# Welcome to DexPDF Markdown Editor

## Features
- **Bold** and *Italic* text
- Lists and [Links](https://dexpdf.com)
- \`Code snippets\`
- > Blockquotes

1. Ordered lists
2. Are supported too!

---
Start typing to see the magic happen.`

export default function MarkdownPreviewTool() {
    const [markdown, setMarkdown] = useState(SAMPLE_MD)
    const [html, setHtml] = useState('')

    // Simple Custom Markdown Parser
    // In a real production app, we would use 'remark' or 'react-markdown'
    // But for zero-dependency, we use this regex-based parser
    const parseMarkdown = (md) => {
        let output = md
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 border-b pb-2">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-6">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>')
            .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic bg-secondary p-2 my-4">$1</blockquote>')
            .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
            .replace(/\*(.*)\*/gim, '<i>$1</i>')
            .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' class='rounded-lg shadow-md max-w-full my-4' />")
            .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank' class='text-blue-600 hover:underline'>$1</a>")
            .replace(/`(.*?)`/gim, '<code class="bg-slate-100 text-red-500 rounded px-1 font-mono text-sm">$1</code>')
            .replace(/\n$/gim, '<br />')
            .replace(/\n/gim, '<br />')

        // Lists are tricky with simple regex, let's do a basic pass
        output = output.replace(/^\s*-\s+(.*)/gim, '<li class="ml-4 list-disc">$1</li>')
        output = output.replace(/^\s*\d+\.\s+(.*)/gim, '<li class="ml-4 list-decimal">$1</li>')

        return output
    }

    useEffect(() => {
        setHtml(parseMarkdown(markdown))
    }, [markdown])

    const downloadMd = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `document_${Date.now()}.md`
        a.click()
        triggerConfetti()
    }

    return (
        <ToolLayout title="Markdown Editor" description="Live markdown editing and preview.">
            <div className="max-w-6xl mx-auto h-[700px] flex flex-col md:flex-row gap-6">
                {/* Editor */}
                <div className="flex-1 flex flex-col bg-card rounded-3xl shadow-lg border border-border overflow-hidden">
                    <div className="bg-secondary p-4 border-b border-border flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                            <Code className="w-4 h-4 text-blue-500" /> Editor
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setMarkdown('')} className="text-xs font-bold text-muted-foreground hover:text-red-500">Clear</button>
                            <button onClick={() => setMarkdown(SAMPLE_MD)} className="text-xs font-bold text-blue-500 hover:text-blue-600">Sample</button>
                        </div>
                    </div>
                    <textarea
                        value={markdown}
                        onChange={e => setMarkdown(e.target.value)}
                        className="flex-1 w-full p-6 outline-none resize-none font-mono text-sm leading-relaxed"
                        placeholder="# Start typing..."
                    />
                </div>

                {/* Preview */}
                <div className="flex-1 flex flex-col bg-card rounded-3xl shadow-lg border border-border overflow-hidden">
                    <div className="bg-secondary p-4 border-b border-border flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                            <Eye className="w-4 h-4 text-green-500" /> Preview
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => navigator.clipboard.writeText(markdown)} className="p-2 hover:bg-slate-200 rounded-lg text-muted-foreground">
                                <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={downloadMd} className="p-2 hover:bg-slate-200 rounded-lg text-blue-600">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div
                        className="flex-1 w-full p-6 overflow-y-auto prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </div>
            </div>
        </ToolLayout>
    )
}
