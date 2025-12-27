import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, ArrowRight, RefreshCcw, FileText, Scissors, Layers, Lock, Clock } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useFileHistory } from '@/hooks/useFileHistory'

export default function ResultPage({
    title = "Files Processed Successfully!",
    description = "Your document is ready to download.",
    downloadUrl,
    downloadFilename,
    onReset,
    secondaryActions = [],
    // History props
    sourceFile,
    toolId
}) {
    const { addToHistory } = useFileHistory()

    useEffect(() => {
        if (sourceFile && toolId) {
            addToHistory({
                name: sourceFile.name,
                size: sourceFile.size,
                type: sourceFile.type,
                tool: toolId,
                status: 'completed'
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Run once on mount

    // Suggested next tools (simple rotation, could be smart in future)
    const suggestions = [
        { label: "Compress PDF", icon: ArrowRight, href: "/compress", color: "text-green-600", bg: "bg-green-50" },
        { label: "Merge PDF", icon: Layers, href: "/merge", color: "text-red-600", bg: "bg-red-50" },
        { label: "Split PDF", icon: Scissors, href: "/split", color: "text-blue-600", bg: "bg-blue-50" },
    ]

    return (
        <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200"
            >
                <Download className="w-10 h-10" />
            </motion.div>

            <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">{description}</p>

            {/* Primary Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                {downloadUrl && (
                    <a href={downloadUrl} download={downloadFilename} className="w-full sm:w-auto">
                        <Button size="xl" className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                            <Download className="w-6 h-6 mr-2" />
                            Download File
                        </Button>
                    </a>
                )}
                {onReset && (
                    <Button variant="outline" size="xl" onClick={onReset} className="w-full sm:w-auto h-14 px-8 border-slate-300 text-slate-600 hover:bg-slate-50">
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        Process Another
                    </Button>
                )}
            </div>

            {/* Secure Share Section (Enterprise) */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto mb-8 text-left">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Secure Distribution</h3>
                        <p className="text-sm text-slate-500">Share this file securely with end-to-end encryption.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Self-Destruct Link</label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 font-mono truncate select-all">
                                https://dexpdf.app/s/{Math.random().toString(36).substr(2, 12)}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => alert("Link copied! (Mock)")}>
                                Copy
                            </Button>
                        </div>
                        <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Expires in 24 hours
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <QRCodeSVG value={`https://dexpdf.app/s/${Math.random().toString(36).substr(2, 12)}`} size={100} />
                        <p className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-wider">Scan to Download</p>
                    </div>
                </div>
            </div>

            {/* Secondary Actions / Cross Sell */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 max-w-3xl mx-auto">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Continue with other tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {suggestions.map((tool) => (
                        <Link href={tool.href} key={tool.label}>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group cursor-pointer">
                                <div className={`p-2 rounded-lg ${tool.bg} ${tool.color}`}>
                                    <tool.icon className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{tool.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
