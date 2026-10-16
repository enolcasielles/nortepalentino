import { Languages } from 'lucide-react'

import { locales, type Dictionary, type Locale } from '@/lib/i18n'

type Props = {
  locale: Locale
  // URL equivalente de la página actual en cada idioma en que existe
  paths: Partial<Record<Locale, string>>
  dict: Dictionary
}

// Enlaza a la URL equivalente localizada; se oculta si no existe (DESIGN.md §5).
// En móvil solo se ve el código del idioma; el nombre accesible es el texto completo.
export function LanguageSwitcher({ locale, paths, dict }: Props) {
  const target = locales.find((l) => l !== locale && paths[l])
  if (!target) return null

  return (
    <a
      href={paths[target]}
      hrefLang={target}
      lang={target}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 md:px-3 text-sm font-semibold text-primary ring-1 ring-border transition-colors hover:bg-primary-soft hover:ring-primary/30"
    >
      <Languages aria-hidden="true" size={16} className="hidden md:block" />
      <span className="sr-only md:not-sr-only">{dict.language.switchTo}</span>
      <span aria-hidden="true" className="uppercase md:hidden">
        {target}
      </span>
    </a>
  )
}
