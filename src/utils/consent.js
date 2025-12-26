const CONSENT_KEY = 'dexpdf:ad_consent'

export function getAdConsent() {
  try {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read consent', e)
    return null
  }
}

export function setAdConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(Boolean(value)))
  } catch (e) {
    console.error('Failed to set consent', e)
  }
}

export default { getAdConsent, setAdConsent }
