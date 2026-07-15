/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@qhatu/shared'],
  // StrictMode off: en Next 14 App Router hay casos de soft-nav flaky (la transición
  // de navegación no commitea sola) que se destraban al desactivarlo. Ver lib/nav.ts.
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // Security + caching headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // Transformers.js pulls node-only deps that must not be bundled for the browser.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node$': false,
      sharp$: false,
    }
    return config
  },

  async rewrites() {
    const apiUrl = process.env.API_URL ?? 'http://localhost:3002'
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
