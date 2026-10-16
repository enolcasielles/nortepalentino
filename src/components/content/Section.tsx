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
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 id={id} className="text-2xl">
          {title}
        </h2>
        {more && (
          <a href={more.href} className="group inline-flex min-h-11 items-center gap-2 font-medium text-primary">
            {more.label}
            <TrailArrow />
          </a>
        )}
      </div>
      {children}
    </section>
  )
}
