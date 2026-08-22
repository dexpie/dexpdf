import { TOOLS } from '@/config/tools'
import ToolPageClient from '@/components/ToolPageClient'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    getAbsoluteUrl,
    getRelatedTools,
    getToolSeoCopy,
    getToolStructuredData,
    SITE_NAME,
} from '@/lib/seo'

export function generateStaticParams() {
    return TOOLS.map(tool => ({ toolId: tool.id }))
}

export async function generateMetadata({ params }) {
    const tool = TOOLS.find(x => x.id === params.toolId)
    const seo = getToolSeoCopy(params.toolId)

    if (!tool) {
        return {
            title: `${params.toolId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - DexPDF`,
            description: 'Free online PDF tool',
            robots: {
                index: false,
                follow: false,
            },
        }
    }

    return {
        title: seo?.title || `${tool.title} - DexPDF`,
        description: seo?.description || tool.description,
        keywords: seo?.keywords || [tool.title.toLowerCase(), 'pdf tools', 'dexpdf'],
        alternates: {
            canonical: getAbsoluteUrl(tool.href || `/${tool.id}`),
        },
        openGraph: {
            title: `${tool.title} - ${SITE_NAME}`,
            description: seo?.description || tool.description,
            url: getAbsoluteUrl(tool.href || `/${tool.id}`),
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${tool.title} - ${SITE_NAME}`,
            description: seo?.description || tool.description,
        },
    }
}

export default function Page({ params }) {
    const tool = TOOLS.find(x => x.id === params.toolId)
    const seo = getToolSeoCopy(params.toolId)

    if (!tool || !seo) {
        notFound()
    }

    const relatedTools = getRelatedTools(params.toolId)
    const structuredData = getToolStructuredData(params.toolId)

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <ToolPageClient toolId={params.toolId} />

            <section className="mx-auto mt-2 max-w-6xl px-4 pb-16">
                <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8">
                    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">About this tool</p>
                            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground md:text-3xl">{tool.title}</h2>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                                {seo.intro}
                            </p>

                            <div className="mt-6 space-y-3">
                                {seo.benefits.map(benefit => (
                                    <div key={benefit} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-500/20 dark:bg-blue-950/20">
                                <p className="text-sm font-black text-foreground">How to use {tool.title}</p>
                                <ol className="mt-4 space-y-3">
                                    {seo.steps.map((step, index) => (
                                        <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                                                {index + 1}
                                            </span>
                                            <span className="pt-1">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {relatedTools.length > 0 && (
                                <div className="mt-5 rounded-3xl border border-border bg-background p-5">
                                    <p className="text-sm font-black text-foreground">Related tools</p>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        {relatedTools.map(related => (
                                            <Link
                                                key={related.id}
                                                href={related.href || `/${related.id}`}
                                                className="rounded-2xl border border-border bg-card px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
                                            >
                                                <div className="font-bold text-foreground">{related.title}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">{related.description}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
