'use client'

// 🏝 Isla de cliente (DESIGN.md §5): imagen estática y, solo si el usuario lo
// pide, el mapa interactivo de Google en el mismo hueco (CLS 0, CLAUDE.md §9).
import Image from 'next/image'
import { useRef, useState } from 'react'

type Marker = { lat: number; lng: number; color: string }

type Props = {
  staticSrc: string
  alt: string
  width: number
  height: number
  apiKey?: string
  markers: Marker[]
  polyline: string | null
  openLabel: string
}

// Tipos mínimos de la parte de la JS API que se usa
type LatLng = { lat: number; lng: number }
type GoogleMaps = {
  Map: new (el: HTMLElement, opts: object) => { fitBounds: (b: unknown) => void; setCenter: (c: LatLng) => void; setZoom: (z: number) => void }
  LatLngBounds: new () => { extend: (p: LatLng) => void }
  Marker: new (opts: object) => unknown
  Polyline: new (opts: object) => unknown
  SymbolPath: { CIRCLE: number }
  geometry: { encoding: { decodePath: (s: string) => LatLng[] } }
}

declare global {
  interface Window {
    google?: { maps: GoogleMaps }
    __npMapsReady?: () => void
  }
}

let loader: Promise<GoogleMaps> | null = null

function loadMaps(apiKey: string): Promise<GoogleMaps> {
  loader ??= new Promise((resolve, reject) => {
    window.__npMapsReady = () => resolve(window.google!.maps)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=geometry&loading=async&callback=__npMapsReady`
    script.async = true
    script.onerror = () => {
      loader = null
      reject(new Error('Google Maps no se pudo cargar'))
    }
    document.head.appendChild(script)
  })
  return loader
}

export function MapFacade({ staticSrc, alt, width, height, apiKey, markers, polyline, openLabel }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'static' | 'loading' | 'interactive'>('static')

  async function open() {
    if (!apiKey || !container.current) return
    setState('loading')
    try {
      const maps = await loadMaps(apiKey)
      const map = new maps.Map(container.current, { mapTypeControl: false, streetViewControl: false })
      const bounds = new maps.LatLngBounds()
      for (const m of markers) {
        new maps.Marker({
          map,
          position: m,
          icon: { path: maps.SymbolPath.CIRCLE, scale: 8, fillColor: `#${m.color}`, fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 },
        })
        bounds.extend(m)
      }
      if (polyline) {
        const path = maps.geometry.encoding.decodePath(polyline)
        new maps.Polyline({ map, path, strokeColor: '#2F5D3A', strokeWeight: 4 })
        path.forEach((p) => bounds.extend(p))
      }
      if (markers.length === 1 && !polyline) {
        map.setCenter(markers[0])
        map.setZoom(14)
      } else {
        map.fitBounds(bounds)
      }
      setState('interactive')
    } catch {
      setState('static')
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-border" style={{ aspectRatio: `${width} / ${height}` }}>
      <div ref={container} className="absolute inset-0" />
      {state !== 'interactive' && (
        <>
          <Image src={staticSrc} alt={alt} fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover" />
          {apiKey && (
            <button
              type="button"
              onClick={open}
              disabled={state === 'loading'}
              className="absolute right-3 bottom-3 inline-flex min-h-11 items-center rounded-md bg-surface px-4 text-sm font-semibold text-primary shadow-overlay hover:bg-primary-soft disabled:opacity-70"
            >
              {openLabel}
            </button>
          )}
        </>
      )}
    </div>
  )
}
