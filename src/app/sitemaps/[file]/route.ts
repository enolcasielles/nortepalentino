import { isLocale } from '@/lib/i18n'
import { localeSitemapXml } from '@/lib/seo/sitemap'

// /sitemaps/es.xml · /sitemaps/en.xml
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const locale = file.replace(/\.xml$/, '')
  if (!file.endsWith('.xml') || !isLocale(locale)) return new Response(null, { status: 404 })
  return new Response(await localeSitemapXml(locale), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' },
  })
}
