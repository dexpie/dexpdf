'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, FileQuestion } from 'lucide-react'
import ClientLayout from '@/components/ClientLayout'

export default function NotFound() {
    return (
        <ClientLayout>
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-lg"
                >
                    <div className="relative inline-block mb-8">
                        <FileQuestion className="w-32 h-32 text-slate-200" />
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="absolute -bottom-2 -right-2 text-6xl"
                        >
                            🤔
                        </motion.div>
                    </div>

                    <h1 className="text-8xl font-black text-slate-900 mb-2 tracking-tighter">404</h1>
                    <h2 className="text-2xl font-bold text-slate-600 mb-6">Page Not Found</h2>

                    <p className="text-slate-500 mb-8 text-lg">
                        Oops! It seems this document got lost in the digital void.
                        Maybe it was redacted?
                    </p>

                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-xl flex items-center gap-2 mx-auto transition-colors"
                        >
                            <Home className="w-5 h-5" /> Return to Base
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </ClientLayout>
    )
}
