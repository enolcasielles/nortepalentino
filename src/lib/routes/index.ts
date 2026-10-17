import { segments, type Locale, type SegmentKey } from '@/lib/i18n'
import { siteUrl } from '@/lib/site'

// ÚNICA fuente de URLs del sitio (CLAUDE.md §4). Nunca concatenes rutas a mano
// en un componente. Las funciones reciben slugs ya resueltos en el idioma
// pedido; la resolución desde documentos de Payload está en ./resolve.ts.

export function homePath(locale: Locale): string {
  return `/${locale}`
}

export function segmentPath(key: SegmentKey, locale: Locale): string {
  return `/${locale}/${segments[key][locale]}`
}

export const paths = {
  rutas: (locale: Locale) => segmentPath('rutas', locale),
  recursos: (locale: Locale) => segmentPath('queVer', locale),
  municipio: (locale: Locale, municipio: string) => `/${locale}/${municipio}`,
  // Listado comarcal de una categoría: /es/restaurantes
  categoria: (locale: Locale, categoria: string) => `/${locale}/${categoria}`,
  municipioCategoria: (locale: Locale, municipio: string, categoria: string) =>
    `/${locale}/${municipio}/${categoria}`,
  negocio: (locale: Locale, municipio: string, categoria: string, negocio: string) =>
    `/${locale}/${municipio}/${categoria}/${negocio}`,
  ruta: (locale: Locale, ruta: string) => `${segmentPath('rutas', locale)}/${ruta}`,
  recurso: (locale: Locale, recurso: string) => `${segmentPath('queVer', locale)}/${recurso}`,
  blog: (locale: Locale) => segmentPath('blog', locale),
  articulo: (locale: Locale, articulo: string) => `${segmentPath('blog', locale)}/${articulo}`,
  autor: (locale: Locale, autor: string) => `${segmentPath('autores', locale)}/${autor}`,
}

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`
}
