import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'PDF ke Word Tanpa Format Berantakan',
  description: 'Cara mengubah PDF jadi Word yang bisa diedit tanpa paragraf berantakan — pilih mode yang tepat untuk dokumen teks maupun hasil scan.',
  alternates: { canonical: `${SITE_URL}/blog/pdf-ke-word-tanpa-rusak-format` },
  keywords: ['pdf ke word', 'convert pdf ke word', 'ubah pdf jadi docx', 'pdf to word gratis'],
}

export default function PdfToWordGuidePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'PDF ke Word Tanpa Format Berantakan',
    description: 'Cara mengubah PDF jadi Word yang bisa diedit tanpa paragraf berantakan — pilih mode yang tepat untuk dokumen teks maupun hasil scan.',
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    datePublished: '2026-08-22',
    dateModified: '2026-08-22',
    mainEntityOfPage: `${SITE_URL}/blog/pdf-ke-word-tanpa-rusak-format`,
  }

  return (
    <main className="bg-background px-4 py-12 md:px-6 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Semua panduan</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-primary">PDF Guide · 5 menit</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-foreground md:text-6xl">PDF ke Word Tanpa Format Berantakan</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">Hasil convert PDF ke Word sering pecah: satu kalimat terpotong jadi sepuluh baris, spasi kacau, teks scan tidak terbaca. Masalahnya bukan file Anda — tapi mesin konversinya.</p>

        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="text-sm font-bold text-foreground">Jawaban singkat</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">PDF berisi dua dunia berbeda: dokumen dengan tekt asli (selectable) dan hasil scan (gambar). Gunakan mode konversi yang mendeteksi keduanya secara otomatis — teks diambil apa adanya, halaman gambar di-OCR dulu. DexPDF melakukan ini lokal di browser Anda.</p>
          <Link href="/pdf2word" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">Convert PDF ke Word <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground">Kenapa hasil konversi sering berantakan?</h2>
            <p className="mt-3">PDF menyimpan posisi setiap huruf sebagai koordinat di kanvas — ia tidak tahu mana judul, mana paragraf. Konverter murahan hanya menyalin urutan huruf itu ke Word. Yang perlu terjadi adalah pengelompokan cerdas:</p>
            <ul className="mt-4 space-y-2">
              {['Baris yang tersambung digabung jadi satu paragraf utuh.', 'Kata yang terpotong tanda hubung di akhir baris disambung otomatis.', 'Poin bernomor dan bullet dipertahankan sebagai daftar.', 'Halaman hasil scan dibaca OCR sebelum dikonversi.'].map(item => (
                <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">Langkah konversi di DexPDF</h2>
            <ol className="mt-4 space-y-3">
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">1</span>Buka PDF to Word dan seret file Anda.</li>
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">2</span>Mode <strong className="text-foreground">Smart OCR Local</strong> aktif secara default — teks asli langsung diekstrak, halaman scan di-OCR otomatis.</li>
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">3</span>Pilih bahasa dokumen bila hasilnya scan (Indonesia / English).</li>
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">4</span>Klik convert, unduh file .docx, edit bebas di Microsoft Word atau Google Docs.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">Kapan butuh mode cloud?</h2>
            <p className="mt-3">Untuk dokumen visual rumit — sertifikat, brosur, layout majalah — ada opsi Cloud opt-in yang menjaga elemen grafis tetap di posisinya. Mode ini eksplisit: Anda memilih sendiri, dengan peringatan bahwa file akan diunggah ke provider. Untuk dokumen kerja biasa, mode lokal sudah lebih dari cukup dan filenya tidak keluar dari perangkat.</p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
          <Link href="/pdf2word" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Convert PDF ke Word <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground">Bagaimana proses lokalisnya bekerja</Link>
        </div>
      </article>
    </main>
  )
}
