# 📦 Batch Integration Guide

## 🎯 How to Add Batch Processing to ANY Tool

This guide shows you how to integrate `UniversalBatchProcessor` into any PDF tool in **5 simple steps**.

---

## ✅ Example: CompressTool (COMPLETED)

### Step 1: Import UniversalBatchProcessor

```jsx
import UniversalBatchProcessor from '../components/UniversalBatchProcessor'
```

### Step 2: Add Batch Mode State

```jsx
export default function CompressTool() {
  const [batchMode, setBatchMode] = useState(false)
  // ... existing states
}
```

### Step 3: Create Process Function

The `processFile` function is the core integration point. It must:
- Accept: `(file, index, onProgress)` parameters
- Return: `Blob` of processed file
- Call: `onProgress(0-100)` to update progress bar
- Throw: errors for proper error handling

```jsx
const processBatchFile = async (file, index, onProgress) => {
  try {
    onProgress(10) // Starting

    // Your processing logic here
    const formData = new FormData()
    formData.append('pdf', file)
    
    onProgress(30) // Uploading

    const response = await fetch('YOUR_API_ENDPOINT', {
      method: 'POST',
      body: formData,
    })

    onProgress(70) // Processing

    if (!response.ok) {
      throw new Error(`Failed: ${response.statusText}`)
    }

    const blob = await response.blob()
    onProgress(100) // Complete

    return blob
  } catch (error) {
    console.error(`Error processing ${file.name}:`, error)
    throw error // Important: re-throw for error handling
  }
}
```

### Step 4: Add Mode Toggle UI

```jsx
return (
  <div>
    <h2>Your Tool Name</h2>
    
    {/* Mode Toggle */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
      <button 
        className={!batchMode ? 'btn-primary' : 'btn-outline'}
        onClick={() => setBatchMode(false)}
        style={{ minWidth: 120 }}
      >
        📄 Single File
      </button>
      <button 
        className={batchMode ? 'btn-primary' : 'btn-outline'}
        onClick={() => setBatchMode(true)}
        style={{ minWidth: 120 }}
      >
        🔄 Batch Mode
      </button>
    </div>

    {/* Rest of your UI */}
  </div>
)
```

### Step 5: Add Batch & Single Mode Views

```jsx
{/* Batch Mode */}
{batchMode && (
  <UniversalBatchProcessor
    toolName="Your Tool Name"
    processFile={processBatchFile}
    acceptedTypes=".pdf"
    outputExtension=".pdf"
    maxFiles={100}
    customOptions={
      <div style={{ padding: '12px 0' }}>
        <div style={{ fontSize: 14, color: '#666' }}>
          💡 <strong>Batch Tips:</strong> Add helpful tips here
        </div>
      </div>
    }
  />
)}

{/* Single File Mode */}
{!batchMode && (
  <div>
    {/* Your existing single-file UI here */}
  </div>
)}
```

---

## 🔧 Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `toolName` | string | Yes | - | Display name (e.g., "Compress PDF") |
| `processFile` | function | Yes | - | `async (file, index, onProgress) => Blob` |
| `acceptedTypes` | string | No | `.pdf` | File types (e.g., ".pdf,.docx") |
| `outputExtension` | string | No | `.pdf` | Output file extension |
| `maxFiles` | number | No | `100` | Maximum files allowed |
| `customOptions` | JSX | No | `null` | Tool-specific options component |
| `onComplete` | function | No | `null` | Callback when all done: `(results) => {}` |

---

## 📋 Tool Integration Checklist

### High Priority (Week 1-2)
- [x] **CompressTool** - Backend API compression
- [ ] **MergeTool** - Combine multiple PDFs (batch = merge multiple SETS)
- [ ] **SplitTool** - Split multiple PDFs at once
- [ ] **PdfToWordTool** - Convert 50+ PDFs to Word
- [ ] **RotateTool** - Rotate pages in multiple PDFs
- [ ] **PdfToPptTool** - Batch convert to PowerPoint

### Medium Priority (Week 3-4)
- [ ] **ImagesToPdfTool** - Process multiple image sets → PDFs
- [ ] **PdfToImagesTool** - Extract images from multiple PDFs
- [ ] **ExtractImagesTool** - Batch extract images
- [ ] **WatermarkTool** - Already has batch, may need upgrade
- [ ] **SignatureTool** - Sign multiple PDFs
- [ ] **PdfToTextTool** - Extract text from multiple PDFs

### Lower Priority (Week 5-6)
- [ ] **WordToPdfTool** - Convert multiple Word docs
- [ ] **PptToPdfTool** - Convert multiple PowerPoints
- [ ] **ReorderTool** - Reorder pages in multiple PDFs
- [ ] **AnnotateTool** - Add annotations to multiple PDFs
- [ ] **CSVToPdfTool** - Convert multiple CSVs
- [ ] **OcrTool** - OCR multiple scanned PDFs
- [ ] **PageNumbersTool** - Add page numbers to multiple PDFs

---

## 🎨 Custom Options Examples

### Compression Settings

```jsx
customOptions={
  <div style={{ padding: '12px 0' }}>
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      Quality:
      <select value={quality} onChange={e => setQuality(e.target.value)}>
        <option value="high">High (95%)</option>
        <option value="medium">Medium (80%)</option>
        <option value="low">Low (60%)</option>
      </select>
    </label>
  </div>
}
```

### Merge Order

```jsx
customOptions={
  <div style={{ padding: '12px 0' }}>
    <label>
      <input 
        type="checkbox" 
        checked={sortByName} 
        onChange={e => setSortByName(e.target.checked)}
      />
      Sort files by name before merging
    </label>
  </div>
}
```

