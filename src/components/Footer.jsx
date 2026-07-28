import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="mt-0 border-t border-border bg-card py-5">
      <div className="mx-auto max-w-[1100px] px-4 text-center">
        <small className="text-xs text-muted-foreground">
          {mounted
            ? t('footer.copyright', { year: new Date().getFullYear() })
            : `© ${new Date().getFullYear()} DexPDF. All rights reserved.`
          }
        </small>
      </div>
    </footer>
  )
}
