import { BusinessCard, RouteCard, SightCard } from '@/components/cards'
import { CardGrid } from '@/components/cards/Card'
import { AnswerSummary } from '@/components/content/AnswerSummary'
import { AuthorByline } from '@/components/content/AuthorByline'
import { BlogMentions } from '@/components/content/BlogMentions'
import { FaqList } from '@/components/content/FaqList'
import { KeyFacts, type KeyRow } from '@/components/content/KeyFacts'
import { Section } from '@/components/content/Section'
import { TrailArrow } from '@/components/content/TrailArrow'
import { PageLayout } from '@/components/layout/PageLayout'
import { MapBlock } from '@/components/map/MapBlock'
import { fill, formatNumber, getDictionary } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { breadcrumbJsonLd, faqJsonLd, municipioJsonLd } from '@/lib/seo/jsonld'

import { firstParagraph, homeCrumb, type PageMeta, type TemplateProps } from './shared'

const MAX_CARDS = 6
const BUSINESS_GROUPS = ['dormir', 'comer', 'activo'] as const
const CITIES = ['palencia', 'santander', 'madrid', 'bilbao'] as const
const CITY_NAMES: Record<(typeof CITIES)[number], string> = {
  palencia: 'Palencia',
  santander: 'Santander',
  madrid: 'Madrid',
  bilbao: 'Bilbao',
}

export function municipioMeta({ match, site }: Pick<TemplateProps<'municipio'>, 'match' | 'site'>): PageMeta {
  const dict = getDictionary(site.locale)
  const m = match.municipio
  return { title: fill(dict.titles.municipio, { name: m.nombre }), description: firstParagraph(m.intro) }
}

// DESIGN.md §6 · Municipio
export async function MunicipioTemplate({ match, site, path, alternates }: TemplateProps<'municipio'>) {
  const { locale } = site
  const dict = getDictionary(locale)
  const m = match.municipio
  const crumbs = [homeCrumb(locale), { name: m.nombre, path }]

  const rows: KeyRow[] = []
  if (m.comarca_zona) rows.push({ label: dict.facts.zona, value: m.comarca_zona })
  if (m.altitud_m != null) rows.push({ label: dict.facts.altitud, value: `${formatNumber(m.altitud_m, locale, 0)} m` })
  for (const city of CITIES) {
    const km = m.distancias_km?.[city]
    if (km != null) {
      rows.push({ label: fill(dict.facts.distanciaDesde, { city: CITY_NAMES[city] }), value: `${formatNumber(km, locale, 0)} km` })
    }
  }

  const inMunicipio = <T extends { municipio?: unknown }>(items: T[]) =>
    items.filter((i) => relId(i.municipio) === m.id)
  const negocios = inMunicipio(site.negocios)
  const recursos = inMunicipio(site.recursos).slice(0, MAX_CARDS)
  const rutas = inMunicipio(site.rutas).slice(0, MAX_CARDS)

  const businessSections = BUSINESS_GROUPS.map((group) => {
    const categorias = site.categorias.filter((c) => c.color_token === group)
    const items = negocios.filter((n) => categorias.some((c) => c.id === relId(n.categoria))).slice(0, MAX_CARDS)
    // Enlaces a los listados de este municipio que existen (§7.4)
    const listings = categorias
      .map((c) => site.negociosListing(m.id, c.id))
      .filter((l): l is NonNullable<typeof l> => l !== null)
    return { group, items, listings }
  }).filter((s) => s.items.length > 0)

  const faqLd = faqJsonLd(m.faqs)

  return (
    <PageLayout
      locale={locale}
      alternatePaths={alternates}
      breadcrumbs={crumbs}
      jsonLd={[municipioJsonLd(m, path, site), breadcrumbJsonLd(crumbs), ...(faqLd ? [faqLd] : [])]}
      hero={{
        title: fill(dict.titles.municipio, { name: m.nombre }),
        eyebrow: m.comarca_zona,
        icon: 'cumbre',
        summary: <AnswerSummary text={m.intro} />,
      }}
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
          <KeyFacts title={dict.facts.title} rows={rows} />
        </aside>

        <div className="min-w-0 space-y-14 lg:col-start-1 lg:row-start-1">
          {recursos.length > 0 && (
            <Section
              id="que-ver"
              title={dict.sections.queVer}
              more={site.recursosListing() ? { href: site.url.recursosListing(), label: dict.sections.seeAll } : null}
            >
              <CardGrid>
                {recursos.map((r) => (
                  <li key={r.id}>
                    <SightCard recurso={r} site={site} dict={dict} />
                  </li>
                ))}
              </CardGrid>
            </Section>
          )}

          {businessSections.map((s) => (
            <Section key={s.group} id={s.group} title={dict.sections[s.group]}>
              <CardGrid>
                {s.items.map((n) => (
                  <li key={n.id}>
                    <BusinessCard negocio={n} site={site} dict={dict} />
                  </li>
                ))}
              </CardGrid>
              {s.listings.length > 0 && (
                <ul className="flex flex-wrap gap-x-6">
                  {s.listings.map((l) => (
                    <li key={l.categoria.id}>
                      <a
                        href={site.url.negociosListing(l)}
                        className="group inline-flex min-h-11 items-center gap-2 font-semibold text-primary"
                      >
                        {fill(dict.titles.categoryIn, { category: l.categoria.nombre_plural, place: m.nombre })}
                        <TrailArrow />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          ))}

          {rutas.length > 0 && (
            <Section
              id="rutas"
              title={dict.sections.rutas}
              more={site.rutasListing() ? { href: site.url.rutasListing(null), label: dict.sections.seeAll } : null}
            >
              <CardGrid>
                {rutas.map((r) => (
                  <li key={r.id}>
                    <RouteCard ruta={r} site={site} dict={dict} />
                  </li>
                ))}
              </CardGrid>
            </Section>
          )}

          <MapBlock match={match} site={site} path={path} name={m.nombre} dict={dict} />
          <BlogMentions relationTo="municipios" id={m.id} site={site} dict={dict} />
          <FaqList faqs={m.faqs} dict={dict} />
          <AuthorByline autor={m.autor} updatedAt={m.updatedAt} site={site} dict={dict} />
        </div>
      </div>
    </PageLayout>
  )
}
