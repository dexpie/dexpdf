import React, { useState } from 'react'

// FAQ component inspired by shadcn/ui and Radix UI
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'Is DexPDF really free?',
      answer: 'Yes! All tools are 100% free with no hidden charges, subscriptions, or file limits.',
    },
    {
      question: 'Are my files safe?',
      answer: 'Absolutely. All processing happens in your browser. Your files never leave your device or get uploaded to any server.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF, images (JPG, PNG), Word documents (DOCX), PowerPoint (PPTX), and more formats are added regularly.',
    },
    {
      question: 'Is there a file size limit?',
      answer: 'No strict limits! However, very large files (100MB+) may take longer to process depending on your device.',
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No account needed! Just visit the site and start using any tool immediately.',
    },
    {
      question: 'Can I use DexPDF on mobile?',
      answer: 'Yes! DexPDF works on all modern browsers - desktop, tablet, and mobile devices.',
    },
  ]

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">Everything you need to know about DexPDF</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className={`faq-question ${openIndex === index ? 'active' : ''}`}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                <svg
                  className={`faq-icon ${openIndex === index ? 'rotate' : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
