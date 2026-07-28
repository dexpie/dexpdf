'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { AlertTriangle, CheckCircle2, Clipboard, ExternalLink, QrCode, RefreshCw } from 'lucide-react'
import ToolLayout from '../components/common/ToolLayout'

function getSafeUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

export default function QrReaderTool() {
  const [scanResult, setScanResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const scannerRef = useRef(null)
  const safeUrl = getSafeUrl(scanResult)

  useEffect(() => {
    if (scannerRef.current) return undefined

    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    }, false)

    scanner.render(
      decodedText => {
        setScanResult(decodedText)
        setError('')
      },
      () => {}
    )
    scannerRef.current = scanner

    return () => {
      scanner.clear().catch(() => {})
      scannerRef.current = null
    }
  }, [])

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(scanResult)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setError('Clipboard access was blocked. Select the decoded text and copy it manually.')
    }
  }

  return (
    <ToolLayout
      title="QR Code Reader"
      description="Scan QR codes from a camera or image file, then safely copy or open the decoded content."
      steps={[{ num: '1', label: 'Camera or image' }, { num: '2', label: 'Decode QR' }, { num: '3', label: 'Use result' }]}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="overflow-hidden rounded-3xl border border-border bg-background p-3 shadow-sm md:p-5">
          <div id="reader" className="w-full overflow-hidden rounded-2xl" />
        </div>

        {error && <div role="alert" className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="h-5 w-5 shrink-0" />{error}</div>}

        {!scanResult && (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-6 text-center">
            <RefreshCw className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-3 text-sm font-bold text-foreground">Waiting for a QR code</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Use the camera controls above or choose an image from the scanner.</p>
          </div>
        )}

        {scanResult && (
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600"><QrCode className="h-5 w-5" /></div>
              <div><h2 className="font-black text-foreground">QR decoded</h2><p className="text-xs text-muted-foreground">Review the content before opening links.</p></div>
            </div>

            <div className="mt-4 break-all rounded-2xl border border-border bg-card p-4 font-mono text-sm leading-6 text-foreground">{scanResult}</div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button onClick={copyResult} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}{copied ? 'Copied' : 'Copy result'}
              </button>
              {safeUrl && <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-black text-foreground hover:border-primary/30 hover:text-primary"><ExternalLink className="h-4 w-4" />Open link safely</a>}
              <button onClick={() => setScanResult('')} className="min-h-11 rounded-xl border border-border bg-card px-4 text-sm font-black text-muted-foreground hover:text-foreground">Clear result</button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
