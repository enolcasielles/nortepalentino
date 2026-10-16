import { getSites } from '@/lib/data/site'
import { locales, type Locale } from '@/lib/i18n'
import { absoluteUrl, homePath } from '@/lib/routes'
import { siteInventory } from '@/lib/routes/inventory'
import { pathInSite } from '@/lib/routes/match'

const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const sitemapPath = (locale: Locale) => `/sitemaps/${locale}.xml`

export function sitemapIndexXml(): string {
  const items = locales.map((l) => `  <sitemap><loc>${xmlEscape(absoluteUrl(sitemapPath(l)))}</loc></sitemap>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`
}

// Sitemap de un idioma con sus alternativas hreflang. Solo URLs que existen
// según §7.4 (las mismas que genera el catch-all).
export async function localeSitemapXml(locale: Locale): Promise<string> {
  const sites = await getSites()
  const site = sites[locale]
  const homeAlternates = Object.fromEntries(locales.map((l) => [l, homePath(l)])) as Record<Locale, string>

  const entries = [
    { path: homePath(locale), alternates: homeAlternates as Partial<Record<Locale, string>>, updatedAt: null as string | null },
    ...siteInventory(site).map((e) => ({
      path: e.path,
      updatedAt: e.updatedAt,
      alternates: Object.fromEntries(
        locales.map((l) => [l, pathInSite(e.match, sites[l])]).filter(([, p]) => p),
      ) as Partial<Record<Locale, string>>,
    })),
  ]

  const urls = entries.map((e) => {
    const links = Object.entries(e.alternates)
    const alt = links.length > 1
      ? [
          ...links.map(([l, p]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEscape(absoluteUrl(p!))}"/>`),
          e.alternates.es ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(absoluteUrl(e.alternates.es))}"/>` : '',
        ].filter(Boolean)
      : []
    return [
      '  <url>',
      `    <loc>${xmlEscape(absoluteUrl(e.path))}</loc>`,
      e.updatedAt ? `    <lastmod>${e.updatedAt}</lastmod>` : '',
      ...alt,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n')
  })

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}
