import { cache } from 'react'

import { filterSlugs, locales, type Locale } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { paths } from '@/lib/routes'
import { hasText, type DocRef, type LexicalValue, type LinkableCollection } from '@/lib/richtext/lexical'
import { isArticuloAvailable, isFichaAvailable, isHiddenDemo, isListingAvailable } from '@/lib/seo/indexability'
import type {
  Articulo,
  Autore,
  CategoriasNegocio,
  Landing,
  Media,
  Municipio,
  Negocio,
  Nucleo,
  Recurso,
  Ruta,
} from '@/payload-types'

import { loadCollection } from './load'

// Filtros curados: clave = slug ES guardado en `landings.filtro`
export type FilterValue = (typeof filterSlugs)[keyof typeof filterSlugs]['es']

const negocioFilters: Record<FilterValue, (n: Negocio) => boolean> = {
  'con-ninos': (n) => Boolean(n.atributos_familia?.includes('admite-ninos')),
}
const rutaFilters: Record<FilterValue, (r: Ruta) => boolean> = {
  'con-ninos': (r) => Boolean(r.apta_ninos),
}

export type NegociosListing = {
  kind: 'negocios'
  municipio: Municipio | null
  categoria: CategoriasNegocio
  filtro: FilterValue | null
  landing: Landing
  items: Negocio[]
}
export type RutasListing = { kind: 'rutas'; filtro: FilterValue | null; landing: Landing; items: Ruta[] }
export type RecursosListing = { kind: 'recursos'; landing: Landing; items: Recurso[] }
export type ArticulosListing = { kind: 'articulos'; landing: Landing; items: Articulo[] }

const byId = <T extends { id: number }>(docs: T[]) => new Map(docs.map((d) => [d.id, d]))
const collator = new Intl.Collator('es')

// Orden de listados: `orden` manual y luego alfabético; nunca por pago (DESIGN.md §6)
function sortNegocios(items: Negocio[]): Negocio[] {
  return [...items].sort(
    (a, b) =>
      (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER) ||
      collator.compare(a.nombre, b.nombre),
  )
}

function landingKey(ambito: string, municipio: number | null, categoria: number | null, filtro: string | null) {
  return [ambito, municipio ?? '-', categoria ?? '-', filtro ?? '-'].join('|')
}

