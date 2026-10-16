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
// categoría, cifras grandes tabulares y filas de definición.
export function KeyFacts({ title, stats = [], rows = [], footer, color }: Props) {
  if (!stats.length && !rows.length) return null
  return (
    <section
      aria-label={title}
      className={`rounded-md border-t-4 bg-surface-alt ${color ? categoryBorder[color] : 'border-t-primary'}`}
    >
      {stats.length > 0 && (
        <dl className="grid grid-cols-3 gap-2 border-b border-border px-4 py-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="text-sm text-text-muted">{s.label}</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums">
                {s.value}
                {s.unit && <span className="ml-1 text-base font-normal text-text-muted">{s.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {rows.length > 0 && (
        <dl className="divide-y divide-border px-4">
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-3 py-3">
              <dt className="text-sm text-text-muted">{r.label}</dt>
              <dd className="min-w-0 break-words tabular-nums">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {footer && <div className="border-t border-border px-4 py-3">{footer}</div>}
    </section>
  )
}
