import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://dexpdf.vercel.app' // Replace with actual domain if known

    const tools = [
        'merge', 'split', 'compress', 'pdf2text', 'pdf2word',
        'imgs2pdf', 'pdf2imgs', 'annotate', 'edit', 'ocr',
        'pagenums', 'pdf2ppt', 'ppt2pdf', 'csv2pdf', 'signature',
        'watermark', 'pdf-info', 'extract-images', 'word2pdf',
        'organize', 'protect', 'unlock', 'smart-organize', 'redact', 'scrub',
        'excel2pdf', 'html2pdf'
    ]

    const toolUrls = tools.map((tool) => ({
        url: `${baseUrl}/${tool}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        ...toolUrls,
    ]
}