// Índice de todo lo que existe en un idioma. Se construye una vez por
// petición (React.cache) sobre las colecciones cacheadas.
export const getSite = cache(async (locale: Locale) => {
  const [
    municipiosAll,
    nucleos,
    categoriasAll,
    tipos,
    negociosAll,
    recursosAll,
    rutasAll,
    landingsAll,
    autores,
    media,
    articulosAll,
  ] = await Promise.all([
    loadCollection('municipios', locale),
    loadCollection('nucleos', locale),
    loadCollection('categorias_negocio', locale),
    loadCollection('tipos_recurso', locale),
    loadCollection('negocios', locale),
    loadCollection('recursos', locale),
    loadCollection('rutas', locale),
    loadCollection('landings', locale),
    loadCollection('autores', locale),
    loadCollection('media', locale),
    loadCollection('articulos', locale),
  ])

  const municipioById = byId(municipiosAll.filter((m) => !isHiddenDemo(m.nombre)))
  const nucleoById = byId(nucleos)
  // Una categoría sin slug en este idioma no tiene URLs en él
  const categoriaById = byId(categoriasAll.filter((c) => c.slug && c.nombre_plural))
  const tipoById = byId(tipos)
  const autorById = byId(autores)
  const mediaById = byId(media)

  // Fichas que existen en este idioma (§7.4)
  const negocios = sortNegocios(
    negociosAll.filter(
      (n) =>
        isFichaAvailable(n, n.nombre) &&
        categoriaById.has(relId(n.categoria) ?? -1) &&
        municipioById.has(relId(n.municipio) ?? -1),
    ),
  )
  const rutas = rutasAll
    .filter((r) => r.slug && isFichaAvailable(r, r.nombre))
    .sort((a, b) => collator.compare(a.nombre, b.nombre))
  const recursos = recursosAll
    .filter((r) => r.slug && isFichaAvailable(r, r.nombre) && tipoById.has(relId(r.tipo) ?? -1))
    .sort((a, b) => collator.compare(a.nombre, b.nombre))

  // Artículos que existen en este idioma, del más reciente al más antiguo
  const articulos = articulosAll
    .filter((a) => isArticuloAvailable(a, hasText(a.cuerpo as LexicalValue), a.titulo))
    .sort((a, b) => (b.fecha_publicacion ?? b.createdAt).localeCompare(a.fecha_publicacion ?? a.createdAt))

  const negocioById = byId(negocios)
  const rutaById = byId(rutas)
  const recursoById = byId(recursos)
  const articuloById = byId(articulos)

  // Enlaces de vuelta: qué artículos enlazan o incrustan cada documento
  const mentions = new Map<string, Articulo[]>()
  for (const a of articulos) {
    for (const e of a.enlaces ?? []) {
      const key = `${e.relationTo}:${relId(e.value)}`
      mentions.set(key, [...(mentions.get(key) ?? []), a])
    }
  }

  // Un municipio tiene página si tiene intro en este idioma
  const municipios = [...municipioById.values()]
    .filter((m) => m.intro?.trim())
    .sort((a, b) => collator.compare(a.nombre, b.nombre))
  const municipioPageIds = new Set(municipios.map((m) => m.id))

  const landingByKey = new Map(
    landingsAll
      .filter((l) => l.intro?.trim())
      .map((l) => [landingKey(l.ambito, relId(l.municipio), relId(l.categoria), l.filtro ?? null), l]),
  )

  function negociosListing(
    municipioId: number | null,
    categoriaId: number,
    filtro: FilterValue | null = null,
  ): NegociosListing | null {
    const categoria = categoriaById.get(categoriaId)
    const municipio = municipioId ? municipioById.get(municipioId) : null
    if (!categoria || (municipioId && !municipio)) return null
    const landing = landingByKey.get(landingKey('negocios', municipioId, categoriaId, filtro))
    const items = negocios.filter(
      (n) =>
        relId(n.categoria) === categoriaId &&
        (!municipioId || relId(n.municipio) === municipioId) &&
        (!filtro || negocioFilters[filtro](n)),
    )
    if (!landing || !isListingAvailable(items.length, landing.intro)) return null
    return { kind: 'negocios', municipio: municipio ?? null, categoria, filtro, landing, items }
  }

  function rutasListing(filtro: FilterValue | null = null): RutasListing | null {
    const landing = landingByKey.get(landingKey('rutas', null, null, filtro))
    const items = filtro ? rutas.filter(rutaFilters[filtro]) : rutas
    if (!landing || !isListingAvailable(items.length, landing.intro)) return null
    return { kind: 'rutas', filtro, landing, items }
  }

  function recursosListing(): RecursosListing | null {
    const landing = landingByKey.get(landingKey('recursos', null, null, null))
    if (!landing || !isListingAvailable(recursos.length, landing.intro)) return null
    return { kind: 'recursos', landing, items: recursos }
  }

  function articulosListing(): ArticulosListing | null {
    const landing = landingByKey.get(landingKey('articulos', null, null, null))
    if (!landing || !isListingAvailable(articulos.length, landing.intro)) return null
    return { kind: 'articulos', landing, items: articulos }
  }

  // ---- URLs (solo de lo que existe en este idioma)

  const municipioSlug = (n: { municipio?: number | Municipio | null }) =>
    municipioById.get(relId(n.municipio) ?? -1)?.slug

  const url = {
    municipio: (m: Municipio) => (municipioPageIds.has(m.id) ? paths.municipio(locale, m.slug) : null),
    negocio: (n: Negocio) => {
      const categoria = categoriaById.get(relId(n.categoria) ?? -1)
      const municipio = municipioSlug(n)
      return categoria?.slug && municipio ? paths.negocio(locale, municipio, categoria.slug, n.slug) : null
    },
    ruta: (r: Ruta) => (r.slug ? paths.ruta(locale, r.slug) : null),
    recurso: (r: Recurso) => (r.slug ? paths.recurso(locale, r.slug) : null),
    negociosListing: (l: Pick<NegociosListing, 'municipio' | 'categoria' | 'filtro'>) => {
      const base = l.municipio
        ? paths.municipioCategoria(locale, l.municipio.slug, l.categoria.slug!)
        : paths.categoria(locale, l.categoria.slug!)
      return l.filtro ? `${base}/${filterSlugFor(l.filtro, locale)}` : base
    },
    rutasListing: (filtro: FilterValue | null) =>
      filtro ? `${paths.rutas(locale)}/${filterSlugFor(filtro, locale)}` : paths.rutas(locale),
    recursosListing: () => paths.recursos(locale),
    articulo: (a: Articulo) => (a.slug ? paths.articulo(locale, a.slug) : null),
    articulosListing: () => paths.blog(locale),
    // Destino de un enlace interno del cuerpo de un artículo; null si no existe en este idioma
    ref: (ref: DocRef): string | null => {
      const doc = docOf(ref)
      if (!doc) return null
      switch (doc.relationTo) {
        case 'negocios':
          return url.negocio(doc.value)
        case 'rutas':
          return url.ruta(doc.value)
        case 'recursos':
          return url.recurso(doc.value)
        case 'municipios':
          return url.municipio(doc.value)
        case 'articulos':
          return url.articulo(doc.value)
      }
    },
  }

  // Documento que existe en este idioma a partir de una referencia
  function docOf(ref: DocRef): ResolvedDoc | null {
    switch (ref.relationTo) {
      case 'negocios': {
        const value = negocioById.get(ref.id)
        return value ? { relationTo: 'negocios', value } : null
      }
      case 'rutas': {
        const value = rutaById.get(ref.id)
        return value ? { relationTo: 'rutas', value } : null
      }
      case 'recursos': {
        const value = recursoById.get(ref.id)
        return value ? { relationTo: 'recursos', value } : null
      }
      case 'municipios': {
        const value = municipioById.get(ref.id)
        return value && municipioPageIds.has(value.id) ? { relationTo: 'municipios', value } : null
      }
      case 'articulos': {
        const value = articuloById.get(ref.id)
        return value ? { relationTo: 'articulos', value } : null
      }
    }
  }

  // Artículos que enlazan un documento (para "Lo contamos en el blog")
  const articulosAbout = (relationTo: LinkableCollection, id: number) => mentions.get(`${relationTo}:${id}`) ?? []

  return {
    locale,
    municipios,
    municipioById,
    nucleoById,
    categorias: [...categoriaById.values()],
    categoriaById,
    tipoById,
    negocios,
    rutas,
    recursos,
    articulos,
    articuloById,
    autorById,
    mediaById,
    negociosListing,
    rutasListing,
    recursosListing,
    articulosListing,
    url,
    docOf,
    articulosAbout,
  }
})

export type ResolvedDoc =
  | { relationTo: 'negocios'; value: Negocio }
  | { relationTo: 'rutas'; value: Ruta }
  | { relationTo: 'recursos'; value: Recurso }
  | { relationTo: 'municipios'; value: Municipio }
  | { relationTo: 'articulos'; value: Articulo }

export type Site = Awaited<ReturnType<typeof getSite>>

export function filterSlugFor(filtro: FilterValue, locale: Locale): string {
  const entry = Object.values(filterSlugs).find((f) => f.es === filtro)!
  return entry[locale]
}

export function filterFromSlug(slug: string, locale: Locale): FilterValue | null {
  const entry = Object.values(filterSlugs).find((f) => f[locale] === slug)
  return entry ? entry.es : null
}

// Índices de todos los idiomas, para hreflang y el selector de idioma
export async function getSites(): Promise<Record<Locale, Site>> {
  const entries = await Promise.all(locales.map(async (l) => [l, await getSite(l)] as const))
  return Object.fromEntries(entries) as Record<Locale, Site>
}

export type { Autore, Media, Nucleo }
