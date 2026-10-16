// Reglas de contenido fino (CLAUDE.md §7.4). Plantillas, sitemap y navegación
// deben usar estas mismas funciones.

export const MIN_ITEMS_LISTING = 3

export function isSiteIndexable(): boolean {
  return process.env.SITE_INDEXABLE === 'true'
}
