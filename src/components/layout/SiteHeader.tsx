import { Menu } from 'lucide-react'

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

// Solo enlaza a listados que existen (CLAUDE.md §7.4). Fija arriba con fondo
// translúcido; en móvil el menú se despliega con <details>, sin JS.
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

  const link = 'flex min-h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium transition-colors hover:bg-primary-soft hover:text-primary'

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <div className="relative container-page flex min-h-16 items-center justify-between gap-x-4">
        <a href={homePath(locale)} aria-label={`${dict.site.name} · ${dict.a11y.home}`} className="inline-flex min-h-11 items-center rounded-md">
          <Wordmark />
        </a>
        <div className="flex items-center gap-1">
          {links.length > 0 && (
            <nav aria-label={dict.nav.label} className="hidden md:block">
              <ul className="flex items-center gap-0.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className={link}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <LanguageSwitcher locale={locale} paths={alternatePaths} dict={dict} />
          {links.length > 0 && (
            <details className="group md:hidden">
              <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full ring-1 ring-border hover:bg-primary-soft [&::-webkit-details-marker]:hidden">
                <Menu aria-hidden="true" size={20} />
                <span className="sr-only">{dict.nav.menu}</span>
              </summary>
              <nav
                aria-label={dict.nav.label}
                className="absolute inset-x-4 top-full mt-2 rounded-lg bg-surface p-2 shadow-overlay ring-1 ring-border"
              >
                <ul className="flex flex-col">
                  {links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className={`${link} rounded-md`}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          )}
        </div>
      </div>
    </header>
  )
}
