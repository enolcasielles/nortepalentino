import type { Locale } from './config'

// Segmentos fijos de URL por idioma (CLAUDE.md §5). Los slugs de contenido
// (categorías, rutas, recursos…) viven en Payload, no aquí.
export const segments = {
  rutas: { es: 'rutas', en: 'routes' },
  queVer: { es: 'que-ver', en: 'sights' },
  blog: { es: 'blog', en: 'blog' },
  autores: { es: 'autores', en: 'authors' },
  buscar: { es: 'buscar', en: 'search' },
  sobreNosotros: { es: 'sobre-nosotros', en: 'about' },
  avisoLegal: { es: 'aviso-legal', en: 'legal-notice' },
  privacidad: { es: 'privacidad', en: 'privacy' },
  cookies: { es: 'cookies', en: 'cookies' },
} as const satisfies Record<string, Record<Locale, string>>

export type SegmentKey = keyof typeof segments

// Slugs de las landings de filtro curadas (CLAUDE.md §7.4)
export const filterSlugs = {
  conNinos: { es: 'con-ninos', en: 'family-friendly' },
} as const satisfies Record<string, Record<Locale, string>>

export type FilterKey = keyof typeof filterSlugs
