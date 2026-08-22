# DexPDF

[![CI](https://github.com/dexpie/dexpdf/actions/workflows/ci.yml/badge.svg)](https://github.com/dexpie/dexpdf/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-vitest-brightgreen.svg)](#commands)

![DexPDF logo](./public/assets/logo-dexpdf.svg)

DexPDF is an open-source, local-first workspace for everyday PDF and QR tasks — **55 tools** for organizing, converting, securing, reading, and creating documents, wrapped in the "Vault & Paper" design system with light and dark themes.

**Your files are processed on your device by default.** Compression, merging, splitting, OCR, PDF-to-Word, signing, and most other workflows run entirely in your browser. The few cloud-assisted paths are strictly opt-in and clearly labeled before anything leaves your device.

- Live application: [dexpdf](https://dexpdf.vercel.app)
- How local processing works: [/how-it-works](https://dexpdf.vercel.app/how-it-works)
- License: [MIT](./LICENSE)
- Contributing guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Security policy: [SECURITY.md](./SECURITY.md)

## Highlights

- Organize PDFs: merge, split, compress (Smart/Lossless/Flatten modes), rotate, crop, reorder, watermark, redact, page numbers, header & footer, flatten, scrub metadata.
- **Batch Pipeline**: compress → merge → protect multiple PDFs in a single local run.
- Convert between PDF, images (JPG/PNG/WebP), text, HTML, Markdown, CSV, RTF, DOCX, XLSX, PPTX, and EPUB.
- Extract text from scanned documents with local Tesseract OCR — including Indonesian, Javanese, and Sundanese language models.
- Secure: password protection, password removal (with the known password), visual signing with flatten-locking.
- Create and read QR codes with custom colors, shapes, and logos.
- Generate invoices, resumes, certificates, and more.
- Installable PWA that genuinely works offline — fonts, the PDF.js worker, and assets are cache-first after your first visit.
- Light and dark themes ("daylight desk" and "the vault"), English and Indonesian interface.
- No account required. No tracking enabled by default.

## Processing And Privacy

Every tool carries a classification badge shown before you use it:

| Badge | What happens to your file | Typical tools |
| --- | --- | --- |
| `100% LOCAL` | Processing runs entirely in your browser. Works offline. Nothing is uploaded — not even analytics run by default. | Merge, split, compress, pipeline, sign, redact, OCR, PDF→Word, QR tools |
| `CLOUD OPT-IN` | A cloud provider can produce higher fidelity for complex layouts — only when you explicitly pick it, with an upload warning first. | Exact-layout DOCX conversion, optional cloud OCR |
| `BYOK AI` | Uses **your own** Gemini API key. Requests go from your browser straight to Google; there is no server-side proxy in this project. | Chat with PDF, summarizer, translator, quiz generator |

Additional guarantees:

- The PDF.js worker and all fonts are self-hosted — no CDN requests.
- Analytics are disabled unless you configure a Cloudflare Web Analytics token yourself (`NEXT_PUBLIC_CF_BEACON_TOKEN`); the beacon is cookieless and aggregate-only.
- Processing history lives in `localStorage` on the user's device and can be backed up/restored as JSON or exported as CSV from *My Documents*.
- Browser-based Office conversion is intentionally a fallback. Complex fonts, charts, animations, forms, and page layouts may not match Microsoft Office or LibreOffice exactly.

## Tech Stack

- Next.js 14 with the App Router
- React 18 and TypeScript
- Tailwind CSS and Framer Motion
- `pdf-lib`, `pdfjs-dist`, and `pdf-lib-plus-encrypt`
- `jspdf`, `html2canvas`, and `docx`
- Tesseract.js for local OCR
- Gemini (bring-your-own-key), OCR.Space, and ConvertAPI as optional integrations
- Vitest for unit tests
- `next-pwa` for installable, offline-capable local workflows

## Quick Start

### Requirements

- Node.js 18.17 or newer
- npm 9 or newer

### Install

```bash
git clone https://github.com/dexpie/dexpdf.git
cd dexpdf
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No API key is required for local tools. To enable optional integrations, create `.env.local` from the provided example:

```bash
cp .env.local.example .env.local
```

On PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

## Environment Variables

All integrations are optional. Without them, the app is fully local and fully silent.

| Variable | Purpose | Required |
| --- | --- | --- |
| `GEMINI_API_KEY` | Optional shared key for AI features (users can always use their own key instead) | No |
| `OCR_SPACE_API_KEY` | Cloud OCR fallback for the explicit cloud mode | No |
| `CONVERT_API_SECRET` | High-fidelity Office conversion for the explicit cloud mode | No |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics (cookieless, aggregate). Empty = fully silent. | No |

Never commit `.env` or `.env.local`. These files are ignored by Git.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (vitest) |
| `npm run audit:tools` | Validate public tool routes and runtime mappings |
| `npm run build` | Create a production build |
| `npm run smoke:tools` | Smoke-test production routes after a build |
| `npm run verify` | Tool audit + typecheck + build + route smoke test |
| `npm start` | Start the production server |

Before opening a pull request, run:

```bash
npm test
npm run verify
```

## Project Structure

```text
src/
  app/                 Next.js pages, metadata, dynamic OG images, sitemap, API routes
  components/          Shared application UI and shadcn-style primitives (ui/)
  config/tools.tsx     Public tool catalog
  tools/               Tool implementations (one component per tool id)
  hooks/               Local storage-backed state (history, preferences, PWA)
  lib/                 SEO helpers and utilities
  services/            Third-party clients (Gemini BYOK)
  utils/               PDF, text-layout, storage, and worker helpers
    __tests__/         Unit tests (vitest)
scripts/
  audit-tools.mjs      Public tool integrity audit
  smoke-tools.mjs      Production route smoke test
public/
  assets/              Logo and static images
  fonts/               Self-hosted woff2 fonts
  pdfjs/               Self-hosted PDF.js worker
```

Public tools are registered in `src/config/tools.tsx` and mapped to implementations in `src/components/tools/ToolContainer.jsx`. The audit script checks that every published tool has a unique route, a runnable component, shared layout usage, and no remote script dependencies. Dynamic Open Graph images are generated per route via `opengraph-image.jsx` files.

## Contributing

Bug fixes, accessibility improvements, documentation, translations, and focused tool upgrades are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Please keep feature claims accurate. If a conversion is heuristic, browser-limited, or requires a third-party service, document that behavior clearly in both the UI and the pull request.

## Security

Do not upload private documents, API keys, or personal data to public issues. See [SECURITY.md](./SECURITY.md) for responsible vulnerability reporting and the project's cloud-processing boundaries.

## License

DexPDF is available under the [MIT License](./LICENSE).

Copyright (c) 2025–2026 DexPie.
