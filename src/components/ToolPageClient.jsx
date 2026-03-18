'use client'
import React from 'react'
import ToolContainer from './tools/ToolContainer'

export default function ToolPageClient({ toolId }) {
    return (
        <ToolContainer
            toolId={toolId}
            onClose={() => window.location.href = '/'}
        />
    )
}
