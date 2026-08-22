import { TOOLS } from '@/config/tools'

export const SITE_URL = 'https://dexpdf.com'
export const SITE_NAME = 'DexPDF'
export const DEFAULT_OG_IMAGE = '/assets/icon-512.png'
export const SITE_DESCRIPTION =
  'Merge, compress, convert, sign, secure, and organize PDF files in one local-first workspace.'

export const HOME_FAQS = [
  {
    question: 'Is DexPDF free to use?',
    answer:
      'Yes. DexPDF offers free access to its PDF, QR, convert, and document workflow tools without requiring an account for the core experience.',
  },
  {
    question: 'Do files stay private in DexPDF?',
    answer:
      'Every tool shows whether it is Local, Cloud/AI, or Server. Local tools run directly in your browser, while Cloud, OCR, and AI tools may send the file or extracted text needed for that action.',
  },
  {
    question: 'What can I do with DexPDF?',
    answer:
      'You can merge, split, compress, convert, sign, redact, OCR, generate QR codes, scan QR codes, and create common business documents from one workspace.',
  },
  {
    question: 'Does DexPDF work on mobile?',
    answer:
      'Yes. DexPDF is designed to work on modern mobile and desktop browsers, including installable PWA support for repeat workflows.',
  },
  {
    question: 'What is the file limit and server retention policy?',
    answer:
      'The current limit is 50 MB per file and there is no daily free-tier limit currently enforced. DexPDF does not intentionally persist processed files in its own application storage after delivery, but third-party Cloud, OCR, or AI providers may temporarily process or retain data under their policies.',
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  organize: 'PDF organization',
  convert: 'document conversion',
  security: 'PDF security',
  create: 'document creation',
}

const FEATURED_TOOL_IDS = ['merge', 'compress', 'pdf2word', 'protect', 'signature', 'qr-code']

function sentenceCase(text: string) {
  if (!text) return text
  return text.charAt(0).toLowerCase() + text.slice(1)
}

export function getAbsoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}

export function getToolById(toolId: string) {
  return TOOLS.find(tool => tool.id === toolId) || null
}

export function getToolPath(toolId: string) {
  const tool = getToolById(toolId)
  return tool?.href || `/${toolId}`
}

export function getRelatedTools(toolId: string, limit = 3) {
  const tool = getToolById(toolId)
  if (!tool) return []

  return TOOLS.filter(item => item.id !== tool.id && item.category === tool.category).slice(0, limit)
}

export function getToolSeoCopy(toolId: string) {
  const tool = getToolById(toolId)
  if (!tool) return null

  const action = sentenceCase(tool.description.replace(/\.$/, ''))
  const categoryLabel = CATEGORY_LABELS[tool.category] || 'document work'

  return {
    title: `${tool.title} Online`,
    description: `${tool.title} with DexPDF. ${tool.description} Fast browser workflow, no sign-up, and practical controls for ${categoryLabel.toLowerCase()}.`,
    keywords: [
      tool.title.toLowerCase(),
      `${tool.title.toLowerCase()} online`,
      `${tool.title.toLowerCase()} free`,
      'pdf tools',
      'dexpdf',
      tool.category,
    ],
    intro: `${tool.title} helps you ${action} in a fast workspace built for repeat document jobs. Open a file, adjust the settings you need, and export the result without extra ceremony.`,
    benefits: [
      `Practical controls for ${categoryLabel.toLowerCase()} without leaving the browser.`,
      'A clear step-by-step flow that works well for one-off files and repeated tasks.',
      'Privacy-aware defaults for teams and individuals handling everyday documents.',
    ],
    steps: [
      `Open the ${tool.title} tool and add your file.`,
      'Review the available settings and choose the result you want.',
      'Process the document and download the updated file right away.',
    ],
  }
}

export function getHomeStructuredData() {
  const featuredTools = FEATURED_TOOL_IDS
    .map(id => getToolById(id))
    .filter(Boolean)

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: getAbsoluteUrl('/assets/logo-dexpdf.svg'),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Merge PDF',
        'Compress PDF',
        'Convert PDF to Word',
        'Protect PDF',
        'Sign PDF',
        'QR code generation and scanning',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Featured DexPDF tools',
      itemListElement: featuredTools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool?.title,
        url: getAbsoluteUrl(tool?.href || '/'),
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: HOME_FAQS.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ]
}

export function getToolStructuredData(toolId: string) {
  const tool = getToolById(toolId)
  const seo = getToolSeoCopy(toolId)
  if (!tool || !seo) return []

  const toolPath = tool.href || `/${tool.id}`

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `${tool.title} - ${SITE_NAME}`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: getAbsoluteUrl(toolPath),
      description: seo.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: seo.benefits,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: tool.title,
          item: getAbsoluteUrl(toolPath),
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to ${tool.title.toLowerCase()} with ${SITE_NAME}`,
      totalTime: 'PT1M',
      step: seo.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: `Step ${index + 1}`,
        text: step,
        url: `${getAbsoluteUrl(toolPath)}#step-${index + 1}`,
      })),
    },
  ]
}
