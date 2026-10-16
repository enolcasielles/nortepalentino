import type { ReactNode } from 'react'

import { TrailArrow } from './TrailArrow'

// Sección con H2 y enlace opcional "Ver todos →" a su listado
export function Section({
  id,
  title,
  more,
  children,
}: {
  id: string
  title: string
  more?: { href: string; label: string } | null
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h2 id={id} className="text-3xl text-ink">
          {title}
        </h2>
        {more && (
          <a
            href={more.href}
            className="group inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold text-primary ring-1 ring-border transition-colors hover:bg-primary-soft hover:ring-primary/30"
          >
            {more.label}
            <TrailArrow />
          </a>
        )}
      </div>
      {children}
    </section>
  )
}
