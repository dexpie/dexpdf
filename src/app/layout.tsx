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
    metadataBase: new URL('https://dexpdf.com'),
    title: 'DexPDF - Practical PDF Tools',
    description: 'Merge, split, edit, convert, sign, and organize PDF documents in one workspace.',
    keywords: ['pdf editor', 'merge pdf', 'split pdf', 'compress pdf', 'pdf to word', 'ai pdf', 'redact pdf', 'sign pdf', 'offline pdf tools', 'dexpdf'],
    authors: [{ name: 'DexPie Team' }],
    creator: 'DexPie',
    manifest: '/manifest.json',
    openGraph: {
        title: 'DexPDF - The Ultimate PDF Ecosystem',
        description: 'Edit, convert, protect, and organize PDF documents in one practical workspace.',
        url: 'https://dexpdf.com',
        siteName: 'DexPDF',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DexPDF - Premium PDF Tools',
        description: 'Edit, convert, protect, and organize PDF documents.',
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
