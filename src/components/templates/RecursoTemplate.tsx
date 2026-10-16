import { AnswerSummary } from '@/components/content/AnswerSummary'
import { KeyFacts, type KeyRow } from '@/components/content/KeyFacts'
import { NearbyList } from '@/components/content/NearbyList'
import { Prose } from '@/components/content/Prose'
import { VerifiedNote } from '@/components/content/VerifiedNote'
import { PageLayout } from '@/components/layout/PageLayout'
import { MapBlock } from '@/components/map/MapBlock'
import { fill, getDictionary } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { breadcrumbJsonLd, recursoJsonLd } from '@/lib/seo/jsonld'
import { asColorToken } from '@/lib/ui/categoryColors'

import { firstParagraph, homeCrumb, type PageMeta, type TemplateProps } from './shared'

export function recursoMeta({ match, site }: Pick<TemplateProps<'recurso'>, 'match' | 'site'>): PageMeta {
  const dict = getDictionary(site.locale)
  const r = match.recurso
  const tipo = site.tipoById.get(relId(r.tipo) ?? -1)
  const municipio = site.municipioById.get(relId(r.municipio) ?? -1)
  return {
    title: fill(dict.titles.recurso, { name: r.nombre, type: tipo?.nombre ?? '', place: municipio?.nombre ?? '' }),
    description: firstParagraph(r.resumen) || firstParagraph(r.descripcion),
  }
}

// DESIGN.md §6 · Recurso (qué ver)
export async function RecursoTemplate({ match, site, path, alternates }: TemplateProps<'recurso'>) {
  const { locale } = site
  const dict = getDictionary(locale)
  const r = match.recurso
  const tipo = site.tipoById.get(relId(r.tipo) ?? -1)
  const nucleo = site.nucleoById.get(relId(r.nucleo) ?? -1)
  const municipio = site.municipioById.get(relId(r.municipio) ?? -1)
  const listing = site.recursosListing()

  const crumbs = [
    homeCrumb(locale),
    { name: dict.nav.queVer, path: listing ? site.url.recursosListing() : null },
    { name: r.nombre, path },
  ]

  const rows: KeyRow[] = []
  if (tipo) rows.push({ label: dict.facts.tipo, value: tipo.nombre })
  if (r.horario_acceso) rows.push({ label: dict.facts.horarioAcceso, value: <span className="whitespace-pre-line">{r.horario_acceso}</span> })
  if (r.precio_entrada) rows.push({ label: dict.facts.entrada, value: r.precio_entrada })
  const place = [nucleo?.nombre, municipio && municipio.nombre !== nucleo?.nombre ? municipio.nombre : null].filter(Boolean).join(', ')
  if (place) {
    rows.push({
      label: dict.facts.ubicacion,
      value: (
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${r.coordenadas.lat},${r.coordenadas.lng}`} rel="noopener" data-event="outbound_directions" className="underline underline-offset-2">
          {place}
        </a>
      ),
    })
  }

  return (
    <PageLayout
      locale={locale}
      alternatePaths={alternates}
      breadcrumbs={crumbs}
      jsonLd={[recursoJsonLd(r, path, site), breadcrumbJsonLd(crumbs)]}
      hero={{
        title: r.nombre,
        eyebrow: [tipo?.nombre, place].filter(Boolean).join(' · '),
        color: asColorToken(tipo?.color_token),
        icon: tipo?.icono,
        summary: <AnswerSummary text={r.resumen} />,
      }}
    >
      <div className="space-y-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
          <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
            <KeyFacts title={dict.facts.title} rows={rows} color={asColorToken(tipo?.color_token)} />
          </aside>
          <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-1">
            <section aria-labelledby="descripcion" className="space-y-4">
              <h2 id="descripcion" className="text-3xl text-ink">
                {dict.content.descripcion}
              </h2>
              <Prose text={r.descripcion} />
            </section>
            <MapBlock match={match} site={site} path={path} name={r.nombre} dict={dict} />
            <VerifiedNote date={r.fecha_verificacion} sourceUrl={r.fuente_url} locale={locale} dict={dict} />
          </div>
        </div>
        <NearbyList origin={r.coordenadas} site={site} dict={dict} exclude={{ collection: 'recursos', id: r.id }} groups={['queVer', 'comer', 'rutas']} />
      </div>
    </PageLayout>
  )
}
