import { useEffect, useState } from 'react'

// Import tool components
// Use central `src/tools` implementations
import PdfToTextTool from '../../tools/PdfToTextTool'
import PdfToWordTool from '../../tools/PdfToWordTool'
import MergeTool from '../../tools/MergeTool'
import SplitTool from '../../tools/SplitTool'
import ImagesToPdfTool from '../../tools/ImagesToPdfTool'
import PdfToImagesTool from '../../tools/PdfToImagesTool'
import AnnotateTool from '../../tools/AnnotateTool'
import CompressTool from '../../tools/CompressTool'
import EditPdfTool from '../../tools/EditPdfTool'
import OcrTool from '../../tools/OcrTool'
import PageNumbersTool from '../../tools/PageNumbersTool'
import PdfToPptTool from '../../tools/PdfToPptTool'
import PptToPdfTool from '../../tools/PptToPdfTool'
import ReorderTool from '../../tools/ReorderTool'
import RotateTool from '../../tools/RotateTool'
import SignatureTool from '../../tools/SignatureTool'
import WatermarkTool from '../../tools/WatermarkTool'
import WordToPdfTool from '../../tools/WordToPdfTool'

const TOOL_COMPONENTS = {
  'pdf2text': PdfToTextTool,
  'pdf2word': PdfToWordTool,
  'merge': MergeTool,
  'split': SplitTool,
  'imgs2pdf': ImagesToPdfTool,
  'pdf2imgs': PdfToImagesTool,
  'annotate': AnnotateTool,
  'compress': CompressTool,
  'edit': EditPdfTool,
  'ocr': OcrTool,
  'pagenums': PageNumbersTool,
  'pdf2ppt': PdfToPptTool,
  'ppt2pdf': PptToPdfTool,
  'reorder': ReorderTool,
  'rotate': RotateTool,
  'signature': SignatureTool,
  'watermark': WatermarkTool,
  'word2pdf': WordToPdfTool,
}

export default function ToolContainer({ toolId, onClose }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Add escape key handler to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // Get the component for current tool
  const ToolComponent = TOOL_COMPONENTS[toolId]

  if (!ToolComponent) {
    return (
      <div className="tool-container">
        <div className="tool-header">
          <button onClick={onClose} className="close-btn">×</button>
          <h1>Tool Not Found</h1>
        </div>
        <div className="tool-content">
          <p>The requested tool "{toolId}" is not available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`tool-container ${mounted ? 'mounted' : ''}`}>
      <div className="tool-header">
        <button onClick={onClose} className="close-btn">×</button>
        <h1>{toolId}</h1>
      </div>
      <div className="tool-content">
        <ToolComponent />
      </div>
    </div>
  )
}