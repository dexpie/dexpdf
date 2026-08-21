import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import FAQ from '@/components/FAQ'
import HomeClient from '@/components/HomeClient'
import TrustSection from '@/components/TrustSection'
import {
  getHomeStructuredData,
  HOME_FAQS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo'

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
  const structuredData = getHomeStructuredData()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <HomeClient />

      <TrustSection />

      <section className="border-t border-border bg-background px-4 py-14 md:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/blog/cara-compress-pdf-tanpa-kehilangan-kualitas"
            className="glass group flex flex-col gap-4 rounded-lg p-6 transition hover:border-primary/40 md:flex-row md:items-center md:gap-6"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="boundary-label">Guide · 5 min read</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary md:text-xl">
                Cara Compress PDF Tanpa Kehilangan Kualitas
              </h2>
              <p className="mt-1 font-serif text-sm text-muted-foreground">Pilih level kompresi yang tepat dan pahami trade-off kualitasnya.</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary">
              Baca panduan
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
          <div className="mt-4 text-center">
            <Link href="/blog" className="text-sm font-semibold text-muted-foreground transition hover:text-primary">
              Semua artikel →
            </Link>
          </div>
        </div>
      </section>

      <FAQ faqs={HOME_FAQS} />
    </>
  )
}
