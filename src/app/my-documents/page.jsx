'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Clock, Trash2, FileSpreadsheet, Layers, ShieldCheck, Sparkles, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useFileHistory } from '@/hooks/useFileHistory'
import { Button } from '@/components/ui/button'
import { TOOLS } from '@/config/tools'

export default function MyDocumentsPage() {
    const { history, clearHistory, exportHistory, importHistory } = useFileHistory()
    const importInputRef = React.useRef(null)
    const { t } = useTranslation()
    const recent = history.slice(0, 5)
    const completedCount = history.length
    const totalBytes = history.reduce((sum, item) => sum + (Number(item.size) || 0), 0)
    const usedTools = Array.from(new Set(history.map(item => item.tool).filter(Boolean)))
    const favoriteNextTools = ['merge', 'compress', 'protect', 'qr-code']
        .map(id => TOOLS.find(tool => tool.id === id))
        .filter(Boolean)

    const handleExport = () => {
        const headers = ['Record ID', 'Date', 'Tool', 'File Name', 'Size (Bytes)', 'Status']
        const rows = history.map(item => [
            item.opId || '-',
            item.date,
            item.tool,
            item.outputName || item.name,
            item.outputSize || item.size,
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

    const handleBackupJson = () => {
        const blob = new Blob([JSON.stringify(exportHistory(), null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dexpdf_backup_${Date.now()}.json`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const handleImportJson = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        try {
            const parsed = JSON.parse(await file.text())
            const result = importHistory(parsed)
            window.alert(`Imported ${result.added} record(s). ${result.skipped} skipped (duplicate or invalid).`)
        } catch {
            window.alert('That file is not a valid DexPDF backup.')
        }
    }

    return (
        <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Clock className="w-8 h-8 text-blue-600" />
                            My Documents
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Your local workspace history, shortcuts, and next actions.
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
                                {history.length > 0 && (
                                    <Button
                                        onClick={handleBackupJson}
                                        className="bg-card text-foreground border border-slate-300 hover:bg-secondary shadow-sm"
                                    >
                                        Backup JSON
                                    </Button>
                                )}
                                <input ref={importInputRef} type="file" accept=".json" onChange={handleImportJson} className="hidden" aria-hidden="true" />
                                <Button
                                    onClick={() => importInputRef.current?.click()}
                                    variant="outline"
                                    className="border-slate-300"
                                >
                                    <Upload className="w-4 h-4 mr-2" /> Restore
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

                <div className="mb-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-muted-foreground">Completed jobs</p>
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <p className="mt-3 text-3xl font-black text-foreground">{completedCount}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Stored only in this browser.</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-muted-foreground">Tools used</p>
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <p className="mt-3 text-3xl font-black text-foreground">{usedTools.length}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Across your recent document work.</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-muted-foreground">Processed size</p>
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <p className="mt-3 text-3xl font-black text-foreground">
                            {totalBytes > 0 ? `${(totalBytes / 1024 / 1024).toFixed(1)} MB` : '0 MB'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">A lightweight local activity estimate.</p>
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-foreground">Quick actions</h2>
                            <p className="text-sm text-muted-foreground">Jump back into the work people repeat most.</p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {favoriteNextTools.map(tool => (
                            <Link key={tool.id} href={tool.href || `/${tool.id}`} className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <tool.icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-foreground">{tool.title}</p>
                                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="border-b border-border p-5">
                        <h2 className="text-lg font-black text-foreground">Recent activity</h2>
                        <p className="text-sm text-muted-foreground">Latest completed operations in this browser.</p>
                    </div>
                    {history.length === 0 ? (
                        <div className="p-12 text-center">
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
                                    {recent.map((item) => (
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
                                                        <div className="font-bold text-foreground">{item.outputName || item.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            <span className="uppercase font-bold">{item.tool}</span>
                                                            {item.outputName && item.name && item.outputName !== item.name && (
                                                                <span className="ml-2">from {item.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{(item.outputSize || item.size) ? `${((item.outputSize || item.size) / 1024).toFixed(1)} KB` : 'N/A'}</td>
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
                    )}
                </div>
            </div>
        </div>
    )
}
