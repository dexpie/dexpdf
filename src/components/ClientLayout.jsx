'use client'

import React, { useState, useEffect, useRef } from 'react'
import '@/i18n'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Analytics from '@/components/Analytics'
import ProgressBar from '@/components/ProgressBar'
import CommandPalette from '@/components/CommandPalette'
import GlobalDropZone from '@/components/GlobalDropZone'

export default function ClientLayout({ children }) {
    const [tools, setTools] = useState([])
    const [showCommandPalette, setShowCommandPalette] = useState(false)

    useEffect(() => {
        fetch('/tools.json')
            .then(res => res.json())
            .then(data => setTools(data))
            .catch(err => console.error('Error loading tools:', err))

        // Register Service Worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered: ', registration))
                .catch(registrationError => console.log('SW registration failed: ', registrationError))
        }
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
