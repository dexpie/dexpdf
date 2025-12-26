import React from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, Zap, CircleDollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Features() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: Shield,
      title: mounted ? t('features.secure_title', '100% Secure') : '100% Secure',
      description: mounted ? t('features.secure_desc', 'Your files never leave your browser for sensitive tools. We prioritize your privacy above all else.') : 'Your files never leave your browser for sensitive tools. We prioritize your privacy above all else.',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: Zap,
      title: mounted ? t('features.fast_title', 'Lightning Fast') : 'Lightning Fast',
      description: mounted ? t('features.fast_desc', 'Experience instant processing with our modern browser-based technology. No queue, no waiting.') : 'Experience instant processing with our modern browser-based technology. No queue, no waiting.',
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      icon: CircleDollarSign,
      title: mounted ? t('features.free_title', 'Completely Free') : 'Completely Free',
      description: mounted ? t('features.free_desc', 'No hidden costs, no premium-only features. DexPDF is open and free for everyone forever.') : 'No hidden costs, no premium-only features. DexPDF is open and free for everyone forever.',
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <section className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-slate-900 mb-4"
          >
            {mounted ? t('features.title', 'Why Choose DexPDF?') : 'Why Choose DexPDF?'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500"
          >
            {mounted ? t('features.subtitle', 'We combine security, speed, and simplicity to give you the best PDF experience.') : 'We combine security, speed, and simplicity to give you the best PDF experience.'}
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
