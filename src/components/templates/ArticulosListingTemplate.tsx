import { ArticleCard } from '@/components/cards'
import { CardGrid } from '@/components/cards/Card'
import { AuthorByline } from '@/components/content/AuthorByline'
import { FaqList } from '@/components/content/FaqList'
import { Prose } from '@/components/content/Prose'
import { PageLayout } from '@/components/layout/PageLayout'
import { getDictionary, plural } from '@/lib/i18n'
import { breadcrumbJsonLd, collectionJsonLd, faqJsonLd } from '@/lib/seo/jsonld'

import { firstParagraph, homeCrumb, type PageMeta, type TemplateProps } from './shared'

export function articulosListingMeta({ match, site }: Pick<TemplateProps<'articulosListing'>, 'match' | 'site'>): PageMeta {
  const dict = getDictionary(site.locale)
  return {
    title: match.listing.landing.titulo || dict.titles.blog,
    description: firstParagraph(match.listing.landing.intro),
  }
}

// Índice del blog: del más reciente al más antiguo
export function ArticulosListingTemplate({ match, site, path, alternates }: TemplateProps<'articulosListing'>) {
  const { locale } = site
  const dict = getDictionary(locale)
  const { landing, items } = match.listing
  const pageTitle = landing.titulo || dict.titles.blog
  const crumbs = [homeCrumb(locale), { name: dict.nav.blog, path }]
  const faqLd = faqJsonLd(landing.faqs)
  const itemsLd = items.map((a) => ({ name: a.titulo, path: site.url.articulo(a) }))

  return (
    <PageLayout
      locale={locale}
      alternatePaths={alternates}
      breadcrumbs={crumbs}
      jsonLd={[collectionJsonLd(pageTitle, landing.intro, path, itemsLd), breadcrumbJsonLd(crumbs), ...(faqLd ? [faqLd] : [])]}
      hero={{
        title: pageTitle,
        icon: 'articulo',
        summary: <Prose text={landing.intro} />,
        children: <p className="text-sm font-medium text-text-muted">{plural(dict.listing.countArticulos, items.length, locale)}</p>,
      }}
    >
      <div className="space-y-16">
        <CardGrid>
          {items.map((a) => (
            <li key={a.id}>
              <ArticleCard articulo={a} site={site} dict={dict} headingLevel="h2" />
            </li>
          ))}
        </CardGrid>
        <FaqList faqs={landing.faqs} dict={dict} />
        <AuthorByline autor={landing.autor} updatedAt={landing.updatedAt} site={site} dict={dict} />
      </div>
    </PageLayout>
  )
}
