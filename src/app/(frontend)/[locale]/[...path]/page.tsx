import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { MunicipioTemplate, municipioMeta } from '@/components/templates/MunicipioTemplate'
import { NegociosListingTemplate, negociosListingMeta } from '@/components/templates/NegociosListingTemplate'
import { NegocioTemplate, negocioMeta } from '@/components/templates/NegocioTemplate'
import { RecursosListingTemplate, recursosListingMeta } from '@/components/templates/RecursosListingTemplate'
import { RecursoTemplate, recursoMeta } from '@/components/templates/RecursoTemplate'
import { RutasListingTemplate, rutasListingMeta } from '@/components/templates/RutasListingTemplate'
import { RutaTemplate, rutaMeta } from '@/components/templates/RutaTemplate'
import type { PageMeta } from '@/components/templates/shared'
import { loadRedirects } from '@/lib/data/load'
import { getSites } from '@/lib/data/site'
import { isLocale } from '@/lib/i18n'
import { siteInventory } from '@/lib/routes/inventory'
import { alternatePaths, matchRoute } from '@/lib/routes/match'
import { resolveRedirect } from '@/lib/routes/redirects'
import { buildMetadata } from '@/lib/seo/buildMetadata'

type Params = { locale: string; path: string[] }
type SearchParams = Record<string, string | string[] | undefined>
type Props = { params: Promise<Params>; searchParams: Promise<SearchParams> }

// Las URLs nuevas (o con redirect) se resuelven bajo demanda; el resto se
// genera en build y se refresca por tags (CLAUDE.md §6).
export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return []
  const sites = await getSites()
  return siteInventory(sites[params.locale]).map((entry) => ({ path: entry.path.split('/').slice(2) }))
}

async function resolve(params: Promise<Params>) {
  const { locale, path } = await params
  if (!isLocale(locale)) return null
  const sites = await getSites()
  const site = sites[locale]
  const match = matchRoute(site, path)
  const requested = `/${locale}/${path.join('/')}`
  if (!match) return { locale, site, match: null, requested } as const
  const alternates = alternatePaths(match, sites)
  return { locale, site, match, alternates, path: alternates[locale] ?? requested, requested } as const
}

// Solo el listado de rutas lee la query (filtros); así el resto sigue siendo estático
async function readSearchParams(type: string, searchParams: Promise<SearchParams>): Promise<SearchParams> {
  return type === 'rutasListing' ? await searchParams : {}
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const r = await resolve(params)
  if (!r?.match) return {}
  const { match, site } = r
  const query = await readSearchParams(match.type, searchParams)

  let meta: PageMeta
  switch (match.type) {
    case 'municipio':
      meta = municipioMeta({ match, site })
      break
    case 'negociosListing':
      meta = negociosListingMeta({ match, site })
      break
    case 'negocio':
      meta = negocioMeta({ match, site })
      break
    case 'rutasListing':
      meta = rutasListingMeta({ match, site, searchParams: query })
      break
    case 'ruta':
      meta = rutaMeta({ match, site })
      break
    case 'recursosListing':
      meta = recursosListingMeta({ match, site })
      break
    case 'recurso':
      meta = recursoMeta({ match, site })
      break
  }
  return buildMetadata({ locale: r.locale, paths: r.alternates, ...meta })
}

export default async function ContentPage({ params, searchParams }: Props) {
  const r = await resolve(params)
  if (!r) notFound()

  if (!r.match) {
    // URL antigua: 308 permanente al destino final de la cadena de redirects
    const destination = resolveRedirect(r.requested, await loadRedirects())
    if (destination) permanentRedirect(destination)
    notFound()
  }

  const { match, site, path, alternates } = r
  const common = { site, path, alternates }
  switch (match.type) {
    case 'municipio':
      return <MunicipioTemplate match={match} {...common} />
    case 'negociosListing':
      return <NegociosListingTemplate match={match} {...common} />
    case 'negocio':
      return <NegocioTemplate match={match} {...common} />
    case 'rutasListing':
      return <RutasListingTemplate match={match} {...common} searchParams={await readSearchParams(match.type, searchParams)} />
    case 'ruta':
      return <RutaTemplate match={match} {...common} />
    case 'recursosListing':
      return <RecursosListingTemplate match={match} {...common} />
    case 'recurso':
      return <RecursoTemplate match={match} {...common} />
  }
}
