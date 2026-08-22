import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Cara Menggabungkan PDF Online (Gratis & Aman)',
  description: 'Langkah menggabungkan beberapa file PDF jadi satu dokumen rapi — dari urutan halaman sampai privasi file lamaran kerja Anda.',
  alternates: { canonical: `${SITE_URL}/blog/cara-menggabungkan-pdf-online` },
  keywords: ['cara gabung pdf', 'menggabungkan pdf online', 'merge pdf gratis', 'gabung file pdf jadi satu'],
}

export default function MergePdfGuidePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cara Menggabungkan PDF Online (Gratis & Aman)',
    description: 'Langkah menggabungkan beberapa file PDF jadi satu dokumen rapi — dari urutan halaman sampai privasi file lamaran kerja Anda.',
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    datePublished: '2026-08-22',
    dateModified: '2026-08-22',
    mainEntityOfPage: `${SITE_URL}/blog/cara-menggabungkan-pdf-online`,
  }

  return (
    <main className="bg-background px-4 py-12 md:px-6 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Semua panduan</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-primary">PDF Guide · 4 menit</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-foreground md:text-6xl">Cara Menggabungkan PDF Online</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">Sertifikat, KTP, portofolio, dan surat lamaran terpisah-pisah? Gabungkan jadi satu PDF rapi sebelum dikirim — tanpa instal aplikasi dan tanpa file Anda diunggah ke server.</p>

        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="text-sm font-bold text-foreground">Jawaban singkat</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Buka Merge PDF, seret semua file sekaligus, atur urutannya, klik merge, unduh. Di DexPDF prosesnya berjalan di browser Anda sendiri, jadi dokumen sensitif tidak pernah dikirim ke mana pun.</p>
          <Link href="/merge" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">Coba Merge PDF <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground">1. Siapkan file dalam urutan logis</h2>
            <p className="mt-3">Sebelum menggabungkan, putuskan urutannya. Untuk lamaran kerja standar Indonesia urutan yang umum:</p>
            <ol className="mt-4 space-y-2">
              {['Surat lamaran', 'Daftar riwayat hidup (CV)', 'Ijazah & transkrip', 'Sertifikat pendukung', 'KTP / dokumen identitas'].map((item, i) => (
                <li key={item} className="flex gap-3"><span className="font-mono text-xs font-bold text-primary">{i + 1}.</span>{item}</li>
              ))}
            </ol>
            <p className="mt-3">Kalau salah satu file masih foto hasil scan, rapikan dulu orientasinya lewat tool Rotate PDF supaya hasilnya tidak menyamping.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">2. Gabungkan dengan drag & drop</h2>
            <p className="mt-3">Di halaman Merge PDF, seret seluruh file sekaligus ke dropzone — tidak perlu satu per satu. Setelah masuk, tahan dan geser untuk memindahkan urutan bila perlu, lalu tekan merge. Hasilnya bisa langsung diunduh sebagai satu file.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">3. Rapikan halamannya bila perlu</h2>
            <p className="mt-3">Hasil gabungan kadang punya halaman kosong atau duplikat scan. Gunakan Organize Pages untuk membuang, menambah, atau menukar halaman tertentu tanpa mengulang proses merge dari awal.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">Kenapa "gratis" bisa aman?</h2>
            <p className="mt-3">Kebanyakan situs penggabung PDF bekerja seperti fotokopian: file Anda diunggah ke komputer mereka, diproses, lalu Anda percaya mereka menghapusnya. DexPDF beda — engine merge berjalan di browser Anda (WebAssembly), sehingga file besar sekalipun tidak pernah meninggalkan perangkat. Bekerja offline pun tetap bisa.</p>
            <ul className="mt-4 space-y-2">
              {['Tidak ada upload untuk mode Local', 'Tanpa akun, tanpa watermark', 'Batas 50 MB per file, tanpa limit harian'].map(item => (
                <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
          <Link href="/merge" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Gabungkan PDF sekarang <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/organize" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground">Rapikan halaman</Link>
        </div>
      </article>
    </main>
  )
}
