'use client'

import React, { useState, useEffect, useRef } from 'react'
import '@/i18n' // Initialize i18n on client
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Analytics from '@/components/Analytics'
import ProgressBar from '@/components/ProgressBar'
import CommandPalette from '@/components/CommandPalette'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
// Tools loading logic is usually in App.jsx but now tools.json fetching 
// might need to happen here or passed down. We'll fetch here for simplicity.

export default function ClientLayout({ children }) {
    const [tools, setTools] = useState([])
    const [showCommandPalette, setShowCommandPalette] = useState(false)
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
    const searchRef = useRef(null)

    useEffect(() => {
        // We need to fetch tools for command palette
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
        // Global hotkeys
        const onKeyDown = (e) => {
            // CMD+K palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setShowCommandPalette(true)
            }
            // ? shortcuts
            if (e.key === '?' && !(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA'))) {
                e.preventDefault()
                setShowKeyboardShortcuts(prev => !prev)
            }
            // CMD+D theme (if we kept it)
            if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                e.preventDefault()
                const themeToggle = document.querySelector('.theme-toggle')
                if (themeToggle) themeToggle.click()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    return (
        <div className="app-layout">
            <Analytics />
            <ProgressBar />
            <NavBar />

            <CommandPalette
                tools={tools}
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                onSelect={() => setShowCommandPalette(false)}
            />

            <KeyboardShortcuts
                isOpen={showKeyboardShortcuts}
                onClose={() => setShowKeyboardShortcuts(false)}
            />

            {children}

            <Footer />
        </div>
    )
}
