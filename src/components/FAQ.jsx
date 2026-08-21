'use client'

import React, { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'

const DEFAULT_FAQS = [
  {
    question: 'Is DexPDF really free?',
    answer: 'Yes. DexPDF gives you access to the core PDF, QR, and document workflow tools without requiring a paid account for the standard experience.',
  },
  {
    question: 'Are my files safe?',
    answer: 'Every tool shows a processing badge before you use it. Local tools run in your browser and do not upload files to DexPDF. Cloud, OCR, and AI tools either offer or require server processing; those tools send the file or extracted text needed for the selected action.',
  },
  {
    question: 'What file formats are supported?',
    answer: 'DexPDF supports PDF, JPG, PNG, WebP, DOCX, PPTX, XLSX, and common text formats depending on the tool. The input formats and the 50 MB per-file limit are shown on each tool page.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No. You can open the site and start using tools right away for the main workflow.',
  },
  {
    question: 'Can I use DexPDF on mobile?',
    answer: 'Yes. DexPDF is designed to work on modern mobile and desktop browsers and can behave like an installable web app on supported devices.',
  },
  {
    question: 'How long are server-processed files retained?',
    answer: 'DexPDF does not intentionally keep processed files in its own application storage after the response is delivered. Cloud conversion, OCR, or AI providers may temporarily process or retain data under their own policies, so use Local mode for confidential files when available and read the Privacy Policy for the current details.',
  },
]

export default function FAQ({ faqs = DEFAULT_FAQS }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know about DexPDF features and security.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`glass rounded-2xl transition-colors ${openIndex === index ? 'border-primary/30' : ''}`}
            >
              <button
                className="w-full px-6 py-4.5 py-5 flex items-center justify-between gap-4 text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className={`font-semibold transition-colors ${openIndex === index ? 'text-primary' : 'text-foreground'}`}>
                  {faq.question}
                </span>
                <div className={`shrink-0 p-1.5 rounded-full transition-colors ${openIndex === index ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>

              <div className={`accordion-content ${openIndex === index ? 'open' : ''}`}>
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
