'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import ToolContainer from '@/components/tools/ToolContainer'

export default function ToolPageClient({ toolId }) {
    const router = useRouter()

    return (
        <ToolContainer
            toolId={toolId}
            onClose={() => router.push('/')}
        />
    )
}
