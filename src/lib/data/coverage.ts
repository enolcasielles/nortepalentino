import type { Payload } from 'payload'

import { locales, type Locale } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { hasText, type LexicalValue } from '@/lib/richtext/lexical'
import { isHiddenDemo, MIN_ITEMS_LISTING } from '@/lib/seo/indexability'

import { getSites, type FilterValue, type Site } from './site'

// Cobertura del contenido: qué páginas existen, cuáles están cerca de existir
// y qué falta en cada ficha y borrador. La usa la skill `plan-editorial` a
// través de la extensión de Claude Desktop (`cobertura`). Qué existe lo decide
// siempre `getSite` (lib/data/site.ts); aquí solo se cuenta y se explica.

type Raw = Record<string, unknown> & { id: number }
type PerLocale<T> = Record<Locale, T>

// Con `locale: 'all'`, los campos traducidos llegan como { es, en }
function inLocale(value: unknown, locale: Locale): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value) && locale in value) {
    return (value as Record<string, unknown>)[locale]
  }
  return value
}
const textIn = (value: unknown, locale: Locale) => {
  const v = inLocale(value, locale)
  return typeof v === 'string' && v.trim() ? v : null
}
const nameOf = (doc: Raw) => textIn(doc.nombre ?? doc.titulo, 'es') ?? textIn(doc.nombre ?? doc.titulo, 'en') ?? ''
const slugOf = (doc: Raw) => textIn(doc.slug, 'es') ?? textIn(doc.slug, 'en')
const perLocale = <T>(fn: (locale: Locale) => T) =>
  Object.fromEntries(locales.map((l) => [l, fn(l)])) as PerLocale<T>

const FICHAS = ['negocios', 'rutas', 'recursos'] as const
type FichaCollection = (typeof FICHAS)[number]
const ROUTE_FIGURES = ['distancia_km', 'desnivel_m', 'duracion_h', 'dificultad'] as const

