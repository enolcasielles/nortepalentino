import { Download } from 'lucide-react'
import Image from 'next/image'

import { AnswerSummary } from '@/components/content/AnswerSummary'
import { AuthorByline } from '@/components/content/AuthorByline'
import { DifficultyMark } from '@/components/content/DifficultyMark'
import { ExperienceBlock } from '@/components/content/ExperienceBlock'
import { FaqList } from '@/components/content/FaqList'
import { KeyFacts, type KeyRow, type KeyStat } from '@/components/content/KeyFacts'
import { NearbyList } from '@/components/content/NearbyList'
import { Prose } from '@/components/content/Prose'
import { VerifiedNote } from '@/components/content/VerifiedNote'
import { PageLayout } from '@/components/layout/PageLayout'
import { MapBlock } from '@/components/map/MapBlock'
import { loadGpx } from '@/lib/data/load'
import { imageOf, type ImageData } from '@/lib/data/media'
import type { Site } from '@/lib/data/site'
import type { Point } from '@/lib/geo/distance'
import { fill, formatDuration, formatNumber, getDictionary } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { breadcrumbJsonLd, faqJsonLd, rutaJsonLd } from '@/lib/seo/jsonld'
import type { Ruta } from '@/payload-types'

import { firstParagraph, homeCrumb, type PageMeta, type TemplateProps } from './shared'

export function rutaStart(site: Site, r: Ruta): Point | null {
  const c = r.inicio_coordenadas
  if (c?.lat != null && c.lng != null) return { lat: c.lat, lng: c.lng }
  return site.nucleoById.get(relId(r.inicio_nucleo) ?? -1)?.coordenadas ?? null
}

export function rutaMeta({ match, site }: Pick<TemplateProps<'ruta'>, 'match' | 'site'>): PageMeta {
  const dict = getDictionary(site.locale)
  const r = match.ruta
  const nucleo = site.nucleoById.get(relId(r.inicio_nucleo) ?? -1)
  return {
    title: fill(dict.titles.ruta, { name: r.nombre, place: nucleo?.nombre ?? '' }),
    description: firstParagraph(r.resumen) || firstParagraph(r.descripcion),
  }
}

// DESIGN.md §6 · Ficha de ruta
export async function RutaTemplate({ match, site, path, alternates }: TemplateProps<'ruta'>) {
  const { locale } = site
  const dict = getDictionary(locale)
  const r = match.ruta
  const nucleo = site.nucleoById.get(relId(r.inicio_nucleo) ?? -1)
  const start = rutaStart(site, r)
  const listing = site.rutasListing()
  const gpxId = relId(r.gpx)
  const gpx = gpxId ? await loadGpx(gpxId) : null
  const autor = site.autorById.get(relId(r.autor) ?? -1)

  const crumbs = [
    homeCrumb(locale),
    { name: dict.nav.rutas, path: listing ? site.url.rutasListing(null) : null },
    { name: r.nombre, path },
  ]

  const stats: KeyStat[] = []
  if (r.distancia_km != null) stats.push({ value: formatNumber(r.distancia_km, locale), unit: 'km', label: dict.facts.distancia })
  if (r.desnivel_m != null) stats.push({ value: `+${formatNumber(r.desnivel_m, locale, 0)}`, unit: 'm', label: dict.facts.desnivel })
  if (r.duracion_h != null) stats.push({ value: formatDuration(r.duracion_h), label: dict.facts.duracion })

  const rows: KeyRow[] = []
  if (r.dificultad) rows.push({ label: dict.listing.dificultad, value: <DifficultyMark difficulty={r.dificultad} label={dict.difficulty[r.dificultad]} /> })
  rows.push({ label: dict.facts.circular, value: r.circular ? dict.facts.circular : dict.facts.lineal })
  if (r.apta_ninos) rows.push({ label: dict.facts.aptaNinos, value: '✓' })
  if (r.apta_carrito) rows.push({ label: dict.facts.aptaCarrito, value: '✓' })
  if (r.temporada?.length) rows.push({ label: dict.facts.temporada, value: r.temporada.map((s) => dict.season[s]).join(', ') })
  if (nucleo) {
    rows.push({
      label: dict.facts.inicio,
      value: start ? (
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${start.lat},${start.lng}`} rel="noopener" data-event="outbound_directions" className="underline underline-offset-2">
          {nucleo.nombre}
        </a>
      ) : (
        nucleo.nombre
      ),
    })
  }

  const photos = (r.fotos ?? []).map((f) => imageOf(site, f)).filter((p): p is ImageData => p !== null)
  const faqLd = faqJsonLd(r.faqs)

  return (
    <PageLayout
      locale={locale}
      alternatePaths={alternates}
      breadcrumbs={crumbs}
      jsonLd={[rutaJsonLd(r, path, site, start), breadcrumbJsonLd(crumbs), ...(faqLd ? [faqLd] : [])]}
    >
      <div className="space-y-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            <h1 className="text-4xl">{r.nombre}</h1>
            <AnswerSummary text={r.resumen} />
          </div>
          <aside className="lg:row-span-2">
            <KeyFacts title={dict.facts.title} stats={stats} rows={rows} color="rutas" />
          </aside>
          <div className="space-y-10">
            {r.premio_final && (
              <section aria-labelledby="premio" className="rounded-md bg-primary-soft p-5">
                <h2 id="premio" className="mb-2 text-xl">
                  {dict.content.premioFinal}
                </h2>
                <Prose text={r.premio_final} />
              </section>
            )}
            <div className="space-y-3">
              <MapBlock match={match} site={site} path={path} name={r.nombre} dict={dict} />
              {gpx?.url && (
                <a href={gpx.url} download className="inline-flex min-h-11 items-center gap-2 font-medium text-primary underline-offset-2 hover:underline">
                  <Download aria-hidden="true" size={18} />
                  {dict.content.downloadGpx}
                </a>
              )}
            </div>
            <section aria-labelledby="la-ruta" className="space-y-3">
              <h2 id="la-ruta" className="text-2xl">
                {dict.content.laRuta}
              </h2>
              <Prose text={r.descripcion} />
            </section>
            <ExperienceBlock text={r.experiencia_propia} author={autor?.nombre} dict={dict} />
            {photos.length > 0 && (
              <section aria-label={dict.content.fotos} className="grid gap-4 sm:grid-cols-2">
                {photos.map((p) => (
                  <figure key={p.src}>
                    <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(min-width: 640px) 50vw, 100vw" className="aspect-[4/3] w-full rounded-md object-cover" />
                    {p.credit && <figcaption className="mt-1 text-xs text-text-muted">{fill(dict.content.photoCredit, { credit: p.credit })}</figcaption>}
                  </figure>
                ))}
              </section>
            )}
          </div>
        </div>
        {start && <NearbyList origin={start} site={site} dict={dict} exclude={{ collection: 'rutas', id: r.id }} groups={['comer', 'dormir', 'queVer']} />}
        <FaqList faqs={r.faqs} dict={dict} />
        <div className="space-y-2">
          <AuthorByline autor={r.autor} updatedAt={r.updatedAt} site={site} dict={dict} />
          <VerifiedNote date={r.fecha_verificacion} sourceUrl={r.fuente_url} locale={locale} dict={dict} />
        </div>
      </div>
    </PageLayout>
  )
}
