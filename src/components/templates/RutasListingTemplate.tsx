import { RouteCard } from '@/components/cards'
import { CardGrid } from '@/components/cards/Card'
import { hasRouteFilters, parseRouteFilters, RouteFilterBar } from '@/components/actions/RouteFilterBar'
import { AuthorByline } from '@/components/content/AuthorByline'
import { FaqList } from '@/components/content/FaqList'
import { Prose } from '@/components/content/Prose'
import type { Crumb } from '@/components/layout/Breadcrumbs'
import { PageLayout } from '@/components/layout/PageLayout'
import { MapBlock } from '@/components/map/MapBlock'
import type { RutasListing, Site } from '@/lib/data/site'
import { getDictionary, plural } from '@/lib/i18n'
import { breadcrumbJsonLd, collectionJsonLd, faqJsonLd } from '@/lib/seo/jsonld'

import { firstParagraph, homeCrumb, type PageMeta, type TemplateProps } from './shared'

function title(listing: RutasListing, site: Site): string {
  const dict = getDictionary(site.locale)
  return listing.landing.titulo || (listing.filtro ? dict.titles.rutasFiltered : dict.titles.rutas)
}

// Filtros por query param: noindex,follow y canonical a la página base (CLAUDE.md §7.4)
export function rutasListingMeta({
  match,
  site,
  searchParams,
}: Pick<TemplateProps<'rutasListing'>, 'match' | 'site' | 'searchParams'>): PageMeta {
  return {
    title: title(match.listing, site),
    description: firstParagraph(match.listing.landing.intro),
    noindex: hasRouteFilters(parseRouteFilters(searchParams)),
  }
}

export async function RutasListingTemplate({ match, site, path, alternates, searchParams }: TemplateProps<'rutasListing'>) {
  const { locale } = site
  const dict = getDictionary(locale)
  const { listing } = match
  const { landing, filtro } = listing
  const filters = parseRouteFilters(searchParams)
  const items = listing.items.filter(
    (r) =>
      (!filters.dificultad || r.dificultad === filters.dificultad) &&
      (!filters.ninos || r.apta_ninos) &&
      (!filters.carrito || r.apta_carrito),
  )
  const pageTitle = title(listing, site)

  const crumbs: Crumb[] = [homeCrumb(locale)]
  if (filtro) {
    crumbs.push({ name: dict.nav.rutas, path: site.rutasListing() ? site.url.rutasListing(null) : null })
    crumbs.push({ name: dict.filters[filtro], path })
  } else {
    crumbs.push({ name: dict.nav.rutas, path })
  }

  const faqLd = faqJsonLd(landing.faqs)
  const itemsLd = listing.items.map((r) => ({ name: r.nombre, path: site.url.ruta(r) }))

  return (
    <PageLayout
      locale={locale}
      alternatePaths={alternates}
      breadcrumbs={crumbs}
      jsonLd={[collectionJsonLd(pageTitle, landing.intro, path, itemsLd), breadcrumbJsonLd(crumbs), ...(faqLd ? [faqLd] : [])]}
      hero={{
        title: pageTitle,
        icon: 'senda',
        summary: <Prose text={landing.intro} />,
      }}
    >
      <div className="space-y-16">

        <div className="space-y-4">
          <RouteFilterBar path={path} filters={filters} dict={dict} hideNinos={filtro === 'con-ninos'} />
          <p className="text-sm text-text-muted" aria-live="polite">
            {plural(dict.listing.countRutas, items.length, locale)}
          </p>
          {items.length > 0 ? (
            <CardGrid>
              {items.map((r) => (
                <li key={r.id}>
                  <RouteCard ruta={r} site={site} dict={dict} headingLevel="h2" />
                </li>
              ))}
            </CardGrid>
          ) : (
            <p className="rounded-lg bg-surface-alt p-8 text-center">{dict.listing.noResults}</p>
          )}
        </div>

        <MapBlock match={match} site={site} path={path} name={pageTitle} dict={dict} />
        <FaqList faqs={landing.faqs} dict={dict} />
        <AuthorByline autor={landing.autor} updatedAt={landing.updatedAt} site={site} dict={dict} />
      </div>
    </PageLayout>
  )
}
