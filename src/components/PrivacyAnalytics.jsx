'use client'

import { useEffect } from 'react'

/**
 * Privacy-friendly analytics.
 * Loads the Cloudflare Web Analytics beacon ONLY when a token is configured,
 * so a self-hosted instance stays 100% silent by default. The beacon sets no
 * cookies and collects no document content — aggregate visits only.
 */
export default function PrivacyAnalytics() {
    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN
        if (!token || !token.trim()) return

        const script = document.createElement('script')
        script.defer = true
        script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
        script.dataset.cfBeacon = token.trim()
        document.head.appendChild(script)
    }, [])

    return null
}
