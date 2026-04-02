'use client'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { usePWA } from '@/hooks/usePWA'
import { Download, Menu, X, FileText, Search } from 'lucide-react'

/**
 * NavBar - Main navigation component
 * Fixed top navigation with brand, quick links, search, and actions
 */
export default function NavBar() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { isInstallable, promptInstall } = usePWA()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en'
    i18n.changeLanguage(newLang)
  }

  const openSearch = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  const navLinks = [
    { label: 'Merge', href: '/merge' },
    { label: 'Split', href: '/split' },
    { label: 'Compress', href: '/compress' },
    { label: 'Convert', href: '/pdf2word' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm h-14">
        <div className="container mx-auto px-4 md:px-6 h-full flex justify-between items-center">

          {/* Brand */}
          <div
            className="cursor-pointer flex items-center gap-2 group"
            onClick={() => router.push('/')}
          >
            <span className="font-black text-xl tracking-tight text-primary transition-transform duration-200 group-hover:scale-105">
              DexPDF
            </span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-1 items-center">
            {mounted && (
              <>
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
                  >
                    {link.label}
                  </button>
                ))}

                <div className="h-5 w-[1px] bg-border mx-2"></div>

                <button
                  onClick={openSearch}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden lg:inline">Search...</span>
                  <kbd className="hidden lg:inline bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-muted-foreground">⌘K</kbd>
                </button>

                <button
                  onClick={() => router.push('/my-documents')}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary"
                  title="My Documents"
                >
                  <FileText className="w-4.5 h-4.5" />
                </button>

                <button
                  onClick={toggleLanguage}
                  className="text-xs font-bold bg-secondary text-muted-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                >
                  {i18n.language === 'en' ? 'ID' : 'EN'}
                </button>
              </>
            )}

            {isInstallable && (
              <button
                onClick={promptInstall}
                className="ml-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm shadow-primary/25"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={openSearch}
              className="text-muted-foreground p-2"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground p-2"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-lg p-3 flex flex-col gap-1 md:hidden z-50">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => { router.push(link.href); setMobileMenuOpen(false); }}
                className="w-full text-left p-3 rounded-lg hover:bg-secondary text-foreground font-medium hover:text-primary transition-colors text-sm"
              >
                {link.label} PDF
              </button>
            ))}
            <div className="h-[1px] bg-border my-1"></div>
            <button
              onClick={() => { router.push('/my-documents'); setMobileMenuOpen(false); }}
              className="w-full text-left p-3 rounded-lg hover:bg-secondary font-medium text-muted-foreground text-sm"
            >
              My Documents
            </button>
          </div>
        )}
      </nav>
    </>
  )
}