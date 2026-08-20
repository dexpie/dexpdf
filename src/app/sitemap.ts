import { MetadataRoute } from 'next'
import { TOOLS } from '@/config/tools'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()

    const staticRoutes = [
        {
            url: SITE_URL,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${SITE_URL}/my-documents`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        },
        {
            url: `${SITE_URL}/offline`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.4,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: now,
            changeFrequency: 'yearly' as const,
            priority: 0.4,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: now,
            changeFrequency: 'yearly' as const,
            priority: 0.4,
        },
        {
            url: `${SITE_URL}/blog`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/blog/cara-compress-pdf-tanpa-kehilangan-kualitas`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
    ]

    const toolRoutes = TOOLS.map(tool => ({
        url: `${SITE_URL}${tool.href || `/${tool.id}`}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: tool.id === 'merge' || tool.id === 'compress' || tool.id === 'pdf2word' ? 0.9 : 0.8,
    }))

    return [...staticRoutes, ...toolRoutes]
}
