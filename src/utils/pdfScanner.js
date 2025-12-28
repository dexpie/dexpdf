
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
