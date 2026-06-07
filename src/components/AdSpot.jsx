import React from 'react'

export default function AdSpot({ image, href, alt = 'Advertisement', children }) {
    if (!image && !children) return null

    const inner = image ? (
        <img className="w-full h-auto rounded-xl shadow-md border border-border hover:opacity-95 transition-opacity" src={image} alt={alt} />
    ) : (
        <div className="w-full h-32 bg-secondary rounded-xl border border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
            {children || 'Sponsored Content'}
        </div>
    )

    return (
        <div className="w-full max-w-4xl mx-auto my-8 px-4" role="region" aria-label="Advertisement">
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                    {inner}
                </a>
            ) : (
                inner
            )}
        </div>
    )
}
