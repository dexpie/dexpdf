# DexPDF - The Ultimate PDF Ecosystem 🚀

![DexPDF Banner](/public/assets/hero-bg.png)

**DexPDF** is a premium, open-source PDF utility suite built for the modern web. 
It combines **SaaS-level aesthetics** with **privacy-first architecture**, processing files directly in your browser using WebAssembly and bleeding-edge web technologies.

> **World No. 1 Requirement:** Created to rival iLovePDF/SmallPDF in both functionality and design, but 100% Free.

## ✨ Key Features

### 🛠️ Professional Tool Suite
-   **Merge & Split**: Combine or separate PDFs with drag-and-drop ease.
-   **Compress**: Squeeze file sizes without losing quality.
-   **Convert**: PDF to Word, Images to PDF, and more.
-   **Organize**: Visual page reordering and rotation.
-   **OCR**: Extract text from scanned documents (Image/PDF) with multi-language support.

### 🤖 AI Intelligence (New!)
-   **Chat with PDF**: "Talk" to your documents. Local AI searches and summarizes content instantly without API keys.
-   **Smart Inputs**: Auto-detects emails and phone numbers from CVs/Resumes.

### 🛡️ Privacy & Performance
-   **100% Client-Side**: Files mostly stay on your device (processed via `pdf-lib` and `pdf.js`).
-   **PWA Ready**: Install as a desktop/mobile app for offline use.
-   **Local History**: "My Documents" feature keeps track of your work without a database.

### 🎨 Premium Experience
-   **Glassmorphism UI**: Beautiful, responsive design containing rich animations.
-   **Dark Mode**: Fully supported system-wide theme.
-   **Multi-language**: Native support for English (EN) and Indonesian (ID).

## 🏗️ Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + Shadcn/UI
-   **Animations**: Framer Motion
-   **PDF Engine**: `pdf-lib`, `pdfjs-dist`
-   **OCR**: `tesseract.js`
-   **PWA**: `next-pwa`

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dexpie/dexpdf.git

# Navigate to directory
cd dexpdf

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Building for Production

```bash
npm run build
npm start
```

## 📱 PWA Features
DexPDF is a Progressive Web App.
-   **Installable**: Click the "Install App" button in the navbar.
-   **Offline**: Works without internet (for local tools).
-   **Native Feel**: Launch from dock/taskbar.

## 🤝 Contributing

We welcome contributions! Please fork the repo and submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by DexPie**
