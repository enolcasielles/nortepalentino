export type LatLng = [lat: number, lng: number]

// Codificación "Encoded Polyline" de Google (precisión 1e5), la que acepta Static Maps
export function encodePolyline(points: LatLng[]): string {
  let prevLat = 0
  let prevLng = 0
  let out = ''
  for (const [lat, lng] of points) {
    const iLat = Math.round(lat * 1e5)
    const iLng = Math.round(lng * 1e5)
    out += encodeValue(iLat - prevLat) + encodeValue(iLng - prevLng)
    prevLat = iLat
    prevLng = iLng
  }
  return out
}

function encodeValue(value: number): string {
  let v = value < 0 ? ~(value << 1) : value << 1
  let out = ''
  while (v >= 0x20) {
    out += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
    v >>= 5
  }
  return out + String.fromCharCode(v + 63)
}

// Simplificación Ramer–Douglas–Peucker en grados (suficiente a escala de ruta)
export function simplify(points: LatLng[], tolerance: number): LatLng[] {
  if (points.length <= 2) return points
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const stack: [number, number][] = [[0, points.length - 1]]
  while (stack.length) {
    const [start, end] = stack.pop()!
    let maxDist = 0
    let index = -1
    for (let i = start + 1; i < end; i++) {
      const d = perpendicularDistance(points[i], points[start], points[end])
      if (d > maxDist) {
        maxDist = d
        index = i
      }
    }
    if (index !== -1 && maxDist > tolerance) {
      keep[index] = 1
      stack.push([start, index], [index, end])
    }
  }
  return points.filter((_, i) => keep[i])
}

function perpendicularDistance(p: LatLng, a: LatLng, b: LatLng): number {
  const [x, y] = p
  const [x1, y1] = a
  const [x2, y2] = b
  const dx = x2 - x1
  const dy = y2 - y1
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1)
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
}
