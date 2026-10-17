import type { Site } from '@/lib/data/site'
import { filterSlugs } from '@/lib/i18n'

import type { RouteMatch } from './match'

export type InventoryEntry = {
  path: string
  match: RouteMatch
  updatedAt: string | null
}

const filters = Object.values(filterSlugs).map((f) => f.es)

const latest = (dates: (string | null | undefined)[]) =>
  dates.filter(Boolean).sort().at(-1) ?? null

// Todas las páginas de contenido que existen en un idioma (sin la home).
// Fuente común de generateStaticParams, sitemap y llms.txt (CLAUDE.md §7.3, §8).
export function siteInventory(site: Site): InventoryEntry[] {
  const entries: InventoryEntry[] = []
  const add = (path: string | null, match: RouteMatch, updatedAt: string | null) => {
    if (path) entries.push({ path, match, updatedAt })
  }

  for (const municipio of site.municipios) {
    add(site.url.municipio(municipio), { type: 'municipio', municipio }, municipio.updatedAt)
  }

  for (const categoria of site.categorias) {
    const listings = [
      site.negociosListing(null, categoria.id),
      ...[...site.municipioById.keys()].flatMap((m) => [
        site.negociosListing(m, categoria.id),
        ...filters.map((f) => site.negociosListing(m, categoria.id, f)),
      ]),
    ]
    for (const listing of listings) {
      if (!listing) continue
      add(
        site.url.negociosListing(listing),
        { type: 'negociosListing', listing },
        latest([listing.landing.updatedAt, ...listing.items.map((i) => i.updatedAt)]),
      )
    }
  }
  for (const negocio of site.negocios) add(site.url.negocio(negocio), { type: 'negocio', negocio }, negocio.updatedAt)

  for (const filtro of [null, ...filters]) {
    const listing = site.rutasListing(filtro)
    if (listing) {
      add(
        site.url.rutasListing(filtro),
        { type: 'rutasListing', listing },
        latest([listing.landing.updatedAt, ...listing.items.map((i) => i.updatedAt)]),
      )
    }
  }
  for (const ruta of site.rutas) add(site.url.ruta(ruta), { type: 'ruta', ruta }, ruta.updatedAt)

  const recursosListing = site.recursosListing()
  if (recursosListing) {
    add(
      site.url.recursosListing(),
      { type: 'recursosListing', listing: recursosListing },
      latest([recursosListing.landing.updatedAt, ...recursosListing.items.map((i) => i.updatedAt)]),
    )
  }
  for (const recurso of site.recursos) add(site.url.recurso(recurso), { type: 'recurso', recurso }, recurso.updatedAt)

  const articulosListing = site.articulosListing()
  if (articulosListing) {
    add(
      site.url.articulosListing(),
      { type: 'articulosListing', listing: articulosListing },
      latest([articulosListing.landing.updatedAt, ...articulosListing.items.map((i) => i.updatedAt)]),
    )
  }
  for (const articulo of site.articulos) add(site.url.articulo(articulo), { type: 'articulo', articulo }, articulo.updatedAt)

  return entries
}
