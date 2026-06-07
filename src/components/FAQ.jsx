import React, { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'Is DexPDF really free?',
      answer: 'Yes! All tools are 100% free with no hidden charges, subscriptions, or file limits. We believe in accessible tools for everyone.',
    },
    {
      question: 'Are my files safe?',
      answer: 'Absolutely. For most tools, all processing happens directly in your browser. Your files never leave your device. For cloud-powered tools, files are processed securely and deleted immediately.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF, images (JPG, PNG, WebP), Word documents (DOCX), PowerPoint (PPTX), and Excel (CSV). We are constantly adding support for more formats.',
    },
    {
      question: 'Is there a file size limit?',
      answer: 'No strict limits! However, very large files (100MB+) may take longer to process depending on your device capabilities since we process client-side.',
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No account needed! Just visit the site and start using any tool immediately. No signup, no login, no hassle.',
    },
    {
      question: 'Can I use DexPDF on mobile?',
      answer: 'Yes! DexPDF is a Progressive Web App (PWA) that works perfectly on all modern browsers - desktop, tablet, and mobile devices. You can even install it!',
    },
  ]

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
