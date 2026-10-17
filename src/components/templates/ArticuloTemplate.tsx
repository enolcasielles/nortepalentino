import Image from 'next/image'
import type { ReactNode } from 'react'

import { ArticleCard, BusinessCard, RouteCard, SightCard } from '@/components/cards'
import { CardGrid } from '@/components/cards/Card'
import { AnswerSummary } from '@/components/content/AnswerSummary'
import { AuthorByline } from '@/components/content/AuthorByline'
import { FaqList } from '@/components/content/FaqList'
import { RichText } from '@/components/content/RichText'
import { Section } from '@/components/content/Section'
import { PageLayout } from '@/components/layout/PageLayout'
import { imageOf } from '@/lib/data/media'
import type { ResolvedDoc, Site } from '@/lib/data/site'
import { fill, getDictionary } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import {
  bodyRefs,
  firstParagraphText,
  headingsOf,
  readingMinutes,
  type LexicalValue,
} from '@/lib/richtext/lexical'
import { articuloJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld'
import type { Articulo } from '@/payload-types'

import { homeCrumb, type PageMeta, type TemplateProps } from './shared'

// Índice solo con más de 3 H2 (DESIGN.md §6)
const MIN_H2_FOR_TOC = 4
const MORE_ARTICLES = 3

export function articuloMeta({ match, site }: Pick<TemplateProps<'articulo'>, 'match' | 'site'>): PageMeta {
  const a = match.articulo
  const autor = site.autorById.get(relId(a.autor) ?? -1)
  return {
    title: a.seo_titulo || a.titulo,
    exactTitle: Boolean(a.seo_titulo),
    description: a.seo_descripcion || a.resumen || firstParagraphText(a.cuerpo as LexicalValue),
    article: { publishedTime: a.fecha_publicacion, modifiedTime: a.updatedAt, author: autor?.nombre },
  }
}

const docName = (d: ResolvedDoc) => (d.relationTo === 'articulos' ? d.value.titulo : d.value.nombre)

// Artículos relacionados: primero los que comparten más fichas enlazadas,
// luego los más recientes
function relatedArticles(a: Articulo, site: Site): Articulo[] {
  const mine = new Set((a.enlaces ?? []).map((e) => `${e.relationTo}:${relId(e.value)}`))
  return site.articulos
    .filter((other) => other.id !== a.id)
    .map((other, recency) => ({
      other,
      recency,
      shared: (other.enlaces ?? []).filter((e) => mine.has(`${e.relationTo}:${relId(e.value)}`)).length,
    }))
    .sort((x, y) => y.shared - x.shared || x.recency - y.recency)
    .slice(0, MORE_ARTICLES)
    .map((x) => x.other)
}

// DESIGN.md §6 · Artículo
export function ArticuloTemplate({ match, site, path, alternates }: TemplateProps<'articulo'>) {
  const { locale } = site
  const dict = getDictionary(locale)
  const a = match.articulo
  const cuerpo = a.cuerpo as LexicalValue
  const listing = site.articulosListing()

  const crumbs = [
    homeCrumb(locale),
    { name: dict.nav.blog, path: listing ? site.url.articulosListing() : null },
    { name: a.titulo, path },
  ]

  // Todo lo que el cuerpo enlaza y existe en este idioma
  const refs = bodyRefs(cuerpo)
  const linked = refs
    .map((r) => site.docOf(r))
    .filter((d): d is ResolvedDoc => d !== null)
  const mentionsLd = linked
    .map((d) => ({ name: docName(d), path: site.url.ref({ relationTo: d.relationTo, id: d.value.id }) }))
    .filter((m): m is { name: string; path: string } => Boolean(m.path))
    .filter((m, i, all) => all.findIndex((x) => x.path === m.path) === i)

  // Fichas enlazadas en el texto que no están ya incrustadas como tarjeta
  const embedded = new Set(refs.filter((r) => r.kind === 'block').map((r) => `${r.relationTo}:${r.id}`))
  const seen = new Set<string>()
  const fichaCards: ReactNode[] = []
  for (const d of linked) {
    const key = `${d.relationTo}:${d.value.id}`
    if (embedded.has(key) || seen.has(key)) continue
    seen.add(key)
    if (d.relationTo === 'negocios') fichaCards.push(<BusinessCard key={key} negocio={d.value} site={site} dict={dict} />)
    if (d.relationTo === 'rutas') fichaCards.push(<RouteCard key={key} ruta={d.value} site={site} dict={dict} />)
    if (d.relationTo === 'recursos') fichaCards.push(<SightCard key={key} recurso={d.value} site={site} dict={dict} />)
  }

  const headings = headingsOf(cuerpo)
  const toc = headings.filter((h) => h.level === 2).length >= MIN_H2_FOR_TOC ? headings : []
  const cover = imageOf(site, a.foto_portada)
  const related = relatedArticles(a, site)
  const faqLd = faqJsonLd(a.faqs)

  return (
    <PageLayout
      locale={locale}
      alternatePaths={alternates}
      breadcrumbs={crumbs}
      jsonLd={[articuloJsonLd(a, path, site, mentionsLd), breadcrumbJsonLd(crumbs), ...(faqLd ? [faqLd] : [])]}
      hero={{
        title: a.titulo,
        eyebrow: dict.nav.blog,
        icon: 'articulo',
        summary: <AnswerSummary text={a.resumen} />,
        children: (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <AuthorByline autor={a.autor} updatedAt={a.updatedAt} site={site} dict={dict} />
            <p className="text-sm text-text-muted">{fill(dict.content.readingTime, { n: readingMinutes(cuerpo) })}</p>
          </div>
        ),
      }}
    >
      <div className="space-y-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_16rem] lg:items-start">
          {toc.length > 0 && (
            <nav
              aria-labelledby="toc-title"
              className="rounded-lg bg-surface-alt p-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1"
            >
              <h2 id="toc-title" className="eyebrow mb-3 text-text-muted">
                {dict.content.toc}
              </h2>
              <ol className="space-y-1 text-[0.9375rem]">
                {toc.map((h) => (
                  <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
                    <a href={`#${h.id}`} className="inline-flex min-h-9 items-center hover:text-primary hover:underline">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <article className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-1">
            {cover && (
              <figure>
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  width={cover.width}
                  height={cover.height}
                  priority
                  sizes="(min-width: 1024px) 720px, 100vw"
                  className="aspect-[16/9] w-full max-w-prose rounded-lg object-cover"
                />
                {cover.credit && (
                  <figcaption className="mt-1 text-xs text-text-muted">{fill(dict.content.photoCredit, { credit: cover.credit })}</figcaption>
                )}
              </figure>
            )}
            <RichText value={cuerpo} site={site} dict={dict} />
          </article>
        </div>

        {fichaCards.length > 0 && (
          <Section id="sitios" title={dict.content.mentioned}>
            <CardGrid>
              {fichaCards.map((card, i) => (
                <li key={i}>{card}</li>
              ))}
            </CardGrid>
          </Section>
        )}

        <FaqList faqs={a.faqs} dict={dict} />

        {related.length > 0 && (
          <Section
            id="mas-articulos"
            title={dict.content.moreArticles}
            more={listing ? { href: site.url.articulosListing(), label: dict.sections.seeAll } : null}
          >
            <CardGrid>
              {related.map((r) => (
                <li key={r.id}>
                  <ArticleCard articulo={r} site={site} dict={dict} />
                </li>
              ))}
            </CardGrid>
          </Section>
        )}
      </div>
    </PageLayout>
  )
}
