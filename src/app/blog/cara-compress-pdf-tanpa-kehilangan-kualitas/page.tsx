import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Cara Compress PDF Tanpa Kehilangan Kualitas',
  description: 'Panduan memilih tingkat kompresi PDF yang tepat tanpa membuat teks dan gambar sulit dibaca.',
  alternates: { canonical: `${SITE_URL}/blog/cara-compress-pdf-tanpa-kehilangan-kualitas` },
  keywords: ['cara compress pdf', 'kompres pdf tanpa kehilangan kualitas', 'perkecil ukuran pdf'],
}

export default function CompressPdfGuidePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cara Compress PDF Tanpa Kehilangan Kualitas',
    description: 'Panduan memilih tingkat kompresi PDF yang tepat tanpa membuat teks dan gambar sulit dibaca.',
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    datePublished: '2026-08-20',
    dateModified: '2026-08-20',
    mainEntityOfPage: `${SITE_URL}/blog/cara-compress-pdf-tanpa-kehilangan-kualitas`,
  }

  return (
    <main className="bg-background px-4 py-12 md:px-6 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Semua panduan</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-primary">PDF Guide · 5 menit</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-foreground md:text-6xl">Cara Compress PDF Tanpa Kehilangan Kualitas</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">Ukuran PDF terlalu besar untuk email atau upload? Kuncinya bukan selalu kompresi paling agresif, tetapi memilih level yang sesuai dengan tujuan file.</p>

        <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-500/20 dark:bg-blue-950/20">
          <p className="text-sm font-black text-foreground">Jawaban singkat</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Mulai dari kompresi ringan untuk kontrak dan dokumen dengan teks. Gunakan kompresi lebih tinggi untuk scan atau lampiran yang hanya perlu dibaca di layar. Selalu periksa hasil sebelum mengirim.</p>
          <Link href="/compress" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90">Coba Compress PDF <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
          <section><h2 className="text-2xl font-black text-foreground">1. Tentukan tujuan file</h2><p className="mt-3">Untuk email, targetkan file yang cukup kecil tanpa mengorbankan keterbacaan. Untuk arsip, kualitas gambar dan teks biasanya lebih penting daripada beberapa megabyte tambahan.</p></section>
          <section><h2 className="text-2xl font-black text-foreground">2. Pilih level kompresi</h2><div className="mt-4 space-y-3"><div className="rounded-2xl border border-border bg-card p-4"><strong className="text-foreground">Ringan</strong><p className="mt-1">Cocok untuk dokumen teks, kontrak, invoice, dan file yang sudah cukup kecil.</p></div><div className="rounded-2xl border border-border bg-card p-4"><strong className="text-foreground">Sedang</strong><p className="mt-1">Pilihan seimbang untuk scan dan dokumen kantor sehari-hari.</p></div><div className="rounded-2xl border border-border bg-card p-4"><strong className="text-foreground">Agresif</strong><p className="mt-1">Gunakan ketika batas upload ketat dan kualitas visual bukan prioritas utama.</p></div></div></section>
          <section><h2 className="text-2xl font-black text-foreground">3. Cek hasil sebelum dibagikan</h2><ul className="mt-4 space-y-3">{['Perbesar teks dan pastikan karakter tidak pecah.', 'Periksa gambar, stempel, tanda tangan, dan QR code.', 'Pastikan halaman tidak berubah orientasi atau terpotong.', 'Bandingkan ukuran file sebelum dan sesudah.'].map(item => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>)}</ul></section>
          <section><h2 className="text-2xl font-black text-foreground">Privasi saat compress PDF</h2><p className="mt-3">Compress PDF di DexPDF berjalan dengan badge <strong className="text-foreground">Local</strong>, sehingga file diproses di browser. Batas saat ini adalah 50 MB per file dan tidak ada limit harian free tier yang diberlakukan.</p></section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6"><Link href="/compress" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Buka Compress PDF <ArrowRight className="h-4 w-4" /></Link><Link href="/privacy" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground">Lihat Privacy Policy</Link></div>
      </article>
    </main>
  )
}

