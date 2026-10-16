export type Point = { lat: number; lng: number }

// Distancia en km por haversine
export function distanceKm(a: Point, b: Point): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

export function nearest<T>(origin: Point, items: T[], pointOf: (item: T) => Point | null, limit: number): T[] {
  return items
    .map((item) => ({ item, point: pointOf(item) }))
    .filter((x): x is { item: T; point: Point } => x.point !== null)
    .map((x) => ({ item: x.item, d: distanceKm(origin, x.point) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.item)
}
