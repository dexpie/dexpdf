'use client'

import React, { useState, useEffect } from 'react'
import i18n from '@/i18n'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Analytics from '@/components/Analytics'
import ProgressBar from '@/components/ProgressBar'
import CommandPalette from '@/components/CommandPalette'
import GlobalDropZone from '@/components/GlobalDropZone'
import { TOOLS } from '@/config/tools'
import { registerServiceWorker } from '@/utils/serviceWorkerUpdates'

export default function ClientLayout({ children }) {
    const [showCommandPalette, setShowCommandPalette] = useState(false)
    const [refreshApp, setRefreshApp] = useState(null)

    const tools = TOOLS.map(tool => ({
        id: tool.id,
        name: tool.title,
        desc: tool.description,
        category: tool.category,
        href: tool.href || `/${tool.id}`,
    }))

    useEffect(() => {
        registerServiceWorker({
            onUpdateReady: refresh => setRefreshApp(() => refresh),
        })
    }, [])

    useEffect(() => {
        const syncDocumentLanguage = language => {
            document.documentElement.lang = language?.startsWith('id') ? 'id' : 'en'
        }
        syncDocumentLanguage(i18n.language)
        i18n.on('languageChanged', syncDocumentLanguage)
        return () => i18n.off('languageChanged', syncDocumentLanguage)
    }, [])

    useEffect(() => {
        const onKeyDown = (e) => {
            // CMD+K palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setShowCommandPalette(true)
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    return (
        <div className="app-layout pt-16">
            <Analytics />
            <ProgressBar />
            <NavBar />
            <GlobalDropZone />

            {refreshApp && (
                <div className="fixed bottom-20 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-slate-900/15 md:bottom-6">
                    <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-foreground">New DexPDF version ready</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Refresh once to get the latest tools and fixes.</p>
                        </div>
                        <button
                            onClick={refreshApp}
                            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            )}

            <CommandPalette
                tools={tools}
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                onSelect={() => setShowCommandPalette(false)}
            />

            {children}

            <Footer />
        </div>
    )
}
