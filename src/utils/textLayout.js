/**
 * Pure helpers for rebuilding paragraph structure from positioned PDF text.
 * Shared by PDF→Word conversion paths and covered by unit tests.
 */

/** Matches lines that start a list item (bullet or numbered). */
export const LIST_ITEM_RE = /^([•▪◦‣·]|[-–—]\s|\(?\d{1,2}[.)]\s)/

/**
 * Join wrapped visual lines into one paragraph string.
 * Rejoins words that were hyphen-split across a line break when the
 * continuation starts with a lowercase letter; otherwise joins with spaces.
 */
export function joinWrappedLines(lineItems) {
  let combined = ''
  lineItems.forEach((line, index) => {
    if (index === 0) {
      combined = line.text
      return
    }
    if (/[A-Za-z]-$/.test(combined) && /^[a-z]/.test(line.text)) {
      combined = combined.slice(0, -1) + line.text
    } else {
      combined += ' ' + line.text
    }
  })
  return combined.replace(/\s+/g, ' ').trim()
}
