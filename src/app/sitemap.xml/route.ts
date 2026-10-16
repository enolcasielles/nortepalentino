import { sitemapIndexXml } from '@/lib/seo/sitemap'

// Índice de sitemaps: uno por idioma (CLAUDE.md §7.3)
export function GET() {
  return new Response(sitemapIndexXml(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' },
  })
}
