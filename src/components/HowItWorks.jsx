import React from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Settings, Download } from 'lucide-react'

export default function HowItWorks() {
    const steps = [
        {
            icon: UploadCloud,
            title: 'Upload your files',
            desc: 'Files are safely uploaded over an encrypted connection. Files stay secure and private.',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: Settings,
            title: 'Select tools',
            desc: 'Crop, merge, rotate, or convert your files with our easy-to-use interface.',
            color: 'bg-indigo-100 text-indigo-600'
        },
        {
            icon: Download,
            title: 'Download file',
            desc: 'Get your converted file instantly. No registration or email required.',
            color: 'bg-green-100 text-green-600'
        }
    ]

    return (
        <section className="py-20 bg-white border-b border-slate-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">How DexPDF Works</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Simple, fast, and secure. We make PDF management effortless for everyone.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10"></div>

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            <div className={`w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 border-4 border-white`}>
                                <step.icon className="w-10 h-10" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold mb-4 border-4 border-white shadow-sm">
                                {idx + 1}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                            <p className="text-slate-500 leading-relaxed px-4">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
