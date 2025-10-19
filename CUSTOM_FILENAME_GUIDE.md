# Custom Filename Feature - Implementation Guide

## Overview
Added ability for users to set custom filename before downloading PDF files. If no custom name is provided, a smart default is used.

## Components Created

### 1. FilenameInput Component (`src/components/FilenameInput.jsx`)
Reusable input component for filename customization with:
- Label and placeholder
- Helper text
- Disabled state support
- Focus/blur styling

### 2. File Helpers (`src/utils/fileHelpers.js`)
Utility functions:
- `getOutputFilename(customName, defaultName)` - Formats filename with .pdf extension
- `getDefaultFilename(originalFile, suffix)` - Generates default from original filename

## Implementation Pattern

### 1. Add State
```jsx
const [outputFileName, setOutputFileName] = useState('')
```

### 2. Import Dependencies
```jsx
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename, getDefaultFilename } from '../utils/fileHelpers'
```

### 3. Set Default on File Load
```jsx
setOutputFileName(getDefaultFilename(file, '_suffix'))
```

### 4. Add UI Component (before download button)
```jsx
<FilenameInput 
  value={outputFileName}
  onChange={(e) => setOutputFileName(e.target.value)}
  disabled={busy}
  placeholder="default_name"
/>
```

### 5. Use in Download
```jsx
a.download = getOutputFilename(outputFileName, 'fallback')
```

## Tools Updated

✅ **CompressTool** - Default: `{originalName}_compressed`
✅ **MergeTool** - Default: `merged`  
✅ **SplitTool** - Default: `{originalName}_extracted`

## Tools to Update

- [ ] WatermarkTool
- [ ] PdfToWordTool
- [ ] RotateTool
- [ ] SignatureTool
- [ ] PdfToTextTool (output .txt, adjust extension)
- [ ] ImagesToPdfTool
- [ ] PdfToImagesTool (multiple images - ZIP)
- [ ] And 14+ other tools...

## Notes
- Extension (.pdf or other) added automatically
- Empty input falls back to default
- Disabled during processing (busy state)
- Integrated with existing error/success message system
