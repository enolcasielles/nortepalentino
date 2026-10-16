import Image from 'next/image'

import { ContactActions } from '@/components/actions/ContactActions'
import { FamilyAttributes } from '@/components/content/FamilyAttributes'
import { KeyFacts, type KeyRow } from '@/components/content/KeyFacts'
import { NearbyList } from '@/components/content/NearbyList'
import { Prose } from '@/components/content/Prose'
import { VerifiedNote } from '@/components/content/VerifiedNote'
import type { Crumb } from '@/components/layout/Breadcrumbs'
import { PageLayout } from '@/components/layout/PageLayout'
import { MapBlock } from '@/components/map/MapBlock'
import { imageOf, type ImageData } from '@/lib/data/media'
import { fill, getDictionary } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { breadcrumbJsonLd, negocioJsonLd } from '@/lib/seo/jsonld'
import { asColorToken } from '@/lib/ui/categoryColors'

import { firstParagraph, homeCrumb, type PageMeta, type TemplateProps } from './shared'

export function negocioMeta({ match, site }: Pick<TemplateProps<'negocio'>, 'match' | 'site'>): PageMeta {
  const dict = getDictionary(site.locale)
  const n = match.negocio
  const categoria = site.categoriaById.get(relId(n.categoria) ?? -1)
  const municipio = site.municipioById.get(relId(n.municipio) ?? -1)
  return {
    title: fill(dict.titles.negocio, { name: n.nombre, category: categoria?.nombre ?? '', place: municipio?.nombre ?? '' }),
    description: firstParagraph(n.descripcion),
  }
}

// DESIGN.md §6 · Ficha de negocio
export async function NegocioTemplate({ match, site, path, alternates }: TemplateProps<'negocio'>) {
  const { locale } = site
  const dict = getDictionary(locale)
  const n = match.negocio
  const categoria = site.categoriaById.get(relId(n.categoria) ?? -1)!
  const municipio = site.municipioById.get(relId(n.municipio) ?? -1)!
  const nucleo = site.nucleoById.get(relId(n.nucleo) ?? -1)
  const listing = site.negociosListing(municipio.id, categoria.id)

  const crumbs: Crumb[] = [
    homeCrumb(locale),
    { name: municipio.nombre, path: site.url.municipio(municipio) },
    { name: categoria.nombre_plural, path: listing ? site.url.negociosListing(listing) : null },
    { name: n.nombre, path },
  ]

  const rows: KeyRow[] = []
  if (n.direccion) rows.push({ label: dict.facts.direccion, value: n.direccion })
  if (n.telefono) rows.push({ label: dict.facts.telefono, value: <a href={`tel:${n.telefono.replace(/\s+/g, '')}`} className="underline underline-offset-2">{n.telefono}</a> })
  if (n.horario_texto) rows.push({ label: dict.facts.horario, value: <span className="whitespace-pre-line">{n.horario_texto}</span> })
  if (n.precio_rango) rows.push({ label: dict.facts.precio, value: n.precio_rango })
  if (n.web) {
    rows.push({
      label: dict.facts.web,
      value: <a href={n.web} rel="noopener" data-event="outbound_web" className="underline underline-offset-2">{new URL(n.web).hostname.replace(/^www\./, '')}</a>,
    })
  }

  const photos = (n.fotos ?? []).map((f) => imageOf(site, f)).filter((p): p is ImageData => p !== null)
  const eyebrow = [categoria.nombre, [nucleo?.nombre, nucleo?.nombre !== municipio.nombre ? municipio.nombre : null].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ')

  return (
    <PageLayout locale={locale} alternatePaths={alternates} breadcrumbs={crumbs} jsonLd={[negocioJsonLd(n, path, site), breadcrumbJsonLd(crumbs)]}>
      <div className="space-y-12 pb-20 lg:pb-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <header className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.06em] text-text-muted uppercase">{eyebrow}</p>
              <h1 className="text-4xl">{n.nombre}</h1>
            </header>
            <div className="text-lg">
              <Prose text={n.descripcion} />
            </div>
            <FamilyAttributes values={n.atributos_familia} dict={dict} />
          </div>
          <aside className="space-y-4 lg:row-span-2">
            <KeyFacts title={dict.facts.title} rows={rows} color={asColorToken(categoria.color_token)} />
            <ContactActions telefono={n.telefono} web={n.web} lat={n.coordenadas.lat} lng={n.coordenadas.lng} dict={dict} />
          </aside>
          <div className="space-y-6">
            <MapBlock match={match} site={site} path={path} name={n.nombre} dict={dict} />
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
            <VerifiedNote date={n.fecha_verificacion} sourceUrl={n.fuente_url} locale={locale} dict={dict} />
          </div>
        </div>
        <NearbyList
          origin={n.coordenadas}
          site={site}
          dict={dict}
          exclude={{ collection: 'negocios', id: n.id }}
          groups={categoria.color_token === 'dormir' ? ['comer', 'rutas', 'queVer'] : ['dormir', 'rutas', 'queVer']}
        />
      </div>
    </PageLayout>
  )
}
