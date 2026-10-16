import type { ReactNode } from 'react'

import { CategoryIcon, categoryIcon } from '@/components/cards/Card'
import type { Dictionary } from '@/lib/i18n'
import type { ColorToken } from '@/lib/taxonomies'
import { categoryMedia, categoryPlate, contourOffset } from '@/lib/ui/categoryColors'

import { Breadcrumbs, type Crumb } from './Breadcrumbs'

export type PageHeroProps = {
  title: string
  eyebrow?: ReactNode
  summary?: ReactNode
  color?: ColorToken
  icon?: string | null
  children?: ReactNode
}

// Cabecera de página a todo el ancho (DESIGN.md §5): tinte de la categoría con
// curvas de nivel, migas, eyebrow, H1 y resumen answer-first.
export function PageHero({
  title,
  eyebrow,
  summary,
  color = 'rutas',
  icon,
  children,
  breadcrumbs,
  dict,
}: PageHeroProps & { breadcrumbs?: Crumb[]; dict: Dictionary }) {
  const hasIcon = Boolean(categoryIcon(icon))
  return (
    <div className={`relative overflow-hidden ${categoryMedia[color]}`}>
      <div
        aria-hidden="true"
        className="contours absolute inset-0 opacity-20 [mask-size:1100px_auto]"
        style={{ maskPosition: contourOffset(title) }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-bg/70" />
      <div className="relative container-page space-y-5 pt-6 pb-10 md:pt-8 md:pb-14">
        {breadcrumbs && breadcrumbs.length > 1 && <Breadcrumbs items={breadcrumbs} dict={dict} />}
        <header className="max-w-3xl space-y-4">
          {(eyebrow || hasIcon) && (
            <div className="flex items-center gap-3">
              {hasIcon && (
                <span aria-hidden="true" className={`grid size-10 place-items-center rounded-md shadow-card ${categoryPlate[color]}`}>
                  <CategoryIcon icon={icon} size={22} strokeWidth={1.75} />
                </span>
              )}
              {eyebrow && <p className="eyebrow text-text">{eyebrow}</p>}
            </div>
          )}
          <h1 className="text-4xl text-ink">{title}</h1>
          {summary && <div className="max-w-prose text-lg text-text">{summary}</div>}
          {children}
        </header>
      </div>
    </div>
  )
}
