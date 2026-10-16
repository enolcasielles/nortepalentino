// Reglas de contenido fino (CLAUDE.md §7.4). Plantillas, sitemap y navegación
// deben usar estas mismas funciones.

export const MIN_ITEMS_LISTING = 3

// Las previews nunca son indexables, diga lo que diga SITE_INDEXABLE (CLAUDE.md §7.3).
// next.config.ts replica esta regla para la cabecera X-Robots-Tag.
export function isSiteIndexable(): boolean {
  return process.env.SITE_INDEXABLE === 'true' && process.env.VERCEL_ENV !== 'preview'
}
