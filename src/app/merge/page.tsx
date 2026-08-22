import type { Metadata } from 'next'
import Link from 'next/link'
import ToolPageClient from '@/components/ToolPageClient'
import {
  getAbsoluteUrl,
  getRelatedTools,
  getToolSeoCopy,
  getToolStructuredData,
  SITE_NAME,
} from '@/lib/seo'

const toolId = 'merge'
const seo = getToolSeoCopy(toolId)
const relatedTools = getRelatedTools(toolId)
const structuredData = getToolStructuredData(toolId)

export const metadata: Metadata = {
  title: seo?.title || 'Merge PDF Online',
  description: seo?.description || 'Combine multiple PDFs into one.',
  alternates: {
    canonical: getAbsoluteUrl('/merge'),
  },
  openGraph: {
    title: `Merge PDF - ${SITE_NAME}`,
    description: seo?.description || 'Combine multiple PDFs into one.',
    url: getAbsoluteUrl('/merge'),
  },
  twitter: {
    card: 'summary_large_image',
    title: `Merge PDF - ${SITE_NAME}`,
    description: seo?.description || 'Combine multiple PDFs into one.',
  },
}

export default function MergePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ToolPageClient toolId={toolId} />

      <section className="mx-auto mt-2 max-w-6xl px-4 pb-16">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">About this tool</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground md:text-3xl">Merge PDF</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                {seo?.intro}
              </p>

              <div className="mt-6 space-y-3">
                {seo?.benefits.map(benefit => (
                  <div key={benefit} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-500/20 dark:bg-blue-950/20">
                <p className="text-sm font-black text-foreground">How to use Merge PDF</p>
                <ol className="mt-4 space-y-3">
                  {seo?.steps.map((step, index) => (
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
