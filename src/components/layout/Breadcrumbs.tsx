import type { Dictionary } from '@/lib/i18n'

export type Crumb = { name: string; path?: string | null }

// Migas visibles; los mismos datos alimentan el JSON-LD BreadcrumbList
export function Breadcrumbs({ items, dict }: { items: Crumb[]; dict: Dictionary }) {
  return (
    <nav aria-label={dict.breadcrumbs.label} className="text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-2">
              {c.path && !last ? (
                <a href={c.path} className="underline-offset-2 hover:text-text hover:underline">
                  {c.name}
                </a>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'text-text' : undefined}>
                  {c.name}
                </span>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
