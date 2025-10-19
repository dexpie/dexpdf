/**
 * Utility function to format output filename
 * Adds .pdf extension if not present
 * Falls back to defaultName if customName is empty
 */
export function getOutputFilename(customName, defaultName = 'output') {
  const finalName = (customName || defaultName).trim()
  return finalName.endsWith('.pdf') ? finalName : finalName + '.pdf'
}

/**
 * Generate default filename from original file
 */
export function getDefaultFilename(originalFile, suffix = '') {
  if (!originalFile || !originalFile.name) return suffix || 'output'
  const baseName = originalFile.name.replace(/\.pdf$/i, '')
  return suffix ? baseName + suffix : baseName
}
