import type { ReactNode } from 'react'

import type { ColorToken } from '@/lib/taxonomies'
import { categoryBorder } from '@/lib/ui/categoryColors'

export type KeyStat = { value: string; unit?: string; label: string }
export type KeyRow = { label: string; value: ReactNode }

type Props = {
  title: string
  stats?: KeyStat[]
  rows?: KeyRow[]
  footer?: ReactNode
  color?: ColorToken
}

// Panel de inicio de ruta (DESIGN.md §3.5): cabecera de 4 px en el color de la
// categoría, cifras grandes tabulares en celdas y filas de definición.
export function KeyFacts({ title, stats = [], rows = [], footer, color }: Props) {
  if (!stats.length && !rows.length) return null
  return (
    <section
      aria-label={title}
      className={`overflow-hidden rounded-lg border-t-4 bg-surface shadow-card ring-1 ring-border ${color ? categoryBorder[color] : 'border-t-primary'}`}
    >
      <p aria-hidden="true" className="eyebrow px-5 pt-4 text-text-muted">
        {title}
      </p>
      {stats.length > 0 && (
        <dl className="grid grid-cols-3 gap-2 px-4 pt-3">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-0 flex-col-reverse rounded-md bg-surface-alt px-2.5 py-3">
              <dt className="text-xs font-medium text-text-muted">{s.label}</dt>
              <dd className="font-display text-xl leading-none font-bold whitespace-nowrap text-ink tabular-nums">
                {s.value}
                {s.unit && <span className="ml-0.5 text-xs font-semibold text-text-muted">{s.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {rows.length > 0 && (
        <dl className="divide-y divide-border px-5 pt-1 pb-2">
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[minmax(6.5rem,auto)_1fr] gap-3 py-3">
              <dt className="text-sm text-text-muted">{r.label}</dt>
              <dd className="min-w-0 font-medium break-words tabular-nums">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {footer && <div className="border-t border-border px-5 py-3">{footer}</div>}
    </section>
  )
}
