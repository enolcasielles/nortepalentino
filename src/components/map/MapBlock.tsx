import type { Site } from '@/lib/data/site'
import { fill, type Dictionary } from '@/lib/i18n'
import { mapDataFor, STATIC_MAP_SIZE, staticMapsEnabled } from '@/lib/maps/data'
import type { RouteMatch } from '@/lib/routes/match'

import { MapFacade } from './MapFacade'

// Mapa de una página. Sin clave de Static Maps no se pinta nada.
export async function MapBlock({
  match,
  site,
  path,
  name,
  dict,
}: {
  match: RouteMatch
  site: Site
  path: string
  name: string
  dict: Dictionary
}) {
  if (!staticMapsEnabled()) return null
  const data = await mapDataFor(match, site)
  if (!data) return null
  return (
    <MapFacade
      staticSrc={`/mapas${path}`}
      alt={fill(dict.content.mapAlt, { name })}
      width={STATIC_MAP_SIZE.width}
      height={STATIC_MAP_SIZE.height}
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || undefined}
      markers={data.markers}
      polyline={data.polyline}
      openLabel={dict.actions.openMap}
    />
  )
}
