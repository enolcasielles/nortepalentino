import { encodePolyline, simplify, type LatLng } from './polyline'

export type Bbox = { minLat: number; minLng: number; maxLat: number; maxLng: number }

export type ProcessedGpx = {
  polyline: string
  bbox: Bbox
  puntos: number
}

// Máximo de puntos tras simplificar, para que la URL de Static Maps no exceda su límite
const MAX_POINTS = 400

// Extrae los puntos de track (o de ruta si no hay track) y los reduce a una
// polyline codificada y su bbox. No calcula distancias ni desniveles: esos
// datos son siempre verificados, nunca derivados (CLAUDE.md §10).
export function processGpx(xml: string): ProcessedGpx {
  let points = extractPoints(xml, 'trkpt')
  if (points.length === 0) points = extractPoints(xml, 'rtept')
  if (points.length < 2) throw new Error('El GPX no contiene un track con al menos 2 puntos')

  let tolerance = 0.00002 // ≈ 2 m
  let simplified = simplify(points, tolerance)
  while (simplified.length > MAX_POINTS) {
    tolerance *= 2
    simplified = simplify(points, tolerance)
  }

  const lats = points.map((p) => p[0])
  const lngs = points.map((p) => p[1])

  return {
    polyline: encodePolyline(simplified),
    bbox: {
      minLat: Math.min(...lats),
      minLng: Math.min(...lngs),
      maxLat: Math.max(...lats),
      maxLng: Math.max(...lngs),
    },
    puntos: simplified.length,
  }
}

function extractPoints(xml: string, tag: 'trkpt' | 'rtept'): LatLng[] {
  const points: LatLng[] = []
  const re = new RegExp(`<${tag}\\b([^>]*)>`, 'g')
  for (const match of xml.matchAll(re)) {
    const attrs = match[1]
    const lat = Number(/\blat\s*=\s*["']([^"']+)["']/.exec(attrs)?.[1])
    const lng = Number(/\blon\s*=\s*["']([^"']+)["']/.exec(attrs)?.[1])
    if (Number.isFinite(lat) && Number.isFinite(lng)) points.push([lat, lng])
  }
  return points
}
