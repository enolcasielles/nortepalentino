import { BusinessCard, RouteCard, SightCard } from '@/components/cards'
import { CardGrid } from '@/components/cards/Card'
import type { Site } from '@/lib/data/site'
import { nearest, type Point } from '@/lib/geo/distance'
import type { Dictionary } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import type { ColorToken } from '@/lib/taxonomies'

import { Section } from './Section'

const PER_GROUP = 3

// "Dormir cerca", "Comer cerca", "Rutas cerca"… por distancia (CLAUDE.md §7.5)
export function NearbyList({
  origin,
  site,
  dict,
  exclude,
  groups,
}: {
  origin: Point
  site: Site
  dict: Dictionary
  exclude?: { collection: 'negocios' | 'rutas' | 'recursos'; id: number }
  groups: ('dormir' | 'comer' | 'activo' | 'rutas' | 'queVer')[]
}) {
  const skip = (collection: string, id: number) => exclude?.collection === collection && exclude.id === id
  const negociosOf = (token: ColorToken) =>
    site.negocios.filter(
      (n) => !skip('negocios', n.id) && site.categoriaById.get(relId(n.categoria) ?? -1)?.color_token === token,
    )

  const sections = groups.map((group) => {
    if (group === 'rutas') {
      const items = nearest(
        origin,
        site.rutas.filter((r) => !skip('rutas', r.id)),
        (r) => r.inicio_coordenadas?.lat != null && r.inicio_coordenadas.lng != null
          ? { lat: r.inicio_coordenadas.lat, lng: r.inicio_coordenadas.lng }
          : (site.nucleoById.get(relId(r.inicio_nucleo) ?? -1)?.coordenadas ?? null),
        PER_GROUP,
      )
      return { group, cards: items.map((r) => <li key={r.id}><RouteCard ruta={r} site={site} dict={dict} /></li>) }
    }
    if (group === 'queVer') {
      const items = nearest(origin, site.recursos.filter((r) => !skip('recursos', r.id)), (r) => r.coordenadas, PER_GROUP)
      return { group, cards: items.map((r) => <li key={r.id}><SightCard recurso={r} site={site} dict={dict} /></li>) }
    }
    const items = nearest(origin, negociosOf(group), (n) => n.coordenadas, PER_GROUP)
    return { group, cards: items.map((n) => <li key={n.id}><BusinessCard negocio={n} site={site} dict={dict} /></li>) }
  })

  return (
    <>
      {sections
        .filter((s) => s.cards.length > 0)
        .map((s) => (
          <Section key={s.group} id={`cerca-${s.group}`} title={dict.nearby[s.group]}>
            <CardGrid>{s.cards}</CardGrid>
          </Section>
        ))}
    </>
  )
}
