import { ChevronDown, Menu } from 'lucide-react'

import { Wordmark } from '@/components/brand/Wordmark'
import { getSite } from '@/lib/data/site'
import type { Dictionary, Locale } from '@/lib/i18n'
import { homePath } from '@/lib/routes'

import { LanguageSwitcher } from './LanguageSwitcher'
import { blogLink, directoryLinks } from './nav'

type Props = {
  locale: Locale
  dict: Dictionary
  alternatePaths: Partial<Record<Locale, string>>
}

// Dos secciones: Directorio (desplegable con sus listados) y Blog. Solo enlaza
// a listados que existen (CLAUDE.md §7.4). Fija arriba con fondo translúcido;
// los desplegables son <details>, sin JS.
export async function SiteHeader({ locale, dict, alternatePaths }: Props) {
  const site = await getSite(locale)
  const directory = directoryLinks(site, dict)
  const blog = blogLink(site, dict)
  const hasNav = directory.length > 0 || blog

  const link = 'flex min-h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium transition-colors hover:bg-primary-soft hover:text-primary'
  const summary = `${link} cursor-pointer list-none gap-1 [&::-webkit-details-marker]:hidden`
  const panel = 'absolute top-full mt-2 rounded-lg bg-surface p-2 shadow-overlay ring-1 ring-border'

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <div className="relative container-page flex min-h-16 items-center justify-between gap-x-4">
        <a href={homePath(locale)} aria-label={`${dict.site.name} · ${dict.a11y.home}`} className="inline-flex min-h-11 items-center rounded-md">
          <Wordmark />
        </a>
        <div className="flex items-center gap-1">
          {hasNav && (
            <nav aria-label={dict.nav.label} className="hidden md:block">
              <ul className="flex items-center gap-0.5">
                {directory.length > 0 && (
                  <li>
                    <details className="group relative">
                      <summary className={summary}>
                        {dict.nav.directorio}
                        <ChevronDown aria-hidden="true" size={16} className="transition-transform group-open:rotate-180" />
                      </summary>
                      <ul className={`${panel} right-0 w-60`}>
                        {directory.map((l) => (
                          <li key={l.href}>
                            <a href={l.href} className={`${link} rounded-md`}>
                              {l.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                )}
                {blog && (
                  <li>
                    <a href={blog.href} className={link}>
                      {blog.label}
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          )}
          <LanguageSwitcher locale={locale} paths={alternatePaths} dict={dict} />
          {hasNav && (
            <details className="group md:hidden">
              <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full ring-1 ring-border hover:bg-primary-soft [&::-webkit-details-marker]:hidden">
                <Menu aria-hidden="true" size={20} />
                <span className="sr-only">{dict.nav.menu}</span>
              </summary>
              <nav aria-label={dict.nav.label} className={`${panel} inset-x-4`}>
                {directory.length > 0 && (
                  <>
                    <p className="eyebrow px-4 pt-2 pb-1 text-text-muted">{dict.nav.directorio}</p>
                    <ul className="flex flex-col">
                      {directory.map((l) => (
                        <li key={l.href}>
                          <a href={l.href} className={`${link} rounded-md`}>
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {blog && (
                  <a href={blog.href} className={`${link} mt-1 rounded-md border-t border-border font-semibold`}>
                    {blog.label}
                  </a>
                )}
              </nav>
            </details>
          )}
        </div>
      </div>
    </header>
  )
}
