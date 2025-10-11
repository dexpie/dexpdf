import React from 'react'
import { getAdConsent, setAdConsent } from '../utils/consent'

export default function ConsentBanner({ onChange }) {
  const handle = (val) => {
    setAdConsent(val)
    if (onChange) onChange(val)
  }

  const current = getAdConsent()
  if (current !== null) return null

  return (
    <div className="consent-banner" role="dialog" aria-live="polite">
      <div className="consent-inner">
        <div className="consent-text">
          We use ads to support this site. By clicking "Accept" you agree to show non-intrusive ads. You can decline to hide ads.
        </div>
        <div className="consent-actions">
          <button className="consent-decline" onClick={() => handle(false)}>Decline</button>
          <button className="consent-accept" onClick={() => handle(true)}>Accept</button>
        </div>
      </div>
    </div>
  )
}
