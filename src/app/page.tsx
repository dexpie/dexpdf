import type { Metadata } from 'next'
import Link from 'next/link'
import FAQ from '@/components/FAQ'
import HomeClient from '@/components/HomeClient'
import { TOOLS } from '@/config/tools'
import {
  getHomeStructuredData,
  HOME_FAQS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo'

const CORE_LINKS = ['merge', 'compress', 'pdf2word', 'protect', 'signature', 'qr-code', 'qr-reader']
const CATEGORY_SECTIONS = [
  {
    title: 'Do more than merge PDFs',
    description:
      'DexPDF is built for the full document loop: combine files, compress size, convert formats, protect sensitive pages, and get work out the door quickly.',
  },
  {
    title: 'Built for repeat workflows',
    description:
      'Instead of treating every tool like a dead end, DexPDF keeps discovery, shortcuts, QR tools, and recent work in one place so people can come back and move faster next time.',
  },
  {
    title: 'Local-first where it matters',
    description:
      'Many tools work right in the browser, which helps with privacy, perceived speed, and trust when handling contracts, invoices, scans, and personal files.',
  },
]

export const metadata: Metadata = {
  title: 'PDF Tools, QR Tools, and Local-First Document Workflows',
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  keywords: [
    'pdf tools',
    'merge pdf',
    'compress pdf',
    'pdf to word',
    'sign pdf',
    'qr code generator',
    'qr code reader',
    'local first pdf tools',
  ],
  openGraph: {
    title: `${SITE_NAME} | PDF Tools, QR Tools, and Local-First Workflows`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    title: `${SITE_NAME} | PDF Tools and QR Tools`,
    description: SITE_DESCRIPTION,
  },
}

export default function HomePage() {
  const coreTools = CORE_LINKS
    .map(id => TOOLS.find(tool => tool.id === id))
    .filter(Boolean)

  const structuredData = getHomeStructuredData()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <HomeClient />

      <section className="border-t border-border bg-card px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Why DexPDF</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-foreground md:text-4xl">
              One place for PDF work people actually repeat.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              DexPDF is not just a pile of utilities. It is a practical workspace for document jobs
              that show up every week: merge PDFs, shrink file sizes, convert to Word, protect
              client files, sign forms, and generate QR codes for campaigns or menus.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {CATEGORY_SECTIONS.map(section => (
              <div key={section.title} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <h3 className="text-lg font-black text-foreground">{section.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-500/20 dark:bg-blue-950/20">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <h3 className="text-2xl font-black text-foreground">Popular tools people come back for</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  These are the high-intent jobs that usually decide whether a document workspace
                  becomes a one-time visit or a daily habit.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {coreTools.map(tool => (
                <Link
                  key={tool.id}
                  href={tool.href || `/${tool.id}`}
                  className="rounded-2xl border border-white/70 bg-white px-4 py-4 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-background dark:text-foreground"
                >
                  <div>{tool.title}</div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">{tool.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FAQ faqs={HOME_FAQS} />
    </>
  )
}
