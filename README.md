# DexPDF

[![CI](https://github.com/dexpie/dexpdf/actions/workflows/ci.yml/badge.svg)](https://github.com/dexpie/dexpdf/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

![DexPDF logo](./public/assets/logo-dexpdf.svg)

DexPDF is an open-source, local-first workspace for everyday PDF and QR tasks. It includes 54 public tools for organizing, converting, securing, reading, and creating documents in a responsive Next.js application.

Most tools run directly in the browser. Optional cloud integrations are available for AI, OCR, and office conversions where browser-only processing cannot provide the same fidelity.

- Live application: [dexpdf.com](https://dexpdf.com)
- License: [MIT](./LICENSE)
- Contributing guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Security policy: [SECURITY.md](./SECURITY.md)

## Highlights

- Merge, split, compress, rotate, crop, reorder, watermark, redact, and sign PDFs.
- Convert between PDF, images, text, HTML, Markdown, CSV, RTF, DOCX, XLSX, and PPTX workflows.
- Extract text from scanned documents with local Tesseract OCR or optional cloud OCR.
- Create and read QR codes, including custom colors, shapes, and logos.
- Generate invoices, resumes, and certificates.
- Installable PWA with responsive light and dark themes.
- English and Indonesian interface support.
- No account required for the core local experience.

## Processing And Privacy

DexPDF uses two processing modes:

| Mode | File handling | Typical tools |
| --- | --- | --- |
| Local browser | Files stay on the user's device | Merge, split, organize, image export, local OCR, QR tools |
| Optional cloud | The selected file or extracted text is sent to a configured provider | High-fidelity Office conversion, cloud OCR, AI tools |

When a tool offers both local and cloud processing, cloud mode is presented separately. Do not use cloud processing for confidential documents unless you trust and have reviewed the configured provider.

Browser-based Office conversion is intentionally a fallback. Complex fonts, charts, animations, forms, and page layouts may not match Microsoft Office or LibreOffice exactly.

## Tech Stack

- Next.js 14 with the App Router
- React 18 and TypeScript
- Tailwind CSS and Framer Motion
- `pdf-lib` and `pdfjs-dist`
- `jspdf`, `html2canvas`, and `docx`
- Tesseract.js for local OCR
- Gemini, OCR.Space, and ConvertAPI as optional integrations
- `next-pwa` for installable and offline-capable local workflows

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

| Variable | Purpose | Required |
| --- | --- | --- |
| `GEMINI_API_KEY` | Chat, summarization, and translation features | No |
| `OCR_SPACE_API_KEY` | Cloud OCR fallback | No |
| `CONVERT_API_SECRET` | High-fidelity PDF and Office conversion | No |

Never commit `.env` or `.env.local`. These files are ignored by Git.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run audit:tools` | Validate public tool routes and runtime mappings |
| `npm run build` | Create a production build |
| `npm run smoke:tools` | Smoke-test production routes after a build |
| `npm run verify` | Run the tool audit, typecheck, build, and route smoke test |
| `npm start` | Start the production server |

Before opening a pull request, run:

```bash
npm run verify
```

## Project Structure

```text
src/
  app/                 Next.js pages, metadata, sitemap, and API routes
  components/          Shared application and tool UI
  config/tools.tsx     Public tool catalog
  tools/               Tool implementations
  utils/               PDF, download, storage, and worker helpers
scripts/
  audit-tools.mjs      Public tool integrity audit
  smoke-tools.mjs      Production route smoke test
public/                Static application assets
```

Public tools are registered in `src/config/tools.tsx` and mapped to implementations in `src/components/tools/ToolContainer.jsx`. The audit script checks that every published tool has a unique route and a runnable component.

## Contributing

Bug fixes, accessibility improvements, documentation, translations, and focused tool upgrades are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Please keep feature claims accurate. If a conversion is heuristic, browser-limited, or requires a third-party service, document that behavior clearly in both the UI and the pull request.

## Security

Do not upload private documents, API keys, or personal data to public issues. See [SECURITY.md](./SECURITY.md) for responsible vulnerability reporting and the project's cloud-processing boundaries.

## License

DexPDF is available under the [MIT License](./LICENSE).

Copyright (c) 2025 DexPie.
