export const TOOL_DISCOVERY = {
  merge: {
    aliases: ['gabung pdf', 'satukan pdf', 'combine pdf', 'join pdf', 'merge file', 'gabung dokumen'],
    badges: ['Popular', 'Local'],
  },
  split: {
    aliases: ['pisah pdf', 'pecah pdf', 'ambil halaman', 'extract pages', 'page range'],
    badges: ['Local'],
  },
  compress: {
    aliases: ['kecilkan pdf', 'perkecil file', 'kompres pdf', 'reduce size', 'size kecil', 'file besar'],
    badges: ['Popular', 'Local'],
  },
  organize: {
    aliases: ['urutkan halaman', 'hapus halaman', 'reorder pages', 'sort pages'],
    badges: ['Local'],
  },
  edit: {
    aliases: ['edit pdf', 'tambah teks', 'add text', 'gambar ke pdf', 'annotate pdf'],
    badges: ['Popular'],
  },
  redact: {
    aliases: ['sensor pdf', 'blackout', 'hapus rahasia', 'redaksi', 'blur data'],
    badges: ['Privacy'],
  },
  scrub: {
    aliases: ['hapus metadata', 'remove metadata', 'clean privacy', 'bersihkan data'],
    badges: ['Privacy', 'Local'],
  },
  protect: {
    aliases: ['password pdf', 'kunci pdf', 'encrypt pdf', 'amankan pdf'],
    badges: ['Secure'],
  },
  unlock: {
    aliases: ['buka password', 'remove password', 'unlock file', 'hapus password'],
    badges: ['Secure'],
  },
  signature: {
    aliases: ['tanda tangan', 'sign pdf', 'esign', 'signature'],
    badges: ['Popular'],
  },
  pdf2word: {
    aliases: ['pdf ke word', 'ubah pdf ke word', 'convert docx', 'editable word', 'pdf jadi word'],
    badges: ['Popular'],
  },
  word2pdf: {
    aliases: ['word ke pdf', 'docx ke pdf', 'ubah word jadi pdf'],
    badges: ['Popular'],
  },
  pdf2excel: {
    aliases: ['pdf ke excel', 'table pdf', 'extract table', 'spreadsheet'],
    badges: ['Data'],
  },
  ocr: {
    aliases: ['scan text', 'baca scan', 'gambar jadi teks', 'extract text scan', 'ocr pdf'],
    badges: ['AI-ready'],
  },
  'scan-pdf': {
    aliases: ['foto jadi pdf', 'kamera ke pdf', 'scan dokumen', 'scan ktp'],
    badges: ['Mobile'],
  },
  'chat-pdf': {
    aliases: ['tanya pdf', 'chat dokumen', 'ask pdf', 'ai pdf'],
    badges: ['AI'],
  },
  'summarize-pdf': {
    aliases: ['ringkas pdf', 'summary', 'summarize', 'rangkuman'],
    badges: ['AI'],
  },
  'translate-pdf': {
    aliases: ['terjemahkan pdf', 'translate document', 'bahasa indonesia', 'english'],
    badges: ['AI'],
  },
  'qr-code': {
    aliases: ['buat qr', 'qr generator', 'qr wifi', 'qr whatsapp', 'qr link', 'barcode qr'],
    badges: ['New', 'Popular'],
  },
  'qr-reader': {
    aliases: ['scan qr', 'baca qr', 'qr scanner', 'decode qr', 'kamera qr'],
    badges: ['New', 'Mobile'],
  },
  'invoice-generator': {
    aliases: ['buat invoice', 'tagihan', 'faktur', 'invoice pdf'],
    badges: ['Create'],
  },
  'resume-builder': {
    aliases: ['cv', 'resume', 'lamaran kerja', 'ats'],
    badges: ['Create'],
  },
}

export const SEARCH_INTENTS = {
  'gabung': ['merge'],
  'satukan': ['merge'],
  'kecil': ['compress'],
  'kompres': ['compress'],
  'password': ['protect', 'unlock'],
  'kunci': ['protect'],
  'buka': ['unlock'],
  'word': ['pdf2word', 'word2pdf'],
  'excel': ['pdf2excel', 'excel2pdf'],
  'scan': ['scan-pdf', 'ocr', 'qr-reader'],
  'foto': ['scan-pdf', 'imgs2pdf'],
  'gambar': ['pdf2imgs', 'imgs2pdf', 'extract-images'],
  'teks': ['ocr', 'pdf2text', 'edit'],
  'tanda tangan': ['signature'],
  'qr': ['qr-code', 'qr-reader'],
  'barcode': ['qr-code', 'qr-reader'],
  'ringkas': ['summarize-pdf'],
  'translate': ['translate-pdf'],
  'terjemah': ['translate-pdf'],
}

export const POPULAR_WORKFLOWS = [
  {
    id: 'scan-edit-share',
    title: 'Scan, read, then edit',
    description: 'Turn camera scans into usable text, then convert to Word.',
    toolIds: ['scan-pdf', 'ocr', 'pdf2word'],
  },
  {
    id: 'merge-send',
    title: 'Prepare files to send',
    description: 'Combine, shrink, and protect a clean PDF package.',
    toolIds: ['merge', 'compress', 'protect'],
  },
  {
    id: 'qr-campaign',
    title: 'Create and check QR',
    description: 'Make QR codes and scan them before publishing.',
    toolIds: ['qr-code', 'qr-reader'],
  },
  {
    id: 'privacy-cleanup',
    title: 'Privacy cleanup',
    description: 'Redact visible details and clear hidden metadata.',
    toolIds: ['redact', 'scrub', 'protect'],
  },
]

export function getToolBadges(tool) {
  const explicit = TOOL_DISCOVERY[tool.id]?.badges || []
  const categoryBadges = tool.category === 'security' ? ['Secure'] : []
  return Array.from(new Set([...explicit, ...categoryBadges])).slice(0, 3)
}

export function getToolSearchText(tool) {
  const aliases = TOOL_DISCOVERY[tool.id]?.aliases || []
  return [tool.title, tool.description, tool.category, tool.id, ...aliases].join(' ').toLowerCase()
}

export function getIntentToolIds(query) {
  const text = query.toLowerCase()
  return Object.entries(SEARCH_INTENTS)
    .filter(([keyword]) => text.includes(keyword))
    .flatMap(([, ids]) => ids)
}
