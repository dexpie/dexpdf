import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
    title: 'DexPDF - Premium PDF Tools',
    description: 'The most advanced, secure, and free online PDF tools. Merge, Split, Compress, and Edit PDFs with SaaS-level quality.',
    manifest: '/manifest.json',
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
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    )
}
