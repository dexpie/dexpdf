import * as pdfjsLib from 'pdfjs-dist'

export const configurePdfWorker = () => {
    try {
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
        }
    } catch (e) {
        console.warn('Failed to configure PDF worker:', e)
    }
}
