import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How DexPDF handles local, Cloud, OCR, and AI processing.',
  alternates: { canonical: `${SITE_URL}/privacy` },
}

export default function PrivacyPage() {
  return (
    <main className="bg-background px-4 py-12 md:px-6 md:py-20">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to DexPDF</Link>
        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Legal</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-foreground md:text-5xl">Privacy Policy</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: 20 August 2026</p>
          </div>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-xl font-black text-foreground">1. The short version</h2>
            <p className="mt-3">DexPDF is designed to process as much as possible in your browser. Every tool is labeled as Local, Cloud/AI, or Server so you can choose the right path for the document you are handling. We do not sell the files you process.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-foreground">2. Local processing</h2>
            <p className="mt-3">Tools marked <strong className="text-foreground">Local</strong> use browser APIs, JavaScript, WebAssembly, or workers on your device. The input file and generated result are not uploaded to DexPDF application servers for that action. Browser history, favorites, and similar preferences may be stored locally in your browser.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-foreground">3. Cloud, OCR, and AI processing</h2>
            <p className="mt-3">Some tools offer or require server processing. For example, Cloud conversion can send a DOCX, XLSX, PPTX, or PDF to the configured conversion provider; Cloud OCR sends the image or rendered page to the OCR provider; AI tools send the extracted text or prompt to the configured Gemini path. If you use your own provider/API key, that provider’s privacy policy also applies.</p>
            <p className="mt-3">Use Local mode for confidential files whenever it is available. The UI should show the relevant badge before processing begins.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-foreground">4. Retention policy</h2>
            <p className="mt-3">DexPDF does not intentionally persist processed files in its own application database or object storage after the response is delivered. The application proxies or streams the request and result where supported. Third-party providers may temporarily retain uploaded files, outputs, logs, or prompts under their own terms, technical configuration, and abuse-prevention policies. We do not claim a universal zero-retention guarantee for Cloud, OCR, or AI tools.</p>
            <p className="mt-3">Before enabling production Cloud/AI processing, the operator should confirm the provider’s retention settings, region, deletion behavior, and data-processing terms, then replace this paragraph with the exact provider-specific TTL if one is contractually guaranteed.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-foreground">5. Analytics and cookies</h2>
            <p className="mt-3">DexPDF may use privacy-conscious analytics after consent and configuration. Analytics should collect aggregate usage events rather than document contents. If analytics is not configured, DexPDF does not display made-up usage numbers.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-foreground">6. Security and contact</h2>
            <p className="mt-3">No online service can promise absolute security. Do not upload a file to a server-backed feature unless you are authorized to do so. Report security issues through the contact channel maintained by the DexPDF operator.</p>
          </section>
        </div>

        <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 text-sm leading-6 text-blue-950 dark:border-blue-500/20 dark:bg-blue-950/20 dark:text-blue-100">This page is a product transparency baseline, not legal advice. The operator should have local counsel review the final policy before relying on it for a commercial service.</div>
      </article>
    </main>
  )
}

