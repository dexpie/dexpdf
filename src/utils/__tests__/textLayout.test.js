import { describe, it, expect } from 'vitest'
import { LIST_ITEM_RE, joinWrappedLines } from '../textLayout'

describe('joinWrappedLines', () => {
  it('joins wrapped lines with single spaces', () => {
    const lines = [
      { text: 'Dokumen ini berisi' },
      { text: 'ketentuan penggunaan' },
      { text: 'layanan.' },
    ]
    expect(joinWrappedLines(lines)).toBe('Dokumen ini berisi ketentuan penggunaan layanan.')
  })

  it('rejoins hyphen-split lowercase words across a line break', () => {
    const lines = [{ text: 'pengemban-' }, { text: 'gannya' }]
    expect(joinWrappedLines(lines)).toBe('pengembangannya')
  })

  it('rejoins multi-line hyphenated words', () => {
    const lines = [{ text: 'keter-' }, { text: 'kaitan antar bagian' }]
    expect(joinWrappedLines(lines)).toBe('keterkaitan antar bagian')
  })

  it('keeps the hyphen when the next line starts with a capital (proper noun)', () => {
    const lines = [{ text: 'surat dari Pak-' }, { text: 'Budi tiba' }]
    expect(joinWrappedLines(lines)).toBe('surat dari Pak- Budi tiba')
  })

  it('collapses repeated whitespace', () => {
    const lines = [{ text: 'spasi   ganda' }, { text: '  dan   tabulasi' }]
    expect(joinWrappedLines(lines)).toBe('spasi ganda dan tabulasi')
  })

  it('returns empty string for no lines', () => {
    expect(joinWrappedLines([])).toBe('')
  })
})

describe('LIST_ITEM_RE', () => {
  it.each([
    ['• Poin pertama'],
    ['▪ Poin kedua'],
    ['◦ Sub poin'],
    ['‣ Bullet segitiga'],
    ['· Titik tengah'],
    ['- Dash biasa'],
    ['– En dash'],
    ['— Em dash'],
    ['1. Nomor titik'],
    ['12. Nomor dua digit'],
    ['(3) Nomor dalam kurung'],
    ['2) Nomor kurung tutup'],
  ])('matches list start: %s', input => {
    expect(LIST_ITEM_RE.test(input)).toBe(true)
  })

  it.each([
    ['Kalimat biasa.'],
    ['10.5 angka desimal tanpa spasi'],
    ['S.Kedua singkatan'],
  ])('does not match non-list line: %s', input => {
    expect(LIST_ITEM_RE.test(input)).toBe(false)
  })
})
