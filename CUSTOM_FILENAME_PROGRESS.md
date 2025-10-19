# Custom Filename Feature - Progress Report

## 📊 Update Status

### ✅ COMPLETED (6 tools - COMMITTED)
1. **CompressTool** - `{name}_compressed.pdf`
2. **MergeTool** - `merged.pdf`
3. **SplitTool** - `{name}_extracted.pdf`
4. **WatermarkTool** - `{name}_watermarked.pdf`
5. **RotateTool** - `{name}_rotated.pdf`
6. **SignatureTool** - `{name}_signed.pdf`

### 🔄 IN PROGRESS (Remaining ~15 tools)
7. PdfToWordTool (.docx output)
8. PdfToTextTool (.txt output)
9. ImagesToPdfTool
10. PdfToImagesTool (ZIP/images)
11. WordToPdfTool
12. ReorderTool
13. AnnotateTool
14. PdfToPptTool (.pptx output)
15. PptToPdfTool
16. ExtractImagesTool (ZIP)
17. BatchWatermarkTool
18. CSVToPdfTool
19. OcrTool
20. PageNumbersTool
21. EditPdfTool

## 🎯 Implementation Pattern

Each tool receives:
```javascript
// 1. Import
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'

// 2. State
const [outputFileName, setOutputFileName] = useState('')

// 3. Set default on file load
setOutputFileName(getDefaultFilename(file, '_suffix'))

// 4. UI Component
<FilenameInput 
  value={outputFileName}
  onChange={(e) => setOutputFileName(e.target.value)}
  disabled={busy}
  placeholder="default"
/>

// 5. Download
a.download = getOutputFilename(outputFileName, 'fallback')
```

## 📝 Special Cases

**Non-PDF outputs:**
- PdfToWordTool → `.docx` extension
- PdfToTextTool → `.txt` extension
- PdfToPptTool → `.pptx` extension
- ExtractImagesTool/PdfToImagesTool → `.zip` for multiple files

**Update helper for these:**
```javascript
export function getOutputFilename(customName, defaultName, extension = '.pdf') {
  const finalName = (customName || defaultName).trim()
  const ext = extension.startsWith('.') ? extension : '.' + extension
  return finalName.endsWith(ext) ? finalName : finalName + ext
}
```

## 🚀 Next Steps

1. Update fileHelpers.js untuk support multiple extensions
2. Batch update remaining 15 tools
3. Test all tools
4. Commit & Push final changes
5. Update documentation

## 💾 Git Status

- Committed: 6 tools + components (9 files changed)
- Ready to continue with remaining tools
