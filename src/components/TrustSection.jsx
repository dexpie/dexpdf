import Link from 'next/link'
import { ShieldCheck, Cloud, KeyRound, Laptop } from 'lucide-react'
import { FREE_TIER_LIMIT_COPY } from '@/config/toolMetadata'

export default function TrustSection() {
  return (
    <section className="border-t border-border bg-background px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-500/20 dark:bg-blue-950/20 md:p-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="h-4 w-4" />
            Trust, privacy, and limits
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-foreground md:text-4xl">Know what happens to your file before you click.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">Every tool shows exactly how it processes your file. Most tools run 100% on your device — the file never leaves the browser. The few exceptions are clearly labeled and always your choice.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 dark:border-emerald-500/20 dark:bg-background/60">
              <Laptop className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              <p className="mt-2 text-sm font-black text-foreground">100% Local</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Processing runs entirely in your browser. Nothing is uploaded — works offline too.</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white/80 p-4 dark:border-amber-500/20 dark:bg-background/60">
              <Cloud className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              <p className="mt-2 text-sm font-black text-foreground">Cloud opt-in</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">A few conversions can use a cloud provider for higher fidelity — only if you pick it.</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white/80 p-4 dark:border-blue-500/20 dark:bg-background/60">
              <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              <p className="mt-2 text-sm font-black text-foreground">BYOK AI</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">AI tools use your own Gemini key and talk straight to Google, never through our servers.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{FREE_TIER_LIMIT_COPY}</span>
            <Link href="/privacy" className="font-bold text-primary hover:underline">Baca Privacy Policy</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
