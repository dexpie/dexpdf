import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'PDF Guides and How-to Articles',
  description: 'Practical PDF how-to guides from DexPDF, linked to the tool that completes each workflow.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

const ARTICLES = [
  {
    href: '/blog/cara-compress-pdf-tanpa-kehilangan-kualitas',
    tag: 'Compress PDF · 5 menit',
    title: 'Cara Compress PDF Tanpa Kehilangan Kualitas',
    desc: 'Kenali kapan harus memilih kompresi ringan, sedang, atau agresif—dan kapan kualitas visual lebih penting daripada ukuran file.',
  },
  {
    href: '/blog/cara-menggabungkan-pdf-online',
    tag: 'Merge PDF · 4 menit',
    title: 'Cara Menggabungkan PDF Online (Gratis & Aman)',
    desc: 'Sertifikat, KTP, dan lamaran kerja terpisah-pisah? Gabungkan jadi satu dokumen rapi tanpa file Anda diunggah ke server.',
  },
  {
    href: '/blog/pdf-ke-word-tanpa-rusak-format',
    tag: 'PDF to Word · 5 menit',
    title: 'PDF ke Word Tanpa Format Berantakan',
    desc: 'Pilih mesin konversi yang mengelompokkan paragraf dengan benar dan meng-OCR halaman scan secara otomatis.',
  },
]

export default function BlogPage() {
  return (
    <main className="bg-background px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><BookOpen className="h-4 w-4" /> DexPDF Guides</div>
          <h1 className="mt-3 font-mono text-4xl font-bold tracking-tight text-foreground md:text-6xl">Jawaban praktis untuk pekerjaan PDF sehari-hari.</h1>
          <p className="mt-5 font-serif text-base leading-7 text-muted-foreground">Panduan singkat yang langsung ke praktik: jawab pertanyaannya, jelaskan trade-off-nya, lalu arahkan ke tool yang menyelesaikan pekerjaan.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ARTICLES.map(article => (
            <Link key={article.href} href={article.href} className="paper-card group flex flex-col p-6 transition hover:-translate-y-0.5 md:p-8">
              <span className="font-mono text-xs font-bold uppercase tracking-wide text-[#178A5E] dark:text-[#35D68E]">{article.tag}</span>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#1B2027] group-hover:text-[#1B2027]/70">{article.title}</h2>
              <p className="mt-3 flex-1 font-serif text-sm leading-6 text-[#1B2027]/65">{article.desc}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1B2027]">Baca artikel <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
