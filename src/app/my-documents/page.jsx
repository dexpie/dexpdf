'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, Trash2, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useFileHistory } from '@/hooks/useFileHistory'
import { Button } from '@/components/ui/button'

export default function MyDocumentsPage() {
    const { history, clearHistory } = useFileHistory()
    const { t } = useTranslation()

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Documents</h1>
                        <p className="text-slate-500 mt-1">
                            Your recent processing history (stored locally).
                        </p>
                    </div>
                    {history.length > 0 && (
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirm("Clear all history?")) clearHistory()
                            }}
                            className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Clear History
                        </Button>
                    )}
                </div>

                {/* List */}
                {history.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No History Yet</h3>
                        <p className="text-slate-500 mb-8">Files you process will appear here.</p>
                        <Link href="/">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                Go to Tools
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-1 divide-y divide-slate-100">
                            {history.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.tool === 'merge' ? 'bg-red-100 text-red-600' :
                                                item.tool === 'split' ? 'bg-blue-100 text-blue-600' :
                                                    item.tool === 'compress' ? 'bg-green-100 text-green-600' :
                                                        'bg-indigo-100 text-indigo-600'
                                            }`}>
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg mb-1">{item.name}</h4>
                                            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                                                </span>
                                                <span className="px-2 py-0.5 bg-slate-100 rounded-md uppercase text-xs font-bold tracking-wider">
                                                    {item.tool}
                                                </span>
                                                {item.size && (
                                                    <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {/* In future: could verify if blob URL is still valid (it won't be after refresh) */}
                                    {/* So we just offer 'Process Again' logic by redirecting to tool? */}
                                    <Link href={`/${item.tool}`}>
                                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            Open Tool <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
