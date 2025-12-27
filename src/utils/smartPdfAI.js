import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from './pdfWorker'

// Ensure worker is configured
configurePdfWorker()

/**
 * Analyzes a PDF file to suggest a filename and category.
 * @param {File} file - The PDF file object
 * @returns {Promise<{suggestedName: string, category: string, date: string, confidence: number, originalName: string}>}
 */
export async function analyzePdf(file) {
    try {
        const buffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

        // Get text from the first page only (usually contains the header info)
        const page = await pdf.getPage(1)
        const textContent = await page.getTextContent()
        const textItems = textContent.items
        const fullText = textItems.map(item => item.str).join(' ')

        // 1. Extract Date (YYYY-MM-DD)
        // Matches: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, DD Month YYYY
        const dateRegex = /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i
        const dateMatch = fullText.match(dateRegex)
        let formattedDate = ''

        if (dateMatch) {
            try {
                const d = new Date(dateMatch[0])
                if (!isNaN(d.getTime())) {
                    formattedDate = d.toISOString().split('T')[0] // YYYY-MM-DD
                }
            } catch (e) { /* ignore invalid date parsing */ }
        }

        // 2. Extract Document Type / ID
        let docType = 'Document'
        let docId = ''
        let category = 'Uncategorized'

        const lowerText = fullText.toLowerCase()

        // Finance
        if (/invoice|bill|tagihan|faktur|kwitansi|receipt/i.test(lowerText)) {
            docType = 'Invoice'
            category = 'Finance'
            // Try to find Invoice Number
            const idMatch = fullText.match(/(?:no|num|number|#)\s*[:.]?\s*([A-Z0-9-]{3,})/i)
            if (idMatch) docId = idMatch[1]
        }
        // Legal / Contracts
        else if (/contract|agreement|surat|perjanjian|kontrak/i.test(lowerText)) {
            docType = 'Contract'
            category = 'Legal'
        }
        // Personal / Identity
        else if (/cv|resume|curriculum vitae|biodata/i.test(lowerText)) {
            docType = 'Resume'
            category = 'Personal'
            // Try to find name (heuristic: first line or largest text - simplified here)
        }
        // Academic
        else if (/transcript|transkrip|certificate|sertifikat|ijazah/i.test(lowerText)) {
            docType = 'Certificate'
            category = 'Academic'
        }

        // 3. Construct Suggested Name
        // Format: [Type]_[ID]_[Date].pdf or [Type]_[OriginalName]
        let suggestedName = docType

        if (docId) {
            suggestedName += `_${docId}`
        } else {
            // If no ID, use a cleaned up version of original name or just Timestamp
            // simpler: keep specific ID empty if not found
        }

        if (formattedDate) {
            suggestedName += `_${formattedDate}`
        }

        // If generic prediction, append part of original name to avoid duplicates
        if (suggestedName === docType && !formattedDate) {
            suggestedName += `_${file.name.replace('.pdf', '')}`
        }

        suggestedName = suggestedName.replace(/[^a-zA-Z0-9._-]/g, '') + '.pdf'

        return {
            suggestedName,
            category,
            date: formattedDate,
            confidence: 0.8, // Static confidence for regex logic
            originalName: file.name
        }

    } catch (error) {
        console.error("AI Analysis Failed:", error)
        return {
            suggestedName: file.name,
            category: 'Error',
            date: '',
            confidence: 0,
            originalName: file.name
        }
    }
}
