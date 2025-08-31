# dexpdf
=======
# dexpdf

dexpdf is a small client-side PDF toolkit built with React + Vite. It provides basic tools similar to small PDF services: merge PDFs, extract pages, and create PDFs from images — all in the browser (no server required).

Features
- Merge multiple PDFs into one
- Split / extract selected pages from a PDF
- Convert images into a single PDF

Quickstart (locally)

1. Install dependencies

```powershell
npm install
```

2. Run dev server

```powershell
npm run dev
```

3. Build for production

```powershell
npm run build
```

Deploy to Vercel

1. Sign in to Vercel and create a new project.
2. Import this repository (or push it to GitHub and import there).
3. Set framework to "Other" or auto-detected. Build command: `npm run build`. Output directory: `dist`.
4. Deploy. The app is a static site and will be served from the generated `dist` folder.

Notes and limitations
- All processing happens client-side. Large files may be slow or memory-heavy in the browser.
- Use modern browsers for best PDF API support.

Next steps (optional)
- Add progress UI and drag/drop reordering for files.
- Add server-side conversion endpoints for heavy workloads.
>>>>>>> 1c21bca (Initial commit: dexpdf — client-side PDF tools (merge, split, images->pdf, pdf->images))
