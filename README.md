
# dexpdf

![CI](https://github.com/dexpie/dexpdf/actions/workflows/ci.yml/badge.svg)

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

Workerized processing (Batch Watermark)
- The Batch Watermark tool performs CPU-bound PDF edits using an inline Web Worker so the UI remains responsive during processing.
- Cancellation: pressing "Cancel" sends an abort message to the worker; the worker cooperatively stops and the UI is updated.
- Fallback: if the browser or build environment cannot create the worker, the tool falls back to in-thread processing.

How to test
- Start the dev server: `npm run dev` and open the app.
- Open the "Batch Watermark" tool from the tools list, select multiple small PDF files, set the watermark text and click "Apply Watermark & Download ZIP".
- Observe the global progress bar and per-file progress. Try clicking Cancel to ensure processing stops.

Contributing & CI
- Contributions welcome. Please fork and open a PR against `main`.
- This repository includes a GitHub Actions workflow `.github/workflows/ci.yml` which runs `npm ci` and `npm run build` on pushes and PRs — the badge near the top of this README shows CI status.

Changelog (recent)
- 2025-10-15: Workerized Batch Watermark processing (inline module worker + fallback). Added worker helpers and README notes. CI workflow and badges available.

