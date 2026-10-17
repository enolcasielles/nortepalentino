import type { Site } from '@/lib/data/site'
import type { Dictionary } from '@/lib/i18n'

export type NavLink = { href: string; label: string }

// Secciones del directorio que existen en este idioma (CLAUDE.md §7.4):
// categorías de negocio, rutas y qué ver. Fuente común de cabecera, pie y home.
export function directoryLinks(site: Site, dict: Dictionary): NavLink[] {
  return [
    ...site.categorias.map((c) => {
      const listing = site.negociosListing(null, c.id)
      return listing && { href: site.url.negociosListing(listing), label: c.nombre_plural! }
    }),
    site.rutasListing() && { href: site.url.rutasListing(null), label: dict.nav.rutas },
    site.recursosListing() && { href: site.url.recursosListing(), label: dict.nav.queVer },
  ].filter((l): l is NavLink => Boolean(l))
}

export function blogLink(site: Site, dict: Dictionary): NavLink | null {
  return site.articulosListing() ? { href: site.url.articulosListing(), label: dict.nav.blog } : null
}
