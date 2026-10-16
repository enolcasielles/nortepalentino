import { segments, type Locale, type SegmentKey } from '@/lib/i18n'
import { siteUrl } from '@/lib/site'

// ÚNICA fuente de URLs del sitio (CLAUDE.md §4). Nunca concatenes rutas a mano
// en un componente. `urlFor(doc, locale)` se añadirá con las colecciones.

export function homePath(locale: Locale): string {
  return `/${locale}`
}

export function segmentPath(key: SegmentKey, locale: Locale): string {
  return `/${locale}/${segments[key][locale]}`
}

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`
}
