import { Wordmark } from '@/components/brand/Wordmark'
import type { Dictionary, Locale } from '@/lib/i18n'
import { homePath } from '@/lib/routes'

import { LanguageSwitcher } from './LanguageSwitcher'

type Props = {
  locale: Locale
  dict: Dictionary
  alternatePaths: Partial<Record<Locale, string>>
}

// Navegación principal y buscador: se añaden cuando existan sus páginas
export function SiteHeader({ locale, dict, alternatePaths }: Props) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="container-page flex min-h-16 items-center justify-between gap-4">
        <a href={homePath(locale)} aria-label={`${dict.site.name} · ${dict.a11y.home}`}>
          <Wordmark />
        </a>
        <LanguageSwitcher locale={locale} paths={alternatePaths} dict={dict} />
      </div>
    </header>
  )
}
