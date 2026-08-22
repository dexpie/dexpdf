const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    clientsClaim: true,
    skipWaiting: true,
    cleanupOutdatedCaches: true,
    runtimeCaching: [
        {
            urlPattern: /\/fonts\/.+\.(woff2?|ttf)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'dexpdf-fonts',
                expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [200] },
            },
        },
        {
            urlPattern: /\/pdfjs\/.+\.js$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'dexpdf-pdfjs-worker',
                expiration: { maxEntries: 6, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [200] },
            },
        },
        {
            urlPattern: /\/assets\/.+\.(svg|png|jpe?g|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'dexpdf-static-assets',
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [200] },
            },
        },
    ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        unoptimized: true, // Optional: Reduces CPU usage for image optimization
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
                os: false,
                stream: false,
                worker_threads: false,
                canvas: false,
                http: false,
                https: false,
                zlib: false,
                url: false,
                util: false,
                buffer: false,
                assert: false,
                process: false,
                child_process: false, // Added specifically for some libs
                tls: false,
                net: false,
            };
        }

        // Explicitlyalias node: protocols to false as well
        config.resolve.alias = {
            ...config.resolve.alias,
            'node:fs': false,
            'node:path': false,
            'node:os': false,
            'node:stream': false,
            'node:https': false,
            'node:http': false,
            'node:util': false,
            'node:url': false,
            'node:zlib': false,
            'node:buffer': false,
            'node:assert': false,
            'node:process': false,
            'node:child_process': false,
            canvas: false
        };

        // Fix for "UnhandledSchemeError: Reading from 'node:fs'"
        config.plugins.push(
            new webpack.NormalModuleReplacementPlugin(
                /^node:/,
                (resource) => {
                    resource.request = resource.request.replace(/^node:/, "");
                }
            )
        );

        return config;
    },
}

module.exports = withPWA(nextConfig)
