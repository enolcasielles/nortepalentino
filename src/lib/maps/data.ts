import { loadGpx } from '@/lib/data/load'
import type { Site } from '@/lib/data/site'
import type { Point } from '@/lib/geo/distance'
import { relId } from '@/lib/payload/relations'
import type { RouteMatch } from '@/lib/routes/match'
import type { ColorToken } from '@/lib/taxonomies'
import type { Negocio, Recurso, Ruta } from '@/payload-types'

// Colores de marcador: espejo de los tokens --color-cat-* (DESIGN.md §3.1).
// Google Maps necesita el hex; no se usan en ningún otro sitio.
const markerHex: Record<ColorToken, string> = {
  dormir: '3E5C76',
  comer: 'A4462F',
  activo: 'C8762B',
  rutas: '2F5D3A',
  romanico: '7A5A44',
  naturaleza: '5B7B3A',
  museo: '5E4B6B',
}
export const ROUTE_LINE_HEX = '2F5D3A'

export type MapMarker = Point & { color: string }
export type MapData = { markers: MapMarker[]; polyline: string | null }

const MAX_MARKERS = 40

function rutaStart(site: Site, r: Ruta): Point | null {
  const c = r.inicio_coordenadas
  if (c?.lat != null && c.lng != null) return { lat: c.lat, lng: c.lng }
  return site.nucleoById.get(relId(r.inicio_nucleo) ?? -1)?.coordenadas ?? null
}

function negocioMarker(site: Site, n: Negocio): MapMarker {
  const token = site.categoriaById.get(relId(n.categoria) ?? -1)?.color_token as ColorToken | undefined
  return { ...n.coordenadas, color: markerHex[token ?? 'rutas'] }
}

function recursoMarker(site: Site, r: Recurso): MapMarker {
  const token = site.tipoById.get(relId(r.tipo) ?? -1)?.color_token as ColorToken | undefined
  return { ...r.coordenadas, color: markerHex[token ?? 'naturaleza'] }
}

function rutaMarker(site: Site, r: Ruta): MapMarker | null {
  const start = rutaStart(site, r)
  return start ? { ...start, color: markerHex.rutas } : null
}

// Marcadores y trazado del mapa de una página
export async function mapDataFor(match: RouteMatch, site: Site): Promise<MapData | null> {
  let markers: (MapMarker | null)[] = []
  let polyline: string | null = null

  switch (match.type) {
    case 'negocio':
      markers = [negocioMarker(site, match.negocio)]
      break
    case 'recurso':
      markers = [recursoMarker(site, match.recurso)]
      break
    case 'ruta': {
      markers = [rutaMarker(site, match.ruta)]
      const gpxId = relId(match.ruta.gpx)
      if (gpxId) polyline = (await loadGpx(gpxId))?.polyline ?? null
      break
    }
    case 'municipio': {
      const id = match.municipio.id
      markers = [
        ...site.negocios.filter((n) => relId(n.municipio) === id).map((n) => negocioMarker(site, n)),
        ...site.recursos.filter((r) => relId(r.municipio) === id).map((r) => recursoMarker(site, r)),
        ...site.rutas.filter((r) => relId(r.municipio) === id).map((r) => rutaMarker(site, r)),
      ]
      if (!markers.length) markers = [{ ...match.municipio.coordenadas, color: markerHex.rutas }]
      break
    }
    case 'negociosListing':
      markers = match.listing.items.map((n) => negocioMarker(site, n))
      break
    case 'rutasListing':
      markers = match.listing.items.map((r) => rutaMarker(site, r))
      break
    case 'recursosListing':
      markers = match.listing.items.map((r) => recursoMarker(site, r))
      break
  }

  const valid = markers.filter((m): m is MapMarker => m !== null).slice(0, MAX_MARKERS)
  return valid.length || polyline ? { markers: valid, polyline } : null
}

// Estilo propio: desaturado, sin puntos de interés de Google (DESIGN.md §4).
// El JSON definitivo está pendiente (DESIGN.md §9).
const STYLE = [
  'feature:poi|visibility:off',
  'feature:transit|visibility:off',
  'saturation:-60',
  'feature:water|element:geometry|color:0xb7c4cc',
  'feature:landscape.natural|element:geometry|color:0xeef1e6',
]

export const STATIC_MAP_SIZE = { width: 640, height: 360 }

export function staticMapUrl(data: MapData, key: string): string {
  const params = new URLSearchParams({
    size: `${STATIC_MAP_SIZE.width}x${STATIC_MAP_SIZE.height}`,
    scale: '2',
    maptype: 'roadmap',
    language: 'es',
    key,
  })
  for (const style of STYLE) params.append('style', style)
  for (const m of data.markers) params.append('markers', `size:mid|color:0x${m.color}|${m.lat},${m.lng}`)
  if (data.polyline) params.append('path', `color:0x${ROUTE_LINE_HEX}ff|weight:4|enc:${data.polyline}`)
  // Un único punto sin trazado: zoom fijo (si no, Google acerca al máximo)
  if (data.markers.length === 1 && !data.polyline) params.set('zoom', '14')
  return `https://maps.googleapis.com/maps/api/staticmap?${params}`
}

export function staticMapsEnabled(): boolean {
  return Boolean(process.env.GOOGLE_MAPS_STATIC_API_KEY)
}
