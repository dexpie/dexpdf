'use client'
import React, { useState, useEffect } from 'react'
import { Home, FileClock, Search, Menu, X, Building2, Globe, Download, Settings } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePWA } from '@/hooks/usePWA'
import BrandKit from './BrandKit'

export default function BottomNav() {
    const router = useRouter()
    const pathname = usePathname()
    const { t, i18n } = useTranslation()
    const { isInstallable, promptInstall } = usePWA()

    // State for menus
    const [menuOpen, setMenuOpen] = useState(false)
    const [brandKitOpen, setBrandKitOpen] = useState(false)

    // Hide on desktop
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
            label: 'Tools',
            action: () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
        },
        { id: 'menu', icon: Menu, label: 'Menu', action: () => setMenuOpen(true) },
    ]

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'id' : 'en'
        i18n.changeLanguage(newLang)
    }

    return (
        <>
            {/* Safe Area Spacer */}
            <div className="h-24 md:hidden" />

            {/* Bottom Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 md:hidden pb-safe"
            >
                <div className="flex justify-around items-center p-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <button
                                key={item.id}
                                onClick={item.action ? item.action : () => router.push(item.href || '/')}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                                    />
                                )}
                                <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-blue-600/20' : ''}`} />
                                <span className="text-[10px] font-bold">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </motion.div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 w-full bg-slate-50 rounded-t-3xl z-[70] overflow-hidden shadow-2xl pb-safe"
                        >
                            {/* Drag Handle */}
                            <div className="w-full h-6 flex items-center justify-center bg-white border-b border-slate-100" onClick={() => setMenuOpen(false)}>
                                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                            </div>

                            <div className="p-6 space-y-2 bg-white min-h-[50vh]">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Menu</h3>

                                <MenuItem
                                    icon={Building2}
                                    label="Brand Identity Kit"
                                    onClick={() => { setMenuOpen(false); setBrandKitOpen(true); }}
                                    color="text-indigo-600"
                                    bg="bg-indigo-50"
                                />

                                <MenuItem
                                    icon={Globe}
                                    label={`Language: ${i18n.language === 'en' ? 'English' : 'Indonesia'}`}
                                    onClick={toggleLanguage}
                                    color="text-emerald-600"
                                    bg="bg-emerald-50"
                                />

                                {isInstallable && (
                                    <MenuItem
                                        icon={Download}
                                        label="Install App"
                                        onClick={promptInstall}
                                        color="text-blue-600"
                                        bg="bg-blue-50"
                                    />
                                )}

                                <div className="h-px bg-slate-100 my-4" />

                                <div className="text-xs text-center text-slate-400 font-medium">
                                    DexPDF Mobile v1.0
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BrandKit isOpen={brandKitOpen} onClose={() => setBrandKitOpen(false)} />
        </>
    )
}

function MenuItem({ icon: Icon, label, onClick, color, bg }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all border border-transparent hover:border-slate-100"
        >
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-700 text-lg">{label}</span>
        </button>
    )
}
