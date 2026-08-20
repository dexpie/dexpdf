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
    <section className="py-24 bg-[#F8FAFC]">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">Everything you need to know about DexPDF features and security.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl border transition-colors ${openIndex === index ? 'border-blue-200 shadow-md' : 'border-border shadow-sm hover:border-blue-100'}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className={`text-lg font-semibold transition-colors ${openIndex === index ? 'text-blue-600' : 'text-foreground'}`}>
                  {faq.question}
                </span>
                <div className={`p-2 rounded-full transition-colors ${openIndex === index ? 'bg-blue-50 text-blue-600' : 'bg-secondary text-muted-foreground'}`}>
                  {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
              </button>

              <div className={`accordion-content ${openIndex === index ? 'open' : ''}`}>
                <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed border-t border-border mt-2 pt-4">
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
