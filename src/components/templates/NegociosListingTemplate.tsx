import { BusinessCard } from '@/components/cards'
import { CardGrid } from '@/components/cards/Card'
import { AuthorByline } from '@/components/content/AuthorByline'
import { FaqList } from '@/components/content/FaqList'
import { Prose } from '@/components/content/Prose'
import { Section } from '@/components/content/Section'
import { TrailArrow } from '@/components/content/TrailArrow'
import type { Crumb } from '@/components/layout/Breadcrumbs'
import { PageLayout } from '@/components/layout/PageLayout'
import { MapBlock } from '@/components/map/MapBlock'
import type { NegociosListing, Site } from '@/lib/data/site'
import { fill, getDictionary, plural } from '@/lib/i18n'
import { breadcrumbJsonLd, collectionJsonLd, faqJsonLd } from '@/lib/seo/jsonld'

import { firstParagraph, homeCrumb, type PageMeta, type TemplateProps } from './shared'

export function negociosListingTitle(listing: NegociosListing, site: Site): string {
  const dict = getDictionary(site.locale)
  const { municipio, categoria, filtro, landing } = listing
  if (landing.titulo) return landing.titulo
  const category = categoria.nombre_plural
  if (!municipio) return fill(dict.titles.categoryRegion, { category })
  if (filtro) {
    const lower = site.locale === 'en' ? category.toLowerCase() : category
    return fill(dict.titles.categoryFiltered, { category: lower, place: municipio.nombre })
  }
  return fill(dict.titles.categoryIn, { category, place: municipio.nombre })
}

export function negociosListingMeta({ match, site }: Pick<TemplateProps<'negociosListing'>, 'match' | 'site'>): PageMeta {
  return {
    title: negociosListingTitle(match.listing, site),
    description: firstParagraph(match.listing.landing.intro),
  }
}

// DESIGN.md §6 · Listado (municipio + categoría, categoría comarcal, landing de filtro)
export async function NegociosListingTemplate({ match, site, path, alternates }: TemplateProps<'negociosListing'>) {
  const { locale } = site
  const dict = getDictionary(locale)
  const listing = match.listing
  const { municipio, categoria, filtro, landing, items } = listing
  const title = negociosListingTitle(listing, site)

  const crumbs: Crumb[] = [homeCrumb(locale)]
  if (municipio) crumbs.push({ name: municipio.nombre, path: site.url.municipio(municipio) })
  if (filtro && municipio) {
    const base = site.negociosListing(municipio.id, categoria.id)
    crumbs.push({ name: categoria.nombre_plural, path: base ? site.url.negociosListing(base) : null })
    crumbs.push({ name: dict.filters[filtro], path })
  } else {
    crumbs.push({ name: categoria.nombre_plural, path })
  }

  // La misma categoría en otros municipios (solo listados que existen)
  const others = municipio
    ? [...site.municipioById.values()]
        .filter((m) => m.id !== municipio.id)
        .map((m) => site.negociosListing(m.id, categoria.id))
        .filter((l): l is NegociosListing => l !== null)
    : []

  const faqLd = faqJsonLd(landing.faqs)
  const itemsLd = items.map((n) => ({ name: n.nombre, path: site.url.negocio(n) }))

  return (
    <PageLayout
      locale={locale}
      alternatePaths={alternates}
      breadcrumbs={crumbs}
      jsonLd={[collectionJsonLd(title, landing.intro, path, itemsLd), breadcrumbJsonLd(crumbs), ...(faqLd ? [faqLd] : [])]}
    >
      <div className="space-y-10">
        <header className="space-y-4">
          <h1 className="text-4xl">{title}</h1>
          <Prose text={landing.intro} />
          <p className="text-sm text-text-muted">{plural(dict.listing.count, items.length, locale)}</p>
        </header>

        <CardGrid>
          {items.map((n) => (
            <li key={n.id}>
              <BusinessCard negocio={n} site={site} dict={dict} headingLevel="h2" />
            </li>
          ))}
        </CardGrid>

        <MapBlock match={match} site={site} path={path} name={title} dict={dict} />
        <FaqList faqs={landing.faqs} dict={dict} />

        {others.length > 0 && (
          <Section id="otros" title={dict.sections.otherPlaces}>
            <ul className="flex flex-wrap gap-x-6">
              {others.map((l) => (
                <li key={l.municipio!.id}>
                  <a
                    href={site.url.negociosListing(l)}
                    className="group inline-flex min-h-11 items-center gap-2 font-medium text-primary"
                  >
                    {negociosListingTitle(l, site)}
                    <TrailArrow />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <AuthorByline autor={landing.autor} updatedAt={landing.updatedAt} site={site} dict={dict} />
      </div>
    </PageLayout>
  )
}