async function loadAll(payload: Payload, collection: string): Promise<Raw[]> {
  const result = await payload.find({
    collection: collection as 'negocios',
    locale: 'all',
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  return (result.docs as unknown as Raw[]).filter((d) => !isHiddenDemo(nameOf(d)))
}

function existsIn(site: Site, collection: FichaCollection, id: number): boolean {
  if (collection === 'negocios') return Boolean(site.negocioById.get(id) && site.url.negocio(site.negocioById.get(id)!))
  if (collection === 'rutas') return site.rutaById.has(id)
  return site.recursoById.has(id)
}

// Qué le falta a una ficha para existir en un idioma (§7.4) o para publicarse
function fichaGaps(collection: FichaCollection, doc: Raw, locale: Locale): string[] {
  const gaps: string[] = []
  if (!textIn(doc.descripcion, locale)) gaps.push('descripcion')
  if (collection !== 'negocios' && !textIn(doc.slug, locale)) gaps.push('slug')
  return gaps
}
function publishGaps(collection: FichaCollection, doc: Raw): string[] {
  const gaps: string[] = []
  if (!doc.fuente_url) gaps.push('fuente_url')
  if (!doc.fecha_verificacion) gaps.push('fecha_verificacion')
  if (collection === 'rutas') for (const f of ROUTE_FIGURES) if (doc[f] == null || doc[f] === '') gaps.push(f)
  return gaps
}
const hasCoordinates = (doc: Raw, field = 'coordenadas') => {
  const c = doc[field] as { lat?: number | null } | null | undefined
  return c?.lat != null
}

export async function buildCoverage(payload: Payload) {
  const sites = await getSites()
  const raw = {
    municipios: await loadAll(payload, 'municipios'),
    categorias: await loadAll(payload, 'categorias_negocio'),
    negocios: await loadAll(payload, 'negocios'),
    rutas: await loadAll(payload, 'rutas'),
    recursos: await loadAll(payload, 'recursos'),
    articulos: await loadAll(payload, 'articulos'),
    landings: await loadAll(payload, 'landings'),
  }
  const municipioSlug = new Map(raw.municipios.map((m) => [m.id, slugOf(m)]))
  const categoriaSlug = new Map(raw.categorias.map((c) => [c.id, slugOf(c)]))
  const isDraft = (d: Raw) => d.estado !== 'publicado'

  // ---- Listados: los que existen y los que podrían existir

  type Candidate = { ambito: 'negocios' | 'rutas' | 'recursos' | 'articulos'; municipio: number | null; categoria: number | null; filtro: FilterValue | null }
  const candidates = new Map<string, Candidate>()
  const add = (c: Candidate) => candidates.set([c.ambito, c.municipio, c.categoria, c.filtro].join('|'), c)
  const familyNegocio = (n: Raw) => Array.isArray(n.atributos_familia) && n.atributos_familia.includes('admite-ninos')

  for (const n of raw.negocios) {
    const categoria = relId(n.categoria)
    if (categoria == null) continue
    for (const municipio of [relId(n.municipio), null]) {
      add({ ambito: 'negocios', municipio, categoria, filtro: null })
      if (familyNegocio(n)) add({ ambito: 'negocios', municipio, categoria, filtro: 'con-ninos' })
    }
  }
  if (raw.rutas.length) add({ ambito: 'rutas', municipio: null, categoria: null, filtro: null })
  if (raw.rutas.some((r) => r.apta_ninos)) add({ ambito: 'rutas', municipio: null, categoria: null, filtro: 'con-ninos' })
  if (raw.recursos.length) add({ ambito: 'recursos', municipio: null, categoria: null, filtro: null })
  if (raw.articulos.length) add({ ambito: 'articulos', municipio: null, categoria: null, filtro: null })
  for (const l of raw.landings) {
    add({
      ambito: l.ambito as Candidate['ambito'],
      municipio: relId(l.municipio),
      categoria: relId(l.categoria),
      filtro: (l.filtro as FilterValue | null) ?? null,
    })
  }

  const listados = [...candidates.values()].map((c) => {
    const landing = raw.landings.find(
      (l) =>
        l.ambito === c.ambito &&
        relId(l.municipio) === c.municipio &&
        relId(l.categoria) === c.categoria &&
        ((l.filtro as string | null) ?? null) === c.filtro,
    )
    const inListing = (n: Raw) =>
      relId(n.categoria) === c.categoria &&
      (c.municipio == null || relId(n.municipio) === c.municipio) &&
      (!c.filtro || familyNegocio(n))
    const borradores =
      c.ambito === 'negocios'
        ? raw.negocios.filter((n) => isDraft(n) && inListing(n)).length
        : raw[c.ambito].filter((d) => isDraft(d) && (!c.filtro || d.apta_ninos)).length

    const idiomas = perLocale((locale) => {
      const site = sites[locale]
      let fichas = 0
      let url: string | null = null
      if (c.ambito === 'negocios' && c.categoria != null) {
        fichas = site.negociosFor(c.municipio, c.categoria, c.filtro).length
        const listing = site.negociosListing(c.municipio, c.categoria, c.filtro)
        url = listing ? site.url.negociosListing(listing) : null
      } else if (c.ambito === 'rutas') {
        fichas = site.rutasFor(c.filtro).length
        url = site.rutasListing(c.filtro) ? site.url.rutasListing(c.filtro) : null
      } else if (c.ambito === 'recursos') {
        fichas = site.recursos.length
        url = site.recursosListing() ? site.url.recursosListing() : null
      } else if (c.ambito === 'articulos') {
        fichas = site.articulos.length
        url = site.articulosListing() ? site.url.articulosListing() : null
      }
      const intro = Boolean(site.landingFor(c.ambito, c.municipio, c.categoria, c.filtro))
      return { pagina: url, fichas, faltan_fichas: Math.max(0, MIN_ITEMS_LISTING - fichas), intro }
    })

    return {
      ambito: c.ambito,
      municipio: c.municipio != null ? municipioSlug.get(c.municipio) : null,
      categoria: c.categoria != null ? categoriaSlug.get(c.categoria) : null,
      filtro: c.filtro,
      landing: landing ? landing.id : null,
      borradores,
      ...idiomas,
    }
  })

  // ---- Fichas publicadas: en qué idioma existen y quién habla de ellas

  const fichas = FICHAS.flatMap((collection) =>
    raw[collection]
      .filter((d) => !isDraft(d))
      .map((d) => {
        const existe = perLocale((l) => existsIn(sites[l], collection, d.id))
        const falta = perLocale((l) => (existe[l] ? [] : fichaGaps(collection, d, l)))
        return {
          coleccion: collection,
          id: d.id,
          slug: slugOf(d),
          nombre: nameOf(d),
          municipio: municipioSlug.get(relId(d.municipio) ?? -1) ?? null,
          existe,
          falta,
          coordenadas: hasCoordinates(d, collection === 'rutas' ? 'inicio_coordenadas' : 'coordenadas'),
          fecha_verificacion: (d.fecha_verificacion as string | null)?.slice(0, 10) ?? null,
          articulos: perLocale((l) => sites[l].articulosAbout(collection, d.id).length),
        }
      }),
  )

  // ---- Borradores: qué les falta para publicarse y existir en cada idioma

  const borradores = [
    ...FICHAS.flatMap((collection) =>
      raw[collection].filter(isDraft).map((d) => ({
        coleccion: collection,
        id: d.id,
        slug: slugOf(d),
        nombre: nameOf(d),
        municipio: municipioSlug.get(relId(d.municipio) ?? -1) ?? null,
        para_publicar: publishGaps(collection, d),
        para_existir: perLocale((l) => fichaGaps(collection, d, l)),
        actualizado: (d.updatedAt as string).slice(0, 10),
      })),
    ),
    ...raw.articulos.filter(isDraft).map((d) => ({
      coleccion: 'articulos' as const,
      id: d.id,
      slug: slugOf(d),
      nombre: nameOf(d),
      municipio: null,
      para_publicar: d.autor ? [] : ['autor'],
      para_existir: perLocale((l) => [
        ...(hasText(inLocale(d.cuerpo, l) as LexicalValue) ? [] : ['cuerpo']),
        ...(textIn(d.slug, l) ? [] : ['slug']),
        ...(textIn(d.busqueda_objetivo, l) ? [] : ['busqueda_objetivo']),
      ]),
      actualizado: (d.updatedAt as string).slice(0, 10),
    })),
  ]

  // ---- Municipios

  const municipios = raw.municipios.map((m) => {
    const inMunicipio = (d: object) => relId((d as { municipio?: unknown }).municipio) === m.id
    return {
      id: m.id,
      slug: slugOf(m),
      nombre: nameOf(m),
      pagina: perLocale((l) => {
        const doc = sites[l].municipioById.get(m.id)
        return doc ? sites[l].url.municipio(doc) : null
      }),
      intro: perLocale((l) => Boolean(textIn(m.intro, l))),
      faqs: Array.isArray(m.faqs) ? m.faqs.length : 0,
      autor: Boolean(m.autor),
      fichas: perLocale(
        (l) =>
          sites[l].negocios.filter(inMunicipio).length +
          sites[l].rutas.filter(inMunicipio).length +
          sites[l].recursos.filter(inMunicipio).length,
      ),
      borradores: FICHAS.reduce((sum, c) => sum + raw[c].filter((d) => isDraft(d) && inMunicipio(d)).length, 0),
      articulos: perLocale((l) => sites[l].articulosAbout('municipios', m.id).length),
    }
  })

  return {
    minimo_listado: MIN_ITEMS_LISTING,
    resumen: perLocale((l) => ({
      municipios: sites[l].municipios.length,
      negocios: sites[l].negocios.length,
      rutas: sites[l].rutas.length,
      recursos: sites[l].recursos.length,
      articulos: sites[l].articulos.length,
      listados: listados.filter((x) => x[l].pagina).length,
    })),
    listados,
    municipios,
    fichas,
    borradores,
  }
}
