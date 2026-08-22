import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Cara Membuka PDF Terkunci / Menghapus Password PDF',
  description: 'Punya password PDF sendiri tapi beratik masuk terus? Hapus proteksinya sekali saja supaya file terbuka langsung — diproses lokal di browser.',
  alternates: { canonical: `${SITE_URL}/blog/cara-membuka-pdf-terkunci` },
  keywords: ['cara buka pdf terkunci', 'menghapus password pdf', 'unlock pdf online', 'buka pdf yang dipassword'],
}

export default function UnlockPdfGuidePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cara Membuka PDF Terkunci / Menghapus Password PDF',
    description: 'Punya password PDF sendiri tapi beratik masuk terus? Hapus proteksinya sekali saja supaya file terbuka langsung — diproses lokal di browser.',
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    datePublished: '2026-08-22',
    dateModified: '2026-08-22',
    mainEntityOfPage: `${SITE_URL}/blog/cara-membuka-pdf-terkunci`,
  }

  return (
    <main className="bg-background px-4 py-12 md:px-6 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Semua panduan</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-primary">PDF Guide · 3 menit</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-foreground md:text-6xl">Membuka PDF Terkunci (Menghapus Password)</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">File lama kantor masih dipassword, tiap kali dibuka harus ketik dulu? Kalau Anda tahu passwordnya, proteksi bisa dihapus sekali saja selamanya.</p>

        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="text-sm font-bold text-foreground">Jawaban singkat</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Buka Unlock PDF, masukkan file, ketik password yang Anda miliki, unduh hasilnya — kini terbuka tanpa password. Prosesnya lokal di browser; file tidak pernah dikirim ke server mana pun.</p>
          <Link href="/unlock" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">Buka Unlock PDF <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground">Yang bisa dan tidak bisa dilakukan</h2>
            <p className="mt-3">Penting dipahami dengan jujur:</p>
            <ul className="mt-4 space-y-2">
              {['Bisa: menghapus password dari file yang Anda TAHU passwordnya.', 'Bisa: membuka file kantor/pribadi Anda sendiri yang proteksinya merepotkan.', 'Tidak bisa: menerka atau mem-crack password yang hilang — itu tidak kami sediakan, dan jangan percaya situs yang mengklaim bisa.'].map(item => (
                <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">Langkah-langkah</h2>
            <ol className="mt-4 space-y-3">
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">1</span>Buka halaman Unlock PDF dan seret filenya.</li>
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">2</span>Masukkan password yang sudah Anda miliki.</li>
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">3</span>Unduh versi baru yang tidak lagi meminta password.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">Kenapa lebih aman di sini?</h2>
            <p className="mt-3">Dokumen yang cukup sensitif untuk diberi password biasanya juga sensitif untuk diunggah ke situs acak. Di DexPDF, pembukaan proteksi terjadi di browser Anda sendiri — password dan isi file tidak pernah meninggalkan perangkat, dan tidak ada log yang tersimpan setelah tab ditutup.</p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
          <Link href="/unlock" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Buka Unlock PDF <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/protect" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground">Pasang password baru</Link>
          <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground">Cara proses lokal bekerja</Link>
        </div>
      </article>
    </main>
  )
}
