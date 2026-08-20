export type ToolProcessing = 'local' | 'mixed' | 'server'

const MIXED_TOOLS = new Set([
  'pdf2word',
  'word2pdf',
  'ppt2pdf',
  'excel2pdf',
  'ocr',
])

const SERVER_TOOLS = new Set([
  'chat-pdf',
  'summarize-pdf',
  'translate-pdf',
  'quiz-generator',
])

const FORMAT_BY_TOOL: Record<string, string> = {
  merge: 'PDF',
  split: 'PDF',
  compress: 'PDF',
  pdf2word: 'PDF → DOCX',
  word2pdf: 'DOCX → PDF',
  ppt2pdf: 'PPTX → PDF',
  excel2pdf: 'XLSX → PDF',
  imgs2pdf: 'JPG, PNG, WebP → PDF',
  pdf2imgs: 'PDF → JPG',
  pdf2png: 'PDF → PNG',
  pdf2webp: 'PDF → WebP',
  ocr: 'PDF, JPG, PNG',
  'scan-pdf': 'JPG, PNG, camera',
  'qr-code': 'Text, URL, contact',
  'qr-reader': 'Image, camera',
}

export function getToolProcessing(toolOrId: { id?: string } | string | null | undefined): ToolProcessing {
  const id = typeof toolOrId === 'string' ? toolOrId : toolOrId?.id
  if (SERVER_TOOLS.has(id || '')) return 'server'
  if (MIXED_TOOLS.has(id || '')) return 'mixed'
  return 'local'
}

export function getToolFormats(toolOrId: { id?: string } | string | null | undefined) {
  const id = typeof toolOrId === 'string' ? toolOrId : toolOrId?.id
  return FORMAT_BY_TOOL[id || ''] || 'PDF, JPG, PNG, DOCX, XLSX, PPTX'
}

export function getToolMaxFileSize(toolOrId: { id?: string } | string | null | undefined) {
  return '50 MB / file'
}

export function getToolProcessingCopy(toolOrId: { id?: string } | string | null | undefined) {
  const processing = getToolProcessing(toolOrId)

  if (processing === 'server') {
    return 'Memerlukan server/AI. File atau teks yang diperlukan dikirim ke provider terkait untuk diproses.'
  }

  if (processing === 'mixed') {
    return 'Tersedia mode Local di browser; mode Cloud/AI mengirim file ke provider eksternal bila dipilih.'
  }

  return '100% berjalan di browser. File tidak diunggah ke server DexPDF.'
}

export function getToolProcessingBadges(toolOrId: { id?: string } | string | null | undefined) {
  const processing = getToolProcessing(toolOrId)
  if (processing === 'server') return ['Server']
  if (processing === 'mixed') return ['Local', 'Cloud/AI']
  return ['Local']
}

export const FREE_TIER_LIMIT_COPY = 'Belum ada limit harian yang diberlakukan; batas saat ini 50 MB per file.'
