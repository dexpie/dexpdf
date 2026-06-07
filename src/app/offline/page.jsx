'use client'
import React from 'react'
import { WifiOff, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-border">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                    <WifiOff className="w-10 h-10" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">You are Offline</h1>
                <p className="text-muted-foreground mb-8">
                    Check your internet connection. Some features may still work if you have visited them before.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" /> Try Again
                    </button>
                    <Link href="/">
                        <button className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                            <Home className="w-4 h-4" /> Go to Home
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
