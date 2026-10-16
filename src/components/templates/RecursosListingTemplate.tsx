import { SightCard } from '@/components/cards'
import { CardGrid } from '@/components/cards/Card'
import { AuthorByline } from '@/components/content/AuthorByline'
import { FaqList } from '@/components/content/FaqList'
import { Prose } from '@/components/content/Prose'
import { PageLayout } from '@/components/layout/PageLayout'
import { MapBlock } from '@/components/map/MapBlock'
import { getDictionary, plural } from '@/lib/i18n'
import { breadcrumbJsonLd, collectionJsonLd, faqJsonLd } from '@/lib/seo/jsonld'

import { firstParagraph, homeCrumb, type PageMeta, type TemplateProps } from './shared'

export function recursosListingMeta({ match, site }: Pick<TemplateProps<'recursosListing'>, 'match' | 'site'>): PageMeta {
  const dict = getDictionary(site.locale)
  return {
    title: match.listing.landing.titulo || dict.titles.recursos,
    description: firstParagraph(match.listing.landing.intro),
  }
}

export async function RecursosListingTemplate({ match, site, path, alternates }: TemplateProps<'recursosListing'>) {
  const { locale } = site
  const dict = getDictionary(locale)
  const { landing, items } = match.listing
  const pageTitle = landing.titulo || dict.titles.recursos
  const crumbs = [homeCrumb(locale), { name: dict.nav.queVer, path }]
  const faqLd = faqJsonLd(landing.faqs)
  const itemsLd = items.map((r) => ({ name: r.nombre, path: site.url.recurso(r) }))

  return (
    <PageLayout
      locale={locale}
      alternatePaths={alternates}
      breadcrumbs={crumbs}
      jsonLd={[collectionJsonLd(pageTitle, landing.intro, path, itemsLd), breadcrumbJsonLd(crumbs), ...(faqLd ? [faqLd] : [])]}
    >
      <div className="space-y-10">
        <header className="space-y-4">
          <h1 className="text-4xl">{pageTitle}</h1>
          <Prose text={landing.intro} />
          <p className="text-sm text-text-muted">{plural(dict.listing.count, items.length, locale)}</p>
        </header>
        <CardGrid>
          {items.map((r) => (
            <li key={r.id}>
              <SightCard recurso={r} site={site} dict={dict} headingLevel="h2" />
            </li>
          ))}
        </CardGrid>
        <MapBlock match={match} site={site} path={path} name={pageTitle} dict={dict} />
        <FaqList faqs={landing.faqs} dict={dict} />
        <AuthorByline autor={landing.autor} updatedAt={landing.updatedAt} site={site} dict={dict} />
      </div>
    </PageLayout>
  )
}
