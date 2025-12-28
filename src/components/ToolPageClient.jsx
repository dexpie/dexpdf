'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import ToolContainer from './tools/ToolContainer'

export default function ToolPageClient({ toolId }) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <button
                    onClick={() => router.push('/')}
                    className="mb-6 text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors"
                >
                    <span>←</span> Back to All Tools
                </button>

                <ToolContainer
                    toolId={toolId}
                    onClose={() => router.push('/')}
                />
            </div>
        </div>
    )
}
