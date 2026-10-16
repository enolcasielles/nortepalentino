import { X } from 'lucide-react'

import { fill, type Dictionary } from '@/lib/i18n'
import { difficulties, type Difficulty } from '@/lib/taxonomies'

export type RouteFilters = { dificultad?: Difficulty; ninos?: boolean; carrito?: boolean }

export function parseRouteFilters(params: Record<string, string | string[] | undefined> = {}): RouteFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const dificultad = one(params.dificultad)
  return {
    dificultad: difficulties.includes(dificultad as Difficulty) ? (dificultad as Difficulty) : undefined,
    ninos: one(params.ninos) === '1' || undefined,
    carrito: one(params.carrito) === '1' || undefined,
  }
}

export function hasRouteFilters(f: RouteFilters): boolean {
  return Boolean(f.dificultad || f.ninos || f.carrito)
}

function hrefWithout(path: string, filters: RouteFilters, key: keyof RouteFilters): string {
  const params = new URLSearchParams()
  if (filters.dificultad && key !== 'dificultad') params.set('dificultad', filters.dificultad)
  if (filters.ninos && key !== 'ninos') params.set('ninos', '1')
  if (filters.carrito && key !== 'carrito') params.set('carrito', '1')
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

// <form method="get">: funciona sin JS (DESIGN.md §5). Los filtros activos se
// muestran como chips que son enlaces sin ese filtro.
export function RouteFilterBar({
  path,
  filters,
  dict,
  hideNinos,
}: {
  path: string
  filters: RouteFilters
  dict: Dictionary
  hideNinos?: boolean
}) {
  const active = [
    filters.dificultad && { key: 'dificultad' as const, label: dict.difficulty[filters.dificultad] },
    filters.ninos && { key: 'ninos' as const, label: dict.facts.aptaNinos },
    filters.carrito && { key: 'carrito' as const, label: dict.facts.aptaCarrito },
  ].filter((a): a is { key: keyof RouteFilters; label: string } => Boolean(a))

  const field = 'flex min-h-11 items-center gap-2'
  return (
    <div className="space-y-3">
      <details open={active.length > 0} className="rounded-md border border-border bg-surface">
        <summary className="flex min-h-11 cursor-pointer items-center px-4 font-medium">{dict.listing.filter}</summary>
        <form method="get" action={path} className="flex flex-wrap items-end gap-4 border-t border-border p-4">
          <label className="flex flex-col gap-1 text-sm">
            {dict.listing.dificultad}
            <select
              name="dificultad"
              defaultValue={filters.dificultad ?? ''}
              className="min-h-11 rounded-sm border border-border-strong bg-surface px-3"
            >
              <option value="">{dict.listing.any}</option>
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {dict.difficulty[d]}
                </option>
              ))}
            </select>
          </label>
          {!hideNinos && (
            <label className={field}>
              <input type="checkbox" name="ninos" value="1" defaultChecked={filters.ninos} className="size-5 accent-primary" />
              {dict.facts.aptaNinos}
            </label>
          )}
          <label className={field}>
            <input type="checkbox" name="carrito" value="1" defaultChecked={filters.carrito} className="size-5 accent-primary" />
            {dict.facts.aptaCarrito}
          </label>
          <button type="submit" className="min-h-11 rounded-md bg-primary px-5 font-semibold text-primary-contrast hover:bg-primary-hover">
            {dict.listing.apply}
          </button>
        </form>
      </details>
      {active.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {active.map((a) => (
            <li key={a.key}>
              <a
                href={hrefWithout(path, filters, a.key)}
                aria-label={fill(dict.listing.removeFilter, { label: a.label })}
                className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary-soft px-3 text-sm text-primary"
              >
                {a.label}
                <X aria-hidden="true" size={16} />
              </a>
            </li>
          ))}
          <li>
            <a href={path} className="inline-flex min-h-11 items-center px-2 text-sm underline underline-offset-2">
              {dict.listing.clear}
            </a>
          </li>
        </ul>
      )}
    </div>
  )
}
