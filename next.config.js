const withPWA = require('next-pwa')({
    dest: 'public',
    disable: false, // Enable PWA in all environments for testing
    register: true,
    skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
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
