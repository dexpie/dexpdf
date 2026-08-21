import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="glass-subtle mt-0 border-x-0 border-b-0 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-sm font-black text-foreground">DexPDF</p>
          <small className="mt-1 block text-xs text-muted-foreground">
            {mounted
              ? t('footer.copyright', { year: new Date().getFullYear() })
              : `© ${new Date().getFullYear()} DexPDF. Browser-first PDF tools.`
            }
          </small>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-muted-foreground" aria-label="Footer">
          <Link href="/blog" className="transition hover:text-foreground">Guides</Link>
          <Link href="/privacy" className="transition hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms" className="transition hover:text-foreground">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  )
}
