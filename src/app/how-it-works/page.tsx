import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CloudOff, FileCheck, Laptop, Lock, ShieldCheck } from 'lucide-react'
import { getAbsoluteUrl, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'How DexPDF keeps your files 100% local',
  description:
    'A plain-language walkthrough of what happens when you open a file in DexPDF: where it is processed, what never leaves your device, and the few clearly-labeled exceptions.',
  alternates: { canonical: getAbsoluteUrl('/how-it-works') },
}

const STEPS = [
  {
    icon: Laptop,
    title: '1. The app loads once, on your device',
    desc: 'Opening a tool downloads a small web app into your browser. After that it keeps working offline — the processing code runs next to your file, not on a server.',
  },
  {
    icon: FileCheck,
    title: '2. Your file is read in browser memory',
    desc: 'Merging, splitting, compressing, signing, OCR — the engine opens your document inside the page you are looking at. Close the tab and the working copy is gone.',
  },
  {
    icon: Lock,
    title: '3. The result is built locally and saved by you',
    desc: 'The output file is generated on your device and handed to you as a direct download. No queue, no processing bucket, no copy left behind.',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="vault-dots border-b border-border px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="boundary-label mb-4">How local works</div>
          <h1 className="max-w-2xl font-mono text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl">
            Your files never leave <span className="text-primary">the building.</span>
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-lg leading-8 text-muted-foreground">
            Most PDF websites work like a photocopy shop: you hand over your
            document, a stranger&apos;s machine processes it, and you trust them to
            forget it. DexPDF works differently — here is exactly what happens.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-4xl space-y-5">
          {STEPS.map(step => (
            <div key={step.title} className="glass flex flex-col gap-4 rounded-xl p-6 sm:flex-row sm:items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{step.title}</h2>
                <p className="mt-1.5 font-serif text-sm leading-6 text-muted-foreground md:text-base">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="boundary-label mb-6">The honest exceptions</div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass rounded-xl p-6">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">100% Local</h3>
              <p className="mt-2 font-serif text-sm leading-6 text-muted-foreground">
                Merge, split, compress, sign, redact, QR tools, and more run entirely in your browser.
                Works offline too.
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <CloudOff className="h-6 w-6 text-[#E0A339]" />
              <h3 className="mt-3 font-semibold text-foreground">Cloud opt-in</h3>
              <p className="mt-2 font-serif text-sm leading-6 text-muted-foreground">
                A few conversions (like exact-layout DOCX) can borrow a cloud provider for higher fidelity.
                Only when you explicitly pick it — the tool warns you before anything uploads.
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <Lock className="h-6 w-6 text-[#6B8CBE]" />
              <h3 className="mt-3 font-semibold text-foreground">BYOK AI</h3>
              <p className="mt-2 font-serif text-sm leading-6 text-muted-foreground">
                AI features use your own Gemini API key. Requests go from your browser straight to Google — never through DexPDF servers.
              </p>
            </div>
          </div>

          <p className="mt-10 font-mono text-xs leading-6 text-muted-foreground">
            $ upload_required: false&nbsp;&nbsp;·&nbsp;&nbsp;files_transmitted: 0&nbsp;&nbsp;·&nbsp;&nbsp;processed_on: this_device
          </p>

          <Link
            href="/"
            className="mt-10 inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            Try a local tool now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
