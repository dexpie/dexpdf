/**
 * Convert a rendered canvas into a paginated PDF without stretching one
 * long document into a single unreadable page.
 */
export async function canvasToPdfBlob(canvas, {
  orientation = 'portrait',
  format = 'a4',
  margin = 10,
  onProgress,
} = {}) {
  if (!canvas?.width || !canvas?.height) {
    throw new Error('Nothing was rendered for the PDF.')
  }

  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation, unit: 'mm', format, compress: true })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = Math.max(1, pageWidth - margin * 2)
  const contentHeight = Math.max(1, pageHeight - margin * 2)
  const pixelsPerPage = Math.max(1, Math.floor((contentHeight / contentWidth) * canvas.width))
  const totalPages = Math.ceil(canvas.height / pixelsPerPage)

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const sourceY = pageIndex * pixelsPerPage
    const sliceHeight = Math.min(pixelsPerPage, canvas.height - sourceY)
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight

    const context = pageCanvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    context.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      sliceHeight,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height,
    )

    if (pageIndex > 0) pdf.addPage(format, orientation)
    const imageHeight = (sliceHeight * contentWidth) / canvas.width
    pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.94), 'JPEG', margin, margin, contentWidth, imageHeight)
    pageCanvas.width = 1
    pageCanvas.height = 1
    onProgress?.(Math.round(((pageIndex + 1) / totalPages) * 100), `Rendering page ${pageIndex + 1} of ${totalPages}...`)
  }

  return { blob: pdf.output('blob'), pageCount: totalPages }
}
