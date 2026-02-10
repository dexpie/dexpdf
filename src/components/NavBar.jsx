'use client'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { usePWA } from '@/hooks/usePWA'
import { Share2, Download, Building2, Menu, X, FileText } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import BrandKit from '@/components/BrandKit'

import { useSound } from '@/hooks/useSound'

export default function NavBar() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { isInstallable, promptInstall } = usePWA()
  const { playClick, playHover } = useSound()
  const [mounted, setMounted] = useState(false)
  const [brandKitOpen, setBrandKitOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en'
    i18n.changeLanguage(newLang)
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'DexPDF',
          text: t('hero.subtitle', 'The best PDF tools'),
          url: window.location.href,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href)
        alert(t('nav.share_success', 'Link copied to clipboard!'))
      }
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm transition-all h-16">
        <div className="container mx-auto px-4 md:px-6 h-full flex justify-between items-center">

          {/* Brand */}
          <div
            className="cursor-pointer flex items-center gap-2 group"
            onClick={() => {
              playClick()
              router.push('/')
            }}
            onMouseEnter={playHover}
          >
            <div className="flex items-center justify-center text-red-600">
              <span className="font-black text-2xl tracking-tighter">DexPDF</span>
            </div>
            {/* Tagline for desktop */}
            <div className="hidden lg:block h-6 w-[1px] bg-slate-300 mx-2"></div>
            <span className="hidden lg:block text-slate-500 text-sm font-medium">Every tool you need for PDF</span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-4 items-center">
            {mounted && (
              <>
                <button
                  onClick={() => router.push('/merge')}
                  className="text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
                >
                  Merge PDF
                </button>
                <button
                  onClick={() => router.push('/split')}
                  className="text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
                >
                  Split PDF
                </button>
                <button
                  onClick={() => router.push('/compress')}
                  className="text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
                >
                  Compress PDF
                </button>

                <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

                <button
                  onClick={() => setBrandKitOpen(true)}
                  className="text-slate-500 hover:text-slate-800 transition-colors"
                  title="Brand Kit"
                >
                  <Building2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => router.push('/my-documents')}
                  className="text-slate-500 hover:text-slate-800 transition-colors"
                  title="My Documents"
                >
                  <FileText className="w-5 h-5" />
                </button>

                <ThemeToggle className="text-slate-500 hover:text-slate-800 transition-colors" />

                <button
                  onClick={toggleLanguage}
                  className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors uppercase"
                >
                  {i18n.language === 'en' ? 'ID' : 'EN'}
                </button>
              </>
            )}

            {isInstallable && (
              <button
                onClick={promptInstall}
                className="ml-2 bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-md shadow-red-600/20"
              >
                <Download className="w-4 h-4" />
                Desktop App
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-2 md:hidden animate-accordion-down z-50">
            <button onClick={() => router.push('/merge')} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-slate-700 font-bold hover:text-red-600">Merge PDF</button>
            <button onClick={() => router.push('/split')} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-slate-700 font-bold hover:text-red-600">Split PDF</button>
            <button onClick={() => router.push('/compress')} className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-slate-700 font-bold hover:text-red-600">Compress PDF</button>
            <div className="h-[1px] bg-slate-100 my-1"></div>
            <button
              onClick={() => {
                router.push('/my-documents')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-600"
            >
              My Documents
            </button>
          </div>
        )}
      </nav>

      <BrandKit isOpen={brandKitOpen} onClose={() => setBrandKitOpen(false)} />
    </>
  )
}
