import React from 'react'

// Simple configurable ad spot component.
// Props:
// - image: src for an image banner
// - href: optional link
// - alt: alt text
// - children: fallback HTML (e.g., text)
export default function AdSpot({ image, href, alt = 'Advertisement', children }) {
    const inner = image ? (
        <img className="ad-spot-img" src={image} alt={alt} />
    ) : (
        <div className="ad-spot-fallback">{children || 'Your ad here'}</div>
    )

    return (
        <div className="ad-spot" role="region" aria-label="Advertisement">
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer">
                    {inner}
                </a>
            ) : (
                inner
            )}
        </div>
    )
}
