import { filterSlugs, segments } from '@/lib/i18n/segments'
import { locales } from '@/lib/i18n/config'

// Slugs que ningún municipio, categoría ni negocio puede usar, porque
// colisionarían con segmentos fijos o landings de filtro (CLAUDE.md §5).
// Los slugs de categorías se comprueban contra la BD en el hook de validación.
const technical = ['admin', 'api', 'llms.txt', 'llms-full.txt', 'sitemap.xml', 'robots.txt']

export const reservedSlugs: ReadonlySet<string> = new Set([
  ...locales,
  ...technical,
  ...Object.values(segments).flatMap((s) => Object.values(s)),
  ...Object.values(filterSlugs).flatMap((s) => Object.values(s)),
])

export function isReservedSlug(slug: string): boolean {
  return reservedSlugs.has(slug)
}
