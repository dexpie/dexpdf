import Link from 'next/link'
import { Quote, ShieldCheck, Star, BarChart3 } from 'lucide-react'
import { FREE_TIER_LIMIT_COPY } from '@/config/toolMetadata'

const TESTIMONIAL_PLACEHOLDERS = [
  {
    quote: '“Tempatkan testimonial pengguna terverifikasi di sini setelah feedback mulai terkumpul.”',
    name: 'Placeholder testimonial',
    role: 'Ganti dengan nama/role nyata',
  },
  {
    quote: '“Tambahkan rating dari sumber yang bisa ditautkan, bukan angka buatan.”',
    name: 'Placeholder rating',
    role: 'Misalnya review publik atau survei internal',
  },
  {
    quote: '“Social proof yang jujur lebih kuat daripada klaim besar yang tidak bisa dicek.”',
    name: 'Placeholder customer story',
    role: 'Tambahkan studi kasus setelah tersedia',
  },
]

function UsageStats() {
  const stats = [
    process.env.NEXT_PUBLIC_FILES_PROCESSED && { label: 'Files processed', value: process.env.NEXT_PUBLIC_FILES_PROCESSED },
    process.env.NEXT_PUBLIC_ACTIVE_USERS && { label: 'Active users', value: process.env.NEXT_PUBLIC_ACTIVE_USERS },
  ].filter(Boolean)

  if (stats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-black text-foreground">Usage stats belum ditampilkan</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Analytics belum menyediakan angka publik yang terverifikasi. Set env `NEXT_PUBLIC_FILES_PROCESSED` atau `NEXT_PUBLIC_ACTIVE_USERS` saat data siap.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {stats.map(stat => (
        <div key={stat.label} className="rounded-2xl border border-border bg-background p-4">
          <p className="text-2xl font-black tracking-tight text-foreground">{stat.value}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

export default function TrustSection() {
  return (
    <section className="border-t border-border bg-background px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-500/20 dark:bg-blue-950/20 md:p-8">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="h-4 w-4" />
              Trust, privacy, and limits
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-foreground md:text-4xl">Know what happens to your file before you click.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">Local tools stay in the browser. Tools that can use Cloud, OCR, or AI show a second badge and explain when data leaves the device.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 dark:border-emerald-500/20 dark:bg-background/60">
                <p className="text-sm font-black text-foreground">Local</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Browser/WASM processing. No upload to DexPDF.</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white/80 p-4 dark:border-amber-500/20 dark:bg-background/60">
                <p className="text-sm font-black text-foreground">Cloud / AI</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Optional or required provider processing is disclosed.</p>
              </div>
              <div className="rounded-2xl border border-border bg-white/80 p-4 dark:bg-background/60">
                <p className="text-sm font-black text-foreground">50 MB</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Current maximum file size per upload.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{FREE_TIER_LIMIT_COPY}</span>
              <Link href="/privacy" className="font-bold text-primary hover:underline">Baca Privacy Policy</Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <BarChart3 className="h-4 w-4" />
              Transparent proof
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground">Bukti penggunaan akan ditampilkan saat datanya siap.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Kami tidak mengarang jumlah file atau user aktif. Hubungkan analytics yang sudah disetujui, lalu tampilkan snapshot periodik dengan tanggal pembaruan.</p>
            <div className="mt-5"><UsageStats /></div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><Star className="h-4 w-4 fill-current" /> Testimonials</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Social proof section siap diisi feedback nyata.</h2>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Placeholder — jangan dipublikasikan sebagai review nyata</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIAL_PLACEHOLDERS.map(testimonial => (
              <article key={testimonial.name} className="rounded-2xl border border-dashed border-border bg-card p-5">
                <Quote className="h-5 w-5 text-primary/60" />
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{testimonial.quote}</p>
                <p className="mt-5 text-sm font-black text-foreground">{testimonial.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{testimonial.role}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

