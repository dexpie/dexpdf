/**
 * File Size Preview Utilities
 * Helper functions for showing file size comparison before download
 */

/**
 * Get file size from File object or Blob
 * @param {File|Blob} file - File or Blob object
 * @returns {number} Size in bytes
 */
export const getFileSize = (file) => {
    if (!file) return 0
    return file.size || 0
}

/**
 * Get size from PDF bytes (Uint8Array)
 * @param {Uint8Array} pdfBytes - PDF bytes
 * @returns {number} Size in bytes
 */
export const getPdfBytesSize = (pdfBytes) => {
    if (!pdfBytes) return 0
    return pdfBytes.length || pdfBytes.byteLength || 0
}

/**
 * Get size from multiple files
 * @param {File[]} files - Array of files
 * @returns {number} Total size in bytes
 */
export const getTotalFilesSize = (files) => {
    if (!files || !Array.isArray(files)) return 0
    return files.reduce((total, file) => total + getFileSize(file), 0)
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 B'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Calculate compression ratio and savings
 * @param {number} originalSize - Original file size in bytes
 * @param {number} processedSize - Processed file size in bytes
 * @returns {Object} Savings data
 */
export const calculateSavings = (originalSize, processedSize) => {
    if (!originalSize || !processedSize) {
        return {
            diff: 0,
            percent: 0,
            isReduced: false,
            ratio: 1
        }
    }

    const diff = originalSize - processedSize
    const percent = ((diff / originalSize) * 100).toFixed(1)
    const ratio = (processedSize / originalSize).toFixed(2)

    return {
        diff: Math.abs(diff),
        percent: Math.abs(parseFloat(percent)),
        isReduced: diff > 0,
        ratio: parseFloat(ratio)
    }
}

/**
 * Estimate compressed PDF size (rough estimation)
 * @param {number} originalSize - Original size in bytes
 * @param {number} quality - Quality factor (0-1)
 * @returns {number} Estimated size in bytes
 */
export const estimateCompressedSize = (originalSize, quality = 0.7) => {
    if (!originalSize) return 0

    // Rough estimation based on quality
    // Quality 0.9 = ~80% of original
    // Quality 0.7 = ~50% of original
    // Quality 0.5 = ~30% of original
    const compressionFactor = 0.3 + (quality * 0.6)

    return Math.round(originalSize * compressionFactor)
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} Extension (e.g., '.pdf', '.docx')
 */
export const getFileExtension = (filename) => {
    if (!filename) return ''
    const parts = filename.split('.')
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
}

/**
 * Create a preview state object for FileSizePreview component
 * @param {number} originalSize - Original file size
 * @param {number} processedSize - Processed file size
 * @param {string} fileName - Output file name
 * @returns {Object} Preview state
 */
export const createPreviewState = (originalSize, processedSize, fileName = 'output.pdf') => {
    const savings = calculateSavings(originalSize, processedSize)

    return {
        originalSize,
        processedSize,
        fileName,
        savings,
        originalFormatted: formatFileSize(originalSize),
        processedFormatted: formatFileSize(processedSize),
        show: true
    }
}

/**
 * Hook-like state manager for file size preview
 * Returns helpers to manage preview state
 */
export class FileSizePreviewManager {
    constructor() {
        this.originalSize = 0
        this.processedSize = null
        this.fileName = 'output.pdf'
        this.isProcessing = false
    }

    setOriginalFile(file) {
        this.originalSize = getFileSize(file)
        if (file.name) {
            this.fileName = file.name.replace(/\.[^/.]+$/, '_processed.pdf')
        }
    }

    setOriginalFiles(files) {
        this.originalSize = getTotalFilesSize(files)
    }

    setOriginalSize(size) {
        this.originalSize = size
    }

    setProcessedBytes(pdfBytes) {
        this.processedSize = getPdfBytesSize(pdfBytes)
        this.isProcessing = false
    }

    setProcessing(isProcessing) {
        this.isProcessing = isProcessing
    }

    setFileName(fileName) {
        this.fileName = fileName
    }

    getPreviewData() {
        return {
            originalSize: this.originalSize,
            processedSize: this.processedSize,
            fileName: this.fileName,
            isProcessing: this.isProcessing
        }
    }

    getSavings() {
        return calculateSavings(this.originalSize, this.processedSize)
    }

    reset() {
        this.originalSize = 0
        this.processedSize = null
        this.fileName = 'output.pdf'
        this.isProcessing = false
    }
}

export default {
    getFileSize,
    getPdfBytesSize,
    getTotalFilesSize,
    formatFileSize,
    calculateSavings,
    estimateCompressedSize,
    getFileExtension,
    createPreviewState,
    FileSizePreviewManager
}
