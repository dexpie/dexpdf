'use client'
import React, { useState, useEffect } from 'react'
import { Home, FileClock, Search, Globe, Download } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { usePWA } from '@/hooks/usePWA'

export default function BottomNav() {
    const router = useRouter()
    const pathname = usePathname()
    const { i18n } = useTranslation()
    const { isInstallable, promptInstall } = usePWA()

    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    if (!isMobile) return null

    const navItems = [
        { id: 'home', icon: Home, label: 'Home', href: '/' },
        { id: 'history', icon: FileClock, label: 'My Docs', href: '/my-documents' },
        {
            id: 'search',
            icon: Search,
            label: 'Search',
            action: () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
        },
    ]

    return (
        <>
            {/* Safe Area Spacer */}
            <div className="h-20 md:hidden" />

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 md:hidden pb-safe">
                <div className="flex justify-around items-center p-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <button
                                key={item.id}
                                onClick={item.action ? item.action : () => router.push(item.href || '/')}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${isActive ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <item.icon className="w-5 h-5 mb-0.5" />
                                <span className="text-[10px] font-bold">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
