import type { Metadata } from 'next'
import Link from 'next/link'
import { FileCheck2, ArrowLeft } from 'lucide-react'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for using DexPDF PDF, QR, Cloud, and AI tools.',
  alternates: { canonical: `${SITE_URL}/terms` },
}

export default function TermsPage() {
  return (
    <main className="bg-background px-4 py-12 md:px-6 md:py-20">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to DexPDF</Link>
        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600"><FileCheck2 className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Legal</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-foreground md:text-5xl">Terms of Service</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: 20 August 2026</p>
          </div>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
          <section><h2 className="text-xl font-black text-foreground">1. Acceptable use</h2><p className="mt-3">Use DexPDF only for lawful document work that you are authorized to perform. Do not use it to infringe rights, distribute malware, evade access controls, or process data in violation of an agreement or law.</p></section>
          <section><h2 className="text-xl font-black text-foreground">2. No guarantee of output</h2><p className="mt-3">PDF conversion, OCR, redaction, signing, and AI output can contain errors. Review every result before relying on it for legal, financial, employment, medical, archival, or other high-impact decisions.</p></section>
          <section><h2 className="text-xl font-black text-foreground">3. Local and provider-backed tools</h2><p className="mt-3">Local tools run on your device. Cloud, OCR, and AI tools may depend on third-party services, quotas, availability, and provider terms. Tool cards and detail pages identify the expected processing path.</p></section>
          <section><h2 className="text-xl font-black text-foreground">4. Free tier and limits</h2><p className="mt-3">The current public experience does not enforce a daily free-tier limit. Individual uploads are currently limited to 50 MB where file uploads are supported. The operator may introduce fair-use, rate, or paid limits later and will publish material changes before they apply.</p></section>
          <section><h2 className="text-xl font-black text-foreground">5. Intellectual property</h2><p className="mt-3">You retain rights to files you submit and results you create, subject to any third-party content or provider terms. DexPDF branding, code, and service materials remain the property of their respective owners.</p></section>
          <section><h2 className="text-xl font-black text-foreground">6. Changes and contact</h2><p className="mt-3">The service and these terms may change as tools and providers evolve. Continued use after an update means you accept the revised terms. Add the operator’s legal contact email before launch.</p></section>
        </div>

        <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 text-sm leading-6 text-blue-950 dark:border-blue-500/20 dark:bg-blue-950/20 dark:text-blue-100">This page is a product transparency baseline, not legal advice. Have local counsel review the final terms, especially if DexPDF will serve Indonesian users commercially.</div>
      </article>
    </main>
  )
}

