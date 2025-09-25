import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id) return
          // put big, rarely-used libraries into their own chunks
          if (id.includes('node_modules')) {
            if (id.includes('jspdf')) return 'vendor_jspdf'
            if (id.includes('pdfjs-dist')) return 'vendor_pdfjs'
            if (id.includes('pptxgenjs')) return 'vendor_pptxgenjs'
            if (id.includes('tesseract.js')) return 'vendor_tesseract'
            if (id.includes('html2canvas')) return 'vendor_html2canvas'
            // everything else from node_modules into a vendor chunk
            return 'vendor'
          }
        }
      }
    }
  }
})
