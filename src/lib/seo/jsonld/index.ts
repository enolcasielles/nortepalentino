import type {
  BlogPosting,
  BreadcrumbList,
  CollectionPage,
  FAQPage,
  ItemList,
  Organization,
  Place,
  PropertyValue,
  Thing,
  TouristTrip,
  WebSite,
  WithContext,
} from 'schema-dts'

import { completeFaqs, type Faq } from '@/components/content/FaqList'
import { imageOf } from '@/lib/data/media'
import type { Site } from '@/lib/data/site'
import type { Point } from '@/lib/geo/distance'
import { getDictionary, type Locale } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { absoluteUrl, homePath } from '@/lib/routes'
import { siteName, siteUrl } from '@/lib/site'
import type { Articulo, Municipio, Negocio, Recurso, Ruta } from '@/payload-types'

// Un generador por tipo de página (CLAUDE.md §7.2). Solo datos reales del
// documento: un campo vacío se omite, nunca se rellena.

type Json = Record<string, unknown>

// Quita claves vacías (undefined, null, '' o arrays vacíos)
function clean<T extends Json>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0),
    ),
  ) as T
}

const geo = (p: Point) => ({ '@type': 'GeoCoordinates' as const, latitude: p.lat, longitude: p.lng })

const REGION = { '@type': 'AdministrativeArea' as const, name: 'Montaña Palentina' }

const imagesOf = (site: Site, refs: Parameters<typeof imageOf>[1][] | null | undefined) =>
  (refs ?? [])
    .map((r) => imageOf(site, r))
    .filter((i): i is NonNullable<typeof i> => i !== null)
    .map((i) => (i.src.startsWith('http') ? i.src : absoluteUrl(i.src)))

export function websiteJsonLd(locale: Locale): WithContext<WebSite> {
  const dict = getDictionary(locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: absoluteUrl(homePath(locale)),
    inLanguage: locale,
    description: dict.site.tagline,
  }
}

// Portal independiente: sin afirmar oficialidad (CLAUDE.md §1.2)
export function organizationJsonLd(locale: Locale): WithContext<Organization> {
  const dict = getDictionary(locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    description: dict.site.disclaimer,
  }
}

export function breadcrumbJsonLd(items: { name: string; path?: string | null }[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) =>
      clean({
        '@type': 'ListItem' as const,
        position: i + 1,
        name: c.name,
        item: c.path ? absoluteUrl(c.path) : undefined,
      }),
    ),
  }
}

export function faqJsonLd(faqs: Faq[] | null | undefined): WithContext<FAQPage> | null {
  const items = completeFaqs(faqs)
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  }
}

export function municipioJsonLd(m: Municipio, path: string, site: Site): WithContext<Place> {
  return {
    '@context': 'https://schema.org',
    ...clean({
      '@type': 'City' as const,
      name: m.nombre,
      url: absoluteUrl(path),
      description: m.intro,
      geo: geo(m.coordenadas),
      containedInPlace: REGION,
      image: imagesOf(site, [m.foto_portada]),
    }),
  } as WithContext<Place>
}

export function negocioJsonLd(n: Negocio, path: string, site: Site): WithContext<Thing> {
  const categoria = site.categoriaById.get(relId(n.categoria) ?? -1)
  const nucleo = site.nucleoById.get(relId(n.nucleo) ?? -1)
  return {
    '@context': 'https://schema.org',
    ...clean({
      '@type': categoria?.tipo_schema ?? 'LocalBusiness',
      name: n.nombre,
      url: absoluteUrl(path),
      description: n.descripcion,
      address: clean({
        '@type': 'PostalAddress',
        streetAddress: n.direccion,
        addressLocality: nucleo?.nombre,
        addressRegion: 'Palencia',
        addressCountry: 'ES',
      }),
      geo: geo(n.coordenadas),
      telephone: n.telefono,
      email: n.email,
      sameAs: n.web,
      priceRange: n.precio_rango,
      image: imagesOf(site, n.fotos),
    }),
  } as WithContext<Thing>
}

