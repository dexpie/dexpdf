'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, Trash2, FileSpreadsheet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useFileHistory } from '@/hooks/useFileHistory'
import { Button } from '@/components/ui/button'

export default function MyDocumentsPage() {
    const { history, clearHistory } = useFileHistory()
    const { t } = useTranslation()

    const handleExport = () => {
        const headers = ['Record ID', 'Date', 'Tool', 'File Name', 'Size (Bytes)', 'Status']
        const rows = history.map(item => [
            item.opId || '-',
            item.date,
            item.tool,
            item.name,
            item.size,
            item.status || 'completed'
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit_log_${Date.now()}.csv`
        a.click()
    }

    return (
        <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Clock className="w-8 h-8 text-blue-600" />
                            Processing History
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Local browser history of completed file operations.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {history.length > 0 && (
                            <>
                                <Button
                                    onClick={handleExport}
                                    className="bg-card text-foreground border border-slate-300 hover:bg-secondary shadow-sm"
                                >
                                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (confirm("Clear all processing history? This action cannot be undone.")) clearHistory()
                                    }}
                                    className="bg-card text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Clear Log
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* List */}
                {history.length === 0 ? (
                    <div className="bg-card rounded-2xl p-12 text-center border border-border shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Processing History is Empty</h3>
                        <p className="text-muted-foreground mb-8">No operations recorded yet.</p>
                        <Link href="/">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                Start Processing
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-secondary border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Record ID</th>
                                        <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Timestamp</th>
                                        <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Asset / Action</th>
                                        <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">File Size</th>
                                        <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-secondary transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                                {item.opId || <span className="text-muted-foreground">LEGACY</span>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                {new Date(item.date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.tool === 'merge' ? 'bg-red-100 text-red-600' :
                                                            item.tool === 'split' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-indigo-100 text-indigo-600'
                                                        }`}>
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">{item.name}</div>
                                                        <div className="text-xs text-muted-foreground uppercase font-bold">{item.tool}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{item.size ? `${(item.size / 1024).toFixed(1)} KB` : 'N/A'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
