import React from 'react'

// Feature component inspired by Tailwind UI
export default function Features() {
  const features = [
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'All processing happens in your browser. Your files never leave your device.',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Modern algorithms ensure quick processing, even for large PDFs.',
    },
    {
      icon: '🆓',
      title: '100% Free',
      description: 'All tools are completely free with no hidden charges or subscriptions.',
    },
    {
      icon: '📱',
      title: 'Works Everywhere',
      description: 'Use on any device - desktop, tablet, or mobile. No installation needed.',
    },
    {
      icon: '🎨',
      title: 'Easy to Use',
      description: 'Simple, intuitive interface that anyone can use without training.',
    },
    {
      icon: '🔄',
      title: 'Always Updated',
      description: 'Regular updates with new features and improvements based on user feedback.',
    },
  ]

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">Why Choose DexPDF?</h2>
          <p className="features-subtitle">Everything you need for PDF management, right in your browser</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
