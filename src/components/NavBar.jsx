'use client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { usePWA } from '@/hooks/usePWA'
import { Share2, Download } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function NavBar() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { isInstallable, promptInstall } = usePWA()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
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
    <nav className="absolute top-0 left-0 w-full z-10 flex justify-between items-center px-6 py-4 bg-transparent">
      <div
        className="cursor-pointer font-bold text-2xl text-white flex items-center gap-2"
        onClick={() => router.push('/')}
      >
        <span>DexPDF</span>
      </div>

      <div className="flex gap-4 items-center">
        {mounted && (
          <>
            <ThemeToggle className="text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 border-none" />
            <button
              onClick={() => router.push('/my-documents')}
              className="bg-white/20 border-none text-white px-3 py-1.5 rounded-md cursor-pointer text-sm font-semibold backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              My Docs
            </button>
            <button
              onClick={toggleLanguage}
              className="bg-white/20 border-none text-white px-3 py-1.5 rounded-md cursor-pointer text-sm font-semibold backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              {i18n.language === 'en' ? 'ID' : 'EN'}
            </button>
          </>
        )}

        {isInstallable && (
          <button
            onClick={promptInstall}
            className="animate-bounce bg-blue-600 border-none text-white px-4 py-2 rounded-full cursor-pointer text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 ring-2 ring-white/50"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
        )}

        <button
          onClick={handleShare}
          className="bg-white border-none text-slate-900 px-3 py-1.5 rounded-md cursor-pointer text-sm font-semibold flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {mounted ? t('nav.share', 'Share') : 'Share'}
        </button>
      </div>
    </nav>
  )
}
