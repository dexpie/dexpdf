import Link from 'next/link'
import { FREE_TIER_LIMIT_COPY } from '@/config/toolMetadata'

const CLASSIFICATIONS = [
  {
    stamp: '100% Local',
    stampClass: 'text-[#178A5E] dark:text-[#35D68E]',
    title: 'Processed in your browser',
    desc: 'Local tools run entirely on this device — even offline. Your files are never uploaded to DexPDF.',
  },
  {
    stamp: 'Cloud opt-in',
    stampClass: 'text-[#8A6210] dark:text-[#E0A339]',
    title: 'Your choice, always disclosed',
    desc: 'A few conversions can use a cloud provider for higher fidelity. It only happens when you pick it, and the tool tells you first.',
  },
  {
    stamp: 'BYOK AI',
    stampClass: 'text-[#3D5A85] dark:text-[#6B8CBE]',
    title: 'AI with your own key',
    desc: 'AI tools use your own Gemini API key and talk straight to Google from your browser — never through our servers.',
  },
]

export default function TrustSection() {
  return (
    <section className="border-t border-border px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="boundary-label mb-3">Security classification</div>
        <h2 className="max-w-xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Know what happens to your file before you click.
        </h2>
        <p className="mt-4 max-w-2xl font-serif text-base leading-7 text-muted-foreground">
          Every tool carries a classification badge. Most are fully local; the few
          exceptions are clearly marked and always your decision.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {CLASSIFICATIONS.map(item => (
            <div key={item.stamp} className="glass relative rounded-lg p-6 pt-8">
              <span className={`stamp absolute -top-3 right-4 bg-background ${item.stampClass}`}>
                {item.stamp}
              </span>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 font-serif text-sm leading-6 text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
          <span>{FREE_TIER_LIMIT_COPY}</span>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Read the Privacy Policy
          </Link>
        </div>
      </div>
    </section>
  )
}
