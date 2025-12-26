import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--card)', padding: 18, marginTop: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', color: 'var(--muted)' }}>
        <small>
          {mounted
            ? t('footer.copyright', { year: new Date().getFullYear() })
            : `© ${new Date().getFullYear()} DEXPDF lightweight client-side PDF tools`
          }
        </small>
      </div>
    </footer>
  )
}
