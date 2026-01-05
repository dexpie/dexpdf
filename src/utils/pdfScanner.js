
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from './pdfWorker'

configurePdfWorker()

/**
 * Scans a PDF page for sensitive information using Regex
 * @param {File} file - PDF File object
 * @param {number} pageIndex - 1-based page index
 * @param {number} scale - Viewport scale (must match EditorCanvas, e.g. 1.5)
 * @returns {Promise<Array>} - Array of detection objects { id, x, y, width, height, type, text }
 */
export async function scanPageForSensitiveData(file, pageIndex, scale = 1.5) {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
        const page = await pdf.getPage(pageIndex)
        const textContent = await page.getTextContent()
        const viewport = page.getViewport({ scale })

        const matches = []

        // Regex Patterns
        const patterns = [
            { type: 'email', regex: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi },
            { type: 'phone', regex: /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
            // { type: 'credit_card', regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/g } // False positives risk high
        ]

        textItems: for (const item of textContent.items) {
            const str = item.str
            if (!str) continue

            for (const p of patterns) {
                // Reset lastIndex for global regex
                p.regex.lastIndex = 0
                let match
                while ((match = p.regex.exec(str)) !== null) {
                    // Found a match!
                    // We need to calculate the bounding box.
                    // pdf.js gives item.transform [a, b, c, d, tx, ty]
                    // tx, ty are origin (baseline usually)
                    // width is item.width
                    // height is roughly font size

                    const tx = item.transform[4]
                    const ty = item.transform[5]

                    // Approximate font size from transform matrix (scaleX)
                    // This is a simplification; assumes no rotation/skew
                    const fontScale = Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1])

                    // Convert PDF point to Viewport point
                    // Viewport.convertToViewportPoint(x, y) returns [x, y]
                    // PDF origin is bottom-left, Viewport is top-left.
                    // convertToViewportPoint handles the inversion.

                    const [vx, vy] = viewport.convertToViewportPoint(tx, ty)

                    const width = item.width * scale
                    const height = (item.height || fontScale) * scale

                    // Adjust Y. vy is baseline. We need top-left of box.
                    // Usually baseline is at bottom of text.
                    // So box y = vy - height.

                    matches.push({
                        id: `auto-${Date.now()}-${Math.random()}`,
                        type: 'rectangle',
                        x: vx,
                        y: vy - height, // Move up from baseline
                        width: width,
                        height: height * 1.2, // Add a little padding
                        color: 'black',
                        isRedaction: true,
                        detectedType: p.type,
                        text: match[0]
                    })

                    // Break after finding one match in this item? 
                    // Or continue? continue might overlap if multiple matches in one string.
                    // For now, let's keep finding.
                }
            }
        }

        return matches

    } catch (err) {
        console.error("Scan error", err)
        throw err
    }
}

/**
 * Scans a PDF page for specific text matches
 * @param {File} file - PDF File object
 * @param {number} pageIndex - 1-based page index
 * @param {string} searchText - Text to search for (case insensitive)
 * @param {number} scale - Must match EditorCanvas scale (1.5)
 * @returns {Promise<Array>} - Array of detection objects
 */
export async function scanPageForText(file, pageIndex, searchText, scale = 1.5) {
    if (!searchText || searchText.trim().length === 0) return []

    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
        const page = await pdf.getPage(pageIndex)
        const textContent = await page.getTextContent()
        const viewport = page.getViewport({ scale })

        const matches = []
        // Escape special regex chars
        const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escapedText, 'gi')

        for (const item of textContent.items) {
            const str = item.str
            if (!str) continue

            regex.lastIndex = 0
            let match
            while ((match = regex.exec(str)) !== null) {
                // Same logic as auto-scan for coordinate mapping
                const tx = item.transform[4]
                const ty = item.transform[5]
                // const fontScale = Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]) // Unused in this simplified logic but kept for reference
                const [vx, vy] = viewport.convertToViewportPoint(tx, ty)

                // Refine width calculation:
                // item.width is total width of string. We need width of *matched* substring.
                // This is hard without full font metrics.
                // Simplification: Assume monospaced-ish distribution or calculate phrase ratio.
                // Better approach: Highlight the WHOLE string if it contains the match?
                // Or try to approximate substring position?
                // For MVP: We redact the WHOLE text item if it matches (or contains mathc).
                // But wait, if str is "Hello World" and we search "World", we want just "World".
                // PDF.js splits text weirdly. "Hello" might be one item, "World" another.
                // Or "Hello World" one item.

                // Strategy 1 (MVP): Redact the entire text item that contains the match.
                // This ensures we cover it, even if we cover a bit more.
                // Strategy 2 (Advanced): Measure text. Too complex for client-side heavy lifting without canvas measurement.

                /* 
                   Refining Width/X:
                   If match index is > 0, we can estimate offset X.
                   charWidth ≈ item.width / str.length
                   offsetX ≈ match.index * charWidth
                   matchWidth ≈ match[0].length * charWidth
                */

                const charWidth = (item.width * scale) / str.length
                const offsetX = match.index * charWidth
                const matchWidth = match[0].length * charWidth

                const height = (item.height || 10) * scale // Fallback height if item.height is missing

                matches.push({
                    id: `find-${Date.now()}-${Math.random()}`,
                    type: 'rectangle',
                    x: vx + offsetX,
                    y: vy - height,
                    width: matchWidth,
                    height: height * 1.2,
                    color: 'black',
                    isRedaction: true,
                    text: match[0]
                })
            }
        }
        return matches

    } catch (err) {
        console.error("Text Scan error", err)
        throw err
    }
}
