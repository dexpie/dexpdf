'use client'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { usePWA } from '@/hooks/usePWA'
import { Download, Menu, X, FileText, Search } from 'lucide-react'

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

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm h-14">
        <div className="container mx-auto px-4 md:px-6 h-full flex justify-between items-center">

          {/* Brand */}
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => router.push('/')}
          >
            <span className="font-black text-xl tracking-tighter text-red-600">DexPDF</span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-3 items-center">
            {mounted && (
              <>
                <button
                  onClick={() => router.push('/merge')}
                  className="text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors px-2 py-1"
                >
                  Merge
                </button>
                <button
                  onClick={() => router.push('/split')}
                  className="text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors px-2 py-1"
                >
                  Split
                </button>
                <button
                  onClick={() => router.push('/compress')}
                  className="text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors px-2 py-1"
                >
                  Compress
                </button>
                <button
                  onClick={() => router.push('/pdf2word')}
                  className="text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors px-2 py-1"
                >
                  Convert
                </button>

                <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>

                <button
                  onClick={openSearch}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-lg border border-slate-200 hover:border-slate-300 text-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Search tools...</span>
                  <kbd className="hidden lg:inline bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">⌘K</kbd>
                </button>

                <button
                  onClick={() => router.push('/my-documents')}
                  className="text-slate-500 hover:text-slate-700 transition-colors p-1.5"
                  title="My Documents"
                >
                  <FileText className="w-4.5 h-4.5" />
                </button>

                <button
                  onClick={toggleLanguage}
                  className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded hover:bg-slate-200 transition-colors uppercase"
                >
                  {i18n.language === 'en' ? 'ID' : 'EN'}
                </button>
              </>
            )}

            {isInstallable && (
              <button
                onClick={promptInstall}
                className="ml-1 bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={openSearch}
              className="text-slate-500 p-1.5"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg p-3 flex flex-col gap-1 md:hidden z-50">
            <button onClick={() => { router.push('/merge'); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-slate-700 font-semibold hover:text-red-600 text-sm">Merge PDF</button>
            <button onClick={() => { router.push('/split'); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-slate-700 font-semibold hover:text-red-600 text-sm">Split PDF</button>
            <button onClick={() => { router.push('/compress'); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-slate-700 font-semibold hover:text-red-600 text-sm">Compress PDF</button>
            <button onClick={() => { router.push('/pdf2word'); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-slate-700 font-semibold hover:text-red-600 text-sm">Convert PDF</button>
            <div className="h-[1px] bg-slate-100 my-1"></div>
            <button
              onClick={() => {
                router.push('/my-documents')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-500 text-sm"
            >
              My Documents
            </button>
          </div>
        )}
      </nav>
    </>
  )
}
