import type { NegociosListing, RecursosListing, RutasListing, Site } from '@/lib/data/site'
import { filterFromSlug } from '@/lib/data/site'
import { segments, type Locale } from '@/lib/i18n'
import type { Municipio, Negocio, Recurso, Ruta } from '@/payload-types'

export type RouteMatch =
  | { type: 'municipio'; municipio: Municipio }
  | { type: 'negociosListing'; listing: NegociosListing }
  | { type: 'negocio'; negocio: Negocio }
  | { type: 'rutasListing'; listing: RutasListing }
  | { type: 'ruta'; ruta: Ruta }
  | { type: 'recursosListing'; listing: RecursosListing }
  | { type: 'recurso'; recurso: Recurso }

// Resuelve /{locale}/{...segs} contra lo que existe en ese idioma (CLAUDE.md §5).
// Devuelve null si la página no existe (o no cumple §7.4).
export function matchRoute(site: Site, segs: string[]): RouteMatch | null {
  const locale: Locale = site.locale
  const [s0, s1, s2, ...rest] = segs
  if (rest.length) return null

  // Secciones con segmento fijo traducido
  if (s0 === segments.rutas[locale]) {
    if (s2) return null
    if (!s1) return wrap('rutasListing', site.rutasListing())
    const filtro = filterFromSlug(s1, locale)
    if (filtro) return wrap('rutasListing', site.rutasListing(filtro))
    const ruta = site.rutas.find((r) => r.slug === s1)
    return ruta ? { type: 'ruta', ruta } : null
  }
  if (s0 === segments.queVer[locale]) {
    if (s2) return null
    if (!s1) return wrap('recursosListing', site.recursosListing())
    const recurso = site.recursos.find((r) => r.slug === s1)
    return recurso ? { type: 'recurso', recurso } : null
  }

  const municipio = [...site.municipioById.values()].find((m) => m.slug === s0)
  if (!municipio) {
    // Listado comarcal de una categoría: /es/restaurantes
    const categoria = site.categorias.find((c) => c.slug === s0)
    if (!categoria || s1) return null
    return wrap('negociosListing', site.negociosListing(null, categoria.id))
  }

  if (!s1) return site.url.municipio(municipio) ? { type: 'municipio', municipio } : null

  const categoria = site.categorias.find((c) => c.slug === s1)
  if (!categoria) return null
  if (!s2) return wrap('negociosListing', site.negociosListing(municipio.id, categoria.id))

  const filtro = filterFromSlug(s2, locale)
  if (filtro) return wrap('negociosListing', site.negociosListing(municipio.id, categoria.id, filtro))

  const negocio = site.negocios.find(
    (n) => n.slug === s2 && n.municipio === municipio.id && n.categoria === categoria.id,
  )
  return negocio ? { type: 'negocio', negocio } : null
}

function wrap<T extends 'rutasListing' | 'recursosListing' | 'negociosListing'>(
  type: T,
  listing: Extract<RouteMatch, { type: T }>['listing'] | null,
): RouteMatch | null {
  return listing ? ({ type, listing } as RouteMatch) : null
}

// Ruta de la misma página en un índice (normalmente, de otro idioma)
export function pathInSite(match: RouteMatch, site: Site): string | null {
  switch (match.type) {
    case 'municipio': {
      const m = site.municipioById.get(match.municipio.id)
      return m ? site.url.municipio(m) : null
    }
    case 'negocio': {
      const n = site.negocios.find((x) => x.id === match.negocio.id)
      return n ? site.url.negocio(n) : null
    }
    case 'ruta': {
      const r = site.rutas.find((x) => x.id === match.ruta.id)
      return r ? site.url.ruta(r) : null
    }
    case 'recurso': {
      const r = site.recursos.find((x) => x.id === match.recurso.id)
      return r ? site.url.recurso(r) : null
    }
    case 'negociosListing': {
      const { municipio, categoria, filtro } = match.listing
      const l = site.negociosListing(municipio?.id ?? null, categoria.id, filtro)
      return l ? site.url.negociosListing(l) : null
    }
    case 'rutasListing': {
      const l = site.rutasListing(match.listing.filtro)
      return l ? site.url.rutasListing(l.filtro) : null
    }
    case 'recursosListing':
      return site.recursosListing() ? site.url.recursosListing() : null
  }
}

export function alternatePaths(match: RouteMatch, sites: Record<Locale, Site>): Partial<Record<Locale, string>> {
  const result: Partial<Record<Locale, string>> = {}
  for (const [locale, site] of Object.entries(sites) as [Locale, Site][]) {
    const path = pathInSite(match, site)
    if (path) result[locale] = path
  }
  return result
}
