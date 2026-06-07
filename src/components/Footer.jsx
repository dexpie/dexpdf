import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="border-t border-border bg-card py-5 mt-0">
      <div className="max-w-[1100px] mx-auto px-4 text-center">
        <small className="text-muted-foreground text-xs">
          {mounted
            ? t('footer.copyright', { year: new Date().getFullYear() })
            : `© ${new Date().getFullYear()} DexPDF. All rights reserved.`
          }
        </small>
      </div>
    </footer>
  )
}