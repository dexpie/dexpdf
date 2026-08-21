'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Download, FileText, Menu, Search, Sparkles, X } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import ThemeToggle from './ThemeToggle'

export default function NavBar() {
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const { isInstallable, promptInstall } = usePWA()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  const isIndonesian = mounted && i18n.language?.startsWith('id')

  const toggleLanguage = () => {
    i18n.changeLanguage(isIndonesian ? 'en' : 'id')
  }

  const openSearch = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
  }

  const navigate = (href) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { label: mounted ? t('nav.merge', 'Merge') : 'Merge', href: '/merge' },
    { label: mounted ? t('nav.compress', 'Compress') : 'Compress', href: '/compress' },
    { label: mounted ? t('nav.convert', 'Convert') : 'Convert', href: '/pdf2word' },
    { label: mounted ? t('nav.sign', 'Sign') : 'Sign', href: '/signature' },
  ]

  return (
    <nav className="glass-strong fixed left-0 top-0 z-50 h-16 w-full border-x-0 border-t-0 shadow-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
        <button onClick={() => navigate('/')} className="group flex items-center gap-2.5 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition group-hover:-rotate-3">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-lg font-black leading-none tracking-[-0.04em] text-foreground">DexPDF</span>
            <span className="mt-0.5 hidden text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground lg:block">Private PDF workspace</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(link => (
            <button key={link.href} onClick={() => navigate(link.href)} className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              {link.label}
            </button>
          ))}

          <div className="mx-2 h-5 w-px bg-border" />

          <button onClick={openSearch} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search tools</span>
            <kbd className="hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">Ctrl K</kbd>
          </button>

          <button onClick={() => navigate('/my-documents')} className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" title="My Documents">
            <FileText className="h-4 w-4" />
          </button>

          <ThemeToggle />

          {mounted && (
          <button onClick={toggleLanguage} aria-label={isIndonesian ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'} title={isIndonesian ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'} className="rounded-lg bg-secondary px-2.5 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground">
              {isIndonesian ? 'EN' : 'ID'}
            </button>
          )}

          {isInstallable && (
            <button onClick={promptInstall} className="ml-1 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/25 transition-opacity hover:opacity-90">
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button onClick={openSearch} className="rounded-lg p-2 text-muted-foreground"><Search className="h-5 w-5" /></button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-foreground">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="glass-strong absolute left-0 top-full z-50 flex w-full flex-col gap-1 border-x-0 p-3 shadow-xl md:hidden">
          {navLinks.map(link => (
            <button key={link.href} onClick={() => navigate(link.href)} className="w-full rounded-xl p-3 text-left text-sm font-bold text-foreground transition hover:bg-secondary">
              {link.label} PDF
            </button>
          ))}
          <button onClick={() => navigate('/my-documents')} className="w-full rounded-xl p-3 text-left text-sm font-bold text-muted-foreground transition hover:bg-secondary">
            My documents
          </button>
        </div>
      )}
    </nav>
  )
}
