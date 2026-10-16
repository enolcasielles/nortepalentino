// Reglas de contenido fino (CLAUDE.md §7.4). Plantillas, sitemap, navegación
// y llms.txt deciden qué existe con estas mismas funciones (vía lib/data/site.ts).

export const MIN_ITEMS_LISTING = 3

// Las previews nunca son indexables, diga lo que diga SITE_INDEXABLE (CLAUDE.md §7.3).
// next.config.ts replica esta regla para la cabecera X-Robots-Tag.
export function isSiteIndexable(): boolean {
  return process.env.SITE_INDEXABLE === 'true' && process.env.VERCEL_ENV !== 'preview'
}

// Los fixtures [DEMO] se ven en local y nunca en producción (CLAUDE.md §1.1)
export function isHiddenDemo(name: string | null | undefined): boolean {
  return process.env.VERCEL_ENV === 'production' && Boolean(name?.trimStart().startsWith('[DEMO]'))
}

type Ficha = {
  estado?: string | null
  descripcion?: string | null
  fecha_verificacion?: string | null
}

// Ficha (negocio, ruta, recurso): publicada, con texto propio en el idioma y verificada
export function isFichaAvailable(doc: Ficha, name: string | null | undefined): boolean {
  return (
    doc.estado === 'publicado' &&
    Boolean(doc.descripcion?.trim()) &&
    Boolean(doc.fecha_verificacion) &&
    !isHiddenDemo(name)
  )
}

// Listado: al menos MIN_ITEMS_LISTING fichas y una landing con intro propia en el idioma
export function isListingAvailable(itemCount: number, landingIntro: string | null | undefined): boolean {
  return itemCount >= MIN_ITEMS_LISTING && Boolean(landingIntro?.trim())
}
