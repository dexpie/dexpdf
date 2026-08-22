import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Cara Tanda Tangan PDF Online (Tanpa Print-Scan)',
  description: 'Langkah menandatangani dokumen PDF langsung dari browser: gambar tanda tangan, atur posisi, simpan — tanpa mencetak dan tanpa upload.',
  alternates: { canonical: `${SITE_URL}/blog/cara-tanda-tangan-pdf-online` },
  keywords: ['cara tanda tangan pdf', 'sign pdf online', 'tanda tangan elektronik pdf', 'ttd digital dokumen'],
}

export default function SignPdfGuidePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cara Tanda Tangan PDF Online (Tanpa Print-Scan)',
    description: 'Langkah menandatangani dokumen PDF langsung dari browser: gambar tanda tangan, atur posisi, simpan — tanpa mencetak dan tanpa upload.',
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    datePublished: '2026-08-22',
    dateModified: '2026-08-22',
    mainEntityOfPage: `${SITE_URL}/blog/cara-tanda-tangan-pdf-online`,
  }

  return (
    <main className="bg-background px-4 py-12 md:px-6 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Semua panduan</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-primary">PDF Guide · 3 menit</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-foreground md:text-6xl">Tanda Tangan PDF Tanpa Print-Scan</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">Ritual lama: print kontrak, tanda tangan pakai pulpen, scan lagi, kirim. Ada cara yang lebih cepat — dan filenya tetap di perangkat Anda.</p>

        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="text-sm font-bold text-foreground">Jawaban singkat</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Buka Sign PDF, gambar atau unggah tanda tangan Anda sekali, tempatkan di halaman yang tepat, lalu unduh. Proses terjadi di browser — dokumen kontrak tidak diunggah ke server siapa pun.</p>
          <Link href="/signature" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">Tandatangani PDF sekarang <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground">1. Siapkan tanda tangan Anda</h2>
            <p className="mt-3">Dua cara: gambar langsung dengan mouse/jari/stylus di canvas, atau foto tanda tangan di kertas putih lalu unggah sebagai gambar. Simpan sekali — bisa dipakai ulang untuk dokumen berikutnya selama sesi berlangsung.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">2. Tempatkan dan sesuaikan</h2>
            <p className="mt-3">Geser tanda tangan ke posisi yang benar, atur ukurannya supaya proporsional dengan baris tanda tangan. Untuk dokumen multi-halaman seperti kontrak, letakkan di setiap halaman yang memerlukan paraf.</p>
            <ul className="mt-4 space-y-2">
              {['Ukuran proporsional dengan garis paraf', 'Hindari menutupi teks penting atau nomor halaman', 'Untuk dokumen resmi, tambahkan tanggal di dekat tanda tangan'].map(item => (
                <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">3. Kunci hasilnya</h2>
            <p className="mt-3">Sebelum dibagikan, flatten dokumen lewat tool Flatten PDF agar gambar tanda tangan menyatu permanen dengan halaman — tidak bisa digeser atau dihapus orang lain. Ingin perlindungan lebih? Kunci file dengan Protect PDF menggunakan password.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">Apakah sah secara hukum?</h2>
            <p className="mt-3">Di Indonesia, UU ITE mengakui tanda tangan elektronik. Untuk transaksi umum (perjanjian kerja, surat jalan, MoU internal), tanda tangan elektronik biasanya cukup. Untuk akta otentik tertentu (misalnya jual beli tanah) tetap diperlukan tanda tangan basah di hadapan pejabat. Sesuaikan dengan kebutuhan hukum dokumen Anda.</p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
          <Link href="/signature" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Buka Sign PDF <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/flatten" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground">Kunci dengan Flatten</Link>
          <Link href="/protect" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground">Protect dengan password</Link>
        </div>
      </article>
    </main>
  )
}