---

## 🚀 Advanced: Progress Tracking

For tools with multiple steps, update progress incrementally:

```jsx
const processBatchFile = async (file, index, onProgress) => {
  onProgress(0)

  // Step 1: Load file
  const arrayBuffer = await file.arrayBuffer()
  onProgress(20)

  // Step 2: Parse PDF
  const pdf = await PDFDocument.load(arrayBuffer)
  onProgress(40)

  // Step 3: Process pages
  for (let i = 0; i < pdf.getPageCount(); i++) {
    // Process page
    const pageProgress = 40 + (i / pdf.getPageCount()) * 40
    onProgress(pageProgress)
  }

  // Step 4: Save
  const bytes = await pdf.save()
  onProgress(90)

  // Step 5: Create blob
  const blob = new Blob([bytes], { type: 'application/pdf' })
  onProgress(100)

  return blob
}
```

---

## ⚠️ Common Mistakes

### ❌ Wrong: Not calling onProgress
```jsx
const processBatchFile = async (file, index) => {
  // Missing onProgress calls!
  return blob
}
```

### ✅ Correct: Update progress
```jsx
const processBatchFile = async (file, index, onProgress) => {
  onProgress(0)
  // ... processing
  onProgress(50)
  // ... more processing
  onProgress(100)
  return blob
}
```

### ❌ Wrong: Not re-throwing errors
```jsx
const processBatchFile = async (file, index, onProgress) => {
  try {
    // ...
  } catch (error) {
    console.error(error)
    // Missing: throw error
  }
}
```

### ✅ Correct: Re-throw for proper error handling
```jsx
const processBatchFile = async (file, index, onProgress) => {
  try {
    // ...
  } catch (error) {
    console.error(error)
    throw error // Important!
  }
}
```

---

## 📊 Testing Checklist

Before committing, test each integration:

- [ ] Upload 5 PDFs → Process → All succeed
- [ ] Upload 20 PDFs → Process → Check memory usage
- [ ] Upload 1 corrupted PDF → Should show error, continue with others
- [ ] Pause → Resume → Should work correctly
- [ ] Download single file → Opens correctly
- [ ] Download all as ZIP → Extracts correctly
- [ ] Mobile view → UI responsive
- [ ] Dark mode → Styling correct

---

## 🎯 Performance Tips

### For Client-Side Processing (pdf-lib, jsPDF)

```jsx
// Use async/await properly to avoid blocking
const processBatchFile = async (file, index, onProgress) => {
  // Load PDF
  const arrayBuffer = await file.arrayBuffer()
  onProgress(25)

  // Process in chunks to avoid blocking UI
  const pdf = await PDFDocument.load(arrayBuffer)
  onProgress(50)

  // Save
  const bytes = await pdf.save()
  onProgress(75)

  const blob = new Blob([bytes], { type: 'application/pdf' })
  onProgress(100)

  return blob
}
```

### For Backend API Processing

```jsx
// Use FormData for file uploads
const processBatchFile = async (file, index, onProgress) => {
  const formData = new FormData()
  formData.append('pdf', file)
  
  // Add any options
  formData.append('quality', quality)
  formData.append('mode', mode)
  
  onProgress(20)

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    body: formData,
  })

  onProgress(80)

  const blob = await response.blob()
  onProgress(100)

  return blob
}
```

---

## 🌟 Competitive Advantage

**Why Batch Processing = #1 Differentiator:**

| Feature | DexPDF | iLovePDF | Smallpdf | Adobe |
|---------|---------|----------|----------|-------|
| **Batch Process Files** | ✅ FREE | ❌ $6/mo | ❌ $9/mo | ❌ $12.99/mo |
| **Max Files** | 100 | 25 (paid) | 20 (paid) | 100 (paid) |
| **Download as ZIP** | ✅ | ✅ (paid) | ✅ (paid) | ✅ (paid) |
| **Pause/Resume** | ✅ | ❌ | ❌ | ❌ |
| **Per-file Progress** | ✅ | ❌ | ❌ | ❌ |
| **No File Limit** | ✅ | ❌ 50MB | ❌ 5GB/mo | ❌ 100GB |

**Key Points:**
- 🆓 **FREE unlimited batch processing** (competitors charge $6-13/mo)
- 🚀 **100 files at once** (competitors: 20-25 max)
- ⏸️ **Pause/Resume** (unique feature)
- 📊 **Per-file progress tracking** (better UX)
- 💾 **Individual or ZIP download** (flexibility)

---

## 📚 Next Steps

1. **Start with CompressTool** (✅ Done!)
2. **Follow this guide for MergeTool**
3. **Then SplitTool, PdfToWordTool, etc.**
4. **Test thoroughly** (5-20 files per tool)
5. **Commit each tool separately**
6. **Update PRIORITY_FEATURES_TO_#1.md** progress

---

## 💡 Tips for Success

1. **Copy-paste CompressTool integration** - it's a perfect template
2. **Adjust processFile logic** for your tool's specific needs
3. **Keep progress updates consistent** (10%, 30%, 70%, 100%)
4. **Test with real files** before committing
5. **Add helpful customOptions** for better UX
6. **Document any tool-specific quirks** in comments

---

## 🎉 Congratulations!

You're building **the world's best PDF toolkit** with features that cost $6-13/mo on competitors - **completely FREE**! 

Keep going! 🚀

---

**Created:** October 19, 2025  
**Status:** Active Development  
**Progress:** 1/20 tools integrated (CompressTool ✅)
