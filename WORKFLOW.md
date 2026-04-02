# DexPDF - Documentation

## Overview
DexPDF is a comprehensive PDF tools web application built with Next.js 14. It provides 40+ PDF tools for merging, splitting, compressing, converting, and more - all client-side for privacy.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | Framework |
| React 18 | UI Library |
| Tailwind CSS | Styling |
| TypeScript | Type Safety |
| pdfjs-dist | PDF parsing |
| pdf-lib | PDF manipulation |
| tesseract.js | OCR |
| @google/generative-ai | AI features |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (convert, gemini, ocr)
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles & CSS variables
├── components/            # Reusable React components
│   ├── common/           # Shared UI components
│   │   ├── FileDropZone.jsx
│   │   ├── ToolLayout.jsx
│   │   ├── ActionButtons.jsx
│   │   └── ResultPage.jsx
│   ├── NavBar.jsx
│   ├── ToolGrid.tsx
│   └── ToolCard.jsx
├── config/               # Configuration
│   └── tools.tsx         # Tool definitions & categories
├── tools/                # Individual tool implementations (100+)
└── utils/                # Utility functions
```

## Design System

### CSS Variables (globals.css)

The app uses CSS custom properties for consistent theming:

```css
:root {
  /* Light mode - Soft neutral palette */
  --background: 220 20% 97%;
  --foreground: 220 15% 20%;
  --primary: 211 85% 55%;
  --secondary: 220 15% 94%;
  --muted: 220 15% 94%;
  --muted-foreground: 220 10% 45%;
  --border: 220 15% 88%;
  --card: 0 0% 100%;
}

.dark {
  /* Dark mode - Softer, less harsh */
  --background: 220 20% 10%;
  --foreground: 220 15% 92%;
  /* ... */
}
```

### Usage in Components
```jsx
// Use design system classes
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
  <div className="border-border bg-card">
```

## Tool Categories

| Category | Tools |
|----------|-------|
| **Organize** | Merge, Split, Compress, Rotate, Crop, Organize Pages, Edit, Watermark, Page Numbers, Repair, Flatten, Redact, Compare PDF, Scrub |
| **Convert** | PDF to Word/Excel/PPT/Images, Word/Excel/PPT to PDF, HTML to PDF, PDF to PDF/A, OCR, Scan to PDF, PDF to Text |
| **Security** | Unlock PDF, Protect PDF, Sign PDF |
| **Create** | Invoice Generator, Resume Builder, Certificate Maker, Chat with PDF, AI Summarizer, Smart Organizer, Translate PDF |

## Key Components

### ToolCard
Displays individual tool with icon, title, description. Uses category-based styling.

### ToolGrid
Main tool discovery with search and category filtering.

### FileDropZone
Drag-and-drop file upload with validation.

### ToolLayout
Standard wrapper for tool pages with header, steps, trust section.

## Processing Types

1. **Client-side** - Most tools use browser libraries (pdfjs, pdf-lib)
2. **Server-side** - Complex conversions use ConvertAPI (`/api/convert`)
3. **AI-powered** - Gemini AI for Chat/Summarize/Translate (`/api/gemini`)

## Running Locally

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## Environment Variables

Create `.env.local`:
```env
CONVERT_API_SECRET=your_convertapi_key
GEMINI_API_KEY=your_gemini_key
```