import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const siteIndexable = process.env.SITE_INDEXABLE === 'true'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  async redirects() {
    // `/` → `/es` siempre; nunca por IP ni Accept-Language (CLAUDE.md §5)
    return [{ source: '/', destination: '/es', permanent: true }]
  },
  async headers() {
    // Hasta el lanzamiento, todo lleva noindex, incluidos .md y llms*.txt (CLAUDE.md §7.3)
    if (siteIndexable) return []
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] }]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
