/**
 * Utility function to format output filename
 * Adds extension if not present
 * Falls back to defaultName if customName is empty
 * @param {string} customName - User's custom filename
 * @param {string} defaultName - Default filename to use
 * @param {string} extension - File extension (default: '.pdf')
 */
export function getOutputFilename(customName, defaultName = 'output', extension = '.pdf') {
    const finalName = (customName || defaultName).trim()
    const ext = extension.startsWith('.') ? extension : '.' + extension
    return finalName.endsWith(ext) ? finalName : finalName + ext
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