export function rutaJsonLd(r: Ruta, path: string, site: Site, start: Point | null): WithContext<TouristTrip> {
  const dict = getDictionary(site.locale)
  const autor = site.autorById.get(relId(r.autor) ?? -1)
  const nucleo = site.nucleoById.get(relId(r.inicio_nucleo) ?? -1)
  const props: PropertyValue[] = []
  if (r.distancia_km != null) {
    props.push({ '@type': 'PropertyValue', name: dict.facts.distancia, value: r.distancia_km, unitCode: 'KMT' })
  }
  if (r.desnivel_m != null) {
    props.push({ '@type': 'PropertyValue', name: dict.facts.desnivel, value: r.desnivel_m, unitCode: 'MTR' })
  }
  if (r.duracion_h != null) {
    props.push({ '@type': 'PropertyValue', name: dict.facts.duracion, value: r.duracion_h, unitCode: 'HUR' })
  }
  if (r.dificultad) {
    props.push({ '@type': 'PropertyValue', name: dict.listing.dificultad, value: dict.difficulty[r.dificultad] })
  }
  return {
    '@context': 'https://schema.org',
    ...clean({
      '@type': 'TouristTrip' as const,
      name: r.nombre,
      url: absoluteUrl(path),
      description: r.resumen ?? r.descripcion,
      inLanguage: site.locale,
      itinerary: start ? clean({ '@type': 'Place' as const, name: nucleo?.nombre, geo: geo(start) }) : undefined,
      additionalProperty: props,
      author: autor ? { '@type': 'Person' as const, name: autor.nombre } : undefined,
      dateModified: r.updatedAt,
      image: imagesOf(site, r.fotos),
    }),
  } as WithContext<TouristTrip>
}

export function recursoJsonLd(r: Recurso, path: string, site: Site): WithContext<Thing> {
  const tipo = site.tipoById.get(relId(r.tipo) ?? -1)
  const nucleo = site.nucleoById.get(relId(r.nucleo) ?? -1)
  return {
    '@context': 'https://schema.org',
    ...clean({
      '@type': tipo?.tipo_schema ?? 'TouristAttraction',
      name: r.nombre,
      url: absoluteUrl(path),
      description: r.resumen ?? r.descripcion,
      geo: geo(r.coordenadas),
      address: nucleo
        ? { '@type': 'PostalAddress', addressLocality: nucleo.nombre, addressRegion: 'Palencia', addressCountry: 'ES' }
        : undefined,
      image: imagesOf(site, r.fotos),
    }),
  } as WithContext<Thing>
}

export function collectionJsonLd(
  name: string,
  description: string | null | undefined,
  path: string,
  items: { name: string; path: string | null }[],
): WithContext<CollectionPage> {
  const listed = items.filter((i): i is { name: string; path: string } => Boolean(i.path))
  const list: ItemList = {
    '@type': 'ItemList',
    numberOfItems: listed.length,
    itemListElement: listed.map((i, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: i.name,
      url: absoluteUrl(i.path),
    })),
  }
  return {
    '@context': 'https://schema.org',
    ...clean({
      '@type': 'CollectionPage' as const,
      name,
      description,
      url: absoluteUrl(path),
      mainEntity: list,
    }),
  } as WithContext<CollectionPage>
}

// Artículo del blog: autor real, fechas y lo que menciona del directorio
export function articuloJsonLd(
  a: Articulo,
  path: string,
  site: Site,
  mentions: { name: string; path: string }[],
): WithContext<BlogPosting> {
  const autor = site.autorById.get(relId(a.autor) ?? -1)
  return {
    '@context': 'https://schema.org',
    ...clean({
      '@type': 'BlogPosting' as const,
      headline: a.titulo,
      description: a.seo_descripcion || a.resumen,
      url: absoluteUrl(path),
      mainEntityOfPage: absoluteUrl(path),
      inLanguage: site.locale,
      author: autor ? { '@type': 'Person' as const, name: autor.nombre } : undefined,
      publisher: { '@type': 'Organization' as const, name: siteName, url: siteUrl },
      datePublished: a.fecha_publicacion,
      dateModified: a.updatedAt,
      image: imagesOf(site, [a.foto_portada]),
      keywords: [a.busqueda_objetivo, ...(a.busquedas_secundarias ?? [])].filter(Boolean).join(', '),
      mentions: mentions.map((m) => ({ '@type': 'Thing' as const, name: m.name, url: absoluteUrl(m.path) })),
    }),
  } as WithContext<BlogPosting>
}
