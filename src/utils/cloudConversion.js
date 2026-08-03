export async function convertWithCloud(file, {
  sourceFormat,
  targetFormat,
  apiKey = '',
  onProgress,
} = {}) {
  if (!file || !sourceFormat || !targetFormat) {
    throw new Error('A source file and conversion format are required.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('from', sourceFormat)
  formData.append('to', targetFormat)
  formData.append('format', targetFormat)
  if (apiKey.trim()) formData.append('apiKey', apiKey.trim())

  onProgress?.(15, 'Uploading for high-fidelity cloud conversion...')
  const response = await fetch('/api/convert', { method: 'POST', body: formData })
  onProgress?.(80, 'Downloading the converted file...')

  if (!response.ok) {
    const text = await response.text()
    let details = { error: text }
    try {
      details = JSON.parse(text)
    } catch {}

    const error = new Error(details.error || 'Cloud conversion failed.')
    error.status = response.status
    error.code = details.code
    throw error
  }

  const blob = await response.blob()
  if (blob.size < 100) throw new Error('The cloud provider returned an empty file.')
  onProgress?.(100, 'Cloud conversion complete.')
  return blob
}
