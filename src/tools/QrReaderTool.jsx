import React, { useEffect, useRef, useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QrCode, Clipboard } from 'lucide-react'

export default function QrReaderTool() {
    const [scanResult, setScanResult] = useState(null)
    const scannerRef = useRef(null)

    useEffect(() => {
        // Prevent double init
        if (scannerRef.current) return

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        )

        scanner.render(onScanSuccess, onScanFailure)
        scannerRef.current = scanner

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5-qrcode scanner. ", error);
            })
            scannerRef.current = null
        }
    }, [])

    function onScanSuccess(decodedText, decodedResult) {
        setScanResult(decodedText)
    }

    function onScanFailure(error) {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    }

    return (
        <ToolLayout title="QR Code Reader" description="Scan QR codes from your webcam or image file.">
            <div className="max-w-2xl mx-auto space-y-8">

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                    <div id="reader" className="w-full"></div>
                </div>

                {scanResult && (
                    <div className="bg-green-50 p-6 rounded-3xl border border-green-200 text-center animate-pulse-once">
                        <div className="flex justify-center mb-4">
                            <QrCode className="w-12 h-12 text-green-600" />
                        </div>
                        <h3 className="font-bold text-green-800 text-lg mb-2">Scanned Content</h3>
                        <div className="p-4 bg-white rounded-xl border border-green-100 font-mono text-sm break-all text-slate-700 shadow-sm relative">
                            {scanResult}
                            <button
                                onClick={() => navigator.clipboard.writeText(scanResult)}
                                className="absolute top-2 right-2 p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-500"
                            >
                                <Clipboard className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-4 text-xs text-green-600 font-bold uppercase">Ready to scan next...</div>
                    </div>
                )}

            </div>
        </ToolLayout>
    )
}
