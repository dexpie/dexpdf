import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'assets/*'],
      manifest: {
        name: 'DexPDF',
        short_name: 'DexPDF',
        description: 'Complete PDF Toolkit for Modern Productivity',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
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
            if (id.includes('pdf-lib')) return 'vendor_pdf_lib'
            if (id.includes('pptxgenjs')) return 'vendor_pptxgenjs'
            if (id.includes('tesseract.js')) return 'vendor_tesseract'
            if (id.includes('html2canvas')) return 'vendor_html2canvas'
            if (id.includes('jszip')) return 'vendor_jszip'
            if (id.includes('papaparse')) return 'vendor_papaparse'
            // everything else from node_modules into a vendor chunk
            return 'vendor'
          }
        }
      }
    }
  }
})
