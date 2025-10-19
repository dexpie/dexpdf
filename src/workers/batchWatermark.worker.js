/* batchWatermark.worker.js
   Module worker for batch watermark processing.
   This file is bundled by Vite when imported with ?worker
*/

self._aborted = false

self.onmessage = async (ev) => {
  const msg = ev.data
  if (!msg) return
  if (msg.cmd === 'abort') { self._aborted = true; self.postMessage({ type: 'cancelled' }); return }
  if (msg.cmd === 'start') {
    self._aborted = false
    const files = msg.files || []
    const watermark = msg.watermark || 'CONFIDENTIAL'
    try {
      const PDFLib = await import('pdf-lib')
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      let totalPages = 0
      const pageCounts = []
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        try {
          if (!f.buffer) { pageCounts.push(0); continue }
          const arr = f.buffer instanceof ArrayBuffer ? f.buffer : f.buffer.buffer
          const pdfDoc = await PDFLib.PDFDocument.load(arr)
          const pages = pdfDoc.getPages()
          pageCounts.push(pages.length)
          totalPages += pages.length
        } catch (e) { pageCounts.push(0) }
      }
      let processed = 0
      for (let fi = 0; fi < files.length; fi++) {
        if (self._aborted) { self.postMessage({ type: 'cancelled' }); return }
        const f = files[fi]
        try {
          self.postMessage({ type: 'progress', percent: Math.round((processed / Math.max(1, totalPages)) * 100), message: 'Starting ' + f.name, fileIndex: fi, filePercent: 0 })
          if (!f.buffer) { self.postMessage({ type: 'file-done', fileIndex: fi }); continue }
          const arr = f.buffer instanceof ArrayBuffer ? f.buffer : f.buffer.buffer
          const pdfDoc = await PDFLib.PDFDocument.load(arr)
          const pages = pdfDoc.getPages()
          for (let pi = 0; pi < pages.length; pi++) {
            if (self._aborted) { self.postMessage({ type: 'cancelled' }); return }
            const page = pages[pi]
            const { width, height } = page.getSize()
            page.drawText(watermark, {
              x: width / 2 - 100,
              y: height / 2,
              size: 48,
              color: PDFLib.rgb ? PDFLib.rgb(0.8, 0.1, 0.1) : PDFLib.rgb(0.8, 0.1, 0.1),
              rotate: PDFLib.degrees ? PDFLib.degrees(-45) : PDFLib.degrees(-45),
              opacity: 0.25,
            })
            processed += 1
            const percent = totalPages > 0 ? Math.round((processed / totalPages) * 100) : 0
            const filePercent = pages.length > 0 ? Math.round(((pi + 1) / pages.length) * 100) : 0
            self.postMessage({ type: 'progress', percent: percent, message: 'Processing ' + f.name + ' (' + (pi + 1) + '/' + pages.length + ')', fileIndex: fi, filePercent: filePercent })
          }
          const out = await pdfDoc.save()
          zip.file(f.name.replace(/\.pdf$/i, '') + '-watermarked.pdf', out)
          self.postMessage({ type: 'file-done', fileIndex: fi })
        } catch (err) {
          self.postMessage({ type: 'progress', percent: Math.round((processed / Math.max(1, totalPages)) * 100), message: 'Error processing ' + f.name, fileIndex: fi, filePercent: 0 })
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const arrayBuffer = await blob.arrayBuffer()
      self.postMessage({ type: 'result', buffer: arrayBuffer }, [arrayBuffer])
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err) })
    }
  }
}
/* eslint-disable no-restricted-globals */
importScripts && importScripts()

self.onmessage = async (ev) => {
  const msg = ev.data
  if (!msg) return
  if (msg.cmd === 'abort') {
    // Cooperative: set a flag
    self._aborted = true
    self.postMessage({ type: 'cancelled' })
    return
  }

  if (msg.cmd === 'start') {
    self._aborted = false
    const files = msg.files || []
    const watermark = msg.watermark || 'CONFIDENTIAL'
    try {
      // Dynamic imports inside worker
      const PDFLib = await import('pdf-lib')
      const JSZip = (await import('jszip')).default

      const zip = new JSZip()

      // Calculate total pages
      let totalPages = 0
      const pageCounts = []
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        try {
          if (!f.buffer) { pageCounts.push(0); continue }
          const arr = f.buffer instanceof ArrayBuffer ? f.buffer : f.buffer.buffer
          const pdfDoc = await PDFLib.PDFDocument.load(arr)
          const pages = pdfDoc.getPages()
          pageCounts.push(pages.length)
          totalPages += pages.length
        } catch (e) {
          pageCounts.push(0)
        }
      }

      let processed = 0
      // Process sequentially to keep memory predictable
      for (let fi = 0; fi < files.length; fi++) {
        if (self._aborted) { self.postMessage({ type: 'cancelled' }); return }
        const f = files[fi]
        try {
          self.postMessage({ type: 'progress', percent: Math.round((processed / Math.max(1, totalPages)) * 100), message: `Starting ${f.name}`, fileIndex: fi, filePercent: 0 })

          if (!f.buffer) {
            // skip
            self.postMessage({ type: 'file-done', fileIndex: fi })
            continue
          }

          const arr = f.buffer instanceof ArrayBuffer ? f.buffer : f.buffer.buffer
          const pdfDoc = await PDFLib.PDFDocument.load(arr)
          const pages = pdfDoc.getPages()
          for (let pi = 0; pi < pages.length; pi++) {
            if (self._aborted) { self.postMessage({ type: 'cancelled' }); return }
            const page = pages[pi]
            const { width, height } = page.getSize()
            page.drawText(watermark, {
              x: width / 2 - 100,
              y: height / 2,
              size: 48,
              color: PDFLib.rgb ? PDFLib.rgb(0.8, 0.1, 0.1) : PDFLib.rgb(0.8, 0.1, 0.1),
              rotate: PDFLib.degrees ? PDFLib.degrees(-45) : PDFLib.degrees(-45),
              opacity: 0.25,
            })

            processed += 1
            const percent = totalPages > 0 ? Math.round((processed / totalPages) * 100) : 0
            const filePercent = pages.length > 0 ? Math.round(((pi + 1) / pages.length) * 100) : 0
            // send progress
            self.postMessage({ type: 'progress', percent, message: `Processing ${f.name} (${pi + 1}/${pages.length})`, fileIndex: fi, filePercent })
          }

          const out = await pdfDoc.save()
          zip.file(f.name.replace(/\.pdf$/i, '') + '-watermarked.pdf', out)
          self.postMessage({ type: 'file-done', fileIndex: fi })
        } catch (err) {
          self.postMessage({ type: 'progress', percent: Math.round((processed / Math.max(1, totalPages)) * 100), message: `Error processing ${f.name}`, fileIndex: fi, filePercent: 0 })
          // continue with next
        }
      }

      // Generate zip as ArrayBuffer
      const blob = await zip.generateAsync({ type: 'blob' })
      const arrayBuffer = await blob.arrayBuffer()
      // post result with transfer
      self.postMessage({ type: 'result', buffer: arrayBuffer }, [arrayBuffer])
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err) })
    }
  }
}
