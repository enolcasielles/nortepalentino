import { ExternalLink, MapPinned, Phone } from 'lucide-react'

import type { Dictionary } from '@/lib/i18n'

type Props = {
  telefono?: string | null
  web?: string | null
  lat: number
  lng: number
  dict: Dictionary
}

export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// Botones grandes, fijos abajo en móvil (DESIGN.md §5). `data-event` prepara la
// medición de clics salientes cuando exista la isla AnalyticsEvents.
export function ContactActions({ telefono, web, lat, lng, dict }: Props) {
  const button =
    'inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 text-sm font-semibold transition-colors'
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 p-3 shadow-overlay backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
      <div className="flex gap-2 lg:flex-col">
        {telefono && (
          <a
            href={`tel:${telefono.replace(/\s+/g, '')}`}
            data-event="outbound_call"
            className={`${button} bg-primary text-primary-contrast shadow-card hover:bg-primary-hover`}
          >
            <Phone aria-hidden="true" size={18} />
            {dict.actions.call}
          </a>
        )}
        <a
          href={directionsUrl(lat, lng)}
          rel="noopener"
          data-event="outbound_directions"
          className={`${button} bg-surface text-primary ring-1 ring-primary/40 hover:bg-primary-soft`}
        >
          <MapPinned aria-hidden="true" size={18} />
          {dict.actions.directions}
        </a>
        {web && (
          <a
            href={web}
            rel="noopener"
            data-event="outbound_web"
            className={`${button} bg-surface text-primary ring-1 ring-primary/40 hover:bg-primary-soft`}
          >
            <ExternalLink aria-hidden="true" size={18} />
            <span className="sr-only lg:not-sr-only">{dict.actions.website}</span>
            <span aria-hidden="true" className="lg:hidden">
              {dict.facts.web}
            </span>
          </a>
        )}
      </div>
    </div>
  )
}
