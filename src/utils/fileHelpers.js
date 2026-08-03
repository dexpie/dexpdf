/**
 * Utility function to format output filename
 * Adds extension if not present
 * Falls back to defaultName if customName is empty
 * @param {string} customName - User's custom filename
 * @param {string} defaultName - Default filename to use
 * @param {string} extension - File extension (default: '.pdf')
 */
export function getOutputFilename(customName, defaultName = 'output', extension = '.pdf') {
    const knownExtensions = new Set([
        'csv', 'doc', 'docx', 'epub', 'html', 'jpg', 'jpeg', 'json', 'md',
        'pdf', 'png', 'ppt', 'pptx', 'rtf', 'txt', 'webp', 'xls', 'xlsx', 'zip'
    ])

    if (arguments.length === 2 && knownExtensions.has(defaultName.toLowerCase().replace(/^\./, ''))) {
        extension = defaultName
        defaultName = 'output'
    }

    const finalName = (customName || defaultName).trim()
    const ext = extension.startsWith('.') ? extension : '.' + extension
    const withoutKnownExtension = finalName.replace(/\.(csv|docx?|epub|html?|jpe?g|json|md|pdf|png|pptx?|rtf|txt|webp|xlsx?|zip)$/i, '')
    return finalName.toLowerCase().endsWith(ext.toLowerCase()) ? finalName : withoutKnownExtension + ext
}

/**
 * Generate default filename from original file
 * @param {File} originalFile - Original file object
 * @param {string} suffix - Suffix to add to filename (e.g., '_compressed')
 */
export function getDefaultFilename(originalFile, suffix = '') {
    if (!originalFile || !originalFile.name) return suffix || 'output'
    // Remove extension from original file
    const baseName = originalFile.name.replace(/\.\w+$/i, '')
    return suffix ? baseName + suffix : baseName
}

export function formatBytes(bytes) {
    if (bytes == null || Number.isNaN(Number(bytes))) return '-'
    const value = Number(bytes)
    if (value < 1024) return `${value} B`
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
    if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`
    return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function getReadableError(error, fallback = 'Something went wrong.') {
    if (typeof error === 'string' && error.trim()) return error.trim()
    if (error?.message && typeof error.message === 'string') return error.message
    return fallback
}

/**
 * Download a Blob without revoking its object URL before the browser has
 * started the download. The delayed cleanup also keeps Safari reliable.
 */
export function downloadBlob(blob, filename = 'download') {
    if (!blob) throw new Error('No output file was generated.')
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1500)
    return url
}
