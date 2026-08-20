import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'PDF Guides and How-to Articles',
  description: 'Practical PDF how-to guides from DexPDF, linked to the tool that completes each workflow.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default function BlogPage() {
  return (
    <main className="bg-background px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><BookOpen className="h-4 w-4" /> DexPDF Guides</div>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-foreground md:text-6xl">Jawaban praktis untuk pekerjaan PDF sehari-hari.</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">Struktur blog ini dirancang untuk long-tail search: jawab pertanyaan, jelaskan trade-off, lalu arahkan pembaca ke tool yang relevan.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link href="/blog/cara-compress-pdf-tanpa-kehilangan-kualitas" className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md md:p-8">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-primary">Compress PDF · 5 min read</span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground group-hover:text-primary">Cara Compress PDF Tanpa Kehilangan Kualitas</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Kenali kapan harus memilih kompresi ringan, sedang, atau agresif—dan kapan kualitas visual lebih penting daripada ukuran file.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">Baca artikel <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
          </Link>
          <div className="rounded-3xl border border-dashed border-border bg-card p-6 md:p-8">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Planned cluster</span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground">Cara Menggabungkan PDF untuk Lamaran Kerja</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Target query: gabung PDF, merge PDF lamaran, urutkan dokumen lamaran. Arahkan ke Merge PDF dan Organize Pages.</p>
            <p className="mt-6 text-sm font-bold text-muted-foreground">Belum dipublikasikan</p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-blue-100 bg-blue-50/70 p-6 text-sm leading-6 text-blue-950 dark:border-blue-500/20 dark:bg-blue-950/20 dark:text-blue-100">
          <strong>Implementasi SEO:</strong> setiap artikel nantinya memiliki metadata canonical, Article JSON-LD, daftar isi, FAQ khusus query, internal link ke tool, dan tanggal pembaruan yang nyata.
        </div>
      </div>
    </main>
  )
}

