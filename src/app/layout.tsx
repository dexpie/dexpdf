import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import BottomNav from '@/components/BottomNav'
import { ThemeProvider } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo'

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
})

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} - Practical PDF and QR Tools`,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: ['pdf editor', 'merge pdf', 'split pdf', 'compress pdf', 'pdf to word', 'ai pdf', 'redact pdf', 'sign pdf', 'offline pdf tools', 'dexpdf'],
    authors: [{ name: 'DexPie Team' }],
    creator: 'DexPie',
    publisher: 'DexPie',
    manifest: '/manifest.json',
    alternates: {
        canonical: SITE_URL,
    },
    category: 'productivity',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    },
    openGraph: {
        title: `${SITE_NAME} - Local-First PDF and QR Workspace`,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        siteName: SITE_NAME,
        locale: 'en_US',
        type: 'website',
        images: [
            {
                url: DEFAULT_OG_IMAGE,
                width: 512,
                height: 512,
                alt: `${SITE_NAME} icon`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${SITE_NAME} - PDF and QR Workspace`,
        description: SITE_DESCRIPTION,
        creator: '@dexpie',
        images: [DEFAULT_OG_IMAGE],
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
                plusJakarta.variable
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
