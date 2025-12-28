import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import ClientLayout from '@/components/ClientLayout'
import BottomNav from '@/components/BottomNav'
import { ThemeProvider } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
    title: 'DexPDF - #1 Free Online PDF Tools (Editor, Converter, AI)',
    description: 'The world\'s most advanced, secure, and free online PDF platform. Merge, Split, Edit, Sign, and Translate PDFs with AI. Offline PWA enabled.',
    keywords: ['pdf editor', 'merge pdf', 'split pdf', 'compress pdf', 'pdf to word', 'ai pdf', 'redact pdf', 'sign pdf', 'offline pdf tools', 'dexpdf'],
    authors: [{ name: 'DexPie Team' }],
    creator: 'DexPie',
    manifest: '/manifest.json',
    openGraph: {
        title: 'DexPDF - The Ultimate PDF Ecosystem',
        description: 'Edit, Convert, and Protect PDFs with AI-powered tools. 100% Free and Private.',
        url: 'https://dexpdf.com',
        siteName: 'DexPDF',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DexPDF - Premium PDF Tools',
        description: 'Edit, Convert, and Protect PDFs with AI. 100% Free.',
        creator: '@dexpie',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased",
                inter.variable
            )}>
                {/* Aggressive SW Unregister for Dev Mode */}
                {process.env.NODE_ENV === 'development' && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                if ('serviceWorker' in navigator) {
                                    window.addEventListener('load', function() {
                                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                                            for(let registration of registrations) {
                                                registration.unregister().then(function() {
                                                    console.log('ServiceWorker unregistered.');
                                                });
                                            }
                                        }).catch(function(err) {
                                            console.log('ServiceWorker unregistration failed: ', err);
                                        });
                                    });
                                }
                            `
                        }}
                    />
                )}
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <ClientLayout>
                        {children}
                        <BottomNav />
                    </ClientLayout>
                </ThemeProvider>
            </body>
        </html>
    )
}
