import { Wordmark } from '@/components/brand/Wordmark'
import { getSite } from '@/lib/data/site'
import type { Dictionary, Locale } from '@/lib/i18n'
import { homePath } from '@/lib/routes'

import { LanguageSwitcher } from './LanguageSwitcher'

type Props = {
  locale: Locale
  dict: Dictionary
  alternatePaths: Partial<Record<Locale, string>>
}

// Solo enlaza a listados que existen (CLAUDE.md §7.4). En móvil el menú se
// despliega con <details>, sin JS.
export async function SiteHeader({ locale, dict, alternatePaths }: Props) {
  const site = await getSite(locale)
  const links = [
    site.rutasListing() && { href: site.url.rutasListing(null), label: dict.nav.rutas },
    site.recursosListing() && { href: site.url.recursosListing(), label: dict.nav.queVer },
    ...site.categorias.map((c) => {
      const listing = site.negociosListing(null, c.id)
      return listing && { href: site.url.negociosListing(listing), label: c.nombre_plural }
    }),
  ].filter((l): l is { href: string; label: string } => Boolean(l))

  const nav = (
    <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
      {links.map((l) => (
        <li key={l.href}>
          <a
            href={l.href}
            className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-primary-soft hover:text-primary"
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <header className="border-b border-border bg-surface">
      <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-x-4">
        <a
          href={homePath(locale)}
          aria-label={`${dict.site.name} · ${dict.a11y.home}`}
          className="inline-flex min-h-11 items-center"
        >
          <Wordmark />
        </a>
        <div className="flex items-center gap-1">
          {links.length > 0 && (
            <nav aria-label={dict.nav.label} className="hidden md:block">
              {nav}
            </nav>
          )}
          <LanguageSwitcher locale={locale} paths={alternatePaths} dict={dict} />
        </div>
        {links.length > 0 && (
          <details className="w-full pb-2 md:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-medium">
              {dict.nav.menu}
            </summary>
            <nav aria-label={dict.nav.label}>{nav}</nav>
          </details>
        )}
      </div>
    </header>
  )
}
